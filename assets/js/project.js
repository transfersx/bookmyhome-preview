/* project detail page */
(function(){
const {P,$,$$,byId,toast,inr,emi}=window.BMH;
const slug=new URLSearchParams(location.search).get('p');
const p=byId(slug)||P[0];
if(!p){document.getElementById('app').innerHTML='<div class="wrap empty"><h3>Project not found</h3><a class="btn btn-primary btn-sm" href="listings.html">Browse all</a></div>';return;}

document.title=`${p.name} — ${p.location.split(',')[0]||p.city} · Book My Home`;
const devClean=p.developer.split('(')[0].trim();
const sizeTxt=p.sizeMin?`${p.sizeMin.toLocaleString('en-IN')}–${p.sizeMax.toLocaleString('en-IN')} sq.ft.`:'On request';

/* ---------- gallery ---------- */
const imgs=[p.hero,...(p.gallery||[])].filter(Boolean);
const allImgs=[...imgs,...(p.floorplans||[])];
const gEl=$('#gallery');
const isCom=p.category==='Commercial';
if(imgs.length===0){
  const bg=isCom?'linear-gradient(140deg,#241b18,#3f3029)':'linear-gradient(135deg,#f8efe9,#efd6db)';
  const fg=isCom?'#fff':'var(--ink)', icbg=isCom?'rgba(255,255,255,.1)':'rgba(255,255,255,.65)', icc=isCom?'var(--gold)':'var(--brand)';
  gEl.innerHTML=`<div class="g-main" style="background:${bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;color:${fg};cursor:default">
    <div style="width:66px;height:66px;border-radius:18px;display:grid;place-items:center;background:${icbg};color:${icc}">${isCom?window.BMH.I.store:window.BMH.I.building}</div>
    <span style="font-family:var(--serif);font-weight:600;font-size:1.5rem">${p.name}</span>
    <small style="text-transform:uppercase;letter-spacing:.12em;opacity:.7;font-size:.72rem">Photos &amp; brochure on request</small>
    <button class="btn ${isCom?'btn-accent':'btn-primary'} btn-sm" data-brochure style="margin-top:4px">${p.brochure?'Download brochure':'Request brochure'}</button>
  </div>`;
}else if(imgs.length>=3){
  gEl.innerHTML=`
    <div class="g-main" data-lb="0"><img src="${imgs[0]}" alt="${p.name}"></div>
    <div class="g-side">
      <img src="${imgs[1]}" data-lb="1" alt="">
      <div style="position:relative" data-lb="2"><img src="${imgs[2]}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius)">
      ${imgs.length>3?`<div style="position:absolute;inset:0;background:rgba(20,14,12,.45);border-radius:var(--radius);display:grid;place-items:center;color:#fff;font-weight:600;cursor:zoom-in">+${imgs.length-3} photos</div>`:''}</div>
    </div>
    <div class="g-thumbs">${imgs.map((im,i)=>`<img src="${im}" data-lb="${i}" alt="">`).join('')}</div>`;
}else{
  gEl.innerHTML=`<div class="g-main" data-lb="0"><img src="${imgs[0]||''}" alt="${p.name}"></div>
    ${imgs.length>1?`<div class="g-thumbs">${imgs.map((im,i)=>`<img src="${im}" data-lb="${i}" alt="">`).join('')}</div>`:''}`;
}

/* ---------- main column ---------- */
const pillHtml=()=>{
  const a=[];
  if(/ready/i.test(p.status))a.push('<span class="pill ready">Ready to Move</span>');
  else if(p.status)a.push(`<span class="pill brand">${p.status}</span>`);
  if(p.featured)a.push('<span class="pill accent">Featured</span>');
  a.push(`<span class="pill" style="background:var(--cream-2)">RERA ${p.rera.length?'verified':'registered'}</span>`);
  return a.join(' ');
};
const reraTxt=p.rera.length?p.rera.join(', '):'Registered project';

$('#detailMain').innerHTML=`
  <div class="detail-title">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">${pillHtml()}</div>
    <h1>${p.name}</h1>
    <div class="meta">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--brand)"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <span>${p.location||p.city}</span>
    </div>
    ${p.tagline?`<p style="font-family:var(--serif);font-style:italic;font-size:1.2rem;color:var(--brand);margin-top:14px">"${p.tagline}"</p>`:''}
  </div>

  <div class="kv-grid">
    <div class="kv"><span>Configurations</span><b>${p.configShort}</b></div>
    <div class="kv"><span>Built-up size</span><b>${sizeTxt}</b></div>
    <div class="kv"><span>Possession</span><b>${p.status||'On request'}</b></div>
    <div class="kv"><span>Developer</span><b style="font-size:.98rem">${devClean}</b></div>
  </div>

  ${p.about?`<div class="block" style="border-top:none;padding-top:6px"><h2>About <span class="em">${p.name}</span></h2>
    <div class="prose">${aboutParas(p.about)}</div></div>`:''}

  ${p.highlights&&p.highlights.length?`<div class="block"><h2>Why you'll love it</h2>
    <div class="amen-grid">${p.highlights.map(h=>`<div class="amen"><span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg></span><span>${h}</span></div>`).join('')}</div></div>`:''}

  ${p.configs&&p.configs.length?`<div class="block"><h2>Configurations &amp; sizes</h2>
    <div style="overflow-x:auto;border:1px solid var(--line);border-radius:var(--radius)">
    <table class="cfg-table"><thead><tr><th>Type</th><th>Super area</th><th>Carpet area</th><th>Price</th></tr></thead>
    <tbody>${dedupeConfigs(p.configs).map(c=>`<tr>
      <td class="bhk">${c.type}</td>
      <td>${c.super_area_sqft?c.super_area_sqft+' sq.ft.':'—'}</td>
      <td>${c.carpet_area_sqft?c.carpet_area_sqft+' sq.ft.':'—'}</td>
      <td><a href="#" data-enq style="color:var(--brand);font-weight:600">Get price</a></td></tr>`).join('')}</tbody></table></div></div>`:''}

  ${p.amenities&&p.amenities.length?`<div class="block"><h2>Amenities &amp; lifestyle</h2>
    <div class="amen-grid">${p.amenities.slice(0,18).map(a=>`<div class="amen"><span class="ic">${amenIcon(a)}</span><span>${cap(a)}</span></div>`).join('')}</div></div>`:''}

  ${p.floorplans&&p.floorplans.length?`<div class="block"><h2>Floor &amp; site plans</h2>
    <div class="fp-grid">${p.floorplans.map((f,i)=>`<div class="fp" data-lb="${imgs.length+i}"><img src="${f}" alt="Plan ${i+1}"></div>`).join('')}</div></div>`:''}

  ${Object.keys(p.specs||{}).filter(k=>p.specs[k]).length?`<div class="block"><h2>Specifications</h2>
    <div class="spec-list">${Object.entries(p.specs).filter(([k,v])=>v).map(([k,v])=>`<div class="row"><span>${k}</span><p>${v}</p></div>`).join('')}</div></div>`:''}

  ${p.locationAdv&&p.locationAdv.length?`<div class="block"><h2>Location advantages</h2>
    <div class="amen-grid">${p.locationAdv.map(l=>`<div class="amen"><span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></span><span>${l}</span></div>`).join('')}</div></div>`:''}

  <div class="block"><h2>On the map</h2>
    <p style="color:var(--muted);margin-bottom:14px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2" style="vertical-align:-2px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> ${p.location||p.city}</p>
    <iframe class="mini-map" style="border:0" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" title="${p.name} location"
      src="https://www.google.com/maps?q=${encodeURIComponent(geoQuery(p))}&z=14&output=embed"></iframe>
    <div style="margin-top:12px"><a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name+' '+geoQuery(p))}">Open in Google Maps ↗</a></div>
  </div>

  <div class="block"><h2>Project details</h2>
    <div class="spec-list">
      <div class="row"><span>Developer</span><p>${p.developer}</p></div>
      ${p.architect?`<div class="row"><span>Architect</span><p>${p.architect}</p></div>`:''}
      ${p.towers?`<div class="row"><span>Towers</span><p>${p.towers}</p></div>`:''}
      ${p.units?`<div class="row"><span>Total units</span><p>${p.units}</p></div>`:''}
      ${p.landArea?`<div class="row"><span>Land area</span><p>${p.landArea}</p></div>`:''}
      <div class="row"><span>Property type</span><p>${p.type}</p></div>
      <div class="row"><span>RERA</span><p>${reraTxt}</p></div>
    </div>
    ${p.sources&&p.sources.length?`<div style="margin-top:16px"><span style="font-size:.72rem;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);font-weight:700">Sources</span><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">${p.sources.map(u=>`<a href="${u}" target="_blank" rel="noopener" style="font-size:.78rem;color:var(--brand);border:1px solid var(--line-2);border-radius:999px;padding:4px 11px">${hostOf(u)} ↗</a>`).join('')}</div></div>`:''}
    <p style="font-size:.76rem;color:var(--muted);margin-top:14px">${p.placeholder?'Details compiled from public market sources and reorganised for clarity — treat sizes and any prices as indicative. ':'Information curated from the developer brochure and reorganised for clarity. Images are artistic representations. '}Please confirm final figures and RERA status with a Book My Home advisor before any commitment.</p>
  </div>
`;

/* ---------- sticky enquiry + EMI ---------- */
$('#enquireCard').innerHTML=`
  <div class="price"><b>${window.BMH.shortPrice(p.price)}</b><span>${p.configShort} · ${sizeTxt}${p.placeholder&&p.price!=='Price on Request'?' · indicative':''}</span></div>
  ${p.price&&!/request/i.test(p.price)&&p.price.length>22?`<p style="font-size:.78rem;color:var(--muted);margin-top:-6px">${p.price}</p>`:''}
  <button class="btn btn-primary btn-block" data-enq>Get exact price</button>
  <button class="btn btn-dark btn-block" data-brochure>${p.brochure?'Download brochure (PDF)':'Request brochure'}</button>
  <button class="btn btn-ghost btn-block" data-enq data-visit>Schedule a site visit</button>
  <div style="display:flex;gap:10px">
    <button class="btn btn-ghost btn-sm" id="favBtn" style="flex:1" data-fav="${p.id}">${window.BMH.I.heart} Save</button>
    <a class="btn btn-ghost btn-sm" style="flex:1" href="compare.html" id="cmpBtn">+ Compare</a>
  </div>
  <hr style="border:none;border-top:1px solid var(--line);margin:4px 0">
  <div class="emi">
    <span class="eyebrow">EMI calculator</span>
    <div class="out" id="emiOut">—</div>
    <div style="font-size:.78rem;color:var(--muted)">estimated / month</div>
    <div class="emi-row"><div class="lbl"><span>Property value</span><b id="pvVal">₹1.50 Cr</b></div>
      <input type="range" id="pv" min="3000000" max="120000000" step="500000" value="15000000"></div>
    <div class="emi-row"><div class="lbl"><span>Down payment</span><b id="dpVal">20%</b></div>
      <input type="range" id="dp" min="10" max="50" step="5" value="20"></div>
    <div class="emi-row"><div class="lbl"><span>Interest rate</span><b id="rtVal">8.5%</b></div>
      <input type="range" id="rt" min="7" max="12" step="0.1" value="8.5"></div>
    <div class="emi-row"><div class="lbl"><span>Tenure</span><b id="tnVal">20 yrs</b></div>
      <input type="range" id="tn" min="5" max="30" step="1" value="20"></div>
    <div style="font-size:.74rem;color:var(--muted)">Loan amount: <b id="loanAmt"></b></div>
  </div>
`;

/* ---------- helpers ---------- */
function dedupeConfigs(cfgs){
  // collapse Galaxy Heights-2 style unit list into BHK groups if many
  if(cfgs.length<=6)return cfgs;
  const groups={};
  cfgs.forEach(c=>{
    const key=(c.type.match(/(\d\s*BHK[^()]*)/i)||[c.type])[0].trim();
    const sup=parseInt((c.super_area_sqft||'').replace(/[^\d]/g,''))||null;
    if(!groups[key])groups[key]={type:key,mins:[],maxs:[],carp:[]};
    if(sup)groups[key].mins.push(sup),groups[key].maxs.push(sup);
    const cp=parseInt((c.carpet_area_sqft||'').replace(/[^\d]/g,''));if(cp)groups[key].carp.push(cp);
  });
  return Object.values(groups).map(g=>({
    type:g.type,
    super_area_sqft:g.mins.length?(Math.min(...g.mins)===Math.max(...g.maxs)?Math.min(...g.mins):Math.min(...g.mins)+'–'+Math.max(...g.maxs)):'',
    carpet_area_sqft:g.carp.length?(Math.min(...g.carp)===Math.max(...g.carp)?Math.min(...g.carp):Math.min(...g.carp)+'–'+Math.max(...g.carp)):'',
    price:null
  }));
}
function cap(s){return s.replace(/\b\w/g,c=>c.toUpperCase())}
function hostOf(u){try{return new URL(u).hostname.replace('www.','')}catch(e){return 'source'}}
function geoQuery(p){
  // build a reliable geocode query from the sector/area + city (NOT the project name)
  let q=(p.location||'').trim();
  if(!q || q.length<4) q=(p.locality||p.city||'');
  q=q.replace(/\bplot\s*no\.?\s*[-\d]+/ig,'')
     .replace(/\bGH\s*-?\d+\b/ig,'')
     .replace(/\([^)]*\)/g,'')          // drop parentheticals like (PR7), (Greater Mohali)
     .replace(/[-–]\s*\d{6}\b/g,'')      // drop pincodes
     .replace(/\bnear[^,]*/ig,'')        // drop "near X" phrases
     .replace(/\s{2,}/g,' ')
     .replace(/\s*,\s*/g,', ')
     .replace(/^[,\s]+|[,\s]+$/g,'')
     .replace(/(,\s*)+/g,', ');
  if(!/punjab/i.test(q)) q+=', Punjab';
  if(!/india/i.test(q)) q+=', India';
  return q;
}
function aboutParas(t){
  let parts=t.includes('\n')?t.split(/\n+/):t.split(/(?<=\.)\s+(?=[A-Z])/);
  parts=parts.map(s=>s.trim()).filter(Boolean);
  // group sentences into ~2-3 sentence paragraphs when no line breaks
  if(!t.includes('\n')&&parts.length>3){
    const out=[];for(let i=0;i<parts.length;i+=2)out.push(parts.slice(i,i+2).join(' '));parts=out;
  }
  return parts.map(s=>`<p>${s}</p>`).join('');
}
function amenIcon(a){
  a=a.toLowerCase();
  const sv=(d)=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${d}</svg>`;
  if(/pool|swim/.test(a))return sv('<path d="M2 18c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 2-1"/><path d="M6 14V5a2 2 0 014 0M14 14V5a2 2 0 014 0"/>');
  if(/gym|fitness/.test(a))return sv('<path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12"/>');
  if(/club/.test(a))return sv('<path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6"/>');
  if(/park|garden|green|landscap/.test(a))return sv('<path d="M12 22V12M7 12a5 5 0 0110 0M5 12a7 7 0 0114 0"/>');
  if(/security|cctv|gated/.test(a))return sv('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>');
  if(/play|kid|child/.test(a))return sv('<circle cx="12" cy="5" r="2"/><path d="M5 21l3-6 4 2 4-2 3 6"/>');
  if(/power|backup|dg/.test(a))return sv('<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>');
  if(/court|cricket|tennis|sport/.test(a))return sv('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18"/>');
  if(/spa|yoga|wellness/.test(a))return sv('<path d="M12 3v18M5 8c0 4 3 7 7 7s7-3 7-7"/>');
  return sv('<path d="M20 6L9 17l-5-5"/>');
}

/* ---------- lightbox ---------- */
let lbIdx=0;
const lb=$('#lightbox'),lbImg=$('#lbImg');
function openLb(i){lbIdx=i;lbImg.src=allImgs[i];lb.classList.add('open')}
function navLb(d){lbIdx=(lbIdx+d+allImgs.length)%allImgs.length;lbImg.src=allImgs[lbIdx]}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-lb]');
  if(t){openLb(+t.dataset.lb);}
  if(e.target.matches('[data-lb-close]')||e.target===lb)lb.classList.remove('open');
  if(e.target.matches('[data-lb-prev]'))navLb(-1);
  if(e.target.matches('[data-lb-next]'))navLb(1);
});
document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;
  if(e.key==='Escape')lb.classList.remove('open');if(e.key==='ArrowLeft')navLb(-1);if(e.key==='ArrowRight')navLb(1);});

/* ---------- EMI ---------- */
function calcEmi(){
  const pv=+$('#pv').value,dp=+$('#dp').value,rt=+$('#rt').value,tn=+$('#tn').value;
  const loan=pv*(1-dp/100);
  $('#pvVal').textContent=inr(pv);$('#dpVal').textContent=dp+'%';$('#rtVal').textContent=rt+'%';$('#tnVal').textContent=tn+' yrs';
  $('#loanAmt').textContent=inr(loan);
  $('#emiOut').textContent=inr(emi(loan,rt,tn));
}
['pv','dp','rt','tn'].forEach(id=>$('#'+id).addEventListener('input',calcEmi));
calcEmi();

/* fav state */
$('#favBtn').classList.toggle('on',window.BMH.shortlist().includes(String(p.id)));

/* ---------- enquiry modal ---------- */
const modal=$('#enqModal');
$('#enqTitle').textContent='Enquire · '+p.name;
$('#enqConfig').innerHTML=`<option value="">Any configuration</option>`+dedupeConfigs(p.configs).map(c=>`<option>${c.type}</option>`).join('');
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-enq]');
  if(t){e.preventDefault();modal.classList.add('open');if(t.hasAttribute('data-visit'))$('[name=visit]',modal).checked=true;}
  if(e.target.matches('[data-enq-close]')||e.target.classList.contains('modal-bg'))modal.classList.remove('open');
});
$('#enqForm').addEventListener('submit',e=>{
  e.preventDefault();
  const leads=JSON.parse(localStorage.getItem('bmh_leads')||'[]');
  leads.push({...Object.fromEntries(new FormData(e.target)),project:p.name,at:Date.now()});
  localStorage.setItem('bmh_leads',JSON.stringify(leads));
  modal.classList.remove('open');e.target.reset();
  toast('Thank you — an advisor will call you about '+p.name);
});
$('#waFab').href=`https://wa.me/919888268882?text=${encodeURIComponent("Hi Book My Home, I'm interested in "+p.name+" ("+p.location.split(',')[0]+"). Please share pricing & availability.")}`;

/* ---------- email-gated brochure download ---------- */
const broModal=$('#brochureModal');
$('#broTitle').textContent='Brochure · '+p.name;
document.addEventListener('click',e=>{
  if(e.target.closest('[data-brochure]')){
    e.preventDefault();
    $('#broForm').classList.remove('hide');$('#broDone').classList.add('hide');$('#broDownload').classList.add('hide');
    broModal.classList.add('open');
  }
  if(e.target.matches('[data-bro-close]'))broModal.classList.remove('open');
});
$('#broForm').addEventListener('submit',e=>{
  e.preventDefault();
  const lead={...Object.fromEntries(new FormData(e.target)),project:p.name,intent:'brochure',at:Date.now()};
  const leads=JSON.parse(localStorage.getItem('bmh_leads')||'[]');leads.push(lead);localStorage.setItem('bmh_leads',JSON.stringify(leads));
  $('#broForm').classList.add('hide');$('#broDone').classList.remove('hide');
  if(p.brochure){
    $('#broDoneMsg').textContent='Thanks! Your brochure for '+p.name+' is ready.';
    const dl=$('#broDownload');dl.href=p.brochure;dl.setAttribute('download',(p.slug||'brochure')+'.pdf');dl.classList.remove('hide');
    window.open(p.brochure,'_blank');
  }else{
    $('#broDoneMsg').textContent='Thank you — our advisor will email the '+p.name+' brochure to you shortly.';
  }
});
})();
