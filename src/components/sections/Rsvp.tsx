import { useEffect, useRef, useState, type FormEvent } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { BackendError, backendReady, newId, submitRsvp } from "@/lib/backend";
import { EASE } from "@/lib/motion";
import { formatVenueDate, parseVenueDateTime, venueDateKey } from "@/lib/venueTime";
import { AcceptPlaque, BlessingBloom, KalashArch } from "@/components/art/RsvpArt";
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
 * Section 08 — RSVP & Celebrations.
 * After the couple's design, on the page cream with its flowers between the
 * side bands: "|| ନମସ୍କାର ||", the question, and a few words of blessing; a
 * carved maroon arch holding a gold kalash; "Confirm Your Presence" and an
 * ornate maroon Accept button carrying its Odia too. Accepting blooms a gold
 * blessing and reveals the quotation, then the form, on a cream card. A
 * success state is shown only after the response is saved.
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
        <RsvpBody />
      </div>
    </section>
  );
}

/** The cream card the form and the thank-you sit on. */
const CARD = "mt-8 rounded-2xl border border-[#E9D6AC] bg-[#FFFDF8] px-5 pb-7 pt-6 shadow-[0_18px_40px_-22px_rgb(60_30_10/0.45)]";

function RsvpBody() {
  const { odiaGreeting, eyebrow, heading, explanation, confirmHeading, confirmHint, acceptOdia, quote, maxAttendees, deadline } = wedding.rsvp;
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
      <div aria-live="polite" className={CARD}>
        <BlessingBloom open className="mx-auto h-20 w-20" />
        <h2 id="rsvp-heading" ref={headingRef} tabIndex={-1} className="t-heading mt-3 focus:outline-none">
          Thank you, {first}!
        </h2>
        <p className="t-body mt-3">
          {saved.attending
            ? `Your response has been saved. We can't wait to celebrate with you${saved.attendees > 1 ? ` — all ${saved.attendees} of you` : ""}.`
            : "Your response has been saved. You'll be dearly missed — thank you for your blessings."}
        </p>
        <p className="mt-5 text-xs text-ink-soft">
          Replying for someone else, or need to change your answer?{" "}
          <button type="button" onClick={startAnother} className="t-button text-sindoor underline underline-offset-4">
            Send another response
          </button>
        </p>
      </div>
    );
  }

  const intro = (
    <>
      {odiaGreeting && (
        <p lang="or" className="t-odia">
          {odiaGreeting}
        </p>
      )}
      <p className="t-label mt-2 text-[13px]">{eyebrow}</p>
      <h2 id="rsvp-heading" className="t-heading mt-3 text-[#7A1424]">
        {heading}
      </h2>
      <p className="t-quote mx-auto mt-3 max-w-[21rem]">{explanation}</p>
    </>
  );

  // ── Closed / unavailable ──
  if (rsvpClosed() || !backendReady) {
    return (
      <div>
        {intro}
        <p className="t-body mt-4 text-ink-soft">
          {rsvpClosed()
            ? `Responses closed on ${deadlineDate}. Please contact the family directly.`
            : "Online responses will open soon. Meanwhile, please reach out to the family directly."}
        </p>
        {wedding.contact.people.length > 0 && (
          <a href="#contact" className="t-button mt-5 inline-block text-sindoor underline underline-offset-4">
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
          {/* The carved arch with its kalash */}
          <KalashArch className="mx-auto mt-8 block h-auto w-[88%] max-w-[19rem]" />

          <h3 className="t-event mt-7 text-[#7A1424]">{confirmHeading}</h3>
          <p className="t-quote mt-1">{confirmHint}</p>
          {deadlineDate && <p className="t-note mt-1">Kindly reply by {deadlineDate}.</p>}

          <div className="mt-6 flex flex-col items-center gap-2">
            {/* The ornate Accept button: a maroon plaque edged in gold */}
            <button
              type="button"
              onClick={accept}
              aria-label="Accept invitation"
              className="relative block w-full max-w-[20rem] transition-transform duration-200 ease-silk active:scale-[0.98]"
            >
              <AcceptPlaque className="block h-auto w-full drop-shadow-[0_10px_14px_rgb(70_20_10/0.3)]" />
              <span aria-hidden className="absolute inset-x-0 bottom-[6%] top-[20%] flex flex-col items-center justify-center leading-tight">
                <span className="t-button text-[14px] text-[#F3D98C]">Accept Invitation</span>
                {acceptOdia && <span className="mt-0.5 font-odia text-[14px] font-medium text-[#F3D98C]/90">• {acceptOdia}</span>}
              </span>
            </button>
            <button type="button" onClick={decline} className="t-button min-h-11 text-ink-soft underline decoration-gold/70 underline-offset-4">
              Unable to Attend
            </button>
          </div>
        </>
      )}

      {phase !== "invite" && (
        <div className={CARD}>
          {accepted && (
            <div>
              <BlessingBloom open={phase === "celebrate" || phase === "form"} className="mx-auto h-24 w-24" />
              <p
                className="t-quote mt-3 text-sindoor"
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
              className={`relative space-y-4 ${accepted ? "mt-7" : ""}`}
              style={{ animation: reducedMotion ? undefined : `fade-in 700ms ${EASE.silk} both` }}
            >
              <Field label="Your name" error={nameError}>
                <input className={controlClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} />
              </Field>

              <fieldset className="text-left">
                <legend className="t-label mb-1.5">Will you attend?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: true, label: "Joyfully accepts" },
                    { value: false, label: "Regretfully declines" },
                  ].map((o) => (
                    <label
                      key={String(o.value)}
                      className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-2 text-center font-sans text-[15px] transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sindoor/40 ${attending === o.value ? "border-sindoor bg-sindoor/5 font-medium text-sindoor" : "border-gold/55 text-ink"}`}
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
              <p role="alert" className="t-note min-h-5 text-center font-medium text-sindoor">
                {error}
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
