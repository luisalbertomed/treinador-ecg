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

---

## Arquivos

```
treinador-ecg/
├── index.html                  página e estilos; carrega os scripts abaixo
├── js/                         código: motor de traçados, papel, fundamentos, app, início
├── dados/
│   ├── padroes.js              padrões de ECG e suas categorias
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
