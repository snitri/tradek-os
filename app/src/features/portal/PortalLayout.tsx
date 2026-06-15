import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export function PortalLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate("/portal/login", { replace: true })
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <span className="font-display font-semibold">TradeK · Portal</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{profile?.nome ?? ""}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  )
}
