# TradeK OS — Plano 03: Autenticação

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps usam checkbox (`- [ ]`).

**Goal:** Auth real via Supabase Auth para admin (e-mail/senha) e cliente (login + 1º acesso), com `profiles` criado automaticamente no signup, contexto de auth no front e guards de rota por papel.

**Architecture:** Trigger `tradek.handle_new_user` cria `tradek.profiles` ao inserir em `auth.users` (papel via `user_metadata.role`, default `cliente`). No front, `AuthProvider` mantém sessão + profile (role/company) e expõe `useAuth()`. Guards `RequireAuth`/`RequireInternal`/`RequireClient` protegem `/admin` e `/portal`. Admin de teste criado via Auth Admin API.

**Tech Stack:** Supabase Auth (@supabase/supabase-js), react-router-dom, shadcn (card/input/button/label/sonner).

**Pré-req:** Plano 02 aplicado (schema `tradek`, `profiles`, helpers, RLS). Branch `feat/tradek-os-auth`.

---

### Task 1 — Trigger handle_new_user
**Files:** Create `supabase/migrations/<ts>_tradek_auth.sql`
- [ ] Função `tradek.handle_new_user()` SECURITY DEFINER: insere em `tradek.profiles (id, nome, role, company_id)` lendo `new.raw_user_meta_data` (role default `cliente`), `on conflict do nothing`.
- [ ] Trigger `on_auth_user_created after insert on auth.users`.
- [ ] `supabase db push --yes`. Verificar aplicado.
- [ ] Commit.

### Task 2 — AuthProvider + useAuth
**Files:** Create `app/src/lib/auth.tsx`
- [ ] Context com `{ user, profile, role, companyId, loading, signIn(email,pwd), signOut() }`.
- [ ] `getSession()` no mount + `onAuthStateChange`; ao ter sessão, busca `tradek.profiles` do `auth.uid()`.
- [ ] `signIn` usa `supabase.auth.signInWithPassword`; atualiza `ultimo_login`.
- [ ] Build verde. Commit.

### Task 3 — Páginas de login (admin + portal)
**Files:** Create `app/src/features/auth/LoginPage.tsx`, `app/src/features/auth/FirstAccessPage.tsx`
- [ ] `LoginPage` (variante `admin|portal`): card shadcn, e-mail+senha, erro via toast, redirect por papel (interno→`/admin`, cliente→`/portal`).
- [ ] `FirstAccessPage`: fluxo de definir senha no 1º acesso (token do convite via `supabase.auth`), aceite de termos.
- [ ] Build verde. Commit.

### Task 4 — Guards + wiring do router
**Files:** Create `app/src/components/guards.tsx`; Modify `app/src/routes/AppRouter.tsx`, `app/src/main.tsx`
- [ ] `RequireAuth`, `RequireInternal` (role <> cliente), `RequireClient`.
- [ ] Rotas `/admin/login` e `/portal/login` públicas; `/admin/*` exige interno; `/portal/*` exige autenticado; redireciona conforme papel.
- [ ] `main.tsx` envolve com `AuthProvider` + `<Toaster/>`.
- [ ] Build verde. Commit.

### Task 5 — Admin de teste + verificação E2E
- [ ] Criar usuário master via Auth Admin API (service_role): `POST /auth/v1/admin/users` com `email_confirm=true`, `user_metadata={role:master,nome}`.
- [ ] Verificar: trigger criou `tradek.profiles` com role master (REST com Accept-Profile tradek, autenticado).
- [ ] Verificar login via `POST /auth/v1/token?grant_type=password` retorna access_token.
- [ ] Subir dev server e screenshot da tela de login renderizada.
- [ ] Commit.

---

## Definition of Done (Plano 03)
- Trigger cria profile no signup; admin de teste loga e cai em `/admin`; cliente cairia em `/portal`.
- Guards redirecionam por papel; `/admin` e `/portal` protegidos.
- Build verde; tela de login renderizada (screenshot). Credenciais do admin de teste reportadas ao usuário.
