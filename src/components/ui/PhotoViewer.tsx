import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";

export interface ViewerPhoto {
  src: string;
  alt: string;
}

const EXIT_MS = 280;

/**
 * The gallery's full-screen viewer, on the native <dialog>: focus moves
 * inside (and back to the photograph that opened it), Escape closes, and the
 * page behind is inert. The photograph is shown whole and uncropped on a
 * deep warm ground, with its place in the set, its caption, and previous /
 * next — by button, arrow key or swipe; a tap outside the photograph closes
 * it. It opens with a soft fade and settle, and photographs cross-fade with
 * a slight drift in the direction of travel (only the fade with reduced
 * motion). Styles: `.pv` in index.css.
 */
export function PhotoViewer({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: ViewerPhoto[];
  /** The photograph showing, or null when closed. */
  index: number | null;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const last = useRef(0); // keeps the photograph on screen while the viewer fades out
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const [shown, setShown] = useState(false);
  const [dir, setDir] = useState(0);
  const open = index !== null;
  const n = photos.length;
  if (index !== null) last.current = index;
  useScrollLock(open);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) {
        opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setDir(0);
        dialog.showModal();
      }
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    setShown(false);
    if (!dialog.open) return;
    const timer = window.setTimeout(() => {
      dialog.close();
      opener.current?.focus({ preventScroll: true });
    }, EXIT_MS);
    return () => clearTimeout(timer);
  }, [open]);

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
  };
  const onPointerUp = (e: PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    swiped.current = Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4;
    if (swiped.current) go(dx < 0 ? 1 : -1);
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
        e.preventDefault(); // fade out instead of closing at once
        onClose();
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className={`pv fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-transparent ${shown ? "pv-shown" : ""}`}
    >
      <div aria-hidden className="pv-backdrop absolute inset-0" onClick={onBackdrop} />

      <div className="pv-stage pointer-events-none absolute inset-0 flex flex-col">
        <div className="pv-top flex items-center justify-between px-4">
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
          <img key={last.current} src={photo.src} alt={photo.alt} data-dir={dir} className="pv-img pointer-events-auto" draggable={false} />
          <figcaption className="pv-caption">{photo.alt}</figcaption>
        </figure>

        {n > 1 && (
          <div className="pv-bottom flex items-center justify-center gap-10">
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
