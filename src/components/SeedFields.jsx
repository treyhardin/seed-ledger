import { createStore } from "solid-js/store";
import { createSignal, For, Show } from "solid-js";
import { SUN, SUN_ORDER, ANCHORS, DIRECTIONS, START_METHOD } from "../lib/garden";
import { Plus, X } from "../lib/icons";
import { appear } from "../lib/motion";

// Fields with a fixed default (selects/toggles) vs. free inputs that start blank.
const DEFAULTS = {
  sun: "partial",
  start_method: "direct",
  plant_direction: "before", plant_anchor: "first_frost",
  plant2_direction: "before", plant2_anchor: "last_frost",
  harvest_direction: "after", harvest_anchor: "last_frost",
};
const BLANK = {
  name: "", variety: "", source: "",
  depth_in: "", spacing_in: "", seeds_per_hole: "", days_to_maturity: "",
  days_to_germ: "", days_to_germ_max: "", soil_temp_min: "", soil_temp_max: "",
  transplant_notes: "",
  plant_weeks: "", plant_weeks_max: "",
  plant2_weeks: "", plant2_weeks_max: "",
  harvest_weeks: "",
  notes: "",
  ...DEFAULTS,
};

function toForm(seed) {
  const out = { ...BLANK };
  if (seed) {
    for (const k of Object.keys(BLANK)) out[k] = seed[k] ?? (k in DEFAULTS ? DEFAULTS[k] : "");
  }
  return out;
}

const NUMERIC = [
  "depth_in", "spacing_in", "seeds_per_hole", "days_to_maturity",
  "days_to_germ", "days_to_germ_max", "soil_temp_min", "soil_temp_max",
  "plant_weeks", "plant_weeks_max", "plant2_weeks", "plant2_weeks_max", "harvest_weeks",
];

export default function SeedFields(props) {
  const [form, setForm] = createStore(toForm(props.seed));
  const [second, setSecond] = createSignal(!!props.seed?.plant2_anchor);
  const set = (key) => (e) => setForm(key, e.currentTarget.value);

  const sunOn = (value) => (form.sun || "").split(",").includes(value);
  function toggleSun(value) {
    const cur = form.sun ? form.sun.split(",").filter(Boolean) : [];
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    setForm("sun", SUN_ORDER.filter((v) => next.includes(v)).join(","));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const data = {};
    for (const [k, v] of Object.entries(form)) {
      if (v === "") { data[k] = null; continue; }
      data[k] = NUMERIC.includes(k) ? Number(v) : v;
    }
    // No harvest weeks → harvest comes from days to maturity instead.
    if (data.harvest_weeks == null) {
      data.harvest_direction = null;
      data.harvest_anchor = null;
    }
    // Second sow time only exists when it's switched on.
    if (!second()) {
      data.plant2_weeks = data.plant2_weeks_max = data.plant2_direction = data.plant2_anchor = null;
    }
    // Transplant notes only apply to seeds started indoors.
    if (data.start_method !== "indoors") data.transplant_notes = null;
    props.onSubmit(data);
  }

  // "[1] – [2] weeks [before] [last frost]" — the second box is optional.
  const RangeRow = (loKey, hiKey, dirKey, anchorKey) => (
    <div class="timing-row">
      <input class="field__input timing-weeks" type="number" min="0" placeholder="0"
        aria-label="From (weeks)" value={form[loKey]} onInput={set(loKey)} />
      <span class="timing-unit">–</span>
      <input class="field__input timing-weeks" type="number" min="0" placeholder="—"
        aria-label="To (weeks, optional)" value={form[hiKey]} onInput={set(hiKey)} />
      <span class="timing-unit">weeks</span>
      <select class="field__input" value={form[dirKey]} onChange={set(dirKey)}>
        <For each={Object.entries(DIRECTIONS)}>{([v, l]) => <option value={v}>{l}</option>}</For>
      </select>
      <select class="field__input" value={form[anchorKey]} onChange={set(anchorKey)}>
        <For each={Object.entries(ANCHORS)}>{([v, l]) => <option value={v}>{l}</option>}</For>
      </select>
    </div>
  );

  const SingleRow = (weeksKey, dirKey, anchorKey) => (
    <div class="timing-row">
      <input class="field__input timing-weeks" type="number" min="0" placeholder="0"
        value={form[weeksKey]} onInput={set(weeksKey)} />
      <span class="timing-unit">weeks</span>
      <select class="field__input" value={form[dirKey]} onChange={set(dirKey)}>
        <For each={Object.entries(DIRECTIONS)}>{([v, l]) => <option value={v}>{l}</option>}</For>
      </select>
      <select class="field__input" value={form[anchorKey]} onChange={set(anchorKey)}>
        <For each={Object.entries(ANCHORS)}>{([v, l]) => <option value={v}>{l}</option>}</For>
      </select>
    </div>
  );

  // Min–max numeric pair, e.g. germination days or soil temperature.
  const MinMax = (label, unit, minKey, maxKey) => (
    <div class="field">
      <span class="field__label">{label} <em>{unit}</em></span>
      <div class="minmax">
        <input class="field__input" type="number" min="0" placeholder="min"
          aria-label={`${label} minimum`} value={form[minKey]} onInput={set(minKey)} />
        <span>–</span>
        <input class="field__input" type="number" min="0" placeholder="max"
          aria-label={`${label} maximum`} value={form[maxKey]} onInput={set(maxKey)} />
      </div>
    </div>
  );

  // Enter in a text/number field shouldn't submit (and close) the form —
  // saving only happens through the submit button.
  const blockEnter = (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT") e.preventDefault();
  };

  return (
    <form class="modal__form" onSubmit={submit} onKeyDown={blockEnter}>
      <div class="modal__body form-body">
        <fieldset class="group">
          <legend>Identity</legend>
          <label class="field field--full">
            <span class="field__label">Name</span>
            <input class="field__input" placeholder="e.g. Spinach" value={form.name}
              onInput={set("name")} required autofocus />
          </label>
          <label class="field field--full">
            <span class="field__label">Variety <em>optional</em></span>
            <input class="field__input" placeholder="e.g. Bloomsdale" value={form.variety} onInput={set("variety")} />
          </label>
          <div class="field field--full">
            <span class="field__label">Sun <em>select all that apply</em></span>
            <div class="toggle-group">
              <For each={Object.entries(SUN)}>
                {([v, label]) => (
                  <button type="button" class="toggle-opt" classList={{ "toggle-opt--on": sunOn(v) }}
                    aria-pressed={sunOn(v)} onClick={() => toggleSun(v)}>{label}</button>
                )}
              </For>
            </div>
          </div>
          <label class="field field--full">
            <span class="field__label">Seed source <em>optional</em></span>
            <input class="field__input" placeholder="Company / saved" value={form.source} onInput={set("source")} />
          </label>
        </fieldset>

        <fieldset class="group">
          <legend>Packet specs</legend>
          <label class="field">
            <span class="field__label">Depth <em>in</em></span>
            <input class="field__input" type="number" step="0.125" min="0" value={form.depth_in} onInput={set("depth_in")} />
          </label>
          <label class="field">
            <span class="field__label">Spacing <em>in</em></span>
            <input class="field__input" type="number" step="0.5" min="0" value={form.spacing_in} onInput={set("spacing_in")} />
          </label>
          <label class="field">
            <span class="field__label">Seeds per hole</span>
            <input class="field__input" type="number" min="1" value={form.seeds_per_hole} onInput={set("seeds_per_hole")} />
          </label>
          <label class="field">
            <span class="field__label">Days to maturity</span>
            <input class="field__input" type="number" min="0" value={form.days_to_maturity} onInput={set("days_to_maturity")} />
          </label>
          {MinMax("Days to germinate", "days", "days_to_germ", "days_to_germ_max")}
          {MinMax("Soil temperature", "°F", "soil_temp_min", "soil_temp_max")}
        </fieldset>

        <fieldset class="group group--stack">
          <legend>Starting</legend>
          <div class="toggle-group">
            <For each={Object.entries(START_METHOD)}>
              {([v, label]) => (
                <button type="button" class="toggle-opt" classList={{ "toggle-opt--on": form.start_method === v }}
                  aria-pressed={form.start_method === v} onClick={() => setForm("start_method", v)}>{label}</button>
              )}
            </For>
          </div>
          <Show when={form.start_method === "indoors"}>
            <label class="field field--full">
              <span class="field__label">Transplant instructions</span>
              <textarea class="field__input" rows="2"
                placeholder="e.g. Harden off 7–10 days; transplant 2 wks after last frost"
                value={form.transplant_notes} onInput={set("transplant_notes")} />
            </label>
          </Show>
        </fieldset>

        <fieldset class="group group--stack">
          <legend>Sow</legend>
          {RangeRow("plant_weeks", "plant_weeks_max", "plant_direction", "plant_anchor")}
          <p class="group__hint">Enter a range like 1–2 weeks, or leave the second box blank for a single week.</p>

          <Show
            when={second()}
            fallback={
              <button type="button" class="add-link" onClick={() => setSecond(true)}>
                <Plus size={14} /> Add a second sow time <em>e.g. spring + fall</em>
              </button>
            }
          >
            <div class="second-sow" ref={appear()}>
              <div class="second-sow__head">
                <span class="field__label">Second sow time</span>
                <button type="button" class="btn btn--icon btn--xs tip" data-tip="Remove second sow time" aria-label="Remove second sow time"
                  onClick={() => setSecond(false)}><X size={13} /></button>
              </div>
              {RangeRow("plant2_weeks", "plant2_weeks_max", "plant2_direction", "plant2_anchor")}
            </div>
          </Show>
        </fieldset>

        <fieldset class="group group--stack">
          <legend>Harvest <em>optional</em></legend>
          {SingleRow("harvest_weeks", "harvest_direction", "harvest_anchor")}
          <p class="group__hint">Leave weeks blank to estimate harvest from days to maturity instead.</p>
        </fieldset>

        <fieldset class="group group--stack">
          <legend>Notes</legend>
          <label class="field field--full">
            <textarea class="field__input" rows="3" placeholder="Anything worth remembering next year"
              value={form.notes} onInput={set("notes")} />
          </label>
        </fieldset>
      </div>

      <footer class="modal__foot">
        <button type="button" class="btn btn--ghost" onClick={props.onCancel}>Cancel</button>
        <button type="submit" class="btn btn--primary">{props.submitLabel}</button>
      </footer>
    </form>
  );
}
