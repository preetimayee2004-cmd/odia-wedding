import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { wedding, type StoryChapter } from "@/config/wedding";
import { FitText, type FitTier } from "@/components/ui/FitText";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { EASE } from "@/lib/motion";

// The countdown section's text colours
const VERMILION = "#7A1424"; // headings (the countdown's maroon)
const LABEL = "#A6782C"; // eyebrow (the countdown's gold)
const LINE = "#B4483E"; // hearts: muted vermilion
const STRING = "#4A2A1A";
const GOLD = "#B8913F"; // the mural's thread, flowers and leaves
const COUPLE = { w: 202, h: 228 };
/** Room on each side for the page's looped side bands. */
const BAND = "calc(100% * 35 / 768)";
/** A long chapter title: a touch smaller on one line, else two. */
const TITLE_FIT: FitTier[] = [
  [1, 0.86],
  [2, 1],
];
/** The unroll: the scroll's own 2.2s, a little longer for a taller parchment (to 3.6s). */
const unrollMs = (height: number) => Math.round(Math.min(3600, Math.max(2200, height * 2.2)));
/** The unroll's easing (EASE.temple), as numbers. */
const UNROLL_BEZIER = [0.65, 0, 0.35, 1] as const;

/** When (0–1 of the unroll's time) the opening edge reaches `f` (0–1) of the parchment's height. */
function edgeTime(f: number): number {
  const [x1, y1, x2, y2] = UNROLL_BEZIER;
  const bez = (a: number, b: number, s: number) => 3 * a * (1 - s) * (1 - s) * s + 3 * b * (1 - s) * s * s + s * s * s;
  // the edge's position along the curve grows with its parameter, so search that, then read its time
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (bez(y1, y2, mid) < f) lo = mid;
    else hi = mid;
  }
  return bez(x1, x2, (lo + hi) / 2);
}
/** The parchment's side margin, and where the thread runs in it (from the parchment's edge). */
const MARGIN = 22;
const RAIL = 11;

/** Where the thread runs, measured from the laid-out parchment (px within it). */
type Geo = {
  w: number;
  /** Just under the intro line. */
  start: number;
  /** Each chapter: its rail (on its picture's side), its label's middle, its foot. */
  chapters: Array<{ x: number; label: number; bottom: number }>;
  /** Just above the couple. */
  end: number;
};

/** `el`'s top within `root`, by layout (ignoring the reveals' small lifts). */
function topWithin(el: HTMLElement, root: HTMLElement): number {
  let y = 0;
  let e: HTMLElement | null = el;
  while (e && e !== root) {
    y += e.offsetTop;
    e = e.offsetParent as HTMLElement | null;
  }
  return y;
}

/**
 * Section 05 — Our Story, a story mural painted on a hanging scroll.
 * The thread from the countdown's wheel comes down to a nail; from it the
 * scroll hangs by a string — maroon rods with wooden knobs, parchment
 * between. Closed at first, it unrolls when it comes into view: the bottom
 * rod travels down as the parchment is revealed (a little longer for a
 * taller story). Painted on the parchment: "Two Hearts, One Journey", "Our
 * Story", a gold lotus and a line in italics; then the chapters, each with a
 * small illustration whose edge washes into the paper in warm beige
 * (alternating left and right, the words wrapping round it). One fine
 * antique-gold thread runs the length of the story: from under the intro,
 * down the margin on each chapter's picture side (a small flower, the same
 * for each, at its label) and across the space between chapters, never over
 * the words or the pictures, to the couple and the hashtag at the scroll's
 * foot. As the parchment opens, each part fades in and the thread draws on
 * as it comes into view. Reduced motion: open, all of it there.
 */
export function Story() {
  const { eyebrow, heading, intro, chapters } = wedding.story;
  const hashtag = wedding.couple.hashtag;
  const reduced = usePrefersReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const opened = useInView(scrollRef, { threshold: 0.12 });
  const open = opened || reduced;
  const seen = useSeen(paperRef);
  const shown = (key: string) => reduced || (open && seen.has(key));
  const [ms, setMs] = useState(2200);
  // where each marked part sits on the parchment (0–1 of its height), and where the thread runs
  const [places, setPlaces] = useState<Record<string, number>>({});
  const [geo, setGeo] = useState<Geo | null>(null);
  useLayoutEffect(() => {
    const paper = paperRef.current;
    if (!paper) return;
    const measure = () => {
      const h = paper.offsetHeight;
      if (!h) return;
      setMs(unrollMs(h));
      const top = paper.getBoundingClientRect().top;
      const next: Record<string, number> = {};
      paper.querySelectorAll<HTMLElement | SVGElement>("[data-seen]").forEach((el) => {
        next[el.dataset.seen ?? ""] = Math.min(1, (el.getBoundingClientRect().top - top + 40) / h);
      });
      setPlaces(next);
      const w = paper.clientWidth;
      const header = paper.querySelector<HTMLElement>("header");
      const couple = paper.querySelector<HTMLElement>("[data-couple]");
      if (!header || !couple) return;
      const chapters = [...paper.querySelectorAll<HTMLElement>("[data-chapter]")].map((ch, i) => {
        const label = ch.querySelector<HTMLElement>("[data-label]");
        const top = topWithin(ch, paper);
        return { x: i % 2 === 0 ? RAIL : w - RAIL, label: label ? topWithin(label, paper) + label.offsetHeight / 2 : top, bottom: top + ch.offsetHeight };
      });
      setGeo({ w, start: topWithin(header, paper) + header.offsetHeight + 6, chapters, end: topWithin(couple, paper) - 10 });
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
  }, []);
  const openedAt = useRef<number | null>(null);
  if (open && openedAt.current === null) openedAt.current = performance.now();
  /** Holds a part back until the opening edge of the parchment reaches it (none once the scroll is open). */
  const lag = (key: string) => {
    const t0 = openedAt.current;
    const at = seen.get(key);
    const f = places[key];
    if (reduced || t0 === null || at === undefined || f === undefined) return 0;
    return Math.max(0, Math.round(ms * edgeTime(f) - Math.max(0, at - t0)));
  };

  const unroll = `${ms}ms ${EASE.temple}`;
  const rise = (on: boolean, delay = 0, lift = 12): CSSProperties => ({
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
            className="relative overflow-hidden pb-9 pt-8 shadow-[0_14px_30px_-16px_rgb(70_35_10/0.55)]"
            style={{
              background:
                "linear-gradient(to bottom, rgb(110 60 20 / 0.2), transparent 20px, transparent calc(100% - 24px), rgb(110 60 20 / 0.24)), radial-gradient(130% 90% at 50% 40%, #FBF3E2 0%, #F4E5C8 62%, #E8D1A8 100%)",
              paddingInline: MARGIN,
              clipPath: open ? "inset(-30px -30px -30px -30px)" : "inset(-30px -30px 100% -30px)",
              transition: reduced ? "none" : `clip-path ${unroll}`,
            }}
          >
            {geo && <Thread geo={geo} shown={(i) => shown(`c${i}`)} lag={(i) => lag(`c${i}`)} endShown={shown("end")} endLag={lag("end")} instant={reduced} />}

            <header className="relative z-[1] text-center">
              <p className="t-label leading-none" style={{ ...rise(open, 250, 8), color: LABEL }}>
                {eyebrow}
              </p>
              <h2 id="story-heading" className="t-heading mt-2 leading-none" style={{ ...rise(open, 350, 10), color: VERMILION }}>
                {heading}
              </h2>
              <LotusRule className="mt-3" style={rise(open, 500, 6)} />
              {intro && (
                <p className="mural-intro mx-auto mt-3" style={rise(open, 650, 8)}>
                  {intro}
                </p>
              )}
            </header>

            <ol className="relative z-[1] mt-10">
              {chapters.map((c, i) => (
                <li key={c.label} className={i ? "mt-11" : ""}>
                  <Chapter chapter={c} left={i % 2 === 0} seenKey={`c${i}`} on={shown(`c${i}`)} lag={lag(`c${i}`)} reduced={reduced} />
                </li>
              ))}
            </ol>

            {/* The couple at the scroll's foot, and the hashtag */}
            <div data-seen="end" className="relative z-[1] mt-11 text-center">
              <div data-couple className="relative mx-auto w-[60%] max-w-[13rem]" style={rise(shown("end"), lag("end"), 10)}>
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
              {hashtag && (
                <div className="mt-4 flex flex-col items-center gap-1.5" style={rise(shown("end"), lag("end") + 250, 8)}>
                  <span aria-hidden className="h-px w-36" style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />
                  <FitText tiers={[[1, 0.7]]} className="mural-hashtag" aria-label={hashtag}>
                    {/* "#AviWedsPragya" → "#Avi Weds Pragya", in Cinzel's capitals */}
                    {hashtag.replace(/([a-z])([A-Z])/g, "$1 $2")}
                  </FitText>
                  <span aria-hidden className="h-px w-36" style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />
                </div>
              )}
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

/** When each marked part of the parchment (`data-seen`) first came into view: once seen, always seen. */
function useSeen(rootRef: RefObject<HTMLElement>): Map<string, number> {
  const [seen, setSeen] = useState<Map<string, number>>(() => new Map());
  useEffect(() => {
    const els = [...(rootRef.current?.querySelectorAll<HTMLElement>("[data-seen]") ?? [])];
    const key = (el: Element) => (el as HTMLElement).dataset.seen ?? "";
    if (!("IntersectionObserver" in window)) {
      setSeen(new Map(els.map((el) => [key(el), 0])));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).map((e) => e.target);
        if (!hit.length) return;
        const now = performance.now();
        setSeen((prev) => new Map([...prev, ...hit.map((el): [string, number] => [key(el), prev.get(key(el)) ?? now])]));
        hit.forEach((el) => io.unobserve(el));
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
  return seen;
}

/**
 * One chapter, painted on the parchment: its label with a short gold dash,
 * its title, and its words wrapping round a small illustration on its side.
 */
function Chapter({ chapter, left, seenKey, on, lag, reduced }: { chapter: StoryChapter; left: boolean; seenKey: string; on: boolean; lag: number; reduced: boolean }) {
  const { label, title, text, art } = chapter;
  const fade = (delay: number, lift = 10): CSSProperties => ({
    opacity: on ? 1 : 0,
    transform: on ? "none" : `translateY(${lift}px)`,
    transition: reduced ? "none" : `opacity 700ms ${EASE.silk} ${lag + delay}ms, transform 800ms ${EASE.silk} ${lag + delay}ms`,
  });
  return (
    <div data-seen={seenKey} data-chapter>
      <p data-label className="mural-label" style={fade(0, 6)}>
        {label}
        <span aria-hidden className="mural-dash" />
      </p>
      <FitText as="h3" tiers={TITLE_FIT} className="mural-title" style={fade(100)}>
        {title}
      </FitText>
      <div className="mural-body">
        {art && <Art art={art} left={left} on={on} lag={lag} reduced={reduced} />}
        <p className="mural-text" style={fade(320)}>
          {text}
        </p>
      </div>
    </div>
  );
}

/**
 * A chapter's illustration as if painted on the parchment: its edge washes
 * into warm beige and dissolves into the paper (baked into the picture, so
 * the couple keeps its own colours); the words wrap round its oval. It
 * blooms in gently.
 */
function Art({ art, left, on, lag, reduced }: { art: NonNullable<StoryChapter["art"]>; left: boolean; on: boolean; lag: number; reduced: boolean }) {
  const { src, alt, w, h, showTop } = art;
  return (
    <figure className={`mural-art ${left ? "mural-art-left" : "mural-art-right"}`} style={{ aspectRatio: `${w} / ${Math.round(h * (showTop ?? 1))}` }}>
      <img
        src={src}
        alt={alt}
        width={w}
        height={h}
        loading="lazy"
        decoding="async"
        style={{
          objectFit: showTop ? "cover" : "contain",
          objectPosition: "50% 0",
          opacity: on ? 1 : 0,
          transform: on ? "none" : "scale(0.95)",
          transition: reduced ? "none" : `opacity 1000ms ${EASE.silk} ${lag + 180}ms, transform 1200ms ${EASE.silk} ${lag + 180}ms`,
        }}
      />
    </figure>
  );
}

/**
 * The gold thread, one line the length of the story: from under the intro
 * it swings across to the first chapter, runs down the margin on that
 * chapter's picture side past a small flower at its label, swings across
 * the space to the next chapter, and so on, ending above the couple. Two
 * slender leaves, one each side as on a vine, mark the middle of each swing. It is drawn in pieces
 * that join smoothly, each drawing on as its chapter appears.
 */
function Thread({ geo, shown, lag, endShown, endLag, instant }: { geo: Geo; shown: (i: number) => boolean; lag: (i: number) => number; endShown: boolean; endLag: number; instant: boolean }) {
  const { w, start, chapters, end } = geo;
  const mid = w / 2;
  const R = 8; // the flowers' radius: the thread stops short of them
  /** A smooth S from (x1, y1) down to (x2, y2), leaving and arriving vertically; its middle and direction there. */
  const swing = (x1: number, y1: number, x2: number, y2: number) => {
    const k = Math.max(10, (y2 - y1) * 0.6);
    const d = `M${x1} ${y1}C${x1} ${y1 + k} ${x2} ${y2 - k} ${x2} ${y2}`;
    const angle = (Math.atan2(y2 - y1 - k, x2 - x1) * 180) / Math.PI;
    return { d, mx: (x1 + x2) / 2, my: (y1 + y2) / 2, angle };
  };
  const draw = (on: boolean, delay: number, ms = 700): CSSProperties => ({
    strokeDashoffset: on ? 0 : 1,
    transition: instant ? "none" : `stroke-dashoffset ${ms}ms ${EASE.silk} ${delay}ms`,
  });
  const fadeIn = (on: boolean, delay: number): CSSProperties => ({ opacity: on ? 1 : 0, transition: instant ? "none" : `opacity 600ms ease ${delay}ms` });
  const last = chapters[chapters.length - 1];
  const swings = chapters.map((c, i) => {
    const from = i === 0 ? { x: mid, y: start } : { x: chapters[i - 1].x, y: chapters[i - 1].bottom - 2 };
    return swing(from.x, from.y, c.x, c.label - R);
  });
  const final = last ? swing(last.x, last.bottom - 2, mid, end) : null;
  const leaves = (sw: { mx: number; my: number; angle: number }, style: CSSProperties) => (
    <g transform={`translate(${sw.mx.toFixed(1)} ${sw.my.toFixed(1)}) rotate(${sw.angle.toFixed(1)})`} style={style} fill={GOLD} fillOpacity="0.22" stroke={GOLD} strokeWidth="0.7" strokeLinejoin="round">
      {/* alternate leaves, as on a vine: one each side, a little apart */}
      <path d="M0 0C2.2-2.4 5.8-2.9 8.6-1.1 5.8 1.1 2.2 1.1 0 0Z" transform="translate(-5 0) rotate(-48)" />
      <path d="M0 0C2.2 2.4 5.8 2.9 8.6 1.1 5.8-1.1 2.2-1.1 0 0Z" transform="translate(4 0) rotate(48)" />
    </g>
  );

  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" fill="none">
      <g stroke={GOLD} strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" strokeDasharray="1 1">
        {chapters.map((c, i) => (
          <g key={i}>
            <path d={swings[i].d} pathLength={1} style={draw(shown(i), lag(i))} />
            {c.bottom - 2 > c.label + R && <path d={`M${c.x} ${c.label + R}V${c.bottom - 2}`} pathLength={1} style={draw(shown(i), lag(i) + 550, 800)} />}
          </g>
        ))}
        {final && <path d={final.d} pathLength={1} style={draw(endShown, endLag)} />}
      </g>
      {/* leaves at the middle of each swing */}
      {swings.map((sw, i) => (
        <g key={`l${i}`}>{leaves(sw, fadeIn(shown(i), lag(i) + 350))}</g>
      ))}
      {final && leaves(final, fadeIn(endShown, endLag + 350))}
      {/* a small flower at each chapter's label, all the same size: a lotus, then a champa */}
      {chapters.map((c, i) => (
        <g key={`f${i}`} transform={`translate(${c.x} ${c.label.toFixed(1)})`} style={fadeIn(shown(i), lag(i) + 450)}>
          {i % 2 === 0 ? (
            <g transform="scale(1.1)">
              <LotusMark />
            </g>
          ) : (
            <ChampaMark />
          )}
        </g>
      ))}
      {final && <circle cx={mid} cy={end + 2} r="1.8" fill={GOLD} style={fadeIn(endShown, endLag + 600)} />}
    </svg>
  );
}

/** A small gold lotus, drawn about the origin (for the thread). */
function LotusMark() {
  return (
    <g stroke={GOLD} strokeWidth="0.9" strokeLinejoin="round" fill="#F1DFAE">
      <path d="M0-7.5C2.6-4.6 2.6-1.4 0 1.8-2.6-1.4-2.6-4.6 0-7.5Z" />
      <path d="M0 1.8C-3.3 1.6-5.8-.5-6.5-3.7-3.3-3.2-1.2-1.2 0 1.8ZM0 1.8C3.3 1.6 5.8-.5 6.5-3.7 3.3-3.2 1.2-1.2 0 1.8Z" />
      <path d="M-6.5 4.2H6.5" fill="none" />
      <circle cy="7" r="0.9" fill={GOLD} stroke="none" />
    </g>
  );
}

/** A small gold champa (five petals), drawn about the origin (for the thread). */
function ChampaMark() {
  return (
    <g stroke={GOLD} strokeWidth="0.85" fill="#F6E7BE">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-4.4" rx="2.4" ry="3.9" transform={`rotate(${a})`} />
      ))}
      <circle r="1.7" fill={GOLD} stroke="none" />
    </g>
  );
}

/** Under the heading: fine gold lines either side of a small lotus. */
function LotusRule({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div aria-hidden className={`flex items-center justify-center gap-2 ${className}`} style={style}>
      <span className="h-px w-[4.5rem]" style={{ background: `linear-gradient(to right, transparent, ${GOLD})` }} />
      <svg viewBox="-17 -14 34 20" className="h-auto w-[30px]" fill="none" stroke={GOLD} strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round">
        <path d="M0-12C3.6-7.6 3.6-2.6 0 2-3.6-2.6-3.6-7.6 0-12Z" fill="#F3E2B6" />
        <path d="M0 2C-4.6 1.6-8.4-1.2-9.4-5.8-4.8-5.2-1.6-2.2 0 2ZM0 2C4.6 1.6 8.4-1.2 9.4-5.8 4.8-5.2 1.6-2.2 0 2Z" fill="#F8EBC8" />
        <path d="M-3.2 3.6C-9 3.8-13.4 1.6-15.4-2M3.2 3.6C9 3.8 13.4 1.6 15.4-2" />
        <circle cy="-4.4" r="1" fill={GOLD} stroke="none" />
      </svg>
      <span className="h-px w-[4.5rem]" style={{ background: `linear-gradient(to left, transparent, ${GOLD})` }} />
    </div>
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
