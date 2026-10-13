/** Fine antique-gold hairline with a small centre ornament. Decorative only. */
export function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center justify-center gap-3 text-gold ${className}`}>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold" />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1.2 12.8 7 7 12.8 1.2 7Z" stroke="currentColor" strokeWidth="0.9" />
        <circle cx="7" cy="7" r="1.4" fill="currentColor" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold" />
    </div>
  );
}
