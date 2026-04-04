import type { FileTypeResult } from "file-type";

export const UPLOAD_PREFIXES = ["uploads", "branding"] as const;
export type UploadPrefix = (typeof UPLOAD_PREFIXES)[number];

export function isAllowedUploadPrefix(raw: unknown): raw is UploadPrefix {
  return (
    typeof raw === "string" &&
    UPLOAD_PREFIXES.includes(raw as UploadPrefix)
  );
}

/**
 * Map magic-byte detection to an upload class. Rejects SVG.
 * Raster types require a matching `file-type` detection (no trusting client MIME alone).
 */
export function classifyUploadMime(
  detected: FileTypeResult | undefined,
  declaredMime: string,
): { kind: "raster" | "gif"; mime: string } | null {
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

  return null;
}

const KEY_RE = /^(uploads|branding)\/[A-Za-z0-9_-]{8,64}\.[a-z0-9]{2,8}$/;

export function isValidMediaObjectKey(key: string): boolean {
  return KEY_RE.test(key) && !key.includes("..") && !key.includes("//");
}
