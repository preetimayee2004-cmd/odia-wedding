/**
 * Responsive strategy
 * -------------------
 *  < 768px        Phone — the primary target (98% of traffic). Full-bleed, no mockup.
 *  768–1023px     Tablet — full-bleed cream background, content held in a centred column.
 *  ≥ 1024px with  Desktop — the live site runs inside an iPhone 17 Pro Max mockup.
 *  a fine pointer
 *
 * The mockup renders the site in an <iframe> at true phone width (440px), so
 * every section sees a real mobile viewport: Tailwind breakpoints, 100dvh,
 * position:fixed modals and scroll-driven effects all behave exactly as on a
 * phone. The `hover/pointer` check keeps large touch tablets (iPad landscape)
 * full-bleed instead of showing them a phone.
 */
export const DESKTOP_MOCKUP_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

const FRAME_PARAM = "frame";

/** True when this document is the site rendered inside the desktop mockup. */
export const isFramed: boolean =
  new URLSearchParams(window.location.search).get(FRAME_PARAM) === "1";

/** Current URL (guest param, hash and all) marked as the framed copy. */
export function framedUrl(): string {
  const url = new URL(window.location.href);
  url.searchParams.set(FRAME_PARAM, "1");
  return url.toString();
}
