/**
 * Original line-art of an Odia temple seen from the front: the curvilinear
 * rekha deula (tower) with amalaka, kalasa, Nilachakra and flag, and the
 * stepped pidha jagamohana with its doorway in front.
 *
 * The doorway (closed double door) is described by DOOR in the 400×560
 * viewBox — the opening animation zooms until it matches the close-up door.
 */
export const TEMPLE_VIEWBOX = { w: 400, h: 560 };
/** Doorway box in viewBox units; the arch peaks at 	op. */
export const DOOR = { cx: 200, top: 466, bottom: 520, width: 40 };
export const DOOR_Y = (DOOR.top + DOOR.bottom) / 2;

const PIDHA_TIERS: Array<[y: number, w: number]> = [
  [424, 236], [412, 224], [400, 212],
  [382, 196], [370, 184], [358, 172],
  [340, 156], [328, 144], [316, 132],
];
const KANTHI: Array<[y: number, w: number]> = [[391, 176], [349, 138]];

const SPOKES = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);

export function TempleArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${TEMPLE_VIEWBOX.w} ${TEMPLE_VIEWBOX.h}`}
      className={className}
      fill="none"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
    >
      <defs>
        <clipPath id="tmpl-deula">
          <path d="M104 440C104 320 116 215 148 150h104c32 65 44 170 44 290Z" />
        </clipPath>
        <clipPath id="tmpl-amalaka">
          <ellipse cx="200" cy="126" rx="58" ry="13" />
        </clipPath>
        <linearGradient id="tmpl-ground" x1="0" x2="1">
          <stop offset="0" style={{ stopColor: "rgb(var(--gold))", stopOpacity: 0 }} />
          <stop offset="0.5" style={{ stopColor: "rgb(var(--gold))" }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--gold))", stopOpacity: 0 }} />
        </linearGradient>
        <linearGradient id="tmpl-door" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "rgb(var(--sindoor))" }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--sindoor-dark))" }} />
        </linearGradient>
      </defs>

      <g className="fill-cream-light stroke-sindoor" strokeWidth="1.4">
        {/* ── Rekha deula ───────────────────────────── */}
        <path d="M104 440C104 320 116 215 148 150h104c32 65 44 170 44 290Z" />
        <g clipPath="url(#tmpl-deula)" className="stroke-gold" strokeWidth="0.8">
          {/* Pagas — vertical ribs following the curve */}
          <path d="M128 440c0-110 10-215 36-290M152 440c0-105 8-208 30-290M200 440V150M272 440c0-110-10-215-36-290M248 440c0-105-8-208-30-290" />
          {/* Bhumi bands */}
          <path d="M90 185h220M90 225h220M90 265h220M90 305h220" strokeDasharray="2 5" />
        </g>
        {/* Beki (neck) */}
        <rect x="160" y="138" width="80" height="12" rx="1" />
        {/* Amalaka */}
        <ellipse cx="200" cy="126" rx="58" ry="13" />
        <g clipPath="url(#tmpl-amalaka)" className="stroke-gold" strokeWidth="0.8">
          {Array.from({ length: 11 }, (_, i) => (
            <path key={i} d={`M${150 + i * 10} 112v28`} />
          ))}
        </g>
        {/* Khapuri + kalasa */}
        <path d="M166 113q34-22 68 0Z" />
        <ellipse cx="200" cy="92" rx="12" ry="9" />
        <path d="M195 84v-5h10v5" />
        <ellipse cx="200" cy="77" rx="9" ry="2.5" />
        {/* Nilachakra */}
        <circle cx="200" cy="58" r="13" />
        <g className="stroke-sindoor" strokeWidth="1">
          {SPOKES.map((a) => (
            <path
              key={a}
              d={`M${200 + Math.cos(a) * 3} ${58 + Math.sin(a) * 3}L${200 + Math.cos(a) * 13} ${58 + Math.sin(a) * 13}`}
            />
          ))}
        </g>
        <circle cx="200" cy="58" r="2.4" className="fill-sindoor" />
        {/* Flagpole + Patitapabana bana */}
        <path d="M200 45V6" />
        <path d="M200 8c20 2 36-2 52 6-14 4-30 8-52 10Z" className="fill-sindoor" />

        {/* ── Jagamohana (pidha deula) ──────────────── */}
        <path d="M150 308c0-28 30-40 50-42 20 2 50 14 50 42Z" />
        <ellipse cx="200" cy="260" rx="26" ry="6" />
        <ellipse cx="200" cy="249" rx="7" ry="6" />
        <path d="M200 243v-7" />
        <rect x="155" y="308" width="90" height="8" rx="1" />
        {KANTHI.map(([y, w]) => (
          <rect key={y} x={200 - w / 2} y={y} width={w} height="9" rx="1" />
        ))}
        {PIDHA_TIERS.map(([y, w]) => (
          <rect key={y} x={200 - w / 2} y={y} width={w} height="9" rx="1.5" />
        ))}

        {/* Bada (walls) with pilasters */}
        <rect x="92" y="436" width="216" height="84" />
        <path d="M112 436v84M140 436v84M260 436v84M288 436v84" className="stroke-gold" strokeWidth="0.8" />
        {/* Doorway */}
        <path d="M172 520v-46q28-30 56 0v46" className="stroke-gold" strokeWidth="0.9" />
        {/* Closed double door: matches the close-up door in the opening */}
        <path d="M180 520v-42q20-24 40 0v42Z" fill="url(#tmpl-door)" />
        <path d="M200 467v53" className="stroke-gold" strokeWidth="0.7" />
        <circle cx="197" cy="495" r="1" className="fill-gold" stroke="none" />
        <circle cx="203" cy="495" r="1" className="fill-gold" stroke="none" />

        {/* Platform and steps */}
        <rect x="56" y="520" width="288" height="12" />
        <rect x="40" y="532" width="320" height="10" />
      </g>

      {/* Horizon */}
      <path d="M0 548h400" stroke="url(#tmpl-ground)" strokeWidth="1" />
    </svg>
  );
}
