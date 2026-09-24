import { X } from "../lib/icons";

// Small confirmation dialog for destructive actions. Cancelling (button, X, or
// a genuine backdrop click) is always the safe default.
export default function ConfirmModal(props) {
  let pressedScrim = false;
  const onScrimDown = (e) => { pressedScrim = e.target === e.currentTarget; };
  const onScrimClick = (e) => {
    if (pressedScrim && e.target === e.currentTarget) props.onCancel();
    pressedScrim = false;
  };

  return (
    <div class="scrim" onPointerDown={onScrimDown} onClick={onScrimClick}>
      <div class="modal modal--confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <header class="modal__head">
          <h2 id="confirm-title">{props.title}</h2>
          <button class="btn btn--icon" aria-label="Cancel" onClick={props.onCancel}><X size={18} /></button>
        </header>
        <div class="modal__body">
          <p class="confirm__message">{props.message}</p>
        </div>
        <footer class="modal__foot">
          <button class="btn btn--ghost" onClick={props.onCancel} autofocus>Cancel</button>
          <button class="btn btn--danger-solid" onClick={props.onConfirm}>{props.confirmLabel}</button>
        </footer>
      </div>
    </div>
  );
}
