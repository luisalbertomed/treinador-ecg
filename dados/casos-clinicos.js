/* Casos clínicos fictícios de ensino. Situação das fontes: docs/versoes/LEIA-ME-v3.5.md. */
const CASE_SOURCES = {
 acs:{name:'Diretriz de síndrome coronariana aguda · ACC/AHA 2025',url:'https://www.jacc.org/doi/10.1016/j.jacc.2024.11.009'},
 als:{name:'Suporte avançado de vida · AHA 2025 (Parte 9: bradicardia, taquicardias com pulso e parada)',url:'https://doi.org/10.1161/CIR.0000000000001376'},
 brady:{name:'Bradicardia e distúrbios de condução · ACC/AHA/HRS 2018',url:'https://doi.org/10.1161/CIR.0000000000000628'}
};
const CLINICAL_CASES = [
 {id:'dor01',track:'isquemia',title:'Dor no peito há 50 minutos',level:'Intermediário · formato completo',pattern:'iam_anterior',clock:true,
  patient:'Homem, 58 anos, 84 kg, hipertenso, chega à emergência com pressão no peito em repouso, sudorese e náuseas há 50 minutos. Não usa sildenafila ou tadalafila. Sem alergias; função renal normal. O relógio começa na chegada (porta).',
  sources:['acs'],
  scenarios:{
   com:{label:'Hospital COM hemodinâmica 24 horas.',goals:[{label:'Porta-ECG',max:10,step:1},{label:'Porta-balão',max:90,step:4}]},
   sem:{label:'Hospital SEM hemodinâmica. O centro de referência estima cerca de 150 minutos até o balão, contando a transferência.',goals:[{label:'Porta-ECG',max:10,step:1},{label:'Porta-agulha',max:30,step:3,plus:6}]}
  },
  steps:[
  {kind:'Chegada',points:10,minutes:0,noECG:true,vitals:'PA 138/86 mmHg · FC 96 bpm · FR 20 irpm · SpO₂ 97% em ar ambiente',prompt:'O que fazer nos primeiros minutos?',options:[
   {text:'MOV (monitor, acesso venoso, oxigênio só se SpO₂ < 90%) e ECG de 12 derivações em até 10 minutos da chegada',ok:true,why:'Dor torácica suspeita exige ECG em até 10 minutos: é ele que define a indicação de reperfusão.'},
   {text:'Colher troponina e D-dímero e aguardar os resultados antes do ECG',delay:45,why:'Biomarcadores demoram e não definem reperfusão no IAM com supra; o ECG não pode esperar.'},
   {text:'Encaminhar para a fila da classificação de risco comum',delay:40,why:'Dor torácica típica com sudorese é prioridade máxima: vai direto para a sala de emergência e o ECG.'},
   {text:'Oxigênio por máscara e morfina, deixando o ECG para depois da melhora da dor',delay:20,why:'Oxigênio só se SpO₂ < 90%, e a analgesia não deve atrasar o ECG.'}]},
  {kind:'ECG',points:15,minutes:6,prompt:'ECG registrado aos 6 minutos. Qual é a interpretação?',options:[
   {text:'IAM com supra de ST de parede anterior extensa (V1–V5, DI e aVL), com infra recíproco inferior',ok:true,why:'Supra convexo em derivações contíguas da parede anterior, com imagem recíproca, em paciente com dor típica: provável oclusão proximal da descendente anterior.'},
   {text:'Pericardite aguda',why:'Na pericardite o supra é difuso e côncavo, com infra de PR e sem imagem recíproca na parede inferior.'},
   {text:'Bloqueio de ramo esquerdo',why:'O QRS não está alargado; o achado dominante é o supradesnivelamento regional do ST.'},
   {text:'Padrão de Wellens',why:'Wellens é alteração de onda T (bifásica ou profundamente negativa em V2–V3) fora da dor e sem supra; aqui há supra com dor em curso.'}]},
  {kind:'Reperfusão',points:20,minutes:2,prompt:'Qual estratégia de reperfusão você escolhe?',variants:{
   com:{context:'Este hospital tem hemodinâmica 24 horas. A sala estará pronta em cerca de 45 minutos. O paciente continua com dor.',options:[
    {text:'Angioplastia primária, com meta porta-balão ≤ 90 minutos',ok:true,why:'Com hemodinâmica disponível dentro da meta, a angioplastia primária é a estratégia preferida.'},
    {text:'Fibrinólise imediata, por ser mais rápida',why:'Com angioplastia primária possível dentro da meta, ela é superior; fibrinólise antes da angioplastia não é recomendada.'},
    {text:'Adiar o cateterismo para quando a dor ceder',delay:60,why:'A dor persistente com supra indica oclusão em curso: a reperfusão é imediata.'},
    {text:'Cateterismo eletivo em 24 horas, se a troponina vier alta',why:'IAM com supra exige reperfusão imediata, não investigação eletiva.'}]},
   sem:{context:'Este hospital não tem hemodinâmica. O tempo estimado até o balão no centro de referência é de cerca de 150 minutos. Sem contraindicações à fibrinólise: sem AVC prévio, sangramento ativo, cirurgia recente ou PA > 180/110 mmHg.',options:[
    {text:'Fibrinólise em até 30 minutos da chegada (porta-agulha) e transferência para estratégia fármaco-invasiva',ok:true,why:'Com mais de 120 minutos até o balão, a fibrinólise precoce é indicada, seguida de transferência para cateterismo.'},
    {text:'Transferir para angioplastia primária mesmo assim',why:'Com mais de 120 minutos até o balão, esperar a angioplastia primária perde miocárdio; a fibrinólise é preferida.'},
    {text:'Aguardar a troponina para indicar a fibrinólise',delay:45,why:'O ECG com supra e a dor típica já indicam reperfusão; a troponina só atrasa.'},
    {text:'Tratar apenas a dor e repetir o ECG no dia seguinte',why:'Alívio da dor não substitui a reperfusão de uma artéria ocluída.'}]}}},
  {kind:'Prescrição inicial',points:30,minutes:3,multi:true,vitals:'PA 136/84 mmHg · FC 94 bpm · SpO₂ 97% · pulmões limpos · dor 7/10',context:'Paciente com 84 kg, 58 anos, função renal normal, sem sinais de congestão e sem uso de inibidores de fosfodiesterase-5.',prompt:'Monte a prescrição inicial.',variants:{
   com:{options:[
    {text:'AAS',dose:'162–325 mg VO, mastigado (ex.: 300 mg)',ok:true,why:'Antiagregação imediata em todo IAM com supra, salvo alergia ou sangramento ativo.'},
    {text:'Ticagrelor',dose:'180 mg VO (ataque)',ok:true,why:'Na angioplastia primária, ticagrelor ou prasugrel são os inibidores de P2Y12 preferidos.'},
    {text:'Heparina não fracionada',dose:'70–100 U/kg IV em bolus',ok:true,why:'Anticoagulação durante a angioplastia primária.'},
    {text:'Atorvastatina',dose:'80 mg VO',ok:true,why:'Estatina de alta intensidade deve ser iniciada precocemente.'},
    {text:'Nitrato para a dor',dose:'Nitroglicerina SL 0,3–0,4 mg a cada 5 min (até 3 doses) ou IV a partir de 10 µg/min; no Brasil, costuma-se usar dinitrato de isossorbida 5 mg SL',ok:true,why:'Com PA preservada, sem IAM de VD e sem inibidor de PDE-5, o nitrato alivia a dor isquêmica.'},
    {text:'Tenecteplase',dose:'IV em bolus, dose por peso',bad:true,why:'Com angioplastia primária dentro da meta, a fibrinólise não é indicada e aumenta o sangramento.'},
    {text:'Morfina',dose:'2–4 mg IV',why:'Reservada para dor refratária ao nitrato; não é de rotina e pode retardar a absorção dos antiagregantes orais.'},
    {text:'Oxigênio por cateter nasal',dose:'3 L/min',why:'SpO₂ de 97%: oxigênio só é indicado se SpO₂ < 90%.'},
    {text:'Furosemida',dose:'40 mg IV',why:'Sem congestão pulmonar, não há indicação de diurético.'}]},
   sem:{options:[
    {text:'AAS',dose:'162–325 mg VO, mastigado (ex.: 300 mg)',ok:true,why:'Antiagregação imediata em todo IAM com supra, salvo alergia ou sangramento ativo.'},
    {text:'Tenecteplase',dose:'45 mg IV em bolus único (faixa de 80–89 kg)',ok:true,why:'Fibrinolítico em bolus ajustado ao peso, com meta porta-agulha ≤ 30 minutos.'},
    {text:'Clopidogrel',dose:'300 mg VO (ataque, ≤ 75 anos)',ok:true,why:'É o inibidor de P2Y12 estudado em associação à fibrinólise.'},
    {text:'Enoxaparina',dose:'< 75 anos: 30 mg IV em bolus e, 15 min depois, 1 mg/kg SC de 12/12 h (máximo de 100 mg nas 2 primeiras doses SC)',ok:true,why:'Anticoagulação associada à fibrinólise.'},
    {text:'Atorvastatina',dose:'80 mg VO',ok:true,why:'Estatina de alta intensidade deve ser iniciada precocemente.'},
    {text:'Nitrato para a dor',dose:'Nitroglicerina SL 0,3–0,4 mg a cada 5 min (até 3 doses) ou IV a partir de 10 µg/min; no Brasil, costuma-se usar dinitrato de isossorbida 5 mg SL',ok:true,why:'Com PA preservada, sem IAM de VD e sem inibidor de PDE-5, o nitrato alivia a dor isquêmica.'},
    {text:'Ticagrelor',dose:'180 mg VO (ataque)',why:'Com fibrinolítico, o P2Y12 inicial é o clopidogrel, que foi o estudado nessa associação.'},
    {text:'Heparina não fracionada além da enoxaparina',dose:'60 U/kg IV em bolus + infusão',bad:true,why:'Heparina não fracionada e enoxaparina são alternativas (a HNF é usada quando a enoxaparina é contraindicada), não se associam: a combinação aumenta o sangramento, sobretudo após fibrinolítico.'},
    {text:'Morfina',dose:'2–4 mg IV',why:'Reservada para dor refratária ao nitrato; não é de rotina.'},
    {text:'Oxigênio por cateter nasal',dose:'3 L/min',why:'SpO₂ de 97%: oxigênio só é indicado se SpO₂ < 90%.'}]}}},
  {kind:'Evolução',points:25,prompt:'Qual é a interpretação e a conduta?',variants:{
   com:{minutes:55,stScale:0.3,vitals:'PA 78/48 mmHg · FC 112 bpm · FR 28 irpm · SpO₂ 89% · pele fria · estertores até os ápices',context:'A descendente anterior foi aberta com stent (balão no tempo indicado acima). Ainda na sala de hemodinâmica, ao fim do procedimento, o paciente fica frio, confuso e hipotenso, com estertores até os ápices. O ECG de controle está abaixo.',options:[
    {text:'Choque cardiogênico: noradrenalina, ecocardiograma à beira do leito para afastar complicação mecânica e acionar suporte circulatório',ok:true,why:'O ECG não mostra nova oclusão (o supra resolveu); hipotensão com hipoperfusão e congestão caracterizam choque cardiogênico. A noradrenalina é o vasopressor preferido, e o eco busca ruptura de septo, insuficiência mitral aguda ou tamponamento.'},
    {text:'Soro fisiológico 2 L em bolus pela hipotensão',why:'Com estertores até os ápices há congestão pulmonar; volume em grande quantidade piora o edema. A resposta a volume é típica do IAM de VD, não deste quadro.'},
    {text:'Nitroglicerina IV pela congestão pulmonar',why:'Com PA de 78/48 mmHg, o nitrato está contraindicado.'},
    {text:'Nova angioplastia imediata, pois é reinfarto',why:'O ECG de controle mostra resolução do supra; sem nova elevação, a hipótese principal é choque cardiogênico ou complicação mecânica.'}]},
   sem:{minutes:75,stScale:0.3,vitals:'PA 128/80 mmHg · FC 80 bpm · SpO₂ 97% · sem dor',context:'Tenecteplase administrada. Cerca de 75 minutos depois, a dor cedeu e o novo ECG está abaixo.',options:[
    {text:'Fibrinólise eficaz (redução do supra ≥ 50% nas derivações anteriores e alívio da dor): transferir para cateterismo entre 2 e 24 horas',ok:true,why:'Após fibrinólise bem-sucedida, a estratégia fármaco-invasiva prevê cateterismo entre 2 e 24 horas, e não alta sem estudo das coronárias.'},
    {text:'Angioplastia de resgate imediata',why:'O resgate é para falha da fibrinólise (no IAM anterior, redução < 50% do supra; dor persistente; instabilidade); aqui houve reperfusão.'},
    {text:'Dispensar o cateterismo, porque a artéria já reperfundiu',why:'Mesmo com sucesso, há risco de reoclusão: o cateterismo entre 2 e 24 horas faz parte da estratégia.'},
    {text:'Repetir a tenecteplase para garantir o resultado',why:'O fibrinolítico não é repetido; aqui ele funcionou.'}]}}}
 ]},
 {id:'dor02',rev:2,track:'isquemia',title:'Dor recorrente em repouso',level:'Avançado · formato completo',pattern:'scassst',
  patient:'Mulher, 67 anos, 70 kg, diabética, com episódios de pressão retroesternal em repouso nas últimas 3 horas, o último há 20 minutos. Chega sem dor. Função renal normal; sem sangramento prévio.',
  sources:['acs'],
  steps:[
  {kind:'Chegada',points:10,noECG:true,vitals:'PA 146/88 mmHg · FC 94 bpm · FR 18 irpm · SpO₂ 96%',prompt:'Ela está sem dor agora. O que fazer?',options:[
   {text:'MOV (monitor, acesso venoso, oxigênio só se SpO₂ < 90%) e ECG de 12 derivações em até 10 minutos',ok:true,why:'Dor em repouso recente é suspeita de SCA mesmo sem dor no momento; o ECG em até 10 minutos vale para toda dor torácica suspeita.'},
   {text:'Liberar com analgésico, já que está sem dor',why:'Dor recorrente em repouso é angina instável até prova em contrário; sintomas intermitentes não excluem SCA.'},
   {text:'Teste ergométrico antes do ECG',why:'Teste provocativo é contraindicado na suspeita de SCA em curso, e nada substitui o ECG inicial.'},
   {text:'Colher troponina e decidir pelo ECG só se vier alterada',why:'A troponina complementa, mas não substitui o ECG imediato.'}]},
  {kind:'ECG',points:15,prompt:'Qual é a interpretação mais adequada?',options:[
   {text:'Alterações isquêmicas compatíveis com SCA sem supra de ST',ok:true,why:'O infra de ST horizontal com T negativa, no contexto clínico, sustenta a suspeita de síndrome coronariana sem supra.'},
   {text:'Ausência de isquemia, porque não há supra de ST',why:'A isquemia também se manifesta com infradesnivelamento de ST e inversão de T.'},
   {text:'Taquicardia ventricular sustentada',why:'O ritmo e a largura dos complexos não correspondem a esse diagnóstico.'},
   {text:'IAM com supra de ST de parede inferior',why:'Não há supradesnivelamento regional de ST; o achado isquêmico dominante é o infradesnivelamento.'}]},
  {kind:'Investigação',points:15,prompt:'O que define se há infarto sem supra?',options:[
   {text:'Troponina de alta sensibilidade seriada (0 h e 1–2 h, conforme o protocolo) e ECGs seriados',ok:true,why:'O ECG isolado não separa infarto sem supra de angina instável; a curva da troponina, com a clínica, faz essa distinção.'},
   {text:'Uma única troponina normal já exclui o infarto',why:'Uma troponina precoce pode vir normal; o protocolo exige a segunda dosagem.'},
   {text:'Angiotomografia de coronárias como primeiro passo',why:'Tem papel quando ECG e troponinas não são diagnósticos em risco baixo a intermediário; aqui já há infra de ST e dor em repouso.'},
   {text:'Fibrinólise imediata pelo infra de ST',why:'A fibrinólise não é indicada na SCA sem supra; não traz benefício e aumenta o sangramento.'}]},
  {kind:'Prescrição inicial',points:25,multi:true,vitals:'PA 144/86 mmHg · FC 90 bpm · SpO₂ 96% · sem dor',context:'A troponina subiu entre as dosagens: infarto sem supra de ST. Paciente estável, 70 kg, função renal normal, sem sangramento prévio. Plano de cateterismo nas próximas horas.',prompt:'Monte a prescrição inicial.',options:[
   {text:'AAS',dose:'162–325 mg VO, mastigado (ex.: 300 mg)',ok:true,why:'Antiagregação imediata em toda SCA, salvo alergia ou sangramento ativo.'},
   {text:'Anticoagulante parenteral: enoxaparina (ou heparina não fracionada se houver contraindicação à enoxaparina)',dose:'Enoxaparina 1 mg/kg SC de 12/12 h. HNF: 60 U/kg IV em bolus (máx. 4.000 U) + 12 U/kg/h (máx. 1.000 U/h), TTPa 60–80 s',ok:true,why:'Um único anticoagulante até o cateterismo. Na abordagem didática escolhida pelo autor deste app, aceita-se enoxaparina ou HNF se houver contraindicação à enoxaparina; essa escolha não equivale a uma recomendação universal. A diretriz ACC/AHA 2025 dá preferência à HNF IV quando o cateterismo é precoce, e cita a enoxaparina como alternativa quando não há estratégia invasiva precoce. As duas opções contam como corretas aqui.'},
   {text:'Ticagrelor antes do cateterismo',dose:'180 mg VO (ataque)',why:'Com cateterismo previsto em menos de 24 horas, o P2Y12 é dado no momento da angioplastia (ticagrelor ou prasugrel). O pré-tratamento só pode ser considerado quando o cateterismo vai passar de 24 horas.'},
   {text:'Atorvastatina',dose:'80 mg VO',ok:true,why:'Estatina de alta intensidade deve ser iniciada precocemente.'},
   {text:'Nitrato se voltar a dor',dose:'Nitroglicerina SL 0,3–0,4 mg a cada 5 min se dor (até 3 doses); no Brasil, dinitrato de isossorbida 5 mg SL. Sem uso recente de inibidor de PDE-5',ok:true,why:'Alívio da dor isquêmica, com PA preservada.'},
   {text:'Tenecteplase',dose:'IV em bolus, dose por peso',bad:true,why:'Fibrinolítico é contraindicado na SCA sem supra: não há benefício e o sangramento aumenta.'},
   {text:'Prasugrel',dose:'60 mg VO antes do cateterismo',why:'O prasugrel é indicado na SCA sem supra submetida a angioplastia, dado no procedimento; não se usa como pré-tratamento.'},
   {text:'Morfina',dose:'2–4 mg IV',why:'Ela está sem dor; a morfina não é de rotina.'},
   {text:'Oxigênio por cateter nasal',dose:'3 L/min',why:'SpO₂ de 96%: oxigênio só é indicado se SpO₂ < 90%.'},
   {text:'Enoxaparina e heparina não fracionada juntas',dose:'Enoxaparina SC + HNF IV',bad:true,why:'São alternativas, não se associam: a combinação (ou a troca entre elas) aumenta o sangramento. Escolha um único anticoagulante.'}]},
  {kind:'Estratégia',points:15,prompt:'Qual é o plano de estratificação?',options:[
   {text:'Internar e fazer cateterismo precoce, nas primeiras 24 horas',ok:true,why:'Infarto sem supra com troponina dinâmica é de alto risco: a estratégia invasiva precoce é a recomendada.'},
   {text:'Alta com teste ergométrico ambulatorial',why:'Infarto sem supra confirmado exige internação e estratégia invasiva, não investigação ambulatorial.'},
   {text:'Tratamento clínico apenas, sem cateterismo',why:'Na SCA de alto risco, a estratégia invasiva reduz eventos.'},
   {text:'Teste ergométrico precoce antes de decidir',why:'Com IAM sem supra de alto risco, teste provocativo não substitui a estratégia invasiva.'}]},
  {kind:'Evolução',points:20,context:'Horas depois, antes do cateterismo, a dor retorna e persiste apesar do nitrato. Ela fica hipotensa.',vitals:'PA 84/54 mmHg · FC 104 bpm · FR 24 irpm · SpO₂ 94%',prompt:'Qual é a próxima decisão?',options:[
   {text:'Estratégia invasiva imediata (cateterismo de emergência) e suporte à instabilidade',ok:true,why:'Dor refratária ou instabilidade hemodinâmica na SCA sem supra indicam cateterismo imediato, sem aguardar o prazo de 24 horas.'},
   {text:'Manter o cateterismo no prazo de 24 horas',why:'A piora clínica reclassifica o risco para muito alto: a estratégia passa a ser imediata.'},
   {text:'Administrar fibrinolítico pela dor refratária',why:'A fibrinólise não é indicada na SCA sem supra, mesmo com dor refratária.'},
   {text:'Aumentar o nitrato IV até controlar a dor',why:'Com PA de 84/54 mmHg, o nitrato está contraindicado e a causa exige revascularização.'}]}
 ]},
 {id:'iam_inf_vd',track:'isquemia',title:'Dor torácica com pressão caindo',level:'Avançado · formato completo',pattern:'iam_vd',clock:true,
  patient:'Homem, 62 anos, 78 kg, hipertenso e tabagista, chega à emergência com dor retroesternal em aperto há 1 h 40 min, irradiada para a mandíbula, com sudorese e náuseas. Sem alergias; função renal normal no último exame. O relógio começa na chegada (porta).',
  sources:['acs'],
  scenarios:{
   com:{label:'Hospital COM hemodinâmica 24 horas.',goals:[{label:'Porta-ECG',max:10,step:1},{label:'Porta-balão',max:90,step:6}]},
   sem:{label:'Hospital SEM hemodinâmica. O centro de referência estima cerca de 150 minutos até o balão, contando a transferência.',goals:[{label:'Porta-ECG',max:10,step:1},{label:'Porta-agulha',max:30,step:5,plus:6}]}
  },
  steps:[
  {kind:'Chegada',points:10,minutes:0,noECG:true,vitals:'PA 102/64 mmHg · FC 56 bpm · FR 18 irpm · SpO₂ 95% em ar ambiente',prompt:'O que fazer nos primeiros minutos?',options:[
   {text:'MOV (monitor, acesso venoso, oxigênio só se SpO₂ < 90%) e ECG de 12 derivações em até 10 minutos da chegada',ok:true,why:'Em dor torácica suspeita, o ECG em até 10 minutos é o exame que define se há indicação de reperfusão.'},
   {text:'Colher troponina e aguardar o resultado para decidir sobre o ECG',delay:45,why:'A troponina demora e não define reperfusão no IAM com supra; o ECG não pode esperar por ela.'},
   {text:'Radiografia de tórax e ecocardiograma antes do ECG',delay:30,why:'Exames de imagem não devem atrasar o ECG, que é o exame decisivo nos primeiros minutos.'},
   {text:'Oxigênio por máscara e morfina, deixando o ECG para depois que a dor melhorar',delay:20,why:'Oxigênio só é indicado se SpO₂ < 90%, e analgesia não deve atrasar o ECG.'}]},
  {kind:'ECG',points:10,minutes:7,prompt:'ECG registrado aos 7 minutos. Qual é a interpretação?',options:[
   {text:'IAM com supra de ST de parede inferior (DII, DIII e aVF), com infra recíproco em DI e aVL',ok:true,why:'Supra regional nas derivações inferiores com imagem em espelho em DI e aVL, em paciente com dor típica.'},
   {text:'Pericardite aguda',why:'Na pericardite o supra é difuso e côncavo, com infra de PR e sem imagem recíproca em DI e aVL.'},
   {text:'Repolarização precoce',why:'A repolarização precoce não produz infra recíproco e não explica a dor com instabilidade.'},
   {text:'IAM com supra de parede lateral alta',why:'A parede lateral alta aparece em DI e aVL, que aqui têm infradesnivelamento (imagem recíproca).'}]},
  {kind:'Completar o ECG',points:10,minutes:2,extra:'after',prompt:'Antes de prescrever, o que falta investigar no ECG?',options:[
   {text:'Registrar derivações direitas (V3R e V4R) para pesquisar extensão ao ventrículo direito',ok:true,why:'Todo IAM inferior deve ter V3R/V4R: o acometimento do VD muda a prescrição (evitar nitrato e diurético, dar volume). Depois de responder, use o botão “Pedir V3R e V4R” no traçado.'},
   {text:'Nada: o supra inferior já define a conduta e o nitrato pode ser prescrito para a dor',why:'Sem pesquisar o VD, o nitrato pode causar hipotensão grave; este paciente já tem PA limítrofe e bradicardia.'},
   {text:'Aguardar a troponina antes de complementar o ECG',delay:45,why:'A troponina não muda a indicação de reperfusão e atrasa o tratamento.'},
   {text:'Repetir o mesmo ECG de 12 derivações em 30 minutos',delay:30,why:'Repetir o ECG não pesquisa o VD e atrasa a decisão.'}]},
  {kind:'Derivações direitas',points:10,minutes:3,extra:'on',vitals:'PA 94/60 mmHg · FC 54 bpm · turgência jugular · pulmões limpos',context:'V3R e V4R foram registradas (traçado abaixo). Ao exame: turgência jugular e pulmões limpos.',prompt:'Como interpretar e qual é a implicação?',options:[
   {text:'Supra de ST em V3R/V4R: IAM com extensão ao VD. O paciente depende de pré-carga; evitar nitrato e diurético',ok:true,why:'Supra ≥ 1 mm em V4R, com a tríade hipotensão, turgência jugular e pulmões limpos, caracteriza o IAM de VD.'},
   {text:'V3R e V4R sem alterações: não há acometimento do VD',why:'Há supradesnivelamento em V3R e V4R; compare com a linha de base.'},
   {text:'O supra em V4R indica IAM posterior, que pede V7–V9',why:'A parede posterior é avaliada por V7–V9 (e infra em V1–V3); V3R e V4R avaliam o ventrículo direito.'},
   {text:'IAM de VD confirmado; a turgência jugular pede furosemida',why:'A turgência vem da falência do VD, não de congestão pulmonar; o diurético reduz a pré-carga e piora a hipotensão.'}]},
  {kind:'Reperfusão',points:15,minutes:1,prompt:'Qual estratégia de reperfusão você escolhe?',variants:{
   com:{context:'Este hospital tem hemodinâmica 24 horas. A equipe informa que a sala estará pronta em cerca de 40 minutos.',options:[
    {text:'Angioplastia primária, com meta porta-balão ≤ 90 minutos',ok:true,why:'Com hemodinâmica disponível dentro da meta, a angioplastia primária é a estratégia preferida.'},
    {text:'Fibrinólise imediata, por ser mais rápida',why:'Com angioplastia primária possível dentro da meta, ela é superior; fibrinólise antes da angioplastia não é recomendada.'},
    {text:'Transferir para outro hospital',delay:60,why:'O próprio hospital tem hemodinâmica; transferir só atrasa a reperfusão.'},
    {text:'Cateterismo eletivo em 24 horas, se a troponina vier alta',why:'IAM com supra exige reperfusão imediata, não investigação eletiva.'}]},
   sem:{context:'Este hospital não tem hemodinâmica. O tempo estimado até o balão no centro de referência é de cerca de 150 minutos. Sem contraindicações à fibrinólise: sem AVC prévio, sangramento ativo, cirurgia recente ou PA > 180/110 mmHg.',options:[
    {text:'Fibrinólise em até 30 minutos da chegada (porta-agulha) e transferência para estratégia fármaco-invasiva',ok:true,why:'Quando o tempo até o balão passa de 120 minutos, a fibrinólise precoce é indicada, seguida de transferência para cateterismo.'},
    {text:'Transferir para angioplastia primária mesmo assim',why:'Com mais de 120 minutos até o balão, esperar a angioplastia primária perde miocárdio; a fibrinólise é preferida.'},
    {text:'Aguardar a troponina para indicar a fibrinólise',delay:45,why:'O ECG com supra e a dor típica já indicam reperfusão; a troponina só atrasa.'},
    {text:'Não fazer fibrinólise, porque a dor começou há mais de 1 hora',why:'O benefício é maior quanto mais cedo, e a fibrinólise está indicada nas primeiras 12 horas de sintomas.'}]}}},
  {kind:'Prescrição inicial',points:25,minutes:3,multi:true,vitals:'PA 86/54 mmHg · FC 54 bpm · SpO₂ 95% · turgência jugular · pulmões limpos',context:'A pressão caiu desde a chegada. Paciente com 78 kg, 62 anos e função renal normal.',prompt:'Monte a prescrição inicial.',variants:{
   com:{options:[
    {text:'AAS',dose:'162–325 mg VO, mastigado (ex.: 300 mg)',ok:true,why:'Antiagregação imediata em todo IAM com supra, salvo alergia ou sangramento ativo.'},
    {text:'Ticagrelor',dose:'180 mg VO (ataque)',ok:true,why:'Na angioplastia primária, ticagrelor ou prasugrel são os inibidores de P2Y12 preferidos.'},
    {text:'Heparina não fracionada',dose:'70–100 U/kg IV em bolus',ok:true,why:'Anticoagulação durante a angioplastia primária.'},
    {text:'Atorvastatina',dose:'80 mg VO',ok:true,why:'Estatina de alta intensidade deve ser iniciada precocemente.'},
    {text:'Soro fisiológico 0,9%',dose:'250–500 mL IV em bolus, reavaliando PA e ausculta pulmonar',ok:true,why:'IAM de VD com hipotensão e pulmões limpos: o VD depende de pré-carga, e volume é a primeira medida.'},
    {text:'Nitrato',dose:'Nitroglicerina SL ou IV (no Brasil, dinitrato de isossorbida 5 mg SL)',bad:true,why:'Contraindicado: suspeita de IAM de VD e PA sistólica < 90 mmHg (ou queda > 30 mmHg da basal). A queda da pré-carga pode causar hipotensão grave.'},
    {text:'Morfina',dose:'2–4 mg IV',bad:true,why:'Com hipotensão e IAM de VD, a venodilatação da morfina pode agravar a queda da pressão.'},
    {text:'Metoprolol',dose:'5 mg IV',bad:true,why:'Betabloqueador IV é contraindicado com hipotensão, bradicardia ou sinais de baixo débito.'},
    {text:'Furosemida',dose:'40 mg IV',bad:true,why:'O diurético reduz a pré-carga de que o VD depende.'},
    {text:'Tenecteplase',dose:'IV em bolus, dose por peso',bad:true,why:'Com angioplastia primária dentro da meta, a fibrinólise não é indicada e aumenta o sangramento.'},
    {text:'Oxigênio por cateter nasal',dose:'3 L/min',why:'SpO₂ de 95%: oxigênio só é indicado se SpO₂ < 90%.'}]},
   sem:{minutes:3,options:[
    {text:'AAS',dose:'162–325 mg VO, mastigado (ex.: 300 mg)',ok:true,why:'Antiagregação imediata em todo IAM com supra, salvo alergia ou sangramento ativo.'},
    {text:'Tenecteplase',dose:'40 mg IV em bolus único (faixa de 70–79 kg)',ok:true,why:'Fibrinolítico em bolus ajustado ao peso, com meta porta-agulha ≤ 30 minutos.'},
    {text:'Clopidogrel',dose:'300 mg VO (ataque, ≤ 75 anos)',ok:true,why:'É o inibidor de P2Y12 estudado em associação à fibrinólise.'},
    {text:'Enoxaparina',dose:'< 75 anos: 30 mg IV em bolus e, 15 min depois, 1 mg/kg SC de 12/12 h (máximo de 100 mg nas 2 primeiras doses SC)',ok:true,why:'Anticoagulação associada à fibrinólise.'},
    {text:'Atorvastatina',dose:'80 mg VO',ok:true,why:'Estatina de alta intensidade deve ser iniciada precocemente.'},
    {text:'Soro fisiológico 0,9%',dose:'250–500 mL IV em bolus, reavaliando PA e ausculta pulmonar',ok:true,why:'IAM de VD com hipotensão e pulmões limpos: o VD depende de pré-carga, e volume é a primeira medida.'},
    {text:'Nitrato',dose:'Nitroglicerina SL ou IV (no Brasil, dinitrato de isossorbida 5 mg SL)',bad:true,why:'Contraindicado: suspeita de IAM de VD e PA sistólica < 90 mmHg (ou queda > 30 mmHg da basal). A queda da pré-carga pode causar hipotensão grave.'},
    {text:'Morfina',dose:'2–4 mg IV',bad:true,why:'Com hipotensão e IAM de VD, a venodilatação da morfina pode agravar a queda da pressão.'},
    {text:'Metoprolol',dose:'5 mg IV',bad:true,why:'Betabloqueador IV é contraindicado com hipotensão, bradicardia ou sinais de baixo débito.'},
    {text:'Furosemida',dose:'40 mg IV',bad:true,why:'O diurético reduz a pré-carga de que o VD depende.'},
    {text:'Ticagrelor',dose:'180 mg VO (ataque)',why:'Com fibrinolítico, o P2Y12 inicial é o clopidogrel, que foi o estudado nessa associação.'},
    {text:'Oxigênio por cateter nasal',dose:'3 L/min',why:'SpO₂ de 95%: oxigênio só é indicado se SpO₂ < 90%.'}]}}},
  {kind:'Após a reperfusão',points:20,prompt:'Qual é a interpretação e a conduta?',variants:{
   com:{minutes:50,stScale:0.25,vitals:'PA 112/70 mmHg · FC 72 bpm · SpO₂ 97% · sem dor',context:'A angioplastia com stent da coronária direita proximal foi feita (balão insuflado no tempo indicado acima). Novo ECG na unidade coronariana:',options:[
    {text:'Reperfusão eficaz (supra praticamente resolvido e sem dor): manter dupla antiagregação e monitorizar arritmias na unidade coronariana',ok:true,why:'A resolução do supra e da dor indica reperfusão. Arritmias de reperfusão (como o RIVA) e bradiarritmias transitórias podem ocorrer.'},
    {text:'Supra persistente: nova angioplastia imediata',why:'O ECG mostra resolução importante do supradesnivelamento.'},
    {text:'Suspender AAS e ticagrelor, pois a artéria já foi aberta',why:'Após SCA com stent, a estratégia padrão é dupla antiagregação por pelo menos 12 meses quando não há alto risco hemorrágico. O esquema e a duração devem ser individualizados conforme risco de sangramento e necessidade de anticoagulação.'},
    {text:'Alta hospitalar no mesmo dia, pois o supra resolveu',why:'O IAM exige internação, monitorização e prevenção secundária antes da alta.'}]},
   sem:{minutes:80,stScale:0.85,vitals:'PA 98/62 mmHg · FC 58 bpm · SpO₂ 95% · dor persistente',context:'Tenecteplase administrada. Cerca de 75 minutos depois, a dor persiste e o novo ECG está abaixo.',options:[
    {text:'Falha da fibrinólise (redução do supra < 70% nas derivações inferiores e dor persistente): transferir imediatamente para angioplastia de resgate',ok:true,why:'No IAM inferior, a falha é definida por redução < 70% do supra (< 50% nas anteriores), dor persistente ou instabilidade: a indicação é cateterismo imediato com angioplastia de resgate.'},
    {text:'Repetir a tenecteplase',why:'Não se repete o fibrinolítico; a falha pede angioplastia de resgate.'},
    {text:'Manter o plano de cateterismo entre 2 e 24 horas',why:'Esse é o plano após fibrinólise bem-sucedida; aqui ela falhou.'},
    {text:'Considerar sucesso, porque houve alguma redução do supra',why:'No IAM inferior, o sucesso exige redução de pelo menos 70% do supra, com melhora da dor; aqui houve pouca redução e a dor persiste.'}]}}}
 ]},
 {id:'ritmo01',track:'taqui',title:'Palpitações de início súbito',level:'Intermediário · formato completo',pattern:'tsv',patient:'Mulher, 29 anos, com palpitações iniciadas abruptamente há 20 minutos. Está alerta, sem dor torácica, dispneia ou síncope. Sem cardiopatia conhecida, asma ou uso de dipiridamol.',sources:['als'],steps:[
  {kind:'Chegada',points:10,noECG:true,vitals:'PA 122/76 mmHg · FC 188 bpm · FR 18 irpm · SpO₂ 98% · pulso presente',prompt:'O que fazer primeiro?',options:[
   {text:'MOV (monitor, acesso venoso), avaliar sinais de instabilidade e registrar ECG de 12 derivações antes de tratar',ok:true,why:'Paciente estável permite registrar o ECG de 12 derivações, que documenta o ritmo e orienta o algoritmo.'},
   {text:'Adenosina imediata, antes de registrar o ECG',why:'Na paciente estável, o ECG de 12 derivações vem antes: sem ele se perde o registro diagnóstico da arritmia.'},
   {text:'Cardioversão elétrica sincronizada imediata',why:'A cardioversão imediata é para instabilidade; a paciente está alerta, sem dor, dispneia ou hipotensão.'},
   {text:'Solicitar TSH e eletrólitos e aguardar antes de qualquer conduta',why:'Exames podem ser colhidos, mas não devem atrasar a avaliação e o ECG.'}]},
  {kind:'Interpretação',points:15,vitals:'PA 122/76 mmHg · FC 188 bpm · FR 18 irpm · SpO₂ 98% · pulso presente',prompt:'Como descrever o ritmo e a condição atual?',options:[
   {text:'Taquicardia regular de QRS estreito, sem sinais atuais de instabilidade',ok:true,why:'Regularidade e QRS estreito orientam o ramo do algoritmo; os sinais clínicos indicam estabilidade atual.'},
   {text:'Fibrilação ventricular sem pulso',why:'A paciente está alerta, com pulso e atividade elétrica organizada.'},
   {text:'Bradicardia com bloqueio AV total',why:'A frequência e a morfologia do traçado não correspondem a esse quadro.'},
   {text:'Flutter atrial com condução 2:1',why:'Entra no diferencial de toda taquicardia regular de QRS estreito, mas costuma ficar perto de 150 bpm, com ondas F em serra em DII; aqui a FC é ≈ 190 bpm, sem ondas F.'}]},
  {kind:'Primeira medida',points:15,prompt:'Além do suporte e da monitorização, qual medida inicial é adequada?',options:[
   {text:'Manobra vagal (Valsalva modificada) em ambiente monitorizado',ok:true,why:'Na taquicardia regular de QRS estreito estável, manobras vagais são uma opção inicial.'},
   {text:'Iniciar compressões torácicas apesar do pulso presente',why:'Não há parada cardíaca neste cenário.'},
   {text:'Liberar a paciente sem reavaliar o ritmo persistente',why:'É preciso tratar e acompanhar a taquicardia em curso.'},
   {text:'Cardioversão elétrica sincronizada imediata',why:'Cardioversão é reservada para instabilidade ou falha das medidas iniciais; a paciente está estável.'}]},
  {kind:'Conduta',points:40,context:'A manobra vagal foi realizada adequadamente, mas a taquicardia regular persiste. A paciente continua estável e não há contraindicação identificada.',prompt:'Qual é o próximo passo apropriado?',options:[
   {text:'Adenosina 6 mg IV em bolus rápido, seguida de flush de 20 mL de SF; se não reverter, 12 mg',ok:true,why:'A adenosina tem meia-vida de segundos: precisa de bolus rápido em veia calibrosa com flush. Registre o ECG durante a infusão e avise a paciente sobre o mal-estar transitório.'},
   {text:'Desfibrilar de forma não sincronizada como se fosse FV',why:'A paciente tem pulso e está estável; não é o cenário de FV.'},
   {text:'Suspender a monitorização e aguardar em casa',why:'A arritmia persiste e demanda tratamento supervisionado.'},
   {text:'Amiodarona IV em bolus como primeira escolha',why:'Amiodarona não é a droga inicial na taquicardia regular de QRS estreito estável; a adenosina é preferida por ser diagnóstica e terapêutica, com meia-vida curtíssima.'}]},
  {kind:'Evolução',points:20,pattern:'sinusal',context:'Nesta evolução simulada, após o tratamento adequado, as palpitações cessam e surge o novo ECG abaixo.',vitals:'PA 120/78 mmHg · FC 72 bpm · FR 16 irpm · SpO₂ 98%',prompt:'O que fazer após a reversão?',options:[
   {text:'Reavaliar sinais vitais, registrar ECG e planejar investigação e seguimento',ok:true,why:'A reversão deve ser documentada e acompanhada de reavaliação clínica e planejamento do cuidado.'},
   {text:'Repetir adenosina automaticamente apesar da reversão',why:'O ritmo já reverteu; a próxima decisão depende da reavaliação.'},
   {text:'Ignorar o novo ECG e continuar tratando a frequência de 188 bpm',why:'As decisões precisam acompanhar o estado atual da paciente.'},
   {text:'Prescrever amiodarona oral contínua para evitar recorrência',why:'Após reverter uma TSV em paciente sem cardiopatia, antiarrítmico crônico não é rotina; o seguimento avalia recorrências e indicação de ablação.'}]}]},
 {id:'ritmo02',track:'taqui',title:'Palpitação com pré-síncope',level:'Avançado · formato completo',pattern:'tv',patient:'Homem, 71 anos, com infarto prévio, chega com palpitações e sensação de desmaio. Está confuso, frio e com pulso palpável.',sources:['als'],steps:[
  {kind:'Chegada',points:10,noECG:true,vitals:'PA 76/44 mmHg · FC 169 bpm · FR 26 irpm · SpO₂ 93% · pulso presente',prompt:'O que fazer primeiro?',options:[
   {text:'MOV, pás adesivas do desfibrilador já posicionadas e ritmo no monitor, checando pulso e sinais de instabilidade',ok:true,why:'Com hipotensão e confusão, as pás devem estar prontas desde o início: a decisão pode ser elétrica em minutos.'},
   {text:'Amiodarona IV empírica antes de ver o ritmo',why:'O tratamento depende do ritmo e da estabilidade; sem monitor, a droga é um chute.'},
   {text:'Colher eletrólitos e aguardar o resultado antes de agir',why:'Eletrólitos importam, mas a instabilidade não permite esperar.'},
   {text:'Encaminhar para a UTI antes da avaliação na sala de emergência',why:'O paciente instável é avaliado e tratado onde está; o transporte atrasa a terapia.'}]},
  {kind:'Interpretação',points:15,vitals:'PA 76/44 mmHg · FC 169 bpm · FR 26 irpm · SpO₂ 93% · pulso presente',prompt:'Qual diagnóstico de trabalho orienta o atendimento?',options:[
   {text:'Taquicardia ventricular monomórfica com pulso',ok:true,why:'QRS largo, ritmo regular e contexto de cardiopatia favorecem TV como diagnóstico de trabalho.'},
   {text:'Ritmo sinusal normal',why:'A frequência elevada e o QRS largo não são compatíveis com normalidade.'},
   {text:'Fibrilação ventricular sem pulso',why:'O ritmo é organizado e há pulso palpável nesta etapa.'},
   {text:'TSV com aberrância de condução',why:'Com infarto prévio, taquicardia regular de QRS largo deve ser tratada como TV até prova em contrário; assumir aberrância leva a condutas perigosas.'}]},
  {kind:'Gravidade',points:15,prompt:'Como classificar a situação?',options:[
   {text:'Instabilidade hemodinâmica associada à taquiarritmia',ok:true,why:'Hipotensão, confusão e hipoperfusão são sinais de instabilidade.'},
   {text:'Estabilidade, pois ainda existe pulso',why:'Ter pulso não exclui instabilidade grave.'},
   {text:'Baixo risco, pois o QRS é regular',why:'Regularidade não é um marcador de estabilidade clínica.'},
   {text:'Estável, pois o paciente ainda está consciente',why:'Confusão, hipotensão e pele fria já caracterizam instabilidade, mesmo com o paciente acordado.'}]},
  {kind:'Conduta',points:40,prompt:'Qual intervenção deve ser preparada imediatamente?',options:[
   {text:'Cardioversão sincronizada, com sedação quando viável sem atrasar o tratamento',ok:true,why:'A TV monomórfica com pulso e instabilidade requer cardioversão sincronizada.'},
   {text:'Aguardar eletivamente a arritmia cessar sozinha',why:'A instabilidade exige intervenção imediata.'},
   {text:'Escolher apenas observação por estar com pulso',why:'O pulso presente não torna segura a espera diante de hipoperfusão.'},
   {text:'Infundir amiodarona IV antes de tentar a cardioversão',why:'Antiarrítmico é opção na TV estável; com instabilidade, a cardioversão sincronizada é a prioridade e não deve esperar a infusão.'}]},
  {kind:'Evolução',points:20,context:'Novo cenário: antes da intervenção, o paciente perde a consciência e não há pulso. A atividade elétrica larga e rápida persiste no monitor.',vitals:'Inconsciente · sem pulso · ritmo elétrico rápido de QRS largo',prompt:'Como o atendimento deve mudar?',options:[
   {text:'Iniciar RCP e desfibrilar prontamente, seguindo o protocolo de parada',ok:true,why:'TV sem pulso é um ritmo chocável: compressões e desfibrilação passam a ser prioritárias.'},
   {text:'Esperar sincronização com o QRS antes de tratar a parada',why:'Na TV sem pulso, utiliza-se desfibrilação, sem atrasar o choque para sincronizar.'},
   {text:'Continuar apenas observando a pressão arterial',why:'A ausência de pulso caracteriza parada e exige ressuscitação imediata.'},
   {text:'Administrar amiodarona antes do primeiro choque',why:'Na TV sem pulso o choque vem primeiro; a amiodarona entra se o ritmo chocável persistir após choques.'}]}]},
 {id:'bradi01',track:'bradi',title:'Tontura e síncope no idoso',level:'Avançado · formato completo',pattern:'bavt',patient:'Homem, 76 anos, hipertenso, trazido após síncope em casa. Relata tontura e cansaço há dois dias. Está sonolento, frio e com pulso lento.',sources:['brady','als'],steps:[
  {kind:'Chegada',points:10,noECG:true,vitals:'PA 80/48 mmHg · FC 37 bpm · FR 22 irpm · SpO₂ 94% · pele fria',prompt:'O que fazer primeiro?',options:[
   {text:'MOV, pás adesivas com marca-passo transcutâneo à mão e ECG de 12 derivações',ok:true,why:'Bradicardia com hipotensão pode exigir estimulação em minutos; o ECG define o tipo de bloqueio.'},
   {text:'Tomografia de crânio pela síncope antes do ECG',why:'Síncope com pulso lento sugere causa cardíaca: ECG e monitorização vêm primeiro.'},
   {text:'Atropina antes de monitorizar',why:'Sem monitor e ECG não se sabe o ritmo nem a resposta; a monitorização vem primeiro.'},
   {text:'Aguardar exames laboratoriais para decidir',why:'Potássio e troponina importam, mas a instabilidade não permite esperar.'}]},
  {kind:'Interpretação',points:15,vitals:'PA 80/48 mmHg · FC 37 bpm · FR 22 irpm · SpO₂ 94% · pele fria',prompt:'Qual é a interpretação do ECG?',options:[
   {text:'BAV total com escape de QRS largo',ok:true,why:'Ondas P regulares e QRS regulares, sem relação entre si, com frequência atrial maior que a ventricular e escape largo: dissociação AV completa.'},
   {text:'Bradicardia sinusal',why:'Na bradicardia sinusal cada onda P conduz um QRS com PR constante; aqui há mais ondas P que QRS e nenhuma relação fixa.'},
   {text:'BAV de 2º grau Mobitz I',why:'No Mobitz I o PR aumenta progressivamente até uma P bloqueada; aqui o PR varia sem padrão porque átrios e ventrículos batem de forma independente.'},
   {text:'BAV de 2º grau Mobitz II',why:'No Mobitz II o PR é constante nos batimentos conduzidos; aqui não há condução AV e o PR aparente muda a cada batimento.'}]},
  {kind:'Gravidade',points:15,prompt:'Como classificar a situação?',options:[
   {text:'Bradicardia com sinais de instabilidade e hipoperfusão',ok:true,why:'Síncope, hipotensão, sonolência e pele fria indicam que a bradicardia está causando comprometimento hemodinâmico.'},
   {text:'Estável, pois o escape mantém FC acima de 30 bpm',why:'Não existe corte de frequência que garanta estabilidade; o que define a gravidade são os sinais de hipoperfusão.'},
   {text:'Estável, porque o paciente está respirando e tem pulso',why:'Ter pulso e ventilação não exclui choque; hipotensão e alteração de consciência já caracterizam instabilidade.'},
   {text:'Sem risco imediato, pois o escape ventricular é estável',why:'Escapes ventriculares são lentos e pouco confiáveis e podem falhar, levando a assistolia.'}]},
  {kind:'Conduta',points:40,context:'O paciente continua hipotenso e sonolento. O marca-passo transcutâneo está disponível no desfibrilador.',prompt:'Qual conduta deve ser priorizada?',options:[
   {text:'Atropina 1 mg IV e, sem resposta, marca-passo transcutâneo e/ou adrenalina (2–10 µg/min) ou dopamina (5–20 µg/kg/min) como ponte para o transvenoso',ok:true,why:'É a sequência do algoritmo AHA 2025. No BAV total com escape largo o bloqueio costuma ser abaixo do nó AV, e a atropina, que age no nó, geralmente falha: tenha o marca-passo pronto e passe logo à segunda linha, sem esperar a dose máxima.'},
   {text:'Repetir doses de atropina até a resposta antes de pensar em marca-passo',why:'A atropina tem dose máxima (1 mg a cada 3–5 min, até 3 mg) e raramente funciona em bloqueio infranodal; insistir nela atrasa a estimulação ou a infusão de adrenalina/dopamina.'},
   {text:'Amiodarona IV para suprimir o ritmo ventricular',why:'O ritmo largo é o escape que mantém o paciente vivo; suprimi-lo pode causar assistolia.'},
   {text:'Agendar marca-passo definitivo eletivo e observar',why:'O implante definitivo virá, mas a instabilidade atual exige estimulação temporária imediata.'}]},
  {kind:'Evolução',points:20,pattern:'mp',context:'Nesta evolução simulada, o marca-passo transcutâneo foi ligado e o monitor mostra o traçado abaixo. A PA sobe para 104/62 mmHg e o paciente fica mais desperto.',vitals:'PA 104/62 mmHg · FC 72 bpm (estimulada) · FR 18 irpm · SpO₂ 96%',prompt:'Qual é o próximo passo?',options:[
   {text:'Confirmar captura pelo pulso, fazer analgesia/sedação, buscar causas reversíveis e acionar marca-passo transvenoso',ok:true,why:'A espícula não prova captura mecânica; o pulso deve acompanhar a frequência estimulada. O transcutâneo é uma ponte: investigue isquemia, hipercalemia e drogas e providencie estimulação transvenosa.'},
   {text:'Confiar apenas nas espículas do monitor para confirmar a captura',why:'Espículas podem aparecer sem captura ventricular; é preciso confirmar QRS após cada espícula e pulso correspondente.'},
   {text:'Desligar o marca-passo, já que a pressão melhorou',why:'A melhora depende da estimulação; o bloqueio persiste e o paciente pode voltar a ficar instável.'},
   {text:'Dar alta com seguimento ambulatorial após estabilizar',why:'BAV total sintomático exige internação, estimulação temporária e avaliação para marca-passo definitivo.'}]}]}
];
