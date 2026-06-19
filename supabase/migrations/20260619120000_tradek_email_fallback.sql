-- Regra genérica (fallback): cobre qualquer unidade sem regra específica,
-- incluindo suporte_importacao e leads sem unidade definida.
insert into tradek.notification_rules (nome, evento, emails_para, template_id, ativo, enviar_resumo_ia, unidade)
select
  'Resumo IA — Geral (fallback)',
  'lead.ia_qualificado',
  array['snitri@me.com'],
  id,
  true,
  true,
  null
from tradek.email_templates
where chave = 'lead_ia_scf'
on conflict do nothing;

-- Regra específica para suporte_importacao
insert into tradek.notification_rules (nome, evento, emails_para, template_id, ativo, enviar_resumo_ia, unidade)
select
  'Resumo IA — Suporte',
  'lead.ia_qualificado',
  array['snitri@me.com'],
  id,
  true,
  true,
  'suporte_importacao'
from tradek.email_templates
where chave = 'lead_ia_scf'
on conflict do nothing;
