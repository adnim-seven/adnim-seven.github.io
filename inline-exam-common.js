(() => {
  const course = window.LLM_COURSE, exams = window.INLINE_EXAM_MAP;
  if (!course || !exams) return;
  const $ = (s) => document.querySelector(s), esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const canonical = (v) => String(v || "").trim().replace(/\s+/g, "").replace(/'/g, '"');
  let view = "exam", blankIndex = 0, renderTimer = null;
  const pathFile = () => ($("#chapterPath")?.textContent || "").split("›").pop().trim();
  const current = () => {
    const base = exams[pathFile()];
    const patch = window.INLINE_EXAM_OVERRIDES?.[pathFile()];
    if (!base || !patch) return base;
    return {
      ...base,
      cells: base.cells.map((cell) => {
        const edits = (patch.replacements || []).filter((edit) => edit.cell === cell.number);
        if (!edits.length) return cell;
        let source = cell.source;
        edits.forEach((edit) => { source = source.replace(edit.from, `[[BLANK:${edit.id}]]`); });
        return {...cell, source};
      }),
      blanks: [...base.blanks, ...(patch.blanks || [])],
    };
  };
  const panel = document.createElement("section");
  panel.id = "inlineExamPanel"; panel.className = "panel inline-exam-panel";
  document.querySelector(".workspace").append(panel);
  const tab = document.createElement("button");
  tab.className = "mode-tab"; tab.type = "button"; tab.dataset.panel = "inlineExamPanel"; tab.textContent = "인라인 시험";
  document.querySelector(".mode-tabs").append(tab);
  const show = () => {
    document.querySelectorAll(".mode-tab").forEach(b => b.classList.toggle("active", b === tab));
    document.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p === panel));
    // RAG처럼 코드 셀이 많은 노트북은 클릭 이벤트 안에서 전부 그리면 멈춘 것처럼 보인다.
    // 탭을 먼저 연 뒤, 다음 화면 갱신에서 코드를 그린다.
    panel.innerHTML = '<div class="inline-exam-head"><span>INLINE IMPLEMENTATION EXAM</span><h2>시험 코드를 준비하고 있습니다…</h2></div>';
    window.scrollTo(0, 0);
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(() => { renderTimer = null; render(); }, 0);
  };
  tab.addEventListener("click", show);
  document.querySelectorAll("#chapterNav").forEach(nav => nav.addEventListener("click", () => setTimeout(() => { if (panel.classList.contains("active")) { blankIndex=0; render(); } }, 0)));
  const check = (id) => { const exam=current(), blank=exam?.blanks.find(x=>x.id===id), input=document.querySelector(`[data-inline-answer="${id}"]`); if(!blank || !input?.value.trim()) return; const correct=canonical(input.value)===canonical(blank.answer), feedback=$("#inline-feedback-"+id); input.classList.toggle("correct",correct); input.classList.toggle("wrong",!correct); feedback.className=`inline-answer-feedback ${correct?"correct":"wrong"}`; feedback.textContent=correct?"정답입니다.":`오답입니다. 정답: ${blank.answer}`; status(); };
  const status = () => { const exam=current(), target=$("#inlineExamStatus"); if(!exam||!target)return; const answers=exam.blanks.map(b=>document.querySelector(`[data-inline-answer="${b.id}"]`)?.value||""); const filled=answers.filter(x=>x.trim()).length, right=answers.filter((a,i)=>canonical(a)===canonical(exam.blanks[i].answer)).length; target.textContent=`문제 ${blankIndex+1}/${exam.blanks.length} · 작성 ${filled}개 · 현재 정답 ${right}개`; };
  const focus = (index) => { const exam=current(); if(!exam?.blanks.length)return; blankIndex=(index+exam.blanks.length)%exam.blanks.length; const input=document.querySelector(`[data-inline-answer="${exam.blanks[blankIndex].id}"]`); if(input){input.focus({preventScroll:true});input.closest(".inline-code-cell")?.scrollIntoView({behavior:"smooth",block:"center"});}status(); };
  function render(){ const exam=current(); if(!exam){panel.innerHTML='<div class="inline-exam-head"><span>INLINE IMPLEMENTATION EXAM</span><h2>이 챕터는 인라인 시험 자료를 준비 중입니다.</h2><p>독립 인라인 주관식 시험에서 다른 노트북을 선택할 수 있습니다.</p></div>';return;} const input=b=>`<span class="inline-answer-wrap"><textarea class="inline-answer-input" data-inline-answer="${esc(b.id)}" rows="1" spellcheck="false" placeholder="코드 입력"></textarea><span id="inline-feedback-${esc(b.id)}" class="inline-answer-feedback" aria-live="polite"></span></span>`; const shown=view==="notebook"?exam.cells:exam.cells.filter(c=>c.type==="code"); const cells=shown.map(c=>{if(c.type!=="code")return `<section class="inline-markdown-cell"><div class="cell-title">원본 Notebook Cell ${c.number} · 설명</div><div class="inline-markdown-source">${esc(window.INLINE_MARKDOWN_KO?.[pathFile()]?.[c.number] || c.source)||"(빈 마크다운 셀)"}</div></section>`;let source=esc(c.source), blanks=exam.blanks.filter(b=>c.source.includes(`[[BLANK:${b.id}]]`));blanks.forEach(b=>source=source.replace(`[[BLANK:${b.id}]]`,input(b)));return `<section class="inline-code-cell"><div class="cell-title">코드 Cell ${c.code_number} · 원본 Notebook Cell ${c.number}</div><pre class="code-box"><code>${source}</code></pre>${blanks.map(b=>`<div class="inline-check-row"><strong>${esc(b.label)}</strong><button class="quiet-button" data-inline-check="${esc(b.id)}" type="button">채점</button></div>`).join("")}</section>`;}).join(""); panel.innerHTML=`<div class="inline-exam-head"><span>INLINE IMPLEMENTATION EXAM</span><h2>${esc((course.chapters.find(c=>c.file===pathFile())||{}).title||"인라인 시험")}</h2><p>${view==="notebook"?"설명 마크다운과 코드 셀을 원본 순서대로 봅니다.":"전체 코드의 빈칸에 직접 작성하고, 해당 위치 아래에서 바로 채점합니다."}</p></div><div class="inline-exam-controls"><button class="quiet-button ${view==="exam"?"active":""}" data-inline-view="exam" type="button">인라인 시험</button><button class="quiet-button ${view==="notebook"?"active":""}" data-inline-view="notebook" type="button">풀 노트북 보기</button></div><div class="inline-code-cells">${cells}</div><div class="inline-fixed-bar"><div class="inline-fixed-inner"><span id="inlineExamStatus"></span><div><button id="prevInline" class="quiet-button" type="button">이전 문제</button><button id="nextInline" class="quiet-button" type="button">다음 문제</button><button id="checkAllInline" class="primary-button" type="button">모든 빈칸 채점</button></div></div></div>`; panel.querySelectorAll("[data-inline-answer]").forEach(e=>{const resize=()=>{e.style.height="auto";e.style.height=e.scrollHeight+"px"};e.addEventListener("input",()=>{e.classList.remove("correct","wrong");resize();status()});e.addEventListener("focus",()=>{blankIndex=exam.blanks.findIndex(b=>b.id===e.dataset.inlineAnswer);status()});e.addEventListener("keydown",ev=>{if(ev.ctrlKey&&ev.key==="Enter"){ev.preventDefault();check(e.dataset.inlineAnswer)}});resize()});panel.querySelectorAll("[data-inline-check]").forEach(b=>b.addEventListener("click",()=>check(b.dataset.inlineCheck)));panel.querySelectorAll("[data-inline-view]").forEach(b=>b.addEventListener("click",()=>{view=b.dataset.inlineView;render()}));$("#prevInline").addEventListener("click",()=>focus(blankIndex-1));$("#nextInline").addEventListener("click",()=>focus(blankIndex+1));$("#checkAllInline").addEventListener("click",()=>exam.blanks.forEach(b=>check(b.id)));status(); }
})();
