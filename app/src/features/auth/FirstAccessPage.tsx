import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { isInternalRole } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function FirstAccessPage({ variant }: { variant: "admin" | "cliente" }) {
  const navigate = useNavigate()
  const isAdmin = variant === "admin"
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [terms, setTerms] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // O link do convite/recuperação cria uma sessão temporária ao abrir a página.
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session))
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 8) return toast.error("A senha deve ter ao menos 8 caracteres.")
    if (password !== confirm) return toast.error("As senhas não coincidem.")
    if (!terms) return toast.error("Aceite os termos para continuar.")
    setBusy(true)
    try {
      const { data: updated, error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      const userId = updated.user?.id
      const { data: profile } = userId
        ? await supabase.from("profiles").select("role").eq("id", userId).maybeSingle()
        : { data: null }
      const internal = isInternalRole(profile?.role ?? null)
      await supabase.auth.signOut()
      toast.success("Senha criada com sucesso. Faça login para continuar.")
      navigate(internal ? "/admin/login" : "/cliente/login", { replace: true })
    } catch {
      toast.error("Não foi possível criar a senha. Abra novamente o link do convite.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-mono text-xs tracking-widest text-lime uppercase">TradeK OS</span>
          <h1 className="font-display text-2xl font-semibold mt-2">Primeiro acesso</h1>
          <p className="text-sm text-muted-foreground mt-1">{isAdmin ? "Crie sua senha para acessar o painel administrativo." : "Crie sua senha para acessar o portal."}</p>
        </div>

        {hasSession === false ? (
          <div className="border border-border rounded-md p-6 bg-card text-sm text-muted-foreground text-center">
            Link inválido ou expirado. Abra novamente o convite enviado por e-mail.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 border border-border rounded-md p-6 bg-card">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input id="password" type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input id="confirm" type="password" required value={confirm}
                onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5" />
              <span>Li e aceito os termos de uso e a política de privacidade.</span>
            </label>
            <Button type="submit" className="w-full" disabled={busy || hasSession === null}>
              {busy ? "Criando…" : "Criar senha e entrar"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
