import { describe, expect, it } from "vitest";
import {
  finalizeContentExcerptForStorage,
  hasRenderablePostContent,
  stripMarkdownToPlainText,
  stripRichTextToPlainText,
} from "@/lib/excerpt-plain";

describe("stripRichTextToPlainText", () => {
  it("removes HTML tags and normalizes whitespace", () => {
    expect(
      stripRichTextToPlainText(
        "<p>Hello <strong>world</strong></p><blockquote> Again </blockquote>",
      ),
    ).toBe("Hello world Again");
  });
});

describe("stripMarkdownToPlainText", () => {
  it("converts markdown structures into plain text", () => {
    expect(
      stripMarkdownToPlainText(
        [
          "# Hello",
          "",
          "- [x] Done",
          "- second item",
          "",
          "![Alt text](/uploads/example.webp)",
          "",
          "`inline`",
          "",
          "| Name | Value |",
          "| --- | --- |",
          "| One | Two |",
        ].join("\n"),
      ),
    ).toBe("Hello Done second item Alt text inline Name Value --- --- One Two");
  });
});

describe("hasRenderablePostContent", () => {
  it("detects markdown-only media and separators as renderable", () => {
    expect(hasRenderablePostContent("![Hero](/uploads/example.webp)", "MARKDOWN"))
      .toBe(true);
    expect(hasRenderablePostContent("---", "MARKDOWN")).toBe(true);
  });

  it("detects rich content media and ignores empty markup", () => {
    expect(
      hasRenderablePostContent('<p></p><img src="/uploads/example.webp" />', "RICH_TEXT"),
    ).toBe(true);
    expect(hasRenderablePostContent("<p></p>", "RICH_TEXT")).toBe(false);
  });
});

describe("finalizeContentExcerptForStorage", () => {
  it("derives and clamps plain text excerpts from markdown", () => {
    const excerpt = finalizeContentExcerptForStorage(
      `# Launch\n\n${"word ".repeat(120)}`,
      "MARKDOWN",
    );

    expect(excerpt).toBeTruthy();
    expect(excerpt?.startsWith("Launch word word")).toBe(true);
    expect(excerpt && [...excerpt].length).toBeLessThanOrEqual(300);
  });
});
