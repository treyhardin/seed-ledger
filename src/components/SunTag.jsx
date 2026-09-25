import { For, Show } from "solid-js";
import { sunList, sunLabel } from "../lib/garden";
import { Sun, CloudSun, Cloud } from "../lib/icons";

const ICON = { full: Sun, partial: CloudSun, shade: Cloud };

// Renders the sun-amount icon(s) for a seed, with a hover tooltip and an
// optional inline text label. Used in the table, cards, and detail modal.
export default function SunTag(props) {
  const list = () => sunList(props.sun);
  return (
    <Show when={list().length} fallback={<span class="sun-none">—</span>}>
      <span class="suntag tip" data-tip={sunLabel(props.sun)} aria-label={sunLabel(props.sun)} tabindex="0">
        <span class="suntag__icons">
          <For each={list()}>
            {(v) => <span class={`sun-ico sun-ico--${v}`}>{ICON[v]({ size: props.size || 16 })}</span>}
          </For>
        </span>
        <Show when={props.label}>
          <span class="suntag__lbl">{sunLabel(props.sun)}</span>
        </Show>
      </span>
    </Show>
  );
}
