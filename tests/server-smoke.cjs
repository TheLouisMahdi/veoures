'use strict';
// Node 18+; pure built-in smoke test for shared multi-client event storage.
const { spawn, spawnSync } = require('node:child_process');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const port = 18765;
const origin = `http://127.0.0.1:${port}`;
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'veoures-test-'));
const pathToServer = path.resolve(__dirname, '../server/server.js');
const storage = path.join(temp, 'private', 'data.json');
const web = path.join(temp,'public'); fs.mkdirSync(web); fs.writeFileSync(path.join(web,'index.html'),'<h1>VEOURES test</h1>'); fs.mkdirSync(path.join(web,'server')); fs.writeFileSync(path.join(web,'server','secret.js'),'private implementation'); fs.writeFileSync(path.join(web,'.env'),'private');
const wait = ms => new Promise(done => setTimeout(done, ms));
async function run() {
  const unsafe=spawnSync(process.execPath,[pathToServer],{env:{...process.env,PORT:String(port),PUBLIC_DIR:web,VEOURES_DATA_FILE:path.join(web,'private.json')},encoding:'utf8',timeout:3000});assert.notEqual(unsafe.status,0);assert.match(unsafe.stderr,/must be outside PUBLIC_DIR/);

  let server = spawn(process.execPath, [pathToServer], { env: { ...process.env, PORT: String(port), PUBLIC_DIR: web, VEOURES_DATA_FILE: storage }, stdio: 'pipe' });
  try {
    let ready = false;
    for (let i = 0; i < 80; i++) {
      await wait(100);
      try { if ((await fetch(origin+'/api/organism')).ok) { ready = true; break; } } catch {}
    }
    assert(ready, 'server must start');
    const get = (token, since=0) => fetch(origin+`/api/organism?since=${since}`, { headers: { 'X-Veoures-Visitor': token } }).then(r => r.json());
    const post = async (token, type, payload, requestId) => {
      const response = await fetch(origin+'/api/mutations',{method:'POST',headers:{'Content-Type':'application/json','X-Veoures-Visitor':token},body:JSON.stringify({type,payload,requestId})});
      return {status:response.status,body:await response.json()};
    };
    const a = 'veoures-alpha-client';
    const b = 'veoures-beta-client';
    const events = [
      [a,'draw_scar',{path:[{x:.4,y:.4},{x:.6,y:.6}]}],
      [b,'seed_letter',{x:.45,y:.5,letter:'م'}],
      [a,'feed_word',{x:.45,y:.5,word:'alive'}],
      [b,'add_limb',{x:.52,y:.52,kind:'horn',angle:.3,length:.17}],
      [a,'feed_mass',{x:.5,y:.5,amount:.03}],
      [b,'heal',{x:.5,y:.5}],
      [a,'corrupt',{x:.6,y:.4}]
    ];
    for (const [token,type,payload] of events) {
      const result = await post(token,type,payload,'mutation-'+type);
      assert.equal(result.status,201,JSON.stringify(result));
      assert.equal(result.body.event.version,events.findIndex(e=>e[1]===type)+1);
      await wait(720); // server throttle checks burst requests
    }
    const repeated = await post(a,events[0][1],events[0][2],'mutation-draw_scar');
    assert.equal(repeated.status,200,'retry must return original event'); assert.equal(repeated.body.event.version,1);
    assert.equal((await post(a,'heal',{x:.5,y:.5},'mutation-draw_scar')).status,409,'same request ID cannot change meaning');
    const raw = async (body,contentType='application/json') => { const response=await fetch(origin+'/api/mutations',{method:'POST',headers:{'Content-Type':contentType,'X-Veoures-Visitor':b},body});return response.status; };
    assert.equal(await raw('{broken'),400); assert.equal(await raw('null'),400); assert.equal(await raw('[]'),400);
    assert.equal(await raw(JSON.stringify({type:'heal',payload:{x:.5,y:.5}}),'text/plain'),415);
    assert.equal(await raw(JSON.stringify({type:'feed_word',payload:{x:.5,y:.5,word:'x'.repeat(17000)}})),413);
    for(const [type,payload] of [['unknown',{}],['draw_scar',{path:[{x:0,y:0}]}],['seed_letter',{x:.5,y:.5,letter:'AB'}],['feed_word',{x:.5,y:.5,word:'<script>'}],['add_limb',{x:.5,y:.5,kind:'other',length:.2,angle:0}],['feed_mass',{x:.5,y:.5,amount:Infinity}],['heal',{x:-1,y:.5}]]) assert.equal((await post(b,type,payload)).status,400);
    for(const route of ['/api/organism?since=-1','/api/organism?since=NaN','/api/organism?since=1.5']) assert.equal((await fetch(origin+route)).status,400);
    for(const route of ['/server/secret.js','/Server/secret.js','/server./secret.js','/%73erver/secret.js','/%5c%5cserver%5csecret.js','/%5cserver%5csecret.js','/.env','/%2eenv','/tests/server-smoke.cjs']) assert.equal((await fetch(origin+route)).status,404,route);
    const head=await fetch(origin+'/',{method:'HEAD'});assert.equal(head.status,200);assert.equal(head.headers.get('x-veoures-mode'),'shared');assert.equal(await head.text(),'');
    let state = await get(b,0);
    assert.equal(state.version,7);
    assert.equal(state.events.length,7);
    assert(state.events.every(e=>!('visitor' in e)&&!('requestId' in e)),'visitor IDs must be hidden');
    assert.equal(state.owned.length,3);
    state = await get(a,4);
    assert.equal(state.events.length,3,'incremental sync should return only missing updates');
    const bad = await post(b,'feed_mass',{x:100,y:0,amount:.02});
    assert.equal(bad.status,400);
    const fifth = await post(b,'heal',{x:.5,y:.5});
    assert.equal(fifth.status,201);
    await wait(720);
    const sixth = await post(b,'heal',{x:.5,y:.5});
    assert.equal(sixth.status,429,'four accepted changes per personal day');
    assert.equal((await get(a)).version,8,'rejected requests must not consume quota or version');
    const concurrent=await Promise.all(['parallel-client-a','parallel-client-b','parallel-client-c'].map(token=>post(token,'heal',{x:.5,y:.5})));
    assert(concurrent.every(r=>r.status===201));assert.deepEqual(concurrent.map(r=>r.body.event.version).sort((a,b)=>a-b),[9,10,11]);
    server.kill('SIGTERM'); await wait(350);
    server = spawn(process.execPath,[pathToServer],{env:{...process.env,PORT:String(port),PUBLIC_DIR:web,VEOURES_DATA_FILE:storage},stdio:'pipe'});
    await wait(500);
    const afterRestart = await get(b);
    assert.equal(afterRestart.version,11, 'accepted mutations must persist across restart');
    console.log('PASS 7 tools, two contributors, privacy, incremental replay, malformed/oversized input, static path guards, idempotency, concurrent ordering, four/personal-day quota and persistent restart');
  } finally { server.kill('SIGTERM'); fs.rmSync(temp,{recursive:true,force:true}); }
}
run().catch(e=>{console.error(e);process.exitCode=1});
