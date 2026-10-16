const GOLD = "#B8863B";
const GOLD_LIGHT = "#D9AE5F";

/** A small Ganesha in a single dark red silhouette (the couple's image). */
export function GaneshaIcon({ className = "" }: { className?: string }) {
  return <img src="/art/ganesha-dark-red.png" width={164} height={199} alt="Lord Ganesha" decoding="async" className={className} />;
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
