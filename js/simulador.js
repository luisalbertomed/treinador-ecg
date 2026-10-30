/* ==========================================================================
   SIMULADOR DE MONITOR/DESFIBRILADOR — treino de ACLS (AHA 2025)
   Gera em tempo real ECG (DII), PA invasiva, pletismografia e capnografia;
   desfibrilador (sincronizado ou não), marcapasso transcutâneo, RCP,
   medicações, cenários com regras e avaliação automática ao final.
   ========================================================================== */
(function(){
'use strict';

const SFS = 250, DT = 1 / SFS;   // amostragem do monitor (Hz)
const $ = (s, r) => (r || document).querySelector(s);
function mmss(s){ s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function gauss(x, c, w, a){ const d = (x - c) / w; return a * Math.exp(-0.5 * d * d); }
function sorteio(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
let R = sorteio(Date.now());

/* --------------------------------------------------------------------------
   Ritmos. tipo = gerador; pulso = há perfusão por padrão; chocavel = FV/TVsp.
   -------------------------------------------------------------------------- */
const RITMOS = {
  sinusal:         {nome: 'Ritmo sinusal',              grupo: 'Com pulso',    tipo: 'sinusal',   fc: 75,  pulso: true,  padrao: 'sinusal'},
  taqui_sinusal:   {nome: 'Taquicardia sinusal',        grupo: 'Com pulso',    tipo: 'sinusal',   fc: 125, pulso: true,  padrao: 'taqui_sinusal'},
  bradi_sinusal:   {nome: 'Bradicardia sinusal',        grupo: 'Bradicardias', tipo: 'sinusal',   fc: 42,  pulso: true,  padrao: 'brady_sinusal'},
  bav1:            {nome: 'BAV de 1º grau',             grupo: 'Bradicardias', tipo: 'sinusal',   fc: 62,  pulso: true,  padrao: 'bav1', pr: 0.32},
  mobitz1:         {nome: 'BAV 2º grau Mobitz I',       grupo: 'Bradicardias', tipo: 'mobitz1',   fc: 54,  pulso: true,  padrao: 'mobitz1'},
  mobitz2:         {nome: 'BAV 2º grau Mobitz II',      grupo: 'Bradicardias', tipo: 'mobitz2',   fc: 48,  pulso: true,  padrao: 'mobitz2', qrs: 'bloqueio'},
  bavt:            {nome: 'BAV total',                  grupo: 'Bradicardias', tipo: 'bavt',      fc: 34,  pulso: true,  padrao: 'bavt', qrs: 'largo'},
  juncional:       {nome: 'Ritmo juncional',            grupo: 'Bradicardias', tipo: 'juncional', fc: 46,  pulso: true,  padrao: 'juncional'},
  idioventricular: {nome: 'Ritmo idioventricular',      grupo: 'Bradicardias', tipo: 'escape',    fc: 34,  pulso: true,  padrao: null, qrs: 'largo'},
  fa:              {nome: 'Fibrilação atrial',          grupo: 'Taquicardias', tipo: 'fa',        fc: 150, pulso: true,  padrao: 'fa'},
  flutter:         {nome: 'Flutter atrial',             grupo: 'Taquicardias', tipo: 'flutter',   fc: 150, pulso: true,  padrao: 'flutter'},
  tsv:             {nome: 'TSV por reentrada',          grupo: 'Taquicardias', tipo: 'regular',   fc: 180, pulso: true,  padrao: 'tsv'},
  tv:              {nome: 'TV monomórfica com pulso',   grupo: 'Taquicardias', tipo: 'regular',   fc: 170, pulso: true,  padrao: 'tv', qrs: 'tv'},
  fv_grossa:       {nome: 'FV grossa',                  grupo: 'PCR',          tipo: 'fv',        amp: 0.75, pulso: false, chocavel: true},
  fv_fina:         {nome: 'FV fina',                    grupo: 'PCR',          tipo: 'fv',        amp: 0.2,  pulso: false, chocavel: true},
  tvsp:            {nome: 'TV sem pulso',               grupo: 'PCR',          tipo: 'regular',   fc: 185, pulso: false, chocavel: true, qrs: 'tv'},
  torsades:        {nome: 'TV polimórfica (torsades)',  grupo: 'PCR',          tipo: 'torsades',  pulso: false, chocavel: true},
  aesp:            {nome: 'AESP',                       grupo: 'PCR',          tipo: 'sinusal',   fc: 60,  pulso: false, qrs: 'bloqueio'},
  assistolia:      {nome: 'Assistolia',                 grupo: 'PCR',          tipo: 'assistolia', pulso: false}
};

/* Fármacos e doses (AHA 2025, Parte 9). base agrupa doses do mesmo fármaco. */
const FARMACOS = [
  {id: 'epinefrina',       base: 'epinefrina',       nome: 'Epinefrina',               dose: '1 mg IV/IO em bolus',          grupo: 'PCR'},
  {id: 'amiodarona300',    base: 'amiodarona',       nome: 'Amiodarona',               dose: '300 mg IV/IO (1ª dose)',       grupo: 'PCR'},
  {id: 'amiodarona150',    base: 'amiodarona',       nome: 'Amiodarona',               dose: '150 mg IV/IO (2ª dose)',       grupo: 'PCR'},
  {id: 'lidocaina1',       base: 'lidocaina',        nome: 'Lidocaína',                dose: '1–1,5 mg/kg (1ª dose)',        grupo: 'PCR'},
  {id: 'lidocaina2',       base: 'lidocaina',        nome: 'Lidocaína',                dose: '0,5–0,75 mg/kg (2ª dose)',     grupo: 'PCR'},
  {id: 'magnesio',         base: 'magnesio',         nome: 'Sulfato de magnésio',      dose: '1–2 g IV',                     grupo: 'PCR'},
  {id: 'atropina',         base: 'atropina',         nome: 'Atropina',                 dose: '1 mg IV',                      grupo: 'Bradicardia'},
  {id: 'epi_infusao',      base: 'epi_infusao',      nome: 'Epinefrina em infusão',    dose: '2–10 mcg/min',                 grupo: 'Bradicardia'},
  {id: 'dopamina',         base: 'dopamina',         nome: 'Dopamina em infusão',      dose: '5–20 mcg/kg/min',              grupo: 'Bradicardia'},
  {id: 'adenosina6',       base: 'adenosina',        nome: 'Adenosina',                dose: '6 mg IV rápido + flush',       grupo: 'Taquicardia'},
  {id: 'adenosina12',      base: 'adenosina',        nome: 'Adenosina',                dose: '12 mg IV rápido + flush',      grupo: 'Taquicardia'},
  {id: 'amiodarona_pulso', base: 'amiodarona_pulso', nome: 'Amiodarona (com pulso)',   dose: '150 mg IV em 10 min',          grupo: 'Taquicardia'},
  {id: 'cristaloide',      base: 'cristaloide',      nome: 'Cristaloide',              dose: '1 L em bolus',                 grupo: 'Outros'},
  {id: 'hemacias',         base: 'hemacias',         nome: 'Concentrado de hemácias',  dose: '1 unidade',                    grupo: 'Outros'}
];
const FARM = Object.fromEntries(FARMACOS.map(f => [f.id, f]));

const ACOES = [
  {id: 'vagal',     nome: 'Manobra vagal',            desc: 'Valsalva modificada'},
  {id: 'via_aerea', nome: 'Via aérea avançada',       desc: 'Tubo ou dispositivo supraglótico; capnografia contínua'},
  {id: 'acesso_iv', nome: 'Acesso IV',                desc: 'Via preferencial'},
  {id: 'acesso_io', nome: 'Acesso IO',                desc: 'Se IV não for obtido'},
  {id: 'cabos',     nome: 'Conferir cabos e ganho',   desc: 'Confirma linha reta em mais de uma derivação'}
];

/* --------------------------------------------------------------------------
   Gerador de ECG: soma de gaussianas agendadas + atividade de fundo.
   -------------------------------------------------------------------------- */
const TPL = {
  p:          [[0, 0.022, 0.13]],
  estreito:   [[0.012, 0.007, -0.10], [0.036, 0.009, 1.25], [0.060, 0.009, -0.28]],
  bloqueio:   [[0.015, 0.010, -0.08], [0.045, 0.013, 0.95], [0.080, 0.012, -0.40], [0.110, 0.013, 0.30]],
  largo:      [[0.050, 0.028, 1.30], [0.120, 0.026, -0.50]],
  tv:         [[0.060, 0.036, 1.25], [0.165, 0.042, -0.90]],
  estimulado: [[0.050, 0.030, -1.15], [0.120, 0.030, -0.35]]
};
function ondaT(rr, qrs){
  const qt = Math.min(0.48, 0.39 * Math.sqrt(Math.max(0.3, rr)));
  if (qrs === 'estreito')   return [[qt - 0.085, 0.045, 0.30]];
  if (qrs === 'bloqueio')   return [[qt - 0.06, 0.05, -0.18]];
  if (qrs === 'largo')      return [[qt + 0.02, 0.065, -0.45]];
  if (qrs === 'estimulado') return [[qt + 0.02, 0.065, 0.45]];
  return [];
}

function Gerador(){ this.comps = []; this.pendV = []; this.reiniciar(0); }
Gerador.prototype.reiniciar = function(t){
  this.tA = t + 0.25; this.tV = t + 0.45; this.ciclo = 0;
  this.comps = this.comps.filter(k => k.c < t + 0.01);
  this.pendV = this.pendV.filter(v => v.t <= t + 0.01);
};
Gerador.prototype.add = function(t0, tpl, ganho){
  const g = ganho || 1;
  for (const k of tpl) this.comps.push({c: t0 + k[0], w: k[1], a: k[2] * g});
};
Gerador.prototype.inserirV = function(ev){
  let i = this.pendV.length;
  while (i > 0 && this.pendV[i - 1].t > ev.t) i--;
  this.pendV.splice(i, 0, ev);
};
Gerador.prototype.complexo = function(t0, qrs, rr){
  this.add(t0, TPL[qrs] || TPL.estreito);
  this.add(t0, ondaT(rr, qrs));
  this.inserirV({t: t0 + 0.035, marcapasso: false});
};
Gerador.prototype.agendar = function(ate, P){
  const r = RITMOS[P.ritmo], fc = Math.max(10, P.fc || r.fc || 60);
  const qrs = P.qrs || r.qrs || 'estreito';
  switch (r.tipo){
    case 'sinusal':
      while (this.tA < ate){
        const rr = 60 / fc * (1 + (R() - 0.5) * 0.04);
        this.add(this.tA, TPL.p);
        this.complexo(this.tA + (P.pr || r.pr || 0.16), qrs, rr);
        this.tA += rr;
      }
      break;
    case 'mobitz1': {
      const rr = 60 / (fc * 4 / 3), prs = [0.16, 0.26, 0.32, null];
      while (this.tA < ate){
        this.add(this.tA, TPL.p);
        const pr = prs[this.ciclo % 4];
        if (pr !== null) this.complexo(this.tA + pr, qrs, rr * 1.33);
        this.ciclo++; this.tA += rr;
      }
      break;
    }
    case 'mobitz2': {
      const rr = 60 / (fc * 1.5), prs = [0.18, 0.18, null];
      while (this.tA < ate){
        this.add(this.tA, TPL.p);
        const pr = prs[this.ciclo % 3];
        if (pr !== null) this.complexo(this.tA + pr, qrs, rr * 1.5);
        this.ciclo++; this.tA += rr;
      }
      break;
    }
    case 'bavt':
      while (this.tA < ate){ this.add(this.tA, TPL.p); this.tA += 60 / 80 * (1 + (R() - 0.5) * 0.03); }
      while (this.tV < ate){ const rr = 60 / fc; this.complexo(this.tV, qrs, rr); this.tV += rr * (1 + (R() - 0.5) * 0.03); }
      break;
    case 'juncional':
      while (this.tV < ate){ const rr = 60 / fc; this.complexo(this.tV, qrs, rr); this.add(this.tV + 0.10, [[0, 0.02, -0.08]]); this.tV += rr; }
      break;
    case 'escape': case 'regular':
      while (this.tV < ate){ const rr = 60 / fc * (1 + (R() - 0.5) * 0.01); this.complexo(this.tV, qrs, rr); this.tV += rr; }
      break;
    case 'fa':
      while (this.tV < ate){ const rr = 60 / fc * (0.65 + R() * 0.7); this.complexo(this.tV, qrs, rr); this.tV += rr; }
      break;
    case 'flutter': {
      const k = Math.max(2, Math.min(4, Math.round(300 / fc)));
      while (this.tV < ate){ this.complexo(this.tV, qrs, 0.2 * k); this.tV += 0.2 * k; }
      break;
    }
    default: break;   /* fv, torsades, assistolia: só atividade de fundo */
  }
};
Gerador.prototype.fundo = function(t, P){
  const r = RITMOS[P.ritmo];
  switch (r.tipo){
    case 'fa':
      return 0.045 * (Math.sin(2 * Math.PI * 6.1 * t + 0.8 * Math.sin(0.9 * t)) + 0.7 * Math.sin(2 * Math.PI * 7.7 * t + 1.3 + Math.sin(0.6 * t)));
    case 'flutter': {
      const u = (t * 5) % 1;
      return 0.12 + 0.26 * (u < 0.78 ? -u / 0.78 : -(1 - (u - 0.78) / 0.22));
    }
    case 'fv': {
      const env = 0.75 + 0.25 * Math.sin(2 * Math.PI * 0.23 * t) * Math.sin(0.71 * t);
      return r.amp * env * (0.6 * Math.sin(2 * Math.PI * 4.6 * t + 2 * Math.sin(0.7 * t)) + 0.3 * Math.sin(2 * Math.PI * 6.3 * t + 1.1) + 0.15 * Math.sin(2 * Math.PI * 8.1 * t + Math.sin(1.3 * t)));
    }
    case 'torsades': {
      const amp = 0.25 + 1.1 * Math.abs(Math.sin(Math.PI * 0.22 * t));
      return amp * Math.sin(2 * Math.PI * 4.2 * t + 1.5 * Math.sin(0.5 * t));
    }
    default: return 0;
  }
};
Gerador.prototype.valor = function(t, P){
  let v = this.fundo(t, P);
  const cs = this.comps;
  for (let k = 0; k < cs.length; k++){
    const c = cs[k], d = t - c.c;
    if (d > -4 * c.w && d < 4 * c.w) v += gauss(t, c.c, c.w, c.a);
  }
  if (cs.length > 80 || (cs.length && (t * SFS) % 50 < 1)) this.comps = cs.filter(c => c.c + 4 * c.w > t);
  return v;
};

/* --------------------------------------------------------------------------
   Som (Web Audio). Só toca depois de um gesto do usuário.
   -------------------------------------------------------------------------- */
const Som = {
  ctx: null, ligado: false,
  garantir(){
    if (!this.ctx){ const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; this.ctx = new AC(); }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  tom(f, dur, vol, tipo, f2){
    if (!this.ligado) return;
    const c = this.garantir(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime;
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.linearRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    g.gain.setValueAtTime(vol, t0 + Math.max(0.01, dur - 0.04));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  },
  bip(spo2){ this.tom(520 + (Math.max(80, Math.min(100, spo2 || 95)) - 80) * 14, 0.08, 0.10); },
  alarme(){ [0, 0.2, 0.4].forEach(d => setTimeout(() => this.tom(880, 0.14, 0.12, 'square'), d * 1000)); },
  carga(){ this.tom(380, 3, 0.07, 'sine', 980); },
  pronto(){ this.tom(1040, 0.12, 0.08, 'square'); },
  choque(){ this.tom(90, 0.35, 0.3, 'sawtooth', 40); }
};

/* --------------------------------------------------------------------------
   Canal em varredura (como num monitor): fundo fixo + traço com barra de apagar.
   -------------------------------------------------------------------------- */
function Canal(el, cfg){
  this.el = el; this.cfg = cfg;
  this.bg = el.querySelector('canvas.bg'); this.fg = el.querySelector('canvas.fg');
  this.N = Math.round(cfg.segundos * SFS);
  this.novos = []; this.marcas = [];
  this.hist = new Float32Array(SFS * 4).fill(NaN); this.hi = 0;
  this.medir();
}
Canal.prototype.medir = function(){
  const r = this.el.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  this.W = Math.max(60, r.width); this.H = Math.max(30, r.height); this.dpr = dpr;
  for (const c of [this.bg, this.fg]){ c.width = Math.round(this.W * dpr); c.height = Math.round(this.H * dpr); }
  this.ctx = this.fg.getContext('2d'); this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  this.ultX = null; this.ultY = null;
  this.desenharFundo();
};
Canal.prototype.y = function(v){
  const f = (v - this.cfg.min) / (this.cfg.max - this.cfg.min);
  return Math.max(1.5, Math.min(this.H - 1.5, this.H - f * this.H));
};
Canal.prototype.desenharFundo = function(){
  const c = this.bg.getContext('2d'), W = this.W, H = this.H;
  c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); c.clearRect(0, 0, W, H);
  if (this.cfg.grade){
    const pxs = W / this.cfg.segundos, pmv = H / (this.cfg.max - this.cfg.min);
    const linhas = (passoX, passoY, cor) => {
      c.strokeStyle = cor; c.lineWidth = 1; c.beginPath();
      for (let x = 0; x <= W; x += passoX){ c.moveTo(Math.round(x) + 0.5, 0); c.lineTo(Math.round(x) + 0.5, H); }
      for (let y = H - (0 - this.cfg.min) * pmv; y > 0; y -= passoY){ c.moveTo(0, Math.round(y) + 0.5); c.lineTo(W, Math.round(y) + 0.5); }
      for (let y = H - (0 - this.cfg.min) * pmv + passoY; y < H; y += passoY){ c.moveTo(0, Math.round(y) + 0.5); c.lineTo(W, Math.round(y) + 0.5); }
      c.stroke();
    };
    if (pxs * 0.04 >= 4) linhas(pxs * 0.04, pmv * 0.1, 'rgba(120,190,150,0.07)');
    linhas(pxs * 0.2, pmv * 0.5, 'rgba(120,190,150,0.16)');
  }
  c.font = '11px ui-sans-serif,system-ui,sans-serif'; c.textBaseline = 'middle'; c.textAlign = 'right';
  for (const L of (this.cfg.linhas || [])){
    const y = Math.round(this.y(L)) + 0.5;
    c.strokeStyle = 'rgba(160,175,195,0.22)'; c.setLineDash([4, 5]); c.beginPath(); c.moveTo(0, y); c.lineTo(W - 30, y); c.stroke(); c.setLineDash([]);
    c.fillStyle = 'rgba(160,175,195,0.6)'; c.fillText(String(L), W - 5, Math.max(7, Math.min(H - 7, y)));
  }
};
Canal.prototype.push = function(v){ this.novos.push(v); this.hist[this.hi++ % this.hist.length] = v; };
Canal.prototype.marcar = function(){ this.marcas.push(this.novos.length); };
Canal.prototype.limpar = function(){ this.ctx.clearRect(0, 0, this.W, this.H); this.ultX = null; this.novos.length = 0; this.marcas.length = 0; this.hist.fill(NaN); };
Canal.prototype.faixa = function(){
  let mx = -Infinity, mn = Infinity;
  for (const v of this.hist) if (!Number.isNaN(v)){ if (v > mx) mx = v; if (v < mn) mn = v; }
  return mx === -Infinity ? null : {max: mx, min: mn};
};
Canal.prototype.desenhar = function(i0){
  const n = this.novos.length; if (!n) return;
  const ctx = this.ctx, W = this.W, H = this.H, N = this.N;
  const xDe = i => ((i % N) / N) * W;
  const xa = xDe(i0), xb = xDe(i0 + n - 1) + W * 0.025;
  if (xb <= W) ctx.clearRect(xa, 0, xb - xa, H);
  else { ctx.clearRect(xa, 0, W - xa, H); ctx.clearRect(0, 0, xb - W, H); }
  ctx.strokeStyle = this.cfg.cor; ctx.lineWidth = this.cfg.espessura || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath();
  let px = this.ultX, py = this.ultY;
  for (let k = 0; k < n; k++){
    const v = this.novos[k], x = xDe(i0 + k);
    if (v === null || Number.isNaN(v)){ px = null; continue; }
    const y = this.y(v);
    if (px === null || x < px) ctx.moveTo(x, y); else { ctx.moveTo(px, py); ctx.lineTo(x, y); }
    px = x; py = y;
  }
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  for (const k of this.marcas){
    const x = xDe(i0 + k);
    ctx.beginPath(); ctx.moveTo(x - 5, 4); ctx.lineTo(x + 5, 4); ctx.lineTo(x, 11); ctx.closePath(); ctx.fill();
  }
  this.ultX = px; this.ultY = py; this.novos.length = 0; this.marcas.length = 0;
};

/* --------------------------------------------------------------------------
   Estado da simulação
   -------------------------------------------------------------------------- */
const PADRAO_PACIENTE = {ritmo: 'sinusal', fc: 75, pas: 122, pad: 78, spo2: 98, etco2: 37, fr: 14, pulso: true, limiarMa: 60, qrs: null, pr: null, padrao12: null};
let P, sim, gen, art, pleth, cpr, resp, mp, desf, pni, M, log, cen, cenEstado, tEstado, contEstado, disparadas, dadas, ultimaEpi, alarmeSilencioAte, ultimoAlarmeSom, ultimoV, qrsT, ultimoPerf, epAtual, tend, sessao;
let remoto = null;   /* SimRemoto.Anfitriao quando o controle remoto está ligado */
const canais = {};

function reiniciarTudo(){
  P = Object.assign({}, PADRAO_PACIENTE);
  sim = {rodando: false, t: 0, i: 0, linhaArterial: true, qualidadeRcp: 'boa', ultimoQuadro: null, proxTempo: 1, proxAlarme: 0};
  gen = new Gerador();
  art = {b1: -99, b0: -99}; pleth = {b1: -99, b0: -99};
  cpr = {on: false, prox: 0, tc: -99, inicioCiclo: 0, avisado: false};
  resp = {tb: -99, prox: 0, E: P.etco2, Eb: P.etco2, te: 2, periodo: 4};
  mp = {on: false, fc: 70, ma: 0, pausa: false, ultimaEsp: -99, ultimoCapt: -99, capturando: false};
  desf = {j: 150, sinc: false, estado: 'ocioso', tCarga: 0, tPronto: 0, aguardandoR: false, tAguardo: 0, proxBip: 0};
  pni = {estado: 'ocioso', t: 0, sis: null, dia: null, hora: null};
  M = {episodios: [], mpNaPcr: false, rcpComPulso: 0, ecg12: [], pulsos: [], capturas: []};
  log = []; cen = null; cenEstado = null; tEstado = 0; contEstado = {}; disparadas = new Set(); dadas = new Set();
  ultimaEpi = null; alarmeSilencioAte = 0; ultimoAlarmeSom = 0;
  ultimoV = -99; qrsT = []; ultimoPerf = -99; epAtual = null; tend = {}; sessao = Date.now();
  for (const k in canais) canais[k].limpar();
  const ul = $('#log'); if (ul) ul.innerHTML = '';
  const al = $('#alarme'); if (al) al.hidden = true;
  if ($('#nPNI')) atualizarPni();
}

/* ---------- registro ---------- */
function registrar(tipo, texto, extra){
  const e = Object.assign({t: sim.t, tipo, texto, ritmo: P.ritmo, pulso: P.pulso}, extra || {});
  log.push(e);
  const ul = $('#log');
  if (ul){
    const li = document.createElement('li'); li.className = 'lg-' + tipo;
    li.innerHTML = '<time>' + mmss(e.t) + '</time> ';
    li.appendChild(document.createTextNode(texto));
    ul.appendChild(li); ul.scrollTop = ul.scrollHeight;
  }
  if (remoto) remoto.enviar({tipo: 'log', e});
  return e;
}
let toastTimer;
function toast(txt, tipo){
  const el = $('#toast'); el.textContent = txt; el.className = 'on ' + (tipo || '');
  if (remoto) remoto.enviar({tipo: 'toast', texto: txt, nivel: tipo || ''});
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.className = ''; }, 4200);
}

/* ---------- cenário ---------- */
function aplicarRitmo(id, origem){
  const r = RITMOS[id]; P.ritmo = id;
  P.fc = r.fc || P.fc; delete tend.fc; P.pulso = r.pulso; P.qrs = null; P.pr = null;
  gen.reiniciar(sim.t);
  if (origem) registrar('instrutor', origem + ': ritmo → ' + r.nome);
  sincronizarPainel();
}
function aplicarEstado(nome){
  const st = cen && cen.estados[nome]; if (!st) return;
  const r = RITMOS[st.ritmo];
  P.ritmo = st.ritmo; P.fc = st.fc || r.fc || P.fc;
  P.pulso = st.pulso !== undefined ? st.pulso : r.pulso;
  for (const k of ['pas', 'pad', 'spo2', 'etco2', 'fr', 'limiarMa']) if (st[k] !== undefined){ P[k] = st[k]; delete tend[k]; }
  delete tend.fc;
  P.qrs = st.qrs || null; P.pr = st.pr || null; P.padrao12 = st.padrao12 || null;
  cenEstado = nome; tEstado = sim.t; contEstado = {}; disparadas = new Set();
  gen.reiniciar(sim.t);
  registrar('cenario', 'Estado: ' + nome + ' — ' + r.nome + (st.desc ? '. ' + st.desc : ''));
  sincronizarPainel();
}
function carregarCenario(id){
  reiniciarTudo();
  cen = CENARIOS_ACLS.find(c => c.id === id) || null;
  if (cen) aplicarEstado(cen.inicial);
  else registrar('sistema', 'Modo livre: o instrutor define ritmo e respostas.');
  montarEstados(); sincronizarPainel(); atualizarControles(); atualizarRelogio();
  const sc = $('#selCenario'); if (sc) sc.value = cen ? cen.id : '';
  if (remoto){ remoto.enviar({tipo: 'log', todos: log}); enviarEstado(); }
}
function eventoCenario(ev){
  if (!cen || !cenEstado || !cen.estados[cenEstado]) return false;
  const chave = ev.tipo + (ev.droga ? ':' + ev.droga.base : ev.acao ? ':' + ev.acao : '');
  if (ev.tipo !== 'tempo') contEstado[chave] = (contEstado[chave] || 0) + 1;
  const regras = cen.regras || [];
  for (let i = 0; i < regras.length; i++){
    const r = regras[i];
    if (r.em !== ev.tipo) continue;
    if (r.estado && ![].concat(r.estado).includes(cenEstado)) continue;
    if (r.droga && !r.droga.split('|').some(d => d === ev.droga.id || d === ev.droga.base)) continue;
    if (r.acao && r.acao !== ev.acao) continue;
    if (r.minJ && !(ev.j >= r.minJ)) continue;
    if (r.n && (contEstado[chave] || 0) < r.n) continue;
    if (r.apos && (sim.t - tEstado) < r.apos) continue;
    if (r.requer && !r.requer.every(q => q.split('|').some(d => dadas.has(d)))) continue;
    if (ev.tipo === 'tempo'){ if (disparadas.has(i)) continue; disparadas.add(i); }
    if (r.msg) registrar('cenario', r.msg);
    if (r.ir) aplicarEstado(r.ir);
    return true;
  }
  return false;
}

/* ---------- respostas padrão (sem regra de cenário) ---------- */
function respostaPadrao(tipo, ctx){
  const r = RITMOS[ctx.ritmoAntes];
  if (tipo === 'choque'){
    if (cenEstado === '__fv_induzida' && r.chocavel){
      P.ritmo = 'sinusal'; P.fc = 92; P.pulso = true; P.pas = 100; P.pad = 62; P.qrs = null; P.pr = null;
      cenEstado = null; gen.reiniciar(sim.t);
      registrar('cenario', 'Desfibrilação: RCE para ritmo sinusal.'); sincronizarPainel();
    } else if (r.chocavel) registrar('sistema', 'Ritmo persiste após o choque: ' + r.nome + '.');
    else if (ctx.pulso){
      P.ritmo = 'fv_grossa'; P.pulso = false; P.qrs = null; gen.reiniciar(sim.t);
      if (cen) cenEstado = '__fv_induzida';
      registrar('alerta', 'Choque não sincronizado em ritmo organizado com pulso desencadeou FV.');
      sincronizarPainel();
    } else registrar('sistema', 'Choque sem efeito: ritmo não chocável.');
  } else registrar('sistema', 'Sem alteração do ritmo após a cardioversão' + (cen ? '.' : ' (modo livre: o instrutor define a resposta).'));
}

/* --------------------------------------------------------------------------
   Geração amostra a amostra
   -------------------------------------------------------------------------- */
function pkArt(dt){ if (dt < 0) return 0; if (dt < 0.09) return 0.5 - 0.5 * Math.cos(Math.PI * dt / 0.09); return Math.exp(-(dt - 0.09) / 0.2) + gauss(dt, 0.30, 0.025, 0.08); }
function pkCpr(dt){ if (dt < 0) return 0; if (dt < 0.12) return Math.sin(Math.PI / 2 * dt / 0.12); return Math.exp(-(dt - 0.12) / 0.12); }
function pkPl(dt){ if (dt < 0) return 0; if (dt < 0.15) return 0.5 - 0.5 * Math.cos(Math.PI * dt / 0.15); return Math.exp(-(dt - 0.15) / 0.32) + gauss(dt, 0.42, 0.04, 0.06); }
function rcpBoa(){ return sim.qualidadeRcp === 'boa'; }

function processarV(ev){
  if (!ev.marcapasso && ev.t - ultimoV < 0.22) return;
  ultimoV = ev.t; qrsT.push(ev.t); if (qrsT.length > 12) qrsT.shift();
  if (ev.marcapasso) mp.ultimoCapt = ev.t;
  if (P.pulso){
    art.b0 = art.b1; art.b1 = ev.t;
    pleth.b0 = pleth.b1; pleth.b1 = ev.t + 0.22;
    ultimoPerf = ev.t; Som.bip(P.spo2);
  }
  if (desf.sinc) canais.ecg.marcar();
  if (desf.aguardandoR) entregarChoque(true);
}
function marcapassoAmostra(t){
  if (!mp.on || mp.pausa) return;
  const iv = 60 / mp.fc;
  if (t - ultimoV < iv || t - mp.ultimaEsp < iv) return;
  mp.ultimaEsp = t;
  gen.add(t, [[0.002, 0.003, 3.2]]);
  if (!P.pulso) M.mpNaPcr = true;
  if (mp.ma >= P.limiarMa && P.pulso){
    gen.add(t + 0.008, TPL.estimulado); gen.add(t + 0.008, ondaT(iv, 'estimulado'));
    ultimoV = t;
    gen.inserirV({t: t + 0.04, marcapasso: true});
    const escape = RITMOS[P.ritmo].tipo !== 'sinusal';
    if (escape) gen.tV = Math.max(gen.tV, t + 60 / Math.max(10, P.fc));
  }
}
function rcpAmostra(t){
  if (!cpr.on || t < cpr.prox) return;
  cpr.tc = t;
  const q = rcpBoa() ? 1 : 0.55;
  gen.add(t, [[0.05, 0.05, 0.9 * q], [0.2, 0.07, -0.35 * q]]);
  cpr.prox = t + 60 / 110 * (1 + (R() - 0.5) * 0.06);
}
function taxaResp(){ return P.pulso ? P.fr : (cpr.on ? 10 : 0); }
function respAmostra(t){
  const fr = taxaResp();
  if (fr <= 0){ resp.prox = t; return; }
  if (t >= resp.prox){ resp.tb = t; resp.periodo = 60 / fr; resp.te = Math.min(3, 0.55 * resp.periodo); resp.Eb = resp.E; resp.prox = t + resp.periodo; }
}
function artValor(t){
  if (!sim.linhaArterial) return NaN;
  const dt1 = t - art.b1, dt0 = t - art.b0;
  const dia = 12 + (P.pad - 12) * Math.exp(-Math.max(0, dt1 - 0.9) / 1.1);
  let v = dia + (P.pas - P.pad) * Math.max(pkArt(dt1), pkArt(dt0));
  const dc = t - cpr.tc;
  if (dc < 3){
    const cs = rcpBoa() ? 82 : 45, cd = rcpBoa() ? 28 : 13;
    const base = 12 + (cd - 12) * Math.exp(-Math.max(0, dc - 0.55) / 0.9);
    v = Math.max(v, base + (cs - cd) * pkCpr(dc));
  }
  return v + (R() - 0.5) * 0.8;
}
function plethValor(t){
  const amp = Math.max(0.15, Math.min(1, (P.pas - 40) / 80));
  let v = 0.08 + amp * Math.max(pkPl(t - pleth.b1), pkPl(t - pleth.b0));
  const dc = t - cpr.tc; if (dc < 1) v += 0.18 * pkCpr(dc);
  return v + (R() - 0.5) * 0.01;
}
function co2Valor(t){
  const dt = t - resp.tb, E = resp.Eb;
  let v = 0;
  if (dt >= 0 && dt < resp.te){
    v = dt < 0.25 ? E * 0.95 * Math.pow(dt / 0.25, 0.7) : E * (0.95 + 0.05 * (dt - 0.25) / Math.max(0.1, resp.te - 0.25));
  } else if (dt >= resp.te && dt < resp.te + 0.25) v = E * (1 - (dt - resp.te) / 0.25);
  return v > 0.5 ? v + (R() - 0.5) * 0.3 : 0;
}
function ecgValor(t){
  let v = gen.valor(t, P);
  v += Math.sin(t * 1.1) * 0.03 + Math.sin(t * 0.37 + 1) * 0.02 + (R() - 0.5) * 0.02;
  return v;
}
function gerarAte(tFim){
  gen.agendar(tFim + 0.6, P);
  while (sim.i * DT <= tFim){
    const t = sim.i * DT;
    while (gen.pendV.length && gen.pendV[0].t <= t) processarV(gen.pendV.shift());
    marcapassoAmostra(t); rcpAmostra(t); respAmostra(t);
    canais.ecg.push(ecgValor(t)); canais.art.push(artValor(t)); canais.pleth.push(plethValor(t)); canais.co2.push(co2Valor(t));
    sim.i++;
  }
}

/* --------------------------------------------------------------------------
   Desfibrilador
   -------------------------------------------------------------------------- */
const ENERGIAS = [1, 2, 3, 5, 7, 10, 15, 20, 30, 50, 70, 85, 100, 120, 150, 170, 200, 300, 360];
function entregarChoque(sinc){
  desf.aguardandoR = false;
  const r = RITMOS[P.ritmo];
  const ctx = {j: desf.j, sinc, chocavel: !!r.chocavel, pulso: P.pulso, ritmoAntes: P.ritmo, ep: epAtual ? M.episodios.indexOf(epAtual) : -1};
  registrar('choque', (sinc ? 'Cardioversão sincronizada ' : 'Desfibrilação ') + desf.j + ' J (ritmo: ' + r.nome + ')', ctx);
  if (epAtual) epAtual.choques.push({t: sim.t, j: desf.j, chocavel: !!r.chocavel});
  desf.estado = 'ocioso'; Som.choque();
  if (desf.sinc){ desf.sinc = false; toast('SINC desligado após o choque. Religue antes de nova cardioversão.'); }
  const tratado = eventoCenario({tipo: sinc ? 'cardioversao' : 'choque', j: ctx.j});
  if (!tratado) respostaPadrao(sinc ? 'cardioversao' : 'choque', ctx);
  gen.add(sim.t, [[0.004, 0.004, 4], [0.07, 0.10, -1.4], [0.45, 0.28, 0.5]]);
  atualizarControles();
}
function apertarChoque(){
  if (!sim.rodando){ toast('Inicie a simulação no painel do instrutor.'); return; }
  if (desf.estado !== 'pronto'){ toast('Carregue o desfibrilador antes do choque.'); return; }
  if (cpr.on){ toast('Afaste-se! Pare as compressões antes do choque.', 'erro'); registrar('alerta', 'Tentativa de choque com compressões em andamento.', {seguranca: true}); return; }
  if (desf.sinc){ desf.aguardandoR = true; desf.tAguardo = sim.t; toast('Sincronizando com a onda R…'); }
  else entregarChoque(false);
}

/* --------------------------------------------------------------------------
   Ações do aluno
   -------------------------------------------------------------------------- */
function administrar(id){
  const f = FARM[id], r = RITMOS[P.ritmo];
  const ctx = {droga: f.id, base: f.base, chocavel: !!r.chocavel, choques: epAtual ? epAtual.choques.length : 0, ep: epAtual ? M.episodios.indexOf(epAtual) : -1};
  registrar('droga', f.nome + ' ' + f.dose, ctx);
  dadas.add(f.id); dadas.add(f.base);
  if (f.id === 'epinefrina'){ ultimaEpi = sim.t; if (epAtual) epAtual.epi.push({t: sim.t, choques: ctx.choques, chocavel: ctx.chocavel}); }
  eventoCenario({tipo: 'droga', droga: {id: f.id, base: f.base}});
  toast(f.nome + ' ' + f.dose + ' administrada.');
}
function executarAcao(id){
  const a = ACOES.find(x => x.id === id);
  registrar('acao', a.nome, {acao: id});
  if (id === 'cabos') toast(P.ritmo === 'assistolia' ? 'Cabos conectados, ganho aumentado: linha reta confirmada em mais de uma derivação.' : 'Cabos e ganho conferidos.');
  else toast(a.nome + ': feito.');
  eventoCenario({tipo: 'acao', acao: id});
}
function checarPulso(){
  if (!sim.rodando){ toast('Inicie a simulação no painel do instrutor.'); return; }
  if (cpr.on){ toast('Pause as compressões para checar o pulso.'); return; }
  M.pulsos.push({t: sim.t, pulso: P.pulso, capturando: mp.capturando});
  let txt;
  if (!P.pulso) txt = 'Sem pulso central.';
  else if (mp.capturando) txt = 'Pulso femoral presente, sincrônico ao marcapasso: captura mecânica confirmada.';
  else { const fc = fcMedida(); txt = 'Pulso central presente' + (fc ? ', cerca de ' + fc + ' bpm.' : '.'); }
  registrar('acao', 'Checagem de pulso: ' + txt, {acao: 'pulso'});
  toast(txt, P.pulso ? '' : 'erro');
}
function medirPni(){
  if (!sim.rodando){ toast('Inicie a simulação no painel do instrutor.'); return; }
  if (pni.estado === 'medindo') return;
  pni.estado = 'medindo'; pni.t = sim.t; atualizarPni();
}
function abrirEcg12(){
  if (!sim.rodando){ toast('Inicie a simulação no painel do instrutor.'); return; }
  if (!P.pulso){ toast('Na PCR, priorize RCP e análise do ritmo. ECG de 12 derivações após o RCE.'); return; }
  const id = P.padrao12 || RITMOS[P.ritmo].padrao;
  const p = (typeof PADROES !== 'undefined') ? PADROES.find(x => x.id === id) : null;
  registrar('acao', 'ECG de 12 derivações' + (p ? ' (' + p.nome + ')' : ''), {acao: 'ecg12'});
  M.ecg12.push({t: sim.t, pulso: P.pulso});
  if (!p || typeof renderECG !== 'function'){ toast('Traçado de 12 derivações indisponível para este ritmo.'); return; }
  const d = $('#d12'); d.showModal();
  const box = $('#ecg12box'), cv = $('#ecg12');
  const spec = p.build();
  const mm = ecgTotalMm(spec, {layout: 'grid12'});
  const px = Math.max(1.6, (box.clientWidth - 4) / mm);
  renderECG(cv, spec, {layout: 'grid12', leads: LEAD_ORDER.slice(0, 12), rhythmLead: 'DII', pxPerMm: px, rowMm: 28});
}
function alternarRcp(){
  if (!sim.rodando){ toast('Inicie a simulação no painel do instrutor.'); return; }
  if (!cpr.on){
    cpr.on = true; cpr.prox = sim.t; cpr.inicioCiclo = sim.t; cpr.avisado = false;
    registrar('rcp', 'RCP iniciada');
    if (P.pulso){ M.rcpComPulso++; registrar('alerta', 'RCP iniciada em paciente com pulso.'); }
  } else {
    cpr.on = false;
    registrar('rcp', 'RCP pausada após ' + mmss(sim.t - cpr.inicioCiclo));
  }
  atualizarControles();
}

/* --------------------------------------------------------------------------
   Medidas e alarmes
   -------------------------------------------------------------------------- */
function fcMedida(){
  const ts = qrsT.filter(x => x > sim.t - 6);
  if (ts.length < 2 || sim.t - ts[ts.length - 1] > 3) return null;
  const u = ts.slice(-6);
  return Math.round(60 * (u.length - 1) / (u[u.length - 1] - u[0]));
}
function spo2Exibida(){ return (!cpr.on && sim.t - ultimoPerf < 6) ? P.spo2 : null; }
function avaliarAlarmes(){
  const msgs = [], r = RITMOS[P.ritmo], fc = fcMedida();
  if (r.tipo === 'fv' || r.tipo === 'torsades') msgs.push('FV/TV');
  else if (fc === null) msgs.push('ASSISTOLIA');
  else if (fc > 150 && (r.qrs === 'tv' || P.qrs === 'tv')) msgs.push('TV');
  else if (fc < 40) msgs.push('FC BAIXA');
  else if (fc > 150) msgs.push('FC ALTA');
  const fx = canais.art.faixa();
  if (sim.linhaArterial && fx && fx.max < 85) msgs.push('PA BAIXA');
  const s = spo2Exibida(); if (s !== null && s < 90) msgs.push('SpO₂ BAIXA');
  const el = $('#alarme');
  el.textContent = msgs.join(' · '); el.hidden = !msgs.length;
  const silencio = performance.now() < alarmeSilencioAte;
  el.classList.toggle('silenciado', silencio);
  if (msgs.length && !silencio && performance.now() - ultimoAlarmeSom > 4000){ ultimoAlarmeSom = performance.now(); Som.alarme(); }
}

/* --------------------------------------------------------------------------
   Quadro: tempo, métricas, desenho
   -------------------------------------------------------------------------- */
function atualizarEpisodio(dt){
  if (!P.pulso && !epAtual){
    epAtual = {ini: sim.t, ritmoIni: P.ritmo, chocavelIni: !!RITMOS[P.ritmo].chocavel, tempo: 0, rcp: 0, pausa: 0, pausas: [], primeiraRcp: cpr.on ? sim.t : null, choques: [], epi: [], fim: null};
    M.episodios.push(epAtual);
    registrar('sistema', 'PCR: ' + RITMOS[P.ritmo].nome + '.');
  } else if (P.pulso && epAtual){
    if (epAtual.pausa > 0) epAtual.pausas.push(epAtual.pausa);
    epAtual.fim = sim.t; epAtual = null;
    registrar('sistema', 'RCE: pulso presente.');
  }
  if (!epAtual) return;
  epAtual.tempo += dt;
  if (cpr.on){
    epAtual.rcp += dt;
    if (epAtual.primeiraRcp === null) epAtual.primeiraRcp = sim.t;
    if (epAtual.pausa > 0){ epAtual.pausas.push(epAtual.pausa); epAtual.pausa = 0; }
  } else if (epAtual.primeiraRcp !== null) epAtual.pausa += dt;
}
function passo(dt){
  sim.t += dt;
  for (const k in tend){
    const x = tend[k], f = Math.min(1, (sim.t - x.t0) / x.dur);
    P[k] = x.de + (x.para - x.de) * f;
    if (f >= 1){ P[k] = x.para; delete tend[k]; }
  }
  gerarAte(sim.t);
  atualizarEpisodio(dt);
  /* EtCO2 tende ao alvo; sobe rápido no RCE */
  const alvo = P.pulso ? P.etco2 : (cpr.on ? (rcpBoa() ? 18 : 9) : 2);
  const tau = alvo > resp.E + 10 ? 2.5 : 6;
  resp.E += (alvo - resp.E) * Math.min(1, dt / tau);
  /* desfibrilador */
  if (desf.estado === 'carregando' && sim.t - desf.tCarga >= 3){ desf.estado = 'pronto'; desf.tPronto = sim.t; desf.proxBip = 0; atualizarControles(); }
  if (desf.estado === 'pronto'){
    if (sim.t >= desf.proxBip){ Som.pronto(); desf.proxBip = sim.t + 0.7; }
    if (sim.t - desf.tPronto > 60){ desf.estado = 'ocioso'; toast('Desfibrilador desarmado automaticamente após 60 s.'); atualizarControles(); }
  }
  if (desf.aguardandoR && sim.t - desf.tAguardo > 2.5){
    desf.aguardandoR = false;
    registrar('alerta', 'Choque sincronizado não liberado: sem onda R detectada (' + RITMOS[P.ritmo].nome + ').');
    toast('Sem onda R detectada: o choque sincronizado não foi liberado. Na FV/TV polimórfica, desligue o SINC.', 'erro');
  }
  /* marcapasso: captura */
  const capt = mp.on && !mp.pausa && mp.ma >= P.limiarMa && P.pulso && (sim.t - mp.ultimoCapt) < 2.5 * 60 / mp.fc;
  if (capt && !mp.capturando){
    mp.capturando = true; M.capturas.push(sim.t);
    registrar('marcapasso', 'Captura elétrica: ' + mp.ma + ' mA, ' + mp.fc + '/min');
    eventoCenario({tipo: 'captura'});
  } else if (!capt && mp.capturando){
    mp.capturando = false; registrar('marcapasso', 'Perda de captura');
    eventoCenario({tipo: 'perdaCaptura'});
  }
  if (mp.on && !mp.pausa && !P.pulso && !M.mpNaPcrAvisado){ M.mpNaPcrAvisado = true; registrar('alerta', 'Marcapasso ligado durante a PCR.'); }
  /* RCP: aviso de 2 minutos */
  if (cpr.on && !cpr.avisado && sim.t - cpr.inicioCiclo >= 120){ cpr.avisado = true; toast('2 minutos de RCP: pause para checar o ritmo e troque o compressor.'); registrar('rcp', '2 minutos de ciclo'); }
  /* PNI */
  if (pni.estado === 'medindo' && sim.t - pni.t >= 6){
    pni.estado = 'ocioso'; pni.hora = sim.t;
    if (P.pulso && P.pas >= 50){ pni.sis = Math.round(P.pas + (R() - 0.5) * 6); pni.dia = Math.round(P.pad + (R() - 0.5) * 4); registrar('acao', 'PNI: ' + pni.sis + '/' + pni.dia + ' mmHg'); }
    else { pni.sis = null; registrar('acao', 'PNI: falha na medida'); }
    atualizarPni();
  }
  /* regras por tempo */
  if (sim.t >= sim.proxTempo){ sim.proxTempo = sim.t + 1; eventoCenario({tipo: 'tempo'}); }
}
let ultimoNum = 0, ultimoEnvio = 0, ultimoAvaliacao = null;
function quadro(agora){
  const dt = sim.ultimoQuadro === null ? 0 : Math.min(0.1, (agora - sim.ultimoQuadro) / 1000);
  sim.ultimoQuadro = agora;
  const i0 = sim.i;
  if (sim.rodando && dt > 0) passo(dt);
  for (const k in canais) canais[k].desenhar(i0);
  if (agora - ultimoNum > 250){ ultimoNum = agora; atualizarNumeros(); if (sim.rodando && sim.t > 4) avaliarAlarmes(); }
  if (remoto && agora - ultimoEnvio > 500){ ultimoEnvio = agora; enviarEstado(); }
  requestAnimationFrame(quadro);
}

/* --------------------------------------------------------------------------
   Interface
   -------------------------------------------------------------------------- */
/* Valores exibidos no monitor (também enviados ao controle remoto) */
function medidas(){
  const fc = fcMedida(), fx = canais.art.faixa(), m = {};
  m.fc = sim.rodando || sim.t > 0 ? (fc === null ? '---' : String(fc)) : '--';
  if (sim.linhaArterial && fx && sim.t > 4){
    const s = Math.round(fx.max), d = Math.round(fx.min);
    m.pa = s + '/' + d; m.pam = '(' + Math.round((s + 2 * d) / 3) + ')';
  } else { m.pa = sim.linhaArterial ? '--/--' : 'sem PAI'; m.pam = ''; }
  const sp = spo2Exibida(); m.spo2 = sp === null ? '--' : String(Math.round(sp));
  const fr = taxaResp(), ativo = sim.t - resp.tb < resp.periodo * 2 + 1;
  m.etco2 = ativo && sim.t > 1 ? String(Math.round(resp.Eb)) : (sim.t > 1 ? '0' : '--');
  m.fr = ativo ? String(Math.round(fr)) : '0';
  return m;
}
function atualizarNumeros(){
  const m = medidas();
  $('#nFC').textContent = m.fc; $('#nPA').textContent = m.pa; $('#nPAM').textContent = m.pam;
  $('#nSpO2').textContent = m.spo2; $('#nCO2').textContent = m.etco2; $('#nFR').textContent = m.fr;
  if (Object.keys(tend).length) sincronizarPainel();
  atualizarRelogio();
  $('#rcpCiclo').textContent = cpr.on ? mmss(sim.t - cpr.inicioCiclo) : '—';
  $('#epiDesde').textContent = ultimaEpi === null ? '—' : mmss(sim.t - ultimaEpi);
  $('#epiDesde').classList.toggle('vencido', ultimaEpi !== null && !P.pulso && sim.t - ultimaEpi >= 180);
  const st = $('#estadoAtual');
  if (st){
    const r = RITMOS[P.ritmo];
    st.textContent = r.nome + ' · ' + (P.pulso ? 'com pulso' : 'sem pulso') + (cen ? ' · estado: ' + (cenEstado || '—') + ' (' + mmss(sim.t - tEstado) + ')' : '');
  }
}
function atualizarRelogio(){ $('#relogio').textContent = mmss(sim.t); $('#pausado').hidden = sim.rodando; }
function atualizarPni(){
  $('#nPNI').textContent = pni.estado === 'medindo' ? 'medindo…' : (pni.hora === null ? '--/--' : (pni.sis === null ? 'falha' : pni.sis + '/' + pni.dia));
  $('#hPNI').textContent = pni.hora === null || pni.estado === 'medindo' ? '' : mmss(pni.hora);
}
function atualizarControles(){
  $('#bRcp').textContent = cpr.on ? 'Parar RCP' : 'Iniciar RCP';
  $('#bRcp').classList.toggle('ativo', cpr.on);
  $('#vJ').textContent = desf.j + ' J';
  $('#bSinc').classList.toggle('ativo', desf.sinc);
  $('#bSinc').setAttribute('aria-pressed', desf.sinc);
  const bc = $('#bCarga');
  bc.textContent = desf.estado === 'carregando' ? 'Carregando…' : desf.estado === 'pronto' ? 'Pronto ' + desf.j + ' J' : 'Carregar';
  bc.classList.toggle('pronto', desf.estado === 'pronto');
  $('#bChoque').disabled = desf.estado !== 'pronto';
  $('#vMpFc').textContent = mp.fc; $('#vMpMa').textContent = mp.ma;
  $('#bMp').textContent = mp.on ? 'Desligar' : 'Ligar';
  $('#bMp').classList.toggle('ativo', mp.on);
  $('#bMpPausa').textContent = mp.pausa ? 'Retomar' : 'Pausar';
  $('#bMpPausa').disabled = !mp.on;
  $('#mpStatus').textContent = mp.on ? (mp.pausa ? 'pausado' : 'estimulando') : 'desligado';
  $('#bRodar').textContent = sim.rodando ? 'Pausar simulação' : (sim.t > 0 ? 'Retomar simulação' : 'Iniciar simulação');
  $('#bRodar').classList.toggle('primario', !sim.rodando);
}
/* Sinais vitais ajustáveis pelo instrutor (aqui e no controle remoto) */
const VITAIS = {
  fc:       {nome: 'FC',                un: 'bpm',  min: 10, max: 250, passo: 5},
  pas:      {nome: 'PAS',               un: 'mmHg', min: 0,  max: 250, passo: 5},
  pad:      {nome: 'PAD',               un: 'mmHg', min: 0,  max: 150, passo: 5},
  spo2:     {nome: 'SpO₂',              un: '%',    min: 50, max: 100, passo: 1},
  etco2:    {nome: 'EtCO₂',             un: 'mmHg', min: 0,  max: 80,  passo: 2},
  fr:       {nome: 'FR',                un: '/min', min: 0,  max: 60,  passo: 1},
  limiarMa: {nome: 'Limiar de captura', un: 'mA',   min: 0,  max: 200, passo: 5}
};
const DESLIZANTES = ['fc', 'pas', 'pad', 'spo2', 'etco2', 'fr'];
function rotuloDur(s){ return s >= 60 ? (s / 60) + ' min' : s + ' s'; }
function definirVital(k, v, dur, quem){
  const d = VITAIS[k]; if (!d || !Number.isFinite(v)) return;
  v = Math.max(d.min, Math.min(d.max, Math.round(v)));
  if (dur > 0) tend[k] = {de: P[k], para: v, t0: sim.t, dur};
  else { delete tend[k]; P[k] = v; }
  registrar('instrutor', quem + ': ' + d.nome + ' → ' + v + ' ' + d.un + (dur > 0 ? ' em ' + rotuloDur(dur) : ''));
  sincronizarPainel();
}

/* --------------------------------------------------------------------------
   Comandos: um só caminho para os botões desta tela e para o controle remoto
   -------------------------------------------------------------------------- */
function alternarRodar(on){
  if (on === undefined) on = !sim.rodando;
  if (on === sim.rodando) return;
  sim.rodando = on;
  if (on && sim.t === 0) registrar('sistema', 'Simulação iniciada' + (cen ? ': ' + cen.titulo : ''));
  if (on) pedirTelaAcesa();
  atualizarControles(); atualizarRelogio();
}
function carregarDesf(){
  if (!sim.rodando){ toast('Inicie a simulação no painel do instrutor.'); return; }
  if (desf.estado !== 'ocioso') return;
  desf.estado = 'carregando'; desf.tCarga = sim.t; Som.carga(); atualizarControles();
}
function desarmar(){
  if (desf.estado === 'ocioso') return;
  desf.estado = 'ocioso'; desf.aguardandoR = false; toast('Energia descarregada internamente.'); atualizarControles();
}
function alternarMp(){
  if (!sim.rodando){ toast('Inicie a simulação no painel do instrutor.'); return; }
  mp.on = !mp.on; mp.pausa = false;
  registrar('marcapasso', mp.on ? 'Marcapasso ligado: ' + mp.fc + '/min, ' + mp.ma + ' mA' : 'Marcapasso desligado');
  atualizarControles();
}
function silenciarAlarme(){ alarmeSilencioAte = performance.now() + 120000; toast('Alarmes silenciados por 2 minutos.'); }
function comando(c, a, quem){
  a = a || {}; quem = quem || 'Instrutor';
  switch (c){
    case 'rodar':           alternarRodar(a.on); break;
    case 'reiniciar':       carregarCenario(cen ? cen.id : ''); break;
    case 'cenario':         carregarCenario(a.id || ''); break;
    case 'estado':          if (cen && cen.estados[a.nome]){ aplicarEstado(a.nome); registrar('instrutor', quem + ': estado → ' + a.nome); } break;
    case 'ritmo':           if (RITMOS[a.id]) aplicarRitmo(a.id, quem); break;
    case 'vital':           definirVital(a.k, Number(a.v), Number(a.dur) || 0, quem); break;
    case 'pulso':           P.pulso = !!a.on; registrar('instrutor', quem + ': pulso ' + (P.pulso ? 'presente' : 'ausente')); sincronizarPainel(); break;
    case 'linhaArterial':   sim.linhaArterial = !!a.on; canais.art.hist.fill(NaN); sincronizarPainel(); break;
    case 'qualidadeRcp':    if (a.v === 'boa' || a.v === 'ruim'){ sim.qualidadeRcp = a.v; registrar('instrutor', quem + ': qualidade da RCP → ' + a.v); sincronizarPainel(); } break;
    case 'avaliar':         mostrarAvaliacao(); break;
    case 'fecharAvaliacao': if ($('#dAval').open) $('#dAval').close(); break;
    case 'rcp':             alternarRcp(); break;
    case 'carga':           carregarDesf(); break;
    case 'choque':          apertarChoque(); break;
    case 'sinc':            desf.sinc = a.on !== undefined ? !!a.on : !desf.sinc; atualizarControles(); break;
    case 'energia':         mudarEnergia(a.d > 0 ? 1 : -1); break;
    case 'desarmar':        desarmar(); break;
    case 'mp':              alternarMp(); break;
    case 'mpPausa':         if (mp.on){ mp.pausa = !mp.pausa; atualizarControles(); } break;
    case 'mpFc':            mp.fc = Math.max(30, Math.min(180, mp.fc + (a.d > 0 ? 5 : -5))); atualizarControles(); break;
    case 'mpMa':            mp.ma = Math.max(0, Math.min(200, mp.ma + (a.d > 0 ? 5 : -5))); atualizarControles(); break;
    case 'droga':           if (FARM[a.id]) administrar(a.id); break;
    case 'acao':            if (ACOES.some(x => x.id === a.id)) executarAcao(a.id); break;
    case 'checarPulso':     checarPulso(); break;
    case 'pni':             medirPni(); break;
    case 'ecg12':           abrirEcg12(); break;
    case 'fecharEcg12':     if ($('#d12').open) $('#d12').close(); break;
    case 'silenciar':       silenciarAlarme(); break;
    default: return;
  }
  enviarEstado();
}

/* --------------------------------------------------------------------------
   Painel do instrutor
   -------------------------------------------------------------------------- */
function sincronizarPainel(){
  const sel = $('#selRitmo'); if (!sel) return;
  sel.value = P.ritmo;
  for (const k of DESLIZANTES){
    const r = $('#r_' + k), b = $('#b_' + k), alvo = tend[k] ? ' → ' + tend[k].para : '';
    if (r && document.activeElement !== r) r.value = Math.round(P[k]);
    if (b) b.textContent = Math.round(P[k]) + alvo;
  }
  const lim = $('#v_limiarMa'); if (lim && document.activeElement !== lim) lim.value = P.limiarMa;
  $('#v_pulso').checked = P.pulso;
  $('#v_art').checked = sim.linhaArterial;
  $('#v_rcp').value = sim.qualidadeRcp;
  for (const b of document.querySelectorAll('#estados button')) b.classList.toggle('ativo', b.dataset.estado === cenEstado);
  const st = cen && cen.estados[cenEstado];
  $('#estadoDesc').textContent = st && st.desc ? st.desc : (cen ? '' : 'Modo livre: escolha ritmo e sinais; registre as respostas manualmente.');
}
function montarEstados(){
  const box = $('#estados'); box.innerHTML = '';
  $('#cenResumo').textContent = cen ? cen.resumo : '';
  $('#cenObjetivo').textContent = cen ? cen.objetivo : '';
  $('#cenInfo').hidden = !cen;
  if (!cen) return;
  for (const nome of Object.keys(cen.estados)){
    const b = document.createElement('button'); b.className = 'btn mini'; b.dataset.estado = nome; b.textContent = nome;
    b.onclick = () => comando('estado', {nome});
    box.appendChild(b);
  }
}
function montarPainel(){
  const sel = $('#selRitmo');
  const grupos = {};
  for (const [id, r] of Object.entries(RITMOS)) (grupos[r.grupo] = grupos[r.grupo] || []).push([id, r]);
  for (const [g, lista] of Object.entries(grupos)){
    const og = document.createElement('optgroup'); og.label = g;
    for (const [id, r] of lista){ const o = document.createElement('option'); o.value = id; o.textContent = r.nome; og.appendChild(o); }
    sel.appendChild(og);
  }
  sel.onchange = () => comando('ritmo', {id: sel.value});
  const sc = $('#selCenario');
  const og0 = document.createElement('option'); og0.value = ''; og0.textContent = 'Modo livre'; sc.appendChild(og0);
  const gc = {};
  for (const c of CENARIOS_ACLS) (gc[c.grupo] = gc[c.grupo] || []).push(c);
  for (const [g, lista] of Object.entries(gc)){
    const og = document.createElement('optgroup'); og.label = g;
    for (const c of lista){ const o = document.createElement('option'); o.value = c.id; o.textContent = c.titulo; og.appendChild(o); }
    sc.appendChild(og);
  }
  sc.onchange = () => comando('cenario', {id: sc.value});
  const box = $('#vitais');
  for (const k of DESLIZANTES){
    const d = VITAIS[k], linha = document.createElement('div'); linha.className = 'vital';
    linha.innerHTML = '<div class="vital-cab"><span></span><button class="mais" aria-label="Diminuir">−</button><b id="b_' + k + '"></b><button class="mais" aria-label="Aumentar">+</button></div><input type="range" id="r_' + k + '">';
    linha.querySelector('span').textContent = d.nome + ' (' + d.un + ')';
    const r = linha.querySelector('input'); r.min = d.min; r.max = d.max; r.step = d.passo === 5 ? 1 : d.passo;
    r.setAttribute('aria-label', d.nome);
    const dur = () => Number($('#v_dur').value) || 0;
    r.oninput = () => { $('#b_' + k).textContent = r.value; };
    r.onchange = () => comando('vital', {k, v: Number(r.value), dur: dur()});
    const [menos, mais] = linha.querySelectorAll('button.mais');
    menos.onclick = () => comando('vital', {k, v: Math.round((tend[k] ? tend[k].para : P[k])) - d.passo, dur: dur()});
    mais.onclick = () => comando('vital', {k, v: Math.round((tend[k] ? tend[k].para : P[k])) + d.passo, dur: dur()});
    box.appendChild(linha);
  }
  $('#v_limiarMa').onchange = e => comando('vital', {k: 'limiarMa', v: Number(e.target.value)});
  $('#v_pulso').onchange = e => comando('pulso', {on: e.target.checked});
  $('#v_art').onchange = e => comando('linhaArterial', {on: e.target.checked});
  $('#v_rcp').onchange = e => comando('qualidadeRcp', {v: e.target.value});
  $('#bRodar').onclick = () => { Som.garantir(); comando('rodar'); };
  $('#bReiniciar').onclick = () => { if (confirm('Reiniciar o cenário? O registro atual será apagado.')) comando('reiniciar'); };
  $('#bAvaliar').onclick = () => comando('avaliar');
}
function montarDialogos(){
  const meds = $('#listaMeds'); let grupo = null;
  for (const f of FARMACOS){
    if (f.grupo !== grupo){ grupo = f.grupo; const h = document.createElement('h4'); h.textContent = grupo; meds.appendChild(h); }
    const b = document.createElement('button'); b.className = 'btn opcao';
    b.innerHTML = '<b></b><small></small>'; b.querySelector('b').textContent = f.nome; b.querySelector('small').textContent = f.dose;
    b.onclick = () => { $('#dMeds').close(); comando('droga', {id: f.id}); };
    meds.appendChild(b);
  }
  const ac = $('#listaAcoes');
  for (const a of ACOES){
    const b = document.createElement('button'); b.className = 'btn opcao';
    b.innerHTML = '<b></b><small></small>'; b.querySelector('b').textContent = a.nome; b.querySelector('small').textContent = a.desc;
    b.onclick = () => { $('#dAcoes').close(); comando('acao', {id: a.id}); };
    ac.appendChild(b);
  }
  for (const d of document.querySelectorAll('dialog')){
    d.addEventListener('click', e => { if (e.target === d) d.close(); });
    for (const b of d.querySelectorAll('[data-fechar]')) b.onclick = () => d.close();
  }
  $('#dAval').addEventListener('close', () => { if (remoto) remoto.enviar({tipo: 'avaliacaoFechada'}); });
  $('#d12').addEventListener('close', () => enviarEstado());
}
function montarControles(){
  const liga = (id, c, a) => { $(id).onclick = () => comando(c, a); };
  $('#bMeds').onclick = () => $('#dMeds').showModal();
  $('#bAcoes').onclick = () => $('#dAcoes').showModal();
  liga('#bPulso', 'checarPulso'); liga('#bPni', 'pni'); liga('#bEcg12', 'ecg12'); liga('#bRcp', 'rcp');
  liga('#bJmenos', 'energia', {d: -1}); liga('#bJmais', 'energia', {d: 1});
  liga('#bSinc', 'sinc'); liga('#bCarga', 'carga'); liga('#bChoque', 'choque'); liga('#bDesarmar', 'desarmar');
  liga('#bMp', 'mp'); liga('#bMpPausa', 'mpPausa');
  liga('#bFcMenos', 'mpFc', {d: -1}); liga('#bFcMais', 'mpFc', {d: 1});
  liga('#bMaMenos', 'mpMa', {d: -1}); liga('#bMaMais', 'mpMa', {d: 1});
  liga('#bSilenciar', 'silenciar');
  $('#bSom').onclick = () => { Som.ligado = !Som.ligado; if (Som.ligado) Som.garantir(); $('#bSom').textContent = Som.ligado ? 'Som: ligado' : 'Som: desligado'; $('#bSom').setAttribute('aria-pressed', Som.ligado); };
  $('#bTela').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); };
  $('#bInstrutor').onclick = () => alternarInstrutor();
  $('#bFecharPainel').onclick = () => alternarInstrutor(false);
  $('#bRemoto').onclick = abrirPareamento;
  document.addEventListener('keydown', e => {
    if (e.target.matches('input,select,textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'i' || e.key === 'I') alternarInstrutor();
  });
}

/* --------------------------------------------------------------------------
   Controle remoto (celular/tablet ou outra janela)
   -------------------------------------------------------------------------- */
const CHAVE_SALA = 'treinador-ecg-sim-sala', CHAVE_REMOTO_ATIVO = 'treinador-ecg-sim-remoto';
let ultimosClientes = 0;
function catalogo(){
  return {
    tipo: 'catalogo',
    ritmos: Object.entries(RITMOS).map(([id, r]) => ({id, nome: r.nome, grupo: r.grupo})),
    cenarios: CENARIOS_ACLS.map(c => ({id: c.id, titulo: c.titulo, grupo: c.grupo, resumo: c.resumo, objetivo: c.objetivo, estados: Object.keys(c.estados)})),
    farmacos: FARMACOS, acoes: ACOES, vitais: VITAIS, deslizantes: DESLIZANTES
  };
}
function estadoRemoto(){
  const st = cen && cen.estados[cenEstado], al = $('#alarme');
  const vit = {}; for (const k in VITAIS) vit[k] = Math.round(P[k]);
  const alvos = {}; for (const k in tend) alvos[k] = tend[k].para;
  return {
    tipo: 'estado', t: sim.t, rodando: sim.rodando,
    cen: cen ? cen.id : '', cenTitulo: cen ? cen.titulo : 'Modo livre', cenEstado: cenEstado || '', estadoDesc: st && st.desc ? st.desc : '',
    ritmo: P.ritmo, ritmoNome: RITMOS[P.ritmo].nome, pulso: P.pulso, vitais: vit, alvos,
    medidas: medidas(), alarme: al && !al.hidden ? al.textContent : '',
    rcp: {on: cpr.on, ciclo: cpr.on ? sim.t - cpr.inicioCiclo : null, qualidade: sim.qualidadeRcp},
    epi: ultimaEpi === null ? null : sim.t - ultimaEpi,
    mp: {on: mp.on, fc: mp.fc, ma: mp.ma, pausa: mp.pausa, capturando: mp.capturando},
    desf: {j: desf.j, sinc: desf.sinc, estado: desf.estado, aguardandoR: desf.aguardandoR},
    pni: {medindo: pni.estado === 'medindo', valor: pni.hora === null ? null : (pni.sis === null ? 'falha' : pni.sis + '/' + pni.dia)},
    linhaArterial: sim.linhaArterial, ecg12Aberto: $('#d12').open, avaliacaoAberta: $('#dAval').open
  };
}
function enviarEstado(){ if (remoto) remoto.enviar(estadoRemoto()); }
function aoMsgRemota(d, origem){
  if (d.tipo === 'ola'){
    remoto.responder(origem, catalogo());
    remoto.responder(origem, {tipo: 'log', todos: log});
    remoto.responder(origem, estadoRemoto());
    if (ultimoAvaliacao && $('#dAval').open) remoto.responder(origem, ultimoAvaliacao);
  } else if (d.tipo === 'cmd' && typeof d.c === 'string'){
    comando(d.c, d.a, d.papel === 'equipe' ? 'Equipe (controle)' : 'Instrutor (controle)');
  }
}
function aoStatusRemoto(st){
  const txt = {
    pronto: 'Pronto: abra o link ou leia o QR no celular.',
    conectando: 'Conectando ao servidor de pareamento…',
    indisponivel: 'Sem acesso ao servidor de pareamento (internet?). Outra janela neste aparelho continua funcionando.',
    'codigo-em-uso': 'Este código já está em uso por outro monitor. Gere um novo código.'
  }[st.p2p] || '';
  const el = $('#statusRemoto');
  if (el) el.textContent = txt + ' ' + (st.clientes ? st.clientes + ' controle(s) conectado(s).' : 'Nenhum controle conectado.');
  const b = $('#bRemoto');
  b.textContent = st.clientes ? 'Controle remoto · ' + st.clientes : 'Controle remoto';
  b.classList.toggle('ativo', st.clientes > 0);
  if (st.clientes > ultimosClientes){
    toast('Controle remoto conectado.');
    if ($('#ocultarAoConectar').checked) alternarInstrutor(false);
    if ($('#dRemoto').open) setTimeout(() => $('#dRemoto').close(), 1200);
  }
  ultimosClientes = st.clientes;
}
function linkControle(codigo){
  const u = new URL('controle.html', location.href);
  u.search = location.search; u.hash = 'sala=' + codigo;
  return u.href;
}
function ligarRemoto(codigo){
  if (remoto) remoto.fechar();
  ultimosClientes = 0;
  try { localStorage.setItem(CHAVE_SALA, codigo); sessionStorage.setItem(CHAVE_REMOTO_ATIVO, '1'); } catch (e) {}
  remoto = new SimRemoto.Anfitriao(codigo, aoMsgRemota, aoStatusRemoto);
  const url = linkControle(codigo);
  $('#codigoSala').textContent = codigo;
  $('#linkControle').value = url;
  const qr = $('#qr');
  if (typeof qrcode === 'function'){
    const q = qrcode(0, 'M'); q.addData(url); q.make();
    qr.innerHTML = q.createSvgTag({cellSize: 5, margin: 3, scalable: true, alt: 'QR code do link do controle remoto'});
  } else qr.textContent = '';
  $('#avisoArquivo').hidden = location.protocol.indexOf('http') === 0;
  remoto.status();
}
function abrirPareamento(){
  if (!remoto){
    let codigo = null;
    try { codigo = SimRemoto.normalizarCodigo(localStorage.getItem(CHAVE_SALA)); } catch (e) {}
    ligarRemoto(codigo && codigo.length === 6 ? codigo : SimRemoto.novoCodigo());
  }
  $('#dRemoto').showModal();
}
function montarPareamento(){
  $('#bCopiar').onclick = () => {
    const v = $('#linkControle').value;
    (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast('Link copiado.'), () => { $('#linkControle').select(); toast('Selecione e copie o link.'); });
  };
  $('#bAbrirAqui').onclick = () => window.open($('#linkControle').value, '_blank');
  $('#bNovoCodigo').onclick = () => ligarRemoto(SimRemoto.novoCodigo());
  $('#bDesligarRemoto').onclick = () => {
    if (remoto) remoto.fechar(); remoto = null; ultimosClientes = 0;
    try { sessionStorage.removeItem(CHAVE_REMOTO_ATIVO); } catch (e) {}
    $('#bRemoto').textContent = 'Controle remoto'; $('#bRemoto').classList.remove('ativo');
    $('#dRemoto').close(); toast('Controle remoto desligado.');
  };
  let ativo = false;
  try { ativo = sessionStorage.getItem(CHAVE_REMOTO_ATIVO) === '1'; } catch (e) {}
  if (ativo){
    let codigo = null;
    try { codigo = SimRemoto.normalizarCodigo(localStorage.getItem(CHAVE_SALA)); } catch (e) {}
    if (codigo && codigo.length === 6) ligarRemoto(codigo);
  }
}
function alternarInstrutor(forcar){
  const sim_ = $('#sim'), aberto = forcar !== undefined ? forcar : !sim_.classList.contains('painel-aberto');
  sim_.classList.toggle('painel-aberto', aberto);
  $('#bInstrutor').setAttribute('aria-pressed', aberto);
  setTimeout(() => { for (const k in canais) canais[k].medir(); }, 30);
}
function mudarEnergia(d){
  let i = ENERGIAS.indexOf(desf.j); if (i < 0) i = ENERGIAS.indexOf(150);
  desf.j = ENERGIAS[Math.max(0, Math.min(ENERGIAS.length - 1, i + d))];
  if (desf.estado !== 'ocioso'){ desf.estado = 'ocioso'; desf.aguardandoR = false; toast('Energia alterada: carregue novamente.'); }
  atualizarControles();
}
let travaTela = null;
function pedirTelaAcesa(){
  try { if (navigator.wakeLock && !travaTela) navigator.wakeLock.request('screen').then(l => { travaTela = l; l.addEventListener('release', () => { travaTela = null; }); }).catch(() => {}); } catch (e) {}
}

/* --------------------------------------------------------------------------
   Avaliação automática (AHA 2025, Parte 9)
   -------------------------------------------------------------------------- */
function avaliar(){
  const itens = [], add = (nivel, titulo, texto) => itens.push({nivel, titulo, texto});
  const eps = M.episodios;
  eps.forEach((ep, k) => {
    const rot = eps.length > 1 ? ' (PCR ' + (k + 1) + ')' : '';
    const fim = ep.fim === null ? sim.t : ep.fim;
    if (ep.primeiraRcp === null) add('erro', 'Início da RCP' + rot, 'As compressões não foram iniciadas durante a PCR.');
    else {
      const d = ep.primeiraRcp - ep.ini;
      add(d <= 10 ? 'ok' : 'alerta', 'Início da RCP' + rot, 'Compressões iniciadas ' + Math.round(d) + ' s após a PCR. Comece imediatamente ao reconhecer a parada.');
    }
    if (ep.tempo > 20){
      const ccf = ep.rcp / ep.tempo * 100;
      add(ccf >= 80 ? 'ok' : ccf >= 60 ? 'alerta' : 'erro', 'Fração de compressões' + rot, Math.round(ccf) + '% do tempo de PCR com compressões. Meta: pelo menos 60%, idealmente 80% ou mais.');
      const pausas = ep.pausas.concat(ep.pausa > 0 && ep.fim === null ? [ep.pausa] : []);
      if (pausas.length){
        const mx = Math.max.apply(null, pausas);
        add(mx <= 10 ? 'ok' : 'alerta', 'Pausas nas compressões' + rot, 'Maior pausa: ' + Math.round(mx) + ' s. Mantenha as pausas (checagem de ritmo, choque) abaixo de 10 s; carregue o desfibrilador durante as compressões.');
      }
    }
    if (ep.chocavelIni){
      if (!ep.choques.length) add('erro', 'Desfibrilação' + rot, 'Ritmo chocável sem nenhum choque.');
      else { const d = ep.choques[0].t - ep.ini; add(d <= 120 ? 'ok' : 'alerta', 'Primeiro choque' + rot, 'Primeiro choque ' + Math.round(d) + ' s após a PCR. Na FV/TVsp, desfibrile o quanto antes.'); }
    }
    if (ep.epi.length){
      const e1 = ep.epi[0];
      if (e1.chocavel && e1.choques < 2) add('alerta', 'Momento da epinefrina' + rot, '1ª dose com ' + e1.choques + ' choque(s). Ritmo chocável: epinefrina depois que as tentativas iniciais de desfibrilação falham (após o 2º choque no algoritmo).');
      else if (!e1.chocavel){ const d = e1.t - ep.ini; add(d <= 300 ? 'ok' : 'alerta', 'Momento da epinefrina' + rot, '1ª dose ' + mmss(d) + ' após a PCR. Ritmo não chocável: epinefrina o mais cedo possível.'); }
      else add('ok', 'Momento da epinefrina' + rot, '1ª dose após ' + e1.choques + ' choques.');
      for (let i = 1; i < ep.epi.length; i++){
        const iv = ep.epi[i].t - ep.epi[i - 1].t;
        add(iv >= 180 && iv <= 300 ? 'ok' : 'alerta', 'Intervalo da epinefrina' + rot, 'Dose ' + (i + 1) + ': ' + mmss(iv) + ' após a anterior. Repetir a cada 3–5 min.');
      }
      const ult = ep.epi[ep.epi.length - 1].t;
      if (fim - ult > 330) add('alerta', 'Intervalo da epinefrina' + rot, mmss(fim - ult) + ' sem nova dose até o fim da PCR. Repetir a cada 3–5 min.');
    } else if (ep.tempo > 240 || (!ep.chocavelIni && ep.tempo > 60)) add('erro', 'Epinefrina' + rot, 'Nenhuma dose de epinefrina na PCR.');
    if (ep.fim !== null){
      const ecg = M.ecg12.some(x => x.t >= ep.fim);
      add(ecg ? 'ok' : 'alerta', 'Cuidados pós-PCR' + rot, (ecg ? 'ECG de 12 derivações obtido após o RCE. ' : 'Faltou ECG de 12 derivações após o RCE. ') + 'Alvos: PAS ≥ 90 mmHg, PAM ≥ 65 mmHg, SpO₂ 90–98%, controle de temperatura.');
    }
  });
  let atropina = 0, adenosina = 0;
  for (const e of log){
    if (e.tipo === 'droga'){
      const pcr = !e.pulso;
      if (e.base === 'atropina'){
        if (pcr) add('erro', 'Atropina na PCR', mmss(e.t) + ': atropina não faz parte do algoritmo da PCR.');
        else { atropina++; if (atropina === 4) add('erro', 'Dose máxima de atropina', 'Mais de 3 mg de atropina. Dose: 1 mg a cada 3–5 min, máximo 3 mg.'); }
      }
      if (e.droga === 'epinefrina' && !pcr) add('erro', 'Epinefrina em bolus com pulso', mmss(e.t) + ': o bolus de 1 mg é da PCR. Na bradicardia, use infusão de 2–10 mcg/min.');
      if ((e.base === 'amiodarona' || e.base === 'lidocaina') && pcr){
        if (!e.chocavel) add('erro', 'Antiarrítmico em ritmo não chocável', mmss(e.t) + ': amiodarona/lidocaína são para FV/TVsp refratária ao choque.');
        else if (e.ritmo === 'torsades' && e.base === 'amiodarona') add('alerta', 'Amiodarona na torsades', mmss(e.t) + ': amiodarona prolonga o QT. Na torsades, use magnésio.');
        else if (e.choques < 3) add('alerta', 'Momento do antiarrítmico', mmss(e.t) + ': dado com ' + e.choques + ' choque(s). No algoritmo, entra na FV/TVsp refratária, após o 3º choque.');
        if (e.droga === 'amiodarona150' && !log.some(x => x.droga === 'amiodarona300' && x.t <= e.t)) add('alerta', 'Dose de amiodarona', mmss(e.t) + ': na PCR, a 1ª dose é 300 mg; 150 mg é a 2ª.');
      }
      if (e.base === 'amiodarona' && !pcr && e.droga !== 'amiodarona_pulso') add('erro', 'Amiodarona em bolus com pulso', mmss(e.t) + ': com pulso, 150 mg em 10 min; o bolus de 300 mg é da PCR.');
      if (e.base === 'adenosina'){
        adenosina++;
        if (pcr) add('erro', 'Adenosina na PCR', mmss(e.t) + ': não tem papel na PCR.');
        else {
          if (adenosina === 1 && e.droga === 'adenosina12') add('alerta', 'Dose de adenosina', 'A 1ª dose é 6 mg; 12 mg se não houver resposta.');
          if (['fa', 'flutter', 'taqui_sinusal'].includes(e.ritmo)) add('alerta', 'Adenosina fora da indicação', mmss(e.t) + ': adenosina é para taquicardia regular de QRS estreito (reentrada). Não reverte ' + RITMOS[e.ritmo].nome.toLowerCase() + '.');
        }
      }
      if (e.base === 'magnesio' && e.ritmo === 'torsades') add('ok', 'Magnésio na torsades', mmss(e.t) + ': indicado.');
    }
    if (e.tipo === 'choque'){
      if (!e.pulso && !e.chocavel) add('erro', 'Choque em ritmo não chocável', mmss(e.t) + ': ' + RITMOS[e.ritmoAntes].nome + ' não é chocável. Mantenha RCP e epinefrina.');
      if (e.pulso && !e.sinc) add('erro', 'Choque não sincronizado com pulso', mmss(e.t) + ': em ritmo organizado com pulso, use cardioversão sincronizada (risco de FV).');
      if (e.sinc && e.ritmoAntes === 'fa' && e.j < 200) add('alerta', 'Energia na FA', mmss(e.t) + ': ' + e.j + ' J. AHA 2025: na FA, é razoável iniciar com pelo menos 200 J (bifásico).');
      if (!e.sinc && e.chocavel && e.j < 120) add('alerta', 'Energia na desfibrilação', mmss(e.t) + ': ' + e.j + ' J. Bifásico: 120–200 J conforme o fabricante; se desconhecido, a máxima.');
    }
    if (e.tipo === 'alerta' && e.seguranca) add('erro', 'Segurança no choque', mmss(e.t) + ': tentativa de choque com compressões em andamento.');
    if (e.tipo === 'alerta' && /sem onda R/.test(e.texto)) add('alerta', 'SINC em ritmo sem R', mmss(e.t) + ': na FV e na TV polimórfica, desfibrile sem sincronizar.');
  }
  if (M.rcpComPulso) add('erro', 'RCP com pulso', 'Compressões iniciadas ' + M.rcpComPulso + ' vez(es) em paciente com pulso. Cheque o pulso (até 10 s) antes.');
  if (M.mpNaPcr) add('erro', 'Marcapasso na PCR', 'A estimulação transcutânea não é recomendada na PCR estabelecida.');
  const usouMp = log.some(e => e.tipo === 'marcapasso' && /ligado/.test(e.texto));
  if (usouMp){
    if (!M.capturas.length) add('alerta', 'Captura do marcapasso', 'Não houve captura. Aumente a corrente até a captura elétrica (QRS largo após cada espícula).');
    else {
      const conf = M.pulsos.some(p => p.t >= M.capturas[0] && p.capturando);
      add(conf ? 'ok' : 'alerta', 'Captura mecânica', conf ? 'Pulso conferido durante a estimulação.' : 'Após a captura elétrica, confirme a captura mecânica pelo pulso (femoral).');
    }
  }
  return itens;
}
function resumoNumeros(){
  const eps = M.episodios, choques = log.filter(e => e.tipo === 'choque').length;
  const epi = log.filter(e => e.droga === 'epinefrina').length;
  const tempoPcr = eps.reduce((s, e) => s + e.tempo, 0), rcp = eps.reduce((s, e) => s + e.rcp, 0);
  return [
    ['Duração', mmss(sim.t)],
    ['Tempo em PCR', eps.length ? mmss(tempoPcr) : '—'],
    ['Fração de compressões', tempoPcr > 0 ? Math.round(rcp / tempoPcr * 100) + '%' : '—'],
    ['Choques', String(choques)],
    ['Doses de epinefrina', String(epi)],
    ['RCE', eps.some(e => e.fim !== null) ? 'sim' : (eps.length ? 'não' : '—')]
  ];
}
function mostrarAvaliacao(){
  if (sim.rodando){ sim.rodando = false; atualizarControles(); atualizarRelogio(); }
  const itens = avaliar(), d = $('#dAval');
  const nums = $('#avNums'); nums.innerHTML = '';
  for (const [k, v] of resumoNumeros()){ const div = document.createElement('div'); div.innerHTML = '<small></small><b></b>'; div.querySelector('small').textContent = k; div.querySelector('b').textContent = v; nums.appendChild(div); }
  const ul = $('#avItens'); ul.innerHTML = '';
  const ordem = {erro: 0, alerta: 1, ok: 2};
  itens.sort((a, b) => ordem[a.nivel] - ordem[b.nivel]);
  if (!itens.length){ const li = document.createElement('li'); li.textContent = 'Nada a avaliar ainda: rode um cenário e registre as condutas.'; ul.appendChild(li); }
  for (const it of itens){
    const li = document.createElement('li'); li.className = 'av-' + it.nivel;
    li.innerHTML = '<span class="selo"></span><div><b></b><p></p></div>';
    li.querySelector('.selo').textContent = it.nivel === 'ok' ? 'OK' : it.nivel === 'alerta' ? 'Atenção' : 'Erro';
    li.querySelector('b').textContent = it.titulo; li.querySelector('p').textContent = it.texto;
    ul.appendChild(li);
  }
  const tl = $('#avLinha'); tl.innerHTML = '';
  for (const e of log){ const li = document.createElement('li'); li.className = 'lg-' + e.tipo; li.innerHTML = '<time>' + mmss(e.t) + '</time> '; li.appendChild(document.createTextNode(e.texto)); tl.appendChild(li); }
  $('#avCenario').textContent = cen ? cen.titulo : 'Modo livre';
  $('#bBaixar').onclick = () => baixarRelatorio(itens);
  if (!d.open) d.showModal();
  salvarHistorico(itens);
  ultimoAvaliacao = {tipo: 'avaliacao', cenario: cen ? cen.titulo : 'Modo livre', nums: resumoNumeros(), itens};
  if (remoto){ remoto.enviar(ultimoAvaliacao); enviarEstado(); }
}
/* Histórico local, exibido também em Progresso no Treinador de ECG */
const CHAVE_HIST = 'treinador-ecg-simulacoes';
function salvarHistorico(itens){
  if (sim.t < 20) return;
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE_HIST) || '[]');
    const eps = M.episodios, tPcr = eps.reduce((a, e) => a + e.tempo, 0), rcp = eps.reduce((a, e) => a + e.rcp, 0);
    const reg = {sessao, data: new Date().toISOString(), cenario: cen ? cen.titulo : 'Modo livre', duracao: Math.round(sim.t),
      ok: itens.filter(i => i.nivel === 'ok').length, alertas: itens.filter(i => i.nivel === 'alerta').length, erros: itens.filter(i => i.nivel === 'erro').length,
      pcr: eps.length > 0, rce: eps.some(e => e.fim !== null), ccf: tPcr > 20 ? Math.round(rcp / tPcr * 100) : null};
    const i = lista.findIndex(x => x.sessao === sessao);
    if (i >= 0) lista.splice(i, 1);
    lista.unshift(reg);
    localStorage.setItem(CHAVE_HIST, JSON.stringify(lista.slice(0, 30)));
  } catch (e) { /* armazenamento indisponível: segue sem histórico */ }
}
function baixarRelatorio(itens){
  const linhas = ['Simulador ACLS — relatório', 'Cenário: ' + (cen ? cen.titulo : 'Modo livre'), 'Data: ' + new Date().toLocaleString('pt-BR'), ''];
  for (const [k, v] of resumoNumeros()) linhas.push(k + ': ' + v);
  linhas.push('', 'AVALIAÇÃO (AHA 2025, Parte 9)');
  for (const it of itens) linhas.push('[' + (it.nivel === 'ok' ? 'OK' : it.nivel === 'alerta' ? 'ATENÇÃO' : 'ERRO') + '] ' + it.titulo + ': ' + it.texto);
  linhas.push('', 'REGISTRO');
  for (const e of log) linhas.push(mmss(e.t) + '  ' + e.texto);
  linhas.push('', 'Avaliação automática de apoio ao debriefing; não substitui o instrutor.');
  const blob = new Blob([linhas.join('\n')], {type: 'text/plain;charset=utf-8'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'simulacao-acls-' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-') + '.txt';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* --------------------------------------------------------------------------
   Início
   -------------------------------------------------------------------------- */
function iniciar(){
  canais.ecg   = new Canal($('#cECG .traco'),   {segundos: 6, min: -1.6, max: 2.1, cor: '#46e08a', grade: true});
  canais.art   = new Canal($('#cART .traco'),   {segundos: 6, min: 0, max: 160, cor: '#ff5a6e', linhas: [150, 100, 50, 0]});
  canais.pleth = new Canal($('#cPLETH .traco'), {segundos: 6, min: -0.05, max: 1.25, cor: '#4cc9f0'});
  canais.co2   = new Canal($('#cCO2 .traco'),   {segundos: 12, min: 0, max: 55, cor: '#f2d04a', linhas: [50, 25, 0]});
  reiniciarTudo();
  montarPainel(); montarDialogos(); montarControles();
  carregarCenario('');
  montarPareamento();
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { for (const k in canais) canais[k].medir(); }, 150); });
  if (window.matchMedia('(max-width: 900px)').matches) alternarInstrutor(false);
  requestAnimationFrame(quadro);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();

/* Exposto para testes automatizados */
window.__simACLS = {get P(){ return P; }, get sim(){ return sim; }, get log(){ return log; }, get M(){ return M; }, get mp(){ return mp; }, get desf(){ return desf; }, avaliar, fcMedida};
})();
