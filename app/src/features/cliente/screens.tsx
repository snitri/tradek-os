import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import { Icon, Btn, Pill, Avatar } from "@/components/tradek/ui"
import { usePick, useLanguage } from "@/lib/i18n"
import { useMyLeads, useMyDocs, useMyNotifications, useClientPipeline, type CLead, type Pipeline } from "./cliente-data"

function clientLabel(statuses: Pipeline[], key: string) {
  return statuses.find((s) => s.key === key)?.label_cliente ?? key
}
function leadTitulo(l: CLead, fallback: string) {
  return l.produto_servico_interesse || (l.companies?.nome_fantasia || l.companies?.razao_social || fallback)
}
const PEND_DOC = ["solicitado", "reprovado", "reenvio_solicitado"]

/* ---------------- DASHBOARD ---------------- */
export function ClientDashboard() {
  const { profile } = useAuth()
  const { leads } = useMyLeads()
  const { docs } = useMyDocs()
  const statuses = useClientPipeline()
  const { lang } = useLanguage()
  const locale = lang === "en" ? "en-US" : "pt-BR"
  const t = usePick(
    {
      noLead: "Você ainda não tem uma oportunidade ativa. A equipe TradeK vinculará sua solicitação em breve.", hello: "Olá,",
      yourRequest: "Sua solicitação", statusLabel: "Status atual", value: "Valor", nextStep: "Próximo passo",
      pendDocs: "Envie os documentos pendentes para avançarmos com a análise.", noPend: "Acompanhe o andamento. A equipe TradeK retornará com o próximo passo.",
      docsBtn: "Documentos", pendingsTitle: "Pendências", noPendList: "Sem pendências.", send: "Enviar",
      shortcuts: "Atalhos", talkToTradek: "Falar com a TradeK", companyProfile: "Ficha cadastral",
      recentMsgs: "Mensagens recentes", seeAll: "Ver tudo", you: "Você", noMsgs: "Nenhuma mensagem ainda.", request: "Solicitação", client: "cliente",
    },
    {
      noLead: "You don't have an active opportunity yet. The TradeK team will link your request soon.", hello: "Hi,",
      yourRequest: "Your request", statusLabel: "Current status", value: "Value", nextStep: "Next step",
      pendDocs: "Submit the pending documents so we can proceed with the review.", noPend: "Track progress. The TradeK team will get back to you with the next step.",
      docsBtn: "Documents", pendingsTitle: "Pending items", noPendList: "No pending items.", send: "Send",
      shortcuts: "Shortcuts", talkToTradek: "Talk to TradeK", companyProfile: "Company profile",
      recentMsgs: "Recent messages", seeAll: "See all", you: "You", noMsgs: "No messages yet.", request: "Request", client: "client",
    },
  )
  const [msgs, setMsgs] = useState<{ id: string; autor_tipo: string; mensagem: string | null; created_at: string }[]>([])
  const lead = leads[0]
  useEffect(() => {
    if (!lead) return
    supabase.from("interactions").select("id,autor_tipo,mensagem,created_at").eq("lead_id", lead.id).eq("visivel_cliente", true).order("created_at", { ascending: false }).limit(2).then(({ data }) => setMsgs(data ?? []))
  }, [lead])
  const pend = docs.filter((d) => PEND_DOC.includes(d.status))
  const nome = (profile?.nome ?? "").split(" ")[0] || t.client

  if (!lead) return <div className="fade"><h1 className="disp" style={{ fontSize: 26, fontWeight: 600 }}>{t.hello} {nome} 👋</h1><p className="muted" style={{ marginTop: 8 }}>{t.noLead}</p></div>

  return (
    <div className="fade">
      <div className="row center gap8"><span style={{ fontSize: 13, color: "var(--tx-mute)" }}>{t.hello}</span><h1 className="disp" style={{ fontSize: 26, fontWeight: 600, margin: 0 }}>{nome} 👋</h1></div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginTop: 20 }}>
        <div className="panel" style={{ overflow: "hidden" }}>
          <div className="panel-b" style={{ background: "linear-gradient(180deg,rgba(195,249,41,.05),transparent)" }}>
            <div className="row center gap8"><span className="pill pill--lime"><Icon name="coins" size={12} />{t.yourRequest}</span><span className="tag mla">{lead.id.slice(0, 8)}</span></div>
            <h2 className="disp" style={{ fontSize: 21, fontWeight: 600, margin: "14px 0 0" }}>{leadTitulo(lead, t.request)}</h2>
            <div className="row gap20" style={{ marginTop: 18 }}>
              <div><div className="tag">{t.statusLabel}</div><div className="row gap6 center" style={{ marginTop: 4 }}><span className="sdot" style={{ background: "var(--purple)" }}></span><span style={{ fontSize: 14, fontWeight: 700 }}>{clientLabel(statuses, lead.status)}</span></div></div>
              {lead.valor_estimado && <div><div className="tag">{t.value}</div><div className="mono" style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{lead.moeda} {Number(lead.valor_estimado).toLocaleString(locale)}</div></div>}
            </div>
          </div>
          <div className="panel-b" style={{ borderTop: "1px solid var(--line-soft)", background: "var(--bg-2)" }}>
            <div className="row gap8 center" style={{ marginBottom: 4 }}><Icon name="target" size={15} style={{ color: "var(--lime)" }} /><span className="tag" style={{ color: "var(--lime)" }}>{t.nextStep}</span></div>
            <p style={{ fontSize: 14, margin: "0 0 14px", fontWeight: 500 }}>{pend.length ? t.pendDocs : t.noPend}</p>
            <Link to="/cliente/checklist" className="btn btn--lime btn--sm"><Icon name="upload" size={13} /> {t.docsBtn}</Link>
          </div>
        </div>
        <div className="col gap14">
          <div className="panel">
            <div className="panel-h"><h3>{t.pendingsTitle}</h3><span className="pill pill--warn">{pend.length}</span></div>
            <div className="panel-b col gap10" style={{ padding: "12px 14px" }}>
              {pend.length ? pend.map((d) => <div key={d.id} className="row center gap10" style={{ fontSize: 13 }}><span style={{ width: 16, height: 16, border: "1.5px solid " + (d.status === "reprovado" ? "var(--danger)" : "var(--warn)"), borderRadius: 4, flexShrink: 0 }}></span><span style={{ flex: 1 }}>{d.tipo_documento}</span><Link to="/cliente/upload" className="lime" style={{ fontSize: 11.5, fontWeight: 700 }}>{t.send}</Link></div>) : <span className="muted" style={{ fontSize: 13 }}>{t.noPendList}</span>}
            </div>
          </div>
          <div className="panel panel-b col gap8">
            <div className="tag" style={{ marginBottom: 4 }}>{t.shortcuts}</div>
            <Link to="/cliente/chat" className="row gap10 center" style={{ fontSize: 13, fontWeight: 600, padding: "8px 0" }}><Icon name="chat" size={15} style={{ color: "var(--lime)" }} />{t.talkToTradek}<Icon name="chevR" size={14} style={{ marginLeft: "auto", color: "var(--tx-faint)" }} /></Link>
            <div className="hr"></div>
            <Link to="/cliente/ficha" className="row gap10 center" style={{ fontSize: 13, fontWeight: 600, padding: "8px 0" }}><Icon name="building" size={15} style={{ color: "var(--lime)" }} />{t.companyProfile}<Icon name="chevR" size={14} style={{ marginLeft: "auto", color: "var(--tx-faint)" }} /></Link>
          </div>
        </div>
      </div>
      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panel-h"><h3>{t.recentMsgs}</h3><Link to="/cliente/chat" className="lime" style={{ fontSize: 11.5, fontWeight: 700 }}>{t.seeAll}</Link></div>
        <div className="panel-b col gap10">
          {msgs.length ? msgs.map((m) => <div key={m.id} className="row gap10"><Avatar name={m.autor_tipo === "cliente" ? (profile?.nome ?? t.you) : "TradeK"} size={28} tone={m.autor_tipo === "cliente" ? undefined : "lime"} /><div className="col" style={{ lineHeight: 1.45 }}><span style={{ fontSize: 12.5 }}><b>{m.autor_tipo === "cliente" ? t.you : "TradeK"}</b> · <span className="tag">{new Date(m.created_at).toLocaleDateString(locale)}</span></span><span className="muted" style={{ fontSize: 13 }}>{m.mensagem}</span></div></div>) : <span className="muted" style={{ fontSize: 13 }}>{t.noMsgs}</span>}
        </div>
      </div>
    </div>
  )
}

/* ---------------- OPORTUNIDADES ---------------- */
export function ClientOportunidades() {
  const { leads } = useMyLeads()
  const statuses = useClientPipeline()
  const { lang } = useLanguage()
  const locale = lang === "en" ? "en-US" : "pt-BR"
  const t = usePick(
    { title: "Minhas oportunidades", sub: "Acompanhe o andamento das suas solicitações.", updated: "Atualizado", open: "Abrir", none: "Nenhuma oportunidade ativa.", request: "Solicitação" },
    { title: "My opportunities", sub: "Track the progress of your requests.", updated: "Updated", open: "Open", none: "No active opportunity.", request: "Request" },
  )
  return (
    <div className="fade">
      <h1 className="disp" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 4px" }}>{t.title}</h1>
      <p className="muted" style={{ fontSize: 13.5, margin: "0 0 22px" }}>{t.sub}</p>
      <div className="col gap12">
        {leads.map((l) => (
          <div key={l.id} className="panel panel-b row center gap16">
            <span style={{ width: 46, height: 46, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--lime)", flexShrink: 0 }}><Icon name="coins" size={22} /></span>
            <div className="col fill" style={{ lineHeight: 1.4 }}>
              <div className="row gap8 center"><span className="disp" style={{ fontSize: 16, fontWeight: 600 }}>{leadTitulo(l, t.request)}</span><span className="tag">· {l.id.slice(0, 8)}</span></div>
              <span className="muted" style={{ fontSize: 13 }}>{t.updated} {new Date(l.updated_at ?? l.created_at).toLocaleDateString(locale)}</span>
            </div>
            <span className="pill" style={{ borderColor: "var(--purple)", color: "var(--purple)" }}><span className="dot"></span>{clientLabel(statuses, l.status)}</span>
            <Link to="/cliente/checklist" className="btn btn--dark btn--sm" style={{ flexShrink: 0 }}>{t.open} <Icon name="arrowR" size={13} /></Link>
          </div>
        ))}
        {leads.length === 0 && <span className="muted" style={{ fontSize: 13 }}>{t.none}</span>}
      </div>
    </div>
  )
}

/* ---------------- CHECKLIST ---------------- */
const DOC_VIS_PT: Record<string, { label: string; variant?: string }> = {
  solicitado: { label: "Pendente", variant: "warn" }, enviado: { label: "Enviado", variant: "info" },
  em_revisao: { label: "Em revisão", variant: "info" }, aprovado: { label: "Aprovado", variant: "ok" },
  reprovado: { label: "Reprovado", variant: "danger" }, reenvio_solicitado: { label: "Reenviar", variant: "warn" },
}
const DOC_VIS_EN: Record<string, { label: string; variant?: string }> = {
  solicitado: { label: "Pending", variant: "warn" }, enviado: { label: "Sent", variant: "info" },
  em_revisao: { label: "Under review", variant: "info" }, aprovado: { label: "Approved", variant: "ok" },
  reprovado: { label: "Rejected", variant: "danger" }, reenvio_solicitado: { label: "Resend", variant: "warn" },
}
export function ClientChecklist() {
  const { docs } = useMyDocs()
  const aprov = docs.filter((d) => d.status === "aprovado").length
  const DOC_VIS = usePick(DOC_VIS_PT, DOC_VIS_EN)
  const t = usePick(
    { home: "Início", title: "Documentos", sub: "Envie e acompanhe seus documentos.", approved: "Aprovados", send: "Enviar", none: "Nenhum documento solicitado ainda." },
    { home: "Home", title: "Documents", sub: "Submit and track your documents.", approved: "Approved", send: "Send", none: "No documents requested yet." },
  )
  return (
    <div className="fade">
      <Link to="/cliente" className="row gap6 faint" style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 16 }}><Icon name="chevL" size={14} /> {t.home}</Link>
      <div className="row center" style={{ justifyContent: "space-between" }}>
        <div><h1 className="disp" style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{t.title}</h1><p className="muted" style={{ fontSize: 13.5, margin: "4px 0 0" }}>{t.sub}</p></div>
        <div className="col" style={{ textAlign: "right" }}><div className="tag">{t.approved}</div><div className="disp lime" style={{ fontSize: 22, fontWeight: 600 }}>{aprov} / {docs.length}</div></div>
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
                {PEND_DOC.includes(d.status) ? <Link to={`/cliente/upload?req=${d.id}`} className="btn btn--lime btn--sm" style={{ flexShrink: 0 }}><Icon name="upload" size={13} /> {t.send}</Link> : <button className="btn btn--dark btn--sm" style={{ flexShrink: 0 }}><Icon name="eye" size={13} /></button>}
              </div>
            </div>
          )
        })}
        {docs.length === 0 && <span className="muted" style={{ fontSize: 13 }}>{t.none}</span>}
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
  const t = usePick(
    {
      selectFile: "Selecione um arquivo.", failed: "Falha no envio: ", docs: "Documentos", title: "Enviar documento",
      docType: "Tipo de documento", select: "Selecione…", clickToSelect: "Clique para selecionar o arquivo",
      formats: "PDF · JPG · PNG · DOCX · XLSX · até 10MB", sending: "Enviando…", confirm: "Confirmar envio",
      sentTitle: "Documento enviado!", sentDesc: "A equipe TradeK foi notificada e vai revisar seu documento.", back: "Voltar aos documentos",
      sentMsg: (doc: string) => `Documento enviado: ${doc}`, defaultDoc: "Documento",
    },
    {
      selectFile: "Select a file.", failed: "Upload failed: ", docs: "Documents", title: "Submit document",
      docType: "Document type", select: "Select…", clickToSelect: "Click to select the file",
      formats: "PDF · JPG · PNG · DOCX · XLSX · up to 10MB", sending: "Sending…", confirm: "Confirm submission",
      sentTitle: "Document submitted!", sentDesc: "The TradeK team has been notified and will review your document.", back: "Back to documents",
      sentMsg: (doc: string) => `Document submitted: ${doc}`, defaultDoc: "Document",
    },
  )

  async function upload() {
    if (!file || !companyId) return toast.error(t.selectFile)
    setBusy(true)
    try {
      const req = docs.find((d) => d.id === reqId) ?? pend[0]
      const path = `${companyId}/${lead?.id ?? "geral"}/${Date.now()}_${file.name}`
      const { error: upErr } = await supabase.storage.from("tradek-documents").upload(path, file)
      if (upErr) throw upErr
      await supabase.from("documents").insert({
        request_id: req?.id ?? null, company_id: companyId, lead_id: lead?.id ?? null,
        tipo_documento: req?.tipo_documento ?? t.defaultDoc, nome_original: file.name,
        storage_key: path, status: "enviado", tamanho: file.size, mime: file.type,
      })
      if (req) await supabase.from("document_requests").update({ status: "enviado" }).eq("id", req.id)
      if (lead) await supabase.from("interactions").insert({ lead_id: lead.id, canal: "portal", tipo: "upload", autor_tipo: "cliente", mensagem: t.sentMsg(req?.tipo_documento ?? file.name), visivel_cliente: false })
      setDone(true)
    } catch (e) {
      toast.error(t.failed + String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fade" style={{ maxWidth: 620, margin: "0 auto" }}>
      <Link to="/cliente/checklist" className="row gap6 faint" style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 16 }}><Icon name="chevL" size={14} /> {t.docs}</Link>
      <h1 className="disp" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 22px" }}>{t.title}</h1>
      {!done ? (
        <div className="panel panel-b">
          <div className="field"><label>{t.docType}</label>
            <select className="select" value={reqId} onChange={(e) => setReqId(e.target.value)}>
              <option value="">{t.select}</option>
              {pend.map((d) => <option key={d.id} value={d.id}>{d.tipo_documento}</option>)}
            </select>
          </div>
          <label style={{ display: "block", marginTop: 16, border: "1.5px dashed " + (file ? "var(--lime)" : "var(--line-strong)"), borderRadius: 10, padding: "34px 20px", textAlign: "center", cursor: "pointer", background: file ? "rgba(195,249,41,.04)" : "transparent" }}>
            <input type="file" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <Icon name="upload" size={28} style={{ color: file ? "var(--lime)" : "var(--tx-mute)" }} />
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>{file?.name || t.clickToSelect}</div>
            <div className="tag" style={{ marginTop: 6 }}>{t.formats}</div>
          </label>
          <Btn variant="lime" className="btn--block" style={{ marginTop: 16 }} disabled={!file || busy} onClick={upload} icon="check">{busy ? t.sending : t.confirm}</Btn>
        </div>
      ) : (
        <div className="panel panel-b" style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--lime-dim)", border: "1px solid var(--lime-dim2)", display: "grid", placeItems: "center", margin: "0 auto" }}><Icon name="check" size={28} style={{ color: "var(--lime)" }} /></div>
          <h2 className="disp" style={{ fontSize: 20, fontWeight: 600, margin: "20px 0 6px" }}>{t.sentTitle}</h2>
          <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>{t.sentDesc}</p>
          <Link to="/cliente/checklist" className="btn btn--lime" style={{ marginTop: 20 }}>{t.back}</Link>
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
  const t = usePick(
    {
      title: "Ficha cadastral", sub: "Mantenha os dados da sua empresa atualizados.", saving: "Salvando…", save: "Salvar",
      err: "Erro ao salvar: ", saved: "Ficha salva.", companyData: "Dados da empresa",
      fields: [["razao_social", "Razão social"], ["nome_fantasia", "Nome fantasia"], ["cnpj", "CNPJ"], ["inscricao_estadual", "Inscrição estadual"], ["cnae_principal", "CNAE principal"], ["site", "Site"]] as [string, string][],
    },
    {
      title: "Company profile", sub: "Keep your company's information up to date.", saving: "Saving…", save: "Save",
      err: "Save failed: ", saved: "Profile saved.", companyData: "Company data",
      fields: [["razao_social", "Legal name"], ["nome_fantasia", "Trade name"], ["cnpj", "Tax ID (CNPJ)"], ["inscricao_estadual", "State registration"], ["cnae_principal", "Main activity code (CNAE)"], ["site", "Website"]] as [string, string][],
    },
  )
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
    if (error) return toast.error(t.err + error.message)
    toast.success(t.saved)
  }

  return (
    <div className="fade">
      <div className="row center" style={{ justifyContent: "space-between" }}>
        <div><h1 className="disp" style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{t.title}</h1><p className="muted" style={{ fontSize: 13.5, margin: "4px 0 0" }}>{t.sub}</p></div>
        <Btn variant="lime" size="sm" icon="check" disabled={busy} onClick={save}>{busy ? t.saving : t.save}</Btn>
      </div>
      <div className="panel panel-b" style={{ marginTop: 22 }}>
        <h3 className="disp" style={{ fontSize: 17, fontWeight: 600, margin: "0 0 18px" }}>{t.companyData}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {t.fields.map(([k, l]) => <div key={k} className="field" style={k === "razao_social" ? { gridColumn: "span 2" } : undefined}><label>{l}</label><input className="input" value={company[k] ?? ""} onChange={(e) => set(k, e.target.value)} placeholder={l} /></div>)}
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
  const { lang } = useLanguage()
  const locale = lang === "en" ? "en-US" : "pt-BR"
  const t = usePick(
    { title: "Mensagens", team: "Equipe TradeK", online: "Online", noMsgs: "Inicie uma conversa com a equipe TradeK.", placeholder: "Digite sua mensagem…", noLead: "Sem oportunidade ativa", notLinked: "sua oportunidade ainda não foi vinculada." },
    { title: "Messages", team: "TradeK Team", online: "Online", noMsgs: "Start a conversation with the TradeK team.", placeholder: "Type your message…", noLead: "No active opportunity", notLinked: "your opportunity hasn't been linked yet." },
  )
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
      <h1 className="disp" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 16px" }}>{t.title}</h1>
      <div className="panel" style={{ display: "flex", flexDirection: "column", height: "62vh" }}>
        <div className="panel-h"><div className="row gap10 center"><Avatar name="TradeK" tone="lime" size={32} /><div className="col" style={{ lineHeight: 1.25 }}><span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--tx)" }}>{t.team}</span><span className="row gap6 center tag"><span className="sdot" style={{ background: "var(--ok)" }}></span>{t.online}</span></div></div></div>
        <div className="scroll fill col gap12" style={{ padding: 18, background: "var(--bg)" }}>
          {msgs.map((m) => m.autor_tipo !== "cliente"
            ? <div key={m.id} className="row gap10" style={{ alignSelf: "flex-start", maxWidth: "80%" }}><Avatar name="TradeK" tone="lime" size={28} /><div style={{ background: "var(--bg-3)", border: "1px solid var(--line-soft)", padding: "10px 13px", borderRadius: "4px 12px 12px 12px", fontSize: 13.5, lineHeight: 1.5 }}>{m.mensagem}<div className="tag" style={{ marginTop: 4 }}>{new Date(m.created_at).toLocaleString(locale)}</div></div></div>
            : <div key={m.id} style={{ alignSelf: "flex-end", maxWidth: "80%", background: "var(--lime)", color: "#0A0B0A", padding: "10px 13px", borderRadius: "12px 4px 12px 12px", fontSize: 13.5, fontWeight: 500 }}>{m.mensagem}<div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, fontWeight: 700 }}>{new Date(m.created_at).toLocaleString(locale)}</div></div>)}
          {msgs.length === 0 && <span className="muted" style={{ fontSize: 13, alignSelf: "center" }}>{t.noMsgs}</span>}
        </div>
        <div className="row gap8" style={{ padding: 12, borderTop: "1px solid var(--line)" }}>
          <input className="input fill" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={lead ? t.placeholder : t.noLead} disabled={!lead} />
          <Btn variant="lime" onClick={send} disabled={!lead}><Icon name="send" size={16} /></Btn>
        </div>
      </div>
      {!lead && <p className="muted" style={{ fontSize: 12.5, textAlign: "center", marginTop: 10 }}>{profile?.nome}, {t.notLinked}</p>}
    </div>
  )
}

/* ---------------- NOTIFICAÇÕES ---------------- */
export function ClientNotificacoes() {
  const notifs = useMyNotifications()
  const { lang } = useLanguage()
  const locale = lang === "en" ? "en-US" : "pt-BR"
  const t = usePick(
    { title: "Notificações", markAll: "Marcar todas como lidas", marked: "Marcadas como lidas.", none: "Nenhuma notificação." },
    { title: "Notifications", markAll: "Mark all as read", marked: "Marked as read.", none: "No notifications." },
  )
  async function markAll() {
    await supabase.from("notifications").update({ lida: true }).eq("lida", false)
    toast.success(t.marked)
  }
  return (
    <div className="fade" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div className="row center" style={{ justifyContent: "space-between", marginBottom: 18 }}><h1 className="disp" style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{t.title}</h1><button className="btn btn--dark btn--sm" onClick={markAll}>{t.markAll}</button></div>
      <div className="col gap8">
        {notifs.map((n) => (
          <div key={n.id} className="panel panel-b row gap14" style={{ borderColor: !n.lida ? "var(--lime-dim2)" : "var(--line)" }}>
            <span style={{ width: 38, height: 38, borderRadius: 9, background: "var(--bg)", display: "grid", placeItems: "center", color: "var(--lime)", flexShrink: 0 }}><Icon name="bell" size={17} /></span>
            <div className="col fill" style={{ lineHeight: 1.4 }}><span style={{ fontSize: 14, fontWeight: 600 }}>{n.tipo}</span><span className="muted" style={{ fontSize: 13 }}>{n.mensagem}</span></div>
            <div className="col" style={{ alignItems: "flex-end", gap: 6 }}><span className="tag">{new Date(n.created_at).toLocaleDateString(locale)}</span>{!n.lida && <span className="sdot" style={{ background: "var(--lime)" }}></span>}</div>
          </div>
        ))}
        {notifs.length === 0 && <span className="muted" style={{ fontSize: 13 }}>{t.none}</span>}
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
  const t = usePick(
    {
      title: "Perfil e segurança", activeAccount: "Conta ativa", changePwd: "Alterar senha", newPwd: "Nova senha", confirm: "Confirmar",
      save: "Salvar alterações", minChars: "Mínimo 8 caracteres.", noMatch: "As senhas não coincidem.", changed: "Senha alterada.",
      privacy: "Privacidade (LGPD)", privacyDesc: "Você pode solicitar uma cópia dos seus dados pessoais ou a exclusão deles. Registramos o pedido e nossa equipe retorna em até 15 dias.",
      requestData: "Solicitar meus dados", requestDelete: "Solicitar exclusão", registered: "Solicitação registrada com a nossa equipe.",
      noLeadErr: "Ainda não há um atendimento vinculado à sua conta. Fale com seu consultor.",
      msgExport: "Solicitação LGPD: o titular solicitou a EXPORTAÇÃO dos seus dados pessoais.",
      msgDelete: "Solicitação LGPD: o titular solicitou a EXCLUSÃO/anonimização dos seus dados pessoais.",
      regErr: "Não foi possível registrar: ", regOk: "Solicitação registrada. Retornaremos em até 15 dias, conforme a LGPD.",
      logout: "Sair da conta",
    },
    {
      title: "Profile and security", activeAccount: "Active account", changePwd: "Change password", newPwd: "New password", confirm: "Confirm",
      save: "Save changes", minChars: "Minimum 8 characters.", noMatch: "Passwords don't match.", changed: "Password changed.",
      privacy: "Privacy (LGPD)", privacyDesc: "You can request a copy of your personal data or its deletion. We log the request and our team responds within 15 days.",
      requestData: "Request my data", requestDelete: "Request deletion", registered: "Request registered with our team.",
      noLeadErr: "There's no service linked to your account yet. Talk to your consultant.",
      msgExport: "LGPD request: the data subject requested the EXPORT of their personal data.",
      msgDelete: "LGPD request: the data subject requested the DELETION/anonymization of their personal data.",
      regErr: "Could not register: ", regOk: "Request registered. We'll respond within 15 days, per LGPD.",
      logout: "Sign out",
    },
  )
  async function changePwd() {
    if (pwd.length < 8) return toast.error(t.minChars)
    if (pwd !== pwd2) return toast.error(t.noMatch)
    const { error } = await supabase.auth.updateUser({ password: pwd })
    if (error) return toast.error(error.message)
    toast.success(t.changed); setPwd(""); setPwd2("")
  }
  // LGPD (RNF-003): o titular registra a solicitação; o time interno a cumpre (export/anonimização via function `lgpd`).
  async function solicitarLgpd(tipo: "exportacao" | "exclusao") {
    const lead = leads[0]
    if (!lead) return toast.error(t.noLeadErr)
    const msg = tipo === "exportacao" ? t.msgExport : t.msgDelete
    const { error } = await supabase.from("interactions").insert({
      lead_id: lead.id, canal: "portal", tipo: "mensagem", autor_tipo: "cliente", mensagem: msg, visivel_cliente: true,
    })
    if (error) return toast.error(t.regErr + error.message)
    setLgpdSent(true)
    toast.success(t.regOk)
  }
  return (
    <div className="fade" style={{ maxWidth: 680, margin: "0 auto" }}>
      <h1 className="disp" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 22px" }}>{t.title}</h1>
      <div className="panel panel-b row center gap16" style={{ marginBottom: 14 }}>
        <Avatar name={profile?.nome ?? "?"} size={56} tone="lime" />
        <div className="col" style={{ lineHeight: 1.4 }}><span className="disp" style={{ fontSize: 18, fontWeight: 600 }}>{profile?.nome ?? "—"}</span><span className="muted" style={{ fontSize: 13 }}>{user?.email}</span></div>
        <span className="pill pill--ok mla"><span className="dot"></span>{t.activeAccount}</span>
      </div>
      <div className="panel panel-b">
        <div className="tag" style={{ marginBottom: 14 }}>{t.changePwd}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="field"><label>{t.newPwd}</label><input className="input" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" /></div>
          <div className="field"><label>{t.confirm}</label><input className="input" type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} placeholder="••••••••" /></div>
        </div>
        <Btn variant="lime" style={{ marginTop: 16 }} icon="check" onClick={changePwd}>{t.save}</Btn>
      </div>
      <div className="panel panel-b" style={{ marginTop: 14 }}>
        <div className="row center gap10" style={{ marginBottom: 12 }}><Icon name="lock" size={15} style={{ color: "var(--lime)" }} /><span className="tag" style={{ margin: 0 }}>{t.privacy}</span></div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>{t.privacyDesc}</p>
        <div className="row gap10 wrap">
          <Btn variant="dark" icon="download" disabled={lgpdSent} onClick={() => solicitarLgpd("exportacao")}>{t.requestData}</Btn>
          <Btn variant="ghost" icon="alert" disabled={lgpdSent} onClick={() => solicitarLgpd("exclusao")}>{t.requestDelete}</Btn>
        </div>
        {lgpdSent && <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}><Icon name="check" size={12} style={{ color: "var(--ok)" }} /> {t.registered}</p>}
      </div>
      <div className="panel panel-b" style={{ marginTop: 14 }}>
        <button onClick={signOut} className="row gap10 center" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--danger)" }}><Icon name="logout" size={16} /> {t.logout}</button>
      </div>
    </div>
  )
}
