import { describe, expect, it } from "vitest";
import {
  extractReferencedMediaKeysFromContent,
  extractReferencedMediaKeysFromHtml,
} from "@/lib/media";

describe("extractReferencedMediaKeysFromHtml", () => {
  it("extracts raw route keys and direct public keys", () => {
    const keys = extractReferencedMediaKeysFromHtml(
      [
        '<img src="/api/media/raw?key=uploads%2Fabc12345defg.webp" />',
        '<img src="https://cdn.example.com/branding/logo_12345678.png" />',
        '<a href="https://cdn.example.com/uploads/xyz98765_abcd.webp">file</a>',
      ].join(" "),
    );

    expect(keys).toEqual(
      expect.arrayContaining([
        "uploads/abc12345defg.webp",
        "branding/logo_12345678.png",
        "uploads/xyz98765_abcd.webp",
      ]),
    );
  });

  it("extracts markdown image references and raw route keys", () => {
    const keys = extractReferencedMediaKeysFromContent(
      [
        "![Hero](/api/media/raw?key=uploads%2Fabc12345defg.webp)",
        "![Logo](https://cdn.example.com/branding/logo_12345678.png)",
      ].join("\n\n"),
    );

    expect(keys).toEqual(
      expect.arrayContaining([
        "uploads/abc12345defg.webp",
        "branding/logo_12345678.png",
      ]),
    );
  });

  it("ignores malformed keys", () => {
    const keys = extractReferencedMediaKeysFromHtml(
      '<img src="/api/media/raw?key=../../secret" /><img src="https://x.com/uploads/nope" />',
    );

    expect(keys).toEqual([]);
  });
});
