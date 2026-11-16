/* Atelier Heure — procedural 3D watch (Three.js r170).
   Everything is built in code: no external model or texture file. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const CASES = {
  acier: { name: 'Acier poli', color: '#d9dce1', roughness: 0.18, price: 790 },
  titane: { name: 'Titane brossé', color: '#9ea3ab', roughness: 0.42, price: 940 },
  dlc: { name: 'Noir DLC', color: '#2a2b2f', roughness: 0.3, price: 890 },
  or: { name: 'Or jaune 18 ct', color: '#e6b45c', roughness: 0.16, price: 4900 },
};
export const DIALS = {
  bleu: { name: 'Bleu nuit soleillé', base: '#14305c', edge: '#071226', sun: true, ink: '#e9edf5', price: 40 },
  noir: { name: 'Noir laqué', base: '#111215', edge: '#050506', sun: false, ink: '#ece8e0', price: 0 },
  vert: { name: 'Vert forêt soleillé', base: '#1a4a37', edge: '#08201a', sun: true, ink: '#eef2ec', price: 40 },
  creme: { name: 'Crème opalin', base: '#efe7d7', edge: '#d9ccb4', sun: false, ink: '#1c1b19', price: 0 },
  saumon: { name: 'Saumon', base: '#eab095', edge: '#c9846a', sun: true, ink: '#24160f', price: 60 },
};
export const STRAPS = {
  cognac: { name: 'Cuir cognac', color: '#8a4a22', roughness: 0.62, sheen: 0.6, price: 0 },
  noir: { name: 'Cuir noir', color: '#141414', roughness: 0.55, sheen: 0.4, price: 0 },
  vert: { name: 'Cuir vert sapin', color: '#283c30', roughness: 0.6, sheen: 0.5, price: 0 },
  caoutchouc: { name: 'Caoutchouc', color: '#1d1e21', roughness: 0.92, sheen: 0, price: 0 },
  milanais: { name: 'Milanais', metal: true, price: 120 },
};
export const ENGRAVING_PRICE = 45;

const TAU = Math.PI * 2;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class Watch {
  constructor(canvas, { reduced = false } = {}) {
    this.canvas = canvas;
    this.reduced = reduced;
    this.config = { case: 'acier', dial: 'bleu', strap: 'cognac', engraving: '' };
    this.explode = 0; this.explodeTarget = 0;
    this.camTween = null;

    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }));
    r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    r.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(r);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    this.camera.position.set(0, 0, 7.2);

    const key = new THREE.DirectionalLight('#fff4e6', 2.2); key.position.set(3, 4, 5); this.scene.add(key);
    const rim = new THREE.DirectionalLight('#ffd9a8', 1.4); rim.position.set(-4, -2, -3); this.scene.add(rim);
    const fill = new THREE.HemisphereLight('#dfe8ff', '#1a120b', 0.35); this.scene.add(fill);

    this.controls = new OrbitControls(this.camera, canvas);
    Object.assign(this.controls, { enableDamping: true, dampingFactor: 0.06, enablePan: false, minDistance: 4.2, maxDistance: 11, rotateSpeed: 0.7 });
    this.controls.autoRotate = !reduced; this.controls.autoRotateSpeed = 0.6;
    let idle;
    this.controls.addEventListener('start', () => { this.controls.autoRotate = false; this.camTween = null; clearTimeout(idle); });
    this.controls.addEventListener('end', () => { clearTimeout(idle); if (!reduced) idle = setTimeout(() => { this.controls.autoRotate = true; }, 5000); });

    this.build();
    this.apply(this.config);
    this.resize();
    addEventListener('resize', () => this.resize());
    new ResizeObserver(() => this.resize()).observe(canvas.parentElement);
    this.visible = true;
    new IntersectionObserver((e) => { this.visible = e[0].isIntersecting; }).observe(canvas);
    this.clock = new THREE.Clock();
    r.setAnimationLoop(() => this.frame());
  }

  /* ---------------- Materials ---------------- */
  metal(color, roughness) {
    return new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness, clearcoat: 0.25, clearcoatRoughness: 0.2, envMapIntensity: 1.25 });
  }

  /* ---------------- Geometry ---------------- */
  build() {
    const g = (this.root = new THREE.Group());
    g.rotation.x = Math.PI / 2; // build face-up (+Y), show face to camera (+Z)
    this.scene.add(new THREE.Group().add(g));
    this.parts = {};
    const part = (name, obj, offset) => { obj.userData.base = obj.position.clone(); obj.userData.offset = offset; this.parts[name] = obj; g.add(obj); return obj; };

    this.caseMat = this.metal('#d9dce1', 0.18);
    this.polishMat = this.metal('#e8eaee', 0.08);

    // Middle case (lathe profile)
    const mid = [[0.84, -0.17], [0.95, -0.168], [1.01, -0.135], [1.035, -0.06], [1.04, 0.02], [1.03, 0.1], [1.0, 0.14], [0.94, 0.152], [0.84, 0.152]].map(([x, y]) => new THREE.Vector2(x, y));
    part('case', new THREE.Mesh(new THREE.LatheGeometry(mid, 128), this.caseMat), new THREE.Vector3(0, 0, 0));

    // Bezel
    const bz = [[0.79, 0.15], [0.95, 0.15], [0.965, 0.175], [0.935, 0.215], [0.86, 0.232], [0.8, 0.226], [0.79, 0.205]].map(([x, y]) => new THREE.Vector2(x, y));
    part('bezel', new THREE.Mesh(new THREE.LatheGeometry(bz, 128), this.polishMat), new THREE.Vector3(0, 0.75, 0));

    // Dial
    this.dialCanvas = document.createElement('canvas'); this.dialCanvas.width = this.dialCanvas.height = 1024;
    this.dialTex = new THREE.CanvasTexture(this.dialCanvas); this.dialTex.colorSpace = THREE.SRGBColorSpace; this.dialTex.anisotropy = 8;
    this.dialMat = new THREE.MeshPhysicalMaterial({ map: this.dialTex, roughness: 0.32, metalness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.12 });
    const dial = new THREE.Mesh(new THREE.CircleGeometry(0.8, 128), this.dialMat);
    dial.rotation.x = -Math.PI / 2; dial.position.y = 0.1;
    part('dial', dial, new THREE.Vector3(0, 0.3, 0));

    // Chapter ring (slope between dial and bezel)
    const ch = [[0.79, 0.1], [0.8, 0.1], [0.8, 0.15]].map(([x, y]) => new THREE.Vector2(x, y));
    this.chapterMat = new THREE.MeshStandardMaterial({ color: '#0c1a33', roughness: 0.5, metalness: 0.2 });
    part('chapter', new THREE.Mesh(new THREE.LatheGeometry(ch, 128), this.chapterMat), new THREE.Vector3(0, 0.3, 0));

    // Indices (applied markers)
    const idx = new THREE.Group(); idx.position.y = 0.1;
    this.indexMat = this.metal('#e8eaee', 0.12);
    this.lumeMat = new THREE.MeshStandardMaterial({ color: '#f3efe2', emissive: '#bfe8c8', emissiveIntensity: 0.12, roughness: 0.6 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      const double = i === 0;
      for (let k = 0; k < (double ? 2 : 1); k++) {
        const w = i % 3 === 0 ? 0.05 : 0.034, l = i % 3 === 0 ? 0.17 : 0.12;
        const m = new THREE.Mesh(new RoundedBoxGeometry(w, 0.022, l, 2, 0.008), this.indexMat);
        const r = 0.62;
        const off = double ? (k ? 0.035 : -0.035) : 0;
        m.position.set(Math.sin(a) * r + Math.cos(a) * off, 0.012, -Math.cos(a) * r + Math.sin(a) * off);
        m.rotation.y = -a;
        const lume = new THREE.Mesh(new THREE.BoxGeometry(w * 0.45, 0.004, l * 0.72), this.lumeMat); lume.position.y = 0.012; m.add(lume);
        idx.add(m);
      }
    }
    part('indices', idx, new THREE.Vector3(0, 0.45, 0));

    // Hands
    const handShape = (len, w, tail = 0) => { const s = new THREE.Shape(); s.moveTo(-w * 0.5, -tail); s.lineTo(-w * 0.62, len * 0.18); s.lineTo(0, len); s.lineTo(w * 0.62, len * 0.18); s.lineTo(w * 0.5, -tail); s.closePath(); return s; };
    const handGeo = (shape, depth) => { const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2 }); geo.rotateX(-Math.PI / 2); return geo; };
    this.handMat = this.metal('#eef0f3', 0.1);
    this.secMat = new THREE.MeshStandardMaterial({ color: '#e8572a', roughness: 0.35, metalness: 0.4 });
    const hands = new THREE.Group(); hands.position.y = 0.1;
    this.hHour = new THREE.Mesh(handGeo(handShape(0.42, 0.075, 0.07), 0.012), this.handMat); this.hHour.position.y = 0.04;
    this.hMin = new THREE.Mesh(handGeo(handShape(0.64, 0.055, 0.08), 0.012), this.handMat); this.hMin.position.y = 0.058;
    const sec = new THREE.Shape(); sec.moveTo(-0.006, -0.16); sec.lineTo(-0.006, 0.72); sec.lineTo(0.006, 0.72); sec.lineTo(0.006, -0.16); sec.closePath();
    this.hSec = new THREE.Mesh(handGeo(sec, 0.006), this.secMat); this.hSec.position.y = 0.076;
    const tailDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.008, 32), this.secMat); tailDisc.position.set(0, 0.003, 0.13); this.hSec.add(tailDisc);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 32), this.secMat); cap.position.y = 0.085;
    [this.hHour, this.hMin, this.hSec, cap].forEach((m) => hands.add(m));
    part('hands', hands, new THREE.Vector3(0, 0.6, 0));

    // Crystal (sapphire)
    const crystal = new THREE.Mesh(new THREE.CylinderGeometry(0.815, 0.815, 0.035, 128), new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0, roughness: 0.02, transmission: 1, thickness: 0.15, ior: 1.77, transparent: true, opacity: 1, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6 }));
    crystal.position.y = 0.205;
    part('crystal', crystal, new THREE.Vector3(0, 0.95, 0));

    // Crown with knurling
    const cr = new THREE.CylinderGeometry(0.095, 0.095, 0.13, 48, 1);
    const pos = cr.attributes.position;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), rr = Math.hypot(x, z); if (rr > 0.09) { const a = Math.atan2(z, x); const k = 1 + 0.06 * Math.sign(Math.sin(a * 24)); pos.setX(i, x * k); pos.setZ(i, z * k); } }
    cr.computeVertexNormals();
    const crown = new THREE.Mesh(cr, this.caseMat); crown.rotation.z = Math.PI / 2; crown.position.set(1.1, -0.01, 0);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 24), this.caseMat); stem.rotation.z = Math.PI / 2; stem.position.set(1.03, -0.01, 0);
    const crownGroup = new THREE.Group(); crownGroup.add(crown, stem);
    part('crown', crownGroup, new THREE.Vector3(0.55, 0, 0));

    // Lugs
    const lugs = new THREE.Group();
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const l = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.13, 0.5, 4, 0.045), this.caseMat);
      l.position.set(sx * 0.565, -0.045, sz * 0.95); l.rotation.x = sz * -0.14;
      lugs.add(l);
    }
    part('lugs', lugs, new THREE.Vector3(0, 0, 0));

    // Caseback with engraving
    this.backCanvas = document.createElement('canvas'); this.backCanvas.width = this.backCanvas.height = 1024;
    this.backTex = new THREE.CanvasTexture(this.backCanvas); this.backTex.colorSpace = THREE.SRGBColorSpace; this.backTex.anisotropy = 8;
    this.backTex.center.set(0.5, 0.5); this.backTex.rotation = Math.PI; // reads upright when the watch is turned over
    this.backMat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', map: this.backTex, metalness: 1, roughness: 0.3, clearcoat: 0.3 });
    const back = new THREE.Group();
    const backRim = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.84, 0.05, 128, 1, true), this.caseMat); backRim.position.y = -0.19;
    const backFace = new THREE.Mesh(new THREE.CircleGeometry(0.84, 128), this.backMat); backFace.rotation.x = Math.PI / 2; backFace.position.y = -0.215;
    back.add(backRim, backFace);
    part('back', back, new THREE.Vector3(0, -0.7, 0));

    // Straps (rounded section swept along a curve, one per side)
    this.strapMat = new THREE.MeshPhysicalMaterial({ color: '#8a4a22', roughness: 0.62, sheen: 0.6, sheenRoughness: 0.6, sheenColor: new THREE.Color('#d9a27a') });
    const sect = new THREE.Shape();
    const hw = 0.49, ht = 0.045, rr2 = 0.035; // half width (across the wrist), half thickness
    sect.moveTo(-hw + rr2, -ht); sect.lineTo(hw - rr2, -ht); sect.quadraticCurveTo(hw, -ht, hw, -ht + rr2 * 0.6); sect.lineTo(hw, ht - rr2 * 0.6); sect.quadraticCurveTo(hw, ht, hw - rr2, ht); sect.lineTo(-hw + rr2, ht); sect.quadraticCurveTo(-hw, ht, -hw, ht - rr2 * 0.6); sect.lineTo(-hw, -ht + rr2 * 0.6); sect.quadraticCurveTo(-hw, -ht, -hw + rr2, -ht);
    const strapGeo = (dir) => {
      const pts = [[0, 1.0], [-0.02, 1.35], [-0.12, 1.85], [-0.38, 2.35], [-0.85, 2.72], [-1.45, 2.9]].map(([y, z]) => new THREE.Vector3(0, y, z * dir));
      const curve = new THREE.CatmullRomCurve3(pts);
      return new THREE.ExtrudeGeometry(sect, { steps: 90, bevelEnabled: false, extrudePath: curve });
    };
    const straps = new THREE.Group();
    this.strapA = new THREE.Mesh(strapGeo(1), this.strapMat); this.strapB = new THREE.Mesh(strapGeo(-1), this.strapMat);
    straps.add(this.strapA, this.strapB);
    part('straps', straps, new THREE.Vector3(0, -0.15, 0));

    // Soft contact glow under the watch (fake shadow)
    const sh = document.createElement('canvas'); sh.width = sh.height = 256;
    const sc = sh.getContext('2d'); const gr = sc.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); sc.fillStyle = gr; sc.fillRect(0, 0, 256, 256);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false }));
    shadow.position.set(0, -0.05, -1.2); this.scene.add(shadow);
  }

  /* ---------------- Textures ---------------- */
  drawDial(d) {
    const c = this.dialCanvas.getContext('2d'), S = 1024, C = S / 2;
    c.clearRect(0, 0, S, S);
    const base = c.createRadialGradient(C, C * 0.9, 40, C, C, C);
    base.addColorStop(0, d.base); base.addColorStop(0.75, d.base); base.addColorStop(1, d.edge);
    c.fillStyle = base; c.fillRect(0, 0, S, S);
    if (d.sun) { // sunburst: thin radial rays of varying brightness
      c.save(); c.translate(C, C);
      for (let i = 0; i < 720; i++) { const a = (i / 720) * TAU; const v = (Math.sin(i * 12.9898) * 43758.5453) % 1; c.strokeStyle = `rgba(255,255,255,${Math.abs(v) * 0.07})`; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * C, Math.sin(a) * C); c.stroke(); }
      const sheen = c.createLinearGradient(-C, -C, C, C); sheen.addColorStop(0, 'rgba(255,255,255,.14)'); sheen.addColorStop(0.5, 'rgba(255,255,255,0)'); sheen.addColorStop(1, 'rgba(255,255,255,.08)');
      c.fillStyle = sheen; c.beginPath(); c.arc(0, 0, C, 0, TAU); c.fill(); c.restore();
    }
    // Minute track
    c.save(); c.translate(C, C); c.strokeStyle = d.ink; c.globalAlpha = 0.85;
    for (let i = 0; i < 60; i++) { const a = (i / 60) * TAU; const five = i % 5 === 0; c.lineWidth = five ? 4 : 2; const r1 = C * 0.955, r2 = C * (five ? 0.905 : 0.925); c.beginPath(); c.moveTo(Math.sin(a) * r1, -Math.cos(a) * r1); c.lineTo(Math.sin(a) * r2, -Math.cos(a) * r2); c.stroke(); }
    c.globalAlpha = 1; c.restore();
    // Brand & text
    c.fillStyle = d.ink; c.textAlign = 'center';
    c.font = '600 46px "Cormorant Garamond", Georgia, serif'; c.fillText('ATELIER HEURE', C, C - 170);
    c.font = '500 20px "Geist", Arial, sans-serif'; c.globalAlpha = 0.75; c.fillText('L Y O N', C, C - 136);
    c.font = 'italic 500 30px "Cormorant Garamond", Georgia, serif'; c.globalAlpha = 0.9; c.fillText('Automatique', C, C + 190);
    c.font = '500 16px "Geist", Arial, sans-serif'; c.globalAlpha = 0.6; c.fillText('100 M · SWISS-FREE · FAIT MAIN', C, C + 222);
    c.globalAlpha = 1;
    this.dialTex.needsUpdate = true;
  }

  drawBack(text) {
    const c = this.backCanvas.getContext('2d'), S = 1024, C = S / 2;
    const g = c.createRadialGradient(C, C, 0, C, C, C); g.addColorStop(0, '#f2f2f2'); g.addColorStop(1, '#c9c9c9');
    c.fillStyle = g; c.fillRect(0, 0, S, S);
    c.strokeStyle = 'rgba(0,0,0,.25)';
    for (let r = 40; r < C; r += 14) { c.lineWidth = 1; c.beginPath(); c.arc(C, C, r, 0, TAU); c.stroke(); } // turned finish
    c.lineWidth = 6; c.strokeStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.arc(C, C, C * 0.86, 0, TAU); c.stroke();
    c.fillStyle = 'rgba(30,30,30,.8)'; c.font = '500 30px "Geist", Arial, sans-serif';
    const ring = 'ATELIER HEURE · LYON · CALIBRE AH-01 · SAPHIR · ÉTANCHE 100 M · ';
    c.save(); c.translate(C, C);
    [...ring].forEach((ch, i) => { c.save(); c.rotate((i / ring.length) * TAU); c.fillText(ch, 0, -C * 0.76); c.restore(); });
    c.restore();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    if (text) { c.font = 'italic 600 150px "Cormorant Garamond", Georgia, serif'; c.fillStyle = 'rgba(25,25,25,.85)'; c.fillText(text, C, C); }
    else { c.font = '500 34px "Geist", Arial, sans-serif'; c.fillStyle = 'rgba(25,25,25,.35)'; c.fillText('Votre gravure ici', C, C); }
    c.textBaseline = 'alphabetic';
    this.backTex.needsUpdate = true;
  }

  /* ---------------- Configuration ---------------- */
  apply(cfg) {
    Object.assign(this.config, cfg);
    const cs = CASES[this.config.case], d = DIALS[this.config.dial], st = STRAPS[this.config.strap];
    this.caseMat.color.set(cs.color); this.caseMat.roughness = cs.roughness;
    this.polishMat.color.set(cs.color).offsetHSL(0, 0, 0.04); this.polishMat.roughness = Math.max(0.05, cs.roughness - 0.1);
    const handColor = this.config.case === 'or' ? '#f0c574' : this.config.case === 'dlc' ? '#e9e4da' : '#eef0f3';
    this.handMat.color.set(handColor); this.indexMat.color.set(handColor);
    this.drawDial(d);
    this.chapterMat.color.set(d.edge);
    this.secMat.color.set(this.config.dial === 'saumon' || this.config.dial === 'creme' ? '#1b2f5c' : '#e8572a');
    if (st.metal) { this.strapMat.color.set(cs.color); this.strapMat.metalness = 1; this.strapMat.roughness = 0.38; this.strapMat.sheen = 0; this.strapMat.specularIntensity = 1; this.strapMat.envMapIntensity = 1.1; }
    else { this.strapMat.color.set(st.color); this.strapMat.metalness = 0; this.strapMat.roughness = st.roughness; this.strapMat.sheen = st.sheen; this.strapMat.sheenColor.set(st.color).offsetHSL(0, 0, 0.12); this.strapMat.specularIntensity = st.sheen ? 0.35 : 0.15; this.strapMat.envMapIntensity = 0.6; }
    this.drawBack((this.config.engraving || '').slice(0, 12));
  }

  price(cfg = this.config) {
    return CASES[cfg.case].price + DIALS[cfg.dial].price + STRAPS[cfg.strap].price + (cfg.engraving ? ENGRAVING_PRICE : 0);
  }

  /* ---------------- Views ---------------- */
  setExplode(on) { this.explodeTarget = on ? 1 : 0; this.controls.autoRotate = false; this.view(on ? 'three' : 'face'); }
  view(name) {
    const P = { face: [0, 0, 7.2], profil: [6.9, 0.4, 1.6], dos: [0, 0.3, -7.2], three: [4.6, 3.2, 5.2] }[name];
    if (!P) return;
    const sa = new THREE.Spherical().setFromVector3(this.camera.position);
    const sb = new THREE.Spherical().setFromVector3(new THREE.Vector3(...P));
    sb.radius = this.camera.position.length() > 8.5 ? 9.4 : sb.radius; // keep the mobile framing
    let dTheta = sb.theta - sa.theta; dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta)); // shortest way round
    this.camTween = { sa, sb, dTheta, start: performance.now() };
    this.controls.autoRotate = false;
  }

  resize() {
    const p = this.canvas.parentElement, w = p.clientWidth, h = p.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.position.setLength(w / h < 0.8 ? 9.4 : 7.2);
    if (w / h > 1.05) this.camera.setViewOffset(w, h, -w * 0.09, 0, w, h); else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
  }

  frame() {
    const dt = Math.min(this.clock.getDelta(), 0.25);
    if (!this.visible) return;
    // Real time on the hands (Paris time)
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    const ms = Date.now() % 1000;
    const s = now.getSeconds() + ms / 1000, m = now.getMinutes() + s / 60, h = (now.getHours() % 12) + m / 60;
    this.hSec.rotation.y = -(s / 60) * TAU; this.hMin.rotation.y = -(m / 60) * TAU; this.hHour.rotation.y = -(h / 12) * TAU;
    // Exploded view
    this.explode += (this.explodeTarget - this.explode) * (1 - Math.exp(-dt * 5));
    const e = ease(Math.min(Math.max(this.explode, 0), 1));
    for (const p of Object.values(this.parts)) p.position.copy(p.userData.base).addScaledVector(p.userData.offset, e);
    // Camera tween
    if (this.camTween) {
      const t = Math.min(1, (performance.now() - this.camTween.start) / 1200);
      const k = ease(t);
      const A = this.camTween.sa, B = this.camTween.sb;
      const sp = new THREE.Spherical(THREE.MathUtils.lerp(A.radius, B.radius, k), THREE.MathUtils.lerp(A.phi, B.phi, k), A.theta + this.camTween.dTheta * k);
      this.camera.position.setFromSpherical(sp);
      if (t >= 1) this.camTween = null;
    }
    this.controls.update(dt);
    this.renderer.render(this.scene, this.camera);
  }
}
