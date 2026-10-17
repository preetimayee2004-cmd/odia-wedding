import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { showPlaceholders } from "@/lib/placeholders";
import { EASE } from "@/lib/motion";
import { dateKey, formatVenueDate, parseVenueDateTime, venueDateKey, venueInstant, zoneLabel, type VenueDateTime } from "@/lib/venueTime";
import { IKAT_DISC, IkatWheel } from "@/components/art/IkatWheel";
import { Pending } from "@/components/ui/Pending";
import { Dock } from "@/components/ui/Dock";

const DAY = 86_400_000;
const CARD = "#F8F2E5"; // the couple card cream
const RED = "#8E1B1F";
const MAROON = "#7A1424";
const GOLD = "#A6782C";
const BORDER_RED = "#8D0B0B"; // the couple card border's red
const VERMILION_LINE = "#B4483E"; // muted vermilion, as in Our Story's line
const INK = "#2B1A14";

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
    { label: "Days", odia: "ଦିନ", value: Math.floor(remaining / DAY) },
    { label: "Hours", odia: "ଘଣ୍ଟା", value: Math.floor((remaining % DAY) / 3_600_000) },
    { label: "Mins", odia: "ମିନିଟ୍", value: Math.floor((remaining % 3_600_000) / 60_000) },
    { label: "Secs", odia: "ସେକେଣ୍ଡ", value: Math.floor((remaining % 60_000) / 1000) },
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
    <section ref={ref} id="countdown" aria-labelledby="countdown-heading" className="relative text-center">
      <div className="relative px-12 pb-0 pt-[3.25rem]">
        <Dock name="countdown" />
        <p className="t-label flex items-center justify-center gap-2" style={fadeIn(0)}>
          <span aria-hidden>+</span> {eyebrow} <span aria-hidden>+</span>
        </p>
        {odia && (
          <p lang="or" className="odia t-odia mt-1 text-[24px] leading-tight" style={{ ...fadeIn(80), color: RED }}>
            {odia}
          </p>
        )}
        <p className="t-label mt-2" style={{ ...fadeIn(160), color: GOLD }}>
          {lead}
        </p>
        <h2 id="countdown-heading" className="t-heading mt-1.5 whitespace-nowrap leading-none" style={{ ...fadeIn(220), color: MAROON }}>
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
            className="absolute [container-type:inline-size]"
            style={{ inset: `${((0.5 - IKAT_DISC) * 100).toFixed(2)}%` }}
          >
            {message ? (
              <p className="absolute inset-0 flex items-center justify-center px-[12%] font-serif text-[9cqw] font-semibold italic leading-snug" style={{ color: MAROON }}>
                {message}
              </p>
            ) : (
              <>
                {/* A fine cross dividing the disc into four, with a small medallion at its centre */}
                <span aria-hidden className="absolute left-1/2 top-[7%] bottom-[7%] w-px -translate-x-1/2" style={{ backgroundColor: `${MAROON}40` }} />
                <span aria-hidden className="absolute left-[7%] right-[7%] top-1/2 h-px -translate-y-1/2" style={{ backgroundColor: `${MAROON}40` }} />
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1/2 flex h-[15%] w-[15%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                  style={{ backgroundColor: CARD, boxShadow: `0 0 0 1.5px ${GOLD}, 0 0 0 3.5px ${CARD}, 0 0 0 4.5px ${MAROON}55` }}
                >
                  <TempleTop className="h-[55%] w-auto" color={BORDER_RED} />
                </span>
                <div aria-hidden className="grid h-full w-full grid-cols-2 grid-rows-2">
                  {clocks.map((c, i) => (
                    <div
                      key={c.label}
                      className={`flex flex-col items-center leading-none ${i < 2 ? "justify-end pb-[9%]" : "justify-start pt-[9%]"}`}
                    >
                      <span className="font-serif text-[15cqw] font-semibold [font-variant-numeric:lining-nums_tabular-nums]" style={{ color: MAROON }}>
                        {phase === "pending" ? "--" : i === 0 ? c.value : two(c.value)}
                      </span>
                      <span className="mt-[2cqw] max-w-[96%] text-center font-sans text-[5cqw] font-medium uppercase leading-tight tracking-[0.1em]" style={{ color: GOLD }}>
                        {c.label}
                        <span lang="or" className="odia block whitespace-nowrap text-[6.4cqw] font-bold normal-case tracking-normal" style={{ lineHeight: 1.3 }}>
                          {c.odia}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* The date */}
        <div className="mt-7" style={fadeIn(420)}>
          {date ? (
            <p className="font-serif text-[1.65rem] font-semibold leading-none tracking-[0.3em]" style={{ color: INK }}>
              {two(parts!.day)} · {two(parts!.month)} · {parts!.year}
              {date.time && (
                <span className="t-label mt-2 block">
                  {date.time} {zoneLabel(target!, tz)}
                </span>
              )}
            </p>
          ) : (
            <div className="flex justify-center">
              <Pending label="Wedding date awaiting confirmation">
                <p className="font-serif text-[1.65rem] font-semibold tracking-[0.3em]">DD · MM · YYYY</p>
              </Pending>
            </div>
          )}
        </div>
        <Ornament className="mt-5" style={fadeIn(480)} />
        <WheelDivider className="mt-1" style={fadeIn(560)} />
      </div>
    </section>
  );
}

/** Rule — dot — small temple-top motif — dot — rule, in the couple border's red with gold dots. */
function Ornament({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div aria-hidden className={`mx-auto flex w-[14rem] max-w-full items-center gap-2 ${className}`} style={style}>
      <span className="h-px flex-1" style={{ background: `linear-gradient(to left, ${BORDER_RED}, transparent)` }} />
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: GOLD }} />
      <TempleTop className="h-3.5 w-5" color={BORDER_RED} />
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: GOLD }} />
      <span className="h-px flex-1" style={{ background: `linear-gradient(to right, ${BORDER_RED}, transparent)` }} />
    </div>
  );
}

/**
 * The hand-drawn divider beneath the date: fine antique-gold lines reaching
 * out from a small Konark wheel to curled scrolls, with vermilion leaves and
 * dots; a stem drops from the wheel to the section's edge, where the thread
 * continues into Our Story.
 */
function WheelDivider({ className = "", style }: { className?: string; style?: CSSProperties }) {
  const half = (
    <>
      {/* the line, slightly uneven, ending in a scroll */}
      <path d="M138.6 16.6C121 15.7 103 17.3 84 16.2S48 15.4 31.5 16.7c-6.2.5-9.4 4.3-7 7.6 2 2.7 6.1 1.5 5.5-1.5-.4-1.9-2.8-2.3-3.6-.8" />
      {/* a small curl rising near the wheel */}
      <path d="M135.8 13.6c-2.6-4.8-8.6-6-12.6-3.2" strokeWidth="0.9" />
      {/* leaves, one above and one below the line */}
      <path d="M101.5 16.4c3-5.4 8.4-7.2 13.2-5.4-2.6 5-7.6 6.8-13.2 5.4Z" stroke={VERMILION_LINE} fill={`${VERMILION_LINE}26`} strokeWidth="0.9" />
      <path d="M66 16.3c3.4 4.6 8.6 5.6 12.8 3.2-3-4.2-8-5.2-12.8-3.2Z" stroke={VERMILION_LINE} fill={`${VERMILION_LINE}26`} strokeWidth="0.9" />
      <circle cx="121" cy="19.6" r="1.05" fill={VERMILION_LINE} stroke="none" />
      <circle cx="48" cy="13.4" r="0.95" fill={GOLD} stroke="none" />
    </>
  );
  return (
    <svg viewBox="0 0 300 50" className={`mx-auto block h-auto w-[min(19rem,100%)] overflow-visible ${className}`} style={style} aria-hidden>
      <g fill="none" stroke={GOLD} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
        {half}
        <g transform="matrix(-1 0 0 1 300 0)">{half}</g>
        {/* the Konark wheel: rim, beads, eight spokes, a vermilion hub */}
        <circle cx="150" cy="16" r="9.6" fill={CARD} />
        <circle cx="150" cy="16" r="6.7" strokeWidth="0.7" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <g key={i}>
              <path d={`M${(150 + Math.cos(a) * 2.4).toFixed(2)} ${(16 + Math.sin(a) * 2.4).toFixed(2)}L${(150 + Math.cos(a) * 6.7).toFixed(2)} ${(16 + Math.sin(a) * 6.7).toFixed(2)}`} strokeWidth="0.8" />
              <circle cx={(150 + Math.cos(a + Math.PI / 8) * 8.2).toFixed(2)} cy={(16 + Math.sin(a + Math.PI / 8) * 8.2).toFixed(2)} r="0.6" fill={GOLD} stroke="none" />
            </g>
          );
        })}
        <circle cx="150" cy="16" r="2.3" fill={VERMILION_LINE} stroke="none" />
        {/* the stem, flowing down to the next section */}
        <path d="M150 25.6c.9 6.4-.8 12.6.1 18.4.3 2.2.1 4.1-.1 6" />
      </g>
      {/* a faint pencil shadow beside the main strokes */}
      <path d="M140 18.2C122 17.4 104 19 84.6 17.8M160 18.2c18-.8 36 .8 55.4-.4" fill="none" stroke="#7A5A3C" strokeOpacity="0.22" strokeWidth="0.7" strokeLinecap="round" />
    </svg>
  );
}

/** A small temple-top motif: a pointed roof over three pillars. */
function TempleTop({ className = "", color }: { className?: string; color: string }) {
  return (
    <svg viewBox="0 0 20 14" className={className} fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round">
      <path d="M10 1.5 15 7H5Z" fill={`${color}33`} />
      <path d="M3 11.5h14M6 7v4.5M14 7v4.5M10 7v4.5" strokeLinecap="round" />
    </svg>
  );
}
