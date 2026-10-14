import { useRef } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { formatVenueDate, parseVenueDateTime } from "@/lib/venueTime";

// Continues the calm evening sea at the foot of the thank-you screen.
const SEA = "#141539";
const GOLD = "#D9B877";
const TEXT_SOFT = "#BFB3A0";

/**
 * Closing sign-off, beneath the thank-you screen.
 * Identity: a gold thread draws outward from a small diamond, then the
 * couple's names settle beneath it. Deliberately not a "site footer".
 */
export function Footer() {
  const { blessing, credit } = wedding.footer;
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
      id="closing"
      aria-label="Closing note"
      data-status-tone="light"
      className="px-[var(--gutter)] pb-[max(3.5rem,env(safe-area-inset-bottom))] pt-8 text-center"
      style={{ backgroundColor: SEA }}
    >
      <div aria-hidden className="flex items-center justify-center gap-3">
        <span className="h-px w-20 bg-gradient-to-l from-[#D9B877]/80 to-transparent" style={thread("right")} />
        <span className="h-2 w-2 rotate-45" style={{ ...fade(0), backgroundColor: GOLD }} />
        <span className="h-px w-20 bg-gradient-to-r from-[#D9B877]/80 to-transparent" style={thread("left")} />
      </div>

      <div style={fade(600)}>
        <p className="mt-8 text-[0.6875rem] font-medium uppercase tracking-eyebrow" style={{ color: TEXT_SOFT }}>
          {blessing}
        </p>
        <p className="mt-2 font-script text-[2.6rem] leading-tight" style={{ color: GOLD }}>
          {bride.displayName} <span className="font-display text-2xl italic text-[#F3E4C4]/70">&amp;</span>{" "}
          {groom.displayName}
        </p>
        {date && (
          <p className="mt-1 text-[0.75rem] font-medium uppercase tracking-[0.18em]" style={{ color: TEXT_SOFT }}>
            {date.day} {date.month} {date.year}
          </p>
        )}
        {credit && (
          <p className="mt-10 text-[0.6875rem]" style={{ color: TEXT_SOFT }}>
            {credit}
          </p>
        )}
      </div>
    </footer>
  );
}
