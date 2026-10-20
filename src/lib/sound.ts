import { useSyncExternalStore } from "react";
import { wedding } from "@/config/wedding";
import { asMediaPlayback, playSankha, type SoundHandle } from "@/lib/sankha";

/**
 * The site's sound.
 *
 * The song (`assets.weddingMusic`) is ONE shared <audio> element for the
 * whole visit — made once when the site loads (loop, preload "auto", volume
 * 0.6), never per render. Browsers only let sound start inside a tap, so
 * play() is always called synchronously in a click handler, never in an
 * effect, a timer or after an await: the rose rangoli on the invitation
 * calls playSong() straight from its onClick; the sound buttons call
 * toggleSound(); and if the invitation opened by itself, the visitor's first
 * tap anywhere starts it. It plays on through every section, pauses while
 * the tab is hidden and resumes when it comes back. If the file can't load,
 * nothing breaks: the buttons just stay off. play() failures are logged.
 *
 * The opening: the tap on the temple gate plays the devotional sound once
 * (`assets.openingMusic`, or while that is null the synthesised sankha).
 */

const MUTED_KEY = "tila:music-muted";
const SONG_VOLUME = 0.6;

let muted = readMuted();
let opening: HTMLAudioElement | null = null;
let sankha: SoundHandle | null = null;
let openingStarted = false;
let resumeOnShow = false;
let firstTapArmed = false;
let songFailed = false;

/** The one song element (null without a file, or outside a browser). */
const song: HTMLAudioElement | null = typeof window !== "undefined" && wedding.assets.weddingMusic ? makeSong(wedding.assets.weddingMusic) : null;

function makeSong(src: string): HTMLAudioElement {
  const el = new Audio();
  el.loop = true;
  el.preload = "auto";
  el.volume = SONG_VOLUME;
  el.addEventListener("play", notify);
  el.addEventListener("pause", notify);
  el.addEventListener("error", () => {
    songFailed = true;
    console.error("[music] the song could not be loaded:", src, el.error);
    notify();
  });
  el.src = src;
  return el;
}

// ── the buttons' on/off state ──
const listeners = new Set<() => void>();
const isOn = () => (!!song && !songFailed && !song.paused) || sankha !== null || (!!opening && !opening.paused);
function notify() {
  if (typeof document !== "undefined") document.documentElement.dataset.musicOn = isOn() ? "1" : "0";
  listeners.forEach((l) => l());
}

function readMuted(): boolean {
  try {
    return sessionStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
}
function writeMuted(on: boolean) {
  muted = on;
  try {
    if (on) sessionStorage.setItem(MUTED_KEY, "1");
    else sessionStorage.removeItem(MUTED_KEY);
  } catch {
    /* storage unavailable: remembered for this visit only */
  }
}

/** Starts the song. Call only inside a click/keypress handler, synchronously. */
function startSong() {
  if (!song || songFailed) return;
  asMediaPlayback();
  song.volume = SONG_VOLUME;
  song.play().then(notify, (err: unknown) => {
    console.error("[music] play() was refused:", err);
    notify();
  });
}

function stopOpening() {
  sankha?.stop();
  sankha = null;
  opening?.pause();
  notify();
}

/** The rangoli's tap (the way into the site): the song begins — call it first thing in the onClick. */
export function playSong() {
  if (muted) return;
  disarmFirstTap();
  stopOpening();
  startSong();
}

/** The temple gate's tap: the devotional sound, once. */
export function beginOpeningMusic() {
  if (openingStarted || muted) return;
  openingStarted = true;
  const src = wedding.assets.openingMusic;
  if (src) {
    opening = new Audio(src);
    opening.addEventListener("play", notify);
    opening.addEventListener("pause", notify);
    opening.addEventListener("ended", notify);
    opening.play().catch((err: unknown) => console.error("[music] opening play() was refused:", err));
    return;
  }
  const handle = playSankha(wedding.assets.openingSound);
  sankha = handle;
  notify();
  void handle.ended.then(() => {
    if (sankha !== handle) return;
    sankha = null;
    notify();
  });
}

/**
 * The opening has finished (or there was none): the devotional sound fades,
 * and the song waits for the visitor's tap — the rangoli's, or, if the
 * invitation opens by itself, their first tap anywhere.
 */
export function beginWeddingMusic(_fast = false) {
  if (opening && !opening.paused) {
    const el = opening;
    const t0 = performance.now();
    const from = el.volume;
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / 1200);
      el.volume = from * (1 - k);
      if (k < 1) requestAnimationFrame(step);
      else el.pause();
    };
    requestAnimationFrame(step);
  }
  armFirstTap();
}

/** The sound buttons: play or pause the song (the same element). Call inside the tap. */
export function toggleSound() {
  if (isOn()) {
    writeMuted(true);
    stopOpening();
    song?.pause();
    notify();
    return;
  }
  writeMuted(false);
  disarmFirstTap();
  startSong();
}

// ── the first tap anywhere, for a visitor who never tapped the rangoli ──
function onFirstTap(e: Event) {
  const target = e.target as Element | null;
  if (target?.closest?.("[data-sound-button]")) return; // the sound buttons decide for themselves
  disarmFirstTap();
  if (!muted && song && song.paused) startSong();
}
function armFirstTap() {
  if (firstTapArmed || typeof window === "undefined" || !song) return;
  firstTapArmed = true;
  window.addEventListener("click", onFirstTap, true);
  window.addEventListener("keydown", onFirstTap, true);
}
function disarmFirstTap() {
  if (!firstTapArmed) return;
  firstTapArmed = false;
  window.removeEventListener("click", onFirstTap, true);
  window.removeEventListener("keydown", onFirstTap, true);
}

// paused while the tab is hidden, back when it returns
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!song) return;
    if (document.hidden) {
      resumeOnShow = !song.paused;
      if (resumeOnShow) song.pause();
    } else if (resumeOnShow && !muted) {
      resumeOnShow = false;
      song.play().catch((err: unknown) => console.error("[music] could not resume:", err));
    }
  });
}

/** Whether sound is playing (for the buttons' icon and label). */
export function useSoundOn(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    isOn,
    () => false,
  );
}
