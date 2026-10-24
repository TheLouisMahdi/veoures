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

const accepted=Date.parse('2026-10-24T10:00:00Z');
for(const type of ['draw_scar','feed_mass','leave_text']){
 const x=mutation.seed();const payload=type==='leave_text'?{x:.64,y:.62,text:'ردی از ما — together'}:fixtures[type];mutation.apply(x,{id:'age-check',version:1,type,payload,createdAt:new Date(accepted).toISOString()});
 const item=x[type==='draw_scar'?'scars':type==='feed_mass'?'mass':'texts'][0];assert.equal(mutation.life(item,accepted),1);assert(mutation.life(item,accepted+7200000)>.3);assert(mutation.life(item,accepted+7200000)<.5);assert.equal(mutation.life(item,accepted+mutation.LIFETIME),0);assert.equal(mutation.life(item,accepted-1000),1);assert.equal(x.recent.length,1);
}
assert.equal(mutation.normalize('leave_text',{x:.6,y:.6,text:'  سلام   دنیا  '}).text,'سلام دنیا');
for(const text of ['', '<script>', 'a'.repeat(81), 'unsafe\u202e', 'unsafe\u0000'])assert.throws(()=>mutation.normalize('leave_text',{x:.6,y:.6,text}));
assert.deepEqual(mutation.ACTIVE_TYPES,['draw_scar','feed_mass','leave_text']);
console.log('PASS three active tools, Persian text validation, deterministic timestamps and 0/2/4-hour visual ageing; event history retained');

const Life=require('../engine/life-engine.js');const variants=new Set(),forms=mutation.seed();for(let i=1;i<=828;i++){mutation.apply(forms,{id:'form-'+i,version:i,type:'feed_mass',payload:{x:.5,y:.5,amount:.04,author:i%2?'مهدی':''},createdAt:new Date(accepted+i).toISOString()});variants.add(JSON.stringify(mutation.traits(forms.genome)))}assert.equal(variants.size,828);assert.equal(forms.editions.length,2);assert.equal(forms.editions[0].version,414);assert.equal(forms.editions[1].version,828);assert(forms.editions[0].makers.includes('مهدی'));
const named=mutation.seed(),anonymous=mutation.seed();mutation.apply(named,{id:'x',version:1,type:'feed_mass',payload:{x:.5,y:.5,amount:.03,author:'Mahdi'}});mutation.apply(anonymous,{id:'y',version:1,type:'feed_mass',payload:{x:.5,y:.5,amount:.03}});assert.equal(named.genome,anonymous.genome);
const window=mutation.quotaWindow('private-person',accepted);assert.equal(window.limit,4);assert.deepEqual(mutation.quotaWindow('private-person',accepted+1000),window);assert.equal(mutation.quotaWindow('private-person',window.resetAt).resetAt,window.resetAt+86400000);
assert.notDeepEqual(Life.sample(forms,accepted,1440,900).pose,Life.sample(forms,accepted+60000,1440,900).pose);assert.deepEqual(Life.sample(forms,accepted,1440,900,true).pose,{x:0,y:0,angle:0});
const samples=new Set();for(let i=0;i<100;i++)samples.add(JSON.stringify(Life.arm(forms,10,accepted+i*5000)));assert.equal(samples.size,100);for(const author of ['<b>', 'x'.repeat(33), 'bad\u202e'])assert.throws(()=>mutation.authorName(author));
console.log('PASS 828 distinct anatomy variants, two 414-change editions, optional authors independent of shape, daily random opening, autonomous movement/tendril variation, static reduced motion');
