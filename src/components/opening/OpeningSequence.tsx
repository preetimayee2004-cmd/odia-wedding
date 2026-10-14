import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { wedding } from "@/config/wedding";
import { EASE } from "@/lib/motion";
import { playSankha, type SoundHandle } from "@/lib/sankha";
import { setStatusTone } from "@/lib/viewMode";
import { FINGERTIP, Fingertip, MoteBurst, Motes, Petals, Swirl } from "@/components/opening/OpeningEffects";

/** The carved temple gate artwork, and where its two leaves sit in it (image pixels). */
const IMG = { src: "/art/temple-door.webp", w: 992, h: 1586 };
const DOOR = { x: 8, y: 420, w: 976, h: 1166 }; // below the Lakshmi lintel, edge to edge
const SEAM = 496; // the centre post, where the leaves meet
const LOCK = { x: 496, y: 1100 }; // the brass latch
const LEFT_W = SEAM - DOOR.x;
const RIGHT_W = DOOR.x + DOOR.w - SEAM;
const FOCUS = { x: (DOOR.x + DOOR.w / 2) / IMG.w, y: (DOOR.y + DOOR.h / 2) / IMG.h };
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/**
 * Mahaprabhu Jagannath for the darshan (portrait artwork, shown whole);
 * `mask` cuts away the artwork's own yellow sunburst so he glows in the dark.
 */
const DARSHAN = { src: "/art/jagannath-darshan.webp", mask: "/art/jagannath-darshan-mask.png", alt: "Mahaprabhu Jagannath", w: 1045, h: 1505 };

const DARK = "#120904"; // deep black-brown of the sanctum
const AUTO_OPEN = 5000; // opens by itself if not tapped
const READY_TIMEOUT = 8000; // never wait longer than this for images
const SKIP_MS = 450;
const SMOOTH = "cubic-bezier(0.45, 0, 0.25, 1)";
const CENTRE = "translate(-50%, -50%)"; // kept in the keyframes of centred elements
const FINGER_H = 72; // px

/**
 * The opening, as scenes in strict sequence — each starts only when the one
 * before has finished, and the gate is removed from the page before the
 * darshan begins (~11 s):
 *  gate     a thread of light at the seam; the doors part into golden light,
 *           rays and dust; the whole gate fades out and is removed
 *  darshan  on a solid dark background: a golden glow, then Mahaprabhu
 *           emerges slowly in his halo; petals fall; held ~2 s
 *  dissolve he dissolves into golden motes; petals and motes swirl in; the
 *           halo becomes a circle of golden light
 *  ending   that circle settles onto the invitation's rangoli while the dark
 *           cross-fades straight to the invitation card (no white screen)
 */
const T = {
  doorsDelay: 400,
  doorsMs: 2400,
  gateFadeMs: 900,
  glowMs: 1400,
  deityDelay: 600,
  deityMs: 2000,
  holdMs: 2200,
  dissolveMs: 1700,
  settleMs: 1000,
  fadeMs: 1000,
};

interface OpeningSequenceProps {
  /** The invitation may start appearing (the light is settling onto it). */
  onReveal: () => void;
  /** The overlay can be removed. */
  onDone: () => void;
}

type Phase = "loading" | "waiting" | "gate" | "darshan" | "dissolve" | "ending";

/** Waits for an image to load (or fail) without relying on decode(). */
function loadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}

/**
 * Section 01 — The Sacred Awakening.
 * The carved temple gate, with Goddess Lakshmi above, waits in warm light; a
 * golden fingertip taps its brass lock above "TAP TO OPEN". A tap — or, after
 * five seconds, nothing at all — opens the doors outward into golden light;
 * the gate dims into the dark sanctum, Mahaprabhu Jagannath's darshan emerges
 * in a golden halo as petals fall, then dissolves into golden light that
 * settles onto the invitation. Skip / Esc; a sound button plays the sankha.
 */
export function OpeningSequence({ onReveal, onDone }: OpeningSequenceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leftShadeRef = useRef<HTMLDivElement>(null);
  const rightShadeRef = useRef<HTMLDivElement>(null);
  const interiorRef = useRef<HTMLDivElement>(null);
  const doorGlowRef = useRef<HTMLDivElement>(null);
  const doorRaysRef = useRef<HTMLDivElement>(null);
  const darshanRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const deityRef = useRef<HTMLImageElement>(null);
  const backPetalsRef = useRef<HTMLDivElement>(null);
  const frontPetalsRef = useRef<HTMLDivElement>(null);
  const swirlRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const soundRef = useRef<HTMLButtonElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const running = useRef<Animation[]>([]);
  const timers = useRef<number[]>([]);
  const prepared = useRef(false);
  const sound = useRef<SoundHandle | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [phase, setPhase] = useState<Phase>("loading");
  const phaseRef = useRef<Phase>("loading");
  const [hint, setHint] = useState(false);
  const [gateGone, setGateGone] = useState(false);
  const [deityRect, setDeityRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const callbacks = useRef({ onReveal, onDone });
  callbacks.current = { onReveal, onDone };

  const go = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };
  const play = (el: Element | null, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
    if (!el) return Promise.resolve();
    const anim = el.animate(keyframes, { fill: "both", ...options });
    running.current.push(anim);
    return anim.finished.then(() => undefined);
  };
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  /** A pause in the sequence (cancelled, never resolving, if the opening is skipped). */
  const wait = (ms: number) => new Promise<void>((resolve) => later(ms, resolve));
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    setStatusTone("light");
    return () => {
      running.current.forEach((a) => a.cancel());
      running.current = [];
      clearTimers();
      sound.current?.stop();
      prepared.current = false; // a remount (StrictMode) prepares again
      setStatusTone("dark");
    };
  }, []);

  /**
   * The hand-off to the invitation. Normally the circle of golden light
   * settles onto the invitation's rangoli while the dark background and the
   * darshan cross-fade away to the card beneath; Skip simply fades out.
   */
  const finish = useCallback(async (fast: boolean) => {
    if (phaseRef.current === "ending") return;
    clearTimers();
    go("ending");
    setHint(false);
    callbacks.current.onReveal();
    setStatusTone("dark");
    for (const b of [skipRef.current, soundRef.current]) void play(b, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 });
    try {
      if (fast) {
        await play(rootRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: SKIP_MS, easing: "ease-in-out" });
      } else {
        const disc = discRef.current;
        const target = document.querySelector("#invitation [aria-label^='Tap the rangoli'] svg")?.getBoundingClientRect();
        const moves: Promise<void>[] = [
          play(bgRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: T.fadeMs, easing: "ease-in-out" }),
          play(darshanRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: T.fadeMs * 0.8, easing: "ease-in-out" }),
          play(swirlRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: T.fadeMs * 0.6, easing: "ease-out" }),
        ];
        if (disc && target && target.width) {
          const d = disc.getBoundingClientRect();
          const dx = target.left + target.width / 2 - (d.left + d.width / 2);
          const dy = target.top + target.height / 2 - (d.top + d.height / 2);
          moves.push(
            play(disc, [
              { transform: `${CENTRE} scale(1)` },
              { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${(target.width / d.width).toFixed(3)})` },
            ], { duration: T.settleMs, easing: SMOOTH }),
          );
        }
        await Promise.all(moves);
        // the light gives way to the rangoli as it builds itself
        await play(disc, [{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: "ease-out" });
      }
    } catch {
      /* unmounted */
    }
    callbacks.current.onDone();
  }, []);

  /** The one shared start: tap or timer. Runs once. */
  const start = useCallback(() => {
    if (phaseRef.current !== "waiting") return;
    clearTimers(); // cancels the 5-second countdown
    go("gate");
    setHint(false);
    void play(skipRef.current, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 });

    void (async () => {
      // ---- Gate: a thread of light, then the doors part into golden light
      const D = T.doorsDelay;
      void play(seamRef.current, [{ opacity: 0.35, transform: "scaleX(1)" }, { opacity: 1, transform: "scaleX(2.2)" }, { opacity: 0, transform: "scaleX(4)" }], { duration: D + 900, easing: "ease-in-out" });
      // They part from the centre to either side, swinging into the sanctum
      for (const [leaf, angle] of [[leftRef.current, 84], [rightRef.current, -84]] as const) {
        void play(leaf, [{ transform: "rotateY(0deg)" }, { transform: `rotateY(${angle}deg)` }], { duration: T.doorsMs, delay: D, easing: SMOOTH });
        void play(leaf, [{ opacity: 1 }, { opacity: 1, offset: 0.65 }, { opacity: 0 }], { duration: T.doorsMs, delay: D, easing: "ease-in" });
      }
      for (const shade of [leftShadeRef.current, rightShadeRef.current]) {
        void play(shade, [{ opacity: 0 }, { opacity: 0.55 }], { duration: T.doorsMs, delay: D, easing: SMOOTH });
      }
      void play(interiorRef.current, [{ opacity: 0.55 }, { opacity: 1 }], { duration: T.doorsMs, delay: D, easing: "ease-in" });
      void play(doorGlowRef.current, [{ opacity: 0 }, { opacity: 0.9 }], { duration: T.doorsMs, delay: D + 200, easing: "ease-in-out" });
      void play(doorRaysRef.current, [{ opacity: 0 }, { opacity: 0.6 }], { duration: T.doorsMs, delay: D + 400, easing: "ease-in-out" });
      void play(zoomRef.current, [{ transform: "scale(1)" }, { transform: "scale(1.06)" }], { duration: D + T.doorsMs + T.gateFadeMs, easing: SMOOTH });
      await wait(D + T.doorsMs);
      if ((phaseRef.current as Phase) !== "gate") return; // skipped meanwhile

      // The whole gate fades out and is removed — nothing of it stays behind
      await play(sceneRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: T.gateFadeMs, easing: "ease-in-out" });
      if ((phaseRef.current as Phase) !== "gate") return; // skipped meanwhile
      setGateGone(true);

      // ---- Darshan, on the solid dark background
      go("darshan");
      setStatusTone("light");
      if (darshanRef.current) darshanRef.current.style.opacity = "1";
      void play(glowRef.current, [{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "scale(1)" }], { duration: T.glowMs, easing: "ease-out" });
      void play(haloRef.current, [{ opacity: 0, transform: `${CENTRE} scale(0.8)` }, { opacity: 1, transform: `${CENTRE} scale(1)` }], { duration: T.glowMs + 200, delay: 200, easing: "ease-out" });
      await play(deityRef.current, [{ opacity: 0, transform: `${CENTRE} scale(0.96)` }, { opacity: 1, transform: `${CENTRE} scale(1)` }], { duration: T.deityMs, delay: T.deityDelay, easing: EASE.silk });
      await wait(T.holdMs);
      if ((phaseRef.current as Phase) !== "darshan") return; // skipped meanwhile

      // ---- Dissolve: golden motes; petals swirl in; the halo becomes a circle of light
      const r = deityRef.current?.getBoundingClientRect();
      if (r) setDeityRect({ left: r.left, top: r.top, width: r.width, height: r.height });
      go("dissolve");
      void play(deityRef.current, [{ opacity: 1, transform: `${CENTRE} scale(1)` }, { opacity: 0, transform: `${CENTRE} scale(1.03)` }], { duration: 1500, easing: "ease-in-out" });
      void play(haloRef.current, [{ opacity: 1, transform: `${CENTRE} scale(1)` }, { opacity: 0, transform: `${CENTRE} scale(1.3)` }], { duration: T.dissolveMs, easing: "ease-in-out" });
      for (const layer of [backPetalsRef.current, frontPetalsRef.current]) {
        void play(layer, [{ opacity: 1 }, { opacity: 0 }], { duration: 1200, delay: 200, easing: "ease-in" });
      }
      void play(swirlRef.current, [
        { opacity: 0, transform: `${CENTRE} rotate(0deg) scale(1.25)` },
        { opacity: 1, offset: 0.3 },
        { opacity: 1, transform: `${CENTRE} rotate(300deg) scale(0.35)` },
      ], { duration: T.dissolveMs + 300, delay: 200, easing: "cubic-bezier(0.5, 0, 0.3, 1)" });
      void play(discRef.current, [{ opacity: 0, transform: `${CENTRE} scale(0.5)` }, { opacity: 1, transform: `${CENTRE} scale(1)` }], { duration: 900, delay: T.dissolveMs - 700, easing: "ease-out" });
      await wait(T.dissolveMs + 300);
      if ((phaseRef.current as Phase) !== "dissolve") return; // skipped meanwhile

      // ---- The light settles onto the invitation
      await finish(false);
    })();
  }, [finish]);

  // Prepare: the gate (and the darshan images) load, the gate fades in, then
  // the hint shows and the 5-second countdown begins.
  const prepare = useCallback(() => {
    if (prepared.current) return;
    prepared.current = true;
    const ready = Promise.race([
      Promise.all([loadImage(IMG.src), loadImage(DARSHAN.src), loadImage(DARSHAN.mask)]),
      new Promise((r) => window.setTimeout(r, READY_TIMEOUT)),
    ]);
    void ready.then(async () => {
      if (phaseRef.current !== "loading") return;
      try {
        await Promise.all([
          play(sceneRef.current, [{ opacity: 0 }, { opacity: 1 }], { duration: 1000, easing: "ease-out" }),
          play(soundRef.current, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 600 }),
          play(skipRef.current, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 600 }),
        ]);
      } catch {
        return; // unmounted
      }
      if (phaseRef.current !== "loading") return;
      go("waiting");
      setHint(true);
      later(AUTO_OPEN, start); // the visitor is never made to tap
    });
  }, [start]);

  useEffect(() => {
    prepare();
  }, [prepare]);

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
    if (phaseRef.current === "ending") return;
    running.current.forEach((a) => a.pause());
    void finish(true);
  }, [finish]);

  // Escape skips at any point.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skip();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  const onLockKey = (e: ReactKeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      start();
    }
  };

  const leaf = (side: "left" | "right"): CSSProperties => ({
    left: side === "left" ? 0 : pct(LEFT_W, DOOR.w),
    width: pct(side === "left" ? LEFT_W : RIGHT_W, DOOR.w),
    transformOrigin: side,
    willChange: "transform, opacity",
  });
  const leafArt = (side: "left" | "right"): CSSProperties => {
    const w = side === "left" ? LEFT_W : RIGHT_W;
    const x = side === "left" ? DOOR.x : SEAM;
    return { left: pct(-x, w), top: pct(-DOOR.y, DOOR.h), width: pct(IMG.w, w), height: pct(IMG.h, DOOR.h), maxWidth: "none" };
  };
  const darshanOn = phase === "darshan" || phase === "dissolve";

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ touchAction: "none" }}
    >
      {/* The solid dark background (the sanctum) */}
      <div ref={bgRef} aria-hidden className="absolute inset-0" style={{ backgroundColor: DARK }} />

      {/* ---------------- The temple gate (removed once it has faded out) ---------------- */}
      {!gateGone && (
        <div
          ref={sceneRef}
          className="absolute left-1/2 top-1/2"
          style={{
            width: `max(100%, calc(100dvh * ${IMG.w / IMG.h}))`,
            aspectRatio: `${IMG.w} / ${IMG.h}`,
            transform: `translate(-${FOCUS.x * 100}%, -50%)`,
            opacity: 0,
          }}
        >
          <div ref={zoomRef} className="absolute inset-0 will-change-transform" style={{ transformOrigin: `${FOCUS.x * 100}% ${FOCUS.y * 100}%` }}>
            <img ref={imgRef} src={IMG.src} alt="" aria-hidden decoding="async" className="absolute inset-0 h-full w-full" />

            <div
              aria-hidden
              className="absolute"
              style={{ left: pct(DOOR.x, IMG.w), top: pct(DOOR.y, IMG.h), width: pct(DOOR.w, IMG.w), height: pct(DOOR.h, IMG.h), perspective: "1600px" }}
            >
              {/* The sanctum's golden light, behind the doors */}
              <div
                ref={interiorRef}
                className="absolute inset-0"
                style={{ opacity: 0.55, background: "radial-gradient(ellipse 55% 60% at 50% 45%, #FFF4D6 0%, #F6D489 30%, #C98A34 62%, #3A1C0A 100%)" }}
              />
              <div ref={leftRef} className="absolute inset-y-0 overflow-hidden" style={leaf("left")}>
                <img src={IMG.src} alt="" className="absolute" style={leafArt("left")} />
                <div ref={leftShadeRef} className="absolute inset-0 bg-[#140904]" style={{ opacity: 0 }} />
              </div>
              <div ref={rightRef} className="absolute inset-y-0 overflow-hidden" style={leaf("right")}>
                <img src={IMG.src} alt="" className="absolute" style={leafArt("right")} />
                <div ref={rightShadeRef} className="absolute inset-0 bg-[#140904]" style={{ opacity: 0 }} />
              </div>
              {/* The first thread of light between the doors */}
              <div
                ref={seamRef}
                className="absolute inset-y-[1%] w-[3px] -translate-x-1/2 rounded-full"
                style={{
                  left: pct(LEFT_W, DOOR.w),
                  opacity: 0,
                  background: "linear-gradient(180deg, transparent, #FFE7A6 12%, #FFF8E4 50%, #FFE7A6 88%, transparent)",
                  boxShadow: "0 0 14px 4px rgb(255 210 120 / 0.7)",
                }}
              />
            </div>

            {/* Warm light over the carvings, and a soft vignette */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 55% at 50% 52%, rgb(255 214 140 / 0.16), transparent 70%), radial-gradient(ellipse 120% 90% at 50% 50%, transparent 60%, rgb(20 10 4 / 0.45) 100%)",
              }}
            />

            {/* Golden glow and volumetric rays pouring through the doorway */}
            <div
              ref={doorGlowRef}
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ opacity: 0, background: `radial-gradient(ellipse 60% 45% at ${FOCUS.x * 100}% ${FOCUS.y * 100}%, rgb(255 236 180 / 0.95), rgb(242 190 90 / 0.5) 45%, transparent 75%)` }}
            />
            <div
              ref={doorRaysRef}
              aria-hidden
              className="pointer-events-none absolute"
              style={{ left: `${FOCUS.x * 100}%`, top: `${FOCUS.y * 100}%`, width: "220%", aspectRatio: "1", transform: "translate(-50%, -50%)", opacity: 0, mixBlendMode: "screen" }}
            >
              <div
                className="rays-spin absolute inset-0 rounded-full"
                style={{
                  background: "repeating-conic-gradient(from 0deg, rgb(255 226 150 / 0.5) 0deg 3deg, transparent 3deg 14deg)",
                  maskImage: "radial-gradient(circle, #000 0%, rgb(0 0 0 / 0.6) 25%, transparent 60%)",
                  WebkitMaskImage: "radial-gradient(circle, #000 0%, rgb(0 0 0 / 0.6) 25%, transparent 60%)",
                }}
              />
            </div>
            {phase === "gate" && <Motes count={22} seed={5} region={{ x: 20, y: 35, w: 60, h: 55 }} />}

            {/* The tap hint, at the brass lock */}
            <div className="absolute" style={{ left: pct(LOCK.x, IMG.w), top: pct(LOCK.y, IMG.h) }}>
              <div aria-hidden style={{ opacity: hint ? 1 : 0, transition: "opacity 300ms ease-out" }}>
                {[0, 0.6].map((d) => (
                  <span
                    key={d}
                    className="tap-ripple absolute -left-9 -top-9 rounded-full"
                    style={{ "--delay": `${d * 2.6 * 0.38}s`, width: 72, height: 72, border: "2px solid rgb(255 220 140 / 0.9)", boxShadow: "0 0 16px 2px rgb(255 205 110 / 0.6)" } as CSSProperties}
                  />
                ))}
                {/* The hand, placed and tilted from its fingertip, pressing the lock */}
                <div className="fingertip-press absolute left-0 top-0">
                  <div
                    className="absolute drop-shadow-[0_3px_6px_rgb(0_0_0/0.5)]"
                    style={{
                      left: -FINGERTIP.x * FINGER_H * FINGERTIP.aspect,
                      top: -FINGERTIP.y * FINGER_H,
                      transform: "rotate(-24deg)",
                      transformOrigin: `${FINGERTIP.x * 100}% ${FINGERTIP.y * 100}%`,
                    }}
                  >
                    <Fingertip height={FINGER_H} />
                  </div>
                </div>
              </div>
            </div>
            <div
              aria-hidden
              className="absolute -translate-x-1/2"
              style={{ left: pct(LOCK.x, IMG.w), top: pct(LOCK.y + 150, IMG.h), visibility: hint ? "visible" : "hidden" }}
            >
              <p
                className="tap-text whitespace-nowrap pl-[0.32em] font-serif text-[19px] font-bold tracking-[0.32em]"
                style={{ color: "#FFE3A0", textShadow: "0 0 10px rgb(255 196 90 / 0.85), 0 0 2px rgb(60 30 5 / 0.9), 0 2px 4px rgb(0 0 0 / 0.6)" }}
              >
                TAP TO OPEN
              </p>
            </div>
            {/* The lock is the tap target (large enough for a thumb) */}
            <button
              type="button"
              onClick={start}
              onKeyDown={onLockKey}
              aria-label="Tap to open the temple doors"
              disabled={phase !== "waiting"}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#E9C46A]/80"
              style={{ left: pct(LOCK.x, IMG.w), top: pct(LOCK.y + 40, IMG.h), width: "40%", height: pct(320, IMG.h), WebkitTapHighlightColor: "transparent" }}
            />
          </div>
        </div>

      )}

      {/* ---------------- The darshan ---------------- */}
      <div ref={darshanRef} aria-hidden={phase === "loading" || phase === "waiting"} className="pointer-events-none absolute inset-0" style={{ opacity: 0 }}>
        <div
          ref={glowRef}
          className="absolute inset-0"
          style={{ opacity: 0, background: "radial-gradient(ellipse 70% 50% at 50% 47%, rgb(255 222 150 / 0.55), rgb(201 140 60 / 0.25) 45%, transparent 75%)" }}
        />
        {/* Halo and soft rays behind the Lord */}
        <div ref={haloRef} className="absolute left-1/2 top-[44%] aspect-square w-[min(150vw,720px)] -translate-x-1/2 -translate-y-1/2" style={{ opacity: 0 }}>
          <div
            className="rays-spin absolute inset-0 rounded-full"
            style={{
              background: "repeating-conic-gradient(from 0deg, rgb(255 214 130 / 0.35) 0deg 2.5deg, transparent 2.5deg 12deg)",
              maskImage: "radial-gradient(circle, #000 18%, rgb(0 0 0 / 0.5) 35%, transparent 62%)",
              WebkitMaskImage: "radial-gradient(circle, #000 18%, rgb(0 0 0 / 0.5) 35%, transparent 62%)",
            }}
          />
          <div className="absolute inset-[22%] rounded-full" style={{ background: "radial-gradient(circle, rgb(255 238 190 / 0.95) 0%, rgb(255 205 110 / 0.55) 40%, transparent 70%)" }} />
        </div>
        <div ref={backPetalsRef} className="absolute inset-0">
          {darshanOn && <Petals baseDelay={0.8} />}
        </div>
        <img
          ref={deityRef}
          src={DARSHAN.src}
          alt={DARSHAN.alt}
          decoding="async"
          className="absolute left-1/2 top-[48%] max-w-none -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `min(92%, calc(78dvh * ${DARSHAN.w / DARSHAN.h}))`,
            aspectRatio: `${DARSHAN.w} / ${DARSHAN.h}`,
            opacity: 0,
            maskImage: `url(${DARSHAN.mask})`,
            WebkitMaskImage: `url(${DARSHAN.mask})`,
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
            filter: "drop-shadow(0 0 22px rgb(255 200 110 / 0.45))",
          }}
        />
        <div ref={frontPetalsRef} className="absolute inset-0">
          {darshanOn && <Petals front baseDelay={1.4} />}
        </div>
        {phase === "dissolve" && deityRect && <MoteBurst rect={deityRect} baseDelay={0.1} />}
        {darshanOn && <Motes count={14} seed={9} region={{ x: 8, y: 10, w: 84, h: 80 }} />}
      </div>

      {/* ---------------- Into the light ---------------- */}
      <Swirl ref={swirlRef} />
      <div
        ref={discRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[44%] aspect-square w-[min(48vw,220px)] rounded-full"
        style={{
          opacity: 0,
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, #FFFFFF 0%, #FFF0C8 35%, rgb(240 196 110 / 0.85) 62%, rgb(240 196 110 / 0) 72%)",
        }}
      />

      {/* Sound, opposite Skip */}
      <button
        ref={soundRef}
        type="button"
        onClick={toggleSound}
        aria-label={soundOn ? "Stop the sankha" : "Play the sankha"}
        aria-pressed={soundOn}
        className="absolute left-4 top-[calc(max(1rem,env(safe-area-inset-top))_+_var(--status-bar,0px))] inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#D9B877]/50 bg-black/25 text-[#F3E3C0]"
        style={{ opacity: 0, pointerEvents: phase === "ending" ? "none" : "auto" }}
        tabIndex={phase === "ending" ? -1 : 0}
      >
        <SoundIcon on={soundOn} />
      </button>

      <button
        ref={skipRef}
        type="button"
        onClick={skip}
        className="absolute right-4 top-[calc(max(1rem,env(safe-area-inset-top))_+_var(--status-bar,0px))] inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#D9B877]/50 bg-black/25 px-4 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#F3E3C0]"
        style={{ opacity: 0, pointerEvents: phase === "ending" ? "none" : "auto" }}
        tabIndex={phase === "ending" ? -1 : 0}
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
