/* public live-inventory page */
(function(){
const {$,$$,byId}=window.BMH;
const S=window.INV_STATUS;
let ALL=[], st='', q='';
const BIZ='919888268882';

function waLink(u){
  const bits=[u.project, u.config, u.size?u.size+' sq.ft.':'', u.facing, u.floorUnit, u.price, u.locality].filter(Boolean).join(', ');
  return `https://wa.me/${BIZ}?text=${encodeURIComponent("Hi Book My Home, I'm interested in this unit: "+bits+". Please share details & best price.")}`;
}
function card(u){
  const meta=S[u.status]||{label:u.status,cls:'uc'};
  const specs=[u.config, u.size?u.size+' sq.ft.':'', u.facing].filter(Boolean).join(' · ');
  const rows=[
    u.price&&['Price',u.price], u.possession&&['Possession',u.possession],
    u.floorUnit&&['Unit',u.floorUnit], u.paymentPlan&&['Payment plan',u.paymentPlan],
    u.units&&['Availability',u.units]
  ].filter(Boolean);
  const proj=u.projectSlug&&byId(u.projectSlug);
  return `<article class="inv-card">
    <div class="inv-head">
      <div style="min-width:0">
        <h3>${u.project}</h3>
        <div class="card-loc"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg><span>${u.locality||u.city||''}</span></div>
      </div>
      <span class="inv-pill ${meta.cls}">${meta.label}</span>
    </div>
    <div class="inv-specs">${specs}</div>
    <div class="inv-rows">${rows.map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
    ${u.notes?`<p class="inv-notes">${u.notes}</p>`:''}
    <div class="inv-foot">
      ${proj?`<a class="btn btn-ghost btn-sm" href="project.html?p=${u.projectSlug}">Project details</a>`:''}
      <a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="${waLink(u)}">Enquire on WhatsApp</a>
    </div>
  </article>`;
}
function render(){
  let list=ALL.filter(u=>(!st||u.status===st));
  if(q){const s=q.toLowerCase();list=list.filter(u=>(u.project+' '+u.locality+' '+u.city+' '+u.config+' '+u.notes+' '+u.facing).toLowerCase().includes(s));}
  $('#invCount').textContent=list.length;
  const g=$('#invGrid'),em=$('#invEmpty');
  if(list.length){g.innerHTML=list.map(card).join('');g.classList.remove('hide');em.classList.add('hide');}
  else{g.innerHTML='';g.classList.add('hide');em.classList.remove('hide');}
}
async function load(){
  $('#invGrid').innerHTML='<p style="color:var(--muted)">Loading inventory…</p>';
  ALL=(await window.Inventory.list()).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  if(window.Inventory.isLive())$('#liveTag').innerHTML='<span class="inv-live">● Live</span>';
  render();
}
$$('#invTabs button').forEach(b=>b.addEventListener('click',()=>{st=b.dataset.st;$$('#invTabs button').forEach(x=>x.classList.toggle('active',x===b));render();}));
$('#invSearch').addEventListener('input',e=>{q=e.target.value;render();});
load();
})();
