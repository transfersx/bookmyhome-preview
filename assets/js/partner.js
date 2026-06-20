/* partner page — Refer & Earn / Associate tabs + lead capture + WhatsApp delivery */
(function(){
const {$,$$,toast}=window.BMH;
const BIZ='919888268882';
function show(tab){
  $('#panel-refer').classList.toggle('hide',tab!=='refer');
  $('#panel-associate').classList.toggle('hide',tab!=='associate');
  $$('#tabToggle button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-tab]');
  if(t){show(t.dataset.tab);
    if(t.closest('.hero')){const tg=$('#tabToggle');tg&&tg.scrollIntoView({behavior:'smooth',block:'start'});}
  }
});
const LABELS={
  name:'Name',phone:'Mobile',client_name:'Client',client_phone:'Client mobile',
  requirement:'Requirement',location:'Preferred location',budget:'Budget',remarks:'Remarks',
  city:'City',profession:'Profession',experience:'Real-estate experience',interest:'Interested in',
  network:'Area of network',message:'Message'
};
function waMessage(title,data){
  let lines=['*'+title+'* (via website)',''];
  for(const [k,v] of Object.entries(data)){ if(v && String(v).trim()) lines.push(`${LABELS[k]||k}: ${v}`); }
  return encodeURIComponent(lines.join('\n'));
}
function handle(formId,intent,title,msg){
  const f=$('#'+formId); if(!f)return;
  f.addEventListener('submit',e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(f));
    // keep a local copy
    const leads=JSON.parse(localStorage.getItem('bmh_partners')||'[]');
    leads.push({...data,intent,at:Date.now()});
    localStorage.setItem('bmh_partners',JSON.stringify(leads));
    // deliver to the team on WhatsApp
    window.open(`https://wa.me/${BIZ}?text=${waMessage(title,data)}`,'_blank');
    f.reset();toast(msg);
  });
}
handle('referForm','referral','New referral','Opening WhatsApp to send your referral to our team…');
handle('associateForm','associate','New associate application','Opening WhatsApp to send your application…');
})();
