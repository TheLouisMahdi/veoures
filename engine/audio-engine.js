(function(root){
'use strict';
class AudioEngine{
 constructor(basePath='audio/'){this.basePath=basePath;this.enabled=false;this.ambient=null;this.voices=new Set();this.generation=0;document.addEventListener('visibilitychange',()=>{this.generation++;this.pauseAll();if(!document.hidden&&this.enabled)this.ambience().catch(()=>{});});window.addEventListener('pagehide',()=>this.stop());}
 pauseAll(){for(const a of this.voices){a.pause();a.currentTime=0;}this.voices.clear();this.ambient?.pause();this.ambient=null;}
 async ambience(){if(!this.enabled||document.hidden||this.ambient)return;const a=new Audio(this.basePath+'ambient-base.mp3');a.preload='none';a.loop=true;a.volume=.13;this.ambient=a;const version=this.generation;try{await a.play();if(!this.enabled||document.hidden||version!==this.generation)a.pause();}catch{if(this.ambient===a){this.ambient=null;this.enabled=false;}throw Error('Sound could not start. Try again.');}}
 async toggle(){if(this.enabled){this.stop();return false;}this.enabled=true;const generation=++this.generation;try{await this.ambience();}catch{if(generation===this.generation)this.stop();return this.enabled;}return this.enabled;}
 play(tool){if(!this.enabled||document.hidden||this.voices.size>=3)return;const files={draw_scar:'tool-draw-scar',seed_letter:'tool-seed-letter',feed_word:'tool-feed-word',add_limb:'tool-add-limb',feed_mass:'tool-feed-mass',heal:'tool-heal',corrupt:'tool-corrupt'};const a=new Audio(this.basePath+(files[tool]||'ui-confirm-mutation')+'.mp3');a.preload='none';a.volume=.28;this.voices.add(a);const clear=()=>this.voices.delete(a);a.addEventListener('ended',clear,{once:true});a.addEventListener('error',clear,{once:true});const generation=this.generation;a.play().then(()=>{if(!this.enabled||document.hidden||generation!==this.generation)a.pause();}).catch(clear);}
 stop(){this.enabled=false;this.generation++;this.pauseAll();}
}
root.VeouresAudio=AudioEngine;
})(globalThis);
