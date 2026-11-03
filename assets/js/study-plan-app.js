(() => {
 'use strict';
 const plan=window.STUDY_PLAN,core=window.StudyPlanCore,KEY='ai-specialist-study-plan-2026-11-17-v1';
 const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let completed={},filter='all',today=core.dateKey(),midnightTimer;
 try{completed=core.normalize(JSON.parse(localStorage.getItem(KEY)),plan.days);}catch{}
 const dateLabel=date=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'long',day:'numeric',weekday:'short'}).format(new Date(date+'T03:00:00Z'));
 const phaseLabel={learn:'전체 핵심 1회독',practice:'기출·오답',exam:'시험 전 확인'};
 function focusDay(){return plan.days.find(d=>d.date===today)||plan.days.find(d=>d.date>today&&!completed[d.date])||plan.days.at(-1);}
 function cards(){
  $('#days').innerHTML=plan.days.map(d=>`<article class="day-card ${d.phase}" data-day="${d.date}"><div class="day-top"><span class="date-label">${esc(dateLabel(d.date))}</span><span class="time-label">${esc(d.timeLabel)}</span></div><div class="day-badges"><span class="badge">${esc(d.subject)} · ${phaseLabel[d.phase]}</span><span class="badge state" data-state="${d.date}"></span></div><h3>${esc(d.title)}</h3><p class="day-range">${esc(d.range)}</p><p class="review-line"><strong>${d.phase==='learn'?'시작 20분 복습':'누적 복습 연결'}:</strong> ${esc(d.review)}</p><details class="day-details"><summary>구현 목표 · 완료 기준 · 노트북 보기</summary><div><h4>직접 구현할 부분 / 진행 방식</h4><p>${esc(d.target)}</p><h4>오늘의 완료 기준</h4><p>${esc(d.completion)}</p>${d.priority?`<p class="priority">${esc(d.priority)}</p>`:''}${d.notebooks.length?`<h4>원본 노트북 · 과목 페이지에서 해당 챕터 선택</h4><ul class="notebook-list">${d.notebooks.map(n=>`<li>${esc(n.split('/').at(-1))}</li>`).join('')}</ul>`:''}</div></details><nav class="day-links" aria-label="${esc(dateLabel(d.date))} 학습 링크">${d.links.map(l=>`<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</nav><label class="done-check" for="done-${d.date}"><input type="checkbox" id="done-${d.date}" data-complete="${d.date}">오늘 범위 완료</label></article>`).join('');
 }
 function update(){
  today=core.dateKey();
  const stat=core.stats(plan.days,completed),delta=core.daysUntil(today,plan.examDate),focus=focusDay();
  $('#countdown').textContent=delta>0?`시험까지 D-${delta} · 한국 시간 기준`:delta===0?'오늘은 시험일입니다':'예정된 시험일이 지났습니다';
  $('#focusTitle').textContent=(today===focus.date?'오늘':today<plan.startDate?'첫 학습':'확인할 일정')+' · '+dateLabel(focus.date)+' · '+focus.title;
  $('#focusDescription').textContent=today>plan.examDate?'완료 체크와 전체 일정을 다시 확인할 수 있습니다.':focus.range;
  $('#progressText').textContent=`${stat.done} / ${stat.total}일 완료 · ${stat.percent}%`;
  $('#progressBar').value=stat.done;
  $('#phaseProgress').textContent=`내용 공부 ${stat.learn}/10 · 기출·오답 ${stat.practice}/3 · 시험 전 ${stat.exam}/1`;
  for(const d of plan.days){const card=document.querySelector(`[data-day="${d.date}"]`),status=core.status(d.date,today,completed[d.date]);card.classList.toggle('done',status==='done');card.classList.toggle('today',d.date===today);card.classList.toggle('overdue',status==='overdue');card.hidden=filter!=='all'&&d.phase!==filter;document.getElementById('done-'+d.date).checked=!!completed[d.date];card.querySelector('[data-state]').textContent=(d.date===today&&status==='done'?'오늘 · ':'')+({done:'완료',today:'오늘',overdue:'미완료',upcoming:'예정'}[status]);}
  document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
 }
 function save(){try{localStorage.setItem(KEY,JSON.stringify({completed,updatedAt:new Date().toISOString()}));$('#storageStatus').textContent='완료 체크 저장됨 · 이 브라우저에만 저장되며 기기 간 자동 동기화되지 않습니다.';$('#storageStatus').classList.remove('warning');}catch{$('#storageStatus').textContent='브라우저 저장 불가 — 현재 화면에는 반영되지만 새로고침하면 체크가 사라질 수 있습니다.';$('#storageStatus').classList.add('warning');}}
 document.addEventListener('change',e=>{const date=e.target.dataset?.complete;if(!date||!plan.days.some(d=>d.date===date))return;if(e.target.checked)completed[date]=true;else delete completed[date];save();update();});
 document.addEventListener('click',e=>{const button=e.target.closest('[data-filter]');if(button){filter=button.dataset.filter;update();}});
 $('#goToday').onclick=()=>{filter='all';update();const card=document.querySelector(`[data-day="${focusDay().date}"]`);card.scrollIntoView({behavior:'smooth',block:'start'});};
 $('#resetProgress').onclick=()=>{if(!confirm('이 일정표의 완료 체크만 초기화할까요? 시험 답안·오답 이력은 변경하지 않습니다.'))return;completed={};save();update();};
 window.addEventListener('storage',e=>{if(e.key!==KEY)return;try{completed=core.normalize(JSON.parse(e.newValue),plan.days);update();}catch{}});
 function scheduleDateRefresh(){clearTimeout(midnightTimer);const dayMs=86400000,untilMidnight=dayMs-((Date.now()+9*3600000)%dayMs);midnightTimer=setTimeout(()=>{update();scheduleDateRefresh();},untilMidnight+50);}
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){update();scheduleDateRefresh();}});
 cards();update();scheduleDateRefresh();
})();
