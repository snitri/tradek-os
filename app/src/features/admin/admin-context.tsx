import { createContext, useContext } from "react"

export type LeadTarget = string | "new" | null

export type AdminCtx = {
  openLead: (id: string | "new") => void
  reloadSignal: number
  triggerReload: () => void
}

export const AdminContext = createContext<AdminCtx | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin(): AdminCtx {
  const c = useContext(AdminContext)
  if (!c) throw new Error("useAdmin precisa estar dentro do AdminLayout")
  return c
}
