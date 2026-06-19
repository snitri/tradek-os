-- Corrige e-mail da equipe comercial para testes
update tradek.notification_rules
set emails_para = array['snitri@me.com']
where evento = 'lead.ia_qualificado';
