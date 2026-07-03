-- Adiciona opções de cores disponíveis no produto e cores escolhidas por item de cotação
alter table tradek.products
  add column if not exists cores_disponiveis text[] not null default '{}';

alter table tradek.proposal_items
  add column if not exists cores_escolhidas text[] not null default '{}';
