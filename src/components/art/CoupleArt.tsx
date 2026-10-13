import { wedding } from "@/config/wedding";
import { MukutPair } from "./MukutPair";

/**
 * The couple illustration (PRD §4.03, §4.12) — one source so the couple
 * introduction and the thank-you screen always match. Falls back to the
 * Odia wedding-mukut pair until the approved illustration is configured.
 */
export function CoupleArt({ imgClassName = "", fallbackClassName = "" }: { imgClassName?: string; fallbackClassName?: string }) {
  const art = wedding.assets.coupleIllustration;
  if (art) {
    return <img src={art.src} alt={art.alt} loading="lazy" decoding="async" className={imgClassName} />;
  }
  return <MukutPair className={fallbackClassName} />;
}
