import { forwardRef, useMemo, type CSSProperties } from "react";

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

const PETAL_COLOURS = ["#FFF8EE", "#FFF3DE", "#F9C433", "#F5B21E", "#C62828", "#B71C1C", "#F48FB1"];

/**
 * A gentle shower of petals (white, yellow, red, a few pink) with golden
 * motes. `front` petals are larger and faster and keep to the side lanes, so
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

/** Tiny golden motes drifting in a region (percentages of the parent). */
export function Motes({ count = 18, seed = 11, region = { x: 0, y: 0, w: 100, h: 100 } }: { count?: number; seed?: number; region?: { x: number; y: number; w: number; h: number } }) {
  const motes = useMemo(() => {
    const rnd = seeded(seed);
    return Array.from({ length: count }, () => ({
      left: `${(region.x + rnd() * region.w).toFixed(1)}%`,
      top: `${(region.y + rnd() * region.h).toFixed(1)}%`,
      size: 2 + rnd() * 3,
      style: vars({
        "--dur": `${(3 + rnd() * 4).toFixed(1)}s`,
        "--delay": `${(-rnd() * 4).toFixed(1)}s`,
        "--dx": `${(rnd() * 40 - 20).toFixed(0)}px`,
        "--dy": `${(-20 - rnd() * 50).toFixed(0)}px`,
      }),
    }));
  }, [count, seed, region.x, region.y, region.w, region.h]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {motes.map((m, i) => (
        <span
          key={i}
          className="mote-float absolute rounded-full"
          style={{ ...m.style, left: m.left, top: m.top, width: m.size, height: m.size, background: "#FFE7A3", boxShadow: "0 0 6px 2px rgb(255 205 110 / 0.7)" }}
        />
      ))}
    </div>
  );
}

/** Golden particles bursting out of a rectangle (the deity dissolving into light). */
export function MoteBurst({
  rect,
  count = 46,
  baseDelay = 0,
}: {
  rect: { left: number; top: number; width: number; height: number };
  count?: number;
  /** Seconds before the burst begins. */
  baseDelay?: number;
}) {
  const motes = useMemo(() => {
    const rnd = seeded(23);
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.45;
    return Array.from({ length: count }, () => {
      const x = rect.left + rnd() * rect.width;
      const y = rect.top + rnd() * rect.height;
      // drift outward from the centre and gently upward
      const dx = (x - cx) * (0.3 + rnd() * 0.5) + (rnd() * 30 - 15);
      const dy = (y - cy) * (0.2 + rnd() * 0.3) - (30 + rnd() * 70);
      return {
        x,
        y,
        size: 2 + rnd() * 4,
        style: vars({ "--dur": `${(1.4 + rnd() * 1.2).toFixed(2)}s`, "--delay": `${(baseDelay + rnd() * 0.9).toFixed(2)}s`, "--dx": `${dx.toFixed(0)}px`, "--dy": `${dy.toFixed(0)}px` }),
      };
    });
  }, [rect.left, rect.top, rect.width, rect.height, count, baseDelay]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {motes.map((m, i) => (
        <span
          key={i}
          className="mote-burst absolute rounded-full"
          style={{ ...m.style, left: m.x, top: m.y, width: m.size, height: m.size, background: "#FFF0C2", boxShadow: "0 0 8px 3px rgb(255 205 110 / 0.75)" }}
        />
      ))}
    </div>
  );
}

/** A ring of golden motes and petals; animated (rotate + contract) by the parent. */
export const Swirl = forwardRef<HTMLDivElement>(function Swirl(_, ref) {
  const items = useMemo(() => {
    const rnd = seeded(31);
    return Array.from({ length: 30 }, (_, i) => {
      const a = (i / 30) * Math.PI * 2;
      const r = 38 + rnd() * 10; // % of the ring's box
      const petal = i % 4 === 0;
      return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a), petal, size: petal ? 9 : 3 + rnd() * 3, colour: PETAL_COLOURS[i % PETAL_COLOURS.length], rot: (a * 180) / Math.PI };
    });
  }, []);
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(90vw,420px)] -translate-x-1/2 -translate-y-1/2" style={{ opacity: 0 }}>
      {items.map((m, i) =>
        m.petal ? (
          <svg key={i} className="absolute" width={m.size} height={m.size * 1.3} viewBox="-8 -10.5 16 21" style={{ left: `${m.x}%`, top: `${m.y}%`, transform: `rotate(${m.rot}deg)` }}>
            <path d="M0-10C6-6 6.5 5 0 10-6.5 5-6-6 0-10Z" fill={m.colour} />
          </svg>
        ) : (
          <span key={i} className="absolute rounded-full" style={{ left: `${m.x}%`, top: `${m.y}%`, width: m.size, height: m.size, background: "#FFF0C2", boxShadow: "0 0 8px 3px rgb(255 205 110 / 0.7)" }} />
        ),
      )}
    </div>
  );
});
