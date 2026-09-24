import { For } from "solid-js";
import { Plant, House, Table, Gear } from "../lib/icons";

const NAV = [
  { id: "home", label: "Home", icon: House },
  { id: "seeds", label: "Seeds", icon: Table },
  { id: "settings", label: "Settings", icon: Gear },
];

export default function Sidebar(props) {
  return (
    <aside class="sidebar">
      <div class="sidebar__brand">
        <span class="mark"><Plant size={19} /></span>
        <h1>Seed Ledger</h1>
      </div>

      <nav class="sidebar__nav" aria-label="Views">
        <For each={NAV}>
          {(item) => (
            <button
              class="navitem"
              classList={{ "navitem--active": props.view === item.id }}
              aria-current={props.view === item.id ? "page" : undefined}
              onClick={() => props.onNav(item.id)}
            >
              <item.icon size={17} />
              <span class="navitem__label">{item.label}</span>
            </button>
          )}
        </For>
      </nav>
    </aside>
  );
}
