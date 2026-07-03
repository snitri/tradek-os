import { useEffect, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import type { Database } from "@/lib/database.types"
import { Icon, Btn, Pill, Avatar, Score } from "@/components/tradek/ui"
import { unidadeMeta, DOCS_PADRAO } from "./admin-data"

type Product = Database["tradek"]["Tables"]["products"]["Row"]
type Company = Database["tradek"]["Tables"]["companies"]["Row"]
type Profile = Database["tradek"]["Tables"]["profiles"]["Row"] & { companies: { razao_social: string | null; nome_fantasia: string | null } | null }
type Task = Database["tradek"]["Tables"]["tasks"]["Row"]
type AgentConfig = Database["tradek"]["Tables"]["agent_configs"]["Row"]
type RagDoc = Database["tradek"]["Tables"]["rag_documents"]["Row"]
type NotifRule = Database["tradek"]["Tables"]["notification_rules"]["Row"]
type EmailTpl = Database["tradek"]["Tables"]["email_templates"]["Row"]
type Pipeline = Database["tradek"]["Tables"]["pipeline_statuses"]["Row"]

export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="row center" style={{ justifyContent: "space-between", marginBottom: 16 }}>
      <div><h2 className="disp" style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{title}</h2>{sub && <p className="muted" style={{ fontSize: 13, margin: "4px 0 0" }}>{sub}</p>}</div>
      {actions && <div className="row gap8">{actions}</div>}
    </div>
  )
}

function img0(p: Product): string | undefined {
  const a = p.imagens as unknown
  return Array.isArray(a) && typeof a[0] === "string" ? (a[0] as string) : undefined
}

/* ---------------- PRODUTOS ---------------- */
export function AdminProdutos() {
  const [products, setProducts] = useState<Product[]>([])
  const [modal, setModal] = useState<Product | "new" | null>(null)
  const load = () => supabase.from("products").select("*").order("preco_base", { ascending: false }).then(({ data }) => setProducts(data ?? []))
  useEffect(() => { load() }, [])

  return (
    <div className="fade">
      <PageHead title="Produtos & Serviços" sub="Catálogo dinâmico — alimenta o site e o agente IA" actions={<button className="btn btn--lime btn--sm" onClick={() => setModal("new")}><Icon name="plus" size={13} /> Novo produto</button>} />
      <div className="panel scroll" style={{ overflow: "auto" }}>
        <table className="tbl"><thead><tr>{["Modelo", "Categoria", "Motor", "Bateria", "Velocidade", "Autonomia", "MOQ", "Valor base", "Status", "Site", "Cotação IA", ""].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>{products.map((p) => (
            <tr key={p.id} onClick={() => setModal(p)} style={{ cursor: "pointer" }}>
              <td><div className="row gap10 center"><span className="moto-thumb" style={{ width: 38, height: 38, borderRadius: 7, flexShrink: 0 }}>{img0(p) && <img src={img0(p)} alt={p.modelo} />}</span><span className="strong">{p.modelo}</span></div></td>
              <td>{p.categoria}</td><td className="mono">{p.motor}</td><td>{p.bateria}</td><td className="mono">{p.velocidade}</td><td className="mono">{p.autonomia}</td>
              <td><span className="pill" style={{ fontSize: 11 }}>{p.moq ?? "—"}</span></td>
              <td className="mono strong">{p.moeda} {p.preco_base}</td>
              <td><Pill variant={p.status === "publicado" ? "ok" : "warn"}>{p.status}</Pill></td>
              <td>{p.publicado_site ? <Icon name="check" size={15} style={{ color: "var(--ok)" }} /> : <Icon name="x" size={15} style={{ color: "var(--tx-faint)" }} />}</td>
              <td>{p.permitir_cotacao_ia ? <Pill variant="ok">Sim</Pill> : <Pill>Não</Pill>}</td>
              <td><button className="btn btn--dark btn--sm" onClick={(e) => { e.stopPropagation(); setModal(p) }}><Icon name="edit" size={12} /></button></td>
            </tr>
          ))}
          {products.length === 0 && <tr><td colSpan={12} style={{ padding: 20, color: "var(--tx-mute)" }}>Nenhum produto.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="panel panel-b" style={{ marginTop: 12, background: "var(--bg-2)", display: "flex", gap: 12, alignItems: "center" }}>
        <Icon name="brain" size={18} style={{ color: "var(--lime)", flexShrink: 0 }} />
        <span className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>A IA só informa preço quando o produto está <b style={{ color: "var(--tx)" }}>publicado</b>, com <b style={{ color: "var(--tx)" }}>cotação IA ativa</b>. Caso contrário, registra a solicitação e encaminha para a equipe.</span>
      </div>
      {modal && <ProdutoModal produto={modal === "new" ? null : modal} onClose={() => { setModal(null); load() }} />}
    </div>
  )
}

function ProdutoModal({ produto, onClose }: { produto: Product | null; onClose: () => void }) {
  const isNew = !produto
  const CORES_OPCOES = ["Preto", "Branco", "Vermelho", "Verde", "Amarelo"]
  const [f, setF] = useState({
    modelo: produto?.modelo ?? "", categoria: produto?.categoria ?? "Moto Eletrica",
    motor: produto?.motor ?? "", velocidade: produto?.velocidade ?? "", autonomia: produto?.autonomia ?? "",
    bateria: produto?.bateria ?? "", freios: produto?.freios ?? "", moq: produto?.moq ?? "One container",
    preco_base: String(produto?.preco_base ?? ""), moeda: produto?.moeda ?? "USD",
    descricao_curta: produto?.descricao_curta ?? "", status: produto?.status ?? "rascunho",
    publicado_site: produto?.publicado_site ?? false, permitir_cotacao_ia: produto?.permitir_cotacao_ia ?? false,
  })
  const existingCores = (): string[] => {
    const a = (produto as (typeof produto & { cores_disponiveis?: unknown }))?.cores_disponiveis
    return Array.isArray(a) ? (a as string[]) : []
  }
  const [coresDisponiveis, setCoresDisponiveis] = useState<string[]>(existingCores)
  function toggleCor(cor: string) {
    setCoresDisponiveis((prev) => prev.includes(cor) ? prev.filter((c) => c !== cor) : [...prev, cor])
  }
  const existingImagens = (): string[] => {
    const a = produto?.imagens as unknown
    return Array.isArray(a) ? (a as string[]).filter((x) => typeof x === "string") : []
  }
  const [imagens, setImagens] = useState<string[]>(existingImagens)
  const [uploadBusy, setUploadBusy] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: string | boolean) => setF((s) => ({ ...s, [k]: v }))

  async function uploadImagem(file: File) {
    setUploadBusy(true)
    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `produtos/${produto?.id ?? "new"}-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from("tradek-documents").upload(path, file, { upsert: true })
    if (upErr) { toast.error("Falha no upload: " + upErr.message); setUploadBusy(false); return }
    // bucket não é público — gera URL assinada de longa duração (10 anos)
    const { data: signed } = await supabase.storage.from("tradek-documents").createSignedUrl(path, 60 * 60 * 24 * 365 * 10)
    if (!signed?.signedUrl) { toast.error("Falha ao gerar URL da imagem"); setUploadBusy(false); return }
    setImagens((prev) => [...prev, signed.signedUrl])
    setUploadBusy(false)
  }

  function removerImagem(url: string) {
    setImagens((prev) => prev.filter((u) => u !== url))
  }

  async function save() {
    setBusy(true)
    const payload = {
      modelo: f.modelo, categoria: f.categoria, motor: f.motor, velocidade: f.velocidade, autonomia: f.autonomia,
      bateria: f.bateria, freios: f.freios, moq: f.moq, preco_base: f.preco_base ? Number(f.preco_base) : null,
      moeda: f.moeda, descricao_curta: f.descricao_curta, status: f.status,
      publicado_site: f.publicado_site, permitir_cotacao_ia: f.permitir_cotacao_ia,
      imagens, cores_disponiveis: coresDisponiveis,
    }
    const { error } = produto ? await supabase.from("products").update(payload).eq("id", produto.id) : await supabase.from("products").insert(payload)
    setBusy(false)
    if (error) return toast.error("Erro: " + error.message)
    toast.success(isNew ? "Produto criado." : "Produto salvo.")
    onClose()
  }

  return createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(5,6,5,.72)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="fade panel" style={{ width: "min(680px,96vw)", maxHeight: "92vh", display: "flex", flexDirection: "column", background: "var(--bg-1)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <div className="row center gap12">
            <span className="moto-thumb" style={{ width: 46, height: 46, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0 }}>{imagens[0] ? <img src={imagens[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 9 }} /> : <Icon name="box" size={20} style={{ color: "#7a8074" }} />}</span>
            <div className="col" style={{ lineHeight: 1.3 }}><span className="disp" style={{ fontSize: 18, fontWeight: 600 }}>{isNew ? "Novo produto" : f.modelo}</span><span className="tag">Catálogo dinâmico · alimenta site e agente IA</span></div>
            <button className="btn btn--icon btn--dark mla" onClick={onClose}><Icon name="x" size={16} /></button>
          </div>
        </div>
        <div className="scroll" style={{ flex: 1, padding: 20 }}>
          {/* Imagens */}
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Imagens do produto</label>
            <div className="row gap8" style={{ flexWrap: "wrap", marginTop: 6 }}>
              {imagens.map((url) => (
                <div key={url} style={{ position: "relative", width: 72, height: 72, borderRadius: 8, overflow: "hidden", border: "1px solid var(--line)" }}>
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={() => removerImagem(url)} style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,.65)", border: "none", borderRadius: 4, cursor: "pointer", padding: "2px 4px", display: "grid", placeItems: "center" }}>
                    <Icon name="x" size={11} style={{ color: "#fff" }} />
                  </button>
                </div>
              ))}
              <label style={{ width: 72, height: 72, borderRadius: 8, border: "1.5px dashed var(--line)", display: "grid", placeItems: "center", cursor: uploadBusy ? "wait" : "pointer", color: "var(--tx-mute)", flexShrink: 0 }}>
                {uploadBusy ? <Icon name="loader" size={20} style={{ color: "var(--lime)" }} /> : <Icon name="upload" size={20} />}
                <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploadBusy} onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadImagem(file); e.target.value = "" }} />
              </label>
            </div>
            <span className="muted" style={{ fontSize: 11.5, marginTop: 4, display: "block" }}>A primeira imagem é usada na proposta PDF e no site.</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="field"><label>Modelo</label><input className="input" value={f.modelo} onChange={(e) => set("modelo", e.target.value)} /></div>
            <div className="field"><label>Categoria</label><input className="input" value={f.categoria} onChange={(e) => set("categoria", e.target.value)} /></div>
            <div className="field"><label>Motor</label><input className="input" value={f.motor} onChange={(e) => set("motor", e.target.value)} /></div>
            <div className="field"><label>Velocidade</label><input className="input" value={f.velocidade} onChange={(e) => set("velocidade", e.target.value)} /></div>
            <div className="field"><label>Autonomia</label><input className="input" value={f.autonomia} onChange={(e) => set("autonomia", e.target.value)} /></div>
            <div className="field"><label>Bateria</label><input className="input" value={f.bateria} onChange={(e) => set("bateria", e.target.value)} /></div>
            <div className="field"><label>Preço base</label><input className="input" value={f.preco_base} onChange={(e) => set("preco_base", e.target.value)} /></div>
            <div className="field"><label>Moeda</label><select className="select" value={f.moeda} onChange={(e) => set("moeda", e.target.value)}><option>USD</option><option>BRL</option><option>CNY</option></select></div>
            <div className="field"><label>MOQ (Minimum Order Quantity)</label><input className="input" value={f.moq} onChange={(e) => set("moq", e.target.value)} /></div>
            <div className="field"><label>Status</label><select className="select" value={f.status} onChange={(e) => set("status", e.target.value)}><option value="rascunho">Rascunho</option><option value="em_revisao">Em revisão</option><option value="publicado">Publicado</option><option value="oculto">Oculto</option></select></div>
            <div className="field" style={{ gridColumn: "span 2" }}><label>Descrição curta</label><input className="input" value={f.descricao_curta} onChange={(e) => set("descricao_curta", e.target.value)} /></div>
          </div>
          {/* Cores disponíveis */}
          <div className="field" style={{ marginTop: 16 }}>
            <label>Cores disponíveis</label>
            <div className="row gap8" style={{ flexWrap: "wrap", marginTop: 8 }}>
              {CORES_OPCOES.map((cor) => {
                const corHex: Record<string, string> = { Preto: "#1a1a1a", Branco: "#f5f5f5", Vermelho: "#e03535", Verde: "#2d9e4e", Amarelo: "#e8c22a" }
                const sel = coresDisponiveis.includes(cor)
                return (
                  <button key={cor} type="button" onClick={() => toggleCor(cor)}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 20, border: sel ? "2px solid var(--lime)" : "1.5px solid var(--line)", background: sel ? "var(--bg-2)" : "transparent", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: sel ? "var(--tx)" : "var(--tx-mute)" }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: corHex[cor], border: cor === "Branco" ? "1px solid var(--line)" : "none", flexShrink: 0 }} />
                    {cor}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="col gap10" style={{ marginTop: 16 }}>
            {([["Publicar no site", "publicado_site", "globe"], ["Permitir cotação por IA", "permitir_cotacao_ia", "brain"]] as [string, "publicado_site" | "permitir_cotacao_ia", string][]).map(([t, k, ic]) => (
              <label key={k} className="panel panel-b row center" style={{ justifyContent: "space-between", cursor: "pointer" }}>
                <div className="row gap10 center"><Icon name={ic} size={16} style={{ color: "var(--lime)" }} /><span style={{ fontSize: 13, fontWeight: 600 }}>{t}</span></div>
                <input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} style={{ accentColor: "var(--lime)", width: 16, height: 16 }} />
              </label>
            ))}
          </div>
        </div>
        <div className="row center" style={{ padding: "14px 20px", borderTop: "1px solid var(--line)", justifyContent: "flex-end" }}>
          <div className="row gap8"><button className="btn btn--ghost btn--sm" onClick={onClose}>Cancelar</button><Btn variant="lime" size="sm" icon="check" disabled={busy} onClick={save}>{busy ? "Salvando…" : isNew ? "Criar produto" : "Salvar"}</Btn></div>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ---------------- EMPRESAS ---------------- */
function EmpresaField({ label, value }: { label: string; value?: string | null | boolean }) {
  const display = typeof value === "boolean" ? (value ? "Sim" : "Não") : value
  return (
    <div><div className="tag" style={{ marginBottom: 2 }}>{label}</div><div style={{ fontSize: 14, color: "var(--tx)" }}>{display || <span style={{ color: "var(--tx-mute)" }}>—</span>}</div></div>
  )
}

type CompanyContact = { id: string; nome: string; cargo: string | null; email: string | null; whatsapp: string | null }

function EmpresaModal({ empresa, onClose, onSaved }: { empresa: Company; onClose: () => void; onSaved: () => void }) {
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState({
    razao_social: empresa.razao_social ?? "",
    nome_fantasia: empresa.nome_fantasia ?? "",
    cnpj: empresa.cnpj ?? "",
    inscricao_estadual: empresa.inscricao_estadual ?? "",
    inscricao_municipal: empresa.inscricao_municipal ?? "",
    data_fundacao: empresa.data_fundacao ?? "",
    site: empresa.site ?? "",
    cnae_principal: empresa.cnae_principal ?? "",
    cnae_secundario: empresa.cnae_secundario ?? "",
    media_importacoes: empresa.media_importacoes ?? "",
    possui_radar: empresa.possui_radar ?? false,
    tipo_radar: empresa.tipo_radar ?? "",
    observacoes: empresa.observacoes ?? "",
  })
  const set = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }))

  const [contato, setContato] = useState<CompanyContact | null>(null)
  const [cf, setCf] = useState({ nome: "", cargo: "", email: "", whatsapp: "" })
  const setC = (k: keyof typeof cf, v: string) => setCf((p) => ({ ...p, [k]: v }))
  const [empresaDocs, setEmpresaDocs] = useState<{ id: string; nome_original: string | null; tipo_documento: string | null; tamanho: number | null; storage_key: string; created_at: string }[]>([])

  useEffect(() => {
    supabase.from("contacts").select("id,nome,cargo,email,whatsapp").eq("company_id", empresa.id).order("principal", { ascending: false }).order("created_at").limit(1).maybeSingle()
      .then(({ data }) => {
        const c = data as CompanyContact | null
        setContato(c)
        setCf({ nome: c?.nome ?? "", cargo: c?.cargo ?? "", email: c?.email ?? "", whatsapp: c?.whatsapp ?? "" })
      })
    supabase.from("documents").select("id,nome_original,tipo_documento,tamanho,storage_key,created_at").eq("company_id", empresa.id).order("created_at", { ascending: false })
      .then(({ data }) => setEmpresaDocs((data ?? []) as typeof empresaDocs))
  }, [empresa.id])

  function cancelar() {
    setF({
      razao_social: empresa.razao_social ?? "", nome_fantasia: empresa.nome_fantasia ?? "",
      cnpj: empresa.cnpj ?? "", inscricao_estadual: empresa.inscricao_estadual ?? "",
      inscricao_municipal: empresa.inscricao_municipal ?? "", data_fundacao: empresa.data_fundacao ?? "",
      site: empresa.site ?? "", cnae_principal: empresa.cnae_principal ?? "",
      cnae_secundario: empresa.cnae_secundario ?? "", media_importacoes: empresa.media_importacoes ?? "",
      possui_radar: empresa.possui_radar ?? false, tipo_radar: empresa.tipo_radar ?? "",
      observacoes: empresa.observacoes ?? "",
    })
    setCf({ nome: contato?.nome ?? "", cargo: contato?.cargo ?? "", email: contato?.email ?? "", whatsapp: contato?.whatsapp ?? "" })
    setEditing(false)
  }

  async function salvar() {
    setBusy(true)
    const [empErr] = await Promise.all([
      supabase.from("companies").update({
        razao_social: f.razao_social || null, nome_fantasia: f.nome_fantasia || null,
        cnpj: f.cnpj || null, inscricao_estadual: f.inscricao_estadual || null,
        inscricao_municipal: f.inscricao_municipal || null, data_fundacao: f.data_fundacao || null,
        site: f.site || null, cnae_principal: f.cnae_principal || null,
        cnae_secundario: f.cnae_secundario || null, media_importacoes: f.media_importacoes || null,
        possui_radar: f.possui_radar, tipo_radar: f.tipo_radar || null, observacoes: f.observacoes || null,
      }).eq("id", empresa.id).then(({ error }) => error),
    ])
    // salva contato se nome preenchido
    if (cf.nome.trim()) {
      if (contato) {
        await supabase.from("contacts").update({ nome: cf.nome, cargo: cf.cargo || null, email: cf.email || null, whatsapp: cf.whatsapp || null }).eq("id", contato.id)
      } else {
        const { data } = await supabase.from("contacts").insert({ company_id: empresa.id, nome: cf.nome, cargo: cf.cargo || null, email: cf.email || null, whatsapp: cf.whatsapp || null, principal: true }).select("id,nome,cargo,email,whatsapp").maybeSingle()
        setContato(data as CompanyContact)
      }
    }
    setBusy(false)
    if (empErr) return toast.error("Erro ao salvar: " + empErr.message)
    toast.success("Empresa atualizada.")
    setEditing(false)
    onSaved()
  }

  async function deletar() {
    if (!confirm(`Excluir a empresa "${empresa.razao_social || empresa.nome_fantasia}"? Esta ação não pode ser desfeita.`)) return
    await supabase.from("companies").delete().eq("id", empresa.id)
    toast.success("Empresa excluída.")
    onSaved()
  }

  const end = empresa.endereco as Record<string, string> | null

  return createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(5,6,5,.72)", backdropFilter: "blur(3px)", overflowY: "auto", display: "flex", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, maxWidth: 640, width: "100%", margin: "auto" }}>

        {/* Header */}
        <div className="row center" style={{ justifyContent: "space-between", marginBottom: 20 }}>
          <div className="row gap10 center">
            <span style={{ width: 40, height: 40, borderRadius: 9, background: "var(--bg)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--lime)" }}><Icon name="building" size={18} /></span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{empresa.nome_fantasia || empresa.razao_social || "—"}</span>
          </div>
          <div className="row gap8">
            <button className="btn btn--danger btn--sm" onClick={deletar}><Icon name="trash" size={13} /> Excluir</button>
            {editing
              ? <><button className="btn btn--ghost btn--sm" onClick={cancelar}>Cancelar</button><button className="btn btn--lime btn--sm" onClick={salvar} disabled={busy}>{busy ? "Salvando…" : "Salvar"}</button></>
              : <button className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}><Icon name="edit" size={13} /> Editar</button>}
            <button className="btn btn--ghost btn--sm" onClick={onClose}><Icon name="x" size={14} /></button>
          </div>
        </div>

        {editing ? (
          <div className="col gap14">
            <div className="eyebrow" style={{ marginBottom: 4 }}>Contato responsável</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field"><label>Nome</label><input className="input" value={cf.nome} onChange={(e) => setC("nome", e.target.value)} /></div>
              <div className="field"><label>Cargo</label><input className="input" value={cf.cargo} onChange={(e) => setC("cargo", e.target.value)} /></div>
              <div className="field"><label>E-mail</label><input className="input" type="email" value={cf.email} onChange={(e) => setC("email", e.target.value)} /></div>
              <div className="field"><label>Celular / WhatsApp</label><input className="input" value={cf.whatsapp} onChange={(e) => setC("whatsapp", e.target.value)} /></div>
            </div>
            <div className="eyebrow" style={{ marginBottom: 4, marginTop: 8 }}>Identificação</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {([["razao_social", "Razão social"], ["nome_fantasia", "Nome fantasia"], ["cnpj", "CNPJ"], ["inscricao_estadual", "Inscrição estadual"], ["inscricao_municipal", "Inscrição municipal"], ["data_fundacao", "Data de fundação"], ["site", "Site"]] as [string, string][]).map(([k, l]) =>
                <div key={k} className="field"><label>{l}</label><input className="input" value={f[k as keyof typeof f] as string} onChange={(e) => set(k, e.target.value)} /></div>)}
            </div>
            <div className="eyebrow" style={{ marginBottom: 4, marginTop: 8 }}>Atividade</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {([["cnae_principal", "CNAE principal"], ["cnae_secundario", "CNAE secundário"], ["media_importacoes", "Média de importações"]] as [string, string][]).map(([k, l]) =>
                <div key={k} className="field"><label>{l}</label><input className="input" value={f[k as keyof typeof f] as string} onChange={(e) => set(k, e.target.value)} /></div>)}
            </div>
            <div className="eyebrow" style={{ marginBottom: 4, marginTop: 8 }}>RADAR / Siscomex</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field"><label>Possui RADAR</label>
                <select className="input" value={f.possui_radar ? "sim" : "nao"} onChange={(e) => set("possui_radar", e.target.value === "sim")}>
                  <option value="nao">Não</option><option value="sim">Sim</option>
                </select>
              </div>
              <div className="field"><label>Tipo de RADAR</label><input className="input" value={f.tipo_radar} onChange={(e) => set("tipo_radar", e.target.value)} /></div>
            </div>
            <div className="field" style={{ marginTop: 8 }}><label>Observações</label><textarea className="textarea" rows={3} value={f.observacoes} onChange={(e) => set("observacoes", e.target.value)} /></div>
          </div>
        ) : (
          <>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Contato responsável</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <EmpresaField label="Nome" value={contato?.nome} />
              <EmpresaField label="Cargo" value={contato?.cargo} />
              <EmpresaField label="E-mail" value={contato?.email} />
              <EmpresaField label="Celular / WhatsApp" value={contato?.whatsapp} />
            </div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Identificação</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <EmpresaField label="Razão social" value={empresa.razao_social} />
              <EmpresaField label="Nome fantasia" value={empresa.nome_fantasia} />
              <EmpresaField label="CNPJ" value={empresa.cnpj} />
              <EmpresaField label="Inscrição estadual" value={empresa.inscricao_estadual} />
              <EmpresaField label="Inscrição municipal" value={empresa.inscricao_municipal} />
              <EmpresaField label="Data de fundação" value={empresa.data_fundacao} />
              <EmpresaField label="Site" value={empresa.site} />
            </div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Atividade</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <EmpresaField label="CNAE principal" value={empresa.cnae_principal} />
              <EmpresaField label="CNAE secundário" value={empresa.cnae_secundario} />
              <EmpresaField label="Média de importações" value={empresa.media_importacoes} />
            </div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>RADAR / Siscomex</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <EmpresaField label="Possui RADAR" value={empresa.possui_radar} />
              <EmpresaField label="Tipo de RADAR" value={empresa.tipo_radar} />
            </div>
            {end && Object.keys(end).length > 0 && <>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Endereço</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                {Object.entries(end).map(([k, v]) => <EmpresaField key={k} label={k} value={v} />)}
              </div>
            </>}
            {empresa.observacoes && <>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Observações</div>
              <p style={{ fontSize: 13.5, color: "var(--tx-dim)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{empresa.observacoes}</p>
            </>}

            {/* Documentos anexados */}
            <div className="eyebrow" style={{ marginBottom: 12, marginTop: 8 }}>Documentos</div>
            {empresaDocs.length > 0 ? (
              <div className="col gap6" style={{ marginBottom: 24 }}>
                {empresaDocs.map((d) => (
                  <div key={d.id} className="row gap10 center" style={{ padding: "8px 10px", background: "var(--bg-2)", borderRadius: 8, border: "1px solid var(--line)" }}>
                    <Icon name="doc" size={14} style={{ color: "var(--lime)", flexShrink: 0 }} />
                    <div className="col" style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.tipo_documento || d.nome_original || "arquivo"}</span>
                      {d.tipo_documento && d.nome_original && <span className="muted" style={{ fontSize: 11 }}>{d.nome_original}</span>}
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: "var(--tx-mute)", flexShrink: 0 }}>
                      {d.tamanho ? (d.tamanho > 1048576 ? (d.tamanho / 1048576).toFixed(1) + " MB" : Math.round(d.tamanho / 1024) + " KB") : ""}
                    </span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--tx-mute)", flexShrink: 0 }}>{new Date(d.created_at).toLocaleDateString("pt-BR")}</span>
                    <button className="btn btn--ghost btn--sm" title="Baixar" onClick={async () => {
                      const { data } = await supabase.storage.from("tradek-documents").createSignedUrl(d.storage_key, 3600)
                      if (data?.signedUrl) window.open(data.signedUrl, "_blank")
                      else toast.error("Não foi possível gerar o link.")
                    }}><Icon name="download" size={13} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "var(--tx-mute)", marginBottom: 24 }}>Nenhum documento anexado ainda.</p>
            )}

            <ScoreCreditoSection empresa={empresa} />
            <ProcessosJudiciaisSection empresa={empresa} />
          </>
        )}
      </div>
    </div>,
    document.body
  )
}

function ScoreCreditoSection({ empresa }: { empresa: Company }) {
  const status = empresa.consulta_status as string | null
  if (!status) return null
  const r = empresa.score_credito as Record<string, unknown> | null
  const ret = r?.retorno as Record<string, unknown> | null | undefined
  const pj = ret?.pessoaJuridica as Record<string, unknown> | undefined
  return (
    <>
      <div className="row gap8 center" style={{ marginBottom: 12, marginTop: 8 }}>
        <div className="eyebrow">Score de Crédito (QUOD / DirectD)</div>
        {status === "em_andamento" && <span className="pill pill--warn" style={{ fontSize: 10 }}>Consulta em andamento</span>}
        {status === "concluida" && <span className="pill pill--ok" style={{ fontSize: 10 }}>Consulta concluída</span>}
        {status === "sem_retorno" && <span className="pill" style={{ fontSize: 10, borderColor: "#e5393966", color: "#e53939" }}>Consulta sem retorno</span>}
      </div>
      {status === "concluida" && pj ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          <EmpresaField label="Score" value={String(pj.score ?? "")} />
          <EmpresaField label="Faixa" value={pj.faixaScore as string} />
        </div>
      ) : status === "sem_retorno" ? (
        <p style={{ fontSize: 13, color: "var(--tx-mute)", marginBottom: 24 }}>Motivo: {empresa.consulta_erro || "não informado"}</p>
      ) : (
        <p style={{ fontSize: 13, color: "var(--tx-mute)", marginBottom: 24 }}>Aguardando retorno da consulta…</p>
      )}
    </>
  )
}

function ProcessosJudiciaisSection({ empresa }: { empresa: Company }) {
  const r = empresa.processos_judiciais as Record<string, unknown> | null
  if (!r) return null
  const meta = r.metaDados as Record<string, unknown> | undefined
  const ret = r.retorno as Record<string, unknown> | null | undefined
  const lista = ret?.processos as Record<string, unknown>[] | undefined
  return (
    <>
      <div className="eyebrow" style={{ marginBottom: 12, marginTop: 8 }}>Processos Judiciais (DirectD)</div>
      {lista && lista.length > 0 ? (
        <div className="col gap10" style={{ marginBottom: 24 }}>
          {lista.map((p, i) => (
            <div key={i} className="panel panel-b">
              <div style={{ fontSize: 13, fontWeight: 700 }}>{String(p.numeroProcesso ?? "—")}</div>
              <div style={{ fontSize: 12, color: "var(--tx-dim)", marginTop: 4 }}>{String(p.tribunal ?? "")} · {String(p.areaDireito ?? "")}</div>
              {p.valorProcesso ? <div style={{ fontSize: 12, color: "var(--tx-dim)" }}>Valor: {String(p.valorProcesso)}</div> : null}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "var(--tx-mute)", marginBottom: 24 }}>{(meta?.mensagem as string) || "Nenhum processo encontrado."}</p>
      )}
    </>
  )
}

export function AdminEmpresas() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selected, setSelected] = useState<Company | null>(null)
  function load() { supabase.from("companies").select("*").order("created_at", { ascending: false }).then(({ data }) => setCompanies(data ?? [])) }
  useEffect(() => { load() }, [])
  return (
    <div className="fade">
      <PageHead title="Empresas & Contatos" sub="Cadastro de empresas, contatos e oportunidades" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {companies.map((c) => (
          <div key={c.id} className="panel panel-b" style={{ cursor: "pointer" }} onClick={() => setSelected(c)}>
            <div className="row center gap10"><span style={{ width: 40, height: 40, borderRadius: 9, background: "var(--bg)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--lime)" }}><Icon name="building" size={18} /></span>
              <div className="col fill" style={{ minWidth: 0, lineHeight: 1.3 }}><span style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.nome_fantasia || c.razao_social || "—"}</span><span className="mono tag">{c.cnpj || "sem CNPJ"}</span></div></div>
            <div className="hr" style={{ margin: "12px 0" }}></div>
            <div className="row center" style={{ justifyContent: "space-between" }}><span className="row gap6 center" style={{ fontSize: 12, color: "var(--tx-dim)" }}><Icon name="globe" size={13} />{c.site || "—"}</span></div>
          </div>
        ))}
        {companies.length === 0 && <span className="muted" style={{ fontSize: 13 }}>Nenhuma empresa cadastrada.</span>}
      </div>
      {selected && <EmpresaModal empresa={selected} onClose={() => setSelected(null)} onSaved={() => { load(); setSelected(null) }} />}
    </div>
  )
}

/* ---------------- CLIENTES ---------------- */


type ContactRow = { id: string; nome: string | null; cargo: string | null; email: string | null; whatsapp: string | null; created_at: string; companies: { id: string; razao_social: string | null; nome_fantasia: string | null; score_credito: unknown; processos_judiciais: unknown } | null; leads: { id: string; unidade: string | null; status: string | null; score_ia: number | null; resumo_ia: string | null; created_at: string }[] }
type Interaction = { id: string; tipo: string; canal: string | null; mensagem: string | null; created_at: string; autor_tipo: string }

function ContatoModal({ contato, onClose, onSaved }: { contato: ContactRow; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ nome: contato.nome ?? "", cargo: contato.cargo ?? "", email: contato.email ?? "", whatsapp: contato.whatsapp ?? "", empresa: contato.companies?.nome_fantasia || contato.companies?.razao_social || "" })
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: string) => setF(s => ({ ...s, [k]: v }))
  const lead = contato.leads?.[0]

  useEffect(() => {
    if (!lead?.id) return
    supabase.from("interactions").select("id,tipo,canal,mensagem,created_at,autor_tipo").eq("lead_id", lead.id).order("created_at", { ascending: false }).limit(20).then(({ data }) => setInteractions((data ?? []) as Interaction[]))
  }, [lead?.id])

  async function salvar() {
    setBusy(true)
    await supabase.from("contacts").update({ nome: f.nome || undefined, cargo: f.cargo || null, email: f.email || undefined, whatsapp: f.whatsapp || undefined }).eq("id", contato.id)
    if (f.empresa && contato.companies?.id) await supabase.from("companies").update({ razao_social: f.empresa }).eq("id", contato.companies.id)
    setBusy(false)
    toast.success("Contato atualizado.")
    onSaved()
  }

  async function deletar() {
    if (!confirm(`Excluir o contato ${contato.nome ?? ""}? Esta ação não pode ser desfeita.`)) return
    setBusy(true)
    await supabase.from("contacts").delete().eq("id", contato.id)
    setBusy(false)
    toast.success("Contato excluído.")
    onSaved()
    onClose()
  }

  const statusLead = lead?.status
  const pillVariant = statusLead === "pronto_atendimento" || statusLead === "contrato_fechado" ? "ok" : statusLead === "desqualificado" || statusLead === "proposta_recusada" ? "danger" : "info"

  return createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(5,6,5,.72)", backdropFilter: "blur(3px)", overflowY: "auto", display: "flex", padding: 20 }}>
      <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, maxWidth: 640, width: "100%", margin: "auto" }} onClick={e => e.stopPropagation()}>
        <div className="row center" style={{ justifyContent: "space-between", marginBottom: 20 }}>
          <div className="row gap10 center"><Avatar name={f.nome || "?"} size={36} tone="lime" /><div><div style={{ fontWeight: 700, fontSize: 16 }}>{f.nome || "Sem nome"}</div><div className="muted" style={{ fontSize: 12 }}>{f.empresa || "Sem empresa"}</div></div></div>
          <button className="btn btn--ghost btn--sm" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        {/* Status */}
        {lead && <div className="row gap8" style={{ marginBottom: 20 }}>
          <Pill variant={pillVariant}>{(statusLead ?? "").replace(/_/g, " ")}</Pill>
          {lead.unidade && <Pill variant="info">{unidadeMeta(lead.unidade).short}</Pill>}
          {lead.score_ia != null && <Pill variant="ok">Score {lead.score_ia}</Pill>}
        </div>}
        {!lead && <div style={{ marginBottom: 20 }}><Pill variant="warn">qualificação pendente</Pill></div>}

        {/* Dados editáveis */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div className="field"><label>Nome</label><input className="input" value={f.nome} onChange={e => set("nome", e.target.value)} /></div>
          <div className="field"><label>Cargo</label><input className="input" value={f.cargo} onChange={e => set("cargo", e.target.value)} /></div>
          <div className="field"><label>Empresa</label><input className="input" value={f.empresa} onChange={e => set("empresa", e.target.value)} /></div>
          <div className="field"><label>E-mail</label><input className="input" type="email" value={f.email} onChange={e => set("email", e.target.value)} /></div>
          <div className="field"><label>Celular / WhatsApp</label><input className="input" value={f.whatsapp} onChange={e => set("whatsapp", e.target.value)} /></div>
        </div>

        {/* Resumo do lead */}
        {lead?.resumo_ia && <div style={{ marginBottom: 20 }}>
          <div className="tag" style={{ marginBottom: 8 }}>Resumo da qualificação</div>
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--tx-mute)" }}>{lead.resumo_ia}</div>
        </div>}

        {/* Score de Crédito / Processos Judiciais (DirectD) */}
        {(() => {
          const sc = contato.companies?.score_credito as Record<string, unknown> | null
          const pj = (sc?.retorno as Record<string, unknown> | undefined)?.pessoaJuridica as Record<string, unknown> | undefined
          const proc = contato.companies?.processos_judiciais as Record<string, unknown> | null
          const lista = (proc?.retorno as Record<string, unknown> | undefined)?.processos as Record<string, unknown>[] | undefined
          if (!pj) return null
          return (
            <div className="panel panel-b" style={{ marginBottom: 20 }}>
              <div className="row gap8 center" style={{ marginBottom: 10 }}><Icon name="shield" size={15} style={{ color: "var(--lime)" }} /><span className="tag" style={{ color: "var(--lime)" }}>Score de Crédito (QUOD / DirectD)</span></div>
              <div className="row gap24">
                <div><div className="tag" style={{ marginBottom: 2 }}>Score</div><div style={{ fontSize: 18, fontWeight: 700 }}>{String(pj.score ?? "")}</div></div>
                <div><div className="tag" style={{ marginBottom: 2 }}>Faixa</div><div style={{ fontSize: 14 }}>{String(pj.faixaScore ?? "")}</div></div>
                <div><div className="tag" style={{ marginBottom: 2 }}>Processos judiciais</div><div style={{ fontSize: 14, color: (lista?.length ?? 0) > 0 ? "var(--danger)" : "var(--tx)" }}>{lista?.length ?? 0}</div></div>
              </div>
            </div>
          )
        })()}

        {/* Histórico de interações */}
        {interactions.length > 0 && <div style={{ marginBottom: 20 }}>
          <div className="tag" style={{ marginBottom: 8 }}>Histórico de interações</div>
          <div className="col gap6">
            {interactions.map(it => (
              <div key={it.id} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 12px" }}>
                <div className="row center gap8" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--tx-mute)", textTransform: "uppercase" }}>{it.tipo}</span>
                  {it.canal && <span className="tag">{it.canal}</span>}
                  <span className="mla mono" style={{ fontSize: 11 }}>{new Date(it.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--tx-2)", lineHeight: 1.5 }}>{it.mensagem ?? "—"}</div>
              </div>
            ))}
          </div>
        </div>}

        {/* Ações */}
        <div className="row gap8" style={{ justifyContent: "space-between" }}>
          <button className="btn btn--danger btn--sm" onClick={deletar} disabled={busy}><Icon name="trash" size={13} /> Excluir</button>
          <div className="row gap8">
            <button className="btn btn--ghost btn--sm" onClick={onClose}>Cancelar</button>
            <button className="btn btn--lime btn--sm" onClick={salvar} disabled={busy}>{busy ? "Salvando…" : "Salvar alterações"}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function AdminClientes() {
  const [contatos, setContatos] = useState<ContactRow[]>([])
  const [selected, setSelected] = useState<ContactRow | null>(null)
  const load = () => supabase.from("contacts").select("id,nome,cargo,email,whatsapp,created_at,companies(id,razao_social,nome_fantasia,score_credito,processos_judiciais),leads(id,unidade,status,score_ia,resumo_ia,created_at)").order("created_at", { ascending: false }).then(({ data }) => setContatos((data as unknown as ContactRow[]) ?? []))
  useEffect(() => { load() }, [])
  return (
    <div className="fade">
      <PageHead title="Clientes & Contatos" sub="Todos os contatos do CRM" />
      <div className="panel scroll" style={{ overflow: "auto" }}>
        <table className="tbl"><thead><tr>{["Contato", "Empresa", "E-mail / WhatsApp", "Unidade", "Status", "Desde"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{contatos.map((c, i) => {
            const lead = c.leads?.[0]
            const { short, color } = lead?.unidade ? unidadeMeta(lead.unidade) : { short: "—", color: "var(--tx-mute)" }
            return (
              <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => setSelected(c)}>
                <td><div className="row gap8 center"><Avatar name={c.nome ?? "?"} size={26} tone={i % 2 ? "info" : "lime"} /><div className="col"><span className="strong">{c.nome ?? "—"}</span>{c.cargo && <span className="muted" style={{ fontSize: 11 }}>{c.cargo}</span>}</div></div></td>
                <td>{c.companies?.nome_fantasia || c.companies?.razao_social || "—"}</td>
                <td><div style={{ fontSize: 12 }}><div>{c.email ?? "—"}</div><div className="muted">{c.whatsapp ?? ""}</div></div></td>
                <td><span style={{ fontSize: 12, fontWeight: 600, color }}>{short}</span></td>
                <td>{lead?.status
                  ? <Pill variant={lead.status === "pronto_atendimento" || lead.status === "qualificado" ? "ok" : lead.status === "desqualificado" || lead.status === "proposta_recusada" ? "danger" : "info"}>{lead.status.replace(/_/g, " ")}</Pill>
                  : <Pill variant="warn">qualificação pendente</Pill>}</td>
                <td className="mono">{new Date(c.created_at).toLocaleDateString("pt-BR")}</td>
              </tr>
            )
          })}
          {contatos.length === 0 && <tr><td colSpan={6} style={{ padding: 20, color: "var(--tx-mute)" }}>Nenhum contato ainda.</td></tr>}
          </tbody>
        </table>
      </div>
      {selected && <ContatoModal contato={selected} onClose={() => setSelected(null)} onSaved={() => { load(); setSelected(null) }} />}
    </div>
  )
}

/* ---------------- TAREFAS ---------------- */
function NovaTarefaModal({ onClose }: { onClose: (changed?: boolean) => void }) {
  const [users, setUsers] = useState<{ id: string; nome: string | null }[]>([])
  const [f, setF] = useState({ titulo: "", descricao: "", prioridade: "media", prazo: "", responsavel_id: "" })
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }))
  useEffect(() => { supabase.from("profiles").select("id,nome").not("role", "is", null).order("nome").then(({ data }) => setUsers(data ?? [])) }, [])

  async function salvar() {
    if (!f.titulo.trim()) return toast.error("Informe o título da tarefa.")
    setBusy(true)
    const uid = (await supabase.auth.getUser()).data.user?.id ?? null
    const { error } = await supabase.from("tasks").insert({
      titulo: f.titulo.trim(), descricao: f.descricao.trim() || null,
      prioridade: f.prioridade as Task["prioridade"], status: "aberta",
      prazo: f.prazo ? new Date(f.prazo).toISOString() : null,
      responsavel_id: f.responsavel_id || null, criada_por: uid,
    })
    setBusy(false)
    if (error) return toast.error("Erro: " + error.message)
    toast.success("Tarefa criada.")
    onClose(true)
  }

  return createPortal(
    <div onClick={() => onClose()} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(5,6,5,.72)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="fade panel" style={{ width: "min(560px,96vw)", background: "var(--bg-1)", overflow: "hidden" }}>
        <div className="panel-h"><div className="row gap8 center"><Icon name="target" size={16} style={{ color: "var(--lime)" }} /><h3 style={{ textTransform: "none", letterSpacing: 0, fontSize: 15, color: "var(--tx)" }}>Nova tarefa</h3></div><button className="btn btn--icon btn--dark" onClick={() => onClose()}><Icon name="x" size={16} /></button></div>
        <div className="panel-b">
          <div className="field"><label>Título</label><input className="input" value={f.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex.: Ligar para o cliente sobre os documentos" /></div>
          <div className="field" style={{ marginTop: 12 }}><label>Descrição</label><textarea className="textarea" style={{ minHeight: 70 }} value={f.descricao} onChange={(e) => set("descricao", e.target.value)} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
            <div className="field"><label>Prioridade</label><select className="select" value={f.prioridade} onChange={(e) => set("prioridade", e.target.value)}><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="critica">Crítica</option></select></div>
            <div className="field"><label>Prazo</label><input className="input" type="date" value={f.prazo} onChange={(e) => set("prazo", e.target.value)} /></div>
            <div className="field"><label>Responsável</label><select className="select" value={f.responsavel_id} onChange={(e) => set("responsavel_id", e.target.value)}><option value="">—</option>{users.map((u) => <option key={u.id} value={u.id}>{u.nome ?? u.id.slice(0, 8)}</option>)}</select></div>
          </div>
          <div className="row gap8" style={{ marginTop: 16, justifyContent: "flex-end" }}><button className="btn btn--ghost btn--sm" onClick={() => onClose()}>Cancelar</button><Btn variant="lime" size="sm" icon="check" disabled={busy} onClick={salvar}>{busy ? "Salvando…" : "Criar tarefa"}</Btn></div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function AdminTarefas() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [novaOpen, setNovaOpen] = useState(false)
  const load = () => supabase.from("tasks").select("*").order("prazo").then(({ data }) => setTasks(data ?? []))
  useEffect(() => { load() }, [])
  const cols: [string, string][] = [["aberta", "A fazer"], ["em_andamento", "Em andamento"], ["concluida", "Concluídas"]]
  return (
    <div className="fade">
      <PageHead title="Tarefas & SLA" sub="Follow-ups e prazos das oportunidades" actions={<button className="btn btn--lime btn--sm" onClick={() => setNovaOpen(true)}><Icon name="plus" size={13} /> Nova tarefa</button>} />
      {novaOpen && <NovaTarefaModal onClose={(changed) => { setNovaOpen(false); if (changed) load() }} />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {cols.map(([k, l]) => {
          const items = tasks.filter((t) => t.status === k)
          return (
            <div key={k}>
              <div className="row center gap8" style={{ padding: "4px 6px 10px" }}><span style={{ fontSize: 13, fontWeight: 700 }}>{l}</span><span className="mono" style={{ fontSize: 11, color: "var(--tx-mute)", background: "var(--bg-2)", borderRadius: 99, padding: "1px 7px" }}>{items.length}</span></div>
              <div className="col gap8">{items.map((t) => (
                <div key={t.id} className="panel panel-b">
                  <div className="row center" style={{ justifyContent: "space-between", marginBottom: 8 }}><span className="pill" style={{ fontSize: 10 }}>{t.prioridade}</span></div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>{t.titulo}</div>
                  <div className="hr" style={{ margin: "10px 0" }}></div>
                  <div className="row center" style={{ justifyContent: "space-between" }}><span className="tag">{t.prazo ? new Date(t.prazo).toLocaleDateString("pt-BR") : "—"}</span></div>
                </div>
              ))}
              {items.length === 0 && <div style={{ border: "1px dashed var(--line)", borderRadius: 8, padding: "18px 0", textAlign: "center", fontSize: 11.5, color: "var(--tx-faint)" }}>Vazio</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- DOCUMENTOS ---------------- */
type RealDocAdmin = { id: string; company_id: string | null; nome_original: string | null; tipo_documento: string | null; mime: string | null; tamanho: number | null; storage_key: string; status: string; observacoes: string | null; created_at: string; companies: { razao_social: string | null; nome_fantasia: string | null } | null; leads: { id: string } | null }
type DocCompany = { id: string; nome: string; contato: string | null; cargo: string | null }

const ORIGEM_LABEL_DOC: Record<string, string> = { whatsapp: "WhatsApp", chat_site: "Chat site", cliente_portal: "Portal cliente", admin_manual: "Manual" }

export function AdminDocumentos() {
  const [docs, setDocs] = useState<RealDocAdmin[]>([])
  const [companyMeta, setCompanyMeta] = useState<DocCompany[]>([])
  const [uploading, setUploading] = useState(false)
  const [companies, setCompanies] = useState<{ id: string; razao_social: string | null; nome_fantasia: string | null }[]>([])
  const [anexarOpen, setAnexarOpen] = useState(false)
  const [af, setAf] = useState({ company_id: "", tipo_documento: "" })
  const [tiposDisponiveis, setTiposDisponiveis] = useState<string[]>(DOCS_PADRAO)

  function load() {
    supabase.from("documents").select("id,company_id,nome_original,tipo_documento,mime,tamanho,storage_key,status,observacoes,created_at,companies(razao_social,nome_fantasia),leads(id)").order("created_at", { ascending: false }).then(({ data }) => setDocs((data as unknown as RealDocAdmin[]) ?? []))
  }

  function loadTipos() {
    supabase.from("document_requests").select("tipo_documento").then(({ data }) => {
      const custom = (data ?? []).map((r: { tipo_documento: string }) => r.tipo_documento).filter(Boolean)
      const merged = [...DOCS_PADRAO]
      for (const t of custom) { if (!merged.includes(t)) merged.push(t) }
      setTiposDisponiveis(merged)
    })
  }

  useEffect(() => {
    load()
    loadTipos()
    supabase.from("companies").select("id,razao_social,nome_fantasia").order("razao_social").then(({ data }) => setCompanies(data ?? []))
    supabase.from("contacts").select("company_id,nome,cargo").eq("principal", true).then(({ data: cts }) => {
      supabase.from("companies").select("id,razao_social,nome_fantasia").order("razao_social").then(({ data: comps }) => {
        const ctMap = new Map((cts ?? []).map((c: { company_id: string | null; nome: string; cargo: string | null }) => [c.company_id, c]))
        setCompanyMeta((comps ?? []).map((c) => {
          const ct = ctMap.get(c.id) as { nome: string; cargo: string | null } | undefined
          return { id: c.id, nome: c.nome_fantasia || c.razao_social || c.id.slice(0, 8), contato: ct?.nome ?? null, cargo: ct?.cargo ?? null }
        }))
      })
    })
  }, [])

  async function abrirDocumento(storageKey: string) {
    const { data } = await supabase.storage.from("tradek-documents").createSignedUrl(storageKey, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, "_blank")
    else toast.error("Não foi possível gerar o link.")
  }

  async function excluirDocumento(docId: string, storageKey: string) {
    await supabase.storage.from("tradek-documents").remove([storageKey])
    await supabase.from("documents").delete().eq("id", docId)
    load()
    toast.success("Documento excluído.")
  }

  async function uploadDocumento(file: File) {
    setUploading(true)
    const ext = file.name.split(".").pop() ?? "bin"
    const companyId = af.company_id || null
    const path = `documentos/${companyId ?? "sem-empresa"}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
    const { error: upErr } = await supabase.storage.from("tradek-documents").upload(path, file, { upsert: false })
    if (upErr) { toast.error("Falha no upload: " + upErr.message); setUploading(false); return }
    const { error: dbErr } = await supabase.from("documents").insert({
      company_id: companyId, storage_key: path, nome_original: file.name,
      mime: file.type || `application/${ext}`, tamanho: file.size,
      tipo_documento: af.tipo_documento || null, status: "enviado" as const, observacoes: "admin_manual",
    })
    setUploading(false)
    if (dbErr) { toast.error("Erro no registro: " + dbErr.message); return }
    toast.success("Documento anexado.")
    setAnexarOpen(false)
    setAf({ company_id: "", tipo_documento: "" })
    load()
  }

  // agrupa docs por company_id
  const byCompany = new Map<string | null, RealDocAdmin[]>()
  for (const d of docs) {
    const cid = d.company_id ?? null
    if (!byCompany.has(cid)) byCompany.set(cid, [])
    byCompany.get(cid)!.push(d)
  }

  const groups: { meta: DocCompany | null; docs: RealDocAdmin[] }[] = []
  for (const cm of companyMeta) {
    const ds = byCompany.get(cm.id)
    if (ds && ds.length > 0) groups.push({ meta: cm, docs: ds })
  }
  const semEmpresa = byCompany.get(null)
  if (semEmpresa && semEmpresa.length > 0) groups.push({ meta: null, docs: semEmpresa })

  const fmtSize = (n: number | null) => !n ? "—" : n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.round(n / 1024) + " KB"

  return (
    <div className="fade">
      <PageHead title="Documentos" sub="Visão por empresa — WhatsApp, chat e upload manual" actions={<button className="btn btn--lime btn--sm" onClick={() => setAnexarOpen(true)}><Icon name="upload" size={13} /> Anexar documento</button>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 14 }}>
        {([["Total", docs.length, "lime"], ["WhatsApp / Chat", docs.filter((d) => d.observacoes === "whatsapp" || d.observacoes === "chat_site").length, "info"], ["Manual", docs.filter((d) => d.observacoes === "admin_manual").length, "warn"]] as [string, number, string][]).map(([l, n, c]) =>
          <div key={l} className="panel panel-b"><div className="row center" style={{ justifyContent: "space-between" }}><span className="tag">{l}</span><span className="sdot" style={{ background: `var(--${c})` }}></span></div><div className="disp" style={{ fontSize: 28, fontWeight: 600, marginTop: 6 }}>{n}</div></div>
        )}
      </div>

      <div className="col gap12">
        {groups.length === 0 && (
          <div className="panel panel-b" style={{ textAlign: "center", color: "var(--tx-mute)", fontSize: 13, padding: 32 }}>
            Nenhum documento ainda. Arquivos enviados pelo WhatsApp ou chat aparecem aqui automaticamente.
          </div>
        )}
        {groups.map(({ meta, docs: gDocs }, gi) => (
          <div key={meta?.id ?? `sem-${gi}`} className="panel">
            {/* Cabeçalho da empresa */}
            <div className="panel-h" style={{ borderBottom: "1px solid var(--line)", paddingBottom: 14, marginBottom: 0 }}>
              <div className="col" style={{ gap: 2 }}>
                <div className="row gap10 center">
                  <Icon name="building" size={15} style={{ color: "var(--lime)" }} />
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{meta?.nome ?? "Sem empresa"}</span>
                  <span className="pill" style={{ fontSize: 10 }}>{gDocs.length} doc{gDocs.length !== 1 ? "s" : ""}</span>
                </div>
                {meta?.contato && (
                  <div className="row gap6 center" style={{ paddingLeft: 25 }}>
                    <Icon name="user" size={12} style={{ color: "var(--tx-mute)" }} />
                    <span style={{ fontSize: 12, color: "var(--tx-dim)" }}>{meta.contato}</span>
                    {meta.cargo && <span className="tag" style={{ fontSize: 10 }}>{meta.cargo}</span>}
                  </div>
                )}
              </div>
            </div>
            {/* Tabela de documentos */}
            <div style={{ padding: 0 }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Arquivo</th>
                    <th>Origem</th>
                    <th style={{ width: 80 }}>Tamanho</th>
                    <th style={{ width: 96 }}>Data</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {gDocs.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontSize: 13, fontWeight: 600 }}>{d.tipo_documento || "—"}</td>
                      <td>
                        <div className="row gap8 center">
                          <Icon name="doc" size={14} style={{ color: "var(--lime)", flexShrink: 0 }} />
                          <span style={{ fontSize: 12 }}>{d.nome_original ?? "arquivo"}</span>
                        </div>
                      </td>
                      <td><span className="pill" style={{ fontSize: 10 }}>{ORIGEM_LABEL_DOC[d.observacoes ?? ""] ?? d.observacoes ?? "—"}</span></td>
                      <td className="mono" style={{ fontSize: 12 }}>{fmtSize(d.tamanho)}</td>
                      <td className="mono" style={{ fontSize: 12 }}>{new Date(d.created_at).toLocaleDateString("pt-BR")}</td>
                      <td>
                        <div className="row gap4">
                          <button className="btn btn--ghost btn--sm" title="Baixar" onClick={() => abrirDocumento(d.storage_key)}><Icon name="download" size={13} /></button>
                          <button className="btn btn--danger btn--sm" title="Excluir" onClick={() => excluirDocumento(d.id, d.storage_key)}><Icon name="trash" size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {anexarOpen && createPortal(
        <div onClick={() => setAnexarOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(5,6,5,.72)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="panel" style={{ width: "min(480px,96vw)", background: "var(--bg-1)" }}>
            <div className="panel-h"><h3>Anexar documento</h3><button className="btn btn--icon btn--dark" onClick={() => setAnexarOpen(false)}><Icon name="x" size={16} /></button></div>
            <div className="panel-b col gap12">
              <div className="field"><label>Empresa (opcional)</label>
                <select className="select" value={af.company_id} onChange={(e) => setAf((a) => ({ ...a, company_id: e.target.value }))}>
                  <option value="">— sem empresa —</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.nome_fantasia || c.razao_social || c.id.slice(0, 8)}</option>)}
                </select>
              </div>
              <div className="field"><label>Tipo de documento</label>
                <select className="select" value={af.tipo_documento} onChange={(e) => setAf((a) => ({ ...a, tipo_documento: e.target.value }))}>
                  <option value="">— selecione —</option>
                  {tiposDisponiveis.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <label className="btn btn--lime" style={{ cursor: uploading ? "wait" : "pointer", justifyContent: "center" }}>
                {uploading ? <><Icon name="loader" size={14} /> Enviando…</> : <><Icon name="upload" size={14} /> Selecionar arquivo…</>}
                <input type="file" style={{ display: "none" }} disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDocumento(f); e.target.value = "" }} />
              </label>
              <p className="muted" style={{ fontSize: 12 }}>Qualquer formato aceito. Arquivos ficam no Storage privado — acesso via link assinado.</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

/* ---------------- RELATÓRIOS ---------------- */
type Rep = { id: string; tipo: string; score: number | null; created_at: string; leads: { companies: { razao_social: string | null; nome_fantasia: string | null } | null } | null }
export function AdminRelatorios() {
  const [reports, setReports] = useState<Rep[]>([])
  useEffect(() => { supabase.from("reports").select("id,tipo,score,created_at,leads(companies(razao_social,nome_fantasia))").order("created_at", { ascending: false }).then(({ data }) => setReports((data as unknown as Rep[]) ?? [])) }, [])
  return (
    <div className="fade">
      <PageHead title="Relatórios IA" sub="Relatórios gerados por lead, unidade e período" />
      <div className="panel"><div className="panel-h"><h3>Relatórios recentes</h3></div>
        <table className="tbl"><thead><tr>{["Lead / Escopo", "Tipo", "Score", "Gerado"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{reports.map((r) => <tr key={r.id}><td className="strong">{r.leads?.companies?.nome_fantasia || r.leads?.companies?.razao_social || "—"}</td><td>{r.tipo}</td><td>{r.score ? <Score v={r.score} /> : <span className="faint">—</span>}</td><td className="mono">{new Date(r.created_at).toLocaleDateString("pt-BR")}</td></tr>)}
          {reports.length === 0 && <tr><td colSpan={4} style={{ padding: 20, color: "var(--tx-mute)" }}>Nenhum relatório gerado ainda. Gere pela aba Relatório do lead.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------------- INTERAÇÕES ---------------- */
type Conv = { id: string; visitor_id: string | null; unidade_detectada: string | null; status: string; resumo: string | null; created_at: string }
export function AdminInteracoes() {
  const [convs, setConvs] = useState<Conv[]>([])
  useEffect(() => { supabase.from("conversations").select("id,visitor_id,unidade_detectada,status,resumo,created_at").order("created_at", { ascending: false }).then(({ data }) => setConvs(data ?? [])) }, [])
  return (
    <div className="fade">
      <PageHead title="Central de Interações" sub="Conversas do agente IA" />
      <div className="panel scroll" style={{ overflow: "auto" }}>
        <table className="tbl"><thead><tr>{["Visitante", "Unidade", "Status", "Resumo", "Início"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{convs.map((c) => <tr key={c.id}><td className="mono">{c.visitor_id?.slice(0, 8) ?? "—"}</td><td>{c.unidade_detectada ? unidadeMeta(c.unidade_detectada).short : "—"}</td><td><Pill variant="info">{c.status}</Pill></td><td className="muted">{c.resumo ?? "—"}</td><td className="mono">{new Date(c.created_at).toLocaleDateString("pt-BR")}</td></tr>)}
          {convs.length === 0 && <tr><td colSpan={5} style={{ padding: 20, color: "var(--tx-mute)" }}>Nenhuma conversa registrada ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------------- NOTIFICAÇÕES ---------------- */
export function AdminNotificacoes() {
  const [rules, setRules] = useState<NotifRule[]>([])
  useEffect(() => { supabase.from("notification_rules").select("*").order("created_at").then(({ data }) => setRules(data ?? [])) }, [])
  return (
    <div className="fade">
      <PageHead title="Notificações" sub="Regras de e-mail por evento, unidade e status" />
      <div className="panel">
        <div className="panel-h"><h3>Regras ativas</h3></div>
        <div className="panel-b">
          {rules.map((r) => <div key={r.id} className="row center gap10" style={{ padding: "12px 0", borderTop: "1px solid var(--line-soft)", fontSize: 13 }}><span className="sdot" style={{ background: r.ativo ? "var(--ok)" : "var(--tx-mute)" }}></span><span style={{ fontWeight: 600 }}>{r.nome}</span><span className="pill" style={{ fontSize: 10 }}>{r.evento}</span><span className="tag mla">{r.frequencia}</span><span className="mono" style={{ fontSize: 11, color: "var(--tx-mute)" }}>{(r.emails_para ?? []).join(", ")}</span></div>)}
          {rules.length === 0 && <span className="muted" style={{ fontSize: 13 }}>Nenhuma regra.</span>}
          <div className="panel panel-b" style={{ marginTop: 14, background: "var(--bg-2)", display: "flex", gap: 10 }}><Icon name="check" size={16} style={{ color: "var(--ok)", flexShrink: 0 }} /><span className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>Envio de e-mails ativo (Resend) com disparo por eventos (lead novo, documento) via triggers do banco.</span></div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- AGENTES IA ---------------- */
function RagUploadModal({ agents, onClose }: { agents: AgentConfig[]; onClose: (changed?: boolean) => void }) {
  const [titulo, setTitulo] = useState("")
  const [categoria, setCategoria] = useState("")
  const [agentId, setAgentId] = useState(agents.find((a) => a.unidade === "outro")?.id ?? agents[0]?.id ?? "")
  const [restrito, setRestrito] = useState(false)
  const [conteudo, setConteudo] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [extracting, setExtracting] = useState(false)

  async function onFile(f: File | null) {
    setFile(f)
    if (!f) return
    if (!titulo) setTitulo(f.name.replace(/\.[^.]+$/, ""))
    setExtracting(true)
    try {
      const { extractText } = await import("@/lib/extractText")
      const text = await extractText(f)
      setConteudo(text)
      if (!text.trim()) toast.error("Não consegui extrair texto (PDF escaneado?). Cole o conteúdo manualmente.")
    } catch (e) { toast.error("Falha ao ler o arquivo: " + String(e)) }
    finally { setExtracting(false) }
  }

  async function save() {
    if (!titulo.trim()) return toast.error("Informe um título.")
    if (!agentId) return toast.error("Escolha o agente dono deste conhecimento.")
    if (!conteudo.trim()) return toast.error("Adicione conteúdo (arquivo ou texto).")
    setBusy(true)
    try {
      let storage_key: string | undefined
      if (file) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
        const key = `knowledge/${Date.now()}-${safe}`
        const { error: upErr } = await supabase.storage.from("tradek-rag").upload(key, file, { upsert: false })
        if (upErr) throw upErr
        storage_key = key
      }
      const { data, error } = await supabase.functions.invoke("rag-ingest", {
        body: { titulo: titulo.trim(), categoria: categoria || null, agent_id: agentId, conteudo, restrito_admin: restrito, storage_key },
      })
      if (error) {
        let msg = error.message
        try {
          const ctx = (error as unknown as { context?: Response }).context
          const text = await ctx?.text()
          if (text) {
            const parsed = JSON.parse(text)
            if (parsed?.error) msg = parsed.error
            else msg = text
          }
        } catch { /* ignora */ }
        throw new Error(msg)
      }
      const chunks = (data as { chunks?: number })?.chunks ?? 0
      toast.success(`"${titulo.trim()}" ingerido — ${chunks} chunk(s).`)
      onClose(true)
    } catch (e) {
      toast.error("Erro na ingestão: " + String(e))
    } finally { setBusy(false) }
  }

  return createPortal(
    <div onClick={() => onClose()} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(5,6,5,.72)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="fade panel" style={{ width: "min(640px,96vw)", maxHeight: "92vh", display: "flex", flexDirection: "column", background: "var(--bg-1)", overflow: "hidden" }}>
        <div className="panel-h"><div className="row gap8 center"><Icon name="brain" size={16} style={{ color: "var(--lime)" }} /><h3 style={{ textTransform: "none", letterSpacing: 0, fontSize: 15, color: "var(--tx)" }}>Adicionar conhecimento</h3></div><button className="btn btn--icon btn--dark" onClick={() => onClose()}><Icon name="x" size={16} /></button></div>
        <div className="scroll" style={{ padding: 16, overflow: "auto" }}>
          <label className="panel panel-b" style={{ display: "block", textAlign: "center", cursor: "pointer", borderStyle: "dashed", padding: "22px 16px" }}>
            <input type="file" accept=".txt,.md,.markdown,.pdf,text/plain,text/markdown,application/pdf" style={{ display: "none" }} onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            <Icon name="upload" size={22} style={{ color: "var(--lime)" }} />
            <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 8 }}>{file ? file.name : "Selecionar arquivo (.pdf, .txt, .md)"}</div>
            <div className="tag" style={{ marginTop: 4 }}>{extracting ? "Extraindo texto…" : file ? `${conteudo.length} caracteres extraídos` : "ou cole o texto abaixo"}</div>
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
            <div className="field" style={{ gridColumn: "span 2" }}><label>Título</label><input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Supply Chain Finance — como funciona" /></div>
            <div className="field"><label>Categoria</label><input className="input" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="servico, processo…" /></div>
            <div className="field"><label>Agente dono</label><select className="select" value={agentId} onChange={(e) => setAgentId(e.target.value)}>{agents.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}</select></div>
            <div className="field" style={{ gridColumn: "span 2" }}><label>Conteúdo</label><textarea className="textarea" style={{ minHeight: 150 }} value={conteudo} onChange={(e) => setConteudo(e.target.value)} placeholder="Cole o conteúdo aqui, ou selecione um arquivo acima." /></div>
          </div>
          <label className="row gap8 center" style={{ marginTop: 12, fontSize: 12.5, color: "var(--tx-dim)", cursor: "pointer" }}><input type="checkbox" checked={restrito} onChange={(e) => setRestrito(e.target.checked)} style={{ accentColor: "var(--lime)" }} /> Restrito à equipe interna (não usado nas respostas públicas do agente)</label>
        </div>
        <div className="row center" style={{ padding: "14px 16px", borderTop: "1px solid var(--line)", justifyContent: "flex-end" }}>
          <div className="row gap8"><button className="btn btn--ghost btn--sm" onClick={() => onClose()}>Cancelar</button><Btn variant="lime" size="sm" icon="check" disabled={busy || extracting} onClick={save}>{busy ? "Ingerindo…" : "Ingerir conhecimento"}</Btn></div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function AgentEditModal({ agent, onClose }: { agent: AgentConfig; onClose: (changed?: boolean) => void }) {
  const [prompt, setPrompt] = useState(agent.prompt ?? "")
  const [guardrails, setGuardrails] = useState(agent.guardrails ?? "")
  const [mensagem, setMensagem] = useState(agent.mensagem_inicial ?? "")
  const [score, setScore] = useState(String(agent.score_minimo ?? 60))
  const [ativo, setAtivo] = useState(agent.ativo ?? true)
  const [busy, setBusy] = useState(false)
  const isGeral = agent.unidade === "outro"

  async function save() {
    if (!prompt.trim()) return toast.error("O prompt não pode ficar vazio.")
    setBusy(true)
    const { error } = await supabase.from("agent_configs").update({
      prompt: prompt.trim(), guardrails: guardrails.trim() || null, mensagem_inicial: mensagem.trim() || null,
      score_minimo: Number(score) || 0, ativo,
    }).eq("id", agent.id)
    setBusy(false)
    if (error) return toast.error("Erro: " + error.message)
    toast.success("Agente atualizado.")
    onClose(true)
  }

  return createPortal(
    <div onClick={() => onClose()} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(5,6,5,.72)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="fade panel" style={{ width: "min(680px,96vw)", maxHeight: "92vh", display: "flex", flexDirection: "column", background: "var(--bg-1)", overflow: "hidden" }}>
        <div className="panel-h"><div className="row gap8 center"><Icon name="brain" size={16} style={{ color: "var(--lime)" }} /><h3 style={{ textTransform: "none", letterSpacing: 0, fontSize: 15, color: "var(--tx)" }}>Editar — {agent.nome}</h3></div><button className="btn btn--icon btn--dark" onClick={() => onClose()}><Icon name="x" size={16} /></button></div>
        <div className="scroll" style={{ padding: 16, overflow: "auto" }}>
          <div className="row gap8 center" style={{ marginBottom: 14 }}><span className="pill pill--lime">{unidadeMeta(agent.unidade).short}</span><span className="tag">{isGeral ? "Este prompt guia o widget público" : "Entra como diretriz quando esta unidade está em pauta"}</span></div>
          <div className="field"><label>Prompt (instruções do agente)</label><textarea className="textarea" style={{ minHeight: 170 }} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Como o agente deve se comportar, tom, objetivo, o que coletar…" /></div>
          <div className="field" style={{ marginTop: 12 }}><label>Guardrails</label><textarea className="textarea" style={{ minHeight: 90 }} value={guardrails} onChange={(e) => setGuardrails(e.target.value)} placeholder="O que o agente NUNCA pode fazer (garantir crédito, prazo, preço…)" /></div>
          <div className="field" style={{ marginTop: 12 }}><label>Mensagem inicial</label><textarea className="textarea" style={{ minHeight: 56 }} value={mensagem} onChange={(e) => setMensagem(e.target.value)} /></div>
          <div className="row gap16 center" style={{ marginTop: 12 }}>
            <div className="field" style={{ maxWidth: 150 }}><label>Score mínimo</label><input className="input" type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} /></div>
            <label className="row gap8 center" style={{ fontSize: 12.5, color: "var(--tx-dim)", marginTop: 16, cursor: "pointer" }}><input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} style={{ accentColor: "var(--lime)" }} /> Agente ativo</label>
          </div>
        </div>
        <div className="row center" style={{ padding: "14px 16px", borderTop: "1px solid var(--line)", justifyContent: "flex-end" }}>
          <div className="row gap8"><button className="btn btn--ghost btn--sm" onClick={() => onClose()}>Cancelar</button><Btn variant="lime" size="sm" icon="check" disabled={busy} onClick={save}>{busy ? "Salvando…" : "Salvar agente"}</Btn></div>
        </div>
      </div>
    </div>,
    document.body
  )
}

type RagDocWithCount = RagDoc & { rag_chunks?: { count: number }[]; agent_configs?: { nome: string } | null }

export function AdminAgentes() {
  const [agents, setAgents] = useState<AgentConfig[]>([])
  const [rag, setRag] = useState<RagDocWithCount[]>([])
  const [tab, setTab] = useState("Agentes")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [editAgent, setEditAgent] = useState<AgentConfig | null>(null)
  const loadAgents = () => supabase.from("agent_configs").select("*").order("nome").then(({ data }) => setAgents(data ?? []))
  const loadRag = () => supabase.from("rag_documents").select("*, rag_chunks(count), agent_configs(nome)").order("created_at", { ascending: false }).then(({ data }) => setRag((data as unknown as RagDocWithCount[]) ?? []))
  useEffect(() => { loadAgents(); loadRag() }, [])

  async function excluirDoc(d: RagDocWithCount) {
    if (!confirm(`Excluir "${d.titulo}" da base de conhecimento?`)) return
    await supabase.from("rag_chunks").delete().eq("document_id", d.id)
    await supabase.from("rag_documents").delete().eq("id", d.id)
    if (d.storage_key) await supabase.storage.from("tradek-rag").remove([d.storage_key])
    toast.success("Documento removido.")
    loadRag()
  }
  return (
    <div className="fade">
      <PageHead title="Agentes IA" sub="Configuração dos agentes por unidade, perguntas e guardrails" />
      <div className="row gap2" style={{ borderBottom: "1px solid var(--line)", marginBottom: 18 }}>{["Agentes", "RAG"].map((t) => <button key={t} onClick={() => setTab(t)} style={{ padding: "9px 14px", fontSize: 13, fontWeight: 600, color: tab === t ? "var(--tx)" : "var(--tx-mute)", borderBottom: "2px solid " + (tab === t ? "var(--lime)" : "transparent") }}>{t}</button>)}</div>
      {tab === "Agentes" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {agents.map((a) => (
            <div key={a.id} className="panel panel-b" onClick={() => setEditAgent(a)} style={{ cursor: "pointer" }}>
              <div className="row center gap10" style={{ marginBottom: 10 }}><span style={{ width: 34, height: 34, borderRadius: 8, background: "var(--lime)", color: "#0A0B0A", display: "grid", placeItems: "center" }}><Icon name="brain" size={16} /></span><div className="col"><span style={{ fontSize: 14, fontWeight: 700 }}>{a.nome}</span><span className="tag">{unidadeMeta(a.unidade).label} · score mín {a.score_minimo}</span></div>{a.ativo && <span className="pill pill--ok mla">Ativo</span>}<Icon name="edit" size={14} style={{ color: "var(--tx-mute)", marginLeft: a.ativo ? 8 : "auto" }} /></div>
              <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, margin: 0 }}>{a.mensagem_inicial}</p>
              <div className="hr" style={{ margin: "10px 0" }}></div>
              <div className="tag" style={{ marginBottom: 4 }}>Guardrails</div>
              <p className="muted" style={{ fontSize: 11.5, lineHeight: 1.45, margin: 0 }}>{a.guardrails}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel"><div className="panel-h"><h3>Base de conhecimento (RAG)</h3><button className="btn btn--lime btn--sm" onClick={() => setUploadOpen(true)}><Icon name="upload" size={13} /> Upload</button></div>
          <table className="tbl"><thead><tr>{["Documento", "Categoria", "Agente", "Chunks", "Status", ""].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{rag.map((d) => <tr key={d.id}><td><div className="row gap8 center"><Icon name="doc" size={15} style={{ color: "var(--tx-mute)" }} /><span className="strong">{d.titulo}</span>{d.storage_key && <Icon name="paperclip" size={12} style={{ color: "var(--tx-mute)" }} />}</div></td><td>{d.categoria}</td><td><span className="pill" style={{ fontSize: 10 }}>{d.agent_configs?.nome ?? (d.unidade ? unidadeMeta(d.unidade).short : "—")}</span></td><td className="mono">{d.rag_chunks?.[0]?.count ?? 0}</td><td><Pill variant={d.status === "ativo" ? "ok" : undefined}>{d.status}</Pill></td><td><button className="btn btn--icon btn--dark btn--sm" title="Excluir" onClick={() => excluirDoc(d)}><Icon name="x" size={13} /></button></td></tr>)}
            {rag.length === 0 && <tr><td colSpan={6} style={{ padding: 20, color: "var(--tx-mute)" }}>Nenhum documento na base. Clique em Upload para adicionar.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {uploadOpen && <RagUploadModal agents={agents} onClose={(changed) => { setUploadOpen(false); if (changed) loadRag() }} />}
      {editAgent && <AgentEditModal agent={editAgent} onClose={(changed) => { setEditAgent(null); if (changed) loadAgents() }} />}
    </div>
  )
}

/* ---------------- CONFIGURAÇÕES ---------------- */
type CompanyLite = { id: string; razao_social: string | null; nome_fantasia: string | null; cnpj: string | null; anonimizado: boolean }

/* LGPD (RNF-003): export e anonimização de dados de uma empresa via Edge Function `lgpd` */
function LgpdPanel() {
  const [companies, setCompanies] = useState<CompanyLite[]>([])
  const [companyId, setCompanyId] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    supabase.from("companies").select("id,razao_social,nome_fantasia,cnpj,anonimizado").order("razao_social")
      .then(({ data }) => setCompanies((data as unknown as CompanyLite[]) ?? []))
  }, [])
  const selected = companies.find((c) => c.id === companyId)
  const nome = (c: CompanyLite) => c.razao_social || c.nome_fantasia || c.cnpj || c.id.slice(0, 8)

  async function exportar() {
    if (!companyId) return toast.error("Selecione uma empresa.")
    setBusy(true)
    const { data, error } = await supabase.functions.invoke("lgpd", { body: { action: "export", company_id: companyId } })
    setBusy(false)
    if (error) return toast.error("Erro ao exportar: " + error.message)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const href = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = href; a.download = `lgpd-export-${companyId.slice(0, 8)}.json`; a.click()
    URL.revokeObjectURL(href)
    toast.success("Dados exportados — download iniciado.")
  }

  async function anonimizar() {
    if (!companyId) return toast.error("Selecione uma empresa.")
    if (!window.confirm("Anonimizar (excluir) definitivamente os dados pessoais desta empresa? Esta ação não pode ser desfeita.")) return
    setBusy(true)
    const { data, error } = await supabase.functions.invoke("lgpd", { body: { action: "anonymize", company_id: companyId } })
    setBusy(false)
    if (error) return toast.error("Erro ao anonimizar: " + error.message)
    const r = data as { contatos_anonimizados?: number; leads_anonimizados?: number }
    toast.success(`Dados anonimizados — ${r.contatos_anonimizados ?? 0} contato(s), ${r.leads_anonimizados ?? 0} lead(s).`)
    setCompanies((arr) => arr.map((c) => (c.id === companyId ? { ...c, anonimizado: true } : c)))
  }

  return (
    <div>
      <div className="tag" style={{ marginBottom: 14 }}>Privacidade e dados pessoais (LGPD · RNF-003)</div>
      <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
        Atenda às solicitações do titular: exporte todos os dados de uma empresa/lead (portabilidade) ou
        anonimize a PII sob demanda (direito à exclusão). As ações usam a function <span className="mono">lgpd</span> e ficam registradas em <span className="mono">audit_logs</span>.
      </p>
      <div className="field" style={{ maxWidth: 460, marginBottom: 16 }}>
        <label>Empresa</label>
        <select className="input" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
          <option value="">Selecione uma empresa…</option>
          {companies.map((c) => <option key={c.id} value={c.id}>{nome(c)}{c.anonimizado ? " · anonimizado" : ""}</option>)}
        </select>
      </div>
      {selected?.anonimizado && <div className="panel" style={{ padding: "10px 12px", marginBottom: 14 }}><span className="pill pill--ok"><Icon name="check" size={12} /> Empresa já anonimizada</span></div>}
      <div className="row gap10">
        <Btn variant="dark" icon="download" disabled={busy || !companyId} onClick={exportar}>Exportar dados (JSON)</Btn>
        <Btn variant="danger" icon="alert" disabled={busy || !companyId || selected?.anonimizado} onClick={anonimizar}>Anonimizar / Excluir</Btn>
      </div>
    </div>
  )
}

export function AdminConfig() {
  const { role } = useAuth()
  const [sec, setSec] = useState("Status do CRM")
  const [statuses, setStatuses] = useState<Pipeline[]>([])
  const [templates, setTemplates] = useState<EmailTpl[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [convidar, setConvidar] = useState(false)
  const [editando, setEditando] = useState<Profile | null>(null)
  const loadUsers = () => supabase.from("profiles").select("*, companies(razao_social,nome_fantasia)").not("role", "is", null).then(({ data }) => setUsers((data as unknown as Profile[]) ?? []))
  useEffect(() => {
    supabase.from("pipeline_statuses").select("*").order("ordem").then(({ data }) => setStatuses(data ?? []))
    supabase.from("email_templates").select("*").order("nome").then(({ data }) => setTemplates(data ?? []))
    loadUsers()
  }, [])
  const secs: [string, string][] = [["Status do CRM", "kanban"], ["Templates", "mail"], ["Usuários", "users"], ["Empresa", "building"], ["Segurança", "shield"], ["LGPD", "lock"]]
  return (
    <div className="fade" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12, height: "100%" }}>
      <div className="panel" style={{ height: "fit-content", padding: 8 }}>{secs.map(([s, ic]) => <button key={s} onClick={() => setSec(s)} className="row gap10 center" style={{ width: "100%", padding: "9px 11px", borderRadius: 6, fontSize: 13, fontWeight: 600, textAlign: "left", color: sec === s ? "#0A0B0A" : "var(--tx-dim)", background: sec === s ? "var(--lime)" : "transparent", marginBottom: 2 }}><Icon name={ic} size={15} />{s}</button>)}</div>
      <div className="panel panel-b">
        {sec === "Status do CRM" ? (
          <div><div className="tag" style={{ marginBottom: 14 }}>Etapas do funil</div><div className="col gap8">{statuses.map((s) => <div key={s.key} className="row center gap10 panel" style={{ padding: "10px 12px" }}><Icon name="menu" size={14} style={{ color: "var(--tx-faint)" }} /><span className="sdot" style={{ background: s.cor ?? "var(--tx-mute)" }}></span><span style={{ fontSize: 13, fontWeight: 600 }}>{s.label_admin}</span></div>)}</div></div>
        ) : sec === "Templates" ? (
          <div><div className="tag" style={{ marginBottom: 14 }}>Templates de e-mail</div><div className="col gap8">{templates.map((t) => <div key={t.id} className="row center gap10 panel" style={{ padding: "12px 14px" }}><Icon name="mail" size={15} style={{ color: "var(--lime)" }} /><div className="col"><span style={{ fontSize: 13, fontWeight: 600 }}>{t.nome}</span><span className="tag">{t.assunto}</span></div>{t.ativo && <span className="pill pill--ok mla">ativo</span>}</div>)}</div></div>
        ) : sec === "Usuários" ? (
          <div>
            <div className="row center" style={{ justifyContent: "space-between", marginBottom: 14 }}>
              <div className="tag">Usuários internos</div>
              {role === "master" && <button className="btn btn--lime btn--sm" onClick={() => setConvidar(true)}><Icon name="plus" size={13} /> Convidar usuário</button>}
            </div>
            <table className="tbl"><thead><tr>{["Usuário", "Perfil", "Último login", "Status", ""].map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{users.map((u) => <tr key={u.id} onClick={() => role === "master" && setEditando(u)} style={{ cursor: role === "master" ? "pointer" : "default" }}><td><div className="row gap8 center"><Avatar name={u.nome ?? "?"} size={26} /><span className="strong">{u.nome ?? "—"}</span></div></td><td><span className="pill">{u.role}</span></td><td className="mono">{u.ultimo_login ? new Date(u.ultimo_login).toLocaleDateString("pt-BR") : "—"}</td><td><Pill variant={u.bloqueado ? "danger" : "ok"}>{u.bloqueado ? "Bloqueado" : "Ativo"}</Pill></td><td>{role === "master" && <Icon name="chevR" size={14} style={{ color: "var(--tx-faint)" }} />}</td></tr>)}</tbody></table>
          </div>
        ) : sec === "LGPD" ? (
          <LgpdPanel />
        ) : (
          <div><div className="tag" style={{ marginBottom: 14 }}>{sec}</div><p className="muted" style={{ fontSize: 13 }}>Configurações de {sec.toLowerCase()} ficam em <span className="mono">tradek.settings</span> (ajuste via banco/seed). A edição visual desta seção não é necessária para a operação.</p></div>
        )}
      </div>
      {convidar && <ConvidarUsuarioModal onClose={() => setConvidar(false)} onInvited={loadUsers} />}
      {editando && <EditarUsuarioModal usuario={editando} onClose={() => setEditando(null)} onSaved={loadUsers} />}
    </div>
  )
}

function EditarUsuarioModal({ usuario, onClose, onSaved }: { usuario: Profile; onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth()
  const ROLES: [string, string][] = [["master", "Master"], ["gerente", "Gerente"], ["comercial", "Comercial"], ["operacional", "Operacional"], ["financeiro", "Financeiro"], ["atendimento", "Atendimento"], ["leitura", "Leitura"]]
  const isSelf = user?.id === usuario.id
  const [nome, setNome] = useState(usuario.nome ?? "")
  const [cargo, setCargo] = useState(usuario.cargo ?? "")
  const [perfil, setPerfil] = useState(usuario.role)
  const [ativo, setAtivo] = useState(usuario.ativo)
  const [bloqueado, setBloqueado] = useState(usuario.bloqueado)
  const [busy, setBusy] = useState(false)

  async function salvar() {
    setBusy(true)
    const { error } = await supabase.from("profiles").update({
      nome: nome || null, cargo: cargo || null, role: perfil,
      ativo, bloqueado: isSelf ? false : bloqueado,
    }).eq("id", usuario.id)
    setBusy(false)
    if (error) return toast.error("Erro ao salvar: " + error.message)
    toast.success("Usuário atualizado.")
    onSaved()
    onClose()
  }

  async function excluir() {
    if (isSelf) return toast.error("Você não pode excluir a própria conta.")
    if (!confirm(`Excluir o usuário "${usuario.nome ?? usuario.id}"? Esta ação não pode ser desfeita.`)) return
    setBusy(true)
    const { data, error } = await supabase.functions.invoke("delete-internal-user", { body: { user_id: usuario.id } })
    setBusy(false)
    if (error || data?.error) return toast.error(data?.error ?? "Erro ao excluir usuário.")
    toast.success("Usuário excluído.")
    onSaved()
    onClose()
  }

  return createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(5,6,5,.72)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, maxWidth: 440, width: "100%" }}>
        <div className="row center" style={{ justifyContent: "space-between", marginBottom: 18 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Editar usuário{isSelf ? " (você)" : ""}</span>
          <button className="btn btn--ghost btn--sm" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div className="col gap14">
          <div className="field"><label>Nome completo</label><input className="input" value={nome} onChange={(e) => setNome(e.target.value)} /></div>
          <div className="field"><label>Cargo</label><input className="input" value={cargo ?? ""} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Gerente comercial" /></div>
          <div className="field"><label>E-mail</label><input className="input" value={usuario.email ?? "—"} disabled style={{ opacity: 0.6 }} /></div>
          <div className="field"><label>Role (hierarquia)</label>
            <select className="input" value={perfil} onChange={(e) => setPerfil(e.target.value as Profile["role"])}>
              {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="row gap16">
            <label className="row gap8 center" style={{ fontSize: 13 }}><input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} /> Ativo</label>
            <label className="row gap8 center" style={{ fontSize: 13, opacity: isSelf ? 0.5 : 1 }}>
              <input type="checkbox" checked={bloqueado} disabled={isSelf} onChange={(e) => setBloqueado(e.target.checked)} /> Bloqueado
            </label>
          </div>
          <div className="row gap8" style={{ justifyContent: "space-between", marginTop: 4 }}>
            <button className="btn btn--danger btn--sm" onClick={excluir} disabled={busy || isSelf}><Icon name="trash" size={13} /> Excluir</button>
            <div className="row gap8">
              <button className="btn btn--ghost btn--sm" onClick={onClose}>Cancelar</button>
              <button className="btn btn--lime btn--sm" onClick={salvar} disabled={busy}>{busy ? "Salvando…" : "Salvar alterações"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function ConvidarUsuarioModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const ROLES: [string, string][] = [["master", "Master"], ["gerente", "Gerente"], ["comercial", "Comercial"], ["operacional", "Operacional"], ["financeiro", "Financeiro"], ["atendimento", "Atendimento"], ["leitura", "Leitura"]]
  const [nome, setNome] = useState("")
  const [cargo, setCargo] = useState("")
  const [email, setEmail] = useState("")
  const [perfil, setPerfil] = useState("comercial")
  const [busy, setBusy] = useState(false)

  async function convidar() {
    if (!nome.trim()) return toast.error("Informe o nome completo.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("E-mail inválido.")
    setBusy(true)
    try {
      const { data, error } = await supabase.functions.invoke("create-internal-user", {
        body: { nome, email, role: perfil, cargo: cargo || null },
      })
      if (error) throw error
      if (data?.error) { toast.error(data.error); return }
      toast.success(data?.email === "enviado" ? "Convite enviado por e-mail." : "Usuário criado. Configure o envio de e-mail (RESEND_API_KEY) para convites automáticos.")
      onInvited()
      onClose()
    } catch {
      toast.error("Não foi possível convidar o usuário.")
    } finally {
      setBusy(false)
    }
  }

  return createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(5,6,5,.72)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, maxWidth: 440, width: "100%" }}>
        <div className="row center" style={{ justifyContent: "space-between", marginBottom: 18 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Convidar usuário interno</span>
          <button className="btn btn--ghost btn--sm" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div className="col gap14">
          <div className="field"><label>Nome completo</label><input className="input" value={nome} onChange={(e) => setNome(e.target.value)} /></div>
          <div className="field"><label>Cargo</label><input className="input" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Gerente comercial" /></div>
          <div className="field"><label>E-mail</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="field"><label>Role</label>
            <select className="input" value={perfil} onChange={(e) => setPerfil(e.target.value)}>
              {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="row gap8" style={{ justifyContent: "flex-end", marginTop: 4 }}>
            <button className="btn btn--ghost btn--sm" onClick={onClose}>Cancelar</button>
            <button className="btn btn--lime btn--sm" onClick={convidar} disabled={busy}>{busy ? "Enviando…" : "Enviar convite"}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
