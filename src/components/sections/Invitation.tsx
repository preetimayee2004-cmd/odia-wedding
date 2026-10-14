import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { EASE } from "@/lib/motion";
import { RangoliStart } from "@/components/sections/RangoliStart";

export type RevealState = "hidden" | "revealing" | "shown";

interface InvitationProps {
  reveal: RevealState;
  /** Mounts the next sections and jumps to them (behind the golden wash). */
  onOpen: () => Promise<void>;
}

/**
 * The invitation card artwork (768×1376). Its decorated top (garlands,
 * Jagannath, Balabhadra and Subhadra) and bottom (banana trees, kalash) are
 * kept whole; a plain 70px band of its middle (border and dotted lines only)
 * repeats between them, so the card fills any screen height undistorted.
 */
const CARD = { src: "/art/invitation-card.jpg", middle: "/art/invitation-card-middle.png", w: 768, h: 1376, top: 580, bottomFrom: 650 };
// Lengths in card pixels → container width units (the card spans the section's width).
const cq = (px: number) => `${((px / CARD.w) * 100).toFixed(3)}cqw`;
const DEITIES_BASE = 490; // the deities' platform ends here (card px)
const PANEL_BOTTOM = 1262; // the cream panel's bottom dotted line (card px)
const PANEL_EDGE = 62; // the dotted inner border, in from each side

const INK = "#2E1A10";
const MAROON = "#7A1424";
const GOLD = "#B8863B";
const DARK_GOLD = "#8F6420";
const LINE_STAGGER = 150;
const LINE_DURATION = 800;
const RANGOLI_SIZE = 124;
// Each half of the opening line, measured in EB Garamond 600, is up to
// 27.2 × its font size wide (27.6 leaves a little slack); sized to fit one line.
const QUOTE_WIDTH_PER_PX = 27.6;
// Never shrink the words below this to fit the screen; scroll instead.
const MIN_FIT = 0.72;

/**
 * Section 02 — The invitation card.
 * The whole card fits one screen: the words sit on its cream panel, centred
 * between the deities and a colourful jhoti rangoli standing between the
 * banana trees, and shrink just enough to fit the space between them. The
 * rangoli is the way in: tapped (or after a pause) it spins into a golden
 * wash that fades into the Couple section.
 */
export function Invitation({ reveal, onOpen }: InvitationProps) {
  const { guestName } = useGuest();
  const { invitation } = wedding;
  const [first, second] = invitation.names;

  const show = reveal !== "hidden";
  const areaRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  useFitToArea(areaRef, blockRef);

  const line = (order: number): CSSProperties => {
    const delay = 250 + order * LINE_STAGGER;
    return {
      opacity: show ? 1 : 0,
      transform: show ? "none" : "translateY(10px)",
      transition: `opacity ${LINE_DURATION}ms ${EASE.silk} ${delay}ms, transform ${LINE_DURATION}ms ${EASE.silk} ${delay}ms`,
    };
  };

  const lines: ReactNode[] = [
    <p key="h" className="mb-1.5 text-[14px] font-bold tracking-[0.15em]" style={{ color: MAROON }}>
      {invitation.heading}
    </p>,
    <p key="g" className="mb-1.5 text-[17px] font-semibold italic leading-tight">
      {invitation.greeting.replace("{guest}", guestName)}
    </p>,
    <Divider key="d1" className="mb-2" />,
    // Exactly two lines, each sized to fit the width inside the dotted border
    <p
      key="m"
      className="-mx-[22px] mb-2.5 font-semibold leading-[1.5]"
      style={{ fontSize: `min(17.5px, calc((100cqw - 2 * (${cq(PANEL_EDGE)} + 6px)) / ${QUOTE_WIDTH_PER_PX}))` }}
    >
      {invitation.message.map((half) => (
        <span key={half} className="block whitespace-nowrap">
          {half}
        </span>
      ))}
    </p>,
    <p key="s" className="text-[12px] font-bold tracking-[0.3em] [font-variant-caps:small-caps]" style={{ color: DARK_GOLD }}>
      {invitation.saveTheDate}
    </p>,
    // The names, one above the other with the ampersand between
    <h1 key="n" className="flex flex-col items-center font-normal leading-[1.05]" style={{ color: MAROON }}>
      <span className="font-script text-[36px]">{first}</span>
      <span className="font-script text-[21.6px] leading-none" style={{ color: GOLD }}>
        &amp;
      </span>
      <span className="font-script text-[36px]">{second}</span>
    </h1>,
    <p key="a" className="mb-1.5 text-[16px] font-semibold italic">
      {invitation.announcement}
    </p>,
    <Divider key="d2" className="mb-1.5" />,
    invitation.dateLine && (
      <p key="dt" className="mb-1 text-[19px] font-bold leading-snug" style={{ color: MAROON }}>
        {invitation.dateLine}
      </p>
    ),
    invitation.place && (
      <div key="pl" className="flex flex-col items-center">
        <PinIcon />
        <p className="mt-0.5 max-w-[15rem] text-[14.5px] font-semibold leading-snug">{invitation.place}</p>
      </div>
    ),
  ].filter(Boolean);

  return (
    <section
      id="invitation"
      aria-label="Wedding invitation"
      data-status-tone="light"
      className="relative [container-type:inline-size]"
    >
      {/* The card: whole top, repeating plain middle, whole bottom */}
      <div aria-hidden className="absolute inset-0 flex flex-col">
        <div
          className="relative z-10 shrink-0"
          style={{ height: cq(CARD.top), backgroundImage: `url(${CARD.src})`, backgroundSize: "100% auto", backgroundPosition: "top", backgroundRepeat: "no-repeat" }}
        />
        <div
          className="-my-px flex-1"
          style={{ backgroundImage: `url(${CARD.middle})`, backgroundSize: "100% auto", backgroundRepeat: "no-repeat round" }}
        />
        <div
          className="relative z-10 shrink-0"
          style={{ height: cq(CARD.h - CARD.bottomFrom), backgroundImage: `url(${CARD.src})`, backgroundSize: "100% auto", backgroundPosition: "bottom", backgroundRepeat: "no-repeat" }}
        />
      </div>

      <div
        className="relative z-20 flex flex-col"
        style={{
          // One screen tall; never shorter than the card's own top and bottom
          minHeight: `max(100dvh, ${cq(CARD.top + CARD.h - CARD.bottomFrom)})`,
          paddingTop: cq(DEITIES_BASE),
          paddingBottom: `calc(${cq(CARD.h - PANEL_BOTTOM)} + 4px)`,
          color: INK,
        }}
      >
        {/* The free space between the deities and the rangoli; the words are
            centred in it, shrunk if needed to fit */}
        <div ref={areaRef} className="relative min-h-0 flex-1">
          <div
            ref={blockRef}
            className="absolute inset-x-0 top-1/2 py-2 text-center font-serif"
            style={{ paddingInline: `calc(${cq(PANEL_EDGE)} + 28px)`, transform: "translateY(-50%)" }}
          >
            {lines.map((node, i) => (
              <div key={i} style={line(i)}>
                {node}
              </div>
            ))}
          </div>
        </div>

        {/* The way in: a rangoli in the clear space between the banana trees */}
        <div className="mt-2 flex shrink-0 justify-center">
          <RangoliStart active={show} onOpen={onOpen} size={RANGOLI_SIZE} />
        </div>
      </div>
    </section>
  );
}

/**
 * Scales `block` (absolutely positioned, centred) down to fit `area`. If it
 * would have to go below MIN_FIT, the area grows instead and the card scrolls.
 */
function useFitToArea(areaRef: RefObject<HTMLElement>, blockRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const area = areaRef.current;
    const block = blockRef.current;
    if (!area || !block) return;
    let frame = 0;
    const fit = () => {
      frame = 0;
      area.style.minHeight = "";
      const natural = block.offsetHeight;
      const avail = area.clientHeight;
      if (!natural || !avail) return;
      const scale = Math.min(1, Math.max(MIN_FIT, avail / natural));
      if (natural * scale > avail) area.style.minHeight = `${Math.ceil(natural * scale)}px`;
      block.style.transform = `translateY(-50%) scale(${scale.toFixed(4)})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(fit);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(area);
    ro.observe(block);
    window.addEventListener("resize", schedule);
    void document.fonts?.ready.then(schedule);
    fit();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [areaRef, blockRef]);
}

/** A small gold map pin with a lotus-bud head, above the place. */
function PinIcon() {
  return (
    <svg width="13" height="16" viewBox="0 0 16 20" aria-hidden>
      <path d="M8 19.2C4.4 14.6 1.6 11.4 1.6 7.7a6.4 6.4 0 0 1 12.8 0c0 3.7-2.8 6.9-6.4 11.5Z" fill={GOLD} />
      <path d="M8 4.2c1.5 1.3 1.9 3 0 4.8-1.9-1.8-1.5-3.5 0-4.8Z" fill="#FFF6DF" />
    </svg>
  );
}

/** A thin gold rule with a small diamond at its centre. */
function Divider({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`mx-auto flex w-36 items-center gap-2 ${className}`}>
      <span className="h-px flex-1" style={{ background: `linear-gradient(to left, ${GOLD}, transparent)` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: GOLD }} />
      <span className="h-px flex-1" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
    </span>
  );
}
