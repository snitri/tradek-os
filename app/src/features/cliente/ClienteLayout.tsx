import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/auth"
import { Logo, Icon } from "@/components/tradek/ui"

export function ClienteLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate("/cliente/login", { replace: true })
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 40, background: "rgba(10,11,10,.82)",
        backdropFilter: "blur(14px)", borderBottom: "1px solid var(--line)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 32px", display: "flex", alignItems: "center", gap: 16 }}>
          <Logo h={20} />
          <span className="tag">Portal do cliente</span>
          <div className="row gap12 mla center">
            <span className="muted" style={{ fontSize: 13 }}>{profile?.nome ?? ""}</span>
            <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
              <Icon name="logout" size={13} /> Sair
            </button>
          </div>
        </div>
      </header>
      <main className="fill" style={{ maxWidth: 1100, margin: "0 auto", padding: "32px", width: "100%" }}>
        <Outlet />
      </main>
    </div>
  )
}
