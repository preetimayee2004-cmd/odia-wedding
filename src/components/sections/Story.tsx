import { useEffect, useRef, type ComponentType, type RefObject } from "react";
import { wedding, type WeddingConfig } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { EASE } from "@/lib/motion";
import { KokaIcon, PanaGuaIcon, PeacocksIcon } from "@/components/art/StoryIcons";
import { Pending } from "@/components/ui/Pending";

type Milestone = WeddingConfig["story"]["milestones"][number];

const ICONS: Record<Milestone["icon"], ComponentType<{ className?: string }>> = {
  peacocks: PeacocksIcon,
  koka: KokaIcon,
  panagua: PanaGuaIcon,
};

/**
 * Section 05 — The Heritage Timeline.
 * A single centre line styled as a Sambalpuri Ikat warp thread (bandha)
 * grows with the scroll; the couple's chapters alternate either side, each
 * marked by a Pattachitra icon. Chapters appear only once their words are in.
 */
export function Story() {
  const { heading, odiaHeading, milestones } = wedding.story;
  const headerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const threadRef = useRef<HTMLSpanElement>(null);
  const headerIn = useInView(headerRef);
  useThreadProgress(trackRef, threadRef);

  const written = milestones.filter((m) => m.text);
  if (written.length === 0 && !import.meta.env.DEV) return null;
  const items = import.meta.env.DEV ? milestones : written;

  return (
    <section id="story" aria-labelledby="story-heading" className="relative py-[var(--section-y)]">
      <div
        ref={headerRef}
        className="px-[var(--gutter)] text-center"
        style={{ opacity: headerIn ? 1 : 0, transition: `opacity 900ms ${EASE.silk}` }}
      >
        {odiaHeading && (
          <p lang="or" className="odia text-base text-sindoor/85">
            {odiaHeading}
          </p>
        )}
        <h2 id="story-heading" className="mt-1 text-[2.25rem]">
          {heading}
        </h2>
      </div>

      <ol ref={trackRef} className="relative mx-[var(--gutter)] mt-12 flex flex-col gap-12">
        {/* The ikat thread: a faint full-length track, and the dyed thread growing over it */}
        <span aria-hidden className="ikat-thread absolute bottom-0 left-[calc(50%-3px)] top-0 w-[6px] rounded-full opacity-20" />
        <span
          ref={threadRef}
          aria-hidden
          className="ikat-thread absolute bottom-0 left-[calc(50%-3px)] top-0 w-[6px] origin-top rounded-full"
          style={{ transform: "scaleY(0)" }}
        />
        {items.map((m, i) => (
          <Chapter key={m.icon} milestone={m} side={i % 2 === 0 ? "left" : "right"} />
        ))}
      </ol>
    </section>
  );
}

function Chapter({ milestone: m, side }: { milestone: Milestone; side: "left" | "right" }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { threshold: 0.35 });
  const Icon = ICONS[m.icon];
  const fromCentre = side === "left" ? 18 : -18;

  const words = (
    <>
      {m.date && <p className="eyebrow">{m.date}</p>}
      <h3 className="mt-1 text-[1.35rem] leading-tight">{m.title}</h3>
      {m.text ? (
        <p className="mt-1.5 text-[0.8125rem] leading-relaxed">{m.text}</p>
      ) : (
        <Pending label="Awaiting the couple's own words">
          <p className="text-[0.8125rem]">In the couple's own words.</p>
        </Pending>
      )}
      {m.image && (
        <div className="mt-3 border border-gold/50 p-1">
          <img src={m.image.src} alt={m.image.alt} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
        </div>
      )}
    </>
  );

  return (
    <li ref={ref} className="relative grid grid-cols-[1fr_4.25rem_1fr] items-start gap-2">
      <div
        className={side === "left" ? "pt-2 text-right" : "invisible"}
        style={
          side === "left"
            ? {
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : `translateX(${fromCentre}px)`,
                transition: `opacity 800ms ${EASE.silk} 200ms, transform 900ms ${EASE.silk} 200ms`,
              }
            : undefined
        }
      >
        {side === "left" && words}
      </div>

      {/* Icon medallion, threaded on the ikat line */}
      <div
        className="relative mx-auto flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full bg-cream-light shadow-[0_0_0_1px_#1C1410,0_0_0_4px_rgb(var(--cream)),0_0_0_5px_rgb(var(--gold))]"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "scale(0.6)",
          transition: `opacity 600ms ${EASE.silk}, transform 900ms cubic-bezier(0.34, 1.3, 0.64, 1)`,
        }}
      >
        <Icon className="h-[3.1rem] w-[3.1rem]" />
      </div>

      <div
        className={side === "right" ? "pt-2 text-left" : "invisible"}
        style={
          side === "right"
            ? {
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : `translateX(${fromCentre}px)`,
                transition: `opacity 800ms ${EASE.silk} 200ms, transform 900ms ${EASE.silk} 200ms`,
              }
            : undefined
        }
      >
        {side === "right" && words}
      </div>
    </li>
  );
}

/** Scales the thread to how far the guest has scrolled through the timeline. */
function useThreadProgress(trackRef: RefObject<HTMLElement>, threadRef: RefObject<HTMLElement>) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    const thread = threadRef.current;
    if (!track || !thread) return;
    if (reducedMotion) {
      thread.style.transform = "none";
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const r = track.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.65 - r.top) / r.height));
      thread.style.transform = `scaleY(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [trackRef, threadRef, reducedMotion]);
}
