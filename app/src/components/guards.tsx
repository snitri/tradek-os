import { type ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth, isInternalRole } from "@/lib/auth"

function FullScreenLoading() {
  return (
    <div className="min-h-screen grid place-items-center text-muted-foreground text-sm">
      Carregando…
    </div>
  )
}

export function RequireInternal({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth()
  if (loading) return <FullScreenLoading />
  if (!user || !isInternalRole(role)) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
