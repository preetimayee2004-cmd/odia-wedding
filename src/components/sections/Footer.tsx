import { useRef } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { formatVenueDate, parseVenueDateTime } from "@/lib/venueTime";
import { ChanduaPatch } from "@/components/art/Chandua";

/**
 * Section 14 — Footer and love notice (PRD §4.13).
 * Identity: a gold thread draws outward from a small applique medallion,
 * then the closing words settle beneath it. Deliberately not a "site footer".
 */
export function Footer() {
  const { blessing, loveNotice, credit } = wedding.footer;
  const { bride, groom } = wedding.couple;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });

  const parts = parseVenueDateTime(wedding.wedding.dateTime);
  const date = parts && formatVenueDate(parts);

  const fade = (delay: number) => ({ opacity: inView ? 1 : 0, transition: `opacity 900ms ${EASE.silk} ${delay}ms` });
  const thread = (origin: "left" | "right") => ({
    transform: inView ? "scaleX(1)" : "scaleX(0)",
    transformOrigin: origin,
    transition: `transform 1100ms ${EASE.silk} 200ms`,
  });

  return (
    <footer
      ref={ref}
      aria-label="Closing note"
      className="px-[var(--gutter)] pb-[max(3.5rem,env(safe-area-inset-bottom))] pt-16 text-center"
    >
      <div aria-hidden className="flex items-center justify-center gap-3">
        <span className="h-px w-20 bg-gradient-to-l from-gold to-transparent" style={thread("right")} />
        <span style={{ ...fade(0), transform: inView ? "none" : "scale(0.6)", transition: `opacity 600ms, transform 800ms ${EASE.silk}` }}>
          <ChanduaPatch variant={2} className="h-7 w-7" />
        </span>
        <span className="h-px w-20 bg-gradient-to-r from-gold to-transparent" style={thread("left")} />
      </div>

      <p className="mx-auto mt-8 max-w-[18rem] font-display text-[1.15rem] italic leading-relaxed text-ink" style={fade(700)}>
        {loveNotice}
      </p>

      <div style={fade(1100)}>
        <p className="eyebrow mt-8">{blessing}</p>
        <p className="mt-2 font-script text-[2.6rem] leading-tight text-sindoor">
          {bride.displayName} <span className="font-display text-2xl italic text-gold-deep">&amp;</span>{" "}
          {groom.displayName}
        </p>
        {date && (
          <p className="mt-1 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-ink-soft">
            {date.day} {date.month} {date.year}
          </p>
        )}
        {credit && <p className="mt-10 text-[0.6875rem] text-ink-soft/80">{credit}</p>}
      </div>
    </footer>
  );
}
