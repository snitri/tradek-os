-- Corrige inserção do bloco de Score de Crédito nos templates de unidade (a migration
-- anterior usava replace() exato e não bateu com a indentação real do HTML salvo).
-- Insere o bloco imediatamente antes da tabela do botão CTA final, usando regexp_replace
-- com a abertura da tabela do CTA como marcador (presente nos 3 templates de unidade).

update tradek.email_templates
set corpo_html = regexp_replace(
  corpo_html,
  '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 24px;">',
  '<table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F0D;border:1px solid #232820;border-radius:8px;margin-bottom:24px;">' ||
  '<tr><td style="padding:20px 24px;">' ||
  '<p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#6B7264;letter-spacing:.08em;text-transform:uppercase;">Score de Crédito (QUOD/DirectD)</p>' ||
  '<table width="100%" cellpadding="0" cellspacing="0">' ||
  '<tr><td style="padding:6px 0;font-size:13px;color:#6B7264;width:140px;">Score</td><td style="padding:6px 0;font-size:13px;color:#C3F929;font-weight:700;">{{score_credito}}</td></tr>' ||
  '<tr><td style="padding:6px 0;font-size:13px;color:#6B7264;">Faixa</td><td style="padding:6px 0;font-size:13px;color:#E8EAE4;">{{faixa_credito}}</td></tr>' ||
  '<tr><td style="padding:6px 0;font-size:13px;color:#6B7264;">Processos judiciais</td><td style="padding:6px 0;font-size:13px;color:#E8EAE4;">{{qtd_processos}}</td></tr>' ||
  '</table>' ||
  '<pre style="margin:12px 0 0;font-size:12px;color:#9CA396;line-height:1.6;white-space:pre-wrap;font-family:''Courier New'',monospace;">{{resumo_processos}}</pre>' ||
  '</td></tr></table>' ||
  '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 24px;">',
  1
)
where nome in ('Resumo IA — Supply Chain Finance', 'Resumo IA — Procurement', 'Resumo IA — Produtos da China')
  and corpo_html not like '%score_credito%';
