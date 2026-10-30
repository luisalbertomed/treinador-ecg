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
let cli = null, cat = null, est = null, codigo = '';

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
  if (d.tipo === 'catalogo'){ cat = d; montarCatalogo(); if (est) render(); }
  else if (d.tipo === 'estado'){ est = d; render(); }
  else if (d.tipo === 'log'){
    if (d.todos){ $('#log').innerHTML = ''; d.todos.forEach(addLog); } else addLog(d.e);
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
  document.querySelector('.abas').style.gridTemplateColumns = on ? '1fr 1fr' : '';
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
  ligar();
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
