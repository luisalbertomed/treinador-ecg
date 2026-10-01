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
  let avisoNaTela = false, publicadaAgora = null;

  /* Botão ao lado do número da versão: verifica na hora e, se houver versão nova, atualiza. */
  const btnAtt = el('button', 'btn-att', '<span class="ico" aria-hidden="true">↻</span><span class="txt">Verificar atualização</span>');
  btnAtt.type = 'button';
  btnAtt.title = 'Verificar se há versão nova';
  (document.querySelector('.ver') || {}).after?.(btnAtt);
  function estadoBotao(estado, texto){
    btnAtt.className = 'btn-att' + (estado ? ' ' + estado : '');
    btnAtt.querySelector('.txt').textContent = texto;
    btnAtt.setAttribute('aria-label', texto);
  }
  let voltar = null;
  function estadoTemporario(estado, texto){
    estadoBotao(estado, texto);
    clearTimeout(voltar);
    voltar = setTimeout(() => { if (!publicadaAgora) estadoBotao('', 'Verificar atualização'); }, 3500);
  }

  /* Baixa a versão nova no service worker antes de recarregar, para não abrir a página nova com scripts antigos do cache. */
  async function atualizarAgora(){
    estadoBotao('ocupado', 'Atualizando…');
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg){
        await reg.update();
        if (reg.installing || reg.waiting){
          await new Promise(resolve => {
            const t = setTimeout(resolve, 8000);
            navigator.serviceWorker.addEventListener('controllerchange', () => { clearTimeout(t); resolve(); }, {once: true});
          });
        }
      }
    } catch (e) { /* recarrega mesmo assim */ }
    location.reload();
  }

  function mostrarAviso(){
    estadoBotao('nova', 'Atualizar para ' + publicadaAgora);
    btnAtt.querySelector('.txt').innerHTML = 'Atualizar<span class="v"> para ' + esc(publicadaAgora) + '</span>';
    if (avisoNaTela) return;
    avisoNaTela = true;
    const bar = el('div', 'aviso-att', '<span>Nova versão disponível</span>');
    const att = el('button', 'att', 'Atualizar');
    const fechar = el('button', 'fechar', '✕');
    att.onclick = atualizarAgora;
    fechar.onclick = () => bar.classList.remove('on');
    bar.append(att, fechar);
    document.body.appendChild(bar);
    requestAnimationFrame(() => bar.classList.add('on'));
  }
  function versaoNoTexto(t){
    const m = t.match(/class="ver">([^<]{1,20})</);
    return m ? m[1] : null;
  }
  /* manual = true quando o usuário clica no botão: aí a resposta aparece no próprio botão. */
  async function conferirVersao(manual){
    if (publicadaAgora) return;
    if (!navigator.onLine){ if (manual) estadoTemporario('erro', 'Sem conexão'); return; }
    const aqui = (document.querySelector('.ver') || {}).textContent;
    if (!aqui) return;
    if (manual) estadoBotao('ocupado', 'Verificando…');
    try {
      const r = await fetch('index.html?_verificar=' + Date.now(), {cache: 'no-store'});
      if (!r || r.status !== 200) throw new Error('status ' + (r && r.status));
      const publicada = versaoNoTexto(await r.text());
      if (publicada && publicada !== aqui){ publicadaAgora = publicada; mostrarAviso(); }
      else if (manual) estadoTemporario('ok', 'Você está na versão mais recente');
    } catch (e) {
      if (manual) estadoTemporario('erro', 'Não foi possível verificar');
    }
  }
  btnAtt.onclick = () => publicadaAgora ? atualizarAgora() : conferirVersao(true);
  window.addEventListener('load', () => setTimeout(() => conferirVersao(false), 2000));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) conferirVersao(false); });
}
