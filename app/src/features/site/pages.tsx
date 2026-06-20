import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Icon, Btn, UNITS } from "@/components/tradek/ui"
import { useAgent, useProducts, PRODUCT_CATS, createPublicLead, type Product } from "./site-context"

function img0(p: Product): string | undefined {
  const a = p.imagens as unknown
  return Array.isArray(a) && typeof a[0] === "string" ? (a[0] as string) : undefined
}

export function Compliance({ children }: { children?: React.ReactNode }) {
  return (
    <div className="row gap8" style={{ fontSize: 11.5, color: "var(--tx-mute)", marginTop: 14, maxWidth: "52ch", lineHeight: 1.5 }}>
      <Icon name="shield" size={13} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{children || "Sujeito à análise cadastral, documental, financeira e aprovação da linha de crédito."}</span>
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
      {o && <p className="muted fade" style={{ fontSize: 14.5, lineHeight: 1.6, paddingBottom: 20, maxWidth: "72ch", margin: 0 }}>{a}</p>}
    </div>
  )
}

function UnitHero({ u, title, sub, cta }: { u: string; title: string; sub: string; cta: string }) {
  const { openAgent } = useAgent()
  const m = UNITS[u]
  return (
    <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
      <div className="tk-grid" style={{ position: "absolute", inset: 0, opacity: 0.5 }}></div>
      <div style={{ position: "absolute", top: -140, left: "40%", width: 480, height: 480, background: `radial-gradient(circle,${m.color === "var(--lime)" ? "rgba(195,249,41,.1)" : "rgba(91,200,255,.08)"},transparent 65%)` }}></div>
      <div className="sec-pad" style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "64px 40px 56px" }}>
        <Link to="/" className="row gap6 faint" style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 22 }}><Icon name="chevL" size={14} /> Início</Link>
        <div className="row gap8 center"><span className="pill pill--lime"><Icon name={m.icon} size={13} /> {m.short}</span></div>
        <h1 className="disp fz-hero" style={{ fontSize: 52, lineHeight: 1.02, letterSpacing: "-.025em", fontWeight: 600, margin: "18px 0 0", maxWidth: "18ch" }}>{title}</h1>
        <p className="muted" style={{ fontSize: 16.5, lineHeight: 1.55, maxWidth: "56ch", marginTop: 20 }}>{sub}</p>
        <div className="row gap12 cta-stack" style={{ marginTop: 28 }}>
          <button className="btn btn--lime" onClick={openAgent}><Icon name="zap" size={15} /> {cta}</button>
          <Link className="btn btn--ghost" to="/contato">Falar com especialista</Link>
        </div>
      </div>
    </section>
  )
}

export function SiteHome() {
  const units = [
    { u: "SCF", n: "01", t: "Supply Chain Finance", d: "Importe da Ásia com 90–180 dias de prazo. Financiamento de até 100% do FOB, sujeito a análise.", h: "/scf" },
    { u: "PROC", n: "02", t: "Procurement Internacional", d: "Encontramos, validamos e negociamos fornecedores chineses sob medida.", h: "/proc" },
    { u: "MOTOS", n: "03", t: "Produtos da China", d: "Catálogo de fornecedores chineses. Compre em lote e revenda no Brasil.", h: "/motos" },
  ]
  return (
    <div>
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
        <div className="tk-grid" style={{ position: "absolute", inset: 0, opacity: 0.6 }}></div>
        <div style={{ position: "absolute", top: -160, right: -120, width: 520, height: 520, background: "radial-gradient(circle,rgba(195,249,41,.12),transparent 65%)" }}></div>
        <div className="g-1m sec-pad" style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "28px 40px 21px", display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 48, alignItems: "center" }}>
          <div className="fade">
            <div className="eyebrow">China · Brasil · Trade Operations</div>
            <h1 className="disp fz-hero" style={{ fontSize: 60, lineHeight: 1.0, letterSpacing: "-.025em", fontWeight: 600, margin: "22px 0 0" }}>Importação direta com <span style={{ color: "var(--lime)" }}>financiamento</span> na Ásia.</h1>
            <p className="muted" style={{ fontSize: 16.5, lineHeight: 1.55, maxWidth: "48ch", marginTop: 22 }}>A Trade-K conecta sua empresa aos melhores fornecedores na China e viabiliza suas compras com crédito, negociação estratégica e gestão completa da operação financeira.<br /><br />Sem complicação, com mais margem e total controle.</p>
            <div className="row gap12 cta-stack" style={{ marginTop: 30 }}>
              <Link className="btn btn--lime" to="/scf?agent=1"><Icon name="zap" size={15} /> Falar com um especialista</Link>
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
              <div className="row gap6" style={{ marginTop: 14, fontSize: 12.5, fontWeight: 700 }}>Explorar <Icon name="arrowR" size={13} /></div>
            </Link>)}
          </div>
        </div>
        <div className="g-metrics g-2m" style={{ position: "relative", borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "repeat(4,1fr)", maxWidth: 1280, margin: "0 auto" }}>
          {([["FOB financiável", "100%", "sujeito a análise"], ["Prazo de pagamento", "90–180", "dias"], ["Pagamento ao fornecedor", "Ásia", "direto"], ["Unidades de negócio", "3", "SCF · Proc · Produtos"]] as [string, string, string][]).map(([l, v, s], i) =>
            <div key={l} style={{ padding: "20px 24px", borderRight: i < 3 ? "1px solid var(--line)" : "none" }}>
              <div className="tag">{l}</div>
              <div className="disp" style={{ fontSize: 28, fontWeight: 600, marginTop: 6, letterSpacing: "-.01em" }}><span style={{ color: "var(--lime)" }}>{v}</span> <span style={{ fontSize: 13, color: "var(--tx-mute)", fontWeight: 400 }}>{s}</span></div>
            </div>)}
        </div>
      </section>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 40px", borderBottom: "1px solid var(--line)" }}>
        <p style={{ fontSize: 10.5, color: "var(--tx-mute)", lineHeight: 1.6, margin: 0 }}>
          A TradeK não é um banco ou uma instituição financeira, portanto, não concede empréstimos diretos. Não operamos como agente originador e de cobrança na gestão de garantias – Responsabilidade Limitada (CNPJ: 18.228.061/0001-76).<br />
          As informações contidas neste site têm caráter meramente informativo, e seu uso deve estar de acordo com a legislação vigente. Consulte um de nossos especialistas para mais informações.
        </p>
      </div>

      <section className="sec-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 40px 0" }}>
        <div className="eyebrow">Como a TradeK ajuda</div>
        <h2 className="disp fz-lg" style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-.02em", margin: "16px 0 0", maxWidth: "18ch" }}>Da primeira conversa ao contêiner no porto.</h2>
        <div className="g-2m" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden", marginTop: 36 }}>
          {([["chat", "Capte", "Agente IA qualifica seu pedido e organiza os dados."], ["shield", "Analise", "Avaliação cadastral, documental e financeira."], ["ship", "Importe", "Pagamento direto ao fornecedor na Ásia, com prazo."], ["trend", "Escale", "Operação recorrente com previsibilidade e suporte."]] as [string, string, string][]).map(([ic, t, d], i) =>
            <div key={t} style={{ background: "var(--bg-1)", padding: "28px 24px" }}>
              <div className="row center gap10"><span className="mono lime" style={{ fontSize: 12 }}>0{i + 1}</span><Icon name={ic} size={20} style={{ color: "var(--lime)" }} /></div>
              <div className="disp" style={{ fontSize: 19, fontWeight: 600, marginTop: 18 }}>{t}</div>
              <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 8 }}>{d}</div>
            </div>)}
        </div>
      </section>

      <section className="sec-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 40px 0" }}>
        <div className="row center" style={{ justifyContent: "space-between", gap: 12 }}><div><div className="eyebrow">Dúvidas frequentes</div><h2 className="disp fz-md" style={{ fontSize: 32, fontWeight: 600, margin: "14px 0 0" }}>Perguntas comuns</h2></div><Link className="btn btn--ghost btn--sm" to="/faq" style={{ flexShrink: 0 }}>Ver todas <Icon name="arrowR" size={13} /></Link></div>
        <div style={{ marginTop: 28 }}>
          {([["Preciso ter RADAR para importar?", "Sim, a habilitação no RADAR/Siscomex é necessária. Orientamos você em todo o processo de cadastro."], ["O prazo de 90–180 dias é garantido?", "Não. O prazo é sujeito à análise cadastral, documental e à aprovação da linha de crédito."], ["Vocês escolhem o fornecedor por mim?", "No Procurement, sim — encontramos, validamos e negociamos. No SCF, você pode trazer seu fornecedor."]] as [string, string][]).map(([q, a]) => <FaqRow key={q} q={q} a={a} />)}
        </div>
      </section>

      <section className="sec-pad" style={{ maxWidth: 1280, margin: "72px auto 0", padding: "0 40px" }}>
        <div className="sec-pad" style={{ position: "relative", overflow: "hidden", background: "var(--lime)", borderRadius: 10, padding: "52px 48px", color: "#0A0B0A" }}>
          <div className="disp fz-lg" style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-.02em", maxWidth: "20ch" }}>Pronto para avaliar sua próxima importação?</div>
          <p style={{ fontSize: 15.5, marginTop: 12, maxWidth: "48ch", opacity: 0.72, fontWeight: 500 }}>Converse com o Agente TradeK ou solicite uma análise. Resposta no mesmo dia.</p>
          <div className="row gap12 cta-stack" style={{ marginTop: 26 }}>
            <a className="btn" style={{ background: "#0A0B0A", color: "var(--lime)" }} href="https://wa.me/5515997673340" target="_blank" rel="noopener noreferrer"><Icon name="chat" size={15} /> Whatsapp TradeK</a>
            <Link className="btn" style={{ border: "1px solid rgba(10,11,10,.3)", color: "#0A0B0A" }} to="/contato">Solicitar análise</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export function SiteSCF() {
  const { openAgent } = useAgent()
  return (
    <div>
      <UnitHero u="SCF" cta="Avaliar minha importação" title="Seu fornecedor recebe à vista, sem afetar seu fluxo de caixa." sub="Pague seu fornecedor na Ásia à vista e acesse prazos de até 180 dias para liquidação. A Trade-K estrutura sua operação com crédito, negociação e gestão integrada." />
      <section className="sec-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 40px 0" }}>
        <div className="eyebrow">Como funciona</div>
        <div className="g-2m" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden", marginTop: 28 }}>
          {([["Análise", "Solicite a análise do crédito por um de nossos canais"], ["Crédito na origem", "Viabilizamos a linha diretamente na Ásia, junto aos parceiros."], ["Pagamento ao fornecedor", "Liquidação à vista na Ásia."], ["Prazo no Brasil", "Pagamento em até 180 dias, conforme estrutura."]] as [string, string][]).map(([t, d], i) =>
            <div key={t} style={{ background: "var(--bg-1)", padding: "24px 22px" }}><div className="mono lime" style={{ fontSize: 13 }}>0{i + 1}</div><div className="disp" style={{ fontSize: 18, fontWeight: 600, marginTop: 14 }}>{t}</div><div className="muted" style={{ fontSize: 13, lineHeight: 1.5, marginTop: 7 }}>{d}</div></div>)}
        </div>
      </section>
      <section className="g-1m sec-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 40px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div className="panel panel-b">
          <div className="eyebrow">(Trade-K) Crédito estruturado na Ásia</div>
          <div className="col gap12" style={{ marginTop: 18 }}>{["Origem do crédito: Internacional, direto na Ásia", "Garantia: Sem exigência de garantias locais", "Pagamento ao fornecedor: À vista, direto na China", "Moeda: Estruturada na origem da operação", "Prazo: Até 180 dias para pagamento no Brasil", "Impacto no caixa: Preserva capital de giro", "Estrutura: Operação integrada (crédito + pagamento)", "Acesso: Conexão com parceiros internacionais", "Aplicação: Ideal para importação e ganho de margem"].map((b) => <div key={b} className="row gap10" style={{ fontSize: 14.5 }}><Icon name="check" size={16} style={{ color: "var(--lime)", flexShrink: 0 }} />{b}</div>)}</div>
          <Compliance />
        </div>
        <div className="panel panel-b">
          <div className="eyebrow">Financiamento tradicional (Brasil)</div>
          <div className="col gap10" style={{ marginTop: 18 }}>{["Origem do crédito: Bancos locais", "Garantia: Exigência de garantias reais ou recebíveis", "Pagamento ao fornecedor: Nem sempre à vista", "Moeda: Exposição cambial + necessidade de hedge", "Prazo: Mais restrito e menos flexível", "Impacto no caixa: Compromete limite de crédito", "Estrutura: Processo fragmentado (crédito + câmbio + pagamento)", "Acesso: Burocrático e limitado", "Aplicação: Menor eficiência para importação"].map((b) => <div key={b} className="row gap10" style={{ fontSize: 14, color: "var(--tx-dim)" }}><span style={{ color: "#e53e3e", fontWeight: 700 }}>✖</span>{b}</div>)}</div>
        </div>
      </section>
      <section className="sec-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 40px 0" }}>
        <div className="panel stack-m" style={{ padding: "28px 32px", display: "flex", alignItems: "center", gap: 24, background: "var(--bg-2)" }}>
          <Icon name="globe" size={36} style={{ color: "var(--info)", flexShrink: 0 }} />
          <div><div className="disp" style={{ fontSize: 20, fontWeight: 600 }}>Precisa de RADAR/Siscomex?</div><div className="muted" style={{ fontSize: 14, marginTop: 4, maxWidth: "62ch", lineHeight: 1.5 }}>A habilitação é necessária para importar. Orientamos você em todo o processo — do enquadramento ao registro.</div></div>
          <button className="btn btn--lime mla" style={{ flexShrink: 0 }} onClick={openAgent}>Entender documentos</button>
        </div>
      </section>
    </div>
  )
}

export function SiteProc() {
  return (
    <div>
      <UnitHero u="PROC" cta="Iniciar um briefing" title="Fornecedores certos, negociados na origem." sub="Da busca à inspeção, estruturamos sua operação com fornecedores chineses validados. Você define o produto e o target. Nós garantimos execução, negociação e controle na origem." />
      <section className="sec-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 40px 0" }}>
        <div className="eyebrow">Etapas do processo</div>
        <div className="col gap10" style={{ marginTop: 24 }}>
          {([["Briefing da operação", "Definição de produto, especificações, volume e orçamento-alvo."], ["Sourcing estratégico", "Identificação e pré-seleção de fornecedores qualificados na China."], ["Validação de fornecedores", "Análise de reputação, capacidade produtiva e certificações."], ["Negociação na origem", "Ajuste de preço, MOQ e condições comerciais diretamente com o fornecedor."], ["Inspeção e controle de qualidade", "Amostra e inspeção de qualidade antes do embarque."]] as [string, string][]).map(([t, d], i) =>
            <div key={t} className="panel row center gap16" style={{ padding: "18px 22px" }}><span className="disp lime" style={{ fontSize: 24, fontWeight: 600, width: 40 }}>0{i + 1}</span><div><div className="disp" style={{ fontSize: 17, fontWeight: 600 }}>{t}</div><div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>{d}</div></div></div>)}
        </div>
      </section>
      <section className="sec-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 40px 0" }}>
        <div className="panel panel-b">
          <div className="eyebrow">Dados para o briefing</div>
          <div className="g-2m" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 18 }}>
            {["Produto", "Especificações", "Volume", "Orçamento-alvo", "Prazo", "Certificações", "Mercado de destino", "Amostra", "Inspeção"].map((d) => <div key={d} className="row gap8" style={{ fontSize: 13.5, color: "var(--tx-dim)", padding: "8px 0" }}><span className="sdot" style={{ background: "var(--info)" }}></span>{d}</div>)}
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
  return (
    <div>
      <UnitHero u="MOTOS" cta="Quero comprar para revender" title="Produtos direto da China, prontos para revender." sub="Um catálogo de produtos de fornecedores chineses verificados. Compre em lote, importe com prazo via Supply Chain Finance e revenda no Brasil — com suporte da TradeK do pedido à alfândega." />

      <section className="sec-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 40px 0" }}>
        <div className="g-2m" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
          {([["box", "Escolha o produto", "Do catálogo de fornecedores verificados."], ["coins", "Cote o lote", "Preço FOB por MOQ (normalmente 1 contêiner)."], ["ship", "Importe com prazo", "Pague em 90–180 dias via Supply Chain Finance."], ["trend", "Revenda no Brasil", "Margem de revenda com produto importado."]] as [string, string, string][]).map(([ic, t, d], i) =>
            <div key={t} style={{ background: "var(--bg-1)", padding: "22px 22px" }}><div className="row center gap10"><span className="mono lime" style={{ fontSize: 12 }}>0{i + 1}</span><Icon name={ic} size={18} style={{ color: "var(--lime)" }} /></div><div className="disp" style={{ fontSize: 17, fontWeight: 600, marginTop: 14 }}>{t}</div><div className="muted" style={{ fontSize: 13, lineHeight: 1.5, marginTop: 6 }}>{d}</div></div>)}
        </div>
      </section>

      <section className="sec-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 0" }}>
        <div className="row center wrap" style={{ justifyContent: "space-between", gap: 12 }}>
          <div className="eyebrow">Catálogo de fornecedores</div>
          <div className="row gap8"><button className={"btn btn--sm " + (compare ? "btn--dark" : "btn--lime")} onClick={() => setCompare(false)}>Cards</button><button className={"btn btn--sm " + (compare ? "btn--lime" : "btn--dark")} onClick={() => setCompare(true)}>Comparar</button></div>
        </div>
        <div className="row gap8 wrap" style={{ marginTop: 18, marginBottom: 4 }}>
          {PRODUCT_CATS.map((c) => {
            const on = cat === c.key
            const count = c.key === "todos" || c.key === "mob" ? products.length : 0
            return <button key={c.key} onClick={() => setCat(c.key)} className="row gap8 center" style={{ padding: "8px 14px", borderRadius: 99, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", border: "1px solid " + (on ? "var(--lime)" : "var(--line)"), background: on ? "var(--lime-dim)" : "transparent", color: on ? "var(--lime)" : c.ativo ? "var(--tx-dim)" : "var(--tx-faint)" }}>
              <Icon name={c.icon} size={13} />{c.label}{c.ativo ? <span className="mono" style={{ opacity: 0.7 }}>{count}</span> : <span className="tag" style={{ color: "inherit", opacity: 0.7 }}>em breve</span>}
            </button>
          })}
        </div>

        {list.length === 0 ? (
          <div className="panel panel-b" style={{ marginTop: 24, textAlign: "center", padding: "56px 24px" }}>
            <span style={{ width: 56, height: 56, borderRadius: 12, background: "var(--bg-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", margin: "0 auto", color: "var(--tx-mute)" }}><Icon name={catMeta.icon} size={26} /></span>
            <div className="disp" style={{ fontSize: 20, fontWeight: 600, marginTop: 18 }}>{catMeta.label} — em breve</div>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, maxWidth: "48ch", margin: "10px auto 0" }}>Estamos cadastrando novos fornecedores chineses nesta categoria. Diga ao Agente TradeK o que você procura e avisamos quando chegar.</p>
            <button className="btn btn--lime" style={{ marginTop: 22 }} onClick={openAgent}><Icon name="chat" size={15} /> Pedir um produto</button>
          </div>
        ) : !compare ? (
          <div className="g-2m" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginTop: 22 }}>
            {list.map((p) => <div key={p.id} className="panel" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="moto-tile" style={{ height: 172, borderBottom: "1px solid var(--line)" }}>
                {img0(p) && <img className="moto-img" src={img0(p)} alt={p.modelo} style={{ padding: "18px 16px 24px" }} />}
                <span className="pill" style={{ position: "absolute", top: 10, right: 10, zIndex: 2, background: "rgba(10,11,10,.7)", fontSize: 10 }}>{p.categoria || "Produto"}</span>
              </div>
              <div className="panel-b" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div className="disp" style={{ fontSize: 18, fontWeight: 600 }}>{p.modelo}</div>
                <div className="row gap6 center" style={{ marginTop: 5, fontSize: 11.5, color: "var(--tx-dim)" }}><Icon name="zap" size={12} style={{ color: "var(--tx-mute)" }} /><span>{p.bateria || "—"}</span></div>
                <div className="row gap6 wrap" style={{ marginTop: 12 }}>{[p.motor, p.velocidade, p.autonomia].filter(Boolean).map((s) => <span key={s} className="mono" style={{ fontSize: 10.5, color: "var(--tx-dim)", background: "var(--bg)", border: "1px solid var(--line-soft)", borderRadius: 4, padding: "2px 6px" }}>{s}</span>)}</div>
                <div className="hr" style={{ margin: "14px 0 12px" }}></div>
                <div className="row center" style={{ justifyContent: "space-between" }}>
                  <div className="col" style={{ lineHeight: 1.2 }}><span className="tag">MOQ - Minimum Order Quantity · {p.moq}</span><span className="mono" style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{p.moeda} {p.preco_base}<span style={{ fontSize: 10, color: "var(--tx-mute)" }}> FOB</span></span></div>
                </div>
                <button className="btn btn--lime btn--block btn--sm" style={{ marginTop: 14 }} onClick={openAgent}><Icon name="coins" size={13} /> Cotar lote</button>
              </div>
            </div>)}
          </div>
        ) : (
          <div className="panel scroll" style={{ marginTop: 22, overflow: "auto" }}>
            <table className="tbl"><thead><tr>{["Produto", "Categoria", "Motor", "Autonomia", "Bateria", "MOQ", "FOB base"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{list.map((p) => <tr key={p.id}><td><div className="row gap8 center"><span className="moto-thumb" style={{ width: 30, height: 30, borderRadius: 5, flexShrink: 0 }}>{img0(p) && <img src={img0(p)} alt="" />}</span><span className="strong">{p.modelo}</span></div></td><td>{p.categoria}</td><td className="mono" style={{ fontSize: 11.5 }}>{p.motor}</td><td className="mono" style={{ fontSize: 11.5 }}>{p.autonomia}</td><td className="mono" style={{ fontSize: 11.5 }}>{p.bateria}</td><td>{p.moq}</td><td className="mono strong">{p.moeda} {p.preco_base}</td></tr>)}</tbody>
            </table>
          </div>
        )}

        <div className="g-1m" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12, marginTop: 24 }}>
          <div className="panel panel-b row center gap14" style={{ background: "var(--bg-2)" }}>
            <Icon name="shield" size={20} style={{ color: "var(--lime)", flexShrink: 0 }} />
            <span className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>Fornecedores <b style={{ color: "var(--tx)" }}>verificados</b>, com amostra e inspeção de qualidade antes do embarque. Importação assistida e pagamento com prazo via Supply Chain Finance.</span>
          </div>
          <div className="panel panel-b row center gap14" style={{ background: "var(--bg-2)" }}>
            <Icon name="alert" size={20} style={{ color: "var(--warn)", flexShrink: 0 }} />
            <span className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>Homologação, certificação (INMETRO/ANATEL) e enquadramento variam por categoria. Validação antes da revenda.</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export function SiteFAQ() {
  const groups: [string, [string, string][]][] = [
    ["Supply Chain Finance", [["Preciso ter experiência em importação?", "Não é obrigatório. Orientamos você no processo, mas a operação exige cadastro e habilitação adequados."], ["Preciso ter RADAR?", "Sim, a habilitação no RADAR/Siscomex é necessária para importar."], ["O prazo é garantido?", "Não. O prazo de 90–180 dias é sujeito à análise e aprovação da linha de crédito."], ["O financiamento é automático?", "Não. Toda condição passa por análise cadastral, documental e financeira."], ["Quais documentos são necessários?", "Contrato social, cartão CNPJ, comprovante de endereço, RG/CPF do representante, RADAR e invoice/proforma."], ["A TradeK escolhe o fornecedor?", "No SCF você pode trazer seu fornecedor. No Procurement, nós encontramos e validamos."]]],
    ["Procurement", [["Vocês encontram fornecedor do zero?", "Sim. Fazemos a busca, pré-seleção e validação de fornecedores."], ["Vocês fazem inspeção?", "Sim, oferecemos amostra e inspeção de qualidade antes do embarque."], ["É possível pedir amostra?", "Sim, a amostragem faz parte do processo de validação."], ["Quanto tempo leva o sourcing?", "Varia conforme a complexidade do produto e das certificações exigidas."], ["Preciso ter especificação técnica?", "Ajuda muito, mas podemos apoiar na definição das especificações."]]],
    ["Produtos da China", [["Que tipos de produto vocês têm?", "Hoje o catálogo é de mobilidade elétrica, mas estamos cadastrando novas categorias. Diga ao agente o que procura."], ["Existe quantidade mínima?", "Sim, a compra é por lote — normalmente 1 contêiner. O MOQ é confirmado na cotação."], ["Posso comprar para revender no Brasil?", "Sim, esse é o objetivo: comprar lote do fornecedor chinês e revender aqui, com importação assistida."], ["Como pago o fornecedor?", "Você pode usar o Supply Chain Finance e pagar em 90–180 dias, sujeito a análise."], ["Precisa de certificação/homologação?", "Pode ser necessária conforme a categoria (INMETRO, ANATEL). Orientamos sobre o enquadramento."], ["A proposta é automática?", "Não. A proposta comercial é validada pela equipe TradeK."]]],
  ]
  return (
    <div className="sec-pad" style={{ maxWidth: 880, margin: "0 auto", padding: "64px 40px 0" }}>
      <div className="eyebrow">Central de ajuda</div>
      <h1 className="disp fz-xl" style={{ fontSize: 46, fontWeight: 600, letterSpacing: "-.02em", margin: "16px 0 8px" }}>Perguntas frequentes</h1>
      {groups.map(([t, items]) => <div key={t} style={{ marginTop: 40 }}>
        <div className="row gap8 center" style={{ marginBottom: 8 }}><span className="tag" style={{ color: "var(--lime)" }}>{t}</span><div className="fill hr" style={{ flex: 1 }}></div></div>
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

  async function submit() {
    if (!f.nome || !f.email) return toast.error("Informe ao menos nome e e-mail.")
    if (!f.consent) return toast.error("Autorize o contato conforme a LGPD.")
    setBusy(true)
    const res = await createPublicLead({ origem: "formulario_site", nome: f.nome, empresa: f.empresa, cnpj: f.cnpj, email: f.email, whatsapp: f.whatsapp, unidade: f.unidade, demanda: f.mensagem, consentimento_lgpd: true })
    setBusy(false)
    if (res) navigate("/obrigado")
    else toast.error("Não foi possível enviar agora. Tente novamente em instantes.")
  }

  return (
    <div className="g-1m sec-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
      <div>
        <div className="eyebrow">Fale conosco</div>
        <h1 className="disp fz-xl" style={{ fontSize: 44, fontWeight: 600, letterSpacing: "-.02em", margin: "16px 0 0" }}>Solicite uma análise</h1>
        <p className="muted" style={{ fontSize: 15.5, lineHeight: 1.6, marginTop: 16, maxWidth: "42ch" }}>Conte sobre sua demanda. Nossa equipe retorna no mesmo dia com o próximo passo.</p>
        <div className="col gap16" style={{ marginTop: 32 }}>
          {([["mail", "E-mail", "comercial@tradek.com.br"], ["phone", "WhatsApp", "+55 11 4000-0000"], ["globe", "Operação", "China → Brasil"]] as [string, string, string][]).map(([ic, k, v]) =>
            <div key={k} className="row gap12 center"><span style={{ width: 38, height: 38, borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--lime)" }}><Icon name={ic} size={17} /></span><div><div className="tag">{k}</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 1 }}>{v}</div></div></div>)}
        </div>
      </div>
      <div className="panel panel-b">
        <div className="g-1m" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="field" style={{ gridColumn: "span 2" }}><label>Nome</label><input className="input" placeholder="Seu nome" value={f.nome} onChange={(e) => set("nome", e.target.value)} /></div>
          <div className="field"><label>Empresa</label><input className="input" placeholder="Empresa" value={f.empresa} onChange={(e) => set("empresa", e.target.value)} /></div>
          <div className="field"><label>CNPJ</label><input className="input" placeholder="00.000.000/0000-00" value={f.cnpj} onChange={(e) => set("cnpj", e.target.value)} /></div>
          <div className="field"><label>E-mail</label><input className="input" placeholder="email@empresa.com" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="field"><label>WhatsApp</label><input className="input" placeholder="+55 ..." value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
          <div className="field" style={{ gridColumn: "span 2" }}><label>Unidade de interesse</label>
            <select className="select" value={f.unidade} onChange={(e) => set("unidade", e.target.value)}>
              <option value="supply_chain_finance">Supply Chain Finance</option>
              <option value="procurement">Procurement Internacional</option>
              <option value="produtos_motos">Produtos da China</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn: "span 2" }}><label>Mensagem</label><textarea className="textarea" placeholder="Descreva sua demanda..." value={f.mensagem} onChange={(e) => set("mensagem", e.target.value)}></textarea></div>
        </div>
        <label className="row gap8 center" style={{ marginTop: 14, fontSize: 12.5, color: "var(--tx-dim)", cursor: "pointer" }}><input type="checkbox" style={{ accentColor: "var(--lime)" }} checked={f.consent} onChange={(e) => set("consent", e.target.checked)} /> Autorizo o contato e o tratamento de dados conforme a LGPD.</label>
        <Btn variant="lime" className="btn--block" style={{ marginTop: 16 }} disabled={busy} onClick={submit}>{busy ? "Enviando…" : "Enviar solicitação"}</Btn>
      </div>
    </div>
  )
}

export function SiteObrigado() {
  return (
    <div className="sec-pad" style={{ maxWidth: 680, margin: "0 auto", padding: "90px 40px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--lime-dim)", border: "1px solid var(--lime-dim2)", display: "grid", placeItems: "center", margin: "0 auto" }}><Icon name="check" size={34} style={{ color: "var(--lime)" }} /></div>
      <h1 className="disp fz-lg" style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-.02em", margin: "28px 0 0" }}>Recebemos sua solicitação.</h1>
      <p className="muted" style={{ fontSize: 16, lineHeight: 1.6, marginTop: 16 }}>A equipe TradeK irá analisar os dados enviados e retornar com o próximo passo. Se necessário, você poderá receber um convite para acessar o Portal do Cliente e enviar documentos complementares.</p>
      <div className="row gap12 cta-stack" style={{ justifyContent: "center", marginTop: 32 }}>
        <Link className="btn btn--lime" to="/">Voltar ao início</Link>
        <Link className="btn btn--ghost" to="/cliente/login">Portal do cliente <Icon name="arrowR" size={14} /></Link>
      </div>
    </div>
  )
}

export function SiteSobre() {
  return (
    <div className="sec-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px 0" }}>
      <div className="eyebrow">Sobre a TradeK</div>
      <h1 className="disp fz-xl" style={{ fontSize: 48, fontWeight: 600, letterSpacing: "-.025em", margin: "18px 0 0", maxWidth: "20ch" }}>Negócios internacionais com inteligência, segurança e escala.</h1>
      <p className="muted" style={{ fontSize: 17, lineHeight: 1.6, marginTop: 20, maxWidth: "62ch" }}>A TradeK atua na ponte comercial entre China e Brasil, com frentes em Supply Chain Finance, Procurement Internacional e mobilidade elétrica. Transformamos a captação em uma operação organizada — do primeiro contato à entrega.</p>
      <div className="g-1m" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 40 }}>
        {([["coins", "Supply Chain Finance", "Importação financiada com prazo estendido."], ["globe", "Procurement", "Sourcing e validação de fornecedores."], ["box", "Produtos da China", "Catálogo de fornecedores para comprar em lote e revender."]] as [string, string, string][]).map(([ic, t, d]) =>
          <div key={t} className="panel panel-b"><Icon name={ic} size={24} style={{ color: "var(--lime)" }} /><div className="disp" style={{ fontSize: 19, fontWeight: 600, marginTop: 16 }}>{t}</div><div className="muted" style={{ fontSize: 13.5, marginTop: 6, lineHeight: 1.5 }}>{d}</div></div>)}
      </div>
    </div>
  )
}
