import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Lang = "pt" | "en" | "es"

const STORAGE_KEY = "tradek_lang"
const LANGS: Lang[] = ["pt", "en", "es"]
const FLAG: Record<Lang, string> = { pt: "🇧🇷", en: "🇺🇸", es: "🇪🇸" }
const CODE: Record<Lang, string> = { pt: "PT", en: "EN", es: "ES" }
const HTML_LANG: Record<Lang, string> = { pt: "pt-BR", en: "en", es: "es" }

type LanguageCtx = { lang: Lang; setLang: (l: Lang) => void }

const Ctx = createContext<LanguageCtx | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === "en" || saved === "es" ? saved : "pt"
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = HTML_LANG[lang]
  }, [lang])

  const setLang = (l: Lang) => setLangState(l)

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>
}

export function useLanguage() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useLanguage deve ser usado dentro de LanguageProvider")
  return ctx
}

/** Escolhe o valor certo entre pt/en/es conforme o idioma atual. */
export function usePick<T>(pt: T, en: T, es: T): T {
  const { lang } = useLanguage()
  return lang === "en" ? en : lang === "es" ? es : pt
}

export function LanguageSwitch({ style }: { style?: React.CSSProperties }) {
  const { lang, setLang } = useLanguage()
  return (
    <div className="row gap2" style={{ display: "inline-flex", alignItems: "center", gap: 2, padding: 3, borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg-2)", ...style }}>
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          title={CODE[l]}
          aria-label={`Idioma: ${CODE[l]}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 7px",
            borderRadius: 6, border: "none", background: lang === l ? "rgba(255,255,255,.08)" : "transparent",
            cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: lang === l ? "var(--tx)" : "var(--tx-mute)",
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>{FLAG[l]}</span>
          <span>{CODE[l]}</span>
        </button>
      ))}
    </div>
  )
}
