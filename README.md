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
| Invitation wording, Odia invocation | `invitation` |
| Temple for the opening | `opening.templeScene` (current): illustrated temple split into a sky plate, a temple mask and a sea mask, so the temple rises from behind the sea; `door` = doorway box in the image pixels. Set it to `null` to fall back to `opening.templePhoto` (the earlier photo), or set both to `null` for the drawn temple. |
| Lord Jagannath artwork | `assets.deityArtwork` (current: illustrated Jagannath, Subhadra and Balabhadra). `scenePosition` centres Lord Jagannath in the doorway; `focus` is his crown and face for the medallion. The earlier photo is still in `public/art/jagannath.jpg`. |
| Couple illustration (Odia attire) | `assets.coupleIllustration` |
| Our Story milestones (the couple's own words) | `story.milestones` |
| Family names, parents, photos | `family` |
| Event dates, times, venues, dress codes, descriptions | `events.items` |
| Venue name, address, photo, map link | `venue` |
| Verified travel & stay details | `travel` |
| Contacts (with country code) | `contact.people` |
| RSVP deadline, party-size limit | `rsvp` |
| Love notice, thank-you message | `footer`, `thankYou` |
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
| Opening | Temple rises, whole temple zooms in to its door, the doors swing open on Lord Jagannath, and the deity shrinks into a medallion at the top of the invitation (Skip / Esc) |
| Invitation | Staggered rise; slow parallax drift on scroll |
| Couple | Arched frame rises; names written on left → right |
| Countdown | Lotus mandala draws itself |
| Our Story | Thread grows with the scroll; Chandua medallions stitch on |
| Family | Two sides slide in towards each other |
| Events | Cards dealt in with a 3D tilt; details in a bottom sheet |
| Venue | Image parts from the centre like a curtain |
| Travel & Stay | Blocks come into focus from a blur |
| Wishing Wall | Wishes drop in like pinned notes |
| RSVP | Torana arch rises; accepting blooms a gold ornament |
| Contact | Circular wipe reveal |
| Thank you | Slow fade, message word by word |
| Footer | Gold thread draws outward |
