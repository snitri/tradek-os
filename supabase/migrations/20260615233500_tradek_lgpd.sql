-- TradeK OS — LGPD (RNF-003): marcador de anonimização da empresa/lead
-- A Edge Function `lgpd` (action "anonymize") substitui a PII e marca estes campos.
-- O export usa service role e não precisa de coluna nova.

alter table tradek.companies
  add column if not exists anonimizado boolean not null default false,
  add column if not exists anonimizado_em timestamptz;

comment on column tradek.companies.anonimizado is 'LGPD: dados da empresa anonimizados sob demanda (RNF-003)';
comment on column tradek.companies.anonimizado_em is 'LGPD: quando a anonimização foi executada';

create index if not exists companies_anonimizado_idx on tradek.companies (anonimizado) where anonimizado;
