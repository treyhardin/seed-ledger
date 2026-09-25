// Location lookup for first-run setup, powered by Open-Meteo (open-meteo.com,
// free for non-commercial use, CC BY 4.0). Only called when the user searches.
//   searchPlaces("Lyon")   → candidate places with coordinates
//   estimateClimate(place) → frost dates + hardiness zone from ~30 years of
//                            daily low temperatures (ERA5 reanalysis)

const GEOCODE = "https://geocoding-api.open-meteo.com/v1/search";
const ARCHIVE = "https://archive-api.open-meteo.com/v1/archive";
const YEARS = 30;
const FROST_C = 0; // a daily low at or below 0 °C (32 °F) counts as frost

export async function searchPlaces(query) {
  const url = `${GEOCODE}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Place search failed.");
  const { results = [] } = await res.json();
  return results.map((r) => ({
    name: r.name,
    region: [r.admin1, r.country].filter(Boolean).join(", "),
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

// Browser location. Only offered in a secure context (HTTPS or localhost) —
// browsers block geolocation on plain-HTTP pages.
export const canGeolocate = () => !geolocationBlockedReason();

// Why browser location isn't available here, or null if it is.
export function geolocationBlockedReason() {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return "This browser doesn't support location detection.";
  }
  if (!window.isSecureContext) {
    return "Location detection needs HTTPS. Browsers only share your location with secure pages, so it's off when Seed Ledger is opened over plain HTTP.";
  }
  return null;
}

// Resolves to a place ({ name, region, latitude, longitude }). Coordinates are
// rounded to ~1 km before leaving the browser (the weather grid is ~10 km).
export async function currentPlace() {
  const pos = await new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false, timeout: 15000, maximumAge: 600000,
    })
  );
  const round = (n) => Math.round(n * 100) / 100;
  const latitude = round(pos.coords.latitude);
  const longitude = round(pos.coords.longitude);
  const named = await reverseGeocode(latitude, longitude).catch(() => null);
  return { name: "Your location", region: "", ...named, latitude, longitude };
}

// Coordinates → town name via BigDataCloud's free client-side endpoint
// (meant for use with browser geolocation; no key needed).
async function reverseGeocode(latitude, longitude) {
  const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
  if (!res.ok) return null;
  const d = await res.json();
  const name = d.locality || d.city;
  if (!name) return null;
  return { name, region: [d.principalSubdivision, d.countryName].filter(Boolean).join(", ") };
}

// Why a location request failed, in plain words.
export function geolocationError(err) {
  if (err?.code === 1) return "Location access was blocked. Search for your town instead.";
  return "Couldn't get your location. Search for your town instead.";
}

export function placeLabel(p) {
  return [p.name, p.region].filter(Boolean).join(", ");
}

export async function estimateClimate({ latitude, longitude }) {
  const endYear = new Date().getFullYear() - 1;
  const url = `${ARCHIVE}?latitude=${latitude}&longitude=${longitude}` +
    `&start_date=${endYear - YEARS + 1}-01-01&end_date=${endYear}-12-31` +
    `&daily=temperature_2m_min&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather history lookup failed.");
  const { daily } = await res.json();
  return summarize(daily.time, daily.temperature_2m_min, latitude < 0);
}

// Pure calculation (exported for testing).
// Frost seasons run midsummer → midsummer (Jul 15 north, Jan 15 south) so a
// winter never straddles two seasons. Per season: first fall frost = first
// frost after midsummer; last spring frost = last frost before the next one.
// The typical date is the median across seasons (NOAA's "50% probability").
export function summarize(dates, lows, southern) {
  const midMonth = southern ? 0 : 6; // Jan or Jul
  const seasons = new Map(); // season start year → { first, last } day offsets
  const yearMin = new Map(); // calendar year → coldest low

  dates.forEach((iso, i) => {
    const t = lows[i];
    if (t == null) return;
    const [y, m, d] = iso.split("-").map(Number);
    yearMin.set(y, Math.min(yearMin.get(y) ?? Infinity, t));
    if (t > FROST_C) return;
    // Which season this day belongs to, and how far past midsummer it is.
    const seasonYear = (m - 1 > midMonth || (m - 1 === midMonth && d >= 15)) ? y : y - 1;
    const offset = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(seasonYear, midMonth, 15)) / 86400000);
    const s = seasons.get(seasonYear) || { first: Infinity, last: -Infinity };
    s.first = Math.min(s.first, offset);
    s.last = Math.max(s.last, offset);
    seasons.set(seasonYear, s);
  });

  // Only full seasons inside the data window.
  const firstYear = Number(dates[0].slice(0, 4));
  const lastYear = Number(dates[dates.length - 1].slice(0, 4));
  const total = lastYear - firstYear; // seasons fully covered
  const frosty = [...seasons.entries()].filter(([y]) => y >= firstYear && y < lastYear);

  const minima = [...yearMin.values()].filter(Number.isFinite);
  const zone = minima.length ? hardinessZone(minima.reduce((a, b) => a + b, 0) / minima.length) : null;

  // Frost in fewer than half the seasons → no reliable frost dates.
  if (frosty.length < total / 2) return { frostFree: true, zone };

  // Frost-free seasons count as the most extreme values for the median.
  const pad = (arr, fill) => arr.concat(Array(total - arr.length).fill(fill)).sort((a, b) => a - b);
  const firsts = pad(frosty.map(([, s]) => s.first), Infinity);
  const lasts = pad(frosty.map(([, s]) => s.last), -Infinity);
  const median = (a) => a[Math.floor(a.length / 2)];

  return {
    frostFree: false,
    zone,
    first_frost: offsetToMMDD(median(firsts), midMonth),
    last_frost: offsetToMMDD(median(lasts), midMonth),
  };
}

function offsetToMMDD(offset, midMonth) {
  const d = new Date(Date.UTC(2001, midMonth, 15) + offset * 86400000); // 2001: non-leap
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

// USDA zones: 10 °F bands of the average annual extreme minimum, split into
// a/b halves. Zone 1a starts at -60 °F; 13b tops out at 70 °F.
export function hardinessZone(avgMinC) {
  const f = avgMinC * 9 / 5 + 32;
  const idx = Math.max(0, Math.min(25, Math.floor((f + 60) / 5)));
  return `${Math.floor(idx / 2) + 1}${idx % 2 ? "b" : "a"}`;
}
