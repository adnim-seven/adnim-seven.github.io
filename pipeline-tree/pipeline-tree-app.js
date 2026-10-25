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

    // 2. Branches & Nodes
    (data.branches || []).forEach((branch) => {
      const branchDetails = document.createElement("details");
      branchDetails.className = "tree-branch";
      branchDetails.open = true;

      const branchSummary = document.createElement("summary");
      branchSummary.className = "tree-branch-summary";
      branchSummary.innerHTML = `
        <div class="tree-branch-title">
          <span class="tree-branch-icon">${branch.icon || "📂"}</span>
          <span>${esc(branch.title)}</span>
        </div>
        <span class="tree-branch-meta">${esc(branch.meta || "")}</span>
      `;
      branchDetails.appendChild(branchSummary);

      const childrenContainer = document.createElement("div");
      childrenContainer.className = "tree-children";

      (branch.nodes || []).forEach((node) => {
        const funcDetails = document.createElement("details");
        funcDetails.className = `tree-func-node ${node.isExam ? "exam-highlight" : ""}`;
        funcDetails.open = true;

        const funcSummary = document.createElement("summary");
        funcSummary.className = "tree-func-summary";
        funcSummary.innerHTML = `
          <div class="tree-func-left">
            <span class="kind-pill ${node.isExam ? "exam" : ""}">${esc(node.kind)}</span>
            <span class="func-signature">${esc(node.name)}</span>
          </div>
          <div class="shape-tags">
            <span class="shape-badge in">In: ${esc(node.inShape)}</span>
            <span class="shape-badge out">Out: ${esc(node.outShape)}</span>
          </div>
        `;
        funcDetails.appendChild(funcSummary);

        const detailDiv = document.createElement("div");
        detailDiv.className = "tree-func-detail";

        let stepsHtml = "";
        if (node.steps && node.steps.length) {
          stepsHtml = `
            <div class="sub-operations">
              ${node.steps.map((st) => `<div class="sub-step"><span class="sub-step-arrow">├─</span><span>${esc(st)}</span></div>`).join("")}
            </div>
          `;
        }

        detailDiv.innerHTML = `
          <p class="func-desc">${esc(node.desc)}</p>
          ${stepsHtml}
          <div class="code-container">
            <pre class="code-view"><code>${esc(node.code)}</code></pre>
            <button class="copy-code-btn" type="button" data-code="${esc(node.code)}">복사</button>
          </div>
        `;

        funcDetails.appendChild(detailDiv);
        childrenContainer.appendChild(funcDetails);
      });

      branchDetails.appendChild(childrenContainer);
      canvas.appendChild(branchDetails);
    });

    // Setup Copy Code Buttons
    canvas.querySelectorAll(".copy-code-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.getAttribute("data-code");
        navigator.clipboard.writeText(code).then(() => {
          const original = btn.textContent;
          btn.textContent = "복사 완료!";
          setTimeout(() => (btn.textContent = original), 1500);
        });
      });
    });

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
