import { For, Show, createMemo } from "solid-js";
import {
  MONTHS, yearFraction, status, expectedHarvest,
  sowWindows, harvestFor, frostFraction,
} from "../lib/garden";

function connectorSegments(from, to) {
  if (to == null) return [];
  if (to >= from) return [[from, to]];
  return [[from, 1], [0, to]]; // wraps across the window edge
}
function pct(n) { return `${(Math.max(0, Math.min(1, n)) * 100).toFixed(3)}%`; }
// Keep a flag on-track: anchor by right edge when it sits in the far-right band.
function flagPos(f) { return f > 0.82 ? { right: pct(1 - f) } : { left: pct(f) }; }

export default function Almanac(props) {
  const now = new Date();
  const originMonth = now.getMonth();          // 0-11, current month leads the window
  const origin = originMonth / 12;             // start-of-current-month fraction
  const baseYear = now.getFullYear();
  const shift = (f) => (f == null ? null : (((f - origin) % 1) + 1) % 1);
  const settings = () => props.settings;

  const months = createMemo(() =>
    Array.from({ length: 12 }, (_, i) => {
      const idx = (originMonth + i) % 12;
      return { i, label: MONTHS[idx], isJan: idx === 0, year: originMonth + i >= 12 ? baseYear + 1 : baseYear };
    })
  );

  // Fraction where the window crosses into the next year (Jan), if it does.
  const yearBoundary = createMemo(() => {
    const m = months().find((x) => x.isJan && x.i > 0);
    return m ? m.i / 12 : null;
  });

  const today = createMemo(() => shift(yearFraction(now)));
  const lastFrost = createMemo(() => shift(frostFraction(settings(), "last_frost")));
  const firstFrost = createMemo(() => shift(frostFraction(settings(), "first_frost")));

  // Each seed row carries one entry per sow window (spring / fall), shifted
  // into the rolling window: a sow band [start → end], then a grow run to harvest.
  const rows = createMemo(() =>
    props.seeds
      .map((s) => {
        const growing = status(s) === "growing";
        const planned = sowWindows(s, settings()).map((w) => {
          const start = shift(w.start);
          const width = (((w.end - w.start) % 1) + 1) % 1; // band width, wrap-safe
          return { start, end: (start + width) % 1, width, hf: shift(harvestFor(s, settings(), w)) };
        });
        // How far ahead of today the next sow window opens (0–1 of a year); 0 if open now.
        const untilSow = (w) => ((today() - w.start + 1) % 1 <= w.width ? 0 : (w.start - today() + 1) % 1);
        const nextSow = planned.length ? Math.min(...planned.map(untilSow)) : null;
        // Green is reserved for "now": windows open today, and what's actually in the ground.
        for (const w of planned) w.open = untilSow(w) === 0;
        let wins = planned;
        if (growing) {
          // Plot the real planting (sown date → expected harvest), not the plan.
          const sown = shift(yearFraction(new Date(`${s.planted_date}T00:00:00`)));
          const h = expectedHarvest(s);
          wins = [{ start: sown, end: sown, width: 0, hf: h ? shift(yearFraction(h)) : null, open: true }];
        }
        return { seed: s, wins, nextSow, growing, harvest: expectedHarvest(s) };
      })
      // Every seed gets a row (the almanac doubles as the seed list): planted
      // seeds first by soonest expected harvest, then by soonest sow, then
      // seeds with no sow timing yet.
      .sort((a, b) => {
        if (a.growing !== b.growing) return a.growing ? -1 : 1;
        if (a.growing) {
          const d = (a.harvest ?? Infinity) - (b.harvest ?? Infinity);
          if (d) return d;
        } else if (a.nextSow !== b.nextSow) return (a.nextSow ?? Infinity) - (b.nextSow ?? Infinity);
        return a.seed.name.localeCompare(b.seed.name);
      })
  );

  return (
    <section class="almanac" aria-label="Annual planting almanac">
      <header class="almanac__head">
        <h2>The Almanac</h2>
        <ul class="legend" aria-hidden="true">
          <li><span class="key key--sow"></span>Sow</li>
          <li><span class="key key--sow key--open"></span>Sow now / planted</li>
          <li><span class="key key--grow"></span>Grow</li>
          <li><span class="key key--harvest"></span>Harvest</li>
          <li><span class="key key--datum"></span>Frost</li>
          <li><span class="key key--now"></span>Today</li>
        </ul>
      </header>

      <div class="almanac__grid">
        {/* Year band — each year underlines the months it owns */}
        <div class="almanac__years" aria-hidden="true">
          <div class="almanac__corner"></div>
          <div class="almanac__track">
            <span class="yearseg" style={{ left: "0%", width: pct(yearBoundary() ?? 1) }}>{baseYear}</span>
            <Show when={yearBoundary() != null}>
              <span class="yearseg" style={{ left: pct(yearBoundary()), width: pct(1 - yearBoundary()) }}>{baseYear + 1}</span>
            </Show>
          </div>
        </div>

        {/* Month axis */}
        <div class="almanac__months" aria-hidden="true">
          <div class="almanac__corner"></div>
          <div class="almanac__track almanac__track--scale">
            <For each={months()}>
              {(m) => (
                <span class="month" style={{ left: pct(m.i / 12) }}>
                  <i class="month__tick"></i>
                  <span class="month__lbl">{m.label}</span>
                </span>
              )}
            </For>
          </div>
        </div>

        {/* Datum flags — their own band, clear of the month labels */}
        <div class="almanac__datums" aria-hidden="true">
          <div class="almanac__corner"></div>
          <div class="almanac__track">
            <Show when={today() != null}>
              <span class="dflag dflag--now" style={flagPos(today())}>Today</span>
            </Show>
          </div>
        </div>

        {/* Seed rows */}
        <div class="almanac__rows">
          <div class="almanac__lines" aria-hidden="true">
            <Show when={firstFrost() != null}><div class="datum datum--frost" style={{ left: pct(firstFrost()) }}></div></Show>
            <Show when={lastFrost() != null}><div class="datum datum--frost" style={{ left: pct(lastFrost()) }}></div></Show>
          </div>

          <For each={rows()} fallback={<p class="almanac__empty">No seeds yet.</p>}>
            {(r, i) => {
              const isActive = status(r.seed) === "growing";
              return (
                <div class="almanac__row" classList={{ "almanac__row--active": isActive }} style={{ "--i": i() }}>
                  <button class="almanac__rowlabel" onClick={() => props.onSelect?.(r.seed)} >
                    {r.seed.name}
                  </button>
                  <div class="almanac__track">
                    <Show when={!r.wins.length}>
                      <span class="almanac__untimed">No sow timing</span>
                    </Show>
                    <For each={r.wins}>
                      {(w) => {
                        // Sow band spans the window; a single-week window renders as a square.
                        const band = w.width > 0 ? connectorSegments(w.start, w.end) : [[w.start, w.start]];
                        // Grow run from the end of sowing to harvest — skipped if harvest
                        // lands inside the sow window itself.
                        const harvestAfter = w.hf != null && (((w.hf - w.start) % 1) + 1) % 1 > w.width;
                        const grow = harvestAfter ? connectorSegments(w.end, w.hf) : [];
                        return (
                          <>
                            <For each={grow}>
                              {([a, b]) => <span class="run" style={{ left: pct(a), width: pct(b - a) }}></span>}
                            </For>
                            <For each={band}>
                              {([a, b]) => (
                                <span class="sowband" classList={{ "sowband--point": b - a === 0, "sowband--open": w.open }}
                                  style={{ left: pct(a), width: pct(b - a) }}></span>
                              )}
                            </For>
                            <Show when={w.hf != null}>
                              <span class="station station--harvest" style={{ left: pct(w.hf) }}></span>
                            </Show>
                          </>
                        );
                      }}
                    </For>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </section>
  );
}
