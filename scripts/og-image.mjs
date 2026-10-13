#!/usr/bin/env node
/**
 * Generates public/og-image.png (1200×630) — the WhatsApp / social link
 * preview — from src/config/wedding.ts, using a locally installed
 * Chrome or Edge in headless mode.
 *
 *   npm run og
 *
 * Re-run whenever the couple's names, date or city change.
 * Set CHROME_PATH to point at a specific browser if needed.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createServer } from "vite";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "public", "og-image.png");

// ── Load the wedding config through Vite (it is TypeScript) ──
const vite = await createServer({ root, logLevel: "error", server: { middlewareMode: true }, appType: "custom" });
const { wedding } = await vite.ssrLoadModule("/src/config/wedding.ts");
const { formatVenueDate, parseVenueDateTime } = await vite.ssrLoadModule("/src/lib/venueTime.ts");
await vite.close();

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const parts = parseVenueDateTime(wedding.wedding.dateTime);
const date = parts ? formatVenueDate(parts) : null;
const dateLine = date ? `${date.weekday} · ${date.day} ${date.month} ${date.year}` : "";
const place = [wedding.venue.city].filter(Boolean).join("");

const teeth = Array.from({ length: 70 }, (_, i) => `<path d="M${i * 18} 0h9l-4.5 8Z" fill="#A72D32"/><path d="M${i * 18 + 9} 0h9l-4.5 8Z" fill="#C5A46D"/>`).join("");

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Noto+Serif+Oriya:wght@500&family=Pinyon+Script&family=Poppins:wght@400;500&display=block">
<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#F5EBDD;color:#2B2420}
  .frame{position:absolute;inset:26px;border:1.5px solid #C5A46D}
  .frame2{position:absolute;inset:34px;border:1px solid rgba(197,164,109,.45)}
  .band{position:absolute;left:0;right:0;height:8px}
  .wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
  .odia{font-family:"Noto Serif Oriya",serif;font-size:30px;color:#A72D32;line-height:1.6}
  .eyebrow{font-family:Poppins,sans-serif;font-weight:500;font-size:17px;letter-spacing:.32em;text-transform:uppercase;color:#5E524A;margin-top:6px}
  .names{font-family:"Pinyon Script",cursive;font-size:104px;line-height:1.1;color:#A72D32;margin-top:18px}
  .and{font-family:"Cormorant Garamond",serif;font-style:italic;font-size:52px;color:#8C6D3A;margin:0 18px}
  .rule{display:flex;align-items:center;gap:14px;margin-top:14px}
  .rule span{display:block;width:120px;height:1px;background:#C5A46D}
  .rule i{display:block;width:9px;height:9px;border:1px solid #C5A46D;transform:rotate(45deg)}
  .date{font-family:Poppins,sans-serif;font-weight:500;font-size:21px;letter-spacing:.18em;text-transform:uppercase;color:#2B2420;margin-top:18px}
  .place{font-family:Poppins,sans-serif;font-size:18px;letter-spacing:.12em;color:#5E524A;margin-top:6px}
</style></head><body>
<svg class="band" style="top:0" viewBox="0 0 1260 8" preserveAspectRatio="none">${teeth}</svg>
<svg class="band" style="bottom:0;transform:rotate(180deg)" viewBox="0 0 1260 8" preserveAspectRatio="none">${teeth}</svg>
<div class="frame"></div><div class="frame2"></div>
<div class="wrap">
  <div class="odia">ଶୁଭ ବିବାହ</div>
  <div class="eyebrow">Wedding Invitation</div>
  <div class="names">${esc(wedding.couple.bride.displayName)}<span class="and">&amp;</span>${esc(wedding.couple.groom.displayName)}</div>
  <div class="rule"><span></span><i></i><span></span></div>
  ${dateLine ? `<div class="date">${esc(dateLine)}</div>` : ""}
  ${place ? `<div class="place">${esc(place)}</div>` : ""}
</div>
</body></html>`;

// ── Render with a headless browser ──
const candidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error("No Chrome/Edge found. Set CHROME_PATH to a Chromium-based browser and try again.");
  process.exit(1);
}

const work = mkdtempSync(path.join(tmpdir(), "tila-og-"));
const page = path.join(work, "og.html");
writeFileSync(page, html, "utf8");
try {
  execFileSync(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--window-size=1200,630",
      "--virtual-time-budget=8000",
      `--user-data-dir=${path.join(work, "profile")}`,
      `--screenshot=${out}`,
      pathToFileURL(page).href,
    ],
    { stdio: "ignore" },
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}

console.log(existsSync(out) ? `✓ Wrote ${path.relative(root, out)}` : "✗ Screenshot failed");
