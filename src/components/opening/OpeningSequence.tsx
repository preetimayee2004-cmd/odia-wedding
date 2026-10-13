import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { DOOR_Y, TEMPLE_VIEWBOX, TempleArt } from "@/components/art/TempleArt";
import { DeityArt } from "@/components/art/DeityArt";
import { EASE } from "@/lib/motion";

/**
 * PLACEHOLDER timing (ms) — to be tuned against the reference video.
 * Full run ≈ 7.6s; Skip is available from 0.7s.
 */
export const TIMING = {
  start: 350, // cream stillness before anything moves
  rise: 1900, // temple rises from below the fold
  settle: 350, // breath before the camera moves
  zoom: 2300, // push into the sanctum doorway
  zoomScale: 7,
  focus: 700, // deity holds as the focal point
  handoff: 1250, // deity glides into the invitation header
  skipFade: 450,
};

const DEITY_SIZE = 176;

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
 * Cream → temple rises → camera pushes into the doorway → deity becomes the
 * focal point → deity glides into its place at the top of the invitation.
 * Driven by the Web Animations API: no animation library, transform/opacity only.
 */
export function OpeningSequence({ targetRef, onReveal, onDone }: OpeningSequenceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const templeRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const deityRef = useRef<HTMLDivElement>(null);

  const running = useRef<Animation[]>([]);
  const ended = useRef(false);
  const [leaving, setLeaving] = useState(false);

  const callbacks = useRef({ onReveal, onDone });
  callbacks.current = { onReveal, onDone };

  useEffect(() => {
    const root = rootRef.current!;
    const backdrop = backdropRef.current!;
    const aura = auraRef.current!;
    const camera = cameraRef.current!;
    const temple = templeRef.current!;
    const glow = glowRef.current!;
    const deity = deityRef.current!;
    const T = TIMING;

    running.current = [];
    const play = (el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      const anim = el.animate(keyframes, { fill: "both", ...options });
      running.current.push(anim);
      return anim.finished;
    };
    const wait = (ms: number) => play(root, [], { duration: ms });

    (async () => {
      // 1 — The temple rises from the bottom of the screen.
      await Promise.all([
        play(
          camera,
          [
            { transform: "translateY(60vh)", opacity: 0 },
            { opacity: 1, offset: 0.45 },
            { transform: "translateY(0)", opacity: 1 },
          ],
          { duration: T.rise, delay: T.start, easing: EASE.temple },
        ),
        play(aura, [{ opacity: 0 }, { opacity: 1 }], {
          duration: T.rise,
          delay: T.start,
          easing: "ease-out",
        }),
      ]);

      // 2 — Slow push into the doorway, drawing it to the centre of the screen.
      const doorFraction = DOOR_Y / TEMPLE_VIEWBOX.h;
      const box = camera.getBoundingClientRect();
      const lift = window.innerHeight / 2 - (box.top + box.height * doorFraction);
      camera.style.transformOrigin = `50% ${doorFraction * 100}%`;
      const z = T.settle;

      await Promise.all([
        play(
          camera,
          [
            { transform: "translateY(0) scale(1)" },
            { transform: `translateY(${lift}px) scale(${T.zoomScale})` },
          ],
          { duration: T.zoom, delay: z, easing: EASE.dolly },
        ),
        play(temple, [{ opacity: 1 }, { opacity: 0 }], {
          duration: T.zoom * 0.4,
          delay: z + T.zoom * 0.5,
          easing: "ease-in",
        }),
        play(
          glow,
          [
            { opacity: 0, transform: "scale(0.3)" },
            { opacity: 1, transform: "scale(1)" },
          ],
          { duration: T.zoom * 0.6, delay: z + T.zoom * 0.4, easing: EASE.silk },
        ),
        play(
          deity,
          [
            { opacity: 0, transform: "scale(0.82)" },
            { opacity: 1, transform: "scale(1)" },
          ],
          { duration: T.zoom * 0.55, delay: z + T.zoom * 0.55, easing: EASE.silk },
        ),
      ]);

      // 3 — The deity holds, then glides into the invitation header.
      await wait(T.focus);

      const target = targetRef.current;
      const from = deity.getBoundingClientRect();
      const to = target?.getBoundingClientRect();
      const glide = to
        ? `translate(${to.left + to.width / 2 - (from.left + from.width / 2)}px, ${
            to.top + to.height / 2 - (from.top + from.height / 2)
          }px) scale(${to.width / from.width})`
        : "scale(1)";

      // The invitation text waits until the deity has lifted clear of it.
      const textDelay = T.handoff * 0.35;
      const flight = Promise.all([
        play(deity, [{ transform: "translate(0, 0) scale(1)" }, { transform: glide }], {
          duration: T.handoff,
          easing: EASE.temple,
        }),
        play(glow, [{ opacity: 1 }, { opacity: 0 }], { duration: T.handoff * 0.7, easing: "ease-out" }),
        play(aura, [{ opacity: 1 }, { opacity: 0 }], { duration: T.handoff, easing: "ease-out" }),
        play(backdrop, [{ opacity: 1 }, { opacity: 0 }], {
          duration: T.handoff - textDelay,
          delay: textDelay,
          easing: EASE.silk,
        }),
      ]);
      await wait(textDelay);
      callbacks.current.onReveal("handoff");
      await flight;

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

        {/* Sanctum light that blooms as we pass through the doorway */}
        <div
          ref={glowRef}
          className="absolute left-1/2 top-1/2 h-[560px] w-[560px] rounded-full"
          style={{
            opacity: 0,
            margin: "-280px 0 0 -280px",
            background:
              "radial-gradient(circle, rgb(243 217 164 / 0.55) 0%, rgb(var(--gold) / 0.16) 38%, transparent 66%)",
          }}
        />

        <div
          ref={deityRef}
          className="absolute left-1/2 top-1/2 will-change-transform"
          style={{
            opacity: 0,
            width: DEITY_SIZE,
            height: DEITY_SIZE,
            margin: `${-DEITY_SIZE / 2}px 0 0 ${-DEITY_SIZE / 2}px`,
          }}
        >
          <DeityArt />
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
