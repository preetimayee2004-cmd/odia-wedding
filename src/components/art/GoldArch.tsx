import { type CSSProperties, type ReactNode } from "react";

/**
 * A palace-arch frame for one gallery photograph, after the couple's design:
 * straight sides rising into a smooth pointed (ogee) top with a small gold
 * finial; a fine gold outline with a second hairline just inside, a wide
 * cream mat, and a deep maroon line round the photograph, which is cut to
 * the arch.
 *
 * Drawn in a 300-wide box: `height` is the frame's own height (360 or 440),
 * plus FINIAL above it. The photograph is HTML (so it keeps lazy loading, its
 * crop focus and the hover zoom), masked to the arch window.
 *
 * The frame itself never moves. `reveal`: "armed" holds the photograph
 * back until "play", when it comes into focus, from slightly blurred and a
 * little larger to sharp at its natural size (`.arch` in index.css; `delay`
 * staggers it). Without `reveal` it is simply shown.
 */

const W = 300;
const FINIAL = 18;
/** The cream mat, then the maroon line, then the photograph. */
const MAT_IN = 15;
const PHOTO_IN = 19.5;

const GOLD = "#C9A86A";
const GOLD_SOFT = "#DCC492";
const MAT = "#FBF4E6";
const MAROON = "#7A1424";

const f = (n: number) => n.toFixed(2);

/**
 * The arch outline, inset by `i` (frame coordinates: apex at y = 0). The top
 * is drawn once for the outer edge and pulled inward for each inset; the
 * pointed apex needs pulling down further than the shoulders.
 */
function archPath(i: number, h: number, dy = FINIAL, dx = 0) {
  const pt = (x: number, y: number) => {
    const t = 1 - Math.abs(x - 150) / 150;
    return `${f(150 + (x - 150) * ((150 - i) / 150) - dx)} ${f(y + i * (1 + 0.9 * t * t) + dy)}`;
  };
  // up the side, then a smooth swell into the pointed tip
  const left = [`C${pt(0, 50)} ${pt(58, 24)} ${pt(128, 11)}`, `C${pt(141, 8.5)} ${pt(147, 5)} ${pt(150, 0)}`];
  const right = [`C${pt(153, 5)} ${pt(159, 8.5)} ${pt(172, 11)}`, `C${pt(242, 24)} ${pt(300, 50)} ${pt(300, 104)}`];
  const bottom = f(h - i + dy);
  return `M${f(i - dx)} ${bottom}L${pt(0, 104)}${left.join("")}${right.join("")}L${f(W - i - dx)} ${bottom}Z`;
}

export function GoldArchFrame({ height, reveal, delay = 0, children }: { height: number; reveal?: "armed" | "play"; delay?: number; children: ReactNode }) {
  const total = height + FINIAL;

  // the photograph's window: its bounding box, and the arch as a mask within it
  const top = PHOTO_IN * 1.9; // the apex, pulled down
  const box = { x: PHOTO_IN, y: FINIAL + top, w: W - PHOTO_IN * 2, h: height - PHOTO_IN - top };
  const mask = `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(box.w)} ${f(box.h)}" preserveAspectRatio="none"><path d="${archPath(PHOTO_IN, height, FINIAL - box.y, PHOTO_IN)}"/></svg>`,
  )}")`;

  return (
    <div
      data-reveal={reveal}
      className="arch relative drop-shadow-[0_10px_14px_rgb(60_30_10/0.16)]"
      style={{ aspectRatio: `${W} / ${total}`, "--arch-delay": `${delay}ms` } as CSSProperties}
    >
      <div
        className="arch-window absolute overflow-hidden bg-[#EADFCB]"
        style={{
          left: `${(box.x / W) * 100}%`,
          width: `${(box.w / W) * 100}%`,
          top: `${(box.y / total) * 100}%`,
          height: `${(box.h / total) * 100}%`,
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
      >
        <div className="arch-zoom h-full w-full">{children}</div>
      </div>

      <svg viewBox={`0 0 ${W} ${total}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {/* the cream mat, with a fine gold outline and a second hairline inside it */}
        <path d={archPath(0, height) + archPath(MAT_IN, height)} fill={MAT} fillRule="evenodd" />
        <path d={archPath(0.6, height)} fill="none" stroke={GOLD} strokeWidth="1.2" />
        <path d={archPath(4, height)} fill="none" stroke={GOLD_SOFT} strokeWidth="0.7" />

        {/* the maroon line round the photograph */}
        <path d={archPath(MAT_IN, height) + archPath(PHOTO_IN, height)} fill={MAROON} fillRule="evenodd" />

        {/* a small gold finial at the apex */}
        <g transform={`translate(150 ${FINIAL})`} fill={GOLD}>
          <path d="M-4.5 0.5C-6.5-4-2.5-7.5 0-12 2.5-7.5 6.5-4 4.5 0.5Z" />
          <circle cx="0" cy="-14.5" r="1.6" />
          <path d="M-9 1.2h18" stroke={GOLD} strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}
