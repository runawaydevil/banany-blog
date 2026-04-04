import { describe, expect, it } from "vitest";
import { buildFaviconCacheBust, buildFaviconHref } from "@/lib/favicon";

describe("buildFaviconCacheBust", () => {
  it("includes updatedAt and favicon id when present", () => {
    expect(
      buildFaviconCacheBust({
        updatedAt: "2026-04-04T16:00:00.000Z",
        faviconMediaId: "abcdefghijklmnopqrst",
      }),
    ).toBe("1775318400000-abcdefghijkl");
  });

  it("falls back to timestamp only when favicon id is absent", () => {
    expect(
      buildFaviconCacheBust({
        updatedAt: "2026-04-04T16:00:00.000Z",
        faviconMediaId: null,
      }),
    ).toBe("1775318400000");
  });
});

describe("buildFaviconHref", () => {
  it("returns a cache-busted icon route", () => {
    expect(buildFaviconHref("1234-abcd")).toBe("/icon?v=1234-abcd");
  });
});
