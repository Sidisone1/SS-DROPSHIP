const {chromium}=require('playwright');const path=require('path');
const list=process.argv[2].split(',').map(Number);const outdir=process.argv[3]||'out';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'visuels-template.html'));await p.waitForTimeout(1500);await p.evaluate(()=>document.fonts.ready);
require('fs').mkdirSync(outdir,{recursive:true});
for(const n of list){await p.evaluate(n=>render(n),n);await p.waitForTimeout(150);
 const chk=await p.evaluate(()=>{const v=document.querySelector('.v').getBoundingClientRect();const r=[];
  document.querySelectorAll('.v .cd,.v .band,.v .vt,.v .eco-part').forEach(e=>{const b=e.getBoundingClientRect();if(b.left<0||b.right>1080||b.top<0||b.bottom>1920)r.push('hors:'+e.className)});
  const t=document.querySelector('.vt').getBoundingClientRect();if(t.bottom>500)r.push('titre bas:'+Math.round(t.bottom));
  const pv=document.querySelector('.v .pv');if(pv&&pv.scrollHeight>pv.clientHeight+2)r.push('ecran deborde:'+(pv.scrollHeight-pv.clientHeight));
  document.querySelectorAll('.v .cd').forEach(e=>{if(e.scrollWidth>e.clientWidth+1)r.push('carte large')});
  const cds=[...document.querySelectorAll('.v .cd')].map(e=>e.getBoundingClientRect());const bd=document.querySelector('.band').getBoundingClientRect();cds.forEach((c,i)=>{if(c.bottom>bd.top-10)r.push('carte/bandeau '+(i+1));});
  return r});
 await p.screenshot({path:`${outdir}/v${String(n).padStart(2,'0')}.png`});console.log(n,chk.join(' | '));}
console.log(errs.join('\n'));await b.close()})();
