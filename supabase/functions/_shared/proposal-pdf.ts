// TradeK OS — gera o PDF de uma cotação com a identidade visual da TradeK.
import { PDFDocument, rgb, StandardFonts } from "npm:pdf-lib@1.17.1"

const LIME = rgb(0.765, 0.976, 0.161) // #C3F929
const DARK = rgb(0.039, 0.043, 0.039) // #0A0B0A
const DIM = rgb(0.42, 0.45, 0.42)

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

  // logo
  try {
    const logoResp = await fetch("https://www.tradek.com.br/tradek-logo.png")
    const logoBytes = new Uint8Array(await logoResp.arrayBuffer())
    const logo = await doc.embedPng(logoBytes)
    const logoH = 26
    const logoW = (logo.width / logo.height) * logoH
    page.drawImage(logo, { x: 40, y: height - 60, width: logoW, height: logoH })
  } catch { /* logo opcional — não bloqueia a geração do PDF */ }

  // faixa lime
  page.drawRectangle({ x: 0, y: height - 70, width, height: 4, color: LIME })

  let y = height - 110
  page.drawText("Cotação comercial", { x: 40, y, size: 20, font: fontBold, color: DARK })
  y -= 18
  page.drawText(`Nº ${d.proposalId.slice(0, 8).toUpperCase()} · ${new Date(d.criadaEm).toLocaleDateString("pt-BR")}`, { x: 40, y, size: 10, font, color: DIM })

  y -= 40
  page.drawText("Cliente", { x: 40, y, size: 11, font: fontBold, color: DARK })
  y -= 16
  page.drawText(d.empresa || "—", { x: 40, y, size: 11, font, color: DARK })
  y -= 14
  if (d.cnpj) { page.drawText(`CNPJ: ${d.cnpj}`, { x: 40, y, size: 10, font, color: DIM }); y -= 14 }
  if (d.contato) { page.drawText(`Contato: ${d.contato}`, { x: 40, y, size: 10, font, color: DIM }); y -= 14 }

  y -= 26
  // tabela do item
  const tableTop = y
  page.drawRectangle({ x: 40, y: tableTop - 22, width: width - 80, height: 22, color: rgb(0.95, 0.96, 0.94) })
  page.drawText("Produto", { x: 48, y: tableTop - 16, size: 9.5, font: fontBold, color: DARK })
  page.drawText("Qtd.", { x: 320, y: tableTop - 16, size: 9.5, font: fontBold, color: DARK })
  page.drawText("Valor unit.", { x: 380, y: tableTop - 16, size: 9.5, font: fontBold, color: DARK })
  page.drawText("Total", { x: 480, y: tableTop - 16, size: 9.5, font: fontBold, color: DARK })

  const rowY = tableTop - 22 - 24
  page.drawText(d.produto || "—", { x: 48, y: rowY, size: 10.5, font, color: DARK })
  page.drawText(String(d.quantidade ?? "—"), { x: 320, y: rowY, size: 10.5, font, color: DARK })
  page.drawText(d.valorUnit != null ? `${d.moeda} ${d.valorUnit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—", { x: 380, y: rowY, size: 10.5, font, color: DARK })
  page.drawText(d.valor != null ? `${d.moeda} ${d.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—", { x: 480, y: rowY, size: 10.5, font: fontBold, color: DARK })

  page.drawLine({ start: { x: 40, y: rowY - 14 }, end: { x: width - 40, y: rowY - 14 }, thickness: 0.5, color: rgb(0.88, 0.88, 0.86) })

  y = rowY - 40
  if (d.observacoes) {
    page.drawText("Observações", { x: 40, y, size: 11, font: fontBold, color: DARK })
    y -= 16
    const lines = wrapText(d.observacoes, 95)
    for (const line of lines) { page.drawText(line, { x: 40, y, size: 10, font, color: DIM }); y -= 13 }
  }

  page.drawText(
    "Cotação sujeita à análise cadastral, documental e financeira. Condições finais confirmadas pela equipe TradeK.",
    { x: 40, y: 50, size: 8.5, font, color: DIM },
  )
  page.drawText("TradeK · Hub de negócios China–Brasil · www.tradek.com.br", { x: 40, y: 36, size: 8.5, font, color: DIM })

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
