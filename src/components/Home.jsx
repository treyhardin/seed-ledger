import { createMemo, createSignal, createEffect, Show, For, onMount, onCleanup } from "solid-js";
import { status, nextFrost, sowOutlook, formatMonthDay, hasFrostDates } from "../lib/garden";
import Almanac from "./Almanac";
import SeedCard from "./SeedCard";
import { revealHome } from "../lib/motion";
import { Plant, CaretLeft, CaretRight } from "../lib/icons";

export default function Home(props) {
  let root;
  let track;

  // Carousel arrows: only shown when the cards overflow; disabled at each end.
  const [edges, setEdges] = createSignal({ prev: false, next: false });
  const measure = () => {
    if (!track) return setEdges({ prev: false, next: false });
    const max = track.scrollWidth - track.clientWidth;
    setEdges({ prev: track.scrollLeft > 4, next: track.scrollLeft < max - 4 });
  };
  const page = (dir) => {
    const card = track?.querySelector(".card");
    const step = card ? card.getBoundingClientRect().width + 16 : track.clientWidth * 0.8;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" });
  };

  onMount(() => {
    revealHome(root);
    window.addEventListener("resize", measure);
    onCleanup(() => window.removeEventListener("resize", measure));
  });
  const list = () => props.seeds;
  const growing = createMemo(() => list().filter((s) => status(s) === "growing"));
  createEffect(() => { growing().length; requestAnimationFrame(measure); });
  const frost = createMemo(() => nextFrost(props.settings));
  const outlook = createMemo(() => sowOutlook(list(), props.settings));

  const carousel = (rows) => (
    <div class="carousel" ref={track} onScroll={measure}>
      <For each={rows}>
        {(seed) => (
          <SeedCard seed={seed} settings={props.settings}
            onOpen={props.onOpen} onMarkHarvested={props.onMarkHarvested} />
        )}
      </For>
    </div>
  );

  return (
    <div class="view view--home" ref={root}>
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
          <Show when={growing().length && (edges().prev || edges().next)}>
            <div class="shelf__nav">
              <button class="btn btn--icon tip" data-tip="Previous" aria-label="Scroll to previous"
                disabled={!edges().prev} onClick={() => page(-1)}><CaretLeft size={18} /></button>
              <button class="btn btn--icon tip" data-tip="Next" aria-label="Scroll to next"
                disabled={!edges().next} onClick={() => page(1)}><CaretRight size={18} /></button>
            </div>
          </Show>
        </div>
        <Show when={growing().length} fallback={
          <p class="shelf__empty">
            <span class="shelf__empty-icon"><Plant size={20} /></span>
            Nothing planted yet. Mark a seed as planted to start tracking its progress.
          </p>
        }>
          {carousel(growing())}
        </Show>
      </section>
    </div>
  );
}
