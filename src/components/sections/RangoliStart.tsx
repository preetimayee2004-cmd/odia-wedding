import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const MAROON = "#5A1620";
const GOLD = "#C9973F";
const CAPTION = "#4A2C1A";

/** Timing (ms). */
const DRAW = 1500; // the lines trace out: petals, then jhoti curves, then dots
const AUTO_OPEN = 5000; // after the draw, opens by itself if not tapped
const BLOOM = 800; // petals fill and bloom outward in sequence
const PETAL_MS = 360; // each petal's own bloom
const EXPAND = 900; // the rangoli grows into a golden wash over the screen
const FADE = 600; // the wash fades into the Couple section

// Geometry (viewBox 0 0 200 200, centre 100,100; angles clockwise from the top)
const PETAL = "M100 84C89 74 87 56 100 40C113 56 111 74 100 84Z";
const PETALS = Array.from({ length: 8 }, (_, i) => i * 45);
const DOTS = Array.from({ length: 16 }, (_, i) => i * 22.5);
// One scallop of the outer jhoti border, and one curling flourish where two meet
const SCALLOP = "M67.9 22.4C80 6 120 6 132.1 22.4";
const CURL = "M100 25C93 19 107 13 100 6";
const ORIGIN = { transformOrigin: "100px 100px" };
// Shown at 150px, so 2px on screen is 2 × 200/150 in the 200-unit drawing
const SIZE = 150;
const STROKE = (2 * 200) / SIZE;

type Stage = "waiting" | "drawing" | "ready" | "opening" | "opened";

/**
 * The way into the site: an Odia jhoti rangoli on the invitation card.
 * It draws itself once it's on screen, then breathes gently above "Tap to
 * begin". A tap (or, 5s after the draw, no tap) fills it with gold and
 * maroon, blooms the petals, grows it into a golden wash over the whole
 * screen, and fades into the Couple section. Runs once.
 */
export function RangoliStart({ active, onOpen }: { active: boolean; onOpen: () => Promise<void> }) {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>("waiting");
  const [wash, setWash] = useState<{ x: number; y: number; size: number; scale: number } | null>(null);
  const stageRef = useRef<Stage>("waiting");
  const autoTimer = useRef(0);
  const anims = useRef<Animation[]>([]);
  const openRef = useRef(onOpen);
  openRef.current = onOpen;

  const go = (next: Stage) => {
    stageRef.current = next;
    setStage(next);
  };
  const play = (el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
    const anim = el.animate(keyframes, { fill: "both", ...options });
    anims.current.push(anim);
    return anim.finished;
  };

  useEffect(
    () => () => {
      clearTimeout(autoTimer.current);
      anims.current.forEach((a) => a.cancel());
    },
    [],
  );

  /** The opening transition — guarded so it can only ever run once. */
  const open = useCallback(async () => {
    if (stageRef.current === "opening" || stageRef.current === "opened") return;
    clearTimeout(autoTimer.current);
    go("opening");
    const svg = svgRef.current!;
    if (reducedMotion) {
      await openRef.current();
      go("opened");
      return;
    }
    try {
      // Petals fill with gold and bloom outward one after another
      const blooms = [...svg.querySelectorAll(".rangoli-bloom")].map((el, i) =>
        play(el, [
          { opacity: 0, transform: "scale(0.45)" },
          { opacity: 1, transform: "scale(1.1)", offset: 0.7 },
          { opacity: 1, transform: "scale(1)" },
        ], { duration: PETAL_MS, delay: (i * (BLOOM - PETAL_MS)) / (PETALS.length - 1), easing: "cubic-bezier(0.34, 1.3, 0.64, 1)" }),
      );
      const heart = svg.querySelector(".rangoli-heart")!;
      blooms.push(play(heart, [{ opacity: 0, transform: "scale(0.5)" }, { opacity: 1, transform: "scale(1)" }], { duration: 400, easing: "ease-out" }));
      await Promise.all(blooms);

      // The rangoli grows into a soft golden wash over the whole screen
      const r = rootRef.current!.querySelector("svg")!.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      setWash({ x, y, size: r.width, scale: ((reach * 2) / r.width) * 1.05 });
    } catch {
      /* unmounted */
    }
  }, [reducedMotion]);

  // Run the wash once it's mounted
  useEffect(() => {
    const el = washRef.current;
    const svg = svgRef.current;
    if (!wash || !el || !svg) return;
    let cancelled = false;
    void (async () => {
      try {
        await Promise.all([
          play(el, [{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: `scale(${wash.scale})` }], {
            duration: EXPAND,
            easing: "cubic-bezier(0.55, 0, 0.35, 1)",
          }),
          play(svg, [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(1.6)", opacity: 0 }], { duration: EXPAND, easing: "ease-in" }),
        ]);
        await openRef.current(); // the Couple section, behind the wash
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (cancelled) return;
        await play(el, [{ opacity: 1 }, { opacity: 0 }], { duration: FADE, easing: "ease-in-out" });
      } catch {
        /* unmounted */
      }
      if (cancelled) return;
      // Leave the rangoli bloomed (not expanded) for anyone scrolling back up
      svg.getAnimations().forEach((a) => a.cancel());
      setWash(null);
      go("opened");
    })();
    return () => {
      cancelled = true;
    };
  }, [wash]);

  // Draw itself once the invitation is showing and the rangoli is on screen
  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!active || !root || !svg || stageRef.current !== "waiting") return;

    const startDraw = () => {
      if (stageRef.current !== "waiting") return;
      go("drawing");
      const lines = [...svg.querySelectorAll<SVGGeometryElement>(".rangoli-line")];
      const dots = [...svg.querySelectorAll(".rangoli-dot")];
      const done = reducedMotion
        ? Promise.resolve()
        : Promise.all([
            ...lines.map((el) => {
              const at = Number(el.dataset.at); // 0–1 through the draw
              return play(el, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
                duration: DRAW * 0.42,
                delay: at * DRAW * 0.45,
                easing: "ease-in-out",
              });
            }),
            ...dots.map((el, i) =>
              play(el, [{ opacity: 0, transform: "scale(0.2)" }, { opacity: 1, transform: "scale(1)" }], {
                duration: 260,
                delay: DRAW * 0.66 + (i / dots.length) * DRAW * 0.17,
                easing: "ease-out",
              }),
            ),
          ]);
      void done.then(
        () => {
          if (stageRef.current !== "drawing") return;
          go("ready");
          // Opens by itself if the guest hasn't tapped 5s after the draw
          autoTimer.current = window.setTimeout(() => void open(), AUTO_OPEN);
        },
        () => {},
      );
    };

    if (!("IntersectionObserver" in window)) {
      startDraw();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          startDraw();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [active, open, reducedMotion]);

  const drawn = stage !== "waiting";
  const line = (at: number) => ({
    pathLength: 1,
    className: "rangoli-line",
    "data-at": at,
    style: { strokeDasharray: 1, strokeDashoffset: reducedMotion && drawn ? 0 : 1 },
  });

  return (
    <>
      <button
        ref={rootRef}
        type="button"
        onClick={() => void open()}
        disabled={stage === "waiting" || stage === "opening"}
        aria-label="Tap to begin: open the invitation"
        aria-controls="couple"
        className="mx-auto flex flex-col items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#B8863B]/60 disabled:cursor-default"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <span className={`block ${stage === "ready" ? "rangoli-pulse" : ""}`}>
          <svg ref={svgRef} viewBox="0 0 200 200" className="block overflow-visible" width={SIZE} height={SIZE} fill="none" aria-hidden>
            {/* Filled bloom (shown on tap): gold petals, maroon heart */}
            <g>
              {PETALS.map((a) => (
                <g key={a} transform={`rotate(${a} 100 100)`}>
                  <path className="rangoli-bloom" d={PETAL} fill={GOLD} stroke={MAROON} strokeWidth={STROKE} style={{ ...ORIGIN, opacity: 0 }} />
                </g>
              ))}
              <circle className="rangoli-heart" cx="100" cy="100" r="16" fill={MAROON} style={{ ...ORIGIN, opacity: 0 }} />
            </g>

            <g stroke={MAROON} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
              {/* Lotus: eight petals first */}
              {PETALS.map((a, i) => (
                <g key={a} transform={`rotate(${a} 100 100)`}>
                  <path {...line(i * 0.06)} d={PETAL} />
                </g>
              ))}
              <circle {...line(0.1)} cx="100" cy="100" r="16" />
              <circle cx="100" cy="100" r="4.5" fill={MAROON} stroke="none" className="rangoli-dot" style={{ ...ORIGIN, opacity: reducedMotion && drawn ? 1 : 0 }} />
              {/* Jhoti: scalloped border with curling flourishes */}
              {PETALS.map((a, i) => (
                <g key={a} transform={`rotate(${a} 100 100)`}>
                  <path {...line(0.5 + i * 0.04)} d={SCALLOP} />
                  <g transform="rotate(22.5 100 100)">
                    <path {...line(0.6 + i * 0.04)} d={CURL} />
                  </g>
                </g>
              ))}
            </g>

            {/* Ring of dots, last */}
            {DOTS.map((a) => {
              const rad = (a * Math.PI) / 180;
              const cx = 100 + 72 * Math.sin(rad);
              const cy = 100 - 72 * Math.cos(rad);
              return (
                <circle
                  key={a}
                  className="rangoli-dot"
                  cx={cx.toFixed(2)}
                  cy={cy.toFixed(2)}
                  r="2.6"
                  fill={MAROON}
                  style={{ transformOrigin: `${cx.toFixed(2)}px ${cy.toFixed(2)}px`, opacity: reducedMotion && drawn ? 1 : 0 }}
                />
              );
            })}
          </svg>
        </span>
        <span
          className="mt-2 font-display text-[14px] italic"
          style={{
            color: CAPTION,
            opacity: stage === "ready" ? 1 : 0,
            transition: "opacity 700ms ease-out",
          }}
        >
          Tap to begin
        </span>
      </button>

      {wash &&
        createPortal(
          <div aria-hidden className="fixed inset-0 z-[60] overflow-hidden" style={{ touchAction: "none" }}>
            <div
              ref={washRef}
              className="absolute rounded-full"
              style={{
                left: wash.x - wash.size / 2,
                top: wash.y - wash.size / 2,
                width: wash.size,
                height: wash.size,
                opacity: 0,
                willChange: "transform, opacity",
                background: "radial-gradient(circle, #FFF3D2 0%, #F6D68B 40%, #E8B65A 72%, #D9A24A 100%)",
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
