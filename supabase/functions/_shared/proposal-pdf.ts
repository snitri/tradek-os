// TradeK OS — gera o PDF de uma cotação com a identidade visual da TradeK
// (mesmo tema escuro + lime usado no site e nos e-mails da plataforma).
import { PDFDocument, rgb, StandardFonts } from "npm:pdf-lib@1.17.1"

const LIME = rgb(0.765, 0.976, 0.161) // #C3F929
const BG = rgb(0.039, 0.043, 0.039) // #0A0B0A
const BG_2 = rgb(0.071, 0.078, 0.071) // var(--bg-2) aprox.
const LINE = rgb(0.16, 0.18, 0.15) // var(--line) aprox.
const TX = rgb(0.93, 0.95, 0.92) // texto principal claro
const TX_DIM = rgb(0.6, 0.64, 0.58) // texto secundário

export type ProposalPdfData = {
  proposalId: string
  empresa: string
  cnpj: string
  contato: string
  produto: string
  quantidade: number | null
  valorUnit: number | null
  valor: number | null
  moeda: string
  observacoes: string | null
  criadaEm: string
}

export async function buildProposalPdf(d: ProposalPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([595.28, 841.89]) // A4
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const { width, height } = page.getSize()

  // fundo escuro (tema do site)
  page.drawRectangle({ x: 0, y: 0, width, height, color: BG })

  // logo
  try {
    const logoResp = await fetch("https://www.tradek.com.br/tradek-logo.png")
    const logoBytes = new Uint8Array(await logoResp.arrayBuffer())
    const logo = await doc.embedPng(logoBytes)
    const logoH = 24
    const logoW = (logo.width / logo.height) * logoH
    page.drawImage(logo, { x: 40, y: height - 56, width: logoW, height: logoH })
  } catch { /* logo opcional — não bloqueia a geração do PDF */ }

  // faixa lime no topo
  page.drawRectangle({ x: 0, y: height - 70, width, height: 3, color: LIME })

  let y = height - 112
  page.drawText("COTAÇÃO COMERCIAL", { x: 40, y, size: 11, font: fontBold, color: LIME })
  y -= 30
  page.drawText(`Nº ${d.proposalId.slice(0, 8).toUpperCase()}`, { x: 40, y, size: 22, font: fontBold, color: TX })
  y -= 18
  page.drawText(new Date(d.criadaEm).toLocaleDateString("pt-BR"), { x: 40, y, size: 10, font, color: TX_DIM })

  y -= 36
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 0.75, color: LINE })

  y -= 28
  page.drawText("CLIENTE", { x: 40, y, size: 9, font: fontBold, color: LIME })
  y -= 18
  page.drawText(d.empresa || "—", { x: 40, y, size: 13, font: fontBold, color: TX })
  y -= 16
  if (d.cnpj) { page.drawText(`CNPJ: ${d.cnpj}`, { x: 40, y, size: 10, font, color: TX_DIM }); y -= 14 }
  if (d.contato) { page.drawText(`Contato: ${d.contato}`, { x: 40, y, size: 10, font, color: TX_DIM }); y -= 14 }

  y -= 24
  // cartão do item — painel escuro mais claro, como os "panels" do site
  const cardTop = y
  const cardH = 78
  page.drawRectangle({ x: 40, y: cardTop - cardH, width: width - 80, height: cardH, color: BG_2 })
  page.drawRectangle({ x: 40, y: cardTop - cardH, width: width - 80, height: cardH, borderColor: LINE, borderWidth: 1, color: undefined })

  page.drawText("PRODUTO", { x: 56, y: cardTop - 22, size: 8, font: fontBold, color: TX_DIM })
  page.drawText(d.produto || "—", { x: 56, y: cardTop - 38, size: 13, font: fontBold, color: TX })

  page.drawText("QTD.", { x: 56, y: cardTop - 62, size: 8, font: fontBold, color: TX_DIM })
  page.drawText(String(d.quantidade ?? "—"), { x: 56, y: cardTop - 74, size: 11, font, color: TX })

  page.drawText("VALOR UNIT.", { x: 200, y: cardTop - 62, size: 8, font: fontBold, color: TX_DIM })
  page.drawText(d.valorUnit != null ? `${d.moeda} ${d.valorUnit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—", { x: 200, y: cardTop - 74, size: 11, font, color: TX })

  page.drawText("TOTAL", { x: 400, y: cardTop - 22, size: 8, font: fontBold, color: LIME })
  page.drawText(d.valor != null ? `${d.moeda} ${d.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—", { x: 400, y: cardTop - 44, size: 18, font: fontBold, color: LIME })

  y = cardTop - cardH - 36
  if (d.observacoes) {
    page.drawText("OBSERVAÇÕES", { x: 40, y, size: 9, font: fontBold, color: LIME })
    y -= 18
    const lines = wrapText(d.observacoes, 95)
    for (const line of lines) { page.drawText(line, { x: 40, y, size: 10, font, color: TX_DIM }); y -= 14 }
  }

  page.drawLine({ start: { x: 40, y: 70 }, end: { x: width - 40, y: 70 }, thickness: 0.75, color: LINE })
  page.drawText(
    "Cotação sujeita à análise cadastral, documental e financeira. Condições finais confirmadas pela equipe TradeK.",
    { x: 40, y: 52, size: 8.5, font, color: TX_DIM },
  )
  page.drawText("TradeK · Hub de negócios China–Brasil · www.tradek.com.br", { x: 40, y: 38, size: 8.5, font, color: TX_DIM })

  return doc.save()
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let cur = ""
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w }
    else cur = (cur + " " + w).trim()
  }
  if (cur) lines.push(cur)
  return lines
}
