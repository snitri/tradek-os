import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Lang = "pt" | "en"

const STORAGE_KEY = "tradek_lang"

type LanguageCtx = { lang: Lang; setLang: (l: Lang) => void; toggle: () => void }

const Ctx = createContext<LanguageCtx | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === "en" ? "en" : "pt"
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR"
  }, [lang])

  const setLang = (l: Lang) => setLangState(l)
  const toggle = () => setLangState((l) => (l === "pt" ? "en" : "pt"))

  return <Ctx.Provider value={{ lang, setLang, toggle }}>{children}</Ctx.Provider>
}

export function useLanguage() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useLanguage deve ser usado dentro de LanguageProvider")
  return ctx
}

/** Escolhe o valor certo entre pt/en conforme o idioma atual. */
export function usePick<T>(pt: T, en: T): T {
  const { lang } = useLanguage()
  return lang === "en" ? en : pt
}

export function LanguageSwitch({ style }: { style?: React.CSSProperties }) {
  const { lang, toggle } = useLanguage()
  return (
    <button
      onClick={toggle}
      title={lang === "pt" ? "Switch to English" : "Mudar para Português"}
      aria-label="Trocar idioma"
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px",
        borderRadius: 7, border: "1px solid var(--line)", background: "var(--bg-2)",
        cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--tx-dim)",
        ...style,
      }}
    >
      <span style={{ fontSize: 15, lineHeight: 1 }}>{lang === "pt" ? "🇺🇸" : "🇧🇷"}</span>
      <span>{lang === "pt" ? "EN" : "PT"}</span>
    </button>
  )
}
