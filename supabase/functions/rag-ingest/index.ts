// TradeK OS — RAG ingest (Plano 07): cria um documento de conhecimento, fatia em chunks,
// gera embeddings (gte-small nativo, 384 dims) e grava em tradek.rag_chunks.
// INTERNA: apenas usuários internos (verify_jwt + checagem de papel).
import { createClient } from "jsr:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// fatia o texto em chunks de ~máx 700 chars respeitando parágrafos
function chunkText(text: string, max = 700): string[] {
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const chunks: string[] = []
  let cur = ""
  for (const p of paras) {
    if ((cur + "\n\n" + p).length > max && cur) { chunks.push(cur); cur = p }
    else { cur = cur ? cur + "\n\n" + p : p }
  }
  if (cur) chunks.push(cur)
  return chunks
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    const url = Deno.env.get("SUPABASE_URL")!
    const authHeader = req.headers.get("Authorization") ?? ""

    // 1) só usuários internos podem ingerir conhecimento
    const caller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } }, db: { schema: "tradek" } })
    const { data: who } = await caller.auth.getUser()
    if (!who.user) return json({ error: "Não autenticado" }, 401)
    const { data: prof } = await caller.from("profiles").select("role").eq("id", who.user.id).maybeSingle()
    if (!prof || prof.role === "cliente") return json({ error: "Apenas usuários internos podem ingerir conhecimento" }, 403)

    const body = await req.json()
    const { titulo, categoria, conteudo, restrito_admin, storage_key, agent_id } = body as {
      titulo: string; categoria?: string; conteudo: string; restrito_admin?: boolean; storage_key?: string; agent_id?: string
    }
    if (!titulo || !conteudo) return json({ error: "Informe titulo e conteudo" }, 400)
    if (!agent_id) return json({ error: "Informe o agent_id (agente dono do conhecimento)" }, 400)

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { db: { schema: "tradek" } })

    // unidade é derivada do agente, p/ manter consistência
    const { data: ag } = await admin.from("agent_configs").select("unidade").eq("id", agent_id).maybeSingle()
    if (!ag) return json({ error: "Agente não encontrado" }, 404)

    // 2) upsert do documento por título (reingestão substitui os chunks)
    const meta = { categoria: categoria ?? null, unidade: ag.unidade, agent_id, status: "ativo", restrito_admin: !!restrito_admin, ...(storage_key ? { storage_key } : {}) }
    const { data: existing } = await admin.from("rag_documents").select("id").eq("titulo", titulo).maybeSingle()
    let docId = existing?.id as string | undefined
    if (docId) {
      await admin.from("rag_chunks").delete().eq("document_id", docId)
      await admin.from("rag_documents").update(meta).eq("id", docId)
    } else {
      const { data: doc, error } = await admin.from("rag_documents").insert({ titulo, ...meta }).select("id").single()
      if (error) throw error
      docId = doc!.id
    }

    // 3) chunk + embed + insert
    const chunks = chunkText(conteudo)
    const rows = []
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embed(chunks[i])
      rows.push({ document_id: docId, chunk_index: i, conteudo: chunks[i], embedding })
    }
    const { error: insErr } = await admin.from("rag_chunks").insert(rows)
    if (insErr) throw insErr

    return json({ ok: true, document_id: docId, chunks: rows.length })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}
