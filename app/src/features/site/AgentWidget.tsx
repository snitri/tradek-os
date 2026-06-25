import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Icon, Btn } from "@/components/tradek/ui"
import { useLanguage } from "@/lib/i18n"
import { useAgent, callAgent, getVisitorId, type ChatMsg } from "./site-context"

const UNIDADE_META: Record<string, Record<"pt" | "en", { title: string; greeting: string }>> = {
  supply_chain_finance: {
    pt: { title: "Agente Supply Chain Finance", greeting: "Olá! Sou o especialista em Supply Chain Finance da TradeK. Posso ajudar com importação financiada, prazos e condições de crédito para sua operação. Como posso ajudar?" },
    en: { title: "Supply Chain Finance Agent", greeting: "Hello! I'm TradeK's Supply Chain Finance specialist. I can help with financed imports, terms and credit conditions for your operation. How can I help?" },
  },
  procurement: {
    pt: { title: "Agente Procurement Internacional", greeting: "Olá! Sou o especialista em Procurement Internacional da TradeK. Posso ajudar com sourcing de fornecedores, homologação e gestão de compras na China. Por onde começamos?" },
    en: { title: "International Procurement Agent", greeting: "Hello! I'm TradeK's International Procurement specialist. I can help with supplier sourcing, homologation and purchase management in China. Where shall we start?" },
  },
  produtos_motos: {
    pt: { title: "Agente Produtos da China", greeting: "Olá! Sou o especialista em Produtos da China da TradeK. Posso ajudar com nosso catálogo, cotações e condições de revenda. O que você procura?" },
    en: { title: "Products from China Agent", greeting: "Hello! I'm TradeK's Products from China specialist. I can help with our catalog, quotes and resale conditions. What are you looking for?" },
  },
}
const DEFAULT_GREETING = {
  pt: "Olá! Sou o Agente TradeK. Posso ajudar com importação financiada, fornecedores ou produtos da China. Por onde começamos?",
  en: "Hello! I'm the TradeK Agent. I can help with financed imports, suppliers or products from China. Where shall we start?",
}

export function AgentWidget({ unidade }: { unidade?: string }) {
  const { signal } = useAgent()
  const { lang } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const autoOpen = searchParams.get("agent") === "1"
  const [open, setOpen] = useState(autoOpen)
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const startedRef = useRef(false)

  const meta = unidade ? UNIDADE_META[unidade]?.[lang] : undefined
  const greeting = meta?.greeting ?? DEFAULT_GREETING[lang]
  const title = meta?.title ?? (lang === "en" ? "TradeK Agent" : "Agente TradeK")
  const t = lang === "en"
    ? { online: "Online · AI", needData: "Before attaching a document, I need some information from you (name, company, tax ID, etc). Can you share that first?", uploadErr: "Could not send the file. Please try again.", uploadOk: "Got your document, thank you! Our team will review it and reach out about any pending items.", sending: "Sending file…", placeholder: "Type your message…", attach: "Attach document", agentErr: "The agent is being set up. Meanwhile, use the contact form and our team will get back to you. 🙏" }
    : { online: "Online · IA", needData: "Antes de anexar um documento, preciso de alguns dados seus (nome, empresa, CNPJ etc.). Pode me passar essas informações primeiro?", uploadErr: "Não foi possível enviar o arquivo. Tente novamente.", uploadOk: "Recebi seu documento, obrigado! Nossa equipe vai analisar e qualquer pendência adicional entraremos em contato.", sending: "Enviando arquivo…", placeholder: "Digite sua mensagem…", attach: "Anexar documento", agentErr: "O agente está sendo configurado. Enquanto isso, use o formulário de contato e nossa equipe retorna. 🙏" }

  useEffect(() => { if (signal > 0) setOpen(true) }, [signal])
  useEffect(() => {
    if (autoOpen) setSearchParams({}, { replace: true })
  }, [])

  // Troca de divisão: fecha o chat e limpa o histórico para começar do zero (ignora na abertura inicial)
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
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
    const res = await callAgent(next.filter((m) => m.content !== greeting), getVisitorId(), unidade, lang)
    setTyping(false)
    if ("error" in res) {
      setMsgs((m) => [...m, { role: "assistant", content: t.agentErr }])
      return
    }
    setMsgs((m) => [...m, { role: "assistant", content: res.reply }])
    if (res.lead_id) setLeadId(res.lead_id)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!leadId) {
      setMsgs((m) => [...m, { role: "assistant", content: t.needData }])
      return
    }
    setUploading(true)
    const form = new FormData()
    form.append("lead_id", leadId)
    form.append("file", file)
    const { data, error } = await supabase.functions.invoke("public-document-upload", { body: form })
    setUploading(false)
    if (error) {
      toast.error(t.uploadErr)
      return
    }
    const nome = (data as { nome?: string })?.nome ?? file.name
    setMsgs((m) => [...m, { role: "user", content: `📎 ${nome}` }, { role: "assistant", content: t.uploadOk }])
  }

  return (
    <>
      <button onClick={() => setOpen((o) => !o)} aria-label={title}
        style={{ position: "fixed", right: 24, bottom: 24, zIndex: 60, width: 58, height: 58, borderRadius: "50%", background: "var(--lime)", color: "#0A0B0A", display: "grid", placeItems: "center", boxShadow: "0 8px 30px rgba(195,249,41,.32), 0 2px 8px rgba(0,0,0,.4)", transition: ".2s" }}>
        <Icon name={open ? "chevD" : "chat"} size={24} stroke={2.4} />
      </button>

      {open && (
        <div className="fade agent-panel" style={{ position: "fixed", right: 24, bottom: 94, zIndex: 60, width: 380, maxWidth: "calc(100vw - 32px)", height: 560, maxHeight: "calc(100vh - 130px)", background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 70px rgba(0,0,0,.6)" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 11, background: "var(--bg-2)" }}>
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--lime)", color: "#0A0B0A", display: "grid", placeItems: "center" }}><Icon name="zap" size={18} stroke={2.4} /></span>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
              <div className="row gap6" style={{ fontSize: 11, color: "var(--tx-mute)" }}><span className="sdot" style={{ background: "var(--ok)" }}></span> {t.online}</div>
            </div>
            <button className="btn btn--icon" style={{ marginLeft: "auto" }} onClick={() => setOpen(false)}><Icon name="x" size={16} /></button>
          </div>

          <div ref={bodyRef} className="scroll" style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.map((m, i) => m.role === "assistant"
              ? <div key={i} className="fade" style={{ alignSelf: "flex-start", maxWidth: "85%", background: "var(--bg-3)", border: "1px solid var(--line-soft)", padding: "10px 13px", borderRadius: "4px 12px 12px 12px", fontSize: 13.5, lineHeight: 1.5, color: "var(--tx)", whiteSpace: "pre-wrap" }}>{m.content}</div>
              : <div key={i} className="fade" style={{ alignSelf: "flex-end", maxWidth: "85%", background: "var(--lime)", color: "#0A0B0A", padding: "10px 13px", borderRadius: "12px 4px 12px 12px", fontSize: 13.5, lineHeight: 1.5, fontWeight: 600, whiteSpace: "pre-wrap" }}>{m.content}</div>
            )}
            {typing && <div style={{ alignSelf: "flex-start", background: "var(--bg-3)", border: "1px solid var(--line-soft)", padding: "12px 14px", borderRadius: "4px 12px 12px 12px" }}><span className="ag-typing"><i></i><i></i><i></i></span></div>}
            {uploading && <div style={{ alignSelf: "flex-end", fontSize: 11.5, color: "var(--tx-mute)" }}>{t.sending}</div>}
          </div>

          <div style={{ padding: "10px 12px", borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" style={{ display: "none" }} onChange={handleFile} />
            <button className="btn btn--icon btn--dark" type="button" title={t.attach} onClick={() => fileRef.current?.click()} disabled={uploading}><Icon name="paperclip" size={16} /></button>
            <input className="input" autoFocus value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={t.placeholder} disabled={typing} />
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
