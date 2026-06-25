-- Migra o e-mail interno de notificações (lead qualificado, alertas, etc.)
-- do endereço de teste (snitri@me.com) para o e-mail oficial da equipe.
update tradek.notification_rules
set emails_para = array['tradek@globalk.com.br']
where emails_para @> array['snitri@me.com']::text[];

-- também substitui dentro de emails_cc, se houver
update tradek.notification_rules
set emails_cc = array['tradek@globalk.com.br']
where emails_cc @> array['snitri@me.com']::text[];
