/* inventory admin — PIN gate + add / edit / delete */
(function(){
const {$,$$,toast,P}=window.BMH;
const S=window.INV_STATUS;
const FIELDS=['project','type','status','city','locality','config','size','facing','floorUnit','price','possession','paymentPlan','units','notes'];
let editingId=null;

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
  const sel=$('#projSel');
  P.slice().sort((a,b)=>a.name.localeCompare(b.name)).forEach(p=>{
    const o=document.createElement('option'); o.value=p.slug; o.textContent=p.name+' — '+(p.city||''); sel.appendChild(o);
  });
  sel.addEventListener('change',()=>{
    const p=P.find(x=>x.slug===sel.value), f=$('#invForm');
    if(p){ f.project.value=p.name; f.city.value=p.city||''; f.locality.value=p.locality||''; f.type.value=(p.category==='Commercial')?'commercial':'residential'; }
  });
  $('#invForm').addEventListener('submit',onSubmit);
  $('#invCancel').addEventListener('click',cancelEdit);
  $('#adminSearch').addEventListener('input',e=>renderList(e.target.value));
  renderList();
}

async function onSubmit(e){
  e.preventDefault();
  const f=e.target, d=Object.fromEntries(new FormData(f));
  d.projectSlug=$('#projSel').value||'';
  if(!d.project||!d.config){toast('Project and configuration are required');return;}
  const btn=$('#invSubmit'); btn.disabled=true; btn.textContent=editingId?'Saving…':'Adding…';
  try{
    if(editingId){ await window.Inventory.update(editingId,d); toast('Unit updated'); }
    else{ await window.Inventory.add(d); toast('Unit added to inventory'); }
    resetForm(); await renderList($('#adminSearch').value);
  }catch(err){ toast('Could not save — check connection'); console.error(err); }
  btn.disabled=false; btn.textContent=editingId?'Update unit':'Add to inventory';
}

function startEdit(u){
  const f=$('#invForm');
  FIELDS.forEach(k=>{ if(f[k]!==undefined) f[k].value = u[k]!==undefined && u[k]!==null ? u[k] : ''; });
  f.type.value=window.invType(u);
  f.status.value=u.status||'ready';
  $('#projSel').value=(u.projectSlug && P.some(p=>p.slug===u.projectSlug))?u.projectSlug:'';
  editingId=u.id;
  $('#invSubmit').textContent='Update unit'; $('#invCancel').classList.remove('hide');
  window.scrollTo({top:0,behavior:'smooth'});
}
function cancelEdit(){ resetForm(); }
function resetForm(){
  $('#invForm').reset(); $('#projSel').value=''; editingId=null;
  $('#invSubmit').textContent='Add to inventory'; $('#invCancel').classList.add('hide');
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
    const tyLabel=window.invType(u)==='commercial'?'Commercial':'Residential';
    const line=[u.config, u.size?u.size+' sq.ft.':'', u.facing, u.floorUnit, u.price, u.possession].filter(Boolean).join(' · ');
    return `<div class="admin-row">
      <div style="min-width:0">
        <div><b>${u.project}</b> <span class="inv-pill ${meta.cls}" style="margin-left:6px">${meta.label}</span> <span class="meta" style="margin-left:4px">· ${tyLabel}</span></div>
        <div class="meta">${u.locality||u.city||''} — ${line}${u.units?' · '+u.units:''}</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button class="btn btn-ghost btn-sm" data-edit="${u.id}">Edit</button>
        <button class="btn btn-ghost btn-sm" data-del="${u.id}" style="color:var(--brand);border-color:#f0c9ce">Delete</button>
      </div>
    </div>`;
  }).join('');
  wrap.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',async()=>{
    const all=await window.Inventory.list(); const u=all.find(x=>String(x.id)===b.dataset.edit); if(u)startEdit(u);
  }));
  wrap.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',async()=>{
    if(!confirm('Delete this unit from inventory?'))return;
    b.disabled=true; if(editingId===b.dataset.del)resetForm();
    await window.Inventory.remove(b.dataset.del); toast('Unit removed'); renderList($('#adminSearch').value);
  }));
}
})();
