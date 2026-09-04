/* Oliva Restaurant — front-end runtime (no framework).
   Handles hash routing between pages, the gallery lightbox, the three
   forms (reservation / contact / newsletter), scroll-reveal animations
   and hover styles. Ported from the original design's React logic. */
(function () {
  'use strict';

  var PAGES = ['home', 'menu', 'about', 'gallery', 'events', 'reviews', 'blog', 'contact', 'reserve'];
  var state = { page: 'home', lightbox: null, booked: false, sent: false, newsletterDone: false };

  function computeIf(cond) {
    if (cond.charAt(0) === 'p' && PAGES.indexOf(cond.slice(1).toLowerCase()) >= 0) {
      return state.page === cond.slice(1).toLowerCase();
    }
    switch (cond) {
      case 'hasLightbox':    return !!state.lightbox;
      case 'booked':         return state.booked;
      case 'sent':           return state.sent;
      case 'newsletterDone': return state.newsletterDone;
      default:               return true;
    }
  }

  function render() {
    var ifs = document.querySelectorAll('.dc-if');
    for (var i = 0; i < ifs.length; i++) {
      ifs[i].hidden = !computeIf(ifs[i].getAttribute('data-if'));
    }
    if (state.lightbox) {
      var img = document.querySelector('[data-lightbox-img]');
      var cap = document.querySelector('[data-lightbox-cap]');
      if (img) { img.src = state.lightbox.src; img.alt = state.lightbox.cap; }
      if (cap) { cap.textContent = state.lightbox.cap; }
    }
  }

  function go(page) {
    if (PAGES.indexOf(page) < 0) page = 'home';
    state.page = page;
    state.lightbox = null;
    try { history.replaceState(null, '', '#' + page); } catch (e) {}
    window.scrollTo(0, 0);
    render();
    setupReveal();
  }

  // ── click delegation: nav / lightbox open / close ──
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el || el.tagName === 'FORM') return;
    var a = el.getAttribute('data-action');
    if (a.indexOf('go') === 0 && a.length > 2) {
      e.preventDefault();
      go(a.slice(2).toLowerCase());
    } else if (a === 'lightbox') {
      e.preventDefault();
      state.lightbox = { src: el.getAttribute('data-lb-src'), cap: el.getAttribute('data-lb-cap') };
      render();
    } else if (a === 'closeLightbox') {
      e.preventDefault();
      state.lightbox = null;
      render();
    }
  });

  // ── form submissions ──
  document.addEventListener('submit', function (e) {
    var f = e.target.closest('form[data-action]');
    if (!f) return;
    e.preventDefault();
    var a = f.getAttribute('data-action');
    if (a === 'onBook') state.booked = true;
    else if (a === 'onContact') state.sent = true;
    else if (a === 'onNewsletter') state.newsletterDone = true;
    render();
  });

  // ── Escape closes the lightbox ──
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.lightbox) { state.lightbox = null; render(); }
  });

  // ── back/forward hash navigation ──
  window.addEventListener('hashchange', function () {
    var h = (location.hash || '').replace('#', '');
    if (PAGES.indexOf(h) >= 0 && h !== state.page) go(h);
  });

  // ── hover styles (style-hover attribute) ──
  var hovers = document.querySelectorAll('[style-hover]');
  for (var k = 0; k < hovers.length; k++) {
    (function (el) {
      var base = el.getAttribute('style') || '';
      var hov = el.getAttribute('style-hover') || '';
      var on = function () { el.setAttribute('style', base + ';' + hov); };
      var off = function () { el.setAttribute('style', base); };
      el.addEventListener('mouseenter', on);
      el.addEventListener('mouseleave', off);
      el.addEventListener('focus', on);
      el.addEventListener('blur', off);
    })(hovers[k]);
  }

  // ── scroll-reveal ──
  var io = null;
  function setupReveal() {
    if (!('IntersectionObserver' in window)) {
      var all = document.querySelectorAll('[data-reveal]');
      for (var i = 0; i < all.length; i++) all[i].setAttribute('data-reveal', 'in');
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.setAttribute('data-reveal', 'in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -10% 0px' });
    }
    requestAnimationFrame(function () {
      var els = document.querySelectorAll('[data-reveal]:not([data-reveal="in"])');
      for (var i = 0; i < els.length; i++) {
        var r = els[i].getBoundingClientRect();
        if (r.top < window.innerHeight) els[i].setAttribute('data-reveal', 'in');
        else io.observe(els[i]);
      }
    });
  }

  // ── init ──
  var hash = (location.hash || '').replace('#', '');
  if (PAGES.indexOf(hash) >= 0) state.page = hash;
  render();
  setupReveal();
})();
