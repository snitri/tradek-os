-- Passo 2: rótulos do pipeline para o fluxo de autocadastro no Portal
-- ("Fluxo de Cadastro e Qualificação Automática de Lead").
update tradek.pipeline_statuses set label_admin = 'Novo Lead - Em Análise' where key = 'novo';

insert into tradek.pipeline_statuses (key, label_admin, label_cliente, ordem, cor, visivel_kanban) values
  ('lead_qualificado',        'Lead Qualificado',           'Em análise pela equipe', 2, '#7FE05B', true),
  ('lead_pendente_consulta',  'Lead Pendente de Consulta',  'Em análise pela equipe', 2, '#F5B544', true)
on conflict (key) do update set label_admin = excluded.label_admin, label_cliente = excluded.label_cliente, cor = excluded.cor;
