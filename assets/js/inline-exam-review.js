(() => {
  let isUpdating = false;
  let rafId = null;

  const update = () => {
    if (isUpdating) return;
    isUpdating = true;
    try {
      const panel = document.querySelector("#inlineExamPanel");
      const status = document.querySelector("#inlineExamStatus");
      if (!panel || !status) return;

      let summary = document.querySelector("#inlineWrongSummary");
      if (!summary) {
        summary = document.createElement("span");
        summary.id = "inlineWrongSummary";
        summary.className = "inline-wrong-summary";
        status.insertAdjacentElement("afterend", summary);
      }

      const wrong = [...panel.querySelectorAll(".inline-answer-input.wrong")].map((input) => {
        const id = input.dataset.inlineAnswer;
        const row = panel.querySelector(`[data-inline-check="${CSS.escape(id)}"]`)?.closest(".inline-check-row");
        const label = row?.querySelector("strong")?.textContent.trim() || "현재 빈칸";
        const feedback = panel.querySelector(`#inline-feedback-${CSS.escape(id)}`)?.textContent.trim() || "";
        return { label, feedback };
      });

      summary.replaceChildren();
      if (!wrong.length) return;
      const title = document.createElement("strong");
      title.textContent = `오답 ${wrong.length}개`;
      summary.append(title);
      wrong.forEach((item) => {
        const line = document.createElement("span");
        line.textContent = `${item.label} · ${item.feedback.replace(/^오답입니다\.\s*/, "")}`;
        summary.append(line);
      });
    } finally {
      isUpdating = false;
    }
  };

  const scheduleUpdate = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      update();
    });
  };

  new MutationObserver((mutations) => {
    const hasInputClassChange = mutations.some(m =>
      m.type === "attributes" &&
      m.attributeName === "class" &&
      m.target.classList?.contains("inline-answer-input")
    );
    if (hasInputClassChange) scheduleUpdate();
  }).observe(document.body, { attributes: true, attributeFilter: ["class"], subtree: true });

  document.addEventListener("input", scheduleUpdate, true);
  document.addEventListener("click", scheduleUpdate, true);
  scheduleUpdate();
})();
