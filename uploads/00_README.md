# TradeK OS — Pacote de MDS

**Versão:** v0.1  
**Data:** 2026-06-14  
**Produto:** Site público + Agente IA + CRM interno + Painel Administrativo + Área do Cliente

## Objetivo

Este pacote transforma o briefing da TradeK em documentação de produto e especificação em Markdown para orientar design, desenvolvimento e implantação do **TradeK OS**.

A solução proposta é uma plataforma modular com:

- Site público responsivo.
- Botão flutuante do Agente TradeK no site.
- Qualificação automática com IA.
- CRM interno com visão Kanban e lista.
- Painel administrativo completo.
- Área do cliente com login, envio de documentos e chat.
- Relatórios automáticos do que o cliente quer, não quer, dados faltantes e próxima ação.
- Notificações por e-mail configuráveis por evento, unidade e status.
- Base RAG para alimentar os agentes.
- Cadastro dinâmico de produtos e serviços.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `01_PRD_TradeK_OS.md` | Visão do produto, escopo, personas, objetivos, métricas e MVPs. |
| `02_SPEC_FUNCIONAL_TECNICA.md` | Requisitos funcionais, arquitetura, permissões, segurança e integrações. |
| `03_SPEC_SITE_PUBLICO_E_AGENTE.md` | Telas do site público, widget IA, formulário e jornada de captação. |
| `04_SPEC_PAINEL_ADMIN_TELAS.md` | Telas do painel administrativo: dashboard, CRM, modais, documentos, relatórios, configurações. |
| `05_SPEC_AREA_CLIENTE_TELAS.md` | Telas do portal do cliente: login, dashboard, documentos, ficha cadastral e chat. |
| `06_FLUXOS_OPERACIONAIS.md` | Fluxos em Mermaid: lead, IA, CRM, documentos, notificações, área do cliente e relatórios. |
| `07_CRM_DADOS_AUTOMACOES.md` | Status, modelo de dados, eventos, automações e regras de e-mail. |
| `08_AGENTES_IA_RAG_QUALIFICACAO.md` | Agentes de IA, perguntas por unidade, score, guardrails, RAG e handoff humano. |
| `09_CHECKLISTS_DOCUMENTOS.md` | Checklists por unidade, documentos obrigatórios, validações e mensagens padrão. |
| `10_PRODUTOS_MOTOS_CATALOGO.md` | Catálogo inicial de produtos extraído da planilha e regras de publicação/cotação. |
| `11_BACKLOG_ROADMAP_CRITERIOS.md` | MVPs, épicos, user stories, critérios de aceite e Definition of Done. |
| `12_RELATORIOS_TEMPLATES_EMAIL.md` | Relatórios IA e templates de e-mail configuráveis. |
| `13_WIREFRAMES_ASCII_TELAS_CHAVE.md` | Wireframes textuais das principais telas. |
| `14_FONTES_E_ASSUMPCOES.md` | Fontes, premissas e pontos a confirmar. |
| `TradeK_OS_SPEC_MASTER.md` | Versão consolidada com todos os arquivos acima. |

## Como usar

1. Use `01_PRD_TradeK_OS.md` para alinhamento de produto e escopo.
2. Use `03`, `04`, `05` e `13` para desenhar as telas no Figma.
3. Use `07`, `08` e `09` para orientar backend, IA, banco de dados e CRM.
4. Use `11` para quebrar o projeto em sprints.
5. Use `12` para configurar relatórios e e-mails.

## Decisão de produto

A recomendação é construir a solução como uma **plataforma operacional modular**, não como um simples site com painel. O site será a porta de entrada; o agente IA será o primeiro atendimento; o CRM será o núcleo interno; e a área do cliente será o canal seguro para continuidade, documentos e relacionamento.
