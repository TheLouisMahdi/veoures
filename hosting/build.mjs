import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import crypto from 'node:crypto';
const root=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')),dist=path.join(root,'_cloud');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'hosting/site.json'),'utf8'));
if(!manifest.project_id||manifest.d1!=='DB'||manifest.static)throw Error('Worker requires its persisted Site identity and DB binding');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg'};
const assets={};function add(relative){const file=path.join(root,relative);if(fs.lstatSync(file).isDirectory()){for(const entry of fs.readdirSync(file))add(relative+'/'+entry);return}let bytes=fs.readFileSync(file);if(relative==='index.html'){const text=bytes.toString().replaceAll('https://thelouismahdi.github.io/veoures/', 'https://veoures.softaspen8.chatgpt.site/');bytes=Buffer.from(text)}assets[relative]={type:types[path.extname(relative)]||'application/octet-stream',base64:bytes.toString('base64')}}
for(const entry of ['index.html','privacy.html','style.css','script.js','asset-manifest.json','engine','components','assets','images','audio','data'])add(entry);
const art=JSON.parse(fs.readFileSync(path.join(root,'asset-manifest.json'),'utf8'));for(const asset of art.assets){if(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,asset.path))).digest('hex')!==asset.sha256)throw Error('Asset mismatch: '+asset.path)}
fs.mkdirSync(path.join(dist,'server'),{recursive:true});fs.mkdirSync(path.join(dist,'.openai'),{recursive:true});
const reducer=fs.readFileSync(path.join(root,'engine/mutation-engine.js'),'utf8');const source=fs.readFileSync(path.join(root,'hosting/worker.js'),'utf8').replace('/*__MUTATION__*/',()=>reducer).replace('/*__ASSETS__*/{}',()=>JSON.stringify(assets));
fs.writeFileSync(path.join(dist,'server/index.js'),source);fs.writeFileSync(path.join(dist,'.openai/hosting.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({built:true,files:Object.keys(assets).length,workerBytes:Buffer.byteLength(source)}));

fs.writeFileSync(path.join(dist,'package.json'),JSON.stringify({type:'module'})+'\n');
