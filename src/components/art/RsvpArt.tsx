import { EASE } from "@/lib/motion";

/**
 * Crown of the RSVP frame: a pointed Odia torana arch with a kalash (pot,
 * coconut, mango leaves) at its apex. The frame's straight sides continue
 * below as borders, so it can wrap content of any height.
 */
export function ToranaCrown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 -34 320 144" className={className} fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* Arch: outer + inner line */}
      <path d="M1 110V80C1 40 100 50 160 18c60 32 159 22 159 62v30" className="fill-cream-light stroke-gold" strokeWidth="1.2" />
      <path d="M8 110V82C8 48 104 58 160 27c56 31 152 21 152 55v28" className="stroke-gold/45" strokeWidth="0.9" />
      {/* Hanging bells along the arch */}
      {[56, 104, 216, 264].map((x, i) => {
        const y = i === 0 || i === 3 ? 56 : 42;
        return (
          <g key={x}>
            <path d={`M${x} ${y}v8`} className="stroke-gold" strokeWidth="0.8" />
            <path d={`M${x - 3} ${y + 12}q3-6 6 0Z`} className="fill-gold/50 stroke-gold" strokeWidth="0.8" />
          </g>
        );
      })}
      {/* Kalash */}
      <g strokeWidth="1.1">
        <path d="M160 -14c-8 0-12 6-12 13s5 12 12 12 12-5 12-12-4-13-12-13Z" className="fill-gold/30 stroke-sindoor" />
        <path d="M152 -14h16M154 -18h12" className="stroke-sindoor" />
        <path d="M160 -10v6M156 -2h8" className="stroke-sindoor" strokeWidth="0.8" />
        {/* Mango leaves */}
        <path d="M156 -18c-8-2-14-6-16-12 7 0 13 4 16 12ZM164 -18c8-2 14-6 16-12-7 0-13 4-16 12Z" className="fill-gold/40 stroke-gold" />
        <path d="M158 -19c-3-5-3-9-1-13 3 3 3 8 1 13ZM162 -19c3-5 3-9 1-13-3 3-3 8-1 13Z" className="fill-gold/40 stroke-gold" />
        {/* Coconut */}
        <circle cx="160" cy="-24" r="5" className="fill-sindoor/80 stroke-sindoor" />
      </g>
    </svg>
  );
}

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
