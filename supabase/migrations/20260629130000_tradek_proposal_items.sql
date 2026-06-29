-- Permite que uma cotação (proposals) tenha vários produtos/itens, em vez de um único
-- produto por cotação. Migra os dados existentes (product_id/quantidade em proposals)
-- para a nova tabela tradek.proposal_items e remove as colunas antigas.

create table if not exists tradek.proposal_items (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references tradek.proposals(id) on delete cascade,
  product_id uuid references tradek.products(id) on delete set null,
  quantidade numeric not null,
  valor_unit numeric not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists proposal_items_proposal_idx on tradek.proposal_items (proposal_id);
create index if not exists proposal_items_product_idx on tradek.proposal_items (product_id);

insert into tradek.proposal_items (proposal_id, product_id, quantidade, valor_unit)
select id, product_id, quantidade, case when quantidade > 0 then round(valor / quantidade, 2) else valor end
from tradek.proposals
where product_id is not null and quantidade is not null;

alter table tradek.proposals
  drop column if exists product_id,
  drop column if exists quantidade;

-- RLS: mesmo padrão das demais tabelas internas (ver 20260615230616_tradek_hardening.sql)
alter table tradek.proposal_items enable row level security;
create policy internal_read_proposal_items on tradek.proposal_items for select to authenticated using (tradek.is_internal());
create policy internal_ins_proposal_items on tradek.proposal_items for insert to authenticated with check (tradek.can_write());
create policy internal_upd_proposal_items on tradek.proposal_items for update to authenticated using (tradek.can_write()) with check (tradek.can_write());
create policy internal_del_proposal_items on tradek.proposal_items for delete to authenticated using (tradek.can_write());

-- cliente: lê os itens das cotações (não-rascunho) da própria empresa, igual a client_proposals_select
create policy client_proposal_items_select on tradek.proposal_items
  for select to authenticated using (
    proposal_id in (
      select p.id from tradek.proposals p
      join tradek.leads l on l.id = p.lead_id
      where p.status <> 'rascunho' and l.company_id = tradek.current_user_company()
    )
  );

-- trigger de auditoria, igual às demais tabelas comerciais
drop trigger if exists trg_audit_proposal_items on tradek.proposal_items;
create trigger trg_audit_proposal_items after insert or update or delete on tradek.proposal_items for each row execute function tradek.audit();
