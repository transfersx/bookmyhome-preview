/* homepage logic */
(function(){
const {P,card,$,$$,toast}=window.BMH;

/* featured grid */
const feat=P.filter(p=>p.featured).slice(0,6);
const grid=document.getElementById('featuredGrid');
if(grid)grid.innerHTML=(feat.length?feat:P.slice(0,6)).map(card).join('');
/* commercial cards for the BMH Invest band */
const invest=P.filter(p=>p.category==='Commercial');
const ig=document.getElementById('investGrid');
if(ig)ig.innerHTML=invest.slice(0,6).map(card).join('');
window.BMH.renderFavStatesNow&&window.BMH.renderFavStatesNow();
document.querySelectorAll('[data-fav]').forEach(b=>b.classList.toggle('on',window.BMH.shortlist().includes(b.dataset.fav)));
const c=window.BMH.compare();document.querySelectorAll('[data-cmp]').forEach(b=>b.checked=c.includes(b.dataset.cmp));
const st=document.getElementById('stProj');if(st)st.textContent=P.length;

/* localities strip — built from project images + sectors */
const locs=[
  {name:'Sector 66A, Mohali',sub:'Aerocity · JLPL township',img:'falcon-view',href:'listings.html?q=Sector 66'},
  {name:'IT City, Sector 82',sub:'Airport Road growth corridor',img:'the-medallion',href:'listings.html?q=IT City'},
  {name:'Mullanpur',sub:'New Chandigarh · Omaxe, DLF, Marbella',href:'listings.html?city=New Chandigarh'},
  {name:'Sector 88, Mohali',sub:'Green, Shivalik-facing',img:'hero-homes-mohali',href:'listings.html?q=Sector 88'},
  {name:'VIP & Patiala Road',sub:'Zirakpur · Sushma, Motiaz, GBP',href:'listings.html?city=Zirakpur'},
  {name:'Sector 88–89',sub:'New-age high-rise belt',img:'horizon-belmond',href:'listings.html?q=Sector 88'},
];
const ls=document.getElementById('locStrip');
if(ls)ls.innerHTML=locs.map(l=>{
  const pr=l.img&&P.find(p=>p.slug===l.img);
  const img=pr?(pr.card||pr.hero):'';
  const media=img?`<img loading="lazy" src="${img}" alt="${l.name}">`:`<div style="position:absolute;inset:0;background:linear-gradient(150deg,#241b18,#4a3a32)"></div>`;
  return `<a class="loc-card" href="${l.href}">
    ${media}
    <div class="lc-body"><h3>${l.name}</h3><span>${l.sub}</span></div></a>`;
}).join('');

/* ---------- Find My Home matcher ---------- */
const QS=[
  {key:'who',title:'Who is this home for?',opts:[
    {l:'Young family',v:'family',tag:{bhk:[2,3],amen:['play','park','school']}},
    {l:'Growing family',v:'growing',tag:{bhk:[3,4],amen:['play','club']}},
    {l:'Luxury seeker',v:'luxury',tag:{bhk:[4,5],amen:['club','pool','golf','spa']}},
    {l:'Investor',v:'invest',tag:{bhk:[2,3]}},
  ]},
  {key:'home',title:'What size feels right?',opts:[
    {l:'2 BHK',v:'2',tag:{bhk:[2]}},
    {l:'3 BHK',v:'3',tag:{bhk:[3]}},
    {l:'4 BHK',v:'4',tag:{bhk:[4]}},
    {l:'5 BHK / Penthouse',v:'5',tag:{bhk:[5]}},
  ]},
  {key:'when',title:'When do you want to move in?',opts:[
    {l:'Ready now',v:'ready',tag:{status:'ready'}},
    {l:'1–2 years',v:'soon',tag:{status:'under'}},
    {l:'Best deal',v:'deal',tag:{}},
    {l:'Flexible',v:'flex',tag:{}},
  ]},
];
let qi=0, picks={};
const qTitle=document.getElementById('qTitle'),qOpts=document.getElementById('qOpts'),
      qBar=document.getElementById('qBar'),qBack=document.getElementById('qBack'),
      result=document.getElementById('matchResult'),matchQ=document.getElementById('matchQ');
function renderQ(){
  if(!qOpts)return;
  const q=QS[qi];
  qTitle.textContent=q.title;
  qBar.style.width=((qi+1)/QS.length*100)+'%';
  qBack.style.display=qi>0?'inline-flex':'none';
  qOpts.innerHTML=q.opts.map(o=>`<button class="opt ${picks[q.key]&&picks[q.key].v===o.v?'sel':''}" data-v="${o.v}">${o.l}</button>`).join('');
  qOpts.querySelectorAll('.opt').forEach((b,idx)=>b.addEventListener('click',()=>{
    picks[q.key]=q.opts[idx];
    if(qi<QS.length-1){qi++;renderQ();}else{showMatches();}
  }));
}
qBack&&qBack.addEventListener('click',()=>{if(qi>0){qi--;renderQ();}});
function showMatches(){
  const tags=Object.values(picks).map(p=>p.tag);
  const wantBhk=new Set();let wantStatus=null;const wantAmen=new Set();
  tags.forEach(t=>{(t.bhk||[]).forEach(b=>wantBhk.add(b));if(t.status)wantStatus=t.status;(t.amen||[]).forEach(a=>wantAmen.add(a))});
  const scored=P.map(p=>{
    let s=0;
    p.bhk.forEach(b=>{if(wantBhk.has(b))s+=3});
    if(wantStatus==='ready'&&/ready/i.test(p.status))s+=4;
    if(wantStatus==='under'&&/under/i.test(p.status))s+=2;
    const am=(p.amenities||[]).join(' ').toLowerCase();
    wantAmen.forEach(a=>{if(am.includes(a))s+=1});
    if(p.featured)s+=0.5;
    return {p,s};
  }).sort((a,b)=>b.s-a.s).filter(x=>x.s>0).slice(0,3);
  const top=(scored.length?scored:P.map(p=>({p}))).slice(0,3).map(x=>x.p);
  matchQ.classList.add('hide');
  result.classList.remove('hide');
  result.innerHTML=`<div style="margin-top:8px">
    <p style="color:rgba(255,255,255,.8);margin-bottom:6px">Based on your answers, these feel like home:</p>
    <div class="grid cards" style="margin-top:18px">${top.map(window.BMH.card).join('')}</div>
    <div style="display:flex;gap:10px;margin-top:22px;flex-wrap:wrap">
      <button class="btn btn-accent" id="qRestart">Start over</button>
      <a class="btn btn-ghost" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.3)" href="listings.html">See all homes</a>
    </div></div>`;
  document.querySelectorAll('#matchResult [data-fav]').forEach(b=>b.classList.toggle('on',window.BMH.shortlist().includes(b.dataset.fav)));
  const cc=window.BMH.compare();document.querySelectorAll('#matchResult [data-cmp]').forEach(b=>b.checked=cc.includes(b.dataset.cmp));
  document.getElementById('qRestart').addEventListener('click',()=>{
    qi=0;picks={};result.classList.add('hide');matchQ.classList.remove('hide');renderQ();
  });
}
renderQ();

/* lead form */
const lf=document.getElementById('leadForm');
if(lf)lf.addEventListener('submit',e=>{
  e.preventDefault();
  const leads=JSON.parse(localStorage.getItem('bmh_leads')||'[]');
  leads.push({...Object.fromEntries(new FormData(lf)),at:Date.now()});
  localStorage.setItem('bmh_leads',JSON.stringify(leads));
  lf.reset();toast('Thank you — an advisor will call you shortly.');
});
})();
