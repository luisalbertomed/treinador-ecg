/* Alternativas de raciocínio para os roteiros novos. Condutas corretas e doses da 4.0 preservadas.
   Conferência: AHA 2025 Parte 9 e guia oficial ACC/AHA de dor torácica 2021; limites no LEIA-ME-v4.1. */
const V41_CHANGED=new Set();
function alternativasDoCaso(c,kind,wrong,scenario=null){
 const step=c.steps.find(s=>s.kind===kind);if(!step)return;
 const target=scenario?(step.variants[scenario]||(step.variants[scenario]={})):step;
 const old=target.options||step.options,correct=old.find(o=>o.ok),delay=Math.max(0,...old.filter(o=>!o.ok).map(o=>o.delay||0));
 target.options=[{...correct},...wrong.map(([text,why],i)=>({text,why,...(i===0&&delay?{delay}:{})}))];V41_CHANGED.add(c.id);
}
const V41_DIAGNOSES={
 v4_tsv:[['Taquicardia sinusal','O início abrupto e o traçado regular muito rápido com atividade atrial pouco evidente favorecem TSV neste exercício.'],['Flutter atrial com condução 2:1','O traçado apresentado não mostra a atividade atrial organizada em ondas F do padrão de flutter.'],['Taquicardia ventricular monomórfica','Os complexos são estreitos neste traçado, sem o padrão ventricular largo do roteiro de TV.']],
 v4_fa:[['Flutter atrial com condução fixa 2:1','Os intervalos ventriculares são irregulares e não há ondas F organizadas com condução fixa.'],['Taquicardia atrial multifocal','Não há ondas P identificáveis com múltiplas morfologias; o padrão do exercício corresponde a FA.'],['FA com pré-excitação ventricular','Os complexos deste traçado são estreitos, sem os complexos largos variáveis do cenário de pré-excitação.']],
 v4_flutter:[['Taquicardia sinusal','A atividade atrial organizada em ondas F é distinta de uma onda P sinusal por complexo.'],['TSV por reentrada nodal','O padrão do exercício permite reconhecer ondas F atriais repetidas, em vez de assumir reentrada nodal pela frequência.'],['Fibrilação atrial','A atividade atrial é organizada e a resposta ventricular do traçado é regular, ao contrário do padrão de FA deste banco.']],
 v4_tv_pulso:[['TSV com aberrância de condução como diagnóstico confirmado','QRS largo não confirma uma origem supraventricular; o contexto e o padrão do exercício favorecem TV monomórfica.'],['TV polimórfica do tipo torsades','A morfologia ventricular permanece semelhante, sem a variação cíclica de amplitude e eixo do padrão de torsades.'],['FA com pré-excitação ventricular','O ritmo apresentado é regular e monomórfico; FA pré-excitada costuma exigir reconhecer irregularidade e variação dos complexos.']],
 v4_sinusal:[['TSV por reentrada como causa primária','Há atividade sinusal organizada; a história e o traçado apontam resposta à doença de base.'],['Flutter atrial com condução 2:1','O exercício mostra ondas P sinusais, sem ondas F organizadas.'],['Fibrilação atrial com resposta rápida','O ritmo é regular, com atividade atrial organizada, sem os achados do padrão de FA.']],
 v4_fa_preexc:[['TV monomórfica','A irregularidade e a variação dos complexos não correspondem ao padrão regular monomórfico de TV.'],['FA de complexos estreitos','Os complexos são largos e variáveis; ignorar isso mudaria a segurança da escolha farmacológica.'],['Flutter atrial com condução fixa e bloqueio de ramo','O traçado é irregular, com complexos variáveis, sem atividade atrial organizada de condução fixa.']],
 v4_bradi_sinusal:[['Ritmo juncional de escape','O traçado conserva ondas P sinusais relacionadas aos complexos QRS.'],['Bloqueio AV total','Não há dissociação atrioventricular no padrão apresentado.'],['Mobitz II','O traçado não mostra as falhas intermitentes de condução do padrão Mobitz II.']],
 v4_mobitz2:[['Mobitz I, fenômeno de Wenckebach','Não há o alongamento progressivo do PR antes da falha de condução que caracteriza o padrão de Wenckebach.'],['Bloqueio AV total','Ainda há relação de condução nos batimentos conduzidos; não é o padrão de dissociação AV completa.'],['Bradicardia sinusal sem bloqueio AV','O ritmo lento não é explicado apenas por frequência sinusal baixa: há falhas de condução no traçado.']],
 v4_bav_total:[['Bradicardia sinusal sem bloqueio AV','Ondas P e complexos ventriculares seguem ritmos independentes neste exercício.'],['Mobitz II','O traçado apresenta dissociação AV completa, além de uma falha intermitente de condução.'],['Ritmo juncional com condução AV normal','A atividade atrial independente do escape ventricular impede chamar a condução AV de normal.']]
};
const V41_THERAPY={
 v4_tsv:{
 estavel:[['Usar digoxina para terminar imediatamente a taquicardia regular','Digoxina não é o tratamento de terminação indicado pelo algoritmo deste cenário.'],['Manter apenas observação após excluir toda causa cardíaca pelo pulso presente','Pulso presente não exclui uma arritmia que exige tratamento e reavaliação.'],['Aplicar choque sem sincronização para terminar a taquicardia com perfusão preservada','Esse ritmo com pulso não justifica escolher desfibrilação em lugar da abordagem da taquicardia regular.']],
 instavel:[['Tentar sucessivas medicações enquanto adia a cardioversão para depois da estabilização','A instabilidade atribuída à arritmia exige preparar cardioversão sem esse atraso.'],['Usar apenas um betabloqueador IV para controlar a frequência antes de avaliar intervenção elétrica','Hipoperfusão nesta situação exige a intervenção elétrica indicada, e fármacos não devem atrasá-la.'],['Realizar a cardioversão com a função de sincronização desligada','A intervenção indicada para esta taquicardia com pulso é sincronizada.']]},
 v4_fa:{
 estavel:[['Reverter com adenosina como tratamento definitivo da FA','Adenosina não é a estratégia de reversão da FA.'],['Cardioverter eletivamente sem avaliar a duração desconhecida e a prevenção tromboembólica','A estratégia eletiva precisa considerar esses fatores no paciente com perfusão preservada.'],['Usar o controle da frequência como motivo para dispensar investigação e seguimento','Controlar a frequência não encerra a avaliação da causa e da prevenção tromboembólica.']],
 instavel:[['Esperar concluir a avaliação eletiva de anticoagulação antes de cardioverter','Quando a instabilidade é atribuída à FA, essa avaliação não deve atrasar a cardioversão urgente.'],['Tentar adenosina para converter a arritmia antes de preparar o choque','Adenosina não resolve o mecanismo da FA e não deve atrasar a intervenção indicada.'],['Fazer um choque sem sincronização, embora a sincronização esteja disponível','A cardioversão indicada é sincronizada; prepare o procedimento e a segurança.']]},
 v4_flutter:{
 estavel:[['Repetir adenosina visando terminar o flutter como se fosse reentrada nodal','Pode alterar a condução e ajudar a evidenciar atividade atrial; não é a estratégia de terminação do flutter.'],['Escolher reversão eletiva ignorando a duração desconhecida da arritmia','A estratégia de ritmo deve integrar duração e avaliação tromboembólica.'],['Definir alta assim que a frequência diminuir, sem reavaliar causa e estratégia','A resposta precisa ser integrada ao contexto e à continuidade do cuidado.']],
 instavel:[['Adiar o procedimento elétrico para testar apenas controle farmacológico de frequência','O comprometimento atribuído ao flutter exige cardioversão urgente.'],['Aplicar choque sem sincronização porque há resposta ventricular rápida','A frequência rápida, sozinha, não muda a intervenção indicada para choque não sincronizado.'],['Aguardar investigação eletiva do risco tromboembólico antes da cardioversão urgente','A continuidade inclui essa avaliação, sem atrasar a intervenção por instabilidade.']]},
 v4_tv_pulso:{
 estavel:[['Administrar verapamil IV supondo TSV com aberrância pelo pulso presente','A Parte 9 contraindica verapamil em taquicardia de complexos largos; pulso presente não confirma origem supraventricular.'],['Aplicar a dose de amiodarona em bolus da PCR como se já não houvesse pulso','O esquema com pulso e perfusão preservada é distinto do algoritmo de parada.'],['Tratar apenas como ansiedade porque a pressão está preservada','A estabilidade permite avaliação e tratamento monitorizados; não elimina o risco da TV.']],
 instavel:[['Manter uma infusão lenta e aguardar seu término antes da intervenção elétrica','A hipoperfusão atribuída à TV exige cardioversão imediata.'],['Usar diltiazem IV antes do procedimento para reduzir a frequência','Diltiazem não deve ser administrado na taquicardia de complexos largos deste cenário.'],['Escolher choque sem sincronização para toda TV monomórfica com pulso','A intervenção indicada neste contexto é cardioversão sincronizada.']]},
 v4_sinusal:{
 estavel:[['Administrar adenosina para reverter a resposta sinusal como uma TSV','O ritmo sinusal e a causa de base orientam o tratamento; não há mecanismo de reentrada a terminar neste exercício.'],['Cardioverter para normalizar a frequência antes de tratar a causa','A intervenção não corrige a causa da resposta sinusal apresentada.'],['Reduzir a frequência com bloqueador nodal como única medida','A abordagem da causa e a reavaliação da perfusão são centrais; não basta perseguir o número da frequência.']],
 instavel:[['Cardioverter a taquicardia sinusal como causa primária do choque','Neste cenário, a taquicardia é resposta à doença de base; trate choque e causa.'],['Administrar adenosina e aguardar a frequência normalizar antes de oferecer suporte','Essa escolha atrasa o suporte e não corrige o mecanismo do ritmo sinusal.'],['Priorizar um bloqueador nodal para reduzir a frequência durante a hipoperfusão','O suporte dirigido à perfusão e à causa não deve ser substituído por redução isolada da frequência.']]},
 v4_fa_preexc:{
 estavel:[['Controlar a frequência com diltiazem IV','Bloquear o nó AV na FA pré-excitada pode favorecer condução pela via acessória; evite essa escolha.'],['Usar amiodarona IV como escolha automática para o ritmo irregular largo','A Parte 9 inclui amiodarona IV entre as opções a evitar neste contexto de pré-excitação.'],['Administrar adenosina para esclarecer e tratar a taquicardia irregular larga','Adenosina não deve ser usada na taquicardia irregular de complexos largos.']],
 instavel:[['Usar metoprolol para controle de frequência antes de preparar cardioversão','Pré-excitação e instabilidade tornam inadequada essa estratégia de bloqueio nodal.'],['Administrar amiodarona IV e aguardar a reversão antes do procedimento','Além do atraso na instabilidade, esse fármaco deve ser evitado na FA pré-excitada.'],['Usar adenosina por haver acesso venoso disponível','O acesso disponível não torna segura a adenosina nesta taquicardia irregular larga.']]}
};
for(const id of ['v4_bradi_sinusal','v4_mobitz2','v4_bav_total'])V41_THERAPY[id]={
 estavel:id==='v4_bradi_sinusal'?[
 ['Indicar marca-passo definitivo sem investigar causas reversíveis','O roteiro não estabelece indicação definitiva a partir de uma avaliação isolada; investigue causa e resposta.'],
 ['Usar atropina repetidamente apenas para atingir uma frequência normal, sem relacionar aos sintomas','A avaliação relaciona sintomas, perfusão e causas; não há alvo isolado de frequência neste exercício.'],
 ['Dispensar revisão de medicamentos porque a pressão está preservada','Medicamentos e outras causas reversíveis continuam relevantes mesmo sem hipoperfusão atual.']]:[
 ['Dar alta porque a pressão desta avaliação está preservada','O bloqueio de alto grau e a história exigem monitorização e avaliação especializada.'],
 ['Prescrever betabloqueador para regularizar a condução AV','Esse bloqueio não é tratado reduzindo a condução nodal com betabloqueador.'],
 ['Adiar toda preparação de estimulação até ocorrer perda de pulso','A preparação e a avaliação ocorrem antes da possível deterioração.']],
 instavel:[
 ['Esperar completar toda a sequência de atropina antes de preparar estimulação','Hipoperfusão persistente e possível falha da atropina exigem preparação paralela, sem esperar a dose máxima.'],
 ['Tratar apenas os sintomas com sedação e aguardar recuperação do pulso lento','Sedação não corrige a hipoperfusão associada à bradicardia.'],
 ['Iniciar betabloqueador para organizar o ritmo e melhorar a pressão','Reduzir a frequência/condução pode piorar a situação; o algoritmo é de suporte à bradicardia.']]
};
for(const [id,wrong] of Object.entries(V41_DIAGNOSES)){
 const c=CLINICAL_CASES.find(c=>c.id===id);
 for(const scenario of ['estavel','instavel']){
  const suffix=scenario==='estavel'?'; pulso presente e perfusão preservada nesta avaliação':'; pulso presente e comprometimento hemodinâmico nesta avaliação';
  alternativasDoCaso(c,'Interpretação e perfusão',wrong.map(([t,w])=>[t+suffix,w]),scenario==='estavel'?null:scenario);
  alternativasDoCaso(c,'Conduta inicial',V41_THERAPY[id][scenario],scenario==='estavel'?null:scenario);
 }
}
/* Dor torácica: a leitura, a série e a decisão têm erros próprios de cada contexto. */
const V41_CHEST={
 v4_dor_baixo:{
 ecg:[['ECG normal confirma dor musculoesquelética sem precisar integrar a história','O traçado normal não estabelece sozinho a causa da dor.'],['ECG normal exclui todas as causas cardiovasculares graves','O risco depende também da história, avaliação clínica e investigação dirigida.'],['ECG sem supra confirma SCA sem supra em toda dor torácica','Ausência de supra não é diagnóstico de SCA; integre os demais dados.']],
 serial:[['A pequena diferença entre as coletas confirma infarto independentemente do protocolo','O contexto e os critérios do ensaio informado não sustentam essa conclusão.'],['O protocolo pode ser dispensado porque os valores estão abaixo do limite','O caso declara que uma via validada foi atendida; dois valores isolados não viram regra universal.'],['A exclusão de infarto pela via seriada exclui também todas as causas não coronarianas','A avaliação de outras causas graves continua sendo clínica e dirigida.']],
 heart:[['Internar obrigatoriamente por SCA apesar da avaliação de baixo risco e da via de exclusão atendida','O exercício permite discutir alta com seguimento após integrar todos os dados; não há indicação de internação automática pelos achados apresentados.'],['Solicitar teste cardíaco urgente de rotina antes de qualquer possibilidade de alta','A diretriz permite dispensar teste urgente de rotina na avaliação de baixo risco do caso.'],['Dar alta pelo HEART baixo, dispensando orientações, sinais de alerta e seguimento','A decisão inclui essas medidas e a via validada, não apenas o número do escore.']]},
 v4_dor_intermediaria:{
 ecg:[['Alterações inespecíficas confirmam infarto sem necessidade de biomarcadores','Esse traçado não estabelece infarto; integre sintomas e biomarcadores.'],['A ausência de supra regional torna desnecessária a investigação seriada','A hipótese de SCA permanece conforme a clínica e a via de decisão.'],['A alteração de repolarização indica fibrinólise imediata neste cenário','Não há indicação de fibrinólise pelos achados apresentados.']],
 serial:[['Duas troponinas abaixo do limite autorizam alta apesar de dor recorrente e risco persistente','O caso não documenta uma via de exclusão para alta; sintomas e risco exigem avaliação adicional.'],['Qualquer aumento entre duas medidas abaixo do limite define infarto','A variação é interpretada com critérios do ensaio e evidência clínica; essa regra isolada é incorreta.'],['Troponina sem elevação confirma uma causa extracardíaca para a dor','A ausência de elevação não estabelece a causa da dor.']],
 heart:[['Dar alta por troponina abaixo do limite, ignorando o HEART intermediário e os sintomas','A observação e a avaliação adicional são indicadas pelo contexto do exercício.'],['Indicar cateterismo imediato apenas pelo número do HEART, sem integrar clínica e instabilidade','O escore apoia a avaliação; não determina sozinho uma intervenção imediata.'],['Considerar que HEART intermediário confirma infarto','O escore estratifica risco e não estabelece diagnóstico de infarto.']]},
 v4_dor_troponina:{
 ecg:[['ECG sem supra persistente exclui isquemia em paciente com sintomas típicos','Alterações isquêmicas sem supra persistente podem orientar investigação de SCA.'],['O ECG estabelece infarto sem precisar avaliar dinâmica dos biomarcadores','O diagnóstico integra ECG, sintomas e biomarcadores; o traçado isolado não completa essa classificação.'],['Toda alteração de ST indica fibrinólise como próxima ação','O padrão e o contexto não autorizam aplicar fibrinólise a toda alteração de ST.']],
 positiva:[['A elevação dinâmica comprova infarto em qualquer paciente, mesmo sem evidência de isquemia','Neste caso há evidência de isquemia; a regra proposta confunde lesão miocárdica com infarto em outros contextos.'],['Não há SCA porque o traçado não apresenta supra persistente','Sintomas, ECG e elevação dinâmica são compatíveis com IAM sem supra no exercício.'],['Aguardar normalização da troponina antes de abordar o quadro isquêmico','O atendimento e a estratificação seguem o risco clínico, sem esperar essa normalização.']],
 negativa:[['Excluir SCA e dar alta pelas troponinas sem elevação','Dor recorrente e alterações isquêmicas mantêm necessidade de avaliação hospitalar.'],['Confirmar infarto apenas pelo padrão do ECG, mesmo sem evidência de necrose','A classificação integra os biomarcadores; SCA pode existir sem infarto.'],['Dispensar ECGs e avaliação seriados porque a primeira série foi negativa','Persistência dos sintomas e alterações exige continuidade da avaliação.']],
 heart:[['Dar alta porque a pressão está preservada, apesar do risco alto e da evidência clínica','Estabilidade nesta avaliação não elimina o risco do conjunto de achados.'],['Usar fibrinólise de rotina por ser um quadro de alto risco sem supra persistente','Risco alto não é indicação automática de fibrinólise neste contexto.'],['Tratar o HEART como diagnóstico definitivo e dispensar avaliação da evolução','O escore apoia a decisão; não substitui a classificação clínica e a resposta ao cuidado.']]}
};
for(const [id,d] of Object.entries(V41_CHEST)){
 const c=CLINICAL_CASES.find(c=>c.id===id);
 alternativasDoCaso(c,'ECG inicial',d.ecg);
 if(c.scenarios){for(const scenario of ['positiva','negativa']){alternativasDoCaso(c,'Resultados e coleta seriada',d[scenario],scenario);alternativasDoCaso(c,'Estratificação e decisão',d.heart,scenario);}}
 else{alternativasDoCaso(c,'Resultados e coleta seriada',d.serial);alternativasDoCaso(c,'Estratificação e decisão',d.heart);}
}
/* Resultados do primeiro exame permanecem consultáveis inclusive na variante da série. */
const V41_TROPONIN_CASE=CLINICAL_CASES.find(c=>c.id==='v4_dor_troponina');
const V41_EXAM_STEP=V41_TROPONIN_CASE.steps.find(s=>s.exams);V41_EXAM_STEP.variants={};
for(const [scenario,value] of [['positiva',50],['negativa',8]])V41_EXAM_STEP.variants[scenario]={options:V41_EXAM_STEP.options.map((o,i)=>i===0?{...o,result:'Troponina ultrassensível inicial: '+value+' ng/L · limite de referência 14 ng/L'}:{...o})};
/* Reavaliações usam a evolução do próprio caso, inclusive a deterioração da FA. */
for(const id of Object.keys(V41_DIAGNOSES)){
 const c=CLINICAL_CASES.find(c=>c.id===id),bradi=c.track==='bradi';
 for(const scenario of ['estavel','instavel']){
  let wrong;
  if(bradi&&scenario==='instavel')wrong=[
   ['Continuar somente atropina, adiando estimulação apesar da hipoperfusão persistente','O roteiro já registra falha da atropina; prepare o suporte seguinte sem esse atraso.'],
   ['Iniciar estimulação sem verificar resposta de pulso e pressão','Captura elétrica e resposta mecânica/perfusão precisam ser verificadas.'],
   ['Usar melhora do aspecto do monitor como único critério para suspender suporte','O monitor não substitui a reavaliação de pulso, pressão e perfusão.']];
  else if(id==='v4_tsv'&&scenario==='estavel')wrong=[
   ['Manter somente observação da taquicardia após falha de manobra vagal e adenosina','A persistência após o tratamento permite discutir cardioversão e consulta especializada.'],
   ['Escolher digoxina como intervenção de terminação imediata após a falha descrita','Essa escolha não corresponde à estratégia de terminação do algoritmo usado.'],
   ['Dar alta porque a perfusão está preservada, mesmo com a taquicardia persistente','O roteiro exige continuidade da avaliação e do tratamento.']];
  else if(id==='v4_fa'&&scenario==='estavel')wrong=[
   ['Manter o plano eletivo inicial de controle de frequência apesar da nova confusão e hipotensão','A situação mudou; a deterioração atribuída à arritmia exige cardioversão urgente.'],
   ['Esperar exames de anticoagulação antes de tratar a deterioração','A avaliação da continuidade não deve atrasar a intervenção na instabilidade.'],
   ['Administrar adenosina para converter a FA nesta reavaliação','Não é estratégia de conversão da FA e não resolve a prioridade atual.']];
  else if(id==='v4_sinusal')wrong=V41_THERAPY[id][scenario];
  else if(id==='v4_fa_preexc')wrong=V41_THERAPY[id][scenario];
  else if(scenario==='instavel'&&!bradi)wrong=[
   ['Repetir cardioversão apenas pelo ritmo anterior, sem verificar o ECG e a perfusão atuais','A resposta já mudou; o histórico isolado não define nova indicação de choque.'],
   ['Encerrar a monitorização imediatamente porque a pressão melhorou','A melhora exige continuidade e investigação, conforme o risco clínico.'],
   ['Registrar apenas a frequência final, omitindo intervenção e horários da passagem do cuidado','A equipe que recebe precisa conhecer evolução, intervenções e resposta.']];
  else if(bradi)wrong=V41_THERAPY[id].estavel;
  else wrong=V41_THERAPY[id].estavel;
  alternativasDoCaso(c,'Reavaliação',wrong,scenario==='estavel'?null:scenario);
 }
}
for(const [id,base] of [['v4_tv_parada','v4_tv_pulso'],['v4_bradi_parada','v4_bav_total']]){
 const c=CLINICAL_CASES.find(c=>c.id===id);
 alternativasDoCaso(c,'Interpretação',V41_DIAGNOSES[base].map(([t,w])=>[t+' com pulso presente',w]));
 alternativasDoCaso(c,'Conduta com pulso',V41_THERAPY[base][id==='v4_tv_parada'?'estavel':'instavel']);
}
const V41_HYPERK=CLINICAL_CASES.find(c=>c.id==='v4_hiperk_parada');
alternativasDoCaso(V41_HYPERK,'Interpretação',[
 ['Bloqueio de ramo isolado como explicação suficiente, sem considerar o contexto','A história de hemodiálise e as alterações do exercício exigem considerar distúrbio metabólico urgente.'],
 ['Ritmo de parada definido exclusivamente pelo ECG, apesar do pulso palpável','A avaliação clínica informa pulso nesta etapa; a mudança para PCR depende da perda do pulso.'],
 ['ECG normal porque ainda existe pulso e a pessoa responde','Pulso e responsividade não excluem alterações graves no ECG.']]);
alternativasDoCaso(V41_HYPERK,'Conduta com pulso',[
 ['Esperar a rotina da próxima sessão de hemodiálise, sem tratar a suspeita urgente','O contexto e o ECG não permitem aguardar a rotina sem suporte e avaliação urgente.'],
 ['Usar um bloqueador nodal como única medida para corrigir o distúrbio metabólico','Essa intervenção não corrige a causa suspeita do exercício.'],
 ['Tratar apenas o achado elétrico e dispensar avaliação do potássio e remoção','A investigação e o tratamento da causa, incluindo remoção conforme protocolo, continuam necessários.']]);
for(const id of ['v4_tv_parada','v4_bradi_parada','v4_hiperk_parada']){
 const c=CLINICAL_CASES.find(c=>c.id===id),chocavel=id==='v4_tv_parada';
 alternativasDoCaso(c,'Novo monitor',chocavel?[
 ['FV sem pulso: usar cardioversão sincronizada e pausar RCP até a sincronização','FV não exige sincronização; o algoritmo é de desfibrilação e retomada imediata da RCP.'],
 ['Ritmo rápido: continuar o esquema da TV com pulso, apesar da perda do pulso','A perda do pulso mudou o algoritmo para parada.'],
 ['FV: priorizar medicação e adiar o choque disponível','O choque é intervenção prioritária no ritmo chocável deste cenário.']]:[
 ['Atividade organizada sem pulso: desfibrilar como primeira intervenção','A atividade organizada sem pulso corresponde a AESP, que não é chocável.'],
 ['Atividade organizada: suspender RCP porque o monitor mostra complexos','Complexos no monitor não demonstram circulação efetiva.'],
 ['Atividade organizada sem pulso: tratar apenas a causa suspeita, interrompendo o suporte da parada','O suporte padrão da PCR continua enquanto a causa reversível é abordada.']]);
}
const V41_AORTA=CLINICAL_CASES.find(c=>c.id==='v4_aorta');
alternativasDoCaso(V41_AORTA,'Avaliação da gravidade',[
 ['Priorizar apenas a via de SCA e desconsiderar a assimetria de pulso e pressão','Esses achados e a dor súbita máxima exigem considerar uma causa aórtica grave.'],
 ['Classificar como dor de baixo risco porque a pessoa ainda tem pulso','Pulso presente não afasta a hipótese grave sugerida pela apresentação.'],
 ['Usar a intensidade da dor como único critério, sem integrar início e exame','Início, irradiação e assimetria do exame são dados centrais desta avaliação.']]);
alternativasDoCaso(V41_AORTA,'Monitor e ECG',[
 ['ECG sem isquemia exclui síndrome aórtica e permite encerrar a investigação','O ECG não exclui a hipótese aórtica deste caso.'],
 ['ECG normal torna a troponina o único exame necessário para avaliar a aorta','A investigação dirigida à hipótese aórtica exige outra via de avaliação.'],
 ['ECG sem supra confirma que a dor é benigna apesar dos sinais de alerta','A história e o exame mantêm a prioridade de investigar causa grave.']]);
alternativasDoCaso(V41_AORTA,'Resultado e decisão',[
 ['Manter apenas observação da dor sem acionar equipe cardiovascular após o achado da imagem','O envolvimento da aorta ascendente exige atendimento cardiovascular/cirúrgico urgente no exercício.'],
 ['Tratar com fibrinólise como SCA sem rever o achado da aorta','A apresentação e a imagem não autorizam essa abordagem automática de SCA.'],
 ['Usar melhora da dor como razão para dispensar a equipe especializada','O achado da imagem mantém a necessidade de atendimento urgente mesmo com mudança do sintoma.']]);
for(const id of V41_CHANGED){const c=CLINICAL_CASES.find(c=>c.id===id);c.rev=(c.rev||1)+1;c.sourceNote+=' Alternativas revisadas na 4.1: interpretações e erros próprios do caso; gabaritos e doses preservados. Revisão independente pendente.';}
