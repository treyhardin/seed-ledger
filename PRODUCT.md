# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Home gardeners who self-host their own copy: one person, one garden. They know their plants
and want a dependable reference, not a farm-management suite. They plan and log at a desk or
laptop, and check "what should I be doing now?" from a phone in or near the garden.

## Product Purpose

Seed Ledger keeps a gardener's seed-packet knowledge and tells them when to act on it. They log
each seed's packet details, track it from library → planted → harvested (and back to the library
for the next round), and see the whole growing year on one timeline. Success: at any moment the
gardener knows what to sow or harvest next, and never loses packet details between seasons.

## Positioning

Timing is **frost-relative, not calendar-fixed**. Every sow window is entered as "N weeks
before/after last/first frost" (optionally a range, and up to two per seed, e.g. spring + fall),
and computed against the gardener's own average frost dates. First-run setup estimates those
dates and a hardiness zone from ~30 years of local weather, worldwide. The signature surface is
**The Almanac**: a rolling 12-month timeline, starting at the current month, that plots each
seed's sow window → growing run → harvest against the frost dates and today.

## Operating Context

- Self-hosted (Docker, Portainer, Dockhand, or plain Node) on a home server or laptop, usually
  reached over a private network; no accounts or login.
- Used on desktop for planning and data entry, and on a phone for quick checks.
- Frost dates anchor all timing; they're set during first-run setup (location lookup, manual
  entry, or skip) and editable in Settings.

## Capabilities and Constraints

- **Home:** frost countdown, next-sow countdown, "Ready to sow" (seeds whose window is open
  today), The Almanac (lists every seed; click to open), and an "In the Ground" carousel with
  "Mark harvested" (with a date).
- **Seed detail modal:** the one place seeds are viewed and edited; view mode (status, start
  method, sun, specs, sow→harvest windows, transplant notes, notes, Mark planted / harvested,
  Edit, Delete) and edit mode; also used to add a seed (floating "Add seed" button).
- **Seed fields:** name, variety, source, sun (multi: full/partial/shade), depth, spacing, seeds
  per hole, days to germinate (range), days to maturity, soil temperature (°F range), start method
  (direct sow / start indoors + transplant notes), one or two frost-relative sow windows (ranges),
  optional frost-relative harvest, notes, planted and last-harvested dates.
- **Settings:** location + zone, frost dates, location lookup, Backup & transfer (download /
  import JSON), Reset app data (confirmed).
- **Top bar:** logo (home) at left, icon-only Settings at right. No sidebar, no separate seed list.
- **Feedback:** top-right toasts with Undo for plant/harvest/delete; destructive actions confirm
  in-app (native `confirm()`/`title` tooltips are unreliable in some webviews).
- **Stack (fixed):** Solid.js + Vite SPA, vanilla CSS with custom-property tokens, Express +
  better-sqlite3 API over a single `garden.db`. Icons are Phosphor (regular), inlined from the
  official SVGs; no icon dependency.

## Brand Commitments

- Name: **Seed Ledger**. Logo: the Phosphor "plant" glyph in a square mark.
- Vanilla CSS custom-property tokens; Solid.js patterns; Phosphor icons only.
- No personal or location-specific content in the product; it serves any gardener, anywhere.

## Evidence on Hand

- No testimonials, users, press, or brand assets beyond the name and mark. Do not fabricate any.
- Weather data credit: Open-Meteo (CC BY 4.0); place names: BigDataCloud.

## Product Principles

1. **Time is the organizing axis.** Frost-relative timing and the year view are the backbone;
   everything else answers "what now, what's next."
2. **Never lose packet knowledge.** Durable, legible reference data across seasons.
3. **Calm operating tool.** Fast to scan and edit on desktop and phone; nothing competes with
   the data.
4. **Yours, on your hardware.** Self-hosted, portable data, no accounts, minimal outside calls.
5. **Dependency-light craft.** Vanilla CSS, inlined icons, no frameworks added without reason.
