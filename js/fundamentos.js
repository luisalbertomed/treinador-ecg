/* ==========================================================================
   FUNDAMENTOS — figuras animadas e aulas visuais da aba Aprender
   ========================================================================== */
const COR_ART = {da: '#e2574c', cd: '#f0a93a', cx: '#4dd0c4', tce: '#c07ae0'};
const NOME_ART = {da: 'descendente anterior (DA)', cd: 'coronária direita (CD)',
                  cx: 'circunflexa (CX)', tce: 'tronco da coronária esquerda'};

/* parede → derivações, artéria, segmentos que acendem no coração */
const TERRITORIOS = [
  {id:'inferior', nome:'Inferior', leads:['DII','DIII','aVF'], art:'cd', segs:['inf','infsep'],
   espelho:'DI e aVL', graus:'+60° a +120°',
   txt:'É a parede que apoia no diafragma. Em 85% das pessoas quem irriga é a coronária direita — por isso IAM inferior vem com bradicardia e bloqueio AV (o nó sinusal e o nó AV são irrigados por ela). Sempre peça V3R/V4R: um terço deles tem extensão para o ventrículo direito, e aí nitrato derruba a pressão.'},
  {id:'septal', nome:'Septal', leads:['V1','V2'], art:'da', segs:['antsep','infsep'],
   espelho:'V7–V9', graus:'—',
   txt:'V1 e V2 ficam de frente para o septo interventricular, irrigado pelos ramos septais da descendente anterior. É onde nasce a onda R pequena da progressão normal — se ela some, pense em infarto anterosseptal antigo.'},
  {id:'anterior', nome:'Anterior', leads:['V3','V4'], art:'da', segs:['ant','antsep'],
   espelho:'DII, DIII e aVF', graus:'—',
   txt:'A parede da frente do ventrículo esquerdo. Território da descendente anterior — a artéria que mais massa miocárdica alimenta, motivo pelo qual oclusão proximal dela é chamada de "viúva" e cursa com choque cardiogênico.'},
  {id:'lateral', nome:'Lateral', leads:['DI','aVL','V5','V6'], art:'cx', segs:['antlat','inflat'],
   espelho:'DII, DIII e aVF', graus:'−30° a +30°',
   txt:'DI e aVL enxergam a lateral alta; V5 e V6, a lateral baixa. Costuma ser da circunflexa ou do primeiro ramo diagonal. Supra isolado em DI e aVL com infra em DII/DIII/aVF é o padrão clássico da lateral alta.'},
  {id:'posterior', nome:'Posterior (dorsal)', leads:['V7','V8','V9'], art:'cx', segs:['inflat','inf'],
   espelho:'V1–V3 (infra + R alta)', graus:'—',
   txt:'O ECG de 12 derivações não olha as costas: você só vê o espelho. Infra de ST em V1–V3 com onda R alta e T positiva é IAM posterior até prova em contrário — vire o papel de cabeça para baixo e o infra vira supra. Confirme colocando V7, V8 e V9.'},
  {id:'vd', nome:'Ventrículo direito', leads:['V3R','V4R'], art:'cd', segs:['vd'],
   espelho:'—', graus:'—',
   txt:'Só aparece em derivações direitas. Supra ≥ 0,5–1 mm em V4R fecha o diagnóstico. A tríade é hipotensão + turgência jugular + pulmão limpo, e o tratamento é VOLUME: nitrato e morfina podem causar colapso hemodinâmico.'},
  {id:'cavidade', nome:'Cavidade (aVR)', leads:['aVR'], art:'tce', segs:[],
   espelho:'todas as demais', graus:'−150°',
   txt:'aVR olha de cima para dentro da cavidade e da via de saída. Por isso quase tudo nela é negativo. Supra em aVR ≥ 1 mm junto com infra difuso nas outras derivações sugere lesão de tronco ou triarterial — é um dos padrões de maior mortalidade do ECG.'}
];
const TMAP = {}; TERRITORIOS.forEach(t => TMAP[t.id] = t);

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
const SEGS = [
  {id:'ant',    a0:-120, a1:-60,  lbl:'ant',     art:'da'},
  {id:'antlat', a0:-60,  a1:0,    lbl:'lat',     art:'cx'},
  {id:'inflat', a0:0,    a1:60,   lbl:'ínf-lat', art:'cx'},
  {id:'inf',    a0:60,   a1:120,  lbl:'inf',     art:'cd'},
  {id:'infsep', a0:120,  a1:180,  lbl:'sep',     art:'cd'},
  {id:'antsep', a0:180,  a1:240,  lbl:'sep',     art:'da'}
];
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
   ========================================================================== */
const ZOOM1 = {layout:'stack', leads:['DII'], seconds:4, rowMm:34};
const FUNDAMENTOS = [
{
  id:'papel', titulo:'O papel do ECG', sub:'Sem isto, nenhuma medida que você fizer depois vale',
  blocos:[
    {t:'p', v:'Todo ECG é registrado numa velocidade e numa amplitude padronizadas: <b>25 mm/s</b> na horizontal e <b>10 mm/mV</b> na vertical. Confira isso no rodapé do traçado <b>antes</b> de medir qualquer coisa — se o aparelho estava em outra configuração, todas as suas medidas saem erradas na mesma proporção.'},
    {t:'fig', v:'grade', l:'A grade, em dois números'},
    {t:'box', k:'cond', l:'Os números que resolvem tudo', v:'<b>Horizontal (tempo):</b> 1 quadradinho = 0,04 s (40 ms) · 1 quadrado grande = 0,20 s · 5 quadrados grandes = 1 segundo.<br><b>Vertical (voltagem):</b> 1 quadradinho = 0,1 mV · 1 quadrado grande = 0,5 mV · 10 mm = 1 mV.'},
    {t:'p', v:'O pulso retangular no começo de cada linha é a <b>calibração</b>: ele mede exatamente 10 mm e vale 1 mV. Se estiver pela metade, o aparelho está em meia amplitude e todo critério de voltagem (Sokolow, por exemplo) precisa ser corrigido antes de você concluir qualquer coisa.'},
    {t:'ecg', pat:'sinusal', view:ZOOM1,
     dica:'Ative o <b>Compasso</b> logo abaixo do traçado e arraste: ele converte a distância em milissegundos e em milivolts para você.'},
    {t:'ul', l:'Armadilhas de registro que você precisa reconhecer', v:[
      '<b>Velocidade em 50 mm/s</b> — tudo parece alargado: QRS "largo" e bradicardia falsa.',
      '<b>Meia amplitude</b> — complexos pequenos demais; risco de perder sobrecarga de VE ou laudar baixa voltagem que não existe.',
      '<b>Tremor ou mau contato</b> — linha de base irregular que imita fibrilação atrial e, em casos extremos, até FV. Olhe se a "arritmia" aparece em todas as derivações ou só numa.',
      '<b>Filtro de rede mal ajustado</b> — some com pequenos detalhes e pode apagar onda P ou espícula de marca-passo.'
    ]}
  ]
},
{
  id:'derivacoes', titulo:'O que cada derivação enxerga', sub:'Parede, artéria e imagem em espelho',
  blocos:[
    {t:'p', v:'As 12 derivações são 12 câmeras apontadas para o coração de ângulos diferentes. Quando o vetor elétrico vem <b>em direção</b> à câmera, a deflexão é positiva; quando se afasta, é negativa. Agrupar as derivações ajuda a localizar alterações: DII, DIII e aVF se relacionam à região inferior. Isso, sozinho, não identifica com certeza a artéria envolvida.'},
    {t:'figpair', a:'einthoven', al:'Plano frontal — triângulo de Einthoven', b:'precordiais', bl:'Plano horizontal — onde colar V1 a V6',
     dica:'Errar a altura de V1 e V2 é a causa mais comum de pseudo-Brugada e de má progressão de R falsa. V4 é a referência: 5º espaço intercostal na linha médio-clavicular.'},
    {t:'mapa'},
    {t:'tab', head:['Derivações','Parede','Artéria mais provável','Imagem em espelho'], rows:[
      ['DII, DIII, aVF','Inferior','Coronária direita (85%) ou circunflexa','DI e aVL'],
      ['V1, V2','Septal','Descendente anterior (ramos septais)','V7–V9'],
      ['V3, V4','Anterior','Descendente anterior','DII, DIII, aVF'],
      ['V5, V6','Lateral baixa','Circunflexa ou diagonal','DIII e aVF'],
      ['DI, aVL','Lateral alta','1ª diagonal da DA ou circunflexa','DII, DIII, aVF'],
      ['V7, V8, V9','Posterior (dorsal)','Circunflexa ou coronária direita','V1–V3 (infra + R alta)'],
      ['V3R, V4R','Ventrículo direito','Coronária direita proximal','—'],
      ['aVR','Cavidade / via de saída','Tronco da coronária esquerda','Todas as demais']
    ]},
    {t:'box', k:'peg', l:'A regra que vale ouro', v:'Derivações <b>contíguas</b> são as que olham a mesma parede, e o critério de supra exige <b>duas contíguas</b>. Onde há supra numa parede, procure o <b>infra recíproco</b> na parede oposta: a presença dele é o achado que mais confirma que aquele supra é isquêmico, e não pericardite ou repolarização precoce.'},
    {t:'ul', l:'Derivações extras: quando pedir', v:[
      '<b>V3R e V4R</b> — em TODO IAM inferior, para procurar extensão ao ventrículo direito.',
      '<b>V7, V8 e V9</b> — sempre que houver infra em V1–V3 com onda R alta, para confirmar IAM posterior.',
      '<b>V1–V2 no 2º/3º espaço</b> — na suspeita de síndrome de Brugada.'
    ]}
  ]
},
{
  id:'ondas', titulo:'Ondas, segmentos e intervalos', sub:'O vocabulário que você usa no laudo',
  blocos:[
    {t:'p', v:'Cada acidente do traçado corresponde a um evento elétrico. Decorar os nomes sem entender o evento é o caminho mais curto para esquecer tudo na semana seguinte.'},
    {t:'ecg', pat:'sinusal', view:ZOOM1,
     dica:'Meça o QRS na derivação em que ele parece mais largo, e o QT onde a onda T termina de forma mais nítida — normalmente DII ou V5.'},
    {t:'tab', head:['Item','O que representa','Normal','Alterado sugere'], rows:[
      ['Onda P','Despolarização atrial','< 120 ms e < 2,5 mm','Apiculada: sobrecarga atrial direita. Bífida e larga: sobrecarga esquerda'],
      ['Intervalo PR','Início da P ao início do QRS','120–200 ms','Longo: BAV de 1º grau. Curto com delta: pré-excitação'],
      ['Complexo QRS','Despolarização ventricular','< 120 ms','≥ 120 ms: bloqueio de ramo, origem ventricular, hipercalemia'],
      ['Onda Q','Primeira deflexão negativa','< 40 ms e < 25% da R','Patológica: necrose antiga'],
      ['Ponto J','Junção entre QRS e ST','Na linha de base','Elevado ou deprimido: lesão, repolarização precoce, onda J'],
      ['Segmento ST','Platô do potencial de ação','Isoelétrico','Supra: lesão transmural. Infra: subendocárdica'],
      ['Onda T','Repolarização ventricular','Concordante com o QRS, assimétrica','Simétrica e profunda: isquemia. Alta e estreita: hipercalemia'],
      ['Onda U','Repolarização tardia','Pequena ou ausente','Proeminente: hipocalemia, bradicardia'],
      ['Intervalo QT','Despolarização + repolarização','QTc < 450 ms (H) / 460 ms (M)','Longo: risco de torsades. Curto: digital, hipercalcemia']
    ]},
    {t:'box', k:'peg', l:'Onde exatamente medir o ST', v:'Meça a <b>60–80 ms depois do ponto J</b>, usando como linha de base o segmento <b>TP</b> (entre o fim da T e o início da P seguinte); quando a taquicardia comer o TP, use o PR. Medir "no olho", sem definir a linha de base, é a causa número um de supra que não existe.'}
  ]
},
{
  id:'fc', titulo:'Calcular a frequência cardíaca', sub:'Três métodos — o certo depende do ritmo',
  blocos:[
    {t:'p', v:'Não existe método único. A primeira pergunta é sempre: <b>o RR é regular ou irregular?</b> Usar o método errado é como medir febre com régua.'},
    {t:'regua'},
    {t:'box', k:'cond', l:'1) Ritmo regular — método dos 300', v:'Ache uma R que caia em cima de uma linha grossa e conte os <b>quadrados grandes</b> até a próxima R, seguindo a sequência <b>300 · 150 · 100 · 75 · 60 · 50</b>. Se a próxima R cai no quarto quadrado grande, a FC é 75. É o método de plantão: resolve em dois segundos.'},
    {t:'box', k:'cond', l:'2) Ritmo irregular — método dos 6 segundos', v:'Na fibrilação atrial não adianta medir um RR, porque o próximo será diferente. Conte quantos QRS existem em <b>10 segundos</b> (a tira inteira) e multiplique por 6 — ou conte em 6 segundos e multiplique por 10. É uma média, e é exatamente isso que você quer nesse caso.'},
    {t:'box', k:'cond', l:'3) Quando precisa de precisão — 1500 ÷ quadradinhos', v:'Conte os <b>quadradinhos</b> entre duas R e divida 1500 por esse número. Use quando o valor exato importa: cálculo de QTc, avaliação de resposta a droga, laudo formal.'},
    {t:'ecg', pat:'sinusal', view:{layout:'stack', leads:['DII'], seconds:10, rowMm:32},
     dica:'Treine agora: ative o Compasso, meça um intervalo RR e confira se o bpm que ele mostra bate com o que você calculou pelo método dos 300.'},
    {t:'box', k:'peg', l:'A pegadinha da bradicardia', v:'Antes de chamar de bradicardia sinusal, confirme que <b>toda</b> P conduz. Um BAV de 2º grau 2:1 também dá 50 bpm — e a conduta é oposta: um observa, o outro pode precisar de marca-passo.'}
  ]
},
{
  id:'eixo', titulo:'Determinar o eixo elétrico', sub:'Dois olhares e você resolve',
  blocos:[
    {t:'p', v:'O eixo é a direção média da despolarização ventricular no plano frontal. Você não precisa calcular graus na prova nem no plantão: precisa dizer em que quadrante ele está — e para isso bastam <b>DI</b> e <b>aVF</b>.'},
    {t:'eixoI'},
    {t:'tab', head:['DI','aVF','Eixo','Pense em'], rows:[
      ['Positivo','Positivo','<b>Normal</b> (−30° a +90°)','Nada. Siga o roteiro'],
      ['Positivo','Negativo','<b>Desvio à esquerda</b>','Bloqueio divisional anterossuperior, sobrecarga de VE, IAM inferior antigo'],
      ['Negativo','Positivo','<b>Desvio à direita</b>','Sobrecarga de VD, TEP, DPOC, bloqueio divisional posteroinferior, longilíneo normal'],
      ['Negativo','Negativo','<b>Desvio extremo</b>','Ritmo ventricular, marca-passo, hipercalemia grave, congênitas']
    ]},
    {t:'box', k:'cond', l:'O truque da derivação isoelétrica', v:'Precisa do valor aproximado em graus? Ache a derivação em que o QRS é mais <b>isoelétrico</b> (positivo e negativo se anulam): o eixo está perpendicular a ela. Depois olhe qual derivação tem o QRS mais positivo para saber para que lado dessa perpendicular ele aponta.'},
    {t:'box', k:'peg', l:'Confirme o desvio à esquerda em DII', v:'DI positivo com aVF negativo pode ser apenas −20°, que ainda é normal. O desvio à esquerda só é verdadeiro se <b>DII também estiver negativo</b> — aí você passou de −30°.'}
  ]
},
{
  id:'ritmo', titulo:'Provar que o ritmo é sinusal', sub:'O passo que quase todo mundo pula',
  blocos:[
    {t:'p', v:'"Ritmo sinusal" não é um chute de aparência: é uma conclusão com quatro critérios. Enquanto você não provar isso, não faz sentido discutir supra, eixo ou QT — porque o diagnóstico pode estar inteiro no ritmo.'},
    {t:'steps', v:[
      {t:'Existe onda P antes de cada QRS?', d:'Uma P para cada QRS, sempre na mesma posição. Se há P sem QRS, pense em bloqueio; se há QRS sem P, pense em escape ou origem ventricular.'},
      {t:'A P é positiva em DI, DII e aVF, e negativa em aVR?', d:'Esse é o vetor do nó sinusal: de cima para baixo e da direita para a esquerda. P negativa em DII é ritmo atrial baixo, juncional — ou cabo trocado.'},
      {t:'O intervalo PR é constante?', d:'Constante significa condução AV estável. PR que aumenta progressivamente é Wenckebach; PR variável com dissociação é BAV total.'},
      {t:'A frequência está entre 50 e 100 bpm?', d:'Abaixo, bradicardia sinusal; acima, taquicardia sinusal. Os dois continuam sendo ritmo sinusal — o adjetivo muda, a origem não.'}
    ]},
    {t:'ecg', pat:'sinusal', view:{layout:'stack', leads:['DII','V1'], seconds:10, rowMm:30},
     dica:'DII e V1 são as melhores derivações para caçar onda P: DII porque a P sinusal é maior nela, V1 porque a P bifásica aparece bem e as ondas de flutter costumam se revelar ali.'},
    {t:'box', k:'peg', l:'Antes de dizer "irregularmente irregular"', v:'Fibrilação atrial exige as duas coisas: <b>ausência de P</b> e <b>RR irregularmente irregular</b>. Extrassístoles frequentes deixam o RR irregular, mas a P está lá. Já o flutter 2:1 é regular e a ~150 bpm — e as ondas F se escondem dentro do ST.'},
    {t:'box', k:'cond', l:'Manobra prática', v:'Não achou a P? Pegue o compasso e marque os RR: se forem perfeitamente regulares a ~150 bpm, procure ondas F em DII, DIII, aVF e V1. Se forem irregulares, você já tem sua resposta.'}
  ]
},
{
  id:'cabos', titulo:'Erros de troca de cabos', sub:'O diagnóstico que você evita fazer',
  blocos:[
    {t:'p', v:'Uma parte relevante dos ECGs "alterados" que chegam ao plantão não tem nada de errado com o paciente: tem eletrodo no lugar errado. Reconhecer esses padrões evita internação, exame e susto desnecessários — e, no sentido inverso, evita mandar para casa um infarto que ficou escondido pela troca.'},
    {t:'cabos'},
    {t:'box', k:'cond', l:'A regra de ouro para separar troca de cabo de dextrocardia', v:'Nos dois casos as derivações de membro ficam invertidas. A diferença está nas <b>precordiais</b>: na troca braço-braço elas continuam normais, com R crescendo de V1 a V6. Na dextrocardia a R <b>decresce</b> de V1 a V6. Um olhar nas precordiais resolve.'},
    {t:'ul', l:'Quando desconfiar, mesmo sem saber qual cabo', v:[
      '<b>P negativa em DII</b> num paciente com ritmo aparentemente sinusal.',
      '<b>aVR positivo</b> — em ECG correto, aVR é quase sempre todo negativo.',
      '<b>DI todo negativo</b> com precordiais normais.',
      '<b>Amplitudes muito baixas numa derivação de membro isolada</b>, com as outras normais.',
      '<b>Traçado que "não combina" com o paciente</b>: infarto extenso em alguém assintomático e sem alteração prévia merece repetição antes de conduta.'
    ]},
    {t:'box', k:'peg', l:'A conduta é sempre a mesma', v:'Na dúvida, <b>repita o exame</b> conferindo os eletrodos você mesmo. Repetir um ECG custa três minutos; tratar um infarto que não existe, ou perder um que existe, custa muito mais.'}
  ]
},
{
  id:'roteiro', titulo:'O roteiro dos 8 passos', sub:'Sempre na mesma ordem, sem exceção',
  blocos:[
    {t:'p', v:'O que separa quem lê ECG de quem adivinha ECG é a ordem. Olhar primeiro para o que "salta aos olhos" faz você encontrar o achado chamativo e perder o achado que muda a conduta. Percorra os oito passos <b>toda vez</b>, inclusive quando o traçado parecer normal.'},
    {t:'passos'},
    {t:'box', k:'cond', l:'Como treinar isso até virar automático', v:'Vá para o <b>Modo laudo</b>: o traçado aparece, você descreve os oito passos em voz alta ou por escrito, e só depois revela o laudo modelo para comparar item a item. Três a cinco por dia, por duas semanas, e a sequência passa a rodar sozinha na sua cabeça.'}
  ]
}
];
const FMAP = {}; FUNDAMENTOS.forEach(f => FMAP[f.id] = f);

/* roteiro detalhado */
const PASSOS = [
  {t:'Ritmo — é sinusal?', d:'Onda P antes de cada QRS, PR constante, P positiva em DI, DII e aVF e negativa em aVR.',
   ch:'P:QRS de 1:1', er:'Chamar de sinusal sem procurar a P em DII e V1.', ir:'ritmo'},
  {t:'Frequência cardíaca', d:'Regular: 300 ÷ quadrados grandes. Irregular: conte os QRS em 10 s e multiplique por 6.',
   ch:'Normal 50–100 bpm', er:'Usar o método dos 300 num RR irregular.', ir:'fc'},
  {t:'Eixo elétrico', d:'Olhe apenas DI e aVF para achar o quadrante; confirme desvio à esquerda em DII.',
   ch:'Normal −30° a +90°', er:'Chamar de desvio à esquerda com DII ainda positivo.', ir:'eixo'},
  {t:'Onda P', d:'Duração e amplitude. Apiculada indica sobrecarga direita; bífida e larga, sobrecarga esquerda.',
   ch:'< 120 ms e < 2,5 mm', er:'Não olhar a P em V1, onde a sobrecarga esquerda aparece melhor.', ir:'ondas'},
  {t:'Intervalo PR', d:'Do início da P ao início do QRS. Constante? Aumenta progressivamente? Alterna?',
   ch:'120–200 ms', er:'Ver PR longo e parar — sem checar se alguma P deixou de conduzir.', ir:'ondas'},
  {t:'QRS — duração, amplitude e onda Q', d:'Largura primeiro; depois voltagem e presença de Q patológica.',
   ch:'< 120 ms · Q < 40 ms e < 25% da R', er:'Ver QRS largo e assumir bloqueio de ramo sem considerar hipercalemia.', ir:'ondas'},
  {t:'Segmento ST e onda T', d:'Meça 60–80 ms após o ponto J, com o TP como linha de base. Procure o espelho.',
   ch:'Supra ≥ 1 mm em 2 contíguas', er:'Laudar supra sem procurar infra recíproco na parede oposta.', ir:'derivacoes'},
  {t:'Intervalo QT', d:'Compare o QT com metade do RR; calcule o QTc quando a FC estiver fora da faixa normal.',
   ch:'QTc < 450 ms (H) / 460 ms (M)', er:'Medir o QT incluindo a onda U e superestimar o valor.', ir:'ondas'}
];
const ROTEIRO = PASSOS.map(p => ({t: p.t, d: p.d}));

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
