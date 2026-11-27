export function parseHex(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// k > 0 lightens toward white, k < 0 darkens toward black.
export function shade(c, k) {
  return k >= 0 ? mix(c, [255, 255, 255], k) : mix(c, [0, 0, 0], -k);
}

export function desaturate(c, t) {
  const g = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  return mix(c, [g, g, g], t);
}

export const css = (c, a = 1) =>
  a >= 1 ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

export function rampColor(stops, t) {
  t = Math.min(1, Math.max(0, t));
  const f = t * (stops.length - 1);
  const k = Math.min(stops.length - 2, Math.floor(f));
  return mix(stops[k], stops[k + 1], f - k);
}

// Civ-style "player colours" for states; neighbouring states get different ones.
export const STATE_PALETTE = [
  "#d8483f", "#3b7dd8", "#e2b23a", "#3aa865", "#9a58d0", "#e57c32",
  "#2fb3b0", "#d9549b", "#8cb83a", "#5b6fd8", "#b8653a", "#56c1e6",
].map(parseHex);

// Relative luminance (0..1) of an [r, g, b] colour, for picking readable text on top of it.
export function luminance(c) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}

export const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
