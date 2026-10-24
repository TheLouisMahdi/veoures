'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),site=path.join(root,'_site');
const html=fs.readFileSync(path.join(site,'index.html'),'utf8');
assert.match(html,/<title>VEOURES — One body\. Many hands\.<\/title>/);
assert.match(html,/rel="canonical" href="https:\/\/veoures\.softaspen8\.chatgpt\.site\/"/);
assert.match(html,/name="twitter:card" content="summary_large_image"/);
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){const value=match[1];if(value.startsWith('#')||/^[a-z]+:/i.test(value))continue;assert(fs.existsSync(path.join(site,value)),'Missing local URL: '+value)}
for(const name of ['server','tests','docs','.git','.github','.env','organism-data.json','.veoures-data','references'])assert(!fs.existsSync(path.join(site,name)),'Must not publish '+name);
const card=fs.readFileSync(path.join(site,'assets/brand/social-card.png'));assert.equal(card.readUInt32BE(16),1200);assert.equal(card.readUInt32BE(20),630);
assert(fs.existsSync(path.join(site,'.nojekyll')));
assert(fs.readFileSync(path.join(site,'data/ui-copy.json'),'utf8').includes('LOCAL DEMO - Only this browser remembers.'));
assert(fs.readFileSync(path.join(root,'README.md'),'utf8').includes('414 accepted shared changes'));assert(!fs.readFileSync(path.join(root,'README.md'),'utf8').includes('node server/server.js'));
console.log('PASS VEOURES metadata, 1200x630 brand card, local references, honest local mode and public artifact exclusions');
