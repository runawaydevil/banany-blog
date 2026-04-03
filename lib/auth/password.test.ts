import { describe, it, expect } from "vitest";
import { hash } from "bcryptjs";
import {
  hashPassword,
  verifyPassword,
  hashResetToken,
  generateRawResetToken,
  isBcryptHash,
} from "./password";

describe("password hashing", () => {
  it("hashes with Argon2id and verifies", async () => {
    const h = await hashPassword("correct horse battery staple");
    expect(h).toMatch(/^\$argon2id\$/);
    const v = await verifyPassword(h, "correct horse battery staple");
    expect(v.ok).toBe(true);
    expect(v.rehash).toBeUndefined();
  });

  it("rejects wrong password", async () => {
    const h = await hashPassword("secret");
    const v = await verifyPassword(h, "wrong");
    expect(v.ok).toBe(false);
  });

  it("verifies bcrypt legacy and requests rehash", async () => {
    const legacy = await hash("legacy-pass", 8);
    expect(isBcryptHash(legacy)).toBe(true);
    const v = await verifyPassword(legacy, "legacy-pass");
    expect(v.ok).toBe(true);
    expect(v.rehash).toBeDefined();
    expect(v.rehash).toMatch(/^\$argon2id\$/);
  });
});

describe("reset token hashing", () => {
  it("is deterministic and hex", () => {
    const t = "test-raw-token";
    expect(hashResetToken(t)).toBe(hashResetToken(t));
    expect(hashResetToken(t)).toMatch(/^[a-f0-9]{64}$/);
  });

  it("generateRawResetToken has good length", () => {
    const a = generateRawResetToken();
    const b = generateRawResetToken();
    expect(a.length).toBeGreaterThan(40);
    expect(a).not.toBe(b);
  });
});
