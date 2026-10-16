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
| Gurujana Pranam: grandparents, parents, siblings & family (`late: true` lights a dipa beside the name) | `family` |
| Itinerary: ceremonies, Odia names, dates, times, about text, dress codes, venues and map links (SAMPLE values — confirm) | `events.items` |
| Gallery photographs (`tall: true` for a taller arch, `focus` for where the crop centres) | `gallery.photos` |
| Venue name, address, photo, map link | `venue` |
| Verified travel & stay details | `travel` |
| Atithi Culture & Style Guide pop-up (colours, handlooms, places to visit) | `atithi` |
| Contacts (with country code) | `contact.people` |
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
| Desktop (≥ 1024px with a mouse) | Live site inside an iPhone 17 Pro Max mockup (iframe at true phone width) |

## Sharing

`npm run build` writes the title, description and Open Graph / Twitter tags from the config into `index.html`, because WhatsApp doesn't run JavaScript. `meta.noindex` (on by default) keeps this private invitation out of search engines.

## Sections & motion

Each section has its own entrance. All of them respect *reduced motion*.

| Section | Motion |
|---|---|
| Opening | The carved temple gate (`public/art/temple-door.webp`, Lakshmi above) in warm light, a golden fingertip tapping its brass lock above TAP TO OPEN. A tap, or 5 s of nothing, opens it (once): the doors part onto a dark doorway with light deep inside, hundreds of golden motes (one canvas, `opening/GoldDust.tsx`) and delicate rays pour out; the gate fades and is removed; on deep black Mahaprabhu Jagannath (`jagannath-darshan.webp`, sunburst masked away) emerges slowly through the motes in a soft halo; petals fall during the darshan; he dissolves into motes in his own shape, which swirl into a ring that settles onto the invitation's rangoli. Skip / Esc; a sound button plays the sankha |
| Invitation | The illustrated invitation card (`public/art/invitation-card.jpg`) fits one screen; its plain middle band repeats so it fills any height undistorted. Bold EB Garamond text — the opening line in exactly two lines sized to the width, the names stacked (first / & / second) in Great Vibes, the date and place — is centred between the deities and a colourful filled jhoti rangoli between the banana trees, shrinking just enough to fit (down to 72%, then the card scrolls). The rangoli builds ring by ring and breathes above a bold "Tap the rangoli" on a cream pill; a tap spins its petals into a golden wash that fades into the couple (once only) |
| Couple | The couple card (`public/art/couple-card.jpg`: carved arch in a red-and-gold border, cream matched to the invitation) fills one screen. Spread evenly inside it: a gold Ganesha, || Om Ganeshaya Namah ||, the guest greeted by name, the names stacked in Great Vibes rising in one after another, the hashtag between gold rules, and a quote under a small lotus; the illustrated couple seated at the sacred fire (`public/art/couple-havan.png`) is centred at the bottom |
| Countdown | A cream card after the couple's design: "Our Wedding · ଶୁଭ ବିବାହ · The countdown to our Forever Begins", a round Sambalpuri-ikat medallion (`art/IkatWheel.tsx`, red, black and white pasapali checks and phula) that turns into place with the scroll, its cream heart divided into four by a fine cross with a small medallion at the centre, counting days, hours, mins and secs (labels in English and Odia); the date beneath. Ornaments in the couple card border's red |
| Our Story | A handmade illustrated journal over a softly cream-washed couple photograph (`public/art/story/couple-photo.webp`), fading in from the countdown and back to cream at the foot: "Two Hearts, One Journey" over the heading with a hand-drawn heart and underline; four chapters on alternating sides of a hand-drawn vermilion line with small pencil loops and doodles (flower, leaves, bells, hearts); the line draws itself with the scroll and leads to the bride and groom (`couple.png`), who fade in |
| Events | Wedding Events as a vine timeline: a green vine zigzags from flower to flower (hand-drawn SVG marigold, champa and lotus, in turn), alternating left and right and growing as you scroll; under each flower the name, Odia name and a "Tap to view details" button that opens a card with the date, time, about, dress code and place (with "View map" when `mapUrl` is set). One card open at a time; rose and marigold petals drift over the section |
| Family | Gurujana Pranam & Blessings: Aja & Aai (flanked by two flickering dipas), Pitra-Matra Pranam and Suhuda-Varga in gold-bordered blocks, the two lineages meeting below; a dipa beside departed elders |
| Gallery | The Raghurajpur Canvas: photographs in an asymmetric masonry on the page cream among faint white flowers (`public/art/gallery-flowers.svg`), each in a painted Pattachitra arch (`art/PattachitraArch.tsx`: a band of flowers and leaves, two peacocks and a lotus beneath) with a finial; tap to enlarge |
| RSVP | The Jhoti Welcome: one clean card inside a red rice-paste jhoti frame; mustard-gold buttons; accepting blooms a gold ornament |
| Blessings Wall | The Ananda Bazar: blessings on talapatra palm leaves in a swipeable carousel; a marigold drops onto a guest's leaf when they send one |
| Venue, Travel & Stay | The Path to Purushottam Kshetra: off-white cards with gold Kalash markers in place of map pins; a golden "Atithi Culture & Style Guide" button opens colours, handlooms and places to visit |
| Contact | Circular wipe reveal |
| Thank you | The Mahaprasad Grace: one minimal screen; golden Pranam hands holding a Tulsi leaf trace themselves in, then the words of gratitude |
| Footer | Gold thread draws outward |
| Side bands | From the countdown to the footer, the looped red band of the couple card's border (`public/art/border-loops.png`, an exact repeat cut from `couple-card.jpg`) runs down both sides of the page (`art/SideBands.tsx`); sections no longer carry borders of their own |
| Backgrounds | The couple card's paper and every later section (except Our Story, over its photograph) share one colour: the page ochre, a little lighter (`--page`, #F3E4C9, in `src/index.css`) |
