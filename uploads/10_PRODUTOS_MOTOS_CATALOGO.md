# Produtos / Motos — Catálogo Inicial e Regras

## 1. Objetivo

Definir como o módulo de produtos deve funcionar no TradeK OS e registrar a base inicial extraída da planilha anexada `Recommend quotation for Bazil (003).xlsx`.

> Observação: os preços/valores da planilha devem ser tratados como **base interna inicial**. Antes de publicar no site ou permitir cotação por IA, confirmar moeda, condição comercial, validade, MOQ, frete, impostos, homologação e margem.

## 2. Regra de produto dinâmico

O site público e o agente IA não devem depender de produtos fixos no código. Tudo deve vir do painel administrativo.

## 3. Campos do produto

```yaml
produto:
  modelo:
  categoria:
  descricao_curta:
  descricao_completa:
  motor:
  velocidade:
  autonomia:
  bateria:
  freios:
  controlador:
  capacidade:
  moq:
  preco_base:
  moeda:
  condicao_comercial:
  imagens:
  ficha_tecnica:
  status:
  publicado_site:
  permitir_cotacao_ia:
  tabela_aprovada:
```

## 4. Status do produto

```text
rascunho
em_revisao
publicado
oculto
descontinuado
```

## 5. Regras para IA falar preço

A IA só pode informar preço se:

1. Produto estiver publicado.
2. `permitir_cotacao_ia = true`.
3. `tabela_aprovada = true`.
4. Moeda e condição comercial estiverem preenchidas.
5. A data de validade da tabela não estiver vencida.

Caso contrário, a IA deve responder:

```text
Tenho as informações técnicas iniciais desse modelo, mas a proposta comercial precisa ser validada pela equipe TradeK. Vou registrar sua solicitação e encaminhar para retorno.
```

## 6. Catálogo inicial extraído da planilha

| Modelo | Motor | Velocidade | Autonomia | Freios | Bateria | MOQ / Condição | Valor base informado |
|---|---:|---:|---:|---|---|---|---:|
| X21 | 1000W | 50 km/h | 50 km | Disco dianteiro e traseiro | 60V-20AH Lithium Battery | One container | 439 |
| Bubble | 500W | 40 km/h | 40 km | Tambor dianteiro e traseiro | 48V-20AH Lithium Battery | One container | 157 |
| Number Nine | 800W | 45 km/h | 40 km | Tambor dianteiro e traseiro | 48V-20AH Lithium Battery | One container | 236 |
| ZH3 | 1000W | 50 km/h | 50 km | Disco dianteiro e tambor traseiro | 60V-20AH Lithium Battery | One container | 295 |
| GE | 350W | 30 km/h | 30 km | Tambor dianteiro e traseiro | 48V12A Lithium Battery | One container | 116 |
| HY | 350W | 30 km/h | 30 km | Tambor dianteiro e traseiro | 48V12A Lithium Battery | One container | 110 |
| DF17 | 500W | 35–40 km/h | 45–50 km | Tambor dianteiro e traseiro | 48V-20AH Lithium Battery | One container | 225 |

## 7. Observação regulatória

A planilha menciona observação de limite de velocidade no Brasil em alguns modelos. Essa informação precisa ser validada juridicamente/regulatoriamente antes de publicação, pois regras de circulação, homologação e enquadramento podem depender do tipo de veículo, potência, uso e legislação vigente.

## 8. Tela admin de produtos

### Lista

- Modelo.
- Categoria.
- Motor.
- Bateria.
- Velocidade.
- Autonomia.
- Valor base.
- Status.
- Publicado.
- Cotação IA.
- Atualizado em.

### Ações

- Criar produto.
- Editar.
- Duplicar.
- Ocultar.
- Publicar.
- Aprovar tabela.
- Vincular imagens.
- Vincular ficha técnica.
- Exportar catálogo.

## 9. Tela de detalhe do produto

### Abas

1. Dados gerais.
2. Especificações técnicas.
3. Preços e condições.
4. Mídia.
5. SEO/site.
6. Regras IA.
7. Histórico.

## 10. Tela pública de catálogo

### Card do produto

- Imagem.
- Modelo.
- Motor.
- Autonomia.
- Velocidade.
- Bateria.
- CTA `Tenho interesse`.
- CTA `Comparar`.

### Comparativo

- Modelo.
- Motor.
- Bateria.
- Autonomia.
- Velocidade.
- Freios.
- Quantidade mínima.
- Status comercial.

## 11. Dados a confirmar

- Moeda dos valores base.
- Incoterm ou condição comercial.
- MOQ real por modelo.
- Imagens oficiais.
- Fichas técnicas completas.
- Certificações.
- Necessidade de homologação.
- Política de margem.
- Validade de tabela.
- Quais modelos serão publicados inicialmente.
