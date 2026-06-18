-- TradeK OS — RAG por agente (Plano 07): vincula cada documento a um agente e escopa a busca.

-- 1) coluna agent_id + índice
alter table tradek.rag_documents
  add column if not exists agent_id uuid references tradek.agent_configs(id) on delete set null;
create index if not exists rag_documents_agent_idx on tradek.rag_documents(agent_id);

-- 2) backfill: casa por unidade; o que sobrar vai pro agente Geral (unidade 'outro')
update tradek.rag_documents d
  set agent_id = a.id
  from tradek.agent_configs a
  where d.agent_id is null and a.unidade = d.unidade;

update tradek.rag_documents
  set agent_id = (select id from tradek.agent_configs where unidade = 'outro' order by created_at limit 1)
  where agent_id is null;

-- 3) match_documents passa a filtrar por um conjunto de agentes (unidade + geral)
drop function if exists tradek.match_documents(vector, int, boolean);

create or replace function tradek.match_documents(
  query_embedding vector(384),
  match_count int default 5,
  p_agent_ids uuid[] default null,
  p_include_restrito boolean default false
)
returns table (
  chunk_id uuid,
  document_id uuid,
  titulo text,
  categoria text,
  unidade text,
  agent_id uuid,
  conteudo text,
  similarity double precision
)
language sql
stable
security definer
set search_path = tradek, public
as $$
  select
    ch.id, ch.document_id, d.titulo, d.categoria, d.unidade::text, d.agent_id, ch.conteudo,
    1 - (ch.embedding <=> query_embedding) as similarity
  from tradek.rag_chunks ch
  join tradek.rag_documents d on d.id = ch.document_id
  where d.status = 'ativo'
    and (p_include_restrito or coalesce(d.restrito_admin, false) = false)
    and (p_agent_ids is null or d.agent_id = any(p_agent_ids))
  order by ch.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

grant execute on function tradek.match_documents(vector, int, uuid[], boolean) to anon, authenticated, service_role;
