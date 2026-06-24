/* ============================================================
   Inventory data layer — works with localStorage by default,
   and with a Google Apps Script backend when window.INVENTORY_API is set.
   ============================================================ */
(function(){
"use strict";
const KEY='bmh_inventory';

// status meta
window.INV_STATUS={
  'ready':{label:'Ready to Move',cls:'ready'},
  'under-construction':{label:'Under Construction',cls:'uc'}
};
// residential vs commercial — explicit field, else inferred from the config/notes
window.invType=function(u){
  if(u && u.type) return u.type;
  return /(shop|commercial|sco|booth|office|showroom|retail|food\s*court|plaza)/i.test(((u&&u.config)||'')+' '+((u&&u.notes)||'')) ? 'commercial' : 'residential';
};

// seed inventory — shown to fresh visitors until you connect the Sheet backend
const SEED=[
 {id:'seed_falcon2', project:'Falcon View', projectSlug:'falcon-view', city:'Mohali', locality:'Sector 66A, Mohali (JLPL)',
  config:'4+1 BHK', size:'3008', facing:'Park facing', floorUnit:'', price:'₹4.10 Cr', paymentPlan:'', units:'',
  status:'ready', possession:'Ready to move', notes:'', createdAt:90},
 {id:'seed_falcon', project:'Falcon View', projectSlug:'falcon-view', city:'Mohali', locality:'Sector 66A, Mohali (JLPL)',
  config:'3+1 BHK', size:'2480', facing:'Park facing', floorUnit:'', price:'₹3.15 Cr', paymentPlan:'', units:'Multiple units',
  status:'ready', possession:'Ready to move', notes:'Call for best deal & inventory.', createdAt:89},
 {id:'seed_skygardens', project:'Sky Gardens', projectSlug:'', city:'Mohali', locality:'Sector 66A, Mohali (JLPL)',
  config:'2+1 BHK', size:'1431', facing:'', floorUnit:'Tower 3 · Flat 401', price:'₹1.30 Cr', paymentPlan:'', units:'',
  status:'ready', possession:'Ready to move', notes:'JLPL Sky Gardens.', createdAt:88},
 {id:'seed_galaxy', project:'Galaxy Heights', projectSlug:'galaxy-heights', city:'Mohali', locality:'Sector 66A, Mohali',
  config:'2 BHK', size:'1050', facing:'', floorUnit:'', price:'₹1.10 Cr', paymentPlan:'', units:'',
  status:'ready', possession:'Ready to move', notes:'', createdAt:87},
 {id:'seed_marbella', project:'Marbella Grand', projectSlug:'', city:'Mohali', locality:'Sector 82A, IT City, Mohali',
  config:'4+1 BHK', size:'3672', facing:'', floorUnit:'', price:'', paymentPlan:'', units:'',
  status:'ready', possession:'Ready to move', notes:'', createdAt:86},
 {id:'seed_citycenter2', project:'Mohali City Center-2', projectSlug:'', city:'Mohali', locality:'F-Block, Aerocity, Mohali',
  config:'Commercial shop · 8×31.6 ft', size:'', facing:'', floorUnit:'Ground floor', price:'₹65 Lakh', paymentPlan:'', units:'Shop available',
  status:'ready', possession:'Ready to move', notes:'Commercial inventory.', createdAt:85},
 {id:'seed_joygrand', project:'Joy Grand', projectSlug:'joy-grand', city:'Mohali', locality:'Sector 88, Mohali',
  config:'3+1 BHK', size:'3192', facing:'', floorUnit:'Tower I · Flat 1001', price:'₹8,000 / sq.ft.', paymentPlan:'25:25:25:25',
  units:'', status:'under-construction', possession:'Dec 2028', notes:'Fully loaded apartment.', createdAt:84},
 {id:'seed_herohomes', project:'Hero Homes', projectSlug:'hero-homes-mohali', city:'Mohali', locality:'Sector 88, Mohali',
  config:'4+1 BHK', size:'3490', facing:'', floorUnit:'', price:'', paymentPlan:'', units:'About 20–25 units',
  status:'under-construction', possession:'June 2029', notes:'Multiple inventory available.', createdAt:83},
 {id:'seed_horizon', project:'Horizon Belmond', projectSlug:'horizon-belmond', city:'Mohali', locality:'Sector 88, Mohali',
  config:'3+1 BHK', size:'2601', facing:'', floorUnit:'', price:'₹2 Cr', paymentPlan:'', units:'',
  status:'under-construction', possession:'', notes:'', createdAt:82}
];

function api(){ return (window.INVENTORY_API||'').trim(); }
function local(){
  const raw=localStorage.getItem(KEY);
  if(raw===null) return SEED.slice();
  try{ return JSON.parse(raw)||[]; }catch(e){ return []; }
}
function saveLocal(arr){ localStorage.setItem(KEY, JSON.stringify(arr)); }

window.Inventory={
  isLive(){ return !!api(); },
  async list(){
    if(api()){
      try{ const r=await fetch(api()+(api().includes('?')?'&':'?')+'action=list&_='+Date.now());
        const d=await r.json(); return (d.items||d||[]); }
      catch(e){ console.warn('inventory API read failed, using local',e); return local(); }
    }
    return local();
  },
  async add(item){
    item.id=item.id||('inv_'+Date.now().toString(36)+Math.floor(Math.random()*1e4));
    item.createdAt=Date.now();
    if(api()){
      await fetch(api(),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action:'add',pin:window.INVENTORY_PIN,item})});
    }
    const all=local(); all.unshift(item); saveLocal(all);
    return item;
  },
  async update(id,patch){
    if(api()){
      await fetch(api(),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action:'update',pin:window.INVENTORY_PIN,id,item:patch})});
    }
    saveLocal(local().map(x=>x.id===id?Object.assign({},x,patch,{id:id}):x));
  },
  async remove(id){
    if(api()){
      await fetch(api(),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action:'delete',pin:window.INVENTORY_PIN,id})});
    }
    saveLocal(local().filter(x=>x.id!==id));
  }
};
})();
