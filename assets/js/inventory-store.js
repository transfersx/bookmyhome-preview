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
  'under-construction':{label:'Under Construction',cls:'uc'},
  'resale':{label:'Resale',cls:'resale'}
};

// seed (the examples you sent) — only used until you add/delete or connect the backend
const SEED=[
 {id:'seed_falcon', project:'Falcon View', projectSlug:'falcon-view', city:'Mohali', locality:'Sector 66A, Mohali',
  config:'3+1 BHK', size:'2480', facing:'Park facing', floorUnit:'', price:'₹3.15 Cr', paymentPlan:'', units:'Multiple units',
  status:'ready', possession:'Ready for possession', notes:'Call for best deal & inventory.', createdAt:1},
 {id:'seed_joygrand', project:'Joy Grand', projectSlug:'joy-grand', city:'Mohali', locality:'Sector 88, Mohali',
  config:'3+1 BHK', size:'3192', facing:'', floorUnit:'Tower I · Flat 1001', price:'₹8,000 / sq.ft.', paymentPlan:'25:25:25:25',
  units:'', status:'under-construction', possession:'Dec 2028', notes:'Fully loaded apartment.', createdAt:2},
 {id:'seed_herohomes', project:'Hero Homes', projectSlug:'hero-homes-mohali', city:'Mohali', locality:'Sector 88, Mohali',
  config:'4+1 BHK', size:'3490', facing:'', floorUnit:'', price:'', paymentPlan:'', units:'About 20–25 units',
  status:'under-construction', possession:'June 2029', notes:'Multiple inventory available.', createdAt:3}
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
  async remove(id){
    if(api()){
      await fetch(api(),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action:'delete',pin:window.INVENTORY_PIN,id})});
    }
    saveLocal(local().filter(x=>x.id!==id));
  }
};
})();
