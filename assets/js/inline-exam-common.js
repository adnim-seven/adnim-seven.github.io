(() => {
  const course = window.LLM_COURSE;
  const exams = window.INLINE_EXAM_MAP || window.LLM_INLINE_EXAMS;
  if (!course || !exams) return;
  const $ = (s) => document.querySelector(s), esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const canonical = (v) => String(v || "").trim().replace(/\s+/g, "").replace(/'/g, '"');
  const isCorrectInline = (val, ans) => {
    const u = canonical(val).replace(/,+$/, ""), a = canonical(ans).replace(/,+$/, "");
    if (u === a) return true;
    // TimeSeries enc_dec & RNNRNN variants
    const normTs = (s) => s.replace(/\\/g, "").replace(/^(features|labels|predictions)\.append\((.*)\)$/, "$2").replace(/^(h|input|outputs|out,h|[a-zA-Z0-9_.]+)=/, "");
    if (normTs(u) === normTs(a)) return true;
    if (a === "x=attn(x)+x" && (u === "x=x+attn(x)" || u === "attn(x)+x" || u === "x+attn(x)")) return true;
    if (a === "x=ff(x)+x" && (u === "x=x+ff(x)" || u === "ff(x)+x" || u === "x+ff(x)")) return true;
    if (a === "round(num_channels*sparsity)" && (u === "num_pruned_channels=round(num_channels*sparsity)" || u === "int(round(num_channels*sparsity))" || u === "round(weight.shape[1]*sparsity)")) return true;
    if (a === "weight.abs().sum(dim=(0,2,3),keepdim=True)" && (u === "importance=weight.abs().sum(dim=(0,2,3),keepdim=True)" || u === "torch.abs(weight).sum(dim=(0,2,3),keepdim=True)" || u === "importance=torch.abs(weight).sum(dim=(0,2,3),keepdim=True)" || u === "torch.sum(torch.abs(weight),dim=(0,2,3),keepdim=True)" || u === "torch.sum(weight.abs(),dim=(0,2,3),keepdim=True)" || u === "weight.abs().sum(dim=[0,2,3],keepdim=True)")) return true;
    return false;
  };
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

  let panel = document.querySelector("#inlineExamPanel") || document.querySelector("#notebookExamPanel");
  if (!panel) {
    panel = document.createElement("section");
    panel.id = "inlineExamPanel";
    panel.className = "panel inline-exam-panel";
    const workspace = document.querySelector(".workspace") || document.body;
    workspace.append(panel);
  } else {
    panel.classList.add("inline-exam-panel");
  }

  const tabsWrap = document.querySelector(".mode-tabs");
  let tab = tabsWrap?.querySelector('[data-panel="inlineExamPanel"]') || tabsWrap?.querySelector('[data-panel="notebookExamPanel"]');
  if (!tab && tabsWrap) {
    tab = document.createElement("button");
    tab.className = "mode-tab";
    tab.type = "button";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", "false");
    tab.dataset.panel = panel.id;
    tab.textContent = "5. 인라인 시험";
    const resultsTab = tabsWrap.querySelector('[data-panel="resultsPanel"]');
    if (resultsTab) tabsWrap.insertBefore(tab, resultsTab); else tabsWrap.append(tab);
  }

  const syncSidebar = () => {
    const nav = $("#inlineSidebarNav");
    if (!nav) return;
    const active = panel.classList.contains("active");
    nav.hidden = !active;
    if (active) {
      nav.querySelectorAll("[data-inline-side-view]").forEach(b => b.classList.toggle("active", b.dataset.inlineSideView === view));
    }
  };

  const show = () => {
    document.querySelectorAll(".mode-tab").forEach(b => {
      const active = b === tab || b.dataset.panel === panel.id;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p === panel));
    syncSidebar();
    panel.innerHTML = '<div class="inline-exam-head"><span>INLINE IMPLEMENTATION EXAM</span><h2>시험 코드를 준비하고 있습니다…</h2></div>';
    window.scrollTo(0, 0);
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(() => { renderTimer = null; render(); }, 0);
  };

  if (tab) tab.addEventListener("click", show);

  // 사이드바 "현재 노트북 인라인 시험" 버튼 연결
  const sideTestBtn = $("#fullNotebookTest");
  if (sideTestBtn) {
    sideTestBtn.addEventListener("click", show);
  }

  // 사이드바 인라인 메뉴 이벤트 연결
  document.querySelectorAll("[data-inline-side-view]").forEach(b => {
    b.addEventListener("click", () => {
      view = b.dataset.inlineSideView;
      render();
      syncSidebar();
    });
  });
  const sideFirstBtn = $("#inlineSideFirst");
  if (sideFirstBtn) {
    sideFirstBtn.addEventListener("click", () => focus(0));
  }

  // 챕터 변경 시 인라인 시험 리셋 및 렌더링
  document.querySelectorAll("#chapterNav").forEach(nav => {
    nav.addEventListener("click", () => setTimeout(() => {
      syncSidebar();
      if (panel.classList.contains("active")) {
        blankIndex = 0;
        render();
      }
    }, 0));
  });

  // 다른 탭 클릭 시 사이드바 동기화
  document.querySelectorAll(".mode-tab").forEach(b => {
    if (b !== tab) {
      b.addEventListener("click", () => setTimeout(syncSidebar, 0));
    }
  });

  const check = (id) => {
    const exam = current(), blank = exam?.blanks.find(x => x.id === id), input = document.querySelector(`[data-inline-answer="${id}"]`);
    if (!blank || !input?.value.trim()) return;
    const correct = isCorrectInline(input.value, blank.answer);
    const feedback = $("#inline-feedback-" + id);
    input.classList.toggle("correct", correct);
    input.classList.toggle("wrong", !correct);
    if (feedback) {
      feedback.className = `inline-answer-feedback ${correct ? "correct" : "wrong"}`;
      feedback.textContent = correct ? "정답입니다." : `오답입니다. 정답: ${blank.answer}`;
    }
    status();
  };

  const status = () => {
    const exam = current(), target = $("#inlineExamStatus");
    if (!exam || !target) return;
    const answers = exam.blanks.map(b => document.querySelector(`[data-inline-answer="${b.id}"]`)?.value || "");
    const filled = answers.filter(x => x.trim()).length;
    const right = answers.filter((a, i) => isCorrectInline(a, exam.blanks[i].answer)).length;
    target.textContent = `문제 ${blankIndex + 1}/${exam.blanks.length} · 작성 ${filled}개 · 현재 정답 ${right}개`;
  };

  const focus = (index) => {
    const exam = current();
    if (!exam?.blanks.length) return;
    blankIndex = (index + exam.blanks.length) % exam.blanks.length;
    const input = document.querySelector(`[data-inline-answer="${exam.blanks[blankIndex].id}"]`);
    if (input) {
      input.focus({preventScroll: true});
      input.closest(".inline-code-cell")?.scrollIntoView({behavior: "smooth", block: "center"});
    }
    status();
  };

  function render() {
    const exam = current();
    syncSidebar();
    if (!exam) {
      panel.innerHTML = '<div class="inline-exam-head"><span>INLINE IMPLEMENTATION EXAM</span><h2>이 챕터는 인라인 시험 자료를 준비 중입니다.</h2><p>독립 인라인 주관식 시험에서 다른 노트북을 선택할 수 있습니다.</p></div>';
      return;
    }
    const input = b => `<span class="inline-answer-wrap"><textarea class="inline-answer-input" data-inline-answer="${esc(b.id)}" rows="1" spellcheck="false" placeholder="코드 입력"></textarea><span id="inline-feedback-${esc(b.id)}" class="inline-answer-feedback" aria-live="polite"></span></span>`;
    const shown = view === "notebook" ? exam.cells : exam.cells.filter(c => c.type === "code");
    const cells = shown.map(c => {
      if (c.type !== "code") {
        return `<section class="inline-markdown-cell"><div class="cell-title">원본 Notebook Cell ${c.number} · 설명</div><div class="inline-markdown-source">${esc(window.INLINE_MARKDOWN_KO?.[pathFile()]?.[c.number] || c.source) || "(빈 마크다운 셀)"}</div></section>`;
      }
      let source = esc(c.source);
      const blanks = exam.blanks.filter(b => c.source.includes(`[[BLANK:${b.id}]]`));
      blanks.forEach(b => source = source.replace(`[[BLANK:${b.id}]]`, `# TODO: ${esc(b.instruction || b.label)}\n${input(b)}`));
      return `<section class="inline-code-cell"><div class="cell-title">코드 Cell ${c.code_number} · 원본 Notebook Cell ${c.number}</div><pre class="code-box"><code>${source}</code></pre>${blanks.map(b => `<div class="inline-check-row"><strong>${esc(b.label)}</strong><button class="quiet-button" data-inline-check="${esc(b.id)}" type="button">채점</button></div>`).join("")}</section>`;
    }).join("");

    const standaloneUrl = exam.page ? `inline-subjective/${esc(exam.page)}.html` : "inline-subjective/";

    panel.innerHTML = `
      <div class="inline-exam-head">
        <span>INLINE IMPLEMENTATION EXAM</span>
        <h2>${esc((course.chapters.find(c => c.file === pathFile()) || {}).title || "인라인 시험")}</h2>
        <p>${view === "notebook" ? "설명 마크다운과 코드 셀을 원본 순서대로 봅니다." : "전체 코드의 빈칸에 직접 작성하고, 해당 위치 아래에서 바로 채점합니다."}</p>
      </div>
      <div class="inline-exam-controls">
        <button class="quiet-button ${view === "exam" ? "active" : ""}" data-inline-view="exam" type="button">인라인 시험</button>
        <button class="quiet-button ${view === "notebook" ? "active" : ""}" data-inline-view="notebook" type="button">풀 노트북 보기</button>
        <a class="quiet-button" href="${standaloneUrl}">독립 시험 페이지로 열기</a>
      </div>
      <div class="inline-code-cells">${cells}</div>
      <div class="inline-fixed-bar">
        <div class="inline-fixed-inner">
          <span id="inlineExamStatus"></span>
          <div>
            <button id="prevInline" class="quiet-button" type="button">이전 문제</button>
            <button id="nextInline" class="quiet-button" type="button">다음 문제</button>
            <button id="checkAllInline" class="primary-button" type="button">모든 빈칸 채점</button>
          </div>
        </div>
      </div>`;

    panel.querySelectorAll("[data-inline-answer]").forEach(e => {
      const resize = () => { e.style.height = "auto"; e.style.height = e.scrollHeight + "px"; };
      e.addEventListener("input", () => { e.classList.remove("correct", "wrong"); resize(); status(); });
      e.addEventListener("focus", () => { blankIndex = exam.blanks.findIndex(b => b.id === e.dataset.inlineAnswer); status(); });
      e.addEventListener("keydown", ev => { if (ev.ctrlKey && ev.key === "Enter") { ev.preventDefault(); check(e.dataset.inlineAnswer); } });
      resize();
    });

    panel.querySelectorAll("[data-inline-check]").forEach(b => b.addEventListener("click", () => check(b.dataset.inlineCheck)));
    panel.querySelectorAll("[data-inline-view]").forEach(b => b.addEventListener("click", () => { view = b.dataset.inlineView; render(); }));
    $("#prevInline")?.addEventListener("click", () => focus(blankIndex - 1));
    $("#nextInline")?.addEventListener("click", () => focus(blankIndex + 1));
    $("#checkAllInline")?.addEventListener("click", () => exam.blanks.forEach(b => check(b.id)));
    status();
  }

  window.renderInlineExam = render;
  window.showInlineExam = show;
})();
