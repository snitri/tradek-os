-- Template de notificação de interação via WhatsApp
insert into tradek.email_templates (nome, chave, assunto, corpo_html, variaveis) values (
  'Notificação — Interação WhatsApp',
  'whatsapp_interacao',
  'TradeK — Nova interação via WhatsApp: {{telefone}}',
  '<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0B0A;font-family:''Inter'',Arial,sans-serif;color:#E8EAE4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0B0A;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111311;border:1px solid #232820;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#111311;border-bottom:1px solid #232820;padding:28px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><span style="font-size:20px;font-weight:700;color:#E8EAE4;">Trade<span style="color:#C3F929;">K</span></span> <span style="font-size:12px;color:#25D366;font-weight:600;margin-left:8px;">WHATSAPP</span></td>
            <td align="right"><span style="font-size:11px;color:#6B7264;letter-spacing:.08em;text-transform:uppercase;">Nova Interação</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:32px 36px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#25D366;letter-spacing:.1em;text-transform:uppercase;">Nova mensagem recebida</p>
          <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#E8EAE4;">{{telefone}}</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#9CA396;line-height:1.6;">Um contato iniciou uma conversa via WhatsApp com o agente de IA da TradeK.</p>

          <!-- Mensagem do cliente -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F0D;border:1px solid #232820;border-radius:8px;margin-bottom:16px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#6B7264;letter-spacing:.08em;text-transform:uppercase;">💬 Mensagem do cliente</p>
              <p style="margin:0;font-size:14px;color:#E8EAE4;line-height:1.6;">{{mensagem_cliente}}</p>
            </td></tr>
          </table>

          <!-- Resposta do agente -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F0D;border:1px solid #25D366;border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#25D366;letter-spacing:.08em;text-transform:uppercase;">🤖 Resposta do agente IA</p>
              <p style="margin:0;font-size:14px;color:#E8EAE4;line-height:1.6;">{{resposta_agente}}</p>
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="padding:0 4px 0 0;">
              <a href="https://web.whatsapp.com/send?phone={{telefone_limpo}}" style="display:block;text-align:center;background:#25D366;color:#fff;font-size:13px;font-weight:700;padding:12px;border-radius:7px;text-decoration:none;">Responder no WhatsApp</a>
            </td>
            <td style="padding:0 0 0 4px;">
              <a href="{{link_crm}}" style="display:block;text-align:center;background:#1a1c19;border:1px solid #C3F929;color:#C3F929;font-size:13px;font-weight:700;padding:12px;border-radius:7px;text-decoration:none;">Ver no CRM</a>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="border-top:1px solid #232820;padding:20px 36px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#4A4F44;">© 2026 TradeK · Hub de negócios China–Brasil</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>',
  array['telefone','telefone_limpo','mensagem_cliente','resposta_agente','link_crm']
) on conflict (chave) do nothing;

-- Regra: dispara para o time interno a cada interação WhatsApp
-- emails_para deve ser preenchido com o(s) e-mail(s) da equipe no painel admin
insert into tradek.notification_rules (nome, evento, emails_para, template_id, ativo, enviar_resumo_ia)
select 'Notificação WhatsApp — equipe', 'lead.whatsapp_interacao', '{}', id, true, false
from tradek.email_templates where chave = 'whatsapp_interacao'
on conflict do nothing;
