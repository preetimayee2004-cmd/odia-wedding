/**
 * THE single place to edit invitation content (PRD §4, "all names, dates,
 * venue details and invitation text must be configurable").
 *
 * This is a template: it ships with a complete EXAMPLE wedding so every
 * section can be seen working. Values marked DEMO are example details —
 * replace them all ("Before you publish" in the README), then set
 * `site.demo` to false before sharing a real invitation.
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

/** One chapter of Our Story. */
export interface StoryChapter {
  label: string;
  title: string;
  text: string;
  /**
   * A small illustration beside the words, feathered into the parchment;
   * w × h is the file's size. `showTop` keeps only the top part of the
   * picture (e.g. 0.6 for the faces of a full-length figure).
   */
  art: { src: string; alt: string; w: number; h: number; showTop?: number } | null;
}

/** One person in Contact. */
export interface ContactPerson {
  /** "family": the two brothers, side by side at the top; "coordinator": a full-width row below. */
  group: "family" | "coordinator";
  /** e.g. "Groom's Brother". */
  role: string;
  /** With honorific; null until confirmed (a quiet stand-in while placeholders are on). */
  name: string | null;
  /** In italics under the name: the side ("Bara Paksha") or what to ask them about ("Stay, travel & pickups"). */
  note: string | null;
  /** With country code, e.g. "+91 98765 43210"; null until confirmed. */
  phone: string | null;
  /** SAMPLE stand-in (made-up name or masked number): shown only while placeholders are on, never tappable. */
  sample?: boolean;
}

/** One side of the family, as the couple's design shows it. */
export interface FamilySide {
  /** e.g. "Parents of the Groom". */
  label: string;
  /** Exactly as the family writes them, with honorifics; shown as "A &" over "B". Empty until confirmed. */
  parents: string[];
  /** e.g. "With the loving blessings of the Mohapatra Parivar". */
  blessing: string | null;
}

/** Which illustration sits beside an event in Wedding Events. */
export type EventId =
  | "mehendi"
  | "sangeet"
  | "mangana"
  | "barajatri"
  | "batabarana"
  | "hastaganthi"
  | "sindoor"
  | "bidaai"
  | "reception";

export interface WeddingEvent {
  id: EventId;
  name: string;
  /** Confirm spelling with the family. */
  odiaName: string | null;
  /** The day, as it should read, e.g. "Friday, 12 February 2027". */
  date: string | null;
  /** The time, as it should read, e.g. "4:00 PM onwards" or "Early Morning (Next Day)". */
  when: string | null;
  /** The ceremony held at the lagna: until its time is set, it reads "Lagna to be announced". */
  isLagna?: boolean;
  /** A sentence or two on the ritual, shown in its details card. */
  about: string | null;
  /** Use "\n" for a new line, " | " between two phrases (the part after " | " is the style). */
  dressCode: string | null;
  /** One word for the WEAR chip, e.g. "Traditional" (else the dress code's first word). */
  wear?: string | null;
  /** Three or four colours to wear, shown as overlapping dots beside the dress code. */
  dressColors?: string[];
  venueName: string | null;
  /** A Google Maps link for the venue; shows "View map" in the details card. */
  mapUrl: string | null;
}

/** Travel information — every value must be verified, never estimated. */
/** One way to reach the venue, in "Getting Here". */
export interface TravelMode {
  kind: "air" | "train" | "local";
  title: string;
  /** e.g. "Biju Patnaik International Airport". */
  place: string;
  /** A line on getting from there to the venue. */
  detail: string | null;
}

export interface WeddingConfig {
  couple: {
    bride: Person;
    groom: Person;
    /** Section 03, top to bottom: invocation under the Ganesha icon. */
    invocation: string;
    /** Directly above the names, e.g. "Together with their families, we joyfully invite you to the wedding of". */
    invite: string;
    /** Shown under the names; null hides it. */
    hashtag: string | null;
    /** Under the date block (from wedding.dateTime), in two lines split at its first comma, e.g. "Jagannath Kalyan Mandap, Bhubaneswar, Odisha". */
    place: string | null;
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
    /** Small line above the names. */
    saveTheDate: string;
    /** The couple's names as they appear on the card. */
    names: [string, string];
    /** Line below the names. */
    announcement: string;
  };
  countdown: {
    /** Small line at the top, between ornaments. */
    eyebrow: string;
    /** Odia title — confirm spelling with the family. */
    odia: string | null;
    /** Spaced capitals above the heading. */
    lead: string;
    heading: string;
    /** Shown from the start time until the end of the wedding day (venue time). */
    weddingDayMessage: string;
    /** Shown after the wedding day. {date} → the wedding date. */
    completedMessage: string;
  };
  story: {
    /** Small capitals above the heading. */
    eyebrow: string;
    heading: string;
    /** In italics under the heading's lotus; null hides it. */
    intro: string | null;
    /**
     * The chapters, painted down the scroll and joined by a gold thread;
     * their illustrations alternate left and right. Edit the words freely —
     * they should be the couple's own.
     */
    chapters: StoryChapter[];
  };
  family: {
    /** Small capitals above the heading, e.g. "Two Families · One Celebration". */
    eyebrow: string | null;
    heading: string;
    /** Under the heading, e.g. "Bound by Love, Blessed by Family". */
    tagline: string;
    /** The couple with both sets of parents; null hides it. */
    art: { src: string; alt: string; w: number; h: number } | null;
    groom: FamilySide;
    bride: FamilySide;
    /** After the two families, e.g. "Together, our families become one." */
    together: string | null;
    /** Odia line near the foot, e.g. "|| ବସୁଧୈବ କୁଟୁମ୍ବକମ୍ ||". */
    odiaLine: string | null;
  };
  events: {
    heading: string;
    items: WeddingEvent[];
  };
  gallery: {
    eyebrow: string;
    heading: string;
    /**
     * The couple's photographs, in order (also the viewer's order). The one
     * marked `featured` takes the wide arch at the top; the rest fill the
     * two-column grid below. `tall` photos take a taller arch; `focus` is
     * where the arch's crop centres (CSS object-position — e.g. "right
     * bottom" keeps a photographer's mark in view); `still` turns the
     * parallax off for a photograph whose mark must stay in view. The
     * featured photo's `painting` is a Pattachitra-style painting of it:
     * its toggle appears only once that file exists. With no photos the
     * section is hidden.
     */
    photos: Array<{ src: string; alt: string; tall?: boolean; focus?: string; featured?: boolean; painting?: string | null; still?: boolean }>;
  };
  /** "The Wedding Journey": the venue and getting here. */
  travel: {
    eyebrow: string;
    heading: string;
    intro: string;
    gettingHere: { title: string; tagline: string; modes: TravelMode[] };
    /** At the foot of the section, e.g. "Jay Jagannath". */
    closing: string;
  };
  wishes: {
    heading: string;
    /** A line of blessing under the heading. */
    quote: string;
    /** Over the note box, e.g. "Write your note". */
    formHeading: string;
    /** Let guests leave a wish without a name (shown as "A well-wisher"). */
    allowAnonymous: boolean;
    /** Must match the database: true when new wishes default to 'pending' (see the 20261017 migration). */
    requireApproval: boolean;
    /** How many recent wishes show as notes on the wall; the rest open in "View all wishes". */
    previewCount: number;
    maxLength: number;
    /**
     * SAMPLE wishes that fill the notes until enough approved ones arrive,
     * so the wall is never blank. Shown while `site.demo` (or placeholders)
     * is on, each marked "Example", and gone once the wall has
     * `previewCount` real wishes.
     */
    samples: { name: string; relation: string | null; message: string }[];
  };
  rsvp: {
    /** The section's heading, as on every section. */
    heading: string;
    /** The invitation, top to bottom. "{names}" becomes the couple's names. */
    invocationOdia: string | null; // small, e.g. "|| ଶ୍ରୀ ଗଣେଶାୟ ନମଃ ||"
    titleOdia: string | null; // large, e.g. "|| ଶୁଭ ବିବାହ ||"
    eyebrow: string;
    explanation: string;
    /** Under the offering of gua. */
    offerHeading: string;
    offerText: string;
    acceptLabel: string;
    acceptOdia: string | null;
    /** The closing line, in English and Odia. */
    closing: string;
    closingOdia: string | null;
    /** Shown once a response is saved, with the blooming lotus. */
    confirmed: {
      label: string;
      odia: string | null;
      heading: string;
      line: string;
      quote: string;
      quoteOdia: string | null;
      signoff: string;
    };
    /** Venue-local date "YYYY-MM-DD" after which responses close; null = open. */
    deadline: string | null;
  };
  contact: {
    heading: string;
    note: string;
    /** Pre-filled when a guest taps a message button (WhatsApp). */
    whatsappMessage: string;
    /**
     * Everyone in the one Contact card, in order: the families side by side
     * (groom's on the left, bride's on the right), then the coordinators.
     * Each gets a call button and a WhatsApp button. On the live site only
     * contacts with a number show.
     */
    people: ContactPerson[];
  };
  thankYou: {
    /** Set large, in italic. */
    heading: string;
    /** The quotation under it. */
    message: string;
  };
  footer: {
    /** The closing line, typed out as the guest arrives. */
    quote: string;
    /** Under it, e.g. "|| ପ୍ରେମ ଓ ପବିତ୍ର ବନ୍ଧନ ||". */
    odiaLine: string | null;
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
    /** Venue photograph (not shown at present; the temple painting stands in). */
    image: { src: string; alt: string } | null;
  };
  assets: {
    /** Desktop only: artwork shown around the phone mockup (portrait works best). */
    desktopBackdrop: string | null;
    /**
     * A recording of the sankha, e.g. "/audio/sankha.mp3". While null, a
     * conch-like call is synthesised in the browser. Used during the opening
     * only while `openingMusic` is null.
     */
    openingSound: string | null;
    /**
     * Devotional music for the opening, e.g. "/audio/opening.mp3" in
     * /public: it starts with the visitor's tap on the temple gate and fades
     * out as the opening finishes. Use only audio you are licensed or
     * permitted to use. null: the sankha instead.
     */
    openingMusic: string | null;
    /**
     * The wedding song, e.g. "/audio/wedding-song.mp3" in /public: it fades
     * in as the opening finishes (or at the visitor's first tap, if there is
     * no opening) and loops softly through the site. Use only audio you are
     * licensed or permitted to use. null: no music after the opening.
     */
    weddingMusic: string | null;
  };
  site: {
    /**
     * The template's example wedding: true while the DEMO details are in
     * place. The closing note then says it's an example invitation, the
     * sample wishes fill the wall (marked "Example"), the example phone
     * numbers never dial, and without a database the RSVP and wishes run as
     * labelled previews (nothing is saved). Set to false once every DEMO
     * value is replaced.
     */
    demo: boolean;
    /**
     * Quiet stand-ins for any detail left empty (null), so the layout still
     * shows. Off: empty details simply don't show, and a section with
     * nothing to show hides itself.
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

export const wedding: WeddingConfig = {
  // ── EXAMPLE DATA ── The template ships with a sample wedding (Avi &
  // Pragya, Friday 12 February 2027, Bhubaneswar) so every section shows
  // working. Everything marked DEMO is made up: replace it with the real
  // details, then set site.demo to false (README: "Before you publish").
  couple: {
    bride: { displayName: "Pragya", fullName: null }, // DEMO (the page title)
    groom: { displayName: "Avi", fullName: null }, // DEMO (the page title)
    invocation: "|| Om Ganeshaya Namah ||",
    invite: "Together with their families, we joyfully invite you to the wedding of",
    hashtag: "#AviWedsPragya", // DEMO
    // DEMO — the example place, under the date block on the couple card
    place: "Jagannath Kalyan Mandap, Bhubaneswar, Odisha",
    quote: "Two souls, one journey, blessed by Lord Jagannath.",
  },
  wedding: {
    // DEMO — the example lagna, Friday 12 February 2027 at 7:00 PM (venue
    // time). It drives the countdown, every date shown and Add to Calendar.
    dateTime: "2027-02-12T19:00",
    timeZone: "Asia/Kolkata",
  },
  invitation: {
    heading: "|| Jai Jagannath ||",
    greeting: "Dear {guest},",
    saveTheDate: "Save the Date",
    names: ["Avi", "Pragya"], // DEMO
    announcement: "are getting married",
  },
  countdown: {
    eyebrow: "Our Wedding",
    odia: "ଶୁଭ ବିବାହ",
    lead: "The countdown to our",
    heading: "Forever Begins",
    weddingDayMessage: "Today is the day — thank you for celebrating with us.",
    completedMessage: "We were married on {date}. Thank you for your love and blessings.",
  },
  story: {
    eyebrow: "Two Hearts, One Journey",
    heading: "Our Story",
    // From the couple's Story Mural brief (20 Oct 2026).
    intro: "Different paths. Same destination. Here's how our journey began…",
    // DEMO wording — replace with the couple's own words. The illustrations
    // are the couple's (20 Oct 2026), cropped round the couple in
    // public/art/story/.
    chapters: [
      {
        label: "Chapter 01",
        title: "The Beginning",
        text: "Two paths crossed, and a simple hello quietly became the start of everything.",
        art: { src: "/art/story/ch1-chai.webp", alt: "The two of them sharing chai at a roadside tea stall under string lights, smiling at each other", w: 480, h: 417 },
      },
      {
        label: "Chapter 02",
        title: "Growing Together",
        text: "Through long talks, shared laughter and little adventures, friendship grew into love.",
        art: { src: "/art/story/ch2-sunset.webp", alt: "At sunset, sharing a pair of earphones, he kisses her forehead as she smiles", w: 480, h: 509 },
      },
      {
        label: "Chapter 03",
        title: "Two Families, One Bond",
        text: "With the blessings of our elders, two families came together as one.",
        art: { src: "/art/story/ch3-hands.webp", alt: "Her hennaed hand resting on his, rings on their fingers, in wedding red and ivory", w: 480, h: 509 },
      },
      {
        label: "Chapter 04",
        title: "Our Forever",
        text: "Under the grace of Mahaprabhu, we begin our forever — and we would love you beside us.",
        art: { src: "/art/story/ch4-forever.webp", alt: "The bride and groom in garlands, their joined hands raised high, laughing with joy", w: 480, h: 535 },
      },
    ],
  },
  family: {
    eyebrow: "Two Families · One Celebration",
    heading: "Our Families",
    tagline: "Bound by Love, Blessed by Family",
    art: {
      src: "/art/family/family-portrait.webp",
      alt: "Avi and Pragya in gold crowns, hands folded in greeting, with the groom's parents beside him and the bride's parents beside her",
      w: 1264,
      h: 848,
    },
    // DEMO — the names from the couple's design (17 Oct 2026), father first:
    // replace with the families' own, spelled as they write them.
    groom: {
      label: "Groom's Family",
      parents: ["Sri Debashis Mohapatra", "Smt. Subhashree Mohapatra"],
      blessing: "With the loving blessings of the Mohapatra Parivar",
    },
    bride: {
      label: "Bride's Family",
      parents: ["Sri Bijay Kumar Das", "Smt. Minati Das"],
      blessing: "With the loving blessings of the Das Parivar",
    },
    together: "Together, our families become one.",
    odiaLine: "|| ବସୁଧୈବ କୁଟୁମ୍ବକମ୍ ||",
  },
  events: {
    heading: "Wedding Events",
    // DEMO — example dates and times around the example wedding day (Friday
    // 12 February 2027); places and dress codes are from the couple's Wedding
    // Events design. Replace each with the real details, and check every Odia
    // spelling with the family. Add a Google Maps link as `mapUrl` to show
    // "View map" in that ceremony's details card.
    items: [
      {
        id: "mehendi",
        name: "Mehendi",
        odiaName: "ମେହେନ୍ଦି",
        date: "Wednesday, 10 February 2027",
        when: "10:00 AM – 1:00 PM",
        about: "Intricate henna is drawn on the bride's hands and feet amid songs and laughter. The darker the colour, the deeper the love, they say.",
        dressCode: "Shades of green & yellow",
        wear: "Festive",
        dressColors: ["#3E7B36", "#8DBE4A", "#F2C230", "#E9A21B"],
        venueName: "Courtyard",
        mapUrl: null,
      },
      {
        id: "sangeet",
        name: "Sangeet",
        odiaName: "ସଙ୍ଗୀତ",
        date: "Wednesday, 10 February 2027",
        when: "7:00 PM – 9:30 PM",
        about: "An evening of music and dance as both families come together to sing, perform and celebrate.",
        dressCode: "Ladies: Glitter, glam, Indian or Indo-Western\nGentlemen: Suits or tuxedos (black, white or blue)",
        wear: "Glam",
        dressColors: ["#1E2A4A", "#F5F1E8", "#C9A24E", "#9B1B5A"],
        venueName: "Lotus Pavilion",
        mapUrl: null,
      },
      {
        id: "mangana",
        name: "Mangana",
        odiaName: "ମଙ୍ଗନ",
        date: "Friday, 12 February 2027",
        when: "9:00 AM – 10:30 AM",
        about: "Married women of the family anoint the bride with turmeric paste and bathe her, blessing her for the day ahead.",
        dressCode: "Traditional Odia attire | Pastel & earthy tones",
        wear: "Traditional",
        dressColors: ["#F1D6AE", "#E3AE97", "#B5C99A", "#B8977A"],
        venueName: "Mandap",
        mapUrl: null,
      },
      {
        id: "barajatri",
        name: "Barajatri",
        odiaName: "ବରଯାତ୍ରୀ",
        date: "Friday, 12 February 2027",
        when: "4:00 PM – 5:30 PM",
        about: "The groom's wedding procession arrives with music and dancing as family and friends escort him to the venue.",
        dressCode: "Traditional wear | Bright & festive",
        wear: "Traditional",
        dressColors: ["#D62839", "#F4A300", "#2A9D8F", "#FFC93C"],
        venueName: "Main Lawn",
        mapUrl: null,
      },
      {
        id: "batabarana",
        name: "Batabaran",
        odiaName: "ବରବରଣ",
        date: "Friday, 12 February 2027",
        when: "5:30 PM – 6:30 PM",
        about: "The bride's family welcomes the groom at the entrance with aarti, tilak, sweets and the sound of conch shells.",
        dressCode: "Traditional Odia attire | Red, yellow & gold",
        wear: "Traditional",
        dressColors: ["#B3202A", "#F2C230", "#C9A24E"],
        venueName: "Entrance",
        mapUrl: null,
      },
      {
        id: "hastaganthi",
        isLagna: true, // held at the lagna
        name: "Hastaganthi",
        odiaName: "ହସ୍ତଗଣ୍ଠି",
        date: "Friday, 12 February 2027",
        when: "7:00 PM – 8:00 PM",
        about: "The bride's father places her hand in the groom's, and their hands are tied together with a sacred thread.",
        dressCode: "Traditional wear | Red, maroon & gold",
        wear: "Traditional",
        dressColors: ["#C1121F", "#7A1F1F", "#C9A24E"],
        venueName: "Mandap",
        mapUrl: null,
      },
      {
        id: "sindoor",
        name: "Sindoordaan",
        odiaName: "ସିନ୍ଦୂରଦାନ",
        date: "Friday, 12 February 2027",
        when: "8:00 PM – 9:00 PM",
        about: "The groom fills the parting of the bride's hair with sindoor, the vermilion mark of a married woman.",
        dressCode: "Traditional wear | Soft & elegant",
        wear: "Traditional",
        dressColors: ["#F2D4C9", "#E9C46A", "#C98E9A", "#FBEFD8"],
        venueName: "Mandap",
        mapUrl: null,
      },
      {
        id: "bidaai",
        name: "Bidaai",
        odiaName: "ବିଦାୟ",
        date: "Friday, 12 February 2027",
        when: "9:00 PM – 10:00 PM",
        about: "A tender farewell as the bride leaves her parents' home for her new life, blessed by everyone she grew up with.",
        dressCode: "Traditional wear | Emotive & classy",
        wear: "Traditional",
        dressColors: ["#8E1B1F", "#E9C46A", "#F4EEE4", "#5E4B6E"],
        venueName: "Mandap",
        mapUrl: null,
      },
      {
        id: "reception",
        name: "Reception",
        odiaName: "ପ୍ରୀତିଭୋଜନ",
        date: "Sunday, 14 February 2027",
        when: "8:00 PM onwards",
        about: "An evening of dinner and celebration to welcome the newly-weds. Come and bless the couple.",
        dressCode: "Formal/Western | Elegant & classy",
        wear: "Formal",
        dressColors: ["#1D3557", "#22201E", "#C9A24E", "#F1ECE2"],
        venueName: "Lotus Pavilion",
        mapUrl: null,
      },
    ],
  },
  gallery: {
    eyebrow: "The Raghurajpur Canvas",
    heading: "Gallery",
    // Shared by the couple, who confirmed they may be used (16 Oct 2026).
    photos: [
      // featured: the wide arch at the top (its Pattachitra painting is to be added at public/gallery/)
      { src: "/photos/gallery/under-the-veil.webp", alt: "The couple face to face beneath a red veil", featured: true, focus: "50% 40%", painting: "/gallery/featured-pattachitra.webp" },
      { src: "/photos/gallery/bride-mukuta.webp", alt: "The bride in a golden mukuta and a yellow-and-red saree, smiling across the ceremony", tall: true, focus: "50% 30%" },
      { src: "/photos/gallery/hands-marigolds.webp", alt: "Hands joined at the ceremony: mehendi, bangles and a ring among marigold garlands", focus: "68% 50%" },
      // the couple's two ring photographs, once stacked in one picture, now one per frame
      { src: "/photos/gallery/rings.webp", alt: "Two hands side by side showing their wedding rings, hers hennaed" },
      { src: "/photos/gallery/held-hands.webp", alt: "His hand holding her hennaed hand, her ring catching the light" },
      { src: "/photos/gallery/anklet.webp", alt: "The groom fastening an anklet on the bride's hennaed foot", tall: true },
      // the photographer's SNAPSHOT mark sits bottom right: keep it in the crop, and still
      { src: "/photos/gallery/mehendi-palms.webp", alt: "Hennaed palms cupped together", tall: true, focus: "right bottom", still: true },
    ],
  },
  // From the couple (17 Oct 2026). Distances and the nearest bus stop to be
  // added once the mandap's exact address is confirmed.
  travel: {
    eyebrow: "Find your way to us",
    heading: "Venue & Accommodation",
    intro: "From the temple city of Bhubaneswar to the hearts of our loved ones — here's everything you need to know.",
    gettingHere: {
      title: "Getting Here",
      tagline: "Travel made easy",
      modes: [
        { kind: "air", title: "By Air", place: "Biju Patnaik International Airport", detail: "Taxi or cab from the airport to the mandap." },
        { kind: "train", title: "By Train", place: "Bhubaneswar Railway Station", detail: "Auto, taxi or cab from the station to the venue." },
        { kind: "local", title: "Local Transport", place: "Mo Bus, auto-rickshaw and taxi", detail: "All run across the city." },
      ],
    },
    closing: "Jai Jagannath",
  },
  wishes: {
    heading: "The Wishing Wall",
    quote: "May every blessing bloom into a lifetime of love, joy and togetherness.",
    formHeading: "Leave Your Blessings",
    allowAnonymous: false,
    requireApproval: true,
    previewCount: 3,
    maxLength: 200,
    // DEMO — made-up guests, not real wishes: marked "Example" on the wall,
    // shown while site.demo is on, and replaced as approved wishes arrive.
    // (The Odia one reads: "May your lives be filled with love and joy; may
    // Mahaprabhu Jagannath's blessings always be with you" — have the family
    // check its wording.)
    samples: [
      { name: "Aja & Aai", relation: "Groom's Grandparents", message: "We waited so long to see this day. May Lord Jagannath keep you both happy, healthy and side by side for a hundred years." },
      { name: "Lipsa", relation: "Bride's Friend", message: "ତୁମ ଦୁହିଁଙ୍କ ଜୀବନ ପ୍ରେମ ଓ ଆନନ୍ଦରେ ଭରି ରହୁ। ମହାପ୍ରଭୁ ଜଗନ୍ନାଥଙ୍କ ଆଶୀର୍ବାଦ ସର୍ବଦା ରହୁ।" },
      { name: "Ananya", relation: "Bride's Cousin", message: "So happy for you both! May every day feel as bright as your wedding day, full of laughter and little adventures." },
    ],
  },
  rsvp: {
    heading: "Kindly RSVP",
    invocationOdia: "|| ଶ୍ରୀ ଗଣେଶାୟ ନମଃ ||",
    titleOdia: "|| ଶୁଭ ବିବାହ ||",
    eyebrow: "An Auspicious Invitation",
    explanation: "Under the divine grace of Lord Jagannath, we seek your sacred presence and blessings as {names} unite in matrimony.",
    offerHeading: "Accept the Sacred Gua & Bless Us",
    offerText: "In the cherished Odia tradition, accept our humble offering and confirm your gracious presence.",
    acceptLabel: "Accept Invitation",
    acceptOdia: "ନିମନ୍ତ୍ରଣ ସ୍ୱୀକାର",
    closing: "Jai Jagannath",
    closingOdia: "ଜୟ ଜଗନ୍ନାଥ",
    confirmed: {
      label: "RSVP Confirmed",
      odia: "ଧନ୍ୟବାଦ",
      heading: "Thank you!",
      line: "We can't wait to celebrate with you,",
      quote: "Your presence is the greatest blessing we could ask for on our special day.",
      quoteOdia: "ଆପଣଙ୍କ ଉପସ୍ଥିତି ଆମ ପାଇଁ ସବୁଠାରୁ ବଡ଼ ଆଶୀର୍ବାଦ",
      signoff: "With love, {names}",
    },
    deadline: null,
  },
  contact: {
    heading: "Contact",
    note: "Need help? Reach out to the right person below.",
    whatsappMessage: "Namaste! I have a question about the wedding.",
    // Roles from the couple's contact design (19 Oct 2026).
    // DEMO — the names are made up and the numbers fictional: +91 00000 …
    // can't reach anyone (Indian mobile numbers begin with 6–9), and while
    // site.demo is on, Call and WhatsApp say so instead of dialling. Replace
    // each with the real name and number, or remove a role that doesn't apply.
    people: [
      { group: "family", role: "Groom's Brother", name: "Mr. Ankit Mohapatra", note: "Bara Paksha", phone: "+91 00000 00004" },
      { group: "family", role: "Bride's Brother", name: "Mr. Sushant Das", note: "Kanya Paksha", phone: "+91 00000 00001" },
      { group: "coordinator", role: "Guest Coordinator", name: "Mrs. Priyanka Mishra", note: "Stay, travel & pickups", phone: "+91 00000 00002" },
      { group: "coordinator", role: "Event Coordinator", name: "Mr. Manas Sahoo", note: "Venue, timings & rituals", phone: "+91 00000 00003" },
    ],
  },
  thankYou: {
    heading: "Thank You",
    message: "Your presence made our special day more beautiful, more joyful and more meaningful.",
  },
  footer: {
    quote: "Your presence will make our celebration complete.",
    odiaLine: "|| ପ୍ରେମ ଓ ପବିତ୍ର ବନ୍ଧନ ||",
    credit: null,
  },
  venue: {
    // DEMO — an example venue: the street is made up, and the map opens the
    // Old Town area rather than any real hall. Replace all of these; with a
    // real address, `mapsUrl` can be null (directions are then built from it).
    name: "Jagannath Kalyan Mandap",
    city: "Bhubaneswar, Odisha",
    address: "108 Mandap Lane, Old Town, Bhubaneswar, Odisha 751002",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Old%20Town%2C%20Bhubaneswar%2C%20Odisha",
    description: "Blessed by Lord Jagannath, our celebrations will take place in Bhubaneswar, the temple city of Odisha.",
    image: null,
  },
  assets: {
    desktopBackdrop: "/art/desktop-dark.webp",
    openingSound: null, // synthesised sankha until a recording is supplied
    // Awaiting licensed recordings from the couple (20 Oct 2026): a temple
    // bell & sankha piece for the opening, and an Odia wedding song.
    openingMusic: null,
    weddingMusic: null,
  },
  site: {
    demo: true, // the example wedding above: set to false once every DEMO value is replaced
    showPlaceholders: true, // quiet stand-ins for any detail left empty
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
