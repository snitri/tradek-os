-- TradeK OS — cria tradek.profiles automaticamente quando um auth.users é inserido.
-- O papel vem de user_metadata.role (default 'cliente'); company_id de user_metadata.company_id.

create or replace function tradek.handle_new_user() returns trigger
language plpgsql security definer set search_path = tradek, public as $$
begin
  insert into tradek.profiles (id, nome, role, company_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    coalesce(nullif(new.raw_user_meta_data->>'role','')::tradek.user_role, 'cliente'),
    nullif(new.raw_user_meta_data->>'company_id','')::uuid
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function tradek.handle_new_user();
