# TradeK OS — Roadmap de Planos de Implementação

> **Meta:** plataforma 100% funcional (spec: [docs/superpowers/specs/2026-06-15-tradek-os-design.md](../specs/2026-06-15-tradek-os-design.md)).
> O spec cobre múltiplos subsistemas, então a implementação é entregue como **planos-milestone sequenciais**, cada um produzindo software funcional e testável. Construímos todos — esta é só a ordem.

## Ordem dos planos

| # | Plano | Entrega testável | Depende de |
|---|---|---|---|
| 01 | **Fundação** | App Vite/TS/React/shadcn boota com tema TradeK, cliente Supabase e shells de rota (`/`, `/admin`, `/portal`) | — |
| 02 | **Banco de dados** | Schema `tradek` aplicado (enums, ~27 tabelas, RLS, storage, seeds); `database.types.ts` gerado | 01 |
| 03 | **Autenticação** | Login admin (email/senha) + cliente (convite/1º acesso); `profiles`; guards de rota por papel | 02 |
| 04 | **Site público + Agente** | 8 páginas reais + widget do agente + form fallback criando lead | 02, 03 |
| 05 | **Painel Admin** | Dashboard, CRM Kanban/Lista, modal do lead (9 abas) e as demais telas admin com CRUD real | 03 |
| 06 | **Portal do Cliente** | 11 telas com RLS, upload de documentos, ficha, chat, notificações | 03, 05 |
| 07 | **Edge Functions / IA** | `agent-chat` (Claude), `qualify`, `generate-report`, `rag-ingest/search`, `create-client` | 02, 04 |
| 08 | **Automações + E-mail** | Database Webhooks → `on-event` → Resend; notificações in-app via Realtime | 07 |
| 09 | **Hardening + Deploy** | Auditoria RLS, security review, LGPD export/anonimização, deploy (Vercel + functions) | todos |
| 10 | **LGPD (RNF-003)** | Edge Function `lgpd` (export/anonimização, interna), marcador `companies.anonimizado`, UI admin (Config › LGPD) + portal do cliente | 09 |

## Convenções (todos os planos)

- **Diretório do app:** `app/`. **Supabase:** `supabase/migrations/` e `supabase/functions/`.
- **Migrations:** `supabase migration new <nome>` → editar SQL → `supabase db push` (CLI já linkado em `ewgxnsedlhlsregvyjsn`).
- **Tipos:** após cada mudança de schema, `supabase gen types typescript --linked --schema tradek > app/src/lib/database.types.ts`.
- **Commits frequentes** ao fim de cada task. **Nunca** tocar no schema `public`.
- Segredos só em Edge Function secrets / `.env` (gitignored). Front usa apenas `VITE_SUPABASE_URL` + publishable key.

## Segredos a obter do usuário (quando os planos 07/08 chegarem)

`ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM` (domínio verificado). Até lá, placeholders; o resto fica funcional.
