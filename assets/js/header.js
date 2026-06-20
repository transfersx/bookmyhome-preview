/* shared site header + mobile drawer — injected on every page for consistent nav */
(function(){
  const mount=document.getElementById('hdr');
  if(!mount)return;
  const params=new URLSearchParams(location.search);
  const path=location.pathname.split('/').pop();
  const cat=params.get('category')||'';
  // active states
  const onHomes   = (path==='listings.html' && cat!=='Commercial' && cat!=='Plots');
  const onPlots   = (path==='listings.html' && cat==='Plots');
  const onCom     = (path==='listings.html' && cat==='Commercial');
  const onMaps    = (path==='maps.html');
  const onExplore = (path==='explore.html');
  const onPartner = (path==='partner.html');
  const A=(c)=>c?' style="color:var(--brand)"':'';
  mount.innerHTML=`
  <header class="site-header">
    <div class="wrap nav">
      <a class="brand" href="index.html"><img src="assets/img/logo.jpg" alt="Book My Home"></a>
      <nav class="nav-links">
        <a href="explore.html"${A(onExplore)}>Explore</a>
        <a href="listings.html?category=Residential"${A(onHomes)}>Homes</a>
        <a href="listings.html?category=Plots"${A(onPlots)}>Plots</a>
        <a href="listings.html?category=Commercial"${A(onCom)}>Commercial</a>
        <a href="maps.html"${A(onMaps)}>Maps</a>
        <a href="partner.html"${A(onPartner)}>Partner</a>
      </nav>
      <div class="nav-actions">
        <a href="shortlist.html" class="icon-btn" aria-label="Shortlist">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>
          <span class="badge" data-shortlist-count style="display:none">0</span>
        </a>
        <a href="index.html#contact" class="btn btn-primary btn-sm hide-sm">Enquire</a>
        <button class="burger" id="burger" aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </div>
    </div>
  </header>
  <div class="drawer" id="drawer">
    <div class="drawer-bg" data-close></div>
    <div class="drawer-panel">
      <div class="drawer-top">
        <img src="assets/img/logo.jpg" alt="Book My Home" style="height:34px">
        <button class="icon-btn" data-close aria-label="Close">✕</button>
      </div>
      <a href="explore.html"><span>Explore by developer / sector</span></a>
      <a href="listings.html?category=Residential"><span>Homes</span></a>
      <a href="listings.html?category=Plots"><span>Plots</span></a>
      <a href="listings.html?category=Commercial"><span>Commercial · Invest</span></a>
      <a href="maps.html"><span>Maps &amp; plot layouts</span></a>
      <a href="partner.html"><span>Partner with us — Refer &amp; Earn</span></a>
      <a href="index.html#matcher" data-close><span>Find My Home</span></a>
      <a href="shortlist.html"><span>My Shortlist</span></a>
      <a href="compare.html"><span>Compare</span></a>
      <a href="index.html#contact" data-close><span>Contact</span></a>
      <a href="index.html#contact" class="btn btn-primary" style="margin-top:14px" data-close>Get a Callback</a>
    </div>
  </div>`;
})();
