/**
 * Pattachitra-style milestone icons for the Heritage Timeline: bold dark
 * outlines, flat fills, dot work. 64×64 each.
 */
const INK = "#1C1410";
const SINDOOR = "#A72D32";
const GOLD = "#D3A54C";
const TEAL = "#2E6B6A";
const LEAF = "#4F7A3A";
const CREAM = "#FBF3E2";

/** First Chapter — two peacocks facing each other, necks interlocking. */
export function PeacocksIcon({ className = "" }: { className?: string }) {
  const peacock = (flip: boolean) => (
    <g transform={flip ? "translate(64 0) scale(-1 1)" : undefined} stroke={INK} strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round">
      {/* Tail fan */}
      <path d="M22 50C10 50 4 42 6 32c6 6 12 9 18 9" fill={GOLD} />
      <circle cx="10" cy="40" r="2.6" fill={TEAL} />
      <circle cx="15" cy="45" r="2.2" fill={TEAL} />
      {/* Body */}
      <path d="M18 48c0-10 6-16 13-16 3 0 4 3 4 6 0 7-6 12-17 10Z" fill={TEAL} />
      {/* Neck curving across the centre */}
      <path d="M30 34c-1-8 3-15 10-18 4-2 7 1 6 4" fill="none" strokeWidth="3.4" stroke={INK} />
      <path d="M30 34c-1-8 3-15 10-18 4-2 7 1 6 4" fill="none" strokeWidth="1.8" stroke={TEAL} />
      {/* Head, eye, beak, crest */}
      <circle cx="44" cy="19" r="3.4" fill={TEAL} />
      <circle cx="43" cy="18.4" r="0.8" fill={CREAM} stroke="none" />
      <path d="M40.8 19.5l-3 1.2 3 .8" fill={GOLD} />
      <path d="M43 15.6l-1-4M44.5 15.4l.4-4.2M46 16l1.6-3.6" strokeWidth="0.9" />
      <circle cx="42" cy="11.4" r="0.9" fill={GOLD} />
      <circle cx="45" cy="11" r="0.9" fill={GOLD} />
      <circle cx="47.7" cy="12.2" r="0.9" fill={GOLD} />
      {/* Feet */}
      <path d="M24 48v6M28 48v6" strokeWidth="1" />
    </g>
  );
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      {peacock(false)}
      {peacock(true)}
      {/* Little lotus between them */}
      <path d="M32 58c-3-2-3-5 0-7 3 2 3 5 0 7Z" fill={SINDOOR} stroke={INK} strokeWidth="1" />
    </svg>
  );
}

/** The Promise — a Koka (lotus) in bloom on its leaves. */
export function KokaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" aria-hidden>
      {/* Leaves on water */}
      <path d="M8 52c4-6 14-7 20-3-6 4-15 5-20 3Z" fill={LEAF} />
      <path d="M56 52c-4-6-14-7-20-3 6 4 15 5 20 3Z" fill={LEAF} />
      <path d="M10 58h44" strokeWidth="1" strokeDasharray="2 3" />
      {/* Petals: back layer then front */}
      <path d="M32 48c-12-2-18-12-16-22 8 3 14 11 16 22Z" fill="#E7A0A0" />
      <path d="M32 48c12-2 18-12 16-22-8 3-14 11-16 22Z" fill="#E7A0A0" />
      <path d="M32 48c-7-4-9-14-6-24 5 5 7 14 6 24Z" fill={SINDOOR} />
      <path d="M32 48c7-4 9-14 6-24-5 5-7 14-6 24Z" fill={SINDOOR} />
      <path d="M32 48c-3-8-3-20 0-30 3 10 3 22 0 30Z" fill="#C2414A" />
    </svg>
  );
}

/** Nirbandha — betel leaves and areca nuts (pana-gua) on a brass plate. */
export function PanaGuaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      {/* Brass plate */}
      <ellipse cx="32" cy="46" rx="27" ry="9" fill="#B8862F" />
      <ellipse cx="32" cy="44.5" rx="22" ry="6.5" fill={GOLD} />
      <path d="M10 46.5c2 3 8 5 22 5s20-2 22-5" strokeWidth="0.8" strokeDasharray="1.5 2.5" />
      {/* Betel leaves */}
      <path d="M30 42c-10 1-17-6-16-16 9 1 15 7 16 16Z" fill={LEAF} />
      <path d="M30 42c-4-5-9-9-14-13" strokeWidth="0.8" />
      <path d="M34 42c10 1 17-6 16-16-9 1-15 7-16 16Z" fill="#5E8A44" />
      <path d="M34 42c4-5 9-9 14-13" strokeWidth="0.8" />
      {/* Areca nuts */}
      <circle cx="26" cy="43" r="3.6" fill="#8A5A2B" />
      <circle cx="33" cy="44.5" r="3.6" fill="#9B6A35" />
      <circle cx="40" cy="43" r="3.6" fill="#7E5025" />
      <path d="M24.6 41.6l1.4 1M31.6 43l1.4 1M38.6 41.6l1.4 1" stroke={CREAM} strokeWidth="0.8" />
    </svg>
  );
}
