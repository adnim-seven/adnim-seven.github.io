(() => {
const $=s=>document.querySelector(s), examNumber=window.EXAM_NUMBER||1, examTitle=`모의고사 ${examNumber}회`, KEY=`ai-specialist-mock-${examNumber}-v1`, items=window.EXAM;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state={answers:{},overrides:{},started:null,submitted:null};
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&saved.answers)state={...state,...saved};}catch{}
const slotId=(q,s)=>q.id+'-'+s.key;
// Preserve whitespace inside string literals; ignore formatting only outside them.
function normalize(s){const tokens=String(s).trim().match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\s+|[^\s"']+/g)||[];return tokens.map(t=>/^\s+$/.test(t)?'':t[0]==="'"?'"'+t.slice(1,-1)+'"':t).join('').replace(/,$/,'');}
function auto(q,s){return [s.answer,...s.alternatives].some(a=>normalize(a)===normalize(state.answers[slotId(q,s)]||''));}
function accepted(q,s){const id=slotId(q,s);return id in state.overrides?state.overrides[id]:auto(q,s);}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));$('#saved').textContent='저장됨 '+new Date().toLocaleTimeString();}catch{$('#saved').textContent='브라우저 저장 불가 — 답안 내보내기를 이용하세요.';}}
function elapsed(){return state.started?Math.max(0,Math.floor(((state.submitted||Date.now())-state.started)/1000)):0;}
function timer(){const n=elapsed();$('#timer').textContent=`경과 ${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`+(n>=5400?' · 권장 시간 90분 경과':'');}
function render(){
$('#start').disabled=!!state.started;$('#submit').disabled=!state.started||!!state.submitted;
$('#nav').innerHTML=[...new Set(items.map(q=>q.subject))].map(subject=>{const q=items.find(x=>x.subject===subject);return `<a href="#q-${q.id}">${esc(subject)} · 20점</a>`}).join('');
$('#questions').innerHTML=items.map(q=>`<article id="q-${q.id}"><div class="meta">${esc(q.subject)} · ${q.slots.reduce((n,s)=>n+s.points,0)}점 · ${esc(q.source)}</div><h2>${q.id}. ${esc(q.title)}</h2><p>${esc(q.prompt)}</p><pre>${esc(q.code).replace(/\{\{([A-Z])\}\}/g,'<mark class="blank">[$1] ???</mark>')}</pre>${q.slots.map(s=>{const id=slotId(q,s);return `<label for="${id}">[${s.key}] ${s.points}점</label><textarea id="${id}" data-slot="${id}" spellcheck="false" autocapitalize="off" autocomplete="off" ${!state.started||state.submitted?'disabled':''} aria-label="${q.id} ${s.key} 답안">${esc(state.answers[id]||'')}</textarea>${state.submitted?`<div class="answer ${accepted(q,s)?'':'wrong'}"><strong>${accepted(q,s)?'인정':'미인정'} · ${accepted(q,s)?s.points:0}/${s.points}점</strong><pre>${esc(s.answer)}</pre><p>${esc(s.why)}</p><label><input type="checkbox" data-credit="${id}" ${accepted(q,s)?'checked':''}> 동일 기능 구현으로 ${s.points}점 인정</label><small>자동 판정: ${auto(q,s)?'일치':'등록 답안과 불일치'} · 직접 조정은 별도 표시됩니다.</small></div>`:''}`}).join('')}</article>`).join('');
$('#result').hidden=!state.submitted;if(state.submitted){const subjects=[...new Set(items.map(q=>q.subject))];let total=0,automatic=0;const rows=subjects.map(subject=>{let n=0,a=0;for(const q of items.filter(q=>q.subject===subject))for(const s of q.slots){n+=accepted(q,s)?s.points:0;a+=auto(q,s)?s.points:0;}total+=n;automatic+=a;return `<tr><td>${esc(subject)}</td><td>${a}/20</td><td>${n}/20</td></tr>`});$('#result').innerHTML=`<h2>제출 결과</h2><p class="score">${total} / 100점</p><p>자동 잠정 점수 ${automatic}점 · 직접 조정 ${Object.keys(state.overrides).length}개 · 각 문항 아래에서 정답과 해설을 확인하세요.</p><table><thead><tr><th>과목</th><th>자동</th><th>조정 반영</th></tr></thead><tbody>${rows.join('')}</tbody></table><button id="wrongOnly">미인정 답안이 있는 문제만 보기</button><button id="showAll">전체 보기</button>`;}timer();}
document.addEventListener('input',e=>{if(e.target.dataset.slot&&!state.submitted){state.answers[e.target.dataset.slot]=e.target.value;save();}});
document.addEventListener('change',e=>{if(e.target.dataset.credit&&state.submitted){state.overrides[e.target.dataset.credit]=e.target.checked;save();render();}});
document.addEventListener('keydown',e=>{if(e.key==='Tab'&&e.target.matches('textarea')&&!e.target.disabled){e.preventDefault();e.target.setRangeText('    ',e.target.selectionStart,e.target.selectionEnd,'end');e.target.dispatchEvent(new Event('input',{bubbles:true}));}});
$('#start').onclick=()=>{state.started=Date.now();save();render();};
$('#submit').onclick=()=>{const empty=items.flatMap(q=>q.slots.map(s=>state.answers[slotId(q,s)]||'')).filter(a=>!a.trim()).length;if(!confirm(`답안을 제출할까요? 미작성 ${empty}개입니다. 제출 후 답안은 잠기고 정답과 해설이 표시됩니다.`))return;state.submitted=Date.now();save();render();$('#result').scrollIntoView({behavior:'smooth'});};
$('#reset').onclick=()=>{if(!confirm(`이 브라우저의 ${examTitle} 답안과 점수를 초기화할까요? 보관하려면 먼저 답안을 내보내세요.`))return;state={answers:{},overrides:{},started:null,submitted:null};save();render();window.scrollTo(0,0);};
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify({exam:examTitle,...state},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`모의고사${examNumber}회-답안.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
document.addEventListener('click',e=>{if(e.target.id==='wrongOnly'||e.target.id==='showAll')for(const q of items)document.getElementById('q-'+q.id).hidden=e.target.id==='wrongOnly'&&q.slots.every(s=>accepted(q,s));});
render();setInterval(timer,1000);
})();
