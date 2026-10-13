const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Eased window scroll with a controlled duration (native smooth scrolling
 * can't be timed). Stops immediately if the guest touches or wheels, so it
 * never fights them. Jumps instantly when reduced motion is preferred.
 */
export function smoothScrollTo(targetY: number, duration = 1100): Promise<void> {
  const startY = window.scrollY;
  const distance = targetY - startY;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || Math.abs(distance) < 2) {
    window.scrollTo(0, targetY);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let frame = 0;
    const start = performance.now();
    const stop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      resolve();
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      window.scrollTo(0, startY + distance * easeInOutCubic(t));
      if (t < 1) frame = requestAnimationFrame(step);
      else stop();
    };
    frame = requestAnimationFrame(step);
  });
}

export function scrollToSection(id: string, duration?: number) {
  const el = document.getElementById(id);
  if (!el) return Promise.resolve();
  return smoothScrollTo(el.getBoundingClientRect().top + window.scrollY, duration);
}
