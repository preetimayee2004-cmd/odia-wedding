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
const THREAD = "#A4553A"; // timeline and medallion ring
const ART = "/art/events";

/**
 * Artwork cut from the couple's Wedding Events design (848 px wide): the
 * arched header with Lord Jagannath, palms and lanterns, the foot with an
 * elephant at each corner, and a painting for each ceremony.
 */
const DESIGN_W = 848;
const HEADER = { w: 1696, h: 424 }; // the header art, at 2×
const FOOTER_H = 129;
/** Where the design's frame lines run (design px): its outer rule, and the arch as it comes down. */
const FRAME = { outer: { x: 19, w: 4 }, inner: { x: 57, w: 5 } };
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
const MEDALLION = 64; // px: every painting sits in the same white round medallion
const MEDALLION_PAD = 8;
/** 1× size of a painting fitted into the medallion's inner box. */
const fitted = ({ w, h }: { w: number; h: number }) => {
  const box = MEDALLION - MEDALLION_PAD * 2;
  const s = Math.min(box / w, box / h);
  return { width: Math.round(w * s), height: Math.round(h * s) };
};

/**
 * Section — Wedding Events.
 * An editorial timeline on the couple card's cream. Under the painted arch
 * (Lord Jagannath between palms and lanterns), a fine double rule carries
 * the frame down to the elephants at the foot. Each ceremony takes the same
 * row: its painting in a small medallion threaded on the timeline, then its
 * name and Odia name, and the time, venue and dress code on one axis.
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

      {/* The timeline, inside the frame */}
      <div className="relative">
        <FrameRules side="left" />
        <FrameRules side="right" />
        <ol
          className="relative mx-auto max-w-[30rem] pb-[100px] pt-5"
          style={{ paddingInline: `calc(${cq(FRAME.inner.x + FRAME.inner.w)} + 0.6rem)` }}
        >
          {items.map((event, i) => (
            <EventRow key={event.id} event={event} last={i === items.length - 1} />
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

function EventRow({ event, last }: { event: WeddingEvent; last: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { threshold: 0.35 });
  const art = ILLUSTRATIONS[event.id];
  const size = fitted(art);
  const icon = (x: number) => `${ART}/icons/${event.id}@${x}x.webp`;

  const rise = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(10px)",
    transition: `opacity 700ms ${EASE.silk} ${delay}ms, transform 800ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <li ref={ref} className={`relative grid items-start gap-x-3 ${last ? "" : "pb-6"}`} style={{ gridTemplateColumns: `${MEDALLION}px minmax(0, 1fr)` }}>
      {/* The timeline thread, down to the next medallion */}
      {!last && (
        <span
          aria-hidden
          className="absolute bottom-0 w-px"
          style={{ left: MEDALLION / 2, top: MEDALLION + 4, background: `linear-gradient(${THREAD}66, ${THREAD}26)` }}
        />
      )}

      <div
        className="flex items-center justify-center rounded-full bg-white"
        style={{
          width: MEDALLION,
          height: MEDALLION,
          padding: MEDALLION_PAD,
          boxShadow: `0 0 0 1px ${THREAD}40, 0 2px 6px -3px rgb(90 40 20 / 0.35)`,
          ...rise(0),
        }}
      >
        <img
          src={icon(1)}
          srcSet={`${icon(1)} 1x, ${icon(2)} 2x, ${icon(3)} 3x`}
          width={size.width}
          height={size.height}
          alt={art.alt}
          decoding="async"
          loading="lazy"
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="min-w-0 pt-1" style={rise(100)}>
        <h3 className="font-serif text-[22px] font-semibold leading-[1.25]" style={{ color: MAROON }}>
          {event.name}
          {event.odiaName && (
            <span lang="or" className="odia ml-2 inline-block text-[16px] font-semibold leading-[1.25]" style={{ color: ODIA_RED }}>
              {event.odiaName}
            </span>
          )}
        </h3>
        <dl className="mt-1.5 grid gap-x-2.5 gap-y-1 font-serif leading-[1.5]" style={{ gridTemplateColumns: "max-content minmax(0, 1fr)" }}>
          <Detail label="Time" value={event.when} />
          <Detail label="Venue" value={event.venueName} />
          <Detail label="Dress code" value={event.dressCode} />
        </dl>
      </div>
    </li>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  const term = (
    <dt className="pt-[2px] text-[14px] font-medium" style={{ color: LABEL }}>
      {label}
    </dt>
  );
  if (!value) {
    return (
      <>
        {term}
        <dd className="text-[16px] font-medium" style={{ color: VALUE }}>
          <Pending label={`${label} awaiting confirmation`}>To be confirmed</Pending>
        </dd>
      </>
    );
  }
  // "Traditional wear | Bright & festive" → two phrases with a quiet dot between,
  // short ones kept whole; lines may break between and within longer ones
  const lines = keepTimesTogether(value)
    .split("\n")
    .map((line) => line.split(" | "));
  return (
    <>
      {term}
      <dd className="text-[16px] font-medium" style={{ color: VALUE }}>
        {lines.map((parts, i) => (
          <span key={i} className="block">
            {parts.map((part, j) => (
              <span key={j}>
                <span className={parts.length > 1 && part.length <= 18 ? "whitespace-nowrap" : undefined}>
                  {part}
                  {j < parts.length - 1 && (
                    <span aria-hidden className="ml-1.5" style={{ color: ODIA_RED }}>
                      ·
                    </span>
                  )}
                </span>{" "}
              </span>
            ))}
          </span>
        ))}
      </dd>
    </>
  );
}

/** "10:00 AM – 1:00 PM" may break only after the dash, never inside "10:00 AM". */
const keepTimesTogether = (text: string) => text.replace(/(\d) (AM|PM)/g, "$1\u00a0$2");

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
