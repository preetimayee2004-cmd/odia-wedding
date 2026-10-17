import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const SIZE = 52;
/** Where it waits between sections: the right gutter, near the top of the screen. */
const WAIT_RIGHT = 34;
const WAIT_AT = 0.16;
/** A dock is landed on while its centre is between these heights (as shares of the screen). */
const LAND_TOP = 0.24;
const LAND_BOTTOM = 0.55;
/** It leaves for the right gutter as the dock rises from LAND_TOP to here. */
const LEAVE_BY = 0.1;
/** It flies to the next dock as that dock rises from here to LAND_BOTTOM. */
const FLY_FROM = 0.9;
const SPIN = 0.45; // degrees per px scrolled

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2); // easeInOutQuad
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The marigold itself: 12 outer petals, 6 inner, a deep centre. */
export function MarigoldHead() {
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx="0" cy="-14.5" rx="5" ry="9.5" fill="#F2A12B" transform={`rotate(${i * 30})`} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={`i${i}`} cx="0" cy="-8" rx="4.4" ry="7" fill="#E8801A" transform={`rotate(${i * 60 + 30})`} />
      ))}
      <circle r="6.2" fill="#C4600A" />
      <circle r="6.2" fill="none" stroke="#9E4A06" strokeWidth="0.7" strokeDasharray="1.3 1.2" opacity="0.6" />
    </>
  );
}

/**
 * The scroll companion: one marigold that travels with the reader. It sits
 * on each section's dock (ui/Dock.tsx) while the dock is in the upper middle
 * of the screen, slips to the right gutter as the dock rises away, and flies
 * on a curve to the next dock as that one comes up. It spins with the
 * scroll, so it turns while it travels and rests when the page rests. Only
 * transform and opacity change, once per frame. Hidden for reduced motion
 * (the docks show still marigolds instead).
 */
export function MarigoldCompanion() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const spinRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    const spin = spinRef.current;
    if (!el || !spin) return;
    let landed: HTMLElement | null = null;
    let frame = 0;

    const tick = () => {
      frame = 0;
      const vh = window.innerHeight;
      const vw = document.documentElement.clientWidth;
      const docks = [...document.querySelectorAll<HTMLElement>("[data-dock]")].map((d) => {
        const r = d.getBoundingClientRect();
        const y = r.top + r.height / 2;
        // a dock too near the top of the page to scroll down into the landing band (the couple card's)
        // counts as sitting at the band's foot when the page is at the top, and rises from there
        const lift = Math.max(0, LAND_BOTTOM * vh - (y + window.scrollY));
        return { el: d, x: r.left + r.width / 2, y, v: (y + lift) / vh };
      });
      if (!docks.length) {
        el.style.opacity = "0";
        return;
      }
      const wx = vw - WAIT_RIGHT;
      const wy = vh * WAIT_AT;

      // the current dock: the last one that has risen to the landing band
      let ci = -1;
      docks.forEach((d, i) => {
        if (d.v <= LAND_BOTTOM) ci = i;
      });
      let x = wx;
      let y = wy;
      let s = 0.6;
      let opacity = 1;
      let on: HTMLElement | null = null;
      if (ci >= 0) {
        const c = docks[ci];
        if (c.v >= LAND_TOP) {
          x = c.x;
          y = c.y;
          s = 1;
          on = c.el;
        } else if (c.v >= LEAVE_BY) {
          const t = ease((LAND_TOP - c.v) / (LAND_TOP - LEAVE_BY));
          x = lerp(c.x, wx, t);
          y = lerp(c.y, wy, t);
          s = lerp(1, 0.6, t);
        }
      } else {
        // before the first dock: waiting in the gutter, fading in as it comes
        opacity = clamp((1.15 - docks[0].v) / 0.25);
      }

      // flying to the next dock as it rises into the landing band
      const n = docks[ci + 1];
      if (n && n.v < FLY_FROM && n.v > LAND_BOTTOM) {
        const p = ease((FLY_FROM - n.v) / (FLY_FROM - LAND_BOTTOM));
        const u = 1 - p;
        x = u * u * x + 2 * u * p * wx + p * p * n.x;
        y = u * u * y + 2 * u * p * n.y + p * p * n.y;
        s = lerp(s, 1, p);
        on = null;
      }

      el.style.transform = `translate3d(${(x - SIZE / 2).toFixed(1)}px, ${(y - SIZE / 2).toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(3);
      spin.style.transform = `rotate(${(window.scrollY * SPIN).toFixed(1)}deg)`;

      // the dock it sits on glows; the first landing on each throws petals
      if (on !== landed) {
        landed?.classList.remove("is-landed");
        on?.classList.add("is-landed", "is-burst");
        landed = on;
      }
    };
    const soon = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", soon, { passive: true });
    window.addEventListener("resize", soon);
    const ro = new ResizeObserver(soon); // the page changing height (an event card opening)
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", soon);
      window.removeEventListener("resize", soon);
      ro.disconnect();
      landed?.classList.remove("is-landed");
    };
  }, [reduced]);

  if (reduced) return null;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[35]" style={{ width: SIZE, height: SIZE, opacity: 0, willChange: "transform" }}>
      {/* a soft warm glow behind it */}
      <span className="absolute -inset-3 rounded-full" style={{ background: "radial-gradient(circle, rgb(255 190 90 / 0.5), rgb(255 190 90 / 0) 68%)" }} />
      <svg ref={spinRef} viewBox="-26 -26 52 52" className="relative block h-full w-full" style={{ filter: "drop-shadow(0 2px 3px rgb(120 60 10 / 0.3))" }}>
        <MarigoldHead />
      </svg>
    </div>
  );
}
