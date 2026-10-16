import { useMemo } from "react";

/**
 * A painted Pattachitra arch frame for one gallery photograph, after the
 * couple's design: a carved stone outline, a cream reveal, a yellow band of
 * red-and-pink flowers and green leaves edged in deep red, a fine dark line
 * around the photograph, and below it a panel of two peacocks facing a lotus.
 *
 * Drawn in a 300-wide box (`height` 360 or 440). The photograph itself is
 * HTML laid under this drawing at `ARCH_PHOTO` (see photoBox), so it keeps
 * lazy loading, its crop focus and the hover zoom.
 */

export const ARCH_W = 300;
/** Where the photograph sits: inset from the outer edge, and the peacock panel's height. */
export const ARCH_PHOTO = { inset: 24, panel: 62 };

const STONE = "#B8893A";
const CREAM = "#FDFBF7";
const BAND = "#EFC75E";
const EDGE = "#8D1B1B";
const INK = "#2B1A14";
const LEAF = "#3E7D3A";
const PETALS = ["#C8283C", "#E7678A"];
const PANEL = "#F6E6B4";

/** The arch outline at an inset: straight sides, a semicircular top, a flat foot. */
const arch = (i: number, h: number) => `M${i} ${h - i}V150A${150 - i} ${150 - i} 0 0 1 ${ARCH_W - i} 150V${h - i}Z`;

/** The photograph's box, in % of the frame, for absolutely placing it. */
export function photoBox(height: number) {
  const { inset, panel } = ARCH_PHOTO;
  return {
    left: `${(inset / ARCH_W) * 100}%`,
    right: `${(inset / ARCH_W) * 100}%`,
    top: `${(inset / height) * 100}%`,
    height: `${((height - inset * 2 - panel) / height) * 100}%`,
  };
}

export function PattachitraArch({ height, className = "" }: { height: number; className?: string }) {
  const band = useMemo(() => bandMotifs(height), [height]);
  const panelTop = height - ARCH_PHOTO.inset - ARCH_PHOTO.panel;
  const panelBottom = height - ARCH_PHOTO.inset;

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

      {/* the peacock panel */}
      <rect x={ARCH_PHOTO.inset} y={panelTop} width={ARCH_W - ARCH_PHOTO.inset * 2} height={ARCH_PHOTO.panel} fill={PANEL} />
      <g dangerouslySetInnerHTML={{ __html: panelArt(panelTop) }} />
      <path d={`M${ARCH_PHOTO.inset} ${panelTop}H${ARCH_W - ARCH_PHOTO.inset}`} stroke={INK} strokeWidth="1.6" />
      <path d={`M${ARCH_PHOTO.inset} ${panelTop + 2.6}H${ARCH_W - ARCH_PHOTO.inset}`} stroke={STONE} strokeWidth="0.8" />
      <path d={`M${ARCH_PHOTO.inset} ${panelBottom - 2.6}H${ARCH_W - ARCH_PHOTO.inset}`} stroke={STONE} strokeWidth="0.8" />

      {/* the fine dark line around photograph and panel */}
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

/** A Pattachitra peacock facing right, in a 100 × 60 box. */
const PEACOCK = `
<path d="M42 40C30 33 14 33 5 41 1 45 3 51 9 51 20 52 33 49 44 45Z" fill="${LEAF}" stroke="#1B2A12" stroke-width="0.8"/>
<path d="M40 41.5 8 46.5M41 43.5 12 49" stroke="#9CC56B" stroke-width="0.5" fill="none"/>
${[11, 19, 27, 35].map((x, i) => `<ellipse cx="${x}" cy="${46.2 - i * 0.9}" rx="3" ry="2.2" fill="#2C6EAE" stroke="#E5B53C" stroke-width="0.6"/><circle cx="${x}" cy="${46.2 - i * 0.9}" r="1" fill="#0E2A44"/>`).join("")}
<path d="M40 43C37 33 47 25 58 27 63 23 66 15 70 10.5 73 7 79 7 80.5 10.5 81.5 13.5 78 15.5 76 17.5 72.5 22 71 30 70 37 67 46 50 50 40 43Z" fill="#1F5FA8" stroke="#10182B" stroke-width="0.9"/>
<path d="M45 38C49 31 57 30 63 33 59 39 51 42 45 38Z" fill="#D9822B" stroke="#5A2A0A" stroke-width="0.6"/>
<path d="M49 36q2-2 4 0M54 35q2-2 4 0M51 38.5q2-2 4 0M56 37.5q2-2 4 0" stroke="#5A2A0A" stroke-width="0.5" fill="none"/>
<path d="M80.3 10.2 86.5 11.8 80.6 13.4Z" fill="#E39A2C" stroke="#5A2A0A" stroke-width="0.5"/>
<circle cx="77.3" cy="10.8" r="1.2" fill="#fff"/><circle cx="77.5" cy="10.8" r="0.55" fill="#000"/>
<path d="M74.5 7.6 71.5 1.8M74.7 7.4 74.8 0.8M75 7.6 78 1.9" stroke="#10182B" stroke-width="0.6"/>
<circle cx="71.5" cy="1.8" r="0.9" fill="#1F5FA8"/><circle cx="74.8" cy="0.8" r="0.9" fill="#1F5FA8"/><circle cx="78" cy="1.9" r="0.9" fill="#1F5FA8"/>
<circle cx="73" cy="15" r="0.6" fill="#CFE3F5"/><circle cx="71.2" cy="20" r="0.6" fill="#CFE3F5"/><circle cx="69.8" cy="25" r="0.6" fill="#CFE3F5"/>
<path d="M53 47 51.5 55M59 47 59.5 55M49.5 55.5h4M57.5 55.5h4" stroke="#C0601C" stroke-width="1.1" fill="none"/>`;

/** Lotus with two leaves, centred on its base. */
const LOTUS = `
<path d="M-2 4C-12 2-19 7-21 13-13 14-5 10-2 4Z" fill="${LEAF}" stroke="#1B3A12" stroke-width="0.6"/>
<path d="M2 4C12 2 19 7 21 13 13 14 5 10 2 4Z" fill="${LEAF}" stroke="#1B3A12" stroke-width="0.6"/>
${[-70, -35, 35, 70, 0]
  .map((a) => `<path d="M0-15C4.5-9 4.5-2 0 2-4.5-2-4.5-9 0-15Z" transform="rotate(${a} 0 2)" fill="${a ? "#D84A66" : "#E9607C"}" stroke="#5A1414" stroke-width="0.6"/>`)
  .join("")}
<path d="M0-11C2-7 2-3 0 0-2-3-2-7 0-11Z" fill="#F7A9B8"/>
<circle cx="0" cy="3.5" r="1.6" fill="#F4C542" stroke="#5A1414" stroke-width="0.4"/>`;

function panelArt(top: number) {
  const { inset } = ARCH_PHOTO;
  let dots = "";
  for (let x = inset + 4; x < ARCH_W - inset - 2; x += 6) {
    dots += `<circle cx="${x}" cy="${f(top + 5.2)}" r="0.7" fill="${EDGE}"/><circle cx="${x}" cy="${f(top + ARCH_PHOTO.panel - 5.2)}" r="0.7" fill="${EDGE}"/>`;
  }
  return (
    dots +
    `<g transform="translate(29 ${f(top + 4.5)}) scale(0.92)">${PEACOCK}</g>` +
    `<g transform="translate(271 ${f(top + 4.5)}) scale(-0.92 0.92)">${PEACOCK}</g>` +
    `<g transform="translate(150 ${f(top + 36)}) scale(1.3)">${LOTUS}</g>` +
    flower(inset + 11, top + 16, 2.1, PETALS[1]) +
    flower(ARCH_W - inset - 11, top + 16, 2.1, PETALS[1]) +
    flower(150, top + 54, 1.8, PETALS[0])
  );
}
