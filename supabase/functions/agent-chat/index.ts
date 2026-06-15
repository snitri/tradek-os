// TradeK OS — Agente IA conversacional (Claude) com tool use.
// Conversa, classifica unidade, coleta dados, calcula score e cria lead via tool `registrar_lead`.
import Anthropic from "npm:@anthropic-ai/sdk@0.69.0"
import { createClient } from "jsr:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}
const MODEL = Deno.env.get("AGENT_MODEL") ?? "claude-opus-4-8"

const SYSTEM = `Você é o Agente TradeK, atendente virtual da TradeK — hub de negócios China–Brasil com três unidades: Supply Chain Finance (importação financiada com prazo), Procurement Internacional (sourcing de fornecedores) e Produtos da China (catálogo para revenda).

Sua função: atender visitantes, entender a necessidade, classificar a unidade, coletar os dados mínimos (nome, empresa, CNPJ, e-mail/WhatsApp, demanda, valor/volume, consentimento LGPD) e, quando tiver o suficiente, chamar a tool registrar_lead.

Guardrails OBRIGATÓRIOS — você NUNCA pode: aprovar crédito, garantir financiamento, prazo ou homologação, inventar preço, ou emitir parecer jurídico/fiscal definitivo. Sempre deixe claro que a análise final é humana. Use ressalvas em crédito, prazo e preço. Para preço de produto, use a tool buscar_produtos e só informe preço se o produto permitir cotação por IA; caso contrário registre o interesse e encaminhe para a equipe.

Seja claro, cordial e objetivo, em português do Brasil. Colete dados em blocos curtos, sem perguntar tudo de uma vez. Quando registrar o lead, calcule um score de 0 a 100 (mais dados e fit = maior score) e a classificação.`

const tools: Anthropic.Tool[] = [
  {
    name: "buscar_produtos",
    description: "Lista os produtos publicados do catálogo (motos elétricas). Use quando o visitante perguntar sobre modelos, specs ou preço de produtos.",
    input_schema: { type: "object", properties: { categoria: { type: "string", description: "Filtro opcional de categoria" } } },
  },
  {
    name: "registrar_lead",
    description: "Registra o lead no CRM da TradeK quando você já coletou os dados mínimos. Chame uma única vez ao final.",
    input_schema: {
      type: "object",
      properties: {
        nome: { type: "string" }, empresa: { type: "string" }, cnpj: { type: "string" },
        email: { type: "string" }, whatsapp: { type: "string" },
        unidade: { type: "string", enum: ["supply_chain_finance", "procurement", "produtos_motos", "suporte_importacao", "outro"] },
        demanda: { type: "string", description: "Resumo do que o cliente quer" },
        valor: { type: "string", description: "Valor, volume ou quantidade informados" },
        o_que_quer: { type: "string" }, o_que_nao_quer: { type: "string" },
        score: { type: "integer" }, classificacao: { type: "string" },
        consentimento_lgpd: { type: "boolean" },
      },
      required: ["nome", "unidade", "demanda", "score"],
    },
  },
]

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
    if (!apiKey) return json({ error: "ANTHROPIC_API_KEY não configurada. Insira o secret para ativar o agente." }, 503)

    const { messages } = await req.json() as { messages: { role: "user" | "assistant"; content: string }[] }
    const anthropic = new Anthropic({ apiKey })
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { db: { schema: "tradek" } })

    const convo: Anthropic.MessageParam[] = messages.map((m) => ({ role: m.role, content: m.content }))
    let leadId: string | null = null

    for (let i = 0; i < 6; i++) {
      const resp = await anthropic.messages.create({ model: MODEL, max_tokens: 1500, system: SYSTEM, tools, messages: convo })
      if (resp.stop_reason !== "tool_use") {
        const text = resp.content.filter((b) => b.type === "text").map((b) => (b as Anthropic.TextBlock).text).join("\n")
        return json({ reply: text, lead_id: leadId })
      }
      convo.push({ role: "assistant", content: resp.content })
      const results: Anthropic.ToolResultBlockParam[] = []
      for (const block of resp.content) {
        if (block.type !== "tool_use") continue
        if (block.name === "buscar_produtos") {
          const { data } = await admin.from("products").select("modelo,motor,velocidade,autonomia,bateria,moq,preco_base,moeda,permitir_cotacao_ia").eq("publicado_site", true)
          const list = (data ?? []).map((p) => ({ ...p, preco: p.permitir_cotacao_ia ? `${p.moeda} ${p.preco_base}` : "sob consulta (validação humana)" }))
          results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(list) })
        } else if (block.name === "registrar_lead") {
          const a = block.input as Record<string, unknown>
          let companyId: string | null = null
          if (a.empresa || a.cnpj) {
            const { data } = await admin.from("companies").insert({ razao_social: a.empresa ?? null, cnpj: (a.cnpj as string) || null }).select("id").single()
            companyId = data?.id ?? null
          }
          let contactId: string | null = null
          if (a.nome) {
            const { data } = await admin.from("contacts").insert({ company_id: companyId, nome: a.nome, email: a.email ?? null, whatsapp: a.whatsapp ?? null, principal: true }).select("id").single()
            contactId = data?.id ?? null
          }
          const score = Number(a.score) || 0
          const { data: lead } = await admin.from("leads").insert({
            origem: "site_chat_ia", unidade: a.unidade ?? "outro", status: score >= 60 ? "qualificado" : "qualificacao_ia",
            company_id: companyId, contact_id: contactId, score_ia: score, classificacao: a.classificacao ?? null,
            produto_servico_interesse: a.demanda ?? null, volume_estimado: a.valor ?? null,
            o_que_quer: a.o_que_quer ?? a.demanda ?? null, o_que_nao_quer: a.o_que_nao_quer ?? null,
            resumo_ia: a.demanda ?? null, consentimento_lgpd: !!a.consentimento_lgpd, dados_coletados: a,
          }).select("id").single()
          leadId = lead?.id ?? null
          if (leadId) {
            await admin.from("reports").insert({ lead_id: leadId, tipo: "lead", score, modelo_ia: MODEL, gerado_por: "ia",
              conteudo: `# Relatório IA — ${a.empresa ?? a.nome}\n\n## Unidade\n${a.unidade}\n\n## O que o cliente quer\n${a.o_que_quer ?? a.demanda}\n\n## Valor/volume\n${a.valor ?? "-"}\n\n## Score\n${score} (${a.classificacao ?? "-"})` })
            await admin.from("interactions").insert({ lead_id: leadId, canal: "chat_ia", tipo: "mensagem", autor_tipo: "ia", mensagem: `Lead criado pelo agente. ${a.demanda}`, visivel_cliente: false })
          }
          results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify({ ok: true, lead_id: leadId }) })
        }
      }
      convo.push({ role: "user", content: results })
    }
    return json({ reply: "Registrei suas informações. Nossa equipe vai retornar em breve.", lead_id: leadId })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}
