import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { wedding } from "@/config/wedding";
import { JhotiRule } from "@/components/ui/JhotiThreshold";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { EASE } from "@/lib/motion";

// The countdown section's text colours
const VERMILION = "#7A1424"; // headings (the countdown's maroon)
const LABEL = "#A6782C"; // eyebrow and chapter labels (the countdown's gold)
const TEXT = "#2B1A14"; // paragraphs (the countdown's ink)
const LINE = "#B4483E"; // hearts: muted vermilion
const STRING = "#4A2A1A";
const THREAD = "#B8913F"; // the gold thread linking the chapters
const INK = "#B0855A"; // the wavy chapter accents (the parchment's old edge marks)
const COUPLE = { w: 202, h: 228 };
/** How long the scroll takes to unroll. */
const UNROLL_MS = 2200;
/** Room on each side for the page's looped side bands. */
const BAND = "calc(100% * 35 / 768)";
/** The thread's distance from the parchment's edge (the text starts at 24px). */
const RAIL = 12;
/** The wavy accent at each chapter: its height, and how far above the label it starts. */
const ACCENT_H = 30;
const ACCENT_LIFT = 3;

/** Where the thread goes, measured from the laid-out parchment. */
type Geo = {
  w: number;
  /** Just under the floral divider. */
  start: number;
  chapters: Array<{ x: number; top: number; bottom: number }>;
  /** Just above the couple. */
  end: number;
};

/**
 * Section 05 — Our Story.
 * On the page cream with its faint white flowers, a hanging scroll (after
 * the couple's design): the thread from the countdown's wheel comes down to a
 * nail, and from it the scroll hangs by a string — maroon rods with wooden
 * knobs, parchment between. It unrolls as it comes into view, showing
 * "Two Hearts, One Journey" and the four chapters, alternating left and
 * right. A fine gold thread links them: it leaves the floral divider, runs
 * down each chapter's outer margin past a small wavy ink accent at its
 * label, crosses in the space between chapters (never through the text),
 * and ends above the bride and groom at the scroll's foot — the story's
 * close. Each chapter fades up gently as it comes into view (the right-hand
 * ones a beat later) while the thread draws down to it; the couple fades in
 * last. Reduced motion: all of it simply there.
 */
export function Story() {
  const { eyebrow, heading, chapters } = wedding.story;
  const reduced = usePrefersReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const coupleRef = useRef<HTMLDivElement>(null);
  const opened = useInView(scrollRef, { threshold: 0.12 });
  const open = opened || reduced;
  const seen = useSeenEach(listRef, coupleRef, chapters.length);
  const shown = (i: number) => reduced || (open && seen[i]);
  const coupleShown = reduced || (open && seen[chapters.length]);
  const geo = useThreadGeometry(paperRef, headerRef, listRef, coupleRef);

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
            className="relative overflow-hidden px-6 pb-8 pt-8 shadow-[0_14px_30px_-16px_rgb(70_35_10/0.55)]"
            style={{
              background:
                "linear-gradient(to bottom, rgb(110 60 20 / 0.2), transparent 20px, transparent calc(100% - 24px), rgb(110 60 20 / 0.24)), radial-gradient(130% 90% at 50% 40%, #FBF3E2 0%, #F4E5C8 62%, #E8D1A8 100%)",
              clipPath: open ? "inset(-30px -30px -30px -30px)" : "inset(-30px -30px 100% -30px)",
              transition: reduced ? "none" : `clip-path ${unroll}`,
            }}
          >
            {geo && <Thread geo={geo} shown={shown} coupleShown={coupleShown} instant={reduced} />}

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
                    className={`relative ${i ? "mt-10" : ""} ${left ? "mr-[5%] text-left" : "ml-[5%] text-right"}`}
                    // the right-hand chapters follow a beat after the left
                    style={rise(shown(i), left ? 120 : 220)}
                  >
                    <p className="t-label leading-none" style={{ color: LABEL }}>
                      {c.label}
                    </p>
                    <h3 className="mt-2 font-serif text-[26px] font-semibold leading-[1.15] [text-wrap:balance]" style={{ color: VERMILION }}>
                      {c.title}
                    </h3>
                    <p className="t-body mt-2 [text-wrap:pretty]" style={{ color: TEXT }}>
                      {c.text}
                    </p>
                  </li>
                );
              })}
            </ol>

            {/* The bride and groom at the scroll's foot: the story's close */}
            <div ref={coupleRef} className="relative z-[1] mx-auto mt-10 w-[58%] max-w-[12rem]" style={rise(coupleShown, 300, 10)}>
              <Heart className="absolute -left-[16%] top-[16%] h-4 w-4" filled />
              <Heart className="absolute -right-[14%] top-[6%] h-3.5 w-3.5" />
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

          <Rod
            className="absolute -inset-x-[14px] -mt-[9px]"
            style={{ top: open ? "100%" : "0%", transition: reduced ? "none" : `top ${unroll}` }}
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Whether each chapter (and, last, the couple) has come into view yet: once
 * seen, always seen, so each reveal plays once as the guest reads down.
 */
function useSeenEach(listRef: RefObject<HTMLOListElement>, coupleRef: RefObject<HTMLDivElement>, count: number): boolean[] {
  const [seen, setSeen] = useState<boolean[]>(() => Array(count + 1).fill(false));
  useEffect(() => {
    const items = [...(listRef.current?.children ?? []), coupleRef.current].filter(Boolean) as Element[];
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
  }, [listRef, coupleRef, count]);
  return seen;
}

/** Measures where the thread runs (layout positions, so the reveals' small lifts don't move it). */
function useThreadGeometry(
  paperRef: RefObject<HTMLDivElement>,
  headerRef: RefObject<HTMLElement>,
  listRef: RefObject<HTMLOListElement>,
  coupleRef: RefObject<HTMLDivElement>,
): Geo | null {
  const [geo, setGeo] = useState<Geo | null>(null);
  useLayoutEffect(() => {
    const paper = paperRef.current;
    const header = headerRef.current;
    const list = listRef.current;
    const couple = coupleRef.current;
    if (!paper || !header || !list || !couple) return;
    const measure = () => {
      const w = paper.clientWidth;
      const chapters = [...list.children].map((li, i) => {
        const el = li as HTMLElement;
        const label = el.firstElementChild as HTMLElement | null;
        const top = list.offsetTop + el.offsetTop + (label?.offsetTop ?? 0) - ACCENT_LIFT;
        return { x: i % 2 === 0 ? RAIL : w - RAIL, top, bottom: list.offsetTop + el.offsetTop + el.offsetHeight - 4 };
      });
      setGeo({ w, start: header.offsetTop + header.offsetHeight + 6, chapters, end: couple.offsetTop - 8 });
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
  }, [paperRef, headerRef, listRef, coupleRef]);
  return geo;
}

/**
 * The gold thread and the chapter accents. It is drawn in pieces, each
 * drawing downward as its chapter appears: the crossing that leads into the
 * chapter, then the run down its margin; the last piece leads to the couple.
 */
function Thread({ geo, shown, coupleShown, instant }: { geo: Geo; shown: (i: number) => boolean; coupleShown: boolean; instant: boolean }) {
  const { w, start, chapters, end } = geo;
  const mid = w / 2;
  /** A gentle S from (x1, y1) down to (x2, y2): leaving and arriving vertically. */
  const swoop = (x1: number, y1: number, x2: number, y2: number) => {
    const k = Math.max(8, (y2 - y1) * 0.6);
    return `M${x1} ${y1}C${x1} ${y1 + k} ${x2} ${y2 - k} ${x2} ${y2}`;
  };
  const draw = (on: boolean, delay: number, ms = 650): CSSProperties => ({
    strokeDashoffset: on ? 0 : 1,
    transition: instant ? "none" : `stroke-dashoffset ${ms}ms ${EASE.silk} ${delay}ms`,
  });
  const last = chapters[chapters.length - 1];

  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" fill="none">
      <g stroke={THREAD} strokeWidth="1" strokeOpacity="0.6" strokeLinecap="butt" strokeDasharray="1 1">
        {chapters.map((c, i) => {
          const from = i === 0 ? { x: mid, y: start } : { x: chapters[i - 1].x, y: chapters[i - 1].bottom };
          return (
            <g key={i}>
              {/* the crossing into this chapter (from the divider, for the first) */}
              <path d={swoop(from.x, from.y, c.x, c.top)} pathLength={1} style={draw(shown(i), 0)} />
              {/* down its margin, past the accent */}
              {c.bottom > c.top + ACCENT_H && <path d={`M${c.x} ${c.top + ACCENT_H}V${c.bottom}`} pathLength={1} style={draw(shown(i), 450, 750)} />}
            </g>
          );
        })}
        {last && <path d={swoop(last.x, last.bottom, mid, end)} pathLength={1} style={draw(coupleShown, 0, 800)} />}
      </g>
      {last && <circle cx={mid} cy={end + 1.5} r="1.8" fill={THREAD} opacity={coupleShown ? 0.75 : 0} style={{ transition: instant ? "none" : `opacity 500ms ease 650ms` }} />}

      {/* A small wavy ink accent at each chapter's label, on the thread */}
      {chapters.map((c, i) => (
        <g
          key={`a${i}`}
          transform={`translate(${c.x - 4} ${c.top}) scale(0.68)`}
          stroke={INK}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity={shown(i) ? 0.8 : 0}
          style={{ transition: instant ? "none" : `opacity 600ms ease 300ms` }}
        >
          <path d="M3 2c3 3-3 6 0 9s-3 6 0 9 3 6 0 9-3 6 0 9 3 4 0 5" />
          <path d="M9 2c3 3-3 6 0 9s-3 6 0 9 3 6 0 9-3 6 0 9 3 4 0 5" />
        </g>
      ))}
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
