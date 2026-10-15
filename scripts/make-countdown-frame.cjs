// Writes public/art/countdown-frame.svg: the couple's bordered-paper frame,
// redrawn as a nine-slice for CSS border-image (slice 40 of a 120 box). The
// edge patterns repeat exactly every 20 units, so the frame tiles cleanly.
const fs = require("fs");
const BOX = 120;
const SLICE = 40;
const PERIOD = 20;
const BROWN = "#5E2B10";
const TERRA = "#C46A45";
const DOT = "#D08A68";

const f = (n) => +n.toFixed(2);
const out = [];

// Frame lines: thick outer rule, cream gap, inner rule
out.push(`<rect x="3" y="3" width="${BOX - 6}" height="${BOX - 6}" fill="none" stroke="${BROWN}" stroke-width="3.6"/>`);
out.push(`<rect x="9.5" y="9.5" width="${BOX - 19}" height="${BOX - 19}" fill="none" stroke="${BROWN}" stroke-width="3"/>`);

// Top and bottom: hanging curls (like the design's scallops) with a dot between
const curl = (cx, top, flip) => {
  const s = flip ? -1 : 1;
  const y0 = top;
  // two curls meeting at a small stem, hanging from the inner rule
  return `<path d="M${f(cx - 8)} ${y0} c0 ${5 * s} 5 ${6 * s} 6.4 ${2.2 * s} M${f(cx + 8)} ${y0} c0 ${5 * s} -5 ${6 * s} -6.4 ${2.2 * s} M${cx} ${y0} v${3 * s}" fill="none" stroke="${BROWN}" stroke-width="1.5" stroke-linecap="round"/>`;
};
for (let x = 30; x <= BOX - 30; x += PERIOD) {
  out.push(curl(x, 11.5, false));
  out.push(curl(x, BOX - 11.5, true));
  out.push(`<circle cx="${x + PERIOD / 2}" cy="18.5" r="1.1" fill="${DOT}"/>`);
  out.push(`<circle cx="${x + PERIOD / 2}" cy="${BOX - 18.5}" r="1.1" fill="${DOT}"/>`);
}

// Sides: a terracotta wave with dots on alternate sides
const wave = (x0, mirror) => {
  const pts = [];
  for (let y = 26; y <= BOX - 26; y += 1) {
    const x = x0 + (mirror ? -1 : 1) * 3.2 * Math.sin((2 * Math.PI * (y - SLICE)) / PERIOD);
    pts.push(`${f(x)} ${y}`);
  }
  return `<path d="M${pts.join(" L")}" fill="none" stroke="${TERRA}" stroke-width="1.3" stroke-linecap="round"/>`;
};
out.push(wave(19, false));
out.push(wave(BOX - 19, true));
// a dot in each hollow of the wave, on the inner side
for (let y = 35; y < BOX - 26; y += PERIOD) {
  out.push(`<circle cx="26.2" cy="${y}" r="1.5" fill="${DOT}"/>`);
  out.push(`<circle cx="${BOX - 26.2}" cy="${y}" r="1.5" fill="${DOT}"/>`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${BOX}" height="${BOX}" viewBox="0 0 ${BOX} ${BOX}">${out.join("")}</svg>\n`;
fs.writeFileSync(process.argv[2], svg);
console.log("wrote", process.argv[2], svg.length, "bytes");
