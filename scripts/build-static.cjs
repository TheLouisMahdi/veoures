'use strict';
// Packaging only: no transpilation, dependency install or application build.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=fs.realpathSync(path.resolve(__dirname,'..'));
const output=path.join(root,'_site');
const entries=['index.html','privacy.html','style.css','script.js','asset-manifest.json','assets','audio','components','data','engine','images'];
const manifest=JSON.parse(fs.readFileSync(path.join(root,'asset-manifest.json'),'utf8'));
for(const asset of manifest.assets){const bytes=fs.readFileSync(path.join(root,asset.path));if(crypto.createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw Error('Original asset hash mismatch: '+asset.path);}
if(fs.existsSync(output)){
  // Delete only this script's own resolved artifact directory, never a junction/symlink.
  if(fs.lstatSync(output).isSymbolicLink()||fs.realpathSync(path.dirname(output))!==root||path.basename(output)!=='_site')throw Error('Unsafe artifact output path');
  fs.rmSync(output,{recursive:true,force:true});
}
fs.mkdirSync(output);
for(const entry of entries)fs.cpSync(path.join(root,entry),path.join(output,entry),{recursive:true});
fs.copyFileSync(path.join(root,'scripts/pages-entry.js'),path.join(output,'public-entry.js'));
const page=path.join(output,'index.html');fs.writeFileSync(page,fs.readFileSync(page,'utf8').replace('<head>','<head><script src="public-entry.js"></script>'));
fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log('Static local demo packaged in '+output+' (server, tests and private data excluded).');
