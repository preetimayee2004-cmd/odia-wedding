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

// Inside the mockup the site runs edge to edge under a floating status bar
// (like a real iPhone), so content that hugs the top adds this inset.
const FRAMED_STATUS_BAR = "54px";
if (isFramed) document.documentElement.style.setProperty("--status-bar", FRAMED_STATUS_BAR);

/** Status bar text colour in the mockup: "light" over dark scenes. */
export type StatusTone = "dark" | "light";
export const STATUS_MESSAGE = "tila:status-tone";

/** Tells the desktop mockup (if any) which status bar colour suits the scene. */
export function setStatusTone(tone: StatusTone) {
  if (!isFramed || window.parent === window) return;
  window.parent.postMessage({ type: STATUS_MESSAGE, tone }, window.location.origin);
}

/**
 * Once the opening is over, keeps the mockup's status bar legible: light
 * while a dark scene (marked data-status-tone="light") passes beneath it.
 * Returns a cleanup function.
 */
export function watchStatusTone(): () => void {
  if (!isFramed || window.parent === window) return () => {};
  const y = parseFloat(FRAMED_STATUS_BAR) / 2;
  let current: StatusTone | null = null;
  let frame = 0;
  const update = () => {
    frame = 0;
    const dark = Array.from(document.querySelectorAll<HTMLElement>('[data-status-tone="light"]')).some((el) => {
      const r = el.getBoundingClientRect();
      return r.top <= y && r.bottom >= y;
    });
    const tone: StatusTone = dark ? "light" : "dark";
    if (tone !== current) {
      current = tone;
      setStatusTone(tone);
    }
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    cancelAnimationFrame(frame);
  };
}
