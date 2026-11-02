(() => {
  'use strict';
  const questions=window.OCTOBER_RECALL||[],KEY='ai-specialist-october-recall-v1';
  const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const id=(q,s)=>q.id+'-'+s.key;
  let state={answers:{},results:{},history:{},lastStatus:''},current=questions[0]?.id,wrongFilter=false;
  try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&typeof saved==='object'){for(const key of ['answers','results','history'])if(saved[key]&&typeof saved[key]==='object'&&!Array.isArray(saved[key]))state[key]=saved[key];if(typeof saved.lastStatus==='string')state.lastStatus=saved.lastStatus;}}catch{}
  function value(q,s){const answer=state.answers[id(q,s)];return typeof answer==='string'?answer:'';}
  function activeResult(q,s){const r=state.results[id(q,s)];return r&&r.answer===value(q,s)&&value(q,s).trim()?r:null;}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));$('#saved').textContent='답안·이력 자동 저장됨';}catch{$('#saved').textContent='저장 불가 — 내보내기로 보관하세요.';}}
  function fit(input){input.style.height='auto';input.style.height=input.scrollHeight+'px';}
  function feedback(q,s){const r=activeResult(q,s);if(!r)return '';return `<strong class="${r.correct?'status-correct':'status-wrong'}">${r.correct?'정답':'오답'}${r.manual?' · 직접 인정':''}</strong><code class="answer-code">${esc(s.answer)}</code><span class="blank-why">${esc(s.why)}</span><label class="credit"><input type="checkbox" data-credit="${id(q,s)}" ${r.correct?'checked':''}> 다른 표현이지만 같은 기능이면 직접 인정</label>`;}
  function summary(){let correct=0,wrong=0;for(const q of questions)for(const s of q.slots){const r=activeResult(q,s);if(r)(r.correct?correct++:wrong++);}const total=questions.reduce((n,q)=>n+q.slots.length,0),graded=correct+wrong;$('#summary').textContent=`정답 ${correct} · 오답 ${wrong} · 미채점 ${total-graded} · 정답률 ${graded?Math.round(correct/graded*100):0}% (채점한 ${graded}개 기준)`;}
  function historyText(q){let attempts=0,wrong=0;for(const s of q.slots){const h=state.history[id(q,s)];attempts+=Number(h?.attempts)||0;wrong+=Number(h?.wrong)||0;}return `누적 채점 ${attempts}회 · 오답 이력 ${wrong}회`;}
  function slot(q,s){const r=activeResult(q,s);return `<span class="blank-card"><label class="blank-task" for="${id(q,s)}">[${s.key}] 실제 기출 · ${esc(s.task)}</label><textarea id="${id(q,s)}" data-answer="${id(q,s)}" data-question="${q.id}" aria-label="${q.title} ${s.key} 답안" rows="1" spellcheck="false" autocapitalize="off" autocomplete="off" class="${r?(r.correct?'correct':'wrong'):''}">${esc(value(q,s))}</textarea><span class="blank-feedback" data-feedback="${id(q,s)}" aria-live="polite">${feedback(q,s)}</span></span>`;}
  function render(){
    const subjects=[...new Set(questions.map(q=>q.subject))];
    $('#subjectNav').innerHTML=subjects.map(sub=>{const qs=questions.filter(q=>q.subject===sub);return `<a href="#q-${qs[0].id}" data-subject="${esc(sub)}">${esc(sub)} · ${qs.reduce((n,q)=>n+q.slots.length,0)}칸</a>`;}).join('');
    const shown=questions.filter(q=>!wrongFilter||q.slots.some(s=>(Number(state.history[id(q,s)]?.wrong)||0)>0));
    $('#questions').innerHTML=shown.map(q=>`<article id="q-${q.id}" data-question-card="${q.id}"><div class="meta">${esc(q.source)}</div><h2>${esc(q.title)} · ${q.slots.length}칸</h2><p>${esc(q.prompt)}</p><details class="source-info" open><summary>제공 정보 · 인자 출처</summary><ul>${q.argument_sources.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><strong>조건</strong><ul>${q.preconditions.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></details><pre class="code-context">${esc(q.code).replace(/\{\{([A-Z])\}\}/g,(_,key)=>slot(q,q.slots.find(s=>s.key===key)))}</pre><div class="question-actions"><button data-grade-question="${q.id}">이 문제 작성 답안 채점</button><span class="history-count">${historyText(q)}</span></div>${q.slots.every(s=>activeResult(q,s))?`<details class="solution"><summary>채점 후 완성 코드 보기</summary><pre class="full-code">${esc(q.completed_code)}</pre></details>`:''}</article>`).join('')||'<p class="empty-filter">아직 틀린 이력이 없습니다. 전체 문제로 돌아가 풀어보세요.</p>';
    document.querySelectorAll('textarea[data-answer]').forEach(fit);summary();if(state.lastStatus)$('#lastResult').textContent=state.lastStatus;
  }
  function grade(list){
    const active=document.activeElement,focusId=active?.id,position=active?.selectionStart,scroll=window.scrollY;
    let correct=0,wrong=0,skipped=0;const wrongNames=[];
    for(const q of list)for(const s of q.slots){
      const answer=value(q,s),key=id(q,s);if(!answer.trim()){skipped++;continue;}
      const previous=state.results[key],manual=!!(previous?.manual&&previous.answer===answer),matches=manual?previous.correct:window.ExamAnswer.isCorrect(answer,s.answer,s.alternatives||[]),now=new Date().toISOString();
      state.results[key]={answer,correct:matches,at:now,manual};
      // An unchanged button press is not a new learning attempt.
      if(!previous||previous.answer!==answer){const h=state.history[key]||{};state.history[key]={attempts:(Number(h.attempts)||0)+1,wrong:(Number(h.wrong)||0)+(matches?0:1),events:[...(Array.isArray(h.events)?h.events:[]),{answer,correct:matches,at:now}].slice(-100)};}
      if(matches)correct++;else{wrong++;wrongNames.push(q.subject+' '+q.title+' ['+s.key+']');}
    }
    state.lastStatus=`최근 채점: 정답 ${correct} · 오답 ${wrong} · 빈 답안 ${skipped}개 제외${wrongNames.length?' | 오답: '+wrongNames.join(', '):''}`;save();render();
    if(focusId){const input=document.getElementById(focusId);if(input){input.focus({preventScroll:true});if(typeof input.setSelectionRange==='function')input.setSelectionRange(position,position);}}window.scrollTo(0,scroll);
  }
  function visibleQuestions(){return questions.filter(q=>document.getElementById('q-'+q.id));}
  function navigate(direction){const shown=visibleQuestions();if(!shown.length)return;let index=shown.findIndex(q=>q.id===current);if(index<0)index=0;index=Math.max(0,Math.min(shown.length-1,index+direction));current=shown[index].id;document.getElementById('q-'+current).scrollIntoView({behavior:'smooth',block:'start'});}
  document.addEventListener('input',e=>{const key=e.target.dataset?.answer;if(!key)return;state.answers[key]=e.target.value;current=e.target.dataset.question;fit(e.target);const q=questions.find(q=>q.id===current),s=q.slots.find(s=>id(q,s)===key);e.target.classList.remove('correct','wrong');const r=activeResult(q,s);if(r)e.target.classList.add(r.correct?'correct':'wrong');document.querySelector(`[data-feedback="${key}"]`).innerHTML=feedback(q,s);const solution=e.target.closest('article').querySelector('.solution');if(solution&&!q.slots.every(s=>activeResult(q,s)))solution.remove();summary();save();});
  document.addEventListener('focusin',e=>{if(e.target.dataset?.question)current=e.target.dataset.question;});
  document.addEventListener('change',e=>{const key=e.target.dataset?.credit;if(!key)return;const r=state.results[key];if(!r)return;r.correct=e.target.checked;r.manual=true;save();render();});
  document.addEventListener('click',e=>{const button=e.target.closest('button');if(button?.dataset.gradeQuestion){current=button.dataset.gradeQuestion;grade(questions.filter(q=>q.id===current));}const link=e.target.closest('[data-subject]');if(link){wrongFilter=false;render();current=questions.find(q=>q.subject===link.dataset.subject).id;document.getElementById('q-'+current).scrollIntoView({behavior:'smooth'});}});
  document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.key==='Enter'){e.preventDefault();grade(questions.filter(q=>q.id===(e.target.dataset?.question||current)));}if(e.key==='Tab'&&e.target.matches('textarea[data-answer]')){e.preventDefault();e.target.setRangeText('    ',e.target.selectionStart,e.target.selectionEnd,'end');e.target.dispatchEvent(new Event('input',{bubbles:true}));}});
  $('#gradeAll').onclick=()=>grade(questions);$('#gradeCurrent').onclick=()=>grade(questions.filter(q=>q.id===current));
  $('#previous').onclick=()=>navigate(-1);$('#next').onclick=()=>navigate(1);
  $('#showAll').onclick=()=>{wrongFilter=false;render();};$('#reviewWrong').onclick=()=>{wrongFilter=true;render();};
  $('#reset').onclick=()=>{if(!confirm('현재 입력과 채점 표시를 비울까요? 누적 오답 이력은 보존합니다.'))return;state.answers={};state.results={};state.lastStatus='새로 풀기 시작 · 기존 오답 이력은 보존됨';save();render();};
  $('#export').onclick=()=>{const blob=new Blob([JSON.stringify({exam:'10월 실제 기출 복원',exportedAt:new Date().toISOString(),...state},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='10월-기출복원-답안과오답이력.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  render();
})();
