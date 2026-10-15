import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { EASE } from "@/lib/motion";

// The countdown section's text colours
const VERMILION = "#7A1424"; // headings (the countdown's maroon)
const LABEL = "#A6782C"; // eyebrow and chapter labels (the countdown's gold)
const TEXT = "#2B1A14"; // paragraphs (the countdown's ink)
const LINE = "#B4483E"; // the doodle line: muted vermilion
const PENCIL = "#7A5A3C"; // antique brown pencil strokes
const ART = "/art/story";

/**
 * The couple's parchment (1024 px wide): its top (an Odisha temple, a corner
 * flourish) and bottom (a corner flourish, the Konark wheel) stay whole; a
 * band of plain paper repeats between them. Positions are in its pixels.
 */
const PAPER_W = 1024;
const PIECE_H = 440;
const COUPLE = { w: 202, h: 228 };
const cq = (px: number) => `${((px / PAPER_W) * 100).toFixed(3)}cqw`;

/**
 * Section 05 — Our Story.
 * A handmade illustrated journal on the couple's parchment: "Two Hearts, One
 * Journey" over the heading, then four chapters joined by a hand-drawn
 * vermilion line that wanders from side to side — the words alternating
 * either side of it, with small pencil doodles — and draws itself as the
 * guest scrolls, leading down to the bride and groom.
 */
export function Story() {
  const { eyebrow, heading, chapters } = wedding.story;
  const headerRef = useRef<HTMLDivElement>(null);
  const headerIn = useInView(headerRef);
  const listRef = useRef<HTMLDivElement>(null);
  const coupleRef = useRef<HTMLDivElement>(null);
  const coupleIn = useInView(coupleRef, { threshold: 0.3 });

  const fade = (delay: number): CSSProperties => ({
    opacity: headerIn ? 1 : 0,
    transform: headerIn ? "none" : "translateY(8px)",
    transition: `opacity 900ms ${EASE.silk} ${delay}ms, transform 1000ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section
      id="story"
      aria-labelledby="story-heading"
      className="relative overflow-hidden [container-type:inline-size]"
      style={{ backgroundColor: "#F8F2E5", backgroundImage: `url(${ART}/paper.webp)`, backgroundSize: `100% auto`, backgroundRepeat: "repeat-y" }}
    >
      <img src={`${ART}/top.webp`} alt="" aria-hidden decoding="async" loading="lazy" className="pointer-events-none absolute inset-x-0 top-0 w-full" style={{ aspectRatio: `${PAPER_W} / ${PIECE_H}` }} />
      <img src={`${ART}/bottom.webp`} alt="" aria-hidden decoding="async" loading="lazy" className="pointer-events-none absolute inset-x-0 bottom-0 w-full" style={{ aspectRatio: `${PAPER_W} / ${PIECE_H}` }} />

      <ArrivingThread />

      {/* Below the temple's ground line, clear of the corner flourish */}
      <div ref={headerRef} className="relative text-center" style={{ paddingTop: cq(318) }}>
        <p className="font-hand text-[22px] font-medium leading-none md:text-[26px]" style={{ ...fade(0), color: LABEL }}>
          {eyebrow}
        </p>
        <h2 id="story-heading" className="relative mt-2 inline-block font-display text-[44px] font-semibold leading-none md:text-[68px]" style={{ ...fade(120), color: VERMILION }}>
          {heading}
          <Heart className="absolute -right-6 -top-1 h-5 w-5 md:-right-8 md:h-6 md:w-6" />
        </h2>
        <Underline className="mx-auto mt-1 block h-3 w-[11.5rem] md:w-[17rem]" style={fade(260)} />
      </div>

      {/* The chapters, joined by the hand-drawn line */}
      <div ref={listRef} className="relative mx-auto mt-8 max-w-[34rem] px-5">
        <DoodleLine listRef={listRef} coupleRef={coupleRef} />
        <ol className="relative">
          {chapters.map((c, i) => (
            <Chapter key={c.label} index={i} last={i === chapters.length - 1} {...c} />
          ))}
        </ol>

        {/* The bride and groom, where the line comes to rest */}
        <div
          ref={coupleRef}
          className="relative mx-auto mt-6 w-[46%] max-w-[13rem]"
          style={{
            marginBottom: cq(120),
            opacity: coupleIn ? 1 : 0,
            transition: `opacity 1400ms ${EASE.silk} 200ms`,
          }}
        >
          <Sprinkle className="absolute -left-[22%] top-[18%] h-7 w-7" kind="heart" />
          <Sprinkle className="absolute -right-[20%] top-[8%] h-6 w-6" kind="flower" />
          <Sprinkle className="absolute -right-[12%] top-[40%] h-4 w-4" kind="heart" />
          <img
            src={`${ART}/couple.png`}
            alt="The bride and groom sitting together, his arm around her"
            width={COUPLE.w}
            height={COUPLE.h}
            decoding="async"
            loading="lazy"
            className="relative block h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}

const DOODLES: Array<(props: { className?: string }) => ReactNode> = [
  (p) => <Doodle {...p} kind="flower" />,
  (p) => <Doodle {...p} kind="leaves" />,
  (p) => <Doodle {...p} kind="bells" />,
  (p) => <Doodle {...p} kind="hearts" />,
];

function Chapter({ index, last, label, title, text }: { index: number; last: boolean; label: string; title: string; text: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { threshold: 0.35 });
  const lineLeft = index % 2 === 0; // the line runs down the left; the words sit to its right
  const DoodleFor = DOODLES[index % DOODLES.length];

  return (
    <li
      ref={ref}
      data-chapter
      data-side={lineLeft ? "left" : "right"}
      className={`relative ${last ? "pb-4" : "pb-16"} ${lineLeft ? "pl-[16%] pr-[12%] text-left" : "pl-[12%] pr-[16%] text-right"}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : `translateX(${lineLeft ? 14 : -14}px)`,
        transition: `opacity 900ms ${EASE.silk}, transform 1000ms ${EASE.silk}`,
      }}
    >
      <p className="font-hand text-[20px] font-medium leading-none" style={{ color: LABEL }}>
        {label}
      </p>
      <h3 className="mt-1 font-display text-[26px] font-semibold leading-[1.1] md:text-[32px]" style={{ color: VERMILION }}>
        {title}
      </h3>
      <p className="mt-2 font-lora text-[15.5px] leading-[1.6] md:text-[17px]" style={{ color: TEXT }}>
        {text}
      </p>
      <DoodleFor className={`absolute top-1 h-8 w-8 ${lineLeft ? "right-[2%]" : "left-[2%]"}`} />
    </li>
  );
}

/**
 * The hand-drawn vermilion line: down the left of the first chapter, across
 * to the right for the second, and so on, then on to the couple. A faint
 * second pencil stroke sits just beside it; it draws itself with the scroll.
 */
function DoodleLine({ listRef, coupleRef }: { listRef: RefObject<HTMLDivElement>; coupleRef: RefObject<HTMLDivElement> }) {
  const reducedMotion = usePrefersReducedMotion();
  const [geo, setGeo] = useState<{ w: number; h: number; d: string; nodes: Array<[number, number]> } | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const pencilRef = useRef<SVGPathElement>(null);

  // Trace the line through the chapters as laid out
  useLayoutEffect(() => {
    const list = listRef.current;
    const couple = coupleRef.current;
    if (!list || !couple) return;
    const measure = () => {
      const box = list.getBoundingClientRect();
      const w = box.width;
      const xL = w * 0.09;
      const xR = w * 0.91;
      const chapters = [...list.querySelectorAll<HTMLElement>("[data-chapter]")];
      const pts: Array<[number, number]> = [];
      const nodes: Array<[number, number]> = [];
      chapters.forEach((el) => {
        const r = el.getBoundingClientRect();
        const x = el.dataset.side === "left" ? xL : xR;
        const top = r.top - box.top + 6;
        const bottom = r.bottom - box.top - (el.nextElementSibling ? 34 : 18);
        nodes.push([x, top + 4]);
        pts.push([x, top], [x, bottom]);
      });
      const c = couple.getBoundingClientRect();
      pts.push([w / 2, c.top - box.top - 6]);
      setGeo({ w, h: box.height, d: handDrawn(pts), nodes });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    void document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [listRef, coupleRef]);

  // Draw it as the guest scrolls
  useEffect(() => {
    const path = pathRef.current;
    const pencil = pencilRef.current;
    const list = listRef.current;
    if (!path || !pencil || !list || !geo) return;
    const len = path.getTotalLength();
    const paths = [path, pencil];
    if (reducedMotion) {
      paths.forEach((p) => (p.style.strokeDasharray = "none"));
      return;
    }
    paths.forEach((p) => (p.style.strokeDasharray = `${len} ${len}`));
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = list.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.92 - r.top) / r.height));
      const offset = (len * (1 - progress)).toFixed(1);
      paths.forEach((p) => (p.style.strokeDashoffset = offset));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [geo, listRef, reducedMotion]);

  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}>
      {geo && (
        <>
          <path ref={pencilRef} d={geo.d} fill="none" stroke={PENCIL} strokeOpacity="0.32" strokeWidth="1" strokeLinecap="round" transform="translate(1.6 1.2)" />
          <path ref={pathRef} d={geo.d} fill="none" stroke={LINE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          {geo.nodes.map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r="5.2" fill="#F3E6CF" stroke={LINE} strokeWidth="1.4" />
              <circle r="2" fill={LINE} />
            </g>
          ))}
        </>
      )}
    </svg>
  );
}

/**
 * A path through the points with a gently uneven, hand-drawn wobble: straight
 * runs waver a little; crossings between sides swing in loose curves.
 */
function handDrawn(pts: Array<[number, number]>): string {
  // small deterministic wobble
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280 - 0.5;
  };
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    if (Math.abs(x1 - x0) < 1) {
      // a run down one side: a few soft wobbles
      const steps = Math.max(1, Math.round((y1 - y0) / 46));
      for (let s = 1; s <= steps; s++) {
        const y = y0 + ((y1 - y0) * s) / steps;
        const ym = y0 + ((y1 - y0) * (s - 0.5)) / steps;
        d += `Q${f(x0 + rnd() * 9)} ${f(ym)} ${f(x0 + rnd() * 2.5)} ${f(y)}`;
      }
    } else {
      // a crossing: sweep out, a small pencil loop halfway, then sweep in
      const dir = Math.sign(x1 - x0);
      const xm = (x0 + x1) / 2 + rnd() * 14;
      const ym = (y0 + y1) / 2 + 4;
      d += `C${f(x0)} ${f(y0 + (ym - y0) * 0.9)} ${f(xm - dir * 60)} ${f(ym + 6)} ${f(xm)} ${f(ym)}`;
      d += `C${f(xm + dir * 15)} ${f(ym - 2)} ${f(xm + dir * 15)} ${f(ym - 19)} ${f(xm + dir * 3)} ${f(ym - 19)}`;
      d += `C${f(xm - dir * 9)} ${f(ym - 19)} ${f(xm - dir * 7)} ${f(ym - 1)} ${f(xm + dir * 10)} ${f(ym + 1)}`;
      d += `C${f(xm + dir * 70)} ${f(ym + 4)} ${f(x1)} ${f(y1 - (y1 - ym) * 0.9)} ${f(x1)} ${f(y1)}`;
    }
  }
  return d;
}

/**
 * The thread from the countdown's wheel divider, continuing down the middle
 * of the page (clear of the temple sketch) to a small vermilion lotus bud just
 * above "Two Hearts, One Journey".
 */
function ArrivingThread() {
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center" style={{ height: `calc(${cq(318)} - 14px)` }}>
      <svg viewBox="0 0 12 100" preserveAspectRatio="none" className="w-3 flex-1">
        <path d="M6 0c.8 18-.9 34 .2 52 .7 14-.5 30-.2 48" fill="none" stroke="#A6782C" strokeWidth="1.15" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <svg viewBox="0 0 30 34" className="-mt-px h-[34px] w-[30px]">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* two small leaves on the stem */}
          <path d="M15 4c-3.6-3.4-8.4-3.4-11.2-.6 3.4 2.8 8 2.8 11.2.6Z" stroke={LINE} fill={`${LINE}26`} strokeWidth="0.9" />
          <path d="M15 8.4c3.6-3.4 8.4-3.4 11.2-.6-3.4 2.8-8 2.8-11.2.6Z" stroke={LINE} fill={`${LINE}26`} strokeWidth="0.9" />
          <path d="M15 0v12" stroke="#A6782C" strokeWidth="1.15" />
          {/* the lotus bud */}
          <path d="M15 12.6c3.6 3 4.4 9.6 0 15.6-4.4-6-3.6-12.6 0-15.6Z" stroke={LINE} fill={`${LINE}33`} strokeWidth="1.1" />
          <path d="M15 28c-3-.6-6.4-3.6-7-8.4 3.4.4 6 3.2 7 8.4Zm0 0c3-.6 6.4-3.6 7-8.4-3.4.4-6 3.2-7 8.4Z" stroke={LINE} strokeWidth="1" />
          <circle cx="15" cy="31.6" r="1" fill="#A6782C" stroke="none" />
        </g>
      </svg>
    </div>
  );
}

/** A small hand-drawn heart, beside the heading. */
function Heart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke={LINE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.2 20.3C7 16.6 3.4 13.2 3.6 9.1 3.8 6.2 6 4.4 8.3 4.6c1.9.1 3.1 1.4 3.8 2.9.8-1.6 2.2-2.9 4.2-2.9 2.5.1 4.3 2.1 4.1 4.8-.3 4-4 7.4-8.2 10.9Z" fill={`${LINE}22`} />
      <path d="M6.4 8.2c.3-1 1-1.6 1.9-1.7" strokeOpacity="0.6" />
    </svg>
  );
}

/** An imperfect, hand-drawn underline. */
function Underline({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 200 12" preserveAspectRatio="none" className={className} style={style} aria-hidden fill="none" stroke={LINE} strokeLinecap="round">
      <path d="M4 7.5C38 4.6 72 5.8 104 6.6s62-.4 92-3.2" strokeWidth="1.8" />
      <path d="M22 9.6c30-1.6 64-1.2 96-.4" strokeWidth="1" strokeOpacity="0.5" />
    </svg>
  );
}

/** Pencil doodles near the chapters: a flower, leaves, temple bells, hearts. */
function Doodle({ kind, className = "" }: { kind: "flower" | "leaves" | "bells" | "hearts"; className?: string }) {
  const stroke = { fill: "none", stroke: PENCIL, strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      {kind === "flower" && (
        <g {...stroke}>
          {[0, 72, 144, 216, 288].map((a) => (
            <path key={a} d="M16 15c-2.4-3-2.2-6.6.2-8.3 2.3 1.9 2.2 5.4-.2 8.3Z" transform={`rotate(${a} 16 15.5)`} />
          ))}
          <circle cx="16" cy="15.5" r="1.8" fill={`${LINE}66`} stroke={LINE} />
          <path d="M16 18c.4 4 1.6 7.4 3.8 10" />
        </g>
      )}
      {kind === "leaves" && (
        <g {...stroke}>
          <path d="M6 27C11 20 16 13 26 6" />
          <path d="M11 20.5c-3.6-.4-5.6-2.8-5.4-5.6 3 .2 5 2.6 5.4 5.6ZM15.6 15c-.2-3.6 1.8-5.8 4.6-6-.2 3-2.2 5.4-4.6 6ZM14.6 16.6c3.4 1.2 6.4.2 7.6-2.4-2.8-1-5.8.2-7.6 2.4ZM9 23.4c3.2 1.6 6.4.8 7.8-1.6-2.6-1.4-5.8-.6-7.8 1.6Z" />
          <circle cx="25" cy="21" r="1.1" fill={LINE} stroke="none" />
        </g>
      )}
      {kind === "bells" && (
        <g {...stroke}>
          <path d="M5 4.5c7 1.8 15 1.8 22 0" />
          <path d="M11 5.4v4.4M21 5.4v4.4" />
          <path d="M7.4 18.6c.4-5 1.6-8.6 3.6-8.6s3.2 3.6 3.6 8.6Z M17.4 18.6c.4-5 1.6-8.6 3.6-8.6s3.2 3.6 3.6 8.6Z" fill={`${LINE}1F`} />
          <path d="M6.6 18.6h8.8M16.6 18.6h8.8" />
          <circle cx="11" cy="20.6" r="1.1" fill={LINE} stroke="none" />
          <circle cx="21" cy="20.6" r="1.1" fill={LINE} stroke="none" />
        </g>
      )}
      {kind === "hearts" && (
        <g {...stroke}>
          <path d="M11 17.6c-3.6-2.6-6-5-5.8-7.8.1-2 1.6-3.2 3.2-3.1 1.3.1 2.1 1 2.6 2 .6-1.1 1.5-2 2.9-2 1.7.1 3 1.5 2.8 3.3-.2 2.8-2.8 5.2-5.7 7.6Z" stroke={LINE} fill={`${LINE}1F`} />
          <path d="M22.4 25.4c-2.4-1.7-4-3.4-3.9-5.2.1-1.3 1.1-2.1 2.2-2.1.9.1 1.4.7 1.8 1.4.4-.7 1-1.4 2-1.4 1.1.1 2 1 1.9 2.2-.1 1.9-1.9 3.5-4 5.1Z" stroke={LINE} />
          <path d="M24 9.4c1.2.8 2 1.8 2.4 3M26.6 7.6l1.2-.6" />
        </g>
      )}
    </svg>
  );
}

/** Tiny hand-drawn hearts and flowers sprinkled near the couple. */
function Sprinkle({ kind, className = "" }: { kind: "heart" | "flower"; className?: string }) {
  return kind === "heart" ? (
    <Heart className={className} />
  ) : (
    <Doodle kind="flower" className={className} />
  );
}
