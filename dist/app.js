const preference=matchMedia('(prefers-reduced-motion: reduce)');
let stopped=preference.matches;
const motion=document.querySelector('#motion');
function setMotion(){document.body.classList.toggle('motion-off',stopped);motion.textContent=stopped?'Enable motion':'Pause motion';motion.setAttribute('aria-pressed',String(stopped));update();}
motion.addEventListener('click',()=>{stopped=!stopped;setMotion()});preference.addEventListener('change',e=>{stopped=e.matches;setMotion()});
const logoRider=document.querySelector('.route-rider'),logoWheel=document.querySelector('.route-wheel');
const heroRoute=document.querySelector('#hero-route');
const routeLength=heroRoute.getTotalLength();
let scheduled=false,heroProgress=0,heroLastTime=0;
function update(time=performance.now()){scheduled=false;const frozen=stopped;const heroHeight=document.querySelector('.hero').offsetHeight;const target=frozen?0:Math.min(1,Math.max(0,scrollY/(heroHeight*.7)));const dt=heroLastTime?Math.min(time-heroLastTime,64):16;heroLastTime=time;heroProgress=frozen?0:heroProgress+(target-heroProgress)*(1-Math.exp(-dt/85));if(Math.abs(target-heroProgress)<.0003)heroProgress=target;
 const distance=routeLength*(.22+heroProgress*.65);const point=heroRoute.getPointAtLength(distance);const before=heroRoute.getPointAtLength(Math.max(0,distance-2));const after=heroRoute.getPointAtLength(Math.min(routeLength,distance+2));const angle=Math.atan2(after.y-before.y,after.x-before.x)*180/Math.PI;
 logoRider.setAttribute('transform',`translate(${point.x} ${point.y}) rotate(${angle})`);logoWheel.setAttribute('transform',`rotate(${heroProgress*routeLength*.65/36*180/Math.PI} 0 -38)`);
 if(heroProgress!==target&&!scheduled){scheduled=true;requestAnimationFrame(update);}
}
function requestHero(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}}
addEventListener('scroll',requestHero,{passive:true});addEventListener('resize',requestHero);setMotion();
const modal=document.querySelector('#info');
const content={imprint:['Imprint','This space is reserved for the organiser’s legal name, registered address and official contact details. Final information will be provided before launch.'],privacy:['Privacy notice','The organising team will provide the final privacy information here before the website begins collecting registrations or donations.'],accessibility:['Accessibility information','The final accessibility statement and contact information will be added here by the organising team.'],registration:['Your adventure is on the horizon.','Applications are not open yet. The organising team will share confirmed dates, eligibility criteria and the official registration link here.'],support:['Help make the next chapter happen.','Official partnership, donation and contact details will be added once confirmed by the organising team. No donations or personal information are collected in this preview.']};
document.querySelectorAll('[data-dialog]').forEach(button=>button.addEventListener('click',()=>{const [title,copy]=content[button.dataset.dialog];document.querySelector('#dialog-title').textContent=title;document.querySelector('#dialog-copy').textContent=copy;modal.showModal()}));document.querySelectorAll('.close,.close-bottom').forEach(b=>b.addEventListener('click',()=>modal.close()));modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close()}});
const header=document.querySelector('#site-header');
const hero=document.querySelector('.hero');
const toggle=document.querySelector('#menu-toggle');
const menu=document.querySelector('#site-menu');
function closeMenu(restoreFocus=false){menu.hidden=true;toggle.setAttribute('aria-expanded','false');if(restoreFocus)toggle.focus();}
toggle.addEventListener('click',()=>{const opening=menu.hidden;menu.hidden=!opening;toggle.setAttribute('aria-expanded',String(opening));});
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{closeMenu();const target=link.hash?document.querySelector(link.hash):null;if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}}));
document.addEventListener('click',event=>{if(!header.contains(event.target))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden)closeMenu(true);});
header.addEventListener('focusout',()=>{requestAnimationFrame(()=>{if(!header.contains(document.activeElement))closeMenu();});});
function updateHeader(){header.classList.toggle('is-compact',hero.getBoundingClientRect().bottom<=105);}
addEventListener('scroll',updateHeader,{passive:true});addEventListener('resize',updateHeader);updateHeader();
const wheelChapter=document.querySelector('.wheel-journey');
const bigWheel=document.querySelector('.journey-wheel');
const wheelStory=document.querySelector('.wheel-story');
const memoryChapter=document.querySelector('#memories');
const memoryCards=[...document.querySelectorAll('.photo')];
const flagChapter=document.querySelector('#hungary');
const flagIntro=document.querySelector('.flag-intro');
const flagCanvas=document.querySelector('.flag-canvas');
const facts=[...document.querySelectorAll('.flag-facts article')];
const flagPaths=[...document.querySelectorAll('.living-flag>path')];
const clothGradients=[...document.querySelectorAll('.living-flag linearGradient')];
const clamp=(n)=>Math.min(1,Math.max(0,n));
const ease=(n)=>{n=clamp(n);return n*n*(3-2*n)};
function chapterProgress(el){const top=innerWidth<=650?100:74;return clamp((top-el.getBoundingClientRect().top)/Math.max(1,el.offsetHeight-(innerHeight-top)));}
function memoryProgress(){const top=innerWidth<=650?100:74;const lead=Math.min(360,innerHeight*.5);const travel=Math.max(1,memoryChapter.offsetHeight-(innerHeight-top));return clamp((top+lead-memoryChapter.getBoundingClientRect().top)/(lead+travel));}
function flagProgress(){const top=innerWidth<=650?100:74;const lead=Math.min(360,innerHeight*.5);const travel=Math.max(1,flagChapter.offsetHeight-(innerHeight-top));return clamp((top+lead-flagChapter.getBoundingClientRect().top)/(lead+travel));}
function crossTurnProgress(){const top=innerWidth<=650?100:74;const lead=Math.min(320,innerHeight*.5);const travel=Math.max(1,wheelChapter.offsetHeight-(innerHeight-top));return clamp((top+lead-wheelChapter.getBoundingClientRect().top)/(lead+travel*.34));}
let sceneFrame=false,lastSceneTime=0;
let sceneState={p:chapterProgress(wheelChapter),r:crossTurnProgress(),m:memoryProgress(),f:flagProgress()};
let tiltTarget={x:0,y:0},tilt={x:0,y:0};
const mediaFrames=memoryCards.map(card=>card.querySelector('.photo-art'));
const memoryStage=document.querySelector('.memory-stage');
const memoryDiscover=document.querySelector('.memory-discover');
if(matchMedia('(hover:hover) and (pointer:fine)').matches){memoryStage.addEventListener('pointermove',event=>{const r=memoryStage.getBoundingClientRect();tiltTarget={x:((event.clientX-r.left)/r.width-.5)*2,y:((event.clientY-r.top)/r.height-.5)*2};requestScenes()},{passive:true});memoryStage.addEventListener('pointerleave',()=>{tiltTarget={x:0,y:0};requestScenes()});}
function paintScenes(time=performance.now()){sceneFrame=false;const freeze=stopped;document.body.classList.toggle('motion-off',freeze);if(freeze){memoryDiscover.hidden=false;memoryDiscover.style.setProperty('--discover-reveal','1');drawFlag(0);lastSceneTime=0;return;}
 const targets={p:chapterProgress(wheelChapter),r:crossTurnProgress(),m:memoryProgress(),f:flagProgress()};
 const dt=lastSceneTime?Math.min(time-lastSceneTime,64):16;lastSceneTime=time;const blend=1-Math.exp(-dt/90);let moving=false;
 for(const key of ['p','r','m','f']){const delta=targets[key]-sceneState[key];if(Math.abs(delta)>.0003){sceneState[key]+=delta*blend;moving=true}else sceneState[key]=targets[key];}
 for(const key of ['x','y']){const delta=tiltTarget[key]-tilt[key];tilt[key]+=delta*blend;if(Math.abs(delta)>.002)moving=true;}
 const {p,r,m,f}=sceneState;
 const turn=ease(r),growth=ease((p-.30)/.58);const story=ease((p-.54)/.36);bigWheel.style.transform=`scale(${.65+growth*5.3}) rotate(${turn*90}deg)`;bigWheel.style.opacity=String(1-ease((p-.44)/.4)*.94);wheelStory.style.opacity=String(story);wheelStory.style.transform=`translateY(${(1-story)*40}px) scale(${.92+story*.08})`;wheelStory.style.setProperty('--iris',`${story*150}%`);
 const mobile=innerWidth<=650;
 memoryCards.forEach((card,i)=>{const t=ease((m-i*.16)/.34);const drift=clamp((m-.1-i*.13)/.65);const x=mobile?(i-1)*12:(i-1)*104;const initialX=mobile?(i%2?-110:110):(i-1)*215;const y=(1-t)*330+(mobile?i*8:Math.abs(i-1)*18)-(drift-.5)*(i+1)*12;const rotation=(1-t)*(i%2?-20:20)+(i-1)*6;const tiltX=(1-t)*14-tilt.y*3;const tiltY=(1-t)*(i-1)*15+tilt.x*4;
 card.style.opacity=String(ease(t));card.style.transform=`translate3d(${initialX*(1-t)+x*t}%,${y}px,0) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${rotation}deg) scale(${.83+t*.17})`;card.style.setProperty('--reveal',`${t*125}%`);
 const zoom=1.25-drift*.06;const panX=(drift-.5)*(i%2?8:-8)+tilt.x*2;const panY=(drift-.5)*-10+tilt.y*2;mediaFrames[i].style.transform=`translate3d(${panX}%,${panY}%,0) scale(${zoom}) rotate(${(drift-.5)*(i-1)*2}deg)`;
 });
 const lastPhotoEnd=(memoryCards.length-1)*.16+.34;
 const discoverReveal=document.activeElement===memoryDiscover?1:ease((m-lastPhotoEnd-.025)/.15);
 memoryDiscover.hidden=discoverReveal===0;memoryDiscover.style.setProperty('--discover-reveal',String(discoverReveal));
 const fill=ease((f-.08)/.55);const phase=time*.00032;flagIntro.style.opacity=String(1-ease((f-.03)/.32));flagIntro.style.transform=`translate3d(0,${-ease(f/.4)*38}px,0)`;flagCanvas.style.transform=`translate3d(0,${(1-fill)*58}%,0)`;flagCanvas.style.setProperty('--flag-reveal',`${64+fill*61}%`);
 const flagBounds=flagChapter.getBoundingClientRect();const flagVisible=flagBounds.top<innerHeight&&flagBounds.bottom>0;
 drawFlag(12+Math.sin(phase*.6)*2,f,phase);
 clothGradients.forEach((gradient,i)=>gradient.setAttribute('gradientTransform',`translate(${Math.sin(phase+i*.25)*75} 0)`));
 facts.forEach((fact,i)=>{const t=ease((f-.40-i*.075)/.22);const direction=i%2?-1:1;const scrollPan=(f-.7)*direction*30;fact.style.opacity=String(t);fact.style.transform=`translate3d(${(1-t)*direction*35+scrollPan+Math.sin(phase+i)*2}px,${(1-t)*18+Math.sin(phase*.7+i)*1.5}px,0)`;});
 if(moving||(flagVisible&&!document.hidden))requestScenes();
}
function drawFlag(amplitude,progress=flagProgress(),phase=0){
 const wave=(x,y)=>y+amplitude*(.7*Math.sin(x/1200*Math.PI*2+phase+progress*.8)+.3*Math.sin(x/1200*Math.PI*4-phase*.6));
 const slope=x=>amplitude*(.7*Math.PI*2/1200*Math.cos(x/1200*Math.PI*2+phase+progress*.8)+.3*Math.PI*4/1200*Math.cos(x/1200*Math.PI*4-phase*.6));
 function edge(y,reverse=false){const xs=Array.from({length:9},(_,i)=>i*150);if(reverse)xs.reverse();let path='';for(let i=1;i<xs.length;i++){const a=xs[i-1],b=xs[i],d=(b-a)/3;path+=`C${a+d} ${wave(a,y)+slope(a)*d} ${b-d} ${wave(b,y)-slope(b)*d} ${b} ${wave(b,y)}`;}return path;}
 flagPaths.forEach((path,i)=>{const y=60+i*160,b=y+160;path.setAttribute('d',`M0 ${wave(0,y)}${edge(y)}L1200 ${wave(1200,b)}${edge(b,true)}Z`);});
}
function requestScenes(){if(!sceneFrame){sceneFrame=true;requestAnimationFrame(paintScenes)}}
addEventListener('scroll',requestScenes,{passive:true});addEventListener('resize',requestScenes);motion.addEventListener('click',requestScenes);preference.addEventListener('change',requestScenes);paintScenes();

// Fade supporting content into view without delaying keyboard access.
const softItems=[...document.querySelectorAll('.about>.split,.about-topics article,.program>.split,.support-heading,.faq>h2,.contact>.split')];
const softObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{entry.target.classList.toggle('in-view',entry.isIntersecting)}),{threshold:.12,rootMargin:'0px 0px -20px 0px'});
softItems.forEach((item,i)=>{item.classList.add('soft-reveal');item.style.setProperty('--fade-delay',`${i%4*65}ms`);softObserver.observe(item)});
