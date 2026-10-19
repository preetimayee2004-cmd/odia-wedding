import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/*
 * Jhoti (ଝୋଟି): the rice-paste drawing at an Odia threshold that welcomes
 * whoever crosses it. Every motif here is built from the invitation
 * rangoli's own geometry (sections/RangoliStart.tsx) and the white champa of
 * the Events vine, drawn as one line: rice white on a fine ochre keyline
 * (styles in index.css, `.jhoti`).
 */

// The rangoli's drawing, in its 200-unit box with the centre at 100,100;
// angles clockwise from the top.
const C = 100;
const f = (n: number) => n.toFixed(2);
const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.sin(a), C - r * Math.cos(a)] as const;
};
/** A petal (or leaf) pointing up, from radius `inner` to `outer`, `w` wide. */
const petal = (inner: number, outer: number, w: number, tip = 0.25) => {
  const len = outer - inner;
  const y0 = C - inner;
  const y1 = C - outer;
  return `M${C} ${y0}C${C - w} ${f(y0 - len * 0.3)} ${f(C - w * tip * 2)} ${f(y1 + len * 0.2)} ${C} ${y1}C${f(C + w * tip * 2)} ${f(y1 + len * 0.2)} ${C + w} ${f(y0 - len * 0.3)} ${C} ${y0}Z`;
};
const ring = (n: number, offset = 0) => Array.from({ length: n }, (_, i) => offset + (i * 360) / n);

const LOTUS_OUTER = petal(9, 44, 13, 0.3);
const LOTUS_INNER = petal(9, 33, 7, 0.3);
const POINTED = petal(36, 66, 8, 0.12);
const LEAF = petal(62, 82, 6.5, 0.2);
const MARIGOLD = petal(14, 40, 6, 0.12);
const SCALLOP = (() => {
  const [x0, y0] = polar(90, -7.5);
  const [cx, cy] = polar(99, 0);
  const [x1, y1] = polar(90, 7.5);
  return `M${f(x0)} ${f(y0)}Q${f(cx)} ${f(cy)} ${f(x1)} ${f(y1)}`;
})();
const HEART = "M100 92a8 8 0 1 1-.01 0Z";
/** The champa petal from the Events vine, and its centre vein. */
const CHAMPA = "M0 0C-13-6-27-20-25-37-23-52-3-58 10-51 22-44 22-28 14-16 9-9 4-4 0 0Z";
const CHAMPA_VEIN = "M0-4C-4-16-6-30-2-44";

/** One drawn line: the keyline under the rice-white line. */
const line = (d: string, key?: string | number, transform?: string) => (
  <g key={key} transform={transform}>
    <path className="k" d={d} />
    <path className="r" d={d} />
  </g>
);
const dot = (x: number, y: number, r: number, key?: string | number) => <circle key={key} className="d" cx={f(x)} cy={f(y)} r={r} />;

/** A flower and the box it's drawn in. */
type Flower = { box: [number, number, number]; body: ReactNode };

const champa: Flower = {
  box: [-62, -62, 124],
  body: (
    <>
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k} transform={`rotate(${k * 72 + 10})`}>
          {line(CHAMPA)}
          {line(CHAMPA_VEIN)}
        </g>
      ))}
      {dot(0, 0, 3.4)}
    </>
  ),
};

const padma: Flower = {
  box: [50, 50, 100],
  body: (
    <>
      {ring(8, 22.5).map((a) => (
        <g key={a} transform={`rotate(${a} 100 100)`}>
          {line(LOTUS_OUTER)}
          {line(LOTUS_INNER)}
        </g>
      ))}
      {dot(100, 100, 3.4)}
    </>
  ),
};

const gendu: Flower = {
  box: [56, 56, 88],
  body: (
    <>
      {ring(16).map((a) => line(MARIGOLD, a, `rotate(${a} 100 100)`))}
      {line(HEART)}
    </>
  ),
};

/** Lata: a creeper waving from x0 to x1, the rangoli's leaf hung at each crest. */
const lata = (x0: number, x1: number, y: number) => {
  const n = 4;
  const step = (x1 - x0) / n;
  let d = `M${x0} ${y}`;
  const leaves: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = x0 + i * step;
    const up = i % 2 === 0 ? -1 : 1;
    d += `C${f(a + step * 0.35)} ${f(y + up * 9)} ${f(a + step * 0.65)} ${f(y + up * 9)} ${f(a + step)} ${y}`;
    leaves.push(line(LEAF, i, `translate(${f(a + step / 2)} ${f(y + up * 6.6)}) rotate(${up < 0 ? -35 : 215}) scale(0.95) translate(-100 -38)`));
  }
  return (
    <>
      {line(d)}
      {leaves}
    </>
  );
};

/** Bindu mala: the rangoli's scalloped edge with a dot under each scallop. */
const bindu = (x0: number, x1: number, y: number) => {
  const n = Math.round((x1 - x0) / 22);
  const step = (x1 - x0) / n;
  return Array.from({ length: n }, (_, i) => {
    const a = x0 + i * step;
    return (
      <g key={i}>
        {line(`M${f(a)} ${y}Q${f(a + step / 2)} ${y - 10} ${f(a + step)} ${y}`)}
        {dot(a + step / 2, y + 6, 2.2)}
      </g>
    );
  });
};

/** A few rice dots either side of a flower `size` wide, fading outward. */
const riceDots = (size: number) =>
  [0, 1, 2, 3].map((i) => (
    <g key={i}>
      {dot(260 - size / 2 - 14 - i * 15, 45, 2.2 - i * 0.25)}
      {dot(260 + size / 2 + 14 + i * 15, 45, 2.2 - i * 0.25)}
    </g>
  ));

/** The same border on the right, mirrored. */
const both = (half: ReactNode) => (
  <>
    {half}
    <g transform="translate(520 0) scale(-1 1)">{half}</g>
  </>
);

export type ThresholdMotif = "champa-lata" | "padma-bindu" | "champa" | "padma" | "gendu";

/** Each threshold: its borders, and the flower at its centre (and how wide). */
const THRESHOLDS: Record<ThresholdMotif, { lines: ReactNode; flower: Flower; size: number }> = {
  // into Wedding Events: the creeper border, once
  "champa-lata": { lines: both(lata(16, 214, 45)), flower: champa, size: 74 },
  // into The Families: the scalloped dot border, once
  "padma-bindu": { lines: both(bindu(16, 214, 49)), flower: padma, size: 74 },
  // the everyday welcome
  champa: { lines: riceDots(64), flower: champa, size: 64 },
  // the ceremonial one, into Thank You
  padma: { lines: riceDots(64), flower: padma, size: 64 },
  // either side of the RSVP: a small marigold between two rows of dots
  gendu: {
    lines: [0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i}>
        {dot(120 + i * 16, 45, 2.2)}
        {dot(400 - i * 16, 45, 2.2)}
      </g>
    )),
    flower: gendu,
    size: 44,
  },
};

type Pull = "center" | "up" | "down" | "none";

/**
 * The threshold between two sections: a short jhoti with a flower at its
 * centre. When the seam reaches about three quarters of the way down the
 * screen, its lines draw outward from the centre and the flower opens; it
 * plays once and stays drawn. With reduced motion (or if the seam has
 * already been passed) it is simply there, drawn.
 *
 * It takes the place, size and `pull` of the separator it replaced: on the
 * seam, eating into the sections' padding rather than adding space, above
 * their backgrounds and below the side bands. Decorative only.
 */
export function JhotiThreshold({ motif, pull = "center" }: { motif: ThresholdMotif; pull?: Pull }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"drawn" | "armed" | "play">("drawn");
  const { lines, flower, size } = THRESHOLDS[motif];
  const [bx, by, bw] = flower.box;
  const margin = { center: "-my-5", up: "-mt-10", down: "-mb-10", none: "" }[pull];

  // Hidden until reached (set before the first paint, so it never flashes)
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.height > 0 && r.top < window.innerHeight * 0.75) return; // already reached
    setState("armed");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("play");
        io.disconnect();
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden data-state={state} className={`jhoti pointer-events-none relative z-[2] flex h-10 items-center justify-center ${margin}`}>
      <div className="jhoti-draw w-[15rem] max-w-[76%]">
        <svg viewBox="0 0 520 90" className="block h-auto w-full overflow-visible">
          {lines}
          <g transform={`translate(${f(260 - size / 2)} ${f(45 - size / 2)}) scale(${f(size / bw)}) translate(${-bx} ${-by})`}>
            <g className="jhoti-bloom">{flower.body}</g>
          </g>
        </svg>
      </div>
    </div>
  );
}

/**
 * The invitation's own rangoli as one rice-white line: scallops, pointed
 * petals, the lotus and the ring of dots. Small, above the couple's
 * initials, so the site ends with the jhoti it began with.
 */
export function RangoliSeal({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden className={`jhoti overflow-visible ${className}`} style={style}>
      {ring(24).map((a) => line(SCALLOP, `s${a}`, `rotate(${a} 100 100)`))}
      {ring(16).map((a) => line(POINTED, `p${a}`, `rotate(${a} 100 100)`))}
      {ring(8, 22.5).map((a) => line(LOTUS_OUTER, `l${a}`, `rotate(${a} 100 100)`))}
      {line(HEART)}
      {ring(24).map((a) => {
        const [x, y] = polar(84.5, a);
        return dot(x, y, 2.4, `d${a}`);
      })}
    </svg>
  );
}

/**
 * A single champa with a short trail of rice dots beneath it: a quiet jhoti
 * for a small empty space (the gallery's staggered corner).
 */
export function ChampaSprig({ className = "", style }: { className?: string; style?: CSSProperties }) {
  const [bx, by, bw] = champa.box;
  const size = 30;
  return (
    <svg viewBox="0 0 40 60" aria-hidden className={`jhoti overflow-visible ${className}`} style={style}>
      <g transform={`translate(${f(20 - size / 2)} 2) scale(${f(size / bw)}) translate(${-bx} ${-by})`}>{champa.body}</g>
      {dot(20, 42, 2)}
      {dot(20, 50, 1.6)}
      {dot(20, 57, 1.2)}
    </svg>
  );
}
