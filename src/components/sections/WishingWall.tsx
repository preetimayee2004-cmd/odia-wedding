import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { addWish, BackendError, backendReady, listWishes, newId, type Wish } from "@/lib/backend";
import { EASE } from "@/lib/motion";
import { showPlaceholders } from "@/lib/placeholders";
import { useSpamGuard } from "@/lib/spam";
import { Button } from "@/components/ui/Button";
import { controlClass, Field, Honeypot } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { LotusIcon } from "@/components/art/Ganesha";
import { Toran } from "@/components/art/Toran";

const PAGE = 20;
const MAROON = "#7A1424";
const TEXT_SOFT = "#6B4A3A";
const MUTED_GOLD = "#A88A4E";
/** A strip's resting tilt, in turn, so they sit like the leaves of a pothi. */
const TILTS = [-1.5, 1, -0.5];
/** Two lines of a folded strip. */
const FOLDED = 41;
const FEATURE_MS = 5000;

/**
 * Without a database on the live site (no Supabase keys yet), while the site
 * shows its full structure, the wall runs as a preview: a blessing is kept
 * in this browser only, and the sheet says so.
 */
const PREVIEW = !backendReady && showPlaceholders;
/** This browser's own blessings (awaiting the couple), newest first. */
const MINE_STORE = "tila:preview-wishes";

/** The sample wishes that fill empty strips while placeholders are on. */
const SAMPLES: Wish[] = showPlaceholders
  ? wedding.wishes.samples.map((s, i) => ({ id: `sample-${i}`, name: s.name, relation: s.relation, message: s.message, created_at: "" }))
  : [];

const isWish = (w: unknown): w is Wish => {
  const o = w as Wish | null;
  return !!o && typeof o.id === "string" && typeof o.message === "string" && typeof o.created_at === "string" && (o.name === null || typeof o.name === "string");
};

function readMine(): Wish[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(MINE_STORE) ?? "[]");
    return Array.isArray(v) ? v.filter(isWish).map((w) => ({ ...w, relation: w.relation ?? null })).slice(0, 200) : [];
  } catch {
    return [];
  }
}

const isOdia = (text: string) => /[଀-୿]/.test(text);
const byline = (w: Wish) => [w.name ?? "A well-wisher", w.relation].filter(Boolean).join(" · ");

/**
 * Section 09 — The Wishing Wall, handcrafted and Odia.
 * Under a toran of mango leaves and marigolds: the heading and a line of
 * blessing; one featured wish that changes every few seconds under a small
 * lotus; the latest wishes on talapatra (palm-leaf strips) strung on a red
 * thread, each opening to its full words when tapped; how many blessings
 * have come; and "Leave a Blessing", which opens a sheet (name, relation,
 * message). New blessings wait for the couple's approval before they appear.
 */
export function WishingWall() {
  if (!backendReady && !showPlaceholders) return null;
  return <WishingWallSection />;
}

function WishingWallSection() {
  const { heading, quote, previewCount } = wedding.wishes;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.08 });
  const reduced = usePrefersReducedMotion();

  // The approved wishes
  const [approved, setApproved] = useState<Wish[] | null>(backendReady ? null : []);
  const [total, setTotal] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  // This browser's own blessings, waiting for the couple
  const [mine, setMine] = useState<Wish[]>(readMine);
  const [formOpen, setFormOpen] = useState(false);
  const [allOpen, setAllOpen] = useState(false);

  const load = useCallback(async () => {
    setLoadFailed(false);
    try {
      const { items, total } = await listWishes(previewCount);
      setApproved(items);
      setTotal(total);
    } catch {
      setLoadFailed(true);
    }
  }, [previewCount]);

  useEffect(() => {
    if (inView && approved === null) void load();
  }, [inView, approved, load]);

  useEffect(() => {
    try {
      localStorage.setItem(MINE_STORE, JSON.stringify(mine));
    } catch {
      // storage unavailable (private window, blocked): kept for this visit only
    }
  }, [mine]);

  const real = (approved ?? []).slice(0, previewCount);
  // sample wishes fill any empty strips, so the wall is never blank
  const fill = SAMPLES.slice(0, Math.max(0, previewCount - real.length));
  const strips = [...real, ...fill];
  const count = total + fill.length;

  // The featured wish: one of the wall's, changing every few seconds with a fade
  const [featured, setFeatured] = useState(0);
  const [featureShown, setFeatureShown] = useState(true);
  useEffect(() => {
    if (!inView || reduced || strips.length < 2) return;
    let swap = 0;
    const t = window.setInterval(() => {
      setFeatureShown(false);
      swap = window.setTimeout(() => {
        setFeatured((n) => (n + 1) % strips.length);
        setFeatureShown(true);
      }, 450);
    }, FEATURE_MS);
    return () => {
      clearInterval(t);
      clearTimeout(swap);
    };
  }, [inView, reduced, strips.length]);
  const feature = strips[featured % Math.max(1, strips.length)];

  const fade = (delay = 0): CSSProperties => ({
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
      {/* A toran of mango leaves and marigolds across the top */}
      <Toran className="block h-auto w-full" />

      <div className="relative mx-auto max-w-[24rem] px-5 text-center">
        <div style={fade(100)}>
          <h2 id="wishes-heading" className="mt-4 font-serif text-[34px] font-semibold leading-tight" style={{ color: MAROON }}>
            {heading}
          </h2>
          <p className="t-quote mx-auto mt-2.5 max-w-[17rem] text-[18.5px]" style={{ color: "#5A3B2A" }}>
            {quote}
          </p>
        </div>

        <div aria-live="polite" aria-busy={approved === null && !loadFailed}>
          {loadFailed ? (
            <p className="t-body mt-8" style={{ color: TEXT_SOFT }}>
              We couldn&rsquo;t load the wishes just now.{" "}
              <button type="button" onClick={load} className="t-button underline underline-offset-4">
                Try again
              </button>
            </p>
          ) : approved === null ? (
            <p className="t-body mt-8" style={{ color: TEXT_SOFT }}>
              Gathering blessings…
            </p>
          ) : (
            strips.length > 0 && (
              <>
                {/* One wish, featured, changing every few seconds */}
                {feature && (
                  <figure className="mx-auto mt-8 min-h-[8.5rem] max-w-[19rem]" style={fade(200)}>
                    <LotusIcon className="mx-auto h-4 w-auto" />
                    <div style={{ opacity: featureShown ? 1 : 0, transition: `opacity 450ms ${EASE.silk}` }}>
                      <blockquote
                        lang={isOdia(feature.message) ? "or" : undefined}
                        className={`mt-2.5 leading-snug ${isOdia(feature.message) ? "font-odia text-[16px]" : "font-serif text-[18px] italic"}`}
                        style={{ color: "#4A2E1A" }}
                      >
                        “{feature.message}”
                      </blockquote>
                      <figcaption className="talapatra-by mt-2">{byline(feature)}</figcaption>
                    </div>
                  </figure>
                )}

                {/* The latest wishes on palm-leaf strips */}
                <Pothi wishes={strips} className="mt-6" style={fade(280)} />
              </>
            )
          )}
        </div>

        <p className="mt-5 font-sans text-[12px] tracking-[0.04em]" style={{ ...fade(320), color: MUTED_GOLD }}>
          {count > 0 ? `${count} ${count === 1 ? "blessing" : "blessings"} received` : "Be the first to leave a blessing"}
        </p>

        <div className="mt-6" style={fade(360)}>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            aria-haspopup="dialog"
            className="t-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-8 text-[14px] text-[#FBF3E4] shadow-[0_10px_20px_-12px_rgb(122_20_36/0.8)] transition duration-200 ease-silk active:scale-[0.98]"
            style={{ backgroundColor: MAROON }}
          >
            Leave a Blessing
          </button>
          {(count > 0 || mine.length > 0) && (
            <button type="button" onClick={() => setAllOpen(true)} aria-haspopup="dialog" className="mx-auto mt-2 block min-h-11 px-3 font-sans text-[13.5px] underline decoration-[#C9A86A] underline-offset-4" style={{ color: MAROON }}>
              View all wishes
            </button>
          )}
        </div>
      </div>

      <Sheet open={formOpen} onClose={() => setFormOpen(false)} label="Leave a Blessing">
        {formOpen && <BlessingForm onSent={(w) => setMine((p) => [w, ...p])} onClose={() => setFormOpen(false)} />}
      </Sheet>
      <Sheet open={allOpen} onClose={() => setAllOpen(false)} label="All wishes">
        {allOpen && <AllWishes mine={mine} fill={fill} />}
      </Sheet>
    </section>
  );
}

/**
 * Palm-leaf strips, a little overlapped and tilted, with a red thread drawn
 * through their string holes (measured, so it follows a strip that opens).
 */
function Pothi({ wishes, className = "", style, tilt = true }: { wishes: Wish[]; className?: string; style?: CSSProperties; tilt?: boolean }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [thread, setThread] = useState<{ left: number; top: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const holes = [...list.querySelectorAll<HTMLElement>(".talapatra-hole")];
      if (holes.length === 0) return setThread(null);
      const box = list.getBoundingClientRect();
      const centre = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
      };
      const a = centre(holes[0]);
      const b = centre(holes[holes.length - 1]);
      setThread({ left: a.x - 0.65, top: a.y - 14, height: b.y - a.y + 28 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    list.querySelectorAll(".talapatra").forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [wishes]);

  return (
    <div className={`relative ${className}`} style={style}>
      <ul ref={listRef} aria-label="Wishes" className="relative">
        {wishes.map((w, i) => (
          <li key={w.id} className={i ? "-mt-2" : ""}>
            <Talapatra wish={w} tilt={tilt ? TILTS[i % TILTS.length] : 0} />
          </li>
        ))}
        {thread && <span aria-hidden className="talapatra-thread z-10" style={{ left: thread.left, top: thread.top, height: thread.height }} />}
      </ul>
    </div>
  );
}

/** One wish on a palm-leaf strip: folded to two lines, opening to the whole wish when tapped. */
function Talapatra({ wish, tilt }: { wish: Wish; tilt: number }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState(FOLDED);
  const odia = isOdia(wish.message);

  // measured on the unclipped words inside, so it follows the font arriving or the width changing
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const measure = () => setFull(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [wish.message]);

  const foldable = full > FOLDED + 2;
  const body = (
    <>
      <span aria-hidden className="talapatra-hole" />
      <span lang={odia ? "or" : undefined} className={`talapatra-text ${odia ? "odia" : ""} ${foldable && !open ? "folded" : ""}`} style={{ maxHeight: open ? full : FOLDED }}>
        <span ref={textRef} className="block">
          {wish.message}
        </span>
      </span>
      <span className="talapatra-by">{byline(wish)}</span>
    </>
  );

  // one element throughout (swapping it would detach the measured words); a button only when there's more to read
  const toggle = () => foldable && setOpen((o) => !o);
  return (
    <div
      role={foldable ? "button" : undefined}
      tabIndex={foldable ? 0 : undefined}
      aria-expanded={foldable ? open : undefined}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      className={`talapatra ${foldable ? "cursor-pointer transition-transform duration-300 ease-silk active:scale-[0.99]" : ""}`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {body}
    </div>
  );
}

type Status = "idle" | "saving" | "sent" | "error";

/** The "Leave a Blessing" sheet: name, relation, message; then a marigold petal rises. */
function BlessingForm({ onSent, onClose }: { onSent: (w: Wish) => void; onClose: () => void }) {
  const { formHeading, formText, relations, allowAnonymous, maxLength } = wedding.wishes;
  const { guestName, isPersonalized } = useGuest();
  const [name, setName] = useState(isPersonalized ? guestName : "");
  const [relation, setRelation] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState("");
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
    else if (m.length > maxLength) next.message = `Please keep your blessing under ${maxLength} characters.`;
    setErrors(next);
    if (next.name || next.message) return;

    const wish = { id: pendingId.current, name: n || null, relation, message: m };
    const sent = () => {
      onSent({ ...wish, created_at: new Date().toISOString() });
      pendingId.current = newId();
      setStatus("sent");
    };

    if (trap) {
      // Almost certainly a bot: look successful, store nothing.
      setStatus("sent");
      return;
    }
    if (PREVIEW) return sent(); // kept in this browser only; the sheet says so
    if (guard.coolingDown()) {
      setStatus("error");
      setErrorText("Please wait a moment before sending another blessing.");
      return;
    }
    if (guard.tooFast()) {
      setStatus("error");
      setErrorText("That was quick! Please take a moment and send it again.");
      return;
    }

    setStatus("saving");
    try {
      await addWish(wish);
      guard.markSubmitted();
      sent();
    } catch (err) {
      setStatus("error");
      setErrorText(err instanceof BackendError ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (status === "sent") {
    return (
      <div className="pb-4 pt-6 text-center" role="status">
        <svg viewBox="0 0 24 34" className="petal-rise mx-auto h-9 w-auto" aria-hidden>
          <path d="M12 1C19 8 21 18 17 26 15 30 13 32 12 33 11 32 9 30 7 26 3 18 5 8 12 1Z" fill="#F29A2E" />
          <path d="M12 5V30" stroke="#FFD27A" strokeWidth="1" opacity="0.8" />
        </svg>
        <p className="mt-2 font-serif text-[22px] font-semibold leading-snug" style={{ color: MAROON }}>
          Your blessing has been sent to the couple
        </p>
        <p className="t-note mx-auto mt-2 max-w-[18rem]">
          {PREVIEW ? "Preview — it isn't saved online yet; it's kept on this device." : "It will appear on the wall once they've seen it."}
        </p>
        <Button variant="secondary" className="mt-6" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onFocus={guard.touch} onInput={guard.touch} noValidate>
      <div className="text-center">
        <h3 className="font-serif text-[28px] font-semibold leading-tight" style={{ color: MAROON }}>
          {formHeading}
        </h3>
        <p className="t-body mt-1" style={{ color: TEXT_SOFT }}>
          {formText}
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <Field label="Your name" error={errors.name} optional={allowAnonymous}>
          <input className={controlClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} />
        </Field>

        <fieldset>
          <legend className="t-label mb-2 text-[12px]">
            Relation <span className="normal-case tracking-normal opacity-70">(optional)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {relations.map((r) => (
              <label key={r} className="cursor-pointer">
                <input type="radio" name="relation" value={r} checked={relation === r} onChange={() => setRelation(r)} onClick={() => relation === r && setRelation(null)} className="peer sr-only" />
                <span className="inline-flex min-h-10 items-center rounded-full border border-[#C9A86A] px-4 font-sans text-[13.5px] transition-colors peer-checked:border-transparent peer-checked:bg-[#7A1424] peer-checked:text-[#FBF3E4] peer-focus-visible:ring-2 peer-focus-visible:ring-sindoor/30">
                  {r}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Your blessing" error={errors.message} hint={`${message.length}/${maxLength}`}>
          <textarea className={`${controlClass} min-h-28 resize-y`} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={maxLength} rows={4} />
        </Field>
        <Honeypot value={trap} onChange={setTrap} />

        <button
          type="submit"
          disabled={status === "saving"}
          className="t-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-[#FBF3E4] shadow-[0_10px_20px_-12px_rgb(122_20_36/0.8)] transition duration-200 ease-silk active:scale-[0.98] disabled:opacity-60"
          style={{ backgroundColor: MAROON }}
        >
          {status === "saving" ? "Sending…" : "Send Blessing"}
        </button>
        <p role="status" className={`t-note min-h-5 text-center ${status === "error" ? "font-medium text-sindoor" : ""}`}>
          {status === "error" ? errorText : PREVIEW ? "Preview — blessings aren't saved online yet." : "Blessings appear on the wall once the couple has seen them."}
        </p>
      </div>
    </form>
  );
}

/**
 * Every approved wish, a page at a time, on palm-leaf strips; this browser's
 * own blessings first, marked as waiting for the couple; then the sample
 * wishes the wall is showing, if any.
 */
function AllWishes({ mine, fill }: { mine: Wish[]; fill: Wish[] }) {
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

  // once approved, a blessing shows with the others rather than as waiting
  const waiting = mine.filter((w) => !items.some((i) => i.id === w.id));
  const shown = [...items, ...fill];
  const count = (total ?? 0) + fill.length;

  return (
    <div>
      <h3 className="t-heading text-center" style={{ color: MAROON }}>
        All Wishes
      </h3>
      {total !== null && count > 0 && (
        <p className="t-note mt-1 text-center">
          {count} {count === 1 ? "blessing" : "blessings"} received
        </p>
      )}

      {waiting.length > 0 && (
        <div className="mt-6">
          <p className="t-label text-center text-[11px]">Yours — waiting for the couple</p>
          <Pothi wishes={waiting} className="mt-3" tilt={false} />
        </div>
      )}

      {shown.length > 0 ? (
        <Pothi wishes={shown} className="mt-6" />
      ) : (
        state === "ready" && waiting.length === 0 && <p className="t-quote mt-6 text-center">No wishes yet — be the first to leave one.</p>
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
