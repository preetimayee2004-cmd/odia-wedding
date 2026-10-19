# TILA — An Odia Wedding Invitation

A mobile-first, animated wedding invitation website celebrating traditional Odia Hindu heritage. It's shared as a link (mainly on WhatsApp) and personalised per guest.

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS. No animation library: motion uses CSS transitions and the Web Animations API. Wishes and RSVPs are stored in Supabase via its REST API (no SDK).

## Run locally

```bash
npm install
npm run dev        # http://localhost:8080
npm run build      # production build in dist/
npm run og         # regenerate the link-preview image (public/og-image.png)
```

Personalise a link with the guest's name. Guests see "Dear Priya Mishra," and their name is pre-filled in the forms:

```
https://your-site.example/?guest=Priya%20Mishra
```

**Dev shortcut:** `http://localhost:8080/?open` skips the opening and starts with the invitation open (development only).

## Editing content: one file

Everything a guest reads lives in [`src/config/wedding.ts`](src/config/wedding.ts).

- **`null` means unconfirmed.** In development these show as dashed placeholders. In production they are hidden, and whole sections hide until they have content (countdown, story, family, venue, travel, contacts). Nothing unconfirmed is ever published.
- Values marked `PLACEHOLDER` (names, wording) are stand-ins and must be replaced.
- Dates are **venue-local** (`"2027-02-14T19:30"`), with `wedding.timeZone` (default `Asia/Kolkata`). The countdown is correct for guests anywhere.
- Odia text (invocation, headings, event names) is best-effort and **must be confirmed with the family**.

### Content checklist before publishing

| Item | Where |
|---|---|
| Couple's names | `couple.bride` / `couple.groom` |
| Couple section wording (invocation, greeting, invite line, hashtag, quote) | `couple` |
| Wedding date & time (now the invitation's SAMPLE date — add the Lagna time) | `wedding.dateTime` |
| Invitation card wording, names, date and place (date and place are SAMPLES — replace) | `invitation` |
| Our Story chapters (SAMPLE wording — replace with the couple's own) | `story.chapters` |
| Family: the parents of the groom and of the bride (names as written, with honorifics), each family's blessing, the illustration and the Odia line | `family` |
| Itinerary: ceremonies, Odia names, dates, times, about text, dress codes, venues and map links (SAMPLE values — confirm) | `events.items` |
| Gallery photographs (`tall: true` for a taller arch, `focus` for where the crop centres) | `gallery.photos` |
| Venue name, address, photo, map link | `venue` |
| The Wedding Journey: heading, getting here (modes), closing | `travel` |
| Contacts (with country code) | `contact.groups` (bride's side, groom's side, coordinators) |
| RSVP deadline, party-size limit | `rsvp` |
| Opening sound button: a recording to play instead of the synthesised sankha (optional) | `assets.openingSound`, e.g. `"/audio/opening.mp3"` in `/public` |
| Thank-you message | `thankYou` |
| Show every section with dashed placeholders for unconfirmed details (turn **off** before sharing the final invitation, so empty sections hide) | `site.showPlaceholders` |
| Public URL (for WhatsApp previews) | `meta.siteUrl`, then `npm run og` |

## Blessings Wall & RSVP storage (Supabase)

1. Create a Supabase project.
2. In **SQL Editor**, run [`supabase/migrations/20261013000000_tila.sql`](supabase/migrations/20261013000000_tila.sql).
3. Copy `.env.example` to `.env.local` and fill in the project URL and **anon** key (Project Settings → API). Set the same two variables in your host's environment.

What the security rules allow (with the public anon key):
- **Wishes:** guests can add them. Everyone can read wishes whose `status` is `visible`.
- **RSVPs:** guests can add them, but they are never readable from the site. The couple reads responses in the Supabase dashboard (Table editor → `rsvps`).
- **Moderation:** set a wish's `status` to `hidden` to remove it. For approval before publishing, follow the comments in the SQL file and set `wishes.requireApproval = true`.
- **Spam:** forms use a honeypot field, a minimum fill time and a per-device cooldown. The database enforces length limits and rejects duplicate wishes.

Without these variables, development uses a browser-only stand-in store. Production hides the Blessings Wall, and RSVP shows a "contact the family" message instead of a form that can't save.

## Layout modes

| Width | Mode |
|---|---|
| Phones (< 768px) | Full-bleed: the primary experience |
| Tablets (768–1023px, or touch devices) | Full-bleed, centred content column |
| Desktop (≥ 1024px with a mouse) | Live site inside an iPhone 17 Pro Max mockup (iframe at true phone width), over a dim palace hall with drifting gold dust (`assets.desktopBackdrop`, `public/art/desktop-dark.webp`) |

## Sharing

`npm run build` writes the title, description and Open Graph / Twitter tags from the config into `index.html`, because WhatsApp doesn't run JavaScript. `meta.noindex` (on by default) keeps this private invitation out of search engines.

## Sections & motion

Each section has its own entrance. All of them respect *reduced motion*.

| Section | Motion |
|---|---|
| Opening | The carved temple gate (`public/art/temple-door.webp`, Lakshmi above) in warm light, a golden fingertip tapping its brass lock above TAP TO OPEN. A tap, or 5 s of nothing, opens it (once): the doors part onto a dark doorway with light deep inside, hundreds of golden motes (one canvas, `opening/GoldDust.tsx`) and delicate rays pour out; the gate fades and is removed; on deep black Mahaprabhu Jagannath (`jagannath-darshan.webp`, sunburst masked away) emerges slowly through the motes in a soft halo; petals fall during the darshan; he dissolves into motes in his own shape, which swirl into a ring that settles onto the invitation's rangoli. Skip / Esc; a sound button plays the sankha |
| Invitation | The illustrated invitation card (`public/art/invitation-card.jpg`) fits one screen; its plain middle band repeats so it fills any height undistorted. Text in the site's typography — the opening line in exactly two lines sized to the width, the names stacked (first / & / second), the date and place — is centred between the deities and a colourful filled jhoti rangoli between the banana trees, shrinking just enough to fit (down to 72%, then the card scrolls). The rangoli builds ring by ring and breathes above a bold "Tap the rangoli" on a cream pill; a tap spins its petals into a golden wash that fades into the couple (once only) |
| Couple | The couple card (`public/art/couple-card.jpg`: carved arch in a red-and-gold border, cream matched to the invitation) fills one screen. Spread evenly inside it: a small dark red Ganesha (`public/art/ganesha-dark-red.png`) just above || Om Ganeshaya Namah ||, the guest greeted by name, the names stacked rising in one after another, the hashtag between gold rules, and a quote under a small lotus; the illustrated couple seated at the sacred fire (`public/art/couple-havan.png`) is centred at the bottom |
| Countdown | A cream card after the couple's design: "Our Wedding · ଶୁଭ ବିବାହ · The countdown to our Forever Begins", a round Sambalpuri-ikat medallion (`art/IkatWheel.tsx`, red, black and white pasapali checks and phula) that turns into place with the scroll, its cream heart divided into four by a fine cross with a small medallion at the centre, counting days, hours, mins and secs (labels in English and Odia); the date beneath. Ornaments in the couple card border's red |
| Our Story | A hanging scroll on the gallery's cream with faint white flowers: the thread from the countdown's wheel comes down to a nail, and the scroll hangs from it by a string — maroon rods with wooden knobs, parchment between. It unrolls as it comes into view: "Two Hearts, One Journey" over "Our Story", four chapters alternating left and right, and the bride and groom (`couple.png`) at its foot among small hearts |
| Events | Wedding Events as a vine timeline: a green vine zigzags from flower to flower (hand-drawn SVG marigold and white champa, in turn, on a thin vine with slim leaves and small buds), alternating left and right and growing as you scroll; under each flower the name, Odia name and a "Tap to view details" button that opens a card with the date, time, about, dress code and place (with "View map" when `mapUrl` is set). One card open at a time |
| Family | The Families, after the couple's design: a gold filigree crest over THE FAMILIES (gold and maroon), "Bound by Love, Blessed by Family" and a gold lotus divider; the couple with both sets of parents (`public/art/family/family-portrait.webp`, edges fading into the page); the Groom's Parents and the Bride's Parents one above the other, each in a carved gold frame under a lotus (`GoldFrame`, after the couple's design) with the names in large bold maroon and their family's blessing in bold italics; || ବସୁଧୈବ କୁଟୁମ୍ବକମ୍ || (regular weight, gold bars and maroon words); a veil keeps the background flowers at about 30% here; Lord Jagannath (`public/art/family/jagannath.png`) between gold scrolls over Jai Jagannath |
| Gallery | The Raghurajpur Canvas: photographs in an asymmetric masonry on the page cream among faint white flowers (`public/art/gallery-flowers.svg`), each in a palace arch (`art/GoldArch.tsx`: a smooth pointed top with a small gold finial, a fine gold outline and hairline, a wide cream mat and a maroon line round the photograph); tap to enlarge |
| RSVP | Kindly RSVP, after the couple's design, between the side bands on the flowered cream: || ଶ୍ରୀ ଗଣେଶାୟ ନମଃ ||, a framed || ଶୁଭ ବିବାହ ||, An Auspicious Invitation and its words; the couple's image of a brass thali of gua with marigolds, rose petals and two lit diyas (`public/art/rsvp-gua-thali.webp`, its edges fading into the page); "Accept the Sacred Gua & Bless Us" and an ornate maroon Accept Invitation plaque with its Odia; Jai Jagannath · ଜୟ ଜଗନ୍ନାଥ. One tap accepts (saved under the guest's name from their link): a lotus blooms ring by ring over a golden glow, a thin gold ring draws round it and a red seal with a white tick appears as marigold and rose petals scatter (`LotusConfirm`) and about 110 grains of turmeric rice shower down the screen (`RiceShower`, removed after five seconds), over RSVP Confirmed · ଧନ୍ୟବାଦ · Thank you!, a blessing card in English and Odia, and Add to Calendar (an .ics file, `lib/calendar.ts`). Without a database (the live site today) it runs as a labelled preview that saves nothing. Wording in `rsvp.*` |
| Wishing Wall | Handcrafted and Odia, between the side bands: a toran of mango leaves and marigolds across the top (`art/Toran.tsx`); The Wishing Wall and a line of blessing; the latest wishes on notes of lined paper (cream, blush, butter), each pinned with a marigold and signed "— NAME · RELATION"; View all wishes; then Write your note: a box for the name and a box for the blessing (up to 200 characters), each white with a rust stroke, and Leave a Wish, after which a marigold petal rises. New blessings are saved as pending and appear only once the couple sets them to visible in Supabase (run `supabase/migrations/20261017000000_wish_relation_approval.sql`). Without a database (the live site today) a blessing is kept in the sender's browser and shown to them as waiting. While placeholders are on, the SAMPLE wishes in `wishes.samples` fill the notes. Wording in `wishes` |
| Venue & Travel | Venue & Accommodation, after the couple's design, as a narrow editorial column: two stops built the same way — a painting at one shared scale (temple, beach at Puri; `public/art/venue/`), then a header (maroon medallion with a gold icon, rule, number, title, tagline), then details in even rows with dashed separators — 01 The Venue (Jagannath Kalyan Mandap, Bhubaneswar; place, date; View on Map), 02 Getting Here (air, train, local transport). A small dashed route with a pin and a tiny plane links them. Falling petals fade out while it fills the screen (`data-no-petals`). Jay Jagannath and a faint wheel sketch at the foot |
| Contact | After the couple's design, on the page's own background: Contact over a lotus rule and a line of help; then Bride's Side (Kanya Paksha) and Groom's Side (Bara Paksha), each under its small crown (`public/art/contact/`) and name in maroon, with a row per person — role, name, what to ask them — and a round call button and a round WhatsApp button. Contacts in `contact.groups`; SAMPLE entries (masked numbers) show only while placeholders are on |
| Thank you | After the couple's design, between the side bands on the flowered cream: Lord Jagannath between red filigree; "Thank You" in italic and a line of gratitude; the couple at Puri looking out to the sea and the Jagannath temple; the hashtag, the date and the place (`public/art/thanks/`) |
| Closing note | Opened by the maroon separator: "Your presence will make our celebration complete." types itself out behind a blinking caret, then || ପ୍ରେମ ଓ ପବିତ୍ର ବନ୍ଧନ ||, the initials A ♡ P, and Back to top (returns to the couple card). Wording in `footer` |
| Side bands | From the countdown to the footer, the looped red band of the couple card's border (`public/art/border-loops.png`, an exact repeat cut from `couple-card.jpg`) runs down both sides of the page (`art/SideBands.tsx`); sections no longer carry borders of their own |
| Backgrounds | The couple card's paper and every later section share one colour: the page ochre, a little lighter (`--page`, #F3E4C9, in `src/index.css`). Every section after the couple card except Wedding Events also carries soft white flowers with thin outlines as a delicate watermark, full along the outer edges and corners and only a faint trace behind the text (`.page-flowers::before`, `public/art/gallery-flowers.svg`), set once on the box around them in `RestOfSite.tsx` |
| Falling petals | A few (seven) soft rose and marigold petals drift down the screen from the couple card to the footer (`art/FallingPetals.tsx`, in `RestOfSite.tsx`); they pause off screen and are left out for reduced motion |
| Typography | Four families only, set as CSS variables at the top of `src/index.css` (`--font-*`, `--c-*`, `--fs-*`) and applied through role classes (`t-blessing`, `t-names`, `t-amp`, `t-hashtag`, `t-heading`, `t-event`, `t-odia`, `t-greeting`, `t-body`, `t-quote`, `t-button`, `t-label`, `t-value`, `t-note`): Cinzel for the blessing and hashtag; Cormorant Garamond for headings, body, quotes, values and the couple's names (italic; one variable switches the names to Cinzel); Jost for buttons, labels and notes; Noto Sans Oriya for all Odia. Headings and names are about 10% smaller below 360px |
| Section separators | One small system on every seam (`ui/SectionSeparator.tsx`, placed in `RestOfSite.tsx`): antique-gold hairlines or a thin green vine around one emblem — a bud, a marigold with leaves, a Pattachitra rosette, a gold floret, a lotus, a Konark chakra, a map pin, or a maroon bloom with leaves as the closing signature (opening the footer); petals drift into the one before Thank You. Countdown → Our Story keeps its existing gold thread to the scroll's nail. Separators sit in the sections' padding and never add space or overlap content |
