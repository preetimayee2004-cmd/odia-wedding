import { useRef, type ReactNode } from "react";
import { wedding, type TravelPlace } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { directionsUrl } from "@/lib/maps";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Pending } from "@/components/ui/Pending";

type Kind = "airport" | "railway" | "bus" | "stay";

const BLOCKS: Array<{ kind: Kind; title: string }> = [
  { kind: "airport", title: "Nearest Airport" },
  { kind: "railway", title: "Nearest Railway Station" },
  { kind: "bus", title: "Nearest Bus Stand" },
  { kind: "stay", title: "Where to Stay" },
];

/**
 * Section 09 — Travel and stay (PRD §4.09).
 * Identity: each block comes into focus from a soft blur, one after another.
 */
export function Travel() {
  const { heading, ...places } = wedding.travel;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.15 });

  const visible = BLOCKS.filter((b) => import.meta.env.DEV || places[b.kind].name);
  if (visible.length === 0) return null;

  return (
    <section ref={ref} id="travel" aria-labelledby="travel-heading" className="section">
      <div className="text-center" style={{ opacity: inView ? 1 : 0, transition: `opacity 900ms ${EASE.silk}` }}>
        <h2 id="travel-heading" className="text-[2.25rem]">
          {heading}
        </h2>
        <GoldDivider className="mt-4" />
      </div>

      <ul className="mt-10 divide-y divide-gold/30 border-y border-gold/30">
        {visible.map((b, i) => (
          <li
            key={b.kind}
            className="py-6"
            style={{
              opacity: inView ? 1 : 0,
              filter: inView ? "blur(0)" : "blur(8px)",
              transition: `opacity 900ms ${EASE.silk} ${200 + i * 150}ms, filter 900ms ${EASE.silk} ${200 + i * 150}ms`,
            }}
          >
            <TravelBlock kind={b.kind} title={b.title} place={places[b.kind]} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function TravelBlock({ kind, title, place }: { kind: Kind; title: string; place: TravelPlace }) {
  const directions = directionsUrl({ mapsUrl: place.mapsUrl, name: place.name, address: place.location });

  const body = (
    <>
      <p className="font-medium text-ink">{place.name ?? "Name"}</p>
      {place.location && <p className="text-ink-soft">{place.location}</p>}
      {place.distance && <p className="mt-1 text-ink-soft">{place.distance}</p>}
      {place.info && <p className="mt-2">{place.info}</p>}
    </>
  );

  return (
    <div className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/60 text-sindoor">
        <TravelIcon kind={kind} />
      </span>
      <div className="min-w-0 flex-1 text-[0.875rem] leading-relaxed">
        <h3 className="text-[1.45rem]">{title}</h3>
        <div className="mt-1">
          {place.name ? (
            body
          ) : (
            <Pending label="Awaiting verified details">Name · location · verified distance</Pending>
          )}
        </div>

        {(directions || place.phone || place.bookingUrl) && (
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {directions && <TextLink href={directions}>Directions</TextLink>}
            {place.phone && <TextLink href={`tel:${place.phone.replace(/\s+/g, "")}`}>Call {place.phone}</TextLink>}
            {place.bookingUrl && <TextLink href={place.bookingUrl}>Book</TextLink>}
          </div>
        )}
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
      className="inline-flex min-h-11 items-center gap-1 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-sindoor underline decoration-gold/60 underline-offset-4"
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
