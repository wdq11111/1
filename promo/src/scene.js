// 译比 TransCompare 宣传片：所有画面只由时间 t（秒）决定，render(t) 可任意抽帧。
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export const DURATION = 30;
const W = 1920, H = 1080;

// 品牌色：取自插件图标
const C = {
  blue: '#1d4ed8', navy: '#1e3a8a', yellow: '#fbbf24', white: '#ffffff',
  ink: '#0b1736', slate: '#cbd5e1', bar: '#bfdbfe',
};
const SANS = '"Noto Sans SC", "Inter", sans-serif';
const MONO = '"JetBrains Mono", "Noto Sans SC", monospace';

// 文案全部来自 plugins/transcompare/README.md
export const TEXT = {
  name: '译比 TransCompare',
  tagline: '多引擎翻译对比',
  source: '机器翻译的质量这几年提升了很多。',
  // MyMemory 的真实返回结果（开发时实测）
  mymemory: 'The quality of machine translation has improved a lot in recent years.',
  engines: ['DeepL', 'Google 翻译', '微软翻译', '百度翻译', '有道智云', 'Claude API', '自定义大模型', 'MyMemory'],
  cmd1: '/plugin marketplace add wdq11111/1',
  cmd2: '/plugin install transcompare@wdq11111-plugins',
  ok: '√ Successfully installed plugin: transcompare@wdq11111-plugins',
  url: 'github.com/wdq11111/1',
};

// ---------- 工具函数 ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const eio = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eout = k => 1 - Math.pow(1 - k, 3);
const eback = k => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
// 一个区间内的进入/退出可见度
const vis = (t, inA, inB, outA, outB) => Math.min(eout(seg(t, inA, inB)), 1 - eio(seg(t, outA, outB)));
// 确定性伪随机
const rand = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function canvasTex(wpx, hpx, draw) {
  const cv = document.createElement('canvas');
  cv.width = wpx; cv.height = hpx;
  const ctx = cv.getContext('2d');
  draw(ctx, wpx, hpx);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, cv, ctx };
}

function wrapText(ctx, text, maxW) {
  // 英文按词、中文按字换行
  const tokens = /[一-鿿]/.test(text) ? Array.from(text) : text.split(/(\s+)/);
  const lines = []; let cur = '';
  for (const tk of tokens) {
    const next = cur + tk;
    if (ctx.measureText(next).width > maxW && cur.trim()) { lines.push(cur.trim()); cur = tk.trimStart(); }
    else cur = next;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

// 圆角厚板
function slabGeometry(w, h, d, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const bevel = Math.min(0.06, d * 0.3);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: d - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel,
    bevelSegments: 4, curveSegments: 12,
  });
  g.translate(0, 0, -(d - bevel * 2) / 2);
  return g;
}

function slab({ w, h, d = 0.25, r = 0.28, color = C.white, rough = 0.35, clearcoat = 0.6, face, facePx = 220, faceBg }) {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color).multiplyScalar(0.82), roughness: rough, metalness: 0.05, clearcoat, clearcoatRoughness: 0.25, transparent: true,
  });
  const body = new THREE.Mesh(slabGeometry(w, h, d, r), mat);
  group.add(body);
  let faceMesh = null, faceTex = null;
  if (face) {
    faceTex = canvasTex(Math.round(w * facePx), Math.round(h * facePx), (ctx, pw, ph) => {
      const inset = Math.min(0.06, d * 0.3) * facePx;
      roundRectPath(ctx, inset, inset, pw - inset * 2, ph - inset * 2, Math.max(1, (r - Math.min(0.06, d * 0.3)) * facePx));
      ctx.fillStyle = faceBg || color; ctx.fill();
      face(ctx, pw, ph);
    });
    const fm = new THREE.MeshBasicMaterial({ map: faceTex.tex, transparent: true, toneMapped: false });
    faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), fm);
    faceMesh.position.z = d / 2 + 0.005;
    group.add(faceMesh);
  }
  group.userData = { mats: [mat, faceMesh?.material].filter(Boolean), faceTex, faceMesh, w, h, d };
  return group;
}

function setOpacity(obj, o) {
  obj.visible = o > 0.003;
  for (const m of obj.userData.mats || []) m.opacity = o;
}

// ---------- 场景 ----------
export function createScene(canvas, overlay) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  // 背景：深蓝径向渐变
  const bg = canvasTex(W, H, (ctx) => {
    const g = ctx.createRadialGradient(W * 0.5, H * 0.42, 50, W * 0.5, H * 0.5, W * 0.75);
    g.addColorStop(0, '#1a3a9c'); g.addColorStop(0.45, '#0f2366'); g.addColorStop(1, '#050b22');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  });
  scene.background = bg.tex;

  const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 200);

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(-6, 8, 10); scene.add(key);
  const rim = new THREE.DirectionalLight(0xfbbf24, 0.9);
  rim.position.set(8, -2, -6); scene.add(rim);

  // 漂浮粒子
  const N = 700;
  const pBase = new Float32Array(N * 3), pPos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pBase[i * 3] = (rand(i) - 0.5) * 60;
    pBase[i * 3 + 1] = (rand(i + 1000) - 0.5) * 34;
    pBase[i * 3 + 2] = -rand(i + 2000) * 40 + 4;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const dot = canvasTex(64, 64, (ctx) => {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(180,200,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  });
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.16, map: dot.tex, transparent: true, depthWrite: false, opacity: 0.55, blending: THREE.AdditiveBlending,
  }));
  scene.add(particles);

  // ---- 图标：两块圆角板 ----
  const logo = new THREE.Group();
  const tileA = slab({
    w: 3.0, h: 2.3, d: 0.5, r: 0.5, color: C.white,
    face: (ctx, w, h) => { ctx.fillStyle = C.blue; ctx.font = `700 ${h * 0.62}px Inter, ${SANS}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('A', w / 2, h * 0.53); },
  });
  const tileB = slab({
    w: 3.0, h: 2.3, d: 0.5, r: 0.5, color: C.yellow,
    face: (ctx, w, h) => { ctx.fillStyle = C.navy; ctx.font = `700 ${h * 0.6}px ${SANS}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('译', w / 2, h * 0.53); },
  });
  logo.add(tileA, tileB);
  scene.add(logo);

  // ---- 原文卡片 ----
  const srcCard = slab({
    w: 4.6, h: 2.7, d: 0.22, r: 0.3, color: C.white, facePx: 260,
    face: (ctx, w, h) => {
      ctx.fillStyle = C.blue; ctx.font = `700 ${h * 0.085}px ${SANS}`; ctx.textBaseline = 'top';
      ctx.fillText('原文 · 中文', w * 0.08, h * 0.12);
      ctx.fillStyle = C.ink; ctx.font = `700 ${h * 0.13}px ${SANS}`;
      const lines = wrapText(ctx, TEXT.source, w * 0.84);
      lines.forEach((l, i) => ctx.fillText(l, w * 0.08, h * 0.36 + i * h * 0.19));
    },
  });
  scene.add(srcCard);

  // ---- 引擎卡片 ----
  const CW = 4.2, CH = 1.55;
  const cardPos = [];
  for (let i = 0; i < 8; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    cardPos.push(new THREE.Vector3(col === 0 ? 0.9 : 5.5, 3.8 - row * 1.85, 0));
  }
  const engineCards = TEXT.engines.map((name, i) => {
    const card = slab({
      w: CW, h: CH, d: 0.16, r: 0.22, color: '#f8fafc', facePx: 240,
      face: (ctx, w, h) => {
        ctx.fillStyle = i === 5 ? '#d97706' : C.blue;
        ctx.beginPath(); ctx.arc(w * 0.075, h * 0.22, h * 0.055, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.ink; ctx.font = `700 ${h * 0.18}px ${SANS}`; ctx.textBaseline = 'middle';
        ctx.fillText(name, w * 0.12, h * 0.22);
      },
    });
    // 结果条（表示译文正在返回；不写具体译文，避免编造）
    const bars = [];
    const widths = [0.84, 0.72, 0.5].map((x, k) => x - rand(i * 7 + k) * 0.12);
    widths.forEach((bw, k) => {
      const g = new THREE.PlaneGeometry(1, 0.13);
      g.translate(0.5, 0, 0);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: C.bar, transparent: true, toneMapped: false }));
      m.position.set(-CW / 2 + CW * 0.07, CH * 0.02 - k * 0.27, 0.09);
      m.userData.full = bw * CW;
      card.add(m); bars.push(m);
      card.userData.mats.push(m.material);
    });
    // 完成对勾
    const check = canvasTex(96, 96, (ctx) => {
      ctx.fillStyle = '#16a34a'; ctx.beginPath(); ctx.arc(48, 48, 44, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(27, 50); ctx.lineTo(42, 64); ctx.lineTo(70, 34); ctx.stroke();
    });
    const chk = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ map: check.tex, transparent: true, toneMapped: false }));
    chk.position.set(CW / 2 - 0.32, CH / 2 - 0.34, 0.09);
    card.add(chk); card.userData.mats.push(chk.material);
    card.userData.bars = bars; card.userData.chk = chk;
    scene.add(card);
    return card;
  });
  // MyMemory 卡片上的真实译文
  const mmText = canvasTex(Math.round(CW * 240), Math.round(CH * 0.66 * 240), (ctx, w, h) => {
    ctx.fillStyle = C.ink; ctx.font = `500 ${h * 0.22}px Inter, ${SANS}`; ctx.textBaseline = 'top';
    wrapText(ctx, TEXT.mymemory, w * 0.86).forEach((l, i) => ctx.fillText(l, w * 0.07, h * 0.06 + i * h * 0.32));
  });
  const mmMesh = new THREE.Mesh(new THREE.PlaneGeometry(CW, CH * 0.66),
    new THREE.MeshBasicMaterial({ map: mmText.tex, transparent: true, toneMapped: false }));
  mmMesh.position.set(0, -CH * 0.15, 0.095);
  engineCards[7].add(mmMesh);

  // ---- 光束：原文 → 各引擎 ----
  const beams = cardPos.map(() => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 8),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(C.yellow).multiplyScalar(2.2), transparent: true, toneMapped: false }));
    const packet = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16),
      new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff7d6').multiplyScalar(3), transparent: true, toneMapped: false }));
    scene.add(m, packet);
    return { m, packet };
  });

  // ---- Claude 推荐卡 ----
  const recCard = slab({
    w: 7.4, h: 3.4, d: 0.3, r: 0.4, color: C.yellow, facePx: 220,
    face: (ctx, w, h) => {
      ctx.fillStyle = C.navy; ctx.font = `900 ${h * 0.12}px ${SANS}`; ctx.textBaseline = 'middle';
      ctx.fillText('★ 推荐译法', w * 0.07, h * 0.2);
      ctx.font = `700 ${h * 0.075}px ${SANS}`; ctx.globalAlpha = 0.75; ctx.textAlign = 'right';
      ctx.fillText('Claude', w * 0.93, h * 0.2);
    },
  });
  const recBars = [0.86, 0.78, 0.55].map((bw, k) => {
    const g = new THREE.PlaneGeometry(1, 0.2); g.translate(0.5, 0, 0);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#fff7e0', transparent: true, toneMapped: false }));
    m.position.set(-3.7 + 0.52, 0.15 - k * 0.48, 0.16);
    m.userData.full = bw * 7.4;
    recCard.add(m); recCard.userData.mats.push(m.material);
    return m;
  });
  scene.add(recCard);

  // ---- 终端 ----
  const TW = 10.4, TH = 3.5, TPX = 200;
  const term = slab({ w: TW, h: TH, d: 0.3, r: 0.35, color: '#0f172a', rough: 0.25, clearcoat: 1 });
  const termTex = canvasTex(TW * TPX, TH * TPX, () => {});
  const termFace = new THREE.Mesh(new THREE.PlaneGeometry(TW, TH),
    new THREE.MeshBasicMaterial({ map: termTex.tex, transparent: true, toneMapped: false }));
  termFace.position.z = 0.16;
  term.add(termFace); term.userData.mats.push(termFace.material);
  scene.add(term);
  let termKey = '';
  function drawTerm(n1, n2, okVis, cursorOn) {
    const k = `${n1}|${n2}|${okVis.toFixed(2)}|${cursorOn}`;
    if (k === termKey) return;
    termKey = k;
    const { ctx } = termTex; const w = TW * TPX, h = TH * TPX;
    ctx.clearRect(0, 0, w, h);
    roundRectPath(ctx, 12, 12, w - 24, h - 24, 0.3 * TPX); ctx.fillStyle = '#0f172a'; ctx.fill();
    ctx.fillStyle = '#1e293b'; ctx.fillRect(12 + 0.3 * TPX, 12, w - 24 - 0.6 * TPX, 0); 
    ['#f87171', '#fbbf24', '#4ade80'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(70 + i * 56, 64, 18, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = '#64748b'; ctx.font = `500 34px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Claude Code', w / 2, 64);
    ctx.textAlign = 'left';
    ctx.font = `500 54px ${MONO}`;
    const y0 = 250, lh = 125;
    const line = (y, prompt, text) => {
      ctx.fillStyle = C.yellow; ctx.fillText('>', 80, y);
      ctx.fillStyle = '#e2e8f0'; ctx.fillText(text, 140, y);
      return 140 + ctx.measureText(text).width;
    };
    let cx = 140, cy = y0;
    cx = line(y0, '>', TEXT.cmd1.slice(0, n1));
    if (n2 > 0 || n1 >= TEXT.cmd1.length) { cy = y0 + lh; cx = line(cy, '>', TEXT.cmd2.slice(0, n2)); }
    if (okVis > 0) {
      ctx.globalAlpha = okVis; ctx.fillStyle = '#4ade80'; ctx.font = `600 46px ${MONO}`;
      ctx.fillText(TEXT.ok, 80, y0 + lh * 2.25); ctx.globalAlpha = 1;
    } else if (cursorOn) {
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(cx + 6, cy - 30, 26, 60);
    }
    termTex.tex.needsUpdate = true;
  }

  // ---- 后期：泛光 ----
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(1); composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.6, 0.5, 1.0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---- 镜头关键帧 [t, 位置xyz, 目标xyz] ----
  const camKeys = [
    [0, [0, 0.4, 22], [0, 0.4, 0]],
    [3.6, [0.6, 0.2, 17], [0, 0.4, 0]],
    [5.0, [-1.2, 0.4, 16], [-0.6, 0, 0]],
    [8.6, [-1.6, 0.2, 14.5], [-0.8, 0, 0]],
    [9.8, [-3.5, 1.2, 19.5], [0, 0.2, 0]],
    [16.4, [-1.5, 0.6, 18.5], [0.3, 0.2, 0]],
    [18.2, [0, 0.3, 17], [0, 0.2, 0]],
    [21.6, [0.8, 0.1, 15.5], [0, 0.2, 0]],
    [23.0, [-1.5, 0.8, 16], [0, 0.4, 0]],
    [26.6, [1.0, 0.2, 14.8], [0, 0.4, 0]],
    [28.0, [0, 0.4, 17.5], [0, 0.6, 0]],
    [30, [0, 0.4, 16.5], [0, 0.6, 0]],
  ];
  function cam(t) {
    let i = 0;
    while (i < camKeys.length - 2 && t > camKeys[i + 1][0]) i++;
    const [ta, pa, la] = camKeys[i], [tb, pb, lb] = camKeys[i + 1];
    const k = eio(seg(t, ta, tb));
    camera.position.set(lerp(pa[0], pb[0], k), lerp(pa[1], pb[1], k), lerp(pa[2], pb[2], k));
    camera.lookAt(lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k));
  }

  // ---- HTML 字幕 ----
  const el = (id) => overlay.querySelector('#' + id);
  const cap = el('cap'), sub = el('sub'), title = el('title'), tag = el('tag'), url = el('url');
  function setEl(e, text, o, dy = 0) {
    if (e.textContent !== text) e.textContent = text;
    e.style.opacity = o.toFixed(3);
    e.style.transform = `translateY(${dy.toFixed(1)}px)`;
  }
  const captions = [
    // [入场开始, 入场结束, 出场开始, 出场结束, 主字幕, 副字幕]
    [4.9, 5.5, 8.6, 9.0, '把同一段文字', ''],
    [9.6, 10.2, 16.4, 16.9, '同时交给多个翻译引擎', '结果并排对比'],
    [17.6, 18.2, 21.6, 22.0, 'Claude 也给出自己的译文', '并推荐最终译法'],
    [22.6, 23.2, 26.6, 27.0, 'Claude Code 插件 · 两条命令安装', '不填密钥也能用：MyMemory 免费引擎默认开启'],
  ];

  function render(t) {
    cam(t);

    // 粒子缓慢漂移
    for (let i = 0; i < N; i++) {
      pPos[i * 3] = pBase[i * 3] + Math.sin(t * 0.3 + i) * 0.4;
      pPos[i * 3 + 1] = ((pBase[i * 3 + 1] + 17 + t * 0.25) % 34) - 17;
      pPos[i * 3 + 2] = pBase[i * 3 + 2];
    }
    pGeo.attributes.position.needsUpdate = true;

    // ---- 图标 ----
    {
      const fly = eback(seg(t, 0.2, 1.8));
      const spin = 1 - eout(seg(t, 0.2, 2.2));
      // 0~4.6 居中；4.6~5.6 缩小飞走；27~ 回来
      const outK = eio(seg(t, 4.4, 5.4));
      const backK = eout(seg(t, 26.9, 28.0));
      const show = t < 5.4 ? 1 : backK;
      logo.visible = show > 0.01;
      const s = t < 5.4 ? lerp(1, 0.35, outK) : lerp(0.35, 1, backK);
      logo.scale.setScalar(s);
      const lx = t < 5.4 ? lerp(0, -6, outK) : 0;
      const ly = t < 5.4 ? lerp(1.0, 4.2, outK) : lerp(4.2, 1.1, backK);
      logo.position.set(lx, ly, t < 5.4 ? lerp(0, -4, outK) : lerp(-4, 0, backK));
      logo.rotation.y = Math.sin(t * 0.8) * 0.12 + (t > 26 ? (1 - backK) * Math.PI * 2 : 0);
      logo.rotation.x = Math.sin(t * 0.6) * 0.05;
      tileA.position.set(lerp(-9, -0.75, fly), lerp(4, 0.45, fly), lerp(-12, 0, fly));
      tileB.position.set(lerp(9, 0.75, fly), lerp(-4, -0.45, fly), lerp(-12, 0.3, fly));
      tileA.rotation.set(spin * 2.2, spin * -3.0, spin * 0.6);
      tileB.rotation.set(spin * -2.0, spin * 3.2, spin * -0.5);
      const fade = t < 5.4 ? 1 - seg(t, 5.0, 5.4) : backK;
      setOpacity(tileA, fade); setOpacity(tileB, fade);
    }

    // ---- 原文卡片 ----
    {
      const inK = eout(seg(t, 4.8, 6.0));
      const moveK = eio(seg(t, 9.0, 10.2));
      const outK = eio(seg(t, 16.6, 17.4));
      const o = Math.min(inK, 1 - outK);
      setOpacity(srcCard, o);
      srcCard.position.set(lerp(-0.8, -6.0, moveK), lerp(-0.2, 0.3, moveK), lerp(-3, 0, inK) - outK * 4);
      srcCard.rotation.y = lerp(1.2, 0, inK) + moveK * 0.22 + Math.sin(t * 0.7) * 0.03;
      srcCard.rotation.x = Math.sin(t * 0.5) * 0.03;
      srcCard.scale.setScalar(lerp(1.15, 1, moveK));
    }

    // ---- 引擎卡片 + 光束 ----
    const srcEdge = new THREE.Vector3();
    srcCard.updateMatrixWorld();
    srcEdge.set(2.3, 0, 0.12).applyMatrix4(srcCard.matrixWorld);
    const recOut = eio(seg(t, 17.0, 18.4));       // 退到后面
    const allOut = eio(seg(t, 22.0, 22.8));       // 完全消失
    engineCards.forEach((card, i) => {
      const d = i * 0.12;
      const inK = eback(seg(t, 9.4 + d, 10.4 + d));
      const p = cardPos[i];
      card.position.set(
        lerp(p.x + 6, p.x, inK) - recOut * (p.x - 3.2) * 0.25,
        p.y * lerp(1, 0.92, recOut),
        lerp(-8, 0, eout(seg(t, 9.4 + d, 10.4 + d))) - recOut * 7,
      );
      card.rotation.y = lerp(-1.4, -0.16, eout(seg(t, 9.4 + d, 10.6 + d))) + Math.sin(t * 0.8 + i) * 0.025;
      card.rotation.x = Math.sin(t * 0.6 + i * 0.7) * 0.025;
      const o = Math.min(eout(seg(t, 9.4 + d, 10.0 + d)), lerp(1, 0.45, recOut), 1 - allOut);
      setOpacity(card, o);
      // 结果条依次返回（各引擎速度不同）
      const start = 11.0 + rand(i + 50) * 1.0;
      const dur = 0.9 + rand(i + 80) * 1.4;
      const isMM = i === 7;
      card.userData.bars.forEach((b, k) => {
        const kk = eout(seg(t, start + k * 0.18, start + dur + k * 0.18));
        b.scale.x = Math.max(0.0001, b.userData.full * kk);
        const shimmer = 0.75 + 0.25 * Math.sin(t * 6 - k - i);
        b.material.color.set(kk >= 1 ? '#93c5fd' : C.bar).multiplyScalar(kk >= 1 ? 1 : shimmer);
        b.material.opacity = o * (isMM ? 1 - seg(t, 13.6, 14.0) : 1);
      });
      const doneT = start + dur + 0.36;
      const ck = eback(seg(t, doneT, doneT + 0.35));
      card.userData.chk.scale.setScalar(Math.max(0.0001, ck));
      card.userData.chk.material.opacity = o;
      // 光束
      const { m, packet } = beams[i];
      card.updateMatrixWorld();
      const end = new THREE.Vector3(-CW / 2, 0, 0.08).applyMatrix4(card.matrixWorld);
      const bk = eio(seg(t, 9.9 + d, 10.8 + d));
      const bo = Math.min(bk, 1 - seg(t, 15.8, 16.6));
      const cur = srcEdge.clone().lerp(end, bk);
      const mid = srcEdge.clone().add(cur).multiplyScalar(0.5);
      const len = srcEdge.distanceTo(cur);
      m.visible = bo > 0.01 && len > 0.01;
      m.position.copy(mid);
      m.scale.set(1, Math.max(len, 0.001), 1);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cur.clone().sub(srcEdge).normalize());
      m.material.opacity = bo * 0.85;
      const pk = ((t - 10.6 - rand(i) * 0.8) * 0.9) % 1;
      packet.visible = t > 10.6 && t < 15.8 && pk > 0;
      packet.position.copy(srcEdge.clone().lerp(end, Math.max(0, pk)));
      packet.material.opacity = bo;
    });
    mmMesh.material.opacity = Math.min(seg(t, 13.6, 14.1), engineCards[7].userData.mats[0].opacity);
    mmMesh.visible = mmMesh.material.opacity > 0.01;

    // ---- 推荐卡 ----
    {
      const inK = eback(seg(t, 17.6, 18.8));
      const outK = eio(seg(t, 21.8, 22.6));
      setOpacity(recCard, Math.min(eout(seg(t, 17.5, 18.1)), 1 - outK));
      recCard.position.set(0, lerp(-6, 0.6, inK) + outK * 5, lerp(2, 1.5, inK));
      recCard.rotation.x = lerp(-1.0, 0, inK) + Math.sin(t * 0.7) * 0.03;
      recCard.rotation.y = Math.sin(t * 0.5) * 0.06;
      recBars.forEach((b, k) => {
        const kk = eout(seg(t, 18.6 + k * 0.25, 19.8 + k * 0.25));
        b.scale.x = Math.max(0.0001, b.userData.full * kk);
      });
    }

    // ---- 终端 ----
    {
      const inK = eout(seg(t, 22.4, 23.4));
      const outK = eio(seg(t, 26.6, 27.3));
      setOpacity(term, Math.min(inK, 1 - outK));
      term.position.set(0, lerp(-1, 0.8, inK), lerp(-6, 0, inK) - outK * 6);
      term.rotation.y = lerp(0.9, -0.08, inK) + Math.sin(t * 0.6) * 0.03;
      term.rotation.x = lerp(0.3, 0.04, inK);
      const n1 = Math.floor(clamp((t - 23.2) * 30, 0, TEXT.cmd1.length));
      const n2 = Math.floor(clamp((t - 24.5) * 34, 0, TEXT.cmd2.length));
      const ok = seg(t, 26.0, 26.25);
      drawTerm(n1, n2, ok, Math.floor(t * 2.5) % 2 === 0);
    }

    // ---- 字幕 ----
    let shown = null;
    for (const c of captions) if (t >= c[0] - 0.1 && t <= c[3] + 0.1) shown = c;
    if (shown) {
      const o = vis(t, shown[0], shown[1], shown[2], shown[3]);
      setEl(cap, shown[4], o, (1 - eout(seg(t, shown[0], shown[1]))) * 30);
      const so = vis(t, shown[0] + 0.25, shown[1] + 0.25, shown[2], shown[3]);
      setEl(sub, shown[5], so, (1 - eout(seg(t, shown[0] + 0.25, shown[1] + 0.25))) * 24);
    } else { setEl(cap, '', 0); setEl(sub, '', 0); }

    const titleO = t < 10 ? vis(t, 1.8, 2.5, 4.3, 4.8) : eout(seg(t, 27.6, 28.3));
    setEl(title, TEXT.name, titleO, (1 - eout(seg(t, t < 10 ? 1.8 : 27.6, t < 10 ? 2.5 : 28.3))) * 30);
    const tagO = t < 10 ? vis(t, 2.3, 3.0, 4.3, 4.8) : eout(seg(t, 28.0, 28.7));
    setEl(tag, TEXT.tagline, tagO, (1 - eout(seg(t, t < 10 ? 2.3 : 28.0, t < 10 ? 3.0 : 28.7))) * 24);
    setEl(url, TEXT.url, eout(seg(t, 28.4, 29.0)));

    // 结尾淡出到黑
    overlay.querySelector('#fade').style.opacity = (seg(t, 29.5, 30) * 0.0).toFixed(3);

    composer.render();
  }

  return { render };
}
