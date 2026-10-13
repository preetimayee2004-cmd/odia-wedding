/**
 * THE single place to edit invitation content (PRD §4, "all names, dates,
 * venue details and invitation text must be configurable").
 *
 * Rules:
 *  - Anything set to `null` is unconfirmed. Sections hide null fields rather
 *    than inventing them (PRD §6, §8).
 *  - Values marked PLACEHOLDER are stand-ins so the design can be reviewed.
 *    Replace them with approved details before publishing.
 */

export interface Person {
  /** Name shown in the large script lettering. */
  displayName: string;
  /** Optional full name for formal lines (e.g. "Son of …"). */
  fullName: string | null;
}

export interface WeddingConfig {
  couple: {
    bride: Person;
    groom: Person;
    /** Short line under the couple's names (Section 03). */
    message: string;
  };
  wedding: {
    /** ISO 8601 local date-time at the venue, e.g. "2027-02-14T19:30". */
    dateTime: string | null;
    /** IANA zone the dateTime is expressed in — drives the countdown. */
    timeZone: string;
  };
  invitation: {
    /** Odia blessing line above the greeting. Confirm spelling with the family. */
    invocation: { odia: string; english: string } | null;
    /** {guest} is replaced with the guest's name from the share link. */
    greeting: string;
    message: string;
    ctaLabel: string;
  };
  countdown: {
    heading: string;
    /** Shown from the start time until the end of the wedding day (venue time). */
    weddingDayMessage: string;
    /** Shown after the wedding day. {date} → the wedding date. */
    completedMessage: string;
  };
  story: {
    heading: string;
    /** Odia subtitle — confirm spelling with the family. */
    odiaHeading: string | null;
    /**
     * The couple's own milestones (PRD §4.05) — never invented. While empty,
     * the section is hidden in production.
     */
    milestones: Array<{
      title: string;
      /** Free text, e.g. "Spring 2019". */
      date: string | null;
      text: string;
      image: { src: string; alt: string } | null;
    }>;
  };
  venue: {
    name: string | null;
    city: string | null;
    address: string | null;
    mapsUrl: string | null;
  };
  assets: {
    /**
     * Approved Lord Jagannath artwork (PRD §8). Path under /public, e.g.
     * "/art/jagannath.webp" — square, transparent background, ≥ 512px.
     * While null, a Nilachakra emblem stands in.
     */
    deityArtwork: string | null;
    /**
     * Couple illustration in traditional Odia attire (PRD §4.03): bride in
     * Banarasi pata with yellow mukut, groom in sherwani with yellow turban/mukut.
     * Portrait ~4:5, transparent or cream background. While null, a pair of
     * Odia wedding mukuts stands in.
     */
    coupleIllustration: { src: string; alt: string } | null;
  };
  opening: {
    /** Play the temple opening once per browser session (always in dev). */
    playOncePerSession: boolean;
  };
  guest: {
    /** URL query keys checked, in order, for the guest's name. */
    queryKeys: readonly string[];
    fallbackName: string;
    maxLength: number;
  };
  meta: {
    siteTitle: string;
    description: string;
  };
}

export const wedding: WeddingConfig = {
  couple: {
    bride: { displayName: "Bride", fullName: null }, // PLACEHOLDER
    groom: { displayName: "Groom", fullName: null }, // PLACEHOLDER
    // PLACEHOLDER wording
    message:
      "Together with our families, we would be honoured to have you with us as we begin our life together.",
  },
  wedding: {
    dateTime: null, // awaiting confirmed date & time
    timeZone: "Asia/Kolkata",
  },
  invitation: {
    // PLACEHOLDER wording — replace with the couple's approved invitation text.
    invocation: { odia: "ଶ୍ରୀ ଜଗନ୍ନାଥ ସହାୟ", english: "Sri Jagannath Sahaya" },
    greeting: "Dear {guest},",
    message:
      "With the blessings of Lord Jagannath and our elders, we joyfully invite you to celebrate the wedding of",
    ctaLabel: "Open Invitation",
  },
  countdown: {
    heading: "Counting the Moments",
    weddingDayMessage: "Today is the day — thank you for celebrating with us.",
    completedMessage: "We were married on {date}. Thank you for your love and blessings.",
  },
  story: {
    heading: "Our Story",
    odiaHeading: "ଆମ କାହାଣୀ",
    // Add milestones supplied by the couple, e.g.
    // { title: "How we met", date: "June 2019", text: "…", image: null },
    milestones: [],
  },
  venue: {
    name: null,
    city: null,
    address: null,
    mapsUrl: null,
  },
  assets: {
    deityArtwork: null, // awaiting approved artwork
    coupleIllustration: null, // awaiting approved illustration
  },
  opening: {
    playOncePerSession: true,
  },
  guest: {
    // Share links like https://…/?guest=Priya%20Mishra
    queryKeys: ["guest", "to", "g"],
    fallbackName: "Guest",
    maxLength: 60,
  },
  meta: {
    siteTitle: "Wedding Invitation",
    description: "You are warmly invited to celebrate our wedding.",
  },
};
