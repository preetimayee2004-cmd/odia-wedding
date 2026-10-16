import { useRef, type CSSProperties } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { useFitToArea } from "@/hooks/useFitToArea";
import { useInView } from "@/hooks/useInView";
import { EASE } from "@/lib/motion";
import { CardBackdrop, cardCq, cardMinHeight, type CardArt } from "@/components/art/CardBackdrop";
import { GaneshaIcon, LotusIcon } from "@/components/art/Ganesha";
import { Divider } from "@/components/ui/CardOrnaments";

/**
 * The couple card artwork (768×1376): a carved arch in a red-and-gold border
 * on cream paper matched to the invitation card. Its top (the arch) and
 * bottom are kept whole; a plain 117px band of the middle repeats between
 * them so the card fills the screen undistorted.
 */
const CARD: CardArt = { src: "/art/couple-card.jpg", middle: "/art/couple-card-middle.png", w: 768, h: 1376, top: 606, bottomFrom: 723 };
const cq = (px: number) => cardCq(CARD, px);
const UNDER_ARCH = 160; // below the arch's peak (card px)
const BORDER_BOTTOM = 1300; // the bottom border band begins here
const PANEL_EDGE = 62; // the inner red line of the side borders
/** The couple seated at the sacred fire, centred at the bottom of the card. */
const COUPLE_ART = { src: "/art/couple-havan.png", alt: "The bride and groom seated together before the sacred fire", aspect: 242 / 303 };

const GOLD = "#B8863B";

/**
 * Section 03 — The couple.
 * Under Ganesha and the invocation, the guest is greeted by name, then the
 * couple's names rise in one after another, with their hashtag and a short
 * quote — spread evenly down the card, inside its arch and border, above the
 * illustrated couple seated at the sacred fire.
 */
export function Couple() {
  const ref = useRef<HTMLElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.25 });
  useFitToArea(areaRef, blockRef, { spread: true });
  const { guestName } = useGuest();
  const { couple, invitation } = wedding;
  const [first, second] = invitation.names;

  /** Fades in from just below, after `delay` ms. */
  const rise = (delay: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(12px)",
    transition: `opacity 700ms ${EASE.silk} ${delay}ms, transform 800ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section
      ref={ref}
      id="couple"
      aria-labelledby="couple-heading"
      data-status-tone="light"
      className="relative [container-type:inline-size]"
    >
      <CardBackdrop card={CARD} />

      <div
        className="relative z-20 flex flex-col"
        style={{
          minHeight: cardMinHeight(CARD),
          paddingTop: cq(UNDER_ARCH),
          paddingBottom: `calc(${cq(CARD.h - BORDER_BOTTOM)} + 10px)`,
        }}
      >
        <div ref={areaRef} className="relative min-h-0 flex-1">
          {/* Spread evenly down the card; shrinks a little on very small screens */}
          <div
            ref={blockRef}
            className="absolute inset-x-0 top-1/2 flex flex-col items-center justify-evenly gap-4 text-center font-serif"
            style={{ paddingInline: `calc(${cq(PANEL_EDGE)} + 28px)`, transform: "translateY(-50%)" }}
          >
            {/* Ganesha and the invocation */}
            <div className="flex flex-col items-center">
              <div
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "none" : "scale(0.85)",
                  transition: `opacity 600ms ${EASE.silk}, transform 600ms ${EASE.silk}`,
                }}
              >
                <GaneshaIcon className="h-[60px] w-auto" />
              </div>
              <p className="t-blessing mt-2.5 whitespace-nowrap" style={rise(250)}>
                {couple.invocation}
              </p>
            </div>

            {/* The guest, by name */}
            <div className="flex flex-col items-center">
              <p className="t-greeting" style={rise(450)}>
                {couple.greeting.replace("{guest}", guestName)}
              </p>
              <p className="t-body mt-1.5 [text-wrap:balance]" style={rise(600)}>
                {couple.invite}
              </p>
              <div className="mt-3" style={rise(700)}>
                <Divider />
              </div>
            </div>

            {/* The couple's names, one after another */}
            <h2 id="couple-heading" className="flex flex-col items-center">
              <span className="t-names" style={rise(900)}>
                {first}
              </span>
              <span className="t-amp my-1.5" style={rise(1200)}>
                &amp;
              </span>
              <span className="t-names" style={rise(1500)}>
                {second}
              </span>
            </h2>

            {couple.hashtag && (
              <div className="flex flex-col items-center gap-1.5" style={rise(1800)}>
                <span aria-hidden className="h-px w-40" style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />
                <p className="t-hashtag">
                  {couple.hashtag}
                </p>
                <span aria-hidden className="h-px w-40" style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />
              </div>
            )}

            {/* A few words, under a small lotus */}
            <div className="flex flex-col items-center" style={rise(2000)}>
              <LotusIcon className="h-5 w-auto" />
              <p className="t-quote mt-1.5 max-w-[17rem] [text-wrap:balance]">
                {couple.quote}
              </p>
            </div>
          </div>
        </div>

        {/* The couple at the sacred fire, centred at the bottom */}
        <img
          src={COUPLE_ART.src}
          alt={COUPLE_ART.alt}
          decoding="async"
          className="mx-auto mt-2 block h-auto shrink-0"
          style={{
            width: "min(52cqw, 230px)",
            aspectRatio: `${COUPLE_ART.aspect}`,
            opacity: inView ? 1 : 0,
            transform: inView ? "none" : "translateY(16px)",
            transition: `opacity 900ms ${EASE.silk} 300ms, transform 1000ms ${EASE.silk} 300ms`,
          }}
        />
      </div>
    </section>
  );
}
