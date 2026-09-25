---
name: Seed Ledger
description: The garden year set as Swiss typography: white ground, near-black ink, one leaf green for "now".
colors:
  accent: "#169b4c"
  accent-ink: "#0b7a3a"
  accent-soft: "#e6f4ea"
  bg: "#ffffff"
  surface: "#f5f5f3"
  surface-2: "#ececea"
  ink: "#111211"
  ink-2: "#545754"
  ink-3: "#6f726f"
  line: "#e7e7e4"
  line-strong: "#cfd0cc"
  on-ink: "#ffffff"
  danger: "#c4321f"
  on-danger: "#ffffff"
typography:
  now:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 0.9rem + 3.2vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.032em"
  stat:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.032em"
    fontFeature: "tnum"
  title:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.032em"
  headline:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.022em"
  body:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  control:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
  label:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
  caption:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    fontFeature: "tnum"
rounded:
  mark: "2px"
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "72px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.ink-2}"
  button-secondary:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.surface}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.sm}"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.danger}"
    rounded: "{rounded.sm}"
    height: "40px"
  button-danger-hover:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-danger}"
  fab:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.pill}"
    padding: "0 24px 0 16px"
    height: "48px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "40px"
  pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "26px"
  pill-growing:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-ink}"
  today-pill:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "2px 8px 2px 6px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  modal:
    backgroundColor: "{colors.bg}"
    rounded: "{rounded.lg}"
    width: "600px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.md}"
---

# Design System: Seed Ledger

## Overview

**Creative North Star: "The Swiss Almanac"**

The garden year set as Swiss typography. Hierarchy comes from size, weight and a strict label column, not from boxes or color. The page is a white sheet of near-black type with hairline rules; the only color on it means "now". It is built light-first for a phone read outdoors in sun, and follows the system into dark.

Home opens as a few lines of large type (Sow now / Next / Frost) keyed in a narrow label column, then The Almanac on the same column, then the seeds in the ground. Nothing competes with the data: no widgets, no card grid, no decorative surface texture. This replaces the retired drafting-sheet look entirely.

**Key Characteristics:**
- White ground, near-black ink, three greys, hairlines; one leaf green reserved for "now".
- One typeface (Schibsted Grotesk), tabular figures wherever numbers are data.
- A shared label column aligns the Now block and The Almanac.
- Surfaces separate by fill, never by border; the modal is the only elevated surface.
- Smooth GSAP motion: an orchestrated Home load-in (Almanac marks draw in row by row), animated dialogs and toasts.

## Colors

Achromatic by default; a single green carries the present tense. Tokens live on `:root` in `src/styles.css` and follow `--color-{name}`.

### Primary
- **Leaf Green** (`accent`): graphic marks for "now": sow windows open today, the planted-date point of a seed that is in the ground, the growing progress bar, the active-row dot beside a planted seed's name. 3.6:1 on white, so graphics only.
- **Leaf Green Ink** (`accent-ink`): green as text: the "Sow now" key, the Today pill text and dot, the growing pill.
- **Leaf Tint** (`accent-soft`): quiet fill behind green text (Today pill, growing pill) and text selection. (The input focus halo is a neutral hairline, not green.)

### Neutral
- **White** (`bg`): the page, the modal, secondary buttons and inputs.
- **Quiet Fill** (`surface`) / **Quiet Fill Hover** (`surface-2`): carousel cards, second-sow block, notices, toggle track, pills, hover on rows and buttons.
- **Ink** (`ink`): all primary text, primary buttons, the FAB, toasts, tooltips, the brand mark, the axis rule, harvest dots, and the focus ring.
- **Ink 2** (`ink-2`, 7.4:1): secondary text, labels, keys, and future (not-open) sow windows in The Almanac and its legend. **Ink 3** (`ink-3`, 4.9:1): tertiary text, meta, the grow run, frost datum lines, placeholders.
- **Hairline** (`line`): row and section rules, month gridlines. **Hairline Strong** (`line-strong`): control borders, progress track, underline color on Now seed names.

### Semantic
- **Danger** (`danger`): destructive actions only (delete, reset, the danger panel heading, setup errors).

### Color mode (light / dark)
Every color token is written once as `light-dark(light, dark)`, and `:root` sets `color-scheme: light dark`. **Settings → Color mode** offers Auto / Light / Dark (`src/lib/theme.js`):
- **Auto** follows the system.
- **Light and Dark** set `data-theme` on `<html>`, which pins `color-scheme`. Native controls follow it too.
- **Storage:** the choice is saved per device in localStorage, and applied by an inline script in `index.html` before first paint, so there's no flash.
- **Switching** cross-fades colors for about 320ms (`.theme-switching`), except under reduced motion.
- **Dark values:** bg `#0f100f`, surface `#1a1b1a` / `#242624`, ink `#f2f2ef` / `#b4b6b2` / `#8f928e`, line `#242624` / `#3a3c39`, accent `#3ccf73`, accent-ink `#5ddb8a`, accent-soft `#14281b`, danger `#f0715d`.
- Components never branch on theme. They only read tokens.

**The Now Rule.** Green means the present: open-today windows, planted seeds, Today, "Sow now". A future sow window is mid-grey (`ink-2`), so the green band is always the strongest mark on a row. If it isn't happening now, it isn't green.

**The One Accent Rule.** There is exactly one hue in the system. Danger red appears only on destructive controls; there is no category, status or decorative color.

**The Ink Focus Rule.** The focus ring is a 2px ink outline offset 2px, never the accent.

## Typography

**Font:** Schibsted Grotesk (Google Fonts, 400–800), falling back to `ui-sans-serif, system-ui`.

**Character:** a classic newspaper grotesk; firm at display size, plain at body size. All hierarchy is size and weight on one family.

### Hierarchy
- **Now** (400, fluid 1.75rem to 3.5rem, 1.08): the Sow now / Next / Frost lines. Subjects (seed names, frost label) are set at 700 inside a 400 line; meta ("until Oct 3", "in 3 weeks") drops to `ink-3`; a small 500 date rides at `control` size.
- **Stat** (600, 2.25rem, 1, tabular): the days count in growing progress.
- **Title** (600, 1.75rem, 1.15): modal headings.
- **Headline** (600, 1.5rem, -0.022em): section headings ("The Almanac", "In the ground", settings panels) and carousel card names.
- **Body** (400, 16px, 1.5): prose and setup copy; notes cap near 62ch.
- **Control** (500, 0.9375rem): buttons, inputs, counts.
- **Label** (500, 0.8125rem): Now keys, field labels, Almanac row names.
- **Caption** (500, 0.75rem, tabular): legend, month and year labels, detail labels, pills, tooltips.

**The Weight Contrast Rule.** In the Now block the sentence is 400 and the subject is 700. Emphasis is weight within one size, never color or a second size.

**The Tabular Rule.** Numbers that are data (dates, counts, months, years) use `font-variant-numeric: tabular-nums`.

**The One Family Rule.** No second typeface, no mono, no serif.

## Layout

A centered column, max 1200px, with a fluid gutter (`clamp(16px, 4vw, 48px)`). **The header shares that column** (`.topbar__inner` uses the same max-width and gutter as `.content`), so the logo and the page content start on one left edge and the gear ends on the same right edge. Fixed UI (the Add seed button, toasts) follows that right edge through `--edge-right`. Nothing puts a heavy rule above the page content. Spacing is an 8pt scale (`--space-1`…`--space-8`); home sections sit `--space-7` apart (`--space-6` on mobile).

- **Top bar:** sticky, white, hairline bottom; brand mark and name left, icon-only Settings right. No sidebar.
- **The label column:** `--label-col` is 168px on desktop and 96px at ≤720px. The Now keys and The Almanac's seed names both use it, so the two blocks share one left edge for their content.
- **Now block:** rows of `label-col | 1fr`, baseline-aligned, separated by hairlines; the first rule is ink.
- **Carousel:** horizontal scroll-snap of 280–340px columns.
- **Breakpoints:** ≤720px narrows the label column, stacks two-column forms and detail grids to one, and turns the modal into a bottom sheet. ≤420px hides the FAB label (52px round button) and shrinks month labels.

**The Shared Column Rule.** Anything keyed on the home page aligns to `--label-col`. Don't introduce a second label width.

## Elevation & Depth

Flat. Regions separate by hairline rules or a quiet fill; depth is reserved for things that float above the page.

### Shadow Vocabulary
- **Modal** (`--shadow-modal`): the seed modal, confirm dialog and setup; the one elevated surface, over a 32% ink scrim.
- **Float** (`--shadow-float`): the FAB and toasts, which float over content by position.
- **Raised** (`--shadow-raised`): the selected option in a toggle group only.

**The One Surface Rule.** The modal is the only elevated surface. Cards, panels and sections never take a shadow.

## Shapes

Soft, consistent corners on a small scale: 8px (`sm`) for controls, the brand mark and list options; 12px (`md`) for toasts, notices and the second-sow block; 18px (`lg`) for carousel cards and the modal (top corners only as a bottom sheet); pill for the FAB, status pills and the Today pill. Almanac marks are 10px rounded bars, 10px round dots (harvest), and 10px squares with 2px corners (single-week sow).

**The No-Box Rule.** Regions have no borders. A group is a fill (carousel card, second-sow block) or sits between hairline rules. Borders belong to controls (buttons, inputs) only.

## Components

### Buttons
- **Shape:** 40px tall, 8px corners, 1px `line-strong` border, `control` type.
- **Primary:** ink fill, white text; hover steps to `ink-2`. "Mark harvested" uses the same treatment.
- **Secondary:** white with a hairline border; hover to `surface`.
- **Ghost / Icon:** borderless, `ink-2`; hover to `surface` and `ink`. Icon buttons are 40px square (28px `xs`).
- **Danger:** red text on a neutral border, fills red on hover; solid red only inside a confirm dialog.
- **Press:** `scale(0.97)` on `:active`, fast ease-out.

### Floating Add button
Ink pill, 48px, bottom-right, float shadow; lifts 2px on hover. Icon-only circle at ≤420px.

### Inputs
White, 1px `line-strong`, 8px corners, 40px min height. Hover darkens the border to `ink-3`; focus sets an ink border with a 3px `accent-soft` halo. Segmented choices use a toggle group: a `surface` track with a white, raised selected option.

### Pills
Caption-size pills on `surface` with a leading 6px dot in `currentColor`. Growing pills are green on `accent-soft`; library pills use a hollow dot.

### Carousel cards (In the ground)
`surface` fill, 18px corners, 24px padding, no border or shadow. Headline name (underlines on hover), variety, source, sun tag, growing progress (stat count + 4px green bar), and the harvest action at the foot.

### Modal
White, 18px corners, max 600px (confirm 440px), modal shadow over scrim. Head / scrolling body / hairline-topped foot. On ≤720px it becomes a full-width bottom sheet rising from below. Destructive actions confirm here, in-app.

### Toasts and tooltips
Toasts: ink, 12px corners, top-right, with an underlined Undo. Tooltips: CSS-only ink labels from `data-tip`, revealed on hover and focus. Native `title` and `confirm()` are unreliable in the host webview and are not the pattern.

### The Almanac (signature)
A rolling 12 months starting at the current month.
- **Bands, top to bottom:** a year band (ink year labels, a 1px ink divider where the year turns), a month axis (caption labels, ink ticks, ink baseline rule), then a Today band holding only the green Today pill.
- **Rows:** one per seed, every seed listed. Planted seeds first (soonest harvest), then by soonest sow, then untimed seeds reading "No sow timing" in `ink-3`. Each row has a label-column name and a track with faint month gridlines; the whole row is one click target and fills `surface` on hover.
- **Marks:** sow window as a 10px rounded `ink-2` bar (green when open today) → 2px `ink-3` grow run → 10px round ink harvest dot with a white halo. A single-week window is a 10px square (2px corners), so it never reads as the round harvest dot. A planted seed plots its real sow date as a green point, then its run to expected harvest. Windows that wrap past the edge are clipped there.
- **Frost:** the two average frost dates as dashed `ink-3` hairlines through all rows.
- **Motion:** on load, sow bars and runs grow from the left and harvest dots pop in after, staggered row by row (GSAP, see Motion).

**The No Today Line Rule.** Today is marked by the pill in its own band only. There is no full-height today line through the rows (explicitly removed at Trey's request).

### Motion (system-wide)
All motion is **GSAP**, defined in one module: `src/lib/motion.js`. Content is visible by default. Animations only run *from* a hidden state, and none run under `prefers-reduced-motion: reduce`. Default ease is `power3.out`. Entrances ease out and exits ease in.
- **Home load-in** (one orchestrated timeline, `revealHome`):
  1. the Now lines rise in with a stagger
  2. the Almanac axis draws left to right
  3. year, month and Today labels settle
  4. rows fade up
  5. sow bars and runs grow from the left (`expo.out`)
  6. harvest dots pop (`back.out`)
  7. frost lines fade in
  8. the In the ground carousel settles
- **Other views:** sections stagger up (`revealView`).
- **Dialogs:** the backdrop fades and the panel lifts in (a bottom sheet on phones). On close, the panel eases out before it unmounts (`dialogIn` / `closeDialog`).
- **Toasts:** slide in, time themselves out, and slide out before removal.
- **Reveals:** the harvest-date prompt, second sow time, search results and setup result ease in (`appear`, `appearChildren`). The progress bar fills from zero.
- **Settings gear:** turns a quarter each time it's toggled.
- **CSS for simple states:** 140ms color changes, and button press scale.

### Icons
Phosphor, regular weight only, inlined from the official SVGs in `src/lib/icons.jsx` (`currentColor`, no dependency). The brand mark is the Phosphor plant in a 32px ink square.


### "+N more" (MoreSeeds)
"Sow now" shows at most **3** seed names inline (`READY_CAP` in `Home.jsx`), then a **"+N more"** pill badge in `accent-soft` / `accent-ink`. The badge fills with `accent-ink` on hover or while open.
- **The panel** lists every ready seed as a button that opens its detail. It's a `bg` panel with a `line` border, `radius-md` corners and `shadow-float`, max 320px tall with its own scroll, and it opens with GSAP `popIn`.
- **Mouse** opens it on hover. A 180ms grace period plus an invisible bridge let the pointer cross into the panel, and a click keeps it open.
- **Touch and keyboard** toggle it (Enter/Space). Escape closes it and returns focus to the badge. Clicking outside also closes it.
- **The pattern** is a disclosure: a button with `aria-expanded` controlling the panel.
- **Placement:** the panel is nudged left to stay 16px inside the layout width.
- **Seed names in the Now lines** are inline `role="button"` text rather than `<button>`s. Long names wrap mid-name, and a trailing comma never starts a line.

### Select (custom dropdown)
`src/components/Select.jsx` is used for every choice list: months, before/after, last/first frost. There are no native `<select>`s.
- **Trigger:** matches `.field__input` in height, border, radius and ink focus ring. The value is left-aligned with a caret that rotates when open, and the placeholder is `ink-3`.
- **List:** a `bg` panel with a `line` border, `radius-md` corners and `shadow-float`, max 288px tall with its own scroll. Options are 36px rows: the active row gets a `surface` fill, and the selected row is 600 weight with a Phosphor check.
- **Behavior:** it's an ARIA select-only combobox. Focus stays on the trigger and the active option is announced through `aria-activedescendant`.
  - **Keys:** ↑↓, Home/End, Enter/Space, Escape and Tab.
  - **Type-ahead:** works open or closed.
  - **Closing:** outside click, scrolling, or resizing closes it.
- **Placement:** the list renders in a portal with fixed positioning, so dialogs never clip it. It flips above the trigger when there's no room below. It opens with GSAP `popIn` (top-anchored, or bottom-anchored when flipped).
- **Number inputs** hide native spinner arrows so the fields sit cleanly beside a Select.
## Do's and Don'ts

### Do:
- **Do** build every value from a `--{category}-{name}` token on `:root`; rules reference tokens, not raw values.
- **Do** keep green for "now" only (open-today windows, planted seeds, Today, "Sow now"); future windows are mid-grey `ink-2`.
- **Do** keep sow marks square-ish (bars, 2px-cornered squares) and harvest marks round, so the two never read alike.
- **Do** carry hierarchy with size and weight in Schibsted Grotesk; use 400 body / 700 subject contrast for typeset lines.
- **Do** align keyed content to `--label-col`.
- **Do** group with fill or hairlines, and keep the modal as the only elevated surface.
- **Do** use CSS `.tip` tooltips and the in-app confirm modal instead of native `title` / `confirm()`.
- **Do** make every new motion respect `prefers-reduced-motion`.

### Don't:
- **Don't** put eyebrow or kicker labels above headings.
- **Don't** build card dashboards or rows of stat widgets; the Now block is type.
- **Don't** add a second typeface or any accent color beyond the one green (danger red is for destructive actions only).
- **Don't** draw a full-height today line in The Almanac.
- **Don't** put borders around regions or shadows on cards and panels.
- **Don't** reintroduce the drafting look: vellum/cream grounds, grid-paper backgrounds, 0px corners, mono labels, title blocks, surveyor red.
- **Don't** use icons outside Phosphor regular, or hand-drawn glyphs.
