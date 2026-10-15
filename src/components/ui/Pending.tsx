import type { ReactNode } from "react";
import { showPlaceholders } from "@/lib/placeholders";

/**
 * Stand-in for content that hasn't been confirmed yet. Shows the shape of
 * the design (dashed, faded, not tappable) while `showPlaceholders` is on;
 * otherwise renders nothing, so unconfirmed details are never published.
 */
export function Pending({ children, label = "Awaiting confirmed details" }: { children: ReactNode; label?: string }) {
  if (!showPlaceholders) return null;
  return (
    <div title={label} aria-label={label} className="pointer-events-none select-none rounded-md border border-dashed border-ink-soft/40 px-1.5 py-1 opacity-55">
      {children}
    </div>
  );
}
