/* Treinador ECG 3.13.0: cache isolado e instalação atômica. */
const PREFIX = 'treinador-ecg-';
const VERSION = PREFIX + 'v3.15.4';
const FILES = ['./','./index.html','./manual.html','./manual-assets/aprender.jpg','./manual-assets/aula-ciclo.jpg','./manual-assets/aula-derivacoes.jpg','./manual-assets/caso-checklist.jpg','./manual-assets/caso-chegada.jpg','./manual-assets/caso-ecg.jpg','./manual-assets/caso-feedback.jpg','./manual-assets/caso-resposta.jpg','./manual-assets/casos-catalogo.jpg','./manual-assets/celular.jpg','./manual-assets/ficha.jpg','./manual-assets/importar-previa.jpg','./manual-assets/laudo-modelo.jpg','./manual-assets/laudo.jpg','./manual-assets/progresso.jpg','./manual-assets/revisar.jpg','./manual-assets/simulado-menu.jpg','./manual-assets/simulado-questao.jpg','./manual-assets/simulado-resultado.jpg','./manual-assets/simulado-trocar.jpg','./manual-assets/treino-feedback.jpg','./manual-assets/treino-questao.jpg','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./favicon.png','./logo-primeira-linha-medicina-pratica.png',
  './js/motor.js','./js/papel.js','./dados/padroes.js','./js/aprender-visual.js','./dados/fundamentos.js','./js/fundamentos.js','./dados/casos-clinicos.js','./dados/casos-v3.13.js','./js/app.js','./dados/ecgs-reais.js','./js/ecgs-reais.js','./fontes-ecg.html','./licencas/PTB-XL-CC-BY-4.0.txt','./js/inicio.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if(request.method !== 'GET' || url.origin !== self.location.origin || url.searchParams.has('_verificar')) return;
  const network = fetch(request).then(async response => {
    if(response.ok && response.type === 'basic') {
      try {const cache=await caches.open(VERSION);await cache.put(request,response.clone());}catch(error){}
    }
    return response;
  }).catch(() => null);
  event.waitUntil(network);
  event.respondWith((async () => {
    const cache=await caches.open(VERSION);
    // Navegação usa a versão da rede quando disponível; atualização não relê HTML antigo.
    if(request.mode === 'navigate') return await Promise.race([network,new Promise(resolve=>setTimeout(()=>resolve(null),2500))]) || await cache.match(request) || await cache.match('./index.html') || new Response('Aplicativo indisponível offline.',{status:503});
    return await cache.match(request) || await network || new Response('',{status:503});
  })());
});
