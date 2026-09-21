const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const canvas=$("#fx"),ctx=canvas.getContext("2d");let W,H,parts=[],audioCtx,master,musicOn=false,timers=[];
function resize(){W=innerWidth;H=innerHeight;canvas.width=W*devicePixelRatio;canvas.height=H*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}addEventListener("resize",resize);resize();
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add("visible")),{threshold:.12});$$(".reveal").forEach(e=>io.observe(e));
addEventListener("mousemove",e=>{const g=$("#cursorGlow");g.style.left=e.clientX+"px";g.style.top=e.clientY+"px"});
function toast(t){let x=$("#toast");x.textContent=t;x.classList.add("show");clearTimeout(window.toastT);window.toastT=setTimeout(()=>x.classList.remove("show"),1800)}
function draw(){ctx.clearRect(0,0,W,H);parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.025;p.life--;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=`hsl(${p.h},75%,68%)`;ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*1.7);ctx.restore()});parts=parts.filter(p=>p.life>0&&p.y<H+30);if(parts.length)requestAnimationFrame(draw)}
function confetti(n=160){for(let i=0;i<n;i++)parts.push({x:Math.random()*W,y:-20-Math.random()*H*.4,vx:(Math.random()-.5)*3,vy:2+Math.random()*5,s:3+Math.random()*5,r:Math.random()*6,h:Math.random()*360,life:150+Math.random()*100});requestAnimationFrame(draw)}
function fireworks(x=W/2,y=H*.3){for(let i=0;i<75;i++){let a=Math.random()*Math.PI*2,s=2+Math.random()*7;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,s:3,r:0,h:Math.random()*360,life:60+Math.random()*30})}requestAnimationFrame(draw)}
function burst(chars,n=35){for(let i=0;i<n;i++){let e=document.createElement("div");e.className="burst";e.textContent=chars[Math.random()*chars.length|0];e.style.left=W/2+"px";e.style.top=H*.55+"px";e.style.setProperty("--x",(Math.random()-.5)*W*.9+"px");e.style.setProperty("--y",-Math.random()*H*.7+"px");document.body.appendChild(e);setTimeout(()=>e.remove(),1400)}}
function balloons(){for(let i=0;i<12;i++){let e=document.createElement("div");e.textContent="🎈";e.style.cssText=`position:fixed;z-index:80;left:${Math.random()*100}vw;bottom:-40px;font-size:${28+Math.random()*24}px;transition:transform 5s linear,opacity 5s`;document.body.appendChild(e);requestAnimationFrame(()=>{e.style.transform=`translateY(-${H+180}px) rotate(${(Math.random()-.5)*35}deg)`;e.style.opacity=0});setTimeout(()=>e.remove(),5200)}}
function act(a){if(a==="hearts"){burst(["♡","♥","❤","❣"]);toast("♡ A little love, sent.");}if(a==="stars"){burst(["✦","✧","⋆"]);toast("✦ The stars came closer.");}if(a==="balloons"){balloons();toast("🎈 Let your wishes rise.");}if(a==="fireworks"){fireworks(W*.25,H*.3);setTimeout(()=>fireworks(W*.75,H*.25),300);setTimeout(()=>fireworks(W*.5,H*.2),600);toast("✺ The sky is yours tonight.");}if(a==="confetti"){confetti();toast("❋ A little extra celebration.");}if(a==="gift")$("#gift").classList.add("open")}
$$(".magic-card").forEach(b=>b.onclick=()=>act(b.dataset.a));
$$(".memory button").forEach(b=>b.onclick=()=>{$("#modalImg").src=b.dataset.photo;$("#modalText").textContent=b.dataset.caption;$("#photoModal").classList.add("open");burst(["✦","✧"],20)});
$("#closePhoto").onclick=()=>$("#photoModal").classList.remove("open");$("#photoModal").onclick=e=>e.target.id==="photoModal"&&$("#photoModal").classList.remove("open");
$("#closeGift").onclick=()=>$("#gift").classList.remove("open");
$("#magicBtn").onclick=()=>{burst(["✦","♡","✧"],45);confetti(80)};
$("#top").onclick=()=>scrollTo({top:0,behavior:"smooth"});$("#replay").onclick=()=>location.reload();
$("#begin").onclick=()=>{scrollTo({top:innerHeight,behavior:"smooth"});confetti(180);fireworks(W*.2,H*.25);fireworks(W*.8,H*.25)};
$("#wish").onclick=()=>{fireworks(W*.5,H*.3);confetti(180);burst(["♡","✦","✧"],50);toast("✨ Wish received. Now let it come true.")};

const N={C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,A5:880};
const song=[["G4",.5],["G4",.5],["A4",1],["G4",1],["C5",1],["B4",2],["G4",.5],["G4",.5],["A4",1],["G4",1],["D5",1],["C5",2],["G4",.5],["G4",.5],["G5",1],["E5",1],["C5",1],["B4",1],["A4",2],["F5",.5],["F5",.5],["E5",1],["C5",1],["D5",1],["C5",2],["C5",.5],["D5",.5],["E5",1],["G5",1],["E5",1],["D5",2],["C5",.5],["B4",.5],["A4",1],["G4",1],["E4",1],["C4",2]];
function note(f,t,d,type="triangle",gain=.16){let o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+d-.04);o.connect(g);g.connect(master);o.start(t);o.stop(t+d)}
function schedule(){let beat=60/88,now=audioCtx.currentTime+.08,t=now;for(let [n,d] of song){note(N[n],t,d*beat*.9);t+=d*beat}let dur=t-now;timers.push(setTimeout(()=>musicOn&&schedule(),dur*1000))}
async function music(){try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();await audioCtx.resume();if(musicOn)return;master=audioCtx.createGain();master.gain.value=.12;master.connect(audioCtx.destination);musicOn=true;schedule();$("#musicBtn").innerHTML="♫ <span>Music ON</span>";return true}catch(e){return false}}
function stop(){musicOn=false;timers.forEach(clearTimeout);timers=[];if(master)master.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.2);$("#musicBtn").innerHTML="♫ <span>Music</span>"}
$("#musicBtn").onclick=()=>musicOn?stop():music();

async function launch(){confetti(60);setTimeout(()=>fireworks(W*.22,H*.24),500);setTimeout(()=>fireworks(W*.78,H*.22),1000);setInterval(()=>{if(!document.hidden){fireworks(W*(.15+.7*Math.random()),H*(.18+.25*Math.random()));}},7000);let ok=await music();if(ok){$("#soundNote").textContent="Music is ready. The celebration is beginning…";setTimeout(()=>$("#opening").classList.add("done"),4200)}else{$("#soundNote").textContent="Tap ENTER once to allow the music on your device."}}
window.addEventListener("load",launch);
$("#enter").onclick=async()=>{await music();$("#opening").classList.add("done");confetti(240);fireworks(W*.3,H*.3);setTimeout(()=>fireworks(W*.7,H*.25),250);scrollTo({top:0})};
["pointerdown","touchstart","keydown"].forEach(e=>addEventListener(e,()=>music(),{once:true,passive:true}));
