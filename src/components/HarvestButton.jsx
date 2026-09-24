import { createSignal, Show } from "solid-js";
import { todayISO } from "../lib/garden";
import { Scythe, X } from "../lib/icons";

// "Mark harvested" that first asks for the harvest date (defaults to today).
export default function HarvestButton(props) {
  const [open, setOpen] = createSignal(false);
  const [date, setDate] = createSignal(todayISO());

  function start() {
    setDate(todayISO());
    setOpen(true);
  }
  function confirm(e) {
    e.preventDefault();
    if (!date()) return;
    setOpen(false);
    props.onConfirm(date());
  }

  return (
    <Show when={open()} fallback={
      <button class="btn btn--harvest" onClick={start}>
        <Scythe size={16} /> Mark harvested
      </button>
    }>
      <form class="date-prompt" onSubmit={confirm}>
        <label class="date-prompt__field">
          <span class="date-prompt__label">Harvested</span>
          <input class="field__input date-prompt__input" type="date" required
            min={props.min || undefined} max={todayISO()}
            value={date()} onInput={(e) => setDate(e.currentTarget.value)} />
        </label>
        <button type="submit" class="btn btn--harvest">Save</button>
        <button type="button" class="btn btn--icon" aria-label="Cancel" onClick={() => setOpen(false)}>
          <X size={16} />
        </button>
      </form>
    </Show>
  );
}
