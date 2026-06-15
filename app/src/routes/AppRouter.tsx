import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import { SiteLayout } from "@/features/site/SiteLayout"
import { SiteHome, SiteSCF, SiteProc, SiteMotos, SiteSobre, SiteFAQ, SiteContato, SiteObrigado } from "@/features/site/pages"
import { AdminLayout } from "@/features/admin/AdminLayout"
import { AdminDashboard } from "@/features/admin/AdminDashboard"
import { AdminKanban } from "@/features/admin/AdminKanban"
import { AdminLista } from "@/features/admin/AdminLista"
import { ClienteLayout } from "@/features/cliente/ClienteLayout"
import { LoginPage } from "@/features/auth/LoginPage"
import { FirstAccessPage } from "@/features/auth/FirstAccessPage"
import { RequireInternal, RequireClient } from "@/components/guards"

function Placeholder({ title }: { title: string }) {
  return (
    <div className="fade" style={{ display: "grid", placeItems: "center", height: "60vh", textAlign: "center" }}>
      <div>
        <div className="disp" style={{ fontSize: 22, fontWeight: 600 }}>{title}</div>
        <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>Tela em construção — será portada do protótipo nos próximos passos.</p>
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/site" replace /> },

  // site público
  {
    path: "/site",
    element: <SiteLayout />,
    children: [
      { index: true, element: <SiteHome /> },
      { path: "scf", element: <SiteSCF /> },
      { path: "proc", element: <SiteProc /> },
      { path: "motos", element: <SiteMotos /> },
      { path: "sobre", element: <SiteSobre /> },
      { path: "faq", element: <SiteFAQ /> },
      { path: "contato", element: <SiteContato /> },
      { path: "obrigado", element: <SiteObrigado /> },
    ],
  },

  // auth (públicas)
  { path: "/admin/login", element: <LoginPage variant="admin" /> },
  { path: "/cliente/login", element: <LoginPage variant="cliente" /> },
  { path: "/cliente/primeiro-acesso", element: <FirstAccessPage /> },

  // admin (interno)
  {
    path: "/admin",
    element: (
      <RequireInternal>
        <AdminLayout />
      </RequireInternal>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "crm", element: <AdminKanban /> },
      { path: "lista", element: <AdminLista /> },
      { path: "interacoes", element: <Placeholder title="Central de Interações" /> },
      { path: "relatorios", element: <Placeholder title="Relatórios IA" /> },
      { path: "empresas", element: <Placeholder title="Empresas & Contatos" /> },
      { path: "clientes", element: <Placeholder title="Clientes / Acessos" /> },
      { path: "documentos", element: <Placeholder title="Documentos & Checklists" /> },
      { path: "produtos", element: <Placeholder title="Produtos & Serviços" /> },
      { path: "tarefas", element: <Placeholder title="Tarefas / SLA" /> },
      { path: "notificacoes", element: <Placeholder title="Notificações" /> },
      { path: "agentes", element: <Placeholder title="Agentes IA" /> },
      { path: "config", element: <Placeholder title="Configurações" /> },
    ],
  },

  // cliente (portal)
  {
    path: "/cliente",
    element: (
      <RequireClient>
        <ClienteLayout />
      </RequireClient>
    ),
    children: [{ index: true, element: <div className="font-display text-2xl">Portal do cliente — em construção</div> }],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
