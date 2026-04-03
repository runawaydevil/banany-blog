import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  normalizePublicOrigin,
  getTrustedAppUrlFromEnv,
  isLocalhostOrigin,
  getEffectivePublicOrigin,
} from "./public-origin";

describe("normalizePublicOrigin", () => {
  it("strips path and trailing semantics", () => {
    expect(normalizePublicOrigin("https://example.com/blog/")).toBe(
      "https://example.com",
    );
  });

  it("preserves non-default port", () => {
    expect(normalizePublicOrigin("http://localhost:38127")).toBe(
      "http://localhost:38127",
    );
  });
});

describe("getTrustedAppUrlFromEnv", () => {
  beforeEach(() => {
    for (const k of [
      "APP_URL",
      "SITE_URL",
      "NEXTAUTH_URL",
      "NEXT_PUBLIC_APP_URL",
    ]) {
      delete process.env[k];
    }
  });

  it("prefers APP_URL over others", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://wrong:1";
    process.env.APP_URL = "https://right.example";
    expect(getTrustedAppUrlFromEnv()).toBe("https://right.example");
  });

  it("falls back along the chain", () => {
    process.env.NEXTAUTH_URL = "https://auth.example/path";
    expect(getTrustedAppUrlFromEnv()).toBe("https://auth.example");
  });

  it("returns null when unset or invalid", () => {
    process.env.APP_URL = "not-a-url";
    expect(getTrustedAppUrlFromEnv()).toBe(null);
  });
});

describe("isLocalhostOrigin", () => {
  it("detects localhost variants", () => {
    expect(isLocalhostOrigin("http://localhost:3000")).toBe(true);
    expect(isLocalhostOrigin("http://127.0.0.1:38127")).toBe(true);
    expect(isLocalhostOrigin("https://example.com")).toBe(false);
  });
});

describe("getEffectivePublicOrigin", () => {
  afterEach(() => {
    delete process.env.APP_URL;
    delete process.env.NODE_ENV;
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it("prefers trusted env over site", () => {
    process.env.APP_URL = "https://env.example";
    const site = { publicUrl: "https://db.example" } as const;
    expect(getEffectivePublicOrigin(site)).toBe("https://env.example");
  });

  it("uses site when no trusted env", () => {
    const site = { publicUrl: "https://db.example/foo" } as const;
    expect(getEffectivePublicOrigin(site)).toBe("https://db.example");
  });
});
