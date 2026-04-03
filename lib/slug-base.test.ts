import { describe, it, expect } from "vitest";
import {
  slugBaseFromPostInput,
  slugBaseFromPostTitle,
} from "./slug-base";

describe("slugBaseFromPostTitle", () => {
  it("returns trimmed title", () => {
    expect(slugBaseFromPostTitle("  Hello World  ")).toBe("Hello World");
  });

  it("returns empty when title missing or blank", () => {
    expect(slugBaseFromPostTitle(null)).toBe("");
    expect(slugBaseFromPostTitle("")).toBe("");
    expect(slugBaseFromPostTitle("   ")).toBe("");
  });

});

describe("slugBaseFromPostInput (pages)", () => {
  it("prefers trimmed title over body", () => {
    expect(slugBaseFromPostInput("  Hello World  ", "<p>body</p>")).toBe(
      "Hello World",
    );
  });

  it("uses plain text from HTML when title empty", () => {
    expect(
      slugBaseFromPostInput(null, "<p>First <strong>words</strong></p>"),
    ).toBe("First words");
  });

  it("truncates body fallback to 160 chars", () => {
    const long = "x".repeat(200);
    expect(slugBaseFromPostInput("", `<p>${long}</p>`).length).toBe(160);
  });

  it("returns empty string when nothing to derive", () => {
    expect(slugBaseFromPostInput(null, "<p></p>")).toBe("");
  });
});
