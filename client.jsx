/* ============================================================
   TradeK OS — Área do Cliente (portal seguro)
   ============================================================ */
const { useState:clUseState } = React;

/* status visível ao cliente */
function clientStatus(k){ const m=statusMeta(k); return m.cliente; }
const CLIENT_LEAD = LEADS.find(l=>l.id==='TK-2041'); // Yamane — SCF

/* ---------------- LOGIN ---------------- */
function ClientLogin(){
  const [primeiro,setPrimeiro]=clUseState(false);
  return (<div style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:20,position:'relative',overflow:'hidden'}}>
    <div className="tk-grid" style={{position:'absolute',inset:0,opacity:.35}}></div>
    <div style={{position:'absolute',top:-160,right:-120,width:520,height:520,background:'radial-gradient(circle,rgba(195,249,41,.08),transparent 65%)'}}></div>
    <div className="fade" style={{position:'relative',width:420,maxWidth:'100%'}}>
      <div style={{textAlign:'center',marginBottom:28}}><Logo h={26}/><div className="tag" style={{marginTop:12}}>Portal do Cliente</div></div>
      <div className="panel panel-b" style={{padding:28}}>
        {!primeiro ? (<>
          <h2 className="disp" style={{fontSize:22,fontWeight:600,margin:'0 0 4px'}}>Bem-vindo de volta</h2>
          <p className="muted" style={{fontSize:13.5,margin:'0 0 22px'}}>Acesse para enviar documentos e acompanhar sua solicitação.</p>
          <div className="col gap14">
            <div className="field"><label>E-mail</label><input className="input" defaultValue="ricardo@yamaneimp.com.br"/></div>
            <div className="field"><label>Senha</label><input className="input" type="password" defaultValue="••••••••"/></div>
            <div className="row center" style={{justifyContent:'space-between'}}><label className="row gap8 center" style={{fontSize:12.5,color:'var(--tx-dim)'}}><input type="checkbox" style={{accentColor:'var(--lime)'}} defaultChecked/> Lembrar</label><a href="#" className="lime" style={{fontSize:12.5,fontWeight:600}}>Esqueci a senha</a></div>
            <a href="#/cliente/dashboard" className="btn btn--lime btn--block" style={{marginTop:4}}>Entrar</a>
          </div>
          <div className="hr" style={{margin:'22px 0'}}></div>
          <button onClick={()=>setPrimeiro(true)} className="row gap6 center faint" style={{fontSize:12.5,fontWeight:600,justifyContent:'center',width:'100%'}}>Recebi um convite — criar senha <Icon name="arrowR" size={13}/></button>
        </>) : (<>
          <div className="row gap8 center" style={{marginBottom:4}}><Icon name="shield" size={16} style={{color:'var(--lime)'}}/><h2 className="disp" style={{fontSize:22,fontWeight:600,margin:0}}>Primeiro acesso</h2></div>
          <p className="muted" style={{fontSize:13.5,margin:'4px 0 22px'}}>Crie sua senha e aceite os termos para continuar.</p>
          <div className="col gap14">
            <div className="field"><label>Nova senha</label><input className="input" type="password" placeholder="Mínimo 8 caracteres"/></div>
            <div className="field"><label>Confirmar senha</label><input className="input" type="password" placeholder="Repita a senha"/></div>
            <label className="row gap8 center" style={{fontSize:12.5,color:'var(--tx-dim)'}}><input type="checkbox" style={{accentColor:'var(--lime)'}}/> Aceito os Termos de Uso</label>
            <label className="row gap8 center" style={{fontSize:12.5,color:'var(--tx-dim)'}}><input type="checkbox" style={{accentColor:'var(--lime)'}}/> Aceito a Política de Privacidade (LGPD)</label>
            <a href="#/cliente/dashboard" className="btn btn--lime btn--block" style={{marginTop:4}}>Criar senha e acessar</a>
          </div>
          <button onClick={()=>setPrimeiro(false)} className="faint" style={{fontSize:12.5,fontWeight:600,marginTop:18,width:'100%'}}>← Voltar ao login</button>
        </>)}
      </div>
      <p className="faint" style={{fontSize:11,textAlign:'center',marginTop:16,lineHeight:1.5}}>Você vê apenas seus próprios dados. Ambiente seguro TradeK.</p>
    </div>
  </div>);
}

/* ---------------- SHELL ---------------- */
const CLIENT_NAV=[['home','Início','#/cliente/dashboard'],['layers','Oportunidades','#/cliente/oportunidades'],['file','Documentos','#/cliente/checklist'],['building','Ficha cadastral','#/cliente/ficha'],['chat','Mensagens','#/cliente/chat'],['bell','Notificações','#/cliente/notificacoes']];
function ClientShell({ route, children }){
  return (<div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
    <header style={{position:'sticky',top:0,zIndex:40,background:'rgba(10,11,10,.85)',backdropFilter:'blur(14px)',borderBottom:'1px solid var(--line)'}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'12px 32px',display:'flex',alignItems:'center',gap:20}}>
        <a href="#/cliente/dashboard"><Logo h={20}/></a>
        <span className="pill pill--lime" style={{fontSize:10}}>Portal do cliente</span>
        <nav className="row gap2 mla">{CLIENT_NAV.map(([ic,l,h])=>{ const on=route===h||(h==='#/cliente/checklist'&&route==='#/cliente/upload');
          return <a key={h} href={h} className="row gap8 center" style={{padding:'8px 12px',borderRadius:6,fontSize:12.5,fontWeight:600,color:on?'var(--tx)':'var(--tx-mute)',background:on?'rgba(255,255,255,.05)':'transparent'}}><Icon name={ic} size={14}/>{l}</a>; })}</nav>
        <div className="row gap10 center" style={{paddingLeft:8,borderLeft:'1px solid var(--line)'}}><Avatar name="Ricardo Yamane" size={28} tone="lime"/><a href="#/cliente/perfil" className="col" style={{lineHeight:1.2}}><span style={{fontSize:12.5,fontWeight:700}}>Ricardo Y.</span><span className="tag">Yamane Imp.</span></a></div>
      </div>
    </header>
    <main className="fill" style={{maxWidth:1100,margin:'0 auto',padding:'32px',width:'100%'}}>{children}</main>
    <footer style={{borderTop:'1px solid var(--line-soft)',padding:'18px 32px',textAlign:'center',fontSize:11.5,color:'var(--tx-mute)'}}>© 2026 TradeK · Ambiente seguro · <a href="#/site/home" className="lime">Site público</a></footer>
  </div>);
}

/* ---------------- DASHBOARD ---------------- */
function ClientDashboard(){
  const l=CLIENT_LEAD;
  const pend=DOCS_CHECKLIST.filter(d=>d.status==='pendente'||d.status==='reprovado');
  return (<div className="fade">
    <div className="row center gap8"><span style={{fontSize:13,color:'var(--tx-mute)'}}>Olá,</span><h1 className="disp" style={{fontSize:26,fontWeight:600,margin:0}}>Ricardo 👋</h1></div>
    <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:14,marginTop:20}}>
      {/* main opportunity card */}
      <div className="panel" style={{overflow:'hidden'}}>
        <div className="panel-b" style={{background:'linear-gradient(180deg,rgba(195,249,41,.05),transparent)'}}>
          <div className="row center gap8"><span className="pill pill--lime"><Icon name="coins" size={12}/>Supply Chain Finance</span><span className="tag mla">{l.id}</span></div>
          <h2 className="disp" style={{fontSize:21,fontWeight:600,margin:'14px 0 0'}}>Importação da China — Acessórios eletrônicos</h2>
          <div className="row gap20" style={{marginTop:18}}>
            <div><div className="tag">Status atual</div><div className="row gap6 center" style={{marginTop:4}}><span className="sdot" style={{background:'var(--purple)'}}></span><span style={{fontSize:14,fontWeight:700}}>{clientStatus(l.status)}</span></div></div>
            <div><div className="tag">Valor FOB</div><div className="mono" style={{fontSize:14,fontWeight:700,marginTop:4}}>{l.fob}</div></div>
            <div><div className="tag">Prazo desejado</div><div style={{fontSize:14,fontWeight:700,marginTop:4}}>{l.prazoDes}</div></div>
          </div>
          {/* progress */}
          <div style={{marginTop:20}}>
            <div className="row center" style={{justifyContent:'space-between',marginBottom:8}}>{['Recebida','Em preparação','Documentos','Análise','Proposta'].map((s,i)=><div key={s} className="col center" style={{flex:1,gap:6}}><span style={{width:18,height:18,borderRadius:'50%',background:i<=2?'var(--lime)':'var(--bg-3)',border:'1px solid '+(i<=2?'var(--lime)':'var(--line)'),display:'grid',placeItems:'center'}}>{i<2&&<Icon name="check" size={11} style={{color:'#0A0B0A'}}/>}{i===2&&<span style={{width:6,height:6,borderRadius:'50%',background:'#0A0B0A'}}></span>}</span><span style={{fontSize:10,color:i<=2?'var(--tx)':'var(--tx-mute)',fontWeight:600,textAlign:'center'}}>{s}</span></div>)}</div>
            <div style={{height:3,background:'var(--bg-3)',borderRadius:99,position:'relative'}}><div style={{position:'absolute',left:'10%',right:'50%',height:'100%',background:'var(--lime)',borderRadius:99}}></div></div>
          </div>
        </div>
        <div className="panel-b" style={{borderTop:'1px solid var(--line-soft)',background:'var(--bg-2)'}}>
          <div className="row gap8 center" style={{marginBottom:4}}><Icon name="target" size={15} style={{color:'var(--lime)'}}/><span className="tag" style={{color:'var(--lime)'}}>Próximo passo</span></div>
          <p style={{fontSize:14,margin:'0 0 14px',fontWeight:500}}>Envie os documentos pendentes para que possamos avançar com a análise.</p>
          <a href="#/cliente/checklist" className="btn btn--lime btn--sm"><Icon name="upload" size={13}/> Enviar documentos</a>
        </div>
      </div>
      {/* side: pendencias + actions */}
      <div className="col gap14">
        <div className="panel">
          <div className="panel-h"><h3>Pendências</h3><span className="pill pill--warn">{pend.length}</span></div>
          <div className="panel-b col gap10" style={{padding:'12px 14px'}}>
            {pend.map(d=><div key={d.nome} className="row center gap10" style={{fontSize:13}}><span style={{width:16,height:16,border:'1.5px solid '+(d.status==='reprovado'?'var(--danger)':'var(--warn)'),borderRadius:4,flexShrink:0}}></span><span style={{flex:1}}>{d.nome}</span><a href="#/cliente/upload" className="lime" style={{fontSize:11.5,fontWeight:700}}>Enviar</a></div>)}
            <div className="row center gap10" style={{fontSize:13,opacity:.5}}><span style={{width:16,height:16,borderRadius:4,background:'var(--lime)',display:'grid',placeItems:'center',flexShrink:0}}><Icon name="check" size={11} style={{color:'#0A0B0A'}}/></span><span style={{flex:1,textDecoration:'line-through'}}>RG/CPF Representante</span></div>
          </div>
        </div>
        <div className="panel panel-b col gap8">
          <div className="tag" style={{marginBottom:4}}>Atalhos</div>
          <a href="#/cliente/chat" className="row gap10 center" style={{fontSize:13,fontWeight:600,padding:'8px 0'}}><Icon name="chat" size={15} style={{color:'var(--lime)'}}/>Falar com a TradeK<Icon name="chevR" size={14} className="mla" style={{color:'var(--tx-faint)'}}/></a>
          <div className="hr"></div>
          <a href="#/cliente/ficha" className="row gap10 center" style={{fontSize:13,fontWeight:600,padding:'8px 0'}}><Icon name="building" size={15} style={{color:'var(--lime)'}}/>Ficha cadastral<Icon name="chevR" size={14} className="mla" style={{color:'var(--tx-faint)'}}/></a>
        </div>
      </div>
    </div>
    {/* recent messages */}
    <div className="panel" style={{marginTop:14}}>
      <div className="panel-h"><h3>Mensagens recentes</h3><a href="#/cliente/chat" className="lime" style={{fontSize:11.5,fontWeight:700}}>Ver tudo</a></div>
      <div className="panel-b col gap10">
        {CLIENT_DOCS_MSG.slice(0,2).map((m,i)=><div key={i} className="row gap10"><Avatar name={m.who==='tradek'?'TradeK':'Ricardo Yamane'} size={28} tone={m.who==='tradek'?'lime':null}/><div className="col" style={{lineHeight:1.45}}><span style={{fontSize:12.5}}><b>{m.who==='tradek'?'TradeK':'Você'}</b> · <span className="tag">{m.t}</span></span><span className="muted" style={{fontSize:13}}>{m.msg}</span></div></div>)}
      </div>
    </div>
  </div>);
}

/* ---------------- OPORTUNIDADES ---------------- */
function ClientOportunidades(){
  const ops=[CLIENT_LEAD,{...LEADS.find(l=>l.id==='TK-2030'),portalView:true}];
  return (<div className="fade">
    <h1 className="disp" style={{fontSize:24,fontWeight:600,margin:'0 0 4px'}}>Minhas oportunidades</h1>
    <p className="muted" style={{fontSize:13.5,margin:'0 0 22px'}}>Acompanhe o andamento das suas solicitações.</p>
    <div className="col gap12">
      {ops.map((l,i)=><div key={i} className="panel panel-b row center gap16">
        <span style={{width:46,height:46,borderRadius:10,background:'var(--bg)',border:'1px solid var(--line)',display:'grid',placeItems:'center',color:UNITS[l.unit].color,flexShrink:0}}><Icon name={UNITS[l.unit].icon} size={22}/></span>
        <div className="col fill" style={{lineHeight:1.4}}>
          <div className="row gap8 center"><span className="disp" style={{fontSize:16,fontWeight:600}}>{UNITS[l.unit].label}</span><span className="tag">· {l.id}</span></div>
          <span className="muted" style={{fontSize:13}}>{l.unit==='SCF'?l.produto:'Importação'} · atualizado {l.ult}</span>
        </div>
        <div className="col" style={{textAlign:'right',gap:6}}>
          <span className="pill" style={{borderColor:'var(--purple)',color:'var(--purple)'}}><span className="dot"></span>{clientStatus(l.status)}</span>
          <span className="tag">Próximo: {l.unit==='SCF'?'Enviar docs':'Aguardar análise'}</span>
        </div>
        <a href="#/cliente/checklist" className="btn btn--dark btn--sm" style={{flexShrink:0}}>Abrir <Icon name="arrowR" size={13}/></a>
      </div>)}
    </div>
  </div>);
}

/* ---------------- CHECKLIST ---------------- */
function ClientChecklist(){
  return (<div className="fade">
    <a href="#/cliente/dashboard" className="row gap6 faint" style={{fontSize:12.5,fontWeight:600,marginBottom:16}}><Icon name="chevL" size={14}/> Início</a>
    <div className="row center" style={{justifyContent:'space-between'}}>
      <div><h1 className="disp" style={{fontSize:24,fontWeight:600,margin:0}}>Documentos</h1><p className="muted" style={{fontSize:13.5,margin:'4px 0 0'}}>Supply Chain Finance · {CLIENT_LEAD.id}</p></div>
      <div className="col" style={{textAlign:'right'}}><div className="tag">Progresso</div><div className="disp lime" style={{fontSize:22,fontWeight:600}}>3 / 6</div></div>
    </div>
    <div style={{height:6,background:'var(--bg-3)',borderRadius:99,margin:'18px 0 22px'}}><div style={{height:'100%',width:'50%',background:'var(--lime)',borderRadius:99}}></div></div>
    <div className="col gap10">
      {DOCS_CHECKLIST.map(d=>{ const s=DOC_STATUS[d.status];
        return <div key={d.nome} className="panel panel-b">
          <div className="row center gap14">
            <span style={{width:38,height:38,borderRadius:9,background:'var(--bg)',display:'grid',placeItems:'center',flexShrink:0,color:d.status==='aprovado'?'var(--ok)':d.status==='reprovado'?'var(--danger)':'var(--tx-mute)'}}><Icon name={d.status==='aprovado'?'check':'doc'} size={18}/></span>
            <div className="col fill" style={{lineHeight:1.4,minWidth:0}}>
              <span style={{fontSize:14,fontWeight:600}}>{d.nome}</span>
              <span className="muted" style={{fontSize:12.5}}>{d.desc} · <span className="tag">{d.fmt}</span></span>
            </div>
            <Pill variant={s.variant}>{s.label}</Pill>
            {(d.status==='pendente'||d.status==='reprovado')
              ? <a href="#/cliente/upload" className="btn btn--lime btn--sm" style={{flexShrink:0}}><Icon name="upload" size={13}/> Enviar</a>
              : <button className="btn btn--dark btn--sm" style={{flexShrink:0}}><Icon name="eye" size={13}/></button>}
          </div>
          {d.status==='reprovado' && <div className="row gap8" style={{marginTop:12,padding:'10px 12px',background:'rgba(255,107,87,.08)',border:'1px solid rgba(255,107,87,.2)',borderRadius:6,fontSize:12.5,color:'var(--danger)'}}><Icon name="alert" size={14} style={{flexShrink:0,marginTop:1}}/><span>{d.motivo}</span></div>}
        </div>; })}
    </div>
  </div>);
}

/* ---------------- UPLOAD ---------------- */
function ClientUpload(){
  const [file,setFile]=clUseState(null);
  const [done,setDone]=clUseState(false);
  return (<div className="fade" style={{maxWidth:620,margin:'0 auto'}}>
    <a href="#/cliente/checklist" className="row gap6 faint" style={{fontSize:12.5,fontWeight:600,marginBottom:16}}><Icon name="chevL" size={14}/> Documentos</a>
    <h1 className="disp" style={{fontSize:24,fontWeight:600,margin:'0 0 4px'}}>Enviar documento</h1>
    <p className="muted" style={{fontSize:13.5,margin:'0 0 22px'}}>Comprovante de RADAR/Siscomex</p>
    {!done ? (<div className="panel panel-b">
      <div className="field"><label>Tipo de documento</label><select className="select"><option>RADAR / Siscomex</option><option>Contrato Social</option><option>Comprovante de Endereço</option></select></div>
      <label style={{display:'block',marginTop:16,border:'1.5px dashed '+(file?'var(--lime)':'var(--line-strong)'),borderRadius:10,padding:'34px 20px',textAlign:'center',cursor:'pointer',background:file?'rgba(195,249,41,.04)':'transparent',transition:'.15s'}}>
        <input type="file" style={{display:'none'}} onChange={e=>setFile(e.target.files[0]?.name||'documento.pdf')}/>
        <Icon name="upload" size={28} style={{color:file?'var(--lime)':'var(--tx-mute)'}}/>
        <div style={{fontSize:14,fontWeight:600,marginTop:12}}>{file||'Arraste o arquivo ou clique para selecionar'}</div>
        <div className="tag" style={{marginTop:6}}>PDF · JPG · PNG · DOCX · XLSX · até 10MB</div>
      </label>
      <div className="field" style={{marginTop:16}}><label>Observação (opcional)</label><textarea className="textarea" placeholder="Alguma observação sobre o documento…"></textarea></div>
      <Btn variant="lime" className="btn--block" style={{marginTop:16}} disabled={!file} onClick={()=>setDone(true)} icon="check">Confirmar envio</Btn>
    </div>) : (<div className="panel panel-b" style={{textAlign:'center',padding:'40px 24px'}}>
      <div style={{width:60,height:60,borderRadius:'50%',background:'var(--lime-dim)',border:'1px solid var(--lime-dim2)',display:'grid',placeItems:'center',margin:'0 auto'}}><Icon name="check" size={28} style={{color:'var(--lime)'}}/></div>
      <h2 className="disp" style={{fontSize:20,fontWeight:600,margin:'20px 0 6px'}}>Documento enviado!</h2>
      <p className="muted" style={{fontSize:13.5,margin:0}}>A equipe TradeK foi notificada e vai revisar seu documento.</p>
      <a href="#/cliente/checklist" className="btn btn--lime" style={{marginTop:20}}>Voltar aos documentos</a>
    </div>)}
  </div>);
}

/* ---------------- FICHA CADASTRAL ---------------- */
function ClientFicha(){
  const [sec,setSec]=clUseState(0);
  const secs=[['Dados da empresa',['Razão social','Nome fantasia','CNPJ','Inscrição estadual','Data de fundação','CNAE principal']],['Importações',['Possui RADAR?','Tipo de RADAR','Média de importações','Produtos importados','Países de origem']],['Endereço',['Rua / avenida','Número','Complemento','Bairro','Cidade','Estado','CEP']],['Contato',['Telefone fixo','Celular / WhatsApp','E-mail principal','E-mail secundário','Site']],['Representante legal',['Nome','CPF','Cargo','E-mail','Telefone']],['Dados bancários',['Banco principal','Agência','Conta','Tempo de conta','Banco secundário']],['Referências',['Empresa 1','Telefone 1','Empresa 2','Telefone 2']]];
  return (<div className="fade">
    <div className="row center" style={{justifyContent:'space-between'}}>
      <div><h1 className="disp" style={{fontSize:24,fontWeight:600,margin:0}}>Ficha cadastral</h1><p className="muted" style={{fontSize:13.5,margin:'4px 0 0'}}>Complete os dados da sua empresa.</p></div>
      <div className="row gap8"><button className="btn btn--dark btn--sm"><Icon name="check" size={13}/> Salvar rascunho</button><button className="btn btn--lime btn--sm">Enviar para análise</button></div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:14,marginTop:22}}>
      <div className="panel" style={{height:'fit-content',padding:8}}>{secs.map(([s],i)=><button key={s} onClick={()=>setSec(i)} className="row gap10 center" style={{width:'100%',padding:'10px 11px',borderRadius:6,fontSize:12.5,fontWeight:600,textAlign:'left',color:sec===i?'#0A0B0A':'var(--tx-dim)',background:sec===i?'var(--lime)':'transparent',marginBottom:2}}><span style={{width:18,height:18,borderRadius:'50%',border:'1px solid '+(sec===i?'#0A0B0A':'var(--line-strong)'),display:'grid',placeItems:'center',fontSize:10,flexShrink:0}}>{i<2?<Icon name="check" size={11}/>:i+1}</span>{s}</button>)}</div>
      <div className="panel panel-b">
        <div className="row center gap8" style={{marginBottom:18}}><span className="tag" style={{color:'var(--lime)'}}>Seção {sec+1} de {secs.length}</span><div className="fill hr"></div></div>
        <h3 className="disp" style={{fontSize:17,fontWeight:600,margin:'0 0 18px'}}>{secs[sec][0]}</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {secs[sec][1].map((f,i)=><div key={f} className="field" style={(f.includes('Razão')||f.includes('Produtos')||f.includes('Rua'))?{gridColumn:'span 2'}:null}><label>{f}</label>{f==='Possui RADAR?'||f==='Estado'?<select className="select">{f==='Estado'?<><option>SP</option><option>PR</option></>:<><option>Sim</option><option>Não</option></>}</select>:<input className="input" placeholder={f}/>}</div>)}
        </div>
        <div className="row center" style={{justifyContent:'space-between',marginTop:22}}>
          <button className="btn btn--dark btn--sm" disabled={sec===0} onClick={()=>setSec(s=>Math.max(0,s-1))}><Icon name="chevL" size={13}/> Anterior</button>
          <button className="btn btn--lime btn--sm" onClick={()=>setSec(s=>Math.min(secs.length-1,s+1))}>Próxima <Icon name="chevR" size={13}/></button>
        </div>
      </div>
    </div>
  </div>);
}

/* ---------------- CHAT ---------------- */
function ClientChat(){
  const [msgs,setMsgs]=clUseState(CLIENT_DOCS_MSG);
  const [input,setInput]=clUseState('');
  function send(){ if(!input.trim())return; setMsgs(m=>[...m,{who:'client',t:'agora',msg:input}]); setInput('');
    setTimeout(()=>setMsgs(m=>[...m,{who:'tradek',t:'agora',msg:'Recebido, Ricardo! Vou verificar e te retorno em instantes. 👍'}]),900); }
  return (<div className="fade" style={{maxWidth:760,margin:'0 auto'}}>
    <h1 className="disp" style={{fontSize:24,fontWeight:600,margin:'0 0 16px'}}>Mensagens</h1>
    <div className="panel" style={{display:'flex',flexDirection:'column',height:'62vh'}}>
      <div className="panel-h"><div className="row gap10 center"><Avatar name="TradeK" tone="lime" size={32}/><div className="col" style={{lineHeight:1.25}}><span style={{fontSize:13.5,fontWeight:700,color:'var(--tx)'}}>Equipe TradeK</span><span className="row gap6 center tag"><span className="sdot" style={{background:'var(--ok)'}}></span>Online</span></div></div><span className="tag">Oportunidade {CLIENT_LEAD.id}</span></div>
      <div className="scroll fill col gap12" style={{padding:18,background:'var(--bg)'}}>
        {msgs.map((m,i)=> m.who==='tradek'
          ? <div key={i} className="row gap10" style={{alignSelf:'flex-start',maxWidth:'80%'}}><Avatar name="TradeK" tone="lime" size={28}/><div style={{background:'var(--bg-3)',border:'1px solid var(--line-soft)',padding:'10px 13px',borderRadius:'4px 12px 12px 12px',fontSize:13.5,lineHeight:1.5}}>{m.msg}<div className="tag" style={{marginTop:4}}>{m.t}</div></div></div>
          : <div key={i} style={{alignSelf:'flex-end',maxWidth:'80%',background:'var(--lime)',color:'#0A0B0A',padding:'10px 13px',borderRadius:'12px 4px 12px 12px',fontSize:13.5,fontWeight:500}}>{m.msg}<div style={{fontSize:10,opacity:.6,marginTop:4,fontWeight:700}}>{m.t}</div></div>)}
      </div>
      <div className="row gap8" style={{padding:12,borderTop:'1px solid var(--line)'}}>
        <button className="btn btn--dark btn--icon"><Icon name="paperclip" size={16}/></button>
        <input className="input fill" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Digite sua mensagem…"/>
        <Btn variant="lime" onClick={send}><Icon name="send" size={16}/></Btn>
      </div>
    </div>
  </div>);
}

/* ---------------- NOTIFICAÇÕES ---------------- */
function ClientNotificacoes(){
  const items=[['file','Documento solicitado','Enviar o comprovante de RADAR/Siscomex','há 2h',true],['check','Documento aprovado','RG/CPF do representante foi aprovado','há 1d',true],['chat','Nova mensagem','A equipe TradeK respondeu sua dúvida','há 1d',false],['alert','Documento reprovado','Comprovante de endereço precisa ser reenviado','há 2d',false],['refresh','Status alterado','Sua solicitação está em "Documentos solicitados"','há 3d',false]];
  return (<div className="fade" style={{maxWidth:680,margin:'0 auto'}}>
    <div className="row center" style={{justifyContent:'space-between',marginBottom:18}}><h1 className="disp" style={{fontSize:24,fontWeight:600,margin:0}}>Notificações</h1><button className="btn btn--dark btn--sm">Marcar todas como lidas</button></div>
    <div className="col gap8">
      {items.map(([ic,t,d,time,unread],i)=><div key={i} className="panel panel-b row gap14" style={{borderColor:unread?'var(--lime-dim2)':'var(--line)'}}>
        <span style={{width:38,height:38,borderRadius:9,background:'var(--bg)',display:'grid',placeItems:'center',color:'var(--lime)',flexShrink:0}}><Icon name={ic} size={17}/></span>
        <div className="col fill" style={{lineHeight:1.4}}><span style={{fontSize:14,fontWeight:600}}>{t}</span><span className="muted" style={{fontSize:13}}>{d}</span></div>
        <div className="col" style={{alignItems:'flex-end',gap:6}}><span className="tag">{time}</span>{unread && <span className="sdot" style={{background:'var(--lime)'}}></span>}</div>
      </div>)}
    </div>
  </div>);
}

/* ---------------- PERFIL ---------------- */
function ClientPerfil(){
  return (<div className="fade" style={{maxWidth:680,margin:'0 auto'}}>
    <h1 className="disp" style={{fontSize:24,fontWeight:600,margin:'0 0 22px'}}>Perfil e segurança</h1>
    <div className="panel panel-b row center gap16" style={{marginBottom:14}}>
      <Avatar name="Ricardo Yamane" size={56} tone="lime"/>
      <div className="col" style={{lineHeight:1.4}}><span className="disp" style={{fontSize:18,fontWeight:600}}>Ricardo Yamane</span><span className="muted" style={{fontSize:13}}>Yamane Comércio e Importação · Diretor de Suprimentos</span></div>
      <span className="pill pill--ok mla"><span className="dot"></span>Conta ativa</span>
    </div>
    <div className="panel panel-b">
      <div className="tag" style={{marginBottom:14}}>Dados de acesso</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div className="field"><label>E-mail de acesso</label><input className="input" defaultValue="ricardo@yamaneimp.com.br" disabled style={{opacity:.6}}/></div>
        <div className="field"><label>Telefone</label><input className="input" defaultValue="+55 11 98841-2030"/></div>
      </div>
      <div className="hr" style={{margin:'18px 0'}}></div>
      <div className="tag" style={{marginBottom:14}}>Alterar senha</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div className="field"><label>Nova senha</label><input className="input" type="password" placeholder="••••••••"/></div>
        <div className="field"><label>Confirmar</label><input className="input" type="password" placeholder="••••••••"/></div>
      </div>
      <Btn variant="lime" style={{marginTop:16}} icon="check">Salvar alterações</Btn>
    </div>
    <div className="panel panel-b" style={{marginTop:14}}>
      <div className="row center" style={{justifyContent:'space-between'}}>
        <div className="row gap10 center"><Icon name="lock" size={16} style={{color:'var(--tx-mute)'}}/><span style={{fontSize:13.5,fontWeight:600}}>Privacidade & LGPD</span></div>
        <button className="btn btn--dark btn--sm">Solicitar meus dados</button>
      </div>
      <div className="hr" style={{margin:'14px 0'}}></div>
      <a href="#/cliente/login" className="row gap10 center" style={{fontSize:13.5,fontWeight:600,color:'var(--danger)'}}><Icon name="logout" size={16}/> Sair da conta</a>
    </div>
  </div>);
}

function ClientArea({ route }){
  let page, login=false;
  if(route==='#/cliente/login'){ login=true; page=<ClientLogin/>; }
  else if(route==='#/cliente/oportunidades') page=<ClientOportunidades/>;
  else if(route==='#/cliente/checklist') page=<ClientChecklist/>;
  else if(route==='#/cliente/upload') page=<ClientUpload/>;
  else if(route==='#/cliente/ficha') page=<ClientFicha/>;
  else if(route==='#/cliente/chat') page=<ClientChat/>;
  else if(route==='#/cliente/notificacoes') page=<ClientNotificacoes/>;
  else if(route==='#/cliente/perfil') page=<ClientPerfil/>;
  else page=<ClientDashboard/>;
  if(login) return page;
  return <ClientShell route={route}>{page}</ClientShell>;
}

Object.assign(window, { ClientArea });
