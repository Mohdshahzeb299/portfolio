'use strict';
(()=>{
const find=s=>document.querySelector(s),films=Array.isArray(window.PORTFOLIO_FILMS)?window.PORTFOLIO_FILMS:[],dialog=find('#film-dialog'),mount=find('#player-mount');let selected=0;
const published=films.filter(f=>f.source&&!f.demo).length;
find('.collection-note').textContent=`${published} portfolio films · Vertical & horizontal`;
find('#film-count').textContent=`${published} films in my collection`;
function safePoster(value){if(!value)return '';try{const u=new URL(value,location.href);return ['https:','http:','file:'].includes(u.protocol)?u.href:'';}catch{return '';}}
// Resolve YouTube posters once per URL, including silent 120px missing-image placeholders.
const posterCache=new Map();
function loadPoster(img,value){
 const poster=safePoster(value);img.alt='';img.loading='lazy';img.decoding='async';img.draggable=false;
 if(!poster)return;
 const match=poster.match(/^https:\/\/(?:i\.ytimg\.com|img\.youtube\.com)\/vi\/([\w-]{11})\/(?:hqdefault|sddefault|maxresdefault)\.jpg(?:\?.*)?$/);
 if(!match){img.src=poster;return;}
 img.dataset.posterKey=poster;
 if(!posterCache.has(poster))posterCache.set(poster,new Promise(resolve=>{
  const candidates=['maxresdefault','sddefault','hqdefault'].map(size=>`https://i.ytimg.com/vi/${match[1]}/${size}.jpg`);
  const attempt=index=>{const probe=new Image();probe.referrerPolicy='no-referrer';probe.onload=()=>{if(probe.naturalWidth>120&&probe.naturalHeight>90)resolve(candidates[index]);else next();};probe.onerror=next;function next(){if(index+1<candidates.length)attempt(index+1);else resolve(poster);}probe.src=candidates[index];};attempt(0);
 }));
 // Loop copies share the resolved image, preventing inconsistent quality at a seam.
 posterCache.get(poster).then(url=>{img.src=url;document.querySelectorAll('img[data-poster-key]').forEach(copy=>{if(copy.dataset.posterKey===poster)copy.src=url;});});
}
function stop(){const v=mount.querySelector('video');if(v){v.pause();v.removeAttribute('src');v.load();}mount.replaceChildren();}
function open(index){selected=index;stop();const film=index===-1?window.PORTFOLIO_DEMO:films[index];find('#player-title').textContent=film.title;find('#player-description').textContent=film.description||'';
const context=find('#player-context');context.replaceChildren();
for(const [label,value] of [['Focus',film.focus],['My contribution',film.role],['Brief',film.brief],['Outcome',film.outcome]]){if(!value)continue;const term=document.createElement('dt'),detail=document.createElement('dd');term.textContent=label;detail.textContent=value;context.append(term,detail);}
find('#project-enquiry').href='mailto:shahzebmohd092@gmail.com?subject='+encodeURIComponent('Project enquiry: '+film.title);
find('#player-format').textContent=film.format==='landscape'?'16:9 / LANDSCAPE':'9:16 / VERTICAL';dialog.dataset.format=film.format||'portrait';find('#player-status').textContent='';const external=find('#player-external');external.hidden=true;external.removeAttribute('href');const media=window.PortfolioVideo.parseMedia(film.source,location.href);
if(media?.type==='embed'){const iframe=document.createElement('iframe');iframe.src=media.url;iframe.title=film.title;iframe.allow='autoplay; fullscreen; picture-in-picture; encrypted-media';iframe.setAttribute('allowfullscreen','');iframe.referrerPolicy='strict-origin-when-cross-origin';mount.append(iframe);external.href=media.watch;external.textContent=`Watch on ${media.provider} ↗`;external.hidden=false;find('#player-status').textContent=`Plays here via ${media.provider}. If the owner restricts embedding, use the external link.`;
}else if(media?.type==='video'){const v=document.createElement('video');v.controls=true;v.playsInline=true;v.preload='metadata';v.src=media.url;const poster=safePoster(film.poster);if(poster)v.poster=poster;if(film.captions){const track=document.createElement('track');track.kind='captions';track.src=film.captions;track.srclang=film.captionLanguage||'en';track.label=film.captionLabel||'Captions';v.append(track);}v.addEventListener('error',()=>find('#player-status').textContent='The film could not be loaded. Please try again later.');mount.append(v);
}else{const empty=document.createElement('div');empty.className='player-empty';const mark=document.createElement('span');mark.textContent='✳';const h=document.createElement('h3');h.textContent='A story in the making.';const p=document.createElement('p');p.textContent='This project film has not been supplied yet. The animation demo previews the vertical viewing experience.';empty.append(mark,h,p);mount.append(empty);}
if(!dialog.open)dialog.showModal();}
find('#close-player').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',stop);dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});find('#next-watch').addEventListener('click',()=>open((selected+1)%films.length));

function setupRow(row){
const format=row.dataset.format,suffix=format==='landscape'?'-horizontal':'';
const find=s=>row.querySelector(s.startsWith('#')?s+suffix:s),grid=find('#film-grid');
let suppressClick=false;
const cardObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('card-visible');cardObserver.unobserve(entry.target);}}),{threshold:.08});
function render(){cardObserver.disconnect();grid.scrollLeft=0;grid.replaceChildren();films.forEach((film,index)=>{if((film.format||'portrait')!==format)return;
const card=document.createElement('button');card.className='film-card';card.style.setProperty('--reveal-delay',`${index%5*55}ms`);card.dataset.index=index;card.dataset.tone=film.tone||'coral';card.setAttribute('aria-label',`${film.source?'Watch':'View'} ${film.title}${film.source?'':' — coming soon'}`);
const thumb=document.createElement('div');thumb.className='film-thumb';const poster=safePoster(film.poster);if(poster){const img=document.createElement('img');img.referrerPolicy='no-referrer';loadPoster(img,film.poster);thumb.append(img);}else{const art=document.createElement('div');art.className='portrait-art';const shape=document.createElement('span');shape.className='portrait-symbol';shape.textContent=['✳','↗','◒','◎','✦'][index%5];const words=document.createElement('b');words.textContent=['MAKE\nIT\nMATTER.','FRAME\nTHE\nSTORY.','IDEAS\nIN\nMOTION.','A NEW\nPOINT\nOF VIEW.','FORM.\nFEELING.\nFOCUS.'][index%5];art.append(shape,words);thumb.append(art);}
const top=document.createElement('span');top.className='portrait-top';top.textContent=`${String(grid.children.length+1).padStart(2,'0')} / ${film.format==='landscape'?'16:9':'9:16'}`;const play=document.createElement('span');play.className='portrait-play';play.textContent=film.source?'▶':'↗';const badge=document.createElement('span');badge.className='thumb-badge';badge.textContent=film.source?(film.demo?'ANIMATION DEMO':'WATCH FILM'):'COMING SOON';thumb.append(top,play,badge);
const label=document.createElement('small');label.textContent=film.label||film.category;const title=document.createElement('strong');title.textContent=film.title;const duration=document.createElement('span');duration.className='film-duration';duration.textContent=film.duration||'Watch on YouTube';card.append(thumb,label,title,duration);card.addEventListener('click',()=>{if(!suppressClick)open(index);});grid.append(card);card.classList.add("card-visible");
});const available=films.filter(f=>(f.format||'portrait')===format&&f.source).length;find('#row-count').textContent=`${available} ${available===1?'film':'films'} · Swipe, drag, or use arrows`;syncRail(true);}
/* Compact floating rail. Wheel, swipe, drag, and keyboard share native scrolling. */
const runway=find('.film-runway'),pin=find('.film-pin'),meter=find('.rail-meter span');
const motionOK=()=>!document.documentElement.classList.contains('motion-paused')&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
const maxScroll=()=>Math.max(0,grid.scrollWidth-grid.clientWidth);
let frame=0,drag=null,hover=null,target=0,inView=false,lastTime=0,nativeTouchUntil=0,loopCount=0,cycle=0,lastWritten=0,keyboardFocus=false;
window.addEventListener("keydown",()=>keyboardFocus=true);
function syncRail(reset=false){runway.classList.remove('rail-pinned');
const previousCycle=cycle,position=previousCycle?(grid.scrollLeft-previousCycle)/previousCycle:0;
if(reset===true){const originals=[...grid.children];loopCount=originals.length;originals.forEach(card=>card.dataset.loop='main');if(loopCount>1){const copy=()=>originals.map(card=>{const clone=card.cloneNode(true);clone.dataset.loop='copy';clone.tabIndex=-1;clone.setAttribute('aria-hidden','true');clone.addEventListener('click',()=>{if(!suppressClick)open(Number(clone.dataset.index));});return clone;});grid.prepend(...copy());grid.append(...copy());}}
cycle=loopCount>1?loopCount*((grid.firstElementChild?.offsetWidth||220)+(parseFloat(getComputedStyle(grid).gap)||36)):0;
grid.scrollLeft=cycle?(reset===true?cycle:cycle+position*cycle):0;target=grid.scrollLeft;normalize();lastWritten=grid.scrollLeft;decorate(performance.now());wake();}
function normalize(){if(!cycle)return;const shift=Math.floor((grid.scrollLeft-cycle)/cycle)*cycle;if(shift){grid.scrollLeft-=shift;target-=shift;if(drag&&!drag.touch)drag.left-=shift;}}

function decorate(time){const max=maxScroll(),progress=cycle?((grid.scrollLeft-cycle)%cycle+cycle)%cycle/cycle:(max?grid.scrollLeft/max:0);meter.style.transform=`scaleX(${max?Math.max(.035,progress):1})`;
const cards=[...grid.children],width=grid.clientWidth,center=width/2;
cards.forEach((card,i)=>{const x=card.offsetLeft-grid.offsetLeft+card.offsetWidth/2-grid.scrollLeft-center,normalized=x/(width*.5),edge=Math.min(1,Math.abs(normalized)),active=hover?.card===card;
if(motionOK()){const bob=Math.sin(time*.0008+Number(card.dataset.index)*1.15)*8,drift=Math.cos(time*.0006+Number(card.dataset.index)*.9)*1.3;
card.style.transform=`perspective(1200px) translate3d(0,${bob+(active?-10:edge*8)}px,${active?22:-edge*45}px) rotateY(${-normalized*9+(active?hover.x*7:0)}deg) rotateX(${active?-hover.y*5:0}deg) rotateZ(${drift+normalized*1.8}deg) scale(${1-edge*.055})`;
}else card.style.transform='none';
card.style.opacity=String(1-Math.max(0,edge-.63)*.55);});
const gap=parseFloat(getComputedStyle(grid).gap)||36,padding=parseFloat(getComputedStyle(grid).paddingLeft)||0,step=(cards[0]?.offsetWidth||220)+gap;
const current=loopCount?((Math.round((grid.scrollLeft+center-padding-(cards[0]?.offsetWidth||220)/2)/step)%loopCount)+loopCount)%loopCount+1:0;
find('#rail-position').textContent=cards.length?`${String(current).padStart(2,'0')} / ${String(loopCount).padStart(2,'0')}`:'No films yet';find('#film-prev').disabled=loopCount<2;find('#film-next').disabled=loopCount<2;}
function tick(time){frame=0;if(!inView||document.hidden)return;const dt=Math.min(40,time-(lastTime||time));lastTime=time;
if(time<nativeTouchUntil)target=grid.scrollLeft;
if(motionOK()&&!drag&&time>=nativeTouchUntil){const difference=target-grid.scrollLeft;if(Math.abs(difference)>.7){const move=difference*(1-Math.exp(-dt/110));grid.scrollLeft=Math.abs(move)<1?target:grid.scrollLeft+move;}else if(Math.abs(difference)>.01)grid.scrollLeft=target;}
normalize();lastWritten=grid.scrollLeft;decorate(time);if(motionOK())frame=requestAnimationFrame(tick);}
function wake(){if(!frame&&inView&&!document.hidden){lastTime=0;frame=requestAnimationFrame(tick);}}
function browse(left){target=cycle?left:Math.max(0,Math.min(maxScroll(),left));if(!motionOK()){grid.scrollLeft=target;normalize();lastWritten=grid.scrollLeft;decorate(0);}else wake();}
new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)wake();else if(frame){cancelAnimationFrame(frame);frame=0;}},{rootMargin:'100px'}).observe(pin);
const advance=()=>{const step=(grid.firstElementChild?.offsetWidth||220)+(parseFloat(getComputedStyle(grid).gap)||36);return step*Math.max(1,Math.round(grid.clientWidth*.6/step));};
find('#film-prev').addEventListener('click',()=>browse(target-advance()));find('#film-next').addEventListener('click',()=>browse(target+advance()));
grid.addEventListener('wheel',e=>{if(e.ctrlKey||loopCount<2)return;const horizontal=Math.abs(e.deltaX)>Math.abs(e.deltaY);if(!horizontal&&!e.shiftKey)return;const delta=horizontal?e.deltaX:e.deltaY;const amount=delta*(e.deltaMode===1?20:e.deltaMode===2?grid.clientWidth:1);e.preventDefault();browse(target+amount);},{passive:false});
grid.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();browse(e.key==='Home'?cycle:e.key==='End'?cycle+(loopCount-1)*((grid.firstElementChild?.offsetWidth||220)+(parseFloat(getComputedStyle(grid).gap)||36)):target+(e.key==='ArrowRight'?1:-1)*grid.clientWidth*.45);});
grid.addEventListener('focusin',e=>{if(!keyboardFocus||!e.target.matches('.film-card'))return;const card=e.target;browse(card.offsetLeft-grid.offsetLeft+card.offsetWidth/2-grid.clientWidth/2);});
grid.addEventListener('pointerdown',e=>{keyboardFocus=false;if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,left:grid.scrollLeft};suppressClick=false;});
grid.addEventListener('pointermove',e=>{const card=e.target.closest('.film-card');if(card){const box=card.getBoundingClientRect();hover={card,x:(e.clientX-box.left)/box.width-.5,y:(e.clientY-box.top)/box.height-.5};}else hover=null;
if(!drag||e.buttons!==1)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>6){suppressClick=true;grid.classList.add('dragging');target=cycle?drag.left-dx:Math.max(0,Math.min(maxScroll(),drag.left-dx));grid.scrollLeft=target;normalize();lastWritten=grid.scrollLeft;}});
grid.addEventListener('pointerleave',()=>hover=null);grid.addEventListener('pointercancel',()=>{drag=null;grid.classList.remove('dragging');});
window.addEventListener('pointerup',()=>{drag=null;grid.classList.remove('dragging');setTimeout(()=>suppressClick=false,0);});
// Touch uses native momentum, without the desktop smoothing loop fighting it.
grid.addEventListener('touchstart',()=>{drag={touch:true};},{passive:true});grid.addEventListener('touchend',()=>{drag=null;nativeTouchUntil=performance.now()+1500;target=grid.scrollLeft;},{passive:true});
grid.addEventListener('scroll',()=>{if(Math.abs(grid.scrollLeft-lastWritten)>.5){target=grid.scrollLeft;lastWritten=grid.scrollLeft;}if(drag?.touch||!motionOK())target=grid.scrollLeft;if(drag?.touch||!motionOK()||performance.now()<nativeTouchUntil){normalize();target=grid.scrollLeft;}if(!motionOK())decorate(0);},{passive:true});
window.addEventListener('resize',syncRail);new MutationObserver(syncRail).observe(document.documentElement,{attributes:true,attributeFilter:['class']});matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',syncRail);document.addEventListener('visibilitychange',wake);
grid.addEventListener('pointerover',e=>{if(e.target.closest('.film-card')){document.querySelector('.cursor').classList.add('active');document.querySelector('.cursor span').textContent='Watch';}});grid.addEventListener('pointerleave',()=>{document.querySelector('.cursor').classList.remove('active');document.querySelector('.cursor span').textContent='Explore';});render();

}
const selectedGrid=document.querySelector('.selected-grid');
if(selectedGrid){selectedGrid.replaceChildren();films.forEach((film,index)=>{if(!film.selected||selectedGrid.children.length>=3)return;const media=window.PortfolioVideo.parseMedia(film.source,location.href);if(!media)return;const link=document.createElement('a');link.className='selected-film';link.href=media.watch||media.url;link.target='_blank';link.rel='noopener';link.dataset.film=index;link.setAttribute('aria-label','Watch selected film: '+film.title);const thumb=document.createElement('div');thumb.className='selected-thumb';const img=document.createElement('img');loadPoster(img,film.poster);const play=document.createElement('span');play.textContent='▶';play.setAttribute('aria-hidden','true');thumb.append(img,play);const format=document.createElement('small');format.textContent=film.format==='landscape'?'16:9 · Horizontal':'9:16 · Vertical';const title=document.createElement('h4');title.textContent=film.title;const focus=document.createElement('p');focus.textContent=film.focus||film.category;const action=document.createElement('span');action.className='selected-action';action.textContent='Watch film ↗';link.append(thumb,format,title,focus,action);selectedGrid.append(link);});document.querySelector('.selected-work').hidden=!selectedGrid.children.length;}
document.querySelectorAll('.selected-film').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();open(Number(link.dataset.film));}));
document.querySelectorAll('.film-row').forEach(setupRow);
})();


