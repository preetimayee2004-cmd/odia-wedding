import { useRef } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { directionsUrl } from "@/lib/maps";
import { MandapArt } from "@/components/art/MandapArt";
import { Pending } from "@/components/ui/Pending";

/**
 * Section 08 — Venue and directions (PRD §4.08).
 * Identity: the venue image parts from the centre like a curtain, then the
 * details settle in beneath it.
 */
export function Venue() {
  const { name, city, address, mapsUrl, description, image } = wedding.venue;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.25 });
  const directions = directionsUrl({ mapsUrl, name, address });

  if (!import.meta.env.DEV && !name && !address) return null;

  const fade = (delay: number) => ({
    opacity: inView ? 1 : 0,
    transition: `opacity 900ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section ref={ref} id="venue" aria-labelledby="venue-heading" className="py-[var(--section-y)]">
      <p className="eyebrow text-center" style={fade(0)}>
        The Venue
      </p>

      <div
        className="mt-6 overflow-hidden bg-cream-light"
        style={{
          clipPath: inView ? "inset(0 0 0 0)" : "inset(0 50% 0 50%)",
          transition: `clip-path 1400ms ${EASE.temple} 150ms`,
        }}
      >
        {image ? (
          <img src={image.src} alt={image.alt} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center px-8">
            <MandapArt className="h-auto w-full max-w-[20rem]" />
          </div>
        )}
      </div>

      <div className="px-[var(--gutter)] text-center" style={fade(900)}>
        {name ? (
          <h2 id="venue-heading" className="mt-8 text-[2.1rem]">
            {name}
          </h2>
        ) : (
          <>
            <h2 id="venue-heading" className="sr-only">
              The Venue
            </h2>
            <div className="mt-8 flex justify-center">
              <Pending label="Venue name awaiting confirmation">
                <p className="font-display text-[2.1rem] text-sindoor">Venue name</p>
              </Pending>
            </div>
          </>
        )}

        <div className="mx-auto mt-3 max-w-[18rem] text-[0.875rem] leading-relaxed text-ink-soft">
          {address ? (
            <address className="not-italic">{address}</address>
          ) : (
            <Pending label="Address awaiting confirmation">Full address{city ? `, ${city}` : ""}</Pending>
          )}
        </div>

        {description && <p className="mx-auto mt-4 max-w-[19rem] text-[0.875rem] leading-relaxed">{description}</p>}

        {directions ? (
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sindoor px-8 text-sm font-medium tracking-wide text-cream-light shadow-[0_8px_20px_-10px_rgb(var(--sindoor)/0.7)] transition duration-200 ease-silk active:scale-[0.98] active:bg-sindoor-dark"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 14.5s5-4.6 5-8.5a5 5 0 0 0-10 0c0 3.9 5 8.5 5 8.5Z" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="8" cy="6" r="1.8" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            Get Directions
            <span className="sr-only">(opens maps in a new tab)</span>
          </a>
        ) : (
          <div className="mt-8 flex justify-center">
            <Pending label="Directions need a confirmed address">Get Directions</Pending>
          </div>
        )}
      </div>
    </section>
  );
}
