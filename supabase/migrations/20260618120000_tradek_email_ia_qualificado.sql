-- Template: resumo de interação IA após qualificação de lead
insert into tradek.email_templates (nome, chave, assunto, corpo_html, variaveis) values (
  'Resumo de Interação IA',
  'lead_ia_qualificado',
  'TradeK — Seu contato foi recebido e qualificado',
  '<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TradeK — Resumo do Atendimento</title></head>
<body style="margin:0;padding:0;background:#0A0B0A;font-family:''Inter'',Arial,sans-serif;color:#E8EAE4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0B0A;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111311;border:1px solid #232820;border-radius:12px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:#111311;border-bottom:1px solid #232820;padding:28px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><span style="font-size:20px;font-weight:700;letter-spacing:-.02em;color:#E8EAE4;">Trade<span style="color:#C3F929;">K</span></span></td>
            <td align="right"><span style="font-size:11px;font-weight:600;color:#6B7264;letter-spacing:.08em;text-transform:uppercase;">Hub China → Brasil</span></td>
          </tr></table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 36px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#C3F929;letter-spacing:.1em;text-transform:uppercase;">Atendimento concluído</p>
          <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#E8EAE4;line-height:1.25;">Seu contato foi recebido e qualificado</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#9CA396;line-height:1.6;">Olá, <strong style="color:#E8EAE4;">{{nome_cliente}}</strong>. Nossa IA registrou seu contato e nossa equipe já recebeu o resumo. Aqui está um resumo do seu atendimento.</p>

          <!-- Resumo -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F0D;border:1px solid #232820;border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#6B7264;letter-spacing:.08em;text-transform:uppercase;">Resumo do atendimento</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:6px 0;font-size:13px;color:#6B7264;width:140px;">Divisão</td><td style="padding:6px 0;font-size:13px;color:#E8EAE4;font-weight:600;">{{unidade}}</td></tr>
                <tr><td style="padding:6px 0;font-size:13px;color:#6B7264;">Empresa</td><td style="padding:6px 0;font-size:13px;color:#E8EAE4;font-weight:600;">{{empresa}}</td></tr>
                <tr><td style="padding:6px 0;font-size:13px;color:#6B7264;">Demanda</td><td style="padding:6px 0;font-size:13px;color:#E8EAE4;">{{demanda}}</td></tr>
                <tr><td style="padding:6px 0;font-size:13px;color:#6B7264;">Score IA</td><td style="padding:6px 0;font-size:13px;color:#C3F929;font-weight:700;">{{score}} / 100 — {{classificacao}}</td></tr>
              </table>
            </td></tr>
          </table>

          <!-- Transcript -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F0D;border:1px solid #232820;border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#6B7264;letter-spacing:.08em;text-transform:uppercase;">Histórico da conversa</p>
              <pre style="margin:0;font-size:12px;color:#9CA396;line-height:1.7;white-space:pre-wrap;font-family:''Courier New'',monospace;">{{transcript}}</pre>
            </td></tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 24px;">
            <a href="{{link_portal}}" style="display:inline-block;background:#C3F929;color:#0A0B0A;font-size:14px;font-weight:700;padding:13px 28px;border-radius:7px;text-decoration:none;">Acessar Portal do Cliente</a>
          </td></tr></table>

          <p style="margin:0;font-size:12px;color:#4A4F44;text-align:center;line-height:1.6;">Nossa equipe entrará em contato em breve para dar continuidade.<br>Em caso de dúvidas, responda este e-mail.</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="border-top:1px solid #232820;padding:20px 36px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#4A4F44;">© 2026 TradeK · Hub de negócios China–Brasil</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>',
  array['nome_cliente','empresa','unidade','demanda','score','classificacao','transcript','link_portal']
) on conflict (chave) do nothing;

-- Regra: ao qualificar lead via IA, envia e-mail para o contato do lead (dinâmico via enviar_resumo_ia=true)
-- emails_para fica vazio — preencha com e-mail(s) da equipe interna no painel se quiser cópia interna
insert into tradek.notification_rules (nome, evento, emails_para, template_id, ativo, enviar_resumo_ia)
select
  'Resumo IA — contato qualificado',
  'lead.ia_qualificado',
  '{}',
  id,
  true,
  true
from tradek.email_templates
where chave = 'lead_ia_qualificado'
on conflict do nothing;
