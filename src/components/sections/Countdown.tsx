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
const CRIMSON = "#800000";
const GOLD = "#D4AF37"; // mustard gold
const WHEEL_FILL = "#690000";
const TEXT = "#FBEBD0";
const TEXT_SOFT = "#E6C9A2";
const HUB = 94; // hub radius in the wheel's 300-unit box: room for four clocks

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
 * On deep Pattachitra crimson, a golden Konark Sun Temple wheel turns into
 * alignment; in its hub, four round clocks count the days, hours, minutes
 * and seconds to the Lagna. Hidden in production until the date is configured.
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
  const { heading, line, weddingDayMessage, completedMessage } = wedding.countdown;

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
  const seconds = Math.floor((remaining % 60_000) / 1000);
  const pending = phase === "pending";
  const clocks = [
    { label: "Days", value: days, of: Math.max(365, days) },
    { label: "Hours", value: hours, of: 24 },
    { label: "Mins", value: minutes, of: 60 },
    { label: "Secs", value: seconds, of: 60 },
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
      data-status-tone="light"
      className="relative overflow-hidden px-[var(--gutter)] py-[var(--section-y)] text-center"
      style={{ backgroundColor: CRIMSON }}
    >
      {/* A soft lamp-glow behind the wheel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 42% at 50% 56%, rgb(212 175 55 / 0.16), transparent 70%)" }}
      />
      <h2 id="countdown-heading" className="relative text-[2rem]" style={{ ...fadeIn(0), color: TEXT }}>
        {heading}
      </h2>
      <p className="relative mt-2 font-display text-[1.15rem] italic" style={{ ...fadeIn(150), color: GOLD }}>
        {phase === "today" ? "The auspicious Lagna is here." : phase === "after" ? "Blessed under the Lagna." : line}
      </p>

      <div className="relative mx-auto mt-9 aspect-square w-[min(90vw,21.5rem)]" style={fadeIn(250)}>
        {/* Lagna marker: the point time is turning toward */}
        <svg viewBox="0 0 16 12" aria-hidden className="absolute -top-4 left-1/2 h-3 w-4 -translate-x-1/2">
          <path d="M1 1h14L8 11Z" fill={GOLD} />
        </svg>

        <div ref={wheelRef} className="absolute inset-0 will-change-transform">
          <KonarkWheel className="h-full w-full" line={GOLD} fill={WHEEL_FILL} hub={HUB} />
        </div>

        {/* The hub, where the spokes meet: four round clocks */}
        <div
          role="timer"
          aria-live="off"
          aria-label={pending ? "Countdown begins once the date is confirmed" : `${days} days, ${hours} hours, ${minutes} minutes to go`}
          className="absolute flex items-center justify-center"
          style={{ inset: `${(((150 - HUB + 7) / 300) * 100).toFixed(2)}%`, color: TEXT }}
        >
          {message ? (
            <SunMark />
          ) : (
            <div aria-hidden className="grid h-[82%] w-[82%] grid-cols-2 gap-[5%]">
              {clocks.map((c) => (
                <Clock key={c.label} label={c.label} value={pending ? null : c.value} of={c.of} />
              ))}
            </div>
          )}
        </div>
      </div>

      {message && (
        <p className="mx-auto mt-8 max-w-[18rem] font-display text-[1.2rem] italic leading-snug" style={{ ...fadeIn(400), color: TEXT }}>
          {message}
        </p>
      )}

      <div className="relative mt-8 text-xs tracking-wide" style={{ ...fadeIn(500), color: TEXT_SOFT }}>
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

/**
 * One round clock: the number, its unit, and a mustard-gold arc showing how
 * much of the unit remains.
 */
function Clock({ label, value, of }: { label: string; value: number | null; of: number }) {
  const R = 44;
  const LEN = 2 * Math.PI * R;
  const frac = value === null ? 0 : Math.min(1, value / of);
  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="49" fill={WHEEL_FILL} stroke={GOLD} strokeOpacity="0.55" strokeWidth="1" />
        <circle cx="50" cy="50" r={R} fill="none" stroke={GOLD} strokeOpacity="0.18" strokeWidth="4" />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke={GOLD}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${(LEN * frac).toFixed(1)} ${LEN.toFixed(1)}`}
          style={{ transition: "stroke-dasharray 600ms ease-out" }}
        />
      </svg>
      <div className="relative flex flex-col items-center leading-none">
        <span className="font-display text-[1.45rem] font-semibold [font-variant-numeric:lining-nums_tabular-nums]" style={{ color: GOLD }}>
          {value === null ? "--" : String(value).padStart(2, "0")}
        </span>
        <span className="mt-0.5 text-[0.45rem] font-medium uppercase tracking-[0.18em]" style={{ color: TEXT_SOFT }}>
          {label}
        </span>
      </div>
    </div>
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
