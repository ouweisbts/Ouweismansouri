/* ==========================================================================
   La Casa Blanca by Ouweis — interactions
   Vanilla JS + GSAP/ScrollTrigger + Lenis (vendored). Everything degrades:
   without GSAP the page is fully readable, with reduced motion nothing moves.
   ========================================================================== */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  // Initial hidden states only apply when we can animate them back in.
  if (!hasGsap || reduced) root.classList.remove('anim');
  if (!hasGsap) document.querySelector('[data-loader]')?.classList.add('is-done');

  $$('[data-year]').forEach((y) => { y.textContent = new Date().getFullYear(); });

  /* ---------- Image slots: fallback image, then art-directed placeholder ---------- */
  const fail = (img) => {
    const fb = img.dataset.fallback;
    if (fb && !img.dataset.triedFallback) { img.dataset.triedFallback = '1'; img.src = fb; return; }
    img.closest('.media')?.classList.add('is-missing');
  };
  $$('img[data-slot]').forEach((img) => {
    img.addEventListener('error', () => fail(img));
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('loading') !== 'lazy') fail(img);
  });

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    if (!reduced && window.Lenis) {
      lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }
  const goTo = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else (typeof target === 'number' ? scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' }) : target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }));
  };

  /* ---------- Navigation & mobile menu ---------- */
  const nav = $('[data-nav]'), burger = $('.burger'), menu = $('#menu'), sticky = $('[data-sticky-cta]');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    updateSticky();
    if (lenis) open ? lenis.stop() : lenis.start(); else document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    if (a.dataset.occasion) setOccasion(a.dataset.occasion);
    setMenu(false);
    goTo(target);
  }));

  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    if (!menu.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > lastY && y > innerHeight * 0.9);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // The phone's sticky "Réserver" button steps aside while the booking form is on screen.
  let bookingVisible = false, heroCtaVisible = true;
  const updateSticky = () => sticky.classList.toggle('is-away', bookingVisible || heroCtaVisible || menu.classList.contains('is-open'));
  new IntersectionObserver(([entry]) => { bookingVisible = entry.isIntersecting; updateSticky(); }, { threshold: 0.15 }).observe($('#reserver'));
  new IntersectionObserver(([entry]) => { heroCtaVisible = entry.isIntersecting; updateSticky(); }).observe($('.hero__ctas'));

  /* ---------- Legal dialog ---------- */
  const legal = $('[data-legal]');
  $('[data-legal-open]').addEventListener('click', () => legal.showModal());
  $('[data-legal-close]').addEventListener('click', () => legal.close());
  legal.addEventListener('click', (e) => { if (e.target === legal) legal.close(); });

  /* ---------- Cursor & magnetic buttons (mouse / trackpad only) ---------- */
  if (fine && hasGsap && !reduced) {
    const cursor = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring');
    const dx = gsap.quickTo(dot, 'x', { duration: 0.12 }), dy = gsap.quickTo(dot, 'y', { duration: 0.12 });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
    addEventListener('pointermove', (e) => { cursor.classList.add('is-on'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
    document.addEventListener('pointerover', (e) => {
      const view = e.target.closest('[data-cursor-label]');
      const link = e.target.closest('a, button, .tab, label, select, input');
      cursor.classList.toggle('is-view', !!view);
      cursor.classList.toggle('is-link', !view && !!link);
    });
    $$('[data-magnetic]').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' }), my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.28); my((e.clientY - r.top - r.height / 2) * 0.4); });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  /* ---------- Hero: optional slow-motion video over the photograph ---------- */
  const heroMedia = $('[data-hero-media]');
  const videoSrc = heroMedia.dataset.video;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (videoSrc && !reduced && !saveData) {
    const v = document.createElement('video');
    Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: true, preload: 'auto' });
    v.className = 'hero__video';
    v.setAttribute('aria-hidden', 'true');
    v.src = videoSrc;
    v.addEventListener('canplay', () => { v.classList.add('is-ready'); v.play().catch(() => {}); }, { once: true });
    v.addEventListener('error', () => v.remove(), { once: true });
    heroMedia.querySelector('.media--hero').after(v);
  }

  /* ---------- Menu tabs (works with or without GSAP) ---------- */
  const tabs = $$('.tab'), bar = $('.tabs__bar');
  const moveBar = (tab) => { bar.style.width = tab.offsetWidth + 'px'; bar.style.transform = `translateX(${tab.offsetLeft}px)`; };
  let switching = false;
  const activate = (tab, focus) => {
    const current = $('.tab.is-active');
    if (tab === current || switching) return;
    const from = $('#' + current.getAttribute('aria-controls')), to = $('#' + tab.getAttribute('aria-controls'));
    current.classList.remove('is-active'); current.setAttribute('aria-selected', 'false'); current.tabIndex = -1;
    tab.classList.add('is-active'); tab.setAttribute('aria-selected', 'true'); tab.tabIndex = 0;
    if (focus) tab.focus();
    moveBar(tab);
    tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
    const show = () => {
      from.hidden = true; from.classList.remove('is-active');
      to.hidden = false; to.classList.add('is-active');
      if (hasGsap && !reduced) {
        gsap.fromTo(to.querySelector('.panel__visual'), { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 1, ease: 'expo.out' });
        gsap.fromTo(to.querySelectorAll('.panel__intro, .dish'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06 });
      }
      if (hasGsap) ScrollTrigger.refresh();
      switching = false;
    };
    if (hasGsap && !reduced) {
      switching = true;
      gsap.to(from, { opacity: 0, duration: 0.28, ease: 'power2.in', onComplete: () => { gsap.set(from, { opacity: 1 }); show(); } });
    } else show();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (e) => {
      const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      activate(tabs[(n + tabs.length) % tabs.length], true);
    });
  });
  const placeBar = () => moveBar($('.tab.is-active'));
  placeBar();
  addEventListener('resize', placeBar);
  document.fonts?.ready.then(placeBar);

  /* ---------- Reservation (front-end demo: nothing is sent or stored) ---------- */
  const form = $('[data-resa]');
  const guestsOut = $('[data-guests]'), guestsUnit = $('[data-guests-unit]');
  const daysEl = $('[data-days]'), slotsEl = $('[data-slots]'), summary = $('[data-summary]');
  const errorEl = $('[data-error]'), done = $('[data-done]'), occasionSelect = $('[data-occasion-select]');
  const state = { guests: 2, date: null, time: null };
  const MAX_GUESTS = 12;
  // Opening hours by weekday (0 = Sunday): lunch and dinner slots every 30 minutes.
  const range = (from, to) => { const out = []; for (let m = from; m <= to; m += 30) out.push(m); return out; };
  const HOURS = {
    0: { 'Déjeuner': range(12 * 60, 14 * 60) },
    1: null,
    2: { 'Dîner': range(19 * 60, 22 * 60) },
    3: { 'Dîner': range(19 * 60, 22 * 60) },
    4: { 'Dîner': range(19 * 60, 22 * 60) },
    5: { 'Déjeuner': range(12 * 60, 13 * 60 + 30), 'Dîner': range(19 * 60, 22 * 60 + 30) },
    6: { 'Déjeuner': range(12 * 60, 13 * 60 + 30), 'Dîner': range(19 * 60, 22 * 60 + 30) },
  };
  const fmtTime = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
  const fmtDay = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const short = (d, opt) => new Intl.DateTimeFormat('fr-FR', opt).format(d).replace('.', '');

  // Slots still bookable for a given day (today: at least one hour ahead).
  const slotsFor = (d) => {
    const groups = HOURS[d.getDay()];
    if (!groups) return null;
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const limit = now.getHours() * 60 + now.getMinutes() + 60;
    const out = {};
    Object.entries(groups).forEach(([name, list]) => {
      const ok = isToday ? list.filter((m) => m >= limit) : list;
      if (ok.length) out[name] = ok;
    });
    return Object.keys(out).length ? out : null;
  };

  const renderSummary = () => {
    const parts = [`${state.guests} ${state.guests > 1 ? 'personnes' : 'personne'}`];
    parts.push(state.date ? fmtDay.format(state.date) : 'choisissez une date');
    if (state.date) parts.push(state.time !== null ? fmtTime(state.time) : 'choisissez un horaire');
    summary.textContent = parts.join(' · ');
  };

  const renderSlots = () => {
    slotsEl.innerHTML = '';
    const groups = state.date && slotsFor(state.date);
    if (!groups) { slotsEl.innerHTML = '<p class="slots__hint">Choisissez d\'abord une date.</p>'; return; }
    Object.entries(groups).forEach(([name, list]) => {
      const g = document.createElement('div'); g.className = 'slots__group';
      g.innerHTML = `<p>${name}</p>`;
      const row = document.createElement('div'); row.className = 'slots__row';
      list.forEach((m) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'slot'; b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', String(state.time === m));
        b.textContent = fmtTime(m).replace(' h ', ':').replace(/^(\d):/, '0$1:');
        b.addEventListener('click', () => { state.time = m; $$('.slot', slotsEl).forEach((s) => s.setAttribute('aria-checked', String(s === b))); renderSummary(); errorEl.hidden = true; });
        row.append(b);
      });
      g.append(row); slotsEl.append(g);
    });
  };

  const renderDays = () => {
    daysEl.innerHTML = '';
    const start = new Date(); start.setHours(0, 0, 0, 0);
    for (let i = 0; i < 21; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const open = !!slotsFor(d);
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'day'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false');
      b.disabled = !open;
      b.setAttribute('aria-label', fmtDay.format(d) + (open ? '' : ', fermé'));
      b.innerHTML = `<small>${i === 0 ? 'Auj.' : short(d, { weekday: 'short' })}</small><b>${d.getDate()}</b><span>${short(d, { month: 'short' })}</span>`;
      b.addEventListener('click', () => {
        state.date = d; state.time = null;
        $$('.day', daysEl).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
        renderSlots(); renderSummary(); errorEl.hidden = true;
      });
      daysEl.append(b);
    }
  };

  const setGuests = (n) => {
    state.guests = Math.min(MAX_GUESTS, Math.max(1, n));
    guestsOut.textContent = state.guests;
    guestsUnit.textContent = state.guests > 1 ? 'personnes' : 'personne';
    $('[data-step="-1"]').disabled = state.guests === 1;
    $('[data-step="1"]').disabled = state.guests === MAX_GUESTS;
    renderSummary();
  };
  $$('[data-step]').forEach((b) => b.addEventListener('click', () => setGuests(state.guests + Number(b.dataset.step))));
  // A field marked as missing clears as soon as it is filled in.
  $$('.input input', form).forEach((i) => i.addEventListener('input', () => i.closest('.input').classList.toggle('is-invalid', false)));

  function setOccasion(value) {
    [...occasionSelect.options].forEach((o) => { if (o.text === value) occasionSelect.value = o.value; });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // demo only: nothing leaves the page
    const name = form.elements.name, phone = form.elements.phone;
    const problems = [];
    if (!state.date) problems.push('une date');
    if (state.date && state.time === null) problems.push('un horaire');
    const nameOk = name.value.trim().length >= 2;
    const phoneOk = phone.value.replace(/\D/g, '').length >= 10;
    name.closest('.input').classList.toggle('is-invalid', !nameOk);
    phone.closest('.input').classList.toggle('is-invalid', !phoneOk);
    if (!nameOk) problems.push('votre nom');
    if (!phoneOk) problems.push('un numéro de téléphone valide');
    if (problems.length) {
      errorEl.textContent = 'Il manque ' + problems.join(', ').replace(/, ([^,]*)$/, ' et $1') + '.';
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;
    $('[data-done-name]').textContent = name.value.trim().split(' ')[0];
    $('[data-done-text]').textContent = `Votre table pour ${state.guests} ${state.guests > 1 ? 'personnes' : 'personne'} est demandée pour le ${fmtDay.format(state.date)} à ${fmtTime(state.time).replace(' 00', '')}. Dans un vrai service, une confirmation vous serait envoyée par SMS.`;
    done.hidden = false;
    if (hasGsap && !reduced) gsap.fromTo(done, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' });
    done.focus();
  });
  $('[data-again]').addEventListener('click', () => {
    form.reset(); done.hidden = true;
    state.date = null; state.time = null;
    $$('.input', form).forEach((i) => i.classList.remove('is-invalid'));
    renderDays(); renderSlots(); setGuests(2);
  });
  renderDays(); setGuests(2);

  if (!hasGsap) return;

  /* ==========================================================================
     Motion (GSAP)
     ========================================================================== */
  // Headings: the whole block rises from behind a mask.
  $$('[data-split]').forEach((h) => {
    h.innerHTML = `<span class="ln"><span>${h.innerHTML}</span></span>`;
  });

  const heroIntro = () => {
    if (reduced) return;
    const tl = gsap.timeline();
    tl.to('.media--hero img', { scale: 1, duration: 2.6, ease: 'expo.out' }, 0)
      .to('[data-hero-line]', { y: 0, yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.12 }, 0.15)
      .to('[data-hero-in]', { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1 }, 0.45);
  };

  // Intro loader, once per visit.
  const loader = $('[data-loader]');
  let seen = false;
  try { seen = sessionStorage.getItem('cb-intro') === '1'; sessionStorage.setItem('cb-intro', '1'); } catch (e) { /* private mode */ }
  if (seen || reduced) { loader.classList.add('is-done'); heroIntro(); }
  else {
    if (lenis) lenis.stop();
    gsap.timeline({ onComplete: () => { loader.classList.add('is-done'); if (lenis) lenis.start(); } })
      .from('.loader__over', { opacity: 0, y: 12, duration: 0.8, ease: 'power3.out' })
      .from('.loader__name', { opacity: 0, y: 30, duration: 1, ease: 'expo.out' }, 0.15)
      .to('.loader__line', { scaleX: 1, duration: 0.9, ease: 'expo.inOut' }, 0.35)
      .from('.loader__by', { opacity: 0, duration: 0.6 }, 0.8)
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, 1.5)
      .add(heroIntro, 1.75);
  }

  if (reduced) return;

  // Scroll reveals.
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    onEnter: (els) => {
      const above = els.filter((e) => e.getBoundingClientRect().bottom < 0);
      if (above.length) gsap.set(above, { opacity: 1, y: 0 });
      gsap.to(els.filter((e) => !above.includes(e)), { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08, overwrite: true });
    },
  });
  $$('.h2 .ln > span').forEach((s) => {
    gsap.from(s, { yPercent: 105, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: s.closest('.h2'), start: 'top 88%', once: true } });
  });

  // Counters.
  $$('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count), o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); } }) });
  });

  // Parallax: manifesto frames drift at different speeds, the dining room glides inside its frame.
  $$('[data-speed]').forEach((el) => {
    gsap.to(el, { yPercent: Number(el.dataset.speed), ease: 'none', scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('[data-parallax]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: img.closest('.media'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  // Hero photograph sinks slightly as you leave it.
  gsap.to('.hero__media', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Gallery tiles open like a curtain.
  gsap.utils.toArray('.tile').forEach((t, i) => {
    gsap.from(t, { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.inOut', delay: (i % 3) * 0.08, scrollTrigger: { trigger: t, start: 'top 92%', once: true } });
  });

  // Giant footer name rises into place.
  gsap.fromTo('.footer__giant', { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.footer__bottom', start: 'top bottom', end: 'max', scrub: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
