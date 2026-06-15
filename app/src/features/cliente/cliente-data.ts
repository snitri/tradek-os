import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

export type CLead = Database["tradek"]["Tables"]["leads"]["Row"] & {
  companies: { razao_social: string | null; nome_fantasia: string | null; cnpj: string | null } | null
}
export type CDoc = Database["tradek"]["Tables"]["document_requests"]["Row"]
export type CNotif = Database["tradek"]["Tables"]["notifications"]["Row"]
export type CMsg = { id: string; autor_tipo: string; mensagem: string | null; created_at: string }
export type Pipeline = Database["tradek"]["Tables"]["pipeline_statuses"]["Row"]

export function useMyLeads() {
  const [leads, setLeads] = useState<CLead[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.from("leads").select("*, companies(razao_social,nome_fantasia,cnpj)").order("created_at", { ascending: false })
      .then(({ data }) => { setLeads((data as unknown as CLead[]) ?? []); setLoading(false) })
  }, [])
  return { leads, loading }
}

export function useMyDocs() {
  const [docs, setDocs] = useState<CDoc[]>([])
  const reload = () => supabase.from("document_requests").select("*").order("solicitado_em").then(({ data }) => setDocs(data ?? []))
  useEffect(() => { reload() }, [])
  return { docs, reload }
}

export function useMyNotifications() {
  const [notifs, setNotifs] = useState<CNotif[]>([])
  useEffect(() => { supabase.from("notifications").select("*").order("created_at", { ascending: false }).then(({ data }) => setNotifs(data ?? [])) }, [])
  return notifs
}

export function useClientPipeline() {
  const [statuses, setStatuses] = useState<Pipeline[]>([])
  useEffect(() => { supabase.from("pipeline_statuses").select("*").order("ordem").then(({ data }) => setStatuses(data ?? [])) }, [])
  return statuses
}
