(() => {
  let timer;
  let isShowing = false;

  const show = (feedback) => {
    const message = feedback.textContent.trim();
    if (!message) return;
    let toast = document.querySelector("#genericInlineExamToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "genericInlineExamToast";
      toast.className = "inline-exam-toast";
      document.body.append(toast);
    }
    toast.className = `inline-exam-toast ${feedback.classList.contains("correct") ? "correct" : "wrong"}`;
    toast.textContent = message;
    clearTimeout(timer);
    requestAnimationFrame(() => toast.classList.add("show"));
    timer = setTimeout(() => toast.classList.remove("show"), 3000);
  };

  new MutationObserver((records) => {
    if (isShowing) return;
    records.forEach((record) => {
      const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      if (target?.closest?.("#genericInlineExamToast")) return;
      const feedback = target?.matches?.(".inline-answer-feedback") ? target : target?.closest?.(".inline-answer-feedback");
      if (feedback && feedback.textContent.trim()) {
        isShowing = true;
        try {
          show(feedback);
        } finally {
          isShowing = false;
        }
      }
    });
  }).observe(document.body, { childList: true, characterData: true, subtree: true });
})();
