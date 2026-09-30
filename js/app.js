/* ==========================================================================
   APLICAÇÃO — estado, progresso, revisão espaçada e telas
   ========================================================================== */
const CASE_MAP=Object.fromEntries(CLINICAL_CASES.map(c=>[c.id,c]));
const TRAIN_TOPICS={
 geral:{label:'Treino geral',test:()=>true,description:'Todos os padrões do banco.'},
 isquemia:{label:'Infarto e isquemia',test:p=>p.cat==='isquemia',description:'Padrões de isquemia e infarto do banco.'},
 taqui:{label:'Taquiarritmias',test:p=>['taqui_sinusal','fa','flutter','tsv','tv','torsades','tam'].includes(p.id),description:'Reconhecimento dos ritmos rápidos selecionados.'},
 outros:{label:'Metabólico e outros',test:p=>p.cat==='metabolico',description:'Eletrólitos, pericardite, Brugada e TEP.'},
 bradi:{label:'Bradiarritmias',test:p=>['brady_sinusal','mobitz1','mobitz2','bavt','juncional','bav_2para1'].includes(p.id),description:'Bradicardia, ritmos de escape e bloqueios com redução da resposta ventricular.'}
};

const S = {
  mode: 'aprender', libSel: 'f:papel', boxes: {}, hits: {},
  streak: 0, best: 0, total: 0, right: 0, zoomAdj: 1, caliper: false,
  quiz: null, sim: null, laudo: null, reviews: {}, review: null, trainTopic: 'geral', trainFormat: 'rapido', caseStats: {}, caseRun: null, showCase: false
};
PADROES.forEach(p => { S.boxes[p.id] = 0; S.hits[p.id] = {c: 0, e: 0}; });
const $ = s => document.querySelector(s);
function el(tag, cls, html){ const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
function shuffle(a){ a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function esc(s){ return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function frase(s){ s = s || ''; const i = s.indexOf('. '); return i > 25 ? s.slice(0, i + 1) : s; }
function varySpec(spec){
  const sh = Math.random() * 0.5;
  spec.beats = (spec.beats || []).map(b => Object.assign({}, b, {t: b.t + sh}));
  if (spec.atrial && spec.atrial.list) spec.atrial = Object.assign({}, spec.atrial, {list: spec.atrial.list.map(t => typeof t === 'object' ? Object.assign({}, t, {t: t.t + sh}) : t + sh)});
  spec.seed = Math.floor(Math.random() * 99999);
  spec.ampScale = 0.93 + Math.random() * 0.15;
  return spec;
}
/* Anotações baseadas nos mesmos tempos usados pelo sintetizador. */
function guideBands(pat,spec,lead,mode,t0,t1){
  if(pat.id==='fv')return [{start:t0,end:Math.min(t1,t0+1.2),label:'Traçado caótico',color:'#7134a0'}];
  const mods=Object.assign({},spec.global||{},spec.leadMods?.[lead]||{});
  const beats=(spec.beats||[]).filter(b=>b.t>=t0+0.05 && b.t<t1-0.15);
  const make=(start,end,label,color)=>({start:Math.max(t0,start),end:Math.min(t1,end),label,color});
  const qrsDuration=b=> b.kind==='v' ? (b.qrsDur??0.16) : (b.qrsDur??b.mods?.qrsDur??mods.qrsDur??0.09);
  if(mode==='p'){
    const a=spec.atrial||{};
    if(['fib','flutter','none'].includes(a.mode) || a.ampScale===0 || mods.p===0)return [];
    const dur=a.dur||0.10;
    return (a.list||[]).map(pt=>typeof pt==='object'?pt.t:pt).filter(t=>Number.isFinite(t)&&t-dur/2>=t0&&t+dur/2<=t1).slice(0,2).map(t=>make(t-dur/2,t+dur/2,'P','#175da8'));
  }
  if(mode==='qrs')return beats.slice(0,2).map(b=>make(b.t,b.t+qrsDuration(b),'QRS','#a64b00'));
  if(mode==='stt'){
    if(['torsades','tv'].includes(pat.id))return [];
    return beats.slice(0,1).map(b=>{const m={...mods,...b.mods};const j=b.t+qrsDuration(b);const end=j+(m.stLen??0.09)+(m.tDur??0.16)*1.4;const next=spec.beats.find(n=>n.t>b.t);
      return make(j,Math.min(end,next?next.t-0.02:end),'ST–T','#943a7e');}).filter(b=>b.end>b.start);
  }
  if(mode==='ritmo' && beats.length>1)return [make(beats[0].t,beats[1].t,'Ciclo entre QRS','#087366')];
  return [];
}
function guideDescription(pat,spec,lead,mode){
  if(pat.id==='fv')return 'Observe o traçado como um todo. '+pat.criterios[0]+'. Não são marcadas ondas P, QRS ou ST–T isoladas neste padrão.';
  const prefix='Em '+lead+': ';
  if(mode==='p'){
    if(!guideBands(pat,spec,lead,mode,0,spec.dur||10).length)return prefix+'não há onda P isolada marcada neste padrão. Compare a atividade atrial com a descrição do ritmo: '+pat.laudo.ritmo+'.';
    return prefix+'as faixas azuis localizam exemplos de onda P, relacionada à ativação atrial. Observe a forma e a relação com o QRS. Ritmo do caso: '+pat.laudo.ritmo+'.';
  }
  if(mode==='qrs')return prefix+'as faixas laranja localizam exemplos de complexo QRS, relacionado à ativação ventricular. Compare largura e forma. Descrição do caso: '+pat.laudo.qrs+'.';
  if(mode==='stt')return ['torsades','tv'].includes(pat.id) ? 'Neste padrão, não delimitamos ST–T separadamente. Descrição do caso: '+pat.laudo.stt+'.' : prefix+'a faixa rosa indica a região após o QRS, incluindo ST e T, para observar a repolarização ventricular. Descrição do caso: '+pat.laudo.stt+'.';
  return prefix+'a faixa verde compara o início de dois QRS consecutivos. Observe se os espaçamentos se repetem ao longo de toda a tira. Ritmo: '+pat.laudo.ritmo+'. Frequência descrita: '+pat.laudo.fc+'.';
}
function iniciarRevisao(id){
  const pat=PMAP[id]; if(!pat || !S.reviews[id] || S.reviews[id].due>Date.now())return;
  const q=novaQuestao(pat,'dx');q.spec=varySpec(pat.build());
  S.review={q,respondida:false};render();window.scrollTo(0,0);
}
function viewRevisar(root){
  if(!S.review)clinicalReviewCard(root);
  if(S.review){
    const session=S.review,q=session.q;
    const card=el('div','card fade');root.appendChild(card);
    card.appendChild(el('h3',null,'Revisão dos erros'));
    card.appendChild(el('p','muted','Recupere o diagnóstico antes de ver a explicação.'));
    const ecg=el('div');card.appendChild(ecg);
    const box=mountECG(ecg,q.pat,{spec:q.spec,locked:true,explain:session.respondida});
    const options=el('div','opts');card.appendChild(options);
    q.opts.forEach((option,i)=>{
      const button=el('button','opt','<span class="k">'+'ABCD'[i]+'</span><span>'+esc(option.t)+'</span>');
      button.disabled=session.respondida;
      if(session.respondida && option.ok)button.classList.add('right');
      if(session.respondida && session.escolha===i && !option.ok)button.classList.add('wrong');
      button.onclick=()=>{
        if(session.respondida)return;
        session.respondida=true;session.escolha=i;
        registrar(q.pat.id,option.ok);render();
      };
      options.appendChild(button);
    });
    if(session.respondida){
      const correct=q.opts[session.escolha].ok;
      card.appendChild(el('div','box '+(correct?'ok':'err'),'<b>'+esc(correct?'Correto':'Vamos revisar novamente')+'</b><br>'+esc(q.pat.nome)));
      const feedback=el('div','review-feedback');
      feedback.appendChild(el('p',null,'Próxima revisão: '+esc(quandoRevisar(S.reviews[q.pat.id].due))));
      const list=el('ul','crit');q.pat.criterios.forEach(text=>list.appendChild(el('li',null,esc(text))));feedback.appendChild(list);
      const next=el('button','btn primary','Próxima revisão');next.onclick=()=>{S.review=null;const due=revisoesVencidas();if(due.length)iniciarRevisao(due[0].id);else render();};feedback.appendChild(next);card.appendChild(feedback);
    }
    const back=el('button','btn ghost','Voltar à agenda');back.onclick=()=>{S.review=null;render();};card.appendChild(back);
    return;
  }
  const due=revisoesVencidas(), entries=PADROES.filter(p=>S.reviews[p.id]).sort((a,b)=>S.reviews[a.id].due-S.reviews[b.id].due);
  const card=el('div','card fade');root.appendChild(card);
  card.appendChild(el('h3',null,'Revisão espaçada dos erros'));
  card.appendChild(el('p','muted','Errou? O padrão volta em 10 minutos. Acertos na revisão agendada levam a intervalos de 1, 3, 7, 21 e 60 dias. Um novo erro reinicia o ciclo.'));
  card.appendChild(el('p','pill',due.length+' disponíveis agora · '+(entries.length-due.length)+' agendadas'));
  if(due.length){const start=el('button','btn primary','Revisar agora');start.onclick=()=>iniciarRevisao(due[0].id);card.appendChild(start);}
  else card.appendChild(el('p',null,entries.length?'Tudo em dia. Próxima revisão: '+esc(quandoRevisar(S.reviews[entries[0].id].due))+'.':'Sua agenda começa quando você erra no treino, no simulado ou marca que não fechou um laudo.'));
  for(const pat of entries){
    const record=S.reviews[pat.id],row=el('div','review-row');
    const text=el('div');text.appendChild(el('b',null,esc(pat.nome)));
    text.appendChild(el('p','muted small',esc(quandoRevisar(record.due))+' · '+record.errors+' erro(s) · etapa '+record.step+'/'+REVIEW_DAYS.length));row.appendChild(text);
    if(record.due<=Date.now()){const button=el('button','btn','Revisar');button.onclick=()=>iniciarRevisao(pat.id);row.appendChild(button);}
    card.appendChild(row);
  }
  const refresh=el('button','btn ghost','Atualizar agenda');refresh.onclick=()=>render();card.appendChild(refresh);
  card.appendChild(el('p','muted small','A agenda é salva neste navegador e acompanha a exportação do progresso. Ela não envia notificações. Acertos antes da data não adiam a revisão.'));
}

function mountECG(host, pat, opts){
  opts = opts || {};
  if (cacheSig.size > 500) cacheSig.clear();
  const spec = opts.spec || varySpec(pat.build());
  const box = el('div', 'ecgbox' + (S.caliper ? ' caliper-on' : ''));
  const scroll = el('div', 'ecgscroll');
  const cv = document.createElement('canvas');
  scroll.appendChild(cv); box.appendChild(scroll);
  host.appendChild(box);
  const bar = el('div', 'ecgbar');
  const bCal = el('button', 'btn' + (S.caliper ? ' on' : ''), '📏 Compasso');
  const bMinus = el('button', 'btn ghost', '−');
  const bPlus = el('button', 'btn ghost', '+');
  const bNew = el('button', 'btn ghost', '↻ Outro traçado');
  const ro = el('span', 'readout', S.caliper ? 'Arraste sobre o traçado para medir' : '');
  bMinus.setAttribute('aria-label', 'Diminuir zoom'); bPlus.setAttribute('aria-label', 'Aumentar zoom');
  cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Traçado de ECG para interpretação');
  ro.setAttribute('aria-live', 'polite');
  // Derivações extras (ex.: V3R/V4R) só aparecem quando pedidas. opts.extra: 'button' (padrão), 'on' ou 'off'.
  const extraMode = pat.extraView ? (opts.extra || 'button') : 'off';
  const bExtra = extraMode !== 'off' ? el('button', 'btn ghost') : null;
  bar.append(bCal, bMinus, bPlus); if (bExtra) bar.append(bExtra); if (!opts.locked) bar.append(bNew); bar.append(ro);
  host.appendChild(bar);
  let current = spec;
  let guideMode = null, guidePanel = null, guideButtons = [];
  let guideLead = (pat.view?.leads || []).includes('DII') ? 'DII' : (pat.view?.leads?.[0] || 'DII');
  const baseView = Object.assign({}, pat.view, opts.view || {});
  let view = extraMode === 'on' ? Object.assign({}, pat.extraView.view) : baseView;
  const extraLabel = () => { if (!bExtra) return; const on = view !== baseView; bExtra.textContent = on ? '↩ Voltar às 12 derivações' : '➕ ' + pat.extraView.label; bExtra.setAttribute('aria-pressed', String(on)); };
  extraLabel();
  function draw(){
    const avail = Math.max(280, (host.clientWidth || 900) - 2);
    const px = Math.max(2.2, Math.min(9, avail / ecgTotalMm(current, view) * S.zoomAdj));
    renderECG(cv, current, Object.assign({}, view, {pxPerMm: px, annotations:guideMode ? {mode:guideMode,lead:guideLead,pat} : null}));
  }
  const hint = el('div', 'scrollhint', '↔ arraste para ver inteiro');
  box.appendChild(hint);
  function draw2(){ draw(); hint.style.display = (cv.offsetWidth > scroll.clientWidth + 4) ? 'block' : 'none'; }
  draw2();
  (window.__draws = window.__draws || []).push(draw2);
  attachCaliper(cv, ro);
  bCal.onclick = () => { S.caliper = !S.caliper; box.classList.toggle('caliper-on', S.caliper); bCal.classList.toggle('on', S.caliper); ro.textContent = S.caliper ? 'Arraste sobre o traçado para medir' : ''; };
  bMinus.onclick = () => { S.zoomAdj = Math.max(0.6, S.zoomAdj - 0.25); draw2(); };
  bPlus.onclick  = () => { S.zoomAdj = Math.min(3.0, S.zoomAdj + 0.25); draw2(); };
  if (bExtra) bExtra.onclick = () => { view = view === baseView ? Object.assign({}, pat.extraView.view) : baseView; extraLabel(); draw2(); };
  bNew.onclick   = () => { if (cacheSig.size > 500) cacheSig.clear(); current = varySpec(pat.build()); draw2(); if(guidePanel)updateGuide(); };
  function updateGuide(){
    guideButtons.forEach(([mode,button])=>{button.setAttribute('aria-pressed',String(guideMode===mode));button.classList.toggle('on',guideMode===mode);});
    const note=guidePanel.querySelector('.guide-note');
    note.textContent=guideMode ? guideDescription(pat,current,guideLead,guideMode) : 'Escolha um destaque para localizar os achados neste mesmo ECG.';
    draw2();
  }
  box.enableGuide=()=>{
    if(guidePanel || !pat.laudo)return;
    guidePanel=el('section','ecg-guide');guidePanel.setAttribute('aria-label','Explicações no ECG');
    guidePanel.appendChild(el('h4',null,'Entenda este traçado'));
    const controls=el('div','guide-controls');
    for(const [mode,label] of [['p','Onda P'],['qrs','QRS'],['stt','ST–T'],['ritmo','Ritmo'],[null,'Traçado limpo']]){
      const button=el('button','btn',label);button.onclick=()=>{guideMode=mode;updateGuide();};guideButtons.push([mode,button]);controls.appendChild(button);
    }
    const select=el('select','guide-select');select.setAttribute('aria-label','Derivação do destaque');
    for(const lead of [...new Set([...(view.leads||['DII']),...(view.rhythmLead?[view.rhythmLead]:[])])]){const option=el('option',null,lead);option.value=lead;select.appendChild(option);}
    select.value=guideLead;select.onchange=()=>{guideLead=select.value;updateGuide();const column=view.layout==='grid12'?Math.floor(view.leads.indexOf(guideLead)/3):0;scroll.scrollLeft=Math.max(0,column*62.5*(cv.__px||3.2));};controls.appendChild(select);
    guidePanel.appendChild(controls);
    const note=el('p','guide-note');note.setAttribute('aria-live','polite');guidePanel.appendChild(note);
    const details=el('details');details.appendChild(el('summary',null,'Achados que sustentam o diagnóstico'));
    const list=el('ul','crit');pat.criterios.forEach(text=>list.appendChild(el('li',null,esc(text))));details.appendChild(list);guidePanel.appendChild(details);
    guidePanel.appendChild(el('p','muted small','As faixas indicam regiões didáticas aproximadas; use o compasso para medir. <a href="https://www.msdmanuals.com/professional/multimedia/image/electrocardiography-ecg-waves" target="_blank" rel="noopener">Referência: ondas do ECG · MSD</a>'));
    host.appendChild(guidePanel);updateGuide();
  };
  if(opts.explain || !opts.locked)box.enableGuide();
  return box;
}
function distratores(pat, n){
  let pool = (pat.confunde || []).map(id => PMAP[id]).filter(Boolean);
  if (pool.length < n){
    const extra = PADROES.filter(p => p.cat === pat.cat && p.id !== pat.id && !pool.includes(p));
    pool = pool.concat(shuffle(extra));
  }
  if (pool.length < n) pool = pool.concat(shuffle(PADROES.filter(p => p.id !== pat.id && !pool.includes(p))));
  return pool.slice(0, n);
}
function novaQuestao(pat, tipoForcado){
  const tipos = ['dx', 'dx', 'dx', 'criterio', 'conduta'];
  let tipo = tipoForcado || tipos[Math.floor(Math.random() * tipos.length)];
  const outros = distratores(pat, 3);
  if (tipo === 'criterio'){
    const corr = pat.criterios[0];
    const normalize = t => t.toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ').trim();
    const forbidden = new Set(pat.criterios.map(normalize));
    const seen = new Set(forbidden);
    const wrong = outros.flatMap(o => o.criterios).filter(t => {
      const key = normalize(t); if (seen.has(key)) return false; seen.add(key); return true;
    }).slice(0, 3);
    if (wrong.length === 3) return {pat, tipo, enun: 'Qual achado MELHOR define o diagnóstico deste traçado?', opts: shuffle([{t:corr, ok:true}, ...wrong.map(t => ({t, ok:false}))]), mostraNome:true};
    tipo = 'dx';
  }
  if (tipo === 'conduta'){
    const opts = shuffle([{t: frase(pat.conduta), ok: true}].concat(outros.map(o => ({t: frase(o.conduta), ok: false}))));
    if (new Set(opts.map(o => o.t.trim().toLowerCase())).size === opts.length) return {pat, tipo, enun: 'Qual a conduta correta para este traçado?', opts, mostraNome: false};
    tipo = 'dx';
  }
  const opts = shuffle([{t: pat.nome, ok: true}].concat(outros.map(o => ({t: o.nome, ok: false}))));
  return {pat, tipo, enun: 'Qual é o diagnóstico eletrocardiográfico?', opts, mostraNome: false};
}
const CHAVE_PROG = 'treinador-ecg:progresso';
const REVIEW_DAYS = [1, 3, 7, 21, 60];
function dadosProgresso(){return {version:3,b:S.boxes,h:S.hits,t:S.total,r:S.right,m:S.best,reviews:S.reviews,caseStats:S.caseStats,caseRun:S.caseRun};}
function agendarRevisao(id, acertou, now=Date.now()){
  const old = S.reviews[id];
  if (!acertou){S.reviews[id]={due:now+10*60*1000,step:0,errors:(old?.errors||0)+1,last:now};return;}
  // Acertos antecipados não empurram uma revisão nem aumentam seu intervalo.
  if (!old || old.due>now) return;
  const days=REVIEW_DAYS[Math.min(old.step,REVIEW_DAYS.length-1)];
  S.reviews[id]={...old,due:now+days*86400000,step:Math.min(old.step+1,REVIEW_DAYS.length),last:now};
}
function revisoesVencidas(now=Date.now()){
  return PADROES.filter(p=>S.reviews[p.id] && S.reviews[p.id].due<=now).sort((a,b)=>S.reviews[a.id].due-S.reviews[b.id].due);
}
function quandoRevisar(due,now=Date.now()){
  if(due<=now)return 'Disponível agora';
  if(due-now<3600000)return 'Em '+Math.ceil((due-now)/60000)+' min';
  return new Date(due).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
}
function validarProgresso(d){
  if (!d || typeof d !== 'object' || Array.isArray(d)) throw Error('Formato inválido');
  const number=(v,max=Number.MAX_SAFE_INTEGER)=>{if(!Number.isSafeInteger(v)||v<0||v>max)throw Error('Valor inválido');return v;};
  const result={b:{},h:{},t:number(d.t),r:number(d.r),m:number(d.m),reviews:{},caseStats:{},caseRun:null};
  if(result.r>result.t || result.m>result.r) throw Error('Totais inconsistentes');
  if(!d.b || !d.h) throw Error('Progresso incompleto');
  for(const p of PADROES){result.b[p.id]=number(d.b[p.id]??0,4);const h=d.h[p.id]||{c:0,e:0};result.h[p.id]={c:number(h.c),e:number(h.e)};}
  if(d.reviews !== undefined){
    if(!d.reviews || typeof d.reviews!=='object' || Array.isArray(d.reviews))throw Error('Agenda inválida');
    for(const p of PADROES){const r=d.reviews[p.id];if(r===undefined)continue;
      if(!r || typeof r!=='object')throw Error('Revisão inválida');
      result.reviews[p.id]={due:number(r.due,8640000000000000),step:number(r.step,REVIEW_DAYS.length),errors:number(r.errors),last:number(r.last,8640000000000000)};
    }
  } else {
    // Migração de backups v3.1/v3.2: erros ainda não dominados entram na fila.
    for(const p of PADROES)if(result.h[p.id].e>0 && result.b[p.id]<4)result.reviews[p.id]={due:Date.now(),step:0,errors:result.h[p.id].e,last:0};
  }
  if(d.caseStats !== undefined){
    if(!d.caseStats || typeof d.caseStats!=='object' || Array.isArray(d.caseStats))throw Error('Casos inválidos');
    for(const c of CLINICAL_CASES){const record=d.caseStats[c.id];if(record===undefined)continue;
      if(!record || typeof record!=='object')throw Error('Resultado inválido');
      result.caseStats[c.id]={attempts:number(record.attempts),best:number(record.best,100),last:number(record.last,8640000000000000),due:number(record.due,8640000000000000),step:number(record.step,REVIEW_DAYS.length),errors:number(record.errors)};
    }
  }
  if(d.caseRun != null){
    const run=d.caseRun,c=CASE_MAP[run.id];if(!c || typeof run.done!=='boolean')throw Error('Sessão inválida');
    const keys=Object.keys(c.scenarios||{}),scenario=keys.length?run.scenario:null;
    // Tentativa salva antes de o caso ganhar cenários: descarta só a tentativa, sem perder o progresso.
    if(keys.length&&(run.scenario===undefined||run.scenario===null))return result;
    if(keys.length&&!keys.includes(scenario))throw Error('Cenário inválido');
    // Conteúdo do caso revisado (campo rev): as respostas salvas podem apontar para itens trocados; descarta só a tentativa.
    if((run.rev??1)!==(c.rev||1))return result;
    const steps=caseSteps(c,scenario);
    if(!Array.isArray(run.answers)||!Array.isArray(run.order)||run.answers.length!==run.order.length)throw Error('Etapas inválidas');
    // Caso redesenhado depois que a tentativa começou (outro número de etapas): descarta só a tentativa.
    if(run.answers.length!==steps.length)return result;
    // Etapa com outra quantidade de alternativas (checklist revisado): descarta só a tentativa.
    // Ordens malformadas continuam sendo rejeitadas mais abaixo.
    const wellFormed=items=>Array.isArray(items)&&items.every(v=>Number.isSafeInteger(v)&&v>=0&&v<items.length)&&new Set(items).size===items.length;
    if(run.order.some((items,i)=>wellFormed(items)&&items.length!==steps[i].options.length&&!(items.length===steps[i].options.length-1&&!steps[i].multi)))return result;
    const index=number(run.index,steps.length-1),seed=number(run.seed,100000);
    const answers=run.answers.map((a,i)=>a===null?null:number(a,steps[i].multi?2**steps[i].options.length-1:steps[i].options.length-1));
    const order=run.order.map((items,i)=>{const length=steps[i].options.length;
      // Backups v3.4 tinham 3 alternativas; a nova entra no fim sem alterar índices respondidos.
      if(Array.isArray(items)&&items.length===length-1&&new Set(items).size===items.length&&items.every(v=>Number.isSafeInteger(v)&&v>=0&&v<length-1))items=[...items,length-1];
      if(!Array.isArray(items)||items.length!==length||new Set(items).size!==length)throw Error('Alternativas inválidas');return items.map(v=>number(v,length-1));});
    if(answers.some((a,i)=>(i<index&&a===null)||(i>index&&a!==null)) || run.done!==(index===steps.length-1&&answers[index]!==null))throw Error('Estado de caso inconsistente');
    result.caseRun={id:c.id,rev:c.rev||1,scenario,index,answers,order,seed,done:run.done};
  }
  return result;
}
function aplicarProgresso(d){const v=validarProgresso(d);S.boxes=v.b;S.hits=v.h;S.total=v.t;S.right=v.r;S.best=v.m;S.streak=0;S.reviews=v.reviews;S.review=null;S.caseStats=v.caseStats;S.caseRun=v.caseRun;S.quiz=null;S.showCase=!!v.caseRun;if(v.caseRun){S.trainTopic=CASE_MAP[v.caseRun.id].track;S.trainFormat='casos';}}
function avisoSalvar(){let msg=$('#save-warning');if(!msg){msg=el('div','box err','Não foi possível salvar neste navegador. Exporte seu progresso na aba Progresso.');msg.id='save-warning';msg.setAttribute('role','alert');document.body.appendChild(msg);}}
function salvarProgresso(){
  try {
    localStorage.setItem(CHAVE_PROG, JSON.stringify(
      dadosProgresso()));
  } catch (e) { avisoSalvar(); }
}
function carregarProgresso(){
  try {
    const bruto = localStorage.getItem(CHAVE_PROG);
    if (!bruto) return;
    aplicarProgresso(JSON.parse(bruto));
  } catch (e) { /* dado corrompido: recomeça limpo */ }
}
function registrar(id, acertou){
  agendarRevisao(id, acertou);
  S.total++;
  const h = S.hits[id];
  if (acertou){ h.c++; S.right++; S.streak++; S.best = Math.max(S.best, S.streak); S.boxes[id] = Math.min(4, S.boxes[id] + 1); }
  else { h.e++; S.streak = 0; S.boxes[id] = 0; }
  salvarProgresso();
  const badge=document.querySelector('[data-review-tab]');if(badge)badge.textContent='Revisar erros ('+totalReviewDue()+')';
}
function proximoPadrao(filtro){
  let pool = PADROES.filter(p => !filtro || filtro(p));
  const due = revisoesVencidas().find(p=>pool.includes(p)); if(due)return due;
  const min = Math.min.apply(null, pool.map(p => S.boxes[p.id]));
  const fracos = pool.filter(p => S.boxes[p.id] <= min + 1);
  return fracos[Math.floor(Math.random() * fracos.length)];
}
function detalhePadrao(pat, host){
  host.innerHTML = '';

  const c = el('div', 'card fade');
  const head = el('div');
  head.appendChild(el('h3', null, esc(pat.nome)));
  const tr = el('div', 'tagrow');
  tr.appendChild(el('span', 'tag cat', CATS[pat.cat]));
  if (pat.emerg) tr.appendChild(el('span', 'tag emg', '⚠ emergência'));
  tr.appendChild(el('span', 'tag', 'domínio ' + S.boxes[pat.id] + '/4'));
  head.appendChild(tr);
  c.appendChild(head);
  const ecg = el('div'); ecg.style.marginTop = '16px'; c.appendChild(ecg);
  host.appendChild(c);
  mountECG(ecg, pat);
  if (MAPA_ANATOMICO[pat.id]) {
    const cAnat = el('div', 'card fade');
    cAnat.appendChild(el('h3', null, 'Correlação Anatômica Coronal'));
    cAnat.appendChild(el('p', 'muted small', 'Área do miocárdio e respectiva artéria tipicamente acometida por este padrão:'));
    atualizarAnatomia(pat.id, cAnat);
    host.appendChild(cAnat);
  }
  const c2 = el('div', 'card fade');
  c2.appendChild(el('h3', null, 'Critérios Diagnósticos Essenciais'));
  const ul = el('ul', 'crit');
  pat.criterios.forEach(x => ul.appendChild(el('li', null, esc(x))));
  c2.appendChild(ul);
  host.appendChild(c2);
  if (pat.pegadinha || pat.conduta) {
    const c3 = el('div', 'card fade');
    c3.appendChild(el('h3', null, 'Prática Clínica e Armadilhas'));
    if (pat.pegadinha) c3.appendChild(el('div', 'box peg', '<span class="lbl">Pegadinha de Prova / Plantão</span>' + esc(pat.pegadinha)));
    if (pat.conduta)   c3.appendChild(el('div', 'box cond', '<span class="lbl">Conduta Recomendada</span>' + esc(pat.conduta)));
    host.appendChild(c3);
  }
  const c4 = el('div', 'card fade');
  c4.appendChild(el('h3', null, 'Laudo Estruturado Modelo'));
  c4.appendChild(laudoTabela(pat, false));
  host.appendChild(c4);
}
const LKEYS = [['ritmo','Ritmo'],['fc','Frequência'],['eixo','Eixo'],['pr','PR'],['qrs','QRS'],['stt','ST-T'],['conclusao','Conclusão']];
function laudoTabela(pat, ocultar){
  const w = el('div', 'laudo');
  LKEYS.forEach(([k, lbl]) => {
    const row = el('div', 'lrow');
    row.appendChild(el('div', 'lk', lbl));
    const v = el('div', 'lv' + (ocultar ? ' hidden' : ''), ocultar ? '— responda mentalmente, depois revele —' : esc(pat.laudo[k]));
    v.dataset.txt = pat.laudo[k];
    row.appendChild(v);
    if (ocultar){
      const m = el('div', 'mark');
      const y = el('button', 'y', '✓'), n = el('button', 'n', '✕');
      y.onclick = () => { y.classList.add('on'); n.classList.remove('on'); row.dataset.res = '1'; atualizaLaudoScore(); };
      n.onclick = () => { n.classList.add('on'); y.classList.remove('on'); row.dataset.res = '0'; atualizaLaudoScore(); };
      m.append(y, n); row.appendChild(m); m.style.display = 'none'; row.__mark = m;
    }
    w.appendChild(row);
  });
  return w;
}
function atualizaLaudoScore(){
  const rows = document.querySelectorAll('#laudoTab .lrow');
  let ok = 0, tot = 0;
  rows.forEach(r => { if (r.dataset.res !== undefined){ tot++; if (r.dataset.res === '1') ok++; } });
  const s = $('#laudoScore'); if (s) s.textContent = tot ? (ok + ' de ' + tot + ' itens corretos') : '';
}
function viewAprender(root){
  const wrap = el('div', 'lib');
  const nav = el('div', 'libnav');
  const search=el('input','library-search'); search.type='search'; search.value=S.libSearch||''; search.placeholder='Buscar padrão ou aula'; search.setAttribute('aria-label','Buscar padrão ou aula');
  const filter=el('select','library-search'); filter.setAttribute('aria-label','Filtrar dificuldade');
  for(const [val,label] of [['','Todos os níveis'],['1','Nível 1'],['2','Nível 2'],['3','Nível 3']]){const option=el('option',null,label);option.value=val;filter.appendChild(option);}
  const empty=el('p','muted','Nenhum resultado.'); empty.hidden=true;
  nav.append(search,filter,empty);
  const normalize=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function applyFilter(){let count=0;nav.querySelectorAll('.libitem').forEach(item=>{item.hidden= !normalize(item.textContent).includes(normalize(search.value)) || !!(filter.value && item.dataset.level!==filter.value);if(!item.hidden)count++;});empty.hidden=!!count;}
  filter.value=S.libLevel||'';
  search.oninput=()=>{S.libSearch=search.value;applyFilter();};filter.onchange=()=>{S.libLevel=filter.value;applyFilter();};
  nav.appendChild(el('div', 'libgrp', 'Fundamentos'));
  FUNDAMENTOS.forEach(f => {
    const b = el('button', 'libitem' + (S.libSel === 'f:' + f.id ? ' on' : ''),
      '<span class="dot base"></span>' + esc(f.titulo));
    b.onclick = () => { S.libSel = 'f:' + f.id; render(); window.scrollTo(0, 0); };
    nav.appendChild(b);
  });
  Object.keys(CATS).forEach(cat => {
    nav.appendChild(el('div', 'libgrp', CATS[cat]));
    PADROES.filter(p => p.cat === cat).forEach(p => {
      const b = el('button', 'libitem' + (S.libSel === p.id ? ' on' : ''), '<span class="dot b' + S.boxes[p.id] + '"></span>' + esc(p.nome));
      b.dataset.level=String(p.nivel);
      b.onclick = () => { S.libSel = p.id; render(); window.scrollTo(0, 0); };
      nav.appendChild(b);
    });
  });
  applyFilter();
  const main = el('div');
  wrap.append(nav, main); root.appendChild(wrap);
  if (String(S.libSel).indexOf('f:') === 0){
    aula(FMAP[S.libSel.slice(2)] || FUNDAMENTOS[0], main);
  } else {
    detalhePadrao(PMAP[S.libSel] || PADROES[0], main);
  }
}
function caseRecord(id){return S.caseStats[id] || {attempts:0,best:0,last:0,due:0,step:0,errors:0};}
function caseDue(now=Date.now()){return CLINICAL_CASES.filter(c=>caseRecord(c.id).due>0 && caseRecord(c.id).due<=now);}
function totalReviewDue(){return revisoesVencidas().length+caseDue().length;}
function scheduleCase(id,correct,now=Date.now()){
 const record={...caseRecord(id)};
 if(!correct){record.due=now+600000;record.step=0;record.errors++;}
 else if(record.due>0 && record.due<=now){record.due=now+REVIEW_DAYS[Math.min(record.step,REVIEW_DAYS.length-1)]*86400000;record.step=Math.min(record.step+1,REVIEW_DAYS.length);}
 S.caseStats[id]=record;
}
function startClinicalCase(id,scenario){
 const c=CASE_MAP[id];if(!c)return;
 if(S.caseRun?.id!==id || S.caseRun.done || scenario!==undefined){
  const keys=Object.keys(c.scenarios||{});
  // Cenário sorteado a cada tentativa (ex.: hospital com ou sem hemodinâmica).
  const chosen=keys.length?(keys.includes(scenario)?scenario:keys[Math.floor(Math.random()*keys.length)]):null;
  const steps=caseSteps(c,chosen);
  S.caseRun={id,rev:c.rev||1,scenario:chosen,index:0,answers:steps.map(()=>null),order:steps.map(s=>shuffle(s.options.map((_,i)=>i))),seed:Math.floor(Math.random()*99999)+1,done:false};
 }
 S.trainFormat='casos';S.trainTopic=c.track;S.mode='treinar';salvarProgresso();render();window.scrollTo(0,0);
}
/* Etapas de uma tentativa: os campos da variante do cenário substituem os da etapa. */
function caseSteps(c,scenario){return c.steps.map(s=>s.variants&&s.variants[scenario]?Object.assign({},s,s.variants[scenario]):s);}
function runSteps(run){return caseSteps(CASE_MAP[run.id],run.scenario);}
/* Etapa de checklist: a resposta é uma máscara de bits dos itens marcados.
   Pontos = (indicados marcados − itens marcados sem indicação) / total de indicados.
   Deixar em branco vale zero; marcar item contraindicado limita a etapa à metade. */
function stepResult(step,answer){
 if(answer===null||answer===undefined)return {points:0,ok:false,harm:false};
 if(!step.multi){const ok=!!step.options[answer]?.ok;return {points:ok?step.points:0,ok,harm:false};}
 let hits=0,extras=0,harm=false;const indicated=step.options.filter(o=>o.ok).length;
 step.options.forEach((o,i)=>{if(!isMarked(answer,i))return;if(o.ok)hits++;else{extras++;if(o.bad)harm=true;}});
 let points=Math.max(0,Math.round(step.points*(hits-extras)/indicated));
 if(harm)points=Math.min(points,Math.floor(step.points/2));
 return {points,ok:hits===indicated&&extras===0,harm};
}
function isMarked(answer,i){return Math.floor(answer/2**i)%2===1;}
function scaleST(spec,f){
 const scale=m=>m&&Object.assign({},m,'st' in m?{st:m.st*f}:{},'stCurv' in m?{stCurv:m.stCurv*f}:{});
 spec.global=scale(spec.global);spec.leadMods=Object.fromEntries(Object.entries(spec.leadMods||{}).map(([k,m])=>[k,scale(m)]));return spec;
}
function clinicalSpec(run,index){
 const c=CASE_MAP[run.id],step=runSteps(run)[index],spec=PMAP[step.pattern||c.pattern].build();
 if((step.pattern||c.pattern)==='fa' && c.ventricularRate){const rhythm=ritmoIrregular(c.ventricularRate,10,{seed:run.seed});spec.beats=rhythm.beats;spec.atrial=rhythm.atrial;}
 spec.seed=run.seed+(step.pattern?index:0);
 if(step.stScale!==undefined)scaleST(spec,step.stScale);
 return spec;
}
/* Relógio simulado: minutos transcorridos até a etapa, somando o atraso das escolhas anteriores. */
function caseClock(run,upTo){
 const steps=runSteps(run);let t=0;
 for(let i=0;i<=upTo&&i<steps.length;i++){t+=steps[i].minutes||0;if(i<upTo&&!steps[i].multi)t+=steps[i].options[run.answers[i]]?.delay||0;}
 return t;
}
function caseGoals(run){
 const c=CASE_MAP[run.id],goals=c.scenarios?.[run.scenario]?.goals||c.goals||[];
 return goals.filter(g=>run.index>=g.step).map(g=>{const value=caseClock(run,g.step)+(g.plus||0);return {label:g.label,max:g.max,value,ok:value<=g.max};});
}
function clinicalScore(run){return runSteps(run).reduce((n,step,i)=>n+stepResult(step,run.answers[i]).points,0);}
function answerClinical(value){
 const run=S.caseRun;if(!run || run.done || run.answers[run.index]!==null)return false;
 const c=CASE_MAP[run.id],steps=runSteps(run),step=steps[run.index];
 if(step.multi?!(Number.isSafeInteger(value)&&value>=0&&value<2**step.options.length):!step.options[value])return false;
 run.answers[run.index]=value;
 if(!stepResult(step,value).ok)scheduleCase(c.id,false);
 if(run.index===steps.length-1){
  run.done=true;
  const points=clinicalScore(run),record=caseRecord(c.id);
  S.caseStats[c.id]={...record,attempts:record.attempts+1,best:Math.max(record.best,points),last:Date.now()};
  if(points===100)scheduleCase(c.id,true);
  registrar(c.pattern,points===100);
 } else salvarProgresso();
 return true;
}
function clinicalNext(){const run=S.caseRun;if(!run || run.done || run.answers[run.index]===null)return;run.index++;salvarProgresso();render();window.scrollTo(0,0);}
function clinicalSources(c,host){
 const details=el('details','case-sources');details.appendChild(el('summary',null,'Fontes e conferência das condutas'));
 if(c.sourceNote)details.appendChild(el('p','muted small',esc(c.sourceNote)));else details.appendChild(el('p','muted small','Conferência registrada em 29/09/2026; revisão independente por especialista pendente.'));
 for(const key of c.sources){const ref=CASE_SOURCES[key],p=el('p'),a=el('a');a.textContent=ref.name;a.href=ref.url;a.target='_blank';a.rel='noopener';p.appendChild(a);details.appendChild(p);}host.appendChild(details);
}
function trainControls(root){
 const card=el('section','card train-controls');card.setAttribute('aria-label','Configurar treino');
 card.appendChild(el('h3',null,'Como você quer treinar?'));
 const topics=el('div','guide-controls');
 for(const [key,t] of Object.entries(TRAIN_TOPICS)){
  const btn=el('button','btn'+(S.trainTopic===key?' on':''),t.label);btn.setAttribute('aria-pressed',String(S.trainTopic===key));
  btn.onclick=()=>{if(S.trainTopic===key)return;S.trainTopic=key;S.quiz=null;S.showCase=false;render();};topics.appendChild(btn);
 }
 const formats=el('div','guide-controls');
 for(const [key,label] of [['rapido','ECG rápido'],['casos','Casos clínicos']]){
  const btn=el('button','btn'+(S.trainFormat===key?' on':''),label);btn.setAttribute('aria-pressed',String(S.trainFormat===key));
  btn.onclick=()=>{S.trainFormat=key;S.showCase=key==='casos'&&!!S.caseRun&&(S.trainTopic==='geral'||CASE_MAP[S.caseRun.id].track===S.trainTopic);render();};formats.appendChild(btn);
 }
 card.append(topics,formats);card.appendChild(el('p','muted small',S.trainFormat==='rapido'?TRAIN_TOPICS[S.trainTopic].description+' As alternativas podem incluir diagnósticos diferenciais de outros temas.':'Casos fictícios · interpretação + conduta · 100 pontos por caso · sem bônus por velocidade.'));
 root.appendChild(card);
}
function viewClinicalCatalog(root){
 if(S.showCase && S.caseRun && (S.trainTopic==='geral'||CASE_MAP[S.caseRun.id].track===S.trainTopic)){viewClinicalCase(root);return;}
 const total=Object.values(S.caseStats).reduce((n,r)=>n+r.best,0);
 const intro=el('div','card');intro.appendChild(el('h3',null,'Missões clínicas'));
 intro.appendChild(el('p','pill',total+' / '+(CLINICAL_CASES.length*100)+' pontos nas melhores tentativas'));
 intro.appendChild(el('p','muted','Cada caso vale 100 pontos, distribuídos entre as etapas. Repetir um caso só aumenta o total se você superar sua melhor pontuação.'));
 if(S.caseRun && !S.caseRun.done)intro.appendChild(el('p','muted small','Há uma tentativa em andamento. Iniciar outro caso substitui essa tentativa; as decisões já registradas continuam na revisão.'));
 root.appendChild(intro);
 const grid=el('div','case-grid');root.appendChild(grid);
 for(const c of CLINICAL_CASES.filter(c=>S.trainTopic==='geral'||c.track===S.trainTopic)){
  const record=caseRecord(c.id),card=el('article','card');card.appendChild(el('span','tag',TRAIN_TOPICS[c.track].label+' · '+c.level));card.appendChild(el('h3',null,esc(c.title)));
  card.appendChild(el('p','muted',c.steps.length+' etapas · ECG + contexto + decisões'+(c.scenarios?' · cenário sorteado':'')+(c.clock?' · relógio de metas':'')));
  card.appendChild(el('p',null,record.attempts?'Melhor: '+record.best+'/100 · '+record.attempts+' tentativa(s)':'Ainda não concluído'));
  if(record.due)card.appendChild(el('p','muted small','Revisão: '+quandoRevisar(record.due)));
  const resume=S.caseRun?.id===c.id&&!S.caseRun.done;
  const button=el('button','btn primary',resume?'Continuar caso':'Iniciar caso');button.setAttribute('aria-label',(resume?'Continuar: ':'Iniciar: ')+c.title);button.onclick=()=>{S.showCase=true;startClinicalCase(c.id);};card.appendChild(button);grid.appendChild(card);
 }
}
function viewClinicalCase(root){
 const run=S.caseRun,c=CASE_MAP[run.id],steps=runSteps(run),step=steps[run.index],chosen=run.answers[run.index],answered=chosen!==null;
 const head=el('div','card');head.appendChild(el('span','tag',TRAIN_TOPICS[c.track].label+' · '+c.level));head.appendChild(el('h3',null,esc(c.title)));
 head.appendChild(el('p','muted',esc(c.patient)));
 const scenario=c.scenarios?.[run.scenario];
 if(scenario)head.appendChild(el('p','case-scenario','<b>Cenário desta tentativa:</b> '+esc(scenario.label)));
 head.appendChild(el('p','pill','Etapa '+(run.index+1)+' de '+steps.length+' · '+step.kind+' · '+clinicalScore(run)+' pontos'+(c.clock?' · ⏱ '+caseClock(run,run.index)+' min desde a chegada':'')));
 const progress=el('progress');progress.max=steps.length;progress.value=run.answers.filter(a=>a!==null).length;progress.setAttribute('aria-label','Etapas respondidas');head.appendChild(progress);
 const goals=caseGoals(run);
 if(goals.length){const row=el('div','case-goals');goals.forEach(g=>row.appendChild(el('span','goal '+(g.ok?'ok':'late'),(g.ok?'✓ ':'✗ ')+esc(g.label)+': '+g.value+' min (meta ≤ '+g.max+')')));head.appendChild(row);}
 const state=step.vitals || [...steps.slice(0,run.index+1)].reverse().find(s=>s.vitals)?.vitals;
 if(state)head.appendChild(el('div','case-vitals',esc(state)));
 if(step.context)head.appendChild(el('p','case-update',esc(step.context)));
 if(run.index>0 && !stepResult(steps[run.index-1],run.answers[run.index-1]).ok)head.appendChild(el('p','muted small','Após o feedback, a equipe retoma a conduta adequada. O tempo perdido continua contando no relógio.'));
 root.appendChild(head);
 const ecg=el('div');head.appendChild(ecg);
 if(step.noECG)ecg.appendChild(el('p','muted small','O ECG ainda não foi realizado.'));
 else {let pat=PMAP[step.pattern||c.pattern];if(pat.id==='fa'&&c.ventricularRate)pat={...pat,laudo:{...pat.laudo,fc:'≈ '+c.ventricularRate+' bpm (média aproximada)'}};mountECG(ecg,pat,{spec:clinicalSpec(run,run.index),locked:true,explain:answered,extra:step.extra==='on'?'on':step.extra==='after'&&answered?'button':'off'});}
 const question=el('div','card');question.appendChild(el('h3',null,esc(step.prompt)));
 if(step.multi){
  question.appendChild(el('p','muted small','Marque tudo o que você prescreve agora e confirme. Itens contraindicados limitam a pontuação da etapa.'));
  const list=el('div','opts'),boxes=[];
  run.order[run.index].forEach(original=>{const option=step.options[original],label=el('label','opt check'),input=document.createElement('input');
   input.type='checkbox';input.disabled=answered;input.checked=answered&&isMarked(chosen,original);boxes.push([original,input]);
   label.appendChild(input);label.appendChild(el('span',null,'<b>'+esc(option.text)+'</b>'+(option.dose?'<br><span class="muted small">'+esc(option.dose)+'</span>':'')));
   if(answered)label.classList.add(input.checked===!!option.ok?'right':'wrong');list.appendChild(label);
  });question.appendChild(list);
  if(!answered){const confirm=el('button','btn primary','Confirmar seleção');confirm.onclick=()=>{if(answerClinical(boxes.reduce((m,[i,b])=>b.checked?m+2**i:m,0)))render();};question.appendChild(confirm);}
 } else {
  const options=el('div','opts');
  run.order[run.index].forEach((original,i)=>{const option=step.options[original],button=el('button','opt','<span class="k">'+'ABCD'[i]+'</span><span>'+esc(option.text)+'</span>');button.disabled=answered;
   if(answered && option.ok)button.classList.add('right');else if(answered && original===chosen)button.classList.add('wrong');
   button.onclick=()=>{if(answerClinical(original))render();};options.appendChild(button);
  });question.appendChild(options);
 }
 root.appendChild(question);
 if(answered){
  const result=stepResult(step,chosen);
  const feedback=el('div','box '+(result.ok?'ok':'err'));feedback.setAttribute('role','status');
  if(step.multi){
   feedback.appendChild(el('b',null,'Checklist · +'+result.points+' de '+step.points+' pontos'));
   if(result.harm)feedback.appendChild(el('p',null,'Você marcou item contraindicado: a pontuação desta etapa fica limitada à metade.'));
   step.options.forEach((o,i)=>{const marked=isMarked(chosen,i),verdict=o.ok?(marked?'✓ Indicado':'✗ Indicado, faltou marcar'):(marked?(o.bad?'✗ Contraindicado, você marcou':'✗ Não indicado, você marcou'):(o.bad?'✓ Contraindicado':'✓ Não indicado'));
    feedback.appendChild(el('p',null,'<b>'+verdict+' · '+esc(o.text)+'</b><br>'+esc(o.why)));});
  } else {
   const selected=step.options[chosen],correct=step.options.find(o=>o.ok);
   feedback.appendChild(el('b',null,selected.ok?'Decisão correta · +'+step.points+' pontos':'Decisão a revisar · +0 pontos'));
   feedback.appendChild(el('p',null,esc(selected.why)));
   if(selected.delay)feedback.appendChild(el('p',null,'Tempo perdido: +'+selected.delay+' min no relógio.'));
   if(!selected.ok){feedback.appendChild(el('p',null,'Conduta esperada nesta etapa: '+esc(correct.text)));feedback.appendChild(el('p',null,esc(correct.why)));}
  }
  question.appendChild(feedback);
  if(!step.multi){const other=el('details');other.appendChild(el('summary',null,'Entender todas as alternativas'));step.options.forEach(o=>other.appendChild(el('p',null,'<b>'+esc(o.text)+'</b><br>'+esc(o.why))));question.appendChild(other);}
  if(!run.done){const next=el('button','btn primary','Avançar para '+steps[run.index+1].kind.toLowerCase());next.onclick=clinicalNext;question.appendChild(next);}
  else {
   const score=clinicalScore(run),summary=el('section','case-result');
   summary.appendChild(el('h3',null,'Missão concluída · '+score+'/100'));
   summary.appendChild(el('p',null,score===100?'Todas as decisões corretas nesta tentativa.':score>=80?'Bom desempenho. Revise as decisões sinalizadas.':'Reforce o raciocínio das etapas sinalizadas e tente novamente.'));
   for(let i=0;i<steps.length;i++){const st=steps[i],r=stepResult(st,run.answers[i]);summary.appendChild(el('p',null,(r.ok?'✓ ':'↺ ')+esc(st.kind)+' · '+r.points+'/'+st.points));}
   for(const g of caseGoals(run))summary.appendChild(el('p',null,(g.ok?'✓ ':'✗ ')+'Meta '+esc(g.label)+': '+g.value+' min (≤ '+g.max+')'));
   if(scenario)summary.appendChild(el('p','muted small','Refazer sorteia o cenário de novo: com ou sem hemodinâmica.'));
   if(caseRecord(c.id).due)summary.appendChild(el('p',null,'Próxima revisão deste caso: '+quandoRevisar(caseRecord(c.id).due)));
   const retry=el('button','btn','Refazer este caso');retry.onclick=()=>{S.showCase=true;startClinicalCase(c.id);};summary.appendChild(retry);question.appendChild(summary);
  }
  clinicalSources(c,question);
 }
 const back=el('button','btn ghost','Voltar às missões');back.onclick=()=>{S.showCase=false;render();};root.appendChild(back);
}
function clinicalReviewCard(root){
 const entries=CLINICAL_CASES.filter(c=>caseRecord(c.id).due>0).sort((a,b)=>caseRecord(a.id).due-caseRecord(b.id).due);if(!entries.length)return;
 const card=el('div','card');card.appendChild(el('h3',null,'Revisar decisões clínicas'));
 card.appendChild(el('p','muted','Refaça o caso completo para revisar a interpretação e a conduta.'));
 for(const c of entries){const row=el('div','review-row'),r=caseRecord(c.id);row.appendChild(el('p',null,esc(c.title)+'<br><span class="muted">'+esc(quandoRevisar(r.due))+'</span>'));
  if(r.due<=Date.now()){const button=el('button','btn','Revisar caso');button.onclick=()=>{S.showCase=true;startClinicalCase(c.id);};row.appendChild(button);}card.appendChild(row);
 }root.appendChild(card);
}

function viewTreinar(root){
  trainControls(root);
  if(S.trainFormat==='casos'){viewClinicalCatalog(root);return;}
  if (!S.quiz) S.quiz = {q: novaQuestao(proximoPadrao(TRAIN_TOPICS[S.trainTopic].test),S.trainTopic==='geral'?undefined:'dx'), respondida: false};
  const q = S.quiz.q;
  if (!q.spec) q.spec = varySpec(q.pat.build());
  const head = el('div', 'card fade');
  const line = el('div'); line.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap';
  line.innerHTML = '<span class="pill">Sequência: <b>' + S.streak + '</b></span><span class="pill">Recorde: ' + S.best + '</span><span class="pill">' + S.right + '/' + S.total + ' acertos</span>';
  head.appendChild(line);
  head.appendChild(el('h3', null, esc(q.enun)));
  head.appendChild(el('p', 'muted small', 'Atalhos: teclas <b>A</b>–<b>D</b> respondem, <b>Enter</b> vai para o próximo.'));
  if (q.mostraNome) head.appendChild(el('p', 'muted small', 'Diagnóstico: <b>' + esc(q.pat.nome) + '</b>'));
  const ecg = el('div'); ecg.style.marginTop = '10px'; head.appendChild(ecg);
  root.appendChild(head);
  const ecgBox = mountECG(ecg, q.pat, {spec: q.spec || (q.spec = varySpec(q.pat.build())), locked: true});
  const c = el('div', 'card fade');
  const opts = el('div', 'opts');
  q.opts.forEach((o, i) => {
    const b = el('button', 'opt');
    b.innerHTML = '<span class="k">' + 'ABCD'[i] + '</span><span>' + esc(o.t) + '</span>';
    b.onclick = () => {
      if (S.quiz.respondida) return;
      S.quiz.respondida = true; q.escolha = i;
      registrar(q.pat.id, !!o.ok);
      [...opts.children].forEach((bb, j) => {
        bb.disabled = true;
        if (q.opts[j].ok) bb.classList.add('right');
        else if (j === i) bb.classList.add('wrong');
      });
      ecgBox.enableGuide();
      mostraExplicacao(c, q.pat, !!o.ok);
    };
    if (S.quiz.respondida){ b.disabled = true; if (o.ok) b.classList.add('right'); else if (q.escolha === i) b.classList.add('wrong'); }
    opts.appendChild(b);
  });
  c.appendChild(opts);
  root.appendChild(c);
  if (S.quiz.respondida) {ecgBox.enableGuide();mostraExplicacao(c, q.pat, !!q.opts[q.escolha].ok);}
}
function mostraExplicacao(host, pat, acertou){
  const w = el('div', 'fade');
  w.appendChild(el('div', 'box ' + (acertou ? 'ok' : 'err'), '<span class="lbl">' + (acertou ? 'Correto' : 'Incorreto') + '</span><b>' + esc(pat.nome) + '</b>'));
  const ul = el('ul', 'crit');
  pat.criterios.forEach(x => ul.appendChild(el('li', null, esc(x))));
  w.appendChild(el('div', 'hr'));
  w.appendChild(el('h4', null, 'Critérios'));
  w.appendChild(ul);

  if (MAPA_ANATOMICO[pat.id]) atualizarAnatomia(pat.id, w);

  if (pat.pegadinha) w.appendChild(el('div', 'box peg', '<span class="lbl">Pegadinha</span>' + esc(pat.pegadinha)));
  if (pat.conduta)   w.appendChild(el('div', 'box cond', '<span class="lbl">Conduta</span>' + esc(pat.conduta)));
  const bar = el('div'); bar.style.marginTop = '14px';
  const nx = el('button', 'btn primary', 'Próximo traçado  →');
  nx.onclick = () => { S.quiz = null; render(); };
  const ver = el('button', 'btn ghost', 'Ver ficha completa');
  ver.style.marginLeft = '8px';
  ver.onclick = () => { S.mode = 'aprender'; S.libSel = pat.id; render(); };
  bar.append(nx, ver);
  w.appendChild(bar);
  host.appendChild(w);
  nx.focus({preventScroll:true});
}
function viewLaudo(root){
  if (!S.laudo) { const pat = proximoPadrao(); S.laudo = {pat, spec: varySpec(pat.build()), revelado:false, respostas:{}, marcas:{}}; }
  const laudo = S.laudo, pat = laudo.pat;
  const card = el('div', 'card fade');
  card.appendChild(el('h3', null, 'Modo laudo — escreva sua interpretação'));
  card.appendChild(el('p', 'muted', 'Preencha os itens antes de revelar o modelo. A comparação é uma autoavaliação, sem correção automática.'));
  const ecg = el('div'); card.appendChild(ecg); root.appendChild(card);
  mountECG(ecg, pat, {spec:laudo.spec, locked:true, explain:laudo.revelado});
  const form = el('div', 'card fade'); root.appendChild(form);
  const score = el('p', 'pill'); score.setAttribute('aria-live','polite');
  function updateScore(){const vals=Object.values(laudo.marcas); score.textContent= vals.length ? vals.filter(Boolean).length + ' de ' + vals.length + ' itens marcados como corretos (autoavaliação)' : 'Compare cada item com o modelo';}
  for(const [key,label] of LKEYS){
    const row = el('div','laudo-field'); const lbl=el('label',null,esc(label)); lbl.htmlFor='laudo-'+key;
    const input=el('textarea'); input.id='laudo-'+key; input.rows=2; input.value=laudo.respostas[key] || ''; input.readOnly=laudo.revelado;
    input.placeholder='Sua interpretação'; input.oninput=()=>{laudo.respostas[key]=input.value;};
    row.append(lbl,input);
    if(laudo.revelado){
      row.appendChild(el('p','muted','Modelo: '+esc(pat.laudo[key])));
      for(const [value,text] of [[true,'Acertei'],[false,'Revisar']]){
        const btn=el('button','btn'+(laudo.marcas[key]===value?' on':''),text);
        btn.setAttribute('aria-pressed', String(laudo.marcas[key]===value));
        btn.onclick=()=>{laudo.marcas[key]=value; render();}; row.appendChild(btn);
      }
    }
    form.appendChild(row);
  }
  const bar=el('div','laudo-actions'); form.appendChild(bar);
  if(!laudo.revelado){const reveal=el('button','btn primary','Revelar laudo modelo'); reveal.onclick=()=>{laudo.revelado=true;render();};bar.appendChild(reveal);}
  else {
    form.appendChild(score); updateScore();
    for(const [ok,label] of [[true,'Fechei o diagnóstico ✓'],[false,'Não fechei ✕']]){
      const btn=el('button','btn'+(ok?' primary':''),label);btn.onclick=()=>{registrar(pat.id,ok);S.laudo=null;render();};bar.appendChild(btn);
    }
  }
  const next=el('button','btn ghost','Pular caso'); next.onclick=()=>{S.laudo=null;render();};bar.appendChild(next);
}
function viewSimulado(root){
  if (!S.sim){
    const c = el('div', 'card fade center');
    c.appendChild(el('h3', null, 'Simulado cronometrado'));
    const bar = el('div');
    [['Só emergências', p => p.emerg], ['Isquemia e infarto', p => p.cat === 'isquemia'],
     ['Ritmo e condução', p => p.cat === 'ritmo' || p.cat === 'conducao'], ['Tudo misturado', null]
    ].forEach(([lbl, f], i) => {
      const b = el('button', 'btn' + (i === 3 ? ' primary' : ''), lbl);
      b.style.margin = '4px';
      b.onclick = () => { iniciarSim(f, lbl); render(); };
      bar.appendChild(b);
    });
    c.appendChild(bar);
    c.appendChild(el('p', 'muted small', '10 questões por simulado. Você pode trocar de categoria a qualquer momento; as respostas já dadas ficam salvas no progresso.'));
    root.appendChild(c);
    return;
  }
  const sim = S.sim;
  if (sim.i >= sim.qs.length){ resultadoSim(root); return; }
  const q = sim.qs[sim.i];
  const head = el('div', 'card fade');
  const l = el('div'); l.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap';
  l.innerHTML = '<span class="pill">' + esc(sim.cat || 'Simulado') + '</span><span class="pill">Questão <b>' + (sim.i + 1) + '</b> de ' + sim.qs.length + '</span><span class="pill" id="simT">tempo 0:00</span>';
  l.appendChild(sairSim());
  head.appendChild(l);
  head.appendChild(el('h3', null, esc(q.enun)));
  const ecg = el('div'); ecg.style.marginTop = '10px'; head.appendChild(ecg);
  root.appendChild(head);
  mountECG(ecg, q.pat, {spec: q.spec || (q.spec = varySpec(q.pat.build())), locked: true});
  const c = el('div', 'card fade');
  const opts = el('div', 'opts');
  q.opts.forEach((o, i) => {
    const b = el('button', 'opt');
    b.innerHTML = '<span class="k">' + 'ABCD'[i] + '</span><span>' + esc(o.t) + '</span>';
    b.onclick = () => {
      q.escolha = i; registrar(q.pat.id, !!o.ok);
      sim.i++; if (sim.i >= sim.qs.length) sim.fim = Date.now(); render();
    };
    opts.appendChild(b);
  });
  c.appendChild(opts);
  root.appendChild(c);
  tickSim();
}
/* Volta ao menu de categorias. Com respostas dadas, pede confirmação na própria tela (sem confirm() do navegador). */
function sairSim(){
  const box = el('div', 'sim-actions'); box.style.cssText = 'margin:0 0 0 auto';
  const sair = () => { clearInterval(window.__simTimer); S.sim = null; render(); };
  const b = el('button', 'btn ghost', 'Trocar categoria');
  b.onclick = () => {
    if (!S.sim.i) { sair(); return; }
    box.innerHTML = '';
    box.appendChild(el('span', 'muted small', 'Encerrar este simulado? ' + (S.sim.i === 1 ? 'A resposta dada já está salva' : 'As ' + S.sim.i + ' respostas dadas já estão salvas') + ' no progresso.'));
    const sim = el('button', 'btn', 'Encerrar e escolher outra'); sim.onclick = sair;
    const nao = el('button', 'btn ghost', 'Continuar simulado'); nao.onclick = render;
    box.append(sim, nao);
  };
  box.appendChild(b);
  return box;
}
function iniciarSim(filtro, cat){
  const pool = shuffle(PADROES.filter(p => !filtro || filtro(p))).slice(0, 10);
  S.sim = {qs: pool.map(p => novaQuestao(p, 'dx')), i: 0, t0: Date.now(), cat, filtro};
}
function tickSim(){
  clearInterval(window.__simTimer);
  window.__simTimer = setInterval(() => {
    const e = $('#simT'); if (!e || !S.sim){ clearInterval(window.__simTimer); return; }
    const s = Math.floor((Date.now() - S.sim.t0) / 1000);
    e.textContent = 'tempo ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }, 1000);
}
function resultadoSim(root){
  clearInterval(window.__simTimer);
  const sim = S.sim;
  const acertos = sim.qs.filter(q => q.opts[q.escolha] && q.opts[q.escolha].ok).length;
  const secs = Math.floor(((sim.fim || Date.now()) - sim.t0) / 1000);
  const c = el('div', 'card fade center');
  c.appendChild(el('h3', null, 'Resultado'));
  c.appendChild(el('div', null, '<div style="font-size:44px;font-weight:700;letter-spacing:-1px">' + acertos + '<span style="color:var(--dim);font-size:24px">/' + sim.qs.length + '</span></div>'));
  c.appendChild(el('p', 'muted', 'Tempo total: ' + Math.floor(secs / 60) + ' min ' + (secs % 60) + ' s'));
  const acoes = el('div', 'sim-actions'); acoes.style.justifyContent = 'center';
  const b = el('button', 'btn primary', 'Escolher categoria');
  b.onclick = () => { S.sim = null; render(); };
  const rep = el('button', 'btn', 'Repetir ' + (sim.cat || 'categoria'));
  rep.onclick = () => { iniciarSim(sim.filtro, sim.cat); render(); };
  acoes.append(b, rep);
  c.appendChild(acoes);
  root.appendChild(c);
  const errs = sim.qs.filter(q => !(q.opts[q.escolha] && q.opts[q.escolha].ok));
  if (!errs.length){ root.appendChild(el('div', 'card center muted', 'Nenhum erro!')); return; }
  const rev = el('div', 'card fade');
  rev.appendChild(el('h3', null, 'Revisão dos erros (' + errs.length + ')'));
  errs.forEach(q => {
    const d = el('div'); d.style.cssText = 'margin-top:14px;padding-top:14px;border-top:1px solid var(--line)';
    d.appendChild(el('div', null, '<b>' + esc(q.pat.nome) + '</b>'));
    d.appendChild(el('p', 'muted small', 'Você respondeu: ' + esc(q.opts[q.escolha] ? q.opts[q.escolha].t : '—')));
    const v = el('button', 'btn ghost', 'Ver traçado e ficha'); v.style.marginTop = '10px';
    v.onclick = () => { if (d.querySelector('.ecgbox')) return; const ecg=el('div'); d.appendChild(ecg); mountECG(ecg,q.pat,{spec:q.spec,locked:true,explain:true}); d.appendChild(el('p','muted',q.pat.criterios.map(esc).join('<br>'))); v.disabled=true; };
    d.appendChild(v);
    rev.appendChild(d);
  });
  root.appendChild(rev);
}
const CHAVE_ANTES_IMPORTAR = CHAVE_PROG + ':antes-importar';
function criarBackup(now=new Date()){
 return {app:'treinador-ecg',format:1,appVersion:'3.13',exportedAt:now.toISOString(),progress:dadosProgresso()};
}
function lerBackup(texto){
 if(typeof texto!=='string'||texto.length>1000000)throw Error('Arquivo muito grande ou inválido.');
 let d;try{d=JSON.parse(texto);}catch(e){throw Error('Não foi possível ler o arquivo JSON.');}
 let date=null;
 if(d&&d.app!==undefined){
  if(d.app!=='treinador-ecg'||d.format!==1)throw Error('Formato de backup não compatível.');
  if(typeof d.exportedAt!=='string'||!Number.isFinite(Date.parse(d.exportedAt)))throw Error('Data do backup inválida.');
  date=d.exportedAt;d=d.progress;
 }
 if(d?.version!==undefined&&(!Number.isInteger(d.version)||d.version<1||d.version>3))throw Error('Versão de progresso não compatível. Atualize o aplicativo.');
 const progress=validarProgresso(d);
 return {progress,date,discardedRun:!!d.caseRun&&!progress.caseRun};
}
function importarBackup(backup){
 // Valida antes de persistir; se o armazenamento falhar, o estado atual não muda.
 const valid=validarProgresso(backup.progress);
 localStorage.setItem(CHAVE_ANTES_IMPORTAR,JSON.stringify(criarBackup()));
 localStorage.setItem(CHAVE_PROG,JSON.stringify({version:3,...valid}));
 aplicarProgresso(valid);S.sim=null;S.laudo=null;
}
function viewProgresso(root){
 root.appendChild(el('h2',null,'Seu progresso'));
 const dom=PADROES.filter(p=>S.boxes[p.id]>=4).length,st=el('div','stats');
 [[dom+'/'+PADROES.length,'padrões dominados'],[S.total?Math.round(S.right/S.total*100)+'%':'—','aproveitamento'],[S.best,'melhor sequência'],[S.total,'questões respondidas']].forEach(([n,l])=>st.appendChild(el('div','stat','<div class="n">'+n+'</div><div class="l">'+l+'</div>')));root.appendChild(st);
 const c=el('section','card');c.setAttribute('aria-label','Transferir progresso');
 c.innerHTML='<h3>Levar meu progresso para outro aparelho</h3><p>Sem conta e sem sincronização automática. O arquivo leva seus acertos, revisões, resultados dos casos e a tentativa clínica em andamento.</p><ol><li>Neste aparelho, baixe o backup.</li><li>Envie o arquivo para você por um meio de sua escolha.</li><li>No outro aparelho, abra este aplicativo → Progresso → Importar arquivo.</li><li>Confira a prévia e confirme a substituição.</li></ol><p class="muted">A importação substitui o progresso do aparelho de destino; não soma os resultados. Use o backup do aparelho em que estudou por último. Simulado e rascunho de laudo em andamento não são transferidos.</p>';
 const status=el('p','muted');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const actions=el('div','guide-controls');
 const download=el('button','btn primary','Baixar backup');
 const backupFile=()=>{const data=JSON.stringify(criarBackup(),null,2);return new File([data],'progresso-ecg-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json',{type:'application/json'});};
 download.onclick=()=>{const f=backupFile(),url=URL.createObjectURL(f),a=el('a');a.href=url;a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Download solicitado. Localize o arquivo na pasta de downloads e envie-o ao outro aparelho.';};
 const share=el('button','btn','Compartilhar backup');
 share.onclick=async()=>{try{const f=backupFile();if(!navigator.canShare?.({files:[f]})||!navigator.share){status.textContent='Este navegador não compartilha arquivos diretamente. Use Baixar backup e envie o arquivo manualmente.';return;}await navigator.share({files:[f],title:'Meu progresso no Treinador de ECG'});status.textContent='Compartilhamento concluído. Importe o arquivo no outro aparelho.';}catch(e){status.textContent=e.name==='AbortError'?'Compartilhamento cancelado.':'Não foi possível compartilhar. Use Baixar backup.';}};
 actions.append(download,share);c.append(actions);
 const label=el('label',null,'Importar arquivo de progresso (.json) '),file=el('input');file.type='file';file.accept='.json,application/json';file.setAttribute('aria-label','Importar arquivo de progresso');label.append(file);c.append(label,status);root.append(c);
 const preview=el('section','card');preview.hidden=true;preview.setAttribute('aria-label','Prévia da importação');preview.setAttribute('aria-live','polite');root.append(preview);
 let pending=null;
 function prepare(text){
  pending=null;preview.hidden=true;preview.replaceChildren();
  try{
   pending=lerBackup(text);const p=pending.progress;
   preview.innerHTML='<h3>Confira antes de importar</h3><p>'+ (pending.date?'Backup criado em '+esc(new Date(pending.date).toLocaleString('pt-BR')):'Backup antigo: data de exportação não disponível.')+'</p><ul><li>'+p.t+' questões respondidas; '+p.r+' acertos.</li><li>'+Object.keys(p.caseStats).length+' casos com registros.</li><li>'+Object.keys(p.reviews).length+' padrões na agenda de revisão.</li><li>Tentativa clínica: '+(p.caseRun?esc(CASE_MAP[p.caseRun.id].title):'nenhuma')+'.</li></ul><p>Este aparelho tem '+S.total+' questões respondidas. Os dados serão substituídos, sem mesclar. Uma cópia anterior ficará disponível neste navegador.</p>';
   if(pending.discardedRun)preview.append(el('p','box peg','A tentativa em andamento é de um caso que mudou de estrutura. Os resultados serão mantidos, mas essa tentativa precisará ser reiniciada.'));
   const confirm=el('button','btn primary','Confirmar importação'),cancel=el('button','btn','Cancelar importação');
   confirm.onclick=()=>{try{importarBackup(pending);render();const msg=document.querySelector('[aria-label="Transferir progresso"] [role="status"]');if(msg)msg.textContent='Progresso importado. Você pode continuar estudando neste aparelho.';}catch(e){status.textContent='Não foi possível importar: '+e.message+' O progresso atual foi preservado.';}};
   cancel.onclick=()=>{pending=null;preview.hidden=true;preview.replaceChildren();file.value='';status.textContent='Importação cancelada. Seu progresso foi preservado.';};
   const buttons=el('div','guide-controls');buttons.append(confirm,cancel);preview.append(buttons);preview.hidden=false;status.textContent='Arquivo validado. Confira a prévia abaixo.';
  }catch(e){status.textContent=e.message+' Seu progresso foi preservado.';}
 }
 file.onchange=async()=>{pending=null;preview.hidden=true;preview.replaceChildren();const chosen=file.files[0];if(!chosen)return;if(chosen.size>1000000){status.textContent='Arquivo maior que 1 MB. Seu progresso foi preservado.';return;}try{const text=await chosen.text();if(file.files[0]!==chosen)return;prepare(text);}catch(e){status.textContent='Não foi possível abrir o arquivo. Seu progresso foi preservado.';}};
 const legacy=el('details','card');legacy.append(el('summary',null,'Transferir por código (alternativa ao arquivo)'));
 const ta=el('textarea');ta.setAttribute('aria-label','Código de progresso');ta.value=btoa(unescape(encodeURIComponent(JSON.stringify(dadosProgresso()))));legacy.append(ta);
 const copy=el('button','btn','Copiar código'),paste=el('button','btn','Conferir código para importar');
 copy.onclick=async()=>{try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(ta.value);else{ta.select();if(!document.execCommand('copy'))throw Error();}status.textContent='Código copiado.';}catch(e){ta.select();status.textContent='Selecione e copie o código manualmente.';}};
 paste.onclick=()=>{try{if(ta.value.length>1400000)throw Error();prepare(decodeURIComponent(escape(atob(ta.value.trim()))));}catch(e){pending=null;preview.hidden=true;preview.replaceChildren();status.textContent='Código inválido. Seu progresso foi preservado.';}};
 const codeActions=el('div','guide-controls');codeActions.append(copy,paste);legacy.append(codeActions);root.append(legacy);
 try{const old=localStorage.getItem(CHAVE_ANTES_IMPORTAR);if(old){const recovery=el('button','btn','Recuperar progresso anterior à última importação');recovery.onclick=()=>prepare(old);root.append(recovery);}}catch(e){}
 root.append(el('p','muted','O progresso pertence a este navegador e perfil. Apagar os dados do site remove os resultados e a cópia de recuperação. Faça backups periódicos.'));
}

const MODES = [['aprender', 'Aprender'], ['treinar', 'Treinar'], ['laudo', 'Modo laudo'], ['simulado', 'Simulado'], ['revisar', 'Revisar erros'], ['progresso', 'Progresso']];
function render(){
  limparVisuais();
  const tabs = $('#tabs'); tabs.innerHTML = '';
  MODES.forEach(([id, lbl]) => {
    const b = el('button', 'tab' + (S.mode === id ? ' on' : ''), id === 'revisar' ? lbl+' ('+totalReviewDue()+')' : lbl);
    b.onclick = () => { S.mode = id; render(); window.scrollTo(0, 0); };
    if(id==='revisar')b.dataset.reviewTab='true';
    b.setAttribute('aria-current', S.mode === id ? 'page' : 'false');
    tabs.appendChild(b);
  });
  const manual=el('a','tab','Manual');manual.href='manual.html';manual.target='_blank';manual.rel='noopener';tabs.appendChild(manual);
  const root = $('#app'); root.innerHTML = ''; window.__draws = [];
  ({aprender: viewAprender, treinar: viewTreinar, laudo: viewLaudo, simulado: viewSimulado, revisar: viewRevisar, progresso: viewProgresso}[S.mode])(root);
}
let __rz;
window.addEventListener('resize', () => { clearTimeout(__rz); __rz = setTimeout(() => (window.__draws || []).forEach(d => { try { d(); } catch(e){} }), 180); });
document.addEventListener('keydown', e => {
  if (e.target.matches('input,textarea,select,[contenteditable]') || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
  if (!['treinar','simulado','revisar'].includes(S.mode)) return;
  if(S.mode==='treinar' && S.trainFormat==='casos')return;
  const i = ['a', 'b', 'c', 'd'].indexOf(e.key.toLowerCase());
  if (i >= 0){ const o = document.querySelectorAll('.opt')[i]; if (o && !o.disabled) o.click(); }
  if (e.key === 'Enter' && !e.target.closest('button,a,summary')){ e.preventDefault(); const n = [...document.querySelectorAll('.btn.primary')].pop(); if (n) n.click(); }
});
