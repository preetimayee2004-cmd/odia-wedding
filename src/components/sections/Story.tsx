import { useEffect, useRef, type RefObject } from "react";
import { wedding, type WeddingConfig } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { EASE } from "@/lib/motion";
import { ChanduaBorder, ChanduaPatch } from "@/components/art/Chandua";
import { Pending } from "@/components/ui/Pending";

type Milestone = WeddingConfig["story"]["milestones"][number];

// Dev-only shape of the section until the couple supplies their story.
const PLACEHOLDERS: Milestone[] = [
  { title: "How we met", date: "Date", text: "In the couple's own words.", image: null },
  { title: "A first memory", date: "Date", text: "In the couple's own words.", image: null },
  { title: "The engagement", date: "Date", text: "In the couple's own words.", image: null },
  { title: "Beginning our life together", date: "Date", text: "In the couple's own words.", image: null },
];

/**
 * Section 05 — Our Story (PRD §4.05), in a restrained Pipili Chandua language.
 * Identity: a timeline thread that grows with the scroll, and applique
 * medallions that "stitch on" as each milestone arrives.
 */
export function Story() {
  const { heading, odiaHeading, milestones } = wedding.story;
  const headerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const threadRef = useRef<HTMLSpanElement>(null);
  const headerIn = useInView(headerRef);
  useThreadProgress(trackRef, threadRef);

  if (milestones.length === 0 && !import.meta.env.DEV) return null;
  const placeholder = milestones.length === 0;
  const items = placeholder ? PLACEHOLDERS : milestones;

  return (
    <section id="story" aria-labelledby="story-heading" className="relative bg-cream-light py-[var(--section-y)]">
      <ChanduaBorder className="absolute inset-x-0 top-0" />

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

      <ol ref={trackRef} className="relative mx-[var(--gutter)] mt-12 pl-[3.75rem]">
        {/* Thread: faint gold track, sindoor progress that grows with the scroll */}
        <span aria-hidden className="absolute bottom-0 left-[27px] top-5 w-px bg-gold/40" />
        <span
          ref={threadRef}
          aria-hidden
          className="absolute bottom-0 left-[27px] top-5 w-px origin-top bg-sindoor"
          style={{ transform: "scaleY(0)" }}
        />
        {items.map((m, i) => (
          <MilestoneItem key={i} milestone={m} index={i} placeholder={placeholder} />
        ))}
      </ol>

      <ChanduaBorder flip className="absolute inset-x-0 bottom-0" />
    </section>
  );
}

function MilestoneItem({ milestone: m, index, placeholder }: { milestone: Milestone; index: number; placeholder: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { threshold: 0.35 });

  const content = (
    <>
      {m.date && <p className="eyebrow">{m.date}</p>}
      <h3 className="mt-1 text-[1.6rem]">{m.title}</h3>
      <p className="mt-2 text-[0.875rem] leading-relaxed">{m.text}</p>
      {m.image && (
        <div className="mt-4 border border-gold/50 p-1">
          <img src={m.image.src} alt={m.image.alt} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
        </div>
      )}
    </>
  );

  return (
    <li ref={ref} className="relative pb-14 last:pb-0">
      <div
        className="absolute -left-[3.25rem] top-0 h-10 w-10"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "scale(0.55) rotate(-35deg)",
          transition: `transform 900ms ${EASE.silk}, opacity 500ms ${EASE.silk}`,
        }}
      >
        <ChanduaPatch variant={index} className="h-full w-full" />
      </div>
      <div
        className="pt-1"
        style={{ opacity: inView ? 1 : 0, transition: `opacity 900ms ${EASE.silk} 250ms` }}
      >
        {placeholder ? <Pending label="Awaiting the couple's story">{content}</Pending> : content}
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
