/**
 * Artwork for the Wedding Events vine, as SVG markup: the shared gradients,
 * filters, a slim leaf and a bud, and two flowers drawn in a -60…60 box —
 * marigold and a white champa (frangipani). Every id starts with "ev-".
 * Built once; a seeded random keeps the hand-made jitter the same on every
 * visit.
 */

const f1 = (n: number) => n.toFixed(1);

export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Gradient from a petal's base (the bottom of its box) to its tip. */
const petalGrad = (id: string, base: string, tip: string) =>
  `<linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${base}"/><stop offset="1" stop-color="${tip}"/></linearGradient>`;

const SHARED = `
<filter id="ev-soft-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="1.2" stdDeviation="1.3" flood-color="#6b3d10" flood-opacity="0.28"/></filter>
<filter id="ev-vine-shadow" x="-10%" y="-5%" width="120%" height="110%"><feDropShadow dx="0" dy="1.2" stdDeviation="1" flood-color="#2d3a12" flood-opacity="0.18"/></filter>
<radialGradient id="ev-mg-shade"><stop offset="0.7" stop-color="#7a2e00" stop-opacity="0.4"/><stop offset="1" stop-color="#7a2e00" stop-opacity="0"/></radialGradient>
<radialGradient id="ev-mg-centre" cx="0.45" cy="0.4"><stop offset="0" stop-color="#ffe98a"/><stop offset="1" stop-color="#ee9c1c"/></radialGradient>
<radialGradient id="ev-champa-fill" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="56"><stop offset="0" stop-color="#f2b83a"/><stop offset="0.12" stop-color="#f7d272"/><stop offset="0.3" stop-color="#fdf1d2"/><stop offset="0.55" stop-color="#fffaf0"/><stop offset="1" stop-color="#ffffff"/></radialGradient>
<linearGradient id="ev-leaf-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93b36c"/><stop offset="1" stop-color="#557a3b"/></linearGradient>
<linearGradient id="ev-bud-fill" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e6b23a"/><stop offset="1" stop-color="#fbe9b0"/></linearGradient>
<g id="ev-leaf">
  <path d="M0 0C7-6 20-8 32 0 20 7 7 6 0 0Z" fill="url(#ev-leaf-fill)"/>
  <path d="M1 0Q16-.8 30 0" fill="none" stroke="#e2efc8" stroke-width="0.5" stroke-linecap="round" opacity="0.8"/>
</g>
<g id="ev-bud">
  <path d="M0 0Q2-5 1-10" fill="none" stroke="#5e7f45" stroke-width="0.9" stroke-linecap="round"/>
  <path d="M1-9C-2-11-2-16 1-19 4-16 4-11 1-9Z" fill="url(#ev-bud-fill)" stroke="#c9952a" stroke-width="0.4"/>
  <path d="M1-9C-1-9-2.5-10.5-2.5-12M1-9C3-9 4.5-10.5 4.5-12" fill="none" stroke="#5e7f45" stroke-width="0.7" stroke-linecap="round"/>
</g>`;

/** Marigold: five rings of ruffled orange-to-yellow petals around a golden button. */
function marigold() {
  const R = rng(11);
  // a ruffled petal pointing up, its base at the origin
  const ruffle = (len: number, w: number) => {
    const b = w * 0.28;
    return (
      `M${f1(-b)} 0C${f1(-w / 2)} ${f1(-len * 0.2)} ${f1(-w / 2)} ${f1(-len * 0.62)} ${f1(-w * 0.42)} ${f1(-len * 0.86)}` +
      `Q${f1(-w * 0.34)} ${f1(-len * 1.02)} ${f1(-w * 0.2)} ${f1(-len * 0.93)}Q${f1(-w * 0.1)} ${f1(-len * 1.06)} 0 ${f1(-len * 0.95)}` +
      `Q${f1(w * 0.1)} ${f1(-len * 1.06)} ${f1(w * 0.2)} ${f1(-len * 0.93)}Q${f1(w * 0.34)} ${f1(-len * 1.02)} ${f1(w * 0.42)} ${f1(-len * 0.86)}` +
      `C${f1(w / 2)} ${f1(-len * 0.62)} ${f1(w / 2)} ${f1(-len * 0.2)} ${f1(b)} 0Z`
    );
  };
  const rings = [
    { r: 55, n: 22, len: 20, w: 13.5, base: "#cf5b0b", tip: "#f39418", edge: "#a3460a" },
    { r: 46, n: 20, len: 19, w: 13, base: "#dc6f0e", tip: "#f8a51f", edge: "#b0520a" },
    { r: 36, n: 17, len: 17, w: 12, base: "#e6841a", tip: "#fbb72a", edge: "#ba620f" },
    { r: 26, n: 13, len: 15, w: 11, base: "#ee981e", tip: "#fdc93b", edge: "#c67312" },
    { r: 16, n: 9, len: 12, w: 9.5, base: "#f2a925", tip: "#ffd64d", edge: "#cd8416" },
  ];
  let defs = "";
  let s = "";
  rings.forEach((g, ri) => {
    defs += petalGrad(`ev-mg${ri}`, g.base, g.tip);
    if (ri) s += `<circle r="${g.r + 5}" fill="url(#ev-mg-shade)"/>`;
    for (let k = 0; k < g.n; k++) {
      const a = (360 / g.n) * k + (ri % 2 ? 180 / g.n : 0) + (R() - 0.5) * 7;
      const len = g.len * (0.9 + R() * 0.2);
      const w = g.w * (0.9 + R() * 0.2);
      s +=
        `<g transform="rotate(${f1(a)}) translate(0 ${f1(-(g.r - len))})">` +
        `<path d="${ruffle(len, w)}" fill="url(#ev-mg${ri})" stroke="${g.edge}" stroke-width="0.6" stroke-opacity="0.55"/>` +
        `<path d="M0 ${f1(-len * 0.18)}V${f1(-len * 0.72)}" stroke="${g.edge}" stroke-width="0.6" opacity="0.3"/></g>`;
    }
  });
  s += `<circle r="7" fill="url(#ev-mg-centre)"/>`;
  for (let k = 0; k < 9; k++) {
    const a = R() * Math.PI * 2;
    const d = R() * 5;
    s += `<circle cx="${f1(Math.cos(a) * d)}" cy="${f1(Math.sin(a) * d)}" r="0.8" fill="#c9780e" opacity="0.7"/>`;
  }
  return { defs, body: s };
}

/** Champa: five cream-white petals in a pinwheel, each overlapping the next, golden at the heart. */
function champa() {
  const petal = "M0 0C-13-6-27-20-25-37-23-52-3-58 10-51 22-44 22-28 14-16 9-9 4-4 0 0Z";
  let s = "";
  for (let k = 0; k < 5; k++) {
    s +=
      `<g transform="rotate(${k * 72 + 10})" filter="url(#ev-soft-shadow)">` +
      `<path d="${petal}" fill="url(#ev-champa-fill)" stroke="#e3d6b8" stroke-width="0.6"/>` +
      `<path d="M0-4C-4-16-6-30-2-44" fill="none" stroke="#efdcae" stroke-width="0.5" opacity="0.7"/></g>`;
  }
  s += `<circle r="4" fill="#e39a1b"/><circle r="1.6" fill="#c97d10"/>`;
  return { defs: "", body: s };
}

/** The flowers, repeating down the vine in this order. */
export const FLOWER_IDS = ["ev-marigold", "ev-champa"] as const;

/** Everything above, for one hidden <defs>. */
export const EVENT_ART_DEFS = (() => {
  const flowers = [marigold(), champa()];
  return SHARED + flowers.map((f, i) => `${f.defs}<g id="${FLOWER_IDS[i]}">${f.body}</g>`).join("");
})();
