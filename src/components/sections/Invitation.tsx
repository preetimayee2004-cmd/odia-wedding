import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { useFitToArea } from "@/hooks/useFitToArea";
import { EASE } from "@/lib/motion";
import { parseVenueDateTime } from "@/lib/venueTime";
import { CardBackdrop, cardCq, cardMinHeight, type CardArt } from "@/components/art/CardBackdrop";
import { RangoliStart } from "@/components/sections/RangoliStart";
import { Divider } from "@/components/ui/CardOrnaments";

export type RevealState = "hidden" | "revealing" | "shown";

interface InvitationProps {
  reveal: RevealState;
  /** Mounts the next sections and jumps to them (behind the golden wash). */
  onOpen: () => Promise<void>;
}

/**
 * The invitation card artwork (768×1376). Its decorated top (hanging strings,
 * lamps and lotus buds) and bottom (banana trees, kalash) are kept whole; a
 * plain 70px band of its middle (border and dotted lines only) repeats
 * between them, so the card fills any screen height undistorted. The toran
 * and the trinity (Jagannath, Balabhadra and Subhadra) were lifted out of it
 * into their own layers (public/art/invitation/), so the toran can sway and
 * the trinity can be sized and glow.
 */
const CARD: CardArt = { src: "/art/invitation/card.jpg", middle: "/art/invitation-card-middle.png", w: 768, h: 1376, top: 580, bottomFrom: 650 };
const cq = (px: number) => cardCq(CARD, px);
const PANEL_TOP = 140; // the cream panel's top edge (card px)
const PANEL_BOTTOM = 1262; // the cream panel's bottom dotted line (card px)
const PANEL_EDGE = 62; // the dotted inner border, in from each side
/** The toran layer, where it hangs in the card (card px). */
const TORAN = { src: "/art/invitation/toran.webp", x: 170, y: 144, w: 430, h: 160 };
/** The trinity layer (322×154). */
const TRINITY = { src: "/art/invitation/trinity.webp", w: 322, h: 154, alt: "Lord Jagannath with Balabhadra and Subhadra" };
/** The trinity's art ends here (card px): the top band is never shorter than this. */
const TRINITY_BASE = 500;
/** The painted flames on the two hanging brass lamps (card px), each given a flickering flame. */
const FLAMES = [
  [107, 454],
  [164.5, 454],
  [602, 452.5],
  [659.5, 452.5],
] as const;

const INK = "#2E1A10";
const MAROON = "#7A1424";
const LINE_STAGGER = 150;
const LINE_DURATION = 800;
const RANGOLI_SIZE = 161; // 30% larger than before

/** "12 · 02 · 2027" from the wedding date. */
const shortDate = (() => {
  const p = parseVenueDateTime(wedding.wedding.dateTime);
  return p ? [String(p.day).padStart(2, "0"), String(p.month).padStart(2, "0"), String(p.year)].join(" · ") : null;
})();

/**
 * Section 02 — The invitation card.
 * The whole card fits one screen, its cream panel in three bands: the top
 * art (the swaying toran, the trinity in a soft glow, the lamps' flickering
 * flames) about 30%, the words about 40% (centred, shrunk only if they must
 * be), and the rangoli with "Tap the rangoli" about 30%. The rangoli is the
 * way in: tapped it spins into a golden wash that fades into the Couple
 * section. With reduced motion nothing sways, flickers or turns.
 */
export function Invitation({ reveal, onOpen }: InvitationProps) {
  const { guestName } = useGuest();
  const { invitation } = wedding;
  const [first, second] = invitation.names;

  const show = reveal !== "hidden";
  const areaRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  useFitToArea(areaRef, blockRef);

  // Warm the couple card so it's ready the moment the golden wash fades
  useEffect(() => {
    for (const src of ["/art/couple-card.jpg", "/art/couple-card-middle.png", "/art/couple-havan.png"]) new Image().src = src;
  }, []);

  const line = (order: number): CSSProperties => {
    const delay = 250 + order * LINE_STAGGER;
    return {
      opacity: show ? 1 : 0,
      transform: show ? "none" : "translateY(10px)",
      transition: `opacity ${LINE_DURATION}ms ${EASE.silk} ${delay}ms, transform ${LINE_DURATION}ms ${EASE.silk} ${delay}ms`,
    };
  };

  const lines: ReactNode[] = [
    <p key="h" className="t-blessing mb-1.5">
      {invitation.heading}
    </p>,
    <p key="g" className="t-greeting mb-1.5">
      {invitation.greeting.replace("{guest}", guestName)}
    </p>,
    <Divider key="d1" className="mb-2" />,
    <p key="s" className="t-label">
      {invitation.saveTheDate}
    </p>,
    // The names, one above the other with the ampersand between
    <h1 key="n" className="flex flex-col items-center">
      <span className="t-names text-[52px]">{first}</span>
      <span className="t-amp my-0.5 text-[28px]">&amp;</span>
      <span className="t-names text-[52px]">{second}</span>
    </h1>,
    <p key="a" className="t-quote">
      {invitation.announcement}
    </p>,
    // The date and the city, under a small gold divider
    (shortDate || wedding.venue.city) && (
      <div key="w" className="mt-2.5 flex flex-col items-center">
        <Divider className="mb-2" />
        {shortDate && (
          <p className="font-cinzel text-[15px] font-semibold leading-tight tracking-[0.2em]" style={{ color: MAROON, marginRight: "-0.2em" }}>
            {shortDate}
          </p>
        )}
        {wedding.venue.city && <p className="mt-1 font-serif text-[13px] italic leading-tight" style={{ color: "#7A5A44" }}>{wedding.venue.city}</p>}
      </div>
    ),
  ].filter(Boolean);

  return (
    <section
      id="invitation"
      aria-label="Wedding invitation"
      data-status-tone="light"
      className="relative [container-type:inline-size]"
    >
      <CardBackdrop card={CARD} />

      {/* The toran, swaying gently from its top centre */}
      <img
        src={TORAN.src}
        alt=""
        aria-hidden
        decoding="async"
        className="inv-toran pointer-events-none absolute z-[15] block h-auto max-w-none"
        style={{ left: cq(TORAN.x), top: cq(TORAN.y), width: cq(TORAN.w) }}
      />
      {/* The hanging lamps' flames, flickering (each a little out of step) */}
      {FLAMES.map(([x, y], i) => (
        <span
          key={i}
          aria-hidden
          className="inv-flame pointer-events-none absolute z-[15]"
          style={{ left: cq(x - 5), top: cq(y - 13), width: cq(10), height: cq(16), animationDelay: `${[0, 0.45, 0.2, 0.7][i]}s` } as CSSProperties}
        />
      ))}

      <div
        className="relative z-20 flex flex-col"
        style={{
          // One screen tall, never shorter than the card's own top and bottom (it grows, and the page
          // scrolls a little, only if the words can't fit on a very short screen)
          minHeight: cardMinHeight(CARD),
          // the panel's inner height, which the three bands share
          "--inner": `calc(${cardMinHeight(CARD)} - ${cq(PANEL_TOP)} - ${cq(CARD.h - PANEL_BOTTOM)} - 18px)`,
          paddingTop: cq(PANEL_TOP),
          // Clear of the bottom dotted line, so "Tap the rangoli" reads easily
          paddingBottom: `calc(${cq(CARD.h - PANEL_BOTTOM)} + 18px)`,
          color: INK,
        } as CSSProperties}
      >
        {/* Top band (about 30%): below the toran, the trinity in a soft golden glow */}
        <div className="relative flex shrink-0 items-end justify-center" style={{ height: `max(calc(var(--inner) * 0.27), ${cq(TRINITY_BASE - PANEL_TOP)})` }}>
          <div className="relative mb-1" style={{ width: "clamp(150px, 41cqw, 160px)" }}>
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: "radial-gradient(circle, rgb(255 214 140 / 0.35) 0%, rgb(255 214 140 / 0.18) 38%, transparent 70%)" }}
            />
            <img src={TRINITY.src} width={TRINITY.w} height={TRINITY.h} alt={TRINITY.alt} decoding="async" className="relative block h-auto w-full" />
          </div>
        </div>

        {/* Middle band (about 40%): the words, centred, shrunk only if they must be */}
        <div ref={areaRef} className="relative min-h-0 flex-1">
          <div
            ref={blockRef}
            className="absolute inset-x-0 top-1/2 py-2 text-center font-serif"
            style={{ paddingInline: `calc(${cq(PANEL_EDGE)} + 28px)`, transform: "translateY(-50%)" }}
          >
            {lines.map((node, i) => (
              <div key={i} style={line(i)}>
                {node}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom band (about 30%): the way in, a rangoli between the banana trees, close to the words */}
        <div className="flex shrink-0 items-start justify-center" style={{ height: `max(calc(var(--inner) * 0.27), ${RANGOLI_SIZE + 44}px)` }}>
          <RangoliStart active={show} onOpen={onOpen} size={RANGOLI_SIZE} />
        </div>
      </div>
    </section>
  );
}
