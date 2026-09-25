import { createSignal, createUniqueId, For, Show, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";
import { CaretDown, Check } from "../lib/icons";
import { popIn } from "../lib/motion";

// Custom dropdown (ARIA select-only combobox + listbox).
//   <Select value={v} options={[{ value, label }]} onChange={(v) => …}
//           label="Accessible name" placeholder="—" class="…" />
// Focus stays on the trigger; the active option is announced through
// aria-activedescendant. The list renders in a portal with fixed positioning,
// so it isn't clipped by dialogs, and flips above the trigger when needed.
export default function Select(props) {
  const id = createUniqueId();
  const [open, setOpen] = createSignal(false);
  const [active, setActive] = createSignal(-1);
  const [pos, setPos] = createSignal({ top: 0, left: 0, width: 0, ready: false });
  let trigger;
  let list;
  let typed = "";
  let typedTimer;

  const opts = () => props.options || [];
  const selectedIndex = () => opts().findIndex((o) => o.value === props.value);
  const selected = () => opts()[selectedIndex()];

  function place() {
    const r = trigger.getBoundingClientRect();
    const h = list?.offsetHeight || 0;
    const w = Math.max(list?.offsetWidth || 0, r.width);
    const vw = document.documentElement.clientWidth; // layout width, no scrollbar
    const vh = document.documentElement.clientHeight;
    const below = vh - r.bottom;
    const above = h > below - 8 && r.top > below;
    const left = Math.max(8, Math.min(r.left, vw - w - 8)); // keep on screen
    setPos({ left, width: r.width, top: above ? r.top - h - 4 : r.bottom + 4, above, ready: true });
  }

  function show() {
    if (open()) return;
    setActive(Math.max(0, selectedIndex()));
    setPos((p) => ({ ...p, ready: false })); // hidden until measured and placed
    setOpen(true);
    requestAnimationFrame(() => {
      place();
      list?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
      popIn(list, pos().above);
    });
    document.addEventListener("pointerdown", onOutside, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", hide);
  }

  function hide() {
    setOpen(false);
    document.removeEventListener("pointerdown", onOutside, true);
    window.removeEventListener("scroll", onScroll, true);
    window.removeEventListener("resize", hide);
  }
  onCleanup(hide);

  function choose(i) {
    const o = opts()[i];
    if (o && o.value !== props.value) props.onChange(o.value);
    hide();
    trigger.focus();
  }

  const onOutside = (e) => {
    if (!trigger.contains(e.target) && !list?.contains(e.target)) hide();
  };
  // Scrolling the page or a dialog closes the list; scrolling the list doesn't.
  const onScroll = (e) => { if (!list?.contains(e.target)) hide(); };

  // Type-ahead: jump to the next option starting with what was typed.
  function typeahead(ch) {
    clearTimeout(typedTimer);
    typed += ch.toLowerCase();
    typedTimer = setTimeout(() => { typed = ""; }, 600);
    const n = opts().length;
    const start = open() ? active() : selectedIndex();
    // A single key cycles to the next match; a typed word keeps the current one.
    const offset = typed.length > 1 ? 0 : 1;
    for (let k = 0; k < n; k++) {
      const i = (((start + offset + k) % n) + n) % n;
      if (String(opts()[i].label).toLowerCase().startsWith(typed)) {
        if (open()) setActive(i);
        else props.onChange(opts()[i].value);
        return;
      }
    }
  }

  function onKeyDown(e) {
    const n = opts().length;
    const move = (i) => {
      setActive(Math.max(0, Math.min(n - 1, i)));
      document.getElementById(`${id}-${active()}`)?.scrollIntoView({ block: "nearest" });
    };
    if (!open()) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); show(); }
      else if (e.key.length === 1 && /\S/.test(e.key)) { e.preventDefault(); typeahead(e.key); }
      return;
    }
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); move(active() + 1); break;
      case "ArrowUp": e.preventDefault(); move(active() - 1); break;
      case "Home": e.preventDefault(); move(0); break;
      case "End": e.preventDefault(); move(n - 1); break;
      case "Enter": case " ": e.preventDefault(); choose(active()); break;
      case "Escape": e.preventDefault(); e.stopPropagation(); hide(); break;
      case "Tab": hide(); break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) { e.preventDefault(); typeahead(e.key); }
    }
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        class={`select ${props.class || ""}`}
        classList={{ "select--open": open(), "select--empty": !selected() }}
        role="combobox"
        aria-label={props.label}
        aria-haspopup="listbox"
        aria-expanded={open()}
        aria-controls={`${id}-list`}
        aria-activedescendant={open() && active() >= 0 ? `${id}-${active()}` : undefined}
        onClick={() => (open() ? hide() : show())}
        onKeyDown={onKeyDown}
      >
        <span class="select__value">{selected()?.label ?? props.placeholder ?? "Select"}</span>
        <span class="select__caret"><CaretDown size={14} /></span>
      </button>

      <Show when={open()}>
        <Portal>
          <ul
            ref={list}
            id={`${id}-list`}
            class="select__list"
            role="listbox"
            aria-label={props.label}
            style={{
              top: `${pos().top}px`, left: `${pos().left}px`, "min-width": `${pos().width}px`,
              visibility: pos().ready ? "visible" : "hidden",
            }}
          >
            <For each={opts()}>
              {(o, i) => (
                <li
                  id={`${id}-${i()}`}
                  role="option"
                  class="select__option"
                  classList={{ "select__option--active": active() === i() }}
                  aria-selected={o.value === props.value}
                  onPointerMove={() => setActive(i())}
                  onClick={() => choose(i())}
                >
                  <span>{o.label}</span>
                  <Show when={o.value === props.value}><Check size={14} /></Show>
                </li>
              )}
            </For>
          </ul>
        </Portal>
      </Show>
    </>
  );
}
