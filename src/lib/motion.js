// All motion in one place (GSAP). Content is visible by default: animations
// only ever animate *from* a hidden state, and nothing runs when the visitor
// prefers reduced motion.
import { gsap } from "gsap";

gsap.defaults({ ease: "power3.out", duration: 0.6 });

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const narrow = () => window.matchMedia("(max-width: 720px)").matches;

// --- Page load-ins ---

// Home: the "now" lines rise in, the Almanac axis draws, rows fade up, the
// marks grow left to right and harvest dots pop, then the carousel settles.
export function revealHome(root) {
  if (reduced() || !root) return;
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline();
  tl.from(q(".now__row"), { opacity: 0, y: 18, duration: 0.8, stagger: 0.08 })
    .from(q(".almanac__head"), { opacity: 0, y: 10, duration: 0.6 }, "-=0.55")
    .from(q(".almanac__track--scale"), { scaleX: 0, transformOrigin: "left center", duration: 0.9, ease: "power2.inOut" }, "<")
    .from(q(".yearseg, .month, .dflag"), { opacity: 0, y: 4, duration: 0.4, stagger: 0.025 }, "-=0.6")
    .from(q(".almanac__row"), { opacity: 0, duration: 0.45, stagger: 0.03 }, "-=0.5")
    .from(q(".almanac__row .sowband, .almanac__row .run"), {
      scaleX: 0, transformOrigin: "left center", duration: 0.8, ease: "expo.out", stagger: 0.02,
    }, "<0.1")
    .from(q(".almanac__row .station"), { scale: 0, duration: 0.4, ease: "back.out(2.2)", stagger: 0.02 }, "<0.35")
    .from(q(".datum"), { opacity: 0, duration: 0.6 }, "<")
    .from(q(".shelf"), { opacity: 0, y: 14, duration: 0.6 }, "-=0.7")
    .from(q(".card"), { opacity: 0, y: 16, duration: 0.6, stagger: 0.07 }, "<0.1");
  return tl;
}

// Any other view: its sections stagger up.
export function revealView(root, selector = ":scope > *") {
  if (reduced() || !root) return;
  gsap.from(root.querySelectorAll(selector), { opacity: 0, y: 16, duration: 0.6, stagger: 0.07 });
}

// Use as a ref: `ref={appear()}`. Eases an element in when it mounts,
// e.g. the harvest-date prompt, the second sow time, search results.
export const appear = (vars = {}) => (el) => {
  if (reduced()) return;
  gsap.from(el, { opacity: 0, y: 6, duration: 0.45, ...vars });
};

// Use as a ref on a list: its children stagger in.
export const appearChildren = (vars = {}) => (el) => {
  if (reduced()) return;
  requestAnimationFrame(() =>
    gsap.from(el.children, { opacity: 0, y: 8, duration: 0.4, stagger: 0.04, ...vars })
  );
};

// Progress bar fill grows from zero.
export const fill = () => (el) => {
  if (reduced()) return;
  gsap.from(el, { scaleX: 0, transformOrigin: "left center", duration: 1.1, ease: "expo.out", delay: 0.2 });
};

// --- Dialogs ---

// Use as a ref on the `.scrim`: fades the backdrop and lifts the panel in
// (a bottom sheet slides up on phones).
export function dialogIn(scrim) {
  if (reduced()) return;
  const panel = scrim.querySelector(".modal");
  gsap.from(scrim, { opacity: 0, duration: 0.3, ease: "power1.out" });
  gsap.from(panel, narrow()
    ? { y: 80, opacity: 0, duration: 0.55, ease: "expo.out" }
    : { y: 18, scale: 0.97, opacity: 0, duration: 0.5, ease: "expo.out" });
}

// Animate the top-most dialog out, then run `update` (which removes it).
// Resolves immediately when no dialog is open.
export function closeDialog(update = () => {}) {
  const scrims = document.querySelectorAll(".scrim");
  const scrim = scrims[scrims.length - 1];
  if (!scrim || reduced()) {
    return Promise.resolve(update());
  }
  const panel = scrim.querySelector(".modal");
  return new Promise((resolve) => {
    gsap.timeline({ onComplete: () => resolve(update()) })
      .to(panel, narrow()
        ? { y: 60, opacity: 0, duration: 0.28, ease: "power2.in" }
        : { y: 10, scale: 0.98, opacity: 0, duration: 0.22, ease: "power2.in" })
      .to(scrim, { opacity: 0, duration: 0.22, ease: "power1.in" }, "<0.04");
  });
}

// --- Toasts ---

export function toastIn(el) {
  if (reduced()) return;
  gsap.from(el, { opacity: 0, y: -12, scale: 0.97, duration: 0.5, ease: "expo.out" });
}

export function toastOut(el) {
  if (reduced() || !el) return Promise.resolve();
  return new Promise((resolve) =>
    gsap.to(el, { opacity: 0, x: 24, duration: 0.25, ease: "power2.in", onComplete: resolve })
  );
}

// --- Small interactions ---

// The settings gear turns a quarter each time it's toggled.
export function spin(el) {
  if (reduced() || !el) return;
  gsap.to(el, { rotation: "+=90", duration: 0.6, ease: "back.out(1.6)" });
}
