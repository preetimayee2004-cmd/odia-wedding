import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { useFitToArea } from "@/hooks/useFitToArea";
import { EASE } from "@/lib/motion";
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
 * The invitation card artwork (768×1376). Its decorated top (garlands,
 * Jagannath, Balabhadra and Subhadra) and bottom (banana trees, kalash) are
 * kept whole; a plain 70px band of its middle (border and dotted lines only)
 * repeats between them, so the card fills any screen height undistorted.
 */
const CARD: CardArt = { src: "/art/invitation-card.jpg", middle: "/art/invitation-card-middle.png", w: 768, h: 1376, top: 580, bottomFrom: 650 };
const cq = (px: number) => cardCq(CARD, px);
const DEITIES_BASE = 490; // the deities' platform ends here (card px)
const PANEL_BOTTOM = 1262; // the cream panel's bottom dotted line (card px)
const PANEL_EDGE = 62; // the dotted inner border, in from each side

const INK = "#2E1A10";
const LINE_STAGGER = 150;
const LINE_DURATION = 800;
const RANGOLI_SIZE = 124;

/**
 * Section 02 — The invitation card.
 * The whole card fits one screen: the words sit on its cream panel, centred
 * between the deities and a colourful jhoti rangoli standing between the
 * banana trees, and shrink just enough to fit the space between them. The
 * rangoli is the way in: tapped (or after a pause) it spins into a golden
 * wash that fades into the Couple section.
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
      <span className="t-names">{first}</span>
      <span className="t-amp my-1">&amp;</span>
      <span className="t-names">{second}</span>
    </h1>,
    <p key="a" className="t-quote">
      {invitation.announcement}
    </p>,
  ].filter(Boolean);

  return (
    <section
      id="invitation"
      aria-label="Wedding invitation"
      data-status-tone="light"
      className="relative [container-type:inline-size]"
    >
      <CardBackdrop card={CARD} />

      <div
        className="relative z-20 flex flex-col"
        style={{
          // One screen tall; never shorter than the card's own top and bottom
          minHeight: cardMinHeight(CARD),
          paddingTop: cq(DEITIES_BASE),
          // Clear of the bottom dotted line, so "Tap the rangoli" reads easily
          paddingBottom: `calc(${cq(CARD.h - PANEL_BOTTOM)} + 22px)`,
          color: INK,
        }}
      >
        {/* The free space between the deities and the rangoli; the words are
            centred in it, shrunk if needed to fit */}
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

        {/* The way in: a rangoli in the clear space between the banana trees */}
        <div className="mt-2 flex shrink-0 justify-center">
          <RangoliStart active={show} onOpen={onOpen} size={RANGOLI_SIZE} />
        </div>
      </div>
    </section>
  );
}
