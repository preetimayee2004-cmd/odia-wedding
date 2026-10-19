import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { flushSync } from "react-dom";
import { wedding, type WeddingEvent } from "@/config/wedding";
import { JhotiRule } from "@/components/ui/JhotiThreshold";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { smoothScrollTo } from "@/lib/scroll";
import { downloadIcs, eventCalendarItem, googleCalendarUrl, shortTime } from "@/lib/calendar";
import { directionsUrl } from "@/lib/maps";
import { showPlaceholders } from "@/lib/placeholders";
import { Pending } from "@/components/ui/Pending";
import { EVENT_ART_DEFS, FLOWER_IDS, rng } from "@/components/art/eventVineArt";

/**
 * Section — Wedding Events.
 * A green vine zigzags down the page from flower to flower — marigold, champa,
 * lotus, in turn — alternating left and right, growing as the guest scrolls.
 * Under each flower: the ceremony's name, its Odia name, its day and date
 * ("Wed · 10 February 2027"), and a "Tap to view details" button that opens a
 * panel: the event's illustration, quick facts (time, place, what to wear),
 * a few words on the ritual, the dress code with its colours, and Calendar
 * and Directions. One panel is open at a time.
 * Styles: the `.ev-*` block in index.css.
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

  // swaying and twinkling pause while the section is off screen
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

  return (
    <section
      ref={sectionRef}
      id="events"
      aria-labelledby="events-heading"
      className={`ev relative overflow-x-clip ${reduced ? "" : "ev-motion"} ${onScreen ? "" : "ev-paused"}`}
      style={{ backgroundColor: "rgb(var(--page))" }}
    >
      {/* the shared artwork: gradients, leaf and the three flowers */}
      <svg aria-hidden focusable="false" className="absolute h-0 w-0 overflow-hidden">
        <defs dangerouslySetInnerHTML={{ __html: EVENT_ART_DEFS }} />
      </svg>

      <div className="mx-auto max-w-[460px]">
        <header className="px-12 pb-2 pt-7 text-center">
          <h2 id="events-heading" className="ev-title">
            {heading}
          </h2>
          <JhotiRule motif="champa" className="mt-3" />
        </header>

        <div ref={timelineRef} className="relative pb-[56px] pt-10">
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
                  <When event={event} />
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

/** "Wednesday, 10 February 2027" → ["Wednesday", "10 February 2027"]. */
const splitDate = (date: string): [string, string | null] => {
  const k = date.indexOf(",");
  return k < 0 ? [date, null] : [date.slice(0, k).trim(), date.slice(k + 1).trim()];
};
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "Wed · 10 February 2027", always visible under the Odia name. */
function When({ event }: { event: WeddingEvent }) {
  if (!event.date) return showPlaceholders ? <p className="ev-when"><Pending label="Date awaiting confirmation">Date to be announced</Pending></p> : null;
  const [weekday, rest] = splitDate(event.date);
  const day = WEEKDAYS.includes(weekday) ? weekday.slice(0, 3) : null;
  return (
    <p className="ev-when">
      {day && rest ? (
        <>
          <b>{day}</b> · {rest}
        </>
      ) : (
        event.date
      )}
    </p>
  );
}

/**
 * The panel behind "Tap to view details" (the name is already above it): a
 * maroon-and-gold band along its top, the Odia name as a faint watermark,
 * the event's illustration; three quick-fact chips (time, place, what to
 * wear); a few words on the ritual; the dress code with its colours; and
 * Calendar (Google Calendar, or an .ics file) and Directions.
 */
function DetailsCard({ event }: { event: WeddingEvent }) {
  const { venue } = wedding;
  const time = event.when ? shortTime(event.when) : null;
  const [lead, style] = event.dressCode?.includes(" | ") ? event.dressCode.split(" | ") : [null, event.dressCode];
  const wear = event.wear ?? lead?.split(/\s+/)[0] ?? event.dressCode?.split(/[\s:]+/)[0] ?? null;
  const colors = event.dressColors ?? [];
  const calendar = eventCalendarItem(event);
  const directions = event.mapUrl ?? directionsUrl({ mapsUrl: venue.mapsUrl, name: venue.name, address: venue.address });
  const step = (i: number) => ({ "--i": i }) as CSSProperties;
  const toCome = (what: string) => (showPlaceholders ? <Pending label={`${what} awaiting confirmation`}>To come</Pending> : "—");

  return (
    <div className="evp">
      <span aria-hidden className="evp-band" />
      {event.odiaName && (
        <span aria-hidden lang="or" className="evp-mark">
          {event.odiaName}
        </span>
      )}
      <img src={`/art/events/icons/${event.id}.webp`} alt="" aria-hidden decoding="async" loading="lazy" className="evp-icon" />

      <ul className="evp-chips evp-in" style={step(0)}>
        <li className="evp-chip">
          <ClockIcon />
          <span className="evp-value">{time ?? (event.isLagna ? "At the lagna" : toCome("Time"))}</span>
          <span className="evp-chip-label">Time</span>
        </li>
        <li className="evp-chip">
          <MandapIcon />
          <span className="evp-value">{event.venueName ?? toCome("Place")}</span>
          <span className="evp-chip-label">Place</span>
        </li>
        <li className="evp-chip">
          <WearIcon />
          <span className="evp-value">{wear ?? toCome("Dress code")}</span>
          <span className="evp-chip-label">Wear</span>
        </li>
      </ul>

      {event.about && (
        <p className="evp-about evp-in" style={step(1)}>
          {event.about}
        </p>
      )}

      {(style || colors.length > 0) && (
        <div className="evp-dress evp-in" style={step(2)}>
          <div className="min-w-0">
            <p className="evp-label">Dress code</p>
            {style && <p className="evp-style">{style}</p>}
          </div>
          {colors.length > 0 && (
            <span className="evp-dots" aria-label={`Colours to wear: ${colors.length}`} role="img">
              {colors.map((c) => (
                <i key={c} style={{ background: c }} />
              ))}
            </span>
          )}
        </div>
      )}

      <div className="evp-actions evp-in" style={step(3)}>
        <div className="grid grid-cols-2 gap-2">
          {calendar ? (
            <a className="evp-btn evp-btn-fill" href={googleCalendarUrl(calendar)} target="_blank" rel="noopener noreferrer">
              <CalendarIcon /> Calendar
            </a>
          ) : (
            <span className="evp-btn evp-btn-fill opacity-50">
              <CalendarIcon /> Calendar
            </span>
          )}
          {directions ? (
            <a className="evp-btn evp-btn-line" href={directions} target="_blank" rel="noopener noreferrer">
              <PinIcon /> Directions
            </a>
          ) : (
            <span className="evp-btn evp-btn-line opacity-50">
              <PinIcon /> Directions
            </span>
          )}
        </div>
        {calendar && (
          <button type="button" className="evp-ics" onClick={() => downloadIcs(calendar)}>
            or download an .ics file
          </button>
        )}
      </div>
    </div>
  );
}

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
function ClockIcon() {
  return (
    <svg viewBox="0 0 18 18" className="evp-chip-icon" aria-hidden {...line}>
      <circle cx="9" cy="9" r="7" />
      <path d="M9 5v4l2.6 1.6" />
    </svg>
  );
}
function MandapIcon() {
  return (
    <svg viewBox="0 0 18 18" className="evp-chip-icon" aria-hidden {...line}>
      <path d="M9 1.5 10 3M3 7c1.5-2.6 3.6-4 6-4s4.5 1.4 6 4Z" />
      <path d="M2.5 7h13M4 7v8.5M14 7v8.5M2 16h14" />
      <path d="M6.5 7c0 2 1.1 3 2.5 3s2.5-1 2.5-3" />
    </svg>
  );
}
function WearIcon() {
  return (
    <svg viewBox="0 0 18 18" className="evp-chip-icon" aria-hidden {...line}>
      <path d="M7.2 4.2a1.8 1.8 0 1 1 2.6 1.6c-.5.3-.8.6-.8 1.2v.6" />
      <path d="M9 7.6 2.2 12.4c-.7.5-.4 1.6.5 1.6h12.6c.9 0 1.2-1.1.5-1.6L9 7.6Z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden {...line}>
      <rect x="2.5" y="3.5" width="13" height="12" rx="2" />
      <path d="M2.5 7.5h13M6 2v3M12 2v3" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden {...line}>
      <path d="M9 16.5c-3-3.6-5-6.2-5-8.8a5 5 0 0 1 10 0c0 2.6-2 5.2-5 8.8Z" />
      <circle cx="9" cy="7.6" r="1.8" />
    </svg>
  );
}

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
      const bud = (si: number, t: number, side: number) => {
        const p = bez(segs[si], t);
        const th = deg(bezTan(segs[si], t));
        bits.push({
          len: lenAt(si, t),
          svg: `<g transform="translate(${f1(p[0])} ${f1(p[1])}) rotate(${f1(th + 90 + side * 35)})"><use href="#ev-bud" class="lf"/></g>`,
        });
      };
      const tendril = (si: number, t: number, side: number) => {
        const p = bez(segs[si], t);
        const th = deg(bezTan(segs[si], t));
        bits.push({
          len: lenAt(si, t),
          svg: `<g transform="translate(${f1(p[0])} ${f1(p[1])}) rotate(${f1(th + 180 + side * 70)})"><path class="tendril lf" d="M0 0c7-1 15-5 16-12 1-6-6-9-9-4-2 3 1 6 4 4"/></g>`,
        });
      };
      pair(0, 0.5, 0.85);
      bud(0, 0.3, 1);
      for (let si = 1; si < segs.length - 1; si++) {
        const side = si % 2 ? 1 : -1;
        bud(si, 0.42, side);
        pair(si, 0.6, 0.7);
        tendril(si, 0.72, side);
        pair(si, 0.86, 0.85);
      }
      const last = segs.length - 1;
      pair(last, 0.4, 0.7);
      leaf(last, 0.78, -55, 0.65);
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
