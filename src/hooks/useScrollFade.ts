import { useEffect, type RefObject } from "react";
import { usePrefersReducedMotion } from "./useMediaQuery";

/**
 * Hero parallax: as the page scrolls past, the element drifts down at
 * `speed` × scroll and fades out over one viewport height. Writes styles
 * directly (no re-renders), throttled to one update per frame.
 */
export function useScrollFade(ref: RefObject<HTMLElement>, enabled: boolean, speed = 0.3) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || reducedMotion) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const vh = window.innerHeight;
      if (y > vh * 1.5) return; // off-screen — nothing to do
      el.style.transform = y ? `translate3d(0, ${y * speed}px, 0)` : "";
      el.style.opacity = String(Math.max(0, 1 - y / (vh * 0.85)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      el.style.transform = "";
      el.style.opacity = "";
    };
  }, [ref, enabled, reducedMotion, speed]);
}
