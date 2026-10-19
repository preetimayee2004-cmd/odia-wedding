import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * A jharokha (palace-arch) frame for one gallery photograph: straight sides
 * rising into a smooth pointed (ogee) top, with a small gold lotus above
 * the apex. Light and flat: a 1px gold outer line, a 6px cream border and a
 * 1px maroon inner line, in real pixels at any size; the photograph is cut
 * to the arch inside them.
 *
 * Drawn in a 300-wide box `height` units tall (360 or 440 in the grid; the
 * wide featured arch passes a lower `rise` for a flatter top). The
 * photograph is HTML (lazy loading, crop focus, hover zoom), masked to the
 * arch window, inside a parallax layer (`.arch-par`, moved by the gallery)
 * and a zoom layer (`.arch-zoom`).
 *
 * `doors`: two carved wooden doors close the window (clipped to the arch)
 * until "opening", when they swing open on a 600px perspective — the left
 * door on its left edge, the right on its right — fading in their last
 * 200ms while the photograph settles from 1.08 to its natural size. `ms` and
 * `delay` set the timing. Styles: `.arch` in index.css.
 */

const W = 300;
const GOLD = "#C9A24E";
const CREAM = "#FBF3E3";
const MAROON = "#7A1F1F";
/** In pixels: the gold line, the cream border, the maroon line. */
const LINE = 1;
const BORDER = 6;

const f = (n: number) => n.toFixed(2);

/**
 * The arch outline, inset by `i` units (apex at y = 0, shoulders at
 * `rise`). The top is drawn once for the outer edge and pulled inward for
 * each inset; the pointed apex needs pulling down further than the
 * shoulders.
 */
function archPath(i: number, h: number, rise: number, dy = 0, dx = 0) {
  const k = rise / 104;
  const pt = (x: number, y: number) => {
    const t = 1 - Math.abs(x - 150) / 150;
    return `${f(150 + (x - 150) * ((150 - i) / 150) - dx)} ${f(y * k + i * (1 + 0.9 * t * t) + dy)}`;
  };
  // up the side, then a smooth swell into the pointed tip
  const left = [`C${pt(0, 50)} ${pt(58, 24)} ${pt(128, 11)}`, `C${pt(141, 8.5)} ${pt(147, 5)} ${pt(150, 0)}`];
  const right = [`C${pt(153, 5)} ${pt(159, 8.5)} ${pt(172, 11)}`, `C${pt(242, 24)} ${pt(300, 50)} ${pt(300, 104)}`];
  const bottom = f(h - i + dy);
  return `M${f(i - dx)} ${bottom}L${pt(0, 104)}${left.join("")}${right.join("")}L${f(W - i - dx)} ${bottom}Z`;
}

export type DoorState = { state: "closed" } | { state: "opening"; ms: number; delay: number };

export function GoldArchFrame({ height, rise = 104, doors, still = false, children }: { height: number; rise?: number; doors?: DoorState; still?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // pixels per unit, so the lines stay 1px and 6px whatever the frame's width
  const [ppu, setPpu] = useState(0.55);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => el.clientWidth && setPpu(el.clientWidth / W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const u = (px: number) => px / ppu;
  const inner = u(LINE + BORDER + LINE); // where the photograph starts
  const top = inner * 1.9; // the apex, pulled down
  const box = { x: inner, y: top, w: W - inner * 2, h: height - inner - top };
  const mask = `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(box.w)} ${f(box.h)}" preserveAspectRatio="none"><path d="${archPath(inner, height, rise, -box.y, inner)}"/></svg>`,
  )}")`;
  const doorStyle = doors?.state === "opening" ? ({ "--door-ms": `${doors.ms}ms`, "--door-delay": `${doors.delay}ms` } as CSSProperties) : undefined;

  return (
    <div ref={ref} data-doors={doors?.state} className="arch relative" style={{ aspectRatio: `${W} / ${height}`, ...doorStyle }}>
      <div
        className="arch-window absolute overflow-hidden bg-[#EADFCB]"
        style={{
          left: `${(box.x / W) * 100}%`,
          width: `${(box.w / W) * 100}%`,
          top: `${(box.y / height) * 100}%`,
          height: `${(box.h / height) * 100}%`,
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
      >
        {/* 12px of room above and below for the drift, unless the photograph is held still (e.g. to keep a photographer's mark in view) */}
        <div className={`arch-par absolute inset-x-0 ${still ? "inset-y-0" : "-bottom-3 -top-3"}`}>
          <div className="arch-zoom h-full w-full">{children}</div>
        </div>
        {doors && (
          <div aria-hidden className="arch-doors">
            <span className="arch-door arch-door-l">
              <i className="arch-knob" />
            </span>
            <span className="arch-door arch-door-r">
              <i className="arch-knob" />
            </span>
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${height}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {/* the cream border between the gold outer line and the maroon inner line */}
        <path d={archPath(u(LINE), height, rise) + archPath(u(LINE + BORDER), height, rise)} fill={CREAM} fillRule="evenodd" />
        <path d={archPath(u(LINE / 2), height, rise)} fill="none" stroke={GOLD} strokeWidth={LINE} vectorEffect="non-scaling-stroke" />
        <path d={archPath(u(LINE + BORDER + LINE / 2), height, rise)} fill="none" stroke={MAROON} strokeWidth={LINE} vectorEffect="non-scaling-stroke" />
      </svg>

      {/* a small gold lotus above the apex */}
      <svg viewBox="-10 -12 20 13" className="pointer-events-none absolute left-1/2 top-[-12px] h-[13px] w-5 -translate-x-1/2 overflow-visible" aria-hidden fill={GOLD}>
        <path d="M0 0C-2.4-2.6-2.4-6.6 0-10.5 2.4-6.6 2.4-2.6 0 0Z" />
        <path d="M0 0C-3.4-.6-6.4-3-7.2-7 -3.8-6.4-1.2-3.8 0 0Z" opacity="0.85" />
        <path d="M0 0C3.4-.6 6.4-3 7.2-7 3.8-6.4 1.2-3.8 0 0Z" opacity="0.85" />
        <path d="M-6 .4H6" stroke={GOLD} strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
}
