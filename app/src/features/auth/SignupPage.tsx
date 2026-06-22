import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import { Logo, Icon } from "@/components/tradek/ui"

const UNIDADES = [
  { value: "supply_chain_finance", label: "Supply Chain Finance" },
  { value: "procurement", label: "Procurement" },
  { value: "produtos_motos", label: "Produtos da China (Motos)" },
  { value: "suporte_importacao", label: "Suporte à Importação" },
  { value: "outro", label: "Outro" },
]

export function SignupPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [razaoSocial, setRazaoSocial] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [unidade, setUnidade] = useState("outro")
  const [demanda, setDemanda] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [senha, setSenha] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)

  function validar() {
    if (!nome.trim()) return "Informe seu nome."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "E-mail inválido."
    if (telefone.replace(/\D/g, "").length < 10) return "Telefone inválido."
    if (!razaoSocial.trim()) return "Informe a razão social da empresa."
    if (cnpj.replace(/\D/g, "").length !== 14) return "CNPJ inválido. Informe os 14 dígitos."
    if (senha.length < 8) return "A senha deve ter ao menos 8 caracteres."
    if (senha !== confirm) return "As senhas não coincidem."
    return null
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const erro = validar()
    if (erro) return toast.error(erro)
    setBusy(true)
    try {
      const { data, error } = await supabase.functions.invoke("public-signup", {
        body: {
          nome, email, telefone, razao_social: razaoSocial, cnpj, unidade,
          servico_desejado: UNIDADES.find((u) => u.value === unidade)?.label ?? unidade,
          descricao_necessidade: demanda, observacoes, senha,
        },
      })
      if (error) throw error
      if (data?.error) { toast.error(data.error); return }
      if (data?.erro_usuario) toast.warning(data.erro_usuario)
      else toast.success(data?.empresa_existente ? "Cadastro vinculado à sua empresa com sucesso." : "Cadastro realizado com sucesso.")

      try {
        await signIn(email, senha)
        navigate("/cliente", { replace: true })
      } catch {
        navigate("/cliente/login", { replace: true })
      }
    } catch {
      toast.error("Não foi possível concluir o cadastro. Tente novamente.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <aside className="auth-brand">
        <div className="row gap16">
          <Link to="/"><Logo h={26} /></Link>
          <span className="tag">China → Brasil</span>
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 18 }}>Trade Operations</div>
          <h2 className="auth-headline">Crie sua conta e fale com a TradeK.</h2>
          <div className="auth-feats">
            <div className="auth-feat">
              <span className="ic"><Icon name="shield" size={16} /></span>
              <span><b>Análise de crédito automática</b><span>Consultamos seu CNPJ para agilizar a proposta.</span></span>
            </div>
            <div className="auth-feat">
              <span className="ic"><Icon name="chat" size={16} /></span>
              <span><b>Resposta rápida</b><span>Nossa equipe é notificada imediatamente após o cadastro.</span></span>
            </div>
          </div>
        </div>
        <span className="faint" style={{ fontSize: 12 }}>© 2026 TradeK · Hub de negócios China–Brasil</span>
      </aside>

      <main className="auth-form">
        <div className="auth-card fade">
          <div className="auth-mobile-logo"><Link to="/"><Logo h={24} /></Link></div>
          <div style={{ marginBottom: 24 }}>
            <Link to="/" className="auth-back"><Icon name="chevL" size={14} /> Voltar ao site</Link>
          </div>

          <div className="eyebrow" style={{ marginBottom: 14 }}>Portal do cliente</div>
          <h1 className="disp" style={{ fontSize: 26, fontWeight: 600, margin: "0 0 6px", letterSpacing: "-.01em" }}>Crie sua conta</h1>
          <p className="muted" style={{ fontSize: 13.5, margin: "0 0 26px" }}>Preencha seus dados — se já existir uma conversa em andamento com a TradeK para o seu CNPJ, vinculamos automaticamente.</p>

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label htmlFor="nome">Nome completo</label>
              <input id="nome" className="input" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
            </div>
            <div className="row gap12">
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="email">E-mail</label>
                <input id="email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="telefone">WhatsApp / Telefone</label>
                <input id="telefone" className="input" required value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" />
              </div>
            </div>
            <div className="row gap12">
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="razao">Razão social</label>
                <input id="razao" className="input" required value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder="Empresa Ltda" />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="cnpj">CNPJ</label>
                <input id="cnpj" className="input" required value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="unidade">Serviço desejado</label>
              <select id="unidade" className="input" value={unidade} onChange={(e) => setUnidade(e.target.value)}>
                {UNIDADES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="demanda">Descrição da necessidade</label>
              <textarea id="demanda" className="input" rows={3} value={demanda} onChange={(e) => setDemanda(e.target.value)} placeholder="Conte rapidamente o que você precisa" />
            </div>
            <div className="field">
              <label htmlFor="obs">Observações adicionais (opcional)</label>
              <textarea id="obs" className="input" rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
            </div>
            <div className="row gap12">
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="senha">Senha</label>
                <input id="senha" className="input" type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 8 caracteres" />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="confirm">Confirmar senha</label>
                <input id="confirm" className="input" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="btn btn--lime btn--block" style={{ padding: "12px 16px", fontSize: 14, marginTop: 4 }} disabled={busy}>
              {busy ? "Enviando…" : <>Criar conta <Icon name="arrowR" size={15} /></>}
            </button>
          </form>

          <div className="auth-divider">ou</div>
          <p className="faint" style={{ fontSize: 13, textAlign: "center", margin: 0 }}>
            Já tem conta? <Link to="/cliente/login" className="lime" style={{ fontWeight: 600 }}>Entrar</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
