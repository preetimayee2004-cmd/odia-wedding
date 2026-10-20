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
 * Song 1, the opening: the tap on the temple gate starts the devotional
 * sound — `assets.openingMusic`, looping through the darshan and the
 * invitation card (or, while that is null, the synthesised sankha, once).
 * Song 2 takes over from the couple section: when the song starts, song 1
 * fades out as song 2 fades in over one second (where the browser lets a
 * page set volume; on iPhones, which don't, the switch is clean instead).
 */

const MUTED_KEY = "tila:music-muted";
const SONG_VOLUME = 0.6;
const OPENING_VOLUME = 0.9;
const CROSSFADE_MS = 1000;
/** Can a page set an audio element's volume here? (Not on iPhones: there it is always 1.) */
const canFade = (() => {
  if (typeof Audio === "undefined") return false;
  const probe = new Audio();
  probe.volume = 0.5;
  return probe.volume === 0.5;
})();

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
  if (typeof document !== "undefined") {
    const d = document.documentElement.dataset;
    d.musicOn = isOn() ? "1" : "0";
    d.music = song && !song.paused ? "song2" : sankha || (opening && !opening.paused) ? "song1" : "off";
  }
  listeners.forEach((l) => l());
}

/** Moves an element's volume to `to` over `ms` (then pauses it at 0). */
const fades = new WeakMap<HTMLAudioElement, number>();
function fadeTo(el: HTMLAudioElement, to: number, ms: number) {
  cancelAnimationFrame(fades.get(el) ?? 0);
  if (!canFade) {
    if (to === 0) el.pause();
    return;
  }
  const from = el.volume;
  const t0 = performance.now();
  const step = () => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    el.volume = from + (to - from) * k;
    if (k < 1) fades.set(el, requestAnimationFrame(step));
    else if (to === 0) el.pause();
  };
  fades.set(el, requestAnimationFrame(step));
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

/**
 * Starts song 2. Call only inside a click/keypress handler, synchronously.
 * `crossfade`: song 1 fades out as song 2 fades in over a second.
 */
function startSong(crossfade = false) {
  if (!song || songFailed) return;
  asMediaPlayback();
  const fadeIn = crossfade && canFade && !!opening && !opening.paused;
  song.volume = fadeIn ? 0 : SONG_VOLUME;
  song.play().then(
    () => {
      if (fadeIn) fadeTo(song, SONG_VOLUME, CROSSFADE_MS);
      notify();
    },
    (err: unknown) => {
      console.error("[music] play() was refused:", err);
      notify();
    },
  );
  if (crossfade) fadeOutOpening(CROSSFADE_MS);
}

/** Song 1 gives way: the sankha stops; the opening track fades out (or, where volume is fixed, stops). */
function fadeOutOpening(ms: number) {
  sankha?.stop();
  sankha = null;
  if (opening && !opening.paused) fadeTo(opening, 0, ms);
  notify();
}

function stopOpening() {
  sankha?.stop();
  sankha = null;
  opening?.pause();
  notify();
}

/** The rangoli's tap (into the couple section): song 2 takes over from song 1 — call it first thing in the onClick. */
export function playSong() {
  if (muted) return;
  disarmFirstTap();
  startSong(true);
}

/** The temple gate's tap: the devotional sound, once. */
export function beginOpeningMusic() {
  if (openingStarted || muted) return;
  openingStarted = true;
  const src = wedding.assets.openingMusic;
  if (src) {
    opening = new Audio(src);
    opening.loop = true; // through the darshan and the invitation card, until song 2 takes over
    opening.volume = OPENING_VOLUME;
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
 * The opening has finished (or there was none): song 1 plays on over the
 * invitation card, and song 2 waits for the visitor's tap into the couple
 * section — the rangoli's, or, if the invitation opens by itself, their
 * first tap anywhere.
 */
export function beginWeddingMusic(_fast = false) {
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
  startSong(true);
}

// ── the first tap anywhere, for a visitor who never tapped the rangoli ──
function onFirstTap(e: Event) {
  const target = e.target as Element | null;
  if (target?.closest?.("[data-sound-button]")) return; // the sound buttons decide for themselves
  disarmFirstTap();
  if (!muted && song && song.paused) startSong(true);
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
