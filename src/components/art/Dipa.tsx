import { useId } from "react";

/**
 * A tiny brass oil lamp (dipa) with a living flame, lit beside the names of
 * departed elders. The flicker is pure CSS (.dipa-flame / .dipa-glow in
 * index.css); `delay` keeps several lamps from flickering in step.
 */
export function Dipa({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  const id = useId();
  const brass = `${id}-brass`;
  const flame = `${id}-flame`;
  const glow = `${id}-glow`;
  const offset = { animationDelay: `${-delay}ms` };

  return (
    <svg viewBox="0 0 16 22" role="img" aria-label="In loving memory" className={className}>
      <title>In loving memory</title>
      <defs>
        <linearGradient id={brass} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#F0CF7E" />
          <stop offset="0.55" stopColor="#C4923A" />
          <stop offset="1" stopColor="#8A5E1C" />
        </linearGradient>
        <radialGradient id={flame} cx="0.5" cy="0.72" r="0.62">
          <stop offset="0" stopColor="#FFF6D6" />
          <stop offset="0.45" stopColor="#FFC94D" />
          <stop offset="1" stopColor="#E9701E" />
        </radialGradient>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="#FFD877" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFD877" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle className="dipa-glow" cx="8" cy="7" r="6.5" fill={`url(#${glow})`} style={offset} />
      <path
        className="dipa-flame"
        d="M8 1.2C9.9 4 10.7 5.9 10.7 7.6A2.7 2.7 0 0 1 5.3 7.6C5.3 5.9 6.1 4 8 1.2Z"
        fill={`url(#${flame})`}
        style={offset}
      />
      <path d="M8 10.2v1" stroke="#3A2410" strokeWidth="0.7" strokeLinecap="round" />

      {/* Brass bowl, stem and foot */}
      <g fill={`url(#${brass})`} stroke="#6B4614" strokeWidth="0.45" strokeLinejoin="round">
        <path d="M1.8 11.2h12.4c-.5 2.7-3.1 4.1-6.2 4.1s-5.7-1.4-6.2-4.1Z" />
        <path d="M6.9 15.2h2.2l-.3 1.3.6.9-.6.9.3 1.2H6.9l.3-1.2-.6-.9.6-.9Z" />
        <ellipse cx="8" cy="20.3" rx="4.2" ry="1.25" />
      </g>
      <path d="M3.2 12.3h9.6" stroke="#FBE7B0" strokeWidth="0.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
