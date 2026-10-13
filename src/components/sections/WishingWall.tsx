import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { useInView } from "@/hooks/useInView";
import { addWish, BackendError, backendReady, listWishes, newId, type Wish } from "@/lib/backend";
import { EASE } from "@/lib/motion";
import { useSpamGuard } from "@/lib/spam";
import { LotusBud } from "@/components/art/LotusBud";
import { Button } from "@/components/ui/Button";
import { controlClass, Field, Honeypot } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";

const PAGE = 20;
const TILTS = [-1.4, 1, -0.6];

const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(iso));

/**
 * Section 10 — Wishing Wall (PRD §4.10).
 * Identity: blessings arrive like notes being pinned — they drop in at an
 * angle and settle, keeping a slight hand-placed tilt.
 * Hidden entirely when no storage backend is configured.
 */
export function WishingWall() {
  if (!backendReady) return null;
  return <WishingWallSection />;
}

type Status = "idle" | "saving" | "saved" | "error";

function WishingWallSection() {
  const { heading, odiaHeading, allowAnonymous, requireApproval, previewCount, maxLength } = wedding.wishes;
  const { guestName, isPersonalized } = useGuest();

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.1 });

  // Wall
  const [preview, setPreview] = useState<Wish[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);

  const loadPreview = useCallback(async () => {
    setLoadFailed(false);
    try {
      const { items, total } = await listWishes(previewCount);
      setPreview(items);
      setTotal(total);
    } catch {
      setLoadFailed(true);
    }
  }, [previewCount]);

  useEffect(() => {
    if (inView && preview === null) void loadPreview();
  }, [inView, preview, loadPreview]);

  // Form
  const [name, setName] = useState(isPersonalized ? guestName : "");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({});
  const [status, setStatus] = useState<Status>("idle");
  const [statusText, setStatusText] = useState("");
  const pendingId = useRef(newId()); // reused on retry so a resend can't duplicate
  const guard = useSpamGuard("tila:wish-sent-at", 30_000);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "saving") return;

    const n = name.trim();
    const m = message.trim();
    const next: typeof errors = {};
    if (!n && !allowAnonymous) next.name = "Please add your name.";
    else if (n.length > 60) next.name = "Please keep your name under 60 characters.";
    if (m.length < 2) next.message = "Please write a few words.";
    else if (m.length > maxLength) next.message = `Please keep your wish under ${maxLength} characters.`;
    setErrors(next);
    if (next.name || next.message) return;

    if (trap) {
      // Almost certainly a bot: look successful, store nothing.
      setStatus("saved");
      setStatusText("Thank you for your blessing.");
      return;
    }
    if (guard.coolingDown()) {
      setStatus("error");
      setStatusText("Please wait a moment before sending another wish.");
      return;
    }
    if (guard.tooFast()) {
      setStatus("error");
      setStatusText("That was quick! Please take a moment and send it again.");
      return;
    }

    setStatus("saving");
    const wish = { id: pendingId.current, name: n || null, message: m };
    try {
      await addWish(wish);
      guard.markSubmitted();
      pendingId.current = newId();
      setMessage("");
      setStatus("saved");
      if (requireApproval) {
        setStatusText("Thank you! Your blessing will appear once the couple has seen it.");
      } else {
        setStatusText("Thank you! Your blessing has been added to the wall.");
        // Shown only now that it is saved.
        setPreview((p) => [{ ...wish, created_at: new Date().toISOString() }, ...(p ?? [])].slice(0, previewCount));
        setTotal((t) => t + 1);
      }
    } catch (err) {
      setStatus("error");
      setStatusText(err instanceof BackendError ? err.message : "Something went wrong. Please try again.");
    }
  };

  const [wallOpen, setWallOpen] = useState(false);

  const fade = (delay = 0) => ({ opacity: inView ? 1 : 0, transition: `opacity 900ms ${EASE.silk} ${delay}ms` });

  return (
    <section ref={ref} id="wishes" aria-labelledby="wishes-heading" className="section">
      <div className="text-center" style={fade()}>
        <LotusBud className="mx-auto h-7 w-12" />
        {odiaHeading && (
          <p lang="or" className="odia mt-2 text-base text-sindoor/85">
            {odiaHeading}
          </p>
        )}
        <h2 id="wishes-heading" className="mt-1 text-[2.25rem]">
          {heading}
        </h2>
        <p className="mx-auto mt-2 max-w-[17rem] text-[0.8125rem] text-ink-soft">
          Leave a few words of love and blessing for the couple.
        </p>
      </div>

      {/* The wall */}
      <div className="mt-10" aria-live="polite" aria-busy={preview === null && !loadFailed}>
        {loadFailed ? (
          <p className="text-center text-sm text-ink-soft">
            We couldn't load the wishes just now.{" "}
            <button type="button" onClick={loadPreview} className="font-medium text-sindoor underline underline-offset-4">
              Try again
            </button>
          </p>
        ) : preview === null ? (
          <p className="text-center text-sm text-ink-soft">Gathering blessings…</p>
        ) : preview.length === 0 ? (
          <p className="text-center font-display text-lg italic text-ink-soft">Be the first to leave a blessing.</p>
        ) : (
          <ul className="space-y-5">
            {preview.map((w, i) => (
              <li
                key={w.id}
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? `rotate(${TILTS[i % 3]}deg)` : `rotate(${TILTS[i % 3] * 5}deg) translateY(22px)`,
                  transition: `opacity 700ms ${EASE.silk} ${200 + i * 140}ms, transform 1000ms ${EASE.silk} ${200 + i * 140}ms`,
                }}
              >
                <WishNote wish={w} pinned />
              </li>
            ))}
          </ul>
        )}

        {total > (preview?.length ?? 0) && (
          <div className="mt-8 text-center">
            <Button variant="secondary" onClick={() => setWallOpen(true)} aria-haspopup="dialog">
              View All Wishes ({total})
            </Button>
          </div>
        )}
      </div>

      {/* The form */}
      <form
        onSubmit={onSubmit}
        onFocus={guard.touch}
        onInput={guard.touch}
        noValidate
        className="relative mt-12 space-y-4 rounded-2xl border border-gold/40 bg-cream-light/60 p-5"
        style={fade(300)}
      >
        <h3 className="text-center text-[1.5rem]">Send your blessing</h3>
        <Field label="Your name" error={errors.name} optional={allowAnonymous}>
          <input
            className={controlClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={60}
          />
        </Field>
        <Field label="Your wish" error={errors.message} hint={`${message.length}/${maxLength}`}>
          <textarea
            className={`${controlClass} min-h-28 resize-y`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={maxLength}
            rows={4}
          />
        </Field>
        <Honeypot value={trap} onChange={setTrap} />

        <div className="pt-1 text-center">
          <Button type="submit" disabled={status === "saving"} className="w-full">
            {status === "saving" ? "Sending…" : "Send Blessing"}
          </Button>
        </div>

        <p
          role="status"
          className={`min-h-5 text-center text-[0.8125rem] ${status === "error" ? "font-medium text-sindoor" : "text-ink"}`}
        >
          {status === "saved" || status === "error" ? statusText : ""}
        </p>
      </form>

      <Sheet open={wallOpen} onClose={() => setWallOpen(false)} label="All wishes">
        {wallOpen && <AllWishes />}
      </Sheet>
    </section>
  );
}

function WishNote({ wish, pinned = false }: { wish: Wish; pinned?: boolean }) {
  return (
    <figure
      className={`relative border border-gold/30 bg-cream-light px-5 pb-4 text-left ${pinned ? "pt-6 shadow-[0_12px_26px_-20px_rgb(var(--ink)/0.6)]" : "pt-4"}`}
    >
      {pinned && <span aria-hidden className="absolute left-1/2 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-sindoor/80" />}
      <blockquote className="font-display text-[1.15rem] italic leading-snug text-ink">“{wish.message}”</blockquote>
      <figcaption className="mt-3 text-xs text-ink-soft">
        — {wish.name ?? "A well-wisher"} · {shortDate(wish.created_at)}
      </figcaption>
    </figure>
  );
}

function AllWishes() {
  const [items, setItems] = useState<Wish[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const loadMore = useCallback(async (offset: number) => {
    setState("loading");
    try {
      const page = await listWishes(PAGE, offset);
      setItems((prev) => (offset === 0 ? page.items : [...prev, ...page.items]));
      setTotal(page.total);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void loadMore(0);
  }, [loadMore]);

  return (
    <div>
      <h3 className="text-center text-[2rem]">All Wishes</h3>
      {total !== null && <p className="mt-1 text-center text-xs text-ink-soft">{total} blessings</p>}
      <ul className="mt-6 space-y-3">
        {items.map((w) => (
          <li key={w.id}>
            <WishNote wish={w} />
          </li>
        ))}
      </ul>
      <div className="mt-6 text-center text-sm text-ink-soft" aria-live="polite">
        {state === "loading" && "Loading…"}
        {state === "error" && (
          <button type="button" onClick={() => loadMore(items.length)} className="font-medium text-sindoor underline underline-offset-4">
            Couldn't load — try again
          </button>
        )}
        {state === "ready" && total !== null && items.length < total && (
          <Button variant="secondary" onClick={() => loadMore(items.length)}>
            Load more
          </Button>
        )}
      </div>
    </div>
  );
}
