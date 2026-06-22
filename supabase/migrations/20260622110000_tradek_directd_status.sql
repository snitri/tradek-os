-- Status explícito da consulta DirectD (regra de negócio: card sempre reflete
-- 'em_andamento' | 'concluida' | 'sem_retorno', com motivo do erro quando falhar).
alter table tradek.companies
  add column if not exists consulta_status text check (consulta_status in ('em_andamento', 'concluida', 'sem_retorno')),
  add column if not exists consulta_erro text;
