/* ==========================================================================
   Regnum Steak House : interactions
   Plain JS. GSAP + ScrollTrigger + Lenis (vendored) only add motion: without
   them, or with reduced motion, every section still reads and works.
   ========================================================================== */
(() => {
  const d = document, root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const BOOK_URL = 'https://bookings.zenchef.com/gtc?rid=358260&host=www.regnumsteakhouse.com';
  const NBSP = ' ';

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    if (!reduced && window.Lenis) {
      lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }
  const goTo = (el) => {
    if (lenis) lenis.scrollTo(el, { duration: 1.4 });
    else if (typeof el === 'number') scrollTo({ top: el, behavior: reduced ? 'auto' : 'smooth' });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };
  const lock = (on) => { if (lenis) on ? lenis.stop() : lenis.start(); d.body.style.overflow = on ? 'hidden' : ''; };
  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const el = id === '#top' ? 0 : id.length > 1 && $(id);
    if (el === null || el === false) return;
    e.preventDefault();
    goTo(el === 0 ? 0 : el);
  });

  /* ---------- Opening ---------- */
  const intro = $('.intro');
  const ready = () => root.classList.add('is-ready');
  if (intro && !root.classList.contains('no-intro') && !reduced) {
    try { sessionStorage.setItem('rg-intro', '1'); } catch (e) { /* private mode */ }
    lock(true);
    setTimeout(() => { intro.classList.add('is-out'); ready(); lock(false); }, 1500);
    setTimeout(() => intro.remove(), 2500);
  } else {
    if (intro) intro.remove();
    requestAnimationFrame(ready);
  }

  /* ---------- Videos: load when near, play when seen, pause when gone ---------- */
  const hero = $('.hero__video');
  if (hero) {
    const tall = innerHeight / innerWidth > 1.05;
    hero.poster = tall ? hero.dataset.posterTall : hero.dataset.posterWide;
    hero.dataset.src = tall ? hero.dataset.tall : hero.dataset.wide;
  }
  const play = (v) => { if (reduced) return; const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  const load = (v) => { if (v.dataset.src && !v.getAttribute('src')) { v.src = v.dataset.src; v.preload = 'auto'; } };
  const vio = new IntersectionObserver((entries) => entries.forEach(({ target: v, isIntersecting }) => {
    if (isIntersecting) { load(v); play(v); } else if (!v.paused) v.pause();
  }), { rootMargin: '200px 0px' });
  $$('video[data-src]').filter((v) => !v.closest('.feu__frame')).forEach((v) => vio.observe(v));

  /* ---------- Embers rising over the hero ---------- */
  const canvas = $('.hero__embers');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, on = true;
    const parts = [];
    const size = () => {
      const r = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * r; canvas.height = h * r; ctx.setTransform(r, 0, 0, r, 0, 0);
    };
    const spawn = (p, anywhere) => Object.assign(p, {
      x: Math.random() * w, y: anywhere ? Math.random() * h : h + Math.random() * 60,
      r: 0.6 + Math.random() * 1.7, vy: 0.35 + Math.random() * 1.05, vx: (Math.random() - 0.5) * 0.35,
      t: 0, life: 200 + Math.random() * 260, ph: Math.random() * 100,
    });
    size();
    for (let i = 0, n = innerWidth < 700 ? 24 : 50; i < n; i++) parts.push(spawn({}, true));
    const tick = () => {
      if (!on) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.t++; p.y -= p.vy; p.x += p.vx + Math.sin((p.t + p.ph) / 38) * 0.3;
        const k = p.t / p.life, a = Math.min(1, k * 5) * (1 - k);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(255,${190 - Math.round(70 * k)},90,${a})`);
        g.addColorStop(1, 'rgba(255,90,30,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.2832); ctx.fill();
        if (p.t > p.life || p.y < -20) spawn(p, false);
      }
      requestAnimationFrame(tick);
    };
    new IntersectionObserver(([e]) => { const was = on; on = e.isIntersecting; if (on && !was) requestAnimationFrame(tick); }).observe(canvas);
    addEventListener('resize', size);
    requestAnimationFrame(tick);
  }

  /* ---------- Header, menu, phone dock ---------- */
  const hd = $('[data-hd]'), burger = $('.hd__burger'), menu = $('#menu'), dock = $('.dock');
  const setMenu = (open) => {
    menu.hidden = !open;
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    hd.classList.remove('is-hidden');
    lock(open);
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('resize', () => { if (innerWidth > 1180 && !menu.hidden) setMenu(false); });

  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    hd.classList.toggle('is-solid', y > 40 || !menu.hidden);
    if (menu.hidden) {
      if (y > lastY + 4 && y > 500) hd.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 500) hd.classList.remove('is-hidden');
    }
    if (dock) dock.classList.toggle('is-on', y > innerHeight * 0.55);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // The menu link of the section on screen is underlined
  const links = $$('.hd__nav a');
  const navIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((a) => { const s = $(a.getAttribute('href')); if (s) navIO.observe(s); });

  /* ---------- Open or closed, live, on Paris time ---------- */
  const SLOTS = { 1: [[705, 870], [1125, 1350]], 2: [[705, 870], [1125, 1350]], 3: [[705, 870], [1125, 1350]], 4: [[705, 870], [1125, 1350]], 5: [[705, 1350]], 6: [[705, 1350]], 0: [[705, 1350]] };
  const hm = (m) => `${Math.floor(m / 60)}${NBSP}h${NBSP}${String(m % 60).padStart(2, '0')}`;
  const status = () => {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    const day = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    const today = SLOTS[day];
    const cur = today.find(([a, b]) => m >= a && m < b);
    let state, text;
    if (cur) {
      state = 'open';
      text = cur[1] - m <= 30 ? `Ferme bientôt${NBSP}· à ${hm(cur[1])}` : `Ouvert${NBSP}· jusqu'à ${hm(cur[1])}`;
    } else {
      state = 'closed';
      const next = today.find(([a]) => a > m);
      text = next ? `Fermé${NBSP}· ouvre à ${hm(next[0])}` : `Fermé${NBSP}· ouvre demain à ${hm(SLOTS[(day + 1) % 7][0][0])}`;
    }
    $$('[data-status]').forEach((el) => { el.dataset.state = state; $('[data-status-text]', el).textContent = text; });
    $$('.hours tr').forEach((tr) => tr.classList.toggle('is-today', Number(tr.dataset.day) === day));
  };
  status();
  setInterval(status, 60000);

  /* ---------- Reveals ---------- */
  const rio = new IntersectionObserver((entries) => {
    let i = 0;
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.style.transitionDelay = `${Math.min(i++ * 70, 350)}ms`;
      e.target.classList.add('is-in');
      rio.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal], .reveal-img, .grid li').forEach((el) => rio.observe(el));

  /* ---------- Manifesto: the words light up as you read ---------- */
  const mani = $('[data-manifesto]');
  if (mani) {
    const words = mani.textContent.trim().split(/\s+/);
    mani.innerHTML = words.map((w) => `<span class="w${/^feu\.?$/.test(w) ? ' w--feu' : ''}">${w}</span>`).join(' ');
    const spans = $$('.w', mani);
    const light = (p) => { const n = Math.round(p * spans.length); spans.forEach((s, i) => s.classList.toggle('is-lit', i < n)); };
    if (hasGsap && !reduced) {
      ScrollTrigger.create({ trigger: mani, start: 'top 82%', end: 'bottom 40%', scrub: true, onUpdate: (st) => light(st.progress) });
    } else light(1);
  }

  /* ---------- Le feu: three chapters, pinned on wide screens ---------- */
  const steps = $$('.feu__step'), frameVids = $$('.feu__frame video'), bar = $('.feu__bar i'), count = $('[data-feu-count]');
  let current = -1;
  const setStep = (i) => {
    if (i === current) return;
    current = i;
    steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
    frameVids.forEach((v, k) => {
      v.classList.toggle('is-on', k === i);
      if (k === i) { load(v); play(v); } else if (!v.paused) v.pause();
    });
    if (count) count.textContent = String(i + 1).padStart(2, '0');
  };
  if (hasGsap && !reduced) {
    gsap.matchMedia().add('(min-width: 1024px) and (hover: hover) and (pointer: fine)', () => {
      root.classList.add('feu-pinned');
      current = -1; setStep(0);
      frameVids.forEach(load);
      const st = ScrollTrigger.create({
        trigger: '.feu__pin', start: 'top top', end: '+=210%', pin: true, scrub: true,
        onUpdate: (self) => {
          setStep(Math.min(2, Math.floor(self.progress * 3)));
          if (bar) bar.style.transform = `scaleX(${self.progress})`;
        },
        onLeave: () => frameVids.forEach((v) => v.pause()),
        onLeaveBack: () => frameVids.forEach((v) => v.pause()),
        onEnter: () => play(frameVids[current]),
        onEnterBack: () => play(frameVids[current]),
      });
      return () => { st.kill(); root.classList.remove('feu-pinned'); frameVids.forEach((v) => v.pause()); };
    });

    // Gentle depth on a few pictures, and the hero video easing back as you leave it
    gsap.matchMedia().add('(min-width: 900px)', () => {
      gsap.to('.maison__b', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.maison__grid', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('.maison__c', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.maison__grid', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.to('.hero__video', { scale: 1.16, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__in', { yPercent: -12, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });
    addEventListener('load', () => ScrollTrigger.refresh());
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* ---------- La carte: tabs ---------- */
  const tabs = $$('.tabs__btn'), ink = $('.tabs__ink');
  const moveInk = (t) => { if (ink) { ink.style.width = `${t.offsetWidth}px`; ink.style.transform = `translateX(${t.offsetLeft}px)`; } };
  const selectTab = (t, focus) => {
    tabs.forEach((b) => {
      const on = b === t;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      $('#' + b.getAttribute('aria-controls')).hidden = !on;
    });
    $$('.carte__visual img').forEach((img) => img.classList.toggle('is-on', img.dataset.for === t.getAttribute('aria-controls')));
    moveInk(t);
    if (focus) t.focus();
    if (hasGsap) ScrollTrigger.refresh();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      selectTab(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
    });
  });
  if (tabs[0]) { moveInk(tabs[0]); addEventListener('resize', () => moveInk(tabs.find((t) => t.getAttribute('aria-selected') === 'true'))); }
  if (d.fonts && d.fonts.ready && tabs[0]) d.fonts.ready.then(() => moveInk(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));

  /* ---------- Galerie: filters and lightbox ---------- */
  const items = $$('[data-grid] li');
  $$('.filters button').forEach((b) => b.addEventListener('click', () => {
    $$('.filters button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const f = b.dataset.filter;
    items.forEach((li) => {
      const show = f === 'all' || li.dataset.cat === f;
      li.classList.toggle('is-out', !show);
      if (show) li.classList.add('is-in');
    });
    if (hasGsap) ScrollTrigger.refresh();
  }));

  const lb = $('[data-lightbox]'), lbImg = $('img', lb), lbCap = $('figcaption', lb);
  let lbList = [], lbIndex = 0, lbBack = null;
  const lbShow = (i) => {
    lbIndex = (i + lbList.length) % lbList.length;
    const btn = lbList[lbIndex], img = $('img', btn);
    lbImg.src = btn.dataset.full; lbImg.alt = img.alt; lbCap.textContent = img.alt;
  };
  const lbOpen = (btn) => {
    lbList = items.filter((li) => !li.classList.contains('is-out')).map((li) => $('.g', li));
    lbBack = btn; lb.hidden = false; lock(true);
    lbShow(lbList.indexOf(btn));
    $('[data-lb="close"]', lb).focus();
  };
  const lbClose = () => { lb.hidden = true; lock(false); if (lbBack) lbBack.focus(); };
  $$('.g').forEach((btn) => btn.addEventListener('click', () => lbOpen(btn)));
  lb.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lb]');
    if (b) { b.dataset.lb === 'close' ? lbClose() : lbShow(lbIndex + Number(b.dataset.lb)); }
    else if (e.target === lb) lbClose();
  });
  let tx = 0;
  lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) lbShow(lbIndex + (dx < 0 ? 1 : -1)); });

  /* ---------- Avis: arrows ---------- */
  const track = $('[data-avis-track]');
  $$('[data-avis]').forEach((b) => b.addEventListener('click', () => {
    const card = $('.quote', track);
    track.scrollBy({ left: Number(b.dataset.avis) * (card.offsetWidth + 18), behavior: reduced ? 'auto' : 'smooth' });
  }));

  /* ---------- Forms: demonstration only, nothing is sent ---------- */
  const OK = {
    priva: `Merci, c'est noté. Sur cette maquette, aucune demande n'est envoyée${NBSP}: une fois le site en ligne, elle arrivera directement au restaurant. En attendant, appelez le 06${NBSP}40${NBSP}34${NBSP}94${NBSP}76.`,
    contact: `Merci${NBSP}! Sur cette maquette, aucun message n'est envoyé${NBSP}: une fois le site en ligne, il arrivera directement au restaurant.`,
  };
  $$('[data-demo-form]').forEach((form) => form.addEventListener('submit', (e) => {
    e.preventDefault();
    let bad = null;
    $$('input, select, textarea', form).forEach((f) => {
      const wrong = (f.required && !f.value.trim()) || (f.type === 'email' && f.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
      f.closest('.f').classList.toggle('is-bad', wrong);
      if (wrong && !bad) bad = f;
    });
    if (bad) { bad.focus(); return; }
    const ok = $('.form__ok', form);
    ok.textContent = form.closest('#privatisation') ? OK.priva : OK.contact;
    ok.hidden = false;
    form.reset();
  }));
  $$('[data-demo-form] .f').forEach((f) => f.addEventListener('input', () => f.classList.remove('is-bad')));

  /* ---------- Map, loaded only on request (Google sets cookies) ---------- */
  const map = $('[data-map]');
  if (map) $('[data-map-load]', map).addEventListener('click', () => {
    const f = d.createElement('iframe');
    f.title = 'Plan d\'accès au Regnum Steak House';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.src = 'https://www.google.com/maps?q=Regnum+Steak+House,+2+Avenue+Eug%C3%A8ne+H%C3%A9naff,+69120+Vaulx-en-Velin&hl=fr&z=15&output=embed';
    map.appendChild(f);
    map.classList.add('is-live');
  });

  /* ---------- Newsletter: the restaurant's own Zenchef sign-up form ---------- */
  const modal = $('[data-modal]'), modalFrame = $('iframe', modal);
  let modalBack = null;
  const closeModal = () => { modal.hidden = true; lock(false); if (modalBack) modalBack.focus(); };
  $$('[data-news]').forEach((a) => a.addEventListener('click', (e) => {
    if (innerWidth < 600) return; // on phones the form opens in its own tab, easier to fill
    e.preventDefault();
    modalBack = a;
    if (!modalFrame.src) modalFrame.src = a.href;
    modal.hidden = false; lock(true);
    $('[data-modal-close]', modal).focus();
  }));
  $('[data-modal-close]', modal).addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  d.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!lb.hidden) lbClose();
      else if (!modal.hidden) closeModal();
      else if (!menu.hidden) setMenu(false);
    } else if (!lb.hidden && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) lbShow(lbIndex + (e.key === 'ArrowRight' ? 1 : -1));
  });

  /* ---------- Booking: the restaurant's Zenchef module ---------- */
  // Every "Réserver" link points to the Zenchef booking page, so a click always leads to booking.
  // Once the module has set up its booking window (an iframe from bookings.zenchef.com), it opens
  // that window over the page instead: the module listens for clicks on [data-zc-action] itself.
  const sdk = d.createElement('script');
  sdk.async = true; sdk.id = 'zenchef-sdk'; sdk.src = 'https://sdk.zenchef.com/v1/sdk.min.js';
  d.body.appendChild(sdk);
  const sdkWindow = () => $$('iframe').some((f) => /zc-iframe/i.test(f.className) || (f.src || '').includes('bookings.zenchef.com'));
  d.addEventListener('click', (e) => {
    const a = e.target.closest('.js-book');
    if (a && sdkWindow()) e.preventDefault();
  }, true);
  $$('.js-book').forEach((a) => { if (!a.getAttribute('href')) a.href = BOOK_URL; });

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
