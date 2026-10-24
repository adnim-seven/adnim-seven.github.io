'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '../..');

console.log('--- [Unit Test] Mock Exam Session & Scoring (Rounds 1–5) ---');

const storage = {};
function bootExam(round) {
  const nodes = {}, events = {};
  const doc = {
    querySelector: s => nodes[s] ||= {
      textContent: '',
      innerHTML: '',
      hidden: false,
      disabled: false,
      scrollIntoView() {},
      classList: {
        add() {},
        remove() {},
        toggle() {},
        contains: () => false
      },
      appendChild(c) { return c; },
      insertBefore(n) { return n; }
    },
    querySelectorAll: () => [],
    addEventListener: (event, fn) => { (events[event] ||= []).push(fn); },
    getElementById: id => doc.querySelector('#' + id),
    createElement: tag => ({
      tagName: tag.toUpperCase(),
      className: '',
      id: '',
      textContent: '',
      innerHTML: '',
      classList: {
        add() {},
        remove() {},
        toggle() {},
        contains: () => false
      },
      setAttribute() {},
      appendChild(c) { return c; }
    }),
    body: {
      appendChild(c) { return c; }
    }
  };
  const c = {
    window: { scrollTo() {} },
    document: doc,
    localStorage: {
      getItem: k => storage[k] || null,
      setItem: (k, v) => { storage[k] = String(v); }
    },
    confirm: () => true,
    setInterval: () => {},
    setTimeout: (fn, ms) => { fn(); return 1; },
    clearTimeout: () => {},
    Date,
    Blob,
    URL
  };
  vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(ROOT, `mock-exam-${round}/questions.js`), 'utf8'), c);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/mock-exam-app.js'), 'utf8'), c);
  return { c, nodes, events };
}

for (let round = 1; round <= 5; round++) {
  const session = bootExam(round);
  const exam = session.c.window.EXAM;
  assert.strictEqual(exam.length, 15, `Round ${round} has 15 questions`);
  
  // 시작 버튼 클릭
  session.nodes['#start'].onclick();
  
  // 정답 입력
  for (const q of exam) {
    for (const s of q.slots) {
      for (const fn of session.events.input || []) {
        fn({ target: { dataset: { slot: q.id + '-' + s.key }, value: s.answer } });
      }
    }
  }

  // 제출 버튼 클릭
  session.nodes['#submit'].onclick();
  const resultText = session.nodes['#result'].innerHTML;
  assert.ok(resultText.includes('100 / 100'), `Round ${round} scores 100/100`);

  // 세션 복원 검증
  const reloaded = bootExam(round);
  assert.strictEqual(reloaded.nodes['#submit'].disabled, true, `Round ${round} submit button stays disabled after submission`);
  assert.ok(reloaded.nodes['#result'].innerHTML.includes('100 / 100'), `Round ${round} restores 100/100 from storage`);
}

// 5개 회차가 독립된 스토리지 키를 사용하는지 검증
assert.strictEqual(Object.keys(storage).length, 5, 'Five independent storage keys verified');

// 대체 정답(alternatives) 허용 채점 검증 (Exam 1)
delete storage['ai-specialist-mock-1-v1'];
const altSession = bootExam(1);
altSession.nodes['#start'].onclick();
const exam1 = altSession.c.window.EXAM;
for (const q of exam1) {
  for (const s of q.slots) {
    const ans = (s.alternatives && s.alternatives.length > 0) ? s.alternatives[0] : s.answer;
    for (const fn of altSession.events.input || []) {
      fn({ target: { dataset: { slot: q.id + '-' + s.key }, value: ans } });
    }
  }
}
altSession.nodes['#submit'].onclick();
assert.ok(altSession.nodes['#result'].innerHTML.includes('100 / 100'), 'Alternative answers achieve 100/100 full score');

// 단축키 검증 (Ctrl+Enter, Ctrl+S)
delete storage['ai-specialist-mock-1-v1'];
const keySession = bootExam(1);
let savedTriggered = false;
for (const fn of keySession.events.keydown || []) {
  fn({ ctrlKey: true, key: 's', preventDefault() { savedTriggered = true; } });
}
assert.strictEqual(savedTriggered, true, 'Ctrl+S shortcut triggers save handler');

console.log('✓ test_mock_exam: All 5 mock exam rounds scored 100/100, alternatives verified, and restored independently.');
