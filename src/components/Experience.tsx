import { lazy, Suspense, useEffect, useLayoutEffect, useState } from "react";
import { wedding } from "@/config/wedding";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useScrollLock } from "@/hooks/useScrollLock";
import { readSessionFlag, writeSessionFlag } from "@/lib/session";
import { jumpToSection } from "@/lib/scroll";
import { watchStatusTone } from "@/lib/viewMode";
import { OpeningSequence } from "@/components/opening/OpeningSequence";
import { Invitation } from "@/components/sections/Invitation";

// Everything after the invitation is a separate chunk, fetched in the
// background while the guest reads the invitation.
const loadRest = () => import("@/components/RestOfSite");
const RestOfSite = lazy(loadRest);

const OPENING_SEEN = "tila:opening-seen";
const INVITATION_OPENED = "tila:invitation-opened";

// In dev, always replay the full intro so it can be reviewed.
const remembers = (key: string) => !import.meta.env.DEV && readSessionFlag(key);

// Dev-only review shortcut: ?open starts with the invitation already open.
const devOpen = import.meta.env.DEV && new URLSearchParams(window.location.search).has("open");

function shouldPlayOpening(reducedMotion: boolean): boolean {
  if (reducedMotion || devOpen) return false;
  return !(wedding.opening.playOncePerSession && remembers(OPENING_SEEN));
}

type IntroState = "playing" | "revealing" | "done";

/**
 * The whole invitation journey, in PRD order.
 * Opening + Invitation form the introductory experience; the remaining
 * sections mount when the guest taps "Open Invitation" and continue as one
 * vertical scroll.
 */
export function Experience() {
  const reducedMotion = usePrefersReducedMotion();
  const [intro, setIntro] = useState<IntroState>(() =>
    shouldPlayOpening(reducedMotion) ? "playing" : "done",
  );
  const [opened, setOpened] = useState(
    () => devOpen || (wedding.opening.playOncePerSession && remembers(INVITATION_OPENED)),
  );

  useScrollLock(intro !== "done");

  // The opening always starts at the top, even on reload.
  useLayoutEffect(() => {
    if (intro === "done") return;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  // The page itself stays dark (index.html) until the invitation is reached,
  // then becomes cream, so overscroll at the page edges matches the site.
  useEffect(() => {
    if (intro === "playing") return;
    document.documentElement.style.background = "rgb(var(--cream))";
  }, [intro]);

  // In the desktop mockup, flip the status bar to light over dark sections.
  useEffect(() => {
    if (intro !== "done") return;
    return watchStatusTone();
  }, [intro]);

  // Warm the rest of the site once the opening has finished.
  useEffect(() => {
    if (intro !== "done") return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    idle(() => void loadRest());
  }, [intro]);

  // The invitation's temple doors close over the screen, the next sections
  // mount (if needed) and the page jumps to the couple behind them; the doors
  // then swing open onto it.
  const handleOpen = async () => {
    if (!opened) {
      writeSessionFlag(INVITATION_OPENED);
      setOpened(true);
    }
    await jumpToSection("couple");
  };

  return (
    <>
      {intro !== "done" && (
        <OpeningSequence
          onReveal={() => setIntro("revealing")}
          onDone={() => {
            writeSessionFlag(OPENING_SEEN);
            setIntro("done");
          }}
        />
      )}

      <Invitation
        reveal={intro === "playing" ? "hidden" : intro === "revealing" ? "revealing" : "shown"}
        onOpen={handleOpen}
      />

      {opened && (
        <Suspense fallback={<div className="min-h-[100dvh]" aria-busy="true" />}>
          <RestOfSite />
        </Suspense>
      )}
    </>
  );
}
