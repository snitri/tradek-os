# Backlog, Roadmap e Critérios de Aceite — TradeK OS

## 1. Estratégia de entrega

O TradeK OS deve ser entregue em fases para reduzir risco e gerar valor rápido.

## 2. MVP 1 — Captação, IA e CRM

### Objetivo

Colocar no ar a porta de entrada comercial e o CRM interno.

### Entregas

- Site público básico.
- Widget do agente IA.
- Formulário fallback.
- CRM Kanban.
- CRM lista.
- Modal de lead.
- Relatório IA.
- Notificações por e-mail.
- Dashboard básico.
- Usuários admin.
- Cadastro manual de lead.

### EPIC-01 — Site público

User stories:

- Como visitante, quero entender as soluções da TradeK.
- Como visitante, quero escolher uma unidade de negócio.
- Como visitante, quero falar com o agente IA.
- Como visitante, quero enviar formulário se não usar o chat.

Critérios de aceite:

- Páginas responsivas.
- CTAs funcionando.
- Formulário cria lead.
- Consentimento registrado.

### EPIC-02 — Agente IA

User stories:

- Como visitante, quero conversar com um agente que entenda minha necessidade.
- Como TradeK, quero que a IA colete dados antes do contato humano.
- Como admin, quero receber resumo da conversa.

Critérios de aceite:

- IA identifica unidade.
- IA coleta dados mínimos.
- IA gera score.
- IA cria lead.
- IA gera relatório.

### EPIC-03 — CRM interno

User stories:

- Como admin, quero ver leads em Kanban.
- Como admin, quero ver leads em lista.
- Como admin, quero abrir detalhes do lead.
- Como admin, quero mudar status.

Critérios de aceite:

- Kanban com colunas configuradas.
- Drag and drop muda status.
- Lista com filtros.
- Modal com abas.
- Histórico salva mudanças.

### EPIC-04 — Notificações

User stories:

- Como administrador, quero configurar e-mails por evento.
- Como equipe comercial, quero receber dados de novos leads.

Critérios de aceite:

- Evento `lead.created` envia e-mail.
- Evento `lead.qualified` envia e-mail.
- Configuração aceita múltiplos e-mails.
- Logs de envio disponíveis.

## 3. MVP 2 — Área do cliente e documentos

### Objetivo

Permitir continuidade operacional de leads qualificados.

### Entregas

- Criação de usuário cliente.
- Convite por e-mail.
- Login do cliente.
- Dashboard cliente.
- Checklist de documentos.
- Upload.
- Revisão admin.
- Chat cliente-admin.
- Notificações documentais.

### EPIC-05 — Usuário cliente

User stories:

- Como admin, quero criar acesso para cliente qualificado.
- Como cliente, quero receber convite.
- Como cliente, quero criar senha.

Critérios de aceite:

- Admin cria acesso pelo lead.
- Cliente recebe e-mail.
- Token de convite funciona.
- Cliente só vê seus dados.

### EPIC-06 — Documentos

User stories:

- Como admin, quero solicitar documentos.
- Como cliente, quero enviar documentos.
- Como admin, quero aprovar/reprovar documentos.

Critérios de aceite:

- Checklist aparece no portal.
- Upload valida tipo e tamanho.
- Admin recebe notificação.
- Reprovação exige motivo.
- Histórico de versões salvo.

### EPIC-07 — Chat

User stories:

- Como cliente, quero falar com a TradeK.
- Como admin, quero manter mensagens registradas.
- Como admin, quero separar comentário interno de mensagem ao cliente.

Critérios de aceite:

- Chat por oportunidade.
- Mensagens visíveis/internas separadas.
- Anexos suportados.
- Histórico completo.

## 4. MVP 3 — Produtos, propostas e operação avançada

### Objetivo

Ampliar controle comercial, catálogo e relatórios.

### Entregas

- Cadastro de produtos.
- Catálogo público dinâmico.
- Cotações/propostas.
- Templates de e-mail avançados.
- RAG editável.
- Auditoria completa.
- Tarefas e SLA.
- Relatórios gerenciais.

### EPIC-08 — Produtos

User stories:

- Como admin, quero cadastrar modelos.
- Como visitante, quero comparar produtos.
- Como agente IA, quero consultar produtos aprovados.

Critérios de aceite:

- Produto com status.
- Produto publicado aparece no site.
- Produto oculto não aparece.
- IA só fala preço se permitido.

### EPIC-09 — Propostas

User stories:

- Como comercial, quero gerar proposta.
- Como cliente, quero receber proposta.
- Como admin, quero acompanhar status.

Critérios de aceite:

- Proposta vinculada ao lead.
- PDF anexável.
- Status de proposta.
- Envio por e-mail logado.

### EPIC-10 — Relatórios gerenciais

User stories:

- Como gestor, quero ver conversão por etapa.
- Como gestor, quero entender motivos de perda.
- Como gestor, quero medir performance dos agentes.

Critérios de aceite:

- Relatório por período.
- Relatório por unidade.
- Exportação.
- Métricas de IA.

## 5. Priorização MoSCoW

### Must have

- Site.
- Agente IA.
- CRM Kanban.
- CRM lista.
- Modal lead.
- Relatório IA.
- Notificação por e-mail.
- Usuários admin.
- Status e histórico.

### Should have

- Área do cliente.
- Upload documentos.
- Chat.
- Checklist.
- Produtos.
- Tarefas/SLA.

### Could have

- Propostas automáticas.
- RAG editável completo.
- Auditoria avançada.
- Dashboard gerencial avançado.
- Integração WhatsApp.

### Won't have no MVP

- Aprovação automática de crédito.
- Integração bancária.
- Siscomex.
- E-commerce transacional.
- Assinatura digital.

## 6. Critérios globais de aceite

- O site cria leads no CRM.
- O agente gera relatório.
- O admin consegue gerenciar o lead do início ao fim.
- O CRM tem Kanban e lista.
- O admin pode configurar e-mails.
- O cliente consegue acessar portal e enviar documentos.
- Todas as ações importantes têm histórico.
- A IA respeita guardrails.
- Dados do cliente são segregados.
- Sistema é responsivo e utilizável.

## 7. Definition of Done

Uma funcionalidade só é considerada pronta quando:

- UI implementada.
- Backend funcionando.
- Permissões aplicadas.
- Logs implementados, se crítico.
- Testes básicos realizados.
- Fluxo validado em desktop e mobile.
- Texto revisado.
- Erros tratados.
- Documentação atualizada.
