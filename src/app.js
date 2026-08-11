import { weeklyPlans, days, commentarySamples, verseTexts } from './data.js';
import { loadState, saveState, exportState, importState } from './store.js';
import { askRock, testRock } from './api.js';
import { scheduleDailyReminder } from './native.js';

let state = loadState();
let view = { tab: 'inicio', study: null, calendarMonth: new Date(), toast: '', loading: false };
const app = document.querySelector('#app');
const icons = { inicio:'⌂', plan:'☑', buscar:'⌕', diario:'✎', perfil:'☰' };

function esc(v='') { return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function completedCount() { return days.filter(d => state.completed[d.id]).length; }
function weekDone(w) { return days.filter(d => d.week === w && state.completed[d.id]).length; }
function currentWeek() { return Math.min(12, Math.max(1, Math.floor(completedCount()/7)+1)); }
function streak() {
  const dates = new Set(Object.values(state.completed).filter(Boolean)); let count=0, d=new Date();
  if (!dates.has(d.toISOString().slice(0,10))) d.setDate(d.getDate()-1);
  while (dates.has(d.toISOString().slice(0,10))) { count++; d.setDate(d.getDate()-1); }
  return count;
}
function dayDate(day) { const d = new Date(`${state.settings.startDate}T12:00:00`); d.setDate(d.getDate() + days.indexOf(day)); return d; }
function todayDay() {
  const diff = Math.floor((new Date().setHours(12,0,0,0)-new Date(`${state.settings.startDate}T12:00:00`))/86400000);
  return days[Math.min(83, Math.max(0,diff))];
}

function shell(content) {
  return `<main class="app-shell"><header class="topbar"><div class="brand"><span class="brandmark">✦</span><span>Mi Plan Bíblico</span></div><button class="icon-btn" data-action="install" aria-label="Instalar aplicación">⇩</button></header><section class="content">${content}</section><nav class="bottom-nav">${['inicio','plan','buscar','diario','perfil'].map(t=>`<button data-tab="${t}" class="${view.tab===t?'active':''}"><span>${icons[t]}</span>${t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</nav>${view.toast?`<div class="toast">${esc(view.toast)}</div>`:''}</main>`;
}
function progressRing(value) { return `<div class="ring" style="--p:${value}"><strong>${value}%</strong><span>completo</span></div>`; }
function home() {
  const n=completedCount(), pct=Math.round(n/84*100), w=currentWeek(), today=todayDay(), wp=weeklyPlans[w-1];
  return `<div class="eyebrow">SEMANA ${w} DE 12</div><h1>Camina en la Palabra,<br><em>un día a la vez.</em></h1>
  <section class="hero-card"><div><p>Tu avance</p><h2>${n} <small>de 84 lecturas</small></h2><div class="meter"><i style="width:${pct}%"></i></div></div>${progressRing(pct)}</section>
  <section class="stats-row"><article><b>🔥 ${streak()}</b><span>Racha actual</span></article><article><b>${weekDone(w)}/7</b><span>Esta semana</span></article><article><b>${state.journal.length}</b><span>Notas</span></article></section>
  <section class="section-head"><div><span>LECTURA DE HOY</span><h2>${esc(today.theme)}</h2></div><button data-study="${today.id}">Abrir</button></section>
  <article class="reading-card"><div class="day-badge">DÍA<br><strong>${today.day}</strong></div><div><h3>${esc(today.passage)}</h3><p>Lee despacio, observa el contexto y responde con una aplicación concreta.</p></div><button class="check ${state.completed[today.id]?'done':''}" data-complete="${today.id}" aria-label="Marcar lectura">${state.completed[today.id]?'✓':'○'}</button></article>
  <article class="verse-card"><span>VERSÍCULO DE LA SEMANA</span><blockquote>“${esc(verseTexts[wp.verse] || '')}”</blockquote><cite>${esc(wp.verse)}</cite></article>
  <section class="section-head"><div><span>TU CAMINO</span><h2>Semanas</h2></div><button data-tab="plan">Ver plan</button></section><div class="week-strip">${weeklyPlans.map((x,i)=>`<button data-week="${i+1}" class="${i+1===w?'current':''} ${weekDone(i+1)===7?'finished':''}"><span>${i+1}</span><small>${weekDone(i+1)}/7</small></button>`).join('')}</div>`;
}
function plan() {
  return `<div class="page-title"><span>RECORRIDO DE 12 SEMANAS</span><h1>Tu plan de estudio</h1><p>84 encuentros para conocer, creer y vivir la Palabra.</p></div>${calendar()}<section class="analytics"><div class="section-head"><div><span>ESTADÍSTICAS</span><h2>Avance por semana</h2></div><b>${completedCount()}/84</b></div><div class="bars">${weeklyPlans.map((w,i)=>`<div><span>${i+1}</span><i><b style="width:${weekDone(i+1)/7*100}%"></b></i><small>${weekDone(i+1)}/7</small></div>`).join('')}</div></section>${weeklyPlans.map((w,i)=>`<details class="week-card" ${i+1===currentWeek()?'open':''}><summary><div class="week-number">${i+1}</div><div><small>SEMANA ${i+1}</small><h3>${esc(w.title)}</h3><p>${weekDone(i+1)} de 7 · ${esc(w.verse)}</p></div><span>⌄</span></summary><div class="day-list">${days.filter(d=>d.week===i+1).map(d=>`<article><button class="mini-check ${state.completed[d.id]?'done':''}" data-complete="${d.id}">${state.completed[d.id]?'✓':d.day}</button><button class="day-copy" data-study="${d.id}"><small>DÍA ${d.day}</small><strong>${esc(d.passage)}</strong></button><span>›</span></article>`).join('')}</div></details>`).join('')}`;
}
function calendar() {
  const selected=view.calendarMonth, year=selected.getFullYear(), month=selected.getMonth(), first=new Date(year,month,1), count=new Date(year,month+1,0).getDate(), offset=(first.getDay()+6)%7;
  const cells=Array(offset).fill('<span class="blank"></span>');
  for(let n=1;n<=count;n++){const date=new Date(year,month,n),iso=date.toISOString().slice(0,10),d=days.find(x=>dayDate(x).toISOString().slice(0,10)===iso);cells.push(d?`<button data-study="${d.id}" class="${state.completed[d.id]?'done':''} ${iso===new Date().toISOString().slice(0,10)?'today':''}"><b>${n}</b><small>${d.passage.split(' ')[0]}</small></button>`:`<span><b>${n}</b></span>`);}
  return `<section class="calendar"><header><button data-month="-1">‹</button><h2>${selected.toLocaleDateString('es-MX',{month:'long',year:'numeric'})}</h2><button data-month="1">›</button></header><div class="weekdays">${['L','M','M','J','V','S','D'].map(x=>`<b>${x}</b>`).join('')}</div><div class="calendar-grid">${cells.join('')}</div><p><i></i> Lectura programada · <i class="complete"></i> Completada</p></section>`;
}
function search() {
  return `<div class="page-title"><span>EXPLORA LA BIBLIA</span><h1>Buscar un pasaje</h1><p>Abre una lectura del plan o escribe cualquier referencia.</p></div><form id="search-form" class="search-box"><span>⌕</span><input name="passage" placeholder="Ej. Juan 3:16-21" required><button>Estudiar</button></form><h2 class="subhead">Lecturas del plan</h2><div class="passage-grid">${days.map(d=>`<button data-study="${d.id}"><small>${esc(d.theme)}</small><strong>${esc(d.passage)}</strong></button>`).join('')}</div>`;
}
function journal() {
  return `<div class="page-title"><span>MEMORIA ESPIRITUAL</span><h1>Mi diario</h1><p>Guarda lo que Dios te enseña y vuelve a ello después.</p></div><form id="journal-form" class="journal-form"><label>Título<input name="title" placeholder="Lo que aprendí hoy" required></label><label>Reflexión<textarea name="body" rows="5" placeholder="Escribe una oración, observación o aplicación…" required></textarea></label><button class="primary">Guardar entrada</button></form><div class="journal-list">${state.journal.length?state.journal.map((j,i)=>`<article><div><small>${new Date(j.date).toLocaleDateString('es-MX',{dateStyle:'medium'})}</small><h3>${esc(j.title)}</h3><p>${esc(j.body)}</p></div><button data-delete-journal="${i}" aria-label="Eliminar">×</button></article>`).join(''):'<div class="empty">Tu diario está listo para recibir la primera entrada.</div>'}</div>`;
}
function profile() {
  return `<div class="page-title"><span>PREFERENCIAS</span><h1>Tu experiencia</h1><p>Ajusta recordatorios y el enfoque del asistente Rock.</p></div><form id="settings-form" class="settings">
  <section><h2>Perfil doctrinal</h2><label>Enfoque principal<select name="doctrine"><option ${state.settings.doctrine==='Bautista conservador'?'selected':''}>Bautista conservador</option><option ${state.settings.doctrine==='Cristiano evangélico'?'selected':''}>Cristiano evangélico</option><option ${state.settings.doctrine==='Exploración amplia'?'selected':''}>Exploración amplia</option></select></label><label class="toggle"><span><b>Mostrar otras interpretaciones</b><small>Rock distinguirá con claridad cada perspectiva.</small></span><input type="checkbox" name="showAlternatives" ${state.settings.showAlternatives?'checked':''}></label></section>
  <section><h2>Rutina</h2><label>Fecha de inicio<input type="date" name="startDate" value="${state.settings.startDate}"></label><label class="toggle"><span><b>Recordatorio diario</b><small>Requiere permiso del dispositivo.</small></span><input type="checkbox" name="reminder" ${state.settings.reminder?'checked':''}></label><label>Hora<input type="time" name="reminderTime" value="${state.settings.reminderTime}"></label><button type="button" class="secondary" data-action="notifications">Activar notificaciones</button></section>
  <section><h2>Servicio seguro de IA</h2><label>URL del backend/proxy<input name="apiBase" type="url" placeholder="https://mi-plan-biblico-api....workers.dev" value="${esc(state.settings.apiBase)}"></label><p class="hint">Las claves privadas viven únicamente en ese backend, nunca en esta app.</p><button type="button" class="secondary" data-action="test-backend">Probar conexión con Rock</button></section><button class="primary">Guardar ajustes</button></form>
  <section class="data-tools"><h2>Tus datos</h2><p>El avance se guarda en este dispositivo. Puedes descargar una copia o restaurarla.</p><div><button data-action="export">Descargar copia</button><label class="button">Restaurar copia<input id="import-file" type="file" accept="application/json" hidden></label></div></section>`;
}
function study() {
  const day=days.find(d=>d.id===view.study); const passage=day?.passage || view.study; const comments=commentarySamples[passage] || [];
  return `<button class="back" data-back>‹ Volver</button><div class="study-title"><span>ESTUDIO DEL PASAJE</span><h1>${esc(passage)}</h1>${day?`<p>Semana ${day.week} · ${esc(day.theme)}</p>`:''}</div>
  <section class="study-section"><div class="section-icon">◫</div><div><h2>Lee el texto bíblico</h2><p>La app no reproduce una traducción completa por derechos editoriales. Abre tu Biblia preferida y lee el pasaje en su contexto.</p><a class="external" href="https://www.biblegateway.com/passage/?search=${encodeURIComponent(passage)}&version=RVR1960" target="_blank" rel="noopener">Abrir en BibleGateway ↗</a></div></section>
  <section class="study-section"><div class="section-icon">✦</div><div><h2>Observa y aplica</h2><div class="prompts"><p>¿Qué revela este pasaje acerca de Dios?</p><p>¿Qué revela acerca del ser humano?</p><p>Si realmente creyera esto, ¿qué sería diferente hoy?</p></div><textarea id="reflection" rows="5" placeholder="Escribe tu reflexión…">${esc(state.reflections[passage]||'')}</textarea><button class="secondary" data-save-reflection="${esc(passage)}">Guardar reflexión</button></div></section>
  <section class="commentary"><span>VOCES DE ESTUDIO</span><h2>Comentarios atribuidos</h2><p class="disclosure">Estas notas provienen de fuentes identificadas. No son texto generado por Rock.</p>${comments.length?comments.map(c=>`<article><div class="avatar">${c.author.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><h3>${esc(c.author)}</h3><small>${esc(c.work)}</small><p>${esc(c.note)}</p><a href="${c.link}" target="_blank" rel="noopener">Consultar fuente ↗</a></div></article>`).join(''):'<div class="empty">Todavía no hay comentarios curados para este pasaje. Rock puede ayudarte a observarlo, pero su explicación aparecerá separada aquí abajo.</div>'}</section>
  <section class="rock"><div class="rock-head"><div class="rock-avatar">R</div><div><span>ASISTENTE DE ESTUDIO</span><h2>Pregúntale a Rock</h2></div></div><p>Rock responde según tu perfil, distingue hechos, inferencias y perspectivas, y nunca sustituye la lectura bíblica ni el consejo pastoral.</p><div id="rock-thread">${state.questions.filter(q=>q.passage===passage).map(q=>`<div class="qa"><b>Tú</b><p>${esc(q.question)}</p><b>Rock · explicación generada por IA</b><p>${esc(q.answer)}</p>${q.perspective?`<small>${esc(q.perspective)}</small>`:''}</div>`).join('')}</div><form id="rock-form" data-passage="${esc(passage)}"><textarea name="question" rows="3" placeholder="¿Qué significa este versículo en su contexto?" required></textarea><button class="primary" ${view.loading?'disabled':''}>${view.loading?'Pensando…':'Preguntar a Rock'}</button></form></section>
  ${day?`<button class="complete-wide ${state.completed[day.id]?'done':''}" data-complete="${day.id}">${state.completed[day.id]?'✓ Lectura completada':'○ Marcar “Listo, leído”'}</button>`:''}`;
}
function stats() { return ''; }
function render() { const body=view.study?study():({inicio:home,plan, buscar:search,diario:journal,perfil:profile}[view.tab]||home)(); app.innerHTML=shell(body); bind(); }
function toast(msg) { view.toast=msg; render(); setTimeout(()=>{view.toast='';render();},2200); }
function persist(msg) { saveState(state); if(msg) toast(msg); else render(); }

let installPrompt;
window.addEventListener('beforeinstallprompt', e=>{e.preventDefault();installPrompt=e;});
function bind() {
  app.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{view.tab=b.dataset.tab;view.study=null;render();scrollTo(0,0);});
  app.querySelectorAll('[data-study]').forEach(b=>b.onclick=()=>{view.study=b.dataset.study;render();scrollTo(0,0);});
  app.querySelectorAll('[data-month]').forEach(b=>b.onclick=()=>{view.calendarMonth=new Date(view.calendarMonth.getFullYear(),view.calendarMonth.getMonth()+Number(b.dataset.month),1);render();});
  app.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{view.study=null;render();});
  app.querySelectorAll('[data-complete]').forEach(b=>b.onclick=()=>{const id=b.dataset.complete; state.completed[id]=state.completed[id]?null:new Date().toISOString().slice(0,10);persist(state.completed[id]?'¡Listo, leído!':'Lectura desmarcada');});
  app.querySelector('#search-form')?.addEventListener('submit',e=>{e.preventDefault();view.study=new FormData(e.target).get('passage').trim();render();});
  app.querySelector('#journal-form')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);state.journal.unshift({title:f.get('title'),body:f.get('body'),date:new Date().toISOString()});persist('Entrada guardada');});
  app.querySelectorAll('[data-delete-journal]').forEach(b=>b.onclick=()=>{state.journal.splice(Number(b.dataset.deleteJournal),1);persist('Entrada eliminada');});
  app.querySelector('[data-save-reflection]')?.addEventListener('click',e=>{state.reflections[e.currentTarget.dataset.saveReflection]=app.querySelector('#reflection').value;persist('Reflexión guardada');});
  app.querySelector('#settings-form')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);state.settings={...state.settings,doctrine:f.get('doctrine'),showAlternatives:f.has('showAlternatives'),reminder:f.has('reminder'),reminderTime:f.get('reminderTime'),startDate:f.get('startDate'),apiBase:f.get('apiBase').replace(/\/$/,'')};persist('Preferencias guardadas');});
  app.querySelector('#rock-form')?.addEventListener('submit',async e=>{e.preventDefault();const q=new FormData(e.target).get('question').trim(), passage=e.target.dataset.passage;view.loading=true;render();try{const a=await askRock({...state.settings,passage,question:q});state.questions.push({passage,question:q,...a,date:new Date().toISOString()});saveState(state);view.loading=false;render();}catch(err){view.loading=false;toast(err.message);}});
  app.querySelector('[data-action="install"]')?.addEventListener('click',async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;}else toast('En iPhone: Compartir → Agregar a pantalla de inicio. En Android: menú → Instalar app.');});
  app.querySelector('[data-action="notifications"]')?.addEventListener('click',async()=>{try{const result=await scheduleDailyReminder(app.querySelector('[name="reminderTime"]')?.value);if(result.native)return toast('Recordatorio diario programado en el teléfono.');if(!('Notification'in window))return toast('Este navegador no admite notificaciones.');const p=await Notification.requestPermission();toast(p==='granted'?'Notificaciones web autorizadas. La app Android usa recordatorios locales más confiables.':'Permiso no concedido.');}catch(err){toast(err.message);}});
  app.querySelector('[data-action="test-backend"]')?.addEventListener('click',async()=>{const url=app.querySelector('[name="apiBase"]').value.trim();try{const info=await testRock(url);toast(`Rock está conectado · ${info.model}`);}catch(err){toast(err.message);}});
  app.querySelector('[data-action="export"]')?.addEventListener('click',()=>exportState(state));
  app.querySelector('#import-file')?.addEventListener('change',async e=>{try{state=await importState(e.target.files[0]);persist('Copia restaurada');}catch{toast('La copia no tiene un formato válido.');}});
}
if ('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
render();
