import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { Crows, DOOR, SceneBack, SceneFront, SceneTemple } from "@/components/art/TempleArt";
import { DeityArt } from "@/components/art/DeityArt";
import { wedding } from "@/config/wedding";
import { EASE } from "@/lib/motion";

/**
 * PLACEHOLDER timing (ms) — tune against the reference video.
 * Full run ≈ 10s; Skip is available from 0.7s.
 */
export const TIMING = {
  start: 300, // sky and shore fade in
  rise: 2400, // temple rises slowly from below
  settle: 300, // breath before the camera moves
  zoom: 2400, // whole temple zooms in until the doorway fills the frame
  crossfade: 0.22, // last part of the zoom where the crisp close-up door takes over
  doorPause: 350, // a beat on the closed door
  doorOpen: 1500, // the two leaves swing inward
  pushIn: 1500, // photo temple: camera moves in through the open doorway
  photoMaxZoom: 6, // photo temple: zoom limit before the photo turns blurry
  focus: 1100, // Lord Jagannath holds as the focal point
  handoff: 1300, // the medallion glides into the invitation header
  skipFade: 450,
};

// The temple: a configured photo, or the illustrated scene.
const PHOTO = wedding.opening.templePhoto;

// Close-up door matches the temple doorway's proportions exactly.
const DOOR_H = DOOR.bottom - DOOR.top;
const DOOR_RATIO = PHOTO ? PHOTO.door.width / PHOTO.door.height : DOOR.width / DOOR_H;
const ARCH = PHOTO
  ? "3px"
  : `50% 50% 0 0 / ${((12 / DOOR_H) * 100).toFixed(1)}% ${((12 / DOOR_H) * 100).toFixed(1)}% 0 0`;
// Narrow doors are limited by height so the close-up fits short screens.
const SANCTUM_WIDTH = `min(72vw, 290px, ${(DOOR_RATIO * 68).toFixed(1)}dvh)`;
const LEAF_BG = PHOTO
  ? "linear-gradient(180deg, #2B1A12 0%, #140B06 100%)" // dark doorway wood, like the photo
  : "linear-gradient(180deg, rgb(var(--sindoor)) 0%, rgb(var(--sindoor-dark)) 100%)";
// How far below its resting place the temple starts (just out of view).
const RISE_FROM = PHOTO ? "translateY(62%)" : "translateY(82%)";
const SCENE_POSITION = { x: 0.5, y: 0.4 };
const DEITY_CLOSEUP = 1.3;

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
  const cameraRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const crowsRef = useRef<HTMLDivElement>(null);
  const templeRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const doorRef = useRef<SVGRectElement>(null); // illustrated scene
  const photoDoorRef = useRef<HTMLDivElement>(null); // photo scene
  const glowRef = useRef<HTMLDivElement>(null);
  const sanctumRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const leftLeafRef = useRef<HTMLDivElement>(null);
  const rightLeafRef = useRef<HTMLDivElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const flyerRingRef = useRef<HTMLSpanElement>(null);
  const flyerArtRef = useRef<HTMLDivElement>(null);

  const running = useRef<Animation[]>([]);
  const ended = useRef(false);
  const [leaving, setLeaving] = useState(false);

  const callbacks = useRef({ onReveal, onDone });
  callbacks.current = { onReveal, onDone };

  useEffect(() => {
    const el = {
      root: rootRef.current!,
      backdrop: backdropRef.current!,
      camera: cameraRef.current!,
      back: backRef.current!,
      crows: crowsRef.current!,
      temple: templeRef.current!,
      front: frontRef.current!,
      door: (doorRef.current ?? photoDoorRef.current)!,
      glow: glowRef.current!,
      sanctum: sanctumRef.current!,
      scene: sceneRef.current!,
      flash: flashRef.current!,
      left: leftLeafRef.current!,
      right: rightLeafRef.current!,
      flyer: flyerRef.current!,
      flyerRing: flyerRingRef.current!,
      flyerArt: flyerArtRef.current!,
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
      // 1 — Sky and shore appear, crows glide across, and the temple rises
      //     up from behind the sand and sea.
      void play(el.crows, [{ transform: "translateX(-8vw)" }, { transform: "translateX(10vw)" }], {
        duration: T.start + T.rise + T.settle + T.zoom,
        easing: "linear",
      });
      await Promise.all([
        play(el.back, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: T.start, easing: "ease-out" }),
        play(el.front, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: T.start, easing: "ease-out" }),
        play(el.crows, [{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: T.start + 400, easing: "ease-out" }),
        play(el.temple, [{ transform: RISE_FROM }, { transform: "translateY(0)" }], {
          duration: T.rise,
          delay: T.start + 650, // once the shore in front is fully opaque
          easing: EASE.temple,
        }),
      ]);

      if (PHOTO) {
        await photoDoorway();
      } else {
        await illustratedDoorway();
      }

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
        // Start clipped to the doorway width (the circle can be wider than a
        // narrow door), then open out to the full medallion as it lifts away.
        const doorHalf = el.sanctum.offsetWidth / 2;
        const startClip = `circle(${Math.min(50, (doorHalf / from.size) * 100).toFixed(2)}% at 50% 50%)`;
        el.flyerArt.style.clipPath = startClip;

        const textDelay = T.handoff * 0.35;
        const flight = Promise.all([
          play(el.flyer, [{ transform: start }, { transform: end }], { duration: T.handoff, easing: EASE.temple }),
          play(el.flyerArt, [{ clipPath: startClip }, { clipPath: "circle(50% at 50% 50%)" }], {
            duration: T.handoff * 0.5,
            easing: EASE.silk,
          }),
          play(el.flyerRing, [{ opacity: 0 }, { opacity: 1 }], {
            duration: T.handoff * 0.5,
            delay: T.handoff * 0.35,
            easing: "ease-out",
          }),
          play(el.sanctum, [{ opacity: 1 }, { opacity: 0 }], { duration: T.handoff * 0.45, easing: "ease-out" }),
          play(el.glow, [{ opacity: 1 }, { opacity: 0 }], { duration: T.handoff * 0.6, easing: "ease-out" }),
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

    /** Doors swing inward; warm light spills out onto Lord Jagannath. */
    async function openDoors() {
      void play(el.scene, [{ transform: "scale(1.14)" }, { transform: "scale(1)" }], {
        duration: T.doorOpen + T.pushIn + T.focus,
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
      ]);
    }

    /**
     * Photo temple: zoom only until the door is a comfortable size (photos
     * blur if magnified too far), place the doors exactly over the photo's
     * doorway, open them, then move in through the doorway together.
     */
    async function photoDoorway() {
      const cam = el.camera.getBoundingClientRect();
      const door = el.door.getBoundingClientRect();
      const doorX = door.left + door.width / 2;
      const doorY = door.top + door.height / 2;
      const zoom = Math.min(T.photoMaxZoom, (window.innerHeight * 0.3) / door.height);
      const shift = `translate(${window.innerWidth / 2 - doorX}px, ${window.innerHeight / 2 - doorY}px)`;
      el.camera.style.transformOrigin = `${doorX - cam.left}px ${doorY - cam.top}px`;

      await Promise.all([
        play(el.camera, [{ transform: "translate(0, 0) scale(1)" }, { transform: `${shift} scale(${zoom})` }], {
          duration: T.zoom,
          delay: T.settle,
          easing: EASE.dolly,
        }),
        play(el.crows, [{ opacity: 1 }, { opacity: 0 }], { duration: 600, delay: T.settle, easing: "ease-in" }),
      ]);

      // Doors appear exactly over the photo's doorway…
      const startScale = (door.width * zoom) / el.sanctum.offsetWidth;
      const small = `translate(-50%, -50%) scale(${startScale})`;
      const full = "translate(-50%, -50%) scale(1)";
      await play(el.sanctum, [{ opacity: 0, transform: small }, { opacity: 1, transform: small }], {
        duration: 350,
        easing: "ease-out",
      });
      await wait(T.doorPause);
      await openDoors();

      // …then the camera moves in through the doorway to the deity.
      // Camera and doorway grow by the same factor, so they stay locked together.
      const grow = 1 / startScale;
      await Promise.all([
        play(el.camera, [{ transform: `${shift} scale(${zoom})` }, { transform: `${shift} scale(${zoom * grow})` }], {
          duration: T.pushIn,
          easing: EASE.dolly,
        }),
        play(el.sanctum, [{ transform: small }, { transform: full }], { duration: T.pushIn, easing: EASE.dolly }),
        play(el.camera, [{ opacity: 1 }, { opacity: 0 }], {
          duration: T.pushIn * 0.6,
          delay: T.pushIn * 0.4,
          easing: "ease-in",
        }),
        play(
          el.glow,
          [
            { opacity: 0, transform: "scale(0.4)" },
            { opacity: 1, transform: "scale(1)" },
          ],
          { duration: T.pushIn, easing: EASE.silk },
        ),
      ]);
    }

    /** Illustrated temple: zoom until the door exactly matches the close-up. */
    async function illustratedDoorway() {
      const cam = el.camera.getBoundingClientRect();
      const door = el.door.getBoundingClientRect();
      const doorX = door.left + door.width / 2;
      const doorY = door.top + door.height / 2;
      const scale = el.sanctum.getBoundingClientRect().width / door.width;
      el.camera.style.transformOrigin = `${doorX - cam.left}px ${doorY - cam.top}px`;
      const to = `translate(${window.innerWidth / 2 - doorX}px, ${window.innerHeight / 2 - doorY}px) scale(${scale})`;
      const z = T.settle;
      const handover = z + T.zoom * (1 - T.crossfade);

      await Promise.all([
        play(el.camera, [{ transform: "translate(0, 0) scale(1)" }, { transform: to }], {
          duration: T.zoom,
          delay: z,
          easing: EASE.dolly,
        }),
        play(el.crows, [{ opacity: 1 }, { opacity: 0 }], { duration: 600, delay: z, easing: "ease-in" }),
        play(el.sanctum, [{ opacity: 0 }, { opacity: 1 }], {
          duration: T.zoom * T.crossfade,
          delay: handover,
          easing: "ease-out",
        }),
        play(el.camera, [{ opacity: 1 }, { opacity: 0 }], {
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

      await wait(T.doorPause);
      void play(el.glow, [{ opacity: 0.7 }, { opacity: 1 }], { duration: T.doorOpen, easing: EASE.silk });
      await openDoors();
    }

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
    background: LEAF_BG,
  });

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 overflow-hidden transition-opacity ease-silk"
      style={{ opacity: leaving ? 0 : 1, transitionDuration: `${TIMING.skipFade}ms` }}
    >
      <div aria-hidden className="absolute inset-0">
        <div ref={backdropRef} className="absolute inset-0 bg-cream" />
        {/* The scene: sky → crows → temple (rises) → sand & sea, zoomed as one camera */}
        <div ref={cameraRef} className="absolute inset-0 will-change-transform">
          <div ref={backRef} className="absolute inset-0" style={{ opacity: 0 }}>
            {PHOTO ? (
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #E5C6A1 0%, #EFD9BF 40%, #F4E6D4 100%)" }} />
            ) : (
              <SceneBack />
            )}
          </div>
          <div ref={crowsRef} className="absolute inset-x-0 top-0 h-1/2" style={{ opacity: 0 }}>
            <Crows />
          </div>
          <div ref={templeRef} className="absolute inset-0" style={{ transform: RISE_FROM }}>
            {PHOTO ? <PhotoTemple photo={PHOTO} doorRef={photoDoorRef} /> : <SceneTemple doorRef={doorRef} />}
          </div>
          <div ref={frontRef} className="absolute inset-0" style={{ opacity: 0 }}>
            {!PHOTO && <SceneFront />}
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
            width: SANCTUM_WIDTH,
            aspectRatio: String(DOOR_RATIO),
            transform: "translate(-50%, -50%)",
          }}
        >
          {!PHOTO && <span className="absolute -inset-[10px] border-[1.5px] border-gold" style={{ borderRadius: ARCH }} />}
          <div
            className={`relative h-full w-full overflow-hidden bg-ink ${PHOTO ? "" : "border border-gold/70"}`}
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
                  style={{
                    objectPosition: `${SCENE_POSITION.x * 100}% ${SCENE_POSITION.y * 100}%`,
                    // Narrow photo doorway: frame Lord Jagannath a little closer.
                    ...(PHOTO ? { transform: `scale(${DEITY_CLOSEUP})`, transformOrigin: "50% 42%" } : {}),
                  }}
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
          <div ref={flyerArtRef} className="h-full w-full">
            <DeityArt ring={false} />
          </div>
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
  if (PHOTO) {
    // Plain dark wood to match the photographed doorway.
    return (
      <>
        <div className="absolute inset-x-[14%] bottom-[5%] top-[5%] rounded-[1px] border border-[#FFE9C8]/10" />
        <span className={`absolute top-1/2 h-3 w-3 rounded-full border border-gold/50 ${handle === "right" ? "right-1.5" : "left-1.5"}`} />
      </>
    );
  }
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

type TemplePhoto = NonNullable<typeof PHOTO>;

/**
 * Photo version of the temple: spans the screen width at the bottom, its top
 * edge fading into the sky gradient so the whole temple stays visible on a
 * tall phone. An invisible box over the doorway aims the zoom.
 */
function PhotoTemple({ photo, doorRef }: { photo: TemplePhoto; doorRef: RefObject<HTMLDivElement> }) {
  const { door, width, height } = photo;
  const fade = "linear-gradient(to bottom, transparent 0%, #000 20%)";
  return (
    <div className="absolute bottom-0 left-1/2 w-[118%] -translate-x-1/2">
      <img
        src={photo.src}
        alt=""
        draggable={false}
        className="block w-full select-none"
        style={{ maskImage: fade, WebkitMaskImage: fade }}
      />
      <div
        ref={doorRef}
        className="absolute"
        style={{
          left: `${(door.x / width) * 100}%`,
          top: `${(door.y / height) * 100}%`,
          width: `${(door.width / width) * 100}%`,
          height: `${(door.height / height) * 100}%`,
        }}
      />
    </div>
  );
}

/** Where the deity's crown-and-face square currently sits on screen. */
function focusRect(scene: HTMLElement, emblem: HTMLElement | null): { left: number; top: number; size: number } | null {
  const art = wedding.assets.deityArtwork;
  if (!art) {
    const r = emblem?.getBoundingClientRect();
    return r ? { left: r.left, top: r.top, size: r.width } : null;
  }
  // The <img> itself (it may be scaled inside the doorway); uniform scale keeps the maths valid.
  const img = scene.querySelector("img") ?? scene;
  const r = img.getBoundingClientRect();
  const s = Math.max(r.width / art.width, r.height / art.height); // object-fit: cover
  const offX = (r.width - art.width * s) * SCENE_POSITION.x;
  const offY = (r.height - art.height * s) * SCENE_POSITION.y;
  return {
    left: r.left + offX + art.focus.x * s,
    top: r.top + offY + art.focus.y * s,
    size: art.focus.size * s,
  };
}
