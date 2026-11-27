// City banners, drawn in screen space with greedy de-cluttering (selected city first, then biggest cities win).
//
//   ┌────────────┬────────────────────────────┬───┐
//   │ 4.9M ▲    ›  ★ PHOENIX        +9.0%      │ ⚙ │   upper tier: bevelled bronze frame, state-coloured cap with
//   └────────────┴────────────────────────────┴───┘   the population and a growth chevron (▲, ▲▲, ▼, ▼▼ or ◆ flat),
//          └─ 🌾 12K · ⚙ 310K · 💰 420B · … ─┘           name in small caps, the most specialised industry as a medallion
//                        ▾                               lower tier (zoomed in, big cities only): the yield row
//
//        ╭──────────╮
//        │TECH CITY │                                      city-type tab (only on banners that show the yield row,
//                                                         when state.cityBadges has one: the City View extension
//                                                         fills it from districts.json once the map is zoomed in)
//
// De-cluttering: the selected and hovered cities go first, then cities by population, down to a population floor
// that falls with zoom and a count budget that scales with the screen area. Only the biggest few cities in view
// (plus the selected and hovered ones) get the yield tier. Plates keep a margin from each other, so they never sit
// edge to edge. state.bannerFocus fades every other banner (see drawBanners).
//
// Each banner is painted once into an offscreen sprite (per city, layout, selection and device scale) and then
// blitted, so panning costs one drawImage per banner.
import { css, luminance, shade } from "../color.js";
import { drawIcon, hasIcon } from "../icons.js";
import { compact, popShort } from "../ext/cityView/fmt.js"; // format.js plus a 1000K → 1.0M roll-over fix
import { isCapital } from "../world.js";
import { cityIsDot } from "./art/city.js";

const SERIF = '"Palatino Linotype", Palatino, "Book Antiqua", Georgia, "Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC", "Noto Serif SC", serif'; // ChinaCiv: CJK fallbacks
const SANS = '-apple-system, system-ui, "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Microsoft YaHei", "WenQuanYi Zen Hei", sans-serif';

// Two layouts: the full plate, and a compact one for the national view where plates crowd each other.
const LAYOUTS = {
  full: {
    name: "full", h: 22, bigPx: 12.5, big: `600 12.5px ${SERIF}`, small: `600 9.6px ${SERIF}`, pop: `700 10.5px ${SANS}`,
    capMin: 32, spec: 18, star: 10, chev: 7, yieldH: 17, yieldIcon: 12, yieldFont: `600 10px ${SANS}`, yieldGap: 13,
  },
  compact: {
    name: "compact", h: 18, bigPx: 11, big: `600 11px ${SERIF}`, small: `600 8.4px ${SERIF}`, pop: `700 9.5px ${SANS}`,
    capMin: 27, spec: 14, star: 8.5, chev: 6, yieldH: 15, yieldIcon: 11, yieldFont: `600 9px ${SANS}`, yieldGap: 11,
  },
};
const POINTER = 4; // height of the little pointer under the banner
const TAB_H = 11; // the city-type tab above the plate (its foot tucks under the plate's top rim)
const TAB_FONT = `700 7.6px ${SANS}`;
const PAD = 6; // sprite margin for the shadow and the selection glow
const GROWTH_FLAT = 0.005; // |growth| (fraction) under this reads as flat
const GROWTH_FAST = 0.05; // ...and at or over this as fast (a double chevron)

// De-cluttering
const TIER_MAX = 7; // yield tiers for at most this many cities in view (plus the selected and hovered ones)...
const TIER_AREA = 250000; // ...and one per this many square px of screen, so a laptop gets about five
const GAP_X = 5, GAP_Y = 4; // collision margin on each side, so placed plates stay 10px / 8px apart
const EDGE = 8; // plates of on-screen cities stay this far inside the screen edges
const FOCUS_FADE = 0.35; // alpha of the other banners while state.bannerFocus is set

// Frame metals: [top, middle, bottom]
const BRONZE = ["#ecd08a", "#a8833f", "#4f3a1b"];
const GOLD = ["#fff4c4", "#e6bd55", "#8d6418"];
const INK = "rgba(6,8,12,0.75)";

// Industry → icon (+ medallion colour) for the "most specialised industry" badge. An `i-<industry>` icon from
// icons.js wins when one exists; industries without a fitting glyph are skipped.
const INDUSTRY_ICON = {
  agriculture: ["y-food", "#4f7a2a"], mining: ["r-coal_mine", "#6a5038"], construction: ["y-production", "#8a5426"],
  manufacturing: ["y-production", "#8a5426"], wholesale: ["y-gold", "#7a6420"], retail: ["y-gold", "#7a6420"],
  utilities: ["r-hydro", "#2a5f86"], information: ["y-science", "#25557e"], finance: ["y-gold", "#7a6420"],
  real_estate: ["l-home", "#6b4a2f"], professional: ["y-science", "#25557e"], education: ["l-degrees", "#2a3f7a"],
  health: ["l-uninsured", "#7a2f2f"], arts: ["y-culture", "#5b3a7e"], accommodation: ["y-culture", "#5b3a7e"],
};
const MIN_SHARE = 0.02; // an industry must hold at least 2% of a city's jobs to count as its specialty

const nationShares = new WeakMap(); // nation object -> {industry: share}
function sharesOf(jobs) {
  if (!jobs) return null;
  let tot = 0;
  for (const v of Object.values(jobs)) if (Number.isFinite(v)) tot += v;
  if (!(tot > 0)) return null;
  const out = {};
  for (const [k, v] of Object.entries(jobs)) if (Number.isFinite(v)) out[k] = v / tot;
  return out;
}

/** The city's most over-represented industry by location quotient vs the nation: {key, lq, icon, bg} or null. */
export function specialty(city, nation) {
  const nj = nation?.nation?.jobs ?? nation?.jobs;
  if (!nj || !city.jobs) return null;
  let ns = nationShares.get(nj);
  if (ns === undefined) {
    ns = sharesOf(nj);
    nationShares.set(nj, ns);
  }
  const cs = sharesOf(city.jobs);
  if (!ns || !cs) return null;
  let best = null;
  for (const [k, share] of Object.entries(cs)) {
    if (share < MIN_SHARE || !(ns[k] > 0)) continue;
    const icon = hasIcon(`i-${k}`) ? [`i-${k}`, INDUSTRY_ICON[k]?.[1] || "#3a4a5e"] : INDUSTRY_ICON[k];
    if (!icon || !hasIcon(icon[0])) continue;
    const lq = share / ns[k];
    if (!best || lq > best.lq) best = { key: k, lq, icon: icon[0], bg: icon[1] };
  }
  return best && best.lq >= 1.15 ? best : null;
}

/** city.growth as a fraction (accepts a number, a percent > 1.5, or {rate|pct|value}); null when absent. */
function growthOf(city) {
  let g = city.growth;
  if (g && typeof g === "object") g = g.rate ?? (g.pct != null ? g.pct / 100 : g.value);
  if (!Number.isFinite(g)) return null;
  return Math.abs(g) > 1.5 ? g / 100 : g;
}

// --- measuring ------------------------------------------------------------------------------------------------------

/** Split a name into small-caps runs: capitals, digits and punctuation full size, lower case as small capitals. */
function smallCapRuns(name) {
  const runs = [];
  for (const ch of name) {
    const last = runs[runs.length - 1];
    const letter = ch.toLowerCase() !== ch.toUpperCase();
    // spaces and punctuation stay with the run they follow, so a run boundary never falls on a space
    const big = letter ? ch === ch.toUpperCase() : last ? last.big : true;
    if (last && last.big === big) last.t += big ? ch : ch.toUpperCase();
    else runs.push({ t: big ? ch : ch.toUpperCase(), big });
  }
  return runs;
}

const metrics = new Map(); // `${city.id}|${layout}` -> measured layout (fonts are fixed, so measure once)

function measure(ctx, city, yields, nation, L) {
  const key = `${city.id}|${L.name}`;
  let m = metrics.get(key);
  if (m && m.nation === nation && m.yields === yields && m.cityRef === city.name + city.population + (city.popLabel ?? "")) return m;
  ctx.save();
  const runs = smallCapRuns(city.name);
  let nameW = 0;
  for (const r of runs) {
    ctx.font = r.big ? L.big : L.small;
    r.w = ctx.measureText(r.t).width;
    nameW += r.w;
  }
  const capital = isCapital(city);
  if (capital) nameW += L.star + 3;
  ctx.font = L.pop;
  const pop = city.popLabel ?? popShort(city.population); // ChinaCiv: shown value ≠ art population
  const popW = ctx.measureText(pop).width;
  const growth = growthOf(city);
  const chevW = growth == null ? 0 : L.chev + 3;
  const capW = Math.ceil(Math.max(L.capMin, popW + chevW + 14));
  ctx.font = L.yieldFont;
  const parts = (yields || []).map((yd) => {
    const t = compact(city.yields?.[yd.key]);
    return { yd, t, w: ctx.measureText(t).width };
  });
  const yieldsW = parts.reduce((a, p) => a + L.yieldIcon + 2 + p.w + L.yieldGap, 0) - L.yieldGap;
  const growthTxt = growth == null ? "" : `${growth >= 0 ? "+" : "−"}${Math.abs(growth * 100).toFixed(1)}%`;
  const growthW = growthTxt ? ctx.measureText(growthTxt).width : 0;
  ctx.restore();
  const spec = specialty(city, nation);
  const specW = spec ? L.spec + 3 : 0;
  const plateW = capW + 8 + nameW + 8 + specW;
  const tierW = parts.length ? Math.ceil(yieldsW + 18) : 0;
  m = {
    runs, nameW, capital, pop, popW, chevW, capW, parts, yieldsW, tierW, spec, specW, plateW,
    growth, growthTxt, growthW, nation, yields, cityRef: city.name + city.population + (city.popLabel ?? ""),
  };
  metrics.set(key, m);
  return m;
}

// --- painting -------------------------------------------------------------------------------------------------------

function roundRect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function vGrad(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  return g;
}

/** A bevelled frame: metal rim (top-lit), dark inner well. Returns the inner rect [x, y, w, h, r]. */
function bevelFrame(ctx, x, y, w, h, r, metal, well) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = vGrad(ctx, y, y + h, metal);
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = INK;
  roundRect(ctx, x - 0.5, y - 0.5, w + 1, h + 1, r + 0.5);
  ctx.stroke();
  const b = 1.6;
  const inner = [x + b, y + b, w - 2 * b, h - 2 * b, Math.max(1, r - b)];
  roundRect(ctx, ...inner);
  ctx.fillStyle = vGrad(ctx, inner[1], inner[1] + inner[3], well);
  ctx.fill();
  // recess: a dark line under the top rim and a faint light one above the bottom rim
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath();
  ctx.moveTo(inner[0] + inner[4], inner[1] + 0.4);
  ctx.lineTo(inner[0] + inner[2] - inner[4], inner[1] + 0.4);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,235,190,0.12)";
  ctx.beginPath();
  ctx.moveTo(inner[0] + inner[4], inner[1] + inner[3] - 0.4);
  ctx.lineTo(inner[0] + inner[2] - inner[4], inner[1] + inner[3] - 0.4);
  ctx.stroke();
  return inner;
}

function star(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    ctx[i ? "lineTo" : "moveTo"](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
}

/**
 * Growth mark centred at (cx, cy), s px wide: one chevron up or down, two when growth is fast, a small diamond
 * when it is flat. Filled in green / red / parchment with a dark outline so it reads on any state colour.
 */
function growthMark(ctx, cx, cy, s, g) {
  const flat = Math.abs(g) < GROWTH_FLAT;
  const fast = Math.abs(g) >= GROWTH_FAST;
  const up = g >= 0;
  ctx.beginPath();
  if (flat) {
    const d = s * 0.36;
    ctx.moveTo(cx, cy - d);
    ctx.lineTo(cx + d, cy);
    ctx.lineTo(cx, cy + d);
    ctx.lineTo(cx - d, cy);
    ctx.closePath();
  } else {
    const hw = s / 2, h = s * (fast ? 0.42 : 0.6), t = h * 0.55; // half width, height, stroke thickness
    const dir = up ? -1 : 1;
    const one = (oy) => {
      const Y = (v) => cy + oy + dir * (h / 2 - v); // v runs from the tip (0) to the back (h)
      ctx.moveTo(cx, Y(0));
      ctx.lineTo(cx + hw, Y(h - t));
      ctx.lineTo(cx + hw, Y(h));
      ctx.lineTo(cx, Y(t));
      ctx.lineTo(cx - hw, Y(h));
      ctx.lineTo(cx - hw, Y(h - t));
      ctx.closePath();
    };
    if (fast) {
      one(-h * 0.55);
      one(h * 0.55);
    } else one(0);
  }
  ctx.lineJoin = "round";
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = "rgba(10,8,4,0.8)";
  ctx.stroke();
  ctx.fillStyle = flat ? "#e8dcb4" : up ? "#8ff07c" : "#ff8a72";
  ctx.fill();
}

/** Text with a 1px drop shadow (or a light lift for dark text). */
function liftedText(ctx, t, x, y, color, dark) {
  ctx.fillStyle = dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.75)";
  ctx.fillText(t, x, y + 1);
  ctx.fillStyle = color;
  ctx.fillText(t, x, y);
}

const tabWidths = new Map(); // label → measured text width (the font is fixed)
function tabTextWidth(ctx, label) {
  let w = tabWidths.get(label);
  if (w == null) {
    ctx.save();
    ctx.font = TAB_FONT;
    w = ctx.measureText(label.toUpperCase()).width + label.length * 0.5; // + the letter spacing
    ctx.restore();
    tabWidths.set(label, w);
  }
  return w;
}

/** The city-type tab: a small coloured ribbon above the plate, centred on it (W wide), its text in capitals. */
function paintTab(ctx, ox, oy, W, badge) {
  const txt = badge.label.toUpperCase();
  const tw = Math.min(W - 16, Math.ceil(tabTextWidth(ctx, badge.label) + 12));
  const x = ox + (W - tw) / 2, y = oy - TAB_H + 1;
  const col = badge.rgb;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;
  roundRect(ctx, x, y, tw, TAB_H + 4, 3.5);
  ctx.fillStyle = vGrad(ctx, y, y + TAB_H + 4, BRONZE);
  ctx.fill();
  ctx.restore();
  roundRect(ctx, x + 1.2, y + 1.2, tw - 2.4, TAB_H + 2, 2.6);
  ctx.fillStyle = vGrad(ctx, y, y + TAB_H, [css(shade(col, 0.22)), css(col), css(shade(col, -0.35))]);
  ctx.fill();
  ctx.save();
  roundRect(ctx, x + 1.2, y + 1.2, tw - 2.4, TAB_H - 1.2, 2.6);
  ctx.clip();
  ctx.font = TAB_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const dark = luminance(col) > 0.36;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0.5px";
  liftedText(ctx, txt, x + tw / 2, y + 1.2 + (TAB_H - 1.2) / 2 + 0.3, dark ? "#17110a" : "#fff8e6", dark);
  ctx.restore();
}

/**
 * Paint one banner with its upper-left plate corner at (ox, oy). W = plate width, H = total height (both tiers).
 */
function paintBanner(ctx, ox, oy, W, m, L, col, { selected, showYields, ptr = null, badge = null }) {
  const NH = L.h;
  if (badge) paintTab(ctx, ox, oy, W, badge); // first: the plate covers its foot
  const metal = selected ? GOLD : BRONZE;
  const tierH = showYields && m.parts.length ? L.yieldH : 0;
  const bottom = oy + NH + (tierH ? tierH - 2 : 0);

  // soft drop shadow for both tiers and the pointer
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = "rgba(0,0,0,0.9)";
  roundRect(ctx, ox, oy, W, NH, 5);
  ctx.fill();
  if (tierH) {
    const tw = Math.min(W - 10, m.tierW), tx = ox + (W - tw) / 2;
    roundRect(ctx, tx, oy + NH - 4, tw, tierH + 2, 4);
    ctx.fill();
  }
  ctx.restore();
  if (selected) {
    ctx.save();
    ctx.shadowColor = "rgba(255,214,110,0.95)";
    ctx.shadowBlur = 7;
    ctx.strokeStyle = "rgba(255,226,140,0.9)";
    ctx.lineWidth = 2;
    roundRect(ctx, ox - 1, oy - 1, W + 2, NH + 2, 6);
    ctx.stroke();
    ctx.restore();
  }

  // pointer down to the city
  const pcx = ox + (ptr == null ? W / 2 : ptr);
  ctx.beginPath();
  ctx.moveTo(pcx - 4.5, bottom - 1);
  ctx.lineTo(pcx + 4.5, bottom - 1);
  ctx.lineTo(pcx, bottom + POINTER);
  ctx.closePath();
  ctx.fillStyle = vGrad(ctx, bottom - 1, bottom + POINTER, [metal[1], metal[2]]);
  ctx.fill();
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // lower tier: yield row, tucked under the plate
  if (tierH) {
    const tw = Math.min(W - 10, m.tierW), tx = ox + (W - tw) / 2, ty = oy + NH - 4;
    const [ix, iy, iw, ih] = bevelFrame(ctx, tx, ty, tw, tierH + 2, 4, [metal[1], metal[2], metal[2]],
      ["#0c1118", "#121a24"]);
    ctx.save();
    roundRect(ctx, ix, iy, iw, ih, 3);
    ctx.clip();
    ctx.font = L.yieldFont;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const cy = iy + 2 + (ih - 2) / 2; // the top 2px sit under the plate
    let yx = tx + (tw - m.yieldsW) / 2;
    m.parts.forEach((p, i) => {
      if (i) {
        // a small diamond between entries
        const dx = yx - L.yieldGap / 2;
        ctx.beginPath();
        ctx.moveTo(dx, cy - 1.8);
        ctx.lineTo(dx + 1.8, cy);
        ctx.lineTo(dx, cy + 1.8);
        ctx.lineTo(dx - 1.8, cy);
        ctx.closePath();
        ctx.fillStyle = "rgba(201,164,92,0.55)";
        ctx.fill();
      }
      const icx = yx + L.yieldIcon / 2;
      if (!drawIcon(ctx, p.yd.icon || `y-${p.yd.key}`, icx, cy, L.yieldIcon,
        { medallion: false, color: p.yd.color, shadow: false })) {
        ctx.fillStyle = p.yd.color;
        ctx.beginPath();
        ctx.arc(icx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      liftedText(ctx, p.t, yx + L.yieldIcon + 2, cy + 0.5, "#ece2c8", false);
      yx += L.yieldIcon + 2 + p.w + L.yieldGap;
    });
    ctx.restore();
  }

  // upper tier: the plate
  const [ix, iy, iw, ih, ir] = bevelFrame(ctx, ox, oy, W, NH, 5, metal, ["#2b3849", "#18212d", "#0e141b"]);
  ctx.save();
  roundRect(ctx, ix, iy, iw, ih, ir);
  ctx.clip();

  // state-coloured cap with a chevron edge pointing at the name
  const cx1 = ox + m.capW;
  const chev = Math.min(5, NH * 0.24);
  const capPath = () => {
    ctx.beginPath();
    ctx.moveTo(ix - 1, iy - 1);
    ctx.lineTo(cx1 - chev, iy - 1);
    ctx.lineTo(cx1, iy + ih / 2);
    ctx.lineTo(cx1 - chev, iy + ih + 1);
    ctx.lineTo(ix - 1, iy + ih + 1);
    ctx.closePath();
  };
  capPath();
  ctx.fillStyle = vGrad(ctx, iy, iy + ih, [css(shade(col, 0.3)), css(col), css(shade(col, -0.32))]);
  ctx.fill();
  // gloss on the cap's upper half
  ctx.save();
  capPath();
  ctx.clip();
  ctx.fillStyle = vGrad(ctx, iy, iy + ih * 0.5, ["rgba(255,255,255,0.28)", "rgba(255,255,255,0.04)"]);
  ctx.fillRect(ix, iy, m.capW, ih * 0.5);
  ctx.restore();
  // chevron edge: a dark seam with a lit lip
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.beginPath();
  ctx.moveTo(cx1 - chev + 0.8, iy - 1);
  ctx.lineTo(cx1 + 0.8, iy + ih / 2);
  ctx.lineTo(cx1 - chev + 0.8, iy + ih + 1);
  ctx.stroke();
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.moveTo(cx1 - chev - 0.9, iy - 1);
  ctx.lineTo(cx1 - 0.9, iy + ih / 2);
  ctx.lineTo(cx1 - chev - 0.9, iy + ih + 1);
  ctx.stroke();

  // population, and the growth chevron beside it
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = L.pop;
  const darkText = luminance(col) > 0.36;
  const capMid = ox + (m.capW - chev * 0.5) / 2 + 0.5;
  const px0 = Math.round(capMid - (m.popW + m.chevW) / 2);
  liftedText(ctx, m.pop, px0, oy + NH / 2 + 0.5, darkText ? "#17110a" : "#fffaf0", darkText);
  if (m.growth != null) growthMark(ctx, px0 + m.popW + 3 + L.chev / 2, oy + NH / 2, L.chev, m.growth);

  // name in small caps, centred between the cap and the specialty medallion
  const nx0 = cx1 + 6, nx1 = ox + W - 4 - m.specW;
  let tx = (nx0 + nx1) / 2 - m.nameW / 2;
  const ty = oy + NH / 2 + 0.5;
  ctx.textAlign = "left";
  if (m.capital) {
    const sr = L.star / 2, scx = tx + sr, scy = ty - 0.5;
    star(ctx, scx, scy + 0.8, sr);
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fill();
    star(ctx, scx, scy, sr);
    ctx.fillStyle = vGrad(ctx, scy - sr, scy + sr, ["#fff3b8", "#e6b23c", "#a8761c"]);
    ctx.fill();
    tx += L.star + 3;
  }
  // small caps share one baseline: put it half a cap height (~0.7 em) below the optical centre
  const nameCol = selected ? "#ffeaa6" : "#f4e8c8";
  const base = ty + L.bigPx * 0.35;
  ctx.textBaseline = "alphabetic";
  for (const r of m.runs) {
    ctx.font = r.big ? L.big : L.small;
    liftedText(ctx, r.t, tx, base, nameCol, false);
    tx += r.w;
  }

  // zoomed in the plate is as wide as the yield row: spell the growth out where there is room beside the name
  if (showYields && m.growthTxt && (nx1 - nx0 - m.nameW) / 2 > m.growthW + 10) {
    ctx.font = L.yieldFont;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    liftedText(ctx, m.growthTxt, nx1 - 3, ty, m.growth >= 0 ? "#9be88f" : "#ff9a8a", false);
  }
  ctx.restore();

  // most specialised industry, as a medallion set into the right end of the plate
  if (m.spec) drawIcon(ctx, m.spec.icon, ox + W - 2.5 - L.spec / 2, oy + NH / 2, L.spec, { bg: m.spec.bg });
}

// --- sprite cache ---------------------------------------------------------------------------------------------------

const SPRITE_MAX = 500;
const sprites = new Map(); // key -> {m, canvas, cssW, cssH}

function newCanvas(w, h) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  if (typeof document === "undefined") return null;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  return cv;
}

function bannerSprite(key, m, L, col, W, H, scale, flags) {
  let sp = sprites.get(key);
  if (sp && sp.m === m) {
    sprites.delete(key);
    sprites.set(key, sp);
    return sp;
  }
  const top = flags.badge ? TAB_H : 0; // the tab stands above the plate
  const cssW = W + PAD * 2, cssH = H + PAD * 2 + POINTER + top;
  const canvas = newCanvas(Math.ceil(cssW * scale), Math.ceil(cssH * scale));
  const c = canvas && canvas.getContext("2d");
  if (!c) return null;
  c.scale(scale, scale);
  paintBanner(c, PAD, PAD + top, W, m, L, col, flags);
  sp = { m, canvas, cssW, cssH };
  sprites.set(key, sp);
  if (sprites.size > SPRITE_MAX) sprites.delete(sprites.keys().next().value);
  return sp;
}

// --- public ---------------------------------------------------------------------------------------------------------

/** Is `city` one of state.bannerFocus: true (the selected city), a city, an id, or an array / Set of those? */
function inFocus(focus, city, sel) {
  if (focus === true) return city === sel;
  if (focus instanceof Set) return focus.has(city) || focus.has(city.id);
  if (Array.isArray(focus)) return focus.some((f) => f === city || f === city.id || (f && f.id === city.id));
  if (typeof focus === "object") return focus === city || focus.id === city.id;
  return focus === city.id;
}

const badgeRGB = new Map(); // "#rrggbb" → [r, g, b]
/** The city's type badge from state.cityBadges, with its colour as rgb; null when it has none. */
function badgeFor(badges, city) {
  const b = badges.get?.(city.id);
  if (!b || !b.label) return null;
  let rgb = badgeRGB.get(b.color);
  if (!rgb) {
    const n = /^#[0-9a-f]{6}$/i.test(b.color || "") ? parseInt(b.color.slice(1), 16) : 0x6a7484;
    rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    badgeRGB.set(b.color, rgb);
  }
  return { label: b.label, color: b.color, rgb };
}

/** Population floor for a hex radius in screen px: national view shows the big metros, close zoom everything. */
function popFloor(Rpx) {
  return Rpx < 5 ? 2e6 : Rpx < 8 ? 7e5 : Rpx < 14 ? 2.5e5 : Rpx < 24 ? 1.5e5 : Rpx < 40 ? 1e5 : Rpx < 70 ? 4e4 : 0;
}

/**
 * Draw the banners and return the hit list: [{x, y, w, h, city, specialty}] in screen css px.
 * `nation` (nation.json) is optional; it falls back to state.nation. Without it there is no specialty icon.
 *
 * State read: selectedCity (placed first whatever its size, gold frame, tiered when zoomed in), hoverCell (that
 * cell's city gets the yield tier when its banner is shown, at full opacity), and bannerFocus (optional: true for the
 * selected city, or a city / id / array / Set; while set, the other banners fade to 35% and only focus cities get
 * the yield tier, for the City View). A tiered banner that would collide falls back to the one-line plate.
 * cityBadges (optional Map id → {label, color "#rrggbb"}): a tiered banner of such a city carries its city-type tab
 * above the plate (the hit rect includes it).
 * bannerBounds (optional {x0, x1} css px): plates of cities near or just past those edges (default: the screen) are
 * slid inside them, with the pointer still aimed at the city.
 */
export function drawBanners(ctx, cam, w, state, yields, nation = state.nation) {
  const { grid } = w;
  const Rpx = grid.R * cam.scale;
  const minPop = popFloor(Rpx);
  const showYields = Rpx > 24;
  const L = Rpx < 8 ? LAYOUTS.compact : LAYOUTS.full;
  // count budget: about 0.3 plates per plate-sized patch of screen (the plates themselves stay well under that)
  const unit = L === LAYOUTS.compact ? 170 * 50 : 320 * 90;
  const budget = Math.max(6, Math.round(((cam.w * cam.h) / unit) * 0.3));
  const tierMax = Math.max(3, Math.min(TIER_MAX, Math.round((cam.w * cam.h) / TIER_AREA)));
  const t = typeof ctx.getTransform === "function" ? ctx.getTransform() : null;
  const scale = t ? Math.max(0.5, Math.round(Math.hypot(t.a, t.b) * 4) / 4) : 1;
  const placed = [];
  const hits = [];
  const sel = state.selectedCity || null;
  const hov = state.hoverCell >= 0 ? w.cityByCell?.get(state.hoverCell) ?? null : null;
  const focus = state.bannerFocus || null;
  const cities = state.cities;
  // Horizontal room for plates: the screen, or state.bannerBounds {x0, x1} (css px) beside an open dock.
  const bx0 = state.bannerBounds?.x0 ?? 0, bx1 = state.bannerBounds?.x1 ?? cam.w;
  const badges = state.cityBadges || null; // Map id → {label, color}: the city-type tab on tiered banners
  const blocked = (r) => placed.some((p) => r.x < p.x + p.w && p.x < r.x + r.w && r.y < p.y + p.h && p.y < r.y + r.h);
  let shown = 0, tiers = 0;

  for (let k = sel ? -1 : 0; k < cities.length; k++) {
    const pinned = k < 0; // the selected city goes first, whatever its size
    const city = pinned ? sel : cities[k];
    if (!pinned) {
      if (city === sel) continue; // already placed
      if (city.population < minPop || shown >= budget) break; // cities are sorted by population
    }
    if (city.cell == null) continue;
    const [sx, sy] = cam.toScreen(grid.cx(city.cell), grid.cy(city.cell));
    if (sx < -200 || sy < -80 || sx > cam.w + 200 || sy > cam.h + 100) continue;

    const focused = focus == null || inFocus(focus, city, sel);
    const m = measure(ctx, city, yields, nation, L);
    // the yield tier: the selected and hovered cities, then the biggest few in view (or the focus cities)
    const tierOk = pinned || city === hov || (focus != null ? focused : tiers < tierMax);
    let tiered = showYields && m.parts.length > 0 && tierOk;
    const badge0 = badges && showYields ? badgeFor(badges, city) : null;
    let width, height, x, y, rect, ptr, tab;
    const layout = () => {
      width = Math.ceil(tiered ? Math.max(m.plateW, m.tierW + 12) : m.plateW);
      height = L.h + (tiered ? L.yieldH - 2 : 0);
      x = Math.round(sx - width / 2);
      // A city near the screen edge keeps its whole plate on screen; the pointer still aims at the city.
      ptr = null;
      if (sx >= bx0 - 24 && sx <= bx1 + 24 && bx1 - bx0 > width + 16) {
        const cx = Math.max(bx0 + EDGE, Math.min(bx1 - EDGE - width, x));
        if (cx !== x) {
          x = cx;
          ptr = Math.round(Math.max(9, Math.min(width - 9, sx - x))); // at the plate's end when the city is just off screen
        }
      }
      // Full city tiles (towers, the capitol dome) stand taller than a dot: lift the plate clear of them.
      y = Math.round(sy - Math.max(10, Rpx * (cityIsDot(city, Rpx) ? 0.55 : 0.75)) - height);
      tab = tiered && badge0 ? TAB_H : 0;
      rect = { x: x - GAP_X, y: y - GAP_Y - tab, w: width + 2 * GAP_X, h: height + POINTER + 2 * GAP_Y + tab };
    };
    layout();
    if (blocked(rect) && tiered) {
      tiered = false; // no room for the yield row: try the one-line plate
      layout();
    }
    if (blocked(rect)) continue;
    placed.push(rect);
    const onScreen = x + width > 0 && x < cam.w && y + height > 0 && y < cam.h;
    if (!pinned && onScreen) {
      shown++;
      if (tiered && city !== hov) tiers++;
    }

    const col = w.stateColor[w.raw.owner[city.cell]] || [190, 190, 190];
    const selected = sel === city;
    const dimmed = !selected && w.dim && w.dim[city.cell];
    const alpha = Math.min(focused || city === hov ? 1 : FOCUS_FADE, dimmed ? 0.5 : 1);
    const badge = tab ? badge0 : null;
    const flags = { selected, showYields: tiered, ptr, badge };
    const key = `${city.id}|${L.name}|${tiered ? 1 : 0}|${selected ? 1 : 0}|${scale}|${col.join(",")}|${width}|${ptr ?? ""}|${badge ? `${badge.label}|${badge.color}` : ""}`;
    const sp = bannerSprite(key, m, L, col, width, height, scale, flags);
    if (alpha < 1) ctx.globalAlpha = alpha;
    if (sp) {
      let dx = x - PAD, dy = y - PAD - tab;
      if (t && t.b === 0 && t.c === 0 && t.a > 0 && t.d > 0) {
        dx = (Math.round(t.a * dx + t.e) - t.e) / t.a;
        dy = (Math.round(t.d * dy + t.f) - t.f) / t.d;
      }
      ctx.drawImage(sp.canvas, dx, dy, sp.cssW, sp.cssH);
    } else {
      ctx.save();
      paintBanner(ctx, x, y, width, m, L, col, flags);
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    hits.push({ x, y: y - tab, w: width, h: height + tab, city, specialty: m.spec?.key ?? null });
  }
  return hits;
}
