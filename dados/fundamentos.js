/* ==========================================================================
   DADOS DE FUNDAMENTOS — textos das aulas, territórios anatômicos e roteiro
   ========================================================================== */
const COR_ART = {da: '#e2574c', cd: '#f0a93a', cx: '#4dd0c4', tce: '#c07ae0'};
const NOME_ART = {da: 'descendente anterior (DA)', cd: 'coronária direita (CD)',
                  cx: 'circunflexa (CX)', tce: 'tronco da coronária esquerda'};

/* parede → derivações, artéria, segmentos que acendem no coração */
const TERRITORIOS = [
  {id:'inferior', nome:'Inferior', leads:['DII','DIII','aVF'], art:'cd', segs:['inf','infsep'],
   espelho:'DI e aVL', graus:'+60° a +120°',
   txt:'É a parede que apoia no diafragma. Em 85% das pessoas quem irriga é a coronária direita — por isso IAM inferior vem com bradicardia e bloqueio AV (o nó sinusal e o nó AV são irrigados por ela). Sempre peça V3R/V4R: um terço deles tem extensão para o ventrículo direito, e aí nitrato derruba a pressão.'},
  {id:'septal', nome:'Septal', leads:['V1','V2'], art:'da', segs:['antsep','infsep'],
   espelho:'V7–V9', graus:'—',
   txt:'V1 e V2 ficam de frente para o septo interventricular, irrigado pelos ramos septais da descendente anterior. É onde nasce a onda R pequena da progressão normal — se ela some, pense em infarto anterosseptal antigo.'},
  {id:'anterior', nome:'Anterior', leads:['V3','V4'], art:'da', segs:['ant','antsep'],
   espelho:'DII, DIII e aVF', graus:'—',
   txt:'A parede da frente do ventrículo esquerdo. Território da descendente anterior — a artéria que mais massa miocárdica alimenta, motivo pelo qual oclusão proximal dela é chamada de "viúva" e cursa com choque cardiogênico.'},
  {id:'lateral', nome:'Lateral', leads:['DI','aVL','V5','V6'], art:'cx', segs:['antlat','inflat'],
   espelho:'DII, DIII e aVF', graus:'−30° a +30°',
   txt:'DI e aVL enxergam a lateral alta; V5 e V6, a lateral baixa. Costuma ser da circunflexa ou do primeiro ramo diagonal. Supra isolado em DI e aVL com infra em DII/DIII/aVF é o padrão clássico da lateral alta.'},
  {id:'posterior', nome:'Posterior (dorsal)', leads:['V7','V8','V9'], art:'cx', segs:['inflat','inf'],
   espelho:'V1–V3 (infra + R alta)', graus:'—',
   txt:'O ECG de 12 derivações não olha as costas: você só vê o espelho. Infra de ST em V1–V3 com onda R alta e T positiva é IAM posterior até prova em contrário — vire o papel de cabeça para baixo e o infra vira supra. Confirme colocando V7, V8 e V9.'},
  {id:'vd', nome:'Ventrículo direito', leads:['V3R','V4R'], art:'cd', segs:['vd'],
   espelho:'—', graus:'—',
   txt:'Só aparece em derivações direitas. Supra ≥ 0,5–1 mm em V4R fecha o diagnóstico. A tríade é hipotensão + turgência jugular + pulmão limpo, e o tratamento é VOLUME: nitrato e morfina podem causar colapso hemodinâmico.'},
  {id:'cavidade', nome:'Cavidade (aVR)', leads:['aVR'], art:'tce', segs:[],
   espelho:'todas as demais', graus:'−150°',
   txt:'aVR olha de cima para dentro da cavidade e da via de saída. Por isso quase tudo nela é negativo. Supra em aVR ≥ 1 mm junto com infra difuso nas outras derivações sugere lesão de tronco ou triarterial — é um dos padrões de maior mortalidade do ECG.'}
];
const TMAP = {}; TERRITORIOS.forEach(t => TMAP[t.id] = t);

const SEGS = [
  {id:'ant',    a0:-120, a1:-60,  lbl:'ant',     art:'da'},
  {id:'antlat', a0:-60,  a1:0,    lbl:'lat',     art:'cx'},
  {id:'inflat', a0:0,    a1:60,   lbl:'ínf-lat', art:'cx'},
  {id:'inf',    a0:60,   a1:120,  lbl:'inf',     art:'cd'},
  {id:'infsep', a0:120,  a1:180,  lbl:'sep',     art:'cd'},
  {id:'antsep', a0:180,  a1:240,  lbl:'sep',     art:'da'}
];

const ZOOM1 = {layout:'stack', leads:['DII'], seconds:4, rowMm:34};

const FUNDAMENTOS = [
{
  id:'papel', titulo:'O papel do ECG', sub:'Sem isto, nenhuma medida que você fizer depois vale',
  blocos:[
    {t:'p', v:'Todo ECG é registrado numa velocidade e numa amplitude padronizadas: <b>25 mm/s</b> na horizontal e <b>10 mm/mV</b> na vertical. Confira isso no rodapé do traçado <b>antes</b> de medir qualquer coisa — se o aparelho estava em outra configuração, todas as suas medidas saem erradas na mesma proporção.'},
    {t:'fig', v:'grade', l:'A grade, em dois números'},
    {t:'box', k:'cond', l:'Os números que resolvem tudo', v:'<b>Horizontal (tempo):</b> 1 quadradinho = 0,04 s (40 ms) · 1 quadrado grande = 0,20 s · 5 quadrados grandes = 1 segundo.<br><b>Vertical (voltagem):</b> 1 quadradinho = 0,1 mV · 1 quadrado grande = 0,5 mV · 10 mm = 1 mV.'},
    {t:'p', v:'O pulso retangular no começo de cada linha é a <b>calibração</b>: ele mede exatamente 10 mm e vale 1 mV. Se estiver pela metade, o aparelho está em meia amplitude e todo critério de voltagem (Sokolow, por exemplo) precisa ser corrigido antes de você concluir qualquer coisa.'},
    {t:'ecg', pat:'sinusal', view:ZOOM1,
     dica:'Ative o <b>Compasso</b> logo abaixo do traçado e arraste: ele converte a distância em milissegundos e em milivolts para você.'},
    {t:'ul', l:'Armadilhas de registro que você precisa reconhecer', v:[
      '<b>Velocidade em 50 mm/s</b> — tudo parece alargado: QRS "largo" e bradicardia falsa.',
      '<b>Meia amplitude</b> — complexos pequenos demais; risco de perder sobrecarga de VE ou laudar baixa voltagem que não existe.',
      '<b>Tremor ou mau contato</b> — linha de base irregular que imita fibrilação atrial e, em casos extremos, até FV. Olhe se a "arritmia" aparece em todas as derivações ou só numa.',
      '<b>Filtro de rede mal ajustado</b> — some com pequenos detalhes e pode apagar onda P ou espícula de marca-passo.'
    ]}
  ]
},
{
  id:'derivacoes', titulo:'O que cada derivação enxerga', sub:'Parede, artéria e imagem em espelho',
  blocos:[
    {t:'p', v:'As 12 derivações são 12 câmeras apontadas para o coração de ângulos diferentes. Quando o vetor elétrico vem <b>em direção</b> à câmera, a deflexão é positiva; quando se afasta, é negativa. Agrupar as derivações ajuda a localizar alterações: DII, DIII e aVF se relacionam à região inferior. Isso, sozinho, não identifica com certeza a artéria envolvida.'},
    {t:'figpair', a:'einthoven', al:'Plano frontal — triângulo de Einthoven', b:'precordiais', bl:'Plano horizontal — onde colar V1 a V6',
     dica:'Errar a altura de V1 e V2 é a causa mais comum de pseudo-Brugada e de má progressão de R falsa. V4 é a referência: 5º espaço intercostal na linha médio-clavicular.'},
    {t:'mapa'},
    {t:'tab', head:['Derivações','Parede','Artéria mais provável','Imagem em espelho'], rows:[
      ['DII, DIII, aVF','Inferior','Coronária direita (85%) ou circunflexa','DI e aVL'],
      ['V1, V2','Septal','Descendente anterior (ramos septais)','V7–V9'],
      ['V3, V4','Anterior','Descendente anterior','DII, DIII, aVF'],
      ['V5, V6','Lateral baixa','Circunflexa ou diagonal','DIII e aVF'],
      ['DI, aVL','Lateral alta','1ª diagonal da DA ou circunflexa','DII, DIII, aVF'],
      ['V7, V8, V9','Posterior (dorsal)','Circunflexa ou coronária direita','V1–V3 (infra + R alta)'],
      ['V3R, V4R','Ventrículo direito','Coronária direita proximal','—'],
      ['aVR','Cavidade / via de saída','Tronco da coronária esquerda','Todas as demais']
    ]},
    {t:'box', k:'peg', l:'A regra que vale ouro', v:'Derivações <b>contíguas</b> são as que olham a mesma parede, e o critério de supra exige <b>duas contíguas</b>. Onde há supra numa parede, procure o <b>infra recíproco</b> na parede oposta: a presença dele é o achado que mais confirma que aquele supra é isquêmico, e não pericardite ou repolarização precoce.'},
    {t:'ul', l:'Derivações extras: quando pedir', v:[
      '<b>V3R e V4R</b> — em TODO IAM inferior, para procurar extensão ao ventrículo direito.',
      '<b>V7, V8 e V9</b> — sempre que houver infra em V1–V3 com onda R alta, para confirmar IAM posterior.',
      '<b>V1–V2 no 2º/3º espaço</b> — na suspeita de síndrome de Brugada.'
    ]}
  ]
},
{
  id:'ondas', titulo:'Ondas, segmentos e intervalos', sub:'O vocabulário que você usa no laudo',
  blocos:[
    {t:'p', v:'Cada acidente do traçado corresponde a um evento elétrico. Decorar os nomes sem entender o evento é o caminho mais curto para esquecer tudo na semana seguinte.'},
    {t:'ecg', pat:'sinusal', view:ZOOM1,
     dica:'Meça o QRS na derivação em que ele parece mais largo, e o QT onde a onda T termina de forma mais nítida — normalmente DII ou V5.'},
    {t:'tab', head:['Item','O que representa','Normal','Alterado sugere'], rows:[
      ['Onda P','Despolarização atrial','< 120 ms e < 2,5 mm','Apiculada: sobrecarga atrial direita. Bífida e larga: sobrecarga esquerda'],
      ['Intervalo PR','Início da P ao início do QRS','120–200 ms','Longo: BAV de 1º grau. Curto com delta: pré-excitação'],
      ['Complexo QRS','Despolarização ventricular','< 120 ms','≥ 120 ms: bloqueio de ramo, origem ventricular, hipercalemia'],
      ['Onda Q','Primeira deflexão negativa','< 40 ms e < 25% da R','Patológica: necrose antiga'],
      ['Ponto J','Junção entre QRS e ST','Na linha de base','Elevado ou deprimido: lesão, repolarização precoce, onda J'],
      ['Segmento ST','Platô do potencial de ação','Isoelétrico','Supra: lesão transmural. Infra: subendocárdica'],
      ['Onda T','Repolarização ventricular','Concordante com o QRS, assimétrica','Simétrica e profunda: isquemia. Alta e estreita: hipercalemia'],
      ['Onda U','Repolarização tardia','Pequena ou ausente','Proeminente: hipocalemia, bradicardia'],
      ['Intervalo QT','Despolarização + repolarização','QTc < 450 ms (H) / 460 ms (M)','Longo: risco de torsades. Curto: digital, hipercalcemia']
    ]},
    {t:'box', k:'peg', l:'Onde exatamente medir o ST', v:'Meça a <b>60–80 ms depois do ponto J</b>, usando como linha de base o segmento <b>TP</b> (entre o fim da T e o início da P seguinte); quando a taquicardia comer o TP, use o PR. Medir "no olho", sem definir a linha de base, é a causa número um de supra que não existe.'}
  ]
},
{
  id:'fc', titulo:'Calcular a frequência cardíaca', sub:'Três métodos — o certo depende do ritmo',
  blocos:[
    {t:'p', v:'Não existe método único. A primeira pergunta é sempre: <b>o RR é regular ou irregular?</b> Usar o método errado é como medir febre com régua.'},
    {t:'regua'},
    {t:'box', k:'cond', l:'1) Ritmo regular — método dos 300', v:'Ache uma R que caia em cima de uma linha grossa e conte os <b>quadrados grandes</b> até a próxima R, seguindo a sequência <b>300 · 150 · 100 · 75 · 60 · 50</b>. Se a próxima R cai no quarto quadrado grande, a FC é 75. É o método de plantão: resolve em dois segundos.'},
    {t:'box', k:'cond', l:'2) Ritmo irregular — método dos 6 segundos', v:'Na fibrilação atrial não adianta medir um RR, porque o próximo será diferente. Conte quantos QRS existem em <b>10 segundos</b> (a tira inteira) e multiplique por 6 — ou conte em 6 segundos e multiplique por 10. É uma média, e é exatamente isso que você quer nesse caso.'},
    {t:'box', k:'cond', l:'3) Quando precisa de precisão — 1500 ÷ quadradinhos', v:'Conte os <b>quadradinhos</b> entre duas R e divida 1500 por esse número. Use quando o valor exato importa: cálculo de QTc, avaliação de resposta a droga, laudo formal.'},
    {t:'ecg', pat:'sinusal', view:{layout:'stack', leads:['DII'], seconds:10, rowMm:32},
     dica:'Treine agora: ative o Compasso, meça um intervalo RR e confira se o bpm que ele mostra bate com o que você calculou pelo método dos 300.'},
    {t:'box', k:'peg', l:'A pegadinha da bradicardia', v:'Antes de chamar de bradicardia sinusal, confirme que <b>toda</b> P conduz. Um BAV de 2º grau 2:1 também dá 50 bpm — e a conduta é oposta: um observa, o outro pode precisar de marca-passo.'}
  ]
},
{
  id:'eixo', titulo:'Determinar o eixo elétrico', sub:'Dois olhares e você resolve',
  blocos:[
    {t:'p', v:'O eixo é a direção média da despolarização ventricular no plano frontal. Você não precisa calcular graus na prova nem no plantão: precisa dizer em que quadrante ele está — e para isso bastam <b>DI</b> e <b>aVF</b>.'},
    {t:'eixoI'},
    {t:'tab', head:['DI','aVF','Eixo','Pense em'], rows:[
      ['Positivo','Positivo','<b>Normal</b> (−30° a +90°)','Nada. Siga o roteiro'],
      ['Positivo','Negativo','<b>Desvio à esquerda</b>','Bloqueio divisional anterossuperior, sobrecarga de VE, IAM inferior antigo'],
      ['Negativo','Positivo','<b>Desvio à direita</b>','Sobrecarga de VD, TEP, DPOC, bloqueio divisional posteroinferior, longilíneo normal'],
      ['Negativo','Negativo','<b>Desvio extremo</b>','Ritmo ventricular, marca-passo, hipercalemia grave, congênitas']
    ]},
    {t:'box', k:'cond', l:'O truque da derivação isoelétrica', v:'Precisa do valor aproximado em graus? Ache a derivação em que o QRS é mais <b>isoelétrico</b> (positivo e negativo se anulam): o eixo está perpendicular a ela. Depois olhe qual derivação tem o QRS mais positivo para saber para que lado dessa perpendicular ele aponta.'},
    {t:'box', k:'peg', l:'Confirme o desvio à esquerda em DII', v:'DI positivo com aVF negativo pode ser apenas −20°, que ainda é normal. O desvio à esquerda só é verdadeiro se <b>DII também estiver negativo</b> — aí você passou de −30°.'}
  ]
},
{
  id:'ritmo', titulo:'Provar que o ritmo é sinusal', sub:'O passo que quase todo mundo pula',
  blocos:[
    {t:'p', v:'"Ritmo sinusal" não é um chute de aparência: é uma conclusão com quatro critérios. Enquanto você não provar isso, não faz sentido discutir supra, eixo ou QT — porque o diagnóstico pode estar inteiro no ritmo.'},
    {t:'steps', v:[
      {t:'Existe onda P antes de cada QRS?', d:'Uma P para cada QRS, sempre na mesma posição. Se há P sem QRS, pense em bloqueio; se há QRS sem P, pense em escape ou origem ventricular.'},
      {t:'A P é positiva em DI, DII e aVF, e negativa em aVR?', d:'Esse é o vetor do nó sinusal: de cima para baixo e da direita para a esquerda. P negativa em DII é ritmo atrial baixo, juncional — ou cabo trocado.'},
      {t:'O intervalo PR é constante?', d:'Constante significa condução AV estável. PR que aumenta progressivamente é Wenckebach; PR variável com dissociação é BAV total.'},
      {t:'A frequência está entre 50 e 100 bpm?', d:'Abaixo, bradicardia sinusal; acima, taquicardia sinusal. Os dois continuam sendo ritmo sinusal — o adjetivo muda, a origem não.'}
    ]},
    {t:'ecg', pat:'sinusal', view:{layout:'stack', leads:['DII','V1'], seconds:10, rowMm:30},
     dica:'DII e V1 são as melhores derivações para caçar onda P: DII porque a P sinusal é maior nela, V1 porque a P bifásica aparece bem e as ondas de flutter costumam se revelar ali.'},
    {t:'box', k:'peg', l:'Antes de dizer "irregularmente irregular"', v:'Fibrilação atrial exige as duas coisas: <b>ausência de P</b> e <b>RR irregularmente irregular</b>. Extrassístoles frequentes deixam o RR irregular, mas a P está lá. Já o flutter 2:1 é regular e a ~150 bpm — e as ondas F se escondem dentro do ST.'},
    {t:'box', k:'cond', l:'Manobra prática', v:'Não achou a P? Pegue o compasso e marque os RR: se forem perfeitamente regulares a ~150 bpm, procure ondas F em DII, DIII, aVF e V1. Se forem irregulares, você já tem sua resposta.'}
  ]
},
{
  id:'cabos', titulo:'Erros de troca de cabos', sub:'O diagnóstico que você evita fazer',
  blocos:[
    {t:'p', v:'Uma parte relevante dos ECGs "alterados" que chegam ao plantão não tem nada de errado com o paciente: tem eletrodo no lugar errado. Reconhecer esses padrões evita internação, exame e susto desnecessários — e, no sentido inverso, evita mandar para casa um infarto que ficou escondido pela troca.'},
    {t:'cabos'},
    {t:'box', k:'cond', l:'A regra de ouro para separar troca de cabo de dextrocardia', v:'Nos dois casos as derivações de membro ficam invertidas. A diferença está nas <b>precordiais</b>: na troca braço-braço elas continuam normais, com R crescendo de V1 a V6. Na dextrocardia a R <b>decresce</b> de V1 a V6. Um olhar nas precordiais resolve.'},
    {t:'ul', l:'Quando desconfiar, mesmo sem saber qual cabo', v:[
      '<b>P negativa em DII</b> num paciente com ritmo aparentemente sinusal.',
      '<b>aVR positivo</b> — em ECG correto, aVR é quase sempre todo negativo.',
      '<b>DI todo negativo</b> com precordiais normais.',
      '<b>Amplitudes muito baixas numa derivação de membro isolada</b>, com as outras normais.',
      '<b>Traçado que "não combina" com o paciente</b>: infarto extenso em alguém assintomático e sem alteração prévia merece repetição antes de conduta.'
    ]}
    ,{t:'box', k:'peg', l:'A conduta é sempre a mesma', v:'Na dúvida, <b>repita o exame</b> conferindo os eletrodos você mesmo. Repetir um ECG custa três minutos; tratar um infarto que não existe, ou perder um que existe, custa muito mais.'}
  ]
},
{
  id:'roteiro', titulo:'O roteiro dos 8 passos', sub:'Sempre na mesma ordem, sem exceção',
  blocos:[
    {t:'p', v:'O que separa quem lê ECG de quem adivinha ECG é a ordem. Olhar primeiro para o que "salta aos olhos" faz você encontrar o achado chamativo e perder o achado que muda a conduta. Percorra os oito passos <b>toda vez</b>, inclusive quando o traçado parecer normal.'},
    {t:'passos'},
    {t:'box', k:'cond', l:'Como treinar isso até virar automático', v:'Vá para o <b>Modo laudo</b>: o traçado aparece, você descreve os oito passos em voz alta ou por escrito, e só depois revela o laudo modelo para comparar item a item. Três a cinco por dia, por duas semanas, e a sequência passa a rodar sozinha na sua cabeça.'}
  ]
}
];
const FMAP = {}; FUNDAMENTOS.forEach(f => FMAP[f.id] = f);

/* roteiro detalhado */
const PASSOS = [
  {t:'Ritmo — é sinusal?', d:'Onda P antes de cada QRS, PR constante, P positiva em DI, DII e aVF e negativa em aVR.',
   ch:'P:QRS de 1:1', er:'Chamar de sinusal sem procurar a P em DII e V1.', ir:'ritmo'},
  {t:'Frequência cardíaca', d:'Regular: 300 ÷ quadrados grandes. Irregular: conte os QRS em 10 s e multiplique por 6.',
   ch:'Normal 50–100 bpm', er:'Usar o método dos 300 num RR irregular.', ir:'fc'},
  {t:'Eixo elétrico', d:'Olhe apenas DI e aVF para achar o quadrante; confirme desvio à esquerda em DII.',
   ch:'Normal −30° a +90°', er:'Chamar de desvio à esquerda com DII ainda positivo.', ir:'eixo'},
  {t:'Onda P', d:'Duração e amplitude. Apiculada indica sobrecarga direita; bífida e larga, sobrecarga esquerda.',
   ch:'< 120 ms e < 2,5 mm', er:'Não olhar a P em V1, onde a sobrecarga esquerda aparece melhor.', ir:'ondas'},
  {t:'Intervalo PR', d:'Do início da P ao início do QRS. Constante? Aumenta progressivamente? Alterna?',
   ch:'120–200 ms', er:'Ver PR longo e parar — sem checar se alguma P deixou de conduzir.', ir:'ondas'},
  {t:'QRS — duração, amplitude e onda Q', d:'Largura primeiro; depois voltagem e presença de Q patológica.',
   ch:'< 120 ms · Q < 40 ms e < 25% da R', er:'Ver QRS largo e assumir bloqueio de ramo sem considerar hipercalemia.', ir:'ondas'},
  {t:'Segmento ST e onda T', d:'Meça 60–80 ms após o ponto J, com o TP como linha de base. Procure o espelho.',
   ch:'Supra ≥ 1 mm em 2 contíguas', er:'Laudar supra sem procurar infra recíproco na parede oposta.', ir:'derivacoes'},
  {t:'Intervalo QT', d:'Compare o QT com metade do RR; calcule o QTc quando a FC estiver fora da faixa normal.',
   ch:'QTc < 450 ms (H) / 460 ms (M)', er:'Medir o QT incluindo a onda U e superestimar o valor.', ir:'ondas'}
];
const ROTEIRO = PASSOS.map(p => ({t: p.t, d: p.d}));
