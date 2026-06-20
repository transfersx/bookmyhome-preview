/* listings page — filters, search, sort */
(function(){
const {P,card,$,$$}=window.BMH;

const params=new URLSearchParams(location.search);
const state={
  q: params.get('q')||'',
  category: params.get('category')||'',
  city: params.get('city')||'',
  bhk: params.get('bhk')?[+params.get('bhk')]:[],
  type: params.get('type')||'',
  ctype: params.get('ctype')||'',
  status: params.get('status')||'',
  dev:'', sizeMax:5600, sort:'featured'
};

const uniq=(arr)=>[...new Set(arr)];
const cities=uniq(P.map(p=>p.city)).filter(Boolean);
const types=uniq(P.filter(p=>p.category!=='Commercial').map(p=>p.type.split(' ')[0]));
const ctypes=uniq(P.filter(p=>p.category==='Commercial').map(p=>p.commercialType)).filter(Boolean);
const devs=uniq(P.map(p=>p.developer.split('(')[0].trim())).filter(Boolean);

/* build filter chips */
function chipRow(el, items, getActive, onClick, labelFn){
  el.innerHTML=items.map(it=>`<button class="chip ${getActive(it)?'active':''}" data-v="${it}">${labelFn?labelFn(it):it}</button>`).join('');
  el.querySelectorAll('.chip').forEach(b=>b.addEventListener('click',()=>{onClick(b.dataset.v);}));
}
function buildFilters(){
  const com=state.category==='Commercial';
  const plots=state.category==='Plots';
  // category toggle active state + show/hide relevant groups
  $$('#catToggle button').forEach(b=>b.classList.toggle('active',(b.dataset.cat||'')===state.category));
  $('#gBhk')&&$('#gBhk').classList.toggle('hide',com||plots);
  $('#gType')&&$('#gType').classList.toggle('hide',com);
  $('#gCtype')&&$('#gCtype').classList.toggle('hide',!com);
  $('#plotsBanner')&&$('#plotsBanner').classList.toggle('hide',!plots);
  chipRow($('#fCity'),['All',...cities],v=>v==='All'?!state.city:state.city===v,v=>{state.city=v==='All'?'':v;apply();});
  chipRow($('#fBhk'),[2,3,4,5],v=>state.bhk.includes(+v),v=>{v=+v;state.bhk.includes(v)?state.bhk=state.bhk.filter(x=>x!==v):state.bhk.push(v);apply();},v=>v+' BHK');
  chipRow($('#fType'),['All',...types],v=>v==='All'?!state.type:state.type===v,v=>{state.type=v==='All'?'':v;apply();});
  if($('#fCtype'))chipRow($('#fCtype'),['All',...ctypes],v=>v==='All'?!state.ctype:state.ctype===v,v=>{state.ctype=v==='All'?'':v;apply();});
  chipRow($('#fStatus'),['All','Ready','Under Construction','New Launch'],v=>{
    if(v==='All')return !state.status;return state.status&&v.toLowerCase().includes(state.status.toLowerCase().split(' ')[0]);
  },v=>{state.status=v==='All'?'':v;apply();});
  chipRow($('#fDev'),['All',...devs],v=>v==='All'?!state.dev:state.dev===v,v=>{state.dev=v==='All'?'':v;apply();});
}
function setCategory(c){
  state.category=c;
  // clear category-specific filters when switching
  state.bhk=[]; state.type=''; state.ctype='';
  apply();
}

/* match logic — st defaults to the live state, but can be a relaxed clone */
function match(p,st){
  st=st||state;
  if(st.q){
    const hay=(p.name+' '+p.developer+' '+p.location+' '+p.city+' '+p.configShort).toLowerCase();
    if(!hay.includes(st.q.toLowerCase()))return false;
  }
  if(st.category && p.category!==st.category)return false;
  if(st.ctype && p.commercialType!==st.ctype)return false;
  if(st.city && p.city!==st.city)return false;
  if(st.bhk.length && !st.bhk.some(b=>p.bhk.includes(b)))return false;
  if(st.type && !p.type.toLowerCase().includes(st.type.toLowerCase()) &&
     !(st.type==='Penthouses' && /penthouse/i.test(p.configs.map(c=>c.type).join(' '))))return false;
  if(st.status){
    const s=st.status.toLowerCase();
    if(s.includes('ready') && !/ready/i.test(p.status))return false;
    if(s.includes('under') && !/under/i.test(p.status))return false;
    if(s.includes('new') && !/new/i.test(p.status))return false;
  }
  if(st.dev && p.developer.split('(')[0].trim()!==st.dev)return false;
  if(st.sizeMax<5600 && p.sizeMin && p.sizeMin>st.sizeMax)return false;
  return true;
}
/* never dead-end: progressively drop the least-essential filters until something matches */
function closest(){
  const drops=['status','sizeMax','ctype','type','dev','bhk'];
  const st={...state};
  for(const f of drops){
    if(f==='sizeMax')st.sizeMax=5600; else if(f==='bhk')st.bhk=[]; else st[f]='';
    const l=P.filter(p=>match(p,st)).sort(sortFn);
    if(l.length)return {list:l, relaxed:f};
  }
  return {list:P.slice().sort(sortFn), relaxed:'all'};
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
  const list=P.filter(p=>match(p)).sort(sortFn);
  const grid=$('#resGrid'),empty=$('#emptyState'),note=$('#relaxNote');
  if(list.length){
    $('#resCount').textContent=list.length;
    grid.innerHTML=list.map(card).join('');grid.classList.remove('hide');empty.classList.add('hide');
    if(note)note.classList.add('hide');
  }else{
    // no exact matches — show the closest instead of a dead end
    const {list:near}=closest();
    $('#resCount').textContent=near.length;
    grid.innerHTML=near.map(card).join('');grid.classList.remove('hide');empty.classList.add('hide');
    if(note)note.classList.remove('hide');
  }
  // re-sync states
  const s=window.BMH.shortlist(),c=window.BMH.compare();
  $$('[data-fav]').forEach(b=>b.classList.toggle('on',s.includes(b.dataset.fav)));
  $$('[data-cmp]').forEach(b=>b.checked=c.includes(b.dataset.cmp));
  buildFilters();
  $$('.reveal').forEach(el=>el.classList.add('in'));
  // title
  const where=state.city||'Tricity';
  let t='All properties in Tricity';
  if(state.category==='Commercial')t=`Commercial in ${where}`+(state.ctype?` · ${state.ctype}`:'');
  else if(state.category==='Residential')t=`Homes in ${where}`;
  else if(state.city)t=`Properties in ${state.city}`;
  if(state.category!=='Commercial'&&state.bhk.length)t=`${state.bhk.join(', ')} BHK homes`+(state.city?` · ${state.city}`:'');
  $('#listTitle').textContent=t;
}

/* controls */
$('#searchInput').value=state.q;
$('#searchInput').addEventListener('input',e=>{state.q=e.target.value;apply();});
$('#sortSelect').addEventListener('change',e=>{state.sort=e.target.value;apply();});
$('#fSize').addEventListener('input',e=>{state.sizeMax=+e.target.value;$('#fSizeVal').textContent=(+e.target.value).toLocaleString('en-IN');apply();});
function clearAll(){state.q='';state.category='';state.city='';state.bhk=[];state.type='';state.ctype='';state.status='';state.dev='';state.sizeMax=5600;
  $('#searchInput').value='';$('#fSize').value=5600;$('#fSizeVal').textContent='5,600';apply();}
$('#clearFilters').addEventListener('click',clearAll);
$('#clearFilters2')&&$('#clearFilters2').addEventListener('click',clearAll);
$$('#catToggle button').forEach(b=>b.addEventListener('click',()=>setCategory(b.dataset.cat||'')));

/* mobile filters toggle */
$('#mobFilterBtn').addEventListener('click',()=>{
  $('#filterPanel').classList.toggle('show');
  $('#filterPanel').scrollIntoView({behavior:'smooth',block:'start'});
});

buildFilters();apply();
})();
