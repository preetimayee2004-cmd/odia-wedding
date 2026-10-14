import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { EASE } from "@/lib/motion";
import { setStatusTone } from "@/lib/viewMode";

/** Timing (ms). */
export const TIMING = {
  appear: 1100, // the temple door fades in out of the dark
  rest: 900, // a moment before the doors stir; light gathers at the seam
  doorOpen: 2600, // the leaves swing smoothly inward on their hinges, into golden light
  hold: 2800, // darshan of Mahaprabhu Jagannath before the curtain rises
  curtain: 1300, // the whole scene slides up like an opening curtain
  skip: 500,
};

/** The temple door artwork, and where its two leaves sit in it (image pixels). */
const IMG = { src: "/art/temple-door.webp", w: 1024, h: 765 };
/** Mahaprabhu Jagannath, revealed in golden light beyond the doors (square artwork, shown uncropped). */
const DARSHAN = { src: "/art/jagannath-darshan.jpg", alt: "Mahaprabhu Jagannath in golden light between temple pillars" };
const DOOR = { x: 191, y: 176, w: 644, h: 572 };
const SEAM = 512;
const LEFT_W = SEAM - DOOR.x;
const RIGHT_W = DOOR.x + DOOR.w - SEAM;
/** The door's centre, as a fraction of the image — where the view moves in. */
const FOCUS = { x: (DOOR.x + DOOR.w / 2) / IMG.w, y: (DOOR.y + DOOR.h / 2) / IMG.h };
const ZOOM_IN = 1.9;
const SMOOTH = "cubic-bezier(0.45, 0, 0.25, 1)";

// Matches the dark sky at the top of the artwork.
const BG = "#3B2010";
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
 * The carved temple door fills the screen, fading in from the dark. Light
 * gathers at the seam, then the two leaves swing smoothly inward on their
 * hinges into golden light, the view passes through the doorway, and
 * Mahaprabhu Jagannath's darshan emerges from the light; then the scene
 * rises like a curtain onto the invitation. It plays by itself (Skip / Esc).
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
  const darshanRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const running = useRef<Animation[]>([]);
  const started = useRef(false);
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
    const warm = new Image();
    warm.src = DARSHAN.src;
    setStatusTone("light");
    return () => {
      running.current.forEach((a) => a.cancel());
      running.current = [];
      started.current = false; // a remount (StrictMode) starts the sequence again
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

  /** Once the artwork is ready, the whole sequence plays through by itself. */
  const start = useCallback(async () => {
    if (started.current || phaseRef.current !== "waiting") return;
    started.current = true;
    const T = TIMING;
    try {
      void play(skipRef.current!, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: T.appear });
      await Promise.all([
        play(sceneRef.current!, [{ opacity: 0 }, { opacity: 1 }], { duration: T.appear, easing: "ease-out" }),
        // Light gathers at the seam between the leaves
        play(seamRef.current!, [{ opacity: 0 }, { opacity: 0.9 }], {
          duration: T.rest + 400,
          delay: T.appear - 400,
          easing: "ease-in",
        }),
        play(curtainRef.current!, [], { duration: T.appear + T.rest }),
      ]);
      if (phaseRef.current !== "waiting") return; // skipped meanwhile
      go("opening");

      await Promise.all([
        // The leaves swing smoothly inward on their hinges, darkening as they turn away
        play(leftRef.current!, [{ transform: "rotateY(0deg)" }, { transform: "rotateY(84deg)" }], { duration: T.doorOpen, easing: SMOOTH }),
        play(rightRef.current!, [{ transform: "rotateY(0deg)" }, { transform: "rotateY(-84deg)" }], { duration: T.doorOpen, easing: SMOOTH }),
        play(leftShadeRef.current!, [{ opacity: 0 }, { opacity: 0.65 }], { duration: T.doorOpen, easing: SMOOTH }),
        play(rightShadeRef.current!, [{ opacity: 0 }, { opacity: 0.65 }], { duration: T.doorOpen, easing: SMOOTH }),
        play(seamRef.current!, [{ opacity: 0.9 }, { opacity: 0 }], { duration: 700 }),
        // ...while the view glides in through the doorway, into the light
        play(zoomRef.current!, [{ transform: "scale(1)" }, { transform: `scale(${ZOOM_IN})` }], {
          duration: T.doorOpen + 700,
          delay: T.doorOpen * 0.4,
          easing: SMOOTH,
        }),
        play(bloomRef.current!, [{ opacity: 0 }, { opacity: 1 }], {
          duration: T.doorOpen * 0.6,
          delay: T.doorOpen * 0.7,
          easing: "ease-in",
        }),
        play(flashRef.current!, [{ opacity: 0 }, { opacity: 0.9, offset: 0.45 }, { opacity: 0 }], {
          duration: 1500,
          delay: T.doorOpen * 0.8,
          easing: "ease-in-out",
        }),
        // Mahaprabhu Jagannath's darshan emerges from the light
        play(darshanRef.current!, [{ opacity: 0, transform: "scale(1.06)" }, { opacity: 1, transform: "scale(1)" }], {
          duration: 1700,
          delay: T.doorOpen * 1.3, // after a moment of pure golden light
          easing: EASE.silk,
        }),
      ]);
      setStatusTone("dark"); // over the golden light around the artwork
      await play(curtainRef.current!, [], { duration: T.hold });
      if ((phaseRef.current as Phase) === "opening") void lift(false); // not skipped meanwhile
    } catch {
      /* skipped or unmounted */
    }
  }, [lift]);

  // A cached image may have loaded before React attached onLoad.
  useEffect(() => {
    if (imgRef.current?.complete) void start();
  }, [start]);

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

  const leaf = (side: "left" | "right"): CSSProperties => ({
    left: side === "left" ? 0 : pct(LEFT_W, DOOR.w),
    width: pct(side === "left" ? LEFT_W : RIGHT_W, DOOR.w),
    transformOrigin: side,
    backfaceVisibility: "hidden",
  });
  // Each leaf shows its own slice of the artwork.
  const leafArt = (side: "left" | "right"): CSSProperties => {
    const w = side === "left" ? LEFT_W : RIGHT_W;
    const x = side === "left" ? DOOR.x : SEAM;
    return { left: pct(-x, w), top: pct(-DOOR.y, DOOR.h), width: pct(IMG.w, w), height: pct(IMG.h, DOOR.h), maxWidth: "none" };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div ref={curtainRef} className="absolute inset-0 overflow-hidden will-change-transform" style={{ backgroundColor: BG }}>
        {/* The temple door, filling the screen (cover), centred on the doors */}
        <div
          ref={sceneRef}
          aria-hidden
          className="absolute left-1/2 top-1/2"
          style={{
            width: `max(100%, calc(100dvh * ${IMG.w / IMG.h}))`,
            aspectRatio: `${IMG.w} / ${IMG.h}`,
            transform: `translate(-${FOCUS.x * 100}%, -50%)`,
            opacity: 0,
          }}
        >
          <div
            ref={zoomRef}
            className="absolute inset-0 will-change-transform"
            style={{ transformOrigin: `${FOCUS.x * 100}% ${FOCUS.y * 100}%` }}
          >
            <img
              ref={imgRef}
              src={IMG.src}
              alt=""
              decoding="async"
              onLoad={() => void start()}
              onError={() => void start()}
              className="absolute inset-0 h-full w-full"
            />

            <div
              className="absolute"
              style={{
                left: pct(DOOR.x, IMG.w),
                top: pct(DOOR.y, IMG.h),
                width: pct(DOOR.w, IMG.w),
                height: pct(DOOR.h, IMG.h),
                perspective: "1400px",
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
              {/* A thread of light at the seam as the doors are about to part */}
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

        {/* Soft vignette so the screen edges stay quiet */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_85%_at_50%_55%,transparent_55%,rgb(20_10_4/0.55)_100%)]" />

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

        {/* Darshan: the whole artwork, uncropped, over a soft blurred copy of itself */}
        <div ref={darshanRef} className="absolute inset-0 overflow-hidden" style={{ opacity: 0 }}>
          <img
            src={DARSHAN.src}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
          />
          <img src={DARSHAN.src} alt={DARSHAN.alt} decoding="async" className="absolute inset-0 h-full w-full object-contain" />
        </div>

        {/* Blinding flash */}
        <div ref={flashRef} aria-hidden className="absolute inset-0" style={{ opacity: 0, backgroundColor: "#FFF8EA" }} />

        <CurtainHem />
      </div>

      <button
        ref={skipRef}
        type="button"
        onClick={skip}
        className="absolute right-4 top-[calc(max(1rem,env(safe-area-inset-top))_+_var(--status-bar,0px))] inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#D9B877]/50 bg-black/25 px-4 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#F3E3C0]"
        style={{ opacity: 0, pointerEvents: phase === "lifting" ? "none" : "auto" }}
        tabIndex={phase === "lifting" ? -1 : 0}
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
