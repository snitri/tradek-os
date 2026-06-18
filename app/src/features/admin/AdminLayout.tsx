import { useState } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/auth"
import { useRealtimeNotifications } from "@/lib/notifications"
import { Icon, Logo, Avatar } from "@/components/tradek/ui"
import { AdminContext } from "./admin-context"
import { LeadModal } from "./LeadModal"

const ADMIN_NAV: { g: string; items: [string, string, string][] }[] = [
  { g: "Operação", items: [["dashboard", "Dashboard", "/admin"], ["kanban", "CRM Kanban", "/admin/crm"], ["list", "CRM Lista", "/admin/lista"], ["chat", "Interações", "/admin/interacoes"], ["chart", "Relatórios IA", "/admin/relatorios"]] },
  { g: "Cadastros", items: [["building", "Empresas", "/admin/empresas"], ["users", "Clientes", "/admin/clientes"], ["file", "Documentos", "/admin/documentos"], ["box", "Produtos", "/admin/produtos"], ["target", "Tarefas", "/admin/tarefas"]] },
  { g: "Sistema", items: [["bell", "Notificações", "/admin/notificacoes"], ["brain", "Agentes IA", "/admin/agentes"], ["settings", "Configurações", "/admin/config"]] },
]

export function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [leadOpen, setLeadOpen] = useState<string | "new" | null>(null)
  const [reloadSignal, setReloadSignal] = useState(0)
  const unread = useRealtimeNotifications()

  const title = ADMIN_NAV.flatMap((g) => g.items).find((i) => i[2] === pathname)?.[1] ?? "Dashboard"

  async function handleLogout() {
    await signOut()
    navigate("/admin/login", { replace: true })
  }

  return (
    <AdminContext.Provider value={{ openLead: setLeadOpen, reloadSignal, triggerReload: () => setReloadSignal((s) => s + 1) }}>
      <div style={{ display: "grid", gridTemplateColumns: (collapsed ? "64px" : "232px") + " 1fr", height: "100vh", overflow: "hidden" }}>
        <aside style={{ background: "var(--bg-1)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div className="row center" style={{ padding: "16px 18px", justifyContent: collapsed ? "center" : "space-between", borderBottom: "1px solid var(--line-soft)", minHeight: 57 }}>
            {!collapsed && <Logo h={19} />}
            <button className="btn btn--icon" onClick={() => setCollapsed((c) => !c)} style={{ color: "var(--tx-mute)" }}><Icon name="menu" size={16} /></button>
          </div>
          <div className="scroll" style={{ flex: 1, padding: "12px 10px", overflowX: "hidden" }}>
            {ADMIN_NAV.map((grp) => <div key={grp.g} style={{ marginBottom: 14 }}>
              {!collapsed && <div className="tag" style={{ padding: "6px 10px", color: "var(--tx-faint)" }}>{grp.g}</div>}
              {grp.items.map(([ic, l, h]) => {
                const on = pathname === h
                return <Link key={h} to={h} title={l} className="row center gap10" style={{ padding: collapsed ? "10px 0" : "9px 10px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 6, fontSize: 13, fontWeight: 600, marginBottom: 2, color: on ? "#0A0B0A" : "var(--tx-dim)", background: on ? "var(--lime)" : "transparent", transition: ".12s" }}>
                  <Icon name={ic} size={17} stroke={on ? 2.4 : 2} />{!collapsed && l}
                </Link>
              })}
            </div>)}
          </div>
          <div style={{ borderTop: "1px solid var(--line-soft)", padding: collapsed ? "12px 0" : "12px 14px" }}>
            <button onClick={handleLogout} className="row center gap10" style={{ width: "100%", justifyContent: collapsed ? "center" : "flex-start", color: "var(--tx-mute)", fontSize: 12.5, fontWeight: 600 }}><Icon name="logout" size={16} />{!collapsed && "Sair"}</button>
          </div>
        </aside>

        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <header className="row center" style={{ padding: "0 22px", height: 57, borderBottom: "1px solid var(--line)", background: "var(--bg-1)", gap: 16, flexShrink: 0 }}>
            <div className="row gap8 center"><span className="tag">TradeK OS</span><Icon name="chevR" size={13} style={{ color: "var(--tx-faint)" }} /><span className="disp" style={{ fontSize: 16, fontWeight: 600 }}>{title}</span></div>
            <div className="row center" style={{ marginLeft: 24, flex: 1, maxWidth: 420, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 6, padding: "7px 11px", gap: 8 }}>
              <Icon name="search" size={15} style={{ color: "var(--tx-mute)" }} /><input placeholder="Buscar leads, empresas, documentos…" style={{ background: "none", border: "none", outline: "none", color: "var(--tx)", fontSize: 13, width: "100%" }} />
            </div>
            <div className="row gap10 center mla">
              <button className="btn btn--lime btn--sm" onClick={() => setLeadOpen("new")}><Icon name="plus" size={14} /> Novo lead</button>
              <Link to="/admin/notificacoes" className="btn btn--icon btn--dark" style={{ position: "relative" }}><Icon name="bell" size={16} />{unread > 0 && <span style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 99, background: "var(--lime)", color: "#0A0B0A", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center" }}>{unread > 9 ? "9+" : unread}</span>}</Link>
              <div className="row gap8 center" style={{ paddingLeft: 6 }}><Avatar name={profile?.nome ?? "?"} tone="lime" size={30} /><div style={{ lineHeight: 1.25, whiteSpace: "nowrap" }} className="col"><span style={{ fontSize: 12.5, fontWeight: 700 }}>{profile?.nome ?? "—"}</span><span className="tag">{profile?.role ?? ""}</span></div></div>
            </div>
          </header>
          <main className="scroll fill" style={{ padding: "22px" }}><Outlet /></main>
        </div>
      </div>

      {leadOpen && <LeadModal leadId={leadOpen} onClose={() => setLeadOpen(null)} onChanged={() => setReloadSignal((s) => s + 1)} />}
    </AdminContext.Provider>
  )
}
