# Design — Seed Ledger

<!-- impeccable:design-schema 1 -->

**Direction: "The Planting Plan."** Seed Ledger is drawn as a landscape architect's working
drawing. A season is a *measured* thing; the app refuses cards-on-neutral dashboards and the
warm-cream-paper "field almanac" nostalgia it used to wear. Mode: **Operate** (calm, precise,
scannable). Seed roll `57474f15`, direction #6 of 7 grounded worlds.

## Ground & light

Light-primary — a working drawing read at a desk in daylight. Dark mode is a **blueprint
negative** (navy ground, pale ink), via `prefers-color-scheme`. Flat and ruled: **no shadows**
(except the one modal, which genuinely elevates), **0px corners everywhere**, hairline rules,
and a faint non-repro-blue construction grid on the body.

## Color (Restrained: vellum ground + graphite ink + one surveyor-red accent)

Tokens live on `:root` in `src/styles.css`; dark mode remaps them under `@media (prefers-color-scheme: dark)`.

- Ground: `--paper #e6eae2` (vellum), `--paper-card #f1f4ee` (drawn surface), `--paper-sunk #dbe0d8`, `--paper-rail #eaeee7`.
- Graphite ink: `--ink #212a24` (never pure black), `--ink-soft #545d55`, `--ink-faint #6b746d` (all AA on vellum).
- Rules: `--line #bcc6bd`, `--line-soft #d0d7cf`.
- Non-repro blue (datums, frost, drafting labels): `--blue #476884` (AA as label text), `--blue-soft #aebfcd`.
- Ink-green (primary fill, nav-active is ink, sow marks, growing): `--sprout #2f3d33`, `--sprout-2 #5c6a5f` (grow run).
- **Single accent — surveyor red:** `--sun #b23f2f` (harvest ◇, focus rings, key active), `--berry #a5362a` (today datum). Red is reserved for now/active/harvest; never decorative.

## Type

- `--display` / `--ui`: **Archivo** (engineered grotesque). Headings 600–700, tight tracking (-0.012em). Wordmark 700.
- `--mono`: **Spline Sans Mono** — used for *measurement*: dimensions, dates, specs, the title block, all small uppercase drafting labels (0.54–0.66rem, +letter-spacing). This is data/measurement mono, not costume.
- Body 16px/1.5.

## The drafting grammar (signature)

- **Title block** (`.titleblock`): a ruled box of PROJECT / ZONE / SCALE / DATE, top-right of the almanac. Echoed by the sidebar's `Drawing index` + sheet codes (A-01…A-03) and the footer notes.
- **The Almanac** (`components/Almanac.jsx`): the year as a **dimensioned timeline**. A month axis with tick-stations along a datum rule; each seed a run of **sow (filled square ▪) → dashed growing run → harvest (red diamond �diamond)**; the two frost dates as **dashed blue datum lines with flags**; **today** as a solid red datum with a filled flag tag. Marks/datums live in a `.almanac__lines` overlay offset by `--almanac-label` so they register exactly with the axis.
- **Spec callouts** (`.card`): flat bordered panels — name, a bordered spec cell (`.specs`), sow/harvest as ruled dimension notes (`.windows`), a status tag whose ▪/◇ marker matches the almanac.
- **Plant schedule** (`.seeds-table`): a read-only ruled schedule; mono uppercase headers, seed name pinned left + status tag beneath, sun as a symbol with a CSS tooltip, delete pinned right.
- **Detail sheet** (`components/SeedModal.jsx`): the seed as a drawing detail — ruled spec table, dimension notes, notes; edit mode is the same form; reused for "Log a seed packet."
- **Controls**: `.btn` square 1.5px-ruled; primary = ink-green fill; harvest = red fill; inputs focus to a crisp 1px red (redline) ring. Icons are inlined Phosphor + authored SVG (sun-amount, stations) in one weight — no emoji.

## Motion

Minimal and precise: a single modal `pop` and `fade`, plus quiet hover/focus color shifts. No bouncing, no scattered effects. `prefers-reduced-motion` neutralizes transitions.

## Do / Don't

- Keep 0px corners, hairline rules, and the flat (shadowless) surfaces. Reserve red for today/active/harvest.
- Use mono only for data/measurement (dates, dimensions, specs, labels); keep prose in Archivo.
- Don't reintroduce cream/kraft grounds, serif display, category color-coding, rounded cards, or drop shadows on panels.
- The construction-grid body background is intentional (a blueprint/measurement surface) — the design detector's advisory about grid backgrounds is knowingly accepted here.
