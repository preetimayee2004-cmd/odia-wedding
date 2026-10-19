import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";

export interface ViewerPhoto {
  src: string;
  alt: string;
  /** Where the photograph's frame crops it (CSS object-position, e.g. "50% 30%"). */
  focus?: string;
}

const OPEN_MS = 350;
const CLOSE_MS = 350;
const FADE_MS = 260;
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_IN_OUT = "cubic-bezier(0.4, 0, 0.2, 1)";

/** "50% 30%", "right bottom"… → fractions across and down. */
function parseFocus(focus = "50% 50%"): [number, number] {
  const words: Record<string, number> = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 };
  const parts = focus.trim().split(/\s+/);
  const read = (p: string | undefined) => (p === undefined ? 0.5 : p.endsWith("%") ? parseFloat(p) / 100 : words[p] ?? 0.5);
  // keywords may come in either order ("bottom right")
  if (parts[0] === "top" || parts[0] === "bottom") return [read(parts[1]), read(parts[0])];
  return [read(parts[0]), read(parts[1])];
}

const onScreen = (r: DOMRect) => r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;

/**
 * The whole photograph (as shown in the viewer) scaled down to cover the
 * box it fills in the gallery (`box`, its parallax layer) and clipped to the
 * frame's window (`win`) with the arch's rounded top: the photograph as it
 * sits in its frame.
 */
function inFrame(img: HTMLImageElement, box: DOMRect, win: DOMRect, focus?: string): Keyframe {
  const f = img.getBoundingClientRect();
  const s = Math.max(box.width / f.width, box.height / f.height);
  const vw = box.width / s; // the part of the photograph the box shows, in the image's own pixels
  const vh = box.height / s;
  const [fx, fy] = parseFocus(focus);
  const left = (f.width - vw) * fx;
  const top = (f.height - vh) * fy;
  // move the shown part's centre onto the box's centre (scaling about the image's centre)
  const ox = left + vw / 2 - f.width / 2;
  const oy = top + vh / 2 - f.height / 2;
  const dx = box.left + box.width / 2 - (f.left + f.width / 2) - s * ox;
  const dy = box.top + box.height / 2 - (f.top + f.height / 2) - s * oy;
  // the window, in the image's own pixels
  const cl = left + (win.left - box.left) / s;
  const ct = top + (win.top - box.top) / s;
  const cw = win.width / s;
  const ch = win.height / s;
  const r = cw / 2;
  return {
    transform: `translate(${dx}px, ${dy}px) scale(${s})`,
    clipPath: `inset(${ct}px ${f.width - cl - cw}px ${f.height - ct - ch}px ${cl}px round ${r}px ${r}px 0px 0px)`,
  };
}
/** Settled in the viewer (the inset leaves room for its fine gold keyline and shadow). */
const SETTLED: Keyframe = { transform: "none", clipPath: "inset(-40px -40px -40px -40px round 3px 3px 3px 3px)" };

/**
 * The gallery's full-screen viewer — the "living photograph". A tapped
 * photograph rises out of its arch: the whole picture grows from the frame's
 * window to the centre of the screen over a maroon overlay, uncropped and
 * sharp. It shows its place in the set, its caption, close and previous /
 * next (also arrow keys and a swipe across); Escape, a swipe down or a tap
 * outside closes. On
 * closing, the photograph showing settles back into its own frame (scrolled
 * into view behind the overlay if the guest moved on), and focus returns to
 * that frame. Built on the native <dialog>, so focus stays inside and the
 * page behind is inert; the page doesn't scroll while it's open. With
 * reduced motion it simply fades. Styles: `.pv` in index.css.
 */
export function PhotoViewer({
  photos,
  index,
  onIndex,
  onClose,
  frameFor,
}: {
  photos: ViewerPhoto[];
  /** The photograph showing, or null when closed. */
  index: number | null;
  onIndex: (index: number) => void;
  onClose: () => void;
  /** The gallery button holding a photograph's frame: where it rises from and settles back to. */
  frameFor?: (index: number) => HTMLElement | null;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const last = useRef(0); // keeps the photograph on screen while it settles back
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const byPointer = useRef(false); // closed by tap or click (no focus ring then), or by keyboard
  const [shown, setShown] = useState(false);
  const [dir, setDir] = useState(0);
  const open = index !== null;
  const n = photos.length;
  if (index !== null) last.current = index;
  useScrollLock(open);

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /** A photograph's place in its frame — the box it fills and the window it shows through — scrolled into view first if needed. */
  const frameWindow = (i: number, scroll: boolean) => {
    const button = frameFor?.(i);
    const win = button?.querySelector(".arch-window");
    if (!button || !win) return null;
    if (scroll && !onScreen(win.getBoundingClientRect())) button.scrollIntoView({ block: "center" });
    const w = win.getBoundingClientRect();
    return { win: w, box: (button.querySelector(".arch-par") ?? win).getBoundingClientRect() };
  };

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open) {
      if (dialog.open) return;
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setDir(0);
      dialog.showModal();
      let frame = requestAnimationFrame(() => {
        setShown(true);
        const img = imgRef.current;
        if (!img) return;
        const rise = () => {
          const from = frameWindow(last.current, false);
          if (reduced() || !from || !onScreen(from.win)) {
            img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduced() ? 200 : 320, easing: "ease-out" });
            return;
          }
          img.animate([{ ...inFrame(img, from.box, from.win, photos[last.current]?.focus), opacity: 1 }, { ...SETTLED, opacity: 1 }], { duration: OPEN_MS, easing: EASE_OUT });
        };
        if (img.complete && img.naturalWidth) rise();
        else {
          img.style.opacity = "0";
          img.addEventListener("load", () => {
            img.style.opacity = "";
            frame = requestAnimationFrame(rise);
          }, { once: true });
        }
      });
      return () => cancelAnimationFrame(frame);
    }

    // closing: settle back into the frame, then close
    setShown(false);
    if (!dialog.open) return;
    const img = imgRef.current;
    const button = frameFor?.(last.current) ?? null;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      dialog.close();
      img?.getAnimations().forEach((a) => a.cancel());
      // back to the photograph's frame; its focus ring only for keyboard use
      (button ?? opener.current)?.focus({ preventScroll: true, focusVisible: !byPointer.current } as FocusOptions);
    };
    const to = img && !reduced() ? frameWindow(last.current, true) : null;
    if (img && to && onScreen(to.win)) {
      const back = img.animate([{ ...SETTLED, opacity: 1 }, { ...inFrame(img, to.box, to.win, photos[last.current]?.focus), opacity: 1 }], { duration: CLOSE_MS, easing: EASE_IN_OUT, fill: "forwards" });
      back.finished.then(finish, finish);
    } else {
      img?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MS, easing: "ease-in", fill: "forwards" });
    }
    const timer = window.setTimeout(finish, (to ? CLOSE_MS : FADE_MS) + 80); // in case an animation never finishes
    return () => clearTimeout(timer);
  }, [open]); // runs on opening and closing only; the photograph and its frame are read as they are then

  const go = (step: number) => {
    if (index === null || n < 2) return;
    setDir(step);
    onIndex((index + step + n) % n);
  };

  // arrow keys (Escape is the dialog's own)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // the neighbours load ahead, so moving through the set is instant
  useEffect(() => {
    if (index === null || n < 2) return;
    for (const step of [1, -1]) new Image().src = photos[(index + step + n) % n].src;
  }, [index, n, photos]);

  const onPointerDown = (e: PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY };
    swiped.current = false;
    byPointer.current = true;
  };
  const onPointerUp = (e: PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const across = Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4;
    const down = dy > 80 && dy > Math.abs(dx) * 1.4; // a swipe down closes
    swiped.current = across || down;
    if (across) go(dx < 0 ? 1 : -1);
    else if (down) onClose();
  };
  // a tap outside the photograph closes; the end of a swipe doesn't
  const onBackdrop = () => {
    if (swiped.current) swiped.current = false;
    else onClose();
  };

  const photo = photos[last.current];
  if (!photo) return null;

  return (
    <dialog
      ref={ref}
      aria-label="Photographs"
      onCancel={(e) => {
        e.preventDefault(); // settle back instead of closing at once
        onClose();
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onKeyDown={() => (byPointer.current = false)}
      className={`pv fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-transparent ${shown ? "pv-shown" : ""}`}
    >
      <div aria-hidden className="pv-backdrop absolute inset-0" onClick={onBackdrop} />

      <div className="pointer-events-none absolute inset-0 flex flex-col">
        <div className="pv-top pv-fade flex items-center justify-between px-4">
          <p className="pv-count" aria-live="polite">
            <span className="sr-only">Photograph </span>
            {last.current + 1}
            <span aria-hidden> / </span>
            <span className="sr-only"> of </span>
            {n}
          </p>
          <button type="button" onClick={onClose} aria-label="Close" className="pv-btn pointer-events-auto">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <figure className="m-0 flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4">
          <img ref={imgRef} key={last.current} src={photo.src} alt={photo.alt} data-dir={dir} className="pv-img pointer-events-auto" draggable={false} />
          <figcaption className="pv-caption pv-fade">{photo.alt}</figcaption>
        </figure>

        {n > 1 && (
          <div className="pv-bottom pv-fade flex items-center justify-center gap-10">
            <button type="button" onClick={() => go(-1)} aria-label="Previous photograph" className="pv-btn pointer-events-auto">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M11 3.5L5.5 9l5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next photograph" className="pv-btn pointer-events-auto">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M7 3.5L12.5 9 7 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
