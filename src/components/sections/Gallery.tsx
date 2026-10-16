import { useRef, useState } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { showPlaceholders } from "@/lib/placeholders";
import { EASE } from "@/lib/motion";
import { Sheet } from "@/components/ui/Sheet";
import { ARCH_W, PattachitraArch, photoBox } from "@/components/art/PattachitraArch";

type Photo = (typeof wedding.gallery.photos)[number];

const STONE = "#B8893A";
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
 * a painted Pattachitra arch (a band of flowers and leaves, after the
 * couple's design) crowned with the Mukteswar torana's finial. A tap opens the photograph larger. Hidden in production
 * until photos are added.
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
    <>
      {/* The painted Pattachitra arch, with the photograph set under its window */}
      <div className="relative drop-shadow-[0_10px_14px_rgb(90_50_10/0.18)]" style={{ aspectRatio: `${ARCH_W} / ${height}` }}>
        <div className="absolute overflow-hidden rounded-t-full bg-[#2B1A14]" style={photoBox(height)}>
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
        </div>
        <PattachitraArch height={height} className="pointer-events-none absolute inset-0 h-full w-full" />
      </div>
      {/* Springing line of the arch: small carved brackets where the curve meets the pillars */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 aspect-[2/1]">
        <span className="absolute -left-[3px] bottom-0 h-[7px] w-[7px] rotate-45 border-[1.5px] bg-[#FDFBF7]" style={{ borderColor: STONE }} />
        <span className="absolute -right-[3px] bottom-0 h-[7px] w-[7px] rotate-45 border-[1.5px] bg-[#FDFBF7]" style={{ borderColor: STONE }} />
      </div>
      <Finial />
      {/* Plinth */}
      <span aria-hidden className="absolute -bottom-[5px] -left-[4px] -right-[4px] h-[4px] rounded-[1px]" style={{ backgroundColor: STONE }} />
    </>
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

/** The amalaka-and-kalasha finial crowning the arch, as on the Mukteswar torana. */
function Finial() {
  return (
    <svg aria-hidden viewBox="0 0 24 22" className="absolute -top-[17px] left-1/2 h-[22px] w-6 -translate-x-1/2" fill="#FDFBF7" stroke={STONE} strokeWidth="1.2">
      <path d="M12 1.5c1.2 1.6 1.2 3 0 4.2-1.2-1.2-1.2-2.6 0-4.2Z" fill={STONE} />
      <ellipse cx="12" cy="9" rx="5.5" ry="2.8" />
      <path d="M8.2 9.8 9 13h6l.8-3.2" />
      <path d="M5 21c0-4 3-7.5 7-7.5s7 3.5 7 7.5" />
    </svg>
  );
}
