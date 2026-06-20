/* maps page — plot layout maps: view + download */
(function(){
const M=window.MAPS||[];
const $=(s,e=document)=>e.querySelector(s), $$=(s,e=document)=>[...e.querySelectorAll(s)];
const grid=$('#mapsGrid');
if(grid)grid.innerHTML=M.map(m=>`
  <article class="card reveal in">
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

/* viewer */
const lb=$('#mapLb'),img=$('#mapLbImg'),cap=$('#mapLbCap');
let cur=null,pi=0;
function open(id){cur=M.find(x=>x.id===id);if(!cur)return;pi=0;render();lb.classList.add('open');}
function render(){img.src=cur.images[pi];cap.textContent=`${cur.title}${cur.images.length>1?` · sheet ${pi+1} of ${cur.images.length}`:''} — tap Download for full quality`;}
function nav(d){pi=(pi+d+cur.images.length)%cur.images.length;render();}
document.addEventListener('click',e=>{
  const v=e.target.closest('[data-view]'); if(v){open(v.dataset.view);}
  if(e.target.matches('[data-mlb-close]')||e.target===lb)lb.classList.remove('open');
  if(e.target.matches('[data-mlb-prev]'))nav(-1);
  if(e.target.matches('[data-mlb-next]'))nav(1);
});
document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;
  if(e.key==='Escape')lb.classList.remove('open');if(e.key==='ArrowLeft')nav(-1);if(e.key==='ArrowRight')nav(1);});
})();
