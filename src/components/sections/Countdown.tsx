import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { showPlaceholders } from "@/lib/placeholders";
import { EASE } from "@/lib/motion";
import { dateKey, formatVenueDate, parseVenueDateTime, venueDateKey, venueInstant, zoneLabel, type VenueDateTime } from "@/lib/venueTime";
import { IKAT_DISC, IkatWheel } from "@/components/art/IkatWheel";
import { Pending } from "@/components/ui/Pending";

const DAY = 86_400_000;
const CARD = "#F8F2E5"; // the couple card cream
const RED = "#8E1B1F";
const MAROON = "#7A1424";
const GOLD = "#A6782C";
const SOFT = "#A88A5E";
const INK = "#2B1A14";
const FRAME = "/art/countdown-frame.svg"; // nine-slice: slice 40 of a 120 box

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

/** The ikat ring turns gently into place as the section scrolls into view. */
function useTurnOnScroll(ringRef: RefObject<HTMLElement>) {
  const reducedMotion = usePrefersReducedMotion();
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    if (reducedMotion) {
      ring.style.transform = "none";
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = (ring.parentElement ?? ring).getBoundingClientRect(); // unrotated box
      const vh = window.innerHeight;
      // 0 when the wheel's top meets the bottom of the screen, 1 when its centre is mid-screen
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh / 2 + r.height / 2)));
      ring.style.transform = `rotate(${(-45 * (1 - p)).toFixed(2)}deg)`;
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
  }, [ringRef, reducedMotion]);
}

/**
 * Section 04 — The countdown.
 * A framed cream card: "Our Wedding · ଶୁଭ ବିବାହ · The countdown to our
 * Forever Begins", then a round Sambalpuri-ikat medallion whose cream heart
 * counts the days, hours, minutes and seconds to the Lagna, and the date
 * beneath. Hidden in production until the date is configured (unless
 * placeholders are on).
 */
export function Countdown() {
  const parts = parseVenueDateTime(wedding.wedding.dateTime);
  if (!parts && !showPlaceholders) return null;
  return <CountdownSection parts={parts} />;
}

type Phase = "pending" | "counting" | "today" | "after";

function CountdownSection({ parts }: { parts: VenueDateTime | null }) {
  const ref = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.2 });
  const now = useNow(useOnScreen(ref));
  useTurnOnScroll(ringRef);
  const tz = wedding.wedding.timeZone;
  const { eyebrow, odia, lead, heading, weddingDayMessage, completedMessage } = wedding.countdown;

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
  const clocks = [
    { label: "Days", value: Math.floor(remaining / DAY) },
    { label: "Hours", value: Math.floor((remaining % DAY) / 3_600_000) },
    { label: "Mins", value: Math.floor((remaining % 3_600_000) / 60_000) },
    { label: "Secs", value: Math.floor((remaining % 60_000) / 1000) },
  ];
  const two = (v: number) => String(v).padStart(2, "0");
  const date = parts && formatVenueDate(parts);
  const message =
    phase === "today"
      ? weddingDayMessage
      : phase === "after"
        ? completedMessage.replace("{date}", date ? `${date.day} ${date.month} ${date.year}` : "")
        : null;

  const fadeIn = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(10px)",
    transition: `opacity 900ms ${EASE.silk} ${delay}ms, transform 1000ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section ref={ref} id="countdown" aria-labelledby="countdown-heading" className="relative text-center" style={{ backgroundColor: CARD }}>
      {/* The couple's bordered paper: double brown rule, hanging curls, a wave of dots */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3"
        style={{ borderStyle: "solid", borderWidth: 0, borderImage: `url(${FRAME}) 40 / 34px round` }}
      />

      <div className="relative px-12 pb-14 pt-[3.25rem]">
        <p className="flex items-center justify-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.3em]" style={{ ...fadeIn(0), color: SOFT }}>
          <span aria-hidden>+</span> {eyebrow} <span aria-hidden>+</span>
        </p>
        {odia && (
          <p lang="or" className="odia mt-1 text-[1.75rem] font-semibold leading-tight" style={{ ...fadeIn(80), color: RED }}>
            {odia}
          </p>
        )}
        <p className="mt-2 font-serif text-[0.78rem] font-semibold uppercase tracking-[0.2em]" style={{ ...fadeIn(160), color: GOLD }}>
          {lead}
        </p>
        <h2 id="countdown-heading" className="mt-1.5 whitespace-nowrap font-serif text-[2.15rem] font-semibold italic leading-none" style={{ ...fadeIn(220), color: MAROON }}>
          {heading}
        </h2>
        <Ornament className="mt-4" style={fadeIn(280)} />

        {/* The ikat medallion, its cream heart counting down */}
        <div className="relative mx-auto mt-6 aspect-square w-[min(66vw,18rem)] drop-shadow-[0_8px_14px_rgb(60_10_5/0.35)]" style={fadeIn(340)}>
          <div ref={ringRef} className="absolute inset-0 will-change-transform">
            <IkatWheel className="h-full w-full" />
          </div>
          <div
            role="timer"
            aria-live="off"
            aria-label={
              phase === "pending"
                ? "Countdown begins once the date is confirmed"
                : message ?? `${clocks[0].value} days, ${clocks[1].value} hours, ${clocks[2].value} minutes to go`
            }
            className="absolute grid grid-cols-2 place-content-center gap-x-[14%] gap-y-[6%] [container-type:inline-size]"
            style={{ inset: `${((0.5 - IKAT_DISC) * 100).toFixed(2)}%` }}
          >
            {message ? (
              <p className="col-span-2 px-[8%] font-serif text-[9cqw] font-semibold italic leading-snug" style={{ color: MAROON }}>
                {message}
              </p>
            ) : (
              clocks.map((c, i) => (
                <div key={c.label} aria-hidden className="flex flex-col items-center leading-none">
                  <span className="font-serif text-[17cqw] font-bold [font-variant-numeric:lining-nums_tabular-nums]" style={{ color: MAROON }}>
                    {phase === "pending" ? "--" : i === 0 ? c.value : two(c.value)}
                  </span>
                  <span className="mt-[2cqw] font-serif text-[5.6cqw] font-semibold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
                    {c.label}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* The date */}
        <div className="mt-7" style={fadeIn(420)}>
          {date ? (
            <p className="font-serif text-[1.65rem] font-bold leading-none tracking-[0.3em]" style={{ color: INK }}>
              {two(parts!.day)} · {two(parts!.month)} · {parts!.year}
              {date.time && (
                <span className="mt-2 block font-sans text-[0.6875rem] font-semibold tracking-[0.18em]">
                  {date.time} {zoneLabel(target!, tz)}
                </span>
              )}
            </p>
          ) : (
            <div className="flex justify-center">
              <Pending label="Wedding date awaiting confirmation">
                <p className="font-serif text-[1.65rem] font-bold tracking-[0.3em]">DD · MM · YYYY</p>
              </Pending>
            </div>
          )}
        </div>
        <Ornament className="mt-5" style={fadeIn(480)} />
      </div>
    </section>
  );
}

/** Rule — dot — small temple-top motif — dot — rule, in antique gold. */
function Ornament({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div aria-hidden className={`mx-auto flex w-[14rem] max-w-full items-center gap-2 ${className}`} style={style}>
      <span className="h-px flex-1" style={{ background: `linear-gradient(to left, ${GOLD}, transparent)` }} />
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: GOLD }} />
      <svg viewBox="0 0 20 14" className="h-3.5 w-5" fill="none" stroke={GOLD} strokeWidth="1.3" strokeLinejoin="round">
        <path d="M10 1.5 15 7H5Z" fill={`${GOLD}33`} />
        <path d="M3 11.5h14M6 7v4.5M14 7v4.5M10 7v4.5" strokeLinecap="round" />
      </svg>
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: GOLD }} />
      <span className="h-px flex-1" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
    </div>
  );
}
