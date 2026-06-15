# TradeK OS — Plano 05: Painel Admin (executado)

**Goal:** Portar `admin.jsx`/`admin2.jsx`/`admin3.jsx` com fidelidade ao protótipo, ligando tudo ao banco (`tradek`).

## Entregue (todas as telas do spec 04)
- **Shell** (`AdminLayout`): sidebar com grupos (Operação/Cadastros/Sistema), header (busca, "Novo lead", sino, usuário do `profiles`), logout real, contexto `useAdmin` (openLead + reload).
- **Dashboard** (`AdminDashboard`): KPIs, funil por status, leads por unidade/origem, pendências, últimos leads — **agregados reais** de `tradek.leads`.
- **CRM Kanban** (`AdminKanban`): colunas de `pipeline_statuses`, cards de leads, **drag-and-drop** atualiza status no banco (+ `lead_status_history`).
- **CRM Lista** (`AdminLista`): tabela de leads com seleção.
- **Modal do lead** (`LeadModal`, 9 abas): Resumo, Dados, Oportunidade, Qualificação IA, Interações, Documentos, Chat (envia mensagem real), Relatório, Histórico — dados reais; troca de status; ações de qualificar/desqualificar.
- **Novo lead** (`NewLeadModal`): cria company+contact+lead no banco.
- **Demais telas** (`screens.tsx`): Produtos (catálogo real + modal de edição que salva), Empresas, Clientes, Tarefas, Documentos, Relatórios, Interações, Notificações (regras reais), Agentes IA (configs + RAG reais), Configurações (status do CRM, templates, usuários).

## Verificação
- `npm run build` verde. Screenshots: dashboard com lead real do site; kanban com card real; modal 9 abas com dados reais; produtos com as 7 motos do banco (editável).

## Pendente (próximos planos)
- Ações que dependem de IA/e-mail (gerar relatório, recalcular score, solicitar docs com e-mail, criar acesso cliente) → Planos 06/07/08.
- Edição completa de algumas seções de Config/Notificações/Agentes → Plano 09.
