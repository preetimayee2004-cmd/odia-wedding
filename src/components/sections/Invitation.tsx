import { useState, type CSSProperties, type ReactNode } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { EASE } from "@/lib/motion";
import { formatVenueDate, parseVenueDateTime } from "@/lib/venueTime";
import { TempleDoors } from "@/components/opening/TempleDoors";
import { Pending } from "@/components/ui/Pending";

export type RevealState = "hidden" | "revealing" | "shown";

interface InvitationProps {
  reveal: RevealState;
  /** Mounts the next sections and jumps to them (behind the closed doors). */
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
const TREES_FROM = 870; // the bottom banana leaves begin here
const PANEL_EDGE = 62; // the dotted inner border, in from each side

/**
 * The right-hand hanging brass lamp, lifted out of the card so it can sway:
 * `patch` paints the card's own lamp out with clean paper; `lamp` is the
 * lamp on a transparent ground. Box in card px; it hangs from its chain at
 * the top centre. Flames as fractions of the box.
 */
const LAMP = {
  patch: "/art/invitation-lamp-patch.png",
  src: "/art/invitation-lamp-lamp.png",
  x: 596,
  y: 386,
  w: 72,
  h: 104,
  flames: [
    [0.11, 0.635],
    [0.86, 0.635],
  ],
};
const LIGHT_MS = 600; // the flame glows before the doors

const INK = "#4A2C1A";
const MAROON = "#8A1C2B";
const GOLD = "#B8863B";
const LINE_STAGGER = 150;
const LINE_DURATION = 800;

type Stage = "idle" | "lit" | "doors";

/**
 * Section 02 — The invitation card.
 * The words sit centred on the card's cream panel between the deities and
 * the banana trees. The right-hand brass lamp sways and glows, inviting a
 * tap: its flames light up, then the screen becomes two carved temple doors
 * that swing open onto the next section.
 */
export function Invitation({ reveal, onOpen }: InvitationProps) {
  const { guestName } = useGuest();
  const { couple, invitation } = wedding;
  const reducedMotion = usePrefersReducedMotion();
  const [stage, setStage] = useState<Stage>("idle");

  const show = reveal !== "hidden";
  const parts = parseVenueDateTime(wedding.wedding.dateTime);
  const date = parts && formatVenueDate(parts);
  const { name: venueName, city } = wedding.venue;

  const tapLamp = () => {
    if (stage !== "idle") return;
    if (reducedMotion) {
      void onOpen();
      return;
    }
    setStage("lit");
    window.setTimeout(() => setStage("doors"), LIGHT_MS);
  };

  const line = (order: number): CSSProperties => {
    const delay = 250 + order * LINE_STAGGER;
    return {
      opacity: show ? 1 : 0,
      transform: show ? "none" : "translateY(10px)",
      transition: `opacity ${LINE_DURATION}ms ${EASE.silk} ${delay}ms, transform ${LINE_DURATION}ms ${EASE.silk} ${delay}ms`,
    };
  };

  const lines: ReactNode[] = [
    <p key="h" className="mb-3.5 font-display text-[1.05rem] font-semibold tracking-[0.12em]" style={{ color: MAROON }}>
      {invitation.heading}
    </p>,
    <p key="g" className="mb-4 font-display text-[20px] italic leading-tight">
      {invitation.greeting.replace("{guest}", guestName)}
    </p>,
    <Divider key="d1" className="mb-4" />,
    <p key="m" className="font-display text-[15.5px] leading-[1.7]">
      {invitation.message}
    </p>,
    <h1 key="n" className="my-3 flex flex-wrap items-center justify-center gap-x-2.5 font-normal leading-[1.1]" style={{ color: MAROON }}>
      <span className="font-script text-[46px]">{couple.bride.displayName}</span>
      <span className="font-script text-[27.6px]" style={{ color: GOLD }}>
        &amp;
      </span>
      <span className="font-script text-[46px]">{couple.groom.displayName}</span>
    </h1>,
    <Divider key="d2" className="mb-5" />,
    <p key="b" className="font-display text-[15.5px] leading-[1.7]">
      {invitation.blessing}
    </p>,
    <div key="w" className="mt-5 text-[0.7rem] font-medium uppercase leading-relaxed tracking-[0.14em] opacity-80">
      {date ? (
        <time dateTime={wedding.wedding.dateTime!} className="block">
          {date.weekday} · {date.day} {date.month} {date.year}
          {date.time && ` · ${date.time}`}
        </time>
      ) : (
        <Pending label="Wedding date awaiting confirmation">Weekday · Day Month Year</Pending>
      )}
      <span className="mt-1 block">
        {venueName ? (
          [venueName, city].filter(Boolean).join(", ")
        ) : (
          <Pending label="Venue awaiting confirmation">Venue, City</Pending>
        )}
      </span>
    </div>,
  ];

  const lit = stage !== "idle";

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

      {/* The card's own lamp, painted out (it hangs, live, just below) */}
      <img
        src={LAMP.patch}
        alt=""
        aria-hidden
        className="absolute z-[15] max-w-none"
        style={{ left: cq(LAMP.x), top: cq(LAMP.y), width: cq(LAMP.w), height: cq(LAMP.h) }}
      />

      <div
        className="relative z-20 flex flex-col"
        style={{
          // Always tall enough for the card's top and bottom plus one band of middle
          minHeight: `max(100dvh, ${cq(CARD.top + 70 + CARD.h - CARD.bottomFrom)})`,
          paddingTop: cq(DEITIES_BASE),
          paddingBottom: cq(CARD.h - TREES_FROM),
          color: INK,
        }}
      >
        {/* Centred in the free space between the deities and the banana trees */}
        <div className="my-auto py-5 text-center" style={{ paddingInline: `calc(${cq(PANEL_EDGE)} + 28px)` }}>
          {lines.map((node, i) => (
            <div key={i} style={line(i)}>
              {node}
            </div>
          ))}
        </div>
      </div>

      {/* The hanging brass lamp: sways and glows; tap it to enter */}
      <button
        type="button"
        onClick={tapLamp}
        aria-label="Tap the lamp to open the invitation"
        aria-controls="couple"
        className="absolute z-30 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#B8863B]/70"
        style={{
          left: cq(LAMP.x - 12),
          top: cq(LAMP.y - 6),
          width: cq(LAMP.w + 24),
          height: cq(LAMP.h + 14),
          opacity: show ? 1 : 0,
          transition: `opacity 900ms ${EASE.silk} 600ms`,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span
          className={`absolute ${lit ? "" : "lamp-sway"}`}
          style={{ left: cq(12), top: cq(6), width: cq(LAMP.w), height: cq(LAMP.h) }}
        >
          {/* Soft breathing glow, inviting a tap */}
          <span
            aria-hidden
            className={`absolute inset-[-30%] rounded-full ${lit ? "" : "lamp-glow"}`}
            style={{
              background: "radial-gradient(circle at 50% 62%, rgb(255 214 120 / 0.55), rgb(255 200 100 / 0.18) 45%, transparent 68%)",
              opacity: lit ? 0 : undefined,
            }}
          />
          <img src={LAMP.src} alt="" aria-hidden className="absolute inset-0 h-full w-full max-w-none" />
          {/* The flames light up when tapped */}
          {LAMP.flames.map(([fx, fy]) => (
            <span
              key={fx}
              aria-hidden
              className="absolute aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${fx * 100}%`,
                top: `${fy * 100}%`,
                background: "radial-gradient(circle, rgb(255 246 214 / 0.95) 0%, rgb(255 196 90 / 0.65) 30%, rgb(255 160 60 / 0.2) 55%, transparent 70%)",
                opacity: lit ? 1 : 0,
                transform: `translate(-50%, -50%) scale(${lit ? 1.25 : 0.6})`,
                transition: `opacity 260ms ease-out, transform ${LIGHT_MS}ms ${EASE.silk}`,
              }}
            />
          ))}
          <span
            aria-hidden
            className="absolute left-1/2 top-[63%] aspect-square w-[260%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: "radial-gradient(circle, rgb(255 214 130 / 0.5), rgb(255 190 90 / 0.15) 45%, transparent 68%)",
              opacity: lit ? 1 : 0,
              transition: `opacity ${LIGHT_MS}ms ease-out`,
            }}
          />
        </span>
      </button>
      <p
        aria-hidden
        className="pointer-events-none absolute z-30 -translate-x-1/2 whitespace-nowrap font-display text-[12px] italic"
        style={{
          left: cq(LAMP.x + LAMP.w / 2 - 30),
          top: cq(LAMP.y + LAMP.h + 4),
          color: "#6B4A22",
          opacity: show && !lit ? 0.9 : 0,
          transition: `opacity 700ms ${EASE.silk} ${lit ? 0 : 900}ms`,
        }}
      >
        Tap the lamp
      </p>

      {stage === "doors" && <TempleDoors behind={onOpen} onDone={() => setStage("idle")} />}
    </section>
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
