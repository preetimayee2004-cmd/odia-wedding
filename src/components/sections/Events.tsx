import { useRef, type CSSProperties, type ReactNode } from "react";
import { wedding, type EventId, type WeddingEvent } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { Pending } from "@/components/ui/Pending";

// The paper of the itinerary artwork, so its cut-outs sit flush on the page.
const PAPER = "#FCF9E9";
const MAROON = "#5A1A1A";
const INK = "#2E1A10";
const ART = "/art/itinerary";

/**
 * Hand-painted illustrations cut from the couple's itinerary design, beside
 * each ceremony (left / right), with their natural aspect ratios.
 */
const ILLUSTRATIONS: Record<EventId, { left?: Art; right?: Art }> = {
  haldi: { left: { src: "haldi", w: 100, h: 116, alt: "A marigold garland, turmeric and a brass pot" } },
  "mehendi-sangeet": {
    left: { src: "mehendi", w: 96, h: 98, alt: "Hands painted with mehendi" },
    right: { src: "sangeet", w: 102, h: 94, alt: "A dhol drum and music" },
  },
  "barajatri-batabarana": {
    left: { src: "barajatri", w: 104, h: 96, alt: "The groom's golden chariot and horse" },
    right: { src: "batabarana", w: 104, h: 106, alt: "A conch and a welcome thali" },
  },
  "hastaganthi-sindoor": {
    left: { src: "hastaganthi", w: 99, h: 82, alt: "The sacred knot tied in red and yellow cloth" },
    right: { src: "sindoor", w: 100, h: 98, alt: "The sacred fire and a sindoor box" },
  },
  bidaai: {
    left: { src: "bidaai", w: 136, h: 94, alt: "A bridal palanquin" },
    right: { src: "drops", w: 60, h: 76, alt: "" },
  },
  reception: { right: { src: "reception", w: 104, h: 130, alt: "A decorated stage and a festive thali" } },
};
interface Art {
  src: string;
  w: number;
  h: number;
  alt: string;
}

// Side border, cut from the design's left edge: top (temple), a repeating vine, bottom (temple).
const BORDER = { w: 72, top: 520, tile: 480, bottom: 520 };
const BORDER_W = 34; // px on screen
const k = BORDER_W / BORDER.w;

/**
 * Section — Wedding Itinerary.
 * A painted page after the couple's design: a maroon floral border with
 * temple towers down both sides, a mandala at the top and bottom, the title
 * between two kalash, and each ceremony with its Odia name, time, venue and
 * dress code, flanked by hand-painted illustrations.
 */
export function Events() {
  const { heading, items } = wedding.events;
  const headerRef = useRef<HTMLDivElement>(null);
  const headerIn = useInView(headerRef);

  return (
    <section id="events" aria-labelledby="events-heading" className="relative overflow-hidden" style={{ backgroundColor: PAPER }}>
      <SideBorder side="left" />
      <SideBorder side="right" />

      {/* Mandala at the top */}
      <img src={`${ART}/mandala-top.webp`} alt="" aria-hidden decoding="async" loading="lazy" className="mx-auto block w-[38%] max-w-[11rem]" />

      <div className="relative" style={{ paddingInline: BORDER_W + 6 }}>
        <div ref={headerRef} className="mt-4 text-center" style={{ opacity: headerIn ? 1 : 0, transition: `opacity 900ms ${EASE.silk}` }}>
          <div className="flex items-center justify-center gap-2">
            <img src={`${ART}/kalash.webp`} alt="" aria-hidden className="h-7 w-auto shrink-0" />
            <h2 id="events-heading" className="whitespace-nowrap font-serif text-[1.22rem] font-bold uppercase leading-none tracking-[0.03em]" style={{ color: MAROON }}>
              {heading}
            </h2>
            <img src={`${ART}/kalash.webp`} alt="" aria-hidden className="h-7 w-auto shrink-0" />
          </div>
          <img src={`${ART}/divider.webp`} alt="" aria-hidden className="mx-auto mt-2 block w-[86%]" />
        </div>

        <ol className="mt-3">
          {items.map((event, i) => (
            <EventItem key={event.id} event={event} index={i} />
          ))}
        </ol>
      </div>

      {/* Mandala at the foot */}
      <img src={`${ART}/mandala-bottom.webp`} alt="" aria-hidden decoding="async" loading="lazy" className="mx-auto mt-2 block w-[34%] max-w-[10rem]" />
    </section>
  );
}

function EventItem({ event, index }: { event: WeddingEvent; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const art = ILLUSTRATIONS[event.id];
  const combined = event.name.includes("&");

  const rise = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(12px)",
    transition: `opacity 800ms ${EASE.silk} ${delay}ms, transform 900ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <li ref={ref} className="relative flex min-h-[7.5rem] items-center py-4">
      {art.left && <Illustration art={art.left} side="left" style={rise(index % 2 ? 150 : 0)} />}
      {art.right && <Illustration art={art.right} side="right" style={rise(index % 2 ? 0 : 150)} />}

      <div className="relative mx-auto w-full px-[17.5%] text-center font-serif" style={{ ...rise(80), color: INK }}>
        <h3 className="font-serif text-[1.3rem] font-semibold leading-tight" style={{ color: MAROON }}>
          {event.name}
          {event.odiaName && !combined && (
            <>
              <span className="mx-1.5 font-normal opacity-70">|</span>
              <span lang="or" className="odia font-semibold">
                {event.odiaName}
              </span>
            </>
          )}
        </h3>
        {event.odiaName && combined && (
          <p lang="or" className="odia mt-0.5 text-[1.05rem] font-semibold leading-snug" style={{ color: MAROON }}>
            {event.odiaName}
          </p>
        )}
        <div className="mt-1.5 space-y-0.5 text-[0.88rem] font-normal leading-snug">
          <Detail label="Time" value={event.when} />
          <Detail label="Venue" value={event.venueName} />
          <Detail label="Dress Code" value={event.dressCode} />
        </div>
      </div>
    </li>
  );
}

function Detail({ label, value }: { label: string; value: string | null }): ReactNode {
  if (value) {
    return (
      <p>
        <span className="whitespace-nowrap font-semibold">{label}:</span> {keepBracketsTogether(value)}
      </p>
    );
  }
  return (
    <div className="flex justify-center">
      <Pending label={`${label} awaiting confirmation`}>
        <p>{label}: to be confirmed</p>
      </Pending>
    </div>
  );
}

/** "7:00 PM onwards (Next Evening)" never breaks inside the brackets. */
const keepBracketsTogether = (text: string) => text.replace(/\([^)]*\)/g, (m) => m.replace(/ /g, "\u00a0"));

function Illustration({ art, side, style }: { art: Art; side: "left" | "right"; style: CSSProperties }) {
  return (
    <img
      src={`${ART}/${art.src}.webp`}
      alt={art.alt}
      aria-hidden={art.alt ? undefined : true}
      decoding="async"
      loading="lazy"
      className={`absolute top-1/2 h-auto ${side === "left" ? "left-0" : "right-0"}`}
      style={{ width: `${Math.min(20, (art.w / 104) * 18.5)}%`, aspectRatio: `${art.w} / ${art.h}`, ...style, translate: "0 -50%" }}
    />
  );
}

/** One side's border: temple tower at the top, the vine repeating, temple tower at the foot. */
function SideBorder({ side }: { side: "left" | "right" }) {
  const piece = (name: string, h: number): CSSProperties => ({
    backgroundImage: `url(${ART}/border-${name}.webp)`,
    backgroundSize: `${BORDER_W}px ${h * k}px`,
    height: h * k,
  });
  // Pieces fade into the repeating vine where they meet it.
  const fade = (to: "top" | "bottom") => {
    const g = `linear-gradient(to ${to}, #000 82%, transparent)`;
    return { WebkitMaskImage: g, maskImage: g };
  };
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 ${side === "left" ? "left-0" : "right-0 -scale-x-100"}`}
      style={{ width: BORDER_W }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${ART}/border-tile.webp)`,
          backgroundSize: `${BORDER_W}px ${BORDER.tile * k}px`,
          backgroundRepeat: "repeat-y",
          // start mid-tile, where the vine continues from the top piece
          backgroundPosition: `0 ${(-BORDER.tile / 2) * k}px`,
        }}
      />
      <div className="absolute inset-x-0 top-0" style={{ ...piece("top", BORDER.top), ...fade("bottom") }} />
      <div className="absolute inset-x-0 bottom-0" style={{ ...piece("bottom", BORDER.bottom), ...fade("top") }} />
    </div>
  );
}
