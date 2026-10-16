import { EASE } from "@/lib/motion";

/** Gold blessing ornament that blooms open when the guest accepts. */
export function BlessingBloom({ open, className = "" }: { open: boolean; className?: string }) {
  const petals = 16;
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" aria-hidden>
      <g
        style={{
          transformOrigin: "60px 60px",
          transform: open ? "scale(1) rotate(0deg)" : "scale(0.35) rotate(-60deg)",
          opacity: open ? 1 : 0,
          transition: `transform 1200ms ${EASE.silk}, opacity 700ms ${EASE.silk}`,
        }}
      >
        {Array.from({ length: petals }, (_, i) => (
          <path
            key={i}
            d="M60 8c5 7 5 15 0 22-5-7-5-15 0-22Z"
            className={i % 2 ? "fill-gold/25 stroke-gold" : "fill-sindoor/15 stroke-gold"}
            strokeWidth="0.8"
            transform={`rotate(${(360 / petals) * i} 60 60)`}
          />
        ))}
        <circle cx="60" cy="60" r="26" className="stroke-gold" strokeWidth="0.8" />
        <circle cx="60" cy="60" r="21" className="stroke-gold/60" strokeWidth="2" strokeDasharray="0.1 5" strokeLinecap="round" />
        <circle cx="60" cy="60" r="5" className="fill-sindoor" />
      </g>
    </svg>
  );
}

const ARCH_MAROON = "#7A1424";
const ARCH_GOLD = "#C9A24D";
const LINE_GOLD = "#B08433";
const KALASH_FILL = "#FBF1DC";
const f1 = (n: number) => n.toFixed(1);

/** A point on a cubic Bézier, for placing motifs along the arch band. */
function bez(p: number[][], t: number) {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]);
}

/**
 * The RSVP welcome: a carved maroon palace arch picked out in gold — a cusped
 * opening, a dotted band with small gold flowers, a spire on top — and inside
 * it a gold line drawing of a kalash: mango leaves and a coconut bud over a
 * pot with a peacock on its belly.
 */
export function KalashArch({ className = "" }: { className?: string }) {
  // the cusped opening: lobes from the springing line up to an ogee tip, mirrored
  const lobes: Array<[number, number]> = [
    [46, 176],
    [58, 136],
    [84, 103],
    [116, 80],
    [138, 70],
  ];
  const arc = (a: [number, number], b: [number, number]) => {
    const r = Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.6;
    return `A${f1(r)} ${f1(r)} 0 0 1 ${f1(b[0])} ${f1(b[1])}`;
  };
  let inner = `M46 340V176`;
  for (let i = 1; i < lobes.length; i++) inner += arc(lobes[i - 1], lobes[i]);
  inner += `Q147 66 150 52Q153 66 162 70`;
  const right = lobes.map(([x, y]) => [300 - x, y] as [number, number]).reverse();
  for (let i = 1; i < right.length; i++) inner += arc(right[i - 1], right[i]);
  inner += `V340Z`;

  const outer = `M20 340V176C20 120 70 74 132 52Q146 46 150 30Q154 46 168 52C230 74 280 120 280 176V340Z`;
  const midLeft = [
    [33, 176],
    [33, 124],
    [78, 84],
    [140, 60],
  ];
  const mid = `M33 340V176C33 124 78 84 140 60Q148 56 150 44Q152 56 160 60C222 84 267 124 267 176V340`;

  // small gold flowers along the band
  let flowers = "";
  const flower = (x: number, y: number) =>
    [0, 90, 180, 270].map((a) => `<ellipse cx="${f1(x)}" cy="${f1(y - 3)}" rx="1.5" ry="2.8" transform="rotate(${a} ${f1(x)} ${f1(y)})" fill="${ARCH_GOLD}"/>`).join("") +
    `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.1" fill="#F6E3A8"/>`;
  for (let t = 0.12; t < 0.95; t += 0.16) {
    const [x, y] = bez(midLeft, t);
    flowers += flower(x, y) + flower(300 - x, y);
  }
  for (let y = 196; y < 330; y += 22) flowers += flower(33, y) + flower(267, y);

  // scallops round the pot's shoulder
  let scallops = "";
  for (let x = 114; x < 186; x += 8) scallops += `<path d="M${x} 247q4 6 8 0"/>`;
  let beads = "";
  for (let x = 110; x <= 190; x += 6) beads += `<circle cx="${x}" cy="${f1(295 + Math.pow((x - 150) / 40, 2) * -3)}" r="0.9" fill="${LINE_GOLD}" stroke="none"/>`;

  const leaf = "M0 0C-9-12-8-30 0-44 8-30 9-12 0 0Z";

  return (
    <svg viewBox="0 0 300 340" className={className} aria-hidden>
      <defs>
        <radialGradient id="rsvp-arch-glow" cx="0.5" cy="0.62" r="0.6">
          <stop offset="0" stopColor="#FFFDF6" />
          <stop offset="1" stopColor="#FBF1DC" />
        </radialGradient>
      </defs>
      {/* the opening, softly lit */}
      <path d={inner} fill="url(#rsvp-arch-glow)" />
      {/* the carved band */}
      <path d={outer + inner} fill={ARCH_MAROON} fillRule="evenodd" />
      <path d={outer} fill="none" stroke={ARCH_GOLD} strokeWidth="1.6" />
      <path d={inner} fill="none" stroke={ARCH_GOLD} strokeWidth="1.6" />
      <path d={mid} fill="none" stroke={ARCH_GOLD} strokeWidth="2" strokeDasharray="0.1 6" strokeLinecap="round" opacity="0.8" />
      <g dangerouslySetInnerHTML={{ __html: flowers }} />
      {/* the spire */}
      <path d="M150 30C144 22 146 14 150 6 154 14 156 22 150 30Z" fill={ARCH_GOLD} />
      <circle cx="150" cy="4" r="2" fill={ARCH_GOLD} />
      {/* plinths */}
      <path d="M14 330h44v10H14ZM242 330h44v10h-44Z" fill={ARCH_MAROON} stroke={ARCH_GOLD} strokeWidth="1.2" />

      {/* the kalash, in gold line */}
      <g fill={KALASH_FILL} stroke={LINE_GOLD} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {/* mango leaves, fanning from the rim */}
        {[-68, -36, 36, 68, -8, 8].map((a) => (
          <g key={a} transform={`translate(150 208) rotate(${a})`}>
            <path d={leaf} />
            <path d="M0-3V-40" fill="none" strokeWidth="0.8" />
          </g>
        ))}
        {/* the coconut bud */}
        <path d="M150 150C166 170 168 188 150 206 132 188 134 170 150 150Z" />
        <path d="M150 158C157 172 158 186 150 200M150 158C143 172 142 186 150 200" fill="none" strokeWidth="0.8" />
        {/* rim, neck, belly, foot */}
        <ellipse cx="150" cy="212" rx="22" ry="4.5" />
        <path d="M136 231C140 224 140 218 134 214H166C160 218 160 224 164 231Z" />
        <path d="M134 314C104 304 98 262 118 240 124 234 130 232 136 231H164C170 232 176 234 182 240 202 262 196 304 166 314Z" />
        <path d="M128 326H172L166 314H134Z" />
        <path d="M110 252C130 258 170 258 190 252M104 290C128 298 172 298 196 290" fill="none" />
        <g fill="none" strokeWidth="1" dangerouslySetInnerHTML={{ __html: scallops }} />
        <g dangerouslySetInnerHTML={{ __html: beads }} />
        {/* a peacock on the belly */}
        <g transform="translate(150 260)" strokeWidth="1.1">
          <path d="M4 26C2 18 4 10 8 7 11 5 14 7 13 9L16 9.8 13 10.8C11 12 10 18 11 26Z" />
          <path d="M3 26C3 31 15 32 19 28 21 25 17 23 11 25" />
          <path d="M19 28C27 27 33 20 30 10M19 27C26 24 28 17 25 10" fill="none" />
          <circle cx="29" cy="12" r="1.6" fill={LINE_GOLD} stroke="none" />
          <circle cx="25.5" cy="11.5" r="1.3" fill={LINE_GOLD} stroke="none" />
          <path d="M9 5 7 1M10 5 10 .5M11 5.5 13 1.5" fill="none" strokeWidth="0.7" />
        </g>
        {/* and a small lotus beside it */}
        <g transform="translate(128 278)" strokeWidth="1">
          <path d="M0-12C4-7 4-2 0 2-4-2-4-7 0-12Z" />
          <path d="M0 2C-5 1-9-3-10-8-5-7-2-4 0 2ZM0 2C5 1 9-3 10-8 5-7 2-4 0 2Z" />
        </g>
      </g>
    </svg>
  );
}

/** The Accept button's plaque: a maroon cartouche edged in gold, with a small kalash finial. */
export function AcceptPlaque({ className = "" }: { className?: string }) {
  const shape = "M42 18H278Q296 18 304 32Q294 53 304 74Q296 88 278 88H42Q24 88 16 74Q26 53 16 32Q24 18 42 18Z";
  return (
    <svg viewBox="0 0 320 92" className={className} aria-hidden>
      <defs>
        <linearGradient id="rsvp-plaque" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9B2430" />
          <stop offset="1" stopColor="#6E1020" />
        </linearGradient>
      </defs>
      <path d={shape} fill="url(#rsvp-plaque)" stroke={ARCH_GOLD} strokeWidth="2" />
      <path d={shape} fill="none" stroke={ARCH_GOLD} strokeWidth="0.8" opacity="0.8" transform="translate(160 53) scale(0.93 0.82) translate(-160 -53)" />
      {/* curls at the notched ends */}
      <g fill="none" stroke={ARCH_GOLD} strokeWidth="1" strokeLinecap="round">
        <path d="M30 40c6 2 8 8 4 13s-10 3-9-2 6-5 7-1M30 66c6-2 8-8 4-13" />
        <path d="M290 40c-6 2-8 8-4 13s10 3 9-2-6-5-7-1M290 66c-6-2-8-8-4-13" />
      </g>
      {/* the kalash finial */}
      <g fill={ARCH_GOLD}>
        <path d="M152 18H168L165 13H155Z" />
        <path d="M155 13C150 11 150 5 160 4 170 5 170 11 165 13Z" />
        <path d="M160 4C156 1 157-2 160-4 163-2 164 1 160 4Z" />
      </g>
    </svg>
  );
}
