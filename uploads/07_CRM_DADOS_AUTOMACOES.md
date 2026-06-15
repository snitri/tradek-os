# CRM, Dados, Status e Automações — TradeK OS

## 1. Pipeline recomendado

```text
Novo Lead
Em Qualificação IA
Dados Incompletos
Qualificado
Documentos Solicitados
Documentos Recebidos
Em Análise TradeK
Aprovado para Proposta
Proposta Enviada
Em Negociação
Ganho
Perdido
Desqualificado
Arquivado
```

## 2. Definição dos status

| Status | Definição | Próxima ação típica |
|---|---|---|
| Novo Lead | Lead acabou de entrar. | IA/admin inicia qualificação. |
| Em Qualificação IA | IA coleta ou processa dados. | Completar dados mínimos. |
| Dados Incompletos | Faltam dados críticos. | Solicitar informações. |
| Qualificado | Tem fit inicial e dados mínimos. | Admin assumir. |
| Documentos Solicitados | Checklist enviado ao cliente. | Aguardar upload. |
| Documentos Recebidos | Cliente enviou documentos. | Revisar. |
| Em Análise TradeK | Equipe analisa dados/documentos. | Aprovar, pedir complemento ou reprovar. |
| Aprovado para Proposta | Pode receber proposta. | Gerar proposta. |
| Proposta Enviada | Proposta encaminhada. | Follow-up. |
| Em Negociação | Tratativa ativa. | Negociar. |
| Ganho | Negócio fechado. | Encerrar/operacionalizar. |
| Perdido | Oportunidade perdida. | Registrar motivo. |
| Desqualificado | Não possui fit. | Arquivar ou nutrir. |
| Arquivado | Sem ação ativa. | Manter histórico. |

## 3. Entidades de dados

### Lead / Oportunidade

```yaml
lead:
  id: uuid
  data_criacao: datetime
  origem: enum
  unidade: enum
  status: enum
  score_ia: integer
  classificacao: enum
  responsavel_id: uuid
  empresa_id: uuid
  contato_id: uuid
  produto_servico_interesse: string
  valor_estimado: decimal
  moeda_valor_estimado: string
  volume_estimado: string
  prazo_desejado: string
  urgencia: enum
  resumo_ia: text
  o_que_cliente_quer: text
  o_que_cliente_nao_quer: text
  dados_coletados: json
  dados_faltantes: json
  pendencias: json
  riscos: json
  proxima_acao: text
  motivo_desqualificacao: enum
  motivo_perda: enum
  tags: array
  ultimo_contato_em: datetime
  proxima_tarefa_em: datetime
  cliente_portal_criado: boolean
  consentimento_lgpd: boolean
```

### Empresa

```yaml
empresa:
  id: uuid
  razao_social: string
  nome_fantasia: string
  cnpj: string
  inscricao_estadual: string
  inscricao_municipal: string
  data_fundacao: date
  cnae_principal: string
  cnae_secundario: string
  possui_radar: boolean
  tipo_radar: enum
  media_importacoes: string
  endereco: object
  site: string
  observacoes: text
```

### Contato

```yaml
contato:
  id: uuid
  empresa_id: uuid
  nome: string
  cargo: string
  email: string
  telefone: string
  whatsapp: string
  cpf_opcional: string
  tipo: enum
  principal: boolean
```

### Documento

```yaml
documento:
  id: uuid
  empresa_id: uuid
  lead_id: uuid
  cliente_id: uuid
  tipo_documento: enum
  nome_original: string
  arquivo_url: string
  storage_key: string
  status: enum
  versao: integer
  enviado_em: datetime
  revisado_em: datetime
  revisado_por: uuid
  motivo_reprovacao: text
  observacoes: text
  hash_arquivo: string
```

### Checklist

```yaml
checklist:
  id: uuid
  nome: string
  unidade: enum
  ativo: boolean
  itens:
    - tipo_documento: enum
      obrigatorio: boolean
      descricao: text
      formatos_aceitos: array
```

### Interação

```yaml
interacao:
  id: uuid
  lead_id: uuid
  canal: enum
  tipo: enum
  autor_tipo: enum
  autor_id: uuid
  mensagem: text
  anexos: array
  visivel_cliente: boolean
  criado_em: datetime
```

### Relatório IA

```yaml
relatorio_ia:
  id: uuid
  lead_id: uuid
  tipo: enum
  conteudo: markdown
  score: integer
  modelo_ia: string
  prompt_version: string
  gerado_em: datetime
  gerado_por: enum
  enviado_por_email: boolean
  versao: integer
```

### Produto

```yaml
produto:
  id: uuid
  modelo: string
  categoria: string
  descricao_curta: text
  descricao_completa: text
  motor: string
  velocidade: string
  autonomia: string
  bateria: string
  freios: string
  capacidade: string
  moq: string
  preco_base: decimal
  moeda: string
  condicao_comercial: string
  status: enum
  publicado_site: boolean
  permitir_cotacao_ia: boolean
```

### Regra de notificação

```yaml
notification_rule:
  id: uuid
  nome: string
  evento: enum
  unidade: enum
  status_origem: enum
  status_destino: enum
  emails_para: array
  emails_cc: array
  emails_bcc: array
  template_id: uuid
  ativo: boolean
  enviar_resumo_ia: boolean
  enviar_anexos: boolean
  frequencia: enum
```

### Tarefa

```yaml
tarefa:
  id: uuid
  lead_id: uuid
  titulo: string
  descricao: text
  responsavel_id: uuid
  prazo: datetime
  prioridade: enum
  status: enum
  criada_por: uuid
  concluida_em: datetime
```

## 4. Origens de lead

```text
site_chat_ia
formulario_site
cadastro_manual
email
whatsapp
indicacao
evento
trafego_pago
importacao_manual
outro
```

## 5. Unidades

```text
supply_chain_finance
procurement
produtos_motos
suporte_importacao
outro
```

## 6. Score de qualificação

| Critério | Pontos |
|---|---:|
| Nome e contato válido | 10 |
| Empresa identificada | 10 |
| CNPJ informado | 15 |
| Unidade clara | 10 |
| Demanda clara | 15 |
| Valor/volume/quantidade informado | 15 |
| Prazo/urgência informado | 10 |
| Perfil compatível | 15 |
| Documentos iniciais disponíveis | 10 |

## 7. Classificação

| Score | Classificação | Status sugerido |
|---:|---|---|
| 80–100 | Muito qualificado | Qualificado |
| 60–79 | Qualificado | Qualificado ou Dados Incompletos |
| 40–59 | Parcial | Dados Incompletos |
| 0–39 | Baixo fit | Desqualificado/Nutrição |

## 8. Motivos de desqualificação

```text
sem_cnpj
pessoa_fisica_sem_fit
sem_demanda_real
produto_fora_escopo
volume_muito_baixo
sem_orcamento
sem_resposta
regiao_nao_atendida
duplicado
teste_spam
outro
```

## 9. Eventos de automação

```text
lead.created
lead.updated
lead.qualified
lead.disqualified
lead.status_changed
lead.assigned
lead.document_requested
lead.document_uploaded
lead.document_approved
lead.document_rejected
client.user_created
client.invite_sent
client.message_sent
admin.message_sent
report.generated
proposal.created
proposal.sent
opportunity.won
opportunity.lost
task.created
task.overdue
```

## 10. Regras automáticas

### Novo lead criado

1. Criar registro.
2. Salvar origem.
3. Salvar conversa/formulário.
4. Classificar unidade.
5. Calcular score.
6. Gerar relatório.
7. Notificar e-mails configurados.
8. Criar tarefa se score >= 60.

### Lead qualificado

1. Alterar status.
2. Notificar responsável.
3. Sugerir checklist.
4. Exibir botão “Criar acesso cliente”.
5. Criar tarefa de contato.

### Cliente criado

1. Criar usuário.
2. Vincular empresa.
3. Vincular lead.
4. Aplicar permissões.
5. Enviar convite.
6. Registrar histórico.

### Documento enviado

1. Salvar arquivo.
2. Atualizar checklist.
3. Notificar responsável.
4. Criar interação automática.
5. Atualizar status do documento.

### Mudança de status

1. Registrar status anterior.
2. Registrar novo status.
3. Registrar usuário.
4. Verificar regra de e-mail.
5. Notificar destinatários.
6. Atualizar métricas.
