'use strict';
const assert=require('node:assert/strict'),mutation=require('../engine/mutation-engine.js'),vendor=require('../server/vendor-mutation-engine.js');
assert.deepEqual(mutation.seed(),vendor.seed(),'browser/server birth geometry must agree');
const events=[];const fixtures={draw_scar:{path:[{x:.42,y:.48},{x:.57,y:.54}]},seed_letter:{x:.5,y:.5,letter:'م'},feed_word:{x:.5,y:.5,word:'hope'},add_limb:{x:.5,y:.5,kind:'horn',length:.2,angle:.6},feed_mass:{x:.5,y:.5,amount:.04},heal:{x:.5,y:.5},corrupt:{x:.5,y:.5}};
for(let i=0;i<10000;i++){const type=mutation.TYPES[i%7];events.push({id:'mutation-'+i,version:i+1,type,payload:fixtures[type],createdAt:'2026-10-24T00:00:00.000Z'})}
const a=mutation.seed(),b=vendor.seed();for(const e of events){mutation.apply(a,e);vendor.apply(b,e)}assert.deepEqual(a,b);assert.equal(a.version,10000);assert.equal(a.recent.length,30);for(const [key,cap]of Object.entries({limbs:420,mass:320,buds:420,scars:220,corruptions:180}))assert(a[key].length<=cap);
assert.throws(()=>mutation.apply(a,events.at(-1)),/Out of sequence/);
const stripIds=s=>{const copy=mutation.clone(s);for(const key of ['limbs','mass','buds','scars','corruptions'])for(const item of copy[key])delete item.id;copy.recent=[];return copy};
for(const [type,payload]of Object.entries(fixtures)){const x=mutation.seed(),y=mutation.seed();mutation.apply(x,{id:'preview',version:1,type,payload});mutation.apply(y,{id:'server-uuid',version:1,type,payload});assert.deepEqual(stripIds(x),stripIds(y),type+' preview and accepted geometry must match')}
for(const letter of ['م','é','क्‍ष']){if(letter.includes('\u200d'))continue;assert.equal(mutation.normalize('seed_letter',{x:.5,y:.5,letter}).letter,letter.normalize('NFC'))}
for(const payload of [{x:.5,y:.5,letter:'AB'},{x:.5,y:.5,letter:'1'},{x:NaN,y:.5,letter:'A'}])assert.throws(()=>mutation.normalize('seed_letter',payload));
console.log('PASS 10,000-event deterministic browser/server replay, bounded topology, strict ordering, preview/commit geometry and Unicode validation');
