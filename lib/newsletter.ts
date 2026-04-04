import sanitizeHtml from "sanitize-html";
import type { SemanticTokens } from "@/lib/themes";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function sanitizeNewsletterHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "h1",
      "h2",
      "h3",
      "h4",
      "hr",
      "pre",
      "span",
    ]),
    disallowedTagsMode: "discard",
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      code: ["class"],
      span: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

export function newsletterHtmlToPlainText(html: string): string {
  const normalized = sanitizeNewsletterHtml(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/(h1|h2|h3|h4|blockquote|pre)>/gi, "\n\n")
    .replace(/<li>/gi, "- ")
    .replace(/<hr\s*\/?>/gi, "\n---\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");

  return normalized.trim();
}

export function hasRenderableNewsletterBody(html: string): boolean {
  return newsletterHtmlToPlainText(html).length > 0;
}

export function renderNewsletterEmail(input: {
  bodyHtml: string;
  bodyFontStack: string;
  headingFontStack: string;
  logoUrl?: string | null;
  previewText?: string | null;
  siteTitle: string;
  tokens: SemanticTokens;
  unsubscribeUrl: string;
}): string {
  const previewText = input.previewText?.trim() ?? "";
  const logoMarkup = input.logoUrl
    ? `<img src="${escapeHtml(input.logoUrl)}" alt="" width="56" height="56" style="display:block;height:56px;width:56px;max-width:56px;object-fit:contain;border:0;" />`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(input.siteTitle)}</title>
    <style>
      body { margin: 0; background: ${input.tokens.bg}; color: ${input.tokens.text}; font-family: ${input.bodyFontStack}; }
      a { color: ${input.tokens.link}; }
      .bb-card { max-width: 680px; margin: 0 auto; background: ${input.tokens.surface}; border: 1px solid ${input.tokens.border}; }
      .bb-shell { padding: 32px 18px; }
      .bb-head { padding: 28px 28px 20px; border-bottom: 1px solid ${input.tokens.border}; }
      .bb-brand { display: flex; align-items: center; gap: 14px; }
      .bb-title { margin: 0; color: ${input.tokens.heading}; font-family: ${input.headingFontStack}; font-size: 24px; line-height: 1.15; }
      .bb-copy { padding: 28px; color: ${input.tokens.text}; font-size: 16px; line-height: 1.75; }
      .bb-copy h1, .bb-copy h2, .bb-copy h3, .bb-copy h4 { color: ${input.tokens.heading}; font-family: ${input.headingFontStack}; line-height: 1.2; margin: 0 0 14px; }
      .bb-copy p { margin: 0 0 16px; }
      .bb-copy ul, .bb-copy ol { margin: 0 0 18px 22px; padding: 0; }
      .bb-copy li { margin: 0 0 8px; }
      .bb-copy blockquote { margin: 0 0 18px; padding: 0 0 0 16px; border-left: 3px solid ${input.tokens.accent}; color: ${input.tokens.textMuted}; }
      .bb-copy pre { margin: 0 0 18px; padding: 14px 16px; overflow-x: auto; background: ${input.tokens.surfaceSoft}; border: 1px solid ${input.tokens.border}; color: ${input.tokens.text}; }
      .bb-copy hr { border: 0; border-top: 1px solid ${input.tokens.border}; margin: 24px 0; }
      .bb-foot { padding: 18px 28px 28px; border-top: 1px solid ${input.tokens.border}; color: ${input.tokens.textMuted}; font-size: 13px; line-height: 1.6; }
      .bb-preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; overflow: hidden; }
    </style>
  </head>
  <body>
    <div class="bb-preheader">${escapeHtml(previewText)}</div>
    <div class="bb-shell">
      <div class="bb-card">
        <div class="bb-head">
          <div class="bb-brand">
            ${logoMarkup}
            <div>
              <p class="bb-title">${escapeHtml(input.siteTitle)}</p>
            </div>
          </div>
        </div>
        <div class="bb-copy">
          ${input.bodyHtml}
        </div>
        <div class="bb-foot">
          <p style="margin:0 0 10px;">You are receiving this because you subscribed to ${escapeHtml(input.siteTitle)}.</p>
          <p style="margin:0;"><a href="${escapeHtml(input.unsubscribeUrl)}" target="_blank" rel="noopener noreferrer">Unsubscribe instantly</a>.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
