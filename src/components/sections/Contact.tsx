import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { wedding, type ContactPerson } from "@/config/wedding";
import { JhotiRule } from "@/components/ui/JhotiThreshold";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { demoMode, showPlaceholders } from "@/lib/placeholders";
import { Pending } from "@/components/ui/Pending";
import { FitText, type FitTier } from "@/components/ui/FitText";

/** Room on each side for the page's looped side bands. */
const BAND = "calc(100% * 35 / 768)";
/** The card's side margin: 22px inside the side bands, so the crowns overhanging its corners stay clear of them. */
const GUTTER = `calc(${BAND} + 22px)`;
const MAROON = "#7A1424";
const GOLD = "#B8913F";
const TEXT_SOFT = "#7A6250";
/** A long role: a touch smaller on one line, else two. A long name: two lines, a little smaller if need be, never cut. */
const ROLE_FIT: FitTier[] = [
  [1, 0.9],
  [2, 1],
];
const NAME_FIT: FitTier[] = [[2, 0.8]];

/** A real number to call (samples are masked stand-ins). */
const hasNumber = (p: ContactPerson) => !!p.phone && !p.sample;
const digits = (phone: string) => phone.replace(/[^\d+]/g, "");
/** "Mr. Ankit Mohapatra" → "Ankit Mohapatra", for the buttons' labels. */
const plainName = (name: string) => name.replace(/^(Mr|Mrs|Ms|Miss|Dr|Shri|Smt)\.?\s+/i, "");

/** Whether any contact has a number yet (the RSVP points here only then). */
export const hasContactNumbers = wedding.contact.people.some(hasNumber);

/** All contacts while placeholders are on; otherwise only those with a number. */
const shown = (people: ContactPerson[]) => (showPlaceholders ? people : people.filter(hasNumber));

/**
 * Section 12 — Contact.
 * "Contact" over a lotus rule and a line of help; then one decorated card:
 * cream paper, a gold outer line, a maroon inner line and a dashed gold
 * line, a gold lotus on its top edge and gold curls in its lower corners,
 * with the groom's mukut and the bride's mukut dropping onto its top corners
 * and settling with a small swing. Inside: the families — the groom's brother
 * and the bride's brother side by side — then, under a lotus, the
 * coordinators in full-width rows. Each person has a round call button and a
 * round WhatsApp button.
 */
export function Contact() {
  const { heading, note, people } = wedding.contact;
  const family = shown(people.filter((p) => p.group === "family"));
  const coordinators = shown(people.filter((p) => p.group === "coordinator"));
  const ref = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.08 });
  const frameIn = useInView(frameRef, { threshold: 0.2 });
  // the last call or message button tapped before its number can be used
  const [soon, setSoon] = useState<ContactPerson | null>(null);

  if (family.length + coordinators.length === 0) return null;

  const rise = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(12px)",
    transition: `opacity 900ms ${EASE.silk} ${delay}ms, transform 1000ms ${EASE.silk} ${delay}ms`,
  });
  const status = soon && (
    <p role="status" className="font-sans text-[11px] leading-snug" style={{ color: MAROON }}>
      {demoMode ? "Example number — calling is off in this demo" : "Numbers coming soon"}
    </p>
  );

  return (
    <section ref={ref} id="contact" aria-labelledby="contact-heading" className="pb-12 pt-12">
      <div style={{ paddingInline: `calc(${BAND} + 16px)` }}>
        <header className="mx-auto max-w-[24rem] text-center" style={rise(0)}>
          <h2 id="contact-heading" className="t-heading" style={{ color: MAROON }}>
            {heading}
          </h2>
          <JhotiRule motif="champa" className="mt-3" />
          <p className="t-quote mx-auto mt-3 max-w-[19rem] text-[16.5px]" style={{ color: TEXT_SOFT }}>
            {note}
          </p>
        </header>
      </div>

      {/* 40px above the card for the crowns */}
      <div className="mt-10" style={{ paddingInline: GUTTER, ...rise(150) }}>
        <div ref={frameRef} className={`ct-frame mx-auto max-w-[25rem] ${frameIn ? "ct-in" : ""}`}>
          <img src="/art/contact/groom-mukut.webp" width={448} height={447} alt="" aria-hidden decoding="async" loading="lazy" className="ct-crown ct-crown-groom" />
          <img src="/art/contact/bride-mukut.webp" width={457} height={374} alt="" aria-hidden decoding="async" loading="lazy" className="ct-crown ct-crown-bride" />
          <span aria-hidden className="ct-lotus">
            <Lotus />
          </span>
          <Curl className="ct-curl ct-curl-l" />
          <Curl className="ct-curl ct-curl-r" />

          <div className="relative">
            {family.length > 0 && (
              <>
                <Label>The Families</Label>
                <ul className={`mt-3.5 grid gap-x-3 ${family.length > 1 ? "grid-cols-[1fr_1px_1fr]" : "grid-cols-1"}`}>
                  {family.map((p, i) => (
                    <FamilyCell key={p.role} person={p} divider={i > 0} onSoon={setSoon} />
                  ))}
                </ul>
                {soon?.group === "family" && <div className="mt-2 text-center">{status}</div>}
              </>
            )}

            {family.length > 0 && coordinators.length > 0 && <LotusRule />}

            {coordinators.length > 0 && (
              <>
                <Label>Coordinators</Label>
                <ul className="mt-1.5">
                  {coordinators.map((p, i) => (
                    <li key={p.role} className={`flex items-center gap-3 py-3 ${i > 0 ? "ct-row-rule" : ""}`}>
                      <div className="min-w-0 flex-1">
                        <Role color={GOLD}>{p.role}</Role>
                        <Name person={p} />
                        {p.note && (
                          <p className="font-serif text-[12.5px] italic leading-snug" style={{ color: TEXT_SOFT }}>
                            {p.note}
                          </p>
                        )}
                        {soon === p && <div className="mt-0.5">{status}</div>}
                      </div>
                      <Buttons person={p} onSoon={setSoon} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** One of the families: role in maroon, name, side in italics; the buttons at the foot, level with its neighbour's. */
function FamilyCell({ person, divider, onSoon }: { person: ContactPerson; divider: boolean; onSoon: (p: ContactPerson) => void }) {
  return (
    <>
      {divider && <li aria-hidden className="ct-vrule" />}
      <li className="flex min-w-0 flex-col items-center text-center">
        <Role color={MAROON}>{person.role}</Role>
        <Name person={person} />
        {person.note && (
          <p className="font-serif text-[13.5px] italic leading-snug" style={{ color: TEXT_SOFT }}>
            {person.note}
          </p>
        )}
        <div className="mt-auto pt-3">
          <Buttons person={person} onSoon={onSoon} />
        </div>
      </li>
    </>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-center font-sans text-[9.5px] font-semibold uppercase tracking-[0.24em]" style={{ color: GOLD }}>
      {children}
    </p>
  );
}

function Role({ color, children }: { color: string; children: ReactNode }) {
  return (
    <FitText tiers={ROLE_FIT} className="font-sans text-[10px] font-semibold uppercase leading-[1.3] tracking-[0.1em]" style={{ color }}>
      {children}
    </FitText>
  );
}

function Name({ person }: { person: ContactPerson }) {
  return (
    <FitText tiers={NAME_FIT} className="mt-0.5 font-serif text-[17px] font-semibold leading-[1.2]" style={{ color: "var(--c-text)" }}>
      {person.name ?? (showPlaceholders ? <Pending label="Name awaiting confirmation">Name to be added</Pending> : person.role)}
    </FitText>
  );
}

/** A round call button (filled) and a round WhatsApp button (outlined). */
function Buttons({ person, onSoon }: { person: ContactPerson; onSoon: (p: ContactPerson) => void }) {
  const { phone } = person;
  const live = hasNumber(person) && !demoMode; // the example wedding's numbers never dial
  const who = person.name ? plainName(person.name) : person.role;
  const why = demoMode ? "example number" : "number coming soon";

  return (
    <div className="flex shrink-0 gap-2">
      {live && phone ? (
        <>
          <RoundLink href={`tel:${digits(phone)}`} label={`Call ${who}`} filled>
            <PhoneIcon />
          </RoundLink>
          <RoundLink href={`https://wa.me/${digits(phone).replace(/^\+/, "")}?text=${encodeURIComponent(wedding.contact.whatsappMessage)}`} label={`WhatsApp ${who}`} external>
            <ChatIcon />
          </RoundLink>
        </>
      ) : (
        <>
          <RoundButton label={`Call ${who} (${why})`} filled onClick={() => onSoon(person)}>
            <PhoneIcon />
          </RoundButton>
          <RoundButton label={`WhatsApp ${who} (${why})`} onClick={() => onSoon(person)}>
            <ChatIcon />
          </RoundButton>
        </>
      )}
    </div>
  );
}

const roundClass = (filled: boolean) =>
  `inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border-[1.5px] transition-transform duration-200 ease-silk active:scale-95 ${
    filled ? "text-[#FBF3E4] shadow-[0_5px_10px_-7px_rgb(122_20_36/0.8)]" : "bg-transparent"
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

/** A small gold lotus. */
function Lotus({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-17 -14 34 20" aria-hidden className={className} fill="none" stroke={GOLD} strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round">
      <path d="M0-12C3.6-7.6 3.6-2.6 0 2-3.6-2.6-3.6-7.6 0-12Z" fill="#F3E2B6" />
      <path d="M0 2C-4.6 1.6-8.4-1.2-9.4-5.8-4.8-5.2-1.6-2.2 0 2ZM0 2C4.6 1.6 8.4-1.2 9.4-5.8 4.8-5.2 1.6-2.2 0 2Z" fill="#F8EBC8" />
      <path d="M-3.2 3.6C-9 3.8-13.4 1.6-15.4-2M3.2 3.6C9 3.8 13.4 1.6 15.4-2" />
      <circle cy="-4.4" r="1" fill={GOLD} stroke="none" />
    </svg>
  );
}

/** Between the families and the coordinators: fine gold lines either side of a lotus. */
function LotusRule() {
  return (
    <div aria-hidden className="my-4 flex items-center justify-center gap-2">
      <span className="h-px w-16" style={{ background: `linear-gradient(to right, transparent, ${GOLD})` }} />
      <Lotus className="h-auto w-[26px]" />
      <span className="h-px w-16" style={{ background: `linear-gradient(to left, transparent, ${GOLD})` }} />
    </div>
  );
}

/** A gold curl for a lower corner (drawn for the left; mirrored for the right). */
function Curl({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 26 26" aria-hidden className={className} fill="none" stroke={GOLD} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 23V12C3 6.8 6.2 3.6 10.4 3.6 13.4 3.6 15.2 6 14 8.4 12.9 10.4 10 10 9.9 7.9" />
      <path d="M3 23H14C19.2 23 22.4 19.8 22.4 15.6 22.4 12.6 20 10.8 17.6 12 15.6 13.1 16 16 18.1 16.1" />
      <path d="M3 23 8 18" />
      <circle cx="9.3" cy="16.7" r="1.25" fill={GOLD} stroke="none" />
      <circle cx="3" cy="23" r="1.2" fill={GOLD} stroke="none" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[17px] w-[17px]" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M6.5 3.5h-2a1 1 0 0 0-1 1.1A15 15 0 0 0 15.4 16.5a1 1 0 0 0 1.1-1v-2a1 1 0 0 0-.8-1l-2.3-.5a1 1 0 0 0-1 .3l-1 1a11 11 0 0 1-4.7-4.7l1-1a1 1 0 0 0 .3-1l-.5-2.3a1 1 0 0 0-1-.8Z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[17px] w-[17px]" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3.5c4 0 7 2.6 7 5.9s-3 5.9-7 5.9c-.9 0-1.8-.1-2.6-.4L4 16.2l1-2.9C3.8 12.2 3 10.9 3 9.4 3 6.1 6 3.5 10 3.5Z" />
      <path d="M7 9.5h.01M10 9.5h.01M13 9.5h.01" strokeWidth="2" />
    </svg>
  );
}
