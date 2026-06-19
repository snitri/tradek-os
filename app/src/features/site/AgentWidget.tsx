import { useEffect, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Icon, Btn } from "@/components/tradek/ui"
import { useAgent, callAgent, getVisitorId, type ChatMsg } from "./site-context"

const UNIDADE_META: Record<string, { title: string; greeting: string }> = {
  supply_chain_finance: {
    title: "Agente Supply Chain Finance",
    greeting: "Olá! Sou o especialista em Supply Chain Finance da TradeK. Posso ajudar com importação financiada, prazos e condições de crédito para sua operação. Como posso ajudar?",
  },
  procurement: {
    title: "Agente Procurement Internacional",
    greeting: "Olá! Sou o especialista em Procurement Internacional da TradeK. Posso ajudar com sourcing de fornecedores, homologação e gestão de compras na China. Por onde começamos?",
  },
  produtos_motos: {
    title: "Agente Produtos da China",
    greeting: "Olá! Sou o especialista em Produtos da China da TradeK. Posso ajudar com nosso catálogo, cotações e condições de revenda. O que você procura?",
  },
}
const DEFAULT_GREETING = "Olá! Sou o Agente TradeK. Posso ajudar com importação financiada, fornecedores ou produtos da China. Por onde começamos?"

export function AgentWidget({ unidade }: { unidade?: string }) {
  const { signal } = useAgent()
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)

  const meta = unidade ? UNIDADE_META[unidade] : undefined
  const greeting = meta?.greeting ?? DEFAULT_GREETING
  const title = meta?.title ?? "Agente TradeK"

  useEffect(() => { if (signal > 0) setOpen(true) }, [signal])
  useEffect(() => {
    if (searchParams.get("agent") === "1") {
      setOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams])

  // Troca de divisão: fecha o chat e limpa o histórico para começar do zero
  useEffect(() => {
    setOpen(false)
    setMsgs([])
    setLeadId(null)
    startedRef.current = false
  }, [unidade])

  useEffect(() => {
    if (open && !startedRef.current) { startedRef.current = true; setMsgs([{ role: "assistant", content: greeting }]) }
  }, [open])
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight }, [msgs, typing])

  async function send() {
    const text = input.trim()
    if (!text || typing) return
    const next: ChatMsg[] = [...msgs, { role: "user", content: text }]
    setMsgs(next); setInput(""); setTyping(true)
    const res = await callAgent(next.filter((m) => m.content !== greeting), getVisitorId(), unidade)
    setTyping(false)
    if ("error" in res) {
      setMsgs((m) => [...m, { role: "assistant", content: "O agente está sendo configurado. Enquanto isso, use o formulário de contato e nossa equipe retorna. 🙏" }])
      return
    }
    setMsgs((m) => [...m, { role: "assistant", content: res.reply }])
    if (res.lead_id) setLeadId(res.lead_id)
  }

  return (
    <>
      <button onClick={() => setOpen((o) => !o)} aria-label="Agente TradeK"
        style={{ position: "fixed", right: 24, bottom: 24, zIndex: 60, width: 58, height: 58, borderRadius: "50%", background: "var(--lime)", color: "#0A0B0A", display: "grid", placeItems: "center", boxShadow: "0 8px 30px rgba(195,249,41,.32), 0 2px 8px rgba(0,0,0,.4)", transition: ".2s" }}>
        <Icon name={open ? "chevD" : "chat"} size={24} stroke={2.4} />
      </button>

      {open && (
        <div className="fade agent-panel" style={{ position: "fixed", right: 24, bottom: 94, zIndex: 60, width: 380, maxWidth: "calc(100vw - 32px)", height: 560, maxHeight: "calc(100vh - 130px)", background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 70px rgba(0,0,0,.6)" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 11, background: "var(--bg-2)" }}>
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--lime)", color: "#0A0B0A", display: "grid", placeItems: "center" }}><Icon name="zap" size={18} stroke={2.4} /></span>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
              <div className="row gap6" style={{ fontSize: 11, color: "var(--tx-mute)" }}><span className="sdot" style={{ background: "var(--ok)" }}></span> Online · IA</div>
            </div>
            <button className="btn btn--icon" style={{ marginLeft: "auto" }} onClick={() => setOpen(false)}><Icon name="x" size={16} /></button>
          </div>

          <div ref={bodyRef} className="scroll" style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.map((m, i) => m.role === "assistant"
              ? <div key={i} className="fade" style={{ alignSelf: "flex-start", maxWidth: "85%", background: "var(--bg-3)", border: "1px solid var(--line-soft)", padding: "10px 13px", borderRadius: "4px 12px 12px 12px", fontSize: 13.5, lineHeight: 1.5, color: "var(--tx)", whiteSpace: "pre-wrap" }}>{m.content}</div>
              : <div key={i} className="fade" style={{ alignSelf: "flex-end", maxWidth: "85%", background: "var(--lime)", color: "#0A0B0A", padding: "10px 13px", borderRadius: "12px 4px 12px 12px", fontSize: 13.5, lineHeight: 1.5, fontWeight: 600, whiteSpace: "pre-wrap" }}>{m.content}</div>
            )}
            {typing && <div style={{ alignSelf: "flex-start", background: "var(--bg-3)", border: "1px solid var(--line-soft)", padding: "12px 14px", borderRadius: "4px 12px 12px 12px" }}><span className="ag-typing"><i></i><i></i><i></i></span></div>}
            {leadId && <div className="fade" style={{ alignSelf: "stretch", marginTop: 4, display: "flex", gap: 8 }}>
              <Link className="btn btn--ghost" style={{ flex: 1 }} to="/obrigado">Ver confirmação</Link>
              <Link className="btn btn--lime" style={{ flex: 1 }} to="/cliente/login">Portal <Icon name="arrowR" size={14} /></Link>
            </div>}
          </div>

          <div style={{ padding: "10px 12px", borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
            <input className="input" autoFocus value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Digite sua mensagem…" disabled={typing} />
            <Btn variant="lime" className="btn--icon" onClick={send} disabled={typing}><Icon name="send" size={16} /></Btn>
          </div>
        </div>
      )}

      <style>{`
        .ag-typing{ display:inline-flex; gap:4px; }
        .ag-typing i{ width:6px; height:6px; border-radius:50%; background:var(--tx-mute); animation:agb 1s infinite; }
        .ag-typing i:nth-child(2){ animation-delay:.15s; } .ag-typing i:nth-child(3){ animation-delay:.3s; }
        @keyframes agb{ 0%,60%,100%{ opacity:.3; transform:translateY(0);} 30%{ opacity:1; transform:translateY(-3px);} }
      `}</style>
    </>
  )
}
