# Treinador de ECG · v3.14

Ferramenta de estudo de eletrocardiograma em arquivo único: roda no navegador, sem servidor, sem internet, sem conta.

**Conteúdo:** 8 aulas de fundamentos com figuras animadas, 52 padrões de ECG com ficha completa, 14 casos clínicos (chegada e MOV, ECG, conduta e evolução; nos infartos com supra, cenário com ou sem hemodinâmica, relógio de metas e prescrição em checklist), treino por tema com revisão espaçada, modo laudo, simulado cronometrado e acompanhamento de progresso. Os traçados são gerados por simulação: cada vez que você abre um padrão, o traçado é diferente.

**Manual do usuário:** abra `manual.html` ou o link **Manual** no aplicativo. Inclui imagens, instruções de cada modo e transferência por arquivo.

As notas de cada versão ficam no repositório do projeto, em `docs/versoes/`.

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

Para levar a outro aparelho: **Progresso → Baixar backup → enviar o JSON → Importar arquivo no destino → conferir a prévia → Confirmar importação**. Compartilhamento direto disponível quando o navegador suporta. A importação substitui, sem mesclar; existe recuperação da cópia anterior à última importação. Backups e códigos antigos compatíveis continuam aceitos. A tentativa clínica é transferida; o simulado e o rascunho de laudo em andamento não.

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
- **Treinar → Casos clínicos:** 14 missões de 5 a 7 etapas, 100 pontos cada.
- **Modo laudo:** descreva o traçado nos 8 passos e compare com o laudo modelo.
- **Simulado:** 10 questões cronometradas, com revisão dos erros no fim.

---

## Arquivos

```
treinador-ecg/
├── index.html                  página e estilos; carrega os scripts abaixo
├── js/                         código: motor de traçados, papel, fundamentos, app, início
├── dados/
│   ├── padroes.js              os 52 padrões de ECG e suas categorias
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
2. Mude a linha `const VERSION` do `sw.js` (hoje `PREFIX + 'v3.13.0'`) para o número da nova versão. Assim o celular baixa tudo de novo e apaga o cache antigo. Isso é obrigatório quando você troca uma imagem mantendo o mesmo nome, e recomendado sempre.
3. Atualize o número no cabeçalho do `index.html` (`<span class="ver">`), para conferir no aparelho qual versão está rodando.

Na abertura seguinte o app mostra no rodapé **"Nova versão disponível — Atualizar"**. Nada recarrega sozinho, para não interromper um simulado.

### iPhone: quando a atualização emperra

Feche o app de verdade (deslize o card para fora no seletor) e abra de novo; a atualização entra na segunda abertura. Se ainda assim ficar preso: apague o ícone, vá em **Ajustes → Safari → Avançado → Dados dos Sites**, apague o registro do site e adicione à tela de início de novo.

---

## Aviso

Ferramenta de estudo. Os traçados são gerados por simulação matemática e os casos são fictícios: não substituem ECGs reais nem material de referência, e nada aqui orienta conduta em paciente.
