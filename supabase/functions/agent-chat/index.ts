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

// Fallback usado só se o agente "Geral" não tiver prompt configurado no banco.
const FALLBACK_SYSTEM = `Você é o Agente TradeK, atendente virtual da TradeK — hub de negócios China–Brasil com três unidades: Supply Chain Finance (importação financiada com prazo), Procurement Internacional (sourcing de fornecedores) e Produtos da China (catálogo para revenda).

Sua função: atender visitantes, entender a necessidade, classificar a unidade, coletar os dados mínimos (nome, empresa, CNPJ, e-mail/WhatsApp, demanda, valor/volume, consentimento LGPD) e, quando tiver o suficiente, chamar a tool registrar_lead.

Guardrails OBRIGATÓRIOS — você NUNCA pode: aprovar crédito, garantir financiamento, prazo ou homologação, inventar preço, ou emitir parecer jurídico/fiscal definitivo. Sempre deixe claro que a análise final é humana. Use ressalvas em crédito, prazo e preço. Para preço de produto, use a tool buscar_produtos e só informe preço se o produto permitir cotação por IA; caso contrário registre o interesse e encaminhe para a equipe.

Para perguntas factuais sobre como funciona, requisitos, processo, RADAR/Siscomex, documentos ou condições, use SEMPRE a tool buscar_conhecimento e baseie a resposta no conteúdo retornado — não invente. Se a base não tiver a resposta, diga que vai encaminhar à equipe.

Seja claro, cordial e objetivo, em português do Brasil. Colete dados em blocos curtos, sem perguntar tudo de uma vez. Quando registrar o lead, calcule um score de 0 a 100 (mais dados e fit = maior score) e a classificação.`

const tools: Anthropic.Tool[] = [
  {
    name: "buscar_conhecimento",
    description: "Busca na base de conhecimento da TradeK. Use SEMPRE que o visitante fizer uma pergunta factual sobre como funciona, requisitos, documentos ou condições, e baseie a resposta no conteúdo retornado. Informe a `unidade` quando souber do que se trata — assim a busca traz o conhecimento específico daquele agente (mais o conhecimento geral), sem misturar áreas.",
    input_schema: { type: "object", properties: { query: { type: "string", description: "A pergunta ou tópico a buscar" }, unidade: { type: "string", enum: ["supply_chain_finance", "procurement", "produtos_motos", "suporte_importacao"], description: "Unidade do assunto, se identificada" } }, required: ["query"] },
  },
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

    // agentes configuráveis (prompt editável no admin). O widget público usa o agente "Geral";
    // o prompt de cada agente por unidade entra como "diretrizes do especialista" quando aquela unidade está em pauta.
    type Agent = { id: string; unidade: string; prompt: string | null; guardrails: string | null }
    const { data: agentsData } = await admin.from("agent_configs").select("id,unidade,prompt,guardrails").eq("ativo", true)
    const agents: Agent[] = agentsData ?? []
    const byUnidade: Record<string, Agent> = {}
    for (const a of agents) byUnidade[a.unidade] = a
    const geral = byUnidade["outro"] ?? agents[0]
    const effectiveSystem = geral?.prompt?.trim()
      ? geral.prompt.trim() + (geral.guardrails?.trim() ? `\n\nGuardrails OBRIGATÓRIOS:\n${geral.guardrails.trim()}` : "")
      : FALLBACK_SYSTEM

    // rate-limit: máx 30 mensagens por IP por minuto (anti-abuso de LLM)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const { data: allowed } = await admin.rpc("rate_check", { p_ip: ip, p_action: "agent-chat", p_window_secs: 60, p_max: 30 })
    if (allowed === false) return json({ reply: "Estou recebendo muitas mensagens agora. Aguarde um instante e tente de novo. 🙏" }, 200)

    const convo: Anthropic.MessageParam[] = messages.map((m) => ({ role: m.role, content: m.content }))
    let leadId: string | null = null

    for (let i = 0; i < 6; i++) {
      const resp = await anthropic.messages.create({ model: MODEL, max_tokens: 1500, system: effectiveSystem, tools, messages: convo })
      if (resp.stop_reason !== "tool_use") {
        const text = resp.content.filter((b) => b.type === "text").map((b) => (b as Anthropic.TextBlock).text).join("\n")
        return json({ reply: text, lead_id: leadId })
      }
      convo.push({ role: "assistant", content: resp.content })
      const results: Anthropic.ToolResultBlockParam[] = []
      for (const block of resp.content) {
        if (block.type !== "tool_use") continue
        if (block.name === "buscar_conhecimento") {
          const inp = block.input as Record<string, unknown>
          const q = String(inp.query ?? "")
          const uni = String(inp.unidade ?? "")
          // escopo: docs do agente da unidade + docs do agente Geral (sem cruzar unidades)
          const unitAgent = uni ? byUnidade[uni] : undefined
          const agentIds = [unitAgent?.id, geral?.id].filter(Boolean) as string[]
          let content = "[]"
          try {
            const emb = await embed(q)
            const { data } = await admin.rpc("match_documents", { query_embedding: emb, match_count: 4, p_agent_ids: agentIds.length ? agentIds : null, p_include_restrito: false })
            const docs = (data ?? []).map((r: { titulo: string; conteudo: string; similarity: number }) => ({
              titulo: r.titulo, conteudo: r.conteudo, similaridade: Math.round((r.similarity ?? 0) * 100) / 100,
            }))
            const payload: Record<string, unknown> = { docs }
            if (unitAgent?.prompt?.trim()) payload.diretrizes_especialista = unitAgent.prompt.trim()
            content = JSON.stringify(payload)
          } catch (e) { content = JSON.stringify({ erro: String(e) }) }
          results.push({ type: "tool_result", tool_use_id: block.id, content })
        } else if (block.name === "buscar_produtos") {
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

// gte-small nativo do Supabase Edge Runtime → vetor de 384 dimensões (normalizado p/ cosseno)
async function embed(text: string): Promise<number[]> {
  // deno-lint-ignore no-explicit-any
  const S = (globalThis as any).Supabase
  const session = new S.ai.Session("gte-small")
  return await session.run(text, { mean_pool: true, normalize: true }) as number[]
}
