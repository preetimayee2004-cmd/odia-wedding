/** Shared easing curves — also exported to Tailwind (tailwind.config.ts). */
export const EASE = {
  // Default reveal — calm, decelerating, no overshoot.
  silk: "cubic-bezier(0.22, 1, 0.36, 1)",
  // Slow cinematic in-out for camera-style moves.
  temple: "cubic-bezier(0.65, 0, 0.35, 1)",
  // Push-in: gathers speed, then settles as we arrive at the sanctum.
  dolly: "cubic-bezier(0.55, 0, 0.25, 1)",
} as const;
