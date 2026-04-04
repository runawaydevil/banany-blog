import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMailgunEmail } from "@/lib/mailgun";
import { getMailgunConfigFromEnv } from "@/lib/mailgun-env";
import { getEffectivePublicOrigin } from "@/lib/public-origin";
import {
  generateRawResetToken,
  hashResetToken,
} from "@/lib/auth/password";
import {
  clientIpFromRequest,
  rateLimit,
} from "@/lib/rate-limit";
import { normalizeLocale, t } from "@/lib/i18n";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
});

const FORGOT_MAX = 5;
const FORGOT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  const ip = clientIpFromRequest(req);
  const rl = rateLimit(`forgot:${ip}`, FORGOT_MAX, FORGOT_WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  const site = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  const mg = getMailgunConfigFromEnv();
  if (!site || !mg) {
    return NextResponse.json(
      {
        error:
          "Password reset is unavailable: Mailgun is not configured. Set MAILGUN_API_KEY, MAILGUN_DOMAIN, and MAILGUN_FROM in the server environment.",
      },
      { status: 503 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const raw = generateRawResetToken();
  const tokenHash = hashResetToken(raw);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const row = await prisma.passwordResetToken.create({
    data: { tokenHash, userId: user.id, expiresAt },
  });

  const base = getEffectivePublicOrigin(site).replace(/\/$/, "");
  const link = `${base}/reset-password?token=${encodeURIComponent(raw)}`;
  const locale = normalizeLocale(site.locale);

  const result = await sendMailgunEmail({
    apiKey: mg.apiKey,
    domain: mg.domain,
    region: mg.region,
    from: mg.from,
    to: user.email,
    subject: t(locale, "email.reset.subject"),
    text: `${t(locale, "email.reset.body")}\n${link}`,
    replyTo: mg.replyTo,
  });

  if (!result.ok) {
    await prisma.passwordResetToken.delete({ where: { id: row.id } }).catch(
      () => {},
    );
    return NextResponse.json(
      { error: "Could not send reset email. Try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
