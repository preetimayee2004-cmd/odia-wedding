import { useRef } from "react";

const MIN_FILL_MS = 2500;

/**
 * Lightweight spam friction for public forms: a minimum time between first
 * touching the form and submitting, plus a per-device cooldown.
 * (A honeypot field covers simple bots; the database adds its own limits.)
 */
export function useSpamGuard(storageKey: string, cooldownMs: number) {
  const startedAt = useRef<number | null>(null);

  return {
    /** Call on first focus/input. */
    touch() {
      startedAt.current ??= Date.now();
    },
    tooFast(): boolean {
      return startedAt.current === null || Date.now() - startedAt.current < MIN_FILL_MS;
    },
    coolingDown(): boolean {
      try {
        const last = Number(localStorage.getItem(storageKey));
        return Boolean(last) && Date.now() - last < cooldownMs;
      } catch {
        return false;
      }
    },
    markSubmitted() {
      try {
        localStorage.setItem(storageKey, String(Date.now()));
      } catch {
        /* storage blocked — cooldown just won't apply */
      }
    },
  };
}
