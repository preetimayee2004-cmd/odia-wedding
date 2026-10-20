import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { wedding } from "@/config/wedding";
import { JhotiRule } from "@/components/ui/JhotiThreshold";
import { FitText, type FitTier } from "@/components/ui/FitText";
import { rng } from "@/components/art/eventVineArt";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { EASE } from "@/lib/motion";

// The countdown section's text colours
const VERMILION = "#7A1424"; // headings (the countdown's maroon)
const LABEL = "#A6782C"; // eyebrow and chapter labels (the countdown's gold)
const LINE = "#B4483E"; // hearts: muted vermilion
const STRING = "#4A2A1A";
const GOLD = "#B8913F"; // the thread, its flowers, the cards' flourishes, the sprigs
const COUPLE = { w: 202, h: 228 };
/** How long the scroll takes to unroll. */
const UNROLL_MS = 2200;
/** Room on each side for the page's looped side bands. */
const BAND = "calc(100% * 35 / 768)";
/** A long chapter title: a touch smaller on one line, else two. */
const TITLE_FIT: FitTier[] = [
  [1, 0.86],
  [2, 1],
];

/** Where the thread goes, measured from the laid-out parchment. */
type Geo = {
  /** Just under the floral divider. */
  start: { x: number; y: number };
  /** Each card: the middle of the free strip beside it, and its top and bottom. */
  cards: Array<{ x: number; top: number; bottom: number }>;
  /** The lotus after the last chapter. */
  end: { x: number; y: number };
};

/**
 * Section 05 — Our Story (after the couple's design).
 * On the page cream with its faint white flowers, a hanging scroll: the
 * thread from the countdown's wheel comes down to a nail, and from it the
 * scroll hangs by a string — maroon rods with wooden knobs, parchment
 * between. It unrolls as it comes into view. On the parchment: "Two Hearts,
 * One Journey", "Our Story" and the floral divider; then the four chapters on
 * deckle-edged ivory cards, alternating left and right, each with gold
 * flourishes in two corners. A fine gold thread with small gold flowers
 * leaves the divider and winds down beside the cards (in the space each one
 * leaves free, crossing between them, never through the words) to a lotus;
 * under it "A beautiful beginning, a lifetime together", and the bride and
 * groom between gold sprigs at the scroll's foot. Each card fades up as it
 * comes into view (the right-hand ones a beat later) while the thread draws
 * down to it; the close fades in last. Reduced motion: all of it simply
 * there.
 */
export function Story() {
  const { eyebrow, heading, chapters, closing } = wedding.story;
  const reduced = usePrefersReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const finaleRef = useRef<HTMLDivElement>(null);
  const lotusRef = useRef<HTMLDivElement>(null);
  const opened = useInView(scrollRef, { threshold: 0.12 });
  const open = opened || reduced;
  const seen = useSeenEach(listRef, finaleRef, chapters.length);
  const shown = (i: number) => reduced || (open && seen[i]);
  const finaleShown = reduced || (open && seen[chapters.length]);
  const geo = useThreadGeometry(paperRef, headerRef, listRef, lotusRef);

  const unroll = `${UNROLL_MS}ms ${EASE.temple}`;
  const rise = (on: boolean, delay = 0, lift = 14): CSSProperties => ({
    opacity: on ? 1 : 0,
    transform: on ? "none" : `translateY(${lift}px)`,
    transition: reduced ? "none" : `opacity 700ms ${EASE.silk} ${delay}ms, transform 800ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section id="story" aria-labelledby="story-heading" data-no-petals className="relative overflow-x-clip pb-7">
      <div className="relative mx-auto" style={{ width: `min(calc(100% - 2 * (${BAND} + 10px)), 27rem)` }}>
        {/* The thread from the countdown's wheel, down to the nail; the string to the rod */}
        <Hanger />

        {/* The top rod */}
        <Rod />

        {/* The parchment, unrolling, with the bottom rod travelling down its edge */}
        <div ref={scrollRef} className="relative mx-[14px]">
          <div
            ref={paperRef}
            className="relative overflow-hidden px-[14px] pb-8 pt-8 shadow-[0_14px_30px_-16px_rgb(70_35_10/0.55)]"
            style={{
              background:
                "linear-gradient(to bottom, rgb(110 60 20 / 0.2), transparent 20px, transparent calc(100% - 24px), rgb(110 60 20 / 0.24)), radial-gradient(130% 90% at 50% 40%, #FBF3E2 0%, #F4E5C8 62%, #E8D1A8 100%)",
              clipPath: open ? "inset(-30px -30px -30px -30px)" : "inset(-30px -30px 100% -30px)",
              transition: reduced ? "none" : `clip-path ${unroll}`,
            }}
          >
            {geo && <Thread geo={geo} shown={shown} finaleShown={finaleShown} instant={reduced} />}

            {/* a gold sprig beside the heading */}
            <Sprig className="absolute right-[6px] top-[58px] h-[64px] w-[26px]" style={rise(open, 600, 0)} />

            <header ref={headerRef} className="relative z-[1] text-center" style={rise(open, 250, 10)}>
              <p className="t-label leading-none" style={{ color: LABEL }}>
                {eyebrow}
              </p>
              <h2 id="story-heading" className="t-heading mt-2 leading-none" style={{ color: VERMILION }}>
                {heading}
              </h2>
              <JhotiRule motif="champa" className="mt-3" />
            </header>

            <ol ref={listRef} className="relative z-[1] mt-9">
              {chapters.map((c, i) => {
                const left = i % 2 === 0;
                return (
                  <li
                    key={c.label}
                    className={`story-card-wrap relative w-[80%] ${i ? "mt-[30px]" : ""} ${left ? "mr-auto" : "ml-auto"}`}
                    // the right-hand cards follow a beat after the left
                    style={rise(shown(i), left ? 120 : 220)}
                  >
                    <div className="story-card" style={{ clipPath: DECKLES[i % DECKLES.length] }}>
                      <Flourish className={`story-flourish ${left ? "story-flourish-tl" : "story-flourish-tr"}`} />
                      <Flourish className={`story-flourish ${left ? "story-flourish-br" : "story-flourish-bl"}`} />
                      <p className="story-card-label">
                        {c.label}
                        <span aria-hidden className="story-card-dash" />
                      </p>
                      <FitText as="h3" tiers={TITLE_FIT} className="story-card-title">
                        {c.title}
                      </FitText>
                      <p className="story-card-text">{c.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* The close: a lotus on fine gold lines, a line in italics, and the bride and groom */}
            <div ref={finaleRef} className="relative z-[1] mt-9 text-center">
              <div ref={lotusRef} aria-hidden className="flex items-center justify-center gap-2" style={rise(finaleShown, 0, 6)}>
                <span className="h-px w-[4.5rem]" style={{ background: `linear-gradient(to right, transparent, ${GOLD})` }} />
                <Lotus className="h-auto w-[28px]" />
                <span className="h-px w-[4.5rem]" style={{ background: `linear-gradient(to left, transparent, ${GOLD})` }} />
              </div>
              {closing && (
                <p className="mx-auto mt-3 max-w-[15rem] font-serif text-[19px] font-medium italic leading-snug [text-wrap:balance]" style={{ ...rise(finaleShown, 150, 8), color: "#5A3B2A" }}>
                  {closing}
                </p>
              )}
              <div className="relative mx-auto mt-6 w-[58%] max-w-[12rem]" style={rise(finaleShown, 350, 10)}>
                <Sprig className="absolute bottom-[4%] left-[-30%] h-[60px] w-[24px]" />
                <Sprig className="absolute bottom-[4%] right-[-30%] h-[60px] w-[24px] -scale-x-100" />
                <Heart className="absolute -left-[14%] top-[14%] h-4 w-4" filled />
                <Heart className="absolute -right-[12%] top-[6%] h-3.5 w-3.5" />
                <img
                  src="/art/story/couple.png"
                  alt="The bride and groom sitting together, his arm around her"
                  width={COUPLE.w}
                  height={COUPLE.h}
                  decoding="async"
                  loading="lazy"
                  className="relative block h-auto w-full"
                />
              </div>
            </div>
          </div>

          <Rod
            className="absolute -inset-x-[14px] -mt-[9px]"
            style={{ top: open ? "100%" : "0%", transition: reduced ? "none" : `top ${unroll}` }}
          />
        </div>
      </div>
    </section>
  );
}

/** A deckled (hand-torn) edge for each card, a little different on each. */
const DECKLES = Array.from({ length: 4 }, (_, k) => {
  const R = rng(900 + k);
  const j = () => (0.3 + R() * 2.2).toFixed(2);
  const pts: string[] = [];
  for (let x = 0; x <= 100; x += 4) pts.push(`${x}% ${j()}px`);
  for (let y = 4; y <= 96; y += 4) pts.push(`calc(100% - ${j()}px) ${y}%`);
  for (let x = 100; x >= 0; x -= 4) pts.push(`${x}% calc(100% - ${j()}px)`);
  for (let y = 96; y >= 4; y -= 4) pts.push(`${j()}px ${y}%`);
  return `polygon(${pts.join(", ")})`;
});

/**
 * Whether each card (and, last, the close) has come into view yet: once
 * seen, always seen, so each reveal plays once as the guest reads down.
 */
function useSeenEach(listRef: RefObject<HTMLOListElement>, finaleRef: RefObject<HTMLDivElement>, count: number): boolean[] {
  const [seen, setSeen] = useState<boolean[]>(() => Array(count + 1).fill(false));
  useEffect(() => {
    const items = [...(listRef.current?.children ?? []), finaleRef.current].filter(Boolean) as Element[];
    if (!("IntersectionObserver" in window)) {
      setSeen(Array(count + 1).fill(true));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).map((e) => items.indexOf(e.target));
        if (!hit.length) return;
        setSeen((prev) => prev.map((v, i) => v || hit.includes(i)));
        entries.forEach((e) => e.isIntersecting && io.unobserve(e.target));
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [listRef, finaleRef, count]);
  return seen;
}

/** Measures where the thread runs (layout positions, so the reveals' small lifts don't move it). */
function useThreadGeometry(
  paperRef: RefObject<HTMLDivElement>,
  headerRef: RefObject<HTMLElement>,
  listRef: RefObject<HTMLOListElement>,
  lotusRef: RefObject<HTMLDivElement>,
): Geo | null {
  const [geo, setGeo] = useState<Geo | null>(null);
  useLayoutEffect(() => {
    const paper = paperRef.current;
    const header = headerRef.current;
    const list = listRef.current;
    const lotus = lotusRef.current;
    if (!paper || !header || !list || !lotus) return;
    const measure = () => {
      const w = paper.clientWidth;
      const cs = getComputedStyle(paper);
      const innerL = parseFloat(cs.paddingLeft);
      const innerR = w - parseFloat(cs.paddingRight);
      const cards = [...list.children].map((li, i) => {
        const el = li as HTMLElement;
        const left = list.offsetLeft + el.offsetLeft;
        const top = list.offsetTop + el.offsetTop;
        // the free strip beside the card: to its right for a left-hand card, else to its left
        const x = i % 2 === 0 ? (left + el.offsetWidth + innerR) / 2 : (innerL + left) / 2;
        return { x, top, bottom: top + el.offsetHeight };
      });
      const finale = lotus.offsetParent as HTMLElement | null;
      setGeo({
        start: { x: w / 2, y: header.offsetTop + header.offsetHeight + 6 },
        cards,
        end: { x: w / 2, y: (finale?.offsetTop ?? 0) + lotus.offsetTop - 2 },
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(paper);
    let alive = true;
    document.fonts?.ready.then(() => alive && measure());
    return () => {
      alive = false;
      ro.disconnect();
    };
  }, [paperRef, headerRef, listRef, lotusRef]);
  return geo;
}

/**
 * The gold thread and its flowers. It is drawn in pieces, each drawing
 * downward as its card appears: the crossing that leads to the card, then
 * a gentle wave down beside it, past a small flower; the last piece leads
 * to the lotus.
 */
function Thread({ geo, shown, finaleShown, instant }: { geo: Geo; shown: (i: number) => boolean; finaleShown: boolean; instant: boolean }) {
  const { start, cards, end } = geo;
  /** A gentle S from (x1, y1) down to (x2, y2): leaving and arriving vertically. */
  const swoop = (x1: number, y1: number, x2: number, y2: number) => {
    const k = Math.max(8, (y2 - y1) * 0.6);
    return `M${x1} ${y1}C${x1} ${y1 + k} ${x2} ${y2 - k} ${x2} ${y2}`;
  };
  /** Down beside a card with a soft sway, through its middle. */
  const wave = (x: number, y1: number, y2: number) => {
    const h = y2 - y1;
    return `M${x} ${y1}C${x + 7} ${y1 + h * 0.33} ${x - 7} ${y1 + h * 0.67} ${x} ${y2}`;
  };
  const draw = (on: boolean, delay: number, ms = 650): CSSProperties => ({
    strokeDashoffset: on ? 0 : 1,
    transition: instant ? "none" : `stroke-dashoffset ${ms}ms ${EASE.silk} ${delay}ms`,
  });
  const last = cards[cards.length - 1];

  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" fill="none">
      <g stroke={GOLD} strokeWidth="1" strokeOpacity="0.7" strokeLinecap="butt" strokeDasharray="1 1">
        {cards.map((c, i) => {
          const from = i === 0 ? start : { x: cards[i - 1].x, y: cards[i - 1].bottom - 4 };
          return (
            <g key={i}>
              <path d={swoop(from.x, from.y, c.x, c.top + 4)} pathLength={1} style={draw(shown(i), 0)} />
              <path d={wave(c.x, c.top + 4, c.bottom - 4)} pathLength={1} style={draw(shown(i), 450, 750)} />
            </g>
          );
        })}
        {last && <path d={swoop(last.x, last.bottom - 4, end.x, end.y)} pathLength={1} style={draw(finaleShown, 0, 700)} />}
      </g>

      {/* a small gold flower on the thread beside each card, a flower and a lotus in turn */}
      {cards.map((c, i) => (
        <g
          key={`f${i}`}
          transform={`translate(${c.x} ${(c.top + c.bottom) / 2})`}
          opacity={shown(i) ? 1 : 0}
          style={{ transition: instant ? "none" : `opacity 600ms ease 700ms` }}
        >
          <circle r="7.5" fill="#F6EAD3" />
          {i % 2 === 0 ? <FlowerMark /> : <LotusMark />}
        </g>
      ))}
    </svg>
  );
}

/** A six-petal gold flower, drawn about the origin (for the thread). */
function FlowerMark() {
  return (
    <g stroke={GOLD} strokeWidth="0.9" fill="#F1DFAE">
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="0" cy="-4" rx="2.1" ry="3.4" transform={`rotate(${a})`} />
      ))}
      <circle r="1.6" fill={GOLD} stroke="none" />
    </g>
  );
}

/** A small gold lotus, drawn about the origin (for the thread). */
function LotusMark() {
  return (
    <g stroke={GOLD} strokeWidth="0.9" strokeLinejoin="round" fill="#F1DFAE">
      <path d="M0-6.5C2.2-4 2.2-1.2 0 1.6-2.2-1.2-2.2-4 0-6.5Z" />
      <path d="M0 1.6C-2.8 1.4-5-.4-5.6-3.2-2.8-2.8-1 -1 0 1.6ZM0 1.6C2.8 1.4 5-.4 5.6-3.2 2.8-2.8 1-1 0 1.6Z" />
      <path d="M-5.6 3.6H5.6" fill="none" />
    </g>
  );
}

/** The lotus after the last chapter. */
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

/** A gold corner flourish (drawn for the top-left corner; the CSS turns it to the others). */
function Flourish({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={className} fill="none" stroke={GOLD} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17C3 9.6 8.4 4 16 4" />
      <path d="M16 4c-2.4 0-3.4 2.4-1.8 3.4 1.3.8 2.6-.5 1.8-1.5" />
      <path d="M3 17c0-2.4 2.4-3.4 3.4-1.8.8 1.3-.5 2.6-1.5 1.8" />
      <path d="M7.6 8.8c1.7-.5 3 .3 3.3 1.9-1.7.4-2.9-.4-3.3-1.9Z" fill={GOLD} fillOpacity="0.35" />
    </svg>
  );
}

/** A slender gold sprig: a stem, three leaves, a small flower and a bud. */
function Sprig({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 30 72" aria-hidden className={`pointer-events-none ${className}`} style={style} fill="none" stroke={GOLD} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" opacity="0.75">
      <path d="M15 71C13.6 56 16.4 40 14 22" />
      <path d="M14.8 58C9.6 57 6.6 53 6.4 48.6 10.6 49.6 13.6 53 14.8 58Z" />
      <path d="M15.4 48C20.6 47 23.4 43 23.6 38.6 19.4 39.6 16.4 43 15.4 48Z" />
      <path d="M14.4 37.6C10 36.2 7.8 32.4 8.2 28.8 11.8 30 14 33.2 14.4 37.6Z" />
      <path d="M15.6 30C17.6 28 20.2 27.6 21.6 28.4" />
      <path d="M21.6 28.4C23.6 27.6 24.4 25.4 23 24 21.6 24.6 21 26.6 21.6 28.4Z" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="14" cy="13.2" rx="2.2" ry="3.6" transform={`rotate(${a} 14 17)`} />
      ))}
      <circle cx="14" cy="17" r="1.3" fill={GOLD} stroke="none" />
    </svg>
  );
}

/**
 * The thread from the countdown's wheel divider coming down the middle of the
 * page to a nail, and the string from the nail out to both ends of the rod.
 */
function Hanger() {
  return (
    <div aria-hidden className="relative h-[92px]">
      <svg viewBox="0 0 12 40" preserveAspectRatio="none" className="absolute left-1/2 top-0 h-[40px] w-3 -translate-x-1/2">
        <path d="M6 0c.7 12-.6 22 0 40" fill="none" stroke="#A6782C" strokeWidth="1.15" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <svg viewBox="0 0 100 52" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[52px] w-full">
        <path d="M50 2 6 50M50 2 94 50" fill="none" stroke={STRING} strokeWidth="1.3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* the nail */}
      <span
        className="absolute left-1/2 top-[34px] h-[13px] w-[13px] -translate-x-1/2 rounded-full shadow-[0_2px_3px_rgb(0_0_0/0.35)]"
        style={{ background: "radial-gradient(circle at 35% 30%, #E6E6E6, #9A9A9A 45%, #5A5A5A)" }}
      />
    </div>
  );
}

/** A maroon scroll rod with a turned wooden knob at each end. */
function Rod({ className = "relative", style }: { className?: string; style?: CSSProperties }) {
  const knob = "radial-gradient(circle at 38% 32%, #C48A55, #8A5128 48%, #4E2A12)";
  return (
    <div aria-hidden className={`z-[1] h-[18px] ${className}`} style={style}>
      <span
        className="absolute inset-y-[2px] left-[9px] right-[9px] rounded-full shadow-[0_3px_5px_-1px_rgb(50_20_5/0.45)]"
        style={{ background: "linear-gradient(to bottom, #C2454A, #8E1B1F 45%, #5E0E12)" }}
      />
      <span className="absolute left-0 top-0 h-[18px] w-[15px] rounded-full" style={{ background: knob }} />
      <span className="absolute right-0 top-0 h-[18px] w-[15px] rounded-full" style={{ background: knob }} />
    </div>
  );
}

/** A small hand-drawn heart. */
function Heart({ className = "", filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke={LINE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.2 20.3C7 16.6 3.4 13.2 3.6 9.1 3.8 6.2 6 4.4 8.3 4.6c1.9.1 3.1 1.4 3.8 2.9.8-1.6 2.2-2.9 4.2-2.9 2.5.1 4.3 2.1 4.1 4.8-.3 4-4 7.4-8.2 10.9Z" fill={filled ? `${LINE}CC` : `${LINE}1A`} />
      <path d="M6.4 8.2c.3-1 1-1.6 1.9-1.7" strokeOpacity="0.6" />
    </svg>
  );
}
