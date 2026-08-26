const PLAYERS={google:{id:'google',name:'Google',short:'G',hex:'#4285F4',role:'Hyperscaler – Industry Solutions',momentum:'up'},microsoft:{id:'microsoft',name:'Microsoft',short:'MS',hex:'#F25022',role:'Hyperscaler – Copilot Ecosystem',momentum:'stable'},anthropic:{id:'anthropic',name:'Anthropic',short:'A',hex:'#C15F3C',role:'Foundation Lab – Enterprise LLM',momentum:'up'},openai:{id:'openai',name:'OpenAI',short:'OAI',hex:'#10A37F',role:'Foundation Lab',momentum:'down'},aws:{id:'aws',name:'AWS',short:'AWS',hex:'#FF9900',role:'Hyperscaler – Bedrock',momentum:'stable'},specialist:{id:'specialist',name:'Vertical Specialists',short:'VS',hex:'#A855F7',role:'Harvey, Healthcare AI etc.',momentum:'up'},ibm:{id:'ibm',name:'IBM / Governance',short:'IBM',hex:'#0F62FE',role:'Governance-first',momentum:'stable'}};
let territories=[{id:'legal',name:'Legal',meta:'Contracts • Research • Compliance',status:'hot',influence:{google:31,microsoft:31,specialist:26,anthropic:9,openai:3},trend:{google:'up',microsoft:'stable',specialist:'stable',anthropic:'stable',openai:'down'},note:'Google closes gap after Legal launch.'}];
let movers=[];
let geoDominance={na:{dominant:'microsoft',intensity:.83,trend:'stable',note:'Microsoft densest in NA.'},sa:{dominant:'microsoft',intensity:.55,trend:'stable',note:''},eu:{dominant:'microsoft',intensity:.68,trend:'stable',note:''},af:{dominant:'microsoft',intensity:.4,trend:'stable',note:''},as:{dominant:'google',intensity:.67,trend:'up',note:''},oc:{dominant:'microsoft',intensity:.6,trend:'stable',note:''}};
const CENTROIDS={na:[200,160],sa:[235,355],eu:[480,120],af:[490,275],as:[700,135],oc:[845,345]};
let events=[{time:'2026-08-26',text:'Board supports per-territory trends + movers ranking.'}];
const pipeline=['Healthcare (Google)','Life Sciences (Google)','Retail (Google)'];
function trendGlyph(t){return t==='up'?'▲':t==='down'?'▼':'●'}
function trendClass(t){return (t==='up'||t==='down')?t:'stable'}
function enterWarRoom(){document.getElementById('intro').classList.add('hide');try{localStorage.setItem('raw_entered','1')}catch(e){}}
function triggerSurprise(){document.getElementById('modalBody').innerHTML='<div style="text-align:center;padding:8px 0"><div style="color:#ef4444;font-size:.7rem;letter-spacing:.3em;margin-bottom:12px">CLASSIFIED LAYER</div><h3 style="margin-bottom:12px">Doctrine Insight</h3><p style="font-size:.9rem;line-height:1.55;color:var(--muted);text-align:left">Agents are the <strong style="color:var(--text)">key</strong> that opens regulated markets and their data pools. Every human who uses the tool becomes a feedback signal.</p><p style="margin-top:14px;font-size:.85rem;color:var(--human);text-align:left">The more humans run after the technology, the more powerful it becomes — and the less visible that humans remain the heart of the loop.</p><p style="margin-top:16px;font-size:.8rem;color:var(--accent)">Switch to the <strong>Human Layer</strong> view.</p></div>';document.getElementById('modal').classList.add('open')}
function renderPlayers(){document.getElementById('playersList').innerHTML=Object.values(PLAYERS).map(p=>`<div class="player" style="border-left-color:${p.hex}"><div class="token" style="background:${p.hex}">${p.short}</div><div><div class="name">${p.name}</div><div class="role">${p.role}</div></div><div class="momentum ${p.momentum}">${trendGlyph(p.momentum)}</div></div>`).join('')}
function renderLegend(){document.getElementById('legendList').innerHTML=Object.values(PLAYERS).map(p=>`<div class="legend-item"><div class="legend-swatch" style="background:${p.hex}"></div>${p.name}</div>`).join('')+`<div class="legend-item" style="margin-top:8px"><div class="legend-swatch" style="background:var(--human)"></div>Human Feedback Layer</div>`}
function renderMovers(){
  const el=document.getElementById('moversList');
  if(!el)return;
  const list=(movers&&movers.length)?movers:deriveMoversFromTrends();
  if(!list.length){el.innerHTML='<div class="mover-empty">No material movers in this snapshot.</div>';return}
  el.innerHTML=list.slice(0,8).map(m=>{
    const p=PLAYERS[m.player]||{name:m.player,hex:'#888'};
    const tName=(territories.find(x=>x.id===m.territory)||{}).name||m.territory;
    const tr=trendClass(m.trend);
    const d=typeof m.delta==='number'?m.delta:null;
    const dStr=d===null?'':(d>0?'+'+d:String(d));
    return `<div class="mover-row" title="${m.label||''}"><div class="arrow ${tr}">${trendGlyph(tr)}</div><div class="who"><strong style="color:${p.hex}">${p.name}</strong> · ${tName}<br><span>${m.label||''}</span></div><div class="delta ${tr}">${dStr}</div></div>`;
  }).join('');
}
function deriveMoversFromTrends(){
  const out=[];
  territories.forEach(t=>{
    const tr=t.trend||{};
    Object.entries(tr).forEach(([pid,dir])=>{
      if(dir==='up'||dir==='down') out.push({player:pid,territory:t.id,trend:dir,delta:dir==='up'?1:-1,label:dir==='up'?'Climbing':'Fading'});
    });
  });
  out.sort((a,b)=>(b.trend==='up')-(a.trend==='up'));
  return out.slice(0,8);
}
function renderBoard(){document.getElementById('board').innerHTML=territories.map(t=>{const total=Object.values(t.influence).reduce((a,b)=>a+b,0)||1;const sorted=Object.entries(t.influence).sort((a,b)=>b[1]-a[1]);const bars=sorted.map(([pid,val])=>`<span style="width:${(val/total*100).toFixed(0)}%;background:${PLAYERS[pid]?PLAYERS[pid].hex:'#555'}" title="${PLAYERS[pid]?PLAYERS[pid].name:pid}: ${val}"></span>`).join('');const tokens=sorted.slice(0,5).map(([pid])=>{const p=PLAYERS[pid];if(!p)return '';const tr=(t.trend&&t.trend[pid])||'stable';return `<span class="token-wrap" title="${p.name}: ${tr}"><div class="token-mini" style="background:${p.hex}">${p.short}</div><span class="token-trend ${trendClass(tr)}">${trendGlyph(tr)}</span></span>`}).join('');const sc=t.status==='hot'?'hot':t.status==='contested'?'contested':'';const badgeCls=t.status==='hot'?'hot-live':'';return `<div class="territory ${sc}" onclick="showDetail('${t.id}')"><div class="status-badge ${badgeCls}">${t.status==='hot'?'🔥 HOT':t.status==='contested'?'⚔ Contested':'Stable'}</div><div class="name">${t.name}</div><div class="meta">${t.meta}</div><div class="influence-bar">${bars}</div><div class="tokens">${tokens}</div></div>`}).join('')}
function renderWorld(){const beacons=document.getElementById('beacons');beacons.innerHTML='';Object.entries(geoDominance).forEach(([id,data])=>{const el=document.getElementById(id);if(!el)return;const p=PLAYERS[data.dominant];if(!p)return;el.style.fill=p.hex;el.style.opacity=0.38+data.intensity*0.52;el.classList.toggle('high-intensity', data.intensity>=0.7);el.onclick=()=>showGeoDetail(id);const [cx,cy]=CENTROIDS[id]||[0,0];const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','beacon');const tr=data.trend||'stable';g.innerHTML=`<circle class="beacon-ring" cx="${cx}" cy="${cy}" r="4" stroke="${p.hex}"/><circle class="beacon-ring" cx="${cx}" cy="${cy}" r="4" stroke="${p.hex}" style="animation-delay:.8s"/><circle class="beacon-core" cx="${cx}" cy="${cy}" r="3.2" fill="${p.hex}"/>`;beacons.appendChild(g);if(tr==='up'||tr==='down'){const label=document.createElementNS('http://www.w3.org/2000/svg','text');label.setAttribute('x',cx+10);label.setAttribute('y',cy+4);label.setAttribute('fill',tr==='up'?'#34d399':'#f87171');label.setAttribute('font-size','12');label.setAttribute('font-weight','700');label.textContent=trendGlyph(tr);beacons.appendChild(label)}});document.getElementById('worldLegend').innerHTML=Object.values(PLAYERS).map(p=>`<span><i style="background:${p.hex}"></i>${p.short}</span>`).join('')}
function renderMetrics(){const hot=territories.filter(t=>t.status==='hot').map(t=>t.name).join(' · ')||'—';const contested=territories.filter(t=>t.status==='contested').map(t=>t.name).join(' · ')||'—';const leaders={};territories.forEach(t=>{const top=Object.entries(t.influence).sort((a,b)=>b[1]-a[1])[0];if(top)leaders[top[0]]=(leaders[top[0]]||0)+1});const top=Object.entries(leaders).sort((a,b)=>b[1]-a[1])[0];const climb=(movers&&movers.length?movers:deriveMoversFromTrends()).filter(m=>m.trend==='up').length;const fade=(movers&&movers.length?movers:deriveMoversFromTrends()).filter(m=>m.trend==='down').length;document.getElementById('metricsText').innerHTML=`Hot: <strong>${hot}</strong><br>Contested: <strong>${contested}</strong><br>Most territory leads: <strong>${top?PLAYERS[top[0]].name:'—'}</strong><br>Movers: <strong style="color:var(--up)">▲ ${climb}</strong> · <strong style="color:var(--down)">▼ ${fade}</strong>`}
function renderPipeline(){const pipe=window._pipeline||pipeline;document.getElementById('pipeline').innerHTML=pipe.map(p=>`<div class="pipeline-item">${p}</div>`).join('')}
function renderEvents(){document.getElementById('eventLog').innerHTML=events.map(e=>`<div class="event"><div class="time">${e.time}</div>${e.text}</div>`).join('')}
function showDetail(id){const t=territories.find(x=>x.id===id);if(!t)return;const total=Object.values(t.influence).reduce((a,b)=>a+b,0)||1;const rows=Object.entries(t.influence).sort((a,b)=>b[1]-a[1]).map(([pid,val])=>{const p=PLAYERS[pid];const tr=(t.trend&&t.trend[pid])||'stable';return `<div style="display:flex;justify-content:space-between;align-items:center;margin:5px 0;gap:8px"><span><span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:${p.hex};margin-right:7px"></span>${p.name} <span class="token-trend ${trendClass(tr)}">${trendGlyph(tr)}</span></span><span>${val} (${(val/total*100).toFixed(1)}%)</span></div>`}).join('');document.getElementById('modalBody').innerHTML=`<h3>${t.name}</h3><p style="color:var(--muted);margin-bottom:10px">${t.meta}</p><p style="margin-bottom:14px;font-size:.9rem">${t.note}</p><h4 style="margin-bottom:6px">Relative Influence · Trend</h4>${rows}<p style="margin-top:12px;font-size:.72rem;color:var(--muted)">▲ climbing · ● holding · ▼ fading — relative estimates only.</p>`;document.getElementById('modal').classList.add('open')}
function showGeoDetail(id){const data=geoDominance[id];const names={na:'North America',sa:'South America',eu:'Europe',af:'Africa',as:'Asia',oc:'Oceania'};const p=PLAYERS[data.dominant];const tr=data.trend||'stable';const foci=(data.focus||[]).map(f=>`<span style="display:inline-block;margin:2px 4px 2px 0;padding:2px 8px;border-radius:4px;background:rgba(255,255,255,.06);border:1px solid var(--border);font-size:.75rem">${f}</span>`).join('');document.getElementById('modalBody').innerHTML=`<div style="font-size:.65rem;letter-spacing:.2em;color:#ef4444;margin-bottom:8px">THEATER REPORT</div><h3 style="margin-bottom:6px">${names[id]}</h3><p style="margin:8px 0">Dominant force: <strong style="color:${p.hex}">${p.name}</strong> <span class="token-trend ${trendClass(tr)}">${trendGlyph(tr)}</span></p><p style="font-size:.9rem;line-height:1.5;color:var(--muted)">${data.note||''}</p><div style="margin-top:12px;font-size:.78rem">Intensity: <strong>${(data.intensity*100).toFixed(0)}%</strong><div style="margin-top:6px;height:6px;background:#0a101c;border-radius:3px;overflow:hidden"><div style="width:${(data.intensity*100).toFixed(0)}%;height:100%;background:${p.hex};border-radius:3px"></div></div></div><div style="margin-top:14px"><div style="font-size:.72rem;color:var(--muted);margin-bottom:6px">Priority verticals in this theater</div>${foci||'—'}</div>`;document.getElementById('modal').classList.add('open')}
function closeModal(){document.getElementById('modal').classList.remove('open')}
function switchView(view){const board=document.getElementById('board'),world=document.getElementById('worldView'),human=document.getElementById('humanView'),btnB=document.getElementById('btnBoard'),btnW=document.getElementById('btnWorld'),btnH=document.getElementById('btnHuman');board.classList.add('hidden');world.classList.remove('active');human.classList.remove('active');btnB.classList.remove('active');btnW.classList.remove('active');btnH.classList.remove('active');btnH.classList.remove('human-active');if(view==='world'){world.classList.add('active');btnW.classList.add('active');document.getElementById('viewTitle').textContent='WORLD MAP — Theater of Operations';renderWorld()}else if(view==='human'){human.classList.add('active');btnH.classList.add('human-active');document.getElementById('viewTitle').textContent='HUMAN LAYER — The Feedback Engine';renderHumanLayer()}else{board.classList.remove('hidden');btnB.classList.add('active');document.getElementById('viewTitle').textContent='THE BOARD — Regulated AI Verticals'}}
function simulateUpdate(){territories.forEach(t=>{Object.keys(t.influence).forEach(pid=>{t.influence[pid]=Math.max(2,Math.min(50,t.influence[pid]+(Math.random()-.48)*3))});if(!t.trend)t.trend={};Object.keys(t.influence).forEach(pid=>{const r=Math.random();t.trend[pid]=r>.66?'up':r<.33?'down':'stable'})});movers=deriveMoversFromTrends();Object.keys(geoDominance).forEach(k=>{geoDominance[k].intensity=Math.max(.3,Math.min(.95,geoDominance[k].intensity+(Math.random()-.5)*.06));geoDominance[k].trend=Math.random()>.6?'up':Math.random()<.3?'down':'stable'});const msgs=['Influence drift across theaters.','Specialist pressure rises in Healthcare.','Google expands Legal connectors.','Microsoft deepens vertical agents.','Anthropic enterprise win in regulated sector.'];events.unshift({time:new Date().toISOString().slice(0,16).replace('T',' '),text:'Simulated: '+msgs[Math.floor(Math.random()*msgs.length)]});if(events.length>12)events.pop();document.getElementById('lastUpdate').textContent='Snapshot: '+new Date().toISOString().slice(0,16).replace('T',' ')+' (sim)';renderBoard();renderWorld();renderMetrics();renderEvents();renderMovers();renderHumanLayer()}
function resetBoard(){location.reload()}
function applySnapshot(data){if(data.players)Object.keys(data.players).forEach(k=>{if(PLAYERS[k])Object.assign(PLAYERS[k],data.players[k]);else PLAYERS[k]=data.players[k]});if(data.territories)territories=data.territories;if(data.movers)movers=data.movers;else movers=[];if(data.geoDominance){Object.keys(data.geoDominance).forEach(k=>{geoDominance[k]=Object.assign(geoDominance[k]||{}, data.geoDominance[k])})}if(data.events)events=data.events;if(data.pipeline)window._pipeline=data.pipeline;if(data.meta&&data.meta.snapshotDate){const el=document.getElementById('lastUpdate');if(el)el.textContent='Snapshot: '+data.meta.snapshotDate}}
function renderHumanLayer(){
  const hot=territories.filter(t=>t.status==='hot');
  const contested=territories.filter(t=>t.status==='contested');
  const theaters=Object.values(geoDominance);
  const avgIntensity=theaters.reduce((a,d)=>a+d.intensity,0)/(theaters.length||1);
  const highTheaters=theaters.filter(d=>d.intensity>=0.7).length;
  const boardPressure=hot.length*2+contested.length;
  const theaterSurface=Math.round(avgIntensity*100);
  const el=document.getElementById('humanMetrics');
  if(el){
    el.innerHTML=`
      <div class="human-metric">
        <div class="label">Board — feedback pressure</div>
        <div class="value">${boardPressure}</div>
        <div class="sub">${hot.length} hot · ${contested.length} contested verticals<br>Where humans actively correct & accept agent output</div>
      </div>
      <div class="human-metric">
        <div class="label">Theater — adoption surface</div>
        <div class="value">${theaterSurface}%</div>
        <div class="sub">Avg geographic intensity · ${highTheaters} high-intensity theaters<br>Where enterprise humans sit in the loop at scale</div>
      </div>
      <div class="human-metric">
        <div class="label">Loop strength</div>
        <div class="value">${Math.min(99, boardPressure*8 + theaterSurface)}</div>
        <div class="sub">Composite of board heat + theater density<br>Higher = stronger human reward signal into platforms</div>
      </div>
      <div class="human-metric">
        <div class="label">Invisible engine</div>
        <div class="value">Active</div>
        <div class="sub">Humans remain the heart of the loop even when they stand at the end of the digital chain</div>
      </div>`;
  }
  const bridge=document.getElementById('humanBridgeNote');
  if(bridge){
    bridge.innerHTML=` Currently: <strong style="color:var(--human)">${hot.map(t=>t.name).join(', ')||'—'}</strong> are the hottest board fronts — the same verticals that pull human feedback hardest into Legal, FS and the next contested zones.`;
  }
}
function renderAll(){renderPlayers();renderLegend();renderBoard();renderWorld();renderMetrics();renderPipeline();renderEvents();renderMovers();renderHumanLayer()}
async function loadExternalSnapshot(){try{const res=await fetch('data/snapshot.json',{cache:'no-store'});if(!res.ok)throw new Error('no snapshot');const data=await res.json();applySnapshot(data);renderAll();console.info('Loaded data/snapshot.json')}catch(e){renderAll();console.info('Using embedded snapshot')}await populateSnapshotSelect()}
async function populateSnapshotSelect(){const sel=document.getElementById('snapshotSelect');if(!sel)return;try{const res=await fetch('data/history/index.json',{cache:'no-store'});if(!res.ok)return;const idx=await res.json();sel.innerHTML='';const optCurrent=document.createElement('option');optCurrent.value='current';optCurrent.textContent='Current';sel.appendChild(optCurrent);(idx.snapshots||[]).slice().reverse().forEach(s=>{const opt=document.createElement('option');opt.value=s.id;opt.textContent=s.date+(s.label?' — '+s.label.slice(0,40):'');sel.appendChild(opt)});sel.value='current'}catch(e){console.info('History index not available')}}
async function loadSnapshotFromSelect(){const sel=document.getElementById('snapshotSelect');if(!sel)return;const id=sel.value;try{let url='data/snapshot.json';if(id&&id!=='current')url='data/history/'+id+'.json';const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw new Error('load failed');const data=await res.json();applySnapshot(data);renderAll();const label=id==='current'?((data.meta&&data.meta.snapshotDate)||'current'):id;const el=document.getElementById('lastUpdate');if(el)el.textContent='Snapshot: '+label}catch(e){console.warn('Could not load snapshot',id,e)}}
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
try{if(localStorage.getItem('raw_entered')==='1')document.getElementById('intro').classList.add('hide')}catch(e){}
loadExternalSnapshot();
