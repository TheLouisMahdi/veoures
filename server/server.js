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
let db = store();
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
  if (location.split('/').some(segment => segment.startsWith('.') || /[. ]$/.test(segment)) || ['server', 'tests'].includes(location.split('/')[1]?.toLowerCase())) { res.writeHead(404).end(); return; }
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
  if (url.pathname === '/api/organism' && req.method === 'GET') {
    const since = Number(url.searchParams.get('since') || 0);
    if (!Number.isSafeInteger(since) || since < 0) return send(res, 400, { error: 'Invalid version' });
    const token = visitor(req);
    const today = new Date().toISOString().slice(0, 10);
    const owned = token ? (db.visitors[token]?.day === today ? db.events.filter(e => e.visitor === token && e.createdAt.startsWith(today)).map(({ id, createdAt, requestId }) => ({ id, createdAt, ...(requestId ? {requestId} : {}) })) : []) : [];
    return send(res, 200, {
      epoch: db.epoch, serverTime: Date.now(), version: db.events.length,
      events: db.events.filter(e => e.version > since).map(({ visitor: _visitor, requestId: _requestId, ...publicEvent }) => publicEvent),
      owned
    });
  }
  if (url.pathname === '/api/mutations' && req.method === 'POST') {
    const token = visitor(req);
    if (!token) return send(res, 400, { error: 'Invalid anonymous browser token' });
    try {
      const input = await jsonBody(req);
      if (!input || typeof input.type !== 'string') return send(res, 400, { error: 'Invalid event' });
      if (!(req.headers['content-type'] || '').startsWith('application/json')) return send(res,415,{error:'Use application/json'});
      const payload = mutation.normalize(input.type, input.payload);
      const requestId = input.requestId;
      if (requestId !== undefined && (typeof requestId !== 'string' || !/^[A-Za-z0-9_-]{8,96}$/.test(requestId))) return send(res,400,{error:'Invalid request ID'});
      const existing = requestId && db.events.find(e => e.visitor === token && e.requestId === requestId);
      if (existing) {
        if (existing.type !== input.type || JSON.stringify(existing.payload) !== JSON.stringify(payload)) return send(res,409,{error:'Request ID already belongs to a different change'});
        const {visitor,requestId,...event}=existing;
        return send(res,200,{event});
      }
      if (!throttle(token)) return send(res,429,{error:'Please slow down before making another change'});
      const day = new Date().toISOString().slice(0, 10);
      const daily = db.visitors[token];
      if (daily?.day === day && daily.count >= 5) return send(res, 429, { error: 'No changes left today (UTC)' });
      if (db.events.length >= 10000) return send(res, 503, { error: 'This organism epoch is full; contact the operator' });
      const event = { id: crypto.randomUUID(), version: db.events.length + 1, type: input.type, payload, createdAt: new Date().toISOString(), visitor: token, ...(requestId ? {requestId} : {}) };
      const next = { ...db, events: [...db.events, event], visitors: { ...db.visitors, [token]: { day, count: (daily?.day === day ? daily.count : 0) + 1 } } };
      try { save(next); } catch { return send(res,503,{error:'Storage unavailable. Change was not accepted.'}); }
      const { visitor: _visitor, requestId: _requestId, ...publicEvent } = event;
      return send(res, 201, { event: publicEvent });
    } catch (error) { return send(res, error.status || 400, { error: error.message || 'Invalid request' }); }
  }
  if (url.pathname.startsWith('/api/')) return send(res, 404, { error: 'Unknown API route' });
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return; }
  serve(req, res, url);
});
server.listen(port, () => console.log(`VEOURES shared prototype on http://localhost:${port}, static root: ${publicDir}`));
