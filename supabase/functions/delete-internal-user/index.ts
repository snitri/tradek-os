// TradeK OS — remove um usuário interno (equipe TradeK).
// Regra: só master pode excluir, e ninguém pode excluir a própria conta
// (evita deslogar/travar o último acesso master por engano).
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

    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } }, db: { schema: "tradek" } })
    const { data: who } = await caller.auth.getUser()
    if (!who.user) return json({ error: "Não autenticado" }, 401)
    const { data: prof } = await caller.from("profiles").select("role").eq("id", who.user.id).maybeSingle()
    if (prof?.role !== "master") return json({ error: "Apenas usuários master podem excluir usuários internos" }, 403)

    const { user_id } = await req.json()
    if (!user_id) return json({ error: "user_id obrigatório" }, 400)
    if (user_id === who.user.id) return json({ error: "Você não pode excluir a própria conta" }, 400)

    const admin = createClient(url, serviceKey, { db: { schema: "tradek" } })
    const { error } = await admin.auth.admin.deleteUser(user_id)
    if (error) return json({ error: error.message }, 400)

    return json({ ok: true })
  } catch (e) {
    return json({ error: String(e) }, 400)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}
