/* 渲染核心：renderFrame(t) 只依赖时间 t，逐帧确定性输出。
   背景（星云 / 星点 / 透视网格 / 光斑）、HUD、字幕、转场光扫、颗粒都在这里；各镜头在 scenes.js。 */
'use strict';
const W = 1920, H = 1080;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---------- 数学与缓动 ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  lin: t => t,
  inC: t => t * t * t,
  outC: t => 1 - Math.pow(1 - t, 3),
  outQ: t => 1 - Math.pow(1 - t, 4),
  inOutC: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outBackS: t => { const c1 = 1.1, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: t => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 3)) + 1),
};
/** 进度：从 a 开始、持续 d 秒，返回缓动后的 0..1 */
const pr = (lt, a, d, e = E.outC) => e(clamp((lt - a) / d));
function mulberry32(a) {
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

/* ---------- DOM 工具 ---------- */
function h(tag, cls, html, parent) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html != null) el.innerHTML = html;
  if (parent) parent.appendChild(el);
  return el;
}
const SVGNS = 'http://www.w3.org/2000/svg';
function sv(tag, attrs, parent) {
  const el = document.createElementNS(SVGNS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
}
/** 带缓存的样式写入，值没变就不碰 DOM */
function st(el, prop, val) {
  const c = el.__s || (el.__s = {});
  if (c[prop] === val) return;
  c[prop] = val;
  if (prop.startsWith('--')) el.style.setProperty(prop, val); else el.style[prop] = val;
}
function sa(el, attr, val) {
  const c = el.__a || (el.__a = {});
  if (c[attr] === val) return;
  c[attr] = val;
  el.setAttribute(attr, val);
}
function txt(el, s) { if (el.__t !== s) { el.__t = s; el.textContent = s; } }
/** 常用的“出现”动画：透明度 + 位移 + 模糊 */
function reveal(el, p, { dx = 0, dy = 30, blur = 10, scale = 1, extra = '' } = {}) {
  st(el, 'opacity', p.toFixed(3));
  const s = lerp(scale, 1, p);
  st(el, 'transform', `translate(${(dx * (1 - p)).toFixed(1)}px, ${(dy * (1 - p)).toFixed(1)}px) scale(${s.toFixed(4)}) ${extra}`);
  st(el, 'filter', p >= 0.999 || blur === 0 ? 'none' : `blur(${(blur * (1 - p)).toFixed(2)}px)`);
}
const pad2 = n => String(n).padStart(2, '0');

/* ---------- 日期 ---------- */
const DAY = 86400000;
const D = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const days = (a, b) => Math.round((D(b) - D(a)) / DAY);

/* ---------- 全局状态 ---------- */
let TL = null;              // timeline.json
const SCN = {};             // 镜头定义，由 scenes.js 注册
let RUN = [];               // 运行时镜头
let SUBS = [];
const bg = { ctx: null, neb: [], stars: [], bokeh: [] };

/* 每个镜头的背景氛围：warm 暖色星云，cool 冷色星云，grid 透视网格，rays 光芒 */
const MOOD = {
  s01: { warm: .9, cool: .35, grid: .25, star: 1.0 },
  s02: { warm: .8, cool: .8, grid: .7, star: 1.0 },
  s03: { warm: .85, cool: .45, grid: .35, star: .8 },
  s04: { warm: .7, cool: .75, grid: .3, star: .8 },
  s05: { warm: .5, cool: .6, grid: .55, star: .9 },
  s06: { warm: .95, cool: .3, grid: .35, star: .7 },
  s07: { warm: .65, cool: .7, grid: .45, star: .9 },
  s08: { warm: .45, cool: .9, grid: .3, star: .8 },
  s09: { warm: .75, cool: .7, grid: .4, star: .8 },
  s10: { warm: .3, cool: .85, grid: .5, star: .9 },
  s11: { warm: .45, cool: .4, grid: .2, star: .6 },
  s12: { warm: 1.0, cool: .55, grid: .6, star: 1.0 },
};

/* ---------- 背景 ---------- */
function makeNebula(seed, palette) {
  const w = 384, h = 216;
  const rnd = mulberry32(seed);
  const G = 64, grid = [];
  for (let i = 0; i < G * G; i++) grid.push(rnd());
  const vn = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const g = (a, b) => grid[((a % G) + G) % G + (((b % G) + G) % G) * G];
    const sx = xf * xf * (3 - 2 * xf), sy = yf * yf * (3 - 2 * yf);
    return lerp(lerp(g(xi, yi), g(xi + 1, yi), sx), lerp(g(xi, yi + 1), g(xi + 1, yi + 1), sx), sy);
  };
  const fbm = (x, y) => { let v = 0, a = .5, f = 1; for (let o = 0; o < 6; o++) { v += a * vn(x * f, y * f); f *= 2.03; a *= .5; } return v; };
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const cx = c.getContext('2d'); const img = cx.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const nx = x / w * 5.2, ny = y / h * 2.9;
    const q = fbm(nx + 1.7 * fbm(nx + 3.1, ny + 1.3), ny + 1.7 * fbm(nx - 2.2, ny + 4.4));
    let v = clamp((q - .42) * 2.6);
    v = v * v;
    const m = fbm(nx * .7 + 9, ny * .7 + 9);
    const [c1, c2] = palette;
    const r = lerp(c1[0], c2[0], m), g = lerp(c1[1], c2[1], m), b = lerp(c1[2], c2[2], m);
    const i = (y * w + x) * 4;
    img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = clamp(v) * 255;
  }
  cx.putImageData(img, 0, 0);
  return c;
}

function setupBg() {
  const c = $('#bg'); bg.ctx = c.getContext('2d');
  bg.neb = [
    makeNebula(11, [[255, 150, 70], [255, 90, 110]]),   // 暖
    makeNebula(29, [[130, 110, 255], [60, 200, 255]]),   // 冷
  ];
  const rnd = mulberry32(7);
  const layers = [[300, .5, 1.1, 5], [130, 1.1, 1.9, 11], [34, 1.8, 3.0, 19]];
  layers.forEach(([n, r0, r1, sp], li) => {
    for (let i = 0; i < n; i++) bg.stars.push({ x: rnd() * (W + 80), y: rnd() * H, r: lerp(r0, r1, rnd()), a: lerp(.25, .9, rnd()), sp, ph: rnd() * 6.28, w: lerp(.6, 2.4, rnd()), li, hue: rnd() });
  });
  for (let i = 0; i < 26; i++) bg.bokeh.push({ x: rnd() * W, y: rnd() * H, r: lerp(18, 80, rnd()), a: lerp(.025, .07, rnd()), sp: lerp(4, 14, rnd()), warm: rnd() < .5, ph: rnd() * 6.28 });
  // 颗粒噪声贴图
  const g = $('#grain'); bg.gctx = g.getContext('2d'); bg.grainTiles = [];
  const gr = mulberry32(99);
  for (let k = 0; k < 4; k++) {
    const t = document.createElement('canvas'); t.width = 256; t.height = 256;
    const tc = t.getContext('2d'); const im = tc.createImageData(256, 256);
    for (let i = 0; i < 256 * 256; i++) { const v = gr() * 255; im.data[i * 4] = v; im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    tc.putImageData(im, 0, 0); bg.grainTiles.push(bg.gctx.createPattern(t, 'repeat'));
  }
  bg.fctx = $('#fx').getContext('2d');
}

function moodAt(t) {
  // 在镜头边界前后 0.8s 内平滑过渡
  let cur = RUN[0];
  for (const s of RUN) if (t >= s.start) cur = s;
  const i = RUN.indexOf(cur);
  const m0 = MOOD[cur.id];
  const next = RUN[i + 1];
  if (next && t > next.start - .8) {
    const k = E.inOutC(clamp((t - (next.start - .8)) / 1.6));
    const m1 = MOOD[next.id], o = {};
    for (const key in m0) o[key] = lerp(m0[key], m1[key], k);
    return o;
  }
  const prev = RUN[i - 1];
  if (prev && t < cur.start + .8) {
    const k = E.inOutC(clamp((t - (cur.start - .8)) / 1.6));
    const mp = MOOD[prev.id], o = {};
    for (const key in m0) o[key] = lerp(mp[key], m0[key], k);
    return o;
  }
  return m0;
}

function drawBg(t) {
  const c = bg.ctx, m = moodAt(t);
  c.globalCompositeOperation = 'source-over';
  const g = c.createRadialGradient(960, 420, 60, 960, 520, 1250);
  g.addColorStop(0, '#0E1430'); g.addColorStop(.55, '#080C1C'); g.addColorStop(1, '#03050B');
  c.fillStyle = g; c.fillRect(0, 0, W, H);

  // 星云：两张噪声贴图放大漂移
  c.globalCompositeOperation = 'lighter';
  const dw = 2500, dh = 1406;
  c.globalAlpha = .42 * m.warm;
  c.drawImage(bg.neb[0], -300 + Math.sin(t * .045) * 130, -180 + Math.cos(t * .05) * 55, dw, dh);
  c.globalAlpha = .46 * m.cool;
  c.drawImage(bg.neb[1], -400 + Math.cos(t * .04) * 115, -200 + Math.sin(t * .055) * 65, dw, dh);
  c.globalAlpha = 1;

  // 柔和光斑
  for (const b of bg.bokeh) {
    const y = ((b.y - t * b.sp) % (H + 200) + H + 200) % (H + 200) - 100;
    const x = b.x + Math.sin(t * .3 + b.ph) * 30;
    const rg = c.createRadialGradient(x, y, 0, x, y, b.r);
    const col = b.warm ? '255,170,100' : '140,150,255';
    rg.addColorStop(0, `rgba(${col},${b.a})`); rg.addColorStop(.6, `rgba(${col},${b.a * .5})`); rg.addColorStop(1, `rgba(${col},0)`);
    c.fillStyle = rg; c.beginPath(); c.arc(x, y, b.r, 0, 6.2832); c.fill();
  }

  // 星点
  for (const s of bg.stars) {
    const x = ((s.x - t * s.sp) % (W + 80) + W + 80) % (W + 80) - 40;
    const tw = .65 + .35 * Math.sin(t * s.w + s.ph);
    const a = s.a * tw * m.star;
    const col = s.hue < .2 ? '255,214,170' : s.hue > .85 ? '190,200,255' : '235,240,255';
    c.fillStyle = `rgba(${col},${a.toFixed(3)})`;
    c.beginPath(); c.arc(x, s.y, s.r, 0, 6.2832); c.fill();
    if (s.li === 2) {
      c.strokeStyle = `rgba(${col},${(a * .35).toFixed(3)})`; c.lineWidth = 1;
      c.beginPath(); c.moveTo(x - s.r * 5, s.y); c.lineTo(x + s.r * 5, s.y); c.moveTo(x, s.y - s.r * 5); c.lineTo(x, s.y + s.r * 5); c.stroke();
    }
  }

  // 透视网格地面
  if (m.grid > .01) {
    const hz = 735, vpX = 960;
    c.globalCompositeOperation = 'lighter';
    c.lineWidth = 1.2;
    for (let i = -26; i <= 26; i++) {
      const xb = vpX + i * 210, xt = vpX + i * 26;
      const lg = c.createLinearGradient(0, hz, 0, H);
      lg.addColorStop(0, 'rgba(90,170,255,0)'); lg.addColorStop(1, `rgba(90,170,255,${(.16 * m.grid).toFixed(3)})`);
      c.strokeStyle = lg; c.beginPath(); c.moveTo(xt, hz); c.lineTo(xb, H); c.stroke();
    }
    const sp = (t * .22) % 1;
    for (let k = 0; k < 14; k++) {
      const z = (k + 1 - sp) / 14;            // 0..1，越大越近
      const y = hz + (H - hz) * Math.pow(z, 2.6);
      const a = .18 * m.grid * Math.pow(z, 1.4);
      c.strokeStyle = `rgba(90,170,255,${a.toFixed(3)})`;
      c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
    }
    // 地平线辉光
    const hg = c.createLinearGradient(0, hz - 50, 0, hz + 50);
    hg.addColorStop(0, 'rgba(120,160,255,0)'); hg.addColorStop(.5, `rgba(140,170,255,${(.10 * m.grid).toFixed(3)})`); hg.addColorStop(1, 'rgba(120,160,255,0)');
    c.fillStyle = hg; c.fillRect(0, hz - 50, W, 100);
  }
  c.globalCompositeOperation = 'source-over';
}

/* 转场光扫 + 闪光，画在 screen 混合的 fx 层上 */
function drawFx(t) {
  const c = bg.fctx;
  c.clearRect(0, 0, W, H);
  for (let i = 1; i < RUN.length; i++) {
    const b = RUN[i].start, u = (t - (b - .55)) / 1.1;
    if (u <= 0 || u >= 1) continue;
    const k = Math.sin(Math.PI * u);
    const x = lerp(-900, W + 900, E.inOutC(u));
    c.save(); c.translate(x, H / 2); c.rotate(-.32);
    const lg = c.createLinearGradient(-420, 0, 420, 0);
    lg.addColorStop(0, 'rgba(255,170,100,0)');
    lg.addColorStop(.42, `rgba(255,170,110,${(.10 * k).toFixed(3)})`);
    lg.addColorStop(.5, `rgba(255,240,220,${(.30 * k).toFixed(3)})`);
    lg.addColorStop(.58, `rgba(150,160,255,${(.10 * k).toFixed(3)})`);
    lg.addColorStop(1, 'rgba(150,160,255,0)');
    c.fillStyle = lg; c.fillRect(-420, -1400, 840, 2800);
    c.restore();
  }
  // 片名落版的闪白 + 横向镜头光
  const s2 = RUN.find(s => s.id === 's02');
  if (s2) {
    const u = t - s2.start;
    if (u > -0.05 && u < 1.6) {
      const k = Math.exp(-Math.max(0, u) * 3.2);
      c.fillStyle = `rgba(255,235,215,${(.55 * k).toFixed(3)})`; c.fillRect(0, 0, W, H);
      const y = 498, len = 1500 * E.outExpo(clamp(u / .5));
      const lg = c.createLinearGradient(960 - len, 0, 960 + len, 0);
      lg.addColorStop(0, 'rgba(255,170,90,0)'); lg.addColorStop(.5, `rgba(255,240,220,${(.9 * Math.exp(-u * 1.6)).toFixed(3)})`); lg.addColorStop(1, 'rgba(140,150,255,0)');
      c.fillStyle = lg; c.fillRect(960 - len, y - 3, len * 2, 6);
      const rg = c.createRadialGradient(960, y, 0, 960, y, 520);
      rg.addColorStop(0, `rgba(255,220,180,${(.35 * Math.exp(-u * 1.8)).toFixed(3)})`); rg.addColorStop(1, 'rgba(255,200,150,0)');
      c.fillStyle = rg; c.fillRect(0, 0, W, H);
    }
  }
}

function drawGrain(frame) {
  const c = bg.gctx, k = Math.floor(frame / 2);
  const r = mulberry32(k * 7919 + 13);
  c.save();
  c.setTransform(1, 0, 0, 1, -r() * 256, -r() * 256);
  c.fillStyle = bg.grainTiles[k % 4];
  c.fillRect(0, 0, 960 + 512, 540 + 512);
  c.restore();
}

/* ---------- HUD 与字幕 ---------- */
const hud = {};
function setupHud() {
  hud.root = $('#hud'); hud.idx = $('.hud-tr .idx'); hud.ttl = $('.hud-tr .ttl'); hud.tc = $('.tc');
  hud.prog = $('.hud-prog i'); hud.rec = $('.rec'); hud.tr = $('.hud-tr');
  hud.sub = $('#subs span'); hud.black = $('#black');
}
function updateHud(t, frame) {
  const total = TL.duration;
  let cur = 0;
  RUN.forEach((s, i) => { if (t >= s.start) cur = i; });
  const sc = RUN[cur];
  txt(hud.idx, `${pad2(cur + 1)} / ${pad2(RUN.length)}`);
  txt(hud.ttl, sc.title);
  const lt = t - sc.start;
  const p = pr(lt, 0.05, .5);
  st(hud.tr, 'opacity', (.25 + .75 * p).toFixed(3));
  st(hud.tr, 'transform', `translateY(${(-10 * (1 - p)).toFixed(1)}px)`);
  const sec = Math.floor(t), ff = frame % TL.fps;
  txt(hud.tc, `${pad2(Math.floor(sec / 60))}:${pad2(sec % 60)}:${pad2(ff)}`);
  st(hud.prog, 'width', `${(t / total * 100).toFixed(3)}%`);
  st(hud.rec, 'opacity', (Math.floor(t * 1.25) % 2 === 0 ? 1 : .25).toString());
  // 开头淡入、片名时减弱、结尾淡出
  let a = pr(t, .6, 1.2);
  const s2 = RUN.find(s => s.id === 's02');
  if (s2 && t >= s2.start && t < s2.end) a *= .35;
  a *= 1 - pr(t, total - 2.2, 1.2, E.inOutC);
  st(hud.root, 'opacity', a.toFixed(3));
  // 字幕
  let s = null;
  for (const x of SUBS) if (t >= x.start - .04 && t < x.end + .18) s = x;
  if (s) {
    txt(hud.sub, s.text);
    const a1 = clamp((t - (s.start - .04)) / .12), a2 = clamp((s.end + .18 - t) / .12);
    const k = Math.min(a1, a2);
    st(hud.sub, 'opacity', k.toFixed(3));
    st(hud.sub, 'transform', `translateY(${(6 * (1 - a1)).toFixed(1)}px)`);
  } else st(hud.sub, 'opacity', '0');
  // 片尾黑场
  st(hud.black, 'opacity', pr(t, total - 1.3, 1.25, E.inOutC).toFixed(3));
}

/* ---------- 主入口 ---------- */
function setup(timeline) {
  TL = timeline;
  // 全局 SVG defs（渐变 / 发光滤镜），放在永远可见的位置，避免引用到隐藏镜头里的 defs
  $('#frame').insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute"><defs>${DEFS}</defs></svg>`);
  setupBg(); setupHud();
  const stage = $('#stage');
  RUN = TL.scenes.map(s => {
    const def = SCN[s.id];
    if (!def) throw new Error('缺少镜头定义 ' + s.id);
    const root = h('div', 'scene ' + s.id, null, stage);
    const cue = name => {
      if (!(name in s.cues)) throw new Error(`${s.id} 缺少同步点 ${name}`);
      return s.cues[name] - s.start;
    };
    const obj = { ...s, def, root, dur: s.end - s.start, cue, st: {} };
    def.build(root, obj);
    return obj;
  });
  SUBS = TL.scenes.flatMap(s => s.subs);
  return { duration: TL.duration, fps: TL.fps, frames: Math.round(TL.duration * TL.fps) };
}

function renderFrame(t) {
  const frame = Math.round(t * TL.fps);
  drawBg(t); drawFx(t); drawGrain(frame);
  for (const s of RUN) {
    const on = t >= s.start && t < s.end;
    st(s.root, 'display', on ? 'block' : 'none');
    if (!on) continue;
    const lt = t - s.start;
    // 通用转场：进场上浮去模糊，出场放大淡出
    const pin = s.def.noEnter ? 1 : pr(lt, 0, .65, E.outC);
    const pout = s.def.noExit ? 0 : pr(lt, s.dur - .5, .5, E.inC);
    const op = pin * (1 - pout);
    st(s.root, 'opacity', op.toFixed(3));
    st(s.root, 'transform', `translateY(${(22 * (1 - pin)).toFixed(1)}px) scale(${(1 + .035 * pout).toFixed(4)})`);
    const bl = 7 * (1 - pin) + 7 * pout;
    st(s.root, 'filter', bl < .05 ? 'none' : `blur(${bl.toFixed(2)}px)`);
    s.def.update(lt, s, t);
  }
  updateHud(t, frame);
  return frame;
}

window.setup = setup;
window.renderFrame = renderFrame;
