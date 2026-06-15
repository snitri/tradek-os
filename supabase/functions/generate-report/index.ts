// TradeK OS — gera relatório IA do lead (Claude, adaptive thinking).
import Anthropic from "npm:@anthropic-ai/sdk@0.69.0"
import { createClient } from "jsr:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}
const MODEL = Deno.env.get("REPORT_MODEL") ?? "claude-opus-4-8"

const SYSTEM = `Você é analista comercial da TradeK. Gere um relatório objetivo do lead em Markdown, em português do Brasil, com EXATAMENTE estas seções:
## Resumo executivo
## O que o cliente quer
## O que o cliente não quer / objeções
## Dados coletados
## Dados faltantes
## Score e classificação
## Riscos e alertas
## Próxima ação recomendada

Use ressalvas: a análise final é humana; não garanta crédito, prazo ou preço. Seja conciso e acionável.`

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
    if (!apiKey) return json({ error: "ANTHROPIC_API_KEY não configurada." }, 503)
    const { lead_id } = await req.json()
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { db: { schema: "tradek" } })

    const { data: lead } = await admin.from("leads")
      .select("*, companies(razao_social,nome_fantasia,cnpj), contacts(nome,email,whatsapp)")
      .eq("id", lead_id).single()
    if (!lead) return json({ error: "Lead não encontrado" }, 404)

    const anthropic = new Anthropic({ apiKey })
    // deno-lint-ignore no-explicit-any
    const resp = await anthropic.messages.create({
      model: MODEL, max_tokens: 4000,
      thinking: { type: "adaptive" }, output_config: { effort: "high" },
      system: SYSTEM,
      messages: [{ role: "user", content: "Dados do lead (JSON):\n" + JSON.stringify(lead, null, 2) }],
    } as any)

    const text = resp.content.filter((b: Anthropic.ContentBlock) => b.type === "text").map((b) => (b as Anthropic.TextBlock).text).join("\n")

    const { data: prev } = await admin.from("reports").select("versao").eq("lead_id", lead_id).order("versao", { ascending: false }).limit(1).maybeSingle()
    const versao = (prev?.versao ?? 0) + 1
    const { data: report } = await admin.from("reports").insert({
      lead_id, tipo: "lead", conteudo: text, score: lead.score_ia, modelo_ia: MODEL, gerado_por: "ia", versao,
    }).select("id,conteudo").single()

    return json({ report })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}
