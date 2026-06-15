// TradeK OS — LGPD (RNF-003): export e anonimização de dados de uma empresa/lead sob demanda.
// Chamado por usuário INTERNO (admin/comercial). O cliente NÃO chama esta function: no portal
// ele apenas registra a solicitação (interação visível), que o time interno cumpre por aqui.
//
//  action "export"    → JSON com todos os dados da empresa (service role; RLS não bloqueia).
//  action "anonymize" → substitui PII (nome, email, whatsapp, cnpj, razão social) por valores
//                       anonimizados e marca tradek.companies.anonimizado.
import { createClient } from "jsr:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const MASK = "[ANONIMIZADO]"

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    const authHeader = req.headers.get("Authorization") ?? ""
    const url = Deno.env.get("SUPABASE_URL")!
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!

    // 1) valida que o chamador é interno (mesmo padrão da create-client)
    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } }, db: { schema: "tradek" } })
    const { data: who } = await caller.auth.getUser()
    if (!who.user) return json({ error: "Não autenticado" }, 401)
    const { data: prof } = await caller.from("profiles").select("role").eq("id", who.user.id).maybeSingle()
    if (!prof || prof.role === "cliente") return json({ error: "Apenas usuários internos podem operar dados LGPD" }, 403)

    const body = await req.json().catch(() => ({}))
    const action = body.action
    if (action !== "export" && action !== "anonymize") return json({ error: "action deve ser 'export' ou 'anonymize'" }, 400)

    const admin = createClient(url, serviceKey, { db: { schema: "tradek" } })

    // 2) resolve a empresa-alvo (via company_id ou via lead_id)
    let companyId: string | null = body.company_id ?? null
    if (!companyId && body.lead_id) {
      const { data: l } = await admin.from("leads").select("company_id").eq("id", body.lead_id).maybeSingle()
      companyId = l?.company_id ?? null
    }
    if (!companyId) return json({ error: "Informe company_id ou lead_id de uma empresa válida" }, 400)

    const { data: company } = await admin.from("companies").select("*").eq("id", companyId).maybeSingle()
    if (!company) return json({ error: "Empresa não encontrada" }, 404)

    // ids dos leads da empresa (interações e relatórios são vinculados ao lead)
    const { data: leadRows } = await admin.from("leads").select("id").eq("company_id", companyId)
    const leadIds = (leadRows ?? []).map((l: { id: string }) => l.id)

    if (action === "export") {
      const [contacts, leads, documents, document_requests, interactions, reports] = await Promise.all([
        admin.from("contacts").select("*").eq("company_id", companyId),
        admin.from("leads").select("*").eq("company_id", companyId),
        admin.from("documents").select("*").eq("company_id", companyId),
        admin.from("document_requests").select("*").eq("company_id", companyId),
        leadIds.length ? admin.from("interactions").select("*").in("lead_id", leadIds) : Promise.resolve({ data: [] }),
        leadIds.length ? admin.from("reports").select("*").in("lead_id", leadIds) : Promise.resolve({ data: [] }),
      ])
      return json({
        gerado_em: new Date().toISOString(),
        gerado_por: who.user.email ?? who.user.id,
        company,
        contacts: contacts.data ?? [],
        leads: leads.data ?? [],
        documents: documents.data ?? [],
        document_requests: document_requests.data ?? [],
        interactions: interactions.data ?? [],
        reports: reports.data ?? [],
      })
    }

    // action === "anonymize" — substitui PII e marca a empresa
    const now = new Date().toISOString()
    const sufixo = companyId.slice(0, 8)

    await admin.from("companies").update({
      razao_social: MASK,
      nome_fantasia: MASK,
      cnpj: null,                       // índice único é parcial (where cnpj is not null)
      inscricao_estadual: null,
      inscricao_municipal: null,
      cnae_principal: null,
      cnae_secundario: null,
      site: null,
      observacoes: null,
      endereco: {},
      anonimizado: true,
      anonimizado_em: now,
    }).eq("id", companyId)

    const { data: ct } = await admin.from("contacts").update({
      nome: MASK,
      email: `anon+${sufixo}@anonimizado.local`,
      whatsapp: null,
      telefone: null,
      cpf: null,
      cargo: null,
    }).eq("company_id", companyId).select("id")

    const { data: lu } = await admin.from("leads").update({
      resumo_ia: null,
      o_que_quer: null,
      o_que_nao_quer: null,
      dados_coletados: {},
    }).eq("company_id", companyId).select("id")

    return json({
      ok: true,
      anonimizado_em: now,
      company_id: companyId,
      contatos_anonimizados: (ct ?? []).length,
      leads_anonimizados: (lu ?? []).length,
    })
  } catch (e) {
    return json({ error: String(e) }, 400)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}
