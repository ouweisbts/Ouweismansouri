(() => {
  const body = document.body;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Loader ---------- */
  const countEl = document.querySelector('[data-count]');
  const finishLoading = () => {
    body.classList.remove('is-loading');
    body.classList.add('is-loaded');
  };
  if (reduced || !countEl) {
    finishLoading();
  } else {
    const start = performance.now();
    const duration = 1100;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      countEl.textContent = Math.round(eased * 100);
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(finishLoading, 150);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Lyon clock & year ---------- */
  const clock = document.querySelector('[data-clock]');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
    const update = () => { clock.textContent = fmt.format(new Date()); };
    update();
    setInterval(update, 15000);
  }
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  document.querySelectorAll('.reveal, .contact').forEach((el) => io.observe(el));

  /* ---------- Manifesto: words light up with scroll ---------- */
  const manifesto = document.querySelector('[data-words]');
  let words = [];
  if (manifesto) {
    const wrapWords = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement('span');
            s.className = 'w';
            s.textContent = part;
            frag.appendChild(s);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          wrapWords(child);
        }
      });
    };
    wrapWords(manifesto);
    words = [...manifesto.querySelectorAll('.w')];
  }

  /* ---------- Header hide on scroll down ---------- */
  const header = document.querySelector('.header');
  let lastY = window.scrollY;

  /* ---------- Scroll loop ---------- */
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    if (header && !menu.classList.contains('is-open')) {
      header.classList.toggle('is-hidden', y > lastY && y > 200);
    }
    lastY = y;

    if (words.length) {
      const r = manifesto.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0), 1);
      const lit = Math.round(progress * words.length);
      words.forEach((w, i) => w.classList.toggle('is-on', i < lit));
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = document.querySelector('.header__burger');
  const menu = document.querySelector('.menu');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  onScroll();

  /* ---------- Copy email ---------- */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const original = btn.textContent;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = 'Adresse copiée ✓';
        btn.classList.add('is-done');
      } catch {
        window.location.href = `mailto:${btn.dataset.copy}`;
        return;
      }
      setTimeout(() => { btn.textContent = original; btn.classList.remove('is-done'); }, 2200);
    });
  });

  if (!finePointer || reduced) return;

  /* ---------- Custom cursor ---------- */
  const cursor = document.querySelector('.cursor');
  const label = cursor.querySelector('.cursor__label');
  const preview = document.querySelector('.preview');
  let mx = -100, my = -100, cx = mx, cy = my, px = mx, py = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.classList.add('is-visible');
  }, { passive: true });
  document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));

  const loop = () => {
    cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
    px += (mx - px) * 0.1;  py += (my - py) * 0.1;
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    if (preview) {
      const w = preview.offsetWidth, h = preview.offsetHeight;
      preview.style.left = `${px - w / 2}px`;
      preview.style.top = `${py - h / 2}px`;
    }
    requestAnimationFrame(loop);
  };
  loop();

  document.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (el.dataset.cursor) {
        label.textContent = el.dataset.cursor;
        cursor.classList.add('is-label');
      } else {
        cursor.classList.add('is-link');
      }
    });
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-link', 'is-label'));
  });

  /* ---------- Project hover previews ---------- */
  if (preview) {
    const items = preview.querySelectorAll('.preview__item');
    document.querySelectorAll('[data-preview]').forEach((link) => {
      link.addEventListener('mouseenter', () => {
        preview.classList.add('is-on');
        items.forEach((it) => it.classList.toggle('is-on', it.dataset.id === link.dataset.preview));
      });
      link.addEventListener('mouseleave', () => preview.classList.remove('is-on'));
    });
  }

  /* ---------- Magnetic elements ---------- */
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.3;
      const y = (e.clientY - r.top - r.height / 2) * 0.4;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();
