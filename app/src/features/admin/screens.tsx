import { useEffect, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"
import { Icon, Btn, Pill, Avatar, Score } from "@/components/tradek/ui"
import { unidadeMeta } from "./admin-data"

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
  const [f, setF] = useState({
    modelo: produto?.modelo ?? "", categoria: produto?.categoria ?? "Moto Eletrica",
    motor: produto?.motor ?? "", velocidade: produto?.velocidade ?? "", autonomia: produto?.autonomia ?? "",
    bateria: produto?.bateria ?? "", freios: produto?.freios ?? "", moq: produto?.moq ?? "One container",
    preco_base: String(produto?.preco_base ?? ""), moeda: produto?.moeda ?? "USD",
    descricao_curta: produto?.descricao_curta ?? "", status: produto?.status ?? "rascunho",
    publicado_site: produto?.publicado_site ?? false, permitir_cotacao_ia: produto?.permitir_cotacao_ia ?? false,
  })
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: string | boolean) => setF((s) => ({ ...s, [k]: v }))

  async function save() {
    setBusy(true)
    const payload = {
      modelo: f.modelo, categoria: f.categoria, motor: f.motor, velocidade: f.velocidade, autonomia: f.autonomia,
      bateria: f.bateria, freios: f.freios, moq: f.moq, preco_base: f.preco_base ? Number(f.preco_base) : null,
      moeda: f.moeda, descricao_curta: f.descricao_curta, status: f.status,
      publicado_site: f.publicado_site, permitir_cotacao_ia: f.permitir_cotacao_ia,
    }
    const { error } = produto ? await supabase.from("products").update(payload).eq("id", produto.id) : await supabase.from("products").insert(payload)
    setBusy(false)
    if (error) return toast.error("Erro: " + error.message)
    toast.success(isNew ? "Produto criado." : "Produto salvo.")
    onClose()
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(5,6,5,.72)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="fade panel" style={{ width: "min(680px,96vw)", maxHeight: "92vh", display: "flex", flexDirection: "column", background: "var(--bg-1)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <div className="row center gap12">
            <span className="moto-thumb" style={{ width: 46, height: 46, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0 }}>{produto && img0(produto) ? <img src={img0(produto)} alt="" /> : <Icon name="box" size={20} style={{ color: "#7a8074" }} />}</span>
            <div className="col" style={{ lineHeight: 1.3 }}><span className="disp" style={{ fontSize: 18, fontWeight: 600 }}>{isNew ? "Novo produto" : f.modelo}</span><span className="tag">Catálogo dinâmico · alimenta site e agente IA</span></div>
            <button className="btn btn--icon btn--dark mla" onClick={onClose}><Icon name="x" size={16} /></button>
          </div>
        </div>
        <div className="scroll" style={{ flex: 1, padding: 20 }}>
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
    </div>
  )
}

/* ---------------- EMPRESAS ---------------- */
export function AdminEmpresas() {
  const [companies, setCompanies] = useState<Company[]>([])
  useEffect(() => { supabase.from("companies").select("*").order("created_at", { ascending: false }).then(({ data }) => setCompanies(data ?? [])) }, [])
  return (
    <div className="fade">
      <PageHead title="Empresas & Contatos" sub="Cadastro de empresas, contatos e oportunidades" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {companies.map((c) => (
          <div key={c.id} className="panel panel-b">
            <div className="row center gap10"><span style={{ width: 40, height: 40, borderRadius: 9, background: "var(--bg)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--lime)" }}><Icon name="building" size={18} /></span>
              <div className="col fill" style={{ minWidth: 0, lineHeight: 1.3 }}><span style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.nome_fantasia || c.razao_social || "—"}</span><span className="mono tag">{c.cnpj || "sem CNPJ"}</span></div></div>
            <div className="hr" style={{ margin: "12px 0" }}></div>
            <div className="row center" style={{ justifyContent: "space-between" }}><span className="row gap6 center" style={{ fontSize: 12, color: "var(--tx-dim)" }}><Icon name="globe" size={13} />{c.site || "—"}</span></div>
          </div>
        ))}
        {companies.length === 0 && <span className="muted" style={{ fontSize: 13 }}>Nenhuma empresa cadastrada.</span>}
      </div>
    </div>
  )
}

/* ---------------- CLIENTES ---------------- */
function CriarAcessoModal({ onClose }: { onClose: (changed?: boolean) => void }) {
  const [companies, setCompanies] = useState<{ id: string; razao_social: string | null; nome_fantasia: string | null }[]>([])
  const [companyId, setCompanyId] = useState("")
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [busy, setBusy] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  useEffect(() => { supabase.from("companies").select("id,razao_social,nome_fantasia").order("razao_social").then(({ data }) => setCompanies(data ?? [])) }, [])

  async function criar() {
    if (!email.trim()) return toast.error("Informe o e-mail do cliente.")
    setBusy(true)
    const { data, error } = await supabase.functions.invoke("create-client", { body: { email: email.trim(), nome: nome.trim() || null, company_id: companyId || null, whatsapp: whatsapp.trim() || null } })
    setBusy(false)
    if (error) return toast.error("Erro ao criar acesso: " + error.message)
    const al = (data as { action_link?: string })?.action_link ?? null
    if (al) { try { await navigator.clipboard.writeText(al) } catch { /* ignore */ } }
    setLink(al ?? "")
    toast.success("Acesso criado." + (al ? " Link de 1º acesso copiado." : ""))
  }

  return (
    <div onClick={() => onClose(!!link)} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(5,6,5,.72)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="fade panel" style={{ width: "min(520px,96vw)", background: "var(--bg-1)", overflow: "hidden" }}>
        <div className="panel-h"><div className="row gap8 center"><Icon name="user" size={16} style={{ color: "var(--lime)" }} /><h3 style={{ textTransform: "none", letterSpacing: 0, fontSize: 15, color: "var(--tx)" }}>Criar acesso ao portal</h3></div><button className="btn btn--icon btn--dark" onClick={() => onClose(!!link)}><Icon name="x" size={16} /></button></div>
        <div className="panel-b">
          {link === null ? (
            <>
              <div className="field"><label>Empresa</label><select className="select" value={companyId} onChange={(e) => setCompanyId(e.target.value)}><option value="">— sem empresa —</option>{companies.map((c) => <option key={c.id} value={c.id}>{c.nome_fantasia || c.razao_social || c.id.slice(0, 8)}</option>)}</select></div>
              <div className="field" style={{ marginTop: 12 }}><label>Nome do contato</label><input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do cliente" /></div>
              <div className="field" style={{ marginTop: 12 }}><label>E-mail</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@empresa.com" /></div>
              <div className="field" style={{ marginTop: 12 }}><label>WhatsApp</label><input className="input" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+55 11 99999-9999" /></div>
              <p className="muted" style={{ fontSize: 12, lineHeight: 1.5, marginTop: 12 }}>Criamos o usuário com papel cliente e enviamos o convite de 1º acesso por e-mail (Resend). O link também é copiado aqui.</p>
              <div className="row gap8" style={{ marginTop: 16, justifyContent: "flex-end" }}><button className="btn btn--ghost btn--sm" onClick={() => onClose()}>Cancelar</button><Btn variant="lime" size="sm" icon="check" disabled={busy} onClick={criar}>{busy ? "Criando…" : "Criar acesso"}</Btn></div>
            </>
          ) : (
            <>
              <div className="row gap8 center" style={{ marginBottom: 12 }}><Icon name="check" size={18} style={{ color: "var(--lime)" }} /><span style={{ fontWeight: 700 }}>Acesso criado para {email}</span></div>
              {link ? (<><div className="tag" style={{ marginBottom: 6 }}>Link de 1º acesso (copiado)</div><div className="input" style={{ wordBreak: "break-all", fontSize: 11.5, color: "var(--tx-dim)" }}>{link}</div></>) : <p className="muted" style={{ fontSize: 13 }}>O convite foi enviado por e-mail.</p>}
              <div className="row gap8" style={{ marginTop: 16, justifyContent: "flex-end" }}><Btn variant="lime" size="sm" icon="check" onClick={() => onClose(true)}>Concluir</Btn></div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

type ContactRow = { id: string; nome: string | null; email: string | null; whatsapp: string | null; created_at: string; companies: { razao_social: string | null; nome_fantasia: string | null } | null; leads: { unidade: string | null; status: string | null }[] }

export function AdminClientes() {
  const [contatos, setContatos] = useState<ContactRow[]>([])
  const [criarOpen, setCriarOpen] = useState(false)
  const load = () => supabase.from("contacts").select("id,nome,email,whatsapp,created_at,companies(razao_social,nome_fantasia),leads(unidade,status)").order("created_at", { ascending: false }).then(({ data }) => setContatos((data as unknown as ContactRow[]) ?? []))
  useEffect(() => { load() }, [])
  return (
    <div className="fade">
      <PageHead title="Clientes & Contatos" sub="Todos os contatos do CRM — leads qualificados e clientes com acesso ao portal" actions={<button className="btn btn--lime btn--sm" onClick={() => setCriarOpen(true)}><Icon name="plus" size={13} /> Criar acesso</button>} />
      <div className="panel scroll" style={{ overflow: "auto" }}>
        <table className="tbl"><thead><tr>{["Contato", "Empresa", "E-mail / WhatsApp", "Unidade", "Status", "Desde"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{contatos.map((c, i) => {
            const lead = c.leads?.[0]
            const { short, color } = lead?.unidade ? unidadeMeta(lead.unidade) : { short: "—", color: "var(--tx-mute)" }
            return (
              <tr key={c.id}>
                <td><div className="row gap8 center"><Avatar name={c.nome ?? "?"} size={26} tone={i % 2 ? "info" : "lime"} /><span className="strong">{c.nome ?? "—"}</span></div></td>
                <td>{c.companies?.nome_fantasia || c.companies?.razao_social || "—"}</td>
                <td><div style={{ fontSize: 12 }}><div>{c.email ?? "—"}</div><div className="muted">{c.whatsapp ?? ""}</div></div></td>
                <td><span style={{ fontSize: 12, fontWeight: 600, color }}>{short}</span></td>
                <td>{lead?.status ? <Pill variant="info">{lead.status}</Pill> : <span className="faint">—</span>}</td>
                <td className="mono">{new Date(c.created_at).toLocaleDateString("pt-BR")}</td>
              </tr>
            )
          })}
          {contatos.length === 0 && <tr><td colSpan={6} style={{ padding: 20, color: "var(--tx-mute)" }}>Nenhum contato ainda.</td></tr>}
          </tbody>
        </table>
      </div>
      {criarOpen && <CriarAcessoModal onClose={(changed) => { setCriarOpen(false); if (changed) load() }} />}
    </div>
  )
}

/* ---------------- TAREFAS ---------------- */
function NovaTarefaModal({ onClose }: { onClose: (changed?: boolean) => void }) {
  const [users, setUsers] = useState<{ id: string; nome: string | null }[]>([])
  const [f, setF] = useState({ titulo: "", descricao: "", prioridade: "media", prazo: "", responsavel_id: "" })
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }))
  useEffect(() => { supabase.from("profiles").select("id,nome").neq("role", "cliente").order("nome").then(({ data }) => setUsers(data ?? [])) }, [])

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

  return (
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
    </div>
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
type DocReq = { id: string; tipo_documento: string; status: string; solicitado_em: string; companies: { razao_social: string | null; nome_fantasia: string | null } | null }
export function AdminDocumentos() {
  const [docs, setDocs] = useState<DocReq[]>([])
  useEffect(() => { supabase.from("document_requests").select("id,tipo_documento,status,solicitado_em,companies(razao_social,nome_fantasia)").order("solicitado_em", { ascending: false }).then(({ data }) => setDocs((data as unknown as DocReq[]) ?? [])) }, [])
  const count = (s: string) => docs.filter((d) => d.status === s).length
  return (
    <div className="fade">
      <PageHead title="Documentos & Checklists" sub="Gestão documental de todos os clientes" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 14 }}>
        {([["Solicitados", count("solicitado"), "warn"], ["Em revisão", count("em_revisao"), "info"], ["Aprovados", count("aprovado"), "ok"], ["Reprovados", count("reprovado"), "danger"]] as [string, number, string][]).map(([l, n, c]) => <div key={l} className="panel panel-b"><div className="row center" style={{ justifyContent: "space-between" }}><span className="tag">{l}</span><span className="sdot" style={{ background: `var(--${c})` }}></span></div><div className="disp" style={{ fontSize: 28, fontWeight: 600, marginTop: 6 }}>{n}</div></div>)}
      </div>
      <div className="panel scroll" style={{ overflow: "auto" }}>
        <table className="tbl"><thead><tr>{["Empresa", "Documento", "Status", "Solicitado"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{docs.map((d) => <tr key={d.id}><td className="strong">{d.companies?.nome_fantasia || d.companies?.razao_social || "—"}</td><td>{d.tipo_documento}</td><td><Pill variant={d.status === "aprovado" ? "ok" : d.status === "reprovado" ? "danger" : "warn"}>{d.status}</Pill></td><td className="mono">{new Date(d.solicitado_em).toLocaleDateString("pt-BR")}</td></tr>)}
          {docs.length === 0 && <tr><td colSpan={4} style={{ padding: 20, color: "var(--tx-mute)" }}>Nenhum documento solicitado ainda.</td></tr>}
          </tbody>
        </table>
      </div>
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
      <PageHead title="Central de Interações" sub="Conversas do agente IA e do portal" />
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

  return (
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
    </div>
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

  return (
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
    </div>
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
  const [sec, setSec] = useState("Status do CRM")
  const [statuses, setStatuses] = useState<Pipeline[]>([])
  const [templates, setTemplates] = useState<EmailTpl[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  useEffect(() => {
    supabase.from("pipeline_statuses").select("*").order("ordem").then(({ data }) => setStatuses(data ?? []))
    supabase.from("email_templates").select("*").order("nome").then(({ data }) => setTemplates(data ?? []))
    supabase.from("profiles").select("*, companies(razao_social,nome_fantasia)").neq("role", "cliente").then(({ data }) => setUsers((data as unknown as Profile[]) ?? []))
  }, [])
  const secs: [string, string][] = [["Status do CRM", "kanban"], ["Templates", "mail"], ["Usuários", "users"], ["Empresa", "building"], ["Segurança", "shield"], ["LGPD", "lock"]]
  return (
    <div className="fade" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12, height: "100%" }}>
      <div className="panel" style={{ height: "fit-content", padding: 8 }}>{secs.map(([s, ic]) => <button key={s} onClick={() => setSec(s)} className="row gap10 center" style={{ width: "100%", padding: "9px 11px", borderRadius: 6, fontSize: 13, fontWeight: 600, textAlign: "left", color: sec === s ? "#0A0B0A" : "var(--tx-dim)", background: sec === s ? "var(--lime)" : "transparent", marginBottom: 2 }}><Icon name={ic} size={15} />{s}</button>)}</div>
      <div className="panel panel-b">
        {sec === "Status do CRM" ? (
          <div><div className="tag" style={{ marginBottom: 14 }}>Etapas do funil (rótulo admin → cliente)</div><div className="col gap8">{statuses.map((s) => <div key={s.key} className="row center gap10 panel" style={{ padding: "10px 12px" }}><Icon name="menu" size={14} style={{ color: "var(--tx-faint)" }} /><span className="sdot" style={{ background: s.cor ?? "var(--tx-mute)" }}></span><span style={{ fontSize: 13, fontWeight: 600 }}>{s.label_admin}</span><span className="tag mla">cliente vê: {s.label_cliente}</span></div>)}</div></div>
        ) : sec === "Templates" ? (
          <div><div className="tag" style={{ marginBottom: 14 }}>Templates de e-mail</div><div className="col gap8">{templates.map((t) => <div key={t.id} className="row center gap10 panel" style={{ padding: "12px 14px" }}><Icon name="mail" size={15} style={{ color: "var(--lime)" }} /><div className="col"><span style={{ fontSize: 13, fontWeight: 600 }}>{t.nome}</span><span className="tag">{t.assunto}</span></div>{t.ativo && <span className="pill pill--ok mla">ativo</span>}</div>)}</div></div>
        ) : sec === "Usuários" ? (
          <div><div className="tag" style={{ marginBottom: 14 }}>Usuários internos</div><table className="tbl"><thead><tr>{["Usuário", "Perfil", "Último login", "Status"].map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{users.map((u) => <tr key={u.id}><td><div className="row gap8 center"><Avatar name={u.nome ?? "?"} size={26} /><span className="strong">{u.nome ?? "—"}</span></div></td><td><span className="pill">{u.role}</span></td><td className="mono">{u.ultimo_login ? new Date(u.ultimo_login).toLocaleDateString("pt-BR") : "—"}</td><td><Pill variant={u.bloqueado ? "danger" : "ok"}>{u.bloqueado ? "Bloqueado" : "Ativo"}</Pill></td></tr>)}</tbody></table></div>
        ) : sec === "LGPD" ? (
          <LgpdPanel />
        ) : (
          <div><div className="tag" style={{ marginBottom: 14 }}>{sec}</div><p className="muted" style={{ fontSize: 13 }}>Configurações de {sec.toLowerCase()} ficam em <span className="mono">tradek.settings</span> (ajuste via banco/seed). A edição visual desta seção não é necessária para a operação.</p></div>
        )}
      </div>
    </div>
  )
}
