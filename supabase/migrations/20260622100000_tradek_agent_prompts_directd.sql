-- Reforça nos 3 prompts de unidade (SCF, Procurement, Produtos):
-- 1) coleta explícita de Cargo + CNPJ na Etapa 1, com explicação do motivo
--    (análise de crédito/jurídica via DirectD) e chamada da tool registrar_contato
--    assim que os 6 dados mínimos estiverem completos;
-- 2) novos campos no registrar_lead (valor_estimado, moeda, prazo_desejado, urgencia);
-- 3) corrige o prompt de Produtos, que tinha a regra de formatação (1 asterisco)
--    apenas como texto residual de instrução, nunca de fato aplicada ao modelo.

-- 1) Lista de identificação da Etapa 1 — comum aos 3 prompts
update tradek.agent_configs
set prompt = replace(
  prompt,
  E'  - Nome completo\n  - Empresa\n  - Telefone / WhatsApp\n  - E-mail\n  - Cidade / Estado\n',
  E'  - Nome completo\n  - Cargo\n  - Empresa\n  - CNPJ\n  - Telefone / WhatsApp\n  - E-mail\n  - Cidade / Estado\n* Explique que o CNPJ é necessário para a análise de crédito e jurídica da empresa (Score de Crédito e Processos Judiciais via DirectD), o que agiliza a aprovação da operação — insista educadamente se o lead hesitar em informar, sem prosseguir sem ele.\n* Assim que tiver nome, cargo, e-mail, telefone/WhatsApp, empresa e CNPJ, chame IMEDIATAMENTE a tool `registrar_contato` para registrar o contato no CRM.\n'
)
where unidade in ('supply_chain_finance', 'procurement', 'produtos_motos')
  and prompt like '%- Cidade / Estado%'
  and prompt not like '%Assim que tiver nome, cargo%';

-- 2) Critério para avançar da Etapa 1 — comum aos 3 prompts
update tradek.agent_configs
set prompt = replace(
  prompt,
  E'### Critério para Avançar\nLead forneceu pelo menos nome, empresa e um meio de contato.',
  E'### Critério para Avançar\nLead forneceu nome, cargo, e-mail, telefone/WhatsApp, empresa e CNPJ (os 6 dados mínimos), e o contato já foi registrado via `registrar_contato`.'
)
where unidade in ('supply_chain_finance', 'procurement', 'produtos_motos');

-- 3) Campos do registrar_lead — um update por unidade (o texto inline cita a própria unidade)
update tradek.agent_configs
set prompt = replace(
  prompt,
  'nome, empresa, cnpj (se informado), email, whatsapp, cidade_estado, unidade (supply_chain_finance), demanda, valor, score e classificacao.',
  'nome, empresa, cnpj, email, whatsapp, cidade_estado, unidade (supply_chain_finance), demanda, valor, valor_estimado, moeda, prazo_desejado, urgencia, o_que_quer, o_que_nao_quer, score, classificacao e resumo_estruturado (resumo completo da conversa).'
)
where unidade = 'supply_chain_finance';

update tradek.agent_configs
set prompt = replace(
  prompt,
  'nome, empresa, cnpj (se informado), email, whatsapp, cidade_estado, unidade (procurement), demanda, valor, score e classificacao.',
  'nome, empresa, cnpj, email, whatsapp, cidade_estado, unidade (procurement), demanda, valor, valor_estimado, moeda, prazo_desejado, urgencia, o_que_quer, o_que_nao_quer, score, classificacao e resumo_estruturado (resumo completo da conversa).'
)
where unidade = 'procurement';

update tradek.agent_configs
set prompt = replace(
  prompt,
  'nome, empresa, cnpj (se informado), email, whatsapp, cidade_estado, unidade (produtos_motos), demanda, valor, score e classificacao.',
  'nome, empresa, cnpj, email, whatsapp, cidade_estado, unidade (produtos_motos), demanda, valor, valor_estimado, moeda, prazo_desejado, urgencia, o_que_quer, o_que_nao_quer, score, classificacao e resumo_estruturado (resumo completo da conversa).'
)
where unidade = 'produtos_motos';

-- 4) Corrige o prompt de Produtos: remove o texto residual de instrução e aplica
--    de fato a regra de formatação de 1 asterisco, na posição correta.
update tradek.agent_configs
set prompt = replace(
  prompt,
  E'Seu objetivo final é conectar empresas brasileiras a produtos de qualidade da China com segurança, suporte completo de importação e parceria especializada da TradeK.\n\nEssa regra também precisa estar nos prompts dos três agentes que você vai colar no painel. Adicione ao final de cada prompt, antes do parágrafo "Seu objetivo final":\n\n```\nFORMATAÇÃO OBRIGATÓRIA: use sempre 1 asterisco para destaque (*texto*), nunca 2 asteriscos (**texto**). O canal é WhatsApp e chat — Markdown com duplo asterisco não é renderizado corretamente.\n```',
  E'FORMATAÇÃO OBRIGATÓRIA: use sempre 1 asterisco para destaque (*texto*), nunca 2 asteriscos (**texto**). O canal é WhatsApp e chat — Markdown com duplo asterisco não é renderizado corretamente.\n\nSeu objetivo final é conectar empresas brasileiras a produtos de qualidade da China com segurança, suporte completo de importação e parceria especializada da TradeK.'
)
where unidade = 'produtos_motos';
