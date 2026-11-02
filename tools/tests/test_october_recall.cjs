'use strict';
// Catches missing recalled targets, masking extra context, and broken multiline restoration.
const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm'),cp=require('child_process'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),file=path.join(root,'exam-recall-october/questions.js');
assert(fs.existsSync(file),'10월 실제 기출 복원 데이터가 생성되어야 한다');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const qs=ctx.window.OCTOBER_RECALL;
assert.strictEqual(qs.length,10);
const expectedCounts={LLM:3,RAG:2,Data:1,Vision:2,'On-device':2},counts={};
const restored=[];
for(const q of qs){
 counts[q.subject]=(counts[q.subject]||0)+1;
 assert(q.source_cells.length&&q.notebook&&q.scope&&q.argument_sources.length);
 const original=fs.readFileSync(path.resolve(root,'../..',q.source_path));
 assert.strictEqual(crypto.createHash('sha256').update(original).digest('hex'),q.source_sha256,'원본 출처가 바뀌면 재생성·검토해야 한다');
 assert(q.slots.length>0);let code=q.code;
 for(const s of q.slots){
  assert(s.answer.trim()&&s.why&&s.task&&s.origin==='actual-recall');
  assert(!('points' in s),'배점 미상: 임의 점수를 추가하지 않는다');
  assert.strictEqual(code.split('{{'+s.key+'}}').length-1,1);
  code=code.replace('{{'+s.key+'}}',(match,offset)=>{
   const prefix=code.slice(code.lastIndexOf('\n',offset)+1,offset);
   return /^[ \t]*$/.test(prefix)?s.answer.split('\n').join('\n'+prefix):s.answer;
  });
 }
 assert.strictEqual(code,q.completed_code,`${q.id}: 정답을 채우면 문맥 코드가 정확히 복원되어야 한다`);
 assert(!code.includes('????'));
 if(q.scope!=='module-cells')assert(code.includes('class '+q.scope)||code.includes('def '+q.scope));
 restored.push({id:q.id,code});
}
assert.deepStrictEqual(counts,expectedCounts);
const mcpClient=qs.find(q=>q.id==='rag-1');
assert.strictEqual(mcpClient.slots.length,4,'import는 제공하고 Client·ToolSpec·tools·resources 네 곳만 출제한다');
assert(mcpClient.code.includes('from llama_index.tools.mcp import BasicMCPClient, McpToolSpec'));
assert(mcpClient.code.includes('from llama_index.core.agent.workflow import FunctionAgent, ToolCallResult, ToolCall'));
assert(mcpClient.code.includes('from llama_index.core.workflow import Context'));
assert.deepStrictEqual(Array.from(mcpClient.slots,s=>s.key),['D','E','F','G'],'기존 구현 답안 저장 ID를 바꾸지 않는다');
const agentQuestion=qs.find(q=>q.id==='rag-2');
assert(agentQuestion.slots.some(s=>s.answer==='FunctionAgent'),'Agent 생성 클래스도 복원 대상이어야 한다');
for(const value of ['tools','self.llm','SYSTEM_PROMPT'])assert(agentQuestion.slots.some(s=>s.answer===value),'안내대로 keyword 값만 입력해 복원할 수 있어야 한다: '+value);
const allAnswers=qs.flatMap(q=>q.slots.map(s=>s.answer)).join('\n');
for(const target of ['tokenizer.encode(prompt)','keys.transpose(1, 2)','queries.transpose(1, 2)','values.transpose(1, 2)','context_vec.contiguous().view(b, num_tokens, self.d_out)','BasicMCPClient(external_mcp_server)','await mcp_tool.fetch_resources()','nn.Embedding(n_users, 32)'])assert(allAnswers.includes(target),target);
assert(qs.find(q=>q.id==='vision-2').slots.some(s=>/nn\.Conv2d\(3, 64/.test(s.answer)));
assert(!qs.find(q=>q.id==='vision-2').slots.some(s=>/nn\.Identity|model\.fc/.test(s.answer)),'참고 문맥을 추가 문제로 만들지 않는다');
const py=cp.spawnSync(process.env.PYTHON||'python',['-X','utf8','-c',"import ast,json,sys\nfor q in json.load(sys.stdin): ast.parse(q['code'],filename=q['id'])\nprint('10 restored source scopes parse')"],{input:JSON.stringify(restored),encoding:'utf8'});
assert.strictEqual(py.status,0,py.stderr);
console.log(`PASS: October recall — 10 groups, ${qs.reduce((n,q)=>n+q.slots.length,0)} actual-recall blanks, no invented points, exact restoration + Python AST`);
