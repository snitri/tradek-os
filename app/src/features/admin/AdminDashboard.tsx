import { Link } from "react-router-dom"
import { Icon, Avatar, Score } from "@/components/tradek/ui"
import { useAdmin } from "./admin-context"
import { useLeads, usePipelineStatuses, unidadeMeta, companyName, origemLabel } from "./admin-data"

const QUALIFIED = ["qualificado", "doc_solicitados", "doc_recebidos", "em_analise", "aprovado_proposta", "proposta_enviada", "negociacao", "ganho"]

export function AdminDashboard() {
  const { openLead } = useAdmin()
  const { leads } = useLeads()
  const statuses = usePipelineStatuses()

  const hoje = new Date().toISOString().slice(0, 10)
  const novosHoje = leads.filter((l) => l.created_at?.slice(0, 10) === hoje).length
  const qualificados = leads.filter((l) => QUALIFIED.includes(l.status)).length
  const semResp = leads.filter((l) => !l.responsavel_id).length
  const pipeline = leads.reduce((s, l) => s + (Number(l.valor_estimado) || 0), 0)
  const taxa = leads.length ? Math.round((qualificados / leads.length) * 100) : 0

  const kpis = [
    { label: "Leads (total)", val: String(leads.length), hot: false },
    { label: "Novos hoje", val: String(novosHoje), hot: true },
    { label: "Qualificados", val: String(qualificados), hot: false },
    { label: "Taxa qualificação", val: taxa + "%", hot: false },
    { label: "Pipeline (USD)", val: pipeline ? "$" + pipeline.toLocaleString("pt-BR") : "$0", hot: false },
  ]

  const funnel = statuses.map((s) => ({ label: s.label_admin, v: leads.filter((l) => l.status === s.key).length }))
  const maxF = Math.max(1, ...funnel.map((f) => f.v))

  const byUnit = ["supply_chain_finance", "procurement", "produtos_motos", "suporte_importacao"].map((u) => ({ meta: unidadeMeta(u), v: leads.filter((l) => l.unidade === u).length }))
  const maxU = Math.max(1, ...byUnit.map((b) => b.v))

  const origens = Array.from(new Set(leads.map((l) => l.origem)))
  const byOrigin = origens.map((o) => ({ label: origemLabel(o), v: leads.filter((l) => l.origem === o).length })).sort((a, b) => b.v - a.v).slice(0, 5)

  return (
    <div className="fade" style={{ maxWidth: 1320 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
        {kpis.map((k) => <div key={k.label} className="panel" style={{ padding: "16px 18px", position: "relative", overflow: "hidden" }}>
          {k.hot && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--lime)" }}></div>}
          <div className="row center" style={{ justifyContent: "space-between" }}><span className="tag">{k.label}</span></div>
          <div className="disp" style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-.02em", marginTop: 8, color: k.hot ? "var(--lime)" : "var(--tx)" }}>{k.val}</div>
        </div>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12, marginTop: 12 }}>
        <div className="panel">
          <div className="panel-h"><h3>Funil de oportunidades</h3><Link to="/admin/crm" className="row gap6 center lime" style={{ fontSize: 11.5, fontWeight: 700 }}>Abrir CRM <Icon name="arrowR" size={12} /></Link></div>
          <div className="panel-b col gap10">
            {funnel.map((f) => <div key={f.label} className="row center gap12" style={{ fontSize: 12.5 }}>
              <span className="muted" style={{ width: 150, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.label}</span>
              <div style={{ flex: 1, height: 18, background: "var(--bg)", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: (f.v / maxF) * 100 + "%", background: "var(--lime)", borderRadius: 3, opacity: 0.4 + (f.v / maxF) * 0.5 }}></div></div>
              <span className="mono" style={{ width: 28, textAlign: "right", fontWeight: 700 }}>{f.v}</span>
            </div>)}
          </div>
        </div>
        <div className="panel">
          <div className="panel-h"><h3>Leads por unidade</h3></div>
          <div className="panel-b col gap16">
            {byUnit.map((b) => <div key={b.meta.label}><div className="row center" style={{ justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}><span className="muted">{b.meta.label}</span><span className="mono" style={{ fontWeight: 700 }}>{b.v}</span></div><div style={{ height: 8, background: "var(--bg)", borderRadius: 99 }}><div style={{ height: "100%", width: (b.v / maxU * 100) + "%", background: b.meta.color, borderRadius: 99 }}></div></div></div>)}
            <div className="hr"></div>
            <div className="tag">Por origem</div>
            {byOrigin.map((o) => <div key={o.label} className="row center" style={{ justifyContent: "space-between", fontSize: 12.5 }}><span className="muted">{o.label}</span><span className="mono">{o.v}</span></div>)}
            {byOrigin.length === 0 && <span className="muted" style={{ fontSize: 12.5 }}>Sem leads ainda.</span>}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <div className="panel">
          <div className="panel-h"><h3>Pendências</h3>{semResp > 0 && <span className="pill pill--warn">{semResp} sem responsável</span>}</div>
          <div className="panel-b col gap2" style={{ padding: "6px 8px" }}>
            <Link to="/admin/lista" className="row center gap10" style={{ padding: "11px 10px", borderRadius: 6, fontSize: 13 }}>
              <span style={{ width: 30, height: 30, borderRadius: 7, background: "var(--bg)", display: "grid", placeItems: "center", color: "var(--warn)" }}><Icon name="users" size={15} /></span>
              <span style={{ fontWeight: 600 }}>{semResp} leads sem responsável</span><Icon name="chevR" size={14} style={{ marginLeft: "auto", color: "var(--tx-faint)" }} />
            </Link>
            <Link to="/admin/documentos" className="row center gap10" style={{ padding: "11px 10px", borderRadius: 6, fontSize: 13 }}>
              <span style={{ width: 30, height: 30, borderRadius: 7, background: "var(--bg)", display: "grid", placeItems: "center", color: "var(--info)" }}><Icon name="file" size={15} /></span>
              <span style={{ fontWeight: 600 }}>Documentos a revisar</span><Icon name="chevR" size={14} style={{ marginLeft: "auto", color: "var(--tx-faint)" }} />
            </Link>
          </div>
        </div>
        <div className="panel">
          <div className="panel-h"><h3>Últimos leads</h3><span className="tag">tempo real</span></div>
          <div className="panel-b col" style={{ padding: "4px 8px" }}>
            {leads.slice(0, 6).map((l) => <button key={l.id} onClick={() => openLead(l.id)} className="row center gap10" style={{ padding: "10px", borderRadius: 6, textAlign: "left", width: "100%" }}>
              <Avatar name={companyName(l)} size={28} />
              <div className="col" style={{ lineHeight: 1.3, flex: 1, minWidth: 0 }}><span style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{companyName(l)}</span><span className="tag">{unidadeMeta(l.unidade).short} · {origemLabel(l.origem)}</span></div>
              <Score v={l.score_ia ?? 0} />
            </button>)}
            {leads.length === 0 && <span className="muted" style={{ fontSize: 13, padding: 10 }}>Nenhum lead ainda. Os leads do site aparecem aqui.</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
