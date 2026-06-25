import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import "@/styles/tradek.css"
import App from "./App.tsx"
import { AuthProvider } from "@/lib/auth"
import { LanguageProvider } from "@/lib/i18n"
import { Toaster } from "@/components/ui/sonner"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <App />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
)
