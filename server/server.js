'use strict';
/* Optional dependency-free shared MVP. Run with PUBLIC_DIR=... node server/server.js. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
function realLocation(location) { let parent=path.resolve(location);const rest=[];while(!fs.existsSync(parent)){rest.unshift(path.basename(parent));const next=path.dirname(parent);if(next===parent)break;parent=next;}return path.join(fs.realpathSync(parent),...rest);}
const publicDir = realLocation(process.env.PUBLIC_DIR || path.resolve(__dirname, '..'));
const dataPath = realLocation(process.env.VEOURES_DATA_FILE || path.join(path.dirname(publicDir), '.veoures-data', 'organism-data.json'));
if (dataPath === publicDir || dataPath.startsWith(publicDir + path.sep)) throw new Error('VEOURES_DATA_FILE must be outside PUBLIC_DIR');
const port = Number(process.env.PORT || 8000);
const library = path.join(publicDir, 'engine', 'mutation-engine.js');
const mutation = require(fs.existsSync(library) ? library : './vendor-mutation-engine.js');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon' };
function store() {
  try {
    const parsed = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    if (Array.isArray(parsed.events) && typeof parsed.visitors === 'object') return parsed;
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  return { epoch: 1, events: [], visitors: {} };
}
let db = store();db.profiles ||= {};db.profileSessions ||= {};
let anatomy=mutation.seed();for(const e of db.events)mutation.apply(anatomy,e);
function profileFor(token,create=false){if(!token)return null;const key=db.profileSessions[token]||token;let p=db.profiles[key];if(!p&&create){p={id:crypto.randomUUID(),key,name:'',listed:false};db={...db,profiles:{...db.profiles,[key]:p}}}return p}
const publicProfile=p=>p?{id:p.id,name:p.name,listed:p.listed}:null;
function publicEvent(e){const{visitor,requestId,contributorId,...event}=e;const p=Object.values(db.profiles).find(p=>p.id===contributorId);if(p?.listed)event.contributor={id:p.id,name:p.name||'Anonymous contributor'};return event}
function board(url,token){const range=url.searchParams.get('range')||'all',sort=url.searchParams.get('sort')||'total',offset=Number(url.searchParams.get('offset')||0),after=range==='24h'?Date.now()-86400000:range==='7d'?Date.now()-604800000:range==='all'?0:null,metric={total:'total',impact:'impact',evolution:'influence',recent:'recent'}[sort];if(after===null||!metric||!Number.isSafeInteger(offset)||offset<0||offset>10000)throw Error('Invalid ranking filter');const selected=url.searchParams.get('profile'),people=[];for(const p of Object.values(db.profiles)){if(!p.listed&&!(selected===p.id&&profileFor(token)?.id===p.id))continue;const events=db.events.filter(e=>e.contributorId===p.id&&Date.parse(e.createdAt)>=after),row={id:p.id,name:p.name||'Anonymous contributor',total:events.length,impact:events.reduce((n,e)=>n+(e.payload.effect?.impact||0),0),influence:events.reduce((n,e)=>n+(e.payload.effect?.influence||0),0),recent:Math.max(0,...events.map(e=>Date.parse(e.createdAt)))};if(selected===p.id)return{profile:publicProfile(p),stats:{...row,regions:new Set(events.map(e=>e.payload.region)).size,limbs:events.filter(e=>e.type==='add_limb').length,eyes:events.filter(e=>e.type==='grow_eye').length,mass:events.filter(e=>e.type==='feed_mass').length},events:events.slice().reverse().slice(offset,offset+20).map(publicEvent),milestones:events.filter(e=>e.version%414===0).map(e=>({version:e.version})),nextOffset:events.length>offset+20?offset+20:null};if(events.length)people.push(row)}if(selected)throw Error('Contributor is private or unknown');people.sort((a,b)=>b[metric]-a[metric]||a.id.localeCompare(b.id));return{rows:people.slice(offset,offset+20).map((r,i)=>({...r,rank:offset+i+1})),nextOffset:people.length>offset+20?offset+20:null,formula:'Impact = 10 + round(min(40, mature tissue area × 20000)) + min(8, 2 × connections). Influence = 1 + connections + min(4, floor(area × 1000)). Accepted biological changes only. Unverified legacy credits are excluded. This development server trusts browser tokens; public hosting uses secure sessions.'}}

const requestWindow = new Map();
const send = (res, code, body) => {
  const bytes = Buffer.from(JSON.stringify(body));
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': bytes.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Veoures-Mode': 'shared' });
  res.end(bytes);
};
function visitor(req) {
  const value = req.headers['x-veoures-visitor'];
  return typeof value === 'string' && /^[A-Za-z0-9_-]{8,96}$/.test(value) ? value : null;
}
function throttle(token) {
  const now = Date.now();
  const last = requestWindow.get(token) || 0;
  if (now - last < 700) return false;
  requestWindow.set(token, now);
  if (requestWindow.size > 30000) requestWindow.clear();
  return true;
}
function save(next) {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  const temporary = `${dataPath}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(next), { mode: 0o600 });
  fs.renameSync(temporary, dataPath);
  db = next;
}
async function jsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0, exceeded = false;
    req.on('data', chunk => {
      size += chunk.length;
      if (exceeded) return;
      if (size > 16384) { exceeded = true; const error = new Error('Request exceeds 16 KB limit'); error.status = 413; reject(error); return; }
      chunks.push(chunk);
    });
    req.on('end', () => { if (exceeded) return; try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch (error) { reject(error); } });
    req.on('error', reject);
    req.on('aborted', () => reject(new Error('Request interrupted')));
  });
}
function serve(req, res, url) {
  let location;
  try { location = decodeURIComponent(url.pathname).replaceAll('\\', '/').replace(/\/{2,}/g, '/'); } catch { res.writeHead(400).end(); return; }
  if (/[\0:]/.test(location)) { res.writeHead(400).end(); return; }
  if (location.split('/').some(segment => segment.startsWith('.') || /[. ]$/.test(segment)) || !['','index.html','privacy.html','style.css','script.js','asset-manifest.json','engine','components','assets','images','audio','data'].includes(location.split('/')[1]?.toLowerCase())) { res.writeHead(404).end(); return; }
  const relative = location.endsWith('/') ? location + 'index.html' : location;
  const file = path.resolve(publicDir, '.' + relative);
  if (file !== publicDir && !file.startsWith(publicDir + path.sep)) { res.writeHead(404).end(); return; }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) { res.writeHead(404).end('Not found'); return; }
    const realFile=fs.realpathSync(file);
    const realRoot=fs.realpathSync(publicDir);
    if (!realFile.startsWith(realRoot+path.sep)) {res.writeHead(404).end();return;}
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'X-Veoures-Mode': 'shared', 'Cache-Control':'no-cache' });
    if(req.method==='HEAD') return res.end();
    const stream=fs.createReadStream(file);stream.on('error',()=>res.destroy());stream.pipe(res);
  });
}
const server = http.createServer(async (req, res) => {
  let url;
  try { url = new URL(req.url, 'http://localhost'); } catch { return send(res,400,{error:'Invalid URL'}); }
  if(url.pathname==='/api/leaderboard'&&req.method==='GET'){try{return send(res,200,board(url,visitor(req)))}catch(error){return send(res,400,{error:error.message})}}
  if(url.pathname==='/api/profile'&&req.method==='POST'){const token=visitor(req);if(!token)return send(res,401,{error:'Start a browser session'});if(req.headers.origin!==new URL('http://'+req.headers.host).origin)return send(res,403,{error:'Use this server directly'});try{const input=await jsonBody(req);if(input.action==='recover'){if(!/^[a-f0-9]{64}$/.test(input.key||''))throw Error('Invalid recovery key');const owner=Object.values(db.profiles).find(p=>p.recoveryHash===crypto.createHash('sha256').update(input.key).digest('hex'));if(!owner)throw Error('Recovery key not recognized');save({...db,profileSessions:{...db.profileSessions,[token]:owner.key}});return send(res,200,{profile:publicProfile(owner)})}const p=profileFor(token,true);if(input.action==='preferences'){const name=mutation.authorName(input.name);if(typeof input.listed!=='boolean')throw Error('Choose public participation');const updated={...p,name,listed:input.listed};save({...db,profiles:{...db.profiles,[p.key]:updated}});return send(res,200,{profile:publicProfile(updated)})}if(input.action==='create-recovery'){const key=crypto.randomBytes(32).toString('hex'),updated={...p,recoveryHash:crypto.createHash('sha256').update(key).digest('hex')};save({...db,profiles:{...db.profiles,[p.key]:updated}});return send(res,200,{profile:publicProfile(updated),key})}throw Error('Unknown profile action')}catch(error){return send(res,error.status||400,{error:error.message})}}
  if (url.pathname === '/api/organism' && req.method === 'GET') {
    const since = Number(url.searchParams.get('since') || 0);
    if (!Number.isSafeInteger(since) || since < 0) return send(res, 400, { error: 'Invalid version' });
    const token = visitor(req),profile=profileFor(token),owner=profile?.key||token;
    const window=mutation.quotaWindow(owner||'unavailable'),sinceTime=new Date(window.start).toISOString();
    const owned=token?db.events.filter(e=>e.visitor===owner&&e.createdAt>=sinceTime).map(({id,createdAt,requestId})=>({id,createdAt,...(requestId?{requestId}:{})})):[];
    return send(res, 200, {
      epoch: db.epoch, serverTime: Date.now(), version: db.events.length,
      events: db.events.filter(e => e.version > since).map(publicEvent),
      owned,profile:publicProfile(profile), quota:{...window,remaining:Math.max(0,4-owned.length)}
    });
  }
  if (url.pathname === '/api/mutations' && req.method === 'POST') {
    const token = visitor(req);
    if (!token) return send(res, 400, { error: 'Invalid anonymous browser token' });
    try {
      const input = await jsonBody(req);
      if (!input || typeof input.type !== 'string') return send(res, 400, { error: 'Invalid event' });
      if (!(req.headers['content-type'] || '').startsWith('application/json')) return send(res,415,{error:'Use application/json'});
      let payload = mutation.normalize(input.type, input.payload);const profile=profileFor(token,true),owner=profile.key;
      const requestId = input.requestId;
      if (requestId !== undefined && (typeof requestId !== 'string' || !/^[A-Za-z0-9_-]{8,96}$/.test(requestId))) return send(res,400,{error:'Invalid request ID'});
      const existing = requestId && db.events.find(e => e.visitor === owner && e.requestId === requestId);
      if (existing) {
        if (existing.type !== input.type || JSON.stringify(mutation.intent(existing.payload)) !== JSON.stringify(mutation.intent(payload))) return send(res,409,{error:'Request ID already belongs to a different change'});
        return send(res,200,{event:publicEvent(existing)});
      }
      if(payload.schema===3)payload=mutation.prepare(anatomy,input.type,payload,Date.now());
      if (!throttle(owner)) return send(res,429,{error:'Please slow down before making another change'});
      const window=mutation.quotaWindow(owner),count=db.events.filter(e=>e.visitor===owner&&Date.parse(e.createdAt)>=window.start).length;
      if(count>=4)return send(res,429,{error:'Your four changes are resting.',quota:{...window,remaining:0}});
      const event = { id: crypto.randomUUID(), version: db.events.length + 1, type: input.type, payload, createdAt: new Date().toISOString(), visitor: owner,...(payload.schema===3?{contributorId:profile.id}:{}), ...(requestId ? {requestId} : {}) };
      const next = { ...db,profiles:{...db.profiles,[owner]:{...profile,...(payload.schema===3?{name:payload.author||'',listed:payload.leaderboard}: {})}}, events: [...db.events, event], visitors: { ...db.visitors, [token]: {start:window.start,count:count+1} } };
      try { save(next); } catch { return send(res,503,{error:'Storage unavailable. Change was not accepted.'}); }
      mutation.apply(anatomy,event);
      return send(res, 201, { event: publicEvent(event) });
    } catch (error) { return send(res, error.status || 400, { error: error.message || 'Invalid request' }); }
  }
  if (url.pathname.startsWith('/api/')) return send(res, 404, { error: 'Unknown API route' });
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return; }
  serve(req, res, url);
});
server.listen(port, () => console.log(`VEOURES shared prototype on http://localhost:${port}, static root: ${publicDir}`));
