import { useRef, useState } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { showPlaceholders } from "@/lib/placeholders";
import { EASE } from "@/lib/motion";
import { Sheet } from "@/components/ui/Sheet";
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
 * gold finial — after the couple's design). A tap opens the photograph
 * larger. Hidden in production until photos are added.
 */
export function Gallery() {
  const { eyebrow, heading, photos } = wedding.gallery;
  const headerRef = useRef<HTMLDivElement>(null);
  const headerIn = useInView(headerRef);
  const [open, setOpen] = useState<Photo | null>(null);

  if (photos.length === 0 && !showPlaceholders) return null;
  const items = photos.length > 0 ? photos : PLACEHOLDERS;
  // Alternate photos between the columns; the right column hangs a little lower.
  const columns = [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)];

  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="px-[var(--gutter)] py-[var(--section-y)]"
      style={{ backgroundColor: "rgb(var(--page))", backgroundImage: "url(/art/gallery-flowers.svg)", backgroundSize: "280px auto" }}
    >
      <div ref={headerRef} className="text-center" style={{ opacity: headerIn ? 1 : 0, transition: `opacity 900ms ${EASE.silk}` }}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="gallery-heading" className="mt-2 text-[2.25rem]">
          {heading}
        </h2>
        <span aria-hidden className="mx-auto mt-4 flex w-40 items-center gap-2">
          <span className="h-px flex-1 bg-gradient-to-l from-[#B8893A] to-transparent" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[#B8893A]" />
          <span className="h-px flex-1 bg-gradient-to-r from-[#B8893A] to-transparent" />
        </span>
      </div>

      <div className="mx-auto mt-12 grid max-w-[32rem] grid-cols-2 items-start gap-x-4">
        {columns.map((col, c) => (
          <ul key={c} className={`flex flex-col gap-7 ${c === 1 ? "pt-14" : ""}`}>
            {col.map((photo, i) => (
              <li key={photo.src || photo.alt}>
                <ArchFrame photo={photo} index={i * 2 + c} onOpen={photo.src ? () => setOpen(photo) : undefined} />
              </li>
            ))}
          </ul>
        ))}
      </div>

      <Sheet open={open !== null} onClose={() => setOpen(null)} label={open?.alt ?? "Photograph"} variant="lightbox">
        {open && (
          <div className="pattachitra-band rounded-t-full p-[6px]">
            <img
              src={open.src}
              alt={open.alt}
              className="block max-h-[82dvh] w-auto max-w-[min(92vw,30rem)] rounded-t-full border-[3px] border-[#FDFBF7] object-contain"
            />
          </div>
        )}
      </Sheet>
    </section>
  );
}

function ArchFrame({ photo, index, onOpen }: { photo: Photo; index: number; onOpen?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.25 });
  const height = photo.tall ? 440 : 360;

  const frame = (
    <GoldArchFrame height={height}>
      {photo.src ? (
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-silk group-hover:scale-[1.03]"
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
          <span className="text-[0.625rem] font-medium uppercase tracking-[0.18em]">Photo</span>
        </div>
      )}
    </GoldArchFrame>
  );

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(18px)",
        transition: `opacity 900ms ${EASE.silk} ${(index % 2) * 120}ms, transform 1000ms ${EASE.silk} ${(index % 2) * 120}ms`,
      }}
    >
      {onOpen ? (
        <button type="button" onClick={onOpen} aria-haspopup="dialog" aria-label={`Open: ${photo.alt}`} className="group relative block w-full rounded-t-full p-[5px]">
          {frame}
        </button>
      ) : (
        <div className="group relative rounded-t-full p-[5px]">{frame}</div>
      )}
    </div>
  );
}
