/**
 * Minimal Kalinga temple door, drawn in fine gold line on darkness:
 * stepped pidha crown with kalasha, the Navagraha (nine planets) frieze above
 * the lintel, a small lalatabimba niche, three carved door-jamb bands
 * (sakhas), threshold steps — and two studded door leaves that open.
 *
 * Every frame stroke has pathLength=1 so it can be "drawn in" by animating
 * stroke-dashoffset from 1 to 0 (see `.door-draw` in the opening).
 */
export const DOOR_VIEW = { w: 300, h: 470 };
/** The opening the two leaves fill, in viewBox units. */
export const DOOR_OPENING = { x: 70, y: 136, w: 160, h: 306 };

const LINE = "#D9B877";

export function DoorFrame({ className = "" }: { className?: string }) {
  const draw = { pathLength: 1, className: "door-draw" } as const;
  const niches = Array.from({ length: 9 }, (_, i) => 39 + i * 25);
  const lotusDots = Array.from({ length: 13 }, (_, i) => 120 + i * 25);
  const vine = (x: number) => {
    let d = `M${x} 126`;
    for (let y = 126; y < 438; y += 16) d += `q${y % 32 === 14 ? 5 : -5} 8 0 16`;
    return d;
  };

  return (
    <svg
      viewBox={`0 0 ${DOOR_VIEW.w} ${DOOR_VIEW.h}`}
      className={className}
      fill="none"
      stroke={LINE}
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Crown: kalasha, amalaka, stepped pidha tiers */}
      <circle cx="150" cy="10" r="4.5" {...draw} />
      <path d="M146 15h8l-1.5 5h-5Z" {...draw} />
      <ellipse cx="150" cy="25" rx="17" ry="4.5" {...draw} />
      <rect x="112" y="32" width="76" height="8" rx="1" {...draw} />
      <rect x="98" y="44" width="104" height="8" rx="1" {...draw} />
      <rect x="84" y="56" width="132" height="8" rx="1" {...draw} />

      {/* Navagraha frieze: nine planet niches */}
      <rect x="30" y="70" width="240" height="26" rx="1" {...draw} />
      {niches.map((x) => (
        <g key={x}>
          <path d={`M${x} 92V81q8-9 16 0v11`} {...draw} />
          <circle cx={x + 8} cy="86" r="2.4" {...draw} />
        </g>
      ))}

      {/* Lintel beam */}
      <rect x="24" y="96" width="252" height="10" rx="1" {...draw} />

      {/* Door jambs: outer, middle, inner sakha bands */}
      <path d="M30 442V106h240v336" {...draw} />
      <path d="M44 442V116h212v326" {...draw} />
      <path d="M58 442V126h184v316" {...draw} />
      {/* Lotus beads on the outer band, a creeper on the middle band */}
      {lotusDots.map((y) => (
        <g key={y}>
          <circle cx="37" cy={y} r="2.6" {...draw} />
          <circle cx="263" cy={y} r="2.6" {...draw} />
        </g>
      ))}
      <path d={vine(51)} {...draw} />
      <path d={vine(249)} {...draw} />

      {/* Lalatabimba: small niche at the centre of the lintel */}
      <path d="M138 126v-8q12-10 24 0v8" {...draw} />
      <circle cx="150" cy="119" r="2.8" {...draw} />

      {/* Threshold and steps */}
      <rect x="18" y="442" width="264" height="10" rx="1" {...draw} />
      <rect x="8" y="452" width="284" height="10" rx="1" {...draw} />
    </svg>
  );
}

/** One studded door leaf (80×306 units); `hinge` is the side it swings on. */
export function DoorLeaf({ hinge, className = "" }: { hinge: "left" | "right"; className?: string }) {
  const studs: Array<[number, number]> = [];
  for (const x of [24, 40, 56]) {
    for (let y = 32; y <= 120; y += 22) studs.push([x, y]);
    for (let y = 172; y <= 282; y += 22) studs.push([x, y]);
  }
  const ringX = hinge === "left" ? 70 : 10;

  return (
    <svg viewBox="0 0 80 306" className={className} preserveAspectRatio="none" aria-hidden>
      <rect x="0.6" y="0.6" width="78.8" height="304.8" fill="#0D0805" stroke={LINE} strokeWidth="1.1" />
      <rect x="11" y="14" width="58" height="124" fill="none" stroke={LINE} strokeWidth="0.8" opacity="0.8" />
      <rect x="11" y="154" width="58" height="140" fill="none" stroke={LINE} strokeWidth="0.8" opacity="0.8" />
      {studs.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill={LINE} opacity="0.85" />
      ))}
      <circle cx={ringX} cy="146" r="5.5" fill="none" stroke={LINE} strokeWidth="1" />
    </svg>
  );
}

/**
 * Mahaprabhu Jagannath's large round eyes with a gold tilak — the iconic,
 * reverent motif, drawn without the full face.
 */
export function JagannathEyes({ className = "" }: { className?: string }) {
  const eye = (cx: number) => (
    <g>
      <circle cx={cx} cy="92" r="64" fill="#140B07" />
      <circle cx={cx} cy="92" r="58" fill="#A72D32" />
      <circle cx={cx} cy="92" r="50" fill="#FFFBF2" />
      <circle cx={cx} cy="92" r="21" fill="#0B0705" />
      <circle cx={cx - 7} cy="85" r="4" fill="#FFFBF2" opacity="0.9" />
    </g>
  );
  return (
    <svg viewBox="0 0 300 170" className={className} role="img" aria-label="The eyes of Mahaprabhu Jagannath">
      {eye(78)}
      {eye(222)}
      {/* Tilak */}
      <path d="M150 6c9 22 9 46 0 70-9-24-9-48 0-70Z" fill="#E4B24C" stroke="#8C6D3A" strokeWidth="1.2" />
      <circle cx="150" cy="44" r="5.5" fill="#A72D32" />
    </svg>
  );
}
