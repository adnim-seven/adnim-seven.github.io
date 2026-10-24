'use strict';
const assert = require('assert');

// 2. 학습 상태 전이(State Machine) & 복습 스케줄 단위 테스트
function createTracker() {
  const state = { questions: {} };

  function recordAttempt(id, mode, correct, confidence, usedHint = false, errorCategory = '') {
    const item = state.questions[id] ||= { attempts: [] };
    item.attempts.push({ at: new Date().toISOString(), mode, correct, confidence, hintUsed: usedHint, errorCategory });
    const independent = item.attempts.filter((a) => a.mode === 'subjective' && a.correct && !a.hintUsed);
    item.status = independent.length >= 2 ? 'mastered' : independent.length === 1 ? 'learned' : correct ? 'recognition' : 'wrong';
    const minutes = (!correct || usedHint) ? 20 : mode === 'mcq' ? 1440 : independent.length === 1 ? 1440 : 10080;
    item.due = new Date(Date.now() + minutes * 60000).toISOString();
  }

  function counts(ids) {
    const result = { unseen: 0, recognition: 0, learned: 0, wrong: 0, mastered: 0 };
    ids.forEach((id) => { const status = state.questions[id]?.status || 'unseen'; result[status] = (result[status] || 0) + 1; });
    return result;
  }

  return { state, recordAttempt, counts };
}

console.log('--- [Unit Test] State Machine & Attempt Tracking ---');

const tracker = createTracker();
const ids = ['q1', 'q2', 'q3'];

// 테스트 1: 초기 상태는 모두 unseen
assert.deepStrictEqual(tracker.counts(ids), { unseen: 3, recognition: 0, learned: 0, wrong: 0, mastered: 0 });

// 테스트 2: 5지선다 맞추면 recognition
tracker.recordAttempt('q1', 'mcq', true, '확실');
assert.strictEqual(tracker.state.questions['q1'].status, 'recognition');
assert.deepStrictEqual(tracker.counts(ids), { unseen: 2, recognition: 1, learned: 0, wrong: 0, mastered: 0 });

// 테스트 3: 주관식 노힌트 1회 정답 -> learned
tracker.recordAttempt('q1', 'subjective', true, '확실', false);
assert.strictEqual(tracker.state.questions['q1'].status, 'learned');

// 테스트 4: 주관식 노힌트 2회 정답 -> mastered
tracker.recordAttempt('q1', 'subjective', true, '확실', false);
assert.strictEqual(tracker.state.questions['q1'].status, 'mastered');

// 테스트 5: 힌트를 사용하여 맞춘 경우 mastered로 승급되지 않음
tracker.recordAttempt('q2', 'subjective', true, '애매', true); // usedHint = true
assert.strictEqual(tracker.state.questions['q2'].status, 'recognition'); // 힌트 사용 시 independent에 포함 안 됨

// 테스트 6: 오답 시 wrong
tracker.recordAttempt('q3', 'subjective', false, '추측', false, '개념');
assert.strictEqual(tracker.state.questions['q3'].status, 'wrong');

// 최종 집계 검증
assert.deepStrictEqual(tracker.counts(ids), { unseen: 0, recognition: 1, learned: 0, wrong: 1, mastered: 1 });

console.log('✓ test_state_machine: All 6 assertion groups passed.');
