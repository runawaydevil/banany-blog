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
    expect(isAllowedUploadPrefix("fonts")).toBe(false);
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
      ),
    ).toBeNull();
  });

  it("accepts raster when detected", () => {
    const r = classifyUploadMime(
      { mime: "image/png", ext: "png" } as import("file-type").FileTypeResult,
      "image/png",
    );
    expect(r?.kind).toBe("raster");
  });

  it("rejects fonts", () => {
    const r = classifyUploadMime(undefined, "application/octet-stream");
    expect(r).toBeNull();
  });
});

describe("isValidMediaObjectKey", () => {
  it("validates key shape", () => {
    expect(isValidMediaObjectKey("uploads/abc12345ABCD_x-9.webp")).toBe(true);
    expect(isValidMediaObjectKey("uploads/../etc/passwd")).toBe(false);
    expect(isValidMediaObjectKey("evil/key.webp")).toBe(false);
  });
});
