import { useEffect, useState } from "react";
import { wedding } from "@/config/wedding";

// iPhone 17 Pro Max: 6.9" display, 440 × 956 CSS px viewport.
const SCREEN_W = 440;
const SCREEN_H = 956;
const BEZEL = 14; // titanium band + black border
const FRAME_W = SCREEN_W + BEZEL * 2;
const FRAME_H = SCREEN_H + BEZEL * 2;
const STATUS_BAR_H = 54;

// Space kept free around the phone (top, and bottom for the caption).
const PAD_TOP = 28;
const PAD_BOTTOM = 60;

function useFitScale(): number {
  const compute = () =>
    Math.max(0.5, Math.min(1, (window.innerHeight - PAD_TOP - PAD_BOTTOM) / FRAME_H));
  const [scale, setScale] = useState(compute);

  useEffect(() => {
    const onResize = () => setScale(compute());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return scale;
}

/** Desktop-only frame that hosts the live site in an iframe. */
export function PhoneMockup({ src }: { src: string }) {
  const scale = useFitScale();
  const backdrop = wedding.assets.desktopBackdrop;

  return (
    <div
      className={`relative isolate flex min-h-[100dvh] flex-col items-center overflow-hidden ${backdrop ? "" : "bg-cream-deep"}`}
      style={{
        paddingTop: PAD_TOP,
        backgroundColor: backdrop ? BACKDROP_BASE : undefined,
        backgroundImage: backdrop
          ? undefined
          : "radial-gradient(ellipse 60% 55% at 50% 45%, rgb(var(--cream-light)) 0%, transparent 70%)",
      }}
    >
      {backdrop && <Backdrop src={backdrop} />}
      {/* Reserves the scaled footprint so layout matches what's visible */}
      <div style={{ width: FRAME_W * scale, height: FRAME_H * scale }}>
        <div
          className="relative origin-top-left"
          style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${scale})` }}
        >
          <SideButtons />

          {/* Titanium band */}
          <div
            className="absolute inset-0 rounded-[76px]"
            style={{
              background:
                "linear-gradient(145deg, #ebe8e3 0%, #b8b3ac 35%, #dcd8d2 55%, #a7a29b 100%)",
              boxShadow:
                "0 40px 80px -20px rgb(43 36 32 / 0.35), 0 18px 36px -18px rgb(43 36 32 / 0.25), inset 0 0 0 1px rgb(255 255 255 / 0.35)",
            }}
          />
          {/* Black border */}
          <div className="absolute inset-[3px] rounded-[73px] bg-[#0b0b0c]" />

          {/* Screen */}
          <div
            className="absolute overflow-hidden rounded-[62px] bg-cream"
            style={{ inset: BEZEL, width: SCREEN_W, height: SCREEN_H }}
          >
            <StatusBar />
            <iframe
              src={src}
              title="Wedding invitation — phone preview"
              className="block w-full border-0 bg-cream"
              style={{ height: SCREEN_H - STATUS_BAR_H }}
            />
            {/* Dynamic Island */}
            <div className="pointer-events-none absolute left-1/2 top-[11px] h-[37px] w-[125px] -translate-x-1/2 rounded-full bg-black" />
            {/* Home indicator */}
            <div className="pointer-events-none absolute bottom-2 left-1/2 h-[5px] w-[140px] -translate-x-1/2 rounded-full bg-ink/80" />
          </div>
        </div>
      </div>

      <p className={`eyebrow mt-6 text-center ${backdrop ? "text-cream-light/85" : ""}`}>Best experienced on your phone</p>
    </div>
  );
}

// Plain maroon of the backdrop artwork, filling the space between the side panels.
const BACKDROP_BASE = "#751C28";

/**
 * Portrait artwork framing the phone on wide screens: the full image on the
 * left and a mirrored copy on the right (a centred copy would sit hidden
 * behind the phone). Inner edges fade into the artwork's own maroon.
 */
function Backdrop({ src }: { src: string }) {
  // The mirrored copy flips its mask too, so one fade direction serves both.
  const fade = "linear-gradient(to right, #000 62%, transparent 100%)";
  const panel = "absolute inset-y-0 h-full w-auto max-w-none select-none";
  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <img src={src} alt="" className={`${panel} left-0`} style={{ maskImage: fade, WebkitMaskImage: fade }} />
      <img
        src={src}
        alt=""
        className={`${panel} right-0 -scale-x-100`}
        style={{ maskImage: fade, WebkitMaskImage: fade }}
      />
    </div>
  );
}

function StatusBar() {
  return (
    <div
      aria-hidden
      className="flex items-center justify-between bg-cream px-[34px] pt-[6px] font-sans text-ink"
      style={{ height: STATUS_BAR_H }}
    >
      <span className="w-[54px] text-center text-[16px] font-medium tracking-tight">9:41</span>
      <span className="flex items-center gap-[6px]">
        {/* Cellular */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* Wi-Fi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.4c2.3 0 4.4.9 6 2.4l1.1-1.2A10.3 10.3 0 0 0 8 .8 10.3 10.3 0 0 0 .9 3.6L2 4.8a8.6 8.6 0 0 1 6-2.4Z" />
          <path d="M8 5.6c1.4 0 2.7.5 3.7 1.4l1.1-1.2A7.1 7.1 0 0 0 8 4a7.1 7.1 0 0 0-4.8 1.8L4.3 7c1-.9 2.3-1.4 3.7-1.4Z" />
          <path d="M8 8.8c.6 0 1.1.2 1.5.6L8 11l-1.5-1.6c.4-.4.9-.6 1.5-.6Z" />
        </svg>
        {/* Battery */}
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" opacity="0.45" />
        </svg>
      </span>
    </div>
  );
}

function SideButtons() {
  const btn = "absolute w-[4px] bg-gradient-to-b from-[#c9c5bf] to-[#9e9993]";
  return (
    <div aria-hidden>
      {/* Left: Action button, volume up, volume down */}
      <span className={`${btn} -left-[3px] top-[188px] h-[34px] rounded-l-[2px]`} />
      <span className={`${btn} -left-[3px] top-[248px] h-[64px] rounded-l-[2px]`} />
      <span className={`${btn} -left-[3px] top-[326px] h-[64px] rounded-l-[2px]`} />
      {/* Right: Side button, Camera Control */}
      <span className={`${btn} -right-[3px] top-[276px] h-[100px] rounded-r-[2px]`} />
      <span className={`${btn} -right-[3px] top-[560px] h-[64px] rounded-r-[2px]`} />
    </div>
  );
}
