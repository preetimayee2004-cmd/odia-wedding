import type { ReactNode } from "react";

/** The invitation itself: light ochre canvas, centred column on tablet widths. */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-bg min-h-[100dvh] overflow-x-clip">
      <main className="mx-auto w-full max-w-column">{children}</main>
    </div>
  );
}
