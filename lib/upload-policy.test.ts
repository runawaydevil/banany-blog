import { describe, it, expect } from "vitest";
import {
  isAllowedUploadPrefix,
  classifyUploadMime,
  isValidMediaObjectKey,
} from "./upload-policy";

describe("isAllowedUploadPrefix", () => {
  it("allows known prefixes only", () => {
    expect(isAllowedUploadPrefix("uploads")).toBe(true);
    expect(isAllowedUploadPrefix("branding")).toBe(true);
    expect(isAllowedUploadPrefix("fonts")).toBe(true);
    expect(isAllowedUploadPrefix("../evil")).toBe(false);
    expect(isAllowedUploadPrefix("uploads/../x")).toBe(false);
  });
});

describe("classifyUploadMime", () => {
  it("rejects svg", () => {
    expect(
      classifyUploadMime(
        { mime: "image/svg+xml", ext: "svg" } as import("file-type").FileTypeResult,
        "image/svg+xml",
        "x.svg",
      ),
    ).toBeNull();
  });

  it("accepts raster when detected", () => {
    const r = classifyUploadMime(
      { mime: "image/png", ext: "png" } as import("file-type").FileTypeResult,
      "image/png",
      "a.png",
    );
    expect(r?.kind).toBe("raster");
  });

  it("accepts woff2 by filename when octet-stream", () => {
    const r = classifyUploadMime(undefined, "application/octet-stream", "f.woff2");
    expect(r?.kind).toBe("font");
    expect(r?.mime).toBe("font/woff2");
  });
});

describe("isValidMediaObjectKey", () => {
  it("validates key shape", () => {
    expect(isValidMediaObjectKey("uploads/abc12345ABCD_x-9.webp")).toBe(true);
    expect(isValidMediaObjectKey("uploads/../etc/passwd")).toBe(false);
    expect(isValidMediaObjectKey("evil/key.webp")).toBe(false);
  });
});
