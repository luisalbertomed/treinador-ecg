/* Simulador de atendimento · casos fictícios. Conferência e limites: LEIA-ME-v4.0.md.
   AHA 2025 Partes 9/10/11/12; SCA 2025; dor torácica 2021 e consenso ACC 2022. */
Object.assign(CASE_SOURCES,{
 special:{name:'Circunstâncias especiais de reanimação · AHA 2025, Parte 10',url:'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-and-pediatric-special-circumstances-of-resuscitation'},
 post:{name:'Cuidados pós-parada · AHA 2025, Parte 11',url:'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/post-cardiac-arrest-care'},
 chest2021:{name:'Avaliação da dor torácica · ACC/AHA 2021',url:'https://www.acc.org/-/media/Non-Clinical/Files-PDFs-Excel-MS-Word-etc/Guidelines/2021/GMS-Chest-Pain-Eng-gl_chestpain.pdf'},
 heart:{name:'HEART · critérios dos autores do escore',url:'https://www.heartscore.nl/score/'}
});
function decisoesAtendimento(text,why,wrong){
 return [{text,why,ok:true},...wrong.map(x=>({text:x[0],why:x[1]}))];
}
function cenaComPulso(){return {kind:'Avaliação inicial',points:5,noECG:true,
 vitals:'Você acaba de chegar. Avaliação de respiração, pulso e perfusão ainda não registrada.',
 prompt:'Como você começa a avaliação?',options:decisoesAtendimento(
 'Confirmar segurança, responsividade, respiração, pulso e sinais de perfusão; chamar ajuda conforme a gravidade',
 'O atendimento parte da pessoa. A presença de pulso e o comprometimento da perfusão definem o caminho seguinte.',[
 ['Escolher choque ou medicação apenas pela queixa','A queixa não define o ritmo nem a estabilidade.'],
 ['Começar compressões sem avaliar a pessoa','A RCP é indicada quando a parada é reconhecida, não apenas por uma queixa cardiovascular.'],
 ['Encaminhar para a fila comum sem avaliação','Uma avaliação inicial é necessária para reconhecer uma emergência.']])};}
function equipeComPulso(points=10){return {kind:'Liderança da equipe',points,noECG:true,multi:true,
 selectionHint:'Marque as ações de coordenação indicadas agora e confirme.',
 context:'O suporte inicial continua. Distribua tarefas sem interromper a monitorização ou atrasar a conduta indicada.',
 prompt:'Como você organiza a equipe?',options:[
 {text:'Designar monitorização e reavaliação de pulso, pressão e oxigenação',ok:true,why:'A equipe acompanha a resposta e identifica deterioração.'},
 {text:'Designar acesso e medicações; confirmar entendimento, execução e horário de cada ordem',ok:true,why:'A comunicação em alça fechada é um modelo didático de liderança; a Parte 12 apoia o treinamento dessas competências.'},
 {text:'Designar o equipamento e a segurança do procedimento elétrico, quando indicado',ok:true,why:'Preparação e segurança ocorrem em paralelo ao atendimento.'},
 {text:'Registrar achados, condutas e resposta para a passagem do cuidado',ok:true,why:'O registro permite continuidade e reduz omissões.'},
 {text:'Interromper o suporte e a monitorização para discutir as funções',bad:true,why:'A organização não justifica interromper o cuidado.'},
 {text:'Administrar uma segunda dose sem confirmar se a primeira foi executada',bad:true,why:'Pode duplicar a medicação. Confirme a execução antes de repetir.'}
 ]};}
function passagemDoCuidado(points=10){return {kind:'Passagem do cuidado',points,noECG:true,
 vitals:'Pulso presente · equipe de continuidade disponível · monitorização mantida',
 prompt:'Como você conclui esta fase do atendimento?',options:decisoesAtendimento(
 'Transmitir achados, evolução, tratamentos e horários; manter monitorização e planejar a investigação da causa com a equipe que recebe',
 'A melhora imediata não encerra a investigação. A passagem dirigida mantém a continuidade do cuidado.',[
 ['Liberar sem reavaliação porque a primeira intervenção funcionou','A resposta precisa ser reavaliada e a causa ainda pode exigir tratamento.'],
 ['Transferir sem informar as medicações administradas','A equipe que recebe precisa conhecer tratamentos e horários.'],
 ['Suspender toda monitorização enquanto aguarda transporte','A monitorização continua conforme o risco clínico.']])};}
const V4_ESTABILIDADE={
 estavel:{label:'Sala de emergência com monitor, acesso venoso e desfibrilador disponíveis.'},
 instavel:{label:'Sala de emergência com monitor, acesso venoso e desfibrilador disponíveis.'}
};
const V4_SINAIS={
 estavel:'Alerta · PA 124/78 mmHg · pulso palpável · SpO₂ 97% · sem sinais de choque ou insuficiência cardíaca aguda',
 instavel:'Confusão aguda · PA 76/44 mmHg · extremidades frias · pulso palpável · sinais de hipoperfusão'
};
const V4_ERR_STABILIDADE=[
 ['Tratar a frequência como único critério de gravidade','A gravidade depende da perfusão e do contexto, além da frequência.'],
 ['Considerar parada apenas pelo traçado alterado','A parada depende da avaliação clínica; nesta etapa há pulso.'],
 ['Aguardar exames para avaliar perfusão','A avaliação de perfusão é imediata e orienta o tratamento.']
];
const V4_ERR_TERAPIA=[
 ['Usar adenosina em qualquer taquicardia, inclusive irregular de QRS largo','A adenosina não é tratamento universal; é inadequada em taquicardia irregular de QRS largo.'],
 ['Fazer choque não sincronizado em toda arritmia com pulso','O procedimento depende do ritmo e da situação. Não há uma indicação universal de desfibrilação com pulso.'],
 ['Aguardar a perda do pulso antes de tratar','É necessário tratar o comprometimento hemodinâmico antes de a pessoa evoluir para parada.']
];
const V4_BRADI_ERR=[
 ['Desfibrilar o ritmo lento com pulso','Não há indicação de desfibrilação de uma bradicardia com pulso.'],
 ['Dar adenosina para melhorar a condução','A adenosina pode piorar o bloqueio atrioventricular.'],
 ['Esperar passivamente a perda do pulso','A intervenção e a investigação são orientadas pelo comprometimento de perfusão.']
];
function ritmoComPulso(d){
 const bradi=!!d.bradi,patterns=d.pattern;
 const recognize=sc=>decisoesAtendimento(d.dx+(sc==='estavel'?'; pulso presente e perfusão preservada nesta avaliação':'; pulso presente e comprometimento hemodinâmico nesta avaliação'),
  'Interprete o monitor e os achados clínicos juntos; a pressão e a perfusão determinam a urgência.',V4_ERR_STABILIDADE);
 const therapy=sc=>decisoesAtendimento(d[sc],d.why,bradi?V4_BRADI_ERR:V4_ERR_TERAPIA);
 const steps=[cenaComPulso(),{kind:'Suporte inicial',points:10,noECG:true,
  vitals:V4_SINAIS.estavel,variants:{instavel:{vitals:V4_SINAIS.instavel}},
  prompt:'Quais medidas você inicia enquanto obtém o ritmo?',options:decisoesAtendimento(
  'Manter via aérea e suporte respiratório conforme necessário, monitorizar ritmo, pressão e oximetria, obter acesso e ECG; oxigênio conforme a necessidade clínica',
  'O suporte inicial e a avaliação do ritmo ocorrem sem atrasar o tratamento da instabilidade.',[
  ['Esperar exames laboratoriais antes da monitorização','Exames não devem atrasar o suporte.'],
  ['Administrar uma medicação para arritmia antes de registrar o ritmo','O ritmo orienta a escolha da medicação.'],
  ['Liberar porque ainda há pulso','Pulso presente não exclui uma emergência.']])},
 {kind:'Interpretação e perfusão',points:20,prompt:'Qual é sua interpretação do monitor e da situação clínica?',
  options:recognize('estavel'),variants:{instavel:{options:recognize('instavel')}}},
 {kind:'Conduta inicial',points:25,noECG:true,prompt:'Qual ordem você dá agora?',
  options:therapy('estavel'),variants:{instavel:{options:therapy('instavel')}}},equipeComPulso(),
 {kind:'Reavaliação',points:20,pattern:patterns,
  context:d.follow||'A equipe reavalia após as medidas iniciais. A investigação da causa continua.',
  prompt:d.followPrompt||'Qual é a conduta nesta reavaliação?',
  options:decisoesAtendimento(d.afterStable||'Reavaliar perfusão e resposta, manter monitorização e conduzir a investigação com a equipe responsável',d.afterWhy||'O cuidado é guiado pela resposta e pela causa, não apenas por um número de frequência.',bradi?V4_BRADI_ERR:V4_ERR_TERAPIA),
  variants:{instavel:{context:d.unstableFollow||'A equipe reavalia o quadro após a primeira intervenção. O pulso continua presente.',
   options:decisoesAtendimento(d.afterUnstable||'Reavaliar a resposta, manter suporte e discutir a continuidade do tratamento com a equipe especializada',d.afterWhy||'A resposta da pessoa e a causa orientam a próxima decisão.',bradi?V4_BRADI_ERR:V4_ERR_TERAPIA)}}},passagemDoCuidado()];
 return {id:d.id,module:'ritmo',atendimento:true,track:bradi?'bradi':'taqui',title:d.title,level:'Atendimento simulado',pattern:patterns,
  patient:d.patient,scenarios:V4_ESTABILIDADE,sources:['als','education'],
  sourceNote:'Caso fictício. Condutas e algoritmos conferidos na AHA 2025 Parte 9 (texto e Figuras 6–8). Exemplos específicos de liderança são modelos didáticos; competências de equipe apoiadas pela Parte 12. Revisão por especialista pendente.',steps};
}
const repolInespecifica={id:'repol_inespecifica',nome:'Alteração inespecífica da repolarização',cat:'metabolico',nivel:2,view:V12,semQuiz:true,
 build:()=>B(76,{seed:410},{},ml({'DI,aVL,V5,V6':{tAmp:0.04,st:0}})),
 laudo:{ritmo:'Sinusal',fc:'≈ 76 bpm',eixo:'Normal',pr:'Normal',qrs:'Estreito',stt:'Ondas T de baixa amplitude laterais, sem desvio significativo do ST',conclusao:'Alteração inespecífica de repolarização: correlacionar com clínica e exames seriados'},
 criterios:['Ondas T de baixa amplitude em derivações laterais','Sem supra ou infra significativo do ST neste traçado','O achado isolado não define nem exclui SCA'],
 pegadinha:'Alteração inespecífica não significa ausência de risco; considere sintomas, ECG anterior e biomarcadores.',
 conduta:'Avaliar no contexto e seguir a via de decisão da dor torácica.',confunde:['sinusal','scassst']};
PADROES.push(repolInespecifica);PMAP.repol_inespecifica=repolInespecifica;
CLINICAL_CASES.push(...[
 {id:'v4_tsv',title:'Palpitações abruptas no pronto atendimento',pattern:'tsv',dx:'Taquicardia regular de QRS estreito, compatível com TSV',
 patient:'Mulher, 35 anos, com palpitações de início súbito há 25 minutos. Sem asma, transplante cardíaco, cardiopatia conhecida ou uso de dipiridamol.',
 estavel:'Manobra vagal; se não resolver, adenosina 6 mg IV em bolus rápido com flush, podendo repetir 12 mg; manter monitorização',
 instavel:'Cardioversão sincronizada inicial de 100 J; sedação se viável sem atrasar o procedimento',
 why:'Na taquicardia regular estreita, manobra vagal e adenosina são opções quando a perfusão está preservada. Comprometimento hemodinâmico exige cardioversão sincronizada.',
 follow:'A manobra vagal e as doses indicadas de adenosina não resolveram; a pessoa mantém perfusão preservada.',
 afterStable:'Considerar cardioversão sincronizada e consulta especializada após falha de manobras vagais e tratamento farmacológico',
 unstableFollow:'Após o choque sincronizado, a perfusão melhora. A equipe continua monitorizando.',afterUnstable:'Reavaliar pulso, perfusão e ritmo; investigar a causa e registrar o procedimento'},
 {id:'v4_fa',title:'Palpitação irregular e falta de ar',pattern:'fa',dx:'Fibrilação atrial com resposta ventricular rápida',
 patient:'Mulher, 68 anos, relata palpitações e dispneia. Duração total da arritmia desconhecida; sem sinais de pré-excitação, disfunção sistólica conhecida ou insuficiência cardíaca descompensada.',
 estavel:'Controlar a frequência com betabloqueador IV ou bloqueador de cálcio não di-hidropiridínico, considerando contraindicações; avaliar duração e risco tromboembólico antes de cardioversão eletiva',
 instavel:'Cardioversão sincronizada com energia inicial de pelo menos 200 J, com sedação se viável sem atrasar; avaliar prevenção tromboembólica na continuidade',
 why:'O controle de frequência é opção na FA com perfusão preservada e sem pré-excitação. Se a instabilidade é causada pela FA, a cardioversão não deve esperar a avaliação eletiva de duração.',
 follow:'Durante a observação, a pessoa fica confusa, com PA 74/42 mmHg; a deterioração acompanha a aceleração da arritmia. Pulso ainda presente.',
 afterStable:'Reconhecer a deterioração e realizar cardioversão sincronizada com energia inicial de pelo menos 200 J',
 unstableFollow:'Após a cardioversão, a perfusão melhora e a equipe planeja a continuidade.',afterUnstable:'Manter monitorização e avaliar fatores precipitantes, anticoagulação e continuidade com a equipe'},
 {id:'v4_flutter',title:'Palpitações persistentes na sala de emergência',pattern:'flutter',dx:'Flutter atrial com resposta ventricular rápida',
 patient:'Homem, 63 anos, com palpitações persistentes. Duração total desconhecida; sem pré-excitação ou insuficiência cardíaca descompensada conhecida.',
 estavel:'Controlar a frequência conforme contraindicações e discutir estratégia de ritmo e risco tromboembólico com a equipe',
 instavel:'Cardioversão sincronizada inicial de 200 J; sedação se viável sem atrasar',
 why:'Flutter com comprometimento hemodinâmico relacionado ao ritmo exige cardioversão. O algoritmo elétrico 2025 indica 200 J para o primeiro choque sincronizado.',
 follow:'O pulso permanece presente; a equipe reavalia a resposta e o planejamento de ritmo.',
 afterStable:'Reavaliar frequência e perfusão e discutir cardioversão planejada após avaliação de duração e risco tromboembólico'},
 {id:'v4_tv_pulso',title:'Palpitação intensa em pessoa com cardiopatia',pattern:'tv',dx:'Taquicardia ventricular monomórfica com pulso',
 patient:'Homem, 70 anos, com infarto prévio e palpitações. Não há sinais de QT longo no registro anterior disponível.',
 estavel:'Considerar amiodarona 150 mg IV em 10 minutos e consulta especializada, monitorizando pressão; cardioversão se refratária ou se houver deterioração',
 instavel:'Cardioversão sincronizada inicial de 100 J; sedação se viável sem atrasar',
 why:'Na TV monomórfica com pulso, a perfusão determina a urgência. Amiodarona é uma opção no quadro tolerado; a instabilidade exige cardioversão sincronizada.',
 follow:'Após o tratamento, a equipe reavalia ritmo e perfusão. A pessoa permanece com pulso.'},
 {id:'v4_sinusal',title:'Palpitações durante febre e perda de líquidos',pattern:'taqui_sinusal',dx:'Taquicardia sinusal em resposta ao contexto clínico',
 patient:'Mulher, 40 anos, com febre, vômitos e baixa ingestão de líquidos. O aumento da frequência ocorreu progressivamente.',
 estavel:'Investigar e tratar febre, perda de volume e outras causas do aumento da frequência; reavaliar a resposta',
 instavel:'Tratar o choque e sua causa com suporte e reavaliação; não tentar resolver a taquicardia sinusal com cardioversão',
 why:'A frequência é resposta à doença de base. O algoritmo orienta avaliar se a arritmia causa a instabilidade ou é consequência dela.',
 follow:'A equipe está tratando a causa e acompanha perfusão, temperatura e perdas de líquidos.',afterStable:'Reavaliar a perfusão e a frequência conforme a resposta ao tratamento da causa',afterUnstable:'Prosseguir no tratamento do choque e da causa, reavaliando a resposta ao suporte'},
 {id:'v4_fa_preexc',title:'Palpitações muito rápidas e irregulares',pattern:'fa_preexc',dx:'Fibrilação atrial com pré-excitação, irregular e com complexos largos variáveis',
 patient:'Homem, 28 anos, com palpitações muito rápidas. Um ECG antigo disponível após a avaliação mostrou intervalo PR curto e onda delta.',
 estavel:'Evitar bloqueadores do nó AV e amiodarona IV; preparar cardioversão e consulta especializada para a FA com pré-excitação',
 instavel:'Cardioversão sincronizada imediata, com energia inicial de pelo menos 200 J se a sincronização for possível; evitar bloqueadores do nó AV',
 why:'Na FA com pré-excitação, bloqueadores do nó AV e amiodarona IV podem acelerar a condução pela via acessória e provocar FV. A Parte 9 aponta cardioversão como manejo apropriado.',
 follow:'A equipe reavalia a resposta e mantém a investigação da via acessória.',afterStable:'Manter monitorização e encaminhar para avaliação especializada da pré-excitação, evitando fármacos que bloqueiam o nó AV'},
 ...[
  ['v4_bradi_sinusal','Tontura com pulso lento','brady_sinusal','Bradicardia sinusal','Homem, 66 anos, com tontura e pulso lento. A equipe revisa medicamentos e causas reversíveis.'],
  ['v4_mobitz2','Episódios de tontura e mal-estar','mobitz2','Bloqueio atrioventricular de segundo grau Mobitz II','Mulher, 73 anos, com episódios de tontura e cansaço. Não há intoxicação conhecida.'],
  ['v4_bav_total','Perda breve de consciência e pulso lento','bavt','Bloqueio atrioventricular total','Homem, 77 anos, com síncope recente e pulso lento. Acesso venoso está disponível.']
 ].map(([id,title,pattern,dx,patient])=>({id,title,pattern,dx,patient,bradi:true,
  estavel:pattern==='brady_sinusal'?'Monitorizar, investigar e tratar causas reversíveis; reavaliar sintomas e perfusão':'Monitorizar, preparar possibilidade de estimulação e obter avaliação especializada urgente para o bloqueio de alto grau',
  instavel:'Atropina 1 mg IV; se não houver resposta, marca-passo transcutâneo e/ou infusão de adrenalina 2–10 µg/min ou dopamina 5–20 µg/kg/min, sem esperar a dose máxima para preparar estimulação',
  why:'A bradicardia é tratada conforme a perfusão e as causas. A atropina pode falhar nos bloqueios de alto grau; o suporte e a preparação da estimulação não devem ser atrasados.',
  follow:'A perfusão permanece preservada; a equipe continua procurando causas e avaliando a necessidade de intervenção.',
  unstableFollow:'A atropina não melhorou a perfusão. O pulso ainda está presente e a hipotensão persiste.',
  afterUnstable:'Iniciar marca-passo transcutâneo e/ou infusão cronotrópica; confirmar captura elétrica e mecânica e preparar estimulação transvenosa conforme a resposta',
  afterWhy:'Sem resposta à atropina, o algoritmo permite estimulação e/ou agonistas adrenérgicos enquanto se prepara o suporte definitivo.'}))
].map(ritmoComPulso));

/* FA com pré-excitação: irregularidade e graus variáveis de fusão do QRS.
   Padrão didático usado nas aulas/casos; não introduzido no quiz de diagnóstico. */
const V4_FA_PREEXC={id:'fa_preexc',nome:'Fibrilação atrial com pré-excitação',cat:'ritmo',nivel:3,semQuiz:true,view:D2V1,
 build:()=>{const r=ritmoIrregular(210,10,{seed:147}),s=PMAP.wpw.build();s.beats=r.beats.map((b,i)=>({...b,shape:'wpw',qrsDur:0.12+(i%5)*0.016,mods:{rScale:0.7+(i%4)*0.2}}));s.atrial={mode:'none'};return s;},
 laudo:{ritmo:'Irregular, com pré-excitação',fc:'≈ 210 bpm',eixo:'Variável',pr:'Não mensurável',qrs:'Largos, com graus variáveis de pré-excitação',stt:'Alterações secundárias',conclusao:'FA com pré-excitação'},
 criterios:['Taquicardia irregular com complexos largos e variação da morfologia','Contexto compatível com via acessória; avaliar traçado prévio','Diferenciar de TV polimórfica e outras taquicardias de QRS largo'],
 pegadinha:'Não bloquear o nó AV numa FA com pré-excitação.',conduta:'Cardioversão conforme a situação clínica e consulta especializada; evitar bloqueadores do nó AV e amiodarona IV.',confunde:['fa','tv','torsades']};
PADROES.push(V4_FA_PREEXC);PMAP.fa_preexc=V4_FA_PREEXC;

function cuidadosPosParada(points=20){return {kind:'Cuidados após o retorno da circulação',points,noECG:true,multi:true,
 vitals:'Pulso presente após reanimação · monitorização disponível · avaliação da consciência em andamento',
 selectionHint:'Marque as medidas que você coordena após o retorno da circulação.',
 prompt:'Quais cuidados você inicia nesta nova fase?',options:[
 {text:'Avaliar via aérea e ventilação; confirmar e monitorar o tubo com capnografia, quando houver intubação',ok:true,why:'Avalie o suporte respiratório necessário e a posição da via aérea.'},
 {text:'Usar oxigênio a 100% até uma medida confiável; depois titular para SpO₂ de 90% a 98%',ok:true,why:'A Parte 11 recomenda evitar hipóxia e hiperóxia depois que a medida confiável está disponível.'},
 {text:'Evitar hipotensão e manter pressão arterial média de pelo menos 65 mmHg',ok:true,why:'A perfusão após o retorno da circulação precisa ser sustentada. Fluido e vasoativo são escolhidos conforme o contexto.'},
 {text:'No paciente comatoso ventilado, buscar PaCO₂ geralmente entre 35 e 45 mmHg, com gasometria para orientar',ok:true,why:'A Parte 11 recomenda faixa fisiológica de PaCO₂ nessa situação.'},
 {text:'Obter ECG de 12 derivações, investigar e tratar a causa; acionar cuidados intensivos e avaliar necessidade de intervenção coronária',ok:true,why:'O cuidado segue após o retorno da circulação e depende da causa e dos achados.'},
 {text:'Planejar controle de temperatura e avaliação neurológica com a equipe, quando não houver resposta a comandos',ok:true,why:'O controle de temperatura e a avaliação neurológica requerem estratégia organizada; prognóstico não deve ser baseado em um sinal isolado precoce.'},
 {text:'Manter hiperóxia indefinidamente, mesmo com oximetria confiável',why:'Após medida confiável, titular evita exposição desnecessária à hiperóxia.'},
 {text:'Concluir prognóstico neurológico pela falta de resposta logo após o retorno',bad:true,why:'O prognóstico exige tempo, controle de fatores confundidores e avaliação multimodal.'}
 ]};}
function transicaoParaParada(d){return {id:d.id,module:'ritmo',atendimento:true,track:d.track,title:d.title,
 level:'Atendimento simulado',pattern:d.pattern,patient:d.patient,sources:['als','post','education'],cycleClock:true,
 sourceNote:'Caso fictício. Transição e algoritmo da parada: AHA 2025 Parte 9. Cuidados iniciais após retorno: Parte 11. Modelos de liderança: orientação didática apoiada pela Parte 12. Revisão independente pendente.',
 steps:[cenaComPulso(),{kind:'Suporte inicial',points:10,noECG:true,
 vitals:d.initialVitals||'Alerta · pulso presente · monitor, acesso e desfibrilador disponíveis',
 prompt:'O que você organiza enquanto obtém o ritmo?',options:decisoesAtendimento(
 'Monitorizar ritmo e perfusão, obter acesso, apoiar via aérea e respiração conforme necessário e preparar os recursos para deterioração',
 'A pessoa ainda tem pulso; a equipe deve reconhecer e tratar o problema antes de uma parada.',V4_ERR_STABILIDADE)},
 {kind:'Interpretação',points:15,prompt:'Qual é a interpretação e a situação circulatória?',options:decisoesAtendimento(d.dx+' com pulso presente',
 'O ritmo é interpretado junto com a checagem de pulso.',V4_ERR_STABILIDADE)},
 {kind:'Conduta com pulso',points:15,noECG:true,prompt:'Qual é sua conduta nesta fase?',options:decisoesAtendimento(d.treatment,d.reason,d.track==='bradi'?V4_BRADI_ERR:V4_ERR_TERAPIA)},
 {kind:'Mudança clínica',points:15,noECG:true,
 vitals:'Não responde · sem respiração normal · pulso não definido na checagem breve',
 context:'Apesar das medidas adequadas, há deterioração. A pessoa perdeu o pulso.',
 prompt:'Como você muda a condução do atendimento?',options:decisoesAtendimento(
 'Reconhecer PCR, iniciar RCP e ventilação, acionar ajuda e o desfibrilador; distribuir as tarefas em paralelo',
 'A perda do pulso muda o algoritmo. Não continue tratando como arritmia com pulso.',[
 ['Manter somente a infusão e aguardar resposta','A parada exige RCP e análise imediata do ritmo.'],
 ['Fazer cardioversão sincronizada sem analisar o novo ritmo','A ausência de pulso exige o algoritmo da PCR.'],
 ['Adiar compressões para um ECG de 12 derivações','O monitor do desfibrilador orienta a primeira decisão sem atrasar a RCP.']])},
 {kind:'Novo monitor',points:20,pattern:d.arrest,
 vitals:'Sem pulso · RCP em andamento · desfibrilador conectado',
 prompt:'Observe o novo ritmo e dê a ordem para a equipe.',options:decisoesAtendimento(d.arrestOrder,d.arrestWhy,[
 ['Tratar como o ritmo anterior, sem reavaliar','O ritmo e a situação circulatória mudaram.'],
 ['Esperar o pulso voltar sem compressões','É necessário manter a RCP durante o algoritmo.'],
 ['Parar a RCP para discutir todos os exames','A investigação não justifica interromper as compressões.']])},
 {...cuidadosPosParada(20),cycleMinutes:2,context:'Depois do ciclo de RCP e das medidas dirigidas, a checagem encontra pulso. O atendimento passa à fase pós-parada.'}
 ]};}
CLINICAL_CASES.push(transicaoParaParada({
 id:'v4_tv_parada',track:'taqui',title:'Palpitações com deterioração durante o atendimento',pattern:'tv',dx:'TV monomórfica',
 patient:'Homem, 69 anos, com cardiopatia isquêmica e palpitações. Na primeira avaliação está responsivo, PA 118/72 mmHg e pulso palpável.',
 treatment:'Considerar amiodarona 150 mg IV em 10 minutos e avaliação especializada, monitorizando perfusão; preparar cardioversão se houver deterioração',
 reason:'O monitor mostra TV monomórfica e a perfusão inicial está preservada; a equipe mantém capacidade de intervenção.',
 arrest:'fv',arrestOrder:'FV: desfibrilação não sincronizada, na energia bifásica do fabricante, e retomada imediata de RCP por 2 minutos',
 arrestWhy:'O novo traçado mostra ritmo chocável sem pulso. O algoritmo mudou para a PCR.'
}),transicaoParaParada({
 id:'v4_bradi_parada',track:'bradi',title:'Pulso lento com deterioração na sala de emergência',pattern:'bavt',dx:'BAV total',
 initialVitals:'Sonolenta · PA 78/46 mmHg · pulso lento e palpável · acesso venoso disponível',
 patient:'Mulher, 78 anos, com sonolência e pulso lento. PA 78/46 mmHg e acesso venoso já obtido; a equipe prepara o suporte.',
 treatment:'Atropina 1 mg IV, preparando estimulação e/ou infusão de adrenalina ou dopamina se não houver resposta, sem atrasar a preparação do marca-passo',
 reason:'A bradicardia está associada a hipoperfusão. O bloqueio de alto grau pode não responder à atropina.',
 arrest:'aesp',arrestOrder:'Ritmo organizado sem pulso: manter RCP e adrenalina 1 mg IV/IO o quanto antes; buscar causas reversíveis, sem choque',
 arrestWhy:'AESP não é chocável. O pulso ausente determina a mudança para o algoritmo da PCR.'
}),transicaoParaParada({
 id:'v4_hiperk_parada',track:'outros',title:'Fraqueza e deterioração em pessoa em hemodiálise',pattern:'hipercalemia',dx:'Alterações sugestivas de hipercalemia',
 patient:'Homem, 61 anos, em hemodiálise, faltou a duas sessões e chega com fraqueza importante. Na avaliação inicial há pulso.',
 treatment:'Acionar tratamento urgente da suspeita de hipercalemia com pulso, monitorização, avaliação do potássio e remoção conforme protocolo e equipe especializada',
 reason:'O ECG e a história exigem atenção imediata à causa. Doses para o tratamento com pulso seguem o caso específico e sua fonte, não a regra de cálcio de rotina em PCR.',
 arrest:'aesp',arrestOrder:'Reconhecer AESP, manter RCP e adrenalina do algoritmo; tratar a suspeita de hipercalemia com a equipe, reconhecendo a incerteza da evidência para as terapias específicas durante PCR',
 arrestWhy:'A Parte 10 considera não bem estabelecida a efetividade de cálcio, bicarbonato e insulina/glicose na PCR por hipercalemia. O suporte padrão continua e não há promessa de benefício específico.'
}));

/* HEART clássico (0–10), preenchido pelo aluno. Apoia a avaliação; não é
   regra isolada de alta nem substitui o protocolo de troponina do ensaio. */
const HEART_FIELDS=[
 {label:'História',options:['Pouco sugestiva (0)','Moderadamente sugestiva (1)','Muito sugestiva (2)']},
 {label:'ECG',options:['Normal (0)','Repolarização inespecífica, BRE ou marca-passo (1)','Desvio significativo de ST (2)']},
 {label:'Idade',options:['Menos de 45 anos (0)','45 a 64 anos (1)','65 anos ou mais (2)']},
 {label:'Fatores de risco',options:['Nenhum conhecido (0)','Um ou dois (1)','Três ou mais, ou doença aterosclerótica conhecida (2)']},
 {label:'Troponina',options:['Dentro do limite de referência (0)','Acima do limite e abaixo de 3 vezes o limite (1)','Pelo menos 3 vezes o limite (2)']}
];
function pedidoExames(d){return {kind:'Pedido de exames',points:15,noECG:true,multi:true,exams:true,
 selectionHint:'Marque os exames indicados no contexto. Os prazos são simulados para este laboratório; exames pedidos em paralelo não têm seus prazos somados.',
 prompt:'Quais exames você solicita agora?',options:d.exams||[
 {text:'Troponina ultrassensível conforme protocolo seriado validado do ensaio local',ok:true,minutes:25,result:d.firstTroponin,
 why:'O resultado é interpretado com sintomas, ECG, tempo de início e mudança entre as medidas.'},
 {text:'Hemograma, creatinina e eletrólitos para orientar o tratamento inicial da suspeita de SCA',ok:d.labs!==false,minutes:30,result:'Hemoglobina 13,2 g/dL · creatinina 0,9 mg/dL · potássio 4,2 mmol/L',
 why:d.labs===false?'Neste caso de baixo risco, sem indicação específica para esses exames, não fazem parte do conjunto essencial solicitado.':'Os exames orientam segurança e escolha do tratamento, sem substituir o ECG e a troponina.'},
 {text:'D-dímero de rotina, sem avaliar probabilidade clínica de TEP',minutes:45,result:'Pedido sem indicação clínica definida neste cenário',why:'D-dímero é orientado por probabilidade clínica, não é exame universal de dor torácica.'},
 {text:'Teste ergométrico antes de excluir uma síndrome aguda',bad:true,minutes:60,result:'Procedimento inadequado nesta fase',why:'A avaliação da síndrome aguda vem primeiro.'}
 ]};}
function dorComHeart(d){
 const options=sc=>decisoesAtendimento(d.decision[sc]||d.decision.base,d.decisionWhy,V4_DOR_ERR);
 const heartFor=sc=>d.heart[sc]||d.heart.base;
 return {id:d.id,module:'dor',atendimento:true,track:'isquemia',title:d.title,level:'Atendimento simulado',pattern:d.pattern,
patient:d.patient,clock:true,goals:[{label:'Porta-ECG',max:10,step:2}],sources:['chest2021','chestpain','heart','acs','education'],
 ...(d.scenarios?{scenarios:d.scenarios}:{}),
 sourceNote:'Caso fictício. Avaliação da dor e vias de decisão: ACC/AHA 2021 e consenso ACC 2022. HEART clássico: critérios dos autores. Valores e prazos laboratoriais são didáticos; os critérios de exclusão dependem do protocolo validado do ensaio. Tratamento da SCA: ACC/AHA 2025. Revisão por especialista pendente.',
 steps:[{...cenaComPulso(),points:5},
 {kind:'Chegada',points:10,noECG:true,vitals:'Alerta · PA 126/78 mmHg · pulso palpável · SpO₂ 97% · sem sinais de choque',
  prompt:'O que você organiza nos primeiros minutos?',options:decisoesAtendimento('Monitorizar, obter acesso conforme necessidade e ECG em até 10 minutos; avaliar sinais de causas imediatamente graves',
  'A avaliação inicial não espera biomarcadores. O ECG e o contexto orientam o próximo passo.',V4_DOR_ERR)},
 {kind:'ECG inicial',points:15,minutes:6,prompt:'Qual é a leitura deste ECG no contexto?',
  options:decisoesAtendimento(d.ecgAnswer,d.ecgWhy,V4_DOR_ERR)},
 pedidoExames(d),
 {kind:'Resultados e coleta seriada',points:15,noECG:true,serialAfter:120,
  context:d.serial.base,prompt:'Como você interpreta esses resultados?',
  options:decisoesAtendimento(d.interpret.base,d.interpretWhy,V4_DOR_ERR),
  ...(d.scenarios?{variants:Object.fromEntries(Object.keys(d.scenarios).map(k=>[k,{context:d.serial[k],options:decisoesAtendimento(d.interpret[k],d.interpretWhy,V4_DOR_ERR)}]))}:{} )},
 {kind:'Estratificação e decisão',points:20,noECG:true,heart:heartFor('base'),
  context:'Preencha os cinco componentes do HEART usando a troponina inicial e escolha a decisão. Integre o escore à evolução seriada e à avaliação clínica.',
  prompt:'Qual é o HEART e qual é sua decisão?',options:options('base'),
  ...(d.scenarios?{variants:Object.fromEntries(Object.keys(d.scenarios).map(k=>[k,{heart:heartFor(k),options:options(k)}]))}:{} )},
 {...equipeComPulso(10),context:'Organize os próximos cuidados, a comunicação das decisões e a passagem do cuidado sem interromper o suporte.'},
 passagemDoCuidado(10)]};
}
const V4_DOR_ERR=[
 ['Excluir doença grave apenas porque o ECG não mostra supra','Um ECG sem supra não exclui SCA nem outras causas graves.'],
 ['Dar alta baseada apenas em uma medida de troponina, independentemente do contexto','A decisão depende do ensaio, do momento da coleta, do protocolo validado e da avaliação clínica.'],
 ['Tratar toda dor torácica com fibrinólise','Fibrinólise não é um tratamento universal e pode causar dano quando a indicação não existe.']
];
CLINICAL_CASES.push(...[
 {id:'v4_dor_baixo',title:'Dor localizada após esforço físico',pattern:'sinusal',labs:false,
 patient:'Mulher, 37 anos, com dor localizada à palpação após carregar caixas. Sem doença vascular, hipertensão, diabetes, tabagismo, obesidade, dislipidemia ou história familiar relevante. Sintomas começaram há 5 horas; não há sinais de dissecção, TEP ou outra emergência na avaliação clínica.',
 ecgAnswer:'ECG sem alteração isquêmica aguda; a avaliação do risco ainda depende do contexto e do protocolo de biomarcadores',
 ecgWhy:'O traçado normal é um componente da avaliação, não uma regra isolada de alta.',
 firstTroponin:'Troponina ultrassensível inicial: 5 ng/L · limite superior de referência informado: 14 ng/L',
 serial:{base:'Troponina ultrassensível inicial 5 ng/L e após 2 horas 6 ng/L, limite 14 ng/L. O laboratório confirma que os critérios de exclusão do protocolo 0/2 h validado para seu ensaio foram atendidos. Sem recorrência da dor, alteração do ECG ou sinais de outra emergência.'},
 interpret:{base:'Integrar protocolo seriado de exclusão, ECG e história; este cenário não apresenta evidência de lesão miocárdica aguda no protocolo informado'},
 interpretWhy:'Os critérios pertencem ao protocolo deste ensaio; não se deve transformar qualquer par de valores abaixo do limite em regra universal de alta.',
 heart:{base:[0,0,0,0,0]},decision:{base:'Baixo risco neste contexto: discutir alta com orientações, retorno por sinais de alerta e seguimento, sem teste cardíaco urgente de rotina'},
 decisionWhy:'A decisão integra a avaliação clínica, o protocolo validado atendido e o risco. HEART isolado não autoriza alta.'},
 {id:'v4_dor_intermediaria',title:'Desconforto no peito com episódios recorrentes',pattern:'repol_inespecifica',
 patient:'Homem, 52 anos, hipertenso e tabagista, com episódios de aperto torácico, alguns em repouso, de duração variável, sem irradiação ou sudorese. Sem doença aterosclerótica conhecida.',
 ecgAnswer:'Alterações de repolarização sem supra isquêmico regional inequívoco; isso não encerra a avaliação de possível SCA',
 ecgWhy:'O contexto e a comparação com registros prévios importam. O traçado sintético representa uma alteração de repolarização no exercício.',
 firstTroponin:'Troponina ultrassensível inicial: 8 ng/L · limite de referência 14 ng/L',
 serial:{base:'Troponina ultrassensível 8 e 9 ng/L nas coletas 0/2 h, limite 14 ng/L. Sintomas recorrentes e risco clínico persistem; não foi documentado enquadramento numa via validada de exclusão para alta.'},
 interpret:{base:'Não encerrar a avaliação pelos valores isolados; manter observação e realizar nova avaliação seriada conforme a via de decisão e o contexto'},
 interpretWhy:'O risco intermediário exige avaliação adicional. A via de decisão, os sintomas e as alterações do ECG são considerados junto com a troponina.',
 heart:{base:[1,1,1,1,0]},decision:{base:'HEART intermediário: manter avaliação/observação e investigar conforme o protocolo; não dar alta só pelas duas troponinas'},
 decisionWhy:'O HEART 4 orienta um risco intermediário neste exercício, com avaliação adicional conforme o contexto.'},
 {id:'v4_dor_troponina',title:'Pressão no peito com fatores de risco',pattern:'scassst',
 patient:'Homem, 58 anos, diabético, hipertenso e tabagista, com pressão retroesternal em repouso por 30 minutos, irradiada para o braço esquerdo, com sudorese e náuseas.',
 ecgAnswer:'Alterações isquêmicas sem supra persistente; correlacionar com sintomas e biomarcadores',ecgWhy:'Um traçado sem supra persistente pode ocorrer em SCA e não autoriza alta.',
 firstTroponin:'Troponina ultrassensível inicial e resultado seriado disponíveis na próxima avaliação; limite de referência 14 ng/L',
 scenarios:{positiva:{label:'Hospital com laboratório seriado e acesso a avaliação cardiológica.'},negativa:{label:'Hospital com laboratório seriado e acesso a avaliação cardiológica.'}},
 serial:{base:'Avaliação seriada disponível.',positiva:'Troponina ultrassensível 50 ng/L na chegada e 96 ng/L em 2 horas; limite 14 ng/L. Sintomas e ECG são compatíveis com isquemia.',negativa:'Troponina ultrassensível 8 e 9 ng/L em 0/2 h, limite 14 ng/L. Dor recorrente e alterações isquêmicas do ECG persistem.'},
 interpret:{base:'Integrar biomarcadores, ECG e sintomas antes da classificação.',positiva:'Elevação dinâmica com evidência de isquemia: quadro compatível com IAM sem supra; manter abordagem de SCA e estratificar a necessidade de intervenção',negativa:'Ausência de elevação não elimina SCA sem necrose; sintomas e ECG exigem avaliação hospitalar, sem alta automática'},
 interpretWhy:'Lesão miocárdica e infarto não são sinônimos: a dinâmica é interpretada com evidência de isquemia. Troponina negativa não apaga sintomas ou ECG de alto risco.',
 heart:{base:[2,2,1,2,0],positiva:[2,2,1,2,2],negativa:[2,2,1,2,0]},
 decision:{base:'Manter avaliação hospitalar de alto risco.',positiva:'HEART alto e quadro compatível com IAM sem supra: tratamento inicial e avaliação invasiva conforme risco, recorrência e instabilidade',negativa:'HEART alto e suspeita de SCA apesar da troponina sem elevação: manter avaliação hospitalar e estratégia conforme o risco'},
 decisionWhy:'A classificação clínica de SCA e os sinais de alto risco orientam o cuidado; o escore é um apoio.'}
].map(dorComHeart));

CLINICAL_CASES.push({id:'v4_aorta',module:'dor',atendimento:true,track:'outros',title:'Dor súbita no peito e nas costas',level:'Atendimento simulado',pattern:'sinusal',
 patient:'Homem, 64 anos, hipertenso, com dor abrupta máxima desde o início, irradiada para o dorso. A pressão medida nos braços difere e o pulso radial é assimétrico.',
 clock:true,goals:[{label:'Porta-ECG',max:10,step:2}],sources:['chest2021','education'],
 sourceNote:'Caso fictício de triagem de possível síndrome aórtica aguda. Dor torácica ACC/AHA 2021: investigar causas graves além de SCA. Sem doses, protocolos operatórios ou regra diagnóstica automática; revisão por especialista pendente.',
 steps:[cenaComPulso(),{kind:'Avaliação da gravidade',points:15,noECG:true,vitals:'Dor intensa · pulso palpável · pressão assimétrica entre os braços',
 prompt:'Qual é a prioridade desta avaliação?',options:decisoesAtendimento('Reconhecer sinais de possível síndrome aórtica aguda, monitorizar e acionar avaliação urgente, mantendo outras causas graves no diferencial',
 'Início abrupto máximo, irradiação dorsal e assimetria de pulso/pressão são sinais que exigem avaliação urgente de causa aórtica.',V4_DOR_ERR)},
 {kind:'Monitor e ECG',points:15,minutes:6,prompt:'Como você interpreta este ECG no contexto?',options:decisoesAtendimento('Um ECG sem isquemia aguda não exclui uma causa aórtica grave; manter a investigação orientada pelo quadro',
 'A investigação não termina num ECG normal.',V4_DOR_ERR)},
 pedidoExames({exams:[
 {text:'Imagem urgente da aorta, como angiotomografia, conforme estabilidade e disponibilidade',ok:true,minutes:30,result:'O exame demonstra achado compatível com dissecção envolvendo a aorta ascendente',why:'A imagem é dirigida à hipótese grave sugerida pela história e pelo exame.'},
 {text:'Avaliação laboratorial de suporte, sem atrasar a imagem e o acionamento da equipe',ok:true,minutes:20,result:'Amostras coletadas; resultados não alteram a prioridade da avaliação da aorta',why:'A coleta apoia o cuidado, sem substituir a imagem ou atrasar a equipe.'},
 {text:'Teste ergométrico antes de avaliar a aorta',bad:true,minutes:60,result:'Exame inadequado para esta apresentação',why:'A suspeita aguda exige outra via de investigação.'},
 {text:'Troponina como único exame para excluir dissecção',minutes:25,result:'Troponina não exclui dissecção',why:'O biomarcador não é exame de exclusão da doença aórtica.'}
 ]}),
 {kind:'Resultado e decisão',points:25,noECG:true,context:'A imagem solicitada está disponível. A equipe revisa os achados e a situação clínica.',
 prompt:'Qual é sua próxima ação?',options:decisoesAtendimento('Acionar atendimento cardiovascular/cirúrgico urgente e suporte dirigido à síndrome aórtica; não tratar automaticamente como SCA com fibrinólise',
 'A imagem e a apresentação exigem a equipe responsável pelo tratamento aórtico, com suporte apropriado ao quadro.',V4_DOR_ERR)},equipeComPulso(15),passagemDoCuidado(10)]
});

function redistribuirPontos(steps){
 const total=steps.reduce((n,s)=>n+s.points,0),weights=steps.map(s=>s.points*100/total);
 steps.forEach((s,i)=>s.points=Math.floor(weights[i]));
 const missing=100-steps.reduce((n,s)=>n+s.points,0);
 const order=weights.map((w,i)=>({i,part:w-Math.floor(w)})).sort((a,b)=>b.part-a.part||a.i-b.i);
 for(let i=0;i<missing;i++)steps[order[i].i].points++;
}
/* Migração por ID: notas/revisões ficam; rev descarta somente a tentativa ativa incompatível. */
for(const c of CLINICAL_CASES){
 if(c.id.startsWith('v4_'))continue;
 c.module=['taqui','bradi','pcr'].includes(c.track)||['hiperk_313','brugada_313'].includes(c.id)?'ritmo':'dor';
 c.atendimento=true;
 if(c.track==='pcr'){
  c.cycleClock=true;
  for(const s of c.steps){
   if(['Segundo ciclo','Terceira análise','Nova análise','Reavaliação'].includes(s.kind))s.cycleMinutes=2;
   if(s.kind==='Encerrar ou continuar')s.cycleMinutes=28;
   if(c.id==='pcr_assistolia'&&s.kind==='Qualidade da RCP')s.cycleMinutes=2;
  }
  if(c.id!=='pcr_assistolia')c.steps.push(cuidadosPosParada(10));
  c.sources=[...new Set([...c.sources,'post'])];c.rev=(c.rev||1)+1;
  c.sourceNote=c.sourceNote.replace('O módulo para na passagem aos cuidados pós-PCR; não inclui metas ou prescrições da Parte 11.','');
  c.sourceNote+=' Cuidados iniciais após o retorno conferidos na Parte 11; não abrangem todo o manejo em terapia intensiva.';
  redistribuirPontos(c.steps);
 }else{
  c.patient=c.patient.replace(/Caso fictício: acompanhe[^.]*\./g,'').replace(/O caso [^.]*\./g,'').replace(/O objetivo [^.]*\./g,'').replace('Duração total da FA','Duração total da arritmia').trim();
  if(c.id==='dewinter_313')c.title='Dor no peito e sudorese persistentes';
  const old=c.steps,firstECG=old.findIndex(s=>!s.noECG),leadIndex=firstECG>=0?firstECG+1:1;
  c.steps=[cenaComPulso(),...old.slice(0,leadIndex),equipeComPulso(10),...old.slice(leadIndex),{...passagemDoCuidado(5),kind:'Comunicação e continuidade'}];
  const shiftGoals=goals=>goals?.map(g=>({...g,step:c.steps.indexOf(old[g.step])}));
  if(c.goals)c.goals=shiftGoals(c.goals);
  for(const setting of Object.values(c.scenarios||{}))if(setting.goals)setting.goals=shiftGoals(setting.goals);
  c.rev=(c.rev||1)+1;c.sources=[...new Set([...c.sources,'bls','education'])];
  redistribuirPontos(c.steps);
 }
}
for(const c of CLINICAL_CASES.filter(c=>c.id.startsWith('v4_'))){
 if(c.module==='dor'&&c.clock){const waiting=c.steps[0].options.find(o=>o.text.includes('fila comum'));waiting.delay=30;waiting.why+=' Neste roteiro, aguardar na fila sem avaliação acrescenta 30 minutos simulados.';}
 if(c.id==='v4_hiperk_parada')c.sources=[...c.sources,'special','ukka'];
 if(c.id==='v4_fa'){c.ventricularRate=165;const r=c.steps.find(s=>s.kind==='Reavaliação');r.vitals='Confusão aguda · PA 74/42 mmHg · pulso presente';}
 for(const s of c.steps.filter(s=>s.exams))for(const o of s.options)if(!o.ok)o.delay=15;
 if(c.track==='taqui'&&c.scenarios&&c.id!=='v4_sinusal'){
  const reval=c.steps.find(s=>s.kind==='Reavaliação');
  if(reval&&c.id!=='v4_fa_preexc'){reval.variants.instavel.pattern='sinusal';reval.variants.instavel.vitals='Alerta após a intervenção · PA 112/70 mmHg · pulso presente · monitorização mantida';}
 }
}
PMAP.flutter.conduta=PMAP.flutter.conduta.replace(/50[–-]100 J|50 J/g,'200 J');
