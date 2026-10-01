/* Treinador de ECG: cache isolado, instalação atômica e imutável por versão. */
const PREFIX = 'treinador-ecg-';
const VERSION = PREFIX + 'v3.19.0';
const FILES = ['./','./index.html','./manual.html','./manual-assets/aprender.jpg','./manual-assets/treino-real.jpg','./manual-assets/normal-alterado.jpg','./manual-assets/laudo-real.jpg','./manual-assets/atualizar.jpg','./manual-assets/aula-ecg-real.jpg','./manual-assets/atlas-real.jpg','./manual-assets/aula-ciclo.jpg','./manual-assets/aula-derivacoes.jpg','./manual-assets/caso-checklist.jpg','./manual-assets/caso-chegada.jpg','./manual-assets/caso-ecg.jpg','./manual-assets/caso-feedback.jpg','./manual-assets/caso-resposta.jpg','./manual-assets/casos-catalogo.jpg','./manual-assets/celular.jpg','./manual-assets/ficha.jpg','./manual-assets/importar-previa.jpg','./manual-assets/laudo-modelo.jpg','./manual-assets/laudo.jpg','./manual-assets/progresso.jpg','./manual-assets/revisar.jpg','./manual-assets/simulado-menu.jpg','./manual-assets/simulado-questao.jpg','./manual-assets/simulado-resultado.jpg','./manual-assets/simulado-trocar.jpg','./manual-assets/treino-feedback.jpg','./manual-assets/treino-questao.jpg','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./favicon.png','./logo-primeira-linha-medicina-pratica.png',
  './js/motor.js','./js/papel.js','./dados/padroes.js','./js/aprender-visual.js','./dados/fundamentos.js','./js/fundamentos.js','./dados/casos-clinicos.js','./dados/casos-v3.13.js','./js/app.js','./dados/ecgs-reais.js','./js/ecgs-reais.js','./js/laudo-real.js','./js/normal-alterado.js','./fontes-ecg.html','./licencas/PTB-XL-CC-BY-4.0.txt','./js/inicio.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
/* Cache imutável por versão: a página e os scripts saem sempre do mesmo pacote, instalado inteiro.
   Uma versão nova só entra com um sw.js novo (VERSION diferente). Antes, a página vinha da rede e os
   scripts do cache antigo, e o app rodava misturado no primeiro acesso após cada publicação.
   A rede só é usada para o que não está no pacote; a verificação de versão (?_verificar) passa direto. */
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if(request.method !== 'GET' || url.origin !== self.location.origin || url.searchParams.has('_verificar')) return;
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(request, request.mode === 'navigate' ? {ignoreSearch: true} : undefined);
    if(hit) return hit;
    try { return await fetch(request); }
    catch(error){
      if(request.mode === 'navigate') return await cache.match('./index.html') || new Response('Aplicativo indisponível offline.', {status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}});
      return new Response('', {status: 503});
    }
  })());
});
