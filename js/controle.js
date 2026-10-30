/* ==========================================================================
   CONTROLE REMOTO do Simulador ACLS (celular/tablet)
   Recebe do monitor o catálogo, o estado (2×/s), o registro e os avisos;
   envia comandos. Toda a simulação roda no monitor.
   ========================================================================== */
(function(){
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
function mmss(s){ s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
const CHAVE_EQUIPE = 'treinador-ecg-controle-equipe';
let cli = null, cat = null, est = null, codigo = '', logLocal = [];

/* ---------- conexão ---------- */
function lerHash(){
  const h = new URLSearchParams(location.hash.slice(1));
  return {sala: SimRemoto.normalizarCodigo(h.get('sala')), papel: h.get('papel')};
}
function conectar(c){
  codigo = c;
  if (cli) cli.fechar();
  cat = null; est = null;
  $('#entrar').hidden = true; $('#app').hidden = false;
  $('#codigoSala').textContent = codigo;
  cli = new SimRemoto.Cliente(codigo, aoMsg, aoStatus);
}
function aoStatus(e, via){
  const p = $('#conexao'), av = $('#avisoCon');
  const rot = {procurando: 'procurando…', conectado: via === 'bc' ? 'conectado (esta tela)' : 'conectado', desconectado: 'reconectando…', 'nao-encontrado': 'monitor não encontrado', 'sem-internet': 'sem internet', 'sem-p2p': 'indisponível'}[e] || e;
  p.textContent = rot;
  p.className = 'pill ' + (e === 'conectado' ? 'ok' : (e === 'procurando' ? '' : 'mal'));
  const msg = {
    'nao-encontrado': 'O monitor com o código ' + codigo + ' não respondeu. Confira se o Controle remoto está ligado no monitor e se o código está certo. Tentando de novo…',
    'sem-internet': 'Sem acesso ao servidor de pareamento. O primeiro contato precisa de internet nos dois aparelhos. Tentando de novo…',
    'sem-p2p': 'Este navegador não suporta conexão direta (WebRTC).',
    desconectado: 'Conexão perdida. Tentando reconectar…'
  }[e];
  av.hidden = !msg; av.textContent = msg || '';
  if (e === 'conectado') cli.enviar({tipo: 'ola'});
}
function cmd(c, a, papel){
  if (!cli || !cli.enviar({tipo: 'cmd', c, a: a || {}, papel: papel || 'instrutor'})) toast('Sem conexão com o monitor.', 'erro');
}
function aoMsg(d){
  if (d.tipo === 'catalogo'){ cat = d; montarCatalogo(); montarLider(); if (est) render(); }
  else if (d.tipo === 'estado'){ est = d; recebidoEm = performance.now(); render(); }
  else if (d.tipo === 'log'){
    if (d.todos){ $('#log').innerHTML = ''; logLocal = d.todos.slice(); d.todos.forEach(addLog); } else { logLocal.push(d.e); addLog(d.e); }
  }
  else if (d.tipo === 'toast') toast(d.texto, d.nivel);
  else if (d.tipo === 'avaliacao') mostrarAvaliacao(d);
  else if (d.tipo === 'avaliacaoFechada') $('#aval').hidden = true;
}

/* ---------- registro e avisos ---------- */
function addLog(e){
  if (!e) return;
  const ul = $('#log'), li = document.createElement('li');
  li.className = 'lg-' + e.tipo; li.innerHTML = '<time>' + mmss(e.t) + '</time>';
  li.appendChild(document.createTextNode(e.texto));
  ul.insertBefore(li, ul.firstChild);
}
let tt;
function toast(txt, nivel){
  const el = $('#toast'); el.textContent = txt; el.className = 'on ' + (nivel || '');
  clearTimeout(tt); tt = setTimeout(() => { el.className = ''; }, 3800);
}

/* ---------- montagem a partir do catálogo do monitor ---------- */
function opcoesAgrupadas(sel, itens, rotulo, vazio){
  sel.innerHTML = '';
  if (vazio){ const o = document.createElement('option'); o.value = ''; o.textContent = vazio; sel.appendChild(o); }
  const gs = {};
  for (const it of itens) (gs[it.grupo] = gs[it.grupo] || []).push(it);
  for (const [g, lista] of Object.entries(gs)){
    const og = document.createElement('optgroup'); og.label = g;
    for (const it of lista){ const o = document.createElement('option'); o.value = it.id; o.textContent = it[rotulo]; og.appendChild(o); }
    sel.appendChild(og);
  }
}
const arrastando = new Set();
function montarCatalogo(){
  opcoesAgrupadas($('#selCenario'), cat.cenarios, 'titulo', 'Modo livre');
  opcoesAgrupadas($('#selRitmo'), cat.ritmos, 'nome');
  const box = $('#vitais'); box.innerHTML = '';
  for (const k of cat.deslizantes){
    const d = cat.vitais[k], div = document.createElement('div'); div.className = 'vital';
    div.innerHTML = '<div class="vital-cab"><span></span><button aria-label="Diminuir">−</button><b></b><button aria-label="Aumentar">+</button></div><input type="range">';
    div.querySelector('span').textContent = d.nome + ' (' + d.un + ')';
    const r = div.querySelector('input'), b = div.querySelector('b'), [menos, mais] = div.querySelectorAll('button');
    r.min = d.min; r.max = d.max; r.step = d.passo === 5 ? 1 : d.passo; r.setAttribute('aria-label', d.nome); r.dataset.k = k; b.dataset.k = k;
    const dur = () => Number($('#selDur').value) || 0;
    const alvo = () => est ? (est.alvos[k] !== undefined ? est.alvos[k] : est.vitais[k]) : Number(r.value);
    r.addEventListener('pointerdown', () => arrastando.add(k));
    r.addEventListener('input', () => { arrastando.add(k); b.textContent = r.value; });
    r.addEventListener('change', () => { arrastando.delete(k); cmd('vital', {k, v: Number(r.value), dur: dur()}); });
    menos.onclick = () => cmd('vital', {k, v: alvo() - d.passo, dur: dur()});
    mais.onclick = () => cmd('vital', {k, v: alvo() + d.passo, dur: dur()});
    box.appendChild(div);
  }
  const meds = $('#listaMeds'); meds.innerHTML = ''; let g = null;
  for (const f of cat.farmacos){
    if (f.grupo !== g){ g = f.grupo; const h = document.createElement('div'); h.className = 'grupo-med'; h.textContent = g; meds.appendChild(h); }
    const b = document.createElement('button'); b.className = 'btn opcao';
    b.innerHTML = '<span></span><small></small>'; b.querySelector('span').textContent = f.nome; b.querySelector('small').textContent = f.dose;
    b.onclick = () => { if (confirm('Administrar ' + f.nome + ' ' + f.dose + '?')) cmd('droga', {id: f.id}, 'equipe'); };
    meds.appendChild(b);
  }
  const ac = $('#listaAcoes'); ac.innerHTML = '';
  for (const a of cat.acoes){
    const b = document.createElement('button'); b.className = 'btn opcao';
    b.innerHTML = '<span></span><small></small>'; b.querySelector('span').textContent = a.nome; b.querySelector('small').textContent = a.desc;
    b.onclick = () => cmd('acao', {id: a.id}, 'equipe');
    ac.appendChild(b);
  }
}

/* ---------- estado recebido ---------- */
function render(){
  if (!est) return;
  $('#relogio').textContent = mmss(est.t);
  $('#cenTitulo').textContent = est.cenTitulo;
  $('#ritmoNome').textContent = est.ritmoNome;
  $('#pulso').textContent = est.pulso ? 'com pulso' : 'sem pulso';
  $('#rodando').textContent = est.rodando ? 'rodando' : 'pausado';
  $('#mFC').textContent = est.medidas.fc; $('#mPA').textContent = est.medidas.pa;
  $('#mSpO2').textContent = est.medidas.spo2; $('#mCO2').textContent = est.medidas.etco2;
  $('#alarme').hidden = !est.alarme; $('#alarme').textContent = est.alarme;
  /* instrutor */
  const br = $('#bRodar');
  br.textContent = est.rodando ? 'Pausar' : (est.t > 0 ? 'Retomar' : 'Iniciar');
  br.classList.toggle('primario', !est.rodando);
  if (cat){
    const sc = $('#selCenario'); if (document.activeElement !== sc) sc.value = est.cen;
    const sr = $('#selRitmo'); if (document.activeElement !== sr) sr.value = est.ritmo;
    const c = cat.cenarios.find(x => x.id === est.cen);
    $('#cenInfo').hidden = !c;
    if (c){
      $('#cenResumo').textContent = c.resumo; $('#cenObjetivo').textContent = c.objetivo;
      const box = $('#estados');
      if (box.dataset.cen !== c.id){
        box.dataset.cen = c.id; box.innerHTML = '';
        for (const nome of c.estados){ const b = document.createElement('button'); b.className = 'btn mini'; b.textContent = nome; b.dataset.estado = nome; b.onclick = () => cmd('estado', {nome}); box.appendChild(b); }
      }
      for (const b of box.children) b.classList.toggle('ativo', b.dataset.estado === est.cenEstado);
    }
    $('#estadoDesc').textContent = est.estadoDesc || (c ? '' : 'Modo livre: escolha ritmo e sinais; as respostas são definidas pelo instrutor.');
    for (const r of document.querySelectorAll('#vitais input[type=range]')){
      const k = r.dataset.k, alvo = est.alvos[k];
      if (!arrastando.has(k)) r.value = alvo !== undefined ? alvo : est.vitais[k];
      const b = document.querySelector('#vitais b[data-k="' + k + '"]');
      if (!arrastando.has(k)) b.textContent = est.vitais[k] + (alvo !== undefined ? ' → ' + alvo : '');
    }
  }
  $('#vLim').textContent = est.vitais.limiarMa;
  $('#tPulso').checked = est.pulso;
  $('#tArt').checked = est.linhaArterial;
  for (const b of document.querySelectorAll('[data-rcpq]')) b.classList.toggle('ativo', b.dataset.rcpq === est.rcp.qualidade);
  /* equipe */
  const rcp = $('#bRcp');
  rcp.textContent = est.rcp.on ? 'Parar RCP' : 'Iniciar RCP'; rcp.classList.toggle('ativo', est.rcp.on);
  $('#rcpCiclo').textContent = est.rcp.on ? mmss(est.rcp.ciclo) : '—';
  $('#epiDesde').textContent = est.epi === null ? '—' : mmss(est.epi);
  $('#epiDesde').classList.toggle('vencido', est.epi !== null && !est.pulso && est.epi >= 180);
  $('#vJ').textContent = est.desf.j + ' J';
  $('#bSinc').classList.toggle('ativo', est.desf.sinc);
  const bc = $('#bCarga');
  bc.textContent = est.desf.estado === 'carregando' ? 'Carregando…' : est.desf.estado === 'pronto' ? 'Pronto ' + est.desf.j + ' J' : 'Carregar';
  bc.classList.toggle('pronto', est.desf.estado === 'pronto');
  $('#bChoque').disabled = est.desf.estado !== 'pronto';
  $('#desfStatus').textContent = est.desf.aguardandoR ? 'sincronizando…' : (est.desf.sinc ? 'modo SINC' : '');
  $('#vMpFc').textContent = est.mp.fc; $('#vMpMa').textContent = est.mp.ma;
  $('#bMp').textContent = est.mp.on ? 'Desligar' : 'Ligar'; $('#bMp').classList.toggle('ativo', est.mp.on);
  $('#bMpPausa').textContent = est.mp.pausa ? 'Retomar' : 'Pausar'; $('#bMpPausa').disabled = !est.mp.on;
  $('#mpStatus').textContent = est.mp.on ? (est.mp.pausa ? 'pausado' : (est.mp.capturando ? 'com captura' : 'estimulando')) : 'desligado';
  $('#bPni').textContent = est.pni.medindo ? 'PNI: medindo…' : 'PNI' + (est.pni.valor ? ': ' + est.pni.valor : '');
  $('#bEcg12').textContent = est.ecg12Aberto ? 'Fechar ECG na TV' : 'ECG 12 derivações';
  if (!est.avaliacaoAberta) $('#aval').hidden = true;
  renderLider();
}
/* --------------------------------------------------------------------------
   Aba Líder: cronômetro e próximas condutas (algoritmo de PCR, AHA 2025).
   As condutas seguem o ritmo que a EQUIPE registrou na checagem, não o
   ritmo real: reconhecer o ritmo continua sendo tarefa de quem treina.
   -------------------------------------------------------------------------- */
const DROGAS_PCR = ['epinefrina', 'amiodarona300', 'amiodarona150', 'lidocaina1', 'lidocaina2', 'magnesio'];
const ROTULO_RITMO = {fv: 'FV/TVsp', aesp: 'AESP', assistolia: 'Assistolia', organizado: 'Organizado'};
const CIRC = 2 * Math.PI * 52;
let recebidoEm = 0, chaveAgora = '', alertaChecagem = false, alertaEpi = false;
const Som = {
  ctx: null, ligado: false,
  tom(f, dur, vol){
    if (!this.ligado) return;
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime;
      o.frequency.value = f; g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.02);
    } catch (e) {}
  },
  serie(f, n){ for (let i = 0; i < n; i++) setTimeout(() => this.tom(f, 0.15, 0.2), i * 220); }
};
let metronomo = null;
function montarLider(){
  const dec = $('#declarar'); dec.innerHTML = '';
  for (const [k, nome] of Object.entries(cat.ritmosDeclarados)){
    const b = document.createElement('button'); b.className = 'btn'; b.dataset.r = k; b.textContent = nome;
    b.onclick = () => cmd('declararRitmo', {r: k}, 'lider');
    dec.appendChild(b);
  }
  const box = $('#causas'); box.innerHTML = '';
  for (const c of cat.causas){
    const b = document.createElement('button'); b.className = 'causa'; b.dataset.id = c.id;
    b.innerHTML = '<small></small><span></span>'; b.querySelector('small').textContent = c.grupo === 'H' ? 'H' : 'T'; b.querySelector('span').textContent = c.nome;
    b.onclick = () => cmd('causa', {id: c.id, on: !b.classList.contains('on')}, 'lider');
    box.appendChild(b);
  }
  const dr = $('#drogasPcr'); dr.innerHTML = '';
  for (const id of DROGAS_PCR){
    const f = cat.farmacos.find(x => x.id === id); if (!f) continue;
    const b = document.createElement('button'); b.className = 'droga'; b.dataset.id = id;
    b.innerHTML = '<div><b></b><small></small></div><span class="feito"></span><span class="badge"></span>';
    b.querySelector('b').textContent = f.nome + ' ' + f.dose.split(' (')[0].replace(' IV/IO', '').replace(' em bolus', '');
    b.querySelector('small').textContent = f.dose;
    b.onclick = () => { if (confirm('Administrar ' + f.nome + ' ' + f.dose + '?')) cmd('droga', {id}, 'lider'); };
    dr.appendChild(b);
  }
}
function epiIndicada(c){ return c.ritmo === 'aesp' || c.ritmo === 'assistolia' || (c.ritmo === 'fv' && c.choques >= 2); }
function recomendacoes(c, dt){
  const out = [], r = c.ritmo, rcp = est.rcp, ciclo = rcp.on ? rcp.ciclo + dt : null;
  if (c.desfecho === 'rce'){
    out.push({txt: 'Cuidados pós-PCR', det: 'PAS ≥ 90 mmHg e PAM ≥ 65 mmHg; SpO₂ 90–98%; ventilação sem hiperventilar; controle de temperatura.'});
    out.push({txt: 'ECG de 12 derivações', det: 'Supra de ST ou suspeita de causa coronária: cateterismo de emergência.', botao: ['Na TV', () => cmd('ecg12', {}, 'lider')]});
    out.push({txt: 'Tratar a causa', det: 'Reveja os Hs e Ts.'});
    out.push({txt: 'Nova PCR?', det: 'Reinicie o cronômetro.', botao: ['Iniciar', () => cmd('codigo', {}, 'lider')]});
    return out;
  }
  if (c.desfecho === 'obito'){ out.push({txt: 'Esforços encerrados', det: 'Debriefing da equipe e comunicação com a família.', botao: ['Novo', () => cmd('codigo', {}, 'lider')]}); return out; }
  if (rcp.on && ciclo >= 120) out.push({alto: true, txt: 'Checar ritmo agora', det: 'Pausa de até 10 s. Troque o compressor.', botao: ['Pausar RCP', () => cmd('rcp', {}, 'lider')]});
  if (!rcp.on){
    if (!r) out.push({alto: true, txt: 'Registre o ritmo e retome as compressões', det: 'Analise o traçado na pausa e marque abaixo de "Ritmo na checagem".'});
    else if (r === 'fv' && !c.choqueDesdeChecagem) out.push({alto: true, txt: 'Choque agora', det: 'Bifásico: 120–200 J conforme o fabricante (desconhecido: a máxima). Retome a RCP logo após, sem checar pulso.'});
    else if (r === 'organizado') out.push({alto: true, txt: 'Checar pulso central (até 10 s)', det: 'Com pulso: RCE. Sem pulso: AESP, retome a RCP.', botao: ['Checar', () => cmd('checarPulso', {}, 'lider')]});
    else out.push({alto: true, txt: 'Retomar compressões', det: 'Pausas abaixo de 10 s.', botao: ['RCP', () => cmd('rcp', {}, 'lider')]});
  } else if (r === 'fv' && ciclo >= 100 && ciclo < 120 && est.desf.estado === 'ocioso'){
    out.push({txt: 'Carregar o desfibrilador', det: 'Carregue durante as compressões para encurtar a pausa.', botao: ['Carregar', () => cmd('carga', {}, 'lider')]});
  }
  const epiDevida = epiIndicada(c) && (c.epiUltima === null || c.epiUltima + dt >= 180);
  if (epiDevida) out.push({alto: true, txt: 'Adrenalina 1 mg IV/IO', det: r === 'fv' ? 'Chocável: após o 2º choque; repetir a cada 3–5 min.' : 'Não chocável: o quanto antes; repetir a cada 3–5 min.', droga: 'epinefrina'});
  if (r === 'fv' && c.choques >= 3 && !c.amio300 && !c.lido1) out.push({txt: 'Amiodarona 300 mg (ou lidocaína 1–1,5 mg/kg)', det: 'FV/TVsp refratária, após o 3º choque.', droga: 'amiodarona300'});
  if (r === 'fv' && c.amio300 && !c.amio150 && c.choquesNaAmio !== null && c.choques > c.choquesNaAmio) out.push({txt: 'Amiodarona 150 mg', det: 'Segunda dose, se a FV/TVsp persistir.', droga: 'amiodarona150'});
  if (r === 'fv' && c.lido1 && !c.lido2 && c.choquesNaLido !== null && c.choques > c.choquesNaLido) out.push({txt: 'Lidocaína 0,5–0,75 mg/kg', det: 'Segunda dose, se a FV/TVsp persistir.', droga: 'lidocaina2'});
  if (!c.acesso) out.push({txt: 'Acesso IV (IO se não conseguir)', botao: ['Feito', () => cmd('acao', {id: 'acesso_iv'}, 'lider')]});
  if (!c.viaAerea && c.t + dt > 60) out.push({txt: 'Via aérea avançada + capnografia', det: 'Depois: 1 ventilação a cada 6 s, compressões contínuas. EtCO₂ < 10 mmHg sugere RCP ineficaz; alta súbita sugere RCE.', botao: ['Feito', () => cmd('acao', {id: 'via_aerea'}, 'lider')]});
  if ((r === 'aesp' || r === 'assistolia') && c.causas.length < cat.causas.length) out.push({txt: 'Buscar causas reversíveis', det: 'Hs e Ts: na AESP, tratar a causa é o que traz a circulação de volta.'});
  if (!out.length) out.push({txt: 'Compressões de qualidade', det: '100–120/min, 5–6 cm, retorno completo do tórax, sem pausas.'});
  return out;
}
function renderLider(){
  if (!est || !cat) return;
  const c = est.codigo;
  $('#semCodigo').hidden = !!c; $('#comCodigo').hidden = !c;
  if (!c) return;
  const dt = est.rodando && !c.desfecho ? (performance.now() - recebidoEm) / 1000 : 0;
  const rcp = est.rcp, anel = $('#anel');
  let fr = 1;
  if (c.desfecho){ $('#anelTempo').textContent = c.desfecho === 'rce' ? 'RCE' : 'fim'; $('#anelRotulo').textContent = 'PCR ' + mmss(c.t); anel.className = 'anel'; }
  else if (rcp.on){
    const resta = 120 - (rcp.ciclo + dt);
    $('#anelTempo').textContent = (resta < 0 ? '+' : '') + mmss(Math.abs(resta)); $('#anelRotulo').textContent = 'ciclo de RCP';
    fr = Math.max(0, Math.min(1, resta / 120)); anel.className = 'anel' + (resta <= 0 ? ' vencido' : '');
  } else {
    $('#anelTempo').textContent = mmss(c.pausa + dt); $('#anelRotulo').textContent = 'sem compressões'; anel.className = 'anel parado';
  }
  $('#anelArco').style.strokeDasharray = CIRC; $('#anelArco').style.strokeDashoffset = CIRC * (1 - fr);
  $('#lTotal').textContent = mmss(c.t + dt);
  $('#lRitmo').textContent = c.ritmo ? ROTULO_RITMO[c.ritmo] : '—';
  $('#lChoques').textContent = c.choques;
  const devida = !c.desfecho && epiIndicada(c) && (c.epiUltima === null || c.epiUltima + dt >= 180);
  if (c.desfecho){ $('#lEpi').textContent = c.epiDoses + ' dose(s)'; $('#lEpiSub').textContent = ''; }
  else if (c.epiUltima === null){ $('#lEpi').textContent = devida ? 'devida' : '—'; $('#lEpiSub').textContent = devida ? 'nenhuma dose' : ''; }
  else {
    const desde = c.epiUltima + dt, prox = 180 - desde;
    $('#lEpi').textContent = prox > 0 ? mmss(prox) : (desde > 300 ? 'atrasada' : 'devida');
    $('#lEpiSub').textContent = prox > 0 ? 'próxima · ' + c.epiDoses + ' dose(s)' : 'última há ' + mmss(desde);
  }
  $('#lEpiBox').classList.toggle('devida', devida);
  /* faixa de alerta */
  const fx = $('#faixa'); let txt = '', grave = false;
  if (c.desfecho === 'rce') txt = 'RCE declarado: cuidados pós-PCR';
  else if (c.desfecho === 'obito') txt = 'Esforços encerrados';
  else if (rcp.on && rcp.ciclo + dt >= 120){ txt = '⚠ Checar ritmo agora'; grave = true; }
  else if (!rcp.on && c.pausa + dt > 10){ txt = 'Pausa de ' + Math.round(c.pausa + dt) + ' s: retome as compressões'; grave = true; }
  else if (!rcp.on) txt = 'Pausa: analise o ritmo e decida (até 10 s)';
  fx.hidden = !txt; fx.textContent = txt; fx.className = 'faixa' + (grave ? ' grave' : '');
  /* sons: checagem e adrenalina */
  const chk = !c.desfecho && rcp.on && rcp.ciclo + dt >= 120;
  if (chk && !alertaChecagem) Som.serie(880, 3);
  alertaChecagem = chk;
  if (devida && !alertaEpi) Som.serie(660, 2);
  alertaEpi = devida;
  /* ritmo registrado */
  for (const b of document.querySelectorAll('#declarar .btn')) b.classList.toggle('ativo', b.dataset.r === c.ritmo);
  /* agora */
  const recs = recomendacoes(c, dt), chave = JSON.stringify(recs.map(x => [x.txt, x.det, !!x.alto, x.droga]));
  if (chave !== chaveAgora){
    chaveAgora = chave;
    const box = $('#agora'); box.innerHTML = '';
    for (const x of recs){
      const d = document.createElement('div'); d.className = 'rec' + (x.alto ? ' alto' : '');
      d.innerHTML = '<div><b></b><p></p></div>'; d.querySelector('b').textContent = x.txt; d.querySelector('p').textContent = x.det || '';
      if (x.droga || x.botao){
        const b = document.createElement('button'); b.className = 'btn';
        b.textContent = x.droga ? 'Dar' : x.botao[0];
        b.onclick = x.droga ? () => cmd('droga', {id: x.droga}, 'lider') : x.botao[1];
        d.appendChild(b);
      }
      box.appendChild(d);
    }
  }
  const agoraDrogas = new Set(recs.filter(x => x.droga).map(x => x.droga));
  const doses = {epinefrina: c.epiDoses, amiodarona300: c.amio300, amiodarona150: c.amio150, lidocaina1: c.lido1, lidocaina2: c.lido2};
  for (const b of document.querySelectorAll('#drogasPcr .droga')){
    const id = b.dataset.id, on = agoraDrogas.has(id);
    b.classList.toggle('agora', on); b.querySelector('.badge').textContent = on ? 'AGORA' : '';
    b.querySelector('.feito').textContent = doses[id] ? '×' + doses[id] : '';
  }
  /* causas */
  const feitas = new Set(c.causas), pend = cat.causas.length - feitas.size;
  for (const b of document.querySelectorAll('#causas .causa')) b.classList.toggle('on', feitas.has(b.dataset.id));
  $('#causasPend').textContent = pend ? pend + '/' + cat.causas.length + ' pendentes' : 'todas avaliadas';
  $('#causasPend').classList.toggle('zero', !pend);
  $('#bRce').disabled = $('#bObito').disabled = !!c.desfecho;
}
function linhaLider(){
  if (!est || !est.codigo) return;
  const ul = $('#linhaLider'), ini = est.codigo.ini;
  const itens = logLocal.filter(e => e.t >= ini && ['rcp', 'choque', 'droga', 'lider', 'acao', 'marcapasso'].includes(e.tipo));
  if (ul.dataset.n === String(itens.length) && ul.dataset.ini === String(ini)) return;
  ul.dataset.n = itens.length; ul.dataset.ini = ini; ul.innerHTML = '';
  for (const e of itens.slice().reverse()){
    const li = document.createElement('li'); li.className = 'lg-' + e.tipo;
    li.innerHTML = '<time>' + mmss(e.t - ini) + '</time><span></span>'; li.querySelector('span').textContent = e.texto;
    ul.appendChild(li);
  }
}
function ligarLider(){
  $('#bIniciarCodigo').onclick = () => cmd('codigo', {}, 'lider');
  $('#bRce').onclick = () => { if (confirm('Declarar RCE? Confirme pulso central antes.')) cmd('desfecho', {tipo: 'rce'}, 'lider'); };
  $('#bObito').onclick = () => { if (confirm('Encerrar os esforços de reanimação?')) cmd('desfecho', {tipo: 'obito'}, 'lider'); };
  $('#causasCab').onclick = () => { const el = $('#causas'); el.hidden = !el.hidden; $('#causasCab').setAttribute('aria-expanded', String(!el.hidden)); };
  $('#tSomLider').onchange = e => { Som.ligado = e.target.checked; if (Som.ligado) Som.tom(660, 0.08, 0.1); };
  $('#tMetronomo').onchange = e => {
    clearInterval(metronomo); metronomo = null;
    if (e.target.checked){
      const anterior = Som.ligado; Som.ligado = true; Som.tom(1400, 0.03, 0.25); Som.ligado = anterior;
      metronomo = setInterval(() => { const a = Som.ligado; Som.ligado = true; Som.tom(1400, 0.03, 0.25); Som.ligado = a; }, 60000 / 110);
    }
  };
  setInterval(() => { if (!$('#p-lider').classList.contains('on')) { if (est) renderLiderSons(); return; } renderLider(); linhaLider(); }, 250);
}
/* Com a aba fechada, os alertas sonoros continuam valendo */
function renderLiderSons(){
  const c = est.codigo; if (!c || c.desfecho) return;
  const dt = est.rodando ? (performance.now() - recebidoEm) / 1000 : 0;
  const chk = est.rcp.on && est.rcp.ciclo + dt >= 120, devida = epiIndicada(c) && (c.epiUltima === null || c.epiUltima + dt >= 180);
  if (chk && !alertaChecagem) Som.serie(880, 3);
  if (devida && !alertaEpi) Som.serie(660, 2);
  alertaChecagem = chk; alertaEpi = devida;
}


/* ---------- avaliação ---------- */
function mostrarAvaliacao(d){
  $('#avCenario').textContent = d.cenario;
  const nums = $('#avNums'); nums.innerHTML = '';
  for (const [k, v] of d.nums){ const div = document.createElement('div'); div.innerHTML = '<small></small><b></b>'; div.querySelector('small').textContent = k; div.querySelector('b').textContent = v; nums.appendChild(div); }
  const ul = $('#avItens'); ul.innerHTML = '';
  const ordem = {erro: 0, alerta: 1, ok: 2};
  for (const it of d.itens.slice().sort((a, b) => ordem[a.nivel] - ordem[b.nivel])){
    const li = document.createElement('li'); li.className = 'av-' + it.nivel;
    li.innerHTML = '<span class="selo"></span><b></b><p></p>';
    li.querySelector('.selo').textContent = it.nivel === 'ok' ? 'OK' : it.nivel === 'alerta' ? 'Atenção' : 'Erro';
    li.querySelector('b').textContent = it.titulo; li.querySelector('p').textContent = it.texto;
    ul.appendChild(li);
  }
  if (!d.itens.length){ const li = document.createElement('li'); li.textContent = 'Nada a avaliar ainda.'; ul.appendChild(li); }
  $('#aval').hidden = false; window.scrollTo(0, 0);
}

/* ---------- eventos ---------- */
function abas(){
  for (const b of document.querySelectorAll('.aba')) b.onclick = () => irAba(b.dataset.aba);
}
function irAba(id){
  for (const b of document.querySelectorAll('.aba')) b.classList.toggle('on', b.dataset.aba === id);
  for (const p of document.querySelectorAll('section.painel')) p.classList.toggle('on', p.id === 'p-' + id);
  window.scrollTo(0, 0);
}
function soEquipe(on){
  $('#abaInstrutor').hidden = on;
  document.querySelector('.abas').style.gridTemplateColumns = on ? 'repeat(3,1fr)' : '';
  $('#tSoEquipe').checked = on;
  if (on && $('#p-instrutor').classList.contains('on')) irAba('equipe');
  try { if (on) sessionStorage.setItem(CHAVE_EQUIPE, '1'); else sessionStorage.removeItem(CHAVE_EQUIPE); } catch (e) {}
}
function ligar(){
  abas();
  $('#bRodar').onclick = () => cmd('rodar');
  $('#bReiniciar').onclick = () => { if (confirm('Reiniciar o cenário? O registro atual será apagado.')) cmd('reiniciar'); };
  $('#bAvaliar').onclick = () => cmd('avaliar');
  $('#selCenario').onchange = e => { if (confirm('Trocar de cenário? O registro atual será apagado.')) cmd('cenario', {id: e.target.value}); else render(); };
  $('#selRitmo').onchange = e => cmd('ritmo', {id: e.target.value});
  $('#tPulso').onchange = e => cmd('pulso', {on: e.target.checked});
  $('#tArt').onchange = e => cmd('linhaArterial', {on: e.target.checked});
  for (const b of document.querySelectorAll('[data-rcpq]')) b.onclick = () => cmd('qualidadeRcp', {v: b.dataset.rcpq});
  for (const b of document.querySelectorAll('[data-lim]')) b.onclick = () => est && cmd('vital', {k: 'limiarMa', v: est.vitais.limiarMa + 5 * Number(b.dataset.lim)});
  for (const b of document.querySelectorAll('#p-equipe [data-c]')) b.onclick = () => cmd(b.dataset.c, b.dataset.d ? {d: Number(b.dataset.d)} : {}, 'equipe');
  $('#bRcp').onclick = () => cmd('rcp', {}, 'equipe');
  $('#bSinc').onclick = () => cmd('sinc', {}, 'equipe');
  $('#bCarga').onclick = () => cmd('carga', {}, 'equipe');
  $('#bChoque').onclick = () => cmd('choque', {}, 'equipe');
  $('#bMp').onclick = () => cmd('mp', {}, 'equipe');
  $('#bMpPausa').onclick = () => cmd('mpPausa', {}, 'equipe');
  $('#bEcg12').onclick = () => cmd(est && est.ecg12Aberto ? 'fecharEcg12' : 'ecg12', {}, 'equipe');
  $('#bFecharAval').onclick = () => { $('#aval').hidden = true; cmd('fecharAvaliacao'); };
  $('#tSoEquipe').onchange = e => soEquipe(e.target.checked);
  $('#trocarSala').onclick = e => { e.preventDefault(); if (cli) cli.fechar(); cli = null; history.replaceState(null, '', location.pathname + location.search); $('#app').hidden = true; $('#entrar').hidden = false; $('#iCodigo').value = ''; $('#iCodigo').focus(); };
  $('#fEntrar').onsubmit = e => {
    e.preventDefault();
    const c = SimRemoto.normalizarCodigo($('#iCodigo').value);
    if (c.length !== 6){ toast('O código tem 6 caracteres.', 'erro'); return; }
    history.replaceState(null, '', location.pathname + location.search + '#sala=' + c);
    conectar(c);
  };
}
function iniciar(){
  ligar(); ligarLider();
  const h = lerHash();
  let equipe = h.papel === 'equipe';
  try { equipe = equipe || sessionStorage.getItem(CHAVE_EQUIPE) === '1'; } catch (e) {}
  soEquipe(equipe);
  if (h.sala && h.sala.length === 6) conectar(h.sala);
  else { $('#entrar').hidden = false; $('#iCodigo').focus(); }
  if (navigator.wakeLock) document.addEventListener('click', () => { navigator.wakeLock.request('screen').catch(() => {}); }, {once: true});
}
iniciar();
})();
