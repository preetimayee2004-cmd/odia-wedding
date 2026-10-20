import { useRef, type CSSProperties } from "react";
import { wedding } from "@/config/wedding";
import { JhotiRule } from "@/components/ui/JhotiThreshold";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { formatVenueDate, parseVenueDateTime } from "@/lib/venueTime";
import { FitText } from "@/components/ui/FitText";

const MAROON = "#8C1C24";
const INK = "#6B2A22";
const ART = "/art/thanks";
/** Room on each side for the page's looped side bands. */
const BAND = "calc(100% * 35 / 768)";

/** "12 FEB 2027", from the wedding date. */
function shortDate(): string | null {
  const p = parseVenueDateTime(wedding.wedding.dateTime);
  if (!p) return null;
  const f = formatVenueDate(p);
  return `${f.day} ${f.month.slice(0, 3)} ${f.year}`.toUpperCase();
}

/** "Bhubaneswar, Odisha": the venue's city, or the last two parts of the invitation's place. */
function shortPlace(): string | null {
  if (wedding.venue.city) return wedding.venue.city;
  const parts = wedding.couple.place?.split(",").map((s) => s.trim()) ?? [];
  return parts.length ? parts.slice(-2).join(", ") : null;
}

/**
 * Section 11 — Thank You, after the couple's design.
 * Between the side bands on the page cream: Lord Jagannath between red
 * filigree; "Thank You" in italic and a line of gratitude; the couple at
 * Puri, looking out over the sea to the Jagannath temple; their hashtag, the
 * date and the place. The ornament and the painting are cut from the
 * couple's design.
 */
export function ThankYou() {
  const { heading, message } = wedding.thankYou;
  const hashtag = wedding.couple.hashtag;
  const date = shortDate();
  const place = shortPlace();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.2 });

  const rise = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(10px)",
    transition: `opacity 1000ms ${EASE.silk} ${delay}ms, transform 1100ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section ref={ref} id="thank-you" aria-labelledby="thanks-heading" className="relative overflow-hidden pb-6 text-center" style={{ paddingInline: `calc(${BAND} + 16px)` }}>
      <div className="relative mx-auto max-w-[24rem] pt-7">
        {/* Lord Jagannath between red filigree */}
        <img src={`${ART}/ornament.webp`} width={290} height={120} alt="Lord Jagannath" decoding="async" loading="lazy" className="mx-auto block h-auto w-[10.5rem]" style={rise(0)} />

        <h2 id="thanks-heading" className="mt-4 font-serif text-[58px] font-semibold italic leading-none" style={{ ...rise(120), color: MAROON }}>
          {heading}
        </h2>
        <JhotiRule motif="padma" wide className="mt-4" style={rise(220)} />

        <p className="t-quote mx-auto mt-5 max-w-[19rem] text-[19px]" style={{ ...rise(320), color: INK }}>
          “{message}”
        </p>
      </div>

      {/* The couple at Puri, out over the sea to the Jagannath temple */}
      <img
        src={`${ART}/couple.webp`}
        width={916}
        height={650}
        alt="The bride and groom from behind, side by side on a terrace at Puri, looking out over the sea towards the Jagannath temple"
        decoding="async"
        loading="lazy"
        className="relative -mx-4 mt-2 block h-auto w-[calc(100%+2rem)] max-w-none"
        style={{
          ...rise(500),
          WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 12%, #000 86%, transparent), linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)",
          WebkitMaskComposite: "source-in",
          maskImage: "linear-gradient(to bottom, transparent, #000 12%, #000 86%, transparent), linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)",
          maskComposite: "intersect",
        }}
      />

      <div className="relative mx-auto max-w-[24rem]">
        {hashtag && (
          <FitText tiers={[[1, 0.6]]} className="font-serif text-[26px] font-semibold italic leading-tight" style={{ ...rise(600), color: MAROON }}>
            {hashtag}
          </FitText>
        )}
        <Divider className="mx-auto mt-3" style={rise(650)} />
        {date && (
          <p className="t-label mt-4 text-[14px] tracking-[3px]" style={{ ...rise(700), color: INK }}>
            {date}
          </p>
        )}
        {place && (
          <FitText tiers={[[1, 0.85], [2, 1]]} className="t-label mx-auto mt-2 text-[12px] tracking-[3px] [text-wrap:balance]" style={{ ...rise(750), color: INK }}>
            {/* inline, so a place that wraps keeps its pin beside its first word */}
            <svg viewBox="0 0 12 16" className="mr-1.5 inline-block h-3.5 w-3 align-[-2px]" aria-hidden fill={INK}>
              <path d="M6 0a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6Zm0 8.4A2.4 2.4 0 1 1 6 3.6a2.4 2.4 0 0 1 0 4.8Z" />
            </svg>
            {place}
          </FitText>
        )}
      </div>
    </section>
  );
}

/** A fine maroon line with a small four-petal flower at its centre. */
function Divider({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 220 14" className={`block h-3.5 w-[13.75rem] ${className}`} style={style} aria-hidden>
      <path d="M4 7H96M124 7H216" stroke={MAROON} strokeWidth="0.9" strokeLinecap="round" />
      <g fill={MAROON}>
        {[0, 90, 180, 270].map((a) => (
          <ellipse key={a} cx="110" cy="3.4" rx="2" ry="3.4" transform={`rotate(${a} 110 7)`} />
        ))}
        <circle cx="110" cy="7" r="1.4" style={{ fill: "rgb(var(--page))" }} />
        <circle cx="100" cy="7" r="1.1" />
        <circle cx="120" cy="7" r="1.1" />
      </g>
    </svg>
  );
}

