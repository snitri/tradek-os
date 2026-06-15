-- TradeK OS — automações por evento: triggers (pg_net) -> Edge Function on-event

create extension if not exists pg_net;

-- emite evento de domínio chamando a Edge Function on-event (assíncrono via pg_net)
create or replace function tradek.emit_event() returns trigger
language plpgsql security definer set search_path = tradek, public as $$
declare ev text; secret text; lid uuid;
begin
  secret := (select valor->>'webhook_secret' from tradek.settings where chave = 'webhook' limit 1);
  if tg_table_name = 'leads' then
    if tg_op = 'INSERT' then ev := 'lead.created'; lid := new.id;
    elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
      lid := new.id;
      ev := case when new.status = 'qualificado' then 'lead.qualified' else 'lead.status_changed' end;
    else return new; end if;
  elsif tg_table_name = 'documents' then
    ev := 'lead.document_uploaded'; lid := new.lead_id;
  else return new; end if;

  perform net.http_post(
    url := 'https://ewgxnsedlhlsregvyjsn.supabase.co/functions/v1/on-event',
    body := jsonb_build_object('event', ev, 'lead_id', lid),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', coalesce(secret, ''))
  );
  return new;
end $$;

drop trigger if exists trg_emit_leads on tradek.leads;
create trigger trg_emit_leads after insert or update on tradek.leads
  for each row execute function tradek.emit_event();

drop trigger if exists trg_emit_documents on tradek.documents;
create trigger trg_emit_documents after insert on tradek.documents
  for each row execute function tradek.emit_event();
