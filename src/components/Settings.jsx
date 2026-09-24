import { For } from "solid-js";
import { MONTHS } from "../lib/garden";
import { Snowflake } from "../lib/icons";

function parse(mmdd) {
  const [m, d] = (mmdd || "01-01").split("-").map(Number);
  return { m, d };
}
const pad = (n) => String(n).padStart(2, "0");

export default function Settings(props) {
  const s = () => props.settings || {};

  function setPart(key, part, value) {
    const cur = parse(s()[key]);
    const next = { ...cur, [part]: Number(value) };
    props.onSave({ [key]: `${pad(next.m)}-${pad(next.d)}` });
  }

  const FrostField = (fp) => {
    const val = () => parse(s()[fp.key]);
    return (
      <div class="frost-field">
        <div class="frost-field__label">
          <Snowflake size={18} />
          <div>
            <h3>{fp.title}</h3>
            <p>{fp.help}</p>
          </div>
        </div>
        <div class="frost-field__inputs">
          <label class="field">
            <span class="field__label">Month</span>
            <select class="field__input" value={val().m} onChange={(e) => setPart(fp.key, "m", e.currentTarget.value)}>
              <For each={MONTHS}>{(m, i) => <option value={i() + 1}>{m}</option>}</For>
            </select>
          </label>
          <label class="field">
            <span class="field__label">Day</span>
            <input class="field__input" type="number" min="1" max="31"
              value={val().d} onChange={(e) => setPart(fp.key, "d", e.currentTarget.value)} />
          </label>
        </div>
      </div>
    );
  };

  return (
    <div class="view">
      <section class="settings-panel">
        <div class="settings-panel__head">
          <h2>Frost dates</h2>
          <p>Average frost dates anchor every seed's planting and harvest timing on the almanac. Set them for your microclimate.</p>
        </div>

        {FrostField({ key: "last_frost", title: "Average last spring frost", help: "The last freeze before the growing season — the \"after last frost\" anchor." })}
        {FrostField({ key: "first_frost", title: "Average first fall frost", help: "The first freeze that ends the season — the \"before first frost\" anchor." })}

        <p class="settings-note">Defaults are April 15 and November 15. Look up the average frost dates for your area and set them here.</p>
      </section>
    </div>
  );
}
