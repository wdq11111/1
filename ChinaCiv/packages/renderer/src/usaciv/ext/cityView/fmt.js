// Number formatting for the City View: format.js's compact helpers with a roll-over fix, so a value that rounds up
// to the next unit reads "1.0M" rather than "1000K" (e.g. Westchester's 999,600 people). format.js is shared
// with the rest of the app; this wrapper keeps the same output for every other value.
import { compact as baseCompact, popShort as basePopShort } from "../../format.js";

const UNITS = [[1e12, "T"], [1e9, "B"], [1e6, "M"], [1e3, "K"]];

/** Rounds n up to the next unit when its compact form would print 1000 of the current one. */
function rollover(n, fmt) {
  if (n == null || Number.isNaN(n)) return fmt(n);
  const s = fmt(n);
  const m = /^-?1000(?:\.0+)?([KMB])$/.exec(s);
  if (!m) return s;
  const i = UNITS.findIndex(([, u]) => u === m[1]);
  return fmt(Math.sign(n) * UNITS[i - 1][0]);
}

export const compact = (n) => rollover(n, baseCompact);
export const money = (n) => (n == null ? "–" : compact(n) + "元");
export const yieldValue = (y, v) => (y.unit === "usd" ? money(v) : compact(v));
export const popShort = (n) => rollover(n, basePopShort);
