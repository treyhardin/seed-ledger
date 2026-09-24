import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Where garden.db lives. Defaults to the project root; set DATA_DIR to keep it
// elsewhere (e.g. a Docker volume).
const DATA_DIR = resolve(process.env.DATA_DIR || join(__dirname, ".."));
mkdirSync(DATA_DIR, { recursive: true });
export const DB_PATH = join(DATA_DIR, "garden.db");
const db = new Database(DB_PATH);
// Keep everything in the single garden.db file: switching from any prior WAL
// mode checkpoints the write-ahead log into the main file and removes the
// -wal/-shm sidecars, so the data can't be stranded outside garden.db.
db.pragma("journal_mode = DELETE");
db.pragma("synchronous = FULL");

db.exec(`
  CREATE TABLE IF NOT EXISTS seeds (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    name              TEXT NOT NULL,
    variety           TEXT,            -- optional cultivar / variety
    source            TEXT,            -- seed company / brand
    sun               TEXT,            -- full | partial | shade
    depth_in          REAL,            -- planting depth, inches
    spacing_in        REAL,            -- plant spacing, inches
    days_to_germ      INTEGER,
    days_to_maturity  INTEGER,
    plant_weeks       INTEGER,         -- weeks offset from the anchor
    plant_direction   TEXT,            -- before | after
    plant_anchor      TEXT,            -- last_frost | first_frost
    harvest_weeks     INTEGER,         -- optional; falls back to days_to_maturity
    harvest_direction TEXT,            -- before | after
    harvest_anchor    TEXT,            -- last_frost | first_frost
    notes             TEXT,
    planted_date      TEXT,            -- 'YYYY-MM-DD' or NULL
    harvested_date    TEXT,            -- 'YYYY-MM-DD' or NULL
    created_at        TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Migration: add columns that post-date the original schema to existing tables.
// Ranges reuse the original column as the lower bound (plant_weeks, days_to_germ)
// and add a *_max column for the upper bound.
const ADDED_COLUMNS = {
  variety: "TEXT",               // optional cultivar / variety
  seeds_per_hole: "INTEGER",
  days_to_germ_max: "INTEGER",   // germination range: days_to_germ – days_to_germ_max
  soil_temp_min: "INTEGER",      // recommended soil temp, °F
  soil_temp_max: "INTEGER",
  start_method: "TEXT",          // indoors | direct
  transplant_notes: "TEXT",      // for indoor-started seeds
  plant_weeks_max: "INTEGER",    // sow range: plant_weeks – plant_weeks_max
  plant2_weeks: "INTEGER",       // optional second sow time (e.g. spring + fall)
  plant2_weeks_max: "INTEGER",
  plant2_direction: "TEXT",
  plant2_anchor: "TEXT",
};
const seedCols = db.prepare("PRAGMA table_info(seeds)").all().map((c) => c.name);
for (const [col, type] of Object.entries(ADDED_COLUMNS)) {
  if (!seedCols.includes(col)) db.exec(`ALTER TABLE seeds ADD COLUMN ${col} ${type}`);
}

// Frost dates start empty; first-run setup (or Settings) fills them in.
// Installs from before setup existed already have dates, so mark them onboarded.
const setting = (key) => db.prepare("SELECT value FROM settings WHERE key = ?").get(key)?.value;
if (!setting("onboarded") && setting("last_frost") && setting("first_frost")) {
  db.prepare("INSERT INTO settings (key, value) VALUES ('onboarded', '1')").run();
}
db.prepare("DELETE FROM settings WHERE key = 'seeded'").run(); // retired flag

export default db;
