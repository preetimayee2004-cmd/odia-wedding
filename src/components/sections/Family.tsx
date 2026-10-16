import { useRef, type CSSProperties } from "react";
import { wedding, type FamilySide } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { showPlaceholders } from "@/lib/placeholders";
import { LotusIcon } from "@/components/art/Ganesha";
import { PranamHands } from "@/components/art/PranamHands";
import { Pending } from "@/components/ui/Pending";

const GOLD = "#B8893A";

/**
 * Section 06 — Family, after the couple's design.
 * Their names, "Bound by Love, Blessed by Family" and a gold lotus divider;
 * the couple with both sets of parents; the parents of the groom and of the
 * bride side by side, each with their family's blessing; "|| ବସୁଧୈବ
 * କୁଟୁମ୍ବକମ୍ ||" (the world is one family); and pranam hands over Jai
 * Jagannath.
 */
export function Family() {
  const { tagline, art, groom, bride, odiaLine, closing } = wedding.family;
  const [first, second] = wedding.invitation.names;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.12 });

  const rise = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(12px)",
    transition: `opacity 800ms ${EASE.silk} ${delay}ms, transform 900ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section ref={ref} id="family" aria-labelledby="family-heading" className="py-20 text-center" style={{ paddingInline: "calc(100% * 35 / 768 + 16px)" }}>
      <div className="mx-auto max-w-[24rem]">
        {/* The couple's names */}
        <h2 id="family-heading" className="t-names" style={rise(0)}>
          {first} <span className="t-amp">&amp;</span> {second}
        </h2>
        <p className="t-body mt-1.5 text-[20px]" style={rise(120)}>
          {tagline}
        </p>
        <div aria-hidden className="mx-auto mt-3 flex w-44 items-center gap-2" style={rise(220)}>
          <span className="h-px flex-1" style={{ backgroundImage: `linear-gradient(to left, ${GOLD}, transparent)` }} />
          <LotusIcon className="h-4 w-auto" />
          <span className="h-px flex-1" style={{ backgroundImage: `linear-gradient(to right, ${GOLD}, transparent)` }} />
        </div>

        {/* The couple with both sets of parents, its edges fading into the page */}
        {art && (
          <img
            src={art.src}
            width={art.w}
            height={art.h}
            alt={art.alt}
            loading="lazy"
            decoding="async"
            className="mx-auto mt-6 block h-auto w-full"
            style={{
              ...rise(320),
              WebkitMaskImage: "radial-gradient(closest-side, #000 78%, transparent 100%)",
              maskImage: "radial-gradient(closest-side, #000 78%, transparent 100%)",
            }}
          />
        )}

        {/* The parents of the groom and of the bride */}
        <div className="mt-6 grid grid-cols-2 gap-x-3" style={rise(460)}>
          <Parents side={groom} />
          <Parents side={bride} />
        </div>

        {odiaLine && (
          <p lang="or" className="t-odia mt-9 text-[22px]" style={rise(600)}>
            {odiaLine}
          </p>
        )}

        {/* Pranam hands between two flourishes, over Jai Jagannath */}
        <div aria-hidden className="mx-auto mt-5 flex items-center justify-center gap-2" style={rise(700)}>
          <Flourish />
          <PranamHands className="h-12 w-auto" color="#A6782C" drawn={inView} duration={1800} />
          <Flourish mirrored />
        </div>
        <p className="t-blessing mt-2" style={{ ...rise(800), color: "var(--c-text)" }}>
          {closing}
        </p>
      </div>
    </section>
  );
}

/** One side: "Parents of the Groom", the two names, and their family's blessing. */
function Parents({ side }: { side: FamilySide }) {
  const [a, b] = side.parents;
  return (
    <div>
      <p className="t-label whitespace-nowrap text-[10.5px] tracking-[1px]" style={{ color: "var(--c-text)" }}>
        {side.label}
      </p>
      {side.parents.length > 0 ? (
        <p className="mt-1.5 font-serif text-[18px] font-semibold leading-snug" style={{ color: "var(--c-text)" }}>
          {b ? (
            <>
              {a} &amp;
              <br />
              {b}
            </>
          ) : (
            a
          )}
        </p>
      ) : (
        showPlaceholders && (
          <div className="mt-1.5">
            <Pending label="Names awaiting confirmation">
              <p className="font-serif text-[19px] italic">Names to come</p>
            </Pending>
          </div>
        )
      )}
      {side.blessing && <p className="t-body mt-2 text-[17px] leading-snug">{side.blessing}</p>}
    </div>
  );
}

/** A small gold scroll beside the pranam hands. */
function Flourish({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <svg viewBox="0 0 60 16" className={`h-4 w-[3.75rem] ${mirrored ? "-scale-x-100" : ""}`} fill="none" stroke={GOLD} strokeWidth="1.1" strokeLinecap="round">
      <path d="M58 8C46 8 38 8 30 8M30 8C24 8 20 3 15 4 11 5 11 11 15 11.5 18 12 19 9 17 8" />
      <circle cx="6" cy="8" r="1.4" fill={GOLD} stroke="none" />
    </svg>
  );
}
