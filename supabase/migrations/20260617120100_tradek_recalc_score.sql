-- TradeK OS — Recalcular score do lead (Plano 07 / qualify).
-- Recalcula tradek.leads.score_ia a partir dos mesmos critérios mostrados no modal:
--   empresa identificada (15) · CNPJ (15) · demanda clara (20) · valor/volume (20)
--   · contato válido (15) · consentimento LGPD (15)  → 0..100
-- SECURITY DEFINER + guard: apenas usuários internos podem recalcular.

create or replace function tradek.recalc_lead_score(p_lead uuid)
returns integer
language plpgsql
security definer
set search_path = tradek, public
as $$
declare
  v_score   int := 0;
  v_company uuid;
  v_contact uuid;
  v_produto text;
  v_volume  text;
  v_lgpd    boolean;
  v_dados   jsonb;
  v_cnpj    text;
  v_email   text;
begin
  -- bloqueia clientes (a função roda como definer e ignora RLS)
  if tradek.current_user_role() = 'cliente' then
    raise exception 'Apenas usuários internos podem recalcular o score.';
  end if;

  select l.company_id, l.contact_id, l.produto_servico_interesse, l.volume_estimado,
         l.consentimento_lgpd, l.dados_oportunidade
    into v_company, v_contact, v_produto, v_volume, v_lgpd, v_dados
  from tradek.leads l where l.id = p_lead;
  if not found then return null; end if;

  select c.cnpj  into v_cnpj  from tradek.companies c where c.id = v_company;
  select ct.email into v_email from tradek.contacts  ct where ct.id = v_contact;

  if v_company is not null                                              then v_score := v_score + 15; end if;
  if v_cnpj    is not null and length(trim(v_cnpj))  > 0                then v_score := v_score + 15; end if;
  if v_produto is not null and length(trim(v_produto)) > 0              then v_score := v_score + 20; end if;
  if (v_volume is not null and length(trim(v_volume)) > 0)
     or (v_dados ? 'valor')                                            then v_score := v_score + 20; end if;
  if v_email   is not null and length(trim(v_email)) > 0                then v_score := v_score + 15; end if;
  if coalesce(v_lgpd, false)                                           then v_score := v_score + 15; end if;

  update tradek.leads set score_ia = v_score where id = p_lead;
  return v_score;
end $$;

grant execute on function tradek.recalc_lead_score(uuid) to authenticated, service_role;
