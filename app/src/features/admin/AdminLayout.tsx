import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate("/admin/login", { replace: true })
  }

  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="border-r border-border p-4 flex flex-col">
        <span className="font-display font-semibold">TradeK · Admin</span>
        <div className="mt-auto pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2 truncate">
            {profile?.nome ?? "—"} · {profile?.role ?? ""}
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </aside>
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  )
}
