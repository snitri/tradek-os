// TradeK OS — autocadastro público no Portal do Cliente ("Crie sua conta").
//
// Regra de negócio (Fluxo de Cadastro e Qualificação Automática de Lead):
// 1) valida e-mail/telefone/CNPJ;
// 2) se já existe empresa com o mesmo CNPJ (ex: lead criado antes via chat com o agente),
//    NÃO cria lead novo — vincula ao company_id/contact_id existentes e registra uma
//    nova "solicitação" (interaction); senão cria empresa+contato+lead do zero;
// 3) consulta a DirectD (score + processos) por CNPJ, com timeout de 60s (reaproveita
//    directd-consulta, que já implementa essa regra);
// 4) atualiza o card com status explícito: 'lead_qualificado' (consulta concluída) ou
//    'lead_pendente_consulta' (sem retorno/erro/sem CNPJ);
// 5) cria o usuário do Portal (auth.users) com a senha informada;
// 6) dispara o e-mail para a equipe comercial em 100% dos casos, sucesso ou falha.
import { createClient } from "jsr:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UNIDADES = ["supply_chain_finance", "procurement", "produtos_motos", "suporte_importacao", "outro"]

function soNumeros(v: unknown) {
  return String(v ?? "").replace(/\D/g, "")
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    const body = await req.json()
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { db: { schema: "tradek" } },
    )

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const { data: allowed } = await admin.rpc("rate_check", { p_ip: ip, p_action: "public-signup", p_window_secs: 60, p_max: 5 })
    if (allowed === false) return json({ error: "Muitas solicitações. Aguarde um instante." }, 429)

    // 1) validação de formato
    const nome = String(body.nome ?? "").trim()
    const email = String(body.email ?? "").trim().toLowerCase()
    const telefone = soNumeros(body.telefone ?? body.whatsapp)
    const cnpj = soNumeros(body.cnpj)
    const senha = String(body.senha ?? body.password ?? "")
    const razaoSocial = String(body.razao_social ?? body.empresa ?? "").trim()

    if (!nome) return json({ error: "Nome é obrigatório." }, 400)
    if (!EMAIL_RE.test(email)) return json({ error: "E-mail inválido." }, 400)
    if (telefone.length < 10 || telefone.length > 11) return json({ error: "Telefone inválido." }, 400)
    if (cnpj.length !== 14) return json({ error: "CNPJ inválido. Informe os 14 dígitos." }, 400)
    if (senha.length < 8) return json({ error: "A senha deve ter ao menos 8 caracteres." }, 400)
    if (!razaoSocial) return json({ error: "Razão social é obrigatória." }, 400)

    const unidade = UNIDADES.includes(body.unidade) ? body.unidade : "outro"
    const servico = String(body.servico_desejado ?? body.demanda ?? "").trim()
    const descricao = String(body.descricao_necessidade ?? "").trim()
    const observacoes = String(body.observacoes ?? "").trim()

    // 2) deduplicação por CNPJ — não cria empresa/lead duplicados se o CNPJ já existe
    const { data: empresaExistente } = await admin.from("companies").select("id, razao_social").eq("cnpj", cnpj).maybeSingle()
    const isNovaEmpresa = !empresaExistente

    let companyId: string
    if (empresaExistente) {
      companyId = empresaExistente.id
      // completa dados que ainda não existiam, sem sobrescrever o que já foi cadastrado
      const update: Record<string, unknown> = {}
      if (!empresaExistente.razao_social && razaoSocial) update.razao_social = razaoSocial
      if (Object.keys(update).length) await admin.from("companies").update(update).eq("id", companyId)
    } else {
      const { data: comp, error: compErr } = await admin.from("companies")
        .insert({ razao_social: razaoSocial, cnpj })
        .select("id").single()
      if (compErr || !comp) throw compErr ?? new Error("Falha ao criar empresa")
      companyId = comp.id
    }

    let contactId: string | null = null
    const { data: contatoExistente } = await admin.from("contacts").select("id").eq("company_id", companyId).eq("email", email).maybeSingle()
    if (contatoExistente) {
      contactId = contatoExistente.id
    } else {
      const { data: ct, error: ctErr } = await admin.from("contacts")
        .insert({ company_id: companyId, nome, email, telefone, whatsapp: telefone, principal: isNovaEmpresa })
        .select("id").single()
      if (ctErr || !ct) throw ctErr ?? new Error("Falha ao criar contato")
      contactId = ct.id
    }

    // status inicial — sempre "Novo Lead - Em Análise" (key 'novo') até a consulta DirectD concluir
    const { data: lead, error: leadErr } = await admin.from("leads")
      .insert({
        origem: "formulario_site", unidade, status: "novo",
        company_id: companyId, contact_id: contactId,
        produto_servico_interesse: servico || null,
        resumo_ia: descricao || null,
        dados_coletados: { ...body, senha: undefined, password: undefined },
      })
      .select("id").single()
    if (leadErr || !lead) throw leadErr ?? new Error("Falha ao criar lead")

    await admin.from("interactions").insert({
      lead_id: lead.id,
      canal: "portal", tipo: "mensagem", autor_tipo: "cliente",
      mensagem: empresaExistente
        ? `Nova solicitação via autocadastro no Portal (empresa já cadastrada). Serviço: ${servico || "-"}. ${descricao}`
        : `Lead criado via autocadastro no Portal. Serviço: ${servico || "-"}. ${descricao}`,
      visivel_cliente: false,
    })

    // 3) consulta DirectD (score + processos) — bloqueante até 60s, nunca lança exceção
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET") ?? ""
    let statusConsulta = "sem_retorno"
    try {
      const resp = await fetch(`${supabaseUrl}/functions/v1/directd-consulta`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`, "x-webhook-secret": webhookSecret },
        body: JSON.stringify({ company_id: companyId, cnpj }),
      })
      const r = await resp.json().catch(() => ({}))
      statusConsulta = r.status === "concluida" ? "concluida" : "sem_retorno"
    } catch {
      statusConsulta = "sem_retorno"
    }

    // 4) status final do card, conforme resultado da consulta
    const statusFinal = statusConsulta === "concluida" ? "lead_qualificado" : "lead_pendente_consulta"
    await admin.from("leads").update({ status: statusFinal }).eq("id", lead.id)

    // 5) cria o usuário do Portal com a senha definida no cadastro
    let userId: string | null = null
    const { data: created, error: userErr } = await admin.auth.admin.createUser({
      email, password: senha, email_confirm: true,
      user_metadata: { role: "cliente", nome, company_id: companyId, whatsapp: telefone },
    })
    if (userErr) {
      // e-mail já em uso etc — não impede a criação do lead/notificação, mas avisa o front
      await admin.from("leads").update({ cliente_portal_criado: false }).eq("id", lead.id)
    } else if (created.user) {
      userId = created.user.id
      await admin.from("leads").update({ cliente_portal_criado: true }).eq("id", lead.id)
    }

    // 6) e-mail para a equipe comercial — disparado em 100% dos cadastros, sucesso ou falha na DirectD
    await fetch(`${supabaseUrl}/functions/v1/on-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`, "x-webhook-secret": webhookSecret },
      body: JSON.stringify({
        event: "lead.ia_qualificado",
        lead_id: lead.id,
        extra_vars: {
          unidade, classificacao: "Autocadastro Portal", produto_servico_interesse: servico,
          o_que_quer: descricao, o_que_nao_quer: observacoes,
        },
      }),
    }).catch(() => {})

    return json({
      lead_id: lead.id, user_id: userId, company_id: companyId,
      empresa_existente: !isNovaEmpresa, consulta_status: statusConsulta,
      erro_usuario: userErr ? "Não foi possível criar o acesso (e-mail já cadastrado?). Faça login normalmente." : null,
    })
  } catch (e) {
    return json({ error: String(e) }, 400)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}
