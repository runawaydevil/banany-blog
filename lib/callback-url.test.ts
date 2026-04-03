import { describe, it, expect } from "vitest";
import { resolveLoginCallbackUrl } from "./callback-url";

describe("resolveLoginCallbackUrl", () => {
  it("allows safe paths", () => {
    expect(resolveLoginCallbackUrl("/dashboard")).toBe("/dashboard");
    expect(resolveLoginCallbackUrl("/dashboard/posts")).toBe("/dashboard/posts");
    expect(resolveLoginCallbackUrl("/dashboard?x=1")).toBe("/dashboard?x=1");
  });

  it("rejects open redirects", () => {
    expect(resolveLoginCallbackUrl("//evil.com")).toBe("/dashboard");
    expect(resolveLoginCallbackUrl("https://evil.com")).toBe("/dashboard");
    expect(resolveLoginCallbackUrl("http://evil.com")).toBe("/dashboard");
  });

  it("uses fallback", () => {
    expect(resolveLoginCallbackUrl(null)).toBe("/dashboard");
    expect(resolveLoginCallbackUrl("", "/home")).toBe("/home");
  });
});
