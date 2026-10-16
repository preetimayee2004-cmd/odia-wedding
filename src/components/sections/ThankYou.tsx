import { useRef } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { PranamHands } from "@/components/art/PranamHands";

const DRAW_MS = 2600;
const GOLD = "#A6782C";
const MAROON = "#7A1424";
// The page's ochre cream, with a soft warm glow behind the hands.
const SKY = "radial-gradient(60% 40% at 50% 38%, rgb(255 248 230 / 0.7), transparent 70%)";
// A few early stars: [left %, top %, size px, opacity]
const STARS: Array<[number, number, number, number]> = [
  [14, 12, 2, 0.55],
  [78, 9, 1.5, 0.45],
  [88, 24, 2, 0.35],
  [24, 31, 1.5, 0.3],
  [64, 17, 1.5, 0.4],
  [8, 52, 1.5, 0.25],
  [92, 58, 1.5, 0.25],
];

/**
 * Section 11 — Thank You (The Mahaprasad Grace).
 * One quiet, minimal screen of charcoal evening sky: golden line-art hands joined in Pranam,
 * holding a Tulsi leaf, trace themselves in; then the words of gratitude.
 */
export function ThankYou() {
  const { heading, message, closing } = wedding.thankYou;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.4 });

  const fade = (delay: number) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(8px)",
    transition: `opacity 1100ms ${EASE.silk} ${delay}ms, transform 1300ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section
      ref={ref}
      id="thank-you"
      aria-labelledby="thanks-heading"
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-[var(--gutter)] pb-[max(4rem,env(safe-area-inset-bottom))] pt-[calc(4rem_+_var(--status-bar,0px))] text-center"
      style={{ background: SKY }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {STARS.map(([x, y, size, opacity]) => (
          <span
            key={`${x}-${y}`}
            className="absolute rounded-full bg-[#C9A25A]"
            style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, opacity }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        <PranamHands className="h-[min(30dvh,13.5rem)] w-auto" color={GOLD} drawn={inView} duration={DRAW_MS} />

        <h2 id="thanks-heading" className="t-heading mt-8" style={{ ...fade(DRAW_MS * 0.6), color: MAROON }}>
          {heading}
        </h2>
        <p
          className="t-quote mx-auto mt-4 max-w-[19rem]"
          style={fade(DRAW_MS * 0.6 + 400)}
        >
          {message}
        </p>
        <p className="t-blessing mt-8" style={{ ...fade(DRAW_MS + 400), color: GOLD }}>
          {closing}
        </p>
      </div>
    </section>
  );
}
