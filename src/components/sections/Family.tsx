import { useRef, useState } from "react";
import { wedding, type FamilySide } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Pending } from "@/components/ui/Pending";
import { Sheet } from "@/components/ui/Sheet";

type Photo = { src: string; alt: string };

const hasDetails = (s: FamilySide) => Boolean(s.familyName || s.parents || s.photo);

/**
 * Section 06 — Family introduction (PRD §4.06).
 * Both families presented equally: stacked on phones, side by side from
 * tablet up. Identity: the two sides slide in towards each other, mirrored.
 */
export function Family() {
  const { heading, odiaHeading, bride, groom, illustration } = wedding.family;
  const [enlarged, setEnlarged] = useState<Photo | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerIn = useInView(headerRef);

  if (!import.meta.env.DEV && !hasDetails(bride) && !hasDetails(groom) && !illustration) return null;

  // Families are shown equally: per-side photos only when both sides have one.
  const usePhotos = Boolean(bride.photo && groom.photo);
  const shared = !usePhotos ? illustration : null;
  // In dev, show empty photo frames until photos or an illustration arrive.
  const photoSlots = usePhotos || (import.meta.env.DEV && !illustration);

  return (
    <section id="family" aria-labelledby="family-heading" className="section text-center">
      <div ref={headerRef} style={{ opacity: headerIn ? 1 : 0, transition: `opacity 900ms ${EASE.silk}` }}>
        {odiaHeading && (
          <p lang="or" className="odia text-base text-sindoor/85">
            {odiaHeading}
          </p>
        )}
        <h2 id="family-heading" className="mt-1 text-[2.25rem]">
          {heading}
        </h2>
        <GoldDivider className="mt-4" />
      </div>

      {shared && (
        <FramedPhoto photo={shared} onOpen={setEnlarged} className="mx-auto mt-10 max-w-[20rem]" />
      )}

      <div className="mt-10 grid gap-14 md:grid-cols-2 md:gap-8">
        <FamilyBlock side={bride} from="left" showPhoto={photoSlots} onOpen={setEnlarged} />
        <FamilyBlock side={groom} from="right" showPhoto={photoSlots} onOpen={setEnlarged} />
      </div>

      <Sheet
        open={enlarged !== null}
        onClose={() => setEnlarged(null)}
        label={enlarged?.alt ?? "Family photograph"}
        variant="lightbox"
      >
        {enlarged && (
          <img
            src={enlarged.src}
            alt={enlarged.alt}
            className="max-h-[85dvh] max-w-full border border-gold/60 bg-cream-light p-1.5"
          />
        )}
      </Sheet>
    </section>
  );
}

function FamilyBlock({
  side,
  from,
  showPhoto,
  onOpen,
}: {
  side: FamilySide;
  from: "left" | "right";
  showPhoto: boolean;
  onOpen: (p: Photo) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const offset = from === "left" ? -28 : 28;

  return (
    <div
      ref={ref}
      className="flex flex-col items-center"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : `translateX(${offset}px)`,
        transition: `opacity 900ms ${EASE.silk}, transform 1100ms ${EASE.silk}`,
      }}
    >
      {showPhoto &&
        (side.photo ? (
          <FramedPhoto photo={side.photo} onOpen={onOpen} className="mb-6 w-full max-w-[20rem]" />
        ) : (
          <Pending label="Family photograph not supplied">
            <div className="flex aspect-[4/3] w-60 items-center justify-center text-xs">Family photograph</div>
          </Pending>
        ))}

      <h3 className="text-[1.75rem]">{side.label}</h3>

      <div className="mt-2 space-y-1">
        {side.familyName ? (
          <p className="font-display text-xl italic text-ink">{side.familyName}</p>
        ) : (
          <Pending label="Family name awaiting confirmation">
            <p className="font-display text-xl italic">Family name</p>
          </Pending>
        )}
        {side.parents ? (
          <p className="text-[0.8125rem] text-ink-soft">{side.parents}</p>
        ) : (
          <Pending label="Parents' names awaiting confirmation">
            <p className="text-[0.8125rem]">Parents' names</p>
          </Pending>
        )}
      </div>
    </div>
  );
}

function FramedPhoto({ photo, onOpen, className = "" }: { photo: Photo; onOpen: (p: Photo) => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(photo)}
      aria-label={`View larger: ${photo.alt}`}
      className={`group block border border-gold/60 p-1.5 ${className}`}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-silk group-active:scale-[0.99]"
      />
    </button>
  );
}
