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
Docker Engine on Linux). A prebuilt image for `amd64` and `arm64` (e.g. Raspberry Pi) is
published at `ghcr.io/treyhardin/seed-ledger`.

Save [`docker-compose.yml`](docker-compose.yml) into an empty folder, then run it from that folder:

```bash
curl -O https://raw.githubusercontent.com/treyhardin/seed-ledger/main/docker-compose.yml
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
docker compose pull
docker compose up -d
```

Your data lives in the `seed-ledger-data` Docker volume, so updates keep it.

## Deploy with Portainer

1. Go to **Stacks → Add stack** and name it `seed-ledger`.
2. Under **Build method**, pick **Web editor** and paste in the contents of
   [`docker-compose.yml`](docker-compose.yml).
   - Or pick **Repository** instead: set **Repository URL** to
     `https://github.com/treyhardin/seed-ledger`, **Repository reference** to
     `refs/heads/main`, and **Compose path** to `docker-compose.yml`.
3. Optional: under **Environment variables**, add `PORT` to use a port other than 3000.
4. Click **Deploy the stack**, then open `http://<your-server>:3000`.

**Update:** open the stack, click **Update the stack**, turn on **Re-pull image and
redeploy**, and confirm. For a Repository stack, use **Pull and redeploy**, or turn on
**GitOps updates** to redeploy automatically when the repo changes.

## Deploy with Dockhand

1. Go to **Stacks → Create**, set **Stack name** to `seed-ledger`, and paste in the
   contents of [`docker-compose.yml`](docker-compose.yml).
   - Or use **Stacks → From Git** instead: set **Repository URL** to
     `https://github.com/treyhardin/seed-ledger.git`, **Branch** to `main`, and
     **Compose file path** to `docker-compose.yml`. (The default is `compose.yaml`, so change it.)
2. Optional: add a `PORT` environment variable to use a port other than 3000.
3. Deploy, then open `http://<your-server>:3000`.

**Update:** use **Redeploy** on the stack with **Pull images** turned on. Git stacks can
also sync on a schedule (**Enable scheduled sync**) or on a webhook (**Enable webhook**).

## Your data

Everything is stored in one SQLite file, `garden.db`, inside the container at `/data`.
Portainer and Dockhand prefix the volume name with the stack name
(e.g. `seed-ledger_seed-ledger-data`). That's expected, and it survives updates.

**Back up** from the Docker host (the container is always named `seed-ledger`). Stop it
first so the copy is consistent:

```bash
docker stop seed-ledger
docker cp seed-ledger:/data/garden.db ./garden-backup.db
docker start seed-ledger
```

**Restore** a backup (or move data from another install):

```bash
docker stop seed-ledger
docker cp ./garden-backup.db seed-ledger:/data/garden.db
docker start seed-ledger
```

**Prefer a folder over a named volume?** Replace `seed-ledger-data:/data` with a host
path like `/opt/seed-ledger:/data`. The app runs as user `1000` inside the container, so
give that user ownership of the folder first: `sudo chown -R 1000:1000 /opt/seed-ledger`.

## Building the image yourself

To run your own changes, build locally with the same tag the compose file uses:

```bash
docker build -t ghcr.io/treyhardin/seed-ledger:latest .
docker compose up -d
```

(`docker compose pull` would replace it with the published image again.) Forks get their
own image automatically: the GitHub Actions workflow in `.github/workflows/docker.yml`
publishes to `ghcr.io/<your-user>/seed-ledger` on every push to `main`.

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
