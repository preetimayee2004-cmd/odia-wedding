import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { wedding, type ContactGroup, type ContactPerson } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { showPlaceholders } from "@/lib/placeholders";

/** Room on each side for the page's looped side bands. */
const BAND = "calc(100% * 35 / 768)";
const MAROON = "#7A1424";
const GOLD = "#B8893A";
const LABEL = "#A6782C";
const TEXT_SOFT = "#7A6250";
const RULE = "#E2D0AE";

/** Each side's small crown, from the couple's images. */
const CROWN: Record<ContactGroup["id"], { src: string; w: number; h: number; alt: string }> = {
  bride: { src: "/art/contact/bride-mukut.webp", w: 457, h: 374, alt: "The bride's golden mukut" },
  groom: { src: "/art/contact/groom-mukut.webp", w: 448, h: 447, alt: "The groom's golden mukut" },
};

/** A real number to call (samples are masked stand-ins). */
const hasNumber = (p: ContactPerson) => !!p.phone && !p.sample;
const digits = (phone: string) => phone.replace(/[^\d+]/g, "");

/** Whether any contact has a number yet (the RSVP points here only then). */
export const hasContactNumbers = wedding.contact.groups.some((g) => g.people.some(hasNumber));

/** A side's contacts: all of them while placeholders are on; otherwise only those with a number. */
const shownPeople = (g: ContactGroup) => (showPlaceholders ? g.people : g.people.filter(hasNumber));

/**
 * Section 12 — Contact, after the couple's design.
 * On the page's own background, between its side bands: "Contact" over a
 * lotus rule and a line of help; then the bride's side and the groom's side,
 * each under its small crown and name (both in maroon), with a row per
 * person — role, name and what to ask them about — and a round call button
 * and a round message (WhatsApp) button.
 */
export function Contact() {
  const { heading, note, groups } = wedding.contact;
  const sides = groups.filter((g) => shownPeople(g).length > 0);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.08 });

  if (sides.length === 0) return null;

  const rise = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(12px)",
    transition: `opacity 900ms ${EASE.silk} ${delay}ms, transform 1000ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section ref={ref} id="contact" aria-labelledby="contact-heading" className="pb-12 pt-12" style={{ paddingInline: `calc(${BAND} + 16px)` }}>
      <div className="mx-auto max-w-[24rem]">
        <header className="text-center" style={rise(0)}>
          <h2 id="contact-heading" className="font-serif text-[44px] font-semibold leading-none" style={{ color: MAROON }}>
            {heading}
          </h2>
          <LotusRule className="mx-auto mt-2 block h-4 w-[11rem]" />
          <p className="t-quote mx-auto mt-2 max-w-[19rem] text-[16.5px]" style={{ color: TEXT_SOFT }}>
            {note}
          </p>
        </header>

        {sides.map((g, i) => (
          <Side key={g.id} group={g} style={rise(150 + i * 150)} />
        ))}
      </div>
    </section>
  );
}

function Side({ group, style }: { group: ContactGroup; style: CSSProperties }) {
  const crown = CROWN[group.id];
  return (
    <div className="mt-11" style={style}>
      <div className="text-center">
        <img src={crown.src} width={crown.w} height={crown.h} alt={crown.alt} decoding="async" loading="lazy" className="mx-auto block h-8 w-auto" />
        <h3 className="mt-1.5 font-serif text-[25px] font-semibold leading-tight" style={{ color: MAROON }}>
          {group.title}
        </h3>
        {group.subtitle && (
          <p className="font-serif text-[14px] italic leading-tight" style={{ color: TEXT_SOFT }}>
            {group.subtitle}
          </p>
        )}
        <LotusRule className="mx-auto mt-2 block h-3 w-[7.5rem]" />
      </div>

      <ul className="mt-4">
        {shownPeople(group).map((p, i) => (
          <PersonRow key={p.role} person={p} first={i === 0} />
        ))}
      </ul>
    </div>
  );
}

/** One person: role, name and what they help with; a round call button and a round message button. */
function PersonRow({ person, first }: { person: ContactPerson; first: boolean }) {
  const { role, name, note, phone } = person;
  const live = hasNumber(person);
  const [soon, setSoon] = useState(false); // tapped before the number is in
  const who = name ?? role;

  return (
    <li className={`flex items-center gap-3 py-3 ${first ? "" : "border-t"}`} style={{ borderColor: RULE }}>
      <div className="min-w-0 flex-1">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: LABEL }}>
          {role}
        </p>
        <p className="mt-0.5 font-serif text-[18px] font-semibold leading-tight" style={{ color: "var(--c-text)" }}>
          {name ?? (showPlaceholders ? "[Name]" : role)}
        </p>
        {note && (
          <p className="font-serif text-[13.5px] italic leading-snug" style={{ color: TEXT_SOFT }}>
            {note}
          </p>
        )}
        {soon && (
          <p role="status" className="mt-0.5 font-sans text-[11px]" style={{ color: MAROON }}>
            Numbers coming soon
          </p>
        )}
      </div>

      <div className="flex shrink-0 gap-2">
        {live && phone ? (
          <>
            <RoundLink href={`tel:${digits(phone)}`} label={`Call ${who}`} filled>
              <PhoneIcon />
            </RoundLink>
            <RoundLink href={`https://wa.me/${digits(phone).replace(/^\+/, "")}?text=${encodeURIComponent(wedding.contact.whatsappMessage)}`} label={`Message ${who} on WhatsApp`} external>
              <ChatIcon />
            </RoundLink>
          </>
        ) : (
          <>
            <RoundButton label={`Call ${who} (number coming soon)`} filled onClick={() => setSoon(true)}>
              <PhoneIcon />
            </RoundButton>
            <RoundButton label={`Message ${who} (number coming soon)`} onClick={() => setSoon(true)}>
              <ChatIcon />
            </RoundButton>
          </>
        )}
      </div>
    </li>
  );
}

const roundClass = (filled: boolean) =>
  `inline-flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] transition-transform duration-200 ease-silk active:scale-95 ${
    filled ? "text-[#FBF3E4] shadow-[0_6px_12px_-8px_rgb(122_20_36/0.8)]" : "bg-transparent"
  }`;
const roundStyle = (filled: boolean): CSSProperties => (filled ? { backgroundColor: MAROON, borderColor: MAROON } : { borderColor: MAROON, color: MAROON });

function RoundLink({ href, label, filled = false, external, children }: { href: string; label: string; filled?: boolean; external?: boolean; children: ReactNode }) {
  return (
    <a href={href} aria-label={label} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={roundClass(filled)} style={roundStyle(filled)}>
      {children}
    </a>
  );
}

function RoundButton({ label, filled = false, onClick, children }: { label: string; filled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} aria-disabled onClick={onClick} className={roundClass(filled)} style={roundStyle(filled)}>
      {children}
    </button>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M6.5 3.5h-2a1 1 0 0 0-1 1.1A15 15 0 0 0 15.4 16.5a1 1 0 0 0 1.1-1v-2a1 1 0 0 0-.8-1l-2.3-.5a1 1 0 0 0-1 .3l-1 1a11 11 0 0 1-4.7-4.7l1-1a1 1 0 0 0 .3-1l-.5-2.3a1 1 0 0 0-1-.8Z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3.5c4 0 7 2.6 7 5.9s-3 5.9-7 5.9c-.9 0-1.8-.1-2.6-.4L4 16.2l1-2.9C3.8 12.2 3 10.9 3 9.4 3 6.1 6 3.5 10 3.5Z" />
      <path d="M7 9.5h.01M10 9.5h.01M13 9.5h.01" strokeWidth="2" />
    </svg>
  );
}

/** Fine gold lines either side of a small lotus. */
function LotusRule({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 176 16" className={className} aria-hidden fill="none" stroke={GOLD} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 9.5H70M106 9.5H168" strokeWidth="0.8" opacity="0.85" />
      <g fill={`${GOLD}55`} strokeWidth="1">
        <path d="M88 2.5C91 5.5 91.5 9.5 88 13.5 84.5 9.5 85 5.5 88 2.5Z" />
        <path d="M88 13.5C84 13 80.5 10.5 80 7 83.5 7.5 86.5 10 88 13.5ZM88 13.5C92 13 95.5 10.5 96 7 92.5 7.5 89.5 10 88 13.5Z" />
      </g>
    </svg>
  );
}
