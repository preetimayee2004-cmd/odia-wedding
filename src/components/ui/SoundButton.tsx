import { forwardRef, type CSSProperties } from "react";
import { toggleSound, useSoundOn } from "@/lib/sound";

/**
 * Round sound button, shared by the opening and the site: solid maroon with
 * a gold rim and a cream speaker, clearly visible over any artwork.
 */
export const SoundButton = forwardRef<HTMLButtonElement, { className?: string; style?: CSSProperties; tabIndex?: number }>(
  function SoundButton({ className = "", style, tabIndex }, ref) {
    const on = useSoundOn();
    return (
      <button
        ref={ref}
        type="button"
        onClick={toggleSound}
        aria-label={on ? "Mute music" : "Play music"}
        aria-pressed={on}
        className={`inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#E3A21A] bg-[#7B1E1E] text-[#FBF3E2] shadow-[0_4px_12px_-2px_rgb(40_10_5/0.45)] ${className}`}
        style={style}
        tabIndex={tabIndex}
      >
        <SoundIcon on={on} />
      </button>
    );
  },
);

/** A speaker; with sound waves while playing, crossed out when muted. */
function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 7h2.5l3.5-3v10l-3.5-3H2.5Z" fill="currentColor" fillOpacity="0.35" />
      {on ? (
        <>
          <path d="M11.3 6.4a3.2 3.2 0 0 1 0 5.2" />
          <path d="M13.3 4.4a6 6 0 0 1 0 9.2" />
        </>
      ) : (
        <path d="M11.5 7l4 4M15.5 7l-4 4" />
      )}
    </svg>
  );
}

/**
 * After the opening, the sound button stays in the top-left corner all the
 * way to the end of the site, above everything else.
 */
export function FloatingSoundButton() {
  return (
    <SoundButton className="sound-float fixed left-3 top-[calc(12px_+_env(safe-area-inset-top)_+_var(--status-bar,0px))] z-[70]" />
  );
}
