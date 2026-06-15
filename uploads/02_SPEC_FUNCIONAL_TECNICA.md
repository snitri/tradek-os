# SPEC Funcional e Técnica — TradeK OS

## 1. Visão técnica

O TradeK OS deve ser uma aplicação web modular composta por:

```text
Site público
↓
Agente IA / Formulários
↓
Backend de captação
↓
CRM interno
↓
Painel administrativo
↓
Área do cliente
↓
Documentos, relatórios, notificações e auditoria
```

## 2. Módulos

### M01 — Site público

Apresenta a TradeK, unidades de negócio, serviços, produtos e CTAs de captação.

### M02 — Agente IA

Conversa com visitantes, coleta dados, classifica intenção, calcula score, cria lead e gera relatório.

### M03 — CRM interno

Gerencia leads/oportunidades com Kanban, lista, status, responsáveis, atividades e histórico.

### M04 — Painel administrativo

Opera dashboard, CRM, documentos, clientes, relatórios, produtos, serviços, configurações e auditoria.

### M05 — Área do cliente

Permite envio de documentos, ficha cadastral, chat e acompanhamento simplificado.

### M06 — Gestão documental

Controla checklist, upload, aprovação, reprovação, reenvio e versionamento.

### M07 — Relatórios IA

Gera resumos comerciais, operacionais e gerenciais.

### M08 — Notificações

Dispara e-mails configuráveis por evento, unidade, status e responsável.

### M09 — RAG / Base de conhecimento

Alimenta agentes com materiais institucionais, operacionais, técnicos e comerciais.

### M10 — Produtos e serviços

Gerencia catálogo, fichas técnicas, status comercial e regras de cotação pela IA.

## 3. Perfis e permissões

| Perfil | Descrição |
|---|---|
| Administrador Master | Acesso total. |
| Gerente Comercial | CRM, relatórios, pipeline e gestão comercial. |
| Comercial | Leads, contatos, tarefas, propostas e mensagens. |
| Operacional | Documentos, análise e status operacionais. |
| Financeiro | Dados financeiros, documentos e análise de operação. |
| Atendimento | Interações e suporte inicial. |
| Somente leitura | Consulta sem edição. |
| Cliente | Portal externo restrito aos próprios dados. |

## 4. Requisitos funcionais

### RF-001 — Captura de lead via agente IA

O visitante deve poder conversar com o agente no site. Ao final, o sistema cria ou atualiza lead no CRM.

**Aceite:** lead com nome, contato, unidade, origem, resumo IA, score e status.

### RF-002 — Formulário fallback

O site deve ter formulário tradicional para quem não quiser usar IA.

**Aceite:** formulário cria lead no CRM, com consentimento registrado.

### RF-003 — Classificação automática

A IA deve classificar o lead em Supply Chain Finance, Procurement, Produtos/Motos ou Suporte/Outro.

**Aceite:** unidade exibida no card, lista e modal; admin pode corrigir.

### RF-004 — Score IA

A IA calcula score de 0 a 100.

**Aceite:** score visível no card, lista e aba de qualificação; critérios exibidos.

### RF-005 — CRM Kanban

Admin visualiza e move oportunidades por etapa.

**Aceite:** drag and drop muda status, gera log e dispara automações.

### RF-006 — CRM lista

Admin visualiza oportunidades em tabela filtrável.

**Aceite:** busca, filtros, ordenação, exportação e ações em massa.

### RF-007 — Modal de detalhe

Admin abre lead em modal/tela dedicada.

**Aceite:** abas de resumo, dados, oportunidade, qualificação, interações, documentos, chat, relatório e histórico.

### RF-008 — Criação de usuário cliente

Admin cria acesso do cliente a partir de um lead qualificado.

**Aceite:** usuário vinculado à empresa e oportunidade; convite por e-mail; checklist associado.

### RF-009 — Portal do cliente

Cliente acessa ambiente restrito.

**Aceite:** vê apenas suas oportunidades, documentos e mensagens.

### RF-010 — Checklist documental

Admin solicita documentos por checklist padrão ou personalizado.

**Aceite:** cliente envia arquivos; admin aprova/reprova; reenvio tem histórico.

### RF-011 — Chat admin-cliente

Sistema permite mensagens por oportunidade.

**Aceite:** mensagens visíveis ao cliente separadas de comentários internos.

### RF-012 — Relatório IA

Sistema gera relatório automático do lead.

**Aceite:** relatório contém o que quer, o que não quer, dados coletados, dados faltantes, score e próxima ação.

### RF-013 — Notificações configuráveis

Admin Master configura e-mails por evento e unidade.

**Aceite:** aceita múltiplos e-mails, CC/BCC, template, ativo/inativo e log.

### RF-014 — Cadastro de produtos

Admin gerencia produtos e publicação no site.

**Aceite:** produto tem status, ficha técnica, preço base, publicação e regra de cotação IA.

### RF-015 — Base RAG

Admin alimenta conhecimento dos agentes.

**Aceite:** upload, categoria, unidade, status ativo/inativo e teste de resposta.

## 5. Requisitos não funcionais

### RNF-001 — Responsividade

Site, painel e portal devem funcionar em desktop e mobile. O painel pode priorizar desktop, mas deve ser utilizável em tablet.

### RNF-002 — Segurança

- Autenticação segura.
- Hash de senha.
- Sessão com expiração.
- Controle por perfil.
- Segregação admin/cliente.
- Logs de ações críticas.

### RNF-003 — LGPD

- Consentimento de contato.
- Registro de origem e finalidade.
- Política de privacidade.
- Exportação/exclusão/anonymização sob demanda.
- Controle de retenção documental.

### RNF-004 — Performance

- Site rápido.
- Filtros de CRM responsivos.
- Upload assíncrono.
- Tabelas paginadas.

### RNF-005 — Auditabilidade

Auditar login, criação de lead, mudança de status, criação de cliente, upload, revisão de documento, envio de e-mail e configurações.

### RNF-006 — Escalabilidade

Permitir novas unidades, agentes, produtos, checklists e templates sem refatoração pesada.

## 6. Arquitetura sugerida

### Frontend

- Site público.
- Painel admin.
- Portal cliente.
- Design system compartilhado.
- Componentes: cards, Kanban, tabela, modal, chat, uploader, timeline, filtros.

### Backend

Serviços/API para:

- Leads.
- Empresas.
- Contatos.
- Documentos.
- Interações.
- Relatórios.
- Notificações.
- Usuários.
- Permissões.
- Produtos.
- Agentes.

### Banco de dados

Tabelas principais:

- `users`
- `roles`
- `companies`
- `contacts`
- `leads`
- `opportunities`
- `interactions`
- `documents`
- `document_checklists`
- `reports`
- `products`
- `services`
- `notification_rules`
- `email_templates`
- `audit_logs`
- `agent_configs`
- `rag_documents`

### Storage de arquivos

- URL privada.
- Link temporário assinado.
- Versionamento por documento.
- Validação de tipo e tamanho.

### IA

Camada de orquestração com ferramentas para:

- Criar lead.
- Atualizar lead.
- Consultar produto.
- Gerar relatório.
- Solicitar checklist.
- Encaminhar para humano.

## 7. Integrações

### Essenciais

- E-mail transacional.
- Storage.
- IA/LLM.
- Banco de dados.
- Autenticação.

### Futuras

- WhatsApp.
- CRM externo/Notion.
- Google Drive.
- Assinatura digital.
- ERP.
- BI.

## 8. Guardrails de IA

A IA não pode:

- Aprovar crédito.
- Garantir financiamento.
- Garantir prazo.
- Inventar preço.
- Aprovar documentação.
- Emitir parecer jurídico/fiscal definitivo.

A IA pode:

- Explicar serviços.
- Coletar dados.
- Classificar intenção.
- Gerar score.
- Criar lead.
- Gerar relatório.
- Sugerir próximos passos.
