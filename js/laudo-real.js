/* Laudo guiado no ECG real: ritmo → FC → eixo → intervalos → ST/T → conclusão.
   Gabaritos: ritmo pelos códigos SCP do PTB-XL; FC, eixo, PR, QRS e QTc pelas medidas automáticas
   do algoritmo 12SL publicadas no PTB-XL+ (campo medidas); conclusão só nos registros com answer.
   ST/T é autoavaliação contra o laudo original. Não altera notas nem o progresso salvo. */
const GUIA_RITMOS = ['Sinusal', 'Fibrilação atrial', 'Flutter atrial', 'Ritmo de marca-passo'];
const GUIA_EIXOS = [['normal', 'Normal (−30° a +90°)'], ['esquerda', 'Desviado para a esquerda (−30° a −90°)'], ['direita', 'Desviado para a direita (+90° a +180°)'], ['extremo', 'Extremo (−90° a −180°)']];
const GUIA_STT = ['Sem alteração relevante', 'Supradesnivelamento de ST', 'Infradesnivelamento de ST', 'Onda T invertida', 'Alteração secundária (bloqueio, sobrecarga ou marca-passo)'];
/* Tolerâncias das medidas: diferença aceita entre a medida do aluno e a do 12SL. */
const GUIA_TOL = {fc: v => Math.max(5, Math.round(v * 0.1)), pr: () => 20, qrs: () => 20, qtc: () => 30};

/* Classe do eixo a partir do ângulo; a 10° de um limite, as duas classes vizinhas são aceitas. */
function classesDoEixo(graus){
  const cls = g => g >= -30 && g <= 90 ? 'normal' : g < -30 && g >= -90 ? 'esquerda' : g > 90 && g <= 180 ? 'direita' : 'extremo';
  const norm = g => ((g + 180) % 360 + 360) % 360 - 180;
  return [...new Set([cls(graus), cls(norm(graus - 10)), cls(norm(graus + 10))])];
}
/* Etapas disponíveis para o registro: PR só com ritmo sinusal; ritmo só quando a base o define sem ambiguidade. */
function etapasDoLaudo(r){
  const m = r.medidas || {}, steps = [];
  if (r.ritmo) steps.push({key: 'ritmo', titulo: 'Ritmo', tipo: 'opcao'});
  if (m.fc) steps.push({key: 'fc', titulo: 'Frequência cardíaca', tipo: 'numero', unidade: 'bpm'});
  if (Number.isFinite(m.eixo)) steps.push({key: 'eixo', titulo: 'Eixo elétrico do QRS', tipo: 'opcao'});
  // Fora do ritmo sinusal, PR não se aplica e o QTc é pouco confiável: só o QRS entra.
  const intervalos = ['pr', 'qrs', 'qtc'].filter(k => m[k] && (k === 'qrs' || r.ritmo === 'Sinusal'));
  if (intervalos.length) steps.push({key: 'intervalos', titulo: 'Intervalos', tipo: 'intervalos', campos: intervalos});
  steps.push({key: 'stt', titulo: 'Segmento ST e onda T', tipo: 'stt'});
  steps.push({key: 'conclusao', titulo: 'Conclusão', tipo: r.answer || r.normal ? 'opcao' : 'livre'});
  return steps;
}
function novoLaudoGuiado(id){
  const r = ECGS_REAIS.find(x => x.id === id) || ECGS_REAIS[Math.floor(Math.random() * ECGS_REAIS.length)];
  REAL_STATE.guia = {id: r.id, step: 0, respostas: {}, resultados: {}, conclusaoOpcoes: r.answer ? obterDistratoresReais(r).opcoes : r.normal ? ['ECG normal', 'ECG alterado'] : null};
}
/* Corrige uma etapa e devolve {pontos, total, linhas} para o retorno ao aluno. */
function corrigirEtapa(r, step, resp){
  const m = r.medidas || {}, out = {pontos: 0, total: 0, linhas: []};
  const conta = (ok, texto) => { out.total++; if (ok) out.pontos++; out.linhas.push((ok ? '✓ ' : '✕ ') + texto); };
  if (step.key === 'ritmo') conta(resp === r.ritmo, 'Ritmo pela base: ' + r.ritmo + '.');
  if (step.key === 'fc'){ const tol = GUIA_TOL.fc(m.fc), v = Number(resp); conta(Math.abs(v - m.fc) <= tol, 'Você: ' + (resp === '' ? '—' : v) + ' bpm · 12SL: ' + m.fc + ' bpm (tolerância ±' + tol + ').'); }
  if (step.key === 'eixo'){ const ok = classesDoEixo(m.eixo); conta(ok.includes(resp), 'Eixo do QRS pelo 12SL: ' + m.eixo + '° (' + ok.map(k => GUIA_EIXOS.find(e => e[0] === k)[1].split(' (')[0].toLowerCase()).join(' ou ') + ').'); out.linhas.push('O laudo original pode classificar o eixo de outra forma (os critérios variam entre escolas); compare no fim.'); }
  if (step.key === 'intervalos') for (const k of step.campos){
    const tol = GUIA_TOL[k](m[k]), v = Number(resp[k]), nome = {pr: 'PR', qrs: 'QRS', qtc: 'QTc (Bazett)'}[k];
    conta(resp[k] !== '' && resp[k] !== undefined && Math.abs(v - m[k]) <= tol, nome + ': você ' + (resp[k] ? v : '—') + ' ms · 12SL ' + m[k] + ' ms (±' + tol + ').');
  }
  if (step.key === 'conclusao' && r.answer) conta(resp === r.answer, 'Diagnóstico principal: ' + r.answer + '.');
  if (step.key === 'conclusao' && !r.answer && r.normal) conta(resp === 'ECG normal', 'Gabarito: ECG normal (ritmo sinusal e medidas dentro do normal).');
  return out;
}
function viewLaudoGuiado(root){
  if (!REAL_STATE.guia) novoLaudoGuiado();
  const g = REAL_STATE.guia, r = ECGS_REAIS.find(x => x.id === g.id), steps = etapasDoLaudo(r);
  const card = el('section', 'card');
  const top = el('div', 'row between wrap');
  const info = el('div');
  info.appendChild(el('h3', null, 'Laudo guiado · etapa ' + Math.min(g.step + 1, steps.length) + ' de ' + steps.length));
  info.appendChild(el('p', 'small muted', 'Leia o traçado na ordem do roteiro. Use o 📏 Compasso para medir. Cada etapa é corrigida antes da próxima.'));
  top.appendChild(info);
  const outro = el('button', 'btn', 'Outro traçado ↻');
  outro.onclick = () => { const pool = ECGS_REAIS.filter(x => x.id !== r.id); novoLaudoGuiado(pool[Math.floor(Math.random() * pool.length)].id); render(); };
  top.appendChild(outro); card.appendChild(top);
  const trilha = el('ol', 'guia-trilha');
  steps.forEach((s, i) => trilha.appendChild(el('li', i < g.step ? 'feita' : i === g.step ? 'atual' : '', esc(s.titulo))));
  card.appendChild(trilha);
  mountECG(card, {view: {layout: 'grid12', leads: REAL_LEADS, rhythmLead: 'DII', seconds: 10, rowMm: 40}}, {spec: realSpec(r), locked: true});
  root.appendChild(card);

  const painel = el('section', 'card');
  // Etapas já respondidas, com o gabarito.
  for (let i = 0; i < Math.min(g.step, steps.length); i++){
    const s = steps[i], res = g.resultados[s.key];
    const box = el('div', 'box guia-feita');
    box.appendChild(el('strong', null, (i + 1) + '. ' + esc(s.titulo) + (res.total ? ' · ' + res.pontos + '/' + res.total : '')));
    const ul = el('ul', 'crit'); res.linhas.forEach(t => ul.appendChild(el('li', null, esc(t)))); box.appendChild(ul);
    painel.appendChild(box);
  }
  if (g.step < steps.length) painel.appendChild(etapaAtual(r, g, steps[g.step], steps));
  else painel.appendChild(resumoLaudo(r, g, steps));
  root.appendChild(painel);
}
function etapaAtual(r, g, step, steps){
  const box = el('div', 'guia-etapa');
  box.appendChild(el('h3', null, (g.step + 1) + '. ' + esc(step.titulo)));
  const dicas = {
    ritmo: 'Há onda P antes de cada QRS? O RR é regular? Há ondas F em serrilha ou espículas?',
    fc: 'Ritmo regular: 1500 ÷ quadradinhos entre dois R. Irregular: conte os QRS da faixa de 10 s e multiplique por 6.',
    eixo: 'Olhe a polaridade do QRS em DI e aVF (e em DII, se DI positivo e aVF negativo).',
    intervalos: 'Meça com o compasso, em milissegundos. QTc pela fórmula de Bazett: QT ÷ √RR (RR em segundos).',
    stt: 'Compare o ST com a linha de base (segmento PR) e veja a direção da onda T em relação ao QRS. Marque tudo o que encontrar.',
    conclusao: r.answer ? 'Qual é o diagnóstico principal deste traçado?' : r.normal ? 'O traçado é normal ou alterado?' : 'Escreva sua conclusão. Este registro não tem gabarito único; compare com o laudo original.'
  };
  box.appendChild(el('p', 'small muted', esc(dicas[step.key])));
  let valor = null;
  const enviar = el('button', 'btn primary', 'Corrigir etapa');
  if (step.key === 'ritmo' || step.key === 'eixo' || (step.key === 'conclusao' && g.conclusaoOpcoes)){
    const opcoes = step.key === 'ritmo' ? GUIA_RITMOS.map(t => [t, t]) : step.key === 'eixo' ? GUIA_EIXOS : g.conclusaoOpcoes.map(t => [t, t]);
    const lista = el('div', 'choices');
    opcoes.forEach(([v, t]) => { const b = el('button', 'btn full text-left', esc(t)); b.onclick = () => { valor = v; lista.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); }; lista.appendChild(b); });
    box.appendChild(lista);
  } else if (step.key === 'fc'){
    const inp = el('input', 'guia-num'); inp.type = 'number'; inp.min = 20; inp.max = 300; inp.inputMode = 'numeric'; inp.placeholder = 'bpm'; inp.setAttribute('aria-label', 'Frequência cardíaca em bpm');
    inp.oninput = () => { valor = inp.value; }; box.appendChild(inp);
  } else if (step.key === 'intervalos'){
    valor = {};
    for (const k of step.campos){
      const lab = el('label', 'guia-campo', {pr: 'PR', qrs: 'QRS', qtc: 'QTc'}[k] + ' (ms) ');
      const inp = el('input', 'guia-num'); inp.type = 'number'; inp.min = 0; inp.max = 800; inp.inputMode = 'numeric'; inp.oninput = () => { valor[k] = inp.value; };
      lab.appendChild(inp); box.appendChild(lab);
    }
  } else if (step.key === 'stt'){
    valor = [];
    GUIA_STT.forEach(t => { const lab = el('label', 'guia-campo'); const c = el('input'); c.type = 'checkbox'; c.onchange = () => { valor = c.checked ? [...valor, t] : valor.filter(x => x !== t); }; lab.append(c, document.createTextNode(' ' + t)); box.appendChild(lab); });
  } else {
    const ta = el('textarea'); ta.rows = 3; ta.placeholder = 'Sua conclusão'; ta.setAttribute('aria-label', 'Sua conclusão'); ta.oninput = () => { valor = ta.value; }; box.appendChild(ta);
  }
  const aviso = el('p', 'small'); aviso.setAttribute('aria-live', 'polite');
  enviar.onclick = () => {
    const vazio = valor === null || (step.key === 'fc' && valor === '');
    if (vazio && step.tipo !== 'stt' && step.tipo !== 'intervalos'){ aviso.textContent = 'Responda antes de corrigir.'; return; }
    g.respostas[step.key] = valor;
    let res = corrigirEtapa(r, step, valor);
    if (step.key === 'stt') res = {pontos: 0, total: 0, linhas: ['Você marcou: ' + (valor.length ? valor.join('; ') : 'nada') + '.', 'Autoavaliação: compare com o laudo original, mostrado ao final.']};
    if (step.key === 'conclusao' && !g.conclusaoOpcoes) res = {pontos: 0, total: 0, linhas: ['Sua conclusão: ' + (valor || '—'), 'Sem gabarito único: ' + (r.note || 'compare com o laudo original abaixo.')]};
    g.resultados[step.key] = res; g.step++; render();
  };
  box.append(enviar, aviso);
  return box;
}
function resumoLaudo(r, g, steps){
  const box = el('div', 'guia-resumo');
  const tot = steps.reduce((a, s) => { const x = g.resultados[s.key]; return {p: a.p + x.pontos, t: a.t + x.total}; }, {p: 0, t: 0});
  box.appendChild(el('h3', null, 'Resultado: ' + tot.p + ' de ' + tot.t + ' itens objetivos'));
  box.appendChild(el('p', 'small muted', 'FC, eixo e intervalos são comparados com a medida automática do algoritmo 12SL (GE), publicada no PTB-XL+, não com uma leitura de especialista. Diferenças pequenas são esperadas; as tolerâncias aparecem em cada item.'));
  const fonte = el('div', 'box');
  fonte.appendChild(el('strong', null, 'Laudo e códigos da fonte · ' + esc(r.title.replace(/^Registro \d+ · /, ''))));
  const ul = el('ul', 'crit'); r.labels.forEach(l => ul.appendChild(el('li', null, esc(l)))); fonte.appendChild(ul);
  box.appendChild(fonte);
  const bar = el('div', 'ecgbar');
  const denovo = el('button', 'btn', 'Refazer este traçado'); denovo.onclick = () => { novoLaudoGuiado(r.id); render(); };
  const prox = el('button', 'btn primary', 'Próximo traçado →'); prox.onclick = () => { const pool = ECGS_REAIS.filter(x => x.id !== r.id); novoLaudoGuiado(pool[Math.floor(Math.random() * pool.length)].id); render(); window.scrollTo(0, 0); };
  bar.append(denovo, prox); box.appendChild(bar);
  return box;
}
