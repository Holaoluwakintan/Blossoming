(()=>{'use strict';
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');

/* reveal on scroll */
const rio=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
$$('.r').forEach(el=>rio.observe(el));
// stagger siblings that reveal together
$$('.hub-grid,.work-grid,.rail,.steps,.vids,.plans,.libx').forEach(g=>[...g.children].forEach((c,i)=>{if(!c.style.getPropertyValue('--d'))c.style.setProperty('--d',Math.min(i,5)*70+'ms')}));

/* hero entrance */
const stage=$('.hero-stage');
const go=()=>stage&&stage.classList.add('go');
if(document.readyState==='complete')requestAnimationFrame(go);else addEventListener('load',()=>requestAnimationFrame(go),{once:true});
setTimeout(go,1200);

/* one rAF loop: progress bar, hero parallax */
const bar=$('.progress i'),hps=$$('.hp'),hero=$('.hero');
let vh=innerHeight,docH=1,heroH=1,ticking=false;
const measure=()=>{vh=innerHeight;docH=Math.max(1,document.documentElement.scrollHeight-vh);heroH=hero?hero.offsetHeight:1};
measure();addEventListener('resize',()=>{measure();onScroll()},{passive:true});
new ResizeObserver(measure).observe(document.body);
const speeds=[-.10,-.22,-.10];
function frame(){ticking=false;const y=scrollY;
 bar.style.transform='scaleX('+(y/docH).toFixed(4)+')';
 if(!RM&&y<heroH+50){const p=Math.min(1,y/heroH);hps.forEach((h,i)=>{h.style.transform='translate3d(0,'+(y*speeds[i]).toFixed(1)+'px,0)'+(i!==1?' scale('+(1-p*.04).toFixed(4)+')':'')})}
}
function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
addEventListener('scroll',onScroll,{passive:true});frame();

/* hub scrollspy: nav + progress colour */
const navA=$$('[data-hub]');const hubsEls=['apps','building','studio','library','reviews'].map(id=>document.getElementById(id));
const COL={apps:'#2997ff',building:'#ff7a1a',studio:'#8b5cf6',library:'#10b981',reviews:'#f5a300'};
let cur='';
const sio=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)setHub(e.target.id)})},{rootMargin:'-45% 0px -50% 0px'});
hubsEls.forEach(el=>el&&sio.observe(el));
const top=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)setHub('')})},{rootMargin:'-45% 0px -50% 0px'});
[$('.hero'),$('.hubs')].forEach(el=>el&&top.observe(el));
function setHub(id){if(id===cur)return;cur=id;navA.forEach(a=>a.classList.toggle('on',a.dataset.hub===id));
 document.documentElement.style.setProperty('--pacc',COL[id]||'#1d1d1f');
 const sa=$('.subnav a.on');if(sa){const sn=$('.subnav-in');sn.scrollTo({left:sa.offsetLeft-sn.clientWidth/2+sa.clientWidth/2,behavior:RM?'auto':'smooth'})}}

/* apps: sticky phone follows the app in view */
const ss=$$('.apps-stick .ss'),dots=$$('.apps-stick .dots b');
const aio=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){const i=+e.target.dataset.app;ss.forEach((im,j)=>im.classList.toggle('on',i===j));dots.forEach((d,j)=>d.classList.toggle('on',i===j))}})},{rootMargin:'-40% 0px -40% 0px'});
$$('.app').forEach(a=>aio.observe(a));

/* rails */
$$('.rb').forEach(b=>b.addEventListener('click',()=>{const r=$('.rail');const c=r.firstElementChild;r.scrollBy({left:(+b.dataset.dir)*(c?c.offsetWidth+16:320),behavior:RM?'auto':'smooth'})}));

/* price tabs */
const seg=$('.seg');if(seg){const [bw,bv]=$$('button',seg);const show=v=>{seg.classList.toggle('v',v);bw.classList.toggle('on',!v);bv.classList.toggle('on',v);bw.setAttribute('aria-selected',!v);bv.setAttribute('aria-selected',v);$('#pl-web').hidden=v;$('#pl-vid').hidden=!v};bw.addEventListener('click',()=>show(false));bv.addEventListener('click',()=>show(true))}

/* studio videos: tap to play, pause offscreen */
$$('.vid').forEach(f=>{const v=$('video',f),b=$('.vplay',f);
 const toggle=()=>{if(v.paused){$$('.vid video').forEach(o=>{if(o!==v&&!o.paused){o.pause();o.parentNode.classList.remove('playing')}});v.muted=false;v.play().then(()=>f.classList.add('playing')).catch(()=>{v.muted=true;v.play().then(()=>f.classList.add('playing')).catch(()=>{})})}else{v.pause();f.classList.remove('playing')}};
 b.addEventListener('click',toggle);v.addEventListener('click',toggle)});
const vio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting){const v=$('video',e.target);if(v&&!v.paused){v.pause();e.target.classList.remove('playing')}}}));
$$('.vid').forEach(f=>vio.observe(f));

/* library modal */
const dlg=$('#vmodal'),mv=$('#mvideo');
const closeM=()=>{mv.pause();mv.removeAttribute('src');mv.load();if(dlg.open)dlg.close()};
$$('.book').forEach(b=>b.addEventListener('click',()=>{mv.src=b.dataset.video;$('#mtitle').textContent=b.dataset.title;if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');mv.play().catch(()=>{})}));
$('.mclose').addEventListener('click',closeM);dlg.addEventListener('click',e=>{if(e.target===dlg)closeM()});dlg.addEventListener('cancel',e=>{e.preventDefault();closeM()});

/* ---------- reviews (same API as before: /api/reviews) ---------- */
const NAMES={blossom:'Blossom',ranti:'Ranti',voicepad:'VoicePad',biblearena:'Bible Arena'};
let ALL=[],STATS={},filter='all',shown=8;
const starStr=n=>'★★★★★'.slice(0,Math.round(n))+'☆☆☆☆☆'.slice(0,5-Math.round(n));
const COLORS=['#f5a300','#2997ff','#8b5cf6','#10b981','#ff7a1a','#ff375f'];
function ago(t){const s=(Date.now()-t)/1000;if(s<60)return'just now';if(s<3600)return Math.floor(s/60)+' min ago';if(s<86400)return Math.floor(s/3600)+' h ago';if(s<86400*30)return Math.floor(s/86400)+' d ago';return new Date(t).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}
function card(r){const el=document.createElement('article');el.className='rcard';
 const hd=document.createElement('div');hd.className='hd';const av=document.createElement('div');av.className='av';av.textContent=(r.name.trim()[0]||'?').toUpperCase();av.style.background=COLORS[r.name.length%COLORS.length];
 const who=document.createElement('div');who.className='who';const nm=document.createElement('b');nm.textContent=r.name;const sub=document.createElement('span');sub.textContent=(NAMES[r.app]||'Blossom')+' · '+ago(r.at);who.append(nm,sub);
 const st=document.createElement('div');st.className='st';st.textContent=starStr(r.stars);st.setAttribute('aria-label',r.stars+' out of 5 stars');
 hd.append(av,who,st);const p=document.createElement('p');p.textContent=r.comment;el.append(hd,p);return el}
function render(){const list=$('#rlist'),sum=$('#rsum');const L=filter==='all'?ALL:ALL.filter(r=>r.app===filter);list.textContent='';
 const S=filter==='all'?STATS.all:STATS[filter];sum.textContent='';
 if(S&&S.count){const b=document.createElement('b');b.textContent=S.avg.toFixed(1);const d=document.createElement('div');const st=document.createElement('div');st.className='st';st.textContent=starStr(S.avg);const sp=document.createElement('span');sp.textContent=S.count+(S.count===1?' review':' reviews')+(filter==='all'?'':' for '+NAMES[filter]);d.append(st,sp);sum.append(b,d)}
 if(!L.length){list.innerHTML='<div class="empty"><b>Be the first to review'+(filter==='all'?'':' '+NAMES[filter])+'</b>Your review shows here for everyone to read.</div>';$('#rmore').hidden=true;return}
 L.slice(0,shown).forEach(r=>list.append(card(r)));$('#rmore').hidden=L.length<=shown}
function rates(){$$('[data-rate]').forEach(a=>{const S=STATS[a.dataset.rate];const st=$('.st',a);if(S&&S.count){st.textContent=starStr(S.avg);st.classList.remove('none');$('.rt',a).textContent=S.avg.toFixed(1)+' · '+S.count+(S.count===1?' review':' reviews')}else st.classList.add('none')})}
rates();
async function load(){try{const r=await fetch('/api/reviews',{cache:'no-store'});const j=await r.json();ALL=j.reviews||[];STATS=j.stats||{};render();rates()}catch(e){$('#rlist').innerHTML='<div class="empty"><b>Reviews could not load</b>Check your connection and refresh.</div>'}}
let loaded=false;const lio=new IntersectionObserver(e=>{if(e[0].isIntersecting&&!loaded){loaded=true;load();lio.disconnect()}},{rootMargin:'1200px'});lio.observe($('#reviews'));
setTimeout(()=>{if(!loaded){loaded=true;load()}},2500);
const setFilter=k=>{filter=k;shown=8;$$('#rfilter button').forEach(x=>x.classList.toggle('on',x.dataset.f===k));render()};
$$('#rfilter button').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.f)));
$('#rmore').addEventListener('click',()=>{shown+=8;render()});
$$('[data-review]').forEach(a=>a.addEventListener('click',()=>{$('#r-app').value=a.dataset.review}));
$$('[data-rate]').forEach(a=>a.addEventListener('click',()=>{const k=a.dataset.rate;$('#r-app').value=k;setFilter(k);$('#reviews').scrollIntoView({behavior:RM?'auto':'smooth'})}));
const ta=$('#r-text');ta.addEventListener('input',()=>{$('#r-count').textContent=ta.value.length});
$('#rform').addEventListener('submit',async e=>{e.preventDefault();const f=e.target,msg=$('#r-msg'),btn=$('#r-send');
 const data={app:f.app.value,stars:+(f.querySelector('input[name=stars]:checked')||{}).value||0,name:f.elements.name.value.trim(),comment:f.comment.value.trim(),website:f.website.value};
 msg.className='rmsg err';
 if(!data.stars){msg.textContent='Tap the stars to choose a rating.';return}
 if(!data.name){msg.textContent='Please add your name.';f.elements.name.focus();return}
 if(data.comment.length<2){msg.textContent='Please write a short review.';f.comment.focus();return}
 btn.disabled=true;btn.textContent='Posting…';
 try{const r=await fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(j.error||'Something went wrong. Please try again.');
  msg.className='rmsg ok';msg.textContent='Thank you! Your review is live.';f.comment.value='';$('#r-count').textContent='0';
  if(j.review)ALL.unshift(j.review);if(j.stats)STATS=j.stats;setFilter('all');rates();
 }catch(err){msg.textContent=err.message}finally{btn.disabled=false;btn.textContent='Post review'}});
})();
