-- Campo extra para dados adicionais do contato (cidade_estado, canal, etc.)
alter table tradek.contacts add column if not exists dados_extras jsonb default null;
