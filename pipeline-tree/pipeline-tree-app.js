/**
 * AI Specialist Pipeline Tree Application
 * Handles interactive tree rendering, collapse/expand states, search, and ASCII view toggling.
 */
(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  let currentSubject = "llm";
  let currentView = "interactive"; // 'interactive' or 'ascii'
  let examFilterActive = false;

  const dataset = window.PIPELINE_TREE_DATA || {};

  function init() {
    // 1. Read URL params
    const params = new URLSearchParams(window.location.search);
    const paramSubj = params.get("subject")?.toLowerCase();
    if (paramSubj && dataset[paramSubj]) {
      currentSubject = paramSubj;
    }

    // 2. Setup Subject Tabs
    $$(".subj-tab").forEach((tab) => {
      const subj = tab.dataset.subject;
      tab.classList.toggle("active", subj === currentSubject);
      tab.addEventListener("click", () => switchSubject(subj));
    });

    // 3. Setup Action Buttons
    $("#btnExpandAll")?.addEventListener("click", () => expandAll(true));
    $("#btnCollapseAll")?.addEventListener("click", () => expandAll(false));
    $("#btnBranchOnly")?.addEventListener("click", () => showBranchOnly());
    $("#btnExamFilter")?.addEventListener("click", toggleExamFilter);
    $("#btnCopyAscii")?.addEventListener("click", copyAsciiTree);

    // 4. Setup View Mode Toggle
    $$(".view-mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => switchViewMode(btn.dataset.view));
    });

    // 5. Search Filter
    $("#treeSearch")?.addEventListener("input", (e) => handleSearch(e.target.value));

    // 6. Initial Render
    renderCurrentTree();
  }

  function switchSubject(subj) {
    if (!dataset[subj]) return;
    currentSubject = subj;

    $$(".subj-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.subject === subj);
    });

    // Update URL query without page reload
    const url = new URL(window.location);
    url.searchParams.set("subject", subj);
    window.history.replaceState({}, "", url);

    renderCurrentTree();
  }

  function switchViewMode(mode) {
    currentView = mode;
    $$(".view-mode-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === mode);
    });

    const isInteractive = mode === "interactive";
    $("#interactiveCanvas").style.display = isInteractive ? "flex" : "none";
    $("#asciiCanvas").style.display = isInteractive ? "none" : "block";
  }

  function renderCurrentTree() {
    const data = dataset[currentSubject];
    if (!data) return;

    // Update Hero Title
    $("#heroTitle").textContent = data.title;
    $("#heroDesc").textContent = data.desc;

    // Render ASCII View
    $("#rawAsciiContent").textContent = data.ascii || "(준비 중)";

    // Render Interactive View
    const canvas = $("#interactiveCanvas");
    canvas.innerHTML = "";

    // 1. Root Goal Node
    if (data.root) {
      const rootDiv = document.createElement("div");
      rootDiv.className = "root-goal-node";
      rootDiv.innerHTML = `
        <span class="root-goal-badge">TOP-LEVEL EXECUTION TARGET</span>
        <h3>${esc(data.root.title)}</h3>
        <p>${esc(data.root.methods)}</p>
      `;
      canvas.appendChild(rootDiv);
    }

    // 2. Render Top-Down Nested Trees
    function renderNestedNode(node, level = 0) {
      const hasChildren = node.children && node.children.length > 0;
      let childrenHtml = "";
      if (hasChildren) {
        childrenHtml = `
          <div class="tree-children">
            ${node.children.map(child => renderNestedNode(child, level + 1)).join("")}
          </div>
        `;
      }

      // Metadata placed strictly BEHIND the function name
      const metaParts = [];
      if (node.inShape && node.inShape !== "-") {
        metaParts.push(`<span class="shape-badge in">[In: ${esc(node.inShape)}]</span>`);
      }
      if (node.outShape && node.outShape !== "-") {
        metaParts.push(`<span class="shape-badge out">➔ [Out: ${esc(node.outShape)}]</span>`);
      }
      if (node.kind) {
        metaParts.push(`<span class="kind-pill ${node.isExam ? "exam" : ""}">${esc(node.kind)}</span>`);
      }
      if (node.desc) {
        metaParts.push(`<span class="comment-desc">// ${esc(node.desc)}</span>`);
      }

      const metaHtml = metaParts.length ? `<div class="node-meta">${metaParts.join("")}</div>` : "";
      const examBadge = node.isExam ? `<span class="exam-tag">🔥 기출</span>` : "";

      if (hasChildren) {
        return `
          <details class="tree-item level-${level} ${node.isExam ? "exam-highlight" : ""}" open>
            <summary class="tree-row">
              <span class="twistie">▶</span>
              <span class="folder-icon closed">📁</span>
              <span class="folder-icon open">📂</span>
              <span class="func-signature">${esc(node.name)}</span>
              ${examBadge}
              ${metaHtml}
            </summary>
            ${childrenHtml}
          </details>
        `;
      } else {
        return `
          <div class="tree-row leaf level-${level} ${node.isExam ? "exam-highlight" : ""}">
            <span class="twistie spacer">•</span>
            <span class="leaf-icon">λ</span>
            <span class="func-signature">${esc(node.name)}</span>
            ${examBadge}
            ${metaHtml}
          </div>
        `;
      }
    }

    if (data.top_down_trees && data.top_down_trees.length) {
      const treeContainer = document.createElement("div");
      treeContainer.className = "top-down-interactive-group";
      treeContainer.innerHTML = data.top_down_trees.map(t => renderNestedNode(t, 0)).join("");
      canvas.appendChild(treeContainer);
    }

    // Re-apply filters if active
    if (examFilterActive) {
      applyExamFilter();
    }
  }

  function expandAll(isOpen) {
    $$("#interactiveCanvas details").forEach((d) => (d.open = isOpen));
  }

  function showBranchOnly() {
    $$("#interactiveCanvas .tree-branch").forEach((b) => (b.open = true));
    $$("#interactiveCanvas .tree-func-node").forEach((fn) => (fn.open = false));
  }

  function toggleExamFilter() {
    examFilterActive = !examFilterActive;
    $("#btnExamFilter")?.classList.toggle("active", examFilterActive);
    applyExamFilter();
  }

  function applyExamFilter() {
    $$(".tree-func-node").forEach((node) => {
      if (examFilterActive) {
        node.style.display = node.classList.contains("exam-highlight") ? "" : "none";
      } else {
        node.style.display = "";
      }
    });
  }

  function handleSearch(keyword) {
    const q = keyword.toLowerCase().trim();
    $$(".tree-func-node").forEach((node) => {
      const text = node.textContent.toLowerCase();
      const match = !q || text.includes(q);
      node.style.display = match ? "" : "none";
      if (q && match) {
        node.open = true;
        const parentBranch = node.closest(".tree-branch");
        if (parentBranch) parentBranch.open = true;
      }
    });
  }

  function copyAsciiTree() {
    const data = dataset[currentSubject];
    if (!data?.ascii) return;
    navigator.clipboard.writeText(data.ascii).then(() => {
      const btn = $("#btnCopyAscii");
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = "✅ 복사 완료!";
        setTimeout(() => (btn.textContent = orig), 2000);
      }
    });
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  document.addEventListener("DOMContentLoaded", init);
})();
