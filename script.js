const G=["A+","A-","B+","B-","O+","O-","AB+","AB-"],CAP=40;
const stock={"A+":28,"A-":6,"B+":31,"B-":4,"O+":22,"O-":9,"AB+":15,"AB-":3};
const give={"O-":G,"O+":["O+","A+","B+","AB+"],"A-":["A-","A+","AB-","AB+"],"A+":["A+","AB+"],"B-":["B-","B+","AB-","AB+"],"B+":["B+","AB+"],"AB-":["AB-","AB+"],"AB+":["AB+"]};
const donors=[
 {n:"Rahul Sharma",g:"O+",c:"Ludhiana",d:"12 Aug 2026"},{n:"Simran Kaur",g:"B+",c:"Jalandhar",d:"03 Sep 2026"},
 {n:"Aman Verma",g:"A+",c:"Ludhiana",d:"21 Jun 2026"},{n:"Harpreet Singh",g:"AB-",c:"Amritsar",d:"15 Jul 2026"},
 {n:"Neha Gupta",g:"O-",c:"Chandigarh",d:"30 Oct 2026"},{n:"Kunal Mehta",g:"B-",c:"Patiala",d:"09 May 2026"}];
const reqs=[{id:"REQ-1041",p:"Gurmeet Kaur",g:"B+",u:2},{id:"REQ-1040",p:"R. Malhotra",g:"A+",u:1},{id:"REQ-1039",p:"Anjali Das",g:"O+",u:3}];
let reqCount=128,nextId=1042;
const $=id=>document.getElementById(id);
const lv=u=>u<5?"crit":u<10?"low":"ok";
const lab={crit:"Critical",low:"Low",ok:"Available"},tc={crit:"t-crit",low:"t-low",ok:"t-ok"};
const esc=s=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ini=n=>n.split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
["dg","rg","cg"].forEach(id=>$(id).innerHTML=G.map(g=>`<option>${g}</option>`).join(""));
$("fg").innerHTML='<option value="">All blood groups</option>'+G.map(g=>`<option>${g}</option>`).join("");

function toast(t){const e=$("toast");e.textContent=t;e.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("on"),3200)}
function count(el,to){const s=+el.textContent||0,t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/700);el.textContent=Math.round(s+(to-s)*p);if(p<1)requestAnimationFrame(f)})(t0)}

function renderStock(){
  $("bags").innerHTML=G.map(g=>{const u=stock[g],l=lv(u);
    return `<div class="bag ${l}" id="bag-${g.replace("+","p").replace("-","n")}"><div class="top"><h3>${g}</h3><span class="tag ${tc[l]}">${lab[l]}</span></div>
    <div class="bar"><i style="width:${Math.min(100,u/CAP*100)}%"></i></div><p><span>Units available</span><b>${u} / ${CAP}</b></p></div>`}).join("");
  const total=Object.values(stock).reduce((a,b)=>a+b,0);
  count($("sUnits"),total);count($("fx"),total);
  count($("sLow"),G.filter(g=>lv(stock[g])!=="ok").length);
  count($("sDonors"),donors.length+214);count($("sReq"),reqCount);
}
function renderDonors(){
  const q=$("q").value.trim().toLowerCase(),f=$("fg").value;
  const l=donors.filter(d=>(!f||d.g===f)&&(!q||(d.n+d.c).toLowerCase().includes(q)));
  $("dBody").innerHTML=l.map(d=>`<tr><td><span class="av">${esc(ini(d.n))}</span>${esc(d.n)}</td><td><span class="grp">${d.g}</span></td><td>${esc(d.c)}</td><td>${esc(d.d)}</td><td><span class="tag t-ok">Eligible</span></td></tr>`).join("")
   ||'<tr><td colspan="5">No donors found. Try a different city or blood group.</td></tr>';
}
function renderReqs(){
  $("reqBody").innerHTML=reqs.slice(0,5).map(r=>`<tr><td>${r.id}</td><td>${esc(r.p)}</td><td><span class="grp">${r.g}</span></td><td>${r.u}</td><td><span class="tag t-ok">Fulfilled</span></td></tr>`).join("");
}
function pick(g){
  document.querySelectorAll(".chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.g===g));
  $("giveTo").innerHTML=give[g].map(x=>`<span>${x}</span>`).join("");
  $("getFrom").innerHTML=G.filter(x=>give[x].includes(g)).map(x=>`<span class="b">${x}</span>`).join("");
}
$("chips").innerHTML=G.map(g=>`<button class="chip" data-g="${g}" aria-pressed="false">${g}</button>`).join("");
$("chips").addEventListener("click",e=>{const b=e.target.closest(".chip");if(b)pick(b.dataset.g)});
pick("O-");

$("cbtn").addEventListener("click",()=>{
  const g=$("cg").value,u=stock[g];
  toast(`${g}: ${u} unit(s) in stock (${lab[lv(u)]})`);
  const el=$("bag-"+g.replace("+","p").replace("-","n"));
  document.getElementById("inventory").scrollIntoView();
  document.querySelectorAll(".bag").forEach(b=>b.classList.remove("hl"));el.classList.add("hl");
  setTimeout(()=>el.classList.remove("hl"),2500);
});
const msg=(id,t,x)=>{$(id).className="msg "+t;$(id).textContent=x};
$("donorForm").addEventListener("submit",e=>{
  e.preventDefault();
  const n=$("dn").value.trim(),a=+$("da").value,c=$("dc").value.trim(),p=$("dp").value.trim(),g=$("dg").value;
  if(!n||!c)return msg("dMsg","err","Enter your name and city.");
  if(a<18||a>65)return msg("dMsg","err","Donors must be between 18 and 65 years old.");
  if(!/^[6-9]\d{9}$/.test(p))return msg("dMsg","err","Enter a valid 10-digit mobile number.");
  donors.unshift({n,g,c,d:"Not yet"});renderStock();renderDonors();
  msg("dMsg","ok",`Thank you, ${n}. You are registered as a ${g} donor.`);toast("Donor registered successfully");e.target.reset();
});
$("reqForm").addEventListener("submit",e=>{
  e.preventDefault();
  const p=$("rp").value.trim(),h=$("rh").value.trim(),g=$("rg").value,u=+$("ru").value;
  if(!p||!h)return msg("rMsg","err","Enter the patient name and hospital.");
  if(!(u>=1&&u<=10))return msg("rMsg","err","Units must be between 1 and 10.");
  if(stock[g]<u)return msg("rMsg","err",`Only ${stock[g]} unit(s) of ${g} in stock. Reduce the units or call the helpline.`);
  stock[g]-=u;reqCount++;const id="REQ-"+nextId++;
  reqs.unshift({id,p,g,u});renderStock();renderReqs();
  msg("rMsg","ok",`Request ${id} approved: ${u} unit(s) of ${g} reserved for ${p} at ${h}.`);toast(`${id} approved`);
  e.target.reset();$("ru").value=1;
});
$("q").addEventListener("input",renderDonors);$("fg").addEventListener("change",renderDonors);
renderStock();renderDonors();renderReqs();

/* ===== animations ===== */
(function(){
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  // floating blood cells in hero
  if(!reduce){const h=document.querySelector(".hero");
    for(let i=0;i<14;i++){const c=document.createElement("i");c.className="cell";
      c.style.cssText=`--x:${Math.random()*100}%;--s:${6+Math.random()*12}px;--d:${9+Math.random()*9}s;--del:${-Math.random()*14}s;--dx:${(Math.random()-.5)*120}px`;
      h.appendChild(c);}}
  // scroll progress + sticky header state
  const bar=document.createElement("div");bar.id="prog";document.body.prepend(bar);
  const hd=document.querySelector("header");
  const onScroll=()=>{const m=document.documentElement.scrollHeight-innerHeight;
    bar.style.width=(m>0?scrollY/m*100:0)+"%";hd.classList.toggle("sc",scrollY>20)};
  addEventListener("scroll",onScroll,{passive:true});onScroll();
  // reveal on scroll
  const sel=".head,.stat,.bag,.comp,.card,.band,.tw,.camp,.step,details,.tools";
  const els=[...document.querySelectorAll(sel)].filter(e=>!e.closest(".hero"));
  els.forEach(e=>{e.classList.add("rv");
    const sibs=[...e.parentElement.children].filter(x=>x.classList.contains("rv")||x===e);
    e.style.setProperty("--rd",(Math.min(sibs.indexOf(e),7)*.08)+"s")});
  if("IntersectionObserver" in window&&!reduce){
    const io=new IntersectionObserver((en)=>en.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}}),{threshold:.12,rootMargin:"0px 0px -40px 0px"});
    els.forEach(e=>io.observe(e));
  }else els.forEach(e=>e.classList.add("in"));
  // button ripple
  document.addEventListener("click",e=>{const b=e.target.closest(".btn");if(!b)return;
    const r=b.getBoundingClientRect(),s=document.createElement("span");s.className="rp";
    s.style.left=(e.clientX-r.left)+"px";s.style.top=(e.clientY-r.top)+"px";b.appendChild(s);
    setTimeout(()=>s.remove(),650)});
})();
