(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(min-width: 981px)');
  const MENU = window.ANAS_MENU || [];
  const euro = (v) => (Number.isInteger(v) ? v : v.toFixed(2).replace('.', ',')) + (Number.isInteger(v) ? ' €' : ' €');
  const money = (v) => v.toFixed(2).replace('.', ',') + ' €';

  /* ---------- Delivery zones (anasfood.fr, novembre 2026) ---------- */
  const ZONES = [
    { c: 'Vaulx-en-Velin village', cp: '69120', min: 10, fee: 3, t: '15–45' },
    { c: 'Vaulx-en-Velin Sud', cp: '69120', min: 20, fee: 5, t: '15–45' },
    { c: 'Décines-Charpieu', cp: '69150', min: 20, fee: 5, t: '15–45' },
    { c: 'Villeurbanne', cp: '69100', min: 30, fee: 10, t: '15–45' },
    { c: 'Bron', cp: '69500', min: 30, fee: 10, t: '15–45' },
    { c: 'Meyzieu', cp: '69330', min: 30, fee: 10, t: '15–45' },
    { c: 'Miribel', cp: '01700', min: 30, fee: 10, t: '15–45' },
    { c: 'Caluire-et-Cuire', cp: '69300', min: 40, fee: 10, t: '15–45' },
    { c: 'Rillieux-la-Pape', cp: '69140', min: 40, fee: 10, t: '30–45' },
    { c: 'Neuville-sur-Saône', cp: '69250', min: 50, fee: 10, t: '15–45' },
  ];

  const findItem = (name) => { for (const c of MENU) for (const it of c.items) if (it.n === name) return it; return null; };

  /* ---------- Toast ---------- */
  const toast = $('[data-toast]'); let toastT;
  const say = (msg) => { toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('is-on'), 2200); };

  /* ---------- Embers ---------- */
  const cv = $('.embers');
  if (cv && !reduced) {
    const ctx = cv.getContext('2d'); let W, H, dpr; const parts = [];
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    const spawn = (y) => ({ x: Math.random() * W, y: y ?? H + 10, r: Math.random() * 2.2 + .6, vy: Math.random() * .9 + .35, vx: (Math.random() - .5) * .4, life: 0, max: Math.random() * 420 + 260, w: Math.random() * Math.PI * 2 });
    const N = W < 700 ? 45 : 90;
    for (let i = 0; i < N; i++) parts.push(spawn(Math.random() * H));
    let visible = true; new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(cv);
    const tick = () => {
      if (visible) {
        ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
        parts.forEach((p, i) => {
          p.life++; p.w += .04; p.y -= p.vy; p.x += p.vx + Math.sin(p.w) * .35;
          const k = 1 - p.life / p.max, a = Math.max(0, k) * (.55 + Math.sin(p.life * .2) * .25);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          g.addColorStop(0, `rgba(255,${150 + (p.r * 30 | 0)},60,${a})`); g.addColorStop(1, 'rgba(255,90,20,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2); ctx.fill();
          if (p.life > p.max || p.y < -20) parts[i] = spawn();
        });
      }
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* ---------- Hero slider ---------- */
  const SLIDES = [
    { w: 'KING', n: 'Le King', p: '6,50 € · menu 9,50 €' },
    { w: 'TACOS', n: 'Tacos Le Anas', p: '9 € · menu 12 €' },
    { w: 'PIZZA', n: 'Pizza Anas', p: 'dès 9 € · jusqu’à 50 cm' },
    { w: 'ROULÉ', n: 'Maxi Roulé', p: '13 € · menu 16 €' },
  ];
  const prods = $$('.hero__product'), tabs = $$('.slide-tab'), word = $('[data-hero-word]'), sticker = $('[data-sticker]');
  let cur = 0, timer;
  const show = (i) => {
    cur = (i + SLIDES.length) % SLIDES.length;
    prods.forEach((p, k) => p.classList.toggle('is-on', k === cur));
    tabs.forEach((t, k) => { t.classList.toggle('is-on', k === cur); t.setAttribute('aria-selected', String(k === cur)); });
    word.classList.add('is-out');
    setTimeout(() => { word.textContent = SLIDES[cur].w; word.classList.remove('is-out'); }, 280);
    $('[data-sticker-name]').textContent = SLIDES[cur].n; $('[data-sticker-price]').textContent = SLIDES[cur].p;
    sticker.classList.remove('pop'); void sticker.offsetWidth; sticker.classList.add('pop');
    clearTimeout(timer); if (!reduced) timer = setTimeout(() => show(cur + 1), 4500);
  };
  tabs.forEach((t) => t.addEventListener('click', () => show(+t.dataset.go)));
  if (!reduced) timer = setTimeout(() => show(1), 4500);

  const stage = $('[data-tilt]');
  if (stage && matchMedia('(hover: hover)').matches && !reduced) {
    addEventListener('pointermove', (e) => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      stage.style.setProperty('--ry', `${x * 14}deg`); stage.style.setProperty('--rx', `${-y * 10}deg`);
      $$('.hero__orbit').forEach((o, k) => { o.style.transform = `translate(${x * (k + 1) * -22}px, ${y * (k + 1) * -18}px)`; });
    }, { passive: true });
  }

  /* ---------- Signatures: horizontal scroll ---------- */
  const sig = $('#signatures'), track = $('[data-sig-track]');
  const panels = $$('.sig__panel'), sigImgs = $$('.sig__img'), sigIdx = $('[data-sig-index]'), sigBar = $('[data-sig-bar]');
  const onSig = () => {
    if (!desktop.matches) { track.style.transform = ''; sigImgs.forEach((im) => { im.style.transform = ''; }); return; }
    const r = sig.getBoundingClientRect(), total = sig.offsetHeight - innerHeight;
    const p = Math.min(Math.max(-r.top / total, 0), 1);
    const x = p * (panels.length - 1);
    track.style.transform = `translate3d(${-x * innerWidth}px,0,0)`;
    sigImgs.forEach((im, i) => { const d = x - i; im.style.transform = `translateX(${d * -18}vw) rotate(${d * -28}deg) scale(${1 - Math.min(Math.abs(d), 1) * .25})`; });
    sigIdx.textContent = String(Math.min(Math.round(x) + 1, panels.length)).padStart(2, '0');
    sigBar.style.width = `${p * 100}%`;
  };

  /* ---------- Quelle faim ? ---------- */
  const COMBOS = [
    { n: 'Le petit creux', d: 'Le classique qui cale juste ce qu’il faut, sans se poser de questions.', items: [['Cheese Burger', 'Seul'], ['Petite Frite', ''], ['Dada Cola 33 cl', '']] },
    { n: 'La grosse faim', d: 'La signature de la maison en menu, et un tiramisu fait maison pour finir.', items: [['Tacos Le Anas', 'Menu'], ['Tiramisu Nutella', ''], ['Hamoud 33 cl', '']], skipLast: true },
    { n: 'La faim de loup', d: 'Trois steaks, du bacon, des wings croustillantes. On ne vous juge pas.', items: [['Le King Burger', 'Menu'], ['Wings', '6 pièces'], ['Tiramisu Spéculoos', '']] },
    { n: 'Le match entre potes', d: 'Une pizza géante de 50 cm, des tenders à partager et de quoi trinquer.', items: [['Anas', 'Géante 50 cm'], ['Tenders', '6 pièces'], ['Selecto 1,5 L', '']] },
  ];
  const comboEl = $('[data-combo]');
  const resolve = (name, label) => {
    const it = findItem(name); if (!it) return null;
    const pr = it.p.find((x) => x.l === label) || it.p[0];
    const img = label === 'Menu' && it.mimg ? it.mimg : it.img;
    return { n: it.n.startsWith('Anas') ? 'Pizza Anas' : it.n, l: pr.l, v: pr.v, img };
  };
  const renderCombo = (k) => {
    const c = COMBOS[k];
    const lines = c.items.slice(0, c.skipLast ? 2 : 3).map(([n, l]) => resolve(n, l)).filter(Boolean);
    const total = lines.reduce((s, x) => s + x.v, 0);
    comboEl.innerHTML = `
      <div class="combo__visual">${lines.map((x) => `<img src="${x.img}" alt="">`).join('')}</div>
      <div>
        <h3 class="combo__name">${c.n}</h3><p class="combo__desc">${c.d}</p>
        <ul class="combo__list">${lines.map((x) => `<li><span>${x.n}${x.l ? ` <small>· ${x.l}</small>` : ''}</span><span>${money(x.v)}</span></li>`).join('')}</ul>
        <div class="combo__foot"><p class="combo__total"><small>Total</small>${money(total)}</p><button class="btn btn--fire" data-combo-add>Ajouter le combo <span aria-hidden="true">+</span></button></div>
      </div>`;
    $('[data-combo-add]', comboEl).addEventListener('click', (e) => { lines.forEach((x) => add(x, null)); fly(lines[0].img, e.currentTarget); say(`${c.n} ajouté au panier`); });
  };
  $$('.mood').forEach((m) => m.addEventListener('click', () => {
    $$('.mood').forEach((x) => { x.classList.toggle('is-on', x === m); x.setAttribute('aria-selected', String(x === m)); });
    renderCombo(+m.dataset.mood);
  }));
  renderCombo(0);

  /* ---------- Carte ---------- */
  const NOTES = { 'Pizzas tomate': 'Trois tailles : Solo 33 cm, Large 40 cm, Géante 50 cm.', 'Pizzas crème': 'Base crème fraîche. Solo 33 cm, Large 40 cm, Géante 50 cm.', Burgers: 'En menu : frites + boisson 33 cl au choix. Gratinage en supplément.', Tacos: 'En menu : frites + boisson 33 cl au choix. Gratinage en supplément.', Sandwichs: 'En menu : frites + boisson 33 cl au choix.', 'Roulés': 'Roulés en pâte à pizza. En menu : frites + boisson 33 cl.', 'Box du Peuple': 'Offres spéciales abonnés TikTok.' };
  const menuEl = $('[data-menu]'), catsEl = $('[data-cats]'), search = $('[data-search]'), empty = $('[data-empty]');
  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');
  catsEl.innerHTML = MENU.map((c, i) => `<a class="cat${i === 0 ? ' is-on' : ''}" href="#cat-${slug(c.name)}">${c.name}<small>${c.items.length}</small></a>`).join('');
  const short = (l) => l.replace(/^(Solo|Large|Géante) /, '');
  const card = (it) => {
    const opts = it.p.length > 1 ? `<div class="card__opts" role="radiogroup" aria-label="Format">${it.p.map((p, k) => `<button role="radio" aria-checked="${k === 0}" class="${k === 0 ? 'is-on' : ''}" data-k="${k}" aria-label="${p.l}">${short(p.l)}</button>`).join('')}</div>` : (it.p[0].l ? `<p class="card__desc">${it.p[0].l}</p>` : '');
    return `<article class="card rv" data-name="${(it.n + ' ' + it.d).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}">
      <div class="card__img"><img src="${it.img}" alt="${it.n}" loading="lazy" width="420" height="420"></div>
      <h4 class="card__name">${it.n}</h4>
      <p class="card__desc">${it.d || '&nbsp;'}</p>${opts}
      <div class="card__foot"><span class="card__price">${euro(it.p[0].v)}</span><button class="add" aria-label="Ajouter ${it.n} au panier">+</button></div>
    </article>`;
  };
  menuEl.innerHTML = MENU.map((c) => `<section class="menu__cat" id="cat-${slug(c.name)}"><h3>${c.name}<small>${c.items.length} choix</small></h3>${NOTES[c.name] ? `<p class="menu__note">${NOTES[c.name]}</p>` : ''}<div class="grid">${c.items.map(card).join('')}</div></section>`).join('');
  // Wire cards
  let ci = 0;
  MENU.forEach((c) => c.items.forEach((it) => {
    const el = $$('.card', menuEl)[ci++]; let k = 0;
    const price = $('.card__price', el), img = $('.card__img img', el);
    $$('.card__opts button', el).forEach((b) => b.addEventListener('click', () => {
      k = +b.dataset.k; $$('.card__opts button', el).forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-checked', String(x === b)); });
      price.textContent = euro(it.p[k].v);
      if (it.mimg) img.src = it.p[k].l === 'Menu' ? it.mimg : it.img;
    }));
    $('.add', el).addEventListener('click', (e) => {
      const p = it.p[k];
      add({ n: c.name.startsWith('Pizzas') ? `Pizza ${it.n}` : it.n, l: p.l, v: p.v, img: p.l === 'Menu' && it.mimg ? it.mimg : it.img });
      fly(img.src, e.currentTarget);
      e.currentTarget.classList.add('done'); e.currentTarget.textContent = '✓';
      const btn = e.currentTarget; setTimeout(() => { btn.classList.remove('done'); btn.textContent = '+'; }, 900);
    });
  }));
  // Search
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    let shown = 0;
    $$('.menu__cat', menuEl).forEach((sec) => {
      let n = 0; $$('.card', sec).forEach((cd) => { const ok = !q || cd.dataset.name.includes(q); cd.hidden = !ok; if (ok) { n++; cd.classList.add('in'); } });
      sec.hidden = n === 0; shown += n;
    });
    empty.hidden = shown > 0;
  });
  // Scrollspy for categories
  const catLinks = $$('.cat', catsEl);
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const id = e.target.id; catLinks.forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`; a.classList.toggle('is-on', on);
      if (on) catsEl.scrollTo({ left: a.offsetLeft - catsEl.offsetLeft - catsEl.clientWidth / 2 + a.clientWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
    });
  }), { rootMargin: '-40% 0px -55% 0px' });
  $$('.menu__cat', menuEl).forEach((s) => spy.observe(s));

  /* ---------- Cart ---------- */
  let cart = []; let mode = 'delivery'; let zone = 0;
  try { const s = JSON.parse(localStorage.getItem('anas-cart') || 'null'); if (s) { cart = s.cart || []; mode = s.mode || mode; zone = s.zone || 0; } } catch {}
  const save = () => { try { localStorage.setItem('anas-cart', JSON.stringify({ cart, mode, zone })); } catch {} };
  const drawer = $('[data-drawer]'), list = $('[data-cart-list]'), emptyCart = $('[data-cart-empty]'), zoneSel = $('[data-zone-select]');
  zoneSel.innerHTML = ZONES.map((z, i) => `<option value="${i}">${z.c} (${z.cp})</option>`).join('');
  function add(x, _) {
    const key = `${x.n}|${x.l}`; const f = cart.find((l) => l.key === key);
    if (f) f.q++; else cart.push({ key, n: x.n, l: x.l, v: x.v, img: x.img, q: 1 });
    save(); render(); const b = $('.cart-btn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    if (_ !== null) say(`${x.n}${x.l ? ' · ' + x.l : ''} ajouté`);
  }
  function render() {
    const count = cart.reduce((s, l) => s + l.q, 0), sub = cart.reduce((s, l) => s + l.q * l.v, 0);
    const z = ZONES[zone], fee = mode === 'delivery' ? z.fee : 0, total = sub + (count ? fee : 0);
    $('[data-cart-count]').textContent = count; $('[data-cart-total]').textContent = money(total);
    list.innerHTML = cart.map((l, i) => `<li class="line"><img src="${l.img}" alt=""><div><p class="line__name">${l.n}</p>${l.l ? `<p class="line__opt">${l.l}</p>` : ''}<div class="line__qty"><button data-q="${i}" data-d="-1" aria-label="Retirer un">−</button><span>${l.q}</span><button data-q="${i}" data-d="1" aria-label="Ajouter un">+</button></div></div><span class="line__price">${money(l.q * l.v)}</span></li>`).join('');
    list.hidden = !count; emptyCart.hidden = !!count;
    $('[data-subtotal]').textContent = money(sub); $('[data-fee]').textContent = money(fee); $('[data-total]').textContent = money(total);
    $('[data-fee-row]').hidden = mode !== 'delivery'; $('[data-zone-wrap]').hidden = mode !== 'delivery';
    const minWrap = $('[data-min-wrap]'), missing = Math.max(0, z.min - sub);
    minWrap.hidden = mode !== 'delivery' || !count;
    $('[data-min-text]').textContent = missing > 0 ? `Plus que ${money(missing)} pour être livré à ${z.c}` : `Minimum atteint, livraison en ${z.t} min`;
    $('[data-min-bar]').style.width = `${Math.min(sub / z.min, 1) * 100}%`;
    $('[data-checkout]').disabled = !count || (mode === 'delivery' && missing > 0);
    $$('.drawer__mode button').forEach((b) => { const on = b.dataset.mode === mode; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); });
    zoneSel.value = zone;
  }
  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]'); if (!b) return;
    const l = cart[+b.dataset.q]; l.q += +b.dataset.d; if (l.q <= 0) cart.splice(+b.dataset.q, 1);
    save(); render();
  });
  $$('.drawer__mode button').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.mode; save(); render(); }));
  zoneSel.addEventListener('change', () => { zone = +zoneSel.value; save(); render(); renderZone(); });
  const openCart = () => { drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; setTimeout(() => $('.drawer__x').focus(), 50); };
  const closeCart = () => { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
  $$('[data-open-cart]').forEach((b) => b.addEventListener('click', openCart));
  $$('[data-close-cart]').forEach((b) => b.addEventListener('click', closeCart));
  const modal = $('[data-modal]');
  $('[data-checkout]').addEventListener('click', () => { closeCart(); modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); });
  $('[data-close-modal]').addEventListener('click', () => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeCart(); modal.classList.remove('is-open'); } });
  render();

  // Static "add" buttons (signatures, box)
  $$('[data-add]').forEach((b) => b.addEventListener('click', () => { const x = JSON.parse(b.dataset.add); add(x); fly(x.img, b); }));

  function fly(src, from) {
    if (reduced || !src) return;
    const r = from.getBoundingClientRect(), t = $('.cart-btn').getBoundingClientRect();
    const im = document.createElement('img'); im.src = src; im.className = 'fly'; im.alt = '';
    im.style.left = `${r.left + r.width / 2 - 35}px`; im.style.top = `${r.top + r.height / 2 - 35}px`;
    document.body.appendChild(im);
    requestAnimationFrame(() => { im.style.transform = `translate(${t.left + t.width / 2 - r.left - r.width / 2}px, ${t.top + t.height / 2 - r.top - r.height / 2}px) scale(.3) rotate(240deg)`; im.style.opacity = '.4'; });
    setTimeout(() => im.remove(), 850);
  }

  /* ---------- Livraison section ---------- */
  const zonesEl = $('[data-zones]'), zCard = $('[data-zone-card]');
  zonesEl.innerHTML = ZONES.map((z, i) => `<button class="zone" data-z="${i}">${z.c}</button>`).join('');
  function renderZone() {
    const z = ZONES[zone];
    $$('.zone', zonesEl).forEach((b) => b.classList.toggle('is-on', +b.dataset.z === zone));
    zCard.innerHTML = `<img src="assets/img/hero/frites.webp" alt=""><p class="liv__label" style="color:inherit;opacity:.7">Livraison à</p><h3>${z.c}<br><small style="font-size:.5em">${z.cp}</small></h3>
      <div class="liv__facts"><div><b>${z.t}</b><span>minutes</span></div><div><b>${euro(z.fee)}</b><span>de frais</span></div><div><b>${euro(z.min)}</b><span>minimum</span></div></div>`;
  }
  zonesEl.addEventListener('click', (e) => { const b = e.target.closest('[data-z]'); if (!b) return; zone = +b.dataset.z; save(); renderZone(); render(); });
  renderZone();

  /* ---------- Counters ---------- */
  const fmt = (v, f) => (f === 'M' ? (v >= 1e6 ? '1M' : Math.round(v / 1000) + 'K') : v >= 10000 ? Math.round(v).toLocaleString('fr-FR') : Math.round(v));
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.countTo, f = el.dataset.format; if (reduced) return;
    const t0 = performance.now(); const step = (t) => { const k = Math.min((t - t0) / 1600, 1), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = fmt(v, f); if (k < 1) requestAnimationFrame(step); else el.textContent = fmt(to, f); }; requestAnimationFrame(step);
  }), { threshold: .6 });
  $$('[data-count-to]').forEach((el) => cio.observe(el));

  /* ---------- Reveal ---------- */
  const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { threshold: .08, rootMargin: '0px 0px -5% 0px' });
  $$('.rv').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * .06}s`; rio.observe(el); });

  /* ---------- Scroll loop ---------- */
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(() => { onSig(); ticking = false; }); ticking = true; } }, { passive: true });
  addEventListener('resize', onSig); desktop.addEventListener?.('change', onSig); onSig();
})();
