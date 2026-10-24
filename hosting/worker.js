/* VEOURES public hosting adapter. The build embeds the unchanged browser app. */
/*__GEOMETRY__*/
const mutation = (() => { const module={exports:{}}; /*__MUTATION__*/ return module.exports; })();
const ASSETS = /*__ASSETS__*/{};
const COOKIE='__Host-veoures', SESSION_LIFE=30*86400000;
const encoder=new TextEncoder(), salts=new WeakMap();
const security={
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'; img-src 'self' data:; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com https://*.chatgpt.site",
  'X-Veoures-Mode':'shared'
};
function json(status,body,headers={}){return new Response(JSON.stringify(body),{status,headers:{...security,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}})}
async function hash(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))),b=>b.toString(16).padStart(2,'0')).join('')}
async function network(db,request,day){
  if(!salts.has(db))salts.set(db,(async()=>{await db.prepare("INSERT INTO settings (key,value) VALUES ('network-salt',?) ON CONFLICT(key) DO NOTHING").bind(crypto.randomUUID()+crypto.randomUUID()).run();return(await db.prepare("SELECT value FROM settings WHERE key='network-salt'").first()).value})().catch(error=>{salts.delete(db);throw error}));
  return hash((await salts.get(db))+'|'+day+'|'+(request.headers.get('CF-Connecting-IP')||'unknown-network'));
}
function cookieToken(request){const token=request.headers.get('Cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);return /^[a-f0-9]{64}$/.test(token||'')?token:null}
async function session(db,request,net,now,create){
  const token=cookieToken(request);
  if(token){const id=await hash(token);if(await db.prepare('SELECT id FROM sessions WHERE id=? AND expires_ms>?').bind(id,now).first())return{id};}
  if(!create)return null;
  const value=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');const id=await hash(value);
  const result=await db.batch([
    db.prepare('DELETE FROM sessions WHERE expires_ms<?').bind(now),
    db.prepare('INSERT INTO sessions(id,network,created_ms,expires_ms) SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM sessions WHERE network=?)<20').bind(id,net,now,now+SESSION_LIFE,net)
  ]);
  return result[1].meta.changes?{id,cookie:COOKIE+'='+value+'; Path=/; Max-Age=2592000; Secure; HttpOnly; SameSite=Strict'}:null;
}
function publicEvent(row){return{id:row.id,version:row.version,type:row.type,payload:JSON.parse(row.payload),createdAt:row.created_at,...(row.public_id?{contributor:{id:row.public_id,name:row.public_name||'Anonymous contributor'}}:{})}}
const canonicalCache=new WeakMap();
async function canonical(db){let cached=canonicalCache.get(db);if(!cached)cached=mutation.seed();const result=await db.prepare('SELECT id,version,type,payload,created_at FROM events WHERE version>? ORDER BY version').bind(cached.version).all();for(const row of result.results)if(row.version>cached.version)mutation.apply(cached,publicEvent(row));canonicalCache.set(db,cached);return cached}
async function contributor(db,who,create=false){if(!who)return null;const found=await db.prepare('SELECT c.* FROM contributors c JOIN contributor_sessions s ON s.contributor_id=c.id WHERE s.session_id=?').bind(who.id).first();if(found||!create)return found;const id=crypto.randomUUID();await db.batch([db.prepare('INSERT INTO contributors(id,quota_key,created_ms) VALUES(?,?,?) ON CONFLICT(quota_key) DO NOTHING').bind(id,who.id,Date.now()),db.prepare('INSERT INTO contributor_sessions(session_id,contributor_id) SELECT ?,id FROM contributors WHERE quota_key=? ON CONFLICT(session_id) DO NOTHING').bind(who.id,who.id)]);return contributor(db,who,false)}
const publicProfile=c=>c?{id:c.id,name:c.name,listed:!!c.listed}:null;
async function identity(db,request,create){const now=Date.now(),day=new Date(now).toISOString().slice(0,10),net=await network(db,request,day),who=await session(db,request,net,now,create),profile=await contributor(db,who);return{now,day,net,who,profile,key:profile?.quota_key||who?.id||'unavailable'}}
async function bodyJSON(request){const reader=request.body?.getReader();let size=0,chunks=[];if(reader)while(true){const{done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();throw Error('Body too large')}chunks.push(value)}const bytes=new Uint8Array(size);let at=0;for(const c of chunks){bytes.set(c,at);at+=c.length}const data=JSON.parse(new TextDecoder().decode(bytes));if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Invalid request');return data}
async function profileRequest(request,db,url){if(request.headers.get('Origin')!==url.origin)return json(403,{error:'Open VEOURES directly.'});if(!(request.headers.get('Content-Type')||'').startsWith('application/json'))return json(415,{error:'Use application/json'});const context=await identity(db,request,false);if(!context.who)return json(401,{error:'Start a session first.'});let input;try{input=await bodyJSON(request)}catch{return json(400,{error:'Invalid profile request'})}
 if(input.action==='recover'){if(!/^[a-f0-9]{64}$/.test(input.key||''))return json(400,{error:'Invalid recovery key'});const owner=await db.prepare('SELECT * FROM contributors WHERE recovery_hash=?').bind(await hash(input.key)).first();if(!owner)return json(400,{error:'Recovery key not recognized'});await db.prepare('INSERT INTO contributor_sessions(session_id,contributor_id) VALUES(?,?) ON CONFLICT(session_id) DO UPDATE SET contributor_id=excluded.contributor_id').bind(context.who.id,owner.id).run();return json(200,{profile:publicProfile(owner)})}
 const profile=await contributor(db,context.who,true);
 if(input.action==='create-recovery'){const key=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');await db.prepare('UPDATE contributors SET recovery_hash=? WHERE id=?').bind(await hash(key),profile.id).run();return json(200,{profile:publicProfile(profile),key})}
 if(input.action==='preferences'){let name;try{name=mutation.authorName(input.name)}catch(error){return json(400,{error:error.message})}if(typeof input.listed!=='boolean')return json(400,{error:'Choose public leaderboard participation'});await db.prepare('UPDATE contributors SET name=?,listed=? WHERE id=?').bind(name,input.listed?1:0,profile.id).run();return json(200,{profile:{id:profile.id,name,listed:input.listed}})}return json(400,{error:'Unknown profile action'});
}
async function leaderboard(request,db,url){const range=url.searchParams.get('range')||'all',metric=url.searchParams.get('sort')||'total',offset=Number(url.searchParams.get('offset')||0),limit=20,cutoff=range==='24h'?Date.now()-86400000:range==='7d'?Date.now()-604800000:range==='all'?0:null,columns={total:'total',impact:'impact',evolution:'influence',recent:'recent'};
 if(cutoff===null||!Object.hasOwn(columns,metric)||!Number.isSafeInteger(offset)||offset<0||offset>10000)return json(400,{error:'Invalid ranking filter'});
 const profileId=url.searchParams.get('profile');if(profileId){if(!/^[a-f0-9-]{36}$/.test(profileId))return json(400,{error:'Invalid contributor'});const context=await identity(db,request,false),c=await db.prepare('SELECT * FROM contributors WHERE id=?').bind(profileId).first();if(!c||!c.listed&&context.profile?.id!==c.id)return json(404,{error:'Contributor is private'});
 const rows=await db.prepare('SELECT id,version,type,payload,created_at,impact_score,evolution_score,region FROM events WHERE contributor_id=? AND created_ms>=? ORDER BY version DESC LIMIT 20 OFFSET ?').bind(c.id,cutoff,offset).all();const stats=await db.prepare("SELECT COUNT(*) total,COALESCE(SUM(impact_score),0) impact,COALESCE(SUM(evolution_score),0) influence,COUNT(DISTINCT region) regions,SUM(CASE WHEN type='add_limb' THEN 1 ELSE 0 END) limbs,SUM(CASE WHEN type='grow_eye' THEN 1 ELSE 0 END) eyes,SUM(CASE WHEN type='feed_mass' THEN 1 ELSE 0 END) mass FROM events WHERE contributor_id=? AND created_ms>=?").bind(c.id,cutoff).first();const milestones=await db.prepare('SELECT version FROM events WHERE contributor_id=? AND version%414=0 ORDER BY version').bind(c.id).all();return json(200,{profile:publicProfile(c),stats,milestones:milestones.results,events:rows.results.map(r=>({...publicEvent(r),impact:r.impact_score,influence:r.evolution_score,region:r.region})),nextOffset:rows.results.length===limit?offset+limit:null})}
 const rows=await db.prepare(`SELECT c.id,c.name,COUNT(*) total,SUM(e.impact_score) impact,SUM(e.evolution_score) influence,MAX(e.created_ms) recent FROM events e JOIN contributors c ON c.id=e.contributor_id WHERE c.listed=1 AND e.created_ms>=? GROUP BY c.id ORDER BY ${columns[metric]} DESC,c.id ASC LIMIT 20 OFFSET ?`).bind(cutoff,offset).all();return json(200,{range,sort:metric,rows:rows.results.map((r,i)=>({...r,name:r.name||'Anonymous contributor',rank:offset+i+1})),nextOffset:rows.results.length===limit?offset+limit:null,formula:'Impact = 10 + round(min(40, estimated mature tissue area × 20000)) + min(8, 2 × regional connections). Influence = 1 + regional connections + min(4, floor(area × 1000)). Only accepted anatomical events count; retries count once. Display names are not verified identities. Legacy name-only credits are unverified and excluded.'});
}
async function readOrganism(request,db,url){
  const since=Number(url.searchParams.get('since')||0);if(!Number.isSafeInteger(since)||since<0)return json(400,{error:'Invalid version'});
  const now=Date.now(),day=new Date(now).toISOString().slice(0,10),net=await network(db,request,day),who=await session(db,request,net,now,true);
  const profile=await contributor(db,who),ownerKey=profile?.quota_key||who?.id||'unavailable';
  const window=mutation.quotaWindow(ownerKey,now),sinceTime=new Date(window.start).toISOString();
  const [head,events,owned]=await db.batch([
    db.prepare('SELECT COALESCE(MAX(version),0) AS version FROM events'),
    db.prepare('SELECT e.id,e.version,e.type,e.payload,e.created_at,CASE WHEN c.listed=1 THEN c.id END public_id,CASE WHEN c.listed=1 THEN c.name END public_name FROM events e LEFT JOIN contributors c ON c.id=e.contributor_id WHERE e.version>? ORDER BY e.version').bind(since),
    db.prepare('SELECT id,created_at,request_id FROM events WHERE visitor=? AND created_at>=? ORDER BY version').bind(ownerKey,sinceTime)
  ]);
  return json(200,{epoch:1,serverTime:now,version:head.results[0].version,events:events.results.map(publicEvent),owned:owned.results.map(r=>({id:r.id,createdAt:r.created_at,requestId:r.request_id})),canContribute:!!who,profile:publicProfile(profile),quota:{...window,remaining:Math.max(0,mutation.LIMIT-owned.results.length)}},who?.cookie?{'Set-Cookie':who.cookie}:{});
}
async function commit(request,db,url){
  if(request.headers.get('Origin')!==url.origin||request.headers.get('Sec-Fetch-Site')==='cross-site')return json(403,{error:'Open VEOURES directly to contribute.'});
  if(!(request.headers.get('Content-Type')||'').toLowerCase().startsWith('application/json'))return json(415,{error:'Use application/json'});
  if(Number(request.headers.get('Content-Length')||0)>16384)return json(413,{error:'Request exceeds 16 KB limit'});
  // Read with a hard bound, rather than buffering an untrusted stream without limit.
  const reader=request.body?.getReader();let size=0,chunks=[];
  if(reader){while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();return json(413,{error:'Request exceeds 16 KB limit'})}chunks.push(value)}}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
  let input,payload;try{input=JSON.parse(new TextDecoder().decode(bytes));if(!input||typeof input.type!=='string'||!/^[A-Za-z0-9_-]{8,96}$/.test(input.requestId||''))throw Error('Invalid change or request ID');payload=mutation.normalize(input.type,input.payload)}catch(error){return json(400,{error:error.message||'Invalid request'})}
  const now=Date.now(),day=new Date(now).toISOString().slice(0,10),net=await network(db,request,day),who=await session(db,request,net,now,false);
  if(!who)return json(401,{error:'Reload to start a contribution session. Cookies must be enabled.'});
  const profile=await contributor(db,who,true),ownerKey=profile.quota_key;
  const window=mutation.quotaWindow(ownerKey,now),sinceTime=new Date(window.start).toISOString();
  const requested=mutation.intent(payload),createdAt=new Date(now).toISOString();
  const previous=await db.prepare('SELECT * FROM events WHERE visitor=? AND request_id=?').bind(ownerKey,input.requestId).first();
  if(previous){if(previous.type!==input.type||JSON.stringify(mutation.intent(JSON.parse(previous.payload)))!==JSON.stringify(requested))return json(409,{error:'This request ID already belongs to a different change'});return json(200,{event:publicEvent(previous)})}
  if(payload.schema!==3)return json(400,{error:'Choose Grow Limb, Grow Eye or Feed Mass.'});
  let state;try{state=await canonical(db);payload=mutation.prepare(state,input.type,payload,now)}catch(error){return json(400,{error:error.message})}
  const body=JSON.stringify(payload),baseVersion=state.version;
  // Conditional INSERT is the atomic quota/rate/idempotency boundary across isolates.
  const [insert,accepted]=await db.batch([
    db.prepare(`INSERT INTO events(id,visitor,network,request_id,created_at,created_ms,type,payload,contributor_id,impact_score,evolution_score,region)
      SELECT ?,?,?,?,?,?,?,?,?,?,?,?
      WHERE (SELECT COALESCE(MAX(version),0) FROM events)=? AND NOT EXISTS(SELECT 1 FROM events WHERE visitor=? AND request_id=?)
      AND (SELECT COUNT(*) FROM events WHERE visitor=? AND created_at>=?)<4
      AND (SELECT COUNT(*) FROM events WHERE network=? AND created_at>=?)<100
      AND NOT EXISTS(SELECT 1 FROM events WHERE network=? AND created_ms>?)`).bind(crypto.randomUUID(),ownerKey,net,input.requestId,createdAt,now,input.type,body,profile.id,payload.effect.impact,payload.effect.influence,payload.region,baseVersion,ownerKey,input.requestId,ownerKey,sinceTime,net,day,net,now-700),
    db.prepare('SELECT * FROM events WHERE visitor=? AND request_id=?').bind(ownerKey,input.requestId)
  ]);
  const row=accepted.results[0];if(row){if(row.type!==input.type||JSON.stringify(mutation.intent(JSON.parse(row.payload)))!==JSON.stringify(requested))return json(409,{error:'This request ID already belongs to a different change'});if(insert.meta.changes){await db.prepare('UPDATE contributors SET name=?,listed=? WHERE id=?').bind(payload.author||'',payload.leaderboard?1:0,profile.id).run();const accepted=publicEvent(row);if(payload.leaderboard)accepted.contributor={id:profile.id,name:payload.author||'Anonymous contributor'};return json(201,{event:accepted})}return json(200,{event:publicEvent(row)})}
  const count=await db.prepare('SELECT COUNT(*) AS count FROM events WHERE visitor=? AND created_at>=?').bind(ownerKey,sinceTime).first();
  if(count.count>=4)return json(429,{error:'Your four changes are resting. The next opening is shown below.',quota:{...window,remaining:0}});
  if((await canonical(db)).version!==baseVersion)return json(409,{bodyChanged:true,error:'The living tissue changed. Review your preview before committing.'});
  return json(429,{error:'Please slow down. This network may have reached its daily contribution limit.'},{'Retry-After':'1'});
}
function asset(request,url){
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:security});
  const name=url.pathname==='/'?'index.html':url.pathname.slice(1);const item=ASSETS[name];if(!item)return new Response('Not found',{status:404,headers:security});
  const bytes=Uint8Array.from(atob(item.base64),c=>c.charCodeAt(0)),headers={...security,'Content-Type':item.type,'Cache-Control':/\.(png|webp|svg|mp3)$/.test(name)?'public, max-age=86400':'no-cache'};
  if(request.method==='HEAD')return new Response(null,{headers:{...headers,'Content-Length':String(bytes.length)}});
  const range=request.headers.get('Range');if(range){const m=/^bytes=(\d+)-(\d*)$/.exec(range);if(m){const start=Number(m[1]),end=Math.min(m[2]?Number(m[2]):bytes.length-1,bytes.length-1);if(start>end||start>=bytes.length)return new Response(null,{status:416,headers:{...headers,'Content-Range':'bytes */'+bytes.length}});return new Response(bytes.slice(start,end+1),{status:206,headers:{...headers,'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${bytes.length}`}})}}
  return new Response(bytes,{headers:{...headers,'Accept-Ranges':'bytes'}});
}
export default {async fetch(request,env){const url=new URL(request.url);if(!url.pathname.startsWith('/api/'))return asset(request,url);try{if(!env.DB)return json(503,{error:'Shared storage is unavailable. Please retry later.'});if(url.pathname==='/api/health'&&request.method==='GET'){await env.DB.prepare('SELECT 1').first();return json(200,{status:'ok',persistence:'shared'})}if(url.pathname==='/api/profile'&&request.method==='POST')return await profileRequest(request,env.DB,url);if(url.pathname==='/api/leaderboard'&&request.method==='GET')return await leaderboard(request,env.DB,url);if(url.pathname==='/api/organism'&&request.method==='GET')return await readOrganism(request,env.DB,url);if(url.pathname==='/api/mutations'&&request.method==='POST')return await commit(request,env.DB,url);return json(404,{error:'Unknown API route'})}catch(error){console.error('VEOURES shared storage error',error.message);return json(503,{error:'Shared storage is temporarily unavailable. Save is not confirmed; retry safely.'})}}};
