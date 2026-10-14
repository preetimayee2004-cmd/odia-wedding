import { useRef, type CSSProperties, type ReactNode } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { useScrollFade } from "@/hooks/useScrollFade";
import { EASE } from "@/lib/motion";
import { formatVenueDate, parseVenueDateTime } from "@/lib/venueTime";
import { PattachitraBorder } from "@/components/art/Pattachitra";
import { Button } from "@/components/ui/Button";
import { Pending } from "@/components/ui/Pending";

export type RevealState = "hidden" | "revealing" | "shown";

interface InvitationProps {
  reveal: RevealState;
  /** Guest has tapped "Open Invitation" — enables the hero parallax. */
  opened: boolean;
  onOpen: () => void;
}

// Binding holes near each end of every leaf; the cord threads through them.
const HOLES = ["left-[8%]", "left-[92%]"] as const;

// Unrolling choreography (ms)
const LEAF_STAGGER = 230;
const LEAF_DURATION = 900;

/**
 * Section 02 — The Royal Scroll.
 * The invitation as a Talapatra (palm-leaf manuscript): leaves bound by a
 * sindoor cord, the words etched into them, unrolling one by one between
 * crisp black-and-white Pattachitra borders.
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

  const leaves: ReactNode[] = [
    <p key="h" className="font-display text-[1.2rem] font-semibold tracking-[0.12em] text-[#7A1F24]">
      {invitation.heading}
    </p>,
    <div key="g">
      <p className="font-display text-[1.25rem] italic leading-tight">{invitation.greeting.replace("{guest}", guestName)}</p>
      <p className="mt-1.5 font-display text-[1.02rem] leading-snug">{invitation.message}</p>
    </div>,
    <h1 key="n" className="flex flex-col items-center font-normal leading-none text-[#7A1F24]">
      <span className="font-script text-[2.6rem] leading-[1.15] short:text-[2.2rem]">{couple.bride.displayName}</span>
      <span className="my-0.5 font-display text-base italic text-[#5C3A1C]">and</span>
      <span className="font-script text-[2.6rem] leading-[1.15] short:text-[2.2rem]">{couple.groom.displayName}</span>
    </h1>,
    <p key="b" className="font-display text-[1.02rem] leading-snug">
      {invitation.blessing}
    </p>,
    <div key="d" className="text-[0.75rem] font-medium uppercase tracking-[0.16em]">
      {date ? (
        <time dateTime={wedding.wedding.dateTime!} className="block">
          {date.weekday} · {date.day} {date.month} {date.year}
          {date.time && ` · ${date.time}`}
        </time>
      ) : (
        <Pending label="Wedding date awaiting confirmation">Weekday · Day Month Year · Time</Pending>
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
    <section id="invitation" aria-label="Wedding invitation" className="relative flex min-h-[100dvh] flex-col">
      <PattachitraBorder className="absolute bottom-0 left-0 top-0" />
      <PattachitraBorder flip className="absolute bottom-0 right-0 top-0" />

      <div
        ref={contentRef}
        className="relative flex flex-1 flex-col items-center justify-center px-[38px] pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[calc(max(1.75rem,env(safe-area-inset-top))_+_var(--status-bar,0px))] text-center will-change-transform"
      >
        <div className="relative w-full max-w-[22rem]">
          {/* The binding cord, threaded down through every leaf's holes */}
          {HOLES.map((x) => (
            <span
              key={x}
              aria-hidden
              className={`absolute bottom-6 top-6 w-[2px] -translate-x-1/2 origin-top rounded-full bg-[#7A1F24] ${x}`}
              style={{
                transform: show ? "scaleY(1)" : "scaleY(0)",
                transition: `transform ${leaves.length * LEAF_STAGGER + LEAF_DURATION}ms ${EASE.silk}`,
              }}
            />
          ))}

          <div className="relative flex flex-col gap-2.5 short:gap-1.5">
            {leaves.map((content, i) => (
              <Leaf key={i} show={show} order={i}>
                {content}
              </Leaf>
            ))}
          </div>
        </div>

        <div
          className="mt-6 short:mt-4"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? "none" : "translateY(10px)",
            transition: `opacity 700ms ${EASE.silk} ${leaves.length * LEAF_STAGGER + 300}ms, transform 700ms ${EASE.silk} ${leaves.length * LEAF_STAGGER + 300}ms`,
          }}
        >
          <Button onClick={onOpen} aria-controls="couple" className="px-9">
            {invitation.ctaLabel}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3.5 5.5 7 9l3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
}

/** One palm leaf: straw-coloured, fibre-lined, with two binding holes; unrolls from its centre. */
function Leaf({ show, order, children }: { show: boolean; order: number; children: ReactNode }) {
  const delay = order * LEAF_STAGGER;
  const style: CSSProperties = {
    clipPath: show ? "inset(0 0 0 0 round 18px)" : "inset(0 50% 0 50% round 18px)",
    transform: show ? "none" : "scaleY(0.86)",
    transition: `clip-path ${LEAF_DURATION}ms ${EASE.temple} ${delay}ms, transform ${LEAF_DURATION}ms ${EASE.silk} ${delay}ms`,
    background: [
      // fine horizontal fibres of the dried palm leaf
      "repeating-linear-gradient(180deg, rgb(110 70 25 / 0.07) 0 1px, transparent 1px 5px)",
      "linear-gradient(180deg, #F2DFAE 0%, #E7CB8E 52%, #DCBA77 100%)",
    ].join(","),
    boxShadow: "inset 0 0 0 1px rgb(110 70 25 / 0.35), inset 0 0 18px rgb(120 75 25 / 0.22), 0 6px 14px -10px rgb(60 35 10 / 0.6)",
    textShadow: "0 1px 0 rgb(255 245 220 / 0.55)", // etched into the leaf
  };
  return (
    <div className="relative rounded-[18px] px-[13%] py-3 text-[#3B2414] short:py-2" style={style}>
      {HOLES.map((x) => (
        <span
          key={x}
          aria-hidden
          className={`absolute top-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#5B3A1E]/70 bg-[#7A1F24] ${x}`}
        />
      ))}
      {children}
    </div>
  );
}
