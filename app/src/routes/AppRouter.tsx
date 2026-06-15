import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Launcher } from "@/features/Launcher"
import { SiteLayout } from "@/features/site/SiteLayout"
import { AdminLayout } from "@/features/admin/AdminLayout"
import { PortalLayout } from "@/features/portal/PortalLayout"

const router = createBrowserRouter([
  { path: "/", element: <Launcher /> },
  {
    path: "/site",
    element: <SiteLayout />,
    children: [{ index: true, element: <div className="font-display text-2xl">Site público — em construção</div> }],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [{ index: true, element: <div className="font-display text-2xl">Admin — em construção</div> }],
  },
  {
    path: "/portal",
    element: <PortalLayout />,
    children: [{ index: true, element: <div className="font-display text-2xl">Portal — em construção</div> }],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
