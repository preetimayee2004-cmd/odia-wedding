import { useId, type CSSProperties } from "react";

/**
 * Ultra-minimal golden line art: two hands joined in Pranam, their outline
 * the shape of a closed lotus bud, holding a single Tulsi leaf at the
 * fingertips. Every stroke uses pathLength=1 so the drawing traces itself
 * in (`drawn`): hands first, then the leaf.
 */
export function PranamHands({
  className = "",
  color = "#D9B877",
  drawn = true,
  duration = 2600,
}: {
  className?: string;
  color?: string;
  drawn?: boolean;
  duration?: number;
}) {
  const id = useId();
  const draw = (delay: number, ms = duration): CSSProperties => ({
    strokeDasharray: 1,
    strokeDashoffset: drawn ? 0 : 1,
    transition: `stroke-dashoffset ${ms}ms cubic-bezier(0.45, 0, 0.2, 1) ${delay}ms`,
  });
  const leafDelay = duration * 0.7;

  const hand = (
    <>
      {/* Outer edge: fingertips, palm, wrist, forearm */}
      <path pathLength={1} style={draw(0)} d="M60 48C57 51.5 54.2 55.5 52.2 59.5C51.4 61 50 61.6 49.2 63C46.6 67.5 44.4 72.5 42.6 77.5C42 79 40.8 79.8 40.2 81.4C37.4 89 35.4 99 35.2 109C35 117 35.6 122 37.5 127C39.5 135 43 141 44.5 149C46 160 43 175 35 191" />
      {/* Fingers lying one behind another, like petals */}
      <path pathLength={1} style={draw(250, duration * 0.6)} d="M51.6 60.6C49.2 69 47.4 79 46.6 90" />
      <path pathLength={1} style={draw(400, duration * 0.6)} d="M42 79.5C40.8 86 40.2 93 40.2 100" />
      {/* Thumb resting along the seam */}
      <path pathLength={1} style={draw(550, duration * 0.7)} d="M47 141C48.2 129 51 117.5 54.8 108.5C56 105.6 58.6 105 59.4 107.4" />
      {/* Heel of the palm into the inner forearm, with a bangle */}
      <path pathLength={1} style={draw(700, duration * 0.7)} d="M60 108V138C58.5 155 56 172 52 191" />
      <path pathLength={1} style={draw(900, duration * 0.5)} d="M44.9 152C49.5 154.4 54.6 154.8 59.3 153.2" opacity="0.8" />
    </>
  );

  return (
    <svg viewBox="0 0 120 194" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-fade`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.78" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="194">
          <rect width="120" height="194" fill={`url(#${id}-fade)`} />
        </mask>
      </defs>

      <g stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <g mask={`url(#${id}-mask)`}>
          {/* Where the palms press together */}
          <path pathLength={1} style={draw(150, duration * 0.8)} d="M60 50V107" opacity="0.75" />
          {hand}
          <g transform="translate(120 0) scale(-1 1)">{hand}</g>
        </g>

        {/* The Tulsi leaf, held at the fingertips */}
        <g transform="rotate(16 60 48)">
          <path
            pathLength={1}
            style={{
              ...draw(leafDelay, duration * 0.8),
              fill: color,
              fillOpacity: drawn ? 0.16 : 0,
              transition: `${draw(leafDelay, duration * 0.8).transition}, fill-opacity 1200ms ease ${leafDelay + duration * 0.6}ms`,
            }}
            d="M60 47.5C52 40 49 27 52.6 16.5C54.6 10.8 57.6 7 60 4C62.4 7 65.4 10.8 67.4 16.5C71 27 68 40 60 47.5Z"
          />
          <path pathLength={1} style={draw(leafDelay + 300, duration * 0.6)} d="M60 50V9" />
          <path
            pathLength={1}
            style={draw(leafDelay + 500, duration * 0.5)}
            d="M60 37L54.4 31.4M60 37L65.6 31.4M60 28L55.2 23M60 28L64.8 23M60 19.5L56.8 15.6M60 19.5L63.2 15.6"
            strokeWidth="0.9"
          />
        </g>
      </g>
    </svg>
  );
}
