import { useState } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Icon, Btn } from "@/components/tradek/ui"
import type { LeadRow } from "./admin-data"

export function NewLeadModal({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  const [f, setF] = useState({
    nome: "", empresa: "", cnpj: "", email: "", whatsapp: "",
    origem: "cadastro_manual", unidade: "supply_chain_finance", valor: "", status: "novo", atribuirMim: true,
  })
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: string | boolean) => setF((s) => ({ ...s, [k]: v }))

  async function save() {
    if (!f.nome && !f.empresa) return toast.error("Informe ao menos o nome ou a empresa.")
    setBusy(true)
    try {
      let companyId: string | null = null
      if (f.empresa || f.cnpj) {
        const { data } = await supabase.from("companies").insert({ razao_social: f.empresa || null, cnpj: f.cnpj || null }).select("id").single()
        companyId = data?.id ?? null
      }
      let contactId: string | null = null
      if (f.nome) {
        const { data } = await supabase.from("contacts").insert({ company_id: companyId, nome: f.nome, email: f.email || null, whatsapp: f.whatsapp || null, principal: true }).select("id").single()
        contactId = data?.id ?? null
      }
      const uid = f.atribuirMim ? (await supabase.auth.getUser()).data.user?.id ?? null : null
      const { error } = await supabase.from("leads").insert({
        origem: f.origem as LeadRow["origem"], unidade: f.unidade as LeadRow["unidade"], status: f.status as LeadRow["status"],
        company_id: companyId, contact_id: contactId, responsavel_id: uid, volume_estimado: f.valor || null,
      })
      if (error) throw error
      toast.success("Lead criado.")
      onChanged()
      onClose()
    } catch (e) {
      toast.error("Erro ao criar lead: " + String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(5,6,5,.72)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="fade panel" style={{ width: "min(640px,96vw)", maxHeight: "90vh", overflow: "auto", background: "var(--bg-1)" }}>
        <div className="panel-h"><div className="row gap8 center"><Icon name="plus" size={16} style={{ color: "var(--lime)" }} /><h3 style={{ textTransform: "none", letterSpacing: 0, fontSize: 15, color: "var(--tx)" }}>Novo lead manual</h3></div><button className="btn btn--icon" onClick={onClose}><Icon name="x" size={16} /></button></div>
        <div className="panel-b">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="field"><label>Nome</label><input className="input" placeholder="Contato" value={f.nome} onChange={(e) => set("nome", e.target.value)} /></div>
            <div className="field"><label>Empresa</label><input className="input" placeholder="Empresa" value={f.empresa} onChange={(e) => set("empresa", e.target.value)} /></div>
            <div className="field"><label>CNPJ</label><input className="input" placeholder="00.000.000/0000-00" value={f.cnpj} onChange={(e) => set("cnpj", e.target.value)} /></div>
            <div className="field"><label>E-mail</label><input className="input" placeholder="email@empresa.com" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div className="field"><label>WhatsApp</label><input className="input" placeholder="+55 ..." value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
            <div className="field"><label>Origem</label><select className="select" value={f.origem} onChange={(e) => set("origem", e.target.value)}><option value="cadastro_manual">Cadastro manual</option><option value="whatsapp">WhatsApp</option><option value="indicacao">Indicação</option><option value="evento">Evento</option><option value="email">E-mail</option></select></div>
            <div className="field"><label>Unidade</label><select className="select" value={f.unidade} onChange={(e) => set("unidade", e.target.value)}><option value="supply_chain_finance">Supply Chain Finance</option><option value="procurement">Procurement</option><option value="produtos_motos">Produtos da China</option><option value="suporte_importacao">Suporte / Importação</option></select></div>
            <div className="field"><label>Valor / volume</label><input className="input" placeholder="US$ ..." value={f.valor} onChange={(e) => set("valor", e.target.value)} /></div>
            <div className="field"><label>Status inicial</label><select className="select" value={f.status} onChange={(e) => set("status", e.target.value)}><option value="novo">Novo Lead</option><option value="qualificado">Qualificado</option></select></div>
          </div>
          <label className="row gap8 center" style={{ marginTop: 14, fontSize: 12.5, color: "var(--tx-dim)" }}><input type="checkbox" checked={f.atribuirMim} onChange={(e) => set("atribuirMim", e.target.checked)} style={{ accentColor: "var(--lime)" }} /> Atribuir a mim como responsável</label>
          <div className="row gap8" style={{ marginTop: 16, justifyContent: "flex-end" }}><button className="btn btn--ghost" onClick={onClose}>Cancelar</button><Btn variant="lime" icon="check" disabled={busy} onClick={save}>{busy ? "Salvando…" : "Salvar lead"}</Btn></div>
        </div>
      </div>
    </div>
  )
}
