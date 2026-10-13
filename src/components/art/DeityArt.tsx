import { wedding } from "@/config/wedding";

/**
 * The deity focal point shared by the opening and the invitation header.
 * Renders the approved Lord Jagannath artwork when it is configured;
 * until then, a Nilachakra emblem holds the place respectfully.
 */
export function DeityArt({ className = "" }: { className?: string }) {
  const src = wedding.assets.deityArtwork;

  if (src) {
    return (
      <img
        src={src}
        alt="Lord Jagannath"
        className={`h-full w-full object-contain ${className}`}
        draggable={false}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={`h-full w-full ${className}`}
      fill="none"
      role="img"
      aria-label="Nilachakra emblem"
    >
      <circle cx="50" cy="50" r="47" className="stroke-gold" strokeWidth="0.6" />
      <circle cx="50" cy="50" r="44.5" className="stroke-gold/60" strokeWidth="0.4" />

      {/* Lotus petal ring */}
      <g className="fill-gold/15 stroke-gold" strokeWidth="0.55">
        {Array.from({ length: 16 }, (_, i) => (
          <path
            key={i}
            d="M50 10c3.6 5 3.6 10.5 0 15.5-3.6-5-3.6-10.5 0-15.5Z"
            transform={`rotate(${i * 22.5} 50 50)`}
          />
        ))}
      </g>

      {/* Eight-spoked wheel */}
      <g className="stroke-sindoor" strokeLinecap="round">
        <circle cx="50" cy="50" r="21" strokeWidth="1.8" />
        <circle cx="50" cy="50" r="9" strokeWidth="0.9" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <g key={i}>
              <path
                d={`M${50 + Math.cos(a) * 4} ${50 + Math.sin(a) * 4}L${50 + Math.cos(a) * 21} ${50 + Math.sin(a) * 21}`}
                strokeWidth="1.3"
              />
              <circle cx={50 + Math.cos(a) * 21} cy={50 + Math.sin(a) * 21} r="1.5" className="fill-sindoor" stroke="none" />
            </g>
          );
        })}
      </g>
      <circle cx="50" cy="50" r="3.2" className="fill-sindoor" />
    </svg>
  );
}
