import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { wedding } from "@/config/wedding";
import { EASE } from "@/lib/motion";
import { playSankha, type SoundHandle } from "@/lib/sankha";
import { setStatusTone } from "@/lib/viewMode";

/** Timing (ms). */
export const TIMING = {
  appear: 1100, // the temple door fades in out of the dark
  rest: 900, // a moment before the doors stir; light gathers at the seam
  doorOpen: 2400, // the leaves swing smoothly inward on their hinges, into golden light
  hold: 2600, // darshan of Mahaprabhu Jagannath before the curtain rises
  curtain: 1300, // the whole scene slides up like an opening curtain
  skip: 500,
};

/** The temple door artwork, and where its two leaves sit in it (image pixels). */
const IMG = { src: "/art/temple-door.webp", w: 992, h: 1586 };
/**
 * Mahaprabhu Jagannath, revealed beyond the doors (portrait artwork, shown
 * whole). `mask` cuts away the artwork's own yellow sunburst, so he stands
 * on a deeper, softer golden glow instead.
 */
const DARSHAN = {
  src: "/art/jagannath-darshan.webp",
  mask: "/art/jagannath-darshan-mask.png",
  alt: "Mahaprabhu Jagannath",
  w: 1045,
  h: 1505,
};
// Warm antique gold: soft and light at the heart, deepening to bronze at the edges.
const DARSHAN_GLOW =
  "radial-gradient(ellipse 95% 70% at 50% 58%, #EBCB8A 0%, #DDB46C 30%, #C9974A 58%, #A06A2C 85%, #7E4E1C 100%)";
// The two leaves: below the carved Lakshmi lintel, edge to edge, meeting at the centre post.
const DOOR = { x: 8, y: 420, w: 976, h: 1166 };
const SEAM = 496;
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
  const soundRef = useRef<HTMLButtonElement>(null);
  const sound = useRef<SoundHandle | null>(null);
  const [soundOn, setSoundOn] = useState(false);
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
    for (const src of [DARSHAN.src, DARSHAN.mask]) new Image().src = src;
    setStatusTone("light");
    return () => {
      running.current.forEach((a) => a.cancel());
      running.current = [];
      sound.current?.stop();
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
    for (const b of [skipRef.current, soundRef.current]) if (b) void play(b, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 });
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
      void play(soundRef.current!, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: T.appear });
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
          duration: T.doorOpen + 300,
          delay: T.doorOpen * 0.3,
          easing: SMOOTH,
        }),
        // Golden light rises smoothly as the doorway fills the view...
        play(bloomRef.current!, [{ opacity: 0 }, { opacity: 1 }], {
          duration: T.doorOpen * 0.5,
          delay: T.doorOpen * 0.5,
          easing: "ease-in-out",
        }),
        // ...with a soft luminous swell (not a harsh flash)...
        play(flashRef.current!, [{ opacity: 0 }, { opacity: 0.35, offset: 0.5 }, { opacity: 0 }], {
          duration: 1200,
          delay: T.doorOpen * 0.75,
          easing: "ease-in-out",
        }),
        // ...and Mahaprabhu Jagannath's darshan emerges from it, without delay
        play(darshanRef.current!, [{ opacity: 0, transform: "scale(1.05)" }, { opacity: 1, transform: "scale(1)" }], {
          duration: 1300,
          delay: T.doorOpen * 0.85,
          easing: "cubic-bezier(0.33, 0, 0.2, 1)",
        }),
      ]);
      setStatusTone("light"); // over the deep golden glow
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

  /** Sound button: plays the sankha (must run inside the tap); a second tap stops it. */
  const toggleSound = () => {
    if (sound.current) {
      sound.current.stop();
      sound.current = null;
      setSoundOn(false);
      return;
    }
    const handle = playSankha(wedding.assets.openingSound);
    sound.current = handle;
    setSoundOn(true);
    void handle.ended.then(() => {
      if (sound.current !== handle) return;
      sound.current = null;
      setSoundOn(false);
    });
  };

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

        {/* Darshan: Mahaprabhu Jagannath on a deep, soft golden glow */}
        <div ref={darshanRef} className="absolute inset-0 overflow-hidden" style={{ opacity: 0 }}>
          <div aria-hidden className="absolute inset-0" style={{ background: DARSHAN_GLOW }} />
          <img
            src={DARSHAN.src}
            alt={DARSHAN.alt}
            decoding="async"
            className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
            style={{
              width: `min(100%, calc(100dvh * ${DARSHAN.w / DARSHAN.h}))`,
              aspectRatio: `${DARSHAN.w} / ${DARSHAN.h}`,
              maskImage: `url(${DARSHAN.mask})`,
              WebkitMaskImage: `url(${DARSHAN.mask})`,
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
            }}
          />
        </div>

        {/* Blinding flash */}
        <div ref={flashRef} aria-hidden className="absolute inset-0" style={{ opacity: 0, backgroundColor: "#FFF8EA" }} />

        <CurtainHem />
      </div>

      {/* Sound, opposite Skip */}
      <button
        ref={soundRef}
        type="button"
        onClick={toggleSound}
        aria-label={soundOn ? "Stop the sankha" : "Play the sankha"}
        aria-pressed={soundOn}
        className="absolute left-4 top-[calc(max(1rem,env(safe-area-inset-top))_+_var(--status-bar,0px))] inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#D9B877]/50 bg-black/25 text-[#F3E3C0]"
        style={{ opacity: 0, pointerEvents: phase === "lifting" ? "none" : "auto" }}
        tabIndex={phase === "lifting" ? -1 : 0}
      >
        <SoundIcon on={soundOn} />
      </button>

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

/** A speaker; with sound waves while playing, crossed out when silent. */
function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 7h2.5l3.5-3v10l-3.5-3H2.5Z" fill="currentColor" fillOpacity="0.25" />
      {on ? (
        <>
          <path d="M11.3 6.4a3.2 3.2 0 0 1 0 5.2" />
          <path d="M13.3 4.4a6 6 0 0 1 0 9.2" />
        </>
      ) : (
        <path d="M11.5 7l4 4M15.5 7l-4 4" />
      )}
    </svg>
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
