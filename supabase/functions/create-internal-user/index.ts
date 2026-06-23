// TradeK OS — convida um novo usuário interno (equipe TradeK).
//
// Regra de negócio: usuário interno nunca se autocadastra (isso é exclusivo
// do /cliente/cadastro, para leads/clientes). Acesso administrativo só é
// concedido por convite, e só quem tem role 'master' pode convidar.
import { createClient } from "jsr:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const ROLES_INTERNOS = ["master", "gerente", "comercial", "operacional", "financeiro", "atendimento", "leitura"]

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    const authHeader = req.headers.get("Authorization") ?? ""
    const url = Deno.env.get("SUPABASE_URL")!
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!

    // 1) só master pode convidar novos usuários internos
    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } }, db: { schema: "tradek" } })
    const { data: who } = await caller.auth.getUser()
    if (!who.user) return json({ error: "Não autenticado" }, 401)
    const { data: prof } = await caller.from("profiles").select("role").eq("id", who.user.id).maybeSingle()
    if (prof?.role !== "master") return json({ error: "Apenas usuários master podem convidar novos usuários internos" }, 403)

    const body = await req.json()
    const { email, nome, role, cargo } = body
    if (!email) return json({ error: "E-mail obrigatório" }, 400)
    if (!nome) return json({ error: "Nome obrigatório" }, 400)
    if (!ROLES_INTERNOS.includes(role)) return json({ error: "Perfil (role) inválido" }, 400)

    const admin = createClient(url, serviceKey, { db: { schema: "tradek" } })

    // 2) cria usuário interno (trigger cria profile com o role escolhido)
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email, email_confirm: true,
      user_metadata: { role, nome, cargo: cargo ?? null },
    })
    if (cErr || !created.user) return json({ error: cErr?.message ?? "Falha ao criar usuário" }, 400)

    // 3) link de 1º acesso (definir senha) — FirstAccessPage redireciona para /admin pois detecta role interno
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://www.tradek.com.br"
    const { data: link } = await admin.auth.admin.generateLink({
      type: "recovery", email,
      options: { redirectTo: `${siteUrl}/cliente/primeiro-acesso` },
    })
    const actionLink = link?.properties?.action_link ?? null

    // 4) convite por e-mail (Resend)
    const apiKey = Deno.env.get("RESEND_API_KEY")
    const fromAddr = Deno.env.get("RESEND_FROM") ?? "TradeK <noreply@tradek.com.br>"
    let emailStatus = "sem_chave"
    if (apiKey) {
      const subject = "Seu acesso ao painel administrativo TradeK"
      const html = `<p>Olá, ${nome}.</p><p>Você foi convidado(a) para acessar o painel administrativo da TradeK como <b>${role}</b>.</p><p><a href="${actionLink}">Criar senha e acessar o painel</a></p>`
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromAddr, to: [email], subject, html }),
      })
      const b = await resp.json().catch(() => ({}))
      emailStatus = resp.ok ? "enviado" : "erro"
      await admin.from("email_log").insert({ para: [email], assunto: subject, status: emailStatus, provider_id: b.id ?? null, erro: resp.ok ? null : JSON.stringify(b) })
    }

    return json({ user_id: created.user.id, action_link: actionLink, email: emailStatus })
  } catch (e) {
    return json({ error: String(e) }, 400)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}
