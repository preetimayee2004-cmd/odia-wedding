/**
 * Crisp black-and-white Pattachitra border strip: a white creeper with
 * lotus flowers, leaves and dot work on black, between fine white rules.
 * Drawn as a seamless vertical SVG tile (26×60) so it repeats down any height.
 */
const TILE = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="60" viewBox="0 0 26 60">
<rect width="26" height="60" fill="#0B0907"/>
<path d="M3.2 0v60M22.8 0v60" stroke="#F7F1E6" stroke-width="0.9"/>
<path d="M13 0c6.5 8 6.5 22 0 30s-6.5 22 0 30" fill="none" stroke="#F7F1E6" stroke-width="1.1"/>
<g fill="#F7F1E6">
  <ellipse cx="17.6" cy="11.2" rx="1.5" ry="2.7"/>
  <ellipse cx="17.6" cy="18.8" rx="1.5" ry="2.7"/>
  <ellipse cx="14" cy="15" rx="2.7" ry="1.5"/>
  <ellipse cx="21.2" cy="15" rx="2.7" ry="1.5" opacity="0"/>
  <ellipse cx="8.4" cy="41.2" rx="1.5" ry="2.7"/>
  <ellipse cx="8.4" cy="48.8" rx="1.5" ry="2.7"/>
  <ellipse cx="12" cy="45" rx="2.7" ry="1.5"/>
  <path d="M11 26c-3-1-4.6-3.4-4.6-5.6 2.6.4 4.2 2.4 4.6 5.6ZM15 34c3 1 4.6 3.4 4.6 5.6-2.6-.4-4.2-2.4-4.6-5.6Z"/>
  <circle cx="6.2" cy="6" r="0.9"/><circle cx="6.2" cy="54" r="0.9"/>
  <circle cx="19.8" cy="36" r="0.9"/><circle cx="19.8" cy="24" r="0.9"/>
</g>
<g fill="#0B0907"><circle cx="17.2" cy="15" r="1.4"/><circle cx="8.8" cy="45" r="1.4"/></g>
<g fill="none" stroke="#F7F1E6" stroke-width="0.6"><circle cx="17.2" cy="15" r="1.4"/><circle cx="8.8" cy="45" r="1.4"/></g>
</svg>`;

export const PATTACHITRA_BORDER = `url("data:image/svg+xml,${encodeURIComponent(TILE.replace(/\n\s*/g, ""))}")`;

/** A vertical Pattachitra border strip; place it absolutely along an edge. */
export function PattachitraBorder({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div
      aria-hidden
      className={`w-[26px] ${className}`}
      style={{
        backgroundImage: PATTACHITRA_BORDER,
        backgroundRepeat: "repeat-y",
        backgroundSize: "26px 60px",
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    />
  );
}
