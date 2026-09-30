carregarProgresso();
render();
setInterval(()=>{if(S.mode==='revisar' && !S.review)render();},30000);

/* Service worker: só faz sentido servido por http/https. Aberto direto do
   disco (file://) a chamada falha, e o app segue funcionando normalmente. */
if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', {updateViaCache: 'none'}).catch(() => {});
  });

  /* Compara a versão que está na tela com a que está publicada agora.
     A sondagem leva ?_verificar, que o service worker deixa passar direto para
     a rede — assim nem o cache dele nem o do navegador escondem a novidade.
     Nada recarrega sozinho: quem escolhe a hora é você. */
  let avisoNaTela = false;
  function mostrarAviso(){
    if (avisoNaTela) return;
    avisoNaTela = true;
    const bar = el('div', 'aviso-att', '<span>Nova versão disponível</span>');
    const att = el('button', 'att', 'Atualizar');
    const fechar = el('button', 'fechar', '✕');
    att.onclick = () => location.reload();
    fechar.onclick = () => bar.classList.remove('on');
    bar.append(att, fechar);
    document.body.appendChild(bar);
    requestAnimationFrame(() => bar.classList.add('on'));
  }
  function versaoNoTexto(t){
    const m = t.match(/class="ver">([^<]{1,20})</);
    return m ? m[1] : null;
  }
  async function conferirVersao(){
    if (avisoNaTela || !navigator.onLine) return;
    const aqui = (document.querySelector('.ver') || {}).textContent;
    if (!aqui) return;
    try {
      const r = await fetch('index.html?_verificar=' + Date.now(), {cache: 'no-store'});
      if (!r || r.status !== 200) return;
      const publicada = versaoNoTexto(await r.text());
      if (publicada && publicada !== aqui) mostrarAviso();
    } catch (e) { /* sem rede: tenta na próxima abertura */ }
  }
  window.addEventListener('load', () => setTimeout(conferirVersao, 2000));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) conferirVersao(); });
}
