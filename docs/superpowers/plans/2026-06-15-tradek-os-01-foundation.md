# TradeK OS — Plano 01: Fundação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold um app Vite + TS + React + shadcn/ui + Tailwind com o tema TradeK (dark + lime), cliente Supabase configurado e shells de rota para as 3 superfícies (`/`, `/admin`, `/portal`), buildando e bootando.

**Architecture:** App único em `app/`, Tailwind v4 via `@tailwindcss/vite`, shadcn/ui com alias `@/`, tokens de design portados do `tradek.css`. react-router-dom com layouts por superfície. Cliente Supabase em `app/src/lib/supabase.ts` lendo env. O protótipo `.jsx` da raiz é preservado como referência.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS v4, shadcn/ui, react-router-dom, @supabase/supabase-js.

**Pré-requisitos confirmados:** Node v25, npm 11, Supabase CLI linkado (`ewgxnsedlhlsregvyjsn`). URL: `https://ewgxnsedlhlsregvyjsn.supabase.co`. Publishable key: `sb_publishable_G_1R_ClxozK7QiI-g1B18A_wArJXvEh`.

---

### Task 1: Versionamento e baseline

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Inicializar git na raiz do projeto**

Run: `git init && git config user.name "TradeK Dev" && git config user.email "dev@tradek.local"`
Expected: `Initialized empty Git repository`

- [ ] **Step 2: Criar `.gitignore`**

```gitignore
# deps & build
node_modules/
app/node_modules/
app/dist/
app/.vite/

# env & secrets
.env
.env.local
app/.env
app/.env.local
.env*.local

# supabase
supabase/.temp/
supabase/.branches/

# os/editor
.DS_Store
*.log
```

- [ ] **Step 3: Commit do baseline (protótipo + specs preservados)**

```bash
git add -A
git commit -m "chore: baseline — prototype, specs and supabase link"
```

Expected: commit criado listando os `.jsx`, `uploads/`, `docs/` etc.

---

### Task 2: Scaffold do app Vite + React + TS

**Files:**
- Create: `app/` (gerado pelo Vite)
- Modify: `app/package.json`

- [ ] **Step 1: Gerar o projeto Vite**

Run: `npm create vite@latest app -- --template react-ts`
Expected: `Scaffolding project in .../app...` e `Done.`

- [ ] **Step 2: Instalar dependências base**

Run: `cd app && npm install`
Expected: `added N packages` sem erros.

- [ ] **Step 3: Verificar build limpo do template**

Run: `cd app && npm run build`
Expected: `vite build` conclui, gera `app/dist/`.

- [ ] **Step 4: Commit**

```bash
git add app
git commit -m "feat: scaffold vite react-ts app"
```

---

### Task 3: Tailwind v4 + alias `@/`

**Files:**
- Modify: `app/vite.config.ts`
- Modify: `app/tsconfig.json`, `app/tsconfig.app.json`
- Create: `app/src/index.css` (substitui conteúdo)

- [ ] **Step 1: Instalar Tailwind v4 e plugin Vite + tipos node**

Run: `cd app && npm install tailwindcss @tailwindcss/vite && npm install -D @types/node`
Expected: pacotes adicionados.

- [ ] **Step 2: Configurar `app/vite.config.ts` com Tailwind e alias**

```ts
import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
})
```

- [ ] **Step 3: Adicionar paths ao `app/tsconfig.json`**

Adicione (merge) no objeto raiz:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

E em `app/tsconfig.app.json`, dentro de `compilerOptions`, adicione as mesmas `baseUrl` e `paths`.

- [ ] **Step 4: Substituir `app/src/index.css` por entrada Tailwind mínima**

```css
@import "tailwindcss";
```

- [ ] **Step 5: Verificar build**

Run: `cd app && npm run build`
Expected: build OK (Tailwind processado).

- [ ] **Step 6: Commit**

```bash
git add app
git commit -m "feat: tailwind v4 + @ alias"
```

---

### Task 4: shadcn/ui

**Files:**
- Create: `app/components.json`, `app/src/lib/utils.ts`, `app/src/components/ui/*`

- [ ] **Step 1: Inicializar shadcn (modo não interativo, base color neutral)**

Run: `cd app && npx shadcn@latest init -d`
Expected: cria `components.json`, `src/lib/utils.ts`, ajusta `index.css` com camadas de tema. (Se perguntar, base color = Neutral.)

- [ ] **Step 2: Adicionar componentes base usados em todo o app**

Run: `cd app && npx shadcn@latest add button card input label badge dialog dropdown-menu table tabs sonner select textarea`
Expected: componentes criados em `src/components/ui/`.

- [ ] **Step 3: Verificar build**

Run: `cd app && npm run build`
Expected: build OK.

- [ ] **Step 4: Commit**

```bash
git add app
git commit -m "feat: shadcn/ui init + base components"
```

---

### Task 5: Tema TradeK (dark + lime)

**Files:**
- Modify: `app/src/index.css`

- [ ] **Step 1: Definir tokens TradeK e mapear semânticos shadcn**

Substitua o conteúdo de `app/src/index.css` por (mantém `@import "tailwindcss"` e adiciona o tema; o app abre sempre em dark):

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

/* valores dark-first (paleta TradeK) */
:root {
  --background: #0A0B0A;
  --foreground: #E8ECE4;
  --card: #0C0E0C;
  --card-foreground: #E8ECE4;
  --popover: #0C0E0C;
  --popover-foreground: #E8ECE4;
  --primary: #C3F929;
  --primary-foreground: #0A0B0A;
  --secondary: #12150F;
  --secondary-foreground: #E8ECE4;
  --muted: #12150F;
  --muted-foreground: #9AA295;
  --accent: #171B14;
  --accent-foreground: #E8ECE4;
  --destructive: #FF6B57;
  --destructive-foreground: #0A0B0A;
  --border: rgba(255,255,255,.09);
  --input: rgba(255,255,255,.09);
  --ring: #C3F929;
  --radius: 0.25rem;
  /* extras de marca */
  --lime: #C3F929;
  --lime-deep: #A9E80E;
  --ok: #7FE05B;
  --warn: #F5B544;
  --danger: #FF6B57;
  --info: #5BC8FF;
}

/* expõe as vars como cores/raios de tema → habilita bg-*, text-*, border-* */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-lime: var(--lime);
  --color-lime-deep: var(--lime-deep);
  --color-ok: var(--ok);
  --color-warn: var(--warn);
  --color-danger: var(--danger);
  --color-info: var(--info);
  --font-display: 'Space Grotesk', sans-serif;
  --font-sans: 'Manrope', sans-serif;
  --font-mono: 'Space Mono', monospace;
  --radius-sm: calc(var(--radius) - 1px);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) + 2px);
}

@layer base {
  * { border-color: var(--border); }
  body {
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
  ::selection { background: #C3F929; color: #0A0B0A; }
}

.font-display { font-family: var(--font-display); }
.font-mono { font-family: var(--font-mono); }
```

- [ ] **Step 2: Forçar classe dark na raiz da página**

Edite `app/index.html`: na tag `<html>` adicione `class="dark"` e `lang="pt-BR"` → `<html lang="pt-BR" class="dark">`.

- [ ] **Step 3: Verificar build**

Run: `cd app && npm run build`
Expected: build OK.

- [ ] **Step 4: Commit**

```bash
git add app
git commit -m "feat: tema TradeK (dark + lime) sobre shadcn"
```

---

### Task 6: Cliente Supabase + env

**Files:**
- Create: `app/src/lib/supabase.ts`, `app/.env`, `app/.env.example`

- [ ] **Step 1: Instalar supabase-js**

Run: `cd app && npm install @supabase/supabase-js`
Expected: pacote adicionado.

- [ ] **Step 2: Criar `app/.env` (gitignored)**

```
VITE_SUPABASE_URL=https://ewgxnsedlhlsregvyjsn.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_G_1R_ClxozK7QiI-g1B18A_wArJXvEh
```

- [ ] **Step 3: Criar `app/.env.example` (versionado, sem segredo)**

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxx
```

- [ ] **Step 4: Criar `app/src/lib/supabase.ts`**

```ts
import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL as string
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anon) {
  throw new Error("Supabase env ausente: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY")
}

// schema dedicado da plataforma — nunca usa o public do projeto
export const supabase = createClient(url, anon, {
  db: { schema: "tradek" },
  auth: { persistSession: true, autoRefreshToken: true },
})
```

- [ ] **Step 5: Verificar build**

Run: `cd app && npm run build`
Expected: build OK.

- [ ] **Step 6: Commit**

```bash
git add app/src/lib/supabase.ts app/.env.example
git commit -m "feat: cliente supabase (schema tradek) + env example"
```

---

### Task 7: Roteamento e shells das 3 superfícies

**Files:**
- Create: `app/src/routes/AppRouter.tsx`, `app/src/features/site/SiteLayout.tsx`, `app/src/features/admin/AdminLayout.tsx`, `app/src/features/portal/PortalLayout.tsx`, `app/src/features/Launcher.tsx`
- Modify: `app/src/App.tsx`, `app/src/main.tsx`

- [ ] **Step 1: Instalar react-router-dom**

Run: `cd app && npm install react-router-dom`
Expected: pacote adicionado.

- [ ] **Step 2: Criar `app/src/features/Launcher.tsx` (home dev — índice das superfícies)**

```tsx
import { Link } from "react-router-dom"

const surfaces = [
  { to: "/site", title: "Site Público", desc: "Home, unidades, FAQ e Agente TradeK." },
  { to: "/admin", title: "Painel Admin", desc: "CRM, documentos, relatórios IA, config." },
  { to: "/portal", title: "Área do Cliente", desc: "Documentos, ficha, chat e acompanhamento." },
]

export function Launcher() {
  return (
    <div className="min-h-screen flex flex-col justify-center max-w-4xl mx-auto px-10">
      <span className="font-mono text-xs tracking-widest text-lime uppercase">TradeK OS</span>
      <h1 className="font-display text-5xl font-semibold mt-4 leading-none">
        O sistema operacional do trade <span className="text-lime">China–Brasil.</span>
      </h1>
      <div className="grid grid-cols-3 gap-4 mt-10">
        {surfaces.map((s) => (
          <Link key={s.to} to={s.to} className="border border-border rounded-md p-5 hover:border-white/20 transition">
            <div className="font-display text-lg font-semibold">{s.title}</div>
            <div className="text-sm text-muted-foreground mt-2">{s.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Criar os três layouts (placeholders com `<Outlet/>`)**

`app/src/features/site/SiteLayout.tsx`:

```tsx
import { Outlet } from "react-router-dom"

export function SiteLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-8 py-4 font-display font-semibold">TradeK · Site</header>
      <main className="p-8"><Outlet /></main>
    </div>
  )
}
```

`app/src/features/admin/AdminLayout.tsx`:

```tsx
import { Outlet } from "react-router-dom"

export function AdminLayout() {
  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="border-r border-border p-4 font-display font-semibold">TradeK · Admin</aside>
      <main className="p-8"><Outlet /></main>
    </div>
  )
}
```

`app/src/features/portal/PortalLayout.tsx`:

```tsx
import { Outlet } from "react-router-dom"

export function PortalLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-8 py-4 font-display font-semibold">TradeK · Portal</header>
      <main className="p-8"><Outlet /></main>
    </div>
  )
}
```

- [ ] **Step 4: Criar `app/src/routes/AppRouter.tsx`**

```tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Launcher } from "@/features/Launcher"
import { SiteLayout } from "@/features/site/SiteLayout"
import { AdminLayout } from "@/features/admin/AdminLayout"
import { PortalLayout } from "@/features/portal/PortalLayout"

const router = createBrowserRouter([
  { path: "/", element: <Launcher /> },
  { path: "/site", element: <SiteLayout />, children: [{ index: true, element: <div className="font-display text-2xl">Site público — em construção</div> }] },
  { path: "/admin", element: <AdminLayout />, children: [{ index: true, element: <div className="font-display text-2xl">Admin — em construção</div> }] },
  { path: "/portal", element: <PortalLayout />, children: [{ index: true, element: <div className="font-display text-2xl">Portal — em construção</div> }] },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 5: Substituir `app/src/App.tsx`**

```tsx
import { AppRouter } from "@/routes/AppRouter"

export default function App() {
  return <AppRouter />
}
```

- [ ] **Step 6: Garantir que `app/src/main.tsx` importa o `index.css` e renderiza `App`**

Conteúdo esperado de `app/src/main.tsx`:

```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 7: Verificar build**

Run: `cd app && npm run build`
Expected: build OK, sem erros de tipo.

- [ ] **Step 8: Commit**

```bash
git add app
git commit -m "feat: roteamento + shells das 3 superfícies (site/admin/portal)"
```

---

### Task 8: Verificação de boot

**Files:** nenhum (verificação)

- [ ] **Step 1: Subir o dev server em background e checar resposta**

Run: `cd app && (npm run dev &) && sleep 4 && curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 && pkill -f vite`
Expected: `200`.

- [ ] **Step 2: Confirmar que o build de produção continua verde**

Run: `cd app && npm run build`
Expected: build OK.

- [ ] **Step 3: Commit final do milestone (se houver pendências de lockfile)**

```bash
git add -A
git commit -m "chore: fundação concluída — app boota com tema TradeK" --allow-empty
```

---

## Definition of Done (Plano 01)

- `cd app && npm run build` passa sem erros de tipo.
- `npm run dev` serve `http://localhost:5173` com **200**; `/`, `/site`, `/admin`, `/portal` renderizam no tema dark + lime.
- Cliente Supabase configurado com `db.schema = "tradek"`, lendo env; `.env` fora do git, `.env.example` versionado.
- Nenhuma migration aplicada ainda (isso é o Plano 02). Nenhuma alteração no schema `public`.

## Notas para o Plano 02

- Primeiro passo do Plano 02: registrar/dumpar o schema `public` atual (`supabase db dump --linked --schema public` com Docker, **ou** `SELECT table_name FROM information_schema.tables WHERE table_schema='public'` via Management API) só para baseline.
- Depois: `supabase migration new tradek_schema` → criar enums + tabelas em `tradek` → `supabase db push` → `supabase gen types typescript --linked --schema tradek > app/src/lib/database.types.ts`.
