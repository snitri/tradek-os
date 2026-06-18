-- Passo 2: migra leads e substitui colunas do pipeline

-- Migra status antigos para os novos equivalentes
update tradek.leads set status = 'qualificacao_ia'    where status = 'dados_incompletos';
update tradek.leads set status = 'doc_solicitados'    where status = 'qualificado';
update tradek.leads set status = 'pronto_atendimento' where status in ('doc_recebidos', 'em_analise', 'aprovado_proposta');
update tradek.leads set status = 'docs_china'         where status in ('proposta_enviada', 'negociacao');
update tradek.leads set status = 'contrato_fechado'   where status = 'ganho';
update tradek.leads set status = 'proposta_recusada'  where status = 'perdido';
update tradek.leads set status = 'desqualificado'     where status = 'arquivado';

-- Substitui as colunas do pipeline
delete from tradek.pipeline_statuses;

insert into tradek.pipeline_statuses (key, label_admin, label_cliente, ordem, cor, visivel_kanban) values
  ('novo',               'Novo Lead',                  'Solicitação recebida',   1, '#5BC8FF', true),
  ('qualificacao_ia',    'Em Qualificação',            'Em triagem',             2, '#B69BFF', true),
  ('doc_solicitados',    'Docs Solicitados',           'Documentos solicitados', 3, '#F5B544', true),
  ('pronto_atendimento', 'Pronto para Atendimento',    'Em preparação',          4, '#C3F929', true),
  ('docs_china',         'Docs Enviados para a China', 'Documentação enviada',   5, '#5BC8FF', true),
  ('contrato_fechado',   'Contrato Fechado',           'Contrato assinado 🎉',   6, '#7FE05B', true),
  ('proposta_recusada',  'Proposta Recusada',          'Encerrado',              7, '#FF6B57', true),
  ('desqualificado',     'Desqualificado',             'Encerrado',              8, '#6E7568', true);
