/* listings page — filters, search, sort */
(function(){
const {P,card,$,$$}=window.BMH;

const params=new URLSearchParams(location.search);
const state={
  q: params.get('q')||'',
  city: params.get('city')||'',
  bhk: params.get('bhk')?[+params.get('bhk')]:[],
  type: params.get('type')||'',
  status: params.get('status')||'',
  dev:'', sizeMax:5600, sort:'featured'
};

const uniq=(arr)=>[...new Set(arr)];
const cities=uniq(P.map(p=>p.city)).filter(Boolean);
const types=uniq(P.map(p=>p.type.split(' ')[0]));
const devs=uniq(P.map(p=>p.developer.split('(')[0].trim()));

/* build filter chips */
function chipRow(el, items, getActive, onClick, labelFn){
  el.innerHTML=items.map(it=>`<button class="chip ${getActive(it)?'active':''}" data-v="${it}">${labelFn?labelFn(it):it}</button>`).join('');
  el.querySelectorAll('.chip').forEach(b=>b.addEventListener('click',()=>{onClick(b.dataset.v);}));
}
function buildFilters(){
  chipRow($('#fCity'),['All',...cities],v=>v==='All'?!state.city:state.city===v,v=>{state.city=v==='All'?'':v;apply();});
  chipRow($('#fBhk'),[2,3,4,5],v=>state.bhk.includes(+v),v=>{v=+v;state.bhk.includes(v)?state.bhk=state.bhk.filter(x=>x!==v):state.bhk.push(v);apply();},v=>v+' BHK');
  chipRow($('#fType'),['All',...types],v=>v==='All'?!state.type:state.type===v,v=>{state.type=v==='All'?'':v;apply();});
  chipRow($('#fStatus'),['All','Ready','Under Construction','New Launch'],v=>{
    if(v==='All')return !state.status;return state.status&&v.toLowerCase().includes(state.status.toLowerCase().split(' ')[0]);
  },v=>{state.status=v==='All'?'':v;apply();});
  chipRow($('#fDev'),['All',...devs],v=>v==='All'?!state.dev:state.dev===v,v=>{state.dev=v==='All'?'':v;apply();});
}

/* match logic */
function match(p){
  if(state.q){
    const hay=(p.name+' '+p.developer+' '+p.location+' '+p.city+' '+p.configShort).toLowerCase();
    if(!hay.includes(state.q.toLowerCase()))return false;
  }
  if(state.city && p.city!==state.city)return false;
  if(state.bhk.length && !state.bhk.some(b=>p.bhk.includes(b)))return false;
  if(state.type && !p.type.toLowerCase().includes(state.type.toLowerCase()) &&
     !(state.type==='Penthouses' && /penthouse/i.test(p.configs.map(c=>c.type).join(' '))))return false;
  if(state.status){
    const s=state.status.toLowerCase();
    if(s.includes('ready') && !/ready/i.test(p.status))return false;
    if(s.includes('under') && !/under/i.test(p.status))return false;
    if(s.includes('new') && !/new/i.test(p.status))return false;
  }
  if(state.dev && p.developer.split('(')[0].trim()!==state.dev)return false;
  if(state.sizeMax<5600 && p.sizeMin && p.sizeMin>state.sizeMax)return false;
  return true;
}
function sortFn(a,b){
  switch(state.sort){
    case'size-asc':return (a.sizeMin||9e9)-(b.sizeMin||9e9);
    case'size-desc':return (b.sizeMax||0)-(a.sizeMax||0);
    case'name':return a.name.localeCompare(b.name);
    default:return (b.featured-a.featured)||a.name.localeCompare(b.name);
  }
}

function apply(){
  const list=P.filter(match).sort(sortFn);
  $('#resCount').textContent=list.length;
  const grid=$('#resGrid'),empty=$('#emptyState');
  if(list.length){grid.innerHTML=list.map(card).join('');grid.classList.remove('hide');empty.classList.add('hide');}
  else{grid.innerHTML='';grid.classList.add('hide');empty.classList.remove('hide');}
  // re-sync states
  const s=window.BMH.shortlist(),c=window.BMH.compare();
  $$('[data-fav]').forEach(b=>b.classList.toggle('on',s.includes(b.dataset.fav)));
  $$('[data-cmp]').forEach(b=>b.checked=c.includes(b.dataset.cmp));
  buildFilters();
  $$('.reveal').forEach(el=>el.classList.add('in'));
  // title
  let t='All properties in Tricity';
  if(state.city)t=`Homes in ${state.city}`;
  if(state.bhk.length)t=`${state.bhk.join(', ')} BHK homes`+(state.city?` · ${state.city}`:'');
  if(state.type)t=`${state.type} in Tricity`;
  $('#listTitle').textContent=t;
}

/* controls */
$('#searchInput').value=state.q;
$('#searchInput').addEventListener('input',e=>{state.q=e.target.value;apply();});
$('#sortSelect').addEventListener('change',e=>{state.sort=e.target.value;apply();});
$('#fSize').addEventListener('input',e=>{state.sizeMax=+e.target.value;$('#fSizeVal').textContent=(+e.target.value).toLocaleString('en-IN');apply();});
function clearAll(){state.q='';state.city='';state.bhk=[];state.type='';state.status='';state.dev='';state.sizeMax=5600;
  $('#searchInput').value='';$('#fSize').value=5600;$('#fSizeVal').textContent='5,600';apply();}
$('#clearFilters').addEventListener('click',clearAll);
$('#clearFilters2')&&$('#clearFilters2').addEventListener('click',clearAll);

/* mobile filters toggle */
$('#mobFilterBtn').addEventListener('click',()=>{
  $('#filterPanel').classList.toggle('show');
  $('#filterPanel').scrollIntoView({behavior:'smooth',block:'start'});
});

buildFilters();apply();
})();
