import { useSyncExternalStore } from "react";
import { wedding } from "@/config/wedding";
import { playSankha, playSoftConch, type SoundHandle } from "@/lib/sankha";

/**
 * The one sound shared by the opening's sound button and the floating one
 * that stays on screen through the rest of the site, so either button shows
 * (and stops) whatever is playing.
 */
let current: SoundHandle | null = null;
/** The guest has turned sound on (and not turned it off) during this visit. */
let enabled = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/** Plays the sankha (call inside a tap); a second call stops it. */
export function toggleSound() {
  if (current) {
    current.stop();
    current = null;
    enabled = false;
    notify();
    return;
  }
  enabled = true;
  const handle = playSankha(wedding.assets.openingSound);
  current = handle;
  notify();
  void handle.ended.then(() => {
    if (current !== handle) return;
    current = null;
    notify();
  });
}

export function useSoundOn(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current !== null,
  );
}

/** A soft conch as the Hastaganthi knot ties — only if the guest has sound on. */
export function playKnotSound() {
  if (enabled) playSoftConch();
}
