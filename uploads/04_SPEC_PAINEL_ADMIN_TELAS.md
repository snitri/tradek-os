# SPEC de Telas — Painel Administrativo

## 1. Conceito

O painel administrativo é o centro operacional da TradeK. Ele combina dashboard, CRM, interações, documentos, clientes, relatórios, produtos, serviços, notificações, IA e configurações.

## 2. Menu lateral

```text
Dashboard
CRM
Interações
Relatórios IA
Empresas & Contatos
Clientes
Documentos
Produtos & Serviços
Cotações / Propostas
Tarefas
Chat
Notificações
Usuários
Configurações
Auditoria
```

## 3. ADM-01 — Login Administrativo

### Objetivo

Acesso seguro dos usuários internos.

### Componentes

- Logo TradeK.
- E-mail.
- Senha.
- Esqueci senha.
- Entrar.
- Opcional: 2FA.

### Regras

- Cliente não acessa por esta tela.
- Tentativas inválidas geram log.
- Sessão expira após inatividade.
- Usuário bloqueado não entra.

## 4. ADM-02 — Dashboard Executivo

### Objetivo

Apresentar visão gerencial do funil, agentes, documentos e pendências.

### KPIs

- Leads novos hoje.
- Leads no mês.
- Leads qualificados.
- Taxa de qualificação.
- Leads por unidade.
- Leads por origem.
- Conversas iniciadas.
- Conversas concluídas.
- Tempo médio de resposta.
- Leads sem responsável.
- Documentos pendentes.
- Propostas enviadas.
- Ganhos.

### Blocos

1. Cards de KPIs.
2. Funil por status.
3. Leads por unidade.
4. Performance de agentes.
5. Pendências críticas.
6. Últimas interações.
7. Tarefas vencidas.
8. Alertas de SLA.

### Ações

- Filtrar período.
- Filtrar unidade.
- Exportar relatório.
- Abrir CRM.
- Abrir leads sem responsável.
- Abrir documentos pendentes.

## 5. ADM-03 — CRM Kanban

### Objetivo

Gerenciar oportunidades visualmente por etapa.

### Colunas recomendadas

1. Novo Lead.
2. Em Qualificação.
3. Dados Incompletos.
4. Qualificado.
5. Documentos Solicitados.
6. Documentos Recebidos.
7. Em Análise.
8. Proposta.
9. Negociação.
10. Ganho.
11. Perdido/Desqualificado.

### Card do lead

Cada card deve mostrar:

- Empresa.
- Contato.
- Unidade.
- Score IA.
- Valor/volume estimado.
- Responsável.
- Última interação.
- Próxima ação.
- Pendência documental.
- Origem.
- Urgência.

### Ações rápidas

- Abrir detalhe.
- Mover status.
- Atribuir responsável.
- Solicitar documento.
- Criar acesso cliente.
- Gerar relatório.
- Desqualificar.
- Criar tarefa.
- Enviar e-mail.
- Abrir chat.

### Regras

- Drag and drop altera status.
- Alteração gera histórico.
- Desqualificar exige motivo.
- Ganho exige valor final ou observação.
- Mover para documentos solicitados pode abrir checklist.
- Mover para qualificado sugere criação de acesso cliente.

## 6. ADM-04 — CRM Lista

### Objetivo

Operação tabular, filtros avançados e exportação.

### Colunas

```text
ID
Data
Empresa
Contato
CNPJ
Unidade
Origem
Score IA
Status
Responsável
Valor estimado
Volume
Última interação
Próxima ação
Documentos pendentes
Cliente portal
```

### Filtros

- Unidade.
- Status.
- Responsável.
- Score mínimo/máximo.
- Origem.
- Data.
- Tem documentos pendentes.
- Tem cliente criado.
- Tem conversa IA.
- Desqualificado por motivo.
- Produto/serviço.

### Ações em massa

- Alterar status.
- Atribuir responsável.
- Enviar e-mail.
- Gerar relatório.
- Exportar.
- Arquivar.
- Criar tarefas.

## 7. ADM-05 — Modal de Detalhe do Lead

### Objetivo

Ser a tela principal de trabalho do comercial.

### Header

- Empresa.
- Contato.
- Status.
- Score.
- Unidade.
- Responsável.
- Botões: salvar, fechar, ações.

### Abas

1. Resumo.
2. Dados do lead.
3. Oportunidade.
4. Qualificação IA.
5. Interações.
6. Documentos.
7. Chat.
8. Relatório.
9. Histórico.

### Aba Resumo

- Resumo executivo IA.
- O que o cliente quer.
- O que o cliente não quer.
- Pendências.
- Próxima ação.
- Riscos.
- Botões rápidos.

### Aba Dados do lead

- Nome.
- Empresa.
- CNPJ.
- E-mail.
- WhatsApp.
- Cargo.
- Cidade/Estado.
- Origem.
- Consentimento LGPD.
- Tags.
- Responsável.

### Aba Oportunidade

Campos comuns:

- Unidade.
- Produto/serviço.
- Valor estimado.
- Volume/quantidade.
- Prazo.
- Urgência.
- Observações.
- Status.

Campos Supply Chain Finance:

- Produto importado.
- Valor FOB.
- Fornecedor.
- País de origem.
- Incoterm.
- Pedido negociado.
- Possui RADAR.
- Tipo de RADAR.
- Média de importações.
- Prazo desejado.
- Documentos disponíveis.
- Banco/seguradora em análise.
- Status da avaliação.

Campos Procurement:

- Categoria.
- Especificações.
- Volume.
- Orçamento-alvo.
- Prazo.
- Certificações.
- Mercado de destino.
- Amostra.
- Inspeção.
- Fornecedor atual.

Campos Produtos/Motos:

- Modelo.
- Quantidade.
- Perfil do comprador.
- Região.
- Canal de venda.
- Necessidade de homologação.
- Experiência em importação.
- Observações comerciais.

### Aba Qualificação IA

- Score total.
- Critérios pontuados.
- Dados faltantes.
- Classificação.
- Recomendações.
- Aprovar qualificação.
- Ajustar score.
- Desqualificar.

### Aba Interações

Timeline com:

- Conversa IA.
- Mensagens do cliente.
- Formulários.
- E-mails enviados.
- Mudanças de status.
- Comentários internos.
- Uploads.
- Relatórios gerados.

### Aba Documentos

- Checklist.
- Documentos solicitados.
- Status.
- Arquivos enviados.
- Versões.
- Aprovar/reprovar.
- Solicitar reenvio.
- Comentários.

### Aba Chat

- Mensagem ao cliente.
- Comentário interno.
- Anexo.
- Templates.
- Sugestão IA.

### Aba Relatório

- Visualizar relatório.
- Regenerar.
- Copiar.
- Exportar PDF.
- Enviar por e-mail.
- Ver versões anteriores.

## 8. ADM-06 — Novo Lead Manual

### Objetivo

Cadastrar oportunidades recebidas por telefone, e-mail, WhatsApp, indicação ou evento.

### Campos

- Nome.
- Empresa.
- CNPJ.
- E-mail.
- WhatsApp.
- Origem.
- Unidade.
- Produto/serviço.
- Valor/volume.
- Observação.
- Responsável.
- Status inicial.
- Tags.

### Pós-salvar

- Rodar qualificação IA.
- Criar relatório inicial.
- Criar tarefa.
- Notificar responsável.

## 9. ADM-07 — Central de Interações

### Objetivo

Concentrar conversas de IA, clientes e administradores.

### Layout

- Lista lateral de conversas.
- Painel central com mensagens.
- Painel direito com lead vinculado.

### Funcionalidades

- Assumir conversa.
- Transferir.
- Vincular a lead existente.
- Converter em lead.
- Marcar resolvida.
- Gerar resumo.
- Responder manualmente.
- Usar sugestão IA.

## 10. ADM-08 — Qualificação IA

### Objetivo

Mostrar detalhamento de pontuação e permitir revisão humana.

### Componentes

- Score.
- Classificação.
- Critérios.
- Dados coletados.
- Dados faltantes.
- Motivos de risco.
- Próxima ação.
- Botões de decisão.

### Decisões

- Aprovar qualificação.
- Solicitar mais informações.
- Solicitar documentos.
- Criar acesso cliente.
- Desqualificar.
- Recalcular score.

## 11. ADM-09 — Documentos e Checklists

### Objetivo

Gerenciar documentos de todos os clientes.

### Filtros

- Unidade.
- Cliente.
- Empresa.
- Status.
- Tipo.
- Vencimento.
- Responsável.

### Status

- Não solicitado.
- Solicitado.
- Enviado.
- Em revisão.
- Aprovado.
- Reprovado.
- Reenvio solicitado.
- Vencido.

## 12. ADM-10 — Empresas & Contatos

### Objetivo

Separar cadastro de empresa, contatos e oportunidades.

### Abas da empresa

- Dados.
- Contatos.
- Oportunidades.
- Documentos.
- Usuários.
- Histórico.

## 13. ADM-11 — Clientes / Acessos

### Objetivo

Gerenciar usuários externos.

### Colunas

- Cliente.
- Empresa.
- E-mail.
- Status acesso.
- Último login.
- Oportunidade vinculada.
- Checklist.
- Ações.

### Ações

- Criar usuário.
- Reenviar convite.
- Resetar senha.
- Bloquear.
- Revogar.
- Vincular oportunidade.
- Ver como cliente.

## 14. ADM-12 — Criar Acesso do Cliente

### Modal

- Nome.
- E-mail.
- Empresa.
- Oportunidade.
- Checklist.
- Mensagem opcional.
- Tipo de convite.

### Regras

- Padrão: convite seguro.
- Alternativa: senha temporária com troca obrigatória.
- Evento registrado no lead.
- E-mail disparado conforme template.

## 15. ADM-13 — Produtos & Serviços

### Produto

- Modelo.
- Categoria.
- Descrição.
- Motor.
- Velocidade.
- Autonomia.
- Bateria.
- Freios.
- Capacidade.
- MOQ.
- Preço base.
- Moeda.
- Condição.
- Imagens.
- Ficha técnica.
- Status.
- Publicar no site.
- Permitir cotação IA.

### Serviço

- Nome.
- Categoria.
- Descrição.
- Público-alvo.
- Perguntas de qualificação.
- Checklist padrão.
- Agente vinculado.
- E-mails notificados.
- Status.

## 16. ADM-14 — Cotações / Propostas

### Status

- Rascunho.
- Aguardando dados.
- Em validação.
- Enviada.
- Aceita.
- Recusada.
- Cancelada.

### Ações

- Gerar proposta.
- Anexar PDF.
- Enviar por e-mail.
- Registrar aceite.
- Registrar recusa.
- Vincular oportunidade.

## 17. ADM-15 — Relatórios IA

### Tipos

- Relatório do lead.
- Relatório comercial.
- Relatório operacional.
- Relatório gerencial.
- Relatório por período.
- Relatório por unidade.

### Funcionalidades

- Filtrar.
- Abrir.
- Regenerar.
- Exportar.
- Enviar.
- Comparar versões.

## 18. ADM-16 — Tarefas e SLA

### Campos

- Título.
- Lead.
- Responsável.
- Prazo.
- Prioridade.
- Status.
- Comentário.
- Checklist vinculado.

### Automações

- Criar tarefa para lead score alto.
- Criar follow-up após X dias sem resposta.
- Alertar tarefa vencida.
- Notificar responsável.

## 19. ADM-17 — Chat

### Tipos de mensagem

- Visível ao cliente.
- Interna.
- Automática.
- IA.
- E-mail registrado.

### Regra

Comentários internos nunca aparecem ao cliente.

## 20. ADM-18 — Notificações

### Eventos configuráveis

- Novo lead.
- Lead qualificado.
- Lead desqualificado.
- Mudança de status.
- Documento enviado.
- Documento aprovado.
- Documento reprovado.
- Nova mensagem.
- Relatório gerado.
- Proposta enviada.
- Lead ganho.
- Lead perdido.

### Campos

- Evento.
- Unidade.
- Status origem.
- Status destino.
- Para.
- CC.
- BCC.
- Template.
- Ativo.
- Enviar resumo IA.
- Enviar anexos.
- Frequência.

## 21. ADM-19 — Templates de E-mail

### Templates iniciais

- Novo lead recebido.
- Lead qualificado.
- Convite cliente.
- Solicitação de documentos.
- Documento recebido.
- Documento reprovado.
- Nova mensagem.
- Proposta enviada.
- Alteração de status.

### Variáveis

```text
{{nome_cliente}}
{{empresa}}
{{cnpj}}
{{unidade}}
{{status}}
{{score}}
{{resumo_ia}}
{{proxima_acao}}
{{link_portal}}
{{documentos_pendentes}}
{{responsavel}}
```

## 22. ADM-20 — Configuração dos Agentes IA

### Abas

- Agente Geral.
- Supply Chain Finance.
- Procurement.
- Produtos/Motos.
- Suporte.
- Regras.
- Base de conhecimento.

### Campos

- Nome.
- Avatar.
- Mensagem inicial.
- Unidade.
- Perguntas obrigatórias.
- Perguntas condicionais.
- Campos de saída.
- Score mínimo.
- Status inicial.
- Checklist acionado.
- Produtos consultáveis.
- Guardrails.

## 23. ADM-21 — Base RAG

### Funcionalidades

- Upload.
- Categoria.
- Unidade.
- Status ativo/inativo.
- Data de validade.
- Teste de resposta.
- Ver trechos recuperados.
- Versionar documento.

## 24. ADM-22 — Usuários e Permissões

### Funcionalidades

- Criar usuário.
- Definir perfil.
- Bloquear.
- Resetar senha.
- Ver último login.
- Permissões por módulo.

## 25. ADM-23 — Auditoria

### Campos do log

- Usuário.
- Ação.
- Entidade.
- Valor anterior.
- Novo valor.
- Data/hora.
- IP.
- Origem.

## 26. ADM-24 — Configurações Gerais

### Seções

- Empresa.
- Status do CRM.
- Unidades.
- Produtos.
- Serviços.
- Checklists.
- Notificações.
- Templates.
- Agentes.
- RAG.
- Segurança.
- LGPD.
- Integrações.
