// TradeK OS — gera o PDF de uma cotação (proposals) com a identidade visual da
// TradeK, salva no Storage e envia ao cliente por e-mail (Resend) ou WhatsApp (Z-API).
import { createClient } from "jsr:@supabase/supabase-js@2"
import { buildProposalPdf } from "../_shared/proposal-pdf.ts"
import { brandEmail } from "../_shared/email-brand.ts"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    const authHeader = req.headers.get("Authorization") ?? ""
    const url = Deno.env.get("SUPABASE_URL")!
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!

    // só usuário interno pode enviar cotações
    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } }, db: { schema: "tradek" } })
    const { data: who } = await caller.auth.getUser()
    if (!who.user) return json({ error: "Não autenticado" }, 401)
    const { data: prof } = await caller.from("profiles").select("role").eq("id", who.user.id).maybeSingle()
    if (!prof || prof.role === "cliente") return json({ error: "Apenas usuários internos podem enviar cotações" }, 403)

    const { proposal_id, canal } = await req.json() as { proposal_id: string; canal: "email" | "whatsapp" }
    if (!proposal_id) return json({ error: "proposal_id obrigatório" }, 400)
    if (canal !== "email" && canal !== "whatsapp") return json({ error: "canal inválido" }, 400)

    const admin = createClient(url, serviceKey, { db: { schema: "tradek" } })

    const { data: proposal } = await admin.from("proposals").select("*, leads(id,unidade,company_id,contact_id,companies(razao_social,nome_fantasia,cnpj),contacts(nome,email,whatsapp)), proposal_items(quantidade,valor_unit,cores_escolhidas,products(modelo,categoria,imagens,motor,velocidade,autonomia,bateria,freios,capacidade,moq,hs_code))").eq("id", proposal_id).maybeSingle()
    if (!proposal) return json({ error: "Cotação não encontrada" }, 404)

    const lead = proposal.leads as unknown as { unidade: string; companies: { razao_social: string; nome_fantasia: string; cnpj: string } | null; contacts: { nome: string; email: string | null; whatsapp: string | null } | null } | null
    const comp = lead?.companies
    const ct = lead?.contacts
    const empresa = comp?.nome_fantasia || comp?.razao_social || "—"

    if (canal === "email" && !ct?.email) return json({ error: "O contato deste lead não tem e-mail cadastrado." }, 400)
    if (canal === "whatsapp" && !ct?.whatsapp) return json({ error: "O contato deste lead não tem WhatsApp cadastrado." }, 400)

    // 1) gera o PDF com a identidade visual da TradeK
    // imagens podem estar salvas como caminho relativo (ex: "/motos/X21.png"), que só resolve
    // no navegador contra o domínio do site — aqui precisamos da URL absoluta para o fetch().
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://www.tradek.com.br"
    type ItemRow = { quantidade: number; valor_unit: number; cores_escolhidas?: string[]; products: { modelo?: string; categoria?: string; imagens?: unknown; motor?: string; velocidade?: string; autonomia?: string; bateria?: string; freios?: string; capacidade?: string; moq?: string; hs_code?: string } | null }
    const itensRaw = (proposal.proposal_items as unknown as ItemRow[]) ?? []
    const itens = itensRaw.map((it) => {
      const imagens = it.products?.imagens
      const imagemRaw = Array.isArray(imagens) && typeof imagens[0] === "string" ? imagens[0] as string : null
      const imagemUrl = imagemRaw ? (imagemRaw.startsWith("http") ? imagemRaw : `${siteUrl}${imagemRaw.startsWith("/") ? "" : "/"}${imagemRaw}`) : null
      return {
        produto: it.products?.modelo ?? "—",
        categoria: it.products?.categoria ?? null,
        imagemUrl,
        quantidade: it.quantidade, valorUnit: it.valor_unit,
        ficha: {
          motor: it.products?.motor ?? null, velocidade: it.products?.velocidade ?? null, autonomia: it.products?.autonomia ?? null,
          bateria: it.products?.bateria ?? null, freios: it.products?.freios ?? null, capacidade: it.products?.capacidade ?? null,
          moq: it.products?.moq ?? null, hsCode: it.products?.hs_code ?? null,
        },
        coresEscolhidas: it.cores_escolhidas ?? [],
      }
    })
    const pdfBytes = await buildProposalPdf({
      proposalId: proposal.id,
      empresa, cnpj: comp?.cnpj ?? "", contato: ct?.nome ?? "",
      itens,
      valor: proposal.valor, moeda: proposal.moeda ?? "USD", observacoes: proposal.observacoes,
      criadaEm: proposal.created_at,
      portoOrigem: "SHENZHEN", portoDestino: "SANTOS", dataEntrega: "30 dias após confirmação de pagamento",
    })

    // 2) salva no Storage e gera link assinado (14 dias)
    const path = `propostas/${proposal.id}.pdf`
    const { error: upErr } = await admin.storage.from("tradek-documents").upload(path, pdfBytes, { contentType: "application/pdf", upsert: true })
    if (upErr) return json({ error: "Falha ao salvar PDF: " + upErr.message }, 500)
    const { data: signed } = await admin.storage.from("tradek-documents").createSignedUrl(path, 60 * 60 * 24 * 14)
    const pdfUrl = signed?.signedUrl ?? null
    if (!pdfUrl) return json({ error: "Falha ao gerar link do PDF" }, 500)

    // 3) envia pelo canal escolhido
    let envioStatus = "erro", envioErro: string | null = null
    if (canal === "email") {
      const apiKey = Deno.env.get("RESEND_API_KEY")
      const fromAddr = Deno.env.get("RESEND_FROM") ?? "TradeK <noreply@tradek.com.br>"
      if (!apiKey) { envioErro = "RESEND_API_KEY não configurada" } else {
        const html = brandEmail(`<p>Olá, ${ct?.nome ?? ""}.</p><p>Sua cotação da TradeK está disponível. Confira os detalhes no PDF anexo abaixo.</p><p style="text-align:center;margin:24px 0;"><a href="${pdfUrl}" style="display:inline-block;background:#C3F929;color:#0A0B0A;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;">Ver cotação (PDF)</a></p>`)
        const pdfBase64 = bytesToBase64(pdfBytes)
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: fromAddr, to: [ct!.email], cc: ["tradek@globalk.com.br"], subject: `Cotação TradeK · ${empresa}`, html,
            attachments: [{ filename: `cotacao-tradek-${proposal.id.slice(0, 8)}.pdf`, content: pdfBase64 }],
          }),
        })
        const b = await resp.json().catch(() => ({}))
        envioStatus = resp.ok ? "enviado" : "erro"
        if (!resp.ok) envioErro = JSON.stringify(b)
        await admin.from("email_log").insert({ lead_id: lead?.id ?? null, para: [ct!.email], assunto: `Cotação TradeK · ${empresa}`, status: envioStatus, provider_id: b.id ?? null, erro: resp.ok ? null : envioErro })
      }
    } else {
      const instanceId = Deno.env.get("ZAPI_INSTANCE_ID")
      const zapiToken = Deno.env.get("ZAPI_TOKEN")
      const clientToken = Deno.env.get("ZAPI_CLIENT_TOKEN")
      if (!instanceId || !zapiToken || !clientToken) { envioErro = "Integração com WhatsApp (Z-API) não configurada" } else {
        const base = `https://api.z-api.io/instances/${instanceId}/token/${zapiToken}`
        const zHeaders = { "Content-Type": "application/json", "Client-Token": clientToken }

        // a Z-API pode responder 200 mesmo com a instância desconectada — confirma antes de enviar
        const statusResp = await fetch(`${base}/status`, { headers: zHeaders }).catch(() => null)
        const statusBody = await statusResp?.json().catch(() => null) as { connected?: boolean; error?: string } | null
        if (statusResp && statusResp.ok && statusBody && statusBody.connected === false) {
          envioErro = "A instância do WhatsApp (Z-API) está desconectada. Reconecte o QR Code no painel da Z-API."
        } else {
          const phone = normalizePhoneBR(ct!.whatsapp ?? "")
          const resp = await fetch(`${base}/send-document/pdf`, {
            method: "POST", headers: zHeaders,
            body: JSON.stringify({ phone, document: pdfUrl, fileName: `cotacao-tradek-${proposal.id.slice(0, 8)}.pdf`, caption: `Sua cotação TradeK · ${empresa}` }),
          })
          const bodyText = await resp.text().catch(() => "")
          const bodyJson = (() => { try { return JSON.parse(bodyText) } catch { return null } })() as { zaapId?: string; messageId?: string; id?: string; error?: string; message?: string } | null
          const sucesso = resp.ok && !(bodyJson && bodyJson.error)
          envioStatus = sucesso ? "enviado" : "erro"
          if (!sucesso) envioErro = bodyJson?.error ?? bodyJson?.message ?? bodyText ?? "Falha desconhecida ao enviar pelo WhatsApp"
          console.log("ZAPI send-document:", resp.status, bodyText)
        }
      }
    }

    if (envioStatus !== "enviado") return json({ error: envioErro ?? "Falha ao enviar" }, 500)

    // 4) atualiza a cotação e registra a interação
    await admin.from("proposals").update({ status: "enviada", enviada_em: new Date().toISOString(), pdf_storage_key: path }).eq("id", proposal.id)
    if (lead?.id) {
      await admin.from("interactions").insert({
        lead_id: (proposal as { lead_id: string }).lead_id, canal, tipo: "proposta_enviada", autor_tipo: "admin",
        mensagem: `Cotação enviada por ${canal === "email" ? "e-mail" : "WhatsApp"}.`, visivel_cliente: true,
      })
    }

    return json({ ok: true, pdf_url: pdfUrl })
  } catch (e) {
    console.error("send-proposal ERRO:", String(e))
    return json({ error: String(e) }, 500)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}

// garante o código do país (55) — números cadastrados sem DDI fazem a Z-API não entregar a mensagem
function normalizePhoneBR(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 12 || digits.length === 13) return digits // já tem 55 + DDD + número
  if (digits.length === 10 || digits.length === 11) return `55${digits}` // só DDD + número
  return digits
}

// converte em chunks para evitar limite de argumentos do String.fromCharCode em PDFs maiores
function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 8192
  let binary = ""
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}
