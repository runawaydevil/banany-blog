import { readFile } from "fs/promises";
import path from "path";
import { getSiteSettings } from "@/lib/site";
import { mediaUrlById } from "@/lib/media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FALLBACK_PNG = path.join(
  process.cwd(),
  "public",
  "branding",
  "banany-logo.png",
);

const FALLBACK_SVG = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#c4a574"/><text x="16" y="22" text-anchor="middle" fill="#2c2825" font-family="system-ui,sans-serif" font-size="16" font-weight="600">B</text></svg>`;

export async function GET() {
  const site = await getSiteSettings();
  const url = await mediaUrlById(site?.faviconMediaId);
  if (url) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (r.ok) {
        const buf = await r.arrayBuffer();
        const ct =
          r.headers.get("content-type")?.split(";")[0]?.trim() || "image/png";
        return new Response(buf, {
          headers: {
            "Content-Type": ct,
            "Cache-Control": "no-store, must-revalidate",
          },
        });
      }
    } catch {
      /* fall through */
    }
  }

  try {
    const buf = await readFile(FALLBACK_PNG);
    return new Response(buf, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch {
    return new Response(FALLBACK_SVG, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  }
}
