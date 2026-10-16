import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

const GOLD = "#C9A24D";
const f1 = (n: number) => n.toFixed(1);

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
 * The confirmation seal: a pink lotus blooms ring by ring over a soft golden
 * glow, a thin gold ring draws itself round it, a red circle pops up in its
 * heart and a white tick is drawn — while marigold and rose petals scatter
 * outward. `play` starts it; `still` shows
 * the finished seal at once (reduced motion). Styles: `.lc` in index.css.
 */
export function LotusConfirm({ play, still = false, className = "" }: { play: boolean; still?: boolean; className?: string }) {
  const petal = (len: number, w: number) =>
    `M0 0C${f1(-w / 2)} ${f1(-len * 0.35)} ${f1(-w / 2)} ${f1(-len * 0.75)} 0 ${f1(-len)}C${f1(w / 2)} ${f1(-len * 0.75)} ${f1(w / 2)} ${f1(-len * 0.35)} 0 0Z`;
  const layers = [
    { n: 8, len: 80, w: 36, rot: 0, fill: "#F29BB5", stroke: "#DD7393", delay: 0 },
    { n: 8, len: 64, w: 32, rot: 22.5, fill: "#F6B3C6", stroke: "#E3849F", delay: 260 },
    { n: 8, len: 48, w: 26, rot: 0, fill: "#FBCFDB", stroke: "#E99AB0", delay: 520 },
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
        <defs>
          <radialGradient id="lc-glow-fill">
            <stop offset="0" stopColor="#FFE08A" stopOpacity="0.75" />
            <stop offset="0.55" stopColor="#F6CF6A" stopOpacity="0.35" />
            <stop offset="1" stopColor="#F6CF6A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="lc-glow" cx="100" cy="100" r="104" fill="url(#lc-glow-fill)" />
        <circle className="lc-ring" cx="100" cy="100" r="92" fill="none" stroke={GOLD} strokeWidth="3" pathLength={1} transform="rotate(-90 100 100)" />
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

/**
 * A blessing of turmeric rice: about 110 yellow grains shower down over the
 * whole screen when the guest accepts — most from the centre-top, a few from
 * wider — each with its own speed, delay, drift and spin, fading as it falls.
 * Removed from the page after five seconds. Styles: `.rice-grain` in index.css.
 */
export function RiceShower() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const grains = useMemo(() => {
    let seed = 11;
    const R = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: 110 }, (_, k) => {
      const wide = k % 4 === 0;
      // most near the centre-top: a narrow bell around 50%, a few anywhere
      const x = wide ? 4 + R() * 92 : 50 + (R() + R() + R() - 1.5) * 26;
      return {
        "--x": `${x.toFixed(1)}vw`,
        "--y0": `${(-4 - R() * 10).toFixed(1)}vh`,
        "--dx": `${((R() - 0.5) * 22).toFixed(1)}vw`,
        "--r0": `${(R() * 360).toFixed(0)}deg`,
        "--spin": `${((R() - 0.5) * 720).toFixed(0)}deg`,
        "--dur": `${(1.6 + R() * 1.4).toFixed(2)}s`,
        "--delay": `${(R() * 1.6).toFixed(2)}s`,
      } as CSSProperties;
    });
  }, []);

  if (done) return null;
  return createPortal(
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[65] overflow-hidden">
      {grains.map((style, k) => (
        <span key={k} className="rice-grain" style={style} />
      ))}
    </div>,
    document.body,
  );
}
