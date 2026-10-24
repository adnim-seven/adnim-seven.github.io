'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '../..');

console.log('--- [Unit Test] Subject App Engine (VM DOM Test) ---');

function createMockDom() {
  const nodes = {};
  const eventListeners = {};
  function makeNode(tag = 'div', id = '') {
    const classSet = new Set();
    const nodeObj = {
      tagName: tag.toUpperCase(),
      id,
      dataset: {},
      get className() { return [...classSet].join(' '); },
      set className(v) {
        classSet.clear();
        String(v || '').split(/\s+/).filter(Boolean).forEach(c => classSet.add(c));
      },
      classList: {
        add(c) { classSet.add(c); },
        remove(c) { classSet.delete(c); },
        toggle(c, v) { if (v === undefined) v = !classSet.has(c); v ? classSet.add(c) : classSet.delete(c); return v; },
        contains(c) { return classSet.has(c); }
      },
      attributes: {},
      setAttribute(k, v) { this.attributes[k] = String(v); },
      getAttribute(k) { return this.attributes[k]; },
      style: {},
      innerHTML: '',
      textContent: '',
      value: '',
      querySelectorAll(sel) { return []; },
      querySelector(sel) { return null; },
      addEventListener(type, fn) {
        (eventListeners[id + ':' + type] ||= []).push(fn);
      },
      dispatchEvent(event) {
        const fns = eventListeners[id + ':' + event.type] || [];
        fns.forEach(fn => fn(event));
      }
    };
    return nodeObj;
  }

  const doc = {
    createElement(tag) { return makeNode(tag); },
    querySelector(sel) {
      if (sel.startsWith('#')) {
        const id = sel.slice(1);
        return nodes[id] ||= makeNode('div', id);
      }
      return makeNode('div');
    },
    querySelectorAll(sel) {
      return [];
    },
    body: makeNode('body', 'body')
  };

  const storage = {};
  const mockLocalStorage = {
    getItem(k) { return storage[k] || null; },
    setItem(k, v) { storage[k] = String(v); },
    clear() { Object.keys(storage).forEach(k => delete storage[k]); }
  };

  return { doc, nodes, mockLocalStorage, storage, eventListeners };
}

// 테스트 1: subject-app.js VM 로드 및 config 검증
const mock = createMockDom();
const ctx = {
  window: {},
  document: mock.doc,
  localStorage: mock.mockLocalStorage,
  confirm: () => true,
  alert: () => {},
  scrollTo: () => {},
  console
};
vm.createContext(ctx);

// LLM 코스 데이터 및 config 로드
vm.runInContext(fs.readFileSync(path.join(ROOT, 'llm/course_data.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'llm/subject.config.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/subject-app.js'), 'utf8'), ctx);

// 테스트 2: 첫 번째 챕터 자동 초기화 검증
assert.ok(mock.nodes['chapterTitle'].textContent.includes('Dataset'));
assert.ok(mock.nodes['chapterPath'].textContent.startsWith('1. LLM ›'));
assert.ok(mock.nodes['subPosition'].textContent.includes('주관식 1 /'));

// 테스트 3: 주관식 정답 작성 및 제출 테스트
const subAnswer = mock.nodes['subAnswer'];
subAnswer.value = 'torch.tensor(token_ids)'; // 임의 값 입력
const submitSub = mock.nodes['submitSubjective'];

// 제출 버튼 이벤트 발송
const submitFns = mock.eventListeners['submitSubjective:click'] || [];
assert.ok(submitFns.length > 0, 'submitSubjective click listener bound');
submitFns[0]();

// 피드백 영역에 채점 결과가 출력되는지 검증
const subFeedback = mock.nodes['subFeedback'];
assert.ok(subFeedback.textContent.length > 0, 'Feedback rendered');
assert.ok(subFeedback.classList.contains('correct') || subFeedback.classList.contains('wrong'));

// 테스트 4: localStorage에 시도 이력이 정상 저장되었는지 검증
const savedJson = mock.mockLocalStorage.getItem('ai-coding-recall-html-v2');
assert.ok(savedJson, 'Storage saved under key');
const parsed = JSON.parse(savedJson);
assert.ok(parsed.questions && Object.keys(parsed.questions).length > 0, 'Questions tracked');

// 테스트 5: subAnswer에 keydown 이벤트(Ctrl+Enter) 리스너가 연결되어 있는지 검증
const keydownFns = mock.eventListeners['subAnswer:keydown'] || [];
assert.ok(keydownFns.length > 0, 'subAnswer Ctrl+Enter keydown listener registered');

console.log('✓ test_subject_app: All 5 subject engine integration assertions passed.');
