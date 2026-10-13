/**
 * Wedding times are written in the venue's local time ("2027-02-14T19:30").
 * Display formatting must not shift them into the guest's own time zone,
 * so we format the wall-clock parts directly (via UTC) rather than parsing
 * the string as a local Date.
 */
export interface VenueDateTime {
  year: number;
  month: number; // 1–12
  day: number;
  hour: number | null;
  minute: number | null;
}

const ISO_LOCAL = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/;

export function parseVenueDateTime(iso: string | null): VenueDateTime | null {
  const m = iso ? ISO_LOCAL.exec(iso) : null;
  if (!m) return null;
  return {
    year: +m[1],
    month: +m[2],
    day: +m[3],
    hour: m[4] ? +m[4] : null,
    minute: m[5] ? +m[5] : null,
  };
}

export interface FormattedVenueDate {
  weekday: string; // "Sunday"
  day: string; // "14"
  month: string; // "February"
  year: string; // "2027"
  time: string | null; // "7:30 PM"
}

export function formatVenueDate(p: VenueDateTime, locale = "en-IN"): FormattedVenueDate {
  const asUtc = new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour ?? 0, p.minute ?? 0));
  const fmt = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...o, timeZone: "UTC" }).format(asUtc);

  return {
    weekday: fmt({ weekday: "long" }),
    day: String(p.day),
    month: fmt({ month: "long" }),
    year: String(p.year),
    time: p.hour === null ? null : fmt({ hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase(),
  };
}
