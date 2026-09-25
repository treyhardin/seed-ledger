const base = "/api/seeds";

async function json(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
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
