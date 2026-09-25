// Color mode: "auto" (follow the system), "light" or "dark". Stored per device
// in localStorage; index.html applies it before first paint so there's no flash.

const KEY = "seed-ledger:color-mode";
export const COLOR_MODES = { auto: "Auto", light: "Light", dark: "Dark" };

export function getColorMode() {
  try {
    const v = localStorage.getItem(KEY);
    return v in COLOR_MODES ? v : "auto";
  } catch {
    return "auto";
  }
}

export function setColorMode(mode) {
  try {
    if (mode === "auto") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, mode);
  } catch { /* storage unavailable: still apply for this visit */ }

  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    root.classList.add("theme-switching");
    setTimeout(() => root.classList.remove("theme-switching"), 400);
  }
  if (mode === "auto") delete root.dataset.theme;
  else root.dataset.theme = mode;
}
