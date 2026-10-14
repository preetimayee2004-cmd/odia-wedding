/**
 * Wedding crowns for the couple cards, as original line vectors:
 * the bride's white Odia mukuta (sola-pith crest with petal layers and
 * bead tassels) and the groom's ceremonial crown (topi) with its kalgi plume.
 * Plus Tarakasi (Cuttack silver filigree) wire ornaments for the frames.
 */
const LINE = "#9C8459";
const WHITE = "#FFFDF7";

export function BrideMukuta({ className = "" }: { className?: string }) {
  const tassels = [32, 42, 52, 60, 68, 78, 88];
  return (
    <svg viewBox="0 0 120 96" className={className} fill="none" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="The bride's white Odia mukuta">
      <g stroke={LINE} strokeWidth="1.1">
        {/* Side wings */}
        <path d="M40 72C27 64 20 52 22 36c8 8 14 20 18 32Z" fill={WHITE} />
        <path d="M80 72c13-8 20-20 18-36-8 8-14 20-18 32Z" fill={WHITE} />
        {/* Tall central crest with inner layers */}
        <path d="M60 6c15 14 24 34 22 66H38C36 40 45 20 60 6Z" fill={WHITE} />
        <path d="M60 18c10 11 15 27 14 50H46c-1-23 4-39 14-50Z" />
        <path d="M60 30c6 8 8 20 8 36H52c0-16 2-28 8-36Z" />
        {/* Pearl edging along the crest */}
        <path d="M60 6c15 14 24 34 22 66H38C36 40 45 20 60 6Z" strokeWidth="2.6" strokeDasharray="0.1 5.2" stroke="#C8B48A" />
        {/* Finial */}
        <circle cx="60" cy="4" r="2.6" fill={WHITE} />
        {/* Band */}
        <rect x="22" y="70" width="76" height="11" rx="3" fill={WHITE} />
        <path d="M25 78l5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5" strokeWidth="0.8" />
        {/* Bead tassels */}
        {tassels.map((x, i) => (
          <g key={x}>
            <path d={`M${x} 81v${i % 2 ? 6 : 9}`} strokeWidth="0.8" />
            <circle cx={x} cy={i % 2 ? 89 : 92} r="1.8" fill={WHITE} />
          </g>
        ))}
      </g>
      <circle cx="60" cy="52" r="3" fill="#A72D32" />
    </svg>
  );
}

export function GroomTopi({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 96" className={className} fill="none" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="The groom's ceremonial crown">
      <g stroke={LINE} strokeWidth="1.1">
        {/* Kalgi plume */}
        <path d="M62 30c-3-12 3-22 12-28-4 9-4 18-7 28Z" fill={WHITE} />
        <path d="M66 26c1-7 4-13 8-18" strokeWidth="0.7" />
        {/* Domed cap with ribbing */}
        <path d="M24 74c0-30 16-48 36-48s36 18 36 48Z" fill={WHITE} />
        <path d="M42 74c0-24 7-40 18-46M78 74c0-24-7-40-18-46M60 28v46" strokeWidth="0.8" />
        <path d="M24 74c0-30 16-48 36-48s36 18 36 48" strokeWidth="2.6" strokeDasharray="0.1 5.6" stroke="#C8B48A" />
        {/* Band with zigzag */}
        <rect x="20" y="72" width="80" height="12" rx="3" fill={WHITE} />
        <path d="M23 80l4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5" strokeWidth="0.8" />
        {/* Front jewel mount */}
        <path d="M54 72c0-6 3-9 6-9s6 3 6 9" fill={WHITE} />
      </g>
      <circle cx="60" cy="68" r="3.4" fill="#A72D32" />
    </svg>
  );
}

/** Silver-filigree corner: wire arc, two coiled scrolls and beads (32×32, top-left orientation). */
export function FiligreeCorner({ className = "" }: { className?: string }) {
  const wire = (d: string, w = 1) => (
    <>
      <path d={d} stroke="#8E959E" strokeWidth={w + 0.5} />
      <path d={d} stroke="#EEF1F4" strokeWidth={w * 0.45} />
    </>
  );
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" strokeLinecap="round" aria-hidden>
      {wire("M3 29C3 15 15 3 29 3")}
      {wire("M6 23c0-6 6-8 9-5 2 2 1 5-1.5 5-2 0-2.5-2.5-1-3.2", 0.8)}
      {wire("M23 6c-6 0-8 6-5 9 2 2 5 1 5-1.5 0-2-2.5-2.5-3.2-1", 0.8)}
      <circle cx="10.5" cy="10.5" r="1.7" fill="#C9CED5" stroke="#8E959E" strokeWidth="0.6" />
      <circle cx="4.5" cy="4.5" r="1.1" fill="#C9CED5" stroke="#8E959E" strokeWidth="0.5" />
    </svg>
  );
}

/** Small filigree motif for the middle of a frame edge (24×12). */
export function FiligreeKnot({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 12" className={className} fill="none" strokeLinecap="round" aria-hidden>
      <path d="M2 10c3-6 7-6 10-2 3-4 7-4 10 2" stroke="#8E959E" strokeWidth="1.4" />
      <path d="M2 10c3-6 7-6 10-2 3-4 7-4 10 2" stroke="#EEF1F4" strokeWidth="0.5" />
      <circle cx="12" cy="4" r="1.6" fill="#C9CED5" stroke="#8E959E" strokeWidth="0.6" />
    </svg>
  );
}

/** Soft head-and-shoulders silhouette for a portrait frame awaiting a photo. */
export function PortraitSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 130" className={className} aria-hidden>
      <rect width="100" height="130" fill="#F6EBD6" />
      <circle cx="50" cy="52" r="20" fill="#E5D3B2" />
      <path d="M14 130c2-30 17-46 36-46s34 16 36 46Z" fill="#E5D3B2" />
    </svg>
  );
}
