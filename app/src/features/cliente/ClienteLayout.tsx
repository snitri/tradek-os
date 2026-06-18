import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/auth"
import { useRealtimeNotifications } from "@/lib/notifications"
import { Logo, Icon, Avatar } from "@/components/tradek/ui"

const CLIENT_NAV: [string, string, string][] = [
  ["home", "Início", "/cliente"],
  ["layers", "Oportunidades", "/cliente/oportunidades"],
  ["file", "Documentos", "/cliente/checklist"],
  ["building", "Ficha cadastral", "/cliente/ficha"],
  ["chat", "Mensagens", "/cliente/chat"],
  ["bell", "Notificações", "/cliente/notificacoes"],
]

export function ClienteLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const unread = useRealtimeNotifications()

  async function handleLogout() {
    await signOut()
    navigate("/cliente/login", { replace: true })
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(10,11,10,.85)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 32px", display: "flex", alignItems: "center", gap: 20 }}>
          <Link to="/cliente"><Logo h={20} /></Link>
          <span className="pill pill--lime" style={{ fontSize: 10 }}>Portal do cliente</span>
          <nav className="row gap2 mla">{CLIENT_NAV.map(([ic, l, h]) => {
            const on = pathname === h || (h === "/cliente/checklist" && pathname === "/cliente/upload")
            return <Link key={h} to={h} className="row gap8 center" style={{ position: "relative", padding: "8px 12px", borderRadius: 6, fontSize: 12.5, fontWeight: 600, color: on ? "var(--tx)" : "var(--tx-mute)", background: on ? "rgba(255,255,255,.05)" : "transparent" }}><Icon name={ic} size={14} />{l}{h === "/cliente/notificacoes" && unread > 0 && <span style={{ minWidth: 16, height: 16, padding: "0 4px", borderRadius: 99, background: "var(--lime)", color: "#0A0B0A", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center" }}>{unread > 9 ? "9+" : unread}</span>}</Link>
          })}</nav>
          <Link to="/cliente/perfil" className="row gap10 center" style={{ paddingLeft: 8, borderLeft: "1px solid var(--line)" }}>
            <Avatar name={profile?.nome ?? "?"} size={28} tone="lime" />
            <div className="col" style={{ lineHeight: 1.2 }}><span style={{ fontSize: 12.5, fontWeight: 700 }}>{(profile?.nome ?? "Cliente").split(" ")[0]}</span><span className="tag">Conta</span></div>
          </Link>
          <button className="btn btn--icon" onClick={handleLogout} title="Sair" style={{ color: "var(--tx-mute)" }}><Icon name="logout" size={16} /></button>
        </div>
      </header>
      <main className="fill" style={{ maxWidth: 1100, margin: "0 auto", padding: "32px", width: "100%" }}><Outlet /></main>
      <footer style={{ borderTop: "1px solid var(--line-soft)", padding: "18px 32px", textAlign: "center", fontSize: 11.5, color: "var(--tx-mute)" }}>© 2026 TradeK · Ambiente seguro · <Link to="/" className="lime">Site público</Link></footer>
    </div>
  )
}
