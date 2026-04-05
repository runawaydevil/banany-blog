import type { PostContentFormat } from "@prisma/client";

/** Max length stored in DB and used for meta description. */
export const EXCERPT_MAX_LENGTH = 300;

export const DEFAULT_POST_CONTENT_FORMAT: PostContentFormat = "RICH_TEXT";

function collapseWhitespace(value: string): string {
  return value.replace(/\r\n?/g, "\n").replace(/\s+/g, " ").trim();
}

/** Strip HTML / collapse whitespace; excerpt is plain text only (no headings as markup). */
export function stripRichTextToPlainText(html: string): string {
  return collapseWhitespace(html.replace(/<[^>]*>/g, " "));
}

export function stripMarkdownToPlainText(markdown: string): string {
  let plain = markdown.replace(/\r\n?/g, "\n");

  plain = plain.replace(/```[^\n]*\n([\s\S]*?)```/g, (_match, code: string) => {
    return `\n${code}\n`;
  });
  plain = plain.replace(/`([^`]+)`/g, "$1");
  plain = plain.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1");
  plain = plain.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
  plain = plain.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  plain = plain.replace(/^\s{0,3}>\s?/gm, "");
  plain = plain.replace(/^\s*[-*+]\s+\[(?: |x|X)\]\s+/gm, "");
  plain = plain.replace(/^\s*[-*+]\s+/gm, "");
  plain = plain.replace(/^\s*\d+\.\s+/gm, "");
  plain = plain.replace(/^\s{0,3}(?:[-*_]\s*){3,}$/gm, " ");
  plain = plain.replace(/^\|?(.*\|.*)\|?$/gm, (row) => row.replace(/\|/g, " "));
  plain = plain.replace(/(\*\*|__|\*|_|~~)/g, "");
  plain = plain.replace(/<[^>]*>/g, " ");

  return collapseWhitespace(plain);
}

export function normalizeExcerptPlain(input: string | null | undefined): string | null {
  if (input == null) return null;
  const plain = stripRichTextToPlainText(input);
  return plain.length > 0 ? plain : null;
}

export function normalizePostContentFormat(
  format: PostContentFormat | string | null | undefined,
): PostContentFormat {
  return format === "MARKDOWN" ? "MARKDOWN" : DEFAULT_POST_CONTENT_FORMAT;
}

export function plainTextFromPostContent(input: {
  content: string;
  contentFormat: PostContentFormat | string | null | undefined;
}): string {
  return normalizePostContentFormat(input.contentFormat) === "MARKDOWN"
    ? stripMarkdownToPlainText(input.content)
    : stripRichTextToPlainText(input.content);
}

export function hasRenderablePostContent(
  content: string,
  contentFormat: PostContentFormat | string | null | undefined,
): boolean {
  const format = normalizePostContentFormat(contentFormat);
  const plain = plainTextFromPostContent({ content, contentFormat: format });

  if (plain.length > 0) return true;

  if (format === "MARKDOWN") {
    return (
      /!\[[^\]]*]\(([^)]+)\)/.test(content) ||
      /^\s{0,3}(?:[-*_]\s*){3,}$/m.test(content)
    );
  }

  return /<(img|video|iframe|figure|hr|pre|table)\b/i.test(content);
}

export function finalizeContentExcerptForStorage(
  content: string,
  contentFormat: PostContentFormat | string | null | undefined,
): string | null {
  const plain = plainTextFromPostContent({ content, contentFormat });
  if (!plain) return null;
  return [...plain].slice(0, EXCERPT_MAX_LENGTH).join("") || null;
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
