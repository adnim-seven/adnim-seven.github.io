(() => {
const $ = s => document.querySelector(s);
const examNumber = window.EXAM_NUMBER || 1;
const examTitle = `모의고사 ${examNumber}회`;
const KEY = `ai-specialist-mock-${examNumber}-v1`;
const items = window.EXAM || [];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

let state = { answers: {}, overrides: {}, started: null, submitted: null };
try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  if (saved && saved.answers) state = { ...state, ...saved };
} catch {}

const slotId = (q, s) => q.id + '-' + s.key;

function showToast(msg) {
  if (typeof document === 'undefined' || !document.body) return;
  let toast = $('#examToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'examToast';
    toast.className = 'exam-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  if (toast.classList && toast.classList.add) toast.classList.add('show');
  if (typeof clearTimeout !== 'undefined' && showToast._timer) {
    clearTimeout(showToast._timer);
  }
  if (typeof setTimeout !== 'undefined') {
    showToast._timer = setTimeout(() => {
      if (toast.classList && toast.classList.remove) toast.classList.remove('show');
    }, 2200);
  }
}

// Preserve whitespace inside string literals; ignore formatting only outside them.
function normalize(s) {
  let str = String(s ?? '').trim();
  str = str.replace(/\btorch\.concat\b/g, 'torch.cat');
  const tokens = str.match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\s+|[^\s"']+/g) || [];
  return tokens.map(t => /^\s+$/.test(t) ? '' : t[0] === "'" ? '"' + t.slice(1, -1) + '"' : t)
               .join('')
               .replace(/[,;]+$/, '');
}

function auto(q, s) {
  const userAns = state.answers[slotId(q, s)] || '';
  if (!userAns.trim()) return false;
  const userNorm = normalize(userAns);
  const candidateList = [s.answer, ...(s.alternatives || [])];
  return candidateList.some(a => normalize(a) === userNorm);
}

function accepted(q, s) {
  const id = slotId(q, s);
  return id in state.overrides ? state.overrides[id] : auto(q, s);
}

function save(quiet = false) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    const timeStr = new Date().toLocaleTimeString();
    const savedEl = $('#saved');
    if (savedEl) savedEl.textContent = '저장됨 ' + timeStr;
    if (!quiet) showToast('답안이 로컬에 자동 저장되었습니다.');
  } catch {
    const savedEl = $('#saved');
    if (savedEl) savedEl.textContent = '브라우저 저장 불가 — 답안 내보내기를 이용하세요.';
  }
}

function elapsed() {
  return state.started ? Math.max(0, Math.floor(((state.submitted || Date.now()) - state.started) / 1000)) : 0;
}

function timer() {
  const n = elapsed();
  const timerEl = $('#timer');
  if (!timerEl) return;
  const timeText = `경과 ${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  timerEl.textContent = timeText + (n >= 5400 ? ' · 권장 시간 90분 초과' : '');
}

function renderRoundSwitcher() {
  const header = $('header');
  if (!header || $('#examSwitcher')) return;
  const switcher = document.createElement('nav');
  switcher.id = 'examSwitcher';
  switcher.className = 'exam-switcher';
  switcher.setAttribute('aria-label', '모의고사 회차 이동');
  switcher.innerHTML = [1, 2, 3, 4, 5].map(n =>
    `<a href="../mock-exam-${n}/" class="round-link ${n === examNumber ? 'active' : ''}" ${n === examNumber ? 'aria-current="page"' : ''}>모의고사 ${n}회</a>`
  ).join('');
  const h1 = header.querySelector('h1');
  if (h1 && h1.nextSibling) {
    header.insertBefore(switcher, h1.nextSibling);
  } else {
    header.appendChild(switcher);
  }
}

function render() {
  renderRoundSwitcher();

  const startBtn = $('#start');
  const submitBtn = $('#submit');
  if (startBtn) startBtn.disabled = !!state.started;
  if (submitBtn) submitBtn.disabled = !state.started || !!state.submitted;

  const subjects = [...new Set(items.map(q => q.subject))];
  const navEl = $('#nav');
  if (navEl) {
    navEl.innerHTML = subjects.map(subject => {
      const q = items.find(x => x.subject === subject);
      if (!state.submitted) {
        return `<a href="#q-${q.id}">${esc(subject)} · 20점</a>`;
      }
      let subScore = 0;
      let subTotal = 0;
      for (const qItem of items.filter(x => x.subject === subject)) {
        for (const s of qItem.slots) {
          subTotal += s.points;
          subScore += accepted(qItem, s) ? s.points : 0;
        }
      }
      const isPerfect = subScore === subTotal;
      return `<a href="#q-${q.id}" class="${isPerfect ? 'nav-pass' : 'nav-wrong'}">${esc(subject)} · ${subScore}/${subTotal}점</a>`;
    }).join('');
  }

  const questionsEl = $('#questions');
  if (questionsEl) {
    questionsEl.innerHTML = items.map(q => `
      <article id="q-${q.id}">
        <div class="meta">${esc(q.subject)} · ${q.slots.reduce((n, s) => n + s.points, 0)}점 · ${esc(q.source)}</div>
        <h2>${q.id}. ${esc(q.title)}</h2>
        <p>${esc(q.prompt)}</p>
        <pre>${esc(q.code).replace(/\{\{([A-Z])\}\}/g, '<mark class="blank">[$1] ???</mark>')}</pre>
        ${q.slots.map(s => {
          const id = slotId(q, s);
          const isAcc = accepted(q, s);
          return `
            <label for="${id}">[${s.key}] ${s.points}점</label>
            <textarea id="${id}" data-slot="${id}" spellcheck="false" autocapitalize="off" autocomplete="off" ${!state.started || state.submitted ? 'disabled' : ''} aria-label="${q.id} ${s.key} 답안">${esc(state.answers[id] || '')}</textarea>
            ${state.submitted ? `
              <div class="answer ${isAcc ? '' : 'wrong'}">
                <strong>${isAcc ? '인정' : '미인정'} · ${isAcc ? s.points : 0}/${s.points}점</strong>
                <pre>${esc(s.answer)}</pre>
                <p>${esc(s.why)}</p>
                <label><input type="checkbox" data-credit="${id}" ${isAcc ? 'checked' : ''}> 동일 기능 구현으로 ${s.points}점 인정</label>
                <small>자동 판정: ${auto(q, s) ? '일치' : '등록 답안과 불일치'} · 직접 조정은 별도 표시됩니다.</small>
              </div>
            ` : ''}
          `;
        }).join('')}
      </article>
    `).join('');
  }

  const resultEl = $('#result');
  if (resultEl) {
    resultEl.hidden = !state.submitted;
    if (state.submitted) {
      let total = 0, automatic = 0;
      const rows = subjects.map(subject => {
        let n = 0, a = 0;
        for (const q of items.filter(q => q.subject === subject)) {
          for (const s of q.slots) {
            n += accepted(q, s) ? s.points : 0;
            a += auto(q, s) ? s.points : 0;
          }
        }
        total += n;
        automatic += a;
        const pass = n >= 12;
        return `<tr><td><strong>${esc(subject)}</strong></td><td>${a}/20</td><td><span class="sub-score ${pass ? 'pass' : 'fail'}">${n}/20</span></td></tr>`;
      });
      const elapsedSec = elapsed();
      const timeStr = `${Math.floor(elapsedSec / 60)}분 ${elapsedSec % 60}초`;
      const submitDate = state.submitted ? new Date(state.submitted).toLocaleString('ko-KR') : '';
      const isPass = total >= 60;

      resultEl.innerHTML = `
        <h2>제출 결과 분석</h2>
        <div class="result-summary">
          <div class="score-card">
            <span class="score-label">최종 점수</span>
            <span class="score ${isPass ? 'score-pass' : 'score-fail'}">${total} / 100점</span>
            <span class="score-badge ${isPass ? 'badge-pass' : 'badge-fail'}">${isPass ? '합격 기준 달성' : '보완 필요 (60점 이상 합격)'}</span>
          </div>
          <div class="result-meta">
            <p><strong>응시 일시:</strong> ${submitDate}</p>
            <p><strong>총 소요 시간:</strong> ${timeStr} (권장 90분)</p>
            <p><strong>자동 잠정 점수:</strong> ${automatic}점 · <strong>수동 직접 조정:</strong> ${Object.keys(state.overrides).length}개</p>
          </div>
        </div>
        <table class="result-table">
          <thead><tr><th>과목</th><th>자동</th><th>조정 반영</th></tr></thead>
          <tbody>${rows.join('')}</tbody>
        </table>
        <div class="result-actions">
          <button id="wrongOnly" class="filter-btn">미인정 답안이 있는 문제만 보기</button>
          <button id="showAll" class="filter-btn active">전체 보기</button>
        </div>
      `;
    }
  }

  timer();
}

document.addEventListener('input', e => {
  if (e.target.dataset && e.target.dataset.slot && !state.submitted) {
    state.answers[e.target.dataset.slot] = e.target.value;
    save(true);
  }
});

document.addEventListener('change', e => {
  if (e.target.dataset && e.target.dataset.credit && state.submitted) {
    state.overrides[e.target.dataset.credit] = e.target.checked;
    save(true);
    render();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Tab' && e.target.matches && e.target.matches('textarea') && !e.target.disabled) {
    e.preventDefault();
    e.target.setRangeText('    ', e.target.selectionStart, e.target.selectionEnd, 'end');
    e.target.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    if (!state.started) {
      const startBtn = $('#start');
      if (startBtn && !startBtn.disabled) startBtn.click();
    } else if (!state.submitted) {
      const submitBtn = $('#submit');
      if (submitBtn && !submitBtn.disabled) submitBtn.click();
    } else {
      const resultEl = $('#result');
      if (resultEl) resultEl.scrollIntoView({ behavior: 'smooth' });
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    save(false);
  }
});

const startBtn = $('#start');
if (startBtn) {
  startBtn.onclick = () => {
    state.started = Date.now();
    save(true);
    render();
    showToast('시험이 시작되었습니다. 90분 타이머가 작동합니다.');
  };
}

const submitBtn = $('#submit');
if (submitBtn) {
  submitBtn.onclick = () => {
    const empty = items.flatMap(q => q.slots.map(s => state.answers[slotId(q, s)] || '')).filter(a => !a.trim()).length;
    if (!confirm(`답안을 제출할까요? 미작성 ${empty}개입니다. 제출 후 답안은 잠기고 정답과 해설이 표시됩니다.`)) return;
    state.submitted = Date.now();
    save(true);
    render();
    showToast('전체 답안 제출 완료! 채점 결과를 확인하세요.');
    const resultEl = $('#result');
    if (resultEl) resultEl.scrollIntoView({ behavior: 'smooth' });
  };
}

const resetBtn = $('#reset');
if (resetBtn) {
  resetBtn.onclick = () => {
    if (!confirm(`이 브라우저의 ${examTitle} 답안과 점수를 초기화할까요? 보관하려면 먼저 답안을 내보내세요.`)) return;
    state = { answers: {}, overrides: {}, started: null, submitted: null };
    save(true);
    render();
    if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
    showToast('응시 기록이 초기화되었습니다.');
  };
}

const exportBtn = $('#export');
if (exportBtn) {
  exportBtn.onclick = () => {
    const blob = new Blob([JSON.stringify({ exam: examTitle, ...state }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `모의고사${examNumber}회-답안.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
}

document.addEventListener('click', e => {
  if (e.target.id === 'wrongOnly' || e.target.id === 'showAll') {
    const isWrongOnly = e.target.id === 'wrongOnly';
    const wrongBtn = $('#wrongOnly');
    const allBtn = $('#showAll');
    if (wrongBtn) wrongBtn.classList.toggle('active', isWrongOnly);
    if (allBtn) allBtn.classList.toggle('active', !isWrongOnly);
    for (const q of items) {
      const art = document.getElementById('q-' + q.id);
      if (art) {
        art.hidden = isWrongOnly && q.slots.every(s => accepted(q, s));
      }
    }
  }
});

render();
setInterval(timer, 1000);
})();
