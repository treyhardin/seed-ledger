import { createResource, createSignal, Show } from "solid-js";
import { api } from "./lib/api";
import { DEFAULT_SETTINGS, todayISO, nextFrost, formatMonthDay } from "./lib/garden";
import Home from "./components/Home";
import Settings from "./components/Settings";
import SeedModal from "./components/SeedModal";
import SetupModal from "./components/SetupModal";
import Toasts from "./components/Toasts";
import { Plus, Plant, Gear, Snowflake } from "./lib/icons";
import { closeDialog, spin } from "./lib/motion";
import { IS_DEMO, REPO_URL } from "./lib/demo";

export default function App() {
  const [seeds, { refetch, mutate }] = createResource(api.list);
  const [settings, { mutate: mutateSettings, refetch: refetchSettings }] = createResource(api.getSettings);
  const [view, setView] = createSignal("home"); // home | settings
  const [modal, setModal] = createSignal(null); // null | { id: number|null, mode: 'view'|'edit' }
  const [toasts, setToasts] = createSignal([]);
  const [lookupOpen, setLookupOpen] = createSignal(false); // setup modal opened from Settings/Home
  let toastSeq = 0;

  const list = () => seeds() || [];
  const cfg = () => settings() || DEFAULT_SETTINGS;
  const modalSeed = () => {
    const m = modal();
    if (!m || m.id == null) return null;
    return list().find((s) => s.id === m.id) || null;
  };

  function openNew() { setModal({ id: null, mode: "edit" }); }
  function openSeed(seed) { setModal({ id: seed.id, mode: "view" }); }
  function editSeed(seed) { setModal({ id: seed.id, mode: "edit" }); }
  // Dialogs animate out before they unmount.
  function closeModal() { return closeDialog(() => setModal(null)); }

  async function save(data) {
    const m = modal();
    if (m && m.id != null) await api.update(m.id, data);
    else await api.create(data);
    refetch();
  }

  async function update(id, patch) {
    mutate((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    await api.update(id, patch);
    refetch();
  }

  function remove(seed) {
    mutate((rows) => rows.filter((r) => r.id !== seed.id));
    api.remove(seed.id).then(refetch);
    pushToast(`${seed.name} deleted`, () => { api.create(seed).then(refetch); });
    return true;
  }

  async function saveSettings(patch) {
    mutateSettings((s) => ({ ...(s || DEFAULT_SETTINGS), ...patch }));
    await api.updateSettings(patch);
    refetchSettings();
  }

  // First run: settings loaded but setup never completed or skipped.
  const firstRun = () => !settings.loading && settings() && !settings().onboarded;
  function saveSetup(patch) {
    return closeDialog(async () => {
      setLookupOpen(false);
      await saveSettings(patch);
    });
  }
  const go = (next) => { setView(next); window.scrollTo({ top: 0 }); };
  let gearIcon;

  // Replace everything with an uploaded backup.
  async function importData(data) {
    try {
      const { seeds: count } = await api.importData(data);
      await closeDialog(() => { setModal(null); setLookupOpen(false); });
      await Promise.all([refetch(), refetchSettings()]);
      pushToast(`Imported ${count} ${count === 1 ? "seed" : "seeds"}`);
    } catch (err) {
      pushToast(err.message || "Import failed.");
    }
  }

  // Wipe all seeds + settings; the app returns to its first-run state.
  async function resetAll() {
    await api.reset();
    setModal(null);
    setToasts([]);
    setView("home");
    await Promise.all([refetch(), refetchSettings()]);
  }

  function dismissToast(id) { setToasts((t) => t.filter((x) => x.id !== id)); }
  function pushToast(message, undo) {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, message, undo }]); // each toast times itself out
  }

  function markPlanted(seed) {
    update(seed.id, { planted_date: todayISO() });
    pushToast(`${seed.name} marked as planted`, () => update(seed.id, { planted_date: null }));
  }
  function markHarvested(seed, date = todayISO()) {
    // Harvesting returns the seed to the library (unplanted); the date is kept
    // as its last harvest.
    const before = { planted_date: seed.planted_date, harvested_date: seed.harvested_date };
    update(seed.id, { planted_date: null, harvested_date: date });
    pushToast(`${seed.name} marked as harvested`, () => update(seed.id, before));
  }

  const loading = () => seeds.loading || settings.loading;

  // Countdown to the next frost, shown as a badge in the top bar.
  const frost = () => nextFrost(cfg());
  // Weeks away (rounded); within the final week it reads "this week" / "today".
  const frostWeeks = (f) => Math.max(1, Math.round(f.days / 7));
  const frostSoon = (f) => (f.days <= 0 ? "today" : f.days < 7 ? "this week" : null);
  const frostText = (f) =>
    frostSoon(f) ? `${f.label} ${frostSoon(f)}`
      : `${frostWeeks(f)} ${frostWeeks(f) === 1 ? "week" : "weeks"} to ${f.label}`;

  return (
    <div class="layout">
      <header class="topbar">
        <div class="topbar__inner">
        <div class="topbar__start">
        <button class="brand" onClick={() => go("home")} aria-label="Seed Ledger home">
          <span class="mark"><Plant size={19} /></span>
          <span class="brand__name">Seed Ledger</span>
        </button>
        <Show when={IS_DEMO}>
          <a class="demo-pill tip" href={REPO_URL} target="_blank" rel="noopener"
            data-tip="Demo data, nothing is saved. View on GitHub">Demo</a>
        </Show>
        </div>
        <div class="topbar__end">
        <Show when={!loading() && frost()}>
          {(f) => (
            <span class="frost-badge tip" tabindex="0" data-tip={formatMonthDay(f().date)}
              aria-label={`${frostText(f())}, ${formatMonthDay(f().date)}`}>
              <Snowflake size={14} />
              <Show when={!frostSoon(f())} fallback={
                <span class="frost-badge__label frost-badge__label--cap">{f().label} {frostSoon(f())}</span>
              }>
                <b>{frostWeeks(f())}</b>
                <span class="frost-badge__label">{frostWeeks(f()) === 1 ? "week" : "weeks"} to {f().label}</span>
              </Show>
            </span>
          )}
        </Show>
        <button
          class="btn btn--icon topbar__settings tip"
          classList={{ "topbar__settings--active": view() === "settings" }}
          data-tip={view() === "settings" ? "Close settings" : "Settings"}
          aria-label="Settings"
          aria-pressed={view() === "settings"}
          onClick={() => { spin(gearIcon); go(view() === "settings" ? "home" : "settings"); }}
        >
          <span class="topbar__gear" ref={gearIcon}><Gear size={20} /></span>
        </button>
        </div>
        </div>
      </header>

      <div class="main">
        <main class="content">
          <Show when={!loading()} fallback={<p class="loading">Reading the ledger…</p>}>
            <Show when={view() === "home"}>
              <Home seeds={list()} settings={cfg()} onOpen={openSeed} onMarkHarvested={markHarvested}
                onSetup={() => setLookupOpen(true)} />
            </Show>
            <Show when={view() === "settings"}>
              <Settings settings={cfg()} onSave={saveSettings} seedCount={list().length}
                onLookup={() => setLookupOpen(true)} onReset={resetAll}
                onImport={importData} onError={(m) => pushToast(m)} />
            </Show>
          </Show>
        </main>
      </div>

      <Show when={!IS_DEMO}>
        <button class="fab" onClick={openNew} aria-label="Add seed">
          <Plus size={18} /> <span>Add seed</span>
        </button>
      </Show>

      <Toasts toasts={toasts()} onDismiss={dismissToast} />

      <Show when={firstRun() || lookupOpen()}>
        <SetupModal settings={cfg()} firstRun={firstRun()} onSave={saveSetup} onClose={() => closeDialog(() => setLookupOpen(false))}
          seedCount={list().length} onImport={importData} onError={(m) => pushToast(m)} />
      </Show>

      <Show when={modal()}>
        <SeedModal
          seed={modalSeed()}
          creating={modal().id == null}
          initialMode={modal().mode}
          settings={cfg()}
          onSave={save}
          onMarkPlanted={markPlanted}
          onMarkHarvested={markHarvested}
          onDelete={remove}
          onClose={closeModal}
        />
      </Show>
    </div>
  );
}
