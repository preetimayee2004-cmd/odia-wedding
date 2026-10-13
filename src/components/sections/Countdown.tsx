import { useEffect, useRef, useState } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import {
  dateKey,
  formatVenueDate,
  parseVenueDateTime,
  venueDateKey,
  venueInstant,
  zoneLabel,
  type VenueDateTime,
} from "@/lib/venueTime";
import { LotusMandala } from "@/components/art/LotusMandala";
import { Pending } from "@/components/ui/Pending";

const DAY = 86_400_000;

/** Re-renders on every whole second. */
function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        setNow(Date.now());
        schedule();
      }, 1000 - (Date.now() % 1000));
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);
  return now;
}

/**
 * Section 04 — Wedding countdown (PRD §4.04).
 * Hidden in production until the wedding date is configured.
 */
export function Countdown() {
  const parts = parseVenueDateTime(wedding.wedding.dateTime);
  if (!parts && !import.meta.env.DEV) return null;
  return <CountdownSection parts={parts} />;
}

type Phase = "pending" | "counting" | "today" | "after";

function CountdownSection({ parts }: { parts: VenueDateTime | null }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const now = useNow();
  const tz = wedding.wedding.timeZone;
  const { heading, weddingDayMessage, completedMessage } = wedding.countdown;

  const target = parts ? venueInstant(parts, tz) : null;
  const phase: Phase =
    !parts || target === null
      ? "pending"
      : now < target
        ? "counting"
        : venueDateKey(now, tz) === dateKey(parts)
          ? "today"
          : "after";

  const remaining = phase === "counting" ? target! - now : 0;
  const units = [
    { label: "Days", value: Math.floor(remaining / DAY) },
    { label: "Hours", value: Math.floor((remaining % DAY) / 3_600_000) },
    { label: "Minutes", value: Math.floor((remaining % 3_600_000) / 60_000) },
    { label: "Seconds", value: Math.floor((remaining % 60_000) / 1000) },
  ];

  const date = parts && formatVenueDate(parts);
  const dateText = date && `${date.day} ${date.month} ${date.year}`;
  const message =
    phase === "today" ? weddingDayMessage : phase === "after" ? completedMessage.replace("{date}", dateText ?? "") : null;

  const fadeIn = (delay: number) => ({
    opacity: inView ? 1 : 0,
    transition: `opacity 900ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section
      ref={ref}
      id="countdown"
      aria-labelledby="countdown-heading"
      className="section flex flex-col items-center text-center"
    >
      <p className="eyebrow" style={fadeIn(0)}>
        {phase === "today" ? "The wedding day" : phase === "after" ? "Our wedding day" : "Until the wedding"}
      </p>
      <h2 id="countdown-heading" className="mt-3 text-[2rem]" style={fadeIn(100)}>
        {heading}
      </h2>

      <div className="relative mt-8 aspect-square w-[18.75rem] short:w-[16.5rem]">
        <LotusMandala drawn={inView} className="absolute inset-0 h-full w-full" />

        {message ? (
          <p
            className="absolute inset-[24%] flex items-center justify-center font-display text-lg italic leading-snug text-sindoor"
            style={fadeIn(1100)}
          >
            {message}
          </p>
        ) : (
          <div role="timer" aria-live="off" className="absolute inset-[26%] grid grid-cols-2 grid-rows-2" style={fadeIn(1100)}>
            <span aria-hidden className="absolute bottom-[12%] left-1/2 top-[12%] w-px bg-gold/50" />
            <span aria-hidden className="absolute left-[12%] right-[12%] top-1/2 h-px bg-gold/50" />
            {units.map((u) => (
              <div key={u.label} className="flex flex-col items-center justify-center">
                <span className="font-display text-[2.25rem] font-medium leading-none text-sindoor [font-variant-numeric:lining-nums_tabular-nums]">
                  {phase === "pending" ? "--" : u.label === "Days" ? u.value : String(u.value).padStart(2, "0")}
                </span>
                <span className="mt-1 text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-ink-soft">
                  {u.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-xs tracking-wide text-ink-soft" style={fadeIn(1300)}>
        {phase === "pending" ? (
          <Pending label="Wedding date awaiting confirmation">Countdown begins once the date is confirmed</Pending>
        ) : (
          <p>
            {dateText}
            {date?.time && ` · ${date.time} ${zoneLabel(target!, tz)}`}
          </p>
        )}
      </div>
    </section>
  );
}
