// TradeK OS — consulta Score de Crédito (QUOD) e Processos Judiciais via DirectD, por CNPJ.
// Disparada automaticamente sempre que uma empresa é criada/atualizada com CNPJ.
//
// Regra de negócio: a consulta NUNCA pode travar o fluxo de qualificação do lead.
// - Timeout de 60s por chamada à DirectD; se exceder, trata como "sem retorno".
// - O card da empresa é sempre atualizado com um status explícito:
//   'concluida' (veio o score) ou 'sem_retorno' (erro, timeout ou sem dados).
// - Falhas aqui nunca lançam exceção para o chamador — o e-mail para a equipe
//   comercial precisa ser disparado de qualquer forma, em ambos os cenários.
import { createClient } from "jsr:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}
const TIMEOUT_MS = 60_000

async function fetchComTimeout(url: string): Promise<Record<string, unknown>> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    return await res.json()
  } catch (e) {
    const timedOut = e instanceof Error && e.name === "TimeoutError"
    return { erro: timedOut ? "Tempo limite de 60s excedido" : String(e) }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    const secret = req.headers.get("x-webhook-secret")
    if (secret !== Deno.env.get("WEBHOOK_SECRET")) return json({ error: "unauthorized" }, 401)

    const { company_id, cnpj } = await req.json()
    if (!company_id || !cnpj) return json({ error: "company_id e cnpj são obrigatórios" }, 400)

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { db: { schema: "tradek" } },
    )

    await admin.from("companies").update({ consulta_status: "em_andamento" }).eq("id", company_id)

    const token = Deno.env.get("DIRECTD_API_KEY")
    if (!token) {
      await admin.from("companies").update({
        consulta_status: "sem_retorno", consulta_erro: "DIRECTD_API_KEY não configurada",
        consulta_credito_em: new Date().toISOString(),
      }).eq("id", company_id)
      return json({ ok: true, status: "sem_retorno" })
    }

    const cnpjLimpo = String(cnpj).replace(/\D/g, "")
    const [scoreRes, processosRes] = await Promise.all([
      fetchComTimeout(`https://apiv3.directd.com.br/api/Score?TOKEN=${token}&CNPJ=${cnpjLimpo}`),
      fetchComTimeout(`https://apiv3.directd.com.br/api/ProcessosJudiciaisCompleta?TOKEN=${token}&CNPJ=${cnpjLimpo}`),
    ])

    const pj = (scoreRes?.retorno as Record<string, unknown> | undefined)?.pessoaJuridica
    const sucesso = !!pj
    const motivoErro = sucesso ? null : String(
      scoreRes?.erro ?? (scoreRes?.metaDados as Record<string, unknown> | undefined)?.mensagem ?? "Consulta não retornou dados de score",
    )

    await admin.from("companies").update({
      score_credito: scoreRes,
      processos_judiciais: processosRes,
      consulta_status: sucesso ? "concluida" : "sem_retorno",
      consulta_erro: motivoErro,
      consulta_credito_em: new Date().toISOString(),
    }).eq("id", company_id)

    return json({ ok: true, status: sucesso ? "concluida" : "sem_retorno" })
  } catch (e) {
    // mesmo em erro inesperado, não propaga exceção — o chamador segue o fluxo normalmente
    return json({ ok: true, status: "sem_retorno", error: String(e) })
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } })
}
