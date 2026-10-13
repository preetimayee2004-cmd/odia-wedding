import type { ReactNode } from "react";

/** The invitation itself: cream canvas, centred column on tablet widths. */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-cream">
      <main className="mx-auto w-full max-w-column">{children}</main>
    </div>
  );
}
