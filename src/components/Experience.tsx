import { lazy, Suspense, useEffect, useLayoutEffect, useState } from "react";
import { wedding } from "@/config/wedding";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useScrollLock } from "@/hooks/useScrollLock";
import { readLocalFlag, readSessionFlag, writeLocalFlag, writeSessionFlag } from "@/lib/session";
import { jumpToSection } from "@/lib/scroll";
import { watchStatusTone } from "@/lib/viewMode";
import { OpeningSequence } from "@/components/opening/OpeningSequence";
import { Invitation } from "@/components/sections/Invitation";
import { FloatingSoundButton } from "@/components/ui/SoundButton";
import { beginWeddingMusic } from "@/lib/sound";

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

// A guest who has seen the opening on this device gets a slightly quicker
// darshan (never none); ?intro=1 plays the full-length intro.
const replayIntro = new URLSearchParams(window.location.search).get("intro") === "1";
const quickOpening = !replayIntro && !import.meta.env.DEV && readLocalFlag(OPENING_SEEN);

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
  // Once the guest has gone through to the couple, the invitation card is
  // left behind: the couple becomes the top of the page, so scrolling up
  // stops there instead of returning to the card.
  const [invitationLeft, setInvitationLeft] = useState(opened);

  useLayoutEffect(() => {
    if (invitationLeft) window.scrollTo(0, 0);
  }, [invitationLeft]);

  useScrollLock(intro !== "done");

  // No opening (reduced motion, or already seen this session): the wedding
  // song begins at the visitor's first tap.
  useEffect(() => {
    if (intro === "done") beginWeddingMusic(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on arrival
  }, []);

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
    setInvitationLeft(true); // hidden behind the golden wash, which then fades onto the couple
  };

  return (
    <>
      {intro !== "done" && (
        <OpeningSequence
          quick={quickOpening}
          onReveal={() => setIntro("revealing")}
          onDone={() => {
            writeSessionFlag(OPENING_SEEN);
            writeLocalFlag(OPENING_SEEN); // next visit: a slightly quicker darshan
            setIntro("done");
          }}
        />
      )}

      {/* Hidden, not unmounted: the rangoli's golden wash is still fading out */}
      <div hidden={invitationLeft}>
        <Invitation
          reveal={intro === "playing" ? "hidden" : intro === "revealing" ? "revealing" : "shown"}
          onOpen={handleOpen}
        />
      </div>

      {intro === "done" && <FloatingSoundButton />}

      {opened && (
        <Suspense fallback={<div className="min-h-[100dvh]" aria-busy="true" />}>
          <RestOfSite />
        </Suspense>
      )}
    </>
  );
}
