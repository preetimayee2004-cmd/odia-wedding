import { wedding } from "@/config/wedding";
import { parseVenueDateTime, venueInstant } from "@/lib/venueTime";

const pad = (n: number) => String(n).padStart(2, "0");
const utcStamp = (ms: number) => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
};
/** iCalendar text values escape backslashes, commas, semicolons and newlines. */
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

/** True when there is a wedding date to put in a calendar. */
export function canAddToCalendar(): boolean {
  return parseVenueDateTime(wedding.wedding.dateTime) !== null;
}

/**
 * Downloads an .ics file for the wedding, which phones open straight into
 * their calendar app. A date alone becomes an all-day event; with a time
 * (the Lagna) it becomes a three-hour event at the venue's local time.
 */
export function downloadWeddingCalendar() {
  const p = parseVenueDateTime(wedding.wedding.dateTime);
  if (!p) return;
  const names = wedding.invitation.names.join(" & ");
  const place = [wedding.venue.name, wedding.venue.address ?? wedding.venue.city].filter(Boolean).join(", ") || wedding.invitation.place || "";

  let when: string[];
  if (p.hour === null) {
    const next = new Date(Date.UTC(p.year, p.month - 1, p.day + 1));
    when = [
      `DTSTART;VALUE=DATE:${p.year}${pad(p.month)}${pad(p.day)}`,
      `DTEND;VALUE=DATE:${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`,
    ];
  } else {
    const start = venueInstant(p, wedding.wedding.timeZone);
    when = [`DTSTART:${utcStamp(start)}`, `DTEND:${utcStamp(start + 3 * 3600_000)}`];
  }

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TILA//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:wedding-${p.year}${pad(p.month)}${pad(p.day)}@tila`,
    `DTSTAMP:${utcStamp(Date.now())}`,
    ...when,
    `SUMMARY:${icsText(`${names} — Wedding`)}`,
    place && `LOCATION:${icsText(place)}`,
    `DESCRIPTION:${icsText(`With the blessings of Lord Jagannath, ${names} unite in matrimony. ${window.location.origin}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${names.replace(/\s*&\s*/g, "-").replace(/\s+/g, "-").toLowerCase()}-wedding.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
