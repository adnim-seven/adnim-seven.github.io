(() => {
  let isDecorating = false;
  let rafId = null;

  const decorate = () => {
    if (isDecorating) return;
    isDecorating = true;
    try {
      document.querySelectorAll(".inline-code-cell").forEach((cell) => {
        const rows = [...cell.querySelectorAll(".inline-check-row")];
        let hasPastExam = false;
        let hasVariantNew = false;
        let hasPriority = false;
        rows.forEach((row) => {
          const strong = row.querySelector("strong");
          if (!strong) return;
          const text = strong.textContent.trim();
          const isVariant = text.startsWith("🟣") || /기출\s*변형\s*유력/.test(text);
          const isPast = !isVariant && (text.startsWith("🔴") || /2026-09|기출/.test(text));
          const isPrio = text.startsWith("★");
          if (isPast) {
            hasPastExam = true;
            row.classList.add("is-past-exam-row");
            if (!row.querySelector(".inline-row-new-pill")) {
              strong.insertAdjacentHTML("afterend", '<span class="inline-row-new-pill">🔥 2026-09 기출 · NEW</span>');
            }
          } else if (isVariant) {
            hasVariantNew = true;
            row.classList.add("is-variant-new-row");
            if (!row.querySelector(".inline-row-variant-pill")) {
              strong.insertAdjacentHTML("afterend", '<span class="inline-row-variant-pill">✨ 기출 변형 유력 · NEW</span>');
            }
          } else if (isPrio) {
            hasPriority = true;
          }
        });
        const title = cell.querySelector(".cell-title");
        if (hasPastExam) {
          if (!cell.classList.contains("has-past-exam-question")) {
            cell.classList.add("has-past-exam-question");
          }
          if (title && !title.querySelector(".inline-past-exam-badge")) {
            title.insertAdjacentHTML("beforeend", '<span class="inline-past-exam-badge">🔥 2026-09 기출 재구성 · NEW</span>');
          }
        } else if (hasVariantNew) {
          if (!cell.classList.contains("has-variant-new-question")) {
            cell.classList.add("has-variant-new-question");
          }
          if (title && !title.querySelector(".inline-variant-new-badge")) {
            title.insertAdjacentHTML("beforeend", '<span class="inline-variant-new-badge">✨ 기출 변형 유력 · NEW</span>');
          }
        } else if (hasPriority && !cell.querySelector(".inline-priority-badge")) {
          cell.classList.add("has-priority-question");
          if (title && !title.querySelector(".inline-priority-badge")) {
            title.insertAdjacentHTML("beforeend", '<span class="inline-priority-badge">★ 유력 문제 포함</span>');
          }
        }
      });

      const course = window.LLM_COURSE;
      const exams = window.INLINE_EXAM_MAP || window.LLM_INLINE_EXAMS;
      if (course && exams) {
        document.querySelectorAll("#chapterNav .chapter-button").forEach((btn) => {
          const idx = Number(btn.dataset.index);
          const ch = course.chapters?.[idx];
          const exam = exams[ch?.file];
          if (!exam?.blanks) return;
          const pastCount = exam.blanks.filter((b) => String(b.label || "").startsWith("🔴")).length;
          const variantCount = exam.blanks.filter((b) => String(b.label || "").startsWith("🟣") || /기출\s*변형\s*유력/.test(String(b.label || ""))).length;
          const strong = btn.querySelector("strong");
          if (!strong) return;
          if (pastCount > 0 && !btn.querySelector(".chapter-past-pill")) {
            btn.classList.add("has-past-exam-ch");
            strong.insertAdjacentHTML("afterend", `<span class="chapter-past-pill">🔥 2026-09 기출 ${pastCount} · NEW</span>`);
          }
          if (variantCount > 0 && !btn.querySelector(".chapter-variant-pill")) {
            btn.classList.add("has-variant-exam-ch");
            const anchor = btn.querySelector(".chapter-past-pill") || strong;
            anchor.insertAdjacentHTML("afterend", `<span class="chapter-variant-pill">✨ 신유형 ${variantCount} · NEW</span>`);
          }
        });
      }
    } finally {
      isDecorating = false;
    }
  };

  const scheduleDecorate = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      decorate();
    });
  };

  new MutationObserver((mutations) => {
    const relevant = mutations.some(m =>
      [...m.addedNodes].some(n => n.nodeType === 1 && (n.matches?.(".inline-code-cell, .inline-code-cells, .chapter-button") || n.querySelector?.(".inline-code-cell, .chapter-button")))
    );
    if (relevant) scheduleDecorate();
  }).observe(document.body, { childList: true, subtree: true });

  scheduleDecorate();
})();
