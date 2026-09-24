import { For, Show } from "solid-js";
import {
  status, sowWindows, harvestFor, windowLabel, windowDates,
  timingLabel, fractionToDate, formatMonthDay,
} from "../lib/garden";
import { Plus, Table as TableIcon } from "../lib/icons";
import SunTag from "./SunTag";

const STATUS_LABEL = { library: "In library", growing: "Growing" };

export default function SeedsTable(props) {
  const wins = (s) => sowWindows(s, props.settings);
  const harvestWhen = (s, w) => formatMonthDay(fractionToDate(harvestFor(s, props.settings, w)));
  const harvestRule = (s, w) =>
    w.n === 1 && s.harvest_anchor
      ? timingLabel(s.harvest_weeks, s.harvest_direction, s.harvest_anchor)
      : s.days_to_maturity ? `${s.days_to_maturity}d from sowing` : null;

  // One line per sow window (a seed can have two, e.g. spring + fall).
  const SowCell = (s) => (
    <Show when={wins(s).length} fallback={<div class="tcell"><b>—</b></div>}>
      <For each={wins(s)}>
        {(w) => (
          <div class="tcell">
            <b>{windowDates(w)}</b>
            <small>{windowLabel(w)}</small>
          </div>
        )}
      </For>
    </Show>
  );
  const HarvestCell = (s) => (
    <Show when={wins(s).length} fallback={<div class="tcell"><b>—</b></div>}>
      <For each={wins(s)}>
        {(w) => (
          <div class="tcell">
            <b>{harvestWhen(s, w) || "—"}</b>
            <Show when={harvestRule(s, w)}><small>{harvestRule(s, w)}</small></Show>
          </div>
        )}
      </For>
    </Show>
  );

  const openKey = (seed) => (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); props.onOpen(seed); }
  };

  return (
    <div class="view">
      <Show when={props.seeds.length} fallback={
        <div class="empty-panel">
          <TableIcon size={28} />
          <p>No seeds logged yet.</p>
          <button class="btn btn--primary" onClick={props.onAdd}><Plus size={16} /> Add seed</button>
        </div>
      }>
        <div class="table-wrap">
          <table class="seeds-table seeds-table--read">
            <thead>
              <tr>
                <th class="col-name">Seed</th>
                <th class="col-sun">Sun</th>
                <th class="col-timing">Sow</th>
                <th class="col-timing">Harvest</th>
              </tr>
            </thead>
            <tbody>
              <For each={props.seeds}>
                {(seed) => (
                  <tr
                    class="row-open"
                    classList={{ "row--growing": status(seed) === "growing" }}
                    tabindex="0"
                    role="button"
                    aria-label={`Open ${seed.name}`}
                    onClick={() => props.onOpen(seed)}
                    onKeyDown={openKey(seed)}
                  >
                    <td class="col-name">
                      <div class="name-stack">
                        <span class="seed-name">{seed.name}</span>
                        <Show when={seed.variety}>
                          <span class="seed-variety">{seed.variety}</span>
                        </Show>
                        <Show when={status(seed) !== "library"}>
                          <span class={`pill pill--${status(seed)} pill--row`}>{STATUS_LABEL[status(seed)]}</span>
                        </Show>
                      </div>
                    </td>
                    <td class="col-sun"><SunTag sun={seed.sun} size={18} /></td>
                    <td class="col-timing"><div class="tstack">{SowCell(seed)}</div></td>
                    <td class="col-timing"><div class="tstack">{HarvestCell(seed)}</div></td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
    </div>
  );
}
