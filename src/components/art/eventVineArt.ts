/**
 * Artwork for the Wedding Events vine, as SVG markup: the shared gradients,
 * filters, leaf and petals, and three flowers drawn in a -60…60 box —
 * marigold, champa (frangipani) and lotus. Every id starts with "ev-".
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
<filter id="ev-vine-shadow" x="-10%" y="-5%" width="120%" height="110%"><feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#2d3a12" flood-opacity="0.26"/></filter>
<radialGradient id="ev-mg-shade"><stop offset="0.7" stop-color="#7a2e00" stop-opacity="0.4"/><stop offset="1" stop-color="#7a2e00" stop-opacity="0"/></radialGradient>
<radialGradient id="ev-mg-centre" cx="0.45" cy="0.4"><stop offset="0" stop-color="#ffe98a"/><stop offset="1" stop-color="#ee9c1c"/></radialGradient>
<radialGradient id="ev-champa-fill" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="58"><stop offset="0" stop-color="#eaa223"/><stop offset="0.17" stop-color="#f5c54c"/><stop offset="0.36" stop-color="#fce6b4"/><stop offset="0.6" stop-color="#fff8ea"/><stop offset="1" stop-color="#fffdf8"/></radialGradient>
<radialGradient id="ev-lotus-centre" cx="0.45" cy="0.4"><stop offset="0" stop-color="#fff0a0"/><stop offset="0.7" stop-color="#f5c43a"/><stop offset="1" stop-color="#dc9a17"/></radialGradient>
<linearGradient id="ev-leaf-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ac54c"/><stop offset="0.5" stop-color="#4f9130"/><stop offset="1" stop-color="#28601a"/></linearGradient>
<radialGradient id="ev-rose-fill" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#fcd7dc"/><stop offset="0.6" stop-color="#ef9caa"/><stop offset="1" stop-color="#d9687c"/></radialGradient>
<linearGradient id="ev-mari-fill" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e2700e"/><stop offset="1" stop-color="#ffb62e"/></linearGradient>
<g id="ev-leaf">
  <path d="M0 0C9-12 27-15 46 0 29 12 10 11 0 0Z" fill="url(#ev-leaf-fill)"/>
  <path d="M0 0C10 11 29 12 46 0" fill="none" stroke="#1f4a12" stroke-width="0.8" opacity="0.45"/>
  <path d="M1 0Q23-1.6 44 0" fill="none" stroke="#d8f0ab" stroke-width="1" stroke-linecap="round" opacity="0.75"/>
  <path d="M11-.5l6-6.5M21-.9l7-7M31-.8l6-5.5M11 .5l6 6M21 .9l6.5 6M31 .8l5.5 4.5" fill="none" stroke="#d2eba3" stroke-width="0.6" opacity="0.45"/>
  <ellipse cx="20" cy="-5.4" rx="10" ry="2.1" fill="#fff" opacity="0.3" transform="rotate(-7 20 -5.4)"/>
</g>
<g id="ev-petal-rose"><path d="M0-7C5-7 8-2 7 3 6 7 2 8 0 6-2 8-6 7-7 3-8-2-5-7 0-7Z" fill="url(#ev-rose-fill)"/></g>
<g id="ev-petal-mari"><path d="M0 7C-5 4-6-2-4-6Q-2-8 0-6.5 2-8 4-6C6-2 5 4 0 7Z" fill="url(#ev-mari-fill)"/></g>
<path id="ev-sparkle" d="M0-4L1-1 4 0 1 1 0 4-1 1-4 0-1-1Z" fill="#e3b345"/>`;

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
  const petal = "M0 0C-11-6-23-22-20-38-17-52 1-59 13-51 23-44 21-29 13-17 9-10 4-4 0 0Z";
  let s = "";
  for (let k = 0; k < 5; k++) {
    s +=
      `<g transform="rotate(${k * 72 + 10})" filter="url(#ev-soft-shadow)">` +
      `<path d="${petal}" fill="url(#ev-champa-fill)" stroke="#dcc497" stroke-width="0.7"/>` +
      `<path d="M0-4C-4-16-6-30-1-45" fill="none" stroke="#e7cf9c" stroke-width="0.8" opacity="0.8"/></g>`;
  }
  s += `<circle r="4" fill="#e39a1b"/><circle r="1.6" fill="#c97d10"/>`;
  return { defs: "", body: s };
}

/** Lotus: three rings of pointed pink petals around golden stamens and seed pod. */
function lotus() {
  const R = rng(29);
  const pointed = (len: number, w: number) =>
    `M0 0C${f1(-w / 2)} ${f1(-len * 0.3)} ${f1(-w / 2)} ${f1(-len * 0.72)} 0 ${f1(-len)}C${f1(w / 2)} ${f1(-len * 0.72)} ${f1(w / 2)} ${f1(-len * 0.3)} 0 0Z`;
  const rings = [
    { n: 10, len: 54, w: 25, rot: 0, base: "#fde6ec", tip: "#ea7c9f" },
    { n: 8, len: 42, w: 23, rot: 22.5, base: "#fff0f4", tip: "#e2608c" },
    { n: 6, len: 29, w: 18, rot: 0, base: "#fff4f7", tip: "#d6497a" },
  ];
  let defs = "";
  let s = "";
  rings.forEach((g, ri) => {
    defs += petalGrad(`ev-lt${ri}`, g.base, g.tip);
    s += `<g filter="url(#ev-soft-shadow)">`;
    for (let k = 0; k < g.n; k++) {
      const a = (360 / g.n) * k + g.rot + (R() - 0.5) * 5;
      const len = g.len * (0.95 + R() * 0.1);
      s +=
        `<g transform="rotate(${f1(a)})"><path d="${pointed(len, g.w)}" fill="url(#ev-lt${ri})" stroke="#c4466f" stroke-width="0.6" stroke-opacity="0.45"/>` +
        `<path d="M0-3V${f1(-len * 0.86)}M-3-5C${f1(-g.w * 0.3)} ${f1(-len * 0.4)} ${f1(-g.w * 0.22)} ${f1(-len * 0.66)} -1 ${f1(-len * 0.84)}M3-5C${f1(g.w * 0.3)} ${f1(-len * 0.4)} ${f1(g.w * 0.22)} ${f1(-len * 0.66)} 1 ${f1(-len * 0.84)}" fill="none" stroke="#d2668b" stroke-width="0.5" opacity="0.35"/></g>`;
    }
    s += `</g>`;
  });
  for (let k = 0; k < 20; k++) {
    const a = (k / 20) * Math.PI * 2;
    const c = Math.cos(a);
    const si = Math.sin(a);
    s +=
      `<path d="M${f1(c * 8)} ${f1(si * 8)}L${f1(c * 13)} ${f1(si * 13)}" stroke="#f0bd3c" stroke-width="0.9" stroke-linecap="round"/>` +
      `<circle cx="${f1(c * 13.4)}" cy="${f1(si * 13.4)}" r="0.9" fill="#d99a18"/>`;
  }
  s += `<circle r="9" fill="url(#ev-lotus-centre)" stroke="#c98a12" stroke-width="0.6"/>`;
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    s += `<circle cx="${f1(Math.cos(a) * 4.8)}" cy="${f1(Math.sin(a) * 4.8)}" r="1" fill="#b97d10" opacity="0.75"/>`;
  }
  s += `<circle r="1" fill="#b97d10" opacity="0.75"/>`;
  return { defs, body: s };
}

/** The flowers, repeating down the vine in this order. */
export const FLOWER_IDS = ["ev-marigold", "ev-champa", "ev-lotus"] as const;

/** Everything above, for one hidden <defs>. */
export const EVENT_ART_DEFS = (() => {
  const flowers = [marigold(), champa(), lotus()];
  return SHARED + flowers.map((f, i) => `${f.defs}<g id="${FLOWER_IDS[i]}">${f.body}</g>`).join("");
})();

/** Gold dust and a few twinkling sparkles around a flower (a -120…120 box: twice the flower). */
export function dustMarkup(i: number) {
  const R = rng(100 + i * 17);
  const colours = ["#c99a2e", "#e0b44a", "#b8862a"];
  let s = "";
  for (let k = 0; k < 64; k++) {
    const a = R() * Math.PI * 2;
    const d = 54 + Math.pow(R(), 1.7) * 62;
    s += `<circle cx="${f1(Math.cos(a) * d * 1.08)}" cy="${f1(Math.sin(a) * d * 0.94)}" r="${(0.45 + R() * 1.35).toFixed(2)}" fill="${colours[k % 3]}" opacity="${(0.3 + R() * 0.6).toFixed(2)}"/>`;
  }
  for (let k = 0; k < 6; k++) {
    const a = R() * Math.PI * 2;
    const d = 58 + R() * 40;
    s += `<use href="#ev-sparkle" class="ev-twinkle" x="${f1(Math.cos(a) * d)}" y="${f1(Math.sin(a) * d)}" style="animation-delay:${(-R() * 3.4).toFixed(2)}s"/>`;
  }
  return s;
}
