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

export interface FamilySide {
  /** Heading, e.g. "The Bride's Family". */
  label: string;
  /** e.g. "The Mishra Family". */
  familyName: string | null;
  /** e.g. "Daughter of Smt. … & Shri …". */
  parents: string | null;
  photo: { src: string; alt: string } | null;
}

export type EventMotif =
  | "mehendi"
  | "sangeet"
  | "barajatra"
  | "batabarana"
  | "hastaganthi"
  | "sindoor"
  | "bidaai"
  | "reception";

export interface WeddingEvent {
  id: string;
  name: string;
  /** Confirm spelling with the family. */
  odiaName: string | null;
  motif: EventMotif;
  /** Venue-local date, "YYYY-MM-DD". */
  date: string | null;
  /** Venue-local 24h times, "HH:MM". */
  start: string | null;
  end: string | null;
  venueName: string | null;
  address: string | null;
  dressCode: string | null;
  /** Ceremony meaning or instructions — confirmed by the family, never invented. */
  description: string | null;
  /** Exact map link; otherwise one is built from the address. */
  mapsUrl: string | null;
}

/** Travel information — every value must be verified, never estimated. */
export interface TravelPlace {
  name: string | null;
  location: string | null;
  /** Verified distance from the venue, e.g. "18 km (about 40 min by road)". */
  distance: string | null;
  info: string | null;
  mapsUrl: string | null;
  phone: string | null;
  bookingUrl: string | null;
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
  family: {
    heading: string;
    odiaHeading: string | null;
    bride: FamilySide;
    groom: FamilySide;
    /** Single shared Odia wedding-family illustration, used when no photos exist. */
    illustration: { src: string; alt: string } | null;
  };
  events: {
    heading: string;
    odiaHeading: string | null;
    items: WeddingEvent[];
  };
  travel: {
    heading: string;
    airport: TravelPlace;
    railway: TravelPlace;
    bus: TravelPlace;
    stay: TravelPlace;
  };
  wishes: {
    heading: string;
    odiaHeading: string | null;
    /** Let guests leave a wish without a name (shown as "A well-wisher"). */
    allowAnonymous: boolean;
    /** Must match the database: true when new wishes default to 'pending'. */
    requireApproval: boolean;
    previewCount: number;
    maxLength: number;
  };
  rsvp: {
    invitationLine: string;
    heading: string;
    explanation: string;
    /** Revealed after "Accept Invitation". */
    quote: string;
    /** Largest party one response may include (the guest included). */
    maxAttendees: number;
    /** Venue-local date "YYYY-MM-DD" after which responses close; null = open. */
    deadline: string | null;
  };
  contact: {
    heading: string;
    note: string;
    /** Message pre-filled when a guest taps WhatsApp. */
    whatsappMessage: string;
    people: Array<{
      name: string;
      /** e.g. "Bride's brother". */
      relation: string | null;
      /** With country code, e.g. "+91 98765 43210". */
      phone: string;
      whatsapp: boolean;
    }>;
  };
  thankYou: {
    heading: string;
    message: string;
  };
  footer: {
    /** Short closing blessing or sign-off. */
    blessing: string;
    /** The couple's love notice — written in their own words. */
    loveNotice: string;
    /** Optional website credit, e.g. "Made with love by …". */
    credit: string | null;
  };
  venue: {
    name: string | null;
    city: string | null;
    /** Full postal address — also used to build the directions link. */
    address: string | null;
    /** Optional exact map link (e.g. a Google Maps share URL). */
    mapsUrl: string | null;
    description: string | null;
    /** Venue photograph; while null, a mandap illustration is shown. */
    image: { src: string; alt: string } | null;
  };
  assets: {
    /**
     * Approved Lord Jagannath artwork (PRD §8), revealed behind the temple
     * door in the opening. ocus is the square (in source pixels) around the
     * deity's crown and face — it becomes the round medallion at the top of the
     * invitation. While null, a Nilachakra emblem stands in.
     */
    deityArtwork: {
      src: string;
      alt: string;
      width: number;
      height: number;
      focus: { x: number; y: number; size: number };
    } | null;
    /**
     * Couple illustration in traditional Odia attire (PRD §4.03): bride in
     * Banarasi pata with yellow mukut, groom in sherwani with yellow turban/mukut.
     * Portrait ~4:5, transparent or cream background. While null, a pair of
     * Odia wedding mukuts stands in.
     */
    coupleIllustration: { src: string; alt: string } | null;
  };
  opening: {
    /**
     * true: play the opening once per browser session and keep the invitation
     * open on reload. false: every visit and every reload starts again from
     * the temple opening.
     */
    playOncePerSession: boolean;
    /**
     * Optional photo of the temple to use instead of the illustrated scene.
     * door is the doorway the camera zooms into, in the photo's pixels.
     * Use a high-resolution, licensed image (the zoom magnifies the door a lot).
     */
    templePhoto: {
      src: string;
      width: number;
      height: number;
      door: { x: number; y: number; width: number; height: number };
      /** Tiny image of just the sky, stretched to fill the screen above the photo. */
      sky: string | null;
    } | null;
  };
  guest: {
    /** URL query keys checked, in order, for the guest's name. */
    queryKeys: readonly string[];
    fallbackName: string;
    maxLength: number;
  };
  meta: {
    /** Page / link-preview title. {bride} and {groom} are filled in. */
    title: string;
    description: string;
    /**
     * Public address of the deployed site, e.g. "https://our-wedding.example".
     * WhatsApp needs an absolute image URL for the link preview.
     */
    siteUrl: string | null;
    /** Preview image in /public (1200×630). Regenerate with 
pm run og. */
    ogImage: string;
    /** Keep the invitation out of search engines (it holds personal details). */
    noindex: boolean;
  };
}

function emptyPlace(): TravelPlace {
  return { name: null, location: null, distance: null, info: null, mapsUrl: null, phone: null, bookingUrl: null };
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
  family: {
    heading: "Our Families",
    odiaHeading: "ପରିବାର",
    bride: { label: "The Bride's Family", familyName: null, parents: null, photo: null },
    groom: { label: "The Groom's Family", familyName: null, parents: null, photo: null },
    illustration: null,
  },
  events: {
    heading: "Wedding Celebrations",
    odiaHeading: "ବିବାହ ଉତ୍ସବ",
    // Odia names are best-effort — confirm every spelling with the family.
    items: (
      [
        ["mehendi", "Mehendi", "ମେହେନ୍ଦି"],
        ["sangeet", "Sangeet", "ସଙ୍ଗୀତ"],
        ["barajatra", "Bara Jatra", "ବର ଯାତ୍ରା"],
        ["batabarana", "Bata Barana", "ବାଟ ବରଣ"],
        ["hastaganthi", "Hasta Ganthi", "ହସ୍ତଗଣ୍ଠି"],
        ["sindoor", "Sindoor Daan", "ସିନ୍ଦୂର ଦାନ"],
        ["bidaai", "Bidaai", "ବିଦାୟ"],
        ["reception", "Reception", null],
      ] as const
    ).map(([motif, name, odiaName]) => ({
      id: motif,
      name,
      odiaName,
      motif,
      date: null,
      start: null,
      end: null,
      venueName: null,
      address: null,
      dressCode: null,
      description: null,
      mapsUrl: null,
    })),
  },
  travel: {
    heading: "Travel & Stay",
    airport: emptyPlace(),
    railway: emptyPlace(),
    bus: emptyPlace(),
    stay: emptyPlace(),
  },
  wishes: {
    heading: "Wishing Wall",
    odiaHeading: "ଶୁଭେଚ୍ଛା",
    allowAnonymous: false,
    requireApproval: false,
    previewCount: 3,
    maxLength: 280,
  },
  rsvp: {
    invitationLine: "It would mean the world to us to have you there.",
    heading: "Kindly Confirm Your Presence",
    explanation: "Please let us know whether you'll be able to join us, so we can welcome you properly.",
    quote: "Your presence will make our celebration even more special.",
    maxAttendees: 4,
    deadline: null,
  },
  contact: {
    heading: "Get in Touch",
    note: "For any questions about the celebrations, travel or stay, please reach out to:",
    whatsappMessage: "Namaste! I have a question about the wedding.",
    // Add family contacts, e.g.
    // { name: "…", relation: "Bride's brother", phone: "+91 …", whatsapp: true },
    people: [],
  },
  thankYou: {
    heading: "Thank You",
    message:
      "Thank you for being a part of our journey and for blessing us as we begin this new chapter together.",
  },
  footer: {
    blessing: "With love and gratitude",
    // PLACEHOLDER — the couple should write this in their own words.
    loveNotice:
      "Every blessing you send becomes a part of our story. We can't wait to celebrate with you.",
    credit: null,
  },
  venue: {
    name: null,
    city: null,
    address: null,
    mapsUrl: null,
    description: null,
    image: null,
  },
  assets: {
    deityArtwork: {
      src: "/art/jagannath.jpg",
      alt: "Lord Jagannath",
      width: 736,
      height: 1308,
      focus: { x: 140, y: 315, size: 465 },
    },
    coupleIllustration: null, // awaiting approved illustration
  },
  opening: {
    playOncePerSession: false, // every load starts from the opening animation
    templePhoto: {
      // Supplied Puri temple image with its text removed, enlarged 2x and sharpened.
      src: "/art/temple-photo.jpg",
      width: 1472,
      height: 2208,
      door: { x: 856, y: 1700, width: 134, height: 244 },
      sky: "/art/temple-sky.jpg",
    },
  },
  guest: {
    // Share links like https://…/?guest=Priya%20Mishra
    queryKeys: ["guest", "to", "g"],
    fallbackName: "Guest",
    maxLength: 60,
  },
  meta: {
    title: "{bride} & {groom} · Wedding Invitation",
    description: "With the blessings of Lord Jagannath, you are warmly invited to celebrate our wedding.",
    siteUrl: null,
    ogImage: "/og-image.png",
    noindex: true,
  },
};
