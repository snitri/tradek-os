-- Adiciona o ID do card/lead no corpo do e-mail, próximo ao botão final,
-- satisfazendo a regra de negócio de sempre referenciar o card no CRM.
-- Os templates usam {{link_portal}} como href mesmo no botão "Acessar CRM"
-- (texto visível difere do nome da variável), então a âncora é pelo texto.

update tradek.email_templates
set corpo_html = regexp_replace(
  corpo_html,
  '(<a href="\{\{link_portal\}\}"[^>]*>(Acessar CRM|Acessar Portal do Cliente)</a>)',
  '\1<p style="margin:10px 0 0;font-size:11px;color:#4A4F44;text-align:center;">ID do card: {{lead_id}}</p>',
  1
)
where nome in ('Resumo IA — Supply Chain Finance', 'Resumo IA — Procurement', 'Resumo IA — Produtos da China')
  and corpo_html not like '%ID do card%';
