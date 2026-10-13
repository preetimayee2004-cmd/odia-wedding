/** Small three-petal lotus ornament in gold line. */
export function LotusBud({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 28" className={className} fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <g className="stroke-gold" strokeWidth="1">
        <path d="M24 3c4 5 4 12 0 18-4-6-4-13 0-18Z" className="fill-gold/15" />
        <path d="M22 20c-6 0-11-4-13-10 6 0 10 3 12.5 7M26 20c6 0 11-4 13-10-6 0-10 3-12.5 7" />
        <path d="M14 22c-4 0-8-2-10-5M34 22c4 0 8-2 10-5" opacity="0.7" />
        <path d="M10 25h28" opacity="0.6" />
      </g>
      <circle cx="24" cy="14" r="1.3" className="fill-sindoor" />
    </svg>
  );
}
