(() => {
  const storageKey = `ai-inline-history:${location.pathname}`;
  const read = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { return {}; } };
  const save = (data) => localStorage.setItem(storageKey, JSON.stringify(data));
  const itemKey = (input) => `${(document.querySelector("#chapterPath")?.textContent || "").trim()}:${input.dataset.inlineAnswer}`;
  const label = (input) => input.closest(".inline-code-cell")?.querySelector(".inline-check-row strong")?.textContent || input.dataset.inlineAnswer;
  const bookmarkButton = (input) => input.closest(".inline-code-cell")?.querySelector(`.inline-bookmark[data-bookmark="${input.dataset.inlineAnswer}"]`);

  function paint(input) {
    const record = read()[itemKey(input)] || {}, button = bookmarkButton(input);
    if (!button) return;
    button.classList.toggle("starred", !!record.starred);
    const text = record.starred ? "★ 복습" : "☆ 복습";
    if (button.textContent !== text) button.textContent = text;
  }
  function addBookmark(input) {
    const row = input.closest(".inline-code-cell")?.querySelector(`.inline-check-row:has([data-inline-check="${input.dataset.inlineAnswer}"])`);
    if (!row || row.querySelector(".inline-bookmark")) return;
    const button = document.createElement("button");
    button.type = "button"; button.className = "quiet-button inline-bookmark"; button.dataset.bookmark = input.dataset.inlineAnswer;
    button.addEventListener("click", () => {
      const data = read(), key = itemKey(input);
      data[key] ||= { label: label(input), wrong: 0 };
      data[key].starred = !data[key].starred; save(data); paint(input);
    });
    row.append(button); paint(input);
  }
  function record(input) {
    if (!input.classList.contains("correct") && !input.classList.contains("wrong")) return;
    const data = read(), key = itemKey(input);
    data[key] ||= { label: label(input), wrong: 0 };
    data[key].label = label(input); data[key].correct = input.classList.contains("correct");
    if (input.classList.contains("wrong")) data[key].wrong = (data[key].wrong || 0) + 1;
    data[key].updatedAt = new Date().toISOString(); save(data); paint(input);
  }
  function openHistory() {
    const rows = Object.values(read()).filter((item) => item.starred || item.wrong).sort((a, b) => (b.wrong || 0) - (a.wrong || 0));
    let modal = document.querySelector("#inlineHistoryModal");
    if (!modal) {
      modal = document.createElement("div"); modal.id = "inlineHistoryModal"; modal.className = "inline-history-modal";
      modal.innerHTML = '<section class="inline-history-card"><header><div><h2>인라인 오답·북마크</h2><p>현재 브라우저에 저장된 문제별 복습 기록입니다.</p></div><button class="close" type="button">닫기</button></header><div class="inline-history-list"></div></section>';
      document.body.append(modal); modal.querySelector(".close").addEventListener("click", () => modal.classList.remove("open"));
      modal.addEventListener("click", (event) => { if (event.target === modal) modal.classList.remove("open"); });
    }
    modal.querySelector(".inline-history-list").innerHTML = rows.length ? rows.map((item) => `<div class="inline-history-row"><strong>${item.label}</strong><span class="${item.starred ? "starred" : ""}">${item.starred ? "★ 복습 표시 · " : ""}오답 ${item.wrong || 0}회 · ${item.correct ? "최근 정답" : "최근 오답"}</span></div>`).join("") : '<p class="inline-history-empty">기록된 오답 또는 북마크가 없습니다.</p>';
    modal.classList.add("open");
  }
  const pageObserver = new MutationObserver(() => {
    document.querySelectorAll("[data-inline-answer]").forEach((input) => { addBookmark(input); paint(input); });
    document.querySelectorAll(".inline-fixed-inner>div").forEach((group) => {
      if (group.querySelector(".inline-history-button")) return;
      const button = document.createElement("button"); button.type = "button"; button.className = "quiet-button inline-history-button"; button.textContent = "오답·북마크";
      button.addEventListener("click", openHistory); group.append(button);
    });
  });
  pageObserver.observe(document.body, { childList: true, subtree: true });
  new MutationObserver((records) => records.forEach((entry) => { if (entry.target.matches?.("[data-inline-answer]")) record(entry.target); })).observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class"] });
})();
