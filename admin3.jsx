/* ============================================================
   TradeK OS — Admin · remaining screens
   ============================================================ */
const { useState:a3UseState } = React;

/* CLIENTES / ACESSOS */
function AdminClientes({ openLead }){
  const cli=LEADS.filter(l=>l.portal);
  return (<div className="fade">
    <PageHead title="Clientes & Acessos" sub="Usuários externos com acesso ao portal" actions={<button className="btn btn--lime btn--sm"><Icon name="plus" size={13}/> Criar acesso</button>}/>
    <div className="panel scroll" style={{overflow:'auto'}}>
      <table className="tbl"><thead><tr>{['Cliente','Empresa','E-mail','Acesso','Último login','Oportunidade','Checklist','Ações'].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>{cli.map((l,i)=><tr key={l.id}>
          <td><div className="row gap8 center"><Avatar name={l.contato} size={26} tone={i%2?'info':'lime'}/><span className="strong">{l.contato}</span></div></td>
          <td>{l.empresa}</td><td className="mono" style={{fontSize:12}}>{l.email}</td>
          <td><Pill variant={i===2?'warn':'ok'}>{i===2?'Convite pendente':'Ativo'}</Pill></td>
          <td className="mono">{i===2?'—':['há 2h','há 1d','há 3d','ontem'][i%4]}</td>
          <td><button className="lime" style={{fontSize:12,fontWeight:600}} onClick={()=>openLead(l.id)}>{l.id}</button></td>
          <td><div className="row gap8 center"><div style={{width:60,height:6,background:'var(--bg)',borderRadius:99}}><div style={{height:'100%',width:[70,100,20,85][i%4]+'%',background:'var(--lime)',borderRadius:99}}></div></div><span className="mono" style={{fontSize:11}}>{[70,100,20,85][i%4]}%</span></div></td>
          <td><div className="row gap6"><button className="btn btn--dark btn--sm"><Icon name="mail" size={12}/></button><button className="btn btn--dark btn--sm"><Icon name="eye" size={12}/> Ver como</button><button className="btn btn--dark btn--sm"><Icon name="more" size={12}/></button></div></td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>);
}

/* EMPRESAS */
function AdminEmpresas(){
  return (<div className="fade">
    <PageHead title="Empresas & Contatos" sub="Cadastro de empresas, contatos e oportunidades" actions={<button className="btn btn--lime btn--sm"><Icon name="plus" size={13}/> Nova empresa</button>}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
      {LEADS.slice(0,9).map((l,i)=><div key={l.id} className="panel panel-b">
        <div className="row center gap10"><span style={{width:40,height:40,borderRadius:9,background:'var(--bg)',border:'1px solid var(--line)',display:'grid',placeItems:'center',color:UNITS[l.unit].color}}><Icon name="building" size={18}/></span>
          <div className="col fill" style={{minWidth:0,lineHeight:1.3}}><span style={{fontSize:14,fontWeight:700,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{l.empresa}</span><span className="mono tag">{l.cnpj}</span></div></div>
        <div className="row gap14" style={{marginTop:14,fontSize:12}}>
          {[['Unidade',UNITS[l.unit].short],['Oport.',1],['Docs',l.docPend]].map(([k,v])=><div key={k}><div className="tag">{k}</div><div style={{fontWeight:700,marginTop:2}}>{v}</div></div>)}
        </div>
        <div className="hr" style={{margin:'12px 0'}}></div>
        <div className="row center" style={{justifyContent:'space-between'}}><span className="row gap6 center" style={{fontSize:12,color:'var(--tx-dim)'}}><Icon name="user" size={13}/>{l.contato}</span><button className="btn btn--dark btn--sm">Abrir</button></div>
      </div>)}
    </div>
  </div>);
}

/* PRODUTOS */
function AdminProdutos(){
  const sMeta={ publicado:['Publicado','ok'], em_revisao:['Em revisão','warn'], rascunho:['Rascunho',null] };
  const [modal,setModal]=a3UseState(null); // 'new' | product | null
  return (<div className="fade">
    <PageHead title="Produtos & Serviços" sub="Catálogo dinâmico — alimenta o site e o agente IA" actions={<><button className="btn btn--dark btn--sm"><Icon name="download" size={13}/> Exportar</button><button className="btn btn--lime btn--sm" onClick={()=>setModal('new')}><Icon name="plus" size={13}/> Novo produto</button></>}/>
    <div className="panel scroll" style={{overflow:'auto'}}>
      <table className="tbl"><thead><tr>{['Modelo','Categoria','Motor','Bateria','Velocidade','Autonomia','Valor base','Status','Site','Cotação IA','Atualizado',''].map((h,i)=><th key={i}>{h}</th>)}</tr></thead>
        <tbody>{PRODUCTS.map(p=>{ const[sl,sv]=sMeta[p.status];
          return <tr key={p.id} onClick={()=>setModal(p)} style={{cursor:'pointer'}}>
            <td><div className="row gap10 center"><span className="moto-thumb" style={{width:38,height:38,borderRadius:7,flexShrink:0}}><img src={"assets/motos/"+p.id+".png"} alt={p.modelo}/></span><span className="strong">{p.modelo}</span></div></td>
            <td>{p.cat}</td><td className="mono">{p.motor}</td><td>{p.bat}</td><td className="mono">{p.vel}</td><td className="mono">{p.aut}</td>
            <td className="mono strong">{p.moeda} {p.preco}</td>
            <td><Pill variant={sv}>{sl}</Pill></td>
            <td>{p.site?<Icon name="check" size={15} style={{color:'var(--ok)'}}/>:<Icon name="x" size={15} style={{color:'var(--tx-faint)'}}/>}</td>
            <td>{p.ia?<Pill variant="ok">Sim</Pill>:<Pill>Não</Pill>}</td>
            <td className="mono faint">{p.atual}</td>
            <td><button className="btn btn--dark btn--sm" onClick={e=>{e.stopPropagation();setModal(p);}}><Icon name="edit" size={12}/></button></td>
          </tr>; })}</tbody>
      </table>
    </div>
    <div className="panel panel-b" style={{marginTop:12,background:'var(--bg-2)',display:'flex',gap:12,alignItems:'center'}}>
      <Icon name="brain" size={18} style={{color:'var(--lime)',flexShrink:0}}/>
      <span className="muted" style={{fontSize:12.5,lineHeight:1.5}}>A IA só informa preço quando o produto está <b style={{color:'var(--tx)'}}>publicado</b>, com <b style={{color:'var(--tx)'}}>cotação IA ativa</b> e <b style={{color:'var(--tx)'}}>tabela aprovada</b>. Caso contrário, registra a solicitação e encaminha para a equipe.</span>
    </div>
    {modal && <ProdutoModal produto={modal==='new'?null:modal} onClose={()=>setModal(null)}/>}
  </div>);
}

/* PRODUTO — MODAL DE CADASTRO (ADM-13) */
function ProdutoModal({ produto, onClose }){
  const [tab,setTab]=a3UseState('Dados');
  const isNew=!produto;
  const p=produto||{};
  const tabs=['Dados','Especificações','Preços','Mídia','Regras IA'];
  const F=({label,value,ph,span,full})=> <div className="field" style={(span||full)?{gridColumn:'span '+(full?2:span)}:null}><label>{label}</label><input className="input" defaultValue={value||''} placeholder={ph||label}/></div>;
  return (<div onClick={onClose} style={{position:'fixed',inset:0,zIndex:80,background:'rgba(5,6,5,.72)',backdropFilter:'blur(3px)',display:'grid',placeItems:'center',padding:20}}>
    <div onClick={e=>e.stopPropagation()} className="fade panel" style={{width:'min(760px,96vw)',maxHeight:'92vh',display:'flex',flexDirection:'column',background:'var(--bg-1)',overflow:'hidden'}}>
      {/* header */}
      <div style={{padding:'16px 20px',borderBottom:'1px solid var(--line)'}}>
        <div className="row center gap12">
          <span className="moto-thumb" style={{width:46,height:46,borderRadius:9,display:'grid',placeItems:'center',flexShrink:0}}>{isNew?<Icon name="box" size={20} style={{color:'#7a8074'}}/>:<img src={"assets/motos/"+p.id+".png"} alt=""/>}</span>
          <div className="col" style={{lineHeight:1.3}}><span className="disp" style={{fontSize:18,fontWeight:600}}>{isNew?'Novo produto':p.modelo}</span><span className="tag">{isNew?'Cadastro de produto · catálogo dinâmico':'Editando · alimenta site e agente IA'}</span></div>
          <button className="btn btn--icon btn--dark mla" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="row gap2" style={{marginTop:14,marginBottom:-16}}>{tabs.map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:'9px 13px',fontSize:12.5,fontWeight:600,whiteSpace:'nowrap',color:tab===t?'var(--tx)':'var(--tx-mute)',borderBottom:'2px solid '+(tab===t?'var(--lime)':'transparent')}}>{t}</button>)}</div>
      </div>
      {/* body */}
      <div className="scroll" style={{flex:1,padding:'20px'}}>
        {tab==='Dados' && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <F label="Modelo" value={p.modelo} ph="Ex: X21"/>
          <div className="field"><label>Categoria</label><select className="select" defaultValue={p.grupo}><option>Mobilidade elétrica</option><option>Eletrônicos</option><option>Casa & Utilidades</option><option>Ferramentas</option><option>Autopeças</option><option>Outros</option></select></div>
          <F label="Tipo / subcategoria" value={p.cat} ph="Ex: Scooter elétrica"/>
          <F label="Fornecedor (China)" value={p.forn} ph="Ex: Ningbo Leike Vehicle Co."/>
          <F label="Origem" value={p.cidade} ph="Cidade, CN"/>
          <div className="field" style={{gridColumn:'span 2'}}><label>Descrição completa</label><textarea className="textarea" placeholder="Descrição comercial do produto…"></textarea></div>
          <div className="field"><label>Status</label><select className="select" defaultValue={p.status}><option value="rascunho">Rascunho</option><option value="em_revisao">Em revisão</option><option value="publicado">Publicado</option><option value="oculto">Oculto</option><option value="descontinuado">Descontinuado</option></select></div>
          <F label="MOQ / Condição" value={p.moq} ph="1 contêiner"/>
        </div>}
        {tab==='Especificações' && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <F label="Motor" value={p.motor} ph="1000W"/>
          <F label="Velocidade máx." value={p.vel} ph="50 km/h"/>
          <F label="Autonomia" value={p.aut} ph="50 km"/>
          <F label="Bateria" value={p.bat} ph="60V · 20AH Lítio"/>
          <F label="Freios" value={p.freios} ph="Disco diant. e tras." full/>
          <F label="Controlador" ph="Tipo do controlador"/>
          <F label="Capacidade" ph="Peso suportado"/>
        </div>}
        {tab==='Preços' && <div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
            <F label="Preço base" value={p.preco} ph="439"/>
            <div className="field"><label>Moeda</label><select className="select" defaultValue={p.moeda}><option>USD</option><option>BRL</option><option>CNY</option></select></div>
            <div className="field"><label>Condição</label><select className="select"><option>FOB</option><option>CIF</option><option>EXW</option></select></div>
          </div>
          <div className="panel panel-b" style={{marginTop:16,background:'var(--bg-2)'}}>
            <div className="row center" style={{justifyContent:'space-between'}}>
              <div className="row gap10 center"><Icon name="shield" size={16} style={{color:p.tabela?'var(--ok)':'var(--warn)'}}/><div className="col" style={{lineHeight:1.3}}><span style={{fontSize:13,fontWeight:600}}>Tabela aprovada</span><span className="tag">Necessária para cotação automática por IA</span></div></div>
              <label style={{position:'relative',display:'inline-block',width:34,height:18}}><input type="checkbox" defaultChecked={p.tabela} style={{display:'none'}}/><span className="tk-switch"></span></label>
            </div>
            <div className="hr" style={{margin:'14px 0'}}></div>
            <div className="row center" style={{justifyContent:'space-between'}}>
              <div className="field" style={{flex:1}}><label>Validade da tabela</label><input className="input" placeholder="31/12/2026"/></div>
            </div>
          </div>
        </div>}
        {tab==='Mídia' && <div>
          <div className="tag" style={{marginBottom:10}}>Imagem principal</div>
          <div className="row gap14 center">
            <span className="moto-tile" style={{width:140,height:140,borderRadius:10,display:'grid',placeItems:'center',flexShrink:0,border:'1px solid var(--line)'}}>{isNew?<Icon name="box" size={30} style={{color:'#7a8074'}}/>:<img className="moto-img" src={"assets/motos/"+p.id+".png"} alt="" style={{padding:'14px'}}/>}</span>
            <label style={{flex:1,border:'1.5px dashed var(--line-strong)',borderRadius:10,padding:'28px 20px',textAlign:'center',cursor:'pointer'}}>
              <input type="file" accept="image/*" style={{display:'none'}}/>
              <Icon name="upload" size={24} style={{color:'var(--tx-mute)'}}/>
              <div style={{fontSize:13,fontWeight:600,marginTop:10}}>Arraste ou clique para enviar fotos</div>
              <div className="tag" style={{marginTop:6}}>PNG · JPG · fundo branco recomendado</div>
            </label>
          </div>
          <div className="field" style={{marginTop:16}}><label>Ficha técnica (PDF)</label><div className="row gap8 center" style={{padding:'10px 12px',border:'1px solid var(--line)',borderRadius:6,fontSize:13,color:'var(--tx-dim)'}}><Icon name="doc" size={15}/> Nenhum arquivo · <span className="lime" style={{fontWeight:600,cursor:'pointer'}}>anexar</span></div></div>
        </div>}
        {tab==='Regras IA' && <div className="col gap10">
          {[['Publicar no site','Exibe o produto no catálogo público',p.site,'globe'],['Permitir cotação por IA','O agente pode informar preço deste modelo',p.ia,'brain'],['Destacar como "Top venda"','Selo de destaque no catálogo',!!p.tag,'star']].map(([t,d,on,ic])=>
            <div key={t} className="panel panel-b row center" style={{justifyContent:'space-between'}}>
              <div className="row gap10 center"><Icon name={ic} size={16} style={{color:'var(--lime)'}}/><div className="col" style={{lineHeight:1.3}}><span style={{fontSize:13,fontWeight:600}}>{t}</span><span className="tag">{d}</span></div></div>
              <label style={{position:'relative',display:'inline-block',width:34,height:18}}><input type="checkbox" defaultChecked={on} style={{display:'none'}}/><span className="tk-switch"></span></label>
            </div>)}
          <div className="panel panel-b" style={{background:'var(--bg-2)',display:'flex',gap:10}}><Icon name="alert" size={16} style={{color:'var(--warn)',flexShrink:0}}/><span className="muted" style={{fontSize:12,lineHeight:1.5}}>Homologação e enquadramento podem exigir validação regulatória antes da publicação comercial.</span></div>
        </div>}
      </div>
      {/* footer */}
      <div className="row center" style={{padding:'14px 20px',borderTop:'1px solid var(--line)',justifyContent:'space-between'}}>
        {!isNew?<button className="btn btn--dark btn--sm"><Icon name="box" size={13}/> Duplicar</button>:<span/>}
        <div className="row gap8"><button className="btn btn--ghost btn--sm" onClick={onClose}>Cancelar</button><Btn variant="lime" size="sm" icon="check" onClick={onClose}>{isNew?'Criar produto':'Salvar alterações'}</Btn></div>
      </div>
    </div>
  </div>);
}

/* TAREFAS */
function AdminTarefas(){
  const cols=[['aberta','A fazer'],['andamento','Em andamento'],['feita','Concluídas']];
  const items={ aberta:TASKS, andamento:[{titulo:'Negociar MOQ — NovaRota',resp:'Pedro Lima',prazo:'Amanhã',prio:'Média'}], feita:[{titulo:'Criar acesso — GloboPort',resp:'Ana Prado',prazo:'12/06',prio:'Alta'}] };
  return (<div className="fade">
    <PageHead title="Tarefas & SLA" sub="Follow-ups e prazos das oportunidades" actions={<button className="btn btn--lime btn--sm"><Icon name="plus" size={13}/> Nova tarefa</button>}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
      {cols.map(([k,l])=><div key={k}>
        <div className="row center gap8" style={{padding:'4px 6px 10px'}}><span style={{fontSize:13,fontWeight:700}}>{l}</span><span className="mono" style={{fontSize:11,color:'var(--tx-mute)',background:'var(--bg-2)',borderRadius:99,padding:'1px 7px'}}>{items[k].length}</span></div>
        <div className="col gap8">{items[k].map((t,i)=><div key={i} className="panel panel-b">
          <div className="row center" style={{justifyContent:'space-between',marginBottom:8}}><span className="pill" style={{fontSize:10,color:t.prio==='Alta'?'var(--danger)':'var(--warn)',borderColor:t.prio==='Alta'?'rgba(255,107,87,.3)':'rgba(245,181,68,.3)'}}>{t.prio}</span>{t.venc && <span className="pill pill--danger" style={{fontSize:10}}>Vencida</span>}</div>
          <div style={{fontSize:13.5,fontWeight:600,lineHeight:1.3}}>{t.titulo}</div>
          {t.lead && <div className="tag" style={{marginTop:4}}>{t.lead}</div>}
          <div className="hr" style={{margin:'10px 0'}}></div>
          <div className="row center" style={{justifyContent:'space-between'}}><span className="row gap6 center" style={{fontSize:11.5,color:'var(--tx-dim)'}}><Avatar name={t.resp} size={18}/>{t.resp.split(' ')[0]}</span><span className="row gap4 center tag"><Icon name="clock" size={12}/>{t.prazo}</span></div>
        </div>)}</div>
      </div>)}
    </div>
  </div>);
}

/* NOTIFICAÇÕES (config + feed) */
function AdminNotificacoes(){
  return (<div className="fade" style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:12}}>
    <div className="panel">
      <div className="panel-h"><h3>Regras de notificação</h3><button className="btn btn--lime btn--sm"><Icon name="plus" size={13}/> Nova regra</button></div>
      <div className="panel-b">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div className="field"><label>Evento</label><select className="select"><option>Novo lead recebido</option><option>Lead qualificado</option><option>Documento enviado</option><option>Proposta enviada</option></select></div>
          <div className="field"><label>Unidade</label><select className="select"><option>Supply Chain Finance</option><option>Procurement</option><option>Todas</option></select></div>
          <div className="field" style={{gridColumn:'span 2'}}><label>Para</label><input className="input" defaultValue="financeiro@tradek.com.br, comercial@tradek.com.br"/></div>
          <div className="field"><label>CC</label><input className="input" defaultValue="camilo@tradek.com.br"/></div>
          <div className="field"><label>BCC</label><input className="input" placeholder="—"/></div>
          <div className="field"><label>Template</label><select className="select"><option>Novo lead recebido</option><option>Convite cliente</option></select></div>
          <div className="field"><label>Frequência</label><select className="select"><option>Imediato</option><option>Resumo diário</option></select></div>
        </div>
        <div className="row gap16 wrap" style={{marginTop:16}}>
          {['Enviar resumo IA','Enviar anexos'].map((t,i)=><label key={t} className="row gap8 center" style={{fontSize:12.5,color:'var(--tx-dim)'}}><input type="checkbox" defaultChecked={i===0} style={{accentColor:'var(--lime)'}}/>{t}</label>)}
        </div>
        <div className="row gap8" style={{marginTop:18}}><Btn variant="lime" icon="check">Salvar regra</Btn><button className="btn btn--dark"><Icon name="send" size={14}/> Testar envio</button></div>
        <div className="hr" style={{margin:'20px 0'}}></div>
        <div className="tag" style={{marginBottom:10}}>Regras ativas</div>
        {[['Novo lead recebido','SCF','Imediato'],['Lead qualificado','Todas','Imediato'],['Documento reprovado','Todas','Imediato'],['Proposta enviada','Procurement','Resumo diário']].map(([e,u,f])=><div key={e} className="row center gap10" style={{padding:'10px 0',borderTop:'1px solid var(--line-soft)',fontSize:13}}><span className="sdot" style={{background:'var(--ok)'}}></span><span style={{fontWeight:600}}>{e}</span><span className="pill" style={{fontSize:10}}>{u}</span><span className="tag mla">{f}</span><label style={{position:'relative',display:'inline-block',width:34,height:18}}><input type="checkbox" defaultChecked style={{display:'none'}}/><span className="tk-switch"></span></label></div>)}
      </div>
    </div>
    <div className="panel" style={{height:'fit-content'}}>
      <div className="panel-h"><h3>Feed</h3><span className="pill pill--lime">3 novas</span></div>
      <div className="panel-b col" style={{padding:'6px 8px'}}>
        {NOTIFS.map((n,i)=><div key={i} className="row gap10" style={{padding:'11px 10px',borderRadius:6,background:n.unread?'rgba(195,249,41,.04)':'transparent'}}>
          <span style={{width:30,height:30,borderRadius:7,background:'var(--bg)',display:'grid',placeItems:'center',color:'var(--lime)',flexShrink:0}}><Icon name={n.icon} size={14}/></span>
          <div className="col" style={{lineHeight:1.4}}><span style={{fontSize:12.5,fontWeight:n.unread?600:500}}>{n.msg}</span><span className="tag" style={{marginTop:2}}>{n.t}</span></div>
          {n.unread && <span className="sdot" style={{background:'var(--lime)',marginLeft:'auto',marginTop:6,flexShrink:0}}></span>}
        </div>)}
      </div>
    </div>
  </div>);
}

/* AGENTES IA */
function AdminAgentes(){
  const [tab,setTab]=a3UseState('SCF');
  const tabs=['Geral','SCF','Procurement','Produtos','Suporte','RAG','Guardrails'];
  return (<div className="fade">
    <PageHead title="Agentes IA" sub="Configuração dos agentes por unidade, perguntas e guardrails" actions={<button className="btn btn--lime btn--sm"><Icon name="send" size={13}/> Testar agente</button>}/>
    <div className="row gap2" style={{borderBottom:'1px solid var(--line)',marginBottom:18}}>{tabs.map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:'9px 14px',fontSize:13,fontWeight:600,color:tab===t?'var(--tx)':'var(--tx-mute)',borderBottom:'2px solid '+(tab===t?'var(--lime)':'transparent')}}>{t}</button>)}</div>
    {tab==='RAG' ? <AgentRAG/> : (<div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:12}}>
      <div className="panel panel-b col gap14">
        <div className="field"><label>Nome do agente</label><input className="input" defaultValue={tab==='SCF'?'Agente Supply Chain Finance':'Agente '+tab}/></div>
        <div className="field"><label>Mensagem inicial</label><textarea className="textarea" defaultValue="Olá, posso te ajudar a avaliar sua importação com prazo. Para começar, qual o seu nome?"></textarea></div>
        <div className="field"><label>Perguntas obrigatórias</label>
          <div className="col gap8" style={{marginTop:2}}>{['Empresa','CNPJ','Produto importado','Valor FOB','RADAR / habilitação'].map(q=><label key={q} className="row gap8 center" style={{fontSize:13,color:'var(--tx-dim)'}}><input type="checkbox" defaultChecked style={{accentColor:'var(--lime)'}}/>{q}</label>)}</div>
        </div>
        <div className="row gap14"><div className="field fill"><label>Score mínimo qualificado</label><input className="input" defaultValue="60"/></div><div className="field fill"><label>Checklist acionado</label><select className="select"><option>Supply Chain Finance</option></select></div></div>
        <div className="row gap8"><Btn variant="lime" icon="check">Salvar</Btn><button className="btn btn--dark"><Icon name="send" size={14}/> Testar</button></div>
      </div>
      <div className="panel" style={{height:'fit-content'}}>
        <div className="panel-h"><h3>Guardrails</h3><Icon name="shield" size={15} style={{color:'var(--lime)'}}/></div>
        <div className="panel-b col gap10">
          {['Nunca prometer aprovação financeira','Sempre incluir ressalva de análise','Handoff humano para proposta/preço','Não informar preço sem tabela aprovada','Registrar consentimento LGPD'].map(g=><div key={g} className="row gap10" style={{fontSize:12.5,color:'var(--tx-dim)',lineHeight:1.4}}><Icon name="shield" size={14} style={{color:'var(--lime)',flexShrink:0,marginTop:1}}/>{g}</div>)}
        </div>
      </div>
    </div>)}
  </div>);
}
function AgentRAG(){
  return (<div className="panel"><div className="panel-h"><h3>Base de conhecimento (RAG)</h3><button className="btn btn--lime btn--sm"><Icon name="upload" size={13}/> Upload</button></div>
    <table className="tbl"><thead><tr>{['Documento','Categoria','Unidade','Status','Validade','Ações'].map(h=><th key={h}>{h}</th>)}</tr></thead>
      <tbody>{[['Manual Supply Chain Finance.pdf','Operação','SCF','ativo','—'],['Checklist documental SCF.pdf','Documentos','SCF','ativo','—'],['Catálogo produtos 2026.pdf','Produtos','Produtos','ativo','31/12/2026'],['FAQ Procurement.md','FAQ','Procurement','inativo','—']].map(([n,c,u,s,v])=><tr key={n}><td><div className="row gap8 center"><Icon name="doc" size={15} style={{color:'var(--tx-mute)'}}/><span className="strong">{n}</span></div></td><td>{c}</td><td><span className="pill" style={{fontSize:10}}>{u}</span></td><td><Pill variant={s==='ativo'?'ok':null}>{s}</Pill></td><td className="mono">{v}</td><td><div className="row gap6"><button className="btn btn--dark btn--sm"><Icon name="send" size={12}/> Testar</button><button className="btn btn--dark btn--sm"><Icon name="eye" size={12}/></button></div></td></tr>)}</tbody>
    </table>
  </div>);
}

/* CONFIGURAÇÕES */
function AdminConfig(){
  const [sec,setSec]=a3UseState('Empresa');
  const secs=[['Empresa','building'],['Status do CRM','kanban'],['Unidades','layers'],['Checklists','file'],['Templates','mail'],['Usuários','users'],['Segurança','shield'],['LGPD','lock'],['Integrações','globe']];
  return (<div className="fade" style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:12,height:'100%'}}>
    <div className="panel" style={{height:'fit-content',padding:8}}>{secs.map(([s,ic])=><button key={s} onClick={()=>setSec(s)} className="row gap10 center" style={{width:'100%',padding:'9px 11px',borderRadius:6,fontSize:13,fontWeight:600,textAlign:'left',color:sec===s?'#0A0B0A':'var(--tx-dim)',background:sec===s?'var(--lime)':'transparent',marginBottom:2}}><Icon name={ic} size={15}/>{s}</button>)}</div>
    <div className="panel panel-b">
      {sec==='Status do CRM' ? (<div><div className="tag" style={{marginBottom:14}}>Etapas do funil — arraste para reordenar</div><div className="col gap8">{STATUSES.map(s=><div key={s.key} className="row center gap10 panel" style={{padding:'10px 12px'}}><Icon name="menu" size={14} style={{color:'var(--tx-faint)',cursor:'grab'}}/><span className="sdot" style={{background:s.color}}></span><span style={{fontSize:13,fontWeight:600}}>{s.label}</span><span className="tag mla">cliente vê: {s.cliente}</span></div>)}</div></div>)
      : sec==='Templates' ? (<div><div className="row center" style={{justifyContent:'space-between',marginBottom:14}}><div className="tag">Templates de e-mail</div><button className="btn btn--lime btn--sm"><Icon name="plus" size={12}/> Novo</button></div><div className="col gap8">{['Novo lead recebido','Lead qualificado','Convite cliente','Solicitação de documentos','Documento reprovado','Proposta enviada'].map(t=><div key={t} className="row center gap10 panel" style={{padding:'12px 14px'}}><Icon name="mail" size={15} style={{color:'var(--lime)'}}/><span style={{fontSize:13,fontWeight:600}}>{t}</span><div className="row gap6 mla"><button className="btn btn--dark btn--sm"><Icon name="edit" size={12}/></button><button className="btn btn--dark btn--sm"><Icon name="eye" size={12}/></button></div></div>)}</div><div className="panel panel-b" style={{marginTop:14,background:'var(--bg-2)'}}><div className="tag" style={{marginBottom:8}}>Variáveis disponíveis</div><div className="row gap6 wrap">{['{{nome_cliente}}','{{empresa}}','{{cnpj}}','{{unidade}}','{{status}}','{{score}}','{{resumo_ia}}','{{proxima_acao}}','{{link_portal}}','{{documentos_pendentes}}','{{responsavel}}'].map(v=><span key={v} className="pill mono" style={{fontSize:10.5}}>{v}</span>)}</div></div></div>)
      : sec==='Usuários' ? (<div><div className="row center" style={{justifyContent:'space-between',marginBottom:14}}><div className="tag">Usuários internos</div><button className="btn btn--lime btn--sm"><Icon name="plus" size={12}/> Criar usuário</button></div><table className="tbl"><thead><tr>{['Usuário','Perfil','Último login','Status','Ações'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{[['Ana Prado','Comercial','há 2h','Ativo'],['Pedro Lima','Comercial','há 1d','Ativo'],['Camilo Tan','Admin','há 3h','Ativo'],['Júlia Reis','Operacional','há 5d','Bloqueado']].map(([n,p,ll,st],i)=><tr key={n}><td><div className="row gap8 center"><Avatar name={n} size={26} tone={i===2?'purple':null}/><span className="strong">{n}</span></div></td><td><span className="pill">{p}</span></td><td className="mono">{ll}</td><td><Pill variant={st==='Ativo'?'ok':'danger'}>{st}</Pill></td><td><div className="row gap6"><button className="btn btn--dark btn--sm"><Icon name="edit" size={12}/></button><button className="btn btn--dark btn--sm"><Icon name="lock" size={12}/></button></div></td></tr>)}</tbody></table></div>)
      : (<div><div className="tag" style={{marginBottom:14}}>{sec}</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {(sec==='Empresa'?[['Razão social','TradeK Comércio Internacional Ltda'],['CNPJ','30.114.220/0001-55'],['E-mail comercial','comercial@tradek.com.br'],['Telefone','+55 11 4000-0000'],['Cidade','São Paulo · SP'],['Site','tradek.com.br']]:sec==='Segurança'?[['Tempo de sessão','30 minutos'],['2FA obrigatório','Ativado'],['Tentativas máx.','5'],['Bloqueio automático','Ativado']]:sec==='LGPD'?[['Consentimento obrigatório','Sim'],['Retenção de dados','24 meses'],['DPO','dpo@tradek.com.br'],['Direito de exclusão','Habilitado']]:sec==='Unidades'?[['SCF','Ativa'],['Procurement','Ativa'],['Motos / Produtos','Ativa'],['Suporte','Ativa']]:[['Campo 1','Valor'],['Campo 2','Valor']]).map(([k,v])=>
            <div key={k} className="field"><label>{k}</label><input className="input" defaultValue={v}/></div>)}
        </div><Btn variant="lime" icon="check" style={{marginTop:18}}>Salvar alterações</Btn></div>)}
    </div>
  </div>);
}

Object.assign(window, { AdminClientes, AdminEmpresas, AdminProdutos, AdminTarefas, AdminNotificacoes, AdminAgentes, AdminConfig });
