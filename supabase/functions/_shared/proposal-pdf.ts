// TradeK OS — gera PDF de Proforma Invoice no padrão comercial TradeK.
import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "npm:pdf-lib@1.17.1"

const LIME    = rgb(0.765, 0.976, 0.161)
const BG      = rgb(0.039, 0.043, 0.039)
const BG_2    = rgb(0.071, 0.078, 0.071)
const BG_3    = rgb(0.10,  0.11,  0.10)
const LINE    = rgb(0.16,  0.18,  0.15)
const TX      = rgb(0.93,  0.95,  0.92)
const TX_DIM  = rgb(0.60,  0.64,  0.58)

const PW = 595.28
const PH = 841.89
const MX = 40
const FOOTER_Y = 38

export type ProposalFicha = {
  motor: string | null; velocidade: string | null; autonomia: string | null
  bateria: string | null; freios: string | null; capacidade: string | null; moq: string | null
}
export type ProposalItemData = {
  produto: string; categoria: string | null; ficha: ProposalFicha
  quantidade: number | null; valorUnit: number | null; imagemUrl: string | null
}
export type ProposalPdfData = {
  proposalId: string; empresa: string; cnpj: string; contato: string
  itens: ProposalItemData[]; valor: number | null; moeda: string
  observacoes: string | null; criadaEm: string
}

export async function buildProposalPdf(d: ProposalPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  let page = doc.addPage([PW, PH])
  fill(page, 0, 0, PW, PH, BG)

  // logo
  let logo: Awaited<ReturnType<typeof doc.embedPng>> | null = null
  try {
    const r = await fetch("https://www.tradek.com.br/tradek-logo.png")
    logo = await doc.embedPng(new Uint8Array(await r.arrayBuffer()))
  } catch { /* logo opcional */ }

  // ── HEADER ───────────────────────────────────────────────────────────────
  fill(page, 0, PH - 64, PW, 64, BG_2)
  fill(page, 0, PH - 67, PW, 3, LIME)

  if (logo) {
    const lh = 24, lw = (logo.width / logo.height) * lh
    page.drawImage(logo, { x: MX, y: PH - 48, width: lw, height: lh })
  }

  const invoiceNum = `TK-${d.proposalId.slice(0, 4).toUpperCase()}/${new Date(d.criadaEm).getFullYear()}`
  txt(page, bold, "COTAÇÃO COMERCIAL", PW - MX - bold.widthOfTextAtSize("COTAÇÃO COMERCIAL", 7.5), PH - 22, 7.5, LIME)
  txt(page, bold, "PROFORMA INVOICE",  PW - MX - bold.widthOfTextAtSize("PROFORMA INVOICE", 15), PH - 42, 15, TX)

  let y = PH - 80

  // ── INFO: COMPRADOR + DADOS DA INVOICE ───────────────────────────────────
  const halfW = (PW - MX * 2 - 12) / 2
  const colR  = MX + halfW + 12

  // caixa comprador (esquerda)
  const infoH = 84
  fill(page, MX, y - infoH, halfW, infoH, BG_3)
  border(page, MX, y - infoH, halfW, infoH)
  txt(page, bold, "IMPORTER / COMPRADOR", MX + 10, y - 15, 7, LIME)
  txtClip(page, bold, d.empresa || "—", MX + 10, y - 29, 10.5, TX, halfW - 20)
  if (d.cnpj)    txt(page, font, `CNPJ/CPF: ${d.cnpj}`,      MX + 10, y - 44, 8, TX_DIM)
  if (d.contato) txt(page, font, `Contato: ${d.contato}`,     MX + 10, y - 56, 8, TX_DIM)

  // caixa dados da invoice (direita)
  fill(page, colR, y - infoH, halfW, infoH, BG_3)
  border(page, colR, y - infoH, halfW, infoH)

  const infoRows: [string, string][] = [
    ["Proforma Invoice Nº", invoiceNum],
    ["Data de Emissão",     new Date(d.criadaEm).toLocaleDateString("pt-BR")],
    ["Validade da Proposta","7 dias"],
  ]
  let ry = y - 18
  for (const [label, val] of infoRows) {
    txt(page, bold, `${label}:`, colR + 10, ry, 7.5, TX_DIM)
    txt(page, bold, val, colR + 10, ry - 13, 9.5, TX)
    ry -= 30
  }

  y -= infoH + 18

  // ── TABELA DE PRODUTOS ────────────────────────────────────────────────────
  ;({ page, y } = ensure(doc, page, y, 28 + d.itens.length * 24))
  sectionTitle(page, bold, "DETALHES DOS PRODUTOS", y); y -= 4

  // colunas: Item | Descrição | Qtde | Preço Unit. | Total
  const tableW = PW - MX * 2
  const cW = [32, tableW - 32 - 52 - 88 - 88, 52, 88, 88]
  const cX = cW.reduce<number[]>((acc, w, i) => { acc.push(i === 0 ? MX : acc[i - 1] + cW[i - 1]); return acc }, [])
  const headers = ["Item", "Descrição do Produto", "Qtde", "Preço Unit. (USD)", "Total (USD)"]

  // cabeçalho da tabela
  fill(page, MX, y - 22, tableW, 22, LIME)
  for (let i = 0; i < headers.length; i++) {
    const align = i >= 2
    const tw = bold.widthOfTextAtSize(headers[i], 7.5)
    const tx = align ? cX[i] + cW[i] - tw - 6 : cX[i] + 6
    txt(page, bold, headers[i], tx, y - 15, 7.5, BG)
  }
  y -= 22

  // linhas de produto
  for (let idx = 0; idx < d.itens.length; idx++) {
    const item = d.itens[idx]
    ;({ page, y } = ensure(doc, page, y, 24))
    fill(page, MX, y - 24, tableW, 24, idx % 2 === 0 ? BG_2 : BG)
    border(page, MX, y - 24, tableW, 24)

    const total = (item.quantidade ?? 0) * (item.valorUnit ?? 0)
    const rowVals = [
      String(idx + 1).padStart(2, "0"),
      item.produto,
      String(item.quantidade ?? "—"),
      item.valorUnit != null ? `$ ${fmt(item.valorUnit)}` : "sob consulta",
      total > 0 ? `$ ${fmt(total)}` : "—",
    ]
    for (let i = 0; i < rowVals.length; i++) {
      const align = i >= 2
      const f = i === 1 ? bold : font
      const tw = f.widthOfTextAtSize(rowVals[i], 9)
      const tx = align ? cX[i] + cW[i] - tw - 6 : cX[i] + 6
      txt(page, f, rowVals[i], tx, y - 16, 9, TX)
    }
    y -= 24
  }
  y -= 12

  // ── RESUMO FINANCEIRO ─────────────────────────────────────────────────────
  ;({ page, y } = ensure(doc, page, y, 66))
  sectionTitle(page, bold, "RESUMO FINANCEIRO", y); y -= 4

  const subtotal = d.itens.reduce((s, i) => s + (i.quantidade ?? 0) * (i.valorUnit ?? 0), 0)
  const totalVal = d.valor ?? subtotal
  const rW = 210
  const rX = PW - MX - rW

  // subtotal
  fill(page, rX, y - 26, rW, 26, BG_2)
  border(page, rX, y - 26, rW, 26)
  txt(page, font, "Subtotal:", rX + 10, y - 17, 8.5, TX_DIM)
  const subStr = `USD $ ${fmt(subtotal)}`
  txt(page, bold, subStr, rX + rW - bold.widthOfTextAtSize(subStr, 9) - 10, y - 17, 9, TX)
  y -= 26

  // total geral
  fill(page, rX, y - 30, rW, 30, LIME)
  txt(page, bold, "TOTAL GERAL:", rX + 10, y - 19, 9, BG)
  const totStr = `USD $ ${fmt(totalVal)}`
  txt(page, bold, totStr, rX + rW - bold.widthOfTextAtSize(totStr, 12) - 10, y - 20, 12, BG)
  y -= 44

  // ── CONDIÇÕES COMERCIAIS ──────────────────────────────────────────────────
  const condRows: [string, string][] = [
    ["Incoterm",            "FOB"],
    ["Prazo de Produção",   "30 dias"],
    ["Forma de Pagamento",  "10% Produção / 90% BL DATE"],
    ["Moeda",               `Dólar Americano (${d.moeda})`],
    ["Origem",              "Made in China"],
  ]
  const condH = 16 + Math.ceil(condRows.length / 2) * 26 + 10
  ;({ page, y } = ensure(doc, page, y, condH + 20))
  sectionTitle(page, bold, "CONDIÇÕES COMERCIAIS", y); y -= 4

  fill(page, MX, y - condH, PW - MX * 2, condH, BG_2)
  border(page, MX, y - condH, PW - MX * 2, condH)

  const condColW = (PW - MX * 2) / 2 - 10
  let col = 0, crow = 0
  for (const [label, val] of condRows) {
    const cx = MX + 12 + col * (condColW + 20)
    const cy = y - 18 - crow * 26
    txt(page, bold, `${label}:`, cx, cy, 7.5, TX_DIM)
    txt(page, font, val,          cx, cy - 13, 9, TX)
    col++
    if (col === 2) { col = 0; crow++ }
  }
  y -= condH + 16

  // ── OBSERVAÇÕES IMPORTANTES ───────────────────────────────────────────────
  const obsStd = [
    "Esta Proforma Invoice não constitui uma fatura fiscal.",
    "Os valores podem sofrer alteração após o prazo de validade.",
    "O pedido será confirmado somente após o pagamento inicial.",
    "Venda diretamente da fábrica.",
  ]
  if (d.observacoes) obsStd.push(d.observacoes)

  const obsH = 18 + obsStd.length * 15
  ;({ page, y } = ensure(doc, page, y, obsH + 20))
  sectionTitle(page, bold, "OBSERVAÇÕES IMPORTANTES", y); y -= 4

  for (const obs of obsStd) {
    ;({ page, y } = ensure(doc, page, y, 16))
    txt(page, bold, "•",  MX,      y, 9, LIME)
    txt(page, font, obs,  MX + 12, y, 8.5, TX_DIM)
    y -= 15
  }
  y -= 14

  // ── ASSINATURA ────────────────────────────────────────────────────────────
  ;({ page, y } = ensure(doc, page, y, 50))
  const sigW = (PW - MX * 2 - 24) / 2
  page.drawLine({ start: { x: MX,              y: y - 24 }, end: { x: MX + sigW,             y: y - 24 }, thickness: 0.5, color: TX_DIM })
  txt(page, font, "Assinatura do Cliente",   MX,              y - 36, 7.5, TX_DIM)
  page.drawLine({ start: { x: MX + sigW + 24, y: y - 24 }, end: { x: PW - MX,                y: y - 24 }, thickness: 0.5, color: TX_DIM })
  txt(page, font, "Carimbo / Aprovação (GOV)", MX + sigW + 24, y - 36, 7.5, TX_DIM)

  drawFooter(page, font, PW)
  return doc.save()
}

// ── helpers ───────────────────────────────────────────────────────────────────

function fill(page: PDFPage, x: number, y: number, w: number, h: number, color: ReturnType<typeof rgb>) {
  page.drawRectangle({ x, y, width: w, height: h, color })
}

function border(page: PDFPage, x: number, y: number, w: number, h: number) {
  page.drawRectangle({ x, y, width: w, height: h, borderColor: LINE, borderWidth: 0.4, color: undefined })
}

function txt(page: PDFPage, f: PDFFont, text: string, x: number, y: number, size: number, color: ReturnType<typeof rgb>) {
  page.drawText(text, { x, y, size, font: f, color })
}

function txtClip(page: PDFPage, f: PDFFont, text: string, x: number, y: number, size: number, color: ReturnType<typeof rgb>, maxW: number) {
  let s = size
  while (s > 8 && f.widthOfTextAtSize(text, s) > maxW) s -= 0.5
  page.drawText(text, { x, y, size: s, font: f, color })
}

function sectionTitle(page: PDFPage, bold: PDFFont, title: string, y: number) {
  page.drawText(title, { x: MX, y, size: 8.5, font: bold, color: LIME })
}

function fmt(n: number): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ensure(doc: PDFDocument, page: PDFPage, y: number, needed: number): { page: PDFPage; y: number } {
  if (y - needed > FOOTER_Y + 20) return { page, y }
  const np = doc.addPage([PW, PH])
  fill(np, 0, 0, PW, PH, BG)
  fill(np, 0, PH - 4, PW, 4, LIME)
  return { page: np, y: PH - 28 }
}

function drawFooter(page: PDFPage, font: PDFFont, width: number) {
  page.drawLine({ start: { x: MX, y: FOOTER_Y }, end: { x: width - MX, y: FOOTER_Y }, thickness: 0.5, color: LINE })
  txt(page, font, "Cotação sujeita à análise cadastral e financeira. Condições finais confirmadas pela equipe TradeK.", MX, FOOTER_Y - 12, 7, TX_DIM)
  txt(page, font, "TradeK · Hub de negócios China–Brasil · www.tradek.com.br", MX, FOOTER_Y - 23, 7, TX_DIM)
}
