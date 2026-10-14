const GOLD = "#B8863B";

/** A thin gold rule with a small diamond at its centre. */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`mx-auto flex w-36 items-center gap-2 ${className}`}>
      <span className="h-px flex-1" style={{ background: `linear-gradient(to left, ${GOLD}, transparent)` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: GOLD }} />
      <span className="h-px flex-1" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
    </span>
  );
}

/** A small gold map pin with a lotus-bud head, above a place. */
export function PinIcon() {
  return (
    <svg width="13" height="16" viewBox="0 0 16 20" aria-hidden>
      <path d="M8 19.2C4.4 14.6 1.6 11.4 1.6 7.7a6.4 6.4 0 0 1 12.8 0c0 3.7-2.8 6.9-6.4 11.5Z" fill={GOLD} />
      <path d="M8 4.2c1.5 1.3 1.9 3 0 4.8-1.9-1.8-1.5-3.5 0-4.8Z" fill="#FFF6DF" />
    </svg>
  );
}
