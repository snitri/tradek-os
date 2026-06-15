# TradeK OS — Plano 09: Hardening + Deploy (executado)

**Goal:** endurecer segurança/RLS, auditoria, anti-abuso e preparar deploy.

## Entregue
- **Auditoria (RNF-005):** trigger genérico `tradek.audit()` grava em `audit_logs` (usuário, op, entidade, valor anterior/novo) em `leads, documents, document_requests, profiles, proposals, products, notification_rules, companies, contacts`. Verificado: UPDATE em lead gerou linha em `audit_logs`.
- **Papel `leitura` read-only:** policy `internal_all` substituída por `internal_read` (SELECT p/ qualquer interno) + `internal_ins/upd/del` (gated por `tradek.can_write()` = interno ≠ leitura). Verificado: admin master continua lendo e escrevendo.
- **Rate-limit anti-abuso:** tabela `request_log` + função `rate_check(ip,action,window,max)`; `public-lead` (5/min) e `agent-chat` (30/min) chamam via service role. Verificado: 429 ao estourar. Usa o IP real do cliente (ignora `x-forwarded-for` falsificável).
- **Deploy:** `app/vercel.json` (framework vite, SPA rewrites → index.html). Vercel: Root Directory = `app`, env `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Edge Functions já no Supabase; secrets (`ANTHROPIC_API_KEY` etc.) nos Function secrets.

## Postura de segurança (revisão)
- **Isolamento:** schema `tradek` dedicado; `public` (incl. `Leads_TradeK`) intocado.
- **RLS:** todas as tabelas; cliente restrito a `company_id`, nunca vê score/riscos/comentários internos; anônimo só lê produtos/serviços publicados (verificado por REST: `[]` em tabelas internas).
- **Segredos:** anon/publishable key no front (desenhada p/ exposição); service role e `ANTHROPIC_API_KEY` só em Edge Functions; nada de segredo no git (`.env` gitignored).
- **Privilégio:** `create-client` valida chamador interno; anti-escalada em `profiles` (trigger); leitura read-only.
- **Captação pública:** via Edge Functions com service role + rate-limit (não expõe insert anônimo direto em `leads`).

## Pendente (follow-ups conscientes)
- LGPD export/anonimização sob demanda — pendente (RNF-003); recomendado como próxima função admin.
- RAG vetorial (gte-small) — não implementado (sem docs RAG seedados).
- Plano 08 (e-mail Resend + automações por evento) — aguarda `RESEND_API_KEY` + domínio.
- Rate-limit por IP compartilhado (NAT) pode agrupar usuários; considerar captcha/token no futuro.
