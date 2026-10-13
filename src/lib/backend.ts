/**
 * Persistence for the Wishing Wall and RSVP (PRD §4.10, §4.11).
 *
 * Talks to Supabase's REST API (PostgREST) with plain fetch — no SDK — using
 * the public anon key. Row-level security in
 * supabase/migrations/*_tila.sql decides what that key may do:
 *   wishes: insert, and read only rows with status = 'visible'
 *   rsvps:  insert only — responses are never readable from the site
 *
 * Without VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY:
 *   dev  → a localStorage stand-in so forms can be exercised
 *   prod → `backendReady` is false and the features hide themselves
 */

const BASE = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const configured = Boolean(BASE && KEY);
const devFallback = !configured && import.meta.env.DEV;

/** True when submissions can actually be saved somewhere. */
export const backendReady = configured || devFallback;

export type FailureKind = "offline" | "unavailable" | "rejected" | "server";

export class BackendError extends Error {
  constructor(
    public kind: FailureKind,
    message: string,
  ) {
    super(message);
  }
}

export interface Wish {
  id: string;
  name: string | null;
  message: string;
  created_at: string;
}

export interface RsvpInput {
  id: string;
  name: string;
  attending: boolean;
  attendees: number;
  message: string | null;
  /** Name from the personalised invite link, to match responses to invites. */
  guest_key: string | null;
}

export function newId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// ── REST transport ──────────────────────────────────────────────

async function rest(path: string, init: RequestInit & { prefer?: string } = {}): Promise<Response> {
  if (!configured) throw new BackendError("unavailable", "Saving isn't available yet.");
  let res: Response;
  try {
    res = await fetch(`${BASE}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: KEY!,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        ...(init.prefer ? { Prefer: init.prefer } : {}),
      },
    });
  } catch {
    throw new BackendError("offline", "We couldn't reach the server. Please check your connection and try again.");
  }
  // 409 = this exact id was already saved (a retry) — treat as success.
  if (res.ok || res.status === 409) return res;
  if (res.status === 400 || res.status === 403 || res.status === 422) {
    throw new BackendError("rejected", "That couldn't be saved. Please check your entry and try again.");
  }
  throw new BackendError("server", "Something went wrong on our side. Please try again in a moment.");
}

async function insert(table: string, row: object): Promise<void> {
  await rest(table, { method: "POST", body: JSON.stringify(row), prefer: "return=minimal" });
}

// ── Dev stand-in ────────────────────────────────────────────────

const devKey = (table: string) => `tila:dev:${table}`;
const devDelay = () => new Promise((r) => setTimeout(r, 650));

function devRead<T>(table: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(devKey(table)) ?? "[]") as T[];
  } catch {
    return [];
  }
}

async function devInsert(table: string, row: { id: string; message?: string | null }) {
  await devDelay();
  // Type "#fail" in a message to rehearse the error state.
  if (row.message?.includes("#fail")) throw new BackendError("server", "Something went wrong on our side. Please try again in a moment.");
  const rows = devRead<{ id: string }>(table);
  if (!rows.some((r) => r.id === row.id)) rows.unshift({ ...row, created_at: new Date().toISOString() } as never);
  localStorage.setItem(devKey(table), JSON.stringify(rows));
}

// ── Public API ──────────────────────────────────────────────────

export async function listWishes(limit: number, offset = 0): Promise<{ items: Wish[]; total: number }> {
  if (devFallback) {
    await devDelay();
    const all = devRead<Wish>("wishes");
    return { items: all.slice(offset, offset + limit), total: all.length };
  }
  const res = await rest(
    `wishes?select=id,name,message,created_at&order=created_at.desc&limit=${limit}&offset=${offset}`,
    { prefer: "count=exact" },
  );
  const items = (await res.json()) as Wish[];
  const total = Number(res.headers.get("content-range")?.split("/")[1]) || items.length;
  return { items, total };
}

export async function addWish(wish: { id: string; name: string | null; message: string }): Promise<void> {
  if (devFallback) return devInsert("wishes", wish);
  return insert("wishes", wish);
}

export async function submitRsvp(rsvp: RsvpInput): Promise<void> {
  if (devFallback) return devInsert("rsvps", rsvp);
  return insert("rsvps", rsvp);
}
