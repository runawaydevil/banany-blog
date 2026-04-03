import { stripHtml } from "@/lib/utils";

/**
 * Base string for **post** URL slugs: **only** the trimmed title.
 * If empty, API layers fall back to `slugify("")` → empty → `nanoid`.
 */
export function slugBaseFromPostTitle(title: string | null | undefined): string {
  return typeof title === "string" ? title.trim() : "";
}

/**
 * Base string for **page** slugs: title first, else start of plain body (legacy behaviour).
 */
export function slugBaseFromPostInput(
  title: string | null | undefined,
  contentHtml: string,
): string {
  const t = typeof title === "string" ? title.trim() : "";
  const fromContent = stripHtml(String(contentHtml || "")).slice(0, 160);
  return t || fromContent || "";
}
