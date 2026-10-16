import type { CSSProperties } from "react";

const GOLD = "#C9A24D";
const f1 = (n: number) => n.toFixed(1);

/**
 * The offering of gua, after the couple's design: a brass thali heaped with
 * betel nuts, marigolds and rose petals on its rim, two lit diyas beside it,
 * over a faint white mandala. The flames flicker (`.dipa-flame`, index.css).
 */
export function GuaThali({ className = "" }: { className?: string }) {
  // the mandala behind
  let mandala = "";
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * 360;
    mandala += `<path d="M150 22C158 36 158 52 150 62 142 52 142 36 150 22Z" transform="rotate(${a} 150 112)"/>`;
    mandala += `<circle cx="150" cy="14" r="2" transform="rotate(${a + 11.25} 150 112)"/>`;
  }

  // rose petals round the rim
  let petals = "";
  const roses = ["#E8577A", "#F18FA8", "#C9284A"];
  for (let k = 0; k < 15; k++) {
    const t = (k / 15) * Math.PI * 2 + 0.2;
    const x = 140 + Math.cos(t) * 95;
    const y = 124 + Math.sin(t) * 54;
    const deg = (Math.atan2(Math.cos(t) * 54, -Math.sin(t) * 95) * 180) / Math.PI;
    petals += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="6.5" ry="3.6" transform="rotate(${f1(deg)} ${f1(x)} ${f1(y)})" fill="${roses[k % 3]}" stroke="#9E1F3A" stroke-width="0.4"/>`;
  }

  // the heap of gua, back rows first
  let nuts = "";
  const rows: Array<[number, number, number]> = [
    [96, 6, 0], // y, count, x offset
    [104, 7, -7],
    [113, 8, 0],
    [122, 8, -7],
    [131, 7, 0],
  ];
  rows.forEach(([y, n, dx]) => {
    for (let i = 0; i < n; i++) {
      const x = 140 - ((n - 1) * 15) / 2 + i * 15 + dx + ((i * 7) % 3) - 1;
      nuts += `<g transform="translate(${f1(x)} ${y})"><ellipse rx="9" ry="7.4" fill="url(#gua-nut)" stroke="#4E2A10" stroke-width="0.6"/><path d="M-5-2c2-3 6-3 9-1M-6 2c3-1 7-1 11 1" fill="none" stroke="#5A3214" stroke-width="0.5" opacity="0.6"/><ellipse cx="-3" cy="-3" rx="3" ry="1.6" fill="#E3B27C" opacity="0.55"/></g>`;
    }
  });
  nuts += `<g transform="translate(140 88)"><ellipse rx="9" ry="7.4" fill="url(#gua-nut)" stroke="#4E2A10" stroke-width="0.6"/><ellipse cx="-3" cy="-3" rx="3" ry="1.6" fill="#E3B27C" opacity="0.55"/></g>`;

  // marigolds tucked into the heap
  const marigold = (x: number, y: number, r: number) => {
    let s = "";
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      s += `<circle cx="${f1(x + Math.cos(a) * r * 0.62)}" cy="${f1(y + Math.sin(a) * r * 0.62)}" r="${f1(r * 0.42)}" fill="${k % 2 ? "#F08A0E" : "#F7A21B"}" stroke="#B4520C" stroke-width="0.4"/>`;
    }
    return s + `<circle cx="${x}" cy="${y}" r="${f1(r * 0.42)}" fill="#E36B0A"/><circle cx="${f1(x - r * 0.15)}" cy="${f1(y - r * 0.15)}" r="${f1(r * 0.16)}" fill="#FFD36A"/>`;
  };
  const flowers = marigold(92, 104, 11) + marigold(108, 92, 10) + marigold(186, 106, 10) + marigold(178, 136, 9);

  const diya = (x: number, y: number, s: number, delay: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="27" cy="-14" r="22" fill="url(#gua-glow)" className="dipa-glow" style={{ animationDelay: `${-delay}ms` }} />
      <path d="M-24 0C-21 13 21 14 25 1L33-4C27-7 17-5 12-4 1-7-14-7-24 0Z" fill="url(#gua-brass)" stroke="#6E4A12" strokeWidth="0.8" />
      <path d="M-22 0C-14-4 4-5 12-3" fill="none" stroke="#FBE7A1" strokeWidth="1" opacity="0.7" />
      <path d="M27-5C22-11 23-18 27-26 31-18 32-11 27-5Z" fill="url(#gua-flame)" className="dipa-flame" style={{ animationDelay: `${-delay}ms` }} />
      <path d="M27-7C25-10 25-14 27-18 29-14 29-10 27-7Z" fill="#FFF6C8" className="dipa-flame" style={{ animationDelay: `${-delay}ms` }} />
    </g>
  );

  return (
    <svg viewBox="0 0 300 210" className={className} aria-hidden>
      <defs>
        <linearGradient id="gua-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F6DC8E" />
          <stop offset="0.45" stopColor="#C9962B" />
          <stop offset="1" stopColor="#8F6420" />
        </linearGradient>
        <radialGradient id="gua-well" cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#F3D27A" />
          <stop offset="1" stopColor="#B8862B" />
        </radialGradient>
        <radialGradient id="gua-nut" cx="0.38" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#B9783F" />
          <stop offset="1" stopColor="#6B3E1C" />
        </radialGradient>
        <linearGradient id="gua-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E6BE5A" />
          <stop offset="1" stopColor="#9A6B1E" />
        </linearGradient>
        <linearGradient id="gua-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#F07A12" />
          <stop offset="1" stopColor="#FFD84A" />
        </linearGradient>
        <radialGradient id="gua-glow">
          <stop offset="0" stopColor="#FFE9A8" stopOpacity="0.8" />
          <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
        </radialGradient>
        <filter id="gua-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* the mandala */}
      <g fill="none" stroke="#fff" strokeWidth="1.1" opacity="0.75">
        <circle cx="150" cy="112" r="98" />
        <circle cx="150" cy="112" r="90" strokeDasharray="1 4" />
        <g dangerouslySetInnerHTML={{ __html: mandala }} />
      </g>

      {/* the thali */}
      <ellipse cx="142" cy="136" rx="106" ry="58" fill="#5A3210" opacity="0.28" filter="url(#gua-soft)" />
      <ellipse cx="140" cy="124" rx="104" ry="60" fill="url(#gua-rim)" stroke="#7E5A18" strokeWidth="0.8" />
      <ellipse cx="140" cy="124" rx="98" ry="56.5" fill="none" stroke="#FBE7A1" strokeWidth="0.8" opacity="0.6" />
      <ellipse cx="140" cy="124" rx="94" ry="54" fill="none" stroke="#7E5A18" strokeWidth="1.2" strokeDasharray="0.1 4" strokeLinecap="round" />
      <ellipse cx="140" cy="122" rx="84" ry="47" fill="url(#gua-well)" stroke="#7E5A18" strokeWidth="0.8" />
      <ellipse cx="140" cy="122" rx="77" ry="42.5" fill="none" stroke="#8F6420" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.7" />
      <g dangerouslySetInnerHTML={{ __html: petals + nuts + flowers }} />

      {/* two lit diyas */}
      {diya(220, 182, 1.25, 0)}
      {diya(262, 158, 1.02, 700)}
    </svg>
  );
}

/** The Accept button's plaque: a maroon cartouche edged in gold, with a small kalash finial. */
export function AcceptPlaque({ className = "" }: { className?: string }) {
  const shape = "M42 18H278Q296 18 304 32Q294 53 304 74Q296 88 278 88H42Q24 88 16 74Q26 53 16 32Q24 18 42 18Z";
  return (
    <svg viewBox="0 0 320 92" className={className} aria-hidden>
      <defs>
        <linearGradient id="rsvp-plaque" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9B2430" />
          <stop offset="1" stopColor="#6E1020" />
        </linearGradient>
      </defs>
      <path d={shape} fill="url(#rsvp-plaque)" stroke={GOLD} strokeWidth="2" />
      <path d={shape} fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.8" transform="translate(160 53) scale(0.93 0.82) translate(-160 -53)" />
      {/* curls at the notched ends */}
      <g fill="none" stroke={GOLD} strokeWidth="1" strokeLinecap="round">
        <path d="M30 40c6 2 8 8 4 13s-10 3-9-2 6-5 7-1M30 66c6-2 8-8 4-13" />
        <path d="M290 40c-6 2-8 8-4 13s10 3 9-2-6-5-7-1M290 66c-6-2-8-8-4-13" />
      </g>
      {/* the kalash finial */}
      <g fill={GOLD}>
        <path d="M152 18H168L165 13H155Z" />
        <path d="M155 13C150 11 150 5 160 4 170 5 170 11 165 13Z" />
        <path d="M160 4C156 1 157-2 160-4 163-2 164 1 160 4Z" />
      </g>
    </svg>
  );
}

/**
 * The confirmation seal: a pink lotus blooms, a gold ring draws itself round
 * it, a red circle pops up in its heart and a white tick is drawn — while
 * marigold and rose petals scatter outward. `play` starts it; `still` shows
 * the finished seal at once (reduced motion). Styles: `.lc` in index.css.
 */
export function LotusConfirm({ play, still = false, className = "" }: { play: boolean; still?: boolean; className?: string }) {
  const petal = (len: number, w: number) =>
    `M0 0C${f1(-w / 2)} ${f1(-len * 0.35)} ${f1(-w / 2)} ${f1(-len * 0.75)} 0 ${f1(-len)}C${f1(w / 2)} ${f1(-len * 0.75)} ${f1(w / 2)} ${f1(-len * 0.35)} 0 0Z`;
  const layers = [
    { n: 8, len: 80, w: 36, rot: 0, fill: "#F29BB5", stroke: "#DD7393", delay: 0 },
    { n: 8, len: 64, w: 32, rot: 22.5, fill: "#F6B3C6", stroke: "#E3849F", delay: 160 },
    { n: 8, len: 48, w: 26, rot: 0, fill: "#FBCFDB", stroke: "#E99AB0", delay: 320 },
  ];
  const burst = Array.from({ length: 18 }, (_, k) => {
    const marigold = k % 2 === 0;
    return {
      marigold,
      style: {
        "--a": `${(k / 18) * 360 + ((k * 37) % 13)}deg`,
        "--dist": `${96 + ((k * 53) % 46)}px`,
        "--spin": `${((k * 71) % 300) - 150}deg`,
        "--s": `${0.8 + ((k * 29) % 7) / 10}`,
        "--d": `${1450 + ((k * 41) % 260)}ms`,
      } as CSSProperties,
    };
  });

  return (
    <div className={`lc relative ${play ? "lc-play" : ""} ${still ? "lc-static" : ""} ${className}`}>
      <svg viewBox="0 0 200 200" className="relative h-full w-full overflow-visible" aria-hidden>
        <circle className="lc-ring" cx="100" cy="100" r="92" fill="none" stroke={GOLD} strokeWidth="5" pathLength={1} transform="rotate(-90 100 100)" />
        {layers.map((l, li) => (
          <g key={li} className="lc-layer" style={{ "--d": `${l.delay}ms` } as CSSProperties}>
            {Array.from({ length: l.n }, (_, k) => (
              <g key={k} transform={`translate(100 100) rotate(${(360 / l.n) * k + l.rot})`}>
                <path d={petal(l.len, l.w)} fill={l.fill} stroke={l.stroke} strokeWidth="1" />
                <path d={`M0-4V${f1(-l.len * 0.8)}`} stroke={l.stroke} strokeWidth="0.6" opacity="0.5" />
              </g>
            ))}
          </g>
        ))}
        <circle className="lc-dot" cx="100" cy="100" r="31" fill="#A51C1C" stroke="#FFF4F6" strokeWidth="2" />
        <path className="lc-tick" d="M85 101l11 11 20-23" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
      </svg>
      {burst.map((p, k) => (
        <span key={k} aria-hidden className="lc-petal" style={p.style}>
          <svg viewBox="-8 -8 16 16" className="block h-full w-full">
            {p.marigold ? (
              <path d="M0 7C-5 4-6-2-4-6Q-2-8 0-6.5 2-8 4-6C6-2 5 4 0 7Z" fill="#F59A1B" />
            ) : (
              <path d="M0-7C5-7 8-2 7 3 6 7 2 8 0 6-2 8-6 7-7 3-8-2-5-7 0-7Z" fill="#EF8FA6" />
            )}
          </svg>
        </span>
      ))}
    </div>
  );
}
