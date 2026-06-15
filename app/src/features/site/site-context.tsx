import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

export type Product = Database["tradek"]["Tables"]["products"]["Row"]

// ---- Agente (sinal de abertura compartilhado) ----
type AgentCtx = { signal: number; openAgent: () => void }
const AgentContext = createContext<AgentCtx>({ signal: 0, openAgent: () => {} })

export function AgentProvider({ children }: { children: ReactNode }) {
  const [signal, setSignal] = useState(0)
  return (
    <AgentContext.Provider value={{ signal, openAgent: () => setSignal((s) => s + 1) }}>
      {children}
    </AgentContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAgent() {
  return useContext(AgentContext)
}

// ---- Produtos publicados (do banco) ----
// eslint-disable-next-line react-refresh/only-export-components
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("publicado_site", true)
      .order("preco_base", { ascending: false })
      .then(({ data }) => {
        setProducts(data ?? [])
        setLoading(false)
      })
  }, [])
  return { products, loading }
}

// ---- Categorias do catálogo (apresentação) ----
export const PRODUCT_CATS = [
  { key: "todos", label: "Todos", icon: "layers", ativo: true },
  { key: "mob", label: "Mobilidade Elétrica", icon: "box", ativo: true },
  { key: "eletronicos", label: "Eletrônicos", icon: "zap", ativo: false },
  { key: "casa", label: "Casa & Decoração", icon: "home", ativo: false },
  { key: "ferramentas", label: "Ferramentas", icon: "settings", ativo: false },
]

// ---- Captação de lead pública (via Edge Function com service role) ----
export type PublicLeadPayload = {
  nome?: string
  empresa?: string
  cnpj?: string
  email?: string
  whatsapp?: string
  unidade?: string
  demanda?: string
  valor?: string
  origem: "site_chat_ia" | "formulario_site"
  consentimento_lgpd?: boolean
}

export async function createPublicLead(payload: PublicLeadPayload): Promise<{ lead_id: string } | null> {
  const { data, error } = await supabase.functions.invoke("public-lead", { body: payload })
  if (error) {
    console.error("public-lead:", error)
    return null
  }
  return data as { lead_id: string }
}

// ---- Agente conversacional (Claude via Edge Function) ----
export type ChatMsg = { role: "user" | "assistant"; content: string }
export async function callAgent(messages: ChatMsg[]): Promise<{ reply: string; lead_id?: string } | { error: string }> {
  const { data, error } = await supabase.functions.invoke("agent-chat", { body: { messages } })
  if (error) return { error: error.message }
  return data as { reply: string; lead_id?: string }
}
