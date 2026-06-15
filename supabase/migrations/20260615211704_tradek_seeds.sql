-- TradeK OS — Seeds (idempotentes via on conflict / where not exists)

-- ===== pipeline_statuses (mapa admin -> cliente, spec 05 §6) =====
insert into tradek.pipeline_statuses (key, label_admin, label_cliente, ordem, cor, visivel_kanban) values
  ('novo',              'Novo Lead',              'Solicitacao recebida',    1,  '#5BC8FF', true),
  ('qualificacao_ia',   'Em Qualificacao IA',     'Em triagem',              2,  '#B69BFF', true),
  ('dados_incompletos', 'Dados Incompletos',      'Aguardando informacoes',  3,  '#F5B544', true),
  ('qualificado',       'Qualificado',            'Em preparacao',           4,  '#C3F929', true),
  ('doc_solicitados',   'Documentos Solicitados', 'Documentos solicitados',  5,  '#5BC8FF', true),
  ('doc_recebidos',     'Documentos Recebidos',   'Documentos recebidos',    6,  '#5BC8FF', true),
  ('em_analise',        'Em Analise TradeK',      'Em analise',              7,  '#B69BFF', true),
  ('aprovado_proposta', 'Aprovado para Proposta', 'Em preparacao',           8,  '#C3F929', true),
  ('proposta_enviada',  'Proposta Enviada',       'Proposta enviada',        9,  '#F5B544', true),
  ('negociacao',        'Em Negociacao',          'Em negociacao',           10, '#F5B544', true),
  ('ganho',             'Ganho',                  'Concluido',               11, '#7FE05B', true),
  ('perdido',           'Perdido',                'Encerrado',               12, '#FF6B57', true),
  ('desqualificado',    'Desqualificado',         'Encerrado',               13, '#FF6B57', true),
  ('arquivado',         'Arquivado',              'Encerrado',               14, '#6E7568', false)
on conflict (key) do nothing;

-- ===== settings =====
insert into tradek.settings (chave, valor) values
  ('empresa', '{"nome":"TradeK","tagline":"O sistema operacional do trade China-Brasil","site":"https://tradek.com.br"}'::jsonb),
  ('unidades', '["supply_chain_finance","procurement","produtos_motos","suporte_importacao"]'::jsonb),
  ('lgpd', '{"politica_url":"/privacidade","retencao_documentos_dias":1825}'::jsonb),
  ('seguranca', '{"sessao_expira_min":120,"max_tentativas_login":5}'::jsonb)
on conflict (chave) do nothing;

-- ===== email_templates (spec 04 §21 + corpos 09/12) =====
insert into tradek.email_templates (nome, chave, assunto, corpo_html, variaveis) values
  ('Novo lead recebido', 'novo_lead', 'Novo lead: {{empresa}} ({{unidade}})',
   '<p>Novo lead recebido.</p><p><b>Empresa:</b> {{empresa}}<br><b>Unidade:</b> {{unidade}}<br><b>Score:</b> {{score}}</p><p>{{resumo_ia}}</p><p><b>Proxima acao:</b> {{proxima_acao}}</p>',
   '{empresa,unidade,score,resumo_ia,proxima_acao}'),
  ('Lead qualificado', 'lead_qualificado', 'Lead qualificado: {{empresa}}',
   '<p>O lead da empresa <b>{{empresa}}</b> foi qualificado (score {{score}}).</p><p><b>Responsavel:</b> {{responsavel}}<br><b>Proxima acao:</b> {{proxima_acao}}</p>',
   '{empresa,score,responsavel,proxima_acao}'),
  ('Convite cliente', 'convite_cliente', 'Seu acesso ao portal TradeK',
   '<p>Ola, {{nome_cliente}}.</p><p>Voce recebeu acesso ao portal TradeK para acompanhar sua solicitacao de {{unidade}}.</p><p><a href="{{link_portal}}">Acessar o portal</a></p>',
   '{nome_cliente,unidade,link_portal}'),
  ('Solicitacao de documentos', 'solicitacao_documentos', 'Documentos pendentes - TradeK',
   '<p>Ola, {{nome_cliente}}.</p><p>Para avancarmos com sua solicitacao de {{unidade}}, envie os documentos abaixo pelo portal:</p><p>{{documentos_pendentes}}</p><p><a href="{{link_portal}}">Acessar o portal</a></p>',
   '{nome_cliente,unidade,documentos_pendentes,link_portal}'),
  ('Documento recebido', 'documento_recebido', 'Documento recebido - {{empresa}}',
   '<p>A empresa <b>{{empresa}}</b> enviou um novo documento para revisao.</p>',
   '{empresa}'),
  ('Documento reprovado', 'documento_reprovado', 'Documento precisa ser reenviado',
   '<p>Ola, {{nome_cliente}}.</p><p>O documento <b>{{documento}}</b> precisa ser reenviado.</p><p><b>Motivo:</b> {{motivo_reprovacao}}</p><p><a href="{{link_portal}}">Reenviar pelo portal</a></p>',
   '{nome_cliente,documento,motivo_reprovacao,link_portal}'),
  ('Nova mensagem', 'nova_mensagem', 'Nova mensagem - TradeK',
   '<p>Ola, {{nome_cliente}}.</p><p>Voce tem uma nova mensagem da equipe TradeK.</p><p><a href="{{link_portal}}">Ver mensagem</a></p>',
   '{nome_cliente,link_portal}'),
  ('Proposta enviada', 'proposta_enviada', 'Proposta TradeK - {{empresa}}',
   '<p>Ola, {{nome_cliente}}.</p><p>Sua proposta esta disponivel no portal.</p><p><a href="{{link_portal}}">Ver proposta</a></p>',
   '{nome_cliente,empresa,link_portal}'),
  ('Alteracao de status', 'alteracao_status', 'Atualizacao da sua solicitacao - TradeK',
   '<p>Ola, {{nome_cliente}}.</p><p>O status da sua solicitacao mudou para: <b>{{status}}</b>.</p><p><a href="{{link_portal}}">Acompanhar</a></p>',
   '{nome_cliente,status,link_portal}')
on conflict (chave) do nothing;

-- ===== agent_configs (spec 08 §11 prompts + §5 perguntas) =====
insert into tradek.agent_configs (nome, unidade, mensagem_inicial, perguntas_obrigatorias, score_minimo, status_inicial, produtos_consultaveis, guardrails, prompt) values
  ('Agente Geral TradeK', 'outro',
   'Ola! Sou o Agente TradeK. Como posso te ajudar hoje?',
   '["Nome","Empresa","CNPJ","E-mail","WhatsApp","Unidade de interesse","Descricao da demanda","Consentimento de contato"]'::jsonb,
   60, 'qualificacao_ia', false,
   'A IA nao deve aprovar credito, garantir financiamento, prazo ou homologacao, nem inventar preco. A analise final e sempre humana.',
   'Voce e o Agente TradeK. Sua funcao e atender visitantes, entender a necessidade, coletar dados minimos e direcionar para a unidade correta: Supply Chain Finance, Procurement, Produtos/Motos ou Suporte. Nao prometa aprovacao financeira, preco final, prazo definitivo ou homologacao. Quando houver duvida sensivel, colete os dados e encaminhe para a equipe humana.'),
  ('Agente Supply Chain Finance', 'supply_chain_finance',
   'Posso te explicar como importar com prazo de pagamento preservando capital de giro. Vamos comecar?',
   '["Qual produto pretende importar?","Qual o valor FOB estimado?","O fornecedor ja esta definido?","O fornecedor esta na China ou outro pais asiatico?","Ja possui invoice, proforma ou pedido?","Sua empresa possui RADAR/Siscomex?","Qual tipo de RADAR?","Qual prazo de pagamento desejado?","A operacao e recorrente ou pontual?","Quais documentos sua empresa ja tem disponiveis?"]'::jsonb,
   60, 'qualificacao_ia', false,
   'Condicoes dependem de analise cadastral, documental, financeira e aprovacao. Nao garantir credito, prazo ou taxa.',
   'Voce e o agente de Supply Chain Finance da TradeK. Ajude empresas brasileiras interessadas em importar com prazo, preservando capital de giro. Explique que condicoes dependem de analise cadastral, documental, financeira e aprovacao. Colete: empresa, CNPJ, contato, produto, valor FOB, fornecedor, pais, status da negociacao, RADAR, prazo desejado e documentos disponiveis.'),
  ('Agente Procurement Internacional', 'procurement',
   'Vou coletar os requisitos para buscarmos e validarmos fornecedores internacionais para voce.',
   '["Qual produto/categoria busca?","Possui especificacoes tecnicas?","Qual volume estimado?","Qual orcamento-alvo?","Qual prazo?","Ha certificacoes obrigatorias?","O produto sera vendido no Brasil?","Precisa de amostra?","Precisa de inspecao?","Ja tem fornecedor atual?"]'::jsonb,
   60, 'qualificacao_ia', false,
   'Nao garantir compra do fornecedor nem confirmar preco final sem validacao humana.',
   'Voce e o agente de Procurement Internacional da TradeK. Sua funcao e coletar requisitos tecnicos e comerciais para busca, validacao e negociacao com fornecedores internacionais. Colete produto, especificacoes, volume, orcamento, prazo, certificacoes, mercado de destino, amostra, inspecao e fornecedor atual.'),
  ('Agente Produtos/Motos', 'produtos_motos',
   'Posso apresentar nossos modelos e entender seu perfil comercial. Qual modelo te interessa?',
   '["Qual modelo ou categoria te interessa?","Qual quantidade estimada?","Pretende importar, distribuir ou revender?","Qual sua regiao de atuacao?","Qual prazo de compra?","Ja trabalha com veiculos/produtos importados?","Precisa de homologacao?","Deseja proposta comercial?"]'::jsonb,
   60, 'qualificacao_ia', true,
   'So informar preco se o produto estiver publicado, com tabela aprovada e permissao de cotacao IA. Caso contrario, registrar interesse e encaminhar para proposta humana.',
   'Voce e o agente comercial de Produtos/Motos da TradeK. Apresente produtos cadastrados, colete perfil comercial e identifique se o visitante busca comprar, importar, distribuir ou revender. So informe preco se o produto estiver ativo, com tabela aprovada e permissao de cotacao IA. Caso contrario, registre interesse e encaminhe para proposta humana.'),
  ('Agente Suporte / Cliente', 'suporte_importacao',
   'Posso ajudar com duvidas sobre sua operacao, documentos e acesso ao portal.',
   '["CNPJ","Descricao da operacao","Produto","Pais de origem","Fornecedor","Duvida principal"]'::jsonb,
   40, 'qualificacao_ia', false,
   'Nao fornecer parecer juridico, fiscal ou aduaneiro definitivo. Escalar casos sensiveis para humano.',
   'Voce e o agente de Suporte da TradeK. Identifique clientes existentes, oriente o login no portal, encaminhe duvidas sobre documentos, crie interacao de suporte e escale para humano quando necessario.')
on conflict do nothing;

-- ===== checklists + itens (spec 09) =====
insert into tradek.checklists (nome, unidade) values
  ('Checklist Supply Chain Finance', 'supply_chain_finance'),
  ('Checklist Procurement', 'procurement'),
  ('Checklist Produtos/Motos', 'produtos_motos'),
  ('Checklist Suporte/Importacao', 'suporte_importacao')
on conflict do nothing;

insert into tradek.checklist_items (checklist_id, tipo_documento, descricao, obrigatorio, ordem)
select c.id, v.tipo, v.descr, v.obrig, v.ord
from tradek.checklists c
join (values
  ('Contrato Social', 'Contrato Social ou Requerimento de Empresario', true, 1),
  ('Cartao CNPJ', 'Cartao CNPJ atualizado', true, 2),
  ('Comprovante de Endereco', 'Comprovante de endereco da empresa', true, 3),
  ('RG e CPF do Representante Legal', 'Documento do representante legal', true, 4),
  ('Ficha Cadastral PJ', 'Ficha cadastral preenchida', true, 5),
  ('Comprovante RADAR/Siscomex', 'Se ja possuir habilitacao', false, 6),
  ('Invoice/Proforma/Pedido', 'Documento comercial do fornecedor, se houver', false, 7),
  ('Dados Bancarios', 'Bancos, agencias e contas', true, 8),
  ('Referencias Comerciais', 'Empresas e telefones de referencia', false, 9)
) as v(tipo, descr, obrig, ord) on true
where c.nome = 'Checklist Supply Chain Finance'
  and not exists (select 1 from tradek.checklist_items i where i.checklist_id = c.id);

insert into tradek.checklist_items (checklist_id, tipo_documento, descricao, obrigatorio, ordem)
select c.id, v.tipo, v.descr, v.obrig, v.ord
from tradek.checklists c
join (values
  ('Briefing Tecnico', 'Briefing tecnico do produto', true, 1),
  ('Especificacoes Tecnicas', 'Especificacoes tecnicas detalhadas', true, 2),
  ('Fotos/Referencias', 'Fotos ou referencias do produto', false, 3),
  ('Certificacoes Exigidas', 'Certificacoes obrigatorias, se houver', false, 4)
) as v(tipo, descr, obrig, ord) on true
where c.nome = 'Checklist Procurement'
  and not exists (select 1 from tradek.checklist_items i where i.checklist_id = c.id);

insert into tradek.checklist_items (checklist_id, tipo_documento, descricao, obrigatorio, ordem)
select c.id, v.tipo, v.descr, v.obrig, v.ord
from tradek.checklists c
join (values
  ('Contrato Social', 'Contrato Social', true, 1),
  ('Cartao CNPJ', 'Cartao CNPJ', true, 2),
  ('Comprovante de Endereco', 'Comprovante de endereco', true, 3),
  ('Documento Representante Legal', 'Documento do representante legal', true, 4),
  ('Plano Comercial', 'Apresentacao da empresa ou plano comercial', false, 5)
) as v(tipo, descr, obrig, ord) on true
where c.nome = 'Checklist Produtos/Motos'
  and not exists (select 1 from tradek.checklist_items i where i.checklist_id = c.id);

insert into tradek.checklist_items (checklist_id, tipo_documento, descricao, obrigatorio, ordem)
select c.id, v.tipo, v.descr, v.obrig, v.ord
from tradek.checklists c
join (values
  ('CNPJ', 'Cartao CNPJ', true, 1),
  ('Invoice/Proforma', 'Documento comercial da operacao', false, 2),
  ('Documentos Disponiveis', 'Outros documentos da operacao', false, 3)
) as v(tipo, descr, obrig, ord) on true
where c.nome = 'Checklist Suporte/Importacao'
  and not exists (select 1 from tradek.checklist_items i where i.checklist_id = c.id);

-- ===== notification_rules iniciais (e-mails placeholder ate Resend) =====
insert into tradek.notification_rules (nome, evento, emails_para, template_id, ativo, enviar_resumo_ia)
select v.nome, v.evento, v.emails, t.id, true, v.resumo
from (values
  ('Novo lead -> comercial', 'lead.created', '{comercial@tradek.com.br}'::text[], 'novo_lead', true),
  ('Lead qualificado -> responsavel', 'lead.qualified', '{comercial@tradek.com.br}'::text[], 'lead_qualificado', true),
  ('Documento enviado -> operacional', 'lead.document_uploaded', '{operacional@tradek.com.br}'::text[], 'documento_recebido', false)
) as v(nome, evento, emails, chave, resumo)
join tradek.email_templates t on t.chave = v.chave
where not exists (select 1 from tradek.notification_rules r where r.nome = v.nome);

-- ===== catalogo de motos (spec 10) =====
insert into tradek.products
  (modelo, categoria, descricao_curta, motor, velocidade, autonomia, freios, bateria, moq,
   preco_base, moeda, condicao_comercial, imagens, status, publicado_site, permitir_cotacao_ia)
select * from (values
  ('X21','Moto Eletrica','Moto eletrica 1000W','1000W','50 km/h','50 km','Disco dianteiro e traseiro','60V-20AH Lithium','One container',439,'USD','FOB - confirmar','["/motos/X21.png"]'::jsonb,'publicado',true,false),
  ('Bubble','Moto Eletrica','Scooter eletrica 500W','500W','40 km/h','40 km','Tambor dianteiro e traseiro','48V-20AH Lithium','One container',157,'USD','FOB - confirmar','["/motos/BUB.png"]'::jsonb,'publicado',true,false),
  ('Number Nine','Moto Eletrica','Moto eletrica 800W','800W','45 km/h','40 km','Tambor dianteiro e traseiro','48V-20AH Lithium','One container',236,'USD','FOB - confirmar','["/motos/NN.png"]'::jsonb,'publicado',true,false),
  ('ZH3','Moto Eletrica','Moto eletrica 1000W','1000W','50 km/h','50 km','Disco dianteiro e tambor traseiro','60V-20AH Lithium','One container',295,'USD','FOB - confirmar','["/motos/ZH3.png"]'::jsonb,'publicado',true,false),
  ('GE','Moto Eletrica','Scooter eletrica 350W','350W','30 km/h','30 km','Tambor dianteiro e traseiro','48V-12A Lithium','One container',116,'USD','FOB - confirmar','["/motos/GE.png"]'::jsonb,'publicado',true,false),
  ('HY','Moto Eletrica','Scooter eletrica 350W','350W','30 km/h','30 km','Tambor dianteiro e traseiro','48V-12A Lithium','One container',110,'USD','FOB - confirmar','["/motos/HY.png"]'::jsonb,'publicado',true,false),
  ('DF17','Moto Eletrica','Scooter eletrica 500W','500W','35-40 km/h','45-50 km','Tambor dianteiro e traseiro','48V-20AH Lithium','One container',225,'USD','FOB - confirmar','["/motos/DF17.png"]'::jsonb,'publicado',true,false)
) as v(modelo,categoria,descricao_curta,motor,velocidade,autonomia,freios,bateria,moq,preco_base,moeda,condicao_comercial,imagens,status,publicado_site,permitir_cotacao_ia)
where not exists (select 1 from tradek.products p where p.modelo = v.modelo);
