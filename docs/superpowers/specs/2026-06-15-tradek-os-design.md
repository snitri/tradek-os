# TradeK OS — Design / Spec de Implementação

**Versão:** 1.0
**Data:** 2026-06-15
**Status:** Aprovado para planejamento
**Stack:** Vite + TypeScript + React + shadcn/ui + Tailwind CSS + Supabase
**Projeto Supabase:** "Projeto TraderK" (`ewgxnsedlhlsregvyjsn`, org `gffnviyyiidfijvzveen`) — acesso via **Supabase CLI** (linkado)

---

## 1. Objetivo

Transformar o protótipo navegável da TradeK (arquivos `.jsx` com dados mockados + specs em `uploads/`) numa plataforma **100% funcional**: site público com agente de IA, CRM interno, painel administrativo, portal do cliente, gestão documental, relatórios por IA, notificações por e-mail e base RAG — tudo ligado a banco/auth reais.

**Entrega:** plano único cobrindo todos os módulos e as 31 telas, organizado internamente em módulos isolados.

## 2. Decisões travadas (não reabrir sem motivo)

| # | Decisão | Valor |
|---|---|---|
| D1 | Acesso ao Supabase | Supabase CLI local (já linkado; migrations via `supabase db push`) |
| D2 | Faseamento | Tudo num plano só, modularizado internamente |
| D3 | Isolamento de dados | Schema Postgres dedicado **`tradek`** — nunca tocar no `public` |
| D4 | Auth | Supabase Auth único; `tradek.profiles` com enum de papel + RLS |
| D5 | Storage | Supabase Storage privado, URLs assinadas, versionamento |
| D6 | App | SPA único Vite, rotas `/`, `/admin/*`, `/portal/*`, design system shadcn do `tradek.css` |
| D7 | IA | **Claude (Anthropic)** em Edge Functions; embeddings RAG = `gte-small` nativo do Supabase |
| D8 | E-mail | **Resend** (notificações + convites), via Edge Function `on-event` |
| D9 | Backend privilegiado | Supabase Edge Functions (Deno/TS) com service role |

### Regra de ouro de isolamento
Todas as tabelas novas vivem em `tradek`. Antes da primeira migration, dumpar o schema `public` atual (Docker 1x **ou** `SELECT` via Management API) só para registro/confirmação. Como `tradek` é schema próprio, colisão com o projeto atual é impossível por construção.

## 3. Arquitetura

```
Visitante (anônimo) ──► Site público (/) ──► Widget Agente IA / Form fallback
                                              │
                          Edge Function `agent-chat` (Claude + tools + RAG)
                                              │
                                     tradek.leads + reports + interactions
                                              │
        Admin (/admin/*) ◄── Supabase JS (RLS) ──► Postgres (schema tradek) ◄── Cliente (/portal/*)
                                              │
            Edge Functions: qualify · generate-report · rag-ingest · on-event(Resend) · create-client
                                              │
                       Storage (documents/rag/products) · Realtime (chat/notif) · Auth
```

- **Frontend ↔ Supabase direto** para CRUD protegido por RLS.
- **Edge Functions** para tudo que exige service role / segredo / IA: agente, qualificação, relatório, ingestão RAG, dispatcher de eventos+e-mail, criação de usuário cliente.
- **Database Webhooks** disparam `on-event` em mudanças relevantes (eventos de domínio).

### Estrutura de pastas (alvo)
```
/                       (raiz atual — protótipo preservado para referência)
├─ app/                 novo app Vite
│  ├─ src/
│  │  ├─ lib/supabase.ts, lib/rls helpers, lib/types (gerado por supabase gen types)
│  │  ├─ components/ui/ (shadcn)  components/ (compartilhados: Kanban, DataTable, Chat, Uploader, Timeline)
│  │  ├─ features/site/  features/admin/  features/portal/
│  │  ├─ routes/  (react-router: /, /admin/*, /portal/*)
│  │  └─ theme/ (tokens do tradek.css → Tailwind config + CSS vars)
│  └─ index.html, vite.config.ts, tailwind.config.ts, tsconfig.json
├─ supabase/
│  ├─ migrations/       (schema tradek, enums, RLS, storage, seeds)
│  └─ functions/        (agent-chat, qualify, generate-report, rag-ingest, on-event, create-client)
```

## 4. Modelo de dados — schema `tradek` (~27 tabelas)

### 4.1 Enums
`user_role` (master, gerente, comercial, operacional, financeiro, atendimento, leitura, cliente) ·
`unidade` (supply_chain_finance, procurement, produtos_motos, suporte_importacao, outro) ·
`lead_status` (novo, qualificacao_ia, dados_incompletos, qualificado, doc_solicitados, doc_recebidos, em_analise, aprovado_proposta, proposta_enviada, negociacao, ganho, perdido, desqualificado, arquivado) ·
`origem` (site_chat_ia, formulario_site, cadastro_manual, email, whatsapp, indicacao, evento, trafego_pago, importacao_manual, outro) ·
`doc_status` (nao_solicitado, solicitado, enviado, em_revisao, aprovado, reprovado, reenvio_solicitado, vencido) ·
`motivo_desqualificacao`, `motivo_perda`, `urgencia`, `task_status`, `proposal_status`, `interaction_canal`, `interaction_tipo`, `autor_tipo`.
> Rótulos exibíveis e ordenação do pipeline ficam editáveis em `pipeline_statuses` (sem migration).

### 4.2 Tabelas

**Identidade / acesso**
- `profiles` — `id` = `auth.users.id`, `nome`, `role user_role`, `company_id` (clientes), `telefone`, `avatar_url`, `ativo`, `ultimo_login`, `bloqueado`. 1 linha por usuário (admin ou cliente).
- `audit_logs` — `usuario_id`, `acao`, `entidade`, `entidade_id`, `valor_anterior jsonb`, `valor_novo jsonb`, `ip`, `origem`, `criado_em`.

**CRM**
- `companies` — razão social, nome fantasia, CNPJ, inscrições, fundação, CNAEs, `possui_radar`, `tipo_radar`, `media_importacoes`, `endereco jsonb`, site, observações.
- `contacts` — `company_id`, nome, cargo, email, telefone, whatsapp, cpf, tipo, `principal bool`.
- `leads` — **o card = lead/oportunidade**. `origem`, `unidade`, `status lead_status`, `score_ia int`, `classificacao`, `responsavel_id`, `company_id`, `contact_id`, `produto_servico_interesse`, `valor_estimado numeric`, `moeda`, `volume_estimado`, `prazo_desejado`, `urgencia`, `resumo_ia text`, `o_que_quer text`, `o_que_nao_quer text`, `dados_coletados jsonb`, `dados_faltantes jsonb`, `pendencias jsonb`, `riscos jsonb`, `proxima_acao text`, `motivo_desqualificacao`, `motivo_perda`, `tags text[]`, `ultimo_contato_em`, `proxima_tarefa_em`, `cliente_portal_criado bool`, `consentimento_lgpd bool`, **`dados_oportunidade jsonb`** (campos específicos por unidade: SCF/Procurement/Motos do spec 04/08).
- `lead_status_history` — `lead_id`, `status_anterior`, `status_novo`, `usuario_id`, `motivo`, `criado_em`.
- `interactions` — `lead_id`, `canal`, `tipo`, `autor_tipo`, `autor_id`, `mensagem text`, `anexos jsonb`, `visivel_cliente bool`, `criado_em`. (timeline + chat admin↔cliente; `visivel_cliente=false` = comentário interno).
- `tasks` — `lead_id`, título, descrição, `responsavel_id`, `prazo`, `prioridade`, `status task_status`, `criada_por`, `concluida_em`, `checklist_item_id?`.

**Atendimento / IA**
- `conversations` — sessão do agente no site: `visitor_id`, `unidade_detectada`, `lead_id?`, `status`, `assumida_por?`, `resumo`, timestamps.
- `conversation_messages` — `conversation_id`, `role` (user/assistant/system/tool), `content`, `tool_calls jsonb`, `criado_em`.
- `agent_configs` — por unidade: `nome`, `avatar`, `mensagem_inicial`, `unidade`, `perguntas_obrigatorias jsonb`, `perguntas_condicionais jsonb`, `campos_saida jsonb`, `score_minimo`, `status_inicial`, `checklist_id?`, `produtos_consultaveis bool`, `guardrails text`, `prompt text`, `ativo`.
- `reports` — `lead_id`, `tipo`, `conteudo text` (markdown), `score`, `modelo_ia`, `prompt_version`, `gerado_em`, `gerado_por`, `enviado_por_email bool`, `versao`.

**RAG**
- `rag_documents` — `titulo`, `categoria`, `unidade`, `status` (ativo/inativo), `validade`, `storage_key`, `restrito_admin bool`, `versao`.
- `rag_chunks` — `document_id`, `chunk_index`, `conteudo text`, `embedding vector(384)` (pgvector / `gte-small`), índice ivfflat/hnsw.

**Documentos**
- `checklists` — `nome`, `unidade`, `ativo`. (templates)
- `checklist_items` — `checklist_id`, `tipo_documento`, `obrigatorio bool`, `descricao`, `formatos_aceitos text[]`.
- `document_requests` — instância por lead: `lead_id`, `company_id`, `checklist_item_id?`, `tipo_documento`, `status doc_status`, `solicitado_em`, `vencimento?`.
- `documents` — arquivos enviados (versionado): `request_id`, `company_id`, `lead_id`, `nome_original`, `storage_key`, `versao`, `status doc_status`, `enviado_em`, `revisado_em`, `revisado_por`, `motivo_reprovacao`, `observacoes`, `hash_arquivo`, `tamanho`, `mime`.

**Catálogo / comercial**
- `products` — modelo, categoria, descrições, motor, velocidade, autonomia, bateria, freios, capacidade, MOQ, `preco_base numeric`, moeda, `condicao_comercial`, `imagens jsonb`, `ficha_tecnica jsonb`, `status`, `publicado_site bool`, `permitir_cotacao_ia bool`.
- `services` — nome, categoria, descrição, público-alvo, `perguntas_qualificacao jsonb`, `checklist_id?`, `agente_id?`, `emails_notificados text[]`, `status`.
- `proposals` — `lead_id`, `status proposal_status`, `valor numeric`, moeda, `pdf_storage_key?`, `enviada_em`, `aceite_em`, `recusa_em`, `observacoes`.

**Comunicação**
- `notification_rules` — `nome`, `evento`, `unidade?`, `status_origem?`, `status_destino?`, `emails_para text[]`, `emails_cc text[]`, `emails_bcc text[]`, `template_id`, `ativo`, `enviar_resumo_ia bool`, `enviar_anexos bool`, `frequencia`.
- `email_templates` — `nome`, `assunto`, `corpo_html text`, `variaveis text[]`, `ativo`.
- `email_log` — `rule_id?`, `lead_id?`, `template_id?`, `para text[]`, `assunto`, `status`, `provider_id`, `erro?`, `criado_em`.
- `notifications` — in-app (admin + cliente): `user_id`, `tipo`, `mensagem`, `link`, `lida bool`, `criado_em`.

**Configuração**
- `pipeline_statuses` — `key lead_status`, `label_admin`, `label_cliente`, `ordem int`, `cor`, `visivel_kanban bool`. (rótulos editáveis; mapa "status interno → status visível ao cliente" do spec 05).
- `settings` — `chave`, `valor jsonb` (empresa, unidades, segurança, LGPD, integrações).

## 5. Segurança / RLS

- **RLS habilitado em todas as tabelas de `tradek`.**
- Helper `tradek.current_role()` e `tradek.current_company()` lendo `profiles` do `auth.uid()`.
- **Internos:** acesso por papel (master = total; demais por módulo conforme spec 02 §3). Políticas por tabela.
- **Cliente** (`role='cliente'`): `SELECT/INSERT` apenas onde `company_id = current_company()`; **nunca** lê `reports`, `score_ia`, `riscos`, `lead_status_history`, `interactions.visivel_cliente=false`, dados de outras empresas. Visões/colunas filtradas para o portal.
- **Storage:** policies por bucket. `tradek-documents` privado, leitura/escrita só do dono (company) e internos; URLs assinadas com expiração. `tradek-rag` privado (interno). `tradek-products` público (imagens).
- **Auditoria:** triggers `AFTER INSERT/UPDATE/DELETE` em tabelas críticas gravam `audit_logs`. Login/logout logados via Edge/hook.
- **LGPD:** `consentimento_lgpd` capturado na origem; `settings` guarda política; rota admin de export/anonimização sob demanda.

## 6. Edge Functions (Deno/TS)

| Função | Papel |
|---|---|
| `agent-chat` | Conversa do site. Claude (Sonnet) + tools: `detectar_unidade`, `coletar_campos`, `buscar_rag`, `consultar_produto`, `criar_ou_atualizar_lead`, `solicitar_handoff`. Guardrails do spec 08 no system prompt. Persiste em `conversations`/`messages`. Anônimo (sem auth). |
| `qualify` | Calcula score 0–100 (critérios + ajustes por unidade do spec 07/08), classificação e status sugerido. |
| `generate-report` | Gera relatório IA (Opus) no formato do spec 08 §9; grava `reports` versionado. |
| `rag-ingest` | Extrai texto do arquivo, chunk, embeddings `gte-small`, grava `rag_chunks`. |
| `rag-search` | Busca vetorial top-k (usada por `agent-chat`). |
| `on-event` | Dispatcher: recebe Database Webhook, resolve `notification_rules`, renderiza `email_templates`, envia via **Resend**, grava `email_log`, cria `notifications` in-app e `tasks` automáticas (ex.: score ≥ 60). |
| `create-client` | Admin cria usuário cliente: cria `auth.users` (service role), `profiles role=cliente` + `company_id`, vincula lead/checklist, envia convite (Resend), registra evento. |

Segredos (Function secrets, fora do front): `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `SUPABASE_SERVICE_ROLE_KEY`.

## 7. Automações / eventos (spec 07 §9–10)

Eventos: `lead.created/updated/qualified/disqualified/status_changed/assigned/document_requested/document_uploaded/document_approved/document_rejected`, `client.user_created/invite_sent/message_sent`, `admin.message_sent`, `report.generated`, `proposal.created/sent`, `opportunity.won/lost`, `task.created/overdue`.

Fluxos automáticos implementados conforme spec 07 §10 (novo lead → classificar+score+relatório+notificar+tarefa se score≥60; lead qualificado → notificar+sugerir checklist+botão criar acesso; cliente criado → vincular+convite; documento enviado → atualizar checklist+notificar+interação; mudança de status → history+regra de e-mail).

## 8. Agente IA + RAG (specs 07/08)

- 5 agentes lógicos (Geral, SCF, Procurement, Produtos/Motos, Suporte) — 1 `agent-chat` com seleção por unidade via `agent_configs`.
- Perguntas por unidade, campos estruturados, score com bônus/penalidades por unidade e prompts-base **exatamente** como specs 07/08.
- Guardrails obrigatórios (não aprovar crédito/financiamento/preço/homologação; análise final humana).
- Handoff humano com registro estruturado.
- RAG por categoria/unidade, prioriza ativos, bloqueia preço desatualizado para cotação IA.

## 9. Cobertura de telas (31)

- **Site (8):** Home, SCF, Procurement, Produtos/Motos, Sobre, FAQ, Contato, Obrigado + widget Agente + form fallback.
- **Admin (24, spec 04):** Login, Dashboard, CRM Kanban, CRM Lista, Modal do lead (9 abas: Resumo/Dados/Oportunidade/Qualificação/Interações/Documentos/Chat/Relatório/Histórico), Novo lead, Interações, Qualificação IA, Documentos&Checklists, Empresas&Contatos, Clientes/Acessos, Criar acesso, Produtos&Serviços, Cotações/Propostas, Relatórios IA, Tarefas/SLA, Chat, Notificações, Templates, Config Agentes, Base RAG, Usuários/Permissões, Auditoria, Config geral.
- **Portal cliente (11, spec 05):** Login, 1º acesso, Dashboard, Oportunidades, Detalhe, Checklist, Upload, Ficha cadastral, Chat, Notificações, Perfil — com `pipeline_statuses.label_cliente` e regras de ocultação do spec 05 §2/§7.

Layouts e tokens visuais derivados do protótipo (`site.jsx`, `admin*.jsx`, `client.jsx`, `ui.jsx`, `tradek.css`) reescritos em React+shadcn.

## 10. Seeds (specs 09, 10, 12)

Migrations de seed populam: `pipeline_statuses` (mapa admin↔cliente), `settings` (empresa, unidades, segurança, LGPD), `checklists`+`checklist_items` (spec 09), `email_templates` (spec 04 §21 + 12), `agent_configs` (spec 08 prompts), `notification_rules` iniciais, e **catálogo de produtos/motos** (spec 10 + imagens de `assets/motos/`).

## 11. Sequência de construção (milestones internos)

0. **Fundação** — app Vite/TS/React/Tailwind/shadcn; tema do `tradek.css`; `supabase-js`; shells de rota; `supabase gen types`.
1. **DB** — migrations: schema `tradek`, enums, tabelas, índices, RLS, storage buckets+policies, seeds.
2. **Auth** — admin (email/senha) + cliente (convite/1º acesso); `profiles`; guards de rota por papel.
3. **Site público + Agente** — 8 páginas + widget + form fallback ligados a `agent-chat`/lead.
4. **Admin** — dashboard, CRM (kanban/lista/modal), e demais 24 telas com CRUD real.
5. **Portal cliente** — 11 telas com RLS, upload, ficha, chat, notificações.
6. **Edge Functions / IA** — `agent-chat`, `qualify`, `generate-report`, `rag-ingest/search`, `on-event`, `create-client`.
7. **Automações + e-mail** — webhooks → `on-event` → Resend; notificações in-app via Realtime.
8. **Hardening** — auditoria de RLS, security review, LGPD export/anonimização, config de deploy (Vercel + functions).

## 12. Segredos / variáveis

Frontend (`.env`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Edge (secrets): `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM` (+ domínio verificado), `SUPABASE_SERVICE_ROLE_KEY`. Até serem fornecidos: placeholders; agente/e-mail "ligam" ao inserir as chaves; resto funcional.

## 13. Fora de escopo (do PRD §8)

Aprovação automática de crédito; integração bancária real; cálculo de impostos/frete; portal de fornecedor chinês; assinatura digital integrada; e-commerce transacional; cotação definitiva sem validação humana; Siscomex; motor financeiro complexo.

## 14. Riscos / pontos abertos

| Risco | Mitigação |
|---|---|
| Schema `public` atual desconhecido até a impl | Schema `tradek` isola por construção; dump no início da impl |
| SEO fraco do site público em SPA | Aceitável agora; pré-render/SSR depois se preciso |
| Custo de LLM por conversa | Sonnet no agente, Opus só em relatórios; cache de RAG |
| Senha do banco no keychain / Docker p/ dump | Dump via Management API ou Docker pontual no início |
| Convite de cliente antes do Resend configurado | Fallback no e-mail nativo do Supabase Auth |

## 15. Definition of Done

Todas as 31 telas navegáveis e ligadas a dados reais; RLS testado (cliente não acessa dados de terceiros nem campos internos); agente cria lead+relatório; admin opera CRM ponta a ponta; cliente envia documento e recebe aprovação/reprovação; notificações por e-mail e in-app disparando; auditoria registrando ações críticas; nenhuma alteração em tabelas do `public`.
