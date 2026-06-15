import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth, isInternalRole } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginPage({ variant }: { variant: "admin" | "portal" }) {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const isAdmin = variant === "admin"

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const profile = await signIn(email, password)
      const internal = isInternalRole(profile?.role ?? null)
      navigate(internal ? "/admin" : "/portal", { replace: true })
    } catch {
      toast.error("E-mail ou senha inválidos.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-mono text-xs tracking-widest text-lime uppercase">TradeK OS</span>
          <h1 className="font-display text-2xl font-semibold mt-2">
            {isAdmin ? "Painel administrativo" : "Portal do cliente"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? "Acesso da equipe TradeK." : "Acompanhe sua solicitação com segurança."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 border border-border rounded-md p-6 bg-card">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Entrando…" : "Entrar"}
          </Button>
          {!isAdmin && (
            <p className="text-xs text-center text-muted-foreground">
              Primeiro acesso?{" "}
              <Link to="/portal/primeiro-acesso" className="text-lime hover:underline">
                Crie sua senha
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
