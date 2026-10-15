import { useEffect, useRef, useState, type FormEvent } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { BackendError, backendReady, newId, submitRsvp } from "@/lib/backend";
import { EASE } from "@/lib/motion";
import { formatVenueDate, parseVenueDateTime, venueDateKey } from "@/lib/venueTime";
import { BlessingBloom } from "@/components/art/RsvpArt";
import { Button } from "@/components/ui/Button";
import { controlClass, Field, Honeypot } from "@/components/ui/Field";

const SAVED_KEY = "tila:rsvp";
const CELEBRATE_MS = 1700;

type Phase = "invite" | "celebrate" | "form" | "done";
interface SavedResponse {
  name: string;
  attending: boolean;
  attendees: number;
}

function readSaved(): SavedResponse | null {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "null") as SavedResponse | null;
  } catch {
    return null;
  }
}

function rsvpClosed(): boolean {
  const { deadline } = wedding.rsvp;
  return Boolean(deadline && venueDateKey(Date.now(), wedding.wedding.timeZone) > deadline);
}

/**
 * Section 08 — RSVP (The Jhoti Welcome).
 * One clean card on rich crimson, framed by crisp white-ink jhoti / chita
 * lines (the rice-paste patterns drawn at Odia doorsteps to welcome guests).
 * Accepting blooms a gold blessing ornament and reveals the quotation before
 * the form appears; the buttons are solid mustard gold. A success state is
 * shown only after the response is saved.
 */
export function Rsvp() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.2 });

  return (
    <section
      ref={ref}
      id="rsvp"
      aria-labelledby="rsvp-heading"
      data-status-tone="light"
      className="px-4 py-24"
      style={{ backgroundColor: "#800000" }}
    >
      <div
        className="jhoti-frame relative mx-auto max-w-[23rem]"
        style={{
          clipPath: inView ? "inset(0 0 0 0)" : "inset(50% 0 50% 0)",
          transition: `clip-path 1300ms ${EASE.temple}`,
        }}
      >
        <div className="relative rounded-2xl bg-[#FFFDF8] px-6 pb-9 pt-8 text-center shadow-[0_18px_40px_-20px_rgb(0_0_0/0.7)]">
          <div className="relative" style={{ opacity: inView ? 1 : 0, transition: `opacity 800ms ${EASE.silk} 900ms` }}>
            <RsvpBody />
          </div>
        </div>
      </div>
    </section>
  );
}

function RsvpBody() {
  const { invitationLine, heading, explanation, quote, maxAttendees, deadline } = wedding.rsvp;
  const { guestName, isPersonalized } = useGuest();
  const reducedMotion = usePrefersReducedMotion();

  const [saved, setSaved] = useState<SavedResponse | null>(readSaved);
  const [phase, setPhase] = useState<Phase>(saved ? "done" : "invite");
  const [accepted, setAccepted] = useState(false);

  // Form state
  const [name, setName] = useState(isPersonalized ? guestName : "");
  const [attending, setAttending] = useState<boolean>(true);
  const [attendees, setAttendees] = useState(1);
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const responseId = useRef(newId()); // same id on retry → no duplicate rows

  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (phase !== "celebrate") return;
    const t = window.setTimeout(() => setPhase("form"), reducedMotion ? 0 : CELEBRATE_MS);
    return () => clearTimeout(t);
  }, [phase, reducedMotion]);

  const deadlineDate = (() => {
    const p = parseVenueDateTime(deadline);
    const f = p && formatVenueDate(p);
    return f ? `${f.day} ${f.month} ${f.year}` : null;
  })();

  const accept = () => {
    setAccepted(true);
    setAttending(true);
    setPhase("celebrate");
  };
  const decline = () => {
    setAccepted(false);
    setAttending(false);
    setPhase("form");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const n = name.trim();
    if (!n) return setNameError("Please add your name.");
    if (n.length > 80) return setNameError("Please keep your name under 80 characters.");
    setNameError(null);

    const response: SavedResponse = { name: n, attending, attendees: attending ? attendees : 0 };
    if (trap) {
      setSaved(response); // bot: look successful, store nothing
      setPhase("done");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await submitRsvp({
        id: responseId.current,
        name: n,
        attending,
        attendees: response.attendees,
        message: message.trim() || null,
        guest_key: isPersonalized ? guestName : null,
      });
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify(response));
      } catch {
        /* fine — only affects what shows on a revisit */
      }
      setSaved(response);
      setPhase("done");
      requestAnimationFrame(() => headingRef.current?.focus());
    } catch (err) {
      setError(err instanceof BackendError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const startAnother = () => {
    responseId.current = newId();
    setName("");
    setMessage("");
    setAttendees(1);
    setAttending(true);
    setError(null);
    setPhase("form");
  };

  // ── Done ──
  if (phase === "done" && saved) {
    const first = saved.name.split(" ")[0];
    return (
      <div aria-live="polite">
        <BlessingBloom open className="mx-auto h-20 w-20" />
        <h2 id="rsvp-heading" ref={headingRef} tabIndex={-1} className="mt-3 text-[1.9rem] focus:outline-none">
          Thank you, {first}!
        </h2>
        <p className="mt-3 text-[0.875rem] leading-relaxed">
          {saved.attending
            ? `Your response has been saved. We can't wait to celebrate with you${saved.attendees > 1 ? ` — all ${saved.attendees} of you` : ""}.`
            : "Your response has been saved. You'll be dearly missed — thank you for your blessings."}
        </p>
        <p className="mt-5 text-xs text-ink-soft">
          Replying for someone else, or need to change your answer?{" "}
          <button type="button" onClick={startAnother} className="font-medium text-sindoor underline underline-offset-4">
            Send another response
          </button>
        </p>
      </div>
    );
  }

  const intro = (
    <>
      <p className="font-display text-[1.05rem] italic text-ink-soft">{invitationLine}</p>
      <h2 id="rsvp-heading" className="mt-3 text-[2rem] leading-tight">
        {heading}
      </h2>
    </>
  );

  // ── Closed / unavailable ──
  if (rsvpClosed() || !backendReady) {
    return (
      <div>
        {intro}
        <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-soft">
          {rsvpClosed()
            ? `Responses closed on ${deadlineDate}. Please contact the family directly.`
            : "Online responses will open soon. Meanwhile, please reach out to the family directly."}
        </p>
        {wedding.contact.people.length > 0 && (
          <a href="#contact" className="mt-5 inline-block text-[0.75rem] font-medium uppercase tracking-[0.14em] text-sindoor underline underline-offset-4">
            Contact the family
          </a>
        )}
      </div>
    );
  }

  // ── Invite / celebrate / form ──
  return (
    <div>
      {intro}

      {phase === "invite" && (
        <>
          <p className="mt-4 text-[0.875rem] leading-relaxed">
            {explanation}
            {deadlineDate && <span className="mt-1 block text-ink-soft">Kindly reply by {deadlineDate}.</span>}
          </p>
          <div className="mt-7 flex flex-col items-center gap-2">
            <Button variant="gold" onClick={accept} className="w-full max-w-[15rem] text-[0.9375rem]">
              Accept Invitation
            </Button>
            <button type="button" onClick={decline} className="min-h-11 text-[0.8125rem] font-medium text-ink-soft underline decoration-gold/70 underline-offset-4">
              Unable to Attend
            </button>
          </div>
        </>
      )}

      {accepted && phase !== "invite" && (
        <div className="mt-5">
          <BlessingBloom open={phase === "celebrate" || phase === "form"} className="mx-auto h-24 w-24" />
          <p
            className="mt-3 font-display text-[1.2rem] italic leading-snug text-sindoor"
            style={{ opacity: 1, animation: reducedMotion ? undefined : `fade-in 900ms ${EASE.silk} 450ms both` }}
          >
            “{quote}”
          </p>
        </div>
      )}

      {phase === "form" && (
        <form
          onSubmit={onSubmit}
          noValidate
          className="relative mt-7 space-y-4"
          style={{ animation: reducedMotion ? undefined : `fade-in 700ms ${EASE.silk} both` }}
        >
          <Field label="Your name" error={nameError}>
            <input className={controlClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} />
          </Field>

          <fieldset className="text-left">
            <legend className="mb-1.5 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ink-soft">Will you attend?</legend>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: true, label: "Joyfully accepts" },
                { value: false, label: "Regretfully declines" },
              ].map((o) => (
                <label
                  key={String(o.value)}
                  className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-2 text-center text-[0.8125rem] transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sindoor/40 ${attending === o.value ? "border-sindoor bg-sindoor/5 font-medium text-sindoor" : "border-gold/55 text-ink"}`}
                >
                  <input
                    type="radio"
                    name="attending"
                    className="sr-only"
                    checked={attending === o.value}
                    onChange={() => setAttending(o.value)}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>

          {attending && maxAttendees > 1 && (
            <Field label="Number of guests" hint={`Including you · up to ${maxAttendees}`}>
              <select className={controlClass} value={attendees} onChange={(e) => setAttendees(Number(e.target.value))}>
                {Array.from({ length: maxAttendees }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Message for the couple" optional>
            <textarea className={`${controlClass} min-h-24 resize-y`} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={3} />
          </Field>
          <Honeypot value={trap} onChange={setTrap} />

          <Button variant="gold" type="submit" disabled={saving} className="w-full">
            {saving ? "Sending…" : "Send Response"}
          </Button>
          <p role="alert" className="min-h-5 text-center text-[0.8125rem] font-medium text-sindoor">
            {error}
          </p>
        </form>
      )}
    </div>
  );
}
