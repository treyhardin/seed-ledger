import { createSignal, Show } from "solid-js";
import { Snowflake, MapPin, Trash } from "../lib/icons";
import FrostDateInput from "./FrostDateInput";
import ConfirmModal from "./ConfirmModal";

export default function Settings(props) {
  const s = () => props.settings || {};
  const [confirming, setConfirming] = createSignal(false);

  const FrostField = (fp) => (
    <div class="frost-field">
      <div class="frost-field__label">
        <Snowflake size={18} />
        <div>
          <h3>{fp.title}</h3>
          <p>{fp.help}</p>
        </div>
      </div>
      <FrostDateInput label={fp.title} value={s()[fp.key]} onChange={(v) => props.onSave({ [fp.key]: v })} />
    </div>
  );

  return (
    <div class="view">
      <section class="settings-panel">
        <div class="settings-panel__head">
          <h2>Frost dates</h2>
          <p>Average frost dates anchor every seed's planting and harvest timing on the almanac. Set them for your microclimate.</p>
        </div>

        <div class="settings-location">
          <MapPin size={18} />
          <div class="settings-location__text">
            <Show when={s().location || s().zone} fallback={<span>No location set</span>}>
              <span>{s().location || "Location not set"}</span>
              <Show when={s().zone}><span class="settings-location__zone">Zone {s().zone}</span></Show>
            </Show>
          </div>
          <button class="btn" onClick={props.onLookup}>Look up by location</button>
        </div>

        {FrostField({ key: "last_frost", title: "Average last spring frost", help: "The last freeze before the growing season — the \"after last frost\" anchor." })}
        {FrostField({ key: "first_frost", title: "Average first fall frost", help: "The first freeze that ends the season — the \"before first frost\" anchor." })}
      </section>

      <section class="settings-panel settings-panel--danger">
        <div class="settings-panel__head">
          <h2>Reset app data</h2>
          <p>Delete every seed and setting and return Seed Ledger to a fresh install. This can't be undone.</p>
        </div>
        <div><button class="btn btn--danger" onClick={() => setConfirming(true)}><Trash size={16} /> Reset app data</button></div>
      </section>

      <Show when={confirming()}>
        <ConfirmModal
          title="Reset app data?"
          message={`This permanently deletes ${props.seedCount === 1 ? "your 1 seed" : `all ${props.seedCount} seeds`}, your frost dates, and your location, and returns Seed Ledger to a fresh install. This can't be undone.`}
          confirmLabel="Delete everything"
          onCancel={() => setConfirming(false)}
          onConfirm={() => { setConfirming(false); props.onReset(); }}
        />
      </Show>
    </div>
  );
}
