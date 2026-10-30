/* ==========================================================================
   CENÁRIOS DO SIMULADOR ACLS
   Conferência: Diretrizes AHA 2025 de RCP e ACE, Parte 9 (suporte avançado de
   vida em adultos) — algoritmos de PCR, bradicardia e taquicardia com pulso.
   Casos fictícios; revisão independente por especialista pendente.

   Cada cenário tem estados (ritmo e sinais vitais) e regras que mudam de estado
   conforme o que a equipe faz. A primeira regra que casar é aplicada.
     em      'choque' (não sincronizado) | 'cardioversao' (sincronizada) |
             'droga' | 'acao' | 'captura' | 'perdaCaptura' | 'tempo'
     estado  nome ou lista de estados em que a regra vale
     droga   id ou grupo do fármaco; alternativas com '|'
     acao    id da ação (vagal, via_aerea, acesso, cabos)
     minJ    energia mínima do choque
     n       só a partir da n-ésima ocorrência deste evento no estado atual
     apos    (tempo) segundos no estado atual
     requer  fármacos já dados no cenário; alternativas com '|'
     ir      novo estado          msg  nota para o instrutor (vai ao registro)
   causa (opcional, no cenário): id da causa reversível que o líder deve registrar
   Sem regra aplicável, o simulador usa a resposta padrão (ex.: FV persiste).
   ========================================================================== */
const CENARIOS_ACLS = [

{
  id: 'fv', titulo: 'Colapso na recepção', grupo: 'PCR',
  resumo: 'Homem, 61 anos, cai na recepção do pronto-socorro. Não responde e não respira normalmente. As pás do desfibrilador acabam de ser posicionadas.',
  objetivo: 'FV refratária: RCP imediata, choque precoce, epinefrina após falha dos choques iniciais, antiarrítmico na FV refratária. RCE no 3º choque ou depois, desde que epinefrina e amiodarona (ou lidocaína) já tenham sido dadas. Após o RCE, ECG de 12 derivações com IAMCSST anterior.',
  inicial: 'fv',
  estados: {
    fv:  {ritmo: 'fv_grossa', desc: 'FV grossa. Os choques não revertem até que epinefrina e antiarrítmico tenham sido dados.'},
    rce: {ritmo: 'sinusal', fc: 104, pas: 94, pad: 58, spo2: 93, etco2: 44, fr: 12, rce: true, padrao12: 'iam_anterior',
          desc: 'RCE. ECG com supra de ST anterior: cateterismo de emergência. Alvos: PAS ≥ 90, PAM ≥ 65, SpO₂ 90–98%, controle de temperatura.'}
  },
  regras: [
    {em: 'choque', estado: 'fv', n: 3, requer: ['epinefrina', 'amiodarona|lidocaina'], ir: 'rce', msg: 'Choque após epinefrina e antiarrítmico: RCE.'}
  ]
},

{
  id: 'tvsp', titulo: 'TV sem pulso na enfermaria', grupo: 'PCR',
  resumo: 'Mulher, 67 anos, cardiopata, internada por descompensação. A enfermagem a encontra irresponsiva; o monitor mostra taquicardia de QRS largo.',
  objetivo: 'Reconhecer TV sem pulso (checar pulso!) e desfibrilar sem sincronizar. RCE no 2º choque.',
  inicial: 'tvsp',
  estados: {
    tvsp: {ritmo: 'tvsp', fc: 188, desc: 'TV monomórfica sem pulso: tratar como FV (desfibrilação não sincronizada).'},
    rce:  {ritmo: 'sinusal', fc: 96, pas: 100, pad: 62, spo2: 95, etco2: 40, fr: 14, rce: true, padrao12: 'sinusal',
           desc: 'RCE. Investigar causa (isquemia, eletrólitos), alvos pós-PCR.'}
  },
  regras: [
    {em: 'choque', estado: 'tvsp', n: 2, ir: 'rce', msg: '2º choque: RCE.'}
  ]
},

{
  id: 'aesp', causa: 'hipovolemia', titulo: 'Hemorragia digestiva', grupo: 'PCR',
  resumo: 'Mulher, 74 anos, melena volumosa há 2 dias. Fica irresponsiva na maca; o monitor mostra ritmo organizado e rápido.',
  objetivo: 'AESP: RCP, epinefrina o quanto antes, buscar causas (H e T). Hipovolemia: RCE quando volume ou hemácias forem dados junto com a epinefrina. Atropina e choque não têm papel.',
  inicial: 'aesp',
  estados: {
    aesp: {ritmo: 'aesp', fc: 118, qrs: 'estreito', desc: 'AESP taquicárdica de QRS estreito: hipovolemia.'},
    rce:  {ritmo: 'taqui_sinusal', fc: 122, pas: 82, pad: 50, spo2: 95, etco2: 36, fr: 18, rce: true, padrao12: 'taqui_sinusal',
           desc: 'RCE com hipotensão: manter reposição (hemoderivados), vasopressor se necessário, endoscopia. Alvo PAS ≥ 90 / PAM ≥ 65.'}
  },
  regras: [
    {em: 'droga', droga: 'cristaloide|hemacias', estado: 'aesp', requer: ['epinefrina'], ir: 'rce', msg: 'Volume com epinefrina já dada: RCE.'},
    {em: 'droga', droga: 'epinefrina', estado: 'aesp', requer: ['cristaloide|hemacias'], ir: 'rce', msg: 'Epinefrina após reposição: RCE.'}
  ]
},

{
  id: 'assistolia', titulo: 'Assistolia no leito', grupo: 'PCR',
  resumo: 'Homem, 80 anos, encontrado irresponsivo no leito. Monitor com linha praticamente reta.',
  objetivo: 'Assistolia: confirmar (cabos e ganho), RCP, epinefrina o quanto antes. Marcapasso e atropina não são indicados na PCR. RCE após a 2ª dose de epinefrina.',
  inicial: 'assistolia',
  estados: {
    assistolia: {ritmo: 'assistolia', desc: 'Assistolia. Não chocável.'},
    rce: {ritmo: 'bradi_sinusal', fc: 54, pas: 88, pad: 54, spo2: 92, etco2: 38, fr: 12, rce: true, padrao12: 'brady_sinusal',
          desc: 'RCE com bradicardia e hipotensão limítrofe: vasopressor, investigar causa, alvos pós-PCR.'}
  },
  regras: [
    {em: 'droga', droga: 'epinefrina', estado: 'assistolia', n: 2, ir: 'rce', msg: '2ª dose de epinefrina: RCE.'}
  ]
},

{
  id: 'torsades', causa: 'toxicos', titulo: 'QT longo e síncope', grupo: 'PCR',
  resumo: 'Mulher, 45 anos, em uso de antipsicótico e macrolídeo, diarreia há 3 dias. Colapsa durante a triagem.',
  objetivo: 'TV polimórfica sem pulso: desfibrilação não sincronizada (o SINC não detecta R) e sulfato de magnésio. Evitar amiodarona (prolonga o QT). RCE no choque dado após o magnésio.',
  inicial: 'torsades',
  estados: {
    torsades: {ritmo: 'torsades', desc: 'Torsades de pointes sem pulso.'},
    rce: {ritmo: 'sinusal', fc: 82, pas: 102, pad: 64, spo2: 96, etco2: 38, fr: 14, rce: true, padrao12: 'qt_longo',
          desc: 'RCE. QT longo: suspender fármacos, corrigir K e Mg.'}
  },
  regras: [
    {em: 'choque', estado: 'torsades', requer: ['magnesio'], ir: 'rce', msg: 'Choque após magnésio: RCE.'}
  ]
},

{
  id: 'bavt', titulo: 'Síncope no idoso', grupo: 'Bradicardia',
  resumo: 'Homem, 78 anos, tontura e duas síncopes hoje. Confuso, sudoreico, extremidades frias.',
  objetivo: 'Bradicardia instável por BAVT com escape largo: atropina pode ser tentada (não responde); marcapasso transcutâneo ou infusão de epinefrina/dopamina. Captura a partir de 65 mA. Confirmar captura mecânica pelo pulso. Sem tratamento por 5 min: piora.',
  inicial: 'inicial',
  estados: {
    inicial:    {ritmo: 'bavt', fc: 34, pas: 72, pad: 40, spo2: 94, etco2: 33, fr: 20, limiarMa: 65, padrao12: 'bavt',
                 desc: 'BAVT, escape ventricular de 34 bpm, hipotensão e confusão.'},
    piora:      {ritmo: 'bavt', fc: 28, pas: 58, pad: 32, spo2: 90, etco2: 28, fr: 24, limiarMa: 65, padrao12: 'bavt',
                 desc: 'Deterioração: escape mais lento, choque.'},
    infusao:    {ritmo: 'bavt', fc: 46, pas: 88, pad: 52, spo2: 95, etco2: 34, fr: 18, limiarMa: 65, padrao12: 'bavt',
                 desc: 'Resposta parcial à infusão. Preparar estimulação transcutânea/transvenosa.'},
    estimulado: {ritmo: 'bavt', fc: 34, pas: 112, pad: 66, spo2: 97, etco2: 36, fr: 16, limiarMa: 65, padrao12: 'bavt',
                 desc: 'Captura elétrica e mecânica. Analgesia e sedação, marcapasso transvenoso, cardiologia.'}
  },
  regras: [
    {em: 'droga', droga: 'atropina', estado: ['inicial', 'piora'], msg: 'Sem resposta à atropina (bloqueio infranodal com escape largo).'},
    {em: 'captura', estado: ['inicial', 'piora', 'infusao'], ir: 'estimulado'},
    {em: 'perdaCaptura', estado: 'estimulado', ir: 'inicial', msg: 'Sem estimulação efetiva: volta ao escape de 34 bpm.'},
    {em: 'droga', droga: 'epi_infusao|dopamina', estado: ['inicial', 'piora'], ir: 'infusao'},
    {em: 'tempo', estado: 'inicial', apos: 300, ir: 'piora', msg: '5 min sem tratamento efetivo: deterioração.'}
  ]
},

{
  id: 'bradi_iam', titulo: 'Dor torácica e bradicardia', grupo: 'Bradicardia',
  resumo: 'Homem, 58 anos, dor torácica opressiva há 1 hora, náuseas e sudorese. Tonto ao sentar.',
  objetivo: 'Bradicardia sinusal com hipoperfusão em IAM inferior: atropina 1 mg (responde). ECG de 12 derivações com IAMCSST inferior: hemodinâmica.',
  inicial: 'inicial',
  estados: {
    inicial:    {ritmo: 'bradi_sinusal', fc: 38, pas: 78, pad: 46, spo2: 95, etco2: 34, fr: 18, limiarMa: 55, padrao12: 'iam_inferior',
                 desc: 'Bradicardia sinusal de 38 bpm com hipotensão. IAM inferior.'},
    resposta:   {ritmo: 'sinusal', fc: 68, pas: 106, pad: 66, spo2: 97, etco2: 36, fr: 16, limiarMa: 55, padrao12: 'iam_inferior',
                 desc: 'Respondeu à atropina. Acionar a hemodinâmica; avaliar VD (V4R).'},
    estimulado: {ritmo: 'bradi_sinusal', fc: 38, pas: 104, pad: 64, spo2: 97, etco2: 36, fr: 16, limiarMa: 55, padrao12: 'iam_inferior',
                 desc: 'Estimulação com captura. Atropina continua sendo a primeira opção neste caso.'}
  },
  regras: [
    {em: 'droga', droga: 'atropina', estado: ['inicial', 'estimulado'], ir: 'resposta', msg: 'Resposta à atropina.'},
    {em: 'captura', estado: 'inicial', ir: 'estimulado'},
    {em: 'perdaCaptura', estado: 'estimulado', ir: 'inicial'}
  ]
},

{
  id: 'tsv', titulo: 'Palpitações súbitas', grupo: 'Taquicardia',
  resumo: 'Mulher, 32 anos, palpitações de início súbito há 40 minutos. Lúcida, sem dor, sem dispneia.',
  objetivo: 'TSV estável: manobra vagal (sem resposta), adenosina 6 mg (sem resposta), 12 mg (reverte). Cardioversão sincronizada também reverte, mas não é a primeira escolha no paciente estável.',
  inicial: 'inicial',
  estados: {
    inicial:    {ritmo: 'tsv', fc: 186, pas: 118, pad: 76, spo2: 98, etco2: 36, fr: 18, padrao12: 'tsv',
                 desc: 'TSV regular de QRS estreito, estável.'},
    convertida: {ritmo: 'sinusal', fc: 88, pas: 122, pad: 78, spo2: 98, etco2: 37, fr: 16, padrao12: 'sinusal',
                 desc: 'Revertida para ritmo sinusal.'}
  },
  regras: [
    {em: 'acao', acao: 'vagal', estado: 'inicial', msg: 'Manobra vagal sem reversão.'},
    {em: 'droga', droga: 'adenosina', estado: 'inicial', n: 2, ir: 'convertida', msg: 'Pausa breve e reversão com a 2ª dose.'},
    {em: 'droga', droga: 'adenosina', estado: 'inicial', msg: 'Bloqueio AV transitório, sem reversão.'},
    {em: 'cardioversao', estado: 'inicial', ir: 'convertida'}
  ]
},

{
  id: 'fa_instavel', titulo: 'Dispneia e hipotensão', grupo: 'Taquicardia',
  resumo: 'Homem, 70 anos, dispneia progressiva e palpitações desde ontem. Pálido, PA baixa, estertores em bases.',
  objetivo: 'FA de alta resposta instável: cardioversão sincronizada. AHA 2025: na FA, é razoável iniciar com ≥ 200 J (bifásico). Abaixo de 200 J não reverte neste cenário. Choque não sincronizado precipita FV.',
  inicial: 'inicial',
  estados: {
    inicial:   {ritmo: 'fa', fc: 168, pas: 76, pad: 44, spo2: 90, etco2: 30, fr: 28, padrao12: 'fa',
                desc: 'FA com resposta ventricular rápida, hipotensão e congestão.'},
    revertida: {ritmo: 'sinusal', fc: 92, pas: 108, pad: 68, spo2: 94, etco2: 35, fr: 20, padrao12: 'sinusal',
                desc: 'Revertida. Anticoagulação e investigação.'}
  },
  regras: [
    {em: 'cardioversao', estado: 'inicial', minJ: 200, ir: 'revertida', msg: 'Cardioversão ≥ 200 J: reversão.'},
    {em: 'cardioversao', estado: 'inicial', msg: 'Não reverteu. Aumente a energia (FA: iniciar com ≥ 200 J).'}
  ]
},

{
  id: 'tv_pulso', titulo: 'Taquicardia de QRS largo', grupo: 'Taquicardia',
  resumo: 'Homem, 64 anos, infarto prévio, palpitações e pré-síncope. Sonolento, PA baixa.',
  objetivo: 'TV monomórfica com pulso e instável: cardioversão sincronizada (o algoritmo cita 100 J como referência; seguir o aparelho). Abaixo de 100 J não reverte neste cenário. Sem cardioversão por 4 min: perde o pulso.',
  inicial: 'inicial',
  estados: {
    inicial:   {ritmo: 'tv', fc: 176, pas: 74, pad: 46, spo2: 93, etco2: 32, fr: 24, padrao12: 'tv',
                desc: 'TV monomórfica com pulso, hipotensão e rebaixamento.'},
    sempulso:  {ritmo: 'tvsp', fc: 190, desc: 'TV sem pulso: desfibrilação não sincronizada.'},
    revertida: {ritmo: 'sinusal', fc: 96, pas: 104, pad: 66, spo2: 96, etco2: 36, fr: 18, padrao12: 'sinusal',
                desc: 'Revertida. Antiarrítmico de manutenção conforme a cardiologia; investigar isquemia.'}
  },
  regras: [
    {em: 'cardioversao', estado: 'inicial', minJ: 100, ir: 'revertida', msg: 'Cardioversão sincronizada: reversão.'},
    {em: 'cardioversao', estado: 'inicial', msg: 'Não reverteu. Aumente a energia.'},
    {em: 'droga', droga: 'amiodarona_pulso|adenosina', estado: 'inicial', msg: 'Sem reversão. Paciente instável: cardioversão.'},
    {em: 'tempo', estado: 'inicial', apos: 240, ir: 'sempulso', msg: 'Deterioração: TV sem pulso.'},
    {em: 'choque', estado: 'sempulso', ir: 'revertida', msg: 'Desfibrilação: RCE.'}
  ]
}

];
