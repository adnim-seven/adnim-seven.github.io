(() => {
  const decorate = () => {
    document.querySelectorAll(".inline-code-cell").forEach((cell) => {
      const rows = [...cell.querySelectorAll(".inline-check-row")];
      let hasPastExam = false;
      let hasPriority = false;
      rows.forEach((row) => {
        const strong = row.querySelector("strong");
        if (!strong) return;
        const text = strong.textContent.trim();
        const isPast = text.startsWith("🔴") || /2026-09|기출/.test(text);
        const isPrio = text.startsWith("★");
        if (isPast) {
          hasPastExam = true;
          row.classList.add("is-past-exam-row");
          if (!row.querySelector(".inline-row-new-pill")) {
            strong.insertAdjacentHTML("afterend", '<span class="inline-row-new-pill">🔥 2026-09 기출 · NEW</span>');
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
      } else if (hasPriority && !cell.classList.contains("has-priority-question")) {
        cell.classList.add("has-priority-question");
        if (title && !title.querySelector(".inline-priority-badge")) {
          title.insertAdjacentHTML("beforeend", '<span class="inline-priority-badge">★ 유력 문제 포함</span>');
        }
      }
    });
  };
  new MutationObserver(decorate).observe(document.body, { childList: true, subtree: true });
  decorate();
})();
