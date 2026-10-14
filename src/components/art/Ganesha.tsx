const GOLD = "#B8863B";
const GOLD_LIGHT = "#D9AE5F";
const MAROON = "#7A1424";

/**
 * A small, minimal Ganesha in gold with fine maroon details: crown, broad
 * ears, a trunk curling to his left, one tusk, tilak and eyes, seated on a
 * lotus base. Drawn for ~56px tall.
 */
export function GaneshaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 72" className={className} role="img" aria-label="Lord Ganesha">
      {/* Ears, behind the head */}
      <path d="M17 24C8 20 3 27 4 35c1 7 6 11 13 10 2-5 2-14 0-21Z" fill={GOLD_LIGHT} stroke={GOLD} strokeWidth="1" />
      <path d="M47 24c9-4 14 3 13 11-1 7-6 11-13 10-2-5-2-14 0-21Z" fill={GOLD_LIGHT} stroke={GOLD} strokeWidth="1" />
      <path d="M9 31c1 4 3 7 6 8M55 31c-1 4-3 7-6 8" fill="none" stroke={MAROON} strokeWidth="0.8" strokeLinecap="round" />

      {/* Crown (mukut) */}
      <path d="M22 18l3-9 3.5 5L32 5l3.5 9L39 9l3 9Z" fill={GOLD} stroke={MAROON} strokeWidth="0.7" strokeLinejoin="round" />
      <circle cx="32" cy="14.5" r="1.5" fill={MAROON} />
      <path d="M21 18.5h22" stroke={MAROON} strokeWidth="0.9" strokeLinecap="round" />

      {/* Head and trunk, curling to his left */}
      <path
        d="M20 22c0-3 5-4 12-4s12 1 12 4c1 7-1 13-5 16-1 4-1 8 1 11 2 3 6 3 7 0 0-2-2-3-3-2"
        fill="none"
        stroke={GOLD}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M20 22c-1 7 1 13 5 16 1 5 2 10 5 13 3 3 8 3 10 0" fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20.5 21.5c0 7 2 12 5 15.5 1 5 2.5 9.5 5 12.5 2.5 2.6 7 2.4 8.8 0 -2.4-2.6-2.6-7-1.6-11.5 3.6-3 5.2-8.5 4.4-15.5C38 21 26 21 20.5 21.5Z" fill={GOLD} opacity="0.9" />
      <path d="M20.3 23.4c0-3.6 5.2-4.6 11.7-4.6s11.7 1 11.7 4.6v2.2H20.3Z" fill={GOLD} opacity="0.9" />
      {/* Trunk folds */}
      <path d="M29.5 40.5h5M30.5 44h4M31.5 47.4h3.2" stroke={MAROON} strokeWidth="0.7" strokeLinecap="round" />
      {/* Tusk */}
      <path d="M24.5 37.5l-3.5 3.5" stroke="#FFF6E0" strokeWidth="1.6" strokeLinecap="round" />
      {/* Eyes and tilak */}
      <path d="M25.5 28.2c1.2-1 2.6-1 3.8 0M34.7 28.2c1.2-1 2.6-1 3.8 0" fill="none" stroke={MAROON} strokeWidth="1" strokeLinecap="round" />
      <path d="M32 21.5v4.5" stroke={MAROON} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M29.3 22.5c1 1.8 4.4 1.8 5.4 0" fill="none" stroke={MAROON} strokeWidth="0.8" strokeLinecap="round" />

      {/* Lotus seat */}
      <path d="M14 63c4-5 10-6 18-6s14 1 18 6c-5 3-11 4-18 4s-13-1-18-4Z" fill={GOLD_LIGHT} stroke={GOLD} strokeWidth="1" />
      <path d="M32 57c-3 3-3 7 0 10 3-3 3-7 0-10ZM24 58.5c-2.5 2.5-2.3 6 .5 8.3M40 58.5c2.5 2.5 2.3 6-.5 8.3" fill="none" stroke={MAROON} strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}

/** A small gold lotus, above the couple's quote. */
export function LotusIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" className={className} aria-hidden>
      <path d="M20 21C14 17 13 9 20 3c7 6 6 14 0 18Z" fill={GOLD} />
      <path d="M19 21C11 21 6 16 6 10c7 0 12 5 13 11ZM21 21c8 0 13-5 13-11-7 0-12 5-13 11Z" fill={GOLD_LIGHT} stroke={GOLD} strokeWidth="0.8" />
      <path d="M8 22h24" stroke={GOLD} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
