const fs=require('fs'),vm=require('vm'),path=require('path');
const overrides=require('./mock-exam-overrides.cjs');
const surrounding=require('./mock-exam-surrounding.cjs');
const specs=[
['LLM','llm','course_data.js',[
['exam-llm02-06','exam-llm04-01','exam-llm04-06'],
['exam-llm06a-03','exam-llm06a-04','exam-llm06b-03'],
['exam-llm04-08','exam-llm04-09','exam-llm07-03'],
['exam-llm03-05','exam-llm06b-01','exam-llm07d-03']]],
['RAG','rag','rag_course_data.js',[
['exam-rag01-03','exam-rag01-05','exam-rag02-05'],
['exam-rag04-01','exam-rag04-03','exam-rag04-04'],
['exam-rag06-05','exam-rag06-06','exam-rag06-07'],
['exam-rag03-03','exam-rag06-04','exam-rag05-08']]],
['Data','data','data_course_data.js',[
['exam-data01-04','exam-data01-05','exam-data01-02'],
['exam-data02-02','exam-data02-03','exam-data02-04'],
['exam-data01-07','exam-data01-08','exam-data01-09'],
['exam-data02-08','exam-data02-06','exam-data02-09']]],
['Vision','vision','vision_course_data.js',[
['exam-v01-03','exam-v02-02','exam-v02-03'],
['exam-v03-02','exam-v03-03','exam-v03-04'],
['exam-v04-05','exam-v04-06','exam-v04-08'],
['exam-v02-06','exam-v01-09','exam-v01-06']]],
['On-device AI','on-device','on_device_course_data.js',[
['exam-od1-02','exam-od1-04','exam-od1-05'],
['exam-od1-08','exam-od2-03','exam-od2-05'],
['exam-od3-04','exam-od3-05','exam-od3-03'],
['exam-od4-02','exam-od4-03','exam-od5-02']]]];
function statements(answer){const result=[];let acc=[],depth=0;for(const line of answer.split('\n')){acc.push(line);const text=line.replace(/#.*$/,'').replace(/"[^"\n]*"|'[^'\n]*'/g,'');depth+=(text.match(/[([{]/g)||[]).length-(text.match(/[)\]}]/g)||[]).length;if(depth===0){result.push(acc.join('\n'));acc=[];}}if(acc.length)result.push(acc.join('\n'));return result;}
const exams=[[],[],[],[]], audit=[];
for(const [subject,dir,data,rounds] of specs){const c={window:{},queueMicrotask:()=>{}};vm.createContext(c);for(const file of [data,'exam_overrides.js'])vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),c);const pool=c.window.LLM_COURSE.chapters.flatMap(x=>x.subjective||[]);
rounds.forEach((ids,r)=>ids.forEach((id,i)=>{const s=pool.find(x=>x.id===id);if(!s)throw Error(id);const parts=statements(s.answer),points=[5,7,8][i];if(parts.length>points)throw Error('too many slots '+id);const original=(s.problem_context||'').split('\n'),holeLines=original.filter(x=>x.includes('????'));let code,method;
if(holeLines.length===parts.length){let k=0;code=original.map(line=>line.includes('????')?line.match(/^\s*/)[0]+'{{'+String.fromCharCode(65+k++)+'}}':line).join('\n');method='context';}
else{code=`# 원본 함수의 핵심 구현 블록\n# 입력·출력: ${s.tensor_flow}\n`+parts.map((p,k)=>p.match(/^\s*/)[0]+'{{'+String.fromCharCode(65+k)+'}}').join('\n');method='block';}
const slots=parts.map((answer,k)=>({key:String.fromCharCode(65+k),points:Math.floor(points/parts.length)+(k<points%parts.length?1:0),answer:answer.trim(),alternatives:[],why:s.explanation+'\n재도전: '+(s.retry||'답을 가리고 다시 구현하세요.')}));
const o=overrides[id]||{};if(o.answers)for(const [k,a] of Object.entries(o.answers))slots[k].answer=a;
const q={id:`${specs.findIndex(x=>x[0]===subject)+1}-${i+1}`,subject,title:s.topic,source:s.file+' · 강의 코드 기반 재구성',prompt:(o.prompt||s.prompt)+' '+(id==='exam-llm03-05'?'':'각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. ')+(s.tensor_flow?'입출력: '+s.tensor_flow:''),code:o.code||code,slots};exams[r].push(q);audit.push({round:r+2,id,method,parts:parts.length,holes:holeLines.length,code:q.code,answer:slots.map(s=>s.answer).join('\n')});}));}
for(let r=0;r<4;r++){const n=r+2,dir='mock-exam-'+n;exams[r]=exams[r].map(q=>q.id.endsWith('-1')&&surrounding[n+'/'+q.subject]?{...surrounding[n+'/'+q.subject],id:q.id}:q);fs.mkdirSync(dir,{recursive:true});let html=fs.readFileSync('mock-exam-1/index.html','utf8').replaceAll('모의고사 1회','모의고사 '+n+'회').replace('href="style.css"','href="../mock-exam-1/style.css"').replace('<script src="app.js"></script>','<script src="../mock-exam-1/app.js"></script>');fs.writeFileSync(dir+'/index.html',html);fs.writeFileSync(dir+'/questions.js',`window.EXAM_NUMBER=${n};\nwindow.EXAM=${JSON.stringify(exams[r],null,2)};\n`);}
fs.writeFileSync('mock-exam-audit.json',JSON.stringify(audit,null,2));console.log(audit.filter(x=>x.method==='block').map(x=>({round:x.round,id:x.id,parts:x.parts,holes:x.holes})));console.log('Generated 60 questions, '+exams.map(x=>x.reduce((n,q)=>n+q.slots.reduce((m,s)=>m+s.points,0),0)).join(','));
