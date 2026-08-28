(function(){
  var stage=document.querySelector('.home-product-stage');
  if(stage && matchMedia('(pointer:fine)').matches){
    stage.addEventListener('pointermove',function(e){
      var r=stage.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      stage.style.transform='rotateX('+(-y*3.5).toFixed(2)+'deg) rotateY('+(x*4.5).toFixed(2)+'deg)';
    });
    stage.addEventListener('pointerleave',function(){stage.style.transform='rotateX(0deg) rotateY(0deg)';});
  }
})();
