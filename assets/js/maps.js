/* maps & brochures downloads hub */
(function(){
const M=window.MAPS||[];
const {P,$,$$,shortPrice,toast,I}=window.BMH;

/* ---------- tab toggle ---------- */
$$('#dlToggle button').forEach(b=>b.addEventListener('click',()=>{
  const t=b.dataset.dl;
  $$('#dlToggle button').forEach(x=>x.classList.toggle('active',x===b));
  $('#panel-maps').classList.toggle('hide',t!=='maps');
  $('#panel-brochures').classList.toggle('hide',t!=='brochures');
}));
// deep-link ?tab=brochures
if(new URLSearchParams(location.search).get('tab')==='brochures'){$('#dlToggle button[data-dl="brochures"]').click();}

/* ---------- maps grid ---------- */
const grid=$('#mapsGrid');
if(grid)grid.innerHTML=M.map(m=>`
  <article class="card">
    <div class="card-media" style="cursor:zoom-in;aspect-ratio:3/4;background:var(--cream-2)" data-view="${m.id}">
      <img loading="lazy" src="${m.thumb}" alt="${m.title}" style="object-fit:cover">
      <div class="pills"><span class="pill brand">${m.area}</span>${m.pages>1?`<span class="pill">${m.pages} sheets</span>`:''}</div>
    </div>
    <div class="card-body">
      <h3 style="font-size:1.15rem">${m.title}</h3>
      <div class="card-loc">${m.sub}</div>
      <p style="font-size:.86rem;color:var(--muted);flex:1">${m.note}</p>
      <div class="card-foot">
        <button class="btn btn-ghost btn-sm" data-view="${m.id}">View map</button>
        <a class="btn btn-dark btn-sm" href="${m.pdf}" download>Download PDF</a>
      </div>
    </div>
  </article>`).join('');

/* ---------- brochures grid ---------- */
const withBro=P.filter(p=>p.brochure);
function broCard(p){
  const hasImg=!!(p.card||p.hero);
  const com=p.category==='Commercial';
  const media=hasImg
    ? `<img loading="lazy" src="${p.card||p.hero}" alt="${p.name}">`
    : `<div class="ph-ic">${com?I.store:I.building}</div><span class="ph-name">${com?(p.commercialType||'Commercial'):p.city}</span>`;
  return `<article class="card">
    <a class="card-media${hasImg?'':' is-ph '+(com?'ph-com':'ph-res')}" href="project.html?p=${p.slug}" style="aspect-ratio:16/10">${media}</a>
    <div class="card-body">
      <h3 style="font-size:1.12rem">${p.name}</h3>
      <div class="card-loc">${I.pin}<span>${(p.locality||p.location||p.city).split(',')[0]}</span></div>
      <div class="card-foot">
        <span class="card-dev" style="font-size:.8rem">${p.configShort}</span>
        <button class="btn btn-dark btn-sm" data-bro="${p.slug}">Download brochure</button>
      </div>
    </div>
  </article>`;
}
const CITY_ORDER=['Mohali','New Chandigarh','Zirakpur'];
const broCities=CITY_ORDER.filter(c=>withBro.some(p=>p.city===c))
  .concat([...new Set(withBro.map(p=>p.city))].filter(c=>!CITY_ORDER.includes(c)));
let broCity='';
function renderBro(){
  const q=($('#broSearch').value||'').toLowerCase();
  const list=withBro.filter(p=>(!broCity||p.city===broCity) &&
      (!q || (p.name+' '+p.developer+' '+p.locality+' '+p.city+' '+p.configShort).toLowerCase().includes(q)))
    .sort((a,b)=>(b.featured-a.featured)||a.name.localeCompare(b.name));
  $('#broCount').textContent=list.length;
  const g=$('#brochuresGrid'),em=$('#broEmpty');
  // city chips
  $('#broCityChips').innerHTML=[['','All cities']].concat(broCities.map(c=>[c,c])).map(([v,l])=>{
    const n=v?withBro.filter(p=>p.city===v).length:withBro.length;
    return `<button class="chip ${broCity===v?'active':''}" data-brocity="${v}">${l} <span style="opacity:.6">${n}</span></button>`;
  }).join('');
  // group by city
  if(list.length){
    const groups=broCities.filter(c=>list.some(p=>p.city===c));
    g.innerHTML=groups.map(c=>{
      const cards=list.filter(p=>p.city===c);
      return `<div style="margin-bottom:36px">
        <h3 style="font-size:1.3rem;margin-bottom:4px">${c} <span style="font-family:var(--sans);font-size:.95rem;font-weight:400;color:var(--muted)">· ${cards.length}</span></h3>
        <p style="color:var(--muted);font-size:.86rem;margin-bottom:16px">${cards.length} project${cards.length>1?'s':''} with a downloadable brochure</p>
        <div class="grid cards">${cards.map(broCard).join('')}</div></div>`;
    }).join('');
    g.classList.remove('hide');em.classList.add('hide');
  }else{g.innerHTML='';g.classList.add('hide');em.classList.remove('hide');}
}
renderBro();
$('#broSearch').addEventListener('input',renderBro);
document.addEventListener('click',e=>{const c=e.target.closest('[data-brocity]');if(c){broCity=c.dataset.brocity;renderBro();}});

/* ---------- map viewer ---------- */
const lb=$('#mapLb'),img=$('#mapLbImg'),cap=$('#mapLbCap');
let cur=null,pi=0;
function openMap(id){cur=M.find(x=>x.id===id);if(!cur)return;pi=0;renderMap();lb.classList.add('open');}
function renderMap(){img.src=cur.images[pi];cap.textContent=`${cur.title}${cur.images.length>1?` · sheet ${pi+1} of ${cur.images.length}`:''} — tap Download for full quality`;}
function navMap(d){pi=(pi+d+cur.images.length)%cur.images.length;renderMap();}

/* ---------- brochure email gate ---------- */
const modal=$('#brochureModal'); let target=null;
function openBro(slug){
  target=P.find(p=>p.slug===slug); if(!target)return;
  $('#broTitle').textContent='Brochure · '+target.name;
  $('#broForm').classList.remove('hide');$('#broDone').classList.add('hide');
  modal.classList.add('open');
}
$('#broForm').addEventListener('submit',e=>{
  e.preventDefault();
  const leads=JSON.parse(localStorage.getItem('bmh_leads')||'[]');
  leads.push({...Object.fromEntries(new FormData(e.target)),project:target.name,intent:'brochure',at:Date.now()});
  localStorage.setItem('bmh_leads',JSON.stringify(leads));
  $('#broForm').classList.add('hide');$('#broDone').classList.remove('hide');
  $('#broDoneMsg').textContent='Thanks! Your brochure for '+target.name+' is ready.';
  const dl=$('#broDownload');dl.href=target.brochure;dl.setAttribute('download',target.slug+'.pdf');
  window.open(target.brochure,'_blank');
});

/* ---------- delegated clicks ---------- */
document.addEventListener('click',e=>{
  const v=e.target.closest('[data-view]'); if(v)openMap(v.dataset.view);
  const b=e.target.closest('[data-bro]'); if(b){e.preventDefault();openBro(b.dataset.bro);}
  if(e.target.matches('[data-mlb-close]')||e.target===lb)lb.classList.remove('open');
  if(e.target.matches('[data-mlb-prev]'))navMap(-1);
  if(e.target.matches('[data-mlb-next]'))navMap(1);
  if(e.target.matches('[data-bro-close]'))modal.classList.remove('open');
});
document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;
  if(e.key==='Escape')lb.classList.remove('open');if(e.key==='ArrowLeft')navMap(-1);if(e.key==='ArrowRight')navMap(1);});
})();
