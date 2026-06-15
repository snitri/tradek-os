-- TradeK OS — catálogo/comercial, comunicação e configuração

-- ===== products =====
create table tradek.products (
  id uuid primary key default gen_random_uuid(),
  modelo text not null,
  categoria text,
  descricao_curta text,
  descricao_completa text,
  motor text,
  velocidade text,
  autonomia text,
  bateria text,
  freios text,
  capacidade text,
  moq text,
  preco_base numeric,
  moeda text default 'USD',
  condicao_comercial text,
  imagens jsonb not null default '[]'::jsonb,
  ficha_tecnica jsonb not null default '{}'::jsonb,
  status text not null default 'ativo',
  publicado_site boolean not null default false,
  permitir_cotacao_ia boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===== services =====
create table tradek.services (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text,
  descricao text,
  publico_alvo text,
  perguntas_qualificacao jsonb not null default '[]'::jsonb,
  checklist_id uuid references tradek.checklists(id) on delete set null,
  agente_id uuid references tradek.agent_configs(id) on delete set null,
  emails_notificados text[] not null default '{}',
  status text not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===== proposals =====
create table tradek.proposals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references tradek.leads(id) on delete cascade,
  status tradek.proposal_status not null default 'rascunho',
  valor numeric,
  moeda text default 'USD',
  pdf_storage_key text,
  observacoes text,
  enviada_em timestamptz,
  aceite_em timestamptz,
  recusa_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index proposals_lead_idx on tradek.proposals (lead_id);

-- ===== email_templates =====
create table tradek.email_templates (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  chave text unique,
  assunto text not null,
  corpo_html text not null,
  variaveis text[] not null default '{}',
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===== notification_rules =====
create table tradek.notification_rules (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  evento text not null,
  unidade tradek.unidade,
  status_origem tradek.lead_status,
  status_destino tradek.lead_status,
  emails_para text[] not null default '{}',
  emails_cc text[] not null default '{}',
  emails_bcc text[] not null default '{}',
  template_id uuid references tradek.email_templates(id) on delete set null,
  ativo boolean not null default true,
  enviar_resumo_ia boolean not null default false,
  enviar_anexos boolean not null default false,
  frequencia text not null default 'imediato',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===== email_log =====
create table tradek.email_log (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid references tradek.notification_rules(id) on delete set null,
  lead_id uuid references tradek.leads(id) on delete set null,
  template_id uuid references tradek.email_templates(id) on delete set null,
  para text[] not null default '{}',
  assunto text,
  status text not null default 'enviado',
  provider_id text,
  erro text,
  created_at timestamptz not null default now()
);
create index email_log_lead_idx on tradek.email_log (lead_id);

-- ===== notifications (in-app: admin + cliente) =====
create table tradek.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null,
  mensagem text not null,
  link text,
  lida boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on tradek.notifications (user_id, lida);

-- ===== pipeline_statuses (rótulos admin↔cliente editáveis) =====
create table tradek.pipeline_statuses (
  key tradek.lead_status primary key,
  label_admin text not null,
  label_cliente text not null,
  ordem int not null default 0,
  cor text,
  visivel_kanban boolean not null default true
);

-- ===== settings (config geral key/jsonb) =====
create table tradek.settings (
  chave text primary key,
  valor jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ===== audit_logs =====
create table tradek.audit_logs (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references tradek.profiles(id) on delete set null,
  acao text not null,
  entidade text,
  entidade_id uuid,
  valor_anterior jsonb,
  valor_novo jsonb,
  ip text,
  origem text,
  created_at timestamptz not null default now()
);
create index audit_logs_entidade_idx on tradek.audit_logs (entidade, entidade_id);

-- ===== updated_at triggers =====
create trigger trg_products_updated before update on tradek.products
  for each row execute function tradek.set_updated_at();
create trigger trg_services_updated before update on tradek.services
  for each row execute function tradek.set_updated_at();
create trigger trg_proposals_updated before update on tradek.proposals
  for each row execute function tradek.set_updated_at();
create trigger trg_email_templates_updated before update on tradek.email_templates
  for each row execute function tradek.set_updated_at();
create trigger trg_notification_rules_updated before update on tradek.notification_rules
  for each row execute function tradek.set_updated_at();
create trigger trg_settings_updated before update on tradek.settings
  for each row execute function tradek.set_updated_at();
