(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (!hasGsap) root.classList.remove('js');

  /* ================= Data ================= */
  const COLLECTIONS = [
    {
      key: 'ocean', name: 'Royal Océan', headline: 'La précision au-delà de l’horizon', price: 'À partir de 7 400 €',
      desc: 'Un chronographe né pour le large : cadran bleu soleillé, lunette tachymétrique et bracelet en alligator bleu nuit, pensé pour affronter les embruns.',
      specs: [['Mouvement', 'Chronographe automatique AH-07'], ['Réserve de marche', '48 heures'], ['Boîtier', 'Acier 904L, 42 mm'], ['Étanchéité', '100 mètres']],
      pal: { light: '#3B82F6', mid: '#0F172A', dark: '#020617' }, fx: 'bubbles',
    },
    {
      key: 'sahara', name: 'Héritage Sahara', headline: 'Intemporel comme le vent du désert', price: 'À partir de 18 900 €',
      desc: 'L’or jaune 18 carats patiné par le soleil, un cadran champagne à trois compteurs et un bracelet en nubuck cousu à la main dans notre atelier.',
      specs: [['Mouvement', 'Chronographe automatique AH-07'], ['Réserve de marche', '48 heures'], ['Boîtier', 'Or jaune 18 ct, 42 mm'], ['Étanchéité', '50 mètres']],
      pal: { light: '#FDE68A', mid: '#D4A017', dark: '#2D1B0E' }, fx: 'dust',
    },
    {
      key: 'rose', name: 'Élégance Rose', headline: 'Le luxe porté comme un bijou', price: 'À partir de 12 600 €',
      desc: 'Soixante diamants sertis à la main sur la lunette, un cadran rouge carmin aux reflets soleillés et des chiffres romains appliqués en or rose.',
      specs: [['Mouvement', 'Automatique AH-03'], ['Réserve de marche', '42 heures'], ['Boîtier', 'Or rose 18 ct, 36 mm'], ['Étanchéité', '30 mètres']],
      pal: { light: '#F9A8D4', mid: '#EC4899', dark: '#4A044E' }, fx: 'petals',
    },
    {
      key: 'noir', name: 'Noir Carmin', headline: 'Pour la passion et la puissance', price: 'À partir de 9 800 €',
      desc: 'Un cœur ouvert sur le balancier qui bat à 4 hertz, un cadran noir profond et une lunette sertie, portés sur un bracelet acier à maillons polis.',
      specs: [['Mouvement', 'Automatique cœur ouvert AH-05'], ['Réserve de marche', '52 heures'], ['Boîtier', 'Acier et diamants, 38 mm'], ['Étanchéité', '50 mètres']],
      pal: { light: '#FCA5A5', mid: '#991B1B', dark: '#1A0505' }, fx: 'embers',
    },
  ];
  const GALLERY = [
    ['detail-1', 'Cadran bleu soleillé', 'Royal Océan', 'Le soleillage est obtenu à la main, rayon par rayon, pour capter la lumière sous tous les angles.', 'ocean'],
    ['detail-2', 'Trois compteurs', 'Héritage Sahara', 'Chronographe, minutes et heures : trois compteurs bronze sur un cadran champagne grainé.', 'sahara'],
    ['detail-3', 'Soixante diamants', 'Élégance Rose', 'Chaque pierre est sertie à la main, puis contrôlée à la loupe ×10 avant l’assemblage.', 'rose'],
    ['detail-4', 'Cœur ouvert', 'Noir Carmin', 'Le balancier bat 28 800 fois par heure, visible à travers une ouverture à six heures.', 'noir'],
    ['detail-5', 'Né pour le large', 'Royal Océan', 'Couronne vissée et fond plein : étanche jusqu’à 100 mètres, testée une à une.', 'ocean'],
    ['detail-6', 'Nubuck cousu main', 'Héritage Sahara', 'Un cuir qui se patine avec le temps, cousu au point sellier dans notre atelier lyonnais.', 'sahara'],
  ];
  const bgFor = (p) => `radial-gradient(60% 70% at 50% 45%, ${p.mid}cc 0%, ${p.dark} 62%, #000 100%), radial-gradient(40% 40% at 50% 50%, ${p.light}33, transparent 70%)`;

  /* ================= Smooth scroll ================= */
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
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else (typeof target === 'number' ? scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' }) : target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }));
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id === '#') return;
    const t = id === '#top' ? 0 : $(id); if (t === null) return;
    e.preventDefault(); goTo(t);
  }));

  /* ================= Nav ================= */
  const nav = $('[data-nav]');
  const onScrollNav = () => nav.classList.toggle('is-glass', scrollY > 50);
  addEventListener('scroll', onScrollNav, { passive: true }); onScrollNav();

  /* ================= Particles (shared engine) ================= */
  function particles(canvas, getTheme, density = 1) {
    const ctx = canvas.getContext('2d'); let W, H, dpr, list = [], theme = getTheme(), visible = true;
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    const count = () => Math.round((W < 700 ? 34 : 80) * density);
    const spawn = (anywhere) => {
      const t = theme; const p = { x: Math.random() * W, y: anywhere ? Math.random() * H : (t.fx === 'petals' ? -20 : H + 20), r: Math.random(), a: Math.random() * Math.PI * 2, life: 0 };
      p.s = t.fx === 'petals' ? 3 + p.r * 6 : t.fx === 'bubbles' ? 1.5 + p.r * 4 : 0.6 + p.r * 2;
      p.vy = t.fx === 'petals' ? 0.35 + p.r * 0.6 : -(0.2 + p.r * (t.fx === 'embers' ? 0.9 : 0.5));
      p.vx = (Math.random() - 0.5) * 0.3; return p;
    };
    const reset = () => { list = Array.from({ length: count() }, () => spawn(true)); };
    reset();
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(canvas);
    const draw = () => {
      if (visible) {
        ctx.clearRect(0, 0, W, H);
        const t = theme; ctx.globalCompositeOperation = t.fx === 'petals' ? 'source-over' : 'lighter';
        list.forEach((p, i) => {
          p.life++; p.a += 0.02; p.x += p.vx + Math.sin(p.a) * (t.fx === 'petals' ? 0.6 : 0.25); p.y += p.vy;
          const tw = 0.55 + Math.sin(p.life * 0.05 + p.r * 10) * 0.35;
          if (t.fx === 'bubbles') { ctx.strokeStyle = `rgba(147,197,253,${0.35 * tw})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.stroke(); }
          else if (t.fx === 'petals') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = `rgba(249,168,212,${0.55 * tw})`; ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
          else {
            const c = t.fx === 'embers' ? '248,113,113' : '253,230,138';
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s * 4); g.addColorStop(0, `rgba(${c},${0.8 * tw})`); g.addColorStop(1, `rgba(${c},0)`);
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 4, 0, Math.PI * 2); ctx.fill();
          }
          if (p.y < -30 || p.y > H + 30 || p.x < -30 || p.x > W + 30) list[i] = spawn(false);
        });
      }
      if (!reduced) requestAnimationFrame(draw);
    };
    draw();
    return { set(t) { if (t.fx === theme.fx) return; theme = t; reset(); } };
  }

  /* ================= Hero ================= */
  particles($('[data-dust]'), () => ({ fx: 'dust' }), 0.7);
  const heroWatch = $('[data-hero-watch]');

  /* ================= Collections ================= */
  const stage = $('[data-col-stage]');
  const left = $('[data-col-left]'), right = $('[data-col-right]'), center = $('[data-col-center]');
  const bg = $('[data-col-bg]'), ghost = $('[data-col-ghost]'), numEl = $('[data-col-num]'), dots = $('[data-col-dots]');
  const leftHTML = (c) => `<div class="col__l"><h2 class="col__name">${c.name}</h2><p class="col__headline">${c.headline}</p><p class="col__price">${c.price}</p><a href="#contact" class="pill">Réserver un essayage</a></div>`;
  const rightHTML = (c) => `<div class="col__r"><p class="col__desc">${c.desc}</p><dl class="specs">${c.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div>`;
  const imgHTML = (c) => `<img src="assets/img/watch-${c.key}.webp" alt="Montre ${c.name}" decoding="async">`;
  dots.innerHTML = COLLECTIONS.map((c, i) => `<button role="tab" aria-label="${c.name}" aria-selected="${i === 0}" class="${i === 0 ? 'is-on' : ''}" data-i="${i}"></button>`).join('');
  // Preload collection images
  COLLECTIONS.forEach((c) => { const i = new Image(); i.src = `assets/img/watch-${c.key}.webp`; });

  const colFx = particles($('[data-particles]'), () => COLLECTIONS[0]);
  let active = -1;
  function showCollection(i, dir = 1) {
    if (i === active) return;
    const c = COLLECTIONS[i]; const first = active < 0; active = i;
    bg.style.background = bgFor(c.pal); colFx.set(c);
    ghost.textContent = c.name.split(' ')[0];
    numEl.textContent = String(i + 1).padStart(2, '0');
    $$('button', dots).forEach((b, k) => { b.classList.toggle('is-on', k === i); b.setAttribute('aria-selected', String(k === i)); });
    const swap = (box, html, isImg) => {
      const old = [...box.children];
      const wrap = document.createElement('div'); wrap.innerHTML = html; const el = wrap.firstElementChild; box.appendChild(el);
      if (!hasGsap || reduced) { old.forEach((o) => o.remove()); return; }
      if (isImg) {
        gsap.fromTo(el, { yPercent: first ? 0 : 100 * dir, opacity: 0, rotate: dir * 6 }, { yPercent: 0, opacity: 1, rotate: 0, duration: 1.3, ease: 'expo.out' });
        old.forEach((o) => gsap.to(o, { yPercent: -60 * dir, opacity: 0, rotate: -dir * 6, duration: 0.8, ease: 'power3.in', onComplete: () => o.remove() }));
      } else {
        el.style.position = 'relative';
        old.forEach((o) => { o.style.position = 'absolute'; o.style.inset = '0 0 auto 0'; gsap.to(o, { y: -40 * dir, opacity: 0, duration: 0.5, ease: 'power2.in', onComplete: () => o.remove() }); });
        gsap.fromTo(el.children, { y: 50 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.07, delay: first ? 0 : 0.25 });
      }
    };
    swap(left, leftHTML(c)); swap(right, rightHTML(c)); swap(center, imgHTML(c), true);
  }
  showCollection(0);

  // Mobile list
  $('[data-col-list]').innerHTML = COLLECTIONS.map((c, i) => `
    <article class="col-m" style="background:${bgFor(c.pal)}">
      <img class="col-m__img" src="assets/img/watch-${c.key}-sm.webp" alt="Montre ${c.name}" loading="lazy" data-m-img>
      <div class="col-m__body" data-m-body>
        <p class="col__num"><span>${String(i + 1).padStart(2, '0')}</span><i>/ 04</i></p>
        <h2 class="col__name">${c.name}</h2><p class="col__headline">${c.headline}</p>
        <p class="col__desc">${c.desc}</p>
        <dl class="specs">${c.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
        <p class="col__price" style="margin-top:24px">${c.price}</p>
        <a href="#contact" class="pill">Réserver un essayage</a>
      </div>
    </article>`).join('');
  $$('.col-m a[href="#contact"]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goTo($('#contact')); }));
  stage.addEventListener('click', (e) => { const a = e.target.closest('a[href="#contact"]'); if (a) { e.preventDefault(); goTo($('#contact')); } });

  /* ================= Gears (craftsmanship) ================= */
  const svg = $('[data-gears]');
  const gearPath = (teeth, rOut, rIn) => {
    const step = (Math.PI * 2) / teeth; let d = '';
    for (let i = 0; i < teeth; i++) {
      const a = i * step, pts = [[rIn, a], [rOut, a + step * 0.18], [rOut, a + step * 0.5], [rIn, a + step * 0.68]];
      pts.forEach(([r, t], k) => { d += `${i === 0 && k === 0 ? 'M' : 'L'}${(Math.cos(t) * r).toFixed(2)},${(Math.sin(t) * r).toFixed(2)}`; });
    }
    return d + 'Z';
  };
  const GEARS = [
    { x: 500, y: 500, t: 60, r: 260, sp: 1, col: 'rgba(245,158,11,.55)' },
    { x: 815, y: 330, t: 24, r: 104, sp: -2.5, col: 'rgba(255,255,255,.35)' },
    { x: 190, y: 700, t: 30, r: 130, sp: -2, col: 'rgba(255,255,255,.3)' },
    { x: 760, y: 780, t: 18, r: 78, sp: -3.33, col: 'rgba(245,158,11,.45)' },
    { x: 230, y: 250, t: 20, r: 86, sp: 3, col: 'rgba(245,158,11,.35)' },
  ];
  svg.innerHTML = GEARS.map((g, i) => `<g transform="translate(${g.x} ${g.y})"><g data-gear="${i}">
    <path d="${gearPath(g.t, g.r, g.r * 0.9)}" fill="none" stroke="${g.col}" stroke-width="1.4"/>
    <circle r="${g.r * 0.78}" fill="none" stroke="${g.col}" stroke-width=".8" stroke-dasharray="2 6"/>
    <circle r="${g.r * 0.16}" fill="none" stroke="${g.col}" stroke-width="1.2"/>
    ${Array.from({ length: 5 }, (_, k) => { const a = (k / 5) * Math.PI * 2; return `<line x1="${Math.cos(a) * g.r * 0.18}" y1="${Math.sin(a) * g.r * 0.18}" x2="${Math.cos(a) * g.r * 0.76}" y2="${Math.sin(a) * g.r * 0.76}" stroke="${g.col}" stroke-width="1"/>`; }).join('')}
    <circle r="${g.r * 0.05}" fill="${g.col}"/></g></g>`).join('');
  const gearEls = $$('[data-gear]', svg);
  if (!reduced) { let rot = 0; const spin = () => { rot += 0.08; gearEls.forEach((el, i) => el.setAttribute('transform', `rotate(${(rot * GEARS[i].sp).toFixed(2)})`)); requestAnimationFrame(spin); }; spin(); }

  /* ================= Gallery ================= */
  const track = $('[data-gallery-track]');
  track.innerHTML = GALLERY.map(([img, title, col, , key], i) => {
    const p = COLLECTIONS.find((c) => c.key === key).pal;
    return `<figure class="g-item" data-g="${i}" tabindex="0" role="button" aria-label="Agrandir : ${title}">
      <div class="g-item__bg" style="background:radial-gradient(70% 60% at 50% 40%, ${p.mid}aa, ${p.dark} 75%)"></div>
      <img src="assets/img/${img}.webp" alt="${title}, collection ${col}" loading="lazy">
      <figcaption><b>${title}</b><span>${col}</span></figcaption></figure>`;
  }).join('');
  const modal = $('[data-modal]'), mImg = $('[data-modal-img]'); let mIdx = 0;
  const openModal = (i) => {
    mIdx = (i + GALLERY.length) % GALLERY.length; const [img, title, col, text] = GALLERY[mIdx];
    mImg.src = `assets/img/${img}.webp`; mImg.alt = title;
    $('[data-modal-title]').textContent = `${title} · ${col}`; $('[data-modal-text]').textContent = text;
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); lenis?.stop();
  };
  const closeModal = () => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); lenis?.start(); };
  $$('.g-item', track).forEach((el) => {
    el.addEventListener('click', () => openModal(+el.dataset.g));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(+el.dataset.g); } });
  });
  $('[data-modal-close]').addEventListener('click', closeModal);
  $('[data-modal-prev]').addEventListener('click', () => openModal(mIdx - 1));
  $('[data-modal-next]').addEventListener('click', () => openModal(mIdx + 1));
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal(); if (e.key === 'ArrowLeft') openModal(mIdx - 1); if (e.key === 'ArrowRight') openModal(mIdx + 1);
  });

  /* ================= Contact form ================= */
  const form = $('[data-form]'), msg = $('[data-form-msg]');
  form.addEventListener('submit', (e) => {
    e.preventDefault(); let ok = true;
    $$('input, select', form).forEach((f) => { const bad = f.required && !f.checkValidity(); f.closest('.field').classList.toggle('is-error', bad); if (bad) ok = false; });
    if (!ok) { msg.textContent = 'Merci de compléter votre nom, un e-mail valide et une boutique.'; return; }
    const name = form.elements.name.value.trim().split(' ')[0], b = form.elements.boutique.value;
    msg.textContent = `Merci ${name}. Notre boutique de ${b} vous recontacte sous 48 heures. (Prototype : aucune demande n'est envoyée.)`;
    form.reset();
  });

  /* ================= Cursor ================= */
  if (hasGsap && fine && !reduced) {
    const cur = $('.cursor'); const xTo = gsap.quickTo(cur, 'x', { duration: 0.45, ease: 'power3' }), yTo = gsap.quickTo(cur, 'y', { duration: 0.45, ease: 'power3' });
    addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); cur.classList.add('is-on'); }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    document.addEventListener('pointerover', (e) => cur.classList.toggle('is-big', !!e.target.closest('a, button, .g-item, select, input')));
  }

  if (!hasGsap) return;

  /* ================= Animations ================= */
  // Hero intro
  gsap.to('[data-hero-line]', { y: 0, yPercent: 0, duration: 1.6, ease: 'expo.out', stagger: 0.12, delay: 0.2 });
  gsap.fromTo('[data-hero-in]', { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: 0.15, delay: 0.5 });
  gsap.fromTo(heroWatch, { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 0.62, duration: 2.6, ease: 'expo.out' });
  if (!reduced) {
    gsap.to('[data-hero]', { scale: 0.85, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    if (fine) {
      const hx = gsap.quickTo(heroWatch, 'x', { duration: 1.2, ease: 'power3' }), hy = gsap.quickTo(heroWatch, 'y', { duration: 1.2, ease: 'power3' });
      addEventListener('pointermove', (e) => { hx((e.clientX / innerWidth - 0.5) * -30); hy((e.clientY / innerHeight - 0.5) * -20); }, { passive: true });
    }
  }

  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    // Collections: pinned, progress -> active collection
    const st = ScrollTrigger.create({
      trigger: stage, start: 'top top', end: () => '+=' + innerHeight * 3, pin: true, anticipatePin: 1,
      onUpdate: (self) => { const i = Math.min(COLLECTIONS.length - 1, Math.floor(self.progress * COLLECTIONS.length * 0.999)); if (i !== active) showCollection(i, i > active ? 1 : -1); },
    });
    const onDot = (e) => { const b = e.target.closest('button'); if (!b) return; const i = +b.dataset.i; goTo(st.start + (st.end - st.start) * ((i + 0.5) / COLLECTIONS.length)); };
    dots.addEventListener('click', onDot);
    // Gallery velocity skew (desktop)
    const skew = gsap.quickSetter('.g-item', 'skewX', 'deg'); const clamp = gsap.utils.clamp(-15, 15); const proxy = { s: 0 };
    ScrollTrigger.create({ trigger: '.gallery', start: 'top bottom', end: 'bottom top', onUpdate: (self) => { const s = clamp(self.getVelocity() / -300); if (Math.abs(s) > Math.abs(proxy.s)) { proxy.s = s; gsap.to(proxy, { s: 0, duration: 0.8, ease: 'power3', overwrite: true, onUpdate: () => skew(proxy.s) }); } } });
    return () => { dots.removeEventListener('click', onDot); };
  });
  mm.add('(max-width: 900px)', () => {
    $$('.col-m').forEach((el) => {
      gsap.fromTo(el.querySelector('[data-m-img]'), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 75%' } });
      gsap.fromTo(el.querySelector('[data-m-body]').children, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 55%' } });
    });
  });

  // Gallery: horizontal pinned scroll (all sizes)
  const gTrack = $('[data-gallery-track]');
  const dist = () => Math.max(0, gTrack.scrollWidth - innerWidth);
  gsap.to(gTrack, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '[data-gallery-pin]', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } });

  // Heritage
  gsap.to('.heritage__media', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.heritage', start: 'top 70%' } });
  if (!reduced) gsap.fromTo('[data-heritage-img]', { yPercent: -10 }, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.heritage', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('[data-st]', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.heritage__copy', start: 'top 75%' } });

  // Craftsmanship
  if (!reduced) gsap.fromTo('[data-craft-bg]', { scale: 1, yPercent: 0 }, { scale: 1.3, yPercent: 20, ease: 'none', scrollTrigger: { trigger: '.craft', start: 'top bottom', end: 'bottom top', scrub: true } });
  const cc = $('[data-craft-copy]');
  gsap.fromTo(cc, { opacity: 0, y: 60 }, { opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: '.craft', start: 'top 60%', end: 'top 10%', scrub: true } });
  gsap.to(cc, { opacity: 0, y: -60, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.craft', start: 'bottom 80%', end: 'bottom 30%', scrub: true } });

  // Contact fade-ins
  $$('[data-fade]').forEach((el) => gsap.fromTo(el, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 75%' } }));

  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
