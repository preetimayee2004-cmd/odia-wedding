import { useRef, type CSSProperties } from "react";
import { wedding } from "@/config/wedding";
import { JhotiRule } from "@/components/ui/JhotiThreshold";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { EASE } from "@/lib/motion";

// The countdown section's text colours
const VERMILION = "#7A1424"; // headings (the countdown's maroon)
const LABEL = "#A6782C"; // eyebrow and chapter labels (the countdown's gold)
const TEXT = "#2B1A14"; // paragraphs (the countdown's ink)
const LINE = "#B4483E"; // hearts and the underline: muted vermilion
const STRING = "#4A2A1A";
const COUPLE = { w: 202, h: 228 };
/** How long the scroll takes to unroll. */
const UNROLL_MS = 2200;
/** Room on each side for the page's looped side bands. */
const BAND = "calc(100% * 35 / 768)";

/**
 * Section 05 — Our Story.
 * On the page cream with its faint white flowers, a hanging scroll (after
 * the couple's design): the thread from the countdown's wheel comes down to a
 * nail, and from it the scroll hangs by a string — maroon rods with wooden
 * knobs, parchment between. It unrolls as it comes into view, showing
 * "Two Hearts, One Journey", the four chapters (alternating left and right),
 * and the bride and groom at its foot among small hearts.
 */
export function Story() {
  const { eyebrow, heading, chapters } = wedding.story;
  const reduced = usePrefersReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const seen = useInView(scrollRef, { threshold: 0.12 });
  const open = seen || reduced;

  const unroll = `${UNROLL_MS}ms ${EASE.temple}`;
  const reveal = (delay: number): CSSProperties => ({
    opacity: open ? 1 : 0,
    transition: `opacity 900ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section
      id="story"
      aria-labelledby="story-heading"
      className="relative overflow-x-clip pb-7"
    >
      <div className="relative mx-auto" style={{ width: `min(calc(100% - 2 * (${BAND} + 10px)), 27rem)` }}>
        {/* The thread from the countdown's wheel, down to the nail; the string to the rod */}
        <Hanger />

        {/* The top rod */}
        <Rod />

        {/* The parchment, unrolling, with the bottom rod travelling down its edge */}
        <div ref={scrollRef} className="relative mx-[14px]">
          <div
            className="relative overflow-hidden px-6 pb-0 pt-8 shadow-[0_14px_30px_-16px_rgb(70_35_10/0.55)]"
            style={{
              background:
                "linear-gradient(to bottom, rgb(110 60 20 / 0.2), transparent 20px, transparent calc(100% - 24px), rgb(110 60 20 / 0.24)), radial-gradient(130% 90% at 50% 40%, #FBF3E2 0%, #F4E5C8 62%, #E8D1A8 100%)",
              clipPath: open ? "inset(-30px -30px -30px -30px)" : "inset(-30px -30px 100% -30px)",
              transition: `clip-path ${unroll}`,
            }}
          >
            <EdgeOrnaments />

            <header className="relative text-center" style={reveal(500)}>
              <p className="t-label leading-none" style={{ color: LABEL }}>
                {eyebrow}
              </p>
              <h2 id="story-heading" className="t-heading mt-1.5 leading-none" style={{ color: VERMILION }}>
                {heading}
              </h2>
              <JhotiRule motif="champa" className="mt-3" />
            </header>

            <ol className="relative mt-7">
              {chapters.map((c, i) => {
                const left = i % 2 === 0;
                return (
                  <li
                    key={c.label}
                    className={`relative ${i ? "mt-7" : ""} ${left ? "mr-[5%] text-left" : "ml-[5%] text-right"}`}
                    style={reveal(700 + i * 300)}
                  >
                    <p className="t-label leading-none">
                      {c.label}
                    </p>
                    <h3 className="mt-1.5 font-serif text-[26px] font-semibold leading-[1.15]" style={{ color: VERMILION }}>
                      {c.title}
                    </h3>
                    <p className="t-body mt-1.5" style={{ color: TEXT }}>
                      {c.text}
                    </p>
                  </li>
                );
              })}
            </ol>

            {/* The bride and groom at the scroll's foot, among small hearts */}
            <div className="relative mx-auto mt-4 w-[58%] max-w-[12rem]" style={reveal(700 + chapters.length * 300)}>
              <Heart className="absolute -left-[30%] top-[22%] h-5 w-5" filled />
              <Heart className="absolute -left-[12%] top-[2%] h-3.5 w-3.5" />
              <Heart className="absolute -right-[26%] top-[14%] h-4 w-4" />
              <Heart className="absolute -right-[34%] top-[46%] h-5 w-5" filled />
              <Heart className="absolute -left-[36%] top-[62%] h-3.5 w-3.5" />
              <img
                src="/art/story/couple.png"
                alt="The bride and groom sitting together, his arm around her"
                width={COUPLE.w}
                height={COUPLE.h}
                decoding="async"
                loading="lazy"
                className="relative block h-auto w-full"
              />
            </div>
          </div>

          <Rod
            className="absolute -inset-x-[14px] -mt-[9px]"
            style={{ top: open ? "100%" : "0%", transition: `top ${unroll}` }}
          />
        </div>
      </div>
    </section>
  );
}

/**
 * The thread from the countdown's wheel divider coming down the middle of the
 * page to a nail, and the string from the nail out to both ends of the rod.
 */
function Hanger() {
  return (
    <div aria-hidden className="relative h-[92px]">
      <svg viewBox="0 0 12 40" preserveAspectRatio="none" className="absolute left-1/2 top-0 h-[40px] w-3 -translate-x-1/2">
        <path d="M6 0c.7 12-.6 22 0 40" fill="none" stroke="#A6782C" strokeWidth="1.15" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <svg viewBox="0 0 100 52" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[52px] w-full">
        <path d="M50 2 6 50M50 2 94 50" fill="none" stroke={STRING} strokeWidth="1.3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* the nail */}
      <span
        className="absolute left-1/2 top-[34px] h-[13px] w-[13px] -translate-x-1/2 rounded-full shadow-[0_2px_3px_rgb(0_0_0/0.35)]"
        style={{ background: "radial-gradient(circle at 35% 30%, #E6E6E6, #9A9A9A 45%, #5A5A5A)" }}
      />
    </div>
  );
}

/** A maroon scroll rod with a turned wooden knob at each end. */
function Rod({ className = "relative", style }: { className?: string; style?: CSSProperties }) {
  const knob = "radial-gradient(circle at 38% 32%, #C48A55, #8A5128 48%, #4E2A12)";
  return (
    <div aria-hidden className={`z-[1] h-[18px] ${className}`} style={style}>
      <span
        className="absolute inset-y-[2px] left-[9px] right-[9px] rounded-full shadow-[0_3px_5px_-1px_rgb(50_20_5/0.45)]"
        style={{ background: "linear-gradient(to bottom, #C2454A, #8E1B1F 45%, #5E0E12)" }}
      />
      <span className="absolute left-0 top-0 h-[18px] w-[15px] rounded-full" style={{ background: knob }} />
      <span className="absolute right-0 top-0 h-[18px] w-[15px] rounded-full" style={{ background: knob }} />
    </div>
  );
}

/** Short wavy ink strokes down both edges of the parchment, as in the couple's design. */
function EdgeOrnaments() {
  const marks: Array<{ side: "left" | "right"; top: string }> = [
    { side: "left", top: "13%" },
    { side: "right", top: "30%" },
    { side: "left", top: "47%" },
    { side: "right", top: "64%" },
    { side: "left", top: "80%" },
  ];
  return (
    <>
      {marks.map((m) => (
        <svg
          key={`${m.side}${m.top}`}
          aria-hidden
          viewBox="0 0 12 44"
          className={`absolute h-11 w-3 ${m.side === "left" ? "left-2" : "right-2"}`}
          style={{ top: m.top }}
          fill="none"
          stroke="#B0855A"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.75"
        >
          <path d="M3 2c3 3-3 6 0 9s-3 6 0 9 3 6 0 9-3 6 0 9 3 4 0 5" />
          <path d="M8 2c3 3-3 6 0 9s-3 6 0 9 3 6 0 9-3 6 0 9 3 4 0 5" />
        </svg>
      ))}
    </>
  );
}

/** A small hand-drawn heart. */
function Heart({ className = "", filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke={LINE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.2 20.3C7 16.6 3.4 13.2 3.6 9.1 3.8 6.2 6 4.4 8.3 4.6c1.9.1 3.1 1.4 3.8 2.9.8-1.6 2.2-2.9 4.2-2.9 2.5.1 4.3 2.1 4.1 4.8-.3 4-4 7.4-8.2 10.9Z" fill={filled ? `${LINE}CC` : `${LINE}1A`} />
      <path d="M6.4 8.2c.3-1 1-1.6 1.9-1.7" strokeOpacity="0.6" />
    </svg>
  );
}

