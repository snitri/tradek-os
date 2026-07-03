-- Adiciona coluna hs_code na tabela products para classificação tarifária
alter table tradek.products
  add column if not exists hs_code text;
