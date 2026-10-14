import { forwardRef, useEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";

/** Timing (ms). */
const COVER = 260; // the screen becomes two closed doors
const OPEN = 1200; // they swing outward on their hinges
const SWING = "cubic-bezier(0.45, 0, 0.55, 1)"; // ease-in-out

// Deep brown wood: soft shading at the edges, fine vertical grain.
const WOOD = [
  "linear-gradient(90deg, rgb(0 0 0 / 0.28), transparent 16%, transparent 84%, rgb(0 0 0 / 0.32))",
  "repeating-linear-gradient(90deg, rgb(255 214 170 / 0.05) 0 2px, transparent 2px 7px, rgb(0 0 0 / 0.08) 7px 8px, transparent 8px 13px)",
  "linear-gradient(180deg, #5C2F17 0%, #46220F 52%, #3A1B0C 100%)",
].join(",");
// A row of small domed brass studs.
const STUDS = "radial-gradient(circle, #F7DE92 0 1.4px, #C9973F 2.2px, #6E4A14 3px, transparent 3.6px)";
const GOLD = "#C99A45";

/**
 * Two carved wooden temple doors over the whole screen. They close in, the
 * page changes behind them (`behind`), then they swing open outward onto it
 * in a soft golden light, and are removed (`onDone`).
 * Rendered into <body> so they always cover exactly the screen (or the phone
 * in the desktop mockup).
 */
export function TempleDoors({ behind, onDone }: { behind: () => Promise<void>; onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const done = useRef({ behind, onDone });
  done.current = { behind, onDone };

  useEffect(() => {
    let cancelled = false;
    const anims: Animation[] = [];
    const play = (el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      const anim = el.animate(keyframes, { fill: "both", ...options });
      anims.push(anim);
      return anim.finished;
    };

    void (async () => {
      try {
        await play(rootRef.current!, [{ opacity: 0 }, { opacity: 1 }], { duration: COVER, easing: "ease-out" });
        await done.current.behind();
        // Let the new view paint behind the closed doors first
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (cancelled) return;
        await Promise.all([
          play(leftRef.current!, [{ transform: "rotateY(0deg)" }, { transform: "rotateY(-80deg)" }], { duration: OPEN, easing: SWING }),
          play(rightRef.current!, [{ transform: "rotateY(0deg)" }, { transform: "rotateY(80deg)" }], { duration: OPEN, easing: SWING }),
          play(leftRef.current!, [{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], { duration: OPEN, easing: "ease-in" }),
          play(rightRef.current!, [{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], { duration: OPEN, easing: "ease-in" }),
          // The golden light behind them settles away, revealing the page
          play(lightRef.current!, [{ opacity: 1 }, { opacity: 0 }], { duration: OPEN + 200, delay: 150, easing: "ease-out" }),
        ]);
      } catch {
        /* cancelled */
      }
      if (!cancelled) done.current.onDone();
    })();

    return () => {
      cancelled = true;
      anims.forEach((a) => a.cancel());
    };
  }, []);

  return createPortal(
    <div
      ref={rootRef}
      aria-hidden
      className="fixed inset-0 z-[60] overflow-hidden"
      style={{ opacity: 0, perspective: "1100px", touchAction: "none" }}
    >
      <div
        ref={lightRef}
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 75% 60% at 50% 45%, #FFF3D2 0%, #F6D689 38%, rgb(226 168 78 / 0.85) 70%, rgb(150 92 30 / 0.7) 100%)" }}
      />
      <DoorLeaf ref={leftRef} side="left" />
      <DoorLeaf ref={rightRef} side="right" />
    </div>,
    document.body,
  );
}

const DoorLeaf = forwardRef<HTMLDivElement, { side: "left" | "right" }>(function DoorLeaf({ side }, ref) {
  const seam = side === "left" ? "right" : "left";
  const leaf: CSSProperties = {
    [side]: 0,
    transformOrigin: side,
    background: WOOD,
    boxShadow: `inset 0 0 0 1px rgb(0 0 0 / 0.5), inset ${side === "left" ? "-" : ""}6px 0 10px -6px rgb(0 0 0 / 0.6)`,
    willChange: "transform, opacity",
  };
  const studs = (pos: CSSProperties) => (
    <span
      className="absolute h-2"
      style={{ ...pos, background: STUDS, backgroundSize: "20px 8px", backgroundRepeat: "space no-repeat" }}
    />
  );
  const panel = (top: string, height: string) => (
    <div className="absolute inset-x-[18%]" style={{ top, height }}>
      <div className="absolute inset-0 rounded-[2px] border" style={{ borderColor: `${GOLD}99` }} />
      {studs({ top: -4, left: 4, right: 4 })}
      {studs({ bottom: -4, left: 4, right: 4 })}
    </div>
  );

  return (
    <div ref={ref} className="absolute inset-y-0 w-1/2" style={leaf}>
      {/* Thin gold border */}
      <div className="absolute inset-[9px] rounded-[2px] border" style={{ borderColor: GOLD }} />
      {panel("9%", "35%")}
      {panel("54%", "37%")}
      {/* Brass ring handle near the meeting edge */}
      <span className="absolute top-[48%] h-7 w-7 -translate-y-1/2 rounded-full border-[2.5px]" style={{ [seam]: 14, borderColor: "#D4A851" }} />
      <span className="absolute top-[48%] h-2.5 w-2.5 -translate-y-[160%] rounded-full" style={{ [seam]: 23, background: STUDS, backgroundSize: "100% 100%" }} />
    </div>
  );
});
