import { useRef, type CSSProperties } from "react";
import { wedding, type EventId, type WeddingEvent } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { Pending } from "@/components/ui/Pending";

// The couple card cream; the artwork's paper is recoloured to match.
const CREAM = "#F8F2E5";
const MAROON = "#8A1C1C";
const INK = "#2E1A10";
const RED = "#B3261E";
const ART = "/art/events";

/**
 * Artwork cut from the couple's Wedding Events design (848 px wide): the
 * arched header with Lord Jagannath, palms and lanterns; the floral side
 * border (a repeating vine, mirrored on the right); the foot with an
 * elephant at each corner; and a painting beside each ceremony.
 */
const DESIGN_W = 848;
const HEADER_H = 212;
const FOOTER_H = 129;
const BORDER_W = 64;
const cq = (px: number) => `${((px / DESIGN_W) * 100).toFixed(3)}cqw`;
const ILLUSTRATIONS: Record<EventId, { w: number; h: number; alt: string }> = {
  mehendi: { w: 178, h: 128, alt: "A bowl of mehendi and hands painted with it" },
  sangeet: { w: 186, h: 128, alt: "A dhol, tabla and music" },
  mangana: { w: 158, h: 122, alt: "A kalash among marigolds" },
  barajatri: { w: 196, h: 128, alt: "The groom on horseback under a parasol, with drummers" },
  batabarana: { w: 170, h: 104, alt: "A conch and a lit diya on a welcome plate" },
  hastaganthi: { w: 170, h: 114, alt: "Hands joined, with bridal bangles" },
  sindoor: { w: 146, h: 112, alt: "Bowls of sindoor among flowers" },
  bidaai: { w: 172, h: 116, alt: "The bride in a palanquin" },
  reception: { w: 172, h: 142, alt: "A decorated mandap" },
};

/**
 * Section — Wedding Events.
 * A painted page after the couple's design, on the couple card's cream:
 * under an arch crowned by Lord Jagannath, between palms and lanterns, the
 * title; then each ceremony with its Odia name, time, venue and dress code,
 * its painting on alternating sides; elephants guard the foot.
 */
export function Events() {
  const { heading, odiaHeading, items } = wedding.events;
  const headerRef = useRef<HTMLDivElement>(null);
  const headerIn = useInView(headerRef);
  const fade = (delay: number): CSSProperties => ({ opacity: headerIn ? 1 : 0, transition: `opacity 900ms ${EASE.silk} ${delay}ms` });

  return (
    <section id="events" aria-labelledby="events-heading" className="relative [container-type:inline-size]" style={{ backgroundColor: CREAM }}>
      {/* The arch, with the title inside it */}
      <div
        ref={headerRef}
        className="relative w-full bg-cover"
        style={{ aspectRatio: `${DESIGN_W} / ${HEADER_H}`, backgroundImage: `url(${ART}/header.webp)` }}
      >
        <div className="absolute inset-x-0 flex flex-col items-center" style={{ top: cq(98) }}>
          <h2 id="events-heading" className="whitespace-nowrap font-serif font-bold leading-none" style={{ fontSize: cq(54), color: MAROON, ...fade(0) }}>
            {heading}
          </h2>
          {odiaHeading && (
            <p lang="or" className="odia whitespace-nowrap font-medium leading-none" style={{ fontSize: cq(21), color: INK, marginTop: cq(12), ...fade(150) }}>
              {odiaHeading}
            </p>
          )}
          <LotusRule style={{ width: cq(290), marginTop: cq(12), ...fade(250) }} />
        </div>
      </div>

      {/* The ceremonies, between the side borders */}
      <div className="relative">
        <SideBorder side="left" />
        <SideBorder side="right" />
        <ol className="relative py-2" style={{ paddingInline: `calc(${cq(BORDER_W)} + 4px)` }}>
          {items.map((event, i) => (
            <EventItem key={event.id} event={event} index={i} last={i === items.length - 1} />
          ))}
        </ol>
      </div>

      {/* The foot, with its elephants */}
      <img
        src={`${ART}/footer.webp`}
        alt=""
        aria-hidden
        decoding="async"
        loading="lazy"
        className="block w-full"
        style={{ aspectRatio: `${DESIGN_W} / ${FOOTER_H}` }}
      />
    </section>
  );
}

function EventItem({ event, index, last }: { event: WeddingEvent; index: number; last: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const art = ILLUSTRATIONS[event.id];
  const artLeft = index % 2 === 0;

  const rise = (delay: number, dx = 0): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : `translate(${dx}px, 12px)`,
    transition: `opacity 800ms ${EASE.silk} ${delay}ms, transform 900ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <li ref={ref}>
      <div className={`flex items-center gap-2 py-2 ${artLeft ? "" : "flex-row-reverse"}`}>
        <img
          src={`${ART}/${event.id}.webp`}
          alt={art.alt}
          decoding="async"
          loading="lazy"
          className="h-auto w-[38%] shrink-0"
          style={{ aspectRatio: `${art.w} / ${art.h}`, ...rise(0, artLeft ? -14 : 14) }}
        />
        <div className="min-w-0 flex-1 font-serif" style={{ ...rise(120), color: INK }}>
          <h3 className="font-serif text-[1.08rem] font-bold leading-tight" style={{ color: MAROON }}>
            {event.name}
            {event.odiaName && (
              <>
                <span className="mx-1 font-normal" style={{ color: INK }}>
                  |
                </span>
                <span lang="or" className="odia text-[0.95rem] font-medium">
                  {event.odiaName}
                </span>
              </>
            )}
          </h3>
          <dl className="mt-1 space-y-px text-[0.8rem] leading-snug">
            <Detail label="Time" value={event.when} />
            <Detail label="Venue" value={event.venueName} />
            <Detail label="Dress Code" value={event.dressCode} />
          </dl>
        </div>
      </div>
      {!last && <FlowerRule />}
    </li>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return (
      <Pending label={`${label} awaiting confirmation`}>
        <p>{label}: to be confirmed</p>
      </Pending>
    );
  }
  return (
    <div className="flex gap-1">
      <dt className="shrink-0 whitespace-nowrap">{label}:</dt>
      <dd className="whitespace-pre-line">{value}</dd>
    </div>
  );
}

/** A thin rule with a small red flower, between ceremonies. */
function FlowerRule() {
  return (
    <div aria-hidden className="mx-auto flex w-[64%] items-center gap-1.5 py-0.5">
      <span className="h-px flex-1" style={{ background: `linear-gradient(to left, ${RED}99, transparent)` }} />
      <svg viewBox="0 0 12 12" className="h-3 w-3" fill={RED}>
        <path d="M6 0c1.2 1.6 1.2 3.2 0 4.4C4.8 3.2 4.8 1.6 6 0Zm0 12c-1.2-1.6-1.2-3.2 0-4.4 1.2 1.2 1.2 2.8 0 4.4ZM0 6c1.6-1.2 3.2-1.2 4.4 0C3.2 7.2 1.6 7.2 0 6Zm12 0c-1.6 1.2-3.2 1.2-4.4 0 1.2-1.2 2.8-1.2 4.4 0Z" />
        <circle cx="6" cy="6" r="1.3" />
      </svg>
      <span className="h-px flex-1" style={{ background: `linear-gradient(to right, ${RED}99, transparent)` }} />
    </div>
  );
}

/** Rule — lotus — rule, beneath the title. */
function LotusRule({ style }: { style: CSSProperties }) {
  return (
    <div aria-hidden className="flex items-center gap-[3%]" style={style}>
      <span className="h-px flex-1" style={{ backgroundColor: `${MAROON}B3` }} />
      <svg viewBox="0 0 28 18" style={{ height: cq(20), width: "auto" }} fill="none" stroke={RED} strokeWidth="1.3" strokeLinejoin="round">
        <path d="M14 2c2.6 3 2.6 7.5 0 11-2.6-3.5-2.6-8 0-11Z" fill={`${RED}33`} />
        <path d="M14 13c-3-1-6-3.5-6.6-7.6 3.5.5 5.7 3 6.6 7.6Zm0 0c3-1 6-3.5 6.6-7.6-3.5.5-5.7 3-6.6 7.6Z" />
        <path d="M8 16h12" strokeLinecap="round" />
      </svg>
      <span className="h-px flex-1" style={{ backgroundColor: `${MAROON}B3` }} />
    </div>
  );
}

/** The floral side border: one vine, repeating; mirrored on the right. */
function SideBorder({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 ${side === "left" ? "left-0" : "right-0 -scale-x-100"}`}
      style={{
        width: cq(BORDER_W),
        backgroundImage: `url(${ART}/border-tile.webp)`,
        backgroundSize: "100% auto",
        backgroundRepeat: "repeat-y",
      }}
    />
  );
}
