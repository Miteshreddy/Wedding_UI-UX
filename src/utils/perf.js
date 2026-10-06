// Shared performance helpers for the animated canvases.

const mq = (q) => typeof window !== 'undefined' && window.matchMedia?.(q).matches;

// Phones / tablets / low-core devices get a lighter version of every effect.
export const IS_LOW_POWER =
  typeof window !== 'undefined' &&
  (mq('(pointer: coarse)') || mq('(max-width: 767px)') || (navigator.hardwareConcurrency || 8) <= 4);

// Canvas backing-store density: full-screen canvases at 2-3x DPR are the
// single biggest paint cost on phones, and the effects are soft glows anyway.
export function canvasDpr() {
  const dpr = window.devicePixelRatio || 1;
  return IS_LOW_POWER ? 1 : Math.min(dpr, 2);
}

// Scale a particle count down on low-power devices.
export const scaled = (n, lowFactor = 0.4) => (IS_LOW_POWER ? Math.max(1, Math.round(n * lowFactor)) : n);

// Tracks whether an element is on screen (and the tab visible) so animation
// loops can skip work. Usage: const gate = visibilityGate(el); ... gate.on;
export function visibilityGate(el, rootMargin = '100px') {
  const gate = { on: true, disconnect: () => {} };
  if (!el || typeof IntersectionObserver === 'undefined') return gate;
  const io = new IntersectionObserver(([entry]) => { gate.on = entry.isIntersecting; }, { rootMargin });
  io.observe(el);
  gate.disconnect = () => io.disconnect();
  Object.defineProperty(gate, 'on', {
    get: () => gate._vis !== false && !document.hidden,
    set: (v) => { gate._vis = v; },
  });
  return gate;
}
