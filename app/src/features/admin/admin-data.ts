import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

export type LeadRow = Database["tradek"]["Tables"]["leads"]["Row"]
export type Lead = LeadRow & {
  companies: { razao_social: string | null; nome_fantasia: string | null; cnpj: string | null; score_credito: unknown; processos_judiciais: unknown } | null
  contacts: { nome: string; email?: string | null; whatsapp?: string | null; cargo?: string | null } | null
  responsavel: { nome: string | null } | null
}
export type PipelineStatus = Database["tradek"]["Tables"]["pipeline_statuses"]["Row"]

const LEAD_SELECT = "*, companies(razao_social,nome_fantasia,cnpj,score_credito,processos_judiciais), contacts(nome), responsavel:profiles(nome)"

export function leadScoreCredito(l: Lead): { score: string | null; faixa: string | null; qtdProcessos: number } {
  const sc = l.companies?.score_credito as Record<string, unknown> | null
  const pj = (sc?.retorno as Record<string, unknown> | undefined)?.pessoaJuridica as Record<string, unknown> | undefined
  const proc = l.companies?.processos_judiciais as Record<string, unknown> | null
  const lista = (proc?.retorno as Record<string, unknown> | undefined)?.processos as unknown[] | undefined
  return { score: pj ? String(pj.score ?? "") : null, faixa: pj ? String(pj.faixaScore ?? "") : null, qtdProcessos: lista?.length ?? 0 }
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const reload = useCallback(async () => {
    const { data } = await supabase.from("leads").select(LEAD_SELECT).order("created_at", { ascending: false })
    setLeads((data as unknown as Lead[]) ?? [])
    setLoading(false)
  }, [])
  useEffect(() => { reload() }, [reload])
  return { leads, loading, reload, setLeads }
}

export function usePipelineStatuses() {
  const [statuses, setStatuses] = useState<PipelineStatus[]>([])
  useEffect(() => {
    supabase.from("pipeline_statuses").select("*").order("ordem").then(({ data }) => setStatuses(data ?? []))
  }, [])
  return statuses
}

export async function updateLeadStatus(id: string, status: LeadRow["status"], anterior?: LeadRow["status"]) {
  await supabase.from("leads").update({ status }).eq("id", id)
  await supabase.from("lead_status_history").insert({ lead_id: id, status_anterior: anterior ?? null, status_novo: status })
}

// ---- metadados de unidade (enum -> visual do protótipo) ----
const UNIT_BY_ENUM: Record<string, { short: string; icon: string; color: string; label: string }> = {
  supply_chain_finance: { short: "SCF", icon: "coins", color: "var(--lime)", label: "Supply Chain Finance" },
  procurement: { short: "Procurement", icon: "globe", color: "var(--info)", label: "Procurement Internacional" },
  produtos_motos: { short: "Produtos", icon: "box", color: "var(--warn)", label: "Produtos da China" },
  suporte_importacao: { short: "Suporte", icon: "chat", color: "var(--purple)", label: "Suporte / Importação" },
  outro: { short: "Outro", icon: "box", color: "var(--tx-dim)", label: "Outro" },
}
export function unidadeMeta(u: string | null | undefined) {
  return UNIT_BY_ENUM[u ?? "outro"] ?? UNIT_BY_ENUM.outro
}

export function companyName(l: Lead): string {
  return l.companies?.nome_fantasia || l.companies?.razao_social || "Empresa não informada"
}

export function leadValor(l: Lead): string {
  if (l.valor_estimado) return `${l.moeda ?? "USD"} ${Number(l.valor_estimado).toLocaleString("pt-BR")}`
  if (l.volume_estimado) return l.volume_estimado
  return "—"
}

const ORIGEM_LABEL: Record<string, string> = {
  site_chat_ia: "Agente IA (site)", whatsapp_ia: "Agente IA (WhatsApp)", formulario_site: "Formulário", cadastro_manual: "Manual",
  email: "E-mail", whatsapp: "WhatsApp", indicacao: "Indicação", evento: "Evento",
  trafego_pago: "Tráfego pago", importacao_manual: "Importação", outro: "Outro",
}
export function origemLabel(o: string | null | undefined): string {
  return ORIGEM_LABEL[o ?? "outro"] ?? "Outro"
}
