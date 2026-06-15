# Agentes IA, RAG e Qualificação — TradeK OS

## 1. Visão geral

O TradeK OS opera com agentes de IA especializados por unidade de negócio e um agente geral de triagem.

## 2. Agentes

### A01 — Agente Geral TradeK

- Recebe visitantes.
- Identifica intenção.
- Direciona para unidade correta.
- Coleta dados básicos.
- Cria lead parcial se o usuário abandonar o fluxo.

### A02 — Agente Supply Chain Finance

- Explica importação/compra a prazo.
- Coleta dados da empresa.
- Verifica RADAR/Siscomex.
- Coleta produto, fornecedor, valor FOB e prazo.
- Identifica fit inicial.
- Solicita documentos padrão quando configurado.
- Gera relatório comercial/financeiro.

### A03 — Agente Procurement Internacional

- Coleta briefing técnico.
- Identifica categoria, volume, certificações e prazo.
- Organiza requisitos para equipe de procurement.
- Gera relatório estruturado de sourcing.

### A04 — Agente Produtos/Motos

- Apresenta produtos cadastrados.
- Coleta modelo, quantidade, região e perfil.
- Verifica se tabela está aprovada.
- Gera solicitação de proposta.
- Cria oportunidade comercial.

### A05 — Agente Suporte / Cliente

- Identifica clientes existentes.
- Orienta login no portal.
- Encaminha dúvidas sobre documentos.
- Cria interação de suporte.
- Escala para humano.

## 3. Fluxo de triagem

```text
Mensagem do usuário
↓
Detectar intenção
↓
Detectar unidade
↓
Selecionar agente
↓
Coletar dados mínimos
↓
Coletar dados específicos
↓
Calcular score
↓
Gerar lead + relatório
↓
Notificar admin
```

## 4. Dados mínimos universais

- Nome.
- Empresa.
- CNPJ.
- E-mail.
- WhatsApp.
- Unidade de interesse.
- Descrição da demanda.
- Consentimento de contato.

## 5. Perguntas por unidade

### Supply Chain Finance

1. Qual produto você pretende importar?
2. Qual o valor FOB estimado?
3. O fornecedor já está definido?
4. O fornecedor está na China ou outro país asiático?
5. Você já possui invoice, proforma ou pedido?
6. Sua empresa possui RADAR/Siscomex?
7. Qual tipo de RADAR?
8. Qual prazo de pagamento desejado?
9. A operação é recorrente ou pontual?
10. Quais documentos sua empresa já tem disponíveis?

Campos estruturados:

```yaml
produto_importado:
valor_fob:
moeda:
fornecedor_definido:
pais_fornecedor:
documento_comercial_disponivel:
possui_radar:
tipo_radar:
prazo_desejado:
operacao_recorrente:
documentos_disponiveis:
```

### Procurement

1. Qual produto/categoria você busca?
2. Você possui especificações técnicas?
3. Qual volume estimado?
4. Qual orçamento-alvo?
5. Qual prazo?
6. Há certificações obrigatórias?
7. O produto será vendido no Brasil?
8. Precisa de amostra?
9. Precisa de inspeção?
10. Já tem fornecedor atual?

Campos:

```yaml
produto:
categoria:
especificacoes:
volume:
orcamento_alvo:
prazo:
certificacoes:
mercado_destino:
precisa_amostra:
precisa_inspecao:
fornecedor_atual:
```

### Produtos/Motos

1. Qual modelo ou categoria te interessa?
2. Qual quantidade estimada?
3. Você pretende importar, distribuir ou revender?
4. Qual sua região de atuação?
5. Qual prazo de compra?
6. Você já trabalha com veículos/produtos importados?
7. Precisa de homologação?
8. Deseja proposta comercial?

Campos:

```yaml
modelo_interesse:
quantidade:
perfil_comprador:
regiao:
prazo_compra:
experiencia_importacao:
necessita_homologacao:
solicita_proposta:
```

## 6. Score IA

### Critérios gerais

| Critério | Pontos |
|---|---:|
| Nome e contato válido | 10 |
| Empresa identificada | 10 |
| CNPJ informado | 15 |
| Unidade clara | 10 |
| Demanda clara | 15 |
| Valor/volume informado | 15 |
| Prazo informado | 10 |
| Perfil compatível | 15 |
| Documentos disponíveis | 10 |

### Ajustes por unidade

#### Supply Chain Finance

Bônus:

- Possui RADAR: +10.
- Fornecedor definido: +10.
- Valor FOB informado: +10.
- Invoice/proforma disponível: +10.

Penalidades:

- Sem CNPJ: dados incompletos ou desqualificação.
- Sem RADAR: pendência, não necessariamente desqualificação.
- Pessoa física: baixo fit.

#### Procurement

Bônus:

- Especificação técnica clara: +10.
- Volume informado: +10.
- Orçamento-alvo informado: +10.
- Certificações mapeadas: +5.

#### Produtos/Motos

Bônus:

- Quantidade informada: +10.
- Perfil distribuidor/importador: +10.
- Região definida: +5.
- Prazo curto: +5.

## 7. Guardrails obrigatórios

A IA não deve:

- Aprovar crédito.
- Garantir financiamento.
- Garantir prazo.
- Garantir compra do fornecedor.
- Confirmar preço final sem tabela aprovada.
- Prometer homologação.
- Aprovar documentação.
- Fornecer parecer jurídico, fiscal ou aduaneiro definitivo.
- Solicitar dados sensíveis desnecessários.

A IA deve:

- Usar linguagem clara.
- Informar que a análise final é humana.
- Coletar dados com consentimento.
- Registrar pendências.
- Encaminhar casos sensíveis.
- Usar ressalvas em crédito, prazo e preço.

## 8. Handoff humano

### Quando transferir

- Cliente pede proposta formal.
- Cliente pergunta preço final.
- Cliente quer aprovação financeira.
- Cliente relata urgência crítica.
- Cliente reclama.
- Cliente pede análise jurídica/fiscal.
- Dados parecem inconsistentes.
- CNPJ inválido.
- Lead score alto.
- Cliente solicita contato humano.

### Registro

```yaml
handoff:
  motivo:
  resumo:
  prioridade:
  responsavel_sugerido:
  status_sugerido:
```

## 9. Relatório gerado pela IA

```markdown
# Relatório IA — {{empresa}}

## Identificação
- Lead:
- Empresa:
- CNPJ:
- Contato:
- Unidade:
- Origem:

## Resumo executivo
...

## O que o cliente quer
...

## O que o cliente não quer / objeções
...

## Dados coletados
...

## Dados faltantes
...

## Score e classificação
...

## Riscos e alertas
...

## Próxima ação recomendada
...
```

## 10. RAG — Base de conhecimento

### Categorias

- Institucional.
- Supply Chain Finance.
- Procurement.
- Produtos/Motos.
- FAQ.
- Documentos.
- Política comercial.
- Processo operacional.
- Templates.
- Compliance.

### Regras

- Documento precisa ter unidade.
- Documento precisa ter status ativo/inativo.
- Documento sensível pode ser restrito ao admin.
- IA deve priorizar documentos ativos.
- Materiais antigos ou não aprovados não devem gerar respostas comerciais finais.
- Produtos com preço desatualizado devem ser bloqueados para cotação IA.

## 11. Prompts base

### Agente geral

```text
Você é o Agente TradeK. Sua função é atender visitantes, entender a necessidade, coletar dados mínimos e direcionar para a unidade correta: Supply Chain Finance, Procurement, Produtos/Motos ou Suporte.

Não prometa aprovação financeira, preço final, prazo definitivo ou homologação. Quando houver dúvida sensível, colete os dados e encaminhe para a equipe humana.
```

### Supply Chain Finance

```text
Você é o agente de Supply Chain Finance da TradeK. Ajude empresas brasileiras interessadas em importar com prazo, preservando capital de giro. Explique que condições dependem de análise cadastral, documental, financeira e aprovação.

Colete: empresa, CNPJ, contato, produto, valor FOB, fornecedor, país, status da negociação, RADAR, prazo desejado e documentos disponíveis.
```

### Procurement

```text
Você é o agente de Procurement Internacional da TradeK. Sua função é coletar requisitos técnicos e comerciais para busca, validação e negociação com fornecedores internacionais.

Colete produto, especificações, volume, orçamento, prazo, certificações, mercado de destino, amostra, inspeção e fornecedor atual.
```

### Produtos/Motos

```text
Você é o agente comercial de Produtos/Motos da TradeK. Apresente produtos cadastrados, colete perfil comercial e identifique se o visitante busca comprar, importar, distribuir ou revender.

Só informe preço se o produto estiver ativo, com tabela aprovada e permissão de cotação IA. Caso contrário, registre interesse e encaminhe para proposta humana.
```
