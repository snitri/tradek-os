// TradeK OS — consulta Score de Crédito (QUOD) e Processos Judiciais via DirectD, por CNPJ.
// Disparada automaticamente sempre que uma empresa é criada/atualizada com CNPJ.
import { createClient } from "jsr:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    const secret = req.headers.get("x-webhook-secret")
    if (secret !== Deno.env.get("WEBHOOK_SECRET")) return json({ error: "unauthorized" }, 401)

    const { company_id, cnpj } = await req.json()
    if (!company_id || !cnpj) return json({ error: "company_id e cnpj são obrigatórios" }, 400)

    const token = Deno.env.get("DIRECTD_API_KEY")
    if (!token) return json({ error: "DIRECTD_API_KEY não configurada" }, 500)

    const cnpjLimpo = String(cnpj).replace(/\D/g, "")
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { db: { schema: "tradek" } },
    )

    const [scoreRes, processosRes] = await Promise.all([
      fetch(`https://apiv3.directd.com.br/api/Score?TOKEN=${token}&CNPJ=${cnpjLimpo}`).then((r) => r.json()).catch((e) => ({ erro: String(e) })),
      fetch(`https://apiv3.directd.com.br/api/ProcessosJudiciaisCompleta?TOKEN=${token}&CNPJ=${cnpjLimpo}`).then((r) => r.json()).catch((e) => ({ erro: String(e) })),
    ])

    await admin.from("companies").update({
      score_credito: scoreRes,
      processos_judiciais: processosRes,
      consulta_credito_em: new Date().toISOString(),
    }).eq("id", company_id)

    return json({ ok: true })
  } catch (e) {
    return json({ error: String(e) }, 400)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}
