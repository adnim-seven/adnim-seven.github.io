(() => {
  "use strict";
  const course = window.LLM_COURSE;
  const storageKey = "ai-coding-recall-html-v2";
  let state = loadState();
  let chapterIndex = 0;
  let mcqIndex = 0;
  let subjectiveIndex = 0;
  let subjectivePool = [];
  let hintUsed = false;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const chapter = () => course.chapters[chapterIndex];
  const currentMcq = () => chapter().mcq[mcqIndex];
  const currentSubjective = () => subjectivePool[subjectiveIndex];
  const currentNotebookExam = () => window.NOTEBOOK_FULL_EXAMS?.[chapter().id];

  function loadState() {
    try { return JSON.parse(localStorage.getItem(storageKey)) || { questions: {} }; }
    catch { return { questions: {} }; }
  }
  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
    renderStats();
    renderResults();
  }
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function canonical(value) {
    return String(value || "").trim().replace(/\s+/g, "").replace(/'/g, '"');
  }
  function scoreAnswer(answer, accepted) {
    const value = canonical(answer);
    return Boolean(value) && accepted.some((item) => canonical(item) === value);
  }
  function recordAttempt(id, mode, correct, confidence, usedHint = false, errorCategory = "") {
    const item = state.questions[id] ||= { attempts: [] };
    item.attempts.push({ at: new Date().toISOString(), mode, correct, confidence, hintUsed: usedHint, errorCategory });
    const independent = item.attempts.filter((a) => a.mode === "subjective" && a.correct && !a.hintUsed);
    item.status = independent.length >= 2 ? "mastered" : independent.length === 1 ? "learned" : correct ? "recognition" : "wrong";
    const minutes = (!correct || usedHint) ? 20 : mode === "mcq" ? 1440 : independent.length === 1 ? 1440 : 10080;
    item.due = new Date(Date.now() + minutes * 60000).toISOString();
  }
  function counts(ids) {
    const result = { unseen: 0, recognition: 0, learned: 0, wrong: 0, mastered: 0 };
    ids.forEach((id) => { const status = state.questions[id]?.status || "unseen"; result[status] = (result[status] || 0) + 1; });
    return result;
  }
  function confidence(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || "애매";
  }
  function feedback(element, text, kind = "neutral") {
    element.textContent = text;
    element.className = `feedback ${kind}`;
  }

  function switchPanel(panelId) {
    $$(".mode-tab").forEach((button) => button.classList.toggle("active", button.dataset.panel === panelId));
    $$(".panel").forEach((panel) => panel.classList.toggle("active", panel.id === panelId));
    if (panelId === "resultsPanel") renderResults();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderNav() {
    $("#chapterNav").innerHTML = course.chapters.map((item, index) => {
      const c = counts(item.subjective.map((q) => q.id));
      const pastCount = item.subjective.filter((q) => q.isPastExam).length;
      return `<button class="chapter-button ${index === chapterIndex ? "active" : ""}" data-index="${index}" type="button"><span class="chapter-number">${esc(item.number)}</span><span><strong>${esc(item.title)}</strong><small>주관식 ${item.subjective.length} · 기출 ${pastCount} · 오답 ${c.wrong}</small></span></button>`;
    }).join("");
    $$(".chapter-button").forEach((button) => button.addEventListener("click", () => selectChapter(Number(button.dataset.index))));
  }

  function selectChapter(index) {
    chapterIndex = index;
    mcqIndex = 0;
    subjectivePool = chapter().subjective.slice();
    subjectiveIndex = 0;
    $("#chapterPath").textContent = `1. LLM › ${chapter().file}`;
    $("#chapterTitle").textContent = `${chapter().number} · ${chapter().title}`;
    $("#notebookGoal").textContent = `목표 · ${chapter().notebook_goal || chapter().summary}`;
    $("#capability").textContent = chapter().capability;
    $("#summary").textContent = chapter().summary;
    const fullNotebookButton = $("#fullNotebookTest");
    const hasFullNotebookExam = Boolean(currentNotebookExam());
    fullNotebookButton.disabled = !hasFullNotebookExam;
    fullNotebookButton.title = hasFullNotebookExam ? "원본 코드 전체를 보며 빈칸을 채웁니다." : "현재는 Chapter 6 전체 시험만 준비되어 있습니다.";
    fullNotebookButton.classList.toggle("is-disabled", !hasFullNotebookExam);
    renderNav();
    renderOverview();
    renderStudy();
    renderTheoryGuide();
    renderFullCode();
    renderMcq();
    renderSubjective();
    renderNotebookExam();
    renderStats();
    renderResults();
  }

  function renderOverview() {
    const data = chapter().overview || {};
    const steps = data.steps || chapter().key_points.map((point) => ({
      label: point.title,
      code: point.code.split("\n")[0],
      flow: point.flow
    }));
    const rules = data.rules || chapter().key_points.map((point) => point.watch);
    $("#notebookOverview").innerHTML = `
      <figcaption>
        <span>NOTEBOOK AT A GLANCE</span>
        <h2>${esc(data.title || chapter().title)}</h2>
        <p>${esc(data.subtitle || chapter().capability)}</p>
      </figcaption>
      <div class="overview-flow">
        ${steps.map((step, index) => `
          <article class="overview-step">
            <span class="overview-step-no">${String(index + 1).padStart(2, "0")}</span>
            <h3>${esc(step.label)}</h3>
            <code>${esc(step.code)}</code>
            <p>${esc(step.flow)}</p>
          </article>
          ${index < steps.length - 1 ? '<span class="overview-arrow" aria-hidden="true">→</span>' : ""}
        `).join("")}
      </div>
      <div class="overview-rules">
        <strong>시험장에서 복원할 규칙</strong>
        <ul>${rules.map((rule) => `<li>${esc(rule)}</li>`).join("")}</ul>
      </div>`;
  }

  function renderStudy() {
    $("#keyPoints").innerHTML = chapter().key_points.map((point, index) => `<article class="key-card"><h3>${index + 1}. ${esc(point.title)}</h3><div class="key-body"><p>${esc(point.purpose)}</p><pre class="code-box"><code>${esc(point.code)}</code></pre><div class="key-flow"><span class="mini-label">Tensor/흐름</span>${esc(point.flow)}</div><div class="key-watch"><span class="mini-label">시험 주의</span>${esc(point.watch)}</div></div></article>`).join("");
  }

  function renderTheoryGuide() {
    const guide = chapter().theory_guide || [];
    $("#theoryGuide").innerHTML = guide.map((item) => `
      <article class="theory-card">
        <h4>${esc(item.title)}</h4>
        <p>${esc(item.concept)}</p>
        <div class="theory-flow"><strong>자료 흐름</strong><code>${esc(item.flow)}</code></div>
        <dl>
          <div><dt>코드에서 찾을 신호</dt><dd>${esc(item.code_signal)}</dd></div>
          <div><dt>시험 빈칸 단서</dt><dd>${esc(item.exam_clue)}</dd></div>
        </dl>
      </article>`).join("");
  }

  function renderFullCode() {
    const cells = chapter().full_code_cells || [];
    const renderLines = (lines, kind) => lines.map((line, index) =>
      `<span class="code-line ${line.highlight ? `${kind}-diff` : ""}"><span class="line-no">${index + 1}</span><span class="line-text">${esc(line.text) || " "}</span></span>`
    ).join("");
    $("#fullCodeCells").innerHTML = cells.length ? cells.map((cell, index) => `
      <details class="code-cell" ${index === 0 ? "open" : ""}>
        <summary><span>코드 셀 ${cell.cell_number}</span><span class="blank-badge ${cell.blank_count ? "has-blank" : "no-blank"}">${cell.blank_count ? `실제 빈칸 ${cell.blank_count}줄` : "빈칸 없음"}</span></summary>
        <div class="code-compare">
          <section class="code-pane problem-pane">
            <header><strong>문제 전체 코드</strong><span>빈칸 줄</span></header>
            <pre class="code-box"><code>${renderLines(cell.problem_lines, "problem")}</code></pre>
          </section>
          <section class="code-pane answer-pane">
            <header><strong>정답 전체 코드</strong><span>채운 줄</span></header>
            <pre class="code-box"><code>${renderLines(cell.answer_lines, "answer")}</code></pre>
          </section>
        </div>
      </details>`).join("") : '<p class="empty">표시할 코드 셀이 없습니다.</p>';
    setFullCodeView(state.codeView || "problem", false);
  }

  function setFullCodeView(mode, persist = true) {
    const allowed = ["problem", "answer", "compare"];
    const selected = allowed.includes(mode) ? mode : "problem";
    const container = $("#fullCodeCells");
    if (container) {
      container.classList.remove("view-problem", "view-answer", "view-compare");
      container.classList.add(`view-${selected}`);
    }
    $$(".code-view-button").forEach((button) => {
      const active = button.dataset.codeView === selected;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (persist) {
      state.codeView = selected;
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }

  function sourceQuestion(id) {
    return chapter().subjective.find((q) => q.id === id);
  }
  function sourceContext(question) {
    if (!question) return "????";
    // 문제는 답만 떼어 보이지 않고, 답이 실제로 속한 함수·클래스 전체를 우선 보여준다.
    // scope_context에는 정답 위치만 ????로 바꾼 원본 구조가 들어간다.
    if (question.scope_context) return question.scope_context;
    if (question.problem_context) return question.problem_context;
    const source = course.cells[question.sourceId]?.source || "";
    const answer = question.answer;
    let position = -1, start = 0;
    for (let i = 0; i <= (question.occurrence || 0); i++) {
      position = source.indexOf(answer, start);
      if (position < 0) break;
      start = position + answer.length;
    }
    if (position < 0) return `${question.prompt}\n????`;
    const line = source.slice(0, position).split("\n").length - 1;
    const lines = source.split("\n");
    const answerLineCount = answer.split("\n").length;
    const first = Math.max(0, line - 4), last = Math.min(lines.length, line + answerLineCount + 4);
    return lines.slice(first, last).join("\n").replace(answer, "????");
  }

  function renderMcq() {
    const item = currentMcq();
    const source = sourceQuestion(item.source_question_id);
    $("#mcqPosition").textContent = `5지선다 ${mcqIndex + 1} / ${chapter().mcq.length}`;
    $("#mcqSource").textContent = "원본 노트북 빈칸 기반";
    $("#mcqTopic").textContent = item.topic;
    $("#mcqCode").textContent = source?.mcq_context || sourceContext(source);
    $("#mcqPrompt").textContent = item.prompt;
    $("#mcqChoices").innerHTML = item.choices.map((choice, index) => `<label class="choice"><input type="radio" name="mcqChoice" value="${index}"><span><strong>${index + 1}.</strong> <code>${esc(choice.text)}</code></span></label>`).join("");
    feedback($("#mcqFeedback"), "빈칸에 들어갈 코드를 고른 뒤 제출하세요. 제출 후 각 보기의 오류를 확인할 수 있습니다.");
  }

  function submitMcq() {
    const selected = document.querySelector('input[name="mcqChoice"]:checked');
    if (!selected) { alert("보기 하나를 선택하세요."); return; }
    const item = currentMcq();
    const answerIndex = Number(selected.value);
    const correct = answerIndex === item.answer_index;
    recordAttempt(item.id, "mcq", correct, confidence("mcqConfidence"));
    const lines = [correct ? "정답입니다." : `오답입니다. 정답은 ${item.answer_index + 1}번입니다.`, item.explanation, ""];
    item.choices.forEach((choice, index) => lines.push(`${index + 1}. ${choice.why}`));
    feedback($("#mcqFeedback"), lines.join("\n"), correct ? "correct" : "wrong");
    saveState();
  }
  function nextMcq() {
    if (mcqIndex === chapter().mcq.length - 1) { switchPanel("subjectivePanel"); return; }
    mcqIndex += 1; renderMcq();
  }

  function renderSubjective() {
    const item = currentSubjective();
    $("#subAnswer").value = "";
    hintUsed = false;
    if (!item) {
      $("#subPosition").textContent = "재시험할 오답이 없습니다.";
      $("#subSource").textContent = ""; $("#subTopic").textContent = ""; $("#subContext").textContent = "";
      $("#subPrompt").textContent = "핵심 정리 또는 5지선다를 진행하세요.";
      feedback($("#subFeedback"), "현재 조건에 해당하는 문제가 없습니다."); return;
    }
    $("#subPosition").textContent = `주관식 ${subjectiveIndex + 1} / ${subjectivePool.length}`;
    $("#subSource").textContent = item.isPastExam ? "실제 기출 · 전체 구현 복원" : item.scope_context ? "기출 유형 · 전체 구현 복원" : item.isSourceBlank ? "실제 강의 빈칸" : "원본 코드 기반";
    $("#subSource").classList.toggle("past-exam-badge", Boolean(item.isPastExam));
    $("#subTopic").textContent = item.topic;
    $("#subContext").textContent = sourceContext(item);
    $("#subPrompt").textContent = item.prompt;
    feedback($("#subFeedback"), "????에 들어갈 코드를 직접 작성하세요. 힌트를 사용한 정답은 숙달 횟수에 포함되지 않습니다.");
  }
  function showHint() {
    const item = currentSubjective(); if (!item) return;
    hintUsed = true;
    const answer = item.answer.trim();
    const lineCount = answer.split("\n").length;
    const shape = lineCount > 1 ? `${lineCount}줄 구현 블록` : answer.includes("(") ? "함수·메서드 호출 또는 생성자" : answer.includes("[") ? "인덱싱·슬라이싱" : answer.includes("=") ? "대입문" : "코드 표현식";
    feedback($("#subFeedback"), `힌트: ${shape}\n전후 변수의 dtype·shape와 다음 연산이 요구하는 입력을 확인하세요.`, "neutral");
  }
  function submitSubjective() {
    const item = currentSubjective(); if (!item) return;
    const submitted = $("#subAnswer").value;
    const correct = scoreAnswer(submitted, item.accepted_answers || [item.answer]);
    recordAttempt(item.id, "subjective", correct, confidence("subConfidence"), hintUsed, correct ? "" : $("#errorCategory").value);
    const status = state.questions[item.id].status;
    const statusText = { mastered: "숙달", learned: "주관식 1회 성공", recognition: "5지선다 확인", wrong: "오답 재시험" }[status];
    const explanation = item.explanation ? `\n\n왜 이 코드인가\n${item.explanation}` : "";
    const tensorFlow = item.tensor_flow ? `\n\nTensor 흐름\n${item.tensor_flow}` : "";
    const codeSignal = item.code_signal ? `\n\n문맥에서 찾을 신호\n${item.code_signal}` : "";
    const retry = item.retry ? `\n\n다시 풀기\n${item.retry}` : "";
    feedback($("#subFeedback"), `${correct ? "정답입니다." : "오답입니다."}\n현재 상태: ${statusText}\n\n정답\n${item.answer}${explanation}${tensorFlow}${codeSignal}${retry}`, correct ? "correct" : "wrong");
    saveState();
  }
  function nextSubjective() {
    if (!subjectivePool.length) return;
    subjectiveIndex = (subjectiveIndex + 1) % subjectivePool.length;
    renderSubjective();
  }

  function retryWrong() {
    subjectivePool = chapter().subjective.filter((q) => state.questions[q.id]?.status === "wrong");
    subjectiveIndex = 0;
    switchPanel("subjectivePanel"); renderSubjective();
  }
  function randomTest() {
    subjectivePool = chapter().subjective.slice().sort(() => Math.random() - 0.5).slice(0, 10);
    subjectiveIndex = 0;
    switchPanel("subjectivePanel"); renderSubjective();
  }
  function pastExamTest() {
    subjectivePool = chapter().subjective.filter((q) => q.isPastExam);
    subjectiveIndex = 0;
    switchPanel("subjectivePanel"); renderSubjective();
  }

  function renderNotebookExam() {
    const root = $("#notebookExamContent");
    const exam = currentNotebookExam();
    if (!exam) {
      root.innerHTML = '<div class="notebook-exam-empty"><strong>이 노트북의 전체 시험은 아직 준비 중입니다.</strong><p>현재는 Chapter 6 분류·LoRA 노트북 전체 시험을 먼저 제공합니다.</p></div>';
      return;
    }
    root.innerHTML = `
      <div class="notebook-exam-head"><span>FULL NOTEBOOK IMPLEMENTATION EXAM</span><h2>${esc(exam.title)}</h2><p>${esc(exam.file)}</p></div>
      <div class="notebook-exam-summary">${esc(exam.instruction)} · 코드 셀 ${exam.cells.length}개 · 구현 빈칸 ${exam.blanks.length}개</div>
      <div class="notebook-exam-cells">
        ${exam.cells.map((cell, index) => `<details class="notebook-exam-cell" ${index === 0 ? "open" : ""}><summary>코드 셀 ${cell.cell_number}</summary><pre class="code-box problem-code"><code>${esc(cell.source)}</code></pre></details>`).join("")}
      </div>
      <section class="notebook-exam-answers">
        <h3>빈칸 답안 제출</h3><p>각 답은 코드의 <code>[빈칸 번호]</code>와 대응합니다. 대입문 전체가 아니라 <strong>= 오른쪽 코드</strong>만 작성하세요.</p>
        ${exam.blanks.map((blank) => `<div class="full-blank"><label for="${esc(blank.id)}">빈칸 ${String(blank.number).padStart(2, "0")}</label><small>${esc(blank.prompt)}</small><textarea id="${esc(blank.id)}" class="answer-input" data-full-blank="${esc(blank.id)}" spellcheck="false" placeholder="오른쪽 코드 또는 표현식"></textarea></div>`).join("")}
        <div class="question-controls"><fieldset class="confidence"><legend>확신도</legend><label><input name="fullConfidence" type="radio" value="확실">확실</label><label><input name="fullConfidence" type="radio" value="애매" checked>애매</label><label><input name="fullConfidence" type="radio" value="추측">추측</label></fieldset><div><button id="submitNotebookExam" class="primary-button" type="button">전체 시험 제출</button></div></div>
        <div id="notebookExamFeedback" class="feedback neutral notebook-exam-feedback" aria-live="polite">전체 코드의 전후 흐름을 단서로 답안을 작성하세요.</div>
      </section>`;
    $("#submitNotebookExam").addEventListener("click", submitNotebookExam);
  }

  function submitNotebookExam() {
    const exam = currentNotebookExam();
    if (!exam) return;
    const level = confidence("fullConfidence");
    const results = exam.blanks.map((blank) => {
      const submitted = document.querySelector(`[data-full-blank="${blank.id}"]`)?.value || "";
      const correct = scoreAnswer(submitted, [blank.answer]);
      recordAttempt(`full-${exam.chapterId}-${blank.id}`, "full-notebook", correct, level, false, correct ? "" : "전체 노트북 구현");
      return { blank, correct };
    });
    const correctCount = results.filter((item) => item.correct).length;
    const details = results.map(({ blank, correct }) => correct
      ? `빈칸 ${String(blank.number).padStart(2, "0")}: 정답`
      : `빈칸 ${String(blank.number).padStart(2, "0")}: 오답\n정답 = ${blank.answer}`).join("\n\n");
    feedback($("#notebookExamFeedback"), `${correctCount}/${results.length}개 정답\n\n${details}`, correctCount === results.length ? "correct" : "wrong");
    saveState();
  }

  function renderStats() {
    const ids = chapter().subjective.map((q) => q.id);
    const c = counts(ids);
    $("#headlineStats").textContent = `숙달 ${c.mastered} · 학습 ${c.learned} · 오답 ${c.wrong} · 주관식 ${ids.length}`;
    const completed = c.mastered + c.learned;
    const percent = Math.round(completed / ids.length * 100);
    $("#chapterProgressText").textContent = `주관식 학습 ${completed}/${ids.length} (${percent}%)`;
    $("#chapterProgressBar").style.width = `${percent}%`;
    renderNav();
  }
  function renderResults() {
    const allSubjective = course.chapters.flatMap((c) => c.subjective);
    const allMcq = course.chapters.flatMap((c) => c.mcq);
    const c = counts(allSubjective.map((q) => q.id));
    const mcqAttempted = allMcq.filter((q) => state.questions[q.id]?.attempts?.length).length;
    const mcqCorrect = allMcq.filter((q) => state.questions[q.id]?.attempts?.some((a) => a.correct)).length;
    $("#resultCards").innerHTML = [[`${mcqCorrect}/${mcqAttempted}`,"5지선다 정답/응시"],[c.mastered,"주관식 숙달"],[c.learned,"주관식 1회 성공"],[c.wrong,"오답 재시험"]].map(([n,t]) => `<article class="result-card"><strong>${n}</strong><span>${t}</span></article>`).join("");
    $("#resultRows").innerHTML = course.chapters.map((ch) => {
      const sub = counts(ch.subjective.map((q) => q.id));
      const tried = ch.mcq.filter((q) => state.questions[q.id]?.attempts?.length).length;
      const right = ch.mcq.filter((q) => state.questions[q.id]?.attempts?.some((a) => a.correct)).length;
      return `<tr><td>${esc(ch.number)} ${esc(ch.title)}</td><td>${right}/${tried}</td><td>${sub.mastered}</td><td>${sub.learned}</td><td>${sub.wrong}</td><td>${sub.unseen}</td></tr>`;
    }).join("");
    const errors = {};
    Object.values(state.questions).forEach((item) => item.attempts?.forEach((a) => { if (!a.correct && a.errorCategory) errors[a.errorCategory] = (errors[a.errorCategory] || 0) + 1; }));
    const max = Math.max(1, ...Object.values(errors));
    $("#errorBreakdown").innerHTML = Object.keys(errors).length ? Object.entries(errors).sort((a,b) => b[1]-a[1]).map(([name,value]) => `<div class="error-bar"><div><span>${esc(name)}</span><strong>${value}회</strong></div><div><i style="width:${value/max*100}%"></i></div></div>`).join("") : '<p class="empty">아직 기록된 오답이 없습니다.</p>';
  }

  $$(".mode-tab,.next-mode").forEach((button) => button.addEventListener("click", () => switchPanel(button.dataset.panel)));
  $$(".code-view-button").forEach((button) => button.addEventListener("click", () => setFullCodeView(button.dataset.codeView)));
  $("#submitMcq").addEventListener("click", submitMcq);
  $("#nextMcq").addEventListener("click", nextMcq);
  $("#showHint").addEventListener("click", showHint);
  $("#submitSubjective").addEventListener("click", submitSubjective);
  $("#nextSubjective").addEventListener("click", nextSubjective);
  $("#retryWrong").addEventListener("click", retryWrong);
  $("#randomTest").addEventListener("click", randomTest);
  $("#pastExamTest").addEventListener("click", pastExamTest);
  $("#fullNotebookTest").addEventListener("click", () => {
    if (!currentNotebookExam()) return;
    switchPanel("notebookExamPanel");
    renderNotebookExam();
  });
  $("#collapseCode").addEventListener("click", () => {
    const cells = $$("#fullCodeCells details");
    const shouldOpen = cells.length > 0 && cells.every((cell) => !cell.open);
    cells.forEach((cell) => { cell.open = shouldOpen; });
    $("#collapseCode").textContent = shouldOpen ? "모두 접기" : "모두 펼치기";
  });
  $("#resetProgress").addEventListener("click", () => { if (confirm("이 HTML의 학습 기록을 모두 지울까요?")) { state = { questions: {} }; saveState(); selectChapter(0); } });

  subjectivePool = chapter().subjective.slice();
  selectChapter(0);
})();
