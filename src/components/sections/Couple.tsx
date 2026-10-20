import { useRef, type CSSProperties } from "react";
import { wedding } from "@/config/wedding";
import { useFitToArea } from "@/hooks/useFitToArea";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { EASE } from "@/lib/motion";
import { googleCalendarUrl, weddingCalendarItem } from "@/lib/calendar";
import { formatVenueDate, parseVenueDateTime } from "@/lib/venueTime";
import { CardBackdrop, cardCq, cardMinHeight, type CardArt } from "@/components/art/CardBackdrop";
import { GaneshaIcon, LotusIcon } from "@/components/art/Ganesha";
import { PinIcon } from "@/components/ui/CardOrnaments";
import { FitText, type FitTier } from "@/components/ui/FitText";

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
/** A long name first shrinks a little on its line, then takes two. */
const NAME_FIT: FitTier[] = [
  [1, 0.78],
  [2, 0.78],
];

/**
 * Section 03 — The couple.
 * Inside the card's arch and border, in four groups with a steady rhythm
 * (about 10px within a group, 24px between): Ganesha, the invocation and the
 * invite line; the couple's names — the focal point, large, with a small
 * gold ampersand; the date as a classic block, then the venue and a small
 * outlined "Add to calendar" together; then a small lotus, the quote and the
 * hashtag, close above the illustrated couple at the sacred fire, which
 * keeps clear of the bottom border. The arch settles in, then the names,
 * the date and venue, the quote and the couple rise in, one after another;
 * with reduced motion all of it is simply there. The falling petals fade
 * while the card fills the screen.
 */
export function Couple() {
  const ref = useRef<HTMLElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.25 });
  const reduced = usePrefersReducedMotion();
  const on = inView || reduced;
  useFitToArea(areaRef, blockRef);
  const { couple, invitation } = wedding;
  const [first, second] = invitation.names;
  const calendarItem = weddingCalendarItem();
  const calendarUrl = calendarItem && googleCalendarUrl(calendarItem);

  /** Fades in from just below, after `delay` ms. */
  const rise = (delay: number, lift = 12): CSSProperties => ({
    opacity: on ? 1 : 0,
    transform: on ? "none" : `translateY(${lift}px)`,
    transition: reduced ? "none" : `opacity 700ms ${EASE.silk} ${delay}ms, transform 800ms ${EASE.silk} ${delay}ms`,
  });
  // "Jagannath Kalyan Mandap, Bhubaneswar, Odisha" → the place, then the city
  const [venueName, venueCity] = couple.place ? couple.place.split(/,\s*(.+)/).filter(Boolean) : [];

  return (
    <section
      ref={ref}
      id="couple"
      aria-labelledby="couple-heading"
      data-status-tone="light"
      data-no-petals
      className="relative [container-type:inline-size]"
    >
      {/* the arch settles in */}
      <CardBackdrop
        card={CARD}
        style={{
          opacity: on ? 1 : 0.4,
          transform: on ? "none" : "scale(1.015)",
          transformOrigin: "50% 0",
          transition: reduced ? "none" : `opacity 900ms ${EASE.silk}, transform 1400ms ${EASE.silk}`,
        }}
      />

      <div
        className="relative z-20 flex flex-col"
        style={{
          minHeight: cardMinHeight(CARD),
          paddingTop: cq(UNDER_ARCH),
          paddingBottom: `calc(${cq(CARD.h - BORDER_BOTTOM)} + 22px)`,
        }}
      >
        <div ref={areaRef} className="relative min-h-0 flex-1">
          {/* Centred in the card; shrinks a little on very small screens */}
          <div
            ref={blockRef}
            className="couple-text absolute inset-x-0 top-1/2 flex flex-col items-center text-center font-serif"
            style={{ paddingInline: `calc(${cq(PANEL_EDGE)} + 28px)`, transform: "translateY(-50%)" }}
          >
            {/* Ganesha, the invocation and the invite line */}
            <div className="flex flex-col items-center gap-2.5">
              <div
                style={{
                  opacity: on ? 1 : 0,
                  transform: on ? "none" : "scale(0.85)",
                  transition: reduced ? "none" : `opacity 600ms ${EASE.silk} 150ms, transform 600ms ${EASE.silk} 150ms`,
                }}
              >
                <GaneshaIcon className="mt-2 h-[44px] w-auto" />
              </div>
              <p className="t-blessing whitespace-nowrap" style={rise(300)}>
                {couple.invocation}
              </p>
              <p className="couple-invite max-w-[16.5rem] [text-wrap:balance]" style={rise(420)}>
                {couple.invite}
              </p>
            </div>

            {/* The couple's names, one after another */}
            <h2 id="couple-heading" className="mt-5 flex w-full flex-col items-center">
              <FitText as="span" tiers={NAME_FIT} className="t-names couple-name" style={rise(600)}>
                {first}
              </FitText>
              <span className="couple-amp" style={rise(760)}>
                &amp;
              </span>
              <FitText as="span" tiers={NAME_FIT} className="t-names couple-name" style={rise(920)}>
                {second}
              </FitText>
            </h2>

            {/* The date as a classic block, the venue, and Add to calendar */}
            <div className="mt-5 flex flex-col items-center" style={rise(1100)}>
              <DateBlock />
              {/* the venue and Add to calendar, together */}
              {(venueName || calendarUrl) && (
                <div className="mt-4 flex flex-col items-center">
                  {venueName && (
                    <>
                      <PinIcon />
                      <p className="mt-1.5 leading-snug">
                        <span className="couple-venue-name">{venueName}</span>
                        {venueCity && <span className="couple-venue-city">{venueCity}</span>}
                      </p>
                    </>
                  )}
                  {calendarUrl && (
                    <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="couple-cal mt-3">
                      <CalendarIcon />
                      Add to calendar
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* A small lotus, the quote, and the hashtag */}
            <div className="mt-5 flex flex-col items-center gap-2.5" style={rise(1280)}>
              <LotusIcon className="h-[18px] w-auto" />
              <p className="t-quote max-w-[17rem] [text-wrap:balance]">{couple.quote}</p>
              {couple.hashtag && (
                <div className="flex flex-col items-center gap-1.5">
                  <span aria-hidden className="h-px w-36" style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />
                  <FitText tiers={[[1, 0.6]]} className="t-hashtag">
                    {couple.hashtag}
                  </FitText>
                  <span aria-hidden className="h-px w-36" style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />
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
          className="mx-auto mt-3 block h-auto shrink-0"
          style={{
            width: "min(46cqw, 206px)",
            aspectRatio: `${COUPLE_ART.aspect}`,
            WebkitMaskImage: "linear-gradient(to bottom, #000 90%, transparent)",
            maskImage: "linear-gradient(to bottom, #000 90%, transparent)",
            opacity: on ? 1 : 0,
            transform: on ? "none" : "translateY(16px)",
            transition: reduced ? "none" : `opacity 1000ms ${EASE.silk} 700ms, transform 1100ms ${EASE.silk} 700ms`,
          }}
        />
      </div>
    </section>
  );
}

/** The date as a classic block: FRIDAY | 12 | FEB 2027, the words between thin gold lines of equal length. */
function DateBlock() {
  const p = parseVenueDateTime(wedding.wedding.dateTime);
  if (!p) return null;
  const f = formatVenueDate(p);
  return (
    <p className="grid w-[252px] max-w-full grid-cols-[1fr_auto_1fr] items-center gap-[14px]">
      <span className="couple-dateside">{f.weekday}</span>
      <span className="couple-dateday" style={{ color: MAROON }}>
        {f.day}
      </span>
      <span className="couple-dateside">
        {f.month.slice(0, 3)} {f.year}
      </span>
    </p>
  );
}

/** A small calendar, for Add to calendar. */
function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-[13px] w-[13px]" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3.2" width="12" height="10.8" rx="1.6" />
      <path d="M2 6.6h12M5.2 1.8v2.6M10.8 1.8v2.6" />
      <circle cx="8" cy="10.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
