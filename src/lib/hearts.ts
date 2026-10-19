/**
 * Floating hearts from a button (the Wishing Wall's Send Blessing): 14–18
 * small SVG hearts — maroon, gold, blush and soft red, about one in four a
 * thin gold outline — and 4–5 marigold petals, released from the button's
 * centre over about 700ms. Each pops (0.3 → 1.1 → 1), rises 180–320px like
 * a balloon, swaying side to side (±20px) with a wobbling tilt, then shrinks
 * a little and fades near the top, over 1.6–2.4s. They live in a fixed,
 * pointer-events: none overlay at the button; only transform and opacity
 * animate; each is removed when it finishes, and the overlay with the last.
 * At most 20 at a time. The caller skips this under reduced motion.
 */
const MAX = 20;
const HEART_COLOURS = ["#7a1f1f", "#c9a24e", "#e8a0a0", "#b3262a"];
const PETAL_COLOURS = ["#f2a12b", "#e8801a"];
const HEART_PATH = "M12 21.2C11.2 20.7 2.5 15.4 2.5 8.9 2.5 6 4.7 3.6 7.5 3.6c1.9 0 3.5 1.1 4.5 2.7 1-1.6 2.6-2.7 4.5-2.7 2.8 0 5 2.4 5 5.3 0 6.5-8.7 11.8-9.5 12.3Z";
const SVG_NS = "http://www.w3.org/2000/svg";

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];

let live = 0;

export function releaseHearts(from: HTMLElement) {
  if (typeof document === "undefined" || !("animate" in from)) return;
  const box = from.getBoundingClientRect();
  const petals = Math.round(rand(4, 5));
  const hearts = Math.min(Math.round(rand(14, 18)), MAX - petals);
  const room = Math.max(0, MAX - live);
  const total = Math.min(hearts + petals, room);
  if (!total) return;

  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, {
    position: "fixed",
    left: `${box.left + box.width / 2}px`,
    top: `${box.top + box.height / 2}px`,
    width: "0",
    height: "0",
    pointerEvents: "none",
    zIndex: "70",
  });
  document.body.appendChild(layer);

  let left = total;
  const done = (el: Element) => {
    el.remove();
    live--;
    if (--left === 0) layer.remove();
  };

  // petals mixed in among the hearts
  const kinds = Array.from({ length: total }, (_, i) => (i < Math.min(petals, total) ? "petal" : "heart"));
  kinds.sort(() => Math.random() - 0.5);

  kinds.forEach((kind, i) => {
    const el = kind === "heart" ? heart() : petal();
    layer.appendChild(el);
    live++;
    // spread over ~700ms, not all at once
    const delay = (i / Math.max(1, total - 1)) * 700 * rand(0.85, 1);
    const duration = rand(1600, 2400);
    const anim = el.animate(path(kind === "petal", duration), { duration, delay, easing: "linear", fill: "both" });
    anim.onfinish = () => done(el);
    anim.oncancel = () => done(el);
  });
}

function heart(): Element {
  const size = Math.round(rand(12, 24));
  const outline = Math.random() < 0.25;
  const colour = pick(HEART_COLOURS);
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  Object.assign(svg.style, { position: "absolute", left: `${-size / 2}px`, top: `${-size / 2}px`, overflow: "visible" });
  const p = document.createElementNS(SVG_NS, "path");
  p.setAttribute("d", HEART_PATH);
  if (outline) {
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", "#c9a24e");
    p.setAttribute("stroke-width", "1.6");
  } else {
    p.setAttribute("fill", colour);
  }
  svg.appendChild(p);
  return svg;
}

function petal(): Element {
  const el = document.createElement("span");
  Object.assign(el.style, {
    position: "absolute",
    left: "-3px",
    top: "-5px",
    width: "6px",
    height: "10px",
    borderRadius: "50%",
    background: pick(PETAL_COLOURS),
  });
  return el;
}

/** A balloon's rise: up 180–320px, swaying ±20px, tilting and wobbling; pop in, settle, then shrink and fade near the top. */
function path(isPetal: boolean, duration: number): Keyframe[] {
  const rise = rand(180, 320);
  const sway = rand(12, 20) * (Math.random() < 0.5 ? -1 : 1);
  const cycles = rand(1, 1.6);
  const phase = rand(0, Math.PI * 2);
  const tilt = rand(-15, 15);
  const wobble = isPetal ? rand(40, 90) : rand(6, 10);
  const frames: Keyframe[] = [];
  const pop = 150 / duration; // the pop takes its first 150ms
  const STEPS = 16;
  const marks = [0, pop / 2, pop, pop * 2, ...Array.from({ length: STEPS }, (_, k) => (k + 1) / STEPS).filter((t) => t > pop * 2)];
  for (const t of marks) {
    const y = -rise * Math.sin((t * Math.PI) / 2); // quick off the button, slowing as it climbs
    const x = sway * Math.sin(t * cycles * Math.PI * 2 + phase) - sway * Math.sin(phase); // starts at the centre
    const r = tilt + wobble * Math.sin(t * cycles * Math.PI * 2 + phase + 1);
    // 0.3 → 1.1 (first ~150ms) → 1 → 0.85 as it fades near the top
    const s = t < pop ? 0.3 + 0.8 * (t / pop) : t < pop * 2 ? 1.1 - 0.1 * ((t - pop) / pop) : t < 0.7 ? 1 : 1 - 0.15 * ((t - 0.7) / 0.3);
    const o = t < 0.04 ? t / 0.04 : t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
    frames.push({ offset: t, opacity: o, transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${r.toFixed(1)}deg) scale(${s.toFixed(3)})` });
  }
  return frames;
}
