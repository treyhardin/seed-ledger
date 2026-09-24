# Seed Ledger

A small, self-hosted garden planner. Log your seed packets, see when to sow each one
relative to your frost dates, track what's in the ground, and view the whole growing year
on one timeline.

- **Seed library:** depth, spacing, seeds per hole, days to germinate and maturity, soil
  temperature, sun needs, direct sow vs. start indoors (with transplant notes), and free-form notes.
- **Frost-relative timing:** sow windows are entered as "1–2 weeks before last frost", not
  fixed dates. A seed can have two sow times (e.g. spring and fall). Change your frost dates
  in Settings and every date updates.
- **Home:** countdowns to the next frost and your next sowing, a "Ready to sow" list of seeds
  whose window is open today, the Almanac timeline, and what's currently in the ground.
- **Tracking:** mark a seed planted, then mark it harvested (with a date) to put it back in
  your library for next time.

It's a single-user app with a single SQLite file for storage. **There are no accounts or
logins**, so run it somewhere private (see [Security](#security)).

## Quick start (Docker)

You need [Docker](https://docs.docker.com/get-docker/) (Docker Desktop on macOS/Windows,
Docker Engine on Linux).

```bash
git clone https://github.com/treyhardin/seed-ledger.git
cd seed-ledger
docker compose up -d
```

Open **http://localhost:3000**, go to **Settings**, and set your average last and first frost dates.

The container restarts automatically after crashes and reboots (`restart: unless-stopped`).
On macOS and Windows, turn on "Start Docker Desktop when you sign in" so it comes back
after a reboot.

**Change the port:** create a `.env` file next to `docker-compose.yml` with `PORT=8080`
(or any free port), then run `docker compose up -d` again.

**Update to a new version:**

```bash
git pull
docker compose up -d --build
```

Your data lives in the `seed-ledger-data` Docker volume, so rebuilds and updates keep it.

## Your data

Everything is stored in one SQLite file, `garden.db`.

**Back up** (Docker):

```bash
docker compose stop
docker compose cp seed-ledger:/data/garden.db ./garden-backup.db
docker compose start
```

**Restore** a backup (or move data from another install):

```bash
docker compose stop
docker compose cp ./garden-backup.db seed-ledger:/data/garden.db
docker compose start
```

## Running without Docker

Requires **Node.js 22.9+**.

```bash
npm install
npm run build
npm start
```

The app runs on **http://localhost:3000**, and `garden.db` is created in the project folder.
To change either, copy `.env.example` to `.env` and set `PORT` and/or `DATA_DIR`.

`npm start` runs in the foreground. For an always-on setup, use Docker.

## Development

```bash
npm install
npm run dev
```

This starts the Vite dev server on **http://localhost:5173** with hot reload, plus the API
on port 3001, which Vite proxies under `/api`. The dev server uses the same `garden.db`
as `npm start`.

**Stack:** [Solid](https://www.solidjs.com/) + [Vite](https://vite.dev/) front end, and an
[Express](https://expressjs.com/) + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
API. Styling is plain CSS with custom properties. The visual design is documented in [DESIGN.md](DESIGN.md).

```
server/        Express API and database setup (schema + migrations in db.js)
src/           Solid app (components/, lib/garden.js for the date and timing logic)
```

## Security

Seed Ledger has **no authentication**. Anyone who can reach the port can view and edit your
data. Keep it on your home network, or put it behind something that handles access for you:

- **[Tailscale](https://tailscale.com/)**: only your own devices can reach it, with nothing exposed publicly.
- **[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) +
  [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/)**:
  a normal URL that requires signing in with your email.

Don't expose it directly to the internet.

## License

[MIT](LICENSE)
