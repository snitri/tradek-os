import { useEffect, useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { Logo, Icon } from "@/components/tradek/ui"
import { usePick, LanguageSwitch } from "@/lib/i18n"
import { AgentProvider } from "./site-context"
import { AgentWidget } from "./AgentWidget"

const NAV_LINKS_PT: [string, string][] = [
  ["Supply Chain Finance", "/scf"], ["Procurement", "/proc"], ["Produtos", "/motos"],
  ["Quem Somos", "/sobre"], ["FAQ", "/faq"], ["Contato", "/contato"],
]
const NAV_LINKS_EN: [string, string][] = [
  ["Supply Chain Finance", "/scf"], ["Procurement", "/proc"], ["Products", "/motos"],
  ["About Us", "/sobre"], ["FAQ", "/faq"], ["Contact", "/contato"],
]

function SiteNav() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const NAV_LINKS = usePick(NAV_LINKS_PT, NAV_LINKS_EN)
  const t = usePick(
    { portal: "Portal do cliente", whatsapp: "Whatsapp TradeK", open: "Abrir menu", close: "Fechar menu" },
    { portal: "Client portal", whatsapp: "Whatsapp TradeK", open: "Open menu", close: "Close menu" },
  )

  // trava o scroll do body e fecha no Esc enquanto o menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false) }
    window.addEventListener("keydown", onKey)
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey) }
  }, [menuOpen])

  return (
    <>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(10,11,10,.82)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--line)" }}>
        <div className="sec-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 40px", display: "flex", alignItems: "center", gap: 30 }}>
          <Link to="/"><Logo h={22} /></Link>
          <nav className="row gap24 nav-desktop" style={{ marginLeft: 18 }}>
            {NAV_LINKS.map(([l, h]) => <Link key={h} to={h} style={{ fontSize: 13, fontWeight: 600, color: pathname === h ? "var(--tx)" : "var(--tx-dim)", transition: ".15s" }}>{l}</Link>)}
          </nav>
          <div className="row gap10 mla nav-desktop">
            <LanguageSwitch />
            <Link to="/cliente/login" className="btn btn--ghost btn--sm">{t.portal}</Link>
            <a className="btn btn--lime btn--sm" href="https://wa.me/5515997673340" target="_blank" rel="noopener noreferrer"><Icon name="chat" size={14} /> {t.whatsapp}</a>
          </div>
          <button className="nav-burger" aria-label={t.open} onClick={() => setMenuOpen(true)}><Icon name="menu" size={24} /></button>
        </div>
      </header>

      {/* overlay FORA do header — o backdrop-filter do header quebraria o position:fixed */}
      {menuOpen && (
        <div className="nav-overlay">
          <div className="nav-overlay-head">
            <Link to="/" onClick={() => setMenuOpen(false)}><Logo h={24} /></Link>
            <div className="row gap10 center">
              <LanguageSwitch />
              <button className="btn btn--icon btn--dark" aria-label={t.close} onClick={() => setMenuOpen(false)}><Icon name="x" size={20} /></button>
            </div>
          </div>
          <nav className="nav-overlay-links">
            {NAV_LINKS.map(([l, h]) => <Link key={h} to={h} onClick={() => setMenuOpen(false)}>{l}</Link>)}
          </nav>
          <div className="nav-overlay-cta">
            <Link to="/cliente/login" className="btn btn--ghost" onClick={() => setMenuOpen(false)}>{t.portal}</Link>
            <a className="btn btn--lime" href="https://wa.me/5515997673340" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}><Icon name="chat" size={16} /> {t.whatsapp}</a>
          </div>
        </div>
      )}
    </>
  )
}

function SiteFooter() {
  const cols = usePick<[string, string[]][]>(
    [
      ["Soluções", ["Supply Chain Finance", "Procurement Internacional", "Produtos da China"]],
      ["Empresa", ["Sobre a TradeK", "FAQ", "Contato"]],
      ["Legal", ["Política de Privacidade", "Termos de Uso", "LGPD"]],
    ],
    [
      ["Solutions", ["Supply Chain Finance", "International Procurement", "Products from China"]],
      ["Company", ["About TradeK", "FAQ", "Contact"]],
      ["Legal", ["Privacy Policy", "Terms of Use", "LGPD"]],
    ],
  )
  const t = usePick(
    { desc: "Hub de negócios internacionais China–Brasil. Importação financiada, procurement e mobilidade elétrica.", rights: "Todos os direitos reservados", dev: "Desenvolvido por" },
    { desc: "China–Brazil international trade hub. Financed imports, procurement and electric mobility.", rights: "All rights reserved", dev: "Developed by" },
  )
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 80, background: "var(--bg-1)" }}>
      <div className="g-2m sec-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 40px 32px", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 32 }}>
        <div>
          <Logo h={22} />
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, maxWidth: "34ch", marginTop: 16 }}>{t.desc}</p>
        </div>
        {cols.map(([h, items]) => <div key={h}><div className="tag" style={{ marginBottom: 14 }}>{h}</div>{items.map((it) => <a key={it} href="#" style={{ display: "block", fontSize: 13, color: "var(--tx-dim)", padding: "5px 0" }}>{it}</a>)}</div>)}
      </div>
      <div className="sec-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "18px 40px", borderTop: "1px solid var(--line-soft)", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 12, color: "var(--tx-mute)" }}>
        <span>© 2026 TradeK · {t.rights}<br />{t.dev} <a href="https://www.flowia.tec.br" target="_blank" rel="noopener noreferrer" style={{ color: "var(--lime)", textDecoration: "none" }}>Flow IA</a></span>
        <span className="mono">CHINA → BRASIL · TRADE OPERATIONS</span>
      </div>
    </footer>
  )
}

const ROUTE_UNIDADE: Record<string, string> = {
  "/scf": "supply_chain_finance",
  "/proc": "procurement",
  "/motos": "produtos_motos",
}

export function SiteLayout() {
  const { pathname } = useLocation()
  const unidade = ROUTE_UNIDADE[pathname]
  return (
    <AgentProvider>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <SiteNav />
        <main className="fill"><Outlet /></main>
        <SiteFooter />
        {unidade && <AgentWidget unidade={unidade} />}
      </div>
    </AgentProvider>
  )
}
