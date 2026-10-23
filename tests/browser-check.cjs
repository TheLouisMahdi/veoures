// Optional browser QA. No browser package is shipped with the application.
'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const local=process.env.STATIC_URL||'http://127.0.0.1:8012/',shared=process.env.SHARED_URL||'http://127.0.0.1:8013/';
const out=process.env.QA_OUTPUT||path.join(require('node:os').tmpdir(),'veoures-trace-qa');fs.mkdirSync(out,{recursive:true});
const tools=['draw_scar','feed_mass','leave_text'],reports=[],errors=[],httpErrors=[];let browser;
function watch(p){p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_INTERNET_DISCONNECTED|net::ERR_FAILED/.test(m.text()))errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)httpErrors.push([r.status(),r.url()])})}
async function ready(p,url=local){await p.goto(url);await p.waitForFunction(()=>window.veoures&&['local','shared'].includes(veoures.sync.mode));}
async function choose(p,type){await p.locator('[data-tool="'+type+'"]').click();if(type==='leave_text')await p.locator('textarea').fill('ردی از ما — We were here');}
async function commit(p,version){if(await p.evaluate(()=>veoures.sync.mode==='shared'))await p.waitForTimeout(750);await p.locator('#commit').click();await p.waitForFunction(v=>veoures.engine.state.version===v||document.getElementById('message').textContent.startsWith('Not confirmed:'),version);assert.equal(await p.evaluate(()=>veoures.engine.state.version),version,await p.locator('#message').textContent());}
async function stats(p){return p.evaluate(()=>({version:veoures.engine.state.version,count:veoures.sync.todayCount(),state:JSON.stringify(veoures.engine.state),preview:!!veoures.renderer.preview,hash:VeouresMutation.hash(document.querySelector('canvas').toDataURL())}))}
async function main(){
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 for(const width of [320,390,768,1440,1920]){
  const c=await browser.newContext({viewport:{width,height:width<700?844:900},deviceScaleFactor:width<700?3:1,reducedMotion:'reduce'}),p=await c.newPage();watch(p);let mp3=0;p.on('request',r=>{if(r.url().includes('.mp3'))mp3++});await ready(p);
  assert.deepEqual(await p.locator('[data-tool]').evaluateAll(bs=>bs.map(b=>b.dataset.tool)),tools);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(mp3,0);assert.equal(await p.locator('#sound').getAttribute('aria-pressed'),'false');assert.equal(await p.evaluate(()=>veoures.renderer.raf),0);
  assert.deepEqual(await p.locator('button:visible').evaluateAll(bs=>bs.filter(b=>{const r=b.getBoundingClientRect();return r.width<43||r.height<43}).map(b=>b.id)),[]);
  await p.screenshot({path:path.join(out,'viewport-'+width+'.png')});
  await choose(p,'leave_text');await p.locator('#preview').click();assert(await p.evaluate(()=>veoures.renderer.zoom>=4));await commit(p,1);await p.locator('#read-traces').click();assert.equal(await p.locator('#pan-view').getAttribute('aria-pressed'),'true');await p.screenshot({path:path.join(out,'text-zoom-'+width+'.png')});
  await p.locator('#inspect').click();assert((await p.locator('#archive').textContent()).includes('ردی از ما'));await p.keyboard.press('Tab');assert(await p.evaluate(()=>document.getElementById('inspector').contains(document.activeElement)));await p.keyboard.press('Escape');await c.close();reports.push(width+'px: three tools, targets, no overflow, reduced motion, no MP3, text zoom and accessible inspector PASS');
 }
 console.log('PASS responsive and text views');
 // All current tools: previews never consume quota, cancel restores, reload has no reaction.
 {
  const c=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}),p=await c.newPage();watch(p);await ready(p);await p.evaluate(()=>{const now=Date.now();veoures.engine.now=()=>now});
  for(let i=0;i<tools.length;i++){
   await choose(p,tools[i]);let before=await stats(p);await p.locator('#preview').click();let next=await stats(p);assert.equal(next.version,before.version);assert.equal(next.count,before.count);assert(next.preview);
   await p.locator('#cancel').click();assert.equal((await stats(p)).count,before.count);assert.equal((await stats(p)).state,before.state);if(tools[i]!=='leave_text')assert.equal((await stats(p)).hash,before.hash);
   await p.locator('#preview').click();await commit(p,i+1);
  }
  const saved=await stats(p);await p.reload();await p.waitForFunction(()=>window.veoures?.sync.mode==='local');assert.equal((await stats(p)).state,saved.state);assert.equal(await p.evaluate(()=>veoures.renderer.reactions.length),0);
  await choose(p,'leave_text');await p.locator('textarea').fill('<script>');await p.locator('#preview').click();assert(await p.locator('#commit').isDisabled());assert.equal((await stats(p)).count,3);
  await choose(p,'feed_mass');await p.locator('#preview').click();await commit(p,4);await p.locator('#preview').click();await commit(p,5);await p.locator('#preview').click();assert(await p.locator('#commit').isDisabled());assert.equal((await stats(p)).count,5);
  // All visual ageing uses accepted timestamps, while canonical state remains unchanged.
  const ageing=await p.evaluate(()=>{const s=veoures.engine.state,stamp=Date.parse(s.scars[0].createdAt),before=JSON.stringify(s),item=s.scars[0],r=veoures.renderer;const values=[0,2,4].map(h=>VeouresMutation.life(item,stamp+h*3600000));veoures.engine.now=()=>stamp+4*3600000;r.draw(0);return{values,same:JSON.stringify(s)===before,textCount:r.textCount}});assert.equal(ageing.values[0],1);assert(ageing.values[1]>.3&&ageing.values[1]<.5);assert.equal(ageing.values[2],0);assert(ageing.same);
  await c.close();reports.push('all tools: preview/cancel/commit/reload; text validation; quota; deterministic 0/2/4-hour ageing without history deletion PASS');
 }
 console.log('PASS tool lifecycle and ageing');
 // Mouse, keyboard positioning, zoom coordinate inversion and navigation isolation.
 {
  const c=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}),p=await c.newPage();watch(p);await ready(p);
  await p.mouse.move(700,390);await p.mouse.down();await p.mouse.move(870,470,{steps:18});await p.mouse.up();assert(await p.evaluate(()=>veoures.renderer.preview.path.length>3));await p.keyboard.press('Escape');assert.equal((await stats(p)).preview,false);
  await p.locator('canvas').focus();await p.keyboard.press('ArrowRight');await p.keyboard.press('Enter');assert(await p.locator('#commit').evaluate(b=>b===document.activeElement));await p.keyboard.press('Enter');await p.waitForFunction(()=>veoures.engine.state.version===1);
  await p.locator('#zoom-in').click();await p.locator('#pan-view').click();const before=await stats(p);await p.mouse.move(740,370);await p.mouse.down();await p.mouse.move(780,400,{steps:4});await p.mouse.up();assert.equal((await stats(p)).preview,false);assert.equal((await stats(p)).count,before.count);
  assert(await p.evaluate(()=>{const r=veoures.renderer,[x,y]=r.xy(.45,.55),b=r.canvas.getBoundingClientRect(),p=r.locate({clientX:b.left+r.cx+(x-r.cx)*r.zoom+r.pan.x,clientY:b.top+r.cy+(y-r.cy)*r.zoom+r.pan.y});return Math.abs(p.x-.45)<.00001&&Math.abs(p.y-.55)<.00001}));
  await p.locator('canvas').focus();await p.keyboard.press('0');assert.equal(await p.evaluate(()=>veoures.renderer.zoom),1);await c.close();reports.push('mouse scar; keyboard preview/commit/zoom/reset; pan never contributes; transformed input coordinates PASS');
 }
 console.log('PASS mouse and keyboard');
 // Real touch events: pinch cancels an unfinished stroke, then touch drawing still works.
 {
  const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),p=await c.newPage();watch(p);await ready(p);const session=await c.newCDPSession(p);
  const touch=async(type,points)=>session.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y,id])=>({x,y,id,radiusX:2,radiusY:2,force:1}))});
  await touch('touchStart',[[140,320,0]]);await touch('touchStart',[[140,320,0],[240,320,1]]);await touch('touchMove',[[110,320,0],[270,320,1]]);await touch('touchEnd',[]);assert(await p.evaluate(()=>veoures.renderer.zoom>1));assert.equal((await stats(p)).preview,false);assert.equal((await stats(p)).count,0);
  await p.evaluate(()=>veoures.renderer.resetView());await p.waitForTimeout(450);await touch('touchStart',[[150,320,0]]);await touch('touchMove',[[180,335,0]]);await touch('touchMove',[[210,350,0]]);await touch('touchEnd',[]);assert((await stats(p)).preview);await p.waitForTimeout(350);await p.locator('#commit').tap();await p.waitForFunction(()=>veoures.engine.state.version===1);await c.close();reports.push('touch pinch cancels partial scar without quota; touch drawing and explicit commit PASS');
 }
 console.log('PASS touch');
 // Real Worker + SQLite: two browsers see accepted animation once and replay the same state.
 {
  const ca=await browser.newContext({viewport:{width:1440,height:900}}),cb=await browser.newContext({viewport:{width:390,height:844}}),a=await ca.newPage(),b=await cb.newPage();watch(a);watch(b);await ready(a,shared);await ready(b,shared);assert.equal(await a.evaluate(()=>veoures.sync.mode),'shared');const start=(await stats(a)).version;
  await a.mouse.move(690,400);await a.mouse.down();await a.mouse.move(840,440,{steps:12});await a.mouse.up();await a.screenshot({path:path.join(out,'scar-preview.png')});assert.equal(await a.evaluate(()=>veoures.renderer.reactions.length),0);await commit(a,start+1);assert(await a.evaluate(()=>veoures.renderer.reactions.some(a=>a.kind==='scars')));await a.waitForTimeout(200);await a.screenshot({path:path.join(out,'scar-accepted.png')});await a.waitForTimeout(1100);await a.screenshot({path:path.join(out,'scar-absorption.png')});await a.waitForTimeout(2100);await a.screenshot({path:path.join(out,'scar-tissue.png')});
  await b.evaluate(()=>veoures.sync.poll());await b.waitForFunction(v=>veoures.engine.state.version===v,start+1);await b.waitForTimeout(3300);await b.evaluate(()=>veoures.sync.poll());assert.equal(await b.evaluate(()=>veoures.renderer.reactions.length),0);
  for(const [i,type]of ['feed_mass','leave_text'].entries()){await choose(a,type);await a.locator('#preview').click();await commit(a,start+i+2);assert(await a.evaluate(()=>veoures.renderer.reactions.length>0));await a.waitForTimeout(900);await a.screenshot({path:path.join(out,type+'-reaction.png')});}
  await b.evaluate(()=>veoures.sync.poll());assert.equal((await stats(a)).state,(await stats(b)).state);await b.reload();await b.waitForFunction(v=>window.veoures?.engine.state.version===v,start+3);assert.equal((await stats(a)).state,(await stats(b)).state);assert.equal(await b.evaluate(()=>veoures.renderer.reactions.length),0);
  // A rejected commit retains the preview and does not create a success animation.
  await a.waitForTimeout(3300);await choose(a,'feed_mass');await a.locator('#preview').click();const prior=await stats(a);
  // Exercise the real error path through a network interruption instead of a false accepted event.
  await ca.setOffline(true);await a.locator('#commit').click();await a.waitForFunction(()=>veoures.sync.mode==='disconnected');assert.equal((await stats(a)).count,prior.count);assert.equal((await stats(a)).preview,true);assert.equal(await a.evaluate(()=>veoures.renderer.reactions.length),0);await ca.setOffline(false);await a.evaluate(async()=>{if(veoures.sync.inFlight)await veoures.sync.inFlight;await veoures.sync.poll()});assert.equal(await a.evaluate(()=>veoures.sync.mode),'shared');
  await ca.close();await cb.close();reports.push('public Worker: two-client identical state, live reactions once, quiet reload, offline rejection retains preview and quota PASS');
 }
 // Audio opt-in, visibility suspension, and bounded rendering under CPU emulation.
 {
  const c=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3}),p=await c.newPage();watch(p);let mp3=0;p.on('request',r=>{if(r.url().includes('.mp3'))mp3++});await ready(p);assert.equal(mp3,0);await p.locator('#sound').click();await p.waitForFunction(()=>veoures.audio.ambient&&!veoures.audio.ambient.paused);assert(mp3>0);await p.locator('#sound').click();assert(await p.evaluate(()=>!veoures.audio.enabled&&!veoures.audio.ambient));
  assert(await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));return veoures.renderer.raf===0}));await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))});
  await p.evaluate(()=>{for(let i=0;i<24;i++){const type=['draw_scar','feed_mass','leave_text'][i%3],payload=type==='draw_scar'?{path:[{x:.42,y:.46},{x:.51,y:.51},{x:.59,y:.56}]}:type==='feed_mass'?{x:.48+(i%3)*.02,y:.5,amount:.04}:{x:.64,y:.62,text:'ردی از ما — We were here'};veoures.engine.receive({id:'stress-'+i,version:veoures.engine.state.version+1,type,payload,createdAt:new Date().toISOString()})}veoures.renderer.refresh()});
  const session=await c.newCDPSession(p);await session.send('Emulation.setCPUThrottlingRate',{rate:4});const sample=await p.evaluate(()=>new Promise(resolve=>{const r=veoures.renderer,original=r.draw.bind(r),samples=[];r.draw=t=>{const start=performance.now();original(t);samples.push(performance.now()-start)};setTimeout(()=>{r.draw=original;samples.sort((a,b)=>a-b);resolve({draws:samples.length,p95:samples[Math.floor(samples.length*.95)],max:samples.at(-1),dpr:r.dpr})},2500)}));assert(sample.draws>30);assert(sample.dpr<=1.5);reports.push({cpuThrottle4x:sample});await c.close();reports.push('sound off initially; opt-in/off; hidden RAF stops; DPR cap PASS');
 }
 assert.deepEqual(errors,[]);assert.deepEqual(httpErrors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({reports,errors,httpErrors},null,2));console.log(JSON.stringify({reports,errors,httpErrors},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>browser?.close());
