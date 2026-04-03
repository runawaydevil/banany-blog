import { createHash, randomBytes } from "crypto";
import * as argon2 from "argon2";
import { compare } from "bcryptjs";

export function isBcryptHash(stored: string): boolean {
  return /^\$2[aby]\$/.test(stored);
}

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

/**
 * Verify password against Argon2id or legacy bcrypt. If bcrypt matches, returns
 * `rehash` with a new Argon2id hash to persist on the user row.
 */
export async function verifyPassword(
  storedHash: string,
  plain: string,
): Promise<{ ok: boolean; rehash?: string }> {
  if (isBcryptHash(storedHash)) {
    const ok = await compare(plain, storedHash);
    if (ok) {
      return { ok: true, rehash: await hashPassword(plain) };
    }
    return { ok: false };
  }
  try {
    if (await argon2.verify(storedHash, plain)) {
      return { ok: true };
    }
  } catch {
    /* malformed hash */
  }
  return { ok: false };
}

export function generateRawResetToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashResetToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}
