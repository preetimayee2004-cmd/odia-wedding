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
 * calls playSong() straight from its onClick; if the invitation opened by
 * itself, the visitor's first tap anywhere in the couple section starts it.
 * Nothing starts it earlier — not the sound buttons, not a stray tap during
 * the opening or on the invitation card. It plays on through every section,
 * pauses while the tab is hidden and resumes when it comes back. If the file
 * can't load, nothing breaks: the buttons just stay off. play() failures are
 * logged.
 *
 * Song 1, the opening: the tap on the temple gate starts the devotional
 * sound — `assets.openingMusic`, played once (or, while that is null, the
 * synthesised sankha, once). It is the only sound until the couple section.
 * Song 2 takes over from the couple section: if song 1 is still sounding,
 * it fades out as song 2 fades in over one second (where the browser lets a
 * page set volume; on iPhones, which don't, the switch is clean instead).
 *
 * The sound buttons: before the couple section they mute or unmute (the
 * opening sound pauses or carries on, and the song will or won't start at
 * the rangoli); from the couple section they pause or play the song.
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
/** The song waits for the couple section: the rangoli's tap, or arriving there. */
let songReleased = false;

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
const openingSounding = () => sankha !== null || (!!opening && !opening.paused);
/** On = playing; before the couple section, also "not muted" (the song is still to come). */
const isOn = () =>
  songReleased ? (!!song && !songFailed && !song.paused) || openingSounding() : openingSounding() || (!muted && !!song);
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
  if (!song) return;
  if (songFailed) {
    // it failed to load (a dropped connection, say): give it another try on this tap
    songFailed = false;
    song.load();
  }
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
  songReleased = true;
  disarmFirstTap();
  if (muted) return notify();
  startSong(true);
}

/** The temple gate's tap: the devotional sound, once. */
export function beginOpeningMusic() {
  if (openingStarted || muted) return;
  openingStarted = true;
  const src = wedding.assets.openingMusic;
  if (src) {
    opening = new Audio(src);
    // once: it rings through the opening and (if it's still sounding) fades into song 2 at the couple section
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
 * The couple section is on screen. After the rangoli's tap the song is
 * already playing; if the invitation opened by itself (or the visit starts
 * here), the song starts at the visitor's first tap anywhere.
 */
export function reachCoupleSection() {
  songReleased = true;
  if (!muted && song && song.paused) armFirstTap();
  notify();
}

/**
 * The sound buttons: play or pause the song (the same element). Call inside
 * the tap. Before the couple section they only mute or unmute — the song
 * never starts here early.
 */
export function toggleSound() {
  if (isOn()) {
    writeMuted(true);
    stopOpening();
    song?.pause();
    notify();
    return;
  }
  writeMuted(false);
  if (!songReleased) {
    // the opening sound carries on from where it was paused, if it hasn't finished
    if (opening && opening.paused && !opening.ended && opening.currentTime > 0) {
      opening.volume = OPENING_VOLUME;
      opening.play().catch((err: unknown) => console.error("[music] opening play() was refused:", err));
    }
    notify();
    return;
  }
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
