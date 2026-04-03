import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isThemePresetId, typographyForPreset } from "@/lib/themes";
import {
  getTrustedAppUrl,
  normalizePublicOrigin,
  isLocalhostOrigin,
} from "@/lib/public-origin";
import { mailgunConfiguredFromEnv } from "@/lib/mailgun-env";
import { z } from "zod";

export const dynamic = "force-dynamic";

function publicUrlMismatch(
  stored: string | null | undefined,
  trusted: string | null,
): boolean {
  if (!trusted) return false;
  try {
    return normalizePublicOrigin(stored ?? "") !== trusted;
  } catch {
    return true;
  }
}

export async function GET() {
  const site = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  const trustedPublicUrl = getTrustedAppUrl();
  const mailgunReady = mailgunConfiguredFromEnv();

  if (!site) {
    return NextResponse.json({
      setupComplete: false,
      trustedPublicUrl,
      suggestedPublicUrl: trustedPublicUrl,
    });
  }

  return NextResponse.json({
    setupComplete: site.setupComplete,
    siteTitle: site.siteTitle,
    browserTitle: site.browserTitle,
    dashboardTitle: site.dashboardTitle,
    publicUrl: site.publicUrl,
    trustedPublicUrl,
    publicUrlEnvMismatch: publicUrlMismatch(site.publicUrl, trustedPublicUrl),
    mailgunConfigured: mailgunReady,
    locale: site.locale,
    introSnippet: site.introSnippet,
    themePreset: site.themePreset,
    themeOverrides: site.themeOverrides,
    fontBodyKey: site.fontBodyKey,
    fontHeadingKey: site.fontHeadingKey,
    fontMonoKey: site.fontMonoKey,
    faviconMediaId: site.faviconMediaId,
    siteImageMediaId: site.siteImageMediaId,
    logoMediaId: site.logoMediaId,
    newsletterEnabledHome: site.newsletterEnabledHome,
    newsletterEnabledPost: site.newsletterEnabledPost,
    seoDescription: site.seoDescription,
  });
}

const patchSchema = z
  .object({
    applyTrustedPublicUrl: z.boolean().optional(),
    siteTitle: z.string().min(1).max(200).optional(),
    browserTitle: z.string().max(200).nullable().optional(),
    dashboardTitle: z.string().max(200).nullable().optional(),
    publicUrl: z.string().optional(),
    locale: z.enum(["en", "pt"]).optional(),
    introSnippet: z.string().max(10_000).nullable().optional(),
    themePreset: z.string().optional(),
    themeOverrides: z.record(z.string(), z.string()).nullable().optional(),
    customCss: z.string().max(120_000).nullable().optional(),
    faviconMediaId: z.string().nullable().optional(),
    siteImageMediaId: z.string().nullable().optional(),
    logoMediaId: z.string().nullable().optional(),
    newsletterEnabledHome: z.boolean().optional(),
    newsletterEnabledPost: z.boolean().optional(),
    seoDescription: z.string().max(500).nullable().optional(),
    homePageSlug: z.string().nullable().optional(),
  })
  .strict();

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { themeOverrides, themePreset, applyTrustedPublicUrl, ...rest } =
    parsed.data;
  const data: Prisma.SiteSettingsUpdateInput = { ...rest };

  if (applyTrustedPublicUrl) {
    const t = getTrustedAppUrl();
    if (!t) {
      return NextResponse.json(
        { error: "APP_URL (or SITE_URL / NEXTAUTH_URL) is not set in the environment." },
        { status: 400 },
      );
    }
    data.publicUrl = t;
  }

  if (data.publicUrl && typeof data.publicUrl === "string") {
    try {
      const normalized = new URL(data.publicUrl).toString().replace(/\/$/, "");
      if (
        process.env.NODE_ENV === "production" &&
        isLocalhostOrigin(normalized) &&
        process.env.ALLOW_LOCALHOST_PUBLIC_URL !== "1"
      ) {
        return NextResponse.json(
          {
            error:
              "Public URL cannot be localhost in production. Set APP_URL to your real domain or use ALLOW_LOCALHOST_PUBLIC_URL=1 for local testing only.",
          },
          { status: 400 },
        );
      }
      data.publicUrl = normalized;
    } catch {
      delete data.publicUrl;
    }
  }

  if (themePreset !== undefined) {
    data.themePreset = themePreset;
    const preset = isThemePresetId(themePreset) ? themePreset : "paper";
    const typo = typographyForPreset(preset);
    data.fontBodyKey = typo.body;
    data.fontHeadingKey = typo.heading;
    data.fontMonoKey = typo.mono;
  }
  if (themeOverrides === null) {
    data.themeOverrides = Prisma.JsonNull;
  } else if (themeOverrides !== undefined) {
    data.themeOverrides = themeOverrides;
  }

  const site = await prisma.siteSettings.update({
    where: { id: "singleton" },
    data,
  });

  if (Object.prototype.hasOwnProperty.call(parsed.data, "faviconMediaId")) {
    revalidatePath("/", "layout");
  }

  return NextResponse.json({ ok: true, id: site.id });
}
