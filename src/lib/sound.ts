import { useSyncExternalStore } from "react";
import { wedding } from "@/config/wedding";
import { playSankha, type SoundHandle } from "@/lib/sankha";

/**
 * The invitation's sound, as one sequence with the opening:
 *  opening  from the visitor's tap on the temple gate, the devotional sound
 *           (`assets.openingMusic`; while that is null, the synthesised
 *           sankha) plays through the darshan;
 *  wedding  at the opening's own finish — the moment the light begins to
 *           settle onto the invitation — it fades out as the wedding song
 *           (`assets.weddingMusic`) fades in, then loops softly through the
 *           rest of the site.
 * Sound only starts inside a tap or key press (browsers forbid it
 * otherwise): if the gate opened by itself, or the opening was skipped by
 * the browser's settings, the right music starts at the visitor's next tap.
 * Each stage starts once, so a remount or a replay never doubles it. The
 * sound buttons mute and unmute it (remembered on this device), it pauses
 * while the page is hidden, and any failure is silent — sound is a nicety.
 */
type Stage = "idle" | "opening" | "wedding";
type Kind = "opening" | "wedding";

const MUTED_KEY = "tila:music-muted";
/** How loud each track plays (the song sits under the reading). */
const LEVEL: Record<Kind, number> = { opening: 0.9, wedding: 0.6 };
const SRC: Record<Kind, string | null> = { opening: wedding.assets.openingMusic, wedding: wedding.assets.weddingMusic };

interface Player {
  el: HTMLAudioElement;
  /** null where Web Audio is unavailable (then the element's own volume is used). */
  gain: GainNode | null;
  fadeTimer?: number;
}

let stage: Stage = "idle";
let muted = readMuted();
let audible = false;
let ctx: AudioContext | null = null;
const players: Partial<Record<Kind, Player>> = {};
let sankha: SoundHandle | null = null;
let gestureArmed = false;
let resumeOnShow: Kind | null = null;

const listeners = new Set<() => void>();
/** The stage and whether sound is playing, also on <html data-music data-music-on> (for styling and tests). */
function mark() {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.music = stage;
    document.documentElement.dataset.musicOn = audible ? "1" : "0";
  }
  listeners.forEach((l) => l());
}
function setAudible(on: boolean) {
  audible = on;
  mark();
}
function setStage(next: Stage) {
  stage = next;
  mark();
}
/** Is the visitor's tap or key press happening now (where the browser can tell)? */
const inGesture = () => {
  const ua = (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation;
  return ua ? ua.isActive : true;
};

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
}
function writeMuted(on: boolean) {
  try {
    if (on) localStorage.setItem(MUTED_KEY, "1");
    else localStorage.removeItem(MUTED_KEY);
  } catch {
    /* storage unavailable: remembered for this visit only */
  }
}

/** The audio graph, created (or woken) inside a gesture. */
function unlock() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    ctx = null;
  }
}

/** A track's player, made once (and routed through Web Audio, so it can fade on every phone). */
function player(kind: Kind): Player | null {
  const src = SRC[kind];
  if (!src) return null;
  const made = players[kind];
  if (made) return made;
  const el = new Audio(src);
  el.preload = "auto";
  el.loop = kind === "wedding";
  let gain: GainNode | null = null;
  try {
    if (ctx) {
      gain = ctx.createGain();
      gain.gain.value = 0;
      ctx.createMediaElementSource(el).connect(gain).connect(ctx.destination);
    }
  } catch {
    gain = null;
  }
  if (!gain) el.volume = 0;
  const p: Player = { el, gain };
  players[kind] = p;
  return p;
}

/** Fades a player to `to` over `ms`. */
function fade(p: Player, to: number, ms: number) {
  window.clearInterval(p.fadeTimer);
  if (p.gain && ctx) {
    const now = ctx.currentTime;
    p.gain.gain.cancelScheduledValues(now);
    p.gain.gain.setValueAtTime(p.gain.gain.value, now);
    p.gain.gain.linearRampToValueAtTime(to, now + ms / 1000);
    return;
  }
  // without Web Audio: step the element's volume (ignored on iOS, where it simply plays)
  const from = p.el.volume;
  const t0 = performance.now();
  p.fadeTimer = window.setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / Math.max(1, ms));
    p.el.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k >= 1) window.clearInterval(p.fadeTimer);
  }, 40);
}

/** Starts a track (fading in); if the browser won't allow it yet, waits for the visitor's next tap. */
function start(kind: Kind, fadeMs: number) {
  if (muted) return;
  const p = player(kind);
  if (!p) {
    // no recording: the opening has the synthesised sankha (only inside a tap); the site, silence
    if (kind === "opening") {
      if (inGesture()) playConch();
      else armGesture();
    }
    return;
  }
  unlock();
  if (p.gain && ctx && ctx.state !== "running") void ctx.resume();
  p.el.play().then(
    () => {
      fade(p, LEVEL[kind], fadeMs);
      setAudible(true);
    },
    () => armGesture(),
  );
}

/** Fades a track out and pauses it. */
function stop(kind: Kind, fadeMs: number) {
  const p = players[kind];
  if (!p || p.el.paused) return;
  fade(p, 0, fadeMs);
  window.setTimeout(() => {
    if (stage !== kind || muted) p.el.pause();
  }, fadeMs + 60);
}

function playConch() {
  if (sankha) return;
  const handle = playSankha(wedding.assets.openingSound);
  sankha = handle;
  setAudible(true);
  void handle.ended.then(() => {
    if (sankha !== handle) return;
    sankha = null;
    setAudible(false);
  });
}

function stopConch() {
  sankha?.stop();
  sankha = null;
}

/** The music the current stage calls for, at the visitor's next tap or key press. */
function armGesture() {
  if (gestureArmed) return;
  gestureArmed = true;
  const go = () => {
    window.removeEventListener("pointerdown", go, true);
    window.removeEventListener("keydown", go, true);
    gestureArmed = false;
    unlock();
    if (!muted && !audible && stage !== "idle") start(stage, 1200);
  };
  window.addEventListener("pointerdown", go, true);
  window.addEventListener("keydown", go, true);
}

// paused while the page is hidden, back when it returns
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    const kind = stage === "idle" ? null : stage;
    const p = kind ? players[kind] : undefined;
    if (document.hidden) {
      if (p && !p.el.paused) {
        p.el.pause();
        resumeOnShow = kind;
      }
    } else if (resumeOnShow && resumeOnShow === kind && !muted) {
      resumeOnShow = null;
      void p?.el.play().catch(() => armGesture());
    }
  });
}

/** The gate opens (called inside the visitor's tap, or by the gate's own timer): the devotional sound begins. */
export function beginOpeningMusic() {
  if (stage !== "idle") return; // once
  setStage("opening");
  unlock();
  player("wedding"); // let the song load meanwhile
  start("opening", 600);
}

/**
 * The opening has finished (the light begins to settle onto the invitation),
 * or there was no opening: the devotional sound fades out as the wedding song
 * fades in. `fast` for a skipped opening.
 */
export function beginWeddingMusic(fast = false) {
  if (stage === "wedding") return; // once
  const was = stage;
  setStage("wedding");
  stopConch();
  if (was === "opening") stop("opening", fast ? 500 : 1600);
  window.setTimeout(() => start("wedding", fast ? 1500 : 2200), was === "opening" ? (fast ? 200 : 300) : 0);
  if (!players.wedding && !SRC.wedding) setAudible(false);
}

/** The sound buttons: mute, or unmute and play what the moment calls for. Call inside the tap. */
export function toggleSound() {
  unlock();
  if (audible) {
    muted = true;
    writeMuted(true);
    stopConch();
    if (stage !== "idle") stop(stage, 400);
    setAudible(false);
    return;
  }
  muted = false;
  writeMuted(false);
  if (stage === "idle") setStage("opening"); // music before the gate opens: the devotional sound, now
  const now: Kind = stage === "wedding" ? "wedding" : "opening";
  if (now === "wedding" && !SRC.wedding) {
    playConch(); // no song: the sankha, once
    return;
  }
  start(now, 600);
}

/** Whether sound is playing (for the buttons' icon and label). */
export function useSoundOn(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => audible,
  );
}
