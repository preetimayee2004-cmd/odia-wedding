import type { ReactNode } from "react";
import { showPlaceholders } from "@/lib/placeholders";

/**
 * Stand-in for a detail that hasn't been confirmed yet: its wording in quiet
 * italics with a small dashed "Placeholder" tag, in the place the real detail
 * will go. Shown only while `showPlaceholders` is on (site.showPlaceholders
 * in the config); otherwise renders nothing, so unconfirmed details are never
 * published.
 */
export function Pending({ children, label = "Awaiting confirmed details" }: { children: ReactNode; label?: string }) {
  if (!showPlaceholders) return null;
  return (
    <span title={label} className="ph">
      <span className="ph-text">{children}</span>
      <span className="ph-tag">Placeholder</span>
    </span>
  );
}
