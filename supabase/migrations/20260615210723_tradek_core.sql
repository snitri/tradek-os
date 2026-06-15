-- TradeK OS — núcleo do CRM: profiles, companies, contacts, leads, histórico, interações, tarefas

-- ===== companies =====
create table tradek.companies (
  id uuid primary key default gen_random_uuid(),
  razao_social text,
  nome_fantasia text,
  cnpj text,
  inscricao_estadual text,
  inscricao_municipal text,
  data_fundacao date,
  cnae_principal text,
  cnae_secundario text,
  possui_radar boolean,
  tipo_radar text,
  media_importacoes text,
  endereco jsonb not null default '{}'::jsonb,
  site text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index companies_cnpj_uidx on tradek.companies (cnpj) where cnpj is not null;

-- ===== profiles (admin + cliente) =====
create table tradek.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  role tradek.user_role not null default 'cliente',
  company_id uuid references tradek.companies(id) on delete set null,
  telefone text,
  avatar_url text,
  ativo boolean not null default true,
  bloqueado boolean not null default false,
  ultimo_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_company_idx on tradek.profiles (company_id);
create index profiles_role_idx on tradek.profiles (role);

-- ===== contacts =====
create table tradek.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references tradek.companies(id) on delete cascade,
  nome text not null,
  cargo text,
  email text,
  telefone text,
  whatsapp text,
  cpf text,
  tipo text,
  principal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index contacts_company_idx on tradek.contacts (company_id);

-- ===== leads (card = lead/oportunidade) =====
create table tradek.leads (
  id uuid primary key default gen_random_uuid(),
  origem tradek.origem not null default 'cadastro_manual',
  unidade tradek.unidade not null default 'outro',
  status tradek.lead_status not null default 'novo',
  score_ia int,
  classificacao text,
  responsavel_id uuid references tradek.profiles(id) on delete set null,
  company_id uuid references tradek.companies(id) on delete set null,
  contact_id uuid references tradek.contacts(id) on delete set null,
  produto_servico_interesse text,
  valor_estimado numeric,
  moeda text default 'USD',
  volume_estimado text,
  prazo_desejado text,
  urgencia tradek.urgencia,
  resumo_ia text,
  o_que_quer text,
  o_que_nao_quer text,
  dados_coletados jsonb not null default '{}'::jsonb,
  dados_faltantes jsonb not null default '[]'::jsonb,
  pendencias jsonb not null default '[]'::jsonb,
  riscos jsonb not null default '[]'::jsonb,
  proxima_acao text,
  motivo_desqualificacao tradek.motivo_desqualificacao,
  motivo_perda tradek.motivo_perda,
  tags text[] not null default '{}',
  dados_oportunidade jsonb not null default '{}'::jsonb,
  ultimo_contato_em timestamptz,
  proxima_tarefa_em timestamptz,
  cliente_portal_criado boolean not null default false,
  consentimento_lgpd boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index leads_status_idx on tradek.leads (status);
create index leads_unidade_idx on tradek.leads (unidade);
create index leads_responsavel_idx on tradek.leads (responsavel_id);
create index leads_company_idx on tradek.leads (company_id);

-- ===== lead_status_history =====
create table tradek.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references tradek.leads(id) on delete cascade,
  status_anterior tradek.lead_status,
  status_novo tradek.lead_status not null,
  usuario_id uuid references tradek.profiles(id) on delete set null,
  motivo text,
  created_at timestamptz not null default now()
);
create index lead_status_history_lead_idx on tradek.lead_status_history (lead_id);

-- ===== interactions (timeline + chat admin↔cliente) =====
create table tradek.interactions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references tradek.leads(id) on delete cascade,
  canal tradek.interaction_canal not null default 'sistema',
  tipo tradek.interaction_tipo not null default 'mensagem',
  autor_tipo tradek.autor_tipo not null default 'sistema',
  autor_id uuid,
  mensagem text,
  anexos jsonb not null default '[]'::jsonb,
  visivel_cliente boolean not null default false,
  created_at timestamptz not null default now()
);
create index interactions_lead_idx on tradek.interactions (lead_id);

-- ===== tasks =====
create table tradek.tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references tradek.leads(id) on delete cascade,
  titulo text not null,
  descricao text,
  responsavel_id uuid references tradek.profiles(id) on delete set null,
  prazo timestamptz,
  prioridade tradek.urgencia not null default 'media',
  status tradek.task_status not null default 'aberta',
  criada_por uuid references tradek.profiles(id) on delete set null,
  checklist_item_id uuid,
  concluida_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_responsavel_idx on tradek.tasks (responsavel_id);
create index tasks_status_idx on tradek.tasks (status);

-- ===== updated_at triggers =====
create trigger trg_companies_updated before update on tradek.companies
  for each row execute function tradek.set_updated_at();
create trigger trg_profiles_updated before update on tradek.profiles
  for each row execute function tradek.set_updated_at();
create trigger trg_contacts_updated before update on tradek.contacts
  for each row execute function tradek.set_updated_at();
create trigger trg_leads_updated before update on tradek.leads
  for each row execute function tradek.set_updated_at();
create trigger trg_tasks_updated before update on tradek.tasks
  for each row execute function tradek.set_updated_at();

-- ===== helpers de RLS (lêem profiles; SECURITY DEFINER ignora RLS) =====
create or replace function tradek.current_user_role() returns tradek.user_role
language sql stable security definer set search_path = tradek, public as $$
  select role from tradek.profiles where id = auth.uid();
$$;

create or replace function tradek.current_user_company() returns uuid
language sql stable security definer set search_path = tradek, public as $$
  select company_id from tradek.profiles where id = auth.uid();
$$;

create or replace function tradek.is_internal() returns boolean
language sql stable security definer set search_path = tradek, public as $$
  select coalesce((select role from tradek.profiles where id = auth.uid()) <> 'cliente', false);
$$;
