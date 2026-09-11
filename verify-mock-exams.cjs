const fs=require('fs'),vm=require('vm'),cp=require('child_process');
let count=0;const codeSamples=[];
for(let round=2;round<=5;round++){
 const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(`mock-exam-${round}/questions.js`,'utf8'),c);
 const totals={};if(c.window.EXAM_NUMBER!==round||c.window.EXAM.length!==15)throw Error('round metadata');
 for(const q of c.window.EXAM){totals[q.subject]=(totals[q.subject]||0)+q.slots.reduce((n,s)=>n+s.points,0);let code=q.code;
 for(const s of q.slots){if(!code.includes('{{'+s.key+'}}')||!s.answer||s.points<1)throw Error('slot '+q.id);code=code.replace(new RegExp('^(\\s*)\\{\\{'+s.key+'\\}\\}','m'),(_,indent)=>s.answer.split('\n').map(line=>indent+line).join('\n'));code=code.replace('{{'+s.key+'}}',s.answer);}
 if(code.includes('{{')||code.includes('????'))throw Error('unfilled '+q.id);codeSamples.push({id:round+'/'+q.id,code});count++;}
 if(Object.keys(totals).length!==5||Object.values(totals).some(x=>x!==20))throw Error('points');console.log(`Round ${round}: 15 questions, five subjects x 20 points`);
}
const py=cp.spawnSync('python',['-X','utf8','-c',`import ast,json,sys\nerrors=[]\nfor item in json.load(sys.stdin):\n try: ast.parse(item['code'])\n except SyntaxError as e: errors.append(item['id']+': '+str(e))\nprint(json.dumps(errors,ensure_ascii=False))\nsys.exit(bool(errors))`],{input:JSON.stringify(codeSamples),encoding:'utf8'});
console.log(py.stdout||py.stderr);if(py.error||py.status)process.exit(1);console.log(`${count} reconstructed code snippets parse successfully.`);
