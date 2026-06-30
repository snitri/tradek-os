// TradeK OS — notifica o cliente (e-mail + WhatsApp) sobre documentos solicitados.
import { createClient } from "jsr:@supabase/supabase-js@2"
import { brandEmail } from "../_shared/email-brand.ts"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true }, 200)

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!

    // apenas usuários internos podem disparar
    const authHeader = req.headers.get("Authorization") ?? ""
    const caller = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } }, db: { schema: "tradek" } })
    const { data: who } = await caller.auth.getUser()
    if (!who.user) return json({ error: "Não autenticado" }, 401)

    const admin = createClient(supabaseUrl, serviceKey, { db: { schema: "tradek" } })

    const { lead_id } = await req.json() as { lead_id: string }
    if (!lead_id) return json({ error: "lead_id obrigatório" }, 400)

    // carrega lead + contato + documentos solicitados
    const { data: lead } = await admin
      .from("leads")
      .select("id,company_id,companies(razao_social,nome_fantasia),contacts(nome,email,whatsapp)")
      .eq("id", lead_id)
      .maybeSingle()
    if (!lead) return json({ error: "Lead não encontrado" }, 404)

    type LeadRow = { id: string; company_id: string | null; companies: { razao_social: string | null; nome_fantasia: string | null } | null; contacts: { nome: string; email: string | null; whatsapp: string | null } | null }
    const l = lead as unknown as LeadRow
    const ct = l.contacts
    const empresa = l.companies?.nome_fantasia || l.companies?.razao_social || "—"

    const { data: docReqs } = await admin
      .from("document_requests")
      .select("tipo_documento")
      .eq("lead_id", lead_id)
      .eq("status", "solicitado")

    const documentos = (docReqs ?? []).map((d: { tipo_documento: string }) => d.tipo_documento)
    if (!documentos.length) return json({ ok: true, skipped: "sem documentos solicitados" })

    const listaHtml = documentos.map((d) => `<li style="padding:4px 0;">${d}</li>`).join("")
    const listaWpp = documentos.map((d, i) => `${i + 1}. ${d}`).join("\n")
    const nomeCliente = ct?.nome ?? "cliente"

    const erros: string[] = []

    // ── E-MAIL ──────────────────────────────────────────────────────────────
    if (ct?.email) {
      const resendKey = Deno.env.get("RESEND_API_KEY")
      const fromAddr = Deno.env.get("RESEND_FROM") ?? "TradeK <noreply@tradek.com.br>"
      if (resendKey) {
        const html = brandEmail(`
          <p>Olá, <strong>${nomeCliente}</strong>.</p>
          <p>A equipe TradeK precisa dos seguintes documentos para dar continuidade ao seu processo de importação com a empresa <strong>${empresa}</strong>:</p>
          <ul style="padding-left:20px;margin:16px 0;">${listaHtml}</ul>
          <p>Por favor, acesse o portal do cliente ou responda a esta mensagem para enviar os arquivos.</p>
          <p style="text-align:center;margin:28px 0;">
            <a href="https://www.tradek.com.br/cliente" style="display:inline-block;background:#C3F929;color:#0A0B0A;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;">
              Acessar portal do cliente
            </a>
          </p>
          <p style="font-size:12px;color:#888;">Em caso de dúvidas, entre em contato com nossa equipe.</p>
        `)
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: fromAddr,
            to: [ct.email],
            subject: `TradeK · Documentos necessários — ${empresa}`,
            html,
          }),
        })
        const b = await resp.json().catch(() => ({})) as { id?: string; error?: string }
        await admin.from("email_log").insert({
          lead_id, para: [ct.email],
          assunto: `TradeK · Documentos necessários — ${empresa}`,
          status: resp.ok ? "enviado" : "erro",
          provider_id: b.id ?? null,
          erro: resp.ok ? null : JSON.stringify(b),
        })
        if (!resp.ok) erros.push("email: " + JSON.stringify(b))
      } else {
        erros.push("RESEND_API_KEY não configurada")
      }
    }

    // ── WHATSAPP ─────────────────────────────────────────────────────────────
    if (ct?.whatsapp) {
      const instanceId = Deno.env.get("ZAPI_INSTANCE_ID")
      const zapiToken = Deno.env.get("ZAPI_TOKEN")
      const clientToken = Deno.env.get("ZAPI_CLIENT_TOKEN")
      if (instanceId && zapiToken && clientToken) {
        const phone = normalizePhoneBR(ct.whatsapp)
        const mensagem = `Olá, ${nomeCliente}! 👋\n\nA equipe TradeK precisa dos seguintes documentos para continuar o seu processo:\n\n${listaWpp}\n\nAcesse o portal do cliente em https://www.tradek.com.br/cliente ou responda esta mensagem. Obrigado! 🙏`
        const resp = await fetch(`https://api.z-api.io/instances/${instanceId}/token/${zapiToken}/send-text`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Client-Token": clientToken },
          body: JSON.stringify({ phone, message: mensagem }),
        })
        const bodyText = await resp.text().catch(() => "")
        if (!resp.ok) erros.push("whatsapp: " + bodyText)
        console.log("NOTIFY_DOC_WPP:", resp.status, bodyText)
      } else {
        erros.push("Z-API não configurada")
      }
    }

    if (erros.length) return json({ ok: false, erros }, 207)
    return json({ ok: true, email: !!ct?.email, whatsapp: !!ct?.whatsapp })
  } catch (e) {
    console.error("notify-doc-request ERRO:", String(e))
    return json({ error: String(e) }, 500)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}

function normalizePhoneBR(raw: string): string {
  const d = raw.replace(/\D/g, "")
  if (d.length === 12 || d.length === 13) return d
  if (d.length === 10 || d.length === 11) return `55${d}`
  return d
}
