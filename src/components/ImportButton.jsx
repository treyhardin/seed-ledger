import { createSignal, Show } from "solid-js";
import ConfirmModal from "./ConfirmModal";

const plural = (n) => `${n} ${n === 1 ? "seed" : "seeds"}`;

// Pick a Seed Ledger backup (.json), check it, confirm when it would replace
// existing data, then hand it to props.onImport.
export default function ImportButton(props) {
  let input;
  const [pending, setPending] = createSignal(null);

  async function onFile(e) {
    const file = e.currentTarget.files?.[0];
    e.currentTarget.value = ""; // allow picking the same file again
    if (!file) return;
    let data;
    try {
      data = JSON.parse(await file.text());
    } catch {
      return props.onError("That file isn't valid JSON.");
    }
    if (data?.app !== "seed-ledger" || !Array.isArray(data.seeds)) {
      return props.onError("That file isn't a Seed Ledger backup.");
    }
    if (props.hasData) setPending(data);
    else props.onImport(data);
  }

  const backupDate = (d) => (d.exported_at ? ` from ${new Date(d.exported_at).toLocaleDateString()}` : "");

  return (
    <>
      <input ref={input} type="file" accept=".json,application/json" hidden onChange={onFile} />
      <button type="button" class={props.class || "btn"} onClick={() => input.click()}>
        {props.children}
      </button>
      <Show when={pending()}>
        {(data) => (
          <ConfirmModal
            title="Replace your data?"
            message={`Importing this backup${backupDate(data())} replaces ${props.seedCount ? `your ${plural(props.seedCount)}` : "your data"} and settings with ${plural(data().seeds.length)} from the file. This can't be undone. Download a backup first if you might want your current data.`}
            confirmLabel="Replace and import"
            onCancel={() => setPending(null)}
            onConfirm={() => { const d = data(); setPending(null); props.onImport(d); }}
          />
        )}
      </Show>
    </>
  );
}
