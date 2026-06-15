// TradeK OS — primitivos compartilhados (portados de ui.jsx do protótipo)
import type { CSSProperties, ButtonHTMLAttributes } from "react"

const LOGO = "/tradek-logo.png"

export const ICONS: Record<string, string> = {
  dashboard: "M3 13h8V3H3v10zM13 21h8V3h-8v18zM3 21h8v-6H3v6z",
  kanban: "M6 4v10M12 4v16M18 4v7",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  building: "M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  chart: "M3 3v18h18M18 17V9M13 17V5M8 17v-3",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35",
  plus: "M12 5v14M5 12h14",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  chevR: "M9 18l6-6-6-6",
  chevL: "M15 18l-6-6 6-6",
  chevD: "M6 9l6 6 6-6",
  arrowR: "M5 12h14M12 5l7 7-7 7",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  box: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12l8.73-5.04M12 22V12",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  doc: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  paperclip: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  ship: "M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M4 18l-1-7h18l-1 7M12 11V5M9 5h6M12 2v3",
  coins: "M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  more: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  external: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  trend: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  lock: "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  menu: "M3 12h18M3 6h18M3 18h18",
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
}

export function Icon({ name, size = 16, stroke = 2, style, className }: {
  name: string; size?: number; stroke?: number; style?: CSSProperties; className?: string
}) {
  const d = ICONS[name] || ICONS.box
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d.split(" M").map((seg, i) => <path key={i} d={(i ? "M" : "") + seg} />)}
    </svg>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "lime" | "ghost" | "dark" | "danger"
  size?: "sm"
  icon?: string
  iconR?: string
}
export function Btn({ children, variant = "dark", size, icon, iconR, className = "", ...p }: BtnProps) {
  return (
    <button className={`btn btn--${variant} ${size ? "btn--" + size : ""} ${className}`} {...p}>
      {icon && <Icon name={icon} size={size === "sm" ? 13 : 15} />}
      {children}
      {iconR && <Icon name={iconR} size={size === "sm" ? 13 : 15} />}
    </button>
  )
}

export function Pill({ children, variant, className = "" }: {
  children: React.ReactNode; variant?: string; className?: string
}) {
  return <span className={`pill ${variant ? "pill--" + variant : ""} ${className}`}>{children}</span>
}

export function Logo({ h = 22, className = "" }: { h?: number; className?: string }) {
  return <img src={LOGO} style={{ height: h }} className={className} alt="TradeK" />
}

export function Score({ v, size = 13 }: { v: number; size?: number }) {
  const c = v >= 80 ? "var(--lime)" : v >= 60 ? "var(--warn)" : "var(--danger)"
  return <span className="mono" style={{ color: c, fontWeight: 700, fontSize: size }}>{v}</span>
}

export function Avatar({ name, size = 28, tone }: { name?: string; size?: number; tone?: string }) {
  const init = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
  const tones: Record<string, string> = {
    lime: "var(--lime)", info: "var(--info)", warn: "var(--warn)", purple: "var(--purple)", danger: "var(--danger)",
  }
  const bg = tone ? tones[tone] : "var(--bg-4)"
  const fg = tone ? "#0A0B0A" : "var(--tx-dim)"
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%", background: bg, color: fg,
      display: "grid", placeItems: "center", fontSize: size * 0.36, fontWeight: 700,
      flexShrink: 0, fontFamily: "var(--sans)",
    }}>{init}</span>
  )
}

export const UNITS: Record<string, { label: string; short: string; icon: string; color: string; unidade: string }> = {
  SCF: { label: "Supply Chain Finance", short: "SCF", icon: "coins", color: "var(--lime)", unidade: "supply_chain_finance" },
  PROC: { label: "Procurement Internacional", short: "Procurement", icon: "globe", color: "var(--info)", unidade: "procurement" },
  MOTOS: { label: "Produtos da China", short: "Produtos", icon: "box", color: "var(--warn)", unidade: "produtos_motos" },
}
