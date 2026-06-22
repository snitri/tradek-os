-- Adiciona bloco com os dados estruturados do lead (produto/serviço, valor,
-- urgência, o que quer/não quer, próxima ação) antes do painel "Resumo da
-- qualificação", nos 3 e-mails de unidade enviados à equipe comercial.
-- Usa count=1 no regexp_replace: a primeira ocorrência do padrão de painel
-- escuro (#0D0F0D / #232820) no documento é sempre o painel de Resumo (o
-- painel de Score de Crédito, inserido em migration anterior, vem depois).

update tradek.email_templates
set corpo_html = regexp_replace(
  corpo_html,
  '<table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F0D;border:1px solid #232820;border-radius:8px;margin-bottom:24px;">\s*<tr><td style="padding:20px 24px;">\s*<p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#6B7264;letter-spacing:.08em;text-transform:uppercase;">Resumo da qualificação</p>',
  '<table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F0D;border:1px solid #232820;border-radius:8px;margin-bottom:16px;">' ||
  '<tr><td style="padding:20px 24px;">' ||
  '<p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#6B7264;letter-spacing:.08em;text-transform:uppercase;">Dados da qualificação</p>' ||
  '<table width="100%" cellpadding="0" cellspacing="0">' ||
  '<tr><td style="padding:6px 0;font-size:13px;color:#6B7264;width:160px;vertical-align:top;">Classificação</td><td style="padding:6px 0;font-size:13px;color:#E8EAE4;font-weight:600;">{{classificacao}}</td></tr>' ||
  '<tr><td style="padding:6px 0;font-size:13px;color:#6B7264;vertical-align:top;">Urgência</td><td style="padding:6px 0;font-size:13px;color:#E8EAE4;">{{urgencia}}</td></tr>' ||
  '<tr><td style="padding:6px 0;font-size:13px;color:#6B7264;vertical-align:top;">Produto/serviço</td><td style="padding:6px 0;font-size:13px;color:#E8EAE4;">{{produto_servico_interesse}}</td></tr>' ||
  '<tr><td style="padding:6px 0;font-size:13px;color:#6B7264;vertical-align:top;">Volume</td><td style="padding:6px 0;font-size:13px;color:#E8EAE4;">{{volume_estimado}}</td></tr>' ||
  '<tr><td style="padding:6px 0;font-size:13px;color:#6B7264;vertical-align:top;">Valor estimado</td><td style="padding:6px 0;font-size:13px;color:#C3F929;font-weight:700;">{{valor_estimado}}</td></tr>' ||
  '<tr><td style="padding:6px 0;font-size:13px;color:#6B7264;vertical-align:top;">Prazo desejado</td><td style="padding:6px 0;font-size:13px;color:#E8EAE4;">{{prazo_desejado}}</td></tr>' ||
  '<tr><td style="padding:6px 0;font-size:13px;color:#6B7264;vertical-align:top;">O que quer</td><td style="padding:6px 0;font-size:13px;color:#E8EAE4;">{{o_que_quer}}</td></tr>' ||
  '<tr><td style="padding:6px 0;font-size:13px;color:#6B7264;vertical-align:top;">O que não quer</td><td style="padding:6px 0;font-size:13px;color:#E8EAE4;">{{o_que_nao_quer}}</td></tr>' ||
  '<tr><td style="padding:6px 0;font-size:13px;color:#6B7264;vertical-align:top;">Próxima ação</td><td style="padding:6px 0;font-size:13px;color:#E8EAE4;font-weight:600;">{{proxima_acao}}</td></tr>' ||
  '</table>' ||
  '</td></tr></table>' ||
  '<table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F0D;border:1px solid #232820;border-radius:8px;margin-bottom:24px;">' ||
  '<tr><td style="padding:20px 24px;">' ||
  '<p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#6B7264;letter-spacing:.08em;text-transform:uppercase;">Resumo da qualificação</p>',
  1
)
where nome in ('Resumo IA — Supply Chain Finance', 'Resumo IA — Procurement', 'Resumo IA — Produtos da China')
  and corpo_html not like '%Dados da qualificação%';
