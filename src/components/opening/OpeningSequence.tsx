import { SoundButton } from "@/components/ui/SoundButton";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from "react";
import { setStatusTone } from "@/lib/viewMode";
import { FINGERTIP, Fingertip, Petals } from "@/components/opening/OpeningEffects";
import { GoldDust, sampleMask, type GoldDustHandle } from "@/components/opening/GoldDust";
import { beginOpeningMusic } from "@/lib/sound";

/** The carved temple gate artwork, and where its two leaves sit in it (in the artwork's original 992-wide pixels; the file itself is 800 wide, same proportions). */
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
/** The invitation card the opening hands over to (loaded in the background). */
const INVITATION_ART = ["/art/invitation/card.jpg", "/art/invitation/toran.webp", "/art/invitation/trinity.webp", "/art/invitation-card-middle.png"];

const DARK = "#0A0503"; // deep black of the inner sanctum
const AUTO_OPEN = 3500; // opens by itself if not tapped
const READY_TIMEOUT = 3000; // never wait longer than this for the door
const DARSHAN_WAIT = 4000; // at most this long for the Lord's artwork to load and decode; otherwise on to the invitation
const SKIP_MS = 450;
const SMOOTH = "cubic-bezier(0.45, 0, 0.25, 1)";
const CENTRE = "translate(-50%, -50%)"; // kept in the keyframes of centred elements
const FINGER_H = 72; // px
const SILHOUETTE = 0.18; // the faint golden form seen before the Lord himself

/**
 * The opening, as scenes in strict sequence — each starts only when the one
 * before has finished (about 6.5 s from the tap):
 *  gate     the doors part onto a dark doorway; light glows deep inside and
 *           hundreds of golden motes pour out with delicate rays; the gate
 *           then fades out and is removed from the page
 *  emerge   on deep black: motes and a soft halo, a faint golden silhouette,
 *           then Mahaprabhu slowly becomes clear (97% → 100%) as motes flow
 *           around him
 *  darshan  held ~2 s, petals falling (white, red, yellow)
 *  dissolve the halo brightens; he dissolves into golden motes in his own
 *           shape, which gather into a turning circle as petals still float
 *  ending   the circle glides onto the invitation's rangoli as the dark gives
 *           way to the card — dark and golden throughout, never a flash
 */
const T = {
  doorsDelay: 200,
  doorsMs: 1400,
  gateFadeMs: 500,
  silhouetteMs: 800,
  revealDelay: 200,
  revealMs: 1200,
  holdMs: 700,
  dissolveMs: 900,
  gatherMs: 600,
  settleMs: 700,
  fadeMs: 600,
};
/** A repeat visit: the same darshan, a little quicker. */
const QUICK = { ...T, revealMs: 900, holdMs: 400, dissolveMs: 700, gatherMs: 500 };

/** An image loaded and decoded (false if it fails). */
const decoded = (src: string) => {
  const img = new Image();
  img.src = src;
  return img.decode().then(
    () => true,
    () => false,
  );
};

interface OpeningSequenceProps {
  /** The invitation may start appearing (the light is settling onto it). */
  onReveal: () => void;
  /** The overlay can be removed. */
  onDone: () => void;
  /** A repeat visit: the darshan a little quicker. */
  quick?: boolean;
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
 * three and a half seconds, nothing at all — opens it onto the dark sanctum,
 * where divine light and golden motes reveal Mahaprabhu Jagannath; after the
 * darshan he dissolves into golden light that settles onto the invitation.
 * On a repeat visit (`quick`) the darshan is a little quicker. The darshan
 * waits (the doorway's light gently pulsing) until the Lord's artwork has
 * loaded and decoded; if it can't, the light settles straight onto the card.
 * Skip, Esc, or a tap anywhere during the darshan skips to the end. The
 * devotional sound begins with the tap on the gate, and as the opening
 * finishes it fades into the wedding song (lib/sound.ts); the sound button
 * mutes and unmutes it.
 */
export function OpeningSequence({ onReveal, onDone, quick = false }: OpeningSequenceProps) {
  const t = quick ? QUICK : T;
  const rootRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leftShadeRef = useRef<HTMLDivElement>(null);
  const rightShadeRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const doorRaysRef = useRef<HTMLDivElement>(null);
  const darshanRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const haloGlowRef = useRef<HTMLDivElement>(null);
  const silhouetteRef = useRef<HTMLDivElement>(null);
  const deityRef = useRef<HTMLImageElement>(null);
  const dustRef = useRef<GoldDustHandle>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const soundRef = useRef<HTMLButtonElement>(null);

  const running = useRef<Animation[]>([]);
  const timers = useRef<number[]>([]);
  const prepared = useRef(false);
  const darshanReady = useRef<Promise<boolean>>(Promise.resolve(true));
  const [phase, setPhase] = useState<Phase>("loading");
  const phaseRef = useRef<Phase>("loading");
  const [hint, setHint] = useState(false);
  const [gateGone, setGateGone] = useState(false);
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
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  /** A pause in the sequence (cancelled, never resolving, if the opening is skipped). */
  const wait = (ms: number) => new Promise<void>((resolve) => later(ms, resolve));
  /** Is the sequence still in `p` (not skipped meanwhile)? */
  const still = (p: Phase) => phaseRef.current === p;

  useEffect(() => {
    setStatusTone("light");
    return () => {
      running.current.forEach((a) => a.cancel());
      running.current = [];
      clearTimers();
      prepared.current = false; // a remount (StrictMode) prepares again
      setStatusTone("dark");
    };
  }, []);

  /** Centre of an element on screen. */
  const centreOf = (el: Element | null): [number, number] => {
    const r = el?.getBoundingClientRect();
    return r ? [r.left + r.width / 2, r.top + r.height / 2] : [innerWidth / 2, innerHeight / 2];
  };

  /**
   * The hand-off. Normally the circle of golden motes glides onto the
   * invitation's rangoli while the dark and the darshan cross-fade to the card
   * beneath; Skip simply fades out.
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
        const target = document.querySelector("#invitation [aria-label^='Tap the rangoli'] svg")?.getBoundingClientRect();
        if (target && target.width) {
          dustRef.current?.moveSwirl(target.left + target.width / 2, target.top + target.height / 2, target.width * 0.42, T.settleMs);
        }
        await Promise.all([
          play(bgRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: T.fadeMs, easing: "ease-in-out" }),
          play(darshanRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: T.fadeMs * 0.8, easing: "ease-in-out" }),
          new Promise<void>((resolve) => later(T.settleMs, resolve)),
        ]);
        // the light gives way to the rangoli as it builds itself
        await dustRef.current?.fade(400);
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
    beginOpeningMusic(); // inside the visitor's tap (or, if the gate opened by itself, at their next one)
    go("gate");
    setHint(false);
    void play(skipRef.current, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
    const dust = dustRef.current;

    void (async () => {
      // ---- Gate: the doors part onto a dark doorway; light from deep inside
      const D = T.doorsDelay;
      const doorsMs = T.doorsMs;
      void play(seamRef.current, [{ opacity: 0.35, transform: "scaleX(1)" }, { opacity: 1, transform: "scaleX(2)" }, { opacity: 0, transform: "scaleX(3)" }], { duration: D + 900, easing: "ease-in-out" });
      for (const [leaf, angle] of [[leftRef.current, 84], [rightRef.current, -84]] as const) {
        void play(leaf, [{ transform: "rotateY(0deg)" }, { transform: `rotateY(${angle}deg)` }], { duration: doorsMs, delay: D, easing: SMOOTH });
        void play(leaf, [{ opacity: 1 }, { opacity: 1, offset: 0.65 }, { opacity: 0 }], { duration: doorsMs, delay: D, easing: "ease-in" });
      }
      for (const shade of [leftShadeRef.current, rightShadeRef.current]) {
        void play(shade, [{ opacity: 0 }, { opacity: 0.6 }], { duration: doorsMs, delay: D, easing: SMOOTH });
      }
      void play(coreRef.current, [{ opacity: 0.25, transform: `${CENTRE} scale(0.7)` }, { opacity: 1, transform: `${CENTRE} scale(1)` }], { duration: doorsMs, delay: D, easing: "ease-out" });
      void play(doorRaysRef.current, [{ opacity: 0 }, { opacity: 0.55 }], { duration: doorsMs, delay: D + 300, easing: "ease-in-out" });
      void play(zoomRef.current, [{ transform: "scale(1)" }, { transform: "scale(1.05)" }], { duration: D + doorsMs + T.gateFadeMs, easing: SMOOTH });
      const [cx, cy] = centreOf(coreRef.current);
      later(D + 300, () => dust?.emit({ x: cx, y: cy, rate: 150, speed: [18, 95] }));
      await wait(D + doorsMs);
      if (!still("gate")) return;

      // The Lord's artwork has normally loaded and decoded by now. If not, the
      // doorway's light pulses gently while it does (up to 4 s); should it fail,
      // the light settles straight onto the invitation instead of an empty darshan.
      const pulses = [
        coreRef.current?.animate([{ opacity: 1 }, { opacity: 0.72 }, { opacity: 1 }], { duration: 1600, iterations: Infinity, easing: "ease-in-out" }),
        doorRaysRef.current?.animate([{ opacity: 0.55 }, { opacity: 0.3 }, { opacity: 0.55 }], { duration: 1600, iterations: Infinity, easing: "ease-in-out" }),
      ].filter((a): a is Animation => !!a);
      running.current.push(...pulses);
      const ready = await Promise.race([darshanReady.current, new Promise<boolean>((resolve) => later(DARSHAN_WAIT, () => resolve(false)))]);
      pulses.forEach((a) => a.cancel());
      if (!still("gate")) return;
      if (!ready) {
        await finish(true);
        return;
      }

      // The whole gate fades out and is removed; the motes carry the light on
      const [hx, hy] = centreOf(deityRef.current);
      dust?.moveEmitter(hx, hy, T.gateFadeMs + 600);
      await play(sceneRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: T.gateFadeMs, easing: "ease-in-out" });
      if (!still("gate")) return;
      setGateGone(true);

      // ---- Emerge, on deep black: halo, a faint silhouette, then Mahaprabhu
      go("darshan");
      if (darshanRef.current) darshanRef.current.style.opacity = "1";
      void play(haloRef.current, [{ opacity: 0, transform: `${CENTRE} scale(0.85)` }, { opacity: 1, transform: `${CENTRE} scale(1)` }], { duration: 1000, easing: "ease-out" });
      void play(silhouetteRef.current, [{ opacity: 0 }, { opacity: SILHOUETTE }], { duration: T.silhouetteMs, easing: "ease-in-out" });
      const around = deityRef.current?.getBoundingClientRect();
      if (around) {
        // motes flow around him, keeping clear of his face
        dust?.emit({ x: hx, y: hy, rate: 70, ring: { rx: around.width * 0.46, ry: around.height * 0.44 }, speed: [8, 36] });
      }
      await wait(T.revealDelay);
      if (!still("darshan")) return;
      void play(silhouetteRef.current, [{ opacity: SILHOUETTE }, { opacity: 0 }], { duration: t.revealMs * 0.8, delay: t.revealMs * 0.2, easing: "ease-in-out" });
      await play(deityRef.current, [{ opacity: 0.04, transform: `${CENTRE} scale(0.97)` }, { opacity: 1, transform: `${CENTRE} scale(1)` }], { duration: t.revealMs, easing: "ease-in-out" });

      // ---- Darshan, held; petals fall
      await wait(t.holdMs);
      if (!still("darshan")) return;

      // ---- Dissolve into golden motes in his own shape; they gather into a circle
      go("dissolve");
      const box = deityRef.current?.getBoundingClientRect();
      void play(haloGlowRef.current, [{ opacity: 0.7, transform: "scale(1)" }, { opacity: 1, transform: "scale(1.18)" }], { duration: 800, easing: "ease-in-out" });
      dust?.emit({ x: hx, y: hy, rate: 0 });
      if (box) {
        void sampleMask(DARSHAN.mask, box, 420).then((points) => dust?.burst(points, [hx, hy], t.dissolveMs * 0.9));
      }
      void play(deityRef.current, [{ opacity: 1, transform: `${CENTRE} scale(1)` }, { opacity: 0, transform: `${CENTRE} scale(1.02)` }], { duration: t.dissolveMs, easing: "ease-in" });
      void play(haloRef.current, [{ opacity: 1 }, { opacity: 0.35 }], { duration: t.dissolveMs + t.gatherMs, easing: "ease-in-out" });
      await wait(t.dissolveMs * 0.75);
      if (!still("dissolve")) return;
      dust?.swirl(hx, hy, Math.min(120, innerWidth * 0.3));
      await wait(t.gatherMs);
      if (!still("dissolve")) return;

      // ---- The light settles onto the invitation
      await finish(false);
    })();
  }, [finish, t]);

  // Prepare: the gate shows as soon as the door has loaded (the Lord's artwork
  // and the invitation card load meanwhile, in the background); then the hint
  // shows and the 3.5-second countdown begins.
  const prepare = useCallback(() => {
    if (prepared.current) return;
    prepared.current = true;
    // the Lord's artwork (also preloaded by index.html), loaded and decoded; the invitation card in the background
    darshanReady.current = Promise.all([decoded(DARSHAN.src), decoded(DARSHAN.mask)]).then((ok) => ok.every(Boolean));
    INVITATION_ART.forEach(loadImage);
    const ready = Promise.race([loadImage(IMG.src), new Promise((r) => window.setTimeout(r, READY_TIMEOUT))]);
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

  const skip = useCallback(() => {
    if (phaseRef.current === "ending") return;
    running.current.forEach((a) => a.pause());
    void finish(true);
  }, [finish]);

  // A tap anywhere during the darshan or the dissolve skips to the end (the Skip and sound buttons keep their own jobs).
  const onRootClick = (e: ReactMouseEvent) => {
    if ((phaseRef.current === "darshan" || phaseRef.current === "dissolve") && !(e.target as Element).closest("button")) skip();
  };

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
  const darshanOn = phase === "darshan" || phase === "dissolve" || phase === "ending";
  const deityBox: CSSProperties = {
    width: `min(92%, calc(78dvh * ${DARSHAN.w / DARSHAN.h}))`,
    aspectRatio: `${DARSHAN.w} / ${DARSHAN.h}`,
  };
  const maskStyle: CSSProperties = {
    maskImage: `url(${DARSHAN.mask})`,
    WebkitMaskImage: `url(${DARSHAN.mask})`,
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
  };

  return (
    <div ref={rootRef} onClick={onRootClick} className="fixed inset-0 z-50 overflow-hidden" style={{ touchAction: "none" }}>
      {/* The deep black of the sanctum */}
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
            <img src={IMG.src} alt="" aria-hidden decoding="async" className="absolute inset-0 h-full w-full" />

            <div
              aria-hidden
              className="absolute"
              style={{ left: pct(DOOR.x, IMG.w), top: pct(DOOR.y, IMG.h), width: pct(DOOR.w, IMG.w), height: pct(DOOR.h, IMG.h), perspective: "1600px" }}
            >
              {/* Behind the doors: darkness, with light glowing deep inside */}
              <div className="absolute inset-0" style={{ background: DARK }} />
              <div
                ref={coreRef}
                className="absolute left-1/2 top-[42%] aspect-square w-[70%] rounded-full"
                style={{
                  opacity: 0.25,
                  transform: CENTRE,
                  background: "radial-gradient(circle, rgb(255 238 190 / 0.95) 0%, rgb(246 196 104 / 0.55) 16%, rgb(190 120 40 / 0.18) 38%, transparent 62%)",
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
              {/* Delicate rays from the heart of the sanctum */}
              <div
                ref={doorRaysRef}
                className="pointer-events-none absolute left-1/2 top-[42%] aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2"
                style={{ opacity: 0, mixBlendMode: "screen" }}
              >
                <div
                  className="rays-spin absolute inset-0 rounded-full"
                  style={{
                    background: "repeating-conic-gradient(from 0deg, rgb(255 226 150 / 0.45) 0deg 1.6deg, transparent 1.6deg 11deg)",
                    maskImage: "radial-gradient(circle, #000 0%, rgb(0 0 0 / 0.5) 18%, transparent 46%)",
                    WebkitMaskImage: "radial-gradient(circle, #000 0%, rgb(0 0 0 / 0.5) 18%, transparent 46%)",
                  }}
                />
              </div>
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
                className="tap-text whitespace-nowrap pl-[0.32em] font-serif text-[19px] font-semibold tracking-[0.32em]"
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

      {/* ---------------- The darshan, on deep black ---------------- */}
      <div ref={darshanRef} aria-hidden={!darshanOn} className="pointer-events-none absolute inset-0" style={{ opacity: 0 }}>
        {/* A soft golden halo with delicate rays, behind the Lord only */}
        <div ref={haloRef} className="absolute left-1/2 top-[46%] aspect-square w-[min(140vw,680px)]" style={{ opacity: 0, transform: CENTRE }}>
          <div
            className="rays-spin absolute inset-0 rounded-full"
            style={{
              background: "repeating-conic-gradient(from 0deg, rgb(255 214 130 / 0.3) 0deg 1.4deg, transparent 1.4deg 10deg)",
              maskImage: "radial-gradient(circle, #000 16%, rgb(0 0 0 / 0.45) 32%, transparent 58%)",
              WebkitMaskImage: "radial-gradient(circle, #000 16%, rgb(0 0 0 / 0.45) 32%, transparent 58%)",
            }}
          />
          <div
            ref={haloGlowRef}
            className="absolute inset-[24%] rounded-full"
            style={{ opacity: 0.7, background: "radial-gradient(circle, rgb(255 226 160 / 0.75) 0%, rgb(232 170 80 / 0.32) 42%, transparent 70%)" }}
          />
        </div>
        <div className="absolute inset-0">{darshanOn && <Petals baseDelay={T.revealDelay / 1000 + 1.2} />}</div>
        {/* First a faint golden silhouette, then the Lord himself */}
        <div
          ref={silhouetteRef}
          className="absolute left-1/2 top-[48%]"
          style={{ ...deityBox, ...maskStyle, transform: CENTRE, opacity: 0, background: "radial-gradient(ellipse 60% 55% at 50% 42%, rgb(255 222 150 / 0.9), rgb(200 130 50 / 0.35) 55%, transparent 85%)" }}
        />
        <img
          ref={deityRef}
          src={DARSHAN.src}
          alt={DARSHAN.alt}
          decoding="async"
          className="absolute left-1/2 top-[48%] max-w-none"
          style={{ ...deityBox, ...maskStyle, transform: CENTRE, opacity: 0 }}
        />
        <div className="absolute inset-0">{darshanOn && <Petals front baseDelay={T.revealDelay / 1000 + 2} />}</div>
      </div>

      {/* Golden motes: from the doorway, around the Lord, into the circle of light */}
      <GoldDust ref={dustRef} />

      {/* Sound, opposite Skip */}
      <SoundButton
        ref={soundRef}
        className="absolute left-4 top-[calc(max(1rem,env(safe-area-inset-top))_+_var(--status-bar,0px))]"
        style={{ opacity: 0, pointerEvents: phase === "ending" ? "none" : "auto" }}
        tabIndex={phase === "ending" ? -1 : 0}
      />

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
