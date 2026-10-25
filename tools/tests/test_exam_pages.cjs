'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '../..');
const subjects = ['llm', 'rag', 'data', 'vision', 'on-device'];
let pages = 0, blanks = 0;
for (const subject of subjects) {
  const dir = path.join(ROOT, subject, 'inline-subjective');
  for (const file of fs.readdirSync(dir).filter(n => n.endsWith('.html') && n !== 'index.html')) {
    const html = fs.readFileSync(path.join(dir, file), 'utf8');
    const ctx = {window: {}}; vm.createContext(ctx);
    const scriptFiles = [...html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"/g)].map(m => m[1]);
    assert(scriptFiles.some(s => s.endsWith('/exam-answer.js')), `${subject}/${file}: common answer checker must be loaded`);
    for (const script of scriptFiles.filter(s => /_data\.js$/.test(s))) {
      vm.runInContext(fs.readFileSync(path.resolve(dir, script), 'utf8'), ctx);
    }
    const cells = ctx.window.SUBJECTIVE_EXAM_DATA?.cells || ctx.window.RAG_SUBJECTIVE_CELLS;
    assert(Array.isArray(cells) && cells.length, `${subject}/${file}: usable cells`);
    const markers = cells.flatMap(c => [...c.source.matchAll(/\[\[BLANK:([^\]]+)\]\]/g)].map(m => m[1]));
    assert.strictEqual(new Set(markers).size, markers.length, `${subject}/${file}: duplicate marker`);
    if (ctx.window.SUBJECTIVE_EXAM_DATA?.blanks) {
      const items = ctx.window.SUBJECTIVE_EXAM_DATA.blanks;
      assert.deepStrictEqual([...markers].sort(), items.map(b => b.id).sort(), `${subject}/${file}: markers/answers must correspond one to one`);
      assert(items.every(b => typeof b.answer === 'string' && b.answer.trim()), `${subject}/${file}: nonempty answers`);
    }
    pages++; blanks += markers.length;
  }
}
console.log(`PASS: ${pages} actual page/data contracts; ${blanks} unique blank locations`);
