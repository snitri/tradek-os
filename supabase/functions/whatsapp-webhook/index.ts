// TradeK OS — Webhook Z-API: recebe mensagens WhatsApp, passa pelo agente IA e responde.
// O mesmo agente que qualifica leads no site qualifica aqui — canal: "whatsapp".
import { createClient } from "jsr:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, client-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })

  try {
    const payload = await req.json()

    // Log do payload real para diagnóstico
    console.log("ZAPI_PAYLOAD:", JSON.stringify(payload))

    // Ignora mensagens enviadas pelo próprio número (fromMe)
    if (payload.fromMe) return json({ ok: true, skipped: "fromMe" })

    const phone: string = payload.phone ?? payload.chatId?.replace("@c.us", "") ?? payload.from?.replace("@c.us", "") ?? ""
    if (!phone) return json({ error: "phone ausente" }, 400)

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const admin = createClient(supabaseUrl, serviceKey, { db: { schema: "tradek" } })

    // --- mídia/documento enviado pelo cliente ---
    const mediaUrl: string | null =
      payload.document?.documentUrl ?? payload.image?.imageUrl ?? payload.video?.videoUrl ??
      payload.audio?.audioUrl ?? payload.ptt?.audioUrl ?? null
    const mediaMime: string | null =
      payload.document?.mimeType ?? payload.image?.mimeType ?? payload.video?.mimeType ?? null
    const mediaName: string | null = payload.document?.fileName ?? payload.caption ?? null

    if (mediaUrl) {
      // resolve o lead vinculado ao número
      const visitorId = `wa_${phone}`
      const { data: convRow } = await admin.from("conversations").select("id,lead_id").eq("visitor_id", visitorId).maybeSingle()
      const leadId: string | null = (convRow as { id: string; lead_id?: string | null } | null)?.lead_id ?? null

      let companyId: string | null = null
      if (leadId) {
        const { data: ld } = await admin.from("leads").select("company_id").eq("id", leadId).maybeSingle()
        companyId = (ld as { company_id?: string | null } | null)?.company_id ?? null
      }

      try {
        // baixa o arquivo da Z-API e faz upload no Storage
        const fileResp = await fetch(mediaUrl)
        const fileBytes = new Uint8Array(await fileResp.arrayBuffer())
        const ext = mediaMime ? mediaMime.split("/")[1]?.split(";")[0] ?? "bin" : "bin"
        const fileName = mediaName ?? `wa_${Date.now()}.${ext}`
        const storagePath = `documentos/${leadId ?? companyId ?? "sem-lead"}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`

        const { error: upErr } = await admin.storage.from("tradek-documents").upload(storagePath, fileBytes, { contentType: mediaMime ?? "application/octet-stream", upsert: false })
        if (!upErr) {
          await admin.from("documents").insert({
            lead_id: leadId, company_id: companyId,
            storage_key: storagePath, nome_original: fileName,
            mime: mediaMime, tamanho: fileBytes.length,
            status: "enviado", observacoes: "whatsapp",
          })
          console.log("ZAPI_MEDIA_SAVED:", storagePath)
        } else {
          console.error("ZAPI_MEDIA_UPLOAD_ERR:", String(upErr.message))
        }
      } catch (me) {
        console.error("ZAPI_MEDIA_ERR:", String(me))
      }
      return json({ ok: true, media: "saved" })
    }

    const text = payload.text?.message ?? payload.message?.text?.message ?? payload.body ?? ""
    if (!text.trim()) return json({ ok: true, skipped: "non-text" })

    const instanceId = Deno.env.get("ZAPI_INSTANCE_ID")!
    const zapiToken = Deno.env.get("ZAPI_TOKEN")!
    const clientToken = Deno.env.get("ZAPI_CLIENT_TOKEN")!

    // "typing..." enquanto o agente processa
    await zapiSend(instanceId, zapiToken, clientToken, phone, null, true)

    // visitor_id derivado do telefone (estável por número)
    const visitorId = `wa_${phone}`

    // Carrega histórico da conversa WhatsApp deste número
    const { data: convRow } = await admin
      .from("conversations")
      .select("id")
      .eq("visitor_id", visitorId)
      .maybeSingle()

    type Msg = { role: string; content: string }
    let history: Msg[] = []
    if (convRow?.id) {
      const { data: msgs } = await admin
        .from("conversation_messages")
        .select("role, content")
        .eq("conversation_id", convRow.id)
        .order("created_at", { ascending: true })
        .limit(40)
      history = (msgs ?? []) as Msg[]
    }

    // Monta array de mensagens para o agente
    const messages = [...history, { role: "user", content: text }]

    // Chama agent-chat (mesmo agente do site)
    const agentResp = await fetch(`${supabaseUrl}/functions/v1/agent-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
        "apikey": serviceKey,
      },
      body: JSON.stringify({ messages, visitor_id: visitorId, canal: "whatsapp" }),
    })

    const agentData = await agentResp.json()
    const reply: string = agentData.reply ?? "Desculpe, tive um problema. Tente novamente em instantes."

    // Envia resposta pelo WhatsApp
    await zapiSend(instanceId, zapiToken, clientToken, phone, reply, false)

    // O e-mail de qualificação é disparado pelo agent-chat via on-event
    // quando o agente chama registrar_lead (evento lead.ia_qualificado)
    return json({ ok: true })
  } catch (e) {
    console.error("whatsapp-webhook error:", e)
    return json({ error: String(e) }, 500)
  }
})

async function zapiSend(instanceId: string, token: string, clientToken: string, phone: string, message: string | null, typing: boolean) {
  const base = `https://api.z-api.io/instances/${instanceId}/token/${token}`
  const headers = { "Content-Type": "application/json", "Client-Token": clientToken }
  if (typing) {
    await fetch(`${base}/send-chat-state`, {
      method: "POST", headers,
      body: JSON.stringify({ phone, chatState: "typing" }),
    }).catch(() => {})
    return
  }
  const resp = await fetch(`${base}/send-text`, {
    method: "POST", headers,
    body: JSON.stringify({ phone, message }),
  })
  console.log("ZAPI_SEND:", resp.status, await resp.text().catch(() => ""))
}

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}
