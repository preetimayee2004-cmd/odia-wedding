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

/** An elder named in Gurujana Pranam. */
export interface Elder {
  /** Exactly as the family writes it, with honorific, e.g. "Shri … Mishra". */
  name: string;
  /** Departed: a lit brass dipa burns beside the name to keep their memory bright. */
  late: boolean;
}

export interface FamilySide {
  /** Column heading, e.g. "The Bride's Family". */
  label: string;
  /** e.g. "The Mishra Family". */
  familyName: string | null;
  /** Aja & Aai. Empty until the family confirms the names. */
  grandparents: Elder[];
  /** Pitra-Matra. Empty until the family confirms the names. */
  parents: Elder[];
  /** Suhuda-Varga: siblings and close family. Empty until confirmed. */
  siblings: Elder[];
}

/** Label for one generation of the Gurujana Pranam grid. */
export interface ElderTier {
  label: string;
  /** Confirm spelling with the family. */
  odia: string | null;
  /** Plain-English gloss for guests who don't read Odia. */
  gloss: string;
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
    /** Section 03, top to bottom: invocation under the Ganesha icon. */
    invocation: string;
    /** `{guest}` is replaced with the guest's name from the share link. */
    greeting: string;
    /** Line under the greeting. */
    invite: string;
    /** Shown under the names; null hides it. */
    hashtag: string | null;
    /** Closing quote, under a small lotus. */
    quote: string;
  };
  wedding: {
    /** ISO 8601 local date-time at the venue, e.g. "2027-02-14T19:30". */
    dateTime: string | null;
    /** IANA zone the dateTime is expressed in — drives the countdown. */
    timeZone: string;
  };
  invitation: {
    /** First line of the card. */
    heading: string;
    /** `{guest}` is replaced with the guest's name from the share link. */
    greeting: string;
    /** Opening line, in its two printed lines. */
    message: [string, string];
    /** Small line above the names. */
    saveTheDate: string;
    /** The couple's names as they appear on the card. */
    names: [string, string];
    /** Line below the names. */
    announcement: string;
    /** The date exactly as printed on the card, e.g. "Friday, 12 February 2027". */
    dateLine: string | null;
    /** The place as printed on the card. */
    place: string | null;
  };
  countdown: {
    heading: string;
    /** Line beneath the heading. */
    line: string;
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
     * The three chapters of the Heritage Timeline, each with its Pattachitra
     * icon. The words must be the couple's own — never invented. A chapter
     * appears once its `text` is filled in; with none, the section is hidden.
     */
    milestones: Array<{
      icon: "peacocks" | "koka" | "panagua";
      title: string;
      /** Free text, e.g. "Spring 2019". */
      date: string | null;
      text: string | null;
      image: { src: string; alt: string } | null;
    }>;
  };
  family: {
    heading: string;
    odiaHeading: string | null;
    gloss: string;
    tiers: { grandparents: ElderTier; parents: ElderTier; siblings: ElderTier };
    bride: FamilySide;
    groom: FamilySide;
  };
  events: {
    heading: string;
    odiaHeading: string | null;
    items: WeddingEvent[];
  };
  gallery: {
    eyebrow: string;
    heading: string;
    /**
     * The couple's photographs, in order. `tall` photos take a taller arch in
     * the masonry. With none, the section is hidden.
     */
    photos: Array<{ src: string; alt: string; tall?: boolean }>;
  };
  travel: {
    eyebrow: string;
    heading: string;
    airport: TravelPlace;
    railway: TravelPlace;
    bus: TravelPlace;
    stay: TravelPlace;
  };
  wishes: {
    eyebrow: string;
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
    /** First line, set large. */
    heading: string;
    message: string;
    /** Closing invocation, in gold. */
    closing: string;
  };
  footer: {
    /** Short closing blessing or sign-off. */
    blessing: string;
    /** Optional website credit, e.g. "Made with love by …". */
    credit: string | null;
  };
  /** The Rajagya (Royal Decree): practical updates, pinned to the bottom of the screen. */
  rajagya: {
    label: string;
    /** Confirm spelling with the family. */
    odia: string | null;
    gloss: string;
    /**
     * Logistics only (parking, RSVP deadline, live-stream link), most
     * important first: the first one shows on the banner. Facts exactly as
     * the family confirms them. With none, the decree is not shown.
     */
    notices: Array<{
      /** Short heading, e.g. "RSVP". */
      title: string;
      /** e.g. "Please RSVP before 1 November." */
      text: string;
      link: { href: string; label: string } | null;
    }>;
  };
  /** The "Atithi Culture & Style Guide" pop-up in Venue, Travel & Stay. */
  atithi: {
    button: string;
    intro: string;
    sections: Array<{
      title: string;
      text: string;
      items: Array<{ name: string; text: string }>;
    }>;
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
    /** Desktop only: artwork shown around the phone mockup (portrait works best). */
    desktopBackdrop: string | null;
    /**
     * Sound for the opening's sound button, e.g. "/audio/opening.mp3".
     * While null, a conch-like call (sankha) is synthesised in the browser.
     */
    openingSound: string | null;
  };
  site: {
    /**
     * Show every section's layout, with dashed placeholders where details
     * are not confirmed yet. Turn off before sharing the final invitation:
     * sections without confirmed details then hide themselves.
     */
    showPlaceholders: boolean;
  };
  opening: {
    /**
     * true: play the opening once per browser session and keep the invitation
     * open on reload. false: every visit and every reload starts again from
     * the opening.
     */
    playOncePerSession: boolean;
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
    invocation: "|| Om Ganeshaya Namah ||",
    greeting: "Dear {guest},",
    invite: "We joyfully invite you to celebrate with us.",
    hashtag: "#AviWedsPragyan",
    quote: "Two souls, one journey, blessed by Lord Jagannath.",
  },
  wedding: {
    dateTime: null, // awaiting confirmed date & time
    timeZone: "Asia/Kolkata",
  },
  invitation: {
    heading: "|| Jai Jagannath ||",
    greeting: "Dear {guest},",
    message: [
      "Under the eternal protection and grace of the Lord of the Universe,",
      "we cordially invite you to witness the union of our families.",
    ],
    saveTheDate: "Save the Date",
    names: ["Avi", "Pragyan"],
    announcement: "are getting married",
    // SAMPLE — replace with the real date and venue (12 Feb 2027 is a Friday)
    dateLine: "Friday, 12 February 2027",
    place: "Jagannath Kalyan Mandap, Bhubaneswar, Odisha",
  },
  countdown: {
    heading: "Counting the Moments",
    line: "Counting down to the auspicious Lagna...",
    weddingDayMessage: "Today is the day — thank you for celebrating with us.",
    completedMessage: "We were married on {date}. Thank you for your love and blessings.",
  },
  story: {
    heading: "Our Story",
    odiaHeading: "ଆମ କାହାଣୀ",
    milestones: [
      { icon: "peacocks", title: "First Chapter", date: null, text: null, image: null },
      { icon: "koka", title: "The Promise", date: null, text: null, image: null },
      { icon: "panagua", title: "Nirbandha (Engagement)", date: null, text: null, image: null },
    ],
  },
  family: {
    heading: "Gurujana Pranam & Blessings",
    odiaHeading: "ଗୁରୁଜନ ପ୍ରଣାମ",
    gloss: "Salutation to Elders",
    tiers: {
      grandparents: { label: "Aja & Aai", odia: "ଅଜା ଓ ଆଈ", gloss: "Grandparents" },
      parents: { label: "Pitra-Matra Pranam", odia: "ପିତୃ-ମାତୃ ପ୍ରଣାମ", gloss: "Parents" },
      siblings: { label: "Suhuda-Varga", odia: "ସୁହୃଦ ବର୍ଗ", gloss: "Siblings & Family" },
    },
    // Names exactly as the family writes them, e.g. { name: "Shri … Mishra", late: true }
    bride: { label: "The Bride's Family", familyName: null, grandparents: [], parents: [], siblings: [] },
    groom: { label: "The Groom's Family", familyName: null, grandparents: [], parents: [], siblings: [] },
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
  gallery: {
    eyebrow: "The Raghurajpur Canvas",
    heading: "Gallery",
    // e.g. { src: "/photos/haldi.jpg", alt: "…", tall: true }
    photos: [],
  },
  travel: {
    eyebrow: "The Path to Purushottam Kshetra",
    heading: "Venue, Travel & Stay",
    airport: emptyPlace(),
    railway: emptyPlace(),
    bus: emptyPlace(),
    stay: emptyPlace(),
  },
  wishes: {
    eyebrow: "The Ananda Bazar",
    heading: "Blessings Wall",
    odiaHeading: "ଶୁଭେଚ୍ଛା",
    allowAnonymous: false,
    requireApproval: false,
    previewCount: 10,
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
    heading: "Our hearts are full.",
    message:
      "We bow in gratitude to our families and to Mahaprabhu. We await your presence under the eternal shadow of the Lord.",
    closing: "Jai Jagannath",
  },
  footer: {
    blessing: "With love and gratitude",
    credit: null,
  },
  rajagya: {
    label: "Rajagya",
    odia: "ରାଜାଜ୍ଞା",
    gloss: "The Royal Decree",
    // e.g. { title: "RSVP", text: "Please RSVP before …", link: null }
    notices: [],
  },
  // General guidance for guests — the family may edit any of it.
  atithi: {
    button: "Atithi Culture & Style Guide",
    intro: "A few notes to help you dress for the celebrations, and to enjoy Odisha if you make a holiday of it.",
    sections: [
      {
        title: "Wedding colours",
        text: "Bright, festive colours are warmly welcomed: red, maroon, gold, yellow, orange and green. Many Odia families avoid all-white or all-black outfits at a wedding.",
        items: [],
      },
      {
        title: "Wear Odisha's handlooms",
        text: "Our celebrations would love to see the state's own weaves.",
        items: [
          { name: "Sambalpuri", text: "Ikat (bandha) sarees, kurtas and stoles from western Odisha, the pattern dyed into the threads before weaving." },
          { name: "Bomkai", text: "Sarees from Ganjam with richly woven borders and pallus, in cotton or silk." },
          { name: "Khandua", text: "Silk from Nuapatna, the weave long offered to Lord Jagannath." },
        ],
      },
      {
        title: "Make a holiday of it",
        text: "If you are staying on, a few favourite places:",
        items: [
          { name: "Puri Beach", text: "Golden sands by the Bay of Bengal, loveliest at sunrise." },
          { name: "Shree Jagannath Temple, Puri", text: "The abode of Mahaprabhu. Only Hindus may enter the temple." },
          { name: "Konark Sun Temple", text: "The 13th-century stone chariot of the Sun God, a UNESCO World Heritage Site." },
          { name: "Raghurajpur", text: "The heritage crafts village of Pattachitra painters, near Puri." },
          { name: "Chilika Lake", text: "Asia's largest brackish-water lagoon, home to migratory birds." },
        ],
      },
    ],
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
    desktopBackdrop: "/art/desktop-backdrop.png",
    openingSound: null, // synthesised sankha until a recording is supplied
  },
  site: {
    showPlaceholders: true, // the full structure, while details are being gathered
  },
  opening: {
    playOncePerSession: false, // every load starts from the opening
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
