import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { DOOR_OPENING, DOOR_VIEW, DoorFrame, DoorLeaf, JagannathEyes } from "@/components/art/KalingaDoor";
import { wedding } from "@/config/wedding";
import { EASE } from "@/lib/motion";
import { setStatusTone } from "@/lib/viewMode";

/** Timing (ms). */
export const TIMING = {
  draw: 1700, // the door sketch draws itself in
  doorOpen: 1500, // leaves split open, dissolving into light
  hold: 2000, // Mahaprabhu's eyes, centred, before the curtain rises
  curtain: 1300, // the whole scene slides up like an opening curtain
  skip: 500,
};

const BLACK = "#0A0604";
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

interface OpeningSequenceProps {
  /** Invitation content may start appearing (the curtain is lifting). */
  onReveal: () => void;
  /** Overlay can be removed. */
  onDone: () => void;
}

type Phase = "waiting" | "opening" | "lifting";

/**
 * Section 01 — The Sacred Awakening.
 * A minimal Kalinga temple door in darkness. On the guest's tap the doors
 * split open and dissolve into golden light that reveals Mahaprabhu
 * Jagannath's round eyes; after two seconds the scene rises like a curtain
 * onto the invitation.
 */
export function OpeningSequence({ onReveal, onDone }: OpeningSequenceProps) {
  const curtainRef = useRef<HTMLDivElement>(null);
  const doorRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  const running = useRef<Animation[]>([]);
  const [phase, setPhase] = useState<Phase>("waiting");
  const phaseRef = useRef<Phase>("waiting");
  const callbacks = useRef({ onReveal, onDone });
  callbacks.current = { onReveal, onDone };

  const play = (el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
    const anim = el.animate(keyframes, { fill: "both", ...options });
    running.current.push(anim);
    return anim.finished;
  };

  const go = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  // The door draws itself in, line by line, then the leaves and hint appear.
  useEffect(() => {
    setStatusTone("light");
    const lines = frameRef.current?.querySelectorAll(".door-draw") ?? [];
    lines.forEach((line, i) =>
      play(line, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: 900,
        delay: 150 + (i / lines.length) * (TIMING.draw - 900),
        easing: EASE.silk,
      }),
    );
    for (const leaf of [leftRef.current, rightRef.current]) {
      if (leaf) play(leaf, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: TIMING.draw * 0.6, easing: "ease-out" });
    }
    if (seamRef.current) {
      play(seamRef.current, [{ opacity: 0 }, { opacity: 0.55 }], { duration: 900, delay: TIMING.draw * 0.8 });
    }
    if (hintRef.current) {
      play(hintRef.current, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: TIMING.draw, easing: "ease-out" });
    }
    return () => {
      running.current.forEach((a) => a.cancel());
      setStatusTone("dark");
    };
  }, []);

  const lift = useCallback(async (fast: boolean) => {
    go("lifting");
    callbacks.current.onReveal();
    setStatusTone("dark");
    const curtain = curtainRef.current!;
    const duration = fast ? TIMING.skip : TIMING.curtain;
    if (skipRef.current) void play(skipRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 });
    try {
      await play(curtain, [{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], {
        duration,
        easing: EASE.temple,
      });
    } catch {
      /* unmounted */
    }
    callbacks.current.onDone();
  }, []);

  /** The guest's tap: doors, light, eyes, then the curtain. */
  const begin = useCallback(async () => {
    if (phaseRef.current !== "waiting") return;
    go("opening");
    running.current.forEach((a) => a.finish()); // complete the draw-in if tapped early

    const T = TIMING;
    try {
      void play(hintRef.current!, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 });
      void play(skipRef.current!, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 400 });
      await Promise.all([
        // Light leaking through the seam widens as the doors part
        play(seamRef.current!, [{ opacity: 0.55, transform: "scaleX(0.05)" }, { opacity: 1, transform: "scaleX(1)" }], {
          duration: T.doorOpen * 0.7,
          easing: EASE.temple,
        }),
        // Leaves split left and right, dissolving into the light
        play(leftRef.current!, [
          { transform: "rotateY(0deg)", opacity: 1 },
          { opacity: 1, offset: 0.55 },
          { transform: "rotateY(100deg)", opacity: 0 },
        ], { duration: T.doorOpen, easing: EASE.temple }),
        play(rightRef.current!, [
          { transform: "rotateY(0deg)", opacity: 1 },
          { opacity: 1, offset: 0.55 },
          { transform: "rotateY(-100deg)", opacity: 0 },
        ], { duration: T.doorOpen, easing: EASE.temple }),
        // The whole door (sketch, seam light, leaves) dissolves; golden light floods
        // the screen, peaking blindingly
        play(doorRef.current!, [{ opacity: 1 }, { opacity: 0 }], { duration: 900, delay: T.doorOpen * 0.45, easing: "ease-in" }),
        play(bloomRef.current!, [{ opacity: 0 }, { opacity: 1 }], {
          duration: T.doorOpen * 0.8,
          delay: T.doorOpen * 0.35,
          easing: "ease-out",
        }),
        play(flashRef.current!, [{ opacity: 0 }, { opacity: 0.95, offset: 0.45 }, { opacity: 0 }], {
          duration: 1400,
          delay: T.doorOpen * 0.45,
          easing: "ease-in-out",
        }),
        // Mahaprabhu's eyes emerge from the light
        play(eyesRef.current!, [{ opacity: 0, transform: "scale(0.9)" }, { opacity: 1, transform: "scale(1)" }], {
          duration: 1000,
          delay: T.doorOpen * 0.85,
          easing: EASE.silk,
        }),
      ]);
      setStatusTone("dark");
      await play(curtainRef.current!, [], { duration: T.hold });
      if ((phaseRef.current as Phase) === "opening") void lift(false); // not skipped meanwhile
    } catch {
      /* skipped or unmounted */
    }
  }, [lift]);

  const skip = useCallback(() => {
    if (phaseRef.current === "lifting") return;
    running.current.forEach((a) => a.pause());
    void lift(true);
  }, [lift]);

  // Escape skips at any point.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skip();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      void begin();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        ref={curtainRef}
        role={phase === "waiting" ? "button" : undefined}
        tabIndex={phase === "waiting" ? 0 : -1}
        aria-label={phase === "waiting" ? "Tap to open the temple doors" : undefined}
        onClick={() => void begin()}
        onKeyDown={onKeyDown}
        className="absolute inset-0 cursor-pointer select-none outline-none will-change-transform"
        style={{ backgroundColor: BLACK }}
      >
        {/* Golden light (behind the door, revealed as it opens) */}
        <div
          ref={bloomRef}
          aria-hidden
          className="absolute inset-0"
          style={{
            opacity: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 46%, #FFF3D2 0%, #F6D27E 34%, #DCA246 64%, #9A5E1C 100%)",
          }}
        />

        {/* The door */}
        <div
          ref={doorRef}
          aria-hidden
          className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2"
          style={{ width: "min(70vw, 300px, 52dvh)", aspectRatio: `${DOOR_VIEW.w} / ${DOOR_VIEW.h}` }}
        >
          <div ref={frameRef} className="absolute inset-0">
            <DoorFrame className="h-full w-full" />
          </div>
          <div
            className="absolute"
            style={{
              left: pct(DOOR_OPENING.x, DOOR_VIEW.w),
              top: pct(DOOR_OPENING.y, DOOR_VIEW.h),
              width: pct(DOOR_OPENING.w, DOOR_VIEW.w),
              height: pct(DOOR_OPENING.h, DOOR_VIEW.h),
              perspective: "900px",
            }}
          >
            {/* Light at the seam between the leaves */}
            <div
              ref={seamRef}
              className="absolute inset-0"
              style={{
                opacity: 0,
                background: "linear-gradient(90deg, transparent 0%, #FFE9B0 46%, #FFF8E6 50%, #FFE9B0 54%, transparent 100%)",
              }}
            />
            <div ref={leftRef} className="absolute inset-y-0 left-0 w-1/2" style={{ opacity: 0, transformOrigin: "left", backfaceVisibility: "hidden" }}>
              <DoorLeaf hinge="left" className="h-full w-full" />
            </div>
            <div ref={rightRef} className="absolute inset-y-0 right-0 w-1/2" style={{ opacity: 0, transformOrigin: "right", backfaceVisibility: "hidden" }}>
              <DoorLeaf hinge="right" className="h-full w-full" />
            </div>
          </div>
        </div>

        {/* Blinding flash */}
        <div ref={flashRef} aria-hidden className="absolute inset-0" style={{ opacity: 0, backgroundColor: "#FFF8EA" }} />

        {/* Mahaprabhu's eyes */}
        <div
          ref={eyesRef}
          className="absolute left-1/2 top-[46%] -ml-[min(42vw,170px)] -mt-[min(24vw,96px)] w-[min(84vw,340px)]"
          style={{ opacity: 0 }}
        >
          <JagannathEyes className="h-auto w-full" />
        </div>

        <p
          ref={hintRef}
          aria-hidden
          className="absolute inset-x-0 bottom-[max(12dvh,4.5rem)] text-center font-sans text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-[#D9B877]"
          style={{ opacity: 0 }}
        >
          {wedding.opening.tapHint}
        </p>

        <CurtainHem />
      </div>

      <button
        ref={skipRef}
        type="button"
        onClick={skip}
        className="absolute right-4 top-[calc(max(1rem,env(safe-area-inset-top))_+_var(--status-bar,0px))] inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#D9B877]/50 bg-black/25 px-4 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#F3E3C0]"
        style={{ opacity: 0, pointerEvents: phase === "opening" ? "auto" : "none" }}
        tabIndex={phase === "opening" ? 0 : -1}
      >
        Skip
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M3 2.5 6.5 6 3 9.5M7 2.5 10.5 6 7 9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/** Gold hem with small tassels along the curtain's lower edge. */
function CurtainHem() {
  return (
    <svg aria-hidden className="absolute inset-x-0 bottom-0 block h-[18px] w-full" preserveAspectRatio="none">
      <defs>
        <pattern id="hem-tassels" width="16" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 4q8 8 16 0" fill="none" stroke="#C99A45" strokeWidth="1" />
          <path d="M8 8v5" stroke="#C99A45" strokeWidth="1" />
          <circle cx="8" cy="15" r="1.6" fill="#C99A45" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="2" fill="#C99A45" />
      <rect x="0" y="2" width="100%" height="16" fill="url(#hem-tassels)" />
    </svg>
  );
}
