/**
 * Stand-in for the couple illustration: original line art of the groom's and
 * bride's Odia wedding mukuts, joined by the hasta-ganthi thread.
 */
interface MukutProps {
  cx: number;
  base: number;
  hw: number; // half width
  h: number; // crest height above the band
}

const BAND = 14;

function crest(cx: number, top: number, hw: number, h: number) {
  const y = top; // band top
  return `M${cx - hw} ${y}C${cx - hw - 4} ${y - h * 0.45} ${cx - hw * 0.35} ${y - h * 0.8} ${cx} ${y - h}C${cx + hw * 0.35} ${y - h * 0.8} ${cx + hw + 4} ${y - h * 0.45} ${cx + hw} ${y}Z`;
}

function Mukut({ cx, base, hw, h }: MukutProps) {
  const top = base - BAND;
  const zig = Array.from({ length: 9 }, (_, i) => {
    const x = cx - hw + 4 + i * ((hw * 2 - 8) / 8);
    return `${x},${i % 2 ? top + 4 : top + 10}`;
  }).join(" ");

  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {/* Crest */}
      <path d={crest(cx, top, hw, h)} className="fill-gold/30 stroke-sindoor" strokeWidth="1.3" />
      <path d={crest(cx, top, hw * 0.84, h * 0.89)} className="stroke-gold" strokeWidth="2.6" strokeDasharray="0.1 7" />
      <path d={crest(cx, top, hw * 0.66, h * 0.76)} className="fill-cream-light stroke-gold" strokeWidth="0.9" />
      {/* Medallion */}
      <circle cx={cx} cy={top - h * 0.36} r={hw * 0.27} className="fill-gold/40 stroke-sindoor" strokeWidth="1" />
      <circle cx={cx} cy={top - h * 0.36} r={hw * 0.09} className="fill-sindoor" />
      <path d={`M${cx} ${top - h * 0.62}v${-h * 0.1}`} className="stroke-sindoor" strokeWidth="1" />
      {/* Finial */}
      <path d={`M${cx} ${top - h}v-6`} className="stroke-sindoor" strokeWidth="1.1" />
      <circle cx={cx} cy={top - h - 9} r="3" className="fill-sindoor" />
      {/* Band */}
      <rect x={cx - hw - 2} y={top} width={hw * 2 + 4} height={BAND} rx="3" className="fill-cream-light stroke-sindoor" strokeWidth="1.2" />
      <polyline points={zig} className="stroke-gold" strokeWidth="0.9" fill="none" />
      {/* Dangles */}
      {Array.from({ length: 7 }, (_, i) => {
        const x = cx - hw + 6 + i * ((hw * 2 - 12) / 6);
        return (
          <g key={i}>
            <path d={`M${x} ${base}v${i % 2 ? 7 : 10}`} className="stroke-gold" strokeWidth="0.8" />
            <circle cx={x} cy={base + (i % 2 ? 9 : 12)} r="1.6" className="fill-gold" />
          </g>
        );
      })}
    </g>
  );
}

export function MukutPair({ className = "" }: { className?: string }) {
  const groom = { cx: 80, base: 176, hw: 40, h: 118 };
  const bride = { cx: 186, base: 180, hw: 34, h: 100 };

  return (
    <svg
      viewBox="0 0 264 230"
      className={className}
      fill="none"
      role="img"
      aria-label="The groom's and bride's Odia wedding mukuts, joined by a sacred thread"
    >
      {/* Hasta-ganthi thread with its knot */}
      <path
        d={`M${groom.cx + groom.hw - 4} ${groom.base + 2}C${groom.cx + 40} ${groom.base + 40} ${bride.cx - 40} ${bride.base + 38} ${bride.cx - bride.hw + 4} ${bride.base + 2}`}
        className="stroke-sindoor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="133" cy="208" r="4.2" className="fill-cream stroke-sindoor" strokeWidth="1.2" />
      <path d="M131 212l-5 9M135 212l5 9" className="stroke-sindoor" strokeWidth="1" strokeLinecap="round" />

      <Mukut {...groom} />
      <Mukut {...bride} />
    </svg>
  );
}
