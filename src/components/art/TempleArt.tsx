import { useId, type Ref } from "react";

/**
 * Original illustration of a Puri-style temple complex by the sea: the tall
 * rekha deula with Nilachakra and flag, the stepped pidha jagamohana in
 * front (whose door the opening zooms into), a smaller shrine, palms, a warm
 * sky and the shore.
 *
 * Drawn as three aligned layers sharing one viewBox, so the temple can rise
 * from behind the sand and sea:
 *   <SceneBack />    sky, clouds, greenery, palms
 *   <SceneTemple />  the temple complex (rises)
 *   <SceneFront />   sand and sea
 * Each fills its container with `xMidYMax slice`, like background-size: cover.
 */
export const SCENE = { w: 400, h: 760 };
/** The jagamohana doorway (closed double door), in viewBox units. */
export const DOOR = { cx: 200, top: 574, bottom: 628, width: 40 };

const svgProps = {
  viewBox: `0 0 ${SCENE.w} ${SCENE.h}`,
  preserveAspectRatio: "xMidYMax slice",
  className: "absolute inset-0 h-full w-full",
  "aria-hidden": true,
} as const;

// Sandstone / terracotta palette for the temple
const STONE = { lit: "#D99459", mid: "#BC6C38", shade: "#8E4523", line: "#6E2F15", ledge: "#F0B47E" };
const GOLD = { fill: "#D3AE63", line: "#8C6D3A" };

// ── Back: sky, clouds, greenery, palms ───────────────────────────

export function SceneBack() {
  const id = useId().replace(/:/g, "");
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E6BE95" />
          <stop offset="0.35" stopColor="#F0D8BC" />
          <stop offset="0.7" stopColor="#F6EADB" />
          <stop offset="1" stopColor="#F5EBDD" />
        </linearGradient>
        <radialGradient id={`sun-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF6E6" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#FCEBD2" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FCEBD2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`cloud-${id}`} cx="0.5" cy="0.6" r="0.6">
          <stop offset="0" stopColor="#FFFBF4" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFFBF4" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={SCENE.w} height={SCENE.h} fill={`url(#sky-${id})`} />
      <circle cx="210" cy="360" r="210" fill={`url(#sun-${id})`} />

      {/* Soft clouds */}
      <g fill={`url(#cloud-${id})`}>
        <ellipse cx="70" cy="190" rx="120" ry="48" />
        <ellipse cx="140" cy="160" rx="90" ry="40" />
        <ellipse cx="330" cy="250" rx="110" ry="44" />
        <ellipse cx="270" cy="220" rx="80" ry="34" />
        <ellipse cx="360" cy="420" rx="90" ry="34" />
        <ellipse cx="40" cy="430" rx="80" ry="30" />
      </g>
      <g fill="#E3B48A" opacity="0.28">
        <ellipse cx="90" cy="215" rx="110" ry="16" />
        <ellipse cx="320" cy="272" rx="95" ry="14" />
      </g>

      {/* Distant greenery */}
      <path d={bumps(0, 400, 600, 18, 9)} fill="#6E8552" />
      <path d={bumps(-10, 410, 612, 22, 11)} fill="#566C3E" />

      <Palm x={40} y={612} h={190} lean={-14} />
      <Palm x={92} y={616} h={140} lean={10} scale={0.8} />
      <Palm x={330} y={614} h={185} lean={12} />
      <Palm x={378} y={618} h={130} lean={-8} scale={0.75} />
    </svg>
  );
}

function bumps(x0: number, x1: number, base: number, step: number, amp: number) {
  let d = `M${x0} ${base + 20}V${base}`;
  for (let x = x0; x < x1; x += step) {
    const h = amp * (0.7 + (Math.abs(x * 37) % 10) / 22);
    d += `Q${x + step / 2} ${base - h * 2} ${x + step} ${base}`;
  }
  return `${d}V${base + 20}Z`;
}

function Palm({ x, y, h, lean, scale = 1 }: { x: number; y: number; h: number; lean: number; scale?: number }) {
  const tx = x + lean;
  const ty = y - h;
  const angles = [-175, -150, -125, -95, -60, -35, -8, 160, 20];
  const L = 62 * scale;
  const leaf = (ang: number, len: number, droop: number) => {
    const a = (ang * Math.PI) / 180;
    const ex = tx + Math.cos(a) * len;
    const ey = ty + Math.sin(a) * len + droop;
    const cx = tx + Math.cos(a) * len * 0.5;
    const cy = ty + Math.sin(a) * len * 0.5 - 16 * scale;
    return `M${tx} ${ty}Q${cx} ${cy} ${ex} ${ey}Q${cx} ${cy + 10 * scale} ${tx} ${ty + 2}Z`;
  };
  const trunk = `M${x} ${y}Q${x + lean * 0.2} ${y - h * 0.55} ${tx} ${ty}`;
  return (
    <g>
      <path d={trunk} stroke="#7B5A3A" strokeWidth={6 * scale} strokeLinecap="round" fill="none" />
      <path d={trunk} stroke="#5E432A" strokeWidth={6 * scale} strokeDasharray="1.2 7" fill="none" />
      {angles.map((ang, i) => (
        <path key={i} d={leaf(ang, L * (i % 3 === 1 ? 0.85 : 1), 22 * scale)} fill={i % 2 ? "#4C6838" : "#5E7D45"} />
      ))}
      <circle cx={tx - 3} cy={ty + 6} r={3.2 * scale} fill="#6A4A2C" />
      <circle cx={tx + 4} cy={ty + 7} r={3.2 * scale} fill="#7B5A3A" />
    </g>
  );
}

// ── Temple complex ───────────────────────────────────────────────

const DEULA = { cx: 152, base: 600, top: 236, baseW: 132, topW: 70 };
const JAGAMOHANA_TIERS: Array<[y: number, w: number]> = [
  [552, 176],
  [540, 164],
  [528, 152],
  [514, 140],
  [502, 128],
  [490, 116],
  [476, 104],
  [464, 92],
];

export function SceneTemple({ doorRef }: { doorRef?: Ref<SVGRectElement> }) {
  const id = useId().replace(/:/g, "");
  const g = (name: string) => `url(#${name}-${id})`;
  const { cx, base, top, baseW, topW } = DEULA;
  const body = `M${cx - baseW / 2} ${base}C${cx - baseW / 2} ${base - 160} ${cx - topW / 2 - 14} ${top + 70} ${cx - topW / 2} ${top}H${cx + topW / 2}C${cx + topW / 2 + 14} ${top + 70} ${cx + baseW / 2} ${base - 160} ${cx + baseW / 2} ${base}Z`;

  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id={`stone-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={STONE.lit} />
          <stop offset="0.45" stopColor={STONE.mid} />
          <stop offset="1" stopColor={STONE.shade} />
        </linearGradient>
        <linearGradient id={`tier-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E3A06A" />
          <stop offset="0.5" stopColor="#C97C46" />
          <stop offset="1" stopColor="#9A532B" />
        </linearGradient>
        <linearGradient id={`door-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "rgb(var(--sindoor))" }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--sindoor-dark))" }} />
        </linearGradient>
        <clipPath id={`deula-${id}`}>
          <path d={body} />
        </clipPath>
      </defs>

      <g stroke={STONE.line} strokeWidth="0.8" strokeLinejoin="round">
        {/* ── Bada deula (main tower) ── */}
        <path d={body} fill={g("stone")} />
        <g clipPath={`url(#deula-${id})`} fill="none">
          {[-48, -30, -12, 12, 30, 48].map((o) => (
            <path
              key={o}
              d={`M${cx + o * 1.05} ${base}C${cx + o} ${base - 170} ${cx + o * 0.62} ${top + 80} ${cx + o * 0.52} ${top}`}
              strokeOpacity="0.45"
            />
          ))}
          {Array.from({ length: 11 }, (_, i) => top + 22 + i * 30).map((y) => (
            <g key={y}>
              <path d={`M${cx - 80} ${y}h160`} stroke={STONE.ledge} strokeOpacity="0.55" strokeWidth="1.4" />
              <path d={`M${cx - 80} ${y + 2}h160`} strokeOpacity="0.35" />
            </g>
          ))}
        </g>
        {/* Beki, amalaka, kalasa, Nilachakra, flag */}
        <rect x={cx - 28} y={top - 10} width="56" height="10" fill={STONE.mid} />
        <ellipse cx={cx} cy={top - 20} rx="46" ry="12" fill={g("tier")} />
        {Array.from({ length: 9 }, (_, i) => cx - 36 + i * 9).map((x) => (
          <path key={x} d={`M${x} ${top - 30}v20`} strokeOpacity="0.4" />
        ))}
        <path d={`M${cx - 26} ${top - 30}q26-20 52 0Z`} fill={STONE.mid} />
        <ellipse cx={cx} cy={top - 52} rx="10" ry="8" fill={GOLD.fill} stroke={GOLD.line} />
        <path d={`M${cx - 5} ${top - 60}h10v-4h-10Z`} fill={GOLD.fill} stroke={GOLD.line} />
        <circle cx={cx} cy={top - 78} r="10" fill="none" stroke={GOLD.line} strokeWidth="1.6" />
        <circle cx={cx} cy={top - 78} r="10" fill="none" stroke={GOLD.fill} strokeWidth="0.9" />
        {Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4).map((a) => (
          <path key={a} d={`M${cx} ${top - 78}l${Math.cos(a) * 9} ${Math.sin(a) * 9}`} stroke={GOLD.line} strokeWidth="0.9" />
        ))}
        <path d={`M${cx} ${top - 88}V${top - 130}`} stroke="#5B3A22" strokeWidth="1.4" />
        <path d={`M${cx} ${top - 130}c14 2 26-2 38 5-10 4-22 7-38 8Z`} className="fill-sindoor" stroke="none" />
        <path d={`M${cx} ${top - 124}c10 1 18 0 26 3`} stroke="#E6A15E" strokeWidth="1" fill="none" />

        {/* ── Side shrine (right) ── */}
        <SmallShrine cx={318} base={628} id={id} />

        {/* ── Jagamohana (pidha deula) ── */}
        {JAGAMOHANA_TIERS.map(([y, w]) => (
          <g key={y}>
            <rect x={200 - w / 2} y={y} width={w} height="11" rx="2" fill={g("tier")} />
            <path d={`M${200 - w / 2 + 3} ${y + 1.5}h${w - 6}`} stroke={STONE.ledge} strokeOpacity="0.7" />
          </g>
        ))}
        <path d="M156 464c0-26 26-36 44-38 18 2 44 12 44 38Z" fill={g("tier")} />
        <ellipse cx="200" cy="422" rx="24" ry="6" fill={STONE.mid} />
        <ellipse cx="200" cy="410" rx="7" ry="6" fill={GOLD.fill} stroke={GOLD.line} />
        <path d="M200 404v-8" stroke={GOLD.line} />
        <circle cx="200" cy="394" r="2" fill={GOLD.fill} stroke={GOLD.line} />

        {/* Bada (walls) with pilasters */}
        <rect x="126" y="563" width="148" height="65" fill={g("stone")} />
        <path d="M142 563v65M162 563v65M238 563v65M258 563v65" strokeOpacity="0.5" />
        <path d="M126 572h148M126 618h148" stroke={STONE.ledge} strokeOpacity="0.5" strokeWidth="1.2" />
        {/* Door frame + closed double door (matches the close-up in the opening) */}
        <path d="M171 628v-48q29-31 58 0v48Z" fill={STONE.shade} />
        <path d="M172 628v-46q28-30 56 0v46" fill="none" stroke={GOLD.fill} strokeWidth="1" />
        <path d="M180 628v-42q20-24 40 0v42Z" fill={g("door")} />
        <path d="M200 575v53" stroke={GOLD.fill} strokeWidth="0.8" />
        <circle cx="197" cy="603" r="1.1" fill={GOLD.fill} stroke="none" />
        <circle cx="203" cy="603" r="1.1" fill={GOLD.fill} stroke="none" />
        {/* Measured by the opening to aim the zoom */}
        <rect
          ref={doorRef}
          x={DOOR.cx - DOOR.width / 2}
          y={DOOR.top}
          width={DOOR.width}
          height={DOOR.bottom - DOOR.top}
          fill="none"
          stroke="none"
        />

        {/* Platform and steps */}
        <rect x="70" y="628" width="300" height="12" fill={STONE.mid} />
        <rect x="58" y="640" width="324" height="12" fill={STONE.shade} />
        <path d="M70 629h300" stroke={STONE.ledge} strokeOpacity="0.6" />
      </g>
    </svg>
  );
}

function SmallShrine({ cx, base, id }: { cx: number; base: number; id: string }) {
  const tiers: Array<[number, number]> = [
    [base - 54, 84],
    [base - 64, 76],
    [base - 74, 68],
    [base - 84, 60],
    [base - 94, 52],
  ];
  return (
    <g>
      {tiers.map(([y, w]) => (
        <g key={y}>
          <rect x={cx - w / 2} y={y} width={w} height="9" rx="1.5" fill={`url(#tier-${id})`} />
          <path d={`M${cx - w / 2 + 2} ${y + 1.5}h${w - 4}`} stroke={STONE.ledge} strokeOpacity="0.6" />
        </g>
      ))}
      <path d={`M${cx - 24} ${base - 94}c0-18 14-26 24-28 10 2 24 10 24 28Z`} fill={`url(#tier-${id})`} />
      <ellipse cx={cx} cy={base - 124} rx="14" ry="4" fill={STONE.mid} />
      <ellipse cx={cx} cy={base - 132} rx="5" ry="4.5" fill={GOLD.fill} stroke={GOLD.line} />
      <path d={`M${cx} ${base - 137}v-6`} stroke={GOLD.line} />
      <rect x={cx - 38} y={base - 45} width="76" height="45" fill={`url(#stone-${id})`} />
      <path d={`M${cx - 26} ${base - 45}v45M${cx + 26} ${base - 45}v45`} strokeOpacity="0.5" />
      <path d={`M${cx - 9} ${base}v-22q9-10 18 0v22Z`} fill="#3A1C10" />
    </g>
  );
}

// ── Front: sand and sea ─────────────────────────────────────────

export function SceneFront() {
  const id = useId().replace(/:/g, "");
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id={`sand-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EBD3B0" />
          <stop offset="1" stopColor="#DDBB8E" />
        </linearGradient>
        <linearGradient id={`sea-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9C0BB" />
          <stop offset="1" stopColor="#7E9C9C" />
        </linearGradient>
      </defs>
      <path d="M0 660Q90 640 200 652T400 646V760H0Z" fill={`url(#sand-${id})`} />
      <path d="M0 662Q90 642 200 654T400 648" fill="none" stroke="#F6E6CC" strokeWidth="2" opacity="0.7" />
      {/* Sea with a curling wave */}
      <path d="M0 708C60 694 120 718 200 704S330 688 400 700V760H0Z" fill={`url(#sea-${id})`} />
      <path d="M0 708C60 694 120 718 200 704S330 688 400 700" fill="none" stroke="#FFF9F0" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
      <path d="M170 706c14-14 34-14 44-2-12-6-26-4-34 6" fill="#FFF9F0" opacity="0.9" />
      <path d="M0 732C80 722 150 742 240 728S350 720 400 730" fill="none" stroke="#FFF9F0" strokeWidth="2.5" opacity="0.6" />
    </svg>
  );
}

// ── Crows in the sky ─────────────────────────────────────────────

const FLOCK = [
  { left: 12, top: 12, size: 26, flap: 0.7, delay: 0 },
  { left: 24, top: 7, size: 18, flap: 0.6, delay: 0.2 },
  { left: 64, top: 14, size: 22, flap: 0.75, delay: 0.1 },
  { left: 76, top: 9, size: 16, flap: 0.55, delay: 0.35 },
  { left: 86, top: 19, size: 20, flap: 0.65, delay: 0.15 },
  { left: 40, top: 21, size: 14, flap: 0.5, delay: 0.3 },
];

/** A few crows gliding across the sky with flapping wings (opening only). */
export function Crows() {
  return (
    <div className="absolute inset-0">
      {FLOCK.map((b, i) => (
        <svg
          key={i}
          viewBox="0 0 32 14"
          className="absolute overflow-visible"
          style={{ left: `${b.left}%`, top: `${b.top}%`, width: b.size, height: (b.size * 14) / 32 }}
        >
          <path
            d="M1 7C6 1 11 1 14.5 6.5L16 8l1.5-1.5C21 1 26 1 31 7c-5-2.5-9-2-13.5 2.5L16 11l-1.5-1.5C10 5 6 4.5 1 7Z"
            fill="#2B2420"
            className="animate-flap"
            style={{ transformOrigin: "16px 8px", animationDuration: `${b.flap}s`, animationDelay: `${b.delay}s` }}
          />
        </svg>
      ))}
    </div>
  );
}
