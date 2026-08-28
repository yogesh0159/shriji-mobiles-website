(function () {
  var catalog = window.SJ_MOBILE_CATALOG || [];
  var prices = window.SJ_MOBILE_PRICES || {};
  var grid = document.getElementById('mobile-catalog-grid');
  if (!grid) return;

  var search = document.getElementById('model-search');
  var count = document.getElementById('result-count');
  var empty = document.getElementById('catalog-empty');
  var reset = document.getElementById('catalog-reset');
  var activeBrand = 'all';

  function money(value) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  }

  function displayPrice(item) {
    var p = prices[item.slug];
    return p ? money(p) : '₹ Live Price';
  }

  function variantMarkup(variants, limit) {
    if (!variants || !variants.length) return '<span>Ask for variants</span>';
    var list = typeof limit === 'number' ? variants.slice(0, limit) : variants;
    var html = list.map(function(v){ return '<span>' + escapeHtml(v) + '</span>'; }).join('');
    if (typeof limit === 'number' && variants.length > limit) html += '<span>+' + (variants.length - limit) + ' more</span>';
    return html;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>'"]/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[c]; });
  }

  function getCoverImage(item) {
    return item.coverImage || item.fallbackImage || item.thumbImage || item.fullImage || '';
  }

  function getPosterImage(item) {
    return item.fullImage || item.thumbImage || item.fallbackImage || '';
  }

  function card(item, index) {
    var previewImage = getCoverImage(item);
    var badge = item.coverImage
      ? '<span class="real-photo-pill"><i class="fa-solid fa-circle-check"></i> Product image</span>'
      : '<span class="real-photo-pill fallback"><i class="fa-solid fa-mobile-screen"></i> Product preview</span>';
    return '<article class="mobile-product-card tilt-card" tabindex="0" data-slug="' + item.slug + '" data-brand="' + item.brand + '" style="--delay:' + ((index % 12) * 35) + 'ms">' +
      '<div class="mobile-card-glow"></div>' +
      '<div class="mobile-card-media"><img class="catalog-handset-image" src="' + previewImage + '" data-fallback="' + (item.thumbImage || item.fullImage || '') + '" alt="' + escapeHtml(item.model) + ' handset preview" loading="lazy" decoding="async">' + badge + '</div>' +
      '<div class="mobile-card-body"><div class="mobile-card-brand">' + escapeHtml(item.brandLabel) + '</div><h3>' + escapeHtml(item.model) + '</h3>' +
      '<div class="mobile-card-price"><strong>' + displayPrice(item) + '</strong><span>' + (prices[item.slug] ? 'Current listed price' : 'Ask today’s price') + '</span></div>' +
      '<div class="mobile-card-variants">' + variantMarkup(item.variants, 2) + '</div></div>' +
      '<div class="mobile-card-quick"><div><b>View model</b><span>Variants, price &amp; store benefits</span></div><button type="button">Details <i class="fa-solid fa-arrow-right"></i></button></div>' +
      '</article>';
  }

  function filteredItems() {
    var q = (search.value || '').trim().toLowerCase();
    return catalog.filter(function(item) {
      var brandOk = activeBrand === 'all' || (activeBrand === 'real' ? item.hasRealImage : item.brand === activeBrand);
      var text = (item.model + ' ' + item.brandLabel + ' ' + item.variants.join(' ')).toLowerCase();
      return brandOk && (!q || text.indexOf(q) !== -1);
    });
  }

  function render() {
    var items = filteredItems();
    grid.innerHTML = items.map(card).join('');
    count.textContent = items.length;
    empty.hidden = items.length !== 0;
    bindCards();
    if (window.SJReveal) window.SJReveal();
  }

  function bindCards() {
    grid.querySelectorAll('.mobile-product-card').forEach(function(cardEl) {
      var item = catalog.find(function(x){ return x.slug === cardEl.dataset.slug; });
      if (!item) return;
      var cardImg = cardEl.querySelector('.mobile-card-media img');
      if (cardImg) cardImg.addEventListener('error', function(){
        if (cardImg.dataset.fallback && cardImg.src.indexOf(cardImg.dataset.fallback) === -1) {
          cardImg.src = cardImg.dataset.fallback;
        }
      });
      cardEl.addEventListener('click', function(){ openModal(item); });
      cardEl.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(item); } });
      if (window.matchMedia('(pointer:fine)').matches) {
        cardEl.addEventListener('pointermove', function(e) {
          var r = cardEl.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          cardEl.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
          cardEl.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg');
          cardEl.style.setProperty('--mx', ((x + .5) * 100).toFixed(0) + '%');
          cardEl.style.setProperty('--my', ((y + .5) * 100).toFixed(0) + '%');
        });
        cardEl.addEventListener('pointerleave', function(){ cardEl.style.setProperty('--rx','0deg'); cardEl.style.setProperty('--ry','0deg'); });
      }
    });
  }

  var modal = document.getElementById('product-modal');
  var modalImageBack = document.getElementById('modal-image-back');
  var modalImageFront = document.getElementById('modal-image-front');
  var modalBrand = document.getElementById('modal-brand');
  var modalTitle = document.getElementById('product-modal-title');
  var modalPrice = document.getElementById('modal-price');
  var modalPriceNote = document.getElementById('modal-price-note');
  var modalVariants = document.getElementById('modal-variants');
  var modalFacts = document.getElementById('modal-facts');
  var modalWhatsApp = document.getElementById('modal-whatsapp');
  var modalPosterLink = document.getElementById('modal-poster-link');
  var modalRealBadge = document.getElementById('modal-real-badge');
  var lastFocus = null;

  function openModal(item) {
    lastFocus = document.activeElement;

    var coverImage = getCoverImage(item);
    var posterImage = getPosterImage(item);
    var stage = document.getElementById('modal-image-stage');

    if (item.coverImage) {
      // Real, detail-free product photo: show as a single clean animated hero
      // instead of the illustrated front+back fan effect used for SVG placeholders.
      if (stage) stage.classList.add('is-real-photo');
      modalImageBack.style.display = 'none';
      modalImageFront.onerror = function(){ modalImageFront.onerror = null; modalImageFront.src = item.thumbImage || item.fullImage || coverImage; };
      modalImageFront.src = coverImage;
      modalImageFront.alt = item.model + ' real handset photo';
    } else {
      if (stage) stage.classList.remove('is-real-photo');
      modalImageBack.style.display = '';
      [modalImageBack, modalImageFront].forEach(function(img) {
        if (!img) return;
        img.onerror = function(){ img.onerror = null; img.src = item.thumbImage || item.fullImage || coverImage; };
        img.src = coverImage;
        img.alt = item.model + ' handset image';
      });
    }

    modalBrand.textContent = item.brandLabel;
    modalTitle.textContent = item.model;
    var p = prices[item.slug];
    modalPrice.textContent = displayPrice(item);
    modalPriceNote.textContent = p ? ('Approx. EMI from ' + money(Math.ceil(p / 12)) + '/mo*') : 'Today’s best shop price on WhatsApp';
    modalVariants.innerHTML = variantMarkup(item.variants);
    modalRealBadge.style.display = item.hasRealImage ? 'inline-flex' : 'inline-flex';
    modalRealBadge.innerHTML = item.hasRealImage
      ? '<i class="fa-solid fa-circle-check"></i> Product image available'
      : '<i class="fa-solid fa-mobile-screen"></i> Product preview';
    modalFacts.innerHTML = '<div><span>Network</span><strong>' + escapeHtml(item.network) + '</strong></div>' +
      '<div><span>Variants</span><strong>' + item.variants.length + '</strong></div>' +
      '<div><span>Product view</span><strong>Front + back image</strong></div>' +
      '<div><span>Price status</span><strong>' + (p ? 'Listed' : 'Live quote') + '</strong></div>';
    var msg = 'Hi Shri Ji Mobiles, I want today\'s best price and stock details for ' + item.model + '. Available variants: ' + (item.variants.join(', ') || 'please share') + '.';
    modalWhatsApp.href = 'https://wa.me/919876543210?text=' + encodeURIComponent(msg);
    if (modalPosterLink) {
      modalPosterLink.href = posterImage;
      modalPosterLink.style.display = item.hasRealImage ? 'inline-flex' : 'none';
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    history.replaceState(null, '', 'mobiles.html?model=' + encodeURIComponent(item.slug));
    setTimeout(function(){ modal.querySelector('.modal-close').focus(); }, 30);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    history.replaceState(null, '', 'mobiles.html');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('[data-close-modal]').forEach(function(el){ el.addEventListener('click', closeModal); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });

  document.querySelectorAll('.catalog-filter').forEach(function(btn) {
    btn.addEventListener('click', function(){
      activeBrand = btn.dataset.brand;
      document.querySelectorAll('.catalog-filter').forEach(function(b){ b.classList.toggle('is-active', b === btn); });
      render();
    });
  });
  search.addEventListener('input', render);
  reset.addEventListener('click', function(){
    search.value = ''; activeBrand = 'all';
    document.querySelectorAll('.catalog-filter').forEach(function(b){ b.classList.toggle('is-active', b.dataset.brand === 'all'); });
    render(); search.focus();
  });
  document.addEventListener('keydown', function(e){ if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); search.focus(); } });

  render();
  var params = new URLSearchParams(location.search);
  var initial = params.get('model');
  if (initial) {
    var found = catalog.find(function(x){ return x.slug === initial; });
    if (found) setTimeout(function(){ openModal(found); }, 100);
  }
})();
