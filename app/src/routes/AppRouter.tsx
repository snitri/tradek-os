import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Launcher } from "@/features/Launcher"
import { SiteLayout } from "@/features/site/SiteLayout"
import { AdminLayout } from "@/features/admin/AdminLayout"
import { PortalLayout } from "@/features/portal/PortalLayout"
import { LoginPage } from "@/features/auth/LoginPage"
import { FirstAccessPage } from "@/features/auth/FirstAccessPage"
import { RequireInternal, RequireClient } from "@/components/guards"

const router = createBrowserRouter([
  { path: "/", element: <Launcher /> },

  // auth (públicas)
  { path: "/admin/login", element: <LoginPage variant="admin" /> },
  { path: "/portal/login", element: <LoginPage variant="portal" /> },
  { path: "/portal/primeiro-acesso", element: <FirstAccessPage /> },

  // site público
  {
    path: "/site",
    element: <SiteLayout />,
    children: [{ index: true, element: <div className="font-display text-2xl">Site público — em construção</div> }],
  },

  // admin (interno)
  {
    path: "/admin",
    element: (
      <RequireInternal>
        <AdminLayout />
      </RequireInternal>
    ),
    children: [{ index: true, element: <div className="font-display text-2xl">Admin — em construção</div> }],
  },

  // portal (cliente)
  {
    path: "/portal",
    element: (
      <RequireClient>
        <PortalLayout />
      </RequireClient>
    ),
    children: [{ index: true, element: <div className="font-display text-2xl">Portal — em construção</div> }],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
