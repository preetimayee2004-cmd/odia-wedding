import { useRef } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { CoupleArt } from "@/components/art/CoupleArt";

const ART_MS = 1600;
const WORD_MS = 55;

/**
 * Section 13 — Thank-you screen (PRD §4.12).
 * The same couple illustration as the introduction, now in a round frame.
 * Identity: the art fades in slowly, then the message arrives word by word.
 */
export function ThankYou() {
  const { heading, message } = wedding.thankYou;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.35 });
  const words = message.split(/\s+/);

  return (
    <section
      ref={ref}
      id="thank-you"
      aria-labelledby="thanks-heading"
      className="section flex min-h-[90dvh] flex-col items-center justify-center text-center"
    >
      <div
        className="relative aspect-square w-56 rounded-full border border-gold/60 p-2 short:w-48"
        style={{ opacity: inView ? 1 : 0, transition: `opacity ${ART_MS}ms ${EASE.silk}` }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-full border border-gold/30 bg-cream-light">
          <CoupleArt imgClassName="h-full w-full object-cover" fallbackClassName="absolute inset-x-6 top-[22%] h-auto" />
        </div>
      </div>

      <div style={{ opacity: inView ? 1 : 0, transition: `opacity 900ms ${EASE.silk} ${ART_MS - 400}ms` }}>
        <p lang="or" className="odia mt-8 text-base text-sindoor/85">
          ଧନ୍ୟବାଦ
        </p>
        <h2 id="thanks-heading" className="text-[2.5rem]">
          {heading}
        </h2>
      </div>

      <p className="mx-auto mt-4 max-w-[18rem] font-display text-[1.25rem] italic leading-snug text-ink">
        <span className="sr-only">{message}</span>
        <span aria-hidden>
          {words.map((w, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                opacity: inView ? 1 : 0,
                transition: `opacity 700ms ${EASE.silk} ${ART_MS + i * WORD_MS}ms`,
              }}
            >
              {w}&nbsp;
            </span>
          ))}
        </span>
      </p>
    </section>
  );
}
