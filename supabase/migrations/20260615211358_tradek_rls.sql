-- TradeK OS — Row Level Security
-- Estratégia: RLS em todas as tabelas; internos (role <> cliente) têm acesso total;
-- cliente é restrito à própria empresa e nunca vê campos internos; anônimo só lê
-- produtos/serviços publicados (para o site público).

-- ===== 1) RLS ON + política "internal_all" em TODAS as tabelas de tradek =====
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'tradek'
  loop
    execute format('alter table tradek.%I enable row level security', t);
    execute format(
      'create policy %I on tradek.%I for all to authenticated '
      || 'using (tradek.is_internal()) with check (tradek.is_internal())',
      'internal_all_'||t, t);
  end loop;
end $$;

-- ===== 2) Anti-escalada: cliente não altera role/company/flags no próprio profile =====
create or replace function tradek.guard_profile_self() returns trigger
language plpgsql security definer set search_path = tradek, public as $$
begin
  if not tradek.is_internal() then
    new.role := old.role;
    new.company_id := old.company_id;
    new.ativo := old.ativo;
    new.bloqueado := old.bloqueado;
  end if;
  return new;
end $$;
create trigger trg_profiles_guard before update on tradek.profiles
  for each row execute function tradek.guard_profile_self();

-- ===== 3) Políticas do CLIENTE (role = cliente) =====

-- profiles: lê/edita o próprio
create policy client_profile_select on tradek.profiles
  for select to authenticated using (id = auth.uid());
create policy client_profile_update on tradek.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- companies: lê a própria empresa
create policy client_company_select on tradek.companies
  for select to authenticated using (id = tradek.current_user_company());

-- contacts: CRUD nos contatos da própria empresa
create policy client_contacts_select on tradek.contacts
  for select to authenticated using (company_id = tradek.current_user_company());
create policy client_contacts_insert on tradek.contacts
  for insert to authenticated with check (company_id = tradek.current_user_company());
create policy client_contacts_update on tradek.contacts
  for update to authenticated using (company_id = tradek.current_user_company())
  with check (company_id = tradek.current_user_company());

-- leads: lê (somente) as oportunidades da própria empresa
create policy client_leads_select on tradek.leads
  for select to authenticated using (company_id = tradek.current_user_company());

-- document_requests: lê o checklist da própria empresa
create policy client_doc_requests_select on tradek.document_requests
  for select to authenticated using (company_id = tradek.current_user_company());

-- documents: lê e envia documentos da própria empresa
create policy client_documents_select on tradek.documents
  for select to authenticated using (company_id = tradek.current_user_company());
create policy client_documents_insert on tradek.documents
  for insert to authenticated with check (company_id = tradek.current_user_company());

-- interactions: lê só as visíveis ao cliente da própria empresa; envia mensagens próprias
create policy client_interactions_select on tradek.interactions
  for select to authenticated using (
    visivel_cliente = true
    and lead_id in (select id from tradek.leads where company_id = tradek.current_user_company())
  );
create policy client_interactions_insert on tradek.interactions
  for insert to authenticated with check (
    visivel_cliente = true
    and autor_tipo = 'cliente'
    and lead_id in (select id from tradek.leads where company_id = tradek.current_user_company())
  );

-- proposals: lê as propostas (não-rascunho) da própria empresa
create policy client_proposals_select on tradek.proposals
  for select to authenticated using (
    status <> 'rascunho'
    and lead_id in (select id from tradek.leads where company_id = tradek.current_user_company())
  );

-- notifications: lê/atualiza as próprias
create policy client_notifications_select on tradek.notifications
  for select to authenticated using (user_id = auth.uid());
create policy client_notifications_update on tradek.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- pipeline_statuses: rótulos não-sensíveis, legível por qualquer autenticado
create policy client_pipeline_select on tradek.pipeline_statuses
  for select to authenticated using (true);

-- ===== 4) ANÔNIMO (site público): só produtos/serviços publicados =====
create policy public_products_select on tradek.products
  for select to anon, authenticated using (publicado_site = true);
create policy public_services_select on tradek.services
  for select to anon, authenticated using (status = 'ativo');
