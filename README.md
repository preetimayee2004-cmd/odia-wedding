# TILA — An Odia Wedding Invitation

A mobile-first, animated wedding invitation website celebrating traditional Odia Hindu heritage. It's shared as a link (mainly on WhatsApp) and personalised per guest.

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS (no animation library: motion uses the Web Animations API)

## Run locally

```bash
npm install
npm run dev        # http://localhost:8080
npm run build      # production build in dist/
```

Personalise a link with the guest's name:

```
http://localhost:8080/?guest=Priya%20Mishra
```

## Editing content

All names, dates, venue details and invitation wording live in **one file**: [`src/config/wedding.ts`](src/config/wedding.ts).

- Fields set to `null` are unconfirmed. In development they show as dashed placeholders; in production they are hidden, so nothing unconfirmed is ever published.
- `wedding.dateTime` is the venue's local time (e.g. `"2027-02-14T19:30"`) with `timeZone` (default `Asia/Kolkata`).
- `assets.deityArtwork`: path to the approved Lord Jagannath artwork in `/public`. Until set, a Nilachakra emblem stands in.

## Layout modes

| Width | Mode |
|---|---|
| Phones (< 768px) | Full-bleed: the primary experience |
| Tablets (768–1023px, or touch devices) | Full-bleed, centred content column |
| Desktop (≥ 1024px with a mouse) | Live site inside an iPhone 17 Pro Max mockup (rendered in an iframe at true phone width) |

## Build progress

- [x] Phase 1: Global shell, design tokens, guest personalisation, desktop phone mockup
- [x] Phase 2: Temple opening animation + Skip (placeholder timing)
- [x] Phase 3: Main invitation with personalised greeting and "Open Invitation"
- [ ] Phase 4: Couple introduction
- [ ] Phase 5: Countdown · Phase 6: Our Story · Phase 7: Family · Events · Venue
- [ ] Travel & Stay · Wishing Wall · RSVP · Contact · Thank you · Footer
- [ ] Final pass: performance audit, meta/OG tags
