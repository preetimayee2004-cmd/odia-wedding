import { useRef, useState } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { BackendError, backendReady, newId, submitRsvp } from "@/lib/backend";
import { canAddToCalendar, downloadWeddingCalendar } from "@/lib/calendar";
import { EASE } from "@/lib/motion";
import { showPlaceholders } from "@/lib/placeholders";
import { formatVenueDate, parseVenueDateTime, venueDateKey } from "@/lib/venueTime";
import { AcceptPlaque, LotusConfirm, RiceShower } from "@/components/art/RsvpArt";
import { hasContactNumbers } from "@/components/sections/Contact";
import { Dock } from "@/components/ui/Dock";

const SAVED_KEY = "tila:rsvp";
const MAROON = "#7A1424";
const RED = "#A51C1C";
const STONE = "#B8893A";

function hasAccepted(): boolean {
  try {
    return localStorage.getItem(SAVED_KEY) !== null;
  } catch {
    return false;
  }
}

function rsvpClosed(): boolean {
  const { deadline } = wedding.rsvp;
  return Boolean(deadline && venueDateKey(Date.now(), wedding.wedding.timeZone) > deadline);
}

const coupleNames = () => wedding.invitation.names.join(" & ");
const withNames = (text: string) => text.replace("{names}", coupleNames());

/**
 * Without a database on the live site (no Supabase keys yet), while the site
 * shows its full structure, Accept still plays the seal as a preview —
 * nothing is saved, and the seal says so. Otherwise, without a database the
 * design shows with a note to contact the family in place of the button.
 */
const PREVIEW = !backendReady && showPlaceholders;
const PREVIEW_NOTE = "Preview — online responses aren't being saved yet.";

/**
 * Section 08 — Kindly RSVP, after the couple's design.
 * Between the side bands on the flowered cream, under the section heading:
 * "|| ଶ୍ରୀ ଗଣେଶାୟ ନମଃ ||", "|| ଶୁଭ ବିବାହ ||", An Auspicious
 * Invitation and its words; a brass thali of gua with marigolds, rose petals
 * and two lit diyas (the couple's image); "Accept the Sacred Gua & Bless Us"
 * and an ornate maroon Accept Invitation plaque; Jai Jagannath. One tap
 * accepts: a lotus blooms over a golden glow into a gold-ringed seal with a
 * white tick as petals scatter and turmeric rice showers down, over "RSVP
 * Confirmed · ଧନ୍ୟବାଦ · Thank you!", a blessing card and Add to Calendar. The
 * acceptance is saved under the guest's name from their invitation link.
 */
export function Rsvp() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.15 });

  return (
    <section ref={ref} id="rsvp" aria-labelledby="rsvp-heading" className="py-20 text-center" style={{ paddingInline: "calc(100% * 35 / 768 + 18px)" }}>
      <div
        className="mx-auto max-w-[24rem]"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "translateY(14px)",
          transition: `opacity 900ms ${EASE.silk}, transform 1000ms ${EASE.silk}`,
        }}
      >
        <Dock name="rsvp" />
        {/* The section heading, as on every section */}
        <h2 id="rsvp-heading" className="t-heading" style={{ color: MAROON }}>
          {wedding.rsvp.heading}
        </h2>
        <span aria-hidden className="mx-auto mt-4 flex w-40 items-center gap-2">
          <span className="h-px flex-1" style={{ backgroundImage: `linear-gradient(to left, ${STONE}, transparent)` }} />
          <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: STONE }} />
          <span className="h-px flex-1" style={{ backgroundImage: `linear-gradient(to right, ${STONE}, transparent)` }} />
        </span>

        <div className="mt-8">
          <RsvpBody />
        </div>
      </div>
    </section>
  );
}

function RsvpBody() {
  const r = wedding.rsvp;
  const { guestName, isPersonalized } = useGuest();
  const [accepted, setAccepted] = useState(hasAccepted);
  const [justAccepted, setJustAccepted] = useState(false); // the rice shower plays only on the tap
  const [error, setError] = useState<string | null>(null);
  const responseId = useRef(newId()); // same id on retry → no duplicate rows

  const deadlineDate = (() => {
    const p = parseVenueDateTime(r.deadline);
    const f = p && formatVenueDate(p);
    return f ? `${f.day} ${f.month} ${f.year}` : null;
  })();

  /** Saves the acceptance under the guest's name from their link; the seal shows straight away. */
  const save = async () => {
    setError(null);
    try {
      await submitRsvp({
        id: responseId.current,
        name: guestName,
        attending: true,
        attendees: 1,
        message: null,
        guest_key: isPersonalized ? guestName : null,
      });
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify({ name: guestName, attending: true }));
      } catch {
        /* fine — only affects what shows on a revisit */
      }
    } catch (err) {
      setError(err instanceof BackendError ? err.message : "Something went wrong. Please try again.");
    }
  };

  const accept = () => {
    setAccepted(true);
    setJustAccepted(true);
    if (!PREVIEW) void save();
  };

  if (accepted) return <Confirmation preview={PREVIEW} error={error} onRetry={save} shower={justAccepted} />;

  // Closed, or no database and not a preview: the design, with a note instead of the button
  const unavailable = rsvpClosed() || (!backendReady && !PREVIEW);

  return (
    <div>
      {r.invocationOdia && (
        <p lang="or" className="font-odia text-[14px] font-medium leading-normal" style={{ color: "var(--c-blessing)" }}>
          {r.invocationOdia}
        </p>
      )}
      {r.titleOdia && (
        <p
          lang="or"
          className="mx-auto mt-3 font-odia text-[30px] font-bold leading-[1.45]"
          style={{ color: RED }}
        >
          {r.titleOdia}
        </p>
      )}
      <p className="t-label mt-5 text-[13px]" style={{ color: "var(--c-text)" }}>
        {r.eyebrow}
      </p>
      <p className="t-body mx-auto mt-2 max-w-[21rem]">{withNames(r.explanation)}</p>

      {/* The offering of gua: the couple's image, its paper edges fading into the page */}
      <img
        src="/art/rsvp-gua-thali.webp"
        width={372}
        height={381}
        alt="A brass thali of gua and sweets with marigolds and rose petals, beside two lit diyas"
        loading="lazy"
        decoding="async"
        className="mx-auto mt-4 block h-auto w-full max-w-[21rem]"
        style={{
          WebkitMaskImage: "radial-gradient(closest-side, #000 72%, transparent 100%)",
          maskImage: "radial-gradient(closest-side, #000 72%, transparent 100%)",
        }}
      />

      <h3 className="mx-auto mt-3 max-w-[20rem] font-serif text-[26px] font-semibold leading-tight [text-wrap:balance]" style={{ color: "var(--c-text)" }}>
        {r.offerHeading}
      </h3>
      <p className="t-quote mx-auto mt-1.5 max-w-[20rem] text-[17px]">{r.offerText}</p>
      {deadlineDate && !unavailable && <p className="t-note mt-1">Kindly reply by {deadlineDate}.</p>}

      {unavailable ? (
        <div className="mt-6">
          <p className="t-body text-ink-soft">
            {rsvpClosed()
              ? `Responses closed on ${deadlineDate}. Please contact the family directly.`
              : "Online responses will open soon. Meanwhile, please reach out to the family directly."}
          </p>
          {hasContactNumbers && (
            <a href="#contact" className="t-button mt-4 inline-block text-sindoor underline underline-offset-4">
              Contact the family
            </a>
          )}
        </div>
      ) : (
        /* The ornate Accept plaque: one tap accepts */
        <button
          type="button"
          onClick={accept}
          aria-label={r.acceptLabel}
          className="relative mx-auto mt-6 block w-full max-w-[21rem] transition-transform duration-200 ease-silk active:scale-[0.98]"
        >
          <AcceptPlaque className="block h-auto w-full drop-shadow-[0_10px_14px_rgb(70_20_10/0.3)]" />
          <span aria-hidden className="absolute inset-x-[12%] bottom-[6%] top-[20%] flex flex-col items-center justify-center leading-tight text-[#F3D98C]">
            <span className="t-button text-[13px]">{r.acceptLabel}</span>
            {r.acceptOdia && <span className="mt-0.5 font-odia text-[14px] font-medium">{r.acceptOdia}</span>}
          </span>
        </button>
      )}

      {/* Jai Jagannath */}
      <p className="t-label mt-6 text-[12px]" style={{ color: "var(--c-text)" }}>
        {r.closing}
        {r.closingOdia && (
          <>
            {" · "}
            <span lang="or" className="font-odia text-[13px] font-medium normal-case tracking-normal">
              {r.closingOdia}
            </span>
          </>
        )}
      </p>
    </div>
  );
}

/** After Accept: the lotus seal, thanks, a blessing card, and Add to Calendar. */
function Confirmation({ preview, error, onRetry, shower }: { preview: boolean; error: string | null; onRetry: () => void; shower: boolean }) {
  const c = wedding.rsvp.confirmed;
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { threshold: 0.3 });

  return (
    <div ref={ref} aria-live="polite">
      <LotusConfirm play={seen} still={reduced} className="mx-auto h-[12.5rem] w-[12.5rem]" />
      {shower && !reduced && <RiceShower />}

      <p className="t-label mt-5 text-[13px] tracking-[3px]" style={{ color: "var(--c-text)" }}>
        {c.label}
      </p>
      {c.odia && (
        <p lang="or" className="t-odia mt-2 text-[24px]">
          {c.odia}
        </p>
      )}
      <h3 className="t-heading mt-1 text-[44px]" style={{ color: "var(--c-text)" }}>
        {c.heading}
      </h3>
      <p className="t-body mt-2 text-[20px]" style={{ color: "var(--c-muted)" }}>
        {c.line}
        <br />
        <span className="font-semibold" style={{ color: "var(--c-text)" }}>
          {coupleNames()}
        </span>
      </p>

      {/* The blessing, on a cream card */}
      <figure className="relative mt-9 rounded-2xl border border-[#E9D6AC] bg-[#FFFBF3] px-6 pb-6 pt-8 shadow-[0_14px_30px_-20px_rgb(60_30_10/0.4)]">
        <span aria-hidden className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-[#FFFBF3] px-3 font-serif text-[44px] leading-[0.8]" style={{ color: "var(--c-gold)" }}>
          “
        </span>
        <blockquote className="t-quote" style={{ color: "var(--c-text)" }}>
          {c.quote}
        </blockquote>
        {c.quoteOdia && (
          <p lang="or" className="t-odia mt-3 text-[16px]">
            {c.quoteOdia}
          </p>
        )}
        <figcaption className="t-label mt-3">— {withNames(c.signoff)}</figcaption>
      </figure>

      {canAddToCalendar() && (
        <button
          type="button"
          onClick={downloadWeddingCalendar}
          className="t-button mt-7 h-14 w-full rounded-full text-white shadow-[0_12px_24px_-12px_rgb(165_28_28/0.7)] transition-transform duration-200 ease-silk active:scale-[0.98]"
          style={{ backgroundColor: RED }}
        >
          Add to Calendar
        </button>
      )}

      {preview && <p className="t-note mt-5 font-medium">{PREVIEW_NOTE}</p>}
      {error && (
        <p role="alert" className="t-note mt-5 font-medium text-sindoor">
          {error}{" "}
          <button type="button" onClick={onRetry} className="underline underline-offset-4">
            Try again
          </button>
        </p>
      )}
    </div>
  );
}
