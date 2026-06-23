/* inventory admin — PIN gate + add/delete */
(function(){
const {$,$$,toast,P}=window.BMH;
const S=window.INV_STATUS;

/* PIN gate */
$('#pinForm').addEventListener('submit',e=>{
  e.preventDefault();
  if(($('#pinInput').value||'').trim()===String(window.INVENTORY_PIN)){
    sessionStorage.setItem('bmh_admin','1'); start();
  }else{ $('#pinErr').classList.remove('hide'); }
});
if(sessionStorage.getItem('bmh_admin')==='1') start();

function start(){
  $('#gate').classList.add('hide'); $('#app').classList.remove('hide');
  $('#modeNote').innerHTML = window.Inventory.isLive()
    ? '<span class="inv-live">● Live</span> — changes sync to everyone via your connected sheet.'
    : 'Saved in this browser only. Connect the Google Sheet backend (see inventory-config.js) to share across devices.';
  // project dropdown
  const sel=$('#projSel');
  P.slice().sort((a,b)=>a.name.localeCompare(b.name)).forEach(p=>{
    const o=document.createElement('option'); o.value=p.slug; o.textContent=p.name+' — '+(p.city||''); sel.appendChild(o);
  });
  sel.addEventListener('change',()=>{
    const p=P.find(x=>x.slug===sel.value);
    const f=$('#invForm');
    if(p){ f.project.value=p.name; f.city.value=p.city||''; f.locality.value=p.locality||''; }
  });
  $('#invForm').addEventListener('submit',onAdd);
  $('#adminSearch').addEventListener('input',e=>renderList(e.target.value));
  renderList();
}

async function onAdd(e){
  e.preventDefault();
  const f=e.target, d=Object.fromEntries(new FormData(f));
  d.projectSlug=$('#projSel').value||'';
  if(!d.project||!d.config){toast('Project and configuration are required');return;}
  const btn=f.querySelector('button[type=submit]'); btn.disabled=true; btn.textContent='Adding…';
  try{ await window.Inventory.add(d); f.reset(); $('#projSel').value=''; toast('Unit added to inventory'); await renderList(); }
  catch(err){ toast('Could not save — check connection'); console.error(err); }
  btn.disabled=false; btn.textContent='Add to inventory';
}

async function renderList(filter){
  const list=(await window.Inventory.list()).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  $('#invN').textContent=list.length;
  const q=(filter||'').toLowerCase();
  const shown=q?list.filter(u=>(u.project+' '+u.locality+' '+u.config).toLowerCase().includes(q)):list;
  const wrap=$('#adminList');
  if(!shown.length){wrap.innerHTML='<p style="color:var(--muted)">No units yet. Add one above.</p>';return;}
  wrap.innerHTML=shown.map(u=>{
    const meta=S[u.status]||{label:u.status,cls:'uc'};
    const line=[u.config, u.size?u.size+' sq.ft.':'', u.facing, u.floorUnit, u.price, u.possession].filter(Boolean).join(' · ');
    return `<div class="admin-row">
      <div style="min-width:0">
        <div><b>${u.project}</b> <span class="inv-pill ${meta.cls}" style="margin-left:6px">${meta.label}</span></div>
        <div class="meta">${u.locality||u.city||''} — ${line}${u.units?' · '+u.units:''}</div>
      </div>
      <button class="btn btn-ghost btn-sm" data-del="${u.id}" style="color:var(--brand);border-color:#f0c9ce">Delete</button>
    </div>`;
  }).join('');
  wrap.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',async()=>{
    if(!confirm('Delete this unit from inventory?'))return;
    b.disabled=true; await window.Inventory.remove(b.dataset.del); toast('Unit removed'); renderList($('#adminSearch').value);
  }));
}
})();
