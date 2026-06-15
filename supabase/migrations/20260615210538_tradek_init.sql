-- TradeK OS — schema dedicado, extensões, enums e helper de updated_at
-- Isolado em `tradek`; nada toca o schema public.

create schema if not exists tradek;
create extension if not exists vector with schema extensions;

-- ===== ENUMS =====
create type tradek.user_role as enum
  ('master','gerente','comercial','operacional','financeiro','atendimento','leitura','cliente');

create type tradek.unidade as enum
  ('supply_chain_finance','procurement','produtos_motos','suporte_importacao','outro');

create type tradek.lead_status as enum
  ('novo','qualificacao_ia','dados_incompletos','qualificado','doc_solicitados','doc_recebidos',
   'em_analise','aprovado_proposta','proposta_enviada','negociacao','ganho','perdido',
   'desqualificado','arquivado');

create type tradek.origem as enum
  ('site_chat_ia','formulario_site','cadastro_manual','email','whatsapp','indicacao','evento',
   'trafego_pago','importacao_manual','outro');

create type tradek.doc_status as enum
  ('nao_solicitado','solicitado','enviado','em_revisao','aprovado','reprovado',
   'reenvio_solicitado','vencido');

create type tradek.motivo_desqualificacao as enum
  ('sem_cnpj','pessoa_fisica_sem_fit','sem_demanda_real','produto_fora_escopo','volume_muito_baixo',
   'sem_orcamento','sem_resposta','regiao_nao_atendida','duplicado','teste_spam','outro');

create type tradek.motivo_perda as enum
  ('preco','prazo','concorrencia','sem_resposta','desistiu','sem_orcamento','fora_escopo','outro');

create type tradek.urgencia as enum ('baixa','media','alta','critica');

create type tradek.task_status as enum ('aberta','em_andamento','concluida','cancelada');

create type tradek.proposal_status as enum
  ('rascunho','aguardando_dados','em_validacao','enviada','aceita','recusada','cancelada');

create type tradek.interaction_canal as enum
  ('chat_ia','portal','email','whatsapp','telefone','interno','sistema');

create type tradek.interaction_tipo as enum
  ('mensagem','comentario_interno','status_change','email_enviado','upload','relatorio','tarefa','sistema');

create type tradek.autor_tipo as enum ('cliente','admin','ia','sistema');

-- ===== HELPER: updated_at =====
create or replace function tradek.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
