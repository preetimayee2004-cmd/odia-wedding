/**
 * An illustrated portrait card used as a full-screen section background.
 * Its decorated top (0 → `top`) and bottom (`bottomFrom` → `h`) are kept
 * whole; `middle` is a plain band cut from between them where it repeats
 * cleanly, tiled to fill any height, so the card never distorts.
 * The section must be a size container (`[container-type:inline-size]`).
 */
export interface CardArt {
  src: string;
  middle: string;
  w: number;
  h: number;
  top: number;
  bottomFrom: number;
}

/** Card pixels → container width units (the card spans the section's width). */
export const cardCq = (card: CardArt, px: number) => `${((px / card.w) * 100).toFixed(3)}cqw`;

/** The shortest the section may be: the card's whole top and bottom. */
export const cardMinHeight = (card: CardArt) => `max(100dvh, ${cardCq(card, card.top + card.h - card.bottomFrom)})`;

export function CardBackdrop({ card }: { card: CardArt }) {
  return (
    <div aria-hidden className="absolute inset-0 flex flex-col">
      <div
        className="relative z-10 shrink-0"
        style={{ height: cardCq(card, card.top), backgroundImage: `url(${card.src})`, backgroundSize: "100% auto", backgroundPosition: "top", backgroundRepeat: "no-repeat" }}
      />
      <div
        className="-my-px flex-1"
        style={{ backgroundImage: `url(${card.middle})`, backgroundSize: "100% auto", backgroundRepeat: "no-repeat round" }}
      />
      <div
        className="relative z-10 shrink-0"
        style={{ height: cardCq(card, card.h - card.bottomFrom), backgroundImage: `url(${card.src})`, backgroundSize: "100% auto", backgroundPosition: "bottom", backgroundRepeat: "no-repeat" }}
      />
    </div>
  );
}
