import { IS_DEMO, demoSeeds, DEMO_SETTINGS } from "./demo";

const base = "/api/seeds";

async function json(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

const serverApi = {
  list: () => fetch(base).then(json),
  getSettings: () => fetch("/api/settings").then(json),
  updateSettings: (data) =>
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(json),
  create: (data) =>
    fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(json),
  update: (id, data) =>
    fetch(`${base}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(json),
  remove: (id) => fetch(`${base}/${id}`, { method: "DELETE" }).then(json),
  importData: (data) =>
    fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(json),
  reset: () => fetch("/api/reset", { method: "POST" }).then(json),
};

// Demo mode: everything lives in memory; seeds are read-only, frost dates can
// change for the visit. Nothing touches a server.
const demoStore = { seeds: IS_DEMO ? demoSeeds() : [], settings: { ...DEMO_SETTINGS } };
const readOnly = () => Promise.reject(new Error("Seeds can't be changed in the demo."));
const demoApi = {
  list: () => Promise.resolve(demoStore.seeds.map((s) => ({ ...s }))),
  getSettings: () => Promise.resolve({ ...demoStore.settings }),
  updateSettings: (data) => {
    for (const key of ["last_frost", "first_frost"]) if (data[key]) demoStore.settings[key] = data[key];
    return Promise.resolve({ ...demoStore.settings });
  },
  create: readOnly, update: readOnly, remove: readOnly, importData: readOnly, reset: readOnly,
};

export const api = IS_DEMO ? demoApi : serverApi;
