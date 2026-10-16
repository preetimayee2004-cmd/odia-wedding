import { useMemo } from "react";

/**
 * A painted Pattachitra arch frame for one gallery photograph, after the
 * couple's design: a carved stone outline, a cream reveal, a yellow band of
 * red-and-pink flowers and green leaves edged in deep red, and a fine dark
 * line around the photograph.
 *
 * Drawn in a 300-wide box (`height` 360 or 440). The photograph itself is
 * HTML laid under this drawing, inset by `ARCH_INSET` (see photoBox), so it
 * keeps lazy loading, its crop focus and the hover zoom.
 */

export const ARCH_W = 300;
/** How far the photograph sits inside the frame's outer edge. */
const ARCH_INSET = 24;

const STONE = "#B8893A";
const CREAM = "#FDFBF7";
const BAND = "#EFC75E";
const EDGE = "#8D1B1B";
const INK = "#2B1A14";
const LEAF = "#3E7D3A";
const PETALS = ["#C8283C", "#E7678A"];

/** The arch outline at an inset: straight sides, a semicircular top, a flat foot. */
const arch = (i: number, h: number) => `M${i} ${h - i}V150A${150 - i} ${150 - i} 0 0 1 ${ARCH_W - i} 150V${h - i}Z`;

/** The photograph's box, in % of the frame, for absolutely placing it. */
export function photoBox(height: number) {
  return {
    left: `${(ARCH_INSET / ARCH_W) * 100}%`,
    right: `${(ARCH_INSET / ARCH_W) * 100}%`,
    top: `${(ARCH_INSET / height) * 100}%`,
    bottom: `${(ARCH_INSET / height) * 100}%`,
  };
}

export function PattachitraArch({ height, className = "" }: { height: number; className?: string }) {
  const band = useMemo(() => bandMotifs(height), [height]);

  return (
    <svg viewBox={`0 0 ${ARCH_W} ${height}`} className={className} aria-hidden>
      {/* cream reveal between the stone line and the band */}
      <path d={arch(1, height) + arch(8, height)} fill={CREAM} fillRule="evenodd" />
      {/* the flower band */}
      <path d={arch(8, height) + arch(22, height)} fill={BAND} fillRule="evenodd" />
      <g dangerouslySetInnerHTML={{ __html: band }} />
      <path d={arch(8, height)} fill="none" stroke={EDGE} strokeWidth="1.6" />
      <path d={arch(22, height)} fill="none" stroke={EDGE} strokeWidth="1.6" />
      {/* the carved stone outline */}
      <path d={arch(1, height)} fill="none" stroke={STONE} strokeWidth="1.6" />

      {/* the fine dark line around the photograph */}
      <path d={arch(23, height)} fill="none" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

const f = (n: number) => n.toFixed(1);

function flower(x: number, y: number, r: number, colour: string) {
  let s = "";
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
    s += `<circle cx="${f(x + Math.cos(a) * r)}" cy="${f(y + Math.sin(a) * r)}" r="${f(r)}" fill="${colour}" stroke="#5A1414" stroke-width="0.45"/>`;
  }
  return s + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.62)}" fill="#F4C542" stroke="#5A1414" stroke-width="0.4"/>`;
}

function leafPair(x: number, y: number, deg: number) {
  return [-38, 38]
    .map((o) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="3.9" ry="1.6" transform="rotate(${f(deg + o)} ${f(x)} ${f(y)}) translate(3.2 0)" fill="${LEAF}" stroke="#1B3A12" stroke-width="0.35"/>`)
    .concat(`<circle cx="${f(x)}" cy="${f(y)}" r="0.9" fill="${CREAM}"/>`)
    .join("");
}

/** Flowers and leaf pairs along the middle of the band, rosettes at the foot's corners. */
function bandMotifs(h: number) {
  const m = 15; // the band's middle line
  const r = 150 - m;
  const side = h - m - 150;
  const arc = Math.PI * r;
  const foot = ARCH_W - m * 2;
  const total = side * 2 + arc + foot;
  const at = (d: number): [number, number, number] => {
    if (d < side) return [m, h - m - d, -90];
    d -= side;
    if (d < arc) {
      const t = Math.PI + d / r;
      return [150 + Math.cos(t) * r, 150 + Math.sin(t) * r, (t * 180) / Math.PI + 90];
    }
    d -= arc;
    if (d < side) return [ARCH_W - m, 150 + d, 90];
    d -= side;
    return [ARCH_W - m - d, h - m, 180];
  };
  let s = "";
  const step = 13;
  const n = Math.floor(total / step);
  for (let k = 0; k < n; k++) {
    const d = (k + 0.5) * (total / n);
    // keep the foot's corners for the rosettes
    const fromCorner = Math.min(Math.abs(d), Math.abs(d - (side * 2 + arc)), Math.abs(d - total));
    if (fromCorner < 9) continue;
    const [x, y, a] = at(d);
    s += k % 2 ? leafPair(x, y, a) : flower(x, y, 2.5, PETALS[(k / 2) % 2 ? 1 : 0]);
  }
  for (const x of [m, ARCH_W - m]) {
    for (let k = 0; k < 8; k++) {
      const t = (k / 8) * Math.PI * 2;
      s += `<circle cx="${f(x + Math.cos(t) * 3.6)}" cy="${f(h - m + Math.sin(t) * 3.6)}" r="2.3" fill="${PETALS[0]}" stroke="#5A1414" stroke-width="0.4"/>`;
    }
    s += `<circle cx="${f(x)}" cy="${f(h - m)}" r="2.4" fill="#F4C542" stroke="#5A1414" stroke-width="0.45"/>`;
  }
  return s;
}
