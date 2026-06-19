-- Adiciona coluna unidade em notification_rules para filtrar por divisão
alter table tradek.notification_rules add column if not exists unidade text default null;

-- Remove regra genérica anterior (substitída pelas 3 abaixo)
delete from tradek.notification_rules where evento = 'lead.ia_qualificado';

-- ========== TEMPLATES ==========

-- 1) Supply Chain Finance — resumo para equipe comercial
insert into tradek.email_templates (nome, chave, assunto, corpo_html, variaveis) values (
  'Resumo IA — Supply Chain Finance',
  'lead_ia_scf',
  'TradeK SCF — Novo lead qualificado: {{nome_cliente}}',
  '<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0B0A;font-family:''Inter'',Arial,sans-serif;color:#E8EAE4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0B0A;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111311;border:1px solid #232820;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#111311;border-bottom:1px solid #232820;padding:28px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><span style="font-size:20px;font-weight:700;color:#E8EAE4;">Trade<span style="color:#C3F929;">K</span></span> <span style="font-size:12px;color:#5BC8FF;font-weight:600;margin-left:8px;">SUPPLY CHAIN FINANCE</span></td>
            <td align="right"><span style="font-size:11px;color:#6B7264;letter-spacing:.08em;text-transform:uppercase;">Equipe Comercial</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:32px 36px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#C3F929;letter-spacing:.1em;text-transform:uppercase;">Novo lead qualificado pela IA</p>
          <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#E8EAE4;">{{nome_cliente}} — {{empresa}}</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#9CA396;line-height:1.6;">Um novo lead foi qualificado pelo agente de IA e está pronto para atendimento da equipe comercial de Supply Chain Finance.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F0D;border:1px solid #232820;border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#6B7264;letter-spacing:.08em;text-transform:uppercase;">Resumo da qualificação</p>
              <pre style="margin:0;font-size:13px;color:#C8CCBf;line-height:1.8;white-space:pre-wrap;font-family:''Inter'',Arial,sans-serif;">{{transcript}}</pre>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 24px;">
            <a href="{{link_portal}}" style="display:inline-block;background:#C3F929;color:#0A0B0A;font-size:14px;font-weight:700;padding:13px 28px;border-radius:7px;text-decoration:none;">Acessar CRM</a>
          </td></tr></table>
          <p style="margin:0;font-size:12px;color:#4A4F44;text-align:center;">Entre em contato com o lead em até 24h para dar continuidade.</p>
        </td></tr>
        <tr><td style="border-top:1px solid #232820;padding:20px 36px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#4A4F44;">© 2026 TradeK · Hub de negócios China–Brasil</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>',
  array['nome_cliente','empresa','transcript','link_portal']
) on conflict (chave) do nothing;

-- 2) Procurement — resumo para equipe comercial
insert into tradek.email_templates (nome, chave, assunto, corpo_html, variaveis) values (
  'Resumo IA — Procurement',
  'lead_ia_procurement',
  'TradeK Procurement — Novo lead qualificado: {{nome_cliente}}',
  '<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0B0A;font-family:''Inter'',Arial,sans-serif;color:#E8EAE4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0B0A;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111311;border:1px solid #232820;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#111311;border-bottom:1px solid #232820;padding:28px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><span style="font-size:20px;font-weight:700;color:#E8EAE4;">Trade<span style="color:#C3F929;">K</span></span> <span style="font-size:12px;color:#B69BFF;font-weight:600;margin-left:8px;">PROCUREMENT</span></td>
            <td align="right"><span style="font-size:11px;color:#6B7264;letter-spacing:.08em;text-transform:uppercase;">Equipe Comercial</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:32px 36px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#C3F929;letter-spacing:.1em;text-transform:uppercase;">Novo lead qualificado pela IA</p>
          <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#E8EAE4;">{{nome_cliente}} — {{empresa}}</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#9CA396;line-height:1.6;">Um novo lead foi qualificado pelo agente de IA e está pronto para atendimento da equipe de Procurement Internacional.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F0D;border:1px solid #232820;border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#6B7264;letter-spacing:.08em;text-transform:uppercase;">Resumo da qualificação</p>
              <pre style="margin:0;font-size:13px;color:#C8CCBf;line-height:1.8;white-space:pre-wrap;font-family:''Inter'',Arial,sans-serif;">{{transcript}}</pre>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 24px;">
            <a href="{{link_portal}}" style="display:inline-block;background:#C3F929;color:#0A0B0A;font-size:14px;font-weight:700;padding:13px 28px;border-radius:7px;text-decoration:none;">Acessar CRM</a>
          </td></tr></table>
          <p style="margin:0;font-size:12px;color:#4A4F44;text-align:center;">Entre em contato com o lead em até 24h para iniciar o processo de sourcing.</p>
        </td></tr>
        <tr><td style="border-top:1px solid #232820;padding:20px 36px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#4A4F44;">© 2026 TradeK · Hub de negócios China–Brasil</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>',
  array['nome_cliente','empresa','transcript','link_portal']
) on conflict (chave) do nothing;

-- 3) Produtos da China — descrição + orçamento
insert into tradek.email_templates (nome, chave, assunto, corpo_html, variaveis) values (
  'Resumo IA — Produtos da China',
  'lead_ia_produtos',
  'TradeK Produtos — Proposta de interesse: {{nome_cliente}}',
  '<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0B0A;font-family:''Inter'',Arial,sans-serif;color:#E8EAE4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0B0A;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111311;border:1px solid #232820;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#111311;border-bottom:1px solid #232820;padding:28px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><span style="font-size:20px;font-weight:700;color:#E8EAE4;">Trade<span style="color:#C3F929;">K</span></span> <span style="font-size:12px;color:#F5B544;font-weight:600;margin-left:8px;">PRODUTOS DA CHINA</span></td>
            <td align="right"><span style="font-size:11px;color:#6B7264;letter-spacing:.08em;text-transform:uppercase;">Proposta Comercial</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:32px 36px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#C3F929;letter-spacing:.1em;text-transform:uppercase;">Interesse em produtos identificado</p>
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#E8EAE4;">Olá, {{nome_cliente}}!</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#9CA396;line-height:1.6;">Registramos seu interesse em produtos da China através do nosso agente de IA. Veja abaixo o resumo do seu atendimento e os próximos passos para avançar com sua importação.</p>

          <!-- Resumo da conversa -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F0D;border:1px solid #232820;border-radius:8px;margin-bottom:20px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#6B7264;letter-spacing:.08em;text-transform:uppercase;">📋 Resumo do atendimento</p>
              <pre style="margin:0;font-size:13px;color:#C8CCBf;line-height:1.8;white-space:pre-wrap;font-family:''Inter'',Arial,sans-serif;">{{transcript}}</pre>
            </td></tr>
          </table>

          <!-- Orçamento -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F0D;border:1px solid #F5B544;border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#F5B544;letter-spacing:.08em;text-transform:uppercase;">💰 Proposta de interesse</p>
              <pre style="margin:0;font-size:13px;color:#C8CCBf;line-height:1.8;white-space:pre-wrap;font-family:''Inter'',Arial,sans-serif;">{{orcamento}}</pre>
              <p style="margin:16px 0 0;font-size:11px;color:#6B7264;">* Valores sujeitos a confirmação pelo time comercial. Cotação válida por 5 dias úteis.</p>
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 24px;">
            <a href="{{link_portal}}" style="display:inline-block;background:#C3F929;color:#0A0B0A;font-size:14px;font-weight:700;padding:13px 28px;border-radius:7px;text-decoration:none;">Acessar Portal do Cliente</a>
          </td></tr></table>
          <p style="margin:0;font-size:12px;color:#4A4F44;text-align:center;">Nossa equipe comercial entrará em contato em breve para confirmar sua proposta.</p>
        </td></tr>
        <tr><td style="border-top:1px solid #232820;padding:20px 36px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#4A4F44;">© 2026 TradeK · Hub de negócios China–Brasil</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>',
  array['nome_cliente','empresa','transcript','orcamento','link_portal']
) on conflict (chave) do nothing;

-- ========== NOTIFICATION RULES ==========

insert into tradek.notification_rules (nome, evento, emails_para, template_id, ativo, enviar_resumo_ia, unidade)
select 'Resumo IA — SCF', 'lead.ia_qualificado', '{}', id, true, true, 'supply_chain_finance'
from tradek.email_templates where chave = 'lead_ia_scf'
on conflict do nothing;

insert into tradek.notification_rules (nome, evento, emails_para, template_id, ativo, enviar_resumo_ia, unidade)
select 'Resumo IA — Procurement', 'lead.ia_qualificado', '{}', id, true, true, 'procurement'
from tradek.email_templates where chave = 'lead_ia_procurement'
on conflict do nothing;

insert into tradek.notification_rules (nome, evento, emails_para, template_id, ativo, enviar_resumo_ia, unidade)
select 'Resumo IA — Produtos', 'lead.ia_qualificado', '{}', id, true, true, 'produtos_motos'
from tradek.email_templates where chave = 'lead_ia_produtos'
on conflict do nothing;
