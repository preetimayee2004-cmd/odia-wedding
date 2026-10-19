import { Children, createElement, isValidElement, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";

/** [lines, smallest scale]: fit in this many lines, shrinking the text no further than this. */
export type FitTier = readonly [lines: number, minScale: number];

/**
 * Text that keeps its design however long it runs (a name, a place, a
 * hashtag). At its own CSS size it is left alone; if it would need more
 * lines than the first tier allows, it shrinks a little at a time, down to
 * that tier's smallest scale; failing that, the next tier allows more lines,
 * and so on. Past the last tier it stays at that size and simply wraps
 * (breaking even a very long word), so it is never cut off and never spills
 * out of its box. Refits when its box changes width or the fonts load.
 *
 * It is capped at its box's width (max-width: 100%), so a long word shows
 * up as overflow to measure rather than widening the element.
 */
export function FitText({
  as = "p",
  tiers = [[1, 0.75]],
  className,
  style,
  children,
  ...rest
}: {
  as?: "p" | "h3" | "span" | "div";
  tiers?: readonly FitTier[];
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
} & Partial<Record<`aria-${string}` | "id" | "lang" | "role", string>>) {
  const ref = useRef<HTMLElement>(null);
  const key = `${textOf(children)}|${JSON.stringify(tiers)}`;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let lastWidth = -1;

    const fit = () => {
      el.style.fontSize = "";
      el.style.overflowWrap = "";
      const base = parseFloat(getComputedStyle(el).fontSize);
      if (!base) return;
      const fits = (lines: number, scale: number) => {
        el.style.fontSize = `${(base * scale).toFixed(2)}px`;
        const cs = getComputedStyle(el);
        const lh = parseFloat(cs.lineHeight) || base * scale * 1.2;
        const h = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        return el.scrollWidth <= el.clientWidth + 1 && h <= lh * lines + 1;
      };
      for (const [lines, min] of tiers) {
        if (fits(lines, 1)) {
          el.style.fontSize = "";
          return;
        }
        if (!fits(lines, min)) continue;
        // the largest scale in [min, 1) that still fits
        let lo = min;
        let hi = 1;
        for (let i = 0; i < 7; i++) {
          const mid = (lo + hi) / 2;
          if (fits(lines, mid)) lo = mid;
          else hi = mid;
        }
        el.style.fontSize = `${(base * lo).toFixed(2)}px`;
        return;
      }
      // nothing fits: the smallest size, wrapping wherever it must
      const last = tiers[tiers.length - 1];
      el.style.fontSize = `${(base * (last ? last[1] : 1)).toFixed(2)}px`;
      el.style.overflowWrap = "anywhere";
    };

    fit();
    let alive = true;
    document.fonts?.ready.then(() => alive && fit());
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      if (w === lastWidth) return; // a height change from our own fitting
      lastWidth = w;
      fit();
    });
    if (el.parentElement) ro.observe(el.parentElement);
    return () => {
      alive = false;
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return createElement(as, { ref, className, style: { maxWidth: "100%", ...style }, ...rest }, children);
}

/** The words inside some React children, to know when to fit again. */
function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((n) => (typeof n === "string" || typeof n === "number" ? String(n) : isValidElement<{ children?: ReactNode }>(n) ? textOf(n.props.children) : ""))
    .join("");
}
