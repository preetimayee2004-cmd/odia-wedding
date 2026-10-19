import { useRef, type CSSProperties } from "react";
import { wedding } from "@/config/wedding";
import { useFitToArea } from "@/hooks/useFitToArea";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { googleCalendarUrl, weddingCalendarItem } from "@/lib/calendar";
import { formatVenueDate, parseVenueDateTime } from "@/lib/venueTime";
import { CardBackdrop, cardCq, cardMinHeight, type CardArt } from "@/components/art/CardBackdrop";
import { GaneshaIcon, LotusIcon } from "@/components/art/Ganesha";
import { PinIcon } from "@/components/ui/CardOrnaments";

/**
 * The couple card artwork (768×1376): a carved arch in a red-and-gold border
 * on cream paper matched to the invitation card. Its top (the arch) and
 * bottom are kept whole; a plain 117px band of the middle repeats between
 * them so the card fills the screen undistorted.
 */
const CARD: CardArt = { src: "/art/couple-card.jpg", middle: "/art/couple-card-middle.png", w: 768, h: 1376, top: 606, bottomFrom: 723 };
const cq = (px: number) => cardCq(CARD, px);
const UNDER_ARCH = 160; // below the arch's peak (card px)
const BORDER_BOTTOM = 1300; // the bottom border band begins here
const PANEL_EDGE = 62; // the inner red line of the side borders
/** The couple seated at the sacred fire, centred at the bottom of the card. */
const COUPLE_ART = { src: "/art/couple-havan.png", alt: "The bride and groom seated together before the sacred fire", aspect: 242 / 303 };

const GOLD = "#B8863B";
const MAROON = "#7A1424";
const MUTED = "#7A5A44";

/**
 * Section 03 — The couple.
 * Inside the card's arch and border, in four groups with a steady rhythm
 * (12px within a group, 32px between): Ganesha, the invocation and the
 * invite line; the couple's names rising in one after another; the date as
 * a classic block, the venue and "Add to calendar"; then a small lotus, the
 * quote and the hashtag — above the illustrated couple at the sacred fire,
 * whose foot fades into the card.
 */
export function Couple() {
  const ref = useRef<HTMLElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.25 });
  useFitToArea(areaRef, blockRef);
  const { couple, invitation } = wedding;
  const [first, second] = invitation.names;
  const calendarItem = weddingCalendarItem();
  const calendarUrl = calendarItem && googleCalendarUrl(calendarItem);

  /** Fades in from just below, after `delay` ms. */
  const rise = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(12px)",
    transition: `opacity 700ms ${EASE.silk} ${delay}ms, transform 800ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section
      ref={ref}
      id="couple"
      aria-labelledby="couple-heading"
      data-status-tone="light"
      className="relative [container-type:inline-size]"
    >
      <CardBackdrop card={CARD} />

      <div
        className="relative z-20 flex flex-col"
        style={{
          minHeight: cardMinHeight(CARD),
          paddingTop: cq(UNDER_ARCH),
          paddingBottom: `calc(${cq(CARD.h - BORDER_BOTTOM)} + 10px)`,
        }}
      >
        <div ref={areaRef} className="relative min-h-0 flex-1">
          {/* Centred in the card; shrinks a little on very small screens */}
          <div
            ref={blockRef}
            className="absolute inset-x-0 top-1/2 flex flex-col items-center gap-8 text-center font-serif"
            style={{ paddingInline: `calc(${cq(PANEL_EDGE)} + 28px)`, transform: "translateY(-50%)" }}
          >
            {/* Ganesha, the invocation and the invite line */}
            <div className="flex flex-col items-center gap-3">
              <div
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "none" : "scale(0.85)",
                  transition: `opacity 600ms ${EASE.silk}, transform 600ms ${EASE.silk}`,
                }}
              >
                <GaneshaIcon className="mt-2 h-[46px] w-auto" />
              </div>
              <p className="t-blessing whitespace-nowrap" style={rise(250)}>
                {couple.invocation}
              </p>
              <p className="max-w-[16.5rem] font-serif text-[15px] italic leading-snug [text-wrap:balance]" style={{ ...rise(450), color: MUTED }}>
                {couple.invite}
              </p>
            </div>

            {/* The couple's names, one after another */}
            <h2 id="couple-heading" className="flex flex-col items-center">
              <span className="t-names" style={rise(700)}>
                {first}
              </span>
              <span className="t-amp my-1 text-[28px]" style={{ ...rise(950), color: "#C9A24E" }}>
                &amp;
              </span>
              <span className="t-names" style={rise(1200)}>
                {second}
              </span>
            </h2>

            {/* The date as a classic block, the venue, and Add to calendar */}
            <div className="flex flex-col items-center gap-3" style={rise(1450)}>
              <DateBlock />
              {couple.place && (
                <div className="flex flex-col items-center gap-1">
                  <PinIcon />
                  <p className="t-body font-semibold leading-snug">
                    {couple.place.split(/,\s*(.+)/).filter(Boolean).map((part, i) => (
                      <span key={i} className="block">
                        {part}
                      </span>
                    ))}
                  </p>
                </div>
              )}
              {calendarUrl && (
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="couple-cal">
                  Add to calendar
                </a>
              )}
            </div>

            {/* A small lotus, the quote, and the hashtag */}
            <div className="flex flex-col items-center gap-3" style={rise(1700)}>
              <LotusIcon className="h-5 w-auto" />
              <p className="t-quote max-w-[17rem] [text-wrap:balance]">{couple.quote}</p>
              {couple.hashtag && (
                <div className="flex flex-col items-center gap-1.5">
                  <span aria-hidden className="h-px w-40" style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />
                  <p className="t-hashtag">{couple.hashtag}</p>
                  <span aria-hidden className="h-px w-40" style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* The couple at the sacred fire, centred at the bottom */}
        <img
          src={COUPLE_ART.src}
          alt={COUPLE_ART.alt}
          decoding="async"
          className="mx-auto mt-2 block h-auto shrink-0"
          style={{
            width: "min(52cqw, 230px)",
            aspectRatio: `${COUPLE_ART.aspect}`,
            WebkitMaskImage: "linear-gradient(to bottom, #000 85%, transparent)",
            maskImage: "linear-gradient(to bottom, #000 85%, transparent)",
            opacity: inView ? 1 : 0,
            transform: inView ? "none" : "translateY(16px)",
            transition: `opacity 900ms ${EASE.silk} 300ms, transform 1000ms ${EASE.silk} 300ms`,
          }}
        />
      </div>
    </section>
  );
}

/** The date as a classic block: FRIDAY | 12 | FEB 2027, the words between thin gold lines. */
function DateBlock() {
  const p = parseVenueDateTime(wedding.wedding.dateTime);
  if (!p) return null;
  const f = formatVenueDate(p);
  return (
    <p className="grid w-[260px] max-w-full grid-cols-[1fr_auto_1fr] items-center gap-3">
      <span className="couple-dateside">{f.weekday}</span>
      <span className="font-cinzel text-[44px] font-semibold leading-none" style={{ color: MAROON }}>
        {f.day}
      </span>
      <span className="couple-dateside">
        {f.month.slice(0, 3)} {f.year}
      </span>
    </p>
  );
}
