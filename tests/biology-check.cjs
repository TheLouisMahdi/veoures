'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),M=require('../engine/mutation-engine.js'),B=M.Body;
const now=Date.parse('2026-10-24T12:00:00Z'),s=M.seed();
function add(type,payload,time=now){const p=M.prepare(s,type,{schema:3,x:.5,y:.5,...payload},time),e={id:'biology-'+(s.version+1),version:s.version+1,type,payload:p,createdAt:new Date(time).toISOString()};M.apply(s,e);return e}
const eye=add('grow_eye',{x:.45,y:.45,radius:.018});
const limb=add('add_limb',{x:.56,y:.51,length:.12,mode:'internal'});
const edge=B.boundary(B.contour(s,now),.05),external=add('add_limb',{x:edge.x,y:edge.y,length:.16,mode:'external'});
const mass=add('feed_mass',{x:edge.x,y:edge.y,amount:.07,mode:'external'});
assert.throws(()=>M.prepare(s,'grow_eye',{schema:3,x:.02,y:.02,radius:.018},now));
assert.throws(()=>M.prepare(s,'grow_eye',{schema:3,x:.45,y:.45,radius:.018},now),/space|developed/);
assert.throws(()=>M.prepare(s,'add_limb',{schema:3,x:.5,y:.5,length:.12,mode:'external'},now),/boundary/);
const copy=M.clone(s),m=s.mass[0],values=[];
for(const hours of [0,6,24,48,72,168,720]){const time=now+hours*3600000,body=B.contour(s,time);values.push(B.progress(m,time));for(const organ of [...s.limbs,...s.eyes]){if(organ.schema!==3)continue;const anchor=B.anchor(body,organ),hit=B.classify(body,anchor);if(organ.attachment.zone==='external'){assert(Math.abs(hit.distance)<1e-10);const b=B.boundary(body,organ.attachment.u),out=B.local({x:B.metric(b).x+b.nx*.001,y:B.metric(b).y+b.ny*.001});assert(!B.classify(body,out).inside)}else assert(hit.inside)}assert(body.points.every(p=>p.x>0&&p.x<1&&p.y>0&&p.y<1));assert.deepEqual(s,copy)}
assert(values[0]===0&&values[1]>0&&values.at(-1)===1);assert.equal(B.vitals(s,now).pulse,0);assert(B.vitals(s,now+7200000).pulse>0);assert(B.vitals(s,now+86400000).pulse<5);
const next=B.contour(s,now+3600000),prev=B.contour(s,now+3599999);assert(Math.max(...next.points.map((p,i)=>Math.hypot(p.x-prev.points[i].x,p.y-prev.points[i].y)))<.00005);
const replay=M.seed();for(const e of [eye,limb,external,mass])M.apply(replay,e);assert.deepEqual(replay,s);assert.deepEqual(B.contour(replay,now+86400000),B.contour(s,now+86400000));
// Exact legacy genome and edition compatibility against the committed predecessor.
const expected=JSON.parse(fs.readFileSync('tests/fixtures/legacy-v2.json')),b=M.seed();
for(let i=1;i<=828;i++)M.apply(b,{id:'legacy-'+i,version:i,type:i%2?'feed_mass':'leave_text',payload:i%2?{x:.5,y:.5,amount:.03,author:'Maker'}:{x:.64,y:.62,text:'ردی از ما'},createdAt:new Date(now+i).toISOString()});
assert.equal(expected.genome,b.genome);assert.deepEqual(expected.editions,b.editions);assert.equal(expected.bornAt,b.bornAt);const legacySource=fs.readFileSync('engine/legacy-renderer.js','utf8').replace(/\r\n/g,'\n');assert.equal(crypto.createHash('sha256').update(legacySource.slice(legacySource.indexOf(' resize(){'),legacySource.indexOf(' destroy(){'))).digest('hex'),expected.rendererVisualSHA256);
// Every original file is inventoried; only optimized runtime categories are shipped.
const inventory=JSON.parse(fs.readFileSync('data/organic-inventory.json')),registry=JSON.parse(fs.readFileSync('data/organic-registry.json'));
assert.equal(inventory.files.length,563);for(const a of inventory.files){const bytes=fs.readFileSync('source-packs/organic-v2/'+a.path);assert.equal(bytes.length,a.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256)}
for(const entry of registry.assets){assert(fs.existsSync(entry.path),entry.path);assert(!/references\/|previews\/|source-packs\//.test(entry.path));}
assert.equal(registry.assets.length,282);
console.log('PASS anatomical boundary/normal/interior placement, density and spacing, continuous deformation, 0–720-hour growth, deterministic reload; exact legacy 828-event genome/editions; 282 runtime assets');


for(let p=0;p<=1;p+=.001){const layers=B.eyeStates(p,now,'eye-test');assert(Math.abs(layers.reduce((n,l)=>n+l.weight,0)-1)<1e-9);assert(layers.every(l=>l.weight>=0&&l.weight<=1))}for(const threshold of [.12,.18,.24,.62,.72,.8]){const a=B.eyeStates(threshold-1e-7,now,'eye-test'),b=B.eyeStates(threshold+1e-7,now,'eye-test');for(const state of ['bud','opening','awake','blink'])assert(Math.abs((a.find(l=>l.state===state)?.weight||0)-(b.find(l=>l.state===state)?.weight||0))<.0001)}console.log('PASS continuous eye maturity crossfades and bounded blink weights');
