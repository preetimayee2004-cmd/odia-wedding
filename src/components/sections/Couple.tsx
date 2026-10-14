import { useRef, type ComponentType, type ReactNode } from "react";
import { wedding, type Person } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { formatVenueDate, parseVenueDateTime } from "@/lib/venueTime";
import { EASE } from "@/lib/motion";
import { BrideMukuta, FiligreeCorner, FiligreeKnot, GroomTopi, PortraitSilhouette } from "@/components/art/Crowns";
import { Pending } from "@/components/ui/Pending";

// Entrance choreography (ms from the section entering view).
const T = {
  cards: 0, // portrait cards rise into place
  crowns: 650, // both crowns drop at the same moment
  names: 1300,
  details: 1700, // small text: fade only, never moves
};

// A gentle settle with the slightest overshoot — a crown being placed, not bouncing.
const PLACE = "cubic-bezier(0.34, 1.25, 0.64, 1)";

/**
 * Section 03 — The Crowned Royals.
 * Two portrait cards framed in Tarakasi silver filigree; on scroll a white
 * Odia mukuta drops into place above the bride's frame and the groom's crown
 * (topi) anchors above his.
 */
export function Couple() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const { bride, groom, message } = wedding.couple;

  return (
    <section
      ref={ref}
      id="couple"
      aria-labelledby="couple-heading"
      className="section flex min-h-[100dvh] flex-col items-center justify-center pt-16 text-center short:pt-12"
    >
      <Fade show={inView} delay={T.cards}>
        <p className="eyebrow">The Couple</p>
      </Fade>
      <h2 id="couple-heading" className="sr-only">
        {bride.displayName} and {groom.displayName}
      </h2>

      <div className="mt-6 grid w-full grid-cols-2 gap-4">
        <CoupleCard person={bride} role="The Bride" Crown={BrideMukuta} show={inView} />
        <CoupleCard person={groom} role="The Groom" Crown={GroomTopi} show={inView} />
      </div>

      <Fade show={inView} delay={T.details} className="mt-8">
        <WhenAndWhere />
      </Fade>
      <Fade show={inView} delay={T.details + 150}>
        <p className="mx-auto mt-5 max-w-[17rem] text-[0.8125rem] leading-relaxed text-ink-soft">{message}</p>
      </Fade>
    </section>
  );
}

function CoupleCard({
  person,
  role,
  Crown,
  show,
}: {
  person: Person;
  role: string;
  Crown: ComponentType<{ className?: string }>;
  show: boolean;
}) {
  return (
    <figure className="flex flex-col items-center">
      {/* The crown drops in and settles on top of the frame */}
      <div
        className="relative z-10 -mb-4 w-[74%]"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "none" : "translateY(-72px) rotate(-7deg)",
          transition: `opacity 500ms ${EASE.silk} ${T.crowns}ms, transform 1100ms ${PLACE} ${T.crowns}ms`,
        }}
      >
        <Crown className="h-auto w-full drop-shadow-[0_6px_6px_rgb(60_40_15_/_0.25)]" />
      </div>

      {/* Portrait in a Tarakasi (silver filigree) frame */}
      <div
        className="relative aspect-[3/4] w-full"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "none" : "translateY(18px)",
          transition: `opacity 800ms ${EASE.silk} ${T.cards}ms, transform 900ms ${EASE.silk} ${T.cards}ms`,
        }}
      >
        <span aria-hidden className="absolute inset-0 rounded-[12px] border-[1.5px] border-[#8E959E] shadow-[inset_0_0_0_1px_rgb(238_241_244_/_0.7)]" />
        <span aria-hidden className="absolute inset-[5px] rounded-[9px] border border-[#B9C0C8]" />
        <div className="absolute inset-[9px] overflow-hidden rounded-[6px] bg-cream-light">
          {person.photo ? (
            <img src={person.photo.src} alt={person.photo.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          ) : (
            <PortraitSilhouette className="h-full w-full" />
          )}
        </div>
        <FiligreeCorner className="absolute -left-1 -top-1 h-8 w-8" />
        <FiligreeCorner className="absolute -right-1 -top-1 h-8 w-8 rotate-90" />
        <FiligreeCorner className="absolute -bottom-1 -right-1 h-8 w-8 rotate-180" />
        <FiligreeCorner className="absolute -bottom-1 -left-1 h-8 w-8 -rotate-90" />
        <FiligreeKnot className="absolute -bottom-[7px] left-1/2 h-3 w-6 -translate-x-1/2 rotate-180" />
      </div>

      <Fade show={show} delay={T.names} className="mt-3">
        <figcaption>
          <span className="eyebrow block">{role}</span>
          <span className="mt-0.5 block font-script text-[2rem] leading-tight text-sindoor">{person.displayName}</span>
        </figcaption>
      </Fade>
    </figure>
  );
}

/** Small text only fades — it never moves, so it's easy to read. */
function Fade({
  show,
  delay,
  className = "",
  children,
}: {
  show: boolean;
  delay: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className} style={{ opacity: show ? 1 : 0, transition: `opacity 900ms ${EASE.silk} ${delay}ms` }}>
      {children}
    </div>
  );
}

function WhenAndWhere() {
  const parts = parseVenueDateTime(wedding.wedding.dateTime);
  const date = parts && formatVenueDate(parts);
  const { name, city } = wedding.venue;

  const dateLine = date ? (
    <time dateTime={wedding.wedding.dateTime!} className="block">
      {date.day} {date.month} {date.year}
    </time>
  ) : (
    <Pending label="Wedding date awaiting confirmation">Day Month Year</Pending>
  );

  const venueLine = name ? (
    <span className="block">{[name, city].filter(Boolean).join(", ")}</span>
  ) : (
    <Pending label="Venue awaiting confirmation">Venue, City</Pending>
  );

  return (
    <div className="flex flex-col items-center gap-1.5 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-ink">
      {dateLine}
      <span aria-hidden className="h-1 w-1 rotate-45 bg-gold" />
      <span className="text-ink-soft">{venueLine}</span>
    </div>
  );
}
