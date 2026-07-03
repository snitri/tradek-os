// TradeK OS — Agente IA conversacional (Claude) com tool use.
// Conversa, classifica unidade, coleta dados, calcula score e cria lead via tool `registrar_lead`.
import Anthropic from "npm:@anthropic-ai/sdk@0.69.0"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { buildProposalPdf } from "../_shared/proposal-pdf.ts"
import { brandEmail } from "../_shared/email-brand.ts"

const COMERCIAL_EMAIL = "tradek@globalk.com.br"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}
const MODEL = Deno.env.get("AGENT_MODEL") ?? "claude-opus-4-8"

// Fallback usado só se o agente "Geral" não tiver prompt configurado no banco.
const FALLBACK_SYSTEM = `Você é o Agente TradeK, atendente virtual da TradeK — hub de negócios China–Brasil com três unidades: Supply Chain Finance (importação financiada com prazo), Procurement Internacional (sourcing de fornecedores) e Produtos da China (catálogo para revenda).

FLUXO OBRIGATÓRIO — siga esta ordem em todo atendimento:

1. IDENTIFICAÇÃO (sempre a primeira etapa, independente do canal ou assunto):
   Apresente-se brevemente e solicite os dados de identificação do contato:
   - Nome completo
   - Cargo
   - E-mail
   - Telefone / WhatsApp
   - Empresa
   - CNPJ
   Peça esses dados de forma natural e acolhedora, em uma única mensagem inicial. Não avance para o mérito da conversa antes de ter TODOS os 6 dados acima.
   O CNPJ é IMPRESCINDÍVEL: é com ele que fazemos a análise de crédito e a verificação jurídica da empresa (Score de Crédito e Processos Judiciais), etapa que acelera a aprovação da operação. Se o cliente hesitar em informar o CNPJ, explique esse motivo e insista educadamente — não prossiga sem ele.
   Somente após ter nome, cargo, e-mail, telefone/WhatsApp, empresa E CNPJ, chame IMEDIATAMENTE a tool registrar_contato para registrar o contato no CRM.

2. ENTENDIMENTO DA NECESSIDADE:
   Com os dados coletados, pergunte sobre a necessidade e insista em coletar cada um destes pontos antes de finalizar (não pule nenhum):
   - Área de interesse (Supply Chain Finance, Procurement ou Produtos)
   - Demanda específica (o que precisa importar/comprar/financiar)
   - Volume ou quantidade (ex: "1 contêiner 40HC", "500 unidades")
   - Valor estimado da operação, em número, e a moeda (USD, BRL ou CNY)
   - Prazo desejado (de pagamento ou de entrega)
   - Urgência (baixa, média, alta ou crítica) — pergunte diretamente se há pressa ou prazo apertado
   - O que o cliente quer e o que NÃO quer (restrições, objeções)
   Esses dados alimentam o relatório completo que vai para a equipe comercial — quanto mais completos, melhor a priorização do atendimento.

3. COTAÇÃO DE PRODUTOS (apenas para unidade produtos_motos):
   Se o visitante tiver interesse em produtos do catálogo:
   a) Chame buscar_produtos para listar os modelos disponíveis com specs e preços.
   b) Apresente os modelos de forma clara. Para cada modelo, informe obrigatoriamente o MOQ (quantidade mínima de pedido). Exemplo: "Modelo X — MOQ: 50 unidades — USD 1.200/un". Só avance para cotação após o lead confirmar os modelos desejados.
   c) Quando o lead confirmar os modelos, chame criar_cotacao. O campo quantidade deve ser o MOQ do produto (quantidade mínima), não a quantidade informada pelo lead.
   d) Informe que a cotação foi enviada para o e-mail dele e que a equipe TradeK também recebeu uma cópia.
   Não chame criar_cotacao antes de ter lead registrado E confirmação dos itens.

4. APROFUNDAMENTO E BASE DE CONHECIMENTO:
   Para perguntas factuais sobre como funciona, requisitos, processo, RADAR/Siscomex, documentos ou condições, use SEMPRE a tool buscar_conhecimento. Baseie a resposta no conteúdo retornado — não invente. Se a base não tiver a resposta, diga que vai encaminhar à equipe.

5. REGISTRO DO LEAD:
   Quando tiver nome, empresa, contato e demanda, monte o campo resumo_estruturado obrigatoriamente neste formato antes de chamar registrar_lead:

   📋 QUALIFICAÇÃO
   Score: X/100 | Classificação: ...

   👤 CLIENTE
   Nome: ... | Empresa: ... | Cidade/Estado: ...
   E-mail: ... | WhatsApp: ...

   🎯 NECESSIDADE
   [descreva a demanda principal com detalhes]

   💡 EXPECTATIVAS
   [o que o cliente espera da TradeK: prazo, volume, resultado]

   📄 DOCUMENTAÇÃO
   Solicitado: ... | Enviado: ... | Pendente: ...

   ⚠️ OBSERVAÇÕES
   [pontos de atenção, restrições, objeções ou dúvidas levantadas]

   🔜 PRÓXIMA AÇÃO
   [o que o time humano deve fazer ao receber este lead]

   Esse resumo vai para o CRM, para o e-mail do cliente e para o relatório interno. Seja objetivo e completo.

Guardrails OBRIGATÓRIOS — você NUNCA pode: aprovar crédito, garantir financiamento, prazo ou homologação, inventar preço, ou emitir parecer jurídico/fiscal definitivo. Sempre deixe claro que a análise final é humana.

Seja claro, cordial e objetivo, em português do Brasil.

FORMATAÇÃO OBRIGATÓRIA: use sempre 1 asterisco para destaque (*texto*), nunca 2 asteriscos (**texto**). O canal é WhatsApp e chat — Markdown com duplo asterisco não é renderizado corretamente.`

const tools: Anthropic.Tool[] = [
  {
    name: "registrar_contato",
    description: "Registra o contato no CRM somente após ter coletado TODOS os dados mínimos obrigatórios: nome, cargo, e-mail, telefone/WhatsApp, empresa e CNPJ. Não chame antes de ter os 6 campos. Isso cria o contato e um lead 'Novo Lead' no CRM.",
    input_schema: {
      type: "object",
      properties: {
        nome: { type: "string" },
        cargo: { type: "string" },
        email: { type: "string" },
        whatsapp: { type: "string" },
        empresa: { type: "string" },
        cnpj: { type: "string" },
        cidade_estado: { type: "string" },
      },
      required: ["nome", "cargo", "email", "whatsapp", "empresa", "cnpj"],
    },
  },
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
    name: "criar_cotacao",
    description: "Gera a cotação formal (Proforma Invoice) com os produtos de interesse e envia por e-mail ao cliente e à equipe TradeK. Use SOMENTE quando: (1) o lead já estiver identificado, (2) a unidade for produtos_motos, e (3) o lead tiver confirmado os modelos e quantidades desejadas. Informe exatamente os nomes de modelo retornados por buscar_produtos.",
    input_schema: {
      type: "object",
      properties: {
        itens: {
          type: "array",
          description: "Produtos confirmados pelo lead",
          items: {
            type: "object",
            properties: {
              modelo: { type: "string", description: "Nome exato do modelo conforme retornado por buscar_produtos" },
              quantidade: { type: "integer", description: "Quantidade desejada" },
            },
            required: ["modelo", "quantidade"],
          },
        },
        observacoes: { type: "string", description: "Observações ou condições especiais mencionadas pelo lead (opcional)" },
      },
      required: ["itens"],
    },
  },
  {
    name: "registrar_lead",
    description: "Registra o lead no CRM da TradeK quando você já coletou os dados mínimos. Chame uma única vez ao final.",
    input_schema: {
      type: "object",
      properties: {
        nome: { type: "string" }, empresa: { type: "string" }, cnpj: { type: "string" },
        email: { type: "string" }, whatsapp: { type: "string" }, cidade_estado: { type: "string" },
        unidade: { type: "string", enum: ["supply_chain_finance", "procurement", "produtos_motos", "suporte_importacao", "outro"] },
        demanda: { type: "string", description: "Resumo do que o cliente quer" },
        valor: { type: "string", description: "Volume ou quantidade informados (ex: '1 contêiner 40HC', '500 unidades')" },
        valor_estimado: { type: "number", description: "Valor estimado da operação em número puro, sem moeda nem símbolos (ex: 180000)" },
        moeda: { type: "string", enum: ["BRL", "USD", "CNY"], description: "Moeda do valor_estimado informado" },
        prazo_desejado: { type: "string", description: "Prazo de pagamento ou entrega desejado pelo cliente (ex: '150 dias', '90-180 dias')" },
        urgencia: { type: "string", enum: ["baixa", "media", "alta", "critica"], description: "Urgência percebida na fala do cliente" },
        o_que_quer: { type: "string" }, o_que_nao_quer: { type: "string" },
        score: { type: "integer" }, classificacao: { type: "string" },
        consentimento_lgpd: { type: "boolean" },
        orcamento: { type: "string", description: "Apenas para unidade produtos_motos: lista dos produtos de interesse com modelo, MOQ e preço (se permitido). Formato:\nModelo: X | MOQ: Y unidades | Preço: Z USD\nModelo: ..." },
        resumo_estruturado: { type: "string", description: "Resumo executivo completo da conversa no formato:\n\n📋 QUALIFICAÇÃO\nScore: X/100 | Classificação: ...\n\n👤 CLIENTE\nNome: ... | Empresa: ... | Cidade/Estado: ...\nE-mail: ... | WhatsApp: ...\n\n🎯 NECESSIDADE\n...\n\n💡 EXPECTATIVAS\n...\n\n📄 DOCUMENTAÇÃO\nSolicitado: ... | Enviado: ... | Pendente: ...\n\n⚠️ OBSERVAÇÕES\n...\n\n🔜 PRÓXIMA AÇÃO\n..." },
      },
      required: ["nome", "unidade", "demanda", "score", "resumo_estruturado"],
    },
  },
]

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
    if (!apiKey) return json({ error: "ANTHROPIC_API_KEY não configurada. Insira o secret para ativar o agente." }, 503)

    const { messages, visitor_id, unidade: reqUnidade, canal, language } = await req.json() as { messages: { role: "user" | "assistant"; content: string }[]; visitor_id?: string; unidade?: string; canal?: string; language?: string }
    const isEnglish = language === "en"
    const isSpanish = language === "es"
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

    // Quando a requisição vem de uma página de divisão específica, o agente é
    // isolado naquela divisão — sem mencionar ou cruzar com outras áreas.
    const lockedAgent = reqUnidade ? byUnidade[reqUnidade] : undefined
    const activeAgent = lockedAgent ?? geral
    // Formatação depende do canal real desta requisição — sobrescreve qualquer regra de
    // asterisco fixada no prompt (o site não renderiza markdown; WhatsApp renderiza *texto* como negrito).
    const formatRule = canal === "whatsapp"
      ? "FORMATAÇÃO OBRIGATÓRIA: pode usar 1 asterisco para destaque (*texto*), nunca 2 asteriscos (**texto**) — é assim que o WhatsApp renderiza negrito."
      : "FORMATAÇÃO OBRIGATÓRIA: NÃO use asteriscos para destacar palavras (nem * nem **). Este canal é o chat do site, que exibe o texto literalmente sem markdown — qualquer asterisco apareceria na tela e confundiria o visitante. Escreva em texto corrido, sem marcação."
    const languageRule = isEnglish
      ? "IDIOMA OBRIGATÓRIO: o visitante está navegando o site em inglês. Responda SEMPRE em inglês (English), independentemente do idioma usado pelo visitante na mensagem. Mantenha nomes próprios da TradeK e termos técnicos (CNPJ, RADAR/Siscomex, FOB, MOQ) como estão, mas todo o restante do texto deve ser em inglês natural e fluente."
      : isSpanish
      ? "IDIOMA OBRIGATÓRIO: o visitante está navegando o site em espanhol. Responda SEMPRE em espanhol (Español), independentemente do idioma usado pelo visitante na mensagem. Mantenha nomes próprios da TradeK e termos técnicos (CNPJ, RADAR/Siscomex, FOB, MOQ) como estão, mas todo o restante do texto deve ser em espanhol natural e fluente."
      : ""
    const effectiveSystem = (activeAgent?.prompt?.trim()
      ? activeAgent.prompt.trim() + (activeAgent.guardrails?.trim() ? `\n\nGuardrails OBRIGATÓRIOS:\n${activeAgent.guardrails.trim()}` : "")
      : FALLBACK_SYSTEM) + `\n\n${formatRule}` + (languageRule ? `\n\n${languageRule}` : "")

    // rate-limit: máx 30 mensagens por IP por minuto (anti-abuso de LLM)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const { data: allowed } = await admin.rpc("rate_check", { p_ip: ip, p_action: "agent-chat", p_window_secs: 60, p_max: 30 })
    if (allowed === false) return json({ reply: isEnglish ? "I'm receiving a lot of messages right now. Please wait a moment and try again. 🙏" : isSpanish ? "Estoy recibiendo muchos mensajes ahora. Espere un momento e intente de nuevo. 🙏" : "Estou recebendo muitas mensagens agora. Aguarde um instante e tente de novo. 🙏" }, 200)

    const convo: Anthropic.MessageParam[] = messages.map((m) => ({ role: m.role, content: m.content }))
    let leadId: string | null = null
    let detectedUnidade = ""

    // persiste a conversa (visitor → tabela conversations + mensagens) p/ a Central de Interações
    async function persistConversation(reply: string) {
      if (!visitor_id) return
      try {
        const firstUser = messages.find((m) => m.role === "user")?.content ?? ""
        const row = {
          visitor_id, unidade_detectada: detectedUnidade || null,
          resumo: firstUser.slice(0, 140), status: leadId ? "convertida" : "ativa", lead_id: leadId,
        }
        const unidadeConv = detectedUnidade || reqUnidade || null
        const convQuery = admin.from("conversations").select("id").eq("visitor_id", visitor_id)
        if (unidadeConv) convQuery.eq("unidade_detectada", unidadeConv)
        const { data: existing } = await convQuery.maybeSingle()
        let convId = existing?.id as string | undefined
        if (convId) await admin.from("conversations").update(row).eq("id", convId)
        else { const { data } = await admin.from("conversations").insert(row).select("id").single(); convId = data?.id }
        if (convId) {
          await admin.from("conversation_messages").delete().eq("conversation_id", convId)
          await admin.from("conversation_messages").insert(
            [...messages.map((m) => ({ conversation_id: convId, role: m.role, content: m.content })), { conversation_id: convId, role: "assistant", content: reply }],
          )
        }
      } catch (_e) { /* persistência não deve quebrar a resposta */ }
    }

    for (let i = 0; i < 6; i++) {
      const resp = await anthropic.messages.create({ model: MODEL, max_tokens: 1500, system: effectiveSystem, tools, messages: convo })
      if (resp.stop_reason !== "tool_use") {
        const text = resp.content.filter((b) => b.type === "text").map((b) => (b as Anthropic.TextBlock).text).join("\n")
        await persistConversation(text)
        return json({ reply: text, lead_id: leadId })
      }
      convo.push({ role: "assistant", content: resp.content })
      const results: Anthropic.ToolResultBlockParam[] = []
      for (const block of resp.content) {
        if (block.type !== "tool_use") continue
        if (block.name === "registrar_contato") {
          const a = block.input as Record<string, unknown>
          try {
            let companyId: string | null = null
            if (a.empresa) {
              const { data: co } = await admin.from("companies").insert({ razao_social: a.empresa, cnpj: (a.cnpj as string) || null }).select("id").single()
              companyId = co?.id ?? null
              if (companyId && a.cnpj) await dispararConsultaDirectD(companyId, a.cnpj as string)
            }
            const { data: ct } = await admin.from("contacts").insert({
              company_id: companyId, nome: a.nome ?? null, email: a.email ?? null,
              whatsapp: a.whatsapp ?? null, principal: true,
              dados_extras: { cargo: a.cargo ?? null, cidade_estado: a.cidade_estado ?? null, canal: canal ?? "chat_ia" },
            }).select("id").single()
            // Cria lead imediato com status 'novo' para aparecer no CRM Kanban desde o primeiro contato
            if (ct?.id && !leadId) {
              const unidade = detectedUnidade || reqUnidade || "outro"
              const { data: newLead } = await admin.from("leads").insert({
                origem: canal === "whatsapp" ? "whatsapp_ia" : "site_chat_ia",
                unidade, status: "novo", company_id: companyId, contact_id: ct.id,
              }).select("id").single()
              if (newLead?.id) {
                leadId = newLead.id
                // Notifica a equipe IMEDIATAMENTE ao captar os dados mínimos — não depende da
                // conversa continuar até a qualificação completa (que dispara um 2º e-mail).
                const webhookSecret = Deno.env.get("WEBHOOK_SECRET")
                const supabaseUrl = Deno.env.get("SUPABASE_URL")!
                await fetch(`${supabaseUrl}/functions/v1/on-event`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "x-webhook-secret": webhookSecret ?? "" },
                  body: JSON.stringify({ event: "lead.created", lead_id: leadId, extra_vars: { unidade } }),
                }).catch(() => {})
              }
            }
          } catch (_e) { /* contato duplicado ou erro não crítico */ }
          results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify({ ok: true, lead_id: leadId }) })
        } else if (block.name === "buscar_conhecimento") {
          const inp = block.input as Record<string, unknown>
          const q = String(inp.query ?? "")
          const uni = String(inp.unidade ?? "")
          if (uni) detectedUnidade = uni
          // Agente bloqueado numa divisão: só docs daquela divisão (sem cruzar).
          // Agente geral: docs da unidade detectada + geral.
          const unitAgent = lockedAgent ?? (uni ? byUnidade[uni] : undefined)
          const agentIds = lockedAgent
            ? [lockedAgent.id]
            : [unitAgent?.id, geral?.id].filter(Boolean) as string[]
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
        } else if (block.name === "criar_cotacao") {
          const a = block.input as { itens: { modelo: string; quantidade: number }[]; observacoes?: string }
          try {
            if (!leadId) { results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify({ ok: false, erro: "Lead não identificado. Registre o contato primeiro." }) }); continue }

            const { data: leadData } = await admin.from("leads").select("id,company_id,contact_id,companies(razao_social,nome_fantasia,cnpj),contacts(nome,email,whatsapp)").eq("id", leadId).maybeSingle()
            if (!leadData) { results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify({ ok: false, erro: "Lead não encontrado." }) }); continue }
            type LeadRow = { company_id: string | null; contact_id: string | null; companies: { razao_social: string | null; nome_fantasia: string | null; cnpj: string | null } | null; contacts: { nome: string | null; email: string | null; whatsapp: string | null } | null }
            const ld = leadData as unknown as LeadRow
            const comp = ld.companies
            const ct = ld.contacts
            const empresa = comp?.nome_fantasia || comp?.razao_social || "—"
            if (!ct?.email) { results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify({ ok: false, erro: "O contato não tem e-mail cadastrado. Solicite o e-mail antes de gerar a cotação." }) }); continue }

            // busca produtos pelo modelo para pegar IDs e preços
            const modelos = a.itens.map((i) => i.modelo)
            const { data: products } = await admin.from("products").select("id,modelo,preco_base,moeda,motor,velocidade,autonomia,bateria,freios,imagens,moq").in("modelo", modelos)
            const prodMap = new Map((products ?? []).map((p) => [p.modelo, p]))

            const itensResolvidos = a.itens.map((item) => {
              const prod = prodMap.get(item.modelo)
              const moqNum = prod?.moq ? parseFloat(String(prod.moq).replace(/[^\d.]/g, "")) || 1 : (item.quantidade || 1)
              return { ...item, product: prod ?? null, valor_unit: Number(prod?.preco_base ?? 0), moq_num: moqNum }
            })
            const total = itensResolvidos.reduce((s, i) => s + i.valor_unit * i.moq_num, 0)

            // cria proposal + items
            const { data: proposal } = await admin.from("proposals").insert({ lead_id: leadId, status: "enviada", valor: total, moeda: "USD", observacoes: a.observacoes ?? null, enviada_em: new Date().toISOString() }).select("id").single()
            if (!proposal?.id) { results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify({ ok: false, erro: "Erro ao criar cotação no banco." }) }); continue }

            const itemsInsert = itensResolvidos.filter((i) => i.product).map((i) => ({ proposal_id: proposal.id, product_id: i.product!.id, quantidade: i.moq_num, valor_unit: i.valor_unit }))
            if (itemsInsert.length) await admin.from("proposal_items").insert(itemsInsert)

            // gera PDF
            const siteUrl = Deno.env.get("SITE_URL") ?? "https://www.tradek.com.br"
            const itensParaPdf = itensResolvidos.map((i) => {
              const imgs = i.product?.imagens
              const imgRaw = Array.isArray(imgs) && typeof imgs[0] === "string" ? imgs[0] as string : null
              const imagemUrl = imgRaw ? (imgRaw.startsWith("http") ? imgRaw : `${siteUrl}${imgRaw.startsWith("/") ? "" : "/"}${imgRaw}`) : null
              return { produto: i.modelo, categoria: null, imagemUrl, quantidade: i.moq_num, valorUnit: i.valor_unit, ficha: { motor: i.product?.motor ?? null, velocidade: i.product?.velocidade ?? null, autonomia: i.product?.autonomia ?? null, bateria: i.product?.bateria ?? null, freios: i.product?.freios ?? null, capacidade: null, moq: i.product?.moq ?? null } }
            })
            const pdfBytes = await buildProposalPdf({ proposalId: proposal.id, empresa, cnpj: comp?.cnpj ?? "", contato: ct.nome ?? "", itens: itensParaPdf, valor: total, moeda: "USD", observacoes: a.observacoes ?? null, criadaEm: new Date().toISOString() })

            // salva no storage
            const path = `propostas/${proposal.id}.pdf`
            await admin.storage.from("tradek-documents").upload(path, pdfBytes, { contentType: "application/pdf", upsert: true })
            const { data: signed } = await admin.storage.from("tradek-documents").createSignedUrl(path, 60 * 60 * 24 * 14)
            const pdfUrl = signed?.signedUrl ?? null
            await admin.from("proposals").update({ pdf_storage_key: path }).eq("id", proposal.id)

            // envia e-mail ao cliente + cópia para equipe comercial
            const resendKey = Deno.env.get("RESEND_API_KEY")
            const fromAddr = Deno.env.get("RESEND_FROM") ?? "TradeK <noreply@tradek.com.br>"
            if (resendKey) {
              const html = brandEmail(`<p>Olá, ${ct.nome ?? ""}.</p><p>Conforme nosso atendimento, segue sua cotação TradeK em anexo.</p>${pdfUrl ? `<p style="text-align:center;margin:24px 0;"><a href="${pdfUrl}" style="display:inline-block;background:#C3F929;color:#0A0B0A;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;">Ver cotação (PDF)</a></p>` : ""}<p style="font-size:12px;color:#888;">Em caso de dúvidas, entre em contato com nossa equipe comercial.</p>`)
              const pdfBase64 = bytesToBase64(pdfBytes)
              await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({ from: fromAddr, to: [ct.email], cc: [COMERCIAL_EMAIL], subject: `Cotação TradeK · ${empresa}`, html, attachments: [{ filename: `cotacao-tradek-${proposal.id.slice(0, 8)}.pdf`, content: pdfBase64 }] }),
              }).catch(() => {})
            }

            await admin.from("interactions").insert({ lead_id: leadId, canal: canal ?? "chat_ia", tipo: "proposta_enviada", autor_tipo: "ia", mensagem: `Cotação gerada pelo agente e enviada para ${ct.email}.`, visivel_cliente: false })
            results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify({ ok: true, email_enviado: ct.email, total_usd: total }) })
          } catch (e) {
            results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify({ ok: false, erro: String(e) }) })
          }
        } else if (block.name === "registrar_lead") {
          const a = block.input as Record<string, unknown>
          if (a.unidade) detectedUnidade = String(a.unidade)
          let companyId: string | null = null
          let contactId: string | null = null

          if (leadId) {
            // já existe lead criado via registrar_contato — reaproveita a empresa/contato em vez de duplicar
            const { data: existingLead } = await admin.from("leads").select("company_id, contact_id").eq("id", leadId).maybeSingle()
            companyId = existingLead?.company_id ?? null
            contactId = existingLead?.contact_id ?? null
            if (companyId && (a.empresa || a.cnpj)) {
              const update: Record<string, unknown> = {}
              if (a.empresa) update.razao_social = a.empresa
              if (a.cnpj) update.cnpj = a.cnpj
              await admin.from("companies").update(update).eq("id", companyId)
              if (a.cnpj) await dispararConsultaDirectD(companyId, a.cnpj as string)
            } else if (!companyId && (a.empresa || a.cnpj)) {
              const { data } = await admin.from("companies").insert({ razao_social: a.empresa ?? null, cnpj: (a.cnpj as string) || null }).select("id").single()
              companyId = data?.id ?? null
              if (companyId && a.cnpj) await dispararConsultaDirectD(companyId, a.cnpj as string)
            }
            if (contactId && (a.email || a.whatsapp)) {
              const update: Record<string, unknown> = {}
              if (a.email) update.email = a.email
              if (a.whatsapp) update.whatsapp = a.whatsapp
              await admin.from("contacts").update(update).eq("id", contactId)
            } else if (!contactId && a.nome) {
              const { data } = await admin.from("contacts").insert({ company_id: companyId, nome: a.nome, email: a.email ?? null, whatsapp: a.whatsapp ?? null, principal: true }).select("id").single()
              contactId = data?.id ?? null
            }
          } else {
            if (a.empresa || a.cnpj) {
              const { data } = await admin.from("companies").insert({ razao_social: a.empresa ?? null, cnpj: (a.cnpj as string) || null }).select("id").single()
              companyId = data?.id ?? null
              if (companyId && a.cnpj) await dispararConsultaDirectD(companyId, a.cnpj as string)
            }
            if (a.nome) {
              const { data } = await admin.from("contacts").insert({ company_id: companyId, nome: a.nome, email: a.email ?? null, whatsapp: a.whatsapp ?? null, principal: true }).select("id").single()
              contactId = data?.id ?? null
            }
          }
          const score = Number(a.score) || 0
          const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
          const resumoBase = (a.resumo_estruturado as string) ?? a.demanda ?? null
          const resumo_ia = resumoBase ? `${resumoBase}\n\n📅 ${agora} (horário de Brasília)` : null
          const leadPayload = {
            origem: canal === "whatsapp" ? "whatsapp_ia" : "site_chat_ia", unidade: a.unidade ?? "outro", status: score >= 60 ? "pronto_atendimento" : "qualificacao_ia",
            company_id: companyId, contact_id: contactId, score_ia: score, classificacao: a.classificacao ?? null,
            produto_servico_interesse: a.demanda ?? null, volume_estimado: a.valor ?? null,
            valor_estimado: a.valor_estimado ?? null, moeda: a.moeda ?? null,
            prazo_desejado: a.prazo_desejado ?? null, urgencia: a.urgencia ?? null,
            o_que_quer: a.o_que_quer ?? a.demanda ?? null, o_que_nao_quer: a.o_que_nao_quer ?? null,
            resumo_ia, consentimento_lgpd: !!a.consentimento_lgpd,
            dados_coletados: { ...a as Record<string, unknown>, cidade_estado: a.cidade_estado ?? null },
          }
          let lead: { id: string } | null = null
          if (leadId) {
            // Atualiza o lead criado em registrar_contato em vez de duplicar
            await admin.from("leads").update(leadPayload).eq("id", leadId)
            lead = { id: leadId }
          } else {
            const { data } = await admin.from("leads").insert(leadPayload).select("id").single()
            lead = data
          }
          leadId = lead?.id ?? null
          if (leadId) {
            await admin.from("reports").insert({ lead_id: leadId, tipo: "lead", score, modelo_ia: MODEL, gerado_por: "ia",
              conteudo: (a.resumo_estruturado as string) ?? `# Relatório IA — ${a.empresa ?? a.nome}\n\n## Unidade\n${a.unidade}\n\n## O que o cliente quer\n${a.o_que_quer ?? a.demanda}\n\n## Valor/volume\n${a.valor ?? "-"}\n\n## Score\n${score} (${a.classificacao ?? "-"})` })
            await admin.from("interactions").insert({ lead_id: leadId, canal: canal ?? "chat_ia", tipo: "mensagem", autor_tipo: "ia", mensagem: `Lead criado pelo agente. ${a.demanda}`, visivel_cliente: false })
          }
          results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify({ ok: true, lead_id: leadId }) })

          // dispara e-mail de resumo da interação IA (aguardado para garantir entrega)
          if (leadId) {
            const transcript = messages.map((m) => `${m.role === "user" ? "Cliente" : "Agente"}: ${m.content}`).join("\n\n")
            const webhookSecret = Deno.env.get("WEBHOOK_SECRET")
            const supabaseUrl = Deno.env.get("SUPABASE_URL")!
            await fetch(`${supabaseUrl}/functions/v1/on-event`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-webhook-secret": webhookSecret ?? "" },
              body: JSON.stringify({
                event: "lead.ia_qualificado",
                lead_id: leadId,
                extra_vars: {
                  transcript: (a.resumo_estruturado as string) ?? transcript,
                  score: String(Number(a.score) || 0),
                  classificacao: String(a.classificacao ?? ""),
                  demanda: String(a.demanda ?? ""),
                  unidade: String(a.unidade ?? ""),
                  orcamento: String((a as Record<string, unknown>).orcamento ?? ""),
                },
              }),
            }).catch(() => { /* silencioso */ })
          }
        }
      }
      convo.push({ role: "user", content: results })
    }
    const closingMsg = isEnglish ? "I've registered your information. Our team will get back to you shortly." : isSpanish ? "He registrado su información. Nuestro equipo le responderá en breve." : "Registrei suas informações. Nossa equipe vai retornar em breve."
    await persistConversation(closingMsg)
    return json({ reply: closingMsg, lead_id: leadId })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})

function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 8192
  let binary = ""
  for (let i = 0; i < bytes.length; i += chunkSize) binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  return btoa(binary)
}

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}

async function dispararConsultaDirectD(companyId: string, cnpj: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!
  await fetch(`${supabaseUrl}/functions/v1/directd-consulta`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`, "x-webhook-secret": Deno.env.get("WEBHOOK_SECRET") ?? "" },
    body: JSON.stringify({ company_id: companyId, cnpj }),
  }).catch(() => {})
}

async function embed(text: string): Promise<number[]> {
  const apiKey = Deno.env.get("OPENAI_API_KEY")
  if (!apiKey) throw new Error("OPENAI_API_KEY não configurada")
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text, dimensions: 384 }),
  })
  if (!res.ok) throw new Error(`OpenAI embeddings error: ${await res.text()}`)
  const j = await res.json()
  return j.data[0].embedding as number[]
}
