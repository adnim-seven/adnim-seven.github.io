#!/usr/bin/env node
// 사이트 전체 정적 검증: 로컬 링크, 태그 짝, 하드코딩 도메인 여부, JS 문법, 과목 데이터 로드, 페이지 템플릿 규칙.
// 사용: node tools/validate_site.cjs   (저장소 루트 또는 아무 위치에서 실행 가능)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const SUBJECTS = ['llm', 'vision', 'on-device', 'rag', 'data'];
const REQUIRED = ['index.html', 'course_data.js', 'subject.config.js', 'exam_overrides.js', 'inline_exam_data.js', 'inline-subjective/index.html'];
const errors = [], warnings = [];
const rel = p => path.relative(ROOT, p).replace(/\\/g, '/');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}
const files = walk(ROOT);

// 1) HTML 로컬 참조 + 태그 짝 + 하드코딩 도메인 검사
for (const f of files.filter(f => f.endsWith('.html'))) {
  const html = fs.readFileSync(f, 'utf8');
  if (html.includes('https://adnim-seven.github.io')) {
    errors.push(`[domain] ${rel(f)}: 하드코딩된 https://adnim-seven.github.io 링크 발견`);
  }
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    let link = m[1];
    if (/^(https?:|mailto:|#|javascript:|data:)/.test(link) || link.includes('${')) continue;
    link = link.split(/[?#]/)[0];
    if (!link) continue;
    let target = link.startsWith('/') ? path.join(ROOT, link) : path.resolve(path.dirname(f), link);
    if (link.endsWith('/')) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) errors.push(`[link] ${rel(f)} -> ${m[1]}`);
  }
  // div로 열고 a로 닫는 패턴 (2026-09-13 장애 유형)
  for (const m of html.matchAll(/<div\b[^>]*>[^<]*<\/a>/g)) errors.push(`[tag] ${rel(f)}: div가 </a>로 닫힘: ${m[0].slice(0, 80)}`);
  for (const m of html.matchAll(/<div class="subject-title"[^>]*>([\s\S]*?)<\/(div|a)>/g))
    if (m[2] !== 'div') errors.push(`[tag] ${rel(f)}: .subject-title 닫는 태그 오류`);
  const opens = (html.match(/<div\b/g) || []).length, closes = (html.match(/<\/div>/g) || []).length;
  if (opens !== closes) warnings.push(`[tag] ${rel(f)}: <div> ${opens}개 / </div> ${closes}개`);
}

// 2) JS 문법
for (const f of files.filter(f => /\.(js|cjs)$/.test(f))) {
  try { new vm.Script(fs.readFileSync(f, 'utf8').replace(/^#!.*/, ''), { filename: rel(f) }); }
  catch (e) { errors.push(`[js] ${rel(f)}: ${e.message}`); }
}

// 3) 과목 폴더 규칙 + 페이지 구조 규칙 + 데이터 로드
for (const s of SUBJECTS) {
  const dir = path.join(ROOT, s);
  for (const r of REQUIRED) if (!fs.existsSync(path.join(dir, r))) errors.push(`[subject] ${s}/${r} 없음`);
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  if (!html.includes('id="notebookOverview"')) errors.push(`[structure] ${s}/index.html: #notebookOverview 누락`);
  if (!html.includes('class="home-link"')) errors.push(`[structure] ${s}/index.html: .home-link 누락`);
  if (!html.includes("inline-subjective/")) errors.push(`[structure] ${s}/index.html: inline-subjective 이동 버튼 누락`);

  const listHtml = fs.readFileSync(path.join(dir, 'inline-subjective/index.html'), 'utf8');
  if (!listHtml.includes('subjective-list.css')) errors.push(`[structure] ${s}/inline-subjective/index.html: subjective-list.css 미연결`);
  if (!listHtml.includes('class="list-nav"')) errors.push(`[structure] ${s}/inline-subjective/index.html: .list-nav 누락`);

  for (const tf of fs.readdirSync(path.join(dir, 'inline-subjective')).filter(n => n.endsWith('_subjective_test.html'))) {
    const th = fs.readFileSync(path.join(dir, 'inline-subjective', tf), 'utf8');
    if (!th.includes('subjective-test.css') || !th.includes('subjective-test-app.js') || !th.includes('data-storage-key=')) {
      errors.push(`[structure] ${s}/inline-subjective/${tf}: 공통 템플릿 미적용`);
    }
  }

  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1].split('?')[0]);
  const dataScripts = scripts.filter(x => !x.startsWith('../') && x !== 'app.js' && /data|overrides|scope/.test(x));
  const ctx = { window: {}, document: { addEventListener() {}, querySelector() { return null; } }, queueMicrotask() {}, console };
  vm.createContext(ctx);
  try {
    for (const x of dataScripts) vm.runInContext(fs.readFileSync(path.join(dir, x), 'utf8'), ctx, { filename: `${s}/${x}` });
    const course = ctx.window.LLM_COURSE;
    if (!course || !Array.isArray(course.chapters) || !course.chapters.length) errors.push(`[data] ${s}: window.LLM_COURSE.chapters 없음`);
    else console.log(`  ${s.padEnd(10)} chapters=${course.chapters.length} subjective=${course.chapters.reduce((n, c) => n + (c.subjective || []).length, 0)}`);
  } catch (e) { errors.push(`[data] ${s}: ${e.message}`); }
}

for (const w of warnings) console.log('WARN ' + w);
for (const e of errors) console.log('FAIL ' + e);
console.log(`\n${errors.length ? 'FAILED' : 'OK'}: errors=${errors.length} warnings=${warnings.length} html=${files.filter(f => f.endsWith('.html')).length}`);
process.exit(errors.length ? 1 : 0);
