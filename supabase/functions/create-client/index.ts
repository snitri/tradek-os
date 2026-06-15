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
    const { email, nome, company_id, lead_id } = body
    if (!email) return json({ error: "E-mail obrigatório" }, 400)

    const admin = createClient(url, serviceKey, { db: { schema: "tradek" } })

    // 2) cria usuário cliente (trigger cria profile com role cliente + company_id)
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email, email_confirm: true,
      user_metadata: { role: "cliente", nome: nome ?? email, company_id: company_id ?? null },
    })
    if (cErr || !created.user) return json({ error: cErr?.message ?? "Falha ao criar usuário" }, 400)

    // 3) vincula no lead
    if (lead_id) await admin.from("leads").update({ cliente_portal_criado: true }).eq("id", lead_id)

    // 4) link de 1º acesso (definir senha)
    const { data: link } = await admin.auth.admin.generateLink({ type: "recovery", email })

    return json({ user_id: created.user.id, action_link: link?.properties?.action_link ?? null })
  } catch (e) {
    return json({ error: String(e) }, 400)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}
