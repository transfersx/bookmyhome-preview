/* explore hub — browse by type, city, locality, developer */
(function(){
const {P,$,$$}=window.BMH;
const enc=encodeURIComponent;
const by=(fn)=>{const m={};P.forEach(p=>{const k=fn(p);if(!k)return;(m[k]=m[k]||[]).push(p)});return m;};

/* TYPE */
const types=[
  {label:'Homes',sub:'Apartments, floors & villas',cat:'Residential',ic:'M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 7h2M13 7h2M9 11h2M13 11h2'},
  {label:'Plots',sub:'Residential & commercial land',cat:'Plots',ic:'M3 3h18v18H3zM3 9h18M9 3v18'},
  {label:'Commercial',sub:'SCO, booths & retail floors',cat:'Commercial',ic:'M3 9l1.5-5h15L21 9M4 9v10a1 1 0 001 1h14a1 1 0 001-1V9M9 20v-6h6v6'},
  {label:'Plot maps',sub:'GMADA & developer layouts',href:'maps.html',ic:'M9 20l-5.5 2V6L9 4m0 16l6-2m-6 2V4m6 14l5.5 2V4l-5.5 2m0 12V6'}
];
$('#dirType').innerHTML=types.map(t=>{
  const c=t.cat?P.filter(p=>p.category===t.cat).length:'';
  const href=t.href||`listings.html?category=${t.cat}`;
  return `<a class="dir-tile type" href="${href}">
    <span class="ti"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="${t.ic}"/></svg></span>
    <span class="tx"><b>${t.label}</b><span>${t.sub}</span></span>
    ${c!==''?`<span class="ct">${c}</span>`:'<span class="ct" style="background:var(--accent)">Maps</span>'}</a>`;
}).join('');

/* CITY (image-backed) */
const cityImg={'Mohali':'falcon-view','New Chandigarh':'opus-one','Zirakpur':'el-spazia'};
const cities=by(p=>p.city);
const cityOrder=['Mohali','New Chandigarh','Zirakpur'].filter(c=>cities[c]);
$('#dirCity').innerHTML=cityOrder.map(c=>{
  const pr=P.find(p=>p.slug===cityImg[c]&&p.hero)||cities[c].find(p=>p.hero);
  const img=pr?(pr.card||pr.hero):'';
  return `<a class="loc-card" href="listings.html?city=${enc(c)}" style="aspect-ratio:16/10">
    ${img?`<img loading="lazy" src="${img}" alt="${c}">`:`<div style="position:absolute;inset:0;background:linear-gradient(150deg,#241b18,#4a3a32)"></div>`}
    <div class="lc-body"><h3>${c}</h3><span>${cities[c].length} project${cities[c].length>1?'s':''}</span></div></a>`;
}).join('');

/* LOCALITY */
const locs=by(p=>p.locality);
const locSorted=Object.entries(locs).sort((a,b)=>b[1].length-a[1].length);
$('#dirLocality').innerHTML=locSorted.map(([k,arr])=>`
  <a class="dir-tile" href="listings.html?locality=${enc(k)}">
    <span class="tx"><b>${k.split(',')[0]}</b><span>${k.split(',').slice(1).join(',').trim()||'&nbsp;'}</span></span>
    <span class="ct">${arr.length}</span></a>`).join('');

/* DEVELOPER */
const devs=by(p=>p.devName);
const devSorted=Object.entries(devs).sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0]));
$('#dirDev').innerHTML=devSorted.map(([k,arr])=>`
  <a class="dir-tile" href="listings.html?developer=${enc(k)}">
    <span class="tx"><b>${k}</b><span>${[...new Set(arr.map(p=>p.city))].join(' · ')}</span></span>
    <span class="ct">${arr.length}</span></a>`).join('');

/* search → listings */
const s=$('#exSearch');
s.addEventListener('keydown',e=>{if(e.key==='Enter'&&s.value.trim())location.href='listings.html?q='+enc(s.value.trim());});
})();
