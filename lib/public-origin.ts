import type { SiteSettings } from "@prisma/client";

const TRUSTED_ENV_KEYS = [
  "APP_URL",
  "SITE_URL",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_APP_URL",
] as const;

/**
 * Normalizes a user- or env-provided absolute URL to an origin string
 * (scheme + host + port), without a trailing slash.
 */
export function normalizePublicOrigin(input: string): string {
  const trimmed = input.trim();
  const u = new URL(trimmed);
  return u.origin.replace(/\/$/, "");
}

/**
 * First non-empty trusted public URL from environment (order matters).
 */
export function getTrustedAppUrlFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  for (const key of TRUSTED_ENV_KEYS) {
    const raw = env[key]?.trim();
    if (!raw) continue;
    try {
      return normalizePublicOrigin(raw);
    } catch {
      continue;
    }
  }
  return null;
}

export function getTrustedAppUrl(): string | null {
  return getTrustedAppUrlFromEnv(process.env);
}

export function isLocalhostOrigin(input: string): boolean {
  try {
    const host = new URL(input.trim()).hostname.toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "[::1]"
    );
  } catch {
    return false;
  }
}

function devFallbackOrigin(env: NodeJS.ProcessEnv = process.env): string {
  const pub = env.NEXT_PUBLIC_APP_URL?.trim();
  if (pub) {
    try {
      return normalizePublicOrigin(pub);
    } catch {
      /* fall through */
    }
  }
  return "http://localhost:3000";
}

/**
 * Canonical base URL for absolute links (sitemap, feeds, reset email, etc.).
 * When a trusted env URL is set, it wins over `site.publicUrl`.
 */
export function getEffectivePublicOrigin(
  site: Pick<SiteSettings, "publicUrl"> | null,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const trusted = getTrustedAppUrlFromEnv(env);
  if (trusted) return trusted;

  const fromDb = site?.publicUrl?.trim();
  if (fromDb) {
    try {
      return normalizePublicOrigin(fromDb);
    } catch {
      /* fall through */
    }
  }

  if (env.NODE_ENV !== "production") {
    return devFallbackOrigin(env);
  }

  return devFallbackOrigin(env);
}
