import { useId } from "react";

const W = 360;
const COUNT = 13;
/** The twine's droop: y at x, a shallow curve from end to end. */
const droop = (x: number) => 5 + 34 * (x / W) * (1 - x / W);

/**
 * A toran of mango leaves and marigolds, hung across the top of the Wishing
 * Wall: a twine drooping gently from side to side, with marigolds and pairs
 * of mango leaves in turn along it and a short strand of marigolds at each
 * end. Soft, watercolour-like fills, drawn to the section's full width.
 */
export function Toran({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const items = Array.from({ length: COUNT }, (_, i) => {
    const x = ((i + 0.5) / COUNT) * W;
    return { x, y: droop(x), kind: i % 2 === 0 ? "flower" : "leaves" };
  });

  return (
    <svg viewBox={`0 0 ${W} 72`} className={className} aria-hidden>
      <defs>
        <radialGradient id={`${id}m`} cx="0.42" cy="0.38" r="0.7">
          <stop offset="0" stopColor="#FFD983" />
          <stop offset="0.55" stopColor="#F5A332" />
          <stop offset="1" stopColor="#DE7716" />
        </radialGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A9C878" />
          <stop offset="1" stopColor="#5C8A3A" />
        </linearGradient>
      </defs>

      <g opacity="0.92">
        {/* the twine */}
        <path d={`M0 ${droop(0)}Q${W / 2} ${droop(W / 2) * 2 - droop(0)} ${W} ${droop(W)}`} fill="none" stroke="#A9783A" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />

        {/* a strand of marigolds at each end */}
        {[9, W - 9].map((x) => (
          <g key={x}>
            <path d={`M${x} ${droop(x)}V${droop(x) + 46}`} stroke="#A9783A" strokeWidth="0.8" opacity="0.7" />
            {[14, 27, 40].map((dy, k) => (
              <Marigold key={dy} x={x} y={droop(x) + dy} r={5.2 - k * 0.5} fill={`url(#${id}m)`} />
            ))}
          </g>
        ))}

        {items.map(({ x, y, kind }) =>
          kind === "flower" ? (
            <Marigold key={x} x={x} y={y + 7} r={6.6} fill={`url(#${id}m)`} />
          ) : (
            <g key={x} transform={`translate(${x} ${y})`}>
              <MangoLeaf angle={14} fill={`url(#${id}l)`} />
              <MangoLeaf angle={-14} fill={`url(#${id}l)`} />
            </g>
          ),
        )}
      </g>
    </svg>
  );
}

/** A marigold: a soft orange ball with a ring of ruffled petals. */
function Marigold({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={fill} />
      <circle r={r} fill="none" stroke="#C9650F" strokeWidth="0.6" strokeDasharray="1.6 1.4" opacity="0.55" />
      <circle r={r * 0.55} fill="none" stroke="#D9761A" strokeWidth="0.5" strokeDasharray="1.2 1.2" opacity="0.5" />
      <circle cx={-r * 0.3} cy={-r * 0.35} r={r * 0.28} fill="#FFE7A8" opacity="0.6" />
    </g>
  );
}

/** A mango leaf hanging from the twine, tilted by `angle` degrees. */
function MangoLeaf({ angle, fill }: { angle: number; fill: string }) {
  return (
    <g transform={`rotate(${angle})`}>
      <path d="M0 0C5 6 6.5 15 4.5 22 3 26 1 29 0 31-1 29-3 26-4.5 22-6.5 15-5 6 0 0Z" fill={fill} opacity="0.95" />
      <path d="M0 2V29" stroke="#E6F0C4" strokeWidth="0.6" opacity="0.7" strokeLinecap="round" />
    </g>
  );
}
