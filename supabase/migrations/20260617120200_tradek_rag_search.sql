-- TradeK OS — RAG search (Plano 07): busca semântica nos chunks por similaridade de cosseno.
-- Usada pela Edge Function agent-chat (tool buscar_conhecimento) e pelo rag-search.

create or replace function tradek.match_documents(
  query_embedding vector(384),
  match_count int default 5,
  p_include_restrito boolean default false
)
returns table (
  chunk_id uuid,
  document_id uuid,
  titulo text,
  categoria text,
  unidade text,
  conteudo text,
  similarity double precision
)
language sql
stable
security definer
set search_path = tradek, public
as $$
  select
    ch.id,
    ch.document_id,
    d.titulo,
    d.categoria,
    d.unidade::text,
    ch.conteudo,
    1 - (ch.embedding <=> query_embedding) as similarity
  from tradek.rag_chunks ch
  join tradek.rag_documents d on d.id = ch.document_id
  where d.status = 'ativo'
    and (p_include_restrito or coalesce(d.restrito_admin, false) = false)
  order by ch.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

grant execute on function tradek.match_documents(vector, int, boolean) to anon, authenticated, service_role;

-- índice HNSW (rag_chunks_embedding_idx) já existe da migration tradek_ai_docs.
