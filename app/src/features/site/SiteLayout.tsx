import { Outlet, Link, useLocation } from "react-router-dom"
import { Logo, Icon } from "@/components/tradek/ui"
import { AgentProvider, useAgent } from "./site-context"
import { AgentWidget } from "./AgentWidget"

function SiteNav() {
  const { openAgent } = useAgent()
  const { pathname } = useLocation()
  const links: [string, string][] = [
    ["Supply Chain", "/scf"], ["Procurement", "/proc"], ["Produtos", "/motos"],
    ["Sobre", "/sobre"], ["FAQ", "/faq"], ["Contato", "/contato"],
  ]
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(10,11,10,.82)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 40px", display: "flex", alignItems: "center", gap: 30 }}>
        <Link to="/"><Logo h={22} /></Link>
        <nav className="row gap24" style={{ marginLeft: 18 }}>
          {links.map(([l, h]) => <Link key={l} to={h} style={{ fontSize: 13, fontWeight: 600, color: pathname === h ? "var(--tx)" : "var(--tx-dim)", transition: ".15s" }}>{l}</Link>)}
        </nav>
        <div className="row gap10 mla">
          <Link to="/cliente/login" className="btn btn--ghost btn--sm">Portal do cliente</Link>
          <button className="btn btn--lime btn--sm" onClick={openAgent}><Icon name="chat" size={14} /> Falar com agente</button>
        </div>
      </div>
    </header>
  )
}

function SiteFooter() {
  const cols: [string, string[]][] = [
    ["Soluções", ["Supply Chain Finance", "Procurement Internacional", "Produtos da China"]],
    ["Empresa", ["Sobre a TradeK", "FAQ", "Contato"]],
    ["Legal", ["Política de Privacidade", "Termos de Uso", "LGPD"]],
  ]
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 80, background: "var(--bg-1)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 40px 32px", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 32 }}>
        <div>
          <Logo h={22} />
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, maxWidth: "34ch", marginTop: 16 }}>Hub de negócios internacionais China–Brasil. Importação financiada, procurement e mobilidade elétrica.</p>
        </div>
        {cols.map(([h, items]) => <div key={h}><div className="tag" style={{ marginBottom: 14 }}>{h}</div>{items.map((it) => <a key={it} href="#" style={{ display: "block", fontSize: 13, color: "var(--tx-dim)", padding: "5px 0" }}>{it}</a>)}</div>)}
      </div>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "18px 40px", borderTop: "1px solid var(--line-soft)", display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--tx-mute)" }}>
        <span>© 2026 TradeK · Todos os direitos reservados</span>
        <span className="mono">CHINA → BRASIL · TRADE OPERATIONS</span>
      </div>
    </footer>
  )
}

export function SiteLayout() {
  return (
    <AgentProvider>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <SiteNav />
        <main className="fill"><Outlet /></main>
        <SiteFooter />
        <AgentWidget />
      </div>
    </AgentProvider>
  )
}
