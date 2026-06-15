# Wireframes ASCII — Telas-chave

## 1. Dashboard administrativo

```text
┌────────────────────────────────────────────────────────────────────┐
│ TradeK OS > Dashboard                           [Busca] [+ Lead]   │
├────────────────────────────────────────────────────────────────────┤
│ [Novos Leads] [Qualificados] [Docs Pendentes] [Propostas] [Ganhos] │
│      42             18              9             6          4      │
├──────────────────────────────────┬─────────────────────────────────┤
│ Funil de Oportunidades           │ Leads por Unidade               │
│                                  │                                 │
│ Novo Lead        █████████       │ SCF          ██████████         │
│ Qualificado      █████           │ Procurement  █████              │
│ Em Análise       ███             │ Produtos     ████               │
│ Proposta         ██              │                                 │
├──────────────────────────────────┼─────────────────────────────────┤
│ Pendências Críticas              │ Últimas Interações IA           │
│ - 6 leads sem responsável        │ - Empresa ABC / SCF / 84        │
│ - 9 documentos pendentes         │ - Loja XYZ / Produtos / 68      │
│ - 3 tarefas vencidas             │ - Importadora M / Procurement   │
└──────────────────────────────────┴─────────────────────────────────┘
```

## 2. CRM Kanban

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ CRM > Kanban                                                                │
│ Filtros: [Unidade] [Status] [Responsável] [Score] [Origem] [Buscar]         │
├─────────────┬──────────────┬──────────────┬──────────────┬────────────────┤
│ Novo Lead   │ Qualificação │ Qualificado  │ Docs Pend.   │ Em Análise     │
├─────────────┼──────────────┼──────────────┼──────────────┼────────────────┤
│ Empresa A   │ Empresa D    │ Empresa G    │ Empresa J    │ Empresa M      │
│ SCF         │ Procurement  │ Produtos     │ SCF          │ SCF            │
│ Score 52    │ Score 61     │ Score 84     │ Score 88     │ Score 90       │
│ Sem resp.   │ Falta volume │ Resp: Ana    │ Falta RADAR  │ Docs OK        │
│ [Abrir]     │ [Abrir]      │ [Abrir]      │ [Abrir]      │ [Abrir]        │
├─────────────┼──────────────┼──────────────┼──────────────┼────────────────┤
│ Empresa B   │              │ Empresa H    │              │                │
│ Produtos    │              │ SCF          │              │                │
│ Score 40    │              │ Score 77     │              │                │
└─────────────┴──────────────┴──────────────┴──────────────┴────────────────┘
```

## 3. CRM Lista

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ CRM > Lista                                       [Exportar] [Ações em massa]│
├────┬──────────┬────────────┬────────┬───────┬────────┬─────────┬───────────┤
│ ID │ Empresa  │ Contato    │ Unidade│ Score │ Status │ Resp.   │ Próx. ação│
├────┼──────────┼────────────┼────────┼───────┼────────┼─────────┼───────────┤
│ 01 │ ABC Ltda │ João       │ SCF    │ 84    │ Qualif │ Ana     │ Docs      │
│ 02 │ XYZ Com. │ Maria      │ Motos  │ 68    │ Qualif │ Pedro   │ Proposta  │
│ 03 │ Import M │ Carlos     │ Proc.  │ 59    │ Dados  │ -       │ Completar │
└────┴──────────┴────────────┴────────┴───────┴────────┴─────────┴───────────┘
```

## 4. Modal detalhe do lead

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Empresa ABC Ltda                                      [Salvar] [Fechar]      │
│ Status: Qualificado | Score: 84 | Unidade: SCF | Resp: Ana                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Resumo] [Dados] [Oportunidade] [Qualificação IA] [Interações] [Documentos] │
│ [Chat] [Relatório] [Histórico]                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ RESUMO EXECUTIVO IA                                                          │
│ Empresa quer importar acessórios eletrônicos da China com prazo de 120 dias. │
│ Valor FOB estimado: US$ 80.000. Fornecedor definido. RADAR não confirmado.  │
├──────────────────────────────────────────────────────────────────────────────┤
│ O que quer: financiar importação, preservar capital, pagar fornecedor China. │
│ O que não quer: empréstimo bancário tradicional; adiantar 40% na produção.   │
│ Pendências: RADAR, contrato social, cartão CNPJ, invoice/proforma.           │
├──────────────────────────────────────────────────────────────────────────────┤
│ Próxima ação sugerida: criar acesso cliente e solicitar checklist SCF.       │
│ [Solicitar Docs] [Criar acesso cliente] [Gerar relatório] [Desqualificar]   │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 5. Aba documentos no modal

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Documentos — Empresa ABC                                                     │
├──────────────────────────────┬──────────────┬──────────────┬───────────────┤
│ Documento                    │ Status       │ Enviado em   │ Ação          │
├──────────────────────────────┼──────────────┼──────────────┼───────────────┤
│ Contrato Social              │ Pendente     │ -            │ Solicitar     │
│ Cartão CNPJ                  │ Enviado      │ 14/06/2026   │ Revisar       │
│ Comprovante de Endereço      │ Reprovado    │ 13/06/2026   │ Ver motivo    │
│ RG/CPF Representante         │ Aprovado     │ 12/06/2026   │ Visualizar    │
└──────────────────────────────┴──────────────┴──────────────┴───────────────┘
```

## 6. Portal do cliente — Dashboard

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Portal TradeK                                                    [Sair]      │
├──────────────────────────────────────────────────────────────────────────────┤
│ Olá, João.                                                                  │
│ Sua solicitação: Supply Chain Finance — Importação da China                  │
│ Status: Documentos solicitados                                               │
│ Próximo passo: envie os documentos pendentes para análise.                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ Pendências                                                                   │
│ [ ] Contrato Social                         [Enviar]                         │
│ [ ] Cartão CNPJ                             [Enviar]                         │
│ [ ] Comprovante de Endereço                 [Enviar]                         │
│ [ ] RG/CPF Representante Legal              [Enviar]                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Enviar documentos] [Falar com a TradeK] [Ver ficha cadastral]               │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 7. Portal do cliente — Chat

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Chat da oportunidade                                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ TradeK — 10:30                                                               │
│ Olá, João. Precisamos do comprovante de RADAR/Siscomex para avançar.         │
│                                                                              │
│ Cliente — 10:45                                                              │
│ Perfeito, vou anexar hoje.                                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Digite sua mensagem...]                          [Anexar] [Enviar]          │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 8. Configuração de notificações

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Configurações > Notificações                                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ Evento: [Novo lead recebido        v]                                         │
│ Unidade: [Supply Chain Finance     v]                                         │
│ Para:   [financeiro@tradek.com.br, comercial@tradek.com.br]                  │
│ CC:     [camilo@tradek.com.br]                                                │
│ BCC:    [                                                       ]             │
│ Template: [Novo lead recebido      v]                                         │
│ [x] Enviar resumo IA                                                          │
│ [ ] Enviar anexos                                                             │
│ Frequência: [Imediato              v]                                         │
│                                                                              │
│ [Salvar regra] [Testar envio]                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 9. Configuração de agente IA

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Configurações > Agentes IA                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Geral] [SCF] [Procurement] [Produtos] [Suporte] [RAG] [Guardrails]          │
├──────────────────────────────────────────────────────────────────────────────┤
│ Nome do agente: [Agente Supply Chain Finance]                                │
│ Mensagem inicial:                                                            │
│ [Olá, posso te ajudar a avaliar sua importação com prazo...]                 │
│                                                                              │
│ Perguntas obrigatórias:                                                       │
│ [x] Empresa                                                                  │
│ [x] CNPJ                                                                     │
│ [x] Produto                                                                  │
│ [x] Valor FOB                                                                │
│ [x] RADAR                                                                    │
│                                                                              │
│ Score mínimo qualificado: [60]                                                │
│ Checklist acionado: [Supply Chain Finance]                                    │
│ [Salvar] [Testar agente]                                                      │
└──────────────────────────────────────────────────────────────────────────────┘
```
