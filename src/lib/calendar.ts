import { wedding, type WeddingEvent } from "@/config/wedding";
import { parseVenueDateTime, venueInstant, type VenueDateTime } from "@/lib/venueTime";

const pad = (n: number) => String(n).padStart(2, "0");
const utcStamp = (ms: number) => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
};
/** iCalendar text values escape backslashes, commas, semicolons and newlines. */
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

/** Something to put in a calendar, in the venue's wall-clock time (no hour: all day). */
export interface CalendarItem {
  title: string;
  start: VenueDateTime;
  /** Hours it lasts (ignored for an all-day item). */
  hours: number;
  location: string;
  details: string;
  /** For the .ics file's name and id. */
  slug: string;
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/** "Wednesday, 10 February 2027" → its day, month and year. */
export function parseDayLine(line: string | null): { year: number; month: number; day: number } | null {
  const m = line?.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  const month = m ? MONTHS.indexOf(m[2].toLowerCase()) + 1 : 0;
  return m && month ? { year: +m[3], month, day: +m[1] } : null;
}

/** The clock times in "10:00 AM – 1:00 PM" or "8:00 PM onwards" (24-hour), at most two. */
function parseTimes(when: string | null): Array<{ h: number; m: number }> {
  return [...(when ?? "").matchAll(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi)].slice(0, 2).map((t) => {
    const h12 = +t[1] % 12;
    return { h: h12 + (t[3].toUpperCase() === "PM" ? 12 : 0), m: t[2] ? +t[2] : 0 };
  });
}

/** "10:00 AM – 1:00 PM" → "10 AM – 1 PM"; "8:00 PM – 9:00 PM" → "8 – 9 PM"; "8:00 PM onwards" → "8 PM onwards". */
export function shortTime(when: string | null): string | null {
  if (!when) return null;
  const times = parseTimes(when);
  if (!times.length) return when;
  const clock = ({ h, m }: { h: number; m: number }) => `${h % 12 || 12}${m ? `:${pad(m)}` : ""}`;
  const half = ({ h }: { h: number }) => (h < 12 ? "AM" : "PM");
  const [a, b] = times;
  if (!b) return `${clock(a)} ${half(a)}${/onwards/i.test(when) ? " onwards" : ""}`;
  return half(a) === half(b) ? `${clock(a)} – ${clock(b)} ${half(b)}` : `${clock(a)} ${half(a)} – ${clock(b)} ${half(b)}`;
}

/** Where everything happens, as one line. */
const venueLine = () => [wedding.venue.name, wedding.venue.address ?? wedding.venue.city].filter(Boolean).join(", ") || wedding.couple.place || "";
const coupleNames = () => wedding.invitation.names.join(" & ");

/** A ceremony from Wedding Events, timed from its day and time lines (three hours if no end is given). */
export function eventCalendarItem(event: WeddingEvent): CalendarItem | null {
  const day = parseDayLine(event.date);
  if (!day) return null;
  const [a, b] = parseTimes(event.when);
  let hours = 3;
  if (a && b) {
    const span = b.h * 60 + b.m - (a.h * 60 + a.m);
    hours = (span > 0 ? span : span + 24 * 60) / 60;
  }
  return {
    title: `${event.name} · ${coupleNames()}'s wedding`,
    start: { ...day, hour: a ? a.h : null, minute: a ? a.m : null },
    hours,
    location: [event.venueName, venueLine()].filter(Boolean).join(", "),
    details: [event.about, event.dressCode && `Dress code: ${event.dressCode.replace(/\n/g, "; ").replace(/ \| /g, " · ")}`].filter(Boolean).join("\n\n"),
    slug: event.id,
  };
}

/** The wedding itself, at the lagna (a three-hour event; all day without a time). */
export function weddingCalendarItem(): CalendarItem | null {
  const p = parseVenueDateTime(wedding.wedding.dateTime);
  if (!p) return null;
  return {
    title: `${coupleNames()} — Wedding`,
    start: p,
    hours: 3,
    location: venueLine(),
    details: `With the blessings of Lord Jagannath, ${coupleNames()} unite in matrimony.`,
    slug: "wedding",
  };
}

/** True when there is a wedding date to put in a calendar. */
export function canAddToCalendar(): boolean {
  return weddingCalendarItem() !== null;
}

/** A Google Calendar link that opens the item ready to save (times in the venue's time zone). */
export function googleCalendarUrl(item: CalendarItem): string {
  const { start } = item;
  const date = (y: number, mo: number, d: number) => `${y}${pad(mo)}${pad(d)}`;
  let dates: string;
  if (start.hour === null) {
    const next = new Date(Date.UTC(start.year, start.month - 1, start.day + 1));
    dates = `${date(start.year, start.month, start.day)}/${date(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate())}`;
  } else {
    const wall = (ms: number) => {
      const d = new Date(ms);
      return `${date(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00`;
    };
    const s = Date.UTC(start.year, start.month - 1, start.day, start.hour, start.minute ?? 0);
    dates = `${wall(s)}/${wall(s + item.hours * 3600_000)}`;
  }
  const q = new URLSearchParams({ action: "TEMPLATE", text: item.title, dates, ctz: wedding.wedding.timeZone, location: item.location, details: item.details });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

/** Downloads an .ics file for the item, which phones open straight into their calendar app. */
export function downloadIcs(item: CalendarItem) {
  const { start } = item;
  let when: string[];
  if (start.hour === null) {
    const next = new Date(Date.UTC(start.year, start.month - 1, start.day + 1));
    when = [`DTSTART;VALUE=DATE:${start.year}${pad(start.month)}${pad(start.day)}`, `DTEND;VALUE=DATE:${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`];
  } else {
    const s = venueInstant(start, wedding.wedding.timeZone);
    when = [`DTSTART:${utcStamp(s)}`, `DTEND:${utcStamp(s + item.hours * 3600_000)}`];
  }
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TILA//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${item.slug}-${start.year}${pad(start.month)}${pad(start.day)}@tila`,
    `DTSTAMP:${utcStamp(Date.now())}`,
    ...when,
    `SUMMARY:${icsText(item.title)}`,
    item.location && `LOCATION:${icsText(item.location)}`,
    `DESCRIPTION:${icsText(`${item.details} ${window.location.origin}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${coupleNames().replace(/\s*&\s*/g, "-").replace(/\s+/g, "-").toLowerCase()}-${item.slug}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Downloads an .ics file for the wedding (used by the RSVP's Add to Calendar). */
export function downloadWeddingCalendar() {
  const item = weddingCalendarItem();
  if (item) downloadIcs(item);
}
