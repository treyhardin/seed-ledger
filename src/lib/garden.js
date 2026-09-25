// Domain helpers for the almanac + seed lifecycle.

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const SUN = {
  full: "Full sun",
  partial: "Partial",
  shade: "Shade",
};
export const SUN_ORDER = ["full", "partial", "shade"];

// Sun is stored as a comma-separated list of values (e.g. "partial,shade").
export function sunList(sun) {
  if (!sun) return [];
  return SUN_ORDER.filter((v) => sun.split(",").map((s) => s.trim()).includes(v));
}
export function sunLabel(sun) {
  return sunList(sun).map((v) => SUN[v]).join(" · ");
}

export const ANCHORS = { last_frost: "last frost", first_frost: "first frost" };
export const ANCHORS_SHORT = { last_frost: "last", first_frost: "first" };
export const DIRECTIONS = { before: "before", after: "after" };

// Frost dates start unset; setup or Settings fills them in.
export const DEFAULT_SETTINGS = {};
export const hasFrostDates = (s) => !!(s?.last_frost && s?.first_frost);

// A seed's lifecycle status, derived from its actual planting dates.
export function status(seed) {
  if (seed.planted_date) return "growing";
  return "library";
}

// --- Annual date math (fraction 0..1 across the year) ---

// Fraction of the year at the start of a given month (1-12); for the month scale.
export function monthFraction(month) {
  return (month - 1) / 12;
}

const REF_YEAR = 2001; // arbitrary non-leap year for annual date math

function mmddToDate(mmdd) {
  if (!mmdd) return null;
  const [m, d] = mmdd.split("-").map(Number);
  return new Date(REF_YEAR, m - 1, d);
}

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.round((date - start) / 86400000);
}

function dateToFraction(date) {
  return (((dayOfYear(date) - 1) % 365) + 365) % 365 / 365;
}

// A concrete (annual, ref-year) date for "N weeks before/after <anchor>".
export function anchoredDate(settings, anchor, weeks, direction) {
  const base = mmddToDate((settings || DEFAULT_SETTINGS)[anchor]);
  if (!base) return null;
  const days = (weeks || 0) * 7 * (direction === "before" ? -1 : 1);
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function anchoredFraction(settings, anchor, weeks, direction) {
  const d = anchoredDate(settings, anchor, weeks, direction);
  return d ? dateToFraction(d) : null;
}

// --- Sow windows ---
// A seed has up to two sow windows (e.g. spring + fall). Each is a range of
// weeks before/after a frost anchor ("1–2 wks before last frost"); a single
// value is just a range whose ends match.

export const SEASON = { last_frost: "Spring", first_frost: "Fall" };
export const START_METHOD = { direct: "Direct sow", indoors: "Start indoors" };

function makeWindow(settings, lo, hi, direction, anchor, n) {
  const a = lo ?? 0;
  const b = hi ?? a;
  const d1 = anchoredDate(settings, anchor, a, direction);
  const d2 = anchoredDate(settings, anchor, b, direction);
  if (!d1 || !d2) return null;
  const [startDate, endDate] = d1 <= d2 ? [d1, d2] : [d2, d1];
  return {
    n, anchor, direction, lo: a, hi: hi ?? null,
    startDate, endDate,
    start: dateToFraction(startDate), end: dateToFraction(endDate),
  };
}

export function sowWindows(seed, settings) {
  const out = [];
  if (seed.plant_anchor) {
    const w = makeWindow(settings, seed.plant_weeks, seed.plant_weeks_max, seed.plant_direction, seed.plant_anchor, 1);
    if (w) out.push(w);
  }
  if (seed.plant2_anchor) {
    const w = makeWindow(settings, seed.plant2_weeks, seed.plant2_weeks_max, seed.plant2_direction, seed.plant2_anchor, 2);
    if (w) out.push(w);
  }
  return out;
}

// Harvest for a sow window: the seed's frost-relative harvest applies to the
// first window; otherwise it's the window's earliest sowing + days to maturity.
export function harvestFor(seed, settings, win) {
  if (win.n === 1 && seed.harvest_anchor) {
    return anchoredFraction(settings, seed.harvest_anchor, seed.harvest_weeks, seed.harvest_direction);
  }
  if (seed.days_to_maturity) return (win.start + seed.days_to_maturity / 365) % 1;
  return null;
}

export function sowFraction(seed, settings) {
  return sowWindows(seed, settings)[0]?.start ?? null;
}
export function harvestFraction(seed, settings) {
  const w = sowWindows(seed, settings)[0];
  return w ? harvestFor(seed, settings, w) : null;
}

export function frostFraction(settings, anchor) {
  return anchoredFraction(settings, anchor, 0, "before");
}

// Turn an annual fraction (0..1) back into a ref-year date, for display.
export function fractionToDate(frac) {
  if (frac == null) return null;
  const d = new Date(REF_YEAR, 0, 1);
  d.setDate(d.getDate() + Math.round(frac * 365));
  return d;
}

// The next upcoming frost (whichever of last/first frost comes first from today).
function nextOccurrence(mmdd, now) {
  if (!mmdd) return null;
  const [m, d] = mmdd.split("-").map(Number);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let date = new Date(now.getFullYear(), m - 1, d);
  if (date < today) date = new Date(now.getFullYear() + 1, m - 1, d);
  return date;
}
export function nextFrost(settings, now = new Date()) {
  const cfg = settings || DEFAULT_SETTINGS;
  const cands = [
    { type: "last", label: "last frost", date: nextOccurrence(cfg.last_frost, now) },
    { type: "first", label: "first frost", date: nextOccurrence(cfg.first_frost, now) },
  ].filter((c) => c.date);
  if (!cands.length) return null;
  cands.sort((a, b) => a.date - b.date);
  const next = cands[0];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((next.date - today) / 86400000);
  return { ...next, days, weeks: Math.round(days / 7) };
}

// Sowing outlook for unplanted (library) seeds:
//   ready    — every seed whose sow window is open today (closing soonest first)
//   upcoming — seeds whose next window hasn't opened yet, soonest first, one
//              entry per seed (its earliest upcoming window); excludes ready seeds
export function sowOutlook(seeds, settings, now = new Date()) {
  const t = yearFraction(now);
  const ready = [];
  const soonest = new Map(); // seed → earliest upcoming window
  for (const seed of seeds.filter((s) => status(s) === "library")) {
    for (const w of sowWindows(seed, settings)) {
      const width = (w.end - w.start + 1) % 1;
      const into = (t - w.start + 1) % 1;
      if (into <= width) {
        ready.push({ seed, win: w, left: width - into });
        continue;
      }
      const days = Math.round(((w.start - t + 1) % 1) * 365);
      const cur = soonest.get(seed);
      if (!cur || days < cur.days) soonest.set(seed, { seed, days, weeks: Math.round(days / 7), date: w.startDate });
    }
  }
  ready.sort((a, b) => a.left - b.left || a.seed.name.localeCompare(b.seed.name));
  const readySet = new Set(ready.map((r) => r.seed));
  const upcoming = [...soonest.values()]
    .filter((u) => !readySet.has(u.seed))
    .sort((a, b) => a.days - b.days || a.seed.name.localeCompare(b.seed.name));
  return { ready, upcoming };
}

// A concrete date for the sow / harvest of a seed, for card display.
export function sowDate(seed, settings) {
  return sowWindows(seed, settings)[0]?.startDate ?? null;
}
export function harvestDate(seed, settings) {
  if (seed.harvest_anchor) return anchoredDate(settings, seed.harvest_anchor, seed.harvest_weeks, seed.harvest_direction);
  return null; // maturity-derived harvest has no fixed calendar date until planted
}

// --- Human-readable timing labels ---

// "2 wks before last frost", "1–2 wks before last frost", "at first frost".
export function timingLabel(weeks, direction, anchor, weeksMax) {
  if (!direction || !anchor) return null;
  const lo = Number(weeks ?? 0);
  const hi = weeksMax != null && Number(weeksMax) !== lo ? Number(weeksMax) : null;
  if (hi == null && lo === 0) return `at ${ANCHORS[anchor]}`;
  const span = hi == null ? `${lo}` : `${Math.min(lo, hi)}–${Math.max(lo, hi)}`;
  const plural = hi != null || lo !== 1;
  return `${span} wk${plural ? "s" : ""} ${direction} ${ANCHORS[anchor]}`;
}

export function windowLabel(win) {
  return timingLabel(win.lo, win.direction, win.anchor, win.hi);
}

// "Mar 25 – Apr 1", or a single date when the window has no width.
export function windowDates(win) {
  const a = formatMonthDay(win.startDate);
  const b = formatMonthDay(win.endDate);
  return a === b ? a : `${a} – ${b}`;
}

// Generic numeric range: "5–15 days", "60–75°F", or a single value.
export function rangeLabel(min, max, unit = "") {
  if (min == null && max == null) return null;
  if (min == null || max == null || Number(min) === Number(max)) return `${min ?? max}${unit}`;
  return `${Math.min(min, max)}–${Math.max(min, max)}${unit}`;
}

// --- Real (calendar) dates for actual plantings ---

export function yearFraction(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear() + 1, 0, 1);
  return (date - start) / (end - start);
}

export function expectedHarvest(seed) {
  if (!seed.planted_date || !seed.days_to_maturity) return null;
  const d = new Date(seed.planted_date + "T00:00:00");
  d.setDate(d.getDate() + seed.days_to_maturity);
  return d;
}

export function daysSince(isoDate) {
  if (!isoDate) return null;
  const then = new Date(isoDate + "T00:00:00");
  return Math.round((Date.now() - then) / 86400000);
}

export function formatDate(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatMonthDay(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function todayISO() {
  // Local calendar date (toISOString is UTC, which rolls over early in the evening).
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
