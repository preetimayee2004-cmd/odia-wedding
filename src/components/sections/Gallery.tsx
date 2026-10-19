import { forwardRef, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { showPlaceholders } from "@/lib/placeholders";
import { EASE } from "@/lib/motion";
import { PhotoViewer } from "@/components/ui/PhotoViewer";
import { ChampaSprig, JhotiRule } from "@/components/ui/JhotiThreshold";
import { GoldArchFrame } from "@/components/art/GoldArch";

type Photo = (typeof wedding.gallery.photos)[number];

// While placeholders are on: the shape of the masonry while the couple's photographs are awaited.
const PLACEHOLDERS: Photo[] = [true, false, false, true, true, false].map((tall, i) => ({
  src: "",
  alt: `Photograph ${i + 1}`,
  tall,
}));

/**
 * Section 07 — The Raghurajpur Canvas.
 * The couple's photographs hung like an exhibition on the page cream, among
 * faint white flowers: an asymmetric two-column masonry, each photograph in
 * a gilded palace arch (gold moulding, a maroon line, a pointed top with a
 * gold finial — after the couple's design). The frames stay still; as each
 * scrolls into view its photograph comes into focus (blurred and a little
 * larger to sharp, once; the right column a beat later), and on a desktop it
 * zooms gently under the pointer. A tap lifts the photograph out of its arch
 * into the full-screen viewer, where the set can be browsed, and it settles
 * back when closed. A small champa sits in the space the staggered columns
 * leave at the top. Hidden in production until photos are added.
 */
export function Gallery() {
  const { eyebrow, heading, photos } = wedding.gallery;
  const headerRef = useRef<HTMLDivElement>(null);
  const headerIn = useInView(headerRef);
  const [viewing, setViewing] = useState<number | null>(null);
  const reduced = usePrefersReducedMotion();
  const frames = useRef<(HTMLElement | null)[]>([]);
  const [revealed, setRevealed] = useState<ReadonlySet<number>>(() => new Set());

  // one observer for every frame: each photograph comes into focus once, as it first scrolls into view
  useEffect(() => {
    if (reduced) return;
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).map((e) => Number((e.target as HTMLElement).dataset.index));
        if (!seen.length) return;
        setRevealed((prev) => new Set([...prev, ...seen]));
        entries.forEach((e) => e.isIntersecting && io.unobserve(e.target));
      },
      { threshold: 0.2 },
    );
    frames.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [reduced]);

  if (photos.length === 0 && !showPlaceholders) return null;
  const items = photos.length > 0 ? photos : PLACEHOLDERS;
  // Alternate photos between the columns; the right column hangs a little lower.
  const columns = [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)];

  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="px-[var(--gutter)] py-[var(--section-y)]"
    >
      <div ref={headerRef} className="text-center" style={{ opacity: headerIn ? 1 : 0, transition: `opacity 900ms ${EASE.silk}` }}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="gallery-heading" className="t-heading mt-1.5" style={{ color: "#7A1424" }}>
          {heading}
        </h2>
        <JhotiRule motif="champa" className="mt-3" />
      </div>

      <div className="mx-auto mt-12 grid max-w-[32rem] grid-cols-2 items-start gap-x-4">
        {columns.map((col, c) => (
          <ul key={c} className={`relative flex flex-col gap-7 ${c === 1 ? "pt-14" : ""}`}>
            {/* the right column hangs lower: a small champa in the space above it */}
            {c === 1 && <ChampaSprig className="absolute left-1/2 top-0 h-[48px] w-auto -translate-x-1/2" style={{ opacity: headerIn ? 1 : 0, transition: `opacity 900ms ${EASE.silk} 400ms` }} />}
            {col.map((photo, i) => (
              <li key={photo.src || photo.alt}>
                <ArchFrame
                  ref={(el) => {
                    frames.current[i * 2 + c] = el;
                  }}
                  photo={photo}
                  index={i * 2 + c}
                  reveal={reduced ? undefined : revealed.has(i * 2 + c) ? "play" : "armed"}
                  onOpen={photo.src ? () => setViewing(i * 2 + c) : undefined}
                />
              </li>
            ))}
          </ul>
        ))}
      </div>

      {photos.length > 0 && (
        <PhotoViewer
          photos={photos}
          index={viewing}
          onIndex={setViewing}
          onClose={() => setViewing(null)}
          frameFor={(i) => frames.current[i]?.querySelector<HTMLElement>("button") ?? null}
        />
      )}
    </section>
  );
}

/** One photograph in its still arch, coming into focus when `reveal` plays (the right column a beat later), and a button to the viewer. */
const ArchFrame = forwardRef<HTMLDivElement, { photo: Photo; index: number; reveal?: "armed" | "play"; onOpen?: () => void }>(function ArchFrame({ photo, index, reveal, onOpen }, ref) {
  const height = photo.tall ? 440 : 360;

  const frame = (
    <GoldArchFrame height={height} reveal={reveal} delay={(index % 2) * 120}>
      {photo.src ? (
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          className="arch-img h-full w-full object-cover"
          style={{ objectPosition: photo.focus, transformOrigin: photo.focus }}
        />
      ) : (
        <div
          title="Photograph awaiting the couple"
          className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-ink-soft/40 bg-[#F3ECDF] text-ink-soft/70"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
            <rect x="3" y="6" width="22" height="16" rx="2" />
            <circle cx="14" cy="14" r="4.5" />
            <path d="M9 6l1.6-2.5h6.8L19 6" />
          </svg>
          <span className="t-label">Photo</span>
        </div>
      )}
    </GoldArchFrame>
  );

  return (
    <div ref={ref} data-index={index}>
      {onOpen ? (
        <button
          type="button"
          onClick={(e) => {
            e.currentTarget.focus({ preventScroll: true }); // so focus comes back here when the viewer closes
            onOpen();
          }}
          aria-haspopup="dialog"
          aria-label={`View photograph: ${photo.alt}`}
          className="arch-btn relative block w-full rounded-t-full p-[5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8893A]"
        >
          {frame}
        </button>
      ) : (
        <div className="relative rounded-t-full p-[5px]">{frame}</div>
      )}
    </div>
  );
});
