import { useEffect, useState } from "react"
import { toast } from "sonner"
import { supabase } from "./supabase"
import { useAuth } from "./auth"

// Realtime (Plano 08): escuta INSERTs em tradek.notifications do próprio usuário (RLS gateia),
// mostra um toast ao vivo e mantém a contagem de não lidas para o sininho.
export function useRealtimeNotifications(): number {
  const { user } = useAuth()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user) { setUnread(0); return }

    // contagem inicial de não lidas
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("lida", false)
      .then(({ count }) => setUnread(count ?? 0))

    const ch = supabase
      .channel("notif-" + user.id)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "tradek", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as { mensagem?: string }
          if (n?.mensagem) toast(n.mensagem, { icon: "🔔" })
          setUnread((u) => u + 1)
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [user])

  return unread
}
