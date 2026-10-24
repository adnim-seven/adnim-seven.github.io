#!/usr/bin/env node
// AI Coding Recall 통합 테스트 러너 (기능별 유닛 테스트 + 사이트 무결성 검증)
// 사용법: node tools/run_all_tests.cjs
'use strict';
const cp = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEST_SCRIPTS = [
  { name: '1. 정답 채점 & 정규화 유닛테스트', file: 'tools/tests/test_scoring.cjs' },
  { name: '2. 상태 머신 & 복습 스케줄 유닛테스트', file: 'tools/tests/test_state_machine.cjs' },
  { name: '3. 과목 공통 엔진(subject-app.js) 유닛테스트', file: 'tools/tests/test_subject_app.cjs' },
  { name: '4. 독립 주관식 엔진(subjective-test-app.js) 유닛테스트', file: 'tools/tests/test_subjective_app.cjs' },
  { name: '5. 모의고사 1~5회 세션·채점 유닛테스트', file: 'tools/tests/test_mock_exam.cjs' },
  { name: '6. 전체 HTML 링크·태그 짝·도메인 정적 검증', file: 'tools/validate_site.cjs' },
  { name: '7. 모의고사 60문항 Python AST 문법 검증', file: 'tools/verify-mock-exams.cjs' },
];

console.log('================================================================================');
console.log('       AI Coding Recall 통합 단위 테스트 및 사이트 검증 스위트');
console.log('================================================================================\n');

let passed = 0;
const start = Date.now();

for (const t of TEST_SCRIPTS) {
  process.stdout.write(`▶ [RUN] ${t.name} ... `);
  const res = cp.spawnSync(process.execPath, [path.join(ROOT, t.file)], {
    cwd: ROOT,
    encoding: 'utf8'
  });

  if (res.status === 0) {
    passed++;
    console.log('\x1b[32mPASS\x1b[0m');
    if (res.stdout.trim()) {
      res.stdout.trim().split('\n').forEach(line => console.log('   ' + line));
    }
  } else {
    console.log('\x1b[31mFAIL\x1b[0m');
    console.error(res.stdout);
    console.error(res.stderr);
    console.error(`\n❌ 테스트 실패: ${t.name} (${t.file})`);
    process.exit(1);
  }
  console.log('');
}

const elapsed = ((Date.now() - start) / 1000).toFixed(2);
console.log('================================================================================');
console.log(`\x1b[32m✔ 모든 단위 테스트 및 무결성 검증 통과!\x1b[0m (${passed}/${TEST_SCRIPTS.length} 스위트, ${elapsed}초)`);
console.log('================================================================================');
