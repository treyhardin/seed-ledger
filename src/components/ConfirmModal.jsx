import { X } from "../lib/icons";
import { dialogIn, closeDialog } from "../lib/motion";

// Small confirmation dialog for destructive actions. Cancelling (button, X, or
// a genuine backdrop click) is always the safe default.
export default function ConfirmModal(props) {
  // Animate out, then let the caller act.
  const cancel = () => closeDialog(props.onCancel);
  const confirm = () => closeDialog(props.onConfirm);

  let pressedScrim = false;
  const onScrimDown = (e) => { pressedScrim = e.target === e.currentTarget; };
  const onScrimClick = (e) => {
    if (pressedScrim && e.target === e.currentTarget) cancel();
    pressedScrim = false;
  };

  return (
    <div class="scrim" ref={dialogIn} onPointerDown={onScrimDown} onClick={onScrimClick}>
      <div class="modal modal--confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <header class="modal__head">
          <h2 id="confirm-title">{props.title}</h2>
          <button class="btn btn--icon" aria-label="Cancel" onClick={cancel}><X size={18} /></button>
        </header>
        <div class="modal__body">
          <p class="confirm__message">{props.message}</p>
        </div>
        <footer class="modal__foot">
          <button class="btn btn--ghost" onClick={cancel} autofocus>Cancel</button>
          <button class="btn btn--danger-solid" onClick={confirm}>{props.confirmLabel}</button>
        </footer>
      </div>
    </div>
  );
}
