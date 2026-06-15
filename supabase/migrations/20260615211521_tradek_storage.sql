-- TradeK OS — Storage: buckets e policies
-- Convenção de path para documentos: {company_id}/{lead_id}/{arquivo}

insert into storage.buckets (id, name, public)
values
  ('tradek-documents', 'tradek-documents', false),
  ('tradek-rag',       'tradek-rag',       false),
  ('tradek-products',  'tradek-products',  true)
on conflict (id) do nothing;

-- ===== tradek-products (público p/ imagens; escrita só interna) =====
create policy "tradek products public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'tradek-products');

create policy "tradek products internal write" on storage.objects
  for all to authenticated
  using (bucket_id = 'tradek-products' and tradek.is_internal())
  with check (bucket_id = 'tradek-products' and tradek.is_internal());

-- ===== tradek-documents (privado) =====
-- internos: acesso total
create policy "tradek documents internal" on storage.objects
  for all to authenticated
  using (bucket_id = 'tradek-documents' and tradek.is_internal())
  with check (bucket_id = 'tradek-documents' and tradek.is_internal());

-- cliente: lê/escreve apenas dentro da pasta da própria empresa
create policy "tradek documents client read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'tradek-documents'
    and (storage.foldername(name))[1] = tradek.current_user_company()::text
  );

create policy "tradek documents client write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'tradek-documents'
    and (storage.foldername(name))[1] = tradek.current_user_company()::text
  );

-- ===== tradek-rag (privado; só interno) =====
create policy "tradek rag internal" on storage.objects
  for all to authenticated
  using (bucket_id = 'tradek-rag' and tradek.is_internal())
  with check (bucket_id = 'tradek-rag' and tradek.is_internal());
