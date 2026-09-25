import { createSignal, createUniqueId, For, Show, onCleanup } from "solid-js";
import { popIn } from "../lib/motion";

// "+N more" badge. Hover (or tap, or Enter) opens a panel listing every seed;
// each is a button that opens that seed's detail. A disclosure: the badge is
// a button with aria-expanded controlling the panel.
export default function MoreSeeds(props) {
  const id = createUniqueId();
  const [open, setOpen] = createSignal(false);
  const [shift, setShift] = createSignal(0);
  let wrap;
  let panel;
  let closeTimer;
  let lastPointer = "";

  function show() {
    clearTimeout(closeTimer);
    if (open()) return;
    setShift(0);
    setOpen(true);
    requestAnimationFrame(() => {
      if (!panel) return;
      // Keep the panel on screen: nudge it left if it would overflow.
      const over = panel.getBoundingClientRect().right - (document.documentElement.clientWidth - 16);
      if (over > 0) setShift(-over);
      popIn(panel);
    });
    document.addEventListener("pointerdown", onOutside, true);
    document.addEventListener("keydown", onKey);
  }
  function hide() {
    clearTimeout(closeTimer);
    setOpen(false);
    document.removeEventListener("pointerdown", onOutside, true);
    document.removeEventListener("keydown", onKey);
  }
  onCleanup(hide);

  // Hover intent: a short grace period lets the pointer travel badge → panel.
  const hideSoon = () => { clearTimeout(closeTimer); closeTimer = setTimeout(hide, 180); };
  const onOutside = (e) => { if (!wrap.contains(e.target)) hide(); };
  const onKey = (e) => { if (e.key === "Escape") { hide(); wrap.querySelector(".more__badge")?.focus(); } };
  const isMouse = (e) => e.pointerType === "mouse";

  return (
    <span class="more" ref={wrap}
      onPointerEnter={(e) => isMouse(e) && show()}
      onPointerLeave={(e) => isMouse(e) && hideSoon()}>
      <button type="button" class="more__badge"
        aria-expanded={open()} aria-controls={`${id}-panel`}
        onPointerDown={(e) => { lastPointer = e.pointerType; }}
        onClick={(e) => {
          // A mouse already opened it on hover, so clicking keeps it open;
          // touch and keyboard (Enter/Space, detail 0) toggle.
          const viaMouse = e.detail > 0 && lastPointer === "mouse";
          if (viaMouse) show(); else if (open()) hide(); else show();
        }}>
        +{props.count} more
      </button>
      <Show when={open()}>
        <div ref={panel} id={`${id}-panel`} class="more__panel" style={{ left: `${shift()}px` }}>
          <p class="more__title">{props.title} <span>{props.seeds.length}</span></p>
          <ul class="more__list">
            <For each={props.seeds}>
              {(seed) => (
                <li>
                  <button type="button" class="more__item" onClick={() => { hide(); props.onOpen(seed); }}>
                    {seed.name}
                  </button>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
    </span>
  );
}
