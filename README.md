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

Names and details can be as long as they need to be. A long name, place or hashtag first shrinks a little, then wraps onto another line (`ui/FitText.tsx`), so no section's design breaks and nothing is cut off or spills past the side bands.

**It ships with an example wedding.** So every section can be seen working, the template is filled with a complete sample: Avi & Pragya, Friday 12 February 2027 (lagna 7:00 PM), Jagannath Kalyan Mandap in Bhubaneswar, nine ceremonies, four contacts and three wishes. Every example value is marked `DEMO` in the config. While `site.demo` is `true`:

- the closing note ends with one quiet line saying it's an example invitation;
- the three sample wishes carry an "Example" mark;
- Call and WhatsApp never dial (the example numbers, `+91 00000 0000x`, can't reach anyone either way);
- without a database, RSVP and wishes run as labelled previews and nothing is saved.

Replace every `DEMO` value using the checklist below, then set `site.demo` to `false`.

- **`null` means unconfirmed.** While placeholders are on (always in development, or with `site.showPlaceholders`) these show as quiet italic stand-ins with a small dashed "Placeholder" tag. With it off they are hidden, and whole sections hide until they have content (countdown, story, family, venue, travel, contacts). Nothing unconfirmed is ever published.
- Values marked `DEMO` are the example wedding and must be replaced.
- Dates are **venue-local** (`"2027-02-14T19:30"`), with `wedding.timeZone` (default `Asia/Kolkata`). The countdown is correct for guests anywhere.
- Odia text (invocation, headings, event names) is best-effort and **must be confirmed with the family**.

### Before you publish: replace the example data

| Item | Where |
|---|---|
| Couple's names (DEMO: Avi & Pragya — also the page title) | `couple.bride` / `couple.groom`, `invitation.names` |
| Couple section wording (invocation, invite line, quote; DEMO hashtag and place — the date block comes from `wedding.dateTime`) | `couple` |
| Wedding date & lagna time (DEMO: `"2027-02-12T19:00"`) — drives the countdown, every date shown and Add to Calendar | `wedding.dateTime` |
| Invitation card wording and names (DEMO names) | `invitation` |
| Our Story chapters (DEMO wording — replace with the couple's own; each has its illustration in `art`) and the intro line | `story.chapters`, `story.intro` |
| Family: the parents of the groom and of the bride (DEMO names — replace, with honorifics), each family's blessing, the illustration and the Odia line | `family` |
| Itinerary: ceremonies, Odia names, dates, times, about text, dress codes (with a `wear` word and `dressColors`), venues and map links (DEMO dates and times) | `events.items` |
| Gallery photographs (`featured: true` for the wide arch at the top, `tall: true` for a taller arch, `focus` for where the crop centres, `still: true` to keep a photographer's mark in view) and the featured photo's Pattachitra painting (`painting`, e.g. `public/gallery/featured-pattachitra.webp`; its toggle appears once the file exists) | `gallery.photos` |
| Venue name, address, photo, map link (DEMO: a made-up street; the map opens Old Town, Bhubaneswar) | `venue` |
| The Wedding Journey: heading, getting here (modes), closing | `travel` |
| Contacts (DEMO: made-up names, fictional numbers — replace with real ones, with country code) | `contact.people` (the groom's and bride's brothers, then the coordinators) |
| RSVP deadline, party-size limit | `rsvp` |
| Music (only audio you are licensed or permitted to use, in `/public/audio/`): devotional music for the opening, and the site's song (from the rangoli tap on) | `assets.openingMusic`, `assets.weddingMusic` — now `"/audio/temple-bell-shankh.mp3"` (once, through the opening) and `"/audio/sakhi-thiba-sei.mp3"` (looping, from the couple section) (null: the synthesised sankha during the opening, then no music) |
| A sankha recording to use instead of the synthesised one (optional) | `assets.openingSound`, e.g. `"/audio/sankha.mp3"` |
| Thank-you message | `thankYou` |
| Sample wishes (DEMO — shown only while `site.demo` or placeholders are on) | `wishes.samples` |
| Quiet stand-ins for any detail left empty (turn **off** before sharing, so empty details simply don't show) | `site.showPlaceholders` |
| **Last: turn the example off** | `site.demo: false` |
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
| Opening | The carved temple gate (`public/art/temple-door.webp`, Lakshmi above) in warm light, a golden fingertip tapping its brass lock above TAP TO OPEN. The gate shows as soon as the door image has loaded (the darshan artwork loads meanwhile). A tap, or 3.5 s of nothing, opens it (once): the doors part onto a dark doorway with light deep inside, hundreds of golden motes (one canvas, `opening/GoldDust.tsx`) and delicate rays pour out; the gate fades and is removed; on deep black Mahaprabhu Jagannath (`jagannath-darshan.webp`, sunburst masked away) emerges slowly through the motes in a soft halo; petals fall during the darshan; he dissolves into motes in his own shape, which swirl into a ring that settles onto the invitation's rangoli — about 6.5 s from the tap. Skip, Esc, or a tap anywhere during the darshan skips to the end. Sound (`lib/sound.ts`): song 1, the devotional sound, starts with the tap on the gate (`assets.openingMusic`, the temple bell & shankh, played once through the opening; while null, the synthesised sankha). Song 2 takes over from the couple section: at the rangoli tap song 1 fades out as song 2 fades in over one second (on iPhones, which fix the volume, the switch is clean). The song (`assets.weddingMusic`) is one shared `<audio>` element (loop, preload auto, volume 0.6), started inside the rangoli's tap on the invitation (play() is called synchronously in the click, so iPhones allow it) — or, if the invitation opened by itself, at the visitor's first tap anywhere in the couple section. Nothing starts it earlier: during the opening and on the invitation card the shankh is the only sound, and there the sound buttons only mute or unmute (the shankh pauses or carries on). It plays on through every section, pauses while the tab is hidden and resumes on return; from the couple section the sound buttons play and pause it (the choice kept for the visit). If the file can't load, the buttons simply stay off; play() failures are logged to the console. |
| Invitation | The illustrated invitation card fits one screen: the card (`public/art/invitation/card.jpg`) with its toran and the trinity lifted into their own layers (`toran.webp`, `trinity.webp`); its plain middle band (`public/art/invitation-card-middle.png`) repeats so it fills any height undistorted. The panel is shared in three bands: the top art (the toran swaying gently from its top centre, the trinity 150–160px wide in a soft golden glow, the hanging lamps' flames flickering) about 27%; the words in the middle, centred (|| Jai Jagannath ||, the guest by name, Save the Date, the names at 52px with a gold &, are getting married, then a gold divider, the date as 12 · 02 · 2027 in Cinzel and the city in italics); and the rangoli (30% larger, turning slowly, a gold ring pulsing behind it until tapped) with Tap the rangoli about 27%. A tap opens the site; with no tap, it opens by itself five seconds after the rangoli is ready (the count pauses while the page is in the background). Reduced motion: nothing sways, flickers, turns or pulses |
| Couple | The couple card (`public/art/couple-card.jpg`: carved arch in a red-and-gold border, its paper the same warm sand as the sections (#F6DEB1); the fine scrollwork in its upper corners and rosettes and two bright inner outlines of the arch are quieted) fills one screen on most phones. Inside it, in four groups (about 10px within a group, 24px between): a small dark red Ganesha (`public/art/ganesha-dark-red.png`), || Om Ganeshaya Namah || and the invite line; the couple's names — the focal point, large maroon serif with a small gold ampersand (a long name shrinks a little, then takes two lines); the date as a classic block (FRIDAY \| 12 \| FEB 2027 between delicate gold lines), then the venue and a small outlined "Add to calendar" (Google Calendar) together; a small lotus, the quote and the hashtag between gold rules, close above the illustrated couple seated at the sacred fire (`public/art/couple-havan.png`), which keeps clear of the bottom border. The arch settles in, then the names, date and venue, quote and couple rise in one after another; reduced motion: all simply there. Falling petals fade while it fills the screen |
| Countdown | A cream card after the couple's design: "Our Wedding · ଶୁଭ ବିବାହ · The countdown to our Forever Begins", a round Sambalpuri-ikat medallion (`art/IkatWheel.tsx`, red, black and white pasapali checks and phula) that turns into place with the scroll, its cream heart divided into four by a fine cross with a small medallion at the centre, counting days, hours, mins and secs (labels in English and Odia); the date beneath. Ornaments in the couple card border's red |
| Our Story | A story mural painted on a hanging scroll: the thread from the countdown's wheel comes down to a nail, and the scroll hangs from it by a string — maroon rods with wooden knobs, parchment between. Closed at first, it unrolls when it comes into view (the bottom rod travels down as the parchment is revealed, a little longer for a taller story, up to 3.6 s), and each part appears as the opening edge reaches it: "Two Hearts, One Journey", "Our Story", a gold lotus and `story.intro` in italics; then the chapters, each with a small illustration (`story.chapters[].art`) whose edge washes into warm beige and dissolves into the paper (baked into the picture; the couple keeps its own colours), alternating left and right, the words wrapping round it; after each chapter, a small gold lotus with a fine gold line curving gently out to a little sprig of leaves on either side (after the couple's design), drawing outward from the lotus as it appears, down to the couple (`couple.png`) and the hashtag spelled out in Cinzel ("#AVI WEDS PRAGYA"). Illustrations (the couple's, cropped round the couple in `public/art/story/`): chai at a roadside tea stall, a sunset with shared earphones, her hennaed hand on his in wedding clothes, and the bride and groom with joined hands raised. Falling petals fade while it is read (`data-no-petals`). Reduced motion: open, all of it there |
| Events | Wedding Events as a vine timeline: a green vine zigzags from flower to flower (hand-drawn SVG marigold and white champa, in turn, on a thin vine with slim leaves and small buds), alternating left and right and growing as you scroll; under each flower the name, Odia name and a "Tap to view details" button that opens a card with the date, time, about, dress code and place (with "View map" when `mapUrl` is set). One card open at a time |
| Family | The Families: the gold filigree crest; TWO FAMILIES · ONE CELEBRATION over "Our Families", its jhoti rule and "Bound by Love, Blessed by Family"; the couple with both sets of parents (`public/art/family/family-portrait.webp`, edges fading into the page); the Groom's Family and the Bride's Family one above the other in matching compact gold frames (`GoldFrame`): label, names, blessing; "Together, our families become one."; || ବସୁଧୈବ କୁଟୁମ୍ବକମ୍ || (gold bars, maroon words). The page's flowers are veiled here, with four faint ones in the corners. Wording in `family` |
| Gallery | The Raghurajpur Canvas: one featured photograph in a wide 4:3 arch, then a two-column staggered grid (the right column 40px lower), each in a light jharokha (`art/GoldArch.tsx`: 1px gold line, 6px cream border, 1px maroon line, a small gold lotus on top). Wooden doors swing open as each frame comes 35% into view (the featured one first), photographs drift gently with the scroll, and a warm filter unifies their colours. "View all photos" or a tap opens the viewer (`ui/PhotoViewer.tsx`): the photo grows out of its arch, maroon backdrop, count, swipe or arrow keys to move, swipe down / Escape / close to leave. Reduced motion: no doors, drift or flight. Photos in `public/photos/gallery/` (WebP, about 800px wide; featured 1200px) |
| RSVP | Kindly RSVP, after the couple's design, between the side bands on the flowered cream: || ଶ୍ରୀ ଗଣେଶାୟ ନମଃ ||, a framed || ଶୁଭ ବିବାହ ||, An Auspicious Invitation and its words; the couple's image of a brass thali of gua with marigolds, rose petals and two lit diyas (`public/art/rsvp-gua-thali.webp`, its edges fading into the page); "Accept the Sacred Gua & Bless Us" and an ornate maroon Accept Invitation plaque with its Odia, under the line "Tap the accept button" (`rsvp.acceptHint`) and a small gold arrow nodding down to it; Jai Jagannath · ଜୟ ଜଗନ୍ନାଥ. One tap accepts (saved under the guest's name from their link): a lotus blooms ring by ring over a golden glow, a thin gold ring draws round it and a red seal with a white tick appears as marigold and rose petals scatter (`LotusConfirm`) and about 110 grains of turmeric rice shower down the screen (`RiceShower`, removed after five seconds), over RSVP Confirmed · ଧନ୍ୟବାଦ · Thank you!, a blessing card in English and Odia, and Add to Calendar (an .ics file, `lib/calendar.ts`). Without a database (the live site today) it runs as a labelled preview that saves nothing. Wording in `rsvp.*` |
| Wishing Wall | Handcrafted and Odia, between the side bands: a toran of mango leaves and marigolds across the top (`art/Toran.tsx`); The Wishing Wall and a line of blessing; the latest wishes on notes of warm ivory stationery (a whisper of cream, blush or butter under a gentle tonal wash and the faintest grain), each with a fine antique-gold outer line and a muted-maroon inner line, a soft diffused shadow, a small gold floral seal on its top edge (eight petals, a marigold or a lotus, in turn), and signed "— NAME · RELATION" (the name in maroon, the relation in muted gold); falling petals fade while the notes are read; View all wishes; then Leave Your Blessings on a paper card: the name and the blessing (up to 200 characters) and Send Blessing. Once it is accepted, the button gives a quick heartbeat and releases floating hearts and marigold petals (`lib/hearts.ts`; none under reduced motion), says "Blessing sent ♥" for 2 s ("Blessing kept ♥" in the preview, where nothing is saved online), and the new note fades onto the wall. New blessings are saved as pending and appear only once the couple sets them to visible in Supabase (run `supabase/migrations/20261017000000_wish_relation_approval.sql`). Without a database (the live site today) a blessing is kept in the sender's browser and shown to them as waiting. In the example wedding (or while placeholders are on), the sample wishes in `wishes.samples` fill the notes. Wording in `wishes` |
| Venue & Travel | Venue & Accommodation, after the couple's design, as a narrow editorial column: two stops built the same way — a painting (the mandap, and a signpost painted with a train, a plane, an auto-rickshaw and a bus; `public/art/venue/`), then a header (maroon medallion with a gold icon, rule, number, title, tagline), then details in even rows with dashed separators — 01 The Venue (Jagannath Kalyan Mandap, Bhubaneswar; place, date; View on Map), 02 Getting Here (air, train, local transport). A small dashed route with a pin and a tiny plane links them. Falling petals fade out while it fills the screen (`data-no-petals`). Jay Jagannath and a faint wheel sketch at the foot |
| Contact | Contact over a lotus rule and a line of help; then one cream card with a gold outer line, a maroon inner line and a dashed gold line, a gold lotus on its top edge and gold curls in its lower corners; the groom's and the bride's mukuts (`public/art/contact/`) drop onto its top corners and settle with a small swing (still under reduced motion). Inside: The Families — the groom's brother (Bara Paksha) and the bride's brother (Kanya Paksha) side by side, their buttons level — then, under a lotus, the Coordinators in full-width rows (role, name, what to ask them). Everyone has a round call button and a round WhatsApp button. Contacts in `contact.people` (`group: "family"` or `"coordinator"`); the example contacts have made-up names and fictional numbers that never dial while `site.demo` is on; otherwise a contact appears once it has a number |
| Thank you | After the couple's design, between the side bands on the flowered cream: Lord Jagannath between red filigree; "Thank You" in italic and a line of gratitude; the couple at Puri looking out to the sea and the Jagannath temple; the hashtag, the date and the place (`public/art/thanks/`) |
| Closing note | Opened by the maroon separator: "Your presence will make our celebration complete." types itself out behind a blinking caret, then || ପ୍ରେମ ଓ ପବିତ୍ର ବନ୍ଧନ ||, the initials A ♡ P, and Back to top (returns to the couple card). Wording in `footer` |
| Side bands | From the countdown to the footer, the looped red band of the couple card's border (`public/art/border-loops.png`, an exact repeat cut from `couple-card.jpg`) runs down both sides of the page (`art/SideBands.tsx`); sections no longer carry borders of their own |
| Backgrounds | Every section after the couple card shares one colour, a warm sand chosen by the couple (`--page`, #F6DEB1, in `src/index.css`; ornaments drawn in the page colour use the same variable). Every section after the couple card except Wedding Events also carries soft white flowers with thin outlines as a delicate watermark, full along the outer edges and corners and only a faint trace behind the text (`.page-flowers::before`, `public/art/gallery-flowers.svg`), set once on the box around them in `RestOfSite.tsx` |
| Falling petals | A few (seven) soft rose and marigold petals drift down the screen from the couple card to the footer (`art/FallingPetals.tsx`, in `RestOfSite.tsx`); they pause off screen and are left out for reduced motion |
| Typography | Four families only, set as CSS variables at the top of `src/index.css` (`--font-*`, `--c-*`, `--fs-*`) and applied through role classes (`t-blessing`, `t-names`, `t-amp`, `t-hashtag`, `t-heading`, `t-event`, `t-odia`, `t-greeting`, `t-body`, `t-quote`, `t-button`, `t-label`, `t-value`, `t-note`): Cinzel for the blessing and hashtag; Cormorant Garamond for headings, body, quotes, values and the couple's names (italic; one variable switches the names to Cinzel); Jost for buttons, labels and notes; Noto Sans Oriya for all Odia. Headings and names are about 10% smaller below 360px |
| Section separators | One small system on every seam (`ui/SectionSeparator.tsx`, placed in `RestOfSite.tsx`): antique-gold hairlines or a thin green vine around one emblem — a bud, a marigold with leaves, a Pattachitra rosette, a gold floret, a lotus, a Konark chakra, a map pin, or a maroon bloom with leaves as the closing signature (opening the footer); petals drift into the one before Thank You. Countdown → Our Story keeps its existing gold thread to the scroll's nail. Separators sit in the sections' padding and never add space or overlap content |
