-- Passo 1: adiciona novos valores ao enum lead_status (deve commitar antes de usar)
alter type tradek.lead_status add value if not exists 'pronto_atendimento';
alter type tradek.lead_status add value if not exists 'docs_china';
alter type tradek.lead_status add value if not exists 'contrato_fechado';
alter type tradek.lead_status add value if not exists 'proposta_recusada';
