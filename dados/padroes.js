/* ==========================================================================
   BASE DE PADRÕES DE ECG
   ========================================================================== */
function ml(map){
  const out = {};
  for (const k in map) k.split(',').forEach(l => {
    l = l.trim(); out[l] = Object.assign({}, out[l], map[k]);
  });
  return out;
}
function B(fc, opts, global, leadMods, extra){
  opts = opts || {};
  const dur = opts.dur || 10;
  const r = ritmoSinusal(fc, dur, opts);
  const g = Object.assign({pr: opts.pr !== undefined ? opts.pr : 0.16}, global || {});
  return Object.assign({dur: dur, seed: opts.seed || 1, beats: r.beats, atrial: r.atrial,
                        global: g, leadMods: leadMods || {}}, extra || {});
}
const V12  = {layout: 'grid12', leads: LEAD_ORDER.slice(0, 12), rhythmLead: 'DII'};
const DIIS = {layout: 'stack', leads: ['DII'], seconds: 10, rowMm: 32};
const D2V1 = {layout: 'stack', leads: ['DII', 'V1'], seconds: 10, rowMm: 30};
const PADROES = [

/* ============================ BASE ============================ */
{
  id: 'sinusal', nome: 'Ritmo sinusal normal', cat: 'base', nivel: 1,
  view: V12,
  build: () => B(72, {seed: 11}),
  laudo: {ritmo: 'Sinusal', fc: '≈ 72 bpm', eixo: 'Normal (0° a +90°): QRS positivo em DI e aVF',
    pr: '160 ms (normal 120–200)', qrs: '90 ms, sem onda Q patológica, progressão de R normal (transição V3–V4)',
    stt: 'Sem supra ou infra de ST; onda T concordante com o QRS; QTc normal',
    conclusao: 'ECG dentro dos limites da normalidade'},
  criterios: ['Onda P precedendo cada QRS, com PR constante',
    'P positiva em DI, DII e aVF; negativa em aVR',
    'FC entre 50 e 100 bpm', 'QRS < 120 ms'],
  pegadinha: 'Antes de caçar patologia, prove que o ritmo é sinusal. Metade dos erros vem de pular esse passo.',
  conduta: 'Nenhuma. Correlacione sempre com a clínica.'
},
{
  id: 'brady_sinusal', nome: 'Bradicardia sinusal', cat: 'base', nivel: 1, view: DIIS,
  build: () => B(44, {seed: 21}),
  laudo: {ritmo: 'Sinusal', fc: '≈ 44 bpm', eixo: 'Normal', pr: 'Normal e constante',
    qrs: 'Estreito', stt: 'Sem alterações agudas', conclusao: 'Bradicardia sinusal'},
  criterios: ['Ritmo sinusal com FC < 50 bpm', 'Relação P:QRS de 1:1 mantida, PR constante'],
  pegadinha: 'Bradicardia sinusal ≠ bloqueio. Se cada P é seguida de QRS com PR fixo, a condução AV está preservada.',
  conduta: 'Assintomático: observar. Instável (hipotensão, síncope, isquemia): atropina 1 mg IV; considerar causas — betabloqueador, hipotireoidismo, hipertonia vagal, IAM inferior.',
  confunde: ['bavt', 'bav1', 'mobitz2']
},
{
  id: 'taqui_sinusal', nome: 'Taquicardia sinusal', cat: 'base', nivel: 1, view: DIIS,
  build: () => B(125, {seed: 31}),
  laudo: {ritmo: 'Sinusal', fc: '≈ 125 bpm', eixo: 'Normal', pr: 'Normal (pode encurtar com a FC)',
    qrs: 'Estreito', stt: 'Pode haver infra de ST ascendente por taquicardia', conclusao: 'Taquicardia sinusal'},
  criterios: ['FC > 100 bpm com onda P sinusal visível antes de cada QRS', 'Início e término graduais (diferente da TSV)'],
  pegadinha: 'Taquicardia sinusal é quase sempre SINTOMA, não doença: febre, dor, hipovolemia, anemia, TEP, sepse, hipertireoidismo, abstinência. Procure a causa.',
  conduta: 'Tratar a causa. Não cardioverter.',
  confunde: ['tsv', 'flutter']
},

/* ============================ RITMO ============================ */
{
  id: 'fa', nome: 'Fibrilação atrial', cat: 'ritmo', nivel: 2, view: D2V1, emerg: false,
  build: () => { const r = ritmoIrregular(105, 10, {seed: 41});
    return {dur: 10, seed: 41, beats: r.beats, atrial: r.atrial, global: {}, leadMods: {}}; },
  laudo: {ritmo: 'Fibrilação atrial', fc: '≈ 100–110 bpm (resposta ventricular)', eixo: 'Normal',
    pr: 'Não mensurável — não há onda P', qrs: 'Estreito',
    stt: 'Sem supra de ST', conclusao: 'Fibrilação atrial de alta resposta ventricular'},
  criterios: ['Ritmo irregularmente irregular (RR sem nenhum padrão)',
    'Ausência de onda P — ondas f finas, melhor vistas em V1',
    'QRS estreito (salvo bloqueio de ramo associado)'],
  pegadinha: 'O sinal mais confiável é a IRREGULARIDADE DO RR, não a "ausência de P" — artefato e ondas f podem enganar. Meça 3–4 intervalos RR seguidos.',
  conduta: 'Instável → cardioversão elétrica sincronizada. Estável → controle de FC (betabloqueador / diltiazem) + anticoagulação por CHA₂DS₂-VASc. FA > 48 h sem anticoagulação: não reverter sem ETE ou 3 semanas de anticoagulação.',
  confunde: ['flutter', 'taqui_sinusal', 'essv']
},
{
  id: 'flutter', nome: 'Flutter atrial (condução 2:1)', cat: 'ritmo', nivel: 2, view: D2V1,
  build: () => { const beats = []; for (let t = 0.5; t < 9.6; t += 0.40) beats.push({t: t});
    return {dur: 10, seed: 42, beats: beats, atrial: {mode: 'flutter', rate: 300, amp: 0.22}, global: {}, leadMods: {}}; },
  laudo: {ritmo: 'Flutter atrial com condução 2:1', fc: 'Ventricular ≈ 150 bpm / atrial ≈ 300 bpm',
    eixo: 'Normal', pr: 'Não se aplica', qrs: 'Estreito',
    stt: 'As ondas F deformam o segmento ST — cuidado ao interpretar', conclusao: 'Flutter atrial 2:1'},
  criterios: ['Ondas F em "dentes de serra", melhor vistas em DII, DIII, aVF e V1',
    'Frequência atrial ≈ 300 bpm; ventricular regular ≈ 150 bpm (2:1)',
    'Ritmo REGULAR (ao contrário da FA)'],
  pegadinha: 'Toda taquicardia regular de QRS estreito a ~150 bpm é flutter 2:1 até prova em contrário. Manobra vagal ou adenosina aumenta o bloqueio AV e desmascara as ondas F.',
  conduta: 'Mesma lógica da FA: instável → cardioversão (responde a baixa energia, 50 J). Estável → controle de FC + anticoagulação. Ablação do istmo cavotricuspídeo é curativa.',
  confunde: ['fa', 'tsv', 'taqui_sinusal']
},
{
  id: 'tsv', nome: 'Taquicardia supraventricular paroxística (TRN)', cat: 'ritmo', nivel: 2, view: D2V1, emerg: true,
  build: () => B(188, {seed: 43, pr: 0.10}, {}, ml({'DII,DIII,aVF': {s: 0.28}}),
    {atrial: {mode: 'none'}}),
  laudo: {ritmo: 'Taquicardia regular de QRS estreito, sem onda P identificável',
    fc: '≈ 190 bpm', eixo: 'Normal', pr: 'Não mensurável',
    qrs: 'Estreito, regular', stt: 'Pode haver infra de ST secundário (não significa isquemia)',
    conclusao: 'Taquicardia supraventricular paroxística'},
  criterios: ['FC 150–250 bpm, QRS estreito, RR perfeitamente regular',
    'Onda P ausente ou retrógrada (pseudo-S em DII/DIII/aVF, pseudo-r\' em V1)',
    'Início e término SÚBITOS'],
  pegadinha: 'Infra de ST durante TSV é achado secundário e frequente — não faça diagnóstico de isquemia com o paciente taquicárdico. Reavalie após reverter.',
  conduta: 'Instável → cardioversão sincronizada. Estável → manobra vagal (Valsalva modificada) → adenosina 6 mg IV em bolus rápido, depois 12 mg.',
  confunde: ['flutter', 'taqui_sinusal', 'tv']
},
{
  id: 'tv', nome: 'Taquicardia ventricular monomórfica', cat: 'ritmo', nivel: 3, view: D2V1, emerg: true,
  build: () => { const beats = []; for (let t = 0.4; t < 9.7; t += 0.355) beats.push({t: t, kind: 'v'});
    const p = []; for (let t = 0.2; t < 9.8; t += 0.78) p.push(t);
    return {dur: 10, seed: 44, beats: beats, atrial: {mode: 'sinus', list: p, ampScale: 0.55},
      global: {qrsDur: 0.16, tAmp: -0.4}, leadMods: {}}; },
  laudo: {ritmo: 'Taquicardia regular de QRS largo, monomórfica', fc: '≈ 170 bpm',
    eixo: 'Frequentemente bizarro', pr: 'Não mensurável — dissociação AV',
    qrs: '> 140 ms, morfologia única', stt: 'Alterações secundárias, T oposta ao QRS',
    conclusao: 'Taquicardia ventricular monomórfica sustentada'},
  criterios: ['FC > 100 bpm com QRS ≥ 120 ms (geralmente > 140 ms), regular e monomórfico',
    'Dissociação AV: ondas P marchando independentes do QRS',
    'Batimentos de captura e de fusão (patognomônicos)',
    'Concordância no precórdio (todos QRS positivos ou todos negativos de V1 a V6)'],
  pegadinha: 'TAQUICARDIA DE QRS LARGO = TV ATÉ PROVA EM CONTRÁRIO, principalmente se há cardiopatia estrutural ou IAM prévio. Tratar como TSV com aberrância e errar mata o paciente. Verapamil em TV é erro grave.',
  conduta: 'Sem pulso → desfibrilação (protocolo de PCR). Com pulso instável → cardioversão sincronizada. Com pulso estável → amiodarona 150 mg IV em 10 min (ou procainamida). Corrigir K⁺ e Mg²⁺.',
  confunde: ['tsv', 'bre', 'torsades']
},
{
  id: 'torsades', nome: 'Torsades de pointes', cat: 'ritmo', nivel: 3, view: DIIS, emerg: true,
  build: () => { const beats = []; let i = 0;
    for (let t = 0.4; t < 9.7; t += 0.22 + 0.03 * Math.sin(i * 0.7)){
      beats.push({t: t, kind: 'v', mods: {gain: Math.sin(i * 0.42) * 1.05}}); i++; }
    return {dur: 10, seed: 45, beats: beats, atrial: {mode: 'none'}, global: {qrsDur: 0.15, tAmp: 0}, leadMods: {}, noise: 0.02}; },
  laudo: {ritmo: 'Taquicardia ventricular polimórfica', fc: '≈ 240 bpm',
    eixo: 'Indeterminado', pr: 'Não aplicável',
    qrs: 'Largo, com amplitude e polaridade que giram em torno da linha de base',
    stt: 'Não avaliável', conclusao: 'Torsades de pointes (TV polimórfica com QT longo)'},
  criterios: ['TV polimórfica em que os QRS "torcem" em torno da linha isoelétrica',
    'Ocorre sobre QT longo de base', 'Costuma ser autolimitada, mas degenera em FV'],
  pegadinha: 'O tratamento NÃO é amiodarona (que prolonga o QT e piora). É sulfato de magnésio.',
  conduta: 'Sulfato de magnésio 1–2 g IV, mesmo com magnesemia normal. Instável/sem pulso → desfibrilação. Suspender drogas que alargam QT; corrigir K⁺ e Mg²⁺; considerar marca-passo/isoproterenol (overdrive) na forma bradicardia-dependente.',
  confunde: ['tv', 'fv', 'qt_longo']
},
{
  id: 'fv', nome: 'Fibrilação ventricular', cat: 'ritmo', nivel: 3, view: DIIS, emerg: true,
  build: () => { const beats = []; const R = rng(9); let t = 0.3;
    while (t < 9.8){ beats.push({t: t, kind: 'v', qrsDur: 0.09 + R() * 0.09,
      mods: {gain: (R() - 0.45) * 1.6, tAmp: 0}}); t += 0.12 + R() * 0.10; }
    return {dur: 10, seed: 46, beats: beats, atrial: {mode: 'none'}, global: {tAmp: 0}, leadMods: {}, noise: 0.05, wander: 0.06}; },
  laudo: {ritmo: 'Caótico, sem complexos identificáveis', fc: 'Não mensurável',
    eixo: '—', pr: '—', qrs: 'Não identificável', stt: '—',
    conclusao: 'Fibrilação ventricular — ritmo de parada cardiorrespiratória'},
  criterios: ['Ondulações caóticas, irregulares, sem QRS, ST ou T identificáveis',
    'Sempre paciente sem pulso — confirme o paciente, não só o monitor'],
  pegadinha: 'Antes de chocar, olhe o paciente: eletrodo solto e tremor/artefato imitam FV. Mas nunca atrase o choque em PCR confirmada.',
  conduta: 'DESFIBRILAÇÃO IMEDIATA + RCP de alta qualidade. Adrenalina 1 mg a cada 3–5 min; amiodarona 300 mg após o 3º choque.',
  confunde: ['torsades', 'tv']
},
{
  id: 'assistolia', nome: 'Assistolia', cat: 'ritmo', nivel: 1, view: DIIS, emerg: true,
  build: () => ({dur: 10, seed: 71, beats: [], atrial: {mode: 'none'}, global: {}, leadMods: {}, noise: 0.015, wander: 0.03}),
  laudo: {ritmo: 'Sem atividade elétrica ventricular', fc: '0 bpm', eixo: '—', pr: '—', qrs: 'Ausente', stt: '—',
    conclusao: 'Assistolia — ritmo de parada não chocável'},
  criterios: ['Linha praticamente reta, sem complexos QRS',
    'Sempre paciente sem pulso: ritmo de parada não chocável',
    'Antes de concluir, confira cabos e eletrodos, o ganho e outra derivação: desconexão e ganho baixo também dão linha reta'],
  pegadinha: 'Linha reta pode ser eletrodo solto ou ganho baixo: confira as conexões e outra derivação sem interromper a RCP. Assistolia não se trata com choque nem com marca-passo.',
  conduta: 'RCP de alta qualidade e adrenalina 1 mg IV/IO o quanto antes, repetida a cada 3–5 min. Não chocar. Considerar via aérea avançada com capnografia e buscar causas reversíveis (5 Hs e 5 Ts).',
  confunde: ['fv', 'aesp']
},
{
  /* AESP é diagnóstico clínico (ritmo organizado sem pulso): fica fora do quiz de diagnóstico, do laudo sintético e do simulado. */
  id: 'aesp', nome: 'Atividade elétrica sem pulso (AESP)', cat: 'ritmo', nivel: 2, view: DIIS, emerg: true, semQuiz: true,
  build: () => { const beats = []; for (let t = 0.6; t < 9.6; t += 1.4) beats.push({t: t, kind: 'v', qrsDur: 0.14, mods: {tAmp: -0.3}});
    return {dur: 10, seed: 72, beats: beats, atrial: {mode: 'none'}, global: {qrsDur: 0.14}, leadMods: {}, noise: 0.02, wander: 0.04}; },
  laudo: {ritmo: 'Organizado (neste exemplo, complexos largos e lentos, sem onda P)', fc: '≈ 43 bpm', eixo: '—', pr: 'Sem onda P',
    qrs: 'Largo', stt: '—', conclusao: 'Ritmo organizado em paciente sem pulso = AESP. O diagnóstico é clínico: o mesmo traçado com pulso não é AESP.'},
  criterios: ['Qualquer ritmo organizado no monitor (estreito ou largo, lento ou rápido) em paciente sem pulso palpável',
    'O ECG sozinho não faz o diagnóstico: é preciso checar o pulso',
    'Ritmo de parada não chocável'],
  pegadinha: 'O monitor parece mostrar um ritmo e a equipe relaxa. Cheque o pulso em toda pausa para análise do ritmo. Uma elevação abrupta da capnografia durante as compressões sugere retorno da circulação.',
  conduta: 'RCP de alta qualidade e adrenalina 1 mg IV/IO o quanto antes, repetida a cada 3–5 min. Não chocar. O ponto central é tratar a causa reversível (5 Hs e 5 Ts): hipovolemia, hipóxia, acidose, hipo/hipercalemia, hipotermia, pneumotórax hipertensivo, tamponamento, tóxicos, trombose pulmonar e trombose coronária.',
  confunde: ['riva', 'assistolia']
},
{
  id: 'esv', nome: 'Extrassístole ventricular (ESV)', cat: 'ritmo', nivel: 1, view: DIIS,
  build: () => { const rr = 0.83, beats = [], p = []; let t = 0.45, i = 0;
    while (t < 9.6){
      if (i === 3 || i === 8){
        beats.push({t: t - 0.30, kind: 'v', mods: {tAmp: -0.5}});
        p.push(t - 0.16);            // P sinusal que segue marchando (escondida)
        beats.push({t: t + rr, });   // pausa compensatória completa
        p.push(t + rr - 0.16);
        t += 2 * rr; i += 2;
      } else { beats.push({t: t}); p.push(t - 0.16); t += rr; i++; }
    }
    return {dur: 10, seed: 47, beats: beats, atrial: {mode: 'sinus', list: p}, global: {pr: 0.16}, leadMods: {}}; },
  laudo: {ritmo: 'Sinusal com extrassístoles ventriculares isoladas', fc: '≈ 70 bpm',
    eixo: 'Normal nos batimentos sinusais', pr: 'Normal nos sinusais',
    qrs: 'Estreito nos sinusais; complexos largos e precoces, sem P precedente, com T oposta',
    stt: 'Normal nos batimentos sinusais', conclusao: 'Ritmo sinusal com ESV isoladas e pausa compensatória'},
  criterios: ['QRS largo e PRECOCE, sem onda P precedente', 'Onda T em direção OPOSTA ao QRS',
    'Pausa compensatória COMPLETA (o RR que engloba a ESV = 2 RR normais)'],
  pegadinha: 'ESV isolada em coração normal é benigna. Investigue se: > 10 000/24 h, polimórficas, em salvas, fenômeno R-sobre-T, ou associadas a síncope/cardiopatia.',
  conduta: 'Assintomático e coração normal: tranquilizar, reduzir cafeína/álcool, corrigir K⁺/Mg²⁺. Sintomático: betabloqueador.',
  confunde: ['essv', 'mobitz2', 'tv']
},
{
  id: 'essv', nome: 'Extrassístole supraventricular (ESSV)', cat: 'ritmo', nivel: 1, view: DIIS,
  build: () => { const rr = 0.85, beats = [], p = []; let t = 0.45, i = 0;
    while (t < 9.5){
      if (i === 3 || i === 8){
        beats.push({t: t - 0.30}); p.push(t - 0.30 - 0.13);  // P prematura, morfologia diferente
        t += rr * 0.72; i++;                                  // pausa NÃO compensatória
      } else { beats.push({t: t}); p.push(t - 0.16); t += rr; i++; }
    }
    return {dur: 10, seed: 48, beats: beats, atrial: {mode: 'sinus', list: p}, global: {pr: 0.16}, leadMods: {}}; },
  laudo: {ritmo: 'Sinusal com extrassístoles supraventriculares', fc: '≈ 72 bpm',
    eixo: 'Normal', pr: 'Normal nos sinusais; PR da extrassístole pode variar',
    qrs: 'ESTREITO também no batimento prematuro', stt: 'Sem alterações',
    conclusao: 'Ritmo sinusal com ESSV isoladas e pausa não compensatória'},
  criterios: ['Batimento PRECOCE com QRS ESTREITO', 'Onda P prematura, diferente da sinusal',
    'Pausa NÃO compensatória (o átrio é resetado)'],
  pegadinha: 'A diferença ESSV × ESV é a largura do QRS + presença de P prematura. A diferença na pausa (não compensatória × compensatória) é o segundo pilar.',
  conduta: 'Benigna na maioria. ESSV frequentes podem preceder FA.',
  confunde: ['esv', 'fa']
},
{
  id: 'mp', nome: 'Ritmo de marca-passo ventricular', cat: 'ritmo', nivel: 2, view: D2V1,
  build: () => B(72, {seed: 49}, {shape: 'ventricular', qrsDur: 0.16, spike: true, tAmp: -0.4},
    {}, {atrial: {mode: 'none'}}),
  laudo: {ritmo: 'Ritmo de marca-passo ventricular', fc: '≈ 72 bpm (frequência programada)',
    eixo: 'Desviado (padrão de estimulação)', pr: 'Não aplicável',
    qrs: 'Largo, precedido de espícula; padrão de BRE quando o eletrodo está no VD',
    stt: 'Alterações secundárias — T oposta ao QRS', conclusao: 'Ritmo de marca-passo ventricular com captura adequada'},
  criterios: ['Espícula (deflexão estreita e vertical) precedendo o QRS',
    'QRS largo com morfologia de BRE (eletrodo em ápice de VD)',
    'Captura: toda espícula é seguida de QRS'],
  pegadinha: 'Marca-passo de VD produz padrão de BRE — a análise de isquemia exige critérios de Sgarbossa, exatamente como no BRE.',
  conduta: 'Avaliar falha de captura (espícula sem QRS) ou de sensing.',
  confunde: ['bre', 'tv']
},

/* ============================ CONDUÇÃO ============================ */
{
  id: 'bav1', nome: 'BAV de 1º grau', cat: 'conducao', nivel: 1, view: DIIS,
  build: () => B(66, {seed: 51, pr: 0.30}),
  laudo: {ritmo: 'Sinusal', fc: '≈ 66 bpm', eixo: 'Normal',
    pr: '≈ 300 ms — PROLONGADO e CONSTANTE', qrs: 'Estreito',
    stt: 'Sem alterações', conclusao: 'Ritmo sinusal com BAV de 1º grau'},
  criterios: ['PR > 200 ms, CONSTANTE', 'Toda onda P conduz — nenhum batimento é perdido'],
  pegadinha: 'Não é bloqueio de verdade, é atraso. Só vira problema se PR muito longo (> 300 ms) com sintomas.',
  conduta: 'Nenhuma na maioria. Revisar drogas nodais (betabloqueador, digital, diltiazem).',
  confunde: ['mobitz1', 'mobitz2', 'sinusal']
},
{
  id: 'mobitz1', nome: 'BAV de 2º grau Mobitz I (Wenckebach)', cat: 'conducao', nivel: 2, view: DIIS,
  build: () => { const pp = 0.80, prs = [0.18, 0.26, 0.36], beats = [], p = [];
    let t = 0.5, k = 0;
    while (t < 9.6){
      p.push(t);
      if (k < 3) beats.push({t: t + prs[k]});
      k = (k + 1) % 4;   // a 4ª P é bloqueada
      t += pp;
    }
    return {dur: 10, seed: 52, beats: beats, atrial: {mode: 'sinus', list: p}, global: {pr: 0.18}, leadMods: {}}; },
  laudo: {ritmo: 'Sinusal com BAV de 2º grau Mobitz I', fc: '≈ 56 bpm (ventricular)',
    eixo: 'Normal', pr: 'PROGRESSIVAMENTE MAIOR até uma P bloqueada; reinicia curto após a pausa',
    qrs: 'Estreito (bloqueio suprahissiano)', stt: 'Sem alterações',
    conclusao: 'BAV de 2º grau Mobitz I (fenômeno de Wenckebach), condução 4:3'},
  criterios: ['PR aumenta progressivamente até uma onda P NÃO conduzir',
    'O intervalo RR vai ENCURTANDO antes da pausa', 'A pausa é menor que 2 intervalos PP',
    'QRS geralmente estreito — bloqueio no nó AV'],
  pegadinha: 'Agrupamento de batimentos ("group beating") no traçado = pense Wenckebach. Meça o PR do primeiro batimento depois da pausa: ele é o mais CURTO de todos.',
  conduta: 'Benigno na maioria; frequentemente vagal ou por drogas. Só marca-passo se sintomático.',
  confunde: ['mobitz2', 'bav1', 'bavt']
},
{
  id: 'mobitz2', nome: 'BAV de 2º grau Mobitz II', cat: 'conducao', nivel: 3, view: DIIS, emerg: true,
  build: () => { const pp = 0.80, beats = [], p = []; let t = 0.5, k = 0;
    while (t < 9.6){ p.push(t); if (k < 2) beats.push({t: t + 0.20}); k = (k + 1) % 3; t += pp; }
    return {dur: 10, seed: 53, beats: beats, atrial: {mode: 'sinus', list: p},
      global: {pr: 0.20, qrsDur: 0.13, shape: 'brd'}, leadMods: {}}; },
  laudo: {ritmo: 'Sinusal com BAV de 2º grau Mobitz II, condução 3:2', fc: '≈ 50 bpm (ventricular)',
    eixo: 'Normal', pr: 'FIXO nos batimentos conduzidos (200 ms)',
    qrs: 'Alargado (130 ms) — sugere bloqueio infrahissiano',
    stt: 'Alterações secundárias ao distúrbio de condução',
    conclusao: 'BAV de 2º grau Mobitz II — indicação de marca-passo'},
  criterios: ['PR CONSTANTE nos batimentos conduzidos', 'Falha SÚBITA de condução de uma onda P, sem aviso prévio',
    'QRS frequentemente alargado (lesão abaixo do nó AV)'],
  pegadinha: 'Mobitz II é o perigoso: evolui para BAVT sem aviso. Mobitz I = observar; Mobitz II = marca-passo. Não confunda os dois — é a pegadinha clássica de prova.',
  conduta: 'Monitorização + marca-passo transcutâneo disponível → marca-passo definitivo. Atropina pode PIORAR (aumenta a frequência atrial sem melhorar a condução infrahissiana).',
  confunde: ['mobitz1', 'bavt', 'bav1']
},
{
  id: 'bavt', nome: 'BAV total (BAV de 3º grau)', cat: 'conducao', nivel: 3, view: DIIS, emerg: true,
  build: () => { const beats = [], p = [];
    for (let t = 0.30; t < 9.9; t += 0.72) p.push(t);
    for (let t = 0.55; t < 9.7; t += 1.62) beats.push({t: t, kind: 'v', mods: {tAmp: -0.35}});
    return {dur: 10, seed: 54, beats: beats, atrial: {mode: 'sinus', list: p}, global: {qrsDur: 0.15}, leadMods: {}}; },
  laudo: {ritmo: 'Dissociação atrioventricular completa', fc: 'Atrial ≈ 83 bpm / ventricular ≈ 37 bpm',
    eixo: 'Do ritmo de escape', pr: 'VARIÁVEL — não há relação entre P e QRS',
    qrs: 'Largo (escape ventricular)', stt: 'Alterações secundárias',
    conclusao: 'BAV total com ritmo de escape ventricular — indicação de marca-passo'},
  criterios: ['Ondas P e QRS completamente DISSOCIADOS, cada um em seu ritmo regular',
    'Frequência atrial > frequência ventricular', 'PP regular e RR regular, mas sem relação entre si',
    'Escape juncional (QRS estreito, 40–60 bpm) ou ventricular (QRS largo, 20–40 bpm)'],
  pegadinha: 'A chave é: PP regular + RR regular + nenhuma relação entre eles. Marque as P com o compasso — várias caem dentro do QRS ou da T.',
  conduta: 'Marca-passo transcutâneo → transvenoso → definitivo. Atropina raramente ajuda. Procure causa reversível: IAM inferior, hipercalemia, drogas nodais, doença de Lyme, Chagas.',
  confunde: ['mobitz2', 'brady_sinusal', 'mobitz1']
},
{
  id: 'brd', nome: 'Bloqueio de ramo direito (BRD)', cat: 'conducao', nivel: 2, view: V12,
  build: () => B(74, {seed: 55}, {shape: 'brd', qrsDur: 0.14},
    ml({'V1,V2': {tAmp: -0.35, st: -0.06}, 'DI,V6': {tAmp: 0.2}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 74 bpm', eixo: 'Normal', pr: 'Normal',
    qrs: '140 ms com padrão rSR\' em V1–V2 e onda S alargada em DI, aVL, V5 e V6',
    stt: 'Alteração SECUNDÁRIA de repolarização em V1–V3 (T negativa)',
    conclusao: 'Ritmo sinusal com bloqueio completo de ramo direito'},
  criterios: ['QRS ≥ 120 ms', 'Padrão rSR\' ("orelha de coelho") em V1–V2',
    'Onda S alargada e empastada em DI, aVL, V5 e V6',
    'T negativa em V1–V3 (alteração secundária — normal no BRD)'],
  pegadinha: 'No BRD a T negativa em V1–V3 é ESPERADA. Não chame de isquemia. Diferente do BRE, o BRD NÃO impede a análise do supra de ST.',
  conduta: 'Isolado em jovem assintomático: pode ser normal. BRD novo + dor torácica/dispneia: pense TEP e IAM.',
  confunde: ['bre', 'brugada', 'tep']
},
{
  id: 'bre', nome: 'Bloqueio de ramo esquerdo (BRE)', cat: 'conducao', nivel: 3, view: V12, emerg: false,
  build: () => B(76, {seed: 56}, {shape: 'bre', qrsDur: 0.15},
    ml({'V1,V2,V3': {st: 0.14, stCurv: -0.05, tAmp: 0.35},
        'DI,aVL,V5,V6': {st: -0.10, tAmp: -0.35}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 76 bpm', eixo: 'Normal a desviado à esquerda', pr: 'Normal',
    qrs: '150 ms, com R alargada e entalhada em DI, aVL, V5 e V6, e padrão QS/rS em V1–V3',
    stt: 'Discordância apropriada — ST e T em direção oposta ao QRS',
    conclusao: 'Ritmo sinusal com bloqueio completo de ramo esquerdo'},
  criterios: ['QRS ≥ 120 ms', 'R alargada, entalhada, sem onda q, em DI, aVL, V5 e V6',
    'QS ou rS em V1–V3', 'Discordância apropriada de ST-T (ST e T opostos ao QRS)'],
  pegadinha: 'BRE mascara a análise de isquemia. BRE NOVO + dor torácica = tratar como IAM. Para diagnosticar IAM em BRE preexistente, use SGARBOSSA MODIFICADO: (1) supra concordante ≥ 1 mm; (2) infra concordante ≥ 1 mm em V1–V3; (3) razão ST/S ≤ −0,25 em qualquer derivação.',
  conduta: 'BRE novo com clínica de SCA: acionar hemodinâmica. BRE crônico: investigar cardiopatia estrutural (ecocardiograma).',
  confunde: ['brd', 'mp', 'sgarbossa']
},
{
  id: 'sgarbossa', nome: 'IAM em vigência de BRE (Sgarbossa positivo)', cat: 'isquemia', nivel: 3, view: V12, emerg: true,
  build: () => B(88, {seed: 57}, {shape: 'bre', qrsDur: 0.15},
    ml({'V1,V2,V3': {st: 0.16, stCurv: -0.04, tAmp: 0.35},
        'DI,aVL': {st: -0.08, tAmp: -0.3},
        'V5,V6': {st: 0.28, stCurv: 0.10, tAmp: 0.45},
        'DII,aVF': {st: 0.24, stCurv: 0.10, tAmp: 0.4}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 88 bpm', eixo: 'Desviado à esquerda', pr: 'Normal',
    qrs: '150 ms com padrão de BRE',
    stt: 'Supra de ST CONCORDANTE (mesma direção do QRS positivo) ≥ 1 mm em V5, V6, DII e aVF',
    conclusao: 'BRE com critérios de Sgarbossa positivos — IAM com supra de ST equivalente'},
  criterios: ['Sgarbossa modificado (Smith): supra CONCORDANTE ≥ 1 mm (5 pontos)',
    'Infra CONCORDANTE ≥ 1 mm em V1–V3 (3 pontos)',
    'Supra DISCORDANTE excessivo: razão ST/S ≤ −0,25 (substituiu o critério original de 5 mm)',
    '≥ 3 pontos = alta especificidade para oclusão coronariana'],
  pegadinha: 'Concordante = ST desviado NO MESMO SENTIDO do QRS. Essa é a única alteração que nunca é explicada pelo próprio BRE.',
  conduta: 'Tratar como IAMCSST: reperfusão imediata (angioplastia primária ou trombólise).',
  confunde: ['bre', 'iam_anterior', 'mp']
},
{
  id: 'hbae', nome: 'Bloqueio divisional anterossuperior (HBAE)', cat: 'conducao', nivel: 2, view: V12,
  build: () => B(70, {seed: 58}, {qrsDur: 0.10},
    ml({'DI': {q: 0.08, r: 0.95, s: 0.03}, 'aVL': {q: 0.10, r: 0.85, s: 0.02},
        'DII': {q: 0, r: 0.18, s: 0.95}, 'DIII': {q: 0, r: 0.12, s: 1.15},
        'aVF': {q: 0, r: 0.15, s: 1.05}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 70 bpm',
    eixo: 'DESVIADO À ESQUERDA (≈ −60°): QRS positivo em DI, negativo em DII e aVF',
    pr: 'Normal', qrs: '100 ms (não alarga significativamente); qR em DI/aVL, rS em DII/DIII/aVF',
    stt: 'Sem alterações primárias', conclusao: 'Ritmo sinusal com bloqueio divisional anterossuperior esquerdo'},
  criterios: ['Eixo entre −45° e −90°', 'qR em DI e aVL', 'rS em DII, DIII e aVF',
    'QRS < 120 ms (não é bloqueio de ramo)'],
  pegadinha: 'HBAE é a causa mais comum de desvio do eixo para a esquerda. HBAE + BRD = bloqueio bifascicular (atenção em Chagas).',
  conduta: 'Isolado: sem tratamento. Bifascicular + síncope: investigar necessidade de marca-passo.',
  confunde: ['sinusal', 'brd', 'hve']
},
{
  id: 'wpw', nome: 'Pré-excitação ventricular (Wolff-Parkinson-White)', cat: 'conducao', nivel: 3, view: V12,
  build: () => B(76, {seed: 59, pr: 0.09}, {shape: 'wpw', qrsDur: 0.14},
    ml({'V1,V2,V3': {tAmp: -0.25}, 'DI,V5,V6': {tAmp: -0.2, st: -0.08}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 76 bpm', eixo: 'Pode estar desviado',
    pr: 'CURTO (< 120 ms)', qrs: 'Alargado por ONDA DELTA — empastamento da porção inicial',
    stt: 'Alterações secundárias de repolarização',
    conclusao: 'Ritmo sinusal com padrão de pré-excitação ventricular (WPW)'},
  criterios: ['PR curto < 120 ms', 'Onda delta: empastamento da porção INICIAL do QRS',
    'QRS alargado (> 110 ms)', 'Alterações secundárias de ST-T'],
  pegadinha: 'FA em paciente com WPW (QRS largo, irregular e MUITO rápido, > 200 bpm): NÃO use adenosina, verapamil, diltiazem, betabloqueador ou digoxina — bloqueiam o nó AV e jogam todos os estímulos pela via acessória, degenerando em FV. Use procainamida ou cardioversão elétrica.',
  conduta: 'Assintomático: acompanhamento. Sintomático (taquicardias): ablação da via acessória.',
  confunde: ['bre', 'brd', 'iam_inferior']
},

/* ============================ ISQUEMIA ============================ */
{
  id: 'iam_anterior', nome: 'IAM com supra de ST — parede anterior extensa', cat: 'isquemia', nivel: 3, view: V12, emerg: true,
  build: () => B(96, {seed: 61}, {},
    ml({'V1': {r: 0.05, q: 0.20, st: 0.28, stCurv: 0.12, tAmp: 0.55},
        'V2': {r: 0.06, q: 0.30, st: 0.48, stCurv: 0.16, tAmp: 0.85},
        'V3': {r: 0.10, q: 0.35, st: 0.50, stCurv: 0.16, tAmp: 0.85},
        'V4': {r: 0.35, q: 0.30, st: 0.38, stCurv: 0.12, tAmp: 0.70},
        'V5': {r: 0.90, q: 0.15, st: 0.20, stCurv: 0.08, tAmp: 0.45},
        'V6': {st: 0.10, tAmp: 0.30},
        'DI,aVL': {st: 0.14, stCurv: 0.06, tAmp: 0.28},
        'DII,DIII,aVF': {st: -0.14, stCurv: -0.04, tAmp: 0.05}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 96 bpm', eixo: 'Normal', pr: 'Normal',
    qrs: 'Perda de progressão de R com ondas Q em V1–V4',
    stt: 'Supra de ST convexo de 3–5 mm em V1–V5, DI e aVL, com infra recíproco na parede inferior',
    conclusao: 'IAM com supradesnivelamento de ST de parede anterior extensa — provável oclusão proximal da artéria descendente anterior'},
  criterios: ['Supra de ST em derivações CONTÍGUAS de V1 a V4 (anterior), ± V5–V6/DI/aVL (extensa)',
    'Ponto de corte: ≥ 1 mm em duas contíguas; em V2–V3, ≥ 2 mm (homens ≥ 40 a), ≥ 2,5 mm (homens < 40 a) e ≥ 1,5 mm (mulheres)',
    'Supra CONVEXO ("em abóbada"), com imagem recíproca (infra) na parede oposta',
    'Onda Q patológica: ≥ 40 ms de duração OU > 25% da altura da R'],
  pegadinha: 'Infra de ST recíproco na parede inferior é o achado que mais confirma que o supra é isquêmico (e não pericardite ou repolarização precoce). Sempre procure a imagem em espelho.',
  conduta: 'Angioplastia primária em até 90–120 min; se indisponível, trombólise em até 30 min (delta ≤ 12 h). AAS 300 mg + segundo antiagregante + anticoagulação. Anterior extenso = maior risco de choque cardiogênico.',
  confunde: ['pericardite', 'repol_precoce', 'bre', 'dewinter']
},
{
  id: 'iam_inferior', nome: 'IAM com supra de ST — parede inferior', cat: 'isquemia', nivel: 3, view: V12, emerg: true,
  build: () => B(58, {seed: 62}, {},
    ml({'DII': {q: 0.18, st: 0.32, stCurv: 0.12, tAmp: 0.45},
        'DIII': {q: 0.25, st: 0.42, stCurv: 0.14, tAmp: 0.45, r: 0.30},
        'aVF': {q: 0.20, st: 0.36, stCurv: 0.12, tAmp: 0.42},
        'DI': {st: -0.16, stCurv: -0.04, tAmp: -0.12},
        'aVL': {st: -0.20, stCurv: -0.05, tAmp: -0.18},
        'V1,V2': {st: -0.08}})),
  laudo: {ritmo: 'Sinusal, bradicárdico', fc: '≈ 58 bpm', eixo: 'Normal', pr: 'Normal',
    qrs: 'Ondas Q em DII, DIII e aVF',
    stt: 'Supra de ST em DII, DIII e aVF (DIII > DII), com infra recíproco em DI e aVL',
    conclusao: 'IAM com supra de ST de parede inferior — provável oclusão da coronária direita'},
  criterios: ['Supra em DII, DIII e aVF', 'Infra recíproco em DI e aVL (praticamente obrigatório)',
    'Supra em DIII > DII e infra em DI sugerem coronária DIREITA; DII ≥ DIII sugere circunflexa',
    'SEMPRE pedir V3R–V4R (ventrículo direito) e V7–V9 (parede posterior)'],
  pegadinha: 'IAM inferior com acometimento de VD: o paciente é PRÉ-CARGA-DEPENDENTE. Nitrato e morfina podem causar hipotensão grave. Faça VOLUME. Bradicardia e BAV são comuns (nó AV irrigado pela CD).',
  conduta: 'Reperfusão imediata. Pedir V4R em TODO IAM inferior. Se VD acometido: volume, evitar nitrato/diurético.',
  confunde: ['iam_lateral', 'pericardite', 'iam_posterior', 'iam_vd']
},
{
  id: 'iam_vd', nome: 'IAM inferior com extensão para o ventrículo direito', cat: 'isquemia', nivel: 3, emerg: true,
  // O ECG inicial é o de 12 derivações; V3R/V4R aparecem quando o usuário pede, como no plantão.
  view: V12,
  extraView: {label: 'Pedir V3R e V4R', view: {layout: 'stack', leads: ['DII', 'DIII', 'aVF', 'V3R', 'V4R'], seconds: 5, rowMm: 26}},
  build: () => B(52, {seed: 63}, {},
    ml({'DII': {q: 0.16, st: 0.28, stCurv: 0.10, tAmp: 0.4},
        'DIII': {q: 0.24, st: 0.40, stCurv: 0.12, tAmp: 0.4, r: 0.28},
        'aVF': {q: 0.18, st: 0.32, stCurv: 0.10, tAmp: 0.4},
        'V3R': {st: 0.16, stCurv: 0.06, tAmp: 0.2},
        'V4R': {st: 0.22, stCurv: 0.08, tAmp: 0.25},
        'DI,aVL': {st: -0.16, tAmp: -0.15}})),
  laudo: {ritmo: 'Sinusal, bradicárdico', fc: '≈ 52 bpm', eixo: 'Normal', pr: 'Normal',
    qrs: 'Q em DII, DIII e aVF', stt: 'Supra inferior + supra ≥ 1 mm em V3R e V4R',
    conclusao: 'IAM inferior com extensão para ventrículo direito'},
  criterios: ['Supra ≥ 0,5–1 mm em V4R (o critério mais sensível e específico)',
    'Contexto: sempre em IAM inferior', 'Tríade clínica: hipotensão + turgência jugular + ausculta pulmonar limpa'],
  pegadinha: 'É a pegadinha mais cobrada em prova: paciente com IAM inferior que hipotende após NITRATO. Nunca dê nitrato/morfina/diurético antes de descartar VD. O tratamento da hipotensão é VOLUME.',
  conduta: 'Volume (SF 0,9%) + reperfusão. Evitar vasodilatadores. Se persistir hipotenso: dobutamina.',
  confunde: ['iam_inferior', 'iam_posterior']
},
{
  id: 'iam_posterior', nome: 'IAM de parede posterior (dorsal)', cat: 'isquemia', nivel: 3, emerg: true,
  view: {layout: 'stack', leads: ['V1', 'V2', 'V3', 'V7', 'V8'], seconds: 5, rowMm: 26},
  build: () => B(80, {seed: 64}, {},
    ml({'V1': {r: 1.0, s: 0.25, st: -0.22, stCurv: -0.03, tAmp: 0.35},
        'V2': {r: 1.5, s: 0.30, st: -0.30, stCurv: -0.03, tAmp: 0.45},
        'V3': {r: 1.3, s: 0.35, st: -0.24, tAmp: 0.40},
        'V7': {st: 0.16, stCurv: 0.06, tAmp: 0.25, q: 0.15},
        'V8': {st: 0.14, stCurv: 0.06, tAmp: 0.22, q: 0.15}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 80 bpm', eixo: 'Normal', pr: 'Normal',
    qrs: 'Onda R ALTA em V1–V2 (R/S > 1) — imagem em espelho da onda Q posterior',
    stt: 'INFRA de ST em V1–V3 com onda T positiva; supra ≥ 0,5 mm em V7–V9',
    conclusao: 'IAM com supra de ST de parede posterior (imagem em espelho em V1–V3)'},
  criterios: ['Infra de ST horizontal em V1–V3', 'Onda R alta em V1–V2 (R/S > 1)',
    'Onda T POSITIVA (proeminente) em V1–V2', 'Confirmação: supra ≥ 0,5 mm em V7, V8, V9'],
  pegadinha: 'É o IAM que mais passa despercebido — o infra em V1–V3 é lido como "isquemia subendocárdica" e o paciente perde a reperfusão. Infra em V1–V3 + R alta + T positiva = vire o ECG de cabeça para baixo: é um supra posterior.',
  conduta: 'É IAMCSST: reperfusão imediata. Solicitar V7–V9 sempre que houver infra em V1–V3.',
  confunde: ['iam_inferior', 'hve', 'brd']
},
{
  id: 'iam_lateral', nome: 'IAM com supra de ST — parede lateral alta', cat: 'isquemia', nivel: 3, view: V12, emerg: true,
  build: () => B(84, {seed: 65}, {},
    ml({'DI': {st: 0.26, stCurv: 0.10, tAmp: 0.4, q: 0.12},
        'aVL': {st: 0.30, stCurv: 0.12, tAmp: 0.4, q: 0.14},
        'V5': {st: 0.18, stCurv: 0.08, tAmp: 0.4}, 'V6': {st: 0.16, stCurv: 0.08, tAmp: 0.35},
        'DII,DIII,aVF': {st: -0.18, stCurv: -0.04, tAmp: -0.1}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 84 bpm', eixo: 'Normal', pr: 'Normal',
    qrs: 'Ondas Q iniciais em DI e aVL',
    stt: 'Supra de ST em DI, aVL, V5 e V6 com infra recíproco em DII, DIII e aVF',
    conclusao: 'IAM com supra de ST de parede lateral — provável primeiro ramo diagonal ou circunflexa'},
  criterios: ['Supra em DI e aVL (lateral alta) e/ou V5–V6 (lateral baixa)',
    'Infra recíproco na parede inferior'],
  pegadinha: 'Infra isolado em DII, DIII e aVF pode ser a única pista de um IAM lateral alto (padrão "South African flag"). Olhe DI e aVL com atenção.',
  conduta: 'Reperfusão imediata.',
  confunde: ['iam_inferior', 'iam_anterior', 'hve']
},
{
  id: 'dewinter', nome: 'Padrão de De Winter', cat: 'isquemia', nivel: 3, view: V12, emerg: true,
  build: () => B(92, {seed: 66}, {},
    ml({'V1': {st: -0.14, tAmp: 0.55, tSym: true, tDur: 0.17},
        'V2': {st: -0.24, tAmp: 1.05, tSym: true, tDur: 0.17},
        'V3': {st: -0.26, tAmp: 1.10, tSym: true, tDur: 0.17},
        'V4': {st: -0.24, tAmp: 1.00, tSym: true, tDur: 0.17},
        'V5': {st: -0.18, tAmp: 0.75, tSym: true}, 'V6': {st: -0.14, tAmp: 0.55, tSym: true},
        'aVR': {st: 0.12, tAmp: -0.1}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 92 bpm', eixo: 'Normal', pr: 'Normal', qrs: 'Estreito',
    stt: 'Infra de ST ASCENDENTE de 1–3 mm no ponto J em V1–V6, continuado por ondas T ALTAS, SIMÉTRICAS e apiculadas; discreto supra em aVR',
    conclusao: 'Padrão de De Winter — equivalente de IAM com supra; oclusão aguda da DA proximal'},
  criterios: ['Infra de ST ascendente ≥ 1 mm no ponto J em V1–V6',
    'Ondas T hiperagudas, altas e SIMÉTRICAS, imediatamente após o infra',
    'Discreto supra (0,5–1 mm) em aVR', 'SEM supra de ST nas precordiais'],
  pegadinha: 'É EQUIVALENTE de IAMCSST, mas não tem supra — quem procura só supra deixa o paciente morrer com a DA ocluída. É estático: não evolui para supra.',
  conduta: 'Cateterismo de urgência, mesmo sem supra. Tratar como IAMCSST.',
  confunde: ['hipercalemia', 'iam_anterior', 'wellens_a']
},
{
  id: 'wellens_a', nome: 'Síndrome de Wellens — tipo A (T bifásica)', cat: 'isquemia', nivel: 3, view: V12, emerg: true,
  build: () => B(72, {seed: 67}, {},
    ml({'V2': {tAmp: 0.35, tBiphasic: -0.60, st: 0.04},
        'V3': {tAmp: 0.35, tBiphasic: -0.65, st: 0.04},
        'V4': {tAmp: 0.30, tBiphasic: -0.35}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 72 bpm', eixo: 'Normal', pr: 'Normal',
    qrs: 'Progressão de R PRESERVADA, sem ondas Q',
    stt: 'Ondas T BIFÁSICAS (positivo-negativo) em V2–V3, sem supra significativo',
    conclusao: 'Padrão de Wellens tipo A — estenose crítica da DA proximal'},
  criterios: ['T bifásica (tipo A) ou profundamente invertida e simétrica (tipo B) em V2–V3',
    'Ausência de onda Q e progressão de R preservada',
    'Supra de ST ausente ou mínimo (< 1 mm)', 'Marcadores normais ou minimamente elevados',
    'Aparece quando o paciente está SEM DOR (período de reperfusão espontânea)'],
  pegadinha: 'O paciente chega assintomático e o ECG parece "quase normal". NÃO faça teste ergométrico nem prova de esforço — pode precipitar IAM anterior extenso. É indicação de cateterismo.',
  conduta: 'Internação + antiagregação + cateterismo precoce (não urgente se sem dor, mas na mesma internação).',
  confunde: ['wellens_b', 'dewinter', 'tep']
},
{
  id: 'wellens_b', nome: 'Síndrome de Wellens — tipo B (T invertida profunda)', cat: 'isquemia', nivel: 3, view: V12, emerg: true,
  build: () => B(70, {seed: 68}, {},
    ml({'V2': {tAmp: -0.70, tSym: true, tDur: 0.19}, 'V3': {tAmp: -0.85, tSym: true, tDur: 0.19},
        'V4': {tAmp: -0.65, tSym: true, tDur: 0.19}, 'V5': {tAmp: -0.35, tSym: true}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 70 bpm', eixo: 'Normal', pr: 'Normal',
    qrs: 'Progressão de R preservada, sem Q patológica',
    stt: 'Ondas T profundamente invertidas e SIMÉTRICAS em V2–V4',
    conclusao: 'Padrão de Wellens tipo B — estenose crítica da DA proximal'},
  criterios: ['T profunda e SIMÉTRICA em V2–V4 (o tipo B é o mais comum, ~75%)',
    'Sem perda de R, sem onda Q, sem supra relevante'],
  pegadinha: 'T invertida simétrica e profunda nas precordiais anteriores em paciente com história de dor = Wellens. Não banalize como "alteração inespecífica de repolarização".',
  conduta: 'Mesma do tipo A: internação e cateterismo; proibido teste ergométrico.',
  confunde: ['wellens_a', 'tep', 'hve']
},
{
  id: 'tce', nome: 'Infra difuso com supra em aVR (lesão de TCE / triarterial)', cat: 'isquemia', nivel: 3, view: V12, emerg: true,
  build: () => B(104, {seed: 69}, {},
    ml({'DI,DII,V4,V5,V6': {st: -0.22, stCurv: -0.06, tAmp: -0.12},
        'V3': {st: -0.20, stCurv: -0.06, tAmp: -0.1}, 'aVL': {st: -0.14, tAmp: -0.1},
        'aVR': {st: 0.18, stCurv: 0.05, tAmp: 0.05}, 'V1': {st: 0.10}})),
  laudo: {ritmo: 'Sinusal, taquicárdico', fc: '≈ 104 bpm', eixo: 'Normal', pr: 'Normal', qrs: 'Estreito',
    stt: 'Infra de ST ≥ 1 mm em 6 ou mais derivações (DI, DII, V3–V6) com SUPRA em aVR',
    conclusao: 'Isquemia subendocárdica difusa — sugere lesão de tronco de coronária esquerda ou doença triarterial'},
  criterios: ['Infra de ST em ≥ 6–8 derivações', 'Supra de ST em aVR ≥ 1 mm (e frequentemente em V1)',
    'Supra em aVR > supra em V1 favorece lesão de TCE'],
  pegadinha: 'aVR é a derivação mais ignorada e a que muda a conduta aqui. Padrão de alto risco: mortalidade elevada, muitas vezes não se beneficia de trombólise — precisa de cateterismo/cirurgia.',
  conduta: 'Estratificação invasiva urgente (≤ 2 h). Antiagregação, anticoagulação, considerar cirurgia de revascularização.',
  confunde: ['dewinter', 'hve', 'digital']
},

/* ============================ METABÓLICO / ARMADILHAS ============================ */
{
  id: 'hipercalemia', nome: 'Hipercalemia', cat: 'metabolico', nivel: 3, view: V12, emerg: true,
  build: () => B(66, {seed: 71, pScale: 0.15, pr: 0.24}, {qrsDur: 0.14, tSym: true, tDur: 0.10, tScale: 2.6}, {}),
  laudo: {ritmo: 'Sinusal, com onda P de baixa amplitude', fc: '≈ 66 bpm', eixo: 'Normal',
    pr: 'Prolongado (240 ms)', qrs: 'Alargado (140 ms) sem padrão típico de bloqueio de ramo',
    stt: 'Ondas T ALTAS, ESTREITAS, SIMÉTRICAS e apiculadas ("em tenda") de forma difusa',
    conclusao: 'Alterações eletrocardiográficas sugestivas de hipercalemia'},
  criterios: ['Sequência clássica com o K⁺ subindo: T apiculada e ESTREITA → PR longo e P achatada/ausente → QRS alargado → onda sinusoidal → assistolia',
    'A T da hipercalemia é ALTA, ESTREITA e SIMÉTRICA (base estreita) — diferente da T hiperaguda do IAM, que é larga e assimétrica'],
  pegadinha: 'QRS alargado que não é BRD nem BRE = pense hipercalemia. Não espere o resultado do potássio para tratar se o ECG já mostra alargamento.',
  conduta: 'Gluconato de cálcio 10% IV (estabiliza a membrana, primeiro passo, não baixa o K) → insulina regular + glicose, beta-2 inalatório (deslocam para dentro da célula) → diurético / resina / DIÁLISE (removem).',
  confunde: ['dewinter', 'iam_anterior', 'repol_precoce']
},
{
  id: 'hipocalemia', nome: 'Hipocalemia', cat: 'metabolico', nivel: 2, view: V12,
  build: () => B(78, {seed: 72}, {tScale: 0.28, u: 0.30, tDur: 0.18},
    ml({'V4,V5,V6,DII': {st: -0.09, stCurv: -0.03}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 78 bpm', eixo: 'Normal', pr: 'Normal', qrs: 'Estreito',
    stt: 'Ondas T achatadas, infra de ST discreto e ONDA U proeminente após a T — QT aparente prolongado (na verdade QU)',
    conclusao: 'Alterações sugestivas de hipocalemia'},
  criterios: ['Achatamento/inversão da onda T', 'ONDA U proeminente (melhor vista em V2–V3)',
    'Infra de ST', 'Fusão T-U simulando QT longo → risco de torsades'],
  pegadinha: 'O "QT longo" da hipocalemia geralmente é intervalo QU. E hipocalemia potencializa a toxicidade digitálica.',
  conduta: 'Repor K⁺ (via oral se possível; IV em bomba se grave). SEMPRE repor MAGNÉSIO junto — sem Mg²⁺ o K⁺ não sobe.',
  confunde: ['qt_longo', 'digital', 'hipercalemia']
},
{
  id: 'qt_longo', nome: 'Síndrome do QT longo', cat: 'metabolico', nivel: 2, view: V12,
  build: () => B(62, {seed: 73}, {tDur: 0.30, stLen: 0.19, tScale: 0.9, tSym: true}, {}),
  laudo: {ritmo: 'Sinusal', fc: '≈ 62 bpm', eixo: 'Normal', pr: 'Normal', qrs: 'Estreito',
    stt: 'Segmento ST alongado com onda T larga e tardia — QTc ≈ 520 ms',
    conclusao: 'Intervalo QT corrigido prolongado — risco de torsades de pointes'},
  criterios: ['QTc = QT / √(RR em segundos) — fórmula de Bazett',
    'Prolongado: > 450 ms (homens) e > 460 ms (mulheres); > 500 ms = alto risco',
    'Regra prática: com FC normal, o QT deve ser MENOR que metade do intervalo RR'],
  pegadinha: 'Causas para decorar: drogas (antiarrítmicos IA/III, macrolídeos, quinolonas, antipsicóticos, ondansetrona, metoclopramida), hipocalemia, hipomagnesemia, hipocalcemia, hipotireoidismo, bradicardia, HIC e congênito (Romano-Ward, Jervell-Lange-Nielsen).',
  conduta: 'Suspender drogas responsáveis, corrigir eletrólitos (K⁺, Mg²⁺, Ca²⁺). Congênito: betabloqueador ± CDI.',
  confunde: ['hipocalemia', 'torsades', 'sinusal']
},
{
  id: 'brugada', nome: 'Síndrome de Brugada — padrão tipo 1', cat: 'metabolico', nivel: 3, view: V12, emerg: true,
  build: () => B(70, {seed: 74}, {},
    ml({'V1': {r: 0.45, s: 0.15, st: 0.34, stCurv: 0.16, tAmp: -0.35, tSym: true, qrsDur: 0.12},
        'V2': {r: 0.55, s: 0.20, st: 0.38, stCurv: 0.18, tAmp: -0.40, tSym: true, qrsDur: 0.12},
        'V3': {st: 0.10, tAmp: 0.15}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 70 bpm', eixo: 'Normal', pr: 'Normal',
    qrs: 'Pseudo-bloqueio de ramo direito em V1–V2',
    stt: 'Supra de ST ≥ 2 mm de morfologia CONVEXA descendente ("coved", em abóbada) em V1–V2, seguido de onda T NEGATIVA',
    conclusao: 'Padrão de Brugada tipo 1'},
  criterios: ['Tipo 1 (diagnóstico): supra ≥ 2 mm coved em V1–V2 + T negativa',
    'Tipo 2 ("saddleback"/em sela): supra ≥ 2 mm com T positiva ou bifásica — sugestivo, não diagnóstico',
    'Canalopatia do sódio (SCN5A); risco de morte súbita por FV, tipicamente durante o sono'],
  pegadinha: 'O padrão pode ser desmascarado por FEBRE, álcool, cocaína e bloqueadores de canal de sódio. Todo jovem com síncope ou parada abortada + história familiar de morte súbita merece um ECG olhado em V1–V2 (inclusive em posição mais alta, 2º–3º EIC).',
  conduta: 'Tratar febre agressivamente. Evitar drogas da lista brugadadrugs. Sintomático (síncope/PCR abortada) → CDI.',
  confunde: ['brd', 'repol_precoce', 'iam_anterior']
},
{
  id: 'pericardite', nome: 'Pericardite aguda', cat: 'metabolico', nivel: 2, view: V12,
  build: () => B(98, {seed: 75}, {},
    ml({'DI,DII,V3,V4,V5,V6,aVF': {st: 0.16, stCurv: -0.09, tAmp: 0.35, prDep: -0.07},
        'V2': {st: 0.14, stCurv: -0.08, tAmp: 0.4, prDep: -0.06},
        'aVR': {st: -0.12, prDep: 0.08}, 'DIII': {st: 0.08, prDep: -0.04}})),
  laudo: {ritmo: 'Sinusal, taquicárdico', fc: '≈ 98 bpm', eixo: 'Normal', pr: 'Normal em duração',
    qrs: 'Estreito, sem onda Q',
    stt: 'Supra de ST DIFUSO, de concavidade superior, sem imagem em espelho; INFRA do segmento PR difuso, com supra de PR em aVR',
    conclusao: 'Alterações compatíveis com pericardite aguda (estágio I)'},
  criterios: ['Supra de ST DIFUSO (não respeita território coronariano), de CONCAVIDADE SUPERIOR',
    'INFRADESNIVELAMENTO DE PR difuso, com SUPRA de PR em aVR — sinal mais específico',
    'AUSÊNCIA de imagem em espelho (exceto aVR e V1)', 'Ausência de onda Q; não há perda de R',
    'Razão ST/T em V6 > 0,25 favorece pericardite'],
  pegadinha: 'A diferença prática para o IAM: pericardite = supra difuso, côncavo, SEM espelho, COM infra de PR. IAM = supra localizado, convexo, COM espelho, evolui com onda Q.',
  conduta: 'AINE em dose alta (ibuprofeno ou AAS) + COLCHICINA (reduz recorrência). Corticoide só em casos selecionados. Ecocardiograma para avaliar derrame.',
  confunde: ['iam_anterior', 'repol_precoce', 'derrame']
},
{
  id: 'repol_precoce', nome: 'Repolarização precoce', cat: 'metabolico', nivel: 2, view: V12,
  build: () => B(58, {seed: 76}, {},
    ml({'V3,V4,V5': {st: 0.16, stCurv: -0.10, tAmp: 0.62, osborn: 0.13},
        'V2': {st: 0.14, stCurv: -0.09, tAmp: 0.55, osborn: 0.10},
        'DII,aVF': {st: 0.10, stCurv: -0.07, tAmp: 0.35, osborn: 0.10}, 'V6': {st: 0.08, tAmp: 0.3, osborn: 0.10}})),
  laudo: {ritmo: 'Sinusal, bradicárdico', fc: '≈ 58 bpm', eixo: 'Normal', pr: 'Normal', qrs: 'Estreito',
    stt: 'Supra de ST côncavo de 1–2 mm em V2–V5 com ENTALHE do ponto J e ondas T amplas e assimétricas',
    conclusao: 'Padrão de repolarização precoce (variante da normalidade neste contexto)'},
  criterios: ['Supra de ST de CONCAVIDADE superior, geralmente < 2 mm, em precordiais',
    'ENTALHE ou empastamento do ponto J ("fish hook")', 'Ondas T altas e ASSIMÉTRICAS, concordantes',
    'Estável ao longo do tempo; ausência de imagem em espelho', 'Mais comum em jovens, homens, atletas'],
  pegadinha: 'Diante de supra de ST, o mais importante NÃO é o ECG isolado: é a clínica + a evolução. Repolarização precoce é ESTÁVEL — ECG seriado que muda é isquemia.',
  conduta: 'Nenhuma se assintomático. Não descarta SCA sozinho: use clínica, troponina seriada e ECG seriado.',
  confunde: ['pericardite', 'iam_anterior', 'brugada']
},
{
  id: 'hve', nome: 'Hipertrofia ventricular esquerda com padrão de sobrecarga', cat: 'metabolico', nivel: 2, view: V12,
  build: () => B(74, {seed: 77}, {},
    ml({'V1': {s: 2.10}, 'V2': {s: 2.40}, 'V3': {r: 1.1, s: 1.5},
        'V5': {r: 2.60, st: -0.14, stCurv: -0.06, tAmp: -0.42}, 'V6': {r: 2.20, st: -0.12, tAmp: -0.38},
        'DI': {r: 1.2, st: -0.08, tAmp: -0.2}, 'aVL': {r: 1.3, st: -0.10, tAmp: -0.28}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 74 bpm', eixo: 'Levemente desviado à esquerda', pr: 'Normal',
    qrs: 'Amplitudes aumentadas: S em V1 + R em V5 > 35 mm (Sokolow-Lyon positivo)',
    stt: 'Infra de ST descendente com T negativa ASSIMÉTRICA em DI, aVL, V5 e V6 (padrão strain)',
    conclusao: 'Sobrecarga ventricular esquerda com padrão de strain'},
  criterios: ['Sokolow-Lyon: S(V1) + R(V5 ou V6) ≥ 35 mm',
    'Cornell: R(aVL) + S(V3) > 28 mm (homens) ou > 20 mm (mulheres)',
    'R em aVL ≥ 11 mm', 'Padrão strain: infra descendente + T negativa ASSIMÉTRICA nas laterais'],
  pegadinha: 'O strain da HVE imita isquemia. A pista: T negativa ASSIMÉTRICA (descida lenta, subida rápida) e amplitudes muito aumentadas. Na isquemia (Wellens) a T é SIMÉTRICA.',
  conduta: 'Investigar causa (HAS, estenose aórtica, miocardiopatia hipertrófica) com ecocardiograma.',
  confunde: ['wellens_b', 'tce', 'iam_posterior']
},
{
  id: 'digital', nome: 'Impregnação digitálica', cat: 'metabolico', nivel: 2, view: V12,
  build: () => B(60, {seed: 78, pr: 0.22}, {tDur: 0.13, stLen: 0.05},
    ml({'V4,V5,V6,DI,DII,aVF': {st: -0.13, stCurv: -0.14, tAmp: 0.06}})),
  laudo: {ritmo: 'Sinusal, bradicárdico', fc: '≈ 60 bpm', eixo: 'Normal', pr: 'Discretamente prolongado',
    qrs: 'Estreito', stt: 'Infra de ST de concavidade superior, "em colher de pedreiro", com QT curto e T achatada',
    conclusao: 'Padrão de impregnação digitálica (não indica intoxicação por si só)'},
  criterios: ['Infra de ST em "colher de pedreiro" / "bigode de Salvador Dalí"',
    'QT ENCURTADO', 'Achatamento ou inversão da onda T', 'PR discretamente prolongado, bradicardia'],
  pegadinha: 'Impregnação (efeito esperado) ≠ intoxicação. Intoxicação digitálica dá arritmias: taquicardia atrial COM bloqueio, taquicardia juncional, ESV bigeminadas e TV bidirecional (essa é praticamente patognomônica).',
  conduta: 'Impregnação: nada. Intoxicação: suspender digital, corrigir K⁺ e Mg²⁺, anticorpo antidigoxina em casos graves. Evitar cálcio IV.',
  confunde: ['hipocalemia', 'tce', 'hve']
},
{
  id: 'tep', nome: 'Tromboembolismo pulmonar (padrão S1Q3T3)', cat: 'metabolico', nivel: 3, view: V12, emerg: true,
  build: () => B(118, {seed: 79}, {},
    ml({'DI': {s: 0.42, r: 0.6}, 'DIII': {q: 0.30, r: 0.35, tAmp: -0.22},
        'V1': {tAmp: -0.30, tSym: true, r: 0.35}, 'V2': {tAmp: -0.45, tSym: true},
        'V3': {tAmp: -0.40, tSym: true}, 'V4': {tAmp: -0.25, tSym: true}})),
  laudo: {ritmo: 'Sinusal, taquicárdico', fc: '≈ 118 bpm', eixo: 'Tendência ao desvio à direita', pr: 'Normal',
    qrs: 'S em DI, Q em DIII (padrão S1Q3)',
    stt: 'T negativa em DIII e em V1–V4 (sobrecarga aguda de VD)',
    conclusao: 'Alterações sugestivas de sobrecarga aguda de ventrículo direito — compatível com TEP no contexto clínico'},
  criterios: ['O achado MAIS COMUM é taquicardia sinusal (e não S1Q3T3)',
    'S1Q3T3: S em DI, Q em DIII e T invertida em DIII — presente em apenas ~20% dos casos',
    'T invertida em V1–V4 (sobrecarga de VD)', 'BRD novo (completo ou incompleto), desvio do eixo à direita, FA'],
  pegadinha: 'ECG NÃO faz e NÃO exclui TEP. Serve para levantar suspeita e afastar diferenciais (IAM, pericardite). O diagnóstico é por angio-TC, com escore de Wells / PERC guiando a investigação.',
  conduta: 'Anticoagulação plena. Instabilidade hemodinâmica (TEP maciço) → trombólise.',
  confunde: ['wellens_b', 'iam_anterior', 'brd']
},
{
  id: 'derrame', nome: 'Derrame pericárdico com alternância elétrica', cat: 'metabolico', nivel: 3, view: D2V1, emerg: true,
  build: () => { const rr = 0.55, beats = [], p = []; let t = 0.4, i = 0;
    while (t < 9.7){ const g = i % 2 ? 0.42 : 0.72;
      beats.push({t: t, mods: {rScale: g, sScale: g, tScale: g * 0.8}}); p.push(t - 0.15); t += rr; i++; }
    return {dur: 10, seed: 80, beats: beats, atrial: {mode: 'sinus', list: p, ampScale: 0.5}, global: {pr: 0.15}, leadMods: {}}; },
  laudo: {ritmo: 'Sinusal, taquicárdico', fc: '≈ 110 bpm', eixo: 'Normal', pr: 'Normal', qrs: 'Estreito, de BAIXA VOLTAGEM',
    stt: 'Sem supra significativo',
    conclusao: 'Baixa voltagem com alternância elétrica e taquicardia — tríade sugestiva de derrame pericárdico volumoso / tamponamento'},
  criterios: ['Baixa voltagem: QRS < 5 mm nas periféricas ou < 10 mm nas precordiais',
    'ALTERNÂNCIA ELÉTRICA: variação batimento a batimento da amplitude do QRS (coração "balançando" no líquido)',
    'Taquicardia sinusal'],
  pegadinha: 'Alternância elétrica + baixa voltagem + taquicardia = tamponamento até prova em contrário. A tríade de Beck (hipotensão, turgência jugular, bulhas abafadas) é clínica, não eletrocardiográfica.',
  conduta: 'Ecocardiograma imediato; pericardiocentese se tamponamento. Volume enquanto prepara. NÃO usar diurético ou vasodilatador.',
  confunde: ['pericardite', 'sinusal', 'taqui_sinusal']
},
{
  id: 'hipotermia', nome: 'Hipotermia (onda J de Osborn)', cat: 'metabolico', nivel: 2, view: D2V1,
  build: () => B(42, {seed: 81, pr: 0.22}, {osborn: 0.32, qrsDur: 0.12, tDur: 0.24}, {}, {noise: 0.03}),
  laudo: {ritmo: 'Sinusal, bradicárdico', fc: '≈ 42 bpm', eixo: 'Normal', pr: 'Prolongado',
    qrs: 'Discretamente alargado, com deflexão positiva no ponto J (onda J de Osborn)',
    stt: 'QT prolongado; tremor muscular pode gerar artefato',
    conclusao: 'Bradicardia com ondas J de Osborn — compatível com hipotermia'},
  criterios: ['ONDA J (de Osborn): deflexão positiva na junção QRS-ST, mais evidente em DII e V3–V6',
    'Bradicardia + prolongamento de todos os intervalos (PR, QRS, QT)',
    'Tremor muscular gerando artefato de linha de base'],
  pegadinha: 'Onda J também aparece em hipercalcemia, HIC e repolarização precoce — o contexto (temperatura) fecha o diagnóstico. Miocárdio hipotérmico é irritável: manuseie o paciente com cuidado, pode desencadear FV.',
  conduta: 'Reaquecimento. Em PCR hipotérmica: "ninguém está morto até estar quente e morto" — RCP prolongada.',
  confunde: ['repol_precoce', 'brady_sinusal', 'brugada']
}
,
{
  id: 'juncional', nome: 'Ritmo juncional de escape', cat: 'ritmo', nivel: 2, view: D2V1,
  build: () => B(45, {seed: 301, pr: 0.05, pInv: true, pScale: 0.95}),
  laudo: {ritmo: 'Juncional', fc: '≈ 45 bpm', eixo: 'Normal', pr: 'Muito curto (< 120 ms), com P retrógrada',
    qrs: 'Estreito', stt: 'Sem alterações agudas',
    conclusao: 'Ritmo juncional de escape — investigar causa da falência sinusal'},
  criterios: ['QRS ESTREITO com FC entre 40 e 60 bpm',
    'Onda P retrógrada: NEGATIVA em DII, DIII e aVF e positiva em aVR',
    'A P pode estar imediatamente antes (PR < 120 ms), dentro ou logo depois do QRS',
    'Ritmo regular — é um escape, não uma arritmia caótica'],
  pegadinha: 'P negativa em DII tem duas explicações: ritmo juncional/atrial baixo OU troca de cabos braço-perna. Antes de laudar arritmia, olhe as precordiais — se estiverem normais e o resto do traçado não fizer sentido, repita o exame conferindo os eletrodos.',
  conduta: 'O escape juncional está protegendo o paciente: nunca suprima. Procure a causa — drogas bradicardizantes (betabloqueador, digital, verapamil), isquemia inferior, hipercalemia, hipotireoidismo. Sintomático ou instável: atropina e marca-passo transcutâneo.',
  confunde: ['brady_sinusal', 'bavt', 'mobitz2']
},
{
  id: 'riva', nome: 'Ritmo idioventricular acelerado (RIVA)', cat: 'ritmo', nivel: 2, view: DIIS,
  build: () => {
    const beats = [], p = [];
    for (let t = 0.5; t < 9.6; t += 0.80) beats.push({t: t, kind: 'v', mods: {tAmp: -0.42}});
    for (let t = 0.3; t < 9.9; t += 0.88) p.push(t);
    return {dur: 10, seed: 302, beats: beats, atrial: {mode: 'sinus', list: p, ampScale: 0.5},
            global: {qrsDur: 0.15}, leadMods: {}};
  },
  laudo: {ritmo: 'Ventricular, regular', fc: '≈ 75 bpm', eixo: 'Bizarro', pr: 'Dissociação AV',
    qrs: 'Largo (≈ 150 ms)', stt: 'Onda T oposta ao QRS',
    conclusao: 'Ritmo idioventricular acelerado — marcador de reperfusão'},
  criterios: ['QRS largo (≥ 120 ms) com FC entre 60 e 110 bpm',
    'Mais rápido que o escape ventricular (< 40) e mais lento que a TV (> 100–120)',
    'Início e término GRADUAIS, não súbitos',
    'Dissociação AV, com ondas P sinusais caminhando por conta própria'],
  pegadinha: 'É o marcador clássico de REPERFUSÃO após trombólise ou angioplastia — quer dizer que a artéria abriu. Costuma ser benigno e autolimitado, e o erro é tratá-lo como TV: antiarrítmico pode abolir o único ritmo que está sustentando o paciente.',
  conduta: 'Observar e monitorar. Não usar lidocaína nem amiodarona de rotina. Se houver instabilidade por perda da contração atrial, atropina para acelerar o sinusal e reassumir o comando.',
  confunde: ['tv', 'mp', 'bavt']
},
{
  id: 'bav_2para1', nome: 'BAV de 2º grau com condução 2:1', cat: 'conducao', nivel: 3, view: DIIS, emerg: true,
  build: () => {
    const pp = 0.75, beats = [], p = [];
    let t = 0.45, k = 0;
    while (t < 9.6){ p.push(t); if (k % 2 === 0) beats.push({t: t + 0.22}); k++; t += pp; }
    return {dur: 10, seed: 303, beats: beats, atrial: {mode: 'sinus', list: p},
            global: {pr: 0.22, qrsDur: 0.13, shape: 'brd'}, leadMods: {}};
  },
  laudo: {ritmo: 'Sinusal com bloqueio AV 2:1', fc: 'Atrial ≈ 80 bpm · ventricular ≈ 40 bpm',
    eixo: 'Normal', pr: 'Fixo nas P conduzidas', qrs: 'Alargado (≈ 130 ms)',
    stt: 'Sem alterações agudas',
    conclusao: 'BAV de 2º grau 2:1 com QRS largo — provável bloqueio infra-His'},
  criterios: ['DUAS ondas P para cada QRS, com PP regular',
    'PR constante nos batimentos conduzidos',
    'Frequência ventricular é exatamente metade da atrial',
    'QRS largo sugere bloqueio infra-His; QRS estreito com PR longo sugere bloqueio nodal'],
  pegadinha: 'Num 2:1 puro é IMPOSSÍVEL dizer se é Mobitz I ou Mobitz II — não existem dois PR consecutivos para comparar. Quem responde "Mobitz II" automaticamente cai na pegadinha. O que orienta o prognóstico é a largura do QRS e a resposta a manobras: exercício e atropina melhoram o bloqueio nodal e pioram o infra-His.',
  conduta: 'QRS largo, sintomático ou suspeita de infra-His: marca-passo. Nunca conte com atropina no bloqueio infra-His — ela acelera o átrio, aumenta o grau do bloqueio e pode piorar a bradicardia.',
  confunde: ['mobitz2', 'mobitz1', 'brady_sinusal']
},
{
  id: 'tam', nome: 'Taquicardia atrial multifocal', cat: 'ritmo', nivel: 2, view: D2V1,
  build: () => {
    const R = rng(306), beats = [], p = [];
    const morf = [1, -0.55, 0.45, 1.25, 0.70];
    let t = 0.45, i = 0;
    while (t < 9.5){
      p.push({t: t - (0.12 + R() * 0.10), k: morf[i % morf.length]});
      beats.push({t: t});
      t += 0.36 + R() * 0.30; i++;
    }
    return {dur: 10, seed: 306, beats: beats, atrial: {mode: 'sinus', list: p, ampScale: 1.3},
            global: {pr: 0.16}, leadMods: {}};
  },
  laudo: {ritmo: 'Atrial multifocal', fc: '≈ 115 bpm', eixo: 'Normal ou desviado à direita',
    pr: 'VARIÁVEL', qrs: 'Estreito', stt: 'Sem alterações agudas',
    conclusao: 'Taquicardia atrial multifocal'},
  criterios: ['FC > 100 bpm com RR IRREGULAR',
    'PELO MENOS TRÊS morfologias diferentes de onda P na mesma derivação',
    'Intervalos PR variáveis, acompanhando a mudança de foco',
    'Existe linha de base isoelétrica entre as P — não há ondulação contínua'],
  pegadinha: 'É a arritmia do DPOC descompensado, e o erro clássico é confundir com fibrilação atrial: as duas são irregulares, mas na FA NÃO há onda P alguma. Aqui há P — só que de vários formatos. Confundir muda a conduta inteira: FA leva a anticoagulação e controle de FC; TAM leva a tratar o pulmão.',
  conduta: 'Tratar a causa: broncoespasmo, hipoxemia, infecção, e corrigir potássio e magnésio. Revisar a dose de beta-agonista e de teofilina. Cardioversão elétrica NÃO funciona. Betabloqueador é relativamente contraindicado pelo broncoespasmo; se precisar controlar a FC, prefira verapamil ou magnésio.',
  confunde: ['fa', 'essv', 'taqui_sinusal']
},
{
  id: 'zona_inativa', nome: 'Área eletricamente inativa (IAM antigo)', cat: 'isquemia', nivel: 2, view: V12,
  build: () => B(74, {seed: 307}, {},
    ml({'V1,V2': {r: 0.03, q: 0.44, t: 0.10}, 'V3': {r: 0.10, q: 0.38, t: 0.22},
        'V4': {r: 0.55, q: 0.16}, 'DI,aVL': {q: 0.12}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 74 bpm', eixo: 'Normal', pr: 'Normal',
    qrs: 'Complexos QS em V1–V3, com má progressão de R',
    stt: 'SEM supra e SEM infra de ST; ondas T sem alteração aguda',
    conclusao: 'Área eletricamente inativa anterosseptal — sequela de infarto antigo'},
  criterios: ['Onda Q ≥ 40 ms, ou > 25% da R, em duas derivações contíguas',
    'Complexo QS em V1–V3, com perda da progressão normal da onda R',
    'AUSÊNCIA de supra de ST — é o que separa do infarto agudo',
    'Paciente tipicamente sem dor no momento do exame'],
  pegadinha: 'Onda Q patológica sem supra e sem dor significa infarto ANTIGO, não emergência — mas o inverso também engana: nas primeiras horas de um IAM agudo a onda Q ainda não apareceu. Quem se apoia na onda Q para diagnosticar infarto agudo perde a janela de reperfusão. O que decide o agudo é o ST, não o Q.',
  conduta: 'Não é emergência. Comparar com ECG prévio, investigar função ventricular e viabilidade miocárdica com ecocardiograma, e otimizar prevenção secundária (AAS, estatina, IECA, betabloqueador).',
  confunde: ['iam_anterior', 'bre', 'repol_precoce']
},
{
  id: 'scassst', nome: 'SCA sem supra de ST (isquemia subendocárdica)', cat: 'isquemia', nivel: 3, view: V12, emerg: true,
  build: () => B(94, {seed: 308}, {},
    ml({'DI,aVL,V4,V5,V6': {st: -0.20, stCurv: 0, tAmp: -0.30, tSym: true, tDur: 0.18},
        'DII': {st: -0.13, tAmp: -0.14}, 'aVR': {st: 0.09}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 94 bpm', eixo: 'Normal', pr: 'Normal', qrs: 'Estreito, sem onda Q',
    stt: 'Infra de ST horizontal em DI, aVL e V4–V6, com T negativa e simétrica',
    conclusao: 'Isquemia subendocárdica — SCA sem supra de ST'},
  criterios: ['Infra de ST ≥ 0,5 mm, HORIZONTAL ou DESCENDENTE, em duas derivações contíguas',
    'Onda T negativa e simétrica acompanhando',
    'Ausência de supra e ausência de onda Q patológica',
    'Medir sempre 60–80 ms depois do ponto J, usando o segmento TP como linha de base'],
  pegadinha: 'Infra de ST NÃO localiza a artéria culpada — diferente do supra, ele reflete isquemia circunferencial e não aponta parede. E há uma armadilha maior: infra em V1–V3 com onda R alta pode ser a imagem em espelho de um IAM POSTERIOR, que é um infarto com supra disfarçado. Nesses casos, peça V7–V9 antes de classificar como "sem supra".',
  conduta: 'AAS + segundo antiagregante + anticoagulação, estatina de alta potência e antianginoso. Estratificar risco (GRACE, TIMI): alto risco vai para cateterismo em até 24 h; muito alto risco ou instabilidade, imediato. Não há indicação de trombolítico.',
  confunde: ['tce', 'hve', 'digital', 'iam_posterior']
},
{
  id: 'triciclico', nome: 'Intoxicação por antidepressivo tricíclico', cat: 'metabolico', nivel: 3, view: V12, emerg: true,
  build: () => B(122, {seed: 309, pr: 0.17}, {qrsDur: 0.14, tDur: 0.26, stLen: 0.16},
    ml({'aVR': {r: 0.66, s: 0.12, t: -0.10}, 'DI': {r: 0.45, s: 0.45}, 'aVL': {r: 0.3, s: 0.4},
        'V1,V2': {s: 1.15}, 'DIII': {r: 0.85, s: 0.1}})),
  laudo: {ritmo: 'Taquicardia sinusal', fc: '≈ 120 bpm', eixo: 'Desviado à direita',
    pr: 'Normal', qrs: 'Alargado (≈ 140 ms)',
    stt: 'QT prolongado', conclusao: 'ECG compatível com intoxicação por tricíclico — bloqueio de canal de sódio'},
  criterios: ['Taquicardia sinusal (efeito anticolinérgico) — quase sempre presente',
    'QRS > 100 ms por bloqueio dos canais de sódio',
    'Onda R em aVR > 3 mm e relação R/S em aVR > 0,7 — o achado mais específico',
    'Desvio do eixo para a direita nos 40 ms terminais do QRS e QT prolongado'],
  pegadinha: 'A largura do QRS é preditora de desfecho, e vale decorar: QRS > 100 ms prediz convulsão; QRS > 160 ms prediz arritmia ventricular. O tratamento é BICARBONATO DE SÓDIO, não antiarrítmico — e antiarrítmicos das classes IA e IC são formalmente contraindicados porque bloqueiam o mesmo canal e pioram tudo. Flumazenil também não entra: pode precipitar convulsão.',
  conduta: 'Bicarbonato de sódio IV em bolus, titulado até o QRS estreitar (alvo de pH 7,45–7,55). Suporte ventilatório, benzodiazepínico para convulsão, e noradrenalina se hipotensão refratária a volume. Carvão ativado se apresentação precoce. Monitorização por pelo menos 6 h.',
  confunde: ['hipercalemia', 'tv', 'bre']
},
{
  id: 'p_pulmonale', nome: 'Sobrecarga atrial direita (P pulmonale)', cat: 'metabolico', nivel: 2, view: V12,
  build: () => B(90, {seed: 304, pPeaked: true, pScale: 2.5}, {},
    ml({'V1': {p: 0.22}, 'DI': {r: 0.4, s: 0.45}, 'DIII': {r: 0.95, s: 0.1}, 'aVF': {r: 0.85}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 90 bpm', eixo: 'Desviado à direita',
    pr: 'Normal', qrs: 'Estreito',
    stt: 'Sem alterações agudas de repolarização',
    conclusao: 'Sobrecarga atrial direita (P pulmonale)'},
  criterios: ['Onda P ALTA e APICULADA: ≥ 2,5 mm em DII, DIII ou aVF',
    'Duração da P permanece NORMAL (< 120 ms) — cresce em altura, não em largura',
    'Componente inicial positivo e proeminente da P em V1 (> 1,5 mm)',
    'Costuma vir acompanhada de desvio do eixo do QRS para a direita'],
  pegadinha: 'P apiculada não é sinônimo de doença atrial: onda T alta e apiculada da hipercalemia costuma ser confundida com ela, e a diferença é onde o achado está no ciclo — a P vem antes do QRS, a T depois. E lembre que P pulmonale pode ser transitória, aparecendo só durante a crise de broncoespasmo ou na fase aguda do TEP.',
  conduta: 'Não se trata o traçado, e sim a causa: DPOC, cor pulmonale, hipertensão pulmonar, TEP crônico, valvopatia tricúspide, cardiopatia congênita. Ecocardiograma para confirmar sobrecarga e estimar a pressão pulmonar.',
  confunde: ['hipercalemia', 'tep', 'hvd']
},
{
  id: 'p_mitrale', nome: 'Sobrecarga atrial esquerda (P mitrale)', cat: 'metabolico', nivel: 2, view: V12,
  build: () => {
    const r = ritmoSinusal(72, 10, {seed: 305, pNotched: true, pScale: 1.45});
    return {dur: 10, seed: 305, beats: r.beats,
            atrial: Object.assign({}, r.atrial, {dur: 0.17}),
            global: {pr: 0.18}, leadMods: ml({'V1': {p: -0.17}, 'V2': {p: -0.05}})};
  },
  laudo: {ritmo: 'Sinusal', fc: '≈ 72 bpm', eixo: 'Normal',
    pr: 'Normal, com onda P alargada e bífida', qrs: 'Estreito',
    stt: 'Sem alterações agudas',
    conclusao: 'Sobrecarga atrial esquerda (P mitrale)'},
  criterios: ['Onda P LARGA: duração ≥ 120 ms',
    'P bífida em DII, com intervalo entre os dois picos > 40 ms',
    'Índice de Morris: componente negativo terminal da P em V1 com profundidade ≥ 1 mm e duração ≥ 40 ms',
    'A amplitude da P permanece normal — cresce em largura, não em altura'],
  pegadinha: 'A sobrecarga atrial esquerda é o substrato anatômico da fibrilação atrial: um átrio dilatado e fibrosado é o terreno onde a FA nasce. Encontrar P mitrale num paciente com palpitações é um alerta para pesquisar FA paroxística com Holter, mesmo que este ECG esteja em ritmo sinusal.',
  conduta: 'Ecocardiograma para medir o átrio esquerdo e procurar a causa — valvopatia mitral, hipertensão arterial, miocardiopatia, disfunção diastólica. Tratar a doença de base e controlar a pressão.',
  confunde: ['p_pulmonale', 'sinusal', 'fa']
},
{
  id: 'hvd', nome: 'Sobrecarga ventricular direita', cat: 'metabolico', nivel: 2, view: V12,
  build: () => B(84, {seed: 311}, {},
    ml({'V1': {r: 0.90, s: 0.34, st: -0.10, stCurv: -0.04, tAmp: -0.34},
        'V2': {r: 0.95, s: 0.35, tAmp: -0.28}, 'V3': {r: 0.70, s: 0.60, tAmp: -0.16},
        'V5': {r: 0.55, s: 0.45}, 'V6': {r: 0.45, s: 0.55},
        'DI': {r: 0.35, s: 0.50}, 'aVL': {r: 0.25, s: 0.45},
        'DIII': {r: 1.05, s: 0.08}, 'aVF': {r: 0.92}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 84 bpm', eixo: 'Desviado à direita',
    pr: 'Normal', qrs: 'Estreito, com R dominante em V1',
    stt: 'Infra de ST e T negativa em V1–V3 (padrão strain direito)',
    conclusao: 'Sobrecarga ventricular direita'},
  criterios: ['Relação R/S > 1 em V1, com onda R ≥ 7 mm',
    'Desvio do eixo para a direita (além de +90°)',
    'Onda S persistente e profunda em V5–V6',
    'Padrão strain: infra de ST com T negativa em V1–V3'],
  pegadinha: 'Onda R dominante em V1 tem três explicações principais, e você precisa separá-las: sobrecarga de VD (esta), IAM posterior (que vem com INFRA de ST em V1–V3 e T positiva, e é emergência) e bloqueio de ramo direito (em que o QRS é LARGO, com padrão rSR\'). Olhe a largura do QRS e o ST antes de decidir.',
  conduta: 'Ecocardiograma para confirmar e buscar a causa: hipertensão pulmonar, estenose pulmonar, cardiopatia congênita, DPOC avançado, TEP crônico. O tratamento é o da doença de base.',
  confunde: ['iam_posterior', 'brd', 'p_pulmonale']
},
{
  id: 'hbpe', nome: 'Bloqueio divisional posteroinferior', cat: 'conducao', nivel: 2, view: V12,
  build: () => B(76, {seed: 310}, {qrsDur: 0.10},
    ml({'DI': {q: 0, r: 0.22, s: 0.88}, 'aVL': {q: 0, r: 0.18, s: 0.80},
        'DII': {q: 0.10, r: 1.05, s: 0.05}, 'DIII': {q: 0.15, r: 1.28, s: 0.04},
        'aVF': {q: 0.12, r: 1.15, s: 0.05}})),
  laudo: {ritmo: 'Sinusal', fc: '≈ 76 bpm', eixo: 'Desviado à direita (≈ +120°)',
    pr: 'Normal', qrs: '100 ms', stt: 'Sem alterações agudas',
    conclusao: 'Bloqueio divisional posteroinferior (hemibloqueio posterior)'},
  criterios: ['Eixo desviado à direita, entre +90° e +180°',
    'Padrão rS em DI e aVL',
    'Padrão qR em DII, DIII e aVF',
    'QRS de duração normal (< 120 ms) — é um bloqueio divisional, não de ramo'],
  pegadinha: 'É diagnóstico de EXCLUSÃO e muito mais raro que o anterossuperior, porque a divisão posterior é curta, espessa e tem irrigação dupla. Antes de laudá-lo, descarte as causas comuns de desvio à direita: biotipo longilíneo, sobrecarga de VD, DPOC, TEP e IAM lateral. E quando ele aparece junto com bloqueio de ramo direito, você está diante de bloqueio bifascicular — que sinaliza doença extensa do sistema de condução.',
  conduta: 'Isolado e assintomático, não requer conduta. Associado a BRD (bifascicular), sobretudo com PR prolongado ou síncope, avaliar risco de progressão para BAV total e indicação de marca-passo.',
  confunde: ['hbae', 'tep', 'hvd']
}
];

/* Índice por id */
const PMAP = {};
PADROES.forEach(p => PMAP[p.id] = p);
const MAPA_ANATOMICO = {
  'iam_anterior': { ids: ['parede-anterior', 'art-da'], leg: 'Parede Anterior (Artéria Descendente Anterior)' },
  'iam_inferior': { ids: ['parede-inferior', 'art-cd'], leg: 'Parede Inferior (Coronária Direita)' },
  'iam_lateral':  { ids: ['parede-lateral', 'art-cx'], leg: 'Parede Lateral (Artéria Circunflexa)' },
  'iam_vd':       { ids: ['parede-vd', 'art-cd'], leg: 'Ventrículo Direito (Coronária Direita)' },
  'dewinter':     { ids: ['parede-anterior', 'art-da'], leg: 'Oclusão Proximal da Descendente Anterior' },
  'wellens_a':    { ids: ['parede-anterior', 'art-da'], leg: 'Estenose Crítica da Descendente Anterior' },
  'wellens_b':    { ids: ['parede-anterior', 'art-da'], leg: 'Estenose Crítica da Descendente Anterior' },
  'zona_inativa': { ids: ['parede-anterior', 'art-da'], leg: 'Sequela de infarto anterosseptal (Descendente Anterior)' }
};
function getAnatomiaHTML() {
  return `
    <div class="anatomia-box" style="display:none;">
      <svg class="anatomia-svg" viewBox="0 0 100 100">
        <path id="parede-vd" class="xilo-fundo" d="M50,20 C20,20 10,50 35,85 L50,95 L50,20 Z" />
        <path id="parede-anterior" class="xilo-fundo" d="M50,20 C80,20 90,50 65,85 L50,95 L50,20 Z" />
        <path id="parede-lateral" class="xilo-fundo" d="M65,85 C90,50 80,20 50,20 C65,25 80,50 65,85 Z" />
        <path id="parede-inferior" class="xilo-fundo" d="M35,85 L50,95 L65,85 C55,92 45,92 35,85 Z" />
        <path class="xilo-traco" d="M50,20 C20,20 10,50 35,85 L50,95 L65,85 C90,50 80,20 50,20 Z" />
        <path class="xilo-traco" d="M50,20 L50,95" />
        <path id="art-cd" class="vaso" d="M50,22 C30,30 15,55 35,80" />
        <path id="art-da" class="vaso" d="M50,22 C45,45 55,70 48,90" />
        <path id="art-cx" class="vaso" d="M50,22 C70,35 85,55 60,75" />
      </svg>
      <div class="anatomia-legenda"></div>
    </div>
  `;
}
function atualizarAnatomia(patologiaId, hostElement) {
  let container = hostElement.querySelector('.anatomia-box');
  if (!container) {
    const wrap = document.createElement('div');
    wrap.innerHTML = getAnatomiaHTML();
    container = wrap.firstElementChild;
    hostElement.appendChild(container);
  }

  container.querySelectorAll('.isquemia-ativa').forEach(el => el.classList.remove('isquemia-ativa'));

  const mapa = MAPA_ANATOMICO[patologiaId];
  if (mapa) {
    container.style.display = 'flex';
    mapa.ids.forEach(id => {
      const el = container.querySelector('#' + id);
      if (el) el.classList.add('isquemia-ativa');
    });
    container.querySelector('.anatomia-legenda').textContent = mapa.leg;
  } else {
    container.style.display = 'none';
  }
}

/* Categorias dos padrões, usadas na biblioteca e nos filtros. */
const CATS = {
  base:       'Traçados de base',
  ritmo:      'Ritmos e arritmias',
  conducao:   'Distúrbios de condução',
  isquemia:   'Isquemia e infarto',
  metabolico: 'Metabólico, armadilhas e outros'
};
