/**
 * Mahaprabhu Jagannath's large round eyes with a gold tilak — the iconic,
 * reverent motif, drawn without the full face.
 */
export function JagannathEyes({ className = "" }: { className?: string }) {
  const eye = (cx: number) => (
    <g>
      <circle cx={cx} cy="92" r="64" fill="#140B07" />
      <circle cx={cx} cy="92" r="58" fill="#A72D32" />
      <circle cx={cx} cy="92" r="50" fill="#FFFBF2" />
      <circle cx={cx} cy="92" r="21" fill="#0B0705" />
      <circle cx={cx - 7} cy="85" r="4" fill="#FFFBF2" opacity="0.9" />
    </g>
  );
  return (
    <svg viewBox="0 0 300 170" className={className} role="img" aria-label="The eyes of Mahaprabhu Jagannath">
      {eye(78)}
      {eye(222)}
      {/* Tilak */}
      <path d="M150 6c9 22 9 46 0 70-9-24-9-48 0-70Z" fill="#E4B24C" stroke="#8C6D3A" strokeWidth="1.2" />
      <circle cx="150" cy="44" r="5.5" fill="#A72D32" />
    </svg>
  );
}
