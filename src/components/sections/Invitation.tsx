import { useRef, type RefObject } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { useScrollFade } from "@/hooks/useScrollFade";
import { formatVenueDate, parseVenueDateTime, type FormattedVenueDate } from "@/lib/venueTime";
import { DeityArt } from "@/components/art/DeityArt";
import { Button } from "@/components/ui/Button";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Pending } from "@/components/ui/Pending";
import { Reveal } from "@/components/ui/Reveal";

export type RevealState = "hidden" | "revealing" | "shown";

interface InvitationProps {
  /** Where the opening's deity lands. */
  deitySlotRef: RefObject<HTMLDivElement>;
  reveal: RevealState;
  /** Hidden while the opening's own copy of the deity is still in flight. */
  deityHidden: boolean;
  /** Guest has tapped "Open Invitation" — enables the hero parallax. */
  opened: boolean;
  onOpen: () => void;
}

/**
 * Section 02 — Main invitation (PRD §4.02).
 * Deity → Odia invocation → personalised greeting → names → date → venue →
 * "Open Invitation". Identity: a staggered rise on arrival, then a slow
 * parallax drift as the guest scrolls on.
 */
export function Invitation({ deitySlotRef, reveal, deityHidden, opened, onOpen }: InvitationProps) {
  const { guestName } = useGuest();
  const { couple, invitation } = wedding;
  const contentRef = useRef<HTMLDivElement>(null);
  useScrollFade(contentRef, opened);

  const show = reveal !== "hidden";
  const parts = parseVenueDateTime(wedding.wedding.dateTime);
  const date = parts && formatVenueDate(parts);

  return (
    <section id="invitation" aria-label="Wedding invitation" className="relative flex min-h-[100dvh] flex-col">
      <Reveal show={show} className="pointer-events-none absolute inset-0">
        <Frame />
      </Reveal>

      <div
        ref={contentRef}
        className="relative flex flex-1 flex-col items-center px-9 pb-[max(2.25rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] text-center will-change-transform short:pt-8"
      >
        <div
          ref={deitySlotRef}
          className="h-[6.5rem] w-[6.5rem] shrink-0 short:h-20 short:w-20"
          style={{ visibility: deityHidden ? "hidden" : "visible" }}
        >
          <DeityArt />
        </div>

        {invitation.invocation && (
          <Reveal show={show} order={1}>
            <p lang="or" className="odia mt-3 text-[0.95rem] text-sindoor short:mt-2">
              {invitation.invocation.odia}
            </p>
            <span className="sr-only">({invitation.invocation.english})</span>
          </Reveal>
        )}

        <div className="flex w-full flex-1 flex-col items-center justify-center py-6 short:py-3">
          <Reveal show={show} order={2}>
            <p className="font-display text-[1.45rem] italic leading-tight text-ink">
              {invitation.greeting.replace("{guest}", guestName)}
            </p>
          </Reveal>
          <Reveal show={show} order={3}>
            <p className="mx-auto mt-2.5 max-w-[17.5rem] text-[0.8125rem] leading-relaxed text-ink-soft">
              {invitation.message}
            </p>
          </Reveal>

          <Reveal show={show} order={4} className="mt-5 short:mt-3">
            <h1 className="flex flex-col items-center font-normal">
              <span className="font-script text-[3.5rem] leading-[1.1] text-sindoor short:text-[2.75rem]">
                {couple.bride.displayName}
              </span>
              <span className="-my-0.5 font-display text-2xl italic text-gold-deep">and</span>
              <span className="font-script text-[3.5rem] leading-[1.1] text-sindoor short:text-[2.75rem]">
                {couple.groom.displayName}
              </span>
            </h1>
          </Reveal>

          <Reveal show={show} order={5}>
            <GoldDivider className="my-6 short:my-3" />
          </Reveal>

          <Reveal show={show} order={6}>
            <WeddingDate date={date} iso={wedding.wedding.dateTime} />
          </Reveal>
          <Reveal show={show} order={7} className="mt-5 short:mt-3">
            <Venue />
          </Reveal>
        </div>

        <Reveal show={show} order={8}>
          <Button onClick={onOpen} aria-controls="couple" className="px-9">
            {invitation.ctaLabel}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3.5 5.5 7 9l3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

function WeddingDate({ date, iso }: { date: FormattedVenueDate | null; iso: string | null }) {
  const d = date ?? { weekday: "Weekday", day: "DD", month: "Month", year: "YYYY", time: "Time" };

  const block = (
    <div>
      <div aria-hidden className="flex items-center justify-center gap-3.5">
        <span className="w-[5.5rem] text-right text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ink-soft">
          {d.weekday}
        </span>
        <span className="h-10 w-px bg-gold/60" />
        <span className="min-w-[2.75rem] font-display text-[2.75rem] font-medium leading-none text-sindoor">
          {d.day}
        </span>
        <span className="h-10 w-px bg-gold/60" />
        <span className="w-[5.5rem] text-left text-[0.6875rem] font-medium uppercase leading-snug tracking-[0.16em] text-ink-soft">
          {d.month}
          <br />
          {d.year}
        </span>
      </div>
      {d.time && <p aria-hidden className="mt-2 text-xs tracking-wide text-ink-soft">{d.time}</p>}
    </div>
  );

  if (!date || !iso) return <Pending label="Wedding date awaiting confirmation">{block}</Pending>;

  return (
    <time dateTime={iso}>
      {block}
      <span className="sr-only">
        {d.weekday}, {d.day} {d.month} {d.year}
        {d.time ? ` at ${d.time}` : ""}
      </span>
    </time>
  );
}

function Venue() {
  const { name, city } = wedding.venue;
  if (!name) {
    return (
      <Pending label="Venue awaiting confirmation">
        <p className="font-display text-xl">Venue name</p>
        <p className="text-xs text-ink-soft">City</p>
      </Pending>
    );
  }
  return (
    <div>
      <p className="font-display text-xl font-medium leading-snug text-ink">{name}</p>
      {city && <p className="mt-0.5 text-xs tracking-wide text-ink-soft">{city}</p>}
    </div>
  );
}

/** Single gold hairline frame with small jhoti-inspired corner marks. */
function Frame() {
  const corners = [
    "left-[18px] top-[18px]",
    "right-[18px] top-[18px] rotate-90",
    "bottom-[18px] right-[18px] rotate-180",
    "bottom-[18px] left-[18px] -rotate-90",
  ];
  return (
    <>
      <div className="absolute inset-3 border border-gold/45" />
      {corners.map((pos) => (
        <svg key={pos} viewBox="0 0 24 24" className={`absolute h-6 w-6 text-gold ${pos}`} fill="none" aria-hidden>
          <path d="M2 15C2 7.8 7.8 2 15 2" stroke="currentColor" strokeWidth="0.9" />
          <path d="M6.5 15c0-4.7 3.8-8.5 8.5-8.5" stroke="currentColor" strokeWidth="0.7" opacity="0.6" />
          <circle cx="13.5" cy="13.5" r="1.4" fill="currentColor" />
          <circle cx="20" cy="5.5" r="0.9" fill="currentColor" />
          <circle cx="5.5" cy="20" r="0.9" fill="currentColor" />
        </svg>
      ))}
    </>
  );
}
