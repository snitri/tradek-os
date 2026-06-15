# TradeK OS — Plano 08: Automações + E-mail (executado)

**Goal:** disparar e-mails reais (Resend) e notificações in-app por eventos de domínio.

## Entregue
- **Edge Function `on-event`** (`--no-verify-jwt`, protegida por `WEBHOOK_SECRET`): resolve `notification_rules` do evento, renderiza `email_templates` (`{{vars}}`), envia via **Resend**, grava `email_log` e cria `notifications` in-app para os usuários cliente da empresa do lead.
- **Triggers (pg_net)** — migration `tradek_events`: `tradek.emit_event()` posta pro `on-event` em `leads` (INSERT → `lead.created`; UPDATE de status → `lead.status_changed`/`lead.qualified`) e `documents` (INSERT → `lead.document_uploaded`). Webhook secret lido de `tradek.settings` (gravado via Management API, fora do git).
- **Convite por e-mail** na `create-client`: além do link de 1º acesso, envia o template `convite_cliente` ao cliente via Resend, com log em `email_log`.
- **Secrets** (Function secrets): `RESEND_API_KEY`, `RESEND_FROM` (`TradeK <noreply@tradek.com.br>`), `WEBHOOK_SECRET`. Domínio `tradek.com.br`.

## Verificação ao vivo
- `on-event` direto: enviou e-mail real (Resend `provider_id`) com assunto renderizado ("Novo lead: Acme Importadora LTDA (supply_chain_finance)"); `email_log` = enviado.
- **Trigger E2E:** INSERT de lead → trigger → pg_net → on-event → Resend → `email_log` (provider_id real), sem chamada manual.

## Pendente (menor)
- Notificações in-app em tempo real (Realtime): `notifications` é criada e aparece ao abrir a tela; live-push exige `alter publication supabase_realtime add table tradek.notifications` + subscription — follow-up.
- Regras de notificação adicionais (documento aprovado/reprovado, proposta) podem ser cadastradas na tela admin de Notificações.
