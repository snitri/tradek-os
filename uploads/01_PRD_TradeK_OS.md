# PRD — TradeK OS

**Versão:** v0.1  
**Data:** 2026-06-14  
**Produto:** TradeK OS — Plataforma de Gestão Comercial, IA e Operações Internacionais

## 1. Resumo executivo

O **TradeK OS** é uma plataforma digital para transformar a presença online da TradeK em um hub ativo de geração, qualificação e gestão de oportunidades comerciais.

A solução combina:

- Site público responsivo.
- Agente IA flutuante no site.
- Qualificação automática de leads.
- CRM interno com Kanban e lista.
- Painel administrativo.
- Área do cliente.
- Gestão documental.
- Relatórios comerciais e operacionais por IA.
- Notificações por e-mail configuráveis.
- Base de conhecimento/RAG.
- Cadastro de produtos e serviços.

## 2. Contexto

A TradeK atua em negócios internacionais, principalmente China/Brasil, com frentes como:

1. **Supply Chain Finance**.
2. **Procurement Internacional**.
3. **Motos Elétricas / Produtos**.
4. **Suporte à importação e orientação operacional**.

O material operacional descreve uma operação de Supply Chain Finance com análise documental, avaliação bancária, pagamento ao fornecedor na Ásia, prazo estendido de 90 a 180 dias, possibilidade de financiamento de até 100% do FOB e necessidade de RADAR/Siscomex para importação.

## 3. Problema

Os contatos comerciais podem chegar por site, formulário, chat, WhatsApp, indicação ou cadastro manual. Sem uma plataforma central, a equipe pode ter:

- Leads incompletos.
- Falta de priorização.
- Perda de histórico.
- Documentos espalhados.
- Retrabalho de cadastro.
- Notificações manuais.
- Baixa visibilidade do funil.
- Dificuldade para saber o que o cliente quer, não quer e o que falta para avançar.

## 4. Objetivos

### Objetivos de negócio

- Aumentar volume de oportunidades qualificadas.
- Reduzir tempo entre primeiro contato e ação comercial.
- Centralizar informações de leads, empresas e clientes.
- Organizar documentação e comunicação.
- Aumentar previsibilidade do funil.
- Criar base escalável para novas unidades e produtos.

### Objetivos do usuário visitante

- Entender rapidamente os serviços.
- Conversar com o Agente TradeK.
- Informar dados de forma simples.
- Receber direcionamento claro.

### Objetivos do administrador

- Visualizar todos os leads.
- Gerenciar oportunidades em Kanban e lista.
- Qualificar, desqualificar, atribuir e mover status.
- Criar acesso do cliente.
- Solicitar documentos.
- Gerar relatórios.
- Configurar e-mails de notificação.

### Objetivos do cliente logado

- Acessar portal seguro.
- Enviar documentos.
- Preencher ficha cadastral.
- Conversar com a TradeK.
- Acompanhar pendências e status geral.

## 5. Personas

### Importador brasileiro

Empresa que busca importar da China/Ásia com prazo de pagamento, preservação de capital de giro e apoio operacional.

### Empresa buscando fornecedor

Empresa que precisa encontrar, validar ou negociar com fornecedores chineses.

### Distribuidor/revendedor de produtos ou motos

Empresa interessada em comprar, importar, distribuir ou revender produtos representados pela TradeK.

### Administrador comercial

Usuário interno que gerencia funil, oportunidades, tarefas e relacionamento.

### Administrador operacional/financeiro

Usuário interno que analisa documentos, cadastro, importação, RADAR e viabilidade operacional.

### Cliente logado

Lead qualificado que recebeu acesso para enviar documentação e continuar o processo.

## 6. Proposta de valor

Para a TradeK, o produto centraliza captação, IA, CRM, documentos, relatórios e notificações. Para o cliente, torna o processo mais claro, organizado e seguro.

## 7. Escopo do produto

### Site público

- Home.
- Página Supply Chain Finance.
- Página Procurement.
- Página Motos/Produtos.
- Sobre.
- FAQ.
- Contato.
- Widget IA.
- Formulário fallback.
- Página de obrigado.

### Painel administrativo

- Dashboard executivo.
- CRM Kanban.
- CRM lista.
- Modal de lead.
- Central de interações.
- Relatórios IA.
- Empresas e contatos.
- Clientes e acessos.
- Documentos.
- Produtos e serviços.
- Propostas.
- Tarefas/SLA.
- Chat.
- Notificações.
- Templates.
- Agentes IA.
- Base RAG.
- Usuários e permissões.
- Auditoria.

### Área do cliente

- Login.
- Primeiro acesso.
- Dashboard.
- Oportunidades.
- Checklist de documentos.
- Upload.
- Ficha cadastral.
- Chat.
- Notificações.
- Perfil.

## 8. Fora do MVP inicial

- Aprovação automática de crédito.
- Integração bancária real.
- Cálculo automático de impostos/frete.
- Portal de fornecedor chinês.
- Assinatura digital integrada.
- E-commerce transacional.
- Cotação definitiva sem validação humana.
- Integração direta com Siscomex.
- Motor financeiro complexo.

## 9. Métricas de sucesso

### Comerciais

- Leads captados por período.
- Leads por unidade.
- Taxa de qualificação.
- Conversão por etapa.
- Tempo até primeiro contato humano.
- Valor estimado por pipeline.
- Motivos de perda/desqualificação.

### Operacionais

- Documentos solicitados.
- Documentos enviados.
- Tempo médio de revisão documental.
- Pendências por oportunidade.
- Clientes com checklist completo.
- SLA por responsável.

### IA

- Conversas iniciadas.
- Conversas concluídas.
- Leads criados pela IA.
- Percentual de leads com dados mínimos.
- Score médio por unidade.
- Handoffs para humano.
- Falhas de classificação.

## 10. Estratégia de MVP

### MVP 1 — Captação + CRM

- Site com agente IA.
- Formulário fallback.
- CRM Kanban e lista.
- Modal de lead.
- Relatório IA.
- Notificação por e-mail.
- Dashboard básico.
- Cadastro manual.
- Usuários admin.

### MVP 2 — Cliente + documentos

- Criação de usuário cliente.
- Convite por e-mail.
- Portal do cliente.
- Checklist documental.
- Upload.
- Chat admin-cliente.
- Aprovação/reprovação.

### MVP 3 — Avançado

- Produtos dinâmicos.
- Propostas/cotações.
- Relatórios gerenciais.
- RAG editável.
- Templates avançados.
- Tarefas/SLA.
- Auditoria completa.
- Integrações externas.

## 11. Requisitos críticos

1. O agente IA deve criar lead no CRM.
2. O admin deve visualizar leads em Kanban e lista.
3. Todo lead deve ter histórico.
4. Mudanças de status devem ser auditadas.
5. O admin deve poder criar acesso de cliente.
6. O cliente deve poder enviar documentos.
7. O admin deve aprovar/reprovar documentos.
8. A plataforma deve gerar relatório sobre o que o cliente quer, não quer, dados faltantes e próxima ação.
9. E-mails devem ser configuráveis por evento e unidade.
10. Cliente só pode ver seus próprios dados.

## 12. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---:|---|
| IA prometer aprovação financeira | Alto | Guardrails e revisão humana. |
| Dados sensíveis expostos | Alto | Permissões, segregação e auditoria. |
| Documentos sem rastreabilidade | Alto | Versionamento e histórico. |
| Escopo grande | Médio | Entrega em MVPs. |
| Preços desatualizados | Médio | Controle de tabela aprovada. |
| E-mails enviados para setor errado | Médio | Regras configuráveis e log. |
