import { Outlet } from "react-router-dom"

export function AdminLayout() {
  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="border-r border-border p-4 font-display font-semibold">
        TradeK · Admin
      </aside>
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  )
}
