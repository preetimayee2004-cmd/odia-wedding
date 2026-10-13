/** Original line illustration of a wedding mandap — the venue image stand-in. */
export function MandapArt({ className = "" }: { className?: string }) {
  const scallops = Array.from({ length: 8 }, () => "q10 10 20 0").join(" ");
  return (
    <svg
      viewBox="0 0 320 220"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Illustration of a wedding mandap"
    >
      <g className="stroke-sindoor" strokeWidth="1.3">
        {/* Canopy */}
        <path d="M80 74 160 36l80 38Z" className="fill-gold/20" />
        <path d={`M80 74 ${scallops}`} className="stroke-gold" />
        <path d="M80 74h160" />
        {/* Kalash finial */}
        <ellipse cx="160" cy="30" rx="6" ry="5" className="fill-gold/40" />
        <path d="M157 25v-3h6v3M160 22v-6" />
        <circle cx="160" cy="14" r="2" className="fill-sindoor" stroke="none" />
        {/* Pillars */}
        <path d="M88 74v104M232 74v104" strokeWidth="1.6" />
        <path d="M118 80v98M202 80v98" className="stroke-gold" />
        <path d="M84 178h8M228 178h8M84 74h8M228 74h8" />
        {/* Garlands */}
        <path d="M88 92c18 18 54 18 72 0 18 18 54 18 72 0" className="stroke-gold" strokeWidth="3" strokeDasharray="0.1 5" />
        {/* Sacred fire */}
        <path d="M146 178v-12h28v12" className="fill-cream-light" />
        <path d="M160 164c-5-6-2-12 0-17 2 5 5 11 0 17Z" className="fill-gold" />
        {/* Platform */}
        <path d="M60 178h200M50 190h220" />
      </g>
      <path d="M20 200h280" className="stroke-gold/60" strokeWidth="0.8" />
    </svg>
  );
}
