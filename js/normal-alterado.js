/* Treino "normal ou alterado?" com ECGs reais (etapa 3.17).
   Normais: códigos só NORM 100% + SR, laudo "ritmo sinusal, ECG normal", sem alerta de qualidade e
   medidas do 12SL normais (campo normal). Alterados: anormalidade inequívoca na fonte (campo alterado).
   Casos de fronteira (bradicardia sinusal em jovem, arritmia sinusal, BIRD isolado) ficam de fora.
   Placar só na sessão; não altera notas nem o progresso salvo. */
function poolNormalAlterado(){return ECGS_REAIS.filter(r => r.normal || r.alterado);}
function novoNormalAlterado(){
  const pool = poolNormalAlterado(), atual = REAL_STATE.na && REAL_STATE.na.id;
  const opcoes = pool.filter(r => r.id !== atual);
  const placar = REAL_STATE.na ? REAL_STATE.na.placar : {acertos: 0, total: 0};
  REAL_STATE.na = {id: opcoes[Math.floor(Math.random() * opcoes.length)].id, resposta: null, placar};
}
function viewNormalAlterado(root){
  if (!REAL_STATE.na) novoNormalAlterado();
  const na = REAL_STATE.na, r = ECGS_REAIS.find(x => x.id === na.id), certo = r.normal ? 'normal' : 'alterado';
  const card = el('section', 'card');
  const top = el('div', 'row between wrap');
  const info = el('div');
  info.appendChild(el('h3', null, 'Este ECG é normal ou alterado?'));
  info.appendChild(el('p', 'small muted', 'Placar desta sessão: ' + na.placar.acertos + ' de ' + na.placar.total + '.'));
  top.appendChild(info);
  const pular = el('button', 'btn', 'Outro traçado ↻'); pular.onclick = () => { novoNormalAlterado(); render(); };
  top.appendChild(pular); card.appendChild(top);
  mountECG(card, {view: {layout: 'grid12', leads: REAL_LEADS, rhythmLead: 'DII', seconds: 10, rowMm: 40}}, {spec: realSpec(r), locked: true});
  const bar = el('div', 'choices mt-16');
  for (const [v, t] of [['normal', 'Normal'], ['alterado', 'Alterado']]){
    let cls = 'btn full';
    if (na.resposta){ if (v === certo) cls += ' correct'; else if (v === na.resposta) cls += ' wrong'; }
    const b = el('button', cls, t);
    if (!na.resposta) b.onclick = () => { na.resposta = v; na.placar = {acertos: na.placar.acertos + (v === certo ? 1 : 0), total: na.placar.total + 1}; render(); };
    bar.appendChild(b);
  }
  card.appendChild(bar);
  if (na.resposta){
    const ok = na.resposta === certo;
    const fb = el('section', 'box mt-16 ' + (ok ? 'ok' : 'bad'));
    fb.appendChild(el('h3', null, (ok ? 'Correto: ' : 'Não: ') + (r.normal ? 'ECG normal' : 'ECG alterado')));
    if (r.normal){
      const m = r.medidas;
      fb.appendChild(el('p', null, 'Ritmo sinusal, FC ' + m.fc + ' bpm, PR ' + m.pr + ' ms, QRS ' + m.qrs + ' ms, QTc ' + m.qtc + ' ms e eixo ' + m.eixo + '° (medidas automáticas do 12SL), todos dentro do normal.'));
      if (!ok) fb.appendChild(el('p', 'small', 'Variações de amplitude, pequenas irregularidades da linha de base e diferenças de forma entre batimentos fazem parte do traçado real e não são, sozinhas, anormalidade.'));
    } else {
      fb.appendChild(el('p', null, '<strong>Principal achado:</strong> ' + esc(r.title.replace(/^Registro \d+ · /, '')) + '.'));
    }
    const d = el('details'); d.appendChild(el('summary', null, 'Laudo e códigos da fonte'));
    const ul = el('ul', 'crit'); r.labels.forEach(l => ul.appendChild(el('li', null, esc(l)))); d.appendChild(ul); fb.appendChild(d);
    const prox = el('button', 'btn primary mt-12', 'Próximo traçado →'); prox.onclick = () => { novoNormalAlterado(); render(); window.scrollTo(0, 0); };
    fb.appendChild(prox);
    card.appendChild(fb);
  }
  root.appendChild(card);
}
