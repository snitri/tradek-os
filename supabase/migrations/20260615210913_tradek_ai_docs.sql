-- TradeK OS — IA/atendimento, RAG e gestão documental

-- pgvector pode estar instalado em public ou extensions; resolve o type via search_path
set search_path = tradek, extensions, public;

-- ===== checklists / itens =====
create table tradek.checklists (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  unidade tradek.unidade,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tradek.checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references tradek.checklists(id) on delete cascade,
  tipo_documento text not null,
  descricao text,
  obrigatorio boolean not null default true,
  formatos_aceitos text[] not null default '{pdf,jpg,png,docx,xlsx}',
  ordem int not null default 0,
  created_at timestamptz not null default now()
);
create index checklist_items_checklist_idx on tradek.checklist_items (checklist_id);

-- FK pendente de tasks.checklist_item_id (declarada no core sem FK)
alter table tradek.tasks
  add constraint tasks_checklist_item_fk
  foreign key (checklist_item_id) references tradek.checklist_items(id) on delete set null;

-- ===== agent_configs =====
create table tradek.agent_configs (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  unidade tradek.unidade not null default 'outro',
  avatar text,
  mensagem_inicial text,
  perguntas_obrigatorias jsonb not null default '[]'::jsonb,
  perguntas_condicionais jsonb not null default '[]'::jsonb,
  campos_saida jsonb not null default '[]'::jsonb,
  score_minimo int not null default 60,
  status_inicial tradek.lead_status not null default 'qualificacao_ia',
  checklist_id uuid references tradek.checklists(id) on delete set null,
  produtos_consultaveis boolean not null default false,
  guardrails text,
  prompt text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===== conversations / mensagens do agente =====
create table tradek.conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_id text,
  unidade_detectada tradek.unidade,
  lead_id uuid references tradek.leads(id) on delete set null,
  status text not null default 'aberta',
  assumida_por uuid references tradek.profiles(id) on delete set null,
  resumo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index conversations_lead_idx on tradek.conversations (lead_id);

create table tradek.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references tradek.conversations(id) on delete cascade,
  role text not null,
  content text,
  tool_calls jsonb,
  created_at timestamptz not null default now()
);
create index conversation_messages_conv_idx on tradek.conversation_messages (conversation_id);

-- ===== reports (relatório IA, versionado) =====
create table tradek.reports (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references tradek.leads(id) on delete cascade,
  tipo text not null default 'lead',
  conteudo text,
  score int,
  modelo_ia text,
  prompt_version text,
  gerado_por tradek.autor_tipo not null default 'ia',
  enviado_por_email boolean not null default false,
  versao int not null default 1,
  created_at timestamptz not null default now()
);
create index reports_lead_idx on tradek.reports (lead_id);

-- ===== RAG =====
create table tradek.rag_documents (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  categoria text,
  unidade tradek.unidade,
  status text not null default 'ativo',
  validade date,
  storage_key text,
  restrito_admin boolean not null default false,
  versao int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tradek.rag_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references tradek.rag_documents(id) on delete cascade,
  chunk_index int not null default 0,
  conteudo text not null,
  embedding vector(384),
  created_at timestamptz not null default now()
);
create index rag_chunks_document_idx on tradek.rag_chunks (document_id);
create index rag_chunks_embedding_idx on tradek.rag_chunks
  using hnsw (embedding vector_cosine_ops);

-- ===== documentos =====
create table tradek.document_requests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references tradek.leads(id) on delete cascade,
  company_id uuid references tradek.companies(id) on delete cascade,
  checklist_item_id uuid references tradek.checklist_items(id) on delete set null,
  tipo_documento text not null,
  descricao text,
  status tradek.doc_status not null default 'solicitado',
  solicitado_em timestamptz not null default now(),
  vencimento date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index document_requests_lead_idx on tradek.document_requests (lead_id);
create index document_requests_company_idx on tradek.document_requests (company_id);

create table tradek.documents (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references tradek.document_requests(id) on delete set null,
  company_id uuid references tradek.companies(id) on delete cascade,
  lead_id uuid references tradek.leads(id) on delete set null,
  tipo_documento text,
  nome_original text,
  storage_key text not null,
  versao int not null default 1,
  status tradek.doc_status not null default 'enviado',
  enviado_em timestamptz not null default now(),
  enviado_por uuid references tradek.profiles(id) on delete set null,
  revisado_em timestamptz,
  revisado_por uuid references tradek.profiles(id) on delete set null,
  motivo_reprovacao text,
  observacoes text,
  hash_arquivo text,
  tamanho bigint,
  mime text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index documents_company_idx on tradek.documents (company_id);
create index documents_request_idx on tradek.documents (request_id);

-- ===== updated_at triggers =====
create trigger trg_checklists_updated before update on tradek.checklists
  for each row execute function tradek.set_updated_at();
create trigger trg_agent_configs_updated before update on tradek.agent_configs
  for each row execute function tradek.set_updated_at();
create trigger trg_conversations_updated before update on tradek.conversations
  for each row execute function tradek.set_updated_at();
create trigger trg_rag_documents_updated before update on tradek.rag_documents
  for each row execute function tradek.set_updated_at();
create trigger trg_document_requests_updated before update on tradek.document_requests
  for each row execute function tradek.set_updated_at();
create trigger trg_documents_updated before update on tradek.documents
  for each row execute function tradek.set_updated_at();
