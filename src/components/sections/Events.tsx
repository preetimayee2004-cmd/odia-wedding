import { useRef, useState, type ReactNode } from "react";
import { wedding, type WeddingEvent } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { directionsUrl } from "@/lib/maps";
import { formatTimeRange, formatVenueDate, parseVenueDateTime } from "@/lib/venueTime";
import { EventMotifIcon } from "@/components/art/EventMotifs";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Pending } from "@/components/ui/Pending";
import { Sheet } from "@/components/ui/Sheet";

const dateOf = (e: WeddingEvent) => {
  const p = parseVenueDateTime(e.date);
  return p && formatVenueDate(p);
};

/**
 * Section 07 — Wedding events (PRD §4.07).
 * Identity: cards are "dealt" onto the table with a slight 3D tilt; every
 * card opens the same bottom-sheet pattern with that event's details.
 */
export function Events() {
  const { heading, odiaHeading, items } = wedding.events;
  const gridRef = useRef<HTMLUListElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { threshold: 0.15 });
  const headerIn = useInView(headerRef);
  const [active, setActive] = useState<WeddingEvent | null>(null);

  return (
    <section id="events" aria-labelledby="events-heading" className="section">
      <div
        ref={headerRef}
        className="text-center"
        style={{ opacity: headerIn ? 1 : 0, transition: `opacity 900ms ${EASE.silk}` }}
      >
        {odiaHeading && (
          <p lang="or" className="odia text-base text-sindoor/85">
            {odiaHeading}
          </p>
        )}
        <h2 id="events-heading" className="mt-1 text-[2.25rem]">
          {heading}
        </h2>
        <GoldDivider className="mt-4" />
      </div>

      <ul ref={gridRef} className="mt-10 grid grid-cols-2 gap-3 [perspective:900px] md:grid-cols-3">
        {items.map((event, i) => (
          <li
            key={event.id}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "rotateX(-38deg) translateY(26px)",
              transformOrigin: "50% 0%",
              transition: `opacity 700ms ${EASE.silk} ${i * 70}ms, transform 900ms ${EASE.silk} ${i * 70}ms`,
            }}
          >
            <EventCard event={event} onOpen={() => setActive(event)} />
          </li>
        ))}
      </ul>

      <Sheet open={active !== null} onClose={() => setActive(null)} label={active ? `${active.name} details` : "Event details"}>
        {active && <EventDetails event={active} />}
      </Sheet>
    </section>
  );
}

function EventCard({ event, onOpen }: { event: WeddingEvent; onOpen: () => void }) {
  const date = dateOf(event);
  const time = formatTimeRange(event.start, event.end);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="relative flex h-full w-full flex-col items-start rounded-[0.9rem] border border-gold/45 bg-cream-light p-4 text-left transition duration-200 ease-silk active:scale-[0.98]"
    >
      <span aria-hidden className="pointer-events-none absolute inset-1 rounded-[0.65rem] border border-gold/15" />
      <EventMotifIcon motif={event.motif} className="h-9 w-9" />

      {event.odiaName && (
        <span lang="or" className="odia mt-3 text-[0.75rem] leading-snug text-sindoor/80">
          {event.odiaName}
        </span>
      )}
      <span className={`font-display text-[1.3rem] font-semibold leading-tight text-sindoor ${event.odiaName ? "" : "mt-3"}`}>
        {event.name}
      </span>

      <span className="mt-2 text-[0.6875rem] leading-relaxed text-ink-soft">
        {date ? (
          <>
            {date.weekday.slice(0, 3)}, {date.day} {date.month.slice(0, 3)}
            {time && <span className="block">{time.split(" – ")[0]}</span>}
          </>
        ) : (
          <Pending label="Date awaiting confirmation">Date · Time</Pending>
        )}
      </span>

      <span className="mt-auto inline-flex items-center gap-1 pt-3 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-sindoor">
        View details
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M3.5 2 6.5 5l-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
}

function EventDetails({ event }: { event: WeddingEvent }) {
  const date = dateOf(event);
  const time = formatTimeRange(event.start, event.end);
  const directions = directionsUrl({ mapsUrl: event.mapsUrl, name: event.venueName, address: event.address });
  const venue = [event.venueName, event.address].filter(Boolean);

  const rows: Array<[label: string, value: ReactNode | null]> = [
    ["Date", date && `${date.weekday}, ${date.day} ${date.month} ${date.year}`],
    ["Time", time],
    [
      "Venue",
      venue.length > 0 && (
        <>
          {event.venueName && <span className="block font-medium">{event.venueName}</span>}
          {event.address && <span className="block text-ink-soft">{event.address}</span>}
        </>
      ),
    ],
    ["Dress code", event.dressCode],
    ["About", event.description],
  ];
  const known = rows.filter(([, v]) => v);
  const unknown = rows.filter(([, v]) => !v);

  return (
    <div className="text-center">
      <EventMotifIcon motif={event.motif} className="mx-auto h-12 w-12" />
      {event.odiaName && (
        <p lang="or" className="odia mt-2 text-sm text-sindoor/80">
          {event.odiaName}
        </p>
      )}
      <h3 className="text-[2rem]">{event.name}</h3>
      <GoldDivider className="mt-3" />

      <dl className="mt-6 space-y-4 text-left text-[0.875rem]">
        {known.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[5.5rem_1fr] gap-3">
            <dt className="pt-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-soft">{label}</dt>
            <dd className="leading-relaxed">{value}</dd>
          </div>
        ))}
      </dl>

      {import.meta.env.DEV && unknown.length > 0 && (
        <div className="mt-4 space-y-2 text-left text-[0.6875rem] font-medium uppercase tracking-[0.14em]">
          {unknown.map(([label]) => (
            <Pending key={label} label={`${label} awaiting confirmation`}>
              {label}: awaiting confirmation
            </Pending>
          ))}
        </div>
      )}

      {known.length === 0 && !import.meta.env.DEV && (
        <p className="mt-2 text-sm text-ink-soft">Details will be shared soon.</p>
      )}

      {directions && (
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sindoor px-7 text-sm font-medium tracking-wide text-cream-light active:bg-sindoor-dark"
        >
          Get Directions
        </a>
      )}
    </div>
  );
}
