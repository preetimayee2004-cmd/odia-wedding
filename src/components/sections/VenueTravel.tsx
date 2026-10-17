import { useRef, useState, type ReactNode } from "react";
import { wedding, type TravelPlace } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { showPlaceholders } from "@/lib/placeholders";
import { EASE } from "@/lib/motion";
import { directionsUrl } from "@/lib/maps";
import { KalashPin } from "@/components/art/Kalash";
import { Button } from "@/components/ui/Button";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Pending } from "@/components/ui/Pending";
import { Sheet } from "@/components/ui/Sheet";

type Kind = "airport" | "railway" | "bus" | "stay";

const ART = "/art/venue";
const ROUTE = "#8C2A20"; // the dashed route and its icons
const TRAVEL: Array<{ kind: Exclude<Kind, "stay">; title: string }> = [
  { kind: "airport", title: "Nearest Airport" },
  { kind: "railway", title: "Nearest Railway Station" },
  { kind: "bus", title: "Nearest Bus Stand" },
];

/**
 * Section 10 — Venue, Travel & Stay, after the couple's route-map design.
 * Between the side bands on the flowered cream, paintings from the design
 * alternate left and right — the Jagannath temple with Lord Jagannath, the
 * beach at Puri, a seaside hotel — joined by a dashed route with a pin, a
 * plane, a bus and a car. Beside them, free of frames under small lotus
 * lines: the venue, how to reach (airport, railway, bus) and where to stay.
 * A golden "Atithi Culture & Style Guide" button opens a pop-up on wedding
 * colours, Odisha's handlooms and places to visit. Unconfirmed details stay
 * hidden in production; the paintings and the guide always show.
 */
export function VenueTravel() {
  const { eyebrow, heading, stay, ...places } = wedding.travel;
  const { button } = wedding.atithi;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.05 });
  const [guideOpen, setGuideOpen] = useState(false);

  const travel = TRAVEL.filter((b) => showPlaceholders || places[b.kind].name);
  const showStay = showPlaceholders || Boolean(stay.name);
  const fade = (delay: number) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(14px)",
    transition: `opacity 900ms ${EASE.silk} ${delay}ms, transform 1000ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section ref={ref} id="venue" aria-labelledby="venue-heading" className="relative overflow-hidden py-[var(--section-y)]" style={{ paddingInline: "calc(100% * 35 / 768 + 14px)" }}>
      <div className="text-center" style={fade(0)}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="venue-heading" className="t-heading mt-2">
          {heading}
        </h2>
        <FlowerDivider className="mx-auto mt-4" />
      </div>

      <div className="relative mx-auto mt-8 max-w-[26rem]">
        {/* The temple, and the venue */}
        <img src={`${ART}/temple.webp`} width={478} height={415} alt="The Jagannath temple at Puri by the sea, with Lord Jagannath among jasmine and marigolds" loading="lazy" decoding="async" className="block h-auto w-[88%]" style={fade(100)} />
        <div className="relative -mt-4 ml-auto w-[84%]" style={fade(200)}>
          <VenueBlock />
        </div>

        <Route from="right" icons={<><RouteIcon kind="pin" className="right-[18%] top-0" /><RouteIcon kind="plane" className="right-[6%] top-[38%]" /><Waves className="left-[58%] top-[64%]" /></>} />

        {/* How to reach */}
        {travel.length > 0 && (
          <div id="travel" className="relative mr-auto w-[86%]" style={fade(300)}>
            <LotusLine />
            <h3 className="mt-1.5 text-center font-serif text-[24px] font-semibold" style={{ color: "#7A1424" }}>
              How to Reach
            </h3>
            <ul className="mt-3 space-y-4">
              {travel.map((b) => (
                <li key={b.kind}>
                  <TravelBlock kind={b.kind} title={b.title} place={places[b.kind]} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <Route from="left" icons={<><RouteIcon kind="bus" className="left-[30%] top-[10%]" /><Waves className="left-[6%] top-[50%]" /><RouteIcon kind="car" className="left-[44%] top-[60%]" /></>} />

        {/* The beach at Puri */}
        <img src={`${ART}/beach.webp`} width={408} height={355} alt="The beach at Puri, waves rolling in under palm trees, a temple on the shore" loading="lazy" decoding="async" className="-mt-6 ml-auto block h-auto w-[84%]" style={fade(400)} />

        <Route from="right" short icons={<RouteIcon kind="pin" className="left-[30%] top-[40%]" />} />

        {/* The hotel, and where to stay */}
        <img src={`${ART}/hotel.webp`} width={470} height={350} alt="A seaside hotel among palm trees, with a pool" loading="lazy" decoding="async" className="-mt-2 block h-auto w-[88%]" style={fade(500)} />
        {showStay && (
          <div className="relative -mt-2 ml-auto w-[84%]" style={fade(600)}>
            <LotusLine />
            <div className="mt-2">
              <TravelBlock kind="stay" title="Where to Stay" place={stay} />
            </div>
          </div>
        )}
      </div>

      <div className="relative mt-12 text-center" style={fade(700)}>
        <Button variant="gold" onClick={() => setGuideOpen(true)} aria-haspopup="dialog" className="min-h-14 px-8">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="currentColor">
            <path d="M9 1.5 10.6 7.4 16.5 9l-5.9 1.6L9 16.5 7.4 10.6 1.5 9l5.9-1.6Z" />
          </svg>
          {button}
        </Button>
      </div>

      {/* The faint wheel-and-temple sketch in the corner */}
      <img src={`${ART}/sketch.webp`} width={172} height={200} alt="" aria-hidden loading="lazy" decoding="async" className="pointer-events-none absolute bottom-2 w-[30%] opacity-80" style={{ right: "calc(100% * 35 / 768 + 6px)" }} />

      <Sheet open={guideOpen} onClose={() => setGuideOpen(false)} label={button}>
        <AtithiGuide />
      </Sheet>
    </section>
  );
}

/** The red flower between two fine lines, opening and closing the section. */
function FlowerDivider({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 18" className={`block h-[1.1rem] w-[13.75rem] ${className}`} aria-hidden>
      <path d="M4 9H92M128 9H216" stroke={ROUTE} strokeWidth="0.9" strokeLinecap="round" />
      <g fill={ROUTE}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <ellipse key={a} cx="110" cy="3.6" rx="2.1" ry="4" transform={`rotate(${a} 110 9)`} opacity={a % 90 ? 0.65 : 1} />
        ))}
        <circle cx="110" cy="9" r="1.8" fill="#F3E4C9" />
        <circle cx="98" cy="9" r="1.2" />
        <circle cx="122" cy="9" r="1.2" />
      </g>
    </svg>
  );
}

/** A fine line with a small lotus at its centre, over each piece of text (the design's frames, without the frames). */
function LotusLine() {
  return (
    <svg viewBox="0 0 200 16" className="mx-auto block h-4 w-[12.5rem]" aria-hidden fill="none" stroke={ROUTE} strokeLinecap="round">
      <path d="M6 12H84M116 12H194" strokeWidth="0.9" />
      <path d="M100 2C103 5.5 103 9.5 100 13 97 9.5 97 5.5 100 2Z" fill={`${ROUTE}33`} strokeWidth="1" />
      <path d="M100 13C96.5 12.5 93 10 92.5 6.5 96 7 98.5 9 100 13ZM100 13C103.5 12.5 107 10 107.5 6.5 104 7 101.5 9 100 13Z" strokeWidth="1" />
    </svg>
  );
}

/** A stretch of the dashed route, swinging from one side to the other, with its icons. */
function Route({ from, icons, short = false }: { from: "left" | "right"; icons: ReactNode; short?: boolean }) {
  const d = from === "right" ? "M78 0C92 34 12 32 22 66S70 96 40 100" : "M22 0C8 34 88 32 78 66S30 96 60 100";
  return (
    <div aria-hidden className={`pointer-events-none relative mx-auto w-full ${short ? "h-16" : "h-28"}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        <path d={d} fill="none" stroke={ROUTE} strokeWidth="1.3" strokeDasharray="5 6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {icons}
    </div>
  );
}

/** The route's icons: a map pin, a plane, a bus and a car on a short road. */
function RouteIcon({ kind, className = "" }: { kind: "pin" | "plane" | "bus" | "car"; className?: string }) {
  return (
    <svg viewBox="0 0 40 28" className={`absolute h-7 w-10 ${className}`} fill={ROUTE}>
      {kind === "pin" && <path transform="translate(9 0) scale(1.15)" d="M10 1a7.5 7.5 0 0 0-7.5 7.5C2.5 14 10 23 10 23s7.5-9 7.5-14.5A7.5 7.5 0 0 0 10 1Zm0 10.3a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6Z" />}
      {kind === "plane" && <path transform="translate(8 2) rotate(64 12 12)" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z" />}
      {kind === "bus" && (
        <g>
          <rect x="5" y="4" width="30" height="15" rx="3" />
          <rect x="8" y="7" width="5" height="5" rx="1" fill="#F3E4C9" />
          <rect x="15" y="7" width="5" height="5" rx="1" fill="#F3E4C9" />
          <rect x="22" y="7" width="5" height="5" rx="1" fill="#F3E4C9" />
          <rect x="29" y="7" width="4" height="6" rx="1" fill="#F3E4C9" />
          <circle cx="12" cy="20" r="2.6" />
          <circle cx="28" cy="20" r="2.6" />
          <path d="M2 25H38" stroke={ROUTE} strokeWidth="1.4" strokeDasharray="4 2" />
        </g>
      )}
      {kind === "car" && (
        <g>
          <path d="M5 17V13c0-1.5 1-2.4 2.4-2.6l3.6-.6L15 5.5c.6-.7 1.5-1 2.4-1h8c1 0 1.9.5 2.4 1.3l2.6 4.5c2.6.4 4.6 1.5 4.6 3.4V17Z" />
          <path d="M16 6.5h4.5v4h-7.6ZM22.5 6.5h3.5l2.2 4h-5.7Z" fill="#F3E4C9" />
          <circle cx="12" cy="18" r="3" />
          <circle cx="28" cy="18" r="3" />
          <path d="M2 24H38" stroke={ROUTE} strokeWidth="1.4" strokeDasharray="4 2" />
        </g>
      )}
    </svg>
  );
}

/** Three little waves, in sea blue. */
function Waves({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 16" className={`absolute h-4 w-10 ${className}`} fill="none" stroke="#5B8DB0" strokeWidth="1.2" strokeLinecap="round">
      <path d="M2 4c3-3 5 3 8 0s5 3 8 0 5 3 8 0 5 3 8 0" />
      <path d="M6 9c3-3 5 3 8 0s5 3 8 0 5 3 8 0" opacity="0.8" />
      <path d="M10 14c3-3 5 3 8 0s5 3 8 0" opacity="0.6" />
    </svg>
  );
}

function VenueBlock() {
  const { name, city, address, mapsUrl, description } = wedding.venue;
  const directions = directionsUrl({ mapsUrl, name, address });
  if (!showPlaceholders && !name && !address) return null;

  return (
    <article className="text-center" aria-label="The venue">
      <LotusLine />
      <div className="pt-2">
        <p className="t-label">The Venue</p>
        {name ? (
          <h3 className="t-event mt-1">{name}</h3>
        ) : (
          <div className="mt-2 flex justify-center">
            <Pending label="Venue name awaiting confirmation">
              <p className="t-event text-sindoor">Venue name</p>
            </Pending>
          </div>
        )}

        <div className="t-body mx-auto mt-2 max-w-[19rem] text-ink-soft">
          {address ? (
            <address className="not-italic">{address}</address>
          ) : (
            <Pending label="Address awaiting confirmation">Full address{city ? `, ${city}` : ""}</Pending>
          )}
        </div>

        {description && <p className="t-body mx-auto mt-3 max-w-[19rem]">{description}</p>}

        {directions ? (
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sindoor px-7 t-button text-cream-light shadow-[0_8px_20px_-10px_rgb(var(--sindoor)/0.7)] transition duration-200 ease-silk active:scale-[0.98] active:bg-sindoor-dark"
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
      <div className="t-body min-w-0 flex-1">
        <h3 className="text-[1.5rem]">{title}</h3>
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
        <h3 className="t-heading mt-2">{button}</h3>
        <p className="t-body mx-auto mt-2 max-w-[20rem] text-ink-soft">{intro}</p>
        <GoldDivider className="mt-4" />
      </div>

      <div className="mt-6 space-y-7">
        {sections.map((s) => (
          <section key={s.title} aria-label={s.title}>
            <h4 className="text-[1.5rem]">{s.title}</h4>
            <p className="t-body mt-1">{s.text}</p>
            {s.items.length > 0 && (
              <ul className="mt-3 space-y-2.5">
                {s.items.map((item) => (
                  <li key={item.name} className="rounded-xl border border-gold/35 bg-cream-light px-4 py-3 t-body">
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
      className="t-button inline-flex min-h-11 items-center gap-1.5 text-sindoor underline decoration-gold/60 underline-offset-4"
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
