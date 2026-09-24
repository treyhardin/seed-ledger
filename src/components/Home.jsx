import { createMemo, Show, For } from "solid-js";
import { status, nextFrost, sowOutlook, formatMonthDay, hasFrostDates } from "../lib/garden";
import { Snowflake, Seedling } from "../lib/icons";
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
      <div class="widgets">
        {/* Without frost dates there's no timing to show — prompt for them */}
        <Show when={!hasFrostDates(props.settings)}>
          <div class="countdown countdown--setup">
            <span class="countdown__ico"><Snowflake size={20} /></span>
            <p class="countdown__text">Set your frost dates to see sowing and harvest timing.</p>
            <button class="btn btn--primary countdown__action" onClick={props.onSetup}>Set frost dates</button>
          </div>
        </Show>
        <Show when={frost()}>
          <div class="countdown">
            <span class="countdown__ico"><Snowflake size={20} /></span>
            <p class="countdown__text">
              <Show
                when={frost().weeks >= 1}
                fallback={<><span class="countdown__what">{frost().label}</span> {frost().days <= 0 ? "is today" : "this week"}</>}
              >
                <span class="countdown__num">{frost().weeks}</span>{" "}
                <span class="countdown__unit">{frost().weeks === 1 ? "week" : "weeks"} until</span>{" "}
                <span class="countdown__what">{frost().label}</span>
              </Show>
            </p>
            <span class="countdown__date">{formatMonthDay(frost().date)}</span>
          </div>
        </Show>

        {/* Next step: the soonest sow window still to open */}
        <Show when={outlook().next}>
          {(next) => (
            <div class="countdown countdown--sow">
              <span class="countdown__ico"><Seedling size={20} /></span>
              <p class="countdown__text">
                <Show
                  when={next().weeks >= 1}
                  fallback={<span class="countdown__unit">Sow {next().days <= 1 ? "tomorrow" : "this week"}:</span>}
                >
                  <span class="countdown__num">{next().weeks}</span>{" "}
                  <span class="countdown__unit">{next().weeks === 1 ? "week" : "weeks"} until you sow</span>
                </Show>{" "}
                <span class="countdown__what countdown__what--seed">{next().seeds.map((s) => s.name).join(", ")}</span>
              </p>
              <span class="countdown__date">{formatMonthDay(next().date)}</span>
            </div>
          )}
        </Show>

        {/* Ready to sow: every library seed whose sow window is open today */}
        <Show when={outlook().ready.length}>
          <section class="ready" aria-label="Ready to sow">
            <h2 class="ready__title"><Seedling size={16} /> Ready to sow <span class="count">{outlook().ready.length}</span></h2>
            <ul class="ready__list">
              <For each={outlook().ready}>
                {(r) => (
                  <li>
                    <button class="ready__seed" onClick={() => props.onOpen(r.seed)}>
                      <span class="ready__name">{r.seed.name}</span>
                      <span class="ready__until">until {formatMonthDay(r.win.endDate)}</span>
                    </button>
                  </li>
                )}
              </For>
            </ul>
          </section>
        </Show>
      </div>

      <Show when={list().length}>
        <Almanac seeds={list()} settings={props.settings} onSelect={props.onOpen} />
      </Show>

      <section class="shelf">
        <div class="shelf__head">
          <h2>In the Ground</h2>
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
