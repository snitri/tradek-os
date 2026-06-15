/* ============================================================
   TradeK OS — Mock data (China–Brasil trade)
   ============================================================ */

const PRODUCTS = [
  { id:'X21', modelo:'X21', grupo:'Mobilidade elétrica', forn:'Ningbo Leike Vehicle Co.', cidade:'Ningbo, CN', cat:'Scooter elétrica', motor:'1000W', vel:'50 km/h', aut:'50 km', freios:'Disco diant. e tras.', bat:'60V · 20AH Lítio', moq:'1 contêiner', preco:439, moeda:'USD', status:'publicado', site:true, ia:true, tabela:true, atual:'2d', tag:'Top venda' },
  { id:'ZH3', modelo:'ZH3', grupo:'Mobilidade elétrica', forn:'Wuxi Zhonghua EV', cidade:'Wuxi, CN', cat:'Scooter elétrica', motor:'1000W', vel:'50 km/h', aut:'50 km', freios:'Disco diant. / tambor tras.', bat:'60V · 20AH Lítio', moq:'1 contêiner', preco:295, moeda:'USD', status:'publicado', site:true, ia:true, tabela:true, atual:'2d', tag:'' },
  { id:'NN', modelo:'Number Nine', grupo:'Mobilidade elétrica', forn:'Jiangsu Number Mobility', cidade:'Changzhou, CN', cat:'Ciclomotor', motor:'800W', vel:'45 km/h', aut:'40 km', freios:'Tambor diant. e tras.', bat:'48V · 20AH Lítio', moq:'1 contêiner', preco:236, moeda:'USD', status:'publicado', site:true, ia:false, tabela:false, atual:'5d', tag:'' },
  { id:'DF17', modelo:'DF17', grupo:'Mobilidade elétrica', forn:'Dongfeng Light EV', cidade:'Tianjin, CN', cat:'Ciclomotor', motor:'500W', vel:'35–40 km/h', aut:'45–50 km', freios:'Tambor diant. e tras.', bat:'48V · 20AH Lítio', moq:'1 contêiner', preco:225, moeda:'USD', status:'publicado', site:true, ia:true, tabela:true, atual:'1d', tag:'' },
  { id:'BUB', modelo:'Bubble', grupo:'Mobilidade elétrica', forn:'Shenzhen Bubble Mobility', cidade:'Shenzhen, CN', cat:'Mini scooter', motor:'500W', vel:'40 km/h', aut:'40 km', freios:'Tambor diant. e tras.', bat:'48V · 20AH Lítio', moq:'1 contêiner', preco:157, moeda:'USD', status:'publicado', site:true, ia:false, tabela:false, atual:'5d', tag:'Novo' },
  { id:'GE', modelo:'GE', grupo:'Mobilidade elétrica', forn:'Guangzhou GE Electric', cidade:'Guangzhou, CN', cat:'Mini scooter', motor:'350W', vel:'30 km/h', aut:'30 km', freios:'Tambor diant. e tras.', bat:'48V · 12A Lítio', moq:'1 contêiner', preco:116, moeda:'USD', status:'em_revisao', site:false, ia:false, tabela:false, atual:'8d', tag:'' },
  { id:'HY', modelo:'HY', grupo:'Mobilidade elétrica', forn:'Hangyu Vehicle Co.', cidade:'Hangzhou, CN', cat:'Mini scooter', motor:'350W', vel:'30 km/h', aut:'30 km', freios:'Tambor diant. e tras.', bat:'48V · 12A Lítio', moq:'1 contêiner', preco:110, moeda:'USD', status:'rascunho', site:false, ia:false, tabela:false, atual:'12d', tag:'' },
];

/* categorias do catálogo de sourcing (a unidade "Produtos" é extensível) */
const PRODUCT_CATS = [
  { key:'todos', label:'Todos', icon:'box', ativo:true },
  { key:'mob', label:'Mobilidade elétrica', icon:'zap', ativo:true, count:7 },
  { key:'eletro', label:'Eletrônicos', icon:'box', ativo:false },
  { key:'casa', label:'Casa & Utilidades', icon:'home', ativo:false },
  { key:'ferr', label:'Ferramentas', icon:'settings', ativo:false },
  { key:'auto', label:'Autopeças', icon:'box', ativo:false },
];

const LEADS = [
  { id:'TK-2041', empresa:'Yamane Comércio e Importação', cnpj:'18.442.330/0001-07', contato:'Ricardo Yamane', cargo:'Diretor de Suprimentos', cidade:'São Paulo · SP', unit:'SCF', score:84, status:'docs_sol', resp:'Ana Prado', valor:'US$ 80.000', volume:'1 contêiner 40\'', origem:'Agente IA', urgencia:'Alta', ult:'há 2h', prox:'Aguardando RADAR', docPend:3, portal:true, email:'ricardo@yamaneimp.com.br', whats:'+55 11 98841-2030',
    fob:'US$ 80.000', fornecedor:'Ningbo Eletric Co.', pais:'China', incoterm:'FOB Ningbo', radar:'Não confirmado', produto:'Acessórios eletrônicos', prazoDes:'120 dias',
    quer:'Financiar importação, preservar capital de giro e pagar fornecedor direto na China.', naoQuer:'Empréstimo bancário tradicional; adiantar 40% na produção.',
    pend:['RADAR / Siscomex','Contrato social','Cartão CNPJ','Invoice / Proforma'] },
  { id:'TK-2038', empresa:'NovaRota Distribuidora', cnpj:'27.115.908/0001-44', contato:'Marina Castro', cargo:'Sócia', cidade:'Curitiba · PR', unit:'MOTOS', score:68, status:'qualif', resp:'Pedro Lima', valor:'US$ 44.000', volume:'120 un. (X21+ZH3)', origem:'Formulário', urgencia:'Média', ult:'há 5h', prox:'Enviar proposta', docPend:0, portal:false, email:'marina@novarota.com.br', whats:'+55 41 99620-1188',
    modelo:'X21 / ZH3', qtd:'120 unidades', perfil:'Revenda regional', regiao:'Sul', canal:'Loja física + marketplace', homolog:'A verificar', exp:'Sem experiência em importação',
    quer:'Iniciar revenda de scooters elétricas no Sul, importação assistida.', naoQuer:'Estoque parado; modelos sem homologação clara.',
    pend:[] },
  { id:'TK-2035', empresa:'Importadora Pacífico Ltda', cnpj:'09.883.221/0001-90', contato:'Carlos Bento', cargo:'Comprador', cidade:'Santos · SP', unit:'PROC', score:59, status:'dados_inc', resp:null, valor:'—', volume:'A definir', origem:'WhatsApp', urgencia:'Baixa', ult:'há 1d', prox:'Completar dados', docPend:0, portal:false, email:'carlos@impacifico.com.br', whats:'+55 13 98112-7745',
    categoria:'Componentes industriais', specs:'Conectores e cabos', volume2:'A definir', orcamento:'US$ 30k alvo', mercado:'Brasil', certif:'INMETRO', amostra:'Sim',
    quer:'Encontrar fornecedor chinês validado para componentes elétricos.', naoQuer:'Intermediários sem inspeção.',
    pend:[] },
  { id:'TK-2033', empresa:'EletroSul Mobilidade', cnpj:'33.027.554/0001-12', contato:'Júlia Fernandes', cargo:'CEO', cidade:'Porto Alegre · RS', unit:'MOTOS', score:77, status:'qualif', resp:'Ana Prado', valor:'US$ 61.000', volume:'1 contêiner', origem:'Agente IA', urgencia:'Alta', ult:'há 3h', prox:'Criar acesso cliente', docPend:0, portal:false, email:'julia@eletrosul.com.br', whats:'+55 51 99330-8821',
    modelo:'DF17', qtd:'1 contêiner', perfil:'Distribuidor', regiao:'Sul', canal:'Distribuição B2B', homolog:'Necessária', exp:'2 importações/ano',
    quer:'Distribuir DF17 e Bubble no RS com importação financiada.', naoQuer:'Pagamento integral antecipado.', pend:[] },
  { id:'TK-2030', empresa:'Andrade Têxtil', cnpj:'44.661.207/0001-33', contato:'Felipe Andrade', cargo:'Diretor', cidade:'Blumenau · SC', unit:'SCF', score:90, status:'analise', resp:'Pedro Lima', valor:'US$ 145.000', volume:'2 contêineres', origem:'Indicação', urgencia:'Alta', ult:'há 30min', prox:'Parecer de crédito', docPend:0, portal:true, email:'felipe@andradetextil.com.br', whats:'+55 47 99845-3320',
    fob:'US$ 145.000', fornecedor:'Shaoxing Textile Group', pais:'China', incoterm:'FOB Shanghai', radar:'Ilimitado', produto:'Tecidos técnicos', prazoDes:'180 dias',
    quer:'Linha recorrente de crédito para importação têxtil de 180 dias.', naoQuer:'Renegociar a cada compra.', pend:[] },
  { id:'TK-2028', empresa:'Sorocaba Auto Peças', cnpj:'12.554.880/0001-61', contato:'Roberto Dias', cargo:'Gerente', cidade:'Sorocaba · SP', unit:'SCF', score:52, status:'novo', resp:null, valor:'US$ 25.000', volume:'Parcial', origem:'Agente IA', urgencia:'Média', ult:'há 6h', prox:'Qualificar', docPend:0, portal:false, email:'roberto@sorocabapecas.com.br', whats:'+55 15 99772-0043',
    fob:'US$ 25.000', fornecedor:'A definir', pais:'China', incoterm:'A definir', radar:'Express', produto:'Autopeças', prazoDes:'90 dias',
    quer:'Testar importação financiada de autopeças.', naoQuer:'—', pend:[] },
  { id:'TK-2025', empresa:'Recife Distribuição', cnpj:'55.330.114/0001-08', contato:'Tânia Melo', cargo:'Compras', cidade:'Recife · PE', unit:'MOTOS', score:40, status:'novo', resp:null, valor:'—', volume:'A definir', origem:'Formulário', urgencia:'Baixa', ult:'há 8h', prox:'Qualificar', docPend:0, portal:false, email:'tania@recifedist.com.br', whats:'+55 81 99440-2299',
    modelo:'Bubble / GE', qtd:'A definir', perfil:'Revenda', regiao:'Nordeste', canal:'Loja física', homolog:'A verificar', exp:'Sem experiência',
    quer:'Entender modelos de entrada para revenda.', naoQuer:'—', pend:[] },
  { id:'TK-2022', empresa:'GloboPort Importações', cnpj:'66.114.553/0001-77', contato:'André Souza', cargo:'COO', cidade:'Itajaí · SC', unit:'PROC', score:73, status:'proposta', resp:'Ana Prado', valor:'US$ 92.000', volume:'Grande', origem:'Indicação', urgencia:'Alta', ult:'há 1d', prox:'Aguardando aceite', docPend:0, portal:true, email:'andre@globoport.com.br', whats:'+55 47 99221-7766',
    categoria:'Eletrônicos de consumo', specs:'Carregadores e fontes', volume2:'10k un.', orcamento:'US$ 90k', mercado:'Brasil', certif:'ANATEL', amostra:'Aprovada',
    quer:'Sourcing recorrente de eletrônicos com inspeção.', naoQuer:'Fornecedor sem certificação.', pend:[] },
  { id:'TK-2019', empresa:'Campinas Mobilidade', cnpj:'77.220.665/0001-21', contato:'Letícia Rocha', cargo:'Diretora', cidade:'Campinas · SP', unit:'MOTOS', score:81, status:'docs_rec', resp:'Pedro Lima', valor:'US$ 38.000', volume:'80 un.', origem:'Agente IA', urgencia:'Média', ult:'há 4h', prox:'Revisar documentos', docPend:1, portal:true, email:'leticia@campinasmob.com.br', whats:'+55 19 99008-4412',
    modelo:'ZH3', qtd:'80 unidades', perfil:'Revenda premium', regiao:'Sudeste', canal:'Showroom', homolog:'Em andamento', exp:'1 importação',
    quer:'Revenda premium de ZH3 em Campinas.', naoQuer:'—', pend:['Comprovante de endereço'] },
  { id:'TK-2015', empresa:'Manaus Trade Hub', cnpj:'88.001.774/0001-55', contato:'Bruno Aziz', cargo:'Sócio', cidade:'Manaus · AM', unit:'SCF', score:35, status:'perdido', resp:'Ana Prado', valor:'—', volume:'—', origem:'Formulário', urgencia:'Baixa', ult:'há 3d', prox:'Encerrado', docPend:0, portal:false, email:'bruno@manaustrade.com.br', whats:'+55 92 99660-1133',
    fob:'—', fornecedor:'—', pais:'China', incoterm:'—', radar:'Não possui', produto:'Diversos', prazoDes:'—',
    quer:'—', naoQuer:'Processo demorado.', pend:[], motivo:'Sem RADAR e sem interesse em regularizar agora.' },
  { id:'TK-2012', empresa:'Vale Verde Agro', cnpj:'99.114.220/0001-88', contato:'Sandra Reis', cargo:'Compras', cidade:'Cuiabá · MT', unit:'SCF', score:88, status:'docs_sol', resp:'Pedro Lima', valor:'US$ 110.000', volume:'1 contêiner', origem:'Indicação', urgencia:'Alta', ult:'há 1h', prox:'Aguardando docs', docPend:2, portal:true, email:'sandra@valeverde.com.br', whats:'+55 65 99220-7788',
    fob:'US$ 110.000', fornecedor:'Qingdao Agro Tools', pais:'China', incoterm:'FOB Qingdao', radar:'Limitado', produto:'Implementos agrícolas', prazoDes:'150 dias',
    quer:'Importar implementos com prazo estendido.', naoQuer:'Travar capital de giro na safra.', pend:['Balanço 2025','Faturamento 12m'] },
  { id:'TK-2008', empresa:'Litoral Bike Co.', cnpj:'10.557.331/0001-09', contato:'Paulo Nunes', cargo:'Dono', cidade:'Florianópolis · SC', unit:'MOTOS', score:64, status:'qualif', resp:null, valor:'US$ 22.000', volume:'50 un.', origem:'Agente IA', urgencia:'Média', ult:'há 7h', prox:'Atribuir responsável', docPend:0, portal:false, email:'paulo@litoralbike.com.br', whats:'+55 48 99771-0098',
    modelo:'Bubble', qtd:'50 unidades', perfil:'Revenda turismo', regiao:'Sul', canal:'Aluguel + venda', homolog:'A verificar', exp:'Sem experiência',
    quer:'Frota de mini scooters para locação turística.', naoQuer:'—', pend:[] },
];

const STATUSES = [
  { key:'novo', label:'Novo Lead', cliente:'Solicitação recebida', color:'var(--tx-dim)' },
  { key:'qualif_ia', label:'Em Qualificação', cliente:'Em triagem', color:'var(--info)' },
  { key:'dados_inc', label:'Dados Incompletos', cliente:'Aguardando informações', color:'var(--warn)' },
  { key:'qualif', label:'Qualificado', cliente:'Em preparação', color:'var(--lime)' },
  { key:'docs_sol', label:'Docs Solicitados', cliente:'Documentos solicitados', color:'var(--purple)' },
  { key:'docs_rec', label:'Docs Recebidos', cliente:'Documentos recebidos', color:'var(--purple)' },
  { key:'analise', label:'Em Análise', cliente:'Em análise', color:'var(--info)' },
  { key:'proposta', label:'Proposta', cliente:'Proposta enviada', color:'var(--lime)' },
  { key:'negociacao', label:'Negociação', cliente:'Em negociação', color:'var(--lime)' },
  { key:'ganho', label:'Ganho', cliente:'Concluído', color:'var(--ok)' },
  { key:'perdido', label:'Perdido', cliente:'Encerrado', color:'var(--danger)' },
];
const statusMeta = k => STATUSES.find(s=>s.key===k) || STATUSES[0];

/* kanban columns subset */
const KANBAN_COLS = ['novo','qualif','docs_sol','docs_rec','analise','proposta'];

const KPIS = [
  { k:'novos', label:'Novos hoje', val:'42', delta:'+12', up:true, hot:true },
  { k:'qualif', label:'Qualificados', val:'18', delta:'+5', up:true },
  { k:'docs', label:'Docs pendentes', val:'9', delta:'-2', up:false },
  { k:'props', label:'Propostas', val:'6', delta:'+1', up:true },
  { k:'pipe', label:'Pipeline', val:'R$ 2,8M', delta:'+8%', up:true },
];

const FUNNEL = [
  ['Novo Lead',42,92],['Em Qualificação',28,64],['Qualificado',18,44],['Docs Solicitados',13,32],['Em Análise',11,26],['Proposta',6,15],['Ganho',4,10],
];
const BY_UNIT = [ ['SCF',58,'var(--lime)'],['Procurement',24,'var(--info)'],['Motos / Produtos',38,'var(--warn)'] ];
const BY_ORIGIN = [ ['Agente IA',46],['Formulário',28],['Indicação',16],['WhatsApp',10] ];

const DOCS_CHECKLIST = [
  { nome:'Contrato Social', desc:'Última alteração consolidada', fmt:'PDF', status:'pendente' },
  { nome:'Cartão CNPJ', desc:'Emitido nos últimos 90 dias', fmt:'PDF', status:'enviado', data:'14/06/2026' },
  { nome:'Comprovante de Endereço', desc:'Conta em nome da empresa', fmt:'PDF · JPG', status:'reprovado', data:'13/06/2026', motivo:'Documento ilegível. Reenvie em melhor resolução.' },
  { nome:'RG/CPF Representante Legal', desc:'Frente e verso', fmt:'PDF · JPG', status:'aprovado', data:'12/06/2026' },
  { nome:'RADAR / Siscomex', desc:'Comprovante de habilitação', fmt:'PDF', status:'pendente' },
  { nome:'Invoice / Proforma', desc:'Fornecedor na China', fmt:'PDF', status:'em_revisao', data:'14/06/2026' },
];
const DOC_STATUS = {
  pendente:{ label:'Pendente', variant:null }, enviado:{ label:'Enviado', variant:'info' },
  em_revisao:{ label:'Em revisão', variant:'warn' }, aprovado:{ label:'Aprovado', variant:'ok' },
  reprovado:{ label:'Reprovado', variant:'danger' }, reenvio:{ label:'Reenvio solicitado', variant:'warn' },
};

const INTERACTIONS = [
  { t:'10:42', tipo:'ia', who:'Agente SCF', msg:'Lead criado via chat. Coletados: empresa, CNPJ, produto, FOB US$ 80k. RADAR não confirmado.' },
  { t:'10:45', tipo:'status', who:'Sistema', msg:'Status: Novo Lead → Em Qualificação' },
  { t:'11:02', tipo:'score', who:'IA', msg:'Score calculado: 84 · Qualificado (acima de 60).' },
  { t:'11:15', tipo:'comment', who:'Ana Prado', msg:'Cliente promissor. Falta RADAR — vou solicitar acesso ao portal.', interno:true },
  { t:'11:20', tipo:'email', who:'Sistema', msg:'E-mail "Convite cliente" enviado para ricardo@yamaneimp.com.br' },
  { t:'14:30', tipo:'msg', who:'Ricardo Yamane', msg:'Perfeito, vou providenciar o RADAR ainda hoje.' },
];

const NOTIFS = [
  { tipo:'lead', icon:'plus', t:'há 2 min', msg:'Novo lead qualificado: Andrade Têxtil (Score 90)', unread:true },
  { tipo:'doc', icon:'file', t:'há 18 min', msg:'Documento enviado: Cartão CNPJ — Yamane Imp.', unread:true },
  { tipo:'alert', icon:'alert', t:'há 1h', msg:'3 tarefas vencidas precisam de atenção', unread:true },
  { tipo:'msg', icon:'chat', t:'há 2h', msg:'Nova mensagem de Felipe Andrade no chat', unread:false },
  { tipo:'prop', icon:'doc', t:'há 5h', msg:'Proposta aceita: GloboPort Importações', unread:false },
];

const TASKS = [
  { titulo:'Solicitar RADAR — Yamane Imp.', lead:'TK-2041', resp:'Ana Prado', prazo:'Hoje', prio:'Alta', status:'aberta', venc:true },
  { titulo:'Enviar proposta DF17 — EletroSul', lead:'TK-2033', resp:'Ana Prado', prazo:'Amanhã', prio:'Alta', status:'aberta', venc:false },
  { titulo:'Follow-up Pacífico (dados incompletos)', lead:'TK-2035', resp:'Pedro Lima', prazo:'13/06', prio:'Média', status:'aberta', venc:true },
  { titulo:'Parecer de crédito — Andrade Têxtil', lead:'TK-2030', resp:'Pedro Lima', prazo:'15/06', prio:'Alta', status:'aberta', venc:false },
  { titulo:'Revisar comprovante — Campinas Mob.', lead:'TK-2019', resp:'Pedro Lima', prazo:'14/06', prio:'Média', status:'aberta', venc:false },
];

const REPORTS = [
  { id:'REL-0091', lead:'Yamane Comércio e Importação', unit:'SCF', tipo:'Relatório do lead', data:'há 2h', score:84 },
  { id:'REL-0088', lead:'Andrade Têxtil', unit:'SCF', tipo:'Relatório do lead', data:'há 30min', score:90 },
  { id:'REL-0085', lead:'GloboPort Importações', unit:'PROC', tipo:'Relatório comercial', data:'há 1d', score:73 },
  { id:'REL-0082', lead:'Consolidado · Junho', unit:'Todas', tipo:'Relatório gerencial', data:'há 1d', score:null },
];

const CLIENT_DOCS_MSG = [
  { who:'tradek', t:'10:30', msg:'Olá, Ricardo. Para avançar com a análise, precisamos do comprovante de RADAR/Siscomex. Pode anexar por aqui mesmo.' },
  { who:'client', t:'10:45', msg:'Perfeito, vou anexar ainda hoje.' },
  { who:'tradek', t:'10:47', msg:'Ótimo! Qualquer dúvida sobre os documentos, estou à disposição.' },
];

Object.assign(window, {
  PRODUCTS, PRODUCT_CATS, LEADS, STATUSES, statusMeta, KANBAN_COLS, KPIS, FUNNEL, BY_UNIT, BY_ORIGIN,
  DOCS_CHECKLIST, DOC_STATUS, INTERACTIONS, NOTIFS, TASKS, REPORTS, CLIENT_DOCS_MSG,
});
