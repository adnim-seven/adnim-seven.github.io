'use strict';
// Catches answer leaks, empty grading, lost drafts, stale green answers, and mobile overflow.
const assert=require('assert'),fs=require('fs'),path=require('path'),http=require('http');
const ROOT=path.resolve(__dirname,'..');
assert(fs.existsSync(path.join(ROOT,'exam-recall-october/index.html')),'10월 복원 시험 HTML이 있어야 한다');
const {chromium}=require(require.resolve('playwright',{paths:[ROOT,'C:/Users/rael0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules']}));
const server=http.createServer((req,res)=>{let f=path.resolve(ROOT,'.'+decodeURIComponent(req.url.split('?')[0]));if(f!==ROOT&&!f.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,...(fs.existsSync(chromium.executablePath())?{}:{channel:'chrome'})});
 try{
  for(const width of [1280,390]){
   const context=await browser.newContext({viewport:{width,height:850}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
   await page.goto(base+'/exam-recall-october/');
   assert.strictEqual(await page.locator('#questions article').count(),10);
   assert.strictEqual(await page.locator('textarea[data-answer]').count(),61);
   assert.strictEqual(await page.locator('#q-rag-1 textarea').count(),4);
   assert((await page.locator('#q-rag-1 .code-context').innerText()).includes('from llama_index.tools.mcp import BasicMCPClient, McpToolSpec'));
   assert.strictEqual(await page.locator('.answer-code').count(),0,'정답은 시도 전에 DOM에 표시하지 않는다');
   await page.locator('#gradeAll').click();
   assert((await page.locator('#summary').innerText()).includes('오답 0'));
   assert((await page.locator('#summary').innerText()).includes('미채점 61'));
   const first=page.locator('textarea[data-answer]').first();const height=await first.evaluate(e=>e.clientHeight);
   await first.fill('wrong_one\nwrong_two\nwrong_three\nwrong_four');assert((await first.evaluate(e=>e.clientHeight))>height);
   await first.press('Control+Enter');assert.strictEqual(await page.locator('.answer-code').count(),1);
   assert((await page.locator('#summary').innerText()).includes('오답 1'));
   assert(await first.evaluate(e=>e.classList.contains('wrong')));
   await page.reload();assert((await first.inputValue()).includes('wrong_four'));assert((await page.locator('#lastResult').innerText()).includes('오답 1'));
   const history=await page.evaluate(()=>JSON.parse(localStorage.getItem('ai-specialist-october-recall-v1')));
   assert.strictEqual(history.history['llm-1-A'].wrong,1);
   const equivalent=page.locator('#llm-2-A');await equivalent.fill('keys.permute(0, 2, 1, 3)');await equivalent.press('Control+Enter');
   await page.locator('[data-feedback="llm-2-A"] input[data-credit]').check();
   await page.locator('#gradeAll').click();
   assert(await page.locator('#llm-2-A').evaluate(e=>e.classList.contains('correct')),'동일한 답안의 직접 인정은 재채점 때 보존되어야 한다');
   await page.evaluate(()=>{for(const q of window.OCTOBER_RECALL)for(const s of q.slots){const input=document.getElementById(q.id+'-'+s.key);input.value=s.answer;input.dispatchEvent(new Event('input',{bubbles:true}));}});
   await page.locator('#gradeAll').click();assert.strictEqual(await page.locator('textarea.correct').count(),61);
   assert((await page.locator('#summary').innerText()).includes('정답률 100%'));
   assert(!/\d+\s*점/.test(await page.locator('#summary').innerText()),'임의 배점이 표시되면 안 된다');
   await first.fill('incorrect_again');assert(!(await first.evaluate(e=>e.classList.contains('correct'))));
   assert((await page.locator('#summary').innerText()).includes('미채점 1'));
   await page.reload();assert.strictEqual(await first.inputValue(),'incorrect_again');
   assert(await page.locator('#bottomBar').evaluate(e=>getComputedStyle(e).position==='fixed'));
   assert((await page.locator('body').evaluate(e=>e.scrollWidth))<=width+1,`overflow ${width}`);
   assert.deepStrictEqual(errors,[]);
   if(width===390&&process.env.RECALL_SCREENSHOT){await first.scrollIntoViewIfNeeded();await page.screenshot({path:process.env.RECALL_SCREENSHOT});}
   await context.close();
  }
  const fileContext=await browser.newContext(),filePage=await fileContext.newPage();
  await filePage.goto(require('url').pathToFileURL(path.join(ROOT,'exam-recall-october/index.html')).href);
  assert.strictEqual(await filePage.locator('textarea[data-answer]').count(),61);await fileContext.close();
  for(const subject of ['llm','rag','data','vision','on-device']){const page=await browser.newPage({viewport:{width:1280,height:850}});await page.goto(`${base}/${subject}/`);const box=await page.locator('.sidebar').boundingBox();assert(box&&box.width>150,subject+' sidebar');await page.close();}
  console.log('PASS: October recall desktop/mobile/file, 61 blanks with imports supplied, hidden answers, skip-empty, Ctrl+Enter, history, growth, reload and five sidebars');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
