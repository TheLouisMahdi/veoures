// Read-only production QA: never submits mutations or contributor preferences.
'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const contexts=await Promise.all([browser.newContext(),browser.newContext()]),errors=[],bad=[],writes=[],shots=[];
 const out=process.env.QA_OUTPUT||path.resolve(__dirname,'../docs/natural-life');fs.mkdirSync(out,{recursive:true});
 try{
  const pages=await Promise.all(contexts.map(c=>c.newPage()));
  for(const p of pages){p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)bad.push({status:r.status(),url:r.url()})});p.on('request',r=>{if(!['GET','HEAD','OPTIONS'].includes(r.method()))writes.push(r.method()+' '+r.url())});const r=await p.goto(process.env.SITE_URL||'https://veoures.poimu82.chatgpt.site/');assert.equal(r.status(),200);await p.waitForFunction(()=>window.veoures?.engine.ready&&veoures.sync.mode==='shared');}
  const snapshots=await Promise.all(pages.map(p=>p.evaluate(()=>({version:veoures.engine.state.version,events:veoures.engine.events.map(e=>({id:e.id,version:e.version,type:e.type,payload:e.payload,createdAt:e.createdAt}))}))));
  assert.deepEqual(snapshots[0],snapshots[1]);const p=pages[0];
  assert.equal(await p.evaluate(()=>veoures.audio.context),null);
  assert.deepEqual(await p.locator('[data-tool]').evaluateAll(es=>es.map(e=>e.dataset.tool)),['add_limb','grow_eye','feed_mass']);
  if(await p.locator('#help-overlay').evaluate(e=>e.open))await p.locator('#help-close').click();
  await p.locator('#leaderboard').click();await p.waitForFunction(()=>document.querySelector('#ranking-message').textContent==='');assert(await p.locator('#ranking-results').innerText());await p.locator('#ranking-close').click();
  await p.locator('#sound').click();await p.waitForFunction(()=>veoures.audio.context?.state==='running');await p.waitForTimeout(2400);assert(await p.evaluate(()=>veoures.audio.heartBeats>=2));await p.locator('#sound').click();await p.waitForFunction(()=>veoures.audio.context.state==='suspended');
  for(const width of [390,1440]){await p.setViewportSize({width,height:width===390?844:900});await p.waitForTimeout(500);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const filename='production-'+width+'.png';await p.screenshot({path:path.join(out,filename)});shots.push(filename);}
  const applicationWrites=writes.filter(r=>!new URL(r.slice(r.indexOf(' ')+1)).pathname.startsWith('/cdn-cgi/'));
  assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(applicationWrites,[]);
  const result={result:'PASS read-only production',version:snapshots[0].version,twoIndependentClients:true,tools:3,heartbeatOptIn:true,rankings:true,errors,bad,applicationWrites,platformChallengeRequests:writes.length-applicationWrites.length,screenshots:shots};fs.writeFileSync(path.join(out,'production-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
