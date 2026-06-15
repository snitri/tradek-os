/* ============================================================
   TradeK OS — App router + launcher + screen index
   ============================================================ */
const { useState:apUseState, useEffect:apUseEffect } = React;

function useHashRoute(){
  const [route,setRoute]=apUseState(window.location.hash||'#/');
  apUseEffect(()=>{ const on=()=>{ setRoute(window.location.hash||'#/'); window.scrollTo(0,0); }; window.addEventListener('hashchange',on); return ()=>window.removeEventListener('hashchange',on); },[]);
  return route;
}
function go(to){ window.location.hash=to; }

const ALL_SCREENS=[
  ['Site Público',[['Home','#/site/home'],['Supply Chain Finance','#/site/scf'],['Procurement','#/site/proc'],['Produtos da China','#/site/motos'],['Sobre','#/site/sobre'],['FAQ','#/site/faq'],['Contato','#/site/contato'],['Obrigado','#/site/obrigado']]],
  ['Painel Admin',[['Login','#/admin/login'],['Dashboard','#/admin/dashboard'],['CRM Kanban','#/admin/crm'],['CRM Lista','#/admin/lista'],['Interações','#/admin/interacoes'],['Relatórios IA','#/admin/relatorios'],['Empresas','#/admin/empresas'],['Clientes','#/admin/clientes'],['Documentos','#/admin/documentos'],['Produtos','#/admin/produtos'],['Tarefas','#/admin/tarefas'],['Notificações','#/admin/notificacoes'],['Agentes IA','#/admin/agentes'],['Configurações','#/admin/config']]],
  ['Área do Cliente',[['Login / 1º acesso','#/cliente/login'],['Dashboard','#/cliente/dashboard'],['Oportunidades','#/cliente/oportunidades'],['Checklist','#/cliente/checklist'],['Upload','#/cliente/upload'],['Ficha cadastral','#/cliente/ficha'],['Mensagens','#/cliente/chat'],['Notificações','#/cliente/notificacoes'],['Perfil','#/cliente/perfil']]],
];

function ScreenIndex({ route }){
  const [open,setOpen]=apUseState(false);
  if(route==='#/'||route==='') return null;
  const onSite=route.startsWith('#/site');
  const side = onSite ? {left:18} : {right:18};
  return (<>
    <button onClick={()=>setOpen(o=>!o)} title="Índice de telas" style={{position:'fixed',...side,bottom:18,zIndex:70,width:44,height:44,borderRadius:10,background:'var(--bg-3)',border:'1px solid var(--line-strong)',color:'var(--tx)',display:'grid',placeItems:'center',boxShadow:'0 6px 20px rgba(0,0,0,.4)'}}><Icon name={open?'x':'layers'} size={19}/></button>
    {open && <div className="fade" style={{position:'fixed',...side,bottom:74,zIndex:70,width:280,maxHeight:'70vh',overflow:'auto',background:'var(--bg-1)',border:'1px solid var(--line)',borderRadius:12,boxShadow:'0 24px 70px rgba(0,0,0,.6)',padding:'14px'}}>
      <div className="row center" style={{justifyContent:'space-between',marginBottom:10}}><a href="#/" onClick={()=>setOpen(false)} className="row gap6 center" style={{fontSize:12.5,fontWeight:700}}><Logo h={15}/></a><span className="tag">Índice</span></div>
      {ALL_SCREENS.map(([g,items])=><div key={g} style={{marginBottom:12}}>
        <div className="tag" style={{color:'var(--lime)',marginBottom:4}}>{g}</div>
        {items.map(([l,h])=><a key={h} href={h} onClick={()=>setOpen(false)} className="row center" style={{justifyContent:'space-between',padding:'6px 8px',borderRadius:5,fontSize:12.5,fontWeight:500,color:route===h?'var(--tx)':'var(--tx-dim)',background:route===h?'rgba(195,249,41,.08)':'transparent'}}>{l}{route===h&&<span className="sdot" style={{background:'var(--lime)'}}></span>}</a>)}
      </div>)}
    </div>}
  </>);
}

function Launcher(){
  const cards=[
    { ic:'globe', t:'Site Público', d:'Home, unidades de negócio, FAQ e o Agente TradeK flutuante.', h:'#/site/home', n:'8 telas', feat:true },
    { ic:'dashboard', t:'Painel Admin', d:'CRM Kanban/Lista, modal do lead, documentos, relatórios IA e configurações.', h:'#/admin/dashboard', n:'14 telas' },
    { ic:'user', t:'Área do Cliente', d:'Portal seguro: documentos, ficha cadastral, chat e acompanhamento.', h:'#/cliente/login', n:'9 telas' },
  ];
  return (<div style={{minHeight:'100vh',display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>
    <div className="tk-grid" style={{position:'absolute',inset:0,opacity:.4}}></div>
    <div style={{position:'absolute',top:-180,left:'30%',width:600,height:600,background:'radial-gradient(circle,rgba(195,249,41,.1),transparent 60%)'}}></div>
    <header style={{position:'relative',padding:'24px 40px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <Logo h={24}/><span className="tag">Plataforma · Protótipo navegável</span>
    </header>
    <div style={{position:'relative',flex:1,display:'flex',flexDirection:'column',justifyContent:'center',maxWidth:1100,margin:'0 auto',padding:'0 40px',width:'100%'}}>
      <div className="eyebrow fade">TradeK OS</div>
      <h1 className="disp fade" style={{fontSize:'clamp(40px,6vw,72px)',fontWeight:600,letterSpacing:'-.03em',lineHeight:1,margin:'20px 0 0',maxWidth:'16ch'}}>O sistema operacional do trade <span style={{color:'var(--lime)'}}>China–Brasil.</span></h1>
      <p className="muted fade" style={{fontSize:17,lineHeight:1.55,maxWidth:'56ch',marginTop:22}}>Três superfícies, um sistema: captação com IA no site, CRM operacional no painel, e um portal seguro para o cliente. Escolha por onde explorar.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginTop:44}}>
        {cards.map(c=><a key={c.h} href={c.h} className={"unit-card fade"+(c.feat?" feat":"")} style={{padding:'24px 22px'}}>
          <div className="row center" style={{justifyContent:'space-between'}}><span style={{width:42,height:42,borderRadius:10,background:c.feat?'rgba(10,11,10,.12)':'var(--bg-3)',display:'grid',placeItems:'center'}}><Icon name={c.ic} size={20}/></span><span className="mono" style={{fontSize:11,opacity:.6}}>{c.n}</span></div>
          <div className="disp" style={{fontSize:21,fontWeight:600,marginTop:20}}>{c.t}</div>
          <div style={{fontSize:13.5,lineHeight:1.5,marginTop:8,opacity:c.feat?.74:1,color:c.feat?'inherit':'var(--tx-dim)'}}>{c.d}</div>
          <div className="row gap6 center" style={{marginTop:18,fontSize:13,fontWeight:700}}>Explorar <Icon name="arrowR" size={14}/></div>
        </a>)}
      </div>
    </div>
    <footer style={{position:'relative',padding:'24px 40px',textAlign:'center',fontSize:12,color:'var(--tx-mute)'}} className="mono">CHINA → BRASIL · SUPPLY CHAIN FINANCE · PROCUREMENT · MOBILIDADE ELÉTRICA</footer>
  </div>);
}

function App(){
  const route=useHashRoute();
  const [agentSignal,setAgentSignal]=apUseState(0);
  const [leadOpen,setLeadOpen]=apUseState(null); // leadId | 'new' | null
  const openAgent=()=>setAgentSignal(s=>s+1);
  const openLead=(id)=>setLeadOpen(id);

  // admin content router
  function adminContent(){
    if(route==='#/admin/crm') return <AdminKanban openLead={openLead}/>;
    if(route==='#/admin/lista') return <AdminLista openLead={openLead}/>;
    if(route==='#/admin/interacoes') return <AdminInteracoes openLead={openLead}/>;
    if(route==='#/admin/relatorios') return <AdminRelatorios/>;
    if(route==='#/admin/empresas') return <AdminEmpresas/>;
    if(route==='#/admin/clientes') return <AdminClientes openLead={openLead}/>;
    if(route==='#/admin/documentos') return <AdminDocumentos/>;
    if(route==='#/admin/produtos') return <AdminProdutos/>;
    if(route==='#/admin/tarefas') return <AdminTarefas/>;
    if(route==='#/admin/notificacoes') return <AdminNotificacoes/>;
    if(route==='#/admin/agentes') return <AdminAgentes/>;
    if(route==='#/admin/config') return <AdminConfig/>;
    return <AdminDashboard openLead={openLead}/>;
  }

  let body;
  if(route.startsWith('#/site')){
    body=<><SiteShell route={route} openAgent={openAgent}/><AgentWidget openSignal={agentSignal} onLead={()=>{}}/></>;
  } else if(route==='#/admin/login'){
    body=<AdminLogin/>;
  } else if(route.startsWith('#/admin')){
    body=<><AdminShell route={route} openLead={openLead}>{adminContent()}</AdminShell>
      {leadOpen && leadOpen!=='new' && <LeadModal leadId={leadOpen} onClose={()=>setLeadOpen(null)} go={go}/>}
      {leadOpen==='new' && <NewLeadModal onClose={()=>setLeadOpen(null)}/>}</>;
  } else if(route.startsWith('#/cliente')){
    body=<ClientArea route={route}/>;
  } else {
    body=<Launcher/>;
  }

  return (<>{body}<ScreenIndex route={route}/></>);
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
