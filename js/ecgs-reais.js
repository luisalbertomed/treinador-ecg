/* Sinais PTB-XL v1.0.3: exploração e treino com 30 traçados clínicos sob licença CC BY 4.0 */
const REAL_STATE = {
  tab: 'explorar', // 'explorar' | 'treinar'
  index: 0,
  cat: 'Todas',
  revealed: false,
  layout: 'grid12',
  lead: 'DII',
  trainId: null,
  trainAnswered: false,
  selectedAnswer: null
};

const REAL_LEADS = ['DI','DII','DIII','aVR','aVL','aVF','V1','V2','V3','V4','V5','V6'];
function realSpec(record){
  const signals = {};
  for (const [lead, values] of Object.entries(record.samplesUv)){
    signals[lead] = Float64Array.from(values, v => v / 1000);
  }
  return { real: true, fs: record.fs, dur: record.duration, signals };
}

const REAL_CATS = [
  'Todas',
  'Normais e variantes',
  'Isquemia e IAM',
  'Arritmias',
  'Distúrbios de condução',
  'Sobrecargas e repolarização'
];

/* Treino: só registros com diagnóstico inequívoco (campo answer). Respostas também verdadeiras para o traçado (exclude) não entram como distratores. */
function registrosDeTreino(){return ECGS_REAIS.filter(r => r.answer);}
function trainRecord(){const pool = registrosDeTreino();return pool.find(x => x.id === REAL_STATE.trainId) || pool[0];}
function obterDistratoresReais(record){
  const banidas = new Set([record.answer, ...(record.exclude || [])]);
  const candidatas = registrosDeTreino().filter(r => r.id !== record.id && !banidas.has(r.answer));
  const mesmoGrupo = candidatas.filter(r => r.category === record.category);
  const outros = candidatas.filter(r => r.category !== record.category);
  const pool = [...shuffle(mesmoGrupo), ...shuffle(outros)];
  const distratores = pool.slice(0, 3).map(r => r.answer);
  return { correta: record.answer, opcoes: shuffle([record.answer, ...distratores]) };
}

/* Aprender: cartão "No ECG real" abaixo do traçado sintético do padrão. O traçado só é montado quando o aluno pede. */
function realExamplesCard(pat, host){
  const records = ECGS_REAIS.filter(r => (r.patterns || []).includes(pat.id));
  if (!records.length) return;
  const card = el('div', 'card fade real-examples');
  card.appendChild(el('h3', null, 'No ECG real'));
  card.appendChild(el('p', 'muted small', 'O traçado acima é sintético e mostra o achado isolado. Veja o padrão num ECG de paciente, com ruído e achados associados. Procure os critérios antes de abrir o laudo da fonte.'));
  records.forEach(r => {
    const item = el('div', 'mt-12');
    const open = el('button', 'btn', 'Ver traçado real · registro ' + esc(r.id));
    open.onclick = () => {
      open.remove();
      const holder = el('div'); item.appendChild(holder);
      mountECG(holder, { view: { layout: 'grid12', leads: REAL_LEADS, rhythmLead: 'DII', seconds: 10, rowMm: 40 } }, { spec: realSpec(r), locked: true });
      const notes = el('details'); notes.appendChild(el('summary', null, 'Laudo e códigos da fonte (' + esc(r.title.replace(/^Registro \d+ · /, '')) + ')'));
      const list = el('ul', 'crit'); r.labels.forEach(l => list.appendChild(el('li', null, esc(l)))); notes.appendChild(list);
      item.appendChild(notes);
      item.appendChild(el('p', 'small muted', 'PTB-XL v1.0.3 · Wagner e colaboradores / PhysioNet · CC BY 4.0 · <a href="' + r.source + '" target="_blank" rel="noopener">registro original</a> · <a href="fontes-ecg.html" target="_blank" rel="noopener">fontes e licença</a>'));
    };
    item.appendChild(open); card.appendChild(item);
  });
  host.appendChild(card);
}

function viewECGsReais(root){
  const r = REAL_STATE.tab === 'treinar' ? trainRecord() : ECGS_REAIS[REAL_STATE.index];
  
  // Cabeçalho da área
  const headerCard = el('section', 'card');
  const hRow = el('div', 'row between wrap');
  const hTitle = el('div', null);
  hTitle.appendChild(el('h2', null, 'ECGs reais · PTB-XL'));
  hTitle.appendChild(el('p', 'muted', '30 traçados digitalizados de 12 derivações em 500 Hz da PhysioNet sob licença aberta CC BY 4.0. No treino entram os ' + registrosDeTreino().length + ' com diagnóstico inequívoco.'));
  hRow.appendChild(hTitle);
  
  // Abas internas: Explorar vs Treinar
  const modeBar = el('div', 'ecgbar');
  const btnExplorar = el('button', 'btn' + (REAL_STATE.tab === 'explorar' ? ' primary' : ''), 'Aprender / Explorar');
  btnExplorar.setAttribute('aria-pressed', String(REAL_STATE.tab === 'explorar'));
  btnExplorar.onclick = () => { REAL_STATE.tab = 'explorar'; render(); };
  
  const btnTreinar = el('button', 'btn' + (REAL_STATE.tab === 'treinar' ? ' primary' : ''), 'Treinar com traçado real');
  btnTreinar.setAttribute('aria-pressed', String(REAL_STATE.tab === 'treinar'));
  btnTreinar.onclick = () => {
    REAL_STATE.tab = 'treinar';
    REAL_STATE.trainId = registrosDeTreino()[Math.floor(Math.random() * registrosDeTreino().length)].id;
    REAL_STATE.trainAnswered = false;
    REAL_STATE.selectedAnswer = null;
    render();
  };
  
  modeBar.appendChild(btnExplorar);
  modeBar.appendChild(btnTreinar);
  hRow.appendChild(modeBar);
  headerCard.appendChild(hRow);
  root.appendChild(headerCard);

  if (REAL_STATE.tab === 'explorar'){
    renderModoExplorar(root, r);
  } else {
    renderModoTreinoReal(root, r);
  }

  // Rodapé de créditos e licença CC BY 4.0
  const credits = el('section', 'card small muted');
  credits.appendChild(el('p', null, '<strong>Atribuição de origem:</strong> ECG proveniente do PTB-XL v1.0.3 — Wagner e colaboradores / PhysioNet. Registro original: <code>#' + esc(r.id) + '</code>. Licença Creative Commons Attribution 4.0 (CC BY 4.0). Sinais em 500 Hz sem filtragem destrutiva ou distorção de amplitude.'));
  const linksP = el('p', null);
  linksP.innerHTML = '<a href="' + r.source + '" target="_blank" rel="noopener">Acessar registro original na PhysioNet</a> · <a href="fontes-ecg.html" target="_blank" rel="noopener">Ver metodologia, fontes e licença integral</a> · <a href="licencas/PTB-XL-CC-BY-4.0.txt" target="_blank" rel="noopener">Texto da CC BY 4.0 (offline)</a>';
  credits.appendChild(linksP);
  root.appendChild(credits);
}

function renderModoExplorar(root, r){
  const card = el('section', 'card');
  
  // Barra de categorias
  const catBar = el('div', 'ecgbar');
  REAL_CATS.forEach(c => {
    const b = el('button', 'btn' + (REAL_STATE.cat === c ? ' on' : ''), c);
    b.onclick = () => {
      REAL_STATE.cat = c;
      const filtered = c === 'Todas' ? ECGS_REAIS : ECGS_REAIS.filter(item => item.category === c);
      if (filtered.length > 0 && !filtered.includes(ECGS_REAIS[REAL_STATE.index])){
        REAL_STATE.index = ECGS_REAIS.indexOf(filtered[0]);
      }
      REAL_STATE.revealed = false;
      render();
    };
    catBar.appendChild(b);
  });
  card.appendChild(catBar);

  // Seletor de traçados na categoria
  const filtered = REAL_STATE.cat === 'Todas' ? ECGS_REAIS : ECGS_REAIS.filter(item => item.category === REAL_STATE.cat);
  const selectRow = el('div', 'row between wrap mt-8');
  const select = el('select', 'guide-select');
  select.setAttribute('aria-label', 'Escolher traçado real');
  filtered.forEach(item => {
    const opt = el('option', null, item.title + ' (' + item.category + ')');
    opt.value = ECGS_REAIS.indexOf(item);
    select.appendChild(opt);
  });
  select.value = String(REAL_STATE.index);
  select.onchange = () => {
    REAL_STATE.index = parseInt(select.value, 10);
    REAL_STATE.revealed = false;
    render();
  };
  selectRow.appendChild(select);

  // Controles de visualização
  const controls = el('div', 'ecgbar');
  for (const [layout, label] of [['grid12', '12 derivações'], ['stack', 'Derivação contínua']]){
    const b = el('button', 'btn' + (REAL_STATE.layout === layout ? ' on' : ''), label);
    b.onclick = () => { REAL_STATE.layout = layout; render(); };
    controls.appendChild(b);
  }
  if (REAL_STATE.layout === 'stack'){
    const leadSelect = el('select', 'guide-select');
    leadSelect.setAttribute('aria-label', 'Derivação contínua');
    for (const lead of LEAD_ORDER.slice(0, 12)){
      const o = el('option', null, lead);
      o.value = lead;
      leadSelect.appendChild(o);
    }
    leadSelect.value = REAL_STATE.lead;
    leadSelect.onchange = () => { REAL_STATE.lead = leadSelect.value; render(); };
    controls.appendChild(leadSelect);
  }
  selectRow.appendChild(controls);
  card.appendChild(selectRow);

  // Informações de título
  const titleRow = el('div', 'mt-12');
  titleRow.appendChild(el('h3', null, r.title));
  titleRow.appendChild(el('p', 'small muted', 'Categoria: ' + r.category + ' · 10 segundos · 500 Hz · Calibração nominal: 25 mm/s e 10 mm/mV'));
  card.appendChild(titleRow);

  if (r.note) titleRow.appendChild(el('p', 'small muted', esc(r.note)));

  // Canvas do ECG
  const view = {
    layout: REAL_STATE.layout,
    leads: REAL_STATE.layout === 'grid12' ? ['DI','DII','DIII','aVR','aVL','aVF','V1','V2','V3','V4','V5','V6'] : [REAL_STATE.lead],
    rhythmLead: 'DII',
    seconds: 10,
    rowMm: 40
  };
  mountECG(card, { view }, { spec: realSpec(r), locked: true });
  card.appendChild(el('p', 'small muted', REAL_STATE.layout === 'grid12' ?
    'Grade 12 derivações: 2,5 s por derivação com faixa inferior longa de DII (10 s). Calibração e compasso ativos.' :
    'Exibindo 10 segundos contínuos da derivação selecionada. Use o compasso para medir durações e intervalos.'));

  // Botão de revelar / ocultar
  const revealBtn = el('button', 'btn primary', REAL_STATE.revealed ? 'Ocultar interpretação' : 'Revelar anotações da fonte PTB-XL');
  revealBtn.onclick = () => { REAL_STATE.revealed = !REAL_STATE.revealed; render(); };
  card.appendChild(revealBtn);

  if (REAL_STATE.revealed){
    const panel = el('section', 'box mt-16');
    panel.appendChild(el('h3', null, 'Anotações da base de dados PTB-XL'));
    const list = el('ul', 'crit');
    r.labels.forEach(l => list.appendChild(el('li', null, esc(l))));
    panel.appendChild(list);
    panel.appendChild(el('p', 'small muted', 'Os rótulos diagnósticos correspondem estritamente aos registros arquivados no banco de dados PTB-XL. Não foram atribuídas histórias fictícias a pacientes reais.'));
    card.appendChild(panel);
  }

  root.appendChild(card);
}

function renderModoTreinoReal(root, r){
  const card = el('section', 'card');
  
  const topBar = el('div', 'row between wrap');
  const info = el('div', null);
  info.appendChild(el('h3', null, 'Qual é o diagnóstico principal deste traçado?'));
  info.appendChild(el('p', 'small muted', 'Traçado clínico real anonimizado do PTB-XL · 12 derivações · 500 Hz'));
  topBar.appendChild(info);

  const btnOutro = el('button', 'btn', 'Outro traçado real ↻');
  btnOutro.onclick = () => {
    const pool = registrosDeTreino().filter(x => x.id !== r.id);
    REAL_STATE.trainId = pool[Math.floor(Math.random() * pool.length)].id;
    REAL_STATE.trainAnswered = false;
    REAL_STATE.selectedAnswer = null;
    render();
  };
  topBar.appendChild(btnOutro);
  card.appendChild(topBar);

  // Traçado sem o título diagnóstico evidente
  const view = {
    layout: REAL_STATE.layout,
    leads: REAL_STATE.layout === 'grid12' ? ['DI','DII','DIII','aVR','aVL','aVF','V1','V2','V3','V4','V5','V6'] : [REAL_STATE.lead],
    rhythmLead: 'DII',
    seconds: 10,
    rowMm: 40
  };
  mountECG(card, { view }, { spec: realSpec(r), locked: true });

  // Opções de resposta
  if (!REAL_STATE._trainQuiz || REAL_STATE._trainQuiz.id !== r.id){
    REAL_STATE._trainQuiz = Object.assign({ id: r.id }, obterDistratoresReais(r));
  }
  const quiz = REAL_STATE._trainQuiz;

  const choicesBox = el('div', 'choices mt-16');
  quiz.opcoes.forEach(opcao => {
    let cls = 'btn full text-left';
    if (REAL_STATE.trainAnswered){
      if (opcao === quiz.correta) cls += ' correct';
      else if (opcao === REAL_STATE.selectedAnswer) cls += ' wrong';
    }
    const b = el('button', cls, opcao);
    if (!REAL_STATE.trainAnswered){
      b.onclick = () => {
        REAL_STATE.trainAnswered = true;
        REAL_STATE.selectedAnswer = opcao;
        render();
      };
    }
    choicesBox.appendChild(b);
  });
  card.appendChild(choicesBox);

  // Feedback pós-resposta
  if (REAL_STATE.trainAnswered){
    const acertou = REAL_STATE.selectedAnswer === quiz.correta;
    const fbBox = el('section', 'box mt-16 ' + (acertou ? 'ok' : 'bad'));
    fbBox.appendChild(el('h3', null, acertou ? 'Correto!' : 'Diagnóstico incorreto'));
    fbBox.appendChild(el('p', null, '<strong>Diagnóstico principal:</strong> ' + esc(quiz.correta)));
    fbBox.appendChild(el('p', 'small muted', 'Gabarito baseado no laudo e nos códigos da fonte, ainda sem revisão por especialista. Outros achados do traçado estão listados abaixo.'));
    
    const list = el('ul', 'crit mt-8');
    r.labels.forEach(l => list.appendChild(el('li', null, esc(l))));
    fbBox.appendChild(list);

    const nextAction = el('button', 'btn primary mt-12', 'Próximo traçado real →');
    nextAction.onclick = btnOutro.onclick;
    fbBox.appendChild(nextAction);
    card.appendChild(fbBox);
  }

  root.appendChild(card);
}
