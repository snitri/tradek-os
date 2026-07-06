import { useEffect, useState } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Icon, Btn, Pill, Score } from "@/components/tradek/ui"
import { unidadeMeta, companyName, leadValor, origemLabel, updateLeadStatus, type Lead, usePipelineStatuses, leadScoreCredito, DOCS_PADRAO } from "./admin-data"
import { NewLeadModal } from "./NewLeadModal"

const LEAD_TABS = ["Resumo", "Dados", "Oportunidade", "Cotações", "Qualificação IA", "Interações", "Documentos", "Chat", "Relatório", "Histórico"]
const LEAD_SELECT = "*, companies(razao_social,nome_fantasia,cnpj,score_credito,processos_judiciais), contacts(nome,email,whatsapp,cargo), responsavel:profiles(nome)"

type Interaction = { id: string; canal: string; tipo: string; autor_tipo: string; mensagem: string | null; visivel_cliente: boolean; created_at: string }
type Doc = { id: string; tipo_documento: string; status: string; solicitado_em: string }
type RealDoc = { id: string; nome_original: string | null; tipo_documento: string | null; mime: string | null; tamanho: number | null; storage_key: string; status: string; observacoes: string | null; created_at: string }
type Report = { id: string; conteudo: string | null; score: number | null; created_at: string }
type Hist = { id: string; status_anterior: string | null; status_novo: string; created_at: string }
type EmailLogRow = { id: string; para: string[]; assunto: string | null; status: string; created_at: string; erro: string | null }
type TimelineItem = { id: string; date: string; icon: string; color: string; title: string; desc?: string }
type ConvMsg = { id: string; role: string; content: string | null; created_at: string }
type ProductOpt = { id: string; modelo: string; preco_base: number | null; moeda: string | null; cores_disponiveis: string[] | null }
type ProposalItemRow = { id: string; quantidade: number; valor_unit: number; product_id: string | null; products: { modelo: string } | null }
type Proposal = {
  id: string; status: string; valor: number | null; moeda: string | null
  observacoes: string | null; created_at: string; enviada_em: string | null
  proposal_items: ProposalItemRow[]
}
type ItemCarrinho = { productId: string; produtoNome: string; quantidade: string; valorUnit: string; coresEscolhidas: string[]; observacao: string }
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
  const [realDocs, setRealDocs] = useState<RealDoc[]>([])
  const [report, setReport] = useState<Report | null>(null)
  const [hist, setHist] = useState<Hist[]>([])
  const [chatInput, setChatInput] = useState("")
  const [aiChat, setAiChat] = useState<ConvMsg[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [products, setProducts] = useState<ProductOpt[]>([])
  const [itensCarrinho, setItensCarrinho] = useState<ItemCarrinho[]>([])
  const [itemAtual, setItemAtual] = useState({ productId: "", quantidade: "1", valorUnit: "", coresEscolhidas: [] as string[], observacao: "" })
  const [moedaCotacao, setMoedaCotacao] = useState("USD")
  const [observacoesCotacao, setObservacoesCotacao] = useState("")
  const [busyCotacao, setBusyCotacao] = useState(false)
  const [enviandoId, setEnviandoId] = useState<string | null>(null)
  const [menuEnvioId, setMenuEnvioId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [emailLog, setEmailLog] = useState<EmailLogRow[]>([])
  const [editando, setEditando] = useState(false)
  const [editForm, setEditForm] = useState({ nome: "", cargo: "", email: "", whatsapp: "", produto_servico_interesse: "", valor_estimado: "", moeda: "USD", volume_estimado: "", prazo_desejado: "", urgencia: "", indicado_por: "" })
  const [savingEdit, setSavingEdit] = useState(false)
  const [uploadingChecklistId, setUploadingChecklistId] = useState<string | null>(null)
  const [editandoChecklist, setEditandoChecklist] = useState(false)
  const [novoDoc, setNovoDoc] = useState("")

  function loadProposals() {
    supabase.from("proposals").select("id,status,valor,moeda,observacoes,created_at,enviada_em,proposal_items(id,quantidade,valor_unit,product_id,products(modelo))").eq("lead_id", leadId).order("created_at", { ascending: false }).then(({ data }) => setProposals((data ?? []) as unknown as Proposal[]))
  }

  async function loadRealDocs(lid: string, cid: string | null) {
    const q = supabase.from("documents").select("id,nome_original,tipo_documento,mime,tamanho,storage_key,status,observacoes,created_at")
    const { data } = await (cid
      ? q.or(`lead_id.eq.${lid},company_id.eq.${cid}`)
      : q.eq("lead_id", lid)
    ).order("created_at", { ascending: false })
    const seen = new Set<string>()
    setRealDocs(((data ?? []) as RealDoc[]).filter((d) => { if (seen.has(d.id)) return false; seen.add(d.id); return true }))
  }

  const [leadNotFound, setLeadNotFound] = useState(false)

  useEffect(() => {
    supabase.from("leads").select(LEAD_SELECT).eq("id", leadId).maybeSingle().then(({ data }) => {
      if (!data) setLeadNotFound(true)
      const l = data as unknown as Lead
      setLead(l)
      loadRealDocs(leadId, l?.company_id ?? null)
    })
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
    supabase.from("products").select("id,modelo,preco_base,moeda,cores_disponiveis").neq("status", "oculto").order("modelo").then(({ data }) => setProducts(data ?? []))
    supabase.from("email_log").select("id,para,assunto,status,created_at,erro").eq("lead_id", leadId).order("created_at", { ascending: false }).then(({ data }) => setEmailLog(data ?? []))
    loadProposals()
  }, [leadId])

  useEffect(() => {
    if (!menuEnvioId) return
    const fecha = () => setMenuEnvioId(null)
    window.addEventListener("click", fecha)
    return () => window.removeEventListener("click", fecha)
  }, [menuEnvioId])

  function iniciarEdicao() {
    if (!lead) return
    setEditForm({
      nome: lead.contacts?.nome ?? "",
      cargo: lead.contacts?.cargo ?? "",
      email: lead.contacts?.email ?? "",
      whatsapp: lead.contacts?.whatsapp ?? "",
      produto_servico_interesse: lead.produto_servico_interesse ?? "",
      valor_estimado: lead.valor_estimado != null ? String(lead.valor_estimado) : "",
      moeda: lead.moeda ?? "USD",
      volume_estimado: lead.volume_estimado ?? "",
      prazo_desejado: lead.prazo_desejado ?? "",
      urgencia: lead.urgencia ?? "",
      indicado_por: (lead as unknown as { indicado_por?: string }).indicado_por ?? "",
    })
    setEditando(true)
  }

  async function salvarLead() {
    if (!lead) return
    setSavingEdit(true)
    const [leadErr, contErr] = await Promise.all([
      supabase.from("leads").update({
        produto_servico_interesse: editForm.produto_servico_interesse || null,
        valor_estimado: editForm.valor_estimado ? Number(editForm.valor_estimado) : null,
        moeda: editForm.moeda || "USD",
        volume_estimado: editForm.volume_estimado || null,
        prazo_desejado: editForm.prazo_desejado || null,
        urgencia: (editForm.urgencia || null) as Lead["urgencia"],
        indicado_por: editForm.indicado_por || null,
      }).eq("id", lead.id).then(({ error }) => error),
      lead.contact_id ? supabase.from("contacts").update({
        nome: editForm.nome || undefined,
        cargo: editForm.cargo || null,
        email: editForm.email || null,
        whatsapp: editForm.whatsapp || null,
      }).eq("id", lead.contact_id).then(({ error }) => error) : Promise.resolve(null),
    ])
    setSavingEdit(false)
    if (leadErr || contErr) return toast.error("Erro ao salvar: " + (leadErr?.message ?? contErr?.message))
    // atualiza estado local sem reload
    setLead((l) => l ? {
      ...l,
      produto_servico_interesse: editForm.produto_servico_interesse || null,
      valor_estimado: editForm.valor_estimado ? Number(editForm.valor_estimado) : null,
      moeda: editForm.moeda,
      volume_estimado: editForm.volume_estimado || null,
      prazo_desejado: editForm.prazo_desejado || null,
      urgencia: (editForm.urgencia || null) as Lead["urgencia"],
      indicado_por: editForm.indicado_por || null,
      contacts: l.contacts ? { ...l.contacts, nome: editForm.nome, cargo: editForm.cargo || null, email: editForm.email || null, whatsapp: editForm.whatsapp || null } : l.contacts,
    } : l)
    setEditando(false)
    onChanged()
    toast.success("Lead atualizado.")
  }

  function onSelectProduto(productId: string) {
    const p = products.find((x) => x.id === productId)
    setItemAtual((s) => ({ ...s, productId, valorUnit: p?.preco_base != null ? String(p.preco_base) : s.valorUnit, coresEscolhidas: [] }))
    if (p?.moeda) setMoedaCotacao(p.moeda)
  }

  function adicionarItem() {
    const qtd = Number(itemAtual.quantidade) || 0
    if (!itemAtual.productId) return toast.error("Selecione um produto.")
    if (qtd <= 0) return toast.error("Informe uma quantidade válida.")
    const p = products.find((x) => x.id === itemAtual.productId)
    if (itemAtual.coresEscolhidas.length === 0) return toast.error("Selecione ao menos 1 cor para o container.")
    if (itemAtual.coresEscolhidas.length > 2) return toast.error("Máximo de 2 cores por container.")
    setItensCarrinho((s) => [...s, { productId: itemAtual.productId, produtoNome: p?.modelo ?? "—", quantidade: itemAtual.quantidade, valorUnit: itemAtual.valorUnit, coresEscolhidas: itemAtual.coresEscolhidas, observacao: itemAtual.observacao }])
    setItemAtual({ productId: "", quantidade: "1", valorUnit: "", coresEscolhidas: [], observacao: "" })
  }

  function removerItem(idx: number) {
    setItensCarrinho((s) => s.filter((_, i) => i !== idx))
  }

  async function criarCotacao() {
    if (!lead) return
    if (!itensCarrinho.length) return toast.error("Adicione ao menos um produto à cotação.")
    setBusyCotacao(true)
    const valorTotal = itensCarrinho.reduce((sum, it) => sum + (Number(it.quantidade) || 0) * (Number(it.valorUnit) || 0), 0)
    const { data: proposal, error } = await supabase.from("proposals").insert({
      lead_id: lead.id, valor: Math.round(valorTotal * 100) / 100, moeda: moedaCotacao,
      observacoes: observacoesCotacao || null, status: "rascunho",
    }).select("id").single()
    if (error || !proposal) { setBusyCotacao(false); return toast.error("Erro ao criar cotação: " + error?.message) }
    const { error: itemsError } = await supabase.from("proposal_items").insert(
      itensCarrinho.map((it) => ({
        proposal_id: proposal.id, product_id: it.productId,
        quantidade: Number(it.quantidade) || 0, valor_unit: Number(it.valorUnit) || 0,
        cores_escolhidas: it.coresEscolhidas, observacoes: it.observacao || null,
      })),
    )
    setBusyCotacao(false)
    if (itemsError) return toast.error("Erro ao adicionar itens: " + itemsError.message)
    setItensCarrinho([])
    setObservacoesCotacao("")
    loadProposals()
    toast.success("Cotação criada como rascunho.")
  }

  async function visualizarPdf(id: string) {
    setPreviewId(id)
    const { data, error } = await supabase.functions.invoke("preview-proposal", { body: { proposal_id: id } })
    setPreviewId(null)
    if (error || !data?.pdf_url) return toast.error("Erro ao gerar PDF: " + (error?.message ?? "tente novamente"))
    window.open(data.pdf_url, "_blank")
  }

  async function enviarCotacao(id: string, canal: "email" | "whatsapp") {
    setMenuEnvioId(null)
    setEnviandoId(id)
    const { data, error } = await supabase.functions.invoke("send-proposal", { body: { proposal_id: id, canal } })
    setEnviandoId(null)
    if (error || (data as { error?: string } | null)?.error) {
      // FunctionsHttpError não expõe o corpo via .message — tenta extrair o JSON real
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bodyMsg = await (error as any)?.context?.json?.().then((b: { error?: string }) => b?.error).catch(() => null)
      const msg = (data as { error?: string } | null)?.error ?? bodyMsg ?? error?.message ?? "Erro desconhecido"
      return toast.error("Erro ao enviar: " + msg)
    }
    loadProposals()
    supabase.from("email_log").select("id,para,assunto,status,created_at,erro").eq("lead_id", leadId).order("created_at", { ascending: false }).then(({ data }) => setEmailLog(data ?? []))
    onChanged()
    toast.success(`Cotação enviada por ${canal === "email" ? "e-mail" : "WhatsApp"}.`)
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
      <div onClick={(e) => e.stopPropagation()} className="fade" style={{ ...drawer, alignItems: "center", justifyContent: "center", gap: 12 }}>
        {leadNotFound ? (
          <>
            <span className="muted">Este lead não existe mais (foi excluído).</span>
            <button className="btn btn--dark btn--sm" onClick={onClose}>Fechar</button>
          </>
        ) : <span className="muted">Carregando…</span>}
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


  async function adicionarDocChecklist() {
    if (!lead || !novoDoc.trim()) return
    const jaExiste = docs.some((d) => d.tipo_documento.toLowerCase() === novoDoc.trim().toLowerCase())
    if (jaExiste) { toast.info("Esse documento já está na lista."); return }
    const { error } = await supabase.from("document_requests").insert({ lead_id: lead.id, company_id: lead.company_id, tipo_documento: novoDoc.trim(), status: "solicitado" as const })
    if (error) { toast.error("Erro ao adicionar: " + error.message); return }
    const { data } = await supabase.from("document_requests").select("id,tipo_documento,status,solicitado_em").eq("lead_id", lead.id)
    setDocs(data ?? [])
    setNovoDoc("")
    onChanged()
  }

  async function removerDocChecklist(docId: string) {
    await supabase.from("document_requests").delete().eq("id", docId)
    setDocs((prev) => prev.filter((d) => d.id !== docId))
    onChanged()
  }

  async function abrirDocumento(storageKey: string) {
    const { data } = await supabase.storage.from("tradek-documents").createSignedUrl(storageKey, 60 * 60)
    if (data?.signedUrl) window.open(data.signedUrl, "_blank")
    else toast.error("Não foi possível gerar o link do documento.")
  }

  async function excluirDocumento(docId: string, storageKey: string) {
    if (!lead) return
    await supabase.storage.from("tradek-documents").remove([storageKey])
    await supabase.from("documents").delete().eq("id", docId)
    await loadRealDocs(lead.id, lead.company_id ?? null)
    toast.success("Documento excluído.")
  }

  async function anexarChecklistDoc(file: File, tipoDocumento: string, docRequestId: string) {
    if (!lead) return
    setUploadingChecklistId(docRequestId)
    const ext = file.name.split(".").pop() ?? "bin"
    const path = `documentos/${lead.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
    const { error: upErr } = await supabase.storage.from("tradek-documents").upload(path, file, { upsert: false })
    if (upErr) { toast.error("Falha no upload: " + upErr.message); setUploadingChecklistId(null); return }
    await supabase.from("documents").insert({
      lead_id: lead.id, company_id: lead.company_id ?? null,
      storage_key: path, nome_original: file.name,
      mime: file.type || `application/${ext}`, tamanho: file.size,
      tipo_documento: tipoDocumento, status: "enviado" as const, observacoes: "admin_manual",
    })
    await supabase.from("document_requests").update({ status: "enviado" }).eq("id", docRequestId)
    setDocs((prev) => prev.map((d) => d.id === docRequestId ? { ...d, status: "enviado" } : d))
    await loadRealDocs(lead.id, lead.company_id ?? null)
    setUploadingChecklistId(null)
    toast.success("Documento anexado.")
  }

  async function solicitarDocs() {
    if (!lead) return
    const { data: existentes } = await supabase.from("document_requests").select("tipo_documento").eq("lead_id", lead.id)
    const jaTem = new Set((existentes ?? []).map((d) => d.tipo_documento))
    const novos = DOCS_PADRAO.filter((t) => !jaTem.has(t)).map((t) => ({ lead_id: lead.id, company_id: lead.company_id, tipo_documento: t, status: "solicitado" as const }))
    if (novos.length) {
      const { error } = await supabase.from("document_requests").insert(novos)
      if (error) return toast.error("Erro ao solicitar: " + error.message)
      const { data } = await supabase.from("document_requests").select("id,tipo_documento,status,solicitado_em").eq("lead_id", lead.id)
      setDocs(data ?? [])
      onChanged()
      toast.success(`${novos.length} documento(s) solicitado(s).`)
    }
    setTab("Documentos")
    // dispara notificação ao cliente (e-mail + WhatsApp) em background
    supabase.functions.invoke("notify-doc-request", { body: { lead_id: lead.id } })
      .then(({ error: fnErr, data: fnData }) => {
        if (fnErr) { toast.error("Falha ao notificar cliente: " + fnErr.message); return }
        const d = fnData as { ok: boolean; email?: boolean; whatsapp?: boolean; erros?: string[]; skipped?: string } | null
        if (d?.skipped) { toast.info("Notificação não enviada: " + d.skipped); return }
        if (d?.erros?.length) { toast.error("Notificação parcial: " + d.erros.join(" | ")); return }
        const canais = [d?.email && "e-mail", d?.whatsapp && "WhatsApp"].filter(Boolean).join(" e ")
        if (canais) toast.success(`Cliente notificado por ${canais}.`)
        else toast.info("Contato sem e-mail e sem WhatsApp cadastrado — notificação não enviada.")
      })
      .catch((e: unknown) => toast.error("Erro inesperado ao notificar: " + String(e)))
  }

  function buildTimeline(): TimelineItem[] {
    const items: TimelineItem[] = []
    if (lead) {
      items.push({ id: "created", date: lead.created_at, icon: "plus", color: "var(--lime)", title: "Lead criado", desc: `Canal: ${origemLabel(lead.origem)}` })
    }
    for (const h of hist) {
      items.push({ id: "hist-" + h.id, date: h.created_at, icon: "refresh", color: "var(--tx-mute)", title: `Status: ${h.status_anterior ?? "—"} → ${h.status_novo}` })
    }
    for (const e of emailLog) {
      items.push({
        id: "email-" + e.id, date: e.created_at, icon: "mail", color: e.status === "enviado" ? "var(--ok)" : "var(--danger)",
        title: `E-mail ${e.status === "enviado" ? "enviado" : "com falha"}: ${e.assunto ?? "(sem assunto)"}`,
        desc: `Para: ${(e.para ?? []).join(", ")}` + (e.erro ? ` · Erro: ${e.erro}` : ""),
      })
    }
    for (const p of proposals) {
      const nomesItens = p.proposal_items.map((it) => it.products?.modelo ?? "produto removido").join(", ") || "sem itens"
      items.push({ id: "prop-created-" + p.id, date: p.created_at, icon: "coins", color: "var(--tx-mute)", title: `Cotação criada (${nomesItens})`, desc: `${p.moeda} ${Number(p.valor ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` })
      if (p.enviada_em) items.push({ id: "prop-sent-" + p.id, date: p.enviada_em, icon: "send", color: "var(--lime)", title: `Cotação enviada (${PROPOSAL_STATUS_LABEL[p.status] ?? p.status})`, desc: nomesItens })
    }
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
            <div className="col gap14">
              <div className="row center" style={{ justifyContent: "flex-end" }}>
                {editando
                  ? <div className="row gap8"><button className="btn btn--ghost btn--sm" onClick={() => setEditando(false)}>Cancelar</button><Btn variant="lime" size="sm" icon="check" disabled={savingEdit} onClick={salvarLead}>{savingEdit ? "Salvando…" : "Salvar"}</Btn></div>
                  : <button className="btn btn--dark btn--sm" onClick={iniciarEdicao}><Icon name="edit" size={13} /> Editar</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
              {editando ? (<>
                <div className="field"><label>Contato</label><input className="input" value={editForm.nome} onChange={(e) => setEditForm((s) => ({ ...s, nome: e.target.value }))} /></div>
                <div className="field"><label>Cargo</label><input className="input" value={editForm.cargo} onChange={(e) => setEditForm((s) => ({ ...s, cargo: e.target.value }))} /></div>
                <FieldRO label="Empresa" value={companyName(lead)} span={2} />
                <FieldRO label="CNPJ" value={lead.companies?.cnpj} /><FieldRO label="Origem" value={origemLabel(lead.origem)} />
                <div className="field"><label>E-mail</label><input className="input" type="email" value={editForm.email} onChange={(e) => setEditForm((s) => ({ ...s, email: e.target.value }))} /></div>
                <div className="field"><label>WhatsApp</label><input className="input" value={editForm.whatsapp} onChange={(e) => setEditForm((s) => ({ ...s, whatsapp: e.target.value }))} /></div>
                <div className="field" style={{ gridColumn: "span 2" }}><label>Indicado por</label><input className="input" placeholder="Nome de quem indicou este cliente…" value={editForm.indicado_por} onChange={(e) => setEditForm((s) => ({ ...s, indicado_por: e.target.value }))} /></div>
              </>) : (<>
                <FieldRO label="Contato" value={lead.contacts?.nome} /><FieldRO label="Cargo" value={lead.contacts?.cargo} />
                <FieldRO label="Empresa" value={companyName(lead)} span={2} />
                <FieldRO label="CNPJ" value={lead.companies?.cnpj} /><FieldRO label="Origem" value={origemLabel(lead.origem)} />
                <FieldRO label="E-mail" value={lead.contacts?.email} /><FieldRO label="WhatsApp" value={lead.contacts?.whatsapp} />
                {lead.indicado_por && <FieldRO label="Indicado por" value={lead.indicado_por} span={2} />}
              </>)}
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
            </div>
          )}

          {tab === "Oportunidade" && (
            <div className="col gap14">
              <div className="row center" style={{ justifyContent: "space-between" }}>
                <div className="row gap8 center"><span className="pill" style={{ borderColor: u.color + "66", color: u.color }}><Icon name={u.icon} size={11} />{u.label}</span><span className="tag">Campos específicos da unidade</span></div>
                {editando
                  ? <div className="row gap8"><button className="btn btn--ghost btn--sm" onClick={() => setEditando(false)}>Cancelar</button><Btn variant="lime" size="sm" icon="check" disabled={savingEdit} onClick={salvarLead}>{savingEdit ? "Salvando…" : "Salvar"}</Btn></div>
                  : <button className="btn btn--dark btn--sm" onClick={iniciarEdicao}><Icon name="edit" size={13} /> Editar</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {editando ? (<>
                  <div className="field" style={{ gridColumn: "span 2" }}><label>Produto / serviço</label><input className="input" value={editForm.produto_servico_interesse} onChange={(e) => setEditForm((s) => ({ ...s, produto_servico_interesse: e.target.value }))} /></div>
                  <div className="field"><label>Urgência</label>
                    <select className="select" value={editForm.urgencia} onChange={(e) => setEditForm((s) => ({ ...s, urgencia: e.target.value }))}>
                      <option value="">—</option><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="critica">Crítica</option>
                    </select>
                  </div>
                  <div className="field"><label>Valor estimado</label><input className="input" type="number" value={editForm.valor_estimado} onChange={(e) => setEditForm((s) => ({ ...s, valor_estimado: e.target.value }))} /></div>
                  <div className="field"><label>Moeda</label>
                    <select className="select" value={editForm.moeda} onChange={(e) => setEditForm((s) => ({ ...s, moeda: e.target.value }))}>
                      <option>USD</option><option>BRL</option><option>CNY</option>
                    </select>
                  </div>
                  <div className="field"><label>Volume estimado</label><input className="input" value={editForm.volume_estimado} onChange={(e) => setEditForm((s) => ({ ...s, volume_estimado: e.target.value }))} /></div>
                  <div className="field"><label>Prazo desejado</label><input className="input" value={editForm.prazo_desejado} onChange={(e) => setEditForm((s) => ({ ...s, prazo_desejado: e.target.value }))} /></div>
                </>) : (<>
                  <FieldRO label="Produto / serviço" value={lead.produto_servico_interesse} />
                  <FieldRO label="Valor estimado" value={leadValor(lead)} />
                  <FieldRO label="Volume" value={lead.volume_estimado} />
                  <FieldRO label="Prazo desejado" value={lead.prazo_desejado} />
                  <FieldRO label="Urgência" value={lead.urgencia} />
                </>)}
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
                    <select className="select" value={itemAtual.productId} onChange={(e) => onSelectProduto(e.target.value)}>
                      <option value="">Selecione…</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.modelo}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Quantidade</label><input className="input" type="number" min="1" value={itemAtual.quantidade} onChange={(e) => setItemAtual((s) => ({ ...s, quantidade: e.target.value }))} /></div>
                  <div className="field"><label>Valor unitário</label><input className="input" type="number" min="0" step="0.01" value={itemAtual.valorUnit} onChange={(e) => setItemAtual((s) => ({ ...s, valorUnit: e.target.value }))} /></div>
                </div>
                {/* Seleção de cores — sempre visível quando um produto está selecionado */}
                {itemAtual.productId && (() => {
                  const prod = products.find((p) => p.id === itemAtual.productId)
                  // Usa as cores do produto, ou as 5 padrão se não tiver nenhuma configurada
                  const coresBase = (prod?.cores_disponiveis ?? []).length > 0
                    ? (prod!.cores_disponiveis as string[])
                    : ["Preto", "Branco", "Vermelho", "Verde", "Amarelo"]
                  const corHex: Record<string, string> = { Preto: "#1a1a1a", Branco: "#f0f0f0", Vermelho: "#e03535", Verde: "#2d9e4e", Amarelo: "#e8c22a" }
                  return (
                    <div className="field" style={{ marginTop: 12 }}>
                      <label>
                        Cores do container <span className="muted">(máx. 2 · obrigatório)</span>
                      </label>
                      {itemAtual.coresEscolhidas.length === 2 && (
                        <div style={{ fontSize: 11.5, color: "var(--lime)", fontWeight: 600, marginTop: 4 }}>
                          50% {itemAtual.coresEscolhidas[0]} · 50% {itemAtual.coresEscolhidas[1]}
                        </div>
                      )}
                      <div className="row gap8" style={{ flexWrap: "wrap", marginTop: 6 }}>
                        {coresBase.map((cor) => {
                          const sel = itemAtual.coresEscolhidas.includes(cor)
                          const disabled = !sel && itemAtual.coresEscolhidas.length >= 2
                          return (
                            <button key={cor} type="button" disabled={disabled}
                              onClick={() => setItemAtual((s) => ({ ...s, coresEscolhidas: sel ? s.coresEscolhidas.filter((x) => x !== cor) : [...s.coresEscolhidas, cor] }))}
                              style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 20, border: sel ? "2px solid var(--lime)" : "1.5px solid var(--line)", background: sel ? "var(--bg-2)" : "transparent", cursor: disabled ? "not-allowed" : "pointer", fontSize: 12.5, fontWeight: 600, color: sel ? "var(--tx)" : "var(--tx-mute)", opacity: disabled ? 0.4 : 1 }}>
                              <span style={{ width: 13, height: 13, borderRadius: "50%", background: corHex[cor] ?? "#888", border: cor === "Branco" ? "1px solid var(--line)" : "none", flexShrink: 0 }} />
                              {cor}
                            </button>
                          )
                        })}
                      </div>
                      <div className="field" style={{ marginTop: 12 }}>
                        <label>Observação do produto <span className="muted">(opcional)</span></label>
                        <textarea className="textarea" placeholder="Ex: bateria reforçada, cor customizada…" value={itemAtual.observacao} rows={2} style={{ fontSize: 12.5, resize: "vertical" }} onChange={(e) => setItemAtual((s) => ({ ...s, observacao: e.target.value }))} />
                      </div>
                    </div>
                  )
                })()}
                <button className="btn btn--dark btn--sm" style={{ marginTop: 12 }} onClick={adicionarItem}><Icon name="plus" size={13} /> Adicionar produto à cotação</button>

                {itensCarrinho.length > 0 && (
                  <div className="col gap8" style={{ marginTop: 16 }}>
                    {itensCarrinho.map((it, idx) => (
                      <div key={idx} className="col" style={{ padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, gap: 8 }}>
                        <div className="row center gap10">
                          <div className="col fill" style={{ gap: 3 }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{it.produtoNome} <span className="muted" style={{ fontWeight: 400 }}>× {it.quantidade}</span></span>
                            {it.coresEscolhidas.length > 0 && (
                              <div className="row gap5 center" style={{ flexWrap: "wrap" }}>
                                {it.coresEscolhidas.map((cor, ci) => {
                                  const corHex: Record<string, string> = { Preto: "#1a1a1a", Branco: "#f0f0f0", Vermelho: "#e03535", Verde: "#2d9e4e", Amarelo: "#e8c22a" }
                                  return (
                                    <span key={cor} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--tx-mute)" }}>
                                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: corHex[cor] ?? "#888", border: cor === "Branco" ? "1px solid var(--line)" : "none" }} />
                                      {it.coresEscolhidas.length === 2 ? `50% ${cor}` : cor}
                                      {it.coresEscolhidas.length === 2 && ci === 0 && <span style={{ color: "var(--line)" }}>·</span>}
                                    </span>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                          <span className="muted" style={{ fontSize: 12.5, flexShrink: 0 }}>{moedaCotacao} {((Number(it.valorUnit) || 0) * (Number(it.quantidade) || 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          <button className="btn btn--icon btn--dark" onClick={() => removerItem(idx)}><Icon name="trash" size={12} /></button>
                        </div>
                        {it.observacao && (
                          <div style={{ fontSize: 12, color: "var(--tx-mute)", fontStyle: "italic", paddingTop: 2 }}>
                            Obs: {it.observacao}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                  <div className="field"><label>Moeda</label>
                    <select className="select" value={moedaCotacao} onChange={(e) => setMoedaCotacao(e.target.value)}>
                      <option value="USD">USD</option><option value="BRL">BRL</option><option value="CNY">CNY</option>
                    </select>
                  </div>
                  <div className="field"><label>Total da cotação</label><div className="input" style={{ color: "var(--tx-dim)" }}>{moedaCotacao} {itensCarrinho.reduce((sum, it) => sum + (Number(it.quantidade) || 0) * (Number(it.valorUnit) || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div></div>
                </div>
                <div className="field" style={{ marginTop: 12 }}><label>Observações</label><textarea className="textarea" placeholder="Condições, prazo, observações da cotação…" value={observacoesCotacao} onChange={(e) => setObservacoesCotacao(e.target.value)}></textarea></div>
                <button className="btn btn--lime btn--sm" style={{ marginTop: 14 }} disabled={busyCotacao || !itensCarrinho.length} onClick={criarCotacao}><Icon name="check" size={13} /> {busyCotacao ? "Criando…" : "Criar cotação (rascunho)"}</button>
              </div>

              <div className="panel">
                <div className="panel-h"><h3>Cotações deste lead</h3>{proposals.length > 0 && <span className="tag">{proposals.length}</span>}</div>
                <div className="panel-b col gap10">
                  {proposals.length ? proposals.map((p) => (
                    <div key={p.id} className="row center gap14" style={{ padding: "10px 0", borderBottom: "1px solid var(--line-soft)" }}>
                      <span style={{ width: 36, height: 36, borderRadius: 9, background: "var(--bg)", border: "1px solid var(--line)", display: "grid", placeItems: "center", flexShrink: 0, color: "var(--lime)" }}><Icon name="coins" size={16} /></span>
                      <div className="col fill" style={{ lineHeight: 1.4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{p.proposal_items.map((it) => `${it.products?.modelo ?? "Produto removido"} × ${it.quantidade}`).join(", ") || "Sem itens"}</span>
                        <span className="muted" style={{ fontSize: 12.5 }}>{p.moeda} {Number(p.valor ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} · {new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <Pill variant={p.status === "enviada" || p.status === "aceita" ? "ok" : p.status === "recusada" || p.status === "cancelada" ? "danger" : "warn"}>{PROPOSAL_STATUS_LABEL[p.status] ?? p.status}</Pill>
                      {p.status !== "aceita" && p.status !== "recusada" && p.status !== "cancelada" && (
                        <div className="row gap6">
                          <button
                            className="btn btn--dark btn--sm"
                            disabled={previewId === p.id}
                            onClick={(e) => { e.stopPropagation(); visualizarPdf(p.id) }}
                            title="Visualizar PDF antes de enviar"
                          >
                            <Icon name="eye" size={12} /> {previewId === p.id ? "Gerando…" : "PDF"}
                          </button>
                        <div style={{ position: "relative" }}>
                          <button
                            className="btn btn--lime btn--sm"
                            disabled={enviandoId === p.id}
                            onClick={(e) => { e.stopPropagation(); setMenuEnvioId(menuEnvioId === p.id ? null : p.id) }}
                          >
                            <Icon name="send" size={12} /> {enviandoId === p.id ? "Enviando…" : "Enviar"} <Icon name="chevD" size={11} />
                          </button>
                          {menuEnvioId === p.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="col"
                              style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 20, background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 8, padding: 4, minWidth: 140, boxShadow: "0 8px 24px rgba(0,0,0,.4)" }}
                            >
                              <button className="btn btn--ghost btn--sm" style={{ justifyContent: "flex-start" }} onClick={() => enviarCotacao(p.id, "email")}><Icon name="mail" size={13} /> E-mail</button>
                              <button className="btn btn--ghost btn--sm" style={{ justifyContent: "flex-start" }} onClick={() => enviarCotacao(p.id, "whatsapp")}><Icon name="chat" size={13} /> WhatsApp</button>
                            </div>
                          )}
                        </div>
                        </div>
                      )}
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

          {tab === "Interações" && (
            <div className="panel panel-b">
              {interactions.length ? <div className="col gap14">{interactions.map((it) => <div key={it.id} className="row gap12"><span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-3)", border: "1px solid var(--line)", display: "grid", placeItems: "center", flexShrink: 0, color: it.visivel_cliente ? "var(--tx-dim)" : "var(--warn)" }}><Icon name={it.autor_tipo === "ia" ? "brain" : it.autor_tipo === "cliente" ? "user" : "chat"} size={13} /></span><div className="col" style={{ flex: 1 }}><div className="row center gap8"><span style={{ fontSize: 13, fontWeight: 700 }}>{it.autor_tipo}</span>{!it.visivel_cliente && <span className="pill pill--warn" style={{ fontSize: 9.5, padding: "1px 6px" }}>interno</span>}<span className="tag mla">{new Date(it.created_at).toLocaleString("pt-BR")}</span></div><p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: "4px 0 0" }}>{it.mensagem}</p></div></div>)}</div> : <span className="muted" style={{ fontSize: 13 }}>Sem interações registradas.</span>}
            </div>
          )}

          {tab === "Histórico" && (
            <div className="panel panel-b">
              {(() => {
                const tl = buildTimeline()
                return tl.length ? <div className="col gap14">{tl.map((it) => (
                  <div key={it.id} className="row gap12">
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-3)", border: "1px solid var(--line)", display: "grid", placeItems: "center", flexShrink: 0, color: it.color }}><Icon name={it.icon} size={13} /></span>
                    <div className="col" style={{ flex: 1 }}>
                      <div className="row center gap8"><span style={{ fontSize: 13, fontWeight: 700 }}>{it.title}</span><span className="tag mla">{new Date(it.date).toLocaleString("pt-BR")}</span></div>
                      {it.desc && <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, margin: "3px 0 0" }}>{it.desc}</p>}
                    </div>
                  </div>
                ))}</div> : <span className="muted" style={{ fontSize: 13 }}>Sem histórico registrado.</span>
              })()}
            </div>
          )}

          {tab === "Documentos" && (
            <div className="col gap14">
              {/* Checklist de documentos solicitados */}
              {docs.length > 0 && (
                <div className="panel">
                  <div className="panel-h">
                    <h3>Documentos solicitados</h3>
                    <button className="btn btn--ghost btn--sm" onClick={() => setEditandoChecklist((v) => !v)}>
                      <Icon name={editandoChecklist ? "x" : "edit"} size={13} /> {editandoChecklist ? "Fechar edição" : "Editar lista"}
                    </button>
                  </div>
                  <div className="panel-b" style={{ padding: 0 }}>
                    <table className="tbl">
                      <thead><tr><th>Documento</th><th>Arquivo</th><th style={{ width: 80 }}>Tamanho</th><th style={{ width: 96 }}>Data</th><th style={{ width: editandoChecklist ? 50 : 96 }}>Ações</th></tr></thead>
                      <tbody>{docs.map((d) => {
                        const attached = realDocs.find((r) => r.tipo_documento === d.tipo_documento)
                        const loading = uploadingChecklistId === d.id
                        return (
                          <tr key={d.id}>
                            <td>
                              <div className="row gap8 center">
                                <Icon name="doc" size={15} style={{ color: attached ? "var(--ok)" : "var(--tx-mute)", flexShrink: 0 }} />
                                <span className="strong" style={{ fontSize: 13 }}>{d.tipo_documento}</span>
                              </div>
                            </td>
                            <td style={{ fontSize: 12 }}>
                              {attached
                                ? <span style={{ color: "var(--tx)" }}>{attached.nome_original ?? "arquivo"}</span>
                                : <span style={{ color: "var(--tx-faint)" }}>—</span>}
                            </td>
                            <td className="mono" style={{ fontSize: 12 }}>
                              {attached?.tamanho ? (attached.tamanho > 1048576 ? (attached.tamanho / 1048576).toFixed(1) + " MB" : Math.round(attached.tamanho / 1024) + " KB") : "—"}
                            </td>
                            <td className="mono" style={{ fontSize: 12 }}>
                              {attached ? new Date(attached.created_at).toLocaleDateString("pt-BR") : "—"}
                            </td>
                            <td>
                              {editandoChecklist ? (
                                <button className="btn btn--danger btn--sm" title="Remover da lista" onClick={() => removerDocChecklist(d.id)}><Icon name="trash" size={13} /></button>
                              ) : (
                                <div className="row gap6 center">
                                  {attached ? (<>
                                    <button className="btn btn--ghost btn--sm" title="Baixar" onClick={() => abrirDocumento(attached.storage_key)}><Icon name="download" size={13} /></button>
                                    <button className="btn btn--danger btn--sm" title="Excluir arquivo" onClick={() => excluirDocumento(attached.id, attached.storage_key)}><Icon name="trash" size={13} /></button>
                                  </>) : (
                                    <label className="btn btn--lime btn--sm" style={{ cursor: loading ? "wait" : "pointer" }}>
                                      {loading ? <><Icon name="loader" size={12} /> Enviando…</> : <><Icon name="upload" size={12} /> Anexar</>}
                                      <input type="file" style={{ display: "none" }} disabled={!!loading} onChange={(e) => { const f = e.target.files?.[0]; if (f) anexarChecklistDoc(f, d.tipo_documento, d.id); e.target.value = "" }} />
                                    </label>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}</tbody>
                    </table>
                    {/* Adicionar novo documento */}
                    {editandoChecklist && (
                      <div className="row gap8" style={{ padding: "10px 12px", borderTop: "1px solid var(--line)" }}>
                        <input
                          className="input fill"
                          placeholder="Nome do documento…"
                          value={novoDoc}
                          onChange={(e) => setNovoDoc(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && adicionarDocChecklist()}
                        />
                        <button className="btn btn--lime btn--sm" onClick={adicionarDocChecklist} disabled={!novoDoc.trim()}>
                          <Icon name="plus" size={13} /> Adicionar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
