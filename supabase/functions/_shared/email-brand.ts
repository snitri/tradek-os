// TradeK OS — shell HTML com a identidade visual da TradeK, usado por todo
// e-mail enviado pela plataforma via Resend (on-event, create-client,
// create-internal-user). Recebe o conteúdo (fragmento HTML) já renderizado
// e devolve o e-mail completo com cabeçalho, rodapé e cores da marca.
export function brandEmail(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#0A0B0A;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
      <div style="text-align:center;padding-bottom:24px;">
        <img src="https://www.tradek.com.br/tradek-logo.png" alt="TradeK" height="28" style="height:28px;" />
      </div>
      <div style="background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #1f221e;">
        <div style="height:4px;background:#C3F929;"></div>
        <div style="padding:32px 28px;color:#1a1a1a;font-size:14.5px;line-height:1.6;">
          ${bodyHtml}
        </div>
      </div>
      <div style="text-align:center;padding-top:24px;font-size:11.5px;color:#6b7167;">
        TradeK · Hub de negócios China–Brasil<br />
        Este é um e-mail automático, por favor não responda.
      </div>
    </div>
  </body>
</html>`
}
