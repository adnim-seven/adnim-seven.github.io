'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '../..');

console.log('--- [Unit Test] Subjective Test App Engine (VM DOM Test) ---');

function createMockDom() {
  const nodes = {};
  const eventListeners = {};
  function makeNode(tag = 'div', id = '') {
    const classSet = new Set();
    return {
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
      addEventListener(type, fn) {
        (eventListeners[id + ':' + type] ||= []).push(fn);
      },
      focus() {},
      closest() { return this; }
    };
  }

  const bodyNode = makeNode('body', 'body');
  bodyNode.dataset.storageKey = 'rag-inline-subjective-history-v1';

  const docListeners = {};
  const doc = {
    createElement(tag) { return makeNode(tag); },
    getElementById(id) {
      return nodes[id] ||= makeNode('div', id);
    },
    querySelector(sel) {
      if (sel.startsWith('#')) return this.getElementById(sel.slice(1));
      return makeNode('div');
    },
    querySelectorAll(sel) {
      return [];
    },
    addEventListener(type, fn) {
      (docListeners[type] ||= []).push(fn);
    },
    body: bodyNode
  };

  const storage = {};
  const mockLocalStorage = {
    getItem(k) { return storage[k] || null; },
    setItem(k, v) { storage[k] = String(v); },
    clear() { Object.keys(storage).forEach(k => delete storage[k]); }
  };

  return { doc, nodes, mockLocalStorage, storage, docListeners, eventListeners, bodyNode };
}

const mock = createMockDom();
const ctx = {
  window: {},
  document: mock.doc,
  localStorage: mock.mockLocalStorage,
  Date,
  console
};
vm.createContext(ctx);

// RAG 데이터 및 앱 엔진 로드
vm.runInContext(fs.readFileSync(path.join(ROOT, 'rag/inline-subjective/rag_subjective_test_data.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/subjective-test-app.js'), 'utf8'), ctx);

// 테스트 1: document 이벤트 리스너(keydown - Ctrl+Enter, Escape) 등록 확인
assert.ok(mock.docListeners['keydown']?.length > 0, 'Document keydown listener attached');

// 테스트 2: Escape 키 이벤트 전달 시 reviewModal 닫힘 확인
const modal = mock.nodes['reviewModal'];
modal.classList.add('open');
assert.strictEqual(modal.classList.contains('open'), true);
mock.docListeners['keydown'][0]({ key: 'Escape', preventDefault() {} });
assert.strictEqual(modal.classList.contains('open'), false, 'Escape closed reviewModal');

// 테스트 3: 채점 동작 검증
const checkBtn = mock.nodes['check'];
const checkFns = mock.eventListeners['check:click'] || [];
assert.ok(checkFns.length > 0, 'Check button click listener attached');

// 오답 제출
const blankInput = mock.nodes['blank-documents'];
blankInput.value = 'wrong_code()';
checkFns[0]();
assert.strictEqual(blankInput.classList.contains('wrong'), true, 'Marked as wrong');

// 정답 제출
blankInput.value = 'SimpleDirectoryReader("data").load_data()';
checkFns[0]();
assert.strictEqual(blankInput.classList.contains('correct'), true, 'Marked as correct');

// 테스트 4: localStorage 저장 확인
const saved = mock.mockLocalStorage.getItem('rag-inline-subjective-history-v1');
assert.ok(saved, 'State saved to localStorage');
const parsed = JSON.parse(saved);
assert.strictEqual(parsed['blank-documents']?.correct, true);

console.log('✓ test_subjective_app: All 4 standalone subjective engine assertions passed.');
