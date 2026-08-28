(function(){
  var mobileStage=document.querySelector('.mobile-hero-stage');
  if(mobileStage && matchMedia('(pointer:fine)').matches){
    mobileStage.addEventListener('pointermove',function(e){
      var r=mobileStage.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      mobileStage.style.transform='rotateX('+(-y*3).toFixed(2)+'deg) rotateY('+(x*4).toFixed(2)+'deg)';
    });
    mobileStage.addEventListener('pointerleave',function(){mobileStage.style.transform='rotateX(0deg) rotateY(0deg)';});
  }

  var nav=document.querySelector('.electronics-nav-v2');
  if(nav && 'IntersectionObserver' in window){
    var links=[].slice.call(nav.querySelectorAll('a[href^="#"]'));
    var sections=links.map(function(a){return document.querySelector(a.getAttribute('href'));}).filter(Boolean);
    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          links.forEach(function(a){a.classList.toggle('is-active',a.getAttribute('href')==='#'+entry.target.id);});
        }
      });
    },{rootMargin:'-30% 0px -60% 0px',threshold:0});
    sections.forEach(function(s){observer.observe(s);});
  }
})();
