/* partner page — Refer & Earn / Associate tabs + lead capture */
(function(){
const {$,$$,toast}=window.BMH;
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
function handle(formId,intent,msg){
  const f=$('#'+formId); if(!f)return;
  f.addEventListener('submit',e=>{
    e.preventDefault();
    const lead={...Object.fromEntries(new FormData(f)),intent,at:Date.now()};
    const leads=JSON.parse(localStorage.getItem('bmh_partners')||'[]');leads.push(lead);
    localStorage.setItem('bmh_partners',JSON.stringify(leads));
    f.reset();toast(msg);
  });
}
handle('referForm','referral','Thank you — our team will verify and reach out about your referral.');
handle('associateForm','associate','Thank you — our team will connect with you about the associate program.');
})();
