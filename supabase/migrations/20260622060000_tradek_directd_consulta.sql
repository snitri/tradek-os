-- Integração DirectD (Score de Crédito QUOD + Processos Judiciais) por CNPJ
alter table tradek.companies
  add column if not exists score_credito jsonb,
  add column if not exists processos_judiciais jsonb,
  add column if not exists consulta_credito_em timestamptz;
