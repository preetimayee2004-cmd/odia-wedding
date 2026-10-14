import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const CAPTION = "#2E1A10";
const MAROON = "#8A1C2B";

/** Timing (ms). */
const RING_GAP = 250; // each ring builds this long after the one inside it
const RING_MS = 320;
const EXPAND = 900; // the petals spin while it grows into a golden wash
const SPIN = 20; // degrees
const FADE = 600; // the wash fades into the Couple section

// Drawing in a 200-unit box, centre 100,100; angles clockwise from the top.
const C = 100;
const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.sin(a), C - r * Math.cos(a)] as const;
};
const f = (n: number) => n.toFixed(2);
/** A petal (or leaf) pointing up, from radius `inner` to `outer`, `w` wide. */
const petal = (inner: number, outer: number, w: number, tip = 0.25) => {
  const len = outer - inner;
  const y0 = C - inner;
  const y1 = C - outer;
  return `M${C} ${y0}C${C - w} ${f(y0 - len * 0.3)} ${f(C - w * tip * 2)} ${f(y1 + len * 0.2)} ${C} ${y1}C${f(C + w * tip * 2)} ${f(y1 + len * 0.2)} ${C + w} ${f(y0 - len * 0.3)} ${C} ${y0}Z`;
};
const ring = (n: number, offset = 0) => Array.from({ length: n }, (_, i) => offset + (i * 360) / n);

const LOTUS_OUTER = petal(9, 44, 13, 0.3);
const LOTUS_INNER = petal(9, 33, 7, 0.3);
const POINTED = petal(36, 66, 8, 0.12);
const LEAF = petal(62, 82, 6.5, 0.2);
const SCALLOP = (() => {
  const [x0, y0] = polar(90, -7.5);
  const [cx, cy] = polar(99, 0);
  const [x1, y1] = polar(90, 7.5);
  return `M${f(x0)} ${f(y0)}Q${f(cx)} ${f(cy)} ${f(x1)} ${f(y1)}`;
})();
const ORIGIN = { transformOrigin: "100px 100px" };

type Stage = "waiting" | "building" | "ready" | "opening" | "opened";

/**
 * The way into the site: a colourful Odia jhoti and flower rangoli. Once on
 * screen it builds itself ring by ring from the centre outward, then breathes
 * gently above "Tap the rangoli" until the guest taps it. The tap spins
 * its petals as it grows into a golden wash over the whole screen, which
 * fades into the Couple section. Runs once.
 */
export function RangoliStart({ active, onOpen, size = 170 }: { active: boolean; onOpen: () => Promise<void>; size?: number }) {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>("waiting");
  const [wash, setWash] = useState<{ x: number; y: number; size: number; scale: number } | null>(null);
  const stageRef = useRef<Stage>("waiting");
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
      anims.current.forEach((a) => a.cancel());
    },
    [],
  );

  /** The opening transition — guarded so it can only ever run once. */
  const open = useCallback(async () => {
    if (stageRef.current !== "ready") return;
    go("opening");
    if (reducedMotion) {
      await openRef.current();
      go("opened");
      return;
    }
    const r = svgRef.current!.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    setWash({ x, y, size: r.width, scale: ((reach * 2) / r.width) * 1.05 });
  }, [reducedMotion]);

  // The petals spin as the rangoli grows into a golden wash, then it fades onto the couple
  useEffect(() => {
    const el = washRef.current;
    const svg = svgRef.current;
    if (!wash || !el || !svg) return;
    let cancelled = false;
    void (async () => {
      try {
        await Promise.all([
          ...[...svg.querySelectorAll(".rangoli-spin")].map((g) =>
            play(g, [{ transform: "rotate(0deg)" }, { transform: `rotate(${SPIN}deg)` }], { duration: EXPAND, easing: "ease-in-out" }),
          ),
          play(svg, [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(1.7)", opacity: 0 }], { duration: EXPAND, easing: "ease-in" }),
          play(el, [{ opacity: 0, transform: "scale(0.5)" }, { opacity: 1, transform: `scale(${wash.scale})` }], {
            duration: EXPAND,
            easing: "cubic-bezier(0.55, 0, 0.35, 1)",
          }),
        ]);
        await openRef.current(); // the Couple section, behind the wash
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (cancelled) return;
        await play(el, [{ opacity: 1 }, { opacity: 0 }], { duration: FADE, easing: "ease-in-out" });
      } catch {
        /* unmounted */
      }
      if (cancelled) return;
      // Leave the rangoli in place (spun) for anyone scrolling back up
      svg.getAnimations().forEach((a) => a.cancel());
      setWash(null);
      go("opened");
    })();
    return () => {
      cancelled = true;
    };
  }, [wash]);

  // Builds itself once the invitation is showing and the rangoli is on screen
  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!active || !root || !svg || stageRef.current !== "waiting") return;

    const build = () => {
      if (stageRef.current !== "waiting") return;
      go("building");
      const layers = [...svg.querySelectorAll<SVGGElement>(".rangoli-layer")];
      const done = reducedMotion
        ? Promise.resolve()
        : Promise.all(
            layers.map((g) =>
              play(g, [{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "scale(1)" }], {
                duration: RING_MS,
                delay: Number(g.dataset.ring) * RING_GAP,
                easing: "cubic-bezier(0.33, 1.2, 0.6, 1)",
              }),
            ),
          );
      void done.then(
        () => {
          if (stageRef.current !== "building") return;
          go("ready");
        },
        () => {},
      );
    };

    if (!("IntersectionObserver" in window)) {
      build();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          build();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [active, reducedMotion]);

  const hidden = !reducedMotion || stage === "waiting";
  const layer = (n: number) => ({
    className: "rangoli-layer",
    "data-ring": n,
    style: { ...ORIGIN, opacity: hidden ? 0 : 1 },
  });

  return (
    <>
      <button
        ref={rootRef}
        type="button"
        onClick={() => void open()}
        aria-label="Tap the rangoli to open the invitation"
        aria-controls="couple"
        className="flex flex-col items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#B8863B]/60"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <span className={`block ${stage === "ready" ? "rangoli-pulse" : ""}`}>
          <svg ref={svgRef} viewBox="0 0 200 200" width={size} height={size} className="block overflow-visible" aria-hidden>
            {/* Outer scalloped edge, thin maroon */}
            <g {...layer(5)} fill="none" stroke={MAROON} strokeWidth="1.6" strokeLinecap="round">
              {ring(24).map((a) => (
                <path key={a} d={SCALLOP} transform={`rotate(${a} 100 100)`} />
              ))}
            </g>
            {/* Ring of dots: white, a few maroon */}
            <g {...layer(4)}>
              {ring(24).map((a, i) => {
                const [x, y] = polar(84.5, a);
                const maroon = i % 4 === 0;
                return <circle key={a} cx={f(x)} cy={f(y)} r="2.7" fill={maroon ? MAROON : "#FFFFFF"} stroke={maroon ? "none" : MAROON} strokeWidth="0.7" />;
              })}
            </g>
            {/* Leaves, two greens */}
            <g {...layer(3)}>
              <g className="rangoli-spin" style={ORIGIN}>
                {ring(16, 11.25).map((a, i) => (
                  <path key={a} d={LEAF} fill={i % 2 ? "#66BB6A" : "#2E7D32"} transform={`rotate(${a} 100 100)`} />
                ))}
              </g>
            </g>
            {/* Pointed petals, marigold orange and yellow */}
            <g {...layer(2)}>
              <g className="rangoli-spin" style={ORIGIN}>
                {ring(16).map((a, i) => (
                  <path key={a} d={POINTED} fill={i % 2 ? "#FBC02D" : "#F57C00"} transform={`rotate(${a} 100 100)`} />
                ))}
              </g>
            </g>
            {/* Eight-petal lotus: deep pink, lighter pink within */}
            <g {...layer(1)}>
              <g className="rangoli-spin" style={ORIGIN}>
                {ring(8, 22.5).map((a) => (
                  <g key={a} transform={`rotate(${a} 100 100)`}>
                    <path d={LOTUS_OUTER} fill="#C2185B" />
                    <path d={LOTUS_INNER} fill="#F48FB1" />
                  </g>
                ))}
              </g>
            </g>
            {/* Gold centre */}
            <g {...layer(0)}>
              <circle cx="100" cy="100" r="10" fill="#E0A526" />
            </g>
          </svg>
        </span>
        <span
          className="mt-1 font-serif text-[15px] font-bold leading-none"
          style={{ color: CAPTION, opacity: stage === "ready" ? 1 : 0, transition: "opacity 700ms ease-out" }}
        >
          Tap the rangoli
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
