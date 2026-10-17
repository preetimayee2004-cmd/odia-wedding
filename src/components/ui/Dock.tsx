import type { CSSProperties } from "react";
import { LotusIcon } from "@/components/art/Ganesha";
import { MarigoldHead } from "@/components/art/MarigoldCompanion";

/**
 * A landing place for the marigold companion, above a section's heading: a
 * small gold lotus at 55% opacity. When the marigold lands (`.is-landed`,
 * set by MarigoldCompanion) the lotus gives way to a warm glow; the first
 * landing (`.is-burst`) throws out a ring of petals and a gold ripple — on
 * Wedding Events a second, fuller ring follows for the Hastaganthi. With
 * reduced motion there is no companion and the dock shows a still marigold.
 */
export function Dock({ name, special = false, className = "", style }: { name: string; special?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <div aria-hidden data-dock={name} className={`dock ${className}`} style={style}>
      <span className="dock-glow" />
      <LotusIcon className="dock-lotus" />
      <svg viewBox="-26 -26 52 52" className="dock-still">
        <MarigoldHead />
      </svg>
      <span className="dock-ripple" />
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className="dock-petal" style={{ ["--a" as string]: `${i * 36}deg`, background: i % 2 ? "#E8801A" : "#F2A12B" }} />
      ))}
      {special &&
        Array.from({ length: 16 }, (_, i) => (
          <span key={`s${i}`} className="dock-petal dock-petal-2" style={{ ["--a" as string]: `${i * 22.5 + 11}deg`, background: i % 2 ? "#E8801A" : "#F2A12B" }} />
        ))}
    </div>
  );
}
