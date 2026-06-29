-- Permite vincular uma cotação (proposals) a um produto do catálogo e a uma quantidade,
-- para suportar a criação manual de cotações pelo Admin a partir de um produto existente.
alter table tradek.proposals
  add column if not exists product_id uuid references tradek.products(id) on delete set null,
  add column if not exists quantidade numeric;

create index if not exists proposals_product_idx on tradek.proposals (product_id);
