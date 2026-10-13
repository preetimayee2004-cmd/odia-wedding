import { EASE } from "@/lib/motion";

const C = 150;
const OUTER = 12;
const INNER = 12;

// Petal paths drawn pointing "up" from the ring, then rotated into place.
const OUTER_PETAL = `M${C - 14} 38C${C - 16} 22 ${C - 6} 10 ${C} 4C${C + 6} 10 ${C + 16} 22 ${C + 14} 38`;
const INNER_PETAL = `M${C - 9} 42C${C - 10} 32 ${C - 4} 25 ${C} 22C${C + 4} 25 ${C + 10} 32 ${C + 9} 42`;

/**
 * Minimal lotus mandala in antique-gold line. When `drawn` turns true, the
 * ring and petals draw themselves in (stroke reveal), inner layer first.
 */
export function LotusMandala({ drawn, className = "" }: { drawn: boolean; className?: string }) {
  const stroke = (delay: number, duration = 900) => ({
    strokeDasharray: 1,
    strokeDashoffset: drawn ? 0 : 1,
    transition: `stroke-dashoffset ${duration}ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <svg viewBox="0 0 300 300" className={className} fill="none" aria-hidden>
      <g className="stroke-gold" strokeLinecap="round" strokeLinejoin="round">
        <circle cx={C} cy={C} r="108" strokeWidth="0.9" pathLength={1} style={stroke(0, 1200)} transform={`rotate(-90 ${C} ${C})`} />
        <circle
          cx={C}
          cy={C}
          r="100"
          strokeWidth="2"
          strokeDasharray="0.1 6"
          style={{ opacity: drawn ? 0.8 : 0, transition: `opacity 900ms ${EASE.silk} 600ms` }}
        />
        {Array.from({ length: INNER }, (_, i) => (
          <path
            key={`i${i}`}
            d={INNER_PETAL}
            strokeWidth="0.8"
            pathLength={1}
            transform={`rotate(${i * (360 / INNER) + 15} ${C} ${C})`}
            style={stroke(200 + i * 40)}
          />
        ))}
        {Array.from({ length: OUTER }, (_, i) => (
          <path
            key={`o${i}`}
            d={OUTER_PETAL}
            strokeWidth="1"
            pathLength={1}
            transform={`rotate(${i * (360 / OUTER)} ${C} ${C})`}
            style={stroke(450 + i * 45)}
          />
        ))}
      </g>
    </svg>
  );
}
