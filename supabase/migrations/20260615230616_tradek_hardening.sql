-- TradeK OS — Hardening: auditoria, rate-limit, papel leitura read-only

-- ===== 1) Auditoria (RNF-005) — trigger genérico grava em audit_logs =====
create or replace function tradek.audit() returns trigger
language plpgsql security definer set search_path = tradek, public as $$
begin
  insert into tradek.audit_logs (usuario_id, acao, entidade, entidade_id, valor_anterior, valor_novo)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    case when tg_op = 'DELETE' then old.id else new.id end,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('UPDATE','INSERT') then to_jsonb(new) else null end
  );
  return case when tg_op = 'DELETE' then old else new end;
end $$;

do $$
declare t text;
begin
  for t in select unnest(array['leads','documents','document_requests','profiles','proposals','products','notification_rules','companies','contacts'])
  loop
    execute format('drop trigger if exists trg_audit_%1$s on tradek.%1$s', t);
    execute format('create trigger trg_audit_%1$s after insert or update or delete on tradek.%1$s for each row execute function tradek.audit()', t);
  end loop;
end $$;

-- ===== 2) Rate-limit das Edge Functions públicas =====
create table if not exists tradek.request_log (
  id bigint generated always as identity primary key,
  ip text,
  action text,
  created_at timestamptz not null default now()
);
create index if not exists request_log_lookup on tradek.request_log (action, ip, created_at);
grant select, insert on tradek.request_log to service_role;

-- conta requisições recentes de um ip/ação (usada pelas functions via service role)
create or replace function tradek.rate_check(p_ip text, p_action text, p_window_secs int, p_max int)
returns boolean language plpgsql security definer set search_path = tradek, public as $$
declare n int;
begin
  select count(*) into n from tradek.request_log
   where action = p_action and ip = p_ip and created_at > now() - make_interval(secs => p_window_secs);
  insert into tradek.request_log (ip, action) values (p_ip, p_action);
  return n < p_max;  -- true = permitido
end $$;
grant execute on function tradek.rate_check(text, text, int, int) to service_role;

-- ===== 3) Papel 'leitura' é read-only (substitui o internal_all por read + write-se-pode) =====
-- can_write: interno que não seja apenas leitura
create or replace function tradek.can_write() returns boolean
language sql stable security definer set search_path = tradek, public as $$
  select coalesce((select role from tradek.profiles where id = auth.uid()) not in ('cliente','leitura'), false);
$$;

do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'tradek' and tablename <> 'request_log'
  loop
    execute format('drop policy if exists %I on tradek.%I', 'internal_all_'||t, t);
    execute format('create policy %I on tradek.%I for select to authenticated using (tradek.is_internal())', 'internal_read_'||t, t);
    execute format('create policy %I on tradek.%I for insert to authenticated with check (tradek.can_write())', 'internal_ins_'||t, t);
    execute format('create policy %I on tradek.%I for update to authenticated using (tradek.can_write()) with check (tradek.can_write())', 'internal_upd_'||t, t);
    execute format('create policy %I on tradek.%I for delete to authenticated using (tradek.can_write())', 'internal_del_'||t, t);
  end loop;
end $$;

-- request_log: sem acesso a authenticated (só service_role)
alter table tradek.request_log enable row level security;
