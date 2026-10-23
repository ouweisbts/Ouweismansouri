(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desktop = matchMedia('(min-width: 901px)');
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  // Without GSAP nothing must stay hidden.
  if (!hasGsap) {
    root.classList.remove('js', 'pt-in');
    document.querySelector('.loader')?.remove();
  }

  /* ---------- Split text into characters (keeps <em> etc.) ---------- */
  const splitChars = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const word = document.createElement('span'); word.className = 'word';
            [...part].forEach((ch) => { const s = document.createElement('span'); s.className = 'char'; s.textContent = ch; word.appendChild(s); });
            frag.appendChild(word);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(el);
    return el.querySelectorAll('.char');
  };
  const splitWords = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(el);
    return el.querySelectorAll('.w');
  };

  /* ---------- Clock & year ---------- */
  const fmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
  const clocks = document.querySelectorAll('[data-clock]');
  const tickClock = () => clocks.forEach((c) => { c.textContent = fmt.format(new Date()); });
  if (clocks.length) { tickClock(); setInterval(tickClock, 10000); }
  document.querySelectorAll('[data-year]').forEach((y) => { y.textContent = new Date().getFullYear(); });

  /* ---------- Copy e-mail ---------- */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const label = btn.textContent;
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(btn.dataset.copy); } catch { location.href = `mailto:${btn.dataset.copy}`; return; }
      btn.textContent = 'Adresse copiée ✓'; btn.classList.add('is-done');
      setTimeout(() => { btn.textContent = label; btn.classList.remove('is-done'); }, 2200);
    });
  });

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (hasGsap && !reduced && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToTarget = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else (typeof target === 'number' ? scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' }) : target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }));
  };
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const t = id === '#top' ? 0 : document.querySelector(id);
      if (t === null) return;
      e.preventDefault();
      setMenu(false);
      scrollToTarget(t);
    });
  });

  /* ---------- Header & menu ---------- */
  const header = document.querySelector('.header');
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.menu');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger?.setAttribute('aria-expanded', String(open));
    burger?.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    if (lenis) open ? lenis.stop() : lenis.start(); else body.style.overflow = open ? 'hidden' : '';
  }
  burger?.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    if (header && !menu?.classList.contains('is-open')) header.classList.toggle('is-hidden', y > lastY && y > innerHeight * .6);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Page transitions ---------- */
  const curtain = document.querySelector('.curtain');
  const isInternalPage = (a) => {
    if (!a.href || a.target === '_blank' || a.hasAttribute('download')) return false;
    const u = new URL(a.href, location.href);
    return u.origin === location.origin && u.pathname !== location.pathname && /\.html?$|\/$/.test(u.pathname) && !u.pathname.endsWith('.pdf');
  };
  if (hasGsap && curtain) {
    if (root.classList.contains('pt-in')) {
      gsap.set(curtain, { yPercent: 0 });
      gsap.set(curtain.querySelector('span'), { opacity: 1 });
      gsap.to(curtain, { yPercent: -100, duration: 1, ease: 'expo.inOut', delay: .15, onComplete: () => { root.classList.remove('pt-in'); gsap.set(curtain, { yPercent: 100 }); } });
    }
    document.querySelectorAll('a[href]').forEach((a) => {
      if (!isInternalPage(a)) return;
      a.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        try { sessionStorage.setItem('pt', '1'); } catch {}
        const span = curtain.querySelector('span');
        gsap.timeline({ onComplete: () => { location.href = a.href; } })
          .fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: .8, ease: 'expo.inOut' })
          .to(span, { opacity: 1, duration: .3 }, '-=.25');
      });
    });
    addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(curtain, { yPercent: 100 }); });
  }

  /* ---------- Cursor ---------- */
  if (fine && !reduced) {
    const cursor = document.querySelector('.cursor');
    if (cursor) {
      const dot = cursor.querySelector('.cursor__dot'), ring = cursor.querySelector('.cursor__ring'), label = cursor.querySelector('.cursor__label');
      let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
      cursor.classList.add('is-hidden');
      addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; cursor.classList.remove('is-hidden'); }, { passive: true });
      document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
      const loop = () => {
        rx += (mx - rx) * .16; ry += (my - ry) * .16;
        dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
        ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
        label.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
        requestAnimationFrame(loop);
      };
      loop();
      document.querySelectorAll('a, button, [data-cursor]').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          if (el.dataset.cursor) { label.textContent = el.dataset.cursor; cursor.classList.add('is-label'); }
          else cursor.classList.add('is-link');
        });
        el.addEventListener('mouseleave', () => cursor.classList.remove('is-link', 'is-label'));
      });
    }
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || .35;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength, y = (e.clientY - r.top - r.height / 2) * strength;
        if (hasGsap) gsap.to(el, { x, y, duration: .6, ease: 'power3.out' }); else el.style.transform = `translate(${x}px,${y}px)`;
      });
      el.addEventListener('mouseleave', () => { if (hasGsap) gsap.to(el, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1,.4)' }); else el.style.transform = ''; });
    });
  }

  if (!hasGsap) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Intro (home loader or page title) ---------- */
  const heroChars = [];
  document.querySelectorAll('[data-chars]').forEach((el) => heroChars.push(...splitChars(el)));
  gsap.set(heroChars, { yPercent: 115 });
  document.querySelectorAll('[data-chars]').forEach((el) => el.classList.add('is-split'));
  const introEls = document.querySelectorAll('[data-intro]');
  gsap.set(introEls, { opacity: 0, y: 24 });

  const playIntro = () => {
    const tl = gsap.timeline();
    tl.to(heroChars, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: .035 })
      .to(introEls, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .08 }, '-=1.1');
    return tl;
  };

  const loader = document.querySelector('.loader');
  let seen = false;
  try { seen = sessionStorage.getItem('om-loaded') === '1'; } catch {}
  if (loader && !reduced && !seen && !root.classList.contains('pt-in')) {
    const count = loader.querySelector('[data-count]');
    const bar = loader.querySelector('.loader__bar');
    const o = { v: 0 };
    lenis?.stop();
    gsap.timeline()
      .to(o, { v: 100, duration: 1.9, ease: 'power3.inOut', onUpdate: () => { count.textContent = String(Math.round(o.v)).padStart(3, '0'); } })
      .to(bar, { scaleX: 1, duration: 1.9, ease: 'power3.inOut' }, 0)
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '+=.1')
      .add(() => { loader.remove(); lenis?.start(); try { sessionStorage.setItem('om-loaded', '1'); } catch {} playIntro(); }, '-=.55');
  } else {
    loader?.remove();
    gsap.delayedCall(root.classList.contains('pt-in') ? .55 : .1, playIntro);
  }

  /* ---------- Hero scroll-out ---------- */
  const hero = document.querySelector('.hero');
  if (hero && !reduced) {
    gsap.to('.hero__inner', { yPercent: 18, opacity: .15, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- Generic reveals ---------- */
  ScrollTrigger.batch('.rv', {
    start: 'top 88%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: .08, overwrite: true }),
  });
  gsap.utils.toArray('.rv-img').forEach((el) => {
    gsap.to(el, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const amt = parseFloat(el.dataset.parallax) || 12;
    gsap.fromTo(el, { yPercent: -amt }, { yPercent: amt, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.utils.toArray('[data-split-lines]').forEach((el) => {
    // Keep the sentence readable for screen readers once it is cut into letters.
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    const chars = splitChars(el);
    const visual = document.createElement('span'); visual.setAttribute('aria-hidden', 'true');
    while (el.firstChild) visual.appendChild(el.firstChild);
    const sr = document.createElement('span'); sr.className = 'sr'; sr.textContent = text;
    el.append(sr, visual);
    gsap.set(chars, { yPercent: 115 });
    gsap.to(chars, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: .025, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  /* ---------- Manifesto: words light up ---------- */
  const mani = document.querySelector('[data-words]');
  if (mani) {
    const words = splitWords(mani);
    const section = mani.closest('section');
    const mm = gsap.matchMedia();
    const light = (p) => { const n = Math.round(p * words.length); words.forEach((w, i) => w.classList.toggle('on', i < n)); };
    mm.add('(min-width: 901px)', () => {
      ScrollTrigger.create({ trigger: section, start: 'top top', end: '+=120%', pin: true, scrub: true, onUpdate: (s) => light(s.progress * 1.05) });
    });
    mm.add('(max-width: 900px)', () => {
      ScrollTrigger.create({ trigger: mani, start: 'top 80%', end: 'bottom 45%', scrub: true, onUpdate: (s) => light(s.progress) });
    });
  }

  /* ---------- Stacked project cards ---------- */
  const cards = gsap.utils.toArray('.card');
  const mmCards = gsap.matchMedia();
  mmCards.add('(min-width: 901px)', () => {
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      gsap.to(card, { scale: .9, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 10%', scrub: true } });
      gsap.to(card.querySelector('.card__shade'), { opacity: .55, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 10%', scrub: true } });
    });
    cards.forEach((card) => {
      const b = card.querySelector('.browser');
      if (b) gsap.fromTo(b, { y: 80 }, { y: -10, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'top top', scrub: true } });
    });
  });

  /* ---------- Horizontal process ---------- */
  const track = document.querySelector('.process__track');
  if (track) {
    const mmP = gsap.matchMedia();
    mmP.add('(min-width: 901px)', () => {
      const dist = () => track.scrollWidth - innerWidth;
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.process__pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, invalidateOnRefresh: true },
      });
    });
  }

  /* ---------- Footer giant name ---------- */
  const giant = document.querySelector('.footer__giant');
  if (giant) gsap.fromTo(giant, { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: giant, start: 'top bottom', end: 'bottom bottom', scrub: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
