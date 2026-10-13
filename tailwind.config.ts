import type { Config } from "tailwindcss";
import { EASE } from "./src/lib/motion";

/**
 * TILA design tokens (PRD §2). Colours live as RGB channels in CSS variables
 * (src/index.css) so Tailwind opacity modifiers like `bg-sindoor/10` work.
 *
 *  cream   ~70%  backgrounds
 *  sindoor ~20%  couple's names, headings, primary actions
 *  gold    ~10%  fine borders, dividers, ornaments — decorative only, never body text
 *                (contrast on cream is ~2:1)
 *  ink           body text (dark charcoal / soft black)
 */
const withAlpha = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        // Short phones (iPhone SE, or Safari with toolbars showing) — tighten vertical rhythm.
        short: { raw: "(max-height: 700px)" },
      },
      colors: {
        cream: {
          DEFAULT: withAlpha("--cream"),
          light: withAlpha("--cream-light"),
          deep: withAlpha("--cream-deep"),
        },
        sindoor: {
          DEFAULT: withAlpha("--sindoor"),
          dark: withAlpha("--sindoor-dark"),
        },
        gold: {
          DEFAULT: withAlpha("--gold"),
          soft: withAlpha("--gold-soft"),
          // Text-safe gold (~4:1 on cream) — only for large decorative words like "and".
          deep: withAlpha("--gold-deep"),
        },
        ink: {
          DEFAULT: withAlpha("--ink"),
          soft: withAlpha("--ink-soft"),
        },
      },
      fontFamily: {
        // Couple's names only.
        script: ['"Pinyon Script"', "cursive"],
        // English headings, event names, quotations.
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        // Body, dates, times, venues, buttons, forms.
        sans: ["Poppins", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        // Odia phrases and Odia event names.
        odia: ['"Noto Serif Oriya"', '"Noto Sans Oriya"', "serif"],
      },
      letterSpacing: {
        eyebrow: "0.28em",
      },
      transitionTimingFunction: EASE,
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        flap: { "0%, 100%": { transform: "scaleY(1)" }, "50%": { transform: "scaleY(0.3)" } },
      },
      animation: {
        // Crows' wingbeat in the opening (duration set per bird).
        flap: "flap 0.7s ease-in-out infinite",
        // Skip button: appears shortly after the opening starts.
        "fade-in-late": `fade-in 600ms ${EASE.silk} 700ms both`,
      },
      maxWidth: {
        // Content column on tablet-width full-bleed layouts.
        column: "35rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
