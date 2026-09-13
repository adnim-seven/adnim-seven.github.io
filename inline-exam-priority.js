(() => {
  const decorate = () => {
    document.querySelectorAll(".inline-code-cell").forEach((cell) => {
      const important = [...cell.querySelectorAll(".inline-check-row strong")]
        .some((label) => label.textContent.trim().startsWith("★"));
      if (!important || cell.classList.contains("has-priority-question")) return;
      cell.classList.add("has-priority-question");
      const title = cell.querySelector(".cell-title");
      if (title) title.insertAdjacentHTML("beforeend", '<span class="inline-priority-badge">★ 유력 문제 포함</span>');
    });
  };
  new MutationObserver(decorate).observe(document.body, { childList: true, subtree: true });
  decorate();
})();
