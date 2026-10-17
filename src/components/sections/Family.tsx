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
const NAME = "#7A1F1F";
const BLESSING = "#8A6A4A";
const LABEL = "#7A3B2E";
/** A veil of the page cream over the background flowers (about 30% of them show), soft at the section's top and bottom. */
const VEIL = "linear-gradient(to bottom, rgb(var(--page) / 0), rgb(var(--page) / 0.7) 72px, rgb(var(--page) / 0.7) calc(100% - 72px), rgb(var(--page) / 0))";
/** The portrait's edges fade into the page. */
const PORTRAIT_MASK = "radial-gradient(ellipse 72% 68% at center, #000 60%, transparent 100%)";

/**
 * Section 06 — The Families, after the couple's design.
 * A gold filigree crest over "THE FAMILIES" (gold and maroon), "Bound by
 * Love, Blessed by Family" and a lotus divider; the couple with both sets of
 * parents, its edges fading into the page; the parents of the groom and of
 * the bride side by side, each with their family's blessing; "|| ବସୁଧୈବ
 * କୁଟୁମ୍ବକମ୍ ||" (the world is one family); and Lord Jagannath between two
 * scrolls over Jai Jagannath.
 */
export function Family() {
  const { heading, tagline, art, groom, bride, odiaLine, closing } = wedding.family;
  const [lead, ...rest] = heading.split(" ");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.12 });

  const rise = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(12px)",
    transition: `opacity 800ms ${EASE.silk} ${delay}ms, transform 900ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section ref={ref} id="family" aria-labelledby="family-heading" className="py-20 text-center" style={{ paddingInline: "calc(100% * 35 / 768 + 16px)", backgroundImage: VEIL }}>
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

        {/* The couple with both sets of parents, a little wider than the text, its edges fading into the page */}
        {art && (
          <img
            src={art.src}
            width={art.w}
            height={art.h}
            alt={art.alt}
            loading="lazy"
            decoding="async"
            className="-mx-[14px] mt-4 block h-auto w-[calc(100%+28px)] max-w-none"
            style={{ ...rise(320), WebkitMaskImage: PORTRAIT_MASK, maskImage: PORTRAIT_MASK }}
          />
        )}

        {/* The parents of the groom and of the bride */}
        <div className="-mx-3 mt-4 grid grid-cols-2 gap-x-3" style={rise(420)}>
          <Parents side={groom} />
          <Parents side={bride} />
        </div>

        {odiaLine && (
          <p lang="or" className="t-odia mt-9 text-[17.5px] font-normal" style={{ ...rise(620), color: MAROON }}>
            {/* the bars in gold, the words in maroon, as in the heading */}
            {odiaLine.split(/(||)/).map((part, i) => (part === "||" ? <span key={i} style={{ color: GOLD_TEXT }}>{part}</span> : part))}
          </p>
        )}

        {/* Lord Jagannath between two scrolls, over Jai Jagannath */}
        <div aria-hidden className="mx-auto mt-5 flex items-center justify-center gap-2" style={rise(720)}>
          <Scroll />
          <img src="/art/family/jagannath.png" width={76} height={106} alt="" decoding="async" loading="lazy" className="block h-16 w-auto" style={{ filter: "brightness(0.86) contrast(1.3) saturate(1.2)" }} />
          <Scroll mirrored />
        </div>
        <p className="t-blessing mt-[10px]" style={{ ...rise(820), color: "var(--c-text)" }}>
          {closing}
        </p>
      </div>
    </section>
  );
}

/** Keeps a title (Sri, Smt.) on the same line as the first name. */
const withTitle = (name: string) => name.replace(/^(Sri|Shri|Smt\.?|Srimati|Late|Dr\.?)\s+/, "$1\u00A0");

/** One side: "Parents of the Groom", each parent on a line of their own, and their family's blessing. */
function Parents({ side }: { side: FamilySide }) {
  const [a, b] = side.parents;
  return (
    <div>
      <p className="t-label whitespace-nowrap text-[10px] tracking-[0.14em] min-[380px]:text-[10.5px]" style={{ color: LABEL }}>
        {side.label}
      </p>
      {side.parents.length > 0 ? (
        <p className="mt-2 font-serif text-[16.5px] font-medium leading-snug" style={{ color: NAME }}>
          <span className="block [text-wrap:balance]">{withTitle(a)}</span>
          {b && <span className="block [text-wrap:balance]">&amp;&nbsp;{withTitle(b)}</span>}
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
      {side.blessing && (
        <p className="mt-[6px] font-serif text-[13px] italic leading-snug" style={{ color: BLESSING }}>
          {side.blessing}
        </p>
      )}
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

/** A small gold scroll beside Lord Jagannath. */
function Scroll({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <svg viewBox="0 0 70 16" className={`h-4 w-[4.4rem] ${mirrored ? "-scale-x-100" : ""}`} aria-hidden fill="none" stroke={GOLD} strokeWidth="1.1" strokeLinecap="round">
      <path d="M68 8C56 8 46 8 36 8M36 8C30 8 26 3 21 4 17 5 17 11 21 11.5 24 12 25 9 23 8" />
      <circle cx="10" cy="8" r="1.4" fill={GOLD} stroke="none" />
    </svg>
  );
}
