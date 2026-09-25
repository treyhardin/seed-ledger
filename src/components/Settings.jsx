import { createSignal, Show, For, onMount } from "solid-js";
import { Snowflake, MapPin, Trash, DownloadSimple, UploadSimple, CircleHalf, Sun, Moon } from "../lib/icons";
import FrostDateInput from "./FrostDateInput";
import ConfirmModal from "./ConfirmModal";
import ImportButton from "./ImportButton";
import { revealView } from "../lib/motion";
import { COLOR_MODES, getColorMode, setColorMode } from "../lib/theme";

export default function Settings(props) {
  const s = () => props.settings || {};
  const [confirming, setConfirming] = createSignal(false);
  const MODE_ICON = { auto: CircleHalf, light: Sun, dark: Moon };
  const [mode, setMode] = createSignal(getColorMode());
  const chooseMode = (m) => { setMode(m); setColorMode(m); };
  let root;
  onMount(() => revealView(root, ".settings-panel"));

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
    <div class="view" ref={root}>
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

      <section class="settings-panel">
        <div class="settings-panel__head">
          <h2>Color mode</h2>
          <p>Auto follows your device's light or dark setting. Saved on this device.</p>
        </div>
        <div class="toggle-group" role="radiogroup" aria-label="Color mode">
          <For each={Object.entries(COLOR_MODES)}>
            {([value, label]) => (
              <button type="button" class="toggle-opt" role="radio"
                classList={{ "toggle-opt--on": mode() === value }}
                aria-checked={mode() === value} onClick={() => chooseMode(value)}>
                {MODE_ICON[value]({ size: 16 })} {label}
              </button>
            )}
          </For>
        </div>
      </section>

      <section class="settings-panel">
        <div class="settings-panel__head">
          <h2>Backup &amp; transfer</h2>
          <p>Download all your seeds and settings as a file, or import one to move your garden to another install.</p>
        </div>
        <div class="settings-actions">
          <a class="btn" href="/api/export" download><DownloadSimple size={16} /> Download data</a>
          <ImportButton hasData={props.seedCount > 0 || !!s().last_frost} seedCount={props.seedCount}
            onImport={props.onImport} onError={props.onError}>
            <UploadSimple size={16} /> Import data
          </ImportButton>
        </div>
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
