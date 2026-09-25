import { Show } from "solid-js";
import { status } from "../lib/garden";
import SunTag from "./SunTag";
import SowWindows from "./SowWindows";
import Progress from "./Progress";
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

      {/* Frost-relative timing — only useful before it's in the ground */}
      <Show when={state() === "library"}>
        <SowWindows seed={seed()} settings={props.settings} />
      </Show>

      <Show when={state() === "growing"}>
        <Progress seed={seed()} />
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
