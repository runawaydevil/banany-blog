import { getTrustedAppUrlFromEnv } from "@/lib/public-origin";
import { mailgunConfiguredFromEnv } from "@/lib/mailgun-env";

function requireEnv(name: string, value: string | undefined): void {
  if (!value?.trim()) {
    throw new Error(`[banany] Missing required environment variable: ${name}`);
  }
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;

  /* Do not fail `next build` (also runs with NODE_ENV=production). */
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.NODE_ENV !== "production") return;

  requireEnv("AUTH_SECRET", process.env.AUTH_SECRET);
  requireEnv("DATABASE_URL", process.env.DATABASE_URL);

  const trusted = getTrustedAppUrlFromEnv(process.env);
  if (!trusted) {
    throw new Error(
      "[banany] Production requires a public origin: set APP_URL (or SITE_URL, NEXTAUTH_URL, or NEXT_PUBLIC_APP_URL) to your canonical site URL.",
    );
  }

  requireEnv("S3_BUCKET", process.env.S3_BUCKET);
  requireEnv("S3_ACCESS_KEY_ID", process.env.S3_ACCESS_KEY_ID);
  requireEnv("S3_SECRET_ACCESS_KEY", process.env.S3_SECRET_ACCESS_KEY);

  if (process.env.BANANY_REQUIRE_MAILGUN === "1" && !mailgunConfiguredFromEnv()) {
    throw new Error(
      "[banany] BANANY_REQUIRE_MAILGUN=1 but Mailgun env is incomplete. Set MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM.",
    );
  }

  const nextAuth = process.env.NEXTAUTH_URL?.trim();
  if (trusted && nextAuth) {
    try {
      const a = new URL(trusted).origin;
      const n = new URL(nextAuth).origin;
      if (a !== n) {
        console.warn(
          `[banany] NEXTAUTH_URL origin (${n}) differs from APP_URL chain origin (${a}). Ensure both match the public site.`,
        );
      }
    } catch {
      /* ignore */
    }
  }
}
