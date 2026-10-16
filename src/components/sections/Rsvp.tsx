import { useRef, useState, type FormEvent } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { BackendError, backendReady, newId, submitRsvp } from "@/lib/backend";
import { canAddToCalendar, downloadWeddingCalendar } from "@/lib/calendar";
import { EASE } from "@/lib/motion";
import { formatVenueDate, parseVenueDateTime, venueDateKey } from "@/lib/venueTime";
import { AcceptPlaque, GuaThali, LotusConfirm } from "@/components/art/RsvpArt";
import { Button } from "@/components/ui/Button";
import { controlClass, Field, Honeypot } from "@/components/ui/Field";

const SAVED_KEY = "tila:rsvp";
const MAROON = "#7A1424";
const RED = "#A51C1C";

type Phase = "invite" | "form" | "done";
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

const coupleNames = () => wedding.invitation.names.join(" & ");
const withNames = (text: string) => text.replace("{names}", coupleNames());

/** The cream card the form sits on. */
const CARD = "mt-8 rounded-2xl border border-[#E9D6AC] bg-[#FFFDF8] px-5 pb-7 pt-6 text-left shadow-[0_18px_40px_-22px_rgb(60_30_10/0.45)]";

/**
 * Section 08 — RSVP, after the couple's design.
 * Between the side bands on the flowered cream: "|| ଶ୍ରୀ ଗଣେଶାୟ ନମଃ ||", a
 * framed "|| ଶୁଭ ବିବାହ ||", An Auspicious Invitation and its words; a brass
 * thali of gua with marigolds, rose petals and two lit diyas; "Accept the
 * Sacred Gua & Bless Us" and an ornate maroon Accept Invitation plaque; Jai
 * Jagannath. Accepting opens a short form on a cream card; once the response
 * is saved, a lotus blooms into a gold-ringed seal with a white tick as petals
 * scatter, over "RSVP Confirmed · ଧନ୍ୟବାଦ · Thank you!", a blessing card and
 * Add to Calendar.
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

function RsvpBody() {
  const r = wedding.rsvp;
  const { guestName, isPersonalized } = useGuest();
  const reducedMotion = usePrefersReducedMotion();

  const [saved, setSaved] = useState<SavedResponse | null>(readSaved);
  const [phase, setPhase] = useState<Phase>(saved ? "done" : "invite");

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
  const formRef = useRef<HTMLFormElement>(null);

  const deadlineDate = (() => {
    const p = parseVenueDateTime(r.deadline);
    const f = p && formatVenueDate(p);
    return f ? `${f.day} ${f.month} ${f.year}` : null;
  })();

  const openForm = (willAttend: boolean) => {
    setAttending(willAttend);
    setPhase("form");
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" }));
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
    setPhase("invite");
  };

  // ── Done: the blooming seal ──
  if (phase === "done" && saved) return <Confirmation saved={saved} onAnother={startAnother} />;

  const intro = (
    <>
      {r.invocationOdia && (
        <p lang="or" className="font-odia text-[14px] font-medium leading-normal" style={{ color: "var(--c-blessing)" }}>
          {r.invocationOdia}
        </p>
      )}
      {r.titleOdia && (
        <h2
          id="rsvp-heading"
          lang="or"
          className="mx-auto mt-3 inline-block border border-[#A51C1C]/70 px-5 py-0.5 font-odia text-[30px] font-bold leading-[1.45] outline outline-1 outline-offset-[3px] outline-[#A51C1C]/30"
          style={{ color: RED }}
        >
          {r.titleOdia}
        </h2>
      )}
      <p className="t-label mt-5 text-[13px]" style={{ color: "var(--c-text)" }}>
        {r.eyebrow}
      </p>
      <p className="t-body mx-auto mt-2 max-w-[21rem]">{withNames(r.explanation)}</p>
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

  return (
    <div>
      {intro}

      {/* The offering of gua */}
      <GuaThali className="mx-auto mt-4 block h-auto w-full max-w-[21rem]" />

      <h3 className="mx-auto mt-3 max-w-[20rem] font-serif text-[26px] font-semibold leading-tight [text-wrap:balance]" style={{ color: "var(--c-text)" }}>
        {r.offerHeading}
      </h3>
      <p className="t-quote mx-auto mt-1.5 max-w-[20rem] text-[17px]">{r.offerText}</p>
      {deadlineDate && <p className="t-note mt-1">Kindly reply by {deadlineDate}.</p>}

      {phase === "invite" && (
        <div className="mt-6 flex flex-col items-center gap-1">
          {/* The ornate Accept plaque */}
          <button
            type="button"
            onClick={() => openForm(true)}
            aria-label={r.acceptLabel}
            className="relative block w-full max-w-[21rem] transition-transform duration-200 ease-silk active:scale-[0.98]"
          >
            <AcceptPlaque className="block h-auto w-full drop-shadow-[0_10px_14px_rgb(70_20_10/0.3)]" />
            <span aria-hidden className="absolute inset-x-[12%] bottom-[6%] top-[20%] flex flex-col items-center justify-center leading-tight text-[#F3D98C]">
              <span className="t-button text-[13px]">{r.acceptLabel}</span>
              {r.acceptOdia && <span className="mt-0.5 font-odia text-[14px] font-medium">{r.acceptOdia}</span>}
            </span>
          </button>
          <button type="button" onClick={() => openForm(false)} className="t-button min-h-11 text-[12px] text-ink-soft underline decoration-gold/70 underline-offset-4">
            Unable to Attend
          </button>
        </div>
      )}

      {phase === "form" && (
        <form
          ref={formRef}
          onSubmit={onSubmit}
          noValidate
          className={`${CARD} space-y-4`}
          style={{ animation: reducedMotion ? undefined : `fade-in 700ms ${EASE.silk} both` }}
        >
          <Field label="Your name" error={nameError}>
            <input className={controlClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} />
          </Field>

          <fieldset>
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
                  <input type="radio" name="attending" className="sr-only" checked={attending === o.value} onChange={() => setAttending(o.value)} />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>

          {attending && r.maxAttendees > 1 && (
            <Field label="Number of guests" hint={`Including you · up to ${r.maxAttendees}`}>
              <select className={controlClass} value={attendees} onChange={(e) => setAttendees(Number(e.target.value))}>
                {Array.from({ length: r.maxAttendees }, (_, i) => i + 1).map((n) => (
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
            {saving ? "Sending…" : attending ? "Confirm my presence" : "Send response"}
          </Button>
          <p role="alert" className="t-note min-h-5 text-center font-medium text-sindoor">
            {error}
          </p>
        </form>
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

/** Once the response is saved: the lotus seal, thanks, a blessing card, and Add to Calendar. */
function Confirmation({ saved, onAnother }: { saved: SavedResponse; onAnother: () => void }) {
  const c = wedding.rsvp.confirmed;
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { threshold: 0.3 });
  const headingRef = useRef<HTMLHeadingElement>(null);

  return (
    <div ref={ref} aria-live="polite">
      <LotusConfirm play={seen} still={reduced} className="mx-auto h-[12.5rem] w-[12.5rem]" />

      <p className="t-label mt-5 text-[13px] tracking-[3px]" style={{ color: "var(--c-text)" }}>
        {saved.attending ? c.label : "Response received"}
      </p>
      {c.odia && (
        <p lang="or" className="t-odia mt-2 text-[24px]">
          {c.odia}
        </p>
      )}
      <h2 id="rsvp-heading" ref={headingRef} tabIndex={-1} className="t-heading mt-1 text-[44px] focus:outline-none" style={{ color: "var(--c-text)" }}>
        {c.heading}
      </h2>
      <p className="t-body mt-2 text-[20px]" style={{ color: "var(--c-muted)" }}>
        {saved.attending ? c.line : "You'll be dearly missed — thank you for your blessings,"}
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

      {saved.attending && canAddToCalendar() && (
        <button
          type="button"
          onClick={downloadWeddingCalendar}
          className="t-button mt-7 h-14 w-full rounded-full text-white shadow-[0_12px_24px_-12px_rgb(165_28_28/0.7)] transition-transform duration-200 ease-silk active:scale-[0.98]"
          style={{ backgroundColor: RED }}
        >
          Add to Calendar
        </button>
      )}

      <p className="t-note mt-5">
        Replying for someone else, or need to change your answer?{" "}
        <button type="button" onClick={onAnother} className="font-medium underline underline-offset-4" style={{ color: MAROON }}>
          Send another response
        </button>
      </p>
    </div>
  );
}
