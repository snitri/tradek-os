-- TradeK OS — grants para os papéis da API (RLS continua restringindo de fato)
-- Schemas customizados não herdam os grants padrão que o `public` tem no Supabase.

grant usage on schema tradek to anon, authenticated, service_role;

-- tabelas existentes
grant select on all tables in schema tradek to anon;
grant select, insert, update, delete on all tables in schema tradek to authenticated;
grant all on all tables in schema tradek to service_role;

-- sequences e funções
grant usage, select on all sequences in schema tradek to anon, authenticated, service_role;
grant execute on all routines in schema tradek to anon, authenticated, service_role;

-- defaults para objetos futuros do schema
alter default privileges in schema tradek grant select on tables to anon;
alter default privileges in schema tradek grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema tradek grant all on tables to service_role;
alter default privileges in schema tradek grant usage, select on sequences to anon, authenticated, service_role;
alter default privileges in schema tradek grant execute on routines to anon, authenticated, service_role;
