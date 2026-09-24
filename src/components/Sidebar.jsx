import { For } from "solid-js";
import { Plant, House, Table, Gear } from "../lib/icons";

const NAV = [
  { id: "home", label: "Home", icon: House },
  { id: "seeds", label: "Seeds", icon: Table },
];
// Pinned to the bottom of the sidebar.
const FOOT_NAV = [{ id: "settings", label: "Settings", icon: Gear }];

export default function Sidebar(props) {
  const NavItems = (items) => (
    <For each={items}>
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
  );

  return (
    <aside class="sidebar">
      <div class="sidebar__brand">
        <span class="mark"><Plant size={19} /></span>
        <h1>Seed Ledger</h1>
      </div>

      <nav class="sidebar__nav" aria-label="Views">{NavItems(NAV)}</nav>
      <nav class="sidebar__nav sidebar__nav--foot" aria-label="App">{NavItems(FOOT_NAV)}</nav>
    </aside>
  );
}
