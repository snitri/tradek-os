-- TradeK OS — cliente mantém os próprios dados (ficha cadastral; status de documento ao enviar)

-- cliente edita a própria empresa (ficha cadastral)
create policy client_company_update on tradek.companies
  for update to authenticated
  using (id = tradek.current_user_company())
  with check (id = tradek.current_user_company());

-- cliente atualiza status das próprias solicitações de documento (ao enviar)
create policy client_doc_requests_update on tradek.document_requests
  for update to authenticated
  using (company_id = tradek.current_user_company())
  with check (company_id = tradek.current_user_company());
