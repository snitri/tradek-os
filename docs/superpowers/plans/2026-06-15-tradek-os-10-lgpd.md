# TradeK OS — Plano 10: LGPD export + anonimização (RNF-003) (executado)

**Goal:** atender, sob demanda, os direitos do titular (LGPD): portabilidade (export dos dados) e exclusão (anonimização da PII) de uma empresa/lead. Fecha o follow-up "LGPD export/anonimização sob demanda — pendente (RNF-003)" registrado no Plano 09.

## Entregue

### Edge Function `lgpd` (`supabase/functions/lgpd/index.ts`)
- **`verify_jwt` (padrão, sem `--no-verify-jwt`)** + validação de papel: só **usuário interno** opera (mesmo padrão da `create-client` — rejeita `role = 'cliente'`). O cliente **não** chama esta function (ver portal abaixo).
- Resolve a empresa-alvo por `company_id` **ou** `lead_id` (busca o `company_id` do lead).
- **`action: "export"`** → JSON (service role, RLS não bloqueia) com `company`, `contacts`, `leads`, `documents`, `document_requests`, `interactions` e `reports` da empresa. Interações/relatórios são coletados pelos `lead_id` da empresa. Inclui `gerado_em` e `gerado_por` (e-mail do operador).
- **`action: "anonymize"`** → substitui a PII e marca a empresa:
  - `companies`: `razao_social`/`nome_fantasia` → `[ANONIMIZADO]`; `cnpj`/inscrições/CNAE/`site`/`observacoes` → `null`; `endereco` → `{}`; `anonimizado = true`, `anonimizado_em = now()`.
  - `contacts`: `nome` → `[ANONIMIZADO]`; `email` → `anon+<id8>@anonimizado.local`; `whatsapp`/`telefone`/`cpf`/`cargo` → `null`.
  - `leads`: `resumo_ia`/`o_que_quer`/`o_que_nao_quer` → `null`; `dados_coletados` → `{}`.
  - Retorna contagem de contatos/leads anonimizados. `cnpj` vira `null` (não colide com o índice único parcial `where cnpj is not null`).
- Toda alteração passa pelos triggers `tradek.audit()` (`companies`/`contacts`/`leads`) → rastro em `audit_logs` (RNF-005).

### Migração `20260615233500_tradek_lgpd.sql`
- `tradek.companies`: `anonimizado boolean not null default false` + `anonimizado_em timestamptz` (com comentários e índice parcial). É o "campo marcado" pela anonimização.
- `database.types.ts` atualizado (colunas em `Row`/`Insert`/`Update`).

### UI — Admin (`Configurações › LGPD`, `app/src/features/admin/screens.tsx`)
- Componente `LgpdPanel`: seletor de empresa (mostra "· anonimizado" quando aplicável) + **Exportar dados (JSON)** (faz download do export) + **Anonimizar / Excluir** (confirm + desabilita quando já anonimizada).

### UI — Portal do cliente (`Perfil e segurança`, `app/src/features/cliente/screens.tsx`)
- Painel **Privacidade (LGPD)** com **Solicitar meus dados** e **Solicitar exclusão**. Como a function é interna, o titular **registra a solicitação** — uma `interaction` no seu lead (`autor_tipo = 'cliente'`, `visivel_cliente = true`) que aparece para o time interno, que cumpre o pedido pela tela admin. Fluxo correto da LGPD (titular requisita → controlador executa) e respeita a RLS do cliente.

## Deploy
```bash
# verify_jwt ligado (padrão): exige usuário autenticado; a function ainda checa papel interno
supabase functions deploy lgpd
supabase db push   # aplica 20260615233500_tradek_lgpd.sql
```

## Decisões / segurança
- **Function interna apenas:** evita expor export/anonimização a qualquer cliente; o portal só registra a intenção.
- **Anonimização > exclusão física:** preserva integridade referencial (FKs de leads/documents/relatórios) e o rastro de auditoria, removendo a PII — atende ao direito à exclusão sem quebrar o histórico.
- **Auth/`auth.users`:** o e-mail de login do cliente fica em `auth.users` (fora do schema `tradek`). A exclusão definitiva da conta de acesso (via `auth.admin.deleteUser`) é um follow-up consciente se o titular pedir remoção total do login.

## Verificação
- `cd app && npm run build` → verde (tsc + vite).
