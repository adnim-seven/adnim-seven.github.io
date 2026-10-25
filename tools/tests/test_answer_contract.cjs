'use strict';
const assert = require('assert');
const checker = require('../../assets/js/exam-answer.js');

// These expectations are independent of the checker: formatting may change,
// but strings, names, operators and assignment destinations must not.
const cases = [
  ['torch.cat( (idx, idx_next), dim = 1 )', 'torch.cat((idx, idx_next), dim=1)', true],
  ["entry['chosen']", 'entry["chosen"]', true],
  ['torch.nn.Linear(d_in, d_out)', 'nn.Linear(d_in, d_out)', true],
  ['SimpleDirectoryReader(input_dir="data").load_data()', 'SimpleDirectoryReader("data").load_data()', true],
  ['VectorStoreIndex.from_documents(documents=documents)', 'VectorStoreIndex.from_documents(documents)', true],
  ['entry["chosen response"]', 'entry["chosenresponse"]', false],
  ['returnx', 'return x', false],
  ['x = wrong(x)', 'y = wrong(x)', false],
  ['queries @ keys.transpose(1, 2)', 'queries * keys.transpose(1, 2)', false],
  ['logits[:, 1, :]', 'logits[:, -1, :]', false],
  ['f(a=1, b=2)', 'f(a=1, b=3)', false],
  ['torch.softmax(scores, dim=1)', 'torch.softmax(scores, dim=-1)', false],
  ['input_feat[n] * W.abs()', 'torch.abs(W) * input_feat[n]', true],
  ['"unterminated', '"unterminated', false],
  ['', '', false],
  ['  ', 'x', false],
];
for (const [actual, expected, want] of cases) {
  assert.strictEqual(checker.isCorrect(actual, expected), want, JSON.stringify({actual, expected}));
}
assert(checker.isCorrect('weights.view(-1, 1)', 'weights.reshape(row, 1)', ['weights.view(-1, 1)']));
console.log(`PASS: answer contract (${cases.length + 1} cases, real production checker)`);
