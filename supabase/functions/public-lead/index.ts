// TradeK OS — captação pública de lead (agente IA / formulário do site)
// Usa service role para inserir company + contact + lead no schema tradek (RLS não bloqueia).
import { createClient } from "jsr:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const UNIDADES = ["supply_chain_finance", "procurement", "produtos_motos", "suporte_importacao", "outro"]
const ORIGENS = ["site_chat_ia", "formulario_site"]

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    const body = await req.json()
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { db: { schema: "tradek" } },
    )

    const unidade = UNIDADES.includes(body.unidade) ? body.unidade : "outro"
    const origem = ORIGENS.includes(body.origem) ? body.origem : "formulario_site"

    let companyId: string | null = null
    if (body.empresa || body.cnpj) {
      const { data: comp } = await admin.from("companies")
        .insert({ razao_social: body.empresa ?? null, cnpj: body.cnpj || null })
        .select("id").single()
      companyId = comp?.id ?? null
    }

    let contactId: string | null = null
    if (body.nome) {
      const { data: ct } = await admin.from("contacts")
        .insert({ company_id: companyId, nome: body.nome, email: body.email ?? null, whatsapp: body.whatsapp ?? null, principal: true })
        .select("id").single()
      contactId = ct?.id ?? null
    }

    const { data: lead, error } = await admin.from("leads")
      .insert({
        origem, unidade, status: "novo",
        company_id: companyId, contact_id: contactId,
        produto_servico_interesse: body.demanda ?? null,
        volume_estimado: body.valor ?? null,
        consentimento_lgpd: !!body.consentimento_lgpd,
        dados_coletados: body,
        resumo_ia: body.demanda ?? null,
      })
      .select("id").single()
    if (error) throw error

    await admin.from("interactions").insert({
      lead_id: lead.id,
      canal: origem === "site_chat_ia" ? "chat_ia" : "portal",
      tipo: "mensagem", autor_tipo: "ia",
      mensagem: `Lead criado via ${origem}. Demanda: ${body.demanda ?? "-"} | Valor/volume: ${body.valor ?? "-"}`,
      visivel_cliente: false,
    })

    return new Response(JSON.stringify({ lead_id: lead.id }), {
      headers: { ...cors, "Content-Type": "application/json" },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    })
  }
})
