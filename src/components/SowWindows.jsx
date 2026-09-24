import { For, Show } from "solid-js";
import {
  SEASON, sowWindows, harvestFor, windowLabel, windowDates,
  timingLabel, fractionToDate, formatMonthDay,
} from "../lib/garden";

// One Sow → Harvest pair per sow window. With two windows, each is labeled
// by season (Spring / Fall), or numbered if both share an anchor.
export default function SowWindows(props) {
  const wins = () => sowWindows(props.seed, props.settings);

  const title = (win) => {
    const w = wins();
    if (w.length < 2) return "";
    return w[0].anchor !== w[1].anchor ? ` · ${SEASON[win.anchor]}` : ` · ${win.n}`;
  };
  const harvestWhen = (win) => formatMonthDay(fractionToDate(harvestFor(props.seed, props.settings, win)));
  const harvestRule = (win) => {
    const s = props.seed;
    if (win.n === 1 && s.harvest_anchor) return timingLabel(s.harvest_weeks, s.harvest_direction, s.harvest_anchor);
    return s.days_to_maturity ? `${s.days_to_maturity}d from sowing` : null;
  };

  return (
    <Show when={wins().length} fallback={<p class="windows__empty">No sow timing set.</p>}>
      <div class="windows-stack">
        <For each={wins()}>
          {(win) => (
            <div class="windows">
              <span class="window">
                <em>Sow{title(win)}</em>
                <b>{windowDates(win)}</b>
                <small>{windowLabel(win)}</small>
              </span>
              <span class="window">
                <em>Harvest</em>
                <b>{harvestWhen(win) || "—"}</b>
                <Show when={harvestRule(win)}><small>{harvestRule(win)}</small></Show>
              </span>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
}
