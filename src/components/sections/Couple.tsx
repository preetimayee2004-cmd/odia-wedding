import { useRef, type CSSProperties, type ReactNode } from "react";
import { wedding } from "@/config/wedding";
import { useFitToArea } from "@/hooks/useFitToArea";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { CardBackdrop, cardCq, cardMinHeight, type CardArt } from "@/components/art/CardBackdrop";
import { Divider, PinIcon } from "@/components/ui/CardOrnaments";

/**
 * The couple card artwork (768×1376): a carved arch in a red-and-gold border,
 * with the illustrated bride and groom at the bottom right. Its top (the
 * arch) and bottom (the couple) are kept whole; a plain band of the middle
 * repeats between them so the card fills the screen undistorted.
 */
const CARD: CardArt = { src: "/art/couple-card.jpg", middle: "/art/couple-card-middle.png", w: 768, h: 1376, top: 606, bottomFrom: 723 };
const cq = (px: number) => cardCq(CARD, px);
const ARCH_INSIDE = 215; // the words start below the arch's peak (card px)
const COUPLE_FROM = 745; // the illustrated couple (their crowns) begins here
const ARCH_EDGE = 100; // the arch's inner edge, in from each side

const INK = "#2E1A10";
const MAROON = "#7A1424";
const GOLD = "#B8863B";
const DARK_GOLD = "#8F6420";
const LINE_STAGGER = 140;

/**
 * Section 03 — The couple.
 * The couple's card fills the screen; inside its arch, above the illustrated
 * bride and groom, their names, the date and place, and a few words of
 * welcome rise in one by one as the section comes into view.
 */
export function Couple() {
  const ref = useRef<HTMLElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  useFitToArea(areaRef, blockRef);
  const { invitation } = wedding;
  const [first, second] = invitation.names;

  const line = (order: number): CSSProperties => {
    const delay = 150 + order * LINE_STAGGER;
    return {
      opacity: inView ? 1 : 0,
      transform: inView ? "none" : "translateY(10px)",
      transition: `opacity 800ms ${EASE.silk} ${delay}ms, transform 800ms ${EASE.silk} ${delay}ms`,
    };
  };

  const lines: ReactNode[] = [
    <p key="e" className="mb-1 text-[13px] font-bold tracking-[0.3em] [font-variant-caps:small-caps]" style={{ color: DARK_GOLD }}>
      The Couple
    </p>,
    <p key="n" aria-hidden className="mb-2 flex flex-col items-center leading-[1.05]" style={{ color: MAROON }}>
      <span className="font-vibes text-[44px]">{first}</span>
      <span className="font-vibes text-[26px] leading-none" style={{ color: GOLD }}>
        &amp;
      </span>
      <span className="font-vibes text-[44px]">{second}</span>
    </p>,
    <Divider key="d" className="mb-2.5" />,
    invitation.dateLine && (
      <p key="dt" className="mb-1 text-[19px] font-bold leading-snug" style={{ color: MAROON }}>
        {invitation.dateLine}
      </p>
    ),
    invitation.place && (
      <div key="pl" className="mb-3 flex flex-col items-center">
        <PinIcon />
        <p className="mt-0.5 max-w-[15rem] text-[14.5px] font-semibold leading-snug">{invitation.place}</p>
      </div>
    ),
    <p key="m" className="mx-auto max-w-[17rem] text-[15.5px] font-semibold italic leading-relaxed">
      {wedding.couple.message}
    </p>,
  ].filter(Boolean);

  return (
    <section
      ref={ref}
      id="couple"
      aria-labelledby="couple-heading"
      data-status-tone="light"
      className="relative [container-type:inline-size]"
    >
      <h2 id="couple-heading" className="sr-only">
        {first} and {second}
      </h2>
      <CardBackdrop card={CARD} />

      <div
        className="relative z-20 flex flex-col"
        style={{ minHeight: cardMinHeight(CARD), paddingTop: cq(ARCH_INSIDE), paddingBottom: cq(CARD.h - COUPLE_FROM), color: INK }}
      >
        {/* Inside the arch, above the illustrated couple; shrinks if needed to fit */}
        <div ref={areaRef} className="relative min-h-0 flex-1">
          <div
            ref={blockRef}
            className="absolute inset-x-0 top-1/2 py-2 text-center font-serif"
            style={{ paddingInline: `calc(${cq(ARCH_EDGE)} + 10px)`, transform: "translateY(-50%)" }}
          >
            {lines.map((node, i) => (
              <div key={i} style={line(i)}>
                {node}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
