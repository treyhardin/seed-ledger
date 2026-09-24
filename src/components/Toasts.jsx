import { For, Show } from "solid-js";
import { X } from "../lib/icons";

export default function Toasts(props) {
  return (
    <div class="toasts" aria-live="polite">
      <For each={props.toasts}>
        {(t) => (
          <div class="toast">
            <span class="toast__msg">{t.message}</span>
            <Show when={t.undo}>
              <button
                class="toast__undo"
                onClick={() => { t.undo(); props.onDismiss(t.id); }}
              >
                Undo
              </button>
            </Show>
            <button class="toast__x" aria-label="Dismiss" onClick={() => props.onDismiss(t.id)}>
              <X size={14} />
            </button>
          </div>
        )}
      </For>
    </div>
  );
}
