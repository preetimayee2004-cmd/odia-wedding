import type { ReactNode } from "react";

/**
 * Dev-only stand-in for content that hasn't been confirmed yet. Shows the
 * shape of the design (dashed, faded) so layouts can be reviewed; renders
 * nothing in production, so unconfirmed details are never published.
 */
export function Pending({ children, label = "Awaiting confirmed details" }: { children: ReactNode; label?: string }) {
  if (!import.meta.env.DEV) return null;
  return (
    <div title={label} className="rounded-md border border-dashed border-ink-soft/40 px-1.5 py-1 opacity-55">
      {children}
    </div>
  );
}
