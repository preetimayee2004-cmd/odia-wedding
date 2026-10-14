import { useRef, type CSSProperties } from "react";
import { wedding, type Elder, type FamilySide } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { Dipa } from "@/components/art/Dipa";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Pending } from "@/components/ui/Pending";

type TierKey = "grandparents" | "parents";

// Centres of the two columns (grid gap-3), where each family's lineage line runs.
const LINE_LEFT = "left-[calc((100%_-_0.75rem)/4)]";
const LINE_RIGHT = "right-[calc((100%_-_0.75rem)/4)]";
const CORNERS = ["-left-[3px] -top-[3px]", "-right-[3px] -top-[3px]", "-bottom-[3px] -left-[3px]", "-bottom-[3px] -right-[3px]"];

/**
 * Section 06 — Gurujana Pranam (Salutation to Elders).
 * An elite hierarchical grid: Aja & Aai above, Pitra-Matra below, each
 * family's lineage descending in its own column of crisp gold boxes. A
 * flickering brass dipa burns beside the names of departed elders.
 * Hidden in production until the family confirms at least one name.
 */
export function Family() {
  const { heading, odiaHeading, gloss, bride, groom } = wedding.family;
  const headerRef = useRef<HTMLDivElement>(null);
  const headsRef = useRef<HTMLDivElement>(null);
  const headerIn = useInView(headerRef);
  const headsIn = useInView(headsRef, { threshold: 0.5 });

  const sides = [bride, groom];
  const named = (t: TierKey) => sides.some((s) => s[t].length > 0);
  const tiers = (["grandparents", "parents"] as const).filter((t) => import.meta.env.DEV || named(t));
  if (tiers.length === 0) return null;

  return (
    <section id="family" aria-labelledby="family-heading" className="section text-center">
      <div ref={headerRef} style={{ opacity: headerIn ? 1 : 0, transition: `opacity 900ms ${EASE.silk}` }}>
        {odiaHeading && (
          <p lang="or" className="odia text-base text-sindoor/85">
            {odiaHeading}
          </p>
        )}
        <h2 id="family-heading" className="mt-1 text-[2.25rem]">
          {heading}
        </h2>
        <p className="mt-1 font-display text-base italic text-ink-soft">{gloss}</p>
        <GoldDivider className="mt-4" />
      </div>

      <div className="mx-auto mt-10 max-w-[34rem]">
        {/* Each family heads its own column */}
        <div ref={headsRef} className="grid grid-cols-2 gap-3" style={fade(headsIn, 0)}>
          {sides.map((side) => (
            <FamilyHead key={side.label} side={side} />
          ))}
        </div>

        {tiers.map((t, i) => (
          <Tier key={t} tier={t} sides={sides} last={i === tiers.length - 1} />
        ))}
      </div>
    </section>
  );
}

function FamilyHead({ side }: { side: FamilySide }) {
  return (
    <div>
      <p className="text-[0.625rem] font-medium uppercase tracking-[0.16em] text-ink-soft">{side.label}</p>
      {side.familyName ? (
        <p className="mt-1 font-display text-lg italic leading-snug text-sindoor">{side.familyName}</p>
      ) : (
        <Pending label="Family name awaiting confirmation">
          <p className="font-display text-lg italic">Family name</p>
        </Pending>
      )}
    </div>
  );
}

/** One generation: its label threaded on the lineage lines, then a gold box per family. */
function Tier({ tier, sides, last }: { tier: TierKey; sides: FamilySide[]; last: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const { label, odia, gloss } = wedding.family.tiers[tier];
  const grow: CSSProperties = {
    transform: inView ? "none" : "scaleY(0)",
    transition: `transform 800ms ${EASE.silk}`,
  };

  return (
    <div ref={ref} role="group" aria-label={`${label} (${gloss})`}>
      <div className="relative py-5">
        <span aria-hidden className={`absolute bottom-0 top-0 w-px origin-top bg-gold/70 ${LINE_LEFT}`} style={grow} />
        <span aria-hidden className={`absolute bottom-0 top-0 w-px origin-top bg-gold/70 ${LINE_RIGHT}`} style={grow} />
        <div className="mx-auto max-w-[9.5rem]" style={fade(inView, 200)}>
          {odia && (
            <p lang="or" className="odia text-[0.95rem] leading-tight text-sindoor/85">
              {odia}
            </p>
          )}
          <h3 className="mt-0.5 text-[0.6875rem] font-medium uppercase tracking-eyebrow text-ink">{label}</h3>
          <p className="font-display text-sm italic text-ink-soft">{gloss}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sides.map((side, i) => (
          <ElderBox key={side.label} elders={side[tier]} family={side.label} style={fade(inView, 350 + i * 140, 14)} />
        ))}
      </div>

      {last && <Confluence style={fade(inView, 700)} />}
    </div>
  );
}

function ElderBox({ elders, family, style }: { elders: Elder[]; family: string; style: CSSProperties }) {
  if (elders.length === 0 && !import.meta.env.DEV) return <div />;
  return (
    <div
      className="relative flex h-full flex-col justify-center border border-gold bg-cream-light px-2.5 py-4 shadow-[inset_0_0_0_3px_rgb(var(--cream-light)),inset_0_0_0_4px_rgb(var(--gold)/0.55)]"
      style={style}
    >
      {CORNERS.map((c) => (
        <span key={c} aria-hidden className={`absolute h-[6px] w-[6px] rotate-45 bg-gold ${c}`} />
      ))}
      {elders.length > 0 ? (
        <ul aria-label={family} className="space-y-1.5">
          {elders.map((e, i) => (
            <li key={e.name} className="font-display text-[1.02rem] leading-snug text-ink">
              {e.late && (
                <Dipa className="mr-1 inline-block h-[1.2em] w-[0.88em] align-[-0.22em]" delay={i * 430 + family.length * 97} />
              )}
              {e.name}
            </li>
          ))}
        </ul>
      ) : (
        <Pending label="Names awaiting confirmation from the family">
          <p className="font-display text-sm italic">Names to come</p>
        </Pending>
      )}
    </div>
  );
}

/** The two lineages meet below the parents, where the couple's paths unite. */
function Confluence({ style }: { style: CSSProperties }) {
  return (
    <div aria-hidden className="relative h-10" style={style}>
      <span className={`absolute top-0 h-1/2 w-px bg-gold/70 ${LINE_LEFT}`} />
      <span className={`absolute top-0 h-1/2 w-px bg-gold/70 ${LINE_RIGHT}`} />
      <span className={`absolute top-1/2 h-px bg-gold/70 ${LINE_LEFT} ${LINE_RIGHT}`} />
      <span className="absolute left-1/2 top-1/2 h-1/2 w-px bg-gold/70" />
      <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 bg-gold" />
    </div>
  );
}

function fade(inView: boolean, delay: number, rise = 0): CSSProperties {
  return {
    opacity: inView ? 1 : 0,
    transform: inView || !rise ? undefined : `translateY(${rise}px)`,
    transition: `opacity 800ms ${EASE.silk} ${delay}ms, transform 900ms ${EASE.silk} ${delay}ms`,
  };
}
