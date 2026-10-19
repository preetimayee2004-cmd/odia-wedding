import { useId, type ReactNode } from "react";

const DARK = "#6E4612";
const SHINE = "#FFF3C4";
/** Where each corner sits, and how the top-left design is flipped for it. */
const CORNERS = ["left-[-5px] top-[-5px]", "right-[-5px] top-[-5px] -scale-x-100", "bottom-[-5px] left-[-5px] -scale-y-100", "bottom-[-5px] right-[-5px] -scale-100"];
const SIDES = ["left-[-6px]", "right-[-6px] -scale-x-100"];

/**
 * A carved gold frame, after the couple's design: a gilded band with a row
 * of beads, acanthus scrolls at the corners, C-scrolls at the middle of each
 * side and below, and a golden lotus on top. The band is CSS (`.gold-frame`),
 * so the frame grows with its contents; the ornaments are fixed-size SVGs
 * pinned to it, sized to keep the frame compact.
 */
export function GoldFrame({ children, className = "", panelClassName = "" }: { children: ReactNode; className?: string; panelClassName?: string }) {
  return (
    <div className={`gold-frame ${className}`}>
      <div className={`gold-frame-panel ${panelClassName}`}>{children}</div>
      <Ornament box="0 0 120 46" className="left-1/2 top-[-31px] h-[41px] w-[108px] -translate-x-1/2">
        {lotus}
      </Ornament>
      {CORNERS.map((at) => (
        <Ornament key={at} box="0 0 48 48" className={`h-9 w-9 ${at}`}>
          {corner}
        </Ornament>
      ))}
      {SIDES.map((at) => (
        <Ornament key={at} box="0 0 20 56" className={`top-1/2 h-[42px] w-[15px] -translate-y-1/2 ${at}`}>
          {sideScroll}
        </Ornament>
      ))}
      <Ornament box="0 0 76 22" className="bottom-[-6px] left-1/2 h-[17px] w-[58px] -translate-x-1/2">
        {bottomScroll}
      </Ornament>
    </div>
  );
}

/** An SVG with its own gold gradient; its drawing gets the gradient's url for the gilding. */
function Ornament({ box, className, children }: { box: string; className: string; children: (g: string) => ReactNode }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox={box} className={`pointer-events-none absolute overflow-visible ${className}`} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F8E5A4" />
          <stop offset="0.5" stopColor="#DDB052" />
          <stop offset="1" stopColor="#A6742A" />
        </linearGradient>
      </defs>
      {children(`url(#${id})`)}
    </svg>
  );
}

/** A carved scroll: a dark edge, the gilt, and a fine highlight down its middle. */
function Tube({ d, g, w = 3.4 }: { d: string; g: string; w?: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={DARK} strokeWidth={w + 1.6} />
      <path d={d} stroke={g} strokeWidth={w} />
      <path d={d} stroke={SHINE} strokeWidth={0.7} opacity={0.75} />
    </g>
  );
}

/** A gilt leaf or petal with a dark edge. */
function Leaf({ d, g }: { d: string; g: string }) {
  return <path d={d} fill={g} stroke={DARK} strokeWidth={0.9} strokeLinejoin="round" />;
}

/** Top-left corner (flipped for the others): a boss with three leaves, and a scroll along each arm. */
function corner(g: string) {
  return (
    <>
      <Tube g={g} d="M18 12C24 6 32 5 38 8 43 10.5 44 16 40 17.5 37 18.5 35.5 15.5 37.5 14" />
      <Tube g={g} d="M12 18C6 24 5 32 8 38 10.5 43 16 44 17.5 40 18.5 37 15.5 35.5 14 37.5" />
      <Leaf g={g} d="M24 7C27 3 32 2 35 4 32 5.5 28 6.5 24 7Z" />
      <Leaf g={g} d="M7 24C3 27 2 32 4 35 5.5 32 6.5 28 7 24Z" />
      <Leaf g={g} d="M14 14C10 10 9 5 11 1 14 5 15 9 14 14Z" />
      <Leaf g={g} d="M14 14C10 10 5 9 1 11 5 14 9 15 14 14Z" />
      <Leaf g={g} d="M14 14C8 13 3 9 2 3 8 4 12 8 14 14Z" />
      <circle cx="14" cy="14" r="3.8" fill={g} stroke={DARK} strokeWidth="0.9" />
      <path d="M14 12.2A1.8 1.8 0 1 1 12.4 14.6" fill="none" stroke={DARK} strokeWidth="0.7" strokeLinecap="round" />
    </>
  );
}

/** The middle of the left side (mirrored for the right): two C-scrolls around a bead. */
function sideScroll(g: string) {
  return (
    <>
      <Tube g={g} d="M14 6C6 9 2 17 6 23 8.5 26.5 13 25 12 21.5" />
      <Tube g={g} d="M14 50C6 47 2 39 6 33 8.5 29.5 13 31 12 34.5" />
      <ellipse cx="6" cy="28" rx="3" ry="4.4" fill={g} stroke={DARK} strokeWidth="0.9" />
    </>
  );
}

/** Below the bottom edge: two scrolls curling away from a small shell. */
function bottomScroll(g: string) {
  return (
    <>
      <Tube g={g} d="M36 9C30 17 20 19 15 14 11.5 10.5 15 6 18.5 8.5" />
      <Tube g={g} d="M40 9C46 17 56 19 61 14 64.5 10.5 61 6 57.5 8.5" />
      <Leaf g={g} d="M38 4C42 9 42 15 38 20 34 15 34 9 38 4Z" />
    </>
  );
}

/** The lotus crowning the frame, between two scrolls along the top edge. */
function lotus(g: string) {
  return (
    <>
      <Tube g={g} d="M6 40C14 33 24 32 32 37 36 39.5 35 44 31.5 43" />
      <Tube g={g} d="M114 40C106 33 96 32 88 37 84 39.5 85 44 88.5 43" />
      <Leaf g={g} d="M60 40C42 42 30 36 24 28 36 26 50 31 60 40Z" />
      <Leaf g={g} d="M60 40C78 42 90 36 96 28 84 26 70 31 60 40Z" />
      <Leaf g={g} d="M60 40C46 40 36 32 33 21 44 22 55 29 60 40Z" />
      <Leaf g={g} d="M60 40C74 40 84 32 87 21 76 22 65 29 60 40Z" />
      <Leaf g={g} d="M60 40C52 34 47 24 49 12 56 18 60 28 60 40Z" />
      <Leaf g={g} d="M60 40C68 34 73 24 71 12 64 18 60 28 60 40Z" />
      <Leaf g={g} d="M60 3C67 13 68 27 60 40 52 27 53 13 60 3Z" />
      <path d="M60 9V35M53 22C55 28 57 33 59 38M67 22C65 28 63 33 61 38" fill="none" stroke={SHINE} strokeWidth="0.7" opacity="0.8" strokeLinecap="round" />
      <Leaf g={g} d="M30 41C40 36 52 36 60 40 68 36 80 36 90 41 80 45 40 45 30 41Z" />
    </>
  );
}
