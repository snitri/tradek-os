import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import { Icon, Btn, Pill, Avatar } from "@/components/tradek/ui"
import { useMyLeads, useMyDocs, useMyNotifications, useClientPipeline, type CLead, type Pipeline } from "./cliente-data"

function clientLabel(statuses: Pipeline[], key: string) {
  return statuses.find((s) => s.key === key)?.label_cliente ?? key
}
function leadTitulo(l: CLead) {
  return l.produto_servico_interesse || (l.companies?.nome_fantasia || l.companies?.razao_social || "Solicitação")
}
const PEND_DOC = ["solicitado", "reprovado", "reenvio_solicitado"]

/* ---------------- DASHBOARD ---------------- */
export function ClientDashboard() {
  const { profile } = useAuth()
  const { leads } = useMyLeads()
  const { docs } = useMyDocs()
  const statuses = useClientPipeline()
  const [msgs, setMsgs] = useState<{ id: string; autor_tipo: string; mensagem: string | null; created_at: string }[]>([])
  const lead = leads[0]
  useEffect(() => {
    if (!lead) return
    supabase.from("interactions").select("id,autor_tipo,mensagem,created_at").eq("lead_id", lead.id).eq("visivel_cliente", true).order("created_at", { ascending: false }).limit(2).then(({ data }) => setMsgs(data ?? []))
  }, [lead])
  const pend = docs.filter((d) => PEND_DOC.includes(d.status))
  const nome = (profile?.nome ?? "").split(" ")[0] || "cliente"

  if (!lead) return <div className="fade"><h1 className="disp" style={{ fontSize: 26, fontWeight: 600 }}>Olá, {nome} 👋</h1><p className="muted" style={{ marginTop: 8 }}>Você ainda não tem uma oportunidade ativa. A equipe TradeK vinculará sua solicitação em breve.</p></div>

  return (
    <div className="fade">
      <div className="row center gap8"><span style={{ fontSize: 13, color: "var(--tx-mute)" }}>Olá,</span><h1 className="disp" style={{ fontSize: 26, fontWeight: 600, margin: 0 }}>{nome} 👋</h1></div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginTop: 20 }}>
        <div className="panel" style={{ overflow: "hidden" }}>
          <div className="panel-b" style={{ background: "linear-gradient(180deg,rgba(195,249,41,.05),transparent)" }}>
            <div className="row center gap8"><span className="pill pill--lime"><Icon name="coins" size={12} />Sua solicitação</span><span className="tag mla">{lead.id.slice(0, 8)}</span></div>
            <h2 className="disp" style={{ fontSize: 21, fontWeight: 600, margin: "14px 0 0" }}>{leadTitulo(lead)}</h2>
            <div className="row gap20" style={{ marginTop: 18 }}>
              <div><div className="tag">Status atual</div><div className="row gap6 center" style={{ marginTop: 4 }}><span className="sdot" style={{ background: "var(--purple)" }}></span><span style={{ fontSize: 14, fontWeight: 700 }}>{clientLabel(statuses, lead.status)}</span></div></div>
              {lead.valor_estimado && <div><div className="tag">Valor</div><div className="mono" style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{lead.moeda} {Number(lead.valor_estimado).toLocaleString("pt-BR")}</div></div>}
            </div>
          </div>
          <div className="panel-b" style={{ borderTop: "1px solid var(--line-soft)", background: "var(--bg-2)" }}>
            <div className="row gap8 center" style={{ marginBottom: 4 }}><Icon name="target" size={15} style={{ color: "var(--lime)" }} /><span className="tag" style={{ color: "var(--lime)" }}>Próximo passo</span></div>
            <p style={{ fontSize: 14, margin: "0 0 14px", fontWeight: 500 }}>{pend.length ? "Envie os documentos pendentes para avançarmos com a análise." : "Acompanhe o andamento. A equipe TradeK retornará com o próximo passo."}</p>
            <Link to="/cliente/checklist" className="btn btn--lime btn--sm"><Icon name="upload" size={13} /> Documentos</Link>
          </div>
        </div>
        <div className="col gap14">
          <div className="panel">
            <div className="panel-h"><h3>Pendências</h3><span className="pill pill--warn">{pend.length}</span></div>
            <div className="panel-b col gap10" style={{ padding: "12px 14px" }}>
              {pend.length ? pend.map((d) => <div key={d.id} className="row center gap10" style={{ fontSize: 13 }}><span style={{ width: 16, height: 16, border: "1.5px solid " + (d.status === "reprovado" ? "var(--danger)" : "var(--warn)"), borderRadius: 4, flexShrink: 0 }}></span><span style={{ flex: 1 }}>{d.tipo_documento}</span><Link to="/cliente/upload" className="lime" style={{ fontSize: 11.5, fontWeight: 700 }}>Enviar</Link></div>) : <span className="muted" style={{ fontSize: 13 }}>Sem pendências.</span>}
            </div>
          </div>
          <div className="panel panel-b col gap8">
            <div className="tag" style={{ marginBottom: 4 }}>Atalhos</div>
            <Link to="/cliente/chat" className="row gap10 center" style={{ fontSize: 13, fontWeight: 600, padding: "8px 0" }}><Icon name="chat" size={15} style={{ color: "var(--lime)" }} />Falar com a TradeK<Icon name="chevR" size={14} style={{ marginLeft: "auto", color: "var(--tx-faint)" }} /></Link>
            <div className="hr"></div>
            <Link to="/cliente/ficha" className="row gap10 center" style={{ fontSize: 13, fontWeight: 600, padding: "8px 0" }}><Icon name="building" size={15} style={{ color: "var(--lime)" }} />Ficha cadastral<Icon name="chevR" size={14} style={{ marginLeft: "auto", color: "var(--tx-faint)" }} /></Link>
          </div>
        </div>
      </div>
      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panel-h"><h3>Mensagens recentes</h3><Link to="/cliente/chat" className="lime" style={{ fontSize: 11.5, fontWeight: 700 }}>Ver tudo</Link></div>
        <div className="panel-b col gap10">
          {msgs.length ? msgs.map((m) => <div key={m.id} className="row gap10"><Avatar name={m.autor_tipo === "cliente" ? (profile?.nome ?? "Você") : "TradeK"} size={28} tone={m.autor_tipo === "cliente" ? undefined : "lime"} /><div className="col" style={{ lineHeight: 1.45 }}><span style={{ fontSize: 12.5 }}><b>{m.autor_tipo === "cliente" ? "Você" : "TradeK"}</b> · <span className="tag">{new Date(m.created_at).toLocaleDateString("pt-BR")}</span></span><span className="muted" style={{ fontSize: 13 }}>{m.mensagem}</span></div></div>) : <span className="muted" style={{ fontSize: 13 }}>Nenhuma mensagem ainda.</span>}
        </div>
      </div>
    </div>
  )
}

/* ---------------- OPORTUNIDADES ---------------- */
export function ClientOportunidades() {
  const { leads } = useMyLeads()
  const statuses = useClientPipeline()
  return (
    <div className="fade">
      <h1 className="disp" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 4px" }}>Minhas oportunidades</h1>
      <p className="muted" style={{ fontSize: 13.5, margin: "0 0 22px" }}>Acompanhe o andamento das suas solicitações.</p>
      <div className="col gap12">
        {leads.map((l) => (
          <div key={l.id} className="panel panel-b row center gap16">
            <span style={{ width: 46, height: 46, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--lime)", flexShrink: 0 }}><Icon name="coins" size={22} /></span>
            <div className="col fill" style={{ lineHeight: 1.4 }}>
              <div className="row gap8 center"><span className="disp" style={{ fontSize: 16, fontWeight: 600 }}>{leadTitulo(l)}</span><span className="tag">· {l.id.slice(0, 8)}</span></div>
              <span className="muted" style={{ fontSize: 13 }}>Atualizado {new Date(l.updated_at ?? l.created_at).toLocaleDateString("pt-BR")}</span>
            </div>
            <span className="pill" style={{ borderColor: "var(--purple)", color: "var(--purple)" }}><span className="dot"></span>{clientLabel(statuses, l.status)}</span>
            <Link to="/cliente/checklist" className="btn btn--dark btn--sm" style={{ flexShrink: 0 }}>Abrir <Icon name="arrowR" size={13} /></Link>
          </div>
        ))}
        {leads.length === 0 && <span className="muted" style={{ fontSize: 13 }}>Nenhuma oportunidade ativa.</span>}
      </div>
    </div>
  )
}

/* ---------------- CHECKLIST ---------------- */
const DOC_VIS: Record<string, { label: string; variant?: string }> = {
  solicitado: { label: "Pendente", variant: "warn" }, enviado: { label: "Enviado", variant: "info" },
  em_revisao: { label: "Em revisão", variant: "info" }, aprovado: { label: "Aprovado", variant: "ok" },
  reprovado: { label: "Reprovado", variant: "danger" }, reenvio_solicitado: { label: "Reenviar", variant: "warn" },
}
export function ClientChecklist() {
  const { docs } = useMyDocs()
  const aprov = docs.filter((d) => d.status === "aprovado").length
  return (
    <div className="fade">
      <Link to="/cliente" className="row gap6 faint" style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 16 }}><Icon name="chevL" size={14} /> Início</Link>
      <div className="row center" style={{ justifyContent: "space-between" }}>
        <div><h1 className="disp" style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Documentos</h1><p className="muted" style={{ fontSize: 13.5, margin: "4px 0 0" }}>Envie e acompanhe seus documentos.</p></div>
        <div className="col" style={{ textAlign: "right" }}><div className="tag">Aprovados</div><div className="disp lime" style={{ fontSize: 22, fontWeight: 600 }}>{aprov} / {docs.length}</div></div>
      </div>
      <div style={{ height: 6, background: "var(--bg-3)", borderRadius: 99, margin: "18px 0 22px" }}><div style={{ height: "100%", width: (docs.length ? (aprov / docs.length) * 100 : 0) + "%", background: "var(--lime)", borderRadius: 99 }}></div></div>
      <div className="col gap10">
        {docs.map((d) => {
          const s = DOC_VIS[d.status] ?? { label: d.status }
          return (
            <div key={d.id} className="panel panel-b">
              <div className="row center gap14">
                <span style={{ width: 38, height: 38, borderRadius: 9, background: "var(--bg)", display: "grid", placeItems: "center", flexShrink: 0, color: d.status === "aprovado" ? "var(--ok)" : d.status === "reprovado" ? "var(--danger)" : "var(--tx-mute)" }}><Icon name={d.status === "aprovado" ? "check" : "doc"} size={18} /></span>
                <div className="col fill" style={{ lineHeight: 1.4, minWidth: 0 }}><span style={{ fontSize: 14, fontWeight: 600 }}>{d.tipo_documento}</span><span className="muted" style={{ fontSize: 12.5 }}>{d.descricao}</span></div>
                <Pill variant={s.variant}>{s.label}</Pill>
                {PEND_DOC.includes(d.status) ? <Link to={`/cliente/upload?req=${d.id}`} className="btn btn--lime btn--sm" style={{ flexShrink: 0 }}><Icon name="upload" size={13} /> Enviar</Link> : <button className="btn btn--dark btn--sm" style={{ flexShrink: 0 }}><Icon name="eye" size={13} /></button>}
              </div>
            </div>
          )
        })}
        {docs.length === 0 && <span className="muted" style={{ fontSize: 13 }}>Nenhum documento solicitado ainda.</span>}
      </div>
    </div>
  )
}

/* ---------------- UPLOAD ---------------- */
export function ClientUpload() {
  const { companyId } = useAuth()
  const { leads } = useMyLeads()
  const { docs } = useMyDocs()
  const [reqId, setReqId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const pend = docs.filter((d) => PEND_DOC.includes(d.status))
  const lead = leads[0]

  async function upload() {
    if (!file || !companyId) return toast.error("Selecione um arquivo.")
    setBusy(true)
    try {
      const req = docs.find((d) => d.id === reqId) ?? pend[0]
      const path = `${companyId}/${lead?.id ?? "geral"}/${Date.now()}_${file.name}`
      const { error: upErr } = await supabase.storage.from("tradek-documents").upload(path, file)
      if (upErr) throw upErr
      await supabase.from("documents").insert({
        request_id: req?.id ?? null, company_id: companyId, lead_id: lead?.id ?? null,
        tipo_documento: req?.tipo_documento ?? "Documento", nome_original: file.name,
        storage_key: path, status: "enviado", tamanho: file.size, mime: file.type,
      })
      if (req) await supabase.from("document_requests").update({ status: "enviado" }).eq("id", req.id)
      if (lead) await supabase.from("interactions").insert({ lead_id: lead.id, canal: "portal", tipo: "upload", autor_tipo: "cliente", mensagem: `Documento enviado: ${req?.tipo_documento ?? file.name}`, visivel_cliente: false })
      setDone(true)
    } catch (e) {
      toast.error("Falha no envio: " + String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fade" style={{ maxWidth: 620, margin: "0 auto" }}>
      <Link to="/cliente/checklist" className="row gap6 faint" style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 16 }}><Icon name="chevL" size={14} /> Documentos</Link>
      <h1 className="disp" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 22px" }}>Enviar documento</h1>
      {!done ? (
        <div className="panel panel-b">
          <div className="field"><label>Tipo de documento</label>
            <select className="select" value={reqId} onChange={(e) => setReqId(e.target.value)}>
              <option value="">Selecione…</option>
              {pend.map((d) => <option key={d.id} value={d.id}>{d.tipo_documento}</option>)}
            </select>
          </div>
          <label style={{ display: "block", marginTop: 16, border: "1.5px dashed " + (file ? "var(--lime)" : "var(--line-strong)"), borderRadius: 10, padding: "34px 20px", textAlign: "center", cursor: "pointer", background: file ? "rgba(195,249,41,.04)" : "transparent" }}>
            <input type="file" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <Icon name="upload" size={28} style={{ color: file ? "var(--lime)" : "var(--tx-mute)" }} />
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>{file?.name || "Clique para selecionar o arquivo"}</div>
            <div className="tag" style={{ marginTop: 6 }}>PDF · JPG · PNG · DOCX · XLSX · até 10MB</div>
          </label>
          <Btn variant="lime" className="btn--block" style={{ marginTop: 16 }} disabled={!file || busy} onClick={upload} icon="check">{busy ? "Enviando…" : "Confirmar envio"}</Btn>
        </div>
      ) : (
        <div className="panel panel-b" style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--lime-dim)", border: "1px solid var(--lime-dim2)", display: "grid", placeItems: "center", margin: "0 auto" }}><Icon name="check" size={28} style={{ color: "var(--lime)" }} /></div>
          <h2 className="disp" style={{ fontSize: 20, fontWeight: 600, margin: "20px 0 6px" }}>Documento enviado!</h2>
          <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>A equipe TradeK foi notificada e vai revisar seu documento.</p>
          <Link to="/cliente/checklist" className="btn btn--lime" style={{ marginTop: 20 }}>Voltar aos documentos</Link>
        </div>
      )}
    </div>
  )
}

/* ---------------- FICHA CADASTRAL ---------------- */
export function ClientFicha() {
  const { companyId } = useAuth()
  const [company, setCompany] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!companyId) return
    supabase.from("companies").select("razao_social,nome_fantasia,cnpj,inscricao_estadual,cnae_principal,site").eq("id", companyId).maybeSingle().then(({ data }) => {
      if (data) setCompany(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, (v as string) ?? ""])))
    })
  }, [companyId])
  const set = (k: string, v: string) => setCompany((s) => ({ ...s, [k]: v }))

  async function save() {
    if (!companyId) return
    setBusy(true)
    const { error } = await supabase.from("companies").update({
      razao_social: company.razao_social || null, nome_fantasia: company.nome_fantasia || null,
      cnpj: company.cnpj || null, inscricao_estadual: company.inscricao_estadual || null,
      cnae_principal: company.cnae_principal || null, site: company.site || null,
    }).eq("id", companyId)
    setBusy(false)
    if (error) return toast.error("Erro ao salvar: " + error.message)
    toast.success("Ficha salva.")
  }

  const fields: [string, string][] = [
    ["razao_social", "Razão social"], ["nome_fantasia", "Nome fantasia"], ["cnpj", "CNPJ"],
    ["inscricao_estadual", "Inscrição estadual"], ["cnae_principal", "CNAE principal"], ["site", "Site"],
  ]
  return (
    <div className="fade">
      <div className="row center" style={{ justifyContent: "space-between" }}>
        <div><h1 className="disp" style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Ficha cadastral</h1><p className="muted" style={{ fontSize: 13.5, margin: "4px 0 0" }}>Mantenha os dados da sua empresa atualizados.</p></div>
        <Btn variant="lime" size="sm" icon="check" disabled={busy} onClick={save}>{busy ? "Salvando…" : "Salvar"}</Btn>
      </div>
      <div className="panel panel-b" style={{ marginTop: 22 }}>
        <h3 className="disp" style={{ fontSize: 17, fontWeight: 600, margin: "0 0 18px" }}>Dados da empresa</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {fields.map(([k, l]) => <div key={k} className="field" style={k === "razao_social" ? { gridColumn: "span 2" } : undefined}><label>{l}</label><input className="input" value={company[k] ?? ""} onChange={(e) => set(k, e.target.value)} placeholder={l} /></div>)}
        </div>
      </div>
    </div>
  )
}

/* ---------------- CHAT ---------------- */
export function ClientChat() {
  const { profile } = useAuth()
  const { leads } = useMyLeads()
  const lead = leads[0]
  const [msgs, setMsgs] = useState<{ id: string; autor_tipo: string; mensagem: string | null; created_at: string }[]>([])
  const [input, setInput] = useState("")
  useEffect(() => {
    if (!lead) return
    supabase.from("interactions").select("id,autor_tipo,mensagem,created_at").eq("lead_id", lead.id).eq("visivel_cliente", true).order("created_at").then(({ data }) => setMsgs(data ?? []))
  }, [lead])

  async function send() {
    if (!input.trim() || !lead) return
    const msg = input.trim()
    setInput("")
    const { data } = await supabase.from("interactions").insert({ lead_id: lead.id, canal: "portal", tipo: "mensagem", autor_tipo: "cliente", mensagem: msg, visivel_cliente: true }).select("id,autor_tipo,mensagem,created_at").single()
    if (data) setMsgs((m) => [...m, data])
  }

  return (
    <div className="fade" style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 className="disp" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 16px" }}>Mensagens</h1>
      <div className="panel" style={{ display: "flex", flexDirection: "column", height: "62vh" }}>
        <div className="panel-h"><div className="row gap10 center"><Avatar name="TradeK" tone="lime" size={32} /><div className="col" style={{ lineHeight: 1.25 }}><span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--tx)" }}>Equipe TradeK</span><span className="row gap6 center tag"><span className="sdot" style={{ background: "var(--ok)" }}></span>Online</span></div></div></div>
        <div className="scroll fill col gap12" style={{ padding: 18, background: "var(--bg)" }}>
          {msgs.map((m) => m.autor_tipo !== "cliente"
            ? <div key={m.id} className="row gap10" style={{ alignSelf: "flex-start", maxWidth: "80%" }}><Avatar name="TradeK" tone="lime" size={28} /><div style={{ background: "var(--bg-3)", border: "1px solid var(--line-soft)", padding: "10px 13px", borderRadius: "4px 12px 12px 12px", fontSize: 13.5, lineHeight: 1.5 }}>{m.mensagem}<div className="tag" style={{ marginTop: 4 }}>{new Date(m.created_at).toLocaleString("pt-BR")}</div></div></div>
            : <div key={m.id} style={{ alignSelf: "flex-end", maxWidth: "80%", background: "var(--lime)", color: "#0A0B0A", padding: "10px 13px", borderRadius: "12px 4px 12px 12px", fontSize: 13.5, fontWeight: 500 }}>{m.mensagem}<div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, fontWeight: 700 }}>{new Date(m.created_at).toLocaleString("pt-BR")}</div></div>)}
          {msgs.length === 0 && <span className="muted" style={{ fontSize: 13, alignSelf: "center" }}>Inicie uma conversa com a equipe TradeK.</span>}
        </div>
        <div className="row gap8" style={{ padding: 12, borderTop: "1px solid var(--line)" }}>
          <input className="input fill" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={lead ? "Digite sua mensagem…" : "Sem oportunidade ativa"} disabled={!lead} />
          <Btn variant="lime" onClick={send} disabled={!lead}><Icon name="send" size={16} /></Btn>
        </div>
      </div>
      {!lead && <p className="muted" style={{ fontSize: 12.5, textAlign: "center", marginTop: 10 }}>{profile?.nome}, sua oportunidade ainda não foi vinculada.</p>}
    </div>
  )
}

/* ---------------- NOTIFICAÇÕES ---------------- */
export function ClientNotificacoes() {
  const notifs = useMyNotifications()
  async function markAll() {
    await supabase.from("notifications").update({ lida: true }).eq("lida", false)
    toast.success("Marcadas como lidas.")
  }
  return (
    <div className="fade" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div className="row center" style={{ justifyContent: "space-between", marginBottom: 18 }}><h1 className="disp" style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Notificações</h1><button className="btn btn--dark btn--sm" onClick={markAll}>Marcar todas como lidas</button></div>
      <div className="col gap8">
        {notifs.map((n) => (
          <div key={n.id} className="panel panel-b row gap14" style={{ borderColor: !n.lida ? "var(--lime-dim2)" : "var(--line)" }}>
            <span style={{ width: 38, height: 38, borderRadius: 9, background: "var(--bg)", display: "grid", placeItems: "center", color: "var(--lime)", flexShrink: 0 }}><Icon name="bell" size={17} /></span>
            <div className="col fill" style={{ lineHeight: 1.4 }}><span style={{ fontSize: 14, fontWeight: 600 }}>{n.tipo}</span><span className="muted" style={{ fontSize: 13 }}>{n.mensagem}</span></div>
            <div className="col" style={{ alignItems: "flex-end", gap: 6 }}><span className="tag">{new Date(n.created_at).toLocaleDateString("pt-BR")}</span>{!n.lida && <span className="sdot" style={{ background: "var(--lime)" }}></span>}</div>
          </div>
        ))}
        {notifs.length === 0 && <span className="muted" style={{ fontSize: 13 }}>Nenhuma notificação.</span>}
      </div>
    </div>
  )
}

/* ---------------- PERFIL ---------------- */
export function ClientPerfil() {
  const { profile, user, signOut } = useAuth()
  const { leads } = useMyLeads()
  const [pwd, setPwd] = useState("")
  const [pwd2, setPwd2] = useState("")
  const [lgpdSent, setLgpdSent] = useState(false)
  async function changePwd() {
    if (pwd.length < 8) return toast.error("Mínimo 8 caracteres.")
    if (pwd !== pwd2) return toast.error("As senhas não coincidem.")
    const { error } = await supabase.auth.updateUser({ password: pwd })
    if (error) return toast.error(error.message)
    toast.success("Senha alterada."); setPwd(""); setPwd2("")
  }
  // LGPD (RNF-003): o titular registra a solicitação; o time interno a cumpre (export/anonimização via function `lgpd`).
  async function solicitarLgpd(tipo: "exportacao" | "exclusao") {
    const lead = leads[0]
    if (!lead) return toast.error("Ainda não há um atendimento vinculado à sua conta. Fale com seu consultor.")
    const msg = tipo === "exportacao"
      ? "Solicitação LGPD: o titular solicitou a EXPORTAÇÃO dos seus dados pessoais."
      : "Solicitação LGPD: o titular solicitou a EXCLUSÃO/anonimização dos seus dados pessoais."
    const { error } = await supabase.from("interactions").insert({
      lead_id: lead.id, canal: "portal", tipo: "mensagem", autor_tipo: "cliente", mensagem: msg, visivel_cliente: true,
    })
    if (error) return toast.error("Não foi possível registrar: " + error.message)
    setLgpdSent(true)
    toast.success("Solicitação registrada. Retornaremos em até 15 dias, conforme a LGPD.")
  }
  return (
    <div className="fade" style={{ maxWidth: 680, margin: "0 auto" }}>
      <h1 className="disp" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 22px" }}>Perfil e segurança</h1>
      <div className="panel panel-b row center gap16" style={{ marginBottom: 14 }}>
        <Avatar name={profile?.nome ?? "?"} size={56} tone="lime" />
        <div className="col" style={{ lineHeight: 1.4 }}><span className="disp" style={{ fontSize: 18, fontWeight: 600 }}>{profile?.nome ?? "—"}</span><span className="muted" style={{ fontSize: 13 }}>{user?.email}</span></div>
        <span className="pill pill--ok mla"><span className="dot"></span>Conta ativa</span>
      </div>
      <div className="panel panel-b">
        <div className="tag" style={{ marginBottom: 14 }}>Alterar senha</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="field"><label>Nova senha</label><input className="input" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" /></div>
          <div className="field"><label>Confirmar</label><input className="input" type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} placeholder="••••••••" /></div>
        </div>
        <Btn variant="lime" style={{ marginTop: 16 }} icon="check" onClick={changePwd}>Salvar alterações</Btn>
      </div>
      <div className="panel panel-b" style={{ marginTop: 14 }}>
        <div className="row center gap10" style={{ marginBottom: 12 }}><Icon name="lock" size={15} style={{ color: "var(--lime)" }} /><span className="tag" style={{ margin: 0 }}>Privacidade (LGPD)</span></div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>Você pode solicitar uma cópia dos seus dados pessoais ou a exclusão deles. Registramos o pedido e nossa equipe retorna em até 15 dias.</p>
        <div className="row gap10 wrap">
          <Btn variant="dark" icon="download" disabled={lgpdSent} onClick={() => solicitarLgpd("exportacao")}>Solicitar meus dados</Btn>
          <Btn variant="ghost" icon="alert" disabled={lgpdSent} onClick={() => solicitarLgpd("exclusao")}>Solicitar exclusão</Btn>
        </div>
        {lgpdSent && <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}><Icon name="check" size={12} style={{ color: "var(--ok)" }} /> Solicitação registrada com a nossa equipe.</p>}
      </div>
      <div className="panel panel-b" style={{ marginTop: 14 }}>
        <button onClick={signOut} className="row gap10 center" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--danger)" }}><Icon name="logout" size={16} /> Sair da conta</button>
      </div>
    </div>
  )
}
