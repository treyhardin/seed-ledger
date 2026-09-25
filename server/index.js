import express from "express";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import db, { DB_PATH } from "./db.js";

const app = express();
app.use(express.json({ limit: "10mb" })); // room for large backup imports

// `--dev`: API only on a fixed port (Vite serves the UI and proxies /api here).
// Otherwise: one process serves the built UI from dist/ plus the API on PORT.
const DEV = process.argv.includes("--dev");
const PORT = DEV ? 3001 : Number(process.env.PORT) || 3000;
const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");

// Fields a client is allowed to write.
const WRITABLE = [
  "name", "variety", "source", "sun", "depth_in", "spacing_in", "seeds_per_hole",
  "days_to_germ", "days_to_germ_max", "days_to_maturity",
  "soil_temp_min", "soil_temp_max", "start_method", "transplant_notes",
  "plant_weeks", "plant_weeks_max", "plant_direction", "plant_anchor",
  "plant2_weeks", "plant2_weeks_max", "plant2_direction", "plant2_anchor",
  "harvest_weeks", "harvest_direction", "harvest_anchor",
  "notes", "planted_date", "harvested_date",
];

const SETTING_KEYS = ["last_frost", "first_frost", "zone", "location", "onboarded"];

function pick(body) {
  const out = {};
  for (const key of WRITABLE) {
    if (key in body) out[key] = body[key] === "" ? null : body[key];
  }
  return out;
}

// GET all seeds
app.get("/api/seeds", (_req, res) => {
  const rows = db.prepare("SELECT * FROM seeds ORDER BY name COLLATE NOCASE").all();
  res.json(rows);
});

// CREATE a seed
app.post("/api/seeds", (req, res) => {
  const data = pick(req.body);
  if (!data.name) return res.status(400).json({ error: "A seed needs a name." });
  const cols = Object.keys(data);
  const stmt = db.prepare(
    `INSERT INTO seeds (${cols.join(", ")}) VALUES (${cols.map((c) => "@" + c).join(", ")})`
  );
  const info = stmt.run(data);
  res.status(201).json(db.prepare("SELECT * FROM seeds WHERE id = ?").get(info.lastInsertRowid));
});

// UPDATE a seed (partial)
app.patch("/api/seeds/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM seeds WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Seed not found." });
  const data = pick(req.body);
  const cols = Object.keys(data);
  if (cols.length) {
    db.prepare(`UPDATE seeds SET ${cols.map((c) => `${c} = @${c}`).join(", ")} WHERE id = @id`)
      .run({ ...data, id: req.params.id });
  }
  res.json(db.prepare("SELECT * FROM seeds WHERE id = ?").get(req.params.id));
});

// DELETE a seed
app.delete("/api/seeds/:id", (req, res) => {
  db.prepare("DELETE FROM seeds WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// GET settings (frost dates) as a flat object
app.get("/api/settings", (_req, res) => {
  const rows = db.prepare("SELECT key, value FROM settings").all();
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

// UPDATE settings (partial)
app.put("/api/settings", (req, res) => {
  const stmt = db.prepare(
    "INSERT INTO settings (key, value) VALUES (@key, @value) ON CONFLICT(key) DO UPDATE SET value = @value"
  );
  const del = db.prepare("DELETE FROM settings WHERE key = ?");
  for (const key of SETTING_KEYS) {
    if (!(key in req.body)) continue;
    const value = req.body[key];
    value == null || value === "" ? del.run(key) : stmt.run({ key, value: String(value) });
  }
  const rows = db.prepare("SELECT key, value FROM settings").all();
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

// EXPORT everything as a portable JSON backup (download).
const BACKUP_VERSION = 1;
app.get("/api/export", (_req, res) => {
  const settings = Object.fromEntries(
    db.prepare("SELECT key, value FROM settings").all().map((r) => [r.key, r.value])
  );
  const seeds = db.prepare("SELECT * FROM seeds ORDER BY id").all()
    .map(({ id, created_at, ...seed }) => seed);
  const now = new Date();
  const stamp = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((n) => String(n).padStart(2, "0")).join("-");
  res.setHeader("Content-Disposition", `attachment; filename="seed-ledger-${stamp}.json"`);
  res.json({ app: "seed-ledger", version: BACKUP_VERSION, exported_at: new Date().toISOString(), settings, seeds });
});

// IMPORT a backup: replaces all seeds and settings in one transaction.
app.post("/api/import", (req, res) => {
  const { app: appName, version, settings = {}, seeds } = req.body || {};
  if (appName !== "seed-ledger" || !Array.isArray(seeds)) {
    return res.status(400).json({ error: "That file isn't a Seed Ledger backup." });
  }
  if (version > BACKUP_VERSION) {
    return res.status(400).json({ error: "This backup is from a newer version of Seed Ledger. Update the app first." });
  }
  const rows = seeds.map(pick).filter((s) => s.name);
  db.transaction(() => {
    db.prepare("DELETE FROM seeds").run();
    db.prepare("DELETE FROM settings").run();
    db.prepare("DELETE FROM sqlite_sequence WHERE name = 'seeds'").run();
    const setStmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    for (const key of SETTING_KEYS) {
      if (key === "onboarded") continue; // always set below
      if (settings[key] != null && settings[key] !== "") setStmt.run(key, String(settings[key]));
    }
    setStmt.run("onboarded", "1"); // an imported garden is set up
    for (const row of rows) {
      const cols = Object.keys(row);
      db.prepare(`INSERT INTO seeds (${cols.join(", ")}) VALUES (${cols.map((c) => "@" + c).join(", ")})`).run(row);
    }
  })();
  res.json({ seeds: rows.length });
});

// RESET everything: all seeds and settings, back to a fresh install.
app.post("/api/reset", (_req, res) => {
  db.transaction(() => {
    db.prepare("DELETE FROM seeds").run();
    db.prepare("DELETE FROM settings").run();
    db.prepare("DELETE FROM sqlite_sequence WHERE name = 'seeds'").run();
  })();
  res.status(204).end();
});

// Serve the built SPA. Unknown non-API routes fall back to index.html.
if (!DEV) {
  if (!existsSync(join(DIST, "index.html"))) {
    console.warn("No dist/ build found — run `npm run build` first. Serving the API only.");
  }
  app.use(express.static(DIST));
  app.get(/^\/(?!api\/).*/, (_req, res, next) => {
    const index = join(DIST, "index.html");
    existsSync(index) ? res.sendFile(index) : next();
  });
}

const server = app.listen(PORT, () => {
  console.log(`Seed Ledger ${DEV ? "API" : "app"} on http://localhost:${PORT} · data: ${DB_PATH}`);
});

// Close the database cleanly when the dev server restarts or stops, so writes
// are flushed and no journal is left behind.
function shutdown() {
  server.close(() => {
    try { db.close(); } catch { /* already closed */ }
    process.exit(0);
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
