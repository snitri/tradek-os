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
        <table className="tbl"><thead><tr>{["Modelo", "Categoria", "Motor", "Bateria", "Velocidade", "Autonomia", "Valor base", "Status", "Site", "Cotação IA", ""].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>{products.map((p) => (
            <tr key={p.id} onClick={() => setModal(p)} style={{ cursor: "pointer" }}>
              <td><div className="row gap10 center"><span className="moto-thumb" style={{ width: 38, height: 38, borderRadius: 7, flexShrink: 0 }}>{img0(p) && <img src={img0(p)} alt={p.modelo} />}</span><span className="strong">{p.modelo}</span></div></td>
              <td>{p.categoria}</td><td className="mono">{p.motor}</td><td>{p.bateria}</td><td className="mono">{p.velocidade}</td><td className="mono">{p.autonomia}</td>
              <td className="mono strong">{p.moeda} {p.preco_base}</td>
              <td><Pill variant={p.status === "publicado" ? "ok" : "warn"}>{p.status}</Pill></td>
              <td>{p.publicado_site ? <Icon name="check" size={15} style={{ color: "var(--ok)" }} /> : <Icon name="x" size={15} style={{ color: "var(--tx-faint)" }} />}</td>
              <td>{p.permitir_cotacao_ia ? <Pill variant="ok">Sim</Pill> : <Pill>Não</Pill>}</td>
              <td><button className="btn btn--dark btn--sm" onClick={(e) => { e.stopPropagation(); setModal(p) }}><Icon name="edit" size={12} /></button></td>
            </tr>
          ))}
          {products.length === 0 && <tr><td colSpan={11} style={{ padding: 20, color: "var(--tx-mute)" }}>Nenhum produto.</td></tr>}
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
            <div className="field"><label>MOQ / Condição</label><input className="input" value={f.moq} onChange={(e) => set("moq", e.target.value)} /></div>
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
export function AdminClientes() {
  const [clientes, setClientes] = useState<Profile[]>([])
  useEffect(() => { supabase.from("profiles").select("*, companies(razao_social,nome_fantasia)").eq("role", "cliente").then(({ data }) => setClientes((data as unknown as Profile[]) ?? [])) }, [])
  return (
    <div className="fade">
      <PageHead title="Clientes & Acessos" sub="Usuários externos com acesso ao portal" actions={<button className="btn btn--lime btn--sm" onClick={() => toast.info("Criação de acesso entra no Plano 06.")}><Icon name="plus" size={13} /> Criar acesso</button>} />
      <div className="panel scroll" style={{ overflow: "auto" }}>
        <table className="tbl"><thead><tr>{["Cliente", "Empresa", "Acesso", "Último login", "Ações"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{clientes.map((c, i) => (
            <tr key={c.id}>
              <td><div className="row gap8 center"><Avatar name={c.nome ?? "?"} size={26} tone={i % 2 ? "info" : "lime"} /><span className="strong">{c.nome ?? "—"}</span></div></td>
              <td>{c.companies?.nome_fantasia || c.companies?.razao_social || "—"}</td>
              <td><Pill variant={c.bloqueado ? "danger" : c.ativo ? "ok" : "warn"}>{c.bloqueado ? "Bloqueado" : c.ativo ? "Ativo" : "Inativo"}</Pill></td>
              <td className="mono">{c.ultimo_login ? new Date(c.ultimo_login).toLocaleDateString("pt-BR") : "—"}</td>
              <td><div className="row gap6"><button className="btn btn--dark btn--sm"><Icon name="mail" size={12} /></button><button className="btn btn--dark btn--sm"><Icon name="more" size={12} /></button></div></td>
            </tr>
          ))}
          {clientes.length === 0 && <tr><td colSpan={5} style={{ padding: 20, color: "var(--tx-mute)" }}>Nenhum cliente com acesso ainda. (Criação no Plano 06.)</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------------- TAREFAS ---------------- */
export function AdminTarefas() {
  const [tasks, setTasks] = useState<Task[]>([])
  useEffect(() => { supabase.from("tasks").select("*").order("prazo").then(({ data }) => setTasks(data ?? [])) }, [])
  const cols: [string, string][] = [["aberta", "A fazer"], ["em_andamento", "Em andamento"], ["concluida", "Concluídas"]]
  return (
    <div className="fade">
      <PageHead title="Tarefas & SLA" sub="Follow-ups e prazos das oportunidades" actions={<button className="btn btn--lime btn--sm" onClick={() => toast.info("Nova tarefa em breve.")}><Icon name="plus" size={13} /> Nova tarefa</button>} />
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
          {reports.length === 0 && <tr><td colSpan={4} style={{ padding: 20, color: "var(--tx-mute)" }}>Nenhum relatório gerado ainda. (Geração por IA no Plano 07.)</td></tr>}
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
          {convs.length === 0 && <tr><td colSpan={5} style={{ padding: 20, color: "var(--tx-mute)" }}>Nenhuma conversa registrada. (Agente conversacional real no Plano 07.)</td></tr>}
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
          <div className="panel panel-b" style={{ marginTop: 14, background: "var(--bg-2)", display: "flex", gap: 10 }}><Icon name="alert" size={16} style={{ color: "var(--warn)", flexShrink: 0 }} /><span className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>O envio real de e-mails (Resend) e o disparo por eventos entram no Plano 08.</span></div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- AGENTES IA ---------------- */
export function AdminAgentes() {
  const [agents, setAgents] = useState<AgentConfig[]>([])
  const [rag, setRag] = useState<RagDoc[]>([])
  const [tab, setTab] = useState("Agentes")
  useEffect(() => {
    supabase.from("agent_configs").select("*").order("nome").then(({ data }) => setAgents(data ?? []))
    supabase.from("rag_documents").select("*").order("created_at", { ascending: false }).then(({ data }) => setRag(data ?? []))
  }, [])
  return (
    <div className="fade">
      <PageHead title="Agentes IA" sub="Configuração dos agentes por unidade, perguntas e guardrails" />
      <div className="row gap2" style={{ borderBottom: "1px solid var(--line)", marginBottom: 18 }}>{["Agentes", "RAG"].map((t) => <button key={t} onClick={() => setTab(t)} style={{ padding: "9px 14px", fontSize: 13, fontWeight: 600, color: tab === t ? "var(--tx)" : "var(--tx-mute)", borderBottom: "2px solid " + (tab === t ? "var(--lime)" : "transparent") }}>{t}</button>)}</div>
      {tab === "Agentes" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {agents.map((a) => (
            <div key={a.id} className="panel panel-b">
              <div className="row center gap10" style={{ marginBottom: 10 }}><span style={{ width: 34, height: 34, borderRadius: 8, background: "var(--lime)", color: "#0A0B0A", display: "grid", placeItems: "center" }}><Icon name="brain" size={16} /></span><div className="col"><span style={{ fontSize: 14, fontWeight: 700 }}>{a.nome}</span><span className="tag">{unidadeMeta(a.unidade).label} · score mín {a.score_minimo}</span></div>{a.ativo && <span className="pill pill--ok mla">Ativo</span>}</div>
              <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, margin: 0 }}>{a.mensagem_inicial}</p>
              <div className="hr" style={{ margin: "10px 0" }}></div>
              <div className="tag" style={{ marginBottom: 4 }}>Guardrails</div>
              <p className="muted" style={{ fontSize: 11.5, lineHeight: 1.45, margin: 0 }}>{a.guardrails}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel"><div className="panel-h"><h3>Base de conhecimento (RAG)</h3><button className="btn btn--lime btn--sm" onClick={() => toast.info("Upload + ingestão RAG no Plano 07.")}><Icon name="upload" size={13} /> Upload</button></div>
          <table className="tbl"><thead><tr>{["Documento", "Categoria", "Unidade", "Status", "Validade"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{rag.map((d) => <tr key={d.id}><td><div className="row gap8 center"><Icon name="doc" size={15} style={{ color: "var(--tx-mute)" }} /><span className="strong">{d.titulo}</span></div></td><td>{d.categoria}</td><td><span className="pill" style={{ fontSize: 10 }}>{d.unidade ? unidadeMeta(d.unidade).short : "—"}</span></td><td><Pill variant={d.status === "ativo" ? "ok" : undefined}>{d.status}</Pill></td><td className="mono">{d.validade ?? "—"}</td></tr>)}
            {rag.length === 0 && <tr><td colSpan={5} style={{ padding: 20, color: "var(--tx-mute)" }}>Nenhum documento na base. (Ingestão no Plano 07.)</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ---------------- CONFIGURAÇÕES ---------------- */
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
        ) : (
          <div><div className="tag" style={{ marginBottom: 14 }}>{sec}</div><p className="muted" style={{ fontSize: 13 }}>Seção de configuração de {sec.toLowerCase()} — edição completa entra no Plano 09 (hardening/LGPD). Os valores ficam em <span className="mono">tradek.settings</span>.</p></div>
        )}
      </div>
    </div>
  )
}
