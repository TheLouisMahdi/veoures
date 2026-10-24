(function(root){
'use strict';
const TAU=Math.PI*2, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=p=>1-Math.pow(1-clamp(p,0,1),3);
const lists=['limbs','buds','mass','scars','corruptions','texts'];
class Renderer {
 constructor(canvas,engine){
  this.canvas=canvas;this.ctx=canvas.getContext('2d');if(!this.ctx)throw Error('Canvas 2D is unavailable.');
  this.engine=engine;this.preview=null;this.inspected=null;this.raf=0;this.animations=new Map();this.reactions=[];this.seen=new Set();this.initialized=false;
  this.pose={x:0,y:0,angle:0};this.frozenPose=null;this.touch=null;this.lastTime=0;this.previousGenome=engine.state.genome;this.zoom=1;this.pan={x:0,y:0};this.pointer=null;this.pointerFollow=null;this.navigation=false;this.version=engine.state.version;
  this.motionQuery=matchMedia('(prefers-reduced-motion: reduce)');this.reduced=this.motionQuery.matches;this.visible=!document.hidden;
  this.motionQuery.addEventListener('change',e=>{this.reduced=e.matches;this.reactions=[];this.animations.clear();this.start()});
  document.addEventListener('visibilitychange',()=>{this.visible=!document.hidden;this.reactions=[];this.start()});
  // Slow ageing also updates when reduced motion stops the animation loop.
  this.ageTimer=setInterval(()=>{if(this.visible&&this.reduced)this.draw(0)},30000);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.resize();this.start();
 }
 resize(){
  const box=this.canvas.getBoundingClientRect();this.dpr=Math.min(this.engine.exporting?1:box.width<700?1.5:2,devicePixelRatio||1);
  this.w=box.width;this.h=box.height;this.unit=Math.min(this.w,this.h);this.cx=this.w*.5;this.cy=this.h*(this.w<700?.45:.49);
  this.sx=this.unit*1.32;this.sy=this.unit*1.10;this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);
  this.pan.x=clamp(this.pan.x,-this.w*4,this.w*4);this.pan.y=clamp(this.pan.y,-this.h*4,this.h*4);this.refresh();
 }
 xy(x,y){return[this.cx+(x-.5)*this.sx,this.cy+(y-.5)*this.sy]}
 screen(event){const r=this.canvas.getBoundingClientRect();return{x:event.clientX-r.left,y:event.clientY-r.top}}
 world(event){const p=this.screen(event),wx=this.cx+(p.x-this.cx-this.pan.x)/this.zoom,wy=this.cy+(p.y-this.cy-this.pan.y)/this.zoom,pose=this.pose||{x:0,y:0,angle:0},dx=wx-this.cx-pose.x,dy=wy-this.cy-pose.y,co=Math.cos(-pose.angle),si=Math.sin(-pose.angle);return{x:this.cx+dx*co-dy*si,y:this.cy+dx*si+dy*co}}
 freeze(){this.frozenPose={...this.pose}}
 release(){this.frozenPose=null}

 locate(event){const p=this.world(event);return{x:clamp(.5+(p.x-this.cx)/this.sx,.02,.98),y:clamp(.5+(p.y-this.cy)/this.sy,.02,.98)}}
 setZoom(value,at={x:this.w/2,y:this.h/2}){
  const next=clamp(value,1,8),ratio=next/this.zoom;
  this.pan.x=at.x-this.cx-(at.x-this.cx-this.pan.x)*ratio;this.pan.y=at.y-this.cy-(at.y-this.cy-this.pan.y)*ratio;
  this.zoom=next;if(next===1)this.pan={x:0,y:0};this.refresh();this.onView?.();
 }
 moveView(dx,dy){this.pan.x=clamp(this.pan.x+dx,-this.w*this.zoom,this.w*this.zoom);this.pan.y=clamp(this.pan.y+dy,-this.h*this.zoom,this.h*this.zoom);this.refresh()}
 resetView(){this.zoom=1;this.pan={x:0,y:0};this.refresh();this.onView?.()}
 focusText(){this.frozenPose={x:0,y:0,angle:0};this.pose={...this.frozenPose};const p=this.textAnchor();this.zoom=this.w<700?5:4;this.pan={x:(this.w<700?24:this.w*.24)-this.cx-(p.x-this.cx)*this.zoom,y:this.h*.34-this.cy-(p.y-this.cy)*this.zoom};this.refresh();this.onView?.()}
 setPreview(type,payload){if(!this.frozenPose)this.freeze();this.preview={type,...payload};this.refresh()}
 refresh(){
  if(this.engine.ready){
   if(!this.initialized){for(const key of lists)for(const item of this.engine.state[key]||[])this.seen.add(item.id);this.initialized=true}
   else if(this.version!==this.engine.state.version){
    const now=performance.now(),wall=this.engine.now();
    for(const key of lists)for(const item of this.engine.state[key]||[]){
     if(this.seen.has(item.id))continue;this.seen.add(item.id);
     // Catch-up after a long absence is quiet. Initial history never replays.
     if(!this.reduced&&this.visible&&wall-Date.parse(item.createdAt)<20000){
      this.animations.set(item.id,now);if(['scars','mass','texts'].includes(key))this.reactions.push({id:item.id,kind:key,item,start:now});
     }
    }
    this.reactions=this.reactions.slice(-8);
   }
  }
  if(this.engine.state.genome!==this.previousGenome){this.fromGenome=this.previousGenome;this.previousGenome=this.engine.state.genome;this.genomeChanged=performance.now()}
  this.version=this.engine.state.version;this.previewState=null;
  if(this.preview){const copy=VeouresMutation.clone(this.engine.state);try{VeouresMutation.apply(copy,{id:'preview',version:copy.version+1,type:this.preview.type,payload:this.preview,createdAt:new Date(this.engine.now()).toISOString()});this.previewState=copy}catch{}}
  if(this.visible)this.draw(this.reduced?0:performance.now()/1000);
 }
 start(){
  cancelAnimationFrame(this.raf);this.raf=0;if(!this.visible)return;if(this.reduced){this.draw(0);return}
  let last=0;const frame=now=>{if(!this.visible)return;if(now-last>=1000/(this.w<700?30:45)){this.draw(now/1000);last=now}this.raf=requestAnimationFrame(frame)};this.raf=requestAnimationFrame(frame);
 }
 growth(id){if(this.reduced||id==='preview')return 1;const start=this.animations.get(id);if(start===undefined)return 1;const p=clamp((performance.now()-start)/2600,0,1);if(p===1)this.animations.delete(id);return ease(p)}
 life(item){return VeouresMutation.life(item,this.wall)}
 smooth(points){
  const c=this.ctx;if(!points.length)return;c.moveTo(points[0][0],points[0][1]);
  for(let i=1;i<points.length-1;i++)c.quadraticCurveTo(points[i][0],points[i][1],(points[i][0]+points[i+1][0])/2,(points[i][1]+points[i+1][1])/2);
  if(points.length>1)c.lineTo(...points.at(-1));
 }
 thread(x,y,ex,ey,width,bend=0){
  const c=this.ctx,dx=ex-x,dy=ey-y,len=Math.max(1,Math.hypot(dx,dy)),nx=-dy/len,ny=dx/len;
  const mx=x+dx*.48+nx*bend,my=y+dy*.48+ny*bend;
  c.beginPath();c.moveTo(x+nx*width,y+ny*width);c.quadraticCurveTo(mx+nx*width*.5,my+ny*width*.5,ex,ey);c.quadraticCurveTo(mx-nx*width*.5,my-ny*width*.5,x-nx*width,y-ny*width);c.closePath();
  const g=c.createLinearGradient(x-nx*width,y-ny*width,x+nx*width,y+ny*width);g.addColorStop(0,'#020204');g.addColorStop(.42,'#333139');g.addColorStop(.58,'#0d0c11');g.addColorStop(1,'#010102');c.fillStyle=g;c.fill();
  c.strokeStyle='#736b792b';c.lineWidth=.45;c.stroke();
 }
 limb(item,t,color='#36333c',branch=false){const c=this.ctx,u=this.unit;const[x,y]=this.xy(item.x,item.y);const growth=this.growth(item.id)*VeouresMutation.life(item,this.wall);const angle=item.angle+(this.reduced?0:Math.sin(t*.8+item.angle*3)*.035);const len=item.length*u*(branch?1.45:1.8)*growth;let ex=clamp(x+Math.cos(angle)*len,12,this.w-12),ey=clamp(y+Math.sin(angle)*len,70,this.h-75);const dx=ex-x,dy=ey-y,L=Math.max(1,Math.hypot(dx,dy)),nx=-dy/L,ny=dx/L,curve=(item.curvature??.4)*len*.6;const width=(item.kind==='leg'?17:item.kind==='wing'?24:item.kind==='horn'?14:10)*Math.max(.5,u/850);const a=[x+dx*.35+nx*curve,y+dy*.35+ny*curve],b=[x+dx*.8-nx*curve*.4,y+dy*.8-ny*curve*.4];const skin=c.createLinearGradient(x-nx*width,y-ny*width,x+nx*width,y+ny*width);skin.addColorStop(0,'#010103');skin.addColorStop(.44,color);skin.addColorStop(.56,'#101014');skin.addColorStop(1,'#010103');c.beginPath();c.moveTo(x+nx*width,y+ny*width);c.bezierCurveTo(a[0]+nx*width*.5,a[1]+ny*width*.5,b[0]+nx,b[1]+ny,ex,ey);c.bezierCurveTo(b[0]-nx,b[1]-ny,a[0]-nx*width*.5,a[1]-ny*width*.5,x-nx*width,y-ny*width);c.closePath();c.fillStyle=skin;c.fill();c.strokeStyle='#77717d55';c.lineWidth=.65;c.stroke();c.beginPath();c.moveTo(x,y);c.bezierCurveTo(...a,...b,ex,ey);c.strokeStyle=branch?'#d4507566':'#a9416255';c.lineWidth=.7;c.stroke();
 // Fine offshoots follow the same persisted skeleton; they never add data.
 if(!branch){c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo(a[0]+nx*len*.14,a[1]+ny*len*.14,clamp(ex+nx*len*.16,8,this.w-8),clamp(ey+ny*len*.16,75,this.h-65));c.strokeStyle='#74616f77';c.lineWidth=.85;c.stroke();}}

 draw(time){
  const c=this.ctx,s=this.previewState||this.engine.state,u=this.unit;if(!u||!this.visible)return;this.wall=this.engine.now();
  const life=VeouresLife.sample(s,this.wall,this.w,this.h,this.reduced);this.behaviour=life;this.drawTime=life.t;
  c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.w,this.h);this.drawSpace(life);c.save();c.translate(this.cx+this.pan.x,this.cy+this.pan.y);c.scale(this.zoom,this.zoom);c.translate(-this.cx,-this.cy);
  const target=this.frozenPose||life.pose;if(this.reduced)this.pose={x:0,y:0,angle:0};else{const blend=this.frozenPose?1:.025;for(const key of ['x','y','angle'])this.pose[key]+=(target[key]-this.pose[key])*blend}c.translate(this.cx+this.pose.x,this.cy+this.pose.y);c.rotate(this.pose.angle);c.translate(-this.cx,-this.cy);
  c.globalAlpha=1;c.lineCap='round';c.lineJoin='round';c.setLineDash([]);
  for(const [id,start] of this.animations)if(performance.now()-start>=3200)this.animations.delete(id);
  this.reactions=this.reactions.filter(a=>performance.now()-a.start<3200);
  const [cx,cy]=this.xy(s.core.x,s.core.y),volume=Math.min(.28,s.mass.reduce((a,b)=>a+b.r*.6*this.life(b)*this.growth(b.id),0));
  const morph=!this.reduced&&this.genomeChanged?ease((performance.now()-this.genomeChanged)/4000):1,to=life.dna,from=VeouresMutation.traits(this.fromGenome??s.genome),dna={};for(const key of Object.keys(to))dna[key]=from[key]+(to[key]-from[key])*morph;this.dna=dna;
  const r=s.core.r*u*1.92*(1+volume)*life.breath;this.radius=r;
  const hue=dna.hue+s.mood.hue*.25,halo=c.createRadialGradient(cx,cy,0,cx,cy,r*2.7);halo.addColorStop(0,`hsla(${hue},60%,22%,.2)`);halo.addColorStop(1,'#0000');c.fillStyle=halo;c.fillRect(cx-r*3,cy-r*3,r*6,r*6);
  for(const item of s.limbs)this.limb(item,this.reduced?0:life.t*.8);
  this.drawWildArms(s,life,dna);
  const body=new Path2D(),edge=[];
  for(let i=0;i<80;i++){
   const a=i/80*TAU;let organic=1+(.05+dna.fold*.075)*Math.sin(a*dna.lobes+.4)+.035*Math.cos(a*(dna.lobes+4)+dna.spine*4)+(this.reduced?0:.025*Math.sin(a*13+life.t*.6));
   if(!this.reduced)organic+=.035*Math.sin(a*3-life.t*.7)*life.swirl;
   for(const reaction of this.reactions){const p=(performance.now()-reaction.start)/3200,at=reaction.item.path?.[Math.floor(reaction.item.path.length/2)]||reaction.item;const [x,y]=this.xy(at.x,at.y),angle=Math.atan2(y-cy,x-cx);organic-=.018*Math.exp(-Math.pow(Math.atan2(Math.sin(a-angle),Math.cos(a-angle))*3,2))*Math.sin(p*Math.PI)}
   edge.push([cx+Math.cos(a)*r*organic,cy+Math.sin(a)*r*organic*(.78+dna.stretch*.12)*life.stretch]);
  }
  body.moveTo((edge[0][0]+edge.at(-1)[0])/2,(edge[0][1]+edge.at(-1)[1])/2);
  for(let i=0;i<edge.length;i++){const next=edge[(i+1)%edge.length];body.quadraticCurveTo(...edge[i],(edge[i][0]+next[0])/2,(edge[i][1]+next[1])/2)}body.closePath();
  const skin=c.createRadialGradient(cx-r*.43,cy-r*.63,1,cx,cy,r*1.4);skin.addColorStop(0,'#6a6572');skin.addColorStop(.1,'#35313d');skin.addColorStop(.27,'#0a0a10');skin.addColorStop(.59,'#141118');skin.addColorStop(1,'#010204');c.fillStyle=skin;c.fill(body);c.lineWidth=.85;c.strokeStyle='#8a7b8d65';c.stroke(body);
  c.save();c.clip(body);
  for(let i=0;i<48;i++){const seed=VeouresMutation.hash('skin'+i),a=(seed%6283)/1000,rr=r*(.3+(seed%70)/100),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.83;
   c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+r*.4,y-r*.3,cx-r*.5,cy+r*.25,cx+Math.cos(a+1)*r*.95,cy+Math.sin(a+1)*r*.85);c.strokeStyle=i%4===0?'#e0688b1d':'#c7b9cd19';c.lineWidth=i%3===0?1.2:.55;c.stroke();
  }
  const glow=.4+s.mood.pulse*.2+(this.reduced?0:Math.sin(time*2.3)*.07),heart=c.createRadialGradient(cx+r*.15,cy,1,cx+r*.15,cy,r*.7);
  heart.addColorStop(0,`hsla(${hue},78%,50%,${glow})`);heart.addColorStop(.21,`hsla(${hue},75%,28%,.3)`);heart.addColorStop(1,'#0000');c.fillStyle=heart;c.fillRect(cx-r,cy-r,r*2,r*2);
  for(let i=0;i<13;i++){const a=i*2.4,len=r*(.3+i%4*.15);c.beginPath();c.moveTo(cx+r*.15,cy);c.bezierCurveTo(cx+Math.cos(a)*len*.7,cy+Math.sin(a)*len*.4,cx+Math.cos(a+.3)*len,cy+Math.sin(a)*len,cx+Math.cos(a)*len,cy+Math.sin(a)*len);c.strokeStyle=`hsla(${hue},65%,50%,${glow*.48})`;c.lineWidth=.6+i%3*.25;c.stroke()}
  // A restrained wet specular highlight follows the upper skin.
  const sheen=c.createRadialGradient(cx-r*.35,cy-r*.62,r*.02,cx-r*.35,cy-r*.62,r*.7);sheen.addColorStop(0,'#d9d1e326');sheen.addColorStop(.18,'#9d91b014');sheen.addColorStop(1,'#0000');c.fillStyle=sheen;c.fillRect(cx-r,cy-r,r*2,r*2);c.restore();
  for(const bud of s.buds){c.save();c.globalAlpha=this.life(bud);this.limb({...bud,kind:'tendril',curvature:Math.sin(bud.angle)},time,bud.healed?'#9b8f9c':'#514655',true);c.restore()}
  const tissue=new Map();for(const mass of s.mass){if(this.life(mass)>.001)tissue.set(Math.round(mass.x*20)+':'+Math.round(mass.y*20),mass)}c.save();c.clip(body);for(const mass of tissue.values())this.drawMass(mass,time);c.restore();
  for(const scar of s.scars)this.drawScar(scar,time);
  for(const lesion of s.corruptions){c.save();c.globalAlpha=this.life(lesion);const[x,y]=this.xy(lesion.x,lesion.y);c.fillStyle='#3e091d';c.beginPath();c.ellipse(x,y,lesion.radius*u,lesion.radius*u*.7,0,0,TAU);c.fill();c.restore()}
  this.drawSkinLife(life);
  this.drawTexts(s,time);
  if(!this.reduced)for(const reaction of this.reactions)this.drawReaction(reaction,time);
  this.drawPointer(time);this.drawTouch();this.drawShedding(life);
  if(this.preview&&this.preview.type!=='leave_text')this.marker(this.preview.type==='draw_scar'?this.preview.path[0]:this.preview,'#efbbcf',time);
  if(this.inspected)this.marker(this.inspected.type==='leave_text'?{x:.64,y:.62}:this.inspected,'#e989af',0);
  c.restore();c.setTransform(this.dpr,0,0,this.dpr,0,0);
 }
 drawSpace(life){
  const c=this.ctx,count=this.w<700?25:64,t=this.reduced?0:life.t;
  for(let i=0;i<count;i++){const seed=VeouresMutation.hash('void:'+i),x=((seed%10000)/10000*this.w+t*(i%2?1:-1)*(1+i%4)*.35)%this.w,y=((seed%7919)/7919*this.h+Math.sin(t*.05+i)*12+this.h)%this.h;c.fillStyle=i%7===0?'#be709938':'#b5a0c821';c.beginPath();c.arc((x+this.w)%this.w,y,i%9===0?1.1:.5,0,TAU);c.fill()}
 }
 drawWildArms(state,life,dna){
  const c=this.ctx,u=this.unit,max=this.w<700?28:44,t=this.reduced?0:life.t;let count=0;
  for(let i=0;i<max;i++){
   const arm=VeouresLife.arm(state,i,this.reduced?0:this.wall),prior=this.fromGenome!==undefined?VeouresLife.arm({...state,genome:this.fromGenome},i,this.reduced?0:this.wall):arm,p=!this.reduced&&this.genomeChanged?ease((performance.now()-this.genomeChanged)/4000):1;
   const g=prior.growth+(arm.growth-prior.growth)*p,len=prior.length+(arm.length-prior.length)*p,a=prior.angle+(arm.angle-prior.angle)*p;if(g<.035)continue;count++;
   const reach=len*u*life.reach,x=this.cx+Math.cos(a)*this.radius*.72,y=this.cy+Math.sin(a)*this.radius*.68;
   const sway=this.reduced?0:Math.sin(t*(.45+i%3*.16)+i)*.18*life.activity+Math.sin(t*4+i)*life.tremor*.018,angle=a+sway+life.curl*Math.sin(t*.3+i)*.25;
   const ex=x+Math.cos(angle)*reach,ey=y+Math.sin(angle)*reach*.82,curve=(prior.curvature+(arm.curvature-prior.curvature)*p)*reach*.35+life.curl*reach*.28;
   c.save();c.globalAlpha=g*.88;this.thread(x,y,ex,ey,(2.4+(i%4)*1.1)*Math.max(.55,u/850)*g,curve);
   if(i%3===0){const bx=x+(ex-x)*.65,by=y+(ey-y)*.65;this.thread(bx,by,ex+Math.cos(angle+.6)*reach*.26,ey+Math.sin(angle+.6)*reach*.26,1.4*g,-curve*.4)}
   if(i%5===0&&!this.reduced){c.strokeStyle='#ae507939';c.lineWidth=.7;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo((x+ex)/2+curve,(y+ey)/2,ex,ey);c.stroke()}c.restore();
  }
  this.armCount=count;
 }
 drawSkinLife(life){
  if(this.reduced)return;const c=this.ctx,r=this.radius,t=life.t;
  c.save();const clip=new Path2D();clip.ellipse(this.cx,this.cy,r*.91,r*.75,0,0,TAU);c.clip(clip);
  for(let i=0;i<5;i++){const p=(t*(.07+i*.012)+i*.21)%1,a=i*2.399+life.swirl,rr=r*(.12+p*.8),x=this.cx+Math.cos(a)*rr*.3,y=this.cy+Math.sin(a)*rr*.4;c.globalAlpha=Math.sin(p*Math.PI)*.12;c.strokeStyle=i%2?'#b9a4c4':'#c64980';c.lineWidth=.7;c.beginPath();c.ellipse(x,y,rr,rr*.65,a,0,TAU);c.stroke()}
  for(let i=0;i<10;i++){const p=(t*.09+i*.13)%1,a=i*2.4,x=this.cx+Math.cos(a)*r*p*.9,y=this.cy+Math.sin(a)*r*p*.7;c.globalAlpha=Math.sin(p*Math.PI)*.5;c.fillStyle=i%3?'#953359':'#b6a3b7';c.beginPath();c.arc(x,y,Math.max(.6,this.unit*.0012),0,TAU);c.fill()}
  c.restore();
 }
 drawShedding(life){if(this.reduced||life.shedding<.05)return;const c=this.ctx,r=this.radius;c.save();for(let i=0;i<6;i++){const p=(life.t*.09+i*.17)%1,a=i*2.4;c.globalAlpha=Math.sin(p*Math.PI)*life.shedding*.4;const x=this.cx+Math.cos(a)*r*(.8+p*.8),y=this.cy+Math.sin(a)*r*(.7+p*.6);c.fillStyle='#2d1d2b';c.beginPath();c.ellipse(x,y,1+p*3,1+p*2,a,0,TAU);c.fill()}c.restore()}
 drawTouch(){if(this.reduced||!this.touch)return;const p=(performance.now()-this.touch.start)/1000;if(p>=1){this.touch=null;return}const c=this.ctx;c.save();c.globalAlpha=(1-p)*.45;c.strokeStyle='#a16c87';c.lineWidth=.8;for(let i=0;i<3;i++){c.beginPath();c.ellipse(this.touch.x,this.touch.y,(p*30+i*5),(p*20+i*3),0,0,TAU);c.stroke()}c.restore()}
 drawMass(item,time){
  const c=this.ctx,life=this.life(item);if(life<=.001)return;const[x,y]=this.xy(item.x,item.y),g=this.growth(item.id),size=item.r*this.unit*1.9*Math.sqrt(life)*g;if(size<.3)return;
  c.save();c.globalAlpha=life*(item.id==='preview'?.36:.24);const grad=c.createRadialGradient(x-size*.28,y-size*.4,0,x,y,size);grad.addColorStop(0,'#95839399');grad.addColorStop(.17,'#51424fbb');grad.addColorStop(.48,'#17101bdb');grad.addColorStop(1,'#06060900');c.fillStyle=grad;c.beginPath();c.ellipse(x,y,size,size*(.86+(this.reduced?0:Math.sin(time*1.5)*.015)),0,0,TAU);c.fill();c.restore();
 }
 drawScar(item,time){
  const c=this.ctx,life=this.life(item)*item.intensity;if(life<=.001)return;
  const pts=item.path.map(p=>this.xy(p.x,p.y)),start=this.animations.get(item.id),p=start===undefined?1:clamp((performance.now()-start)/2800,0,1),preview=item.id==='preview';
  c.save();c.globalAlpha=life;c.lineCap='round';c.lineJoin='round';c.beginPath();this.smooth(pts);c.strokeStyle='#010105';c.lineWidth=3.8*Math.pow(life,.3);c.stroke();c.lineWidth=.65*Math.sqrt(life);c.strokeStyle='#ada0ac46';c.stroke();
  // Draw the surviving wet front segment by segment, rather than fading the entire line.
  for(let i=1;i<pts.length;i++){
   const distance=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]),width=clamp(2.6-distance*.015,1.05,2.5),along=i/(pts.length-1);
   const wet=preview?.7:clamp((along-p*1.35)*5+.75,0,1);
   const prev=pts[Math.max(0,i-2)],a=pts[i-1],b=pts[i],next=pts[Math.min(pts.length-1,i+1)];
   c.beginPath();c.moveTo(...a);c.bezierCurveTo(a[0]+(b[0]-prev[0])/6,a[1]+(b[1]-prev[1])/6,b[0]-(next[0]-a[0])/6,b[1]-(next[1]-a[1])/6,...b);
   c.strokeStyle=`rgba(205,64,106,${wet*.75+.055+(this.reduced?0:Math.max(0,Math.sin(time*2-i*.25))*.035)})`;c.lineWidth=width*Math.pow(life,.35);c.stroke();
   if(i%4===0&&!preview){c.beginPath();c.moveTo(...a);c.quadraticCurveTo(a[0]+3,a[1]+5,a[0]+8,a[1]+7);c.lineWidth=.55;c.strokeStyle='#54304188';c.stroke()}
  }
  c.restore();
 }
 textAnchor(){const r=(this.engine.state.core.r*this.unit*1.7);return{x:this.cx+r*.56,y:this.cy+r*.47}}
 drawTexts(state,time){
  const c=this.ctx,at=this.textAnchor(),font=clamp(this.unit*.0055,3.8,5.4),width=Math.max(62,this.unit*.13),rowHeight=font*6.8;
  const texts=state.texts.filter(t=>this.life(t)>.002);this.textCount=texts.length;
  c.save();c.font=`500 ${font}px system-ui, sans-serif`;c.textBaseline='top';
  texts.forEach((item,i)=>{
   const col=Math.floor(i/10),row=i%10,x=at.x+col*(width+font*3),y=at.y+row*rowHeight,life=this.life(item),g=this.growth(item.id);
   c.globalAlpha=life*(item.id==='preview'?.75:.78)*(.4+.6*g);
   // The writing is a tiny fold attached to the same living surface, not a UI label.
   c.strokeStyle='#63505e66';c.lineWidth=.45;c.beginPath();c.moveTo(x-font*2,y+font);c.quadraticCurveTo(x-font*8,y-font*2,this.cx+this.radius*.35,this.cy+this.radius*.45);c.stroke();
   const rtl=/[\u0590-\u08ff]/u.test(item.text);c.direction=rtl?'rtl':'ltr';c.textAlign=rtl?'right':'left';c.fillStyle='#d1bac9';
   const chars=Array.from(item.text);let line='',lines=[];
   for(const char of chars){if(c.measureText(line+char).width>width&&line){lines.push(line);line=char}else line+=char}if(line)lines.push(line);
   lines.forEach((line,k)=>c.fillText(line,rtl?x+width:x,y+k*font*1.35));
   if(!this.reduced&&item.id!=='preview'&&g<1){c.strokeStyle='#c66a8c88';c.beginPath();c.moveTo(x,y+font*5.5);c.lineTo(x+width*g,y+font*5.5);c.stroke()}
  });
  c.globalAlpha=.6;c.direction='ltr';c.textAlign='left';c.font=`${Math.max(4.5,font)}px system-ui, sans-serif`;c.fillStyle='#aa8e9f';if(this.zoom<2.5&&!this.engine.exporting)c.fillText('MICROTRACES / ZOOM TO READ',at.x,at.y-font*3);c.restore();
 }
 drawReaction(reaction,time){
  const c=this.ctx,p=clamp((performance.now()-reaction.start)/3200,0,1),at=reaction.item.path?.[Math.floor(reaction.item.path.length/2)]||reaction.item;
  let[x,y]=reaction.kind==='texts'?[this.textAnchor().x,this.textAnchor().y]:this.xy(at.x,at.y);
  const u=this.unit;
  c.save();
  if(reaction.kind==='scars'){
   const points=reaction.item.path,count=this.w<700?3:6;
   for(let i=0;i<count;i++){
    const q=clamp((p-i*.045)/.78,0,1),pull=Math.sin(q*Math.PI);if(pull<=0)continue;
    const point=points[Math.min(points.length-1,Math.floor((i+.5)/count*points.length))],[tx,ty]=this.xy(point.x,point.y),a=i*2.399;
    const len=u*.055*pull;c.globalAlpha=Math.min(1,pull*2);this.thread(tx+Math.cos(a)*len,ty+Math.sin(a)*len*.8,tx,ty,(1.5+pull*2)*pull,Math.sin(i+q*4)*len*.25);
   }
  }else if(reaction.kind==='mass'){
   const size=reaction.item.r*u*.58,merge=ease(p/.7),count=this.w<700?3:5;
   for(let i=0;i<count;i++){const a=i*TAU/count+.4,d=u*.085*(1-merge),dx=x+Math.cos(a)*d,dy=y+Math.sin(a)*d;c.globalAlpha=Math.sin(p*Math.PI);this.thread(x,y,dx,dy,size*.3*(1-merge),size);const g=c.createRadialGradient(dx-size*.2,dy-size*.3,0,dx,dy,size);g.addColorStop(0,'#96808f');g.addColorStop(.28,'#382a38');g.addColorStop(1,'#040307');c.fillStyle=g;c.beginPath();c.ellipse(dx,dy,size,size*(.8+.2*merge),a,0,TAU);c.fill()}
  }else{
   c.globalAlpha=Math.sin(p*Math.PI)*.45;const distance=u*.04*(1-ease(p));for(let i=0;i<3;i++)this.thread(x-distance,y+i*3,x+distance*.5,y+6+i*3,1.5*(1-p),i*3);
  }
  // A delayed impulse travels inward, then gently out through the membrane.
  const q=clamp((p-.25)/.65,0,1),mx=x+(this.cx-x)*ease(q),my=y+(this.cy-y)*ease(q);
  c.globalAlpha=Math.sin(q*Math.PI)*.3;c.strokeStyle='#b64d7755';c.lineWidth=.8;c.beginPath();c.ellipse(mx,my,u*(.008+q*.09),u*(.005+q*.065),0,0,TAU);c.stroke();c.restore();
 }
 drawPointer(time){
  if(this.reduced||!this.pointer||this.preview||this.navigation)return;const p=this.pointer;
  if(!this.pointerFollow)this.pointerFollow={...p};const f=this.pointerFollow;f.x+=(p.x-f.x)*.15;f.y+=(p.y-f.y)*.15;
  const dx=f.x-this.cx,dy=f.y-this.cy,d=Math.hypot(dx,dy),r=this.radius;if(d<r*.6||d>r*1.7)return;
  const a=Math.atan2(dy,dx),strength=clamp(1-Math.abs(d-r*1.12)/(r*.58),0,1),c=this.ctx;
  c.save();c.globalAlpha=strength*.9;for(let i=0;i<4;i++){const b=a+(i-1.5)*.16,x=this.cx+Math.cos(b)*r*.93,y=this.cy+Math.sin(b)*r*.81;this.thread(x,y,x+(f.x-x)*strength*.75,y+(f.y-y)*strength*.75,1.5+strength*1.3,Math.sin(time+i)*4)}c.restore();
 }
 marker(point,color,time){const[x,y]=this.xy(point.x,point.y),c=this.ctx;c.save();c.strokeStyle=color;c.lineWidth=1/Math.sqrt(this.zoom);c.setLineDash([3,5]);c.beginPath();c.arc(x,y,14+(this.reduced?0:Math.sin(time*2)),0,TAU);c.stroke();c.restore()}
 destroy(){cancelAnimationFrame(this.raf);clearInterval(this.ageTimer);this.resizeObserver.disconnect()}
}
root.VeouresRenderer=Renderer;
})(globalThis);
