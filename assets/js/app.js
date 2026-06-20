/* ============================================================
   Book My Home — shared app logic
   ============================================================ */
(function(){
"use strict";
const P = window.PROJECTS || [];
window.BMH = {};

/* ---------- helpers ---------- */
const $  = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
const byId = id => P.find(p=>String(p.id)===String(id) || p.slug===id);
window.BMH.$=$; window.BMH.$$=$$; window.BMH.byId=byId; window.BMH.P=P;

function toast(msg){
  let t=$('#toast');
  if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t);}
  t.textContent=msg;t.classList.add('show');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200);
}
window.BMH.toast=toast;

/* ---------- localStorage state ---------- */
const LS={
  get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},
  set(k,v){localStorage.setItem(k,JSON.stringify(v))}
};
function shortlist(){return LS.get('bmh_shortlist',[])}
function compare(){return LS.get('bmh_compare',[])}
function toggleShortlist(id){
  let s=shortlist();id=String(id);
  if(s.includes(id)){s=s.filter(x=>x!==id);toast('Removed from shortlist')}
  else{s.push(id);toast('Saved to shortlist')}
  LS.set('bmh_shortlist',s);syncBadges();renderFavStates();
  return s.includes(id);
}
function toggleCompare(id){
  let c=compare();id=String(id);
  if(c.includes(id)){c=c.filter(x=>x!==id)}
  else{ if(c.length>=3){toast('Compare up to 3 projects');return false} c.push(id) }
  LS.set('bmh_compare',c);renderCompareBar();return c.includes(id);
}
window.BMH.shortlist=shortlist;window.BMH.compare=compare;
window.BMH.toggleShortlist=toggleShortlist;window.BMH.toggleCompare=toggleCompare;

function syncBadges(){
  const n=shortlist().length;
  $$('[data-shortlist-count]').forEach(b=>{b.textContent=n;b.style.display=n?'grid':'none'});
}
function renderFavStates(){
  const s=shortlist();
  $$('[data-fav]').forEach(b=>b.classList.toggle('on',s.includes(b.dataset.fav)));
}

/* ---------- SVG icons ---------- */
const I={
  pin:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  heart:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>',
  bed:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16M2 8h18a2 2 0 012 2v10M2 17h20M6 8V6a2 2 0 012-2h7"/></svg>',
  ruler:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l4-4 14 14-4 4zM8 9l2 2M12 5l2 2M15 12l2 2M5 12l2 2"/></svg>',
  search:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>',
  building:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></svg>',
  store:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l1.5-5h15L21 9M4 9v10a1 1 0 001 1h14a1 1 0 001-1V9M3 9h18M9 20v-6h6v6"/></svg>'
};
window.BMH.I=I;

/* ---------- project card ---------- */
function shortPrice(price){
  if(!price||/request/i.test(price))return 'Price on Request';
  const m=price.match(/(?:₹|Rs\.?)\s*([\d.,]+)\s*(Cr|Crore|Lakh|Lac|L|K)?/i);
  if(m){const unit=(m[2]||'').replace(/crore/i,'Cr').replace(/lac|lakh/i,'L');return 'From ₹'+m[1].replace(/\.$/,'')+(unit?' '+unit:'');}
  return price.length>22?price.slice(0,20)+'…':price;
}
window.BMH.shortPrice=shortPrice;
function pill(p){
  const ps=[];
  if(p.category==='Commercial') ps.push('<span class="pill" style="background:var(--ink);color:#fff">'+(p.commercialType||'Commercial')+'</span>');
  if(p.status&&/ready/i.test(p.status)) ps.push('<span class="pill ready">Ready to Move</span>');
  else if(p.status&&/new/i.test(p.status)) ps.push('<span class="pill brand">New Launch</span>');
  else if(p.featured) ps.push('<span class="pill brand">Featured</span>');
  if(p.category!=='Commercial') ps.push(`<span class="pill">${p.type.split(' ')[0]}</span>`);
  if(p.rera&&p.rera.length) ps.push('<span class="pill" style="background:#e7f3ec;color:#1f8a54">RERA ✓</span>');
  return ps.join('');
}
function phInner(p){
  const com=p.category==='Commercial';
  return `<div class="ph-ic">${com?I.store:I.building}</div>
    <span class="ph-name">${com?(p.commercialType||'Commercial'):p.city}</span>
    <small>Photos on request</small>`;
}
function card(p){
  const inShort=shortlist().includes(String(p.id));
  const inCmp=compare().includes(String(p.id));
  const hasImg=!!(p.card||p.hero);
  const com=p.category==='Commercial';
  const size = p.sizeMin? `${p.sizeMin.toLocaleString('en-IN')}–${p.sizeMax.toLocaleString('en-IN')} sq.ft.` : (com?(p.city):'Sizes on request');
  const media = hasImg
    ? `<img loading="lazy" src="${p.card||p.hero}" alt="${p.name}"><div class="pills">${pill(p)}</div>`
    : `${phInner(p)}<div class="pills">${pill(p)}</div>`;
  return `<article class="card reveal">
    <a class="card-media${hasImg?'':' is-ph '+(com?'ph-com':'ph-res')}" href="project.html?p=${p.slug}">
      ${media}
    </a>
    <button class="card-fav ${inShort?'on':''}" data-fav="${p.id}" aria-label="Shortlist">${I.heart}</button>
    <div class="card-body">
      <a href="project.html?p=${p.slug}"><h3>${p.name}</h3></a>
      <div class="card-loc">${I.pin}<span>${p.location.split(',').slice(0,2).join(', ')||p.city}</span></div>
      <div class="card-cfg">
        <span>${p.configShort}</span><span class="dot"></span><span>${size}</span>
      </div>
      <div class="card-foot">
        <div class="card-price"><b>${shortPrice(p.price)}</b><span class="card-dev">by ${p.developer.split('(')[0].trim()}</span></div>
        <label class="card-cmp"><input type="checkbox" data-cmp="${p.id}" ${inCmp?'checked':''}>Compare</label>
      </div>
    </div>
  </article>`;
}
window.BMH.card=card;

/* ---------- compare bar ---------- */
function renderCompareBar(){
  let bar=$('#compareBar');
  const c=compare();
  if(!bar){
    bar=document.createElement('div');bar.id='compareBar';bar.className='compare-bar';
    bar.innerHTML=`<div class="inner"><div class="items"></div>
      <a href="compare.html" class="btn btn-accent btn-sm">Compare now <span data-cmp-n></span></a>
      <button class="btn btn-ghost btn-sm" id="cmpClear" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.3)">Clear</button></div>`;
    document.body.appendChild(bar);
    bar.addEventListener('click',e=>{
      if(e.target.id==='cmpClear'){LS.set('bmh_compare',[]);renderCompareBar();syncCmpChecks();}
      const rm=e.target.closest('[data-cmp-rm]');
      if(rm){toggleCompare(rm.dataset.cmpRm);syncCmpChecks();}
    });
  }
  const items=$('.items',bar);
  items.innerHTML=c.map(id=>{const p=byId(id);return p?`<div class="cmp-thumb"><img src="${p.card||p.hero}" alt=""><span>${p.name}</span><button data-cmp-rm="${p.id}">&times;</button></div>`:''}).join('');
  $('[data-cmp-n]',bar).textContent=c.length?`(${c.length})`:'';
  bar.classList.toggle('show',c.length>0);
}
function syncCmpChecks(){const c=compare();$$('[data-cmp]').forEach(b=>b.checked=c.includes(b.dataset.cmp))}
window.BMH.renderCompareBar=renderCompareBar;

/* ---------- global click delegation ---------- */
document.addEventListener('click',e=>{
  const fav=e.target.closest('[data-fav]');
  if(fav){e.preventDefault();toggleShortlist(fav.dataset.fav);}
});
document.addEventListener('change',e=>{
  const cmp=e.target.closest('[data-cmp]');
  if(cmp){toggleCompare(cmp.dataset.cmp);syncCmpChecks();}
});

/* ---------- mobile drawer + header ---------- */
function initChrome(){
  const burger=$('#burger'),drawer=$('#drawer');
  if(burger&&drawer){
    burger.addEventListener('click',()=>drawer.classList.add('open'));
    drawer.addEventListener('click',e=>{if(e.target.matches('.drawer-bg,[data-close]'))drawer.classList.remove('open')});
  }
  syncBadges();renderFavStates();renderCompareBar();syncCmpChecks();
  // reveal on scroll
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{threshold:.08});
  setTimeout(()=>$$('.reveal').forEach(el=>io.observe(el)),60);
  // back to top
  const top=$('#toTop');
  if(top){window.addEventListener('scroll',()=>top.style.display=scrollY>500?'grid':'none');top.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}))}
}
window.BMH.initChrome=initChrome;

/* ---------- EMI ---------- */
window.BMH.emi=function(principal,rate,years){
  const r=rate/12/100,n=years*12;
  if(r===0)return principal/n;
  return principal*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
};

/* ---------- INR formatting ---------- */
window.BMH.inr=function(n){
  if(n>=1e7)return '₹'+(n/1e7).toFixed(2)+' Cr';
  if(n>=1e5)return '₹'+(n/1e5).toFixed(2)+' L';
  return '₹'+Math.round(n).toLocaleString('en-IN');
};

document.addEventListener('DOMContentLoaded',initChrome);
})();
