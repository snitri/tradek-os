# Relatórios e Templates de E-mail — TradeK OS

## 1. Objetivo

Padronizar relatórios gerados por IA e mensagens automáticas enviadas pela plataforma.

## 2. Tipos de relatório

### Relatório do Lead

Foco: entender rapidamente quem é o lead e o que ele quer.

### Relatório Comercial

Foco: orientar o time de vendas.

### Relatório Operacional

Foco: documentos, importação, RADAR, dados do fornecedor e pendências.

### Relatório Gerencial

Foco: volume, conversão, gargalos, agentes e performance.

## 3. Template — Relatório do Lead

```markdown
# Relatório do Lead — {{empresa}}

## 1. Identificação

- Lead ID: {{lead_id}}
- Data: {{data}}
- Origem: {{origem}}
- Unidade: {{unidade}}
- Empresa: {{empresa}}
- CNPJ: {{cnpj}}
- Contato: {{nome_contato}}
- E-mail: {{email}}
- WhatsApp: {{whatsapp}}

## 2. Resumo executivo

{{resumo_executivo}}

## 3. O que o cliente quer

{{o_que_cliente_quer}}

## 4. O que o cliente não quer / objeções

{{o_que_cliente_nao_quer}}

## 5. Dados coletados

{{dados_coletados}}

## 6. Dados faltantes

{{dados_faltantes}}

## 7. Score

- Score: {{score}}
- Classificação: {{classificacao}}
- Motivo: {{motivo_classificacao}}

## 8. Próxima ação recomendada

{{proxima_acao}}
```

## 4. Template — Relatório Comercial

```markdown
# Relatório Comercial — {{empresa}}

## Resumo

{{resumo_comercial}}

## Potencial

- Valor estimado: {{valor_estimado}}
- Volume estimado: {{volume_estimado}}
- Urgência: {{urgencia}}
- Chance de conversão: {{chance_conversao}}

## Unidade

{{unidade}}

## Abordagem recomendada

{{abordagem_recomendada}}

## Objeções

{{objecoes}}

## Riscos

{{riscos}}

## Próximos passos

{{proximos_passos}}
```

## 5. Template — Relatório Operacional

```markdown
# Relatório Operacional — {{empresa}}

## Operação

- Unidade: {{unidade}}
- Produto: {{produto}}
- Fornecedor: {{fornecedor}}
- País: {{pais}}
- Valor FOB: {{valor_fob}}
- Prazo desejado: {{prazo}}

## Importação

- Possui RADAR: {{possui_radar}}
- Tipo de RADAR: {{tipo_radar}}
- Incoterm: {{incoterm}}
- Documentos comerciais: {{documentos_comerciais}}

## Documentos pendentes

{{documentos_pendentes}}

## Alertas

{{alertas}}

## Próxima ação operacional

{{proxima_acao_operacional}}
```

## 6. Template — Relatório Gerencial

```markdown
# Relatório Gerencial TradeK

## Período

{{periodo}}

## Métricas principais

- Leads recebidos: {{leads_recebidos}}
- Leads qualificados: {{leads_qualificados}}
- Taxa de qualificação: {{taxa_qualificacao}}
- Propostas enviadas: {{propostas_enviadas}}
- Ganhos: {{ganhos}}
- Perdidos: {{perdidos}}

## Leads por unidade

{{leads_por_unidade}}

## Conversão por etapa

{{conversao_por_etapa}}

## Motivos de perda

{{motivos_perda}}

## Performance dos agentes

{{performance_agentes}}

## Recomendações

{{recomendacoes}}
```

## 7. Variáveis globais

```text
{{lead_id}}
{{data}}
{{origem}}
{{unidade}}
{{status}}
{{score}}
{{classificacao}}
{{empresa}}
{{cnpj}}
{{nome_cliente}}
{{nome_contato}}
{{email}}
{{whatsapp}}
{{responsavel}}
{{resumo_ia}}
{{proxima_acao}}
{{link_portal}}
{{documentos_pendentes}}
{{motivo_reprovacao}}
{{link_lead_admin}}
```

## 8. Templates de e-mail

### Novo lead recebido

```text
Assunto: Novo lead recebido — {{unidade}} — {{empresa}}

Olá,

Um novo lead foi recebido na plataforma TradeK OS.

Empresa: {{empresa}}
Contato: {{nome_cliente}}
CNPJ: {{cnpj}}
Unidade: {{unidade}}
Origem: {{origem}}
Score IA: {{score}}

Resumo:
{{resumo_ia}}

Próxima ação:
{{proxima_acao}}

Acessar lead:
{{link_lead_admin}}
```

### Lead qualificado

```text
Assunto: Lead qualificado — {{empresa}} — Score {{score}}

Olá,

A IA classificou este lead como qualificado.

Empresa: {{empresa}}
Unidade: {{unidade}}
Score: {{score}}

O que o cliente quer:
{{o_que_cliente_quer}}

Dados faltantes:
{{dados_faltantes}}

Próxima ação:
{{proxima_acao}}

Acessar:
{{link_lead_admin}}
```

### Convite para área do cliente

```text
Assunto: Acesse seu portal TradeK

Olá, {{nome_cliente}}.

Criamos seu acesso ao portal TradeK para dar continuidade à análise da sua solicitação.

Acesse:
{{link_portal}}

Dentro do portal, você poderá:
- Visualizar sua solicitação.
- Enviar documentos.
- Acompanhar pendências.
- Conversar com a equipe TradeK.

Atenciosamente,
Equipe TradeK
```

### Solicitação de documentos

```text
Assunto: Documentos solicitados — TradeK

Olá, {{nome_cliente}}.

Para avançarmos com sua solicitação de {{unidade}}, precisamos que você envie os seguintes documentos:

{{documentos_pendentes}}

Acesse o portal:
{{link_portal}}

Atenciosamente,
Equipe TradeK
```

### Documento enviado pelo cliente

```text
Assunto: Documento recebido no portal — {{empresa}}

Olá,

O cliente {{empresa}} enviou um novo documento no portal TradeK.

Documento: {{documento}}
Oportunidade: {{unidade}}
Status: Enviado

Acessar:
{{link_lead_admin}}
```

### Documento reprovado

```text
Assunto: Reenvio necessário — {{documento}}

Olá, {{nome_cliente}}.

O documento {{documento}} precisa ser reenviado.

Motivo:
{{motivo_reprovacao}}

Acesse o portal para enviar uma nova versão:
{{link_portal}}
```

### Nova mensagem do cliente

```text
Assunto: Nova mensagem do cliente — {{empresa}}

Olá,

O cliente {{empresa}} enviou uma nova mensagem na oportunidade {{unidade}}.

Mensagem:
{{mensagem}}

Acessar:
{{link_lead_admin}}
```

### Mudança de status

```text
Assunto: Status atualizado — {{empresa}} — {{status}}

Olá,

A oportunidade da empresa {{empresa}} mudou de status.

Novo status:
{{status}}

Responsável:
{{responsavel}}

Próxima ação:
{{proxima_acao}}

Acessar:
{{link_lead_admin}}
```

## 9. Regras de envio

- Toda notificação deve ter log.
- Falhas devem permitir reenvio.
- E-mails podem ser configurados por unidade.
- Alguns eventos podem enviar resumo IA.
- Anexos só devem ser enviados se permitido pela regra.
- Dados sensíveis devem ser evitados em e-mails quando possível.
