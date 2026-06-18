-- TradeK OS — Realtime (Plano 08): publica notifications + interactions para live-push.
-- O Realtime respeita RLS, então cada usuário só recebe o que pode ver.

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'tradek' and tablename = 'notifications') then
    alter publication supabase_realtime add table tradek.notifications;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'tradek' and tablename = 'interactions') then
    alter publication supabase_realtime add table tradek.interactions;
  end if;
end $$;

-- replica identity full p/ que updates (marcar lida) também propaguem no Realtime
alter table tradek.notifications replica identity full;
