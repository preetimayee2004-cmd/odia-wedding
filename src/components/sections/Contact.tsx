import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { wedding, type ContactGroup, type ContactPerson } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { showPlaceholders } from "@/lib/placeholders";

/** Room on each side for the page's looped side bands. */
const BAND = "calc(100% * 35 / 768)";
const CARD_BG = "#FCF5E8";
const LINE = "#DCC296";
const GOLD = "#B8893A";
const HEADING = "#9E2B2B";
const TEXT_SOFT = "#6B4A3A";

/** Each card's colour and art, from the couple's design. */
const THEME: Record<ContactGroup["id"], { ink: string; button: string; art: { src: string; w: number; h: number; alt: string; width: string } }> = {
  bride: {
    ink: "#9E2B2B",
    button: "#A3322D",
    art: { src: "/art/contact/bride-art.webp", w: 220, h: 199, alt: "A bride's red-and-white tiara beside a stack of red bangles and jasmine", width: "9.5rem" },
  },
  groom: {
    ink: "#4E6B3E",
    button: "#56704B",
    art: { src: "/art/contact/groom-mukut.webp", w: 448, h: 447, alt: "The groom's golden mukut, set with gems, a plume at its side", width: "7.5rem" },
  },
  guests: {
    ink: "#AD7428",
    button: "#BF873A",
    art: { src: "/art/contact/guests-art.webp", w: 232, h: 203, alt: "A brass kalash with a coconut and mango leaves, beside a suitcase", width: "9.5rem" },
  },
};

const hasNumber = (p: ContactPerson) => !!p.phone;
const tel = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** Whether any contact has a number yet (the RSVP points here only then). */
export const hasContactNumbers = wedding.contact.groups.some((g) => g.people.some(hasNumber));

/** A card's contacts: all of them while placeholders are on; otherwise only those with a number. */
const shownPeople = (g: ContactGroup) => (showPlaceholders ? g.people : g.people.filter(hasNumber));

/**
 * Section 12 — Contact, after the couple's design.
 * On the page's own background, between its side bands: "Contact" under a
 * lotus rule and a line of help, then three arch-topped cards — the bride's
 * family (maroon, her tiara and bangles), the groom's family (green, his
 * golden mukut) and the guests' coordinators (ochre, a kalash and a
 * suitcase). Each card has a line of help, its contacts with a round icon,
 * role, name and tap-to-call number, and Call Now for the first number.
 */
export function Contact() {
  const { heading, note, groups } = wedding.contact;
  const cards = groups.filter((g) => shownPeople(g).length > 0);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.08 });

  if (cards.length === 0) return null;

  const rise = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(14px)",
    transition: `opacity 900ms ${EASE.silk} ${delay}ms, transform 1000ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section ref={ref} id="contact" aria-labelledby="contact-heading" className="pb-14 pt-12 text-center" style={{ paddingInline: `calc(${BAND} + 14px)` }}>
      <div className="mx-auto max-w-[24rem]">
        <header style={rise(0)}>
          <LotusRule className="mx-auto block h-6 w-[15rem]" />
          <h2 id="contact-heading" className="mt-2 font-serif text-[46px] font-semibold leading-none" style={{ color: HEADING }}>
            {heading}
          </h2>
          <DiamondRule color={GOLD} className="mx-auto mt-3" />
          <p className="t-quote mx-auto mt-4 max-w-[18.5rem] text-[18px]" style={{ color: TEXT_SOFT }}>
            {note}
          </p>
        </header>

        <ul className="mt-10 space-y-9">
          {cards.map((g, i) => (
            <li key={g.id} style={rise(150 + i * 140)}>
              <ContactCard group={g} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ContactCard({ group }: { group: ContactGroup }) {
  const { ink, button, art } = THEME[group.id];
  const people = shownPeople(group);
  const first = people.find(hasNumber)?.phone ?? null;

  return (
    <ArchCard>
      <img src={art.src} width={art.w} height={art.h} alt={art.alt} decoding="async" loading="lazy" className="mx-auto block h-auto" style={{ width: art.width }} />

      <h3 className="mt-2.5 font-serif text-[27px] font-semibold leading-tight" style={{ color: ink }}>
        {group.title}
      </h3>
      {group.subtitle && (
        <p className="font-serif text-[18px] italic leading-snug" style={{ color: ink }}>
          ({group.subtitle})
        </p>
      )}
      <DiamondRule color={GOLD} className="mx-auto mt-2.5" />
      <p className="t-quote mx-auto mt-2.5 max-w-[16.5rem] text-[16.5px] leading-snug [text-wrap:balance]" style={{ color: TEXT_SOFT }}>
        {group.text}
      </p>

      <ul className="mx-auto mt-4 max-w-[17.5rem] space-y-3.5 border-t pt-4 text-left" style={{ borderColor: LINE }}>
        {people.map((p) => (
          <PersonRow key={p.role} person={p} ink={ink} />
        ))}
      </ul>

      {first ? (
        <a
          href={tel(first)}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full px-7 font-sans text-[15px] font-medium text-[#FFF8EE] shadow-[0_8px_16px_-10px_rgb(80_40_10/0.7)] transition-transform duration-200 ease-silk active:scale-[0.97]"
          style={{ backgroundColor: button }}
        >
          Call Now <span aria-hidden>→</span>
        </a>
      ) : (
        showPlaceholders && (
          <span
            aria-disabled
            title="Numbers to be added"
            className="mt-5 inline-flex min-h-11 cursor-default items-center gap-2 rounded-full px-7 font-sans text-[15px] font-medium text-[#FFF8EE] opacity-50"
            style={{ backgroundColor: button }}
          >
            Call Now <span aria-hidden>→</span>
          </span>
        )
      )}
    </ArchCard>
  );
}

/** One contact: a round icon, the role, the name, and the number to tap. */
function PersonRow({ person, ink }: { person: ContactPerson; ink: string }) {
  const { role, name, phone, icon = "person" } = person;
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: LINE, backgroundColor: "#F6E6CC", color: ink }}>
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {ICONS[icon]}
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-sans text-[12.5px] leading-tight" style={{ color: TEXT_SOFT }}>
          {role}
        </p>
        {name ? (
          <p className="font-serif text-[17px] font-semibold leading-snug" style={{ color: "var(--c-text)" }}>
            {name}
          </p>
        ) : (
          showPlaceholders && <ToCome className="font-serif text-[15px]">Name to be added</ToCome>
        )}
        {phone ? (
          <a href={tel(phone)} aria-label={`Call ${name ?? role}, ${phone}`} className="inline-flex min-h-8 items-center gap-1.5 font-sans text-[14px] font-medium" style={{ color: "var(--c-text)" }}>
            <PhoneIcon /> {phone}
          </a>
        ) : (
          showPlaceholders && (
            <p className="mt-0.5 flex items-center gap-1.5 font-sans text-[13px]" style={{ color: TEXT_SOFT }}>
              <PhoneIcon /> <ToCome>Number to be added</ToCome>
            </p>
          )
        )}
      </div>
    </li>
  );
}

/** A detail still to come (shown only while placeholders are on). */
function ToCome({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span title="To be confirmed" className={`block w-fit border-b border-dashed border-current italic opacity-55 ${className}`}>
      {children}
    </span>
  );
}

const ICONS: Record<NonNullable<ContactPerson["icon"]>, ReactNode> = {
  person: (
    <>
      <circle cx="10" cy="7" r="3.2" />
      <path d="M4 16.5c.8-3 3.2-4.6 6-4.6s5.2 1.6 6 4.6" />
    </>
  ),
  planner: (
    <>
      <rect x="3.5" y="5" width="13" height="11.5" rx="1.5" />
      <path d="M3.5 9h13M7 3v3.5M13 3v3.5M7 12.5h2M11 12.5h2" />
    </>
  ),
  hotel: (
    <>
      <path d="M2.5 15.5V5.5M2.5 12.5h15v3M17.5 12.5V11a2.5 2.5 0 0 0-2.5-2.5H9v4" />
      <circle cx="5.8" cy="10" r="1.6" />
    </>
  ),
  car: (
    <>
      <path d="M3.5 13.5V11l1.7-4.2h9.6l1.7 4.2v2.5h-13Z" />
      <path d="M3 11h14" />
      <circle cx="6.5" cy="13.8" r="1.3" />
      <circle cx="13.5" cy="13.8" r="1.3" />
    </>
  ),
};

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0" aria-hidden fill="currentColor">
      <path d="M6.5 3.5h-2a1 1 0 0 0-1 1.1A15 15 0 0 0 15.4 16.5a1 1 0 0 0 1.1-1v-2a1 1 0 0 0-.8-1l-2.3-.5a1 1 0 0 0-1 .3l-1 1a11 11 0 0 1-4.7-4.7l1-1a1 1 0 0 0 .3-1l-.5-2.3a1 1 0 0 0-1-.8Z" />
    </svg>
  );
}

/**
 * A card with the design's arched top: each shoulder rises in a small cusp
 * to a flat top with a point at its centre. The outline is drawn to the
 * card's measured size, so the curves never stretch.
 */
function ArchCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<[number, number] | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize([el.offsetWidth, el.offsetHeight]);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative px-5 pb-6 pt-9" style={{ filter: "drop-shadow(0 10px 14px rgb(120 80 30 / 0.1))" }}>
      {size && (
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${size[0]} ${size[1]}`}>
          <path d={archPath(size[0], size[1])} fill={CARD_BG} stroke={LINE} strokeWidth="1" />
        </svg>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

function archPath(w: number, h: number): string {
  const c = w / 2;
  const r = 22;
  const R = w - 0.5;
  const B = h - 0.5;
  return [
    `M0.5 ${B - r}V40`,
    // left shoulder: a curve up, a small cusp, a second curve to the top
    `C0.5 30 6 24 14 23.5C17 23.3 19 21 20 18C21.5 20.5 24 21 27 20.5C31 12 38 9 48 9`,
    // along the top to the point at its centre, and on
    `H${c - 16}C${c - 11} 9 ${c - 6} 6 ${c} 0.8C${c + 6} 6 ${c + 11} 9 ${c + 16} 9H${w - 48}`,
    // the right shoulder, mirrored
    `C${w - 38} 9 ${w - 31} 12 ${w - 27} 20.5C${w - 24} 21 ${w - 21.5} 20.5 ${w - 20} 18C${w - 19} 21 ${w - 17} 23.3 ${w - 14} 23.5C${w - 6} 24 ${R} 30 ${R} 40`,
    `V${B - r}A${r} ${r} 0 0 1 ${R - r} ${B}H${0.5 + r}A${r} ${r} 0 0 1 0.5 ${B - r}Z`,
  ].join("");
}

/** Fine gold lines either side of a small lotus, over the heading. */
function LotusRule({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 24" className={className} aria-hidden fill="none" stroke={GOLD} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 15H98M142 15H232" strokeWidth="0.9" />
      <g strokeWidth="1.2" stroke={HEADING}>
        <path d="M120 3C124 7 125 13 120 20 115 13 116 7 120 3Z" />
        <path d="M120 20C114 19 109 15 108 9 113 10 118 14 120 20ZM120 20C126 19 131 15 132 9 127 10 122 14 120 20Z" />
        <path d="M110 21H130" />
      </g>
    </svg>
  );
}

/** A small diamond between two short lines. */
function DiamondRule({ color, className = "" }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 12" className={`block h-3 w-[7.5rem] ${className}`} aria-hidden>
      <path d="M8 6H50M70 6H112" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
      <path d="M60 1.5L64.5 6 60 10.5 55.5 6Z" fill="none" stroke={color} strokeWidth="1" />
      <path d="M60 4L62 6 60 8 58 6Z" fill={color} />
    </svg>
  );
}
