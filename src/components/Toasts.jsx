import { For, Show, onMount, onCleanup } from "solid-js";
import { X } from "../lib/icons";
import { toastIn, toastOut } from "../lib/motion";

const LIFETIME = 6000;

// One toast: slides in, times itself out, and animates away before removal.
function Toast(props) {
  let el;
  let closing = false;
  const close = async () => {
    if (closing) return;
    closing = true;
    await toastOut(el);
    props.onDismiss(props.toast.id);
  };
  onMount(() => {
    toastIn(el);
    const timer = setTimeout(close, LIFETIME);
    onCleanup(() => clearTimeout(timer));
  });

  return (
    <div class="toast" ref={el}>
      <span class="toast__msg">{props.toast.message}</span>
      <Show when={props.toast.undo}>
        <button class="toast__undo" onClick={() => { props.toast.undo(); close(); }}>Undo</button>
      </Show>
      <button class="toast__x" aria-label="Dismiss" onClick={close}>
        <X size={14} />
      </button>
    </div>
  );
}

export default function Toasts(props) {
  return (
    <div class="toasts" aria-live="polite">
      <For each={props.toasts}>
        {(t) => <Toast toast={t} onDismiss={props.onDismiss} />}
      </For>
    </div>
  );
}
