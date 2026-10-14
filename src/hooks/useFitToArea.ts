import { useEffect, type RefObject } from "react";

/**
 * Scales `block` (absolutely positioned and vertically centred in `area`
 * with translateY(-50%)) down just enough to fit `area`. If it would have to
 * go below `minFit`, the area grows instead (and the page scrolls a little).
 */
export function useFitToArea(areaRef: RefObject<HTMLElement>, blockRef: RefObject<HTMLElement>, minFit = 0.72) {
  useEffect(() => {
    const area = areaRef.current;
    const block = blockRef.current;
    if (!area || !block) return;
    let frame = 0;
    const fit = () => {
      frame = 0;
      area.style.minHeight = "";
      const natural = block.offsetHeight;
      const avail = area.clientHeight;
      if (!natural || !avail) return;
      const scale = Math.min(1, Math.max(minFit, avail / natural));
      if (natural * scale > avail) area.style.minHeight = `${Math.ceil(natural * scale)}px`;
      block.style.transform = `translateY(-50%) scale(${scale.toFixed(4)})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(fit);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(area);
    ro.observe(block);
    window.addEventListener("resize", schedule);
    void document.fonts?.ready.then(schedule);
    fit();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [areaRef, blockRef, minFit]);
}
