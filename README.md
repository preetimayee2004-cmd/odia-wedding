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
| Wedding date & time | `wedding.dateTime` |
| Invitation card wording, names, date and place (date and place are SAMPLES — replace) | `invitation` |
| Couple portraits (about 3:4) | `couple.bride.photo`, `couple.groom.photo` |
| Our Story milestones (the couple's own words) | `story.milestones` |
| Gurujana Pranam: grandparents and parents (`late: true` lights a dipa beside the name) | `family` |
| Event dates, times, venues, dress codes, descriptions | `events.items` |
| Venue name, address, photo, map link | `venue` |
| Verified travel & stay details | `travel` |
| Contacts (with country code) | `contact.people` |
| RSVP deadline, party-size limit | `rsvp` |
| Opening sound button: a recording to play instead of the synthesised sankha (optional) | `assets.openingSound`, e.g. `"/audio/opening.mp3"` in `/public` |
| Rajagya notices (parking, RSVP deadline, live stream), thank-you message | `rajagya`, `thankYou` |
| Public URL (for WhatsApp previews) | `meta.siteUrl`, then `npm run og` |

## Wishing Wall & RSVP storage (Supabase)

1. Create a Supabase project.
2. In **SQL Editor**, run [`supabase/migrations/20261013000000_tila.sql`](supabase/migrations/20261013000000_tila.sql).
3. Copy `.env.example` to `.env.local` and fill in the project URL and **anon** key (Project Settings → API). Set the same two variables in your host's environment.

What the security rules allow (with the public anon key):
- **Wishes:** guests can add them. Everyone can read wishes whose `status` is `visible`.
- **RSVPs:** guests can add them, but they are never readable from the site. The couple reads responses in the Supabase dashboard (Table editor → `rsvps`).
- **Moderation:** set a wish's `status` to `hidden` to remove it. For approval before publishing, follow the comments in the SQL file and set `wishes.requireApproval = true`.
- **Spam:** forms use a honeypot field, a minimum fill time and a per-device cooldown. The database enforces length limits and rejects duplicate wishes.

Without these variables, development uses a browser-only stand-in store. Production hides the Wishing Wall, and RSVP shows a "contact the family" message instead of a form that can't save.

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
| Opening | The carved temple door artwork (`public/art/temple-door.webp`) fills the screen, fading in from the dark; light gathers at the seam, then the two leaves swing smoothly inward on their own into golden light, the view glides through the doorway and Mahaprabhu Jagannath (`public/art/jagannath.png`, a transparent cut-out) emerges in a radiant golden glow, then the scene rises like a curtain (Skip / Esc; a sound button opposite Skip plays the sankha) |
| Invitation | The illustrated invitation card (`public/art/invitation-card.jpg`) fits one screen; its plain middle band repeats so it fills any height undistorted. Bold EB Garamond text — the opening line in exactly two lines sized to the width, the names stacked (first / & / second) in script, the date and place — is centred between the deities and a colourful filled jhoti rangoli between the banana trees, shrinking just enough to fit (down to 72%, then the card scrolls). The rangoli builds ring by ring and breathes above a bold "Tap the rangoli"; a tap — or 5s after the build, none — spins its petals into a golden wash that fades into the couple (once only) |
| Couple | Portrait cards in Tarakasi silver-filigree frames; a white Odia mukuta drops onto the bride’s frame and the groom’s crown onto his |
| Countdown | On a matte-black strip, the Konark Sun Temple wheel turns into alignment with the scroll; days, hours and minutes sit in its hub |
| Our Story | Sambalpuri Ikat thread grows with the scroll; chapters alternate either side, each marked by a Pattachitra icon (peacocks, Koka lotus, pana-gua) |
| Family | Gurujana Pranam grid: Aja & Aai above Pitra-Matra in crisp gold boxes; a flickering brass dipa beside departed elders |
| Events | Cards dealt in with a 3D tilt; details in a bottom sheet |
| Venue | Image parts from the centre like a curtain |
| Travel & Stay | Blocks come into focus from a blur |
| Wishing Wall | Wishes drop in like pinned notes |
| RSVP | Torana arch rises; accepting blooms a gold ornament |
| Contact | Circular wipe reveal |
| Thank you | The Mahaprasad Grace: one screen of evening sky over the Bay of Bengal; golden Pranam hands holding a Tulsi leaf trace themselves in, then the words of gratitude |
| Rajagya | Parchment decree banner pinned to the bottom, sealed with a brass Konark-wheel stamp; opens the full decree, dismisses to the seal, steps aside on the invitation card and the closing screen |
| Footer | Continues the evening sea; gold thread draws outward |
