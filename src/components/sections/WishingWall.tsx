import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { wedding } from "@/config/wedding";
import { useGuest } from "@/context/GuestContext";
import { useInView } from "@/hooks/useInView";
import { addWish, BackendError, backendReady, listWishes, newId, type Wish } from "@/lib/backend";
import { EASE } from "@/lib/motion";
import { demoMode, showPlaceholders } from "@/lib/placeholders";
import { useSpamGuard } from "@/lib/spam";
import { Button } from "@/components/ui/Button";
import { Honeypot } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { Toran } from "@/components/art/Toran";

const PAGE = 20;
const MAROON = "#7A1424";
/** The note box's stroke and the Leave a Wish button. */
const RUST = "#8A3B2C";
const TEXT_SOFT = "#6B4A3A";
/** Both note boxes: white, rounded, with a rust stroke. */
const BOX =
  "rounded-2xl border-[1.5px] bg-white text-left text-ink placeholder:text-ink-soft/55 focus:outline-none focus:shadow-[0_0_0_3px_rgb(138_59_44/0.12)] focus-within:shadow-[0_0_0_3px_rgb(138_59_44/0.12)]";
/** The notes' papers, in turn: cream, blush, butter. */
const PAPERS = ["#FCF7EA", "#FBE9E6", "#F8F1D5"];
/** Each note's slight tilt, in turn. */
const TILTS = [-0.8, 0.7, -0.4];

/**
 * Without a database on the live site (no Supabase keys yet), while the site
 * shows its example wedding or its full structure, the wall runs as a
 * preview: a blessing is kept in this browser only, and the form says so.
 */
const PREVIEW = !backendReady && (demoMode || showPlaceholders);
/** This browser's own blessings (awaiting the couple), newest first. */
const MINE_STORE = "tila:preview-wishes";

/** The sample wishes that fill empty notes in the example wedding (or while placeholders are on). */
const SAMPLES: Wish[] = demoMode || showPlaceholders
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

/**
 * Section 09 — The Wishing Wall, handcrafted and Odia.
 * Under a toran of mango leaves and marigolds: the heading and a line of
 * blessing; the latest wishes on notes of lined paper, each pinned with a
 * marigold; "View all wishes"; and "Write your note", with a box for the
 * name, a box for the blessing, and Leave a Wish. New blessings wait for the
 * couple's approval before they appear.
 */
export function WishingWall() {
  if (!backendReady && !demoMode && !showPlaceholders) return null;
  return <WishingWallSection />;
}

function WishingWallSection() {
  const { heading, quote, previewCount } = wedding.wishes;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.08 });

  // The approved wishes
  const [approved, setApproved] = useState<Wish[] | null>(backendReady ? null : []);
  const [total, setTotal] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  // This browser's own blessings, waiting for the couple
  const [mine, setMine] = useState<Wish[]>(readMine);
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
  // sample wishes fill any empty notes, so the wall is never blank
  const fill = SAMPLES.slice(0, Math.max(0, previewCount - real.length));
  const notes = [...real, ...fill];
  const count = total + fill.length;

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
            notes.length > 0 && (
              <>
                {/* The latest wishes, each on a note pinned with a marigold */}
                <Notes wishes={notes} className="mt-8" style={fade(200)} />
              </>
            )
          )}
        </div>

        {(count > 0 || mine.length > 0) && (
          <button
            type="button"
            onClick={() => setAllOpen(true)}
            aria-haspopup="dialog"
            className="mx-auto mt-5 block min-h-11 px-3 font-sans text-[13.5px] underline decoration-[#C9A86A] underline-offset-4"
            style={{ ...fade(320), color: MAROON }}
          >
            View all wishes{count > 0 ? ` (${count})` : ""}
          </button>
        )}

        <WishForm onSent={(w) => setMine((p) => [w, ...p])} style={fade(360)} />
      </div>

      <Sheet open={allOpen} onClose={() => setAllOpen(false)} label="All wishes">
        {allOpen && <AllWishes mine={mine} fill={fill} />}
      </Sheet>
    </section>
  );
}

/** "— ANANYA · BRIDE'S COUSIN": the name in maroon, the relation softer; sample wishes add "· Example". */
function Byline({ wish }: { wish: Wish }) {
  return (
    <>
      <b>— {wish.name ?? "A well-wisher"}</b>
      {wish.relation && <> · {wish.relation}</>}
      {wish.id.startsWith("sample-") && <span className="opacity-75"> · Example</span>}
    </>
  );
}

/** Notes of lined paper, zig-zagging left and right down the wall. */
function Notes({ wishes, className = "", style }: { wishes: Wish[]; className?: string; style?: CSSProperties }) {
  return (
    <ul aria-label="Wishes" className={`space-y-6 pt-3 ${className}`} style={style}>
      {wishes.map((w, i) => (
        <li key={w.id} className={`wish-note ${i % 2 ? "ml-auto" : "mr-auto"}`} style={{ backgroundColor: PAPERS[i % PAPERS.length], transform: `rotate(${TILTS[i % TILTS.length]}deg)` }}>
          <MarigoldPin className="absolute left-1/2 top-[-12px] h-6 w-6 -translate-x-1/2" />
          <p lang={isOdia(w.message) ? "or" : undefined} className={`wish-note-text ${isOdia(w.message) ? "odia" : ""}`}>
            {w.message}
          </p>
          <p className="wish-byline mt-1.5 text-right">
            <Byline wish={w} />
          </p>
        </li>
      ))}
    </ul>
  );
}

/** A marigold head, pinning a note. */
function MarigoldPin({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="-12 -12 24 24" className={className} aria-hidden>
      <defs>
        <radialGradient id={id} cx="0.45" cy="0.4" r="0.65">
          <stop offset="0" stopColor="#FFC85A" />
          <stop offset="0.6" stopColor="#F39424" />
          <stop offset="1" stopColor="#DA6F12" />
        </radialGradient>
      </defs>
      <g fill={`url(#${id})`}>
        {Array.from({ length: 12 }, (_, k) => (
          <ellipse key={k} cx="0" cy="-6.6" rx="2.8" ry="4.6" transform={`rotate(${k * 30})`} />
        ))}
      </g>
      <circle r="6.2" fill={`url(#${id})`} />
      <circle r="6.2" fill="none" stroke="#C9650F" strokeWidth="0.7" strokeDasharray="1.4 1.3" opacity="0.6" />
      <circle r="2.6" fill="#C2560C" opacity="0.75" />
    </svg>
  );
}

type Status = "idle" | "saving" | "sent" | "error";

/**
 * "Write your note": a box for the name and a box for the blessing (with a
 * counter), each white with a rust stroke, then Leave a Wish. When sent, a
 * marigold petal rises over "Your blessing has been sent to the couple".
 */
function WishForm({ onSent, style }: { onSent: (w: Wish) => void; style?: CSSProperties }) {
  const { formHeading, allowAnonymous, maxLength } = wedding.wishes;
  const { guestName, isPersonalized } = useGuest();
  const [name, setName] = useState(isPersonalized ? guestName : "");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const pendingId = useRef(newId()); // reused on retry so a resend can't duplicate
  const guard = useSpamGuard("tila:wish-sent-at", 30_000);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "saving") return;

    const n = name.trim();
    const m = message.trim();
    const problem =
      !n && !allowAnonymous
        ? "Please add your name."
        : n.length > 60
          ? "Please keep your name under 60 characters."
          : m.length < 2
            ? "Please write a few words."
            : m.length > maxLength
              ? `Please keep your blessing under ${maxLength} characters.`
              : "";
    setError(problem);
    if (problem) {
      setStatus("error");
      return;
    }

    const wish = { id: pendingId.current, name: n || null, relation: null, message: m };
    const sent = () => {
      onSent({ ...wish, created_at: new Date().toISOString() });
      pendingId.current = newId();
      setMessage("");
      setStatus("sent");
    };

    if (trap) {
      // Almost certainly a bot: look successful, store nothing.
      setMessage("");
      setStatus("sent");
      return;
    }
    if (PREVIEW) return sent(); // kept in this browser only; the form says so
    if (guard.coolingDown()) {
      setStatus("error");
      setError("Please wait a moment before sending another blessing.");
      return;
    }
    if (guard.tooFast()) {
      setStatus("error");
      setError("That was quick! Please take a moment and send it again.");
      return;
    }

    setStatus("saving");
    try {
      await addWish(wish);
      guard.markSubmitted();
      sent();
    } catch (err) {
      setStatus("error");
      setError(err instanceof BackendError ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={onSubmit} onFocus={guard.touch} onInput={guard.touch} noValidate className="mt-8" style={style}>
      <h3 className="font-serif text-[24px] font-semibold leading-tight" style={{ color: MAROON }}>
        {formHeading}
      </h3>

      {/* A box for the name */}
      <input
        aria-label="Your name"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
        maxLength={60}
        className={`mt-3 block min-h-12 w-full px-4 font-sans text-[15px] ${BOX}`}
        style={{ borderColor: RUST }}
      />

      {/* A box for the blessing */}
      <div className={`mt-3 overflow-hidden ${BOX}`} style={{ borderColor: RUST }}>
        <textarea
          aria-label="Your blessing"
          placeholder="Write your blessing for the couple…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={maxLength}
          rows={4}
          className="block min-h-28 w-full resize-none bg-transparent px-4 pt-3 font-serif text-[17px] italic leading-snug text-ink placeholder:text-ink-soft/55 focus:outline-none"
        />
        <p className="px-4 pb-2 text-right font-sans text-[11px]" style={{ color: TEXT_SOFT }}>
          {message.length}/{maxLength}
        </p>
      </div>
      <Honeypot value={trap} onChange={setTrap} />

      <button
        type="submit"
        disabled={status === "saving"}
        className="t-button mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-9 text-[14px] text-[#FBF3E4] shadow-[0_10px_20px_-12px_rgb(138_59_44/0.8)] transition duration-200 ease-silk active:scale-[0.98] disabled:opacity-60"
        style={{ backgroundColor: RUST }}
      >
        {status === "saving" ? (
          "Sending…"
        ) : (
          <>
            <span aria-hidden>♡</span> Leave a Wish
          </>
        )}
      </button>

      <div role="status" className="mt-3 min-h-5">
        {status === "sent" ? (
          <>
            <svg key={pendingId.current} viewBox="0 0 24 34" className="petal-rise mx-auto h-7 w-auto" aria-hidden>
              <path d="M12 1C19 8 21 18 17 26 15 30 13 32 12 33 11 32 9 30 7 26 3 18 5 8 12 1Z" fill="#F29A2E" />
              <path d="M12 5V30" stroke="#FFD27A" strokeWidth="1" opacity="0.8" />
            </svg>
            <p className="font-serif text-[18px] font-semibold leading-snug" style={{ color: MAROON }}>
              Your blessing has been sent to the couple
            </p>
            <p className="t-note mt-1">{PREVIEW ? "Preview — it isn't saved online yet; it's kept on this device." : "It will appear on the wall once they've seen it."}</p>
          </>
        ) : status === "error" ? (
          <p className="t-note font-medium text-sindoor">{error}</p>
        ) : (
          <p className="t-note">{PREVIEW ? "Preview — blessings aren't saved online yet." : "Blessings appear on the wall once the couple has seen them."}</p>
        )}
      </div>
    </form>
  );
}

/**
 * Every approved wish, a page at a time, on its note; this browser's own
 * blessings first, marked as waiting for the couple; then the sample wishes
 * the wall is showing, if any.
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
          <Notes wishes={waiting} className="mt-2" />
        </div>
      )}

      {shown.length > 0 ? (
        <Notes wishes={shown} className="mt-6" />
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
