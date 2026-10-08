function availableClinicalExams(run){
 const records=[],steps=runSteps(run);
 for(let i=0;i<run.index;i++)if(steps[i].exams&&run.answers[i]!==null){
  steps[i].options.forEach((o,j)=>{const marked=isMarked(run.answers[i],j);if(marked||o.ok)records.push({index:i,text:o.text,result:o.result||'Resultado em avaliação pela equipe.',complemented:!marked});});
 }
 return records;
}
/* Consulta do que já foi apresentado. Não usa respostas corretas, fontes ou etapas futuras. */
function clinicalData(run){
 const c=CASE_MAP[run.id],steps=runSteps(run),known=steps.slice(0,run.index+1);
 const observations=known.map((s,index)=>({index,kind:s.kind,vitals:s.vitals||'',context:s.context||'',minutes:c.clock||c.timeEnabled?caseClock(run,index):null})).filter(s=>s.vitals||s.context);
 const ecgs=[];let previous=null;
 for(let i=0;i<run.index;i++){
  if(steps[i].noECG||run.answers[i]===null)continue;
  const signature=JSON.stringify({spec:clinicalSpec(run,i),extra:steps[i].extra||null});
  if(signature===previous)continue;previous=signature;ecgs.push({index:i,extra:steps[i].extra||null});
 }
 return {observations,ecgs,exams:availableClinicalExams(run)};
}
function clinicalDataPanel(run,host){
 if(run.index===0)return;
 const data=clinicalData(run),panel=el('details','case-panel');panel.open=!!runSteps(run)[run.index].heart;
 panel.appendChild(el('summary',null,'Dados do atendimento'));
 panel.appendChild(el('p','muted small','Consulta dos dados disponíveis até esta etapa. Os achados mais recentes aparecem primeiro.'));
 clinicalExamResults(run,panel);
 if(data.observations.length){
  const history=el('section','case-history');history.setAttribute('aria-label','Achados e evolução');history.setAttribute('tabindex','0');
  history.appendChild(el('h4',null,'Achados e evolução'));
  for(const item of [...data.observations].reverse()){
   const row=el('article','case-observation');
   row.appendChild(el('b',null,'Etapa '+(item.index+1)+' · '+esc(item.kind)+(item.minutes!==null?' · '+item.minutes+' min desde a chegada':'')));
   if(item.vitals)row.appendChild(el('p',null,esc(item.vitals)));
   if(item.context)row.appendChild(el('p',null,esc(item.context)));
   history.appendChild(row);
  }
  panel.appendChild(history);
 }
 if(data.ecgs.length){
  const drawer=el('details','case-record-ecg');drawer.appendChild(el('summary',null,'Consultar ECGs registrados'));
  const controls=el('div','guide-controls'),trace=el('div');let mounted=false;
  const buttons=[];
  const draw=record=>{
   trace.replaceChildren();const c=CASE_MAP[run.id],step=runSteps(run)[record.index];
   mountECG(trace,PMAP[step.pattern||c.pattern],{spec:clinicalSpec(run,record.index),locked:true,explain:false,extra:record.extra==='on'?'on':record.extra==='after'?'button':'off'});
   buttons.forEach(([b,i])=>{b.classList.toggle('on',i===record.index);b.setAttribute('aria-pressed',String(i===record.index));});
  };
  for(const record of data.ecgs){const b=el('button','btn','ECG · etapa '+(record.index+1));b.type='button';b.onclick=()=>draw(record);buttons.push([b,record.index]);controls.appendChild(b);}
  drawer.append(controls,trace);drawer.ontoggle=()=>{if(drawer.open&&!mounted){mounted=true;draw(data.ecgs.at(-1));}};panel.appendChild(drawer);
 }
 host.appendChild(panel);
}
