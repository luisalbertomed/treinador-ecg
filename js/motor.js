/* ==========================================================================
   MOTOR DE TRAÇADOS — geração procedural de ECG e renderização em canvas
   Papel padrão: 25 mm/s, 10 mm/mV
   ========================================================================== */
const FS = 500; // Hz de amostragem
function rng(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
/* Amplitudes basais normais por derivação (mV) */
const LEADS = {
  DI:  {p: 0.10, q: 0.05, r: 0.75, s: 0.10, t: 0.22},
  DII: {p: 0.16, q: 0.05, r: 1.10, s: 0.15, t: 0.32},
  DIII:{p: 0.08, q: 0.04, r: 0.45, s: 0.25, t: 0.12},
  aVR: {p:-0.12, q: 0.00, r: 0.12, s: 0.90, t:-0.22},
  aVL: {p: 0.05, q: 0.04, r: 0.40, s: 0.18, t: 0.10},
  aVF: {p: 0.13, q: 0.05, r: 0.70, s: 0.18, t: 0.20},
  V1:  {p: 0.08, q: 0.00, r: 0.22, s: 0.95, t:-0.10},
  V2:  {p: 0.10, q: 0.00, r: 0.40, s: 1.28, t: 0.42},
  V3:  {p: 0.10, q: 0.02, r: 0.75, s: 0.90, t: 0.45},
  V4:  {p: 0.10, q: 0.04, r: 1.30, s: 0.50, t: 0.42},
  V5:  {p: 0.10, q: 0.06, r: 1.35, s: 0.20, t: 0.34},
  V6:  {p: 0.09, q: 0.06, r: 1.05, s: 0.10, t: 0.26},
  /* derivações adicionais */
  V3R: {p: 0.07, q: 0.00, r: 0.18, s: 0.75, t: 0.08},
  V4R: {p: 0.07, q: 0.02, r: 0.16, s: 0.60, t: 0.10},
  V7:  {p: 0.08, q: 0.05, r: 0.95, s: 0.12, t: 0.22},
  V8:  {p: 0.07, q: 0.05, r: 0.80, s: 0.10, t: 0.20},
  V9:  {p: 0.07, q: 0.05, r: 0.65, s: 0.10, t: 0.18}
};
const LEAD_ORDER = ['DI','DII','DIII','aVR','aVL','aVF','V1','V2','V3','V4','V5','V6','V3R','V4R','V7','V8','V9'];
/* Peso da atividade atrial por derivação (P/flutter/fibrilação) */
const ATRIAL_W = {
  DI: 0.7, DII: 1.0, DIII: 0.8, aVR: -0.8, aVL: 0.35, aVF: 0.9,
  V1: 0.9, V2: 0.6, V3: 0.4, V4: 0.35, V5: 0.3, V6: 0.3,
  V3R: 0.5, V4R: 0.5, V7: 0.4, V8: 0.35, V9: 0.3
};
function gauss(x, c, w, a){ const d = (x - c) / w; return a * Math.exp(-0.5 * d * d); }
/* --------------------------------------------------------------------------
   Formas de QRS. Recebem (m) = morfologia da derivação e devolvem vértices
   [tempoRelativo(0-1), amplitude mV]
   -------------------------------------------------------------------------- */
const QRS_SHAPES = {
  normal(m){
    const v = [[0, 0]];
    if (m.q > 0.001) v.push([0.16, -m.q]);
    v.push([0.44, m.r]);
    if (m.s > 0.001) v.push([0.74, -m.s]);
    v.push([1, 0]);
    return v;
  },
  brd(m, lead){
    if (lead === 'V1' || lead === 'V2' || lead === 'aVR'){
      return [[0,0],[0.14, 0.30],[0.28, -0.28],[0.42, 0.95],[0.60, 0.55],[0.80,-0.10],[1,0]];
    }
    if (lead === 'DI' || lead === 'aVL' || lead === 'V5' || lead === 'V6'){
      return [[0,0],[0.10,-m.q],[0.30, m.r*0.85],[0.55,-Math.max(m.s,0.35)],[0.80,-0.18],[1,0]];
    }
    return [[0,0],[0.28, m.r*0.8],[0.58,-Math.max(m.s,0.28)],[0.82,-0.12],[1,0]];
  },
  bre(m, lead){
    if (lead === 'V1' || lead === 'V2' || lead === 'V3'){
      return [[0,0],[0.12, 0.08],[0.55,-Math.max(m.s,1.2)],[0.85,-0.25],[1,0]];
    }
    if (lead === 'DI' || lead === 'aVL' || lead === 'V5' || lead === 'V6'){
      const R = Math.max(m.r, 1.0);
      return [[0,0],[0.28, R*0.85],[0.46, R*0.70],[0.66, R],[0.90, 0.20],[1,0]];
    }
    if (lead === 'aVR') return [[0,0],[0.5,-0.9],[0.85,-0.2],[1,0]];
    return [[0,0],[0.30, m.r*0.9],[0.50, m.r*0.75],[0.68, m.r],[0.90, 0.12],[1,0]];
  },
  ventricular(m, lead){
    const pos = ['DI','aVL','V5','V6','DII','aVF'].includes(lead);
    if (pos) return [[0,0],[0.34, 1.40],[0.60, 0.92],[0.86, 0.22],[1,0]];
    return [[0,0],[0.08, 0.14],[0.44,-1.50],[0.74,-0.85],[0.94,-0.14],[1,0]];
  },
  wpw(m, lead){
    const up = m.r >= m.s;
    if (up) return [[0,0],[0.22, m.r*0.30],[0.40, m.r*0.55],[0.58, m.r],[0.82,-m.s*0.6],[1,0]];
    return [[0,0],[0.22,-m.s*0.25],[0.45,-m.s*0.7],[0.65,-m.s],[0.88,-0.15],[1,0]];
  },
  sinusoide(m, lead){
    const amp = (m.r >= m.s) ? Math.max(m.r,0.8) : -Math.max(m.s,0.8);
    return [[0,0],[0.25, amp*0.9],[0.55, amp*0.35],[0.80,-amp*0.35],[1,0]];
  }
};
function synth(spec, lead, seedOffset){
  const dur = spec.dur || 10;
  const N = Math.round(dur * FS);
  const y = new Float32Array(N);
  const R = rng((spec.seed || 7) * 131 + seedOffset * 977 + 13);
  const base = LEADS[lead];
  const aw = ATRIAL_W[lead];
  const g = spec.global || {};
  const lm = (spec.leadMods && spec.leadMods[lead]) || {};
  const at = spec.atrial || {mode: 'sinus'};
  const pDur = at.dur || 0.10;
  function addP(t0, amp, dur_, notched, peaked){
    const a = amp;
    if (notched){
      addGaussRange(y, t0, dur_, (x)=> gauss(x, 0.32, 0.16, a) + gauss(x, 0.70, 0.16, a*0.95));
    } else if (peaked){
      addGaussRange(y, t0, dur_, (x)=> gauss(x, 0.5, 0.16, a));
    } else {
      addGaussRange(y, t0, dur_, (x)=> gauss(x, 0.5, 0.22, a));
    }
  }
  if (at.mode === 'fib'){
    let t = 0;
    while (t < dur){
      const amp = (at.amp !== undefined ? at.amp : 0.06) * aw * (0.4 + R() * 1.1);
      addGaussRange(y, t, 0.09, (x)=> gauss(x, 0.5, 0.25, amp));
      t += 0.09 + R() * 0.07;
    }
  } else if (at.mode === 'flutter'){
    const cyc = 60 / (at.rate || 300);
    let t = -cyc;
    while (t < dur){
      const amp = (at.amp !== undefined ? at.amp : 0.26) * aw;
      addRange(y, t, cyc, (u)=> (u < 0.78 ? (-amp) * (u / 0.78) : (-amp) * (1 - (u - 0.78) / 0.22)));
      t += cyc;
    }
  } else if (at.mode !== 'none'){
    const pAmp = (at.ampScale !== undefined ? at.ampScale : 1) * (lm.p !== undefined ? lm.p : base.p) * (at.inv ? -1 : 1);
    const list = at.list || [];
    for (const pt of list){
      const tp = (pt && typeof pt === 'object') ? pt.t : pt;
      const kp = (pt && typeof pt === 'object' && pt.k !== undefined) ? pt.k : 1;
      addP(tp - pDur / 2, pAmp * kp, pDur, at.notched, at.peaked);
    }
  }
  for (const b of (spec.beats || [])){
    const kind = b.kind || 'n';
    const mods = Object.assign({}, g, lm, b.mods || {});
    const m = {
      q: pick(mods.q, base.q), r: pick(mods.r, base.r),
      s: pick(mods.s, base.s), t: pick(mods.t, base.t)
    };
    if (mods.qScale) m.q *= mods.qScale;
    if (mods.rScale) m.r *= mods.rScale;
    if (mods.sScale) m.s *= mods.sScale;
    let shapeName = b.shape || mods.shape || 'normal';
    let qrsDur = pick(b.qrsDur, mods.qrsDur, 0.09);
    if (kind === 'v'){ shapeName = 'ventricular'; qrsDur = pick(b.qrsDur, 0.16); }
    const shapeFn = QRS_SHAPES[shapeName] || QRS_SHAPES.normal;
    let verts = shapeFn(m, lead);
    if (shapeName !== 'normal' && shapeName !== 'wpw'){
      const gain = pick(mods.gain, 1);
      verts = verts.map(v => [v[0], v[1] * gain]);
    }
    const t0 = b.t;
    addPolyline(y, t0, qrsDur, verts);
    if (mods.prDep && g.pr){
      const pEnd = t0 - g.pr + 0.10;
      addRange(y, pEnd, Math.max(g.pr - 0.10, 0.02), ()=> mods.prDep);
    }
    const j = t0 + qrsDur;
    let tAmp = pick(b.tAmp, mods.tAmp, m.t);
    if (mods.tScale) tAmp *= mods.tScale;
    if (mods.tInv) tAmp = -Math.abs(tAmp);
    const stJ = pick(b.st, mods.st, 0) * (mods.stLeadScale !== undefined ? mods.stLeadScale : 1);
    const curv = pick(b.stCurv, mods.stCurv, 0);
    const tDur = pick(mods.tDur, 0.16);
    const stLen = pick(mods.stLen, 0.09);
    const tPeak = j + stLen + tDur * 0.5;
    const span = tPeak - j;
    addRange(y, j, span, (u)=> stJ * (1 - u) + curv * 4 * u * (1 - u));
    const wUp = tDur * (mods.tSym ? 0.34 : 0.42);
    const wDn = tDur * (mods.tSym ? 0.34 : 0.28);
    addRange(y, tPeak - wUp * 3, wUp * 3 + wDn * 3.2, (u, tt)=>{
      const x = tt - tPeak;
      const w = x < 0 ? wUp : wDn;
      return gauss(x, 0, w, tAmp);
    });
    if (mods.tBiphasic){
      addRange(y, tPeak, tDur * 1.1, (u, tt)=> gauss(tt - (tPeak + tDur * 0.62), 0, tDur * 0.24, mods.tBiphasic));
    }
    const uAmp = pick(mods.u, 0);
    if (uAmp) addRange(y, tPeak + tDur * 0.9, 0.20, (u, tt)=> gauss(tt - (tPeak + tDur * 1.5), 0, 0.055, uAmp));
    if (mods.osborn) addRange(y, j - 0.03, 0.10, (u, tt)=> gauss(tt - j, 0, 0.022, mods.osborn * (m.r >= m.s ? 1 : -0.5)));
    if (b.spike || mods.spike){
      const i0 = Math.round((t0 - 0.012) * FS);
      for (let i = Math.max(0,i0); i < Math.min(N, i0 + 4); i++) y[i] += 1.1;
    }
  }
  const asc = spec.ampScale;
  if (asc && asc !== 1) for (let i = 0; i < N; i++) y[i] *= asc;
  const noise = spec.noise !== undefined ? spec.noise : 0.012;
  const wander = spec.wander !== undefined ? spec.wander : 0.035;
  const ph = R() * 6.28;
  for (let i = 0; i < N; i++){
    const t = i / FS;
    y[i] += (R() - 0.5) * noise + Math.sin(t * 1.1 + ph) * wander + Math.sin(t * 0.37 + ph * 2) * wander * 0.6;
  }
  return y;
  function pick(){ for (const v of arguments) if (v !== undefined && v !== null) return v; return 0; }
  function addRange(arr, t0, len, fn){
    const i0 = Math.max(0, Math.round(t0 * FS)), i1 = Math.min(N, Math.round((t0 + len) * FS));
    for (let i = i0; i < i1; i++){ const tt = i / FS; arr[i] += fn((tt - t0) / len, tt); }
  }
  function addGaussRange(arr, t0, len, fn){
    const i0 = Math.max(0, Math.round(t0 * FS)), i1 = Math.min(N, Math.round((t0 + len) * FS));
    for (let i = i0; i < i1; i++) arr[i] += fn((i / FS - t0) / len);
  }
  function addPolyline(arr, t0, len, verts){
    const i0 = Math.max(0, Math.round(t0 * FS)), i1 = Math.min(N, Math.round((t0 + len) * FS));
    for (let i = i0; i < i1; i++){
      const u = (i / FS - t0) / len;
      arr[i] += interp(verts, u);
    }
  }
  function interp(v, u){
    for (let k = 0; k < v.length - 1; k++){
      if (u >= v[k][0] && u <= v[k+1][0]){
        const f = (u - v[k][0]) / (v[k+1][0] - v[k][0] || 1e-9);
        return v[k][1] + (v[k+1][1] - v[k][1]) * f;
      }
    }
    return 0;
  }
}
/* --------------------------------------------------------------------------
   Geradores de ritmo
   -------------------------------------------------------------------------- */
function ritmoSinusal(fc, dur, opts){
  opts = opts || {};
  const rr = 60 / fc, beats = [], pList = [];
  const pr = opts.pr !== undefined ? opts.pr : 0.16;
  const jit = opts.jitter || 0;
  let t = 0.35;
  const R = rng(opts.seed || 3);
  while (t < dur - 0.4){
    beats.push({t: t, shape: opts.shape});
    pList.push(t - pr);
    t += rr * (1 + (R() - 0.5) * 2 * jit);
  }
  return {beats: beats, atrial: {mode: 'sinus', list: pList, ampScale: opts.pScale, notched: opts.pNotched, peaked: opts.pPeaked, inv: opts.pInv}};
}
function ritmoIrregular(fcMedia, dur, opts){
  opts = opts || {};
  const beats = [];
  const R = rng(opts.seed || 5);
  let t = 0.4;
  while (t < dur - 0.4){
    beats.push({t: t, shape: opts.shape});
    const rr = 60 / fcMedia * (0.62 + R() * 0.78);
    t += rr;
  }
  return {beats: beats, atrial: {mode: opts.atrialMode || 'fib'}};
}
