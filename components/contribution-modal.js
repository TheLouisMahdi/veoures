(function(root){
'use strict';
const fields={feed_mass:'<label>Living volume<input name="amount" type="range" min="0.01" max="0.09" value="0.045" step="0.005"></label>',leave_text:'<label>A small trace<textarea name="text" dir="auto" rows="2" maxlength="160" placeholder="Leave a few words…" aria-describedby="text-note" spellcheck="false"></textarea></label><p class="small" id="text-note">1–80 characters. Public, tiny, and slowly dissolving. Zoom into the writing corner to read it.</p>'};
root.VeouresComposer=function(form,type,point,path){
 if(form.dataset.type!==type){form.dataset.type=type;form.querySelector('[data-fields]').innerHTML=fields[type]||''}
 const input=new FormData(form),values={x:point.x,y:point.y};
 if(type==='draw_scar')values.path=path?.length>=2?path:[{x:Math.max(0,point.x-.06),y:Math.max(0,point.y-.01)},{x:Math.min(1,point.x+.06),y:Math.min(1,point.y+.01)}];
 if(type==='feed_mass')values.amount=Number(input.get('amount'));
 if(type==='leave_text'){values.x=.64;values.y=.62;values.text=String(input.get('text')??'')}
 return values;
};})(globalThis);
