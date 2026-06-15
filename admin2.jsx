/* ============================================================
   TradeK OS — Admin · Lead Modal + secondary screens
   ============================================================ */
const { useState:a2UseState } = React;

/* ---------------- LEAD MODAL ---------------- */
const LEAD_TABS = ['Resumo','Dados','Oportunidade','Qualificação IA','Interações','Documentos','Chat','Relatório','Histórico'];

function LeadModal({ leadId, onClose, go }){
  const lead = LEADS.find(l=>l.id===leadId);
  const [tab,setTab]=a2UseState('Resumo');
  if(!lead) return null;
  const m=statusMeta(lead.status);
  return (<div onClick={onClose} style={{position:'fixed',inset:0,zIndex:80,background:'rgba(5,6,5,.72)',backdropFilter:'blur(3px)',display:'flex',justifyContent:'flex-end'}}>
    <div onClick={e=>e.stopPropagation()} className="fade" style={{width:'min(960px,94vw)',height:'100%',background:'var(--bg)',borderLeft:'1px solid var(--line)',display:'flex',flexDirection:'column',boxShadow:'-30px 0 80px rgba(0,0,0,.5)'}}>
      {/* header */}
      <div style={{padding:'16px 22px',borderBottom:'1px solid var(--line)',background:'var(--bg-1)'}}>
        <div className="row center gap12">
          <button className="btn btn--icon btn--dark" onClick={onClose}><Icon name="x" size={16}/></button>
          <div className="col" style={{lineHeight:1.25}}>
            <div className="row gap10 center"><span className="disp" style={{fontSize:19,fontWeight:600}}>{lead.empresa}</span><span className="pill" style={{borderColor:UNITS[lead.unit].color+'66',color:UNITS[lead.unit].color}}><Icon name={UNITS[lead.unit].icon} size={11}/>{UNITS[lead.unit].short}</span></div>
            <span className="tag">{lead.id} · {lead.contato} · {lead.cargo}</span>
          </div>
          <div className="row gap8 mla center">
            <div className="col" style={{textAlign:'right',lineHeight:1.2,marginRight:6}}><span className="tag">Score IA</span><Score v={lead.score} size={20}/></div>
            <span className="pill" style={{borderColor:m.color+'66',color:m.color}}><span className="dot"></span>{m.label}</span>
            <button className="btn btn--dark btn--sm"><Icon name="more" size={15}/></button>
            <button className="btn btn--lime btn--sm"><Icon name="check" size={13}/> Salvar</button>
          </div>
        </div>
        {/* tabs */}
        <div className="row gap2 scroll" style={{marginTop:14,marginBottom:-16,overflow:'auto'}}>
          {LEAD_TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:'9px 13px',fontSize:12.5,fontWeight:600,whiteSpace:'nowrap',color:tab===t?'var(--tx)':'var(--tx-mute)',borderBottom:'2px solid '+(tab===t?'var(--lime)':'transparent')}}>{t}</button>)}
        </div>
      </div>
      {/* body */}
      <div className="scroll fill" style={{padding:'22px'}}>
        {tab==='Resumo' && <LeadResumo lead={lead} go={go}/>}
        {tab==='Dados' && <LeadDados lead={lead}/>}
        {tab==='Oportunidade' && <LeadOportunidade lead={lead}/>}
        {tab==='Qualificação IA' && <LeadQualif lead={lead}/>}
        {tab==='Interações' && <LeadInteracoes/>}
        {tab==='Documentos' && <LeadDocumentos lead={lead}/>}
        {tab==='Chat' && <LeadChat/>}
        {tab==='Relatório' && <LeadRelatorio lead={lead}/>}
        {tab==='Histórico' && <LeadInteracoes hist/>}
      </div>
    </div>
  </div>);
}

function LeadResumo({ lead, go }){
  return (<div className="col gap12">
    <div className="panel panel-b" style={{background:'linear-gradient(180deg,rgba(195,249,41,.04),transparent)'}}>
      <div className="row gap8 center" style={{marginBottom:10}}><Icon name="brain" size={16} style={{color:'var(--lime)'}}/><span className="tag" style={{color:'var(--lime)'}}>Resumo executivo · IA</span></div>
      <p style={{fontSize:14.5,lineHeight:1.6,margin:0}}>{lead.unit==='SCF'?`${lead.empresa} quer importar ${lead.produto?.toLowerCase()} da China com prazo de ${lead.prazoDes}. Valor FOB estimado: ${lead.fob}. Fornecedor: ${lead.fornecedor}. RADAR: ${lead.radar}.`:lead.unit==='MOTOS'?`${lead.empresa} busca ${lead.qtd} do produto ${lead.modelo} para ${lead.perfil?.toLowerCase()} na região ${lead.regiao}. Canal: ${lead.canal}. Experiência em importação: ${lead.exp}.`:`${lead.empresa} precisa de sourcing de ${lead.categoria?.toLowerCase()} (${lead.specs}). Volume: ${lead.volume2}. Orçamento-alvo: ${lead.orcamento}. Certificação: ${lead.certif}.`}</p>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
      <div className="panel panel-b"><div className="row gap8 center" style={{marginBottom:10}}><Icon name="check" size={15} style={{color:'var(--ok)'}}/><span className="tag" style={{color:'var(--ok)'}}>O que o cliente quer</span></div><p className="muted" style={{fontSize:13.5,lineHeight:1.55,margin:0}}>{lead.quer}</p></div>
      <div className="panel panel-b"><div className="row gap8 center" style={{marginBottom:10}}><Icon name="x" size={15} style={{color:'var(--danger)'}}/><span className="tag" style={{color:'var(--danger)'}}>O que o cliente não quer</span></div><p className="muted" style={{fontSize:13.5,lineHeight:1.55,margin:0}}>{lead.naoQuer}</p></div>
    </div>
    <div className="panel">
      <div className="panel-h"><h3>Pendências</h3>{lead.pend.length>0 && <span className="pill pill--warn">{lead.pend.length} itens</span>}</div>
      <div className="panel-b col gap8">
        {lead.pend.length>0 ? lead.pend.map(p=><div key={p} className="row gap10 center" style={{fontSize:13.5}}><span style={{width:16,height:16,border:'1.5px solid var(--warn)',borderRadius:4,flexShrink:0}}></span>{p}</div>) : <span className="muted" style={{fontSize:13}}>Sem pendências no momento.</span>}
      </div>
    </div>
    <div className="panel panel-b" style={{borderColor:'var(--lime-dim2)'}}>
      <div className="row gap8 center" style={{marginBottom:6}}><Icon name="target" size={15} style={{color:'var(--lime)'}}/><span className="tag" style={{color:'var(--lime)'}}>Próxima ação sugerida</span></div>
      <p style={{fontSize:14,margin:'0 0 14px',fontWeight:500}}>{lead.unit==='SCF'?'Criar acesso do cliente e solicitar checklist SCF.':'Enviar proposta comercial e registrar follow-up em 2 dias.'}</p>
      <div className="row gap8 wrap">
        <a href="#/admin/documentos" className="btn btn--lime btn--sm"><Icon name="file" size={13}/> Solicitar docs</a>
        <button className="btn btn--dark btn--sm" onClick={()=>go('#/cliente/login')}><Icon name="user" size={13}/> Criar acesso cliente</button>
        <button className="btn btn--dark btn--sm"><Icon name="chart" size={13}/> Gerar relatório</button>
        <button className="btn btn--danger btn--sm"><Icon name="x" size={13}/> Desqualificar</button>
      </div>
    </div>
  </div>);
}

function FieldRO({ label, value, span }){ return <div className="field" style={span?{gridColumn:'span '+span}:null}><label>{label}</label><div className="input" style={{color:value?'var(--tx)':'var(--tx-faint)'}}>{value||'—'}</div></div>; }

function LeadDados({ lead }){
  return (<div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
    <FieldRO label="Contato" value={lead.contato}/><FieldRO label="Cargo" value={lead.cargo}/>
    <FieldRO label="Empresa" value={lead.empresa} span={2}/>
    <FieldRO label="CNPJ" value={lead.cnpj}/><FieldRO label="Cidade / Estado" value={lead.cidade}/>
    <FieldRO label="E-mail" value={lead.email}/><FieldRO label="WhatsApp" value={lead.whats}/>
    <FieldRO label="Origem" value={lead.origem}/><FieldRO label="Responsável" value={lead.resp||'Não atribuído'}/>
    <div className="field" style={{gridColumn:'span 2'}}><label>Tags</label><div className="row gap6"><span className="pill pill--lime">{UNITS[lead.unit].short}</span><span className="pill">{lead.urgencia}</span><span className="pill pill--ok">LGPD ✓</span></div></div>
  </div>);
}

function LeadOportunidade({ lead }){
  let fields;
  if(lead.unit==='SCF') fields=[['Produto importado',lead.produto],['Valor FOB',lead.fob],['Fornecedor',lead.fornecedor],['País de origem',lead.pais],['Incoterm',lead.incoterm],['Possui RADAR',lead.radar],['Produto/serviço','Supply Chain Finance'],['Prazo desejado',lead.prazoDes],['Status da avaliação',statusMeta(lead.status).label]];
  else if(lead.unit==='MOTOS') fields=[['Produto',lead.modelo],['Quantidade',lead.qtd],['Perfil do comprador',lead.perfil],['Região',lead.regiao],['Canal de venda',lead.canal],['Homologação',lead.homolog],['Experiência import.',lead.exp],['Valor estimado',lead.valor]];
  else fields=[['Categoria',lead.categoria],['Especificações',lead.specs],['Volume',lead.volume2],['Orçamento-alvo',lead.orcamento],['Mercado de destino',lead.mercado],['Certificações',lead.certif],['Amostra',lead.amostra],['Valor estimado',lead.valor]];
  return (<div>
    <div className="row gap8 center" style={{marginBottom:14}}><span className="pill" style={{borderColor:UNITS[lead.unit].color+'66',color:UNITS[lead.unit].color}}><Icon name={UNITS[lead.unit].icon} size={11}/>{UNITS[lead.unit].label}</span><span className="tag">Campos específicos da unidade</span></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>{fields.map(([k,v])=><FieldRO key={k} label={k} value={v}/>)}</div>
    <div className="field" style={{marginTop:14}}><label>Observações</label><div className="input" style={{minHeight:60,color:'var(--tx-dim)'}}>{lead.quer}</div></div>
  </div>);
}

function LeadQualif({ lead }){
  const crit=[['Empresa identificada',true,15],['CNPJ informado',!!lead.cnpj,15],['Produto/demanda clara',true,20],['Valor / volume',lead.valor!=='—',20],['RADAR / habilitação',lead.unit!=='SCF'||lead.radar!=='Não confirmado',15],['Urgência',true,15]];
  return (<div className="col gap14">
    <div className="row gap14">
      <div className="panel panel-b" style={{flex:'0 0 200px',textAlign:'center'}}>
        <div className="tag">Score total</div>
        <div className="disp" style={{fontSize:64,fontWeight:600,letterSpacing:'-.03em',lineHeight:1,margin:'8px 0',color:lead.score>=80?'var(--lime)':lead.score>=60?'var(--warn)':'var(--danger)'}}>{lead.score}</div>
        <span className={"pill "+(lead.score>=60?'pill--lime':'pill--danger')}>{lead.score>=60?'Qualificado':'Abaixo do mínimo'}</span>
        <div className="tag" style={{marginTop:10}}>mínimo: 60</div>
      </div>
      <div className="panel fill">
        <div className="panel-h"><h3>Critérios pontuados</h3></div>
        <div className="panel-b col gap10">
          {crit.map(([c,ok,pts])=><div key={c} className="row center gap10" style={{fontSize:13}}><Icon name={ok?'check':'x'} size={15} style={{color:ok?'var(--ok)':'var(--danger)'}}/><span style={{flex:1}}>{c}</span><span className="mono" style={{color:ok?'var(--tx-dim)':'var(--tx-faint)'}}>{ok?'+'+pts:'0'}/{pts}</span></div>)}
        </div>
      </div>
    </div>
    <div className="panel panel-b">
      <div className="tag" style={{color:'var(--warn)',marginBottom:10}}>Dados faltantes</div>
      <div className="row gap8 wrap">{lead.pend.length?lead.pend.map(p=><span key={p} className="pill pill--warn">{p}</span>):<span className="muted" style={{fontSize:13}}>Todos os dados mínimos coletados.</span>}</div>
    </div>
    <div className="row gap8 wrap">
      <button className="btn btn--lime btn--sm"><Icon name="check" size={13}/> Aprovar qualificação</button>
      <button className="btn btn--dark btn--sm"><Icon name="refresh" size={13}/> Recalcular score</button>
      <button className="btn btn--dark btn--sm"><Icon name="edit" size={13}/> Ajustar manualmente</button>
      <button className="btn btn--danger btn--sm"><Icon name="x" size={13}/> Desqualificar</button>
    </div>
  </div>);
}

const INT_ICON={ ia:'brain', status:'refresh', score:'target', comment:'edit', email:'mail', msg:'chat', upload:'upload' };
function LeadInteracoes({ hist }){
  return (<div className="panel panel-b">
    <div style={{position:'relative',paddingLeft:8}}>
      {INTERACTIONS.map((it,i)=><div key={i} className="row gap12" style={{position:'relative',paddingBottom:i<INTERACTIONS.length-1?18:0}}>
        {i<INTERACTIONS.length-1 && <div style={{position:'absolute',left:13,top:26,bottom:0,width:1,background:'var(--line)'}}></div>}
        <span style={{width:28,height:28,borderRadius:'50%',background:'var(--bg-3)',border:'1px solid var(--line)',display:'grid',placeItems:'center',flexShrink:0,zIndex:1,color:it.interno?'var(--warn)':'var(--tx-dim)'}}><Icon name={INT_ICON[it.tipo]||'chat'} size={13}/></span>
        <div className="col" style={{flex:1,paddingTop:2}}>
          <div className="row center gap8"><span style={{fontSize:13,fontWeight:700}}>{it.who}</span>{it.interno && <span className="pill pill--warn" style={{fontSize:9.5,padding:'1px 6px'}}>interno</span>}<span className="tag mla">{it.t}</span></div>
          <p className="muted" style={{fontSize:13,lineHeight:1.5,margin:'4px 0 0'}}>{it.msg}</p>
        </div>
      </div>)}
    </div>
  </div>);
}

function LeadDocumentos({ lead }){
  return (<div className="panel scroll" style={{overflow:'auto'}}>
    <table className="tbl"><thead><tr><th>Documento</th><th>Status</th><th>Enviado em</th><th>Ação</th></tr></thead>
      <tbody>{DOCS_CHECKLIST.map(d=>{ const s=DOC_STATUS[d.status];
        return <tr key={d.nome}><td><div className="row gap10 center"><Icon name="doc" size={16} style={{color:'var(--tx-mute)'}}/><div className="col" style={{lineHeight:1.3}}><span className="strong">{d.nome}</span><span className="tag">{d.fmt}</span></div></div></td>
          <td><Pill variant={s.variant}>{s.label}</Pill></td>
          <td className="mono">{d.data||'—'}</td>
          <td><div className="row gap6">{d.status==='enviado'||d.status==='em_revisao'?<><button className="btn btn--lime btn--sm">Aprovar</button><button className="btn btn--danger btn--sm">Reprovar</button></>:d.status==='pendente'?<button className="btn btn--dark btn--sm">Solicitar</button>:d.status==='reprovado'?<button className="btn btn--dark btn--sm">Ver motivo</button>:<button className="btn btn--dark btn--sm"><Icon name="eye" size={12}/></button>}</div></td>
        </tr>; })}</tbody>
    </table>
  </div>);
}

function LeadChat(){
  return (<div className="col gap12" style={{height:'100%'}}>
    <div className="panel panel-b col gap10" style={{flex:1,background:'var(--bg)'}}>
      {CLIENT_DOCS_MSG.map((m,i)=> m.who==='tradek'
        ? <div key={i} style={{alignSelf:'flex-start',maxWidth:'72%',background:'var(--bg-3)',border:'1px solid var(--line-soft)',padding:'10px 13px',borderRadius:'4px 12px 12px 12px',fontSize:13,lineHeight:1.5}}><div className="tag" style={{marginBottom:4}}>TradeK · {m.t}</div>{m.msg}</div>
        : <div key={i} style={{alignSelf:'flex-end',maxWidth:'72%',background:'var(--lime)',color:'#0A0B0A',padding:'10px 13px',borderRadius:'12px 4px 12px 12px',fontSize:13,fontWeight:500}}><div style={{fontSize:10,opacity:.6,marginBottom:4,fontWeight:700}}>Cliente · {m.t}</div>{m.msg}</div>)}
      <div style={{alignSelf:'center',fontSize:11,color:'var(--warn)',background:'rgba(245,181,68,.1)',border:'1px solid rgba(245,181,68,.25)',padding:'5px 12px',borderRadius:99}}>💬 Comentários internos não aparecem para o cliente</div>
    </div>
    <div className="row gap8">
      <div className="row gap6"><button className="btn btn--dark btn--sm"><Icon name="paperclip" size={13}/></button><button className="btn btn--dark btn--sm"><Icon name="brain" size={13}/> Sugestão IA</button></div>
      <input className="input fill" placeholder="Mensagem ao cliente…"/>
      <Btn variant="lime"><Icon name="send" size={15}/></Btn>
    </div>
  </div>);
}

function LeadRelatorio({ lead }){
  return (<div className="panel">
    <div className="panel-h"><h3>Relatório do lead · {lead.id}</h3><div className="row gap6"><button className="btn btn--dark btn--sm"><Icon name="refresh" size={12}/> Regenerar</button><button className="btn btn--dark btn--sm"><Icon name="download" size={12}/> PDF</button><button className="btn btn--dark btn--sm"><Icon name="mail" size={12}/> Enviar</button></div></div>
    <div className="panel-b col gap16" style={{maxWidth:680}}>
      {[['Resumo',lead.unit==='SCF'?`${lead.empresa} pleiteia importação financiada de ${lead.fob} em ${lead.prazoDes}.`:`${lead.empresa} — oportunidade ${UNITS[lead.unit].label}, valor estimado ${lead.valor}.`],['O que quer',lead.quer],['O que não quer',lead.naoQuer],['Dados faltantes',lead.pend.join(', ')||'Nenhum'],['Próxima ação',lead.unit==='SCF'?'Criar acesso do cliente e solicitar checklist.':'Enviar proposta e agendar follow-up.'],['Riscos',lead.unit==='SCF'&&lead.radar==='Não confirmado'?'RADAR não confirmado pode impedir a operação.':'Sem riscos relevantes identificados.']].map(([h,b])=>
        <div key={h}><div className="tag" style={{color:'var(--lime)',marginBottom:5}}>{h}</div><p style={{fontSize:14,lineHeight:1.55,margin:0,color:'var(--tx-dim)'}}>{b}</p></div>)}
    </div>
  </div>);
}

/* ---------------- NEW LEAD MODAL ---------------- */
function NewLeadModal({ onClose }){
  return (<div onClick={onClose} style={{position:'fixed',inset:0,zIndex:80,background:'rgba(5,6,5,.72)',backdropFilter:'blur(3px)',display:'grid',placeItems:'center',padding:20}}>
    <div onClick={e=>e.stopPropagation()} className="fade panel" style={{width:'min(640px,96vw)',maxHeight:'90vh',overflow:'auto',background:'var(--bg-1)'}}>
      <div className="panel-h"><div className="row gap8 center"><Icon name="plus" size={16} style={{color:'var(--lime)'}}/><h3 style={{textTransform:'none',letterSpacing:0,fontSize:15,color:'var(--tx)'}}>Novo lead manual</h3></div><button className="btn btn--icon" onClick={onClose}><Icon name="x" size={16}/></button></div>
      <div className="panel-b">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div className="field"><label>Nome</label><input className="input" placeholder="Contato"/></div>
          <div className="field"><label>Empresa</label><input className="input" placeholder="Empresa"/></div>
          <div className="field"><label>CNPJ</label><input className="input" placeholder="00.000.000/0000-00"/></div>
          <div className="field"><label>E-mail</label><input className="input" placeholder="email@empresa.com"/></div>
          <div className="field"><label>WhatsApp</label><input className="input" placeholder="+55 ..."/></div>
          <div className="field"><label>Origem</label><select className="select"><option>Telefone</option><option>WhatsApp</option><option>Indicação</option><option>Evento</option></select></div>
          <div className="field"><label>Unidade</label><select className="select"><option>Supply Chain Finance</option><option>Procurement</option><option>Motos / Produtos</option></select></div>
          <div className="field"><label>Valor / volume</label><input className="input" placeholder="US$ ..."/></div>
          <div className="field"><label>Responsável</label><select className="select"><option>Ana Prado</option><option>Pedro Lima</option><option>Não atribuir</option></select></div>
          <div className="field"><label>Status inicial</label><select className="select"><option>Novo Lead</option><option>Qualificado</option></select></div>
        </div>
        <div className="panel panel-b" style={{marginTop:16,background:'var(--bg-2)'}}>
          <div className="tag" style={{marginBottom:8}}>Pós-salvar (automático)</div>
          <div className="row gap14 wrap">{['Rodar qualificação IA','Criar relatório inicial','Criar tarefa','Notificar responsável'].map(t=><label key={t} className="row gap8 center" style={{fontSize:12.5,color:'var(--tx-dim)'}}><input type="checkbox" defaultChecked style={{accentColor:'var(--lime)'}}/>{t}</label>)}</div>
        </div>
        <div className="row gap8" style={{marginTop:16,justifyContent:'flex-end'}}><button className="btn btn--ghost" onClick={onClose}>Cancelar</button><Btn variant="lime" icon="check">Salvar lead</Btn></div>
      </div>
    </div>
  </div>);
}

/* ============================================================
   SECONDARY ADMIN SCREENS
   ============================================================ */

function PageHead({ title, sub, actions }){
  return (<div className="row center" style={{justifyContent:'space-between',marginBottom:16}}>
    <div><h2 className="disp" style={{fontSize:20,fontWeight:600,margin:0}}>{title}</h2>{sub && <p className="muted" style={{fontSize:13,margin:'4px 0 0'}}>{sub}</p>}</div>
    {actions && <div className="row gap8">{actions}</div>}
  </div>);
}

/* DOCUMENTOS (global) */
function AdminDocumentos(){
  const rows=LEADS.filter(l=>l.docPend>0||l.portal).flatMap(l=>DOCS_CHECKLIST.slice(0,3).map((d,i)=>({...d,empresa:l.empresa,unit:l.unit,status:i===0?d.status:['enviado','aprovado','pendente'][i%3]})));
  return (<div className="fade">
    <PageHead title="Documentos & Checklists" sub="Gestão documental de todos os clientes" actions={<><button className="btn btn--dark btn--sm"><Icon name="filter" size={13}/> Filtros</button><button className="btn btn--dark btn--sm"><Icon name="download" size={13}/> Exportar</button></>}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:14}}>
      {[['Pendentes','9','warn'],['Em revisão','4','info'],['Aprovados','37','ok'],['Reprovados','2','danger']].map(([l,n,c])=><div key={l} className="panel panel-b"><div className="row center" style={{justifyContent:'space-between'}}><span className="tag">{l}</span><span className="sdot" style={{background:`var(--${c})`}}></span></div><div className="disp" style={{fontSize:28,fontWeight:600,marginTop:6}}>{n}</div></div>)}
    </div>
    <div className="panel scroll" style={{overflow:'auto'}}>
      <table className="tbl"><thead><tr>{['Empresa','Documento','Unidade','Status','Enviado','Ação'].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.slice(0,12).map((d,i)=>{ const s=DOC_STATUS[d.status];
          return <tr key={i}><td className="strong">{d.empresa}</td><td>{d.nome}</td><td><span className="pill" style={{borderColor:UNITS[d.unit].color+'66',color:UNITS[d.unit].color,fontSize:10}}>{UNITS[d.unit].short}</span></td><td><Pill variant={s.variant}>{s.label}</Pill></td><td className="mono">{d.data||'—'}</td><td><button className="btn btn--dark btn--sm"><Icon name="eye" size={12}/> Abrir</button></td></tr>; })}</tbody>
      </table>
    </div>
  </div>);
}

/* RELATÓRIOS IA */
function AdminRelatorios(){
  return (<div className="fade">
    <PageHead title="Relatórios IA" sub="Relatórios gerados automaticamente por lead, unidade e período" actions={<><button className="btn btn--dark btn--sm"><Icon name="filter" size={13}/> Filtrar</button><button className="btn btn--lime btn--sm"><Icon name="plus" size={13}/> Gerar relatório</button></>}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:14}}>
      {[['Relatórios do mês','91','chart'],['Comerciais','34','trend'],['Operacionais','22','file']].map(([l,n,ic])=><div key={l} className="panel panel-b row center gap14"><span style={{width:42,height:42,borderRadius:9,background:'var(--bg)',display:'grid',placeItems:'center',color:'var(--lime)'}}><Icon name={ic} size={20}/></span><div><div className="disp" style={{fontSize:26,fontWeight:600}}>{n}</div><div className="tag">{l}</div></div></div>)}
    </div>
    <div className="panel"><div className="panel-h"><h3>Relatórios recentes</h3></div>
      <table className="tbl"><thead><tr>{['ID','Lead / Escopo','Unidade','Tipo','Score','Gerado','Ações'].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>{REPORTS.map(r=><tr key={r.id}><td className="mono" style={{color:'var(--tx-mute)'}}>{r.id}</td><td className="strong">{r.lead}</td><td>{r.unit==='Todas'?<span className="faint">Todas</span>:<span className="pill" style={{borderColor:UNITS[r.unit].color+'66',color:UNITS[r.unit].color,fontSize:10}}>{UNITS[r.unit].short}</span>}</td><td>{r.tipo}</td><td>{r.score?<Score v={r.score}/>:<span className="faint">—</span>}</td><td className="mono">{r.data}</td><td><div className="row gap6"><button className="btn btn--dark btn--sm"><Icon name="eye" size={12}/></button><button className="btn btn--dark btn--sm"><Icon name="download" size={12}/></button><button className="btn btn--dark btn--sm"><Icon name="refresh" size={12}/></button></div></td></tr>)}</tbody>
      </table>
    </div>
  </div>);
}

/* INTERAÇÕES */
function AdminInteracoes({ openLead }){
  const [active,setActive]=a2UseState(0);
  const lead=LEADS[active];
  return (<div className="fade" style={{display:'grid',gridTemplateColumns:'280px 1fr 300px',gap:12,height:'100%'}}>
    <div className="panel" style={{display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div className="panel-h"><h3>Conversas</h3><span className="pill pill--lime">{LEADS.length}</span></div>
      <div className="scroll fill">{LEADS.slice(0,8).map((l,i)=><button key={l.id} onClick={()=>setActive(i)} className="row gap10 center" style={{width:'100%',padding:'11px 14px',borderBottom:'1px solid var(--line-soft)',textAlign:'left',background:active===i?'rgba(195,249,41,.06)':'transparent',borderLeft:'2px solid '+(active===i?'var(--lime)':'transparent')}}>
        <Avatar name={l.empresa} size={32}/><div className="col fill" style={{minWidth:0,lineHeight:1.3}}><span style={{fontSize:12.5,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{l.empresa}</span><span className="tag">{UNITS[l.unit].short} · {l.ult}</span></div>{l.docPend>0 && <span className="sdot" style={{background:'var(--lime)'}}></span>}</button>)}</div>
    </div>
    <div className="panel" style={{display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div className="panel-h"><div className="row gap8 center"><Avatar name={lead.empresa} size={28}/><div className="col" style={{lineHeight:1.2}}><span style={{fontSize:13,fontWeight:700,color:'var(--tx)'}}>{lead.empresa}</span><span className="tag">via {lead.origem}</span></div></div><div className="row gap6"><button className="btn btn--dark btn--sm">Assumir</button><button className="btn btn--lime btn--sm" onClick={()=>openLead(lead.id)}>Abrir lead</button></div></div>
      <div className="scroll fill col gap10" style={{padding:16,background:'var(--bg)'}}>
        {INTERACTIONS.filter(i=>['ia','msg'].includes(i.tipo)).map((m,i)=> m.tipo==='msg'
          ? <div key={i} style={{alignSelf:'flex-end',maxWidth:'70%',background:'var(--lime)',color:'#0A0B0A',padding:'10px 13px',borderRadius:'12px 4px 12px 12px',fontSize:13,fontWeight:500}}>{m.msg}</div>
          : <div key={i} style={{alignSelf:'flex-start',maxWidth:'76%',background:'var(--bg-3)',border:'1px solid var(--line-soft)',padding:'10px 13px',borderRadius:'4px 12px 12px 12px',fontSize:13,lineHeight:1.5}}><div className="tag" style={{marginBottom:4,color:'var(--lime)'}}>{m.who}</div>{m.msg}</div>)}
      </div>
      <div className="row gap8" style={{padding:12,borderTop:'1px solid var(--line)'}}><button className="btn btn--dark btn--sm"><Icon name="brain" size={13}/></button><input className="input fill" placeholder="Responder…"/><Btn variant="lime"><Icon name="send" size={15}/></Btn></div>
    </div>
    <div className="panel" style={{overflow:'auto'}}>
      <div className="panel-h"><h3>Lead vinculado</h3></div>
      <div className="panel-b col gap10">
        <div className="row center" style={{justifyContent:'space-between'}}><span className="tag">Score</span><Score v={lead.score} size={18}/></div>
        <div className="hr"></div>
        {[['Unidade',UNITS[lead.unit].short],['Status',statusMeta(lead.status).label],['Valor',lead.valor],['Responsável',lead.resp||'—'],['Próx. ação',lead.prox]].map(([k,v])=><div key={k} className="row center" style={{justifyContent:'space-between',fontSize:12.5}}><span className="faint">{k}</span><span style={{fontWeight:600,textAlign:'right'}}>{v}</span></div>)}
        <button className="btn btn--lime btn--block btn--sm" style={{marginTop:6}}>Gerar resumo IA</button>
      </div>
    </div>
  </div>);
}

Object.assign(window, { LeadModal, NewLeadModal, AdminDocumentos, AdminRelatorios, AdminInteracoes, PageHead });
