/* 12 个镜头。每个镜头：build(root, S) 建 DOM；update(lt, S) 按镜头内时间 lt 设置样式。
   S.cue('名字') 返回旁白同步点（镜头内秒数），来自 build/timeline.json。 */
'use strict';

const rad = d => d * Math.PI / 180;
function arcPath(cx, cy, r, a0, a1) {
  if (a1 - a0 < .05) return '';
  const p = a => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}
function place(el, x, y, extra = '') { el.style.left = x + 'px'; el.style.top = y + 'px'; if (extra) el.style.cssText += ';' + extra; return el; }
function header(root, eb, title, cool) {
  const e = place(h('div', 'eyebrow' + (cool ? ' cool' : ''), eb, root), 160, 140);
  const t = place(h('div', 'h1', title, root), 160, 176);
  return { e, t };
}
function headerAnim(H, lt) {
  reveal(H.e, pr(lt, .05, .6), { dx: -40, dy: 0, blur: 6 });
  reveal(H.t, pr(lt, .15, .75), { dy: 26, blur: 12 });
}
/** 下划线高光条 */
function underline(root, x, y, w, color) {
  const u = place(h('div', 'abs', null, root), x, y, `width:${w}px;height:5px;border-radius:3px;background:${color};box-shadow:0 0 16px ${color};transform-origin:0 50%;transform:scaleX(0)`);
  return u;
}
function dial(svg, cx, cy, gid) {
  const o = {};
  o.ringA = sv('circle', { cx, cy, r: 345, fill: 'none', stroke: 'rgba(255,255,255,.10)', 'stroke-width': 2, 'stroke-dasharray': '70 22' }, svg);
  o.ringB = sv('circle', { cx, cy, r: 322, fill: 'none', stroke: 'rgba(255,190,120,.38)', 'stroke-width': 1.5, 'stroke-dasharray': '2 9' }, svg);
  o.ring0 = sv('circle', { cx, cy, r: 300, fill: 'none', stroke: 'rgba(255,255,255,.07)', 'stroke-width': 1 }, svg);
  o.ringC = sv('circle', { cx, cy, r: 222, fill: 'none', stroke: 'rgba(150,160,255,.22)', 'stroke-width': 1, 'stroke-dasharray': '1 6' }, svg);
  o.arc = sv('path', { fill: 'none', stroke: `url(#${gid})`, 'stroke-width': 7, 'stroke-linecap': 'round', filter: 'url(#glow8)' }, svg);
  o.ticks = [];
  for (let i = 0; i < 90; i++) {
    const a = rad(-90 + i * 4);
    const long = i % 10 === 0;
    const r1 = long ? 260 : 270, r2 = 292;
    o.ticks.push(sv('line', { x1: (cx + r1 * Math.cos(a)).toFixed(1), y1: (cy + r1 * Math.sin(a)).toFixed(1), x2: (cx + r2 * Math.cos(a)).toFixed(1), y2: (cy + r2 * Math.sin(a)).toFixed(1), stroke: 'rgba(255,255,255,.16)', 'stroke-width': long ? 3.2 : 2.2, 'stroke-linecap': 'round' }, svg));
  }
  return o;
}
const DEFS = `
  <linearGradient id="gOpus" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE2B0"/><stop offset=".5" stop-color="#FFB25B"/><stop offset="1" stop-color="#FF6B4A"/></linearGradient>
  <linearGradient id="gFable" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4DEFF"/><stop offset=".5" stop-color="#9B8CFF"/><stop offset="1" stop-color="#46D3FF"/></linearGradient>
  <linearGradient id="gMix" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9B8CFF"/><stop offset="1" stop-color="#FFB25B"/></linearGradient>
  <radialGradient id="rOpus"><stop offset="0" stop-color="#FFF1DA"/><stop offset=".45" stop-color="#FFB25B"/><stop offset="1" stop-color="#FF6B4A"/></radialGradient>
  <radialGradient id="rFable"><stop offset="0" stop-color="#F1EEFF"/><stop offset=".45" stop-color="#9B8CFF"/><stop offset="1" stop-color="#46D3FF"/></radialGradient>
  <filter id="glow8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="glow4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
function fullSvg(root) {
  return sv('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080', class: 'abs', style: 'left:0;top:0' }, root);
}
const OPUS_C = '#FFB25B', FABLE_C = '#9B8CFF';

/* ================= 01 冷开场：62 天 ================= */
SCN.s01 = {
  noEnter: true,
  build(root, S) {
    const cx = 960, cy = 430;
    this.cx = cx; this.cy = cy;
    const svg = fullSvg(root);
    this.d = dial(svg, cx, cy, 'gOpus');
    this.ghost = sv('path', { d: arcPath(cx, cy, 308, -90 + 70 * 4, -90 + 73 * 4), fill: 'none', stroke: '#FFB25B', 'stroke-width': 6, 'stroke-linecap': 'round', filter: 'url(#glow4)', opacity: 0 }, svg);
    this.cap = place(h('div', 's01-cap mono', 'DAYS SINCE OPUS 5.5', root), 0, 262, 'font-size:18px;letter-spacing:.42em;color:#FFB25B');
    this.num = place(h('div', 's01-num', '<span>0</span>', root), 0, 300, 'left:auto;right:843px;text-align:right');
    this.numS = this.num.querySelector('span');
    this.unit = place(h('div', 's01-unit', '天', root), 1089, 457);
    this.sub = place(h('div', 's01-cap cjk', 'Opus 5.5 · 2026.09.22 发布', root), 0, 550, 'font-size:24px;color:#AEB7CF;letter-spacing:.08em');
    this.late = place(h('div', 'pill', '<span class="d"></span>已超过中位节奏 <b class="num" style="font-weight:700">+2</b> 天', root), 960, 796, 'color:#FF7A6A;border-color:rgba(255,110,90,.55);transform:translateX(-50%)');
    this.med = place(h('div', 'lbl cjk', '中位节奏 · <span class="num" style="font-weight:700;color:#7FE0FF">60</span> 天', root), 0, 590, 'left:auto;right:1236px;font-size:24px;color:#CFE9FF;text-align:right');
    this.q = place(h('div', 'lbl cjk', '下一代 <span class="num" style="font-weight:700">?</span>', root), 0, 318, 'left:auto;right:1290px;text-align:right;font-size:30px;color:#FFB25B;font-weight:700');
  },
  update(lt, S) {
    const { cx, cy, d } = this;
    const tc = S.cue('count');
    const cnt = 62 * pr(lt, tc - 1.6, 1.9, E.outQ);
    const drawIn = pr(lt, .05, 1.1, E.inOutC);
    const tLate = S.cue('late'), tMed = S.cue('median'), tAsk = S.cue('ask');
    const showMed = pr(lt, tMed - .2, .5), showLate = pr(lt, tLate - .3, .45, E.outBack);
    d.ticks.forEach((tk, i) => {
      const vis = i / 90 < drawIn ? 1 : 0;
      let col = 'rgba(255,255,255,.16)';
      if (i < cnt) {
        const k = i / 62;
        col = `rgb(255,${Math.round(lerp(214, 120, k))},${Math.round(lerp(150, 70, k))})`;
      }
      if (i === 60 && showMed > 0) col = `rgba(127,224,255,${(.4 + .6 * showMed).toFixed(2)})`;
      if ((i === 60 || i === 61) && i < cnt && showLate > .5) col = '#FF5A4E';
      sa(tk, 'stroke', col);
      sa(tk, 'opacity', vis);
    });
    const a1 = -90 + Math.min(cnt, 62) * 4;
    sa(d.arc, 'd', arcPath(cx, cy, 250, -90, a1));
    sa(d.arc, 'opacity', drawIn.toFixed(3));
    const spin = lt * 9 + (lt > tAsk ? (lt - tAsk) * 30 : 0);
    sa(d.ringA, 'transform', `rotate(${(spin).toFixed(2)} ${cx} ${cy})`);
    sa(d.ringB, 'transform', `rotate(${(-spin * 1.6).toFixed(2)} ${cx} ${cy})`);
    sa(d.ringC, 'transform', `rotate(${(spin * 2.2).toFixed(2)} ${cx} ${cy})`);
    [d.ringA, d.ringB, d.ringC, d.ring0].forEach(r => sa(r, 'opacity', drawIn.toFixed(3)));
    txt(this.numS, String(Math.round(cnt)));
    reveal(this.num, pr(lt, tc - 1.7, .8), { dy: 20, blur: 14, scale: 1.12 });
    reveal(this.unit, pr(lt, tc - 1.2, .6), { dx: -20, dy: 0, blur: 8 });
    reveal(this.cap, pr(lt, .4, .8), { dy: -12, blur: 6 });
    reveal(this.sub, pr(lt, tc - .2, .7), { dy: 14, blur: 6 });
    reveal(this.med, showMed, { dx: 30, dy: 0, blur: 6 });
    st(this.late, 'opacity', clamp(showLate).toFixed(3));
    st(this.late, 'transform', `translateX(-50%) scale(${lerp(.6, 1, showLate).toFixed(3)})`);
    // 结尾提问：70–73 天的弧亮起
    const qa = pr(lt, tAsk - .1, .6);
    const pulse = .65 + .35 * Math.sin((lt - tAsk) * 6);
    sa(this.ghost, 'opacity', (qa * pulse).toFixed(3));
    reveal(this.q, qa, { dx: 20, dy: 0, blur: 6 });
  },
};

/* ================= 02 片名 ================= */
SCN.s02 = {
  noEnter: true,
  build(root) {
    this.rc = h('canvas', 'abs', null, root); this.rc.width = 1920; this.rc.height = 1080; this.rc.style.cssText = 'left:0;top:0';
    this.ctx = this.rc.getContext('2d');
    this.eb = place(h('div', 'abs mono', '<i style="display:inline-block;width:70px;height:1px;background:#FFB25B;vertical-align:middle;margin-right:22px"></i>RELEASE CADENCE ANALYSIS · 2026<i style="display:inline-block;width:70px;height:1px;background:#9B8CFF;vertical-align:middle;margin-left:22px"></i>', root), 0, 318, 'left:0;right:0;text-align:center;font-size:19px;letter-spacing:.38em;color:#D7DDF0');
    const mk = (parts, top, cls) => {
      const line = place(h('div', cls, null, root), 0, top);
      const chars = [];
      parts.forEach(([s, kind]) => {
        const sp = h('span', 'ch ' + (kind === 'lat' ? 'lat go' : kind === 'sp' ? '' : 'gw'), s === ' ' ? '&nbsp;' : s, line);
        chars.push(sp);
      });
      return { line, chars };
    };
    const p1 = [['下'], ['一'], ['代'], [' ', 'sp'], ['Opus', 'lat'], ['，']];
    const p2 = [['什'], ['么'], ['时'], ['候'], ['来'], ['？']];
    this.L1 = mk(p1, 372, 'title-line');
    this.L2 = mk(p2, 548, 'title-line');
    this.S1 = mk(p1, 372, 'shine');
    this.S2 = mk(p2, 548, 'shine');
    this.sub = place(h('div', 'abs cjk', '<span class="gf" style="font-family:SG;font-weight:700">Fable</span>&nbsp; × &nbsp;<span class="go" style="font-family:SG;font-weight:700">Opus</span>&nbsp;&nbsp;发布节奏分析', root), 0, 728, 'left:0;right:0;text-align:center;font-size:40px;font-weight:500;letter-spacing:.26em;color:#E8ECF8');
    this.tags = place(h('div', 'abs', null, root), 0, 808, 'left:0;right:0;display:flex;justify-content:center;gap:22px');
    this.tags.innerHTML = '<span class="pill" style="position:relative;color:#AEB7CF"><span class="d" style="color:#46D3FF"></span>数据截至 <b class="num" style="font-weight:600;color:#fff">2026.11.23</b></span><span class="pill" style="position:relative;color:#FFB25B"><span class="d"></span>非官方预测</span>';
  },
  drawRays(lt) {
    const c = this.ctx; c.clearRect(0, 0, 1920, 1080);
    const k = pr(lt, 0, .8) * (1 - pr(lt, 4.6, .8));
    c.save(); c.translate(960, 500); c.rotate(lt * .045); c.globalCompositeOperation = 'lighter';
    const rg = c.createRadialGradient(0, 0, 40, 0, 0, 1250);
    rg.addColorStop(0, `rgba(255,214,170,${(.16 * k).toFixed(3)})`); rg.addColorStop(.35, `rgba(200,170,255,${(.06 * k).toFixed(3)})`); rg.addColorStop(1, 'rgba(160,160,255,0)');
    c.fillStyle = rg; c.beginPath();
    for (let i = 0; i < 64; i++) {
      const a = i / 64 * Math.PI * 2, w = (i % 4 === 0 ? .03 : .012);
      c.moveTo(0, 0); c.lineTo(Math.cos(a - w) * 1300, Math.sin(a - w) * 1300); c.lineTo(Math.cos(a + w) * 1300, Math.sin(a + w) * 1300); c.closePath();
    }
    c.fill(); c.restore();
    // 两颗轨道光点（Opus 暖 / Fable 冷），带拖尾
    c.globalCompositeOperation = 'lighter';
    const orb = (phase, col) => {
      for (let j = 26; j >= 0; j--) {
        const a = lt * .9 + phase - j * .03;
        const x = 960 + Math.cos(a) * 820, y = 515 + Math.sin(a) * 300;
        const al = Math.pow(1 - j / 27, 2) * k;
        const r = j === 0 ? 26 : 9 * (1 - j / 30);
        const g = c.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${col},${(al).toFixed(3)})`); g.addColorStop(1, `rgba(${col},0)`);
        c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
      }
    };
    orb(0, '255,190,120'); orb(Math.PI, '160,150,255');
    c.globalCompositeOperation = 'source-over';
  },
  update(lt, S) {
    this.drawRays(lt);
    reveal(this.eb, pr(lt, .35, .8), { dy: -14, blur: 8 });
    const all = [...this.L1.chars, ...this.L2.chars];
    all.forEach((ch, i) => {
      const p = pr(lt, .12 + i * .05, .75, E.outQ);
      st(ch, 'opacity', p.toFixed(3));
      st(ch, 'transform', `translateY(${(70 * (1 - p)).toFixed(1)}px) scale(${lerp(1.25, 1, p).toFixed(3)})`);
      st(ch, 'filter', p > .995 ? 'none' : `blur(${(16 * (1 - p)).toFixed(2)}px)`);
    });
    // 光泽扫过
    const sw = (a) => { const u = clamp((lt - a) / 1.1); return lerp(160, -60, E.inOutC(u)); };
    const pos = lt < 3.2 ? sw(1.1) : sw(3.4);
    [this.S1.line, this.S2.line].forEach((l, i) => st(l, 'backgroundPosition', `${(pos + i * 6).toFixed(1)}% 0`));
    const zoom = 1 + .03 * pr(lt, 0, 5.4, E.lin);
    [this.L1.line, this.L2.line, this.S1.line, this.S2.line].forEach(l => st(l, 'transform', `scale(${zoom.toFixed(4)})`));
    reveal(this.sub, pr(lt, .95, .8), { dy: 20, blur: 10 });
    reveal(this.tags, pr(lt, 1.35, .8), { dy: 16, blur: 6 });
  },
};

/* ================= 03 先说结论：日历 ================= */
SCN.s03 = {
  build(root, S) {
    this.H = header(root, 'TL;DR · 先说结论', '最可能在 <span class="go"><span class="num">12</span> 月第一周</span>');
    this.ul = underline(root, 160 + 296, 262, 374, '#FFB25B');
    this.lgCore = place(h('div', 'pill', '<span class="d"></span>两种方法的交集 <b class="num" style="font-weight:700">12.01 – 12.04</b>', root), 0, 124, 'right:160px;left:auto;color:#FFC877;border-color:rgba(255,178,91,.5)');
    this.lgWide = place(h('div', 'pill', '<span class="d"></span>稳妥窗口 <b class="num" style="font-weight:700">11.24 – 12.24</b>', root), 0, 178, 'right:160px;left:auto;color:#C9C1FF;border-color:rgba(155,140,255,.5)');
    this.lgToday = place(h('div', 'pill', '<span class="d"></span>今天 <b class="num" style="font-weight:700">11.23</b>', root), 0, 232, 'right:160px;left:auto;color:#7FE0FF;border-color:rgba(70,211,255,.45);font-size:20px;padding:6px 16px');
    this.cards = []; this.cells = [];
    [[10, 'NOV 2026', '十一月'], [11, 'DEC 2026', '十二月']].forEach(([m, name, cn], mi) => {
      const card = h('div', 'glass cal', `<div class="cal-h"><span class="m">${name}</span><span class="c">${cn}</span></div><div class="cal-w">${'一二三四五六日'.split('').map(x => `<div>${x}</div>`).join('')}</div><div class="cal-g"></div>`, root);
      card.style.cssText = `left:${160 + mi * 840}px;top:300px;height:500px`;
      this.cards.push(card);
      const g = card.querySelector('.cal-g');
      const off = (new Date(Date.UTC(2026, m, 1)).getUTCDay() + 6) % 7;
      const nd = new Date(Date.UTC(2026, m + 1, 0)).getUTCDate();
      for (let i = 0; i < off; i++) h('div', 'cell empty', null, g);
      for (let d = 1; d <= nd; d++) {
        const idx = off + d - 1;
        const el = h('div', 'cell', `<i class="wide"></i><i class="core"></i><i class="today"></i><span class="tx">${d}</span>`, g);
        const dn = days('2026-11-01', `2026-${m + 1}-${pad2(d)}`);
        this.cells.push({ el, dn, row: Math.floor(idx / 7), col: idx % 7, mi, wide: el.querySelector('.wide'), core: el.querySelector('.core'), today: el.querySelector('.today'), tx: el.querySelector('.tx') });
      }
    });
  },
  update(lt, S) {
    headerAnim(this.H, lt);
    const tw = S.cue('week'), tc = S.cue('core'), tWide = S.cue('wide');
    st(this.ul, 'transform', `scaleX(${pr(lt, tw - .1, .7, E.outQ).toFixed(3)})`);
    reveal(this.lgCore, pr(lt, tc + .1, .6), { dx: 40, dy: 0, blur: 6 });
    reveal(this.lgWide, pr(lt, tWide + .2, .6), { dx: 40, dy: 0, blur: 6 });
    reveal(this.lgToday, pr(lt, 1.7, .6), { dx: 40, dy: 0, blur: 6 });
    this.cards.forEach((c, i) => reveal(c, pr(lt, .25 + i * .18, .8), { dy: 50, blur: 10 }));
    for (const c of this.cells) {
      const p = pr(lt, .55 + (c.row + c.col) * .028 + c.mi * .18, .45);
      st(c.el, 'opacity', p.toFixed(3));
      // 核心 4 天
      let sc = lerp(.82, 1, p), txc = '';
      if (c.dn >= 30 && c.dn <= 33) {
        const q = pr(lt, tc - .25 + (c.dn - 30) * .1, .55, E.outBack);
        st(c.core, 'opacity', clamp(q * 1.4).toFixed(3));
        if (q > .02) sc = lerp(.6, 1, q) * (1 + .035 * Math.sin((lt - tc) * 4 + c.dn) * clamp(q));
        if (q > .4) txc = '#2A1206';
      }
      // 稳妥窗口
      if (c.dn >= 23 && c.dn <= 53) {
        const q = pr(lt, tWide - .2 + (c.dn - 23) * .036, .4);
        st(c.wide, 'opacity', (q * .95).toFixed(3));
        if (!txc && q > .5) txc = '#EDEBFF';
      }
      if (c.dn === 22) st(c.today, 'opacity', pr(lt, 1.6, .5).toFixed(3));
      st(c.tx, 'color', txc || '');
      st(c.tx, 'fontWeight', txc === '#2A1206' ? '700' : '');
      st(c.el, 'transform', `scale(${sc.toFixed(4)})`);
    }
  },
};

/* ================= 04 两条产品线 ================= */
SCN.s04 = {
  build(root) {
    this.H = header(root, 'TWO LINES · 两条产品线', '先认识两条线');
    const mkCard = (x, kind) => {
      const isO = kind === 'o';
      const col = isO ? '255,178,91' : '155,140,255';
      const col2 = isO ? '255,107,74' : '70,211,255';
      const wrap = place(h('div', 'card-wrap', null, root), x, 290, `width:760px;height:560px;background:conic-gradient(from var(--a, 0deg), rgba(${col},.06), rgba(${col},.95) 10%, rgba(${col2},.25) 22%, rgba(255,255,255,.07) 45%, rgba(${col},.07) 70%, rgba(${col2},.7) 88%, rgba(${col},.06))`);
      const card = h('div', 'card', null, wrap);
      h('div', 'glow', null, card).style.cssText = `right:-180px;top:-220px;background:radial-gradient(circle, rgba(${col},.35), rgba(${col},0) 65%)`;
      const emb = isO
        ? `<svg width="100" height="100" viewBox="-50 -50 100 100"><circle r="46" fill="none" stroke="rgba(255,178,91,.3)" stroke-width="2" stroke-dasharray="3 5"/><circle r="31" fill="none" stroke="url(#gOpus)" stroke-width="3.5"/><circle r="15" fill="url(#rOpus)" filter="url(#glow4)"/><g class="orb"><circle cx="31" cy="0" r="5.5" fill="#FFF1DA" filter="url(#glow4)"/></g></svg>`
        : `<svg width="100" height="100" viewBox="-50 -50 100 100"><polygon points="0,-44 38,-22 38,22 0,44 -38,22 -38,-22" fill="none" stroke="rgba(155,140,255,.35)" stroke-width="2" stroke-dasharray="3 5"/><polygon points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15" fill="none" stroke="url(#gFable)" stroke-width="3.5"/><path d="M0,-17 L5,-5 L17,0 L5,5 L0,17 L-5,5 L-17,0 L-5,-5 Z" fill="url(#rFable)" filter="url(#glow4)"/><g class="orb"><circle cx="30" cy="0" r="5.5" fill="#F1EEFF" filter="url(#glow4)"/></g></svg>`;
      const e = place(h('div', 'abs', emb, card), 54, 52);
      place(h('div', 'abs ' + (isO ? 'go' : 'gf'), isO ? 'OPUS' : 'FABLE', card), 178, 44, 'font-family:SG;font-weight:700;font-size:100px;line-height:1;letter-spacing:.02em');
      place(h('div', 'abs mono', isO ? 'LINE 01 · FLAGSHIP' : 'LINE 02 · MYTHOS-CLASS', card), 184, 152, 'font-size:16px;letter-spacing:.24em;color:#8E98B3');
      const role = place(h('div', 'abs cjk', isO ? '官方推荐的日常主力' : '面向公众的 <span style="font-family:SG">Mythos</span> 级模型线', card), 56, 202, 'font-size:40px;font-weight:700;letter-spacing:.04em');
      const rows = (isO
        ? [['最新版本', 'Opus 5.5'], ['发布日期', '2026.09.22'], ['2026 年节奏', '约 2 个月 / 次']]
        : [['首版', 'Fable 5 · 2026.06.09'], ['最新版本', 'Fable 5.2 · 2026.11.09'], ['2026 年节奏', '约 2.5 个月 / 次']]
      ).map(([k, v], i) => place(h('div', 'row', `<span class="k">${k}</span><span class="v">${v}</span>`, card), 56, 276 + i * 68));
      const foot = place(h('div', 'abs cjk', isO ? '每个新 Opus 都被定位为：以更低价格追平上一版 Fable' : '同版本号的 Mythos 是同一底层模型放宽部分安全限制的受限版本', card), 56, 500, 'font-size:19px;color:#7F8AA8;letter-spacing:.03em;width:650px');
      return { wrap, e, orb: card.querySelector('.orb'), role, rows, foot };
    };
    this.A = mkCard(160, 'o');
    this.B = mkCard(1000, 'f');
    this.x = place(h('div', 'abs', '×', root), 940, 528, 'font-family:SG;font-weight:300;font-size:64px;color:#8E98B3');
  },
  update(lt, S) {
    headerAnim(this.H, lt);
    const go = (C, t0, dir) => {
      const p = pr(lt, t0, .9, E.outQ);
      const ry = dir * (1 - p) * 26 + dir * 3 * Math.sin(lt * .6);
      const fy = 6 * Math.sin(lt * .9 + dir);
      reveal(C.wrap, p, { dx: dir * -90, dy: 0, blur: 12, extra: `perspective(1800px) rotateY(${ry.toFixed(2)}deg) translateY(${fy.toFixed(1)}px)` });
      st(C.wrap, '--a', `${(lt * 38 + (dir > 0 ? 0 : 180)).toFixed(1)}deg`);
      sa(C.orb, 'transform', `rotate(${(lt * 70 * dir).toFixed(1)})`);
      reveal(C.role, pr(lt, t0 + .35, .6), { dy: 16, blur: 6 });
      C.rows.forEach((r, i) => reveal(r, pr(lt, t0 + .55 + i * .14, .55), { dx: 26, dy: 0, blur: 5 }));
      reveal(C.foot, pr(lt, t0 + 1.1, .7), { dy: 10, blur: 4 });
    };
    go(this.A, S.cue('opus') - .55, -1);
    go(this.B, S.cue('fable') - .45, 1);
    reveal(this.x, pr(lt, S.cue('fable') - .2, .6), { dy: 0, blur: 8, scale: .4 });
    // “首版”高亮
    const tf = S.cue('first');
    const k = pr(lt, tf - .1, .4) * (1 - pr(lt, tf + 1.6, .6));
    st(this.B.rows[0], 'background', k > .01 ? `linear-gradient(90deg, rgba(155,140,255,${(.22 * k).toFixed(3)}), rgba(70,211,255,0))` : '');
    st(this.B.rows[0], 'boxShadow', k > .01 ? `inset 3px 0 0 rgba(160,150,255,${k.toFixed(2)})` : '');
  },
};

/* ================= 05 发布记录：时间线 ================= */
SCN.s05 = {
  build(root) {
    this.H = header(root, 'RELEASE LOG · 发布记录', '从 <span class="lat">2024</span> 到今天的 <span class="go lat">Opus</span> 与 <span class="gf lat">Fable</span>');
    const D0 = '2024-03-04';
    this.ev = [
      ['c3', 'Claude 3 Opus', '2024-03-04', 'o'], ['o4', 'Opus 4', '2025-05-22', 'o'], ['o41', 'Opus 4.1', '2025-08-05', 'o'],
      ['o45', 'Opus 4.5', '2025-11-24', 'o'], ['o46', 'Opus 4.6', '2026-02-05', 'o'], ['mp', 'Mythos Preview', '2026-04-07', 'm'],
      ['o47', 'Opus 4.7', '2026-04-16', 'o'], ['o48', 'Opus 4.8', '2026-05-28', 'o'], ['f5', 'Fable 5', '2026-06-09', 'f'],
      ['o5', 'Opus 5', '2026-07-24', 'o'], ['f51', 'Fable 5.1', '2026-09-01', 'f'], ['o55', 'Opus 5.5', '2026-09-22', 'o'],
      ['f52', 'Fable 5.2', '2026-11-09', 'f'],
    ].map(([id, name, date, line]) => ({ id, name, date, line, d: days(D0, date) }));
    this.TY = 560;
    // 2026 年高亮带
    this.band = place(h('div', 'abs', '<span class="mono" style="position:absolute;left:16px;top:10px;font-size:15px;letter-spacing:.3em;color:#FFC877">2026</span>', root), 0, 446, 'height:250px;border-radius:18px;background:linear-gradient(180deg, rgba(255,178,91,.10), rgba(255,178,91,.03));border:1px solid rgba(255,178,91,.25)');
    this.track = place(h('div', 'abs', null, root), 120, this.TY - 1, 'width:1680px;height:2px;background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.35) 8%, rgba(255,255,255,.35) 92%, rgba(255,255,255,0));transform-origin:0 50%');
    this.years = [['2025', '2025-01-01'], ['2026', '2026-01-01']].map(([y, dt]) => ({ d: days(D0, dt), el: h('div', 'abs mono', `<i style="position:absolute;left:0;top:-14px;width:1px;height:10px;background:rgba(255,255,255,.35)"></i><span style="position:absolute;left:0;transform:translateX(-50%);font-size:17px;color:#6F7A98;letter-spacing:.2em">${y}</span>`, root) }));
    this.years.forEach(y => y.el.style.top = '782px');
    for (const e of this.ev) {
      e.node = h('div', 'node ' + e.line, null, root);
      e.lab = h('div', 'tlab', `<div class="n ${e.line === 'o' ? 'go' : e.line === 'f' ? 'gf' : ''}" ${e.line === 'm' ? 'style="color:#9FDFFF"' : ''}>${e.name}</div><div class="dt">${e.date.replace(/-/g, '.')}</div>`, root);
    }
    const ops = this.ev.filter(e => e.line === 'o');
    const mkDim = (a, b, n, col, y) => {
      const el = h('div', 'dim', `<div class="ln" style="background:${col};box-shadow:0 0 10px ${col}"></div><i class="tk" style="left:0;background:${col}"></i><i class="tk" style="right:0;background:${col}"></i><div class="vv" style="color:${col}">${n} <span style="font-family:var(--cjk);font-weight:500;font-size:.62em">天</span></div>`, root);
      el.style.top = y + 'px';
      return { a, b, n, el, ln: el.querySelector('.ln'), vv: el.querySelector('.vv') };
    };
    this.dims = [];
    for (let i = 1; i < ops.length; i++) this.dims.push(mkDim(ops[i - 1], ops[i], ops[i].d - ops[i - 1].d, '#FFB25B', this.TY - 150));
    const fb = this.ev.filter(e => e.line === 'f');
    for (let i = 1; i < fb.length; i++) this.dims.push(mkDim(fb[i - 1], fb[i], fb[i].d - fb[i - 1].d, '#A99CFF', this.TY + 172));
    this.today = { d: days(D0, '2026-11-23'), el: h('div', 'abs', '<i style="position:absolute;left:0;top:0;height:218px;border-left:2px dashed rgba(70,211,255,.8)"></i><span class="cjk" style="position:absolute;left:0;top:222px;transform:translateX(-50%);font-size:19px;color:#7FE0FF;white-space:nowrap">今天 <b class="num">11.23</b></span>', root) };
    this.today.el.style.top = (this.TY + 16) + 'px';
    this.next = { d: days(D0, '2026-12-02'), el: h('div', 'node', null, root), lab: h('div', 'tlab', '<div class="n go">下一代 ?</div><div class="dt">≈ 12.01–12.04</div>', root) };
    this.next.el.style.cssText = 'border:3px dashed #FFB25B;background:rgba(255,178,91,.12);width:30px;height:30px;margin:-15px 0 0 -15px';
    this.fast = place(h('div', 'pill', '<span class="d"></span><span class="num" style="font-weight:700">2026</span> 年：Opus 约 <b class="num">2</b> 个月一次 · Fable 约 <b class="num">2.5</b> 个月一次', root), 960, 826, 'color:#FFD9A6;border-color:rgba(255,178,91,.45);transform:translateX(-50%);font-size:24px');
  },
  update(lt, S) {
    headerAnim(this.H, lt);
    const TY = this.TY;
    const tc3 = S.cue('c3'), to4 = S.cue('o4'), tgap = S.cue('gap'), to45 = S.cue('o45'), tfast = S.cue('fast');
    // 相机：先看 444 天的空档，再拉到 2025–2026
    const m = pr(lt, tgap + .75, 1.7, E.inOutC);
    const c = lerp(222, 760, m), k = lerp(1.55, 2.75, m);
    const X = d => 960 + (d - c) * k;
    st(this.track, 'transform', `scaleX(${pr(lt, .2, 1.3, E.inOutC).toFixed(3)})`);
    const appear = {
      c3: tc3 - .15, o4: to4 - .15, o41: tgap + 1.2, o45: to45 - .45, o46: to45 + .25, mp: to45 + .45, o47: to45 + .62,
      o48: to45 + .8, f5: to45 + .98, o5: to45 + 1.15, f51: to45 + 1.33, o55: to45 + 1.5, f52: to45 + 1.68,
    };
    for (const e of this.ev) {
      const x = X(e.d), t0 = appear[e.id];
      const p = pr(lt, t0, .5, E.outBack);
      st(e.node, 'left', x.toFixed(1) + 'px'); st(e.node, 'top', TY + 'px');
      st(e.node, 'opacity', clamp(p * 1.5).toFixed(3));
      let s = lerp(.2, 1, p);
      if (e.id === 'o45') s *= 1 + .45 * Math.exp(-Math.max(0, lt - to45) * 3) * (lt > to45 ? 1 : 0);
      st(e.node, 'transform', `scale(${s.toFixed(3)})`);
      const above = e.line === 'o';
      st(e.lab, 'left', x.toFixed(1) + 'px');
      st(e.lab, 'top', (above ? TY - 88 : TY + 30) + 'px');
      const q = pr(lt, t0 + .1, .5);
      st(e.lab, 'opacity', q.toFixed(3));
      st(e.lab, 'transform', `translateX(-50%) translateY(${((above ? 12 : -12) * (1 - q)).toFixed(1)}px)`);
    }
    for (const dm of this.dims) {
      const xa = X(dm.a.d), xb = X(dm.b.d);
      st(dm.el, 'left', xa.toFixed(1) + 'px'); st(dm.el, 'width', Math.max(0, xb - xa).toFixed(1) + 'px');
      const t0 = Math.max(appear[dm.b.id], dm.n === 444 ? tgap - .25 : 0) + .12;
      const p = pr(lt, t0, .6, E.outC);
      st(dm.el, 'opacity', clamp(p * 2).toFixed(3));
      st(dm.ln, 'transform', `scaleX(${p.toFixed(3)})`); st(dm.ln, 'transformOrigin', '0 50%');
      const fs = dm.n === 444 ? lerp(86, 30, m) : 30;
      st(dm.vv, 'fontSize', fs.toFixed(1) + 'px');
      if (dm.n === 444) txt(dm.vv.firstChild, String(Math.round(444 * pr(lt, tgap - .3, 1.1, E.outQ))) + ' ');
      st(dm.vv, 'opacity', pr(lt, t0 + .25, .4).toFixed(3));
    }
    for (const y of this.years) { st(y.el, 'left', X(y.d).toFixed(1) + 'px'); st(y.el, 'opacity', pr(lt, .6, .8).toFixed(3)); }
    const tx = X(this.today.d);
    st(this.today.el, 'left', tx.toFixed(1) + 'px'); st(this.today.el, 'opacity', pr(lt, to45 + 1.9, .5).toFixed(3));
    const nx = X(this.next.d), pn = pr(lt, to45 + 2.15, .6, E.outBack);
    st(this.next.el, 'left', nx.toFixed(1) + 'px'); st(this.next.el, 'top', TY + 'px');
    st(this.next.el, 'opacity', clamp(pn).toFixed(3));
    st(this.next.el, 'transform', `scale(${(lerp(.3, 1, pn) * (1 + .12 * Math.sin(lt * 5))).toFixed(3)}) rotate(${(lt * 40).toFixed(1)}deg)`);
    st(this.next.lab, 'left', nx.toFixed(1) + 'px'); st(this.next.lab, 'top', (TY - 88) + 'px');
    st(this.next.lab, 'opacity', pr(lt, to45 + 2.3, .5).toFixed(3)); st(this.next.lab, 'transform', 'translateX(-50%)');
    const b0 = X(days('2024-03-04', '2026-01-01')) - 30, b1 = X(this.today.d) + 70;
    st(this.band, 'left', b0.toFixed(1) + 'px'); st(this.band, 'width', (b1 - b0).toFixed(1) + 'px');
    reveal(this.band, pr(lt, tfast - .3, .7), { dy: 0, blur: 0, scale: .96 });
    st(this.fast, 'opacity', pr(lt, tfast, .6).toFixed(3));
    st(this.fast, 'transform', `translateX(-50%) translateY(${(14 * (1 - pr(lt, tfast, .6))).toFixed(1)}px)`);
  },
};

/* ================= 06 方法 A：柱图 ================= */
SCN.s06 = {
  build(root) {
    this.H = header(root, 'CLUE 01 · 方法 A', '<span class="go lat">Opus</span> 自身的发布节奏');
    this.YB = 800; this.K = 5.875; // 每天 5.875px
    const Y = v => this.YB - v * this.K;
    const svg = fullSvg(root);
    for (const v of [0, 20, 40, 60, 80]) {
      sv('line', { x1: 210, x2: 1110, y1: Y(v), y2: Y(v), stroke: v === 0 ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.08)', 'stroke-width': v === 0 ? 2 : 1 }, svg);
      const t = sv('text', { x: 196, y: Y(v) + 6, 'text-anchor': 'end', fill: '#6F7A98', 'font-family': 'JBM', 'font-size': 17 }, svg); t.textContent = v;
    }
    const tu = sv('text', { x: 196, y: Y(80) - 26, 'text-anchor': 'end', fill: '#6F7A98', 'font-family': 'Noto Sans CJK SC', 'font-size': 17 }, svg); tu.textContent = '天';
    this.vals = [73, 70, 42, 57, 60];
    const labs = ['4.5→4.6', '4.6→4.7', '4.7→4.8', '4.8→5', '5→5.5', '5.5→下一代'];
    this.cx = i => 290 + i * 150;
    this.bars = this.vals.map((v, i) => {
      const b = place(h('div', 'bar o', '<i class="hl"></i>', root), this.cx(i) - 43, Y(v), `height:${v * this.K}px`);
      const val = place(h('div', 'bval', '0', root), this.cx(i) - 43, Y(v) - 54);
      return { b, val, v };
    });
    labs.forEach((l, i) => place(h('div', 'bxl', l, root), this.cx(i) - 43, 814));
    // 中位数线
    this.medG = sv('line', { x1: 210, x2: 1110, y1: Y(60), y2: Y(60), stroke: '#7FE0FF', 'stroke-width': 10, opacity: .18, 'stroke-linecap': 'round' }, svg);
    this.med = sv('line', { x1: 210, x2: 1110, y1: Y(60), y2: Y(60), stroke: '#7FE0FF', 'stroke-width': 2.5, 'stroke-dasharray': '10 8' }, svg);
    this.medL = place(h('div', 'lbl cjk', '中位数 <b class="num" style="color:#7FE0FF">60</b>', root), 1122, Y(60) - 16, 'font-size:21px;color:#CFE9FF');
    // 第 6 列：应到 / 进行中
    const x6 = this.cx(5) - 43;
    this.ghost = place(h('div', 'abs', null, root), x6, Y(60), `width:86px;height:${60 * this.K}px;border:2px dashed rgba(255,255,255,.45);border-radius:12px 12px 3px 3px;background:rgba(255,255,255,.03)`);
    this.ghostL = place(h('div', 'lbl cjk', '应在 <b class="num">11.21</b> 前后', root), this.cx(5), Y(60) - 50, 'font-size:22px;color:#DDE3F3;transform:translateX(-50%)');
    this.stamp = place(h('div', 'stamp', '未发布', root), this.cx(5), 600, 'font-size:34px;transform:translateX(-50%) rotate(-12deg)');
    this.now = place(h('div', 'bar', null, root), x6, Y(62), `height:${62 * this.K}px;background:repeating-linear-gradient(135deg, rgba(255,178,91,.95) 0 14px, rgba(255,120,70,.75) 14px 28px);box-shadow:0 0 34px rgba(255,120,70,.5);border:2px solid rgba(255,220,180,.6)`);
    this.nowV = place(h('div', 'bval', '0', root), x6, Y(62) - 54, 'color:#FFD9A6');
    this.nowT = place(h('div', 'pill', '<span class="d"></span>进行中 · 第 <b class="num">62</b> 天', root), this.cx(5), 858, 'font-size:20px;color:#FF8A70;border-color:rgba(255,110,80,.5);transform:translateX(-50%)');
    // 70 / 73 参照线
    this.refs = [[73, 0], [70, 1]].map(([v, i]) => {
      const ln = sv('line', { x1: this.cx(i) + 43, x2: this.cx(i) + 43, y1: Y(v), y2: Y(v), stroke: '#FFC877', 'stroke-width': 2, 'stroke-dasharray': '4 6' }, svg);
      return { ln, v, i };
    });
    this.band = place(h('div', 'abs', null, root), x6 - 12, Y(73), `width:110px;height:${3 * this.K}px;background:linear-gradient(90deg,#FFC877,#FF7A4A);border-radius:4px;box-shadow:0 0 22px rgba(255,150,70,.9),0 0 50px rgba(255,120,60,.5)`);
    this.win = place(h('div', 'abs', '<div class="mono" style="font-size:15px;letter-spacing:.3em;color:#FFB25B">第 70–73 天 →</div><div class="num go" style="font-size:46px;font-weight:700;line-height:1.15">12.01 – 12.04</div>', root), this.cx(5), Y(73) - 110, 'transform:translateX(-50%);text-align:center;white-space:nowrap');
    // 右侧统计
    this.stats = [['样本', 5, '次间隔', 0], ['中位数', 60, '天', 0], ['均值', 60.4, '天', 1], ['标准差', 12.3, '天', 1]].map(([k, v, u, dp], i) => {
      const el = place(h('div', 'glass stat', `<div class="k">${k}</div><div class="v"><span class="num">0</span><small>${u}</small></div>`, root), 1300, 300 + i * 124);
      return { el, v, dp, n: el.querySelector('.num') };
    });
  },
  update(lt, S) {
    headerAnim(this.H, lt);
    const Y = v => this.YB - v * this.K;
    const tb = ['b1', 'b2', 'b3', 'b4', 'b5'].map(S.cue);
    this.bars.forEach((B, i) => {
      const p = pr(lt, tb[i] - .2, .65, E.outBackS);
      st(B.b, 'transform', `scaleY(${Math.max(0, p).toFixed(4)})`);
      st(B.b, 'opacity', clamp(p * 3).toFixed(3));
      txt(B.val, String(Math.round(B.v * clamp(pr(lt, tb[i] - .2, .6, E.outQ)))));
      st(B.val, 'opacity', pr(lt, tb[i], .3).toFixed(3));
      st(B.val, 'top', (Y(B.v * clamp(p)) - 54).toFixed(1) + 'px');
      // 中位数出现后，非 60 的柱子略微变暗
      const dim = pr(lt, S.cue('med'), .5) * (1 - pr(lt, S.cue('ref') - .3, .5));
      st(B.b, 'filter', B.v === 60 || dim < .01 ? 'none' : `saturate(${(1 - .5 * dim).toFixed(2)}) brightness(${(1 - .25 * dim).toFixed(2)})`);
    });
    const tm = S.cue('med');
    const pm = pr(lt, tm - .15, .8, E.inOutC);
    sa(this.med, 'x2', (210 + 900 * pm).toFixed(1));
    sa(this.med, 'opacity', clamp(pm * 3).toFixed(2));
    sa(this.medG, 'x2', (210 + 900 * pm).toFixed(1));
    sa(this.medG, 'opacity', (.2 * clamp(pm * 3)).toFixed(3));
    reveal(this.medL, pr(lt, tm + .4, .5), { dx: -14, dy: 0, blur: 4 });
    this.stats.forEach((s, i) => {
      const t0 = S.cue('line2') + .3 + i * .22;
      reveal(s.el, pr(lt, t0, .6), { dx: 50, dy: 0, blur: 8 });
      const v = s.v * pr(lt, t0 + .1, 1.0, E.outQ);
      txt(s.n, s.dp ? v.toFixed(1) : String(Math.round(v)));
    });
    const td = S.cue('due'), tmiss = S.cue('miss'), tnow = S.cue('now'), tref = S.cue('ref'), tw = S.cue('win');
    const pg = pr(lt, td - .1, .5) * (1 - .55 * pr(lt, tnow, .5));
    st(this.ghost, 'opacity', pg.toFixed(3));
    reveal(this.ghostL, pr(lt, td + .1, .5) * (1 - pr(lt, tnow - .2, .4)), { dy: 10, blur: 4, extra: '' });
    st(this.ghostL, 'transform', `translateX(-50%) translateY(${(10 * (1 - pr(lt, td + .1, .5))).toFixed(1)}px)`);
    const ps = pr(lt, tmiss - .15, .4, E.outBack) * (1 - pr(lt, tnow - .1, .35));
    st(this.stamp, 'opacity', clamp(ps).toFixed(3));
    st(this.stamp, 'transform', `translateX(-50%) rotate(-12deg) scale(${lerp(1.8, 1, clamp(pr(lt, tmiss - .15, .4, E.outBack))).toFixed(3)})`);
    const pn = pr(lt, tnow - .3, 1.2, E.outQ);
    st(this.now, 'transform', `scaleY(${pn.toFixed(4)})`);
    st(this.now, 'opacity', clamp(pn * 4).toFixed(3));
    st(this.now, 'backgroundPosition', `${(lt * 40).toFixed(1)}px 0`);
    txt(this.nowV, String(Math.round(62 * pn)));
    st(this.nowV, 'opacity', pr(lt, tnow - .2, .3).toFixed(3));
    st(this.nowV, 'top', (Y(62 * pn) - 54).toFixed(1) + 'px');
    st(this.nowT, 'opacity', pr(lt, tnow + .5, .5).toFixed(3));
    this.refs.forEach((r, i) => {
      const p = pr(lt, tref - .2 + i * .25, .8, E.inOutC);
      const x1 = this.cx(r.i) + 43, x2 = this.cx(5) + 55;
      sa(r.ln, 'x2', lerp(x1, x2, p).toFixed(1));
      sa(r.ln, 'opacity', clamp(p * 3).toFixed(2));
    });
    const pw = pr(lt, tw - .25, .6, E.outBack);
    st(this.band, 'opacity', clamp(pw).toFixed(3));
    st(this.band, 'transform', `scaleX(${lerp(.2, 1, clamp(pw)).toFixed(3)})`);
    reveal(this.win, pr(lt, tw, .6), { dy: 20, blur: 8, extra: '' });
    st(this.win, 'transform', `translateX(-50%) translateY(${(20 * (1 - pr(lt, tw, .6))).toFixed(1)}px)`);
  },
};

/* ================= 07 交替接力 ================= */
SCN.s07 = {
  build(root) {
    this.H = header(root, 'CLUE 02 · 交替接力', '从 <span class="lat">2026</span> 年 <span class="lat">5</span> 月起，两条线<span class="go">严格交替</span>');
    this.ul = underline(root, 1000, 264, 272, '#FFB25B');
    const X = dt => 380 + days('2026-05-10', dt) * 6.262;
    this.X = X;
    const LO = 420, LF = 690;
    const svg = fullSvg(root);
    this.lanes = [[LO, '#FFB25B'], [LF, '#9B8CFF']].map(([y, c]) => sv('line', { x1: 330, x2: 1790, y1: y, y2: y, stroke: c, 'stroke-width': 2, opacity: .45 }, svg));
    this.flows = [];
    for (let i = 0; i < 14; i++) this.flows.push(sv('circle', { r: 2.5, cy: i % 2 ? LF : LO, fill: i % 2 ? '#C9C1FF' : '#FFD9A6', opacity: 0 }, svg));
    // 月份刻度
    for (let m = 6; m <= 12; m++) {
      const x = X(`2026-${pad2(m)}-01`);
      sv('line', { x1: x, x2: x, y1: 780, y2: 792, stroke: 'rgba(255,255,255,.3)' }, svg);
      const t = sv('text', { x, y: 820, 'text-anchor': 'middle', fill: '#6F7A98', 'font-family': 'Noto Sans CJK SC', 'font-size': 19 }, svg); t.textContent = m + '月';
    }
    sv('line', { x1: 330, x2: 1790, y1: 786, y2: 786, stroke: 'rgba(255,255,255,.12)' }, svg);
    place(h('div', 'abs go', 'OPUS', root), 160, LO - 24, 'font-family:SG;font-weight:700;font-size:38px;letter-spacing:.06em');
    place(h('div', 'abs gf', 'FABLE', root), 160, LF - 24, 'font-family:SG;font-weight:700;font-size:38px;letter-spacing:.06em');
    this.nodes = [
      ['Opus 4.8', '2026-05-28', 'o'], ['Fable 5', '2026-06-09', 'f'], ['Opus 5', '2026-07-24', 'o'],
      ['Fable 5.1', '2026-09-01', 'f'], ['Opus 5.5', '2026-09-22', 'o'], ['Fable 5.2', '2026-11-09', 'f'],
    ].map(([n, dt, l]) => {
      const x = X(dt), y = l === 'o' ? LO : LF;
      const node = place(h('div', 'node ' + l, null, root), x, y, 'width:26px;height:26px;margin:-13px 0 0 -13px');
      const lab = place(h('div', 'tlab', `<div class="n ${l === 'o' ? 'go' : 'gf'}">${n}</div><div class="dt">${dt.slice(5).replace('-', '.')}</div>`, root), x, l === 'o' ? y - 90 : y + 30);
      return { x, y, node, lab };
    });
    this.pts = this.nodes.map(n => [n.x, n.y]);
    const nx = (X('2026-12-01') + X('2026-12-04')) / 2;
    this.pts.push([nx, LO]);
    this.path = sv('path', { d: 'M' + this.pts.slice(0, 6).map(p => p.join(' ')).join(' L'), fill: 'none', stroke: 'url(#gMix)', 'stroke-width': 3.5, 'stroke-linejoin': 'round', filter: 'url(#glow4)' }, svg);
    this.segL = []; let acc = 0;
    for (let i = 1; i < 6; i++) { const L = Math.hypot(this.pts[i][0] - this.pts[i - 1][0], this.pts[i][1] - this.pts[i - 1][1]); this.segL.push(L); acc += L; }
    this.total = acc;
    this.last = sv('path', { d: `M${this.pts[5].join(' ')} Q ${(this.pts[5][0] + nx) / 2} ${LO - 40} ${nx} ${LO}`, fill: 'none', stroke: '#FFB25B', 'stroke-width': 3.5, 'stroke-dasharray': '9 8', filter: 'url(#glow4)', opacity: 0 }, svg);
    this.gaps = [12, 45, 39, 21, 48].map((g, i) => {
      const [x0, y0] = this.pts[i], [x1, y1] = this.pts[i + 1];
      return place(h('div', 'pill', `<b class="num" style="font-weight:700">${g}</b> 天`, root), (x0 + x1) / 2, (y0 + y1) / 2 - 22, 'font-size:20px;padding:5px 14px;color:#E8ECF8;transform:translateX(-50%)');
    });
    this.orb = sv('circle', { r: 11, fill: '#FFF4E4', filter: 'url(#glow8)', opacity: 0 }, svg);
    this.rings = [0, 1, 2].map(() => sv('circle', { cx: nx, cy: LO, r: 20, fill: 'none', stroke: '#FFB25B', 'stroke-width': 2, opacity: 0 }, svg));
    this.q = place(h('div', 'abs', '<span class="num" style="font-size:30px;font-weight:700">?</span>', root), nx, LO, 'width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;border:3px dashed #FFB25B;display:flex;align-items:center;justify-content:center;color:#FFC877;background:rgba(255,178,91,.12)');
    this.qL = place(h('div', 'tlab', '<div class="n go" style="font-size:28px">下一棒：Opus</div>', root), nx - 40, LO - 84);
  },
  update(lt, S) {
    headerAnim(this.H, lt);
    st(this.ul, 'transform', `scaleX(${pr(lt, S.cue('alt') - .1, .7, E.outQ).toFixed(3)})`);
    const pl = pr(lt, .2, 1.2, E.inOutC);
    this.lanes.forEach(l => sa(l, 'x2', lerp(330, 1790, pl).toFixed(1)));
    this.flows.forEach((f, i) => {
      const u = ((lt * .07 + i * .137) % 1);
      sa(f, 'cx', lerp(330, 1790, u).toFixed(1));
      sa(f, 'opacity', (pl * .8 * Math.sin(Math.PI * u)).toFixed(2));
    });
    const tr = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'].map(S.cue);
    this.nodes.forEach((n, i) => {
      const p = pr(lt, tr[i] - .12, .45, E.outBack);
      st(n.node, 'opacity', clamp(p * 2).toFixed(3));
      st(n.node, 'transform', `scale(${(lerp(.2, 1, p) * (1 + .5 * Math.exp(-Math.max(0, lt - tr[i]) * 4) * (lt > tr[i] ? 1 : 0))).toFixed(3)})`);
      reveal(n.lab, pr(lt, tr[i] - .05, .45), { dy: n.y < 500 ? 12 : -12, blur: 4, extra: 'translateX(-50%)' });
    });
    // 接力路径
    let L = 0, head = this.pts[0];
    for (let i = 0; i < 5; i++) {
      const a = tr[i], b = tr[i + 1];
      const f = pr(lt, a, Math.max(.3, b - a), E.inOutC);
      if (f <= 0) break;
      L += this.segL[i] * f;
      const [x0, y0] = this.pts[i], [x1, y1] = this.pts[i + 1];
      head = [lerp(x0, x1, f), lerp(y0, y1, f)];
      reveal(this.gaps[i], pr(lt, b - .05, .4), { dy: 8, blur: 3, extra: 'translateX(-50%)' });
      if (f < 1) break;
    }
    sa(this.path, 'stroke-dasharray', `${L.toFixed(1)} 9999`);
    const tn = S.cue('next');
    const pf = pr(lt, tn - .7, .7, E.inOutC);
    if (pf > 0) {
      const [x0, y0] = this.pts[5], [x2, y2] = this.pts[6];
      const cx = (x0 + x2) / 2, cy = 420 - 40;
      const u = pf;
      head = [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x2, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y2];
    }
    sa(this.last, 'opacity', clamp(pf * 2).toFixed(2));
    sa(this.last, 'stroke-dashoffset', (-lt * 30).toFixed(1));
    sa(this.orb, 'cx', head[0].toFixed(1)); sa(this.orb, 'cy', head[1].toFixed(1));
    sa(this.orb, 'opacity', pr(lt, tr[0] - .1, .3).toFixed(2));
    const pq = pr(lt, tn - .05, .5, E.outBack);
    st(this.q, 'opacity', clamp(pq).toFixed(3));
    st(this.q, 'transform', `scale(${lerp(.3, 1, pq).toFixed(3)}) rotate(${(lt * 30).toFixed(1)}deg)`);
    reveal(this.qL, pr(lt, tn + .15, .5), { dy: 12, blur: 5, extra: 'translateX(-50%)' });
    this.rings.forEach((r, i) => {
      const u = lt - tn - i * .45;
      if (u < 0) { sa(r, 'opacity', 0); return; }
      const ph = (u % 1.4) / 1.4;
      sa(r, 'r', (20 + 60 * ph).toFixed(1));
      sa(r, 'opacity', ((1 - ph) * .8).toFixed(2));
    });
  },
};

/* ================= 08 方法 B：Fable 先发，Opus 追平 ================= */
SCN.s08 = {
  build(root) {
    this.H = header(root, 'CLUE 03 · 方法 B', '<span class="gf lat">Fable</span> 先发，<span class="go lat">Opus</span> 以更低价格追平', true);
    const svg = fullSvg(root);
    const rows = [
      { y: 372, f: ['Fable 5', '2026.06.09'], o: ['Opus 5', '2026.07.24'], d: 45, q: '以一半价格接近 Fable 5 的前沿智能', src: '官方定位 · OPUS 5' },
      { y: 548, f: ['Fable 5.1', '2026.09.01'], o: ['Opus 5.5', '2026.09.22'], d: 21, q: '在多数工作上达到 Fable 5.1 的水平', src: '官方定位 · OPUS 5.5', tag: '运行成本比 Opus 5 低 40%' },
      { y: 724, f: ['Fable 5.2', '2026.11.09'], o: ['下一代 Opus', '?'], d: [21, 45] },
    ];
    const X0 = 480, PX = 8;
    this.rows = rows.map((r, i) => {
      const R = { ...r };
      R.fc = place(h('div', 'chip f', `<span class="n gf">${r.f[0]}</span><span class="dt">${r.f[1]}</span>`, root), 160, r.y - 46, 'width:300px');
      const dmax = Array.isArray(r.d) ? r.d[1] : r.d, dmin = Array.isArray(r.d) ? r.d[0] : r.d;
      R.x1 = X0; R.x2 = X0 + dmin * PX; R.x3 = X0 + dmax * PX;
      R.ln = place(h('div', 'abs', null, root), R.x1, r.y - 2, `width:${R.x2 - R.x1}px;height:4px;border-radius:2px;background:linear-gradient(90deg,#9B8CFF,#FFB25B);box-shadow:0 0 12px rgba(255,170,110,.7);transform-origin:0 50%`);
      if (R.x3 > R.x2) {
        R.ln2 = place(h('div', 'abs', null, root), R.x2, r.y - 2, `width:${R.x3 - R.x2}px;height:4px;background:repeating-linear-gradient(90deg,#FFB25B 0 9px,transparent 9px 17px);transform-origin:0 50%`);
        R.br = sv('path', { d: `M${R.x2} ${r.y + 22} v12 H${R.x3} v-12`, fill: 'none', stroke: 'rgba(255,200,140,.7)', 'stroke-width': 2 }, svg);
      }
      R.head = sv('polygon', { points: '0,-11 18,0 0,11', fill: '#FFB25B', filter: 'url(#glow4)' }, svg);
      R.parts = [0, 1, 2].map(() => sv('circle', { r: 3.5, cy: r.y, fill: '#FFF1DA', filter: 'url(#glow4)', opacity: 0 }, svg));
      const dl = Array.isArray(r.d) ? `<b class="num">${r.d[0]}</b> – <b class="num">${r.d[1]}</b> 天` : `<b class="num" style="font-size:34px">0</b> 天`;
      R.dl = place(h('div', 'lbl cjk', dl, root), (R.x1 + R.x3) / 2, r.y - 52, 'font-size:24px;color:#E8ECF8;transform:translateX(-50%)');
      R.dlN = R.dl.querySelector('b');
      R.oc = place(h('div', 'chip o' + (Array.isArray(r.d) ? ' q' : ''), `<span class="n go">${r.o[0]}</span><span class="dt">${r.o[1]}</span>`, root), R.x3 + 30, r.y - 46, 'width:270px');
      if (r.q) {
        R.qt = place(h('div', 'quote', `<span class="src">${r.src}</span>“${r.q}”`, root), 1210, r.y - 50, 'width:600px;font-size:27px;white-space:nowrap');
        if (r.tag) R.tag = place(h('div', 'pill', `<span class="d"></span>${r.tag.replace(/(\d+%?)/g, '<b class="num">$1</b>').replace('Opus', '<span style="font-family:SG">Opus</span>')}`, root), 1210, r.y + 26, 'font-size:20px;color:#9FF0C8;border-color:rgba(87,227,164,.45)');
      } else {
        R.qt = place(h('div', 'abs', '<div class="mono" style="font-size:15px;letter-spacing:.3em;color:#FFB25B">推算窗口</div><div class="num go" style="font-size:58px;font-weight:700;line-height:1.1;white-space:nowrap">11.30 – 12.24</div>', root), 1210, r.y - 50);
      }
      return R;
    });
  },
  update(lt, S) {
    headerAnim(this.H, lt);
    const T = [[S.cue('p1'), S.cue('p1b')], [S.cue('p2'), S.cue('p2b')], [S.cue('p3'), S.cue('win')]];
    this.rows.forEach((R, i) => {
      const [t0, tq] = T[i];
      reveal(R.fc, pr(lt, t0 - .35, .55), { dx: -40, dy: 0, blur: 8 });
      const pa = pr(lt, t0 + .05, 1.0, E.inOutC);
      const xe = lerp(R.x1, R.x2, pa);
      st(R.ln, 'transform', `scaleX(${pa.toFixed(4)})`);
      let xh = xe;
      if (R.ln2) {
        const pb = pr(lt, t0 + .9, .8, E.inOutC);
        const x3 = lerp(R.x2, R.x3, pb);
        st(R.ln2, 'transform', `scaleX(${pb.toFixed(4)})`); st(R.ln2, 'opacity', clamp(pb * 3).toFixed(2));
        sa(R.br, 'opacity', pb.toFixed(2));
        if (pb > 0) xh = x3;
      }
      sa(R.head, 'transform', `translate(${(xh - 2).toFixed(1)} ${R.y})`);
      sa(R.head, 'opacity', clamp(pa * 4).toFixed(2));
      R.parts.forEach((c, k) => {
        const u = ((lt * .55 + k / 3) % 1);
        sa(c, 'cx', lerp(R.x1, xh, u).toFixed(1));
        sa(c, 'opacity', (pa > .98 ? .9 * Math.sin(Math.PI * u) : 0).toFixed(2));
      });
      if (!Array.isArray(R.d)) txt(R.dlN, String(Math.round(R.d * pa)));
      st(R.dl, 'opacity', pr(lt, t0 + .1, .4).toFixed(3));
      reveal(R.oc, pr(lt, t0 + (R.ln2 ? 1.55 : .95), .55, E.outBackS), { dx: -30, dy: 0, blur: 8, scale: .9 });
      reveal(R.qt, pr(lt, tq - .2, .7), { dx: 40, dy: 0, blur: 10 });
      if (R.tag) reveal(R.tag, pr(lt, tq + .9, .6), { dy: 10, blur: 4 });
    });
  },
};

/* ================= 09 两种方法叠加 ================= */
SCN.s09 = {
  build(root) {
    this.H = header(root, 'OVERLAP · 两种方法叠加', '两个窗口叠在一起');
    const X = dt => 200 + days('2026-11-20', dt) * 34.146;
    this.X = X; this.RY = 492;
    const svg = fullSvg(root);
    sv('line', { x1: 200, x2: 1610, y1: this.RY, y2: this.RY, stroke: 'rgba(255,255,255,.35)', 'stroke-width': 2 }, svg);
    sv('line', { x1: 1665, x2: 1760, y1: this.RY, y2: this.RY, stroke: 'rgba(255,255,255,.35)', 'stroke-width': 2, 'stroke-dasharray': '4 5' }, svg);
    sv('path', { d: `M1622 ${this.RY + 12} l10 -24 M1636 ${this.RY + 12} l10 -24`, stroke: 'rgba(255,255,255,.5)', 'stroke-width': 2 }, svg);
    for (let i = 0; i <= 41; i++) {
      const dt = new Date(D('2026-11-20') + i * DAY);
      const mon = dt.getUTCDay() === 1;
      const x = 200 + i * 34.146;
      sv('line', { x1: x, x2: x, y1: this.RY - (mon ? 9 : 5), y2: this.RY + (mon ? 9 : 5), stroke: mon ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.22)', 'stroke-width': mon ? 2 : 1 }, svg);
    }
    for (const dt of ['2026-11-20', '2026-11-24', '2026-12-08', '2026-12-15', '2026-12-31']) {
      const t = sv('text', { x: X(dt), y: this.RY + 40, 'text-anchor': 'middle', fill: '#6F7A98', 'font-family': 'JBM', 'font-size': 17 }, svg); t.textContent = dt.slice(5).replace('-', '.');
    }
    this.jan = sv('circle', { cx: 1712, cy: this.RY, r: 7, fill: '#9AA4BD' }, svg);
    const tj = sv('text', { x: 1712, y: this.RY + 40, 'text-anchor': 'middle', fill: '#9AA4BD', 'font-family': 'JBM', 'font-size': 17 }, svg); tj.textContent = '01.11';
    this.todayL = place(h('div', 'abs', '<i style="position:absolute;left:0;top:0;height:130px;border-left:2px dashed rgba(70,211,255,.8)"></i><span class="cjk" style="position:absolute;left:0;top:-28px;transform:translateX(-50%);font-size:19px;color:#7FE0FF;white-space:nowrap">今天</span>', root), X('2026-11-23'), this.RY - 65);
    const xa0 = X('2026-12-01'), xa1 = X('2026-12-05'), xb0 = X('2026-11-30'), xb1 = X('2026-12-25');
    this.A = place(h('div', 'abs', null, root), xa0, 0, `width:${xa1 - xa0}px;height:44px;margin-top:-22px;border-radius:10px;background:linear-gradient(90deg,#FFC877,#FF7A4A);box-shadow:0 0 26px rgba(255,150,70,.7);z-index:3`);
    this.Al = place(h('div', 'lbl', '<span class="mono" style="font-size:15px;letter-spacing:.24em;color:#FFB25B">方法 A · OPUS 节奏</span><br><b class="num" style="font-size:30px;color:#FFD9A6">12.01 – 12.04</b>', root), xa0, 0, 'z-index:4');
    this.B = place(h('div', 'abs', null, root), xb0, 0, `width:${xb1 - xb0}px;height:44px;margin-top:-22px;border-radius:10px;background:linear-gradient(90deg, rgba(155,140,255,.85), rgba(70,211,255,.6));box-shadow:0 0 26px rgba(130,120,255,.45);z-index:2`);
    this.Bl = place(h('div', 'lbl', '<span class="mono" style="font-size:15px;letter-spacing:.24em;color:#A99CFF">方法 B · FABLE→OPUS 时差</span><br><b class="num" style="font-size:30px;color:#DCD6FF">11.30 – 12.24</b>', root), xb0 + 200, 0, 'z-index:4');
    this.flash = place(h('div', 'abs', null, root), xa0 - 4, this.RY - 30, `width:${xa1 - xa0 + 8}px;height:60px;border-radius:12px;background:#FFF6EA;box-shadow:0 0 60px rgba(255,230,200,.9);z-index:5;opacity:0`);
    this.inter = place(h('div', 'abs', '<div class="cjk" style="font-size:22px;color:#FFD9A6;letter-spacing:.2em">交集 · 两种方法都支持</div><div class="num go" style="font-size:60px;font-weight:700;line-height:1.1">12.01 – 12.04</div>', root), (xa0 + xa1) / 2, this.RY - 190, 'transform:translateX(-50%);text-align:center;white-space:nowrap;z-index:6');
    this.brk = place(h('div', 'abs', null, root), xa0, this.RY - 52, `width:${xa1 - xa0}px;height:14px;border:2px solid #FFC877;border-bottom:none;border-radius:6px 6px 0 0;z-index:6`);
    this.early = place(h('div', 'abs', null, root), X('2026-11-24'), this.RY - 16, `width:${X('2026-11-30') - X('2026-11-24')}px;height:32px;border-radius:8px;background:repeating-linear-gradient(135deg, rgba(255,120,100,.55) 0 6px, rgba(255,120,100,.12) 6px 12px);border:1px solid rgba(255,140,120,.7);z-index:1`);
    this.lateB = place(h('div', 'abs', null, root), X('2026-12-05'), this.RY - 30, `width:${X('2026-12-25') - X('2026-12-05')}px;height:60px;border-radius:12px;border:2px solid rgba(200,190,255,.9);box-shadow:0 0 24px rgba(160,150,255,.5);z-index:4`);
    const card = (x, color, name, range, detail) => place(h('div', 'glass', `<div style="display:flex;align-items:center;gap:12px"><i style="width:12px;height:12px;border-radius:50%;background:${color};box-shadow:0 0 12px ${color}"></i><span class="cjk" style="font-size:28px;font-weight:700">${name}</span></div><div class="num" style="font-size:44px;font-weight:700;color:${color};margin-top:6px">${range}</div><div class="cjk" style="font-size:21px;line-height:1.55;color:#B9C2DA;margin-top:6px">${detail}</div>`, root), x, 640, 'width:510px;height:222px;padding:22px 30px');
    this.c1 = card(160, '#FF8A7A', '偏早', '11.24 – 11.29', '离 <span style="font-family:SG">Fable 5.2</span> 不足 3 周，<br>短于已知最短的 <b class="num">21</b> 天时差');
    this.c2 = card(705, '#B7ABFF', '偏晚', '12.05 – 12.24', '超出 <span style="font-family:SG">Opus</span> 近期最长间隔，<br>但仍在 <span style="font-family:SG">Fable→Opus</span> 时差范围内');
    this.c3 = card(1250, '#AEB7CF', '推迟到 2027 年', '≈ 2027.01.11', '<b class="num">12</b> 月仍未发布时，<br>参照 <span style="font-family:SG">Opus 4.1→4.5</span> 的 <b class="num">111</b> 天间隔');
  },
  update(lt, S) {
    headerAnim(this.H, lt);
    const RY = this.RY;
    const tm = S.cue('merge'), tc = S.cue('core'), te = S.cue('early'), tl = S.cue('late'), td = S.cue('delay');
    const pa = pr(lt, .05, .75, E.outQ), pb = pr(lt, .25, .75, E.outQ);
    const pm = pr(lt, tm - .2, .7, E.inOutC);
    const ya = lerp(RY - 120, RY, pm), yb = lerp(RY + 120, RY, pm);
    st(this.A, 'top', ya.toFixed(1) + 'px'); st(this.A, 'opacity', pa.toFixed(3)); st(this.A, 'transform', `translateX(${(-380 * (1 - pa)).toFixed(1)}px)`);
    st(this.B, 'top', yb.toFixed(1) + 'px'); st(this.B, 'opacity', (pb * lerp(1, .78, pm)).toFixed(3)); st(this.B, 'transform', `translateX(${(380 * (1 - pb)).toFixed(1)}px)`);
    st(this.Al, 'top', (ya - 96).toFixed(1) + 'px'); st(this.Al, 'opacity', (pa * (1 - pm)).toFixed(3));
    st(this.Bl, 'top', (yb + 30).toFixed(1) + 'px'); st(this.Bl, 'opacity', (pb * (1 - pm)).toFixed(3));
    const fl = pr(lt, tm + .45, .12) * (1 - pr(lt, tm + .6, .7));
    st(this.flash, 'opacity', fl.toFixed(3));
    const pi = pr(lt, tm + .55, .6, E.outBack);
    st(this.inter, 'opacity', clamp(pi).toFixed(3));
    st(this.inter, 'transform', `translateX(-50%) translateY(${(20 * (1 - pi)).toFixed(1)}px) scale(${(1 + .05 * Math.exp(-Math.max(0, lt - tc) * 3) * (lt > tc ? 1 : 0)).toFixed(3)})`);
    st(this.brk, 'opacity', pr(lt, tm + .7, .4).toFixed(3));
    st(this.todayL, 'opacity', pr(lt, .6, .5).toFixed(3));
    const card = (el, t0, tNext) => {
      const p = pr(lt, t0 - .1, .6);
      reveal(el, p, { dy: 40, blur: 8 });
      const act = tNext ? 1 - .45 * pr(lt, tNext - .2, .5) : 1;
      st(el, 'borderColor', `rgba(255,255,255,${(.13 + .2 * p * act).toFixed(3)})`);
      if (p > .99) st(el, 'opacity', act.toFixed(3));
    };
    card(this.c1, te, tl); card(this.c2, tl, td); card(this.c3, td, null);
    const pe = pr(lt, te, .5) * (1 - .6 * pr(lt, tl, .5));
    st(this.early, 'opacity', pe.toFixed(3));
    st(this.lateB, 'opacity', (pr(lt, tl, .5) * (1 - .6 * pr(lt, td, .5))).toFixed(3));
    const pj = pr(lt, td, .5);
    sa(this.jan, 'fill', pj > .5 ? '#FFFFFF' : '#9AA4BD');
    sa(this.jan, 'r', (7 + 5 * pj * (1 + .3 * Math.sin(lt * 6))).toFixed(1));
    sa(this.jan, 'filter', pj > .5 ? 'url(#glow4)' : 'none');
  },
};

/* ================= 10 命名与信号 ================= */
SCN.s10 = {
  build(root) {
    this.H = header(root, 'NAMING & SIGNAL · 命名与信号', '比起传闻，更该盯模型 <span class="lat">ID</span>', true);
    this.rum = place(h('div', 'pill', '<span class="d"></span>网传', root), 160, 318, 'color:#FF8A7A;border-color:rgba(255,120,100,.5)');
    this.g = ['#FFB25B', '#46D3FF', 'base'].map(c => place(h('div', 'glitch', 'Opus 6', root), 150, 390, c === 'base' ? 'color:transparent;-webkit-text-stroke:2.5px rgba(240,244,255,.85)' : `color:transparent;-webkit-text-stroke:2px ${c};opacity:.75;mix-blend-mode:screen`));
    this.stamp = place(h('div', 'stamp', '无可靠来源', root), 380, 520, 'font-size:50px;transform:rotate(-12deg);background:rgba(20,6,10,.55)');
    this.note = place(h('div', 'abs cjk', '没有可靠报道、模型 <span style="font-family:SG">ID</span> 或文档支撑<br><span style="color:#8E98B3;font-size:21px">AIToolsReview：更可能沿用 <span style="font-family:SG">5.x</span> 小数点命名</span>', root), 160, 668, 'font-size:26px;line-height:1.6;color:#DDE3F3');
    this.term = place(h('div', 'glass term', `<div class="bar3"><i style="background:#FF5F57"></i><i style="background:#FEBC2E"></i><i style="background:#28C840"></i><span>signal-watch — cloud model catalogs</span></div><div class="body"></div>`, root), 900, 300, 'width:860px;height:520px');
    const body = this.term.querySelector('.body');
    this.lines = [
      ['$ watch --cloud-model-catalogs', '', 'cloud', 0],
      ['# 信号：云平台提前出现新的 Opus 模型 ID', 'cmt', 'cloud', .9],
      ['$ grep claude-opus', '', 'cloud', 2.2],
      ['▶ 2026.09.14–17  claude-opus-5-2  @ Microsoft Foundry', 'hit', 'hit', 0],
      ['  2026.09.22      Opus 5.5 正式发布（约一周后）', '', 'hit', 1.3],
      ['! source: AIToolsReview · 未经独立核实', 'warn', 'unv', 0],
      ['$ ', '', 'unv', 1.1],
    ].map(([s, cls, cue, off]) => {
      const el = h('div', 'ln ' + cls, '', body);
      if (cls === 'cmt') el.style.color = '#7F8AA8';
      return { s, el, cue, off };
    });
    this.hitBg = place(h('div', 'abs', null, this.term), 0, 52 + 26 + 3 * 40 - 4, 'left:0;right:0;height:46px;background:linear-gradient(90deg, rgba(255,178,91,.22), rgba(255,178,91,0));border-left:4px solid #FFB25B;opacity:0');
    this.scan = place(h('div', 'abs', null, this.term), 0, 0, 'left:0;right:0;height:80px;background:linear-gradient(180deg, rgba(70,211,255,0), rgba(70,211,255,.10), rgba(70,211,255,0))');
  },
  update(lt, S) {
    headerAnim(this.H, lt);
    const to6 = S.cue('o6'), tst = S.cue('stamp');
    reveal(this.rum, pr(lt, to6 - .4, .5), { dy: 10, blur: 4 });
    const pg = pr(lt, to6 - .3, .7);
    const fr = Math.floor(lt * 30);
    const r = mulberry32(fr * 31 + 7);
    const burst = (fr % 23 < 3) || (lt > tst - .1 && lt < tst + .25);
    this.g.forEach((el, i) => {
      const amp = i === 2 ? 0 : (burst ? 14 : 3);
      const dx = (r() - .5) * 2 * amp + (i === 0 ? -3 : i === 1 ? 3 : 0);
      const dy = (r() - .5) * amp * .4;
      st(el, 'opacity', (pg * (i === 2 ? 1 : .75)).toFixed(3));
      st(el, 'transform', `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`);
      st(el, 'clipPath', burst && i !== 2 ? `inset(${(r() * 60).toFixed(0)}% 0 ${(r() * 30).toFixed(0)}% 0)` : 'none');
    });
    const ps = pr(lt, tst - .12, .4, E.outBack);
    st(this.stamp, 'opacity', clamp(ps * 1.5).toFixed(3));
    st(this.stamp, 'transform', `rotate(-12deg) scale(${lerp(2.2, 1, clamp(ps)).toFixed(3)})`);
    reveal(this.note, pr(lt, tst + .5, .7), { dy: 14, blur: 6 });
    const tcl = S.cue('cloud');
    reveal(this.term, pr(lt, tcl - .5, .8), { dx: 60, dy: 0, blur: 10 });
    for (const L of this.lines) {
      const t0 = S.cue(L.cue) + L.off - .1;
      const n = Math.floor(clamp((lt - t0) / .6) * L.s.length);
      let s = L.s.slice(0, n);
      const typing = lt >= t0 && n < L.s.length;
      const isLast = L === this.lines[this.lines.length - 1];
      if ((typing || (isLast && lt >= t0)) && Math.floor(lt * 2.5) % 2 === 0) s += '▌';
      txt(L.el, s);
    }
    const th = S.cue('hit');
    st(this.hitBg, 'opacity', (pr(lt, th + .3, .4) * (.75 + .25 * Math.sin(lt * 5))).toFixed(3));
    st(this.scan, 'top', ((lt * 160) % 600 - 80).toFixed(1) + 'px');
    const tu = S.cue('unv');
    const w = this.lines[5].el;
    st(w, 'textShadow', lt > tu && Math.floor((lt - tu) * 4) % 2 === 0 && lt < tu + 1.6 ? '0 0 14px rgba(255,210,122,.9)' : 'none');
  },
};

/* ================= 11 局限 ================= */
SCN.s11 = {
  build(root) {
    this.H = header(root, 'CAVEATS · 局限', '这是按节奏推算，不是官方信息');
    const ic = {
      sample: '<svg class="i" viewBox="0 0 60 60"><rect x="8" y="34" width="10" height="18" rx="2" fill="none" stroke="#FFB25B" stroke-width="3"/><rect x="25" y="22" width="10" height="30" rx="2" fill="none" stroke="#FFB25B" stroke-width="3"/><rect x="42" y="40" width="10" height="12" rx="2" fill="none" stroke="#FFB25B" stroke-width="3"/><circle cx="47" cy="14" r="7" fill="none" stroke="#FF8A7A" stroke-width="3"/><path d="M47 10v5M47 18v.5" stroke="#FF8A7A" stroke-width="3" stroke-linecap="round"/></svg>',
      clock: '<svg class="i" viewBox="0 0 60 60"><circle cx="30" cy="30" r="22" fill="none" stroke="#9B8CFF" stroke-width="3"/><path d="M30 17v14l9 6" fill="none" stroke="#9B8CFF" stroke-width="3" stroke-linecap="round"/><path d="M8 52l44-44" stroke="#FF8A7A" stroke-width="3" stroke-linecap="round"/></svg>',
      cal: '<svg class="i" viewBox="0 0 60 60"><rect x="8" y="12" width="44" height="40" rx="6" fill="none" stroke="#46D3FF" stroke-width="3"/><path d="M8 24h44M20 7v10M40 7v10" stroke="#46D3FF" stroke-width="3" stroke-linecap="round"/><path d="M23 32l14 14M37 32L23 46" stroke="#FF8A7A" stroke-width="3" stroke-linecap="round"/></svg>',
      sand: '<svg class="i" viewBox="0 0 60 60"><path d="M16 8h28M16 52h28M19 8c0 14 22 16 22 22S19 38 19 52M41 8c0 14-22 16-22 22s22 8 22 22" fill="none" stroke="#FFB25B" stroke-width="3" stroke-linecap="round"/><path d="M24 46h12" stroke="#FFB25B" stroke-width="5" stroke-linecap="round"/></svg>',
      branch: '<svg class="i" viewBox="0 0 60 60"><circle cx="14" cy="14" r="5" fill="none" stroke="#9B8CFF" stroke-width="3"/><circle cx="14" cy="46" r="5" fill="none" stroke="#9B8CFF" stroke-width="3"/><circle cx="46" cy="22" r="5" fill="none" stroke="#FFB25B" stroke-width="3"/><path d="M14 19v22M14 30c0-8 14-8 27-8" fill="none" stroke="#C9C1FF" stroke-width="3" stroke-linecap="round"/></svg>',
    };
    const items = [
      ['sample', '样本太小', '<span style="font-family:SG">Opus</span> 节奏只有 <b class="num">5</b> 个间隔<br><span style="font-family:SG">Fable→Opus</span> 时差只有 <b class="num">2</b> 个'],
      ['clock', '节奏不是承诺', '官方从未公布发布周期<br>历史上有过 <b class="num">111</b> 天、<b class="num">444</b> 天'],
      ['cal', '12 月没有先例', '已统计的 <span style="font-family:SG">Opus</span> 与 <span style="font-family:SG">Fable</span><br>没有一次在 <b class="num">12</b> 月发布'],
      ['sand', '这一轮已偏慢', '按 <b class="num">60</b> 天中位数<br>本应在 <b class="num">11.21</b> 前后发布'],
      ['branch', '产品线可能调整', '合并发布、改名或跳过一轮<br>交替规律都会失效'],
    ];
    this.cards = items.map(([i, t, d], k) => place(h('div', 'glass cav', `${ic[i]}<div class="t">${t.replace(/(\d+)/, '<span class="num">$1</span>')}</div><div class="d">${d}</div>`, root), 160 + k * 324, 292, 'width:304px;padding:28px 22px'));
    // 置信度仪表
    const svg = fullSvg(root);
    this.gc = [960, 868]; const R = 190;
    const segs = [['低', '#FF5A4E'], ['中等偏低', '#FF8E4E'], ['中等', '#FFC857'], ['中等偏高', '#9BD66B'], ['高', '#57E3A4']];
    this.gauge = sv('g', {}, svg);
    segs.forEach(([n, c], i) => {
      const a0 = 180 + i * 36 + 1.5, a1 = 180 + (i + 1) * 36 - 1.5;
      sv('path', { d: arcPath(960, 868, R, a0, a1), fill: 'none', stroke: c, 'stroke-width': i === 1 ? 26 : 18, opacity: i === 1 ? 1 : .45, 'stroke-linecap': 'butt', filter: i === 1 ? 'url(#glow4)' : 'none' }, this.gauge);
      const am = rad(180 + (i + .5) * 36), lr = R + 38;
      const t = sv('text', { x: (960 + lr * Math.cos(am)).toFixed(1), y: (868 + lr * Math.sin(am) + 7).toFixed(1), 'text-anchor': 'middle', fill: i === 1 ? '#FFB08A' : '#7F8AA8', 'font-family': 'Noto Sans CJK SC', 'font-size': i === 1 ? 20 : 17, 'font-weight': i === 1 ? 700 : 400 }, this.gauge); t.textContent = n;
    });
    this.needle = sv('g', {}, this.gauge);
    sv('path', { d: 'M0 -7 L168 0 L0 7 Z', fill: '#F4F6FB', filter: 'url(#glow4)' }, this.needle);
    sv('circle', { cx: 960, cy: 868, r: 14, fill: '#0B1020', stroke: '#F4F6FB', 'stroke-width': 3 }, this.gauge);
    this.conf = place(h('div', 'abs', '<div class="cjk" style="font-size:21px;letter-spacing:.24em;color:#8E98B3">置信度</div><div class="cjk" style="font-size:52px;font-weight:900;color:#FF9E6E;line-height:1.15">中等偏低</div><div class="cjk" style="font-size:20px;color:#8E98B3">按节奏推算 · 非官方信息</div>', root), 1210, 718);
  },
  update(lt, S) {
    headerAnim(this.H, lt);
    const t3 = S.cue('c3');
    const T = [S.cue('c1'), S.cue('c2'), t3, t3 + .55, t3 + 1.1];
    this.cards.forEach((c, i) => {
      const p = pr(lt, T[i] - .25, .65, E.outBackS);
      reveal(c, clamp(p), { dy: 50, blur: 10, scale: .92 });
    });
    const tg = S.cue('line3'), tc = S.cue('conf');
    st(this.gauge, 'opacity', pr(lt, tg - .3, .7).toFixed(3));
    // 指针：从左扫到右再回落到“中等偏低”
    let ang = 180;
    if (lt > tg) ang = lerp(180, 300, pr(lt, tg, 1.4, E.inOutC));
    if (lt > tc - 1.0) ang = lerp(300, 234, pr(lt, tc - 1.0, 1.2, E.outElastic));
    sa(this.needle, 'transform', `translate(960 868) rotate(${ang.toFixed(2)})`);
    reveal(this.conf, pr(lt, tc - .1, .6), { dx: 30, dy: 0, blur: 8 });
  },
};

/* ================= 12 结尾 ================= */
SCN.s12 = {
  noExit: true,
  build(root) {
    const cx = 960, cy = 440;
    this.cx = cx; this.cy = cy;
    const svg0 = fullSvg(root);
    const svg = sv('g', { transform: `translate(${cx} ${cy}) scale(1.1) translate(${-cx} ${-cy})` }, svg0);
    this.d = dial(svg, cx, cy, 'gOpus');
    this.hl = sv('path', { d: arcPath(cx, cy, 281, -90 + 70 * 4, -90 + 73 * 4 + 4), fill: 'none', stroke: '#FFB25B', 'stroke-width': 30, filter: 'url(#glow8)', opacity: 0 }, svg);
    this.eb = place(h('div', 'abs mono', 'NEXT OPUS · 最可能的窗口', root), 0, 338, 'left:0;right:0;text-align:center;font-size:18px;letter-spacing:.36em;color:#FFB25B');
    this.big = place(h('div', 'abs cjk go', '<span class="num" style="font-weight:700">12</span> 月第一周', root), 0, 382, 'left:0;right:0;text-align:center;font-size:92px;font-weight:900;line-height:1.1;letter-spacing:.02em');
    this.date = place(h('div', 'abs num', '12.01 — 12.04', root), 0, 500, 'left:0;right:0;text-align:center;font-size:50px;font-weight:600;color:#F4F6FB;letter-spacing:.08em');
    this.foot = place(h('div', 'abs', `<div class="cjk" style="font-size:22px;color:#AEB7CF;letter-spacing:.06em">数据截至 <b class="num" style="color:#fff">2026.11.23</b> · 基于公开发布记录的非官方推算 · 置信度中等偏低</div><div style="font-family:SG,var(--cjk);font-size:18px;color:#6F7A98;margin-top:10px;letter-spacing:.06em">来源：Anthropic 官方公告 · 9to5Mac · TechCrunch · MacRumors · AIToolsReview</div>`, root), 0, 842, 'left:0;right:0;text-align:center');
  },
  update(lt, S) {
    const { cx, cy, d } = this;
    const din = pr(lt, .0, 1.1, E.inOutC);
    const cnt = 74 * pr(lt, .3, 1.6, E.outQ);
    d.ticks.forEach((tk, i) => {
      sa(tk, 'opacity', i / 90 < din ? 1 : 0);
      let col = 'rgba(255,255,255,.16)';
      if (i < cnt) col = i >= 70 && i <= 73 ? '#FFC877' : i === 62 ? '#7FE0FF' : 'rgba(255,214,170,.55)';
      sa(tk, 'stroke', col);
    });
    sa(d.arc, 'd', arcPath(cx, cy, 250, -90, -90 + Math.min(cnt, 74) * 4));
    sa(d.arc, 'opacity', (din * .8).toFixed(3));
    const spin = lt * 7;
    sa(d.ringA, 'transform', `rotate(${spin.toFixed(2)} ${cx} ${cy})`);
    sa(d.ringB, 'transform', `rotate(${(-spin * 1.6).toFixed(2)} ${cx} ${cy})`);
    sa(d.ringC, 'transform', `rotate(${(spin * 2.2).toFixed(2)} ${cx} ${cy})`);
    [d.ringA, d.ringB, d.ringC, d.ring0].forEach(r => sa(r, 'opacity', din.toFixed(3)));
    const tw = S.cue('week');
    sa(this.hl, 'opacity', (pr(lt, 1.6, .6) * (.55 + .25 * Math.sin(lt * 3))).toFixed(3));
    reveal(this.eb, pr(lt, .4, .7), { dy: -12, blur: 6 });
    reveal(this.big, pr(lt, tw - .6, .9, E.outQ), { dy: 30, blur: 16, scale: 1.12 });
    reveal(this.date, pr(lt, tw + .1, .8), { dy: 20, blur: 8 });
    reveal(this.foot, pr(lt, S.cue('end') + 2.15, 1.0), { dy: 14, blur: 6 });
  },
};
