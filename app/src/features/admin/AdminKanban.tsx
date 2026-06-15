import { useState } from "react"
import { Link } from "react-router-dom"
import { Icon, Avatar, Score } from "@/components/tradek/ui"
import { useAdmin } from "./admin-context"
import { useLeads, usePipelineStatuses, unidadeMeta, companyName, leadValor, updateLeadStatus } from "./admin-data"

export function AdminKanban() {
  const { openLead } = useAdmin()
  const { leads, setLeads } = useLeads()
  const statuses = usePipelineStatuses()
  const [drag, setDrag] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)

  const cols = statuses.filter((s) => s.visivel_kanban)

  async function onDrop(col: string) {
    if (drag) {
      const lead = leads.find((l) => l.id === drag)
      setLeads((ls) => ls.map((l) => (l.id === drag ? { ...l, status: col as typeof l.status } : l)))
      await updateLeadStatus(drag, col as never, lead?.status)
    }
    setDrag(null); setOver(null)
  }

  return (
    <div className="fade" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="row center gap10 wrap" style={{ marginBottom: 14 }}>
        <div className="row gap8 center" style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 6, padding: "6px 10px" }}><Icon name="search" size={14} style={{ color: "var(--tx-mute)" }} /><input placeholder="Buscar empresa…" style={{ background: "none", border: "none", outline: "none", color: "var(--tx)", fontSize: 12.5, width: 140 }} /></div>
        {["Unidade", "Status", "Responsável", "Score", "Origem"].map((f) => <button key={f} className="btn btn--dark btn--sm"><Icon name="filter" size={12} />{f}<Icon name="chevD" size={12} /></button>)}
        <div className="row gap8 mla">
          <Link to="/admin/lista" className="btn btn--dark btn--sm"><Icon name="list" size={13} /> Lista</Link>
        </div>
      </div>

      <div className="scroll" style={{ flex: 1, display: "flex", gap: 12, paddingBottom: 8 }}>
        {cols.map((col) => {
          const items = leads.filter((l) => l.status === col.key)
          return (
            <div key={col.key} onDragOver={(e) => { e.preventDefault(); setOver(col.key) }} onDrop={() => onDrop(col.key)}
              style={{ width: 268, flexShrink: 0, display: "flex", flexDirection: "column", background: over === col.key ? "rgba(195,249,41,.04)" : "transparent", borderRadius: 8, transition: ".12s" }}>
              <div className="row center gap8" style={{ padding: "8px 10px", marginBottom: 8 }}>
                <span className="sdot" style={{ background: col.cor ?? "var(--tx-mute)" }}></span>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{col.label_admin}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--tx-mute)", background: "var(--bg-2)", borderRadius: 99, padding: "1px 7px", marginLeft: "auto" }}>{items.length}</span>
              </div>
              <div className="scroll col gap8" style={{ flex: 1, padding: "0 2px" }}>
                {items.map((l) => {
                  const u = unidadeMeta(l.unidade)
                  return (
                    <div key={l.id} draggable onDragStart={() => setDrag(l.id)} onDragEnd={() => { setDrag(null); setOver(null) }} onClick={() => openLead(l.id)}
                      className="panel" style={{ padding: 12, cursor: "grab", opacity: drag === l.id ? 0.4 : 1, transition: ".12s", background: "var(--bg-2)" }}>
                      <div className="row center" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                        <span className="pill" style={{ borderColor: u.color, color: u.color, fontSize: 10, padding: "2px 7px" }}><Icon name={u.icon} size={10} />{u.short}</span>
                        <Score v={l.score_ia ?? 0} />
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.25 }}>{companyName(l)}</div>
                      <div className="tag" style={{ marginTop: 3 }}>{l.contacts?.nome ?? "—"}</div>
                      <div className="hr" style={{ margin: "10px 0" }}></div>
                      <div className="row center" style={{ justifyContent: "space-between" }}>
                        <span className="mono" style={{ fontSize: 11.5, color: leadValor(l) === "—" ? "var(--tx-faint)" : "var(--tx-dim)" }}>{leadValor(l)}</span>
                        {l.urgencia && <span className="tag" style={{ color: l.urgencia === "alta" || l.urgencia === "critica" ? "var(--danger)" : "var(--tx-mute)" }}>{l.urgencia}</span>}
                      </div>
                      <div className="row center gap6" style={{ marginTop: 10 }}>
                        {l.responsavel?.nome ? <span className="row gap6 center" style={{ fontSize: 11, color: "var(--tx-dim)" }}><Avatar name={l.responsavel.nome} size={18} />{l.responsavel.nome.split(" ")[0]}</span> : <span className="pill pill--warn" style={{ fontSize: 10 }}>Sem resp.</span>}
                      </div>
                    </div>
                  )
                })}
                {items.length === 0 && <div style={{ border: "1px dashed var(--line)", borderRadius: 8, padding: "20px 0", textAlign: "center", fontSize: 11.5, color: "var(--tx-faint)" }}>Solte aqui</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
