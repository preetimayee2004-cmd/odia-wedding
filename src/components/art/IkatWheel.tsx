/**
 * A round Sambalpuri-ikat medallion (pasapali checks and phula motifs) in
 * red, black and white, with a plain cream disc at its heart for the
 * countdown. 400-unit box, drawn as crisp vector.
 */
const C = 200;
const RED = "#C21B20";
const BLACK = "#170707";
const WHITE = "#FFF8EE";
const RIM = "#2E0B08";
const DISC = "#FBF6EC";

const polar = (r: number, deg: number): [number, number] => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
};
const n = (v: number) => +v.toFixed(2);

/** A ring segment between two radii and two angles. */
function wedge(r0: number, r1: number, a0: number, a1: number) {
  const [x0, y0] = polar(r1, a0);
  const [x1, y1] = polar(r1, a1);
  const [x2, y2] = polar(r0, a1);
  const [x3, y3] = polar(r0, a0);
  return `M${n(x0)} ${n(y0)}A${r1} ${r1} 0 0 1 ${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}A${r0} ${r0} 0 0 0 ${n(x3)} ${n(y3)}Z`;
}

const SEGMENTS = 16;
const SEG = 360 / SEGMENTS;
const BEADS = 56;
const TEETH = 36;

/** The radius of the cream disc, as a fraction of the whole (for overlays). */
export const IKAT_DISC = 111 / 400;

export function IkatWheel({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden>
      {/* Rims and the beaded band */}
      <circle cx={C} cy={C} r={199} fill={RIM} />
      <circle cx={C} cy={C} r={194.5} fill={RED} />
      <circle cx={C} cy={C} r={190} fill={BLACK} />
      {Array.from({ length: BEADS }, (_, i) => (
        <path
          key={i}
          d="M0 -4.4L4.4 0L0 4.4L-4.4 0Z"
          fill={i % 2 ? RED : WHITE}
          transform={`rotate(${(i * 360) / BEADS} ${C} ${C}) translate(${C} ${C - 182})`}
        />
      ))}

      {/* The main ring: red and black segments, checks and phula */}
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <path key={i} d={wedge(129, 174, i * SEG - SEG / 2, i * SEG + SEG / 2)} fill={i % 2 ? BLACK : RED} stroke={WHITE} strokeWidth="1.4" />
      ))}
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <g key={i} transform={`rotate(${i * SEG} ${C} ${C}) translate(${C} ${C - 151.5}) scale(1.4)`}>
          {i % 2 === 0 ? (
            // pasapali: a diamond of four white checks around a red heart
            <g fill={WHITE}>
              {[
                [0, -8],
                [8, 0],
                [0, 8],
                [-8, 0],
              ].map(([x, y]) => (
                <path key={`${x}${y}`} d={`M${x} ${y - 5.2}L${x + 5.2} ${y}L${x} ${y + 5.2}L${x - 5.2} ${y}Z`} />
              ))}
            </g>
          ) : (
            // phula: a fleur of three petals over a band, with a red eye
            <g fill={WHITE}>
              <path d="M0 -13C3.2 -9 3.2 -3.5 0 0.5C-3.2 -3.5 -3.2 -9 0 -13Z" />
              <path d="M-1.2 0.6C-6 0.4 -9.6 -3 -8.6 -7.2C-7.8 -9.8 -4.4 -9.2 -4.6 -6.6C-4.8 -4 -3 -1.6 -1.2 0.6Z" />
              <path d="M1.2 0.6C6 0.4 9.6 -3 8.6 -7.2C7.8 -9.8 4.4 -9.2 4.6 -6.6C4.8 -4 3 -1.6 1.2 0.6Z" />
              <rect x="-5" y="1.2" width="10" height="2.4" rx="0.6" />
              <path d="M-2.6 3.6L0 8.2L2.6 3.6Z" />
              <path d="M0 -6.4L1.6 -4.4L0 -2.4L-1.6 -4.4Z" fill={RED} />
            </g>
          )}
        </g>
      ))}

      {/* The inner band: white teeth pointing in, on black */}
      <circle cx={C} cy={C} r={128.5} fill={BLACK} />
      {Array.from({ length: TEETH }, (_, i) => {
        const a = (i * 360) / TEETH;
        const [x0, y0] = polar(127.5, a - 360 / TEETH / 2 + 0.6);
        const [x1, y1] = polar(127.5, a + 360 / TEETH / 2 - 0.6);
        const [xt, yt] = polar(115, a);
        return <path key={i} d={`M${n(x0)} ${n(y0)}L${n(x1)} ${n(y1)}L${n(xt)} ${n(yt)}Z`} fill={WHITE} />;
      })}
      {Array.from({ length: TEETH }, (_, i) => {
        const [x, y] = polar(124, (i + 0.5) * (360 / TEETH));
        return <circle key={i} cx={n(x)} cy={n(y)} r="1.6" fill={RED} />;
      })}
      <circle cx={C} cy={C} r={113.5} fill="none" stroke={RED} strokeWidth="2.5" />

      {/* The cream disc for the countdown */}
      <circle cx={C} cy={C} r={111} fill={DISC} />
      <circle cx={C} cy={C} r={108} fill="none" stroke="#E7D6BA" strokeWidth="1" />
    </svg>
  );
}
