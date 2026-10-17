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
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Pending } from "@/components/ui/Pending";
import { Sheet } from "@/components/ui/Sheet";

const PAGE = 20;
const MAROON = "#7A1424";
const GOLD_LINE = "#D2B478";
const TEXT_SOFT = "#6B4A3A";
const LANTERNS = { src: "/art/wishes/lanterns.webp", w: 716, h: 476 };
/**
 * Where the inner four lanterns end, as a share of the artwork's width: the
 * heading starts below them, between the two longest at the edges.
 */
const LANTERN_CLEAR = 0.47;

/**
 * Without a database on the live site (no Supabase keys yet), while the site
 * shows its full structure, the wall runs as a preview: a wish appears on the
 * page for its sender only, nothing is saved, and the page says so.
 */
const PREVIEW = !backendReady && showPlaceholders;
const PREVIEW_NOTE = "Preview — wishes aren't being saved yet; yours shows here on this device only.";

const shortDate = (iso: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(iso));

/**
 * Section 09 — The Wishing Wall.
 * Between the side bands on the flowered cream, under the couple's
 * colourful hanging lanterns: "Blessings • Love • Togetherness", the heading,
 * a line of blessing, the three latest wishes on light cream cards (each
 * with a small maroon heart), "View All Wishes" for the rest, and a form to
 * leave a blessing. Hidden on the live site until there is somewhere to save
 * wishes, unless the site is showing its full structure (then a preview).
 */
export function WishingWall() {
  if (!backendReady && !showPlaceholders) return null;
  return <WishingWallSection />;
}

type Status = "idle" | "saving" | "saved" | "error";

function WishingWallSection() {
  const { eyebrow, heading, quote, subtitle, formHeading, formText, allowAnonymous, requireApproval, previewCount, maxLength } = wedding.wishes;
  const { guestName, isPersonalized } = useGuest();

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.08 });

  // The wall
  const [preview, setPreview] = useState<Wish[] | null>(backendReady ? null : []);
  const [total, setTotal] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const [mine, setMine] = useState<Wish[]>([]); // the preview's own wishes, unsaved
  const [wallOpen, setWallOpen] = useState(false);

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

  // The form
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

    const wish = { id: pendingId.current, name: n || null, message: m };

    if (trap) {
      // Almost certainly a bot: look successful, store nothing.
      setStatus("saved");
      setStatusText("Thank you for your blessing.");
      return;
    }
    if (PREVIEW) {
      // Shown on this page only — nothing is saved, and the note says so.
      setMine((p) => [{ ...wish, created_at: new Date().toISOString() }, ...p]);
      pendingId.current = newId();
      setMessage("");
      setStatus("saved");
      setStatusText("Thank you! Your wish is shown above — in this preview it isn't saved yet.");
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

  const shown = [...mine, ...(preview ?? [])].slice(0, previewCount);
  const allCount = mine.length + total;

  const fade = (delay = 0) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(10px)",
    transition: `opacity 900ms ${EASE.silk} ${delay}ms, transform 1000ms ${EASE.silk} ${delay}ms`,
  });

  return (
    <section
      ref={ref}
      id="wishes"
      aria-labelledby="wishes-heading"
      className="relative overflow-hidden pb-[var(--section-y)]"
      style={{ color: "var(--c-text)", paddingInline: "calc(100% * 35 / 768)" }}
    >
      {/* The couple's lanterns, hanging from the top of the section; the heading sits below the middle two */}
      <div className="relative">
        <img
          src={LANTERNS.src}
          width={LANTERNS.w}
          height={LANTERNS.h}
          alt=""
          aria-hidden
          decoding="async"
          loading="lazy"
          className="pointer-events-none absolute inset-x-0 top-0 h-auto w-full"
          style={{ opacity: inView ? 1 : 0, transition: `opacity 1200ms ${EASE.silk}` }}
        />

        <div className="relative mx-auto max-w-[24rem] px-5 text-center" style={{ paddingTop: `${LANTERN_CLEAR * 100}%` /* % of the lanterns' width */ }}>
          <div style={fade(100)}>
            <p className="t-label whitespace-nowrap text-[9px] tracking-[1px]" style={{ color: "#8C2A20" }}>
              {eyebrow}
            </p>
            <h2 id="wishes-heading" className="mt-1.5 font-serif text-[32px] font-semibold leading-tight" style={{ color: MAROON }}>
              {heading}
            </h2>
            <p className="t-quote mx-auto mt-3 max-w-[16.5rem] text-[19px]" style={{ color: "#5A3B2A" }}>
              {quote}
            </p>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[24rem] px-5">
        {/* The three latest wishes */}
        <p className="t-label mt-8 text-center text-[11px]" style={fade(200)}>
          {subtitle}
        </p>
        <div className="mt-4" aria-live="polite" aria-busy={preview === null && !loadFailed} style={fade(250)}>
          {loadFailed ? (
            <p className="t-body text-center" style={{ color: TEXT_SOFT }}>
              We couldn&rsquo;t load the wishes just now.{" "}
              <button type="button" onClick={loadPreview} className="t-button underline underline-offset-4">
                Try again
              </button>
            </p>
          ) : preview === null ? (
            <p className="t-body text-center" style={{ color: TEXT_SOFT }}>
              Gathering wishes…
            </p>
          ) : shown.length > 0 ? (
            <ul aria-label="Recent wishes" className="space-y-3">
              {shown.map((w) => (
                <li key={w.id}>
                  <WishCard wish={w} />
                </li>
              ))}
            </ul>
          ) : showPlaceholders ? (
            <ul aria-label="Recent wishes" className="space-y-3">
              {[0, 1, 2].map((k) => (
                <li key={k}>
                  <Pending label="Wishes from guests will appear here">
                    <div className="px-3 py-2 text-left">
                      <p className="font-serif text-[18px] font-semibold">A guest&rsquo;s name</p>
                      <p className="t-quote text-[17px]">Their wish for the couple will appear here.</p>
                    </div>
                  </Pending>
                </li>
              ))}
            </ul>
          ) : (
            <p className="t-quote text-center">Be the first to leave a blessing.</p>
          )}

          {(allCount > 0 || showPlaceholders) && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setWallOpen(true)}
                aria-haspopup="dialog"
                className="t-button inline-flex min-h-11 items-center gap-2 rounded-full border border-[#C9A86A] bg-[#FFFAF1]/80 px-6 text-[12px] shadow-[0_6px_14px_-10px_rgb(110_70_20/0.5)]"
                style={{ color: "#8C2A20" }}
              >
                View All Wishes{allCount > 0 ? ` (${allCount})` : ""}
              </button>
            </div>
          )}
        </div>

        <GoldDivider className="mt-9" />

        {/* Leave your blessings */}
        <form onSubmit={onSubmit} onFocus={guard.touch} onInput={guard.touch} noValidate className="relative mt-8" style={fade(300)}>
          <div className="text-center">
            <h3 className="font-serif text-[28px] font-semibold leading-tight" style={{ color: MAROON }}>
              {formHeading}
            </h3>
            <p className="t-body mt-1.5" style={{ color: TEXT_SOFT }}>
              {formText}
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <Field label="Your name" error={errors.name} optional={allowAnonymous}>
              <input className={controlClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} />
            </Field>
            <Field label="Your wish" error={errors.message} hint={`${message.length}/${maxLength}`}>
              <textarea className={`${controlClass} min-h-28 resize-y`} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={maxLength} rows={4} />
            </Field>
            <Honeypot value={trap} onChange={setTrap} />

            <button
              type="submit"
              disabled={status === "saving"}
              className="t-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-[#FBF3E4] shadow-[0_10px_20px_-12px_rgb(122_20_36/0.8)] transition duration-200 ease-silk active:scale-[0.98] disabled:opacity-60"
              style={{ backgroundColor: MAROON }}
            >
              {status === "saving" ? (
                "Sending…"
              ) : (
                <>
                  <span aria-hidden>♡</span> Leave a Wish
                </>
              )}
            </button>

            <p role="status" className={`t-note min-h-5 text-center ${status === "error" ? "font-medium text-sindoor" : ""}`}>
              {status === "saved" || status === "error" ? statusText : PREVIEW ? PREVIEW_NOTE : ""}
            </p>
          </div>
        </form>
      </div>

      <Sheet open={wallOpen} onClose={() => setWallOpen(false)} label="All wishes">
        {wallOpen && <AllWishes local={mine} />}
      </Sheet>
    </section>
  );
}

/** One wish on a light cream card: a thin gold border with small corner marks, a maroon heart, the name and the words. */
function WishCard({ wish }: { wish: Wish }) {
  return (
    <figure className="relative rounded-xl border bg-[#FFFBF3]/90 px-4 pb-3.5 pt-3 text-left" style={{ borderColor: GOLD_LINE }}>
      {/* corner marks */}
      {["left-1.5 top-1.5 border-l border-t", "right-1.5 top-1.5 border-r border-t", "bottom-1.5 left-1.5 border-b border-l", "bottom-1.5 right-1.5 border-b border-r"].map((c) => (
        <span key={c} aria-hidden className={`absolute h-2.5 w-2.5 ${c}`} style={{ borderColor: "#B8893A" }} />
      ))}
      <figcaption className="flex items-center gap-2">
        <svg viewBox="0 0 24 22" className="h-3.5 w-3.5 shrink-0" aria-hidden fill={MAROON}>
          <path d="M12 20C6 15.6 2 12 2 7.5 2 4.4 4.4 2 7.4 2c2 0 3.6 1.1 4.6 2.7C13 3.1 14.6 2 16.6 2 19.6 2 22 4.4 22 7.5 22 12 18 15.6 12 20Z" />
        </svg>
        <span className="min-w-0 flex-1 truncate font-serif text-[18px] font-semibold" style={{ color: MAROON }}>
          {wish.name ?? "A well-wisher"}
        </span>
        <span className="t-note shrink-0">{shortDate(wish.created_at)}</span>
      </figcaption>
      <blockquote className="t-quote mt-1 text-[17px] leading-snug" style={{ color: "var(--c-text)" }}>
        {wish.message}
      </blockquote>
    </figure>
  );
}

/** Every wish, a page at a time (in the preview, only this visitor's own). */
function AllWishes({ local }: { local: Wish[] }) {
  const [items, setItems] = useState<Wish[]>([]);
  const [total, setTotal] = useState<number | null>(backendReady ? null : 0);
  const [state, setState] = useState<"loading" | "ready" | "error">(backendReady ? "loading" : "ready");

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
    if (backendReady) void loadMore(0);
  }, [loadMore]);

  const all = [...local, ...items];
  const count = local.length + (total ?? 0);

  return (
    <div>
      <h3 className="t-heading text-center" style={{ color: MAROON }}>
        All Wishes
      </h3>
      {total !== null && (
        <p className="t-note mt-1 text-center">
          {count} {count === 1 ? "wish" : "wishes"}
        </p>
      )}
      {all.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {all.map((w) => (
            <li key={w.id}>
              <WishCard wish={w} />
            </li>
          ))}
        </ul>
      ) : (
        state === "ready" && <p className="t-quote mt-6 text-center">No wishes yet — be the first to leave one.</p>
      )}
      <div className="t-note mt-6 text-center" aria-live="polite">
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
