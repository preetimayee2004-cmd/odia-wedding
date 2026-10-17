import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { rng } from "@/components/art/eventVineArt";

/**
 * Soft rose and marigold petals drifting down the screen, over everything
 * from the couple card to the footer. Place it as the first child of a
 * `relative` box around those sections: it fills the box, and a screen-tall
 * layer inside stays stuck to the viewport while the guest scrolls, so the
 * petals fall across the screen but never above the couple card. They pause
 * while the box is off screen and are left out when reduced motion is
 * preferred. Styles: `.site-petal` in index.css.
 */
export function FallingPetals() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const petals = useMemo(() => {
    const R = rng(77);
    return Array.from({ length: 7 }, (_, k) => {
      const d = 13 + R() * 11;
      return {
        rose: k % 2 === 0,
        style: {
          "--x": `${(R() * 100).toFixed(1)}%`,
          "--d": `${d.toFixed(1)}s`,
          "--delay": `${(-R() * d).toFixed(1)}s`,
          "--s": (0.75 + R() * 0.7).toFixed(2),
          "--drift": `${(16 + R() * 30).toFixed(0)}px`,
          "--r0": `${(R() * 360).toFixed(0)}deg`,
        } as CSSProperties,
      };
    });
  }, []);

  if (reduced) return null;

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 z-[25] overflow-clip ${onScreen ? "" : "petals-paused"}`}>
      <svg className="absolute h-0 w-0">
        <defs>
          <radialGradient id="site-petal-rose" cx="0.4" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#FCD7DC" />
            <stop offset="0.6" stopColor="#EF9CAA" />
            <stop offset="1" stopColor="#D9687C" />
          </radialGradient>
          <linearGradient id="site-petal-mari" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#E2700E" />
            <stop offset="1" stopColor="#FFB62E" />
          </linearGradient>
        </defs>
      </svg>
      <div className="sticky top-0 h-[100lvh] w-full">
        {petals.map((p, k) => (
          <span key={k} className="site-petal" style={p.style}>
            <svg viewBox="-8 -8 16 16">
              {p.rose ? (
                <path d="M0-7C5-7 8-2 7 3 6 7 2 8 0 6-2 8-6 7-7 3-8-2-5-7 0-7Z" fill="url(#site-petal-rose)" />
              ) : (
                <path d="M0 7C-5 4-6-2-4-6Q-2-8 0-6.5 2-8 4-6C6-2 5 4 0 7Z" fill="url(#site-petal-mari)" />
              )}
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
