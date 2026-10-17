import { useId, type ReactNode } from "react";

const GOLD = "#B8893A";
const MAROON = "#8C1C24";
const LEAF = "#6F9150";
const STEM = "#557A3B";

export type SeparatorEmblem = "bud" | "marigold" | "pattachitra" | "gold" | "lotus" | "chakra" | "pin" | "maroon";

/**
 * The separator between two sections: one small, quiet system, so the page
 * reads as a single invitation. Two kinds of line — antique-gold hairlines
 * fading outward, or a thin green vine with tiny leaves — around one small
 * central emblem: a flower (a bud, a marigold with leaves, a Pattachitra
 * rosette, a gold floret, or a maroon bloom with leaves), a lotus, a Konark
 * chakra, or a map pin. `petals` lets a few petals drift down into it.
 *
 * It sits on the seam between sections, eating into their padding rather
 * than adding space (`pull`), above their backgrounds and below the side
 * bands; it's decorative only.
 */
export function SectionSeparator({
  emblem,
  line = "gold",
  petals = false,
  pull = "center",
  className = "",
}: {
  emblem: SeparatorEmblem;
  line?: "gold" | "vine";
  petals?: boolean;
  /** Overlap both neighbours' padding (center), only the one above (up), the one below (down), or neither. */
  pull?: "center" | "up" | "down" | "none";
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const margin = { center: "-my-5", up: "-mt-10", down: "-mb-10", none: "" }[pull];

  return (
    <div aria-hidden className={`pointer-events-none relative z-[2] flex h-10 items-center justify-center ${margin} ${className}`}>
      <svg viewBox="0 0 240 40" className="h-10 w-[15rem] max-w-[76%] overflow-visible">
        <defs>
          {/* user-space gradients: a flat line has no height for a bounding-box gradient */}
          <linearGradient id={`${id}-l`} gradientUnits="userSpaceOnUse" x1="8" y1="20" x2="98" y2="20">
            <stop offset="0" stopColor={GOLD} stopOpacity="0" />
            <stop offset="1" stopColor={GOLD} />
          </linearGradient>
          <linearGradient id={`${id}-r`} gradientUnits="userSpaceOnUse" x1="142" y1="20" x2="232" y2="20">
            <stop offset="0" stopColor={GOLD} />
            <stop offset="1" stopColor={GOLD} stopOpacity="0" />
          </linearGradient>
        </defs>
        {line === "gold" ? <GoldLines id={id} /> : <VineLines />}
        {petals && <Petals />}
        <g transform="translate(120 20)">{EMBLEMS[emblem]}</g>
      </svg>
    </div>
  );
}

/** Antique-gold hairlines fading outward, with a dot near the emblem on each side. */
function GoldLines({ id }: { id: string }) {
  return (
    <g>
      <path d="M8 20H98" stroke={`url(#${id}-l)`} strokeWidth="0.9" strokeLinecap="round" />
      <path d="M142 20H232" stroke={`url(#${id}-r)`} strokeWidth="0.9" strokeLinecap="round" />
      <circle cx="102" cy="20" r="1.1" fill={GOLD} />
      <circle cx="138" cy="20" r="1.1" fill={GOLD} />
    </g>
  );
}

/** A tiny leaf pointing along +x, base at the origin. */
const leaf = (x: number, y: number, deg: number, s = 1) => (
  <g transform={`translate(${x} ${y}) rotate(${deg}) scale(${s})`}>
    <path d="M0 0C3-3 8-4 13 0 8 3 3 3 0 0Z" fill={LEAF} />
    <path d="M1 0H11.5" stroke="#E2EFC8" strokeWidth="0.35" />
  </g>
);

/** A thin green vine on each side, gently waving, with tiny paired leaves and a curl at its end. */
function VineLines() {
  const half = (
    <g>
      <path d="M100 21C88 17 78 25 64 22S40 15 26 20C20 22 16 26 19 29 21 31 24 29 22 27" fill="none" stroke={STEM} strokeWidth="1.1" strokeLinecap="round" />
      {leaf(82, 21, -150, 0.85)}
      {leaf(80, 21, 150, 0.75)}
      {leaf(50, 19, -160, 0.8)}
      {leaf(48, 19, 160, 0.7)}
    </g>
  );
  return (
    <g>
      {half}
      <g transform="matrix(-1 0 0 1 240 0)">{half}</g>
    </g>
  );
}

/** A few petals drifting down toward the emblem. */
function Petals() {
  return (
    <g>
      <ellipse cx="98" cy="2" rx="2.2" ry="1.3" transform="rotate(-30 98 2)" fill="#EF8FA6" opacity="0.75" />
      <ellipse cx="108" cy="7" rx="2" ry="1.2" transform="rotate(20 108 7)" fill="#F59A1B" opacity="0.8" />
      <ellipse cx="135" cy="4" rx="2" ry="1.2" transform="rotate(40 135 4)" fill="#EF8FA6" opacity="0.7" />
    </g>
  );
}

/** A fine gold scroll either side of a centred emblem, `gap` from its centre. */
const scrolls = (gap: number) => (
  <g fill="none" stroke={GOLD} strokeWidth="0.8" strokeLinecap="round">
    <path d={`M-${gap} 0C-${gap + 4} -4 -${gap + 9} -3 -${gap + 9} 0S-${gap + 5} 3 -${gap + 4} 1`} />
    <path d={`M${gap} 0C${gap + 4} -4 ${gap + 9} -3 ${gap + 9} 0S${gap + 5} 3 ${gap + 4} 1`} />
  </g>
);

const ring = (n: number, el: (deg: number, i: number) => ReactNode) => Array.from({ length: n }, (_, i) => el((360 / n) * i, i));

const EMBLEMS: Record<SeparatorEmblem, ReactNode> = {
  // a tiny floral bud on a green stem, where the vine meets
  bud: (
    <g>
      <path d="M0 9V1" stroke={STEM} strokeWidth="1" strokeLinecap="round" />
      <path d="M0 1C-3-1-3.5-6 0-10 3.5-6 3-1 0 1Z" fill="#F7D46E" stroke="#C9952A" strokeWidth="0.45" />
      <path d="M0 1C-2.4 1-4-.6-4.4-2.8M0 1C2.4 1 4-.6 4.4-2.8" fill="none" stroke={STEM} strokeWidth="0.8" strokeLinecap="round" />
      {leaf(0, 6, 200, 0.55)}
      {leaf(0, 6, -20, 0.55)}
    </g>
  ),
  // a small orange marigold with two delicate leaves and a fine curl
  marigold: (
    <g>
      {leaf(-6, 2, 170, 0.75)}
      {leaf(6, 2, 10, 0.75)}
      {scrolls(17)}
      {ring(12, (deg, i) => (
        <circle key={deg} cx={(Math.cos((deg * Math.PI) / 180) * 4.4).toFixed(2)} cy={(Math.sin((deg * Math.PI) / 180) * 4.4).toFixed(2)} r="2.5" fill={i % 2 ? "#F08A0E" : "#F7A21B"} stroke="#B4520C" strokeWidth="0.3" />
      ))}
      <circle r="2.6" fill="#E36B0A" />
      <circle cx="-0.7" cy="-0.7" r="0.9" fill="#FFD36A" />
    </g>
  ),
  // a symmetrical Pattachitra rosette: maroon petals, gold heart and dots
  pattachitra: (
    <g>
      {scrolls(12)}
      {ring(8, (deg) => (
        <ellipse key={deg} cx="0" cy="-4.6" rx="2" ry="4.2" transform={`rotate(${deg})`} fill={deg % 90 ? `${MAROON}99` : MAROON} />
      ))}
      <circle r="2.4" fill={GOLD} />
      <circle r="1" fill="#F3E4C9" />
      {ring(4, (deg) => (
        <circle key={deg} cx="0" cy="-10.5" r="0.9" fill={GOLD} transform={`rotate(${deg + 45})`} />
      ))}
    </g>
  ),
  // a tiny gold floret
  gold: (
    <g>
      {ring(4, (deg) => (
        <ellipse key={deg} cx="0" cy="-3.4" rx="1.8" ry="3.4" transform={`rotate(${deg})`} fill={GOLD} />
      ))}
      <circle r="1.3" fill="#F3E4C9" />
      <circle cx="-8" cy="0" r="0.9" fill={GOLD} />
      <circle cx="8" cy="0" r="0.9" fill={GOLD} />
    </g>
  ),
  // a small lotus, for blessings
  lotus: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0-11C3.6-6.5 3.6-1.5 0 3-3.6-1.5-3.6-6.5 0-11Z" fill={`${MAROON}26`} stroke={MAROON} strokeWidth="1" />
      <path d="M0 3C-4.6 2.4-8.4-0.6-9.2-5 -4.8-4.4-1.6-1.6 0 3ZM0 3C4.6 2.4 8.4-0.6 9.2-5 4.8-4.4 1.6-1.6 0 3Z" stroke={MAROON} strokeWidth="1" />
      <path d="M-4 5.2C-9 5.2-13 3-15-0.6M4 5.2C9 5.2 13 3 15-0.6" stroke={MAROON} strokeWidth="0.8" opacity="0.7" />
      <path d="M-9 8H9" stroke={GOLD} strokeWidth="0.9" />
      <circle cy="-2" r="0.9" fill={GOLD} stroke="none" />
    </g>
  ),
  // a miniature Konark chakra: maroon rim, gold spokes and beads
  chakra: (
    <g>
      <circle r="9" fill="#F3E4C9" stroke={MAROON} strokeWidth="1.3" />
      <circle r="6.6" fill="none" stroke={GOLD} strokeWidth="0.6" />
      {ring(8, (deg) => (
        <path key={deg} d="M0-2.2V-6.6" stroke={GOLD} strokeWidth="0.8" transform={`rotate(${deg})`} />
      ))}
      {ring(8, (deg) => (
        <circle key={`b${deg}`} cx="0" cy="-7.8" r="0.55" fill={GOLD} transform={`rotate(${deg + 22.5})`} />
      ))}
      <circle r="2" fill={MAROON} />
    </g>
  ),
  // a tiny map pin where the route ends, on a pair of leaves
  pin: (
    <g>
      {leaf(-1, 9, 200, 0.6)}
      {leaf(1, 9, -20, 0.6)}
      <path d="M0-11a6 6 0 0 0-6 6C-6-.6 0 7 0 7S6-.6 6-5a6 6 0 0 0-6-6Z" fill={MAROON} />
      <circle cy="-5.2" r="2.2" fill="#F3E4C9" />
      <circle cy="-5.2" r="1" fill={GOLD} />
    </g>
  ),
  // a small maroon bloom with two leaves: the closing signature
  maroon: (
    <g>
      {leaf(-5, 3, 160, 0.8)}
      {leaf(5, 3, 20, 0.8)}
      {ring(6, (deg) => (
        <ellipse key={deg} cx="0" cy="-3.6" rx="2.3" ry="3.6" transform={`rotate(${deg})`} fill={MAROON} />
      ))}
      <circle r="1.9" fill={GOLD} />
    </g>
  ),
};
