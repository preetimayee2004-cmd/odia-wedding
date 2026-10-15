import { EASE } from "@/lib/motion";

/** Gold blessing ornament that blooms open when the guest accepts. */
export function BlessingBloom({ open, className = "" }: { open: boolean; className?: string }) {
  const petals = 16;
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" aria-hidden>
      <g
        style={{
          transformOrigin: "60px 60px",
          transform: open ? "scale(1) rotate(0deg)" : "scale(0.35) rotate(-60deg)",
          opacity: open ? 1 : 0,
          transition: `transform 1200ms ${EASE.silk}, opacity 700ms ${EASE.silk}`,
        }}
      >
        {Array.from({ length: petals }, (_, i) => (
          <path
            key={i}
            d="M60 8c5 7 5 15 0 22-5-7-5-15 0-22Z"
            className={i % 2 ? "fill-gold/25 stroke-gold" : "fill-sindoor/15 stroke-gold"}
            strokeWidth="0.8"
            transform={`rotate(${(360 / petals) * i} 60 60)`}
          />
        ))}
        <circle cx="60" cy="60" r="26" className="stroke-gold" strokeWidth="0.8" />
        <circle cx="60" cy="60" r="21" className="stroke-gold/60" strokeWidth="2" strokeDasharray="0.1 5" strokeLinecap="round" />
        <circle cx="60" cy="60" r="5" className="fill-sindoor" />
      </g>
    </svg>
  );
}
