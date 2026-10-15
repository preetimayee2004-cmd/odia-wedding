import { useRef, type CSSProperties } from "react";
import { wedding, type EventId, type WeddingEvent } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { Pending } from "@/components/ui/Pending";

// The couple card cream; the artwork's paper is recoloured to match.
const CREAM = "#F8F2E5";
const MAROON = "#7B1E1E"; // event titles
const ODIA_RED = "#A3161A"; // Odia names
const LABEL = "#6B4A3A"; // Time / Venue / Dress code
const VALUE = "#2B1A14"; // their values
const GOLD = "#C9962B"; // divider lines
const ART = "/art/events";

/**
 * Artwork from the couple's Wedding Events design (848 px wide): the arched
 * header with Lord Jagannath, palms and lanterns, and the foot with an
 * elephant at each corner.
 */
const DESIGN_W = 848;
const HEADER = { w: 1696, h: 424 }; // the header art, at 2×
const FOOTER_H = 129;
/** Where the design's frame lines run (design px): its outer rule, and the arch as it comes down. */
const FRAME = { outer: { x: 19, w: 4 }, inner: { x: 57, w: 5 } };
const cq = (px: number) => `${((px / DESIGN_W) * 100).toFixed(3)}cqw`;

/** Each ceremony's painting: a transparent PNG (2×), placed straight on the cream. */
const PAINTINGS: Record<EventId, { src: string; w: number; h: number; alt: string }> = {
  mehendi: { src: "01_mehendi", w: 356, h: 256, alt: "A bowl of mehendi and hands painted with it" },
  sangeet: { src: "02_sangeet", w: 372, h: 256, alt: "A dhol, tabla and music" },
  mangana: { src: "03_mangana", w: 316, h: 244, alt: "A kalash among marigolds" },
  barajatri: { src: "04_barajatri", w: 392, h: 256, alt: "The groom on horseback under a parasol, with drummers" },
  batabarana: { src: "05_bata_barana", w: 340, h: 208, alt: "A conch and a lit diya on a welcome plate" },
  hastaganthi: { src: "06_hasta_ganthi", w: 340, h: 228, alt: "Hands joined, with bridal bangles" },
  sindoor: { src: "07_sindoor_daan", w: 292, h: 224, alt: "Bowls of sindoor among flowers" },
  bidaai: { src: "08_bidaai", w: 344, h: 232, alt: "The bride in a palanquin" },
  reception: { src: "09_reception", w: 344, h: 284, alt: "A decorated mandap" },
};

/**
 * Section — Wedding Events.
 * After the couple's design, on the couple card's cream: under the painted
 * arch (Lord Jagannath between palms and lanterns), each ceremony is one
 * row — its painting on one side, alternating left and right, and its name,
 * Odia name, time, venue and dress code on the other — with a small lotus
 * divider between ceremonies, down to the elephants at the foot.
 */
export function Events() {
  const { heading, odiaHeading, items } = wedding.events;
  const headerRef = useRef<HTMLDivElement>(null);
  const headerIn = useInView(headerRef);
  const fade = (delay: number): CSSProperties => ({ opacity: headerIn ? 1 : 0, transition: `opacity 900ms ${EASE.silk} ${delay}ms` });

  return (
    <section id="events" aria-labelledby="events-heading" className="relative [container-type:inline-size]" style={{ backgroundColor: CREAM }}>
      {/* The arch, with the title inside it */}
      <div ref={headerRef} className="relative">
        <img
          src={`${ART}/header.webp`}
          alt=""
          aria-hidden
          width={HEADER.w}
          height={HEADER.h}
          decoding="async"
          className="block h-auto w-full"
        />
        <div className="absolute inset-x-0 flex flex-col items-center" style={{ top: cq(100) }}>
          <h2 id="events-heading" className="whitespace-nowrap font-serif font-semibold leading-none" style={{ fontSize: cq(54), color: MAROON, ...fade(0) }}>
            {heading}
          </h2>
          {odiaHeading && (
            <p lang="or" className="odia whitespace-nowrap font-semibold leading-none" style={{ fontSize: `max(13px, ${cq(24)})`, color: ODIA_RED, marginTop: cq(14), ...fade(150) }}>
              {odiaHeading}
            </p>
          )}
        </div>
      </div>

      {/* The ceremonies, inside the frame */}
      <div className="relative">
        <FrameRules side="left" />
        <FrameRules side="right" />
        <ol className="relative mx-auto max-w-[40rem] pb-5 pt-5" style={{ paddingInline: `calc(${cq(FRAME.inner.x + FRAME.inner.w)} + 0.375rem)` }}>
          {items.map((event, i) => (
            <li key={event.id}>
              {i > 0 && <LotusDivider />}
              <EventRow event={event} imageRight={i % 2 === 1} />
            </li>
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

function EventRow({ event, imageRight }: { event: WeddingEvent; imageRight: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.35 });
  const art = PAINTINGS[event.id];

  const rise = (delay: number, dx = 0): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : `translate(${dx}px, 10px)`,
    transition: `opacity 700ms ${EASE.silk} ${delay}ms, transform 800ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <div ref={ref} className={`flex items-center gap-[10px] ${imageRight ? "flex-row-reverse" : ""}`}>
      <img
        src={`/images/events/${art.src}.png`}
        width={art.w}
        height={art.h}
        alt={art.alt}
        decoding="async"
        loading="lazy"
        className="block h-auto shrink-0 object-contain"
        style={{ width: "clamp(110px, 31cqw, 180px)", ...rise(0, imageRight ? 12 : -12) }}
      />

      <div className="min-w-0 flex-1" style={rise(100)}>
        <h3 className="font-serif text-[22px] font-semibold leading-[1.25]" style={{ color: MAROON }}>
          {event.name}
          {event.odiaName && (
            <span lang="or" className="odia ml-2 inline-block text-[16px] font-semibold leading-[1.25]" style={{ color: ODIA_RED }}>
              {event.odiaName}
            </span>
          )}
        </h3>
        <dl className="mt-1 space-y-0.5 font-serif leading-[1.5]">
          <Detail label="Time" value={event.when} />
          <Detail label="Venue" value={event.venueName} />
          <Detail label="Dress code" value={event.dressCode} />
        </dl>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  const term = (
    <dt className="mr-1.5 inline whitespace-nowrap text-[14px] font-medium" style={{ color: LABEL }}>
      {label}
    </dt>
  );
  if (!value) {
    return (
      <div>
        {term}
        <dd className="inline text-[16px] font-medium" style={{ color: VALUE }}>
          <Pending label={`${label} awaiting confirmation`}>To be confirmed</Pending>
        </dd>
      </div>
    );
  }
  // "Traditional wear | Bright & festive" → two phrases with a quiet dot between,
  // short ones kept whole; lines may break between and within longer ones
  const lines = keepTimesTogether(value)
    .split("\n")
    .map((line) => line.split(" | "));
  return (
    <div>
      {term}
      <dd className="inline text-[16px] font-medium" style={{ color: VALUE }}>
        {lines.map((parts, i) => (
          <span key={i} className={i > 0 ? "block" : undefined}>
            {parts.map((part, j) => (
              <span key={j}>
                <span className={parts.length > 1 && part.length <= 18 ? "whitespace-nowrap" : undefined}>
                  {part}
                  {j < parts.length - 1 && (
                    <span aria-hidden className="ml-1.5" style={{ color: ODIA_RED }}>
                      ·
                    </span>
                  )}
                </span>
                {j < parts.length - 1 && " "}
              </span>
            ))}
          </span>
        ))}
      </dd>
    </div>
  );
}

/** "10:00 AM – 1:00 PM" may break only after the dash, never inside "10:00 AM". */
const keepTimesTogether = (text: string) => text.replace(/(\d) (AM|PM)/g, "$1 $2");

/** Between ceremonies: thin gold line — small red lotus — thin gold line. */
function LotusDivider() {
  return (
    <div aria-hidden className="mx-auto my-3 flex w-[58%] items-center gap-2">
      <span className="h-px flex-1" style={{ backgroundColor: GOLD }} />
      <svg viewBox="0 0 28 18" className="h-[14px] w-auto shrink-0" fill="none" stroke={ODIA_RED} strokeWidth="1.4" strokeLinejoin="round">
        <path d="M14 2c2.6 3 2.6 7.5 0 11-2.6-3.5-2.6-8 0-11Z" fill={`${ODIA_RED}40`} />
        <path d="M14 13c-3-1-6-3.5-6.6-7.6 3.5.5 5.7 3 6.6 7.6Zm0 0c3-1 6-3.5 6.6-7.6-3.5.5-5.7 3-6.6 7.6Z" />
        <path d="M8 16h12" strokeLinecap="round" />
      </svg>
      <span className="h-px flex-1" style={{ backgroundColor: GOLD }} />
    </div>
  );
}

/** A fine double rule carrying the arch's frame down to the foot. */
function FrameRules({ side }: { side: "left" | "right" }) {
  const rule = (x: number, w: number, opacity: number): CSSProperties => ({
    [side]: cq(x),
    width: `max(1px, ${cq(w * 0.5)})`,
    backgroundColor: MAROON,
    opacity,
  });
  return (
    <div aria-hidden className="pointer-events-none">
      <span className="absolute inset-y-0" style={rule(FRAME.outer.x, FRAME.outer.w, 0.75)} />
      <span className="absolute inset-y-0" style={rule(FRAME.inner.x + 1, FRAME.inner.w, 0.45)} />
    </div>
  );
}
