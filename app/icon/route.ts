import { readFile } from "fs/promises";
import path from "path";
import { getSiteSettings } from "@/lib/site";
import { readMediaContentById } from "@/lib/media";
import { normalizeIconAssetToPng } from "@/lib/icon-asset";

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
  const asset = await readMediaContentById(site?.faviconMediaId);
  if (asset) {
    let body: Uint8Array = Buffer.from(asset.body);
    let contentType = asset.contentType;

    try {
      // Serve a PNG favicon regardless of original upload format for browser compatibility.
      body = await normalizeIconAssetToPng(asset.body);
      contentType = "image/png";
    } catch {
      /* fall back to original bytes if normalization fails */
    }

    return new Response(Buffer.from(body), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, must-revalidate",
      },
    });
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
