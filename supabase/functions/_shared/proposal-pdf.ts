// TradeK OS — gera o PDF de uma cotação com a identidade visual da TradeK
// (mesmo tema escuro + lime usado no site e nos e-mails da plataforma).
import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "npm:pdf-lib@1.17.1"

const LIME = rgb(0.765, 0.976, 0.161) // #C3F929
const BG = rgb(0.039, 0.043, 0.039) // #0A0B0A
const BG_2 = rgb(0.071, 0.078, 0.071) // var(--bg-2) aprox.
const LINE = rgb(0.16, 0.18, 0.15) // var(--line) aprox.
const TX = rgb(0.93, 0.95, 0.92) // texto principal claro
const TX_DIM = rgb(0.6, 0.64, 0.58) // texto secundário

const PAGE_SIZE: [number, number] = [595.28, 841.89] // A4
const MARGIN_X = 40
const FOOTER_Y = 56

export type ProposalFicha = {
  motor: string | null
  velocidade: string | null
  autonomia: string | null
  bateria: string | null
  freios: string | null
  capacidade: string | null
  moq: string | null
}

export type ProposalItemData = {
  produto: string
  categoria: string | null
  ficha: ProposalFicha
  quantidade: number | null
  valorUnit: number | null
  imagemUrl: string | null
}

export type ProposalPdfData = {
  proposalId: string
  empresa: string
  cnpj: string
  contato: string
  itens: ProposalItemData[]
  valor: number | null
  moeda: string
  observacoes: string | null
  criadaEm: string
}

const VALOR_ITENS = [
  "Curadoria e validação de fornecedor na China",
  "Negociação direta para melhor custo",
  "Gestão completa da operação",
  "Suporte durante todo o processo",
]

const DIFERENCIAL_ITENS = [
  "Acesso a fornecedores validados",
  "Redução de custos na negociação",
  "Possibilidade de financiamento da operação",
  "Menos risco e mais previsibilidade",
]

export async function buildProposalPdf(d: ProposalPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  let page = doc.addPage(PAGE_SIZE)
  const { width, height } = page.getSize()
  drawBg(page, width, height)

  let logo: Awaited<ReturnType<typeof doc.embedPng>> | null = null
  try {
    const logoResp = await fetch("https://www.tradek.com.br/tradek-logo.png")
    const logoBytes = new Uint8Array(await logoResp.arrayBuffer())
    logo = await doc.embedPng(logoBytes)
  } catch { /* logo opcional — não bloqueia a geração do PDF */ }
  drawLogoAndStripe(page, logo, width, height)

  let y = height - 96
  page.drawText("COTAÇÃO COMERCIAL", { x: MARGIN_X, y, size: 10, font: fontBold, color: LIME })
  y -= 24
  page.drawText(`Nº ${d.proposalId.slice(0, 8).toUpperCase()}`, { x: MARGIN_X, y, size: 18, font: fontBold, color: TX })
  y -= 15
  page.drawText(new Date(d.criadaEm).toLocaleDateString("pt-BR"), { x: MARGIN_X, y, size: 9, font, color: TX_DIM })

  y -= 18
  page.drawLine({ start: { x: MARGIN_X, y }, end: { x: width - MARGIN_X, y }, thickness: 0.75, color: LINE })

  y -= 16
  y = drawSectionTitle(page, fontBold, "CLIENTE", y)
  page.drawText(d.empresa || "—", { x: MARGIN_X, y, size: 12, font: fontBold, color: TX })
  y -= 14
  const linhaCliente = [d.cnpj ? `CNPJ: ${d.cnpj}` : null, d.contato ? `Contato: ${d.contato}` : null].filter(Boolean).join("   ·   ")
  if (linhaCliente) { page.drawText(linhaCliente, { x: MARGIN_X, y, size: 9, font, color: TX_DIM }); y -= 12 }

  // cartões de produto — um por item da cotação, cada um com sua própria imagem/ficha técnica
  y -= 14
  y = drawSectionTitle(page, fontBold, `PRODUTOS DA COTAÇÃO (${d.itens.length})`, y)
  for (const item of d.itens) {
    let productImg: Awaited<ReturnType<typeof doc.embedPng>> | null = null
    if (item.imagemUrl) {
      try {
        const imgResp = await fetch(item.imagemUrl)
        const imgBytes = new Uint8Array(await imgResp.arrayBuffer())
        const ct = imgResp.headers.get("content-type") ?? ""
        productImg = ct.includes("png") ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes)
      } catch { /* imagem opcional — não bloqueia a geração do PDF */ }
    }

    const fichaPares = ([
      ["Motor", item.ficha.motor], ["Velocidade", item.ficha.velocidade], ["Autonomia", item.ficha.autonomia],
      ["Bateria", item.ficha.bateria], ["Freios", item.ficha.freios], ["Capacidade", item.ficha.capacidade], ["MOQ (mín.)", item.ficha.moq],
    ] as const).filter(([, v]) => !!v)
    const fichaCols = 3
    const fichaRows = fichaPares.length ? Math.ceil(fichaPares.length / fichaCols) : 0
    const thumbSize = 56
    const cardH = 58 + (fichaRows > 0 ? fichaRows * 13 + 6 : 0)
    ;({ page, y } = ensureSpace(doc, page, y, cardH + 8))

    const cardTop = y
    const textRight = productImg ? width - MARGIN_X - thumbSize - 24 : width - MARGIN_X
    page.drawRectangle({ x: MARGIN_X, y: cardTop - cardH, width: width - MARGIN_X * 2, height: cardH, color: BG_2 })
    page.drawRectangle({ x: MARGIN_X, y: cardTop - cardH, width: width - MARGIN_X * 2, height: cardH, borderColor: LINE, borderWidth: 1, color: undefined })

    if (productImg) {
      const scale = Math.min(thumbSize / productImg.width, thumbSize / productImg.height)
      const iw = productImg.width * scale, ih = productImg.height * scale
      const ix = width - MARGIN_X - thumbSize + (thumbSize - iw) / 2
      const iy = cardTop - 16 - thumbSize + (thumbSize - ih) / 2
      page.drawImage(productImg, { x: ix, y: iy, width: iw, height: ih })
    }

    page.drawText("PRODUTO", { x: MARGIN_X + 14, y: cardTop - 18, size: 7.5, font: fontBold, color: TX_DIM })
    const nomeProduto = item.categoria ? `${item.produto} — uso urbano / mobilidade leve` : item.produto
    const nomeAvailWidth = textRight - MARGIN_X - 14
    let nomeSize = 12
    while (nomeSize > 9 && fontBold.widthOfTextAtSize(nomeProduto || "—", nomeSize) > nomeAvailWidth) nomeSize -= 0.5
    page.drawText(nomeProduto || "—", { x: MARGIN_X + 14, y: cardTop - 32, size: nomeSize, font: fontBold, color: TX })

    page.drawText("QTD.", { x: MARGIN_X + 14, y: cardTop - 50, size: 7.5, font: fontBold, color: TX_DIM })
    page.drawText(String(item.quantidade ?? "—"), { x: MARGIN_X + 14, y: cardTop - 61, size: 10, font, color: TX })

    page.drawText("VALOR UNIT.", { x: MARGIN_X + 130, y: cardTop - 50, size: 7.5, font: fontBold, color: TX_DIM })
    page.drawText(item.valorUnit != null ? `${d.moeda} ${item.valorUnit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—", { x: MARGIN_X + 130, y: cardTop - 61, size: 10, font, color: TX })

    if (fichaPares.length) {
      const colWidth = (width - MARGIN_X * 2 - 28) / fichaCols
      let fy = cardTop - 73
      let col = 0
      for (const [label, value] of fichaPares) {
        const fx = MARGIN_X + 14 + col * colWidth
        page.drawText(`${label}: `, { x: fx, y: fy, size: 8, font: fontBold, color: TX_DIM })
        const labelW = font.widthOfTextAtSize(`${label}: `, 8)
        page.drawText(String(value), { x: fx + labelW, y: fy, size: 8, font, color: TX })
        col++
        if (col === fichaCols) { col = 0; fy -= 13 }
      }
    }

    y = cardTop - cardH - 8
  }
  y -= 6

  // bloco de valor + condições comerciais, lado a lado para economizar espaço
  const colW = (width - MARGIN_X * 2 - 24) / 2
  const colXEsq = MARGIN_X
  const colXDir = MARGIN_X + colW + 24
  const cond = [
    "Prazo de produção: 30 dias",
    "Entrega estimada conforme navio",
    `Moeda: ${d.moeda}`,
    "Validade da cotação: 7 dias",
  ]
  const blocoH = 16 + Math.max(VALOR_ITENS.length, cond.length) * 13
  ;({ page, y } = ensureSpace(doc, page, y, blocoH))
  drawBulletList(page, fontBold, font, "O QUE ESTÁ INCLUSO", VALOR_ITENS, colXEsq, y, colW)
  drawBulletList(page, fontBold, font, "CONDIÇÕES COMERCIAIS", cond, colXDir, y, colW)
  y -= blocoH
  y -= 8

  // bloco de diferencial
  const diferH = 16 + DIFERENCIAL_ITENS.length * 13
  ;({ page, y } = ensureSpace(doc, page, y, diferH))
  drawBulletList(page, fontBold, font, "POR QUE IMPORTAR COM A TRADEK", DIFERENCIAL_ITENS, colXEsq, y, width - MARGIN_X * 2)
  y -= diferH
  y -= 6

  // investimento da operação
  ;({ page, y } = ensureSpace(doc, page, y, 38))
  page.drawText("INVESTIMENTO DA OPERAÇÃO", { x: MARGIN_X, y, size: 8.5, font: fontBold, color: LIME })
  y -= 17
  page.drawText(d.valor != null ? `${d.moeda} ${d.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—", { x: MARGIN_X, y, size: 17, font: fontBold, color: LIME })
  y -= 16

  if (d.observacoes) {
    ;({ page, y } = ensureSpace(doc, page, y, 28))
    page.drawText("OBSERVAÇÕES", { x: MARGIN_X, y, size: 8.5, font: fontBold, color: LIME })
    y -= 13
    const lines = wrapText(d.observacoes, 105)
    for (const line of lines) {
      ;({ page, y } = ensureSpace(doc, page, y, 12))
      page.drawText(line, { x: MARGIN_X, y, size: 9, font, color: TX_DIM }); y -= 11
    }
    y -= 4
  }

  // CTA
  const ctaH = 56
  ;({ page, y } = ensureSpace(doc, page, y, ctaH + 12))
  page.drawRectangle({ x: MARGIN_X, y: y - ctaH, width: width - MARGIN_X * 2, height: ctaH, color: BG_2 })
  page.drawRectangle({ x: MARGIN_X, y: y - ctaH, width: 4, height: ctaH, color: LIME })
  page.drawText("PRÓXIMOS PASSOS", { x: MARGIN_X + 16, y: y - 16, size: 9, font: fontBold, color: LIME })
  page.drawText("Fale com nosso time para avançar com sua importação.", { x: MARGIN_X + 16, y: y - 32, size: 10, font: fontBold, color: TX })
  page.drawText("Podemos ajustar volumes, prazos e condições conforme sua necessidade.", { x: MARGIN_X + 16, y: y - 47, size: 8.5, font, color: TX_DIM })
  y -= ctaH + 12

  ;({ page, y } = ensureSpace(doc, page, y, 16))
  page.drawText("Mais do que um fornecedor, somos o parceiro da sua importação.", { x: MARGIN_X, y, size: 10, font: fontBold, color: LIME })

  drawFooter(page, font, width)

  return doc.save()
}

function drawBg(page: PDFPage, width: number, height: number) {
  page.drawRectangle({ x: 0, y: 0, width, height, color: BG })
}

function drawLogoAndStripe(page: PDFPage, logo: Awaited<ReturnType<PDFDocument["embedPng"]>> | null, width: number, height: number) {
  if (logo) {
    const logoH = 22
    const logoW = (logo.width / logo.height) * logoH
    page.drawImage(logo, { x: MARGIN_X, y: height - 48, width: logoW, height: logoH })
  }
  page.drawRectangle({ x: 0, y: height - 60, width, height: 3, color: LIME })
}

function drawSectionTitle(page: PDFPage, fontBold: PDFFont, title: string, y: number): number {
  page.drawText(title, { x: MARGIN_X, y, size: 8.5, font: fontBold, color: LIME })
  return y - 15
}

function drawBulletList(page: PDFPage, fontBold: PDFFont, font: PDFFont, title: string, items: string[], x: number, yTop: number, colWidth: number) {
  page.drawText(title, { x, y: yTop, size: 8.5, font: fontBold, color: LIME })
  let y = yTop - 16
  for (const item of items) {
    page.drawText("•", { x, y, size: 9, font: fontBold, color: LIME })
    page.drawText(item, { x: x + 11, y, size: 9, font, color: TX, maxWidth: colWidth - 11 })
    y -= 13
  }
}

function drawFooter(page: PDFPage, font: PDFFont, width: number) {
  page.drawLine({ start: { x: MARGIN_X, y: FOOTER_Y }, end: { x: width - MARGIN_X, y: FOOTER_Y }, thickness: 0.75, color: LINE })
  page.drawText(
    "Cotação sujeita à análise cadastral, documental e financeira. Condições finais confirmadas pela equipe TradeK.",
    { x: MARGIN_X, y: FOOTER_Y - 14, size: 7.5, font, color: TX_DIM },
  )
  page.drawText("TradeK · Hub de negócios China–Brasil · www.tradek.com.br", { x: MARGIN_X, y: FOOTER_Y - 26, size: 7.5, font, color: TX_DIM })
}

function ensureSpace(doc: PDFDocument, page: PDFPage, y: number, needed: number): { page: PDFPage; y: number } {
  if (y - needed > FOOTER_Y + 22) return { page, y }
  const newPage = doc.addPage(PAGE_SIZE)
  const { width, height } = newPage.getSize()
  drawBg(newPage, width, height)
  newPage.drawRectangle({ x: 0, y: height - 60, width, height: 3, color: LIME })
  return { page: newPage, y: height - 90 }
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
