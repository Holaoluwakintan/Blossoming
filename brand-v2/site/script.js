/* EDIT HERE: Blossom's WhatsApp number, international format, digits only (no +). */
var WHATSAPP_NUMBER = '2348148034092';
/* EDIT HERE: the Learn with Blossom community link (WhatsApp group or channel). PLACEHOLDER:
   leave empty until it exists; the "Get early access" button then opens a WhatsApp chat instead. */
var LEARN_COMMUNITY_URL = '';

(function () {
  var d = document.documentElement, w = window;
  d.classList.add('js');
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* links */
  $$('a[data-wa]').forEach(function (a) { a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + WHATSAPP_NUMBER); });
  if (LEARN_COMMUNITY_URL) $$('a[data-learn]').forEach(function (a) { a.href = LEARN_COMMUNITY_URL; });
  var y = document.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();

  /* menu */
  var btn = document.querySelector('.menu-btn');
  function setMenu(open) { d.classList.toggle('menu-open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
  if (btn) {
    btn.addEventListener('click', function () { setMenu(!d.classList.contains('menu-open')); });
    $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* split headlines into masked words */
  $$('[data-split]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map(function (t, i) { return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + t + '</span></span>'; }).join(' ');
  });
  /* scrub paragraph into words */
  var scrub = document.querySelector('[data-scrub]'), sw = [];
  if (scrub) {
    var hl = { 'businesses': 1, 'next': 1, 'generation': 1 };
    scrub.innerHTML = scrub.textContent.trim().split(/\s+/).map(function (t) {
      return '<span class="sw' + (hl[t.replace(/\W/g, '').toLowerCase()] ? ' hl' : '') + '">' + t + '</span>';
    }).join(' ');
    sw = $$('.sw', scrub);
  }

  /* hero load-in */
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    hero.classList.add('loaded'); var h1 = hero.querySelector('[data-split]'); if (h1) h1.classList.add('in');
  }); });

  /* hero video: lazy, skipped for reduced motion / data saver */
  var vid = document.querySelector('[data-hero-video]');
  var conn = navigator.connection || {};
  if (vid && !reduce && !conn.saveData && !/(^|-)2g$/.test(conn.effectiveType || '')) {
    var startVideo = function () {
      $$('source', vid).forEach(function (s) { s.src = s.getAttribute('data-src'); });
      vid.load();
      vid.addEventListener('playing', function () { vid.classList.add('ready'); }, { once: true });
      var p = vid.play(); if (p && p.catch) p.catch(function () {});
    };
    var go = function () { ('requestIdleCallback' in w) ? w.requestIdleCallback(startVideo, { timeout: 1500 }) : setTimeout(startVideo, 300); };
    if (document.readyState === 'complete') go(); else w.addEventListener('load', go, { once: true });
    document.addEventListener('visibilitychange', function () { if (!vid.src && !vid.currentSrc) return; if (document.hidden) vid.pause(); else if (heroOn) vid.play().catch(function () {}); });
  }

  /* reveals + counters */
  var reveals = $$('.reveal, [data-split]:not(.hero [data-split])');
  function countUp(el) {
    var end = +el.getAttribute('data-count'), suf = el.getAttribute('data-suffix') || '', t0 = null;
    if (reduce) { el.textContent = end + suf; return; }
    function step(t) { if (!t0) t0 = t; var k = Math.min((t - t0) / 1400, 1); k = 1 - Math.pow(1 - k, 4); el.textContent = Math.round(end * k) + suf; if (k < 1) requestAnimationFrame(step); }
    el.textContent = '0' + suf; requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in w) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
        $$('[data-count]', e.target).forEach(countUp); });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach(function (e) { io.observe(e); });
  } else reveals.forEach(function (e) { e.classList.add('in'); });

  /* scroll engine: one rAF per scroll, reads first then writes */
  var nav = document.getElementById('nav');
  var heroMedia = document.querySelector('[data-hero-media]'), heroContent = document.querySelector('[data-hero-content]');
  var pin = document.querySelector('[data-pin]');
  var svcs = $$('[data-svc]'), vis = $$('[data-vis]'), dots = $$('[data-dot]');
  var par = reduce ? [] : $$('[data-speed]');
  var grow = document.querySelector('[data-grow] .learn-frame');
  var vh = w.innerHeight, ticking = false, active = -1, heroOn = true, lastOn = -1;
  function setActive(i) {
    if (i === active) return; active = i;
    [svcs, vis, dots].forEach(function (list) { list.forEach(function (el, j) { el.classList.toggle('is-active', j === i); }); });
  }
  function frame() {
    ticking = false;
    var sy = w.pageYOffset;
    /* reads */
    var pr = pin ? pin.getBoundingClientRect() : null;
    var sr = scrub ? scrub.getBoundingClientRect() : null;
    var gr = grow ? grow.parentNode.getBoundingClientRect() : null;
    var pars = par.map(function (el) { var r = el.parentNode.getBoundingClientRect(); return (r.bottom > -100 && r.top < vh + 100) ? (r.top + r.height / 2 - vh / 2) : null; });
    /* writes */
    nav.classList.toggle('scrolled', sy > 40);
    if (heroMedia && !reduce) {
      var k = Math.min(sy / vh, 1);
      heroOn = k < 1;
      if (heroOn) {
        heroMedia.style.transform = 'translate3d(0,' + (sy * 0.35).toFixed(1) + 'px,0) scale(' + (1 + k * 0.08).toFixed(4) + ')';
        heroContent.style.transform = 'translate3d(0,' + (sy * -0.18).toFixed(1) + 'px,0)';
        heroContent.style.opacity = (1 - k * 1.6).toFixed(3);
      }
      if (vid && vid.currentSrc) { if (!heroOn && !vid.paused) vid.pause(); else if (heroOn && vid.paused && !document.hidden) vid.play().catch(function () {}); }
    }
    if (pr) {
      var total = pr.height - vh, p = Math.min(Math.max(-pr.top / total, 0), 0.9999);
      var n = svcs.length, idx = Math.floor(p * n);
      setActive(idx);
      dots.forEach(function (dt, j) { var q = Math.min(Math.max(p * n - j, 0), 1); dt.firstChild.style.setProperty('--p', q.toFixed(3)); });
    }
    if (sr && sw.length) {
      var sp = Math.min(Math.max((vh * 0.85 - sr.top) / (sr.height + vh * 0.35), 0), 1);
      var on = Math.round(sp * sw.length);
      if (on !== lastOn) { for (var i = 0; i < sw.length; i++) sw[i].classList.toggle('on', i < on); lastOn = on; }
    }
    if (gr && !reduce) {
      var gp = Math.min(Math.max((vh - gr.top) / (vh * 0.9), 0), 1);
      grow.style.setProperty('--g', (0.86 + gp * 0.14).toFixed(4));
    }
    pars.forEach(function (off, j) { if (off === null) return; var s = +par[j].getAttribute('data-speed');
      if (par[j].tagName === 'IMG') par[j].style.transform = 'translate3d(0,' + (off * s).toFixed(1) + 'px,0)';
      else par[j].style.setProperty('--py', (off * s).toFixed(1) + 'px'); });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  w.addEventListener('scroll', onScroll, { passive: true });
  w.addEventListener('resize', function () { vh = w.innerHeight; onScroll(); });
  frame();

  /* desktop-only niceties: magnetic buttons and 3D tilt */
  if (fine && !reduce) {
    $$('.magnetic').forEach(function (b) {
      var inner = b.firstElementChild;
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = 'translate(' + (x * 0.25).toFixed(1) + 'px,' + (y * 0.35).toFixed(1) + 'px)';
        if (inner) inner.style.transform = 'translate(' + (x * 0.12).toFixed(1) + 'px,' + (y * 0.15).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; if (inner) inner.style.transform = ''; });
    });
    $$('[data-tilt]').forEach(function (st) {
      var kids = $$('.laptop, .phone-float', st);
      st.addEventListener('pointermove', function (e) {
        var r = st.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        kids.forEach(function (k, i) { var m = i ? 1.6 : 1; k.style.setProperty('--ry', (x * 10 * m).toFixed(2) + 'deg'); k.style.setProperty('--rx', (-y * 8 * m).toFixed(2) + 'deg'); });
      });
      st.addEventListener('pointerleave', function () { kids.forEach(function (k) { k.style.setProperty('--ry', '0deg'); k.style.setProperty('--rx', '0deg'); }); });
    });
  }
})();
