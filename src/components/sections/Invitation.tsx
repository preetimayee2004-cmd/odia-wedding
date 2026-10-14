import { useRef, type CSSProperties, type ReactNode } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { useScrollFade } from "@/hooks/useScrollFade";
import { EASE } from "@/lib/motion";
import { formatVenueDate, parseVenueDateTime } from "@/lib/venueTime";
import { Button } from "@/components/ui/Button";
import { Pending } from "@/components/ui/Pending";

export type RevealState = "hidden" | "revealing" | "shown";

interface InvitationProps {
  reveal: RevealState;
  /** Guest has tapped "Open Invitation" — enables the hero parallax. */
  opened: boolean;
  onOpen: () => void;
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

const INK = "#3B2414";
const SINDOOR = "#7A1F24";
const LINE_STAGGER = 150;
const LINE_DURATION = 800;

/**
 * Section 02 — The invitation card.
 * The words sit on the card's cream panel: the main lines below the deities,
 * the date and "Open Invitation" in the clear space between the banana trees.
 * Lines rise in one by one as the opening curtain lifts.
 */
export function Invitation({ reveal, opened, onOpen }: InvitationProps) {
  const { guestName } = useGuest();
  const { couple, invitation } = wedding;
  const contentRef = useRef<HTMLDivElement>(null);
  useScrollFade(contentRef, opened);

  const show = reveal !== "hidden";
  const parts = parseVenueDateTime(wedding.wedding.dateTime);
  const date = parts && formatVenueDate(parts);
  const { name: venueName, city } = wedding.venue;

  const line = (order: number): CSSProperties => {
    const delay = 250 + order * LINE_STAGGER;
    return {
      opacity: show ? 1 : 0,
      transform: show ? "none" : "translateY(10px)",
      transition: `opacity ${LINE_DURATION}ms ${EASE.silk} ${delay}ms, transform ${LINE_DURATION}ms ${EASE.silk} ${delay}ms`,
    };
  };

  const upper: ReactNode[] = [
    <p key="h" className="font-display text-[1.15rem] font-semibold tracking-[0.12em]" style={{ color: SINDOOR }}>
      {invitation.heading}
    </p>,
    <p key="g" className="font-display text-[1.2rem] italic leading-tight">
      {invitation.greeting.replace("{guest}", guestName)}
    </p>,
    <p key="m" className="font-display text-[1rem] leading-snug">
      {invitation.message}
    </p>,
    <h1 key="n" className="flex flex-wrap items-baseline justify-center gap-x-2 font-normal leading-none" style={{ color: SINDOOR }}>
      <span className="font-script text-[2.5rem] leading-[1.2] short:text-[2.2rem]">{couple.bride.displayName}</span>
      <span className="font-display text-lg italic text-[#8C6D3A]">&amp;</span>
      <span className="font-script text-[2.5rem] leading-[1.2] short:text-[2.2rem]">{couple.groom.displayName}</span>
    </h1>,
    <p key="b" className="font-display text-[1rem] leading-snug">
      {invitation.blessing}
    </p>,
  ];

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
        ref={contentRef}
        className="relative z-20 flex flex-col items-center text-center will-change-transform"
        style={{
          // Always tall enough for the card's top and bottom plus one band of middle
          minHeight: `max(100dvh, ${cq(CARD.top + 70 + CARD.h - CARD.bottomFrom)})`,
          // Below the deities (their base sits ~490px down the card)
          paddingTop: cq(505),
          // Clear of the bottom border band
          paddingBottom: cq(95),
          paddingInline: cq(80),
          color: INK,
        }}
      >
        <div className="flex w-full max-w-[19rem] flex-col gap-2.5 short:gap-1.5">
          {upper.map((node, i) => (
            <div key={i} style={line(i)}>
              {node}
            </div>
          ))}
        </div>

        {/* Between the banana trees: the date, venue and the way in */}
        <div
          className="mt-auto flex flex-col items-center justify-end gap-4 pt-4"
          style={{ minHeight: cq(CARD.h - 870 - 95), maxWidth: cq(370) }}
        >
          <div className="text-[0.7rem] font-medium uppercase leading-relaxed tracking-[0.14em]" style={line(upper.length)}>
            {date ? (
              <time dateTime={wedding.wedding.dateTime!} className="block">
                {date.weekday} · {date.day} {date.month} {date.year}
                {date.time && ` · ${date.time}`}
              </time>
            ) : (
              <Pending label="Wedding date awaiting confirmation">Weekday · Day Month Year</Pending>
            )}
            <span className="mt-1 block">
              {venueName ? (
                [venueName, city].filter(Boolean).join(", ")
              ) : (
                <Pending label="Venue awaiting confirmation">Venue, City</Pending>
              )}
            </span>
          </div>

          <div style={line(upper.length + 1)}>
            <Button onClick={onOpen} aria-controls="couple" className="px-6">
              {invitation.ctaLabel}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3.5 5.5 7 9l3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
