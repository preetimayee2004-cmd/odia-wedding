import { forwardRef, type CSSProperties } from "react";
import { toggleSound, useSoundOn } from "@/lib/sound";

/** Round sound button (sankha on / off), shared by the opening and the site. */
export const SoundButton = forwardRef<HTMLButtonElement, { className?: string; style?: CSSProperties; tabIndex?: number }>(
  function SoundButton({ className = "", style, tabIndex }, ref) {
    const on = useSoundOn();
    return (
      <button
        ref={ref}
        type="button"
        onClick={toggleSound}
        aria-label={on ? "Stop the sankha" : "Play the sankha"}
        aria-pressed={on}
        className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#D9B877]/60 text-[#F3E3C0] ${className}`}
        style={style}
        tabIndex={tabIndex}
      >
        <SoundIcon on={on} />
      </button>
    );
  },
);

/** A speaker; with sound waves while playing, crossed out when silent. */
function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 7h2.5l3.5-3v10l-3.5-3H2.5Z" fill="currentColor" fillOpacity="0.25" />
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
 * way to the end of the site, on a dark glass disc so it reads on light and
 * dark sections alike.
 */
export function FloatingSoundButton() {
  return (
    <SoundButton
      className="sound-float fixed left-4 top-[calc(max(1rem,env(safe-area-inset-top))_+_var(--status-bar,0px))] z-40 bg-[#1C1A17]/55 shadow-[0_4px_14px_-6px_rgb(0_0_0/0.6)] backdrop-blur-[3px]"
    />
  );
}
