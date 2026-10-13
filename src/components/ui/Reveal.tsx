import type { CSSProperties, ReactNode } from "react";
import { EASE } from "@/lib/motion";

interface RevealProps {
  show: boolean;
  /** Position in the stagger sequence. */
  order?: number;
  step?: number;
  className?: string;
  children: ReactNode;
}

/** Staggered fade + gentle rise. Text stays still once it has arrived. */
export function Reveal({ show, order = 0, step = 110, className = "", children }: RevealProps) {
  const style: CSSProperties = {
    opacity: show ? 1 : 0,
    transform: show ? "none" : "translateY(14px)",
    transition: `opacity 900ms ${EASE.silk} ${order * step}ms, transform 900ms ${EASE.silk} ${order * step}ms`,
  };
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
