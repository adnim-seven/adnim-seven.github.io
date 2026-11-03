'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),http=require('http');
const ROOT=path.resolve(__dirname,'..');assert(fs.existsSync(path.join(ROOT,'study-plan/index.html')),'일정표 HTML이 있어야 한다');
const {chromium}=require(require.resolve('playwright',{paths:[ROOT,'C:/Users/rael0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules']}));
const server=http.createServer((req,res)=>{let f=path.resolve(ROOT,'.'+decodeURIComponent(req.url.split('?')[0]));if(f!==ROOT&&!f.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.STUDY_PLAN_BASE||`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,...(fs.existsSync(chromium.executablePath())?{}:{channel:'chrome'})});
 try{
  for(const width of [1280,390]){
   const context=await browser.newContext({viewport:{width,height:850}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
   await page.goto(base+'/');await page.locator('a[href="study-plan/"]').click();await page.waitForSelector('[data-day]');
   assert.strictEqual(await page.locator('[data-day]').count(),14);assert.strictEqual(await page.locator('input[data-complete]').count(),14);
   assert((await page.locator('#progressText').innerText()).includes('0 / 14'));
   await page.locator('#done-2026-11-04').check();assert((await page.locator('#progressText').innerText()).includes('1 / 14'));
   await page.reload();assert(await page.locator('#done-2026-11-04').isChecked());
   await page.locator('[data-filter="practice"]').click();assert.strictEqual(await page.locator('[data-day]:visible').count(),3);
   assert.strictEqual(await page.locator('[data-day="2026-11-14"] a[href="../exam-recall-october/"]').count(),1);
   await page.locator('[data-filter="all"]').click();assert.strictEqual(await page.locator('[data-day]:visible').count(),14);
   await page.locator('#goToday').click();assert.strictEqual(await page.locator('[data-day]:visible').count(),14);
   const before=await page.locator('#progressText').innerText();await page.locator('[data-filter="learn"]').click();assert.strictEqual(await page.locator('[data-day]:visible').count(),10);assert.strictEqual(await page.locator('#progressText').innerText(),before);
   await page.evaluate(()=>localStorage.setItem('ai-specialist-october-recall-v1','keep-exam-answer'));
   await page.locator('#resetProgress').click();assert((await page.locator('#progressText').innerText()).includes('0 / 14'));
   assert.strictEqual(await page.evaluate(()=>localStorage.getItem('ai-specialist-october-recall-v1')),'keep-exam-answer');
   await page.evaluate(()=>localStorage.setItem('ai-specialist-study-plan-2026-11-17-v1','{broken'));await page.reload();assert.strictEqual(await page.locator('[data-day]').count(),14);
   assert((await page.locator('body').evaluate(e=>e.scrollWidth))<=width+1,'mobile horizontal overflow');assert.deepStrictEqual(errors,[]);
   if(width===390&&process.env.STUDY_PLAN_SCREENSHOT)await page.screenshot({path:process.env.STUDY_PLAN_SCREENSHOT,fullPage:false});
   await context.close();
  }
  const clockContext=await browser.newContext(),clockPage=await clockContext.newPage();
  await clockPage.clock.install({time:new Date('2026-11-04T14:59:57Z')});await clockPage.clock.pauseAt(new Date('2026-11-04T14:59:58Z'));
  await clockPage.goto(base+'/study-plan/');assert((await clockPage.locator('#focusTitle').innerText()).includes('11월 4일'));
  await clockPage.clock.runFor(3000);assert((await clockPage.locator('#focusTitle').innerText()).includes('11월 5일'),'KST 자정이 지나면 오늘 일정이 자동 갱신되어야 한다');
  assert((await clockPage.locator('#countdown').innerText()).includes('D-12'));await clockContext.close();
  const context=await browser.newContext();await context.addInitScript(()=>Storage.prototype.setItem=function(){throw new Error('quota');});const p=await context.newPage();await p.goto(base+'/study-plan/');await p.locator('#done-2026-11-04').check();assert((await p.locator('#storageStatus').innerText()).includes('저장 불가'));assert((await p.locator('#progressText').innerText()).includes('1 / 14'));await context.close();
  for(const subject of ['llm','rag','data','vision','on-device']){const p=await browser.newPage({viewport:{width:1280,height:850}});await p.goto(base+'/'+subject+'/');const box=await p.locator('.sidebar').boundingBox();assert(box&&box.width>150);await p.close();}
  console.log('PASS: study plan desktop/mobile, home link, 14 days, check/reload, filters, safe reset, storage failure, five sidebars');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
