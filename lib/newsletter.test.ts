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
  it("renders English email chrome with the correct lang and unsubscribe footer", () => {
    const html = renderNewsletterEmail({
      bodyHtml: "<p>Hello</p>",
      bodyFontStack: 'Georgia, serif',
      headingFontStack: 'Georgia, serif',
      locale: "en",
      logoUrl: "https://example.com/logo.png",
      previewText: "Fresh note",
      siteTitle: "Banany Blog",
      tokens: mergeTokens("paper", undefined),
      unsubscribeUrl: "https://example.com/unsubscribe?token=abc",
    });

    expect(html).toContain('lang="en"');
    expect(html).toContain("Fresh note");
    expect(html).toContain("Banany Blog");
    expect(html).toContain(
      "You are receiving this because you subscribed to Banany Blog.",
    );
    expect(html).toContain("Unsubscribe instantly");
    expect(html).toContain("https://example.com/unsubscribe?token=abc");
  });

  it("renders pt-BR email chrome when locale is pt", () => {
    const html = renderNewsletterEmail({
      bodyHtml: "<p>Ol\u00e1</p>",
      bodyFontStack: 'Georgia, serif',
      headingFontStack: 'Georgia, serif',
      locale: "pt",
      previewText: "Nova nota",
      siteTitle: "Banany Blog",
      tokens: mergeTokens("vaporwave-neon", undefined),
      unsubscribeUrl: "https://example.com/unsubscribe?token=abc",
    });

    expect(html).toContain('lang="pt-BR"');
    expect(html).toContain("Nova nota");
    expect(html).toContain(
      "Voc\u00ea est\u00e1 recebendo isto porque se inscreveu em Banany Blog.",
    );
    expect(html).toContain("Cancelar inscri\u00e7\u00e3o instantaneamente");
  });
});
