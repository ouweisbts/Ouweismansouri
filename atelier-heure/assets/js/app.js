import { Watch, CASES, DIALS, STRAPS, ENGRAVING_PRICE } from './watch.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (v) => v.toLocaleString('fr-FR') + ' €';
const plus = (v) => (v ? `+ ${v.toLocaleString('fr-FR')} €` : 'Inclus');

/* ---------- Live clock ---------- */
const clock = $('[data-clock]');
const tf = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Paris' });
setInterval(() => { clock.textContent = tf.format(new Date()); }, 1000);
clock.textContent = tf.format(new Date());

/* ---------- Config from URL ---------- */
const cfg = { case: 'acier', dial: 'bleu', strap: 'cognac', engraving: '' };
try {
  const p = new URLSearchParams(location.hash.slice(1));
  if (CASES[p.get('boitier')]) cfg.case = p.get('boitier');
  if (DIALS[p.get('cadran')]) cfg.dial = p.get('cadran');
  if (STRAPS[p.get('bracelet')]) cfg.strap = p.get('bracelet');
  if (p.get('gravure')) cfg.engraving = p.get('gravure').slice(0, 12);
} catch {}

/* ---------- Watch ---------- */
let watch = null;
try {
  watch = new Watch($('.stage__canvas'), { reduced });
  if (!reduced) { watch.explode = 1; watch.explodeTarget = 1; setTimeout(() => { watch.explodeTarget = 0; $('[data-loading]').classList.add('is-done'); }, 700); }
  else $('[data-loading]').classList.add('is-done');
} catch (e) {
  console.warn(e);
  $('.stage__fallback').hidden = false; $('[data-loading]').classList.add('is-done');
}

/* ---------- Swatches ---------- */
const metalBg = (c) => `radial-gradient(circle at 35% 30%, #fff8 0, transparent 38%), linear-gradient(140deg, ${c}, ${shade(c, -28)} 70%, ${shade(c, 10)})`;
function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16), f = pct / 100;
  const ch = (v) => Math.max(0, Math.min(255, Math.round(v + (f > 0 ? (255 - v) * f : v * f))));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(ch).map((v) => v.toString(16).padStart(2, '0')).join('');
}
const GROUPS = {
  case: { data: CASES, bg: (k, o) => metalBg(o.color) },
  dial: { data: DIALS, bg: (k, o) => (o.sun ? `repeating-conic-gradient(from 0deg, ${o.base} 0 3deg, ${shade(o.base, 12)} 3deg 6deg)` : `radial-gradient(circle at 40% 35%, ${shade(o.base, 18)}, ${o.base} 60%, ${o.edge})`) },
  strap: { data: STRAPS, bg: (k, o) => (o.metal ? `repeating-linear-gradient(90deg, #c9ccd2 0 2px, #8f939a 2px 4px)` : `linear-gradient(140deg, ${shade(o.color, 14)}, ${o.color})`) },
};
for (const [g, def] of Object.entries(GROUPS)) {
  const el = $(`[data-group="${g}"]`);
  el.setAttribute('role', 'radiogroup');
  el.innerHTML = Object.entries(def.data).map(([k, o]) => `
    <button class="sw" role="radio" data-k="${k}" aria-label="${o.name}">
      <i style="background:${def.bg(k, o)}"></i><span>${o.name}</span><small>${g === 'case' ? fmt(o.price) : plus(o.price)}</small>
    </button>`).join('');
  el.addEventListener('click', (e) => {
    const b = e.target.closest('.sw'); if (!b) return;
    cfg[g] = b.dataset.k; update(true);
    if (g === 'strap') watch?.view('profil'); else if (g !== 'case') watch?.view('face');
  });
}

/* ---------- Engraving ---------- */
const eng = $('[data-engrave]');
eng.value = cfg.engraving;
eng.addEventListener('focus', () => watch?.view('dos'));
eng.addEventListener('input', () => { cfg.engraving = eng.value.trim().slice(0, 12); update(false); });
eng.addEventListener('blur', () => setTimeout(() => { if (document.activeElement !== eng) watch?.view('face'); }, 1600));

/* ---------- Views ---------- */
const chips = $$('[data-view]'), exp = $('[data-explode]');
chips.forEach((c) => c.addEventListener('click', () => {
  chips.forEach((x) => x.classList.toggle('is-on', x === c));
  exp.classList.remove('is-on'); exp.setAttribute('aria-pressed', 'false'); if (watch) watch.explodeTarget = 0;
  watch?.view(c.dataset.view);
}));
exp.addEventListener('click', () => {
  const on = !exp.classList.contains('is-on');
  exp.classList.toggle('is-on', on); exp.setAttribute('aria-pressed', String(on));
  chips.forEach((x) => x.classList.remove('is-on'));
  watch?.setExplode(on);
});

/* ---------- Price & recap ---------- */
const priceEl = $('[data-price]');
let shown = 0;
function animatePrice(to) {
  if (reduced) { priceEl.textContent = fmt(to); shown = to; return; }
  const from = shown, t0 = performance.now();
  const step = (t) => { const k = Math.min((t - t0) / 600, 1), e = 1 - Math.pow(1 - k, 3); priceEl.textContent = fmt(Math.round(from + (to - from) * e)); if (k < 1) requestAnimationFrame(step); else shown = to; };
  requestAnimationFrame(step);
}
function recapHTML() {
  const rows = [
    ['Boîtier', CASES[cfg.case].name, fmt(CASES[cfg.case].price)],
    ['Cadran', DIALS[cfg.dial].name, plus(DIALS[cfg.dial].price)],
    ['Bracelet', STRAPS[cfg.strap].name, plus(STRAPS[cfg.strap].price)],
    ['Gravure', cfg.engraving ? `« ${cfg.engraving} »` : 'Aucune', cfg.engraving ? plus(ENGRAVING_PRICE) : '—'],
  ];
  return rows.map(([k, v, p]) => `<div><dt class="mono">${k}</dt><dd>${v}</dd><dd class="recap__p mono">${p}</dd></div>`).join('');
}
function price() { return CASES[cfg.case].price + DIALS[cfg.dial].price + STRAPS[cfg.strap].price + (cfg.engraving ? ENGRAVING_PRICE : 0); }
function update(redraw) {
  for (const g of Object.keys(GROUPS)) {
    $$(`[data-group="${g}"] .sw`).forEach((b) => { const on = b.dataset.k === cfg[g]; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); });
    $(`[data-label="${g}"]`).textContent = GROUPS[g].data[cfg[g]].name;
  }
  $('[data-engrave-count]').textContent = `${cfg.engraving.length}/12`;
  $('[data-recap]').innerHTML = recapHTML();
  animatePrice(price());
  watch?.apply(cfg);
  const p = new URLSearchParams({ boitier: cfg.case, cadran: cfg.dial, bracelet: cfg.strap });
  if (cfg.engraving) p.set('gravure', cfg.engraving);
  history.replaceState(null, '', '#' + p.toString());
}
update(true);
document.fonts?.ready.then(() => watch?.apply(cfg)); // redraw dial text once fonts are in

/* ---------- Share & order ---------- */
const toast = $('[data-toast]'); let tt;
const say = (m) => { toast.textContent = m; toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('is-on'), 2200); };
$('[data-share]').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(location.href); say('Lien de votre configuration copié'); }
  catch { say('Copiez l’adresse de la page pour partager'); }
});
const sheet = $('[data-sheet]');
$('[data-order]').addEventListener('click', () => {
  $('[data-recap-sheet]').innerHTML = recapHTML();
  $('[data-price-sheet]').textContent = fmt(price());
  sheet.classList.add('is-open'); sheet.setAttribute('aria-hidden', 'false');
  setTimeout(() => $('.sheet__x').focus(), 50);
});
$$('[data-close]').forEach((b) => b.addEventListener('click', () => { sheet.classList.remove('is-open'); sheet.setAttribute('aria-hidden', 'true'); }));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { sheet.classList.remove('is-open'); sheet.setAttribute('aria-hidden', 'true'); } });
