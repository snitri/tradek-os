/* ============================================================
   TradeK OS — Agente TradeK (functional floating chat)
   ============================================================ */
const { useState:agUseState, useRef:agUseRef, useEffect:agUseEffect } = React;

const AGENT_FLOWS = {
  start:{ bot:["Olá, sou o agente virtual da TradeK. 👋","Posso ajudar com importação, financiamento, fornecedores ou produtos. Por onde começamos?"],
    quick:[
      { label:'Importar com prazo', unit:'SCF', next:'scf_intro' },
      { label:'Encontrar fornecedor', unit:'PROC', next:'proc_intro' },
      { label:'Comprar p/ revender', unit:'MOTOS', next:'motos_intro' },
      { label:'Já sou cliente', next:'client' },
    ] },
  scf_intro:{ bot:["Ótimo. Com o Supply Chain Finance você importa da Ásia e paga em 90–180 dias, preservando seu capital de giro.","Para uma avaliação inicial, qual o seu nome?"], type:'text', key:'nome', ph:'Seu nome', next:'empresa' },
  proc_intro:{ bot:["Perfeito. No Procurement Internacional encontramos, validamos e negociamos fornecedores para você.","Para começar o briefing — qual o seu nome?"], type:'text', key:'nome', ph:'Seu nome', next:'empresa' },
  motos_intro:{ bot:["Show. Temos um catálogo de produtos de fornecedores da China para você comprar em lote e revender no Brasil.","Para te enviar as opções certas — qual o seu nome?"], type:'text', key:'nome', ph:'Seu nome', next:'empresa' },
  empresa:{ bot:p=>[`Prazer, ${p.nome.split(' ')[0]}! Qual o nome da sua empresa?`], type:'text', key:'empresa', ph:'Razão social ou nome fantasia', next:'cnpj' },
  cnpj:{ bot:["Tem o CNPJ em mãos? (pode pular se preferir)"], type:'text', key:'cnpj', ph:'00.000.000/0000-00', optional:true, next:'contato' },
  contato:{ bot:["Para nossa equipe retornar, qual o melhor e-mail e WhatsApp?"], type:'text', key:'contato', ph:'email@empresa.com · +55 ...', next:'demanda' },
  demanda:{ bot:p=>[demandaQ(p.unit)], type:'text', key:'demanda', ph:'Descreva em poucas palavras', next:'valor' },
  valor:{ bot:p=>[valorQ(p.unit)], type:'text', key:'valor', ph:'Valor, volume ou quantidade', next:'consent' },
  consent:{ bot:["Quase lá! Você autoriza o contato da TradeK e o tratamento dos seus dados conforme a LGPD?"],
    quick:[ { label:'Sim, autorizo', next:'confirm' }, { label:'Tenho dúvidas', next:'confirm' } ] },
  confirm:{ bot:["Perfeito. Confira o resumo do que registrei:"], type:'confirm', next:'done' },
  done:{ bot:[], type:'done' },
  client:{ bot:["Que bom te ver de novo! Você pode acessar o Portal do Cliente para enviar documentos e acompanhar sua solicitação."], type:'portal' },
};
function demandaQ(u){ return u==='SCF'?'O que você pretende importar e de qual fornecedor/país?' : u==='PROC'?'Qual produto/categoria você precisa encontrar?' : 'Qual produto do catálogo (ou categoria) te interessa para revender?'; }
function valorQ(u){ return u==='SCF'?'Qual o valor FOB estimado da importação?' : u==='PROC'?'Qual o volume e o orçamento-alvo?' : 'Qual o tamanho do lote / quantidade pretendida?'; }

function AgentWidget({ openSignal, onLead }){
  const [open,setOpen]=agUseState(false);
  const [stepId,setStepId]=agUseState('start');
  const [msgs,setMsgs]=agUseState([]);
  const [data,setData]=agUseState({ unit:null });
  const [input,setInput]=agUseState('');
  const [typing,setTyping]=agUseState(false);
  const [leadId,setLeadId]=agUseState(null);
  const bodyRef=agUseRef(null);
  const startedRef=agUseRef(false);

  agUseEffect(()=>{ if(openSignal>0){ setOpen(true); } },[openSignal]);

  agUseEffect(()=>{ if(open && !startedRef.current){ startedRef.current=true; pushBot('start'); } },[open]);
  agUseEffect(()=>{ if(bodyRef.current) bodyRef.current.scrollTop=bodyRef.current.scrollHeight; },[msgs,typing]);

  function botLines(step,d){ const b=AGENT_FLOWS[step].bot; return (typeof b==='function'?b(d):b); }

  function pushBot(step, d){
    const dd = d||data;
    const lines = botLines(step,dd);
    setTyping(true);
    let i=0;
    const addNext=()=>{
      if(i<lines.length){
        setMsgs(m=>[...m,{ from:'bot', text:lines[i] }]);
        i++; setTimeout(addNext, 520);
      } else {
        setTyping(false);
        setStepId(step);
      }
    };
    setTimeout(addNext, 420);
  }

  function choose(opt){
    setMsgs(m=>[...m,{ from:'user', text:opt.label }]);
    const d2={ ...data, ...(opt.unit?{unit:opt.unit}:{}) };
    setData(d2);
    if(opt.next==='confirm') return pushBot('confirm',d2);
    setTimeout(()=>pushBot(opt.next,d2), 200);
  }

  function submitText(){
    const step=AGENT_FLOWS[stepId];
    if(!input.trim() && !step.optional) return;
    const val=input.trim()|| (step.optional?'(pular)':'');
    setMsgs(m=>[...m,{ from:'user', text:val }]);
    const d2={ ...data, [step.key]:val };
    setData(d2); setInput('');
    setTimeout(()=>pushBot(step.next,d2), 200);
  }

  function createLead(){
    const id='TK-'+(2042+Math.floor(Math.random()*40));
    setLeadId(id);
    setMsgs(m=>[...m,{ from:'user', text:'Confirmar e enviar' }]);
    setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      setMsgs(m=>[...m,{ from:'bot', text:`Pronto! Registrei sua solicitação como ${id}. ✅` },
        { from:'bot', text:'Nossa equipe vai analisar e retornar com o próximo passo. Se necessário, você receberá um convite para o Portal do Cliente.' }]);
      setStepId('finished');
      onLead && onLead({ id, ...data });
    },900);
  }

  const step=AGENT_FLOWS[stepId];
  const unitMeta = data.unit? UNITS[data.unit] : null;

  return (<>
    {/* launcher */}
    <button onClick={()=>setOpen(o=>!o)} aria-label="Agente TradeK"
      style={{position:'fixed',right:24,bottom:24,zIndex:60,width:58,height:58,borderRadius:'50%',
        background:'var(--lime)',color:'#0A0B0A',display:'grid',placeItems:'center',
        boxShadow:'0 8px 30px rgba(195,249,41,.32), 0 2px 8px rgba(0,0,0,.4)',transition:'.2s'}}>
      <Icon name={open?'chevD':'chat'} size={24} stroke={2.4}/>
    </button>

    {open && (<div className="fade" style={{position:'fixed',right:24,bottom:94,zIndex:60,width:380,maxWidth:'calc(100vw - 32px)',
      height:560,maxHeight:'calc(100vh - 130px)',background:'var(--bg-1)',border:'1px solid var(--line)',
      borderRadius:12,display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 24px 70px rgba(0,0,0,.6)'}}>
      {/* header */}
      <div style={{padding:'14px 16px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',gap:11,background:'var(--bg-2)'}}>
        <span style={{width:36,height:36,borderRadius:'50%',background:'var(--lime)',color:'#0A0B0A',display:'grid',placeItems:'center'}}><Icon name="zap" size={18} stroke={2.4}/></span>
        <div style={{lineHeight:1.25}}>
          <div style={{fontWeight:700,fontSize:14}}>Agente TradeK</div>
          <div className="row gap6" style={{fontSize:11,color:'var(--tx-mute)'}}><span className="sdot" style={{background:'var(--ok)'}}></span> Online · responde na hora</div>
        </div>
        {unitMeta && <span className="mla pill pill--lime">{unitMeta.short}</span>}
        <button className="btn btn--icon" style={{marginLeft:unitMeta?8:'auto'}} onClick={()=>setOpen(false)}><Icon name="x" size={16}/></button>
      </div>
      {/* body */}
      <div ref={bodyRef} className="scroll" style={{flex:1,padding:'16px',display:'flex',flexDirection:'column',gap:10}}>
        {msgs.map((m,i)=> m.from==='bot'
          ? <div key={i} className="fade" style={{alignSelf:'flex-start',maxWidth:'85%',background:'var(--bg-3)',border:'1px solid var(--line-soft)',padding:'10px 13px',borderRadius:'4px 12px 12px 12px',fontSize:13.5,lineHeight:1.5,color:'var(--tx)'}}>{m.text}</div>
          : <div key={i} className="fade" style={{alignSelf:'flex-end',maxWidth:'85%',background:'var(--lime)',color:'#0A0B0A',padding:'10px 13px',borderRadius:'12px 4px 12px 12px',fontSize:13.5,lineHeight:1.5,fontWeight:600}}>{m.text}</div>
        )}
        {typing && <div style={{alignSelf:'flex-start',background:'var(--bg-3)',border:'1px solid var(--line-soft)',padding:'12px 14px',borderRadius:'4px 12px 12px 12px'}}><span className="ag-typing"><i></i><i></i><i></i></span></div>}

        {/* confirm card */}
        {stepId==='confirm' && !typing && (<div className="fade" style={{alignSelf:'stretch',background:'var(--bg-2)',border:'1px solid var(--lime-dim2)',borderRadius:8,padding:14,marginTop:4}}>
          <div className="tag" style={{marginBottom:10}}>RESUMO DA SOLICITAÇÃO</div>
          {[['Unidade',unitMeta?unitMeta.label:'—'],['Nome',data.nome],['Empresa',data.empresa],['CNPJ',data.cnpj||'—'],['Contato',data.contato],['Demanda',data.demanda],['Valor / volume',data.valor]].map(([k,v])=>
            <div key={k} className="row" style={{padding:'5px 0',borderBottom:'1px solid var(--line-soft)',fontSize:12.5}}><span style={{color:'var(--tx-mute)',width:104,flexShrink:0}}>{k}</span><span style={{color:'var(--tx)',fontWeight:600}}>{v||'—'}</span></div>)}
          <Btn variant="lime" className="btn--block" style={{marginTop:12}} icon="check" onClick={createLead}>Confirmar e enviar</Btn>
        </div>)}

        {stepId==='portal' && !typing && (<div className="fade" style={{alignSelf:'stretch',marginTop:4}}>
          <a className="btn btn--lime btn--block" href="#/cliente/login">Ir para o Portal do Cliente <Icon name="arrowR" size={15}/></a>
        </div>)}

        {stepId==='finished' && leadId && (<div className="fade" style={{alignSelf:'stretch',marginTop:4,display:'flex',gap:8}}>
          <a className="btn btn--ghost" style={{flex:1}} href="#/site/obrigado">Ver confirmação</a>
          <Btn variant="dark" style={{flex:1}} onClick={()=>{ setMsgs([]); setData({unit:null}); startedRef.current=false; setStepId('start'); setLeadId(null); pushBot('start'); }}>Nova conversa</Btn>
        </div>)}
      </div>
      {/* input area */}
      {!typing && step && step.quick && (<div style={{padding:'10px 12px',borderTop:'1px solid var(--line)',display:'flex',flexWrap:'wrap',gap:7}}>
        {step.quick.map(q=><button key={q.label} onClick={()=>choose(q)} className="btn btn--ghost btn--sm">{q.label}</button>)}
      </div>)}
      {!typing && step && step.type==='text' && (<div style={{padding:'10px 12px',borderTop:'1px solid var(--line)',display:'flex',gap:8}}>
        <input className="input" autoFocus value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submitText()} placeholder={step.ph}/>
        <Btn variant="lime" className="btn--icon" onClick={submitText}><Icon name="send" size={16}/></Btn>
      </div>)}
      {!typing && step && step.optional && step.type==='text' && (<div style={{padding:'0 12px 10px',marginTop:-4}}><button className="faint" style={{fontSize:11.5,fontWeight:600}} onClick={()=>{ setInput(''); const s=AGENT_FLOWS[stepId]; setMsgs(m=>[...m,{from:'user',text:'Pular'}]); const d2={...data}; setTimeout(()=>pushBot(s.next,d2),150); }}>Pular esta pergunta →</button></div>)}
    </div>)}

    <style>{`
      .ag-typing{ display:inline-flex; gap:4px; }
      .ag-typing i{ width:6px; height:6px; border-radius:50%; background:var(--tx-mute); animation:agb 1s infinite; }
      .ag-typing i:nth-child(2){ animation-delay:.15s; } .ag-typing i:nth-child(3){ animation-delay:.3s; }
      @keyframes agb{ 0%,60%,100%{ opacity:.3; transform:translateY(0);} 30%{ opacity:1; transform:translateY(-3px);} }
    `}</style>
  </>);
}
Object.assign(window, { AgentWidget });
