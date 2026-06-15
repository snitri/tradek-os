# TradeK OS — Plano 06: Portal do Cliente (executado)

**Goal:** Portar `client.jsx` com fidelidade; portal RLS-scoped (cliente só vê os próprios dados); admin cria acesso do cliente.

## Entregue (11 telas do spec 05)
- **Edge Function `create-client`**: valida chamador interno, cria `auth.users` (role cliente + company_id via metadata → trigger cria profile), vincula lead, retorna link de 1º acesso (recovery).
- **`ClienteLayout`**: header + nav completo (Início, Oportunidades, Documentos, Ficha, Mensagens, Notificações) + perfil + logout.
- **9 telas** (`cliente/screens.tsx`): Dashboard (oportunidade + status traduzido + pendências + mensagens), Oportunidades, Checklist (document_requests + progresso), Upload (**Storage real** → `documents` + atualiza request + interação), Ficha cadastral (edita company), Chat (interactions visivel_cliente, envia mensagem), Notificações, Perfil (troca senha).
- **RLS:** migration `tradek_client_updates` (cliente edita própria empresa e status de doc). Cliente vê só a própria empresa, nunca campos internos.
- **Admin:** botão "Criar acesso cliente" no `LeadModal` chama `create-client`.

## Verificação E2E
- Cliente de teste `cliente@tradek.app` / `TradeKcliente2026!` vinculado à empresa do lead "Importadora Teste LTDA". Login → portal mostra a solicitação real, status traduzido ("Solicitacao recebida"), e os documentos solicitados (2 pendentes, 1 aprovado). Screenshots confirmam.

## Pendente
- Convite por e-mail real (Resend) → Plano 08; hoje retorna link de 1º acesso pra compartilhar.
