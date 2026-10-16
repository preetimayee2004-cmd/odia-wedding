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
      // The typography system: four families, set once as CSS variables in
      // src/index.css (--font-*). Cinzel only for the blessing and hashtag.
      fontFamily: {
        // Headings, body text, quotes and detail values.
        display: "var(--font-serif)",
        serif: "var(--font-serif)",
        // Buttons, labels and small notes.
        sans: "var(--font-ui)",
        // The blessing and the hashtag.
        cinzel: "var(--font-cinzel)",
        // The couple's names.
        names: "var(--font-names)",
        // All Odia script.
        odia: "var(--font-odia)",
      },
      letterSpacing: {
        eyebrow: "0.28em",
      },
      transitionTimingFunction: EASE,
      maxWidth: {
        // Content column on tablet-width full-bleed layouts.
        column: "35rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
