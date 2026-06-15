import { Link } from "react-router-dom"

const surfaces = [
  { to: "/site", title: "Site Público", desc: "Home, unidades, FAQ e Agente TradeK." },
  { to: "/admin", title: "Painel Admin", desc: "CRM, documentos, relatórios IA, config." },
  { to: "/portal", title: "Área do Cliente", desc: "Documentos, ficha, chat e acompanhamento." },
]

export function Launcher() {
  return (
    <div className="min-h-screen flex flex-col justify-center max-w-4xl mx-auto px-10">
      <span className="font-mono text-xs tracking-widest text-lime uppercase">TradeK OS</span>
      <h1 className="font-display text-5xl font-semibold mt-4 leading-none">
        O sistema operacional do trade <span className="text-lime">China–Brasil.</span>
      </h1>
      <div className="grid grid-cols-3 gap-4 mt-10">
        {surfaces.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="border border-border rounded-md p-5 hover:border-white/20 transition"
          >
            <div className="font-display text-lg font-semibold">{s.title}</div>
            <div className="text-sm text-muted-foreground mt-2">{s.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
