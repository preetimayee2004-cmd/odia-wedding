import { useRef } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { formatVenueDate, parseVenueDateTime } from "@/lib/venueTime";
import { SectionSeparator } from "@/components/ui/SectionSeparator";

/**
 * Closing sign-off, beneath the thank-you screen.
 * Opened by the separator system's closing signature (a maroon bloom with two
 * leaves), then the couple's names settle beneath it. Deliberately not a
 * "site footer".
 */
export function Footer() {
  const { blessing, credit } = wedding.footer;
  const [first, second] = wedding.invitation.names;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });

  const parts = parseVenueDateTime(wedding.wedding.dateTime);
  const date = parts && formatVenueDate(parts);

  const fade = (delay: number) => ({ opacity: inView ? 1 : 0, transition: `opacity 900ms ${EASE.silk} ${delay}ms` });

  return (
    <footer
      ref={ref}
      id="closing"
      aria-label="Closing note"
      className="px-[var(--gutter)] pb-[max(3.5rem,env(safe-area-inset-bottom))] pt-8 text-center"
    >
      <div style={fade(0)}>
        <SectionSeparator emblem="maroon" pull="none" />
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
