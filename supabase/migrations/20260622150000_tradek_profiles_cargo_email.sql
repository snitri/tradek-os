-- Cadastro de usuário interno passa a ter: Nome completo, Cargo, E-mail, Role.
-- E-mail é espelhado de auth.users (login real fica só lá; aqui é só leitura/exibição).
alter table tradek.profiles
  add column if not exists cargo text,
  add column if not exists email text;

update tradek.profiles p set email = u.email from auth.users u where u.id = p.id and p.email is null;

create or replace function tradek.handle_new_user() returns trigger
language plpgsql security definer set search_path = tradek, public as $$
begin
  insert into tradek.profiles (id, nome, role, company_id, cargo, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    coalesce(nullif(new.raw_user_meta_data->>'role','')::tradek.user_role, 'cliente'),
    nullif(new.raw_user_meta_data->>'company_id','')::uuid,
    nullif(new.raw_user_meta_data->>'cargo',''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end $$;
