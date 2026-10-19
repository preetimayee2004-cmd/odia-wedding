import { forwardRef, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { wedding } from "@/config/wedding";
import { useInView } from "@/hooks/useInView";
import { showPlaceholders } from "@/lib/placeholders";
import { EASE } from "@/lib/motion";
import { PhotoViewer } from "@/components/ui/PhotoViewer";
import { ChampaSprig, JhotiRule } from "@/components/ui/JhotiThreshold";
import { GoldArchFrame, type DoorState } from "@/components/art/GoldArch";

type Photo = (typeof wedding.gallery.photos)[number];

// While placeholders are on: the shape of the gallery while the couple's photographs are awaited.
const PLACEHOLDERS: Photo[] = [false, true, false, false, false, true, true].map((tall, i) => ({
  src: "",
  alt: `Photograph ${i + 1}`,
  tall,
  featured: i === 0,
}));

/** Door timing: the grid's, the featured arch's, and the stagger between frames that open together. */
const DOOR_MS = 900;
const FEATURED_MS = 1100;
const STAGGER_MS = 120;
/** A frame's doors: closed, opening, or open (taken away). */
type Doors = DoorState | { state: "open" };
/** How far a photograph drifts inside its frame as the page scrolls (px each way). */
const PARALLAX = 12;

/**
 * Section 07 — The Raghurajpur Canvas.
 * The couple's photographs hung like an exhibition on the page cream: one
 * featured in a wide arch across both columns, then a two-column staggered
 * grid (the right column a little lower), each in a light jharokha frame —
 * gold, cream and maroon lines with a small gold lotus on top. Each frame's
 * wooden doors swing open once it is a third in view (frames entering
 * together open 120ms apart; the featured one first and slower) while the
 * photograph settles to its size; in view, photographs drift gently against
 * the scroll. The featured photo can be switched to its Pattachitra
 * painting. A tap, or "View all photos", opens the full-screen viewer.
 * With reduced motion: no doors, no drift, and the viewer simply fades.
 * Hidden in production until photos are added.
 */
export function Gallery() {
  const { eyebrow, heading, photos } = wedding.gallery;
  const headerRef = useRef<HTMLDivElement>(null);
  const headerIn = useInView(headerRef);
  const reduced = usePrefersReducedMotion();
  const [viewing, setViewing] = useState<number | null>(null);
  const [doors, setDoors] = useState<ReadonlyMap<number, Doors>>(() => new Map());
  const [painting, setPainting] = useState(false);
  const [paintingReady, setPaintingReady] = useState(false);
  const frames = useRef<(HTMLElement | null)[]>([]);

  const real = photos.length > 0;
  const items = real ? photos : PLACEHOLDERS;
  // the viewer's order: the featured photograph first, then the grid
  const featured = items.find((p) => p.featured) ?? items[0];
  const grid = items.filter((p) => p !== featured);
  const order = [featured, ...grid];
  const columns = [grid.map((p, i) => ({ p, i: i + 1 })).filter((_, k) => k % 2 === 0), grid.map((p, i) => ({ p, i: i + 1 })).filter((_, k) => k % 2 === 1)];

  // the Pattachitra painting's toggle appears only once the painting exists
  useEffect(() => {
    if (!featured?.painting || !real) return;
    const img = new Image();
    img.onload = () => setPaintingReady(true);
    img.src = featured.painting;
  }, [featured?.painting, real]);

  // One observer for every frame: the doors open once a frame is 35% in view;
  // the frames in view drift with the scroll (transform only, each frame).
  useEffect(() => {
    if (reduced || !real) return;
    const opened = new Set<number>();
    const inView = new Set<HTMLElement>();
    let frame = 0;

    const drift = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of inView) {
        const par = el.querySelector<HTMLElement>(".arch-par");
        if (!par) continue;
        const r = el.getBoundingClientRect();
        // -1 with the frame at the bottom of the screen, 1 at the top: the photograph lags behind the scroll
        const p = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2)));
        par.style.transform = `translate3d(0, ${(p * PARALLAX).toFixed(1)}px, 0)`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(drift);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const toOpen: number[] = [];
        for (const e of entries) {
          const el = e.target as HTMLElement;
          const i = Number(el.dataset.index);
          if (e.isIntersecting && el.dataset.still !== "true") inView.add(el);
          else inView.delete(el);
          if (e.intersectionRatio >= 0.35 && !opened.has(i)) {
            opened.add(i);
            toOpen.push(i);
          }
        }
        schedule();
        if (!toOpen.length) return;
        toOpen.sort((a, b) => a - b);
        const opening = toOpen.map((i, k) => ({ i, ms: i === 0 ? FEATURED_MS : DOOR_MS, delay: k * STAGGER_MS }));
        setDoors((prev) => {
          const next = new Map(prev);
          for (const o of opening) next.set(o.i, { state: "opening", ms: o.ms, delay: o.delay });
          return next;
        });
        // once open, the doors are taken away
        for (const o of opening) {
          window.setTimeout(() => setDoors((prev) => new Map(prev).set(o.i, { state: "open" })), o.delay + o.ms + 60);
        }
      },
      { threshold: [0, 0.35] },
    );
    frames.current.forEach((el) => el && io.observe(el));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [reduced, real]);

  if (!real && !showPlaceholders) return null;

  const doorsFor = (i: number): DoorState | undefined => {
    if (reduced || !real) return undefined;
    const d = doors.get(i);
    if (!d) return { state: "closed" };
    return d.state === "opening" ? d : undefined;
  };
  const frameProps = (photo: Photo, i: number) => ({
    ref: (el: HTMLDivElement | null) => {
      frames.current[i] = el;
    },
    photo,
    index: i,
    doors: doorsFor(i),
    onOpen: photo.src ? () => setViewing(i) : undefined,
  });

  // the featured photograph as currently shown (photo or painting) in the viewer
  const viewerPhotos = order.map((p, i) =>
    i === 0 && painting && paintingReady && p.painting ? { ...p, src: p.painting, alt: `${p.alt}, as a Pattachitra painting` } : p,
  );

  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="px-[var(--gutter)] py-[var(--section-y)]">
      <div ref={headerRef} className="text-center" style={{ opacity: headerIn ? 1 : 0, transition: `opacity 900ms ${EASE.silk}` }}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="gallery-heading" className="t-heading mt-1.5" style={{ color: "#7A1424" }}>
          {heading}
        </h2>
        <JhotiRule motif="champa" className="mt-3" />
      </div>

      <div className="mx-auto mt-10 max-w-[32rem]">
        {/* the featured photograph, in a wide arch across both columns */}
        <div className="relative">
          <ArchFrame {...frameProps(featured, 0)} featured painting={paintingReady ? featured.painting ?? null : null} showPainting={painting} />
          {paintingReady && featured.painting && (
            <button
              type="button"
              onClick={() => setPainting((v) => !v)}
              aria-pressed={painting}
              aria-label={painting ? "Show the photograph" : "Show it as a Pattachitra painting"}
              className="gal-pill absolute bottom-[22px] right-[22px]"
            >
              <span lang="or" className="font-odia">
                ପଟ୍ଟଚିତ୍ର
              </span>{" "}
              · Pattachitra
            </button>
          )}
        </div>

        {/* the grid: two columns, the right one hanging 40px lower */}
        <div className="mt-5 grid grid-cols-2 items-start gap-x-4">
          {columns.map((col, c) => (
            <ul key={c} className={`relative flex flex-col gap-5 ${c === 1 ? "pt-10" : ""}`}>
              {/* the right column hangs lower: a small champa in the space above it */}
              {c === 1 && <ChampaSprig className="absolute left-1/2 top-0 h-[30px] w-auto -translate-x-1/2" style={{ opacity: headerIn ? 1 : 0, transition: `opacity 900ms ${EASE.silk} 400ms` }} />}
              {col.map(({ p, i }) => (
                <li key={p.src || p.alt}>
                  <ArchFrame {...frameProps(p, i)} />
                </li>
              ))}
            </ul>
          ))}
        </div>

        {real && (
          <div className="mt-8 text-center">
            <button type="button" onClick={() => setViewing(0)} className="gal-all">
              View all photos
            </button>
          </div>
        )}
      </div>

      {real && (
        <PhotoViewer
          photos={viewerPhotos}
          index={viewing}
          onIndex={setViewing}
          onClose={() => setViewing(null)}
          frameFor={(i) => frames.current[i]?.querySelector<HTMLElement>("button.arch-btn") ?? null}
        />
      )}
    </section>
  );
}

/** One photograph in its jharokha, behind its doors until they open, and a button to the viewer. */
const ArchFrame = forwardRef<
  HTMLDivElement,
  { photo: Photo; index: number; doors?: DoorState; onOpen?: () => void; featured?: boolean; painting?: string | null; showPainting?: boolean }
>(function ArchFrame({ photo, index, doors, onOpen, featured = false, painting = null, showPainting = false }, ref) {
  const height = featured ? 225 : photo.tall ? 440 : 360; // the featured arch is 4:3

  const frame = (
    <GoldArchFrame height={height} rise={featured ? 62 : 104} doors={doors} still={photo.still}>
      {photo.src ? (
        <>
          <img
            src={photo.src}
            alt={photo.alt}
            loading={featured ? "eager" : "lazy"}
            {...(featured ? { fetchpriority: "high" } : {})} // React 18 passes it through only in lower case
            decoding="async"
            className="arch-img absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: photo.focus, transformOrigin: photo.focus, opacity: showPainting && painting ? 0 : 1 }}
          />
          {painting && (
            <img
              src={painting}
              alt=""
              aria-hidden={!showPainting}
              decoding="async"
              className="arch-img absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: photo.focus, transformOrigin: photo.focus, opacity: showPainting ? 1 : 0 }}
            />
          )}
        </>
      ) : (
        <div
          title="Photograph awaiting the couple"
          className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-ink-soft/40 bg-[#F3ECDF] text-ink-soft/70"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
            <rect x="3" y="6" width="22" height="16" rx="2" />
            <circle cx="14" cy="14" r="4.5" />
            <path d="M9 6l1.6-2.5h6.8L19 6" />
          </svg>
          <span className="t-label">Photo</span>
        </div>
      )}
    </GoldArchFrame>
  );

  return (
    <div ref={ref} data-index={index} data-still={photo.still ? "true" : undefined}>
      {onOpen ? (
        <button
          type="button"
          onClick={(e) => {
            e.currentTarget.focus({ preventScroll: true }); // so focus comes back here when the viewer closes
            onOpen();
          }}
          aria-haspopup="dialog"
          aria-label={`View photograph: ${showPainting && painting ? `${photo.alt}, as a Pattachitra painting` : photo.alt}`}
          className="arch-btn relative block w-full rounded-t-full px-[5px] pb-[5px] pt-[14px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8893A]"
        >
          {frame}
        </button>
      ) : (
        <div className="relative rounded-t-full px-[5px] pb-[5px] pt-[14px]">{frame}</div>
      )}
    </div>
  );
});
