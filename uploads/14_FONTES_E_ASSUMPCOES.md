# Fontes, Premissas e Pontos a Confirmar

## 1. Fontes usadas

Este pacote foi elaborado com base em:

1. Conversa de briefing sobre TradeK OS.
2. Proposta Flow IA / TradeK — Hub Inteligente de Negócios.
3. RAG Descritivo TradeK.
4. Planilha `Recommend quotation for Bazil (003).xlsx`.
5. Conteúdo conceitual reaproveitável do site antigo da TradeK informado no briefing.

## 2. Pontos extraídos da proposta Flow IA

A proposta define um projeto com:

- Site institucional responsivo.
- Agente IA Supply Chain Finance.
- Agente IA Procurement.
- Agente IA Motos Elétricas.
- Relatórios comerciais automáticos.
- Gestão automatizada de leads.
- Painel de métricas.
- Três unidades de negócio com agentes dedicados.

## 3. Pontos extraídos do RAG Descritivo TradeK

O RAG operacional descreve:

- TradeK como facilitadora de importação da China.
- Solução principal de Supply Chain Finance.
- Análise documental e avaliação bancária.
- Compra à vista do fornecedor por banco parceiro na Ásia.
- Prazo de pagamento de 90 a 180 dias, conforme crédito aprovado.
- Financiamento de até 100% do FOB.
- Importância do RADAR/Siscomex.
- Ficha cadastral PJ.
- Documentos necessários como contrato social, cartão CNPJ, comprovante de endereço e RG/CPF do representante legal.

## 4. Pontos extraídos da planilha de produtos

A planilha traz modelos:

- X21.
- Bubble.
- Number Nine.
- ZH3.
- GE.
- HY.
- DF17.

Com dados de motor, velocidade, autonomia, freios, bateria, condição `One container` e valor base informado.

## 5. Premissas adotadas

- O projeto deve ser tratado como plataforma modular.
- O CRM será interno ao painel, mesmo que possa integrar com Notion ou outro CRM futuramente.
- A IA qualifica, mas decisões críticas continuam humanas.
- Cliente só acessa portal quando admin criar usuário/convite.
- E-mails de notificação são configuráveis por evento e unidade.
- Produtos têm gestão dinâmica no admin.
- Preços de produtos só podem ser usados pela IA quando aprovados.

## 6. Pontos a confirmar antes de desenvolvimento

### Negócio

- A TradeK continuará oferecendo prazo de 90 a 180 dias?
- A condição “até 100% do FOB” permanece válida?
- Quais bancos/parceiros/seguradoras devem ser mencionados publicamente?
- O RADAR será requisito obrigatório ou apenas orientação?
- Quais são as regras comerciais finais de Supply Chain Finance?

### Produtos

- Quais modelos serão publicados no site?
- Qual a moeda dos valores da planilha?
- Qual Incoterm/condição dos preços?
- Quais imagens oficiais podem ser usadas?
- Existe ficha técnica completa?
- A IA pode gerar cotação preliminar ou apenas registrar interesse?

### Operação

- Quem são os usuários internos por setor?
- Quais e-mails receberão cada tipo de lead?
- Quais status devem existir no CRM final?
- O Notion será mantido ou substituído por CRM próprio?
- O WhatsApp entra no MVP?

### Área do cliente

- Convite seguro ou senha temporária?
- Quais documentos são obrigatórios por unidade?
- Qual limite de tamanho por upload?
- Quais arquivos o cliente pode baixar?
- O cliente verá propostas dentro do portal?

### Compliance

- Texto final de LGPD.
- Política de privacidade.
- Termos de uso do portal.
- Regras de retenção de documentos.
- Controle de acesso a dados sensíveis.
