import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const url = import.meta.env.VITE_SUPABASE_URL as string
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anon) {
  throw new Error("Supabase env ausente: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY")
}

// schema dedicado da plataforma — nunca usa o public do projeto
export const supabase = createClient<Database, "tradek">(url, anon, {
  db: { schema: "tradek" },
  auth: { persistSession: true, autoRefreshToken: true },
})
