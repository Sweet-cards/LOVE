const $=s=>document.querySelector(s);
const penguinSay=document.getElementById('penguin-say');
let penguinSwapTimer;
function penguinTalk(text){
  clearTimeout(penguinSwapTimer);
  penguinSay.classList.remove('swap');
  penguinSay.textContent=text;
  penguinSay.setAttribute('aria-atomic','true');
}
const lightsButton=$('#lights'),partyButton=$('#party'),card=$('#card'),intro=$('#intro'),envelope=$('#envelope'),invitation=$('#invitation'),yesButton=$('#yes'),noButton=$('#no'),hint=$('#hint'),room=$('.room'),dedications=$('#dedications'),flowers=$('#flowers'),musicBtn=$('#music');

let sayTimer;
const introTimers=[];
let invitationTimer;
function say(text){
  clearTimeout(sayTimer);
  intro.classList.remove('show');
  sayTimer=setTimeout(()=>{intro.textContent=text;intro.classList.add('show')},80);
}
introTimers.push(setTimeout(()=>say('\u00a1Hey!'),3000));
introTimers.push(setTimeout(()=>say('Est\u00e1 oscuro aqu\u00ed...'),7000));
introTimers.push(setTimeout(()=>{say('\u00bfPuedes prender la luz?');lightsButton.hidden=false;hint.hidden=false},9000));

/* Música de fondo cargada desde assets */
const backgroundMusic=$('#background-music');
let playing=false;
backgroundMusic.volume=.55;
function toggleMusic(on){
  if(on){
    backgroundMusic.play().then(()=>{
      playing=true;
      musicBtn.classList.remove('muted');
      musicBtn.setAttribute('aria-label','Silenciar música');
    }).catch(()=>{
      playing=false;
      musicBtn.classList.add('muted');
      musicBtn.setAttribute('aria-label','Activar música');
    });
    return;
  }
  backgroundMusic.pause();
  playing=false;
  musicBtn.classList.add('muted');
  musicBtn.setAttribute('aria-label','Activar música');
}
musicBtn.addEventListener('click',()=>toggleMusic(!playing));
musicBtn.classList.add('muted');

lightsButton.addEventListener('click',()=>{
  introTimers.forEach(clearTimeout);
  clearTimeout(sayTimer);
  clearTimeout(invitationTimer);
  document.body.classList.add('lights-on');
  penguinTalk('Hola Hardy, soy Doffi');
  clearTimeout(sayTimer);intro.classList.remove('show');intro.textContent='';
  hint.hidden=true;lightsButton.hidden=true;
  if(!playing)toggleMusic(true);
  invitationTimer=setTimeout(()=>{
    invitation.hidden=true;
    penguinTalk('Tengo una carta de Susan para ti, jeje. ¿Quieres leerla?');
    invitation.hidden=false;
  },4000);
});

function moveNoButton(){
  const m=12,mx=Math.max(m,innerWidth-noButton.offsetWidth-m),my=Math.max(m,innerHeight-noButton.offsetHeight-m);
  if(noButton.parentElement!==document.body)document.body.append(noButton);
  noButton.style.position='fixed';
  noButton.style.left=`${m+Math.random()*(mx-m)}px`;
  noButton.style.top=`${m+Math.random()*(my-m)}px`;
  noButton.style.zIndex='5';
}
noButton.addEventListener('pointerenter',moveNoButton);
noButton.addEventListener('pointerdown',e=>{e.preventDefault();moveNoButton()});
noButton.addEventListener('click',moveNoButton);
addEventListener('resize',()=>{if(noButton.style.position==='fixed')moveNoButton()});

yesButton.addEventListener('click',()=>{
  clearTimeout(invitationTimer);
  clearTimeout(sayTimer);
  invitation.hidden=true;noButton.hidden=true;document.body.classList.add('sunset');envelope.hidden=false;
  room.insertBefore(penguinSay,envelope.nextSibling);
  penguinSay.classList.add('envelope-prompt');
  penguinTalk('\u00c1brela, jeje');
  hint.textContent='Toca la carta para abrirla.';hint.hidden=false;
});

function confetti(){
  const colors=['#ff4d6d','#d90429','#ff758f','#ffd36b','#ffb3c1','#fff'];
  for(let i=0;i<56;i++){
    const s=document.createElement('span');s.className='confetti';
    const w=6+Math.random()*8,c=colors[i%colors.length];
    const base=`left:${Math.random()*100}vw;animation-duration:${3+Math.random()*3}s;animation-delay:${Math.random()*1.2}s;`;
    if(i%2){s.textContent=i%4===1?'\u2764':'\u2665';s.style.cssText=base+`font-size:${14+Math.random()*16}px;color:${c};text-shadow:0 0 6px #fff8`}
    else s.style.cssText=base+`width:${w}px;height:${w*1.6}px;background:${c};border-radius:2px`;
    document.body.append(s);setTimeout(()=>s.remove(),8000);
  }
}
envelope.addEventListener('click',()=>{
  document.body.classList.add('show-letter');
  penguinSay.hidden=true;
  clearTimeout(sayTimer);intro.textContent='';intro.classList.remove('show');
  card.classList.add('show');hint.hidden=true;partyButton.hidden=false;confetti();
});

/* Dedicatorias: carrusel + maquina de escribir */
const track=$('#carousel'),cards=[...track.children],dots=$('#dots');
const notes=cards.map(c=>{const p=c.querySelector('p'),text=p.textContent;
  p.innerHTML='<span class="t"></span>';return{p,text,done:false}});
cards.forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.className='dot';b.setAttribute('aria-label','Tarjeta '+(i+1));
  b.onclick=()=>go(i);dots.append(b)});
let cur=0;
function typewrite(n,speed=38){
  if(n.done)return;n.done=true;const ch=[...n.text],t=n.p.firstChild,box=n.p.closest('.dedication-note');let i=0;
  (function step(){if(i<ch.length){i++;t.textContent=ch.slice(0,i).join('');if(box.scrollHeight>box.clientHeight)box.scrollTop=box.scrollHeight;setTimeout(step,speed)}})();
}
function show(i){
  cur=i;[...dots.children].forEach((d,k)=>d.classList.toggle('on',k===i));
  $('#prev').disabled=i===0;$('#next').disabled=i===cards.length-1;
  cards.forEach((c,k)=>c.classList.toggle('active',k===i));
  setTimeout(()=>typewrite(notes[i]),350);
}
function go(i){i=Math.max(0,Math.min(cards.length-1,i));cards[i].scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});show(i)}
let st;track.addEventListener('scroll',()=>{clearTimeout(st);st=setTimeout(()=>{
  const mid=track.scrollLeft+track.clientWidth/2;let best=0,bd=1e9;
  cards.forEach((c,k)=>{const d=Math.abs(c.offsetLeft+c.offsetWidth/2-mid);if(d<bd){bd=d;best=k}});
  if(best!==cur)show(best)},80)});
$('#prev').onclick=()=>go(cur-1);$('#next').onclick=()=>go(cur+1);
partyButton.addEventListener('click',()=>{
  document.body.classList.remove('lights-on','sunset','show-letter');
  document.body.classList.add('dedication-mode');
  room.hidden=true;dedications.hidden=false;
  track.scrollLeft=0;show(0);
  scrollTo({top:0,behavior:'smooth'});
});

$('#flowers-button').addEventListener('click',()=>{
  document.body.classList.remove('lights-on','sunset','show-letter','dedication-mode');
  document.body.classList.add('flower-mode');
  room.hidden=true;dedications.hidden=true;flowers.hidden=false;
  scrollTo({top:0,behavior:'smooth'});
  setTimeout(()=>flowers.classList.add('open'),80);
});


/* Ramo de flores rojas (SVG generado) */
(function(){
  const f=n=>+n.toFixed(1);
  let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
  const PET='M0 0C-30-16-46-62-20-104C-10-118 4-124 14-124C24-102 52-62 34-22C26-6 8-2 0 0Z';
  const SPOT=[[-8,-28],[8,-34],[-14,-48],[3,-52],[-6,-68],[12,-70],[-18,-80]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.7" fill="#6d0a1c" opacity=".6"/>`).join('');
  function lily(cx,cy,rot,sc,d,more){
    let p='',s='';
    (more?[-140,-89,-37,14,66,117,169]:[-140,-90,-40,15,70,125]).forEach((a,i)=>p+=`<g transform="rotate(${a}) scale(1 ${[1,.92,1.05,1,.95,1.02,.98][i]})"><g class="petal" style="--d:${f(d+i*.12)}s"><path d="${PET}" fill="url(#lp)" stroke="#ff9aab" stroke-width="1.6"/><path d="M0-8C0-50 4-90 12-116" fill="none" stroke="#ffc2cd" stroke-opacity=".7" stroke-width="2"/>${SPOT}</g></g>`);
    [-28,-14,0,14,28].forEach((a,i)=>{const r=a*Math.PI/180,L=46+(i%3)*8,x=Math.sin(r)*L,y=-Math.cos(r)*L;
      s+=`<path d="M0 0L${f(x)} ${f(y)}" stroke="#ffe3e8" stroke-width="1.8"/><ellipse cx="${f(x)}" cy="${f(y)}" rx="3" ry="7" transform="rotate(${a} ${f(x)} ${f(y)})" fill="#e0a800"/>`});
    return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${sc})"><g transform="scale(1 .8)">${p}<circle r="15" fill="url(#thr)"/><g class="stamen" style="--d:${f(d+1)}s">${s}</g></g></g>`;
  }
  const bud=(x,y,r,sc,d)=>`<g transform="translate(${x} ${y}) rotate(${r}) scale(${sc})"><g class="bd" style="--d:${d}s"><path d="M0 0C-20-10-26-60-6-100C-2-110 2-116 4-126C8-114 12-108 14-98C30-60 22-10 0 0Z" fill="url(#bg)" stroke="#ff9aab" stroke-width="1.4"/><path d="M4-124C6-80 4-40 2-6" fill="none" stroke="#ffc2cd" stroke-opacity=".7" stroke-width="2"/></g></g>`;
  const leaf=(x,y,a,L,d)=>{const w=f(L*.22);return `<g transform="translate(${x} ${y}) rotate(${a})"><g class="lf" style="--d:${d}s"><path d="M0 0C-${w}-${f(L*.3)}-${f(w*.8)}-${f(L*.7)} 0-${L}C${f(w*.8)}-${f(L*.7)} ${w}-${f(L*.3)} 0 0Z" fill="url(#gl)"/><path d="M0-6L0-${L-12}" stroke="#7fb06a" stroke-opacity=".55" stroke-width="1.4"/></g></g>`};
  function gyp(cx,cy,rx,ry,n,d0){
    let o='';
    for(let i=0;i<n;i++){
      const x=cx+(rnd()*2-1)*rx,y=cy+(rnd()*2-1)*ry,k=f(.8+rnd()*.6),dx=410-x,dy=480-y,m=Math.hypot(dx,dy)||1;
      o+=`<path d="M${f(x)} ${f(y)}L${f(x+dx/m*34)} ${f(y+dy/m*34)}" stroke="#5c8a4d" stroke-width="1.3"/><g transform="translate(${f(x)} ${f(y)}) scale(${k})"><g class="gy" style="--d:${f(d0+i*.06)}s"><use href="#gf"/></g></g>`;
    }
    return o;
  }
  
  let svg='<svg viewBox="0 0 736 760" role="img" aria-label="Ramo de flores rojas"><defs>'
   +'<linearGradient id="lp" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e5384f"/><stop offset=".45" stop-color="#c1122f"/><stop offset="1" stop-color="#ff7a8f"/></linearGradient>'
   +'<linearGradient id="bg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#a50d28"/><stop offset="1" stop-color="#ff7a8f"/></linearGradient>'
   +'<radialGradient id="thr"><stop offset="0" stop-color="#fff0c9"/><stop offset="1" stop-color="#fff0c9" stop-opacity="0"/></radialGradient>'
   +'<linearGradient id="gl" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#2b5a2d"/><stop offset="1" stop-color="#4f8540"/></linearGradient>'
   +'<linearGradient id="po" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a0153a"/><stop offset="1" stop-color="#5c0a1e"/></linearGradient>'
   +'<linearGradient id="pi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe0e5"/><stop offset="1" stop-color="#f7a8b8"/></linearGradient>'
   +'<g id="gf"><g fill="#fff" stroke="#d5deef" stroke-width=".6"><circle cx="0" cy="-4" r="3.2"/><circle cx="3.8" cy="-1.2" r="3.2"/><circle cx="2.4" cy="3.2" r="3.2"/><circle cx="-2.4" cy="3.2" r="3.2"/><circle cx="-3.8" cy="-1.2" r="3.2"/></g><circle r="1.8" fill="#e9d98a"/></g>'
   +'<filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="3" seed="6"/><feDisplacementMap in="SourceGraphic" scale="16" result="d"/><feDropShadow in="d" dx="0" dy="6" stdDeviation="6" flood-color="#1b2f60" flood-opacity=".3"/></filter></defs><g class="sway">';
  svg+='<g filter="url(#rough)"><path class="paper" style="--d:.1s" d="M32 165L62 128L120 118L190 105L245 78L300 52L420 28L548 12L588 60L604 140L645 200L706 228L690 300L650 390L590 470L520 520L470 530L330 515L240 470L130 400L70 310L40 240Z" fill="url(#po)"/><path class="paper" style="--d:.25s" d="M122 190L200 100L330 110L520 120L620 175L628 300L560 400L470 480L400 505L290 440L180 360L128 270Z" fill="url(#pi)" stroke="#fff0f2" stroke-width="6" stroke-linejoin="round" opacity=".92"/></g>';
  [[365,185,-50,95,.5],[515,215,55,75,.6],[370,430,-80,105,.7],[450,390,78,120,.8],[440,340,40,80,.9]].forEach(a=>svg+=leaf(...a));
  [['M415 490Q380 420 300 312',.7],['M420 490Q430 380 455 238',.8],['M410 490Q385 300 365 165',.9],['M412 490Q405 450 395 395',.85]].forEach(([d,t])=>svg+=`<path class="stem" pathLength="1" style="--d:${t}s" d="${d}"/>`);
  svg+=gyp(235,200,75,65,14,1.3)+gyp(575,265,32,42,8,1.5)+gyp(435,108,32,22,7,1.6);
  svg+=bud(365,165,-3,1,1.2)+bud(264,249,-55,.85,1.3)+bud(470,224,30,.85,1.4)+bud(447,403,40,.75,1.5);
  svg+=lily(455,238,15,.95,1.8)+lily(300,312,-15,1,2.3)+lily(395,395,-150,.85,2.6,1);
  
  svg+='<g filter="url(#rough)"><path class="paper" style="--d:.3s" d="M335 505L470 520L520 540L545 600L560 640L535 690L540 735L430 742L380 722L330 735L318 650L345 600L330 540Z" fill="url(#po)"/><path class="paper" style="--d:.4s" d="M350 600L380 580L400 640L372 700L340 690Z M470 590L520 620L500 690L520 730L470 720Z" fill="#d3405d" opacity=".55"/></g>';
  svg+='<g fill="none" stroke="#ffd36b" stroke-width="7" stroke-linecap="round"><g class="bow" style="--d:3.6s"><path d="M440 525C380 515 300 540 282 575C300 595 400 560 440 535M440 525C490 505 540 530 520 575C480 585 455 560 440 535"/><path d="M435 535C415 600 420 660 418 720M445 535C430 590 395 640 372 690"/><circle cx="440" cy="530" r="7" fill="#ffd36b" stroke="none"/></g></g>';
  svg+='</g></svg>';
  $('#garden').innerHTML=svg;
  let sp;
  $('#flowers-button').addEventListener('click',()=>{
    clearInterval(sp);
    sp=setInterval(()=>{
      const s=document.createElement('i');s.className='sp';s.textContent=Math.random()>.5?'\u2764':'\u2665';
      s.style.cssText=`left:${8+Math.random()*84}vw;top:${40+Math.random()*55}vh;--z:${2+Math.random()*4}px;--t:${4+Math.random()*4}s;--dx:${(Math.random()-.5)*60}px`;
      document.body.append(s);setTimeout(()=>s.remove(),8500);
    },320);
  });
})();

/* Corazones flotando de fondo */
(function(){
  const box=document.getElementById('hearts-bg');if(!box)return;
  const n=innerWidth<600?14:24,cols=['#ff4d6d','#d90429','#ff758f','#ff2e63','#ffb3c1'];
  for(let i=0;i<n;i++){
    const h=document.createElement('i');h.textContent=i%3?'\u2764':'\u2665';
    h.style.cssText=`left:${Math.random()*100}%;--s:${12+Math.random()*28}px;--t:${10+Math.random()*10}s;--d:${-Math.random()*16}s;--x:${(Math.random()-.5)*80}px;--o:${.25+Math.random()*.45};--c:${cols[i%cols.length]}`;
    box.append(h);
  }
})();
