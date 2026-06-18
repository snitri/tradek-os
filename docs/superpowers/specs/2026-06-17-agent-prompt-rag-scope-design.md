# Edição de prompt do agente + RAG por agente (Design)

**Data:** 2026-06-17 · **Escopo:** tela admin "Agentes IA" + Edge Functions `agent-chat`/`rag-ingest` + schema.

## Problema
1. O `agent-chat` usa um SYSTEM **fixo no código** — não dá pra refinar o prompt sem deploy.
2. Os documentos RAG têm só `unidade` e a busca traz **todos** (geral) — risco de misturar conhecimento de unidades diferentes.

## Decisões
- **Prompt editável:** o `agent-chat` passa a ler o prompt do **agente "Geral"** (`agent_configs.unidade='outro'`) do banco; admin edita via modal. Prompts dos agentes por unidade são injetados como "diretrizes do especialista" quando aquela unidade está em pauta.
- **RAG por agente:** cada `rag_document` ganha `agent_id` (FK→`agent_configs`). No upload escolhe-se o agente (obrigatório). A busca retorna **só os docs do agente da unidade + os do agente Geral** (decisão do usuário) — nunca cruza unidades.

## Mudanças

### Schema (`20260617130000_tradek_rag_per_agent.sql`)
- `rag_documents.agent_id uuid references agent_configs(id) on delete set null` + índice.
- Backfill: casa por `unidade`; o que sobrar → agente Geral (`unidade='outro'`).
- `match_documents` redefinida com `p_agent_ids uuid[]` (filtra `agent_id = any(p_agent_ids)`; null = todos, p/ retrocompat).

### `agent-chat`
- Carrega `agent_configs` ativos; identifica o Geral.
- SYSTEM = `geral.prompt` (+ `geral.guardrails`); fallback p/ o hardcoded atual se vazio.
- Tool `buscar_conhecimento` ganha param `unidade`; busca com `p_agent_ids=[agenteDaUnidade, geral]`; injeta `diretrizes_especialista` = prompt do agente da unidade.

### `rag-ingest`
- Aceita `agent_id`; salva no doc e deriva `unidade` do agente.

### Admin UI (`screens.tsx`)
- **Agentes**: cards clicáveis → `AgentEditModal` (prompt, guardrails, mensagem inicial, score mínimo, ativo) → `update agent_configs`.
- **RAG upload**: troca o select "unidade" por **"Agente" (obrigatório)**; passa `agent_id`. Lista mostra o agente (`agent_configs(nome)`) + nº de chunks.

## Verificação
- Editar o prompt do Geral muda a resposta do widget (sem deploy).
- Subir doc para o agente SCF → só aparece em perguntas de SCF; pergunta de Procurement NÃO usa esse doc.
- Build limpo; testes ao vivo (Playwright) + deploy via merge no `main`.
