import { useEffect, useRef, useState } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { EASE } from "@/lib/motion";
import { scrollToSection } from "@/lib/scroll";
import { SectionSeparator } from "@/components/ui/SectionSeparator";

const TYPE_MS = 55; // per character

/**
 * The closing note, beneath the thank-you screen (after the couple's
 * design). Opened by the separator system's closing signature, the line
 * "Your presence will make our celebration complete." types itself out
 * behind a blinking caret; then "|| ପ୍ରେମ ଓ ପବିତ୍ର ବନ୍ଧନ ||", the couple's
 * initials with a heart between them, and "Back to top", which returns to
 * the couple card. Deliberately not a "site footer".
 */
export function Footer() {
  const { quote, odiaLine, credit } = wedding.footer;
  const [first, second] = wedding.invitation.names;
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.35 });
  const [typed, setTyped] = useState(0);
  const done = reduced || typed >= quote.length;

  // type the quote out once the note is on screen
  useEffect(() => {
    if (!inView || reduced) return;
    const t = window.setInterval(() => setTyped((n) => (n >= quote.length ? n : n + 1)), TYPE_MS);
    return () => clearInterval(t);
  }, [inView, reduced, quote.length]);

  const after = (delay: number) => ({
    opacity: done ? 1 : 0,
    transform: done ? "none" : "translateY(8px)",
    transition: `opacity 900ms ${EASE.silk} ${delay}ms, transform 1000ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <footer
      ref={ref}
      id="closing"
      aria-label="Closing note"
      className="px-[var(--gutter)] pb-[max(3.5rem,env(safe-area-inset-bottom))] pt-8 text-center"
    >
      <div style={{ opacity: inView ? 1 : 0, transition: `opacity 900ms ${EASE.silk}` }}>
        <SectionSeparator emblem="maroon" pull="none" />
      </div>

      {/* The quote, typed out behind a blinking caret (read whole by screen readers) */}
      <p className="mx-auto mt-6 max-w-[19rem] font-serif text-[24px] font-medium italic leading-snug" style={{ color: "var(--c-text)" }}>
        <span className="sr-only">{quote}</span>
        <span aria-hidden>
          {reduced ? quote : quote.slice(0, typed)}
          {!reduced && <span className={`caret ml-0.5 inline-block h-[0.95em] w-[1.5px] translate-y-[0.12em] ${done ? "caret-blink" : ""}`} style={{ backgroundColor: "var(--c-gold)" }} />}
        </span>
      </p>

      {odiaLine && (
        <p lang="or" className="t-odia mt-5 text-[19px]" style={{ ...after(200), color: "#A6782C" }}>
          {odiaLine}
        </p>
      )}

      {/* The couple's initials, a heart between them */}
      <p className="mt-6 font-serif text-[46px] font-semibold leading-none tracking-[2px]" style={{ ...after(500), color: "#B4483E" }}>
        <span className="sr-only">{`${first} and ${second}`}</span>
        {/* the Hastaganthi cord ends in a ring around these */}
        <span aria-hidden data-thread="monogram">
          {first.charAt(0)}
          <svg viewBox="0 0 24 22" className="mx-2.5 inline-block h-[0.62em] w-auto -translate-y-[0.05em]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
            <path d="M12 20C6 15.6 2 12 2 7.5 2 4.4 4.4 2 7.4 2c2 0 3.6 1.1 4.6 2.7C13 3.1 14.6 2 16.6 2 19.6 2 22 4.4 22 7.5 22 12 18 15.6 12 20Z" />
          </svg>
          {second.charAt(0)}
        </span>
      </p>

      <button
        type="button"
        onClick={() => void scrollToSection("couple", 1600)}
        className="mt-7 inline-flex min-h-11 items-center gap-1.5 px-3 font-sans text-[15px] font-medium"
        style={{ ...after(800), color: "var(--c-text)" }}
      >
        Back to top <span aria-hidden>↑</span>
      </button>

      {credit && <p className="t-note mt-8">{credit}</p>}
    </footer>
  );
}
