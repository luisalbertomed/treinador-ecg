/* ==========================================================================
   FUNDAMENTOS — figuras animadas e aulas visuais da aba Aprender
   (dados das aulas e territórios residem em dados/fundamentos.js)
   ========================================================================== */

/* ---------- helpers geométricos ---------- */
function polarPt(cx, cy, r, deg){
  const a = deg * Math.PI / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
function anelSetor(cx, cy, r1, r2, a0, a1){
  const [x1,y1] = polarPt(cx,cy,r2,a0), [x2,y2] = polarPt(cx,cy,r2,a1);
  const [x3,y3] = polarPt(cx,cy,r1,a1), [x4,y4] = polarPt(cx,cy,r1,a0);
  const big = (a1 - a0) > 180 ? 1 : 0;
  return 'M' + x1.toFixed(1) + ',' + y1.toFixed(1) +
         ' A' + r2 + ',' + r2 + ' 0 ' + big + ' 1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) +
         ' L' + x3.toFixed(1) + ',' + y3.toFixed(1) +
         ' A' + r1 + ',' + r1 + ' 0 ' + big + ' 0 ' + x4.toFixed(1) + ',' + y4.toFixed(1) + ' Z';
}

/* ---------- coração em eixo curto, batendo ---------- */
/* SEGS definido em dados/fundamentos.js */
function svgCoracaoCurto(segsOn, art){
  const on = segsOn || [];
  const C = 105, R1 = 44, R2 = 78;
  let paredes = '', rotulos = '';
  SEGS.forEach(s => {
    const hot = on.indexOf(s.id) >= 0;
    paredes += '<path class="par' + (hot ? ' on' : '') + '" style="--pc:' + COR_ART[s.art] + '" d="' +
               anelSetor(C, C, R1, R2, s.a0, s.a1) + '"/>';
    const [lx, ly] = polarPt(C, C, (R1 + R2) / 2, (s.a0 + s.a1) / 2);
    rotulos += '<text class="par-lbl' + (hot ? ' on' : '') + '" x="' + lx.toFixed(1) + '" y="' +
               (ly + 3).toFixed(1) + '" text-anchor="middle">' + s.lbl + '</text>';
  });
  const vdHot = on.indexOf('vd') >= 0;
  const vd = '<path class="par' + (vdHot ? ' on' : '') + '" style="--pc:' + COR_ART.cd + '" d="' +
             anelSetor(C, C, R2 + 2, R2 + 26, 152, 236) + '"/>' +
             '<text class="par-lbl' + (vdHot ? ' on' : '') + '" x="' + polarPt(C,C,R2+14,194)[0].toFixed(1) +
             '" y="' + (polarPt(C,C,R2+14,194)[1] + 3).toFixed(1) + '" text-anchor="middle">VD</text>';
  return '<svg viewBox="0 0 210 215" role="img" aria-label="Coração em eixo curto">' +
    '<g class="cor-bate">' + vd + paredes +
      '<circle class="cav cor-cav" cx="' + C + '" cy="' + C + '" r="' + (R1 - 2) + '"/>' + rotulos +
    '</g>' +
    '<text x="105" y="207" text-anchor="middle" class="par-lbl">eixo curto · vista do ápice</text>' +
  '</svg>';
}

/* ---------- coração com a árvore coronária ---------- */
function svgCoronarias(art){
  const cls = a => 'art ' + (art === a ? 'on' : 'off');
  return '<svg viewBox="0 0 200 235" role="img" aria-label="Árvore coronária">' +
    '<g class="cor-bate">' +
      '<path class="mio" d="M100,32 C56,36 32,74 36,124 C40,174 70,208 102,222 C136,208 166,172 168,122 C170,70 144,34 100,32 Z"/>' +
      '<path class="mio" d="M100,32 C84,44 76,66 78,92 C80,124 92,150 104,176" fill="none" stroke="#0f1318" stroke-width="1.2" opacity=".5"/>' +
      '<path d="M92,34 C90,20 104,14 112,22" fill="none" stroke="#5a6675" stroke-width="7" stroke-linecap="round"/>' +
      '<path class="' + cls('tce') + '" style="stroke:' + COR_ART.tce + '" d="M110,40 L118,52"/>' +
      '<path class="' + cls('da') + '" style="stroke:' + COR_ART.da + '" d="M118,52 C120,88 112,134 104,184"/>' +
      '<path class="' + cls('da') + '" style="stroke:' + COR_ART.da + '" d="M117,74 L96,86 M113,108 L92,120" stroke-width="4"/>' +
      '<path class="' + cls('cx') + '" style="stroke:' + COR_ART.cx + '" d="M118,52 C142,62 156,88 154,120 C152,146 142,164 130,176"/>' +
      '<path class="' + cls('cd') + '" style="stroke:' + COR_ART.cd + '" d="M94,42 C70,54 56,80 56,116 C56,150 70,180 94,196"/>' +
      '<path class="' + cls('cd') + '" style="stroke:' + COR_ART.cd + '" d="M94,196 C104,202 112,198 118,188" />' +
    '</g>' +
    '<text class="art-lbl" x="150" y="44" fill="' + COR_ART.da + '" opacity="' + (art==='da'?1:.4) + '">DA</text>' +
    '<text class="art-lbl" x="166" y="132" fill="' + COR_ART.cx + '" opacity="' + (art==='cx'?1:.4) + '" text-anchor="end">CX</text>' +
    '<text class="art-lbl" x="30" y="120" fill="' + COR_ART.cd + '" opacity="' + (art==='cd'?1:.4) + '">CD</text>' +
    '<text x="100" y="231" text-anchor="middle" class="par-lbl">vista anterior</text>' +
  '</svg>';
}

/* ---------- hexaxial com vetor que gira ---------- */
const EIXOS_LEAD = [
  {n:'DI',   g:0},   {n:'DII', g:60},  {n:'DIII', g:120},
  {n:'aVF',  g:90},  {n:'aVL', g:-30}, {n:'aVR',  g:-150}
];
function svgHexaxial(graus, hot){
  const C = 125, R = 100;
  let linhas = '', lbls = '';
  [0, 30, 60, 90, 120, 150].forEach(g => {
    const [x1,y1] = polarPt(C,C,R,g), [x2,y2] = polarPt(C,C,R,g+180);
    linhas += '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'"/>';
  });
  EIXOS_LEAD.forEach(l => {
    const [x,y] = polarPt(C,C,R+15,l.g);
    const isHot = hot && hot.indexOf(l.n) >= 0;
    lbls += '<text class="lbl'+(isHot?' hot':'')+'" x="'+x.toFixed(1)+'" y="'+(y+4).toFixed(1)+'" text-anchor="middle">'+l.n+'</text>';
  });
  const [zx1,zy1] = polarPt(C,C,R,-30), [zx2,zy2] = polarPt(C,C,R,90);
  const zona = '<path class="zona" d="M'+C+','+C+' L'+zx1.toFixed(1)+','+zy1.toFixed(1)+
               ' A'+R+','+R+' 0 0 1 '+zx2.toFixed(1)+','+zy2.toFixed(1)+' Z"/>';
  return '<svg viewBox="0 0 250 250" class="hx" role="img" aria-label="Diagrama hexaxial">' +
    zona +
    '<circle cx="'+C+'" cy="'+C+'" r="'+R+'" fill="none" stroke="var(--line)" stroke-width="1.5"/>' +
    linhas + lbls +
    '<g class="vet" style="transform:rotate('+graus+'deg);transform-origin:125px 125px;transform-box:view-box">' +
      '<line class="vetline" x1="125" y1="125" x2="207" y2="125"/>' +
      '<polygon class="vethead" points="205,117 223,125 205,133"/>' +
    '</g>' +
    '<circle cx="'+C+'" cy="'+C+'" r="4" fill="var(--dim)"/>' +
    '<text class="grau" x="8" y="20">' + (graus > 0 ? '+' : '') + graus + '°</text>' +
  '</svg>';
}

/* ---------- triângulo de Einthoven ---------- */
function svgEinthoven(){
  return '<svg viewBox="0 0 220 200" role="img" aria-label="Triângulo de Einthoven">' +
    '<polygon points="40,44 180,44 110,168" fill="none" stroke="var(--acc)" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<g class="cor-bate"><path class="mio" d="M110,74 C92,76 84,92 88,110 C92,128 102,140 112,148 C124,138 136,124 138,106 C140,86 128,74 110,74 Z"/></g>' +
    '<circle cx="40" cy="44" r="9" fill="#e2574c"/><text x="40" y="28" text-anchor="middle" class="art-lbl" fill="#e2574c">BD</text>' +
    '<circle cx="180" cy="44" r="9" fill="#f0d24c"/><text x="180" y="28" text-anchor="middle" class="art-lbl" fill="#f0d24c">BE</text>' +
    '<circle cx="110" cy="168" r="9" fill="#5ad19a"/><text x="110" y="191" text-anchor="middle" class="art-lbl" fill="#5ad19a">PE</text>' +
    '<text x="110" y="38" text-anchor="middle" class="art-lbl" fill="var(--acc)">DI →</text>' +
    '<text x="58" y="118" text-anchor="middle" class="art-lbl" fill="var(--acc)">DII</text>' +
    '<text x="164" y="118" text-anchor="middle" class="art-lbl" fill="var(--acc)">DIII</text>' +
    '<text x="30" y="58" class="par-lbl">−</text><text x="186" y="58" class="par-lbl">+</text>' +
    '<text x="118" y="160" class="par-lbl">+</text>' +
  '</svg>';
}

/* ---------- precordiais ---------- */
function svgPrecordiais(){
  const V = [['V1',96,86,'4º EIC, borda D'],['V2',124,86,'4º EIC, borda E'],['V3',137,101,'entre V2 e V4'],
             ['V4',150,116,'5º EIC, linha médio-clavicular'],['V5',168,120,'linha axilar anterior'],
             ['V6',184,124,'linha axilar média']];
  let pts = '';
  V.forEach(v => {
    pts += '<circle cx="'+v[1]+'" cy="'+v[2]+'" r="7" fill="var(--acc)" opacity=".9"/>' +
           '<text x="'+v[1]+'" y="'+(v[2]+3.5)+'" text-anchor="middle" style="font:700 8px ui-sans-serif" fill="#06231f">'+v[0]+'</text>';
  });
  return '<svg viewBox="0 0 240 190" role="img" aria-label="Posição de V1 a V6">' +
    '<path d="M110,18 C64,20 40,52 42,96 C44,138 66,166 110,174 C154,166 176,138 178,96 C180,52 156,20 110,18 Z" fill="#2b333e" stroke="var(--line)" stroke-width="1.5"/>' +
    '<line x1="110" y1="26" x2="110" y2="132" stroke="#4a5461" stroke-width="7" stroke-linecap="round"/>' +
    '<g class="cor-bate"><path class="mio" d="M118,84 C102,86 94,100 98,116 C102,132 112,142 122,150 C134,140 146,128 148,112 C150,94 134,82 118,84 Z" opacity=".85"/></g>' +
    pts +
    '<text x="120" y="186" text-anchor="middle" class="par-lbl">V1–V2: 4º EIC · V4: 5º EIC linha médio-clavicular</text>' +
  '</svg>';
}

/* ---------- grade do papel ---------- */
function svgGradePapel(){
  let g = '';
  for (let i = 0; i <= 30; i++){
    const x = 10 + i * 8;
    g += '<line class="' + (i % 5 === 0 ? 'gp-maj' : 'gp-min') + '" x1="'+x+'" y1="10" x2="'+x+'" y2="130"/>';
  }
  for (let j = 0; j <= 15; j++){
    const y = 10 + j * 8;
    g += '<line class="' + (j % 5 === 0 ? 'gp-maj' : 'gp-min') + '" x1="10" y1="'+y+'" x2="250" y2="'+y+'"/>';
  }
  const leg = (y, cor, sw, txt) =>
    '<rect x="12" y="'+(y-7)+'" width="'+sw+'" height="'+sw+'" fill="none" stroke="'+cor+'" stroke-width="1.8"/>' +
    '<text class="gp-medtxt" x="'+(12+sw+7)+'" y="'+y+'" style="fill:var(--txt)">'+txt+'</text>';
  return '<svg viewBox="0 0 270 212" role="img" aria-label="Grade do papel de ECG">' +
    '<rect x="10" y="10" width="240" height="120" fill="#fffdfb"/>' + g +
    '<rect x="10" y="50" width="40" height="40" fill="rgba(31,122,224,.10)" stroke="#1f7ae0" stroke-width="2.2"/>' +
    '<rect x="90" y="66" width="8" height="8" fill="rgba(217,130,43,.18)" stroke="#d9822b" stroke-width="1.8"/>' +
    '<line x1="50" y1="140" x2="250" y2="140" stroke="#5ad19a" stroke-width="2"/>' +
    '<line x1="50" y1="134" x2="50" y2="146" stroke="#5ad19a" stroke-width="2"/>' +
    '<line x1="250" y1="134" x2="250" y2="146" stroke="#5ad19a" stroke-width="2"/>' +
    '<text class="gp-txt" x="10" y="7">25 mm/s · 10 mm/mV</text>' +
    leg(166, '#d9822b', 8,  '1 quadradinho (1 mm) = 0,04 s · 0,1 mV') +
    leg(184, '#1f7ae0', 11, '1 quadrado grande (5 mm) = 0,20 s · 0,5 mV') +
    '<line x1="12" y1="199" x2="23" y2="199" stroke="#5ad19a" stroke-width="2.2"/>' +
    '<text class="gp-medtxt" x="30" y="203" style="fill:var(--txt)">5 quadrados grandes = 1 segundo</text>' +
  '</svg>';
}

/* ==========================================================================
   COMPONENTES INTERATIVOS
   ========================================================================== */
function ecgCanvasCard(){
  const box = el('div', 'ecgbox'), scroll = el('div', 'ecgscroll');
  const cv = document.createElement('canvas');
  scroll.appendChild(cv); box.appendChild(scroll);
  return {box: box, cv: cv};
}
function ajustaPx(host, spec, view, folga, teto){
  const avail = Math.max(280, (host.clientWidth || 860) - (folga === undefined ? 40 : folga));
  return Math.max(2.2, Math.min(teto || 9, avail / ecgTotalMm(spec, view)));
}

/* mapa dos territórios: parede → derivações no ECG + coronária no coração */
function mapaTerritorios(){
  const card=el('section','card visual-aula territory-tour');
  card.setAttribute('aria-label','Percurso dos territórios');
  card.innerHTML='<div class="kicker">Parede → derivações → irrigação</div><h3>Associe a parede ao grupo de derivações</h3><p class="muted">Acompanhe o mesmo grupo no coração e no ECG. O traçado abaixo é normal: a cor destaca derivações, não simula infarto.</p>';
  const stage=el('div','territory-stage'),wall=el('div','figbox'),artery=el('div','figbox'),summary=el('div','territory-summary');
  stage.append(wall,artery,summary);card.appendChild(stage);
  const ec=ecgCanvasCard();
  const items=TERRITORIOS.map(t=>({...t,cor:COR_ART[t.art],titulo:t.nome+' · '+t.leads.join(', '),
    texto:t.id==='cavidade'?'aVR é uma perspectiva superior direita da atividade elétrica, não uma parede nem um marcador isolado de uma artéria.':'Grupo de derivações associado à região '+t.nome.toLowerCase()+'. A correspondência com a artéria é aproximada e depende da anatomia coronária.',
    lembre:t.nome+' → '+t.leads.join(' · '),pergunta:'Quais derivações você associa a '+t.nome.toLowerCase()+'?'}));
  const spec=PMAP.sinusal.build();let selected=items[0],hideAnswer=false;
  function drawECG(){
    if(!ec.cv.isConnected)return;
    const t=selected;
    const view=t.id==='posterior'?{layout:'stack',leads:['V1','V2','V3','V7','V8','V9'],seconds:4,rowMm:24}:t.id==='vd'?{layout:'stack',leads:['DII','DIII','aVF','V3R','V4R'],seconds:4,rowMm:24}:{layout:'grid12',leads:LEAD_ORDER.slice(0,12),rhythmLead:'DII'};
    renderECG(ec.cv,spec,Object.assign({},view,{destaque:hideAnswer?[]:t.leads,destaqueCor:t.cor,pxPerMm:ajustaPx(card,spec,view)}));
  }
  percursoVisual(card,items,(t,i,hidden)=>{
    selected=t;hideAnswer=hidden;
    wall.innerHTML=svgCoracaoCurto(t.segs,t.art)+'<div class="figcap">'+esc(t.id==='cavidade'?'aVR: sem parede isolada':t.nome+' · localização esquemática')+'</div>';
    artery.innerHTML=svgCoronarias(t.id==='cavidade'?null:t.art)+'<div class="figcap">'+esc(t.id==='cavidade'?'Sem artéria específica':NOME_ART[t.art]+' · associação aproximada')+'</div>';
    summary.innerHTML='<span class="kicker">Guarde esta associação</span><h3>'+esc(t.nome)+'</h3><p class="territory-leads">'+(hidden?'? → ? → ?':esc(t.leads.join(' · ')))+'</p><p class="muted small">'+(hidden?'Tente lembrar antes de revelar.':'As derivações contíguas observam regiões relacionadas. A anatomia varia; o mapa não determina sozinho a artéria responsável.')+'</p>';
    drawECG();
  });
  card.appendChild(el('h3',null,'Encontre o grupo no traçado'));
  card.appendChild(ec.box);
  card.appendChild(el('p','muted small','V7–V9 e V3R/V4R são derivações adicionais. As figuras são esquemáticas; a face posterior não é totalmente visível na vista anterior das coronárias.'));
  requestAnimationFrame(drawECG);(window.__draws=window.__draws||[]).push(drawECG);
  return card;
}

/* eixo elétrico interativo */
const EIXO_DEMO = {
  normal: {nome:'Eixo normal', graus:60, cor:'#5ad19a', regra:'DI positivo · aVF positivo',
    hot:['DI','aVF'],
    txt:'Entre −30° e +90°. Se DI e aVF são os dois positivos, o eixo está no quadrante normal e você não precisa calcular nada além disso.',
    build: () => B(72, {seed:201})},
  esq: {nome:'Desvio à esquerda', graus:-45, cor:'#f0b45f', regra:'DI positivo · aVF NEGATIVO',
    hot:['DI','aVL'],
    txt:'Entre −30° e −90°. Confirme em DII: se DII também for negativo, o desvio é verdadeiro. A causa mais comum é o bloqueio divisional anterossuperior; considere também sobrecarga de VE e IAM inferior antigo.',
    build: () => B(70, {seed:202}, {qrsDur:0.10}, ml({'DI':{q:0.08,r:0.95,s:0.03}, 'aVL':{q:0.10,r:0.85,s:0.02},
       'DII':{q:0,r:0.18,s:0.95}, 'DIII':{q:0,r:0.12,s:1.15}, 'aVF':{q:0,r:0.15,s:1.05}}))},
  dir: {nome:'Desvio à direita', graus:120, cor:'#f2788a', regra:'DI NEGATIVO · aVF positivo',
    hot:['DIII','aVF'],
    txt:'Entre +90° e +180°. Pense em sobrecarga de ventrículo direito, TEP, DPOC, bloqueio divisional posteroinferior — e, em jovens longilíneos, pode ser variante normal.',
    build: () => B(88, {seed:203}, {}, ml({'DI':{r:0.18,s:0.85}, 'aVL':{r:0.12,s:0.7},
       'DII':{r:0.9,s:0.1}, 'DIII':{r:1.15,s:0.05}, 'aVF':{r:1.05,s:0.06}}))},
  ext: {nome:'Desvio extremo', graus:-120, cor:'#c07ae0', regra:'DI NEGATIVO · aVF NEGATIVO',
    hot:['aVR'],
    txt:'A "terra de ninguém", entre −90° e 180°. Some em ritmos de origem ventricular, marca-passo, hipercalemia grave e algumas cardiopatias congênitas. Num paciente instável, ver isso é sinal de alarme.',
    build: () => B(96, {seed:204}, {}, ml({'DI':{r:0.15,s:0.8}, 'aVL':{r:0.2,s:0.55},
       'DII':{r:0.15,s:0.95}, 'DIII':{r:0.2,s:0.8}, 'aVF':{r:0.12,s:0.95}, 'aVR':{r:0.75,s:0.1}}))}
};
function eixoInterativo(){
  let sel = 'normal';
  const card = el('div', 'card fade');
  card.appendChild(el('h3', null, 'Eixo elétrico — clique e veja o vetor girar'));
  card.appendChild(el('p', 'muted small', 'O vetor no diagrama hexaxial é a média da despolarização ventricular. Olhe DI e aVF ao lado: são eles que definem o quadrante.'));
  const chips = el('div', 'chips');
  Object.keys(EIXO_DEMO).forEach(k => {
    const d = EIXO_DEMO[k];
    const b = el('button', 'chip');
    b.style.setProperty('--c', d.cor);
    b.innerHTML = '<i></i>' + esc(d.nome) + '<span class="ld">' + (d.graus > 0 ? '+' : '') + d.graus + '°</span>';
    b.dataset.id = k;
    b.onclick = () => { sel = k; pinta(); };
    chips.appendChild(b);
  });
  card.appendChild(chips);
  const par = el('div', 'figpair wide');
  const gA = el('div', 'figbox');
  const gB = el('div');
  const ec = ecgCanvasCard();
  gB.appendChild(ec.box);
  par.append(gA, gB); card.appendChild(par);
  const txt = el('div', 'box cond');
  card.appendChild(txt);
  const specs = {};
  function pinta(){
    const d = EIXO_DEMO[sel];
    [...chips.children].forEach(b => b.classList.toggle('on', b.dataset.id === sel));
    gA.innerHTML = svgHexaxial(d.graus, d.hot) + '<div class="figcap">Vetor médio do QRS</div>';
    if (!specs[sel]) specs[sel] = varySpec(d.build());
    const view = {layout:'stack', leads:['DI','DII','aVF'], seconds:6, rowMm:26, destaque:d.hot, destaqueCor:d.cor};
    renderECG(ec.cv, specs[sel], Object.assign({}, view, {pxPerMm: ajustaPx(gB, specs[sel], view, 8, 6)}));
    txt.innerHTML = '<span class="lbl">' + esc(d.nome) + ' &nbsp;·&nbsp; ' + esc(d.regra) + '</span>' + esc(d.txt);
  }
  pinta();
  requestAnimationFrame(pinta);
  (window.__draws = window.__draws || []).push(pinta);
  return card;
}

/* erros de troca de cabos */
const CABOS = {
  normal: {nome:'Correto', cor:'#5ad19a', pista:'Referência',
    txt:'P positiva em DI, DII e aVF; tudo negativo em aVR; progressão de R crescendo de V1 a V6. Guarde esta imagem — é ela que você compara quando algo parecer estranho.',
    remap:null, build: () => B(72, {seed:211})},
  ra_la: {nome:'Braço D ↔ Braço E', cor:'#f2788a', pista:'DI todo invertido, aVR positivo',
    txt:'O erro mais clássico. DI fica espelhado (P, QRS e T negativos), DII e DIII trocam de lugar, aVR e aVL trocam. Parece dextrocardia — mas as precordiais estão perfeitamente normais, com progressão de R preservada. Esse é o detalhe que resolve.',
    remap:{DI:{src:'DI',inv:true}, DII:{src:'DIII'}, DIII:{src:'DII'}, aVR:{src:'aVL'}, aVL:{src:'aVR'}},
    build: () => B(72, {seed:211})},
  la_ll: {nome:'Braço E ↔ Perna E', cor:'#f0b45f', pista:'DIII invertido, DI e DII trocados',
    txt:'Sutil e por isso perigoso: o traçado continua "plausível". DI e DII trocam, DIII inverte, aVL e aVF trocam. Costuma criar onda Q falsa ou apagar Q real na parede inferior — ou seja, pode inventar ou esconder um infarto inferior.',
    remap:{DI:{src:'DII'}, DII:{src:'DI'}, DIII:{src:'DIII',inv:true}, aVL:{src:'aVF'}, aVF:{src:'aVL'}},
    build: () => B(72, {seed:211})},
  ra_ll: {nome:'Braço D ↔ Perna E', cor:'#c07ae0', pista:'DII completamente negativo',
    txt:'Assinatura fácil de reconhecer: DII fica com P, QRS e T todos negativos — e DII negativo não existe em ritmo sinusal verdadeiro. DI vira −DIII, DIII vira −DI, aVR e aVF trocam. Sempre que vir DII invertido, cheque os cabos antes de laudar ritmo atrial baixo ou juncional.',
    remap:{DI:{src:'DIII',inv:true}, DII:{src:'DII',inv:true}, DIII:{src:'DI',inv:true}, aVR:{src:'aVF'}, aVF:{src:'aVR'}},
    build: () => B(72, {seed:211})},
  v1v2: {nome:'V1 e V2 altas demais', cor:'#4dd0c4', pista:'rSr\' e T negativa em V1–V2',
    txt:'Colar V1 e V2 no 2º espaço intercostal, em vez do 4º, é o erro mais frequente da prática. Cria rSr\' com T negativa (pseudo-Brugada) e má progressão de R que imita infarto anterosseptal antigo. Antes de assustar o paciente, desça os eletrodos dois espaços e repita.',
    remap:null,
    build: () => B(72, {seed:212}, {}, ml({'V1,V2':{shape:'brd', qrsDur:0.11, tAmp:-0.26, st:0.05},
                                          'V3':{r:0.34, s:1.0}}))},
  dextro: {nome:'Dextrocardia verdadeira', cor:'#e2574c', pista:'DI invertido E R decrescente de V1 a V6',
    txt:'Aqui não há erro de técnica: o coração está do lado direito. As derivações de membro dão o mesmo padrão da troca braço-braço, MAS a progressão de R nas precordiais é decrescente — R alta em V1 que vai sumindo até V6. É exatamente esse ponto que separa dextrocardia de cabo trocado. Confirme repetindo com precordiais direitas.',
    remap:{DI:{src:'DI',inv:true}, DII:{src:'DIII'}, DIII:{src:'DII'}, aVR:{src:'aVL'}, aVL:{src:'aVR'}},
    build: () => B(72, {seed:213}, {}, ml({'V1':{r:0.60,s:0.28}, 'V2':{r:0.48,s:0.5}, 'V3':{r:0.34,s:0.7},
                                          'V4':{r:0.24,s:0.82}, 'V5':{r:0.15,s:0.9}, 'V6':{r:0.10,s:0.95}}))}
};
function cabosInterativo(){
  let sel = 'normal';
  const card = el('div', 'card fade');
  card.appendChild(el('h3', null, 'Troca de cabos — o que muda no traçado'));
  card.appendChild(el('p', 'muted small', 'Antes de laudar qualquer coisa esquisita, pergunte-se se os eletrodos estão no lugar certo. Clique para comparar.'));
  const chips = el('div', 'chips');
  Object.keys(CABOS).forEach(k => {
    const d = CABOS[k];
    const b = el('button', 'chip');
    b.style.setProperty('--c', d.cor);
    b.innerHTML = '<i></i>' + esc(d.nome);
    b.dataset.id = k;
    b.onclick = () => { sel = k; pinta(); };
    chips.appendChild(b);
  });
  card.appendChild(chips);
  const ec = ecgCanvasCard();
  card.appendChild(ec.box);
  const txt = el('div', 'box ' + 'peg');
  card.appendChild(txt);
  const specs = {};
  function pinta(){
    const d = CABOS[sel];
    [...chips.children].forEach(b => b.classList.toggle('on', b.dataset.id === sel));
    if (!specs[sel]) specs[sel] = varySpec(d.build());
    const view = {layout:'grid12', leads: LEAD_ORDER.slice(0,12), rhythmLead:'DII', remap: d.remap};
    renderECG(ec.cv, specs[sel], Object.assign({}, view, {pxPerMm: ajustaPx(card, specs[sel], view)}));
    txt.innerHTML = '<span class="lbl">' + esc(d.nome) + ' &nbsp;·&nbsp; ' + esc(d.pista) + '</span>' + esc(d.txt);
  }
  pinta();
  requestAnimationFrame(pinta);
  (window.__draws = window.__draws || []).push(pinta);
  return card;
}

/* ==========================================================================
   AULAS
   ZOOM1, FUNDAMENTOS, FMAP, PASSOS e ROTEIRO definidos em dados/fundamentos.js
   ========================================================================== */
function blocoPassos(){
  const w = el('div', 'steps');
  PASSOS.forEach(p => {
    const d = el('div', 'step');
    d.innerHTML = '<b>' + esc(p.t) + '</b><span class="d">' + esc(p.d) + '</span>' +
      '<div class="tagrow"><span class="tag cat">' + esc(p.ch) + '</span></div>' +
      '<div class="erro-comum"><b>Erro comum:</b> ' + esc(p.er) + '</div>';
    const b = el('button', 'btn ghost', 'Ver a aula →');
    b.style.marginTop = '8px';
    b.onclick = () => irPara('f:' + p.ir);
    d.appendChild(b);
    w.appendChild(d);
  });
  return w;
}
function blocoRegua(){
  const w = el('div', 'regua');
  [['300','1 quadrado'],['150','2'],['100','3'],['75','4'],['60','5'],['50','6']].forEach(([n,l], i) => {
    const d = el('div', i >= 2 && i <= 4 ? 'verde' : '', n + '<span>' + l + '</span>');
    w.appendChild(d);
  });
  return w;
}
const FIGS = {grade: svgGradePapel, einthoven: svgEinthoven, precordiais: svgPrecordiais};

function aula(f, host){
  const c = el('div', 'card fade');
  c.appendChild(el('div', 'kicker', 'Fundamentos'));
  c.appendChild(el('h2', 'ttl', esc(f.titulo)));
  if (f.sub) c.appendChild(el('p', 'muted sub', esc(f.sub)));
  host.appendChild(c);
  if(f.id==='ondas'||f.id==='ritmo')host.appendChild(cicloEletricoVisual());
  if(f.id==='fc')host.appendChild(frequenciaVisual());

  f.blocos.forEach(b => {
    if (f.id==='derivacoes' && b.t==='figpair'){host.appendChild(derivacoesVisual());return;}
    if (b.t === 'mapa'){ host.appendChild(mapaTerritorios()); return; }
    if (b.t === 'eixoI'){ host.appendChild(eixoInterativo()); return; }
    if (b.t === 'cabos'){ host.appendChild(cabosInterativo()); return; }
    const d = el('div', 'card fade');
    if (b.t === 'p'){ d.appendChild(el('p', 'txt', b.v)); }
    else if (b.t === 'ul'){
      if (b.l) d.appendChild(el('h3', null, esc(b.l)));
      const ul = el('ul', 'crit');
      b.v.forEach(x => { const li = document.createElement('li'); li.innerHTML = x; ul.appendChild(li); });
      d.appendChild(ul);
    }
    else if (b.t === 'box'){ d.className = 'fade'; d.appendChild(el('div', 'box ' + b.k, '<span class="lbl">' + esc(b.l) + '</span>' + b.v)); }
    else if (b.t === 'tab'){
      const w = el('div', 'tabwrap'), tb = el('table', 'tab');
      const hr = el('tr'); b.head.forEach(h => hr.appendChild(el('th', null, esc(h))));
      const th = el('thead'); th.appendChild(hr); tb.appendChild(th);
      const bd = el('tbody');
      b.rows.forEach(r => { const tr = el('tr'); r.forEach(cl => tr.appendChild(el('td', null, cl))); bd.appendChild(tr); });
      tb.appendChild(bd); w.appendChild(tb); d.appendChild(w);
    }
    else if (b.t === 'steps'){
      const st = el('div', 'steps');
      b.v.forEach(r => st.appendChild(el('div', 'step', '<b>' + esc(r.t) + '</b><span class="d">' + esc(r.d) + '</span>')));
      d.appendChild(st);
    }
    else if (b.t === 'passos'){ d.appendChild(blocoPassos()); }
    else if (b.t === 'regua'){
      d.appendChild(el('h3', null, 'A régua dos 300 — decore esta sequência'));
      d.appendChild(blocoRegua());
      d.appendChild(el('p', 'muted small dica', '💡 Cada coluna é a FC quando a próxima onda R cai naquele quadrado grande. A faixa verde é o normal.'));
    }
    else if (b.t === 'fig'){
      if (b.l) d.appendChild(el('h3', null, esc(b.l)));
      const fb = el('div', 'figbox gradebox');
      fb.innerHTML = (FIGS[b.v] || (() => ''))();
      d.appendChild(fb);
      if (b.dica) d.appendChild(el('p', 'muted small dica', '💡 ' + b.dica));
    }
    else if (b.t === 'figpair'){
      const par = el('div', 'figpair');
      const fa = el('div', 'figbox'), fb2 = el('div', 'figbox');
      fa.innerHTML = (FIGS[b.a] || (() => ''))() + '<div class="figcap">' + esc(b.al || '') + '</div>';
      fb2.innerHTML = (FIGS[b.b] || (() => ''))() + '<div class="figcap">' + esc(b.bl || '') + '</div>';
      par.append(fa, fb2); d.appendChild(par);
      if (b.dica) d.appendChild(el('p', 'muted small dica', '💡 ' + b.dica));
    }
    else if (b.t === 'ecg'){
      const holder = el('div');
      d.appendChild(holder);
      host.appendChild(d);
      mountECG(holder, {build: PMAP[b.pat].build, view: b.view});
      if (b.dica) d.appendChild(el('p', 'muted small dica', '💡 ' + b.dica));
      return;
    }
    host.appendChild(d);
  });
  navFund(f, host);
}
function navFund(f, host){
  const i = FUNDAMENTOS.indexOf(f);
  const bar = el('div', 'navpair');
  if (i > 0){
    const b = el('button', 'btn', '← ' + FUNDAMENTOS[i - 1].titulo);
    b.onclick = () => irPara('f:' + FUNDAMENTOS[i - 1].id);
    bar.appendChild(b);
  }
  if (i < FUNDAMENTOS.length - 1){
    const b = el('button', 'btn primary', FUNDAMENTOS[i + 1].titulo + ' →');
    b.onclick = () => irPara('f:' + FUNDAMENTOS[i + 1].id);
    bar.appendChild(b);
  } else {
    const b = el('button', 'btn primary', 'Ir para os padrões →');
    b.onclick = () => irPara('sinusal');
    bar.appendChild(b);
  }
  host.appendChild(bar);
}
function irPara(sel){ S.libSel = sel; S.mode = 'aprender'; render(); window.scrollTo({top: 0, behavior: 'smooth'}); }
