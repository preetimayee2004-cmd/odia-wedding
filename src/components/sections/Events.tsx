import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { flushSync } from "react-dom";
import { wedding, type WeddingEvent } from "@/config/wedding";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { smoothScrollTo } from "@/lib/scroll";
import { showPlaceholders } from "@/lib/placeholders";
import { Pending } from "@/components/ui/Pending";
import { EVENT_ART_DEFS, FLOWER_IDS, dustMarkup, rng } from "@/components/art/eventVineArt";

/**
 * Section — Wedding Events.
 * A green vine zigzags down the page from flower to flower — marigold, champa,
 * lotus, in turn — alternating left and right, growing as the guest scrolls.
 * Under each flower: the ceremony's name, its Odia name and a "Tap to view
 * details" button that opens a card (date, time, about, dress code, place).
 * One card is open at a time. Rose and marigold petals drift down over the
 * section. Styles: the `.ev-*` block in index.css.
 */
export function Events() {
  const { heading, items } = wedding.events;
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const vineRef = useRef<SVGSVGElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [open, setOpen] = useState(-1);
  const [instant, setInstant] = useState(-1); // a card closing without animation
  const [seen, setSeen] = useState<boolean[]>(() => items.map(() => false));
  const [onScreen, setOnScreen] = useState(false);

  useVine(timelineRef, vineRef, itemRefs, reduced);
  const dust = useMemo(() => items.map((_, i) => dustMarkup(i)), [items]);

  // flowers bloom as they scroll into view
  useEffect(() => {
    if (reduced) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.index);
          setSeen((s) => (s[i] ? s : s.map((v, k) => v || k === i)));
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.3 },
    );
    itemRefs.current.forEach((li) => li && io.observe(li.querySelector(".ev-flower")!));
    return () => io.disconnect();
  }, [reduced]);

  // petals, swaying and twinkling pause while the section is off screen
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(section);
    return () => io.disconnect();
  }, []);

  const toggle = (i: number) => {
    if (open === i) {
      setOpen(-1);
      return;
    }
    const li = itemRefs.current[i];
    const btn = li?.querySelector<HTMLButtonElement>(".ev-toggle");
    if (open !== -1 && open < i && btn) {
      // The open card is above: close it at once and keep this button where the guest tapped it.
      const before = btn.getBoundingClientRect().top;
      flushSync(() => {
        setInstant(open);
        setOpen(i);
      });
      window.scrollBy(0, btn.getBoundingClientRect().top - before);
      requestAnimationFrame(() => setInstant(-1));
    } else {
      setOpen(i);
    }
    requestAnimationFrame(() => li && bringIntoView(li));
  };

  const petals = useMemo(() => {
    const R = rng(77);
    return Array.from({ length: 16 }, (_, k) => {
      const d = 13 + R() * 11;
      return {
        kind: k % 2 ? "ev-petal-mari" : "ev-petal-rose",
        style: {
          "--x": `${(R() * 100).toFixed(1)}%`,
          "--d": `${d.toFixed(1)}s`,
          "--delay": `${(-R() * d).toFixed(1)}s`,
          "--s": (0.75 + R() * 0.7).toFixed(2),
          "--drift": `${(16 + R() * 30).toFixed(0)}px`,
          "--r0": `${(R() * 360).toFixed(0)}deg`,
        } as CSSProperties,
      };
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="events"
      aria-labelledby="events-heading"
      className={`ev relative overflow-x-clip ${reduced ? "" : "ev-motion"} ${onScreen ? "" : "ev-paused"}`}
      style={{ backgroundColor: "rgb(var(--page))" }}
    >
      {/* the shared artwork: gradients, leaf, petals and the three flowers */}
      <svg aria-hidden focusable="false" className="absolute h-0 w-0 overflow-hidden">
        <defs dangerouslySetInnerHTML={{ __html: EVENT_ART_DEFS }} />
      </svg>

      {/* Rose and marigold petals drift down the screen while the section is on it */}
      {!reduced && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] overflow-clip">
          <div className="sticky top-0 h-[100lvh] w-full">
            {petals.map((p, k) => (
              <span key={k} className="ev-petal" style={p.style}>
                <svg viewBox="-8 -8 16 16">
                  <use href={`#${p.kind}`} />
                </svg>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[460px]">
        <header className="px-12 pb-2 pt-14 text-center">
          <h2 id="events-heading" className="ev-title">
            {heading}
          </h2>
          <div aria-hidden className="ev-divider mt-3.5 flex items-center justify-center gap-2.5">
            <span />
            <i />
            <span />
          </div>
        </header>

        <div ref={timelineRef} className="relative pb-[110px] pt-10">
          <svg ref={vineRef} aria-hidden focusable="false" className="ev-vine pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" />
          <ol className="relative z-[1]">
            {items.map((event, i) => (
              <li
                key={event.id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className={`ev-item ${i % 2 ? "ev-right" : "ev-left"} ${i ? "pt-[30px]" : ""} ${seen[i] || reduced ? "in" : ""}`}
                style={swayStyle(i)}
              >
                <div className="ev-col">
                  <div className="ev-flower" data-index={i}>
                    <svg className="ev-dust" viewBox="-120 -120 240 240" aria-hidden dangerouslySetInnerHTML={{ __html: dust[i] }} />
                    <div className="ev-pop">
                      <svg className="ev-bloom" viewBox="-60 -60 120 120" aria-hidden>
                        <use href={`#${FLOWER_IDS[i % FLOWER_IDS.length]}`} />
                      </svg>
                    </div>
                  </div>
                  <h3 className="ev-name">{event.name}</h3>
                  {event.odiaName && (
                    <p lang="or" className="ev-odia">
                      {event.odiaName}
                    </p>
                  )}
                  <button type="button" className="ev-toggle" aria-expanded={open === i} aria-controls={`ev-details-${event.id}`} onClick={() => toggle(i)}>
                    <span>{open === i ? "Hide details" : "Tap to view details"}</span>
                    <svg viewBox="0 0 16 16" aria-hidden>
                      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <div
                  id={`ev-details-${event.id}`}
                  role="region"
                  aria-label={`${event.name} details`}
                  className={`ev-details ${open === i ? "open" : ""} ${instant === i ? "instant" : ""}`}
                >
                  <div className="ev-details-inner">
                    <div className="ev-details-pad">
                      <DetailsCard event={event} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** Each flower sways at its own pace. */
function swayStyle(i: number): CSSProperties {
  const R = rng(500 + i);
  return { "--sway-d": `${(4.4 + R() * 1.8).toFixed(2)}s`, "--sway-delay": `${(-R() * 4).toFixed(2)}s` } as CSSProperties;
}

function DetailsCard({ event }: { event: WeddingEvent }) {
  const rows: Array<{ label: string; value: string | null; className?: string; map?: string | null }> = [
    { label: "Date", value: event.date },
    { label: "Time", value: event.when && keepTimesTogether(event.when) },
    { label: "About", value: event.about, className: "about" },
    { label: "Dress code", value: event.dressCode && event.dressCode.split(" | ").join(" · ") },
    { label: "Place", value: event.venueName, map: event.mapUrl },
  ];
  return (
    <dl className="ev-card">
      {rows
        .filter((r) => r.value || showPlaceholders)
        .map((r) => (
          <div key={r.label} className={`ev-row ${r.className ?? ""}`}>
            <dt>{r.label}</dt>
            <dd>
              {r.value ?? <Pending label={`${r.label} awaiting confirmation`}>To be confirmed</Pending>}
              {r.value && r.map && (
                <>
                  <br />
                  <a className="ev-maplink" href={r.map} target="_blank" rel="noopener noreferrer">
                    View map <span aria-hidden>↗</span>
                  </a>
                </>
              )}
            </dd>
          </div>
        ))}
    </dl>
  );
}

/** "10:00 AM – 1:00 PM" may break only after the dash, never inside "10:00 AM". */
const keepTimesTogether = (text: string) => text.replace(/(\d) (AM|PM)/g, "$1 $2");

/** Scrolls so an opening card (and the button above it) are in view. */
function bringIntoView(li: HTMLLIElement) {
  const btn = li.querySelector(".ev-toggle");
  const details = li.querySelector(".ev-details");
  const inner = li.querySelector(".ev-details-inner");
  if (!btn || !details || !inner) return;
  // clear of the floating sound button (and the mockup's status bar)
  const statusBar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--status-bar")) || 0;
  const topClear = statusBar + 72;
  const bottom = details.getBoundingClientRect().top + inner.scrollHeight; // the card's final height
  const btnTop = btn.getBoundingClientRect().top;
  let delta = 0;
  if (bottom > window.innerHeight - 16) delta = bottom - (window.innerHeight - 16);
  delta = Math.min(delta, btnTop - topClear); // never push the button off the top
  if (btnTop < topClear) delta = btnTop - topClear;
  if (Math.abs(delta) > 2) void smoothScrollTo(window.scrollY + delta, 650);
}

/* ---------- the vine ---------- */

type Pt = [number, number];
type Seg = [Pt, Pt, Pt, Pt];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const bez = (s: Seg, t: number): Pt => {
  const u = 1 - t;
  const at = (k: 0 | 1) => u * u * u * s[0][k] + 3 * u * u * t * s[1][k] + 3 * u * t * t * s[2][k] + t * t * t * s[3][k];
  return [at(0), at(1)];
};
const bezTan = (s: Seg, t: number): Pt => {
  const u = 1 - t;
  const at = (k: 0 | 1) => 3 * u * u * (s[1][k] - s[0][k]) + 6 * u * t * (s[2][k] - s[1][k]) + 3 * t * t * (s[3][k] - s[2][k]);
  return [at(0), at(1)];
};
const deg = (v: Pt) => (Math.atan2(v[1], v[0]) * 180) / Math.PI;
const f1 = (n: number) => n.toFixed(1);
const SAMPLES = 32;

/**
 * Draws the vine through the flowers' centres — a lead-in, an S-curve from
 * each flower to the next, a curling tail — with leaves and tendrils, and
 * grows it down to just above the bottom of the screen as the guest scrolls.
 * Redrawn whenever the timeline changes size (a card opening, fonts loading).
 */
function useVine(
  timelineRef: RefObject<HTMLDivElement>,
  vineRef: RefObject<SVGSVGElement>,
  itemRefs: RefObject<(HTMLLIElement | null)[]>,
  reduced: boolean,
) {
  useEffect(() => {
    const timeline = timelineRef.current;
    const vine = vineRef.current;
    if (!timeline || !vine) return;

    let samples: Array<{ len: number; y: number }> = [];
    let total = 1;
    let realTotal = 1;
    let strokes: SVGPathElement[] = [];
    let leaves: Array<{ len: number; el: Element }> = [];

    const layout = () => {
      const lis = (itemRefs.current ?? []).filter((li): li is HTMLLIElement => !!li);
      if (!lis.length) return;
      const tl = timeline.getBoundingClientRect();
      const W = tl.width;
      const H = tl.height;
      const pts = lis.map((li) => {
        const f = li.querySelector(".ev-flower")!.getBoundingClientRect();
        return { x: f.left - tl.left + f.width / 2, y: f.top - tl.top + f.height / 2, bottom: li.getBoundingClientRect().bottom - tl.top };
      });

      const segs: Seg[] = [];
      const a0 = pts[0];
      segs.push([[a0.x + 44, 4], [a0.x + 40, a0.y - 74], [a0.x, a0.y - 66], [a0.x, a0.y]]);
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const dy = b.y - a.y;
        segs.push([[a.x, a.y], [a.x, a.y + dy * 0.5], [b.x, b.y - dy * 0.5], [b.x, b.y]]);
      }
      const z = pts[pts.length - 1];
      const endX = W / 2;
      const endY = Math.min(H - 30, z.bottom + 56);
      segs.push([[z.x, z.y], [z.x, z.y + (endY - z.y) * 0.6], [lerp(z.x, endX, 0.8), endY - 40], [endX, endY]]);

      // arc lengths, and points down the vine for the scroll drawing
      samples = [];
      total = 0;
      const segStart: number[] = [];
      const segCum: number[][] = [];
      for (const s of segs) {
        segStart.push(total);
        const cum = [0];
        let prev = bez(s, 0);
        let acc = 0;
        samples.push({ len: total, y: prev[1] });
        for (let k = 1; k <= SAMPLES; k++) {
          const p = bez(s, k / SAMPLES);
          acc += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
          cum.push(acc);
          samples.push({ len: total + acc, y: p[1] });
          prev = p;
        }
        segCum.push(cum);
        total += acc;
      }
      const lenAt = (si: number, t: number) => {
        const c = segCum[si];
        const k = Math.min(SAMPLES - 1, Math.floor(t * SAMPLES));
        return segStart[si] + lerp(c[k], c[k + 1], t * SAMPLES - k);
      };

      // leaves, tendrils and the end curl
      const bits: Array<{ len: number; svg: string }> = [];
      const leaf = (si: number, t: number, angle: number, scale: number) => {
        const p = bez(segs[si], t);
        const th = deg(bezTan(segs[si], t));
        bits.push({
          len: lenAt(si, t),
          svg: `<g transform="translate(${f1(p[0])} ${f1(p[1])}) rotate(${f1(th + 180 + angle)}) scale(${scale})"><use href="#ev-leaf" class="lf"/></g>`,
        });
      };
      const pair = (si: number, t: number, scale: number) => {
        leaf(si, t, -52, scale);
        leaf(si, t + 0.01, 52, scale * 0.92);
      };
      const tendril = (si: number, t: number, side: number) => {
        const p = bez(segs[si], t);
        const th = deg(bezTan(segs[si], t));
        bits.push({
          len: lenAt(si, t),
          svg: `<g transform="translate(${f1(p[0])} ${f1(p[1])}) rotate(${f1(th + 180 + side * 70)})"><path class="tendril lf" d="M0 0c7-1 15-5 16-12 1-6-6-9-9-4-2 3 1 6 4 4"/></g>`,
        });
      };
      pair(0, 0.5, 1.05);
      for (let si = 1; si < segs.length - 1; si++) {
        pair(si, 0.62, 0.78);
        tendril(si, 0.72, si % 2 ? 1 : -1);
        pair(si, 0.86, 1.1);
      }
      const last = segs.length - 1;
      pair(last, 0.4, 0.82);
      leaf(last, 0.78, -55, 0.75);
      {
        const p = segs[last][3];
        const th = deg(bezTan(segs[last], 1));
        bits.push({
          len: total - 1,
          svg: `<g transform="translate(${f1(p[0])} ${f1(p[1])}) rotate(${f1(th)})"><path class="tendril lf" style="stroke-width:2.2" d="M0 0c8 1 14 5 13 11-1 5-8 6-10 2-1-3 2-5 4-3"/></g>`,
        });
      }

      const P = (q: Pt) => `${f1(q[0])} ${f1(q[1])}`;
      const d = `M${P(segs[0][0])}` + segs.map((s) => `C${P(s[1])} ${P(s[2])} ${P(s[3])}`).join("");
      vine.setAttribute("viewBox", `0 0 ${f1(W)} ${f1(H)}`);
      vine.innerHTML =
        `<g filter="url(#ev-vine-shadow)">` +
        `<path class="stem" d="${d}"/><path class="stem-mid" d="${d}"/><path class="stem-hl" d="${d}" transform="translate(-1 -0.9)"/>` +
        bits.map((b) => b.svg).join("") +
        `</g>`;
      strokes = Array.from(vine.querySelectorAll<SVGPathElement>(".stem, .stem-mid, .stem-hl"));
      realTotal = strokes[0].getTotalLength();
      const els = vine.querySelectorAll(".lf");
      leaves = bits.map((b, k) => ({ len: b.len, el: els[k] }));
      draw();
    };

    const draw = () => {
      let len = total;
      // at the foot of the page the vine finishes, since it can scroll no further
      const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 80;
      if (!reduced && !atEnd) {
        const target = window.innerHeight * 0.86 - timeline.getBoundingClientRect().top;
        len = 0;
        for (let k = 0; k < samples.length; k++) {
          if (samples[k].y > target) {
            const prev = samples[k - 1];
            len = prev ? lerp(prev.len, samples[k].len, Math.max(0, Math.min(1, (target - prev.y) / (samples[k].y - prev.y || 1)))) : 0;
            break;
          }
          len = samples[k].len;
        }
      }
      const shown = (len / total) * realTotal;
      for (const s of strokes) {
        s.style.strokeDasharray = `${realTotal + 2} ${realTotal + 2}`;
        s.style.strokeDashoffset = String(realTotal - shown);
      }
      for (const b of leaves) b.el.classList.toggle("on", b.len <= len);
    };

    let layoutFrame = 0;
    let drawFrame = 0;
    const scheduleLayout = () => {
      if (!layoutFrame) layoutFrame = requestAnimationFrame(() => ((layoutFrame = 0), layout()));
    };
    const scheduleDraw = () => {
      if (!drawFrame) drawFrame = requestAnimationFrame(() => ((drawFrame = 0), draw()));
    };
    const ro = new ResizeObserver(scheduleLayout);
    ro.observe(timeline);
    window.addEventListener("resize", scheduleLayout);
    window.addEventListener("scroll", scheduleDraw, { passive: true });
    void document.fonts?.ready.then(scheduleLayout);
    layout();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", scheduleLayout);
      window.removeEventListener("scroll", scheduleDraw);
      cancelAnimationFrame(layoutFrame);
      cancelAnimationFrame(drawFrame);
    };
  }, [timelineRef, vineRef, itemRefs, reduced]);
}
