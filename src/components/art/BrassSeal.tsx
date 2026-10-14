import { useId } from "react";
import { KonarkWheel } from "./KonarkWheel";

/**
 * A Royal Brass Seal Stamp: a polished brass disc with a beaded rim and the
 * Konark wheel struck into its face. Seals the corner of the Rajagya.
 * Pass a position (`relative` or `absolute …`) and size in `className`.
 */
export function BrassSeal({ className = "" }: { className?: string }) {
  const id = useId();
  const beads = Array.from({ length: 36 }, (_, i) => i * 10);

  return (
    <span aria-hidden className={`block rounded-full shadow-[0_3px_8px_-2px_rgb(52_30_4/0.55)] ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id={`${id}-brass`} cx="0.36" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#F8E3A0" />
            <stop offset="0.4" stopColor="#D8AA4E" />
            <stop offset="0.78" stopColor="#A7762B" />
            <stop offset="1" stopColor="#7A5218" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="49" fill={`url(#${id}-brass)`} stroke="#5E3E10" strokeWidth="1" />
        <circle cx="50" cy="50" r="44.5" fill="none" stroke="#FBE9B6" strokeOpacity="0.55" strokeWidth="0.8" />
        {beads.map((a) => (
          <circle key={a} cx="50" cy="3.8" r="1.25" fill="#6B4614" fillOpacity="0.55" transform={`rotate(${a} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="41" fill="none" stroke="#5E3E10" strokeWidth="0.9" />
        {/* Soft polish on the upper left */}
        <path d="M18 34A35 35 0 0 1 40 14" fill="none" stroke="#FFF6D8" strokeOpacity="0.55" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <KonarkWheel className="absolute inset-[15%] h-[70%] w-[70%]" line="#4E320C" fill="#BE9038" hub={44} />
    </span>
  );
}
