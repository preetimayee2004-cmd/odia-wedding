import { useRef, type CSSProperties } from "react";
import { wedding, type Elder, type FamilySide } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { showPlaceholders } from "@/lib/placeholders";
import { EASE } from "@/lib/motion";
import { Dipa } from "@/components/art/Dipa";
import { Pending } from "@/components/ui/Pending";

type TierKey = "grandparents" | "parents" | "siblings";

const CRIMSON = "#800000";
const GOLD = "#D4AF37";
const TEXT = "#FBEBD0";
const TEXT_SOFT = "#E6C9A2";

// Centres of the two columns (grid gap-3), where each family's lineage line runs.
const LINE_LEFT = "left-[calc((100%_-_0.75rem)/4)]";
const LINE_RIGHT = "right-[calc((100%_-_0.75rem)/4)]";
const CORNERS = ["-left-[3px] -top-[3px]", "-right-[3px] -top-[3px]", "-bottom-[3px] -left-[3px]", "-bottom-[3px] -right-[3px]"];

/**
 * Section 06 — Gurujana Pranam (Salutation to Elders).
 * A formal hierarchical grid on deep crimson: Aja & Aai (flanked by two
 * flickering golden dipas), then Pitra-Matra, then Suhuda-Varga, each
 * family's lineage descending in its own column of gold-bordered blocks. A
 * dipa also burns beside the names of departed elders.
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
  const tiers = (["grandparents", "parents", "siblings"] as const).filter((t) => showPlaceholders || named(t));
  if (tiers.length === 0) return null;

  return (
    <section
      id="family"
      aria-labelledby="family-heading"
      data-status-tone="light"
      className="relative px-[var(--gutter)] py-[var(--section-y)] text-center"
      style={{ backgroundColor: CRIMSON, color: TEXT }}
    >

      <div ref={headerRef} className="relative" style={{ opacity: headerIn ? 1 : 0, transition: `opacity 900ms ${EASE.silk}` }}>
        {odiaHeading && (
          <p lang="or" className="odia text-base" style={{ color: TEXT_SOFT }}>
            {odiaHeading}
          </p>
        )}
        <h2 id="family-heading" className="mt-1 text-[2.1rem] leading-tight" style={{ color: TEXT }}>
          {heading}
        </h2>
        <p className="mt-1 font-display text-base italic" style={{ color: TEXT_SOFT }}>
          {gloss}
        </p>
        <GoldRule />
      </div>

      <div className="relative mx-auto mt-10 max-w-[34rem]">
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

function GoldRule() {
  return (
    <span aria-hidden className="mx-auto mt-4 flex w-44 items-center gap-2">
      <span className="h-px flex-1" style={{ background: `linear-gradient(to left, ${GOLD}, transparent)` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: GOLD }} />
      <span className="h-px flex-1" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
    </span>
  );
}

function FamilyHead({ side }: { side: FamilySide }) {
  return (
    <div>
      <p className="text-[0.625rem] font-medium uppercase tracking-[0.16em]" style={{ color: TEXT_SOFT }}>
        {side.label}
      </p>
      {side.familyName ? (
        <p className="mt-1 font-display text-lg italic leading-snug" style={{ color: GOLD }}>
          {side.familyName}
        </p>
      ) : (
        <Pending label="Family name awaiting confirmation">
          <p className="font-display text-lg italic">Family name</p>
        </Pending>
      )}
    </div>
  );
}

/** One generation: its label threaded on the lineage lines, then a gold block per family. */
function Tier({ tier, sides, last }: { tier: TierKey; sides: FamilySide[]; last: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const { label, odia, gloss } = wedding.family.tiers[tier];
  const grow: CSSProperties = {
    transform: inView ? "none" : "scaleY(0)",
    transition: `transform 800ms ${EASE.silk}`,
    backgroundColor: `${GOLD}B3`,
  };
  const lamps = tier === "grandparents";

  return (
    <div ref={ref} role="group" aria-label={`${label} (${gloss})`}>
      <div className="relative py-5">
        <span aria-hidden className={`absolute bottom-0 top-0 w-px origin-top ${LINE_LEFT}`} style={grow} />
        <span aria-hidden className={`absolute bottom-0 top-0 w-px origin-top ${LINE_RIGHT}`} style={grow} />
        <div className="mx-auto flex max-w-[13rem] items-center justify-center gap-2" style={fade(inView, 200)}>
          {lamps && <Dipa className="h-9 w-[1.65rem] shrink-0" delay={0} decorative />}
          <div className="max-w-[9.5rem] px-1" style={{ backgroundColor: CRIMSON }}>
            {odia && (
              <p lang="or" className="odia text-[0.95rem] leading-tight" style={{ color: TEXT_SOFT }}>
                {odia}
              </p>
            )}
            <h3 className="mt-0.5 text-[0.6875rem] font-medium uppercase tracking-eyebrow" style={{ color: GOLD }}>
              {label}
            </h3>
            <p className="font-display text-sm italic" style={{ color: TEXT_SOFT }}>
              {gloss}
            </p>
          </div>
          {lamps && <Dipa className="h-9 w-[1.65rem] shrink-0" delay={760} decorative />}
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
  if (elders.length === 0 && !showPlaceholders) return <div />;
  return (
    <div
      className="relative flex h-full flex-col justify-center border px-2.5 py-4"
      style={{
        ...style,
        borderColor: GOLD,
        backgroundColor: "#6A0000",
        boxShadow: `inset 0 0 0 3px #6A0000, inset 0 0 0 4px ${GOLD}80, 0 6px 16px -10px rgb(0 0 0 / 0.6)`,
      }}
    >
      {CORNERS.map((c) => (
        <span key={c} aria-hidden className={`absolute h-[6px] w-[6px] rotate-45 ${c}`} style={{ backgroundColor: GOLD }} />
      ))}
      {elders.length > 0 ? (
        <ul aria-label={family} className="space-y-1.5">
          {elders.map((e, i) => (
            <li key={e.name} className="font-display text-[1.02rem] leading-snug" style={{ color: TEXT }}>
              {e.late && (
                <Dipa className="mr-1 inline-block h-[1.2em] w-[0.88em] align-[-0.22em]" delay={i * 430 + family.length * 97} />
              )}
              {e.name}
            </li>
          ))}
        </ul>
      ) : (
        <Pending label="Names awaiting confirmation from the family">
          <p className="font-display text-sm italic" style={{ color: TEXT }}>
            Names to come
          </p>
        </Pending>
      )}
    </div>
  );
}

/** The two lineages meet below the last tier, where the couple's paths unite. */
function Confluence({ style }: { style: CSSProperties }) {
  const line = { backgroundColor: `${GOLD}B3` };
  return (
    <div aria-hidden className="relative h-10" style={style}>
      <span className={`absolute top-0 h-1/2 w-px ${LINE_LEFT}`} style={line} />
      <span className={`absolute top-0 h-1/2 w-px ${LINE_RIGHT}`} style={line} />
      <span className={`absolute top-1/2 h-px ${LINE_LEFT} ${LINE_RIGHT}`} style={line} />
      <span className="absolute left-1/2 top-1/2 h-1/2 w-px" style={line} />
      <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45" style={{ backgroundColor: GOLD }} />
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
