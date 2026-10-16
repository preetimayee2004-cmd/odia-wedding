import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { useInView } from "@/hooks/useInView";
import { addWish, BackendError, backendReady, listWishes, newId, type Wish } from "@/lib/backend";
import { EASE } from "@/lib/motion";
import { showPlaceholders } from "@/lib/placeholders";
import { useSpamGuard } from "@/lib/spam";
import { Button } from "@/components/ui/Button";
import { controlClass, Field, Honeypot } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";

const PAGE = 20;
const GOLD = "#A6782C";
const TEXT = "#2B1A14";
const MAROON = "#7A1424";
const TEXT_SOFT = "#6B4A3A";
const TILTS = [-1.2, 0.8, -0.5, 1.1];

const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(iso));

/**
 * Section 09 — Blessings Wall (The Ananda Bazar).
 * On the page's ochre cream, the blessings sit in a horizontal carousel of
 * talapatra (palm-leaf) manuscripts, ink-etched and tied with thread. When a
 * guest sends a blessing, a tiny marigold drops onto their leaf.
 * Without a storage backend it is hidden, or (while placeholders are on)
 * shown with the form closed.
 */
export function WishingWall() {
  if (!backendReady && !showPlaceholders) return null;
  return <WishingWallSection />;
}

type Status = "idle" | "saving" | "saved" | "error";

function WishingWallSection() {
  const { eyebrow, heading, odiaHeading, allowAnonymous, requireApproval, previewCount, maxLength } = wedding.wishes;
  const { guestName, isPersonalized } = useGuest();

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.1 });
  const carouselRef = useRef<HTMLUListElement>(null);

  // Wall
  const [preview, setPreview] = useState<Wish[] | null>(backendReady ? null : []);
  const [total, setTotal] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const [marigoldOn, setMarigoldOn] = useState<string | null>(null);

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

  // Bring the guest's own leaf into view; the marigold drops once it is there.
  useEffect(() => {
    if (!marigoldOn) return;
    const carousel = carouselRef.current;
    carousel?.scrollTo({ left: 0, behavior: "smooth" });
    carousel?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [marigoldOn]);

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
        setMarigoldOn(wish.id);
      }
    } catch (err) {
      setStatus("error");
      setStatusText(err instanceof BackendError ? err.message : "Something went wrong. Please try again.");
    }
  };

  const [wallOpen, setWallOpen] = useState(false);

  const fade = (delay = 0) => ({ opacity: inView ? 1 : 0, transition: `opacity 900ms ${EASE.silk} ${delay}ms` });

  return (
    <section
      ref={ref}
      id="wishes"
      aria-labelledby="wishes-heading"
      className="overflow-hidden py-[var(--section-y)]"
      style={{ color: TEXT }}
    >
      <div className="px-[var(--gutter)] text-center" style={fade()}>
        <p className="t-label" style={{ color: GOLD }}>
          {eyebrow}
        </p>
        {odiaHeading && (
          <p lang="or" className="odia mt-2 text-base" style={{ color: TEXT_SOFT }}>
            {odiaHeading}
          </p>
        )}
        <h2 id="wishes-heading" className="t-heading mt-1" style={{ color: MAROON }}>
          {heading}
        </h2>
        <p className="t-body mx-auto mt-2 max-w-[19rem]" style={{ color: TEXT_SOFT }}>
          Leave a few words of love and blessing for the couple.
        </p>
      </div>

      {/* The carousel of palm leaves */}
      <div className="mt-8" aria-live="polite" aria-busy={preview === null && !loadFailed}>
        {loadFailed ? (
          <p className="px-[var(--gutter)] text-center text-sm" style={{ color: TEXT_SOFT }}>
            We couldn&rsquo;t load the blessings just now.{" "}
            <button type="button" onClick={loadPreview} className="t-button underline underline-offset-4" style={{ color: TEXT }}>
              Try again
            </button>
          </p>
        ) : preview === null ? (
          <p className="text-center text-sm" style={{ color: TEXT_SOFT }}>
            Gathering blessings…
          </p>
        ) : preview.length === 0 ? (
          <p className="t-quote text-center">
            Be the first to leave a blessing.
          </p>
        ) : (
          <ul
            ref={carouselRef}
            aria-label="Blessings"
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-[var(--gutter)] px-[var(--gutter)] pb-6 pt-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {preview.map((w, i) => (
              <li
                key={w.id}
                className="w-[16.5rem] shrink-0 snap-start"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? `rotate(${TILTS[i % 4]}deg)` : `rotate(${TILTS[i % 4] * 4}deg) translateX(40px)`,
                  transition: `opacity 700ms ${EASE.silk} ${200 + Math.min(i, 4) * 140}ms, transform 1000ms ${EASE.silk} ${200 + Math.min(i, 4) * 140}ms`,
                }}
              >
                <PalmLeaf wish={w} marigold={w.id === marigoldOn} />
              </li>
            ))}
          </ul>
        )}

        {preview && preview.length > 1 && (
          <p aria-hidden className="t-label text-center">
            Swipe for more blessings →
          </p>
        )}

        {total > (preview?.length ?? 0) && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setWallOpen(true)}
              aria-haspopup="dialog"
              className="t-button inline-flex min-h-12 items-center rounded-full border px-7"
              style={{ color: TEXT, borderColor: `${GOLD}99` }}
            >
              View All Blessings ({total})
            </button>
          </div>
        )}
      </div>

      {/* The form */}
      <form
        onSubmit={onSubmit}
        onFocus={guard.touch}
        onInput={guard.touch}
        noValidate
        className="relative mx-[var(--gutter)] mt-10 rounded-2xl border bg-[#F6EEDC] p-5 text-ink"
        style={{ ...fade(300), borderColor: `${GOLD}66` }}
      >
        <fieldset disabled={!backendReady} className="space-y-4 disabled:opacity-60">
        <h3 className="t-event text-center">Send your blessing</h3>
        {!backendReady && <p className="t-note text-center">Blessings open soon.</p>}
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
          <Button variant="gold" type="submit" disabled={status === "saving"} className="w-full">
            {status === "saving" ? "Sending…" : "Send Blessing"}
          </Button>
        </div>

        <p
          role="status"
          className={`t-note min-h-5 text-center ${status === "error" ? "font-medium text-sindoor" : "text-ink"}`}
        >
          {status === "saved" || status === "error" ? statusText : ""}
        </p>
        </fieldset>
      </form>

      <Sheet open={wallOpen} onClose={() => setWallOpen(false)} label="All blessings">
        {wallOpen && <AllWishes />}
      </Sheet>
    </section>
  );
}

/** One blessing, ink-etched on a palm leaf tied with thread through its two holes. */
function PalmLeaf({ wish, marigold = false }: { wish: Wish; marigold?: boolean }) {
  return (
    <figure className="talapatra relative flex min-h-[9.5rem] flex-col justify-center px-9 py-5 text-left">
      {/* Binding holes, and the thread through the first */}
      {["left-[13px]", "right-[13px]"].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={`absolute top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-[#3E260C] shadow-[inset_0_1px_1px_rgb(0_0_0/0.6)] ${pos}`}
        />
      ))}
      <span aria-hidden className="absolute left-[16px] top-1/2 h-10 w-[1.5px] origin-top rotate-[16deg] rounded-full bg-[#8E2A1F]/80" />
      <blockquote className="t-quote leading-snug text-[#3A2208]">“{wish.message}”</blockquote>
      <figcaption className="t-note mt-2 text-[#5C3B12]">
        — {wish.name ?? "A well-wisher"} · {shortDate(wish.created_at)}
      </figcaption>
      {marigold && <Marigold className="marigold-drop absolute -top-5 right-5 h-11 w-11" />}
    </figure>
  );
}

/** A tiny marigold (genda), layered orange petals around a deep centre. */
function Marigold({ className = "" }: { className?: string }) {
  const ring = (n: number, r: number, len: number, fill: string, offset = 0) =>
    Array.from({ length: n }, (_, i) => (
      <ellipse
        key={`${r}-${i}`}
        cx="24"
        cy={24 - r}
        rx={len * 0.55}
        ry={len}
        fill={fill}
        stroke="#B4520C"
        strokeWidth="0.5"
        transform={`rotate(${(i * 360) / n + offset} 24 24)`}
      />
    ));
  return (
    <svg viewBox="0 0 48 48" className={className} style={{ animationDelay: "550ms" }} role="img" aria-label="A marigold for your blessing">
      <g style={{ filter: "drop-shadow(0 3px 2px rgb(0 0 0 / 0.35))" }}>
        {ring(14, 13, 8, "#F08A0E")}
        {ring(12, 9, 6.5, "#F7A21B", 15)}
        {ring(10, 5.5, 5, "#FDBB2D", 8)}
        <circle cx="24" cy="24" r="4" fill="#C2570A" />
        <circle cx="23" cy="23" r="1.4" fill="#FFD36A" opacity="0.8" />
      </g>
    </svg>
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
      <h3 className="t-heading text-center">All Blessings</h3>
      {total !== null && <p className="mt-1 text-center text-xs text-ink-soft">{total} blessings</p>}
      <ul className="mt-6 space-y-3">
        {items.map((w) => (
          <li key={w.id}>
            <PalmLeaf wish={w} />
          </li>
        ))}
      </ul>
      <div className="mt-6 text-center text-sm text-ink-soft" aria-live="polite">
        {state === "loading" && "Loading…"}
        {state === "error" && (
          <button type="button" onClick={() => loadMore(items.length)} className="t-button text-sindoor underline underline-offset-4">
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
