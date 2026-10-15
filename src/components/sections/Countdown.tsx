import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { showPlaceholders } from "@/lib/placeholders";
import { EASE } from "@/lib/motion";
import { dateKey, formatVenueDate, parseVenueDateTime, venueDateKey, venueInstant, zoneLabel, type VenueDateTime } from "@/lib/venueTime";
import { Pending } from "@/components/ui/Pending";

const DAY = 86_400_000;
// The couple card cream; the artwork paper is recoloured to match.
const PAPER = "#F8F2E5";
const RED = "#9B2226";
const DEEP_RED = "#7A1424"; // the clock numbers
const DARK = "#3B2615"; // the date and the note
const BROWN = "#6E4A2A";
const RULE = "#A0764A";

/**
 * Artwork cut from the couple's reference design: the carved Konark wheel
 * (with its four clock faces left blank for the live numbers), the Sun
 * Temple chariot among banana leaves, and banana leaves with a temple bell.
 */
const WHEEL = "/art/konark-wheel.webp";
const FRAME = "/art/countdown-frame.svg"; // nine-slice: slice 40 of a 120 box
const TEMPLE = { src: "/art/konark-temple.webp", aspect: 494 / 651 };
const BANANA = { src: "/art/banana-bell.webp", aspect: 282 / 330 };
// Centres of the wheel's four blank clock faces (fractions of the wheel), and their radius.
const FACES = [
  { x: 0.3125, y: 0.3362 },
  { x: 0.6875, y: 0.3362 },
  { x: 0.3125, y: 0.664 },
  { x: 0.6875, y: 0.664 },
];
const FACE_R = 0.109;

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
 * The wheel turns a quarter-turn into alignment as the section scrolls into
 * view (scroll-linked, never spinning on its own). Its four clock faces map
 * onto each other, so the numbers ride with it and end upright.
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
      const r = (wheel.parentElement ?? wheel).getBoundingClientRect(); // unrotated box
      const vh = window.innerHeight;
      // 0 when the wheel's top meets the bottom of the screen, 1 when its centre is mid-screen
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh / 2 + r.height / 2)));
      wheel.style.transform = `rotate(${(-90 * (1 - p)).toFixed(2)}deg)`;
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
 * On aged paper, banana leaves and temple bells hang at the top corners;
 * "Shubha Bibaha · The countdown to our Forever Begins"; then the carved
 * Konark wheel turns into alignment, its four clock faces counting the days,
 * hours, minutes and seconds to the Lagna; the date beneath; and the Sun
 * Temple chariot among banana leaves at the foot.
 * Hidden in production until the date is configured (unless placeholders are on).
 */
export function Countdown() {
  const parts = parseVenueDateTime(wedding.wedding.dateTime);
  if (!parts && !showPlaceholders) return null;
  return <CountdownSection parts={parts} />;
}

type Phase = "pending" | "counting" | "today" | "after";

function CountdownSection({ parts }: { parts: VenueDateTime | null }) {
  const ref = useRef<HTMLElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.2 });
  const now = useNow(useOnScreen(ref));
  useAlignOnScroll(ref, wheelRef);
  const tz = wedding.wedding.timeZone;
  const { eyebrow, odia, lead, heading, caption, weddingDayMessage, completedMessage } = wedding.countdown;

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
  const pending = phase === "pending";
  const clocks = [
    { label: "Days", value: Math.floor(remaining / DAY) },
    { label: "Hours", value: Math.floor((remaining % DAY) / 3_600_000) },
    { label: "Mins", value: Math.floor((remaining % 3_600_000) / 60_000) },
    { label: "Secs", value: Math.floor((remaining % 60_000) / 1000) },
  ];

  const date = parts && formatVenueDate(parts);
  const dateText = date && `${date.day} ${date.month} ${date.year}`;
  const message =
    phase === "today" ? weddingDayMessage : phase === "after" ? completedMessage.replace("{date}", dateText ?? "") : null;
  const two = (n: number) => String(n).padStart(2, "0");

  const fadeIn = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(10px)",
    transition: `opacity 900ms ${EASE.silk} ${delay}ms, transform 1000ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section
      ref={ref}
      id="countdown"
      aria-labelledby="countdown-heading"
      className="relative overflow-hidden text-center"
      style={{
        backgroundColor: PAPER,
        color: BROWN,
        // The couple's bordered paper: double brown rule, hanging curls, a wave of dots
        borderStyle: "solid",
        borderWidth: 0,
        borderImage: `url(${FRAME}) 40 / 34px round`,
      }}
    >
      {/* Banana leaves and temple bells at the top corners */}
      {[false, true].map((mirror) => (
        <img
          key={String(mirror)}
          src={BANANA.src}
          alt=""
          aria-hidden
          decoding="async"
          loading="lazy"
          className="pointer-events-none absolute top-0 w-[31%] max-w-[9rem]"
          style={{
            [mirror ? "left" : "right"]: 0,
            aspectRatio: `${BANANA.aspect}`,
            transform: mirror ? "scaleX(-1)" : undefined,
            WebkitMaskImage: "linear-gradient(to left, #000 62%, transparent), linear-gradient(to top, transparent, #000 22%)",
            WebkitMaskComposite: "source-in",
            maskImage: "linear-gradient(to left, #000 62%, transparent), linear-gradient(to top, transparent, #000 22%)",
            maskComposite: "intersect",
          }}
        />
      ))}

      <div className="relative px-[var(--gutter)] pt-[calc(3.25rem_+_var(--status-bar,0px))]">
        <p className="flex items-center justify-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.3em]" style={{ ...fadeIn(0), color: BROWN }}>
          <Sparkle /> {eyebrow} <Sparkle />
        </p>
        {odia && (
          <p lang="or" className="odia mt-2 text-[1.9rem] font-medium leading-tight" style={{ ...fadeIn(100), color: RED }}>
            {odia}
          </p>
        )}
        <p className="mt-3 font-display text-[0.8rem] font-semibold uppercase tracking-[0.28em]" style={{ ...fadeIn(200), color: BROWN }}>
          {lead}
        </p>
        <h2 id="countdown-heading" className="mt-1 font-display text-[2.7rem] font-semibold italic leading-none" style={{ ...fadeIn(260), color: RED }}>
          {heading}
        </h2>
        <LotusRule className="mt-4" style={fadeIn(320)} />

        {/* The wheel, between faint arcs */}
        <div className="relative mx-auto mt-6 w-[min(80vw,21rem)]" style={fadeIn(380)}>
          <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute -left-[11%] top-0 h-full w-[122%]" fill="none">
            <path d="M14 22a42 42 0 0 0 0 56M86 22a42 42 0 0 1 0 56" stroke={RULE} strokeWidth="0.25" opacity="0.8" vectorEffect="non-scaling-stroke" />
          </svg>

          <div
            ref={wheelRef}
            role="timer"
            aria-live="off"
            aria-label={
              pending
                ? "Countdown begins once the date is confirmed"
                : message ?? `${clocks[0].value} days, ${clocks[1].value} hours, ${clocks[2].value} minutes to go`
            }
            className="relative aspect-square w-full will-change-transform [container-type:inline-size]"
          >
            <img src={WHEEL} alt="" aria-hidden decoding="async" loading="lazy" className="absolute inset-0 h-full w-full drop-shadow-[0_10px_18px_rgb(90_55_20/0.28)]" />
            {!message &&
              clocks.map((c, i) => (
                <div
                  key={c.label}
                  aria-hidden
                  className="absolute flex flex-col items-center justify-center leading-none"
                  style={{
                    left: `${(FACES[i].x - FACE_R) * 100}%`,
                    top: `${(FACES[i].y - FACE_R) * 100}%`,
                    width: `${FACE_R * 200}%`,
                    height: `${FACE_R * 200}%`,
                  }}
                >
                  <span className="font-display font-bold [font-variant-numeric:lining-nums_tabular-nums]" style={{ color: DEEP_RED, fontSize: "8.8cqw" }}>
                    {pending ? "--" : i === 0 ? c.value : two(c.value)}
                  </span>
                  <span className="mt-[0.6cqw] font-display font-bold uppercase tracking-[0.16em]" style={{ color: DEEP_RED, fontSize: "2.8cqw" }}>
                    {c.label}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* The date, just beneath the wheel */}
        <div className="mt-2.5" style={fadeIn(450)}>
          {date ? (
            <p className="font-display text-[1.7rem] font-bold leading-none tracking-[0.2em]" style={{ color: DARK }}>
              {two(parts!.day)} · {two(parts!.month)} · {parts!.year}
              {date.time && (
                <span className="mt-1.5 block font-sans text-[0.6875rem] font-semibold tracking-[0.18em]">
                  {date.time} {zoneLabel(target!, tz)}
                </span>
              )}
            </p>
          ) : (
            <div className="flex justify-center">
              <Pending label="Wedding date awaiting confirmation">
                <p className="font-display text-[1.7rem] font-bold tracking-[0.2em]">DD · MM · YYYY</p>
              </Pending>
            </div>
          )}
        </div>
        <LotusRule className="mt-4" style={fadeIn(500)} />

        {message && (
          <p className="mx-auto mt-6 max-w-[18rem] font-display text-[1.2rem] italic leading-snug" style={{ ...fadeIn(400), color: RED }}>
            {message}
          </p>
        )}

      </div>

      {/* At the foot: the Sun Temple chariot among banana leaves, and a note beside it; the section ends here */}
      <div className="relative mt-2 flex h-[min(52vw,13.5rem)] items-center">
        <img
          src={TEMPLE.src}
          alt="The Konark Sun Temple, the stone chariot of the Sun God, among banana leaves"
          decoding="async"
          loading="lazy"
          className="h-full w-auto max-w-none shrink-0 self-end"
          style={{
            aspectRatio: `${TEMPLE.aspect}`,
            WebkitMaskImage:
              "linear-gradient(to right, #000 70%, transparent), linear-gradient(to bottom, transparent, #000 22%)",
            WebkitMaskComposite: "source-in",
            maskImage: "linear-gradient(to right, #000 70%, transparent), linear-gradient(to bottom, transparent, #000 22%)",
            maskComposite: "intersect",
            ...fadeIn(300),
          }}
        />
        <div className="min-w-0 flex-1 pl-1 pr-[var(--gutter)] text-center" style={fadeIn(600)}>
          <p className="font-display text-[0.86rem] font-semibold italic leading-snug" style={{ color: DARK }}>
            {caption}
          </p>
          <span aria-hidden className="mx-auto mt-2 flex w-14 items-center gap-1">
            <span className="h-px flex-1" style={{ backgroundColor: RULE }} />
            <span className="h-1 w-1 rotate-45" style={{ backgroundColor: RULE }} />
            <span className="h-px flex-1" style={{ backgroundColor: RULE }} />
          </span>
        </div>
      </div>

    </section>
  );
}

/** A four-point star between the words of the eyebrow. */
function Sparkle() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden fill={RULE}>
      <path d="M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4Z" />
    </svg>
  );
}

/** A small red lotus, outlined. */
function Lotus({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 22" className={className} aria-hidden fill="none" stroke="#B4553A" strokeWidth="1.1" strokeLinejoin="round">
      <path d="M14 3c3 3.5 3 9 0 13-3-4-3-9.5 0-13Z" fill="#E9B79A" fillOpacity="0.5" />
      <path d="M14 16c-3.5-1-7-4-7.5-9 4 .5 6.5 3.5 7.5 9Zm0 0c3.5-1 7-4 7.5-9-4 .5-6.5 3.5-7.5 9Z" />
      <path d="M14 16c-5 .5-10-1.5-12-5 4.5-.8 9 1 12 5Zm0 0c5 .5 10-1.5 12-5-4.5-.8-9 1-12 5Z" />
      <path d="M8 19.5h12" strokeLinecap="round" />
    </svg>
  );
}

/** Rule — dots — red lotus — dots — rule. */
function LotusRule({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div aria-hidden className={`mx-auto flex w-60 items-center gap-1.5 ${className}`} style={style}>
      <span className="h-px flex-1" style={{ background: `linear-gradient(to left, ${RULE}, transparent)` }} />
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: RULE }} />
      <Lotus className="h-5 w-6" />
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: RULE }} />
      <span className="h-px flex-1" style={{ background: `linear-gradient(to right, ${RULE}, transparent)` }} />
    </div>
  );
}
