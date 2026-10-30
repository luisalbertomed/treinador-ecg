# Treinador de ECG

Ferramenta de estudo de eletrocardiograma: aplicativo estático que roda no navegador, sem conta. Pode ser aberto por duplo clique ou hospedado como PWA.

**Conteúdo:** 8 aulas de fundamentos, 56 padrões (53 elegíveis para exercícios de diagnóstico), 42 ECGs reais do PTB-XL e 34 atendimentos nos módulos Emergências de ritmo (ACLS) e Dor torácica (SCA). Inclui variantes, liderança, PCR, transições, exames e HEART, além de treino por tema, revisão espaçada, Modo laudo e Simulado. Traçados sintéticos variam a cada tentativa; ECGs reais mantêm as amostras da fonte.

Durante um atendimento, **Dados do atendimento** permite consultar achados e ECGs anteriores. HEART e checklists ainda não confirmados ficam salvos como rascunhos, inclusive no backup, sem pontuar antes da confirmação.

**Manual do usuário:** abra `manual.html` ou o link **Manual** no aplicativo. Inclui imagens, instruções de cada modo e transferência por arquivo.

As notas da entrega ficam no LEIA-ME que acompanha o pacote; todas as versões ficam em `docs/versoes/` no projeto-fonte.

---

## Testar agora, sem instalar nada

Dê dois cliques em `index.html`. Funciona em qualquer navegador moderno.

A única coisa que **não** funciona assim é o uso offline no celular. Para isso é preciso publicar, como descrito abaixo.

---

## Publicar na web

O pacote inteiro é estático: qualquer hospedagem de site simples serve.

### Netlify Drop (o caminho mais rápido)

1. Abra <https://app.netlify.com/drop>
2. Arraste a **pasta** `treinador-ecg` inteira para a área indicada
3. Você recebe um endereço como `https://algum-nome.netlify.app`

### GitHub Pages (se quiser versionar)

1. Crie um repositório novo no GitHub
2. Envie o conteúdo desta pasta para a raiz do repositório
3. Em **Settings → Pages**, escolha a branch `main` e a pasta `/ (root)`

> **Importante:** a hospedagem precisa ser **HTTPS** para o modo offline funcionar. Netlify e GitHub Pages já entregam HTTPS.

---

## Instalar no celular e usar offline

**iPhone (Safari):** Compartilhar → **Adicionar à Tela de Início**. Precisa ser o Safari.

**Android (Chrome):** menu de três pontos → **Instalar aplicativo**.

Na primeira visita o navegador guarda o app inteiro; a partir daí ele abre sem sinal. Quando houver internet, a versão nova é buscada em segundo plano.

---

## Progresso

Salvo automaticamente neste navegador e perfil, sem banco de dados nem login. Limpar os dados do site apaga o progresso local.

Para levar a outro aparelho: **Progresso → Baixar backup → enviar o JSON → Importar arquivo no destino → conferir a prévia → Confirmar importação**. Compartilhamento direto disponível quando o navegador suporta. A importação substitui, sem mesclar; existe recuperação da cópia anterior à última importação. Backups e códigos antigos compatíveis continuam aceitos. A tentativa clínica, incluindo rascunhos do HEART e dos checklists, é transferida; o simulado e o rascunho de laudo em andamento não. Atualizar um caso com revisão incompatível descarta só a tentativa ativa, mantendo melhores resultados e revisões.

---

## O que tem dentro

### Fundamentos

| Aula | Do que trata |
|---|---|
| O papel do ECG | 25 mm/s e 10 mm/mV, calibração e erros de registro |
| O que cada derivação enxerga | Mapa interativo de paredes, derivações e coronárias |
| Ondas, segmentos e intervalos | Vocabulário do laudo e onde medir o ST |
| Calcular a frequência cardíaca | Os três métodos e quando cada um vale |
| Determinar o eixo elétrico | Hexaxial interativo |
| Provar que o ritmo é sinusal | Os quatro critérios |
| Erros de troca de cabos | Os quatro erros clássicos e dextrocardia |
| O roteiro dos 8 passos | Cada passo com valor de referência e erro comum |

### Modos de treino

- **Treinar → ECG rápido:** questões de diagnóstico, critério e conduta, por tema (geral, infarto e isquemia, taquiarritmias, bradiarritmias, metabólico e outros), com repetição espaçada. Teclas A–D respondem, Enter avança.
- **Treinar → Emergências de ritmo (ACLS):** 23 atendimentos, com filtros de taquicardia, bradicardia e PCR.
- **Treinar → Dor torácica (SCA):** 11 atendimentos, incluindo exames, troponina seriada e HEART. Cada atendimento vale 100 pontos.
- **Treinar → ECG real:** diagnóstico ou normal/alterado, com traçados de pacientes e créditos da fonte.
- **Modo laudo:** descreva um traçado sintético nos 8 passos e compare com o modelo, ou use o laudo guiado com ECG real.
- **Simulado:** 10 questões cronometradas, com revisão dos erros no fim.
- **Simulador ACLS** (`simulador.html`, aba **Simulador**): monitor/desfibrilador em tempo real para treino em equipe, pensado para tela grande ou TV. Detalhes abaixo.

### Simulador ACLS

Monitor com ECG (DII), PA invasiva, pletismografia e capnografia em varredura, com números e alarmes. O aluno opera:

- **Desfibrilador:** energia, carga, choque, SINC (marca as ondas R; não dispara sem R detectada; desliga após cada choque) e desarme.
- **Marcapasso transcutâneo:** frequência, corrente, pausa. Captura só acima do limiar do cenário, sempre em modo de demanda.
- **RCP:** artefato no ECG, curva arterial e EtCO₂ dependentes da qualidade, cronômetro do ciclo e aviso aos 2 minutos.
- **Medicações e ações:** doses da Parte 9 da AHA 2025, checagem de pulso, PNI, ECG de 12 derivações (padrões do app) e manobra vagal.

O **painel do instrutor** (tecla I) escolhe o cenário ou o modo livre, força estados, ajusta ritmo e sinais e mostra o registro. São 10 cenários: FV refratária, TV sem pulso, AESP por hipovolemia, assistolia, torsades, BAVT, bradicardia sinusal no IAM inferior, TSV estável, FA instável e TV com pulso instável. Os cenários ficam em `dados/cenarios-acls.js`, em formato de estados e regras, e são fáceis de editar.

**Encerrar e avaliar** confere as condutas com o algoritmo AHA 2025. Avalia início e fração de compressões, pausas, tempo até o choque, momento e intervalo da epinefrina, antiarrítmico, atropina, adenosina, energia na FA, choque não sincronizado com pulso, marcapasso na PCR, captura mecânica e ECG após o RCE. O relatório pode ser baixado em `.txt`.

**Controle remoto:** no monitor, **Controle remoto** mostra um código, um QR e o link de `controle.html`. O celular ou tablet que abrir o link tem quatro abas:

- **Instrutor:** cenário, estados, ritmo, pulso e sinais vitais. FC, PAS, PAD, SpO₂, EtCO₂ e FR mudam por controle deslizante ou +/−, na hora ou em transição de 30 s a 5 min.
- **Equipe:** RCP, desfibrilador, marcapasso, medicações, ações, pulso, PNI e ECG de 12 derivações na TV.
- **Líder:** assistente do líder da reanimação. Tem anel do ciclo de 2 min, tempo total, choques, contagem para a próxima adrenalina e alerta de "checar ritmo". Mostra as condutas "Agora" pelo algoritmo AHA 2025, as drogas da PCR com dose devida, os Hs e Ts, a linha do tempo, RCE/óbito, metrônomo de 110/min e alertas sonoros. As condutas seguem o ritmo que a equipe **registra** na checagem, não o real; a avaliação final compara os dois.
- **Registro.**

Vários controles podem se conectar ao mesmo tempo, por exemplo o instrutor no celular e a equipe num tablet. Em **Registro**, marque "Usar só como equipe" para esconder a aba Instrutor.

A conexão usa WebRTC (PeerJS, incluído em `js/lib/`). O servidor público gratuito do PeerJS faz só o primeiro contato, e os dados vão direto entre os aparelhos. Precisa de internet e do app publicado (https). Na mesma rede Wi-Fi é mais estável; entre 4G e Wi-Fi pode falhar em algumas redes. Sem internet, funciona entre janelas do mesmo computador (BroadcastChannel), por exemplo com a TV como segunda tela. Para usar um servidor PeerJS próprio, acrescente `?peer=host:porta` ao endereço do monitor.

**No Treinador:** o simulador aparece em **Treinar → Emergências de ritmo (ACLS)** e na aba **Simulador**. As simulações avaliadas aparecem em **Progresso**; ficam só no aparelho do monitor e não entram no backup.

Limites: traçados sintéticos; respostas fisiológicas simplificadas e definidas por regra. A revisão independente por especialista está pendente.

---

## Arquivos

```
treinador-ecg/
├── index.html                  página e estilos; carrega os scripts abaixo
├── simulador.html              Simulador ACLS (usa js/simulador.js)
├── controle.html               controle remoto do simulador (usa js/controle.js e js/sim-remoto.js)
├── js/                         código: motor de traçados, papel, fundamentos, app, início, simulador
│   └── lib/                    PeerJS e qrcode-generator (MIT; licenças em licencas/)
├── dados/
│   ├── padroes.js              padrões de ECG e suas categorias
│   ├── cenarios-acls.js        cenários do Simulador ACLS (estados e regras)
│   └── casos-clinicos.js       casos clínicos e fontes
├── manifest.webmanifest        identidade do app instalado
├── sw.js                       cache offline (lista todos os arquivos acima)
├── logo-primeira-linha-medicina-pratica.png
├── icon-192.png, icon-512.png, icon-maskable-512.png, favicon.png
├── _headers                    cabeçalhos de cache (Netlify)
└── README.md                   este arquivo
```

Continua funcionando com dois cliques no `index.html`, sem servidor.

---

## Publicando uma versão nova

1. Troque os arquivos e publique de novo. Se criar um arquivo novo, inclua-o na lista `FILES` do `sw.js`.
2. Mude `const VERSION` do `sw.js` junto com o cabeçalho. O cache é imutável por versão; toda mudança no aplicativo, mesmo uma imagem com o mesmo nome, exige uma versão nova.
3. Atualize o número no cabeçalho do `index.html` (`<span class="ver">`), para conferir no aparelho qual versão está rodando.

Quando a atualização está disponível, o botão **Atualizar** no cabeçalho informa a próxima versão. Use-o para receber o pacote completo. Nada recarrega sozinho durante uma atividade.

### iPhone: quando a atualização emperra

Feche o app de verdade (deslize o card para fora no seletor) e abra de novo; a atualização entra na segunda abertura. Se ainda assim ficar preso: apague o ícone, vá em **Ajustes → Safari → Avançado → Dados dos Sites**, apague o registro do site e adicione à tela de início de novo.

---

## Aviso

Ferramenta de estudo. Os casos são fictícios, e os traçados são sintéticos ou ECGs reais identificados com a fonte. Não substitui avaliação de pacientes nem protocolos locais. A revisão clínica independente por especialista permanece pendente.
