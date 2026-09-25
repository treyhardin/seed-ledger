import { Show } from "solid-js";
import { expectedHarvest, daysSince, formatDate } from "../lib/garden";
import { fill } from "../lib/motion";

// Days in the ground, measured against days to maturity when known.
export default function Progress(props) {
  const days = () => daysSince(props.seed.planted_date) ?? 0;
  const total = () => props.seed.days_to_maturity;
  const pct = () => Math.min(100, Math.round((days() / total()) * 100));

  return (
    <div class="progress">
      <p class="progress__count">
        <b>{days()}</b>
        <span>{days() === 1 ? "day" : "days"} in the ground{total() ? ` of ${total()}` : ""}</span>
      </p>
      <Show when={total()}>
        <div class="progress__bar" role="progressbar" aria-valuemin="0" aria-valuemax={total()}
          aria-valuenow={Math.min(days(), total())} aria-label="Growing progress">
          <i ref={fill()} style={{ width: `${pct()}%` }} />
        </div>
      </Show>
      <p class="progress__eta">
        Sown {formatDate(props.seed.planted_date)}
        <Show when={expectedHarvest(props.seed)}> · harvest around {formatDate(expectedHarvest(props.seed))}</Show>
      </p>
    </div>
  );
}
