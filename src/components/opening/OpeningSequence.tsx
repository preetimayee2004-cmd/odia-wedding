import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { DOOR, DOOR_Y, TEMPLE_VIEWBOX, TempleArt } from "@/components/art/TempleArt";
import { DeityArt } from "@/components/art/DeityArt";
import { wedding } from "@/config/wedding";
import { EASE } from "@/lib/motion";

/**
 * PLACEHOLDER timing (ms) — tune against the reference video.
 * Full run ≈ 10s; Skip is available from 0.7s.
 */
export const TIMING = {
  start: 300, // cream stillness
  rise: 1800, // temple rises from below
  settle: 300, // breath before the camera moves
  zoom: 2400, // whole temple zooms in until the doorway fills the frame
  crossfade: 0.22, // last part of the zoom where the crisp close-up door takes over
  doorPause: 350, // a beat on the closed door
  doorOpen: 1500, // the two leaves swing inward
  focus: 1100, // Lord Jagannath holds as the focal point
  handoff: 1300, // the medallion glides into the invitation header
  skipFade: 450,
};

// Close-up door matches the temple doorway's proportions exactly.
const DOOR_H = DOOR.bottom - DOOR.top;
const DOOR_RATIO = DOOR.width / DOOR_H;
const ARCH = `50% 50% 0 0 / ${((12 / DOOR_H) * 100).toFixed(1)}% ${((12 / DOOR_H) * 100).toFixed(1)}% 0 0`;
const SCENE_POSITION = { x: 0.5, y: 0.4 };

export type RevealMode = "handoff" | "skip";

interface OpeningSequenceProps {
  /** Element in the invitation header that the deity lands on. */
  targetRef: RefObject<HTMLElement>;
  /** Invitation content may start fading in. */
  onReveal: (mode: RevealMode) => void;
  /** Overlay can be removed. */
  onDone: () => void;
}

/**
 * Section 01 — Temple opening (PRD §4.01).
 * Temple rises → the whole temple zooms in → the doors open on Lord Jagannath
 * → the deity becomes a small medallion at the top of the invitation.
 * Web Animations API only; transform/opacity; no text in the scene.
 */
export function OpeningSequence({ targetRef, onReveal, onDone }: OpeningSequenceProps) {
  const art = wedding.assets.deityArtwork;

  const rootRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const templeRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const sanctumRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const leftLeafRef = useRef<HTMLDivElement>(null);
  const rightLeafRef = useRef<HTMLDivElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const flyerRingRef = useRef<HTMLSpanElement>(null);

  const running = useRef<Animation[]>([]);
  const ended = useRef(false);
  const [leaving, setLeaving] = useState(false);

  const callbacks = useRef({ onReveal, onDone });
  callbacks.current = { onReveal, onDone };

  useEffect(() => {
    const el = {
      root: rootRef.current!,
      backdrop: backdropRef.current!,
      aura: auraRef.current!,
      camera: cameraRef.current!,
      temple: templeRef.current!,
      glow: glowRef.current!,
      sanctum: sanctumRef.current!,
      scene: sceneRef.current!,
      flash: flashRef.current!,
      left: leftLeafRef.current!,
      right: rightLeafRef.current!,
      flyer: flyerRef.current!,
      flyerRing: flyerRingRef.current!,
    };
    const T = TIMING;

    running.current = [];
    const play = (target: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      const anim = target.animate(keyframes, { fill: "both", ...options });
      running.current.push(anim);
      return anim.finished;
    };
    const wait = (ms: number) => play(el.root, [], { duration: ms });

    (async () => {
      // 1 — The temple rises from the bottom of the screen.
      await Promise.all([
        play(
          el.camera,
          [
            { transform: "translateY(60vh)", opacity: 0 },
            { opacity: 1, offset: 0.45 },
            { transform: "translateY(0)", opacity: 1 },
          ],
          { duration: T.rise, delay: T.start, easing: EASE.temple },
        ),
        play(el.aura, [{ opacity: 0 }, { opacity: 1 }], { duration: T.rise, delay: T.start, easing: "ease-out" }),
      ]);

      // 2 — The whole temple zooms in until its doorway exactly matches the
      //     close-up door, which then takes over (crisp at any screen size).
      const doorFraction = DOOR_Y / TEMPLE_VIEWBOX.h;
      const box = el.camera.getBoundingClientRect();
      const doorPx = box.width * (DOOR.width / TEMPLE_VIEWBOX.w);
      const scale = el.sanctum.getBoundingClientRect().width / doorPx;
      const lift = window.innerHeight / 2 - (box.top + box.height * doorFraction);
      el.camera.style.transformOrigin = `50% ${doorFraction * 100}%`;
      const z = T.settle;
      const handover = z + T.zoom * (1 - T.crossfade);

      await Promise.all([
        play(
          el.camera,
          [{ transform: "translateY(0) scale(1)" }, { transform: `translateY(${lift}px) scale(${scale})` }],
          { duration: T.zoom, delay: z, easing: EASE.dolly },
        ),
        play(el.sanctum, [{ opacity: 0 }, { opacity: 1 }], {
          duration: T.zoom * T.crossfade,
          delay: handover,
          easing: "ease-out",
        }),
        play(el.temple, [{ opacity: 1 }, { opacity: 0 }], {
          duration: T.zoom * 0.25,
          delay: z + T.zoom * 0.9,
          easing: "ease-in",
        }),
        play(
          el.glow,
          [
            { opacity: 0, transform: "scale(0.4)" },
            { opacity: 0.7, transform: "scale(1)" },
          ],
          { duration: T.zoom * 0.5, delay: z + T.zoom * 0.6, easing: EASE.silk },
        ),
      ]);

      // 3 — The doors swing inward; warm light spills out onto Lord Jagannath.
      await wait(T.doorPause);
      void play(el.scene, [{ transform: "scale(1.14)" }, { transform: "scale(1)" }], {
        duration: T.doorOpen + T.focus,
        easing: EASE.silk,
      });
      await Promise.all([
        play(el.left, [{ transform: "rotateY(0deg)" }, { transform: "rotateY(100deg)" }], {
          duration: T.doorOpen,
          easing: EASE.temple,
        }),
        play(el.right, [{ transform: "rotateY(0deg)" }, { transform: "rotateY(-100deg)" }], {
          duration: T.doorOpen,
          easing: EASE.temple,
        }),
        play(el.flash, [{ opacity: 0 }, { opacity: 0.85, offset: 0.3 }, { opacity: 0 }], {
          duration: T.doorOpen * 1.1,
          easing: "ease-out",
        }),
        play(el.glow, [{ opacity: 0.7 }, { opacity: 1 }], { duration: T.doorOpen, easing: EASE.silk }),
      ]);

      // 4 — Hold on the deity.
      await wait(T.focus);

      // 5 — The crown-and-face medallion glides into the invitation header.
      const slot = targetRef.current?.getBoundingClientRect();
      const from = focusRect(el.scene, emblemRef.current);
      if (slot && from) {
        const start = `translate(${from.left}px, ${from.top}px) scale(${from.size / slot.width})`;
        const end = `translate(${slot.left}px, ${slot.top}px) scale(1)`;
        el.flyer.style.width = `${slot.width}px`;
        el.flyer.style.height = `${slot.height}px`;
        el.flyer.style.transform = start;
        el.flyer.style.opacity = "1";

        const textDelay = T.handoff * 0.35;
        const flight = Promise.all([
          play(el.flyer, [{ transform: start }, { transform: end }], { duration: T.handoff, easing: EASE.temple }),
          play(el.flyerRing, [{ opacity: 0 }, { opacity: 1 }], {
            duration: T.handoff * 0.5,
            delay: T.handoff * 0.35,
            easing: "ease-out",
          }),
          play(el.sanctum, [{ opacity: 1 }, { opacity: 0 }], { duration: T.handoff * 0.45, easing: "ease-out" }),
          play(el.glow, [{ opacity: 1 }, { opacity: 0 }], { duration: T.handoff * 0.6, easing: "ease-out" }),
          play(el.aura, [{ opacity: 1 }, { opacity: 0 }], { duration: T.handoff, easing: "ease-out" }),
          play(el.backdrop, [{ opacity: 1 }, { opacity: 0 }], {
            duration: T.handoff - textDelay,
            delay: textDelay,
            easing: EASE.silk,
          }),
        ]);
        await wait(textDelay);
        callbacks.current.onReveal("handoff");
        await flight;
      } else {
        callbacks.current.onReveal("skip");
      }

      ended.current = true;
      callbacks.current.onDone();
    })().catch(() => {
      /* animations cancelled — unmounted or skipped */
    });

    return () => running.current.forEach((a) => a.cancel());
  }, [targetRef]);

  const skip = useCallback(() => {
    if (ended.current) return;
    ended.current = true;
    running.current.forEach((a) => a.pause()); // freeze the frame, then dissolve it
    callbacks.current.onReveal("skip");
    setLeaving(true);
    window.setTimeout(() => callbacks.current.onDone(), TIMING.skipFade);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skip();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  const leaf = (side: "left" | "right"): CSSProperties => ({
    transformOrigin: side,
    backfaceVisibility: "hidden",
    background: "linear-gradient(180deg, rgb(var(--sindoor)) 0%, rgb(var(--sindoor-dark)) 100%)",
  });

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 overflow-hidden transition-opacity ease-silk"
      style={{ opacity: leaving ? 0 : 1, transitionDuration: `${TIMING.skipFade}ms` }}
    >
      <div aria-hidden className="absolute inset-0">
        <div ref={backdropRef} className="absolute inset-0 bg-cream" />
        {/* Warm morning light behind the temple */}
        <div
          ref={auraRef}
          className="absolute inset-0"
          style={{
            opacity: 0,
            background:
              "radial-gradient(ellipse 85% 55% at 50% 72%, rgb(var(--gold) / 0.22) 0%, rgb(var(--gold) / 0.06) 45%, transparent 70%)",
          }}
        />

        <div
          ref={cameraRef}
          className="absolute inset-x-0 bottom-[8dvh] mx-auto w-[min(80vw,340px)] will-change-transform"
          style={{ opacity: 0 }}
        >
          <div ref={templeRef}>
            <TempleArt className="block h-auto w-full" />
          </div>
        </div>

        {/* Sanctum light around the doorway */}
        <div
          ref={glowRef}
          className="absolute left-1/2 top-1/2 h-[620px] w-[620px] rounded-full"
          style={{
            opacity: 0,
            margin: "-310px 0 0 -310px",
            background:
              "radial-gradient(circle, rgb(243 217 164 / 0.55) 0%, rgb(var(--gold) / 0.16) 38%, transparent 66%)",
          }}
        />

        {/* Close-up of the temple door — takes over from the zoom */}
        <div
          ref={sanctumRef}
          className="absolute left-1/2 top-1/2"
          style={{
            opacity: 0,
            width: "min(72vw, 290px)",
            aspectRatio: String(DOOR_RATIO),
            transform: "translate(-50%, -50%)",
          }}
        >
          <span className="absolute -inset-[10px] border-[1.5px] border-gold" style={{ borderRadius: ARCH }} />
          <div
            className="relative h-full w-full overflow-hidden border border-gold/70 bg-ink"
            style={{ borderRadius: ARCH, perspective: "1100px" }}
          >
            <div ref={sceneRef} className="absolute inset-0">
              {art ? (
                <img
                  src={art.src}
                  alt=""
                  decoding="async"
                  draggable={false}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: `${SCENE_POSITION.x * 100}% ${SCENE_POSITION.y * 100}%` }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-cream-light">
                  <div ref={emblemRef} className="aspect-square w-3/5">
                    <DeityArt ring={false} />
                  </div>
                </div>
              )}
            </div>

            <div
              ref={flashRef}
              className="absolute inset-0"
              style={{
                opacity: 0,
                background: "radial-gradient(ellipse 70% 60% at 50% 45%, #FFF3D6 0%, rgb(var(--gold) / 0.55) 45%, transparent 80%)",
              }}
            />

            {/* Door leaves: sindoor lacquer, brass studs, ring handles */}
            <div ref={leftLeafRef} className="absolute inset-y-0 left-0 w-1/2 border-r border-gold/80" style={leaf("left")}>
              <DoorPanel handle="right" />
            </div>
            <div ref={rightLeafRef} className="absolute inset-y-0 right-0 w-1/2 border-l border-gold/80" style={leaf("right")}>
              <DoorPanel handle="left" />
            </div>
          </div>
        </div>

        {/* The medallion that flies to the invitation (sized at runtime) */}
        <div ref={flyerRef} className="absolute left-0 top-0 origin-top-left will-change-transform" style={{ opacity: 0 }}>
          <span ref={flyerRingRef} className="absolute -inset-[5px] rounded-full border border-gold" style={{ opacity: 0 }} />
          <DeityArt ring={false} />
        </div>
      </div>

      <button
        type="button"
        onClick={skip}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex min-h-11 animate-fade-in-late items-center gap-1.5 rounded-full border border-gold/50 bg-cream-light/70 px-4 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-ink-soft"
      >
        Skip
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M3 2.5 6.5 6 3 9.5M7 2.5 10.5 6 7 9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function DoorPanel({ handle }: { handle: "left" | "right" }) {
  return (
    <>
      <div
        className="absolute inset-x-[16%] bottom-[6%] top-[24%] rounded-[2px] border border-gold/70"
        style={{
          backgroundImage: "radial-gradient(circle, rgb(var(--gold)) 0 1.7px, transparent 2.2px)",
          backgroundSize: "18px 18px",
          backgroundPosition: "center",
        }}
      />
      <span
        className={`absolute top-[56%] h-4 w-4 rounded-full border-[1.5px] border-gold ${handle === "right" ? "right-2" : "left-2"}`}
      />
    </>
  );
}

/** Where the deity's crown-and-face square currently sits on screen. */
function focusRect(scene: HTMLElement, emblem: HTMLElement | null): { left: number; top: number; size: number } | null {
  const art = wedding.assets.deityArtwork;
  if (!art) {
    const r = emblem?.getBoundingClientRect();
    return r ? { left: r.left, top: r.top, size: r.width } : null;
  }
  const r = scene.getBoundingClientRect();
  const s = Math.max(r.width / art.width, r.height / art.height); // object-fit: cover
  const offX = (r.width - art.width * s) * SCENE_POSITION.x;
  const offY = (r.height - art.height * s) * SCENE_POSITION.y;
  return {
    left: r.left + offX + art.focus.x * s,
    top: r.top + offY + art.focus.y * s,
    size: art.focus.size * s,
  };
}
