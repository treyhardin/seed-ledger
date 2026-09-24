import { createSignal, createEffect, For } from "solid-js";
import { MONTHS } from "../lib/garden";

const pad = (n) => String(n).padStart(2, "0");
const DAYS_IN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Month + day picker for an annual 'MM-DD' date. Either part can be blank;
// onChange only fires once both are set (with the day clamped to the month).
export default function FrostDateInput(props) {
  const parse = (v) => (v ? v.split("-").map(Number) : [0, 0]);
  const [m, setM] = createSignal(parse(props.value)[0]);
  const [d, setD] = createSignal(parse(props.value)[1]);

  // Follow outside changes (e.g. a lookup result or a reset).
  createEffect(() => {
    const [pm, pd] = parse(props.value);
    setM(pm);
    setD(pd);
  });

  function commit(nm, nd) {
    setM(nm);
    setD(nd);
    if (!nm || !nd) return;
    const day = Math.min(Math.max(nd, 1), DAYS_IN[nm - 1]);
    props.onChange(`${pad(nm)}-${pad(day)}`);
  }

  return (
    <div class="frost-date">
      <label class="field">
        <span class="field__label">Month</span>
        <select class="field__input" value={m() || ""} aria-label={`${props.label} month`}
          onChange={(e) => commit(Number(e.currentTarget.value), d())}>
          <option value="">—</option>
          <For each={MONTHS}>{(name, i) => <option value={i() + 1}>{name}</option>}</For>
        </select>
      </label>
      <label class="field">
        <span class="field__label">Day</span>
        <input class="field__input" type="number" min="1" max="31" placeholder="—"
          aria-label={`${props.label} day`} value={d() || ""}
          onChange={(e) => commit(m(), Number(e.currentTarget.value))} />
      </label>
    </div>
  );
}
