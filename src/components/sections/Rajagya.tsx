import { useEffect, useState, type CSSProperties } from "react";
import { wedding } from "@/config/wedding";
import { EASE } from "@/lib/motion";
import { readSessionFlag, writeSessionFlag } from "@/lib/session";
import { BrassSeal } from "@/components/art/BrassSeal";
import { Pending } from "@/components/ui/Pending";
import { Sheet } from "@/components/ui/Sheet";

const DISMISSED = "tila:rajagya-dismissed";
const ARRIVE_MS = 1800;
const MOVE_MS = 700;
const INK = "#2A1C10";
const BROWN = "#6B4A22";
// Double rule: a parchment-coloured inset band, then a fine brown line.
const RULES = "shadow-[inset_0_0_0_3px_#F1E2C0,inset_0_0_0_4px_rgb(162_122_60/0.4)]";

/**
 * Section 12 — The Rajagya (Royal Decree).
 * Practical updates (parking, RSVP deadline, live stream) delivered with the
 * dignity of a royal decree: a parchment banner pinned to the bottom of the
 * screen, sealed at its corner with a brass Konark-wheel stamp. Tapping it
 * opens the full decree; dismissing it leaves only the seal. It steps aside
 * on the closing screen. Hidden in production until a notice is configured.
 */
export function Rajagya() {
  if (wedding.rajagya.notices.length === 0 && !import.meta.env.DEV) return null;
  return <Decree />;
}

function Decree() {
  const { label, odia, gloss, notices } = wedding.rajagya;
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => readSessionFlag(DISMISSED));
  const [arrived, setArrived] = useState(false);
  const atClose = useClosingInView();

  useEffect(() => {
    const timer = window.setTimeout(() => setArrived(true), ARRIVE_MS);
    return () => clearTimeout(timer);
  }, []);

  const bannerShown = arrived && !dismissed && !atClose;
  const sealShown = arrived && dismissed && !atClose;
  const first = notices[0];
  const title = `${label}, ${gloss}`;

  const dismiss = () => {
    writeSessionFlag(DISMISSED);
    setDismissed(true);
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto max-w-column px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div
          role="region"
          aria-label={title}
          className={`parchment pointer-events-auto relative rounded-[3px] border border-[#A27A3C]/60 shadow-[0_10px_28px_-10px_rgb(40_22_4/0.6)]`}
          style={{
            ...slide(bannerShown),
            transform: bannerShown ? "none" : "translateY(calc(100% + 2rem))",
          }}
        >
          <div className={`rounded-[3px] py-2.5 pl-[4.4rem] pr-11 ${RULES}`}>
            <button type="button" onClick={() => setOpen(true)} className="block w-full text-left" aria-haspopup="dialog">
              <span className="block text-[0.5625rem] font-semibold uppercase tracking-[0.22em] text-sindoor">
                {label} · {gloss}
              </span>
              {first ? (
                <span className="mt-0.5 line-clamp-2 font-display text-[0.95rem] leading-snug" style={{ color: INK }}>
                  {first.text}
                  {notices.length > 1 && (
                    <span className="ml-1.5 whitespace-nowrap font-sans text-[0.6875rem] not-italic" style={{ color: BROWN }}>
                      +{notices.length - 1} more
                    </span>
                  )}
                </span>
              ) : (
                <span
                  title="Notices awaiting confirmation"
                  className="mt-1 block rounded border border-dashed border-ink-soft/40 px-1.5 py-0.5 font-display text-[0.85rem] italic opacity-55"
                >
                  Practical notices appear here
                </span>
              )}
            </button>
          </div>
          <BrassSeal className="absolute -left-2.5 -top-4 h-[3.6rem] w-[3.6rem] -rotate-[8deg]" />
          <button
            type="button"
            onClick={dismiss}
            aria-label={`Dismiss the ${label}`}
            className="absolute right-0.5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center"
            style={{ color: BROWN }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Once dismissed, the seal alone stays to reopen the decree */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open the ${title}`}
        aria-haspopup="dialog"
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 rounded-full"
        style={{
          ...slide(sealShown),
          opacity: sealShown ? 1 : 0,
          transform: sealShown ? "none" : "scale(0.5) rotate(-40deg)",
        }}
      >
        <BrassSeal className="relative h-12 w-12" />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} label={title}>
        <div className="parchment relative mb-3 mt-1 rounded-[3px] border border-[#A27A3C]/70 text-center">
          <div className={`rounded-[3px] px-6 pb-12 pt-8 ${RULES}`}>
            {odia && (
              <p lang="or" className="odia text-base text-sindoor/85">
                {odia}
              </p>
            )}
            <h2 className="text-[2rem] leading-tight" style={{ color: INK }}>
              {label}
            </h2>
            <p className="font-display text-sm italic" style={{ color: BROWN }}>
              {gloss}
            </p>
            <Flourish />

            {notices.length > 0 ? (
              <ol className="mt-6 space-y-6">
                {notices.map((n, i) => (
                  <li key={n.title}>
                    {i > 0 && <span aria-hidden className="mx-auto mb-6 block h-1.5 w-1.5 rotate-45 bg-[#A27A3C]/70" />}
                    <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-sindoor">{n.title}</p>
                    <p className="mx-auto mt-1.5 max-w-[19rem] font-display text-[1.1rem] leading-snug" style={{ color: INK }}>
                      {n.text}
                    </p>
                    {n.link && (
                      <a
                        href={n.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-sindoor underline decoration-sindoor/40 underline-offset-4"
                      >
                        {n.link.label}
                        <span aria-hidden>↗</span>
                      </a>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-6">
                <Pending label="Notices awaiting confirmation from the family">
                  <p className="font-display text-sm italic">Parking, RSVP deadline, live stream</p>
                </Pending>
              </div>
            )}
          </div>
          <BrassSeal className="absolute -bottom-5 -right-3 h-[4.5rem] w-[4.5rem] rotate-[10deg]" />
        </div>
      </Sheet>
    </>
  );
}

/** A thin rule with a diamond, beneath the decree's title. */
function Flourish() {
  return (
    <span aria-hidden className="mx-auto mt-4 flex w-40 items-center gap-2">
      <span className="h-px flex-1 bg-gradient-to-l from-[#A27A3C]/70 to-transparent" />
      <span className="h-1.5 w-1.5 rotate-45 bg-[#A27A3C]/80" />
      <span className="h-px flex-1 bg-gradient-to-r from-[#A27A3C]/70 to-transparent" />
    </span>
  );
}

/** Motion for the banner and seal; hidden ones also leave the tab order. */
function slide(shown: boolean): CSSProperties {
  return {
    visibility: shown ? "visible" : "hidden",
    transition: `transform ${MOVE_MS}ms ${EASE.silk}, opacity ${MOVE_MS}ms ${EASE.silk}, visibility 0s linear ${shown ? 0 : MOVE_MS}ms`,
  };
}

/** True while the closing screens (thank-you, footer) are on screen. */
function useClosingInView(): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const els = ["thank-you", "closing"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0 || !("IntersectionObserver" in window)) return;
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        setInView(visible.size > 0);
      },
      { threshold: 0.2 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return inView;
}
