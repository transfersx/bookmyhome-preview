/* shared footer injected on every page */
(function(){
  const el=document.getElementById('footer');
  if(!el)return;
  el.innerHTML=`<div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="brand" href="index.html"><img src="assets/img/logo.jpg" alt="Book My Home" style="height:40px;background:#fff;border-radius:8px;padding:4px 8px"></a>
        <p class="desc">A trusted Mohali real-estate firm helping families &amp; investors find the right home with ease — curated luxury residences across Mohali, New Chandigarh &amp; Zirakpur. Happiness begins now.</p>
      </div>
      <div>
        <h4>Explore</h4>
        <a href="listings.html">All properties</a>
        <a href="listings.html?status=Ready">Ready to move</a>
        <a href="listings.html?type=Penthouses">Luxury collection</a>
        <a href="compare.html">Compare homes</a>
        <a href="maps.html">Plot maps</a>
        <a href="partner.html">Partner &amp; Refer &amp; Earn</a>
        <a href="shortlist.html">My shortlist</a>
      </div>
      <div>
        <h4>Offices</h4>
        <a href="https://maps.google.com/?q=368 Block A Aerocity Mohali" target="_blank" rel="noopener" style="line-height:1.4">Head Office — #368, Block&nbsp;A,<br>Aerocity, Mohali 140306</a>
        <a href="https://maps.google.com/?q=Omaxe Clockton Market Phase 1 New Chandigarh" target="_blank" rel="noopener" style="line-height:1.4">New Chandigarh — SCO 103, Clockton<br>Market, Omaxe Phase&nbsp;1</a>
        <a href="https://maps.google.com/?q=Uptown Insignia PR7 Zirakpur" target="_blank" rel="noopener" style="line-height:1.4">Zirakpur — SCO 37, Uptown<br>Insignia, PR-7 Road</a>
      </div>
      <div>
        <h4>Get in touch</h4>
        <a href="tel:+919888268882">+91 98882 68882</a>
        <a href="tel:+919951355515">+91 99513 55515</a>
        <a href="mailto:bookmyhomemohali@gmail.com">bookmyhomemohali@gmail.com</a>
        <a href="https://wa.me/919888268882" target="_blank" rel="noopener">WhatsApp us</a>
        <div style="display:flex;gap:14px;margin-top:12px">
          <a href="https://instagram.com/bookmyhomemohali" target="_blank" rel="noopener" aria-label="Instagram" style="padding:0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
          </a>
          <a href="https://facebook.com/Bookmyhomechandigarh" target="_blank" rel="noopener" aria-label="Facebook" style="padding:0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z"/></svg>
          </a>
        </div>
      </div>
    </div>
    <div class="footer-bot">
      <span>© ${new Date().getFullYear()} Book My Home · Managing Director: Mr. Manish Arora</span>
      <span>Mohali · New Chandigarh · Zirakpur · Tricity</span>
    </div>
  </div>`;
})();
