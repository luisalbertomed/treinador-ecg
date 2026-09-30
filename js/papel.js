/* ==========================================================================
   RENDERIZAÇÃO
   ========================================================================== */
const PAPER = {
  bg:      '#fffdfb',
  minor:   'rgba(214,120,120,0.32)',
  major:   'rgba(198,86,86,0.55)',
  trace:   '#161215',
  label:   '#7a4a4a'
};
const cacheSig = new Map();
function signalFor(spec, lead){
  const key = (spec.__id || '?') + '|' + lead;
  if (cacheSig.has(key)) return cacheSig.get(key);
  const s = synth(spec, lead, LEAD_ORDER.indexOf(lead) + 1);
  cacheSig.set(key, s);
  return s;
}
function ecgTotalMm(spec, opts){
  opts = opts || {};
  if (opts.layout === 'grid12') return 6 + 4 * 2.5 * 25;
  return 6 + (opts.seconds || (spec && spec.dur) || 10) * 25;
}
let __specId = 0;
function tagSpec(spec){ if (!spec.__id) spec.__id = ++__specId; return spec; }
function renderECG(canvas, spec, opts){
  tagSpec(spec);
  opts = opts || {};
  const layout = opts.layout || 'stack';
  const leads = opts.leads || ['DII'];
  const px = opts.pxPerMm || 3.2;
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  let cols, rows, secPerCell, rowMm, cellMm, extraStrip;
  if (layout === 'grid12'){
    cols = 4; rows = 3; secPerCell = 2.5; rowMm = opts.rowMm || 30;
    extraStrip = opts.rhythmLead || 'DII';
  } else {
    cols = 1; rows = leads.length; secPerCell = opts.seconds || (spec.dur || 10); rowMm = opts.rowMm || 30;
    extraStrip = null;
  }
  cellMm = secPerCell * 25;
  const leftMm = 6;
  const totalW = leftMm + cols * cellMm;
  const totalH = (rows + (extraStrip ? 1 : 0)) * rowMm;
  const W = Math.round(totalW * px), H = Math.round(totalH * px);
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  canvas.__px = px; canvas.__spec = spec;
  ctx.fillStyle = PAPER.bg; ctx.fillRect(0, 0, W, H);
  drawGrid(ctx, W, H, px);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  /* remap = simula troca de cabos: {DI:{src:'DI',inv:true}, DII:{src:'DIII'}, ...}
     destaque = derivações que devem "acender" no traçado */
  const remap = opts.remap || null;
  const dest = opts.destaque ? (Array.isArray(opts.destaque) ? opts.destaque : [opts.destaque]) : null;
  const corHot = opts.destaqueCor || '#c8321e';
  const drawLead = (lead, t0, t1, x0, yBase, wMm) => {
    const rm = remap && remap[lead];
    const sig = signalFor(spec, (rm && rm.src) ? rm.src : lead);
    const flip = (rm && rm.inv) ? -1 : 1;
    const hot = !!(dest && dest.indexOf(lead) >= 0);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0 * px, yBase * px - rowMm * px * 0.70, wMm * px, rowMm * px * 1.22);
    ctx.clip();
    if (hot){
      ctx.fillStyle = 'rgba(200,50,30,0.10)';
      ctx.fillRect(x0 * px, (yBase - rowMm * 0.66) * px, wMm * px, rowMm * px * 1.10);
    }
    ctx.strokeStyle = hot ? corHot : PAPER.trace;
    ctx.lineWidth = Math.max(1.15, px * (hot ? 0.58 : 0.42));
    ctx.beginPath();
    const i0 = Math.round(t0 * FS), i1 = Math.min(sig.length, Math.round(t1 * FS));
    for (let i = i0; i < i1; i++){
      const xmm = x0 + (i / FS - t0) * 25;
      const ymm = yBase - sig[i] * flip * 10;
      if (i === i0) ctx.moveTo(xmm * px, ymm * px); else ctx.lineTo(xmm * px, ymm * px);
    }
    ctx.stroke();
    if(opts.annotations && opts.annotations.lead===lead){
      const bands=guideBands(opts.annotations.pat,spec,lead,opts.annotations.mode,t0,t1);
      for(const band of bands){
        const x=(x0+(band.start-t0)*25)*px, width=(band.end-band.start)*25*px;
        ctx.fillStyle=band.color+'28';ctx.fillRect(x,(yBase-rowMm*0.27)*px,width,rowMm*0.60*px);
        ctx.strokeStyle=band.color;ctx.lineWidth=1.5;
        ctx.strokeRect(x,(yBase-rowMm*0.27)*px,width,rowMm*0.60*px);
        ctx.fillStyle=band.color;ctx.font='700 '+Math.max(10,Math.round(px*3))+'px system-ui';
        ctx.fillText(band.label,x+2,(yBase-rowMm*0.29)*px);
      }
    }
    ctx.restore();
    ctx.fillStyle = hot ? corHot : PAPER.label;
    ctx.font = (hot ? '750 ' : '600 ') + Math.round(px * 3.4) + 'px ui-sans-serif,system-ui,sans-serif';
    ctx.fillText(lead, (x0 + 1.5) * px, (yBase - rowMm * 0.36) * px);
  };
  if (layout === 'grid12'){
    for (let r = 0; r < 3; r++){
      for (let c = 0; c < 4; c++){
        const lead = leads[c * 3 + r];
        if (!lead) continue;
        const x0 = leftMm + c * cellMm;
        const yBase = (r + 0.55) * rowMm;
        drawLead(lead, c * secPerCell, (c + 1) * secPerCell, x0, yBase, cellMm);
        if (c > 0){
          ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x0 * px, (yBase - rowMm * 0.4) * px); ctx.lineTo(x0 * px, (yBase + rowMm * 0.25) * px); ctx.stroke();
        }
      }
    }
    drawLead(extraStrip, 0, 10, leftMm, (3 + 0.55) * rowMm, cols * cellMm);
    drawCal(ctx, px, leftMm, (3 + 0.55) * rowMm);
    for (let r = 0; r < 3; r++) drawCal(ctx, px, leftMm, (r + 0.55) * rowMm);
  } else {
    leads.forEach((lead, i) => {
      drawLead(lead, 0, secPerCell, leftMm, (i + 0.55) * rowMm, cellMm);
      drawCal(ctx, px, leftMm, (i + 0.55) * rowMm);
    });
  }
  ctx.fillStyle = 'rgba(90,50,50,0.75)';
  ctx.font = '500 ' + Math.round(px * 2.7) + 'px ui-sans-serif,system-ui,sans-serif';
  ctx.fillText('25 mm/s   ·   10 mm/mV', 2 * px, H - 2.2 * px);
}
function drawCal(ctx, px, xMm, yBaseMm){
  ctx.strokeStyle = PAPER.trace; ctx.lineWidth = Math.max(1.05, px * 0.38);
  ctx.beginPath();
  ctx.moveTo((xMm - 5.6) * px, yBaseMm * px);
  ctx.lineTo((xMm - 4.4) * px, yBaseMm * px);
  ctx.lineTo((xMm - 4.4) * px, (yBaseMm - 10) * px);
  ctx.lineTo((xMm - 1.6) * px, (yBaseMm - 10) * px);
  ctx.lineTo((xMm - 1.6) * px, yBaseMm * px);
  ctx.lineTo((xMm - 0.4) * px, yBaseMm * px);
  ctx.stroke();
}
function drawGrid(ctx, W, H, px){
  ctx.lineWidth = 1;
  ctx.strokeStyle = PAPER.minor;
  ctx.beginPath();
  for (let x = 0; x * px <= W; x++){ if (x % 5 === 0) continue; const p = Math.round(x * px) + 0.5; ctx.moveTo(p, 0); ctx.lineTo(p, H); }
  for (let y = 0; y * px <= H; y++){ if (y % 5 === 0) continue; const p = Math.round(y * px) + 0.5; ctx.moveTo(0, p); ctx.lineTo(W, p); }
  ctx.stroke();
  ctx.strokeStyle = PAPER.major;
  ctx.beginPath();
  for (let x = 0; x * px <= W; x += 5){ const p = Math.round(x * px) + 0.5; ctx.moveTo(p, 0); ctx.lineTo(p, H); }
  for (let y = 0; y * px <= H; y += 5){ const p = Math.round(y * px) + 0.5; ctx.moveTo(0, p); ctx.lineTo(W, p); }
  ctx.stroke();
}
let __caliperActive = null;
function caliperPos(e, canvas){
  const r = canvas.getBoundingClientRect();
  const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
  const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
  return {x: cx, y: cy};
}
function attachCaliper(canvas, readout){
  const overlay = document.createElement('div');
  overlay.className = 'caliper-ovl';
  canvas.parentNode.appendChild(overlay);
  function down(e){
    const box = canvas.closest('.ecgbox');
    if (!box || !box.classList.contains('caliper-on')) return;
    __caliperActive = {canvas: canvas, overlay: overlay, readout: readout, start: caliperPos(e, canvas)};
    overlay.style.display = 'block';
    e.preventDefault();
  }
  canvas.addEventListener('mousedown', down); canvas.addEventListener('touchstart', down, {passive:false});
}
function caliperMove(e){
  const a = __caliperActive;
  if (!a) return;
  const p = caliperPos(e, a.canvas);
  const px = a.canvas.__px || 3.2;
  const x = Math.min(a.start.x, p.x), w = Math.abs(p.x - a.start.x);
  const y = Math.min(a.start.y, p.y), h = Math.abs(p.y - a.start.y);
  a.overlay.style.left = x + 'px'; a.overlay.style.top = y + 'px';
  a.overlay.style.width = w + 'px'; a.overlay.style.height = Math.max(h, 2) + 'px';
  const ms = Math.round(w / px / 25 * 1000);
  const mv = (h / px / 10);
  const fc = ms > 0 ? Math.round(60000 / ms) : 0;
  if (a.readout) a.readout.innerHTML = '<b>' + ms + ' ms</b> &nbsp;·&nbsp; ' + (h/px).toFixed(1) + ' mm (' + mv.toFixed(2) + ' mV)' +
    (ms > 200 && ms < 3000 ? ' &nbsp;·&nbsp; se for 1 RR → <b>' + fc + ' bpm</b>' : '');
  e.preventDefault();
}
function caliperUp(){ __caliperActive = null; }
window.addEventListener('mousemove', caliperMove);
window.addEventListener('touchmove', caliperMove, {passive:false});
window.addEventListener('mouseup', caliperUp);
window.addEventListener('touchend', caliperUp);
