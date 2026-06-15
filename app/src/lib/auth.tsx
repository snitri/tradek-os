import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import type { Database } from "./database.types"

export type Profile = Database["tradek"]["Tables"]["profiles"]["Row"]
export type Role = Database["tradek"]["Enums"]["user_role"]

export const INTERNAL_ROLES: Role[] = [
  "master", "gerente", "comercial", "operacional", "financeiro", "atendimento", "leitura",
]
export function isInternalRole(role: Role | null | undefined): boolean {
  return role != null && role !== "cliente"
}

interface AuthState {
  user: User | null
  profile: Profile | null
  role: Role | null
  companyId: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<Profile | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(uid: string): Promise<Profile | null> {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle()
    setProfile(data ?? null)
    return data ?? null
  }

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      const s = data.session
      setUser(s?.user ?? null)
      if (s?.user) await loadProfile(s.user.id)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return
      setUser(session?.user ?? null)
      if (session?.user) await loadProfile(session.user.id)
      else setProfile(null)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string): Promise<Profile | null> {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    let p: Profile | null = null
    if (data.user) {
      p = await loadProfile(data.user.id)
      void supabase.from("profiles").update({ ultimo_login: new Date().toISOString() }).eq("id", data.user.id)
    }
    return p
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut()
    setProfile(null)
    setUser(null)
  }

  const value: AuthState = {
    user,
    profile,
    role: profile?.role ?? null,
    companyId: profile?.company_id ?? null,
    loading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>")
  return ctx
}
