// TradeK OS — cria acesso de cliente (chamado pelo admin interno)
// Verifica que o chamador é interno; cria auth.users (role cliente + company_id via metadata);
// o trigger handle_new_user cria o profile. Retorna link de definição de senha (1º acesso).
import { createClient } from "jsr:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    const authHeader = req.headers.get("Authorization") ?? ""
    const url = Deno.env.get("SUPABASE_URL")!
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!

    // 1) valida que o chamador é interno
    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } }, db: { schema: "tradek" } })
    const { data: who } = await caller.auth.getUser()
    if (!who.user) return json({ error: "Não autenticado" }, 401)
    const { data: prof } = await caller.from("profiles").select("role").eq("id", who.user.id).maybeSingle()
    if (!prof || prof.role === "cliente") return json({ error: "Apenas usuários internos podem criar acesso" }, 403)

    const body = await req.json()
    const { email, nome, company_id, lead_id, whatsapp } = body
    if (!email) return json({ error: "E-mail obrigatório" }, 400)

    const admin = createClient(url, serviceKey, { db: { schema: "tradek" } })

    // 2) cria usuário cliente (trigger cria profile com role cliente + company_id)
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email, email_confirm: true,
      user_metadata: { role: "cliente", nome: nome ?? email, company_id: company_id ?? null, whatsapp: whatsapp ?? null },
    })
    if (cErr || !created.user) return json({ error: cErr?.message ?? "Falha ao criar usuário" }, 400)

    // 3) cria contato com whatsapp (se informado) e vincula ao profile
    if (nome || whatsapp) {
      await admin.from("contacts").insert({
        company_id: company_id ?? null,
        nome: nome ?? email,
        email,
        whatsapp: whatsapp ?? null,
        principal: true,
      })
    }

    // 4) vincula no lead
    if (lead_id) await admin.from("leads").update({ cliente_portal_criado: true }).eq("id", lead_id)

    // 4) link de 1º acesso (definir senha)
    const { data: link } = await admin.auth.admin.generateLink({ type: "recovery", email })
    const actionLink = link?.properties?.action_link ?? null

    // 5) convite por e-mail (Resend) com o link de 1º acesso
    const apiKey = Deno.env.get("RESEND_API_KEY")
    const fromAddr = Deno.env.get("RESEND_FROM") ?? "TradeK <noreply@tradek.com.br>"
    let emailStatus = "sem_chave"
    if (apiKey) {
      const { data: tpl } = await admin.from("email_templates").select("assunto,corpo_html").eq("chave", "convite_cliente").maybeSingle()
      const vars: Record<string, string> = { nome_cliente: nome ?? email, unidade: "", link_portal: actionLink ?? "https://tradek.com.br/cliente/login" }
      const render = (s: string) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "")
      const subject = tpl ? render(tpl.assunto) : "Seu acesso ao portal TradeK"
      const html = tpl ? render(tpl.corpo_html) : `<p>Olá, ${nome ?? email}.</p><p>Defina sua senha e acesse o portal TradeK:</p><p><a href="${actionLink}">Criar senha e acessar</a></p>`
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromAddr, to: [email], subject, html }),
      })
      const b = await resp.json().catch(() => ({}))
      emailStatus = resp.ok ? "enviado" : "erro"
      await admin.from("email_log").insert({ lead_id: lead_id ?? null, para: [email], assunto: subject, status: emailStatus, provider_id: b.id ?? null, erro: resp.ok ? null : JSON.stringify(b) })
    }

    return json({ user_id: created.user.id, action_link: actionLink, email: emailStatus })
  } catch (e) {
    return json({ error: String(e) }, 400)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}
