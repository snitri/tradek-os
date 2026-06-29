import { useEffect, useState } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Icon, Btn, Pill, Score } from "@/components/tradek/ui"
import { unidadeMeta, companyName, leadValor, origemLabel, updateLeadStatus, type Lead, usePipelineStatuses, leadScoreCredito } from "./admin-data"
import { NewLeadModal } from "./NewLeadModal"

const LEAD_TABS = ["Resumo", "Dados", "Oportunidade", "Cotações", "Qualificação IA", "Interações", "Documentos", "Chat", "Relatório", "Histórico"]
const LEAD_SELECT = "*, companies(razao_social,nome_fantasia,cnpj,score_credito,processos_judiciais), contacts(nome,email,whatsapp,cargo), responsavel:profiles(nome)"

type Interaction = { id: string; canal: string; tipo: string; autor_tipo: string; mensagem: string | null; visivel_cliente: boolean; created_at: string }
type Doc = { id: string; tipo_documento: string; status: string; solicitado_em: string }
type Report = { id: string; conteudo: string | null; score: number | null; created_at: string }
type Hist = { id: string; status_anterior: string | null; status_novo: string; created_at: string }
type ConvMsg = { id: string; role: string; content: string | null; created_at: string }
type ProductOpt = { id: string; modelo: string; preco_base: number | null; moeda: string | null }
type Proposal = {
  id: string; status: string; valor: number | null; moeda: string | null; quantidade: number | null
  observacoes: string | null; created_at: string; product_id: string | null
  products: { modelo: string } | null
}
const PROPOSAL_STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho", aguardando_dados: "Aguardando dados", em_validacao: "Em validação",
  enviada: "Enviada", aceita: "Aceita", recusada: "Recusada", cancelada: "Cancelada",
}

function jstr(j: unknown, k: string): string {
  if (j && typeof j === "object" && k in (j as Record<string, unknown>)) {
    const v = (j as Record<string, unknown>)[k]
    return v == null ? "" : String(v)
  }
  return ""
}
function jarr(j: unknown): string[] {
  return Array.isArray(j) ? (j as unknown[]).map(String) : []
}

export function LeadModal({ leadId, onClose, onChanged }: { leadId: string | "new"; onClose: () => void; onChanged: () => void }) {
  if (leadId === "new") return <NewLeadModal onClose={onClose} onChanged={onChanged} />
  return <LeadDetail leadId={leadId} onClose={onClose} onChanged={onChanged} />
}

function LeadDetail({ leadId, onClose, onChanged }: { leadId: string; onClose: () => void; onChanged: () => void }) {
  const statuses = usePipelineStatuses()
  const [lead, setLead] = useState<Lead | null>(null)
  const [tab, setTab] = useState("Resumo")
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [docs, setDocs] = useState<Doc[]>([])
  const [report, setReport] = useState<Report | null>(null)
  const [hist, setHist] = useState<Hist[]>([])
  const [chatInput, setChatInput] = useState("")
  const [aiChat, setAiChat] = useState<ConvMsg[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [products, setProducts] = useState<ProductOpt[]>([])
  const [novaCotacao, setNovaCotacao] = useState({ productId: "", quantidade: "1", valorUnit: "", moeda: "USD", observacoes: "" })
  const [busyCotacao, setBusyCotacao] = useState(false)

  function loadProposals() {
    supabase.from("proposals").select("id,status,valor,moeda,quantidade,observacoes,created_at,product_id,products(modelo)").eq("lead_id", leadId).order("created_at", { ascending: false }).then(({ data }) => setProposals((data ?? []) as unknown as Proposal[]))
  }

  useEffect(() => {
    supabase.from("leads").select(LEAD_SELECT).eq("id", leadId).maybeSingle().then(({ data }) => setLead(data as unknown as Lead))
    supabase.from("interactions").select("id,canal,tipo,autor_tipo,mensagem,visivel_cliente,created_at").eq("lead_id", leadId).order("created_at").then(({ data }) => setInteractions(data ?? []))
    supabase.from("document_requests").select("id,tipo_documento,status,solicitado_em").eq("lead_id", leadId).then(({ data }) => setDocs(data ?? []))
    supabase.from("reports").select("id,conteudo,score,created_at").eq("lead_id", leadId).order("created_at", { ascending: false }).limit(1).maybeSingle().then(({ data }) => setReport(data))
    supabase.from("lead_status_history").select("id,status_anterior,status_novo,created_at").eq("lead_id", leadId).order("created_at", { ascending: false }).then(({ data }) => setHist(data ?? []))
    supabase.from("conversations").select("id").eq("lead_id", leadId).then(async ({ data: convs }) => {
      const convIds = (convs ?? []).map((c) => c.id)
      if (!convIds.length) return setAiChat([])
      const { data: msgs } = await supabase.from("conversation_messages").select("id,role,content,created_at").in("conversation_id", convIds).order("created_at")
      setAiChat(msgs ?? [])
    })
    supabase.from("products").select("id,modelo,preco_base,moeda").eq("status", "ativo").order("modelo").then(({ data }) => setProducts(data ?? []))
    loadProposals()
  }, [leadId])

  function onSelectProduto(productId: string) {
    const p = products.find((x) => x.id === productId)
    setNovaCotacao((s) => ({ ...s, productId, valorUnit: p?.preco_base != null ? String(p.preco_base) : s.valorUnit, moeda: p?.moeda ?? s.moeda }))
  }

  async function criarCotacao() {
    if (!lead) return
    const qtd = Number(novaCotacao.quantidade) || 0
    const unit = Number(novaCotacao.valorUnit) || 0
    if (!novaCotacao.productId) return toast.error("Selecione um produto.")
    if (qtd <= 0) return toast.error("Informe uma quantidade válida.")
    setBusyCotacao(true)
    const { error } = await supabase.from("proposals").insert({
      lead_id: lead.id, product_id: novaCotacao.productId, quantidade: qtd,
      valor: Math.round(unit * qtd * 100) / 100, moeda: novaCotacao.moeda,
      observacoes: novaCotacao.observacoes || null, status: "rascunho",
    })
    setBusyCotacao(false)
    if (error) return toast.error("Erro ao criar cotação: " + error.message)
    setNovaCotacao({ productId: "", quantidade: "1", valorUnit: "", moeda: "USD", observacoes: "" })
    loadProposals()
    toast.success("Cotação criada como rascunho.")
  }

  async function enviarCotacao(id: string) {
    if (!lead) return
    const { error } = await supabase.from("proposals").update({ status: "enviada", enviada_em: new Date().toISOString() }).eq("id", id)
    if (error) return toast.error("Erro ao enviar: " + error.message)
    await supabase.functions.invoke("on-event", { body: { event: "proposal.sent", lead_id: lead.id } }).catch(() => {})
    loadProposals()
    onChanged()
    toast.success("Cotação enviada ao cliente.")
  }

  async function excluirCotacao(id: string) {
    if (!confirm("Excluir esta cotação?")) return
    const { error } = await supabase.from("proposals").delete().eq("id", id)
    if (error) return toast.error("Erro ao excluir: " + error.message)
    loadProposals()
    toast.success("Cotação excluída.")
  }

  if (!lead) return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} className="fade" style={{ ...drawer, alignItems: "center", justifyContent: "center" }}>
        <span className="muted">Carregando…</span>
      </div>
    </div>
  )

  const u = unidadeMeta(lead.unidade)
  const score = lead.score_ia ?? 0
  const pend = jarr(lead.pendencias).length ? jarr(lead.pendencias) : jarr(lead.dados_faltantes)

  async function deletarLead() {
    if (!lead) return
    if (!confirm(`Excluir o lead de ${companyName(lead)}? Esta ação não pode ser desfeita.`)) return
    await supabase.from("leads").delete().eq("id", lead.id)
    toast.success("Lead excluído.")
    onChanged()
    onClose()
  }

  async function changeStatus(novo: string) {
    if (!lead) return
    await updateLeadStatus(lead.id, novo as Lead["status"], lead.status)
    setLead({ ...lead, status: novo as Lead["status"] })
    setHist((h) => [{ id: "tmp", status_anterior: lead.status, status_novo: novo, created_at: new Date().toISOString() }, ...h])
    onChanged()
    toast.success("Status atualizado.")
  }

  async function criarAcesso() {
    if (!lead) return
    const email = lead.contacts?.email
    if (!email) return toast.error("O lead não tem e-mail de contato para criar o acesso.")
    const { data, error } = await supabase.functions.invoke("create-client", { body: { email, nome: lead.contacts?.nome, company_id: lead.company_id, lead_id: lead.id } })
    if (error) return toast.error("Erro ao criar acesso: " + error.message)
    const link = (data as { action_link?: string } | null)?.action_link
    if (link) { try { await navigator.clipboard.writeText(link) } catch { /* ignore */ } }
    toast.success(`Acesso criado para ${email}.` + (link ? " Link de 1º acesso copiado." : ""))
    onChanged()
  }

  async function gerarRelatorio() {
    if (!lead) return
    toast.loading("Gerando relatório com IA…", { id: "rep" })
    const { data, error } = await supabase.functions.invoke("generate-report", { body: { lead_id: lead.id } })
    if (error) return toast.error("Erro/Chave ausente: " + error.message, { id: "rep" })
    const r = (data as { report?: Report })?.report
    if (r) setReport(r)
    toast.success("Relatório gerado.", { id: "rep" })
  }

  async function sendChat() {
    if (!chatInput.trim() || !lead) return
    const msg = chatInput.trim()
    setChatInput("")
    const { data } = await supabase.from("interactions").insert({
      lead_id: lead.id, canal: "portal", tipo: "mensagem", autor_tipo: "admin", mensagem: msg, visivel_cliente: true,
    }).select("id,canal,tipo,autor_tipo,mensagem,visivel_cliente,created_at").single()
    if (data) setInteractions((arr) => [...arr, data])
  }

  async function recalcularScore() {
    if (!lead) return
    const { data, error } = await supabase.rpc("recalc_lead_score", { p_lead: lead.id })
    if (error) return toast.error("Erro ao recalcular: " + error.message)
    const novo = Number(data) || 0
    setLead({ ...lead, score_ia: novo })
    onChanged()
    toast.success(`Score recalculado: ${novo}/100`)
  }

  const DOCS_PADRAO = ["Contrato social", "Cartão CNPJ", "Comprovante de endereço", "RG/CPF do representante legal", "RADAR / Siscomex", "Invoice / Proforma do fornecedor"]
  async function solicitarDocs() {
    if (!lead) return
    const { data: existentes } = await supabase.from("document_requests").select("tipo_documento").eq("lead_id", lead.id)
    const jaTem = new Set((existentes ?? []).map((d) => d.tipo_documento))
    const novos = DOCS_PADRAO.filter((t) => !jaTem.has(t)).map((t) => ({ lead_id: lead.id, company_id: lead.company_id, tipo_documento: t, status: "solicitado" as const }))
    if (!novos.length) { setTab("Documentos"); return toast.info("Os documentos padrão já foram solicitados.") }
    const { error } = await supabase.from("document_requests").insert(novos)
    if (error) return toast.error("Erro ao solicitar: " + error.message)
    const { data } = await supabase.from("document_requests").select("id,tipo_documento,status,solicitado_em").eq("lead_id", lead.id)
    setDocs(data ?? [])
    setTab("Documentos")
    onChanged()
    toast.success(`${novos.length} documento(s) solicitado(s).`)
  }

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} className="fade" style={drawer}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--line)", background: "var(--bg-1)" }}>
          <div className="row center gap12">
            <button className="btn btn--icon btn--dark" onClick={onClose}><Icon name="x" size={16} /></button>
            <button className="btn btn--danger btn--sm" onClick={deletarLead} style={{ marginLeft: 4 }}><Icon name="trash" size={13} /> Excluir lead</button>
            <div className="col" style={{ lineHeight: 1.25 }}>
              <div className="row gap10 center"><span className="disp" style={{ fontSize: 19, fontWeight: 600 }}>{companyName(lead)}</span><span className="pill" style={{ borderColor: u.color + "66", color: u.color }}><Icon name={u.icon} size={11} />{u.short}</span></div>
              <span className="tag">{lead.id.slice(0, 8)} · {lead.contacts?.nome ?? "—"}</span>
            </div>
            <div className="row gap8 mla center">
              <div className="col" style={{ textAlign: "right", lineHeight: 1.2, marginRight: 6 }}><span className="tag">Score IA</span><Score v={score} size={20} /></div>
              <select className="select" style={{ width: "auto", fontSize: 12 }} value={lead.status} onChange={(e) => changeStatus(e.target.value)}>
                {statuses.map((s) => <option key={s.key} value={s.key}>{s.label_admin}</option>)}
              </select>
            </div>
          </div>
          <div className="row gap2 scroll" style={{ marginTop: 14, marginBottom: -16, overflow: "auto" }}>
            {LEAD_TABS.map((t) => <button key={t} onClick={() => setTab(t)} style={{ padding: "9px 13px", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", color: tab === t ? "var(--tx)" : "var(--tx-mute)", borderBottom: "2px solid " + (tab === t ? "var(--lime)" : "transparent") }}>{t}</button>)}
          </div>
        </div>

        <div className="scroll fill" style={{ padding: "22px" }}>
          {tab === "Resumo" && (
            <div className="col gap12">
              <div className="panel panel-b" style={{ background: "linear-gradient(180deg,rgba(195,249,41,.04),transparent)" }}>
                <div className="row gap8 center" style={{ marginBottom: 10 }}><Icon name="brain" size={16} style={{ color: "var(--lime)" }} /><span className="tag" style={{ color: "var(--lime)" }}>Resumo executivo · IA</span></div>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{lead.resumo_ia || "Sem resumo gerado ainda. Use o agente ou gere um relatório."}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="panel panel-b"><div className="row gap8 center" style={{ marginBottom: 10 }}><Icon name="check" size={15} style={{ color: "var(--ok)" }} /><span className="tag" style={{ color: "var(--ok)" }}>O que o cliente quer</span></div><p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>{lead.o_que_quer || "—"}</p></div>
                <div className="panel panel-b"><div className="row gap8 center" style={{ marginBottom: 10 }}><Icon name="x" size={15} style={{ color: "var(--danger)" }} /><span className="tag" style={{ color: "var(--danger)" }}>O que o cliente não quer</span></div><p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>{lead.o_que_nao_quer || "—"}</p></div>
              </div>
              <div className="panel">
                <div className="panel-h"><h3>Pendências</h3>{pend.length > 0 && <span className="pill pill--warn">{pend.length} itens</span>}</div>
                <div className="panel-b col gap8">{pend.length > 0 ? pend.map((p) => <div key={p} className="row gap10 center" style={{ fontSize: 13.5 }}><span style={{ width: 16, height: 16, border: "1.5px solid var(--warn)", borderRadius: 4, flexShrink: 0 }}></span>{p}</div>) : <span className="muted" style={{ fontSize: 13 }}>Sem pendências no momento.</span>}</div>
              </div>
              <div className="panel panel-b" style={{ borderColor: "var(--lime-dim2)" }}>
                <div className="row gap8 center" style={{ marginBottom: 6 }}><Icon name="target" size={15} style={{ color: "var(--lime)" }} /><span className="tag" style={{ color: "var(--lime)" }}>Próxima ação sugerida</span></div>
                <p style={{ fontSize: 14, margin: "0 0 14px", fontWeight: 500 }}>{lead.proxima_acao || "Assumir o lead e iniciar a qualificação."}</p>
                <div className="row gap8 wrap">
                  <button className="btn btn--lime btn--sm" onClick={solicitarDocs}><Icon name="file" size={13} /> Solicitar docs</button>
                  <button className="btn btn--dark btn--sm" onClick={criarAcesso}><Icon name="user" size={13} /> Criar acesso cliente</button>
                  <button className="btn btn--danger btn--sm" onClick={() => changeStatus("desqualificado")}><Icon name="x" size={13} /> Desqualificar</button>
                </div>
              </div>
            </div>
          )}

          {tab === "Dados" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
              <FieldRO label="Contato" value={lead.contacts?.nome} /><FieldRO label="Cargo" value={lead.contacts?.cargo} />
              <FieldRO label="Empresa" value={companyName(lead)} span={2} />
              <FieldRO label="CNPJ" value={lead.companies?.cnpj} /><FieldRO label="Origem" value={origemLabel(lead.origem)} />
              <FieldRO label="E-mail" value={lead.contacts?.email} /><FieldRO label="WhatsApp" value={lead.contacts?.whatsapp} />
              <FieldRO label="Responsável" value={lead.responsavel?.nome ?? "Não atribuído"} /><FieldRO label="Consentimento LGPD" value={lead.consentimento_lgpd ? "Sim" : "Não"} />
              <div className="field" style={{ gridColumn: "span 2" }}><label>Tags</label><div className="row gap6 wrap"><span className="pill pill--lime">{u.short}</span>{lead.urgencia && <span className="pill">{lead.urgencia}</span>}{lead.consentimento_lgpd && <span className="pill pill--ok">LGPD ✓</span>}</div></div>
              {(() => {
                const credito = leadScoreCredito(lead)
                return credito.score ? (
                  <div className="panel panel-b" style={{ gridColumn: "span 2" }}>
                    <div className="row gap8 center" style={{ marginBottom: 10 }}><Icon name="shield" size={15} style={{ color: "var(--lime)" }} /><span className="tag" style={{ color: "var(--lime)" }}>Score de Crédito (QUOD / DirectD)</span></div>
                    <div className="row gap24">
                      <div><div className="tag" style={{ marginBottom: 2 }}>Score</div><div style={{ fontSize: 18, fontWeight: 700 }}>{credito.score}</div></div>
                      <div><div className="tag" style={{ marginBottom: 2 }}>Faixa</div><div style={{ fontSize: 14 }}>{credito.faixa}</div></div>
                      <div><div className="tag" style={{ marginBottom: 2 }}>Processos judiciais</div><div style={{ fontSize: 14, color: credito.qtdProcessos > 0 ? "var(--danger)" : "var(--tx)" }}>{credito.qtdProcessos}</div></div>
                    </div>
                  </div>
                ) : <div className="field" style={{ gridColumn: "span 2" }}><label>Score de Crédito</label><span className="muted" style={{ fontSize: 13 }}>Ainda não consultado.</span></div>
              })()}
            </div>
          )}

          {tab === "Oportunidade" && (
            <div>
              <div className="row gap8 center" style={{ marginBottom: 14 }}><span className="pill" style={{ borderColor: u.color + "66", color: u.color }}><Icon name={u.icon} size={11} />{u.label}</span><span className="tag">Campos específicos da unidade</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                <FieldRO label="Produto / serviço" value={lead.produto_servico_interesse} />
                <FieldRO label="Valor estimado" value={leadValor(lead)} />
                <FieldRO label="Volume" value={lead.volume_estimado} />
                <FieldRO label="Prazo desejado" value={lead.prazo_desejado} />
                <FieldRO label="Urgência" value={lead.urgencia} />
                {Object.keys((lead.dados_oportunidade as Record<string, unknown>) || {}).map((k) => <FieldRO key={k} label={k} value={jstr(lead.dados_oportunidade, k)} />)}
              </div>
            </div>
          )}

          {tab === "Cotações" && (
            <div className="col gap14">
              <div className="panel panel-b">
                <div className="row gap8 center" style={{ marginBottom: 14 }}><Icon name="coins" size={15} style={{ color: "var(--lime)" }} /><span className="tag" style={{ color: "var(--lime)" }}>Nova cotação manual</span></div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
                  <div className="field"><label>Produto</label>
                    <select className="select" value={novaCotacao.productId} onChange={(e) => onSelectProduto(e.target.value)}>
                      <option value="">Selecione…</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.modelo}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Quantidade</label><input className="input" type="number" min="1" value={novaCotacao.quantidade} onChange={(e) => setNovaCotacao((s) => ({ ...s, quantidade: e.target.value }))} /></div>
                  <div className="field"><label>Moeda</label>
                    <select className="select" value={novaCotacao.moeda} onChange={(e) => setNovaCotacao((s) => ({ ...s, moeda: e.target.value }))}>
                      <option value="USD">USD</option><option value="BRL">BRL</option><option value="CNY">CNY</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                  <div className="field"><label>Valor unitário</label><input className="input" type="number" min="0" step="0.01" value={novaCotacao.valorUnit} onChange={(e) => setNovaCotacao((s) => ({ ...s, valorUnit: e.target.value }))} /></div>
                  <div className="field"><label>Total estimado</label><div className="input" style={{ color: "var(--tx-dim)" }}>{novaCotacao.moeda} {((Number(novaCotacao.valorUnit) || 0) * (Number(novaCotacao.quantidade) || 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div></div>
                </div>
                <div className="field" style={{ marginTop: 12 }}><label>Observações</label><textarea className="textarea" placeholder="Condições, prazo, observações da cotação…" value={novaCotacao.observacoes} onChange={(e) => setNovaCotacao((s) => ({ ...s, observacoes: e.target.value }))}></textarea></div>
                <button className="btn btn--lime btn--sm" style={{ marginTop: 14 }} disabled={busyCotacao} onClick={criarCotacao}><Icon name="check" size={13} /> {busyCotacao ? "Criando…" : "Criar cotação (rascunho)"}</button>
              </div>

              <div className="panel">
                <div className="panel-h"><h3>Cotações deste lead</h3>{proposals.length > 0 && <span className="tag">{proposals.length}</span>}</div>
                <div className="panel-b col gap10">
                  {proposals.length ? proposals.map((p) => (
                    <div key={p.id} className="row center gap14" style={{ padding: "10px 0", borderBottom: "1px solid var(--line-soft)" }}>
                      <span style={{ width: 36, height: 36, borderRadius: 9, background: "var(--bg)", border: "1px solid var(--line)", display: "grid", placeItems: "center", flexShrink: 0, color: "var(--lime)" }}><Icon name="coins" size={16} /></span>
                      <div className="col fill" style={{ lineHeight: 1.4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{p.products?.modelo ?? "Produto removido"} {p.quantidade ? `× ${p.quantidade}` : ""}</span>
                        <span className="muted" style={{ fontSize: 12.5 }}>{p.moeda} {Number(p.valor ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} · {new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <Pill variant={p.status === "enviada" || p.status === "aceita" ? "ok" : p.status === "recusada" || p.status === "cancelada" ? "danger" : "warn"}>{PROPOSAL_STATUS_LABEL[p.status] ?? p.status}</Pill>
                      {p.status === "rascunho" && <button className="btn btn--lime btn--sm" onClick={() => enviarCotacao(p.id)}><Icon name="send" size={12} /> Enviar</button>}
                      <button className="btn btn--icon btn--dark" onClick={() => excluirCotacao(p.id)}><Icon name="trash" size={13} /></button>
                    </div>
                  )) : <span className="muted" style={{ fontSize: 13 }}>Nenhuma cotação criada para este lead ainda.</span>}
                </div>
              </div>
            </div>
          )}

          {tab === "Qualificação IA" && (
            <div className="col gap14">
              <div className="row gap14">
                <div className="panel panel-b" style={{ flex: "0 0 200px", textAlign: "center" }}>
                  <div className="tag">Score total</div>
                  <div className="disp" style={{ fontSize: 64, fontWeight: 600, letterSpacing: "-.03em", lineHeight: 1, margin: "8px 0", color: score >= 80 ? "var(--lime)" : score >= 60 ? "var(--warn)" : "var(--danger)" }}>{score}</div>
                  <span className={"pill " + (score >= 60 ? "pill--lime" : "pill--danger")}>{score >= 60 ? "Qualificado" : "Abaixo do mínimo"}</span>
                  <div className="tag" style={{ marginTop: 10 }}>mínimo: 60</div>
                </div>
                <div className="panel fill">
                  <div className="panel-h"><h3>Critérios</h3></div>
                  <div className="panel-b col gap10">
                    {([["Empresa identificada", !!lead.company_id, 15], ["CNPJ informado", !!lead.companies?.cnpj, 15], ["Demanda clara", !!lead.produto_servico_interesse, 20], ["Valor / volume", leadValor(lead) !== "—", 20], ["Contato válido", !!lead.contacts?.email, 15], ["Consentimento LGPD", lead.consentimento_lgpd, 15]] as [string, boolean, number][]).map(([c, ok, pts]) => <div key={c} className="row center gap10" style={{ fontSize: 13 }}><Icon name={ok ? "check" : "x"} size={15} style={{ color: ok ? "var(--ok)" : "var(--danger)" }} /><span style={{ flex: 1 }}>{c}</span><span className="mono" style={{ color: ok ? "var(--tx-dim)" : "var(--tx-faint)" }}>{ok ? "+" + pts : "0"}/{pts}</span></div>)}
                  </div>
                </div>
              </div>
              <div className="row gap8 wrap">
                <button className="btn btn--lime btn--sm" onClick={() => changeStatus("qualificado")}><Icon name="check" size={13} /> Aprovar qualificação</button>
                <button className="btn btn--dark btn--sm" onClick={recalcularScore}><Icon name="refresh" size={13} /> Recalcular score</button>
                <button className="btn btn--danger btn--sm" onClick={() => changeStatus("desqualificado")}><Icon name="x" size={13} /> Desqualificar</button>
              </div>
            </div>
          )}

          {(tab === "Interações" || tab === "Histórico") && (
            <div className="panel panel-b">
              {tab === "Histórico" ? (
                hist.length ? <div className="col gap10">{hist.map((h) => <div key={h.id} className="row gap10 center" style={{ fontSize: 13 }}><Icon name="refresh" size={14} style={{ color: "var(--tx-mute)" }} /><span>{h.status_anterior ?? "—"} → <b>{h.status_novo}</b></span><span className="tag mla">{new Date(h.created_at).toLocaleString("pt-BR")}</span></div>)}</div> : <span className="muted" style={{ fontSize: 13 }}>Sem histórico de status.</span>
              ) : (
                interactions.length ? <div className="col gap14">{interactions.map((it) => <div key={it.id} className="row gap12"><span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-3)", border: "1px solid var(--line)", display: "grid", placeItems: "center", flexShrink: 0, color: it.visivel_cliente ? "var(--tx-dim)" : "var(--warn)" }}><Icon name={it.autor_tipo === "ia" ? "brain" : it.autor_tipo === "cliente" ? "user" : "chat"} size={13} /></span><div className="col" style={{ flex: 1 }}><div className="row center gap8"><span style={{ fontSize: 13, fontWeight: 700 }}>{it.autor_tipo}</span>{!it.visivel_cliente && <span className="pill pill--warn" style={{ fontSize: 9.5, padding: "1px 6px" }}>interno</span>}<span className="tag mla">{new Date(it.created_at).toLocaleString("pt-BR")}</span></div><p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: "4px 0 0" }}>{it.mensagem}</p></div></div>)}</div> : <span className="muted" style={{ fontSize: 13 }}>Sem interações registradas.</span>
              )}
            </div>
          )}

          {tab === "Documentos" && (
            <div className="panel scroll" style={{ overflow: "auto" }}>
              <table className="tbl"><thead><tr><th>Documento</th><th>Status</th><th>Solicitado</th></tr></thead>
                <tbody>{docs.length ? docs.map((d) => <tr key={d.id}><td><div className="row gap10 center"><Icon name="doc" size={16} style={{ color: "var(--tx-mute)" }} /><span className="strong">{d.tipo_documento}</span></div></td><td><Pill variant={d.status === "aprovado" ? "ok" : d.status === "reprovado" ? "danger" : "warn"}>{d.status}</Pill></td><td className="mono">{new Date(d.solicitado_em).toLocaleDateString("pt-BR")}</td></tr>) : <tr><td colSpan={3} style={{ color: "var(--tx-mute)", padding: 18 }}>Nenhum documento solicitado. Use "Solicitar docs" na aba Resumo.</td></tr>}</tbody>
              </table>
            </div>
          )}

          {tab === "Chat" && (
            <div className="col gap16" style={{ height: "100%" }}>
              <div>
                <div className="tag" style={{ marginBottom: 8 }}>Histórico do chat com o Agente IA</div>
                <div className="panel panel-b col gap10 scroll" style={{ maxHeight: 280, overflow: "auto", background: "var(--bg)" }}>
                  {aiChat.length ? aiChat.map((m) => m.role === "assistant"
                    ? <div key={m.id} style={{ alignSelf: "flex-start", maxWidth: "85%", background: "var(--bg-3)", border: "1px solid var(--line-soft)", padding: "9px 12px", borderRadius: "4px 12px 12px 12px", fontSize: 12.5, lineHeight: 1.5, whiteSpace: "pre-wrap" }}><div className="tag" style={{ marginBottom: 3 }}>Agente IA · {new Date(m.created_at).toLocaleString("pt-BR")}</div>{m.content}</div>
                    : <div key={m.id} style={{ alignSelf: "flex-end", maxWidth: "85%", background: "var(--lime)", color: "#0A0B0A", padding: "9px 12px", borderRadius: "12px 4px 12px 12px", fontSize: 12.5, fontWeight: 500, whiteSpace: "pre-wrap" }}><div style={{ fontSize: 9.5, opacity: 0.65, marginBottom: 3, fontWeight: 700 }}>Lead · {new Date(m.created_at).toLocaleString("pt-BR")}</div>{m.content}</div>
                  ) : <span className="muted" style={{ fontSize: 13 }}>Sem conversa registrada com o agente de IA.</span>}
                </div>
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div className="tag" style={{ marginBottom: 8 }}>Chat com o cliente (portal)</div>
                <div className="panel panel-b col gap10" style={{ flex: 1, background: "var(--bg)" }}>
                  {interactions.filter((i) => i.visivel_cliente).map((m) => m.autor_tipo === "admin"
                    ? <div key={m.id} style={{ alignSelf: "flex-start", maxWidth: "72%", background: "var(--bg-3)", border: "1px solid var(--line-soft)", padding: "10px 13px", borderRadius: "4px 12px 12px 12px", fontSize: 13, lineHeight: 1.5 }}><div className="tag" style={{ marginBottom: 4 }}>TradeK</div>{m.mensagem}</div>
                    : <div key={m.id} style={{ alignSelf: "flex-end", maxWidth: "72%", background: "var(--lime)", color: "#0A0B0A", padding: "10px 13px", borderRadius: "12px 4px 12px 12px", fontSize: 13, fontWeight: 500 }}><div style={{ fontSize: 10, opacity: 0.6, marginBottom: 4, fontWeight: 700 }}>Cliente</div>{m.mensagem}</div>)}
                  <div style={{ alignSelf: "center", fontSize: 11, color: "var(--warn)", background: "rgba(245,181,68,.1)", border: "1px solid rgba(245,181,68,.25)", padding: "5px 12px", borderRadius: 99 }}>💬 Comentários internos não aparecem para o cliente</div>
                </div>
                <div className="row gap8" style={{ marginTop: 12 }}>
                  <input className="input fill" placeholder="Mensagem ao cliente…" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} />
                  <Btn variant="lime" onClick={sendChat}><Icon name="send" size={15} /></Btn>
                </div>
              </div>
            </div>
          )}

          {tab === "Relatório" && (
            <div className="panel">
              <div className="panel-h"><h3>Relatório do lead</h3><button className="btn btn--dark btn--sm" onClick={gerarRelatorio}><Icon name="refresh" size={12} /> Gerar</button></div>
              <div className="panel-b" style={{ maxWidth: 680 }}>
                {report?.conteudo ? <pre style={{ whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.55, fontFamily: "var(--sans)", color: "var(--tx-dim)", margin: 0 }}>{report.conteudo}</pre> : <span className="muted" style={{ fontSize: 13 }}>Nenhum relatório gerado ainda. Clique em "Gerar".</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FieldRO({ label, value, span }: { label: string; value?: string | null; span?: number }) {
  return <div className="field" style={span ? { gridColumn: "span " + span } : undefined}><label>{label}</label><div className="input" style={{ color: value ? "var(--tx)" : "var(--tx-faint)" }}>{value || "—"}</div></div>
}

const overlay: React.CSSProperties = { position: "fixed", inset: 0, zIndex: 80, background: "rgba(5,6,5,.72)", backdropFilter: "blur(3px)", display: "flex", justifyContent: "flex-end" }
const drawer: React.CSSProperties = { width: "min(960px,94vw)", height: "100%", background: "var(--bg)", borderLeft: "1px solid var(--line)", display: "flex", flexDirection: "column", boxShadow: "-30px 0 80px rgba(0,0,0,.5)" }
