import { useRef, type CSSProperties, type ReactNode } from "react";
import { wedding, type TravelMode } from "@/config/wedding";
import { JhotiRule } from "@/components/ui/JhotiThreshold";
import { useInView } from "@/hooks/useInView";
import { showPlaceholders } from "@/lib/placeholders";
import { EASE } from "@/lib/motion";
import { directionsUrl } from "@/lib/maps";
import { formatVenueDate, parseVenueDateTime } from "@/lib/venueTime";
import { Pending } from "@/components/ui/Pending";

const ART = "/art/venue";
const MAROON = "#7A1424";
const ROUTE = "#8C2A20"; // the dashed route, its icons and the small ornaments
const GOLD = "#B8893A";
const INK = "var(--c-text)";
const ICON = "#F3D98C"; // the gold of the icons on their maroon medallions

/** Each stop's painting: one scale and one treatment for both, centred. */
const PAINTING = "mx-auto block h-auto w-[84%] max-w-[19rem]";

/**
 * Section 10 — Venue & Accommodation, after the couple's design.
 * A narrow editorial column between the side bands on the flowered cream.
 * Two stops, each the same way round — a painting, then a header (gold
 * medallion, rule, number, title, tagline), then its details:
 * 01 The Venue (the Jagannath temple), 02 Getting Here (the beach at Puri;
 * by air, by train, local transport). A small dashed route with a pin and a
 * tiny plane links them. Ends with Jai Jagannath and a faint
 * wheel-and-temple sketch.
 */
export function VenueTravel() {
  const { eyebrow, heading, intro, gettingHere, closing } = wedding.travel;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.05 });

  const fade = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(14px)",
    transition: `opacity 900ms ${EASE.silk} ${delay}ms, transform 1000ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section
      ref={ref}
      id="venue"
      aria-labelledby="venue-heading"
      data-no-petals
      className="relative overflow-hidden py-[var(--section-y)]"
      style={{ paddingInline: "calc(100% * 35 / 768 + 20px)" }}
    >
      <div className="mx-auto max-w-[24rem]">
        {/* The heading */}
        <header className="text-center" style={fade(0)}>
          <p className="t-label">{eyebrow}</p>
          <h2 id="venue-heading" className="t-heading mt-1.5" style={{ color: MAROON }}>
            {heading}
          </h2>
          <JhotiRule motif="champa" className="mt-3" />
          <p className="t-quote mx-auto mt-3 max-w-[20rem] text-[18px]" style={{ color: "#5A3B2A" }}>
            {intro}
          </p>
        </header>

        {/* 01 — The Venue */}
        <div className="mt-10" style={fade(100)}>
          <img src={`${ART}/mandap.webp`} width={599} height={613} alt="The wedding mandap: a golden canopy hung with roses, red drapes and marigold tassels over a red-carpeted stage" loading="lazy" decoding="async" className={PAINTING} />
          <div className="mt-6">
            <Venue />
          </div>
        </div>

        <Connector plane />

        {/* 02 — Getting Here */}
        <div id="travel" style={fade(200)}>
          <img src={`${ART}/beach.webp`} width={408} height={355} alt="The beach at Puri, waves rolling in under palm trees, a temple on the shore" loading="lazy" decoding="async" className={PAINTING} />
          <div className="mt-6">
            <StopHeading number="02" title={gettingHere.title} tagline={gettingHere.tagline} icon="plane" />
            <p className="t-body mt-4">{gettingHere.intro}</p>
            <ul className="mt-3 divide-y divide-dashed divide-[#E3CFA4] border-y border-dashed border-[#E3CFA4]">
              {gettingHere.modes.map((m) => (
                <li key={m.kind} className="py-3.5">
                  <Mode mode={m} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Jai Jagannath */}
        <p className="t-label mt-14 flex items-center justify-center gap-3 text-[12px] tracking-[3px]" style={{ ...fade(400), color: ROUTE }}>
          <Sprig />
          {closing}
          <Sprig mirrored />
        </p>
      </div>

      {/* The faint wheel-and-temple sketch in the corner */}
      <img src={`${ART}/sketch.webp`} width={172} height={200} alt="" aria-hidden loading="lazy" decoding="async" className="pointer-events-none absolute bottom-0 w-[20%] max-w-[6rem] opacity-70" style={{ right: "calc(100% * 35 / 768 + 6px)" }} />
    </section>
  );
}

/** 01 — The Venue: its name, a few words, the place and the date, and the map. */
function Venue() {
  const { name, city, address, mapsUrl, description } = wedding.venue;
  const directions = directionsUrl({ mapsUrl, name, address });
  const parts = parseVenueDateTime(wedding.wedding.dateTime);
  const date = parts && formatVenueDate(parts);

  return (
    <article aria-label="The venue">
      <StopHeading number="01" title="The Venue" tagline={[name, city?.split(",")[0]].filter(Boolean).join(", ") || null} icon="temple" />
      {description && <p className="t-body mt-4">{description}</p>}

      <ul className="mt-3 space-y-2 border-y border-dashed border-[#E3CFA4] py-3">
        <InfoRow icon="pin">
          {address ?? city ?? <Pending label="Address awaiting confirmation">Full address</Pending>}
          {!address && showPlaceholders && (
            <span className="block">
              <Pending label="Venue address awaiting confirmation">Venue address · to be confirmed</Pending>
            </span>
          )}
        </InfoRow>
        {(date || showPlaceholders) && (
          <InfoRow icon="calendar">
            {date ? (
              <>
                {date.day} {date.month.slice(0, 3)} {date.year}
                {date.time && (
                  <>
                    <span aria-hidden className="mx-2 text-[#C9A86A]">
                      |
                    </span>
                    {date.time}
                  </>
                )}
              </>
            ) : (
              <Pending label="Date awaiting confirmation">Date to be announced</Pending>
            )}
            {date && !date.time && showPlaceholders && <span className="t-note block">Timings to be announced</span>}
          </InfoRow>
        )}
      </ul>

      {directions ? (
        <div className="mt-5">
          <PillButton href={directions}>View on Map</PillButton>
        </div>
      ) : (
        <div className="mt-5">
          <Pending label="Directions need a confirmed address">View on Map</Pending>
        </div>
      )}
    </article>
  );
}

/** A stop's heading: a gold medallion, a rule, the number, the title and its tagline. */
function StopHeading({ number, title, tagline, icon }: { number: string; title: string; tagline: string | null; icon: MedallionIcon }) {
  return (
    <div className="flex items-center gap-3">
      <Medallion icon={icon} />
      <span aria-hidden className="w-px self-stretch" style={{ backgroundColor: "#C9A86A" }} />
      <div className="min-w-0 text-left">
        <p className="font-serif text-[16px] font-semibold leading-none tracking-[1px]" style={{ color: GOLD }}>
          {number}
        </p>
        <h3 className="mt-1 font-serif text-[30px] font-semibold leading-[1.05]" style={{ color: MAROON }}>
          {title}
        </h3>
        {tagline && (
          <p className="t-label mt-1 text-[10.5px] tracking-[1.6px]" style={{ color: "#5A3B2A" }}>
            {tagline}
          </p>
        )}
      </div>
    </div>
  );
}

/** One way to get here: its icon, "By Air", the place, and how to come on. */
function Mode({ mode }: { mode: TravelMode }) {
  const icon: Record<TravelMode["kind"], MedallionIcon> = { air: "plane", train: "train", local: "car" };
  return (
    <div className="flex items-start gap-3">
      <Medallion icon={icon[mode.kind]} small />
      <div className="min-w-0 flex-1">
        <p className="t-label text-[11px] tracking-[1.6px]" style={{ color: ROUTE }}>
          {mode.title}
        </p>
        <p className="mt-1 font-serif text-[19px] font-semibold leading-tight" style={{ color: INK }}>
          {mode.place}
        </p>
        {mode.detail && (
          <p className="t-body text-[17px] leading-snug" style={{ color: "var(--c-muted)" }}>
            {mode.detail}
          </p>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, children }: { icon: "pin" | "calendar"; children: ReactNode }) {
  return (
    <li className="t-body flex items-start gap-2.5 leading-snug">
      <svg viewBox="0 0 20 20" className="mt-1 h-4 w-4 shrink-0" aria-hidden fill="none" stroke={ROUTE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {icon === "pin" ? (
          <>
            <path d="M10 18s6-5.6 6-10a6 6 0 0 0-12 0c0 4.4 6 10 6 10Z" fill={ROUTE} stroke="none" />
            <circle cx="10" cy="8" r="2.2" fill="#F3E4C9" stroke="none" />
          </>
        ) : (
          <>
            <rect x="3" y="4.5" width="14" height="12.5" rx="1.6" />
            <path d="M3 8.5h14M7 2.5v3.5M13 2.5v3.5" />
            <path d="M6.5 11.5h1M9.5 11.5h1M12.5 11.5h1M6.5 14h1M9.5 14h1" strokeWidth="1.8" />
          </>
        )}
      </svg>
      <div>{children}</div>
    </li>
  );
}

/** A slim pill link with a gold edge, as in the design. */
function PillButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="t-button inline-flex min-h-11 items-center gap-2 rounded-full border border-[#C9A86A] bg-[#FFFAF1]/80 px-6 text-[12px] shadow-[0_6px_14px_-10px_rgb(110_70_20/0.5)] transition-transform duration-200 ease-silk active:scale-[0.98]"
      style={{ color: ROUTE }}
    >
      {children}
      <span aria-hidden>↗</span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

type MedallionIcon = "temple" | "plane" | "train" | "car";

/** A medallion filled in maroon: a gold ring within a dotted gold ring, small ornaments at its points, and a gold icon. */
function Medallion({ icon, small = false }: { icon: MedallionIcon; small?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={small ? "h-10 w-10 shrink-0" : "h-14 w-14 shrink-0"} aria-hidden>
      <circle cx="32" cy="32" r="24" fill={MAROON} stroke={GOLD} strokeWidth="1.6" />
      <circle cx="32" cy="32" r="21.5" fill="none" stroke={ICON} strokeWidth="0.5" opacity="0.55" />
      <circle cx="32" cy="32" r="28" fill="none" stroke={GOLD} strokeWidth="0.8" strokeDasharray="0.1 3.2" strokeLinecap="round" />
      {!small && (
        <g fill={GOLD}>
          <path d="M32 0.5 33.6 3 32 5.5 30.4 3Z" />
          <path d="M32 58.5 33.6 61 32 63.5 30.4 61Z" />
          <path d="M0.5 32 3 30.4 5.5 32 3 33.6Z" />
        </g>
      )}
      <g transform="translate(32 32)" fill="none" stroke={ICON} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {MEDALLION_ICONS[icon]}
      </g>
    </svg>
  );
}

const MEDALLION_ICONS: Record<MedallionIcon, ReactNode> = {
  // a temple shikhara over its base
  temple: (
    <>
      <path d="M0-15V-12M-2.5-12h5" />
      <path d="M-6 6C-7-3-4-10 0-12 4-10 7-3 6 6Z" />
      <path d="M-3 6V-3M3 6V-3M0 6V-6" strokeWidth="1" />
      <path d="M-11 6H11V10H-11Z" />
      <path d="M-8 10V13H8V10" />
    </>
  ),
  plane: <path d="M-1.5-12C-1.5-14 1.5-14 1.5-12V-3L12 3.5V6.5L1.5 3V9L5 11.5V13.5L0 12 -5 13.5V11.5L-1.5 9V3L-12 6.5V3.5L-1.5-3Z" fill={ICON} stroke="none" />,
  train: (
    <>
      <rect x="-7.5" y="-11" width="15" height="17" rx="3.5" />
      <path d="M-7.5-2H7.5M-4 2.5h.01M4 2.5h.01M-5 6l-3 6M5 6l3 6M-3-11v-2h6v2" />
    </>
  ),
  car: (
    <>
      <path d="M-11 5V0C-11-1.5-10-2.5-8.6-2.7L-5-3.3-1.5-8C-1-8.6 0-9 1-9H6C7-9 8-8.5 8.5-7.7L11-3.3C12.5-3 13-2 13-.5V5Z" />
      <circle cx="-6" cy="6" r="2.6" fill={MAROON} />
      <circle cx="7" cy="6" r="2.6" fill={MAROON} />
    </>
  ),
};

/** A small maroon sprig either side of a label. */
function Sprig({ mirrored = false, className = "" }: { mirrored?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 28 10" className={`inline-block h-2.5 w-7 shrink-0 ${mirrored ? "-scale-x-100" : ""} ${className}`} aria-hidden fill="none" stroke={ROUTE} strokeWidth="0.9" strokeLinecap="round">
      <path d="M2 5H18" />
      <path d="M18 5C20 2.6 23 2.6 25 5 23 7.4 20 7.4 18 5Z" fill={`${ROUTE}40`} />
      <circle cx="7" cy="5" r="0.9" fill={ROUTE} stroke="none" />
    </svg>
  );
}


/**
 * The small route between two stops: a short, gently curving dashed line
 * from the stop above to a map pin, a tiny plane beside the first one, and a
 * few strokes of sea. It has its own height, so it never touches the text.
 */
function Connector({ plane = false }: { plane?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none relative mx-auto my-8 h-[5.5rem] w-[11rem]">
      <svg viewBox="0 0 176 88" className="absolute inset-0 h-full w-full overflow-visible" fill="none">
        <path d="M88 0C88 22 52 24 56 46S96 62 88 74" stroke={ROUTE} strokeWidth="1.2" strokeDasharray="4 5" strokeLinecap="round" />
        {/* the pin at the next stop */}
        <path d="M88 88s-6.5-7.2-6.5-12a6.5 6.5 0 0 1 13 0C94.5 80.8 88 88 88 88Z" fill={ROUTE} transform="translate(0 -4)" />
        <circle cx="88" cy="72" r="2.2" fill="#F3E4C9" />
        {/* a few strokes of sea */}
        <path d="M118 52c3-2.6 5 2.6 8 0s5 2.6 8 0M124 58c3-2.6 5 2.6 8 0" stroke="#7FA6C0" strokeWidth="1" strokeLinecap="round" />
        {plane && (
          <path
            transform="translate(118 10) rotate(60 10 10) scale(0.85)"
            d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z"
            fill={ROUTE}
          />
        )}
      </svg>
    </div>
  );
}
