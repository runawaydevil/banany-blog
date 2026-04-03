import type { FileTypeResult } from "file-type";

export const UPLOAD_PREFIXES = ["uploads", "branding", "fonts"] as const;
export type UploadPrefix = (typeof UPLOAD_PREFIXES)[number];

export function isAllowedUploadPrefix(raw: unknown): raw is UploadPrefix {
  return (
    typeof raw === "string" &&
    UPLOAD_PREFIXES.includes(raw as UploadPrefix)
  );
}

/**
 * Map magic-byte detection + filename to an upload class. Rejects SVG.
 * Raster types require a matching `file-type` detection (no trusting client MIME alone).
 */
export function classifyUploadMime(
  detected: FileTypeResult | undefined,
  declaredMime: string,
  filename: string,
): { kind: "raster" | "gif" | "font"; mime: string } | null {
  const lowerName = filename.toLowerCase();
  const isFontName = lowerName.endsWith(".woff2") || lowerName.endsWith(".woff");
  const declared = declaredMime.split(";")[0]!.trim();

  if (
    detected?.mime === "image/svg+xml" ||
    declared === "image/svg+xml"
  ) {
    return null;
  }

  if (
    detected &&
    ["image/jpeg", "image/png", "image/webp"].includes(detected.mime)
  ) {
    return { kind: "raster", mime: detected.mime };
  }

  if (detected?.mime === "image/gif") {
    return { kind: "gif", mime: "image/gif" };
  }

  if (
    isFontName &&
    (detected?.mime === "application/octet-stream" ||
      detected?.mime === "font/woff2" ||
      detected?.mime === "font/woff" ||
      !detected)
  ) {
    const mime = lowerName.endsWith(".woff2") ? "font/woff2" : "font/woff";
    return { kind: "font", mime };
  }

  return null;
}

const KEY_RE = /^(uploads|branding|fonts)\/[A-Za-z0-9_-]{8,64}\.[a-z0-9]{2,8}$/;

export function isValidMediaObjectKey(key: string): boolean {
  return KEY_RE.test(key) && !key.includes("..") && !key.includes("//");
}
