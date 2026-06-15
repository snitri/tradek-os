import { Outlet } from "react-router-dom"

export function SiteLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-8 py-4 font-display font-semibold">
        TradeK · Site
      </header>
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  )
}
