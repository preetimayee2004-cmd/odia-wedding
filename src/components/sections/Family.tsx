import { useRef, type CSSProperties } from "react";
import { wedding, type FamilySide } from "@/config/wedding";
import { JhotiRule } from "@/components/ui/JhotiThreshold";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { showPlaceholders } from "@/lib/placeholders";
import { GoldFrame } from "@/components/art/GoldFrame";
import { Pending } from "@/components/ui/Pending";

const GOLD = "#B8893A";
const GOLD_TEXT = "#A6782C";
const MAROON = "#7A1424";
const NAME = "#6B1C2C";
const TEXT_SOFT = "#6B4A3A";
const LABEL = "#8A6526"; // the cards' small capitals, a deeper gold for legibility
/** The page cream over the background flowers, so none sit behind the portrait or the text; soft at the section's top and bottom. */
const VEIL = "linear-gradient(to bottom, rgb(var(--page) / 0), rgb(var(--page)) 72px, rgb(var(--page)) calc(100% - 72px), rgb(var(--page) / 0))";
/** Where the four faint corner flowers sit, and how each is turned. */
const CORNER_FLOWERS = ["left-[calc(100%*35/768+4px)] top-[14px]", "right-[calc(100%*35/768+4px)] top-[14px] rotate-[22deg]", "bottom-[20px] left-[calc(100%*35/768+4px)] rotate-[12deg]", "bottom-[20px] right-[calc(100%*35/768+4px)] -rotate-[10deg]"];
/** The portrait's edges fade into the page. */
const PORTRAIT_MASK = "radial-gradient(ellipse 72% 68% at center, #000 60%, transparent 100%)";

/**
 * Section 06 — The Families, after the couple's design, kept quiet.
 * The gold filigree crest; "TWO FAMILIES · ONE CELEBRATION" over "Our
 * Families", its jhoti rule and "Bound by Love, Blessed by Family"; the couple
 * with both sets of parents, its edges fading into the page; the groom's and
 * the bride's families one above the other in matching compact gold frames
 * (label, names, blessing); "Together, our families become one."; "|| ବସୁଧୈବ
 * କୁଟୁମ୍ବକମ୍ ||" (the world is one family). The page's flowers are veiled
 * here, leaving four faint ones in the corners.
 */
export function Family() {
  const { eyebrow, heading, tagline, art, groom, bride, together, odiaLine } = wedding.family;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.12 });

  const rise = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(12px)",
    transition: `opacity 800ms ${EASE.silk} ${delay}ms, transform 900ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section ref={ref} id="family" aria-labelledby="family-heading" className="relative overflow-hidden py-7 text-center" style={{ paddingInline: "calc(100% * 35 / 768 + 16px)", backgroundImage: VEIL }}>
      {/* four faint flowers in the corners, clear of the portrait and the text */}
      {CORNER_FLOWERS.map((at) => (
        <CornerFlower key={at} className={`pointer-events-none absolute h-[68px] w-[68px] ${at}`} />
      ))}

      <div className="relative mx-auto max-w-[24rem]">
        {/* The crest and heading */}
        <div style={rise(0)}>
          <Crest className="mx-auto block h-auto w-[12rem]" />
          {eyebrow && <p className="t-label mt-3">{eyebrow}</p>}
          <h2 id="family-heading" className="t-heading mt-1.5" style={{ color: MAROON }}>
            {heading}
          </h2>
          <JhotiRule motif="padma" className="mt-3" />
        </div>
        <p className="mt-3 font-sans text-[14.5px] leading-snug" style={{ ...rise(120), color: TEXT_SOFT }}>
          {tagline}
        </p>

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

        {/* The groom's family, then the bride's, in matching compact gold frames (equal rows, so equal heights) */}
        <div className="mt-12 grid auto-rows-fr gap-12" style={rise(420)}>
          <Parents side={groom} />
          <Parents side={bride} />
        </div>

        {together && (
          <p className="t-quote mt-9 text-[20px]" style={{ ...rise(560), color: MAROON }}>
            {together}
          </p>
        )}

        {odiaLine && (
          <p lang="or" className="t-odia mt-4 text-[17px] font-normal" style={{ ...rise(620), color: MAROON }}>
            {/* the bars in gold, the words in maroon, as in the heading */}
            {odiaLine.split(/(||)/).map((part, i) => (part === "||" ? <span key={i} style={{ color: GOLD_TEXT }}>{part}</span> : part))}
          </p>
        )}
      </div>
    </section>
  );
}

/** Keeps a title (Sri, Smt.) on the same line as the first name. */
const withTitle = (name: string) => name.replace(/^(Sri|Shri|Smt\.?|Srimati|Late|Dr\.?)\s+/, "$1\u00A0");

/**
 * One family in its gold frame: the relationship in small gold capitals, the
 * parents' names in the serif with a small gold "&" between them, and the
 * family's blessing in the plain sans. Both frames share one layout.
 */
function Parents({ side }: { side: FamilySide }) {
  const [a, b] = side.parents;
  return (
    <GoldFrame className="h-full" panelClassName="flex h-full flex-col items-center justify-center">
      <p className="font-sans text-[11px] font-semibold uppercase leading-none tracking-[0.2em]" style={{ color: LABEL }}>
        {side.label}
      </p>
      {side.parents.length > 0 ? (
        <p className="mt-3 font-serif text-[clamp(20px,5.8vw,23px)] font-semibold leading-[1.2]" style={{ color: NAME }}>
          <span className="block [text-wrap:balance]">{withTitle(a)}</span>
          {b && (
            <>
              <span className="block font-medium leading-[1.15]" style={{ color: GOLD_TEXT, fontSize: "0.9em" }}>
                &amp;
              </span>
              <span className="block [text-wrap:balance]">{withTitle(b)}</span>
            </>
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
      {side.blessing && (
        <p className="mt-3 font-sans text-[13px] leading-snug [text-wrap:balance]" style={{ color: TEXT_SOFT }}>
          {side.blessing}
        </p>
      )}
    </GoldFrame>
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

/** One faint white flower, as in the page's background, for a corner. */
function CornerFlower({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-36 -36 72 72" aria-hidden className={className} style={{ opacity: 0.42 }}>
      <g opacity="0.85">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M0 0C-11.6 -11.9 -9.2 -27.2 0 -34C9.2 -27.2 11.6 -11.9 0 0Z" fill="#fff" fillOpacity="0.38" stroke="#fff" strokeWidth="0.6" strokeOpacity="0.85" />
            <path d="M0 -6.8V-26.5" stroke="#fff" strokeWidth="0.45" strokeOpacity="0.8" />
          </g>
        ))}
        <circle r="4" fill="#fff" fillOpacity="0.5" />
      </g>
    </svg>
  );
}

