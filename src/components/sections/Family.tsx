import { useRef, type CSSProperties } from "react";
import { wedding, type FamilySide } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { showPlaceholders } from "@/lib/placeholders";
import { LotusIcon } from "@/components/art/Ganesha";
import { Pending } from "@/components/ui/Pending";

const GOLD = "#B8893A";
const GOLD_TEXT = "#A6782C";
const MAROON = "#7A1424";

/**
 * Section 06 — The Families, after the couple's design.
 * A gold filigree crest over "THE FAMILIES" (gold and maroon), "Bound by
 * Love, Blessed by Family" and a lotus divider; the couple with both sets of
 * parents; FAMILY BLESSINGS between gold flourishes, over the parents of the
 * groom and of the bride side by side, each with their family's blessing;
 * "|| ବସୁଧୈବ କୁଟୁମ୍ବକମ୍ ||" (the world is one family); and Lord Jagannath
 * between two scrolls over Jai Jagannath.
 */
export function Family() {
  const { heading, tagline, blessingsHeading, art, groom, bride, odiaLine, closing } = wedding.family;
  const [lead, ...rest] = heading.split(" ");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.12 });

  const rise = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(12px)",
    transition: `opacity 800ms ${EASE.silk} ${delay}ms, transform 900ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section
      ref={ref}
      id="family"
      aria-labelledby="family-heading"
      className="py-20 text-center"
      // a veil of the page cream over the background flowers, so none sit behind the portrait or the names
      style={{ paddingInline: "calc(100% * 35 / 768 + 16px)", backgroundColor: "rgb(var(--page) / 0.75)" }}
    >
      <div className="mx-auto max-w-[24rem]">
        {/* The crest and heading */}
        <div style={rise(0)}>
          <Crest className="mx-auto block h-auto w-[13rem]" />
          <h2 id="family-heading" className="mt-1 font-serif text-[36px] font-semibold uppercase leading-none tracking-[2px]">
            <span style={{ color: GOLD_TEXT }}>{lead}</span> <span style={{ color: MAROON }}>{rest.join(" ")}</span>
          </h2>
        </div>
        <p className="t-body mt-3 text-[20px]" style={rise(120)}>
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
            className="mx-auto mt-4 block h-auto w-[calc(100%+1.5rem)] max-w-none -translate-x-3"
            style={{
              ...rise(320),
              WebkitMaskImage: "radial-gradient(closest-side, #000 80%, transparent 100%)",
              maskImage: "radial-gradient(closest-side, #000 80%, transparent 100%)",
            }}
          />
        )}

        {/* FAMILY BLESSINGS, between flourishes */}
        <div className="mt-3 flex items-center justify-center gap-2" style={rise(420)}>
          <Flourish />
          <h3 className="whitespace-nowrap font-serif text-[22px] font-semibold uppercase leading-none tracking-[1.5px]" style={{ color: GOLD_TEXT }}>
            {blessingsHeading}
          </h3>
          <Flourish mirrored />
        </div>

        {/* The parents of the groom and of the bride */}
        <div className="mt-5 grid grid-cols-2 gap-x-3" style={rise(500)}>
          <Parents side={groom} />
          <Parents side={bride} />
        </div>

        {odiaLine && (
          <p lang="or" className="t-odia mt-9 text-[22px]" style={rise(620)}>
            {odiaLine}
          </p>
        )}

        {/* Lord Jagannath between two scrolls, over Jai Jagannath */}
        <div aria-hidden className="mx-auto mt-5 flex items-center justify-center gap-2" style={rise(720)}>
          <Scroll />
          <img src="/art/family/jagannath.png" width={76} height={106} alt="" decoding="async" loading="lazy" className="h-16 w-auto" />
          <Scroll mirrored />
        </div>
        <p className="t-blessing mt-2" style={{ ...rise(820), color: "var(--c-text)" }}>
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
      <p className="t-label whitespace-nowrap text-[10.5px] tracking-[1px]" style={{ color: "#7A3B2E" }}>
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
              <p className="font-serif text-[18px] italic">Names to come</p>
            </Pending>
          </div>
        )
      )}
      {side.blessing && <p className="t-body mt-2 text-[17px] leading-snug">{side.blessing}</p>}
    </div>
  );
}

/** The gold filigree crest over the heading: scrolls either side of a small kalash. */
function Crest({ className = "" }: { className?: string }) {
  const half = (
    <g fill="none" stroke={GOLD} strokeWidth="1.1" strokeLinecap="round">
      <path d="M100 30C86 30 78 22 66 24 56 26 54 35 62 36 68 37 69 30 64 30" />
      <path d="M92 25C86 14 72 10 60 15 52 18 52 26 58 26" />
      <path d="M66 24C54 18 42 22 34 28 28 32 20 32 12 30" />
      <path d="M40 25C36 19 30 18 26 21" />
      <path d="M50 33C42 36 32 36 24 34" strokeWidth="0.8" />
      <circle cx="8" cy="30" r="1.6" fill={GOLD} stroke="none" />
      <circle cx="22" cy="24" r="1" fill={GOLD} stroke="none" />
    </g>
  );
  return (
    <svg viewBox="0 0 220 42" className={className} aria-hidden>
      {half}
      <g transform="matrix(-1 0 0 1 220 0)">{half}</g>
      {/* the kalash */}
      <g fill={GOLD}>
        <path d="M101 34C99 27 104 22 110 22 116 22 121 27 119 34Z" />
        <path d="M104 22H116L114 19H106Z" />
        <path d="M110 19C106 16 104 11 106 6 108 9 109 12 110 15 111 12 112 9 114 6 116 11 114 16 110 19Z" />
        <circle cx="110" cy="3" r="1.6" />
        <path d="M98 36H122" stroke={GOLD} strokeWidth="1.2" />
      </g>
    </svg>
  );
}

/** A gold flourish beside FAMILY BLESSINGS. */
function Flourish({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <svg viewBox="0 0 64 22" className={`h-5 w-14 shrink-0 ${mirrored ? "-scale-x-100" : ""}`} aria-hidden fill="none" stroke={GOLD} strokeWidth="1.1" strokeLinecap="round">
      <path d="M2 11H24" />
      <path d="M24 11C30 11 33 5 39 5 45 5 46 12 41 13 37 14 36 9 39 9" />
      <path d="M24 11C30 11 33 17 39 17 45 17 46 10 41 9" />
      <path d="M46 11C50 7 55 7 58 11 55 15 50 15 46 11Z" fill={`${GOLD}33`} />
      <circle cx="62" cy="11" r="1.3" fill={GOLD} stroke="none" />
    </svg>
  );
}

/** A small gold scroll beside Lord Jagannath. */
function Scroll({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <svg viewBox="0 0 70 16" className={`h-4 w-[4.4rem] ${mirrored ? "-scale-x-100" : ""}`} aria-hidden fill="none" stroke={GOLD} strokeWidth="1.1" strokeLinecap="round">
      <path d="M68 8C56 8 46 8 36 8M36 8C30 8 26 3 21 4 17 5 17 11 21 11.5 24 12 25 9 23 8" />
      <circle cx="10" cy="8" r="1.4" fill={GOLD} stroke="none" />
    </svg>
  );
}
