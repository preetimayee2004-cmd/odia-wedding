import { useId } from "react";

/**
 * Pipili Chandua-inspired applique, reinterpreted minimally: flat geometric
 * shapes, mirror dots and running-stitch outlines in sindoor, gold and cream.
 */

const PETALS = [6, 8, 10, 12, 8, 10];

/** Round applique medallion; `variant` changes petal count and colourway. */
export function ChanduaPatch({ variant = 0, className = "" }: { variant?: number; className?: string }) {
  const n = PETALS[variant % PETALS.length];
  const inverted = variant % 2 === 1;
  const base = inverted ? "fill-gold" : "fill-sindoor";
  const petal = inverted ? "fill-sindoor" : "fill-gold";

  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="23" className={base} />
      <circle cx="24" cy="24" r="20.5" fill="none" className="stroke-cream-light" strokeWidth="0.8" strokeDasharray="1.6 2.2" />
      {Array.from({ length: n }, (_, i) => (
        <path
          key={i}
          d="M24 6.5c2.4 3.2 2.4 6.6 0 9.8-2.4-3.2-2.4-6.6 0-9.8Z"
          className={petal}
          transform={`rotate(${(360 / n) * i} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="7.5" className="fill-cream-light" />
      <circle cx="24" cy="24" r="5.6" fill="none" className="stroke-sindoor" strokeWidth="0.6" strokeDasharray="1 1.4" />
      {/* Mirror */}
      <circle cx="24" cy="24" r="3" className="fill-gold" />
      <circle cx="23" cy="23" r="0.9" className="fill-cream-light" opacity="0.9" />
    </svg>
  );
}

/** Sawtooth applique band with a running stitch — the classic Chandua edge. */
export function ChanduaBorder({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={`block h-[14px] w-full ${flip ? "rotate-180" : ""} ${className}`} aria-hidden>
      <defs>
        <pattern id={`teeth-${id}`} width="18" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 0h9L4.5 8Z" className="fill-sindoor" />
          <path d="M9 0h9l-4.5 8Z" className="fill-gold" />
        </pattern>
      </defs>
      <rect width="100%" height="9" fill={`url(#teeth-${id})`} />
      <line x1="0" y1="12" x2="100%" y2="12" className="stroke-sindoor/50" strokeWidth="0.8" strokeDasharray="3 3" />
    </svg>
  );
}
