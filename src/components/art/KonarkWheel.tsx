/**
 * The Konark Sun Temple wheel, as clean geometric line art: a beaded rim
 * band, eight broad spokes with carved medallions, eight slender spokes
 * between them, and an open hub (where the countdown numbers sit).
 * Also used, small and solid, as the motif of the Rajagya brass seal.
 */
const C = 150;

interface KonarkWheelProps {
  className?: string;
  /** Line colour. */
  line?: string;
  /** Fill for the broad spokes and rim band. */
  fill?: string;
  /** Hub radius in viewBox units (0–300 box). */
  hub?: number;
}

export function KonarkWheel({ className = "", line = "#C9A35E", fill = "#16110D", hub = 66 }: KonarkWheelProps) {
  const rimIn = 128;
  const rimOut = 142;
  const beads = Array.from({ length: 48 }, (_, i) => (i * 360) / 48);
  const majors = Array.from({ length: 8 }, (_, i) => i * 45);
  const minors = majors.map((a) => a + 22.5);

  // A broad spoke drawn pointing up, then rotated: tapers out from the hub,
  // swelling into a round medallion halfway along.
  const broad = `M${C - 8} ${C - hub}L${C - 11} ${C - rimIn}H${C + 11}L${C + 8} ${C - hub}Z`;
  const medallionY = C - (hub + rimIn) / 2;

  return (
    <svg viewBox="0 0 300 300" className={className} fill="none" stroke={line} strokeLinejoin="round" aria-hidden>
      {/* Rim: outer ring, beaded band, inner ring */}
      <circle cx={C} cy={C} r={rimOut + 4} strokeWidth="0.8" opacity="0.7" />
      <circle cx={C} cy={C} r={(rimIn + rimOut) / 2} stroke={fill} strokeWidth={rimOut - rimIn} />
      <circle cx={C} cy={C} r={rimOut} strokeWidth="1.4" />
      <circle cx={C} cy={C} r={rimIn} strokeWidth="1.4" />
      {beads.map((a) => (
        <circle
          key={a}
          cx={C}
          cy={C - (rimIn + rimOut) / 2}
          r="2"
          fill={line}
          stroke="none"
          transform={`rotate(${a} ${C} ${C})`}
        />
      ))}

      {/* Slender spokes with a bead at mid-length */}
      {minors.map((a) => (
        <g key={a} transform={`rotate(${a} ${C} ${C})`}>
          <path d={`M${C} ${C - hub}V${C - rimIn}`} strokeWidth="3.2" stroke={fill} />
          <path d={`M${C - 1.6} ${C - hub}V${C - rimIn}M${C + 1.6} ${C - hub}V${C - rimIn}`} strokeWidth="0.8" />
          <circle cx={C} cy={medallionY} r="3.6" fill={fill} strokeWidth="1" />
        </g>
      ))}

      {/* Broad spokes with carved medallions */}
      {majors.map((a) => (
        <g key={a} transform={`rotate(${a} ${C} ${C})`}>
          <path d={broad} fill={fill} strokeWidth="1.2" />
          <circle cx={C} cy={medallionY} r="13" fill={fill} strokeWidth="1.2" />
          <circle cx={C} cy={medallionY} r="8" strokeWidth="0.8" />
          {Array.from({ length: 8 }, (_, k) => (
            <path
              key={k}
              d={`M${C} ${medallionY - 8}l1.6 3.4-1.6 1.2-1.6-1.2Z`}
              fill={line}
              stroke="none"
              transform={`rotate(${k * 45} ${C} ${medallionY})`}
            />
          ))}
        </g>
      ))}

      {/* Hub rings */}
      <circle cx={C} cy={C} r={hub} fill={fill} strokeWidth="1.6" />
      <circle cx={C} cy={C} r={hub - 7} strokeWidth="0.8" opacity="0.8" />
    </svg>
  );
}
