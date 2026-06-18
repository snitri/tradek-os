// TradeK OS — dispatcher de eventos: notification_rules -> Resend + email_log + notifications in-app.
import { createClient } from "jsr:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}
const PORTAL = "https://tradek.com.br/cliente/login"

const NOTIF_LABEL: Record<string, string> = {
  "lead.status_changed": "Status atualizado", "lead.document_uploaded": "Documento recebido",
  "lead.document_approved": "Documento aprovado", "lead.document_rejected": "Documento reprovado",
  "admin.message_sent": "Nova mensagem", "proposal.sent": "Proposta enviada",
  "client.user_created": "Acesso criado", "lead.ia_qualificado": "Contato qualificado pela IA",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) return json({ error: "forbidden" }, 403)
    const { event, lead_id, extra_vars } = await req.json() as { event: string; lead_id?: string; extra_vars?: Record<string, string> }
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { db: { schema: "tradek" } })

    // contexto do lead
    let lead: Record<string, unknown> | null = null
    if (lead_id) {
      const { data } = await admin.from("leads").select("*, companies(razao_social,nome_fantasia,cnpj), contacts(nome,email), responsavel:profiles(nome)").eq("id", lead_id).maybeSingle()
      lead = data as Record<string, unknown> | null
    }
    const comp = (lead?.companies ?? {}) as Record<string, string>
    const ct = (lead?.contacts ?? {}) as Record<string, string>
    const vars: Record<string, string> = {
      nome_cliente: ct.nome ?? "", empresa: comp.nome_fantasia || comp.razao_social || "", cnpj: comp.cnpj ?? "",
      unidade: String(lead?.unidade ?? ""), status: String(lead?.status ?? ""), score: String(lead?.score_ia ?? ""),
      resumo_ia: String(lead?.resumo_ia ?? ""), proxima_acao: String(lead?.proxima_acao ?? ""),
      responsavel: ((lead?.responsavel ?? {}) as Record<string, string>).nome ?? "", link_portal: PORTAL,
      documentos_pendentes: "", documento: "",
      ...(extra_vars ?? {}),
    }
    const render = (s: string) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "")

    // regras que casam o evento
    const { data: rules } = await admin.from("notification_rules").select("*, email_templates(assunto,corpo_html)").eq("evento", event).eq("ativo", true)
    const sent: string[] = []
    const apiKey = Deno.env.get("RESEND_API_KEY")
    const from = Deno.env.get("RESEND_FROM") ?? "TradeK <noreply@tradek.com.br>"

    for (const r of rules ?? []) {
      const tpl = (r as { email_templates?: { assunto: string; corpo_html: string } }).email_templates
      if (!tpl) continue
      const to = [...((r.emails_para ?? []) as string[])]
      // quando enviar_resumo_ia=true, inclui o e-mail do contato do lead dinamicamente
      if (r.enviar_resumo_ia && ct.email) to.push(ct.email)
      if (!to.length) continue
      let status = "enviado", providerId: string | null = null, erro: string | null = null
      if (apiKey) {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from, to, cc: r.emails_cc ?? undefined, bcc: r.emails_bcc ?? undefined, subject: render(tpl.assunto), html: render(tpl.corpo_html) }),
        })
        const body = await resp.json().catch(() => ({}))
        if (resp.ok) { providerId = body.id ?? null; sent.push(r.nome) } else { status = "erro"; erro = JSON.stringify(body) }
      } else { status = "sem_chave" }
      await admin.from("email_log").insert({ rule_id: r.id, lead_id: lead_id ?? null, template_id: r.template_id, para: to, assunto: render(tpl.assunto), status, provider_id: providerId, erro })
    }

    // notificações in-app para os usuários cliente da empresa do lead
    if (lead?.company_id && NOTIF_LABEL[event]) {
      const { data: clients } = await admin.from("profiles").select("id").eq("company_id", lead.company_id).eq("role", "cliente")
      for (const c of clients ?? []) {
        await admin.from("notifications").insert({ user_id: c.id, tipo: NOTIF_LABEL[event], mensagem: render(`Atualização na sua solicitação: ${NOTIF_LABEL[event]}.`), link: "/cliente" })
      }
    }

    return json({ ok: true, event, emails_enviados: sent.length })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}
