-- Adiciona e-mail da equipe comercial em todas as regras de qualificação de lead
update tradek.notification_rules
set emails_para = array['snitri@me.com']
where evento = 'lead.ia_qualificado'
  and (emails_para is null or emails_para = '{}');
