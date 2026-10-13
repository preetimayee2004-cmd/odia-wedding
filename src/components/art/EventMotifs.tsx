import type { ReactNode } from "react";
import type { EventMotif } from "@/config/wedding";

/** Small ceremonial line motifs — one per event, same 40×40 grid. */
const MOTIFS: Record<EventMotif, ReactNode> = {
  // Paisley (kalka) with henna dots
  mehendi: (
    <>
      <path d="M22 6c7 3 10 11 7 18-3 8-13 12-19 8-5-3-5-10 0-12 4-2 8 1 7 5" className="stroke-sindoor" />
      <path d="M15 34c2-4 6-6 10-6" className="stroke-gold" />
      <g className="fill-gold" stroke="none">
        <circle cx="23" cy="13" r="1.1" />
        <circle cx="26" cy="18" r="1.1" />
        <circle cx="25" cy="23.5" r="1.1" />
        <circle cx="13" cy="24" r="0.9" />
      </g>
    </>
  ),
  // Mardala (Odia barrel drum) with lacing
  sangeet: (
    <>
      <ellipse cx="9" cy="20" rx="3" ry="8" className="stroke-sindoor" />
      <ellipse cx="31" cy="20" rx="3.5" ry="9" className="stroke-sindoor" />
      <path d="M9 12c7-2.5 15-2.5 22-1M9 28c7 2.5 15 2.5 22 1" className="stroke-sindoor" />
      <path d="M11 13.5 14.5 27l3.5-14.7L21.5 28 25 12.4 28.5 28" className="stroke-gold" />
    </>
  ),
  // Ceremonial umbrella of the procession
  barajatra: (
    <>
      <path d="M6 18Q20 3 34 18Z" className="fill-gold/25 stroke-sindoor" />
      <path d="M6 18q3.5 3 7 0 3.5 3 7 0 3.5 3 7 0 3.5 3 7 0" className="stroke-sindoor" />
      <path d="M20 18v18M20 9.5V6M6 18v4M34 18v4" className="stroke-gold" />
      <circle cx="20" cy="5" r="1.3" className="fill-sindoor" stroke="none" />
    </>
  ),
  // Welcome aarti plate with diya
  batabarana: (
    <>
      <ellipse cx="20" cy="29" rx="14" ry="4" className="stroke-sindoor" />
      <path d="M13 25q7 6 14 0Z" className="fill-gold/30 stroke-sindoor" />
      <path d="M20 23c-3-4-1-8 0-11 1 3 3 7 0 11Z" className="fill-gold stroke-sindoor" />
      <g className="fill-gold" stroke="none">
        <circle cx="9" cy="29" r="0.9" />
        <circle cx="31" cy="29" r="0.9" />
      </g>
    </>
  ),
  // Two threads knotted together
  hastaganthi: (
    <>
      <path d="M4 26l4-4c0-10 12-10 12-2s12 8 12-2l4-4" className="stroke-sindoor" />
      <path d="M4 14l4 4c0 10 12 10 12 2s12-8 12 2l4 4" className="stroke-gold" />
      <circle cx="20" cy="20" r="2" className="fill-sindoor" stroke="none" />
    </>
  ),
  // Sindoor box
  sindoor: (
    <>
      <path d="M11 17q9-9 18 0Z" className="fill-gold/25 stroke-sindoor" />
      <rect x="10" y="17" width="20" height="14" rx="3" className="stroke-sindoor" />
      <path d="M10 26h20" className="stroke-gold" />
      <circle cx="20" cy="9.5" r="2" className="fill-sindoor" stroke="none" />
    </>
  ),
  // Palanquin (doli)
  bidaai: (
    <>
      <path d="M10 15q10-9 20 0Z" className="fill-gold/25 stroke-sindoor" />
      <rect x="12" y="15" width="16" height="15" className="stroke-sindoor" />
      <path d="M17 30v-6q3-4 6 0v6" className="stroke-sindoor" />
      <path d="M3 21h34" className="stroke-gold" />
      <circle cx="20" cy="7" r="1.3" className="fill-sindoor" stroke="none" />
    </>
  ),
  // Flower garland (mala)
  reception: (
    <>
      <path d="M8 9c0 21 24 21 24 0" className="stroke-sindoor" strokeWidth="0.8" />
      <path d="M8 9c0 21 24 21 24 0" className="stroke-gold" strokeWidth="3.4" strokeDasharray="0.1 4.2" />
      <path d="M20 25v4" className="stroke-sindoor" />
      <circle cx="20" cy="31.5" r="2.6" className="fill-sindoor" stroke="none" />
    </>
  ),
};

export function EventMotifIcon({ motif, className = "" }: { motif: EventMotif; className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {MOTIFS[motif]}
    </svg>
  );
}
