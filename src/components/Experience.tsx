import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { wedding } from "@/config/wedding";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useScrollLock } from "@/hooks/useScrollLock";
import { readSessionFlag, writeSessionFlag } from "@/lib/session";
import { scrollToSection } from "@/lib/scroll";
import { OpeningSequence, type RevealMode } from "@/components/opening/OpeningSequence";
import { Invitation } from "@/components/sections/Invitation";
import { Couple } from "@/components/sections/Couple";
import { Countdown } from "@/components/sections/Countdown";
import { Story } from "@/components/sections/Story";
import { Family } from "@/components/sections/Family";
import { Events } from "@/components/sections/Events";
import { Venue } from "@/components/sections/Venue";
import { Travel } from "@/components/sections/Travel";
import { WishingWall } from "@/components/sections/WishingWall";
import { Rsvp } from "@/components/sections/Rsvp";

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
  const [revealMode, setRevealMode] = useState<RevealMode>("handoff");
  const [opened, setOpened] = useState(() => devOpen || remembers(INVITATION_OPENED));
  const deitySlotRef = useRef<HTMLDivElement>(null);
  const scrollAfterOpen = useRef(false);

  useScrollLock(intro !== "done");

  // The opening always starts at the top, even on reload.
  useLayoutEffect(() => {
    if (intro === "done") return;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  // After the next sections mount, glide down to the couple.
  useEffect(() => {
    if (!opened || !scrollAfterOpen.current) return;
    scrollAfterOpen.current = false;
    scrollToSection("couple", 1300);
  }, [opened]);

  const handleOpen = () => {
    if (opened) {
      scrollToSection("couple", 1300);
      return;
    }
    scrollAfterOpen.current = true;
    writeSessionFlag(INVITATION_OPENED);
    setOpened(true);
  };

  return (
    <>
      {intro !== "done" && (
        <OpeningSequence
          targetRef={deitySlotRef}
          onReveal={(mode) => {
            setRevealMode(mode);
            setIntro("revealing");
          }}
          onDone={() => {
            writeSessionFlag(OPENING_SEEN);
            setIntro("done");
          }}
        />
      )}

      <Invitation
        deitySlotRef={deitySlotRef}
        reveal={intro === "playing" ? "hidden" : intro === "revealing" ? "revealing" : "shown"}
        deityHidden={intro === "playing" || (intro === "revealing" && revealMode === "handoff")}
        opened={opened}
        onOpen={handleOpen}
      />

      {opened && (
        <>
          <Couple />
          <Countdown />
          <Story />
          <Family />
          <Events />
          <Venue />
          <Travel />
          <WishingWall />
          <Rsvp />
        </>
      )}
    </>
  );
}
