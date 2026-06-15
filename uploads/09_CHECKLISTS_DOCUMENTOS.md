# Checklists e Documentos — TradeK OS

## 1. Objetivo

Padronizar documentos por unidade de negócio e organizar envio, revisão, aprovação e reenvio.

## 2. Status documental

```text
nao_solicitado
solicitado
enviado
em_revisao
aprovado
reprovado
reenvio_solicitado
vencido
```

## 3. Regras gerais

- Todo documento deve estar vinculado a empresa e oportunidade.
- Upload pelo cliente gera notificação ao admin.
- Reprovação exige motivo.
- Reenvio cria nova versão.
- Documento aprovado não deve ser alterado sem autorização.
- Admin pode fazer upload manual.
- Todos os arquivos devem ter log de criação, revisão e usuário.

## 4. Checklist — Supply Chain Finance

### Documentos obrigatórios iniciais

- Contrato Social ou Requerimento de Empresário.
- Cartão CNPJ.
- Comprovante de Endereço.
- RG e CPF do Representante Legal.
- Ficha Cadastral PJ.
- Comprovante de RADAR/Siscomex, se já possuir.
- Invoice, proforma ou pedido do fornecedor, se já houver.
- Dados do fornecedor.
- Dados bancários.
- Referências comerciais.

### Dados cadastrais

#### Dados da empresa

- Razão social.
- Nome fantasia.
- CNPJ.
- Inscrição estadual.
- Inscrição municipal.
- Data de fundação.
- Atividade principal/CNAE.
- Atividade secundária/CNAE.

#### Importações

- Possui RADAR?
- Tipo de RADAR.
- Média de importações.
- Histórico de importações.
- Produtos importados.

#### Endereço comercial

- Rua/Avenida.
- Número.
- Complemento.
- Bairro.
- Cidade.
- Estado.
- CEP.

#### Contato

- Telefone fixo.
- Celular/WhatsApp.
- E-mail principal.
- E-mail secundário.
- Site.

#### Representante legal

- Nome.
- CPF.
- Cargo.
- E-mail.
- Telefone.

#### Dados bancários

- Banco principal.
- Agência.
- Conta.
- Tempo de conta.
- Banco secundário.
- Agência.
- Conta.
- Tempo de conta.

#### Referências comerciais

- Empresa 1.
- Telefone 1.
- Empresa 2.
- Telefone 2.

## 5. Checklist — Procurement Internacional

### Documentos e informações

- Briefing técnico.
- Fotos ou referências do produto.
- Especificações técnicas.
- Volume estimado.
- Orçamento-alvo.
- Prazo desejado.
- Certificações exigidas.
- Mercado de destino.
- Requisitos de embalagem.
- Requisitos de marca própria.
- Critérios de qualidade.
- Fornecedor atual, se houver.
- Histórico de compras, se houver.

### Perguntas complementares

- O produto precisa seguir norma brasileira?
- A empresa precisa de amostra?
- Haverá inspeção?
- Existe limitação de preço?
- Existe fornecedor de referência?
- Qual é a prioridade: preço, qualidade, prazo ou certificação?

## 6. Checklist — Produtos/Motos

### Informações comerciais

- CNPJ.
- Razão social.
- Nome do contato.
- Região de atuação.
- Perfil: distribuidor, revendedor, importador, investidor.
- Modelo de interesse.
- Quantidade estimada.
- Prazo de compra.
- Canal de venda.
- Experiência prévia.
- Necessidade de homologação.
- Dados para proposta.

### Documentos possíveis

- Contrato social.
- Cartão CNPJ.
- Comprovante de endereço.
- Documento do representante legal.
- Plano comercial ou apresentação da empresa.
- Histórico de distribuição/importação, se houver.

## 7. Checklist — Suporte / Importação

- CNPJ.
- Descrição da operação.
- Produto.
- País de origem.
- Fornecedor.
- Incoterm.
- Invoice/proforma.
- Status da carga.
- Dúvida principal.
- Documentos disponíveis.

## 8. Validações

### CNPJ

- Máscara.
- Dígitos válidos.
- Campo obrigatório para avanço a qualificado.

### E-mail

- Formato válido.
- Pode haver e-mail principal e secundário.

### Telefone/WhatsApp

- Máscara brasileira.
- DDI opcional.

### RADAR

Valores:

```text
nao_possui
expresso
limitado
ilimitado
nao_sabe
```

### Tipo de arquivo

Permitidos:

```text
pdf
jpg
jpeg
png
docx
xlsx
```

## 9. Mensagens padrão

### Solicitação de documentos

```text
Olá, {{nome_cliente}}.

Para avançarmos com sua solicitação de {{unidade}}, precisamos que você envie os documentos abaixo pelo portal TradeK:

{{documentos_pendentes}}

Acesse: {{link_portal}}
```

### Documento aprovado

```text
Olá, {{nome_cliente}}.

O documento {{documento}} foi aprovado pela equipe TradeK.
```

### Documento reprovado

```text
Olá, {{nome_cliente}}.

O documento {{documento}} precisa ser reenviado.

Motivo:
{{motivo_reprovacao}}

Acesse o portal para enviar uma nova versão.
```

## 10. Critérios para avançar status

### De Documentos Solicitados para Documentos Recebidos

- Pelo menos um documento enviado.

### De Documentos Recebidos para Em Análise

- Todos os documentos obrigatórios enviados.
- Admin marcou como em revisão ou aprovado.

### De Em Análise para Aprovado para Proposta

- Checklist obrigatório completo.
- Nenhum documento obrigatório reprovado.
- Admin confirmou manualmente.

## 11. Painel de documentos

### Filtros obrigatórios

- Unidade.
- Cliente.
- Empresa.
- Status.
- Tipo de documento.
- Data de envio.
- Vencimento.
- Responsável.

### Ações em massa

- Aprovar selecionados.
- Solicitar reenvio.
- Notificar cliente.
- Exportar lista.
- Baixar arquivos, com permissão.
