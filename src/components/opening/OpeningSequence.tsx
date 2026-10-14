import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { JagannathEyes } from "@/components/art/JagannathEyes";
import { wedding } from "@/config/wedding";
import { EASE } from "@/lib/motion";
import { setStatusTone } from "@/lib/viewMode";

/** Timing (ms). */
export const TIMING = {
  appear: 1000, // the temple door fades in out of the dark
  approach: 1300, // the camera draws close to the door
  doorOpen: 1700, // the leaves swing inward on their hinges, into golden light
  hold: 2000, // Mahaprabhu's eyes, centred, before the curtain rises
  curtain: 1300, // the whole scene slides up like an opening curtain
  skip: 500,
};

/** The temple door artwork, and where its two leaves sit in it (image pixels). */
const IMG = { src: "/art/temple-door.webp", w: 1024, h: 765 };
const DOOR = { x: 191, y: 176, w: 644, h: 572 };
const SEAM = 512;
const LEFT_W = SEAM - DOOR.x;
const RIGHT_W = DOOR.x + DOOR.w - SEAM;
/** The door's centre, as a fraction of the image — the camera's focus. */
const FOCUS = { x: (DOOR.x + DOOR.w / 2) / IMG.w, y: (DOOR.y + DOOR.h / 2) / IMG.h };
const ZOOM = { approach: 1.45, enter: 2.7 };

// Matches the dark sky at the top of the artwork.
const BG = "#3B2010";
// Melts the artwork's top and bottom edges into the dark.
const EDGE_FADE = "linear-gradient(to bottom, transparent, #000 5%, #000 95%, transparent)";
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
 * The carved temple door waits in the dark. On the guest's tap the view
 * draws close, the two leaves swing inward on their hinges into golden
 * light, and Mahaprabhu Jagannath's round eyes emerge; after two seconds
 * the scene rises like a curtain onto the invitation.
 */
export function OpeningSequence({ onReveal, onDone }: OpeningSequenceProps) {
  const curtainRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leftShadeRef = useRef<HTMLDivElement>(null);
  const rightShadeRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const running = useRef<Animation[]>([]);
  const pulse = useRef<Animation | null>(null);
  const appeared = useRef(false);
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

  useEffect(() => {
    setStatusTone("light");
    return () => {
      running.current.forEach((a) => a.cancel());
      running.current = [];
      pulse.current?.cancel();
      appeared.current = false; // a remount (StrictMode) fades the door in again
      setStatusTone("dark");
    };
  }, []);

  // Once the artwork has loaded, the door fades in out of the dark and a thread
  // of light breathes at the seam between the leaves.
  const appear = useCallback(() => {
    if (appeared.current || phaseRef.current !== "waiting") return;
    appeared.current = true;
    play(sceneRef.current!, [{ opacity: 0 }, { opacity: 1 }], { duration: TIMING.appear, easing: "ease-out" });
    play(hintRef.current!, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: TIMING.appear * 0.8, easing: "ease-out" });
    pulse.current = seamRef.current!.animate([{ opacity: 0.15 }, { opacity: 0.55 }], {
      duration: 1600,
      delay: TIMING.appear,
      iterations: Infinity,
      direction: "alternate",
      easing: "ease-in-out",
      fill: "backwards",
    });
  }, []);

  // A cached image may have loaded before React attached onLoad.
  useEffect(() => {
    if (imgRef.current?.complete) appear();
  }, [appear]);

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

  /** The guest's tap: draw close, doors swing open, light, eyes, then the curtain. */
  const begin = useCallback(async () => {
    if (phaseRef.current !== "waiting") return;
    appear(); // in case the artwork is still loading
    go("opening");
    pulse.current?.cancel();
    running.current.forEach((a) => a.finish()); // complete the fade-in if tapped early

    const T = TIMING;
    const zoom = zoomRef.current!;
    const swing = "cubic-bezier(0.55, 0, 0.25, 1)";
    try {
      void play(hintRef.current!, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
      void play(skipRef.current!, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 400 });
      await Promise.all([
        play(zoom, [{ transform: "scale(1)" }, { transform: `scale(${ZOOM.approach})` }], {
          duration: T.approach,
          easing: EASE.temple,
        }),
        play(seamRef.current!, [{ opacity: 0.3 }, { opacity: 1 }], { duration: T.approach, easing: "ease-in" }),
      ]);

      await Promise.all([
        // The leaves swing inward on their hinges, darkening as they turn away
        play(leftRef.current!, [{ transform: "rotateY(0deg)" }, { transform: "rotateY(84deg)" }], { duration: T.doorOpen, easing: swing }),
        play(rightRef.current!, [{ transform: "rotateY(0deg)" }, { transform: "rotateY(-84deg)" }], { duration: T.doorOpen, easing: swing }),
        play(leftShadeRef.current!, [{ opacity: 0 }, { opacity: 0.65 }], { duration: T.doorOpen, easing: swing }),
        play(rightShadeRef.current!, [{ opacity: 0 }, { opacity: 0.65 }], { duration: T.doorOpen, easing: swing }),
        play(seamRef.current!, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }),
        // ...and the view passes through the doorway into the light
        play(zoom, [{ transform: `scale(${ZOOM.approach})` }, { transform: `scale(${ZOOM.enter})` }], {
          duration: T.doorOpen + 500,
          delay: T.doorOpen * 0.35,
          easing: "cubic-bezier(0.5, 0, 0.3, 1)",
        }),
        play(bloomRef.current!, [{ opacity: 0 }, { opacity: 1 }], {
          duration: T.doorOpen * 0.7,
          delay: T.doorOpen * 0.6,
          easing: "ease-in",
        }),
        play(flashRef.current!, [{ opacity: 0 }, { opacity: 0.95, offset: 0.45 }, { opacity: 0 }], {
          duration: 1400,
          delay: T.doorOpen * 0.75,
          easing: "ease-in-out",
        }),
        // Mahaprabhu's eyes emerge from the light
        play(eyesRef.current!, [{ opacity: 0, transform: "scale(0.9)" }, { opacity: 1, transform: "scale(1)" }], {
          duration: 1000,
          delay: T.doorOpen * 1.05,
          easing: EASE.silk,
        }),
      ]);
      setStatusTone("dark");
      await play(curtainRef.current!, [], { duration: T.hold });
      if ((phaseRef.current as Phase) === "opening") void lift(false); // not skipped meanwhile
    } catch {
      /* skipped or unmounted */
    }
  }, [appear, lift]);

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

  const leaf = (side: "left" | "right"): CSSProperties => ({
    left: side === "left" ? 0 : pct(LEFT_W, DOOR.w),
    width: pct(side === "left" ? LEFT_W : RIGHT_W, DOOR.w),
    transformOrigin: side,
    backfaceVisibility: "hidden",
  });
  // The leaf shows its own slice of the artwork.
  const leafArt = (side: "left" | "right"): CSSProperties => {
    const w = side === "left" ? LEFT_W : RIGHT_W;
    const x = side === "left" ? DOOR.x : SEAM;
    return { left: pct(-x, w), top: pct(-DOOR.y, DOOR.h), width: pct(IMG.w, w), height: pct(IMG.h, DOOR.h), maxWidth: "none" };
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
        style={{ backgroundColor: BG }}
      >
        {/* The temple door, its centre held at the focus point of the screen */}
        <div
          ref={sceneRef}
          aria-hidden
          className="absolute inset-x-0 top-[46%]"
          style={{ aspectRatio: `${IMG.w} / ${IMG.h}`, transform: `translateY(-${FOCUS.y * 100}%)`, opacity: 0 }}
        >
          <div
            ref={zoomRef}
            className="absolute inset-0 will-change-transform"
            style={{ transformOrigin: `${FOCUS.x * 100}% ${FOCUS.y * 100}%` }}
          >
            <img
              src={IMG.src}
              alt=""
              decoding="async"
              onLoad={appear}
              onError={appear}
              ref={imgRef}
              className="absolute inset-0 h-full w-full"
              style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
            />

            <div
              className="absolute"
              style={{
                left: pct(DOOR.x, IMG.w),
                top: pct(DOOR.y, IMG.h),
                width: pct(DOOR.w, IMG.w),
                height: pct(DOOR.h, IMG.h),
                perspective: "700px",
              }}
            >
              {/* Inside the sanctum: warm golden light behind the doors */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 70% at 50% 52%, #FFF1C8 0%, #F2C66E 28%, #C27F2E 62%, #4A2410 100%)",
                }}
              />
              <div ref={leftRef} className="absolute inset-y-0 overflow-hidden" style={leaf("left")}>
                <img src={IMG.src} alt="" className="absolute" style={leafArt("left")} />
                <div ref={leftShadeRef} className="absolute inset-0 bg-[#140904]" style={{ opacity: 0 }} />
              </div>
              <div ref={rightRef} className="absolute inset-y-0 overflow-hidden" style={leaf("right")}>
                <img src={IMG.src} alt="" className="absolute" style={leafArt("right")} />
                <div ref={rightShadeRef} className="absolute inset-0 bg-[#140904]" style={{ opacity: 0 }} />
              </div>
              {/* A thread of light at the seam, hinting that the doors open */}
              <div
                ref={seamRef}
                className="absolute inset-y-[2%] w-[3px] -translate-x-1/2 rounded-full"
                style={{
                  left: pct(LEFT_W, DOOR.w),
                  opacity: 0,
                  background: "linear-gradient(180deg, transparent, #FFE7A6 18%, #FFF6DC 50%, #FFE7A6 82%, transparent)",
                  boxShadow: "0 0 10px 2px rgb(255 214 130 / 0.6)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Vignette over the artwork, so its edges melt into the dark */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_42%_at_50%_46%,transparent_55%,rgb(59_32_16/0.9)_100%)]" />

        {/* Golden light filling the view as we pass through the doorway */}
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
          className="absolute inset-x-0 bottom-[max(12dvh,4.5rem)] text-center font-sans text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-[#E5C88A]"
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
