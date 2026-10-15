import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { wedding, type TravelPlace } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { showPlaceholders } from "@/lib/placeholders";
import { EASE } from "@/lib/motion";
import { directionsUrl } from "@/lib/maps";
import { KalashPin } from "@/components/art/Kalash";
import { MandapArt } from "@/components/art/MandapArt";
import { Button } from "@/components/ui/Button";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Pending } from "@/components/ui/Pending";
import { Sheet } from "@/components/ui/Sheet";

type Kind = "airport" | "railway" | "bus" | "stay";

const CARD = "rounded-2xl border border-gold/40 bg-white shadow-[0_10px_24px_-18px_rgb(var(--ink)/0.45)]";
const BLOCKS: Array<{ kind: Kind; title: string }> = [
  { kind: "airport", title: "Nearest Airport" },
  { kind: "railway", title: "Nearest Railway Station" },
  { kind: "bus", title: "Nearest Bus Stand" },
  { kind: "stay", title: "Where to Stay" },
];

/**
 * Section 10 — Venue, Travel & Stay (The Path to Purushottam Kshetra).
 * Clean off-white cards for guests travelling from across India: the venue,
 * then how to arrive and where to stay. Gold Kalash markers stand in for map
 * pins. A golden "Atithi Culture & Style Guide" button opens a pop-up on
 * wedding colours, Odisha's handlooms and places to visit.
 * Unconfirmed details stay hidden in production; the guide always shows.
 */
export function VenueTravel() {
  const { eyebrow, heading, ...places } = wedding.travel;
  const { button } = wedding.atithi;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.08 });
  const [guideOpen, setGuideOpen] = useState(false);

  const blocks = BLOCKS.filter((b) => showPlaceholders || places[b.kind].name);
  const fade = (delay: number) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(14px)",
    transition: `opacity 900ms ${EASE.silk} ${delay}ms, transform 1000ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section ref={ref} id="venue" aria-labelledby="venue-heading" className="px-[var(--gutter)] py-[var(--section-y)]" style={{ backgroundColor: "rgb(var(--page))" }}>
      <div className="text-center" style={fade(0)}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="venue-heading" className="mt-2 text-[2.1rem] leading-tight">
          {heading}
        </h2>
        <GoldDivider className="mt-4" />
      </div>

      <div className="mx-auto mt-10 max-w-[30rem] space-y-4">
        <VenueCard style={fade(150)} />

        {blocks.length > 0 && (
          <ul id="travel" className="space-y-4">
            {blocks.map((b, i) => (
              <li key={b.kind} className={`${CARD} p-5`} style={fade(300 + i * 120)}>
                <TravelBlock kind={b.kind} title={b.title} place={places[b.kind]} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10 text-center" style={fade(500)}>
        <Button variant="gold" onClick={() => setGuideOpen(true)} aria-haspopup="dialog" className="min-h-14 px-8 text-[0.95rem]">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="currentColor">
            <path d="M9 1.5 10.6 7.4 16.5 9l-5.9 1.6L9 16.5 7.4 10.6 1.5 9l5.9-1.6Z" />
          </svg>
          {button}
        </Button>
      </div>

      <Sheet open={guideOpen} onClose={() => setGuideOpen(false)} label={button}>
        <AtithiGuide />
      </Sheet>
    </section>
  );
}

function VenueCard({ style }: { style: CSSProperties }) {
  const { name, city, address, mapsUrl, description, image } = wedding.venue;
  const directions = directionsUrl({ mapsUrl, name, address });
  if (!showPlaceholders && !name && !address) return null;

  return (
    <article className={`${CARD} overflow-hidden`} style={style} aria-label="The venue">
      <div className="relative bg-cream-light">
        {image ? (
          <img src={image.src} alt={image.alt} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center px-10">
            <MandapArt className="h-auto w-full max-w-[16rem]" />
          </div>
        )}
        <KalashPin className="absolute left-1/2 top-3 h-14 w-auto -translate-x-1/2 drop-shadow-[0_4px_4px_rgb(0_0_0/0.25)]" />
      </div>

      <div className="px-5 pb-6 pt-5 text-center">
        <p className="text-[0.625rem] font-medium uppercase tracking-[0.18em] text-ink-soft">The Venue</p>
        {name ? (
          <h3 className="mt-1 text-[1.75rem] leading-tight">{name}</h3>
        ) : (
          <div className="mt-2 flex justify-center">
            <Pending label="Venue name awaiting confirmation">
              <p className="font-display text-[1.6rem] text-sindoor">Venue name</p>
            </Pending>
          </div>
        )}

        <div className="mx-auto mt-2 max-w-[18rem] text-[0.875rem] leading-relaxed text-ink-soft">
          {address ? (
            <address className="not-italic">{address}</address>
          ) : (
            <Pending label="Address awaiting confirmation">Full address{city ? `, ${city}` : ""}</Pending>
          )}
        </div>

        {description && <p className="mx-auto mt-3 max-w-[19rem] text-[0.875rem] leading-relaxed">{description}</p>}

        {directions ? (
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sindoor px-7 text-sm font-medium tracking-wide text-cream-light shadow-[0_8px_20px_-10px_rgb(var(--sindoor)/0.7)] transition duration-200 ease-silk active:scale-[0.98] active:bg-sindoor-dark"
          >
            <KalashPin className="h-5 w-auto" />
            Get Directions
            <span className="sr-only">(opens maps in a new tab)</span>
          </a>
        ) : (
          <div className="mt-6 flex justify-center">
            <Pending label="Directions need a confirmed address">Get Directions</Pending>
          </div>
        )}
      </div>
    </article>
  );
}

function TravelBlock({ kind, title, place }: { kind: Kind; title: string; place: TravelPlace }) {
  const directions = directionsUrl({ mapsUrl: place.mapsUrl, name: place.name, address: place.location });

  return (
    <div className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/60 bg-cream-light text-gold-deep">
        <TravelIcon kind={kind} />
      </span>
      <div className="min-w-0 flex-1 text-[0.875rem] leading-relaxed">
        <h3 className="text-[1.35rem]">{title}</h3>
        <div className="mt-1">
          {place.name ? (
            <>
              <p className="font-medium text-ink">{place.name}</p>
              {place.location && <p className="text-ink-soft">{place.location}</p>}
              {place.distance && <p className="mt-1 text-ink-soft">{place.distance}</p>}
              {place.info && <p className="mt-2">{place.info}</p>}
            </>
          ) : (
            <Pending label="Awaiting verified details">Name · location · verified distance</Pending>
          )}
        </div>

        {(directions || place.phone || place.bookingUrl) && (
          <div className="mt-2 flex flex-wrap gap-x-5">
            {directions && (
              <TextLink href={directions}>
                <KalashPin className="h-4 w-auto" />
                Directions
              </TextLink>
            )}
            {place.phone && <TextLink href={`tel:${place.phone.replace(/\s+/g, "")}`}>Call {place.phone}</TextLink>}
            {place.bookingUrl && <TextLink href={place.bookingUrl}>Book</TextLink>}
          </div>
        )}
      </div>
    </div>
  );
}

/** The pop-up: colours to wear, Odisha's handlooms, and places to see. */
function AtithiGuide() {
  const { button, intro, sections } = wedding.atithi;
  return (
    <div>
      <div className="text-center">
        <KalashPin className="mx-auto h-12 w-auto" />
        <h3 className="mt-2 text-[1.8rem] leading-tight">{button}</h3>
        <p className="mx-auto mt-2 max-w-[20rem] text-[0.875rem] leading-relaxed text-ink-soft">{intro}</p>
        <GoldDivider className="mt-4" />
      </div>

      <div className="mt-6 space-y-7">
        {sections.map((s) => (
          <section key={s.title} aria-label={s.title}>
            <h4 className="text-[1.35rem]">{s.title}</h4>
            <p className="mt-1 text-[0.875rem] leading-relaxed">{s.text}</p>
            {s.items.length > 0 && (
              <ul className="mt-3 space-y-2.5">
                {s.items.map((item) => (
                  <li key={item.name} className="rounded-xl border border-gold/35 bg-cream-light px-4 py-3 text-[0.8125rem] leading-relaxed">
                    <span className="block font-display text-[1.1rem] font-semibold leading-snug text-sindoor">{item.name}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex min-h-11 items-center gap-1.5 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-sindoor underline decoration-gold/60 underline-offset-4"
    >
      {children}
    </a>
  );
}

function TravelIcon({ kind }: { kind: Kind }) {
  const paths: Record<Kind, ReactNode> = {
    airport: <path d="M2.5 13.5 21 7.5c1-.3 1.7.9.9 1.5L8.5 19l-3-.5L9 14.5l-4 1.2-1.5-1.5Zm7-4L7 6l2-.5 5.5 2.4" />,
    railway: (
      <>
        <rect x="6" y="3" width="12" height="14" rx="3" />
        <path d="M6 11h12M9.5 14h.01M14.5 14h.01M8 21l2-4M16 21l-2-4M9 3V1.5h6V3" />
      </>
    ),
    bus: (
      <>
        <rect x="4.5" y="3" width="15" height="15" rx="2.5" />
        <path d="M4.5 11h15M8 15h.01M16 15h.01M7 18v2.5M17 18v2.5M8 6h8" />
      </>
    ),
    stay: <path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6M7 11.5a1.8 1.8 0 1 0 0-.01" />,
  };
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[kind]}
    </svg>
  );
}
