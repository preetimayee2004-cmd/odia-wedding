import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { playKnotSound } from "@/lib/sound";

/** The groom's thread (left gutter) and the bride's (right gutter). */
const GROOM = "#8E1B1B";
const BRIDE = "#C9A24E";
const THREAD_W = 2.4;
const STRAND_W = 1.6;
/** The drawing point: this far down the screen (easing lower at the very end of the page). */
const DRAW_AT = 0.62;
/** Long lines are drawn in pieces, so only the piece at the tip repaints. */
const PIECE = 600;
const LOOP_R = 9;
/** Half the distance between the two loops' centres. */
const LOOP_GAP = 6;
const BRAID_AMP = 1.8;
const BRAID_WAVE = 16;

type Pt = [number, number];

/** A polyline with its running length and its running lowest point (for drawing by scroll). */
interface Line {
  pts: Pt[];
  len: Float64Array;
  low: Float64Array;
  total: number;
}

interface Piece {
  d: string;
  line: number;
  start: number;
  len: number;
  color: string;
  width: number;
  opacity: number;
}

interface Geometry {
  w: number;
  h: number;
  lines: Line[];
  pieces: Piece[];
  /** Index of the cord's centre line (not drawn; it carries the bead). */
  cord: number;
  knot: Pt;
  accept: Pt | null;
}

function toLine(pts: Pt[]): Line {
  const n = pts.length;
  const len = new Float64Array(n);
  const low = new Float64Array(n);
  let m = -Infinity;
  for (let i = 0; i < n; i++) {
    if (i) len[i] = len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    m = Math.max(m, pts[i][1]);
    low[i] = m;
  }
  return { pts, len, low, total: n ? len[n - 1] : 0 };
}

/** How much of a line is drawn when the drawing point is at y: everything before it first dips below y. */
function drawnTo(l: Line, y: number): number {
  const n = l.pts.length;
  if (n < 2 || l.low[0] > y) return 0;
  if (l.low[n - 1] <= y) return l.total;
  let lo = 0;
  let hi = n - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (l.low[mid] <= y) lo = mid;
    else hi = mid - 1;
  }
  const a = l.pts[lo];
  const b = l.pts[lo + 1];
  const f = b[1] > a[1] ? Math.min(1, Math.max(0, (y - a[1]) / (b[1] - a[1]))) : 0;
  return l.len[lo] + (l.len[lo + 1] - l.len[lo]) * f;
}

function pointAt(l: Line, s: number): Pt {
  const n = l.pts.length;
  if (s <= 0) return l.pts[0];
  if (s >= l.total) return l.pts[n - 1];
  let lo = 0;
  let hi = n - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (l.len[mid] <= s) lo = mid;
    else hi = mid;
  }
  const f = (s - l.len[lo]) / (l.len[hi] - l.len[lo] || 1);
  return [l.pts[lo][0] + (l.pts[hi][0] - l.pts[lo][0]) * f, l.pts[lo][1] + (l.pts[hi][1] - l.pts[lo][1]) * f];
}

/** A path through the waypoints with rounded corners, sampled every few px. */
function route(way: Pt[], r = 18, step = 4): Pt[] {
  const out: Pt[] = [];
  const push = (p: Pt) => {
    const q = out[out.length - 1];
    if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.01) out.push(p);
  };
  const lineTo = (a: Pt, b: Pt) => {
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 1; k <= n; k++) push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  };
  push(way[0]);
  let cur = way[0];
  for (let i = 1; i < way.length; i++) {
    const p = way[i];
    if (i === way.length - 1) {
      lineTo(cur, p);
      break;
    }
    const next = way[i + 1];
    const dIn = Math.hypot(p[0] - cur[0], p[1] - cur[1]);
    const dOut = Math.hypot(next[0] - p[0], next[1] - p[1]);
    if (dIn < 0.01 || dOut < 0.01) continue;
    const rr = Math.min(r, dIn / 2, dOut / 2);
    const a: Pt = [p[0] - ((p[0] - cur[0]) / dIn) * rr, p[1] - ((p[1] - cur[1]) / dIn) * rr];
    const b: Pt = [p[0] + ((next[0] - p[0]) / dOut) * rr, p[1] + ((next[1] - p[1]) / dOut) * rr];
    lineTo(cur, a);
    const steps = Math.max(2, Math.ceil(rr / 2));
    for (let k = 1; k <= steps; k++) {
      const t = k / steps;
      const u = 1 - t;
      push([u * u * a[0] + 2 * u * t * p[0] + t * t * b[0], u * u * a[1] + 2 * u * t * p[1] + t * t * b[1]]);
    }
    cur = b;
  }
  return out;
}

/** A full loop round an ellipse, from angle `from`, clockwise (dir 1) or anticlockwise (-1). */
function loop(cx: number, cy: number, rx: number, ry: number, from: number, dir: 1 | -1): Pt[] {
  const n = Math.max(24, Math.ceil(((rx + ry) * Math.PI) / 3));
  return Array.from({ length: n }, (_, k) => {
    const a = from + dir * ((k + 1) / n) * Math.PI * 2;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as Pt;
  });
}

/** Evenly spaced points along a polyline. */
function resample(pts: Pt[], step: number): Pt[] {
  const l = toLine(pts);
  const n = Math.max(2, Math.ceil(l.total / step) + 1);
  return Array.from({ length: n }, (_, k) => pointAt(l, (l.total * k) / (n - 1)));
}

/** Two strands twisting round a centre line. */
function braid(centre: Pt[]): [Pt[], Pt[]] {
  const a: Pt[] = [];
  const b: Pt[] = [];
  let s = 0;
  for (let i = 0; i < centre.length; i++) {
    const p = centre[i];
    const q = centre[Math.min(centre.length - 1, i + 1)];
    const o = centre[Math.max(0, i - 1)];
    if (i) s += Math.hypot(p[0] - o[0], p[1] - o[1]);
    const tx = q[0] - o[0];
    const ty = q[1] - o[1];
    const tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl;
    const ny = tx / tl;
    const off = BRAID_AMP * Math.sin((s / BRAID_WAVE) * Math.PI * 2);
    a.push([p[0] + nx * off, p[1] + ny * off]);
    b.push([p[0] - nx * off, p[1] - ny * off]);
  }
  return [a, b];
}

const fmt = (n: number) => Math.round(n * 10) / 10;
const toD = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${fmt(p[0])} ${fmt(p[1])}`).join("");

/** Where an element sits inside the host, by layout (ignoring entrance transforms). */
function place(el: Element | null, host: HTMLElement) {
  if (!(el instanceof HTMLElement)) return null;
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== host) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  if (n !== host) {
    const r = el.getBoundingClientRect();
    const h = host.getBoundingClientRect();
    return { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height };
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/**
 * The Hastaganthi thread: two threads, the groom's maroon and the bride's
 * gold, run down the side gutters from the countdown; hang the story
 * scroll's top rod; and, just above the Hastaganthi ceremony, curve to the
 * centre and tie a knot with a marigold in it. From there one braided cord
 * goes on down the left gutter (softer past the venue and contacts) to ring
 * the couple's initials at the close. It draws itself as the page scrolls,
 * with a bead at its tip; a marigold blooms beside Accept Invitation when
 * it is tapped. One SVG over the page, never over text, never tappable.
 */
export function HastaganthiThread() {
  const svgRef = useRef<SVGSVGElement>(null);
  const reduced = usePrefersReducedMotion();
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [knotTied, setKnotTied] = useState(false);
  const [burst, setBurst] = useState(false);
  const acceptAt = useRef<number | null>(null); // the Accept button's centre, from the top of #rsvp
  const tiedOnce = useRef(false);
  const last = useRef<number[]>([]);

  // ── Measure the page and lay out the threads ──
  const build = useCallback(() => {
    const svg = svgRef.current;
    const host = svg?.parentElement;
    if (!svg || !host) return;
    const W = host.clientWidth;
    const H = host.offsetHeight;
    const band = (W * 35) / 768;
    const gl = band + 6;
    const gr = W - band - 6;
    const cx = W / 2;
    const at = (sel: string) => place(host.querySelector(sel), host);

    const countdown = at("#countdown");
    const story = at("#story");
    const rod = at('[data-thread="rod"]');
    const events = at("#events");
    const top = countdown?.y ?? story?.y ?? 0;

    // The knot: in the gap just above the Hastaganthi ceremony
    const items = [...host.querySelectorAll<HTMLElement>("#events .ev-item")];
    const hi = items.findIndex((li) => /hastaganthi/i.test(li.querySelector(".ev-name")?.textContent ?? ""));
    let ky: number;
    if (hi > 0) {
      const flower = place(items[hi].querySelector(".ev-flower"), host);
      const prev = place(items[hi - 1].querySelector(".ev-toggle"), host);
      ky = flower && prev ? (prev.y + prev.h + flower.y) / 2 : (events?.y ?? top) + (events?.h ?? 0) * 0.5;
    } else {
      ky = events ? events.y + events.h * 0.5 : (story ? story.y + story.h : top) + 80;
    }

    // Down each gutter, round the rod's knob, and on to the knot
    const side = (g: number, knob: number | null, entry: number, dir: 1 | -1): Pt[] => {
      const way: Pt[] = [[g, top]];
      if (rod && knob !== null) {
        way.push([g, rod.y - 46], [knob, rod.y + 1], [knob, rod.y + rod.h - 1], [g, rod.y + rod.h + 40]);
      }
      way.push([g, ky], [entry, ky]);
      const path = route(way, 16);
      return [...path, ...loop(entry + dir * LOOP_R, ky, LOOP_R, LOOP_R, dir === 1 ? Math.PI : 0, dir)];
    };
    const left = side(gl, rod ? rod.x + 7.5 : null, cx - LOOP_GAP - LOOP_R, 1);
    const right = side(gr, rod ? rod.x + rod.w - 7.5 : null, cx + LOOP_GAP + LOOP_R, -1);

    // The braided cord: from the knot to the left gutter, down, and round the initials
    const mono = at('[data-thread="monogram"]');
    const end: Pt = mono ? [mono.x + mono.w / 2, mono.y + mono.h / 2] : [gl, H - 40];
    const rx = mono ? mono.w / 2 + 18 : 0;
    const ry = mono ? mono.h / 2 + 13 : 0;
    const cordWay: Pt[] = [[cx, ky + LOOP_R + 2], [cx, ky + LOOP_R + 14], [gl, ky + 72], [gl, end[1]]];
    if (mono) cordWay.push([end[0] - rx, end[1]]);
    let centre = route(cordWay, 22);
    if (mono) centre = [...centre, ...loop(end[0], end[1], rx, ry, Math.PI, 1)];
    centre = resample(centre, 2.5);
    const [sa, sb] = braid(centre);

    // Softer past the venue and the contacts
    const venue = at("#venue");
    const contact = at("#contact");
    const dimFrom = venue?.y ?? Infinity;
    const dimTo = contact ? contact.y + contact.h : venue ? venue.y + venue.h : Infinity;
    const cut = (y: number) => {
      const i = centre.findIndex((p) => p[1] >= y);
      return i < 0 ? centre.length - 1 : i;
    };
    const c1 = cut(dimFrom);
    const c2 = Math.max(c1, cut(dimTo));
    const spans: Array<[number, number, number]> = [
      [0, c1, 1],
      [c1, c2, 0.4],
      [c2, centre.length - 1, 1],
    ];

    // every drawn line, cut into pieces of about PIECE px
    const lines: Line[] = [];
    const pieces: Piece[] = [];
    const addLine = (pts: Pt[], color: string, width: number, opacity: number) => {
      const l = toLine(pts);
      const idx = lines.push(l) - 1;
      for (let i = 0; i < pts.length - 1; ) {
        let j = i + 1;
        while (j < pts.length - 1 && l.len[j] - l.len[i] < PIECE) j++;
        pieces.push({ d: toD(pts.slice(i, j + 1)), line: idx, start: l.len[i], len: l.len[j] - l.len[i], color, width, opacity });
        i = j;
      }
    };
    addLine(left, GROOM, THREAD_W, 1); // line 0
    addLine(right, BRIDE, THREAD_W, 1); // line 1
    for (const [a, b, op] of spans) {
      if (b - a < 1) continue;
      addLine(sa.slice(a, b + 1), GROOM, STRAND_W, op);
      addLine(sb.slice(a, b + 1), BRIDE, STRAND_W, op);
    }
    const cord = lines.push(toLine(centre)) - 1;

    const rsvp = at("#rsvp");
    const accept: Pt | null = rsvp && acceptAt.current !== null ? [gl, rsvp.y + acceptAt.current] : null;

    last.current = [];
    setGeo({ w: W, h: H, lines, pieces, cord, knot: [cx, ky], accept });
  }, []);

  // ── Draw by scroll ──
  const draw = useCallback(() => {
    const svg = svgRef.current;
    const host = svg?.parentElement;
    if (!svg || !host || !geo) return;
    // over the last stretch of the page the drawing point eases down past the screen, so the ring closes
    const vh = window.innerHeight;
    const left = document.documentElement.scrollHeight - vh - window.scrollY;
    const at = left < vh * 0.6 ? DRAW_AT + (1 - Math.max(0, left) / (vh * 0.6)) * 0.5 : DRAW_AT;
    const y = vh * at - host.getBoundingClientRect().top;
    const drawn = geo.lines.map((l) => (reduced ? l.total : drawnTo(l, y)));

    const paths = svg.querySelectorAll<SVGPathElement>("path[data-piece]");
    geo.pieces.forEach((p, k) => {
      const vis = Math.min(p.len, Math.max(0, drawn[p.line] - p.start));
      const off = fmt(p.len - vis);
      if (last.current[k] !== off && paths[k]) {
        paths[k].style.strokeDashoffset = String(off);
        last.current[k] = off;
      }
    });

    // a bead at each tip still being drawn
    const beads = svg.querySelectorAll<SVGGElement>("g[data-bead]");
    [0, 1, geo.cord].forEach((li, k) => {
      const bead = beads[k];
      if (!bead) return;
      const l = geo.lines[li];
      const s = drawn[li];
      const live = !reduced && s > 0.5 && s < l.total - 0.5;
      bead.style.opacity = live ? "1" : "0";
      if (live) {
        const [bx, by] = pointAt(l, s);
        bead.style.transform = `translate(${fmt(bx)}px, ${fmt(by)}px)`;
      }
    });

    const tied = drawn[0] >= geo.lines[0].total - 0.5 && drawn[1] >= geo.lines[1].total - 0.5;
    setKnotTied(tied);
    if (tied && !tiedOnce.current) {
      tiedOnce.current = true;
      if (!reduced) {
        setBurst(true);
        playKnotSound();
      }
    }
  }, [geo, reduced]);

  useLayoutEffect(() => {
    const host = svgRef.current?.parentElement;
    if (!host) return;
    let timer = 0;
    const soon = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => requestAnimationFrame(build), 120);
    };
    build();
    const ro = new ResizeObserver(soon);
    ro.observe(host);
    window.addEventListener("resize", soon);
    void document.fonts?.ready.then(soon);
    // a marigold beside Accept Invitation, where it was tapped
    const onAccept = (e: Event) => {
      const btn = (e as CustomEvent<HTMLElement>).detail;
      const rsvp = place(host.querySelector("#rsvp"), host);
      const b = place(btn, host);
      if (rsvp && b) acceptAt.current = b.y + b.h / 2 - rsvp.y;
      soon();
    };
    window.addEventListener("tila:accepted", onAccept);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener("resize", soon);
      window.removeEventListener("tila:accepted", onAccept);
    };
  }, [build]);

  useEffect(() => {
    if (!geo) return;
    draw();
    if (reduced) return;
    let frame = 0;
    const onScroll = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          draw();
        });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [geo, draw, reduced]);

  return (
    <svg
      ref={svgRef}
      aria-hidden
      focusable="false"
      className="pointer-events-none absolute left-0 top-0 z-20 overflow-visible"
      width={geo?.w ?? 0}
      height={geo?.h ?? 0}
      viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}
    >
      {geo && (
        <>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {geo.pieces.map((p, k) => (
              <path
                key={k}
                data-piece
                d={p.d}
                stroke={p.color}
                strokeWidth={p.width}
                opacity={p.opacity}
                strokeDasharray={`${fmt(p.len)} ${fmt(p.len + 2)}`}
                style={{ strokeDashoffset: reduced ? 0 : fmt(p.len) }}
              />
            ))}
          </g>

          {/* the knot's marigold, scaling in with a burst of petals */}
          <g transform={`translate(${fmt(geo.knot[0])} ${fmt(geo.knot[1])})`}>
            {burst &&
              [0, 60, 120, 180, 240, 300].map((a) => (
                <g key={a} transform={`rotate(${a})`}>
                  <ellipse className="ht-petal" cy="-5" rx="1.8" ry="3.4" fill={a % 120 ? "#F39A2B" : "#E8692A"} />
                </g>
              ))}
            <g className={knotTied ? (reduced ? "" : "ht-bloom") : "opacity-0"}>
              <Marigold r={6.5} />
            </g>
          </g>

          {/* a marigold blooming beside Accept Invitation */}
          {geo.accept && (
            <g transform={`translate(${fmt(geo.accept[0])} ${fmt(geo.accept[1])})`}>
              <g className={reduced ? "" : "ht-bloom"}>
                <Marigold r={5.5} />
              </g>
            </g>
          )}

          {/* beads at the tips: groom's thread, bride's thread, the cord */}
          {[GROOM, BRIDE, "#A8632E"].map((c) => (
            <g key={c} data-bead style={{ opacity: 0 }}>
              <circle r="3.4" fill={c} stroke="#FFF6E2" strokeWidth="1" />
            </g>
          ))}
        </>
      )}
    </svg>
  );
}

/** A small marigold head. */
function Marigold({ r }: { r: number }) {
  return (
    <>
      {Array.from({ length: 10 }, (_, k) => (
        <ellipse key={k} cx="0" cy={-r * 0.95} rx={r * 0.42} ry={r * 0.62} fill="#F39424" transform={`rotate(${k * 36})`} />
      ))}
      <circle r={r * 0.85} fill="#F7A933" />
      <circle r={r * 0.85} fill="none" stroke="#D2650F" strokeWidth="0.6" strokeDasharray="1.2 1.1" opacity="0.7" />
      <circle r={r * 0.36} fill="#C2560C" />
    </>
  );
}
