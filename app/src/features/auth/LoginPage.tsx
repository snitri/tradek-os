import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth, isInternalRole } from "@/lib/auth"
import { Logo, Icon } from "@/components/tradek/ui"

type Feat = { icon: string; title: string; desc: string }

const BRAND: Record<"admin" | "cliente", { eyebrow: string; title: string; subtitle: string; headline: string; feats: Feat[] }> = {
  cliente: {
    eyebrow: "Portal do cliente",
    title: "Acesse seu portal",
    subtitle: "Acompanhe sua solicitação com segurança.",
    headline: "Sua importação, sob controle.",
    feats: [
      { icon: "shield", title: "Ambiente seguro", desc: "Seus dados protegidos e em conformidade com a LGPD." },
      { icon: "file", title: "Documentos centralizados", desc: "Envie e acompanhe o checklist da sua operação." },
      { icon: "chat", title: "Fale com a equipe", desc: "Mensagens diretas com seu gestor TradeK." },
    ],
  },
  admin: {
    eyebrow: "Painel administrativo",
    title: "Acesso da equipe",
    subtitle: "Entre com suas credenciais TradeK.",
    headline: "Centro de operações TradeK.",
    feats: [
      { icon: "kanban", title: "CRM completo", desc: "Pipeline, leads e tarefas num só lugar." },
      { icon: "chart", title: "Relatórios com IA", desc: "Análises geradas pelo agente Claude." },
      { icon: "users", title: "Gestão de clientes", desc: "Empresas, contatos e documentos." },
    ],
  },
}

export function LoginPage({ variant }: { variant: "admin" | "cliente" }) {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const isAdmin = variant === "admin"
  const b = BRAND[variant]

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const profile = await signIn(email, password)
      const internal = isInternalRole(profile?.role ?? null)
      navigate(internal ? "/admin" : "/cliente", { replace: true })
    } catch {
      toast.error("E-mail ou senha inválidos.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      {/* painel de marca */}
      <aside className="auth-brand">
        <div className="row gap16">
          <Link to="/"><Logo h={26} /></Link>
          <span className="tag">{isAdmin ? "Interno" : "China → Brasil"}</span>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 18 }}>Trade Operations</div>
          <h2 className="auth-headline">{b.headline}</h2>
          <div className="auth-feats">
            {b.feats.map((f) => (
              <div key={f.title} className="auth-feat">
                <span className="ic"><Icon name={f.icon} size={16} /></span>
                <span><b>{f.title}</b><span>{f.desc}</span></span>
              </div>
            ))}
          </div>
        </div>

        <span className="faint" style={{ fontSize: 12 }}>© 2026 TradeK · Hub de negócios China–Brasil</span>
      </aside>

      {/* painel do formulário */}
      <main className="auth-form">
        <div className="auth-card fade">
          <div className="auth-mobile-logo"><Link to="/"><Logo h={24} /></Link></div>

          <div style={{ marginBottom: 24 }}>
            <Link to="/" className="auth-back"><Icon name="chevL" size={14} /> Voltar ao site</Link>
          </div>

          <div className="eyebrow" style={{ marginBottom: 14 }}>{b.eyebrow}</div>
          <h1 className="disp" style={{ fontSize: 26, fontWeight: 600, margin: "0 0 6px", letterSpacing: "-.01em" }}>{b.title}</h1>
          <p className="muted" style={{ fontSize: 13.5, margin: "0 0 26px" }}>{b.subtitle}</p>

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <div className="auth-input-wrap">
                <span className="ic"><Icon name="mail" size={15} /></span>
                <input
                  id="email" className="input" type="email" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Senha</label>
              <div className="auth-input-wrap">
                <span className="ic"><Icon name="lock" size={15} /></span>
                <input
                  id="password" className="input" type="password" autoComplete="current-password" required
                  value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" className="btn btn--lime btn--block" style={{ padding: "12px 16px", fontSize: 14, marginTop: 4 }} disabled={busy}>
              {busy ? "Entrando…" : <>Entrar <Icon name="arrowR" size={15} /></>}
            </button>
          </form>

          {!isAdmin && (
            <>
              <div className="auth-divider">ou</div>
              <p className="faint" style={{ fontSize: 13, textAlign: "center", margin: 0 }}>
                Recebeu um convite?{" "}
                <Link to="/cliente/primeiro-acesso" className="lime" style={{ fontWeight: 600 }}>Crie sua senha</Link>
              </p>
              <p className="faint" style={{ fontSize: 13, textAlign: "center", margin: "8px 0 0" }}>
                Ainda não tem conta?{" "}
                <Link to="/cliente/cadastro" className="lime" style={{ fontWeight: 600 }}>Cadastre-se</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
