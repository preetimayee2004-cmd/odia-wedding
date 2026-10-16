import { useRef } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { formatVenueDate, parseVenueDateTime } from "@/lib/venueTime";

const GOLD = "#A6782C";

/**
 * Closing sign-off, beneath the thank-you screen.
 * Identity: a gold thread draws outward from a small diamond, then the
 * couple's names settle beneath it. Deliberately not a "site footer".
 */
export function Footer() {
  const { blessing, credit } = wedding.footer;
  const [first, second] = wedding.invitation.names;
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
      className="px-[var(--gutter)] pb-[max(3.5rem,env(safe-area-inset-bottom))] pt-8 text-center"
    >
      <div aria-hidden className="flex items-center justify-center gap-3">
        <span className="h-px w-20 bg-gradient-to-l from-[#A6782C]/80 to-transparent" style={thread("right")} />
        <span className="h-2 w-2 rotate-45" style={{ ...fade(0), backgroundColor: GOLD }} />
        <span className="h-px w-20 bg-gradient-to-r from-[#A6782C]/80 to-transparent" style={thread("left")} />
      </div>

      <div style={fade(600)}>
        <p className="t-label mt-8">
          {blessing}
        </p>
        <p className="t-names mt-2">
          {first} <span className="t-amp">&amp;</span>{" "}
          {second}
        </p>
        {date && (
          <p className="t-label mt-1">
            {date.day} {date.month} {date.year}
          </p>
        )}
        {credit && (
          <p className="t-note mt-10">
            {credit}
          </p>
        )}
      </div>
    </footer>
  );
}
