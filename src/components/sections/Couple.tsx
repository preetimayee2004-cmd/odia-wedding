import { useRef, type CSSProperties, type ReactNode } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { formatVenueDate, parseVenueDateTime } from "@/lib/venueTime";
import { EASE } from "@/lib/motion";
import { CoupleArt } from "@/components/art/CoupleArt";
import { Pending } from "@/components/ui/Pending";

// Entrance choreography (ms from the section entering view).
const T = {
  art: 0, // illustration: fade + gentle rise
  bride: 550, // names: written on, left to right
  and: 1150,
  groom: 1300,
  details: 2100, // small text: fade only, never moves
};

/**
 * Section 03 — Couple introduction (PRD §4.03).
 * Identity: the illustration rises in an arched frame, then the names are
 * "handwritten" on with a left-to-right reveal.
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
      <Fade show={inView} delay={T.art}>
        <p className="eyebrow">The Couple</p>
      </Fade>

      <figure
        className="relative isolate mt-6 w-[14.5rem] short:w-[12.5rem]"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "translateY(28px)",
          transition: `opacity 1100ms ${EASE.silk} ${T.art}ms, transform 1300ms ${EASE.silk} ${T.art}ms`,
        }}
      >
        <div
          aria-hidden
          className="absolute -inset-10 -z-10 rounded-full"
          style={{ background: "radial-gradient(circle, rgb(var(--gold) / 0.16) 0%, transparent 65%)" }}
        />
        {/* Arched frame — outer gold hairline, inner cream panel */}
        <div className="rounded-t-full border border-gold/60 p-1.5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full border border-gold/30 bg-cream-light">
            <CoupleArt imgClassName="h-full w-full object-cover" fallbackClassName="absolute inset-x-4 bottom-[13%] h-auto" />
          </div>
        </div>
      </figure>

      <h2 id="couple-heading" className="mt-7 flex flex-col items-center font-normal short:mt-5">
        <Handwritten show={inView} delay={T.bride}>
          {bride.displayName}
        </Handwritten>
        <Fade show={inView} delay={T.and}>
          <span className="my-1 flex items-center gap-3 font-sans text-[0.625rem] font-medium uppercase tracking-eyebrow text-ink-soft">
            <span aria-hidden className="h-px w-8 bg-gold/70" />
            and
            <span aria-hidden className="h-px w-8 bg-gold/70" />
          </span>
        </Fade>
        <Handwritten show={inView} delay={T.groom}>
          {groom.displayName}
        </Handwritten>
      </h2>

      <Fade show={inView} delay={T.details} className="mt-6">
        <WhenAndWhere />
      </Fade>
      <Fade show={inView} delay={T.details + 150}>
        <p className="mx-auto mt-5 max-w-[17rem] text-[0.8125rem] leading-relaxed text-ink-soft">{message}</p>
      </Fade>
    </section>
  );
}

/** Script name revealed left → right, like ink being written. */
function Handwritten({ show, delay, children }: { show: boolean; delay: number; children: ReactNode }) {
  const style: CSSProperties = {
    // Negative insets leave room for the script's swashes once revealed.
    clipPath: show ? "inset(-30% -12% -30% -12%)" : "inset(-30% 100% -30% -12%)",
    transition: `clip-path 1200ms cubic-bezier(0.45, 0, 0.25, 1) ${delay}ms`,
  };
  return (
    <span className="block px-3 font-script text-[3.25rem] leading-[1.15] text-sindoor short:text-[2.75rem]" style={style}>
      {children}
    </span>
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
