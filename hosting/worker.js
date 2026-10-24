/* VEOURES public hosting adapter. The build embeds the unchanged browser app. */
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
function publicEvent(row){return{id:row.id,version:row.version,type:row.type,payload:JSON.parse(row.payload),createdAt:row.created_at}}
async function readOrganism(request,db,url){
  const since=Number(url.searchParams.get('since')||0);if(!Number.isSafeInteger(since)||since<0)return json(400,{error:'Invalid version'});
  const now=Date.now(),day=new Date(now).toISOString().slice(0,10),net=await network(db,request,day),who=await session(db,request,net,now,true);
  const window=mutation.quotaWindow(who?.id||'unavailable',now),sinceTime=new Date(window.start).toISOString();
  const [head,events,owned]=await db.batch([
    db.prepare('SELECT COALESCE(MAX(version),0) AS version FROM events'),
    db.prepare('SELECT id,version,type,payload,created_at FROM events WHERE version>? ORDER BY version').bind(since),
    db.prepare('SELECT id,created_at,request_id FROM events WHERE visitor=? AND created_at>=? ORDER BY version').bind(who?.id||'',sinceTime)
  ]);
  return json(200,{epoch:1,serverTime:now,version:head.results[0].version,events:events.results.map(publicEvent),owned:owned.results.map(r=>({id:r.id,createdAt:r.created_at,requestId:r.request_id})),canContribute:!!who,quota:{...window,remaining:Math.max(0,mutation.LIMIT-owned.results.length)}},who?.cookie?{'Set-Cookie':who.cookie}:{});
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
  const window=mutation.quotaWindow(who.id,now),sinceTime=new Date(window.start).toISOString();
  const body=JSON.stringify(payload),createdAt=new Date(now).toISOString();
  const previous=await db.prepare('SELECT * FROM events WHERE visitor=? AND request_id=?').bind(who.id,input.requestId).first();
  if(previous){if(previous.type!==input.type||previous.payload!==body)return json(409,{error:'This request ID already belongs to a different change'});return json(200,{event:publicEvent(previous)})}
  // Conditional INSERT is the atomic quota/rate/idempotency boundary across isolates.
  const [insert,accepted]=await db.batch([
    db.prepare(`INSERT INTO events(id,visitor,network,request_id,created_at,created_ms,type,payload)
      SELECT ?,?,?,?,?,?,?,?
      WHERE NOT EXISTS(SELECT 1 FROM events WHERE visitor=? AND request_id=?)
      AND (SELECT COUNT(*) FROM events WHERE visitor=? AND created_at>=?)<4
      AND (SELECT COUNT(*) FROM events WHERE network=? AND created_at>=?)<100
      AND NOT EXISTS(SELECT 1 FROM events WHERE network=? AND created_ms>?)`).bind(crypto.randomUUID(),who.id,net,input.requestId,createdAt,now,input.type,body,who.id,input.requestId,who.id,sinceTime,net,day,net,now-700),
    db.prepare('SELECT * FROM events WHERE visitor=? AND request_id=?').bind(who.id,input.requestId)
  ]);
  const row=accepted.results[0];if(row){if(row.type!==input.type||row.payload!==body)return json(409,{error:'This request ID already belongs to a different change'});return json(insert.meta.changes?201:200,{event:publicEvent(row)})}
  const count=await db.prepare('SELECT COUNT(*) AS count FROM events WHERE visitor=? AND created_at>=?').bind(who.id,sinceTime).first();
  if(count.count>=4)return json(429,{error:'Your four changes are resting. The next opening is shown below.',quota:{...window,remaining:0}});
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
export default {async fetch(request,env){const url=new URL(request.url);if(!url.pathname.startsWith('/api/'))return asset(request,url);try{if(!env.DB)return json(503,{error:'Shared storage is unavailable. Please retry later.'});if(url.pathname==='/api/health'&&request.method==='GET'){await env.DB.prepare('SELECT 1').first();return json(200,{status:'ok',persistence:'shared'})}if(url.pathname==='/api/organism'&&request.method==='GET')return await readOrganism(request,env.DB,url);if(url.pathname==='/api/mutations'&&request.method==='POST')return await commit(request,env.DB,url);return json(404,{error:'Unknown API route'})}catch(error){console.error('VEOURES shared storage error',error.message);return json(503,{error:'Shared storage is temporarily unavailable. Save is not confirmed; retry safely.'})}}};
