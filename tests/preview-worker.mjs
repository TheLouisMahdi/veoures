// Isolated QA adapter. Never points at production D1 or enters the public artifact.
import http from 'node:http';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {localD1} from '../hosting/local-d1.mjs';import worker from '../_cloud/server/index.js';
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'veoures-visual-')),db=localD1(path.join(temporary,'test.sqlite'));
db.database.exec(fs.readFileSync(new URL('../hosting/drizzle/0000_veoures.sql',import.meta.url),'utf8'));
const port=Number(process.env.PORT||8013);
const server=http.createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const headers=new Headers(req.headers);headers.set('CF-Connecting-IP','198.51.100.22');const request=new Request('http://'+req.headers.host+req.url,{method:req.method,headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});const result=await worker.fetch(request,{DB:db});res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()))}catch(error){console.error(error);res.writeHead(500).end('Preview error')}});
server.listen(port,'127.0.0.1',()=>console.log('VEOURES isolated Worker http://127.0.0.1:'+port));
function close(){server.close(()=>{db.database.close();fs.rmSync(temporary,{recursive:true,force:true});process.exit()})}process.on('SIGTERM',close);process.on('SIGINT',close);
