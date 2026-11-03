'use strict';
// Catches shifted dates, omitted source notebooks, incorrect totals, and unsafe persisted checks.
const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'../..'),file=path.join(ROOT,'study-plan/plan-data.js'),coreFile=path.join(ROOT,'assets/js/study-plan-core.js');
assert(fs.existsSync(file)&&fs.existsSync(coreFile),'승인된 일정 데이터와 진행률 계산이 구현되어야 한다');
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(file,'utf8'),c);
const plan=c.window.STUDY_PLAN,core=require(coreFile);
assert.strictEqual(plan.days.length,14);assert.strictEqual(plan.days[0].date,'2026-11-04');assert.strictEqual(plan.days.at(-1).date,'2026-11-17');
assert.strictEqual(plan.days.filter(d=>d.phase==='learn').length,10);
assert.strictEqual(plan.days.filter(d=>d.phase==='practice').length,3);
assert.strictEqual(plan.days.filter(d=>d.phase==='learn').reduce((n,d)=>n+d.minutes,0),1680);
assert.strictEqual(plan.days.filter(d=>d.phase==='practice').reduce((n,d)=>n+d.minutes,0),540);
const notebooks=plan.days.flatMap(d=>d.notebooks||[]);assert.strictEqual(notebooks.length,31);assert.strictEqual(new Set(notebooks).size,31);
for(const notebook of notebooks)assert(fs.existsSync(path.resolve(ROOT,'../..',notebook)),notebook);
for(const d of plan.days){assert(d.range&&d.target&&d.completion&&d.review);assert(d.links.length);assert.strictEqual(core.dateKey(new Date(d.date+'T03:00:00Z')),d.date);}
assert.strictEqual(core.dateKey(new Date('2026-11-03T15:00:00Z')),'2026-11-04');
assert.strictEqual(core.daysUntil('2026-11-03',plan.examDate),14);
assert.strictEqual(core.daysUntil('2026-11-17',plan.examDate),0);
assert.strictEqual(core.daysUntil('2026-11-18',plan.examDate),-1);
const clean=core.normalize({completed:{'2026-11-04':true,'2026-11-05':'true','unknown':true}},plan.days);
assert.deepStrictEqual(clean,{'2026-11-04':true});
assert.deepStrictEqual(core.normalize(null,plan.days),{});
assert.deepStrictEqual(core.normalize({completed:[]},plan.days),{});
const stat=core.stats(plan.days,{'2026-11-04':true,'2026-11-14':true});
assert.strictEqual(stat.done,2);assert.strictEqual(stat.total,14);assert.strictEqual(stat.percent,14);assert.strictEqual(stat.learn,1);assert.strictEqual(stat.practice,1);
assert.strictEqual(core.status('2026-11-04','2026-11-05',false),'overdue');
assert.strictEqual(core.status('2026-11-04','2026-11-05',true),'done');
assert.strictEqual(core.status('2026-11-04','2026-11-04',false),'today');
console.log('PASS: study plan — 14 days, 31 source notebooks, 28h+9h, KST dates, safe persisted checks, progress');
