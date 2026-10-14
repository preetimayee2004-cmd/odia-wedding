import { type CSSProperties, type ReactNode } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { EASE } from "@/lib/motion";
import { RangoliStart } from "@/components/sections/RangoliStart";

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
const CARD = { src: "/art/invitation-card.jpg", middle: "/art/invitation-card-middle.png", w: 768, h: 1376, top: 580, bottomFrom: 650 };
// Lengths in card pixels → container width units (the card spans the section's width).
const cq = (px: number) => `${((px / CARD.w) * 100).toFixed(3)}cqw`;
const DEITIES_BASE = 490; // the deities' platform ends here (card px)
const PANEL_BOTTOM = 1262; // the cream panel's bottom dotted line (card px)
const RANGOLI_FROM = 848; // the rangoli zone: the clear column between the banana trees
const PANEL_EDGE = 62; // the dotted inner border, in from each side

const INK = "#2E1A10";
const MAROON = "#7A1424";
const GOLD = "#B8863B";
const DARK_GOLD = "#8F6420";
const LINE_STAGGER = 150;
const LINE_DURATION = 800;

/**
 * Section 02 — The invitation card.
 * The words sit on the card's cream panel, centred between the deities
 * and a colourful jhoti rangoli that stands between the banana trees as the
 * way in: tapped (or after a pause) it spins into a golden wash that fades
 * into the Couple section.
 */
export function Invitation({ reveal, onOpen }: InvitationProps) {
  const { guestName } = useGuest();
  const { invitation } = wedding;
  const [first, second] = invitation.names;

  const show = reveal !== "hidden";

  const line = (order: number): CSSProperties => {
    const delay = 250 + order * LINE_STAGGER;
    return {
      opacity: show ? 1 : 0,
      transform: show ? "none" : "translateY(10px)",
      transition: `opacity ${LINE_DURATION}ms ${EASE.silk} ${delay}ms, transform ${LINE_DURATION}ms ${EASE.silk} ${delay}ms`,
    };
  };

  const lines: ReactNode[] = [
    <p key="h" className="mb-3 text-[16px] font-bold tracking-[0.15em]" style={{ color: MAROON }}>
      {invitation.heading}
    </p>,
    <p key="g" className="mb-3 text-[20px] font-semibold italic leading-tight">
      {invitation.greeting.replace("{guest}", guestName)}
    </p>,
    <Divider key="d1" className="mb-3" />,
    <p key="m" className="mb-5 text-[17.5px] font-semibold leading-[1.7]">
      {invitation.message}
    </p>,
    <p key="s" className="text-[14px] font-bold tracking-[0.3em] [font-variant-caps:small-caps]" style={{ color: DARK_GOLD }}>
      {invitation.saveTheDate}
    </p>,
    // The names may run into the side padding (still inside the border) rather than wrap
    <h1 key="n" className="-mx-7 flex flex-wrap items-center justify-center gap-x-2.5 font-normal leading-[1.2]" style={{ color: MAROON }}>
      <span className="font-script text-[52px]">{first}</span>
      <span className="font-script text-[31.2px]" style={{ color: GOLD }}>
        &amp;
      </span>
      <span className="font-script text-[52px]">{second}</span>
    </h1>,
    <p key="a" className="mb-3 text-[19px] font-semibold italic">
      {invitation.announcement}
    </p>,
    <Divider key="d2" className="mb-3" />,
    invitation.dateLine && (
      <p key="dt" className="mb-3 text-[22px] font-bold leading-snug" style={{ color: MAROON }}>
        {invitation.dateLine}
      </p>
    ),
    invitation.place && (
      <div key="pl" className="flex flex-col items-center">
        <PinIcon />
        <p className="mt-1 max-w-[17rem] text-[17px] font-semibold leading-snug">{invitation.place}</p>
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
      {/* The card: whole top, repeating plain middle, whole bottom */}
      <div aria-hidden className="absolute inset-0 flex flex-col">
        <div
          className="relative z-10 shrink-0"
          style={{ height: cq(CARD.top), backgroundImage: `url(${CARD.src})`, backgroundSize: "100% auto", backgroundPosition: "top", backgroundRepeat: "no-repeat" }}
        />
        <div
          className="-my-px flex-1"
          style={{ backgroundImage: `url(${CARD.middle})`, backgroundSize: "100% auto", backgroundRepeat: "no-repeat round" }}
        />
        <div
          className="relative z-10 shrink-0"
          style={{ height: cq(CARD.h - CARD.bottomFrom), backgroundImage: `url(${CARD.src})`, backgroundSize: "100% auto", backgroundPosition: "bottom", backgroundRepeat: "no-repeat" }}
        />
      </div>

      <div
        className="relative z-20 flex flex-col"
        style={{
          // Always tall enough for the card's top and bottom plus one band of middle
          minHeight: `max(100dvh, ${cq(CARD.top + 70 + CARD.h - CARD.bottomFrom)})`,
          paddingTop: cq(DEITIES_BASE),
          paddingBottom: cq(CARD.h - PANEL_BOTTOM),
          color: INK,
        }}
      >
        {/* Centred in the free space between the deities and the rangoli */}
        <div className="flex flex-1 flex-col justify-center py-6">
          <div className="text-center font-serif" style={{ paddingInline: `calc(${cq(PANEL_EDGE)} + 28px)` }}>
            {lines.map((node, i) => (
              <div key={i} style={line(i)}>
                {node}
              </div>
            ))}
          </div>
        </div>

        {/* The way in: a rangoli in the clear space between the banana trees */}
        <div className="flex shrink-0 items-center justify-center" style={{ height: cq(PANEL_BOTTOM - RANGOLI_FROM) }}>
          <RangoliStart active={show} onOpen={onOpen} />
        </div>
      </div>
    </section>
  );
}

/** A small gold map pin with a lotus-bud head, above the place. */
function PinIcon() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" aria-hidden>
      <path d="M8 19.2C4.4 14.6 1.6 11.4 1.6 7.7a6.4 6.4 0 0 1 12.8 0c0 3.7-2.8 6.9-6.4 11.5Z" fill={GOLD} />
      <path d="M8 4.2c1.5 1.3 1.9 3 0 4.8-1.9-1.8-1.5-3.5 0-4.8Z" fill="#FFF6DF" />
    </svg>
  );
}

/** A thin gold rule with a small diamond at its centre. */
function Divider({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`mx-auto flex w-36 items-center gap-2 ${className}`}>
      <span className="h-px flex-1" style={{ background: `linear-gradient(to left, ${GOLD}, transparent)` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: GOLD }} />
      <span className="h-px flex-1" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
    </span>
  );
}
