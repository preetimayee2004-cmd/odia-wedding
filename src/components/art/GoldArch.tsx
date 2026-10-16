import { useId, type ReactNode } from "react";

/**
 * A gilded palace-arch frame for one gallery photograph, after the couple's
 * design: straight sides, rounded shoulders and a pointed ogee top crowned by
 * a small gold finial; a bevelled gold moulding, a deep maroon line inside it,
 * and the photograph cut to the arch.
 *
 * Drawn in a 300-wide box: `height` is the frame's own height (360 or 440),
 * plus FINIAL above it. The photograph is HTML (so it keeps lazy loading, its
 * crop focus and the hover zoom), masked to the arch window.
 */

const W = 300;
const FINIAL = 26;
/** Gold moulding, then the maroon line, then the photograph. */
const GOLD_IN = 15;
const MAROON_IN = 21;
const PHOTO_IN = 21.5;

const f = (n: number) => n.toFixed(2);

/**
 * The arch outline, inset by `i` (frame coordinates: apex at y = 0). The top
 * is drawn once for the outer edge and pulled inward for each inset; a sharp
 * apex needs pulling down further than the shoulders.
 */
function archPath(i: number, h: number, dy = FINIAL, dx = 0) {
  const pt = (x: number, y: number) => {
    const t = 1 - Math.abs(x - 150) / 150;
    return `${f(150 + (x - 150) * ((150 - i) / 150) - dx)} ${f(y + i * (1 + 0.9 * t * t) + dy)}`;
  };
  const left = [
    // the shoulder: up the side, rounding in to a small cusp
    `C${pt(0, 88)} ${pt(6, 80)} ${pt(18, 78)}`,
    // the arch, bulging up and turning into the pointed tip
    `C${pt(22, 40)} ${pt(90, 18)} ${pt(138, 10)}`,
    `C${pt(144, 9)} ${pt(148, 5)} ${pt(150, 0)}`,
  ];
  const right = [`C${pt(152, 5)} ${pt(156, 9)} ${pt(162, 10)}`, `C${pt(210, 18)} ${pt(278, 40)} ${pt(282, 78)}`, `C${pt(294, 80)} ${pt(300, 88)} ${pt(300, 100)}`];
  const bottom = f(h - i + dy);
  return `M${f(i - dx)} ${bottom}L${pt(0, 100)}${left.join("")}${right.join("")}L${f(W - i - dx)} ${bottom}Z`;
}

export function GoldArchFrame({ height, children }: { height: number; children: ReactNode }) {
  const id = useId().replace(/:/g, "");
  const total = height + FINIAL;

  // the photograph's window: its bounding box, and the arch as a mask within it
  const top = PHOTO_IN * 1.9; // the apex, pulled down
  const box = { x: PHOTO_IN, y: FINIAL + top, w: W - PHOTO_IN * 2, h: height - PHOTO_IN - top };
  const mask = `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(box.w)} ${f(box.h)}" preserveAspectRatio="none"><path d="${archPath(PHOTO_IN, height, FINIAL - box.y, PHOTO_IN)}"/></svg>`,
  )}")`;

  return (
    <div className="relative drop-shadow-[0_12px_14px_rgb(60_30_10/0.28)]" style={{ aspectRatio: `${W} / ${total}` }}>
      <div
        className="absolute overflow-hidden bg-[#2B1A14]"
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
        {children}
      </div>

      <svg viewBox={`0 0 ${W} ${total}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FBE7A1" />
            <stop offset="0.3" stopColor="#D9A93F" />
            <stop offset="0.55" stopColor="#A87A26" />
            <stop offset="0.78" stopColor="#F2D27A" />
            <stop offset="1" stopColor="#B98A2E" />
          </linearGradient>
          <linearGradient id={`${id}-finial`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#A87A26" />
            <stop offset="0.45" stopColor="#FBE7A1" />
            <stop offset="1" stopColor="#9C6F20" />
          </linearGradient>
        </defs>

        {/* the gold moulding, with a lit outer edge and a shadowed inner one */}
        <path d={archPath(0, height) + archPath(GOLD_IN, height)} fill={`url(#${id}-gold)`} fillRule="evenodd" />
        <path d={archPath(0, height)} fill="none" stroke="#7E5A18" strokeWidth="1" />
        <path d={archPath(2, height)} fill="none" stroke="#FFF6D6" strokeOpacity="0.75" strokeWidth="1" />
        <path d={archPath(GOLD_IN - 1.5, height)} fill="none" stroke="#5E400E" strokeOpacity="0.55" strokeWidth="1.2" />

        {/* the maroon line, edged in fine gold toward the photograph */}
        <path d={archPath(GOLD_IN, height) + archPath(MAROON_IN, height)} fill="#6E1020" fillRule="evenodd" />
        <path d={archPath(MAROON_IN, height)} fill="none" stroke="#D9B65A" strokeWidth="1" />

        {/* the finial at the apex */}
        <g transform={`translate(150 ${FINIAL})`}>
          <path d="M-7 1C-10-6-4-11 0-17 4-11 10-6 7 1Z" fill={`url(#${id}-finial)`} stroke="#7E5A18" strokeWidth="0.8" />
          <ellipse cx="0" cy="1.2" rx="8.5" ry="2" fill={`url(#${id}-finial)`} stroke="#7E5A18" strokeWidth="0.7" />
          <path d="M0-17V-23" stroke="#9C6F20" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="0" cy="-24" r="1.7" fill={`url(#${id}-finial)`} stroke="#7E5A18" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
}
