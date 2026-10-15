/**
 * The looped red band from the couple card's border (white edge, red band
 * with cream loops, white line), continued down both sides of the page after
 * the couple section. The tile repeats exactly; the right side is its mirror.
 * Its width matches the band on the couple card (35 of the card's 768 px).
 */
const TILE = "/art/border-loops.png";
const WIDTH = `${((35 / 768) * 100).toFixed(3)}%`;

export function SideBands() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-30">
      {(["left", "right"] as const).map((side) => (
        <span
          key={side}
          className={`absolute inset-y-0 ${side === "left" ? "left-0" : "right-0 -scale-x-100"}`}
          style={{ width: WIDTH, backgroundImage: `url(${TILE})`, backgroundSize: "100% auto", backgroundRepeat: "repeat-y" }}
        />
      ))}
    </div>
  );
}
