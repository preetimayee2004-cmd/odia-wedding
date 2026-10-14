import { useMemo, type CSSProperties } from "react";

/** Small deterministic random generator, so effects look the same each render. */
function seeded(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const vars = (v: Record<string, string>) => v as CSSProperties;

/**
 * An elegant golden hand with the index finger pointing straight up. Its
 * fingertip sits at FINGERTIP (as fractions of the drawing), so the parent
 * can place and tilt it from the tip.
 */
export const FINGERTIP = { x: 16 / 42, y: 2 / 61, aspect: 42 / 61 };
export function Fingertip({ height = 68 }: { height?: number }) {
  return (
    <svg viewBox="-2 3 42 61" height={height} width={height * FINGERTIP.aspect} aria-hidden style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="fingertip-gold" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#FFEDB5" />
          <stop offset="0.45" stopColor="#E8B955" />
          <stop offset="1" stopColor="#A9751F" />
        </linearGradient>
      </defs>
      <path
        d="M9 30V10a5 5 0 0 1 10 0v18c0-3.2 7-3.2 7 0v2c0-3.2 6.5-3.2 6.5 0v2.5c0-2.8 6-2.8 6 0V46c0 9-6 16-15 16h-3c-6 0-10-3-13-8L-.5 43c-1.8-2.8 2.2-5.6 4.6-3L9 46Z"
        fill="url(#fingertip-gold)"
        stroke="#6E4812"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M18 34v-6M25 34v-4M31.5 35v-3" stroke="#6E4812" strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
      <path d="M11.4 9c0-2 1.2-3.4 2.6-3.6" stroke="#FFF8DE" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.85" />
    </svg>
  );
}

const PETAL_COLOURS = ["#FFF8EE", "#FFF3DE", "#F9C433", "#F5B21E", "#C62828", "#B71C1C"];

/**
 * A gentle shower of petals (white, yellow, red). `front` petals are larger and faster and keep to the side lanes, so
 * the deity's face and ornaments stay clear.
 */
export function Petals({ front = false, baseDelay = 0 }: { front?: boolean; baseDelay?: number }) {
  const petals = useMemo(() => {
    const rnd = seeded(front ? 7 : 3);
    const count = front ? 7 : 18;
    return Array.from({ length: count }, (_, i) => {
      const lane = front ? (i % 2 ? 0.04 + rnd() * 0.18 : 0.78 + rnd() * 0.18) : rnd();
      const size = front ? 20 + rnd() * 10 : 9 + rnd() * 9;
      return {
        left: `${(lane * 100).toFixed(1)}%`,
        size,
        colour: PETAL_COLOURS[Math.floor(rnd() * PETAL_COLOURS.length)],
        style: vars({
          "--dur": `${(front ? 4.2 : 6) + rnd() * 3}s`,
          "--delay": `${(baseDelay + rnd() * (front ? 2.5 : 3)).toFixed(2)}s`,
          "--x0": `${(rnd() * 30 - 15).toFixed(0)}px`,
          "--x1": `${(rnd() * 60 - 30).toFixed(0)}px`,
          "--rot": `${(rnd() * 540 - 270).toFixed(0)}deg`,
          "--sway": `${(8 + rnd() * 16).toFixed(0)}px`,
          "--sway-dur": `${(1.4 + rnd() * 1.4).toFixed(2)}s`,
        }),
        opacity: front ? 0.95 : 0.7 + rnd() * 0.25,
      };
    });
  }, [front, baseDelay]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p, i) => (
        <span key={i} className="petal-fall absolute top-0" style={{ ...p.style, left: p.left, opacity: p.opacity }}>
          <span className="petal-sway block" style={p.style}>
            <svg width={p.size} height={p.size * 1.3} viewBox="-8 -10.5 16 21" style={{ display: "block" }}>
              <path d="M0-10C6-6 6.5 5 0 10-6.5 5-6-6 0-10Z" fill={p.colour} />
              <path d="M0-8V8" stroke="rgb(0 0 0 / 0.12)" strokeWidth="0.6" />
            </svg>
          </span>
        </span>
      ))}
    </div>
  );
}
