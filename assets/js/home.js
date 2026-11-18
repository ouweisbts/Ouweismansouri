(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (!hasGsap) root.classList.remove('js');

  $$('[data-year]').forEach((y) => { y.textContent = new Date().getFullYear(); });

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
  const goTo = (t) => { if (lenis) lenis.scrollTo(t, { offset: -10, duration: 1.3 }); else (typeof t === 'number' ? scrollTo({ top: t, behavior: reduced ? 'auto' : 'smooth' }) : t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })); };

  /* ---------- Nav & menu ---------- */
  const nav = $('[data-nav]'), burger = $('.burger'), menu = $('.menu');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    if (lenis) open ? lenis.stop() : lenis.start(); else document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); const t = id === '#top' ? 0 : $(id); if (t === null) return;
    e.preventDefault(); setMenu(false); goTo(t);
  }));
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 20);
    if (!menu.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > lastY && y > innerHeight * 0.8);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Copy e-mail ---------- */
  $$('[data-copy]').forEach((b) => {
    const label = b.textContent;
    b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(b.dataset.copy); } catch { location.href = 'mailto:' + b.dataset.copy; return; }
      b.textContent = 'Adresse copiée ✓'; b.classList.add('is-done');
      setTimeout(() => { b.textContent = label; b.classList.remove('is-done'); }, 2200);
    });
  });

  /* ---------- Cursor on project cards ---------- */
  if (fine && !reduced) {
    const cur = $('.cursor');
    addEventListener('pointermove', (e) => { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; }, { passive: true });
    $$('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => cur.classList.add('is-on'));
      el.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    });
    if (hasGsap) $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: 'power3.out' }); });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,.45)' }));
    });
  }

  if (!hasGsap) return;

  /* ---------- Intro ---------- */
  const tl = gsap.timeline({ delay: 0.15 });
  tl.to('[data-photo]', { opacity: 1, scale: 1, duration: 1.4, ease: 'expo.out' }, 0)
    .to('[data-line]', { y: 0, yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1 }, 0.1)
    .to('[data-in]', { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0.35);

  /* ---------- Reveals ---------- */
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });

  /* ---------- Counters ---------- */
  $$('[data-count]').forEach((el) => {
    const to = +el.dataset.count, pre = el.dataset.prefix || '', o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = pre + Math.round(o.v); } }) });
  });

  /* ---------- Gentle parallax on the hero photo ---------- */
  if (!reduced) {
    gsap.to('.hero__photo img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
