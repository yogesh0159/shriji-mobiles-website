(function(){
  document.documentElement.classList.add('js-modern');
  var progress = document.querySelector('.scroll-progress span');
  if (!progress) {
    var bar = document.createElement('div'); bar.className='scroll-progress'; bar.innerHTML='<span></span>'; document.body.prepend(bar); progress=bar.firstElementChild;
  }
  function onScroll(){
    var max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? scrollY/max : 0) + ')';
    document.body.classList.toggle('has-scrolled', scrollY > 12);
  }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  function reveal(){
    var nodes = document.querySelectorAll('.reveal:not([data-reveal-bound])');
    // Local ZIP previews use file://. Keep every section visible there so hidden reveal
    // layers can never become invisible-but-clickable.
    if (location.protocol === 'file:' || !('IntersectionObserver' in window)) {
      nodes.forEach(function(n){ n.dataset.revealBound='1'; n.classList.add('is-visible'); });
      return;
    }
    var obs = new IntersectionObserver(function(entries){ entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-visible'); obs.unobserve(e.target); } }); }, {threshold:.04, rootMargin:'120px 0px 120px'});
    nodes.forEach(function(n){ n.dataset.revealBound='1'; obs.observe(n); });
    // Safety net for browsers/extensions that delay IntersectionObserver callbacks.
    setTimeout(function(){ nodes.forEach(function(n){ n.classList.add('is-visible'); }); }, 1400);
  }
  // Apply reveal behaviour across legacy pages too, not only the new catalogue.
  document.querySelectorAll('main section:not(.hero), .cat-card, .price-tag, .why-card, .review-card, .faq-item').forEach(function(el){ if(!el.classList.contains('reveal')) el.classList.add('reveal'); });
  window.SJReveal = reveal; reveal();

  // Home 3D stage follows the pointer subtly.
  var stage = document.querySelector('.phone-stage-3d');
  if (stage && matchMedia('(pointer:fine)').matches) {
    stage.addEventListener('pointermove', function(e){
      var r=stage.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      stage.style.setProperty('--stage-rx',(-y*7)+'deg'); stage.style.setProperty('--stage-ry',(x*9)+'deg');
    });
    stage.addEventListener('pointerleave', function(){ stage.style.setProperty('--stage-rx','0deg'); stage.style.setProperty('--stage-ry','0deg'); });
  }
})();


(function(){
  var orbit = document.querySelector('.catalog-orbit');
  if (orbit && matchMedia('(pointer:fine)').matches) {
    orbit.addEventListener('pointermove', function(e){
      var r=orbit.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      orbit.style.transform='rotateX(' + (-y*6).toFixed(2) + 'deg) rotateY(' + (x*8).toFixed(2) + 'deg)';
    });
    orbit.addEventListener('pointerleave', function(){ orbit.style.transform='rotateX(0deg) rotateY(0deg)'; });
  }
})();
