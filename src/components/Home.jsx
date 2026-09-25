import { createMemo, Show, For } from "solid-js";
import { status, nextFrost, sowOutlook, formatMonthDay, hasFrostDates } from "../lib/garden";
import Almanac from "./Almanac";
import SeedCard from "./SeedCard";

export default function Home(props) {
  const list = () => props.seeds;
  const growing = createMemo(() => list().filter((s) => status(s) === "growing"));
  const frost = createMemo(() => nextFrost(props.settings));
  const outlook = createMemo(() => sowOutlook(list(), props.settings));

  const carousel = (rows) => (
    <div class="carousel">
      <For each={rows}>
        {(seed) => (
          <SeedCard seed={seed} settings={props.settings}
            onOpen={props.onOpen} onMarkHarvested={props.onMarkHarvested} />
        )}
      </For>
    </div>
  );

  return (
    <div class="view view--home">
      {/* "Now": what to do, set as a few lines of type, not a row of widgets. */}
      <section class="now" aria-label="What to do now">
        <Show when={!hasFrostDates(props.settings)}>
          <div class="now__row">
            <span class="now__key">Frost dates</span>
            <div class="now__line now__line--action">
              <p>Set your frost dates to see what to sow, and when.</p>
              <button class="btn btn--primary" onClick={props.onSetup}>Set frost dates</button>
            </div>
          </div>
        </Show>

        <Show when={outlook().ready.length}>
          <div class="now__row now__row--live">
            <span class="now__key">Sow now</span>
            <p class="now__line">
              <For each={outlook().ready}>
                {(r, i) => (
                  <>
                    <Show when={i() > 0}><span class="now__sep">, </span></Show>
                    <button class="now__seed" onClick={() => props.onOpen(r.seed)}>{r.seed.name}</button>
                    <span class="now__meta"> until {formatMonthDay(r.win.endDate)}</span>
                  </>
                )}
              </For>
            </p>
          </div>
        </Show>

        <Show when={outlook().next}>
          {(next) => (
            <div class="now__row">
              <span class="now__key">Next</span>
              <p class="now__line">
                <For each={next().seeds}>
                  {(seed, i) => (
                    <>
                      <Show when={i() > 0}><span class="now__sep">, </span></Show>
                      <button class="now__seed" onClick={() => props.onOpen(seed)}>{seed.name}</button>
                    </>
                  )}
                </For>{" "}
                <span class="now__meta">
                  {next().weeks >= 1 ? `in ${next().weeks} ${next().weeks === 1 ? "week" : "weeks"}` : next().days <= 1 ? "tomorrow" : "this week"}
                </span>
                <span class="now__date">{formatMonthDay(next().date)}</span>
              </p>
            </div>
          )}
        </Show>

        <Show when={frost()}>
          <div class="now__row">
            <span class="now__key">Frost</span>
            <p class="now__line">
              <span class="now__cap">{frost().label}</span>{" "}
              <span class="now__meta">
                {frost().weeks >= 1 ? `in ${frost().weeks} ${frost().weeks === 1 ? "week" : "weeks"}` : frost().days <= 0 ? "today" : "this week"}
              </span>
              <span class="now__date">{formatMonthDay(frost().date)}</span>
            </p>
          </div>
        </Show>
      </section>

      <Show when={list().length}>
        <Almanac seeds={list()} settings={props.settings} onSelect={props.onOpen} />
      </Show>

      <section class="shelf">
        <div class="shelf__head">
          <h2>In the ground</h2>
          <span class="count">{growing().length}</span>
        </div>
        <Show when={growing().length} fallback={
          <p class="shelf__empty">Nothing planted yet. Mark a seed as planted to start tracking its progress.</p>
        }>
          {carousel(growing())}
        </Show>
      </section>
    </div>
  );
}
