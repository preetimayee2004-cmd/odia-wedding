import { useRef } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Pending } from "@/components/ui/Pending";

type Person = (typeof wedding.contact.people)[number];

const PLACEHOLDERS: Person[] = [
  { name: "Family contact", relation: "Bride's side", phone: "+91 00000 00000", whatsapp: true },
  { name: "Family contact", relation: "Groom's side", phone: "+91 00000 00000", whatsapp: true },
];

export const hasContacts = wedding.contact.people.length > 0;

/**
 * Section 12 — Contact.
 * Identity: each card is revealed by a circular wipe that opens from its
 * top corner, one after another.
 */
export function Contact() {
  const { heading, note, people } = wedding.contact;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.2 });

  if (!hasContacts && !import.meta.env.DEV) return null;
  const list = hasContacts ? people : PLACEHOLDERS;

  return (
    <section ref={ref} id="contact" aria-labelledby="contact-heading" className="section text-center">
      <div style={{ opacity: inView ? 1 : 0, transition: `opacity 900ms ${EASE.silk}` }}>
        <h2 id="contact-heading" className="text-[2.25rem]">
          {heading}
        </h2>
        <GoldDivider className="mt-4" />
        <p className="mx-auto mt-4 max-w-[18rem] text-[0.875rem] text-ink-soft">{note}</p>
      </div>

      <ul className="mt-8 space-y-4">
        {list.map((p, i) => (
          <li
            key={`${p.name}-${i}`}
            style={{
              clipPath: inView ? "circle(150% at 0% 0%)" : "circle(0% at 0% 0%)",
              transition: `clip-path 1100ms ${EASE.silk} ${250 + i * 180}ms`,
            }}
          >
            {hasContacts ? (
              <ContactCard person={p} />
            ) : (
              <Pending label="Contacts not added yet">
                <ContactCard person={p} />
              </Pending>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ContactCard({ person }: { person: Person }) {
  const digits = person.phone.replace(/[^\d+]/g, "");
  const wa = `https://wa.me/${digits.replace(/^\+/, "")}?text=${encodeURIComponent(wedding.contact.whatsappMessage)}`;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gold/45 bg-cream-light px-5 py-4 text-left">
      <div className="min-w-0 flex-1">
        {person.relation && <p className="eyebrow">{person.relation}</p>}
        <p className="mt-0.5 font-display text-[1.35rem] font-medium leading-tight text-ink">{person.name}</p>
        <p className="mt-0.5 text-[0.8125rem] text-ink-soft">{person.phone}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <IconLink href={`tel:${digits}`} label={`Call ${person.name}`}>
          <path d="M6.5 3.5h-2a1 1 0 0 0-1 1.1A15 15 0 0 0 15.4 16.5a1 1 0 0 0 1.1-1v-2a1 1 0 0 0-.8-1l-2.3-.5a1 1 0 0 0-1 .3l-1 1a11 11 0 0 1-4.7-4.7l1-1a1 1 0 0 0 .3-1l-.5-2.3a1 1 0 0 0-1-.8Z" />
        </IconLink>
        {person.whatsapp && (
          <IconLink href={wa} label={`WhatsApp ${person.name}`} external>
            <path d="M3.5 16.5l1-3.4a7 7 0 1 1 2.6 2.5l-3.6.9Z" />
            <path d="M8 7.5c0 2.5 2 4.5 4.5 4.5l.8-1-1.4-.7-.6.6a3 3 0 0 1-1.7-1.7l.6-.6-.7-1.4-1 .8Z" />
          </IconLink>
        )}
      </div>
    </div>
  );
}

function IconLink({
  href,
  label,
  external,
  children,
}: {
  href: string;
  label: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sindoor/35 text-sindoor transition duration-200 ease-silk active:scale-95 active:bg-sindoor/5"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" aria-hidden>
        {children}
      </svg>
    </a>
  );
}
