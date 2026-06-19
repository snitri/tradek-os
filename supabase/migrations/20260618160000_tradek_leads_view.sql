-- View de leads com os campos principais na frente para facilitar visualização no Supabase
create or replace view tradek.vw_leads as
select
  l.id,
  c.nome                                                        as nome,
  coalesce(co.nome_fantasia, co.razao_social)                  as empresa,
  c.whatsapp                                                    as telefone_whatsapp,
  c.email                                                       as email,
  coalesce(
    l.dados_coletados->>'cidade_estado',
    l.dados_coletados->>'cidade'
  )                                                             as cidade_estado,
  l.unidade,
  l.status,
  l.score_ia                                                    as score,
  l.classificacao,
  l.origem,
  l.produto_servico_interesse                                   as demanda,
  l.volume_estimado                                             as volume,
  l.resumo_ia                                                   as resumo,
  l.consentimento_lgpd,
  l.created_at
from tradek.leads l
left join tradek.contacts  c  on c.id = l.contact_id
left join tradek.companies co on co.id = l.company_id
order by l.created_at desc;

-- Permissão de leitura para usuários autenticados internos
grant select on tradek.vw_leads to authenticated;
