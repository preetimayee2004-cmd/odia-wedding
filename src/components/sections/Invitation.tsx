import { type CSSProperties, type ReactNode } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { EASE } from "@/lib/motion";
import { formatVenueDate, parseVenueDateTime } from "@/lib/venueTime";
import { RangoliStart } from "@/components/sections/RangoliStart";
import { Pending } from "@/components/ui/Pending";

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
const TREES_FROM = 870; // the bottom banana leaves begin here
const PANEL_EDGE = 62; // the dotted inner border, in from each side

const INK = "#4A2C1A";
const MAROON = "#8A1C2B";
const GOLD = "#B8863B";
const LINE_STAGGER = 150;
const LINE_DURATION = 800;

/**
 * Section 02 — The invitation card.
 * The words sit on the card's cream panel between the deities and the
 * banana trees, with an Odia jhoti rangoli beneath them as the way in:
 * tapped (or after a pause) it blooms into a golden wash that fades into the
 * Couple section.
 */
export function Invitation({ reveal, onOpen }: InvitationProps) {
  const { guestName } = useGuest();
  const { couple, invitation } = wedding;

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

  const lines: ReactNode[] = [
    <p key="h" className="mb-3.5 font-display text-[1.05rem] font-semibold tracking-[0.12em]" style={{ color: MAROON }}>
      {invitation.heading}
    </p>,
    <p key="g" className="mb-4 font-display text-[20px] italic leading-tight">
      {invitation.greeting.replace("{guest}", guestName)}
    </p>,
    <Divider key="d1" className="mb-4" />,
    <p key="m" className="font-display text-[15.5px] leading-[1.7]">
      {invitation.message}
    </p>,
    <h1 key="n" className="my-3 flex flex-wrap items-center justify-center gap-x-2.5 font-normal leading-[1.1]" style={{ color: MAROON }}>
      <span className="font-script text-[46px]">{couple.bride.displayName}</span>
      <span className="font-script text-[27.6px]" style={{ color: GOLD }}>
        &amp;
      </span>
      <span className="font-script text-[46px]">{couple.groom.displayName}</span>
    </h1>,
    <Divider key="d2" className="mb-5" />,
    <p key="b" className="font-display text-[15.5px] leading-[1.7]">
      {invitation.blessing}
    </p>,
    <div key="w" className="mt-5 text-[0.7rem] font-medium uppercase leading-relaxed tracking-[0.14em] opacity-80">
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
    </div>,
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
        className="relative z-20 flex flex-col"
        style={{
          // Always tall enough for the card's top and bottom plus one band of middle
          minHeight: `max(100dvh, ${cq(CARD.top + 70 + CARD.h - CARD.bottomFrom)})`,
          paddingTop: cq(DEITIES_BASE),
          paddingBottom: cq(CARD.h - TREES_FROM),
          color: INK,
        }}
      >
        {/* Centred in the free space between the deities and the banana trees */}
        <div className="my-auto py-5">
          <div className="text-center" style={{ paddingInline: `calc(${cq(PANEL_EDGE)} + 28px)` }}>
            {lines.map((node, i) => (
              <div key={i} style={line(i)}>
                {node}
              </div>
            ))}
          </div>

          {/* The way in: a jhoti rangoli above the banana trees */}
          <div className="mt-6 flex justify-center">
            <RangoliStart active={show} onOpen={onOpen} />
          </div>
        </div>
      </div>

    </section>
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
