import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Icon, Btn, UNITS } from "@/components/tradek/ui"
import { usePick } from "@/lib/i18n"
import { useAgent, useProducts, PRODUCT_CATS, createPublicLead, type Product } from "./site-context"

function img0(p: Product): string | undefined {
  const a = p.imagens as unknown
  return Array.isArray(a) && typeof a[0] === "string" ? (a[0] as string) : undefined
}

export function Compliance({ children }: { children?: React.ReactNode }) {
  const fallback = usePick(
    "Sujeito à análise cadastral, documental, financeira e aprovação da linha de crédito.",
    "Subject to credit, document and financial review and credit line approval.",
    "Sujeto a análisis registral, documental, financiero y aprobación de la línea de crédito.",
  )
  return (
    <div className="row gap8" style={{ fontSize: 11.5, color: "var(--tx-mute)", marginTop: 14, maxWidth: "52ch", lineHeight: 1.5 }}>
      <Icon name="shield" size={13} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{children || fallback}</span>
    </div>
  )
}

export function FaqRow({ q, a }: { q: string; a: string }) {
  const [o, setO] = useState(false)
  return (
    <div style={{ borderTop: "1px solid var(--line)" }}>
      <button className="row center" style={{ width: "100%", justifyContent: "space-between", padding: "18px 0", textAlign: "left" }} onClick={() => setO(!o)}>
        <span className="disp" style={{ fontSize: 17, fontWeight: 500 }}>{q}</span>
        <Icon name={o ? "x" : "plus"} size={18} style={{ color: "var(--lime)", flexShrink: 0, marginLeft: 16 }} />
      </button>
      {o && <p className="muted fade" style={{ fontSize: 14.5, lineHeight: 1.6, paddingBottom: 20, maxWidth: "72ch", margin: 0, whiteSpace: "pre-line" }}>{a}</p>}
    </div>
  )
}

function UnitHero({ u, title, sub, cta }: { u: string; title: string; sub: string; cta: string }) {
  const { openAgent } = useAgent()
  const m = UNITS[u]
  const t = usePick(
    { home: "Início", specialist: "Falar com especialista" },
    { home: "Home", specialist: "Talk to a specialist" },
    { home: "Inicio", specialist: "Hablar con un especialista" },
  )
  return (
    <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
      <div className="tk-grid" style={{ position: "absolute", inset: 0, opacity: 0.5 }}></div>
      <div style={{ position: "absolute", top: -140, left: "40%", width: 480, height: 480, background: `radial-gradient(circle,${m.color === "var(--lime)" ? "rgba(195,249,41,.1)" : "rgba(91,200,255,.08)"},transparent 65%)` }}></div>
      <div className="sec-pad" style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "64px 40px 56px" }}>
        <Link to="/" className="row gap6 faint" style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 22 }}><Icon name="chevL" size={14} /> {t.home}</Link>
        <div className="row gap8 center"><span className="pill pill--lime"><Icon name={m.icon} size={13} /> {m.short}</span></div>
        <h1 className="disp fz-hero" style={{ fontSize: 52, lineHeight: 1.02, letterSpacing: "-.025em", fontWeight: 600, margin: "18px 0 0", maxWidth: "18ch" }}>{title}</h1>
        <p className="muted" style={{ fontSize: 16.5, lineHeight: 1.55, maxWidth: "56ch", marginTop: 20 }}>{sub}</p>
        <div className="row gap12 cta-stack" style={{ marginTop: 28 }}>
          <button className="btn btn--lime" onClick={openAgent}><Icon name="zap" size={15} /> {cta}</button>
          <Link className="btn btn--ghost" to="/contato">{t.specialist}</Link>
        </div>
      </div>
    </section>
  )
}

export function SiteHome() {
  const units = usePick(
    [
      { u: "SCF", n: "01", t: "Supply Chain Finance", d: "Importe da Ásia com 90–180 dias de prazo. Financiamento de até 100% do FOB, sujeito a análise.", h: "/scf" },
      { u: "PROC", n: "02", t: "Procurement Internacional", d: "Encontramos, validamos e negociamos fornecedores chineses sob medida.", h: "/proc" },
      { u: "MOTOS", n: "03", t: "Produtos da China", d: "Catálogo de fornecedores chineses. Compre em lote e revenda no Brasil.", h: "/motos" },
    ],
    [
      { u: "SCF", n: "01", t: "Supply Chain Finance", d: "Import from Asia with 90–180 days terms. Financing of up to 100% of FOB, subject to review.", h: "/scf" },
      { u: "PROC", n: "02", t: "International Procurement", d: "We find, validate and negotiate Chinese suppliers tailored to you.", h: "/proc" },
      { u: "MOTOS", n: "03", t: "Products from China", d: "Catalog of Chinese suppliers. Buy in bulk and resell in Brazil.", h: "/motos" },
    ],
    [
      { u: "SCF", n: "01", t: "Supply Chain Finance", d: "Importe desde Asia con 90–180 días de plazo. Financiamiento de hasta el 100% del FOB, sujeto a análisis.", h: "/scf" },
      { u: "PROC", n: "02", t: "Procurement Internacional", d: "Encontramos, validamos y negociamos proveedores chinos a su medida.", h: "/proc" },
      { u: "MOTOS", n: "03", t: "Productos de China", d: "Catálogo de proveedores chinos. Compre por lote y revenda en Brasil.", h: "/motos" },
    ],
  )
  const tt = usePick(
    {
      eyebrow: "China · Brasil · Trade Operations", h1a: "Importação direta com ", h1b: "financiamento", h1c: " na Ásia.",
      lead: <>A Trade-K conecta sua empresa aos melhores fornecedores na China e viabiliza suas compras com crédito, negociação estratégica e gestão completa da operação financeira.<br /><br />Sem complicação, com mais margem e total controle.</>,
      cta: "Falar com um especialista", explore: "Explorar",
      metrics: [["FOB financiável", "100%", "sujeito a análise"], ["Prazo de pagamento", "90–180", "dias"], ["Pagamento ao fornecedor", "Ásia", "direto"], ["Unidades de negócio", "3", "SCF · Proc · Produtos"]] as [string, string, string][],
      legal: <>A TradeK não é um banco ou uma instituição financeira, portanto, não concede empréstimos diretos. Não operamos como agente originador e de cobrança na gestão de garantias – Responsabilidade Limitada (CNPJ: 18.228.061/0001-76).<br />
        As informações contidas neste site têm caráter meramente informativo, e seu uso deve estar de acordo com a legislação vigente. Consulte um de nossos especialistas para mais informações.</>,
      howEyebrow: "Como a TradeK ajuda", howTitle: "Da primeira conversa ao contêiner no porto.",
      steps: [["chat", "Capte", "Agente IA qualifica seu pedido e organiza os dados."], ["shield", "Analise", "Avaliação cadastral, documental e financeira."], ["ship", "Importe", "Pagamento direto ao fornecedor na Ásia, com prazo."], ["trend", "Escale", "Operação recorrente com previsibilidade e suporte."]] as [string, string, string][],
      faqEyebrow: "Dúvidas frequentes", faqTitle: "Perguntas comuns", seeAll: "Ver todas",
      faqs: [["Preciso ter RADAR para importar?", "Sim, a habilitação no RADAR/Siscomex é necessária. Orientamos você em todo o processo de cadastro."], ["O prazo de 90–180 dias é garantido?", "Não. O prazo é sujeito à análise cadastral, documental e à aprovação da linha de crédito."], ["Vocês escolhem o fornecedor por mim?", "No Procurement, sim — encontramos, validamos e negociamos. No SCF, você pode trazer seu fornecedor."]] as [string, string][],
      ctaTitle: "Pronto para avaliar sua próxima importação?", ctaSub: "Converse com o Agente TradeK ou solicite uma análise. Resposta no mesmo dia.",
      whatsapp: "Whatsapp TradeK", request: "Solicitar análise",
    },
    {
      eyebrow: "China · Brazil · Trade Operations", h1a: "Direct import with ", h1b: "financing", h1c: " in Asia.",
      lead: <>Trade-K connects your company to the best suppliers in China and enables your purchases with credit, strategic negotiation and complete financial operation management.<br /><br />No hassle, more margin and total control.</>,
      cta: "Talk to a specialist", explore: "Explore",
      metrics: [["Financeable FOB", "100%", "subject to review"], ["Payment term", "90–180", "days"], ["Payment to supplier", "Asia", "direct"], ["Business units", "3", "SCF · Procurement · Products"]] as [string, string, string][],
      legal: <>TradeK is not a bank or a financial institution, and therefore does not grant direct loans. We do not act as an originating or collection agent in collateral management – Limited Liability (CNPJ: 18.228.061/0001-76).<br />
        The information on this website is for informational purposes only, and its use must comply with applicable law. Consult one of our specialists for more information.</>,
      howEyebrow: "How TradeK helps", howTitle: "From the first conversation to the container at the port.",
      steps: [["chat", "Capture", "AI agent qualifies your request and organizes the data."], ["shield", "Review", "Credit, document and financial assessment."], ["ship", "Import", "Direct payment to the supplier in Asia, with terms."], ["trend", "Scale", "Recurring operation with predictability and support."]] as [string, string, string][],
      faqEyebrow: "Frequently asked questions", faqTitle: "Common questions", seeAll: "See all",
      faqs: [["Do I need RADAR to import?", "Yes, RADAR/Siscomex registration is required. We guide you through the entire registration process."], ["Is the 90–180 day term guaranteed?", "No. The term is subject to credit, document review and credit line approval."], ["Do you choose the supplier for me?", "In Procurement, yes — we find, validate and negotiate. In SCF, you can bring your own supplier."]] as [string, string][],
      ctaTitle: "Ready to evaluate your next import?", ctaSub: "Chat with the TradeK Agent or request a review. Response on the same day.",
      whatsapp: "Whatsapp TradeK", request: "Request a review",
    },
    {
      eyebrow: "China · Brasil · Trade Operations", h1a: "Importación directa con ", h1b: "financiamiento", h1c: " en Asia.",
      lead: <>Trade-K conecta su empresa con los mejores proveedores en China y viabiliza sus compras con crédito, negociación estratégica y gestión completa de la operación financiera.<br /><br />Sin complicaciones, con más margen y control total.</>,
      cta: "Hablar con un especialista", explore: "Explorar",
      metrics: [["FOB financiable", "100%", "sujeto a análisis"], ["Plazo de pago", "90–180", "días"], ["Pago al proveedor", "Asia", "directo"], ["Unidades de negocio", "3", "SCF · Procurement · Productos"]] as [string, string, string][],
      legal: <>TradeK no es un banco ni una institución financiera, por lo tanto, no otorga préstamos directos. No operamos como agente originador ni de cobranza en la gestión de garantías – Responsabilidad Limitada (CNPJ: 18.228.061/0001-76).<br />
        La información contenida en este sitio tiene carácter meramente informativo, y su uso debe estar de acuerdo con la legislación vigente. Consulte a uno de nuestros especialistas para más información.</>,
      howEyebrow: "Cómo ayuda TradeK", howTitle: "De la primera conversación al contenedor en el puerto.",
      steps: [["chat", "Capte", "El Agente IA califica su solicitud y organiza los datos."], ["shield", "Analice", "Evaluación registral, documental y financiera."], ["ship", "Importe", "Pago directo al proveedor en Asia, con plazo."], ["trend", "Escale", "Operación recurrente con previsibilidad y soporte."]] as [string, string, string][],
      faqEyebrow: "Preguntas frecuentes", faqTitle: "Preguntas comunes", seeAll: "Ver todas",
      faqs: [["¿Necesito RADAR para importar?", "Sí, la habilitación en RADAR/Siscomex es necesaria. Lo orientamos en todo el proceso de registro."], ["¿El plazo de 90–180 días está garantizado?", "No. El plazo está sujeto al análisis registral, documental y a la aprobación de la línea de crédito."], ["¿Ustedes eligen el proveedor por mí?", "En Procurement, sí — encontramos, validamos y negociamos. En SCF, usted puede traer su propio proveedor."]] as [string, string][],
      ctaTitle: "¿Listo para evaluar su próxima importación?", ctaSub: "Hable con el Agente TradeK o solicite un análisis. Respuesta el mismo día.",
      whatsapp: "Whatsapp TradeK", request: "Solicitar análisis",
    },
  )
  return (
    <div>
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
        <div className="tk-grid" style={{ position: "absolute", inset: 0, opacity: 0.6 }}></div>
        <div style={{ position: "absolute", top: -160, right: -120, width: 520, height: 520, background: "radial-gradient(circle,rgba(195,249,41,.12),transparent 65%)" }}></div>
        <div className="g-1m sec-pad" style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "28px 40px 21px", display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 48, alignItems: "center" }}>
          <div className="fade">
            <div className="eyebrow">{tt.eyebrow}</div>
            <h1 className="disp fz-hero" style={{ fontSize: 60, lineHeight: 1.0, letterSpacing: "-.025em", fontWeight: 600, margin: "22px 0 0" }}>{tt.h1a}<span style={{ color: "var(--lime)" }}>{tt.h1b}</span>{tt.h1c}</h1>
            <p className="muted" style={{ fontSize: 16.5, lineHeight: 1.55, maxWidth: "48ch", marginTop: 22 }}>{tt.lead}</p>
            <div className="row gap12 cta-stack" style={{ marginTop: 30 }}>
              <Link className="btn btn--lime" to="/scf?agent=1"><Icon name="zap" size={15} /> {tt.cta}</Link>
            </div>
          </div>
          <div className="col gap12 fade">
            {units.map((c) => <Link key={c.u} to={c.h} className="unit-card">
              <div className="row center" style={{ justifyContent: "space-between" }}>
                <span className="mono" style={{ fontSize: 11, opacity: 0.6 }}>{c.n} / {UNITS[c.u].short.toUpperCase()}</span>
                <Icon name={UNITS[c.u].icon} size={18} />
              </div>
              <div className="disp" style={{ fontSize: 19, fontWeight: 600, marginTop: 14 }}>{c.t}</div>
              <div style={{ fontSize: 13, lineHeight: 1.45, marginTop: 6, color: "var(--tx-dim)" }}>{c.d}</div>
              <div className="row gap6" style={{ marginTop: 14, fontSize: 12.5, fontWeight: 700 }}>{tt.explore} <Icon name="arrowR" size={13} /></div>
            </Link>)}
          </div>
        </div>
        <div className="g-metrics g-2m" style={{ position: "relative", borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "repeat(4,1fr)", maxWidth: 1280, margin: "0 auto" }}>
          {tt.metrics.map(([l, v, s], i) =>
            <div key={l} style={{ padding: "20px 24px", borderRight: i < 3 ? "1px solid var(--line)" : "none" }}>
              <div className="tag">{l}</div>
              <div className="disp" style={{ fontSize: 28, fontWeight: 600, marginTop: 6, letterSpacing: "-.01em" }}><span style={{ color: "var(--lime)" }}>{v}</span> <span style={{ fontSize: 13, color: "var(--tx-mute)", fontWeight: 400 }}>{s}</span></div>
            </div>)}
        </div>
      </section>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 40px", borderBottom: "1px solid var(--line)" }}>
        <p style={{ fontSize: 10.5, color: "var(--tx-mute)", lineHeight: 1.6, margin: 0 }}>{tt.legal}</p>
      </div>

      <section className="sec-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 40px 0" }}>
        <div className="eyebrow">{tt.howEyebrow}</div>
        <h2 className="disp fz-lg" style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-.02em", margin: "16px 0 0", maxWidth: "18ch" }}>{tt.howTitle}</h2>
        <div className="g-2m" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden", marginTop: 36 }}>
          {tt.steps.map(([ic, t, d], i) =>
            <div key={t} style={{ background: "var(--bg-1)", padding: "28px 24px" }}>
              <div className="row center gap10"><span className="mono lime" style={{ fontSize: 12 }}>0{i + 1}</span><Icon name={ic} size={20} style={{ color: "var(--lime)" }} /></div>
              <div className="disp" style={{ fontSize: 19, fontWeight: 600, marginTop: 18 }}>{t}</div>
              <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 8 }}>{d}</div>
            </div>)}
        </div>
      </section>

      <section className="sec-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 40px 0" }}>
        <div className="row center" style={{ justifyContent: "space-between", gap: 12 }}><div><div className="eyebrow">{tt.faqEyebrow}</div><h2 className="disp fz-md" style={{ fontSize: 32, fontWeight: 600, margin: "14px 0 0" }}>{tt.faqTitle}</h2></div><Link className="btn btn--ghost btn--sm" to="/faq" style={{ flexShrink: 0 }}>{tt.seeAll} <Icon name="arrowR" size={13} /></Link></div>
        <div style={{ marginTop: 28 }}>
          {tt.faqs.map(([q, a]) => <FaqRow key={q} q={q} a={a} />)}
        </div>
      </section>

      <section className="sec-pad" style={{ maxWidth: 1280, margin: "72px auto 0", padding: "0 40px" }}>
        <div className="sec-pad" style={{ position: "relative", overflow: "hidden", background: "var(--lime)", borderRadius: 10, padding: "52px 48px", color: "#0A0B0A" }}>
          <div className="disp fz-lg" style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-.02em", maxWidth: "20ch" }}>{tt.ctaTitle}</div>
          <p style={{ fontSize: 15.5, marginTop: 12, maxWidth: "48ch", opacity: 0.72, fontWeight: 500 }}>{tt.ctaSub}</p>
          <div className="row gap12 cta-stack" style={{ marginTop: 26 }}>
            <a className="btn" style={{ background: "#0A0B0A", color: "var(--lime)" }} href="https://wa.me/5515997673340" target="_blank" rel="noopener noreferrer"><Icon name="chat" size={15} /> {tt.whatsapp}</a>
            <Link className="btn" style={{ border: "1px solid rgba(10,11,10,.3)", color: "#0A0B0A" }} to="/contato">{tt.request}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export function SiteSCF() {
  const { openAgent } = useAgent()
  const t = usePick(
    {
      cta: "Avaliar minha importação", title: "Seu fornecedor recebe à vista, sem afetar seu fluxo de caixa.",
      sub: "Pague seu fornecedor na Ásia à vista e acesse prazos de até 180 dias para liquidação. A Trade-K estrutura sua operação com crédito, negociação e gestão integrada.",
      howEyebrow: "Como funciona",
      steps: [["Análise", "Solicite a análise do crédito por um de nossos canais"], ["Crédito na origem", "Viabilizamos a linha diretamente na Ásia, junto aos parceiros."], ["Pagamento ao fornecedor", "Liquidação à vista na Ásia."], ["Prazo no Brasil", "Pagamento em até 180 dias, conforme estrutura."]] as [string, string][],
      tradekEyebrow: "(Trade-K) Crédito estruturado na Ásia",
      tradekItems: ["Origem do crédito: Internacional, direto na Ásia", "Garantia: Sem exigência de garantias locais", "Pagamento ao fornecedor: À vista, direto na China", "Moeda: Estruturada na origem da operação", "Prazo: Até 180 dias para pagamento no Brasil", "Impacto no caixa: Preserva capital de giro", "Estrutura: Operação integrada (crédito + pagamento)", "Acesso: Conexão com parceiros internacionais", "Aplicação: Ideal para importação e ganho de margem"],
      tradEyebrow: "Financiamento tradicional (Brasil)",
      tradItems: ["Origem do crédito: Bancos locais", "Garantia: Exigência de garantias reais ou recebíveis", "Pagamento ao fornecedor: Nem sempre à vista", "Moeda: Exposição cambial + necessidade de hedge", "Prazo: Mais restrito e menos flexível", "Impacto no caixa: Compromete limite de crédito", "Estrutura: Processo fragmentado (crédito + câmbio + pagamento)", "Acesso: Burocrático e limitado", "Aplicação: Menor eficiência para importação"],
      radarTitle: "Precisa de RADAR/Siscomex?", radarDesc: "A habilitação é necessária para importar. Orientamos você em todo o processo — do enquadramento ao registro.", radarCta: "Entender documentos",
    },
    {
      cta: "Evaluate my import", title: "Your supplier gets paid upfront, without affecting your cash flow.",
      sub: "Pay your supplier in Asia upfront and access terms of up to 180 days for settlement. Trade-K structures your operation with credit, negotiation and integrated management.",
      howEyebrow: "How it works",
      steps: [["Review", "Request the credit review through one of our channels"], ["Credit at origin", "We enable the credit line directly in Asia, with our partners."], ["Payment to supplier", "Upfront settlement in Asia."], ["Term in Brazil", "Payment in up to 180 days, depending on structure."]] as [string, string][],
      tradekEyebrow: "(Trade-K) Structured credit in Asia",
      tradekItems: ["Credit origin: International, direct in Asia", "Collateral: No local collateral required", "Payment to supplier: Upfront, direct in China", "Currency: Structured at the operation's origin", "Term: Up to 180 days for payment in Brazil", "Cash flow impact: Preserves working capital", "Structure: Integrated operation (credit + payment)", "Access: Connection with international partners", "Application: Ideal for importing and gaining margin"],
      tradEyebrow: "Traditional financing (Brazil)",
      tradItems: ["Credit origin: Local banks", "Collateral: Requires real collateral or receivables", "Payment to supplier: Not always upfront", "Currency: FX exposure + need for hedging", "Term: More restricted and less flexible", "Cash flow impact: Compromises credit limit", "Structure: Fragmented process (credit + FX + payment)", "Access: Bureaucratic and limited", "Application: Lower efficiency for importing"],
      radarTitle: "Need RADAR/Siscomex?", radarDesc: "Registration is required to import. We guide you through the entire process — from classification to registration.", radarCta: "Understand the documents",
    },
    {
      cta: "Evaluar mi importación", title: "Su proveedor recibe al contado, sin afectar su flujo de caja.",
      sub: "Pague a su proveedor en Asia al contado y acceda a plazos de hasta 180 días para liquidación. Trade-K estructura su operación con crédito, negociación y gestión integrada.",
      howEyebrow: "Cómo funciona",
      steps: [["Análisis", "Solicite el análisis de crédito por uno de nuestros canales"], ["Crédito en origen", "Viabilizamos la línea directamente en Asia, junto a los socios."], ["Pago al proveedor", "Liquidación al contado en Asia."], ["Plazo en Brasil", "Pago en hasta 180 días, según la estructura."]] as [string, string][],
      tradekEyebrow: "(Trade-K) Crédito estructurado en Asia",
      tradekItems: ["Origen del crédito: Internacional, directo en Asia", "Garantía: Sin exigencia de garantías locales", "Pago al proveedor: Al contado, directo en China", "Moneda: Estructurada en el origen de la operación", "Plazo: Hasta 180 días para el pago en Brasil", "Impacto en caja: Preserva capital de trabajo", "Estructura: Operación integrada (crédito + pago)", "Acceso: Conexión con socios internacionales", "Aplicación: Ideal para importar y ganar margen"],
      tradEyebrow: "Financiamiento tradicional (Brasil)",
      tradItems: ["Origen del crédito: Bancos locales", "Garantía: Exigencia de garantías reales o cuentas por cobrar", "Pago al proveedor: No siempre al contado", "Moneda: Exposición cambiaria + necesidad de cobertura", "Plazo: Más restringido y menos flexible", "Impacto en caja: Compromete el límite de crédito", "Estructura: Proceso fragmentado (crédito + cambio + pago)", "Acceso: Burocrático y limitado", "Aplicación: Menor eficiencia para importar"],
      radarTitle: "¿Necesita RADAR/Siscomex?", radarDesc: "La habilitación es necesaria para importar. Lo orientamos en todo el proceso — desde la clasificación hasta el registro.", radarCta: "Entender los documentos",
    },
  )
  return (
    <div>
      <UnitHero u="SCF" cta={t.cta} title={t.title} sub={t.sub} />
      <section className="sec-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 40px 0" }}>
        <div className="eyebrow">{t.howEyebrow}</div>
        <div className="g-2m" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden", marginTop: 28 }}>
          {t.steps.map(([tt, d], i) =>
            <div key={tt} style={{ background: "var(--bg-1)", padding: "24px 22px" }}><div className="mono lime" style={{ fontSize: 13 }}>0{i + 1}</div><div className="disp" style={{ fontSize: 18, fontWeight: 600, marginTop: 14 }}>{tt}</div><div className="muted" style={{ fontSize: 13, lineHeight: 1.5, marginTop: 7 }}>{d}</div></div>)}
        </div>
      </section>
      <section className="g-1m sec-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 40px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div className="panel panel-b">
          <div className="eyebrow">{t.tradekEyebrow}</div>
          <div className="col gap12" style={{ marginTop: 18 }}>{t.tradekItems.map((b) => <div key={b} className="row gap10" style={{ fontSize: 14.5 }}><Icon name="check" size={16} style={{ color: "var(--lime)", flexShrink: 0 }} />{b}</div>)}</div>
          <Compliance />
        </div>
        <div className="panel panel-b">
          <div className="eyebrow">{t.tradEyebrow}</div>
          <div className="col gap10" style={{ marginTop: 18 }}>{t.tradItems.map((b) => <div key={b} className="row gap10" style={{ fontSize: 14, color: "var(--tx-dim)" }}><span style={{ color: "#e53e3e", fontWeight: 700 }}>✖</span>{b}</div>)}</div>
        </div>
      </section>
      <section className="sec-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 40px 0" }}>
        <div className="panel stack-m" style={{ padding: "28px 32px", display: "flex", alignItems: "center", gap: 24, background: "var(--bg-2)" }}>
          <Icon name="globe" size={36} style={{ color: "var(--info)", flexShrink: 0 }} />
          <div><div className="disp" style={{ fontSize: 20, fontWeight: 600 }}>{t.radarTitle}</div><div className="muted" style={{ fontSize: 14, marginTop: 4, maxWidth: "62ch", lineHeight: 1.5 }}>{t.radarDesc}</div></div>
          <button className="btn btn--lime mla" style={{ flexShrink: 0 }} onClick={openAgent}>{t.radarCta}</button>
        </div>
      </section>
    </div>
  )
}

export function SiteProc() {
  const t = usePick(
    {
      cta: "Iniciar um briefing", title: "Fornecedores certos, negociados na origem.",
      sub: "Da busca à inspeção, estruturamos sua operação com fornecedores chineses validados. Você define o produto e o target. Nós garantimos execução, negociação e controle na origem.",
      stepsEyebrow: "Etapas do processo",
      steps: [["Briefing da operação", "Definição de produto, especificações, volume e orçamento-alvo."], ["Sourcing estratégico", "Identificação e pré-seleção de fornecedores qualificados na China."], ["Validação de fornecedores", "Análise de reputação, capacidade produtiva e certificações."], ["Negociação na origem", "Ajuste de preço, MOQ e condições comerciais diretamente com o fornecedor."], ["Inspeção e controle de qualidade", "Amostragem e inspeção antes do embarque."]] as [string, string][],
      briefEyebrow: "Dados para o briefing",
      briefItems: ["Produto", "Especificações", "Volume", "Orçamento-alvo", "Prazo", "Certificações", "Mercado de destino", "Amostra", "Inspeção"],
    },
    {
      cta: "Start a briefing", title: "The right suppliers, negotiated at the source.",
      sub: "From sourcing to inspection, we structure your operation with validated Chinese suppliers. You define the product and the target. We guarantee execution, negotiation and control at the origin.",
      stepsEyebrow: "Process steps",
      steps: [["Operation briefing", "Definition of product, specifications, volume and target budget."], ["Strategic sourcing", "Identification and pre-selection of qualified suppliers in China."], ["Supplier validation", "Analysis of reputation, production capacity and certifications."], ["Negotiation at origin", "Adjustment of price, MOQ and commercial terms directly with the supplier."], ["Inspection and quality control", "Sampling and inspection before shipment."]] as [string, string][],
      briefEyebrow: "Briefing data",
      briefItems: ["Product", "Specifications", "Volume", "Target budget", "Deadline", "Certifications", "Destination market", "Sample", "Inspection"],
    },
    {
      cta: "Iniciar un briefing", title: "Los proveedores correctos, negociados en el origen.",
      sub: "Desde la búsqueda hasta la inspección, estructuramos su operación con proveedores chinos validados. Usted define el producto y el objetivo. Nosotros garantizamos ejecución, negociación y control en el origen.",
      stepsEyebrow: "Etapas del proceso",
      steps: [["Briefing de la operación", "Definición de producto, especificaciones, volumen y presupuesto objetivo."], ["Sourcing estratégico", "Identificación y preselección de proveedores calificados en China."], ["Validación de proveedores", "Análisis de reputación, capacidad productiva y certificaciones."], ["Negociación en el origen", "Ajuste de precio, MOQ y condiciones comerciales directamente con el proveedor."], ["Inspección y control de calidad", "Muestreo e inspección antes del embarque."]] as [string, string][],
      briefEyebrow: "Datos para el briefing",
      briefItems: ["Producto", "Especificaciones", "Volumen", "Presupuesto objetivo", "Plazo", "Certificaciones", "Mercado de destino", "Muestra", "Inspección"],
    },
  )
  return (
    <div>
      <UnitHero u="PROC" cta={t.cta} title={t.title} sub={t.sub} />
      <section className="sec-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 40px 0" }}>
        <div className="eyebrow">{t.stepsEyebrow}</div>
        <div className="col gap10" style={{ marginTop: 24 }}>
          {t.steps.map(([tt, d], i) =>
            <div key={tt} className="panel row center gap16" style={{ padding: "18px 22px" }}><span className="disp lime" style={{ fontSize: 24, fontWeight: 600, width: 40 }}>0{i + 1}</span><div><div className="disp" style={{ fontSize: 17, fontWeight: 600 }}>{tt}</div><div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>{d}</div></div></div>)}
        </div>
      </section>
      <section className="sec-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 40px 0" }}>
        <div className="panel panel-b">
          <div className="eyebrow">{t.briefEyebrow}</div>
          <div className="g-2m" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 18 }}>
            {t.briefItems.map((d) => <div key={d} className="row gap8" style={{ fontSize: 13.5, color: "var(--tx-dim)", padding: "8px 0" }}><span className="sdot" style={{ background: "var(--info)" }}></span>{d}</div>)}
          </div>
        </div>
      </section>
    </div>
  )
}

export function SiteMotos() {
  const { openAgent } = useAgent()
  const { products } = useProducts()
  const [compare, setCompare] = useState(false)
  const [cat, setCat] = useState("todos")
  const catMeta = PRODUCT_CATS.find((c) => c.key === cat) || PRODUCT_CATS[0]
  const list = cat === "todos" || cat === "mob" ? products : []
  const t = usePick(
    {
      cta: "Iniciar compra para revenda", title: "Produtos na origem, prontos para escalar no Brasil.",
      sub: "Um portfólio estruturado de produtos na China, com compra em lote, financiamento via Supply Chain Finance e suporte completo na importação.",
      steps: [["box", "Seleção do produto", "Escolha no portfólio de produtos e fornecedores chineses validados."], ["coins", "Estruturação do lote", "Preço FOB por MOQ (quantidade mínima por pedido) e condições da operação."], ["ship", "Importação com prazo", "Pagamento ao fornecedor na origem, com prazo de 90 a 180 dias no Brasil."], ["trend", "Revenda no Brasil", "Comercialização com margem, baseada em custo competitivo na origem."]] as [string, string, string][],
      catalogEyebrow: "Catálogo de fornecedores", cards: "Cards", compare: "Comparar", soon: "em breve",
      emptyTitle: "— em breve", emptyDesc: "Estamos cadastrando novos fornecedores chineses nesta categoria. Diga ao Agente TradeK o que você procura e avisamos quando chegar.", emptyCta: "Pedir um produto",
      product: "Produto", quote: "Cotar lote",
      tableHeaders: ["Produto", "Categoria", "Motor", "Autonomia", "Bateria", "MOQ", "FOB base"],
      verified: "Fornecedores ", verifiedB: "verificados", verifiedRest: ", com amostra e inspeção de qualidade antes do embarque. Importação assistida e pagamento com prazo via Supply Chain Finance.",
      homolog: "Homologação, certificação (INMETRO/ANATEL) e enquadramento variam por categoria. Validação antes da revenda.",
    },
    {
      cta: "Start a purchase to resell", title: "Products at origin, ready to scale in Brazil.",
      sub: "A structured portfolio of products in China, with bulk purchase, financing via Supply Chain Finance and full import support.",
      steps: [["box", "Product selection", "Choose from the portfolio of validated products and Chinese suppliers."], ["coins", "Lot structuring", "FOB price per MOQ (minimum order quantity) and operation terms."], ["ship", "Import with terms", "Payment to supplier at origin, with terms of 90 to 180 days in Brazil."], ["trend", "Resale in Brazil", "Sales with margin, based on competitive cost at origin."]] as [string, string, string][],
      catalogEyebrow: "Supplier catalog", cards: "Cards", compare: "Compare", soon: "coming soon",
      emptyTitle: " — coming soon", emptyDesc: "We are registering new Chinese suppliers in this category. Tell the TradeK Agent what you're looking for and we'll let you know when it arrives.", emptyCta: "Request a product",
      product: "Product", quote: "Quote lot",
      tableHeaders: ["Product", "Category", "Motor", "Range", "Battery", "MOQ", "Base FOB"],
      verified: "", verifiedB: "Verified", verifiedRest: " suppliers, with sample and quality inspection before shipment. Assisted import and payment with terms via Supply Chain Finance.",
      homolog: "Homologation, certification (INMETRO/ANATEL) and classification vary by category. Validation before resale.",
    },
    {
      cta: "Iniciar una compra para revender", title: "Productos en el origen, listos para escalar en Brasil.",
      sub: "Un portafolio estructurado de productos en China, con compra por lote, financiamiento vía Supply Chain Finance y soporte completo en la importación.",
      steps: [["box", "Selección del producto", "Elija del portafolio de productos y proveedores chinos validados."], ["coins", "Estructuración del lote", "Precio FOB por MOQ (cantidad mínima por pedido) y condiciones de la operación."], ["ship", "Importación con plazo", "Pago al proveedor en el origen, con plazo de 90 a 180 días en Brasil."], ["trend", "Reventa en Brasil", "Comercialización con margen, basada en costo competitivo en el origen."]] as [string, string, string][],
      catalogEyebrow: "Catálogo de proveedores", cards: "Tarjetas", compare: "Comparar", soon: "próximamente",
      emptyTitle: " — próximamente", emptyDesc: "Estamos registrando nuevos proveedores chinos en esta categoría. Dígale al Agente TradeK qué busca y le avisamos cuando llegue.", emptyCta: "Solicitar un producto",
      product: "Producto", quote: "Cotizar lote",
      tableHeaders: ["Producto", "Categoría", "Motor", "Autonomía", "Batería", "MOQ", "FOB base"],
      verified: "Proveedores ", verifiedB: "verificados", verifiedRest: ", con muestra e inspección de calidad antes del embarque. Importación asistida y pago con plazo vía Supply Chain Finance.",
      homolog: "La homologación, certificación (INMETRO/ANATEL) y clasificación varían según la categoría. Validación antes de la reventa.",
    },
  )
  return (
    <div>
      <UnitHero u="MOTOS" cta={t.cta} title={t.title} sub={t.sub} />

      <section className="sec-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 40px 0" }}>
        <div className="g-2m" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
          {t.steps.map(([ic, tt, d], i) =>
            <div key={tt} style={{ background: "var(--bg-1)", padding: "22px 22px" }}><div className="row center gap10"><span className="mono lime" style={{ fontSize: 12 }}>0{i + 1}</span><Icon name={ic} size={18} style={{ color: "var(--lime)" }} /></div><div className="disp" style={{ fontSize: 17, fontWeight: 600, marginTop: 14 }}>{tt}</div><div className="muted" style={{ fontSize: 13, lineHeight: 1.5, marginTop: 6 }}>{d}</div></div>)}
        </div>
      </section>

      <section className="sec-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 0" }}>
        <div className="row center wrap" style={{ justifyContent: "space-between", gap: 12 }}>
          <div className="eyebrow">{t.catalogEyebrow}</div>
          <div className="row gap8"><button className={"btn btn--sm " + (compare ? "btn--dark" : "btn--lime")} onClick={() => setCompare(false)}>{t.cards}</button><button className={"btn btn--sm " + (compare ? "btn--lime" : "btn--dark")} onClick={() => setCompare(true)}>{t.compare}</button></div>
        </div>
        <div className="row gap8 wrap" style={{ marginTop: 18, marginBottom: 4 }}>
          {PRODUCT_CATS.map((c) => {
            const on = cat === c.key
            const count = c.key === "todos" || c.key === "mob" ? products.length : 0
            return <button key={c.key} onClick={() => setCat(c.key)} className="row gap8 center" style={{ padding: "8px 14px", borderRadius: 99, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", border: "1px solid " + (on ? "var(--lime)" : "var(--line)"), background: on ? "var(--lime-dim)" : "transparent", color: on ? "var(--lime)" : c.ativo ? "var(--tx-dim)" : "var(--tx-faint)" }}>
              <Icon name={c.icon} size={13} />{c.label}{c.ativo ? <span className="mono" style={{ opacity: 0.7 }}>{count}</span> : <span className="tag" style={{ color: "inherit", opacity: 0.7 }}>{t.soon}</span>}
            </button>
          })}
        </div>

        {list.length === 0 ? (
          <div className="panel panel-b" style={{ marginTop: 24, textAlign: "center", padding: "56px 24px" }}>
            <span style={{ width: 56, height: 56, borderRadius: 12, background: "var(--bg-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", margin: "0 auto", color: "var(--tx-mute)" }}><Icon name={catMeta.icon} size={26} /></span>
            <div className="disp" style={{ fontSize: 20, fontWeight: 600, marginTop: 18 }}>{catMeta.label}{t.emptyTitle}</div>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, maxWidth: "48ch", margin: "10px auto 0" }}>{t.emptyDesc}</p>
            <button className="btn btn--lime" style={{ marginTop: 22 }} onClick={openAgent}><Icon name="chat" size={15} /> {t.emptyCta}</button>
          </div>
        ) : !compare ? (
          <div className="g-2m" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginTop: 22 }}>
            {list.map((p) => <div key={p.id} className="panel" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="moto-tile" style={{ height: 172, borderBottom: "1px solid var(--line)" }}>
                {img0(p) && <img className="moto-img" src={img0(p)} alt={p.modelo} style={{ padding: "18px 16px 24px" }} />}
                <span className="pill" style={{ position: "absolute", top: 10, right: 10, zIndex: 2, background: "rgba(10,11,10,.7)", fontSize: 10 }}>{p.categoria || t.product}</span>
              </div>
              <div className="panel-b" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div className="disp" style={{ fontSize: 18, fontWeight: 600 }}>{p.modelo}</div>
                <div className="row gap6 center" style={{ marginTop: 5, fontSize: 11.5, color: "var(--tx-dim)" }}><Icon name="zap" size={12} style={{ color: "var(--tx-mute)" }} /><span>{p.bateria || "—"}</span></div>
                <div className="row gap6 wrap" style={{ marginTop: 12 }}>{[p.motor, p.velocidade, p.autonomia].filter(Boolean).map((s) => <span key={s} className="mono" style={{ fontSize: 10.5, color: "var(--tx-dim)", background: "var(--bg)", border: "1px solid var(--line-soft)", borderRadius: 4, padding: "2px 6px" }}>{s}</span>)}</div>
                {(p.cores_disponiveis ?? []).length > 0 && (
                  <div className="row gap6" style={{ marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "var(--tx-mute)", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>Cores</span>
                    {(p.cores_disponiveis as string[]).map((cor) => {
                      const corHex: Record<string, string> = { Preto: "#1a1a1a", Branco: "#f0f0f0", Vermelho: "#e03535", Verde: "#2d9e4e", Amarelo: "#e8c22a" }
                      return (
                        <span key={cor} title={cor} style={{ width: 16, height: 16, borderRadius: "50%", background: corHex[cor] ?? "#888", border: cor === "Branco" ? "1.5px solid var(--line)" : "1.5px solid transparent", flexShrink: 0 }} />
                      )
                    })}
                  </div>
                )}
                <div className="hr" style={{ margin: "14px 0 12px" }}></div>
                <div className="row center" style={{ justifyContent: "space-between" }}>
                  <div className="col" style={{ lineHeight: 1.2 }}><span className="tag">MOQ - Minimum Order Quantity · {p.moq}</span><span className="mono" style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{p.moeda} {p.preco_base}<span style={{ fontSize: 10, color: "var(--tx-mute)" }}> FOB</span></span></div>
                </div>
                <button className="btn btn--lime btn--block btn--sm" style={{ marginTop: 14 }} onClick={openAgent}><Icon name="coins" size={13} /> {t.quote}</button>
              </div>
            </div>)}
          </div>
        ) : (
          <div className="panel scroll" style={{ marginTop: 22, overflow: "auto" }}>
            <table className="tbl"><thead><tr>{t.tableHeaders.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{list.map((p) => <tr key={p.id}><td><div className="row gap8 center"><span className="moto-thumb" style={{ width: 30, height: 30, borderRadius: 5, flexShrink: 0 }}>{img0(p) && <img src={img0(p)} alt="" />}</span><span className="strong">{p.modelo}</span></div></td><td>{p.categoria}</td><td className="mono" style={{ fontSize: 11.5 }}>{p.motor}</td><td className="mono" style={{ fontSize: 11.5 }}>{p.autonomia}</td><td className="mono" style={{ fontSize: 11.5 }}>{p.bateria}</td><td>{p.moq}</td><td className="mono strong">{p.moeda} {p.preco_base}</td></tr>)}</tbody>
            </table>
          </div>
        )}

        <div className="g-1m" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12, marginTop: 24 }}>
          <div className="panel panel-b row center gap14" style={{ background: "var(--bg-2)" }}>
            <Icon name="shield" size={20} style={{ color: "var(--lime)", flexShrink: 0 }} />
            <span className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>{t.verified}<b style={{ color: "var(--tx)" }}>{t.verifiedB}</b>{t.verifiedRest}</span>
          </div>
          <div className="panel panel-b row center gap14" style={{ background: "var(--bg-2)" }}>
            <Icon name="alert" size={20} style={{ color: "var(--warn)", flexShrink: 0 }} />
            <span className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>{t.homolog}</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export function SiteFAQ() {
  const groups = usePick<[string, [string, string][]][]>(
    [
      ["Supply Chain Finance", [["Preciso ter experiência em importação?", "Não. Você não precisa ter experiência. A Trade-K orienta você em todo o processo, do início à finalização. O único requisito é ter a empresa regularizada para operar."], ["Preciso ter RADAR?", "Sim. O RADAR/Siscomex é obrigatório para importar. Se você ainda não tiver, nós te orientamos em como obter."], ["O prazo é garantido?", "Não totalmente. O prazo médio varia entre 90 e 180 dias, dependendo da análise e aprovação de crédito, além das condições da operação."], ["O financiamento é automático?", "Não. Todas as operações passam por análise cadastral, financeira e documental. Isso garante segurança para todos os envolvidos."], ["Quais documentos são necessários?", "De forma geral:\n• Contrato social\n• Cartão CNPJ\n• Comprovante de endereço\n• Documentos dos sócios (RG/CPF)\n• RADAR ativo\n• Invoice ou Proforma"], ["A TradeK escolhe o fornecedor?", "Depende do modelo:\n• SCF: você pode trazer seu próprio fornecedor\n• Procurement: a Trade-K encontra, valida e negocia para você"], ["Posso importar mesmo sem conhecer fornecedores na China?", "Sim. Com o serviço de Procurement, a Trade-K cuida da busca, validação e negociação com fornecedores confiáveis."]]],
      ["Procurement", [["Vocês encontram fornecedor do zero?", "Sim. Fazemos a busca, pré-seleção e validação de fornecedores."], ["Vocês fazem inspeção?", "Sim, oferecemos amostra e inspeção de qualidade antes do embarque."], ["É possível pedir amostra?", "Sim, a amostragem faz parte do processo de validação."], ["Quanto tempo leva o sourcing?", "Varia conforme a complexidade do produto e das certificações exigidas."], ["Preciso ter especificação técnica?", "Ajuda muito, mas podemos apoiar na definição das especificações."]]],
      ["Produtos da China", [["Que tipos de produto vocês têm?", "Hoje o catálogo é de mobilidade elétrica, mas estamos cadastrando novas categorias. Diga ao agente o que procura."], ["Existe quantidade mínima?", "Sim, a compra é por lote — normalmente 1 contêiner. O MOQ é confirmado na cotação."], ["Posso comprar para revender no Brasil?", "Sim, esse é o objetivo: comprar lote do fornecedor chinês e revender aqui, com importação assistida."], ["Como pago o fornecedor?", "Você pode usar o Supply Chain Finance e pagar em 90–180 dias, sujeito a análise."], ["Precisa de certificação/homologação?", "Pode ser necessária conforme a categoria (INMETRO, ANATEL). Orientamos sobre o enquadramento."], ["A proposta é automática?", "Não. A proposta comercial é validada pela equipe TradeK."]]],
    ],
    [
      ["Supply Chain Finance", [["Do I need import experience?", "No. You don't need any experience. Trade-K guides you through the entire process, from start to finish. The only requirement is having your company properly registered to operate."], ["Do I need RADAR?", "Yes. RADAR/Siscomex registration is mandatory to import. If you don't have it yet, we'll guide you on how to get it."], ["Is the term guaranteed?", "Not entirely. The average term varies between 90 and 180 days, depending on credit review and approval, plus the operation's conditions."], ["Is financing automatic?", "No. All operations go through registration, financial and document review. This ensures security for everyone involved."], ["What documents are required?", "Generally:\n• Articles of incorporation\n• CNPJ card\n• Proof of address\n• Partners' documents (ID/Tax ID)\n• Active RADAR\n• Invoice or Proforma"], ["Does TradeK choose the supplier?", "Depends on the model:\n• SCF: you can bring your own supplier\n• Procurement: Trade-K finds, validates and negotiates for you"], ["Can I import without knowing suppliers in China?", "Yes. With the Procurement service, Trade-K handles the search, validation and negotiation with reliable suppliers."]]],
      ["Procurement", [["Do you find suppliers from scratch?", "Yes. We do the search, pre-selection and validation of suppliers."], ["Do you perform inspections?", "Yes, we offer sampling and quality inspection before shipment."], ["Can I request a sample?", "Yes, sampling is part of the validation process."], ["How long does sourcing take?", "It varies depending on product complexity and required certifications."], ["Do I need a technical specification?", "It helps a lot, but we can support you in defining the specifications."]]],
      ["Products from China", [["What types of products do you have?", "Today the catalog is electric mobility, but we're registering new categories. Tell the agent what you're looking for."], ["Is there a minimum quantity?", "Yes, purchase is by lot — usually 1 container. The MOQ is confirmed at quotation."], ["Can I buy to resell in Brazil?", "Yes, that's the goal: buy a lot from the Chinese supplier and resell here, with assisted import."], ["How do I pay the supplier?", "You can use Supply Chain Finance and pay in 90–180 days, subject to review."], ["Do I need certification/homologation?", "It may be required depending on the category (INMETRO, ANATEL). We guide you on the classification."], ["Is the proposal automatic?", "No. The commercial proposal is validated by the TradeK team."]]],
    ],
    [
      ["Supply Chain Finance", [["¿Necesito tener experiencia en importación?", "No. No necesita tener experiencia. Trade-K lo orienta en todo el proceso, de principio a fin. El único requisito es tener la empresa regularizada para operar."], ["¿Necesito tener RADAR?", "Sí. El RADAR/Siscomex es obligatorio para importar. Si aún no lo tiene, lo orientamos sobre cómo obtenerlo."], ["¿El plazo está garantizado?", "No del todo. El plazo promedio varía entre 90 y 180 días, dependiendo del análisis y aprobación de crédito, además de las condiciones de la operación."], ["¿El financiamiento es automático?", "No. Todas las operaciones pasan por análisis registral, financiero y documental. Esto garantiza seguridad para todos los involucrados."], ["¿Qué documentos son necesarios?", "En general:\n• Estatuto social\n• Tarjeta CNPJ\n• Comprobante de domicilio\n• Documentos de los socios (identificación/Tax ID)\n• RADAR activo\n• Invoice o Proforma"], ["¿TradeK elige el proveedor?", "Depende del modelo:\n• SCF: usted puede traer su propio proveedor\n• Procurement: Trade-K encuentra, valida y negocia por usted"], ["¿Puedo importar sin conocer proveedores en China?", "Sí. Con el servicio de Procurement, Trade-K se encarga de la búsqueda, validación y negociación con proveedores confiables."]]],
      ["Procurement", [["¿Encuentran proveedores desde cero?", "Sí. Realizamos la búsqueda, preselección y validación de proveedores."], ["¿Realizan inspecciones?", "Sí, ofrecemos muestra e inspección de calidad antes del embarque."], ["¿Es posible solicitar una muestra?", "Sí, el muestreo forma parte del proceso de validación."], ["¿Cuánto tiempo lleva el sourcing?", "Varía según la complejidad del producto y las certificaciones exigidas."], ["¿Necesito tener especificación técnica?", "Ayuda mucho, pero podemos apoyar en la definición de las especificaciones."]]],
      ["Productos de China", [["¿Qué tipos de productos tienen?", "Hoy el catálogo es de movilidad eléctrica, pero estamos registrando nuevas categorías. Dígale al agente qué busca."], ["¿Existe una cantidad mínima?", "Sí, la compra es por lote — normalmente 1 contenedor. El MOQ se confirma en la cotización."], ["¿Puedo comprar para revender en Brasil?", "Sí, ese es el objetivo: comprar un lote del proveedor chino y revenderlo aquí, con importación asistida."], ["¿Cómo pago al proveedor?", "Puede usar Supply Chain Finance y pagar en 90–180 días, sujeto a análisis."], ["¿Necesita certificación/homologación?", "Puede ser necesaria según la categoría (INMETRO, ANATEL). Lo orientamos sobre la clasificación."], ["¿La propuesta es automática?", "No. La propuesta comercial es validada por el equipo de TradeK."]]],
    ],
  )
  const t = usePick(
    { eyebrow: "Central de ajuda", title: "Perguntas frequentes" },
    { eyebrow: "Help center", title: "Frequently asked questions" },
    { eyebrow: "Centro de ayuda", title: "Preguntas frecuentes" },
  )
  return (
    <div className="sec-pad" style={{ maxWidth: 880, margin: "0 auto", padding: "64px 40px 0" }}>
      <div className="eyebrow">{t.eyebrow}</div>
      <h1 className="disp fz-xl" style={{ fontSize: 46, fontWeight: 600, letterSpacing: "-.02em", margin: "16px 0 8px" }}>{t.title}</h1>
      {groups.map(([gt, items]) => <div key={gt} style={{ marginTop: 40 }}>
        <div className="row gap8 center" style={{ marginBottom: 8 }}><span className="tag" style={{ color: "var(--lime)" }}>{gt}</span><div className="fill hr" style={{ flex: 1 }}></div></div>
        {items.map(([q, a]) => <FaqRow key={q} q={q} a={a} />)}
      </div>)}
    </div>
  )
}

export function SiteContato() {
  const navigate = useNavigate()
  const [f, setF] = useState({ nome: "", empresa: "", cnpj: "", email: "", whatsapp: "", unidade: "supply_chain_finance", mensagem: "", consent: false })
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: string | boolean) => setF((s) => ({ ...s, [k]: v }))
  const t = usePick(
    {
      eyebrow: "Fale conosco", title: "Solicite uma análise", sub: "Conte sobre sua demanda. Nossa equipe retorna no mesmo dia com o próximo passo.",
      contacts: [["mail", "E-mail", "comercial@tradek.com.br"], ["phone", "WhatsApp", "+55 11 4000-0000"], ["globe", "Operação", "China → Brasil"]] as [string, string, string][],
      nome: "Nome", nomePh: "Seu nome", empresa: "Empresa", cnpj: "CNPJ", email: "E-mail", emailPh: "email@empresa.com", whatsapp: "WhatsApp",
      unidade: "Unidade de interesse", scf: "Supply Chain Finance", proc: "Procurement Internacional", motos: "Produtos da China",
      mensagem: "Mensagem", mensagemPh: "Descreva sua demanda...", consent: "Autorizo o contato e o tratamento de dados conforme a LGPD.",
      sending: "Enviando…", send: "Enviar solicitação",
      errName: "Informe ao menos nome e e-mail.", errConsent: "Autorize o contato conforme a LGPD.", errSend: "Não foi possível enviar agora. Tente novamente em instantes.",
    },
    {
      eyebrow: "Contact us", title: "Request a review", sub: "Tell us about your request. Our team will respond the same day with the next step.",
      contacts: [["mail", "Email", "comercial@tradek.com.br"], ["phone", "WhatsApp", "+55 11 4000-0000"], ["globe", "Operation", "China → Brazil"]] as [string, string, string][],
      nome: "Name", nomePh: "Your name", empresa: "Company", cnpj: "Tax ID (CNPJ)", email: "Email", emailPh: "email@company.com", whatsapp: "WhatsApp",
      unidade: "Unit of interest", scf: "Supply Chain Finance", proc: "International Procurement", motos: "Products from China",
      mensagem: "Message", mensagemPh: "Describe your request...", consent: "I authorize contact and data processing under LGPD.",
      sending: "Sending…", send: "Send request",
      errName: "Please provide at least your name and email.", errConsent: "Authorize contact under LGPD.", errSend: "Could not send right now. Please try again shortly.",
    },
    {
      eyebrow: "Contáctenos", title: "Solicite un análisis", sub: "Cuéntenos sobre su demanda. Nuestro equipo responde el mismo día con el próximo paso.",
      contacts: [["mail", "Correo", "comercial@tradek.com.br"], ["phone", "WhatsApp", "+55 11 4000-0000"], ["globe", "Operación", "China → Brasil"]] as [string, string, string][],
      nome: "Nombre", nomePh: "Su nombre", empresa: "Empresa", cnpj: "CNPJ", email: "Correo", emailPh: "correo@empresa.com", whatsapp: "WhatsApp",
      unidade: "Unidad de interés", scf: "Supply Chain Finance", proc: "Procurement Internacional", motos: "Productos de China",
      mensagem: "Mensaje", mensagemPh: "Describa su demanda...", consent: "Autorizo el contacto y el tratamiento de datos conforme a la LGPD.",
      sending: "Enviando…", send: "Enviar solicitud",
      errName: "Indique al menos nombre y correo.", errConsent: "Autorice el contacto conforme a la LGPD.", errSend: "No fue posible enviar ahora. Intente de nuevo en un momento.",
    },
  )

  async function submit() {
    if (!f.nome || !f.email) return toast.error(t.errName)
    if (!f.consent) return toast.error(t.errConsent)
    setBusy(true)
    const res = await createPublicLead({ origem: "formulario_site", nome: f.nome, empresa: f.empresa, cnpj: f.cnpj, email: f.email, whatsapp: f.whatsapp, unidade: f.unidade, demanda: f.mensagem, consentimento_lgpd: true })
    setBusy(false)
    if (res) navigate("/obrigado")
    else toast.error(t.errSend)
  }

  return (
    <div className="g-1m sec-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
      <div>
        <div className="eyebrow">{t.eyebrow}</div>
        <h1 className="disp fz-xl" style={{ fontSize: 44, fontWeight: 600, letterSpacing: "-.02em", margin: "16px 0 0" }}>{t.title}</h1>
        <p className="muted" style={{ fontSize: 15.5, lineHeight: 1.6, marginTop: 16, maxWidth: "42ch" }}>{t.sub}</p>
        <div className="col gap16" style={{ marginTop: 32 }}>
          {t.contacts.map(([ic, k, v]) =>
            <div key={k} className="row gap12 center"><span style={{ width: 38, height: 38, borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--lime)" }}><Icon name={ic} size={17} /></span><div><div className="tag">{k}</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 1 }}>{v}</div></div></div>)}
        </div>
      </div>
      <div className="panel panel-b">
        <div className="g-1m" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="field" style={{ gridColumn: "span 2" }}><label>{t.nome}</label><input className="input" placeholder={t.nomePh} value={f.nome} onChange={(e) => set("nome", e.target.value)} /></div>
          <div className="field"><label>{t.empresa}</label><input className="input" placeholder={t.empresa} value={f.empresa} onChange={(e) => set("empresa", e.target.value)} /></div>
          <div className="field"><label>{t.cnpj}</label><input className="input" placeholder="00.000.000/0000-00" value={f.cnpj} onChange={(e) => set("cnpj", e.target.value)} /></div>
          <div className="field"><label>{t.email}</label><input className="input" placeholder={t.emailPh} value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="field"><label>{t.whatsapp}</label><input className="input" placeholder="+55 ..." value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
          <div className="field" style={{ gridColumn: "span 2" }}><label>{t.unidade}</label>
            <select className="select" value={f.unidade} onChange={(e) => set("unidade", e.target.value)}>
              <option value="supply_chain_finance">{t.scf}</option>
              <option value="procurement">{t.proc}</option>
              <option value="produtos_motos">{t.motos}</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn: "span 2" }}><label>{t.mensagem}</label><textarea className="textarea" placeholder={t.mensagemPh} value={f.mensagem} onChange={(e) => set("mensagem", e.target.value)}></textarea></div>
        </div>
        <label className="row gap8 center" style={{ marginTop: 14, fontSize: 12.5, color: "var(--tx-dim)", cursor: "pointer" }}><input type="checkbox" style={{ accentColor: "var(--lime)" }} checked={f.consent} onChange={(e) => set("consent", e.target.checked)} /> {t.consent}</label>
        <Btn variant="lime" className="btn--block" style={{ marginTop: 16 }} disabled={busy} onClick={submit}>{busy ? t.sending : t.send}</Btn>
      </div>
    </div>
  )
}

export function SiteObrigado() {
  const t = usePick(
    { title: "Recebemos sua solicitação.", desc: "A equipe TradeK irá analisar os dados enviados e retornar com o próximo passo. Em breve nossa equipe entrará em contato.", back: "Voltar ao início" },
    { title: "We received your request.", desc: "The TradeK team will review the submitted data and get back to you with the next step. Our team will contact you soon.", back: "Back to home" },
    { title: "Recibimos su solicitud.", desc: "El equipo de TradeK analizará los datos enviados y le responderá con el próximo paso. Nuestro equipo se pondrá en contacto pronto.", back: "Volver al inicio" },
  )
  return (
    <div className="sec-pad" style={{ maxWidth: 680, margin: "0 auto", padding: "90px 40px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--lime-dim)", border: "1px solid var(--lime-dim2)", display: "grid", placeItems: "center", margin: "0 auto" }}><Icon name="check" size={34} style={{ color: "var(--lime)" }} /></div>
      <h1 className="disp fz-lg" style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-.02em", margin: "28px 0 0" }}>{t.title}</h1>
      <p className="muted" style={{ fontSize: 16, lineHeight: 1.6, marginTop: 16 }}>{t.desc}</p>
      <div className="row gap12 cta-stack" style={{ justifyContent: "center", marginTop: 32 }}>
        <Link className="btn btn--lime" to="/">{t.back}</Link>
      </div>
    </div>
  )
}

export function SiteSobre() {
  const t = usePick(
    {
      eyebrow: "Quem Somos", title: "A ponte entre crédito, Produto e operação na China.",
      lead: "A TradeK atua na ponte comercial entre China e Brasil, com frentes em Supply Chain Finance, Procurement Internacional e mobilidade elétrica. Transformamos a captação em uma operação organizada — do primeiro contato à entrega.",
      moveEyebrow: "O que nos move",
      moveLead: <>Acreditamos que importar melhor muda o jogo de uma empresa.<br />Nosso propósito é abrir acesso, a fornecedores, a crédito na origem e a operações mais eficientes, para que negócios brasileiros possam crescer e prosperar.</>,
      moveItems: ["Para que importar deixe de ser limitado por caixa.", "Para que empresas comprem melhor, direto na origem.", "Para que o crescimento venha com estrutura, e não com risco."],
      valuesEyebrow: "Nossos valores", valuesLead: "O que sustenta a Trade-K",
      values: [
        ["Acesso com responsabilidade", "Abrimos portas na China com seriedade, transparência e compromisso com o resultado de quem confia na nossa operação."],
        ["Origem como vantagem", "É na origem que se constrói margem. Por isso, atuamos direto na China, onde as melhores decisões são tomadas."],
        ["Operação como prioridade", "Não vendemos promessa — estruturamos execução. Cada detalhe importa para garantir eficiência e segurança."],
        ["Crescimento compartilhado", "O sucesso é construído junto. Atuamos como parceiros, não como intermediários."],
        ["Adaptabilidade estratégica", "O mercado muda rápido — e nós também. Evoluímos constantemente para manter nossos clientes sempre um passo à frente."],
      ] as [string, string][],
      units: [["coins", "Supply Chain Finance", "Importação financiada com prazo estendido."], ["globe", "Procurement", "Sourcing e validação de fornecedores."], ["box", "Produtos da China", "Catálogo de fornecedores para comprar em lote e revender."]] as [string, string, string][],
    },
    {
      eyebrow: "About Us", title: "The bridge between credit, product and operations in China.",
      lead: "TradeK operates as the commercial bridge between China and Brazil, with Supply Chain Finance, International Procurement and electric mobility fronts. We turn demand into an organized operation — from first contact to delivery.",
      moveEyebrow: "What drives us",
      moveLead: <>We believe importing better is a game changer for a company.<br />Our purpose is to open access — to suppliers, credit at origin and more efficient operations — so Brazilian businesses can grow and thrive.</>,
      moveItems: ["So that importing is no longer limited by cash flow.", "So that companies buy better, direct at the source.", "So that growth comes with structure, not risk."],
      valuesEyebrow: "Our values", valuesLead: "What sustains Trade-K",
      values: [
        ["Access with responsibility", "We open doors in China with seriousness, transparency and commitment to the results of those who trust our operation."],
        ["Origin as an advantage", "Margin is built at the origin. That's why we operate directly in China, where the best decisions are made."],
        ["Operation as a priority", "We don't sell promises — we structure execution. Every detail matters to ensure efficiency and security."],
        ["Shared growth", "Success is built together. We act as partners, not intermediaries."],
        ["Strategic adaptability", "The market changes fast — and so do we. We constantly evolve to keep our clients always one step ahead."],
      ] as [string, string][],
      units: [["coins", "Supply Chain Finance", "Financed imports with extended terms."], ["globe", "Procurement", "Sourcing and supplier validation."], ["box", "Products from China", "Supplier catalog to buy in bulk and resell."]] as [string, string, string][],
    },
    {
      eyebrow: "Quiénes Somos", title: "El puente entre crédito, producto y operación en China.",
      lead: "TradeK actúa como puente comercial entre China y Brasil, con frentes en Supply Chain Finance, Procurement Internacional y movilidad eléctrica. Transformamos la captación en una operación organizada — desde el primer contacto hasta la entrega.",
      moveEyebrow: "Qué nos mueve",
      moveLead: <>Creemos que importar mejor cambia el juego de una empresa.<br />Nuestro propósito es abrir acceso a proveedores, a crédito en el origen y a operaciones más eficientes, para que los negocios brasileños puedan crecer y prosperar.</>,
      moveItems: ["Para que importar deje de estar limitado por la caja.", "Para que las empresas compren mejor, directo en el origen.", "Para que el crecimiento venga con estructura, y no con riesgo."],
      valuesEyebrow: "Nuestros valores", valuesLead: "Lo que sostiene a Trade-K",
      values: [
        ["Acceso con responsabilidad", "Abrimos puertas en China con seriedad, transparencia y compromiso con el resultado de quienes confían en nuestra operación."],
        ["Origen como ventaja", "Es en el origen donde se construye el margen. Por eso, actuamos directo en China, donde se toman las mejores decisiones."],
        ["Operación como prioridad", "No vendemos promesas — estructuramos ejecución. Cada detalle importa para garantizar eficiencia y seguridad."],
        ["Crecimiento compartido", "El éxito se construye juntos. Actuamos como socios, no como intermediarios."],
        ["Adaptabilidad estratégica", "El mercado cambia rápido — y nosotros también. Evolucionamos constantemente para mantener a nuestros clientes siempre un paso adelante."],
      ] as [string, string][],
      units: [["coins", "Supply Chain Finance", "Importación financiada con plazo extendido."], ["globe", "Procurement", "Sourcing y validación de proveedores."], ["box", "Productos de China", "Catálogo de proveedores para comprar por lote y revender."]] as [string, string, string][],
    },
  )
  return (
    <div className="sec-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px 0" }}>
      <div className="eyebrow">{t.eyebrow}</div>
      <h1 className="disp fz-xl" style={{ fontSize: 48, fontWeight: 600, letterSpacing: "-.025em", margin: "18px 0 0", maxWidth: "20ch" }}>{t.title}</h1>
      <p className="muted" style={{ fontSize: 17, lineHeight: 1.6, marginTop: 20, maxWidth: "62ch" }}>{t.lead}</p>
      <div style={{ marginTop: 48, paddingTop: 40, borderTop: "1px solid var(--line)" }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>{t.moveEyebrow}</div>
        <p style={{ fontSize: 16.5, lineHeight: 1.65, maxWidth: "66ch", color: "var(--tx)" }}>{t.moveLead}</p>
        <div className="col gap12" style={{ marginTop: 20 }}>
          {t.moveItems.map((b) =>
            <div key={b} className="row gap10" style={{ fontSize: 15, color: "var(--tx-dim)" }}><span style={{ color: "var(--lime)", fontWeight: 700 }}>•</span>{b}</div>)}
        </div>
      </div>

      <div style={{ marginTop: 48, paddingTop: 40, borderTop: "1px solid var(--line)" }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>{t.valuesEyebrow}</div>
        <p style={{ fontSize: 22, fontWeight: 600, color: "var(--tx)", marginBottom: 32 }}>{t.valuesLead}</p>
        <div className="col gap24">
          {t.values.map(([vt, d]) => (
            <div key={vt} style={{ borderLeft: "2px solid var(--lime)", paddingLeft: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--tx)", marginBottom: 4 }}>{vt}</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--tx-dim)" }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="g-1m" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 40 }}>
        {t.units.map(([ic, ut, d]) =>
          <div key={ut} className="panel panel-b"><Icon name={ic} size={24} style={{ color: "var(--lime)" }} /><div className="disp" style={{ fontSize: 19, fontWeight: 600, marginTop: 16 }}>{ut}</div><div className="muted" style={{ fontSize: 13.5, marginTop: 6, lineHeight: 1.5 }}>{d}</div></div>)}
      </div>
    </div>
  )
}
