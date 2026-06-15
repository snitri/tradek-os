# TradeK OS — Plano 02: Banco de dados

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`).
> **Nota de adaptação:** para trabalho de schema, o SQL das migrations **é** o artefato de implementação. Este plano lista os arquivos, a ordem e a verificação; o conteúdo SQL detalhado é escrito nos arquivos `supabase/migrations/*.sql` (design completo no spec [§4–§5](../specs/2026-06-15-tradek-os-design.md)). Sem duplicação de SQL aqui.

**Goal:** Aplicar o schema Postgres `tradek` no projeto Supabase (enums, ~27 tabelas, RLS, storage, seeds) e gerar os tipos TypeScript — sem tocar no schema `public`.

**Architecture:** Migrations versionadas em `supabase/migrations/`, aplicadas via `supabase db push --yes` (CLI linkado). Schema dedicado `tradek`. RLS em todas as tabelas com helpers `tradek.current_role()`/`tradek.current_company()`. pgvector para RAG. Tipos via `supabase gen types`.

**Tech Stack:** Supabase Postgres 17, pgvector, RLS, Supabase Storage, supabase CLI.

**Pré-req:** CLI linkado (`ewgxnsedlhlsregvyjsn`), conexão cacheada (push funciona sem senha). Branch `feat/tradek-os-database`.

---

### Task 1 — Migration inicial: schema + enums + helpers (de-risk do toolchain)
**Files:** Create `supabase/migrations/<ts>_tradek_init.sql`
- [ ] `CREATE SCHEMA IF NOT EXISTS tradek`; `create extension if not exists vector with schema extensions`.
- [ ] Todos os enums (§4.1 do spec): user_role, unidade, lead_status, origem, doc_status, motivo_desqualificacao, motivo_perda, urgencia, task_status, proposal_status, interaction_canal, interaction_tipo, autor_tipo.
- [ ] Funções: `tradek.set_updated_at()` (trigger), `tradek.current_role()`, `tradek.current_company()` (SECURITY DEFINER lendo `tradek.profiles`).
- [ ] Aplicar: `supabase db push --yes`. Verificar: enums existem (`select count(*) from pg_type where typnamespace = 'tradek'::regnamespace and typtype='e'`).
- [ ] Commit.

### Task 2 — Tabelas núcleo (CRM)
**Files:** Create `<ts>_tradek_core.sql` — profiles, companies, contacts, leads, lead_status_history, interactions, tasks. FKs, índices, triggers updated_at. Push + verificar 7 tabelas. Commit.

### Task 3 — IA, RAG e documentos
**Files:** Create `<ts>_tradek_ai_docs.sql` — conversations, conversation_messages, agent_configs, reports, rag_documents, rag_chunks (embedding `extensions.vector(384)` + índice ivfflat), checklists, checklist_items, document_requests, documents. Push + verificar. Commit.

### Task 4 — Comercial, comunicação e config
**Files:** Create `<ts>_tradek_commercial.sql` — products, services, proposals, notification_rules, email_templates, email_log, notifications, pipeline_statuses, settings, audit_logs. Push + verificar (~27 tabelas no total). Commit.

### Task 5 — RLS
**Files:** Create `<ts>_tradek_rls.sql` — `alter table ... enable row level security` em todas; políticas por papel (internos via `tradek.current_role()`), cliente restrito a `company_id = tradek.current_company()` e sem campos internos (reports/score/riscos/lead_status_history/interactions internas). Push + verificar (`select count(*) from pg_policies where schemaname='tradek'`). Commit.

### Task 6 — Storage
**Files:** Create `<ts>_tradek_storage.sql` — buckets `tradek-documents` (privado), `tradek-rag` (privado), `tradek-products` (público) via `storage.buckets`; policies em `storage.objects` por bucket/empresa. Push + verificar. Commit.

### Task 7 — Seeds
**Files:** Create `<ts>_tradek_seeds.sql` — pipeline_statuses (mapa admin↔cliente, spec 05), settings (empresa/unidades/LGPD), email_templates (spec 04 §21), agent_configs (spec 08 prompts/perguntas), checklists+itens (spec 09), notification_rules iniciais, catálogo de produtos (spec 10). Push + verificar contagens. Commit.

### Task 8 — Tipos TypeScript
- [ ] `supabase gen types typescript --linked --schema tradek > app/src/lib/database.types.ts`.
- [ ] Tipar o client: `createClient<Database>(...)` em `app/src/lib/supabase.ts`.
- [ ] `cd app && npm run build` verde. Commit.

---

## Setting de projeto aplicado (fora de migration)
Schema `tradek` exposto na API via Management API (não vai pro git):
`PATCH /v1/projects/ewgxnsedlhlsregvyjsn/postgrest` → `db_schema = "public,graphql_public,tradek"`, `db_extra_search_path = "public, extensions, tradek"`. Necessário para PostgREST/`supabase-js` enxergarem o schema. Verificado: anon lê produtos publicados (RLS) e recebe `[]` em tabelas internas.

## Definition of Done (Plano 02)
- Schema `tradek` com ~27 tabelas + enums + RLS habilitado + policies + 3 buckets + seeds aplicados no remoto.
- `database.types.ts` gerado e `supabase.ts` tipado; `npm run build` verde.
- `public` intocado. Migrations versionadas e idempotentes onde possível.

## Verificação de segurança (RLS) — adiada para Plano 09
Teste end-to-end de RLS (cliente não acessa dados de terceiros nem campos internos) entra no hardening (Plano 09), após auth (Plano 03) existir.
