import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import { SiteLayout } from "@/features/site/SiteLayout"
import { SiteHome, SiteSCF, SiteProc, SiteMotos, SiteSobre, SiteFAQ, SiteContato, SiteObrigado } from "@/features/site/pages"
import { AdminLayout } from "@/features/admin/AdminLayout"
import { AdminDashboard } from "@/features/admin/AdminDashboard"
import { AdminKanban } from "@/features/admin/AdminKanban"
import { AdminLista } from "@/features/admin/AdminLista"
import { AdminProdutos, AdminEmpresas, AdminClientes, AdminTarefas, AdminDocumentos, AdminRelatorios, AdminInteracoes, AdminNotificacoes, AdminAgentes, AdminConfig } from "@/features/admin/screens"
import { ClienteLayout } from "@/features/cliente/ClienteLayout"
import { LoginPage } from "@/features/auth/LoginPage"
import { FirstAccessPage } from "@/features/auth/FirstAccessPage"
import { RequireInternal, RequireClient } from "@/components/guards"

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
      { path: "interacoes", element: <AdminInteracoes /> },
      { path: "relatorios", element: <AdminRelatorios /> },
      { path: "empresas", element: <AdminEmpresas /> },
      { path: "clientes", element: <AdminClientes /> },
      { path: "documentos", element: <AdminDocumentos /> },
      { path: "produtos", element: <AdminProdutos /> },
      { path: "tarefas", element: <AdminTarefas /> },
      { path: "notificacoes", element: <AdminNotificacoes /> },
      { path: "agentes", element: <AdminAgentes /> },
      { path: "config", element: <AdminConfig /> },
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
