import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";
import {
  getTrustedAppUrl,
  normalizePublicOrigin,
  isLocalhostOrigin,
} from "@/lib/public-origin";

const bodySchema = z.object({
  ownerName: z.string().min(1).max(120),
  ownerEmail: z.string().email(),
  password: z.string().min(8).max(200),
  siteTitle: z.string().min(1).max(200),
  publicUrl: z
    .string()
    .min(1)
    .refine((s) => {
      try {
        new URL(s);
        return true;
      } catch {
        return false;
      }
    }, "Invalid URL"),
  themePreset: z
    .enum([
      "paper",
      "ink",
      "catppuccin-latte",
      "catppuccin-frappe",
      "catppuccin-macchiato",
      "catppuccin-mocha",
    ])
    .optional(),
});

export async function POST(req: Request) {
  const existing = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  if (existing?.setupComplete) {
    return NextResponse.json({ error: "Already configured" }, { status: 400 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const {
    ownerName,
    ownerEmail,
    password,
    siteTitle,
    publicUrl: bodyPublicUrl,
    themePreset,
  } = parsed.data;

  const trusted = getTrustedAppUrl();
  let resolvedPublicUrl = bodyPublicUrl.replace(/\/$/, "");

  if (trusted) {
    resolvedPublicUrl = normalizePublicOrigin(trusted);
  } else if (
    process.env.NODE_ENV === "production" &&
    isLocalhostOrigin(resolvedPublicUrl) &&
    process.env.ALLOW_LOCALHOST_PUBLIC_URL !== "1"
  ) {
    return NextResponse.json(
      {
        error:
          "Set APP_URL to your real public site URL (the address users see in the browser), or use ALLOW_LOCALHOST_PUBLIC_URL=1 only for controlled local testing.",
      },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        email: ownerEmail,
        name: ownerName,
        passwordHash,
      },
    });
    await tx.siteSettings.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        siteTitle,
        dashboardTitle: siteTitle,
        browserTitle: siteTitle,
        publicUrl: resolvedPublicUrl,
        themePreset: themePreset ?? "paper",
        setupComplete: true,
        locale: "en",
      },
      update: {
        siteTitle,
        dashboardTitle: siteTitle,
        browserTitle: siteTitle,
        publicUrl: resolvedPublicUrl,
        themePreset: themePreset ?? "paper",
        setupComplete: true,
      },
    });
    const count = await tx.navItem.count();
    if (count === 0) {
      await tx.navItem.createMany({
        data: [
          { label: "Home", href: "/", order: 0 },
          { label: "Archive", href: "/archive", order: 1 },
        ],
      });
    }
  });

  return NextResponse.json({ ok: true });
}
