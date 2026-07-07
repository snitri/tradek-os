// TradeK OS — gera o PDF de uma cotação e retorna link para download (sem enviar ao cliente)
import { createClient } from "jsr:@supabase/supabase-js@2"
import { buildProposalPdf } from "../_shared/proposal-pdf.ts"

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

    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } }, db: { schema: "tradek" } })
    const { data: who } = await caller.auth.getUser()
    if (!who.user) return json({ error: "Não autenticado" }, 401)
    const { data: prof } = await caller.from("profiles").select("role").eq("id", who.user.id).maybeSingle()
    if (!prof || prof.role === "cliente") return json({ error: "Apenas usuários internos podem visualizar cotações" }, 403)

    const { proposal_id } = await req.json() as { proposal_id: string }
    if (!proposal_id) return json({ error: "proposal_id obrigatório" }, 400)

    const admin = createClient(url, serviceKey, { db: { schema: "tradek" } })

    const { data: proposal } = await admin.from("proposals").select("*, leads(id,company_id,contact_id,companies(razao_social,nome_fantasia,cnpj),contacts(nome,email,whatsapp)), proposal_items(quantidade,valor_unit,cores_escolhidas,observacoes,products(modelo,categoria,imagens,motor,velocidade,autonomia,bateria,freios,capacidade,moq,hs_code))").eq("id", proposal_id).maybeSingle()
    if (!proposal) return json({ error: "Cotação não encontrada" }, 404)

    const lead = proposal.leads as unknown as { companies: { razao_social: string; nome_fantasia: string; cnpj: string } | null; contacts: { nome: string; email: string | null; whatsapp: string | null } | null } | null
    const comp = lead?.companies
    const ct = lead?.contacts
    const empresa = comp?.nome_fantasia || comp?.razao_social || "—"

    const siteUrl = Deno.env.get("SITE_URL") ?? "https://www.tradek.com.br"
    type ItemRow = { quantidade: number; valor_unit: number; cores_escolhidas?: string[]; observacoes?: string | null; products: { modelo?: string; categoria?: string; imagens?: unknown; motor?: string; velocidade?: string; autonomia?: string; bateria?: string; freios?: string; capacidade?: string; moq?: string; hs_code?: string } | null }
    const itensRaw = (proposal.proposal_items as unknown as ItemRow[]) ?? []
    const itens = await Promise.all(itensRaw.map(async (it) => {
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
        observacoes: it.observacoes ?? null,
        observacoesEN: it.observacoes ? await translateToEnglish(it.observacoes) : null,
      }
    }))

    const obsEN = proposal.observacoes ? await translateToEnglish(proposal.observacoes) : null
    const pdfBytes = await buildProposalPdf({
      proposalId: proposal.id,
      empresa, cnpj: comp?.cnpj ?? "", contato: ct?.nome ?? "",
      itens,
      valor: proposal.valor, moeda: proposal.moeda ?? "USD", observacoes: proposal.observacoes, observacoesEN: obsEN,
      criadaEm: proposal.created_at,
      portoOrigem: "QINGDAO", portoDestino: "A DEFINIR", dataEntrega: "35 dias após confirmação de pagamento",
    })

    // Salva no Storage com prefixo "preview/" e link válido por 1 hora
    const path = `preview/${proposal.id}.pdf`
    const { error: upErr } = await admin.storage.from("tradek-documents").upload(path, pdfBytes, { contentType: "application/pdf", upsert: true })
    if (upErr) return json({ error: "Falha ao salvar PDF: " + upErr.message }, 500)
    const { data: signed } = await admin.storage.from("tradek-documents").createSignedUrl(path, 60 * 60)
    const pdfUrl = signed?.signedUrl ?? null
    if (!pdfUrl) return json({ error: "Falha ao gerar link do PDF" }, 500)

    return json({ ok: true, pdf_url: pdfUrl })
  } catch (e) {
    console.error("preview-proposal ERRO:", String(e))
    return json({ error: String(e) }, 500)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}

async function translateToEnglish(text: string): Promise<string | null> {
  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY")
    if (!apiKey) return null
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini", max_tokens: 256,
        messages: [{ role: "user", content: `Translate the following Brazilian Portuguese product observation to English. Reply with only the translation, no explanation:\n\n${text}` }],
      }),
    })
    if (!resp.ok) return null
    const data = await resp.json() as { choices: { message: { content: string } }[] }
    return data.choices?.[0]?.message?.content?.trim() ?? null
  } catch { return null }
}
