import { createResource, createSignal, Show } from "solid-js";
import { api } from "./lib/api";
import { DEFAULT_SETTINGS, todayISO } from "./lib/garden";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import SeedsTable from "./components/SeedsTable";
import Settings from "./components/Settings";
import SeedModal from "./components/SeedModal";
import SetupModal from "./components/SetupModal";
import Toasts from "./components/Toasts";
import { Plus } from "./lib/icons";

export default function App() {
  const [seeds, { refetch, mutate }] = createResource(api.list);
  const [settings, { mutate: mutateSettings, refetch: refetchSettings }] = createResource(api.getSettings);
  const [view, setView] = createSignal("home");
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
  function closeModal() { setModal(null); }

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
  async function saveSetup(patch) {
    await saveSettings(patch);
    setLookupOpen(false);
  }

  // Replace everything with an uploaded backup.
  async function importData(data) {
    try {
      const { seeds: count } = await api.importData(data);
      setModal(null);
      setLookupOpen(false);
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
    setToasts((t) => [...t, { id, message, undo }]);
    setTimeout(() => dismissToast(id), 6000);
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

  return (
    <div class="layout">
      <Sidebar view={view()} onNav={setView} />

      <div class="main">
        <main class="content" classList={{ "content--wide": view() === "seeds" }}>
          <Show when={!loading()} fallback={<p class="loading">Reading the ledger…</p>}>
            <Show when={view() === "home"}>
              <Home seeds={list()} settings={cfg()} onOpen={openSeed} onMarkHarvested={markHarvested}
                onSetup={() => setLookupOpen(true)} />
            </Show>
            <Show when={view() === "seeds"}>
              <SeedsTable seeds={list()} settings={cfg()} onOpen={openSeed} onAdd={openNew} />
            </Show>
            <Show when={view() === "settings"}>
              <Settings settings={cfg()} onSave={saveSettings} seedCount={list().length}
                onLookup={() => setLookupOpen(true)} onReset={resetAll}
                onImport={importData} onError={(m) => pushToast(m)} />
            </Show>
          </Show>
        </main>
      </div>

      <button class="fab" onClick={openNew} aria-label="Add seed">
        <Plus size={18} /> <span>Add seed</span>
      </button>

      <Toasts toasts={toasts()} onDismiss={dismissToast} />

      <Show when={firstRun() || lookupOpen()}>
        <SetupModal settings={cfg()} firstRun={firstRun()} onSave={saveSetup} onClose={() => setLookupOpen(false)}
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
