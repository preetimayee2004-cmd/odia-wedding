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
/** One side of the family, as the couple's design shows it. */
/** One person (or desk) in a Contact card. */
export interface ContactPerson {
  /** e.g. "Father (Kanyadana)". */
  role: string;
  /** With honorific; null until confirmed. */
  name: string | null;
  /** With country code, e.g. "+91 98765 43210"; null until confirmed. */
  phone: string | null;
  /** The small round icon; "person" by default. */
  icon?: "person" | "planner" | "hotel" | "car";
  /** SAMPLE stand-in (made-up name or masked number): shown only while placeholders are on, never tappable. */
  sample?: boolean;
}

/** A Contact card. Its id sets the colour and the art: the bride's tiara, the groom's mukut, the coordinators' kalash. */
export interface ContactGroup {
  id: "bride" | "groom" | "guests";
  title: string;
  /** In italics under the title, e.g. "Kanya Paksha". */
  subtitle: string | null;
  people: ContactPerson[];
}

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
  /** A sentence or two on the ritual, shown in its details card. */
  about: string | null;
  /** Use "\n" for a new line, " | " between two phrases. */
  dressCode: string | null;
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
    /** Handwritten line above the heading. */
    eyebrow: string;
    heading: string;
    /**
     * The four chapters, joined by a hand-drawn line down to the couple.
     * Edit the words freely — they should be the couple's own.
     */
    chapters: Array<{ label: string; title: string; text: string }>;
  };
  family: {
    /** The section heading; its first word is set in gold, the rest in maroon. */
    heading: string;
    /** Under the heading, e.g. "Bound by Love, Blessed by Family". */
    tagline: string;
    /** The couple with both sets of parents; null hides it. */
    art: { src: string; alt: string; w: number; h: number } | null;
    groom: FamilySide;
    bride: FamilySide;
    /** Odia line near the foot, e.g. "|| ବସୁଧୈବ କୁଟୁମ୍ବକମ୍ ||". */
    odiaLine: string | null;
    /** Under the Jagannath icon, e.g. "Jai Jagannath". */
    closing: string;
  };
  events: {
    heading: string;
    items: WeddingEvent[];
  };
  gallery: {
    eyebrow: string;
    heading: string;
    /**
     * The couple's photographs, in order. `tall` photos take a taller arch in
     * the masonry; `focus` is where the arch's crop centres (CSS
     * object-position — e.g. "right bottom" keeps a photographer's mark in
     * view). With none, the section is hidden.
     */
    photos: Array<{ src: string; alt: string; tall?: boolean; focus?: string }>;
  };
  /** "The Wedding Journey": the venue, getting here, and where to stay. */
  travel: {
    eyebrow: string;
    heading: string;
    intro: string;
    gettingHere: { title: string; tagline: string; intro: string; modes: TravelMode[] };
    stay: {
      title: string;
      tagline: string;
      intro: string;
      hotels: Array<{ name: string; area: string }>;
    };
    /** At the foot of the section, e.g. "Jay Jagannath". */
    closing: string;
  };
  wishes: {
    eyebrow: string;
    heading: string;
    /** A line of blessing under the heading. */
    quote: string;
    /** Over the recent wishes. */
    subtitle: string;
    formHeading: string;
    formText: string;
    /** Let guests leave a wish without a name (shown as "A well-wisher"). */
    allowAnonymous: boolean;
    /** Must match the database: true when new wishes default to 'pending'. */
    requireApproval: boolean;
    /** How many recent wishes show on the page; the rest open in "View All Wishes". */
    previewCount: number;
    maxLength: number;
    /**
     * SAMPLE wishes that fill the wall's cards until enough real ones arrive,
     * so it is never blank. Shown only while placeholders are on
     * (site.showPlaceholders), never counted, and gone once the wall has
     * `previewCount` real wishes.
     */
    samples: { name: string; message: string }[];
  };
  rsvp: {
    /** The section's heading, as on every section. */
    heading: string;
    /** The invitation, top to bottom. "{names}" becomes the couple's names. */
    invocationOdia: string | null; // small, e.g. "|| ଶ୍ରୀ ଗଣେଶାୟ ନମଃ ||"
    titleOdia: string | null; // large, framed, e.g. "|| ଶୁଭ ବିବାହ ||"
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
    /**
     * The cards, in order. A contact with a number becomes a tap-to-call link,
     * and "Call Now" calls the first number in its card. On the live site
     * only contacts with a number show, and a card with none is hidden.
     */
    groups: ContactGroup[];
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
    /** Venue photograph (not shown at present; the temple painting stands in). */
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

/** A masked number for the sample contacts — never a real person's. */
const SAMPLE_PHONE = "+91 XXXXX XXXXX";

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
    // SAMPLE — the invitation card's date (12 Feb 2027); add the Lagna time, e.g. "2027-02-12T19:30"
    dateTime: "2027-02-12",
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
    // SAMPLE wording — replace with the couple's own words.
    chapters: [
      { label: "Chapter 01", title: "The Beginning", text: "Two paths crossed, and a simple hello quietly became the start of everything." },
      { label: "Chapter 02", title: "Growing Together", text: "Through long talks, shared laughter and little adventures, friendship grew into love." },
      { label: "Chapter 03", title: "Two Families, One Bond", text: "With the blessings of our elders, two families came together as one." },
      { label: "Chapter 04", title: "Our Forever", text: "Under the grace of Mahaprabhu, we begin our forever — and we would love you beside us." },
    ],
  },
  family: {
    heading: "The Families",
    tagline: "Bound by Love, Blessed by Family",
    art: {
      src: "/art/family/family-portrait.webp",
      alt: "Avi and Pragyan in gold crowns, hands folded in greeting, with the groom's parents beside him and the bride's parents beside her",
      w: 1264,
      h: 848,
    },
    // As the couple wrote them (17 Oct 2026), father first —
    // confirm every name and its spelling with the family before sharing.
    groom: {
      label: "Groom's Parents",
      parents: ["Sri Debashis Mohapatra", "Smt. Subhashree Mohapatra"],
      blessing: "With the loving blessings of the Mohapatra Parivar",
    },
    bride: {
      label: "Bride's Parents",
      parents: ["Sri Bijay Kumar Das", "Smt. Minati Das"],
      blessing: "With the loving blessings of the Das Parivar",
    },
    odiaLine: "|| ବସୁଧୈବ କୁଟୁମ୍ବକମ୍ ||",
    closing: "Jai Jagannath",
  },
  events: {
    heading: "Wedding Events",
    // SAMPLE — every date is a placeholder around the sample wedding date
    // (Friday 12 February 2027); times, venues and dress codes are from the
    // couple's Wedding Events design. Confirm each one (and every Odia
    // spelling) with the family. Add a Google Maps link as `mapUrl` to show
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
        venueName: "Entrance",
        mapUrl: null,
      },
      {
        id: "hastaganthi",
        name: "Hastaganthi",
        odiaName: "ହସ୍ତଗଣ୍ଠି",
        date: "Friday, 12 February 2027",
        when: "7:00 PM – 8:00 PM",
        about: "The bride's father places her hand in the groom's, and their hands are tied together with a sacred thread.",
        dressCode: "Traditional wear | Red, maroon & gold",
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
      { src: "/photos/gallery/bride-mukuta.webp", alt: "The bride in a golden mukuta and a yellow-and-red saree, smiling across the ceremony", tall: true, focus: "50% 30%" },
      { src: "/photos/gallery/hands-marigolds.webp", alt: "Hands joined at the ceremony: mehendi, bangles and a ring among marigold garlands", focus: "68% 50%" },
      { src: "/photos/gallery/rings.webp", alt: "Two hands showing their rings, then held together" },
      { src: "/photos/gallery/under-the-veil.webp", alt: "The couple face to face beneath a red veil", tall: true, focus: "45% 40%" },
      { src: "/photos/gallery/anklet.webp", alt: "The groom fastening an anklet on the bride's hennaed foot", tall: true },
      // the photographer's SNAPSHOT mark sits bottom right: keep it in the crop
      { src: "/photos/gallery/mehendi-palms.webp", alt: "Hennaed palms cupped together", focus: "right bottom" },
    ],
  },
  // From the couple (17 Oct 2026). Distances and the nearest bus stop to be
  // added once the mandap's exact address is confirmed.
  travel: {
    eyebrow: "Your presence makes our journey more special",
    heading: "Venue & Accommodation",
    intro: "From the temple city of Bhubaneswar to the hearts of our loved ones — here's everything you need to know.",
    gettingHere: {
      title: "Getting Here",
      tagline: "Travel made easy",
      intro: "Bhubaneswar is well connected by air, rail and road. Here are the best ways to reach the venue:",
      modes: [
        { kind: "air", title: "By Air", place: "Biju Patnaik International Airport", detail: "Taxi or cab from the airport to the mandap." },
        { kind: "train", title: "By Train", place: "Bhubaneswar Railway Station", detail: "Auto, taxi or cab from the station to the venue." },
        { kind: "local", title: "Local Transport", place: "Mo Bus, auto-rickshaw and taxi", detail: "All run across the city." },
      ],
    },
    stay: {
      title: "Where to Stay",
      tagline: "A comfortable stay for our loved ones",
      intro: "Hotels in Bhubaneswar, from the Airports Authority of India's hotel listing:",
      hotels: [
        { name: "Hotel Kalinga Ashok", area: "Gautam Nagar" },
        { name: "Swosti Grand", area: "Near the railway station" },
        { name: "Hotel Trident", area: "CB-1, Nayapalli" },
      ],
    },
    closing: "Jay Jagannath",
  },
  wishes: {
    eyebrow: "Blessings • Love • Togetherness",
    heading: "The Wishing Wall",
    quote: "May every blessing bloom into a lifetime of love, joy and togetherness.",
    subtitle: "Wishes from our loved ones",
    formHeading: "Leave Your Blessings",
    formText: "Share a heartfelt message for the happy couple.",
    allowAnonymous: false,
    requireApproval: false,
    previewCount: 3,
    maxLength: 280,
    // SAMPLE — not from real guests; replaced by real wishes as they arrive.
    samples: [
      { name: "A dear friend", message: "Wishing you both a lifetime of love, laughter and togetherness." },
      { name: "With love, family", message: "May Lord Jagannath bless your union with joy, health and prosperity." },
      { name: "A well-wisher", message: "Best wishes on this wonderful journey, as you build your new lives together." },
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
    note: "For any assistance, please reach out to the respective family members or coordinators.",
    // Cards and roles from the couple's contact design (17 Oct 2026). The
    // fathers' names are from the Families section. Entries marked `sample`
    // are SAMPLE stand-ins so the cards aren't empty: the other names are made
    // up and every number is masked (never a real person's), shown only while
    // placeholders are on and never tappable. Replace each with the real name
    // and number and drop `sample` (or remove a role that doesn't apply).
    groups: [
      {
        id: "bride",
        title: "Bride's Family Side",
        subtitle: "Kanya Paksha",
        people: [
          { role: "Father (Kanyadana)", name: "Sri Bijay Kumar Das", phone: SAMPLE_PHONE, sample: true },
          { role: "Brother (Coordinator)", name: "Mr. Sushant Das", phone: SAMPLE_PHONE, sample: true },
          { role: "Family Coordinator", name: "Mrs. Priyanka Mishra", phone: SAMPLE_PHONE, sample: true },
        ],
      },
      {
        id: "groom",
        title: "Groom's Family Side",
        subtitle: "Bara Paksha",
        people: [
          { role: "Father (Bara Paksha)", name: "Sri Debashis Mohapatra", phone: SAMPLE_PHONE, sample: true },
          { role: "Brother (Coordinator)", name: "Mr. Ankit Mohapatra", phone: SAMPLE_PHONE, sample: true },
          { role: "Family Coordinator", name: "Mrs. Sunita Mohapatra", phone: SAMPLE_PHONE, sample: true },
        ],
      },
      {
        id: "guests",
        title: "Guest & Wedding Coordinator",
        subtitle: "Tattwadhikari",
        people: [
          { role: "Wedding Planner", name: "The planning team", phone: SAMPLE_PHONE, icon: "planner", sample: true },
          { role: "Hotel Front Desk", name: "Guest hotel desk", phone: SAMPLE_PHONE, icon: "hotel", sample: true },
          { role: "Transport Desk", name: "Travel desk", phone: SAMPLE_PHONE, icon: "car", sample: true },
        ],
      },
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
    name: "Jagannath Kalyan Mandap",
    city: "Bhubaneswar, Odisha",
    address: null, // the exact address is still to be confirmed
    // A map search for the venue by name until the exact address or pin is confirmed
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Jagannath%20Kalyan%20Mandap%2C%20Bhubaneswar%2C%20Odisha",
    description: "Blessed by Lord Jagannath, our celebrations will take place in Bhubaneswar, the temple city of Odisha.",
    image: null,
  },
  assets: {
    desktopBackdrop: "/art/desktop-palace.webp",
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
