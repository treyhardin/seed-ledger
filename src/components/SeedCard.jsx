import { Show } from "solid-js";
import { status, expectedHarvest, daysSince, formatDate } from "../lib/garden";
import { CalendarDots, Seedling } from "../lib/icons";
import SunTag from "./SunTag";
import SowWindows from "./SowWindows";
import HarvestButton from "./HarvestButton";

export default function SeedCard(props) {
  const seed = () => props.seed;
  const state = () => status(seed());

  return (
    <article class="card" classList={{ "card--growing": state() === "growing" }}>
      <header class="card__head">
        <div>
          <button class="card__name" onClick={() => props.onOpen(seed())}>{seed().name}</button>
          <Show when={seed().variety}>
            <p class="card__variety">{seed().variety}</p>
          </Show>
          <Show when={seed().source}>
            <p class="card__source">{seed().source}</p>
          </Show>
        </div>
        <span class="card__sun"><SunTag sun={seed().sun} size={14} label /></span>
      </header>

      <Show when={seed().days_to_maturity}>
        <dl class="specs">
          <div class="spec"><dt><CalendarDots size={15} /> Maturity</dt><dd>{`${seed().days_to_maturity}d`}</dd></div>
        </dl>
      </Show>

      {/* Frost-relative timing — only useful before it's in the ground */}
      <Show when={state() === "library"}>
        <SowWindows seed={seed()} settings={props.settings} />
      </Show>

      <Show when={state() === "growing"}>
        <div class="progress">
          <p class="progress__line">
            <Seedling size={16} /> In the ground <b>{daysSince(seed().planted_date)}</b> days
            <span> · sown {formatDate(seed().planted_date)}</span>
          </p>
          <Show when={expectedHarvest(seed())}>
            <p class="progress__eta">Expected harvest ~ {formatDate(expectedHarvest(seed()))}</p>
          </Show>
        </div>
      </Show>

      <Show when={seed().notes}>
        <p class="card__notes">{seed().notes}</p>
      </Show>

      <Show when={state() === "growing"}>
        <footer class="card__actions">
          <HarvestButton min={seed().planted_date} onConfirm={(d) => props.onMarkHarvested(seed(), d)} />
        </footer>
      </Show>
    </article>
  );
}
