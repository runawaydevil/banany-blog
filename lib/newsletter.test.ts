import { describe, expect, it } from "vitest";
import {
  hasRenderableNewsletterBody,
  newsletterHtmlToPlainText,
  renderNewsletterEmail,
  sanitizeNewsletterHtml,
} from "@/lib/newsletter";
import { mergeTokens } from "@/lib/themes";

describe("sanitizeNewsletterHtml", () => {
  it("removes images and scripts from newsletter bodies", () => {
    const html = sanitizeNewsletterHtml(
      '<p>Hello</p><img src="https://example.com/a.png" /><script>alert(1)</script>',
    );

    expect(html).toContain("<p>Hello</p>");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<script");
  });
});

describe("newsletterHtmlToPlainText", () => {
  it("keeps structure and links readable in plain text", () => {
    const text = newsletterHtmlToPlainText(
      "<h2>Hello</h2><p>World</p><ul><li>One</li><li>Two</li></ul>",
    );

    expect(text).toContain("Hello");
    expect(text).toContain("World");
    expect(text).toContain("- One");
    expect(text).toContain("- Two");
  });
});

describe("hasRenderableNewsletterBody", () => {
  it("rejects empty bodies", () => {
    expect(hasRenderableNewsletterBody("<p>   </p>")).toBe(false);
    expect(hasRenderableNewsletterBody("<p>Hello</p>")).toBe(true);
  });
});

describe("renderNewsletterEmail", () => {
  it("includes preview text and unsubscribe footer", () => {
    const html = renderNewsletterEmail({
      bodyHtml: "<p>Hello</p>",
      bodyFontStack: 'Georgia, serif',
      headingFontStack: 'Georgia, serif',
      logoUrl: "https://example.com/logo.png",
      previewText: "Fresh note",
      siteTitle: "Banany Blog",
      tokens: mergeTokens("paper"),
      unsubscribeUrl: "https://example.com/unsubscribe?token=abc",
    });

    expect(html).toContain("Fresh note");
    expect(html).toContain("Banany Blog");
    expect(html).toContain("Unsubscribe instantly");
    expect(html).toContain("https://example.com/unsubscribe?token=abc");
  });
});
