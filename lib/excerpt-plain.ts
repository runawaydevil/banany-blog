/** Max length stored in DB and used for meta description. */
export const EXCERPT_MAX_LENGTH = 300;

/** Strip HTML / collapse whitespace; excerpt is plain text only (no headings as markup). */
export function normalizeExcerptPlain(
  input: string | null | undefined,
): string | null {
  if (input == null) return null;
  const plain = input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 0 ? plain : null;
}

/** Normalize then clamp to {@link EXCERPT_MAX_LENGTH} Unicode code units. */
export function finalizeExcerptForStorage(
  input: string | null | undefined,
): string | null {
  const plain = normalizeExcerptPlain(input);
  if (plain == null) return null;
  const clamped = [...plain].slice(0, EXCERPT_MAX_LENGTH).join("");
  return clamped.length > 0 ? clamped : null;
}
