'use strict';
const assert = require('assert');

// 1. canonical & scoreAnswer 알고리즘 단위 테스트
function canonical(value) {
  return String(value || '').trim().replace(/\s+/g, '').replace(/'/g, '"');
}

function scoreAnswer(answer, accepted) {
  const value = canonical(answer);
  return Boolean(value) && accepted.some((item) => canonical(item) === value);
}

console.log('--- [Unit Test] Scoring & Canonicalization ---');

// 테스트 1: 공백 및 줄바꿈 허용 테스트
assert.strictEqual(canonical('  x = torch.randn( 2, 3 )  '), 'x=torch.randn(2,3)');
assert.strictEqual(canonical('x\n=\ntorch.randn(2,\n3)'), 'x=torch.randn(2,3)');

// 테스트 2: 작은따옴표와 큰따옴표 동등 취급
assert.strictEqual(canonical("model.save('weights.pt')"), 'model.save("weights.pt")');
assert.strictEqual(scoreAnswer("model.save('weights.pt')", ['model.save("weights.pt")']), true);
assert.strictEqual(scoreAnswer('model.save("weights.pt")', ["model.save('weights.pt')"]), true);

// 테스트 3: 빈 입력 및 공백 입력 판정
assert.strictEqual(scoreAnswer('', ['x = 1']), false);
assert.strictEqual(scoreAnswer('   \n\t  ', ['x = 1']), false);
assert.strictEqual(scoreAnswer(null, ['x = 1']), false);
assert.strictEqual(scoreAnswer(undefined, ['x = 1']), false);

// 테스트 4: 복수 허용 정답 (accepted_answers) 판정
const acceptedAnswers = [
  'nn.Linear(d_in, d_out)',
  'torch.nn.Linear(d_in, d_out)',
  'nn.Linear(d_in, d_out, bias=True)'
];
assert.strictEqual(scoreAnswer('nn.Linear( d_in , d_out )', acceptedAnswers), true);
assert.strictEqual(scoreAnswer('torch.nn.Linear(d_in, d_out)', acceptedAnswers), true);
assert.strictEqual(scoreAnswer('nn.Conv2d(d_in, d_out)', acceptedAnswers), false);

// 테스트 5: 다중 라인 코드 블록 채점
const multilineAns = 'attn_scores = queries @ keys.transpose(1, 2)\nattn_weights = torch.softmax(attn_scores, dim=-1)';
const multilineUser = 'attn_scores = queries @ keys.transpose( 1, 2 )\nattn_weights = torch.softmax( attn_scores, dim=-1 ) ';
assert.strictEqual(scoreAnswer(multilineUser, [multilineAns]), true);

console.log('✓ test_scoring: All 5 assertion groups passed.');
