import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { showPlaceholders } from "@/lib/placeholders";
import { EASE } from "@/lib/motion";
import { dateKey, formatVenueDate, parseVenueDateTime, venueDateKey, venueInstant, type VenueDateTime } from "@/lib/venueTime";

const DAY = 86_400_000;
const RED = "#8E1F24";
const INK = "#5E4A3A";

/**
 * The painted page, from the couple's reference design (478×1024, shown 2×):
 * a Pattachitra floral border with temple bells, the carved Konark wheel with
 * four blank clock faces, and the Sun Temple chariot — its parchment turned
 * to the couple card's cream.
 * Everything live (words, numbers, date) is set over it in HTML; positions
 * below are in the artwork's own pixels.
 */
const ART = { src: "/art/countdown-art.webp", w: 478, h: 1024 };
const FACES = [
  { x: 177, y: 448.5 },
  { x: 314.5, y: 448.5 },
  { x: 177.5, y: 570.8 },
  { x: 314.5, y: 570.5 },
];
const FACE_R = 37;
const CENTRE_X = 245;
const WHEEL_BOTTOM = 676; // tip of the wheel's lowest point
const pctX = (x: number) => `${((x / ART.w) * 100).toFixed(3)}%`;
const pctY = (y: number) => `${((y / ART.h) * 100).toFixed(3)}%`;
const cq = (px: number) => `${((px / ART.w) * 100).toFixed(3)}cqw`;

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
 * Section 04 — The Cosmic Wheel.
 * One painted page: under a Pattachitra floral border hung with temple bells,
 * "Shubha Bibaha · The countdown to our Forever Begins"; the carved Konark
 * wheel, its four clock faces counting the days, hours, minutes and seconds
 * to the Lagna; the date just beneath it; and the Sun Temple chariot at the
 * foot, beside a short note. Hidden in production until the date is
 * configured (unless placeholders are on).
 */
export function Countdown() {
  const parts = parseVenueDateTime(wedding.wedding.dateTime);
  if (!parts && !showPlaceholders) return null;
  return <CountdownSection parts={parts} />;
}

type Phase = "pending" | "counting" | "today" | "after";

function CountdownSection({ parts }: { parts: VenueDateTime | null }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.2 });
  const now = useNow(useOnScreen(ref));
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
  const clocks = [
    { label: "Days", value: Math.floor(remaining / DAY) },
    { label: "Hours", value: Math.floor((remaining % DAY) / 3_600_000) },
    { label: "Mins", value: Math.floor((remaining % 3_600_000) / 60_000) },
    { label: "Secs", value: Math.floor((remaining % 60_000) / 1000) },
  ];
  const two = (n: number) => String(n).padStart(2, "0");
  const date = parts && formatVenueDate(parts);
  const message =
    phase === "today"
      ? weddingDayMessage
      : phase === "after"
        ? completedMessage.replace("{date}", date ? `${date.day} ${date.month} ${date.year}` : "")
        : null;

  const fade = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transition: `opacity 1000ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section
      ref={ref}
      id="countdown"
      aria-labelledby="countdown-heading"
      className="relative w-full overflow-hidden bg-[#F8F2E5] bg-cover bg-top text-center [container-type:inline-size]"
      style={{ aspectRatio: `${ART.w} / ${ART.h}`, backgroundImage: `url(${ART.src})` }}
    >
      <At x={CENTRE_X} y={112} style={fade(0)}>
        <p className="flex items-center gap-[0.6em] whitespace-nowrap font-sans font-medium uppercase tracking-[0.3em]" style={{ fontSize: cq(13), color: INK }}>
          <Sparkle /> {eyebrow} <Sparkle />
        </p>
      </At>
      {odia && (
        <At x={CENTRE_X} y={148} style={fade(120)}>
          <p lang="or" className="odia whitespace-nowrap font-semibold leading-none" style={{ fontSize: cq(34), color: RED }}>
            {odia}
          </p>
        </At>
      )}
      <At x={CENTRE_X} y={197} style={fade(220)}>
        <p className="whitespace-nowrap font-display font-semibold uppercase tracking-[0.2em]" style={{ fontSize: cq(16), color: INK }}>
          {lead}
        </p>
      </At>
      <At x={CENTRE_X} y={240} style={fade(300)}>
        <h2 id="countdown-heading" className="whitespace-nowrap font-display font-semibold italic leading-none" style={{ fontSize: cq(50), color: RED }}>
          {heading}
        </h2>
      </At>

      {/* The four clock faces of the wheel */}
      <div
        role="timer"
        aria-live="off"
        aria-label={
          phase === "pending"
            ? "Countdown begins once the date is confirmed"
            : message ?? `${clocks[0].value} days, ${clocks[1].value} hours, ${clocks[2].value} minutes to go`
        }
      >
        {clocks.map((c, i) => (
          <At key={c.label} x={FACES[i].x} y={FACES[i].y} style={fade(450 + i * 90)}>
            <div aria-hidden className="flex flex-col items-center justify-center leading-none" style={{ width: cq(FACE_R * 2), height: cq(FACE_R * 2) }}>
              <span className="font-display font-semibold [font-variant-numeric:lining-nums_tabular-nums]" style={{ fontSize: cq(25), color: RED }}>
                {phase === "pending" ? "--" : phase === "counting" ? (i === 0 ? c.value : two(c.value)) : "00"}
              </span>
              <span className="mt-[0.35em] font-display font-semibold uppercase tracking-[0.14em]" style={{ fontSize: cq(10.5), color: INK }}>
                {c.label}
              </span>
            </div>
          </At>
        ))}
      </div>

      {/* The date, centred 16px below the wheel */}
      <div className="absolute -translate-x-1/2" style={{ left: pctX(CENTRE_X), top: `calc(${pctY(WHEEL_BOTTOM)} + 16px)`, ...fade(600) }}>
        <p className="whitespace-nowrap font-display font-medium leading-none tracking-[0.12em] [font-variant-numeric:lining-nums]" style={{ fontSize: cq(32), color: INK }}>
          {parts ? `${two(parts.day)} · ${two(parts.month)} · ${parts.year}` : "DD · MM · YYYY"}
        </p>
      </div>

      {message && (
        <At x={CENTRE_X} y={790} style={fade(700)}>
          <p className="font-display font-semibold italic leading-snug" style={{ fontSize: cq(17), color: RED, width: cq(300) }}>
            {message}
          </p>
        </At>
      )}

      {/* A note beside the temple */}
      <At x={357} y={938} style={fade(800)}>
        <p className="font-display font-semibold italic leading-[1.35]" style={{ fontSize: cq(15.5), color: INK, width: cq(205) }}>
          {caption}
        </p>
        <span aria-hidden className="mx-auto mt-[0.6em] flex items-center gap-1" style={{ width: cq(56) }}>
          <span className="h-px flex-1 bg-[#8C6A4A]" />
          <span className="h-1 w-1 rounded-full bg-[#8C6A4A]" />
          <span className="h-px flex-1 bg-[#8C6A4A]" />
        </span>
      </At>
    </section>
  );
}

/** Centres its content on a point of the artwork. */
function At({ x, y, style, children }: { x: number; y: number; style?: CSSProperties; children: ReactNode }) {
  return (
    <div className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: pctX(x), top: pctY(y), ...style }}>
      {children}
    </div>
  );
}

/** A four-point star beside the eyebrow. */
function Sparkle() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden fill="#8C6A4A" style={{ width: "0.75em", height: "0.75em" }}>
      <path d="M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4Z" />
    </svg>
  );
}
