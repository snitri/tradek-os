// TradeK OS — upload de documento direto pelo chat público do site (sem login).
// Vinculado ao lead já criado na conversa (registrar_contato/registrar_lead).
// Usa service role para gravar no Storage e nas tabelas — o visitante não tem
// credenciais próprias, então a validação fica no fato de já ter um lead_id válido.
import { createClient } from "jsr:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const MAX_SIZE = 15 * 1024 * 1024 // 15MB
const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { db: { schema: "tradek" } },
    )

    // rate-limit: máx 10 uploads por IP por minuto
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const { data: allowed } = await admin.rpc("rate_check", { p_ip: ip, p_action: "public-document-upload", p_window_secs: 60, p_max: 10 })
    if (allowed === false) return json({ error: "Muitos envios. Aguarde um instante." }, 429)

    const form = await req.formData()
    const leadId = String(form.get("lead_id") ?? "")
    const tipoDocumento = String(form.get("tipo_documento") ?? "Documento enviado pelo chat")
    const file = form.get("file")
    if (!leadId) return json({ error: "lead_id é obrigatório" }, 400)
    if (!(file instanceof File)) return json({ error: "Nenhum arquivo enviado" }, 400)
    if (file.size > MAX_SIZE) return json({ error: "Arquivo muito grande (máx. 15MB)" }, 400)
    if (file.type && !ALLOWED_MIME.includes(file.type)) return json({ error: "Tipo de arquivo não suportado. Envie PDF, imagem (JPG/PNG/WebP) ou Word." }, 400)

    const { data: lead } = await admin.from("leads").select("id, company_id").eq("id", leadId).maybeSingle()
    if (!lead) return json({ error: "Lead não encontrado" }, 404)

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const path = `${lead.company_id ?? "sem-empresa"}/${lead.id}/${Date.now()}_${safeName}`
    const { error: upErr } = await admin.storage.from("tradek-documents").upload(path, file, { contentType: file.type || undefined })
    if (upErr) return json({ error: "Falha no upload: " + upErr.message }, 500)

    await admin.from("documents").insert({
      company_id: lead.company_id ?? null, lead_id: lead.id, tipo_documento: tipoDocumento,
      nome_original: file.name, storage_key: path, status: "enviado", tamanho: file.size, mime: file.type || null,
    })
    await admin.from("interactions").insert({
      lead_id: lead.id, canal: "chat_ia", tipo: "upload", autor_tipo: "lead",
      mensagem: `Documento enviado pelo chat do site: ${file.name}`, visivel_cliente: false,
    })

    // notifica a equipe — precisa de await: o Deno cancela fetches pendentes quando a função retorna
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET")
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    await fetch(`${supabaseUrl}/functions/v1/on-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-webhook-secret": webhookSecret ?? "" },
      body: JSON.stringify({ event: "lead.document_uploaded", lead_id: lead.id, extra_vars: { documento: file.name } }),
    }).catch(() => {})

    return json({ ok: true, nome: file.name })
  } catch (e) {
    return json({ error: String(e) }, 400)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}
