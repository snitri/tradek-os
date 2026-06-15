/* ============================================================
   TradeK OS — Painel Admin · shell + login + dashboard + CRM
   ============================================================ */
const { useState:adUseState, useRef:adUseRef } = React;

const ADMIN_NAV = [
  { g:'Operação', items:[
    ['dashboard','Dashboard','#/admin/dashboard'],
    ['kanban','CRM Kanban','#/admin/crm'],
    ['list','CRM Lista','#/admin/lista'],
    ['chat','Interações','#/admin/interacoes'],
    ['chart','Relatórios IA','#/admin/relatorios'],
  ]},
  { g:'Cadastros', items:[
    ['building','Empresas','#/admin/empresas'],
    ['users','Clientes','#/admin/clientes'],
    ['file','Documentos','#/admin/documentos'],
    ['box','Produtos','#/admin/produtos'],
    ['target','Tarefas','#/admin/tarefas'],
  ]},
  { g:'Sistema', items:[
    ['bell','Notificações','#/admin/notificacoes'],
    ['brain','Agentes IA','#/admin/agentes'],
    ['settings','Configurações','#/admin/config'],
  ]},
];

/* ---------------- LOGIN ---------------- */
function AdminLogin(){
  return (<div style={{minHeight:'100vh',display:'grid',gridTemplateColumns:'1fr 1fr'}}>
    <div style={{position:'relative',background:'var(--bg-1)',borderRight:'1px solid var(--line)',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'48px 52px',overflow:'hidden'}}>
      <div className="tk-grid" style={{position:'absolute',inset:0,opacity:.5}}></div>
      <div style={{position:'absolute',top:-120,left:-80,width:420,height:420,background:'radial-gradient(circle,rgba(195,249,41,.1),transparent 65%)'}}></div>
      <div style={{position:'relative'}}><Logo h={26}/></div>
      <div style={{position:'relative'}}>
        <div className="eyebrow">Centro operacional</div>
        <h1 className="disp" style={{fontSize:40,fontWeight:600,letterSpacing:'-.02em',margin:'18px 0 0',maxWidth:'16ch'}}>O núcleo do seu funil China–Brasil.</h1>
        <p className="muted" style={{fontSize:15,lineHeight:1.6,marginTop:16,maxWidth:'40ch'}}>CRM, agentes de IA, documentos e relatórios — tudo num só sistema operacional.</p>
      </div>
      <div className="row gap20" style={{position:'relative'}}>
        {[['42','Leads hoje'],['18','Qualificados'],['R$2,8M','Pipeline']].map(([n,l])=><div key={l}><div className="disp lime" style={{fontSize:26,fontWeight:600}}>{n}</div><div className="tag">{l}</div></div>)}
      </div>
    </div>
    <div style={{display:'grid',placeItems:'center',padding:40}}>
      <div style={{width:360,maxWidth:'100%'}}>
        <div className="tag">TradeK OS · Acesso interno</div>
        <h2 className="disp" style={{fontSize:28,fontWeight:600,margin:'10px 0 28px'}}>Entrar no painel</h2>
        <div className="col gap14">
          <div className="field"><label>E-mail corporativo</label><input className="input" defaultValue="ana.prado@tradek.com.br"/></div>
          <div className="field"><label>Senha</label><input className="input" type="password" defaultValue="••••••••••"/></div>
          <div className="row center" style={{justifyContent:'space-between'}}>
            <label className="row gap8 center" style={{fontSize:12.5,color:'var(--tx-dim)',cursor:'pointer'}}><input type="checkbox" style={{accentColor:'var(--lime)'}} defaultChecked/> Manter conectado</label>
            <a href="#" className="lime" style={{fontSize:12.5,fontWeight:600}}>Esqueci a senha</a>
          </div>
          <a href="#/admin/dashboard" className="btn btn--lime btn--block" style={{marginTop:4}}><Icon name="lock" size={15}/> Entrar</a>
          <div className="row gap8 center" style={{fontSize:11.5,color:'var(--tx-mute)',justifyContent:'center',marginTop:4}}><Icon name="shield" size={13}/> Conexão segura · 2FA disponível</div>
        </div>
        <div className="hr" style={{margin:'24px 0'}}></div>
        <a href="#/cliente/login" className="row gap6 center faint" style={{fontSize:12.5,fontWeight:600,justifyContent:'center'}}>É cliente? Acesse o portal <Icon name="arrowR" size={13}/></a>
      </div>
    </div>
  </div>);
}

/* ---------------- SHELL ---------------- */
function AdminShell({ route, children, openLead }){
  const [collapsed,setCollapsed]=adUseState(false);
  const title = (ADMIN_NAV.flatMap(g=>g.items).find(i=>i[2]===route)||[null,'Dashboard'])[1];
  return (<div style={{display:'grid',gridTemplateColumns:(collapsed?'64px':'232px')+' 1fr',height:'100vh',overflow:'hidden'}}>
    {/* sidebar */}
    <aside style={{background:'var(--bg-1)',borderRight:'1px solid var(--line)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div className="row center" style={{padding:'16px 18px',justifyContent:collapsed?'center':'space-between',borderBottom:'1px solid var(--line-soft)',minHeight:57}}>
        {!collapsed && <Logo h={19}/>}
        <button className="btn btn--icon" onClick={()=>setCollapsed(c=>!c)} style={{color:'var(--tx-mute)'}}><Icon name="menu" size={16}/></button>
      </div>
      <div className="scroll" style={{flex:1,padding:'12px 10px',overflowX:'hidden'}}>
        {ADMIN_NAV.map(grp=><div key={grp.g} style={{marginBottom:14}}>
          {!collapsed && <div className="tag" style={{padding:'6px 10px',color:'var(--tx-faint)'}}>{grp.g}</div>}
          {grp.items.map(([ic,l,h])=>{ const on=route===h;
            return <a key={h} href={h} title={l} className="row center gap10" style={{padding:collapsed?'10px 0':'9px 10px',justifyContent:collapsed?'center':'flex-start',borderRadius:6,fontSize:13,fontWeight:600,marginBottom:2,
              color:on?'#0A0B0A':'var(--tx-dim)',background:on?'var(--lime)':'transparent',transition:'.12s'}}
              onMouseEnter={e=>{if(!on)e.currentTarget.style.background='rgba(255,255,255,.04)';}}
              onMouseLeave={e=>{if(!on)e.currentTarget.style.background='transparent';}}>
              <Icon name={ic} size={17} stroke={on?2.4:2}/>{!collapsed && l}
            </a>; })}
        </div>)}
      </div>
      <div style={{borderTop:'1px solid var(--line-soft)',padding:collapsed?'12px 0':'12px 14px'}}>
        <a href="#/admin/login" className="row center gap10" style={{justifyContent:collapsed?'center':'flex-start',color:'var(--tx-mute)',fontSize:12.5,fontWeight:600}}><Icon name="logout" size={16}/>{!collapsed && 'Sair'}</a>
      </div>
    </aside>
    {/* main */}
    <div style={{display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <header className="row center" style={{padding:'0 22px',height:57,borderBottom:'1px solid var(--line)',background:'var(--bg-1)',gap:16,flexShrink:0}}>
        <div className="row gap8 center"><span className="tag">TradeK OS</span><Icon name="chevR" size={13} style={{color:'var(--tx-faint)'}}/><span className="disp" style={{fontSize:16,fontWeight:600}}>{title}</span></div>
        <div className="row center" style={{marginLeft:24,flex:1,maxWidth:420,background:'var(--bg)',border:'1px solid var(--line)',borderRadius:6,padding:'7px 11px',gap:8}}>
          <Icon name="search" size={15} style={{color:'var(--tx-mute)'}}/><input placeholder="Buscar leads, empresas, documentos…" style={{background:'none',border:'none',outline:'none',color:'var(--tx)',fontSize:13,width:'100%'}}/>
          <kbd className="mono" style={{fontSize:10,color:'var(--tx-faint)',border:'1px solid var(--line)',borderRadius:3,padding:'1px 5px'}}>⌘K</kbd>
        </div>
        <div className="row gap10 center mla">
          <button className="btn btn--lime btn--sm" onClick={()=>openLead('new')}><Icon name="plus" size={14}/> Novo lead</button>
          <a href="#/admin/notificacoes" className="btn btn--icon btn--dark" style={{position:'relative'}}><Icon name="bell" size={16}/><span style={{position:'absolute',top:6,right:6,width:7,height:7,borderRadius:'50%',background:'var(--lime)',border:'2px solid var(--bg-3)'}}></span></a>
          <div className="row gap8 center" style={{paddingLeft:6}}><Avatar name="Ana Prado" tone="lime" size={30}/><div style={{lineHeight:1.25,whiteSpace:'nowrap'}} className="col"><span style={{fontSize:12.5,fontWeight:700}}>Ana Prado</span><span className="tag">Comercial</span></div></div>
        </div>
      </header>
      <main className="scroll fill" style={{padding:'22px'}}>{children}</main>
    </div>
  </div>);
}

/* ---------------- DASHBOARD ---------------- */
function AdminDashboard({ openLead }){
  return (<div className="fade" style={{maxWidth:1320}}>
    {/* KPIs */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12}}>
      {KPIS.map(k=><div key={k.k} className="panel" style={{padding:'16px 18px',position:'relative',overflow:'hidden'}}>
        {k.hot && <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'var(--lime)'}}></div>}
        <div className="row center" style={{justifyContent:'space-between'}}><span className="tag">{k.label}</span><span className="row gap4 center" style={{fontSize:11,fontWeight:700,color:k.up?'var(--ok)':'var(--danger)'}}><Icon name="trend" size={12} style={{transform:k.up?'none':'scaleY(-1)'}}/>{k.delta}</span></div>
        <div className="disp" style={{fontSize:32,fontWeight:600,letterSpacing:'-.02em',marginTop:8,color:k.hot?'var(--lime)':'var(--tx)'}}>{k.val}</div>
      </div>)}
    </div>
    {/* funnel + units + origin */}
    <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:12,marginTop:12}}>
      <div className="panel">
        <div className="panel-h"><h3>Funil de oportunidades</h3><a href="#/admin/crm" className="row gap6 center lime" style={{fontSize:11.5,fontWeight:700}}>Abrir CRM <Icon name="arrowR" size={12}/></a></div>
        <div className="panel-b col gap10">
          {FUNNEL.map(([l,v,w])=><div key={l} className="row center gap12" style={{fontSize:12.5}}>
            <span className="muted" style={{width:120,flexShrink:0}}>{l}</span>
            <div style={{flex:1,height:18,background:'var(--bg)',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:w+'%',background:'var(--lime)',borderRadius:3,opacity:.35+(w/160)}}></div></div>
            <span className="mono" style={{width:28,textAlign:'right',fontWeight:700}}>{v}</span>
          </div>)}
        </div>
      </div>
      <div className="panel">
        <div className="panel-h"><h3>Leads por unidade</h3></div>
        <div className="panel-b col gap16">
          {BY_UNIT.map(([l,v,c])=><div key={l}><div className="row center" style={{justifyContent:'space-between',fontSize:12.5,marginBottom:6}}><span className="muted">{l}</span><span className="mono" style={{fontWeight:700}}>{v}</span></div><div style={{height:8,background:'var(--bg)',borderRadius:99}}><div style={{height:'100%',width:(v/58*100)+'%',background:c,borderRadius:99}}></div></div></div>)}
          <div className="hr"></div>
          <div className="tag">Por origem</div>
          {BY_ORIGIN.map(([l,v])=><div key={l} className="row center" style={{justifyContent:'space-between',fontSize:12.5}}><span className="muted">{l}</span><div className="row gap8 center"><div style={{width:70,height:5,background:'var(--bg)',borderRadius:99}}><div style={{height:'100%',width:(v/46*100)+'%',background:'var(--tx-dim)',borderRadius:99}}></div></div><span className="mono" style={{width:28,textAlign:'right'}}>{v}%</span></div></div>)}
        </div>
      </div>
    </div>
    {/* bottom row */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginTop:12}}>
      <div className="panel">
        <div className="panel-h"><h3>Pendências críticas</h3><span className="pill pill--danger">3 urgentes</span></div>
        <div className="panel-b col gap2" style={{padding:'6px 8px'}}>
          {[['users','6 leads sem responsável','#/admin/lista','warn'],['file','9 documentos pendentes','#/admin/documentos','danger'],['clock','3 tarefas vencidas','#/admin/tarefas','danger']].map(([ic,t,h,c])=>
            <a key={t} href={h} className="row center gap10" style={{padding:'11px 10px',borderRadius:6,fontSize:13}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.03)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <span style={{width:30,height:30,borderRadius:7,background:'var(--bg)',display:'grid',placeItems:'center',color:`var(--${c})`}}><Icon name={ic} size={15}/></span>
              <span style={{fontWeight:600}}>{t}</span><Icon name="chevR" size={14} style={{marginLeft:'auto',color:'var(--tx-faint)'}}/>
            </a>)}
        </div>
      </div>
      <div className="panel">
        <div className="panel-h"><h3>Últimas interações IA</h3><span className="tag">tempo real</span></div>
        <div className="panel-b col" style={{padding:'4px 8px'}}>
          {LEADS.slice(0,5).map(l=><button key={l.id} onClick={()=>openLead(l.id)} className="row center gap10" style={{padding:'10px',borderRadius:6,textAlign:'left',width:'100%'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.03)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <Avatar name={l.empresa} size={28}/>
            <div className="col" style={{lineHeight:1.3,flex:1,minWidth:0}}><span style={{fontSize:12.5,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{l.empresa}</span><span className="tag">{UNITS[l.unit].short} · {l.origem}</span></div>
            <Score v={l.score}/>
          </button>)}
        </div>
      </div>
      <div className="panel">
        <div className="panel-h"><h3>Alertas de SLA</h3><a href="#/admin/tarefas" className="lime" style={{fontSize:11.5,fontWeight:700}}>Ver tarefas</a></div>
        <div className="panel-b col gap2" style={{padding:'6px 8px'}}>
          {TASKS.slice(0,4).map((t,i)=><div key={i} className="row center gap10" style={{padding:'10px',borderRadius:6,fontSize:12.5}}>
            <span className="sdot" style={{background:t.venc?'var(--danger)':'var(--warn)',flexShrink:0}}></span>
            <div className="col" style={{flex:1,minWidth:0,lineHeight:1.3}}><span style={{fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{t.titulo}</span><span className="tag">{t.resp} · {t.prazo}</span></div>
            {t.venc && <span className="pill pill--danger" style={{flexShrink:0}}>Vencida</span>}
          </div>)}
        </div>
      </div>
    </div>
  </div>);
}

/* ---------------- CRM KANBAN ---------------- */
function AdminKanban({ openLead }){
  const [leads,setLeads]=adUseState(()=>LEADS.map(l=>({...l})));
  const [drag,setDrag]=adUseState(null);
  const [over,setOver]=adUseState(null);
  function onDrop(col){ if(drag){ setLeads(ls=>ls.map(l=>l.id===drag?{...l,status:col}:l)); } setDrag(null); setOver(null); }
  return (<div className="fade" style={{height:'100%',display:'flex',flexDirection:'column'}}>
    {/* filter bar */}
    <div className="row center gap10 wrap" style={{marginBottom:14}}>
      <div className="row gap8 center" style={{background:'var(--bg-1)',border:'1px solid var(--line)',borderRadius:6,padding:'6px 10px'}}><Icon name="search" size={14} style={{color:'var(--tx-mute)'}}/><input placeholder="Buscar empresa…" style={{background:'none',border:'none',outline:'none',color:'var(--tx)',fontSize:12.5,width:140}}/></div>
      {['Unidade','Status','Responsável','Score','Origem'].map(f=><button key={f} className="btn btn--dark btn--sm"><Icon name="filter" size={12}/>{f}<Icon name="chevD" size={12}/></button>)}
      <div className="row gap8 mla">
        <a href="#/admin/lista" className="btn btn--dark btn--sm"><Icon name="list" size={13}/> Lista</a>
        <button className="btn btn--lime btn--sm" onClick={()=>openLead('new')}><Icon name="plus" size={13}/> Novo</button>
      </div>
    </div>
    {/* board */}
    <div className="scroll" style={{flex:1,display:'flex',gap:12,paddingBottom:8}}>
      {KANBAN_COLS.map(col=>{ const meta=statusMeta(col); const items=leads.filter(l=>l.status===col);
        return (<div key={col} onDragOver={e=>{e.preventDefault(); setOver(col);}} onDrop={()=>onDrop(col)}
          style={{width:268,flexShrink:0,display:'flex',flexDirection:'column',background:over===col?'rgba(195,249,41,.04)':'transparent',borderRadius:8,transition:'.12s'}}>
          <div className="row center gap8" style={{padding:'8px 10px',marginBottom:8}}>
            <span className="sdot" style={{background:meta.color}}></span>
            <span style={{fontSize:12.5,fontWeight:700}}>{meta.label}</span>
            <span className="mono" style={{fontSize:11,color:'var(--tx-mute)',background:'var(--bg-2)',borderRadius:99,padding:'1px 7px',marginLeft:'auto'}}>{items.length}</span>
          </div>
          <div className="scroll col gap8" style={{flex:1,padding:'0 2px'}}>
            {items.map(l=><div key={l.id} draggable onDragStart={()=>setDrag(l.id)} onDragEnd={()=>{setDrag(null);setOver(null);}} onClick={()=>openLead(l.id)}
              className="panel" style={{padding:12,cursor:'grab',opacity:drag===l.id?.4:1,transition:'.12s',background:'var(--bg-2)'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--line-strong)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--line)'}>
              <div className="row center" style={{justifyContent:'space-between',marginBottom:8}}>
                <span className="pill" style={{borderColor:UNITS[l.unit].color,color:UNITS[l.unit].color,fontSize:10,padding:'2px 7px'}}><Icon name={UNITS[l.unit].icon} size={10}/>{UNITS[l.unit].short}</span>
                <Score v={l.score}/>
              </div>
              <div style={{fontSize:13.5,fontWeight:700,lineHeight:1.25}}>{l.empresa}</div>
              <div className="tag" style={{marginTop:3}}>{l.contato} · {l.cidade.split(' · ')[0]}</div>
              <div className="hr" style={{margin:'10px 0'}}></div>
              <div className="row center" style={{justifyContent:'space-between'}}>
                <span className="mono" style={{fontSize:11.5,color:l.valor==='—'?'var(--tx-faint)':'var(--tx-dim)'}}>{l.valor}</span>
                <span className="tag" style={{color:l.urgencia==='Alta'?'var(--danger)':'var(--tx-mute)'}}>{l.urgencia}</span>
              </div>
              <div className="row center gap6" style={{marginTop:10}}>
                {l.resp ? <span className="row gap6 center" style={{fontSize:11,color:'var(--tx-dim)'}}><Avatar name={l.resp} size={18}/>{l.resp.split(' ')[0]}</span> : <span className="pill pill--warn" style={{fontSize:10}}>Sem resp.</span>}
                {l.docPend>0 && <span className="pill pill--danger" style={{marginLeft:'auto',fontSize:10}}><Icon name="file" size={10}/>{l.docPend}</span>}
              </div>
            </div>)}
            {items.length===0 && <div style={{border:'1px dashed var(--line)',borderRadius:8,padding:'20px 0',textAlign:'center',fontSize:11.5,color:'var(--tx-faint)'}}>Solte aqui</div>}
          </div>
        </div>);
      })}
    </div>
  </div>);
}

/* ---------------- CRM LISTA ---------------- */
function AdminLista({ openLead }){
  const [sel,setSel]=adUseState([]);
  const toggle=id=>setSel(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  return (<div className="fade">
    <div className="row center gap10 wrap" style={{marginBottom:14}}>
      {['Unidade','Status','Responsável','Score mín.','Origem','Docs pendentes'].map(f=><button key={f} className="btn btn--dark btn--sm"><Icon name="filter" size={12}/>{f}</button>)}
      <div className="row gap8 mla">
        {sel.length>0 && <span className="pill pill--lime">{sel.length} selecionados</span>}
        <button className="btn btn--dark btn--sm"><Icon name="download" size={13}/> Exportar</button>
        <a href="#/admin/crm" className="btn btn--dark btn--sm"><Icon name="kanban" size={13}/> Kanban</a>
      </div>
    </div>
    <div className="panel scroll" style={{overflow:'auto'}}>
      <table className="tbl">
        <thead><tr>
          <th style={{width:32}}><input type="checkbox" style={{accentColor:'var(--lime)'}} onChange={e=>setSel(e.target.checked?LEADS.map(l=>l.id):[])}/></th>
          {['ID','Empresa','Contato','Unidade','Score','Status','Resp.','Valor','Próx. ação','Docs'].map(h=><th key={h}>{h}</th>)}
        </tr></thead>
        <tbody>{LEADS.map(l=>{ const m=statusMeta(l.status);
          return <tr key={l.id} onClick={()=>openLead(l.id)} style={{cursor:'pointer'}}>
            <td onClick={e=>{e.stopPropagation();toggle(l.id);}}><input type="checkbox" checked={sel.includes(l.id)} readOnly style={{accentColor:'var(--lime)'}}/></td>
            <td className="mono" style={{color:'var(--tx-mute)'}}>{l.id}</td>
            <td className="strong">{l.empresa}</td>
            <td>{l.contato}</td>
            <td><span className="pill" style={{borderColor:UNITS[l.unit].color+'66',color:UNITS[l.unit].color,fontSize:10}}>{UNITS[l.unit].short}</span></td>
            <td><Score v={l.score}/></td>
            <td><span className="row gap6 center"><span className="sdot" style={{background:m.color}}></span>{m.label}</span></td>
            <td>{l.resp? <span className="row gap6 center"><Avatar name={l.resp} size={20}/>{l.resp.split(' ')[0]}</span> : <span className="faint">—</span>}</td>
            <td className="mono">{l.valor}</td>
            <td>{l.prox}</td>
            <td>{l.docPend>0? <span className="pill pill--danger" style={{fontSize:10}}>{l.docPend}</span> : <span className="faint">0</span>}</td>
          </tr>; })}</tbody>
      </table>
    </div>
    <div className="row center" style={{justifyContent:'space-between',marginTop:12,fontSize:12,color:'var(--tx-mute)'}}>
      <span>Mostrando {LEADS.length} de {LEADS.length} oportunidades</span>
      <div className="row gap6"><button className="btn btn--dark btn--sm"><Icon name="chevL" size={13}/></button><button className="btn btn--lime btn--sm">1</button><button className="btn btn--dark btn--sm">2</button><button className="btn btn--dark btn--sm"><Icon name="chevR" size={13}/></button></div>
    </div>
  </div>);
}

Object.assign(window, { AdminLogin, AdminShell, AdminDashboard, AdminKanban, AdminLista, ADMIN_NAV });
