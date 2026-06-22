import { useState } from "react"
import { Link } from "react-router-dom"
import { Icon, Avatar, Score } from "@/components/tradek/ui"
import { useAdmin } from "./admin-context"
import { useLeads, usePipelineStatuses, unidadeMeta, companyName, leadValor, leadScoreCredito } from "./admin-data"

export function AdminLista() {
  const { openLead } = useAdmin()
  const { leads } = useLeads()
  const statuses = usePipelineStatuses()
  const [sel, setSel] = useState<string[]>([])
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const statusLabel = (k: string) => statuses.find((s) => s.key === k)
  const statusColor = (k: string) => statuses.find((s) => s.key === k)?.cor ?? "var(--tx-mute)"

  return (
    <div className="fade">
      <div className="row center gap10 wrap" style={{ marginBottom: 14 }}>
        {["Unidade", "Status", "Responsável", "Score mín.", "Origem", "Docs pendentes"].map((f) => <button key={f} className="btn btn--dark btn--sm"><Icon name="filter" size={12} />{f}</button>)}
        <div className="row gap8 mla">
          {sel.length > 0 && <span className="pill pill--lime">{sel.length} selecionados</span>}
          <button className="btn btn--dark btn--sm"><Icon name="download" size={13} /> Exportar</button>
          <Link to="/admin/crm" className="btn btn--dark btn--sm"><Icon name="kanban" size={13} /> Kanban</Link>
        </div>
      </div>

      <div className="panel scroll" style={{ overflow: "auto" }}>
        <table className="tbl">
          <thead><tr>
            <th style={{ width: 32 }}><input type="checkbox" style={{ accentColor: "var(--lime)" }} onChange={(e) => setSel(e.target.checked ? leads.map((l) => l.id) : [])} /></th>
            {["ID", "Empresa", "Contato", "Unidade", "Score", "Crédito", "Status", "Resp.", "Valor", "Origem"].map((h) => <th key={h}>{h}</th>)}
          </tr></thead>
          <tbody>{leads.map((l) => {
            const u = unidadeMeta(l.unidade)
            const credito = leadScoreCredito(l)
            return (
              <tr key={l.id} onClick={() => openLead(l.id)} style={{ cursor: "pointer" }}>
                <td onClick={(e) => { e.stopPropagation(); toggle(l.id) }}><input type="checkbox" checked={sel.includes(l.id)} readOnly style={{ accentColor: "var(--lime)" }} /></td>
                <td className="mono" style={{ color: "var(--tx-mute)" }}>{l.id.slice(0, 8)}</td>
                <td className="strong">{companyName(l)}</td>
                <td>{l.contacts?.nome ?? "—"}</td>
                <td><span className="pill" style={{ borderColor: u.color + "66", color: u.color, fontSize: 10 }}>{u.short}</span></td>
                <td><Score v={l.score_ia ?? 0} /></td>
                <td>
                  {credito.score ? (
                    <span className="row gap6 center" title={credito.faixa ?? ""}>
                      <span className="mono" style={{ fontSize: 12 }}>{credito.score}</span>
                      {credito.qtdProcessos > 0 && <span className="pill" style={{ fontSize: 9, borderColor: "#e5393966", color: "#e53939" }}>{credito.qtdProcessos} proc.</span>}
                    </span>
                  ) : <span className="faint" style={{ fontSize: 11 }}>—</span>}
                </td>
                <td><span className="row gap6 center"><span className="sdot" style={{ background: statusColor(l.status) }}></span>{statusLabel(l.status)?.label_admin ?? l.status}</span></td>
                <td>{l.responsavel?.nome ? <span className="row gap6 center"><Avatar name={l.responsavel.nome} size={20} />{l.responsavel.nome.split(" ")[0]}</span> : <span className="faint">—</span>}</td>
                <td className="mono">{leadValor(l)}{l.urgencia && <span className="tag" style={{ marginLeft: 6, color: l.urgencia === "alta" || l.urgencia === "critica" ? "var(--danger)" : "var(--tx-mute)" }}>{l.urgencia}</span>}</td>
                <td>{l.origem}</td>
              </tr>
            )
          })}
          {leads.length === 0 && <tr><td colSpan={11} style={{ padding: 24, color: "var(--tx-mute)", textAlign: "center" }}>Nenhum lead ainda. Crie um lead ou aguarde leads do site.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="row center" style={{ justifyContent: "space-between", marginTop: 12, fontSize: 12, color: "var(--tx-mute)" }}>
        <span>Mostrando {leads.length} oportunidades</span>
      </div>
    </div>
  )
}
