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
const FOOTER_Y = 70

export type ProposalFicha = {
  motor: string | null
  velocidade: string | null
  autonomia: string | null
  bateria: string | null
  freios: string | null
  capacidade: string | null
  moq: string | null
}

export type ProposalPdfData = {
  proposalId: string
  empresa: string
  cnpj: string
  contato: string
  produto: string
  categoria: string | null
  ficha: ProposalFicha
  quantidade: number | null
  valorUnit: number | null
  valor: number | null
  moeda: string
  observacoes: string | null
  criadaEm: string
  imagemUrl: string | null
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

  let y = height - 112
  page.drawText("COTAÇÃO COMERCIAL", { x: MARGIN_X, y, size: 11, font: fontBold, color: LIME })
  y -= 30
  page.drawText(`Nº ${d.proposalId.slice(0, 8).toUpperCase()}`, { x: MARGIN_X, y, size: 22, font: fontBold, color: TX })
  y -= 18
  page.drawText(new Date(d.criadaEm).toLocaleDateString("pt-BR"), { x: MARGIN_X, y, size: 10, font, color: TX_DIM })

  y -= 30
  page.drawLine({ start: { x: MARGIN_X, y }, end: { x: width - MARGIN_X, y }, thickness: 0.75, color: LINE })

  y -= 24
  y = drawSectionTitle(page, fontBold, "CLIENTE", y)
  page.drawText(d.empresa || "—", { x: MARGIN_X, y, size: 13, font: fontBold, color: TX })
  y -= 16
  if (d.cnpj) { page.drawText(`CNPJ: ${d.cnpj}`, { x: MARGIN_X, y, size: 10, font, color: TX_DIM }); y -= 14 }
  if (d.contato) { page.drawText(`Contato: ${d.contato}`, { x: MARGIN_X, y, size: 10, font, color: TX_DIM }); y -= 14 }

  // imagem do produto (se houver)
  let productImg: Awaited<ReturnType<typeof doc.embedPng>> | null = null
  if (d.imagemUrl) {
    try {
      const imgResp = await fetch(d.imagemUrl)
      const imgBytes = new Uint8Array(await imgResp.arrayBuffer())
      const ct = imgResp.headers.get("content-type") ?? ""
      productImg = ct.includes("png") ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes)
    } catch { /* imagem opcional — não bloqueia a geração do PDF */ }
  }

  // cartão do item — produto descrito de forma profissional + ficha técnica
  y -= 24
  const fichaPares = ([
    ["Motor", d.ficha.motor], ["Velocidade", d.ficha.velocidade], ["Autonomia", d.ficha.autonomia],
    ["Bateria", d.ficha.bateria], ["Freios", d.ficha.freios], ["Capacidade", d.ficha.capacidade], ["MOQ (mínimo)", d.ficha.moq],
  ] as const).filter(([, v]) => !!v)
  const fichaRows = fichaPares.length ? Math.ceil(fichaPares.length / 2) : 0
  const cardTop = y
  const thumbSize = 64
  const cardH = 78 + (fichaRows > 0 ? fichaRows * 14 + 8 : 0)
  const textRight = productImg ? width - MARGIN_X - thumbSize - 30 : width - MARGIN_X
  page.drawRectangle({ x: MARGIN_X, y: cardTop - cardH, width: width - MARGIN_X * 2, height: cardH, color: BG_2 })
  page.drawRectangle({ x: MARGIN_X, y: cardTop - cardH, width: width - MARGIN_X * 2, height: cardH, borderColor: LINE, borderWidth: 1, color: undefined })

  if (productImg) {
    const scale = Math.min(thumbSize / productImg.width, thumbSize / productImg.height)
    const iw = productImg.width * scale, ih = productImg.height * scale
    const ix = width - MARGIN_X - thumbSize + (thumbSize - iw) / 2
    const iy = cardTop - 22 - thumbSize + (thumbSize - ih) / 2
    page.drawImage(productImg, { x: ix, y: iy, width: iw, height: ih })
  }

  page.drawText("PRODUTO", { x: MARGIN_X + 16, y: cardTop - 22, size: 8, font: fontBold, color: TX_DIM })
  const nomeProduto = d.categoria ? `${d.produto} — uso urbano / mobilidade leve` : d.produto
  page.drawText(nomeProduto || "—", { x: MARGIN_X + 16, y: cardTop - 38, size: 13, font: fontBold, color: TX, maxWidth: textRight - MARGIN_X - 16 })

  page.drawText("QTD.", { x: MARGIN_X + 16, y: cardTop - 62, size: 8, font: fontBold, color: TX_DIM })
  page.drawText(String(d.quantidade ?? "—"), { x: MARGIN_X + 16, y: cardTop - 74, size: 11, font, color: TX })

  page.drawText("VALOR UNIT.", { x: MARGIN_X + 160, y: cardTop - 62, size: 8, font: fontBold, color: TX_DIM })
  page.drawText(d.valorUnit != null ? `${d.moeda} ${d.valorUnit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—", { x: MARGIN_X + 160, y: cardTop - 74, size: 11, font, color: TX })

  if (fichaPares.length) {
    let fy = cardTop - 92
    let col = 0
    for (const [label, value] of fichaPares) {
      const fx = MARGIN_X + 16 + col * 240
      page.drawText(`${label}: `, { x: fx, y: fy, size: 9, font: fontBold, color: TX_DIM })
      const labelW = font.widthOfTextAtSize(`${label}: `, 9)
      page.drawText(String(value), { x: fx + labelW, y: fy, size: 9, font, color: TX })
      col++
      if (col === 2) { col = 0; fy -= 14 }
    }
  }

  y = cardTop - cardH - 26

  // bloco de valor: o que está incluso
  ;({ page, y } = ensureSpace(doc, page, y, 28 + VALOR_ITENS.length * 16))
  y = drawSectionTitle(page, fontBold, "O QUE ESTÁ INCLUSO NA SUA IMPORTAÇÃO", y)
  for (const item of VALOR_ITENS) {
    ;({ page, y } = ensureSpace(doc, page, y, 16))
    page.drawText("•", { x: MARGIN_X, y, size: 10, font: fontBold, color: LIME })
    page.drawText(item, { x: MARGIN_X + 14, y, size: 10.5, font, color: TX })
    y -= 16
  }
  y -= 12

  // bloco de condições comerciais
  const cond = [
    "Prazo de produção: 30 dias",
    "Prazo de entrega estimado de acordo com navio",
    `Moeda: ${d.moeda}`,
    "Validade da cotação: 7 dias",
  ]
  ;({ page, y } = ensureSpace(doc, page, y, 28 + cond.length * 16))
  y = drawSectionTitle(page, fontBold, "CONDIÇÕES COMERCIAIS", y)
  for (const item of cond) {
    ;({ page, y } = ensureSpace(doc, page, y, 16))
    page.drawText("•", { x: MARGIN_X, y, size: 10, font: fontBold, color: LIME })
    page.drawText(item, { x: MARGIN_X + 14, y, size: 10.5, font, color: TX })
    y -= 16
  }
  y -= 12

  // bloco de diferencial
  ;({ page, y } = ensureSpace(doc, page, y, 28 + DIFERENCIAL_ITENS.length * 16))
  y = drawSectionTitle(page, fontBold, "POR QUE IMPORTAR COM A TRADEK", y)
  for (const item of DIFERENCIAL_ITENS) {
    ;({ page, y } = ensureSpace(doc, page, y, 16))
    page.drawText("•", { x: MARGIN_X, y, size: 10, font: fontBold, color: LIME })
    page.drawText(item, { x: MARGIN_X + 14, y, size: 10.5, font, color: TX })
    y -= 16
  }
  y -= 16

  // investimento da operação
  ;({ page, y } = ensureSpace(doc, page, y, 60))
  page.drawText("INVESTIMENTO DA OPERAÇÃO", { x: MARGIN_X, y, size: 9, font: fontBold, color: LIME })
  y -= 22
  page.drawText(d.valor != null ? `${d.moeda} ${d.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—", { x: MARGIN_X, y, size: 20, font: fontBold, color: LIME })
  y -= 30

  if (d.observacoes) {
    ;({ page, y } = ensureSpace(doc, page, y, 40))
    page.drawText("OBSERVAÇÕES", { x: MARGIN_X, y, size: 9, font: fontBold, color: LIME })
    y -= 18
    const lines = wrapText(d.observacoes, 95)
    for (const line of lines) {
      ;({ page, y } = ensureSpace(doc, page, y, 16))
      page.drawText(line, { x: MARGIN_X, y, size: 10, font, color: TX_DIM }); y -= 14
    }
    y -= 8
  }

  // CTA
  const ctaH = 100
  ;({ page, y } = ensureSpace(doc, page, y, ctaH + 20))
  page.drawRectangle({ x: MARGIN_X, y: y - ctaH, width: width - MARGIN_X * 2, height: ctaH, color: BG_2 })
  page.drawRectangle({ x: MARGIN_X, y: y - ctaH, width: 4, height: ctaH, color: LIME })
  page.drawText("PRÓXIMOS PASSOS", { x: MARGIN_X + 20, y: y - 22, size: 10, font: fontBold, color: LIME })
  page.drawText("Fale com nosso time para avançar com sua importação.", { x: MARGIN_X + 20, y: y - 42, size: 11, font: fontBold, color: TX })
  page.drawText("Podemos ajustar volumes, prazos e condições conforme sua necessidade.", { x: MARGIN_X + 20, y: y - 60, size: 10, font, color: TX_DIM })
  y -= ctaH + 24

  ;({ page, y } = ensureSpace(doc, page, y, 24))
  page.drawText("Mais do que um fornecedor, somos o parceiro da sua importação.", { x: MARGIN_X, y, size: 11, font: fontBold, color: LIME })

  drawFooter(page, font, width)

  return doc.save()
}

function drawBg(page: PDFPage, width: number, height: number) {
  page.drawRectangle({ x: 0, y: 0, width, height, color: BG })
}

function drawLogoAndStripe(page: PDFPage, logo: Awaited<ReturnType<PDFDocument["embedPng"]>> | null, width: number, height: number) {
  if (logo) {
    const logoH = 24
    const logoW = (logo.width / logo.height) * logoH
    page.drawImage(logo, { x: MARGIN_X, y: height - 56, width: logoW, height: logoH })
  }
  page.drawRectangle({ x: 0, y: height - 70, width, height: 3, color: LIME })
}

function drawSectionTitle(page: PDFPage, fontBold: PDFFont, title: string, y: number): number {
  page.drawText(title, { x: MARGIN_X, y, size: 9, font: fontBold, color: LIME })
  return y - 18
}

function drawFooter(page: PDFPage, font: PDFFont, width: number) {
  page.drawLine({ start: { x: MARGIN_X, y: FOOTER_Y }, end: { x: width - MARGIN_X, y: FOOTER_Y }, thickness: 0.75, color: LINE })
  page.drawText(
    "Cotação sujeita à análise cadastral, documental e financeira. Condições finais confirmadas pela equipe TradeK.",
    { x: MARGIN_X, y: FOOTER_Y - 18, size: 8.5, font, color: TX_DIM },
  )
  page.drawText("TradeK · Hub de negócios China–Brasil · www.tradek.com.br", { x: MARGIN_X, y: FOOTER_Y - 32, size: 8.5, font, color: TX_DIM })
}

function ensureSpace(doc: PDFDocument, page: PDFPage, y: number, needed: number): { page: PDFPage; y: number } {
  if (y - needed > FOOTER_Y + 40) return { page, y }
  const newPage = doc.addPage(PAGE_SIZE)
  const { width, height } = newPage.getSize()
  drawBg(newPage, width, height)
  newPage.drawRectangle({ x: 0, y: height - 70, width, height: 3, color: LIME })
  return { page: newPage, y: height - 100 }
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
