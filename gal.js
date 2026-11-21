(function () {
  'use strict';

  /* ---------- Mobile menu (only runs if the page has one) ---------- */
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.getElementById('nav');
  if (menuBtn && nav) {
    const closeMenu = () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    };
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        closeMenu();
        menuBtn.focus();
      }
    });
    // NEW: tap outside or on a link closes the menu
    document.addEventListener('click', e => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
    // NEW: reset when the screen grows back to desktop
    window.matchMedia('(min-width: 641px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
  }

  /* ---------- Placeholder links (href="#") do nothing ---------- */
  document.querySelectorAll('a[href="#"]').forEach(a => {
    a.addEventListener('click', e => e.preventDefault());
  });

  /* ---------- Images: lazy loading + broken-image handling ---------- */
  function markBroken(img) {
    img.classList.add('img-broken');
    const thumb = img.closest('.thumb');
    if (thumb) thumb.classList.add('is-broken');
  }

  document.querySelectorAll('main img').forEach(img => {
    const isTop = img.closest('.description');
    if (!isTop) {
      img.loading = 'lazy';
      img.decoding = 'async';
    }
    // smooth fade-in once each image has finished loading
    const ready = () => img.classList.add('is-loaded');
    img.addEventListener('load', ready);
    img.addEventListener('error', () => { markBroken(img); ready(); });
    if (img.complete) {
      if (img.naturalWidth === 0 && img.getAttribute('src')) markBroken(img);
      ready();
    }
  });

  /* ---------- Gallery lightbox ---------- */
  const gallery = document.getElementById('gallery');
  const lb = document.getElementById('lightbox');
  if (!gallery || !lb) return;

  const lbImg    = lb.querySelector('img');
  const btnClose = lb.querySelector('.lb-close');
  const btnPrev  = lb.querySelector('.lb-prev');
  const btnNext  = lb.querySelector('.lb-next');
  if (!lbImg || !btnClose || !btnPrev || !btnNext) return;

  const counter = document.createElement('div');
  counter.className = 'lb-count';
  counter.setAttribute('aria-live', 'polite');
  const spinner = document.createElement('div');
  spinner.className = 'lb-spinner';
  spinner.setAttribute('aria-hidden', 'true');
  lb.append(counter, spinner);

  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Photo gallery');

  const allThumbs = [...gallery.querySelectorAll('.thumb')];
  const getItems = () => allThumbs.filter(t => !t.classList.contains('is-broken'));

  allThumbs.forEach((t, i) => {
    const img = t.querySelector('img');
    t.type = 'button';
    t.setAttribute('aria-haspopup', 'dialog');
    t.setAttribute('aria-label',
      `Open photo ${i + 1} of ${allThumbs.length}${img && img.alt ? ': ' + img.alt : ''}`);
  });

  let items = [];
  let current = 0;
  let lastFocus = null;
  let closeTimer = 0;

  // NEW: optional data-full="big.jpg" on a thumb loads a larger image in the lightbox
  const srcOf = t => {
    const img = t && t.querySelector('img');
    return t && (t.dataset.full || (img && (img.currentSrc || img.src)));
  };

  function preload(i) {
    const s = srcOf(items[(i + items.length) % items.length]);
    if (s) new Image().src = s;
  }

  function doneLoading() {
    lb.classList.remove('is-loading');
    lbImg.classList.remove('loading');
  }

  function show(i) {
    if (!items.length) return;
    current = (i + items.length) % items.length;
    const thumbImg = items[current].querySelector('img');
    const src = srcOf(items[current]);
    if (!src) return;

    lbImg.onload = doneLoading;
    lbImg.onerror = doneLoading;
    if (lbImg.getAttribute('src') !== src) {
      lb.classList.add('is-loading');
      lbImg.classList.add('loading');
      lbImg.src = src;
      if (lbImg.complete) doneLoading();   // NEW: cached image -> no stuck spinner
    }
    lbImg.alt = (thumbImg && thumbImg.alt) || '';

    counter.textContent = `${current + 1} / ${items.length}`;
    const single = items.length < 2;
    btnPrev.hidden = btnNext.hidden = counter.hidden = single;

    if (!single) { preload(current + 1); preload(current - 1); }
  }

  // NEW: page behind the lightbox can't be tabbed into or read by screen readers
  const background = () => [...document.body.children].filter(el => el !== lb && el.tagName !== 'SCRIPT');
  const setBackground = on => background().forEach(el => on ? el.setAttribute('inert', '') : el.removeAttribute('inert'));

  function openLb(thumb) {
    items = getItems();
    const i = items.indexOf(thumb);
    if (i === -1) return;
    lastFocus = document.activeElement;

    // NEW: lock scroll without the page "jumping" when the scrollbar disappears
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = sbw > 0 ? sbw + 'px' : '';
    document.body.style.overflow = 'hidden';

    show(i);
    clearTimeout(closeTimer);
    lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add('is-open'));   // fade in
    setBackground(true);
    btnClose.focus();
  }

  function closeLb() {
    if (lb.hidden || !lb.classList.contains('is-open')) return;
    lb.classList.remove('is-open');                              // fade out, then hide
    setBackground(false);
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    closeTimer = setTimeout(() => {
      lb.hidden = true;
      lbImg.onload = lbImg.onerror = null;
      lbImg.removeAttribute('src');
      doneLoading();
    }, 220);
  }

  allThumbs.forEach(t => t.addEventListener('click', () => openLb(t)));
  btnClose.addEventListener('click', closeLb);
  btnPrev.addEventListener('click', () => show(current - 1));
  btnNext.addEventListener('click', () => show(current + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });

  // keyboard: Esc, arrows, Home/End, Tab stays inside the lightbox
  document.addEventListener('keydown', e => {
    if (lb.hidden || !lb.classList.contains('is-open')) return;
    const k = e.key;
    if (k === 'Escape')          { e.preventDefault(); closeLb(); }
    else if (k === 'ArrowLeft')  { e.preventDefault(); show(current - 1); }
    else if (k === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    else if (k === 'Home')       { e.preventDefault(); show(0); }
    else if (k === 'End')        { e.preventDefault(); show(items.length - 1); }
    else if (k === 'Tab') {
      const focusable = [btnClose, btnPrev, btnNext].filter(b => !b.hidden);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (!lb.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // swipe left/right = next/prev, swipe down = close (NEW)
  let startX = 0, startY = 0, multi = false;
  lb.addEventListener('touchstart', e => {
    multi = e.touches.length > 1;                 // ignore pinch-zoom gestures
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
  }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (multi) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (items.length > 1) show(dx < 0 ? current + 1 : current - 1);
    } else if (dy > 90 && dy > Math.abs(dx) * 1.5) {
      closeLb();
    }
  }, { passive: true });
})();


/* Keeps the corner filter perfectly sized and positioned above the footer,
   on every screen. Add before </body>:  <script src="album-fix.js" defer></script> */
(function () {
  'use strict';
  var root = document.documentElement;

  function measure() {
    var footer = document.querySelector('footer');
    var filter = document.querySelector('.filter');
    if (footer) root.style.setProperty('--footer-h', footer.offsetHeight + 'px');
    if (filter) root.style.setProperty('--filter-h', filter.offsetHeight + 'px');
  }

  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; measure(); });
  }

  measure();
  window.addEventListener('load', measure);
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);

  // re-measure when footer / filter change size (e.g. categories load later, fonts load)
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(schedule);
    ['footer', '.filter'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) ro.observe(el);
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
})();