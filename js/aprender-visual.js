/* Ilustrações didáticas: esquemas elétricos, não simulação anatômica ou mecânica. */
const FASES_VISUAIS = [
 {nome:'Onda P',cor:'#63dace',alvo:'atrios',traco:'M40 120 Q62 120 72 107 Q87 76 102 107 Q112 120 130 120',x:85,
  titulo:'Os átrios se despolarizam',texto:'O impulso iniciado no nó sinusal se espalha pelos átrios. Essa ativação elétrica aparece como onda P.',lembre:'P → ativação dos átrios',pergunta:'A onda P representa a ativação de quais câmaras?'},
 {nome:'Segmento PR',cor:'#f5c46b',alvo:'av',traco:'M130 120 L178 120',x:152,
  titulo:'O impulso segue até os ventrículos',texto:'A condução passa pelo nó AV e pelo sistema His–Purkinje. A condução lenta no nó AV contribui para o atraso. O segmento PR vai do fim da P ao início do QRS; o intervalo PR inclui também a onda P.',lembre:'Segmento PR ≠ intervalo PR',pergunta:'O intervalo PR inclui a onda P ou começa depois dela?'},
 {nome:'QRS',cor:'#89baff',alvo:'ventriculos',traco:'M178 120 L191 134 L207 37 L225 154 L241 120',x:209,
  titulo:'Os ventrículos se despolarizam',texto:'A ativação elétrica ventricular produz o QRS. A repolarização atrial costuma ficar encoberta por esse complexo.',lembre:'QRS → ativação dos ventrículos',pergunta:'O QRS representa ativação ou recuperação elétrica dos ventrículos?'},
 {nome:'Segmento ST',cor:'#f5a3b7',alvo:'ventriculos',traco:'M241 120 L313 120',x:275,
  titulo:'Os ventrículos estão despolarizados',texto:'Grande parte do miocárdio ventricular está em uma fase semelhante de despolarização. Por isso, o segmento ST normalmente fica próximo da linha de base: linha plana não significa ausência de atividade elétrica.',lembre:'ST → ventrículos despolarizados',pergunta:'Uma linha próxima da base significa que não há atividade elétrica?'},
 {nome:'Onda T',cor:'#c8a5fa',alvo:'ventriculos',traco:'M313 120 C340 120 355 62 383 85 C401 99 400 120 435 120',x:375,
  titulo:'Os ventrículos se repolarizam',texto:'A recuperação elétrica ventricular aparece como onda T. O ECG mostra eventos elétricos; a ilustração não representa diretamente contração ou fluxo de sangue.',lembre:'T → recuperação dos ventrículos',pergunta:'Qual onda representa a recuperação elétrica ventricular?'}
];
function limparVisuais(){
 (window.__visualCleanups || []).forEach(fn=>fn());
 window.__visualCleanups=[];
}
function cicloEletricoVisual(){
 const card=el('section','card visual-aula');
 card.setAttribute('aria-label','Ciclo elétrico e ECG');
 card.innerHTML='<div class="kicker">Veja → acompanhe → relembre</div><h3>Do coração ao traçado</h3><p class="muted">A mesma cor liga a região do coração ao trecho do ECG. Escolha uma etapa ou reproduza a sequência.</p>';
 const stage=el('div','visual-stage');
 stage.innerHTML='<div class="visual-heart"><svg viewBox="0 0 300 270" role="img" aria-label="Esquema elétrico do coração, átrios acima e ventrículos abaixo">'+
 '<path d="M150 64 C115 15 35 38 38 115 C40 184 104 236 150 258 C204 227 260 169 262 107 C265 38 188 15 150 64Z" fill="#222e3b" stroke="#7a8ca1" stroke-width="2"/>'+
 '<g data-area="atrios"><ellipse cx="102" cy="87" rx="43" ry="30"/><ellipse cx="201" cy="87" rx="37" ry="30"/></g>'+
 '<g data-area="ventriculos"><path d="M67 137 Q115 116 141 150 L141 226 Q81 204 67 137Z"/><path d="M161 146 Q198 119 239 129 Q227 198 162 233Z"/></g>'+
 '<path d="M78 69 Q112 85 144 119 L154 151 L116 185 M154 151 L200 186" fill="none" stroke="#93a1b3" stroke-width="3" stroke-dasharray="5 5"/>'+
 '<circle cx="78" cy="69" r="7" fill="#63dace"/><circle data-area="av" cx="144" cy="119" r="10"/>'+
 '<text x="43" y="48">Nó sinusal</text><text x="167" y="125">Nó AV</text><text x="81" y="94">Átrios</text><text x="93" y="211">Ventrículos</text></svg><span class="muted small">Esquema elétrico simplificado</span></div>'+
 '<div class="visual-trace"><svg viewBox="0 0 480 200" role="img" aria-label="Onda P, segmento PR, QRS, segmento ST e onda T">'+
 '<path d="M20 120 H460" stroke="#657489" stroke-dasharray="4 5" fill="none"/>'+
 FASES_VISUAIS.map((f,i)=>'<path pathLength="1" data-wave="'+i+'" d="'+f.traco+'" fill="none" stroke="#667587" stroke-width="3.5" stroke-linecap="round"/>').join('')+
 '<line data-cursor x1="85" x2="85" y1="25" y2="163" stroke="#fff" stroke-dasharray="3 5"/>'+
 FASES_VISUAIS.map((f,i)=>'<text data-wave-label="'+i+'" x="'+f.x+'" y="184" text-anchor="middle">'+(['P','PR','QRS','ST','T'][i])+'</text>').join('')+
 '</svg><p class="muted small">Traçado esquemático, sem escala para medir intervalos.</p></div>';
 card.appendChild(stage);
 const steps=el('div','visual-steps');steps.setAttribute('aria-label','Etapas do ciclo');
 const buttons=FASES_VISUAIS.map((f,i)=>{const b=el('button','btn',String(i+1)+'. '+f.nome);b.onclick=()=>go(i);steps.appendChild(b);return b;});
 card.appendChild(steps);
 const info=el('div','visual-explain');info.setAttribute('aria-live','polite');card.appendChild(info);
 const controls=el('div','visual-controls');
 const prev=el('button','btn','← Anterior'),play=el('button','btn primary','Reproduzir'),next=el('button','btn','Próxima →');
 const speedLabel=el('label',null,'Tempo por etapa '),speed=el('select');speed.setAttribute('aria-label','Tempo por etapa');
 speed.innerHTML='<option value="3000">3 segundos</option><option value="6000">6 segundos</option>';speedLabel.appendChild(speed);
 const quiz=el('button','btn','Testar minha memória');controls.append(prev,play,next,speedLabel,quiz);card.appendChild(controls);
 const note=el('p','muted small','A sequência é desacelerada para estudo. As etapas não têm a mesma duração no coração real.');card.appendChild(note);
 const memory=el('details','visual-memory');memory.innerHTML='<summary>Mapa para guardar na memória</summary><div class="visual-memory-grid">'+FASES_VISUAIS.map(f=>'<div style="border-color:'+f.cor+'"><strong>'+f.nome+'</strong><p>'+f.lembre+'</p></div>').join('')+'</div>';card.appendChild(memory);
 let index=0,playing=false,testing=false,revealed=false,timer=null;
 function stop(){clearTimeout(timer);timer=null;playing=false;play.textContent='Reproduzir';stage.querySelectorAll('[data-wave]').forEach(n=>n.classList.remove('visual-drawing'));}
 function schedule(){timer=setTimeout(()=>{if(!card.isConnected||document.hidden){stop();return;}if(index===4){stop();return;}index++;paint();schedule();},Number(speed.value));}
 function paint(){
  const f=FASES_VISUAIS[index];card.style.setProperty('--phase',f.cor);
  buttons.forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===index));b.classList.toggle('active',i===index);});
  stage.querySelectorAll('[data-area]').forEach(n=>{const active=n.getAttribute('data-area')===f.alvo;n.setAttribute('fill',active?f.cor:'#344354');n.setAttribute('stroke',active?'#fff':'#7a8ca1');n.setAttribute('stroke-width',active?'3':'1');});
  stage.querySelectorAll('[data-wave]').forEach((n,i)=>{n.setAttribute('stroke',i===index?f.cor:'#667587');n.setAttribute('stroke-width',i===index?'5':'3');n.classList.toggle('visual-drawing',playing&&i===index);});
  const cursor=stage.querySelector('[data-cursor]');cursor.setAttribute('x1',f.x);cursor.setAttribute('x2',f.x);cursor.setAttribute('stroke',f.cor);
  stage.querySelectorAll('[data-wave-label]').forEach((n,i)=>n.setAttribute('fill',i===index?f.cor:'#c2ceda'));
  if(testing&&!revealed){
   info.innerHTML='<strong>Observe a área e o trecho destacados.</strong><p>'+f.pergunta+'</p>';
   const reveal=el('button','btn','Revelar explicação');reveal.onclick=()=>{revealed=true;paint();};info.appendChild(reveal);
  }else info.innerHTML='<span class="kicker">Etapa '+(index+1)+' de 5</span><h3>'+f.titulo+'</h3><p>'+f.texto+'</p><strong>'+f.lembre+'</strong>';
  prev.disabled=index===0;next.disabled=index===4;
  quiz.textContent=testing?'Voltar a estudar':'Testar minha memória';quiz.setAttribute('aria-pressed',String(testing));
  memory.hidden=testing; if(testing)memory.open=false;
 }
 function go(i){stop();index=Math.max(0,Math.min(4,i));revealed=false;paint();}
 prev.onclick=()=>go(index-1);next.onclick=()=>go(index+1);
 play.onclick=()=>{if(playing){stop();return;}testing=false;revealed=false;if(index===4)index=0;playing=true;play.textContent='Pausar';paint();schedule();};
 speed.onchange=()=>{if(playing){clearTimeout(timer);schedule();}};
 quiz.onclick=()=>{stop();testing=!testing;revealed=false;paint();};
 const onVisibility=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',onVisibility);
 (window.__visualCleanups=window.__visualCleanups||[]).push(()=>{stop();document.removeEventListener('visibilitychange',onVisibility);});
 paint();return card;
}
function frequenciaVisual(){
 const card=el('section','card visual-aula');card.setAttribute('aria-label','Régua interativa de frequência');
 card.innerHTML='<div class="kicker">Distância → tempo → frequência</div><h3>Afaste as ondas R e veja a frequência cair</h3><p class="muted">Ritmo regular, a 25 mm/s. Cada quadrado grande equivale a 0,20 segundo.</p>';
 const graph=el('div','visual-rr');card.appendChild(graph);
 const label=el('label','visual-range','Quadrados grandes entre duas ondas R');const range=el('input');range.type='range';range.min='1';range.max='6';range.step='1';range.value='4';range.setAttribute('aria-label','Quadrados grandes entre duas ondas R');label.appendChild(range);card.appendChild(label);
 const result=el('p','visual-equation');result.setAttribute('aria-live','polite');card.appendChild(result);
 const quiz=el('button','btn','Ocultar resultado e tentar');card.appendChild(quiz);let hidden=false;
 function paint(){const n=Number(range.value),x=45+n*65;range.setAttribute('aria-valuetext',n+' quadrados grandes');
  graph.innerHTML='<svg viewBox="0 0 470 200" role="img" aria-label="Duas ondas R separadas por '+n+' quadrados grandes">'+
   Array.from({length:31},(_,i)=>'<line x1="'+(45+i*13)+'" x2="'+(45+i*13)+'" y1="40" y2="160" stroke="'+(i%5===0?'#657489':'#303e50')+'"/>').join('')+
   '<rect x="45" y="40" width="'+n*65+'" height="120" fill="#63dace" opacity=".12"/>'+
   Array.from({length:n},(_,i)=>'<text x="'+(77+i*65)+'" y="190" text-anchor="middle" fill="#63dace">'+(i+1)+'</text>').join('')+
   '<path d="M15 125 L33 125 L39 139 L45 52 L54 149 L62 125 H'+(x-12)+' L'+(x-6)+' 139 L'+x+' 52 L'+(x+9)+' 149 L'+(x+17)+' 125 H460" fill="none" stroke="#e6ebf2" stroke-width="3"/>'+
   '<text x="45" y="27" fill="#63dace" text-anchor="middle">R</text><text x="'+x+'" y="27" fill="#63dace" text-anchor="middle">R</text></svg>';
  result.textContent=hidden?n+' quadrados grandes: qual é a frequência?':'300 ÷ '+n+' = '+Math.round(300/n)+' bpm · RR = '+(n*.2).toFixed(2).replace('.',',')+' s';
  quiz.textContent=hidden?'Revelar resultado':'Ocultar resultado e tentar';quiz.setAttribute('aria-pressed',String(hidden));
 }
 range.oninput=paint;quiz.onclick=()=>{hidden=!hidden;paint();};paint();
 card.appendChild(el('p','muted small','Observe: dobrar a distância entre as ondas R reduz a frequência à metade. Este método pressupõe ritmo regular.'));
 return card;
}

/* Controle compartilhado dos percursos de derivações e territórios. */
function percursoVisual(card,items,draw){
 let index=0,playing=false,testing=false,revealed=false,timer=null;
 const choices=el('div','visual-steps'),info=el('div','visual-explain');info.setAttribute('aria-live','polite');
 const controls=el('div','visual-controls');
 const prev=el('button','btn','← Anterior'),play=el('button','btn primary','Reproduzir percurso'),next=el('button','btn','Próxima →'),quiz=el('button','btn','Testar minha memória');
 const label=el('label',null,'Tempo por etapa '),speed=el('select');speed.setAttribute('aria-label','Tempo por etapa');speed.innerHTML='<option value="4000">4 segundos</option><option value="7000">7 segundos</option>';label.appendChild(speed);
 const buttons=items.map((item,i)=>{const b=el('button','btn',esc(item.nome));b.onclick=()=>go(i);choices.appendChild(b);return b;});
 card.append(choices,info);controls.append(prev,play,next,label,quiz);card.appendChild(controls);
 function stop(){clearTimeout(timer);timer=null;playing=false;play.textContent='Reproduzir percurso';card.classList.remove('tour-playing');}
 function paint(){
  const item=items[index];card.style.setProperty('--phase',item.cor||'#63dace');
  buttons.forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-pressed',String(i===index));});
  prev.disabled=index===0;next.disabled=index===items.length-1;quiz.textContent=testing?'Voltar a estudar':'Testar minha memória';quiz.setAttribute('aria-pressed',String(testing));
  const hide=testing&&!revealed;draw(item,index,hide);
  info.innerHTML='<span class="kicker">Etapa '+(index+1)+' de '+items.length+'</span><h3>'+esc(hide?item.pergunta:item.titulo)+'</h3>'+(hide?'<p>Observe a figura e tente responder antes de revelar.</p>':'<p>'+esc(item.texto)+'</p><strong>'+esc(item.lembre)+'</strong>');
  if(hide){const b=el('button','btn','Revelar explicação');b.onclick=()=>{revealed=true;paint();};info.appendChild(b);}
 }
 function go(i){stop();index=Math.max(0,Math.min(items.length-1,i));revealed=false;paint();}
 function schedule(){timer=setTimeout(()=>{if(!card.isConnected||document.hidden){stop();return;}if(index===items.length-1){stop();return;}index++;paint();schedule();},Number(speed.value));}
 prev.onclick=()=>go(index-1);next.onclick=()=>go(index+1);
 play.onclick=()=>{if(playing){stop();return;}testing=false;revealed=false;if(index===items.length-1)index=0;playing=true;card.classList.add('tour-playing');play.textContent='Pausar percurso';paint();schedule();};
 speed.onchange=()=>{if(playing){clearTimeout(timer);schedule();}};
 quiz.onclick=()=>{stop();testing=!testing;revealed=false;paint();};
 const onVisibility=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',onVisibility);
 (window.__visualCleanups=window.__visualCleanups||[]).push(()=>{stop();document.removeEventListener('visibilitychange',onVisibility);});
 paint();return {refresh:paint,stop};
}
const DERIVACOES_VISUAIS=[
 {nome:'DI',g:0,grupo:'Lateral alta',cor:'#63dace',local:'Diferença de potencial entre braço direito (−) e braço esquerdo (+).'},
 {nome:'DII',g:60,grupo:'Inferior',cor:'#f5c46b',local:'Braço direito (−) para perna esquerda (+).'},
 {nome:'DIII',g:120,grupo:'Inferior',cor:'#f5c46b',local:'Braço esquerdo (−) para perna esquerda (+).'},
 {nome:'aVR',g:-150,grupo:'Olhar superior direito',cor:'#c8a5fa',local:'Polo positivo no braço direito; referência calculada a partir dos outros dois membros.'},
 {nome:'aVL',g:-30,grupo:'Lateral alta',cor:'#63dace',local:'Polo positivo no braço esquerdo; referência calculada a partir dos outros dois membros.'},
 {nome:'aVF',g:90,grupo:'Inferior',cor:'#f5c46b',local:'Polo positivo na perna esquerda; referência calculada a partir dos braços.'},
 {nome:'V1',grupo:'Septal',cor:'#89baff',x:126,y:119,local:'4º espaço intercostal, borda esternal direita.'},
 {nome:'V2',grupo:'Septal',cor:'#89baff',x:164,y:119,local:'4º espaço intercostal, borda esternal esquerda.'},
 {nome:'V3',grupo:'Anterior',cor:'#f5a3b7',x:187,y:147,local:'Entre V2 e V4. Posicione V4 antes de V3.'},
 {nome:'V4',grupo:'Anterior',cor:'#f5a3b7',x:211,y:176,local:'5º espaço intercostal, linha médio-clavicular esquerda.'},
 {nome:'V5',grupo:'Lateral baixa',cor:'#63dace',x:252,y:176,local:'Linha axilar anterior esquerda, no mesmo nível horizontal de V4.'},
 {nome:'V6',grupo:'Lateral baixa',cor:'#63dace',x:285,y:176,local:'Linha axilar média esquerda, no mesmo nível horizontal de V4 e V5.'}
].map(d=>({...d,titulo:d.nome+' · '+d.grupo,texto:d.local+' '+(d.g!==undefined?'Derivação do plano frontal. O eixo aponta para o polo positivo, não para a direção do impulso.':'Derivação do plano horizontal. O eletrodo torácico é o polo positivo; a referência é calculada a partir dos membros.'),lembre:d.g!==undefined?'Plano frontal → membros':'Plano horizontal → precordiais',pergunta:d.g!==undefined?'Para onde aponta o polo positivo de '+d.nome+'?':'Onde posicionar '+d.nome+'?'}));
function figuraDerivacao(d){
 if(d.g!==undefined){
  const point=(r,g)=>[180+r*Math.cos(g*Math.PI/180),155+r*Math.sin(g*Math.PI/180)];
  let marks='';DERIVACOES_VISUAIS.slice(0,6).forEach(l=>{const [x,y]=point(112,l.g),[tx,ty]=point(138,l.g),on=l.nome===d.nome;
   marks+='<line x1="180" y1="155" x2="'+x+'" y2="'+y+'" stroke="'+(on?d.cor:'#435267')+'" stroke-width="'+(on?4:1)+'"/>'+ '<circle cx="'+x+'" cy="'+y+'" r="'+(on?11:5)+'" fill="'+(on?d.cor:'#667587')+'"/>'+ '<text x="'+tx+'" y="'+(ty+5)+'" text-anchor="middle" fill="'+(on?d.cor:'#b4c0ce')+'">'+l.nome+(on?' +':'')+'</text>';});
  return '<svg viewBox="0 0 360 330" role="img" aria-label="Plano frontal: polo positivo de '+d.nome+' a '+d.g+' graus"><circle cx="180" cy="155" r="112" fill="#192633" stroke="#455469"/>'+marks+'<path d="M180 145 C155 123 143 153 180 182 C217 153 204 123 180 145" fill="#697c93"/><text x="180" y="19" text-anchor="middle">Superior</text><text x="180" y="326" text-anchor="middle">Inferior · '+d.g+'°</text><text x="12" y="310">Direita do paciente</text><text x="348" y="310" text-anchor="end">Esquerda</text></svg>';
 }
 return '<svg viewBox="0 0 360 300" role="img" aria-label="Posição esquemática de '+d.nome+' no tórax, vista anterior">'+
 '<path d="M120 35 L90 45 Q50 58 48 105 L41 245 Q180 283 319 245 L312 105 Q310 58 270 45 L240 35 Q220 61 180 61 Q141 61 120 35Z" fill="#1e2d3c" stroke="#667b91" stroke-width="2"/>'+
 '<path d="M145 75 V220" stroke="#8192a6" stroke-width="6" stroke-linecap="round"/>'+
 '<path d="M73 119 H235 M73 147 H259 M75 176 H292" stroke="#53687d" stroke-dasharray="4 5"/>'+
 '<text x="48" y="106">4º EIC</text><text x="49" y="195">5º EIC</text><text x="16" y="22">Direita do paciente</text><text x="344" y="22" text-anchor="end">Esquerda</text>'+
 '<path d="M211 176 H285" stroke="#63dace" stroke-width="2"/>'+
 DERIVACOES_VISUAIS.slice(6).map(l=>'<circle cx="'+l.x+'" cy="'+l.y+'" r="'+(d.nome===l.nome?16:12)+'" fill="'+(d.nome===l.nome?d.cor:'#344b60')+'" stroke="'+(d.nome===l.nome?'#fff':'#8394a7')+'" stroke-width="2"/><text x="'+l.x+'" y="'+(l.y+4)+'" text-anchor="middle" style="font-size:11px;fill:'+(d.nome===l.nome?'#102333':'#fff')+'">'+l.nome+'</text>').join('')+
 '<text x="180" y="279" text-anchor="middle">V4, V5 e V6 na mesma horizontal</text></svg>';
}
function derivacoesVisual(){
 const card=el('section','card visual-aula lead-tour');card.setAttribute('aria-label','Percurso das 12 derivações');
 card.innerHTML='<div class="kicker">Posição → ponto de vista → sinal</div><h3>Um coração, 12 pontos de vista</h3><p class="muted">Explore os membros e depois o tórax. A cor identifica o grupo; o contorno marca a derivação selecionada.</p>';
 const stage=el('div','lead-stage'),figure=el('div','lead-figure'),side=el('div','lead-side');stage.append(figure,side);card.appendChild(stage);
 let polarity=0;
 const modes=[{nome:'Em direção ao +',cor:'#63dace',g:0,signal:'M25 100 H75 L92 35 L109 100 H155',text:'Despolarização em direção ao polo positivo → deflexão positiva.'},{nome:'Afastando-se do +',cor:'#f5a3b7',g:180,signal:'M25 100 H75 L92 160 L109 100 H155',text:'Despolarização afastando-se do polo positivo → deflexão negativa.'},{nome:'Perpendicular',cor:'#f5c46b',g:-90,signal:'M25 100 H75 L85 65 L100 135 L110 100 H155',text:'A projeção instantânea perpendicular é nula. Um QRS com forças que se equilibram pode ser bifásico, com saldo próximo de zero.'}];
 const modeButtons=el('div','visual-steps');modeButtons.setAttribute('aria-label','Direção da despolarização');
 const options=modes.map((m,i)=>{const b=el('button','btn',m.nome);b.onclick=()=>{polarity=i;paintSignal();};modeButtons.appendChild(b);return b;});
 const signal=el('div','lead-signal');signal.setAttribute('aria-live','polite');
 side.append(el('h3',null,'Por que o traçado sobe ou desce?'),el('p','muted small','Mude a direção da despolarização em relação ao polo positivo. O desenho abaixo é um modelo, não o QRS esperado dessa derivação.'),modeButtons,signal);
 function paintSignal(){const m=modes[polarity];options.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===polarity)));
  signal.innerHTML='<svg viewBox="0 0 360 205" role="img" aria-label="'+esc(m.text)+'"><line x1="25" y1="100" x2="150" y2="100" stroke="#667587" stroke-dasharray="4 4"/><circle cx="157" cy="100" r="17" fill="'+m.cor+'"/><text x="157" y="106" text-anchor="middle" style="fill:#102333;font-size:22px">+</text><g transform="rotate('+m.g+' 80 100)"><path class="lead-impulse" d="M45 100 H115" stroke="'+m.cor+'" stroke-width="6"/><path d="M104 90 L118 100 L104 110" fill="none" stroke="'+m.cor+'" stroke-width="4"/></g><g transform="translate(185 0)"><path d="M10 100 H163" stroke="#667587" stroke-dasharray="3 4"/><path class="lead-wave" pathLength="1" d="'+m.signal+'" fill="none" stroke="'+m.cor+'" stroke-width="4"/></g><text x="90" y="195" text-anchor="middle">Vetor elétrico</text><text x="275" y="195" text-anchor="middle">Deflexão</text></svg><p>'+esc(m.text)+'</p>';
 }
 percursoVisual(card,DERIVACOES_VISUAIS,(d,i,hidden)=>{figure.innerHTML='<div class="kicker">'+(i<6?'Plano frontal':'Eletrodos no tórax · vista anterior')+'</div>'+figuraDerivacao(d)+'<p class="muted small">'+(i<6?'Eixos elétricos, não posições físicas dos eletrodos.':'Posições esquemáticas. Use os marcos anatômicos descritos abaixo.')+'</p>';paintSignal();});
 card.appendChild(el('p','muted small','As derivações registram diferenças de potencial. A analogia com câmeras serve para lembrar a orientação; nenhuma derivação enxerga uma única parede isoladamente.'));
 return card;
}
