import { useId } from "react";

/**
 * A gold Kalash (the auspicious pot, with mango leaves and a coconut) set on
 * a marker point: our map pin for the venue, travel and stay.
 */
export function KalashPin({ className = "" }: { className?: string }) {
  const id = useId();
  const gold = `${id}-gold`;
  const leaf = `${id}-leaf`;

  return (
    <svg viewBox="0 0 40 54" className={className} aria-hidden>
      <defs>
        <linearGradient id={gold} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#FBE7A6" />
          <stop offset="0.45" stopColor="#D4AF37" />
          <stop offset="1" stopColor="#8E6A14" />
        </linearGradient>
        <linearGradient id={leaf} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7FA650" />
          <stop offset="1" stopColor="#3F6B2A" />
        </linearGradient>
      </defs>
      <g stroke="#5E400C" strokeWidth="0.9" strokeLinejoin="round">
        {/* Marker point, behind the pot */}
        <path d="M13.5 38 20 52.5 26.5 38Z" fill={`url(#${gold})`} />
        {/* Mango leaves */}
        {[-62, -32, 32, 62].map((a) => (
          <path key={a} d="M20 14.5c-1.8-3-1.8-7 0-10 1.8 3 1.8 7 0 10Z" fill={`url(#${leaf})`} transform={`rotate(${a} 20 14.5)`} />
        ))}
        {/* Coconut */}
        <ellipse cx="20" cy="9.5" rx="4.4" ry="5.2" fill="#B0782C" />
        <path d="M18.4 4.6c.6-1.6 2.6-1.6 3.2 0" fill="none" />
        {/* Rim, neck and body */}
        <ellipse cx="20" cy="15.2" rx="7.4" ry="1.9" fill={`url(#${gold})`} />
        <path d="M15.2 16.6h9.6l-.8 3.2h-8Z" fill={`url(#${gold})`} />
        <path d="M16 19.6c-5 1.4-8 5.2-8 9.9 0 6.3 5.4 10.3 12 10.3s12-4 12-10.3c0-4.7-3-8.5-8-9.9Z" fill={`url(#${gold})`} />
      </g>
      {/* Decorative band of dots and a sindoor mark */}
      <path d="M9.4 26.5h21.2" stroke="#7A5310" strokeWidth="0.7" />
      {[12, 15.5, 19, 22.5, 26, 29.5].map((x) => (
        <circle key={x} cx={x + 0.5} cy="28.4" r="0.7" fill="#7A5310" />
      ))}
      <circle cx="20" cy="33" r="1.6" fill="#B3261E" />
      <path d="M13 22.5c1.8-1.2 3.6-1.8 5-2" stroke="#FFF3C4" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" fill="none" />
    </svg>
  );
}
