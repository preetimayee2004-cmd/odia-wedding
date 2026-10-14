import { useEffect, useRef, useState, type RefObject } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
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
import { KonarkWheel } from "@/components/art/KonarkWheel";
import { Pending } from "@/components/ui/Pending";

const DAY = 86_400_000;
const MATTE = "#0D0A08";
const GOLD = "#C9A35E";
const TEXT = "#F3E4C4";
const TEXT_SOFT = "#BFA982";

/** Whether the element is currently on screen (unlike useInView, not one-shot). */
function useOnScreen(ref: RefObject<Element>): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return visible;
}

/** Re-renders on every whole second while `active`, so off-screen it costs nothing. */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        setNow(Date.now());
        schedule();
      }, 1000 - (Date.now() % 1000));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [active]);
  return now;
}

/**
 * The wheel turns into alignment as the section scrolls into view
 * (scroll-linked, never spinning on its own).
 */
function useAlignOnScroll(sectionRef: RefObject<HTMLElement>, wheelRef: RefObject<HTMLElement>) {
  const reducedMotion = usePrefersReducedMotion();
  useEffect(() => {
    const section = sectionRef.current;
    const wheel = wheelRef.current;
    if (!section || !wheel) return;
    if (reducedMotion) {
      wheel.style.transform = "none";
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the section's top meets the bottom of the screen, 1 when its centre is mid-screen
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh / 2 + r.height / 2)));
      wheel.style.transform = `rotate(${(-67.5 * (1 - p)).toFixed(2)}deg)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [sectionRef, wheelRef, reducedMotion]);
}

/**
 * Section 04 — The Cosmic Wheel.
 * On a deep matte-black strip, the countdown sits in the hub of the Konark
 * Sun Temple wheel, where the stone spokes meet — time aligning toward the
 * Lagna. Hidden in production until the wedding date is configured.
 */
export function Countdown() {
  const parts = parseVenueDateTime(wedding.wedding.dateTime);
  if (!parts && !import.meta.env.DEV) return null;
  return <CountdownSection parts={parts} />;
}

type Phase = "pending" | "counting" | "today" | "after";

function CountdownSection({ parts }: { parts: VenueDateTime | null }) {
  const ref = useRef<HTMLElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const now = useNow(useOnScreen(ref));
  useAlignOnScroll(ref, wheelRef);
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
  const days = Math.floor(remaining / DAY);
  const hours = Math.floor((remaining % DAY) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const two = (n: number) => (phase === "pending" ? "--" : String(n).padStart(2, "0"));

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
      data-status-tone="light"
      className="relative overflow-hidden px-[var(--gutter)] py-[var(--section-y)] text-center"
      style={{ backgroundColor: MATTE }}
    >
      <p className="text-[0.6875rem] font-medium uppercase tracking-eyebrow" style={{ ...fadeIn(0), color: TEXT_SOFT }}>
        {phase === "today" ? "The wedding day" : phase === "after" ? "Our wedding day" : "Until the Lagna"}
      </p>
      <h2 id="countdown-heading" className="mt-3 text-[2rem]" style={{ ...fadeIn(100), color: TEXT }}>
        {heading}
      </h2>

      <div className="relative mx-auto mt-10 aspect-square w-[min(86vw,20rem)]" style={fadeIn(200)}>
        {/* Lagna marker: the point time is turning toward */}
        <svg viewBox="0 0 16 12" aria-hidden className="absolute -top-4 left-1/2 h-3 w-4 -translate-x-1/2">
          <path d="M1 1h14L8 11Z" fill={GOLD} />
        </svg>

        <div ref={wheelRef} className="absolute inset-0 will-change-transform">
          <KonarkWheel className="h-full w-full" line={GOLD} fill="#17110C" />
        </div>

        {/* The hub, where the spokes meet */}
        <div role="timer" aria-live="off" className="absolute inset-[30%] flex flex-col items-center justify-center" style={{ color: TEXT }}>
          {message ? (
            <SunMark />
          ) : (
            <>
              <span className="font-display text-[2.6rem] font-medium leading-none [font-variant-numeric:lining-nums_tabular-nums]">
                {phase === "pending" ? "--" : days}
              </span>
              <span className="mt-0.5 text-[0.5rem] font-medium uppercase tracking-[0.24em]" style={{ color: TEXT_SOFT }}>
                Days
              </span>
              <span aria-hidden className="my-1.5 h-px w-10" style={{ backgroundColor: GOLD, opacity: 0.6 }} />
              <span className="font-display text-[1.15rem] leading-none [font-variant-numeric:lining-nums_tabular-nums]">
                {two(hours)}
                <span className="mx-0.5 opacity-60">:</span>
                {two(minutes)}
              </span>
              <span className="mt-0.5 text-[0.5rem] font-medium uppercase tracking-[0.2em]" style={{ color: TEXT_SOFT }}>
                Hrs · Min
              </span>
            </>
          )}
        </div>
      </div>

      {message && (
        <p className="mx-auto mt-8 max-w-[18rem] font-display text-[1.2rem] italic leading-snug" style={{ ...fadeIn(400), color: TEXT }}>
          {message}
        </p>
      )}

      <div className="mt-8 text-xs tracking-wide" style={{ ...fadeIn(500), color: TEXT_SOFT }}>
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

/** A small radiant sun for the hub once the Lagna has arrived. */
function SunMark() {
  return (
    <svg viewBox="0 0 40 40" className="h-12 w-12" aria-hidden>
      <circle cx="20" cy="20" r="7" fill={GOLD} />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d="M20 4v6" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" transform={`rotate(${i * 30} 20 20)`} />
      ))}
    </svg>
  );
}
