# SPEC de Telas — Site Público e Agente IA

## 1. Jornada pública

```text
Visitante acessa o site
↓
Entende soluções TradeK
↓
Escolhe unidade ou abre Agente TradeK
↓
IA coleta informações
↓
Lead entra no CRM
↓
Equipe recebe relatório e notificação
```

## 2. Sitemap

```text
Home
├── Supply Chain Finance
├── Procurement Internacional
├── Motos / Produtos
├── Sobre
├── FAQ
├── Contato
└── Obrigado
```

## 3. SITE-01 — Home

### Objetivo

Apresentar a TradeK como hub de negócios internacionais e direcionar o usuário para uma unidade.

### Hero

**Headline:** TradeK: negócios internacionais com inteligência, segurança e escala.

**Subheadline:** Conectamos empresas brasileiras a soluções de importação, Supply Chain Finance, Procurement Internacional e oportunidades em produtos e mobilidade elétrica.

### CTAs

- `Falar com agente TradeK`
- `Conhecer soluções`
- `Solicitar análise`

### Seções

1. Hero.
2. Cards de unidades.
3. Como a TradeK ajuda.
4. Benefícios.
5. Atendimento com IA.
6. FAQ resumido.
7. Rodapé.

### Cards

- Supply Chain Finance.
- Procurement Internacional.
- Motos / Produtos.

Cada card deve abrir a página da unidade ou o agente já contextualizado.

## 4. SITE-02 — Supply Chain Finance

### Objetivo

Explicar a solução de compra/importação a prazo.

### Conteúdo

- Importação da China com prazo.
- Preservação de capital de giro.
- Pagamento direto ao fornecedor.
- Financiamento de até 100% do FOB, sujeito à análise.
- Prazo de 90 a 180 dias, sujeito à aprovação.
- Necessidade de RADAR/Siscomex.
- Análise documental.
- Apoio em cadastro e operação.

### Estrutura

1. Hero.
2. O desafio da importação tradicional.
3. Como funciona a solução TradeK.
4. Benefícios.
5. TradeK x operação padrão.
6. RADAR/Siscomex.
7. Documentos iniciais.
8. FAQ.
9. CTA do agente.

### CTA

- `Avaliar minha importação`
- `Entender documentos necessários`

### Compliance

Toda condição comercial deve aparecer com ressalva:

```text
Sujeito à análise cadastral, documental, financeira e aprovação da linha de crédito.
```

## 5. SITE-03 — Procurement Internacional

### Objetivo

Apresentar busca, validação e negociação com fornecedores internacionais.

### Estrutura

1. Hero.
2. O que é Procurement Internacional.
3. Etapas do processo.
4. Dados necessários para briefing.
5. Benefícios.
6. CTA para agente.

### Dados para briefing

- Produto.
- Especificações.
- Volume.
- Orçamento-alvo.
- Prazo.
- Certificações.
- Mercado de destino.
- Referências.
- Amostra/inspeção.

## 6. SITE-04 — Motos / Produtos

### Objetivo

Apresentar catálogo e captar interessados em compra, importação, revenda ou distribuição.

### Estrutura

1. Hero.
2. Catálogo.
3. Cards de modelos.
4. Comparativo.
5. Ficha técnica.
6. Importação/homologação.
7. Solicitação de proposta.

### Regra

Produtos vêm do painel admin. O site não deve conter ficha técnica fixa no código.

## 7. SITE-05 — FAQ

### Supply Chain Finance

- Preciso ter experiência em importação?
- Preciso ter RADAR?
- O prazo é garantido?
- O financiamento é aprovado automaticamente?
- Quais documentos são necessários?
- A TradeK escolhe o fornecedor?

### Procurement

- Vocês encontram fornecedor do zero?
- Vocês fazem inspeção?
- É possível pedir amostra?
- Quanto tempo leva o sourcing?
- Preciso ter especificação técnica?

### Produtos/Motos

- Quais modelos estão disponíveis?
- Existe quantidade mínima?
- Posso ser distribuidor?
- Precisa homologação?
- A proposta é automática?

## 8. SITE-06 — Contato

### Campos

- Nome.
- Empresa.
- CNPJ.
- E-mail.
- WhatsApp.
- Unidade de interesse.
- Mensagem.
- Consentimento LGPD.

### Ação

Cria lead com origem `formulario_site`.

## 9. SITE-07 — Obrigado

### Mensagem

```text
Recebemos sua solicitação.
A equipe TradeK irá analisar os dados enviados e retornar com o próximo passo.
Se necessário, você poderá receber um convite para acessar o portal do cliente e enviar documentos complementares.
```

## 10. Componente — Botão flutuante do Agente TradeK

### Posição

- Desktop: canto inferior direito.
- Mobile: canto inferior direito ou barra inferior.

### Estados

1. Fechado.
2. Aberto.
3. Minimizado.
4. Nova mensagem.
5. Finalizado.
6. Handoff humano.

### Primeira mensagem

```text
Olá, sou o agente virtual da TradeK.
Posso ajudar com importação, financiamento, fornecedores ou produtos.
```

### Botões rápidos

- `Importar com prazo`
- `Encontrar fornecedor`
- `Motos / Produtos`
- `Já sou cliente`
- `Outro assunto`

## 11. Janela do chat IA

### Dados mínimos

- Nome.
- Empresa.
- CNPJ.
- E-mail.
- WhatsApp.
- Unidade.
- Demanda.
- Valor/volume/quantidade.
- Urgência.
- Consentimento.

### Regras

- Não perguntar tudo de uma vez.
- Coletar por blocos.
- Confirmar dados antes de finalizar.
- Criar lead mesmo com dados incompletos.
- Handoff para humano quando houver pedido de proposta, preço final, aprovação financeira, reclamação ou análise sensível.

## 12. Eventos do site

| Evento | Descrição | Ação |
|---|---|---|
| `chat.opened` | Visitante abriu chat | Registrar sessão. |
| `chat.started` | Primeira mensagem | Criar interação. |
| `lead.partial_created` | Dados parciais | Criar lead parcial. |
| `lead.created` | Dados mínimos | Criar lead. |
| `lead.qualified` | Score mínimo | Notificar admin. |
| `form.submitted` | Formulário enviado | Criar lead. |
| `page.cta_clicked` | CTA clicado | Registrar origem. |
