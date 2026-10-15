import { useId } from "react";
import { KonarkWheel } from "./KonarkWheel";

// The wax's uneven, poured edge: radius wobble per step around the disc.
const EDGE = [49, 47.5, 49.5, 48, 46.5, 49, 48.5, 47, 49.5, 48, 46.8, 49.2, 48.4, 47.2, 49.6, 48.1, 46.9, 48.8];

function blob() {
  const pts = EDGE.map((r, i) => {
    const a = (i / EDGE.length) * Math.PI * 2;
    return [50 + Math.cos(a) * r, 50 + Math.sin(a) * r];
  });
  // Smooth closed curve through the points (Catmull-Rom → cubic Bézier).
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    const p3 = pts[(i + 2) % pts.length];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}
const BLOB = blob();

/**
 * A Royal Seal: a pool of red sealing wax with an uneven poured edge, the
 * Konark wheel pressed into its raised centre. Seals the corner of the
 * Rajagya. Pass a position (`relative` or `absolute …`) and size in `className`.
 */
export function WaxSeal({ className = "" }: { className?: string }) {
  const id = useId();

  return (
    <span aria-hidden className={`block drop-shadow-[0_3px_4px_rgb(60_8_6/0.45)] ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id={`${id}-wax`} cx="0.38" cy="0.32" r="0.78">
            <stop offset="0" stopColor="#E0473C" />
            <stop offset="0.45" stopColor="#B3261E" />
            <stop offset="0.85" stopColor="#821410" />
            <stop offset="1" stopColor="#5E0B08" />
          </radialGradient>
          <radialGradient id={`${id}-well`} cx="0.6" cy="0.65" r="0.7">
            <stop offset="0" stopColor="#C3342A" />
            <stop offset="1" stopColor="#8A1912" />
          </radialGradient>
        </defs>
        <path d={BLOB} fill={`url(#${id}-wax)`} stroke="#5E0B08" strokeWidth="0.8" />
        {/* The pressed well, with a raised lip */}
        <circle cx="50" cy="50" r="37" fill={`url(#${id}-well)`} stroke="#E8685C" strokeOpacity="0.55" strokeWidth="1.6" />
        <circle cx="50" cy="50" r="38.6" fill="none" stroke="#4E0806" strokeOpacity="0.5" strokeWidth="0.8" />
        {/* Glossy highlight on the upper left of the wax */}
        <path d="M17 32A36 36 0 0 1 36 14" fill="none" stroke="#FFC2B8" strokeOpacity="0.55" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <KonarkWheel className="absolute inset-[17%] h-[66%] w-[66%] opacity-90" line="#5A0A07" fill="#A8231B" hub={44} />
    </span>
  );
}
